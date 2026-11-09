import { MOCK_WISHES } from './mock';
import type { RsvpConfig, RsvpSubmission, Wish } from './types';

/**
 * Persistence boundary for RSVP + guestbook. The invitation endpoints are used when present;
 * otherwise a browser-only demo store keeps both forms fully working for previews.
 */
export interface RsvpService {
    /** Shown in the UI so guests know where their data goes. */
    readonly mode: 'local-demo' | 'remote';
    /** `sample`: the server accepted but did not store it (theme preview invitation). */
    submit(entry: RsvpSubmission): Promise<{ sample: boolean }>;
    addWish(name: string, message: string): Promise<{ wish: Wish; sample: boolean }>;
    listWishes(page: number): Promise<{ wishes: Wish[]; hasMore: boolean }>;
}

export type Errors = Partial<Record<'name' | 'attendance' | 'guests' | 'message', string>>;

export const LIMITS = { nameMin: 2, nameMax: 60, rsvpMessageMax: 300, wishMax: 280 };

export function validateRsvp(p: Partial<RsvpSubmission>, maxGuests: number): Errors {
    const e: Errors = {};
    const name = p.name?.trim() ?? '';
    if (name.length < LIMITS.nameMin) e.name = 'Mohon isi nama kamu (minimal 2 huruf).';
    else if (name.length > LIMITS.nameMax) e.name = `Nama terlalu panjang (maksimal ${LIMITS.nameMax} karakter).`;
    if (!p.attendance) e.attendance = 'Pilih salah satu: hadir atau tidak dapat hadir.';
    if (p.attendance === 'yes' && (!p.guests || p.guests < 1 || p.guests > maxGuests)) e.guests = `Jumlah tamu 1–${maxGuests} orang.`;
    if ((p.message?.length ?? 0) > LIMITS.rsvpMessageMax) e.message = `Maksimal ${LIMITS.rsvpMessageMax} karakter.`;
    return e;
}

export function validateWish(name: string, message: string): Errors {
    const e: Errors = {};
    const n = name.trim();
    if (n.length < LIMITS.nameMin) e.name = 'Mohon isi nama kamu (minimal 2 huruf).';
    else if (n.length > LIMITS.nameMax) e.name = `Nama terlalu panjang (maksimal ${LIMITS.nameMax} karakter).`;
    if (message.trim().length < 3) e.message = 'Tulis ucapan atau doa terlebih dahulu.';
    else if (message.length > LIMITS.wishMax) e.message = `Maksimal ${LIMITS.wishMax} karakter.`;
    return e;
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const draftWish = (name: string, message: string): Wish => ({
    id: newId(),
    name: name.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
});

/** Browser-only demo store, seeded with example wishes. Data never leaves this device. */
class LocalRsvpService implements RsvpService {
    readonly mode = 'local-demo' as const;
    private memory: Wish[] = MOCK_WISHES;

    constructor(private readonly key: string) {}

    private read(): Wish[] {
        try {
            const raw = window.localStorage.getItem(this.key);
            if (!raw) return this.memory;
            const parsed: unknown = JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as Wish[]).filter((w) => w && typeof w.message === 'string') : this.memory;
        } catch {
            return this.memory;
        }
    }

    private write(wishes: Wish[]) {
        this.memory = wishes;
        try {
            window.localStorage.setItem(this.key, JSON.stringify(wishes));
        } catch {
            /* private mode / storage blocked — keep in memory for this session */
        }
    }

    async submit() {
        await delay(650); // keeps the loading state visible, like a real request
        return { sample: false };
    }

    async addWish(name: string, message: string) {
        await delay(450);
        const wish = draftWish(name, message);
        this.write([wish, ...this.read()].slice(0, 100));
        return { wish, sample: false };
    }

    async listWishes() {
        return { wishes: this.read(), hasMore: false };
    }
}

const STATUS = { yes: 'attending', no: 'not_attending' } as const;
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

/** First validation message of a Laravel 422 response, or the response message. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
    const body = (await res.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
    const first = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return first || body?.message || fallback;
}

/** The invitation's public API: POST {endpoint} (RSVP + optional wish), GET/POST {wishesEndpoint}. */
class RemoteRsvpService implements RsvpService {
    readonly mode = 'remote' as const;

    constructor(
        private readonly endpoint: string,
        private readonly wishesEndpoint: string,
        private readonly guestSlug: string,
    ) {}

    private async post(url: string, body: Record<string, unknown>, fallback: string): Promise<{ sample: boolean }> {
        let res: Response;
        try {
            res = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });
        } catch {
            throw new Error('Server tidak dapat dihubungi. Periksa koneksi internet lalu coba lagi.');
        }
        if (!res.ok) throw new Error(await errorMessage(res, fallback));
        const data = (await res.json().catch(() => ({}))) as { sample?: boolean };
        return { sample: !!data.sample };
    }

    submit(entry: RsvpSubmission) {
        // The RSVP endpoint also files the message as a guestbook wish (when comments are allowed).
        return this.post(
            this.endpoint,
            {
                name: entry.name.trim(),
                number_of_guests: entry.attendance === 'yes' ? entry.guests : 1,
                rsvp_status: STATUS[entry.attendance],
                message: entry.message.trim() || undefined,
                guest_slug: this.guestSlug || undefined,
            },
            'Konfirmasi gagal terkirim. Silakan coba lagi.',
        );
    }

    async addWish(name: string, message: string) {
        const { sample } = await this.post(
            this.wishesEndpoint,
            { name: name.trim(), message: message.trim() },
            'Ucapan gagal terkirim. Coba lagi sebentar lagi.',
        );
        return { wish: draftWish(name, message), sample };
    }

    async listWishes(page: number) {
        if (!this.wishesEndpoint) return { wishes: [], hasMore: false };
        const res = await fetch(`${this.wishesEndpoint}?page=${page}`, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = (await res.json()) as { wishes?: { name?: string; message?: string; date?: string }[]; last_page?: number };
        const wishes: Wish[] = (d.wishes ?? []).map((w, i) => ({
            id: `p${page}-${i}`,
            name: w.name ?? '',
            message: w.message ?? '',
            createdAt: w.date ?? '',
        }));
        return { wishes, hasMore: d.last_page ? page < d.last_page : wishes.length >= 10 };
    }
}

export function createRsvpService(cfg: RsvpConfig, guestSlug: string): RsvpService {
    return cfg.endpoint || cfg.wishesEndpoint
        ? new RemoteRsvpService(cfg.endpoint, cfg.wishesEndpoint, guestSlug)
        : new LocalRsvpService(cfg.storageKey);
}
