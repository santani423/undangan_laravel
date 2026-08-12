import Countdown from '@/components/invitation/Countdown';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import {
    BookHeart,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Copy,
    Gift,
    Heart,
    Home,
    Images,
    MapPin,
    MessageCircleHeart,
    PenLine,
    Search,
    Send,
    Sparkles,
    Volume2,
    VolumeX,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import './wedding-theme-09.css';

type AttendanceValue = 'hadir' | 'tidak_hadir' | 'ragu';
type NavSectionId = 'home' | 'couple' | 'event' | 'story' | 'gallery' | 'rsvp';
type ToastTone = 'success' | 'error' | 'info';

interface Theme09Props {
    invitation?: Partial<WeddingInvitation>;
    visitor?: string;
    greeting?: Greeting;
}

interface ToastState {
    message: string;
    tone: ToastTone;
}

interface RSVPState {
    name: string;
    phone: string;
    guests: string;
    status: AttendanceValue;
    message: string;
}

interface WishState {
    name: string;
    status: AttendanceValue;
    message: string;
}

interface WishEntry extends WishState {
    id: string;
    createdAt: string;
}

interface NavItem {
    id: NavSectionId;
    label: string;
    icon: LucideIcon;
}

interface EventCardProps {
    event: InvitationEvent;
    icon: LucideIcon;
    onCalendar: (event: InvitationEvent) => void;
    onMaps: (event: InvitationEvent) => void;
}

interface WalletCardProps {
    badge: string;
    variantClass?: string;
    accountNumber: string;
    accountName: string;
    copyLabel: string;
    copied: boolean;
    onCopy: () => void;
}

const STORAGE_KEYS = {
    rsvp: 'wt9-rsvp-records',
    wishes: 'wt9-wishes',
} as const;

const WISHES_PAGE_SIZE = 5;

const ASSETS = {
    cover: new URL('./assets/images/image1.jpg', import.meta.url).href,
    hero: new URL('./assets/images/couple-walk.png', import.meta.url).href,
    groom: new URL('./assets/images/groom.png', import.meta.url).href,
    bride: new URL('./assets/images/bride.png', import.meta.url).href,
    proposal: new URL('./assets/images/proposal.png', import.meta.url).href,
    story: new URL('./assets/images/image8.png', import.meta.url).href,
    bismillah: new URL('./assets/images/image11.png', import.meta.url).href,
    music: new URL('./assets/music/bg-music.mp3', import.meta.url).href,
} as const;

const DEFAULT_FEATURES: NonNullable<WeddingInvitation['features']> = {
    cover: true,
    greeting: true,
    couple_profile: true,
    event_detail: true,
    countdown: true,
    location: true,
    gallery: true,
    video: false,
    love_story: true,
    rsvp: true,
    guestbook: true,
    wishes: true,
    digital_envelope: true,
    gift_wishlist: false,
    add_to_calendar: true,
    music: true,
    confetti: false,
    footer: true,
};

const DEFAULT_EVENTS: InvitationEvent[] = [
    {
        name: 'Akad Nikah',
        date: '2026-08-29',
        dateFormatted: 'Rabu, 29 Agustus 2026',
        time: '08:00',
        timeEnd: '',
        locationName: 'Masjid Raya Baiturrahman',
        location: 'Jl. Utama Raya No. 12, Kebayoran Baru, Jakarta Selatan',
        locationUrl: 'https://maps.google.com/?q=Masjid+Raya+Baiturrahman+Jakarta',
        mapsEmbed: 'https://www.google.com/maps?q=Masjid+Raya+Baiturrahman+Jakarta&output=embed',
        mapsLat: '',
        mapsLng: '',
        isCountdown: true,
    },
    {
        name: 'Resepsi Pernikahan',
        date: '2026-09-01',
        dateFormatted: 'Minggu, 01 September 2026',
        time: '11:00',
        timeEnd: '',
        locationName: 'Gedung Pertemuan Ballroom Harmoni',
        location: 'Kavling Bunga Indah No. 45, Kebayoran Baru, Jakarta Selatan',
        locationUrl: 'https://maps.google.com/?q=Ballroom+Harmoni+Kebayoran+Baru',
        mapsEmbed: 'https://www.google.com/maps?q=Ballroom+Harmoni+Kebayoran+Baru&output=embed',
        mapsLat: '',
        mapsLng: '',
        isCountdown: false,
    },
];

const DEFAULT_GALLERY = [
    { url: ASSETS.story, category: 'moment', label: 'Momen spesial' },
    { url: ASSETS.hero, category: 'moment', label: 'Perjalanan cinta' },
    { url: ASSETS.proposal, category: 'moment', label: 'Lamaran' },
    { url: ASSETS.groom, category: 'moment', label: 'Calon mempelai pria' },
    { url: ASSETS.bride, category: 'moment', label: 'Calon mempelai wanita' },
    { url: ASSETS.cover, category: 'moment', label: 'Cover undangan' },
];

const DEFAULT_LOVE_STORY = [
    {
        date: 'Maret 2023',
        title: 'Awal Pertemuan Pertama',
        desc: 'Kami pertama kali bertemu dalam sebuah seminar pameran desain industri kreatif di Jakarta Barat.',
        photo: ASSETS.story,
    },
    {
        date: 'Desember 2024',
        title: 'Momen Lamaran (Proposal)',
        desc: 'Setelah hampir dua tahun saling mengenal dan memantapkan komitmen bersama, Johan melamar Joana di hadapan keluarga dekat.',
        photo: ASSETS.proposal,
    },
    {
        date: 'September 2026',
        title: 'Pernikahan Suci Kami',
        desc: 'Hari yang kami tunggu-tunggu akhirnya tiba. Bersama restu kedua orang tua dan doa sahabat sekalian, kami mengikat janji suci.',
        photo: ASSETS.hero,
    },
];

const DEFAULT_DRESS_CODES = [
    { name: 'Teal', hex: '#4E7B82' },
    { name: 'Gold', hex: '#C7AC4C' },
    { name: 'Cream', hex: '#E6DCAC' },
    { name: 'White', hex: '#FFFFFF' },
];

const DEFAULT_BANK_ACCOUNTS = [
    { bankName: 'BCA', accountNumber: '1245 879 908', accountName: 'JOHAN PRASETYO' },
    { bankName: 'Mandiri', accountNumber: '133-00-567890-1', accountName: 'JOANA LESTARI' },
];

const DEFAULT_EWALLETS = [
    {
        provider: 'DANA',
        label: 'DANA',
        accountNumber: '0812 3456 7890',
        accountName: 'JOHAN PRASETYO',
        logoUrl: '',
        qrisQrUrl: null,
    },
];

const DEFAULT_WISHES: WishEntry[] = [
    {
        id: 'w1',
        name: 'Ahmad Syarif',
        status: 'hadir',
        message:
            'Selamat Johan & Joana! Semoga dilancarkan semua urusannya sampai hari H dan menjadi keluarga yang penuh cinta.',
        createdAt: '2026-06-20T09:00:00+07:00',
    },
    {
        id: 'w2',
        name: 'Siti Rahma',
        status: 'hadir',
        message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair. Selamat menempuh hidup baru.',
        createdAt: '2026-06-25T14:20:00+07:00',
    },
    {
        id: 'w3',
        name: 'Budi Santoso',
        status: 'tidak_hadir',
        message: 'Maaf belum bisa hadir, semoga acara berjalan lancar dan penuh keberkahan.',
        createdAt: '2026-06-30T18:05:00+07:00',
    },
    {
        id: 'w4',
        name: 'Diana Putri',
        status: 'hadir',
        message: 'Bahagianya melihat kalian berdua bersatu! Selamat ya, semoga kenangan hari bahagia selalu terjaga.',
        createdAt: '2026-07-02T10:25:00+07:00',
    },
    {
        id: 'w5',
        name: 'Rian & Fira',
        status: 'hadir',
        message: 'Happy wedding Johan & Joana! Wishing you a lifetime of love and happiness. Cheers to new beginnings!',
        createdAt: '2026-07-04T19:55:00+07:00',
    },
];

const DEFAULT_GREETING: Greeting = {
    title: 'Kepada Yth. Bapak/Ibu/Saudara/i:',
    guestLabel: 'Tamu Undangan',
    buttonText: 'Buka Undangan',
    message: 'Mohon maaf apabila ada kesalahan penulisan nama/gelar.',
};

const DEFAULT_THEME_DATA: WeddingInvitation = {
    type: 'wedding',
    code: 'johan-joana-09',
    slug: 'wedding_theme_09',
    title: 'Undangan Pernikahan: Johan & Joana',
    guestName: '',
    countdownDate: '2026-09-01T08:00:00+07:00',
    pageTitle: 'Undangan Pernikahan: Johan & Joana',
    mainDateFormatted: 'Minggu, 01 September 2026',
    events: DEFAULT_EVENTS,
    gallery: DEFAULT_GALLERY,
    coupleVideoUrl: '',
    bankAccounts: DEFAULT_BANK_ACCOUNTS,
    digitalWallets: DEFAULT_EWALLETS,
    allowComments: true,
    rsvpEndpoint: '/api/rsvp',
    wishesEndpoint: '/api/wishes',
    features: DEFAULT_FEATURES,
    music: {
        url: ASSETS.music,
        autoplay: false,
        loop: true,
    },
    greeting: DEFAULT_GREETING,
    guestQrData: '',
    guestSlug: '',
    groomFullName: 'Johan Prasetyo, S.T.',
    groomNickname: 'Johan',
    groomInitials: 'J',
    groomChildOrder: 'Putra sulung',
    groomFather: 'Bapak Fulan',
    groomMother: 'Ibu Fulanah',
    groomBio: 'Lahir dan besar di Jakarta. Seorang insinyur perangkat lunak yang berdedikasi, menyukai kopi, dan petualangan di alam bebas.',
    groomPhoto: ASSETS.groom,
    groomInstagram: '',
    brideFullName: 'Joana Lestari, S.Ds.',
    brideNickname: 'Joana',
    brideInitials: 'J',
    brideChildOrder: 'Putri bungsu',
    brideFather: 'Bapak Fulan',
    brideMother: 'Ibu Fulanah',
    brideBio: 'Desainer grafis kreatif yang menyukai seni ilustrasi, tanaman hias, dan bercerita lewat sketsa goresan warna.',
    bridePhoto: ASSETS.bride,
    brideInstagram: '',
    couplePhoto: ASSETS.hero,
    loveStory: DEFAULT_LOVE_STORY,
    dressCodes: DEFAULT_DRESS_CODES,
    rsvpDeadline: '01 September 2026',
    openingQuote:
        'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.',
};

const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'couple', label: 'Mempelai', icon: Heart },
    { id: 'event', label: 'Acara', icon: CalendarDays },
    { id: 'story', label: 'Cerita', icon: BookHeart },
    { id: 'gallery', label: 'Galeri', icon: Images },
    { id: 'rsvp', label: 'RSVP', icon: PenLine },
];

