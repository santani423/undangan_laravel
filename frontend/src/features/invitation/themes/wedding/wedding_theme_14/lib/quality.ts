import type { QualityTier } from './types';

export interface QualitySettings {
    tier: QualityTier;
    dpr: [number, number];
    shadows: boolean;
    grassCount: number;
    /** distance (m) where grass starts / finishes shrinking into the ground */
    grassFade: [number, number];
    shadowMap: number;
    treeDensity: number;
    particles: number;
    pointLights: number;
    antialias: boolean;
}

const PRESETS: Record<QualityTier, Omit<QualitySettings, 'tier'>> = {
    high: {
        dpr: [1, 1.75],
        shadows: true,
        shadowMap: 2048,
        grassCount: 52000,
        grassFade: [30, 50],
        treeDensity: 1,
        particles: 70,
        pointLights: 3,
        antialias: true,
    },
    medium: {
        dpr: [1, 1.5],
        shadows: true,
        shadowMap: 1536,
        grassCount: 28000,
        grassFade: [24, 40],
        treeDensity: 0.75,
        particles: 40,
        pointLights: 2,
        antialias: true,
    },
    low: {
        dpr: [0.75, 1.25],
        shadows: false,
        shadowMap: 1024,
        grassCount: 9000,
        grassFade: [15, 26],
        treeDensity: 0.5,
        particles: 18,
        pointLights: 1,
        antialias: false,
    },
};

/** Pick an initial tier from device hints; PerformanceMonitor can still step down at runtime. */
export function detectQuality(): QualitySettings {
    let tier: QualityTier = 'high';
    try {
        const params = new URLSearchParams(window.location.search);
        const forced = params.get('quality');
        if (forced === 'high' || forced === 'medium' || forced === 'low') return { tier: forced, ...PRESETS[forced] };
        const w = Math.min(window.innerWidth, window.innerHeight);
        const cores = navigator.hardwareConcurrency || 4;
        const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        if (coarse || w < 600) tier = 'low';
        else if (cores <= 4 || mem <= 4 || w < 900) tier = 'medium';
    } catch {
        tier = 'medium';
    }
    return { tier, ...PRESETS[tier] };
}

export function downgrade(q: QualitySettings): QualitySettings {
    const next: QualityTier = q.tier === 'high' ? 'medium' : 'low';
    return { tier: next, ...PRESETS[next] };
}
