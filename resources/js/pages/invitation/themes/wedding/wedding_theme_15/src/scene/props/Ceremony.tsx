import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mulberry32, pick, range } from '../../lib/random'
import { FOCI, type Vec3 } from '../layout'
import { blossomGeometry, petalGeometry } from '../geometry'
import { clayMaterial } from '../materials'
import { Instanced, useDisposable, type InstanceItem } from '../Instanced'
import { buildGlowData, GlowPoints } from '../effects/GlowPoints'
import { CeremonyArch, Rings } from './Clearings'
import { Couple } from './Figurine'

function benchGeometry() {
  const seat = new RoundedBoxGeometry(1.5, 0.09, 0.38, 2, 0.03).translate(0, 0.42, 0)
  const back = new RoundedBoxGeometry(1.5, 0.34, 0.07, 2, 0.03).translate(0, 0.7, -0.17)
  const legs = [-0.65, 0.65].flatMap((x) => [-0.13, 0.13].map((z) => new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6).translate(x, 0.21, z)))
  return mergeGeometries([seat, back, ...legs].map((g) => (g.index ? g.toNonIndexed() : g)))!
}

function candleGeometry() {
  return new THREE.CylinderGeometry(0.05, 0.055, 1, 12).translate(0, 0.5, 0)
}

/** Scene 5: aisle, benches, candlelit dais, the floral arch and the couple. */
export function Ceremony() {
  const [ex, , ez] = FOCI.event
  const geos = useDisposable(() => {
    const list = {
      dais: new THREE.CylinderGeometry(2.6, 2.75, 0.24, 40),
      step: new THREE.CylinderGeometry(2.95, 3.05, 0.1, 40, 1, false, -Math.PI * 0.35, Math.PI * 0.7),
      bench: benchGeometry(),
      candle: candleGeometry(),
      runner: new THREE.PlaneGeometry(1.1, 8.6),
      petal: petalGeometry(),
      posy: blossomGeometry(),
      postPole: new THREE.CylinderGeometry(0.03, 0.04, 0.9, 6).translate(0, 0.45, 0),
    }
    return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const list = {
      stone: clayMaterial({ color: '#c7bedf', rim: '#ffffff', rimStrength: 0.35, roughness: 0.8 }),
      wood: clayMaterial({ color: '#7d6070', rim: '#f5d58b', rimStrength: 0.25 }),
      candle: clayMaterial({ color: '#fff3e2', emissive: '#7a5a3a', emissiveIntensity: 0.35, rim: '#ffffff', rimStrength: 0.4 }),
      runner: new THREE.MeshStandardMaterial({ color: '#f1e3ee', roughness: 1, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -3 }),
      petal: clayMaterial({ side: THREE.DoubleSide, selfGlow: 0.25 }),
      posy: clayMaterial({ selfGlow: 0.35, rim: '#fff8ee' }),
    }
    return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) }
  }, [])

  const data = useMemo(() => {
    const rng = mulberry32(55)
    const benches: InstanceItem[] = []
    const posts: InstanceItem[] = []
    const posies: InstanceItem[] = []
    for (let row = 0; row < 3; row++) {
      const z = 8.6 - row * 2.1
      for (const side of [-1, 1]) {
        benches.push({ p: [side * 1.55, 0, z], r: [0, Math.PI + side * 0.06, 0] })
        posts.push({ p: [side * 0.72, 0, z + 0.2] })
        for (let k = 0; k < 4; k++) posies.push({ p: [side * 0.72 + range(rng, -0.08, 0.08), 0.92 + range(rng, -0.04, 0.06), z + 0.2 + range(rng, -0.08, 0.08)], r: [rng() * 6, rng() * 6, 0], s: range(rng, 1.4, 2), c: pick(rng, ['#F2C5D2', '#FFF8EE', '#c9b8f0']) })
      }
    }
    const petals: InstanceItem[] = []
    for (let i = 0; i < 70; i++) {
      petals.push({ p: [range(rng, -0.6, 0.6), 0.025, range(rng, 2.6, 11)], r: [-Math.PI / 2 + range(rng, -0.2, 0.2), 0, rng() * 6], s: range(rng, 0.9, 1.5), c: pick(rng, ['#F2C5D2', '#f7d7e1', '#FFF8EE', '#efb3c6']) })
    }
    const candles: InstanceItem[] = []
    const flames: Parameters<typeof buildGlowData>[0] = []
    const ring = [-1.2, -0.8, -0.45, 0.45, 0.8, 1.2]
    ring.forEach((a, i) => {
      const r = 2.35
      const h = 0.25 + (i % 3) * 0.12
      const p: Vec3 = [Math.sin(a) * r, 0.24, Math.cos(a) * r - 0.5]
      candles.push({ p, s: [1, h, 1] })
      flames.push({ p: [p[0], 0.24 + h + 0.07, p[2]], color: '#ffcf7a', size: 0.45, intensity: 1.6, phase: i * 0.37 })
    })
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const p: Vec3 = [side * (2.3 + k * 0.18), 0, 1.6 - k * 0.3]
      const h = 0.4 + k * 0.18
      candles.push({ p, s: [1.3, h, 1.3] })
      flames.push({ p: [p[0], h + 0.08, p[2]], color: '#ffcf7a', size: 0.5, intensity: 1.6, phase: k * 0.5 + side })
    }
    flames.push({ p: [0, 1.5, 0], color: '#f2c5d2', size: 6, intensity: 0.12 })
    return { benches, posts, posies, petals, candles, flames: buildGlowData(flames) }
  }, [])

  return (
    <group position={[ex, 0, ez]}>
      <mesh geometry={geos.dais} material={mats.stone} position={[0, 0.1, 0]} />
      <mesh geometry={geos.step} material={mats.stone} position={[0, 0.03, 0]} />
      <mesh geometry={geos.runner} material={mats.runner} position={[0, 0.03, 7.2]} rotation={[-Math.PI / 2, 0, 0]} />
      <Instanced geometry={geos.petal} material={mats.petal} items={data.petals} />
      <Instanced geometry={geos.bench} material={mats.wood} items={data.benches} />
      <Instanced geometry={geos.postPole} material={mats.wood} items={data.posts} />
      <Instanced geometry={geos.posy} material={mats.posy} items={data.posies} />
      <Instanced geometry={geos.candle} material={mats.candle} items={data.candles} />
      <GlowPoints data={data.flames} flicker={0.25} fadeNear={34} fadeFar={64} />
      <CeremonyArch position={[0, 0.22, -0.2]} />
      <Couple position={[0, 0.22, 0.25]} />
      <Rings position={[0, 3.25, -0.2]} />
    </group>
  )
}
