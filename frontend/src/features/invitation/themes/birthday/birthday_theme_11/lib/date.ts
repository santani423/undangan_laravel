// Event date helpers. Times are venue-local wall-clock times plus a fixed UTC offset,
// so absolute instants are built from them and the wall-clock parts are formatted
// directly — guests in other time zones still see venue time.
import type { EventRange, PartyEvent } from './types';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const OFFSET_RE = /^([+-])(\d{2}):?(\d{2})$/;

function parseParts(date: string, time: string) {
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
export function venueTimeToDate(date: string, time: string, utcOffset: string) {
    const p = parseParts(date, time);
    return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - offsetMinutes(utcOffset) * 60_000);
}

/** { start, end } as absolute Dates. An end time earlier than the start rolls over to the next day. */
export function getEventRange(event: PartyEvent): EventRange {
    const start = venueTimeToDate(event.date, event.startTime, event.utcOffset);
    let end = venueTimeToDate(event.date, event.endTime || event.startTime, event.utcOffset);
    if (end <= start) end = new Date(end.getTime() + (event.endTime ? 24 * 3_600_000 : 3 * 3_600_000));
    return { start, end };
}

export function tryEventRange(event: PartyEvent): EventRange | null {
    try {
        return getEventRange(event);
    } catch {
        return null;
    }
}

export type CountdownStatus = 'upcoming' | 'live' | 'ended';

export interface CountdownState {
    status: CountdownStatus;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/** Countdown state at `now`: 'upcoming' before the start, 'live' until the end, then 'ended'. */
export function getCountdown(range: EventRange, now: number): CountdownState {
    const startMs = range.start.getTime();
    const status: CountdownStatus = now < startMs ? 'upcoming' : now < range.end.getTime() ? 'live' : 'ended';
    const totalSeconds = Math.floor(Math.max(0, startMs - now) / 1000);
    return {
        status,
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
    };
}

/** "Sabtu, 5 Desember 2026" (venue-local, in the configured locale). '' without a valid date. */
export function formatEventDay(event: PartyEvent) {
    try {
        const p = parseParts(event.date, event.startTime || '00:00');
        const utc = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
        return new Intl.DateTimeFormat(event.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
            utc,
        );
    } catch {
        return '';
    }
}

/** "15:00" → "15.00" in id-ID. */
export function formatClock(time: string, locale = 'id-ID') {
    const t = TIME_RE.exec(String(time ?? '').trim());
    if (!t) return '';
    const utc = new Date(Date.UTC(2000, 0, 1, +t[1], +t[2]));
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }).format(utc);
}

/** "15.00 – 18.00 WIB" ('' without a start time). */
export function formatTimeRange(event: PartyEvent) {
    const start = formatClock(event.startTime, event.locale);
    if (!start) return '';
    const end = event.endTime ? formatClock(event.endTime, event.locale) : '';
    const zone = event.timeZoneLabel ? ` ${event.timeZoneLabel}` : '';
    return end ? `${start} – ${end}${zone}` : `${start}${zone}`;
}

/** Day-of-month and short month/weekday for the 3D calendar prop; `null` without a valid date. */
export function calendarParts(event: PartyEvent) {
    try {
        const p = parseParts(event.date, event.startTime || '00:00');
        const utc = new Date(Date.UTC(p.year, p.month - 1, p.day, 12));
        return {
            day: p.day,
            month: new Intl.DateTimeFormat(event.locale, { month: 'short', timeZone: 'UTC' }).format(utc).replace('.', ''),
            weekday: new Intl.DateTimeFormat(event.locale, { weekday: 'short', timeZone: 'UTC' }).format(utc).replace('.', ''),
        };
    } catch {
        return null;
    }
}
