/* =====================================================================
   DATA TEMA — pengganti src/config/invitation.config.ts desain asli. Isi undangan
   diambil dari BirthdayInvitation; yang tersisa di sini hanya teks khas tema.
   ===================================================================== */
import type { BirthdayInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { SAMPLE_GALLERY, toyAssets } from './assets';
import { formatEventDate, formatEventTime, TIME_ZONE_LABEL } from './format';
import type { GalleryImage, GiftAccount, Milestone, PartyEvent, ToyConfig } from './types';

/** Theme texts — part of the Toy World identity, not invitation data. */
export const TEKS = {
    eyebrow: 'Undangan Ulang Tahun',
    title: 'Petualangan di Dunia Mainan',
    guestLabel: 'Kepada Yth.',
    defaultGuest: 'Teman Tersayang',
    buttonText: 'Buka Undangan',
    coverMessage: 'Ayo ikut berpetualang dan merayakan hari spesial bersama kami!',
    welcomeMessage: (nick: string, age: string) =>
        `Hore! ${nick} ${age ? `genap ${age}` : 'berulang tahun'}. Kami mengundang teman-teman dan keluarga untuk bermain, tertawa, dan meniup lilin bersama di Dunia Mainan ${nick}.`,
    closingMessage: (nick: string) => `Kehadiran dan doa baik Anda adalah kado terindah bagi ${nick}. Sampai jumpa di pesta, ya!`,
    dressCode: 'Kostum mainan favorit — boleh jadi robot, boneka, atau dinosaurus!',
    giftTitle: 'Kado Digital',
    giftMessage: 'Doa restu Anda sudah lebih dari cukup. Namun bila ingin mengirim tanda kasih, Anda dapat menggunakan informasi berikut.',
    musicTitle: { file: 'Musik latar undangan', box: 'Kotak Musik Dunia Mainan' },
};

const MAX_COMPANIONS = 4;
const WISH_MAX_LENGTH = 280;
const TZ_OFFSET = '+07:00';

const clean = (s: string | number | null | undefined) => String(s ?? '').trim();

/** "15:30:00" → "15:30". */
function hhmm(t: string | null | undefined): string {
    const m = /^(\d{1,2})[:.](\d{2})/.exec(clean(t));
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

/** "2026-11-14" + "15:00" → "2026-11-14T15:00:00+07:00" (WIB). Empty when the date is missing or invalid. */
function isoWib(date: string, time: string): string {
    const d = clean(date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    const iso = `${d}T${time || '00:00'}:00${TZ_OFFSET}`;
    return Number.isNaN(Date.parse(iso)) ? '' : iso;
}

/** "2026-11-14T15:00:00" (no offset → WIB) → ISO with offset. */
function withOffset(dateTime: string): string {
    const v = clean(dateTime).replace(' ', 'T');
    if (!v) return '';
    const iso = /([+-]\d{2}:?\d{2}|Z)$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}${TZ_OFFSET}`;
    return Number.isNaN(Date.parse(iso)) ? '' : iso;
}

/** "6", "6 tahun", 6 → 6. Anything without a whole number → null. */
function parseAge(age: string | number | null | undefined): number | null {
    const m = /\d+/.exec(clean(age));
    const n = m ? Number(m[0]) : NaN;
    return Number.isInteger(n) && n > 0 && n < 150 ? n : null;
}

function mapUrl(ev: InvitationEvent): string {
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

function toEvent(ev: InvitationEvent, i: number, fallbackTitle: string): PartyEvent {
    const startTime = hhmm(ev.time);
    const endTime = hhmm(ev.timeEnd);
    const startISO = isoWib(ev.date, startTime);
    const end = endTime ? isoWib(ev.date, endTime) : '';
    const endISO = end && end > startISO ? end : '';
    const time = startTime ? [formatEventTime(startISO), endISO && formatEventTime(endISO)].filter(Boolean).join(' – ') : '';
    return {
        id: `acara-${i + 1}`,
        title: clean(ev.name) || fallbackTitle,
        startISO,
        endISO,
        dateLabel: clean(ev.dateFormatted) || formatEventDate(startISO),
        timeLabel: time ? `${time} ${TIME_ZONE_LABEL}` : '',
        venueName: clean(ev.locationName),
        address: clean(ev.location),
        mapUrl: mapUrl(ev),
    };
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
export function buildInvitation(inv: BirthdayInvitation, visitor?: string, greetingProp?: Greeting): ToyConfig {
    const greeting = greetingProp ?? inv.greeting;
    const flags = inv.features ?? {};
    const on = (key: string) => flags[key] !== false;
    const sample = Boolean(inv.isSample);

    const fullName = clean(inv.celebrantName) || clean(inv.celebrantNickname) || 'Si Kecil';
    const nickname = clean(inv.celebrantNickname) || fullName.split(/\s+/)[0];
    const age = parseAge(inv.celebrantAge);
    const ageText = age ? `${age} tahun` : '';
    const parents = clean(inv.parentName);

    const rawEvents = inv.events ?? [];
    const events = rawEvents.map((ev, i) => toEvent(ev, i, `Pesta Ulang Tahun ${nickname}`));
    const mainIndex = Math.max(
        0,
        rawEvents.findIndex((e) => e.isCountdown),
    );
    const event = events[mainIndex] ?? null;

    const journey: Milestone[] = (inv.lifeJourney ?? [])
        .filter((s) => clean(s.title) || clean(s.desc))
        .map((s) => ({ period: clean(s.date), title: clean(s.title), text: clean(s.desc) }));

    const photos: GalleryImage[] = (inv.gallery ?? [])
        .filter((g) => clean(g.url))
        .map((g, i) => ({
            id: `foto-${i + 1}`,
            src: clean(g.url),
            alt: clean(g.label) || `Foto ${nickname} ${i + 1}`,
            caption: clean(g.label) || `Momen ${nickname} #${i + 1}`,
        }));
    // Sample invitations without photos show the pack's labelled placeholder illustrations.
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

    const photo = clean(inv.celebrantPhoto);
    const recipient = clean(inv.guestName) || clean(visitor) || guestFromUrl();
    const music = inv.music?.url ? inv.music : null;
    const allowComments = inv.allowComments !== false;

    return {
        meta: { slug: clean(inv.slug) || clean(inv.code) || 'demo', code: clean(inv.code), guestSlug: clean(inv.guestSlug), isSample: sample },
        guest: {
            name: recipient || clean(greeting?.guestLabel) || TEKS.defaultGuest,
            personalised: Boolean(recipient),
            label: clean(greeting?.title) || TEKS.guestLabel,
        },
        child: {
            fullName,
            nickname,
            age,
            portrait: photo || toyAssets.gallery.portrait,
            portraitAlt: photo ? `Foto ${fullName}` : `Ilustrasi potret pengganti foto ${nickname}`,
            parentsLine: parents ? `Buah hati tercinta dari ${parents}` : '',
            journey,
        },
        invitation: {
            eyebrow: TEKS.eyebrow,
            title: TEKS.title,
            coverMessage: clean(greeting?.message) || TEKS.coverMessage,
            buttonText: clean(greeting?.buttonText) || TEKS.buttonText,
            welcomeMessage: clean(inv.celebrantBio) || TEKS.welcomeMessage(nickname, ageText),
            hashtag: `#${nickname.replace(/[^\p{L}\p{N}]+/gu, '')}${age ? `Genap${age}` : 'Ultah'}`,
            closingMessage: TEKS.closingMessage(nickname),
            signature: parents ? `${nickname} & keluarga` : `Keluarga ${nickname}`,
        },
        event,
        otherEvents: events.filter((_, i) => i !== mainIndex),
        countdownISO: withOffset(inv.countdownDate) || event?.startISO || '',
        timeZoneLabel: TIME_ZONE_LABEL,
        dressCode: TEKS.dressCode,
        gallery,
        rsvp: {
            endpoint: clean(inv.rsvpEndpoint),
            maxCompanions: MAX_COMPANIONS,
            wishMaxLength: WISH_MAX_LENGTH,
            attendanceOptions: [
                { value: 'hadir', label: 'Hadir', hint: 'Aku datang!' },
                { value: 'ragu', label: 'Masih Ragu', hint: 'Akan dikabari' },
                { value: 'tidak', label: 'Tidak Hadir', hint: 'Kirim doa saja' },
            ],
        },
        wishesEndpoint: clean(inv.wishesEndpoint),
        gift: { title: TEKS.giftTitle, message: TEKS.giftMessage, accounts },
        music: {
            src: music?.url ?? null,
            // Uploaded music follows its autoplay setting; the theme's own music box starts with the invitation.
            autoplay: music ? music.autoplay !== false : true,
            loop: music ? music.loop !== false : true,
            title: music ? TEKS.musicTitle.file : TEKS.musicTitle.box,
            volume: 0.5,
        },
        features: {
            cover: on('cover'),
            greeting: on('greeting'),
            profile: on('couple_profile'),
            event: on('event_detail') && event !== null,
            countdown: on('countdown'),
            location: on('location'),
            calendar: on('add_to_calendar'),
            gallery: on('gallery'),
            rsvp: on('rsvp'),
            wishes: on('wishes') && allowComments,
            gift: on('digital_envelope') && accounts.length > 0,
            music: on('music'),
            confetti: on('confetti'),
            footer: on('footer'),
        },
        showDemoNotices: sample,
    };
}
