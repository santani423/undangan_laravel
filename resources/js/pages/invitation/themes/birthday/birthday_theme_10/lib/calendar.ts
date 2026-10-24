import type { PartyEvent } from './types';

const toICSDate = (iso: string) =>
    new Date(iso)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');

const escapeICS = (s: string) =>
    s
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/[,;]/g, (m) => `\\${m}`);

/** Downloads an .ics file so guests can add the party to any calendar app. Returns false without a valid date. */
export function downloadEventICS(event: PartyEvent, nickname: string): boolean {
    if (!event.startISO) return false;
    const end = event.endISO || new Date(Date.parse(event.startISO) + 3 * 3600e3).toISOString();
    const slug = nickname.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'pesta';
    const location = [event.venueName, event.address].filter(Boolean).join(', ');
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Toy World Birthday//ID',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${toICSDate(event.startISO)}-${slug}@toy-world-birthday`,
        `DTSTAMP:${toICSDate(new Date().toISOString())}`,
        `DTSTART:${toICSDate(event.startISO)}`,
        `DTEND:${toICSDate(end)}`,
        `SUMMARY:${escapeICS(event.title)}`,
        location && `LOCATION:${escapeICS(location)}`,
        event.mapUrl && `DESCRIPTION:${escapeICS(event.mapUrl)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].filter(Boolean);
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ulang-tahun-${slug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}
