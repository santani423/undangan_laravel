import type { Vec3 } from './layout'

/**
 * The scroll timeline of the invitation.
 *
 * Each section owns two camera keys — `enter` (when it scrolls into place) and
 * `exit` (after its content has been read). The camera path therefore has 2N
 * keys and is sampled with the normalised parameter q / (2N - 1):
 *
 *   q ∈ [2i, 2i+1]   holding on section i (slow push-in while reading)
 *   q ∈ [2i+1, 2i+2] travelling from section i to i+1 (eased)
 *
 * `frame` shifts where the target sits on screen (fraction of viewport, +x right, +y up)
 * so HTML panels and the 3D subject never overlap.
 */
export interface CameraKey {
  pos: Vec3
  target: Vec3
}

export interface SceneEnv {
  fog: string
  fogNear: number
  fogFar: number
  /** Warm "focus" light that follows the scene's subject. */
  light: Vec3
  lightIntensity: number
  moon: number
}

export interface Waypoint {
  id: string
  enter: CameraKey
  exit: CameraKey
  frame: { desktop: [number, number]; mobile: [number, number] }
  env: SceneEnv
}

export const SECTION_IDS = ['home', 'couple', 'countdown', 'story', 'event', 'gallery', 'rsvp', 'wishes', 'closing'] as const
export type SectionId = (typeof SECTION_IDS)[number]

export const COVER_KEY: CameraKey = { pos: [0, 1.76, 15.6], target: [0, 1.76, 8] }
export const COVER_FRAME = { desktop: [0, 0.03] as [number, number], mobile: [0, 0.1] as [number, number] }

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'home',
    enter: { pos: [0, 1.85, 13.6], target: [0, 2.4, 2] },
    exit: { pos: [0, 1.75, 11.2], target: [0, 2.2, 0] },
    frame: { desktop: [0, 0.04], mobile: [0, 0.12] },
    env: { fog: '#2b2d5c', fogNear: 10, fogFar: 78, light: [0, 3.2, 6], lightIntensity: 30, moon: 1 },
  },
  {
    id: 'couple',
    enter: { pos: [-1.7, 1.55, -8.4], target: [0, 1.05, -16] },
    exit: { pos: [-1.2, 1.4, -9.8], target: [0, 1.0, -16] },
    frame: { desktop: [0.21, 0.02], mobile: [0, 0.2] },
    env: { fog: '#2a2b58', fogNear: 8, fogFar: 62, light: [0.5, 3.2, -12.5], lightIntensity: 26, moon: 0.9 },
  },
  {
    id: 'countdown',
    enter: { pos: [2.3, 2.15, -23.6], target: [8, 2.3, -30] },
    exit: { pos: [3.0, 2.0, -24.7], target: [8, 2.4, -30] },
    frame: { desktop: [-0.21, 0], mobile: [0, 0.2] },
    env: { fog: '#252a57', fogNear: 8, fogFar: 62, light: [6.5, 3.6, -27.5], lightIntensity: 18, moon: 1.35 },
  },
  {
    id: 'story',
    enter: { pos: [-0.4, 2.3, -36.2], target: [-6.4, 2.0, -43] },
    exit: { pos: [-1.6, 2.0, -40.2], target: [-8.2, 1.7, -46.5] },
    frame: { desktop: [0.22, 0], mobile: [0, 0.2] },
    env: { fog: '#2c2a58', fogNear: 8, fogFar: 60, light: [-5.5, 3.2, -41.5], lightIntensity: 28, moon: 0.95 },
  },
  {
    id: 'event',
    enter: { pos: [0.6, 2.6, -49.8], target: [0, 2.1, -66] },
    exit: { pos: [0.2, 2.1, -55.4], target: [0, 2.0, -66] },
    frame: { desktop: [-0.22, 0.02], mobile: [0, 0.2] },
    env: { fog: '#352f62', fogNear: 10, fogFar: 72, light: [0, 4, -63], lightIntensity: 46, moon: 1.1 },
  },
  {
    id: 'gallery',
    enter: { pos: [2.4, 2.15, -73.2], target: [9.5, 2.3, -81] },
    exit: { pos: [3.4, 2.05, -75.2], target: [9.8, 2.2, -81.5] },
    frame: { desktop: [0.22, 0], mobile: [0, 0.2] },
    env: { fog: '#2a2c5a', fogNear: 8, fogFar: 62, light: [8, 3.6, -78.5], lightIntensity: 24, moon: 1 },
  },
  {
    id: 'rsvp',
    enter: { pos: [-1.4, 1.95, -88.6], target: [-8, 1.9, -96.5] },
    exit: { pos: [-2.2, 1.8, -90.4], target: [-8.2, 1.9, -96.5] },
    frame: { desktop: [-0.22, 0], mobile: [0, 0.2] },
    env: { fog: '#33305e', fogNear: 9, fogFar: 64, light: [-7, 3.4, -94], lightIntensity: 40, moon: 0.95 },
  },
  {
    id: 'wishes',
    enter: { pos: [2.4, 2.4, -100.2], target: [0, 3.6, -114] },
    exit: { pos: [1.6, 2.6, -102.8], target: [0, 3.8, -114] },
    frame: { desktop: [0.21, 0], mobile: [0, 0.18] },
    env: { fog: '#262a56', fogNear: 10, fogFar: 70, light: [1, 5, -109], lightIntensity: 30, moon: 1.2 },
  },
  {
    id: 'closing',
    enter: { pos: [0, 5.2, -101.5], target: [0, 8.6, -126] },
    exit: { pos: [0, 6.1, -103.6], target: [0, 9.4, -126] },
    frame: { desktop: [0, -0.06], mobile: [0, 0.06] },
    env: { fog: '#1d2046', fogNear: 14, fogFar: 110, light: [0, 6, -111], lightIntensity: 18, moon: 1.6 },
  },
]

/** Portrait screens: pull the camera back so subjects fit the narrow horizontal field of view. */
export const MOBILE_PULLBACK = 1.38
export const FOV = { desktop: 48, mobile: 56 }
