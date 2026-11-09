import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { mulberry32 } from '../geometry'
import { useMats } from '../materials'

export interface PlantInstance {
  p: [number, number, number]
  s: number
  r: number
  /** colour variation 0–1 */
  hue?: number
}

/* ═════════════ geometry builders (run once per variant, shared by all instances) ═════════════ */

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)

/**
 * Tapered tube along a spline with parallel-transport frames, metre UVs (u around, v along) and a
 * per-vertex wind weight. Used for trunks, branches, palm stems and roots.
 */
function taperTube(points: THREE.Vector3[], r0: number, r1: number, radial: number, lengthSeg: number, wind: (p: THREE.Vector3) => number, flare = 0) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  const frames = curve.computeFrenetFrames(lengthSeg, false)
  const total = curve.getLength()
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const aw: number[] = []
  const idx: number[] = []
  const P = V()
  const N = V()
  const circ = Math.PI * 2 * r0
  for (let i = 0; i <= lengthSeg; i++) {
    const t = i / lengthSeg
    curve.getPointAt(t, P)
    let r = THREE.MathUtils.lerp(r0, r1, Math.pow(t, 0.85))
    if (flare > 0 && t < 0.12) r *= 1 + flare * Math.pow(1 - t / 0.12, 2)
    const T = frames.normals[i]
    const Bn = frames.binormals[i]
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2
      // slight lobing so trunks aren't perfect cylinders
      const lobe = flare > 0 && t < 0.15 ? 1 + 0.18 * Math.cos(a * 4) * (1 - t / 0.15) : 1
      N.copy(T).multiplyScalar(Math.cos(a)).addScaledVector(Bn, Math.sin(a)).normalize()
      const x = P.x + N.x * r * lobe
      const y = P.y + N.y * r * lobe
      const z = P.z + N.z * r * lobe
      pos.push(x, y, z)
      nor.push(N.x, N.y, N.z)
      uv.push((j / radial) * circ, t * total)
      aw.push(wind(V(x, y, z)))
    }
  }
  for (let i = 0; i < lengthSeg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j
      const b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setAttribute('aWind', new THREE.Float32BufferAttribute(aw, 1))
  g.setIndex(idx)
  return g
}

/**
 * Foliage cards: square quads carrying a leaf-cluster texture. Normals are "canopy normals"
 * (pointing out of the crown and slightly up) so the crown shades like a soft volume.
 */
