import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { wedding } from '../../config/wedding'
import { mulberry32, pick, range } from '../../lib/random'
import { sceneFx } from '../../state/sceneFx'
import { useApp } from '../../state/store'
import { envState } from '../envState'
import { FOCI, groundHeight, type Vec3 } from '../layout'
import { blobGeometry, lathe, mushroomCapGeometry, mushroomStemGeometry, rockGeometry } from '../geometry'
import { clayMaterial, PALETTE } from '../materials'
import { wishTagTexture } from '../textures'
import { Instanced, useDisposable, type InstanceItem } from '../Instanced'
import { buildGlowData, GlowPoints } from '../effects/GlowPoints'
import { Blossoms, type Bloom } from './Blossoms'
import { PhotoFrame } from './PhotoFrame'

/** Scene 6: a moonlit ring of floating photo frames; clicking one opens the lightbox. */
export function GalleryRing() {
  const [gx, , gz] = FOCI.gallery
  const cam = new THREE.Vector3(2.4, 2.15, -73.2)
  const frames = useMemo(() => {
    const n = Math.min(8, wedding.gallery.length)
    const center = new THREE.Vector3(gx + 0.2, 0, gz - 0.6)
    const toCam = Math.atan2(cam.x - center.x, cam.z - center.z)
    return wedding.gallery.slice(0, n).map((img, i) => {
      const upper = i % 2 === 1
      const a = toCam + Math.PI + (-1.25 + (i / Math.max(1, n - 1)) * 2.5)
      const r = upper ? 2.9 : 3.2
      const p: Vec3 = [center.x + Math.sin(a) * r, upper ? 3.0 : 1.75, center.z + Math.cos(a) * r]
      const yaw = Math.atan2(cam.x - p[0], cam.z - p[2])
      return { img, p, yaw, i }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gx, gz])

  const geos = useDisposable(() => {
    const disc = blobGeometry(3, 0.06, 1.2, 4)
    const stem = mushroomStemGeometry()
    const cap = mushroomCapGeometry()
    return { disc, stem, cap, dispose: () => [disc, stem, cap].forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const moss = clayMaterial({ vertexColors: true, color: '#4f7468', rim: '#c9f0d4', rimStrength: 0.3 })
    const stem = clayMaterial({ vertexColors: true, color: '#f8e6d2' })
    const cap = clayMaterial({ vertexColors: true, selfGlow: 0.8, rim: '#ffffff', rimStrength: 0.35 })
    return { moss, stem, cap, dispose: () => [moss, stem, cap].forEach((m) => m.dispose()) }
  }, [])
  const mushrooms = useMemo(() => {
    const rng = mulberry32(81)
    const out: InstanceItem[] = []
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2
      const r = range(rng, 3.4, 3.9)
      out.push({ p: [gx + Math.cos(a) * r, 0.1, gz - 0.6 + Math.sin(a) * r], r: [0, rng() * 6, 0], s: range(rng, 1, 2.2), c: pick(rng, ['#9cc6f2', '#b9a6f2', '#ef9fbd']) })
    }
    return out
  }, [gx, gz])
  const setLightbox = useApp((s) => s.setLightbox)
  const glow = useMemo(() => buildGlowData([{ p: [gx, 2.4, gz - 0.6], color: '#b9d5f2', size: 7, intensity: 0.14 }]), [gx, gz])

  return (
    <group>
      <mesh geometry={geos.disc} material={mats.moss} position={[gx + 0.2, -0.28, gz - 0.6]} scale={[4.2, 0.4, 4.2]} />
      <Instanced geometry={geos.stem} material={mats.stem} items={mushrooms.map((m) => ({ ...m, c: '#ffffff' }))} />
      <Instanced geometry={geos.cap} material={mats.cap} items={mushrooms} />
      {frames.map(({ img, p, yaw, i }) => (
        <PhotoFrame key={img.src} url={img.thumb} position={p} rotation={[0, yaw, 0]} phase={i * 0.19} onSelect={() => setLightbox(i)} />
      ))}
      <GlowPoints data={glow} fadeNear={30} fadeFar={60} />
    </group>
  )
}

/** Scene 7: a lantern-lit hexagonal gazebo with a little guestbook table. */
export function Gazebo() {
  const [rx, , rz] = FOCI.rsvp
  const y0 = groundHeight(rx, rz)
  const geos = useDisposable(() => {
    const roofPts: Array<[number, number]> = [[0.0001, 2.55], [2.95, 2.55], [3.0, 2.65], [2.4, 3.0], [1.5, 3.4], [0.6, 3.75], [0.15, 4.05], [0.0001, 4.12]]
    const list = {
      floor: new THREE.CylinderGeometry(2.7, 2.85, 0.2, 6),
      step: new THREE.CylinderGeometry(3.0, 3.1, 0.08, 6),
      pillar: new THREE.CylinderGeometry(0.08, 0.1, 2.5, 10).translate(0, 1.25, 0),
      capital: new THREE.SphereGeometry(0.13, 12, 8),
      roof: lathe(roofPts, 6),
      finial: new THREE.SphereGeometry(0.14, 16, 12),
      spire: new THREE.ConeGeometry(0.06, 0.35, 10),
      table: lathe([[0.0001, 0], [0.3, 0], [0.08, 0.1], [0.06, 0.62], [0.5, 0.66], [0.5, 0.72], [0.0001, 0.72]], 24),
      page: new RoundedBoxGeometry(0.32, 0.03, 0.42, 2, 0.01),
      candle: new THREE.CylinderGeometry(0.04, 0.045, 0.18, 10),
    }
    return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const list = {
      stone: clayMaterial({ color: '#bdb3d6', rim: '#ffffff', rimStrength: 0.3 }),
      pillar: clayMaterial({ color: '#efe3ea', rim: PALETTE.gold, rimStrength: 0.35 }),
      roof: clayMaterial({ color: '#8f86c2', rim: '#f2c5d2', rimStrength: 0.55, side: THREE.DoubleSide, flatShading: true }),
      gold: clayMaterial({ color: PALETTE.gold, emissive: '#6b4f1c', emissiveIntensity: 0.9, roughness: 0.4 }),
      wood: clayMaterial({ color: '#7d6070' }),
      page: clayMaterial({ color: '#fff8ee', emissive: '#4a4038', emissiveIntensity: 0.4 }),
    }
    return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) }
  }, [])
  const pillars = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        return [Math.cos(a) * 2.35, Math.sin(a) * 2.35] as [number, number]
      }),
    [],
  )
  const bulbs = useMemo(() => {
    const items: Parameters<typeof buildGlowData>[0] = []
    for (let i = 0; i < 6; i++) {
      const [x0, z0] = pillars[i]
      const [x1, z1] = pillars[(i + 1) % 6]
      for (let k = 1; k < 8; k++) {
        const t = k / 8
        const sag = Math.sin(t * Math.PI) * 0.28
        items.push({ p: [rx + x0 + (x1 - x0) * t, y0 + 2.5 - sag, rz + z0 + (z1 - z0) * t], color: k % 2 ? '#ffd88f' : '#ffc1d6', size: 0.28, intensity: 1.8, phase: (i * 8 + k) * 0.13 })
      }
    }
    items.push({ p: [rx, y0 + 1.05, rz], color: '#ffcf7a', size: 0.5, intensity: 1.8 })
    items.push({ p: [rx, y0 + 1.6, rz], color: '#ffc983', size: 5, intensity: 0.16 })
    return buildGlowData(items)
  }, [pillars, rx, rz, y0])

  return (
    <group>
      <group position={[rx, y0, rz]}>
        <mesh geometry={geos.step} material={mats.stone} position={[0, 0.02, 0]} />
        <mesh geometry={geos.floor} material={mats.stone} position={[0, 0.12, 0]} />
        {pillars.map(([x, z], i) => (
          <group key={i} position={[x, 0.2, z]}>
            <mesh geometry={geos.pillar} material={mats.pillar} />
            <mesh geometry={geos.capital} material={mats.gold} position={[0, 2.38, 0]} />
          </group>
        ))}
        <mesh geometry={geos.roof} material={mats.roof} />
        <mesh geometry={geos.finial} material={mats.gold} position={[0, 4.2, 0]} />
        <mesh geometry={geos.spire} material={mats.gold} position={[0, 4.45, 0]} />
        <mesh geometry={geos.table} material={mats.wood} position={[0, 0.2, 0]} />
        <mesh geometry={geos.page} material={mats.page} position={[-0.15, 0.95, 0.05]} rotation={[0, 0.3, 0.12]} />
        <mesh geometry={geos.page} material={mats.page} position={[0.15, 0.95, 0.0]} rotation={[0, 0.3, -0.12]} />
        <mesh geometry={geos.candle} material={mats.page} position={[0, 0.98, -0.3]} />
      </group>
      <GlowPoints data={bulbs} flicker={0.08} twinkle={0.2} fadeNear={34} fadeFar={64} />
    </group>
  )
}

