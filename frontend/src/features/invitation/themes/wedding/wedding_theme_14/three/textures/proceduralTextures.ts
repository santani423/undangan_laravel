import * as THREE from 'three';

/**
 * Procedural PBR texture sets (colour + normal + roughness), generated once at load time on
 * canvases. Everything tiles seamlessly (periodic noise), so materials can repeat them in metres.
 * Where the asset pack has a matching texture it is used as the source (teak grain, kawung/parang
 * reliefs, stone grain); the pack's flat "normal_placeholder" files are replaced by real normals
 * derived from those sources.
 */

export interface TexSet {
    map: THREE.Texture;
    normalMap: THREE.Texture;
    roughnessMap: THREE.Texture;
    /** metres covered by one repeat */
    tile: number;
}

/* ───────────── noise ───────────── */

function rng(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Periodic value noise: noise(u, v) with u, v in [0,1) wraps seamlessly. `freq` lattice cells per tile. */
function periodicNoise(seed: number, freqX: number, freqY = freqX) {
    const r = rng(seed);
    const g = new Float32Array(freqX * freqY);
    for (let i = 0; i < g.length; i++) g[i] = r();
    return (u: number, v: number) => {
        const x = (((u % 1) + 1) % 1) * freqX;
        const y = (((v % 1) + 1) % 1) * freqY;
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const fx = x - x0;
        const fy = y - y0;
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        const x1 = (x0 + 1) % freqX;
        const y1 = (y0 + 1) % freqY;
        const a = g[y0 * freqX + x0];
        const b = g[y0 * freqX + x1];
        const c = g[y1 * freqX + x0];
        const d = g[y1 * freqX + x1];
        return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
}

function fbm(seed: number, baseX: number, baseY: number, octaves = 4) {
    const layers = Array.from({ length: octaves }, (_, i) => periodicNoise(seed + i * 101, baseX << i, baseY << i));
    return (u: number, v: number) => {
        let s = 0;
        let amp = 0.5;
        let norm = 0;
        for (const n of layers) {
            s += n(u, v) * amp;
            norm += amp;
            amp *= 0.5;
        }
        return s / norm;
    };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// sRGB components 0–255 from a CSS hex (no colour-management conversion: these are texels)
const rgb = (h: string): [number, number, number] => {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/* ───────────── pixel buffers → textures ───────────── */

interface Buffers {
    size: number;
    color: Uint8ClampedArray;
    height: Float32Array;
    rough: Float32Array;
}

function buffers(size: number): Buffers {
    return { size, color: new Uint8ClampedArray(size * size * 4), height: new Float32Array(size * size), rough: new Float32Array(size * size) };
}

function toCanvas(size: number, data: Uint8ClampedArray) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.getContext('2d')!.putImageData(new ImageData(data as unknown as Uint8ClampedArray<ArrayBuffer>, size, size), 0, 0);
    return c;
}

function finish(b: Buffers, tile: number, normalStrength: number): TexSet {
    const { size } = b;
    const n = new Uint8ClampedArray(size * size * 4);
    const h = b.height;
    for (let y = 0; y < size; y++) {
        const ym = ((y - 1 + size) % size) * size;
        const yp = ((y + 1) % size) * size;
        const yc = y * size;
        for (let x = 0; x < size; x++) {
            const xm = (x - 1 + size) % size;
            const xp = (x + 1) % size;
            // Sobel
            const dx = h[ym + xp] + 2 * h[yc + xp] + h[yp + xp] - h[ym + xm] - 2 * h[yc + xm] - h[yp + xm];
            const dy = h[yp + xm] + 2 * h[yp + x] + h[yp + xp] - h[ym + xm] - 2 * h[ym + x] - h[ym + xp];
            let nx = -dx * normalStrength;
            let ny = dy * normalStrength; // canvas y is down; texture v is up
            let nz = 1;
            const l = Math.hypot(nx, ny, nz);
            nx /= l;
            ny /= l;
            nz /= l;
            const i = (yc + x) * 4;
            n[i] = (nx * 0.5 + 0.5) * 255;
            n[i + 1] = (ny * 0.5 + 0.5) * 255;
            n[i + 2] = (nz * 0.5 + 0.5) * 255;
            n[i + 3] = 255;
        }
    }
    const r = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
        const v = clamp01(b.rough[i]) * 255;
        // three.js reads roughness from G
        r[i * 4] = v;
        r[i * 4 + 1] = v;
        r[i * 4 + 2] = v;
        r[i * 4 + 3] = 255;
    }
    const mk = (data: Uint8ClampedArray, srgb: boolean) => {
        const t = new THREE.CanvasTexture(toCanvas(size, data));
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = 8;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        return t;
    };
    return { map: mk(b.color, true), normalMap: mk(n, false), roughnessMap: mk(r, false), tile };
}

function put(b: Buffers, i: number, c: [number, number, number], height: number, rough: number) {
    b.color[i * 4] = c[0];
    b.color[i * 4 + 1] = c[1];
    b.color[i * 4 + 2] = c[2];
    b.color[i * 4 + 3] = 255;
    b.height[i] = height;
    b.rough[i] = rough;
}

const lerp3 = (a: readonly number[], b: readonly number[], t: number): [number, number, number] => [
    mix(a[0], b[0], t),
    mix(a[1], b[1], t),
    mix(a[2], b[2], t),
];

/** Read an image (from the asset pack) into a square luminance+rgb sampler. */
function imageSampler(img: CanvasImageSource | undefined, size: number) {
    if (!img) return null;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, size, size);
    const d = g.getImageData(0, 0, size, size).data;
    return {
        rgb: (x: number, y: number): [number, number, number] => {
            const i = ((((y % size) + size) % size) * size + (((x % size) + size) % size)) * 4;
            return [d[i], d[i + 1], d[i + 2]];
        },
        lum: (x: number, y: number) => {
            const i = ((((y % size) + size) % size) * size + (((x % size) + size) % size)) * 4;
            return (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        },
    };
}

function blur(h: Float32Array, size: number, passes = 1) {
    const tmp = new Float32Array(h.length);
    for (let p = 0; p < passes; p++) {
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                let s = 0;
                for (let k = -1; k <= 1; k++) s += h[y * size + ((x + k + size) % size)];
                tmp[y * size + x] = s / 3;
            }
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                let s = 0;
                for (let k = -1; k <= 1; k++) s += tmp[((y + k + size) % size) * size + x];
                h[y * size + x] = s / 3;
            }
    }
}