function normalizeText(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
}

function parseDateInput(value: string): Date | null {
    if (!value) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+07:00` : value;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatIndonesianDate(value: string, withWeekday = true): string {
    const date = parseDateInput(value);
    if (!date) return value;

    return new Intl.DateTimeFormat('id-ID', {
        weekday: withWeekday ? 'long' : undefined,
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function formatShortDate(value: string): string {
    const date = parseDateInput(value);
    if (!date) return value;

    const day = new Intl.DateTimeFormat('id-ID', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('id-ID', { month: '2-digit' }).format(date);
    const year = new Intl.DateTimeFormat('id-ID', { year: 'numeric' }).format(date);
    return `${day} . ${month} . ${year}`;
}

function formatClockTime(value: string): string {
    const normalized = normalizeText(value);
    return normalized ? normalized.replace(':', '.') : '';
}

function formatRelativeTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const future = diffSeconds < 0;
    const seconds = Math.abs(diffSeconds);

    if (seconds < 60) return 'Baru saja';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return future ? `Dalam ${minutes} menit` : `${minutes} menit yang lalu`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return future ? `Dalam ${hours} jam` : `${hours} jam yang lalu`;

    const days = Math.floor(hours / 24);
    if (days === 1) return future ? 'Besok' : 'Kemarin';

    return future ? `Dalam ${days} hari` : `${days} hari yang lalu`;
}

function addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function buildCalendarDate(valueDate: string, valueTime: string): string {
    const date = parseDateInput(valueDate) ?? new Date();
    const time = normalizeText(valueTime, '08:00');
    const [hours, minutes] = time.split(':');
    const result = new Date(date);
    result.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
    return `${result.getFullYear()}${String(result.getMonth() + 1).padStart(2, '0')}${String(result.getDate()).padStart(2, '0')}T${String(
        result.getHours(),
    ).padStart(2, '0')}${String(result.getMinutes()).padStart(2, '0')}00`;
}

function buildCalendarDatePlusHours(valueDate: string, valueTime: string, hoursToAdd: number): string {
    const date = parseDateInput(valueDate) ?? new Date();
    const time = normalizeText(valueTime, '08:00');
    const [hours, minutes] = time.split(':');
    const result = new Date(date);
    result.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
    const end = addHours(result, hoursToAdd);
    return `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}T${String(
        end.getHours(),
    ).padStart(2, '0')}${String(end.getMinutes()).padStart(2, '0')}00`;
}

function buildCalendarUrl(event: InvitationEvent): string {
    const start = buildCalendarDate(event.date, event.time);
    const endDate = event.timeEnd ? buildCalendarDate(event.date, event.timeEnd) : buildCalendarDatePlusHours(event.date, event.time, 2);
    const location = [event.locationName, event.location].filter(Boolean).join(', ');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name || 'Acara Pernikahan',
    )}&dates=${start}/${endDate}&location=${encodeURIComponent(location)}`;
}

function buildMapsUrl(event: InvitationEvent): string {
    if (normalizeText(event.locationUrl)) return event.locationUrl;
    if (normalizeText(event.mapsEmbed)) {
        try {
            const parsed = new URL(event.mapsEmbed);
            const query = parsed.searchParams.get('q');
            if (query) return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
        } catch {
            // Ignore malformed embed URLs.
        }
    }
    const fallbackQuery = [event.locationName, event.location].filter(Boolean).join(', ');
    return `https://maps.google.com/?q=${encodeURIComponent(fallbackQuery || 'Lokasi Acara')}`;
}

