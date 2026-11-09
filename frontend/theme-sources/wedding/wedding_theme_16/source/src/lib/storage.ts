/**
 * localStorage wrapper that never throws (private mode, blocked storage,
 * quota errors) and falls back to in-memory storage for the session.
 */
const memory = new Map<string, string>();

function storage(): Storage | null {
  try {
    const probe = '__undesia_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const store = storage();
    const raw = store ? store.getItem(key) : (memory.get(key) ?? null);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  const raw = JSON.stringify(value);
  const store = storage();
  try {
    if (store) {
      store.setItem(key, raw);
      return;
    }
  } catch {
    // Quota exceeded: keep a session copy below.
  }
  memory.set(key, raw);
}

/** Stable anonymous id for this browser, used as an idempotency key. */
export function getDeviceId(): string {
  const key = 'undesia:device-id';
  const existing = readJson<string | null>(key, null);
  if (existing) return existing;
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  writeJson(key, id);
  return id;
}
