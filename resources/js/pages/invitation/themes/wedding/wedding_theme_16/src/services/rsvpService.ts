import { getDeviceId, readJson, writeJson } from '../lib/storage';
import { sanitizeName, sanitizeText, LIMITS, type Attendance } from '../lib/validation';

export interface RsvpSubmission {
  guestName: string;
  attendance: Attendance;
  attendees: number;
  message: string;
}

export interface RsvpRecord extends RsvpSubmission {
  id: string;
  submittedAt: string;
}

export interface RsvpResult {
  record: RsvpRecord;
  /** True when an earlier response from this device was replaced. */
  updated: boolean;
}

/**
 * RSVP persistence. `demo` keeps the response on this device only (and the
 * UI says so); `remote` posts JSON to the configured endpoint.
 */
export interface RsvpService {
  readonly mode: 'demo' | 'remote';
  getOwnResponse(): Promise<RsvpRecord | null>;
  submit(submission: RsvpSubmission): Promise<RsvpResult>;
}

function normalise(submission: RsvpSubmission): RsvpSubmission {
  return {
    guestName: sanitizeName(submission.guestName),
    attendance: submission.attendance,
    attendees: submission.attendance === 'hadir' ? submission.attendees : 0,
    message: sanitizeText(submission.message, LIMITS.rsvpMessage),
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createDemoRsvpService(slug: string): RsvpService {
  const key = `undesia:${slug}:rsvp`;
  return {
    mode: 'demo',
    async getOwnResponse() {
      return readJson<RsvpRecord | null>(key, null);
    },
    async submit(submission) {
      await delay(450);
      const previous = readJson<RsvpRecord | null>(key, null);
      const record: RsvpRecord = { ...normalise(submission), id: previous?.id ?? getDeviceId(), submittedAt: new Date().toISOString() };
      writeJson(key, record);
      return { record, updated: Boolean(previous) };
    },
  };
}

export function createRemoteRsvpService(endpoint: string, slug: string): RsvpService {
  const localKey = `undesia:${slug}:rsvp-remote`;
  return {
    mode: 'remote',
    async getOwnResponse() {
      return readJson<RsvpRecord | null>(localKey, null);
    },
    async submit(submission) {
      const previous = readJson<RsvpRecord | null>(localKey, null);
      const payload = { ...normalise(submission), invitation: slug };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': getDeviceId() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`RSVP gagal dikirim (HTTP ${response.status}).`);
      const body = (await response.json().catch(() => ({}))) as Partial<RsvpRecord>;
      const record: RsvpRecord = { ...payload, id: body.id ?? getDeviceId(), submittedAt: body.submittedAt ?? new Date().toISOString() };
      writeJson(localKey, record);
      return { record, updated: Boolean(previous) };
    },
  };
}

export function createRsvpService(endpoint: string | undefined, slug: string): RsvpService {
  return endpoint ? createRemoteRsvpService(endpoint, slug) : createDemoRsvpService(slug);
}
