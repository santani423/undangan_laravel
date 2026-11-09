import { invitationConfig } from '../config/invitation.config';

const toICSDate = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

const escapeICS = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => `\\${m}`);

/** Downloads an .ics file so guests can add the party to any calendar app. */
export function downloadEventICS() {
  const { event, child } = invitationConfig;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Toy World Birthday//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${toICSDate(event.startISO)}-${child.nickname.toLowerCase()}@toy-world-birthday`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(event.startISO)}`,
    `DTEND:${toICSDate(event.endISO)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `LOCATION:${escapeICS(`${event.venueName}, ${event.address}`)}`,
    `DESCRIPTION:${escapeICS(`${event.venueDetail}\n${event.mapUrl}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ulang-tahun-${child.nickname.toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
