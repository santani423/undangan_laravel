/** Invitation times are entered in WIB; formatting always uses that zone, whatever the guest's device says. */
export const TIME_ZONE = 'Asia/Jakarta';
export const TIME_ZONE_LABEL = 'WIB';

const valid = (iso: string) => Boolean(iso) && !Number.isNaN(Date.parse(iso));

export function formatEventDate(iso: string) {
    if (!valid(iso)) return '';
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(
        new Date(iso),
    );
}

export function formatEventTime(iso: string) {
    if (!valid(iso)) return '';
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE })
        .format(new Date(iso))
        .replace(':', '.');
}

export function formatShortDate(iso: string) {
    if (!valid(iso)) return '';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE }).format(new Date(iso));
}

const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

export function timeAgo(iso: string, now = Date.now()) {
    if (!valid(iso)) return '';
    const diff = (new Date(iso).getTime() - now) / 1000;
    const abs = Math.abs(diff);
    if (abs < 60) return 'baru saja';
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
    return formatShortDate(iso);
}

export function initials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .filter((word) => /^\p{L}/u.test(word))
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

/** Groups digits for display: 1234567890 → 1234 5678 90. Account numbers with letters stay as typed. */
export function groupDigits(value: string) {
    const compact = value.replace(/\s+/g, '');
    return /^\d+$/.test(compact) ? compact.replace(/(\d{4})(?=\d)/g, '$1 ') : value;
}
