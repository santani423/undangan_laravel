import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Lazy, non-suspending texture loading for non-critical images (gallery
 * photos, portrait, sign illustrations). SVGs are rasterised through a canvas
 * with an explicit size so every browser can upload them to WebGL; failures
 * fall back to a pack illustration instead of breaking the scene.
 */

export interface DrawOptions {
    width: number;
    height: number;
    fit: 'cover' | 'contain';
    background?: string;
    /** Clip to a circle (round signs, portrait). */
    circle?: boolean;
    /** Fraction of the canvas left empty around a `contain` image. */
    padding?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Image failed: ${src}`));
        img.src = src;
    });
}

async function loadSvg(url: string, size: number) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SVG failed (${res.status}): ${url}`);
    const text = (await res.text()).replace(/<svg\b([^>]*)>/, (match, attrs: string) =>
        /\swidth=/.test(attrs) ? match : `<svg${attrs} width="${size}" height="${size}">`,
    );
    const blobUrl = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
    try {
        return await loadImage(blobUrl);
    } finally {
        URL.revokeObjectURL(blobUrl);
    }
}

const isSvg = (url: string) => /\.svg($|\?)/i.test(url) || url.startsWith('data:image/svg+xml');

function draw(img: HTMLImageElement | null, o: DrawOptions) {
    const canvas = document.createElement('canvas');
    canvas.width = o.width;
    canvas.height = o.height;
    const ctx = canvas.getContext('2d')!;
    if (o.circle) {
        ctx.beginPath();
        ctx.arc(o.width / 2, o.height / 2, Math.min(o.width, o.height) / 2, 0, Math.PI * 2);
        ctx.clip();
    }
    if (o.background) {
        ctx.fillStyle = o.background;
        ctx.fillRect(0, 0, o.width, o.height);
    }
    if (img) {
        const iw = img.naturalWidth || img.width || o.width;
        const ih = img.naturalHeight || img.height || o.height;
        const pad = o.padding ?? 0;
        const bw = o.width * (1 - pad * 2);
        const bh = o.height * (1 - pad * 2);
        const scale = o.fit === 'cover' ? Math.max(bw / iw, bh / ih) : Math.min(bw / iw, bh / ih);
        const w = iw * scale;
        const h = ih * scale;
        ctx.drawImage(img, (o.width - w) / 2, (o.height - h) / 2, w, h);
    }
    return canvas;
}

/**
 * Rasterising an SVG into a canvas is main-thread work; queue it so each
 * texture is drawn in its own idle period instead of several in one frame.
 */
const idle = (fn: () => void) =>
    typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 50);
let idleChain: Promise<unknown> = Promise.resolve();
function whenIdle<T>(work: () => T): Promise<T> {
    const next = idleChain.then(() => new Promise<T>((resolve) => idle(() => resolve(work()))));
    idleChain = next.catch(() => undefined);
    return next;
}

const cache = new Map<string, Promise<THREE.Texture>>();

export function loadCanvasTexture(url: string, options: DrawOptions, fallbackUrl?: string): Promise<THREE.Texture> {
    const key = JSON.stringify([url, options, fallbackUrl]);
    let promise = cache.get(key);
    if (!promise) {
        const size = Math.max(options.width, options.height);
        const get = (u: string) => (isSvg(u) ? loadSvg(u, size) : loadImage(u));
        promise = get(url)
            .catch(async (err) => {
                console.warn('[ToyWorld] texture fallback:', err);
                if (!fallbackUrl) return null;
                return get(fallbackUrl).catch(() => null);
            })
            .then((img) =>
                whenIdle(() => {
                    const texture = new THREE.CanvasTexture(draw(img, { ...options, background: options.background ?? '#efe6ff' }));
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.anisotropy = 4;
                    texture.needsUpdate = true;
                    return texture;
                }),
            );
        cache.set(key, promise);
    }
    return promise;
}

export function useCanvasTexture(url: string | null | undefined, options: DrawOptions, fallbackUrl?: string) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const optionsKey = JSON.stringify(options);

    useEffect(() => {
        if (!url) return;
        let alive = true;
        void loadCanvasTexture(url, JSON.parse(optionsKey) as DrawOptions, fallbackUrl).then((t) => {
            if (alive) setTexture(t);
        });
        return () => {
            alive = false;
        };
    }, [url, optionsKey, fallbackUrl]);

    return texture;
}
