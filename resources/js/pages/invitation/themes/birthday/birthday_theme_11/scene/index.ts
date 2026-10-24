import { smileAssets } from '../lib/assets';
import { nextFrame } from '../lib/helpers';
import type { SmileConfig } from '../lib/types';
import type { ImageMap } from './artwork';
import { CameraController } from './CameraController';
import { clearCharacterCache } from './CharacterFactory';
import { clearPropCaches } from './PropFactory';
import type { Quality } from './quality';
import { SceneManager } from './SceneManager';
import { clearTextureCache, loadImage } from './textures';
import { loadTitleFont } from './TitleText';
import { World, type WorldHandlers } from './WorldBuilder';

/*
 * Entry point for the 3D layer (loaded lazily as its own chunk).
 * Builds the renderer, loads the images used as textures, generates the procedural world
 * and wires the scroll camera. Throws if WebGL can't start; the page then shows the
 * illustrated version.
 */

export interface Experience {
    sceneManager: SceneManager;
    world: World;
    cameraController: CameraController;
    dispose(): void;
}

interface ExperienceOptions {
    container: HTMLElement;
    config: SmileConfig;
    quality: Quality;
    reducedMotion: boolean;
    handlers: WorldHandlers;
    onProgress: (progress: number, message: string) => void;
    onContextLost: () => void;
    /** True once the page has gone away; the half-built world is then thrown away. */
    cancelled: () => boolean;
}

/** Loads images used as textures. A failed image never throws: it is stored as null and the artwork draws a placeholder. */
async function loadImages(sources: Record<string, string>, onProgress: (p: number) => void): Promise<ImageMap> {
    const entries = Object.entries(sources);
    const images: ImageMap = new Map();
    let done = 0;
    await Promise.all(
        entries.map(async ([key, url]) => {
            try {
                images.set(key, await loadImage(url));
            } catch (err) {
                console.warn(`[bt11] ${(err as Error).message}. A placeholder will be used.`);
                images.set(key, null);
            }
            onProgress(++done / entries.length);
        }),
    );
    return images;
}

export class CancelledError extends Error {}

export async function createExperience({
    container,
    config,
    quality,
    reducedMotion,
    handlers,
    onProgress,
    onContextLost,
    cancelled,
}: ExperienceOptions): Promise<Experience> {
    const sceneManager = new SceneManager(container, quality, onContextLost);
    let world: World | null = null;
    let cameraController: CameraController | null = null;
    const dispose = () => {
        world?.dispose();
        cameraController?.dispose();
        sceneManager.dispose();
        clearPropCaches();
        clearCharacterCache();
        clearTextureCache();
    };
    const checkpoint = () => {
        if (cancelled()) {
            dispose();
            throw new CancelledError('cancelled');
        }
    };

    try {
        sceneManager.resize();

        // Supplied SVGs used inside 3D artwork, plus the gallery photos for the polaroids.
        const sources: Record<string, string> = { toothFriend: smileAssets.toothFriend, balloons: smileAssets.balloons, mascot: smileAssets.mascot };
        config.gallery.slice(0, 8).forEach((photo, i) => (sources[`gallery:${i}`] = photo.src));

        onProgress(0.02, 'Membuka bungkus gambar');
        const [images, font] = await Promise.all([
            loadImages(sources, (p) => onProgress(0.02 + p * 0.18, 'Membuka bungkus gambar')),
            loadTitleFont(smileAssets.titleFont).catch((err: Error) => {
                console.warn(`[bt11] ${err.message}. Using a painted title sign instead.`);
                return null;
            }),
        ]);
        checkpoint();

        const builtWorld = new World({
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
        world = builtWorld;
        await builtWorld.build(async (p, message) => {
            onProgress(0.2 + p * 0.7, message);
            await nextFrame();
            checkpoint();
        });

        cameraController = new CameraController(sceneManager.camera, reducedMotion, quality.pointerParallax);
        sceneManager.world = builtWorld;
        sceneManager.cameraController = cameraController;

        // Compile shaders up front so the first scroll doesn't stutter.
        onProgress(0.94, 'Memoles setiap gigi');
        await nextFrame();
        checkpoint();
        sceneManager.renderer.compile(sceneManager.scene, sceneManager.camera);
        onProgress(1, 'Siap!');
        return { sceneManager, world: builtWorld, cameraController, dispose };
    } catch (err) {
        if (!(err instanceof CancelledError)) dispose();
        throw err;
    }
}
