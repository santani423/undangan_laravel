import Toast, { useToast } from '@/components/invitation/Toast';
import type { BankAccount, DressCode, DigitalWallet, GalleryItem, Greeting, InvitationEvent, LoveStoryItem, WeddingInvitation } from '@/types/invitation';
import {
    BookHeart,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Gift,
    Home,
    Images,
    MailOpen,
    MapPin,
    MessageCircleHeart,
    Send,
    Sparkles,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import './wedding-theme-10.css';

type AttendanceValue = 'hadir' | 'tidak_hadir' | 'ragu';
type GiftTab = 'bank' | 'ewallet';
type NavSectionId =
    | 'home'
    | 'couple'
    | 'event'
    | 'venue'
    | 'lovestory'
    | 'gallery'
    | 'dresscode'
    | 'gift'
    | 'rsvp'
    | 'wishes';

interface Theme10Props {
    invitation?: Partial<WeddingInvitation>;
    visitor?: string;
    greeting?: Greeting;
}

interface Theme10Features {
    cover?: boolean;
    greeting?: boolean;
    couple_profile?: boolean;
    event_detail?: boolean;
    countdown?: boolean;
    location?: boolean;
    gallery?: boolean;
    love_story?: boolean;
    rsvp?: boolean;
    wishes?: boolean;
    digital_envelope?: boolean;
    music?: boolean;
    footer?: boolean;
    [key: string]: boolean | undefined;
}

interface Theme10Event extends InvitationEvent {
    timezone?: string;
}

interface Theme10Wish {
    id: string;
    name: string;
    message: string;
    attendance: AttendanceValue;
    createdAt: string;
}

interface Theme10ResolvedData {
    siteTitle: string;
    guestName: string;
    coverLabel: string;
    coverButtonText: string;
    openingText: string;
    heroPhoto: string;
    heroDateLabel: string;
    heroCityLabel: string;
    countdownTarget: string;
    groom: {
        nickname: string;
        fullName: string;
        fatherName: string;
        motherName: string;
        order: string;
        description: string;
        photo: string;
        instagram: string;
    };
    bride: {
        nickname: string;
        fullName: string;
        fatherName: string;
        motherName: string;
        order: string;
        description: string;
        photo: string;
        instagram: string;
    };
    quote: {
        text: string;
        source: string;
    };
    events: Theme10Event[];
    venue: {
        name: string;
        fullAddress: string;
        notes: string;
        mapsEmbedSrc: string;
        mapsDirectionUrl: string;
    };
    loveStory: LoveStoryItem[];
    gallery: GalleryItem[];
    dressCodes: DressCode[];
    dressCodeDescription: string;
    dressCodeNote: string;
    bankAccounts: BankAccount[];
    digitalWallets: DigitalWallet[];
    closing: {
        thankYouText: string;
        signatureNames: string;
        hashtag: string;
    };
    features: Theme10Features;
    music: {
        url: string;
        autoplay: boolean;
        loop: boolean;
    };
    rsvpGuestCountOptions: number[];
    attendanceOptions: Array<{ value: AttendanceValue; label: string }>;
}

interface Theme10CountdownState {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

interface Theme10EventCardProps {
    event: Theme10Event;
    index: number;
}

interface Theme10TimelineItemProps {
    item: LoveStoryItem;
    index: number;
}

interface Theme10GalleryTileProps {
    item: GalleryItem;
    index: number;
    onOpen: () => void;
}

interface Theme10GiftCardProps {
    label: string;
    accountNumber: string;
    accountName: string;
    copyLabel: string;
    copied: boolean;
    onCopy: () => void;
}

interface Theme10WishCardProps {
    item: Theme10Wish;
}

interface FormState {
    name: string;
    phone: string;
    guests: string;
    attendance: AttendanceValue;
    message: string;
}

interface WishFormState {
    name: string;
    attendance: AttendanceValue;
    message: string;
}

interface FormStatus {
    tone: 'success' | 'error';
    message: string;
}

const STORAGE_KEYS = {
    rsvp: 'wt10-rsvp',
    wishes: 'wt10-wishes',
} as const;

const WISHES_PAGE_SIZE = 4;
const DEFAULT_GUEST_NAME = 'Tamu Undangan';
const DEFAULT_COUNTDOWN_TARGET = '2027-01-08T11:00:00+07:00';
const DEFAULT_SITE_TITLE = 'Safitri & Saputra - Wedding Invitation';
const DEFAULT_COVER_LABEL = 'Kepada Yth. Bapak/Ibu/Saudara/i';
const DEFAULT_OPENING_TEXT =
    'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan Resepsi pernikahan putra-putri kami.';
const DEFAULT_QUOTE_TEXT =
    'Dan diantara ayat-ayat-Nya ialah diciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu merasa nyaman kepadanya, dan dijadikan-Nya diantaramu mawadah dan rahmah. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.';
const DEFAULT_QUOTE_SOURCE = 'QS. Ar-Ruum: 21';
const DEFAULT_HERO_CITY = 'KOTA JAKARTA, INDONESIA';
const DEFAULT_VENUE = {
    name: 'Graha Sudirman',
    fullAddress: 'Jl. Jendral Sudirman No. 08, Kelurahan Karet, Kecamatan Setiabudi, Jakarta Selatan, DKI Jakarta 12920, Indonesia',
    notes: 'Parkir tersedia di basement gedung. Pintu masuk tamu melalui lobi utama.',
    mapsEmbedSrc: 'https://www.google.com/maps?q=Jl.+Jendral+Sudirman+No.8+Jakarta&output=embed',
    mapsDirectionUrl: 'https://maps.google.com/?q=Jl.+Jendral+Sudirman+No.8+Jakarta',
};

const ASSETS = {
    bismillah: new URL('./assets/img/bismillah.png', import.meta.url).href,
    groomPhoto: new URL('./assets/img/couple-photo-1.jpg', import.meta.url).href,
    bridePhoto: new URL('./assets/img/couple-photo-2.jpg', import.meta.url).href,
    music: new URL('./assets/audio/bg-music.mp3', import.meta.url).href,
} as const;

const DEFAULT_FEATURES: Theme10Features = {
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
    music: true,
    footer: true,
    video: false,
    confetti: false,
    gift_wishlist: false,
    add_to_calendar: false,
};

const DEFAULT_GROOM = {
    nickname: 'Saputra',
    fullName: 'Saputra Nicolas',
    fatherName: 'Bapak Nicolas',
    motherName: 'Ibu Wahyuningsih',
    order: 'Putra pertama',
    description:
        'Seorang pria sederhana yang percaya bahwa rumah terbaik adalah di sisi orang yang tepat. Bekerja sebagai software engineer dan gemar mendaki gunung di akhir pekan.',
    photo: ASSETS.groomPhoto,
    instagram: 'https://instagram.com/saputra.nicolas',
};

const DEFAULT_BRIDE = {
    nickname: 'Safitri',
    fullName: 'Safitri Dwi Putri',
    fatherName: 'Bapak Stephant',
    motherName: 'Ibu Nur Hidayah',
    order: 'Putri kedua',
    description:
        'Perempuan yang jatuh cinta pada hal-hal kecil; kopi pagi hari, hujan sore hari, dan cerita panjang sebelum tidur. Berprofesi sebagai guru sekolah dasar.',
    photo: ASSETS.bridePhoto,
    instagram: 'https://instagram.com/safitri.dp',
};

const DEFAULT_EVENTS: Theme10Event[] = [
    {
        name: 'Akad Nikah',
        date: '2027-01-08',
        dateFormatted: 'Jumat, 08 Januari 2027',
        time: '08:00',
        timeEnd: '09:30',
        locationName: 'Masjid Raya Baiturrahman',
        location: 'Jl. Utama Raya No. 12, Kebayoran Baru, Jakarta Selatan',
        locationUrl: 'https://maps.google.com/?q=Masjid+Raya+Baiturrahman+Jakarta',
        mapsEmbed: 'https://www.google.com/maps?q=Masjid+Raya+Baiturrahman+Jakarta&output=embed',
        mapsLat: '',
        mapsLng: '',
        isCountdown: false,
        timezone: 'WIB',
    },
    {
        name: 'Resepsi Pernikahan',
        date: '2027-01-08',
        dateFormatted: 'Jumat, 08 Januari 2027',
        time: '11:00',
        timeEnd: '13:00',
        locationName: 'Gedung Pertemuan Ballroom Harmoni',
        location: 'Kavling Bunga Indah No. 45, Kebayoran Baru, Jakarta Selatan',
        locationUrl: 'https://maps.google.com/?q=Ballroom+Harmoni+Kebayoran+Baru',
        mapsEmbed: 'https://www.google.com/maps?q=Ballroom+Harmoni+Kebayoran+Baru&output=embed',
        mapsLat: '',
        mapsLng: '',
        isCountdown: true,
        timezone: 'WIB',
    },
];

const DEFAULT_GALLERY: GalleryItem[] = [
    { url: ASSETS.groomPhoto, label: 'Prewedding - Perbukitan Malang', category: 'moment' },
    { url: ASSETS.bridePhoto, label: 'Prewedding - Taman Bunga', category: 'moment' },
    { url: ASSETS.groomPhoto, label: 'Sesi Sunset', category: 'moment' },
    { url: ASSETS.bridePhoto, label: 'Momen Kasual', category: 'moment' },
    { url: ASSETS.groomPhoto, label: 'Sesi Formal', category: 'moment' },
    { url: ASSETS.bridePhoto, label: 'Perjalanan Bersama', category: 'moment' },
];

const DEFAULT_LOVE_STORY: LoveStoryItem[] = [
    {
        date: 'Maret 2019',
        title: 'Pertama Bertemu',
        desc: 'Dipertemukan lewat teman kuliah yang sama di sebuah acara amal kecil-kecilan di Jakarta.',
        photo: ASSETS.groomPhoto,
    },
    {
        date: 'Agustus 2020',
        title: 'Menjadi Dekat',
        desc: 'Pandemi membuat kami sering bertukar cerita lewat telepon setiap malam, hingga tanpa sadar saling jatuh hati.',
        photo: ASSETS.bridePhoto,
    },
    {
        date: 'Februari 2022',
        title: 'Resmi Berpacaran',
        desc: 'Saputra memberanikan diri mengajak Safitri untuk menjalani hubungan yang lebih serius.',
        photo: ASSETS.groomPhoto,
    },
    {
        date: 'Juni 2026',
        title: 'Lamaran',
        desc: 'Acara lamaran sederhana dihadiri oleh kedua keluarga besar sebagai tanda restu.',
        photo: ASSETS.bridePhoto,
    },
    {
        date: '08 Januari 2027',
        title: 'Hari Bahagia',
        desc: 'Hari dimana kami mengikat janji suci pernikahan, insyaAllah.',
        photo: ASSETS.groomPhoto,
    },
];

const DEFAULT_DRESS_CODES: DressCode[] = [
    { name: 'Sage Green', hex: '#7C8968' },
    { name: 'Dusty Rose', hex: '#B98F89' },
    { name: 'Ivory', hex: '#F7F0E6' },
    { name: 'Champagne Gold', hex: '#C6A15B' },
];

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
    { bankName: 'Bank Central Asia (BCA)', accountNumber: '1234567890', accountName: 'Safitri Dwi Putri' },
    { bankName: 'Bank Mandiri', accountNumber: '0987654321', accountName: 'Saputra Nicolas' },
];

const DEFAULT_DIGITAL_WALLETS: DigitalWallet[] = [
    { provider: 'GoPay', label: 'GoPay', accountNumber: '081234567890', accountName: 'Safitri Dwi Putri', logoUrl: '', qrisQrUrl: null },
    { provider: 'OVO', label: 'OVO', accountNumber: '081234567890', accountName: 'Safitri Dwi Putri', logoUrl: '', qrisQrUrl: null },
    { provider: 'DANA', label: 'DANA', accountNumber: '081298765432', accountName: 'Saputra Nicolas', logoUrl: '', qrisQrUrl: null },
    { provider: 'ShopeePay', label: 'ShopeePay', accountNumber: '081298765432', accountName: 'Saputra Nicolas', logoUrl: '', qrisQrUrl: null },
];

const DEFAULT_WISHES: Theme10Wish[] = [
    {
        id: 'w1',
        name: 'Dian Ayu',
        message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah ya.',
        attendance: 'hadir',
        createdAt: '2026-06-20T09:00:00+07:00',
    },
    {
        id: 'w2',
        name: 'Reza Pratama',
        message: 'Barakallahu lakuma wa baraka \'alaikuma. Selamat ya Saputra & Safitri, bahagia selalu!',
        attendance: 'hadir',
        createdAt: '2026-06-25T14:20:00+07:00',
    },
    {
        id: 'w3',
        name: 'Kevin & Nadia',
        message: 'Semoga lancar sampai hari H, kami usahakan hadir. Sehat-sehat terus kalian berdua!',
        attendance: 'ragu',
        createdAt: '2026-07-01T18:45:00+07:00',
    },
];

const NAV_ITEMS: Array<{ id: NavSectionId; label: string; icon: LucideIcon }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'couple', label: 'Mempelai', icon: Users },
    { id: 'event', label: 'Acara', icon: CalendarDays },
    { id: 'venue', label: 'Lokasi', icon: MapPin },
    { id: 'lovestory', label: 'Kisah', icon: BookHeart },
    { id: 'gallery', label: 'Galeri', icon: Images },
    { id: 'dresscode', label: 'Dress Code', icon: Sparkles },
    { id: 'gift', label: 'Amplop', icon: Gift },
    { id: 'rsvp', label: 'RSVP', icon: Send },
    { id: 'wishes', label: 'Ucapan', icon: MessageCircleHeart },
];