/* ───────────── generators ───────────── */

/** Teak with grain running along V (vertical members) or U (horizontal members). */
export function woodTexture(size: number, along: 'v' | 'u', tone: 'teak' | 'dark', packTeak?: CanvasImageSource): TexSet {
    const b = buffers(size);
    const warp = fbm(11, 3, 2, 3);
    const fiber = periodicNoise(12, 96, 6);
    const fiber2 = periodicNoise(13, 220, 14);
    const knots = fbm(14, 2, 1, 2);
    const pack = imageSampler(packTeak, size);
    const light = rgb(tone === 'teak' ? '#8f5f3d' : '#5c3b26');
    const dark = rgb(tone === 'teak' ? '#5b3520' : '#34200f');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            let u = x / size;
            let v = y / size;
            if (along === 'u') [u, v] = [v, u];
            const w = warp(u, v) * 0.9 + knots(u, v) * 0.35;
            const ring = (u * 7 + w) % 1;
            const band = Math.pow(Math.abs(Math.sin(ring * Math.PI)), 3);
            const f = fiber(u, v) * 0.6 + fiber2(u, v) * 0.4;
            let c = lerp3(light, dark, clamp01(band * 0.7 + (1 - f) * 0.35));
            if (pack) {
                // pack teak has horizontal streaks; sample it transposed so its streaks follow the grain
                const p = along === 'v' ? pack.rgb(y, x) : pack.rgb(x, y);
                c = lerp3(c, [p[0] * 0.92, p[1] * 0.85, p[2] * 0.8], 0.28);
            }
            put(b, y * size + x, c, f * 0.6 + (1 - band) * 0.4, 0.52 + f * 0.2 + band * 0.08);
        }
    return finish(b, 1.4, 2.2);
}

