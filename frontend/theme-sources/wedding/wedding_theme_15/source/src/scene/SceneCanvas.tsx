import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor, useProgress } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useApp } from '../state/store'
import { World } from './World'
import { COVER_KEY, FOV } from './waypoints'
import { disposeTextures } from './textures'

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('[scene] WebGL scene failed, switching to the 2D fallback', error)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Flags the scene as ready once real frames are being drawn. */
function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    if (frames.current === 3 && useApp.getState().sceneStatus === 'loading') useApp.getState().setSceneStatus('ready')
  })
  return null
}

/** Mirrors texture loading progress (drei/three loading manager) into the app store. */
function ProgressBridge() {
  const { progress, active } = useProgress()
  useEffect(() => {
    useApp.setState({ loadProgress: active ? progress : 100 })
  }, [progress, active])
  return null
}

function PostFX({ msaa }: { msaa: boolean }) {
  return (
    <EffectComposer multisampling={msaa ? 4 : 0}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}

export default function SceneCanvas() {
  const quality = useApp((s) => s.quality)
  const effects = useApp((s) => s.effects)
  const setStatus = useApp((s) => s.setSceneStatus)
  const setEffects = useApp((s) => s.setEffects)
  const cap = quality === 'high' ? 1.75 : quality === 'medium' ? 1.5 : 1.1
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, cap))
  const portrait = window.innerWidth / window.innerHeight < 0.85

  useEffect(() => () => disposeTextures(), [])

  return (
    <div className="scene-canvas" aria-hidden="true">
      <CanvasBoundary onError={() => setStatus('failed')}>
        <Canvas
          dpr={dpr}
          eventSource={document.getElementById('root') ?? undefined}
          eventPrefix="client"
          camera={{ fov: portrait ? FOV.mobile : FOV.desktop, near: 0.1, far: 420, position: COVER_KEY.pos }}
          gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
          onCreated={({ gl }) => {
            // `?debug` exposes the renderer for profiling (draw calls, triangles) from the console.
            if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __etfRenderer: THREE.WebGLRenderer }).__etfRenderer = gl
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              setStatus('failed')
            })
          }}
        >
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => {
              if (useApp.getState().effects) setEffects(false)
              else setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))
            }}
          />
          <Suspense fallback={null}>
            <World quality={quality} />
          </Suspense>
          {effects && <PostFX msaa={quality === 'high'} />}
          <ReadySignal />
          <ProgressBridge />
        </Canvas>
      </CanvasBoundary>
    </div>
  )
}
