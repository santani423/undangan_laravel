import { wedding } from '../config/wedding'
import { normalizeWhatsapp, whatsappUrl } from '../lib/links'

export type RsvpMode = 'endpoint' | 'whatsapp' | 'demo'

export interface RsvpPayload {
  name: string
  attendance: 'yes' | 'no'
  guests: number
  message: string
}

export function getRsvpMode(): RsvpMode {
  if (wedding.rsvp.endpoint) return 'endpoint'
  if (normalizeWhatsapp(wedding.rsvp.whatsappNumber)) return 'whatsapp'
  return 'demo'
}

export function buildRsvpWhatsappText(p: RsvpPayload): string {
  const lines = [
    `Halo, saya ingin konfirmasi kehadiran untuk pernikahan ${wedding.couple.displayNames}.`,
    '',
    `Nama: ${p.name}`,
    `Kehadiran: ${p.attendance === 'yes' ? 'Hadir' : 'Mohon maaf, tidak dapat hadir'}`,
  ]
  if (p.attendance === 'yes') lines.push(`Jumlah tamu: ${p.guests} orang`)
  if (p.message.trim()) lines.push(`Catatan: ${p.message.trim()}`)
  return lines.join('\n')
}

export function rsvpWhatsappUrl(p: RsvpPayload): string {
  const number = normalizeWhatsapp(wedding.rsvp.whatsappNumber)
  if (!number) throw new Error('WhatsApp number is not configured')
  return whatsappUrl(number, buildRsvpWhatsappText(p))
}

/**
 * Endpoint contract: POST JSON `{ type: "rsvp", name, attendance, guests, message, submittedAt }`.
 * Any 2xx response with optional `{ ok: true }` counts as saved.
 * The body is sent as text/plain so it works with Google Apps Script without a CORS preflight.
 */
export async function postRsvp(p: RsvpPayload, signal?: AbortSignal): Promise<void> {
  const endpoint = wedding.rsvp.endpoint
  if (!endpoint) throw new Error('RSVP endpoint is not configured')
  const res = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ type: 'rsvp', ...p, submittedAt: new Date().toISOString() }),
    signal,
  })
  if (!res.ok) throw new Error(`RSVP failed (${res.status})`)
  const data = await res.json().catch(() => ({}))
  if (data && data.ok === false) throw new Error(data.error || 'RSVP rejected')
}
