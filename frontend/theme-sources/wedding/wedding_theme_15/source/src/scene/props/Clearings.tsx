import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32, pick, range } from '../../lib/random'
import { sceneFx } from '../../state/sceneFx'
import { envState } from '../envState'
import { FOCI, type Vec3 } from '../layout'
import { blobGeometry, heartShape, lathe } from '../geometry'
import { clayMaterial, glowMaterial, PALETTE } from '../materials'
import { useDisposable } from '../Instanced'
import { Blossoms, type Bloom } from './Blossoms'
import { Couple } from './Figurine'
import { buildGlowData, GlowPoints } from '../effects/GlowPoints'

const BLOOM_COLORS = ['#F2C5D2', '#f7d7e1', '#FFF8EE', '#c9b8f0', '#B9D5F2', '#efb3c6']

/** Scatter blossoms and leaves along a curve. */
export function garland(curve: THREE.Curve<THREE.Vector3>, count: number, seed: number, opts: { spread?: number; size?: [number, number]; leafRatio?: number; colors?: string[] } = {}): Bloom[] {
  const rng = mulberry32(seed)
  const spread = opts.spread ?? 0.12
  const [s0, s1] = opts.size ?? [1.2, 2.1]
  const out: Bloom[] = []
  for (let i = 0; i < count; i++) {
    const t = (i + rng()) / count
    const p = curve.getPoint(t)
    const leaf = rng() < (opts.leafRatio ?? 0.4)
    out.push({
      p: [p.x + range(rng, -spread, spread), p.y + range(rng, -spread, spread), p.z + range(rng, -spread, spread) + 0.05],
      s: leaf ? range(rng, 1.4, 2.2) : range(rng, s0, s1),
      c: pick(rng, opts.colors ?? BLOOM_COLORS),
      r: leaf ? [rng() * 6, rng() * 6, rng() * 6] : [Math.PI / 2 + range(rng, -0.5, 0.5), range(rng, -0.6, 0.6), rng() * 6],
      leaf,
    })
  }
  return out
}

/** Scene 1: two leaning trees woven into a lantern-hung archway at the forest entrance. */
export function ForestGate() {
  const [gx, , gz] = FOCI.gate
  const geos = useDisposable(() => {
    const trunk = lathe([[0.0001, 0], [0.62, 0], [0.42, 0.25], [0.3, 0.9], [0.27, 2.0], [0.24, 3.2], [0.0001, 3.4]], 12)
    const arch = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-2.45, 3.25, 0), new THREE.Vector3(0, 4.55, 0.1), new THREE.Vector3(2.45, 3.25, 0))
    const branch = new THREE.TubeGeometry(arch, 40, 0.15, 8)
    const blob = blobGeometry(3, 0.18, 1.6, 7)
    return { trunk, branch, blob, arch, dispose: () => [trunk, branch, blob].forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const bark = clayMaterial({ color: '#5b4660', rim: '#a49ce0', rimStrength: 0.35 })
    const leaves = clayMaterial({ vertexColors: true, color: '#3f6a74', rim: '#b4aef0', rimStrength: 0.5 })
    return { bark, leaves, dispose: () => (bark.dispose(), leaves.dispose()) }
  }, [])
  const blooms = useMemo(() => {
    const vineL = new THREE.CatmullRomCurve3([[-2.5, 0.4, 0.35], [-2.25, 1.4, 0.32], [-2.5, 2.3, 0.3], [-2.3, 3.2, 0.2]].map((p) => new THREE.Vector3(...p)))
    const vineR = new THREE.CatmullRomCurve3([[2.5, 0.4, 0.35], [2.25, 1.4, 0.32], [2.5, 2.3, 0.3], [2.3, 3.2, 0.2]].map((p) => new THREE.Vector3(...p)))
    return [...garland(geos.arch, 70, 3, { spread: 0.18 }), ...garland(vineL, 26, 4, { spread: 0.08 }), ...garland(vineR, 26, 5, { spread: 0.08 })]
  }, [geos.arch])
  const canopy: Array<[Vec3, number]> = [
    [[-2.6, 3.7, -0.2], 1.25], [[-1.6, 4.25, 0], 0.9], [[0, 4.75, -0.1], 1.05], [[1.6, 4.25, 0], 0.9], [[2.6, 3.7, -0.2], 1.25], [[-3.3, 3.1, -0.6], 1.0], [[3.3, 3.1, -0.6], 1.0],
  ]
  return (
    <group position={[gx, 0, gz]}>
      <mesh geometry={geos.trunk} material={mats.bark} position={[-2.55, -0.05, 0]} rotation={[0, 0, -0.06]} />
      <mesh geometry={geos.trunk} material={mats.bark} position={[2.55, -0.05, 0]} rotation={[0, 0, 0.06]} />
      <mesh geometry={geos.branch} material={mats.bark} />
      {canopy.map(([p, s], i) => (
        <mesh key={i} geometry={geos.blob} material={mats.leaves} position={p} scale={[s, s * 0.85, s]} rotation={[0, i, 0]} />
      ))}
      <Blossoms items={blooms} />
    </group>
  )
}

