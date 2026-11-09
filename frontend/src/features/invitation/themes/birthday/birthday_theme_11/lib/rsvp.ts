import type { Attendance } from './types';

export interface RsvpDraft {
    name: string;
    attendance: Attendance | '';
    guests: number;
    message: string;
}

export type RsvpField = 'name' | 'attendance' | 'guests' | 'message';
export type RsvpErrors = Partial<Record<RsvpField, string>>;

export interface RsvpRules {
    maxGuests: number;
    messageMaxLength: number;
    /** False when only a wish is sent (RSVP switched off, wishes on). */
    withAttendance: boolean;
}

/** Pure validation shared by blur checks and submit (port of validateRsvp in the original RSVPForm.js). */
export function validateRsvp(data: RsvpDraft, { maxGuests, messageMaxLength, withAttendance }: RsvpRules): RsvpErrors {
    const errors: RsvpErrors = {};
    const name = data.name.trim();
    if (!name) errors.name = 'Tulis namamu dulu, ya, supaya kami tahu siapa yang datang.';
    else if (name.length < 2) errors.name = 'Nama minimal 2 karakter.';
    else if (name.length > 60) errors.name = 'Nama maksimal 60 karakter.';

    if (withAttendance) {
        if (data.attendance !== 'yes' && data.attendance !== 'no') errors.attendance = 'Pilih dulu apakah kamu bisa datang.';
        if (data.attendance === 'yes' && (!Number.isInteger(data.guests) || data.guests < 1 || data.guests > maxGuests)) {
            errors.guests = `Pilih antara 1 dan ${maxGuests} orang.`;
        }
    } else if (!data.message.trim()) {
        errors.message = 'Tulis ucapanmu untuk yang berulang tahun.';
    }

    if (data.message.trim().length > messageMaxLength) errors.message = `Pesan maksimal ${messageMaxLength} karakter.`;
    return errors;
}

/** Field order used to move focus to the first invalid field. */
export const RSVP_FIELDS: RsvpField[] = ['name', 'attendance', 'guests', 'message'];
