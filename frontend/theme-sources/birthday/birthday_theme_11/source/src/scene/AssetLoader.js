import * as THREE from 'three';
import { loadImage } from './textures.js';
import { assetUrl } from '../utils/helpers.js';

export { assetUrl };

/**
 * Loads images used as 3D textures. A failed image never throws: it is reported,
 * stored as null, and the artwork code draws a placeholder instead.
 * @param {Record<string, string>} sources key → url
 */
export async function loadImages(sources, onProgress = () => {}) {
  const entries = Object.entries(sources);
  const images = new Map();
  let done = 0;
  await Promise.all(
    entries.map(async ([key, url]) => {
      try {
        images.set(key, await loadImage(assetUrl(url)));
      } catch (err) {
        console.warn(`[assets] ${err.message}. A placeholder will be used.`);
        images.set(key, null);
      }
      onProgress(++done / entries.length);
    }),
  );
  return images;
}

/**
 * Loads an optional GLB/GLTF model. Returns null (and logs a warning) on failure so the
 * procedural fallback stays in place. GLTFLoader is only downloaded when a model is configured.
 */
export async function loadOptionalModel(url, { targetHeight } = {}) {
  if (!url) return null;
  try {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(assetUrl(url));
    const object = gltf.scene;
    if (targetHeight) normalizeModel(object, targetHeight);
    object.userData.animations = gltf.animations;
    return object;
  } catch (err) {
    console.warn(`[assets] Optional model "${url}" could not be loaded (${err.message}). Keeping the built-in model.`);
    return null;
  }
}

/** Scales a model to `height` units and stands it on y = 0, centred on x/z. */
export function normalizeModel(object, height) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) object.scale.multiplyScalar(height / size.y);
  box.setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
  return object;
}
