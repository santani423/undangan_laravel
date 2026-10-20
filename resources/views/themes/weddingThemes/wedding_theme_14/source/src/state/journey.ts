import { useSyncExternalStore } from 'react'

/**
 * Hot, per-frame journey values. GSAP writes `progress`; the render loop reads it.
 * Kept outside React state so scrolling never triggers re-renders.
 */
export const journey = {
  /** Smoothed (scrubbed) normalized progress 0–1 — drives camera, lights and objects. */
  progress: 0,
  /** 1 while the cover is shown; eased to 0 when the invitation opens. */
  intro: 1,
  /** Pointer position −1…1 for subtle parallax. */
  pointerX: 0,
  pointerY: 0,
  reducedMotion: false,
}

/* Low-frequency UI state (scene index, opened) with a tiny external store. */
type UiState = { sceneIndex: number; opened: boolean; overlay: boolean }
let ui: UiState = { sceneIndex: 0, opened: false, overlay: false }
const listeners = new Set<() => void>()

export function setUi(patch: Partial<UiState>) {
  const next = { ...ui, ...patch }
  if (next.sceneIndex === ui.sceneIndex && next.opened === ui.opened && next.overlay === ui.overlay) return
  ui = next
  listeners.forEach((l) => l())
}

export function getUi() {
  return ui
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useUi<T>(select: (s: UiState) => T): T {
  return useSyncExternalStore(subscribe, () => select(ui), () => select(ui))
}
