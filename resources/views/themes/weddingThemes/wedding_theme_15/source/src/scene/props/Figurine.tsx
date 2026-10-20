import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneFx } from '../../state/sceneFx'
import { lathe } from '../geometry'
import { clayMaterial, PALETTE } from '../materials'
import { useDisposable } from '../Instanced'

/**
 * Chibi clay figurines of the couple. Built from primitives and animated
 * procedurally (breathing, blinking, head tilt, a small wave) — no rig required.
 */

function useFigureKit() {
  const geo = useDisposable(() => {
    const list = {
      head: new THREE.SphereGeometry(0.26, 32, 24),
      eye: new THREE.SphereGeometry(0.03, 12, 8),
      shine: new THREE.SphereGeometry(0.009, 6, 4),
      cheek: new THREE.SphereGeometry(0.045, 12, 8),
      smile: new THREE.TorusGeometry(0.034, 0.008, 6, 14, Math.PI),
      hairCap: new THREE.SphereGeometry(0.278, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.56),
      bun: new THREE.SphereGeometry(0.11, 16, 12),
      arm: new THREE.CapsuleGeometry(0.05, 0.2, 6, 10).translate(0, -0.13, 0),
      hand: new THREE.SphereGeometry(0.048, 10, 8),
      bloom: new THREE.SphereGeometry(0.05, 10, 8),
      dress: lathe([[0.0001, 0], [0.43, 0], [0.42, 0.05], [0.33, 0.3], [0.22, 0.52], [0.16, 0.64], [0.17, 0.72], [0.0001, 0.75]], 28),
      veil: new THREE.LatheGeometry(
        [[0.06, 1.16], [0.17, 1.0], [0.26, 0.72], [0.33, 0.42], [0.38, 0.18]].map(([x, y]) => new THREE.Vector2(x, y)),
        20,
        Math.PI * 0.55,
        Math.PI * 0.9,
      ),
      sash: new THREE.TorusGeometry(0.17, 0.026, 8, 24),
      jacket: new THREE.CapsuleGeometry(0.2, 0.22, 8, 16),
      leg: new THREE.CapsuleGeometry(0.07, 0.18, 6, 10),
      shoe: new THREE.SphereGeometry(0.075, 10, 8),
      collar: new THREE.ConeGeometry(0.09, 0.2, 3),
      bow: new THREE.ConeGeometry(0.035, 0.07, 8),
      quiff: new THREE.SphereGeometry(0.1, 12, 10),
    }
    return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) }
  }, [])
  const mat = useDisposable(() => {
    const list = {
      skin: clayMaterial({ color: PALETTE.skin, rim: '#ffd9e4', rimStrength: 0.28 }),
      hair: clayMaterial({ color: PALETTE.hair, rim: '#8f86c8', rimStrength: 0.45 }),
      eye: new THREE.MeshBasicMaterial({ color: '#241b2b' }),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      cheek: new THREE.MeshBasicMaterial({ color: '#f29db4', transparent: true, opacity: 0.55, depthWrite: false }),
      mouth: new THREE.MeshBasicMaterial({ color: '#7a3a4c' }),
      dress: clayMaterial({ color: '#fbeff2', rim: '#ffffff', rimStrength: 0.4 }),
      veil: clayMaterial({ color: '#fff8ee', transparent: true, opacity: 0.42, side: THREE.DoubleSide, rimStrength: 0.5, rim: '#ffffff' }),
      blush: clayMaterial({ color: PALETTE.blush, selfGlow: 0, emissive: '#5a2a3a', emissiveIntensity: 0.25 }),
      suit: clayMaterial({ color: '#343c72', rim: '#a9b4ff', rimStrength: 0.4 }),
      pants: clayMaterial({ color: '#272c55', rimStrength: 0.3 }),
      shirt: clayMaterial({ color: PALETTE.cream }),
      gold: clayMaterial({ color: PALETTE.gold, emissive: '#5a4320', emissiveIntensity: 0.6, roughness: 0.5 }),
      shoe: clayMaterial({ color: '#2a2233' }),
      leaf: clayMaterial({ color: '#7fae8c' }),
      bloomA: clayMaterial({ color: '#f2a5c0', emissive: '#4a2030', emissiveIntensity: 0.5 }),
      bloomB: clayMaterial({ color: PALETTE.cream, emissive: '#3a3530', emissiveIntensity: 0.4 }),
      bloomC: clayMaterial({ color: '#c9b8f0', emissive: '#2c2650', emissiveIntensity: 0.5 }),
    }
    return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) }
  }, [])
  return { geo, mat }
}

