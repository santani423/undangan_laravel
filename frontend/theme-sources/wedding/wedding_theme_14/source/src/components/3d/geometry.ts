import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Geometry helpers. All UVs are in METRES so a material's texture.repeat (1 / tileSize)
 * gives constant texel density on every surface, regardless of object size.
 */

const cache = new Map<string, THREE.BufferGeometry>()

function cached(key: string, make: () => THREE.BufferGeometry) {
  let g = cache.get(key)
  if (!g) {
    g = make()
    cache.set(key, g)
  }
  return g
}

/**
 * Chamfered box with box-projected metre UVs (u horizontal / v vertical on side faces).
 * The small bevel catches light along every edge, so timber and stone read as solid, finished
 * pieces instead of razor-edged polygons.
 */
export function boxGeo(w: number, h: number, d: number): THREE.BufferGeometry {
  const key = `box:${w.toFixed(3)}:${h.toFixed(3)}:${d.toFixed(3)}`
  return cached(key, () => {
    const r = Math.min(0.016, Math.min(w, h, d) * 0.18)
    const g = r < 0.002 ? new THREE.BoxGeometry(w, h, d).toNonIndexed() : new RoundedBoxGeometry(w, h, d, 1, r)
    const pos = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute
    const perFace = pos.count / 6
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      const side = Math.floor(i / perFace)
      // +x, -x, +y, -y, +z, -z
      const [u, v] = side === 0 ? [-z, y] : side === 1 ? [z, y] : side === 2 ? [x, -z] : side === 3 ? [x, z] : side === 4 ? [x, y] : [-x, y]
      uv.setXY(i, u + w, v + h)
    }
    uv.needsUpdate = true
    return g
  })
}

/** Thin fascia band (lisplang) around a roof eave: four vertical strips, outward-facing. */
export function fasciaGeo(bw: number, bd: number, t: number): THREE.BufferGeometry {
  return cached(`fascia:${bw}:${bd}:${t}`, () => {
    const parts: THREE.BufferGeometry[] = []
    const strip = (len: number) => {
      const g = new THREE.PlaneGeometry(len, t)
      const uv = g.attributes.uv as THREE.BufferAttribute
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len, uv.getY(i) * t)
      return g
    }
    const front = strip(bw)
    front.translate(0, -t / 2, bd / 2)
    const back = strip(bw)
    back.rotateY(Math.PI)
    back.translate(0, -t / 2, -bd / 2)
    const right = strip(bd)
    right.rotateY(Math.PI / 2)
    right.translate(bw / 2, -t / 2, 0)
    const left = strip(bd)
    left.rotateY(-Math.PI / 2)
    left.translate(-bw / 2, -t / 2, 0)
    parts.push(front, back, right, left)
    const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()), false)!
    parts.forEach((p) => p.dispose())
    return merged
  })
}

/** Cylinder with metre UVs (u around circumference, v along height). */
export function cylGeo(rTop: number, rBottom: number, h: number, seg = 16): THREE.BufferGeometry {
  const key = `cyl:${rTop}:${rBottom}:${h}:${seg}`
  return cached(key, () => {
    const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1)
    const uv = g.attributes.uv as THREE.BufferAttribute
    const circ = Math.PI * 2 * Math.max(rTop, rBottom)
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * circ, uv.getY(i) * h)
    uv.needsUpdate = true
    return g
  })
}

/**
 * Hip-roof frustum (joglo / limasan roof layer). Bottom rectangle bw×bd at y=0,
 * top rectangle tw×td at y=h. td≈0 makes a ridge. Includes metre UVs along each slope.
 */
export function hipRoofGeo(bw: number, bd: number, tw: number, td: number, h: number): THREE.BufferGeometry {
  const key = `roof:${bw}:${bd}:${tw}:${td}:${h}`
  return cached(key, () => {
    const B = [
      new THREE.Vector3(-bw / 2, 0, bd / 2),
      new THREE.Vector3(bw / 2, 0, bd / 2),
      new THREE.Vector3(bw / 2, 0, -bd / 2),
      new THREE.Vector3(-bw / 2, 0, -bd / 2),
    ]
    const T = [
      new THREE.Vector3(-tw / 2, h, td / 2),
      new THREE.Vector3(tw / 2, h, td / 2),
      new THREE.Vector3(tw / 2, h, -td / 2),
      new THREE.Vector3(-tw / 2, h, -td / 2),
    ]
    const pos: number[] = []
    const uvs: number[] = []
    const pushQuad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
      // a,b bottom (left→right seen from outside), c,d top (right→left)
      const bottomLen = a.distanceTo(b)
      const slope = a.clone().add(b).multiplyScalar(0.5).distanceTo(d.clone().add(c).multiplyScalar(0.5))
      const topLen = d.distanceTo(c)
      const inset = (bottomLen - topLen) / 2
      const quad: [THREE.Vector3, number, number][] = [
        [a, 0, 0],
        [b, bottomLen, 0],
        [c, inset + topLen, slope],
        [d, inset, slope],
      ]
      for (const i of [0, 1, 2, 0, 2, 3]) {
        const [v, u, w] = quad[i]
        pos.push(v.x, v.y, v.z)
        uvs.push(u, w)
      }
    }
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4
      pushQuad(B[i], B[j], T[j], T[i])
    }
    if (tw > 0.01 && td > 0.01) {
      // top cap
      const cap: [THREE.Vector3, number, number][] = T.map((v) => [v, v.x + tw / 2, v.z + td / 2])
      for (const i of [0, 1, 2, 0, 2, 3]) {
        const [v, u, w] = cap[i]
        pos.push(v.x, v.y, v.z)
        uvs.push(u, w)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.computeVertexNormals()
    return g
  })
}

/** Flat quad lying on XZ with metre UVs. */
export function planeGeo(w: number, d: number): THREE.BufferGeometry {
  const key = `plane:${w}:${d}`
  return cached(key, () => {
    const g = new THREE.PlaneGeometry(w, d)
    g.rotateX(-Math.PI / 2)
    const uv = g.attributes.uv as THREE.BufferAttribute
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d)
    uv.needsUpdate = true
    return g
  })
}

/** Upright quad (XY) with 0–1 UVs — for photos & decals. */
export function quadGeo(w: number, h: number): THREE.BufferGeometry {
  return cached(`quad:${w}:${h}`, () => new THREE.PlaneGeometry(w, h))
}

/** Deterministic PRNG so the world is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pointInRects(x: number, z: number, rects: [number, number, number, number][], pad = 0) {
  for (const [x0, x1, z0, z1] of rects) {
    if (x >= x0 - pad && x <= x1 + pad && z >= z0 - pad && z <= z1 + pad) return true
  }
  return false
}

/** Distance from point to a polyline (2D). */
export function distToPolyline(x: number, z: number, pts: [number, number][]) {
  let best = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i]
    const [bx, bz] = pts[i + 1]
    const dx = bx - ax
    const dz = bz - az
    const len2 = dx * dx + dz * dz || 1
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2))
    const px = ax + dx * t
    const pz = az + dz * t
    best = Math.min(best, Math.hypot(x - px, z - pz))
  }
  return best
}