/** Teak floor boards (2 m tile): staggered planks with butt joints and gaps. */
export function plankTexture(size: number, packTeak?: CanvasImageSource): TexSet {
    const b = buffers(size);
    const rows = 12;
    const r = rng(21);
    const offsets = Array.from({ length: rows }, () => r());
    const tints = Array.from({ length: rows * 3 }, () => 0.85 + r() * 0.3);
    const fiber = periodicNoise(22, 160, 8);
    const warp = fbm(23, 4, 2, 3);
    const pack = imageSampler(packTeak, size);
    const light = rgb('#8a5a39');
    const dark = rgb('#4f2f1c');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const v = y / size;
            const u = x / size;
            const row = Math.floor(v * rows);
            const inRow = v * rows - row;
            const along = (u + offsets[row]) % 1;
            const seg = Math.floor(along * 2);
            const inSeg = along * 2 - seg;
            const edgeV = Math.min(inRow, 1 - inRow) * (size / rows);
            const edgeU = Math.min(inSeg, 1 - inSeg) * (size / 2);
            const gap = edgeV < 1.2 || edgeU < 1.2;
            const tint = tints[row * 2 + seg];
            const ring = (v * 40 + warp(u, v) * 2.5 + row * 0.37) % 1;
            const band = Math.pow(Math.abs(Math.sin(ring * Math.PI)), 4);
            const f = fiber(u + offsets[row], v);
            let c = lerp3(light, dark, clamp01(band * 0.55 + (1 - f) * 0.3));
            if (pack) c = lerp3(c, pack.rgb(x, y), 0.22);
            c = [c[0] * tint, c[1] * tint, c[2] * tint];
            if (gap) c = [c[0] * 0.3, c[1] * 0.28, c[2] * 0.26];
            const bevel = clamp01(Math.min(edgeU, edgeV) / 3);
            put(b, y * size + x, c, gap ? 0 : 0.6 + bevel * 0.3 + f * 0.1, gap ? 0.95 : 0.48 + f * 0.15);
        }
    return finish(b, 2, 3);
}

/** Ubin / tegel floor tiles (2 m tile, 40 cm tiles) — polished terrazzo with recessed grout. */
export function floorTileTexture(size: number): TexSet {
    const b = buffers(size);
    const n = 5;
    const r = rng(31);
    const tints = Array.from({ length: n * n }, () => 0.9 + r() * 0.16);
    const speck = periodicNoise(32, 180);
    const cloud = fbm(33, 4, 4, 4);
    const base = rgb('#b9ab93');
    const warm = rgb('#9f8a6c');
    const grout = rgb('#5d554a');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const u = (x / size) * n;
            const v = (y / size) * n;
            const tx = Math.floor(u);
            const ty = Math.floor(v);
            const e = Math.min(u - tx, 1 - (u - tx), v - ty, 1 - (v - ty)) * (size / n);
            const s = speck(x / size, y / size);
            const cl = cloud(x / size, y / size);
            let c = lerp3(base, warm, clamp01(cl * 1.2 - 0.2));
            if (s > 0.78) c = lerp3(c, [70, 60, 50], 0.6);
            else if (s < 0.12) c = lerp3(c, [235, 225, 205], 0.5);
            const t = tints[ty * n + tx];
            c = [c[0] * t, c[1] * t, c[2] * t];
            const isGrout = e < 2;
            if (isGrout) c = grout;
            put(b, y * size + x, c, isGrout ? 0 : clamp01(e / 4) * 0.8 + 0.2, isGrout ? 0.95 : 0.52 + cl * 0.2);
        }
    return finish(b, 2, 2.5);
}

