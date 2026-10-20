import type { EventDetail } from '../config/types'

/** Prefix a public-folder path with Vite's base URL so sub-path deployments work. */
export function asset(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}

export function mapsUrlFor(e: EventDetail): string {
  if (e.mapsUrl) return e.mapsUrl
  const query = encodeURIComponent(`${e.venueName}, ${e.venueAddress}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export function normalizeWhatsapp(raw?: string): string | null {
  if (!raw || /x/i.test(raw)) return null
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  return digits.length >= 9 && digits.length <= 15 ? digits : null
}

export function whatsappUrl(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
