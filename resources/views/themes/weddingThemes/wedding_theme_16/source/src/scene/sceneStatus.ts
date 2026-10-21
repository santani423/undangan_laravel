import { useSyncExternalStore } from 'react';

/**
 * Loading state of the lazily-loaded 3D scene, readable from the main bundle
 * without importing three.js.
 */
export interface SceneStatus {
  phase: 'idle' | 'loading' | 'ready' | 'failed';
  /** 0–1 */
  progress: number;
}

let state: SceneStatus = { phase: 'idle', progress: 0 };
const listeners = new Set<() => void>();

export const sceneStatus = {
  get: (): SceneStatus => state,
  set(partial: Partial<SceneStatus>): void {
    const next = { ...state, ...partial };
    if (next.phase === state.phase && next.progress === state.progress) return;
    state = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSceneStatus(): SceneStatus {
  return useSyncExternalStore(sceneStatus.subscribe, sceneStatus.get, sceneStatus.get);
}
