import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { World } from './WorldBuilder.js';
import { loadTitleFont } from './TitleText.js';
import { assetUrl, loadImages, loadOptionalModel } from './AssetLoader.js';
import { applyTheme } from './Materials.js';
import { nextFrame } from '../utils/helpers.js';

/*
 * Entry point for the 3D layer (loaded lazily as its own chunk).
 * Builds the renderer, loads the images used as textures, generates the procedural world
 * and wires the scroll camera. Throws if WebGL can't start; main.js then uses the HTML fallback.
 */
export async function createExperience({ canvas, config, quality, reducedMotion, handlers, onProgress = () => {}, onContextLost }) {
  applyTheme(config.theme);
  const sceneManager = new SceneManager(canvas, { quality, reducedMotion, onContextLost });
  sceneManager.resize();

  // Supplied SVGs used inside 3D artwork, plus the gallery photos for the polaroids.
  const sources = {
    toothFriend: '/assets/images/tooth-friend.svg',
    balloons: '/assets/images/balloons.svg',
    mascot: '/assets/images/dr-smiley.svg',
  };
  config.gallery.slice(0, 8).forEach((photo, i) => (sources[`gallery:${i}`] = photo.src));

  onProgress(0.02, 'Unwrapping the pictures');
  const [images, font] = await Promise.all([
    loadImages(sources, (p) => onProgress(0.02 + p * 0.18, 'Unwrapping the pictures')),
    loadTitleFont(assetUrl('/assets/fonts/fredoka-bold.typeface.json')).catch((err) => {
      console.warn(`[3d] ${err.message}. Using a painted title sign instead.`);
      return null;
    }),
  ]);

  const world = new World({
    scene: sceneManager.scene,
    materials: sceneManager.materials,
    quality,
    config,
    images,
    font,
    handlers,
    reducedMotion,
    pixelRatio: sceneManager.pixelRatio,
  });
  await world.build(async (p, message) => {
    onProgress(0.2 + p * 0.7, message);
    await nextFrame();
  });

  const cameraController = new CameraController(sceneManager.camera, { reducedMotion, parallax: quality.pointerParallax });
  sceneManager.setWorld(world);
  sceneManager.setCameraController(cameraController);

  // Compile shaders up front so the first scroll doesn't stutter.
  onProgress(0.94, 'Polishing every tooth');
  await nextFrame();
  sceneManager.renderer.compile(sceneManager.scene, sceneManager.camera);
  onProgress(1, 'Ready!');

  return { sceneManager, world, cameraController, THREE };
}

/**
 * Swaps procedural models for optional GLB files listed in config.models.
 * Runs after the intro so it never delays the first paint. Missing files are skipped.
 */
export async function applyOptionalModels(world, models = {}) {
  const tasks = [];
  if (models.mascot) {
    tasks.push(
      loadOptionalModel(models.mascot, { targetHeight: 2.1 }).then((object) => {
        if (object) world.useCustomCharacter(world.mascot, object);
      }),
    );
  }
  if (models.toothFriend) {
    tasks.push(
      loadOptionalModel(models.toothFriend, { targetHeight: 2.1 }).then(async (object) => {
        if (!object) return;
        const { clone } = await import('three/addons/utils/SkeletonUtils.js');
        world.friends.forEach((friend, i) => world.useCustomCharacter(friend, i === 0 ? object : Object.assign(clone(object), { userData: { ...object.userData } })));
      }),
    );
  }
  if (models.cake) {
    tasks.push(
      loadOptionalModel(models.cake, { targetHeight: world.cake ? world.cake.topY : 3.2 }).then((object) => {
        if (object) world.useCustomCake(object);
      }),
    );
  }
  await Promise.all(tasks);
}
