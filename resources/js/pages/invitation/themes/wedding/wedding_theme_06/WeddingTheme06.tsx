import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import {
    BookHeart,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock3,
    Gift,
    Heart,
    Images,
    Landmark,
    Loader2,
    MapPin,
    MessageCircleHeart,
    Send,
    Sparkles,
    UserRound,
    WalletCards,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import './wedding-theme-06.css';

interface WeddingTheme06Props {
    invitation?: Partial<WeddingInvitation>;
    visitor?: string;
    greeting?: Greeting;
}

type Theme06Event = InvitationEvent & {
    note?: string;
};

type WishAttendance = 'hadir' | 'tidak_hadir' | 'maybe';

interface Theme06Wish {
    name: string;
    message: string;
    date: string;
    attendance: WishAttendance;
}

interface NavItem {
    id: string;
    label: string;
    Icon: LucideIcon;
}

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    light?: boolean;
}

interface CoupleCardProps {
    role: string;
    nickname: string;
    fullName: string;
    initials: string;
    photo: string;
    childOrder: string;
    father: string;
    mother: string;
    bio: string;
    align?: 'left' | 'right';
}

interface EventCardProps {
    event: Theme06Event;
    index: number;
    allowCalendar: boolean;
}

interface WishBoardProps {
    endpoint: string;
    allowComments: boolean;
    onToast: (message: string) => void;
}

