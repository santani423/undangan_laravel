import { wedding } from '../config/wedding'

const { locale, timeZone, timeZoneLabel } = wedding

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone })
    .format(new Date(iso))
    .replace(/\//g, ' · ')
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
    .format(new Date(iso))
    .replace(':', '.')
}

export function formatTimeRange(startISO: string, endISO: string): string {
  return `${formatTime(startISO)} – ${formatTime(endISO)} ${timeZoneLabel}`
}

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Milliseconds remaining, clamped at 0. */
  remaining: number
}

export function getCountdown(targetISO: string, now = Date.now()): CountdownParts {
  const remaining = Math.max(0, new Date(targetISO).getTime() - now)
  const s = Math.floor(remaining / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    remaining,
  }
}

/** Hours and minutes of "now" in the wedding timezone — drives the 3D timepiece hands. */
export function getZonedClock(now = new Date()): { h: number; m: number; s: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone,
  }).formatToParts(now)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return { h: get('hour') % 24, m: get('minute'), s: get('second') }
}
