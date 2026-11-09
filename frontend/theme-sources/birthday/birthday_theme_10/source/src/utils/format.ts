import { invitationConfig } from '../config/invitation.config';

const { timeZone } = invitationConfig.event;

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso));
}

export function formatEventTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  })
    .format(new Date(iso))
    .replace(':', '.');
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(
    new Date(iso),
  );
}

const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

export function timeAgo(iso: string, now = Date.now()) {
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

/** Groups digits for display: 1234567890 → 1234 5678 90. */
export function groupDigits(value: string) {
  return value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
}
