import { afterEach, describe, expect, it, vi } from 'vitest';
import { invitation } from '../data/invitation';
import { buildIcs, googleCalendarUrl } from './calendar';
import { copyText } from './clipboard';
import { formatLongDate, formatRelative, formatTimeRange, getCountdownParts, isPast } from './date';
import { formatAccountNumber } from './format';
import { fullAddress, getDirectionsUrl, getEmbedUrl, getMapsUrl } from './maps';
import { getRecipientName } from './urlFlags';
import { sanitizeName, sanitizeText, validateGuestbook, validateRsvp } from './validation';

describe('date helpers', () => {
  it('formats dates in Indonesian in the venue time zone', () => {
    expect(formatLongDate('2027-03-20T08:00:00+07:00', 'Asia/Jakarta')).toBe('Sabtu, 20 Maret 2027');
    // 23:30 UTC on the 19th is already the 20th in Jakarta.
    expect(formatLongDate('2027-03-19T23:30:00Z', 'Asia/Jakarta')).toBe('Sabtu, 20 Maret 2027');
    expect(formatTimeRange('2027-03-20T08:00:00+07:00', '2027-03-20T10:00:00+07:00', 'Asia/Jakarta', 'WIB')).toBe('08.00 – 10.00 WIB');
    expect(formatTimeRange('2027-03-20T19:00:00+08:00', undefined, 'Asia/Makassar', 'WITA')).toBe('19.00 WITA – selesai');
  });

  it('computes the countdown from the configured wedding date', () => {
    const now = new Date('2027-03-18T06:59:30+07:00').getTime();
    expect(getCountdownParts(invitation.weddingDate, now)).toEqual({ days: 2, hours: 1, minutes: 0, seconds: 30, isPast: false });
    expect(getCountdownParts(invitation.weddingDate, new Date('2027-03-20T08:00:01+07:00').getTime()).isPast).toBe(true);
    expect(getCountdownParts('not-a-date').isPast).toBe(true);
  });

  it('describes relative time and deadlines', () => {
    const now = new Date('2027-01-01T12:00:00Z').getTime();
    expect(formatRelative('2027-01-01T11:55:00Z', now)).toBe('5 menit yang lalu');
    expect(formatRelative('2027-01-01T11:59:58Z', now)).toBe('baru saja');
    expect(isPast('2026-12-31T00:00:00Z', now)).toBe(true);
    expect(isPast(undefined, now)).toBe(false);
  });
});

describe('validation', () => {
  it('sanitises free text without losing line breaks', () => {
    expect(sanitizeText('  Halo\u0007\r\n\n\n\nSelamat  ', 100)).toBe('Halo\n\nSelamat');
    expect(sanitizeName('  Tamu\t  Uji\u0000 ')).toBe('Tamu Uji');
    expect(sanitizeText('x'.repeat(20), 5)).toBe('xxxxx');
  });

  it('validates RSVP fields', () => {
    expect(validateRsvp({ guestName: '', attendance: '', attendees: 1, message: '' }, 4)).toMatchObject({
      guestName: expect.any(String),
      attendance: expect.any(String),
    });
    expect(validateRsvp({ guestName: 'Tamu Uji', attendance: 'hadir', attendees: 5, message: '' }, 4).attendees).toBeDefined();
    expect(validateRsvp({ guestName: 'Tamu Uji', attendance: 'tidak-hadir', attendees: 99, message: '' }, 4)).toEqual({});
    expect(validateRsvp({ guestName: 'Tamu Uji', attendance: 'hadir', attendees: 2, message: 'm'.repeat(301) }, 4).message).toBeDefined();
  });

  it('validates guestbook fields', () => {
    expect(validateGuestbook({ name: 'A', message: 'hai' })).toMatchObject({ name: expect.any(String), message: expect.any(String) });
    expect(validateGuestbook({ name: 'Tamu Uji', message: 'Selamat berbahagia!' })).toEqual({});
  });
});

describe('maps, calendar and formatting', () => {
  const place = { venueName: 'Venue', address: 'Jl. Contoh 1', coordinates: { lat: -6.5, lng: 106.8 } };

  it('builds Google Maps links from coordinates or an explicit URL', () => {
    expect(getMapsUrl(place)).toBe('https://www.google.com/maps/search/?api=1&query=-6.5%2C106.8');
    expect(getDirectionsUrl(place)).toContain('destination=-6.5%2C106.8');
    expect(getEmbedUrl(place)).toContain('output=embed');
    expect(getMapsUrl({ ...place, mapsUrl: 'https://maps.app.goo.gl/x' })).toBe('https://maps.app.goo.gl/x');
    expect(getMapsUrl({ venueName: 'Gedung', address: 'Jl. A' })).toContain(encodeURIComponent('Gedung, Jl. A'));
    expect(fullAddress(place)).toBe('Venue, Jl. Contoh 1');
  });

  it('creates calendar entries in UTC', () => {
    const [akad] = invitation.events;
    const url = new URL(googleCalendarUrl(akad, 'A & B'));
    expect(url.searchParams.get('dates')).toBe('20270320T010000Z/20270320T030000Z');
    const ics = buildIcs(invitation.events, 'A & B', 'slug');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(invitation.events.length);
    expect(ics).toContain('DTSTART:20270320T010000Z');
    expect(ics).toContain('LOCATION:Nama Venue Acara (contoh)\\, Jl. Nama Jalan No. 00');
  });

  it('groups account numbers for readability', () => {
    expect(formatAccountNumber('1234567890')).toBe('1234 5678 90');
    expect(formatAccountNumber('0812 3456')).toBe('0812 3456');
    expect(formatAccountNumber('ABC-123')).toBe('ABC-123');
  });
});

describe('clipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the async Clipboard API in secure contexts', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    vi.stubGlobal('isSecureContext', true);
    await expect(copyText('12345')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('12345');
  });

  it('falls back to execCommand when the Clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { value: exec, configurable: true });
    await expect(copyText('alamat')).resolves.toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('refuses to copy empty text', async () => {
    await expect(copyText('')).resolves.toBe(false);
  });
});

describe('recipient personalisation', () => {
  it('reads and sanitises the ?to= parameter', () => {
    window.history.replaceState(null, '', '/?to=%20Bapak%20%20Tamu%0AUji%20');
    expect(getRecipientName()).toBe('Bapak Tamu Uji');
    window.history.replaceState(null, '', '/?to=' + 'x'.repeat(100));
    expect(getRecipientName()).toHaveLength(60);
    window.history.replaceState(null, '', '/');
    expect(getRecipientName()).toBeNull();
  });
});
