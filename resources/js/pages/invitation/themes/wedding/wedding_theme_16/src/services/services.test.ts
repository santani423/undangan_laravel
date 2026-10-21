import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGuestbookService } from './guestbookService';
import { createRsvpService } from './rsvpService';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RSVP service', () => {
  it('uses demo mode without an endpoint and keeps one response per device', async () => {
    const service = createRsvpService(undefined, 'uji');
    expect(service.mode).toBe('demo');
    expect(await service.getOwnResponse()).toBeNull();

    const first = await service.submit({ guestName: '  Tamu  Uji ', attendance: 'hadir', attendees: 2, message: ' Sampai jumpa ' });
    expect(first.updated).toBe(false);
    expect(first.record).toMatchObject({ guestName: 'Tamu Uji', attendees: 2, message: 'Sampai jumpa' });

    const second = await service.submit({ guestName: 'Tamu Uji', attendance: 'tidak-hadir', attendees: 3, message: '' });
    expect(second.updated).toBe(true);
    expect(second.record.id).toBe(first.record.id);
    expect(second.record.attendees).toBe(0);
    expect(await service.getOwnResponse()).toMatchObject({ attendance: 'tidak-hadir' });
  });

  it('posts to the configured endpoint with an idempotency key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'srv-1' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = createRsvpService('https://api.example.test/rsvp', 'uji');
    expect(service.mode).toBe('remote');
    const result = await service.submit({ guestName: 'Tamu Uji', attendance: 'ragu', attendees: 1, message: '' });
    expect(result.record.id).toBe('srv-1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.test/rsvp');
    expect(init.method).toBe('POST');
    expect(init.headers['Idempotency-Key']).toBeTruthy();
    expect(JSON.parse(init.body)).toMatchObject({ guestName: 'Tamu Uji', attendance: 'ragu', attendees: 0, invitation: 'uji' });
  });

  it('surfaces server errors instead of pretending to save', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));
    const service = createRsvpService('https://api.example.test/rsvp', 'uji');
    await expect(service.submit({ guestName: 'Tamu Uji', attendance: 'hadir', attendees: 1, message: '' })).rejects.toThrow('HTTP 500');
    expect(await service.getOwnResponse()).toBeNull();
  });
});

describe('guestbook service', () => {
  it('stores entries newest first in demo mode', async () => {
    const service = createGuestbookService(undefined, 'uji');
    expect(await service.list()).toEqual([]);
    await service.submit({ name: 'Tamu Pertama', message: 'Selamat berbahagia!' });
    await service.submit({ name: 'Tamu Kedua', message: 'Semoga langgeng\u0007 selalu.' });
    const entries = await service.list();
    expect(entries.map((e) => e.name)).toEqual(['Tamu Kedua', 'Tamu Pertama']);
    expect(entries[0].message).toBe('Semoga langgeng selalu.');
    expect(Object.keys(entries[0]).sort()).toEqual(['createdAt', 'id', 'message', 'name']);
  });

  it('loads and sanitises remote entries', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([{ id: 7, name: ' Tamu ', message: 'Halo', createdAt: '2027-01-01T00:00:00Z' }]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const service = createGuestbookService('https://api.example.test/guestbook', 'uji');
    const [entry] = await service.list();
    expect(entry).toEqual({ id: '7', name: 'Tamu', message: 'Halo', createdAt: '2027-01-01T00:00:00Z' });
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://api.example.test/guestbook?invitation=uji');
  });
});
