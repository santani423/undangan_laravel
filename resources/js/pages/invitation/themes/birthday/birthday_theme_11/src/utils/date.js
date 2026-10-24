// Event date helpers. Times in the config are venue-local wall-clock times plus a
// fixed UTC offset, so we build absolute instants from them and format the
// wall-clock parts directly — guests in other time zones still see venue time.

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const OFFSET_RE = /^([+-])(\d{2}):?(\d{2})$/;

function parseParts(date, time) {
  const d = DATE_RE.exec(String(date ?? '').trim());
  const t = TIME_RE.exec(String(time ?? '').trim());
  if (!d || !t) throw new Error(`Invalid event date/time: "${date} ${time}". Use YYYY-MM-DD and HH:MM.`);
  return { year: +d[1], month: +d[2], day: +d[3], hour: +t[1], minute: +t[2] };
}

export function offsetMinutes(utcOffset = '+00:00') {
  const m = OFFSET_RE.exec(String(utcOffset).trim());
  if (!m) throw new Error(`Invalid utcOffset "${utcOffset}". Use a value like "+07:00".`);
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

/** Absolute Date for a venue-local date + time. */
export function venueTimeToDate(date, time, utcOffset) {
  const p = parseParts(date, time);
  const utcMs = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - offsetMinutes(utcOffset) * 60_000;
  return new Date(utcMs);
}

/** { start, end } as absolute Dates. An end time earlier than the start rolls over to the next day. */
export function getEventRange(event) {
  const start = venueTimeToDate(event.date, event.startTime, event.utcOffset);
  let end = venueTimeToDate(event.date, event.endTime || event.startTime, event.utcOffset);
  if (end <= start) end = new Date(end.getTime() + (event.endTime ? 24 * 3_600_000 : 2 * 3_600_000));
  return { start, end };
}

/**
 * Countdown state at `now`.
 * status: 'upcoming' (before start), 'live' (between start and end), 'ended' (after end).
 */
export function getCountdown(range, now = new Date()) {
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  const status = nowMs < startMs ? 'upcoming' : nowMs < endMs ? 'live' : 'ended';
  const remaining = Math.max(0, startMs - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    status,
    totalMs: remaining,
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** "Saturday, 5 December 2026" (venue-local, formatted in the configured locale). */
export function formatEventDay(event, options = {}) {
  const p = parseParts(event.date, event.startTime || '00:00');
  const utc = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
  return new Intl.DateTimeFormat(event.locale || 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(utc);
}

/** "15:00" → "3:00 pm" / "15.00" depending on locale. */
export function formatClock(time, locale = 'en-GB') {
  const t = TIME_RE.exec(String(time ?? '').trim());
  if (!t) return '';
  const utc = new Date(Date.UTC(2000, 0, 1, +t[1], +t[2]));
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(utc);
}

/** "3:00 pm – 6:00 pm WIB" */
export function formatTimeRange(event) {
  const start = formatClock(event.startTime, event.locale);
  const end = event.endTime ? formatClock(event.endTime, event.locale) : '';
  const zone = event.timeZoneLabel ? ` ${event.timeZoneLabel}` : '';
  return end ? `${start} – ${end}${zone}` : `${start}${zone}`;
}

/** Day-of-month and short month for the 3D calendar prop. */
export function calendarParts(event) {
  const p = parseParts(event.date, event.startTime || '00:00');
  const utc = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
  const locale = event.locale || 'en-GB';
  return {
    day: p.day,
    month: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(utc),
    weekday: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(utc),
    hour: +String(event.startTime).split(':')[0],
    minute: +String(event.startTime).split(':')[1],
  };
}

/** "28 November 2026" for an RSVP deadline (or '' when not set / invalid). */
export function formatPlainDate(date, locale = 'en-GB') {
  const d = DATE_RE.exec(String(date ?? '').trim());
  if (!d) return '';
  const utc = new Date(Date.UTC(+d[1], +d[2] - 1, +d[3], 12));
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc);
}