/** Scene 2: a mossy knoll ringed by a floral frame where the couple greets the guest. */
export function CoupleClearing() {
  const [cx, , cz] = FOCI.couple
  const hearts = useRef<THREE.Group>(null)
  const geos = useDisposable(() => {
    const mound = blobGeometry(3, 0.08, 1.2, 11)
    const ring = new THREE.TorusGeometry(1.5, 0.06, 8, 64)
    const heart = new THREE.ExtrudeGeometry(heartShape(0.12), { depth: 0.05, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 })
    heart.center()
    return { mound, ring, heart, dispose: () => [mound, ring, heart].forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const moss = clayMaterial({ vertexColors: true, color: '#577f6e', rim: '#c9f0d4', rimStrength: 0.3 })
    const vine = clayMaterial({ color: '#6f9a7e', rimStrength: 0.3 })
    const heart = glowMaterial('#f2a5c0', 1.5)
    return { moss, vine, heart, dispose: () => [moss, vine, heart].forEach((m) => m.dispose()) }
  }, [])
  const ringCurve = useMemo(() => new THREE.EllipseCurve(0, 0, 1.5, 1.5, 0, Math.PI * 2), [])
  const blooms = useMemo(() => {
    const curve = new THREE.CurvePath<THREE.Vector3>()
    const pts = ringCurve.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y + 1.3, -0.55))
    curve.add(new THREE.CatmullRomCurve3(pts, true))
    return garland(curve, 110, 21, { spread: 0.14, size: [1.3, 2.3] })
  }, [ringCurve])
  const glow = useMemo(
    () => buildGlowData([{ p: [0, 1.3, -0.7], color: '#f2c5d2', size: 4.5, intensity: 0.22 }, { p: [0, 0.6, 0.4], color: '#f5d58b', size: 2.5, intensity: 0.25 }]),
    [],
  )
  useFrame(({ clock }) => {
    if (!hearts.current) return
    const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    const near = 1 - THREE.MathUtils.smoothstep(Math.abs(envState.section - 1), 0.3, 1)
    hearts.current.children.forEach((h, i) => {
      h.position.y = 1.85 + i * 0.22 + Math.sin(t * 1.4 + i * 1.7) * 0.08
      h.rotation.y = Math.sin(t * 0.9 + i) * 0.5
      h.scale.setScalar(near * (0.8 + i * 0.12))
    })
  })
  return (
    <group position={[cx, 0, cz]}>
      <mesh geometry={geos.mound} material={mats.moss} position={[0, -0.32, 0]} scale={[1.9, 0.45, 1.5]} />
      <mesh geometry={geos.ring} material={mats.vine} position={[0, 1.3, -0.55]} />
      <Blossoms items={blooms} />
      <Couple position={[0, 0.06, 0]} />
      <group ref={hearts}>
        {[-0.75, 0.0, 0.75].map((x, i) => (
          <mesh key={i} geometry={geos.heart} material={mats.heart} position={[x, 1.9, -0.1]} rotation={[0, 0, Math.PI]} />
        ))}
      </group>
      <GlowPoints data={glow} fadeNear={30} fadeFar={60} />
    </group>
  )
}

