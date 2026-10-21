import { getDeviceId, readJson, writeJson } from '../lib/storage';
import { LIMITS, sanitizeName, sanitizeText } from '../lib/validation';

/** Only public fields are stored or displayed — no contact details. */
export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface GuestbookService {
  readonly mode: 'demo' | 'remote';
  list(): Promise<GuestbookEntry[]>;
  submit(entry: { name: string; message: string }): Promise<GuestbookEntry>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `gb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clean(entry: { name: string; message: string }) {
  return { name: sanitizeName(entry.name), message: sanitizeText(entry.message, LIMITS.guestbookMessage) };
}

export function createDemoGuestbookService(slug: string): GuestbookService {
  const key = `undesia:${slug}:guestbook`;
  return {
    mode: 'demo',
    async list() {
      await delay(350);
      return readJson<GuestbookEntry[]>(key, []);
    },
    async submit(entry) {
      await delay(400);
      const created: GuestbookEntry = { ...clean(entry), id: newId(), createdAt: new Date().toISOString() };
      writeJson(key, [created, ...readJson<GuestbookEntry[]>(key, [])].slice(0, 200));
      return created;
    },
  };
}

export function createRemoteGuestbookService(endpoint: string, slug: string): GuestbookService {
  const url = new URL(endpoint, window.location.href);
  url.searchParams.set('invitation', slug);
  return {
    mode: 'remote',
    async list() {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Gagal memuat ucapan (HTTP ${response.status}).`);
      const entries = (await response.json()) as GuestbookEntry[];
      return entries.map((e) => ({ id: String(e.id), name: sanitizeName(e.name), message: sanitizeText(e.message, LIMITS.guestbookMessage), createdAt: e.createdAt }));
    },
    async submit(entry) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${getDeviceId()}:${Date.now()}` },
        body: JSON.stringify({ ...clean(entry), invitation: slug }),
      });
      if (!response.ok) throw new Error(`Ucapan gagal dikirim (HTTP ${response.status}).`);
      return (await response.json()) as GuestbookEntry;
    },
  };
}

export function createGuestbookService(endpoint: string | undefined, slug: string): GuestbookService {
  return endpoint ? createRemoteGuestbookService(endpoint, slug) : createDemoGuestbookService(slug);
}
