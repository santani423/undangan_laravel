// Samples the camera route and reports the closest approach to every vertical obstacle.
import * as THREE from 'three'
import { CameraPath } from '../src/components/3d/cameraPath'
import { WORLD } from '../src/config/world'

type Obs = { name: string; x: number; z: number; r: number; yTop: number; yBot?: number }
const obs: Obs[] = []
const joglo = (name: string, cx: number, cz: number, size: number, plat: number) => {
  const k = size / 14
  const g = 2.2 * k
  const o = 5.5 * k
  for (const [x, z] of [[g, g], [-g, g], [g, -g], [-g, -g]]) obs.push({ name: `${name} guru`, x: cx + x, z: cz + z, r: 0.17 * k + 0.3, yTop: plat + 5 * k })
  const grid = [-5.5, -1.8, 1.8, 5.5].map((v) => v * k)
  for (const x of grid) for (const z of [o, -o]) obs.push({ name: `${name} outer`, x: cx + x, z: cz + z, r: 0.25, yTop: plat + 3.4 * k })
  for (const z of grid.slice(1, 3)) for (const x of [o, -o]) obs.push({ name: `${name} outer`, x: cx + x, z: cz + z, r: 0.25, yTop: plat + 3.4 * k })
}
joglo('pendopo', 0, -24, 14, 0.6)
joglo('ceremony', 32, -66, 12, 0.5)
const c = WORLD.corridor
for (let x = c.xStart; x >= c.xEnd; x -= 4) obs.push({ name: 'corridor pillar', x, z: c.z + c.width / 2 - 0.2, r: 0.25, yTop: 3 })
for (let x = c.xStart; x >= c.xEnd + 8; x -= 4) obs.push({ name: 'corridor lantern', x: x - 2, z: c.z + 1.5, r: 0.2, yTop: 3.2, yBot: 2.2 })
const lim = (name: string, cx: number, cz: number, w: number, d: number) => {
  const nx = w > 6 ? 3 : 2
  for (let i = 0; i < nx; i++) {
    const x = -w / 2 + 0.3 + (i * (w - 0.6)) / (nx - 1)
    for (const z of [d / 2 - 0.3, -d / 2 + 0.3]) obs.push({ name: `${name} pillar`, x: cx + x, z: cz + z, r: 0.25, yTop: 3 })
  }
}
lim('reception', -19, -45.5, 6.4, 5)
lim('story', -17, -63, 7.8, 7.8)
for (const s of [-1, 1]) obs.push({ name: 'gate pillar', x: s * 2.55, z: 0, r: 1.3, yTop: 6 })
for (const z of [7, 15, 23, 31]) for (const x of [-7.6, 7.6]) obs.push({ name: 'avenue tree', x, z, r: 0.4, yTop: 6 })

const path = new CameraPath()
const p = new THREE.Vector3()
const t = new THREE.Vector3()
const worst = new Map<string, { d: number; at: number }>()
for (let i = 0; i <= 4000; i++) {
  const prog = i / 4000
  path.sample(prog, p, t)
  for (const o of obs) {
    if (p.y > o.yTop || (o.yBot !== undefined && p.y < o.yBot - 0.3)) continue
    const d = Math.hypot(p.x - o.x, p.z - o.z) - o.r
    const key = `${o.name} @(${o.x.toFixed(1)},${o.z.toFixed(1)})`
    const w = worst.get(key)
    if (!w || d < w.d) worst.set(key, { d, at: prog })
  }
}
const list = [...worst.entries()].sort((a, b) => a[1].d - b[1].d).slice(0, 12)
for (const [k, v] of list) console.log(v.d.toFixed(2).padStart(6), 'm clearance at', v.at.toFixed(3), k)
