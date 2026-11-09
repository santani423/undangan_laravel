import { useSyncExternalStore } from 'react';
import type { SectionId } from '../types/invitation';

/**
 * Small shared store for state that both the HTML invitation and the 3D scene
 * react to. Selectors should return primitives so subscribers only re-render
 * when their slice changes.
 */
export interface ExperienceState {
  opened: boolean;
  activeStop: number;
  activeSection: SectionId;
  galleryIndex: number;
  giftOpened: boolean;
  rsvpSubmitted: boolean;
  soundOn: boolean;
  sceneReady: boolean;
  /** 0–100, real progress from the Three.js loading manager. */
  loadProgress: number;
  /** WebGL could not start (unsupported, forced off, or the renderer crashed). */
  webglUnavailable: boolean;
  lightboxIndex: number | null;
}

type Listener = () => void;

function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(patch: Partial<T> | ((s: T) => Partial<T>)) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      let changed = false;
      for (const key in next) {
        if (!Object.is(next[key], state[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const experienceStore = createStore<ExperienceState>({
  opened: false,
  activeStop: 0,
  activeSection: 'beranda',
  galleryIndex: 0,
  giftOpened: false,
  rsvpSubmitted: false,
  soundOn: false,
  sceneReady: false,
  loadProgress: 0,
  webglUnavailable: false,
  lightboxIndex: null,
});

export function useExperience<S>(selector: (s: ExperienceState) => S): S {
  return useSyncExternalStore(
    experienceStore.subscribe,
    () => selector(experienceStore.getState()),
    () => selector(experienceStore.getState()),
  );
}

export const setExperience = experienceStore.setState;
