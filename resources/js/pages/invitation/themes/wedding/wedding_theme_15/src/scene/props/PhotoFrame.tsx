import { Component, Suspense, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { asset } from '../../lib/links'
import { sceneFx } from '../../state/sceneFx'
import type { Vec3 } from '../layout'
import { clayMaterial, PALETTE } from '../materials'
import { glowTexture } from '../textures'
import { isFreeSpace, setHoverCursor } from '../interaction'

/** Catches loader errors so one missing image never takes down the scene. */
export class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[scene] asset failed to load', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const W = 0.8
const H = 1.0

const shared = {
  geo: null as null | { back: THREE.BufferGeometry; photo: THREE.PlaneGeometry },
  mats: null as null | { back: THREE.MeshStandardMaterial; placeholder: THREE.MeshBasicMaterial },
}
function kit() {
  shared.geo ??= { back: new RoundedBoxGeometry(W + 0.12, H + 0.12, 0.05, 3, 0.03), photo: new THREE.PlaneGeometry(W, H) }
  shared.mats ??= {
    back: clayMaterial({ color: '#f3e3cf', emissive: '#4a3a2a', emissiveIntensity: 0.3, rim: PALETTE.gold, rimStrength: 0.6 }),
    placeholder: new THREE.MeshBasicMaterial({ color: '#5d5790' }),
  }
  return { geo: shared.geo, mats: shared.mats }
}

function Photo({ url }: { url: string }) {
  const tex = useTexture(asset(url))
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    tex.needsUpdate = true
  }, [tex])
  const { geo } = kit()
  return (
    <mesh geometry={geo.photo} position={[0, 0, 0.028]}>
      <meshBasicMaterial map={tex} toneMapped={false} color="#e8e4f0" />
    </mesh>
  )
}

interface Props {
  url: string
  position: Vec3
  rotation?: Vec3
  scale?: number
  /** 0..1 highlight (glow + lift), read every frame. */
  highlight?: () => number
  onSelect?: () => void
  label?: string
  phase?: number
}

export function PhotoFrame({ url, position, rotation = [0, 0, 0], scale = 1, highlight, onSelect, phase = 0 }: Props) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.SpriteMaterial>(null)
  const hovered = useRef(false)
  const hover = useRef(0)
  const { geo, mats } = kit()
  const placeholder = (
    <mesh geometry={geo.photo} material={mats.placeholder} position={[0, 0, 0.028]} />
  )

  useFrame(({ clock }, dt) => {
    const g = group.current
    if (!g) return
    const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    hover.current = THREE.MathUtils.damp(hover.current, hovered.current ? 1 : 0, 9, dt)
    const h = Math.max(highlight ? highlight() : 0, hover.current)
    g.position.set(position[0], position[1] + Math.sin(t * 0.9 + phase * 6) * 0.06 + h * 0.08, position[2])
    g.rotation.set(rotation[0], rotation[1] + Math.sin(t * 0.5 + phase * 4) * 0.05, rotation[2] + Math.sin(t * 0.7 + phase * 5) * 0.03)
    g.scale.setScalar(scale * (1 + h * 0.1))
    if (glow.current) glow.current.opacity = 0.18 + h * 0.45
  })

  const interactive = !!onSelect
  return (
    <group
      ref={group}
      position={position}
      onPointerOver={
        interactive
          ? (e: ThreeEvent<PointerEvent>) => {
              if (!isFreeSpace(e)) return
              e.stopPropagation()
              hovered.current = true
              setHoverCursor(true)
            }
          : undefined
      }
      onPointerOut={
        interactive
          ? () => {
              if (!hovered.current) return
              hovered.current = false
              setHoverCursor(false)
            }
          : undefined
      }
      onClick={
        interactive
          ? (e: ThreeEvent<MouseEvent>) => {
              if (!isFreeSpace(e)) return
              e.stopPropagation()
              onSelect?.()
            }
          : undefined
      }
    >
      <sprite scale={[2.2, 2.4, 1]} position={[0, 0, -0.1]}>
        <spriteMaterial ref={glow} map={glowTexture()} color="#f5d58b" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh geometry={geo.back} material={mats.back} />
      <SceneErrorBoundary fallback={placeholder}>
        <Suspense fallback={placeholder}>
          <Photo url={url} />
        </Suspense>
      </SceneErrorBoundary>
    </group>
  )
}
