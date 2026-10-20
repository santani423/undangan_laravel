import { MAX_GUESTS } from './data';
import { MOCK_WISHES } from './mock';
import type { Attendance, RsvpConfig, RsvpRecord, RsvpSubmission } from './types';

/**
 * Persistence boundary for RSVP + guestbook. The invitation endpoints are used when present;
 * otherwise a browser-only demo store keeps the form fully working for previews.
 */
export interface RsvpService {
    /** Shown in the UI so guests know where their data goes. */
    readonly mode: 'local-demo' | 'remote';
    submit(entry: RsvpSubmission): Promise<RsvpRecord>;
    /** Guestbook wish without an RSVP (used when the RSVP feature is off). */
    submitWish(name: string, message: string): Promise<RsvpRecord>;
    list(page: number): Promise<{ records: RsvpRecord[]; hasMore: boolean }>;
}

export interface ValidationErrors {
    name?: string;
    attendance?: string;
    guests?: string;
    message?: string;
}

export const LIMITS = { nameMin: 2, nameMax: 60, guestsMax: MAX_GUESTS, messageMax: 280 };

export function validateWish(name: string, message: string): ValidationErrors {
    const errors: ValidationErrors = {};
    const n = name.trim();
    if (n.length < LIMITS.nameMin) errors.name = 'Mohon isi nama Anda (minimal 2 huruf).';
    else if (n.length > LIMITS.nameMax) errors.name = `Nama maksimal ${LIMITS.nameMax} karakter.`;
    if (!message.trim()) errors.message = 'Mohon tuliskan ucapan & doa Anda.';
    else if (message.length > LIMITS.messageMax) errors.message = `Ucapan maksimal ${LIMITS.messageMax} karakter.`;
    return errors;
}

export function validateRsvp(input: Partial<RsvpSubmission>): ValidationErrors {
    const errors: ValidationErrors = {};
    const name = (input.name ?? '').trim();
    if (name.length < LIMITS.nameMin) errors.name = 'Mohon isi nama Anda (minimal 2 huruf).';
    else if (name.length > LIMITS.nameMax) errors.name = `Nama maksimal ${LIMITS.nameMax} karakter.`;
    if (!input.attendance) errors.attendance = 'Mohon pilih konfirmasi kehadiran.';
    if (input.attendance === 'hadir') {
        const g = Number(input.guests);
        if (!Number.isInteger(g) || g < 1 || g > LIMITS.guestsMax) errors.guests = `Jumlah tamu 1–${LIMITS.guestsMax} orang.`;
    }
    if ((input.message ?? '').length > LIMITS.messageMax) errors.message = `Ucapan maksimal ${LIMITS.messageMax} karakter.`;
    return errors;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function toRecord(entry: RsvpSubmission, storage: RsvpRecord['storage']): RsvpRecord {
    return {
        id: newId(),
        name: entry.name.trim(),
        message: entry.message.trim(),
        attendance: entry.attendance,
        guests: entry.attendance === 'hadir' ? entry.guests : 0,
        when: new Date().toISOString(),
        storage,
    };
}

/** Browser-only demo store, seeded with example wishes. Data never leaves this device. */
class LocalRsvpService implements RsvpService {
    readonly mode = 'local-demo' as const;
    private memory: RsvpRecord[] = MOCK_WISHES;

    constructor(private readonly key: string) {}

    private read(): RsvpRecord[] {
        try {
            const raw = window.localStorage.getItem(this.key);
            if (!raw) return this.memory;
            const parsed: unknown = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as RsvpRecord[]) : this.memory;
        } catch {
            return this.memory;
        }
    }

    private write(records: RsvpRecord[]) {
        this.memory = records;
        try {
            window.localStorage.setItem(this.key, JSON.stringify(records));
        } catch {
            /* private mode / storage blocked — keep in memory for this session */
        }
    }

    async submit(entry: RsvpSubmission): Promise<RsvpRecord> {
        if (Object.keys(validateRsvp(entry)).length) throw new Error('Data belum lengkap.');
        await new Promise((r) => setTimeout(r, 650)); // keeps the loading state visible, like a real request
        const record = toRecord(entry, 'local');
        this.write([record, ...this.read()].slice(0, 200));
        return record;
    }

    async submitWish(name: string, message: string): Promise<RsvpRecord> {
        if (Object.keys(validateWish(name, message)).length) throw new Error('Data belum lengkap.');
        await new Promise((r) => setTimeout(r, 450));
        const record: RsvpRecord = { id: newId(), name: name.trim(), message: message.trim(), when: new Date().toISOString(), storage: 'local' };
        this.write([record, ...this.read()].slice(0, 200));
        return record;
    }

    async list() {
        return { records: this.read(), hasMore: false };
    }
}

const STATUS: Record<Attendance, string> = { hadir: 'attending', tidak: 'not_attending', ragu: 'maybe' };
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

/** First validation message of a Laravel 422 response, or the response message. */
async function errorMessage(res: Response): Promise<string> {
    const body = (await res.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
    const first = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return first || body?.message || 'Konfirmasi belum terkirim. Silakan coba lagi.';
}

/** The invitation's public API: POST {endpoint} (RSVP + optional wish), GET {wishesEndpoint}?page=. */
class RemoteRsvpService implements RsvpService {
    readonly mode = 'remote' as const;

    constructor(
        private readonly endpoint: string,
        private readonly wishesEndpoint: string,
        private readonly guestSlug: string,
    ) {}

    private async post(url: string, body: Record<string, unknown>) {
        let res: Response;
        try {
            res = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });
        } catch {
            throw new Error('Server tidak dapat dihubungi. Periksa koneksi internet Anda.');
        }
        if (!res.ok) throw new Error(await errorMessage(res));
    }

    async submit(entry: RsvpSubmission): Promise<RsvpRecord> {
        if (Object.keys(validateRsvp(entry)).length) throw new Error('Data belum lengkap.');
        // The RSVP endpoint also files the message as a guestbook wish (when comments are allowed).
        await this.post(this.endpoint, {
            name: entry.name.trim(),
            number_of_guests: entry.attendance === 'hadir' ? entry.guests : 1,
            rsvp_status: STATUS[entry.attendance],
            message: entry.message.trim() || undefined,
            guest_slug: this.guestSlug || undefined,
        });
        return toRecord(entry, 'remote');
    }

    async submitWish(name: string, message: string): Promise<RsvpRecord> {
        if (Object.keys(validateWish(name, message)).length) throw new Error('Data belum lengkap.');
        await this.post(this.wishesEndpoint, { name: name.trim(), message: message.trim() });
        return { id: newId(), name: name.trim(), message: message.trim(), when: new Date().toISOString(), storage: 'remote' };
    }

    async list(page: number) {
        if (!this.wishesEndpoint) return { records: [], hasMore: false };
        const res = await fetch(`${this.wishesEndpoint}?page=${page}`, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = (await res.json()) as { wishes?: { name?: string; message?: string; date?: string }[]; last_page?: number };
        const records: RsvpRecord[] = (d.wishes ?? []).map((w, i) => ({
            id: `p${page}-${i}`,
            name: w.name ?? '',
            message: w.message ?? '',
            when: w.date ?? '',
            storage: 'remote',
        }));
        return { records, hasMore: d.last_page ? page < d.last_page : records.length >= 10 };
    }
}

export function createRsvpService(cfg: RsvpConfig, guestSlug: string): RsvpService {
    return cfg.endpoint || cfg.wishesEndpoint
        ? new RemoteRsvpService(cfg.endpoint, cfg.wishesEndpoint, guestSlug)
        : new LocalRsvpService(cfg.storageKey);
}