/** Clay roof tiles (genteng) — 1 m tile, 4 courses, overlapping lips, weathering. */
export function roofTileTexture(size: number): TexSet {
    const b = buffers(size);
    const rows = 4;
    const cols = 4;
    const r = rng(41);
    const tint = Array.from({ length: rows * cols * 2 }, () => 0.82 + r() * 0.3);
    const weather = fbm(42, 3, 3, 4);
    const grit = periodicNoise(43, 128);
    const clay = rgb('#a24e2f');
    const clayDark = rgb('#5e2c1d');
    const moss = rgb('#4b4a33');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const v = (y / size) * rows;
            const row = Math.floor(v);
            const t = v - row; // 0 = top (up-slope, under previous course) → 1 = lower lip
            const u = (x / size) * cols + (row % 2) * 0.5;
            const col = Math.floor(u);
            const tu = u - col;
            const wave = Math.sin(tu * Math.PI); // pantile curve across the tile
            const edge = Math.min(tu, 1 - tu) * (size / cols);
            const h = t * 0.55 + wave * 0.35 + (edge < 1.5 ? -0.2 : 0);
            const lip = t > 0.93 ? (t - 0.93) / 0.07 : 0;
            const shadow = t < 0.12 ? 0.55 + t * 3.5 : 1; // under the course above
            const w = weather(x / size, y / size);
            const k = tint[(row % rows) * cols + (col % cols)];
            let c = lerp3(clay, clayDark, clamp01(0.25 + (1 - wave) * 0.35 + lip * 0.5));
            c = lerp3(c, moss, clamp01((w - 0.62) * 2.2) * 0.55);
            const gtr = 0.92 + grit(x / size, y / size) * 0.16;
            const s = shadow * k * gtr;
            c = [c[0] * s, c[1] * s, c[2] * s];
            put(b, y * size + x, c, h - lip * 0.3, 0.62 + w * 0.25);
        }
    return finish(b, 1, 3.2);
}

/** Running-bond red brick (bata) with lime mortar — 1 m tile. */
export function brickTexture(size: number): TexSet {
    const b = buffers(size);
    const rows = 14;
    const cols = 4;
    const r = rng(51);
    const tints = Array.from({ length: rows * (cols + 1) }, () => 0.8 + r() * 0.35);
    const grit = periodicNoise(52, 140);
    const cloud = fbm(53, 4, 4, 3);
    const brick = rgb('#a9553a');
    const brickDark = rgb('#6e3524');
    const mortar = rgb('#c6b598');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const v = (y / size) * rows;
            const row = Math.floor(v);
            const u = (x / size) * cols + (row % 2 ? 0.5 : 0);
            const col = Math.floor(u);
            const e = Math.min(
                (v - row) * (size / rows),
                (1 - (v - row)) * (size / rows),
                (u - col) * (size / cols),
                (1 - (u - col)) * (size / cols),
            );
            const isMortar = e < 2.2;
            const g = grit(x / size, y / size);
            let c: [number, number, number];
            if (isMortar) {
                const m = 0.85 + g * 0.2;
                c = [mortar[0] * m, mortar[1] * m, mortar[2] * m];
            } else {
                c = lerp3(brick, brickDark, clamp01(cloud(x / size, y / size) * 0.9 - 0.15 + g * 0.2));
                const t = tints[(row % rows) * (cols + 1) + (col % (cols + 1))];
                c = [c[0] * t, c[1] * t, c[2] * t];
            }
            put(b, y * size + x, c, isMortar ? 0.1 : 0.7 + clamp01(e / 4) * 0.2 + g * 0.1, isMortar ? 0.95 : 0.8 + g * 0.15);
        }
    return finish(b, 1, 2.6);
}

/** Lime plaster wall — soft mottling, very low relief. 2 m tile. */
export function plasterTexture(size: number): TexSet {
    const b = buffers(size);
    const cloud = fbm(61, 3, 3, 5);
    const fine = periodicNoise(62, 200);
    const base = rgb('#ece3cf');
    const stain = rgb('#cdbfa2');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const cl = cloud(x / size, y / size);
            const f = fine(x / size, y / size);
            const c = lerp3(base, stain, clamp01((cl - 0.45) * 1.6));
            const k = 0.97 + f * 0.05;
            put(b, y * size + x, [c[0] * k, c[1] * k, c[2] * k], cl * 0.5 + f * 0.5, 0.88 + f * 0.08);
        }
    return finish(b, 2, 0.9);
}

