import { invitationConfig } from '../config/invitation.config';
import type { RsvpPayload, Wish } from '../types/invitation';

export type SubmitResult =
  | { ok: true; mode: 'demo' | 'remote' }
  | { ok: false; error: string };

/**
 * Submission interface used by the RSVP form. Swap the implementation (or set
 * `rsvp.endpoint` in invitation.config.ts) to connect a real backend.
 */
export interface RsvpService {
  readonly mode: 'demo' | 'remote';
  submit(payload: RsvpPayload): Promise<SubmitResult>;
  listWishes(): Promise<Wish[]>;
  /** Previous answer from this device, so returning guests can edit it. */
  getOwnSubmission(): RsvpPayload | null;
}

const OWN_KEY = 'toy-world:rsvp:own';
const WISHES_KEY = 'toy-world:rsvp:wishes';

const now = Date.now();
const EXAMPLE_WISHES: Wish[] = [
  {
    id: 'contoh-1',
    name: 'Tante Rina',
    attendance: 'hadir',
    wish: 'Selamat ulang tahun, Kirana sayang! Semoga makin pintar, sehat, dan selalu ceria.',
    submittedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    example: true,
  },
  {
    id: 'contoh-2',
    name: 'Bima & Keluarga',
    attendance: 'hadir',
    wish: 'Hore, Kirana 6 tahun! Sampai ketemu di pesta, kita main balok bareng ya!',
    submittedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    example: true,
  },
  {
    id: 'contoh-3',
    name: 'Opa Hendra',
    attendance: 'tidak',
    wish: 'Maaf Opa belum bisa datang. Doa terbaik untuk cucu Opa tersayang.',
    submittedAt: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
    example: true,
  },
];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Demo mode: data stays in this browser only. Nothing is sent to any server. */
class DemoRsvpService implements RsvpService {
  readonly mode = 'demo' as const;

  async submit(payload: RsvpPayload): Promise<SubmitResult> {
    await delay(650);
    const wishes = readJSON<Wish[]>(WISHES_KEY, []).filter((w) => w.id !== 'own');
    if (payload.wish.trim()) {
      wishes.unshift({ id: 'own', name: payload.name, attendance: payload.attendance, wish: payload.wish, submittedAt: payload.submittedAt });
    }
    const saved = writeJSON(OWN_KEY, payload) && writeJSON(WISHES_KEY, wishes);
    if (!saved) return { ok: false, error: 'Penyimpanan perangkat tidak tersedia (mode privat?). Jawaban belum tersimpan.' };
    return { ok: true, mode: 'demo' };
  }

  async listWishes() {
    return [...readJSON<Wish[]>(WISHES_KEY, []), ...EXAMPLE_WISHES];
  }

  getOwnSubmission() {
    return readJSON<RsvpPayload | null>(OWN_KEY, null);
  }
}

/** Remote mode: POSTs JSON to `rsvp.endpoint`; GET on the same URL may return `Wish[]`. */
class RemoteRsvpService implements RsvpService {
  readonly mode = 'remote' as const;
  constructor(private readonly endpoint: string) {}

  async submit(payload: RsvpPayload): Promise<SubmitResult> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { ok: false, error: `Server menolak permintaan (${res.status}). Silakan coba lagi.` };
      writeJSON(OWN_KEY, payload);
      return { ok: true, mode: 'remote' };
    } catch {
      return { ok: false, error: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.' };
    }
  }

  async listWishes() {
    try {
      const res = await fetch(this.endpoint, { headers: { Accept: 'application/json' } });
      if (!res.ok) return [];
      const data: unknown = await res.json();
      return Array.isArray(data) ? (data as Wish[]) : [];
    } catch {
      return [];
    }
  }

  getOwnSubmission() {
    return readJSON<RsvpPayload | null>(OWN_KEY, null);
  }
}

export const rsvpService: RsvpService = invitationConfig.rsvp.endpoint
  ? new RemoteRsvpService(invitationConfig.rsvp.endpoint)
  : new DemoRsvpService();
