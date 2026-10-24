// Small, dependency-free helpers shared by the page and the 3D world.
// Nothing here touches the DOM at import time.

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Frame-rate independent exponential smoothing. */
export const damp = (current: number, target: number, lambda: number, dt: number) => lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Deterministic pseudo-random generator so the world looks the same on every visit. */
export function seededRandom(seed = 1) {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Joins class names, skipping falsy entries: cx('bt11-btn', active && 'is-active'). */
export function cx(...names: (string | false | null | undefined)[]): string {
    return names.filter(Boolean).join(' ');
}

export const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const QUERY_REDUCED = '(prefers-reduced-motion: reduce)';

/** OS "reduce motion" setting, or `?motion=reduce` for testing. */
export function prefersReducedMotion() {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('motion') === 'reduce' || window.matchMedia?.(QUERY_REDUCED).matches === true;
}

/** Reads a boolean preference from localStorage without ever throwing. */
export function readPreference(key: string, fallback: boolean | null): boolean | null {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : raw === 'true';
    } catch {
        return fallback;
    }
}

export function writePreference(key: string, value: boolean) {
    try {
        window.localStorage.setItem(key, String(value));
    } catch {
        /* storage unavailable (private mode, blocked) — the preference simply isn't remembered */
    }
}

/** Smoothly scrolls to an element (or instantly when reduced motion is requested). */
export function scrollToElement(element: HTMLElement | null, { instant = false } = {}) {
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: instant || prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Keep in sync with the side-layout media query in birthday-theme-11.css. */
export const SIDE_LAYOUT_QUERY = '(min-width: 900px), (orientation: landscape) and (min-width: 640px)';
export const isSideLayout = () => window.matchMedia(SIDE_LAYOUT_QUERY).matches;
