import Countdown from '@/components/invitation/Countdown';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import Toast from '@/components/invitation/Toast';
import type {
    BankAccount,
    DressCode,
    DigitalWallet,
    GalleryItem,
    Greeting,
    InvitationEvent,
    LoveStoryItem,
    WeddingInvitation,
    WishItem,
} from '@/types/invitation';
import {
    BookHeart,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Copy,
    Gift,
    Heart,
    Images,
    Landmark,
    MapPin,
    Menu,
    MessageCircleHeart,
    Music2,
    Pause,
    Send,
    Sparkles,
    Users,
    WalletCards,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import './wedding-theme-07.css';

type AttendanceValue = 'hadir' | 'tidak_hadir' | 'ragu';
type GiftTab = 'bank' | 'ewallet';
type ToastVariant = 'success' | 'error' | 'info';
type NavSectionId =
    | 'cover'
    | 'hero'
    | 'couple'
    | 'event'
    | 'address'
    | 'love-story'
    | 'gallery'
    | 'dresscode'
    | 'gift'
    | 'rsvp'
    | 'wishes'
    | 'closing';

interface Theme07Props {
    invitation?: Partial<WeddingInvitation>;
    visitor?: string;
    greeting?: Greeting;
}

interface Theme07Toast {
    id: number;
    message: string;
    variant: ToastVariant;
}

interface Theme07RsvpState {
    name: string;
    phone: string;
    guests: string;
    attendance: AttendanceValue;
    message: string;
}

interface Theme07WishFormState {
    name: string;
    attendance: AttendanceValue;
    message: string;
}

interface Theme07Wish extends WishItem {
    attendance: AttendanceValue;
}

interface Theme07NavItem {
    id: NavSectionId;
    label: string;
    icon: LucideIcon;
}

const STORAGE_KEYS = {
    rsvp: 'wt7-rsvp-submissions',
    wishes: 'wt7-wishes',
} as const;

const WISHES_PAGE_SIZE = 5;
const DEFAULT_GUEST_NAME = 'Tamu Undangan';
const DEFAULT_GUEST_LABEL = 'Kepada Yth. Bapak/Ibu/Saudara(i)';
const DEFAULT_GIFT_TAB: GiftTab = 'bank';
const DEFAULT_GREETING: Greeting = {
    title: 'Tanpa mengurangi rasa hormat',
    guestLabel: DEFAULT_GUEST_LABEL,
    buttonText: 'Buka Undangan',
    message: 'Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir dan memberikan doa restu.',
};

const DEMO_MAIN_DATE = '2026-09-03';
const DEMO_COUNTDOWN = '2026-09-03T11:00:00+07:00';

const DEMO_PHOTOS = {
    groom: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    bride: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop',
    story1: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop',
    story2: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1000&auto=format&fit=crop',
    story3: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
    story4: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop',
    gallery1: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1100&auto=format&fit=crop',
    gallery2: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1100&auto=format&fit=crop',
    gallery3: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1100&auto=format&fit=crop',
    gallery4: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1100&auto=format&fit=crop',
    gallery5: 'https://images.unsplash.com/photo-1550005809-91ad75fb315f?q=80&w=1100&auto=format&fit=crop',
    gallery6: 'https://images.unsplash.com/photo-1546032996-6098e97eef7d?q=80&w=1100&auto=format&fit=crop',
    gallery7: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1100&auto=format&fit=crop',
    gallery8: 'https://images.unsplash.com/photo-1529636444744-31ff2ea4ea51?q=80&w=1100&auto=format&fit=crop',
} as const;

const DEMO_EVENTS: InvitationEvent[] = [
    {
        name: 'Akad Nikah',
        date: DEMO_MAIN_DATE,
        dateFormatted: formatIndonesianDate(DEMO_MAIN_DATE),
        time: '08:00',
        timeEnd: '10:00',
        locationName: 'Kamp Bungloe',
        location: 'Desa Bt. Tallasa, Kec. Ulue Ere, Kab. Bantaeng, Sulawesi Selatan',
        locationUrl: 'https://maps.google.com/?q=Bantaeng,Sulawesi+Selatan',
        mapsEmbed: 'https://www.google.com/maps?q=Bantaeng,Sulawesi+Selatan&output=embed',
        mapsLat: '-5.501628',
        mapsLng: '119.870517',
        isCountdown: true,
    },
    {
        name: 'Resepsi',
        date: DEMO_MAIN_DATE,
        dateFormatted: formatIndonesianDate(DEMO_MAIN_DATE),
        time: '11:00',
        timeEnd: '14:00',
        locationName: 'Kamp Bungloe',
        location: 'Desa Bt. Tallasa, Kec. Ulue Ere, Kab. Bantaeng, Sulawesi Selatan',
        locationUrl: 'https://maps.google.com/?q=Bantaeng,Sulawesi+Selatan',
        mapsEmbed: 'https://www.google.com/maps?q=Bantaeng,Sulawesi+Selatan&output=embed',
        mapsLat: '-5.501628',
        mapsLng: '119.870517',
        isCountdown: false,
    },
];

const DEMO_GALLERY: GalleryItem[] = [
    { url: DEMO_PHOTOS.gallery1, category: 'cover', label: 'Momen spesial' },
    { url: DEMO_PHOTOS.gallery2, category: 'story', label: 'Perjalanan cinta' },
    { url: DEMO_PHOTOS.gallery3, category: 'story', label: 'Lamaran' },
    { url: DEMO_PHOTOS.gallery4, category: 'moment', label: 'Bahagia bersama' },
    { url: DEMO_PHOTOS.gallery5, category: 'moment', label: 'Kebersamaan keluarga' },
    { url: DEMO_PHOTOS.gallery6, category: 'moment', label: 'Menuju hari bahagia' },
    { url: DEMO_PHOTOS.gallery7, category: 'moment', label: 'Cerita yang tumbuh' },
    { url: DEMO_PHOTOS.gallery8, category: 'moment', label: 'Berdua selamanya' },
];

const DEMO_LOVE_STORY: LoveStoryItem[] = [
    {
        date: 'Januari 2015',
        title: 'Pertama Bertemu',
        desc: 'Dipertemukan oleh teman kuliah dalam sebuah acara organisasi kampus di Bantaeng.',
        photo: DEMO_PHOTOS.story1,
    },
    {
        date: 'Agustus 2016',
        title: 'Mulai Dekat',
        desc: 'Sering berdiskusi dan saling mendukung, hingga akhirnya memutuskan untuk saling mengenal lebih jauh.',
        photo: DEMO_PHOTOS.story2,
    },
    {
        date: 'Mei 2018',
        title: 'Lamaran',
        desc: 'Ambra melamar Tika secara sederhana disaksikan oleh kedua keluarga besar.',
        photo: DEMO_PHOTOS.story3,
    },
    {
        date: '03 September 2026',
        title: 'Hari Bahagia',
        desc: 'Ambra dan Tika resmi menjadi pasangan suami istri, semoga sakinah mawaddah warahmah.',
        photo: DEMO_PHOTOS.story4,
    },
];

const DEMO_DRESS_CODES: DressCode[] = [
    { name: 'Dusty Blue', hex: '#6E96C4' },
    { name: 'Powder Blue', hex: '#BFD9F0' },
    { name: 'Ivory', hex: '#F7F4EE' },
    { name: 'Navy', hex: '#2E4A66' },
];

const DEMO_BANK_ACCOUNTS: BankAccount[] = [
    { bankName: 'Bank BCA', accountNumber: '1234567890', accountName: 'Ambra Kumbara' },
    { bankName: 'Bank Mandiri', accountNumber: '0987654321', accountName: 'Satrika' },
];

const DEMO_EWALLETS: DigitalWallet[] = [
    { provider: 'GoPay', label: 'GoPay', accountNumber: '081234567890', accountName: 'Ambra Kumbara', logoUrl: '', qrisQrUrl: null },
    { provider: 'OVO', label: 'OVO', accountNumber: '081298765432', accountName: 'Satrika', logoUrl: '', qrisQrUrl: null },
    { provider: 'DANA', label: 'DANA', accountNumber: '081298765433', accountName: 'Ambra Kumbara', logoUrl: '', qrisQrUrl: null },
    { provider: 'ShopeePay', label: 'ShopeePay', accountNumber: '081298765434', accountName: 'Satrika', logoUrl: '', qrisQrUrl: null },
];

const DEMO_WISHES: Theme07Wish[] = [
    {
        name: 'Dedi & Keluarga',
        attendance: 'hadir',
        message: 'Selamat menempuh hidup baru Ambra & Tika. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
        date: '2026-08-20T09:12:00+07:00',
    },
    {
        name: 'Nur Aisyah',
        attendance: 'hadir',
        message: 'Barakallahu laka wa baraka alaika. Bahagia selalu untuk kalian berdua.',
        date: '2026-08-21T14:40:00+07:00',
    },
    {
        name: 'Fikri Ramadhan',
        attendance: 'tidak_hadir',
        message: 'Maaf belum bisa hadir, tapi doa terbaik selalu menyertai kalian.',
        date: '2026-08-22T18:05:00+07:00',
    },
    {
        name: 'Sinta Maharani',
        attendance: 'hadir',
        message: 'Semoga cinta dan kebahagiaan kalian selalu bertumbuh setiap hari.',
        date: '2026-08-23T10:25:00+07:00',
    },
    {
        name: 'Rizky & Keluarga',
        attendance: 'ragu',
        message: 'Doa terbaik untuk acara yang lancar, hangat, dan penuh keberkahan.',
        date: '2026-08-24T19:55:00+07:00',
    },
    {
        name: 'Maya Salsabila',
        attendance: 'hadir',
        message: 'Semoga menjadi rumah tangga yang penuh ketenangan dan cinta.',
        date: '2026-08-25T08:20:00+07:00',
    },
];

const DEMO_GREETING: Greeting = {
    title: 'Tanpa mengurangi rasa hormat',
    guestLabel: DEFAULT_GUEST_LABEL,
    buttonText: 'Buka Undangan',
    message: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir dan memberikan doa restu.',
};

const DEMO_INVITATION: WeddingInvitation = {
    type: 'wedding',
    code: 'ambra-tika-07',
    slug: 'ambra-tika',
    title: 'Ambra & Tika - Undangan Pernikahan',
    guestName: '',
    countdownDate: DEMO_COUNTDOWN,
    pageTitle: 'Ambra & Tika - Undangan Pernikahan',
    mainDateFormatted: formatIndonesianDate(DEMO_MAIN_DATE),
    events: DEMO_EVENTS,
    gallery: DEMO_GALLERY,
    coupleVideoUrl: '',
    bankAccounts: DEMO_BANK_ACCOUNTS,
    digitalWallets: DEMO_EWALLETS,
    allowComments: true,
    rsvpEndpoint: '/api/rsvp',
    wishesEndpoint: '/api/wishes',
    features: {
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
    },
    music: {
        url: '',
        autoplay: false,
        loop: true,
    },
    greeting: DEMO_GREETING,
    guestQrData: 'demo-guest-qr-ambra-tika-07',
    guestSlug: '',
    groomFullName: 'Ambra Kumbara AS Labea\'',
    groomNickname: 'Ambra',
    groomInitials: 'A',
    groomChildOrder: 'Anak pertama dari dua bersaudara',
    groomFather: 'Bapak Andi Sukwan Labea\'',
    groomMother: 'Ibu Hj. Sitti Rabiah',
    groomBio: 'Anak pertama dari dua bersaudara. Bekerja sebagai software engineer, gemar mendaki gunung dan membaca buku sejarah.',
    groomPhoto: DEMO_PHOTOS.groom,
    brideFullName: 'Satrika, S.KM',
    brideNickname: 'Tika',
    brideInitials: 'T',
    brideChildOrder: 'Anak kedua dari tiga bersaudara',
    brideFather: 'Bapak H. Abu Sofyan',
    brideMother: 'Ibu Hj. Nurjannah',
    brideBio: 'Anak kedua dari tiga bersaudara. Bekerja sebagai tenaga kesehatan masyarakat, menyukai tanaman hias dan senja.',
    bridePhoto: DEMO_PHOTOS.bride,
    couplePhoto: DEMO_PHOTOS.gallery1,
    loveStory: DEMO_LOVE_STORY,
    dressCodes: DEMO_DRESS_CODES,
    rsvpDeadline: '01 September 2026',
    openingQuote:
        'Dan di antara tanda-tanda kekuasaan-Nya, diciptakan-Nya untukmu pasangan hidup dari jenismu sendiri supaya kamu mendapat ketenangan hati.',
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
        month: 'long',
        year: 'numeric',
    });
}

