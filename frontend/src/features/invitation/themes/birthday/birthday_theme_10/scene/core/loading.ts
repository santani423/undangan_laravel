import * as THREE from 'three';

/**
 * Loading manager for the scene's critical textures; replaces drei's
 * `useProgress` (which hooks three's global DefaultLoadingManager).
 */
export const loadingManager = new THREE.LoadingManager();

type Listener = (progress: number) => void;
const listeners = new Set<Listener>();
let progress = 0;

loadingManager.onProgress = (_url, loaded, total) => {
    progress = total > 0 ? (loaded / total) * 100 : 100;
    listeners.forEach((l) => l(progress));
};
loadingManager.onError = (url) => console.warn(`[ToyWorld] gagal memuat ${url}`);

export function getLoadProgress() {
    return progress;
}

export function onLoadProgress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
