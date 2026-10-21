/* =====================================================================
   DATA TEMA — pengganti src/data/invitation.ts desain asli. Isi undangan diambil
   dari WeddingInvitation; yang tersisa di sini hanya teks khas tema.
   ===================================================================== */
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { GALLERY_PLACEHOLDERS, VIDEO_POSTER } from './aset';
import { formatLongDate, formatTimeRange } from './date';
import type { Coordinates, GalleryItem, GiftAccount, InvitationConfig, LoveStoryMilestone, MilestoneIcon, Person, WeddingEvent } from './types';
import { getRecipientName } from './urlFlags';

/** Theme texts — part of the theme's identity, not invitation data. */
export const TEKS = {
    recipientPrefix: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    defaultRecipient: 'Tamu Undangan',
    buttonText: 'Buka Undangan',
    coverNote: 'Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di hari bahagia kami.',
    heroMessage:
        'Dengan penuh syukur dan sukacita, kami mengundang Anda untuk menyaksikan dan merayakan awal perjalanan kami sebagai pasangan suami istri.',
    quote: { text: 'Di antara begitu banyak taman, kami memilih untuk tumbuh bersama.' },
    rsvpNote: 'Mohon konfirmasi kehadiran agar kami dapat menyiapkan jamuan dengan baik.',
    dressCode: {
        title: 'Garden Formal',
        description: 'Kami menyarankan busana formal yang ringan dengan nuansa warna lembut agar serasi dengan suasana hari bahagia kami.',
        recommendations: [
            { label: 'Tamu pria', detail: 'Kemeja batik, kemeja lengan panjang, atau setelan jas berwarna lembut.' },
            { label: 'Tamu wanita', detail: 'Kebaya, gaun midi, atau busana formal berbahan ringan.' },
            { label: 'Alas kaki', detail: 'Sepatu yang nyaman untuk berjalan dan berdiri cukup lama.' },
        ],
        notes: ['Palet warna bersifat saran, bukan kewajiban.'],
    },
    /** Pillar colours in the 3D garden when the invitation has no dress code. */
    gardenPalette: [
        { name: 'Ivory', hex: '#F5EDDD' },
        { name: 'Champagne', hex: '#E8D5B0' },
        { name: 'Sage', hex: '#8FAE7E' },
        { name: 'Dusty Rose', hex: '#C9858C' },
        { name: 'Gold', hex: '#C9A25C' },
    ],
    giftMessage:
        'Doa restu Anda merupakan karunia terindah bagi kami. Namun, jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:',
    closing: {
        title: 'Terima Kasih',
        message: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
        prayer: 'Semoga cinta yang tumbuh di taman ini senantiasa dirawat dengan kesabaran, kejujuran, dan kasih sayang.',
        signature: 'Kami yang berbahagia',
    },
    musicSynth: {
        title: 'Taman Senja',
        artist: 'Komposisi ambient orisinal',
        credit: 'Disintesis langsung di peramban — tanpa file audio pihak ketiga.',
    },
    musicFile: { title: 'Musik latar', credit: 'Musik pilihan mempelai' },
};

/** Guest count options on the RSVP form. */
export const MAX_ATTENDEES = 4;
/** Guestbook entries per page in the browser-only demo mode (the server pages by 10). */
export const GUESTBOOK_PAGE_SIZE = 6;

const TIME_ZONE = 'Asia/Jakarta';
const TZ_LABEL = 'WIB';
const TZ_OFFSET = '+07:00';
const ORDINAL = ['pertama', 'kedua', 'ketiga', 'keempat', 'kelima', 'keenam', 'ketujuh', 'kedelapan', 'kesembilan', 'kesepuluh'];
const STORY_ICONS: MilestoneIcon[] = ['meet', 'heart', 'star', 'ring'];

const clean = (s: string | null | undefined) => (s ?? '').trim();

/** "08:00:00" → "08:00". */
function hhmm(t: string | null | undefined): string {
    const m = /^(\d{1,2})[:.](\d{2})/.exec(clean(t));
    return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
}

