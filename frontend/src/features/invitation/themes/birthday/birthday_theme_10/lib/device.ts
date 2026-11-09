export type QualityTier = 'high' | 'medium' | 'low';

export interface QualitySettings {
    tier: QualityTier;
    dpr: [number, number];
    antialias: boolean;
    shadows: boolean;
    shadowMapSize: number;
    grassBlades: number;
    flowerScale: number;
    cloudCount: number;
}

const SETTINGS: Record<QualityTier, Omit<QualitySettings, 'tier'>> = {
    high: { dpr: [1, 1.75], antialias: true, shadows: true, shadowMapSize: 2048, grassBlades: 18000, flowerScale: 1, cloudCount: 9 },
    medium: { dpr: [1, 1.5], antialias: true, shadows: true, shadowMapSize: 1024, grassBlades: 12000, flowerScale: 0.8, cloudCount: 7 },
    low: { dpr: [0.85, 1.25], antialias: false, shadows: false, shadowMapSize: 512, grassBlades: 6000, flowerScale: 0.55, cloudCount: 5 },
};

const params = () => new URLSearchParams(window.location.search);

/** Heuristic device tier; `?quality=low|medium|high` overrides it for testing. */
export function detectQuality(): QualitySettings {
    const forced = params().get('quality');
    if (forced === 'high' || forced === 'medium' || forced === 'low') return { tier: forced, ...SETTINGS[forced] };

    const nav = navigator as Navigator & { deviceMemory?: number };
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const shortSide = Math.min(window.screen.width, window.screen.height);

    let tier: QualityTier = 'high';
    if (coarse || shortSide < 700) tier = 'medium';
    if ((coarse && (cores <= 4 || memory <= 3)) || memory <= 2) tier = 'low';
    return { tier, ...SETTINGS[tier] };
}

/** `?webgl=off` (or `?nowebgl=1`) forces the illustrated 2D fallback (useful for QA). */
export function isWebGLAllowed() {
    const p = params();
    if (p.get('webgl') === 'off' || p.get('nowebgl') === '1') return false;
    if (typeof window.WebGLRenderingContext === 'undefined') return false;
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        // Release the probe at once so the page keeps a single live WebGL context.
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return Boolean(gl);
    } catch {
        return false;
    }
}
