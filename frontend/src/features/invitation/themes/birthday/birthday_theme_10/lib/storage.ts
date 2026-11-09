/**
 * localStorage wrapper that never throws (private mode, blocked storage,
 * quota errors). `writeJson` reports whether the value was really persisted.
 */
export function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

export function writeJson(key: string, value: unknown): boolean {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}
