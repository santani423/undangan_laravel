/**
 * Query-string flags:
 *   ?to=Nama%20Tamu   personalised recipient name on the cover (also ?kepada= / ?guest=)
 *   ?nowebgl=1        force the static (non-WebGL) fallback, for testing
 *   ?quality=low|medium|high   override automatic 3D quality detection
 *   ?debug=1          expose `window.__wt16` for automated tests
 */
import { sanitizeName } from './validation';

function params(): URLSearchParams {
    return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
}

export function getRecipientName(): string {
    const p = params();
    return sanitizeName(p.get('to') ?? p.get('kepada') ?? p.get('guest') ?? '').replace(/[<>]/g, '');
}

export function isWebGLForcedOff(): boolean {
    return params().get('nowebgl') === '1';
}

export function getQualityOverride(): 'low' | 'medium' | 'high' | null {
    const value = params().get('quality');
    return value === 'low' || value === 'medium' || value === 'high' ? value : null;
}

export function isDebug(): boolean {
    return params().get('debug') === '1';
}

/** Merges values into `window.__wt16` when `?debug=1` is present. */
export function exposeDebug(values: Record<string, unknown>): void {
    if (!isDebug()) return;
    const target = window as unknown as { __wt16?: Record<string, unknown> };
    target.__wt16 = { ...target.__wt16, ...values };
}
