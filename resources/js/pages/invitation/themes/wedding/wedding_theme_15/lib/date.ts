const LOCALE = 'id-ID';
const TIME_ZONE = 'Asia/Jakarta';

export interface CountdownParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    /** Milliseconds remaining, clamped at 0. */
    remaining: number;
}

export function getCountdown(targetISO: string, now = Date.now()): CountdownParts {
    const remaining = Math.max(0, new Date(targetISO).getTime() - now);
    const s = Math.floor(remaining / 1000);
    return {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60,
        remaining,
    };
}

/** Hours and minutes of "now" in the wedding timezone (WIB) — drives the 3D timepiece hands. */
export function getZonedClock(now = new Date()): { h: number; m: number; s: number } {
    const parts = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: TIME_ZONE,
    }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    return { h: get('hour') % 24, m: get('minute'), s: get('second') };
}

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

/** ISO timestamp → "baru saja" / "5 menit yang lalu" / date; non-ISO labels (from the server) are shown as they are. */
export function relativeTime(when: string): string {
    const t = new Date(when).getTime();
    if (!/^\d{4}-\d{2}-\d{2}/.test(when) || Number.isNaN(t)) return when;
    const diff = (t - Date.now()) / 1000;
    const abs = Math.abs(diff);
    if (abs < 60) return 'baru saja';
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
    return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeZone: TIME_ZONE }).format(new Date(t));
}
