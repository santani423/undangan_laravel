import * as THREE from 'three';

/**
 * Procedural canvas textures — generated once at runtime, so the scene never
 * depends on downloadable texture files.
 */
const cache = new Map<string, THREE.Texture>();

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    cache.set(key, tex);
    return { tex, redraw: () => (draw(ctx, w, h), (tex.needsUpdate = true)) };
}

function texture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
    return cache.get(key) ?? make(key, w, h, draw, srgb).tex;
}

export function disposeTextures() {
    cache.forEach((t) => t.dispose());
    cache.clear();
}

/** Soft round glow for sprites. */
export function glowTexture() {
    return texture('glow', 128, 128, (ctx, w) => {
        const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
    });
}

/** Billowy mist puff. */
export function mistTexture() {
    return texture('mist', 256, 128, (ctx, w, h) => {
        let seed = 7;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 26; i++) {
            const x = w * (0.15 + rnd() * 0.7);
            const y = h * (0.35 + rnd() * 0.35);
            const r = h * (0.18 + rnd() * 0.25);
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(255,255,255,0.22)');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }
    });
}

/** Storybook moon with gentle craters. */
export function moonTexture() {
    return texture('moon', 512, 512, (ctx, w) => {
        const c = w / 2;
        const r = w * 0.46;
        ctx.save();
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.clip();
        const g = ctx.createRadialGradient(c - r * 0.3, c - r * 0.3, r * 0.1, c, c, r);
        g.addColorStop(0, '#fffaf0');
        g.addColorStop(0.7, '#f6ecd6');
        g.addColorStop(1, '#cfd9ee');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, w);
        const craters: Array<[number, number, number]> = [
            [0.38, 0.4, 0.08],
            [0.6, 0.33, 0.05],
            [0.55, 0.62, 0.1],
            [0.3, 0.64, 0.05],
            [0.7, 0.5, 0.04],
            [0.45, 0.25, 0.035],
        ];
        for (const [x, y, s] of craters) {
            const cg = ctx.createRadialGradient(x * w, y * w, 0, x * w, y * w, s * w);
            cg.addColorStop(0, 'rgba(185,180,215,0.35)');
            cg.addColorStop(1, 'rgba(185,180,215,0)');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(x * w, y * w, s * w, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });
}

/** Horizontal alpha falloff for the path ribbon (u across the path). */
export function pathAlphaTexture() {
    return texture(
        'path-alpha',
        256,
        16,
        (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, w, 0);
            g.addColorStop(0, 'rgba(0,0,0,1)');
            g.addColorStop(0.22, 'rgba(255,255,255,1)');
            g.addColorStop(0.78, 'rgba(255,255,255,1)');
            g.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        },
        false,
    );
}

/** Gold dashed rune ring for the moon platform. */
export function runeRingTexture() {
    return texture('rune', 512, 512, (ctx, w) => {
        const c = w / 2;
        ctx.strokeStyle = 'rgba(255,240,200,0.95)';
        ctx.lineCap = 'round';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(c, c, w * 0.44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c, c, w * 0.36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 8;
        for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            const r0 = w * (i % 2 ? 0.385 : 0.375);
            const r1 = w * (i % 2 ? 0.41 : 0.425);
            ctx.beginPath();
            ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
            ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
            ctx.stroke();
        }
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const x = c + Math.cos(a) * w * 0.4;
            const y = c + Math.sin(a) * w * 0.4;
            ctx.fillStyle = 'rgba(255,248,238,1)';
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

/** Invitation card face with monogram — decorative only; real names live in HTML. */
export function letterTexture([a, b]: [string, string]) {
    const key = `letter-${a}${b}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const { tex, redraw } = make(key, 512, 360, (ctx, w, h) => {
        ctx.fillStyle = '#fff8ee';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#e6c27a';
        ctx.lineWidth = 6;
        ctx.strokeRect(18, 18, w - 36, h - 36);
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, w - 64, h - 64);
        ctx.fillStyle = '#8580B7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic 600 120px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(`${a}`, w / 2 - 70, h / 2 - 6);
        ctx.fillText(`${b}`, w / 2 + 70, h / 2 - 6);
        ctx.fillStyle = '#d9a0b2';
        ctx.font = '400 60px Georgia, serif';
        ctx.fillText('&', w / 2, h / 2 + 4);
        ctx.fillStyle = '#c9a75e';
        for (const x of [w / 2 - 110, w / 2 + 110]) {
            ctx.beginPath();
            ctx.arc(x, h - 70, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillRect(w / 2 - 90, h - 71, 180, 2);
    });
    // The display font is a webfont: draw again once it is available.
    void document.fonts
        ?.load('italic 600 120px "Cormorant Garamond"')
        .then((faces) => faces.length > 0 && cache.get(key) === tex && redraw())
        .catch(() => {});
    return tex;
}

/** Small script tag for the wishing tree. */
export function wishTagTexture() {
    return texture('wish-tag', 64, 96, (ctx, w, h) => {
        ctx.fillStyle = '#fff8ee';
        ctx.beginPath();
        ctx.roundRect(4, 10, w - 8, h - 14, 10);
        ctx.fill();
        ctx.fillStyle = '#e6c27a';
        ctx.beginPath();
        ctx.arc(w / 2, 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(133,128,183,0.7)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(14, 40 + i * 12);
            ctx.lineTo(w - 14 - (i % 2) * 10, 40 + i * 12);
            ctx.stroke();
        }
    });
}