const SECTION_ORDER: Array<{ id: string; nav: NavSectionId }> = [
    { id: 'hero', nav: 'home' },
    { id: 'greeting', nav: 'home' },
    { id: 'couple', nav: 'couple' },
    { id: 'event', nav: 'event' },
    { id: 'venue', nav: 'venue' },
    { id: 'lovestory', nav: 'lovestory' },
    { id: 'gallery', nav: 'gallery' },
    { id: 'dresscode', nav: 'dresscode' },
    { id: 'gift', nav: 'gift' },
    { id: 'rsvp', nav: 'rsvp' },
    { id: 'wishes', nav: 'wishes' },
    { id: 'closing', nav: 'wishes' },
];

const ATTENDANCE_OPTIONS: Array<{ value: AttendanceValue; label: string }> = [
    { value: 'hadir', label: 'Ya, saya akan hadir' },
    { value: 'tidak_hadir', label: 'Maaf, saya berhalangan hadir' },
    { value: 'ragu', label: 'Masih belum bisa memastikan' },
];

const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
] as const;

const WEEKDAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

const PETAL_SVG_LEAF =
    "<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M12 2C7 6 4 11 6 16c1.5 3.5 4.5 5 6 6 1.5-1 4.5-2.5 6-6 2-5-1-10-6-14z' fill='#7C8968' opacity='0.75'/></svg>";
const PETAL_SVG_PETAL =
    "<svg width='14' height='14' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><ellipse cx='12' cy='12' rx='7' ry='11' fill='#B98F89' opacity='0.7'/></svg>";
const PETAL_SVG_GOLD =
    "<svg width='8' height='8' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='9' fill='#C6A15B' opacity='0.8'/></svg>";

function cleanText(value: string | undefined | null, fallback: string): string {
    const text = value?.trim();
    return text ? text : fallback;
}

function normalizeProfileUrl(value: string): string {
    if (!value) return '#';
    if (/^https?:\/\//i.test(value)) return value;
    const cleaned = value.replace(/^@/, '').trim();
    return cleaned ? `https://instagram.com/${cleaned}` : '#';
}

function formatInstagramHandle(value: string): string {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);
            const handle = url.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
            return handle ? `@${handle}` : value;
        } catch {
            return value;
        }
    }
    return value.startsWith('@') ? value : `@${value.replace(/^@/, '')}`;
}

