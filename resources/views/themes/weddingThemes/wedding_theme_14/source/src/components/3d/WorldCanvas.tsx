import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { QualitySettings } from '../../hooks/useQualityTier'
import { useUi } from '../../state/journey'
import type { TextureLibrary } from './textures/library'
import type { LoadedAssets } from '../../services/assetLoader'
import { createMaterials, disposeMaterials, MaterialsContext } from './materials'
import { World } from './World'

class CanvasBoundary extends Component<{ onError: (e: unknown) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Signals readiness after the first frames have actually rendered (shaders compiled). */
function FirstFrames({ onReady }: { onReady: () => void }) {
  const n = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    if (++n.current >= 3) {
      done.current = true
      onReady()
    }
  })
  return null
}

/**
 * Stops the render loop while the tab is hidden or a full-screen overlay (lightbox) covers the
 * canvas, so no GPU time or battery is spent on frames nobody sees.
 */
function RenderGate() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  const overlay = useUi((s) => s.overlay)
  const [hidden, setHidden] = useState(() => document.visibilityState === 'hidden')
  useEffect(() => {
    const on = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  useEffect(() => {
    setFrameloop(hidden || overlay ? 'never' : 'always')
  }, [hidden, overlay, setFrameloop])
  return null
}

export function WorldCanvas({
  initialQuality,
  assets,
  lib,
  isMobile,
  onReady,
  onFailure,
}: {
  initialQuality: QualitySettings
  assets: LoadedAssets
  lib: TextureLibrary
  isMobile: boolean
  onReady: () => void
  onFailure: (reason: string) => void
}) {
  // Quality tier (grass/trees/shadows) is fixed for the session so assets never pop mid-journey;
  // only the pixel ratio adapts continuously to the measured frame rate.
  const quality = initialQuality
  const [dpr, setDpr] = useState(quality.dpr[1])
  const mats = useMemo(() => createMaterials(assets, lib), [assets, lib])
  useEffect(() => () => disposeMaterials(mats), [mats])
  const resources = useMemo(() => ({ mats, assets, lib }), [mats, assets, lib])

  return (
    <CanvasBoundary onError={() => onFailure('render-error')}>
      <Canvas
        className="!fixed inset-0"
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100lvh' }}
        dpr={dpr}
        shadows={quality.shadows ? 'percentage' : false}
        gl={{ antialias: quality.antialias, powerPreference: 'high-performance', alpha: false, stencil: false }}
        camera={{ fov: 48, near: 0.1, far: 900, position: [0, 3.4, 33] }}
        onCreated={(state) => {
          const { gl } = state
          // automated-capture hook only (`?capture=1`), used by the screenshot/inspection scripts
          if (new URLSearchParams(window.location.search).has('capture')) (window as unknown as { __r3f?: unknown }).__r3f = state
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.setClearColor('#2b1b14')
          const canvas = gl.domElement
          canvas.setAttribute('aria-hidden', 'true')
          canvas.addEventListener(
            'webglcontextlost',
            (e) => {
              e.preventDefault()
              onFailure('context-lost')
            },
            { once: true },
          )
        }}
      >
        <PerformanceMonitor
          bounds={() => [40, 58]}
          onChange={({ factor }) => {
            const [lo, hi] = quality.dpr
            setDpr(Math.round((lo + (hi - lo) * factor) * 20) / 20)
          }}
        />
        <RenderGate />
        <MaterialsContext.Provider value={resources}>
          <World quality={quality} isMobile={isMobile} />
        </MaterialsContext.Provider>
        <FirstFrames onReady={onReady} />
      </Canvas>
    </CanvasBoundary>
  )
}
