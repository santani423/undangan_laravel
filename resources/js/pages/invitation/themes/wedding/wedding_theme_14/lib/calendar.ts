import type { EventItem } from './types';

const toUtcStamp = (iso: string) =>
    new Date(iso)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

const place = (ev: EventItem) => [ev.venueName, ev.address].filter(Boolean).join(', ');

export function googleCalendarUrl(ev: EventItem, coupleLabel: string): string {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${ev.title} — ${coupleLabel}`,
        dates: `${toUtcStamp(ev.start)}/${toUtcStamp(ev.end)}`,
        details: `${ev.subtitle}\n${ev.mapsUrl}`.trim(),
        location: place(ev),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Downloads every dated event as one .ics file. */
export function downloadIcs(events: EventItem[], coupleLabel: string) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pawiwahan Agung//Undangan//ID', 'CALSCALE:GREGORIAN'];
    for (const ev of events.filter((e) => e.start)) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:${ev.id}-${toUtcStamp(ev.start)}@pawiwahan-agung`,
            `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
            `DTSTART:${toUtcStamp(ev.start)}`,
            `DTEND:${toUtcStamp(ev.end)}`,
            `SUMMARY:${esc(`${ev.title} — ${coupleLabel}`)}`,
            `LOCATION:${esc(place(ev))}`,
            `DESCRIPTION:${esc(ev.mapsUrl)}`,
            'END:VEVENT',
        );
    }
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'undangan-pawiwahan.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