type Kit = ReturnType<typeof useFigureKit>

function Face({ kit, eyes }: { kit: Kit; eyes: React.RefObject<THREE.Group | null> }) {
  const { geo, mat } = kit
  return (
    <>
      <mesh geometry={geo.head} material={mat.skin} />
      <group ref={eyes} position={[0, -0.01, 0]}>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.088, 0, 0.236]}>
            <mesh geometry={geo.eye} material={mat.eye} scale={[1, 1.25, 0.6]} />
            <mesh geometry={geo.shine} material={mat.shine} position={[0.009, 0.014, 0.018]} />
          </group>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.cheek} material={mat.cheek} position={[s * 0.15, -0.075, 0.2]} scale={[1, 0.6, 0.4]} />
      ))}
      <mesh geometry={geo.smile} material={mat.mouth} position={[0, -0.09, 0.248]} rotation={[0, 0, Math.PI]} />
    </>
  )
}

function useLife(seed: number, opts: { wave?: boolean } = {}) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const waveArm = useRef<THREE.Group>(null)
  const blinkAt = useRef(2 + seed)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const reduced = sceneFx.reducedMotion
    if (body.current) body.current.scale.y = reduced ? 1 : 1 + Math.sin(t * 2 + seed) * 0.014
    if (head.current && !reduced) {
      head.current.rotation.z = Math.sin(t * 0.7 + seed) * 0.06 + (seed > 0 ? -0.09 : 0.09)
      head.current.rotation.y = Math.sin(t * 0.45 + seed * 2) * 0.12
    }
    if (eyes.current) {
      if (t > blinkAt.current + 0.14) blinkAt.current = t + 2.4 + ((seed * 7.31 + t) % 2.6)
      eyes.current.scale.y = t > blinkAt.current ? 0.12 : 1
    }
    if (waveArm.current && opts.wave) {
      // A short wave every few seconds, then rest.
      const cycle = (t + seed) % 6
      const w = cycle < 1.6 && !reduced ? Math.sin((cycle / 1.6) * Math.PI) : 0
      waveArm.current.rotation.z = -0.25 - w * 2.2 + Math.sin(t * 10) * 0.18 * w
    }
  })
  return { body, head, eyes, waveArm }
}

