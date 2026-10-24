import { getEventRange } from './date';
import type { SmileConfig } from './types';

// RFC 5545 helpers ----------------------------------------------------------

/** Escapes TEXT values: backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
}

/** Folds a content line to 75 octets per line (continuations start with one space). */
export function foldIcsLine(line: string) {
    const encoder = new TextEncoder();
    if (encoder.encode(line).length <= 75) return line;
    const parts: string[] = [];
    let current = '';
    let currentBytes = 0;
    for (const char of line) {
        const bytes = encoder.encode(char).length;
        const limit = parts.length === 0 ? 75 : 74; // continuation lines lose one octet to the leading space
        if (currentBytes + bytes > limit) {
            parts.push(current);
            current = '';
            currentBytes = 0;
        }
        current += char;
        currentBytes += bytes;
    }
    parts.push(current);
    return parts.join('\r\n ');
}

/** 2026-12-05T08:00:00.000Z → 20261205T080000Z */
export function toIcsUtc(date: Date) {
    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
}

export function eventTitle(config: SmileConfig) {
    return config.event.title;
}

const location = (config: SmileConfig) => [config.venue.name, config.venue.address].filter(Boolean).join(', ');

function eventDescription(config: SmileConfig, pageUrl: string) {
    return [
        `Kamu diundang merayakan ulang tahun ${config.child.name}!`,
        config.event.dressCode ? `Dress code: ${config.event.dressCode}` : '',
        `Tuan rumah: ${config.host.names}.`,
        pageUrl ? `Undangan: ${pageUrl}` : '',
    ]
        .filter(Boolean)
        .join('\n');
}

function slug(value: string) {
    return String(value)
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export function icsFileName(config: SmileConfig) {
    return `ulang-tahun-${slug(config.child.name) || 'pesta'}.ics`;
}

/** Builds the .ics text for the main event. Throws without a valid date and time. */
export function buildIcs(config: SmileConfig, { now = new Date(), pageUrl = '' } = {}) {
    const { start, end } = getEventRange(config.event);
    const safeUrl = /^https?:\/\//.test(pageUrl) ? pageUrl : '';
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Petualangan Gigi Ceria//Undangan Ulang Tahun//ID',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${slug(config.meta.slug)}-${toIcsUtc(start)}@petualangan-gigi-ceria`,
        `DTSTAMP:${toIcsUtc(now)}`,
        `DTSTART:${toIcsUtc(start)}`,
        `DTEND:${toIcsUtc(end)}`,
        `SUMMARY:${escapeIcsText(eventTitle(config))}`,
        `DESCRIPTION:${escapeIcsText(eventDescription(config, safeUrl))}`,
        `LOCATION:${escapeIcsText(location(config))}`,
        safeUrl ? `URL:${safeUrl}` : '',
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeIcsText(`Besok: ${eventTitle(config)}`)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean);
    return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/** Google Calendar "create event" link with the same details; '' without a valid date and time. */
export function buildGoogleCalendarUrl(config: SmileConfig, pageUrl = '') {
    try {
        const { start, end } = getEventRange(config.event);
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: eventTitle(config),
            dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
            details: eventDescription(config, /^https?:\/\//.test(pageUrl) ? pageUrl : ''),
            location: location(config),
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch {
        return '';
    }
}

/** Triggers a download of the .ics file in the browser. Returns the file name. */
export function downloadIcs(config: SmileConfig) {
    const pageUrl = window.location.href.split('#')[0];
    const blob = new Blob([buildIcs(config, { pageUrl })], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = icsFileName(config);
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return link.download;
}
