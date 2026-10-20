/* =====================================================================
   DATA TEMA — pengganti src/config/wedding.ts tema asli. Isi undangan diambil
   dari WeddingInvitation; yang tersisa di sini hanya teks khas tema (bahasa Jawa).
   ===================================================================== */
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { PLACEHOLDER_PHOTOS } from './aset';
import type { EventItem, EventKind, GalleryItem, Person, StoryMilestone, WeddingConfig } from './types';

/** Theme texts — part of the theme's identity, not invitation data. */
export const TEKS = {
    title: 'Pawiwahan Agung',
    subtitle: 'Undangan Pernikahan',
    greeting: 'Sugeng Rawuh',
    opening:
        'Dengan memohon rahmat dan restu, kami bermaksud menyelenggarakan pernikahan putra-putri kami. Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    verse: { text: 'Witing tresna jalaran saka kulina.', translation: 'Cinta tumbuh karena terbiasa bersama.', source: 'Paribasan Jawa' },
    giftIntro:
        'Doa restu Anda adalah karunia terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih, kami menyediakan amplop digital berikut.',
    giftThanks: 'Matur nuwun sanget atas segala perhatian dan tanda kasih Anda.',
    closing: {
        title: 'Matur Nuwun',
        message: 'Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
        prayer: 'Mugi rahayu ingkang sami pinanggih — semoga keselamatan menyertai kita semua.',
        signOff: 'Kami yang berbahagia',
    },
    audioTitle: 'Suasana gamelan',
    audioSynthCredit: 'Lantunan slendro yang disintesis langsung di peramban (bukan rekaman).',
    audioFileCredit: 'Musik latar undangan',
};

/** Frames that fit along the 3D gallery corridor (Pringgitan). */
export const MAX_WORLD_PHOTOS = 6;
/** Guest count options on the RSVP form. */
export const MAX_GUESTS = 5;

/** Orientation of the bundled placeholder photos (3 and 6 are landscape). */
const PLACEHOLDER_ORIENTATION: GalleryItem['orientation'][] = ['portrait', 'portrait', 'landscape', 'portrait', 'portrait', 'landscape'];
const ORDINAL = ['pertama', 'kedua', 'ketiga', 'keempat', 'kelima', 'keenam', 'ketujuh', 'kedelapan', 'kesembilan', 'kesepuluh'];
const TZ = '+07:00';

const clean = (s: string | null | undefined) => (s ?? '').trim();

const dateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
const shortDateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

