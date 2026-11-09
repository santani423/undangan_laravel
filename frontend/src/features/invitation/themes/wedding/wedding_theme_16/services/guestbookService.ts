import { MOCK_WISHES } from '../lib/mock';
import { readJson, writeJson } from '../lib/storage';
import { LIMITS, sanitizeName, sanitizeText } from '../lib/validation';
import { delay, newId, postJson } from './http';

/** Only public fields are stored or displayed — no contact details. */
export interface GuestbookEntry {
    id: string;
    name: string;
    message: string;
    /** ISO date (entries written in this browser). */
    createdAt?: string;
    /** Ready-made label from the server, e.g. "2 hari yang lalu". */
    dateLabel?: string;
}

export interface GuestbookPage {
    entries: GuestbookEntry[];
    hasMore: boolean;
}

export interface GuestbookService {
    readonly mode: 'demo' | 'remote';
    /** Pages start at 1. */
    list(page: number): Promise<GuestbookPage>;
    submit(entry: { name: string; message: string }): Promise<{ entry: GuestbookEntry; sample: boolean }>;
}

function draft(entry: { name: string; message: string }): GuestbookEntry {
    return {
        id: newId('gb'),
        name: sanitizeName(entry.name),
        message: sanitizeText(entry.message, LIMITS.guestbookMessage),
        createdAt: new Date().toISOString(),
    };
}

/** Browser-only demo store, seeded with example wishes. Data never leaves this device. */
export function createDemoGuestbookService(key: string, pageSize: number): GuestbookService {
    const read = () => readJson<GuestbookEntry[]>(key, MOCK_WISHES);
    return {
        mode: 'demo',
        async list(page) {
            await delay(350);
            const all = read();
            return { entries: all.slice((page - 1) * pageSize, page * pageSize), hasMore: all.length > page * pageSize };
        },
        async submit(entry) {
            await delay(400);
            const created = draft(entry);
            writeJson(key, [created, ...read()].slice(0, 200));
            return { entry: created, sample: false };
        },
    };
}

/** The invitation's public API: GET {endpoint}?page= (10 per page), POST {endpoint} { name, message }. */
export function createRemoteGuestbookService(endpoint: string): GuestbookService {
    return {
        mode: 'remote',
        async list(page) {
            const url = new URL(endpoint, window.location.href);
            url.searchParams.set('page', String(page));
            const response = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!response.ok) throw new Error(`Gagal memuat ucapan (HTTP ${response.status}).`);
            const body = (await response.json()) as { wishes?: { name?: string; message?: string; date?: string }[]; last_page?: number };
            const entries = (body.wishes ?? []).map((w, i) => ({
                id: `p${page}-${i}`,
                name: sanitizeName(w.name ?? ''),
                message: sanitizeText(w.message ?? '', 1000),
                dateLabel: w.date ?? '',
            }));
            return { entries, hasMore: body.last_page ? page < body.last_page : entries.length >= 10 };
        },
        async submit(entry) {
            const created = draft(entry);
            const { sample } = await postJson(endpoint, { name: created.name, message: created.message }, 'Ucapan gagal dikirim.');
            return { entry: created, sample };
        },
    };
}

export function createGuestbookService(endpoint: string, slug: string, pageSize: number): GuestbookService {
    return endpoint ? createRemoteGuestbookService(endpoint) : createDemoGuestbookService(`wt16:${slug}:guestbook`, pageSize);
}

// The RSVP endpoint also files its message as a wish: lets the guestbook reload after an RSVP.
const listeners = new Set<() => void>();

export function onGuestbookChanged(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function notifyGuestbookChanged(): void {
    listeners.forEach((listener) => listener());
}
