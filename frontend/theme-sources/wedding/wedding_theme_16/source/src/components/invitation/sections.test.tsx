import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InvitationProvider } from '../../context/InvitationProvider';
import { MusicProvider } from '../../context/MusicProvider';
import { ToastProvider } from '../../context/ToastProvider';
import { invitation } from '../../data/invitation';
import type { InvitationConfig } from '../../types/invitation';
import { Countdown } from '../ui/Countdown';
import { DigitalGiftSection } from './DigitalGiftSection';
import { EventSection } from './EventSection';
import { GuestbookSection } from './GuestbookSection';
import { RSVPSection } from './RSVPSection';

function renderWith(ui: ReactNode, config: InvitationConfig = invitation) {
  return render(
    <InvitationProvider config={config}>
      <ToastProvider>
        <MusicProvider config={config.music}>{ui}</MusicProvider>
      </ToastProvider>
    </InvitationProvider>,
  );
}

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
  vi.stubGlobal('isSecureContext', true);
  return writeText;
}

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('RSVP section', () => {
  it('validates, submits once, and offers to edit', async () => {
    renderWith(<RSVPSection />);
    const form = await screen.findByTestId('rsvp-form');
    expect(screen.getByTestId('rsvp-demo-notice')).toBeTruthy();

    fireEvent.submit(form);
    expect(await screen.findByText(/Mohon isi nama Anda/)).toBeTruthy();
    expect(screen.getByText(/Mohon pilih status kehadiran/)).toBeTruthy();
    expect(screen.getByLabelText(/Nama lengkap/).getAttribute('aria-invalid')).toBe('true');

    fireEvent.change(screen.getByLabelText(/Nama lengkap/), { target: { value: 'Tamu Uji' } });
    fireEvent.click(screen.getByLabelText('Ya, saya akan hadir'));
    fireEvent.change(screen.getByLabelText(/Jumlah tamu/), { target: { value: '2' } });
    fireEvent.submit(form);
    // A second submit while the first is in flight is ignored.
    fireEvent.submit(form);
    expect((screen.getByTestId('rsvp-submit') as HTMLButtonElement).disabled).toBe(true);

    const success = await screen.findByTestId('rsvp-success');
    expect(success.textContent).toContain('Terima kasih, Tamu Uji!');
    expect(success.textContent).toContain('akan hadir');
    expect(success.textContent).toContain('2 orang');
    expect(JSON.parse(window.localStorage.getItem('undesia:contoh-undangan:rsvp') ?? '{}')).toMatchObject({ attendees: 2 });

    fireEvent.click(within(success).getByRole('button', { name: /Ubah Konfirmasi/ }));
    expect((screen.getByLabelText(/Nama lengkap/) as HTMLInputElement).value).toBe('Tamu Uji');
    fireEvent.submit(screen.getByTestId('rsvp-form'));
    expect(await screen.findByText('Konfirmasi yang sama sudah tersimpan.')).toBeTruthy();
  });
});

describe('Guestbook section', () => {
  it('shows loading, empty and populated states and blocks duplicates', async () => {
    renderWith(<GuestbookSection />);
    expect(screen.getByTestId('guestbook-loading')).toBeTruthy();
    expect(await screen.findByTestId('guestbook-empty')).toBeTruthy();

    fireEvent.submit(screen.getByTestId('guestbook-form'));
    expect(await screen.findByText(/Ucapan minimal 5 karakter/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/^Nama/), { target: { value: 'Tamu Uji' } });
    fireEvent.change(screen.getByLabelText(/Ucapan & doa/), { target: { value: 'Selamat menempuh hidup baru!' } });
    fireEvent.submit(screen.getByTestId('guestbook-form'));
    const list = await screen.findByTestId('guestbook-list');
    expect(within(list).getByText('Selamat menempuh hidup baru!')).toBeTruthy();
    expect((screen.getByLabelText(/Ucapan & doa/) as HTMLTextAreaElement).value).toBe('');

    fireEvent.change(screen.getByLabelText(/Ucapan & doa/), { target: { value: 'Selamat menempuh hidup baru!' } });
    fireEvent.submit(screen.getByTestId('guestbook-form'));
    expect(await screen.findByText('Ucapan yang sama sudah terkirim.')).toBeTruthy();
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  });
});

describe('Digital gift section', () => {
  it('shows placeholders instead of inventing payment details', () => {
    renderWith(<DigitalGiftSection />);
    expect(screen.getAllByTestId('account-placeholder')).toHaveLength(invitation.gift.accounts.length);
    expect(screen.queryByRole('button', { name: /Salin nomor/i })).toBeNull();
    expect(screen.getByText(/QRIS belum ditambahkan/)).toBeTruthy();
  });

  it('copies a configured account number and confirms it', async () => {
    const writeText = mockClipboard();
    // Test-only fixture; never shipped.
    const config: InvitationConfig = {
      ...invitation,
      gift: { ...invitation.gift, accounts: [{ id: 't', type: 'bank', provider: 'Bank Uji', accountNumber: '1234567890', accountHolder: 'Pemilik Uji' }] },
    };
    renderWith(<DigitalGiftSection />, config);
    expect(screen.getByTestId('account-number').textContent).toBe('1234 5678 90');
    fireEvent.click(screen.getByRole('button', { name: 'Salin nomor rekening Bank Uji' }));
    expect(await screen.findByText('Nomor rekening disalin')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith('1234567890');
    expect(screen.getByRole('button', { name: 'Salin nomor rekening Bank Uji' }).textContent).toContain('Tersalin');
  });
});

describe('Event section', () => {
  it('copies the venue address and links to directions', async () => {
    const writeText = mockClipboard();
    renderWith(<EventSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Salin alamat Akad Nikah' }));
    expect(await screen.findByText('Alamat Akad Nikah disalin')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(`${invitation.events[0].venueName}, ${invitation.events[0].address}`);
    const directions = screen.getAllByRole('link', { name: /Petunjuk Arah/ })[0] as HTMLAnchorElement;
    expect(directions.href).toContain('google.com/maps/dir');
    expect(directions.target).toBe('_blank');
    expect(directions.rel).toContain('noopener');
  });
});

describe('Countdown', () => {
  it('ticks every second towards the configured date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-19T07:59:58+07:00'));
    renderWith(<Countdown target={invitation.weddingDate} />);
    const seconds = () => screen.getByTestId('countdown').querySelector('[data-unit="seconds"]')?.textContent;
    expect(screen.getByTestId('countdown').querySelector('[data-unit="days"]')?.textContent).toBe('01');
    expect(seconds()).toBe('02');
    // Ticks are aligned a few milliseconds after each wall-clock second.
    act(() => {
      vi.advanceTimersByTime(1010);
    });
    expect(seconds()).toBe('01');
  });

  it('switches to a celebration message once the date has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-21T00:00:00+07:00'));
    renderWith(<Countdown target={invitation.weddingDate} />);
    expect(screen.getByTestId('countdown-past').textContent).toContain('Hari bahagia telah tiba');
  });
});
