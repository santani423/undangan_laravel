import { readJson, writeJson } from '../lib/browser';
import { wait } from '../lib/helpers';
import { MOCK_WISHES } from '../lib/mock';
import type { RsvpPayload, SmileConfig, Wish } from '../lib/types';

export type SubmitResult = { ok: true; mode: 'demo' | 'remote'; sample: boolean } | { ok: false; error: string };

export interface WishPage {
    wishes: Wish[];
    hasMore: boolean;
}

/**
 * Persistence for the RSVP signboard.
 * - `demo` (no endpoint): answers and wishes stay in this browser's localStorage, and the form says so.
 * - `remote`: posts to the invitation's RSVP / wishes endpoints; the server files an RSVP message as a wish.
 * Both remember this device's last answer so a returning guest sees (and can edit) it.
 */
export interface RsvpService {
    readonly mode: 'demo' | 'remote';
    submit(payload: RsvpPayload): Promise<SubmitResult>;
    /** Wish only (RSVP switched off, wishes on). */
    submitWish(name: string, message: string): Promise<SubmitResult>;
    /** Pages start at 1. */
    listWishes(page: number): Promise<WishPage>;
    getOwnSubmission(): RsvpPayload | null;
}

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
const DEMO_PAGE = 10;

/** First validation message of a Laravel 422 response, or the response message. */
async function errorMessage(response: Response, fallback: string): Promise<string> {
    const body = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
    const first = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return first || body?.message || `${fallback} (HTTP ${response.status})`;
}

/** POSTs JSON; resolves to `{ sample }` (true when a theme-preview invitation accepted but did not store it). */
async function postJson(url: string, body: Record<string, unknown>, fallback: string): Promise<{ sample: boolean }> {
    let response: Response;
    try {
        response = await fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });
    } catch {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.');
    }
    if (!response.ok) throw new Error(await errorMessage(response, fallback));
    const data = (await response.json().catch(() => ({}))) as { sample?: boolean };
    return { sample: Boolean(data.sample) };
}

function createDemoService(ownKey: string, wishesKey: string): RsvpService {
    const stored = () => readJson<Wish[]>(wishesKey, []);
    const saveWish = (name: string, message: string) => {
        const list = stored().filter((w) => w.id !== 'own');
        if (message) list.unshift({ id: 'own', name, message, submittedAt: new Date().toISOString() });
        return writeJson(wishesKey, list);
    };
    const unavailable = { ok: false as const, error: 'Penyimpanan perangkat tidak tersedia (mode privat?). Jawaban belum tersimpan.' };

    return {
        mode: 'demo',
        async submit(payload) {
            await wait(600); // keeps the sending state visible, like a real request
            return writeJson(ownKey, payload) && saveWish(payload.name, payload.message) ? { ok: true, mode: 'demo', sample: false } : unavailable;
        },
        async submitWish(name, message) {
            await wait(450);
            return saveWish(name, message) ? { ok: true, mode: 'demo', sample: false } : unavailable;
        },
        async listWishes(page) {
            const all = [...stored(), ...MOCK_WISHES];
            return { wishes: all.slice((page - 1) * DEMO_PAGE, page * DEMO_PAGE), hasMore: all.length > page * DEMO_PAGE };
        },
        getOwnSubmission() {
            return readJson<RsvpPayload | null>(ownKey, null);
        },
    };
}

interface ApiWishes {
    wishes?: { name?: string; message?: string; date?: string }[];
    last_page?: number;
}

function createRemoteService(rsvpEndpoint: string, wishesEndpoint: string, ownKey: string, guestSlug: string): RsvpService {
    const fail = (error: unknown): SubmitResult => ({
        ok: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
    });
    return {
        mode: 'remote',
        async submit(payload) {
            if (!rsvpEndpoint) return { ok: false, error: 'Konfirmasi kehadiran belum dibuka untuk undangan ini.' };
            try {
                const { sample } = await postJson(
                    rsvpEndpoint,
                    {
                        name: payload.name,
                        number_of_guests: payload.attendance === 'yes' ? payload.guests : 1,
                        rsvp_status: payload.attendance === 'yes' ? 'attending' : 'not_attending',
                        message: payload.message || undefined,
                        guest_slug: guestSlug || undefined,
                    },
                    'Konfirmasi gagal dikirim.',
                );
                writeJson(ownKey, payload);
                return { ok: true, mode: 'remote', sample };
            } catch (error) {
                return fail(error);
            }
        },
        async submitWish(name, message) {
            if (!wishesEndpoint) return { ok: false, error: 'Ucapan belum dibuka untuk undangan ini.' };
            try {
                const { sample } = await postJson(wishesEndpoint, { name, message }, 'Ucapan gagal dikirim.');
                return { ok: true, mode: 'remote', sample };
            } catch (error) {
                return fail(error);
            }
        },
        async listWishes(page) {
            if (!wishesEndpoint) return { wishes: [], hasMore: false };
            try {
                const url = new URL(wishesEndpoint, window.location.href);
                url.searchParams.set('page', String(page));
                const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const body = (await response.json()) as ApiWishes;
                const wishes = (body.wishes ?? []).map((w, i) => ({
                    id: `p${page}-${i}`,
                    name: (w.name ?? '').trim() || 'Tamu',
                    message: (w.message ?? '').trim(),
                    dateLabel: w.date ?? '',
                }));
                return { wishes, hasMore: body.last_page ? page < body.last_page : wishes.length >= 10 };
            } catch {
                return { wishes: [], hasMore: false };
            }
        },
        getOwnSubmission() {
            return readJson<RsvpPayload | null>(ownKey, null);
        },
    };
}

export function createRsvpService(config: SmileConfig): RsvpService {
    const { slug, guestSlug } = config.meta;
    const ownKey = `bt11:${slug}:${guestSlug || 'umum'}:rsvp`;
    return config.rsvp.endpoint || config.wishesEndpoint
        ? createRemoteService(config.rsvp.endpoint, config.wishesEndpoint, ownKey, guestSlug)
        : createDemoService(ownKey, `bt11:${slug}:wishes`);
}
