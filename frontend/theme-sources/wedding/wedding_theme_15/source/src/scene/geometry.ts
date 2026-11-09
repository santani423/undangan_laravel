import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { noise2 } from '../lib/random'

/**
 * Procedural, stylised geometry. Every model in the forest is built from these
 * so the scene needs no external model files and stays art-directed and cohesive.
 */

function noise3(x: number, y: number, z: number) {
  return (noise2(x + z * 0.7, y - z * 0.3) + noise2(y * 1.3 - x * 0.2, z + 5.1)) * 0.5
}

/** Vertical gradient baked into vertex colours — cheap stylised ambient occlusion. */
export function bakeGradient(g: THREE.BufferGeometry, bottom: number, top: number, yMin?: number, yMax?: number) {
  g.computeBoundingBox()
  const bb = g.boundingBox!
  const y0 = yMin ?? bb.min.y
  const y1 = yMax ?? bb.max.y
  const pos = g.attributes.position
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getY(i) - y0) / (y1 - y0 || 1), 0, 1)
    const v = bottom + (top - bottom) * t
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = v
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return g
}

/** Lumpy rounded blob (tree canopy, bushes, moss mounds). */
export function blobGeometry(detail = 3, amp = 0.14, freq = 1.6, seed = 0) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail)
  g.deleteAttribute('normal')
  g.deleteAttribute('uv')
  g = mergeVertices(g)
  const pos = g.attributes.position
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    const n = noise3(p.x * freq + seed, p.y * freq, p.z * freq - seed)
    p.multiplyScalar(1 + (n - 0.5) * 2 * amp)
    // Slightly flattened underside like a hand-sculpted canopy.
    if (p.y < 0) p.y *= 0.72
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  g.computeVertexNormals()
  return bakeGradient(g, 0.5, 1.08)
}

/** Stacked pine tier. */
export function coneGeometry(seed = 0) {
  let g: THREE.BufferGeometry = new THREE.ConeGeometry(1, 1.5, 10, 4, false)
  g.deleteAttribute('uv')
  g.deleteAttribute('normal')
  g = mergeVertices(g)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const k = 1 + (noise3(x * 2 + seed, y * 2, z * 2) - 0.5) * 0.22
    // Droop the rim downward for a softer storybook silhouette.
    const rim = y < -0.7 ? -0.12 * Math.hypot(x, z) : 0
    pos.setXYZ(i, x * k, y + rim, z * k)
  }
  g.computeVertexNormals()
  return bakeGradient(g, 0.55, 1.05)
}

export function trunkGeometry() {
  const g = new THREE.CylinderGeometry(0.11, 0.2, 1, 7, 3)
  g.translate(0, 0.5, 0)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    pos.setX(i, pos.getX(i) + Math.sin(y * 2.4) * 0.03)
  }
  g.computeVertexNormals()
  return bakeGradient(g, 0.55, 1)
}

/** Profile-based solid of revolution. */
export function lathe(points: Array<[number, number]>, segments = 24) {
  const g = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
  g.computeVertexNormals()
  return g
}

export function mushroomStemGeometry() {
  return bakeGradient(lathe([[0, 0], [0.09, 0], [0.075, 0.12], [0.065, 0.3], [0.07, 0.36], [0, 0.36]], 10), 0.7, 1)
}

export function mushroomCapGeometry() {
  // Bottom centre → rim → dome top, so the lathe normals face outward.
  const pts: Array<[number, number]> = [[0.0001, 0.31], [0.2, 0.32]]
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    pts.push([Math.max(0.0001, Math.cos(a) * 0.24), 0.34 + Math.sin(a) * 0.17])
  }
  return bakeGradient(lathe(pts, 12), 0.75, 1.05)
}

