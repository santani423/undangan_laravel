import { getQualityOverride } from './urlFlags';

export type QualityTier = 'low' | 'medium' | 'high';

export interface QualitySettings {
    tier: QualityTier;
    /** [min, max] device-pixel-ratio range for the canvas. */
    dpr: [number, number];
    antialias: boolean;
    shadows: boolean;
    shadowMapSize: number;
    grassBlades: number;
    meadowFlowers: number;
    peripheralTrees: number;
    fireflies: number;
    clouds: number;
    pointLights: boolean;
}

export const QUALITY_PRESETS: Record<QualityTier, QualitySettings> = {
    high: {
        tier: 'high',
        dpr: [1, 1.75],
        antialias: true,
        shadows: true,
        shadowMapSize: 2048,
        grassBlades: 13000,
        meadowFlowers: 700,
        peripheralTrees: 70,
        fireflies: 90,
        clouds: 12,
        pointLights: true,
    },
    medium: {
        tier: 'medium',
        dpr: [1, 1.5],
        antialias: true,
        shadows: true,
        shadowMapSize: 1024,
        grassBlades: 7000,
        meadowFlowers: 400,
        peripheralTrees: 52,
        fireflies: 60,
        clouds: 9,
        pointLights: true,
    },
    low: {
        tier: 'low',
        dpr: [1, 1.25],
        antialias: false,
        shadows: false,
        shadowMapSize: 512,
        grassBlades: 2600,
        meadowFlowers: 160,
        peripheralTrees: 34,
        fireflies: 28,
        clouds: 6,
        pointLights: false,
    },
};

interface NavigatorWithMemory extends Navigator {
    deviceMemory?: number;
}

export function isTouchDevice(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

/** Picks a starting tier from device hints; PerformanceMonitor refines it at runtime. */
export function detectQualityTier(): QualityTier {
    const override = getQualityOverride();
    if (override) return override;
    if (typeof window === 'undefined') return 'medium';

    const nav = navigator as NavigatorWithMemory;
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const shortSide = Math.min(window.screen.width, window.screen.height);

    if (isTouchDevice() && shortSide < 900) {
        return cores >= 8 && memory >= 6 ? 'medium' : 'low';
    }
    if (cores <= 4 || memory <= 4) return 'medium';
    return 'high';
}

export function lowerTier(tier: QualityTier): QualityTier {
    return tier === 'high' ? 'medium' : 'low';
}