function sanitizeClipboardValue(value: string): string {
    return value.replace(/[^\d+]/g, '');
}

async function copyToClipboard(value: string): Promise<boolean> {
    const normalized = sanitizeClipboardValue(value);

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(normalized);
            return true;
        }
    } catch {
        // Fall through to execCommand.
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = normalized;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    } catch {
        return false;
    }
}

function createId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalArray<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
}

function writeLocalArray<T>(key: string, value: T[]): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore quota and privacy-mode errors.
    }
}

function getWishLabel(status: AttendanceValue): string {
    if (status === 'hadir') return 'Hadir';
    if (status === 'tidak_hadir') return 'Tidak Hadir';
    return 'Ragu';
}

function getWishStatusClass(status: AttendanceValue): string {
    if (status === 'hadir') return 'hadir';
    if (status === 'tidak_hadir') return 'absen';
    return 'ragu';
}

function resolveInvitation(invitation?: Partial<WeddingInvitation>, visitor?: string, greeting?: Greeting): WeddingInvitation {
    const defaultMusic = DEFAULT_THEME_DATA.music ?? {
        url: ASSETS.music,
        autoplay: false,
        loop: true,
    };

    return {
        ...DEFAULT_THEME_DATA,
        ...invitation,
        type: 'wedding',
        guestName: normalizeText(visitor, normalizeText(invitation?.guestName, DEFAULT_THEME_DATA.guestName)),
        title: normalizeText(invitation?.title, DEFAULT_THEME_DATA.title),
        code: normalizeText(invitation?.code, DEFAULT_THEME_DATA.code),
        slug: normalizeText(invitation?.slug, DEFAULT_THEME_DATA.slug),
        pageTitle: normalizeText(invitation?.pageTitle, DEFAULT_THEME_DATA.pageTitle),
        countdownDate: normalizeText(invitation?.countdownDate, DEFAULT_THEME_DATA.countdownDate),
        mainDateFormatted: normalizeText(invitation?.mainDateFormatted, DEFAULT_THEME_DATA.mainDateFormatted),
        groomFullName: normalizeText(invitation?.groomFullName, DEFAULT_THEME_DATA.groomFullName),
        groomNickname: normalizeText(invitation?.groomNickname, DEFAULT_THEME_DATA.groomNickname),
        groomInitials: normalizeText(invitation?.groomInitials, DEFAULT_THEME_DATA.groomInitials),
        groomChildOrder: normalizeText(invitation?.groomChildOrder, DEFAULT_THEME_DATA.groomChildOrder),
        groomFather: normalizeText(invitation?.groomFather, DEFAULT_THEME_DATA.groomFather),
        groomMother: normalizeText(invitation?.groomMother, DEFAULT_THEME_DATA.groomMother),
        groomBio: normalizeText(invitation?.groomBio, DEFAULT_THEME_DATA.groomBio),
        groomPhoto: normalizeText(invitation?.groomPhoto, DEFAULT_THEME_DATA.groomPhoto),
        brideFullName: normalizeText(invitation?.brideFullName, DEFAULT_THEME_DATA.brideFullName),
        brideNickname: normalizeText(invitation?.brideNickname, DEFAULT_THEME_DATA.brideNickname),
        brideInitials: normalizeText(invitation?.brideInitials, DEFAULT_THEME_DATA.brideInitials),
        brideChildOrder: normalizeText(invitation?.brideChildOrder, DEFAULT_THEME_DATA.brideChildOrder),
        brideFather: normalizeText(invitation?.brideFather, DEFAULT_THEME_DATA.brideFather),
        brideMother: normalizeText(invitation?.brideMother, DEFAULT_THEME_DATA.brideMother),
        brideBio: normalizeText(invitation?.brideBio, DEFAULT_THEME_DATA.brideBio),
        bridePhoto: normalizeText(invitation?.bridePhoto, DEFAULT_THEME_DATA.bridePhoto),
        couplePhoto: normalizeText(invitation?.couplePhoto, DEFAULT_THEME_DATA.couplePhoto),
        openingQuote: normalizeText(invitation?.openingQuote, DEFAULT_THEME_DATA.openingQuote),
        rsvpDeadline: normalizeText(invitation?.rsvpDeadline, DEFAULT_THEME_DATA.rsvpDeadline),
        guestSlug: normalizeText(invitation?.guestSlug, DEFAULT_THEME_DATA.guestSlug),
        guestQrData: normalizeText(invitation?.guestQrData, DEFAULT_THEME_DATA.guestQrData),
        allowComments: invitation?.allowComments ?? DEFAULT_THEME_DATA.allowComments,
        rsvpEndpoint: normalizeText(invitation?.rsvpEndpoint, DEFAULT_THEME_DATA.rsvpEndpoint),
        wishesEndpoint: normalizeText(invitation?.wishesEndpoint, DEFAULT_THEME_DATA.wishesEndpoint),
        events: invitation?.events?.length ? invitation.events : DEFAULT_THEME_DATA.events,
        gallery: invitation?.gallery?.length ? invitation.gallery : DEFAULT_THEME_DATA.gallery,
        loveStory: invitation?.loveStory?.length ? invitation.loveStory : DEFAULT_THEME_DATA.loveStory,
        dressCodes: invitation?.dressCodes?.length ? invitation.dressCodes : DEFAULT_THEME_DATA.dressCodes,
        bankAccounts: invitation?.bankAccounts?.length ? invitation.bankAccounts : DEFAULT_THEME_DATA.bankAccounts,
        digitalWallets: invitation?.digitalWallets?.length ? invitation.digitalWallets : DEFAULT_THEME_DATA.digitalWallets,
        features: { ...DEFAULT_THEME_DATA.features, ...invitation?.features },
        music: {
            url: normalizeText(invitation?.music?.url, defaultMusic.url),
            autoplay: invitation?.music?.autoplay ?? defaultMusic.autoplay,
            loop: invitation?.music?.loop ?? defaultMusic.loop,
        },
        greeting: greeting ?? invitation?.greeting ?? DEFAULT_THEME_DATA.greeting,
    };
}

function SectionHeader({
    subtitle,
    title,
    icon: Icon,
    light = false,
    subtitleColor,
    titleColor,
    dividerColor,
}: {
    subtitle: string;
    title: string;
    icon: LucideIcon;
    light?: boolean;
    subtitleColor?: string;
    titleColor?: string;
    dividerColor?: string;
}) {
    return (
        <div className="section-header reveal">
            <p
                className="subtitle"
                style={
                    subtitleColor
                        ? { color: subtitleColor }
                        : light
                            ? { color: 'var(--accent-gold-warm)' }
                            : undefined
                }
            >
                {subtitle}
            </p>
            <h2
                className="title"
                style={
                    titleColor
                        ? { color: titleColor }
                        : light
                            ? { color: 'white' }
                            : undefined
                }
            >
                {title}
            </h2>
            <div className="divider">
                <span
                    style={
                        dividerColor
                            ? { backgroundColor: dividerColor }
                            : light
                                ? { backgroundColor: 'var(--accent-gold-warm)' }
                                : undefined
                    }
                />
                <Icon style={light ? { color: 'var(--accent-gold-warm)' } : undefined} size={14} />
                <span
                    style={
                        dividerColor
                            ? { backgroundColor: dividerColor }
                            : light
                                ? { backgroundColor: 'var(--accent-gold-warm)' }
                                : undefined
                    }
                />
            </div>
        </div>
    );
}

