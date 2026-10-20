import type { EventDetail } from '../config/types'
import { wedding } from '../config/wedding'
import { mapsUrlFor } from './links'

/** 20270612T020000Z */
function toUtcStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function eventTitle(e: EventDetail) {
  return `${e.name} — ${wedding.couple.displayNames}`
}

function eventDescription(e: EventDetail) {
  const lines = [`${e.name} ${wedding.couple.displayNames}`, e.venueName, e.venueAddress]
  if (e.dressCode) lines.push(`Dress code: ${e.dressCode}`)
  lines.push(mapsUrlFor(e))
  return lines.join('\n')
}

export function googleCalendarUrl(e: EventDetail): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(e),
    dates: `${toUtcStamp(e.startISO)}/${toUtcStamp(e.endISO)}`,
    details: eventDescription(e),
    location: `${e.venueName}, ${e.venueAddress}`,
    ctz: wedding.timeZone,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

const encoder = new TextEncoder()

/** RFC 5545: fold lines at 75 octets without splitting a UTF-8 character. */
function fold(line: string) {
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const ch of line) {
    const size = encoder.encode(ch).length
    if (bytes + size > 75) {
      out.push(current)
      current = ' '
      bytes = 1
    }
    current += ch
    bytes += size
  }
  out.push(current)
  return out.join('\r\n')
}

export function buildIcs(events: EventDetail[]): string {
  const now = toUtcStamp(new Date().toISOString())
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Enchanted Twilight Invitation//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.id}-${toUtcStamp(e.startISO)}@enchanted-invitation`,
      `DTSTAMP:${now}`,
      `DTSTART:${toUtcStamp(e.startISO)}`,
      `DTEND:${toUtcStamp(e.endISO)}`,
      `SUMMARY:${escapeIcs(eventTitle(e))}`,
      `DESCRIPTION:${escapeIcs(eventDescription(e))}`,
      `LOCATION:${escapeIcs(`${e.venueName}, ${e.venueAddress}`)}`,
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcs(eventTitle(e))}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function downloadIcs(events: EventDetail[], filename: string) {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
