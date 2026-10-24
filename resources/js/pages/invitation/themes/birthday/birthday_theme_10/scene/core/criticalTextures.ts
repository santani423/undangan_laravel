import { use } from 'react';
import * as THREE from 'three';
import { loadingManager } from './loading';

/**
 * Suspense-friendly loader for the scene's critical textures. Reports to the
 * theme's own loading manager (so the loading screen shows real progress
 * without touching three's global DefaultLoadingManager) but never throws: a
 * failed asset resolves to `null` and callers use a generated substitute
 * instead of taking the whole 3D world down.
 */
const promises = new Map<string, Promise<THREE.Texture | null>>();
const loader = new THREE.TextureLoader(loadingManager);

function loadTexture(url: string) {
    let promise = promises.get(url);
    if (!promise) {
        promise = new Promise((resolve) => {
            loader.load(
                url,
                (texture) => resolve(texture),
                undefined,
                () => {
                    console.warn(`[ToyWorld] missing asset, using generated fallback: ${url}`);
                    resolve(null);
                },
            );
        });
        promises.set(url, promise);
    }
    return promise;
}

export function useSafeTexture(url: string): THREE.Texture | null {
    return use(loadTexture(url));
}

/** Starts loading in parallel so later `useSafeTexture` calls don't suspend one after another. */
export function preloadSafeTextures(urls: string[]) {
    urls.forEach(loadTexture);
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    draw(canvas.getContext('2d')!);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

let softParticle: THREE.Texture | null = null;
/** Radial glow used if sprites/soft-particle.png is unavailable. */
export function fallbackSoftParticle() {
    return (softParticle ??= canvasTexture(64, (ctx) => {
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,0.85)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
    }));
}

let confetti: THREE.Texture | null = null;
/** 4×4 sheet of coloured paper pieces used if sprites/confetti-sprite.png is unavailable. */
export function fallbackConfetti() {
    return (confetti ??= canvasTexture(256, (ctx) => {
        const colors = ['#ff7b84', '#ffd166', '#7fdcb0', '#7cc7f0', '#b9a6f2'];
        for (let i = 0; i < 16; i++) {
            const x = (i % 4) * 64 + 32;
            const y = Math.floor(i / 4) * 64 + 32;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            if (i % 3 === 0) ctx.arc(x, y, 9, 0, Math.PI * 2);
            else ctx.roundRect(x - 6, y - 14, 12, 28, 4);
            ctx.fill();
        }
    }));
}
