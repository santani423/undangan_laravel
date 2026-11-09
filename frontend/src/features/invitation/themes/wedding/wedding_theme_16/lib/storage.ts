/**
 * localStorage wrapper that never throws (private mode, blocked storage,
 * quota errors) and falls back to in-memory storage for the session.
 */
const memory = new Map<string, string>();

function storage(): Storage | null {
    try {
        const probe = '__wt16_probe__';
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
