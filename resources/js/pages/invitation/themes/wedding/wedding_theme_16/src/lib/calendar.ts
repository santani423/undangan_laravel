import type { WeddingEvent } from '../types/invitation';

function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function endOf(event: WeddingEvent): string {
  return event.end ?? new Date(new Date(event.start).getTime() + 2 * 3600 * 1000).toISOString();
}

/** Google Calendar "add event" link. */
export function googleCalendarUrl(event: WeddingEvent, title: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.name} — ${title}`,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(endOf(event))}`,
    details: event.description ?? '',
    location: `${event.venueName}, ${event.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** RFC 5545 calendar file containing every event of the wedding. */
export function buildIcs(events: WeddingEvent[], title: string, uidPrefix: string): string {
  const now = toUtcStamp(new Date().toISOString());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undesia//Undangan Digital//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uidPrefix}-${event.id}@undesia`,
      `DTSTAMP:${now}`,
      `DTSTART:${toUtcStamp(event.start)}`,
      `DTEND:${toUtcStamp(endOf(event))}`,
      `SUMMARY:${escapeIcs(`${event.name} — ${title}`)}`,
      `LOCATION:${escapeIcs(`${event.venueName}, ${event.address}`)}`,
      `DESCRIPTION:${escapeIcs(event.description ?? '')}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