function EventCard({ event, icon: Icon, onCalendar, onMaps }: EventCardProps) {
    const eventDate = normalizeText(event.dateFormatted, formatIndonesianDate(event.date));
    const timeRange = event.timeEnd
        ? `Pukul ${formatClockTime(event.time)} WIB s/d ${formatClockTime(event.timeEnd)} WIB`
        : `Pukul ${formatClockTime(event.time)} WIB s/d Selesai`;

    return (
        <div className="event-box reveal">
            <div className="event-icon">
                <Icon size={20} />
            </div>
            <h3>{event.name}</h3>
            <ul className="event-details">
                <li>
                    <CalendarDays size={16} />
                    <strong>{eventDate}</strong>
                </li>
                <li>
                    <Clock3 size={16} />
                    <strong>{timeRange}</strong>
                </li>
                <li>
                    <MapPin size={16} />
                    <strong>{event.locationName}</strong>
                    <span>{event.location}</span>
                </li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                <button type="button" className="btn-nav" onClick={() => onCalendar(event)}>
                    <CalendarDays size={14} /> Tambah Kalender
                </button>
                <button type="button" className="btn-nav" onClick={() => onMaps(event)}>
                    <MapPin size={14} /> Google Maps
                </button>
            </div>
        </div>
    );
}