/** Carved relief from a pack batik tile: the motif becomes raised carving on teak with gilded high points. */
export function reliefTexture(size: number, source: CanvasImageSource | undefined, palette: 'gilded' | 'teak', tile: number): TexSet {
    const b = buffers(size);
    const s = imageSampler(source, size);
    const fine = periodicNoise(71, 160, 12);
    const deep = rgb(palette === 'gilded' ? '#4a2c17' : '#3d2516');
    const high = rgb(palette === 'gilded' ? '#c99a52' : '#8d5d3a');
    if (s) {
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) b.height[y * size + x] = 1 - s.lum(x, y);
    } else {
        const n = fbm(72, 6, 6, 3);
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) b.height[y * size + x] = n(x / size, y / size);
    }
    // normalise and soften so it reads as chiselled relief, not print
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of b.height) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
    }
    for (let i = 0; i < b.height.length; i++) b.height[i] = (b.height[i] - lo) / (hi - lo || 1);
    blur(b.height, size, 2);
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const i = y * size + x;
            const h = b.height[i];
            const f = fine(x / size, y / size);
            const c = lerp3(deep, high, clamp01(h * 1.25 - 0.1 + f * 0.08));
            b.color[i * 4] = c[0];
            b.color[i * 4 + 1] = c[1];
            b.color[i * 4 + 2] = c[2];
            b.color[i * 4 + 3] = 255;
            b.rough[i] = palette === 'gilded' ? 0.62 - h * 0.3 : 0.7 - h * 0.15;
        }
    return finish(b, tile, 5);
}

/** Ceiling of the roof: boards with usuk rafters running down the slope (along V). 1 m tile. */
export function rafterTexture(size: number): TexSet {
    const b = buffers(size);
    const fiber = periodicNoise(81, 12, 90);
    const boardC = rgb('#4a2f1f');
    const rafterC = rgb('#6e4a30');
    const rafters = 3;
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const u = (x / size) * rafters;
            const t = u - Math.floor(u);
            const isRafter = t < 0.2;
            const f = fiber(x / size, y / size);
            const edge = isRafter ? Math.min(t, 0.2 - t) / 0.2 : 0;
            let c = isRafter ? rafterC : boardC;
            const boardJoint = !isRafter && Math.abs(((y / size) * 6) % 1) < 0.015;
            const k = 0.85 + f * 0.25;
            c = [c[0] * k, c[1] * k, c[2] * k];
            if (boardJoint) c = [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5];
            put(b, y * size + x, c, isRafter ? 0.6 + edge * 0.4 : boardJoint ? 0 : 0.15 + f * 0.05, 0.75);
        }
    return finish(b, 1, 3);
}

/** Andesite / pack-stone surface with real normals derived from the pack's stone grain. */
export function stoneTexture(size: number, packStone: CanvasImageSource | undefined, tone: 'andesite' | 'limestone' | 'paver'): TexSet {
    const b = buffers(size);
    const s = imageSampler(packStone, size);
    const cloud = fbm(91, 3, 3, 4);
    const pits = periodicNoise(92, 90);
    const base = rgb(tone === 'andesite' ? '#6f6c66' : tone === 'paver' ? '#8a857b' : '#bdb4a2');
    const alt = rgb(tone === 'andesite' ? '#55524d' : tone === 'paver' ? '#6b665d' : '#a39882');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const l = s ? s.lum(x, y) : 0.5;
            const cl = cloud(x / size, y / size);
            const p = pits(x / size, y / size);
            let c = lerp3(base, alt, clamp01(cl * 1.3 - 0.2));
            const k = 0.78 + l * 0.45;
            c = [c[0] * k, c[1] * k, c[2] * k];
            const pit = p > 0.86 ? 0.75 : 1;
            put(b, y * size + x, [c[0] * pit, c[1] * pit, c[2] * pit], l * 0.7 + cl * 0.3 - (pit < 1 ? 0.3 : 0), 0.8 + cl * 0.15);
        }
    return finish(b, tone === 'paver' ? 0.8 : 1.6, 2.4);
}

