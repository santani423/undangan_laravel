import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
    const get = () => (typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(query).matches : false);
    const [matches, setMatches] = useState(get);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);
    return matches;
}

export function useReducedMotion(): boolean {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 767px)');
}

export interface CountdownValue {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    done: boolean;
    valid: boolean;
}

function compute(target: number): CountdownValue {
    if (!Number.isFinite(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, valid: false };
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        done: diff <= 0,
        valid: true,
    };
}

/** Ticks once per second, aligned to the wall-clock second. */
export function useCountdown(isoDate: string): CountdownValue {
    const target = new Date(isoDate).getTime();
    const [value, setValue] = useState(() => compute(target));
    useEffect(() => {
        let timer = 0;
        const tick = () => {
            setValue(compute(target));
            timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
        };
        tick();
        return () => window.clearTimeout(timer);
    }, [target]);
    return value;
}

/** Synchronous WebGL capability probe. Returns false if WebGL is disabled or unavailable. */
export function hasWebGL(): boolean {
    try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ?? (canvas.getContext('webgl') as WebGLRenderingContext | null);
        if (!gl) return false;
        const ok = typeof gl.getParameter === 'function';
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return ok;
    } catch {
        return false;
    }
}