function WalletCard({ badge, variantClass, accountNumber, accountName, copyLabel, copied, onCopy }: WalletCardProps) {
    return (
        <div className="wallet-card reveal">
            <div className={variantClass ? `bank-logo ${variantClass}` : 'bank-logo'}>{badge}</div>
            <div className="wallet-number">{accountNumber}</div>
            <div className="wallet-owner">a.n. {accountName}</div>
            <button type="button" className="btn-copy" onClick={onCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Disalin' : copyLabel}
            </button>
        </div>
    );
}

function WishCard({ wish }: { wish: WishEntry }) {
    return (
        <div className="wish-item">
            <div className="wish-item-header">
                <span className="wish-name">{wish.name}</span>
                <span className={`wish-status ${getWishStatusClass(wish.status)}`}>{getWishLabel(wish.status)}</span>
            </div>
            <p className="wish-msg">{wish.message}</p>
            <span className="wish-time">
                <Clock3 size={12} /> {formatRelativeTime(wish.createdAt)}
            </span>
        </div>
    );
}

export default function WeddingTheme09({ invitation, visitor, greeting }: Theme09Props) {
    const data = resolveInvitation(invitation, visitor, greeting);
    const features = data.features ?? DEFAULT_FEATURES;
    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const coupleEnabled = features.couple_profile !== false;
    const eventEnabled = features.event_detail !== false;
    const locationEnabled = features.location !== false;
    const galleryEnabled = features.gallery !== false;
    const storyEnabled = features.love_story !== false;
    const rsvpEnabled = features.rsvp !== false;
    const giftEnabled = features.digital_envelope !== false;
    const wishesEnabled = features.wishes !== false && data.allowComments !== false;
    const countdownEnabled = features.countdown !== false;
    const musicEnabled = features.music !== false;

    const [queryGuestName, setQueryGuestName] = useState('');
    const guestName = normalizeText(data.guestName, normalizeText(queryGuestName, DEFAULT_THEME_DATA.guestName));
    const guestDisplayName = guestName || data.greeting?.guestLabel || 'Tamu Undangan';

    const [opened, setOpened] = useState(!coverEnabled);
    const [activeSection, setActiveSection] = useState<NavSectionId>('home');
    const [toast, setToast] = useState<ToastState | null>(null);
    const [musicPlaying, setMusicPlaying] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [copiedWalletKey, setCopiedWalletKey] = useState<string | null>(null);
    const [rsvpForm, setRsvpForm] = useState<RSVPState>(() => ({
        name: guestName && guestName !== 'Tamu Undangan' ? guestName : '',
        phone: '',
        guests: '1',
        status: 'hadir',
        message: '',
    }));
    const [rsvpErrors, setRsvpErrors] = useState<Partial<Record<keyof RSVPState, string>>>({});
    const [wishForm, setWishForm] = useState<WishState>(() => ({
        name: '',
        status: 'hadir',
        message: '',
    }));
    const [wishErrors, setWishErrors] = useState<Partial<Record<keyof WishState, string>>>({});
    const [wishEntries, setWishEntries] = useState<WishEntry[]>(() => {
        const saved = readLocalArray<WishEntry>(STORAGE_KEYS.wishes);
        if (saved.length > 0) {
            return [...saved].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        writeLocalArray(STORAGE_KEYS.wishes, DEFAULT_WISHES);
        return [...DEFAULT_WISHES];
    });
    const [wishPage, setWishPage] = useState(1);

    const mainRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wishesListRef = useRef<HTMLDivElement | null>(null);

    const heroPhoto = normalizeText(data.couplePhoto, normalizeText(data.groomPhoto, normalizeText(data.bridePhoto, ASSETS.hero)));
    const coverPhoto = ASSETS.cover;
    const firstEvent = data.events[0];
    const addressEvent = data.events[1] ?? data.events[0];
    const countdownTarget = normalizeText(data.countdownDate, firstEvent ? `${firstEvent.date}T${normalizeText(firstEvent.time, '08:00')}:00+07:00` : DEFAULT_THEME_DATA.countdownDate);
    const mainDateShort = firstEvent ? formatShortDate(firstEvent.date) : '01 . 09 . 2026';
    const hashtag = `#${normalizeText(data.groomNickname, 'Johan').replace(/\s+/g, '')}${normalizeText(data.brideNickname, 'Joana').replace(/\s+/g, '')}Wedding`;
    const gallery = data.gallery?.length ? data.gallery : DEFAULT_GALLERY;
    const visibleWishes = wishEntries.slice((wishPage - 1) * WISHES_PAGE_SIZE, wishPage * WISHES_PAGE_SIZE);
    const totalWishPages = Math.max(1, Math.ceil(wishEntries.length / WISHES_PAGE_SIZE));
    const musicSrc = normalizeText(data.music?.url, ASSETS.music);
    const musicVisible = (opened || !coverEnabled) && musicEnabled && Boolean(musicSrc);
    const copiedNumber = copiedWalletKey ?? '';

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        setQueryGuestName(params.get('to')?.trim() ?? '');
    }, []);

    useEffect(() => {
        if (!guestName || guestName === 'Tamu Undangan') return;
        setRsvpForm((prev) => (prev.name ? prev : { ...prev, name: guestName }));
    }, [guestName]);

    useEffect(() => {
        if (!musicSrc) return;
        const audio = new Audio(musicSrc);
        audio.loop = data.music?.loop ?? true;
        audio.volume = 0.5;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, [musicSrc, data.music?.loop]);

    useEffect(() => {
        if (!opened || !musicVisible || !audioRef.current || !data.music?.autoplay) return;
        void playMusic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, musicVisible, data.music?.autoplay]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLightboxIndex(null);
            }
            if (event.key === 'ArrowLeft') {
                setLightboxIndex((prev) => {
                    if (prev === null) return prev;
                    return (prev - 1 + gallery.length) % gallery.length;
                });
            }
            if (event.key === 'ArrowRight') {
                setLightboxIndex((prev) => {
                    if (prev === null) return prev;
                    return (prev + 1) % gallery.length;
                });
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [lightboxIndex, gallery.length]);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [lightboxIndex]);

    useEffect(() => {
        if (!opened) return;

        const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [opened]);

    useEffect(() => {
        const sectionIds: NavSectionId[] = ['home', 'couple', 'event', 'story', 'gallery', 'rsvp'];

        const updateActive = () => {
            const scrollY = window.scrollY + 220;
            let current: NavSectionId = 'home';

            sectionIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element && scrollY >= element.offsetTop) {
                    current = id;
                }
            });

            setActiveSection(current);
        };

        updateActive();
        window.addEventListener('scroll', updateActive, { passive: true });
        return () => window.removeEventListener('scroll', updateActive);
    }, [opened, coverEnabled, galleryEnabled, rsvpEnabled, storyEnabled, coupleEnabled, eventEnabled]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!wishPage) return;
        if (wishPage > totalWishPages) setWishPage(totalWishPages);
    }, [totalWishPages, wishPage]);

    function showToast(message: string, tone: ToastTone = 'success') {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, tone });
        toastTimerRef.current = setTimeout(() => setToast(null), 2500);
    }

    function openInvitation() {
        setOpened(true);
        if (musicEnabled && musicSrc) {
            void playMusic();
        }
    }

    async function playMusic() {
        const audio = audioRef.current;
        if (!audio) return;
        try {
            await audio.play();
            setMusicPlaying(true);
        } catch {
            setMusicPlaying(false);
        }
    }

    function pauseMusic() {
        const audio = audioRef.current;
        audio?.pause();
        setMusicPlaying(false);
    }

    function toggleMusic() {
        if (musicPlaying) {
            pauseMusic();
        } else {
            void playMusic();
        }
    }

    function handleCopyAccount(key: string, value: string, label: string) {
        void copyToClipboard(value).then((ok) => {
            if (!ok) {
                showToast(`Gagal menyalin ${label}.`, 'error');
                return;
            }

            setCopiedWalletKey(key);
            showToast(`${label} berhasil disalin!`, 'success');

            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(() => setCopiedWalletKey(null), 2500);
        });
    }

    function openCalendar(event: InvitationEvent) {
        window.open(buildCalendarUrl(event), '_blank', 'noopener,noreferrer');
    }

    function openMaps(event: InvitationEvent) {
        window.open(buildMapsUrl(event), '_blank', 'noopener,noreferrer');
    }

    function openLightbox(index: number) {
        setLightboxIndex(index);
    }

    function closeLightbox() {
        setLightboxIndex(null);
    }

    function validateRsvpForm(values: RSVPState): Partial<Record<keyof RSVPState, string>> {
        const errors: Partial<Record<keyof RSVPState, string>> = {};
        if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!values.phone.trim()) errors.phone = 'Nomor WhatsApp wajib diisi.';
        if (values.phone.trim() && values.phone.replace(/\D/g, '').length < 8) {
            errors.phone = 'Nomor WhatsApp terlihat belum valid.';
        }
        if (!values.status) errors.status = 'Pilih status kehadiran.';
        return errors;
    }

    function validateWishForm(values: WishState): Partial<Record<keyof WishState, string>> {
        const errors: Partial<Record<keyof WishState, string>> = {};
        if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!values.message.trim()) errors.message = 'Ucapan / doa wajib diisi.';
        return errors;
    }

    async function submitRsvp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const errors = validateRsvpForm(rsvpForm);
        setRsvpErrors(errors);
        if (Object.keys(errors).length > 0) {
            showToast('Mohon lengkapi data RSVP terlebih dahulu.', 'error');
            return;
        }

        const payload = {
            name: rsvpForm.name.trim(),
            phone: rsvpForm.phone.trim(),
            guests: Number.parseInt(rsvpForm.guests, 10) || 1,
            status: rsvpForm.status,
            message: rsvpForm.message.trim(),
            createdAt: new Date().toISOString(),
            guestSlug: data.guestSlug,
        };

        const stored = readLocalArray<typeof payload>(STORAGE_KEYS.rsvp);
        stored.unshift(payload);
        writeLocalArray(STORAGE_KEYS.rsvp, stored);

        if (data.rsvpEndpoint) {
            void fetch(data.rsvpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            }).catch(() => undefined);
        }

        setRsvpForm({
            name: guestName && guestName !== 'Tamu Undangan' ? guestName : '',
            phone: '',
            guests: '1',
            status: 'hadir',
            message: '',
        });
        setRsvpErrors({});
        showToast('Terima kasih, konfirmasi kehadiran Anda berhasil dikirim!', 'success');
    }

    async function submitWish(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const errors = validateWishForm(wishForm);
        setWishErrors(errors);
        if (Object.keys(errors).length > 0) {
            showToast('Mohon lengkapi nama dan ucapan Anda.', 'error');
            return;
        }

        const payload: WishEntry = {
            id: createId('wish'),
            name: wishForm.name.trim(),
            status: wishForm.status,
            message: wishForm.message.trim(),
            createdAt: new Date().toISOString(),
        };

        const stored = [payload, ...wishEntries];
        setWishEntries(stored);
        writeLocalArray(STORAGE_KEYS.wishes, stored);
        setWishPage(1);
        setWishForm({ name: '', status: 'hadir', message: '' });
        setWishErrors({});

        if (data.wishesEndpoint) {
            void fetch(data.wishesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            }).catch(() => undefined);
        }

        showToast('Ucapan doa restu Anda berhasil dikirim!', 'success');
        setTimeout(() => wishesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 0);
    }

    function renderNavItem(item: NavItem) {
        const Icon = item.icon;
        return (
            <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item${activeSection === item.id ? ' active' : ''}`}
                aria-label={item.label}
                onClick={() => setActiveSection(item.id)}
            >
                <Icon size={18} />
                <span>{item.label}</span>
            </a>
        );
    }

    const canShowBottomNav = NAV_ITEMS.length > 0;
    const lightboxItem = lightboxIndex !== null ? gallery[lightboxIndex] : null;
    const currentWishPages = Math.max(1, Math.ceil(wishEntries.length / WISHES_PAGE_SIZE));
    const pageButtons = Array.from({ length: currentWishPages }, (_, index) => index + 1);

    return (
        <div className="wt9-root">
            <audio ref={audioRef} preload="auto" loop />

            {coverEnabled && (
                <div className={`welcome-overlay${opened ? ' fade-out' : ''}`}>
                    <div className="welcome-card">
                        <div className="flower-corner-tr" />
                        <div className="flower-corner-bl" />

                        <p className="intro-text">The Wedding Of</p>
                        <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', border: '2px solid var(--accent-gold)' }}>
                            <img src={coverPhoto} alt={`${data.groomNickname} & ${data.brideNickname} Cover`} style={{ width: '100%', height: 'auto' }} />
                        </div>

                        <p className="guest-title">{data.greeting?.title ?? DEFAULT_GREETING.title}</p>
                        <div className="guest-name">{guestDisplayName}</div>

                        {greetingEnabled && (data.greeting?.message || DEFAULT_GREETING.message) && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                                {data.greeting?.message ?? DEFAULT_GREETING.message}
                            </p>
                        )}

                        <button className="btn-open" onClick={openInvitation} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={16} /> {data.greeting?.buttonText ?? DEFAULT_GREETING.buttonText}
                        </button>
                    </div>
                </div>
            )}

            {musicVisible && (
                <button
                    id="music-control"
                    className={`music-control-btn${opened || !coverEnabled ? '' : ' hide'}${musicPlaying ? ' playing' : ''}`}
                    aria-label={musicPlaying ? 'Hentikan musik latar' : 'Putar musik latar'}
                    onClick={toggleMusic}
                >
                    {musicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            )}

            <div
                id="toast"
                className={`toast-msg${toast ? ' show' : ''}`}
                style={
                    toast
                        ? {
                              background:
                                  toast.tone === 'success'
                                      ? 'rgba(17, 94, 89, 0.94)'
                                      : toast.tone === 'error'
                                        ? 'rgba(153, 27, 27, 0.94)'
                                        : 'rgba(45, 55, 72, 0.94)',
                          }
                        : undefined
                }
            >
                {toast?.message ?? ''}
            </div>

            <div className="app-container" ref={mainRef}>
                <div
                    className="left-panel"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.42), rgba(0,0,0,0.62)), url(${heroPhoto})`,
                    }}
                >
                    <div className="brand-wedding">The Wedding Of</div>

                    <div className="main-heading">
                        <h1>
                            {normalizeText(data.groomNickname, 'Johan')} &amp; {normalizeText(data.brideNickname, 'Joana')}
                        </h1>
                        <p>{mainDateShort}</p>

                        {countdownEnabled && (
                            <Countdown
                                targetDate={countdownTarget}
                                className="countdown-container"
                                boxClassName="countdown-box"
                                numClassName="countdown-num"
                                labelClassName="countdown-label"
                            />
                        )}
                    </div>

                    <div className="left-footer">
                        <p style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: 1, color: 'var(--accent-gold-warm)' }}>{hashtag}</p>
                    </div>
                </div>

                <div className="right-panel">
                    {canShowBottomNav && (
                        <nav className="navigation-bar" aria-label="Menu Undangan">
                            {NAV_ITEMS.map(renderNavItem)}
                        </nav>
                    )}

                    <section id="home" className="hero-section">
                        <div className="ornament-corner-tr" />
                        <div className="ornament-corner-bl" />
                        <div className="ornament-side-l" />
                        <div className="ornament-side-r" />

                        <div className="hero-content reveal">
                            <img src={ASSETS.bismillah} alt="Bismillah" className="bismillah-img" />
                            <div className="wedding-logo">The Wedding Of</div>
                            <div className="wedding-names">
                                {normalizeText(data.groomNickname, 'Johan')} &amp; {normalizeText(data.brideNickname, 'Joana')}
                            </div>
                            <div className="wedding-frame">
                                <img src={heroPhoto} alt={`${data.groomNickname} & ${data.brideNickname}`} />
                            </div>
                            <div className="wedding-date">{data.mainDateFormatted}</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: 1 }}>KOTA JAKARTA, INDONESIA</p>

                            {countdownEnabled && (
                                <div className="mobile-countdown">
                                    <Countdown
                                        targetDate={countdownTarget}
                                        className="countdown-container"
                                        boxClassName="countdown-box"
                                        numClassName="countdown-num"
                                        labelClassName="countdown-label"
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    <section id="quote" className="quote-section">
                        <div className="ornament-corner-tr" />
                        <div className="ornament-corner-bl" />

                        <div className="reveal">
                            <div className="quote-text">
                                "{data.openingQuote}"
                                <div className="quote-author">(QS. Ar-Ruum: 21)</div>
                            </div>

                            <div className="greeting-card">
                                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary-teal-dark)', marginBottom: '15px' }}>
                                    Assalamualaikum Warahmatullahi Wabarakatuh
                                </p>
                                <p>
                                    Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan resepsi pernikahan putra-putri kami
                                    yang tercinta:
                                </p>
                            </div>
                        </div>
                    </section>

                    {coupleEnabled && (
                        <section id="couple" className="couple-section">
                            <div className="ornament-side-l" />
                            <div className="ornament-side-r" />

                            <SectionHeader subtitle="Mempelai Pasangan" title="Profil Kami" icon={Heart} />

                            <div className="couples-grid">
                                <div className="couple-profile reveal">
                                    <div className="couple-photo-container">
                                        <div className="couple-photo-frame">
                                            <img src={normalizeText(data.groomPhoto, ASSETS.groom)} alt={`Mempelai Pria: ${data.groomNickname}`} />
                                        </div>
                                    </div>
                                    <h3>{data.groomNickname} bin {data.groomNickname}</h3>
                                    <p className="fullname">{data.groomFullName}</p>
                                    <p className="parents">
                                        {data.groomChildOrder} dari:
                                        <br />
                                        Bapak <strong>{data.groomFather}</strong> &amp; Ibu <strong>{data.groomMother}</strong>
                                    </p>
                                    <p className="bio">{data.groomBio}</p>
                                </div>

                                <div className="couple-divider reveal">&amp;</div>

                                <div className="couple-profile reveal">
                                    <div className="couple-photo-container">
                                        <div className="couple-photo-frame">
                                            <img src={normalizeText(data.bridePhoto, ASSETS.bride)} alt={`Mempelai Wanita: ${data.brideNickname}`} />
                                        </div>
                                    </div>
                                    <h3>{data.brideNickname} binti {data.brideNickname}</h3>
                                    <p className="fullname">{data.brideFullName}</p>
                                    <p className="parents">
                                        {data.brideChildOrder} dari:
                                        <br />
                                        Bapak <strong>{data.brideFather}</strong> &amp; Ibu <strong>{data.brideMother}</strong>
                                    </p>
                                    <p className="bio">{data.brideBio}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {eventEnabled && (
                        <section id="event" className="event-section bg-dark">
                            <div className="ornament-corner-tr" style={{ opacity: 0.25 }} />
                            <div className="ornament-corner-bl" style={{ opacity: 0.25 }} />

                            <SectionHeader
                                subtitle="Waktu &amp; Tempat"
                                title="Agenda Acara"
                                icon={CalendarDays}
                                light
                                dividerColor="var(--accent-gold-warm)"
                                subtitleColor="var(--accent-gold-warm)"
                                titleColor="white"
                            />

                            <div className="events-list">
                                {data.events.slice(0, 2).map((event, index) => (
                                    <EventCard
                                        key={`${event.name}-${event.date}-${index}`}
                                        event={event}
                                        icon={index === 0 ? Heart : Sparkles}
                                        onCalendar={openCalendar}
                                        onMaps={openMaps}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {locationEnabled && addressEvent && (
                        <section id="address" className="address-section">
                            <div className="ornament-side-l" />
                            <div className="ornament-side-r" />

                            <SectionHeader subtitle="Peta Lokasi" title="Alamat &amp; Navigasi" icon={MapPin} />

                            <div className="address-card reveal">
                                <div className="address-info">
                                    <MapPin size={32} />
                                    <h4>{addressEvent.locationName}</h4>
                                    <p>{addressEvent.location}</p>
                                    <a
                                        href={buildMapsUrl(addressEvent)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-nav"
                                    >
                                        <MapPin size={14} /> Petunjuk Arah Google Maps
                                    </a>
                                </div>

                                <div className="map-wrapper">
                                    <iframe
                                        src={normalizeText(addressEvent.mapsEmbed, 'https://www.google.com/maps?q=Jakarta&output=embed')}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`Peta Lokasi Pernikahan ${data.groomNickname} & ${data.brideNickname}`}
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {storyEnabled && (
                        <section id="story" className="story-section bg-mauve">
                            <div className="ornament-corner-tr" style={{ opacity: 0.25 }} />
                            <div className="ornament-corner-bl" style={{ opacity: 0.25 }} />

                            <SectionHeader
                                subtitle="Perjalanan Kami"
                                title="Love Story"
                                icon={BookHeart}
                                light
                                subtitleColor="var(--accent-gold-warm)"
                                titleColor="white"
                                dividerColor="var(--accent-gold-warm)"
                            />

                            <div className="timeline">
                                {data.loveStory.map((item, index) => (
                                    <div className="timeline-item reveal" key={`${item.title}-${index}`}>
                                        <div className="timeline-badge" />
                                        <div className="timeline-content">
                                            <div className="timeline-date">{item.date}</div>
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                            {item.photo && (
                                                <div className="timeline-img">
                                                    <img src={item.photo} alt={item.title} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {galleryEnabled && (
                        <section id="gallery" className="gallery-section">
                            <div className="ornament-corner-tr" />
                            <div className="ornament-corner-bl" />

                            <SectionHeader subtitle="Galeri Momen" title="Album Foto" icon={Images} />

                            <div className="gallery-grid reveal">
                                {gallery.map((item, index) => (
                                    <div key={`${item.url}-${index}`} className="gallery-item" onClick={() => openLightbox(index)}>
                                        <img src={item.url} alt={item.label ?? `Galeri Foto ${index + 1}`} />
                                        <div className="gallery-overlay">
                                            <Search size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {lightboxIndex !== null && lightboxItem && (
                                <div
                                    id="lightbox"
                                    className="lightbox active"
                                    onClick={(event) => {
                                        if (event.target === event.currentTarget) closeLightbox();
                                    }}
                                >
                                    <div className="lightbox-content">
                                        <button className="lightbox-close" aria-label="Tutup Galeri" onClick={closeLightbox} type="button">
                                            <X size={24} />
                                        </button>
                                        <button
                                            className="lightbox-nav lightbox-prev"
                                            aria-label="Sebelumnya"
                                            onClick={() =>
                                                setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + gallery.length) % gallery.length))
                                            }
                                            type="button"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <img src={lightboxItem.url} alt={lightboxItem.label ?? 'Perbesar Gambar'} />
                                        <button
                                            className="lightbox-nav lightbox-next"
                                            aria-label="Berikutnya"
                                            onClick={() => setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % gallery.length))}
                                            type="button"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    <section id="dresscode" className="dresscode-section bg-mauve">
                        <div className="ornament-corner-tr" style={{ opacity: 0.25 }} />
                        <div className="ornament-corner-bl" style={{ opacity: 0.25 }} />

                        <SectionHeader
                            subtitle="Panduan Tamu"
                            title="Dress Code"
                            icon={Sparkles}
                            light
                            subtitleColor="var(--accent-gold-warm)"
                            titleColor="white"
                            dividerColor="var(--accent-gold-warm)"
                        />

                        <div className="dresscode-card reveal">
                            <div className="dresscode-icons">
                                <div className="dress-item">
                                    <MapPin size={24} />
                                    <span>Pria: Batik / Jas Formal</span>
                                </div>
                                <div className="dress-item">
                                    <Sparkles size={24} />
                                    <span>Wanita: Gaun / Kebaya</span>
                                </div>
                            </div>

                            <p className="dresscode-desc">
                                Tanpa mengurangi rasa hormat, tamu undangan disarankan mengenakan pakaian formal, sopan, dan rapi demi
                                menyelaraskan keserasian acara pernikahan kami.
                            </p>

                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-teal-dark)' }}>Rekomendasi Tema Palet Warna:</p>

                            <div className="dresscode-colors">
                                {data.dressCodes.map((color) => (
                                    <div
                                        key={color.name}
                                        className="color-dot"
                                        style={{ backgroundColor: color.hex, color: color.name.toLowerCase() === 'white' ? '#333' : undefined }}
                                        data-label={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {giftEnabled && (data.bankAccounts.length > 0 || data.digitalWallets.length > 0) && (
                        <section id="gift" className="gift-section">
                            <div className="ornament-side-l" />
                            <div className="ornament-side-r" />

                            <SectionHeader subtitle="Kirim Kado" title="Amplop Digital" icon={Gift} />

                            <p className="gift-intro reveal">
                                Bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih atau ucapan restu secara cashless, dapat mengirimkan
                                kado digital melalui rekening/e-wallet berikut:
                            </p>

                            <div className="wallets-container">
                                {data.bankAccounts.map((account, index) => (
                                    <WalletCard
                                        key={`${account.bankName}-${account.accountNumber}-${index}`}
                                        badge={account.bankName}
                                        variantClass={account.bankName.toLowerCase().includes('mandiri') ? 'mandiri' : ''}
                                        accountNumber={account.accountNumber}
                                        accountName={account.accountName}
                                        copyLabel="Salin No. Rekening"
                                        copied={copiedNumber === sanitizeClipboardValue(account.accountNumber)}
                                        onCopy={() =>
                                            handleCopyAccount(
                                                sanitizeClipboardValue(account.accountNumber),
                                                account.accountNumber,
                                                'Nomor rekening',
                                            )
                                        }
                                    />
                                ))}

                                {data.digitalWallets.map((wallet, index) => (
                                    <WalletCard
                                        key={`${wallet.provider}-${wallet.accountNumber}-${index}`}
                                        badge={wallet.label || wallet.provider}
                                        variantClass={wallet.provider.toLowerCase().includes('dana') ? 'gopay' : ''}
                                        accountNumber={wallet.accountNumber}
                                        accountName={wallet.accountName}
                                        copyLabel="Salin Nomor E-Wallet"
                                        copied={copiedNumber === sanitizeClipboardValue(wallet.accountNumber)}
                                        onCopy={() =>
                                            handleCopyAccount(
                                                sanitizeClipboardValue(wallet.accountNumber),
                                                wallet.accountNumber,
                                                'Nomor e-wallet',
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {rsvpEnabled && (
                        <section id="rsvp" className="rsvp-section bg-dark">
                            <div className="ornament-corner-tr" style={{ opacity: 0.25 }} />
                            <div className="ornament-corner-bl" style={{ opacity: 0.25 }} />

                            <SectionHeader
                                subtitle="Konfirmasi Kehadiran"
                                title="RSVP"
                                icon={PenLine}
                                light
                                subtitleColor="var(--accent-gold-warm)"
                                titleColor="white"
                                dividerColor="var(--accent-gold-warm)"
                            />

                            <div className="rsvp-card reveal">
                                <form id="rsvp-form" className="rsvp-form" onSubmit={submitRsvp}>
                                    <div className="form-group">
                                        <label htmlFor="rsvp-name">Nama Tamu *</label>
                                        <input
                                            id="rsvp-name"
                                            type="text"
                                            placeholder="Contoh: Bapak Budi Santoso"
                                            value={rsvpForm.name}
                                            onChange={(e) => setRsvpForm((prev) => ({ ...prev, name: e.target.value }))}
                                        />
                                        {rsvpErrors.name && <p className="inline-error">{rsvpErrors.name}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="rsvp-phone">Nomor WhatsApp *</label>
                                        <input
                                            id="rsvp-phone"
                                            type="tel"
                                            placeholder="Contoh: 08123456789"
                                            value={rsvpForm.phone}
                                            onChange={(e) => setRsvpForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        />
                                        {rsvpErrors.phone && <p className="inline-error">{rsvpErrors.phone}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="rsvp-guests">Jumlah Tamu Kehadiran</label>
                                        <select
                                            id="rsvp-guests"
                                            value={rsvpForm.guests}
                                            onChange={(e) => setRsvpForm((prev) => ({ ...prev, guests: e.target.value }))}
                                        >
                                            {['1', '2', '3', '4'].map((item) => (
                                                <option key={item} value={item}>
                                                    {item} Orang
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Status Kehadiran *</label>
                                        <div className="form-radio-group">
                                            <label className="form-radio-option">
                                                <input
                                                    type="radio"
                                                    name="rsvp-status"
                                                    value="hadir"
                                                    checked={rsvpForm.status === 'hadir'}
                                                    onChange={() => setRsvpForm((prev) => ({ ...prev, status: 'hadir' }))}
                                                />
                                                <span>Hadir</span>
                                            </label>
                                            <label className="form-radio-option">
                                                <input
                                                    type="radio"
                                                    name="rsvp-status"
                                                    value="tidak_hadir"
                                                    checked={rsvpForm.status === 'tidak_hadir'}
                                                    onChange={() => setRsvpForm((prev) => ({ ...prev, status: 'tidak_hadir' }))}
                                                />
                                                <span>Absen (Berhalangan)</span>
                                            </label>
                                        </div>
                                        {rsvpErrors.status && <p className="inline-error">{rsvpErrors.status}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="rsvp-message">Pesan / Ucapan Tambahan</label>
                                        <textarea
                                            id="rsvp-message"
                                            rows={3}
                                            placeholder="Tuliskan ucapan selamat atau catatan di sini..."
                                            value={rsvpForm.message}
                                            onChange={(e) => setRsvpForm((prev) => ({ ...prev, message: e.target.value }))}
                                        />
                                    </div>

                                    <button type="submit" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <Send size={16} /> Kirim Konfirmasi Kehadiran
                                    </button>
                                </form>
                            </div>
                        </section>
                    )}

                    {wishesEnabled && (
                        <section id="wishes" className="wishes-section">
                            <div className="ornament-side-l" />
                            <div className="ornament-side-r" />

                            <SectionHeader subtitle="Buku Tamu" title="Ucapan &amp; Doa Restu" icon={MessageCircleHeart} />

                            <div className="wishes-card reveal">
                                <form id="wish-form" className="rsvp-form" onSubmit={submitWish}>
                                    <div className="form-group">
                                        <label htmlFor="wish-name">Nama Pengirim</label>
                                        <input
                                            id="wish-name"
                                            type="text"
                                            placeholder="Tuliskan nama Anda..."
                                            value={wishForm.name}
                                            onChange={(e) => setWishForm((prev) => ({ ...prev, name: e.target.value }))}
                                        />
                                        {wishErrors.name && <p className="inline-error">{wishErrors.name}</p>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="wish-status">Rencana Kehadiran</label>
                                        <select
                                            id="wish-status"
                                            value={wishForm.status}
                                            onChange={(e) =>
                                                setWishForm((prev) => ({
                                                    ...prev,
                                                    status: e.target.value as AttendanceValue,
                                                }))
                                            }
                                        >
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Berhalangan</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="wish-message">Ucapan / Doa Restu</label>
                                        <textarea
                                            id="wish-message"
                                            rows={3}
                                            placeholder="Tulis ucapan doa restu Anda untuk kedua mempelai..."
                                            value={wishForm.message}
                                            onChange={(e) => setWishForm((prev) => ({ ...prev, message: e.target.value }))}
                                        />
                                        {wishErrors.message && <p className="inline-error">{wishErrors.message}</p>}
                                    </div>

                                    <button type="submit" className="btn-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <MessageCircleHeart size={16} /> Kirim Ucapan Doa Restu
                                    </button>
                                </form>

                                <div className="wishes-list" id="wishes-list" ref={wishesListRef}>
                                    {visibleWishes.map((wish) => (
                                        <WishCard key={wish.id} wish={wish} />
                                    ))}
                                    {visibleWishes.length === 0 && (
                                        <p className="wish-empty">Belum ada ucapan. Jadilah yang pertama!</p>
                                    )}
                                </div>

                                <div className="wish-pagination" id="wish-pagination">
                                    {pageButtons.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            className={`page-btn${page === wishPage ? ' active' : ''}`}
                                            onClick={() => {
                                                setWishPage(page);
                                                wishesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <section id="closing" className="closing-section bg-dark">
                        <div className="ornament-corner-tr" style={{ opacity: 0.25 }} />
                        <div className="ornament-corner-bl" style={{ opacity: 0.25 }} />

                        <div className="closing-content reveal">
                            <p className="closing-msg">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa
                                restu kepada kedua mempelai.
                            </p>
                            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--accent-gold-warm)', marginBottom: '30px' }}>
                                Wassalamualaikum Warahmatullahi Wabarakatuh
                            </p>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.6)' }}>
                                Kami yang berbahagia
                            </p>
                            <div className="closing-names">
                                {normalizeText(data.groomNickname, 'Johan')} &amp; {normalizeText(data.brideNickname, 'Joana')}
                            </div>
                            <div className="closing-date">{data.mainDateFormatted}</div>
                        </div>
                    </section>

                    <footer>
                        <p>&copy; 2026 {normalizeText(data.groomNickname, 'Johan')} &amp; {normalizeText(data.brideNickname, 'Joana')}. All Rights Reserved.</p>
                        <p>
                            Didesain dengan <Heart size={12} style={{ display: 'inline-block', color: '#e53e3e', verticalAlign: 'middle' }} /> untuk
                            Replikasi PPT Template.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