/** Fissured bark for broadleaf trunks (fissures run along V). */
export function barkTexture(size: number): TexSet {
    const b = buffers(size);
    const ridges = fbm(101, 9, 2, 4);
    const fine = periodicNoise(102, 120, 30);
    const light = rgb('#7b6a58');
    const dark = rgb('#3b3027');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const r = ridges(x / size, y / size);
            const fis = Math.pow(Math.abs(r - 0.5) * 2, 0.6);
            const f = fine(x / size, y / size);
            const c = lerp3(dark, light, clamp01(fis * 0.9 + f * 0.2));
            put(b, y * size + x, c, fis * 0.8 + f * 0.2, 0.9);
        }
    return finish(b, 1.2, 4);
}

/** Coconut trunk with leaf-scar rings (rings across V). */
export function palmBarkTexture(size: number): TexSet {
    const b = buffers(size);
    const fine = periodicNoise(111, 60, 160);
    const light = rgb('#8c7b64');
    const dark = rgb('#4f4336');
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            const v = (y / size) * 8;
            const t = v - Math.floor(v);
            const ring = Math.pow(Math.sin(t * Math.PI), 0.5);
            const f = fine(x / size, y / size);
            const c = lerp3(dark, light, clamp01(ring * 0.8 + f * 0.25));
            put(b, y * size + x, c, ring * 0.8 + f * 0.2, 0.92);
        }
    return finish(b, 1, 3);
}

/* ───────────── alpha foliage atlases ───────────── */

function canvasTex(c: HTMLCanvasElement) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.generateMipmaps = true;
    return t;
}

function drawLeaf(g: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, ang: number, color: string, vein = true) {
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(wid, len * 0.35, 0, len);
    g.quadraticCurveTo(-wid, len * 0.35, 0, 0);
    g.fillStyle = color;
    g.fill();
    if (vein) {
        g.strokeStyle = 'rgba(255,255,220,0.18)';
        g.lineWidth = Math.max(1, wid * 0.08);
        g.beginPath();
        g.moveTo(0, len * 0.05);
        g.lineTo(0, len * 0.92);
        g.stroke();
    }
    g.restore();
}

/**
 * Leaf-cluster card for broadleaf canopies: a twig with ~50 overlapping leaves in several greens.
 * Lighter leaves sit on top so cards read with depth even without a normal map.
 */
export function leafClusterTexture(size: number, seed: number, palette: string[], flowers = false): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    const r = rng(seed);
    const k = size / 256;
    g.strokeStyle = '#4a3a2a';
    g.lineWidth = 3 * k;
    const tips: [number, number][] = [];
    // twigs radiating from the bottom centre
    for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 2.2;
        const len = (70 + r() * 70) * k;
        const x2 = size / 2 + Math.cos(a) * len;
        const y2 = size * 0.92 + Math.sin(a) * len;
        g.beginPath();
        g.moveTo(size / 2, size * 0.95);
        g.quadraticCurveTo(size / 2 + Math.cos(a) * len * 0.4, size * 0.9 + Math.sin(a) * len * 0.6, x2, y2);
        g.stroke();
        tips.push([x2, y2]);
    }
    const count = 70;
    for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < count / 3; i++) {
            const [tx, ty] = tips[Math.floor(r() * tips.length)];
            const x = tx + (r() - 0.5) * 70 * k;
            const y = ty + (r() - 0.5) * 70 * k;
            if (Math.hypot(x - size / 2, y - size / 2) > size * 0.47) continue;
            const col = palette[Math.min(palette.length - 1, Math.floor(r() * 2) + layer)];
            drawLeaf(g, x, y, (22 + r() * 18) * k, (8 + r() * 6) * k, r() * Math.PI * 2, col);
        }
    }
    if (flowers) {
        for (let i = 0; i < 14; i++) {
            const x = size * 0.15 + r() * size * 0.7;
            const y = size * 0.1 + r() * size * 0.6;
            for (let p = 0; p < 5; p++) drawLeaf(g, x, y, 7 * k, 3.2 * k, (p / 5) * Math.PI * 2 + r(), '#fbf8ef', false);
            g.fillStyle = '#e9d27a';
            g.beginPath();
            g.arc(x, y, 1.5 * k, 0, Math.PI * 2);
            g.fill();
        }
    }
    return canvasTex(c);
}

