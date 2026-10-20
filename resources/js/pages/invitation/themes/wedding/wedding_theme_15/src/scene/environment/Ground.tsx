import { useMemo } from 'react'
import * as THREE from 'three'
import type { QualityTier } from '../../lib/device'
import { fbm2, mulberry32, range, smoothstep } from '../../lib/random'
import { CLEARINGS, PATH_END_Z, PATH_START_Z, distToPath, groundHeight, pathX } from '../layout'
import { clayMaterial } from '../materials'
import { pathAlphaTexture } from '../textures'
import { buildGlowData, GlowPoints } from '../effects/GlowPoints'
import { Instanced, useDisposable, type InstanceItem } from '../Instanced'
import { rockGeometry } from '../geometry'

const C = {
  mossA: new THREE.Color('#2b4548'),
  mossB: new THREE.Color('#383a63'),
  pathEdge: new THREE.Color('#4d5a6c'),
  clearing: new THREE.Color('#47645f'),
  high: new THREE.Color('#262a4c'),
}

export function Ground({ quality }: { quality: QualityTier }) {
  const geometry = useDisposable(() => {
    const segX = quality === 'high' ? 150 : quality === 'medium' ? 110 : 80
    const segZ = quality === 'high' ? 210 : quality === 'medium' ? 150 : 110
    const g = new THREE.PlaneGeometry(150, 190, segX, segZ)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, -55)
    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = groundHeight(x, z)
      pos.setY(i, y)
      const n = fbm2(x * 0.09, z * 0.09, 3)
      c.copy(C.mossA).lerp(C.mossB, smoothstep(0.3, 0.75, n))
      c.lerp(C.pathEdge, 1 - smoothstep(1.4, 4.5, distToPath(x, z)))
      for (const cl of CLEARINGS) {
        const d = Math.hypot(x - cl.x, z - cl.z)
        c.lerp(C.clearing, (1 - smoothstep(cl.r * 0.4, cl.r + 2, d)) * 0.55)
      }
      c.lerp(C.high, smoothstep(1.5, 7, y) * 0.8)
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [quality])
  const material = useDisposable(() => clayMaterial({ vertexColors: true, roughness: 0.97, rimStrength: 0.06 }), [])

  return <mesh geometry={geometry} material={material} receiveShadow={false} />
}

/** Winding moonlit path: soft-edged ribbon, stepping stones and glowing pebbles. */
export function ForestPath() {
  const geometry = useDisposable(() => {
    const verts: number[] = []
    const uvs: number[] = []
    const idx: number[] = []
    let dist = 0
    let prev: [number, number] | null = null
    let row = 0
    for (let z = PATH_START_Z; z >= PATH_END_Z; z -= 0.4) {
      const x = pathX(z)
      const dxdz = (pathX(z - 0.05) - pathX(z + 0.05)) / 0.1
      const len = Math.hypot(dxdz, 1)
      const nx = 1 / len
      const nz = dxdz / len
      const taper = smoothstep(PATH_START_Z, PATH_START_Z - 6, z) * smoothstep(PATH_END_Z, PATH_END_Z + 5, z)
      const hw = (1.15 + Math.sin(z * 0.37) * 0.14) * (0.4 + 0.6 * taper)
      if (prev) dist += Math.hypot(x - prev[0], z - prev[1])
      prev = [x, z]
      for (const side of [-1, 1]) {
        const px = x + nx * hw * side
        const pz = z + nz * hw * side
        verts.push(px, groundHeight(px, pz) + 0.035, pz)
        uvs.push(side < 0 ? 0 : 1, dist / 3)
      }
      if (row > 0) {
        const a = (row - 1) * 2
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      }
      row++
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  const material = useDisposable(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8d82ad',
        roughness: 1,
        alphaMap: pathAlphaTexture(),
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    [],
  )

  const { stones, pebbles } = useMemo(() => {
    const rng = mulberry32(7)
    const stones: InstanceItem[] = []
    const glow: Parameters<typeof buildGlowData>[0] = []
    let side = 1
    for (let z = PATH_START_Z - 3; z > PATH_END_Z + 2; z -= range(rng, 0.9, 1.4)) {
      const x = pathX(z) + range(rng, -0.45, 0.45)
      const s = range(rng, 0.2, 0.34)
      stones.push({ p: [x, groundHeight(x, z) + 0.01, z], r: [0, rng() * 6, 0], s: [s, s * 0.35, s * 0.8], c: '#a39cc4' })
    }
    for (let z = PATH_START_Z - 2; z > PATH_END_Z; z -= range(rng, 1.3, 1.9)) {
      side *= -1
      const x = pathX(z) + side * range(rng, 1.25, 1.6)
      glow.push({ p: [x, groundHeight(x, z) + 0.06, z], color: rng() < 0.75 ? '#b9d5f2' : '#f2c5d2', size: range(rng, 0.16, 0.26), intensity: 1.5 })
    }
    return { stones, pebbles: buildGlowData(glow) }
  }, [])
  const stoneGeo = useDisposable(() => rockGeometry(3), [])
  const stoneMat = useDisposable(() => clayMaterial({ roughness: 0.9, rimStrength: 0.2 }), [])

  return (
    <group>
      <mesh geometry={geometry} material={material} renderOrder={1} />
      <Instanced geometry={stoneGeo} material={stoneMat} items={stones} />
      <GlowPoints data={pebbles} twinkle={0.35} fadeNear={26} fadeFar={52} />
    </group>
  )
}
