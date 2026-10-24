import * as THREE from 'three';

// Canvas-drawn textures: labels, gradients, stripes. Everything here is generated at
// runtime, so the theme needs no bitmap texture files.

export const DISPLAY_FONT = '"Fredoka", "Nunito", system-ui, sans-serif';
export const BODY_FONT = '"Nunito", system-ui, sans-serif';

type Draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

export function canvasTexture(width: number, height: number, draw: Draw, { repeat = false } = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext('2d')!, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

/** Shrinks the font until `text` fits `maxWidth`. Returns the chosen size. */
export function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, weight = 700, family = DISPLAY_FONT) {
    let size = startSize;
    do {
        ctx.font = `${weight} ${size}px ${family}`;
        if (ctx.measureText(text).width <= maxWidth) break;
        size -= 2;
    } while (size > 10);
    return size;
}

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const words = String(text).split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

let softDot: THREE.CanvasTexture | null = null;
/** White radial falloff — glows, sparkles and smoke (tinted by the material colour). */
export function softDotTexture() {
    softDot ??= canvasTexture(128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.35, 'rgba(255,255,255,0.65)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });
    return softDot;
}

let blob: THREE.CanvasTexture | null = null;
export function blobShadowTexture() {
    blob ??= canvasTexture(128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(32,67,93,0.55)');
        g.addColorStop(0.6, 'rgba(32,67,93,0.2)');
        g.addColorStop(1, 'rgba(32,67,93,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });
    return blob;
}

/** Forgets the shared textures (they are disposed with the scene). */
export function clearTextureCache() {
    softDot = null;
    blob = null;
}

/** Diagonal candy stripes, e.g. for candles and poles. */
export function stripeTexture(colors: [string, string] = ['#ffffff', '#ff8fb7'], stripes = 6) {
    return canvasTexture(
        128,
        128,
        (ctx, w, h) => {
            ctx.fillStyle = colors[0];
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = colors[1];
            const step = w / stripes;
            for (let i = -stripes; i < stripes * 2; i += 2) {
                ctx.beginPath();
                ctx.moveTo(i * step, h);
                ctx.lineTo((i + 1) * step, h);
                ctx.lineTo((i + 1) * step + h, 0);
                ctx.lineTo(i * step + h, 0);
                ctx.closePath();
                ctx.fill();
            }
        },
        { repeat: true },
    );
}

/** Lollipop swirl for disc faces. */
export function swirlTexture(a = '#ffffff', b = '#ff8fb7') {
    return canvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = a;
        ctx.fillRect(0, 0, w, h);
        ctx.translate(w / 2, h / 2);
        ctx.strokeStyle = b;
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 7; t += 0.05) {
            const r = (t / (Math.PI * 7)) * (w / 2 - 12);
            const x = Math.cos(t) * r;
            const y = Math.sin(t) * r;
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });
}

/**
 * Loads an image for canvas artwork. Cross-origin images are requested with CORS so the
 * canvas stays untainted (WebGL refuses tainted canvases); without CORS headers the load
 * fails and the artwork draws a placeholder instead.
 */
export function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        if (!/^(data|blob):/.test(url) && new URL(url, window.location.href).origin !== window.location.origin) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Could not load image ${url}`));
        img.src = url;
    });
}

/** Draws an image "contain"-fitted into a box. */
export function drawContained(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const iw = img.naturalWidth || img.width || w;
    const ih = img.naturalHeight || img.height || h;
    const scale = Math.min(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Draws an image "cover"-fitted into a box. */
export function drawCovered(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const iw = img.naturalWidth || img.width || w;
    const ih = img.naturalHeight || img.height || h;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    ctx.restore();
}
