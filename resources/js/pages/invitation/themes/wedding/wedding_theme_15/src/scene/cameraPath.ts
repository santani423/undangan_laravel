import * as THREE from 'three'
import { COVER_KEY, MOBILE_PULLBACK, WAYPOINTS, type CameraKey } from './waypoints'

function pulled(key: CameraKey, mobile: boolean) {
  const target = new THREE.Vector3(...key.target)
  const pos = new THREE.Vector3(...key.pos)
  if (mobile) pos.sub(target).multiplyScalar(MOBILE_PULLBACK).add(target)
  return { pos, target }
}

/** Camera position/target curves through the 2N waypoint keys (see waypoints.ts). */
export function buildCameraCurves(mobile: boolean) {
  const pos: THREE.Vector3[] = []
  const target: THREE.Vector3[] = []
  for (const w of WAYPOINTS) {
    for (const key of [w.enter, w.exit]) {
      const k = pulled(key, mobile)
      pos.push(k.pos)
      target.push(k.target)
    }
  }
  return {
    pos: new THREE.CatmullRomCurve3(pos, false, 'centripetal'),
    target: new THREE.CatmullRomCurve3(target, false, 'centripetal'),
    cover: pulled(COVER_KEY, mobile),
  }
}

/**
 * Spatial index of the points where the camera rests (both layouts, plus the opening glide).
 * Scatter code asks it to keep lanterns, trees and plants from spawning in front of the lens.
 */
const CELL = 2
let grid: Map<string, Array<[number, number]>> | null = null

function buildGrid() {
  const g = new Map<string, Array<[number, number]>>()
  const add = (x: number, z: number) => {
    const key = `${Math.floor(x / CELL)},${Math.floor(z / CELL)}`
    const list = g.get(key) ?? []
    list.push([x, z])
    g.set(key, list)
  }
  const n = WAYPOINTS.length * 2 - 1
  for (const mobile of [false, true]) {
    const c = buildCameraCurves(mobile)
    // Only where the camera rests: each section's hold segment (q = 2i … 2i+1) plus a little margin.
    for (let i = 0; i < WAYPOINTS.length; i++) {
      for (let k = 0; k <= 30; k++) {
        const q = Math.min(n, Math.max(0, 2 * i - 0.15 + (k / 30) * 1.3))
        const p = c.pos.getPoint(q / n)
        add(p.x, p.z)
      }
    }
    const start = c.pos.getPoint(0)
    for (let i = 0; i <= 40; i++) {
      const p = c.cover.pos.clone().lerp(start, i / 40)
      add(p.x, p.z)
    }
  }
  return g
}

export function nearCameraPath(x: number, z: number, r: number): boolean {
  grid ??= buildGrid()
  const span = Math.ceil(r / CELL)
  const gx = Math.floor(x / CELL)
  const gz = Math.floor(z / CELL)
  for (let i = -span; i <= span; i++)
    for (let j = -span; j <= span; j++)
      for (const [px, pz] of grid.get(`${gx + i},${gz + j}`) ?? []) if ((px - x) ** 2 + (pz - z) ** 2 < r * r) return true
  return false
}
