/** Removes ASCII control characters, optionally keeping tab / line breaks. */
export function stripControlChars(value: string, keepLineBreaks = false): string {
    let out = '';
    for (const char of value) {
        const code = char.charCodeAt(0);
        const isControl = code < 32 || code === 127;
        const isLineBreak = code === 9 || code === 10 || code === 13;
        if (!isControl || (keepLineBreaks && isLineBreak)) out += char;
    }
    return out;
}

/** Trims, strips control characters and collapses runs of blank lines. */
export function sanitizeText(value: string, maxLength: number): string {
    return stripControlChars(value, true)
        .replace(/\r\n?/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, maxLength);
}

export function sanitizeName(value: string): string {
    // Collapse whitespace (incl. line breaks) first so "A\nB" becomes "A B".
    return stripControlChars(value.replace(/\s+/g, ' ')).trim().slice(0, 60);
}

export type Attendance = 'hadir' | 'tidak-hadir' | 'ragu';

export interface RsvpFormValues {
    guestName: string;
    attendance: Attendance | '';
    attendees: number;
    message: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const LIMITS = { name: 60, rsvpMessage: 300, guestbookMessage: 500, guestbookMin: 5 };

export function validateRsvp(values: RsvpFormValues, maxAttendees: number): FieldErrors<RsvpFormValues> {
    const errors: FieldErrors<RsvpFormValues> = {};
    const name = sanitizeName(values.guestName);
    if (name.length < 2) errors.guestName = 'Mohon isi nama Anda (minimal 2 karakter).';
    if (!values.attendance) errors.attendance = 'Mohon pilih status kehadiran.';
    if (values.attendance === 'hadir' && (!Number.isInteger(values.attendees) || values.attendees < 1 || values.attendees > maxAttendees)) {
        errors.attendees = `Jumlah tamu antara 1 dan ${maxAttendees} orang.`;
    }
    if (values.message.length > LIMITS.rsvpMessage) errors.message = `Pesan maksimal ${LIMITS.rsvpMessage} karakter.`;
    return errors;
}

export interface GuestbookFormValues {
    name: string;
    message: string;
}

export function validateGuestbook(values: GuestbookFormValues): FieldErrors<GuestbookFormValues> {
    const errors: FieldErrors<GuestbookFormValues> = {};
    if (sanitizeName(values.name).length < 2) errors.name = 'Mohon isi nama Anda (minimal 2 karakter).';
    const message = sanitizeText(values.message, LIMITS.guestbookMessage + 1);
    if (message.length < LIMITS.guestbookMin) errors.message = `Ucapan minimal ${LIMITS.guestbookMin} karakter.`;
    else if (message.length > LIMITS.guestbookMessage) errors.message = `Ucapan maksimal ${LIMITS.guestbookMessage} karakter.`;
    return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
    return Object.values(errors).some(Boolean);
}
