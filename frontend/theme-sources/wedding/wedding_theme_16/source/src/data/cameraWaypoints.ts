import type { SectionId } from './sections';

export type Vec3 = [number, number, number];

export interface CameraWaypoint {
  id: 'cover' | SectionId;
  position: Vec3;
  target: Vec3;
  /**
   * Side of the screen occupied by the HTML card on wide viewports. The camera
   * applies a lens shift so the 3D focal point sits on the opposite side.
   */
  contentSide: 'left' | 'right' | 'center';
  /** 0 = bright afternoon, 1 = golden-hour dusk with glowing lanterns. */
  dusk: number;
}

/**
 * One continuous journey through the garden. Index 0 is the cover; index i
 * (i ≥ 1) belongs to SECTIONS[i - 1]. Positions are in world units (≈ metres).
 * `src/scene/cameraPath.test.ts` verifies the interpolated path never clips
 * into props or terrain.
 */
export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  { id: 'cover', position: [6, 10, 45], target: [-1, 1.4, 11], contentSide: 'center', dusk: 0.05 },
  { id: 'beranda', position: [0, 2.3, 28], target: [0, 2.6, 16], contentSide: 'center', dusk: 0 },
  { id: 'mempelai', position: [-0.3, 2.6, 14.4], target: [-11, 1.6, 7.5], contentSide: 'right', dusk: 0.04 },
  { id: 'acara', position: [-1.5, 3.0, 2.5], target: [9.5, 1.8, -4.5], contentSide: 'left', dusk: 0.08 },
  { id: 'lokasi', position: [17, 19, 9], target: [3.5, 0, -14], contentSide: 'left', dusk: 0.12 },
  { id: 'kisah', position: [4, 2.4, -8], target: [0.5, 1.2, -27], contentSide: 'left', dusk: 0.28 },
  { id: 'galeri', position: [-4.2, 2.3, -24], target: [5.5, 1.5, -34.5], contentSide: 'left', dusk: 0.34 },
  { id: 'rsvp', position: [1.4, 2.8, -35.5], target: [-8.2, 1.0, -43.2], contentSide: 'right', dusk: 0.44 },
  { id: 'buku-tamu', position: [-2.6, 2.8, -43.6], target: [7, 2.4, -50.5], contentSide: 'left', dusk: 0.54 },
  { id: 'dress-code', position: [2.2, 2.5, -50.4], target: [-7.2, 1.3, -57], contentSide: 'right', dusk: 0.62 },
  { id: 'hadiah', position: [1.6, 2.4, -54.6], target: [9.8, 1.1, -60.8], contentSide: 'left', dusk: 0.74 },
  { id: 'penutup', position: [0, 2.6, -57.5], target: [0, 3.9, -72], contentSide: 'left', dusk: 1 },
];

export const WAYPOINT_COUNT = CAMERA_WAYPOINTS.length;
