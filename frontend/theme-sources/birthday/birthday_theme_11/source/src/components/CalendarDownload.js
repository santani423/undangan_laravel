import { getEventRange } from '../utils/date.js';
import { ordinalSuffix } from '../utils/helpers.js';

// RFC 5545 helpers ----------------------------------------------------------

/** Escapes TEXT values: backslash, semicolon, comma and newlines. */
export function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds a content line to 75 octets per line (continuations start with one space). */
export function foldIcsLine(line) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts = [];
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
export function toIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function eventTitle(config) {
  const { name, age } = config.child;
  return `${name}'s ${age}${ordinalSuffix(age)} Birthday Party`;
}

function eventDescription(config, pageUrl) {
  const lines = [
    `${config.copy.siteTitle} — you're invited to celebrate ${config.child.name}'s birthday!`,
    config.event.dressCode ? `Dress code: ${config.event.dressCode}` : '',
    `Hosted by ${config.host.names}.`,
    pageUrl ? `Invitation: ${pageUrl}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

function slug(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function icsFileName(config) {
  return `${slug(config.child.name) || 'birthday'}-birthday-party.ics`;
}

/**
 * Builds the .ics text for the configured event.
 * @param {object} config resolved invitation config
 * @param {{ now?: Date, pageUrl?: string }} [options]
 */
export function buildIcs(config, { now = new Date(), pageUrl = '' } = {}) {
  const { start, end } = getEventRange(config.event);
  const location = [config.venue.name, config.venue.address].filter(Boolean).join(', ');
  const safeUrl = /^https?:\/\//.test(pageUrl) ? pageUrl : '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Little Smile Dental Adventure//Birthday Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${slug(config.child.name)}-${toIcsUtc(start)}@little-smile-dental-adventure`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(eventTitle(config))}`,
    `DESCRIPTION:${escapeIcsText(eventDescription(config, safeUrl))}`,
    `LOCATION:${escapeIcsText(location)}`,
    safeUrl ? `URL:${safeUrl}` : '',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Tomorrow: ${eventTitle(config)}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/** Google Calendar "create event" link with the same details. */
export function buildGoogleCalendarUrl(config, { pageUrl = '' } = {}) {
  const { start, end } = getEventRange(config.event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(config),
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: eventDescription(config, /^https?:\/\//.test(pageUrl) ? pageUrl : ''),
    location: [config.venue.name, config.venue.address].filter(Boolean).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Triggers a download of the .ics file in the browser. Returns the file name. */
export function downloadIcs(config) {
  const pageUrl = typeof location !== 'undefined' ? location.href.split('#')[0] : '';
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
