export type QualityTier = 'high' | 'medium' | 'low';

/** Synchronous WebGL capability probe; the probe context is released right away. */
export function isWebGLAvailable(): boolean {
    try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ?? (canvas.getContext('webgl') as WebGLRenderingContext | null);
        if (!gl) return false;
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return true;
    } catch {
        return false;
    }
}

export function isTouchDevice(): boolean {
    return window.matchMedia('(pointer: coarse)').matches;
}

export function detectQualityTier(): QualityTier {
    const forced = new URLSearchParams(window.location.search).get('quality');
    if (forced === 'high' || forced === 'medium' || forced === 'low') return forced;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    if (cores <= 4 && (memory <= 3 || small)) return 'low';
    if (small || isTouchDevice()) return 'medium';
    return 'high';
}

export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Tiny persistent preference helper; storage can be unavailable (private mode), so never throw. */
export const prefs = {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set(key: string, value: string | null) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch {
            /* ignore */
        }
    },
};