function formatShortDate(dateLike: string): string {
    const date = new Date(`${dateLike}T00:00:00`);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatLongDate(dateLike: string): string {
    const date = new Date(`${dateLike}T00:00:00`);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatWishDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTimeRange(event: Theme10Event): string {
    const start = cleanText(event.time, '08:00');
    const end = cleanText(event.timeEnd, '');
    const zone = event.timezone ? ` ${event.timezone}` : ' WIB';
    if (end) return `Pukul ${start} s/d ${end}${zone}`;
    return `Pukul ${start}${zone}`;
}

function buildCountdownTarget(event?: Theme10Event): string {
    if (!event) return DEFAULT_COUNTDOWN_TARGET;
    const time = cleanText(event.time, '11:00');
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return `${event.date}T${normalizedTime}+07:00`;
}

function computeCountdown(targetDate: string): Theme10CountdownState {
    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const diff = target - Date.now();
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
    };
}

function buildCalendar(mainDate: string) {
    const date = new Date(`${mainDate}T00:00:00`);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{ kind: 'dow' | 'day'; label: string; muted?: boolean; highlight?: boolean }> = WEEKDAY_NAMES.map((label) => ({
        kind: 'dow',
        label,
    }));

    for (let i = firstDay; i > 0; i -= 1) {
        cells.push({ kind: 'day', label: String(daysInPrevMonth - i + 1), muted: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push({
            kind: 'day',
            label: String(day),
            highlight: day === date.getDate(),
        });
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i += 1) {
        cells.push({ kind: 'day', label: String(i), muted: true });
    }

    return {
        label: `${MONTH_NAMES[month]} ${year}`,
        cells,
    };
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

function writeLocalArray<T>(key: string, values: T[]) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(values));
    } catch {
        // Ignore storage failures silently for offline/private browsing.
    }
}

function sortByCreatedAtDesc(items: Theme10Wish[]): Theme10Wish[] {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildWishId() {
    return `wish-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function resolveTheme10Data(
    invitation?: Partial<WeddingInvitation>,
    visitor?: string,
    greeting?: Greeting,
    queryGuestName = '',
): Theme10ResolvedData {
    const features = { ...DEFAULT_FEATURES, ...(invitation?.features ?? {}) };
    const events = (invitation?.events?.length ? invitation.events : DEFAULT_EVENTS).map((event, index) => ({
        ...event,
        dateFormatted: cleanText(event.dateFormatted, formatLongDate(event.date)),
        time: cleanText(event.time, '08:00'),
        timeEnd: cleanText(event.timeEnd, ''),
        locationName: cleanText(event.locationName, DEFAULT_EVENTS[index]?.locationName ?? DEFAULT_EVENTS[0].locationName),
        location: cleanText(event.location, DEFAULT_EVENTS[index]?.location ?? DEFAULT_EVENTS[0].location),
        locationUrl: cleanText(event.locationUrl, DEFAULT_EVENTS[index]?.locationUrl ?? DEFAULT_EVENTS[0].locationUrl),
        mapsEmbed: cleanText(event.mapsEmbed, DEFAULT_EVENTS[index]?.mapsEmbed ?? DEFAULT_EVENTS[0].mapsEmbed),
        mapsLat: cleanText(event.mapsLat, ''),
        mapsLng: cleanText(event.mapsLng, ''),
        timezone: cleanText((event as Theme10Event).timezone, 'WIB'),
        isCountdown: event.isCountdown ?? index === (invitation?.events?.length ? invitation.events.length - 1 : DEFAULT_EVENTS.length - 1),
    }));

    const mainEvent = events.find((event) => event.isCountdown) ?? events[events.length - 1] ?? DEFAULT_EVENTS[DEFAULT_EVENTS.length - 1];
    const heroPhoto = cleanText(invitation?.couplePhoto, cleanText(invitation?.groomPhoto, cleanText(invitation?.bridePhoto, ASSETS.groomPhoto)));
    const guestName = cleanText(queryGuestName || visitor || invitation?.guestName || greeting?.guestLabel, DEFAULT_GUEST_NAME);
    const coverLabel = cleanText(greeting?.title, cleanText(greeting?.guestLabel, DEFAULT_COVER_LABEL));
    const coverButtonText = cleanText(greeting?.buttonText, 'Buka Undangan');
    const openingText = cleanText(greeting?.message, DEFAULT_OPENING_TEXT);
    const venueSource = events[events.length - 1] ?? mainEvent;
    const venue = {
        name: cleanText(venueSource.locationName, DEFAULT_VENUE.name),
        fullAddress: cleanText(venueSource.location, DEFAULT_VENUE.fullAddress),
        notes: DEFAULT_VENUE.notes,
        mapsEmbedSrc: cleanText(venueSource.mapsEmbed, DEFAULT_VENUE.mapsEmbedSrc),
        mapsDirectionUrl: cleanText(venueSource.locationUrl, DEFAULT_VENUE.mapsDirectionUrl),
    };

    const loveStory = invitation?.loveStory?.length ? invitation.loveStory : DEFAULT_LOVE_STORY;
    const gallery = invitation?.gallery?.length ? invitation.gallery : DEFAULT_GALLERY;
    const dressCodes = invitation?.dressCodes?.length ? invitation.dressCodes : DEFAULT_DRESS_CODES;
    const bankAccounts = invitation?.bankAccounts?.length ? invitation.bankAccounts : DEFAULT_BANK_ACCOUNTS;
    const digitalWallets = invitation?.digitalWallets?.length ? invitation.digitalWallets : DEFAULT_DIGITAL_WALLETS;

    return {
        siteTitle: cleanText(invitation?.pageTitle, cleanText(invitation?.title, DEFAULT_SITE_TITLE)),
        guestName,
        coverLabel,
        coverButtonText,
        openingText,
        heroPhoto,
        heroDateLabel: cleanText(invitation?.mainDateFormatted, formatShortDate(mainEvent.date)),
        heroCityLabel: DEFAULT_HERO_CITY,
        countdownTarget: cleanText(invitation?.countdownDate, buildCountdownTarget(mainEvent)),
        groom: {
            nickname: cleanText(invitation?.groomNickname, DEFAULT_GROOM.nickname),
            fullName: cleanText(invitation?.groomFullName, DEFAULT_GROOM.fullName),
            fatherName: cleanText(invitation?.groomFather, DEFAULT_GROOM.fatherName),
            motherName: cleanText(invitation?.groomMother, DEFAULT_GROOM.motherName),
            order: cleanText(invitation?.groomChildOrder, DEFAULT_GROOM.order),
            description: cleanText(invitation?.groomBio, DEFAULT_GROOM.description),
            photo: cleanText(invitation?.groomPhoto, DEFAULT_GROOM.photo),
            instagram: cleanText(invitation?.groomInstagram, DEFAULT_GROOM.instagram),
        },
        bride: {
            nickname: cleanText(invitation?.brideNickname, DEFAULT_BRIDE.nickname),
            fullName: cleanText(invitation?.brideFullName, DEFAULT_BRIDE.fullName),
            fatherName: cleanText(invitation?.brideFather, DEFAULT_BRIDE.fatherName),
            motherName: cleanText(invitation?.brideMother, DEFAULT_BRIDE.motherName),
            order: cleanText(invitation?.brideChildOrder, DEFAULT_BRIDE.order),
            description: cleanText(invitation?.brideBio, DEFAULT_BRIDE.description),
            photo: cleanText(invitation?.bridePhoto, DEFAULT_BRIDE.photo),
            instagram: cleanText(invitation?.brideInstagram, DEFAULT_BRIDE.instagram),
        },
        quote: {
            text: cleanText(invitation?.openingQuote, DEFAULT_QUOTE_TEXT),
            source: DEFAULT_QUOTE_SOURCE,
        },
        events,
        venue,
        loveStory,
        gallery,
        dressCodes,
        dressCodeDescription:
            'Kami dengan senang hati mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dengan nuansa warna berikut, guna menjaga keselarasan tema acara.',
        dressCodeNote: 'Mohon menghindari warna putih penuh, karena akan dikenakan oleh mempelai wanita.',
        bankAccounts,
        digitalWallets,
        closing: {
            thankYouText:
                'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.',
            signatureNames: `${cleanText(invitation?.groomNickname, DEFAULT_GROOM.nickname)} & ${cleanText(invitation?.brideNickname, DEFAULT_BRIDE.nickname)}`,
            hashtag: `#${cleanText(invitation?.groomNickname, DEFAULT_GROOM.nickname).replace(/\s+/g, '')}Dan${cleanText(invitation?.brideNickname, DEFAULT_BRIDE.nickname).replace(/\s+/g, '')}2027`,
        },
        features,
        music: {
            url: cleanText(invitation?.music?.url, ASSETS.music),
            autoplay: invitation?.music?.autoplay ?? true,
            loop: invitation?.music?.loop ?? true,
        },
        rsvpGuestCountOptions: [1, 2, 3, 4],
        attendanceOptions: ATTENDANCE_OPTIONS,
    };
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="section-heading reveal">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title">{title}</h2>
        </div>
    );
}

