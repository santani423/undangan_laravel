import { LoadingManager } from 'three';
import { sceneStatus } from './sceneStatus';

/**
 * Loading manager of the garden's own assets (models, palette, textures).
 * A dedicated manager keeps three.js' global DefaultLoadingManager untouched
 * for other themes rendered in the same session.
 */
export const loadingManager = new LoadingManager();

loadingManager.onStart = () => {
    if (sceneStatus.get().phase !== 'ready') sceneStatus.set({ phase: 'loading' });
};
loadingManager.onProgress = (_url, loaded, total) => {
    if (sceneStatus.get().phase !== 'ready') sceneStatus.set({ phase: 'loading', progress: total > 0 ? loaded / total : 0 });
};
