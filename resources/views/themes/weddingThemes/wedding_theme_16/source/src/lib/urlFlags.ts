/**
 * Query-string flags:
 *   ?to=Nama%20Tamu   personalised recipient name on the cover
 *   ?nowebgl=1        force the static (non-WebGL) fallback, for testing
 *   ?quality=low|medium|high   override automatic 3D quality detection
 *   ?debug=1          expose `window.__undesia` for automated tests
 */
import { sanitizeName } from './validation';

function params(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
}

export function getRecipientName(): string | null {
  const raw = params().get('to');
  if (!raw) return null;
  const cleaned = sanitizeName(raw);
  return cleaned.length > 0 ? cleaned : null;
}

export function isWebGLForcedOff(): boolean {
  return params().get('nowebgl') === '1';
}

export function getQualityOverride(): 'low' | 'medium' | 'high' | null {
  const value = params().get('quality');
  return value === 'low' || value === 'medium' || value === 'high' ? value : null;
}

export function isDebug(): boolean {
  return import.meta.env.DEV || params().get('debug') === '1';
}