function Theme10Countdown({ targetDate }: { targetDate: string }) {
    const [state, setState] = useState<Theme10CountdownState>(() => computeCountdown(targetDate));
    const [flipping, setFlipping] = useState<Record<'days' | 'hours' | 'minutes' | 'seconds', boolean>>({
        days: false,
        hours: false,
        minutes: false,
        seconds: false,
    });
    const previousRef = useRef<Theme10CountdownState>(state);
    const timersRef = useRef<Partial<Record<'days' | 'hours' | 'minutes' | 'seconds', ReturnType<typeof setTimeout>>>>({});

    useEffect(() => {
        previousRef.current = computeCountdown(targetDate);
        setState(previousRef.current);
        const tick = () => {
            const next = computeCountdown(targetDate);
            const prev = previousRef.current;
            (['days', 'hours', 'minutes', 'seconds'] as const).forEach((unit) => {
                if (next[unit] !== prev[unit]) {
                    setFlipping((current) => ({ ...current, [unit]: true }));
                    const timer = timersRef.current[unit];
                    if (timer) clearTimeout(timer);
                    timersRef.current[unit] = setTimeout(() => {
                        setFlipping((current) => ({ ...current, [unit]: false }));
                    }, 450);
                }
            });
            previousRef.current = next;
            setState(next);
        };

        tick();
        const intervalId = window.setInterval(tick, 1000);
        return () => {
            window.clearInterval(intervalId);
            Object.values(timersRef.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
        };
    }, [targetDate]);

    const pad = (value: number) => String(value).padStart(2, '0');

    return (
        <>
            <div className="countdown__box">
                <span className={`countdown__num${flipping.days ? ' is-flipping' : ''}`}>{pad(state.days)}</span>
                <span className="countdown__label">Hari</span>
            </div>
            <div className="countdown__box">
                <span className={`countdown__num${flipping.hours ? ' is-flipping' : ''}`}>{pad(state.hours)}</span>
                <span className="countdown__label">Jam</span>
            </div>
            <div className="countdown__box">
                <span className={`countdown__num${flipping.minutes ? ' is-flipping' : ''}`}>{pad(state.minutes)}</span>
                <span className="countdown__label">Menit</span>
            </div>
            <div className="countdown__box">
                <span className={`countdown__num${flipping.seconds ? ' is-flipping' : ''}`}>{pad(state.seconds)}</span>
                <span className="countdown__label">Detik</span>
            </div>
        </>
    );
}

function EventCard({ event, index }: Theme10EventCardProps) {
    return (
        <article className="event-card reveal" style={{ transitionDelay: `${index * 120}ms` }}>
            <h3 className="event-card__label">{event.name}</h3>
            <p className="event-card__row">
                <span className="event-card__icon" aria-hidden="true">
                    <CalendarDays size={16} />
                </span>
                <strong>{event.dateFormatted}</strong>
            </p>
            <p className="event-card__row">
                <span className="event-card__icon" aria-hidden="true">
                    <Clock3 size={16} />
                </span>
                {formatTimeRange(event)}
            </p>
            <p className="event-card__row">
                <span className="event-card__icon" aria-hidden="true">
                    <MapPin size={16} />
                </span>
                <strong>{event.locationName}</strong>
                <span>{event.location}</span>
            </p>
            <a className="event-card__map-link" href={event.locationUrl} target="_blank" rel="noreferrer noopener">
                Lihat di Google Maps &rarr;
            </a>
        </article>
    );
}

function TimelineItem({ item, index }: Theme10TimelineItemProps) {
    return (
        <div className="timeline-item reveal" style={{ transitionDelay: `${index * 120}ms` }}>
            <div className="timeline-badge" />
            <div className="timeline-content">
                <div className="timeline-date">{item.date}</div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                {item.photo ? (
                    <div className="timeline-img">
                        <img src={item.photo} alt={item.title} loading="lazy" />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function GalleryTile({ item, index, onOpen }: Theme10GalleryTileProps) {
    return (
        <button
            type="button"
            className="gallery-item reveal"
            style={{ transitionDelay: `${(index % 3) * 90}ms` }}
            onClick={onOpen}
            aria-label={item.label ?? `Buka foto ${index + 1}`}
        >
            <img src={item.url} alt={item.label ?? `Galeri foto ${index + 1}`} loading="lazy" />
            <span className="gallery-item__cap">{item.label ?? `Momen ${index + 1}`}</span>
        </button>
    );
}

function GiftCard({ label, accountNumber, accountName, copyLabel, copied, onCopy }: Theme10GiftCardProps) {
    return (
        <div className="gift-card reveal">
            <p className="gift-card__bank">{label}</p>
            <p className="gift-card__number">{accountNumber}</p>
            <p className="gift-card__name">a.n. {accountName}</p>
            <button type="button" className={`gift-card__copy${copied ? ' is-copied' : ''}`} onClick={onCopy}>
                {copied ? 'Tersalin' : copyLabel}
            </button>
        </div>
    );
}

function WishCard({ item }: Theme10WishCardProps) {
    return (
        <div className="wish-card">
            <div className="wish-card__head">
                <span className="wish-card__name">{item.name}</span>
                <span className={`wish-card__badge wish-card__badge--${item.attendance}`}>{getWishLabel(item.attendance)}</span>
            </div>
            <p className="wish-card__date">{formatWishDate(item.createdAt)}</p>
            <p className="wish-card__msg">{item.message}</p>
        </div>
    );
}

function getWishLabel(status: AttendanceValue): string {
    if (status === 'hadir') return 'Hadir';
    if (status === 'tidak_hadir') return 'Tidak Hadir';
    return 'Ragu';
}

function buildRsvpDefaults(guestName = ''): FormState {
    return {
        name: guestName && guestName !== DEFAULT_GUEST_NAME ? guestName : '',
        phone: '',
        guests: '1',
        attendance: 'hadir',
        message: '',
    };
}

function buildWishDefaults(guestName = ''): WishFormState {
    return {
        name: guestName && guestName !== DEFAULT_GUEST_NAME ? guestName : '',
        attendance: 'hadir',
        message: '',
    };
}

function buildPetalLayer() {
    if (typeof window === 'undefined') return null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    if (window.matchMedia('(max-width: 640px)').matches) return null;

    const layer = document.createElement('div');
    layer.className = 'petals-layer';
    layer.setAttribute('aria-hidden', 'true');

    const shapes = [PETAL_SVG_LEAF, PETAL_SVG_PETAL, PETAL_SVG_GOLD];
    const count = 10;

    for (let i = 0; i < count; i += 1) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.innerHTML = shapes[i % shapes.length];
        petal.style.left = `${Math.random() * 100}vw`;
        const duration = 14 + Math.random() * 12;
        const swayDuration = 3 + Math.random() * 3;
        const delay = Math.random() * 20;
        petal.style.animationDuration = `${duration}s, ${swayDuration}s`;
        petal.style.animationDelay = `${delay}s, ${delay}s`;
        layer.appendChild(petal);
    }

    return layer;
}

function burstPetals(originEl: HTMLElement | null) {
    if (!originEl || typeof document === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = originEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const shapes = [PETAL_SVG_LEAF, PETAL_SVG_PETAL, PETAL_SVG_GOLD];
    const count = 18;

    for (let i = 0; i < count; i += 1) {
        const particle = document.createElement('div');
        particle.className = 'burst-petal';
        particle.innerHTML = shapes[i % shapes.length];
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;

        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
        const distance = 120 + Math.random() * 160;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance - 80;
        particle.style.setProperty('--burst-end', `translate(${endX}px, ${endY}px)`);
        particle.style.setProperty('--burst-rot', `${Math.random() * 360}deg`);

        document.body.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
}

function copyText(value: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        return navigator.clipboard
            .writeText(value)
            .then(() => true)
            .catch(() => fallbackCopy(value));
    }
    return Promise.resolve(fallbackCopy(value));
}

function fallbackCopy(value: string): boolean {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    } catch {
        return false;
    }
}

export default function WeddingTheme10({ invitation, visitor, greeting }: Theme10Props) {
    const { toast, showToast, clearToast } = useToast();
    const [queryGuestName, setQueryGuestName] = useState('');
    const [opened, setOpened] = useState(() => invitation?.features?.cover === false);
    const [activeSection, setActiveSection] = useState<NavSectionId>('home');
    const [musicPlaying, setMusicPlaying] = useState(false);
    const [activeGiftTab, setActiveGiftTab] = useState<GiftTab>('bank');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [rsvpForm, setRsvpForm] = useState<FormState>(() => buildRsvpDefaults(visitor || invitation?.guestName || greeting?.guestLabel || DEFAULT_GUEST_NAME));
    const [wishForm, setWishForm] = useState<WishFormState>(() => buildWishDefaults(visitor || invitation?.guestName || greeting?.guestLabel || DEFAULT_GUEST_NAME));
    const [rsvpStatus, setRsvpStatus] = useState<FormStatus | null>(null);
    const [wishStatus, setWishStatus] = useState<FormStatus | null>(null);
    const [wishEntries, setWishEntries] = useState<Theme10Wish[]>(() => sortByCreatedAtDesc(DEFAULT_WISHES));
    const [wishPage, setWishPage] = useState(1);

    const rootRef = useRef<HTMLElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const openButtonRef = useRef<HTMLButtonElement | null>(null);
    const wishesListRef = useRef<HTMLDivElement | null>(null);
    const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.scrollTo({ top: 0, behavior: 'auto' });
        const params = new URLSearchParams(window.location.search);
        setQueryGuestName(params.get('to')?.trim() ?? '');
    }, []);

    const data = useMemo(
        () => resolveTheme10Data(invitation, visitor, greeting, queryGuestName),
        [invitation, visitor, greeting, queryGuestName],
    );

    const coverEnabled = data.features.cover !== false;
    const greetingEnabled = data.features.greeting !== false;
    const coupleEnabled = data.features.couple_profile !== false;
    const eventEnabled = data.features.event_detail !== false;
    const locationEnabled = data.features.location !== false;
    const galleryEnabled = data.features.gallery !== false;
    const storyEnabled = data.features.love_story !== false;
    const rsvpEnabled = data.features.rsvp !== false;
    const wishesEnabled = data.features.wishes !== false && invitation?.allowComments !== false;
    const giftEnabled = data.features.digital_envelope !== false && (data.bankAccounts.length > 0 || data.digitalWallets.length > 0);
    const countdownEnabled = data.features.countdown !== false;
    const musicEnabled = data.features.music !== false && Boolean(data.music.url);
    const footerEnabled = data.features.footer !== false;
    const navigationVisible = opened || !coverEnabled;
    const mainLocked = coverEnabled && !opened;
    const visibleWishes = wishEntries.slice(0, wishPage * WISHES_PAGE_SIZE);
    const hasMoreWishes = visibleWishes.length < wishEntries.length;
    const galleryItems = galleryEnabled ? data.gallery : [];
    const heroMainDate = data.events.find((event) => event.isCountdown) ?? data.events[data.events.length - 1] ?? DEFAULT_EVENTS[DEFAULT_EVENTS.length - 1];

    useEffect(() => {
        document.title = data.siteTitle;
    }, [data.siteTitle]);

    useEffect(() => {
        if (!guestNameHasValue(data.guestName)) return;
        setRsvpForm((prev) => (prev.name.trim() ? prev : { ...prev, name: data.guestName }));
        setWishForm((prev) => (prev.name.trim() ? prev : { ...prev, name: data.guestName }));
    }, [data.guestName]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const readWishes = () => {
            const stored = sortByCreatedAtDesc(readLocalArray<Theme10Wish>(STORAGE_KEYS.wishes));
            if (stored.length > 0) {
                setWishEntries(sortByCreatedAtDesc([...stored, ...DEFAULT_WISHES]));
            } else {
                setWishEntries(sortByCreatedAtDesc(DEFAULT_WISHES));
            }
        };
        readWishes();
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = mainLocked || lightboxIndex !== null ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mainLocked, lightboxIndex]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (mainLocked) return;

        const observer = 'IntersectionObserver' in window
            ? new IntersectionObserver(
                  (entries) => {
                      entries.forEach((entry) => {
                          if (entry.isIntersecting) {
                              entry.target.classList.add('is-visible');
                          }
                      });
                  },
                  { threshold: 0.18 },
              )
            : null;

        const nodes = rootRef.current?.querySelectorAll<HTMLElement>('.reveal, .timeline-item');
        if (!nodes || nodes.length === 0) return;

        if (!observer) {
            nodes.forEach((node) => node.classList.add('is-visible'));
            return;
        }

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [mainLocked]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (mainLocked) return;

        const updateActiveSection = () => {
            const threshold = window.innerHeight * 0.38;
            let current: NavSectionId = 'home';

            SECTION_ORDER.forEach((section) => {
                const element = document.getElementById(section.id);
                if (!element) return;
                const top = element.getBoundingClientRect().top;
                if (top <= threshold) {
                    current = section.nav;
                }
            });

            setActiveSection(current);
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        return () => window.removeEventListener('scroll', updateActiveSection);
    }, [mainLocked]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!musicEnabled) return;
        if (!opened && coverEnabled) return;

        const layer = buildPetalLayer();
        if (!layer) return;
        document.body.appendChild(layer);
        return () => layer.remove();
    }, [musicEnabled, opened, coverEnabled]);

    useEffect(() => {
        return () => {
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLightboxIndex(null);
            }
            if (event.key === 'ArrowLeft' && galleryItems.length > 1) {
                setLightboxIndex((current) => (current === null ? current : (current - 1 + galleryItems.length) % galleryItems.length));
            }
            if (event.key === 'ArrowRight' && galleryItems.length > 1) {
                setLightboxIndex((current) => (current === null ? current : (current + 1) % galleryItems.length));
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [lightboxIndex, galleryItems.length]);

    function guestNameHasValue(value: string) {
        return value.trim().length > 0 && value.trim() !== DEFAULT_GUEST_NAME;
    }

    function setRsvpField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setRsvpForm((prev) => ({ ...prev, [key]: value }));
        setRsvpStatus(null);
    }

    function setWishField<K extends keyof WishFormState>(key: K, value: WishFormState[K]) {
        setWishForm((prev) => ({ ...prev, [key]: value }));
        setWishStatus(null);
    }

    function validateRsvp(values: FormState): Partial<Record<keyof FormState, string>> {
        const errors: Partial<Record<keyof FormState, string>> = {};
        if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!values.phone.trim()) errors.phone = 'Nomor WhatsApp wajib diisi.';
        else if (values.phone.replace(/\D/g, '').length < 8) errors.phone = 'Nomor WhatsApp terlihat belum valid.';
        if (!values.guests) errors.guests = 'Pilih jumlah tamu.';
        if (!values.attendance) errors.attendance = 'Pilih status kehadiran.';
        if (values.message.trim().length > 240) errors.message = 'Pesan terlalu panjang.';
        return errors;
    }

    function validateWish(values: WishFormState): Partial<Record<keyof WishFormState, string>> {
        const errors: Partial<Record<keyof WishFormState, string>> = {};
        if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!values.message.trim()) errors.message = 'Ucapan atau doa wajib diisi.';
        if (values.message.trim().length > 500) errors.message = 'Ucapan terlalu panjang.';
        return errors;
    }

    async function handleCopy(label: string, value: string, key: string) {
        const ok = await copyText(value);
        if (!ok) {
            showToast('Gagal menyalin data.');
            return;
        }

        setCopiedKey(key);
        showToast(`${label} berhasil disalin!`);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopiedKey(null), 2500);
    }

    async function submitRsvp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const errors = validateRsvp(rsvpForm);
        if (Object.keys(errors).length > 0) {
            setRsvpStatus({ tone: 'error', message: 'Mohon lengkapi data RSVP terlebih dahulu.' });
            showToast('Mohon lengkapi data RSVP terlebih dahulu.');
            setRsvpForm((prev) => ({ ...prev }));
            return;
        }

        const payload = {
            name: rsvpForm.name.trim(),
            phone: rsvpForm.phone.trim(),
            guests: Number.parseInt(rsvpForm.guests, 10) || 1,
            attendance: rsvpForm.attendance,
            message: rsvpForm.message.trim(),
            createdAt: new Date().toISOString(),
            guestSlug: invitation?.guestSlug ?? '',
        };

        const stored = readLocalArray<typeof payload>(STORAGE_KEYS.rsvp);
        stored.unshift(payload);
        writeLocalArray(STORAGE_KEYS.rsvp, stored);

        if (invitation?.rsvpEndpoint) {
            void fetch(invitation.rsvpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            }).catch(() => undefined);
        }

        setRsvpForm(buildRsvpDefaults(data.guestName));
        setRsvpStatus({ tone: 'success', message: `Terima kasih, ${payload.name}! RSVP Anda telah kami terima.` });
        showToast('Konfirmasi RSVP berhasil dikirim.');
    }

    async function submitWish(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const errors = validateWish(wishForm);
        if (Object.keys(errors).length > 0) {
            setWishStatus({ tone: 'error', message: 'Mohon lengkapi nama dan ucapan Anda.' });
            showToast('Mohon lengkapi nama dan ucapan Anda.');
            return;
        }

        const payload: Theme10Wish = {
            id: buildWishId(),
            name: wishForm.name.trim(),
            message: wishForm.message.trim(),
            attendance: wishForm.attendance,
            createdAt: new Date().toISOString(),
        };

        const next = sortByCreatedAtDesc([payload, ...wishEntries]);
        setWishEntries(next);
        writeLocalArray(STORAGE_KEYS.wishes, next.filter((wish) => !wish.id.startsWith('w1') && !wish.id.startsWith('w2') && !wish.id.startsWith('w3')));
        setWishPage(1);
        setWishForm(buildWishDefaults(data.guestName));
        setWishStatus({ tone: 'success', message: 'Ucapan doa restu Anda berhasil dikirim.' });
        showToast('Ucapan doa restu berhasil dikirim.');

        if (invitation?.wishesEndpoint) {
            void fetch(invitation.wishesEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            }).catch(() => undefined);
        }

        setTimeout(() => {
            wishesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
    }

    function openInvitation() {
        if (!opened) {
            burstPetals(openButtonRef.current);
        }
        setOpened(true);
        if (musicEnabled) {
            void playMusic();
        }
    }

    async function playMusic() {
        const audio = audioRef.current;
        if (!audio) return;
        try {
            audio.volume = 0.5;
            await audio.play();
            setMusicPlaying(true);
        } catch {
            setMusicPlaying(false);
        }
    }

    function pauseMusic() {
        audioRef.current?.pause();
        setMusicPlaying(false);
    }

    function toggleMusic() {
        if (musicPlaying) {
            pauseMusic();
        } else {
            void playMusic();
        }
    }

    function openLightbox(index: number) {
        setLightboxIndex(index);
    }

    function closeLightbox() {
        setLightboxIndex(null);
    }

    function renderNavItem(item: { id: NavSectionId; label: string }) {
        return (
            <a
                key={item.id}
                href={`#${item.id}`}
                data-label={item.label}
                className={activeSection === item.id ? 'is-active' : ''}
                aria-label={item.label}
                onClick={() => setActiveSection(item.id)}
            />
        );
    }

    const eventCalendar = buildCalendar(heroMainDate.date);

    return (
        <div className="wt10-root">
            <audio ref={audioRef} src={data.music.url} loop={data.music.loop} preload="none" />

            {coverEnabled ? (
                <div className={`cover${opened ? ' is-hidden' : ''}`}>
                    <div className="cover__ornament cover__ornament--top" aria-hidden="true" />
                    <div className="cover__ornament cover__ornament--bottom" aria-hidden="true" />

                    <div className="cover__content">
                        <p className="eyebrow cover__eyebrow">The Wedding Of</p>
                        <h1 className="cover__names">
                            <span>{data.groom.nickname}</span>
                            <span className="amp">&amp;</span>
                            <span>{data.bride.nickname}</span>
                        </h1>
                        <p className="cover__guest-label">{data.coverLabel}</p>
                        <div className="cover__guest-name">{data.guestName}</div>
                        <button ref={openButtonRef} type="button" className="btn btn--gold cover__open-btn" onClick={openInvitation}>
                            <span className="btn__icon" aria-hidden="true">
                                <MailOpen size={16} />
                            </span>
                            {data.coverButtonText}
                        </button>
                    </div>
                </div>
            ) : null}

            {musicEnabled ? (
                <button
                    type="button"
                    className={`floating-btn floating-btn--music${navigationVisible ? ' is-visible' : ''}${musicPlaying ? ' is-playing' : ''}`}
                    aria-label={musicPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
                    onClick={toggleMusic}
                >
                    <span className="music-icon" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                </button>
            ) : null}

            <nav id="dotNav" className={`dot-nav${navigationVisible ? ' is-visible' : ''}`} aria-label="Navigasi bagian">
                {NAV_ITEMS.filter((item) => {
                    if (item.id === 'couple' && !coupleEnabled) return false;
                    if (item.id === 'event' && !eventEnabled) return false;
                    if (item.id === 'venue' && !locationEnabled) return false;
                    if (item.id === 'lovestory' && !storyEnabled) return false;
                    if (item.id === 'gallery' && !galleryEnabled) return false;
                    if (item.id === 'dresscode' && !data.dressCodes.length) return false;
                    if (item.id === 'gift' && !giftEnabled) return false;
                    if (item.id === 'rsvp' && !rsvpEnabled) return false;
                    if (item.id === 'wishes' && !wishesEnabled) return false;
                    return true;
                }).map(renderNavItem)}
            </nav>

            <Toast message={toast} onDone={clearToast} className="toast-msg" />

            <main ref={rootRef} id="mainContent" className="main-content" aria-hidden={mainLocked}>
                <section id="hero" className="hero section">
                    <div className="hero__bg-wash" aria-hidden="true" />
                    <img className="leaf-deco leaf-deco--hero-tl" src={new URL('./assets/img/leaf-branch-gold.png', import.meta.url).href} alt="" aria-hidden="true" />
                    <img className="leaf-deco leaf-deco--hero-br" src={new URL('./assets/img/leaf-branch-long.png', import.meta.url).href} alt="" aria-hidden="true" />
                    <div className="gold-deco gold-deco--hero-1" aria-hidden="true" />

                    <div className="hero__inner reveal">
                        <p className="eyebrow">You Are Invited To The Wedding Of</p>
                        <div className="hero__photo-frame">
                            <img src={data.heroPhoto} alt={`Foto pasangan ${data.groom.nickname} dan ${data.bride.nickname}`} />
                        </div>
                        <h1 className="hero__title">
                            <span>{data.groom.nickname}</span>
                            <span className="hero__and">and</span>
                            <span>{data.bride.nickname}</span>
                        </h1>
                        <p className="hero__date">{data.heroDateLabel}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', letterSpacing: '1px' }}>{data.heroCityLabel}</p>

                        {countdownEnabled ? (
                            <div className="countdown" aria-label="Hitung mundur menuju hari bahagia">
                                <Theme10Countdown targetDate={data.countdownTarget} />
                            </div>
                        ) : null}

                        <a href="#couple" className="scroll-hint" aria-label="Gulir ke bawah">
                            <span />
                        </a>
                    </div>
                </section>

                {greetingEnabled ? (
                    <section id="greeting" className="greeting section">
                        <img className="leaf-deco leaf-deco--greeting" src={new URL('./assets/img/leaf-branch-small.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <div className="greeting__inner reveal">
                            <img className="greeting__bismillah" src={ASSETS.bismillah} alt="Bismillahirrahmanirrahim" />
                            <p className="greeting__arabic">Assalamu'alaikum warahmatullahi wabarakatuh</p>
                            <p className="greeting__text">{data.openingText}</p>
                        </div>
                    </section>
                ) : null}

                {coupleEnabled ? (
                    <section id="couple" className="couple section">
                        <img className="gold-deco gold-deco--couple-1" src={new URL('./assets/img/gold-splatter-1.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <img className="gold-deco gold-deco--couple-2" src={new URL('./assets/img/gold-splatter-2.png', import.meta.url).href} alt="" aria-hidden="true" />

                        <SectionHeading eyebrow="Kedua Mempelai" title="Dengan Penuh Syukur" />

                        <div className="couple__grid">
                            <article className="couple__card reveal">
                                <div className="couple__photo">
                                    <img src={data.groom.photo} alt={`Foto ${data.groom.fullName}`} loading="lazy" />
                                </div>
                                <p className="couple__order">{data.groom.order}</p>
                                <h3 className="couple__name">{data.groom.fullName}</h3>
                                <p className="couple__parents">
                                    Putra dari Bapak <strong>{data.groom.fatherName}</strong> &amp; Ibu <strong>{data.groom.motherName}</strong>
                                </p>
                                <p className="couple__desc">{data.groom.description}</p>
                                <a className="couple__ig" href={normalizeProfileUrl(data.groom.instagram)} target="_blank" rel="noreferrer noopener">
                                    {formatInstagramHandle(data.groom.instagram)}
                                </a>
                            </article>

                            <div className="couple__amp reveal" aria-hidden="true">
                                &amp;
                            </div>

                            <article className="couple__card reveal">
                                <div className="couple__photo">
                                    <img src={data.bride.photo} alt={`Foto ${data.bride.fullName}`} loading="lazy" />
                                </div>
                                <p className="couple__order">{data.bride.order}</p>
                                <h3 className="couple__name">{data.bride.fullName}</h3>
                                <p className="couple__parents">
                                    Putri dari Bapak <strong>{data.bride.fatherName}</strong> &amp; Ibu <strong>{data.bride.motherName}</strong>
                                </p>
                                <p className="couple__desc">{data.bride.description}</p>
                                <a className="couple__ig" href={normalizeProfileUrl(data.bride.instagram)} target="_blank" rel="noreferrer noopener">
                                    {formatInstagramHandle(data.bride.instagram)}
                                </a>
                            </article>
                        </div>

                        <blockquote className="couple__quote reveal">
                            <p>"{data.quote.text}"</p>
                            <cite>{data.quote.source}</cite>
                        </blockquote>
                    </section>
                ) : null}

                {eventEnabled ? (
                    <section id="event" className="event section">
                        <img className="leaf-deco leaf-deco--event" src={new URL('./assets/img/leaf-branch-long.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <SectionHeading eyebrow="Save The Date" title="Waktu &amp; Tempat Acara" />

                        <div className="event__calendar reveal">
                            <div className="event__cal-header">
                                <span>{eventCalendar.label}</span>
                            </div>
                            <div className="event__cal-grid">
                                {eventCalendar.cells.map((cell, index) =>
                                    cell.kind === 'dow' ? (
                                        <div key={`dow-${cell.label}-${index}`} className="cal-dow">
                                            {cell.label}
                                        </div>
                                    ) : (
                                        <div
                                            key={`day-${cell.label}-${index}`}
                                            className={`cal-day${cell.muted ? ' is-muted' : ''}${cell.highlight ? ' is-highlight' : ''}`}
                                        >
                                            {cell.label}
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="event__grid">
                            {data.events.map((event, index) => (
                                <EventCard key={`${event.name}-${event.date}-${index}`} event={event} index={index} />
                            ))}
                        </div>
                    </section>
                ) : null}

                {locationEnabled ? (
                    <section id="venue" className="venue section">
                        <SectionHeading eyebrow="Lokasi" title="Alamat Acara" />

                        <div className="venue__wrap reveal">
                            <div className="venue__info">
                                <MapPin size={32} aria-hidden="true" />
                                <h3>{data.venue.name}</h3>
                                <p>{data.venue.fullAddress}</p>
                                <p className="venue__notes">{data.venue.notes}</p>
                                <a className="btn btn--outline" href={data.venue.mapsDirectionUrl} target="_blank" rel="noreferrer noopener">
                                    Buka di Google Maps
                                </a>
                            </div>
                            <div className="venue__map">
                                <iframe
                                    src={data.venue.mapsEmbedSrc}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Lokasi acara"
                                />
                            </div>
                        </div>
                    </section>
                ) : null}

                {storyEnabled ? (
                    <section id="lovestory" className="lovestory section">
                        <img className="leaf-deco leaf-deco--lovestory" src={new URL('./assets/img/leaf-branch-small.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <SectionHeading eyebrow="Perjalanan Kami" title="Love Story" />

                        <div className="timeline">
                            {data.loveStory.map((item, index) => (
                                <TimelineItem key={`${item.title}-${index}`} item={item} index={index} />
                            ))}
                        </div>
                    </section>
                ) : null}

                {galleryEnabled ? (
                    <section id="gallery" className="gallery section">
                        <SectionHeading eyebrow="Momen Kami" title="Gallery" />

                        <div className="gallery__grid">
                            {galleryItems.map((item, index) => (
                                <GalleryTile
                                    key={`${item.url}-${index}`}
                                    item={item}
                                    index={index}
                                    onOpen={() => openLightbox(index)}
                                />
                            ))}
                        </div>

                        {lightboxIndex !== null && galleryItems[lightboxIndex] ? (
                            <div
                                id="lightbox"
                                className="lightbox is-open"
                                role="dialog"
                                aria-modal="true"
                                aria-hidden={false}
                                onClick={(event) => {
                                    if (event.target === event.currentTarget) closeLightbox();
                                }}
                            >
                                <div className="lightbox-frame">
                                    <button className="lightbox__close" aria-label="Tutup galeri" onClick={closeLightbox} type="button">
                                        <X size={24} />
                                    </button>
                                    {galleryItems.length > 1 ? (
                                        <>
                                            <button
                                                className="lightbox__nav lightbox__prev"
                                                aria-label="Sebelumnya"
                                                type="button"
                                                onClick={() => setLightboxIndex((current) => (current === null ? current : (current - 1 + galleryItems.length) % galleryItems.length))}
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                className="lightbox__nav lightbox__next"
                                                aria-label="Berikutnya"
                                                type="button"
                                                onClick={() => setLightboxIndex((current) => (current === null ? current : (current + 1) % galleryItems.length))}
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </>
                                    ) : null}
                                    <img src={galleryItems[lightboxIndex].url} alt={galleryItems[lightboxIndex].label ?? 'Perbesar gambar'} />
                                    <figcaption className="lightbox__caption">{galleryItems[lightboxIndex].label ?? ''}</figcaption>
                                </div>
                            </div>
                        ) : null}
                    </section>
                ) : null}

                <section id="dresscode" className="dresscode section">
                    <img className="gold-deco gold-deco--dc" src={new URL('./assets/img/gold-splatter-3.png', import.meta.url).href} alt="" aria-hidden="true" />
                    <SectionHeading eyebrow="Guest Attire" title="Dress Code" />
                    <p className="dresscode__desc reveal">{data.dressCodeDescription}</p>
                    <div className="dresscode__swatches">
                        {data.dressCodes.map((color, index) => (
                            <div className="dresscode-swatch reveal" key={`${color.name}-${index}`} style={{ transitionDelay: `${index * 90}ms` }}>
                                <span className="dresscode-swatch__circle" style={{ background: color.hex }} />
                                <span className="dresscode-swatch__name">{color.name}</span>
                            </div>
                        ))}
                    </div>
                    <p className="dresscode__note reveal">{data.dressCodeNote}</p>
                </section>

                {giftEnabled ? (
                    <section id="gift" className="gift section">
                        <img className="leaf-deco leaf-deco--gift" src={new URL('./assets/img/leaf-branch-gold.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <SectionHeading eyebrow="Wedding Gift" title="Amplop Digital" />
                        <p className="gift__intro reveal">
                            Doa restu Bapak/Ibu/Saudara/i adalah karunia terindah. Namun jika ingin memberi tanda kasih, kami sediakan pilihan berikut.
                        </p>

                        <div className="gift__tabs reveal">
                            <button
                                type="button"
                                className={`gift__tab${activeGiftTab === 'bank' ? ' is-active' : ''}`}
                                onClick={() => setActiveGiftTab('bank')}
                            >
                                Transfer Bank
                            </button>
                            <button
                                type="button"
                                className={`gift__tab${activeGiftTab === 'ewallet' ? ' is-active' : ''}`}
                                onClick={() => setActiveGiftTab('ewallet')}
                            >
                                E-Wallet
                            </button>
                        </div>

                        <div className={`gift__panel${activeGiftTab === 'bank' ? ' is-active' : ''}`} id="panel-bank">
                            <div className="gift__cards">
                                {data.bankAccounts.map((account, index) => (
                                    <GiftCard
                                        key={`${account.bankName}-${index}`}
                                        label={account.bankName}
                                        accountNumber={account.accountNumber}
                                        accountName={account.accountName}
                                        copyLabel="Salin Nomor Rekening"
                                        copied={copiedKey === `bank-${index}`}
                                        onCopy={() => void handleCopy(account.bankName, account.accountNumber, `bank-${index}`)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={`gift__panel${activeGiftTab === 'ewallet' ? ' is-active' : ''}`} id="panel-ewallet">
                            <div className="gift__cards">
                                {data.digitalWallets.map((wallet, index) => (
                                    <GiftCard
                                        key={`${wallet.provider}-${index}`}
                                        label={wallet.label || wallet.provider}
                                        accountNumber={wallet.accountNumber}
                                        accountName={wallet.accountName}
                                        copyLabel="Salin Nomor E-Wallet"
                                        copied={copiedKey === `wallet-${index}`}
                                        onCopy={() => void handleCopy(wallet.label || wallet.provider, wallet.accountNumber, `wallet-${index}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                {rsvpEnabled ? (
                    <section id="rsvp" className="rsvp section">
                        <SectionHeading eyebrow="Konfirmasi Kehadiran" title="RSVP" />

                        <form className="form reveal" onSubmit={submitRsvp}>
                            <div className={`form__row${rsvpStatus?.tone === 'error' && rsvpStatus.message ? ' is-error' : ''}`}>
                                <label htmlFor="rsvpName">Nama Lengkap</label>
                                <input
                                    id="rsvpName"
                                    type="text"
                                    name="name"
                                    value={rsvpForm.name}
                                    onChange={(event) => setRsvpField('name', event.target.value)}
                                    placeholder="Nama Anda"
                                    autoComplete="name"
                                    required
                                    aria-invalid={Boolean(rsvpStatus?.tone === 'error')}
                                />
                                {rsvpForm.name.trim() === '' && rsvpStatus?.tone === 'error' ? <p className="inline-error">Nama wajib diisi.</p> : null}
                            </div>

                            <div className={`form__row${rsvpStatus?.tone === 'error' && rsvpStatus.message ? ' is-error' : ''}`}>
                                <label htmlFor="rsvpPhone">Nomor WhatsApp</label>
                                <input
                                    id="rsvpPhone"
                                    type="tel"
                                    name="phone"
                                    value={rsvpForm.phone}
                                    onChange={(event) => setRsvpField('phone', event.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    required
                                />
                                {rsvpStatus?.tone === 'error' && !rsvpForm.phone.trim() ? <p className="inline-error">Nomor WhatsApp wajib diisi.</p> : null}
                            </div>

                            <div className="form__row form__row--split">
                                <div className={rsvpStatus?.tone === 'error' && !rsvpForm.guests ? 'is-error' : ''}>
                                    <label htmlFor="rsvpGuests">Jumlah Tamu</label>
                                    <select
                                        id="rsvpGuests"
                                        name="guests"
                                        value={rsvpForm.guests}
                                        onChange={(event) => setRsvpField('guests', event.target.value)}
                                        required
                                    >
                                        {data.rsvpGuestCountOptions.map((count) => (
                                            <option key={count} value={count}>
                                                {count} Orang
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={rsvpStatus?.tone === 'error' && !rsvpForm.attendance ? 'is-error' : ''}>
                                    <label htmlFor="rsvpAttendance">Konfirmasi Kehadiran</label>
                                    <select
                                        id="rsvpAttendance"
                                        name="attendance"
                                        value={rsvpForm.attendance}
                                        onChange={(event) => setRsvpField('attendance', event.target.value as AttendanceValue)}
                                        required
                                    >
                                        {data.attendanceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={`form__row${rsvpStatus?.tone === 'error' && rsvpForm.message.trim().length > 240 ? ' is-error' : ''}`}>
                                <label htmlFor="rsvpMessage">Pesan Tambahan (opsional)</label>
                                <textarea
                                    id="rsvpMessage"
                                    name="message"
                                    rows={3}
                                    value={rsvpForm.message}
                                    onChange={(event) => setRsvpField('message', event.target.value)}
                                    placeholder="Tuliskan pesan untuk mempelai..."
                                    maxLength={240}
                                />
                                {rsvpStatus?.tone === 'error' && rsvpForm.message.trim().length > 240 ? (
                                    <p className="inline-error">Pesan terlalu panjang.</p>
                                ) : null}
                            </div>

                            <button type="submit" className="btn btn--gold form__submit">
                                <span className="btn__icon" aria-hidden="true">
                                    <Send size={16} />
                                </span>
                                Kirim Konfirmasi
                            </button>

                            <p className={`form__status${rsvpStatus?.tone === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
                                {rsvpStatus?.message ?? ''}
                            </p>
                        </form>
                    </section>
                ) : null}

                {wishesEnabled ? (
                    <section id="wishes" className="wishes section">
                        <img className="leaf-deco leaf-deco--wishes" src={new URL('./assets/img/leaf-branch-long.png', import.meta.url).href} alt="" aria-hidden="true" />
                        <SectionHeading eyebrow="Doa & Ucapan" title="Kirim Ucapan" />

                        <form className="form form--wish reveal" onSubmit={submitWish}>
                            <div className="form__row form__row--split">
                                <div className={wishStatus?.tone === 'error' && !wishForm.name.trim() ? 'is-error' : ''}>
                                    <label htmlFor="wishName">Nama</label>
                                    <input
                                        id="wishName"
                                        type="text"
                                        name="name"
                                        value={wishForm.name}
                                        onChange={(event) => setWishField('name', event.target.value)}
                                        placeholder="Nama Anda"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                                <div className={wishStatus?.tone === 'error' && !wishForm.attendance ? 'is-error' : ''}>
                                    <label htmlFor="wishAttendance">Kehadiran</label>
                                    <select
                                        id="wishAttendance"
                                        name="attendance"
                                        value={wishForm.attendance}
                                        onChange={(event) => setWishField('attendance', event.target.value as AttendanceValue)}
                                    >
                                        {data.attendanceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={`form__row${wishStatus?.tone === 'error' && !wishForm.message.trim() ? ' is-error' : ''}`}>
                                <label htmlFor="wishMessage">Ucapan &amp; Doa</label>
                                <textarea
                                    id="wishMessage"
                                    name="message"
                                    rows={3}
                                    value={wishForm.message}
                                    onChange={(event) => setWishField('message', event.target.value)}
                                    placeholder="Tuliskan ucapan dan doa terbaik..."
                                    required
                                    maxLength={500}
                                />
                            </div>

                            <button type="submit" className="btn btn--outline form__submit">
                                <span className="btn__icon" aria-hidden="true">
                                    <MessageCircleHeart size={16} />
                                </span>
                                Kirim Ucapan
                            </button>

                            <p className={`form__status${wishStatus?.tone === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">
                                {wishStatus?.message ?? ''}
                            </p>
                        </form>

                        <div id="wishesList" ref={wishesListRef} className="wishes__list">
                            {visibleWishes.map((wish) => (
                                <WishCard key={wish.id} item={wish} />
                            ))}
                        </div>

                        {hasMoreWishes ? (
                            <button
                                type="button"
                                className="btn btn--text"
                                onClick={() => setWishPage((page) => page + 1)}
                            >
                                Muat Ucapan Lainnya
                            </button>
                        ) : null}
                    </section>
                ) : null}

                <section id="closing" className="closing section">
                    <div className="closing__bg-wash" aria-hidden="true" />
                    <img className="leaf-deco leaf-deco--closing" src={new URL('./assets/img/leaf-branch-gold.png', import.meta.url).href} alt="" aria-hidden="true" />
                    <div className="closing__inner reveal">
                        <p className="eyebrow">Terima Kasih</p>
                        <p className="closing__text">{data.closing.thankYouText}</p>
                        <h2 className="closing__names">
                            {data.groom.nickname} <span className="amp">&amp;</span> {data.bride.nickname}
                        </h2>
                        <p className="closing__hashtag">{data.closing.hashtag}</p>
                    </div>
                </section>

                {footerEnabled ? (
                    <footer className="footer">
                        <div className="footer__inner">
                            <div className="footer__photo-wrap">
                                <img
                                    className="footer__photo"
                                    src={data.heroPhoto}
                                    alt={`Foto mempelai ${data.groom.nickname} dan ${data.bride.nickname}`}
                                    loading="lazy"
                                />
                            </div>
                            <div className="footer__copy">
                                <p className="footer__eyebrow">Penutup dari kami</p>
                                <h3 className="footer__names">
                                    {data.groom.nickname} <span className="amp">&amp;</span> {data.bride.nickname}
                                </h3>
                                <p className="footer__meta">
                                    Dibuat dengan cinta &middot; <span>{new Date().getFullYear()}</span>
                                </p>
                            </div>
                        </div>
                    </footer>
                ) : null}
            </main>

        </div>
    );
}