interface GalleryLightboxProps {
    items: NonNullable<WeddingInvitation['gallery']>;
    index: number | null;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

interface GiftTabDef {
    key: 'bank' | 'ewallet';
    label: string;
    Icon: LucideIcon;
}

const WISHES_PAGE_SIZE = 4;
const TEXT_FALLBACK_GUEST = 'Kepada Bapak/Ibu/Saudara/i';

const DEMO_PHOTOS = {
    groom: new URL('./assets/photos/groom.jpg', import.meta.url).href,
    bride: new URL('./assets/photos/bride.jpg', import.meta.url).href,
    hero: new URL('./assets/photos/hero-couple.jpg', import.meta.url).href,
    story1: new URL('./assets/photos/story-1.jpg', import.meta.url).href,
    story2: new URL('./assets/photos/story-2.jpg', import.meta.url).href,
    story3: new URL('./assets/photos/story-3.jpg', import.meta.url).href,
    story4: new URL('./assets/photos/story-4.jpg', import.meta.url).href,
    gallery1: new URL('./assets/photos/gallery-1.jpg', import.meta.url).href,
    gallery2: new URL('./assets/photos/gallery-2.jpg', import.meta.url).href,
    gallery3: new URL('./assets/photos/gallery-3.jpg', import.meta.url).href,
    gallery4: new URL('./assets/photos/gallery-4.jpg', import.meta.url).href,
    gallery5: new URL('./assets/photos/gallery-5.jpg', import.meta.url).href,
    gallery6: new URL('./assets/photos/gallery-6.jpg', import.meta.url).href,
    gallery7: new URL('./assets/photos/gallery-7.jpg', import.meta.url).href,
    gallery8: new URL('./assets/photos/gallery-8.jpg', import.meta.url).href,
    gallery9: new URL('./assets/photos/gallery-9.jpg', import.meta.url).href,
} as const;

const DEMO_EVENTS: Theme06Event[] = [
    {
        name: 'Akad Nikah',
        date: '2026-09-12',
        dateFormatted: 'Sabtu, 12 September 2026',
        time: '08:00',
        timeEnd: '10:00',
        locationName: 'Kediaman Mempelai Wanita',
        location: 'Jl. Melati No. 17, Jakarta Pusat',
        locationUrl: 'https://maps.google.com/?q=Kediaman+Mempelai+Wanita+Jakarta+Pusat',
        mapsEmbed: 'https://www.google.com/maps?q=Jakarta%20Pusat&output=embed',
        mapsLat: '-6.186486',
        mapsLng: '106.834091',
        isCountdown: true,
        note: 'Dihadiri keluarga inti dan kerabat terdekat.',
    },
    {
        name: 'Resepsi',
        date: '2026-09-12',
        dateFormatted: 'Sabtu, 12 September 2026',
        time: '11:00',
        timeEnd: '14:00',
        locationName: 'The Hotel Djakarta Ballroom',
        location: 'Jl. M.H. Thamrin No. 28, Menteng, Jakarta Pusat',
        locationUrl: 'https://maps.google.com/?q=The+Hotel+Djakarta+Ballroom+Menteng+Jakarta+Pusat',
        mapsEmbed: 'https://www.google.com/maps?q=Jakarta%20Pusat&output=embed',
        mapsLat: '-6.191870',
        mapsLng: '106.822706',
        isCountdown: false,
        note: 'Terbuka untuk seluruh tamu undangan.',
    },
];

const DEMO_GALLERY = [
    { url: DEMO_PHOTOS.gallery1, category: 'prewedding', label: 'Prewedding session' },
    { url: DEMO_PHOTOS.gallery2, category: 'prewedding', label: 'Sesi foto taman' },
    { url: DEMO_PHOTOS.gallery3, category: 'moment', label: 'Golden hour' },
    { url: DEMO_PHOTOS.gallery4, category: 'moment', label: 'Kebersamaan' },
    { url: DEMO_PHOTOS.gallery5, category: 'moment', label: 'Momen tawa' },
    { url: DEMO_PHOTOS.gallery6, category: 'moment', label: 'Menuju hari bahagia' },
    { url: DEMO_PHOTOS.gallery7, category: 'prewedding', label: 'Cinta yang tumbuh' },
    { url: DEMO_PHOTOS.gallery8, category: 'moment', label: 'Kasih yang terjaga' },
    { url: DEMO_PHOTOS.gallery9, category: 'moment', label: 'Bahagia berdua' },
];

const DEMO_LOVE_STORY = [
    {
        date: 'Agustus 2019',
        title: 'Pertama Bertemu',
        desc: 'Dipertemukan di sebuah acara kantor, obrolan singkat tentang buku favorit berlanjut hingga larut malam.',
        photo: DEMO_PHOTOS.story1,
    },
    {
        date: 'Februari 2020',
        title: 'Menjalin Kasih',
        desc: 'Setelah beberapa bulan dekat, Putra memberanikan diri mengungkapkan perasaannya di bawah hujan sore itu.',
        photo: DEMO_PHOTOS.story2,
    },
    {
        date: 'Desember 2024',
        title: 'Melamar',
        desc: 'Lamaran sederhana di pantai saat matahari terbenam, disaksikan keluarga terdekat kedua belah pihak.',
        photo: DEMO_PHOTOS.story3,
    },
    {
        date: 'September 2026',
        title: 'Menuju Hari Bahagia',
        desc: 'Kini keduanya bersiap melangkah ke jenjang pernikahan, memulai babak baru dengan penuh syukur.',
        photo: DEMO_PHOTOS.story4,
    },
];

const DEMO_DRESS_CODES = [
    { name: 'Cream Ivory', hex: '#F4EFEA' },
    { name: 'Warm Tan', hex: '#E8D3B0' },
    { name: 'Antique Gold', hex: '#C9A227' },
    { name: 'Deep Maroon', hex: '#7A0C2E' },
    { name: 'Umber Brown', hex: '#5A4632' },
];

const DEMO_BANK_ACCOUNTS = [
    { bankName: 'BCA', accountName: 'Putra Wardhana', accountNumber: '1234567890' },
    { bankName: 'Mandiri', accountName: 'Ayu Kirana Dewi', accountNumber: '0987654321' },
];

const DEMO_EWALLETS = [
    { provider: 'GoPay', label: 'GoPay', accountName: 'Putra Wardhana', accountNumber: '081234567890', logoUrl: '', qrisQrUrl: null },
    { provider: 'OVO', label: 'OVO', accountName: 'Ayu Kirana Dewi', accountNumber: '081298765432', logoUrl: '', qrisQrUrl: null },
    { provider: 'DANA', label: 'DANA', accountName: 'Putra Wardhana', accountNumber: '081234567890', logoUrl: '', qrisQrUrl: null },
    { provider: 'ShopeePay', label: 'ShopeePay', accountName: 'Ayu Kirana Dewi', accountNumber: '081298765432', logoUrl: '', qrisQrUrl: null },
];

const DEMO_WISHES: Theme06Wish[] = [
    {
        name: 'Dewi Anggraini',
        attendance: 'hadir',
        message: 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah.',
        date: '2026-06-01T10:00:00+07:00',
    },
    {
        name: 'Rian Saputra',
        attendance: 'hadir',
        message: 'Bahagia sekali melihat kalian akhirnya menikah. Sukses selalu untuk rumah tangga baru kalian.',
        date: '2026-06-03T14:30:00+07:00',
    },
    {
        name: 'Sinta Maharani',
        attendance: 'tidak_hadir',
        message: 'Maaf tidak bisa hadir, tapi doa terbaik selalu menyertai kalian berdua.',
        date: '2026-06-05T09:15:00+07:00',
    },
    {
        name: 'Budi Prakoso',
        attendance: 'hadir',
        message: 'Barakallahu laka wa baraka alaika. Semoga menjadi keluarga yang penuh berkah.',
        date: '2026-06-06T20:45:00+07:00',
    },
    {
        name: 'Maya Salsabila',
        attendance: 'hadir',
        message: 'Doa terbaik untuk rumah tangga yang harmonis, saling menguatkan, dan penuh cinta.',
        date: '2026-06-08T08:20:00+07:00',
    },
    {
        name: 'Fajar Nugroho',
        attendance: 'tidak_hadir',
        message: 'Maaf belum bisa hadir, semoga acara berjalan lancar dan penuh kebahagiaan.',
        date: '2026-06-09T18:10:00+07:00',
    },
];

const DEMO_GREETING: Greeting = {
    title: 'Kepada Bapak/Ibu/Saudara/i',
    guestLabel: 'Tamu Undangan',
    message: 'Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    buttonText: 'Buka Undangan',
};

const DEMO_INVITATION: WeddingInvitation = {
    type: 'wedding',
    code: 'putra-ayu-06',
    slug: 'putra-ayu',
    title: 'Putra & Ayu - Undangan Pernikahan',
    guestName: '',
    countdownDate: '2026-09-12T08:00:00+07:00',
    pageTitle: 'Putra & Ayu - Undangan Pernikahan',
    mainDateFormatted: 'Sabtu, 12 September 2026',
    events: DEMO_EVENTS,
    gallery: DEMO_GALLERY,
    coupleVideoUrl: '',
    bankAccounts: DEMO_BANK_ACCOUNTS,
    digitalWallets: DEMO_EWALLETS,
    allowComments: true,
    rsvpEndpoint: '/api/inv/putra-ayu-06/rsvp',
    wishesEndpoint: '/api/inv/putra-ayu-06/wishes',
    features: {
        cover: true,
        greeting: true,
        couple_profile: true,
        event_detail: true,
        countdown: true,
        location: true,
        gallery: true,
        love_story: true,
        rsvp: true,
        wishes: true,
        digital_envelope: true,
        add_to_calendar: true,
        music: true,
        footer: true,
    },
    music: undefined,
    greeting: DEMO_GREETING,
    guestQrData: 'demo-guest-qr-putra-ayu-06',
    guestSlug: '',
    groomFullName: 'Putra Wardhana',
    groomNickname: 'Putra',
    groomInitials: 'P',
    groomChildOrder: 'Putra pertama dari dua bersaudara',
    groomFather: 'Bapak H. Sutrisno',
    groomMother: 'Ibu Hj. Ratnawati',
    groomBio: 'Putra tumbuh di Yogyakarta dan kini bekerja sebagai software engineer. Tenang, hangat, dan selalu punya waktu untuk mendengarkan.',
    groomPhoto: DEMO_PHOTOS.groom,
    brideFullName: 'Ayu Kirana Dewi',
    brideNickname: 'Ayu',
    brideInitials: 'A',
    brideChildOrder: 'Putri kedua dari tiga bersaudara',
    brideFather: 'Bapak H. Suparman',
    brideMother: 'Ibu Hj. Aminah',
    brideBio: 'Ayu seorang guru taman kanak-kanak yang ceria dan penyayang. Cintanya pada anak-anak dan bunga membuat siapa pun merasa nyaman di dekatnya.',
    bridePhoto: DEMO_PHOTOS.bride,
    couplePhoto: DEMO_PHOTOS.hero,
    loveStory: DEMO_LOVE_STORY,
    dressCodes: DEMO_DRESS_CODES,
    rsvpDeadline: '10 September 2026',
    openingQuote: 'Dan di antara tanda-tanda-Nya, Dia menciptakan pasangan agar kita tenteram satu sama lain.',
};

function textValue(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
}

function initialsFrom(name: string, fallback = '?'): string {
    const words = textValue(name)
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return fallback;
    return words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}

function formatIndonesianDate(date: string, withWeekday = true): string {
    if (!date) return '';
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('id-ID', {
        weekday: withWeekday ? 'long' : undefined,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatWishDate(date: string): string {
    if (!date) return '';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatDateTimeForCalendar(date: string, time: string): string {
    const safeDate = textValue(date).replace(/-/g, '');
    const safeTime = textValue(time, '08:00').replace(/:/g, '');
    return `${safeDate}T${safeTime.padEnd(6, '0')}`;
}

function getMapsUrl(event: InvitationEvent): string {
    const locationUrl = textValue(event.locationUrl);
    if (locationUrl) return locationUrl;

    const lat = textValue(event.mapsLat);
    const lng = textValue(event.mapsLng);
    return lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '';
}

function buildCalendarUrl(event: InvitationEvent): string {
    const start = formatDateTimeForCalendar(event.date, event.time);
    const end = formatDateTimeForCalendar(event.date, event.timeEnd || event.time || '10:00');
    const locationName = textValue(event.locationName);
    const location = textValue(event.location);
    const loc = locationName ? `${locationName}${location ? `, ${location}` : ''}` : location;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(textValue(event.name, 'Acara Pernikahan'))}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
}

function normalizeWish(raw: Record<string, unknown>): Theme06Wish {
    const attendance = raw.attendance === 'tidak_hadir' || raw.attendance === 'maybe' ? raw.attendance : 'hadir';

    return {
        name: textValue(raw.name ?? raw.guest_name ?? raw.guestName, 'Tamu Undangan'),
        message: textValue(raw.message ?? raw.comment_text ?? raw.content, ''),
        date: textValue(raw.date ?? raw.approved_at ?? raw.created_at, new Date().toISOString()),
        attendance: attendance as WishAttendance,
    };
}

function normalizeInvitation(invitation?: Partial<WeddingInvitation>): WeddingInvitation {
    const features = {
        ...DEMO_INVITATION.features,
        ...(invitation?.features ?? {}),
    };

    const greeting = invitation?.greeting
        ? {
              ...DEMO_INVITATION.greeting,
              ...invitation.greeting,
          }
        : DEMO_INVITATION.greeting;

    const music = invitation?.music
        ? {
              url: textValue(invitation.music.url),
              autoplay: Boolean(invitation.music.autoplay),
              loop: invitation.music.loop ?? true,
          }
        : DEMO_INVITATION.music;

    return {
        ...DEMO_INVITATION,
        ...invitation,
        features,
        greeting,
        music,
        events: invitation?.events?.length ? (invitation.events as Theme06Event[]) : DEMO_INVITATION.events,
        gallery: invitation?.gallery?.length ? invitation.gallery : DEMO_INVITATION.gallery,
        bankAccounts: invitation?.bankAccounts?.length ? invitation.bankAccounts : DEMO_INVITATION.bankAccounts,
        digitalWallets: invitation?.digitalWallets?.length ? invitation.digitalWallets : DEMO_INVITATION.digitalWallets,
        loveStory: invitation?.loveStory?.length ? invitation.loveStory : DEMO_INVITATION.loveStory,
        dressCodes: invitation?.dressCodes?.length ? invitation.dressCodes : DEMO_INVITATION.dressCodes,
        allowComments: invitation?.allowComments ?? DEMO_INVITATION.allowComments,
        pageTitle: textValue(invitation?.pageTitle, DEMO_INVITATION.pageTitle),
        mainDateFormatted: textValue(invitation?.mainDateFormatted, DEMO_INVITATION.mainDateFormatted),
        title: textValue(invitation?.title, DEMO_INVITATION.title),
        code: textValue(invitation?.code, DEMO_INVITATION.code),
        slug: textValue(invitation?.slug, DEMO_INVITATION.slug),
        countdownDate: textValue(invitation?.countdownDate, DEMO_INVITATION.countdownDate),
        openingQuote: textValue(invitation?.openingQuote, DEMO_INVITATION.openingQuote),
        guestQrData: textValue(invitation?.guestQrData, DEMO_INVITATION.guestQrData),
        rsvpDeadline: textValue(invitation?.rsvpDeadline, DEMO_INVITATION.rsvpDeadline),
        rsvpEndpoint: textValue(invitation?.rsvpEndpoint, DEMO_INVITATION.rsvpEndpoint),
        wishesEndpoint: textValue(invitation?.wishesEndpoint, DEMO_INVITATION.wishesEndpoint),
        groomFullName: textValue(invitation?.groomFullName, DEMO_INVITATION.groomFullName),
        groomNickname: textValue(invitation?.groomNickname, DEMO_INVITATION.groomNickname),
        groomInitials: textValue(invitation?.groomInitials, DEMO_INVITATION.groomInitials),
        groomChildOrder: textValue(invitation?.groomChildOrder, DEMO_INVITATION.groomChildOrder),
        groomFather: textValue(invitation?.groomFather, DEMO_INVITATION.groomFather),
        groomMother: textValue(invitation?.groomMother, DEMO_INVITATION.groomMother),
        groomBio: textValue(invitation?.groomBio, DEMO_INVITATION.groomBio),
        groomPhoto: textValue(invitation?.groomPhoto, DEMO_INVITATION.groomPhoto),
        brideFullName: textValue(invitation?.brideFullName, DEMO_INVITATION.brideFullName),
        brideNickname: textValue(invitation?.brideNickname, DEMO_INVITATION.brideNickname),
        brideInitials: textValue(invitation?.brideInitials, DEMO_INVITATION.brideInitials),
        brideChildOrder: textValue(invitation?.brideChildOrder, DEMO_INVITATION.brideChildOrder),
        brideFather: textValue(invitation?.brideFather, DEMO_INVITATION.brideFather),
        brideMother: textValue(invitation?.brideMother, DEMO_INVITATION.brideMother),
        brideBio: textValue(invitation?.brideBio, DEMO_INVITATION.brideBio),
        bridePhoto: textValue(invitation?.bridePhoto, DEMO_INVITATION.bridePhoto),
        couplePhoto: textValue(invitation?.couplePhoto, DEMO_INVITATION.couplePhoto),
    };
}

function SectionDivider() {
    return (
        <div className="wt6-divider" aria-hidden="true">
            <span />
            <Heart size={16} strokeWidth={1.8} />
            <span />
        </div>
    );
}

function SectionHeading({ eyebrow, title, subtitle, light = false }: SectionHeadingProps) {
    return (
        <div className={`wt6-section-heading${light ? ' wt6-section-heading--light' : ''}`}>
            <span className="wt6-section-tag wt6-anim-up">{eyebrow}</span>
            <h2 className="wt6-section-title wt6-anim-up">{title}</h2>
            <SectionDivider />
            {subtitle && <p className="wt6-section-subtitle wt6-anim-up">{subtitle}</p>}
        </div>
    );
}

function Decor({ position, tone }: { position: 'tl' | 'tr' | 'bl' | 'br'; tone: string }) {
    return <span aria-hidden="true" className={`wt6-decor wt6-decor--${position} wt6-decor--${tone}`} />;
}

function CoupleCard({ role, nickname, fullName, initials, photo, childOrder, father, mother, bio, align = 'left' }: CoupleCardProps) {
    const hasPhoto = Boolean(photo);
    const parents = [father, mother].filter(Boolean);

    return (
        <article className={`wt6-couple-card wt6-couple-card--${align} wt6-anim-${align}`}>
            <div className="wt6-couple-photo-wrap">
                {hasPhoto ? (
                    <img className="wt6-couple-photo" src={photo} alt={fullName || nickname} loading="lazy" />
                ) : (
                    <div className="wt6-couple-photo wt6-couple-photo--fallback">{initials}</div>
                )}
            </div>
            <div className="wt6-couple-copy">
                <span className="wt6-couple-role">{role}</span>
                <h3 className="wt6-couple-name">{nickname || fullName}</h3>
                <p className="wt6-couple-fullname">{fullName}</p>
                {childOrder && <p className="wt6-couple-order">{childOrder}</p>}
                {parents.length > 0 && (
                    <p className="wt6-couple-parents">
                        {parents.length === 2 ? (
                            <>
                                {parents[0]}
                                <br />
                                &amp; {parents[1]}
                            </>
                        ) : (
                            parents[0]
                        )}
                    </p>
                )}
                {bio && <p className="wt6-couple-bio">{bio}</p>}
            </div>
        </article>
    );
}

function EventCard({ event, index, allowCalendar }: EventCardProps) {
    const mapsUrl = getMapsUrl(event);
    const time = event.time ? (event.timeEnd ? `${event.time} - ${event.timeEnd} WIB` : `${event.time} WIB`) : '';
    const note = textValue((event as Theme06Event).note, '');

    return (
        <article className="wt6-event-card wt6-anim-up">
            <div className="wt6-event-icon">
                <CalendarDays size={28} strokeWidth={1.6} />
            </div>
            <p className="wt6-event-type">Acara {index + 1}</p>
            <h3 className="wt6-event-name">{event.name}</h3>
            <div className="wt6-event-divider" />
            <p className="wt6-event-detail">
                <CalendarDays size={16} strokeWidth={1.7} />
                <strong>{textValue(event.dateFormatted, formatIndonesianDate(event.date))}</strong>
            </p>
            {time && (
                <p className="wt6-event-detail">
                    <Clock3 size={16} strokeWidth={1.7} />
                    <span>{time}</span>
                </p>
            )}
            {(event.locationName || event.location) && (
                <p className="wt6-event-detail">
                    <MapPin size={16} strokeWidth={1.7} />
                    <span>
                        {event.locationName && <strong>{event.locationName}</strong>}
                        {event.locationName && event.location && <br />}
                        {event.location}
                    </span>
                </p>
            )}
            {note && <p className="wt6-event-note">{note}</p>}
            <div className="wt6-event-actions">
                {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt6-btn wt6-btn--ghost">
                        <MapPin size={15} strokeWidth={1.8} />
                        Peta
                    </a>
                )}
                {allowCalendar && event.date && (
                    <button type="button" className="wt6-btn wt6-btn--ghost" onClick={() => window.open(buildCalendarUrl(event), '_blank', 'noopener,noreferrer')}>
                        <CalendarDays size={15} strokeWidth={1.8} />
                        Kalender
                    </button>
                )}
            </div>
        </article>
    );
}

function GalleryLightbox({ items, index, onClose, onPrev, onNext }: GalleryLightboxProps) {
    if (index === null) return null;

    const current = items[index];
    if (!current) return null;

    return (
        <div className="wt6-lightbox" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <button type="button" className="wt6-lightbox-close" onClick={onClose} aria-label="Tutup galeri">
                <X size={20} strokeWidth={2} />
            </button>
            {items.length > 1 && (
                <button type="button" className="wt6-lightbox-prev" onClick={onPrev} aria-label="Foto sebelumnya">
                    <ChevronLeft size={20} strokeWidth={2} />
                </button>
            )}
            <div className="wt6-lightbox-body" onClick={(e) => e.stopPropagation()}>
                <div className="wt6-lightbox-meta">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>/</span>
                    <span>{String(items.length).padStart(2, '0')}</span>
                </div>
                <img src={current.url} alt={current.label || 'Galeri'} className="wt6-lightbox-image" />
                <div className="wt6-lightbox-caption">{current.label || 'Foto galeri'}</div>
            </div>
            {items.length > 1 && (
                <button type="button" className="wt6-lightbox-next" onClick={onNext} aria-label="Foto berikutnya">
                    <ChevronRight size={20} strokeWidth={2} />
                </button>
            )}
        </div>
    );
}

function WishBoard({ endpoint, allowComments, onToast }: WishBoardProps) {
    const [wishes, setWishes] = useState<Theme06Wish[]>(DEMO_WISHES);
    const [source, setSource] = useState<'demo' | 'server'>('demo');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(DEMO_WISHES.length > WISHES_PAGE_SIZE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [attendance, setAttendance] = useState<WishAttendance>('hadir');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!endpoint) return;

        let alive = true;

        const loadServerWishes = async () => {
            try {
                const response = await fetch(`${endpoint}?page=1`, {
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) return;

                const data = await response.json();
                const serverWishes = Array.isArray(data.wishes) ? data.wishes.map((wish: Record<string, unknown>) => normalizeWish(wish)) : [];

                if (!alive || serverWishes.length === 0) return;

                setWishes(serverWishes);
                setSource('server');
                setPage(1);
                setHasMore(Boolean(data.last_page ? 1 < data.last_page : serverWishes.length >= WISHES_PAGE_SIZE));
            } catch {
                // Keep demo wishes if server is not reachable.
            }
        };

        loadServerWishes();

        return () => {
            alive = false;
        };
    }, [endpoint]);

    const visibleWishes = source === 'server' ? wishes : wishes.slice(0, page * WISHES_PAGE_SIZE);
    const canLoadMore = source === 'server' ? hasMore : page * WISHES_PAGE_SIZE < wishes.length;

    const loadMore = async () => {
        if (source === 'server') {
            if (!endpoint || !hasMore || loadingMore) return;

            setLoadingMore(true);
            try {
                const nextPage = page + 1;
                const response = await fetch(`${endpoint}?page=${nextPage}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) {
                    setHasMore(false);
                    return;
                }

                const data = await response.json();
                const serverWishes = Array.isArray(data.wishes) ? data.wishes.map((wish: Record<string, unknown>) => normalizeWish(wish)) : [];
                setWishes((prev) => [...prev, ...serverWishes]);
                setPage(nextPage);
                setHasMore(Boolean(data.last_page ? nextPage < data.last_page : serverWishes.length >= WISHES_PAGE_SIZE));
            } catch {
                setHasMore(false);
            } finally {
                setLoadingMore(false);
            }
            return;
        }

        setPage((prev) => prev + 1);
    };

    const submitWish = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedMessage = message.trim();

        if (!trimmedName || !trimmedMessage) {
            onToast('Nama dan ucapan harus diisi.');
            return;
        }

        const newWish: Theme06Wish = {
            name: trimmedName,
            attendance,
            message: trimmedMessage,
            date: new Date().toISOString(),
        };

        setSubmitting(true);

        try {
            if (endpoint) {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                        message: trimmedMessage,
                    }),
                });
            }
        } catch {
            // Local update still happens so the UI remains useful in demo mode.
        } finally {
            setWishes((prev) => [newWish, ...prev]);
            setPage(1);
            setName('');
            setAttendance('hadir');
            setMessage('');
            setSubmitting(false);
            onToast('Ucapan berhasil dikirim.');
        }
    };

    return (
        <div className="wt6-wishes-layout">
            {allowComments && (
                <div className="wt6-wishes-form">
                    <h3 className="wt6-wishes-form-title">Tulis Ucapan</h3>
                    <form onSubmit={submitWish}>
                        <div className="wt6-form-row">
                            <label className="wt6-form-label" htmlFor="wt6-wish-name">
                                Nama
                            </label>
                            <input
                                id="wt6-wish-name"
                                type="text"
                                value={name}
                                onChange={(ev) => setName(ev.target.value)}
                                placeholder="Nama Anda"
                                className="wt6-wish-input"
                            />
                        </div>

                        <div className="wt6-form-row">
                            <label className="wt6-form-label">Kehadiran</label>
                            <div className="wt6-radio-group">
                                <label className={`wt6-radio-pill${attendance === 'hadir' ? ' is-checked' : ''}`}>
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="hadir"
                                        checked={attendance === 'hadir'}
                                        onChange={() => setAttendance('hadir')}
                                    />
                                    Hadir
                                </label>
                                <label className={`wt6-radio-pill${attendance === 'tidak_hadir' ? ' is-checked' : ''}`}>
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="tidak_hadir"
                                        checked={attendance === 'tidak_hadir'}
                                        onChange={() => setAttendance('tidak_hadir')}
                                    />
                                    Tidak Hadir
                                </label>
                            </div>
                        </div>

                        <div className="wt6-form-row">
                            <label className="wt6-form-label" htmlFor="wt6-wish-message">
                                Ucapan &amp; Doa
                            </label>
                            <textarea
                                id="wt6-wish-message"
                                value={message}
                                onChange={(ev) => setMessage(ev.target.value)}
                                placeholder="Tulis ucapan dan doa terbaik Anda..."
                                rows={5}
                                className="wt6-wish-textarea"
                            />
                        </div>

                        <button type="submit" disabled={submitting} className="wt6-wish-submit">
                            {submitting ? <Loader2 size={16} strokeWidth={2} className="wt6-spin" /> : <Send size={16} strokeWidth={2} />}
                            {submitting ? 'Mengirim...' : 'Kirim Ucapan'}
                        </button>
                    </form>
                </div>
            )}

            <div className="wt6-wishes-list-wrap">
                <div className="wt6-wishes-list">
                    {visibleWishes.map((wish, index) => {
                        const statusLabel =
                            wish.attendance === 'tidak_hadir' ? 'Tidak Hadir' : wish.attendance === 'maybe' ? 'Mungkin Hadir' : 'Hadir';

                        return (
                            <article key={`${wish.name}-${wish.date}-${index}`} className="wt6-wish-card">
                                <div className="wt6-wish-head">
                                    <div className="wt6-wish-avatar" style={{ background: WISH_AVATAR_COLORS[index % WISH_AVATAR_COLORS.length] }}>
                                        {initialsFrom(wish.name)}
                                    </div>
                                    <div className="wt6-wish-meta">
                                        <p className="wt6-wish-name">{wish.name}</p>
                                        <p className="wt6-wish-date">{formatWishDate(wish.date)}</p>
                                    </div>
                                    <span className={`wt6-wish-status ${wish.attendance}`}>{statusLabel}</span>
                                </div>
                                <p className="wt6-wish-message">{wish.message}</p>
                            </article>
                        );
                    })}

                    {visibleWishes.length === 0 && (
                        <p className="wt6-wish-empty">Belum ada ucapan. Jadilah yang pertama.</p>
                    )}
                </div>

                {canLoadMore && (
                    <button type="button" onClick={loadMore} className="wt6-wishes-more">
                        {loadingMore ? <Loader2 size={16} strokeWidth={2} className="wt6-spin" /> : <ChevronDown size={16} strokeWidth={2} />}
                        {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                    </button>
                )}
            </div>
        </div>
    );
}

const WISH_AVATAR_COLORS = ['#7A0C2E', '#B8912E', '#C9A876', '#5A4632', '#9A6B58', '#D5C1A4'];

const EMPTY_FEATURES: NonNullable<WeddingInvitation['features']> = {};

export default function WeddingTheme06({ invitation, visitor, greeting }: WeddingTheme06Props) {
    const data = useMemo(() => normalizeInvitation(invitation), [invitation]);
    const [opened, setOpened] = useState(() => data.features?.cover === false);
    const [preloaderVisible, setPreloaderVisible] = useState(true);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState('wt6-hero');
    const [giftTab, setGiftTab] = useState<'bank' | 'ewallet'>('bank');
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const { toast, showToast, clearToast } = useToast();
    const mainRef = useRef<HTMLDivElement>(null);

    const features = data.features ?? EMPTY_FEATURES;
    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const coupleEnabled = features.couple_profile !== false;
    const eventEnabled = features.event_detail !== false;
    const countdownEnabled = features.countdown !== false;
    const locationEnabled = features.location !== false;
    const galleryEnabled = features.gallery !== false;
    const loveStoryEnabled = features.love_story !== false;
    const rsvpEnabled = features.rsvp !== false;
    const wishesEnabled = features.wishes !== false;
    const giftEnabled = features.digital_envelope !== false;
    const musicEnabled = features.music !== false;
    const footerEnabled = features.footer !== false;
    const addToCalendarEnabled = features.add_to_calendar !== false;

    const groomName = textValue(data.groomNickname, data.groomFullName);
    const brideName = textValue(data.brideNickname, data.brideFullName);
    const groomInitials = textValue(data.groomInitials, initialsFrom(groomName, 'P'));
    const brideInitials = textValue(data.brideInitials, initialsFrom(brideName, 'A'));
    const couplePhoto = textValue(data.couplePhoto, data.groomPhoto || data.bridePhoto);
    const groomPhoto = textValue(data.groomPhoto, couplePhoto);
    const bridePhoto = textValue(data.bridePhoto, couplePhoto);
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = textValue(data.guestName, visitor || '');
    const coverGuestName = guestName || textValue(data.greeting?.guestLabel, TEXT_FALLBACK_GUEST);
    const mainEvent = (data.events as Theme06Event[]).find((event) => event.isCountdown) ?? (data.events as Theme06Event[])[0];
    const canShowMaps = locationEnabled && Boolean(mainEvent && (mainEvent.locationName || mainEvent.location || mainEvent.mapsEmbed || mainEvent.locationUrl));
    const hasGiftPanels = data.bankAccounts.length > 0 || data.digitalWallets.length > 0;
    const giftTabs = useMemo<GiftTabDef[]>(
        () =>
            [
                data.bankAccounts.length > 0 ? { key: 'bank' as const, label: 'Transfer Bank', Icon: Landmark } : null,
                data.digitalWallets.length > 0 ? { key: 'ewallet' as const, label: 'E-Wallet', Icon: WalletCards } : null,
            ].filter(Boolean) as GiftTabDef[],
        [data.bankAccounts.length, data.digitalWallets.length],
    );
    const activeGiftTab = giftTabs.find((tab) => tab.key === giftTab)?.key ?? giftTabs[0]?.key ?? 'bank';

    const navItems = useMemo<NavItem[]>(() => {
        const items: NavItem[] = [{ id: 'wt6-hero', label: 'Home', Icon: Heart }];

        if (coupleEnabled) items.push({ id: 'wt6-couple', label: 'Mempelai', Icon: UserRound });
        if (eventEnabled) items.push({ id: 'wt6-events', label: 'Acara', Icon: CalendarDays });
        if (canShowMaps) items.push({ id: 'wt6-address', label: 'Lokasi', Icon: MapPin });
        if (loveStoryEnabled) items.push({ id: 'wt6-story', label: 'Story', Icon: BookHeart });
        if (galleryEnabled) items.push({ id: 'wt6-gallery', label: 'Galeri', Icon: Images });
        if (giftEnabled && hasGiftPanels) items.push({ id: 'wt6-gift', label: 'Gift', Icon: Gift });
        if (rsvpEnabled) items.push({ id: 'wt6-rsvp', label: 'RSVP', Icon: MessageCircleHeart });
        if (wishesEnabled) items.push({ id: 'wt6-wishes', label: 'Ucapan', Icon: MessageCircleHeart });
        if (footerEnabled) items.push({ id: 'wt6-closing', label: 'Penutup', Icon: ChevronDown });

        return items;
    }, [canShowMaps, coupleEnabled, eventEnabled, footerEnabled, galleryEnabled, giftEnabled, hasGiftPanels, loveStoryEnabled, rsvpEnabled, wishesEnabled]);

    useEffect(() => {
        const timer = window.setTimeout(() => setPreloaderVisible(false), 700);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!coverEnabled) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = opened ? '' : 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [coverEnabled, opened]);

    useEffect(() => {
        const hasModalOpen = galleryIndex !== null;
        const previous = document.body.style.overflow;
        if (hasModalOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = previous;
        };
    }, [galleryIndex]);

    useEffect(() => {
        if (!opened) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('wt6-visible');
                    }
                });
            },
            { threshold: 0.12 },
        );

        document.querySelectorAll('.wt6-anim-up, .wt6-anim-left, .wt6-anim-right, .wt6-anim-scale').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const handler = () => {
            setShowBackTop(window.scrollY > 460);
            let current = navItems[0]?.id ?? 'wt6-hero';

            for (const item of navItems) {
                const element = document.getElementById(item.id);
                if (element && window.scrollY >= element.offsetTop - 260) {
                    current = item.id;
                }
            }

            setActiveSection(current);
        };

        handler();
        window.addEventListener('scroll', handler, { passive: true });

        return () => window.removeEventListener('scroll', handler);
    }, [navItems, opened]);

    useEffect(() => {
        if (!navItems.some((item) => item.id === activeSection)) {
            setActiveSection(navItems[0]?.id ?? 'wt6-hero');
        }
    }, [activeSection, navItems]);

    useEffect(() => {
        if (giftTabs.length > 0 && !giftTabs.some((tab) => tab.key === giftTab)) {
            setGiftTab(giftTabs[0].key);
        }
    }, [giftTab, giftTabs]);

    useEffect(() => {
        if (galleryIndex === null) return;

        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setGalleryIndex(null);
            if (event.key === 'ArrowLeft' && galleryEnabled && DEMO_GALLERY.length > 0) {
                setGalleryIndex((current) => (current !== null ? (current - 1 + DEMO_GALLERY.length) % DEMO_GALLERY.length : null));
            }
            if (event.key === 'ArrowRight' && galleryEnabled && DEMO_GALLERY.length > 0) {
                setGalleryIndex((current) => (current !== null ? (current + 1) % DEMO_GALLERY.length : null));
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [galleryEnabled, galleryIndex]);

    const openInvitation = () => {
        setOpened(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openGallery = (index: number) => setGalleryIndex(index);
    const closeGallery = () => setGalleryIndex(null);
    const prevGallery = () => setGalleryIndex((current) => (current !== null ? (current - 1 + DEMO_GALLERY.length) % DEMO_GALLERY.length : null));
    const nextGallery = () => setGalleryIndex((current) => (current !== null ? (current + 1) % DEMO_GALLERY.length : null));

    return (
        <div className="wt6-root">
            {preloaderVisible && (
                <div className="wt6-preloader" aria-hidden="true">
                    <div className="wt6-preloader-ring" />
                    <div className="wt6-preloader-text">Memuat Undangan</div>
                </div>
            )}

            {coverEnabled && (
                <section className={`wt6-cover${opened ? ' is-hidden' : ''}`} aria-label="Cover undangan">
                    <Decor position="tr" tone="sprig" />
                    <Decor position="bl" tone="rose-gold" />

                    <div className="wt6-cover-card">
                        <p className="wt6-cover-eyebrow">The Wedding Of</p>
                        <h1 className="wt6-cover-names">
                            {groomName} <span>&amp;</span> {brideName}
                        </h1>
                        <div className="wt6-cover-ring">
                            {heroPhoto ? (
                                <img src={heroPhoto} alt={`${groomName} & ${brideName}`} className="wt6-cover-photo" loading="eager" />
                            ) : (
                                <div className="wt6-cover-photo wt6-cover-photo--fallback">
                                    {groomInitials} &amp; {brideInitials}
                                </div>
                            )}
                        </div>
                        <p className="wt6-cover-date">{data.mainDateFormatted}</p>
                        <p className="wt6-cover-guest">{coverGuestName}</p>
                        {greetingEnabled && textValue(greeting?.message || data.greeting?.message) && (
                            <p className="wt6-cover-message">{textValue(greeting?.message || data.greeting?.message)}</p>
                        )}
                        {data.guestQrData && (
                            <div className="wt6-cover-qr">
                                <GuestQrCode
                                    data={data.guestQrData}
                                    size={180}
                                    style={{ borderRadius: '10px', border: '3px solid rgba(184,145,46,0.42)' }}
                                />
                                <p className="wt6-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button type="button" className="wt6-btn wt6-btn--cover" onClick={openInvitation}>
                            {textValue(greeting?.buttonText || data.greeting?.buttonText, 'Buka Undangan')}
                        </button>
                    </div>
                </section>
            )}

            <nav className="wt6-dotnav" aria-label="Navigasi section">
                {navItems.map(({ id, label, Icon }) => (
                    <a key={id} href={`#${id}`} className={activeSection === id ? 'is-active' : ''} title={label} aria-label={label}>
                        <Icon size={18} strokeWidth={1.8} />
                    </a>
                ))}
            </nav>

            <div ref={mainRef} className={`wt6-main${opened || !coverEnabled ? ' is-visible' : ''}`}>
                <section id="wt6-hero" className="wt6-hero wt6-section-anchor">
                    <div className="wt6-hero-inner wt6-container">
                        <div className="wt6-hero-media wt6-anim-up">
                            <div className="wt6-hero-ring wt6-hero-ring--outer" />
                            <div className="wt6-hero-ring wt6-hero-ring--inner" />
                            <div className="wt6-hero-photo-frame">
                                {heroPhoto ? (
                                    <img src={heroPhoto} alt={`${groomName} & ${brideName}`} className="wt6-hero-photo" loading="eager" />
                                ) : (
                                    <div className="wt6-hero-photo wt6-hero-photo--fallback">
                                        {groomInitials} &amp; {brideInitials}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="wt6-hero-copy">
                            <span className="wt6-hero-eyebrow wt6-anim-up">The Wedding Of</span>
                            <h2 className="wt6-hero-names wt6-anim-up">
                                {groomName} <span>&amp;</span> {brideName}
                            </h2>
                            <div className="wt6-hero-date-row wt6-anim-up">
                                <span>{data.mainDateFormatted}</span>
                                <span className="wt6-hero-date-sep" />
                                <span>Jakarta, Indonesia</span>
                            </div>
                            {countdownEnabled && (
                                <Countdown
                                    targetDate={data.countdownDate}
                                    className="wt6-countdown wt6-anim-up"
                                    boxClassName="wt6-countdown-box"
                                    numClassName="wt6-countdown-num"
                                    labelClassName="wt6-countdown-label"
                                    doneMessage={
                                        <div className="wt6-countdown-done">
                                            <Heart size={18} strokeWidth={1.8} />
                                            Hari bahagia telah tiba
                                        </div>
                                    }
                                />
                            )}
                            <a href="#wt6-couple" className="wt6-btn wt6-btn--ghost wt6-anim-up">
                                <BookHeart size={16} strokeWidth={1.8} />
                                Lihat Undangan
                            </a>
                        </div>
                    </div>
                    <div className="wt6-scroll-cue" aria-hidden="true">
                        <span>Scroll</span>
                        <span className="wt6-scroll-stem" />
                    </div>
                </section>

                <section className="wt6-section wt6-section--sand wt6-quote-section">
                    <Decor position="tl" tone="sprig-2" />
                    <div className="wt6-container">
                        <div className="wt6-quote-block wt6-anim-up">
                            <div className="wt6-quote-bismillah">Bismillahirrahmanirrahim</div>
                            <div className="wt6-quote-greeting">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</div>
                            <p className="wt6-quote-text">{textValue(data.openingQuote)}</p>
                            <span className="wt6-quote-source">QS. Ar-Rum: 21</span>
                            <p className="wt6-invitation-text">
                                Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta&apos;ala, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk
                                menghadiri acara pernikahan putra-putri kami.
                            </p>
                        </div>
                    </div>
                </section>

                {coupleEnabled && (
                    <section id="wt6-couple" className="wt6-section wt6-couple-section">
                        <Decor position="tr" tone="leaf-big-2" />
                        <Decor position="bl" tone="leaf-big-3" />
                        <div className="wt6-container">
                            <SectionHeading
                                eyebrow="Kedua Mempelai"
                                title="Mempelai"
                                subtitle="Dengan penuh syukur, kami perkenalkan kedua mempelai yang akan melangkah bersama ke jenjang pernikahan."
                            />

                            <div className="wt6-couple-grid">
                                <CoupleCard
                                    role="Mempelai Pria"
                                    nickname={groomName}
                                    fullName={textValue(data.groomFullName, groomName)}
                                    initials={groomInitials}
                                    photo={groomPhoto}
                                    childOrder={textValue(data.groomChildOrder)}
                                    father={textValue(data.groomFather)}
                                    mother={textValue(data.groomMother)}
                                    bio={textValue(data.groomBio)}
                                    align="left"
                                />
                                <div className="wt6-couple-amp wt6-anim-up">&amp;</div>
                                <CoupleCard
                                    role="Mempelai Wanita"
                                    nickname={brideName}
                                    fullName={textValue(data.brideFullName, brideName)}
                                    initials={brideInitials}
                                    photo={bridePhoto}
                                    childOrder={textValue(data.brideChildOrder)}
                                    father={textValue(data.brideFather)}
                                    mother={textValue(data.brideMother)}
                                    bio={textValue(data.brideBio)}
                                    align="right"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {eventEnabled && data.events.length > 0 && (
                    <section id="wt6-events" className="wt6-section wt6-section--sand wt6-events-section">
                        <Decor position="tr" tone="rose-blush" />
                        <div className="wt6-container">
                            <SectionHeading
                                eyebrow="Save The Date"
                                title="Waktu &amp; Acara"
                                subtitle="Merupakan kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."
                            />
                            <div className="wt6-events-grid">
                                {(data.events as Theme06Event[]).map((event, index) => (
                                    <EventCard key={`${event.name}-${event.date}-${index}`} event={event} index={index} allowCalendar={addToCalendarEnabled} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {canShowMaps && mainEvent && (
                    <section id="wt6-address" className="wt6-section wt6-address-section">
                        <Decor position="bl" tone="rose-cream" />
                        <div className="wt6-container">
                            <SectionHeading eyebrow="Petunjuk Arah" title="Lokasi Acara" />
                            <div className="wt6-address-wrap wt6-anim-up">
                                <div className="wt6-address-copy">
                                    <h3>{textValue(mainEvent.locationName, mainEvent.name)}</h3>
                                    <p>{textValue(mainEvent.location, 'Lokasi belum diatur')}</p>
                                    {getMapsUrl(mainEvent) && (
                                        <a href={getMapsUrl(mainEvent)} target="_blank" rel="noreferrer" className="wt6-btn wt6-btn--gold">
                                            <MapPin size={16} strokeWidth={1.8} />
                                            Buka di Google Maps
                                        </a>
                                    )}
                                </div>
                                {mainEvent.mapsEmbed && (
                                    <div className="wt6-map-frame">
                                        <iframe
                                            src={mainEvent.mapsEmbed}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            allowFullScreen
                                            title="Lokasi acara"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {loveStoryEnabled && data.loveStory.length > 0 && (
                    <section id="wt6-story" className="wt6-section wt6-section--sand wt6-story-section">
                        <Decor position="tl" tone="sprig-3" />
                        <Decor position="br" tone="rose-grey" />
                        <div className="wt6-container">
                            <SectionHeading
                                eyebrow="Perjalanan Kami"
                                title="Kisah Cinta"
                                subtitle="Setiap pasangan punya ceritanya sendiri. Berikut sepenggal perjalanan kami hingga sampai di titik ini."
                            />
                            <div className="wt6-story-timeline">
                                {data.loveStory.map((story, index) => {
                                    const alignRight = index % 2 === 1;
                                    return (
                                        <article key={`${story.title}-${story.date}-${index}`} className="wt6-story-item">
                                            {alignRight ? (
                                                <>
                                                    <div />
                                                    <div className="wt6-story-dot">
                                                        <Heart size={14} strokeWidth={2} />
                                                    </div>
                                                    <div className="wt6-story-card wt6-anim-right">
                                                        {story.photo && <img src={story.photo} alt={story.title} className="wt6-story-photo" loading="lazy" />}
                                                        <p className="wt6-story-date">{story.date}</p>
                                                        <h3 className="wt6-story-title">{story.title}</h3>
                                                        <p className="wt6-story-desc">{story.desc}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="wt6-story-card wt6-anim-left">
                                                        {story.photo && <img src={story.photo} alt={story.title} className="wt6-story-photo" loading="lazy" />}
                                                        <p className="wt6-story-date">{story.date}</p>
                                                        <h3 className="wt6-story-title">{story.title}</h3>
                                                        <p className="wt6-story-desc">{story.desc}</p>
                                                    </div>
                                                    <div className="wt6-story-dot">
                                                        <Heart size={14} strokeWidth={2} />
                                                    </div>
                                                    <div />
                                                </>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {galleryEnabled && data.gallery.length > 0 && (
                    <section id="wt6-gallery" className="wt6-section wt6-gallery-section">
                        <Decor position="tr" tone="rose-gold" />
                        <div className="wt6-container">
                            <SectionHeading eyebrow="Momen Kami" title="Galeri Foto" subtitle="Klik salah satu foto untuk melihat tampilan penuh." />
                            <div className="wt6-gallery-grid">
                                {data.gallery.map((item, index) => (
                                    <button
                                        key={`${item.url}-${index}`}
                                        type="button"
                                        className="wt6-gallery-item"
                                        onClick={() => openGallery(index)}
                                        aria-label={item.label || `Foto ${index + 1}`}
                                    >
                                        <img src={item.url} alt={item.label || `Foto ${index + 1}`} className="wt6-gallery-thumb" loading="lazy" />
                                        <div className="wt6-gallery-overlay">
                                            <Images size={18} strokeWidth={1.8} />
                                            Lihat Foto
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section id="wt6-dresscode" className="wt6-section wt6-section--sand wt6-dress-section">
                    <Decor position="bl" tone="leaf-big-1" />
                    <div className="wt6-container">
                        <SectionHeading eyebrow="Tuntunan Busana" title="Dress Code" />
                        <div className="wt6-dress-wrap wt6-anim-up">
                            <div className="wt6-dress-copy">
                                <p className="wt6-section-subtitle wt6-section-subtitle--left">
                                    Kami mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dan sopan dengan palet warna berikut, agar
                                    keharmonisan warna tetap terjaga di sepanjang acara.
                                </p>
                                <div className="wt6-swatches">
                                    {data.dressCodes.map((dressCode, index) => (
                                        <div key={`${dressCode.name}-${index}`} className="wt6-swatch">
                                            <span className="wt6-swatch-chip" style={{ background: dressCode.hex }} />
                                            <p className="wt6-swatch-name">{dressCode.name}</p>
                                            <p className="wt6-swatch-hex">{dressCode.hex}</p>
                                        </div>
                                    ))}
                                </div>
                                <ul className="wt6-dress-notes">
                                    <li>Hindari warna putih penuh, khusus untuk kedua mempelai.</li>
                                    <li>Disarankan busana formal atau semi-formal.</li>
                                    <li>Nyaman digunakan untuk duduk lesehan maupun berdiri lama.</li>
                                </ul>
                            </div>
                            <div className="wt6-dress-illustration">
                                <span className="wt6-dress-ornament" />
                            </div>
                        </div>
                    </div>
                </section>

                {giftEnabled && hasGiftPanels && (
                    <section id="wt6-gift" className="wt6-section wt6-gift-section">
                        <Decor position="tr" tone="sprig" />
                        <div className="wt6-container">
                            <SectionHeading
                                eyebrow="Tanpa Mengurangi Rasa Hormat"
                                title="Amplop Digital"
                                subtitle="Doa restu Bapak/Ibu/Saudara/i adalah karunia terindah. Namun jika ingin memberi tanda kasih, dapat melalui:"
                            />

                            {giftTabs.length > 1 && (
                                <div className="wt6-gift-tabs">
                                    {giftTabs.map(({ key, label, Icon }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`wt6-gift-tab${activeGiftTab === key ? ' is-active' : ''}`}
                                            onClick={() => setGiftTab(key)}
                                        >
                                            <Icon size={16} strokeWidth={1.8} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={`wt6-gift-panel${activeGiftTab === 'bank' ? ' is-active' : ''}`}>
                                {data.bankAccounts.length > 0 && (
                                    <DigitalWalletSection
                                        bankAccounts={data.bankAccounts}
                                        digitalWallets={[]}
                                        onToast={showToast}
                                        styles={{
                                            bankGrid: 'wt6-gift-grid',
                                            bankCard: 'wt6-gift-card',
                                            bankLogo: 'wt6-gift-logo',
                                            bankType: 'wt6-gift-type',
                                            bankNumber: 'wt6-gift-number',
                                            bankName: 'wt6-gift-name',
                                            copyBankBtn: 'wt6-copy-btn',
                                            ewalletGrid: 'wt6-ewallet-grid',
                                            ewalletCard: 'wt6-gift-card',
                                            ewalletName: 'wt6-gift-name',
                                            ewalletPhone: 'wt6-gift-number',
                                            copyEwalletBtn: 'wt6-copy-btn',
                                            ewalletTitle: 'wt6-ewallet-title',
                                        }}
                                    />
                                )}
                            </div>

                            <div className={`wt6-gift-panel${activeGiftTab === 'ewallet' ? ' is-active' : ''}`}>
                                {data.digitalWallets.length > 0 && (
                                    <DigitalWalletSection
                                        bankAccounts={[]}
                                        digitalWallets={data.digitalWallets}
                                        onToast={showToast}
                                        styles={{
                                            bankGrid: 'wt6-gift-grid',
                                            bankCard: 'wt6-gift-card',
                                            bankLogo: 'wt6-gift-logo',
                                            bankType: 'wt6-gift-type',
                                            bankNumber: 'wt6-gift-number',
                                            bankName: 'wt6-gift-name',
                                            copyBankBtn: 'wt6-copy-btn',
                                            ewalletGrid: 'wt6-ewallet-grid',
                                            ewalletCard: 'wt6-gift-card',
                                            ewalletName: 'wt6-gift-name',
                                            ewalletPhone: 'wt6-gift-number',
                                            copyEwalletBtn: 'wt6-copy-btn',
                                            ewalletTitle: 'wt6-ewallet-title',
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {rsvpEnabled && (
                    <section id="wt6-rsvp" className="wt6-section wt6-section--sand wt6-rsvp-section">
                        <Decor position="bl" tone="rose-cream" />
                        <div className="wt6-container">
                            <SectionHeading
                                eyebrow="Konfirmasi Kehadiran"
                                title="RSVP"
                                subtitle={data.rsvpDeadline ? `Mohon konfirmasi sebelum ${data.rsvpDeadline}.` : 'Mohon konfirmasi kehadiran Anda.'}
                            />
                            <div className="wt6-form-wrap wt6-anim-up">
                                <div className="wt6-form-copy">
                                    <p>
                                        Kami sangat berharap dapat berjumpa dengan Bapak/Ibu/Saudara/i di hari bahagia kami. Silakan isi konfirmasi
                                        kehadiran agar kami dapat menyiapkan sambutan dengan baik.
                                    </p>
                                    {data.rsvpDeadline && <p className="wt6-form-deadline">Batas konfirmasi: {data.rsvpDeadline}</p>}
                                </div>
                                <RSVPForm
                                    rsvpEndpoint={data.rsvpEndpoint}
                                    guestName={guestName || undefined}
                                    guestSlug={data.guestSlug}
                                    onToast={showToast}
                                    styles={{
                                        form: 'wt6-rsvp-form',
                                        label: 'wt6-form-label',
                                        input: 'wt6-form-input',
                                        select: 'wt6-form-input',
                                        textarea: 'wt6-form-input wt6-form-textarea',
                                        radioGroup: 'wt6-radio-group',
                                        radioLabel: 'wt6-radio-pill',
                                        errorText: 'wt6-form-error',
                                        submitBtn: 'wt6-btn wt6-btn--maroon wt6-btn--full',
                                        successBox: 'wt6-rsvp-success',
                                    }}
                                    labels={{
                                        name: 'Nama Lengkap *',
                                        guests: 'Jumlah Tamu',
                                        attendance: 'Konfirmasi Kehadiran *',
                                        attending: 'Hadir',
                                        notAttending: 'Tidak Hadir',
                                        maybe: 'Mungkin Hadir',
                                        message: 'Pesan / Doa',
                                        submit: 'Kirim Konfirmasi',
                                        successTitle: 'Terima kasih! Konfirmasi Anda telah kami terima.',
                                        successSub: 'Kami menantikan kehadiran Anda.',
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {wishesEnabled && (
                    <section id="wt6-wishes" className="wt6-section wt6-wishes-section">
                        <Decor position="tr" tone="leaf-big-2" />
                        <div className="wt6-container">
                            <SectionHeading eyebrow="Doa &amp; Harapan" title="Ucapan untuk Kami" />
                            <WishBoard endpoint={data.wishesEndpoint} allowComments={data.allowComments} onToast={showToast} />
                        </div>
                    </section>
                )}

                {footerEnabled && (
                    <section id="wt6-closing" className="wt6-closing wt6-section-anchor">
                        <Decor position="tr" tone="sprig" />
                        <Decor position="bl" tone="rose-gold" />
                        <div className="wt6-container">
                            <div className="wt6-closing-ring wt6-anim-up">
                                {heroPhoto ? (
                                    <img src={heroPhoto} alt={`${groomName} & ${brideName}`} className="wt6-closing-photo" loading="lazy" />
                                ) : (
                                    <span className="wt6-closing-ring-art" />
                                )}
                            </div>
                            <p className="wt6-closing-verse wt6-anim-up">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan
                                doa restu kepada kedua mempelai.
                            </p>
                            <div className="wt6-closing-thanks wt6-anim-up">Terima Kasih</div>
                            <h2 className="wt6-closing-names wt6-anim-up">
                                {groomName} &amp; {brideName}
                            </h2>
                            <footer className="wt6-closing-footer wt6-anim-up">
                                Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
                                <div className="wt6-made-with">Undangan Digital - dibuat dengan cinta untuk hari bahagia kami</div>
                            </footer>
                        </div>
                    </section>
                )}
            </div>

            {musicEnabled && textValue(data.music?.url) && (
                <MusicPlayer
                    url={textValue(data.music?.url)}
                    autoplay={Boolean(data.music?.autoplay)}
                    loop={data.music?.loop ?? true}
                    triggerPlay={opened || !coverEnabled}
                    buttonClassName="wt6-music-btn"
                    buttonStyle={{ background: 'var(--wt6-maroon)', border: '1px solid var(--wt6-gold)', color: 'var(--wt6-gold)' }}
                />
            )}

            <Toast message={toast} onDone={clearToast} className="wt6-toast" />

            {showBackTop && (
                <button type="button" className="wt6-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">
                    <ChevronUp size={20} strokeWidth={1.8} />
                </button>
            )}

            <GalleryLightbox items={data.gallery} index={galleryIndex} onClose={closeGallery} onPrev={prevGallery} onNext={nextGallery} />
        </div>
    );
}
