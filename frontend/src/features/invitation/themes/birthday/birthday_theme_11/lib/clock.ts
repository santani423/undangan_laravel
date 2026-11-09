/**
 * Page clock. `?now=2026-12-05T16:00:00+07:00` previews the invitation at another moment
 * (the "party is happening now / has ended" states) without touching the system clock.
 */
const preview = typeof window === 'undefined' ? NaN : Date.parse(new URLSearchParams(window.location.search).get('now') ?? '');
const offset = Number.isFinite(preview) ? preview - Date.now() : 0;

export const now = () => Date.now() + offset;