export function grassTuftGeometry() {
  const blades: THREE.BufferGeometry[] = []
  for (let i = 0; i < 5; i++) {
    const b = new THREE.ConeGeometry(0.035, 0.32 + (i % 3) * 0.08, 3, 1, true)
    b.translate(0, 0.16, 0)
    b.rotateZ((i - 2) * 0.22)
    b.rotateY(i * 1.3)
    b.translate((i - 2) * 0.03, 0, ((i * 7) % 3) * 0.02 - 0.02)
    blades.push(b)
  }
  const g = mergeGeometries(blades)!
  return bakeGradient(g, 0.45, 1.1)
}

export function flowerHeadGeometry() {
  const petals: THREE.BufferGeometry[] = []
  // Low-poly on purpose: hundreds of these are a few pixels tall.
  for (let i = 0; i < 5; i++) {
    const p = new THREE.SphereGeometry(0.045, 4, 2)
    p.scale(1, 0.45, 0.7)
    p.translate(0.045, 0, 0)
    p.rotateY((i / 5) * Math.PI * 2)
    petals.push(p)
  }
  const g = mergeGeometries(petals)!
  g.translate(0, 0.28, 0)
  return g
}

export function flowerStemGeometry() {
  const g = new THREE.CylinderGeometry(0.008, 0.012, 0.28, 4)
  g.translate(0, 0.14, 0)
  return g
}

export function rockGeometry(seed = 1) {
  let g: THREE.BufferGeometry = new THREE.DodecahedronGeometry(1, 1)
  g.deleteAttribute('uv')
  g.deleteAttribute('normal')
  g = mergeVertices(g)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const k = 1 + (noise3(x * 1.4 + seed, y * 1.4, z * 1.4) - 0.5) * 0.35
    pos.setXYZ(i, x * k, Math.max(y * k * 0.62, -0.25), z * k)
  }
  g.computeVertexNormals()
  return g
}

/** Rounded paper lantern body, centred on its middle. */
export function lanternGeometry() {
  const g = lathe(
    [[0.0001, -0.2], [0.09, -0.2], [0.15, -0.14], [0.175, -0.03], [0.17, 0.08], [0.13, 0.17], [0.07, 0.21], [0.0001, 0.21]],
    14,
  )
  return g
}

/** Teardrop petal, double sided. */
export function petalGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, -0.06)
  s.bezierCurveTo(0.055, -0.03, 0.05, 0.04, 0, 0.07)
  s.bezierCurveTo(-0.05, 0.04, -0.055, -0.03, 0, -0.06)
  const g = new THREE.ShapeGeometry(s, 6)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.pow(pos.getX(i) * 12, 2) * 0.01)
  g.computeVertexNormals()
  return g
}

/** Heart shape for wax seal and decorations. */
export function heartShape(size = 1) {
  const s = new THREE.Shape()
  const k = size
  s.moveTo(0, -0.9 * k)
  s.bezierCurveTo(-0.15 * k, -0.7 * k, -1 * k, -0.2 * k, -1 * k, 0.3 * k)
  s.bezierCurveTo(-1 * k, 0.8 * k, -0.4 * k, 1 * k, 0, 0.55 * k)
  s.bezierCurveTo(0.4 * k, 1 * k, 1 * k, 0.8 * k, 1 * k, 0.3 * k)
  s.bezierCurveTo(1 * k, -0.2 * k, 0.15 * k, -0.7 * k, 0, -0.9 * k)
  return s
}

/** Five-petal blossom facing +Y, centred at the origin (garlands, arch, tree). */
export function blossomGeometry() {
  const parts: THREE.BufferGeometry[] = []
  for (let i = 0; i < 5; i++) {
    const p = new THREE.SphereGeometry(0.05, 5, 3)
    p.scale(1, 0.42, 0.72)
    p.translate(0.048, 0, 0)
    p.rotateY((i / 5) * Math.PI * 2)
    parts.push(p)
  }
  parts.push(new THREE.SphereGeometry(0.026, 5, 3).scale(1, 0.7, 1).translate(0, 0.012, 0))
  return mergeGeometries(parts)!
}

export function leafGeometry() {
  const g = new THREE.SphereGeometry(0.06, 5, 3)
  g.scale(0.55, 0.16, 1.25)
  g.translate(0, 0, 0.06)
  return g
}
