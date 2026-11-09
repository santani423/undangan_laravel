import type { SceneConfig } from './types'

/**
 * Scroll choreography. Progress is normalized 0 → 1 over the whole journey.
 * Ranges start from the brief's suggested split and were tuned for reading time.
 */
export const SCENES: SceneConfig[] = [
  { id: 'gate', label: 'Sampul', javanese: 'Regol', range: [0, 0.1], panel: { in: 0, out: 0.03, side: 'center' }, navAt: 0 },
  { id: 'pendopo', label: 'Mempelai', javanese: 'Pendhapa', range: [0.1, 0.25], panel: { in: 0.122, out: 0.208, side: 'right' }, navAt: 0.165 },
  { id: 'garden', label: 'Hitung Mundur', javanese: 'Taman Sari', range: [0.25, 0.39], panel: { in: 0.28, out: 0.358, side: 'left' }, navAt: 0.315 },
  { id: 'ceremony', label: 'Acara', javanese: 'Pawiwahan', range: [0.39, 0.53], panel: { in: 0.414, out: 0.508, side: 'right' }, navAt: 0.46 },
  { id: 'gallery', label: 'Galeri', javanese: 'Pringgitan', range: [0.53, 0.63], panel: { in: 0.55, out: 0.618, side: 'left' }, navAt: 0.58 },
  { id: 'story', label: 'Kisah Kasih', javanese: 'Serat Katresnan', range: [0.63, 0.72], panel: { in: 0.652, out: 0.708, side: 'right' }, navAt: 0.69 },
  { id: 'rsvp', label: 'RSVP & Ucapan', javanese: 'Among Tamu', range: [0.72, 0.85], panel: { in: 0.75, out: 0.836, side: 'left' }, navAt: 0.79 },
  { id: 'gift', label: 'Tanda Kasih', javanese: 'Tanda Katresnan', range: [0.85, 0.94], panel: { in: 0.874, out: 0.926, side: 'right' }, navAt: 0.9 },
  { id: 'closing', label: 'Penutup', javanese: 'Panutup', range: [0.94, 1], panel: { in: 0.958, out: 1.01, side: 'left' }, navAt: 1 },
]

/** Story milestones reveal one by one inside the story panel. */
export const STORY_REVEAL_START = 0.656
export const STORY_REVEAL_STEP = 0.011

/** Total scroll length expressed in viewport heights. */
export const JOURNEY_SCREENS = 19

/** Panel fade length in progress units. */
export const PANEL_FADE = 0.012

export function sceneIndexAt(progress: number): number {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (progress >= SCENES[i].range[0]) return i
  }
  return 0
}
