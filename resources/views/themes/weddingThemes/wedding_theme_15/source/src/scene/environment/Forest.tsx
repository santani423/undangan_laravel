import { useMemo } from 'react'
import * as THREE from 'three'
import type { QualityTier } from '../../lib/device'
import { mulberry32, pick, range } from '../../lib/random'
import { distToPath, groundHeight, insideClearing, pathX } from '../layout'
import { blobGeometry, coneGeometry, trunkGeometry } from '../geometry'
import { clayMaterial } from '../materials'
import { Instanced, useDisposable, type InstanceItem } from '../Instanced'
import { nearCameraPath } from '../cameraPath'

const ROUND = ['#2f5762', '#36616b', '#3c5079', '#2f4b60', '#476689', '#55548f', '#3d6a6a']
const PINE = ['#244a52', '#2a5157', '#2f4766', '#273f5c', '#2d5a5c']
const BLOSSOM = ['#9d86c6', '#c497c4', '#b7a3dc', '#e0aecb']

interface TreeSets {
  trunks: InstanceItem[]
  blobs: InstanceItem[]
  cones: InstanceItem[]
  silhouettes: InstanceItem[]
}

const COUNTS: Record<QualityTier, number> = { high: 460, medium: 300, low: 190 }

function scatter(quality: QualityTier): TreeSets {
  const rng = mulberry32(1234)
  const sets: TreeSets = { trunks: [], blobs: [], cones: [], silhouettes: [] }
  const grid = new Map<string, Array<[number, number, number]>>()
  const cell = 2.5
  const fits = (x: number, z: number, r: number) => {
    const gx = Math.floor(x / cell)
    const gz = Math.floor(z / cell)
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++)
        for (const [ox, oz, or] of grid.get(`${gx + i},${gz + j}`) ?? []) if (Math.hypot(ox - x, oz - z) < (or + r) * 0.75) return false
    return true
  }
  const add = (x: number, z: number, r: number) => {
    const key = `${Math.floor(x / cell)},${Math.floor(z / cell)}`
    const list = grid.get(key) ?? []
    list.push([x, z, r])
    grid.set(key, list)
  }

  const target = COUNTS[quality]
  let placed = 0
  for (let attempt = 0; attempt < target * 40 && placed < target; attempt++) {
    const z = range(rng, 32, -138)
    const side = rng() < 0.5 ? -1 : 1
    const off = 3.3 + Math.pow(rng(), 1.5) * 38
    const x = pathX(z) + side * off
    if (insideClearing(x, z, 1.4)) continue
    const scale = 0.85 + Math.min(off, 30) * 0.028 + rng() * 0.45
    const radius = scale * 1.1
    if (!fits(x, z, radius) || nearCameraPath(x, z, 1.2 + radius)) continue
    add(x, z, radius)
    placed++

    const y = groundHeight(x, z) - 0.05
    const rot = rng() * Math.PI * 2
    const near = distToPath(x, z) < 9
    if (rng() < 0.6) {
      const h = range(rng, 1.4, 2.4) * scale
      sets.trunks.push({ p: [x, y, z], r: [0, rot, range(rng, -0.05, 0.05)], s: [scale, h, scale], c: '#5a465c' })
      const blossom = near && rng() < 0.12
      const tint = blossom ? pick(rng, BLOSSOM) : pick(rng, ROUND)
      const main = range(rng, 1.05, 1.5) * scale
      sets.blobs.push({ p: [x, y + h + main * 0.35, z], r: [0, rot, 0], s: [main, main * range(rng, 0.85, 1.05), main], c: tint })
      for (let k = 0; k < 2; k++) {
        const a = rot + k * Math.PI + range(rng, -0.4, 0.4)
        const s = main * range(rng, 0.55, 0.75)
        sets.blobs.push({
          p: [x + Math.cos(a) * main * 0.62, y + h + main * range(rng, -0.05, 0.25), z + Math.sin(a) * main * 0.62],
          r: [0, rng() * 6, 0],
          s: [s, s * 0.9, s],
          c: tint,
          ci: range(rng, 0.92, 1.08),
        })
      }
    } else {
      const h = range(rng, 0.5, 0.8) * scale
      sets.trunks.push({ p: [x, y, z], r: [0, rot, 0], s: [scale * 0.9, h, scale * 0.9], c: '#4f3e52' })
      const tint = pick(rng, PINE)
      const tiers = 3
      for (let k = 0; k < tiers; k++) {
        const s = scale * (1.25 - k * 0.3)
        sets.cones.push({ p: [x, y + h + 0.55 * scale + k * 0.85 * scale, z], r: [0, rot + k, 0], s: [s, s * 0.95, s], c: tint, ci: 1 + k * 0.06 })
      }
    }
  }

  // Distant silhouettes: dark, unlit layers that dissolve into the fog for depth.
  const ringCount = quality === 'low' ? 120 : 220
  for (let i = 0; i < ringCount; i++) {
    const z = range(rng, 40, -150)
    const side = rng() < 0.5 ? -1 : 1
    const x = side * range(rng, 42, 70)
    const s = range(rng, 3, 6)
    sets.silhouettes.push({ p: [x, groundHeight(x, z) - 1, z], s: [s, s * range(rng, 1.4, 2.4), s], c: '#1d2043' })
  }
  for (let i = 0; i < 70; i++) {
    const x = range(rng, -60, 60)
    const z = range(rng, -128, -150)
    const s = range(rng, 3, 6.5)
    sets.silhouettes.push({ p: [x, groundHeight(x, z) - 1, z], s: [s, s * range(rng, 1.4, 2.4), s], c: '#1d2043' })
  }
  return sets
}

export function Forest({ quality }: { quality: QualityTier }) {
  const sets = useMemo(() => scatter(quality), [quality])
  const trunkGeo = useDisposable(() => trunkGeometry(), [])
  const blobGeo = useDisposable(() => blobGeometry(quality === 'high' ? 3 : 2, 0.16, 1.5, 2), [quality])
  const coneGeo = useDisposable(() => coneGeometry(4), [])
  const silGeo = useDisposable(() => new THREE.ConeGeometry(1, 1.6, 7).translate(0, 0.8, 0), [])

  const trunkMat = useDisposable(() => clayMaterial({ vertexColors: true, rimStrength: 0.18 }), [])
  const canopyMat = useDisposable(() => clayMaterial({ vertexColors: true, rim: '#a49ce0', rimStrength: 0.42, rimPower: 2.2 }), [])
  const silMat = useDisposable(() => new THREE.MeshBasicMaterial({ color: '#ffffff', fog: true }), [])

  return (
    <group>
      <Instanced geometry={trunkGeo} material={trunkMat} items={sets.trunks} />
      <Instanced geometry={blobGeo} material={canopyMat} items={sets.blobs} />
      <Instanced geometry={coneGeo} material={canopyMat} items={sets.cones} />
      <Instanced geometry={silGeo} material={silMat} items={sets.silhouettes} />
    </group>
  )
}
