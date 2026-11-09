import { useMemo } from 'react'

/**
 * Personalised guest name from the URL: ?to=Nama+Tamu (also accepts ?kepada= / ?guest=).
 * Rendered as React text (never HTML) and trimmed to a sane length.
 */
export function useGuestName(): string | null {
  return useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const raw = params.get('to') ?? params.get('kepada') ?? params.get('guest')
      if (!raw) return null
      const clean = raw.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60)
      return clean || null
    } catch {
      return null
    }
  }, [])
}
