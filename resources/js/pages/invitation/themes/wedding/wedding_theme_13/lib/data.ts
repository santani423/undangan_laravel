/* =====================================================================
   DATA TEMA — pengganti src/config.js. Data acara diambil dari undangan
   (WeddingInvitation); yang tersisa di sini hanya teks & aset khas tema.
   ===================================================================== */
import type { BankAccount, DigitalWallet, Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { aset } from './aset';

/* Teks khas tema (bahasa Sunda) — bagian dari identitas tema, bukan data acara. */
export const TEKS = {
    semboyan: 'Satukna Dua Hati, Ngawangun Carita Salamina.',
    pembuka: 'Dengan memohon rahmat dan rida Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
    penutup: 'Hatur Nuhun parantos janten bagian tina kabagjaan ieu.',
};

/** Pilihan jumlah tamu pada formulir RSVP (rsvp.maksTamu pada tema asli). */
export const MAKS_TAMU = 4;
/** Jumlah bingkai kisah yang masih lega dipasang di sepanjang sasak (jembatan) adegan 3D. */
export const MAKS_BINGKAI_KISAH = 8;

export const GALERI_CONTOH = [1, 2, 3, 4, 5, 6].map((i) => aset(`galeri-${i}.jpg`));
export const KISAH_CONTOH = [1, 2, 3, 4].map((i) => aset(`kisah-${i}.jpg`));
export const ILUSTRASI_PANGANTEN = aset('panganten.png');

export interface AcaraTema {
    nama: string;
    tanggal: string;
    tanggalTampil: string;
    mulai: string;
    selesai: string;
    tempat: string;
    alamat: string;
    peta: string;
}

export interface KisahTema {
    tahun: string;
    judul: string;
    teks: string;
    foto: string;
}

export interface DataTema {
    pria: string;
    wanita: string;
    monogram: string;
    priaLengkap: string;
    wanitaLengkap: string;
    priaKet: string;
    wanitaKet: string;
    priaOrtu: string;
    wanitaOrtu: string;
    tanggalTampil: string;
    tanggalKartu: string;
    hitungMundur: string;
    acara: AcaraTema[];
    acaraBedaTanggal: boolean;
    lokasi: { nama: string; alamat: string; peta: string };
    kalender: string;
    dressCode: { nama: string; hex: string }[];
    kisah: KisahTema[];
    galeri: string[];
    galeriContoh: boolean;
    video: string;
    kutipan: string;
    pembuka: string;
    tamu: string;
    salamTamu: string;
    labelTamu: string;
    tombolBuka: string;
    batasRsvp: string;
    rekening: BankAccount[];
    dompet: DigitalWallet[];
    musik: { url: string; autoplay: boolean; loop: boolean } | null;
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const URUTAN = ['pertama', 'kedua', 'ketiga', 'keempat', 'kelima', 'keenam', 'ketujuh', 'kedelapan', 'kesembilan', 'kesepuluh'];

const bersih = (s: string | null | undefined) => (s ?? '').trim();

/** "08:00:00" → "08:00". */
export function jam(t: string | null | undefined): string {
    const m = /^(\d{1,2})[:.](\d{2})/.exec(bersih(t));
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : bersih(t);
}

export function rentangJam(a: AcaraTema): string {
    if (a.mulai && a.selesai) return `${a.mulai} – ${a.selesai} WIB`;
    if (a.mulai) return `${a.mulai} WIB – selesai`;
    return '';
}

/** "2" → "Putra kedua dari"; teks bebas dibiarkan, cukup dilengkapi "dari". */
export function keteranganAnak(urutan: string, jenis: 'Putra' | 'Putri'): string {
    const u = bersih(urutan).replace(/:$/, '');
    if (!u) return '';
    if (/^\d+$/.test(u)) {
        const n = Number(u);
        return `${jenis} ${URUTAN[n - 1] ?? `ke-${n}`} dari`;
    }
    return /\bdari\b/i.test(u) ? u : `${u} dari`;
}

export function orangTua(ayah: string, ibu: string): string {
    return [bersih(ayah), bersih(ibu)].filter(Boolean).join(' & ');
}

/** "2026-12-19" → "19 · 12 · 2026" (tulisan tanggal pada kartu undangan 3D). */
export function tanggalKartu(tanggal: string): string {
    const [y, m, d] = bersih(tanggal).split('-');
    return y && m && d ? `${d} · ${m} · ${y}` : '';
}

/** "2026-12-05" → "5 Desember 2026". */
export function tanggalPanjang(tanggal: string): string {
    const [y, m, d] = bersih(tanggal).split('-').map(Number);
    return y && m && d ? `${d} ${BULAN[m - 1] ?? ''} ${y}` : bersih(tanggal);
}

export const waUrl = (no: string, pesan: string) => `https://wa.me/${no}?text=${encodeURIComponent(pesan)}`;

export function urlPeta(ev: InvitationEvent | undefined): string {
    if (!ev) return '';
    if (bersih(ev.locationUrl)) return bersih(ev.locationUrl);
    if (ev.mapsLat && ev.mapsLng) return `https://www.google.com/maps/search/?api=1&query=${ev.mapsLat},${ev.mapsLng}`;
    const q = [ev.locationName, ev.location].map(bersih).filter(Boolean).join(', ');
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/** Tautan Google Calendar dari acara pertama s.d. acara terakhir (jam dalam WIB). */
export function urlKalender(acara: AcaraTema[], judul: string, lokasi: string): string {
    const ada = acara.filter((a) => a.tanggal);
    if (!ada.length) return '';
    const keUtc = (tanggal: string, j: string) => {
        const d = new Date(`${tanggal}T${j || '08:00'}:00+07:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    };
    const fmt = (d: Date) =>
        d
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\.\d{3}/, '');
    const a0 = ada[0];
    const a1 = ada[ada.length - 1];
    const mulai = keUtc(a0.tanggal, a0.mulai);
    if (!mulai) return '';
    let selesai = keUtc(a1.tanggal, a1.selesai || a1.mulai);
    if (!selesai || selesai <= mulai) selesai = new Date(mulai.getTime() + 2 * 3600 * 1000);
    const q = new URLSearchParams({
        action: 'TEMPLATE',
        text: judul,
        dates: `${fmt(mulai)}/${fmt(selesai)}`,
        details: ada.map((a) => `${a.nama}: ${rentangJam(a)}`).join('\n'),
        location: lokasi,
    });
    return 'https://calendar.google.com/calendar/render?' + q.toString();
}

export function urlVideoSemat(url: string): string {
    if (!bersih(url)) return '';
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '');
        if (host === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`;
        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (u.pathname.startsWith('/embed/')) return url;
            if (u.pathname.startsWith('/shorts/')) return `https://www.youtube.com/embed/${u.pathname.split('/')[2] ?? ''}`;
            const v = u.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
        }
        if (host === 'vimeo.com') {
            const id = u.pathname.split('/').filter(Boolean)[0];
            if (id) return `https://player.vimeo.com/video/${id}`;
        }
        return url;
    } catch {
        return '';
    }
}

const namaPanggilan = (panggilan: string, lengkap: string) => bersih(panggilan) || bersih(lengkap).split(/\s+/)[0] || '';

export function bangunData(inv: WeddingInvitation, visitor?: string, salam?: Greeting): DataTema {
    const greeting = salam ?? inv.greeting;
    const pria = namaPanggilan(inv.groomNickname, inv.groomFullName);
    const wanita = namaPanggilan(inv.brideNickname, inv.brideFullName);
    const events = inv.events ?? [];
    const utama = events.find((e) => e.isCountdown) ?? events[0];

    const acara: AcaraTema[] = events.map((ev) => ({
        nama: bersih(ev.name),
        tanggal: bersih(ev.date),
        tanggalTampil: bersih(ev.dateFormatted),
        mulai: jam(ev.time),
        selesai: jam(ev.timeEnd),
        tempat: bersih(ev.locationName),
        alamat: bersih(ev.location),
        peta: urlPeta(ev),
    }));
    const lokasi = { nama: bersih(utama?.locationName), alamat: bersih(utama?.location), peta: urlPeta(utama) };
    const galeriAsli = (inv.gallery ?? []).map((g) => g.url).filter(Boolean);
    // Undangan contoh tanpa galeri memakai foto contoh tema (render adegan 3D tema ini).
    const galeriContoh = !galeriAsli.length && !!inv.isSample;

    return {
        pria,
        wanita,
        monogram: `${pria.charAt(0)}${wanita.charAt(0)}`.toUpperCase(),
        priaLengkap: bersih(inv.groomFullName),
        wanitaLengkap: bersih(inv.brideFullName),
        priaKet: keteranganAnak(inv.groomChildOrder, 'Putra'),
        wanitaKet: keteranganAnak(inv.brideChildOrder, 'Putri'),
        priaOrtu: orangTua(inv.groomFather, inv.groomMother),
        wanitaOrtu: orangTua(inv.brideFather, inv.brideMother),
        tanggalTampil: bersih(inv.mainDateFormatted) || bersih(utama?.dateFormatted),
        tanggalKartu: tanggalKartu(utama?.date ?? ''),
        hitungMundur: bersih(inv.countdownDate),
        acara,
        acaraBedaTanggal: new Set(acara.map((a) => a.tanggal).filter(Boolean)).size > 1,
        lokasi,
        kalender: urlKalender(acara, `Pernikahan ${pria} & ${wanita}`, [lokasi.nama, lokasi.alamat].filter(Boolean).join(', ')),
        dressCode: (inv.dressCodes ?? []).filter((d) => bersih(d.name)).map((d) => ({ nama: bersih(d.name), hex: bersih(d.hex) })),
        kisah: (inv.loveStory ?? []).map((k, i) => ({
            tahun: bersih(k.date),
            judul: bersih(k.title),
            teks: bersih(k.desc),
            foto: bersih(k.photo) || KISAH_CONTOH[i % KISAH_CONTOH.length],
        })),
        galeri: galeriContoh ? GALERI_CONTOH : galeriAsli,
        galeriContoh,
        video: urlVideoSemat(inv.coupleVideoUrl ?? ''),
        kutipan: bersih(inv.openingQuote),
        pembuka: bersih(greeting?.message) || TEKS.pembuka,
        tamu: bersih(inv.guestName) || bersih(visitor),
        salamTamu: bersih(greeting?.title) || 'Kepada Yth.',
        labelTamu: bersih(greeting?.guestLabel) || 'Tamu Undangan',
        tombolBuka: bersih(greeting?.buttonText) || 'Buka Undangan',
        batasRsvp: inv.rsvpDeadline ? tanggalPanjang(inv.rsvpDeadline) : '',
        rekening: (inv.bankAccounts ?? []).filter((r) => bersih(r.accountNumber)),
        dompet: (inv.digitalWallets ?? []).filter((w) => bersih(w.accountNumber) || w.qrisQrUrl),
        musik: inv.music?.url ? { url: inv.music.url, autoplay: inv.music.autoplay, loop: inv.music.loop } : null,
    };
}
