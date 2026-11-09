/* =====================================================================
   DATA TEMA — pengganti src/config/wedding.ts tema asli. Isi undangan diambil
   dari WeddingInvitation; yang tersisa di sini hanya teks khas tema.
   ===================================================================== */
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { DEMO_GALLERY, DEMO_STORY_IMAGES } from './aset';
import type { EventDetail, GalleryImage, Person, StoryChapter, VideoSource, WeddingConfig } from './types';

/** Theme texts — part of the theme's identity, not invitation data. */
export const TEKS = {
    tagline: 'Two hearts, one little universe.',
    intro: 'Dengan penuh rasa syukur, kami mengundang kamu untuk hadir dan menjadi bagian dari bab baru dalam cerita kami.',
    quote: {
        text: 'Cinta bukanlah saling memandang, melainkan bersama-sama memandang ke arah yang sama.',
        source: 'Antoine de Saint-Exupéry',
    },
    giftIntro:
        'Doa dan kehadiranmu adalah hadiah terindah bagi kami. Namun jika ingin memberikan tanda kasih, kamu dapat menitipkannya melalui amplop digital berikut.',
    giftThanks: 'Terima kasih atas setiap doa dan tanda kasih yang kamu titipkan 💛',
    closing: {
        message: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila kamu berkenan hadir dan memberikan doa restu.',
        signature: 'Kami yang berbahagia',
    },
    musicBoxTitle: 'Twilight Music Box',
    musicBoxCredit: 'Melodi orisinal yang dibuat langsung di browser',
    musicFileTitle: 'Musik latar',
    musicFileCredit: 'Musik pilihan mempelai',
};

/** Guest count options on the RSVP form. */
export const MAX_GUESTS = 5;
/** Frames that fit around the 3D gallery ring / story glade. */
export const MAX_GALLERY_FRAMES = 8;
export const MAX_STORY_FRAMES = 6;

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
function childOrder(order: string, kind: 'Putra' | 'Putri'): string {
    const u = clean(order).replace(/:$/, '');
    if (!u) return `${kind} dari`;
    if (/^\d+$/.test(u)) {
        const n = Number(u);
        return `${kind} ${ORDINAL[n - 1] ?? `ke-${n}`} dari`;
    }
    return /\bdari\b/i.test(u) ? u : `${u} dari`;
}

