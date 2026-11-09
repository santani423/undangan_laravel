import { fbm2, noise2, smoothstep } from '../lib/random'

/**
 * World map of the enchanted forest. The guest walks along -Z;
 * each section of the invitation owns a clearing beside the winding path.
 */
export type Vec3 = [number, number, number]

export const FOCI = {
  envelope: [0, 1.78, 12.4] as Vec3,
  gate: [0, 0, 3] as Vec3,
  couple: [0, 0, -16] as Vec3,
  countdown: [8, 0, -30] as Vec3,
  story: [-7.5, 0, -44] as Vec3,
  event: [0, 0, -66] as Vec3,
  gallery: [9.5, 0, -81] as Vec3,
  rsvp: [-8, 0, -96] as Vec3,
  wishes: [0, 0, -114] as Vec3,
}

export const CLEARINGS: Array<{ x: number; z: number; r: number }> = [
  { x: 0, z: 8, r: 5 },
  { x: 0, z: -16, r: 6.5 },
  { x: 8, z: -30, r: 5.5 },
  { x: -7.5, z: -44, r: 6.5 },
  { x: 0, z: -61, r: 10 },
  { x: 9.5, z: -81, r: 7 },
  { x: -8, z: -96, r: 6.5 },
  { x: 0, z: -111, r: 9.5 },
]

/** Path centre line as x = f(z); smooth (cosine) interpolation between control points. */
const PATH: Array<[number, number]> = [
  [30, 0], [12, 0], [-4, 0], [-18, 0.6], [-27, 2.6], [-35, 1.2], [-44, -1.2], [-52, 0], [-70, 0],
  [-76, 1.8], [-84, 2.6], [-92, -1.6], [-100, -1.2], [-108, 0], [-130, 0],
]

export const PATH_START_Z = 26
export const PATH_END_Z = -108

export function pathX(z: number): number {
  if (z >= PATH[0][0]) return PATH[0][1]
  for (let i = 0; i < PATH.length - 1; i++) {
    const [z0, x0] = PATH[i]
    const [z1, x1] = PATH[i + 1]
    if (z <= z0 && z >= z1) {
      const t = (z0 - z) / (z0 - z1)
      const s = (1 - Math.cos(t * Math.PI)) / 2
      return x0 + (x1 - x0) * s
    }
  }
  return PATH[PATH.length - 1][1]
}

export function distToPath(x: number, z: number) {
  return Math.abs(x - pathX(z))
}

export function clearingMask(x: number, z: number, pad = 0) {
  let m = 1
  for (const c of CLEARINGS) {
    const d = Math.hypot(x - c.x, z - c.z)
    m *= smoothstep(c.r * 0.7 + pad, c.r + 5 + pad, d)
  }
  return m
}

export function insideClearing(x: number, z: number, pad = 0) {
  return CLEARINGS.some((c) => Math.hypot(x - c.x, z - c.z) < c.r + pad)
}

/** Terrain height: flat path and clearings, rolling mossy hills that rise into valley walls. */
export function groundHeight(x: number, z: number): number {
  const d = distToPath(x, z)
  const m = smoothstep(2.4, 10, d) * clearingMask(x, z)
  const hills = fbm2(x * 0.055 + 3.1, z * 0.055 - 1.7, 4) * 3.4 - 0.9
  const walls = Math.max(0, d - 16) * 0.24
  const micro = (noise2(x * 0.6, z * 0.6) - 0.5) * 0.08
  return m * (hills + walls) + micro
}

/** World direction toward the moon (normalised in the sky component). */
export const MOON_DIR: Vec3 = [0.2, 0.33, -1]
