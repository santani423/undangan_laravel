/** Deterministic PRNG so the forest layout is identical on every visit. */
export function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export type Rng = () => number;

export const range = (rng: Rng, min: number, max: number) => min + (max - min) * rng();
export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)];

function hash2(x: number, y: number) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
}

/** Smooth 2D value noise in [0, 1]. */
export function noise2(x: number, y: number) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi);
    const b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1);
    const d = hash2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm2(x: number, y: number, octaves = 4) {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let i = 0; i < octaves; i++) {
        sum += amp * noise2(x * freq, y * freq);
        norm += amp;
        amp *= 0.5;
        freq *= 2;
    }
    return sum / norm;
}

export const smoothstep = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
};