/** "08:00:00" → "08:00". */
export function hhmm(t: string | null | undefined): string {
    const m = /^(\d{1,2})[:.](\d{2})/.exec(clean(t));
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

/** "2027-06-12" + "08:00" → "2027-06-12T08:00:00+07:00" (WIB). Empty when the date is missing/invalid. */
export function isoWib(date: string, time: string): string {
    const d = clean(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    const iso = `${d}T${time || '00:00'}:00${TZ}`;
    return Number.isNaN(new Date(iso).getTime()) ? '' : iso;
}

/** "2027-06-12T08:00:00" (no offset → WIB) → ISO with offset. */
function withOffset(dateTime: string): string {
    const v = clean(dateTime).replace(' ', 'T');
    if (!v) return '';
    const iso = /([+-]\d{2}:?\d{2}|Z)$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}${TZ}`;
    return Number.isNaN(new Date(iso).getTime()) ? '' : iso;
}

/** "2" → "Putra kedua dari"; free text is kept, only completed with "dari". */
export function childOrder(order: string, kind: 'Putra' | 'Putri'): string {
    const u = clean(order).replace(/:$/, '');
    if (!u) return '';
    if (/^\d+$/.test(u)) {
        const n = Number(u);
        return `${kind} ${ORDINAL[n - 1] ?? `ke-${n}`} dari`;
    }
    return /\bdari\b/i.test(u) ? u : `${u} dari`;
}

export function mapsUrl(ev: InvitationEvent | undefined): string {
    if (!ev) return '';
    if (clean(ev.locationUrl)) return clean(ev.locationUrl);
    if (ev.mapsLat && ev.mapsLng) return `https://www.google.com/maps/search/?api=1&query=${ev.mapsLat},${ev.mapsLng}`;
    const q = [ev.locationName, ev.location].map(clean).filter(Boolean).join(', ');
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/** YouTube/Vimeo page → embeddable player URL; direct video files are returned as files. */
export function videoSource(url: string): { src: string; kind: 'file' | 'embed' } {
    const raw = clean(url);
    if (!raw) return { src: '', kind: 'file' };
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(raw)) return { src: raw, kind: 'file' };
    try {
        const u = new URL(raw);
        const host = u.hostname.replace(/^(www|m)\./, '');
        if (host === 'youtu.be') return { src: `https://www.youtube.com/embed/${u.pathname.slice(1)}`, kind: 'embed' };
        if (host === 'youtube.com') {
            if (u.pathname.startsWith('/embed/')) return { src: raw, kind: 'embed' };
            const id = u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
            if (id) return { src: `https://www.youtube.com/embed/${id}`, kind: 'embed' };
        }
        if (host === 'vimeo.com') {
            const id = u.pathname.split('/').filter(Boolean)[0];
            if (id) return { src: `https://player.vimeo.com/video/${id}`, kind: 'embed' };
        }
        return { src: raw, kind: 'embed' };
    } catch {
        return { src: '', kind: 'file' };
    }
}

function eventKind(name: string): EventKind {
    if (/akad|ijab|pemberkatan|matrimony/i.test(name)) return 'akad';
    if (/resepsi|walimah|pahargyan|reception|party|ngunduh/i.test(name)) return 'resepsi';
    return 'other';
}

const SUBTITLE: Record<EventKind, string> = { akad: 'Ijab kabul', resepsi: 'Panggih & pahargyan', other: 'Rangkaian acara' };

function toEvent(ev: InvitationEvent, i: number): EventItem {
    const kind = eventKind(ev.name);
    const startTime = hhmm(ev.time);
    const endTime = hhmm(ev.timeEnd);
    const start = isoWib(ev.date, startTime);
    // Calendar entries need an end: fall back to two hours after the start.
    const end = isoWib(ev.date, endTime) || (start ? new Date(new Date(start).getTime() + 2 * 3600e3).toISOString() : '');
    const dot = (t: string) => t.replace(':', '.');
    const timeLabel = startTime ? (endTime ? `${dot(startTime)} – ${dot(endTime)} WIB` : `${dot(startTime)} WIB – selesai`) : '';
    return {
        id: `ev${i}`,
        kind,
        title: clean(ev.name) || 'Acara',
        subtitle: kind === 'akad' && /pemberkatan/i.test(ev.name) ? 'Pemberkatan nikah' : SUBTITLE[kind],
        dateLabel: clean(ev.dateFormatted) || (start ? dateFmt.format(new Date(start)) : ''),
        timeLabel,
        start,
        end,
        venueName: clean(ev.locationName),
        address: clean(ev.location),
        mapsUrl: mapsUrl(ev),
    };
}

/** "Dan segala sesuatu … (QS. Adz-Dzariyat: 49)" → text + source. */
function splitQuote(quote: string): WeddingConfig['couple']['verse'] {
    const q = clean(quote);
    if (!q) return TEKS.verse;
    const m = /^(.*?)\s*\(([^()]+)\)\s*\.?$/s.exec(q);
    return m && m[1] ? { text: m[1].trim(), translation: '', source: m[2].trim() } : { text: q, translation: '', source: '' };
}

const nickname = (nick: string, full: string) => clean(nick) || clean(full).split(/\s+/)[0] || '';

function person(inv: WeddingInvitation, who: 'groom' | 'bride'): Person {
    const g = who === 'groom';
    const full = clean(g ? inv.groomFullName : inv.brideFullName);
    return {
        fullName: full,
        nickname: nickname(g ? inv.groomNickname : inv.brideNickname, full),
        childOrder: childOrder(g ? inv.groomChildOrder : inv.brideChildOrder, g ? 'Putra' : 'Putri'),
        parents: [g ? inv.groomFather : inv.brideFather, g ? inv.groomMother : inv.brideMother].map(clean).filter(Boolean).join(' & '),
        photo: clean(g ? inv.groomPhoto : inv.bridePhoto),
        instagram: clean(g ? inv.groomInstagram : inv.brideInstagram).replace(/^@/, ''),
    };
}

/** Guest name from the link: ?to=Nama+Tamu (also ?kepada= / ?guest=), rendered as text only. */
export function guestFromUrl(): string {
    if (typeof window === 'undefined') return '';
    try {
        const p = new URLSearchParams(window.location.search);
        const raw = p.get('to') ?? p.get('kepada') ?? p.get('guest') ?? '';
        return (
            raw
                // eslint-disable-next-line no-control-regex
                .replace(/[\u0000-\u001f<>]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 60)
        );
    } catch {
        return '';
    }
}

export function buildWedding(inv: WeddingInvitation, visitor?: string, greetingProp?: Greeting): WeddingConfig {
    const greeting = greetingProp ?? inv.greeting;
    const features = inv.features ?? {};
    const on = (k: string) => features[k] !== false;
    const bride = person(inv, 'bride');
    const groom = person(inv, 'groom');
    const rawEvents = inv.events ?? [];
    const main = rawEvents.find((e) => e.isCountdown) ?? rawEvents[0];
    const events = rawEvents.map(toEvent);
    const sample = !!inv.isSample;

    const realGallery = (inv.gallery ?? []).filter((g) => clean(g.url));
    // Sample invitations without photos show the theme's labeled placeholders.
    const gallery: GalleryItem[] = realGallery.length
        ? realGallery.map((g, i) => ({
              id: `g${i}`,
              src: g.url,
              alt: clean(g.label) || `Foto ${bride.nickname} & ${groom.nickname} ${i + 1}`,
              caption: clean(g.label),
              orientation: 'portrait',
          }))
        : sample
          ? PLACEHOLDER_PHOTOS.map((src, i) => ({
                id: `p${i}`,
                src,
                alt: `Foto prewedding ${i + 1} (placeholder)`,
                caption: 'Placeholder — ganti dengan foto prewedding',
                orientation: PLACEHOLDER_ORIENTATION[i],
            }))
          : [];

    const story: StoryMilestone[] = (inv.loveStory ?? [])
        .filter((s) => clean(s.title) || clean(s.desc))
        .map((s, i) => ({ id: `s${i}`, dateLabel: clean(s.date), title: clean(s.title), body: clean(s.desc), photo: clean(s.photo) }));

    const accounts = [
        ...(inv.bankAccounts ?? [])
            .filter((a) => clean(a.accountNumber))
            .map((a, i) => ({
                id: `b${i}`,
                bankName: clean(a.bankName),
                accountHolder: clean(a.accountName),
                accountNumber: clean(a.accountNumber),
            })),
        ...(inv.digitalWallets ?? [])
            .filter((w) => clean(w.accountNumber))
            .map((w, i) => ({
                id: `w${i}`,
                bankName: clean(w.label) || clean(w.provider),
                accountHolder: clean(w.accountName),
                accountNumber: clean(w.accountNumber),
            })),
    ];
    const qris = (inv.digitalWallets ?? [])
        .filter((w) => clean(w.qrisQrUrl))
        .map((w, i) => ({ id: `q${i}`, label: clean(w.label) || clean(w.provider), src: clean(w.qrisQrUrl) }));

    const video = videoSource(inv.coupleVideoUrl ?? '');
    const mainDate = withOffset(inv.countdownDate) || isoWib(main?.date ?? '', hhmm(main?.time));
    const music = inv.music?.url ? inv.music : null;
    const tag = `${bride.nickname}${groom.nickname}`.replace(/[^\p{L}\p{N}]/gu, '');

    return {
        isExampleData: sample,
        invitationTitle: TEKS.title,
        invitationSubtitle: TEKS.subtitle,
        couple: {
            bride,
            groom,
            openingGreeting: TEKS.greeting,
            openingMessage: clean(greeting?.message) || TEKS.opening,
            verse: splitQuote(inv.openingQuote),
        },
        mainDate,
        mainDateLabel: clean(inv.mainDateFormatted) || clean(main?.dateFormatted) || (mainDate ? dateFmt.format(new Date(mainDate)) : ''),
        events,
        dressCodes: (inv.dressCodes ?? []).filter((d) => clean(d.name)).map((d) => ({ name: clean(d.name), hex: clean(d.hex) })),
        gallery,
        galleryVideo: { ...video, title: 'Video prewedding' },
        story,
        gift: { intro: TEKS.giftIntro, accounts, qris, thanks: TEKS.giftThanks },
        audio: {
            src: music?.url ?? '',
            // The theme's own gamelan starts with the invitation; uploaded music follows its autoplay setting.
            autoplay: music ? music.autoplay : true,
            loop: music ? music.loop : true,
            title: music ? 'Musik latar' : TEKS.audioTitle,
            credit: music ? TEKS.audioFileCredit : TEKS.audioSynthCredit,
        },
        closing: TEKS.closing,
        hashtag: tag ? `#${tag}Pawiwahan` : '',
        guest: {
            name: clean(inv.guestName) || clean(visitor) || guestFromUrl(),
            title: clean(greeting?.title) || 'Kepada Yth. Bapak/Ibu/Saudara/i',
            label: clean(greeting?.guestLabel) || 'Tamu Undangan',
            buttonText: clean(greeting?.buttonText) || 'Buka Undangan',
            qrData: clean(inv.guestQrData),
            slug: clean(inv.guestSlug),
        },
        rsvp: {
            endpoint: clean(inv.rsvpEndpoint),
            wishesEndpoint: clean(inv.wishesEndpoint),
            allowComments: inv.allowComments !== false,
            deadline: /^\d{4}-\d{2}-\d{2}/.test(clean(inv.rsvpDeadline))
                ? shortDateFmt.format(new Date(`${inv.rsvpDeadline.slice(0, 10)}T12:00:00${TZ}`))
                : '',
            storageKey: `wt14-rsvp-${inv.code || inv.slug || 'demo'}`,
        },
        sections: {
            cover: on('cover'),
            guest: on('greeting'),
            couple: on('couple_profile') && !!(bride.nickname || groom.nickname),
            countdown: on('countdown') && !!mainDate,
            calendar: on('add_to_calendar') && events.some((e) => e.start),
            events: on('event_detail') && events.length > 0,
            location: on('location'),
            gallery: on('gallery') && gallery.length > 0,
            video: on('video') && !!video.src,
            story: on('love_story') && story.length > 0,
            rsvp: on('rsvp'),
            wishes: on('wishes'),
            gift: on('digital_envelope') && (accounts.length > 0 || qris.length > 0),
            music: on('music'),
            footer: on('footer'),
        },
    };
}
