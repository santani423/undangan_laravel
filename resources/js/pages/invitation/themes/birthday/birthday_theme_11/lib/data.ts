/* =====================================================================
   DATA TEMA — pengganti src/config/invitation.js desain asli. Isi undangan
   diambil dari BirthdayInvitation; yang tersisa di sini hanya teks khas tema.
   ===================================================================== */
import type { BirthdayInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { SAMPLE_GALLERY } from './assets';
import { formatEventDay, formatTimeRange, tryEventRange } from './date';
import type { Activity, EventRange, GiftAccount, OtherEvent, PartyEvent, Photo, SmileConfig } from './types';

const TZ_OFFSET = '+07:00';
const TZ_LABEL = 'WIB';
const LOCALE = 'id-ID';
const MAX_GUESTS = 4;
const MESSAGE_MAX = 280;

/** Theme texts — part of the Little Smile identity, not invitation data. */
export const TEKS = {
    siteTitle: 'Petualangan Gigi Ceria',
    heroInvite: 'Kamu diundang ke pesta ulang tahun',
    guestLabel: 'Kepada Yth.',
    defaultGuest: 'Sahabat Kecil & Keluarga',
    invitationHeading: 'Kamu diundang!',
    invitationMessage: (name: string, age: number | null) =>
        `Dr. Senyum dan para Sahabat Gigi sedang menyiapkan pesta yang berkilau, dan pestanya belum lengkap tanpa kamu!\n\nAyo datang bersenang-senang dengan permainan, kue, dan banyak senyum lebar saat kita merayakan ${age ? `ulang tahun ke-${age}` : 'ulang tahun'} ${name} bersama-sama.`,
    dressCode: 'Warna pastel & senyum paling cerah',
    detailsNote: 'Sampai jumpa di pesta! Jangan lupa bawa senyum terbaikmu.',
    galleryIntro: (name: string) => `Beberapa senyum favorit dari perjalanan ${name} sejauh ini.`,
    cakeIntro: (candles: number) =>
        `${candles} lilin, satu permohonan besar. Tiup lilinnya dengan sekali ketuk, atau dengan tiupan sungguhan ke mikrofon.`,
    rsvpIntro: 'Kabari kami apakah kamu bisa datang, supaya kami bisa menyiapkan topi pesta untukmu.',
    finaleHeading: 'Terima kasih sudah ikut berpetualang!',
    finaleMessage: 'Setiap senyum yang kamu bawa membuat pesta makin ceria. Kami tidak sabar merayakannya bersamamu. Tetap tersenyum, sampai jumpa!',
};

/** The playground program (section 4). Theme copy: no times or promises the host did not make. */
function activities(name: string, candles: number): Activity[] {
    return [
        {
            id: 'permainan',
            icon: 'games',
            title: 'Permainan seru',
            summary: 'Kursi musik, estafet balon, dan berburu sikat gigi emas.',
            details: 'Setiap anak bergabung dengan tim Sahabat Gigi untuk estafet balon, kursi musik, dan berburu harta karun sikat gigi emas.',
        },
        {
            id: 'petualangan-gigi',
            icon: 'dental',
            title: 'Petualangan gigi',
            summary: 'Dr. Senyum menunjukkan cara jagoan sikat gigi menjaga senyumnya tetap bersinar.',
            details: 'Pertunjukan mini yang seru bersama sikat gigi raksasa: belajar menyikat gigi dengan benar sambil bernyanyi dan tertawa.',
        },
        {
            id: 'pojok-foto',
            icon: 'photo',
            title: 'Pojok foto',
            summary: 'Properti lucu, bingkai, dan wajah konyol di pojok Senyum Jepret.',
            details: 'Ambil topi pesta, papan gigi raksasa, atau seikat balon, lalu bergaya sebebasnya di depan kamera.',
        },
        {
            id: 'tiup-lilin',
            icon: 'cake',
            title: 'Tiup lilin & potong kue',
            summary: `Lagu selamat ulang tahun, ${candles} lilin, dan satu permohonan besar.`,
            details: `Kita bernyanyi bersama saat ${name} meniup lilin, lalu berbagi kue ulang tahun.`,
        },
        {
            id: 'buka-kado',
            icon: 'gift',
            title: 'Buka kado bersama',
            summary: 'Momen seru membuka kejutan bersama teman-teman.',
            details: `${name} membuka kejutan bersama para tamu cilik. Siapa yang paling penasaran?`,
        },
        {
            id: 'balon-perpisahan',
            icon: 'balloons',
            title: 'Balon perpisahan',
            summary: 'Penutup pesta dengan balon warna-warni dan salam perpisahan.',
            details: 'Sebelum pulang, kita berfoto bersama di bawah balon warna-warni dan saling melambaikan tangan.',
        },
    ];
}

const clean = (s: string | number | null | undefined) => String(s ?? '').trim();

/** "15:30:00" → "15:30". */
function hhmm(t: string | null | undefined): string {
    const m = /^(\d{1,2})[:.](\d{2})/.exec(clean(t));
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

function isoDate(d: string | null | undefined): string {
    const v = clean(d).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
}

/** "6", "6 tahun", 6 → 6. Anything without a whole number → null. */
function parseAge(age: string | number | null | undefined): number | null {
    const m = /\d+/.exec(clean(age));
    const n = m ? Number(m[0]) : NaN;
    return Number.isInteger(n) && n > 0 && n < 150 ? n : null;
}

function mapUrl(ev: InvitationEvent | undefined): string {
    if (!ev) return '';
    const link = clean(ev.locationUrl);
    if (/^https?:\/\//i.test(link)) return link;
    const lat = Number.parseFloat(clean(ev.mapsLat));
    const lng = Number.parseFloat(clean(ev.mapsLng));
    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    const place = [clean(ev.locationName), clean(ev.location)].filter(Boolean).join(', ');
    return place ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}` : '';
}

function toEvent(ev: InvitationEvent | undefined, fallbackTitle: string): PartyEvent {
    return {
        title: clean(ev?.name) || fallbackTitle,
        date: isoDate(ev?.date),
        startTime: hhmm(ev?.time),
        endTime: hhmm(ev?.timeEnd),
        utcOffset: TZ_OFFSET,
        timeZoneLabel: TZ_LABEL,
        locale: LOCALE,
        dressCode: TEKS.dressCode,
    };
}

/** "2026-11-14T15:00:00" (no offset → WIB) → a three-hour range, for invitations whose event has no time. */
function rangeFromCountdown(value: string | null | undefined): EventRange | null {
    const v = clean(value).replace(' ', 'T');
    if (!v) return null;
    const iso = /([+-]\d{2}:?\d{2}|Z)$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}${TZ_OFFSET}`;
    const start = Date.parse(iso);
    return Number.isNaN(start) ? null : { start: new Date(start), end: new Date(start + 3 * 3600e3) };
}

/** "?to=Budi+Santoso" (also ?kepada= / ?guest=) → "Budi Santoso", stripped of control characters. */
function guestFromUrl(): string {
    if (typeof window === 'undefined') return '';
    const p = new URLSearchParams(window.location.search);
    const raw = p.get('to') ?? p.get('kepada') ?? p.get('guest') ?? '';
    return (
        raw
            // eslint-disable-next-line no-control-regex
            .replace(/[\u0000-\u001f\u007f<>]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 60)
    );
}

/** Maps the Laravel invitation payload onto the theme's typed configuration. */
export function buildInvitation(inv: BirthdayInvitation, visitor?: string, greetingProp?: Greeting): SmileConfig {
    const greeting = greetingProp ?? inv.greeting;
    const flags = inv.features ?? {};
    const on = (key: string) => flags[key] !== false;
    const sample = Boolean(inv.isSample);

    const fullName = clean(inv.celebrantName) || clean(inv.celebrantNickname) || 'Si Kecil';
    const name = clean(inv.celebrantNickname) || fullName.split(/\s+/)[0];
    const age = parseAge(inv.celebrantAge);
    const candles = age ? Math.min(12, Math.max(1, age)) : 1;
    const parents = clean(inv.parentName);
    const host = parents || `Keluarga ${name}`;

    const rawEvents = inv.events ?? [];
    const mainIndex = Math.max(
        0,
        rawEvents.findIndex((e) => e.isCountdown),
    );
    const mainRaw = rawEvents[mainIndex];
    const event = toEvent(mainRaw, `Pesta Ulang Tahun ${name}`);
    const range = tryEventRange(event) ?? rangeFromCountdown(inv.countdownDate);

    const otherEvents: OtherEvent[] = rawEvents
        .filter((_, i) => i !== mainIndex)
        .map((ev) => {
            const e = toEvent(ev, 'Acara');
            return {
                title: e.title,
                dayLabel: formatEventDay(e) || clean(ev.dateFormatted),
                timeLabel: formatTimeRange(e),
                venue: [clean(ev.locationName), clean(ev.location)].filter(Boolean).join(', '),
            };
        });

    const photos: Photo[] = (inv.gallery ?? [])
        .filter((g) => clean(g.url))
        .map((g, i) => ({
            src: clean(g.url),
            alt: clean(g.label) || `Foto ${name} ${i + 1}`,
            caption: clean(g.label) || `Momen ${name} #${i + 1}`,
        }));
    // Sample invitations without photos show the pack's labelled placeholder cards.
    const gallery = on('gallery') ? (photos.length ? photos : sample ? SAMPLE_GALLERY : []) : [];

    const accounts: GiftAccount[] = [
        ...(inv.bankAccounts ?? [])
            .filter((a) => clean(a.accountNumber))
            .map((a, i) => ({
                id: `bank-${i}`,
                kind: 'bank' as const,
                provider: clean(a.bankName) || 'Bank',
                number: clean(a.accountNumber),
                holder: clean(a.accountName),
            })),
        ...(inv.digitalWallets ?? [])
            .filter((w) => clean(w.accountNumber) || clean(w.qrisQrUrl))
            .map((w, i) => ({
                id: `ewallet-${i}`,
                kind: 'ewallet' as const,
                provider: clean(w.label) || clean(w.provider) || 'Dompet digital',
                number: clean(w.accountNumber),
                holder: clean(w.accountName),
                qrisUrl: clean(w.qrisQrUrl) || undefined,
            })),
    ];

    const recipient = clean(inv.guestName) || clean(visitor) || guestFromUrl();
    const venue = { name: clean(mainRaw?.locationName), address: clean(mainRaw?.location), mapsUrl: mapUrl(mainRaw) };
    const music = inv.music?.url ? inv.music : null;

    return {
        meta: { slug: clean(inv.slug) || clean(inv.code) || 'demo', guestSlug: clean(inv.guestSlug), isSample: sample },
        guest: {
            name: recipient || clean(greeting?.guestLabel) || TEKS.defaultGuest,
            personalised: Boolean(recipient),
            label: clean(greeting?.title) || TEKS.guestLabel,
        },
        child: { name, fullName, age, candles },
        host: { names: host },
        event,
        otherEvents,
        venue,
        range,
        copy: {
            siteTitle: TEKS.siteTitle,
            heroInvite: TEKS.heroInvite,
            invitationHeading: TEKS.invitationHeading,
            invitationMessage: clean(inv.celebrantBio) || TEKS.invitationMessage(name, age),
            signature: host,
            detailsNote: TEKS.detailsNote,
            galleryIntro: TEKS.galleryIntro(name),
            cakeIntro: TEKS.cakeIntro(candles),
            rsvpIntro: TEKS.rsvpIntro,
            finaleHeading: TEKS.finaleHeading,
            finaleMessage: TEKS.finaleMessage,
        },
        activities: activities(name, candles),
        gallery,
        rsvp: { endpoint: clean(inv.rsvpEndpoint), maxGuests: MAX_GUESTS, messageMaxLength: MESSAGE_MAX },
        wishesEndpoint: clean(inv.wishesEndpoint),
        gift: { accounts },
        music: {
            src: music?.url ?? null,
            // Uploaded music follows its autoplay setting; the generated music box starts with the adventure.
            autoplay: music ? music.autoplay !== false : true,
            loop: music ? music.loop !== false : true,
            volume: 0.7,
        },
        features: {
            greeting: on('greeting'),
            event: on('event_detail') && rawEvents.length > 0,
            countdown: on('countdown') && range !== null,
            location: on('location') && venue.mapsUrl !== '',
            calendar: on('add_to_calendar') && range !== null,
            gallery: gallery.length > 0,
            rsvp: on('rsvp'),
            wishes: on('wishes') && inv.allowComments !== false,
            gift: on('digital_envelope') && accounts.length > 0,
            music: on('music'),
            confetti: on('confetti'),
            footer: on('footer'),
        },
        showDemoNotices: sample,
    };
}