export function Bride({ kit, ...props }: { kit: Kit } & ThreeGroupProps) {
  const { geo, mat } = kit
  const life = useLife(0.6)
  const crown = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = -1.1 + (i / 8) * 2.2
        return { p: [Math.sin(a) * 0.255, 0.13 + Math.cos(a) * 0.05, Math.cos(a) * 0.12] as [number, number, number], m: [mat.bloomA, mat.bloomB, mat.bloomC][i % 3] }
      }),
    [mat],
  )
  return (
    <group {...props}>
      <group ref={life.body}>
        <mesh geometry={geo.dress} material={mat.dress} />
        <mesh geometry={geo.sash} material={mat.blush} position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.17, 0.68, 0.02]} rotation={[-0.9, 0, s * 0.35]}>
            <mesh geometry={geo.arm} material={mat.skin} />
          </group>
        ))}
        {/* Bouquet */}
        <group position={[0, 0.5, 0.24]}>
          {[[-0.05, 0, 0], [0.05, 0.01, 0], [0, 0.05, 0.01], [0, -0.03, 0.03], [-0.04, 0.05, -0.02], [0.05, 0.06, -0.02]].map((p, i) => (
            <mesh key={i} geometry={geo.bloom} material={[mat.bloomA, mat.bloomB, mat.bloomC][i % 3]} position={p as [number, number, number]} />
          ))}
          <mesh geometry={geo.collar} material={mat.leaf} position={[0, -0.1, -0.01]} rotation={[Math.PI, 0, 0]} scale={[0.6, 0.8, 0.6]} />
        </group>
      </group>
      <group ref={life.head} position={[0, 0.99, 0]}>
        <Face kit={kit} eyes={life.eyes} />
        <mesh geometry={geo.hairCap} material={mat.hair} rotation={[-0.42, 0, 0]} position={[0, 0.02, -0.02]} />
        <mesh geometry={geo.bun} material={mat.hair} position={[0, 0.17, -0.2]} />
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={geo.bun} material={mat.hair} position={[s * 0.22, -0.1, -0.06]} scale={[0.6, 1.2, 0.7]} />
        ))}
        {crown.map((c, i) => (
          <mesh key={i} geometry={geo.bloom} material={c.m} position={c.p} scale={0.75} />
        ))}
        <mesh geometry={geo.veil} material={mat.veil} position={[0, -0.99, 0]} />
      </group>
    </group>
  )
}

export function Groom({ kit, ...props }: { kit: Kit } & ThreeGroupProps) {
  const { geo, mat } = kit
  const life = useLife(-0.6, { wave: true })
  return (
    <group {...props}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={geo.leg} material={mat.pants} position={[s * 0.085, 0.17, 0]} />
          <mesh geometry={geo.shoe} material={mat.shoe} position={[s * 0.085, 0.04, 0.04]} scale={[0.9, 0.55, 1.3]} />
        </group>
      ))}
      <group ref={life.body}>
        <mesh geometry={geo.jacket} material={mat.suit} position={[0, 0.58, 0]} scale={[1, 1, 0.85]} />
        <mesh geometry={geo.collar} material={mat.shirt} position={[0, 0.68, 0.15]} rotation={[0.35, 0, Math.PI]} scale={[1, 1, 0.3]} />
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={geo.bow} material={mat.gold} position={[s * 0.035, 0.76, 0.17]} rotation={[0, 0, (s * Math.PI) / 2]} />
        ))}
        <mesh geometry={geo.bloom} material={mat.bloomA} position={[0.12, 0.66, 0.15]} scale={0.8} />
        <group position={[-0.21, 0.72, 0]} rotation={[0, 0, 0.25]}>
          <mesh geometry={geo.arm} material={mat.suit} />
          <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.27, 0]} />
        </group>
        <group ref={life.waveArm} position={[0.21, 0.72, 0]} rotation={[0, 0, -0.25]}>
          <mesh geometry={geo.arm} material={mat.suit} />
          <mesh geometry={geo.hand} material={mat.skin} position={[0, -0.27, 0]} />
        </group>
      </group>
      <group ref={life.head} position={[0, 1.02, 0]}>
        <Face kit={kit} eyes={life.eyes} />
        <mesh geometry={geo.hairCap} material={mat.hair} rotation={[-0.32, 0, 0]} position={[0, 0.015, -0.012]} />
        <mesh geometry={geo.quiff} material={mat.hair} position={[0.08, 0.2, 0.13]} scale={[1.4, 0.6, 0.9]} rotation={[0, 0, -0.3]} />
      </group>
    </group>
  )
}

type ThreeGroupProps = Omit<import('@react-three/fiber').ThreeElements['group'], 'ref'>

/** The pair, turned slightly toward each other. */
export function Couple(props: ThreeGroupProps) {
  const kit = useFigureKit()
  return (
    <group {...props}>
      <Groom kit={kit} position={[-0.34, 0, 0]} rotation={[0, 0.28, 0]} />
      <Bride kit={kit} position={[0.34, 0, 0]} rotation={[0, -0.28, 0]} />
    </group>
  )
}