function leafCards(cards: { p: THREE.Vector3; size: number; rot: THREE.Euler }[], center: THREE.Vector3, wind: (p: THREE.Vector3) => number) {
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  const aw: number[] = []
  const idx: number[] = []
  const corners = [
    [-0.5, -0.5, 0, 0],
    [0.5, -0.5, 1, 0],
    [0.5, 0.5, 1, 1],
    [-0.5, 0.5, 0, 1],
  ]
  const q = new THREE.Quaternion()
  const v = V()
  const n = V()
  let base = 0
  for (const c of cards) {
    q.setFromEuler(c.rot)
    n.copy(c.p).sub(center)
    n.y = n.y * 0.6 + Math.max(0.4, n.length() * 0.5)
    n.normalize()
    for (const [x, y, u, w] of corners) {
      v.set(x * c.size, y * c.size, 0).applyQuaternion(q).add(c.p)
      pos.push(v.x, v.y, v.z)
      nor.push(n.x, n.y, n.z)
      uv.push(u, w)
      aw.push(wind(v))
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
    base += 4
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setAttribute('aWind', new THREE.Float32BufferAttribute(aw, 1))
  g.setIndex(idx)
  return g
}

export type TreeStyle = 'round' | 'banyan' | 'compact'

interface TreeGeometry {
  wood: THREE.BufferGeometry
  leaves: THREE.BufferGeometry
  leavesLite: THREE.BufferGeometry
  /** crown radius (for contact shadows) */
  spread: number
}

/** Recursive branching tree: flared trunk → scaffold branches → secondary twigs → leaf clusters. */
function buildTree(style: TreeStyle, seed: number): TreeGeometry {
  const r = mulberry32(seed)
  const cfg = {
    round: { trunkH: 3.4, trunkR: 0.26, spread: 3.3, mains: 5, secs: 3, leaf: 1.35, clusters: 7, rise: 0.9 },
    banyan: { trunkH: 3.0, trunkR: 0.5, spread: 6.2, mains: 7, secs: 3, leaf: 1.6, clusters: 8, rise: 0.55 },
    compact: { trunkH: 2.1, trunkR: 0.16, spread: 1.9, mains: 5, secs: 3, leaf: 1.0, clusters: 6, rise: 1.0 },
  }[style]
  const crownH = cfg.trunkH + cfg.spread * cfg.rise
  const wind = (p: THREE.Vector3) => THREE.MathUtils.clamp((Math.hypot(p.x, p.z) / cfg.spread) * 0.75 + Math.max(0, p.y - cfg.trunkH * 0.6) / (crownH * 1.6), 0, 1.2)
  const woods: THREE.BufferGeometry[] = []
  const cards: { p: THREE.Vector3; size: number; rot: THREE.Euler }[] = []
  const center = V(0, cfg.trunkH + cfg.spread * cfg.rise * 0.45, 0)

  // trunk with a gentle S-curve
  const lean = V((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4)
  const trunkPts = [V(0, 0, 0), V(lean.x * 0.3, cfg.trunkH * 0.35, lean.z * 0.3), V(lean.x * 0.8, cfg.trunkH * 0.75, lean.z * 0.8), V(lean.x, cfg.trunkH, lean.z)]
  woods.push(taperTube(trunkPts, cfg.trunkR, cfg.trunkR * 0.55, 9, 8, wind, style === 'banyan' ? 1.4 : 0.8))
  const trunkCurve = new THREE.CatmullRomCurve3(trunkPts)

  const addCluster = (at: THREE.Vector3, size: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const p = at.clone().add(V((r() - 0.5) * size * 0.9, (r() - 0.3) * size * 0.6, (r() - 0.5) * size * 0.9))
      cards.push({ p, size: size * (0.75 + r() * 0.5), rot: new THREE.Euler((r() - 0.5) * 1.6, r() * Math.PI * 2, (r() - 0.5) * 1.2, 'YXZ') })
    }
  }

  for (let i = 0; i < cfg.mains; i++) {
    const t0 = 0.55 + r() * 0.4
    const start = trunkCurve.getPointAt(t0)
    const ang = (i / cfg.mains) * Math.PI * 2 + r() * 0.6
    const tilt = THREE.MathUtils.degToRad(style === 'banyan' ? 62 + r() * 18 : 38 + r() * 22)
    const len = cfg.spread * (0.7 + r() * 0.35)
    const dir = V(Math.cos(ang) * Math.sin(tilt), Math.cos(tilt), Math.sin(ang) * Math.sin(tilt))
    const mid = start.clone().addScaledVector(dir, len * 0.5).add(V(0, len * 0.08, 0))
    const end = start.clone().addScaledVector(dir, len).add(V(0, len * 0.22 * cfg.rise, 0))
    const rMain = cfg.trunkR * (0.5 + r() * 0.12)
    woods.push(taperTube([start, mid, end], rMain, rMain * 0.25, 6, 6, wind))
    const mainCurve = new THREE.CatmullRomCurve3([start, mid, end])
    addCluster(end, cfg.leaf, cfg.clusters)

    for (let j = 0; j < cfg.secs; j++) {
      const ts = 0.35 + r() * 0.55
      const s0 = mainCurve.getPointAt(ts)
      const a2 = ang + (r() - 0.5) * 2.2
      const tilt2 = THREE.MathUtils.degToRad(30 + r() * 45)
      const l2 = len * (0.35 + r() * 0.3)
      const d2 = V(Math.cos(a2) * Math.sin(tilt2), Math.cos(tilt2), Math.sin(a2) * Math.sin(tilt2))
      const e2 = s0.clone().addScaledVector(d2, l2)
      const m2 = s0.clone().lerp(e2, 0.5).add(V(0, l2 * 0.1, 0))
      woods.push(taperTube([s0, m2, e2], rMain * 0.45, rMain * 0.12, 5, 3, wind))
      addCluster(e2, cfg.leaf * 0.9, Math.ceil(cfg.clusters * 0.7))
      addCluster(s0.clone().lerp(e2, 0.55), cfg.leaf * 0.8, 2)
    }

    // banyan aerial roots hanging from scaffold branches
    if (style === 'banyan') {
      for (let k = 0; k < 3; k++) {
        const top = mainCurve.getPointAt(0.35 + r() * 0.55)
        const bottom = V(top.x + (r() - 0.5) * 0.3, r() > 0.5 ? 0 : top.y * (0.25 + r() * 0.35), top.z + (r() - 0.5) * 0.3)
        woods.push(taperTube([top, top.clone().lerp(bottom, 0.5).add(V((r() - 0.5) * 0.2, 0, 0)), bottom], 0.035, 0.02, 4, 3, () => 0))
      }
    }
  }
  // fill the crown interior so it never reads hollow
  for (let i = 0; i < Math.round(cfg.clusters * 1.5); i++) {
    const a = r() * Math.PI * 2
    const d = cfg.spread * (0.25 + r() * 0.45)
    addCluster(V(Math.cos(a) * d, center.y + (r() - 0.2) * cfg.spread * 0.4, Math.sin(a) * d), cfg.leaf * 0.9, 2)
  }

  const wood = mergeGeometries(woods, false)!
  woods.forEach((g) => g.dispose())
  const leaves = leafCards(cards, center, wind)
  // lite LOD: every other card, slightly larger, for distant instances
  const lite = leafCards(
    cards.filter((_, i) => i % 2 === 0).map((c) => ({ ...c, size: c.size * 1.25 })),
    center,
    wind,
  )
  return { wood, leaves, leavesLite: lite, spread: cfg.spread }
}

function buildPalm() {
  const top = V(1.0, 7.6, 0)
  const pts = [V(0, 0, 0), V(0.55, 2.6, 0), V(1.0, 5.2, 0), top]
  const wind = (p: THREE.Vector3) => THREE.MathUtils.clamp((p.y / 7.6) * 0.15, 0, 0.15)
  const trunk = taperTube(pts, 0.2, 0.13, 8, 14, wind, 0.6)
  const fronds: THREE.BufferGeometry[] = []
  const n = 15
  for (let i = 0; i < n; i++) {
    const len = 3.1 + (i % 4) * 0.3
    const droop = 1.6 + (i % 3) * 0.5 + (i < 4 ? -0.9 : 0)
    const g = new THREE.PlaneGeometry(1.15, len, 2, 12)
    const p = g.attributes.position as THREE.BufferAttribute
    const w = new Float32Array(p.count)
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k)
      const t = (p.getY(k) + len / 2) / len
      const y = Math.sin(t * Math.PI * 0.5) * 0.85 - t * t * droop - Math.abs(x) * 0.28
      p.setXYZ(k, x * (1 - t * 0.35), y, t * len)
      w[k] = 0.15 + t * 0.9
    }
    g.setAttribute('aWind', new THREE.BufferAttribute(w, 1))
    g.computeVertexNormals()
    // canopy normals: blend toward up so the crown isn't dark underneath
    const nr = g.attributes.normal as THREE.BufferAttribute
    for (let k = 0; k < nr.count; k++) {
      const ny = Math.abs(nr.getY(k))
      nr.setXYZ(k, nr.getX(k) * 0.4, 0.6 + ny * 0.4, nr.getZ(k) * 0.4)
    }
    g.rotateY((i / n) * Math.PI * 2 + (i % 2) * 0.2)
    g.translate(top.x, top.y + 0.05, top.z)
    fronds.push(g)
  }
  const frondGeo = mergeGeometries(fronds, false)!
  fronds.forEach((f) => f.dispose())
  return { trunk, fronds: frondGeo }
}