/** Scene 5 helper: the floral ceremony arch, whose blossoms grow in as the guest arrives. */
export function CeremonyArch({ position }: { position: Vec3 }) {
  const curve = useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>()
    path.add(new THREE.LineCurve3(new THREE.Vector3(-1.75, 0, 0), new THREE.Vector3(-1.75, 2.1, 0)))
    path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(-1.75, 2.1, 0), new THREE.Vector3(-1.75, 3.6, 0), new THREE.Vector3(1.75, 3.6, 0), new THREE.Vector3(1.75, 2.1, 0)))
    path.add(new THREE.LineCurve3(new THREE.Vector3(1.75, 2.1, 0), new THREE.Vector3(1.75, 0, 0)))
    return path
  }, [])
  const geos = useDisposable(() => {
    const tube = new THREE.TubeGeometry(curve, 120, 0.075, 8)
    const twist = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(curve.getSpacedPoints(160).map((p, i) => new THREE.Vector3(p.x + Math.sin(i * 0.5) * 0.09, p.y, p.z + Math.cos(i * 0.5) * 0.09))),
      320,
      0.025,
      5,
    )
    const strands: THREE.BufferGeometry[] = []
    for (let i = 0; i < 7; i++) {
      const x = -1.1 + i * 0.37
      const top = 2.75 + Math.cos((x / 1.75) * 1.3) * 0.55
      const len = 0.5 + ((i * 37) % 5) * 0.12
      strands.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, top, 0), new THREE.Vector3(x + 0.03, top - len * 0.5, 0.05), new THREE.Vector3(x - 0.02, top - len, 0.02)]), 10, 0.012, 4))
    }
    return { tube, twist, strands, dispose: () => [tube, twist, ...strands].forEach((g) => g.dispose()) }
  }, [curve])
  const mats = useDisposable(() => {
    const vine = clayMaterial({ color: '#6f9a7e', rim: '#c9f0d4', rimStrength: 0.35 })
    return { vine, dispose: () => vine.dispose() }
  }, [])
  const blooms = useMemo(() => {
    const main = garland(curve, 170, 41, { spread: 0.16, size: [1.4, 2.6] })
    // Heavier clusters at the shoulders of the arch.
    const shoulder = (x: number) => new THREE.CatmullRomCurve3([new THREE.Vector3(x, 1.7, 0), new THREE.Vector3(x * 0.92, 2.6, 0), new THREE.Vector3(x * 0.6, 3.15, 0)])
    return [...main, ...garland(shoulder(-1.75), 40, 42, { spread: 0.22, size: [1.8, 2.8] }), ...garland(shoulder(1.75), 40, 43, { spread: 0.22, size: [1.8, 2.8] })]
  }, [curve])
  const growth = () => 0.15 + 0.85 * THREE.MathUtils.smoothstep(envState.section, 3.15, 3.95)
  return (
    <group position={position}>
      <mesh geometry={geos.tube} material={mats.vine} />
      <mesh geometry={geos.twist} material={mats.vine} />
      {geos.strands.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.vine} />
      ))}
      <Blossoms items={blooms} growth={growth} />
    </group>
  )
}

/** Floating golden rings above the ceremony. */
export function Rings({ position }: { position: Vec3 }) {
  const g = useRef<THREE.Group>(null)
  const geo = useDisposable(() => new THREE.TorusGeometry(0.16, 0.035, 14, 40), [])
  const mat = useDisposable(() => clayMaterial({ color: PALETTE.gold, emissive: '#7a5a20', emissiveIntensity: 0.9, roughness: 0.35, rim: '#fff3c4', rimStrength: 0.6 }), [])
  const glow = useMemo(() => buildGlowData([{ p: [0, 0, 0], color: '#f5d58b', size: 1.6, intensity: 0.5 }]), [])
  useFrame(({ clock }) => {
    if (!g.current) return
    const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    g.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08
    g.current.rotation.y = t * 0.6
  })
  return (
    <group ref={g} position={position}>
      <mesh geometry={geo} material={mat} position={[-0.09, 0, 0]} rotation={[0, 0.5, 0.2]} />
      <mesh geometry={geo} material={mat} position={[0.09, 0, 0]} rotation={[0, -0.5, -0.2]} />
      <GlowPoints data={glow} fadeNear={30} fadeFar={60} />
    </group>
  )
}
