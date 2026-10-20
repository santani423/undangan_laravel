import { useMemo } from 'react'
import { wedding } from '../config/wedding'

/** Personalised greeting from the link, e.g. …/?to=Budi+Santoso. Rendered as text, so it is never interpreted as HTML. */
export function useGuestName(): string {
  return useMemo(() => {
    const raw = new URLSearchParams(window.location.search).get(wedding.guest.queryParam)
    const clean = raw?.replace(/\s+/g, ' ').trim().slice(0, 60)
    return clean || wedding.guest.fallbackName
  }, [])
}