/** Coconut frond: tapered rachis with long, slightly drooping leaflets. Rachis along V. */
export function frondTexture(size: number): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = size / 4;
    c.height = size;
    const g = c.getContext('2d')!;
    const W = c.width;
    const H = c.height;
    g.strokeStyle = '#8a8a4a';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(W / 2, 0);
    g.lineTo(W / 2, H);
    g.stroke();
    for (let y = 4; y < H - 4; y += 3) {
        const t = y / H;
        const len = (W / 2 - 2) * Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.95) + 3;
        for (const s of [-1, 1]) {
            const shade = 70 + Math.floor((Math.sin(y * 1.7) * 0.5 + 0.5) * 50);
            g.strokeStyle = `rgb(${shade - 20}, ${shade + 50}, ${shade - 30})`;
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(W / 2, y);
            g.quadraticCurveTo(W / 2 + s * len * 0.5, y + 2, W / 2 + s * len, y + 10 + t * 6);
            g.stroke();
        }
    }
    return canvasTex(c);
}

/** Banana leaf with midrib, parallel veins and a few wind tears. Midrib along V. */
export function bananaLeafTexture(size: number): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = size / 2;
    c.height = size;
    const g = c.getContext('2d')!;
    const W = c.width;
    const H = c.height;
    const r = rng(121);
    g.fillStyle = '#5f8f3a';
    g.beginPath();
    g.moveTo(W / 2, 0);
    g.bezierCurveTo(W * 1.02, H * 0.15, W * 1.02, H * 0.8, W / 2, H);
    g.bezierCurveTo(-W * 0.02, H * 0.8, -W * 0.02, H * 0.15, W / 2, 0);
    g.fill();
    const grd = g.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, 'rgba(30,60,20,0.35)');
    grd.addColorStop(0.5, 'rgba(160,200,90,0.15)');
    grd.addColorStop(1, 'rgba(30,60,20,0.35)');
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(210,230,150,0.22)';
    g.lineWidth = 1;
    for (let y = 6; y < H; y += 5) {
        g.beginPath();
        g.moveTo(W / 2, y);
        g.lineTo(0, y + 18);
        g.moveTo(W / 2, y);
        g.lineTo(W, y + 18);
        g.stroke();
    }
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 9; i++) {
        const y = H * (0.2 + r() * 0.7);
        const side = r() > 0.5 ? 1 : -1;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(W / 2 + side * W * (0.15 + r() * 0.2), y);
        g.lineTo(side > 0 ? W + 2 : -2, y + 16);
        g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#c9d48a';
    g.fillRect(W / 2 - 2, 0, 4, H);
    return canvasTex(c);
}

/** Soft radial blob used for contact shadows / ambient occlusion decals. */
export function contactShadowTexture(size: number): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, 'rgba(0,0,0,0.85)');
    grd.addColorStop(0.35, 'rgba(0,0,0,0.5)');
    grd.addColorStop(0.7, 'rgba(0,0,0,0.15)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

/** Rectangular soft AO strip (for the base of walls & platforms). */
export function contactStripTexture(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 8;
    c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createLinearGradient(0, 0, 0, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.7)');
    grd.addColorStop(0.4, 'rgba(0,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 8, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

export const nextFrame = () => new Promise<void>((r) => setTimeout(r, 0));
