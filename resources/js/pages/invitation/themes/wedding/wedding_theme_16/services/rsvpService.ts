import { readJson, writeJson } from '../lib/storage';
import { LIMITS, sanitizeName, sanitizeText, type Attendance } from '../lib/validation';
import { delay, postJson } from './http';

export interface RsvpSubmission {
    guestName: string;
    attendance: Attendance;
    attendees: number;
    message: string;
}

export interface RsvpRecord extends RsvpSubmission {
    submittedAt: string;
}

export interface RsvpResult {
    record: RsvpRecord;
    /** True when an earlier response from this device was replaced. */
    updated: boolean;
    /** True when a theme-preview invitation accepted the form without storing it. */
    sample: boolean;
}

/**
 * RSVP persistence. `demo` keeps the response on this device only (and the
 * UI says so); `remote` posts to the invitation's RSVP endpoint. Both remember
 * this device's last answer so the guest sees (and can edit) it on return.
 */
export interface RsvpService {
    readonly mode: 'demo' | 'remote';
    getOwnResponse(): Promise<RsvpRecord | null>;
    submit(submission: RsvpSubmission): Promise<RsvpResult>;
}

/** Attendance values of the RSVP API (`rsvp_status`). */
const STATUS: Record<Attendance, string> = { hadir: 'attending', 'tidak-hadir': 'not_attending', ragu: 'maybe' };

function normalise(submission: RsvpSubmission): RsvpSubmission {
    return {
        guestName: sanitizeName(submission.guestName),
        attendance: submission.attendance,
        attendees: submission.attendance === 'hadir' ? submission.attendees : 0,
        message: sanitizeText(submission.message, LIMITS.rsvpMessage),
    };
}

function remember(key: string, submission: RsvpSubmission, sample: boolean): RsvpResult {
    const previous = readJson<RsvpRecord | null>(key, null);
    const record: RsvpRecord = { ...submission, submittedAt: new Date().toISOString() };
    writeJson(key, record);
    return { record, updated: Boolean(previous), sample };
}

export function createDemoRsvpService(key: string): RsvpService {
    return {
        mode: 'demo',
        async getOwnResponse() {
            return readJson<RsvpRecord | null>(key, null);
        },
        async submit(submission) {
            await delay(450); // keeps the loading state visible, like a real request
            return remember(key, normalise(submission), false);
        },
    };
}

export function createRemoteRsvpService(endpoint: string, key: string, guestSlug: string): RsvpService {
    return {
        mode: 'remote',
        async getOwnResponse() {
            return readJson<RsvpRecord | null>(key, null);
        },
        async submit(submission) {
            const clean = normalise(submission);
            const { sample } = await postJson(
                endpoint,
                {
                    name: clean.guestName,
                    number_of_guests: clean.attendance === 'hadir' ? clean.attendees : 1,
                    rsvp_status: STATUS[clean.attendance],
                    message: clean.message || undefined,
                    guest_slug: guestSlug || undefined,
                },
                'Konfirmasi gagal dikirim.',
            );
            return remember(key, clean, sample);
        },
    };
}

export function createRsvpService(endpoint: string, slug: string, guestSlug: string): RsvpService {
    const key = `wt16:${slug}:${guestSlug || 'umum'}:rsvp`;
    return endpoint ? createRemoteRsvpService(endpoint, key, guestSlug) : createDemoRsvpService(key);
}
