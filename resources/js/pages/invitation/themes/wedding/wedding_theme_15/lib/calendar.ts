import type { EventDetail } from './types';

/** 20270612T020000Z */
function toUtcStamp(iso: string): string {
    return new Date(iso)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
}

const eventTitle = (e: EventDetail, names: string) => `${e.name} — ${names}`;
const eventLocation = (e: EventDetail) => [e.venueName, e.venueAddress].filter(Boolean).join(', ');

function eventDescription(e: EventDetail, names: string) {
    const lines = [`${e.name} ${names}`, e.venueName, e.venueAddress];
    if (e.mapsUrl) lines.push(e.mapsUrl);
    return lines.filter(Boolean).join('\n');
}

export function googleCalendarUrl(e: EventDetail, names: string): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventTitle(e, names),
        dates: `${toUtcStamp(e.startISO)}/${toUtcStamp(e.endISO)}`,
        details: eventDescription(e, names),
        location: eventLocation(e),
        ctz: 'Asia/Jakarta',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(text: string) {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

const encoder = new TextEncoder();

/** RFC 5545: fold lines at 75 octets without splitting a UTF-8 character. */
function fold(line: string) {
    const out: string[] = [];
    let current = '';
    let bytes = 0;
    for (const ch of line) {
        const size = encoder.encode(ch).length;
        if (bytes + size > 75) {
            out.push(current);
            current = ' ';
            bytes = 1;
        }
        current += ch;
        bytes += size;
    }
    out.push(current);
    return out.join('\r\n');
}

export function buildIcs(events: EventDetail[], names: string): string {
    const now = toUtcStamp(new Date().toISOString());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Enchanted Twilight Invitation//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    for (const e of events.filter((ev) => ev.startISO)) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:${e.id}-${toUtcStamp(e.startISO)}@enchanted-invitation`,
            `DTSTAMP:${now}`,
            `DTSTART:${toUtcStamp(e.startISO)}`,
            `DTEND:${toUtcStamp(e.endISO)}`,
            `SUMMARY:${escapeIcs(eventTitle(e, names))}`,
            `DESCRIPTION:${escapeIcs(eventDescription(e, names))}`,
            `LOCATION:${escapeIcs(eventLocation(e))}`,
            'BEGIN:VALARM',
            'TRIGGER:-P1D',
            'ACTION:DISPLAY',
            `DESCRIPTION:${escapeIcs(eventTitle(e, names))}`,
            'END:VALARM',
            'END:VEVENT',
        );
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(events: EventDetail[], names: string, filename: string) {
    const blob = new Blob([buildIcs(events, names)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