/** "2027-06-12" + "08:00" → "2027-06-12T08:00:00+07:00" (WIB). Empty when the date is missing/invalid. */
function isoWib(date: string, time: string): string {
    const d = clean(date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return '';
    const iso = `${d}T${time || '00:00'}:00${TZ_OFFSET}`;
    return Number.isNaN(new Date(iso).getTime()) ? '' : iso;
}

/** "2027-06-12T08:00:00" (no offset → WIB) → ISO with offset. */
function withOffset(dateTime: string): string {
    const v = clean(dateTime).replace(' ', 'T');
    if (!v) return '';
    const iso = /([+-]\d{2}:?\d{2}|Z)$/.test(v) ? v : `${v.length === 16 ? `${v}:00` : v}${TZ_OFFSET}`;
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

function coordinates(lat: string, lng: string): Coordinates | undefined {
    const la = Number.parseFloat(clean(lat));
    const ln = Number.parseFloat(clean(lng));
    return Number.isFinite(la) && Number.isFinite(ln) && (la !== 0 || ln !== 0) ? { lat: la, lng: ln } : undefined;
}

function person(inv: WeddingInvitation, who: 'groom' | 'bride'): Person {
    const g = who === 'groom';
    const fullName = clean(g ? inv.groomFullName : inv.brideFullName);
    return {
        fullName,
        nickname: clean(g ? inv.groomNickname : inv.brideNickname) || fullName.split(/\s+/)[0] || '',
        childOrder: childOrder(g ? inv.groomChildOrder : inv.brideChildOrder, g ? 'Putra' : 'Putri'),
        father: clean(g ? inv.groomFather : inv.brideFather),
        mother: clean(g ? inv.groomMother : inv.brideMother),
        photo: clean(g ? inv.groomPhoto : inv.bridePhoto),
        instagram: clean(g ? inv.groomInstagram : inv.brideInstagram).replace(/^@/, ''),
        bio: clean(g ? inv.groomBio : inv.brideBio),
    };
}

function toEvent(ev: InvitationEvent, i: number): WeddingEvent {
    const startTime = hhmm(ev.time);
    const endTime = hhmm(ev.timeEnd);
    const start = isoWib(ev.date, startTime);
    const end = endTime ? isoWib(ev.date, endTime) : '';
    return {
        id: `acara-${i + 1}`,
        name: clean(ev.name) || 'Acara',
        start,
        end: end && end > start ? end : undefined,
        timeZone: TIME_ZONE,
        timeZoneLabel: TZ_LABEL,
        dateLabel: clean(ev.dateFormatted) || formatLongDate(start, TIME_ZONE),
        timeLabel: startTime ? formatTimeRange(start, end || undefined, TIME_ZONE, TZ_LABEL) : '',
        venueName: clean(ev.locationName),
        address: clean(ev.location),
        coordinates: coordinates(ev.mapsLat, ev.mapsLng),
        mapsUrl: clean(ev.locationUrl) || undefined,
        embedUrl: /^https?:\/\//.test(clean(ev.mapsEmbed)) ? clean(ev.mapsEmbed) : undefined,
    };
}

/** YouTube/Vimeo page → embeddable player URL; direct video files are returned as files. */
function videoItem(url: string, poster: string): GalleryItem | null {
    const raw = clean(url);
    if (!raw) return null;
    const base = {
        id: 'video',
        kind: 'video',
        category: 'video',
        poster: poster || VIDEO_POSTER,
        alt: 'Video pasangan',
        caption: 'Video kami',
    } as const;
    if (/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(raw)) return { ...base, src: raw };
    try {
        const u = new URL(raw);
        const host = u.hostname.replace(/^(www|m)\./, '');
        if (host === 'youtu.be') return { ...base, embedUrl: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` };
        if (host === 'youtube.com') {
            const id = u.pathname.startsWith('/embed/') || u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
            if (id) return { ...base, embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
        }
        if (host === 'vimeo.com') {
            const id = u.pathname.split('/').filter(Boolean)[0];
            if (id) return { ...base, embedUrl: `https://player.vimeo.com/video/${encodeURIComponent(id)}` };
        }
        return { ...base, embedUrl: raw };
    } catch {
        return null;
    }
}

/** "Dan segala sesuatu … (QS. Adz-Dzariyat: 49)" → text + source. */
function splitQuote(quote: string): { text: string; source?: string } {
    const q = clean(quote);
    if (!q) return TEKS.quote;
    const m = /^(.*?)\s*\(([^()]+)\)\s*\.?$/s.exec(q);
    return m && m[1] ? { text: m[1].trim(), source: m[2].trim() } : { text: q };
}

/** Maps the Laravel invitation payload onto the theme's typed configuration. */
export function buildInvitation(inv: WeddingInvitation, visitor?: string, greetingProp?: Greeting): InvitationConfig {
    const greeting = greetingProp ?? inv.greeting;
    const features = inv.features ?? {};
    const on = (key: string) => features[key] !== false;
    const sample = Boolean(inv.isSample);

    const bride = person(inv, 'bride');
    const groom = person(inv, 'groom');
    const names = [bride.nickname, groom.nickname].filter(Boolean).join(' & ');

    const rawEvents = inv.events ?? [];
    const events = rawEvents.map(toEvent);
    const mainIndex = Math.max(
        0,
        rawEvents.findIndex((e) => e.isCountdown),
    );
    const main = events[mainIndex];
    const weddingDate = withOffset(inv.countdownDate) || main?.start || '';

    // The map shows the main venue; other venues are listed on their event cards.
    const venue = [main, ...events].find((e) => e && (e.venueName || e.address || e.coordinates || e.embedUrl));
    const venues = new Set(events.map((e) => `${e.venueName}|${e.address}`.toLowerCase()).filter((v) => v !== '|'));
    const location = venue
        ? {
              venueName: venue.venueName || venue.address,
              address: venue.venueName ? venue.address : '',
              coordinates: venue.coordinates,
              mapsUrl: venue.mapsUrl,
              embedUrl: venue.embedUrl,
              notes: venues.size > 1 ? 'Acara lainnya berlangsung di lokasi berbeda — lihat detailnya pada Rangkaian Acara.' : undefined,
          }
        : null;

    const loveStory: LoveStoryMilestone[] = (inv.loveStory ?? [])
        .filter((s) => clean(s.title) || clean(s.desc))
        .map(
            (s, i, all): LoveStoryMilestone => ({
                id: `kisah-${i + 1}`,
                dateLabel: clean(s.date),
                title: clean(s.title),
                description: clean(s.desc),
                icon: all.length > 1 && i === all.length - 1 ? 'calendar' : STORY_ICONS[i % STORY_ICONS.length],
                photo: clean(s.photo) || undefined,
            }),
        );

    const photos: GalleryItem[] = (inv.gallery ?? [])
        .filter((g) => clean(g.url))
        .map(
            (g, i): GalleryItem => ({
                id: `foto-${i + 1}`,
                kind: 'image',
                category: 'photo',
                src: g.url,
                alt: clean(g.label) || `Foto ${names} ${i + 1}`,
                caption: clean(g.label) || undefined,
            }),
        );
    const video = on('video') ? videoItem(inv.coupleVideoUrl ?? '', clean(inv.couplePhoto)) : null;
    // Sample invitations without photos show the design's labelled placeholder illustrations.
    const gallery = [...(on('gallery') ? (photos.length ? photos : sample ? GALLERY_PLACEHOLDERS : []) : []), ...(video ? [video] : [])];

    const accounts: GiftAccount[] = [
        ...(inv.bankAccounts ?? [])
            .filter((a) => clean(a.accountNumber))
            .map((a, i) => ({
                id: `bank-${i}`,
                type: 'bank' as const,
                provider: clean(a.bankName) || 'Bank',
                accountNumber: clean(a.accountNumber),
                accountHolder: clean(a.accountName),
            })),
        ...(inv.digitalWallets ?? [])
            .filter((w) => clean(w.accountNumber))
            .map((w, i) => ({
                id: `ewallet-${i}`,
                type: 'ewallet' as const,
                provider: clean(w.label) || clean(w.provider) || 'E-Wallet',
                accountNumber: clean(w.accountNumber),
                accountHolder: clean(w.accountName),
            })),
    ];
    const qris = (inv.digitalWallets ?? [])
        .filter((w) => clean(w.qrisQrUrl))
        .map((w, i) => ({ id: `qris-${i}`, label: clean(w.label) || clean(w.provider) || 'QRIS', image: clean(w.qrisQrUrl) }));

    const palette = (inv.dressCodes ?? [])
        .filter((d) => clean(d.name) && /^#[0-9a-f]{3,8}$/i.test(clean(d.hex)))
        .map((d) => ({ name: clean(d.name), hex: clean(d.hex).toUpperCase() }));

    const music = inv.music?.url ? inv.music : null;
    const allowComments = inv.allowComments !== false;
    const deadline = /^\d{4}-\d{2}-\d{2}/.test(clean(inv.rsvpDeadline)) ? `${inv.rsvpDeadline.slice(0, 10)}T23:59:00${TZ_OFFSET}` : undefined;

    return {
        meta: { isSample: sample, slug: clean(inv.code) || clean(inv.slug) || 'demo' },
        couple: { bride, groom, order: 'bride-first' },
        greeting: {
            recipientPrefix: clean(greeting?.title) || TEKS.recipientPrefix,
            defaultRecipient: clean(greeting?.guestLabel) || TEKS.defaultRecipient,
            recipientName: clean(inv.guestName) || clean(visitor) || getRecipientName(),
            buttonText: clean(greeting?.buttonText) || TEKS.buttonText,
            coverNote: TEKS.coverNote,
            heroMessage: clean(greeting?.message) || TEKS.heroMessage,
            quote: splitQuote(inv.openingQuote),
        },
        weddingDate,
        weddingDateLabel: clean(inv.mainDateFormatted) || main?.dateLabel || formatLongDate(weddingDate, TIME_ZONE),
        weddingTimeZone: TIME_ZONE,
        events,
        location,
        loveStory,
        gallery,
        rsvp: { deadline, maxAttendees: MAX_ATTENDEES, note: TEKS.rsvpNote },
        guestbook: { pageSize: GUESTBOOK_PAGE_SIZE },
        dressCode: { ...TEKS.dressCode, palette: palette.length ? palette : TEKS.gardenPalette },
        gift: { message: TEKS.giftMessage, accounts, qris },
        music: {
            src: music?.url ?? '',
            title: music ? TEKS.musicFile.title : TEKS.musicSynth.title,
            artist: music ? undefined : TEKS.musicSynth.artist,
            credit: music ? TEKS.musicFile.credit : TEKS.musicSynth.credit,
            volume: 0.55,
            // The theme's own ambient piece starts with the invitation; uploaded music follows its autoplay setting.
            playOnOpen: music ? music.autoplay : true,
            loop: music ? music.loop : true,
        },
        closing: TEKS.closing,
        backend: {
            rsvpEndpoint: clean(inv.rsvpEndpoint),
            guestbookEndpoint: clean(inv.wishesEndpoint),
            guestSlug: clean(inv.guestSlug),
        },
        sections: {
            cover: on('cover'),
            greeting: on('greeting'),
            couple: on('couple_profile') && Boolean(bride.nickname || groom.nickname),
            countdown: on('countdown') && Boolean(weddingDate),
            calendar: on('add_to_calendar') && events.some((e) => e.start),
            events: on('event_detail') && events.length > 0,
            location: on('location') && location !== null,
            story: on('love_story') && loveStory.length > 0,
            gallery: gallery.length > 0,
            rsvp: on('rsvp'),
            guestbook: on('wishes') && allowComments,
            dressCode: palette.length > 0,
            gift: on('digital_envelope') && (accounts.length > 0 || qris.length > 0),
            music: on('music'),
            footer: on('footer'),
        },
    };
}
