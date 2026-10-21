const LOCALE = 'id-ID';

/** "Sabtu, 20 Maret 2027" in the event's own time zone. */
export function formatLongDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(new Date(iso));
}

/** "20 . 03 . 2027" — compact numeric date for decorative headings. */
export function formatNumericDate(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')} . ${get('month')} . ${get('year')}`;
}

/** "08.00" */
export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
    .format(new Date(iso))
    .replace(':', '.');
}

/** "08.00 – 10.00 WIB" or "08.00 WIB – selesai" */
export function formatTimeRange(start: string, end: string | undefined, timeZone: string, label: string): string {
  return end ? `${formatTime(start, timeZone)} – ${formatTime(end, timeZone)} ${label}` : `${formatTime(start, timeZone)} ${label} – selesai`;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has been reached. */
  isPast: boolean;
}

export function getCountdownParts(targetIso: string, now: number = Date.now()): CountdownParts {
  const diff = new Date(targetIso).getTime() - now;
  if (Number.isNaN(diff) || diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  // Round up so each displayed second lasts a full second and none is skipped.
  const totalSeconds = Math.ceil(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** "5 menit yang lalu" */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return 'baru saja';
}

export function isPast(iso: string | undefined, now: number = Date.now()): boolean {
  return Boolean(iso) && new Date(iso as string).getTime() < now;
}