function mapsUrl(ev: InvitationEvent): string {
    if (clean(ev.locationUrl)) return clean(ev.locationUrl);
    if (ev.mapsLat && ev.mapsLng) return `https://www.google.com/maps/search/?api=1&query=${ev.mapsLat},${ev.mapsLng}`;
    const q = [ev.locationName, ev.location].map(clean).filter(Boolean).join(', ');
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/** YouTube/Vimeo page → embeddable player URL; direct video files are returned as files. */
function videoSource(url: string): VideoSource {
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

function toEvent(ev: InvitationEvent, i: number): EventDetail {
    const startTime = hhmm(ev.time);
    const endTime = hhmm(ev.timeEnd);
    const start = isoWib(ev.date, startTime);
    // Calendar entries need an end: fall back to two hours after the start.
    const end = isoWib(ev.date, endTime) || (start ? new Date(new Date(start).getTime() + 2 * 3600e3).toISOString() : '');
    const dot = (t: string) => t.replace(':', '.');
    return {
        id: `acara-${i + 1}`,
        name: clean(ev.name) || 'Acara',
        startISO: start,
        endISO: end,
        dateLabel: clean(ev.dateFormatted) || (start ? dateFmt.format(new Date(start)) : ''),
        timeLabel: startTime ? (endTime ? `${dot(startTime)} – ${dot(endTime)} WIB` : `${dot(startTime)} WIB – selesai`) : '',
        venueName: clean(ev.locationName),
        venueAddress: clean(ev.location),
        mapsUrl: mapsUrl(ev),
    };
}

/** "Dan segala sesuatu … (QS. Adz-Dzariyat: 49)" → text + source. */
function splitQuote(quote: string): WeddingConfig['couple']['quote'] {
    const q = clean(quote);
    if (!q) return TEKS.quote;
    const m = /^(.*?)\s*\(([^()]+)\)\s*\.?$/s.exec(q);
    return m && m[1] ? { text: m[1].trim(), source: m[2].trim() } : { text: q, source: '' };
}

const nickname = (nick: string, full: string) => clean(nick) || clean(full).split(/\s+/)[0] || '';
const initial = (initials: string, name: string) => (clean(initials) || name).charAt(0).toUpperCase();

function person(inv: WeddingInvitation, who: 'groom' | 'bride'): Person {
    const g = who === 'groom';
    const full = clean(g ? inv.groomFullName : inv.brideFullName);
    const parents = [g ? inv.groomFather : inv.brideFather, g ? inv.groomMother : inv.brideMother].map(clean).filter(Boolean).join(' & ');
    return {
        fullName: full,
        nickname: nickname(g ? inv.groomNickname : inv.brideNickname, full),
        parents: parents ? `${childOrder(g ? inv.groomChildOrder : inv.brideChildOrder, g ? 'Putra' : 'Putri')} ${parents}` : '',
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

    const realGallery: GalleryImage[] = (inv.gallery ?? [])
        .filter((g) => clean(g.url))
        .map((g, i) => ({
            src: g.url,
            thumb: g.url,
            alt: clean(g.label) || `Foto ${bride.nickname} & ${groom.nickname} ${i + 1}`,
            caption: clean(g.label),
            isDemo: false,
        }));
    // Sample invitations without photos show the theme's labelled demo illustrations.
    const gallery = realGallery.length ? realGallery : sample ? DEMO_GALLERY : [];

    const story: StoryChapter[] = (inv.loveStory ?? [])
        .filter((s) => clean(s.title) || clean(s.desc))
        .map((s, i) => ({
            id: `bab-${i + 1}`,
            label: `Bab ${i + 1}`,
            dateLabel: clean(s.date),
            title: clean(s.title),
            text: clean(s.desc),
            // Chapters without their own photo borrow one from the gallery for the floating 3D frame.
            image:
                clean(s.photo) ||
                (realGallery.length ? realGallery[i % realGallery.length].thumb : sample ? DEMO_STORY_IMAGES[i % DEMO_STORY_IMAGES.length] : ''),
        }));

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
    const weddingDateISO = withOffset(inv.countdownDate) || isoWib(main?.date ?? '', hhmm(main?.time));
    const music = inv.music?.url ? inv.music : null;
    const allowComments = inv.allowComments !== false;
    const deadline = /^\d{4}-\d{2}-\d{2}/.test(clean(inv.rsvpDeadline))
        ? shortDateFmt.format(new Date(`${inv.rsvpDeadline.slice(0, 10)}T12:00:00${TZ}`))
        : '';

    return {
        isSample: sample,
        couple: {
            displayNames: [bride.nickname, groom.nickname].filter(Boolean).join(' & '),
            monogram: [initial(inv.brideInitials, bride.nickname), initial(inv.groomInitials, groom.nickname)],
            tagline: TEKS.tagline,
            intro: clean(greeting?.message) || TEKS.intro,
            bride,
            groom,
            quote: splitQuote(inv.openingQuote),
        },
        guest: {
            name: clean(inv.guestName) || clean(visitor) || guestFromUrl(),
            title: clean(greeting?.title) || 'Kepada Yth. Bapak/Ibu/Saudara/i',
            label: clean(greeting?.guestLabel) || 'Tamu Undangan',
            buttonText: clean(greeting?.buttonText) || 'Buka Undangan',
            slug: clean(inv.guestSlug),
        },
        weddingDateISO,
        weddingDateLabel:
            clean(inv.mainDateFormatted) || clean(main?.dateFormatted) || (weddingDateISO ? dateFmt.format(new Date(weddingDateISO)) : ''),
        events,
        dressCodes: (inv.dressCodes ?? []).filter((d) => clean(d.name)).map((d) => ({ name: clean(d.name), hex: clean(d.hex) })),
        story,
        gallery,
        video,
        gift: { intro: TEKS.giftIntro, accounts, qris, thanks: TEKS.giftThanks },
        rsvp: {
            endpoint: clean(inv.rsvpEndpoint),
            wishesEndpoint: clean(inv.wishesEndpoint),
            allowComments,
            deadlineLabel: deadline ? `Mohon konfirmasi sebelum ${deadline}` : 'Mohon konfirmasi kehadiranmu',
            maxGuests: MAX_GUESTS,
            storageKey: `wt15-guestbook-${inv.code || inv.slug || 'demo'}`,
        },
        music: {
            src: music?.url ?? '',
            // The theme's own music box starts with the invitation; uploaded music follows its autoplay setting.
            autoplay: music ? music.autoplay : true,
            loop: music ? music.loop : true,
            title: music ? TEKS.musicFileTitle : TEKS.musicBoxTitle,
            credit: music ? TEKS.musicFileCredit : TEKS.musicBoxCredit,
        },
        closing: TEKS.closing,
        sections: {
            cover: on('cover'),
            guest: on('greeting'),
            couple: on('couple_profile') && !!(bride.nickname || groom.nickname),
            countdown: on('countdown') && !!weddingDateISO,
            calendar: on('add_to_calendar') && events.some((e) => e.startISO),
            events: on('event_detail') && events.length > 0,
            location: on('location'),
            gallery: on('gallery') && gallery.length > 0,
            video: on('video') && !!video.src,
            story: on('love_story') && story.length > 0,
            rsvp: on('rsvp'),
            wishes: on('wishes') && allowComments,
            gift: on('digital_envelope') && (accounts.length > 0 || qris.length > 0),
            music: on('music'),
            footer: on('footer'),
        },
    };
}