function normalizeTime(time: string): string {
    const match = textValue(time).match(/(\d{1,2})[.:](\d{2})/);
    if (!match) return '08:00';
    return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function buildCountdownTarget(invitation: WeddingInvitation): string {
    if (invitation.countdownDate) return invitation.countdownDate;
    const firstEvent = invitation.events?.[0];
    if (!firstEvent) return new Date().toISOString();
    return `${firstEvent.date}T${normalizeTime(firstEvent.time)}:00+07:00`;
}

function buildCalendarUrl(event: InvitationEvent): string {
    const start = `${event.date.replace(/-/g, '')}T${normalizeTime(event.time).replace(':', '')}00`;
    const end = `${event.date.replace(/-/g, '')}T${normalizeTime(event.timeEnd || event.time).replace(':', '')}00`;
    const location = [event.locationName, event.location].filter(Boolean).join(', ');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name || 'Acara Pernikahan',
    )}&dates=${start}/${end}&location=${encodeURIComponent(location)}`;
}

function formatAccountNumber(value: string): string {
    return value.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function getAttendanceLabel(value: AttendanceValue): string {
    if (value === 'hadir') return 'Hadir';
    if (value === 'tidak_hadir') return 'Tidak Hadir';
    return 'Masih Ragu';
}

function getAttendanceTone(value: AttendanceValue): string {
    if (value === 'hadir') return 'wt7-wish-badge--attend';
    if (value === 'tidak_hadir') return 'wt7-wish-badge--decline';
    return 'wt7-wish-badge--maybe';
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
        // Ignore storage failures in low-storage or private modes.
    }
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall through to execCommand.
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch {
        return false;
    }
}

function SectionDivider({ light = false }: { light?: boolean }) {
    return (
        <div className={`wt7-divider${light ? ' wt7-divider--light' : ''}`} aria-hidden="true">
            <span />
            <Heart size={16} strokeWidth={1.8} />
            <span />
        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    subtitle,
    light = false,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    light?: boolean;
}) {
    return (
        <div className={`wt7-section-heading${light ? ' wt7-section-heading--light' : ''}`}>
            <span className="wt7-eyebrow wt7-reveal">{eyebrow}</span>
            <h2 className="wt7-section-title wt7-reveal wt7-delay-1">{title}</h2>
            <SectionDivider light={light} />
            {subtitle && <p className="wt7-section-subtitle wt7-reveal wt7-delay-2">{subtitle}</p>}
        </div>
    );
}

function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
    return (
        <svg className={`wt7-corner-ornament wt7-corner-ornament--${position}`} viewBox="0 0 240 240" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M28 182c28-58 58-92 117-126" />
                <path d="M42 178c22-35 48-63 92-91" />
                <path d="M30 146c20-10 34-25 44-44" />
                <path d="M44 116c14 6 23 16 29 32" />
            </g>
            <g fill="currentColor">
                <circle cx="71" cy="147" r="14" opacity="0.75" />
                <circle cx="92" cy="123" r="10" opacity="0.58" />
                <circle cx="109" cy="102" r="8" opacity="0.45" />
                <circle cx="55" cy="102" r="6" opacity="0.38" />
                <circle cx="146" cy="72" r="5" opacity="0.28" />
            </g>
        </svg>
    );
}

function CoupleIllustration({ className = '' }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 420 460" role="img" aria-label="Ilustrasi pasangan mempelai" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="210" cy="418" rx="145" ry="20" fill="#BFD9F0" opacity="0.45" />

            <g>
                <circle cx="136" cy="146" r="36" fill="#F2D6B8" />
                <path d="M94 146c0-34 24-61 58-61 18 0 31 5 40 13 12 10 18 24 18 41 0 12-4 22-11 31H106c-8-7-12-16-12-24Z" fill="#2E4A66" />
                <path d="M106 190c14-11 30-16 44-16s30 5 44 16c12 9 19 23 19 40v96H87v-96c0-17 7-31 19-40Z" fill="#EAF2FB" />
                <path d="M122 198c6 10 12 16 18 18 8 3 18 3 28 0 8-2 14-7 18-14" stroke="#6E96C4" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M145 157c0 6-5 10-10 10s-9-4-9-10 4-9 9-9 10 3 10 9Z" fill="#2E4A66" />
                <path d="M162 157c0 6 4 10 9 10s10-4 10-10-5-9-10-9-9 3-9 9Z" fill="#2E4A66" />
                <path d="M143 173c5 4 10 5 16 0" stroke="#C98F8B" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M108 102c12-20 34-31 61-31 19 0 34 5 44 15" stroke="#6E96C4" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.65" />
            </g>

            <g>
                <circle cx="286" cy="146" r="36" fill="#EEC8B0" />
                <path d="M248 146c0-35 24-61 58-61 35 0 59 27 59 61 0 12-4 22-12 31H260c-8-7-12-16-12-24Z" fill="#3F5E80" />
                <path d="M251 190c13-12 30-18 47-18s34 6 48 18c11 9 17 22 17 38v98h-129v-98c0-16 6-29 17-38Z" fill="#FBFCFE" />
                <path d="M281 176c0-6 5-10 10-10s9 4 9 10-4 9-9 9-10-3-10-9Z" fill="#2E4A66" />
                <path d="M297 176c0-6 5-10 10-10s10 4 10 10-5 9-10 9-10-3-10-9Z" fill="#2E4A66" />
                <path d="M286 196c6 7 12 10 19 10 7 0 13-3 19-10" stroke="#6E96C4" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M286 201v44" stroke="#C98F8B" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M260 105c12-13 28-19 49-19 16 0 29 4 39 12" stroke="#8FB0D6" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
            </g>

            <g transform="translate(198 255)">
                <circle cx="0" cy="0" r="7" fill="#8FB0D6" />
                <circle cx="11" cy="7" r="6" fill="#BFD9F0" />
                <circle cx="-11" cy="7" r="6" fill="#BFD9F0" />
                <circle cx="0" cy="15" r="5" fill="#6E96C4" />
            </g>
        </svg>
    );
}

function TimelineCard({
    item,
    index,
}: {
    item: LoveStoryItem;
    index: number;
}) {
    const hasPhoto = Boolean(item.photo);
    const isReverse = index % 2 === 1;

    return (
        <article className={`wt7-story-item wt7-reveal ${isReverse ? 'wt7-story-item--reverse' : ''}`}>
            <div className="wt7-story-marker" aria-hidden="true">
                <span />
            </div>
            <div className="wt7-story-card">
                {hasPhoto ? (
                    <img className="wt7-story-photo" src={item.photo} alt={item.title} loading="lazy" />
                ) : (
                    <div className="wt7-story-photo wt7-story-photo--fallback">
                        <span>{initialsFrom(item.title)}</span>
                    </div>
                )}
                <div className="wt7-story-copy">
                    <p className="wt7-story-date">{textValue(item.date)}</p>
                    <h3 className="wt7-story-title">{item.title}</h3>
                    <p className="wt7-story-desc">{item.desc}</p>
                </div>
            </div>
        </article>
    );
}

function EventCard({
    event,
    index,
    allowCalendar,
    onNavigate,
}: {
    event: InvitationEvent;
    index: number;
    allowCalendar: boolean;
    onNavigate: (url: string) => void;
}) {
    const dateLabel = textValue(event.dateFormatted, formatIndonesianDate(event.date));
    const [weekday, ...rest] = dateLabel.includes(', ') ? dateLabel.split(', ') : [''];
    const dateText = rest.length ? rest.join(', ') : dateLabel;
    const timeRange = event.timeEnd && event.timeEnd !== event.time ? `${event.time} - ${event.timeEnd}` : event.time;

    return (
        <article className="wt7-event-card wt7-reveal" style={{ transitionDelay: `${index * 0.12}s` }}>
            <div className="wt7-event-date">
                <span className="wt7-event-month">{weekday || 'Acara'}</span>
                <strong className="wt7-event-day">{dateText}</strong>
            </div>
            <div className="wt7-event-body">
                <span className="wt7-ribbon">{event.name}</span>
                <p className="wt7-event-time">
                    <Clock3 size={18} />
                    <span>{timeRange}</span>
                </p>
                <div className="wt7-event-location">
                    <div className="wt7-event-location-head">
                        <MapPin size={18} />
                        <span>{event.locationName}</span>
                    </div>
                    <p className="wt7-event-address">{event.location}</p>
                </div>
                <div className="wt7-event-actions">
                    <button type="button" className="wt7-btn wt7-btn--outline wt7-btn--sm" onClick={() => onNavigate(event.locationUrl)}>
                        Buka Maps
                    </button>
                    {allowCalendar && (
                        <button
                            type="button"
                            className="wt7-btn wt7-btn--ghost wt7-btn--sm"
                            onClick={() => onNavigate(buildCalendarUrl(event))}
                        >
                            Kalender
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function WishCard({ item }: { item: Theme07Wish }) {
    return (
        <article className="wt7-wish-item wt7-reveal">
            <div className="wt7-wish-head">
                <div>
                    <h4 className="wt7-wish-name">{item.name}</h4>
                    <p className="wt7-wish-date">{formatWishDate(item.date)}</p>
                </div>
                <span className={`wt7-wish-badge ${getAttendanceTone(item.attendance)}`}>{getAttendanceLabel(item.attendance)}</span>
            </div>
            <p className="wt7-wish-message">{item.message}</p>
        </article>
    );
}

function GiftCard({
    item,
    onCopy,
    copiedValue,
}: {
    item: BankAccount | DigitalWallet;
    onCopy: (value: string) => void;
    copiedValue: string | null;
}) {
    const isBank = 'bankName' in item;
    const value = isBank ? item.accountNumber : item.accountNumber;
    const label = isBank ? item.bankName : item.provider || item.label;
    const owner = item.accountName;

    return (
        <article className="wt7-gift-card">
            <div className="wt7-gift-card-copy">
                <div className="wt7-gift-card-logo">{label.slice(0, 2).toUpperCase()}</div>
                <div className="wt7-gift-card-info">
                    <p className="wt7-gift-card-title">{label}</p>
                    <p className="wt7-gift-card-number">{formatAccountNumber(value)}</p>
                    <p className="wt7-gift-card-name">a.n. {owner}</p>
                </div>
            </div>
            <button type="button" className="wt7-btn wt7-btn--outline wt7-btn--sm wt7-gift-copy" onClick={() => onCopy(value)}>
                <Copy size={15} />
                <span>{copiedValue === value ? 'Tersalin' : 'Salin'}</span>
            </button>
        </article>
    );
}

function normalizeInvitation(invitation?: Partial<WeddingInvitation>, greetingOverride?: Greeting): WeddingInvitation {
    const mergedGreeting = {
        ...DEFAULT_GREETING,
        ...(DEMO_INVITATION.greeting ?? {}),
        ...(invitation?.greeting ?? {}),
        ...(greetingOverride ?? {}),
    };

    const mergedMusic = invitation?.music
        ? {
              url: textValue(invitation.music.url, DEMO_INVITATION.music?.url ?? ''),
              autoplay: Boolean(invitation.music.autoplay),
              loop: invitation.music.loop ?? true,
          }
        : DEMO_INVITATION.music;

    return {
        ...DEMO_INVITATION,
        ...invitation,
        greeting: mergedGreeting,
        music: mergedMusic,
        features: {
            ...DEMO_INVITATION.features,
            ...(invitation?.features ?? {}),
        },
        events: invitation?.events?.length ? invitation.events : DEMO_INVITATION.events,
        gallery: invitation?.gallery?.length ? invitation.gallery : DEMO_INVITATION.gallery,
        bankAccounts: invitation?.bankAccounts?.length ? invitation.bankAccounts : DEMO_INVITATION.bankAccounts,
        digitalWallets: invitation?.digitalWallets?.length ? invitation.digitalWallets : DEMO_INVITATION.digitalWallets,
        loveStory: invitation?.loveStory?.length ? invitation.loveStory : DEMO_INVITATION.loveStory,
        dressCodes: invitation?.dressCodes?.length ? invitation.dressCodes : DEMO_INVITATION.dressCodes,
        allowComments: invitation?.allowComments ?? DEMO_INVITATION.allowComments,
        title: textValue(invitation?.title, DEMO_INVITATION.title),
        slug: textValue(invitation?.slug, DEMO_INVITATION.slug),
        code: textValue(invitation?.code, DEMO_INVITATION.code),
        pageTitle: textValue(invitation?.pageTitle, DEMO_INVITATION.pageTitle),
        countdownDate: textValue(invitation?.countdownDate, DEMO_INVITATION.countdownDate),
        mainDateFormatted: textValue(invitation?.mainDateFormatted, DEMO_INVITATION.mainDateFormatted),
        rsvpEndpoint: textValue(invitation?.rsvpEndpoint, DEMO_INVITATION.rsvpEndpoint),
        wishesEndpoint: textValue(invitation?.wishesEndpoint, DEMO_INVITATION.wishesEndpoint),
        openingQuote: textValue(invitation?.openingQuote, DEMO_INVITATION.openingQuote),
        rsvpDeadline: textValue(invitation?.rsvpDeadline, DEMO_INVITATION.rsvpDeadline),
        guestQrData: textValue(invitation?.guestQrData, DEMO_INVITATION.guestQrData),
        guestName: textValue(invitation?.guestName, DEMO_INVITATION.guestName),
        guestSlug: textValue(invitation?.guestSlug, DEMO_INVITATION.guestSlug),
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

function buildRsvpDefaults(name = ''): Theme07RsvpState {
    return {
        name,
        phone: '',
        guests: '1',
        attendance: 'hadir',
        message: '',
    };
}

function buildWishDefaults(name = ''): Theme07WishFormState {
    return {
        name,
        attendance: 'hadir',
        message: '',
    };
}

function filterNavItems(items: Theme07NavItem[], visibility: Record<NavSectionId, boolean>): Theme07NavItem[] {
    return items.filter((item) => visibility[item.id]);
}

export default function WeddingTheme07({ invitation, visitor, greeting }: Theme07Props) {
    const data = normalizeInvitation(invitation, greeting);
    const guestName = textValue(visitor, data.guestName || DEFAULT_GUEST_NAME);
    const [hasOpened, setHasOpened] = useState(!data.features?.cover);
    const [navOpen, setNavOpen] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeGiftTab, setActiveGiftTab] = useState<GiftTab>(DEFAULT_GIFT_TAB);
    const [copiedGiftValue, setCopiedGiftValue] = useState<string | null>(null);
    const [toast, setToast] = useState<Theme07Toast | null>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [wishEntries, setWishEntries] = useState<Theme07Wish[]>(DEMO_WISHES);
    const [wishVisibleCount, setWishVisibleCount] = useState(WISHES_PAGE_SIZE);
    const [rsvpForm, setRsvpForm] = useState<Theme07RsvpState>(() => buildRsvpDefaults(guestName !== DEFAULT_GUEST_NAME ? guestName : ''));
    const [wishForm, setWishForm] = useState<Theme07WishFormState>(() => buildWishDefaults(guestName !== DEFAULT_GUEST_NAME ? guestName : ''));
    const [rsvpErrors, setRsvpErrors] = useState<Partial<Record<keyof Theme07RsvpState, string>>>({});
    const [wishErrors, setWishErrors] = useState<Partial<Record<keyof Theme07WishFormState, string>>>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const feature = {
        cover: data.features?.cover !== false,
        greeting: data.features?.greeting !== false,
        couple: data.features?.couple_profile !== false,
        event: data.features?.event_detail !== false,
        location: data.features?.location !== false,
        gallery: data.features?.gallery !== false,
        loveStory: data.features?.love_story !== false,
        gift: data.features?.digital_envelope !== false,
        rsvp: data.features?.rsvp !== false,
        wishes: data.features?.wishes !== false,
        footer: data.features?.footer !== false,
        countdown: data.features?.countdown !== false,
        addToCalendar: data.features?.add_to_calendar !== false,
        music: data.features?.music !== false,
    };

    const primaryEvent = data.events[0];
    const countdownTarget = data.countdownDate || (primaryEvent ? buildCountdownTarget(data) : new Date().toISOString());
    const visibleNavItems = filterNavItems(
        [
            { id: 'couple', label: 'Mempelai', icon: Users },
            { id: 'event', label: 'Acara', icon: CalendarDays },
            { id: 'address', label: 'Lokasi', icon: MapPin },
            { id: 'love-story', label: 'Kisah Kami', icon: BookHeart },
            { id: 'gallery', label: 'Galeri', icon: Images },
            { id: 'gift', label: 'Amplop Digital', icon: Gift },
            { id: 'rsvp', label: 'RSVP', icon: MessageCircleHeart },
            { id: 'wishes', label: 'Ucapan', icon: Sparkles },
        ],
        {
            cover: feature.cover,
            hero: true,
            couple: feature.couple,
            event: feature.event,
            address: feature.location,
            'love-story': feature.loveStory,
            gallery: feature.gallery,
            dresscode: Boolean(data.dressCodes.length),
            gift: feature.gift,
            rsvp: feature.rsvp,
            wishes: feature.wishes,
            closing: feature.footer,
        },
    );

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > window.innerHeight * 0.7);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!hasOpened) return;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('.wt7-reveal'));
        if (nodes.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('wt7-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 },
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [hasOpened]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const shouldLock = !hasOpened || navOpen || lightboxIndex !== null;
        document.body.classList.toggle('wt7-no-scroll', shouldLock);
        return () => {
            document.body.classList.remove('wt7-no-scroll');
        };
    }, [hasOpened, navOpen, lightboxIndex]);

    useEffect(() => {
        const storedWishes = readLocalArray<Theme07Wish>(STORAGE_KEYS.wishes);
        if (storedWishes.length > 0) {
            setWishEntries([...storedWishes, ...DEMO_WISHES]);
            setWishVisibleCount(WISHES_PAGE_SIZE);
        }
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !feature.music || !data.music?.url) return;
        audio.loop = data.music.loop ?? true;
        audio.volume = 0.35;
        const handlePlay = () => setAudioPlaying(true);
        const handlePause = () => setAudioPlaying(false);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        return () => {
            audio.pause();
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, [data.music?.url, data.music?.loop, feature.music]);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (event.key === 'Escape') {
                setLightboxIndex(null);
            }
            if (event.key === 'ArrowLeft' && data.gallery.length > 0) {
                setLightboxIndex((current) => (current === null ? 0 : (current - 1 + data.gallery.length) % data.gallery.length));
            }
            if (event.key === 'ArrowRight' && data.gallery.length > 0) {
                setLightboxIndex((current) => (current === null ? 0 : (current + 1) % data.gallery.length));
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIndex, data.gallery.length]);

    useEffect(() => {
        if (!audioRef.current || !data.music?.url) return;
        audioRef.current.loop = data.music.loop ?? true;
    }, [data.music?.loop, data.music?.url]);

    useEffect(() => {
        if (!guestName || guestName === DEFAULT_GUEST_NAME) return;
        setRsvpForm((current) => ({ ...current, name: guestName }));
        setWishForm((current) => ({ ...current, name: guestName }));
    }, [guestName]);

    useEffect(
        () => () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        },
        [],
    );

    const showToast = (message: string, variant: ToastVariant = 'success') => {
        setToast({ id: Date.now(), message, variant });
    };

    const handleOpenInvitation = async () => {
        setHasOpened(true);
        setNavOpen(false);
        if (feature.music && data.music?.url && data.music.autoplay) {
            try {
                await audioRef.current?.play();
            } catch {
                // Browsers may still block autoplay. The button remains available.
            }
        }
    };

    const handleMusicToggle = async () => {
        const audio = audioRef.current;
        if (!audio || !data.music?.url) return;

        try {
            if (audio.paused) {
                await audio.play();
                setAudioPlaying(true);
            } else {
                audio.pause();
                setAudioPlaying(false);
            }
        } catch {
            showToast('Pemutaran musik diblokir browser.', 'info');
        }
    };

    const handleCopyGift = async (value: string) => {
        const success = await copyToClipboard(value);
        if (success) {
            setCopiedGiftValue(value);
            showToast('Nomor rekening berhasil disalin.', 'success');
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
            copyTimerRef.current = setTimeout(() => {
                setCopiedGiftValue(null);
            }, 1800);
        } else {
            showToast('Gagal menyalin nomor rekening.', 'error');
        }
    };

    const handleNavigate = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: Partial<Record<keyof Theme07RsvpState, string>> = {};

        if (!rsvpForm.name.trim()) {
            nextErrors.name = 'Nama harus diisi.';
        }
        const phone = rsvpForm.phone.trim();
        if (!phone) {
            nextErrors.phone = 'Nomor WhatsApp harus diisi.';
        } else if (!/^[0-9+\-()\s]{8,20}$/.test(phone)) {
            nextErrors.phone = 'Nomor WhatsApp tidak valid.';
        }
        const guestsCount = Number.parseInt(rsvpForm.guests, 10);
        if (!Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > 10) {
            nextErrors.guests = 'Jumlah tamu harus antara 1 sampai 10.';
        }
        if (!rsvpForm.attendance) {
            nextErrors.attendance = 'Pilih status kehadiran.';
        }

        setRsvpErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const payload = {
            name: rsvpForm.name.trim(),
            phone,
            guests: guestsCount,
            attendance: rsvpForm.attendance,
            message: rsvpForm.message.trim(),
            submittedAt: new Date().toISOString(),
        };

        const stored = readLocalArray<typeof payload>(STORAGE_KEYS.rsvp);
        writeLocalArray(STORAGE_KEYS.rsvp, [payload, ...stored]);

        if (data.rsvpEndpoint) {
            try {
                await fetch(data.rsvpEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(payload),
                });
            } catch {
                // Local persistence is the fallback when an API is not available.
            }
        }

        showToast('Konfirmasi kehadiran berhasil disimpan.', 'success');
        setRsvpForm(buildRsvpDefaults(guestName !== DEFAULT_GUEST_NAME ? guestName : ''));
    };

    const handleWishSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: Partial<Record<keyof Theme07WishFormState, string>> = {};

        if (!wishForm.name.trim()) {
            nextErrors.name = 'Nama harus diisi.';
        }
        if (!wishForm.message.trim()) {
            nextErrors.message = 'Ucapan atau doa tidak boleh kosong.';
        }
        if (!wishForm.attendance) {
            nextErrors.attendance = 'Pilih status kehadiran.';
        }

        setWishErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const nextWish: Theme07Wish = {
            name: wishForm.name.trim(),
            attendance: wishForm.attendance,
            message: wishForm.message.trim(),
            date: new Date().toISOString(),
        };

        const stored = readLocalArray<Theme07Wish>(STORAGE_KEYS.wishes);
        writeLocalArray(STORAGE_KEYS.wishes, [nextWish, ...stored]);
        setWishEntries((current) => [nextWish, ...current]);
        setWishVisibleCount((current) => Math.max(current, WISHES_PAGE_SIZE));

        if (data.wishesEndpoint) {
            try {
                await fetch(data.wishesEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(nextWish),
                });
            } catch {
                // Local persistence is the fallback when an API is not available.
            }
        }

        showToast('Ucapan berhasil terkirim.', 'success');
        setWishForm(buildWishDefaults(guestName !== DEFAULT_GUEST_NAME ? guestName : ''));
    };

    const visibleWishes = wishEntries.slice(0, wishVisibleCount);
    const hasMoreWishes = wishVisibleCount < wishEntries.length;
    const heroSubtitle = textValue(data.greeting.message, DEFAULT_GREETING.message || '');
    const venueEvent = data.events[0];
    const heroPhoto = textValue(data.couplePhoto) || textValue(data.groomPhoto) || textValue(data.bridePhoto);

    return (
        <div className="wt7-root">
            {feature.music && data.music?.url && (
                <audio ref={audioRef} src={data.music.url} preload="none" className="wt7-audio-element" />
            )}

            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    onDone={() => setToast(null)}
                    className={`wt7-toast wt7-toast--${toast.variant}`}
                />
            )}

            {feature.cover && !hasOpened && (
                <section className="wt7-cover" aria-label="Sampul undangan">
                    <CornerOrnament position="tl" />
                    <CornerOrnament position="br" />
                    <div className="wt7-cover-card wt7-ornate-frame wt7-reveal wt7-visible">
                        <p className="wt7-eyebrow wt7-cover-kicker">Walimatul 'Urs</p>
                        <p className="wt7-cover-lead">{heroSubtitle}</p>
                        <div className="wt7-cover-guest">
                            <span className="wt7-cover-guest-label">{textValue(data.greeting.guestLabel, DEFAULT_GUEST_LABEL)}</span>
                            <strong className="wt7-cover-guest-name">{guestName}</strong>
                        </div>
                        <div className="wt7-cover-photos">
                            <div className="wt7-cover-photo-frame">
                                {data.groomPhoto ? (
                                    <img className="wt7-cover-photo" src={data.groomPhoto} alt={data.groomFullName} loading="eager" />
                                ) : (
                                    <div className="wt7-cover-photo wt7-cover-photo--fallback">
                                        <span>{data.groomInitials}</span>
                                    </div>
                                )}
                            </div>
                            <Heart className="wt7-cover-photos-heart" size={18} strokeWidth={1.8} />
                            <div className="wt7-cover-photo-frame">
                                {data.bridePhoto ? (
                                    <img className="wt7-cover-photo" src={data.bridePhoto} alt={data.brideFullName} loading="eager" />
                                ) : (
                                    <div className="wt7-cover-photo wt7-cover-photo--fallback">
                                        <span>{data.brideInitials}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h1 className="wt7-cover-names">
                            <span className="wt7-script">{data.groomNickname}</span>
                            <span className="wt7-cover-amp wt7-script">&amp;</span>
                            <span className="wt7-script">{data.brideNickname}</span>
                        </h1>
                        {data.guestQrData && (
                            <div className="wt7-cover-qr">
                                <GuestQrCode
                                    data={data.guestQrData}
                                    size={140}
                                    className="wt7-cover-qr-code"
                                />
                                <p className="wt7-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button type="button" className="wt7-btn wt7-btn--primary wt7-cover-cta" onClick={handleOpenInvitation}>
                            <span>{textValue(data.greeting.buttonText, 'Buka Undangan')}</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </section>
            )}

            <div className={`wt7-main${hasOpened || !feature.cover ? ' wt7-main--visible' : ''}`} aria-hidden={feature.cover && !hasOpened}>
                <nav className={`wt7-nav${navScrolled ? ' wt7-nav--scrolled' : ''}`} aria-label="Navigasi bagian undangan">
                    <div className="wt7-nav-inner">
                        <button type="button" className="wt7-nav-brand" onClick={() => setNavOpen(false)}>
                            <span className="wt7-script">A&amp;T</span>
                        </button>
                        <button
                            type="button"
                            className="wt7-nav-toggle"
                            aria-expanded={navOpen}
                            aria-label={navOpen ? 'Tutup menu' : 'Buka menu'}
                            onClick={() => setNavOpen((current) => !current)}
                        >
                            {navOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className={`wt7-nav-links${navOpen ? ' wt7-nav-links--open' : ''}`}>
                            {visibleNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <a key={item.id} href={`#${item.id}`} onClick={() => setNavOpen(false)}>
                                        <Icon size={14} />
                                        <span>{item.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <header id="hero" className="wt7-hero">
                    <CornerOrnament position="tl" />
                    <CornerOrnament position="br" />
                    <div className="wt7-hero-inner wt7-container">
                        <p className="wt7-eyebrow wt7-reveal">The Wedding Of</p>
                        <h1 className="wt7-hero-names wt7-reveal wt7-delay-1">
                            <span className="wt7-script">{data.groomNickname}</span>
                            <span className="wt7-hero-amp wt7-script">&amp;</span>
                            <span className="wt7-script">{data.brideNickname}</span>
                        </h1>
                        <div className="wt7-hero-illustration-wrap wt7-reveal wt7-delay-2">
                            <div className="wt7-hero-illustration-frame">
                                {heroPhoto ? (
                                    <img
                                        className="wt7-hero-illustration"
                                        src={heroPhoto}
                                        alt={`${data.groomNickname} & ${data.brideNickname}`}
                                        loading="eager"
                                    />
                                ) : (
                                    <CoupleIllustration className="wt7-hero-illustration wt7-hero-illustration--svg" />
                                )}
                            </div>
                        </div>
                        <p className="wt7-hero-date wt7-reveal wt7-delay-2">{data.mainDateFormatted}</p>
                        {feature.countdown && (
                            <div className="wt7-hero-countdown wt7-reveal wt7-delay-3" aria-live="polite">
                                <Countdown
                                    targetDate={countdownTarget}
                                    className="wt7-countdown"
                                    boxClassName="wt7-countdown-box"
                                    numClassName="wt7-countdown-number"
                                    labelClassName="wt7-countdown-label"
                                    labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                />
                            </div>
                        )}
                        <a href="#couple" className="wt7-scroll-cue wt7-reveal wt7-delay-3" aria-label="Gulir ke bawah">
                            <span />
                        </a>
                    </div>
                </header>

                {feature.couple && (
                    <section id="couple" className="wt7-section wt7-section--soft">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Kedua Mempelai"
                                title="Dengan penuh syukur"
                                subtitle="Kami, putra dan putri yang berbahagia, mengundang untuk turut mendoakan pernikahan kami."
                            />

                            <div className="wt7-couple-grid">
                                <article className="wt7-couple-card wt7-reveal">
                                    <div className="wt7-couple-photo-wrap">
                                        <img className="wt7-couple-photo" src={data.groomPhoto} alt={data.groomFullName} loading="lazy" />
                                    </div>
                                    <div className="wt7-couple-copy">
                                        <span className="wt7-couple-role">Mempelai Pria</span>
                                        <h3 className="wt7-couple-name">{data.groomNickname}</h3>
                                        <p className="wt7-couple-fullname">{data.groomFullName}</p>
                                        <p className="wt7-couple-order">{data.groomChildOrder}</p>
                                        <p className="wt7-couple-parents">{data.groomFather} <br /> &amp; {data.groomMother}</p>
                                        <p className="wt7-couple-bio">{data.groomBio}</p>
                                    </div>
                                </article>

                                <div className="wt7-couple-amp wt7-script wt7-reveal wt7-delay-1" aria-hidden="true">
                                    &amp;
                                </div>

                                <article className="wt7-couple-card wt7-reveal wt7-delay-2">
                                    <div className="wt7-couple-photo-wrap">
                                        <img className="wt7-couple-photo" src={data.bridePhoto} alt={data.brideFullName} loading="lazy" />
                                    </div>
                                    <div className="wt7-couple-copy">
                                        <span className="wt7-couple-role">Mempelai Wanita</span>
                                        <h3 className="wt7-couple-name">{data.brideNickname}</h3>
                                        <p className="wt7-couple-fullname">{data.brideFullName}</p>
                                        <p className="wt7-couple-order">{data.brideChildOrder}</p>
                                        <p className="wt7-couple-parents">{data.brideFather} <br /> &amp; {data.brideMother}</p>
                                        <p className="wt7-couple-bio">{data.brideBio}</p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </section>
                )}

                {feature.event && (
                    <section id="event" className="wt7-section">
                        <div className="wt7-geo-bg" aria-hidden="true" />
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Save The Date"
                                title="Jadwal Acara"
                                subtitle="Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir."
                            />

                            <div className="wt7-event-grid">
                                {data.events.map((event, index) => (
                                    <EventCard key={`${event.name}-${event.date}-${index}`} event={event} index={index} allowCalendar={feature.addToCalendar} onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {feature.location && venueEvent && (
                    <section id="address" className="wt7-section wt7-section--soft">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Lokasi Acara"
                                title="Alamat & Petunjuk Arah"
                                subtitle="Silakan buka petunjuk arah untuk menuju lokasi acara dengan lebih mudah."
                            />

                            <div className="wt7-map-panel wt7-reveal">
                                <div className="wt7-map-copy">
                                    <p className="wt7-map-label">Lokasi</p>
                                    <h3 className="wt7-map-title">{venueEvent.locationName}</h3>
                                    <p className="wt7-map-address">{venueEvent.location}</p>
                                    <button type="button" className="wt7-btn wt7-btn--outline" onClick={() => handleNavigate(venueEvent.locationUrl)}>
                                        <MapPin size={16} />
                                        <span>Buka di Google Maps</span>
                                    </button>
                                </div>
                                <div className="wt7-map-frame">
                                    <iframe
                                        title="Lokasi acara pernikahan"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={venueEvent.mapsEmbed}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {feature.loveStory && (
                    <section id="love-story" className="wt7-section">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Perjalanan Kami"
                                title="Kisah Cinta"
                                subtitle="Sebuah cerita kecil, dari perkenalan hingga menuju rumah tangga."
                            />

                            <div className="wt7-story-line">
                                {data.loveStory.map((item, index) => (
                                    <TimelineCard key={`${item.title}-${index}`} item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {feature.gallery && data.gallery.length > 0 && (
                    <section id="gallery" className="wt7-section wt7-section--soft">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Momen Bahagia"
                                title="Galeri Foto"
                                subtitle="Kilasan momen yang kami abadikan bersama keluarga dan sahabat."
                            />

                            <div className="wt7-gallery-grid">
                                {data.gallery.map((item, index) => (
                                    <button
                                        key={`${item.url}-${index}`}
                                        type="button"
                                        className="wt7-gallery-item wt7-reveal"
                                        onClick={() => setLightboxIndex(index)}
                                    >
                                        <img src={item.url} alt={item.label || `Galeri ${index + 1}`} loading="lazy" />
                                        <span>{item.label || 'Lihat Foto'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {lightboxIndex !== null && data.gallery[lightboxIndex] && (
                            <div
                                className="wt7-lightbox"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Pratinjau foto galeri"
                                onClick={(event) => {
                                    if (event.target === event.currentTarget) setLightboxIndex(null);
                                }}
                            >
                                <button type="button" className="wt7-lightbox-close" aria-label="Tutup" onClick={() => setLightboxIndex(null)}>
                                    <X size={24} />
                                </button>
                                <button
                                    type="button"
                                    className="wt7-lightbox-nav wt7-lightbox-prev"
                                    aria-label="Sebelumnya"
                                    onClick={() =>
                                        setLightboxIndex((current) =>
                                            current === null ? 0 : (current - 1 + data.gallery.length) % data.gallery.length,
                                        )
                                    }
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <figure className="wt7-lightbox-frame">
                                    <img src={data.gallery[lightboxIndex].url} alt={data.gallery[lightboxIndex].label || 'Foto galeri'} />
                                    {data.gallery[lightboxIndex].label && <figcaption>{data.gallery[lightboxIndex].label}</figcaption>}
                                </figure>
                                <button
                                    type="button"
                                    className="wt7-lightbox-nav wt7-lightbox-next"
                                    aria-label="Berikutnya"
                                    onClick={() =>
                                        setLightboxIndex((current) =>
                                            current === null ? 0 : (current + 1) % data.gallery.length,
                                        )
                                    }
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </section>
                )}

                <section id="dresscode" className="wt7-section">
                    <div className="wt7-container">
                        <SectionHeading
                            eyebrow="Dress Code"
                            title="Busana Tamu Undangan"
                            subtitle="Kami mengundang Bapak/Ibu/Saudara(i) untuk mengenakan busana muslim/muslimah dengan nuansa warna berikut."
                        />

                        <div className="wt7-dress-panel wt7-reveal">
                            <div className="wt7-dress-icons">
                                <div className="wt7-dress-icon">
                                    <Users size={30} />
                                    <span>Busana Muslim/Muslimah</span>
                                </div>
                                <div className="wt7-dress-icon">
                                    <Sparkles size={30} />
                                    <span>Warna Senada Tema</span>
                                </div>
                                <div className="wt7-dress-icon">
                                    <Heart size={30} />
                                    <span>Sopan & Rapi</span>
                                </div>
                            </div>

                            <div className="wt7-palette-grid">
                                {data.dressCodes.map((item) => (
                                    <div key={item.name} className="wt7-palette-swatch">
                                        <span className="wt7-palette-dot" style={{ background: item.hex }} />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="wt7-dress-note">
                                Disarankan menghindari warna putih polos, karena akan dikenakan oleh kedua mempelai.
                            </p>
                        </div>
                    </div>
                </section>

                {feature.gift && (data.bankAccounts.length > 0 || data.digitalWallets.length > 0) && (
                    <section id="gift" className="wt7-section wt7-section--soft">
                        <div className="wt7-geo-bg" aria-hidden="true" />
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Tanda Kasih"
                                title="Amplop Digital"
                                subtitle="Doa restu Bapak/Ibu/Saudara(i) adalah karunia yang berharga bagi kami."
                            />

                            <div className="wt7-gift-tabs wt7-reveal">
                                <button type="button" className={`wt7-gift-tab${activeGiftTab === 'bank' ? ' wt7-gift-tab--active' : ''}`} onClick={() => setActiveGiftTab('bank')}>
                                    <Landmark size={16} />
                                    <span>Transfer Bank</span>
                                </button>
                                <button type="button" className={`wt7-gift-tab${activeGiftTab === 'ewallet' ? ' wt7-gift-tab--active' : ''}`} onClick={() => setActiveGiftTab('ewallet')}>
                                    <WalletCards size={16} />
                                    <span>E-Wallet</span>
                                </button>
                            </div>

                            <div className="wt7-gift-panels wt7-reveal">
                                {activeGiftTab === 'bank' ? (
                                    <div className="wt7-gift-grid">
                                        {data.bankAccounts.map((item) => (
                                            <GiftCard key={`${item.bankName}-${item.accountNumber}`} item={item} onCopy={handleCopyGift} copiedValue={copiedGiftValue} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="wt7-gift-grid">
                                        {data.digitalWallets.map((item) => (
                                            <GiftCard key={`${item.provider}-${item.accountNumber}`} item={item} onCopy={handleCopyGift} copiedValue={copiedGiftValue} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {feature.rsvp && (
                    <section id="rsvp" className="wt7-section">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Konfirmasi Kehadiran"
                                title="RSVP"
                                subtitle="Mohon konfirmasi kehadiran Bapak/Ibu/Saudara(i) agar kami dapat mempersiapkan acara dengan baik."
                            />

                            <form className="wt7-form wt7-reveal" onSubmit={handleRsvpSubmit} noValidate>
                                <div className="wt7-field">
                                    <label htmlFor="wt7-rsvp-name">Nama Lengkap</label>
                                    <input
                                        id="wt7-rsvp-name"
                                        type="text"
                                        value={rsvpForm.name}
                                        onChange={(event) => setRsvpForm((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="Nama Anda"
                                        className="wt7-input"
                                    />
                                    {rsvpErrors.name && <p className="wt7-field-error">{rsvpErrors.name}</p>}
                                </div>

                                <div className="wt7-field">
                                    <label htmlFor="wt7-rsvp-phone">Nomor WhatsApp</label>
                                    <input
                                        id="wt7-rsvp-phone"
                                        type="tel"
                                        value={rsvpForm.phone}
                                        onChange={(event) => setRsvpForm((current) => ({ ...current, phone: event.target.value }))}
                                        placeholder="08xx-xxxx-xxxx"
                                        className="wt7-input"
                                    />
                                    {rsvpErrors.phone && <p className="wt7-field-error">{rsvpErrors.phone}</p>}
                                </div>

                                <div className="wt7-form-split">
                                    <div className="wt7-field">
                                        <label htmlFor="wt7-rsvp-guests">Jumlah Tamu</label>
                                        <input
                                            id="wt7-rsvp-guests"
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={rsvpForm.guests}
                                            onChange={(event) => setRsvpForm((current) => ({ ...current, guests: event.target.value }))}
                                            className="wt7-input"
                                        />
                                        {rsvpErrors.guests && <p className="wt7-field-error">{rsvpErrors.guests}</p>}
                                    </div>
                                    <div className="wt7-field">
                                        <label htmlFor="wt7-rsvp-attendance">Status Kehadiran</label>
                                        <select
                                            id="wt7-rsvp-attendance"
                                            value={rsvpForm.attendance}
                                            onChange={(event) =>
                                                setRsvpForm((current) => ({
                                                    ...current,
                                                    attendance: event.target.value as AttendanceValue,
                                                }))
                                            }
                                            className="wt7-select"
                                        >
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Tidak Hadir</option>
                                            <option value="ragu">Masih Ragu</option>
                                        </select>
                                        {rsvpErrors.attendance && <p className="wt7-field-error">{rsvpErrors.attendance}</p>}
                                    </div>
                                </div>

                                <div className="wt7-field">
                                    <label htmlFor="wt7-rsvp-message">Pesan Tambahan</label>
                                    <textarea
                                        id="wt7-rsvp-message"
                                        rows={3}
                                        value={rsvpForm.message}
                                        onChange={(event) => setRsvpForm((current) => ({ ...current, message: event.target.value }))}
                                        placeholder="Tulis pesan untuk mempelai..."
                                        className="wt7-textarea"
                                    />
                                </div>

                                <button type="submit" className="wt7-btn wt7-btn--primary wt7-form-submit">
                                    <span>Kirim Konfirmasi</span>
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                {feature.wishes && (
                    <section id="wishes" className="wt7-section wt7-section--soft">
                        <div className="wt7-container">
                            <SectionHeading
                                eyebrow="Doa & Ucapan"
                                title="Kirim Ucapan"
                                subtitle="Tuliskan doa dan ucapan terbaik untuk kami di hari bahagia ini."
                            />

                            <form className="wt7-form wt7-reveal" onSubmit={handleWishSubmit} noValidate>
                                <div className="wt7-field">
                                    <label htmlFor="wt7-wish-name">Nama</label>
                                    <input
                                        id="wt7-wish-name"
                                        type="text"
                                        value={wishForm.name}
                                        onChange={(event) => setWishForm((current) => ({ ...current, name: event.target.value }))}
                                        placeholder="Nama Anda"
                                        className="wt7-input"
                                    />
                                    {wishErrors.name && <p className="wt7-field-error">{wishErrors.name}</p>}
                                </div>

                                <div className="wt7-form-split">
                                    <div className="wt7-field">
                                        <label htmlFor="wt7-wish-attendance">Kehadiran</label>
                                        <select
                                            id="wt7-wish-attendance"
                                            value={wishForm.attendance}
                                            onChange={(event) =>
                                                setWishForm((current) => ({
                                                    ...current,
                                                    attendance: event.target.value as AttendanceValue,
                                                }))
                                            }
                                            className="wt7-select"
                                        >
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Tidak Hadir</option>
                                            <option value="ragu">Masih Ragu</option>
                                        </select>
                                        {wishErrors.attendance && <p className="wt7-field-error">{wishErrors.attendance}</p>}
                                    </div>
                                    <div />
                                </div>

                                <div className="wt7-field">
                                    <label htmlFor="wt7-wish-message">Ucapan & Doa</label>
                                    <textarea
                                        id="wt7-wish-message"
                                        rows={4}
                                        value={wishForm.message}
                                        onChange={(event) => setWishForm((current) => ({ ...current, message: event.target.value }))}
                                        placeholder="Tulis ucapan dan doa terbaik..."
                                        className="wt7-textarea"
                                    />
                                    {wishErrors.message && <p className="wt7-field-error">{wishErrors.message}</p>}
                                </div>

                                <button type="submit" className="wt7-btn wt7-btn--primary wt7-form-submit">
                                    <span>Kirim Ucapan</span>
                                    <Send size={16} />
                                </button>
                            </form>

                            <div className="wt7-wish-list">
                                {visibleWishes.map((item, index) => (
                                    <WishCard key={`${item.name}-${item.date}-${index}`} item={item} />
                                ))}
                            </div>

                            {hasMoreWishes && (
                                <button
                                    type="button"
                                    className="wt7-btn wt7-btn--outline wt7-wishes-load-more"
                                    onClick={() => setWishVisibleCount((current) => current + WISHES_PAGE_SIZE)}
                                >
                                    Muat Ucapan Lainnya
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {feature.footer && (
                    <footer id="closing" className="wt7-closing">
                        <CornerOrnament position="tl" />
                        <CornerOrnament position="br" />
                        <div className="wt7-container wt7-closing-inner">
                            <p className="wt7-closing-verse wt7-reveal">
                                &quot;{data.openingQuote}&quot;
                            </p>
                            <p className="wt7-closing-source wt7-reveal wt7-delay-1">QS. Ar-Ruum : 21</p>

                            <div className="wt7-closing-emblem wt7-reveal wt7-delay-2">
                                <CoupleIllustration className="wt7-closing-illustration" />
                                <h2 className="wt7-closing-names">
                                    <span className="wt7-script">{data.groomNickname}</span>
                                    <span className="wt7-closing-amp wt7-script">&amp;</span>
                                    <span className="wt7-script">{data.brideNickname}</span>
                                </h2>
                            </div>

                            <p className="wt7-closing-prayer wt7-reveal wt7-delay-3">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir dan memberikan doa restu.
                            </p>

                            <div className="wt7-footer-bottom">
                                <p>&copy; 2026 Ambra & Tika Wedding. Dibuat dengan penuh kasih untuk hari bahagia kami.</p>
                            </div>
                        </div>
                    </footer>
                )}
            </div>

            {feature.music && data.music?.url && (
                <button
                    type="button"
                    className={`wt7-audio-toggle${audioPlaying ? ' wt7-audio-toggle--playing' : ''}`}
                    aria-label={audioPlaying ? 'Jeda musik' : 'Putar musik'}
                    aria-pressed={audioPlaying}
                    onClick={handleMusicToggle}
                >
                    {audioPlaying ? <Pause size={18} /> : <Music2 size={18} />}
                </button>
            )}

            {!hasOpened && feature.cover && (
                <div className="wt7-cover-backdrop" aria-hidden="true" />
            )}
        </div>
    );
}
