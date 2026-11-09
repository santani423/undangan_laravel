import { create } from 'zustand'
import { detectQualityTier, isWebGLAvailable, prefs, type QualityTier } from '../lib/device'

export type SceneStatus = 'loading' | 'ready' | 'failed' | 'disabled'

interface AppState {
  /** Cover dismissed and content unlocked. */
  opened: boolean
  /** Opening animation is running. */
  opening: boolean
  activeSection: number
  sceneStatus: SceneStatus
  /** 0–100, optional texture loading progress reported by the scene. */
  loadProgress: number
  quality: QualityTier
  /** Post-processing (bloom); switched off automatically when the frame rate drops. */
  effects: boolean
  lightboxIndex: number | null
  /** Story chapter currently in the reading area — highlights its floating 3D frame. */
  activeStory: number
  wishCount: number
  musicOn: boolean
  toast: { id: number; text: string } | null

  setOpened: (v: boolean) => void
  setOpening: (v: boolean) => void
  setActiveSection: (i: number) => void
  setSceneStatus: (s: SceneStatus) => void
  setLiteMode: (lite: boolean) => void
  setEffects: (v: boolean) => void
  setLightbox: (i: number | null) => void
  setActiveStory: (i: number) => void
  setWishCount: (n: number) => void
  setMusicOn: (v: boolean) => void
  showToast: (text: string) => void
}

const LITE_KEY = 'etf-lite-mode'
const initialStatus: SceneStatus = !isWebGLAvailable() ? 'failed' : prefs.get(LITE_KEY) === '1' ? 'disabled' : 'loading'
const initialQuality = detectQualityTier()

export const useApp = create<AppState>((set) => ({
  opened: false,
  opening: false,
  activeSection: 0,
  sceneStatus: initialStatus,
  loadProgress: 0,
  quality: initialQuality,
  effects: initialQuality === 'high',
  lightboxIndex: null,
  activeStory: 0,
  wishCount: 0,
  musicOn: false,
  toast: null,

  setOpened: (opened) => set({ opened }),
  setOpening: (opening) => set({ opening }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setSceneStatus: (sceneStatus) => set({ sceneStatus }),
  setLiteMode: (lite) => {
    prefs.set(LITE_KEY, lite ? '1' : null)
    set({ sceneStatus: lite ? 'disabled' : isWebGLAvailable() ? 'loading' : 'failed' })
  },
  setEffects: (effects) => set({ effects }),
  setLightbox: (lightboxIndex) => set({ lightboxIndex }),
  setActiveStory: (activeStory) => set({ activeStory }),
  setWishCount: (wishCount) => set({ wishCount }),
  setMusicOn: (musicOn) => set({ musicOn }),
  showToast: (text) => set({ toast: { id: Date.now(), text } }),
}))

export const isSceneActive = (s: SceneStatus) => s === 'loading' || s === 'ready'