function buildBanana() {
  const stem = taperTube([V(0, 0, 0), V(0.03, 0.9, 0), V(0, 1.75, 0.02)], 0.13, 0.08, 7, 4, () => 0)
  const leaves: THREE.BufferGeometry[] = []
  const n = 8
  for (let i = 0; i < n; i++) {
    const len = 1.8 + (i % 3) * 0.3
    const g = new THREE.PlaneGeometry(0.62, len, 2, 10)
    const p = g.attributes.position as THREE.BufferAttribute
    const w = new Float32Array(p.count)
    for (let k = 0; k < p.count; k++) {
      const x = p.getX(k)
      const t = (p.getY(k) + len / 2) / len
      p.setXYZ(k, x, Math.sin(t * Math.PI * 0.55) * 0.9 - t * t * (0.9 + (i % 2) * 0.5) - Math.abs(x) * 0.12, t * len)
      w[k] = t
    }
    g.setAttribute('aWind', new THREE.BufferAttribute(w, 1))
    g.computeVertexNormals()
    g.rotateX(-0.25 - (i % 3) * 0.12)
    g.rotateY((i / n) * Math.PI * 2 + i * 0.37)
    g.translate(0, 1.45 + (i % 3) * 0.12, 0)
    leaves.push(g)
  }
  const leafGeo = mergeGeometries(leaves, false)!
  leaves.forEach((l) => l.dispose())
  return { stem, leaves: leafGeo }
}

function buildShrub(seed: number) {
  const r = mulberry32(seed)
  const cards: { p: THREE.Vector3; size: number; rot: THREE.Euler }[] = []
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2
    const d = r() * 0.35
    cards.push({ p: V(Math.cos(a) * d, 0.3 + r() * 0.35, Math.sin(a) * d), size: 0.5 + r() * 0.25, rot: new THREE.Euler((r() - 0.5) * 0.8, r() * Math.PI * 2, (r() - 0.5) * 0.5, 'YXZ') })
  }
  return leafCards(cards, V(0, 0.2, 0), (p) => THREE.MathUtils.clamp(p.y / 1.0, 0, 1))
}

/* ═════════════ instancing helpers ═════════════ */

