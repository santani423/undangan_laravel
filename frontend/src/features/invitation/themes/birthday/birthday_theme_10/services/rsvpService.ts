import { MOCK_WISHES } from '../lib/mock';
import { readJson, writeJson } from '../lib/storage';
import type { Attendance, RsvpPayload, ToyConfig, Wish } from '../lib/types';
import { delay, getJson, postJson } from './http';

export type SubmitResult = { ok: true; mode: 'demo' | 'remote'; sample: boolean } | { ok: false; error: string };

export interface WishPage {
    wishes: Wish[];
    hasMore: boolean;
}

/**
 * Persistence used by the RSVP form and the wishes wall.
 * - `demo` (no endpoint): answers and wishes stay in this browser's localStorage, and the UI says so.
 * - `remote`: posts to the invitation's RSVP / wishes endpoints; the server files an RSVP message as a wish.
 * Both remember this device's last answer so a returning guest sees (and can edit) it.
 */
export interface RsvpService {
    readonly mode: 'demo' | 'remote';
    /** RSVP with attendance (the RSVP feature) … */
    submit(payload: RsvpPayload): Promise<SubmitResult>;
    /** … or only a wish (RSVP switched off, wishes on). */
    submitWish(name: string, wish: string): Promise<SubmitResult>;
    /** Pages start at 1. */
    listWishes(page: number): Promise<WishPage>;
    getOwnSubmission(): RsvpPayload | null;
}

/** Attendance values of the RSVP API (`rsvp_status`). */
const STATUS: Record<Attendance, string> = { hadir: 'attending', tidak: 'not_attending', ragu: 'maybe' };
const DEMO_PAGE = 10;

function createDemoService(ownKey: string, wishesKey: string): RsvpService {
    const stored = () => readJson<Wish[]>(wishesKey, []);
    const saveWish = (name: string, wish: string, attendance?: Attendance) => {
        const list = stored().filter((w) => w.id !== 'own');
        if (wish) list.unshift({ id: 'own', name, wish, attendance, submittedAt: new Date().toISOString() });
        return writeJson(wishesKey, list);
    };
    const unavailable = { ok: false as const, error: 'Penyimpanan perangkat tidak tersedia (mode privat?). Jawaban belum tersimpan.' };

    return {
        mode: 'demo',
        async submit(payload) {
            await delay(650); // keeps the loading state visible, like a real request
            const saved = writeJson(ownKey, payload) && saveWish(payload.name, payload.wish, payload.attendance);
            return saved ? { ok: true, mode: 'demo', sample: false } : unavailable;
        },
        async submitWish(name, wish) {
            await delay(500);
            return saveWish(name, wish) ? { ok: true, mode: 'demo', sample: false } : unavailable;
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
            try {
                const { sample } = await postJson(
                    rsvpEndpoint,
                    {
                        name: payload.name,
                        // The API counts the guest too (min 1).
                        number_of_guests: payload.attendance === 'hadir' ? 1 + payload.companions : 1,
                        rsvp_status: STATUS[payload.attendance],
                        message: payload.wish || undefined,
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
        async submitWish(name, wish) {
            try {
                const { sample } = await postJson(wishesEndpoint, { name, message: wish }, 'Ucapan gagal dikirim.');
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
                const body = await getJson<ApiWishes>(url.toString());
                const wishes = (body.wishes ?? []).map((w, i) => ({
                    id: `p${page}-${i}`,
                    name: (w.name ?? '').trim() || 'Tamu',
                    wish: (w.message ?? '').trim(),
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

export function createRsvpService(config: ToyConfig): RsvpService {
    const { slug, guestSlug } = config.meta;
    const ownKey = `bt10:${slug}:${guestSlug || 'umum'}:rsvp`;
    return config.rsvp.endpoint || config.wishesEndpoint
        ? createRemoteService(config.rsvp.endpoint, config.wishesEndpoint, ownKey, guestSlug)
        : createDemoService(ownKey, `bt10:${slug}:wishes`);
}
