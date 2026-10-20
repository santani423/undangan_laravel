import { wedding } from '../config/wedding'
import { prefs } from '../lib/device'

export interface Wish {
  id: string
  name: string
  message: string
  createdAt: string
}

export type GuestbookMode = 'endpoint' | 'local'

const LOCAL_KEY = 'etf-guestbook-demo'

export function getGuestbookMode(): GuestbookMode {
  return wedding.guestbook.endpoint ? 'endpoint' : 'local'
}

function readLocal(): Wish[] {
  try {
    const parsed = JSON.parse(prefs.get(LOCAL_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((w) => w && typeof w.message === 'string') : []
  } catch {
    return []
  }
}

/**
 * Endpoint contract:
 *   GET  {endpoint}?type=wishes        → `{ wishes: Wish[] }` (only approved wishes when moderated)
 *   POST {endpoint} `{ type: "wish", name, message }` → `{ ok: true, wish?: Wish, pending?: boolean }`
 */
export async function listWishes(signal?: AbortSignal): Promise<Wish[]> {
  if (getGuestbookMode() === 'local') return readLocal()
  const url = new URL(wedding.guestbook.endpoint!, window.location.href)
  url.searchParams.set('type', 'wishes')
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Guestbook failed (${res.status})`)
  const data = await res.json()
  return Array.isArray(data?.wishes) ? data.wishes : []
}

export async function addWish(name: string, message: string): Promise<{ wish: Wish | null; pending: boolean }> {
  const draft: Wish = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  }
  if (getGuestbookMode() === 'local') {
    const next = [draft, ...readLocal()].slice(0, 100)
    prefs.set(LOCAL_KEY, JSON.stringify(next))
    return { wish: draft, pending: false }
  }
  const res = await fetch(wedding.guestbook.endpoint!, {
    method: 'POST',
    body: JSON.stringify({ type: 'wish', name: draft.name, message: draft.message }),
  })
  if (!res.ok) throw new Error(`Guestbook failed (${res.status})`)
  const data = await res.json().catch(() => ({}))
  if (data?.ok === false) throw new Error(data.error || 'Wish rejected')
  const pending = data?.pending ?? wedding.guestbook.moderation === 'pre'
  return { wish: pending ? null : (data?.wish ?? draft), pending }
}