function useInstances(ref: RefObject<THREE.InstancedMesh | null>, items: PlantInstance[], tint?: (i: PlantInstance, c: THREE.Color) => void) {
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const c = new THREE.Color()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    items.forEach((it, i) => {
      e.set(0, it.r, 0)
      q.setFromEuler(e)
      m.compose(v.set(...it.p), q, s.set(it.s, it.s, it.s))
      mesh.setMatrixAt(i, m)
      if (tint) {
        tint(it, c)
        mesh.setColorAt(i, c)
      }
    })
    mesh.count = items.length
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [ref, items, tint])
}

const leafTint = (it: PlantInstance, c: THREE.Color) => {
  const h = it.hue ?? 0.5
  c.setRGB(0.8 + h * 0.16, 0.84 + h * 0.12, 0.76 + h * 0.1)
}

function Instanced({ geometry, material, items, tint, shadows }: { geometry: THREE.BufferGeometry; material: THREE.Material; items: PlantInstance[]; tint?: (i: PlantInstance, c: THREE.Color) => void; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useInstances(ref, items, tint)
  if (!items.length) return null
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={shadows} receiveShadow />
}

/* ═════════════ public components ═════════════ */

export interface TreeGroup {
  style: TreeStyle
  seed: number
  leaf: 0 | 1 | 2
  near: PlantInstance[]
  far: PlantInstance[]
}

/** One tree variant (style + seed): bark tubes + leaf cards, with a lighter card set for far instances. */
export function TreeVariant({ group, shadows }: { group: TreeGroup; shadows: boolean }) {
  const m = useMats()
  const geo = useMemo(() => buildTree(group.style, group.seed), [group.style, group.seed])
  useLayoutEffect(
    () => () => {
      geo.wood.dispose()
      geo.leaves.dispose()
      geo.leavesLite.dispose()
    },
    [geo],
  )
  const leafMat = [m.leaves0, m.leaves1, m.leaves2][group.leaf]
  const all = useMemo(() => [...group.near, ...group.far], [group])
  return (
    <group>
      <Instanced geometry={geo.wood} material={m.bark} items={all} shadows={shadows} />
      <Instanced geometry={geo.leaves} material={leafMat} items={group.near} tint={leafTint} shadows={shadows} />
      <Instanced geometry={geo.leavesLite} material={leafMat} items={group.far} tint={leafTint} shadows={shadows} />
    </group>
  )
}

export const TREE_SPREAD: Record<TreeStyle, number> = { round: 3.3, banyan: 6.2, compact: 1.9 }

export function Palms({ items, shadows }: { items: PlantInstance[]; shadows: boolean }) {
  const m = useMats()
  const geo = useMemo(() => buildPalm(), [])
  useLayoutEffect(() => () => {
    geo.trunk.dispose()
    geo.fronds.dispose()
  }, [geo])
  return (
    <group>
      <Instanced geometry={geo.trunk} material={m.palmTrunk} items={items} shadows={shadows} />
      <Instanced geometry={geo.fronds} material={m.frond} items={items} tint={leafTint} shadows={shadows} />
    </group>
  )
}

export function Bananas({ items, shadows }: { items: PlantInstance[]; shadows: boolean }) {
  const m = useMats()
  const geo = useMemo(() => buildBanana(), [])
  useLayoutEffect(() => () => {
    geo.stem.dispose()
    geo.leaves.dispose()
  }, [geo])
  return (
    <group>
      <Instanced geometry={geo.stem} material={m.bananaStem} items={items} shadows={shadows} />
      <Instanced geometry={geo.leaves} material={m.bananaLeaf} items={items} tint={leafTint} shadows={shadows} />
    </group>
  )
}

/** Jasmine (melati) shrubs — leaf cards with the white flowers painted into the texture. */
export function Jasmine({ items, shadows }: { items: PlantInstance[]; shadows: boolean }) {
  const m = useMats()
  const geo = useMemo(() => buildShrub(17), [])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  return <Instanced geometry={geo} material={m.shrub} items={items} tint={leafTint} shadows={shadows} />
}

/** Instanced soft contact shadows (ambient occlusion) under every plant. */
export function PlantContacts({ spots }: { spots: { x: number; z: number; r: number }[] }) {
  const m = useMats()
  const ref = useRef<THREE.InstancedMesh>(null)
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const mat = new THREE.Matrix4()
    spots.forEach((s, i) => {
      mat.makeScale(s.r * 2, 1, s.r * 2).setPosition(s.x, 0.008, s.z)
      mesh.setMatrixAt(i, mat)
    })
    mesh.count = spots.length
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [spots])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  if (!spots.length) return null
  return <instancedMesh ref={ref} args={[geo, m.contact, spots.length]} renderOrder={1} />
}