const TAG_BASE = 18
const TAG_MAX = 48

/** Scene 8: the wishing tree — one glowing tag per guest wish (plus a few to start) — and a moonlit pond. */
export function WishingTree() {
  const [wx, , wz] = FOCI.wishes
  const wishCount = useApp((s) => s.wishCount)
  const tags = useRef<THREE.InstancedMesh>(null)
  const geos = useDisposable(() => {
    const trunk = lathe([[0.0001, 0], [0.85, 0], [0.55, 0.25], [0.42, 0.9], [0.38, 1.9], [0.44, 2.6], [0.0001, 2.75]], 14)
    const branchCurves = [
      [[0, 2.3, 0], [-0.9, 3.0, 0.2], [-1.9, 3.3, 0.3]],
      [[0, 2.4, 0], [0.9, 3.1, -0.1], [2.0, 3.4, -0.2]],
      [[0, 2.5, 0], [0.2, 3.3, 0.8], [0.4, 3.8, 1.2]],
      [[0, 2.5, 0], [-0.2, 3.4, -0.9], [-0.3, 4.0, -1.4]],
    ].map((pts) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 16, 0.13, 7))
    const canopy = blobGeometry(3, 0.16, 1.4, 13)
    const tag = new THREE.PlaneGeometry(0.16, 0.24).translate(0, -0.12, 0)
    const pond = new THREE.CircleGeometry(2.3, 48)
    const pad = new THREE.CircleGeometry(0.22, 16, 0.4, Math.PI * 2 - 0.4)
    const stone = rockGeometry(17)
    const candle = new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10)
    return { trunk, branchCurves, canopy, tag, pond, pad, stone, candle, dispose: () => [trunk, ...branchCurves, canopy, tag, pond, pad, stone, candle].forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const list = {
      bark: clayMaterial({ color: '#5b4660', rim: '#c9b8f0', rimStrength: 0.4 }),
      canopy: clayMaterial({ vertexColors: true, rim: '#ffe6f0', rimStrength: 0.5, selfGlow: 0.12 }),
      tag: new THREE.MeshBasicMaterial({ map: wishTagTexture(), color: new THREE.Color(1.25, 1.2, 1.1), side: THREE.DoubleSide, transparent: true, toneMapped: false }),
      pad: clayMaterial({ color: '#5f8f78', side: THREE.DoubleSide }),
      stone: clayMaterial({ color: '#6c6994', rimStrength: 0.25 }),
      candle: clayMaterial({ color: '#fff3e2', emissive: '#7a5a3a', emissiveIntensity: 0.4 }),
      string: new THREE.LineBasicMaterial({ color: '#e9dcc0', transparent: true, opacity: 0.5 }),
    }
    return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) }
  }, [])
  const pondMat = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 c = vUv - 0.5;
            float r = length(c) * 2.0;
            vec3 col = mix(vec3(0.12, 0.17, 0.38), vec3(0.06, 0.08, 0.2), r);
            // Moon reflection streak.
            float streak = exp(-pow((c.x - 0.08) * 9.0, 2.0)) * smoothstep(0.5, -0.3, c.y) * (0.75 + 0.25 * sin(c.y * 40.0 + uTime * 1.5));
            col += vec3(0.95, 0.9, 0.75) * streak * 0.55;
            // Slow ripples.
            float rip = sin(r * 26.0 - uTime * 1.2) * 0.5 + 0.5;
            col += vec3(0.5, 0.65, 0.95) * pow(rip, 8.0) * 0.1 * (1.0 - r);
            float edge = smoothstep(1.0, 0.9, r);
            gl_FragColor = vec4(col, edge);
          }
        `,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )

  const tree = useMemo(() => {
    const rng = mulberry32(64)
    const canopy: Array<{ p: Vec3; s: number; c: string }> = []
    const colors = ['#d7a6cf', '#e8b8d2', '#b9a3e0', '#c79bc6', '#f0c4d8']
    const centers: Vec3[] = [[0, 4.3, 0], [-1.6, 3.8, 0.2], [1.7, 3.9, -0.1], [0.3, 4.0, 1.3], [-0.3, 4.4, -1.3], [-1.0, 4.9, -0.3], [1.0, 4.9, 0.4], [0, 5.4, 0]]
    centers.forEach((p, i) => canopy.push({ p, s: i === 0 ? 1.7 : range(rng, 1.05, 1.4), c: pick(rng, colors) }))
    const blooms: Bloom[] = []
    for (let i = 0; i < 90; i++) {
      const c = pick(rng, centers)
      const a = rng() * Math.PI * 2
      const e = range(rng, -0.6, 1)
      const r = 1.25
      blooms.push({ p: [c[0] + Math.cos(a) * Math.cos(e) * r, c[1] + Math.sin(e) * r * 0.85, c[2] + Math.sin(a) * Math.cos(e) * r], s: range(rng, 1.4, 2.2), c: pick(rng, ['#FFF8EE', '#F2C5D2', '#fbe3ec']), r: [rng() * 6, rng() * 6, 0] })
    }
    const anchors: Array<{ p: Vec3; len: number; ph: number }> = []
    for (let i = 0; i < TAG_MAX; i++) {
      const a = i * 2.39996 + rng() * 0.3
      const r = range(rng, 0.9, 2.5)
      const top = 3.35 - r * 0.15 + range(rng, -0.1, 0.2)
      anchors.push({ p: [Math.cos(a) * r, top, Math.sin(a) * r], len: range(rng, 0.35, 0.8), ph: rng() * 6 })
    }
    const stones: InstanceItem[] = []
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2
      stones.push({ p: [Math.cos(a) * 2.45, 0.02, Math.sin(a) * 2.45], r: [0, rng() * 6, 0], s: range(rng, 0.18, 0.32), c: pick(rng, ['#6c6994', '#77739c', '#5f6b84']) })
    }
    const canopyItems: InstanceItem[] = canopy.map((c, i) => ({ p: c.p, s: [c.s, c.s * 0.8, c.s], r: [0, i * 1.3, 0], c: c.c }))
    return { canopyItems, blooms, anchors, stones }
  }, [])

  const tagCount = Math.min(TAG_MAX, TAG_BASE + wishCount)
  const strings = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    tree.anchors.slice(0, tagCount).forEach((a) => pts.push(a.p[0], a.p[1], a.p[2], a.p[0], a.p[1] - a.len, a.p[2]))
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [tree, tagCount])
  const sparkles = useMemo(() => {
    const rng = mulberry32(65)
    const items: Parameters<typeof buildGlowData>[0] = tree.anchors.slice(0, tagCount).map((a, i) => ({ p: [a.p[0], a.p[1] - a.len - 0.12, a.p[2]] as Vec3, color: '#fff1c8', size: 0.42, intensity: 0.9, phase: i * 0.21 }))
    for (let i = 0; i < 40; i++) items.push({ p: [range(rng, -2.6, 2.6), range(rng, 2.6, 6), range(rng, -2.4, 2.4)], color: pick(rng, ['#fff1a8', '#f2c5d2', '#b9d5f2']), size: range(rng, 0.1, 0.2), intensity: 1.6 })
    return buildGlowData(items)
  }, [tree, tagCount])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    pondMat.uniforms.uTime.value = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    const m = tags.current
    if (!m) return
    // Only animate the swaying tags while the wishing tree is near.
    if (Math.abs(envState.section - 7.5) > 1.6 && m.userData.ready) return
    const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    for (let i = 0; i < tagCount; i++) {
      const a = tree.anchors[i]
      dummy.position.set(a.p[0], a.p[1] - a.len, a.p[2])
      dummy.rotation.set(Math.sin(t * 1.1 + a.ph) * 0.18, a.ph + Math.sin(t * 0.7 + a.ph) * 0.4, Math.sin(t * 0.9 + a.ph) * 0.12)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.count = tagCount
    m.instanceMatrix.needsUpdate = true
    m.userData.ready = true
  })

  const pondX = wx + 4.4
  const pondZ = wz + 3.6
  const pondData = useMemo(() => {
    const pads: InstanceItem[] = [
      { p: [0.8, 0.012, 0.3], r: [-Math.PI / 2, 0, 0.4], s: 1 },
      { p: [-0.9, 0.012, -0.5], r: [-Math.PI / 2, 0, 2.1], s: 0.8 },
      { p: [0.2, 0.012, -1.1], r: [-Math.PI / 2, 0, 4], s: 1.2 },
    ]
    const candles: InstanceItem[] = [
      { p: [-0.3, 0.06, 0.6] }, { p: [0.6, 0.06, -0.6] }, { p: [-1.2, 0.06, 0.4] }, { p: [1.3, 0.06, 0.9] },
    ]
    const flames = buildGlowData(candles.map((c, i) => ({ p: [pondX + c.p[0], 0.2, pondZ + c.p[2]] as Vec3, color: '#ffcf7a', size: 0.5, intensity: 1.6, phase: i * 0.3 })))
    return { pads, candles, flames }
  }, [pondX, pondZ])

  return (
    <group>
      <group position={[wx, groundHeight(wx, wz) - 0.05, wz]}>
        <mesh geometry={geos.trunk} material={mats.bark} />
        {geos.branchCurves.map((g, i) => (
          <mesh key={i} geometry={g} material={mats.bark} />
        ))}
        <Instanced geometry={geos.canopy} material={mats.canopy} items={tree.canopyItems} />
        <Blossoms items={tree.blooms} />
        <lineSegments geometry={strings} material={mats.string} />
        <instancedMesh ref={tags} args={[geos.tag, mats.tag, TAG_MAX]} frustumCulled={false} />
        <GlowPoints data={sparkles} drift={0.12} twinkle={0.6} fadeNear={40} fadeFar={70} />
      </group>
      <group position={[pondX, 0.06, pondZ]}>
        <mesh geometry={geos.pond} material={pondMat} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} />
        <Instanced geometry={geos.pad} material={mats.pad} items={pondData.pads} />
        <Instanced geometry={geos.candle} material={mats.candle} items={pondData.candles} />
        <Instanced geometry={geos.stone} material={mats.stone} items={tree.stones} />
      </group>
      <GlowPoints data={pondData.flames} flicker={0.2} fadeNear={34} fadeFar={64} />
    </group>
  )
}

