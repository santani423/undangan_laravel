import Countdown from '@/components/invitation/Countdown';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { BirthdayInvitation, GalleryItem, LoveStoryItem, WishItem } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './starry-night.css';

interface Props {
    invitation?: BirthdayInvitation;
    visitor?: string;
}

type FeatureFlags = NonNullable<BirthdayInvitation['features']>;
type SectionId =
    | 'hero'
    | 'profile'
    | 'countdown'
    | 'event'
    | 'timeline'
    | 'gallery'
    | 'video-section'
    | 'maps'
    | 'rsvp'
    | 'wishes'
    | 'gift'
    | 'wishlist'
    | 'goals'
    | 'calendar-section';

type NavItem = {
    id: SectionId;
    label: string;
    icon: string;
};

type GoalItem = {
    icon: string;
    name: string;
    target: string;
    percent: number;
    note: string;
};

type WishlistItem = {
    icon: string;
    name: string;
    desc: string;
};

const SECTION_ORDER: NavItem[] = [
    { id: 'hero', label: 'Home', icon: '✦' },
    { id: 'profile', label: 'Profile', icon: '👑' },
    { id: 'countdown', label: 'Countdown', icon: '⏳' },
    { id: 'event', label: 'Event', icon: '🏰' },
    { id: 'timeline', label: 'Story', icon: '📖' },
    { id: 'gallery', label: 'Gallery', icon: '📸' },
    { id: 'video-section', label: 'Video', icon: '🎬' },
    { id: 'maps', label: 'Maps', icon: '📍' },
    { id: 'rsvp', label: 'RSVP', icon: '✉️' },
    { id: 'wishes', label: 'Wishes', icon: '💌' },
    { id: 'gift', label: 'Gift', icon: '🎁' },
    { id: 'wishlist', label: 'Wishlist', icon: '✨' },
    { id: 'goals', label: 'Goals', icon: '🌟' },
    { id: 'calendar-section', label: 'Calendar', icon: '📅' },
];

const NAV_SECTION_IDS: SectionId[] = ['profile', 'event', 'timeline', 'gallery', 'gift'];

const ROYAL_DIVIDER_ICON = (
    <svg viewBox="0 0 24 24" className="sn-royal-divider-icon" aria-hidden="true">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(' ');
}

function escapeXml(text: string) {
    return text.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return char;
        }
    });
}

function svgDataUri(svg: string) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createIllustrationDataUri(title: string, subtitle: string, from: string, to: string, accent: string) {
    const safeTitle = escapeXml(title);
    const safeSubtitle = escapeXml(subtitle);
    return svgDataUri(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${from}" />
                    <stop offset="100%" stop-color="${to}" />
                </linearGradient>
            </defs>
            <rect width="800" height="800" rx="48" fill="url(#bg)" />
            <circle cx="160" cy="175" r="120" fill="${accent}" opacity=".12" />
            <circle cx="640" cy="175" r="90" fill="#ffffff" opacity=".18" />
            <circle cx="565" cy="585" r="150" fill="${accent}" opacity=".08" />
            <path d="M178 590C242 506 334 470 400 470c66 0 158 36 222 120" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round" opacity=".22" />
            <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700" fill="#4c1d95">${safeTitle}</text>
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Poppins, Arial, sans-serif" font-size="24" letter-spacing=".18em" fill="#7c3aed">${safeSubtitle}</text>
            <circle cx="400" cy="645" r="9" fill="${accent}" />
            <circle cx="372" cy="645" r="6" fill="#fbbf24" />
            <circle cx="428" cy="645" r="6" fill="#bae6fd" />
        </svg>
    `);
}

function createStars(count: number) {
    const palette = ['#f9a8d4', '#c4b5fd', '#fbbf24', '#bae6fd'];
    return Array.from({ length: count }, () => {
        const size = 1 + Math.random() * 2;
        return {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size,
            delay: `${Math.random() * 3}s`,
            duration: `${1.5 + Math.random() * 2}s`,
            color: palette[Math.floor(Math.random() * palette.length)],
        };
    });
}

function createBalloons(count: number) {
    const palette = ['#f9a8d4', '#c4b5fd', '#bae6fd', '#fbbf24', '#ec4899', '#8b5cf6'];
    return Array.from({ length: count }, (_, i) => {
        const size = 30 + Math.random() * 24;
        return {
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 6}s`,
            duration: `${8 + Math.random() * 8}s`,
            size,
            color: palette[i % palette.length],
        };
    });
}

function createHeroDecor() {
    return [
        { icon: '🌸', top: '10%', left: '4%', size: '2rem', duration: '4s', delay: '0s' },
        { icon: '⭐', top: '15%', right: '7%', size: '1.6rem', duration: '5s', delay: '1s' },
        { icon: '🦋', bottom: '18%', left: '8%', size: '1.8rem', duration: '3.5s', delay: '0.5s' },
        { icon: '✨', bottom: '14%', right: '5%', size: '1.6rem', duration: '4.5s', delay: '1.5s' },
    ];
}

function getVideoEmbedUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (parsed.pathname.startsWith('/embed/')) return url;
            if (parsed.pathname.startsWith('/shorts/')) return `https://www.youtube.com/embed/${parsed.pathname.split('/')[2] ?? ''}`;
            const videoId = parsed.searchParams.get('v');
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        if (host === 'vimeo.com') {
            const videoId = parsed.pathname.split('/').filter(Boolean)[0];
            if (videoId) return `https://player.vimeo.com/video/${videoId}`;
        }

        return url;
    } catch {
        return '';
    }
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeTimeStamp(date: string, time?: string) {
    const datePart = (date || '').replace(/-/g, '');
    const digits = (time || '10:00').replace(/\D/g, '').padEnd(6, '0').slice(0, 6);
    return `${datePart}T${digits}`;
}

function buildLocation(ev: BirthdayInvitation['events'][number]) {
    return [ev.locationName, ev.location].filter(Boolean).join(', ');
}

function buildMapsUrl(ev: BirthdayInvitation['events'][number]) {
    if (ev.locationUrl) return ev.locationUrl;
    if (ev.mapsLat && ev.mapsLng) return `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}`;
    return '';
}

function buildGoogleCalendarUrl(ev: BirthdayInvitation['events'][number], title: string) {
    const start = normalizeTimeStamp(ev.date, ev.time);
    const end = normalizeTimeStamp(ev.date, ev.timeEnd || ev.time);
    const location = buildLocation(ev);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(location)}`;
}

function buildOutlookCalendarUrl(ev: BirthdayInvitation['events'][number], title: string) {
    const start = `${ev.date}T${(ev.time || '10:00').replace(/\s+/g, '')}`;
    const end = `${ev.date}T${(ev.timeEnd || ev.time || '14:00').replace(/\s+/g, '')}`;
    const location = buildLocation(ev);
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(start)}&enddt=${encodeURIComponent(end)}&location=${encodeURIComponent(location)}`;
}

function downloadIcs(ev: BirthdayInvitation['events'][number], title: string) {
    const location = buildLocation(ev);
    const start = normalizeTimeStamp(ev.date, ev.time);
    const end = normalizeTimeStamp(ev.date, ev.timeEnd || ev.time || '14:00');
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Undesia//Birthday Invitation//ID',
        'BEGIN:VEVENT',
        `UID:${slugify(`${title}-${ev.date}-${ev.time}`)}@undesia.local`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        location ? `LOCATION:${location}` : '',
        'END:VEVENT',
        'END:VCALENDAR',
    ]
        .filter(Boolean)
        .join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slugify(title || 'birthday')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
}

async function copyText(text: string, label: string, onToast: (msg: string) => void) {
    const success = `${label} disalin`;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            onToast(`✓ ${success}`);
            return;
        }
    } catch {
        // Fallback below.
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        onToast(`✓ ${success}`);
    } catch {
        onToast(`✓ ${success}`);
    } finally {
        document.body.removeChild(textarea);
    }
}

function SectionHeader({ badge, title, subtitle, gold = false }: { badge: string; title: string; subtitle?: string; gold?: boolean }) {
    return (
        <div className="sn-text-center sn-fade-up">
            <span className={cx('sn-section-badge', gold && 'sn-section-badge-gold')}>{badge}</span>
            <h2 className={cx('sn-section-title', gold && 'sn-section-title-gold')}>{title}</h2>
            <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
            {subtitle && <p className={cx('sn-section-sub', gold && 'sn-section-sub-light')}>{subtitle}</p>}
        </div>
    );
}

function CastleIllustration() {
    return (
        <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" className="sn-castle-illustration" aria-hidden="true">
            <defs>
                <linearGradient id="castleA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="castleB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6d28d9" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
            </defs>
            <rect x="0" y="322" width="760" height="38" fill="#1a0533" />
            <ellipse cx="380" cy="318" rx="430" ry="16" fill="#2d1b69" />
            <rect x="24" y="162" width="82" height="160" fill="url(#castleA)" />
            <polygon points="24,162 65,92 106,162" fill="#fbbf24" />
            <rect x="36" y="172" width="20" height="30" rx="10" fill="#0d0628" />
            <rect x="64" y="172" width="20" height="30" rx="10" fill="#0d0628" />
            <line x1="65" y1="92" x2="65" y2="66" stroke="#fbbf24" strokeWidth="2" />
            <polygon points="65,66 84,74 65,82" fill="#ec4899" />
            <rect x="654" y="162" width="82" height="160" fill="url(#castleA)" />
            <polygon points="654,162 695,92 736,162" fill="#fbbf24" />
            <rect x="666" y="172" width="20" height="30" rx="10" fill="#0d0628" />
            <rect x="694" y="172" width="20" height="30" rx="10" fill="#0d0628" />
            <line x1="695" y1="92" x2="695" y2="66" stroke="#fbbf24" strokeWidth="2" />
            <polygon points="695,66 676,74 695,82" fill="#c4b5fd" />
            <rect x="116" y="110" width="118" height="212" fill="url(#castleA)" />
            <polygon points="116,110 175,42 234,110" fill="#fbbf24" />
            <circle cx="175" cy="110" r="7" fill="#fbbf24" />
            <rect x="126" y="126" width="28" height="40" rx="14" fill="#0d0628" />
            <rect x="168" y="126" width="28" height="40" rx="14" fill="#0d0628" />
            <rect x="118" y="98" width="28" height="14" fill="#fbbf24" />
            <rect x="156" y="98" width="28" height="14" fill="#fbbf24" />
            <rect x="194" y="98" width="28" height="14" fill="#fbbf24" />
            <line x1="175" y1="42" x2="175" y2="16" stroke="#fbbf24" strokeWidth="2.5" />
            <polygon points="175,16 202,24 175,32" fill="#f9a8d4" />
            <rect x="522" y="110" width="118" height="212" fill="url(#castleA)" />
            <polygon points="522,110 581,42 640,110" fill="#fbbf24" />
            <circle cx="581" cy="110" r="7" fill="#fbbf24" />
            <rect x="532" y="126" width="28" height="40" rx="14" fill="#0d0628" />
            <rect x="574" y="126" width="28" height="40" rx="14" fill="#0d0628" />
            <rect x="524" y="98" width="28" height="14" fill="#fbbf24" />
            <rect x="562" y="98" width="28" height="14" fill="#fbbf24" />
            <rect x="600" y="98" width="28" height="14" fill="#fbbf24" />
            <line x1="581" y1="42" x2="581" y2="16" stroke="#fbbf24" strokeWidth="2.5" />
            <polygon points="581,16 554,24 581,32" fill="#bae6fd" />
            <rect x="234" y="70" width="292" height="250" fill="url(#castleA)" />
            <rect x="234" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="280" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="326" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="372" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="418" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="464" y="56" width="38" height="16" fill="#6d28d9" />
            <rect x="316" y="6" width="132" height="64" fill="#6d28d9" />
            <polygon points="316,6 382,-46 448,6" fill="#fbbf24" />
            <circle cx="382" cy="6" r="10" fill="#fbbf24" opacity=".85" />
            <line x1="382" y1="-46" x2="382" y2="-72" stroke="#fbbf24" strokeWidth="3" />
            <polygon points="382,-72 410,-60 382,-46" fill="#ec4899" />
            <circle cx="382" cy="110" r="40" fill="#0d0628" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="382" cy="110" r="25" fill="none" stroke="rgba(251,191,36,.4)" strokeWidth="1.5" strokeDasharray="5,4" />
            <circle cx="382" cy="110" r="10" fill="rgba(251,191,36,.2)" />
            <path d="M328 180h108v144a54 54 0 0 1-54 54h0a54 54 0 0 1-54-54V180z" fill="#0d0628" />
            <path d="M328 180Q328 122 382 122Q436 122 436 180" fill="none" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="374" cy="264" r="5" fill="#fbbf24" />
            <circle cx="390" cy="264" r="5" fill="#fbbf24" />
        </svg>
    );
}

const DEMO_GALLERY: GalleryItem[] = [
    { category: 'baby', label: 'Baby Aurora', url: createIllustrationDataUri('Baby Aurora', 'first smile', '#fff1f8', '#ede9fe', '#ec4899') },
    { category: 'baby', label: 'Newborn', url: createIllustrationDataUri('Newborn', 'tiny star', '#f5f3ff', '#e0f2fe', '#c4b5fd') },
    { category: 'baby', label: 'Bath Time', url: createIllustrationDataUri('Bath Time', 'sparkles', '#fff7ed', '#fef3c7', '#fbbf24') },
    { category: 'toddler', label: 'First Steps', url: createIllustrationDataUri('First Steps', 'little explorer', '#fce7f3', '#ede9fe', '#8b5cf6') },
    { category: 'toddler', label: 'Playground', url: createIllustrationDataUri('Playground', 'play and shine', '#ede9fe', '#e0f2fe', '#bae6fd') },
    { category: 'toddler', label: 'Little Artist', url: createIllustrationDataUri('Little Artist', 'colorful dreams', '#fff0fb', '#fce7f3', '#ec4899') },
    { category: 'school', label: 'School Day', url: createIllustrationDataUri('School Day', 'learn and grow', '#fef9c3', '#fce7f3', '#fbbf24') },
    { category: 'school', label: 'Study Time', url: createIllustrationDataUri('Study Time', 'smart & kind', '#ede9fe', '#f5f3ff', '#8b5cf6') },
    { category: 'school', label: 'Award Winner', url: createIllustrationDataUri('Award Winner', 'little champion', '#eff6ff', '#fef3c7', '#d97706') },
    { category: 'family', label: 'Family Portrait', url: createIllustrationDataUri('Family Portrait', 'full of love', '#fce7f3', '#ede9fe', '#ec4899') },
    { category: 'family', label: 'Beach Day', url: createIllustrationDataUri('Beach Day', 'sun and joy', '#e0f2fe', '#fef9c3', '#bae6fd') },
    { category: 'family', label: 'Christmas', url: createIllustrationDataUri('Christmas', 'warm memories', '#ede9fe', '#fff7ed', '#d97706') },
];

const DEMO_TIMELINE: LoveStoryItem[] = [
    {
        date: 'July 12, 2018',
        title: 'A Star is Born',
        desc: 'On a beautiful morning, our little princess arrived and filled our hearts with immeasurable joy and love.',
        photo: createIllustrationDataUri('A Star is Born', '2018', '#fff1f8', '#ede9fe', '#ec4899'),
    },
    {
        date: '2019 - Age 1',
        title: 'First Steps',
        desc: 'Those tiny wobbly steps melted everyone’s hearts. She was already determined to explore the world.',
        photo: createIllustrationDataUri('First Steps', '2019', '#f5f3ff', '#e0f2fe', '#8b5cf6'),
    },
    {
        date: '2020 - Age 2',
        title: 'Little Artist',
        desc: 'She discovered colors, sketches, and a love for drawing that brightened every room.',
        photo: createIllustrationDataUri('Little Artist', '2020', '#fff0fb', '#fce7f3', '#fbbf24'),
    },
    {
        date: '2022 - Age 4',
        title: 'The Performer',
        desc: 'Dance classes turned family gatherings into magical shows with a smile that could light up the stage.',
        photo: createIllustrationDataUri('The Performer', '2022', '#ede9fe', '#fdf4ff', '#c4b5fd'),
    },
    {
        date: '2023 - Age 5',
        title: 'First Day of School',
        desc: 'Bravely walked into school with a princess backpack, ready to learn, make friends, and conquer the world.',
        photo: createIllustrationDataUri('First Day', '2023', '#eff6ff', '#fce7f3', '#bae6fd'),
    },
    {
        date: '2024 - Age 6',
        title: 'Little Champion',
        desc: 'Won her first drawing competition and became a source of inspiration for everyone around her.',
        photo: createIllustrationDataUri('Little Champion', '2024', '#fef9c3', '#ede9fe', '#fbbf24'),
    },
    {
        date: 'July 12, 2026 - Age 8',
        title: 'Royal Birthday Celebration!',
        desc: 'Today we celebrate eight magical years of joy, laughter, love, and all the wonderful things that make her our princess.',
        photo: createIllustrationDataUri('Royal Day', '2026', '#fce7f3', '#ede9fe', '#ec4899'),
    },
];

const DEMO_WISHES: WishItem[] = [
    { name: 'Aunt Sarah', message: 'Happy birthday, little princess! May all your fairy tale dreams come true.', date: '2026-07-07T08:15:00Z' },
    { name: 'Grandma Rose', message: 'Our little angel, you grow more beautiful every day. Grandma loves you so much.', date: '2026-07-08T11:20:00Z' },
    { name: 'Uncle Thomas', message: 'Happy birthday! Keep dancing, keep dreaming, keep shining.', date: '2026-07-09T02:30:00Z' },
];

const DEMO_WISHLIST: WishlistItem[] = [
    { icon: '📚', name: 'Storybooks', desc: 'Fairy tales, princess stories, and adventure books.' },
    { icon: '🎨', name: 'Art Supplies', desc: 'Colored pencils, watercolors, and sketchbooks.' },
    { icon: '🧸', name: 'Princess Dolls', desc: 'A sweet collection for magical playtime.' },
    { icon: '🧩', name: 'Educational Toys', desc: 'Puzzles, building blocks, and STEM kits.' },
    { icon: '🎹', name: 'Musical Instruments', desc: 'Mini piano or ukulele for beginner fun.' },
    { icon: '🌟', name: 'Savings Gift', desc: 'A thoughtful contribution to education and future dreams.' },
];

const DEMO_GOALS: GoalItem[] = [
    { icon: '🎓', name: 'Education Fund', target: 'Rp 50.000.000', percent: 65, note: 'Knowledge is the most royal treasure.' },
    { icon: '🎨', name: 'Art Class Fund', target: 'Rp 10.000.000', percent: 40, note: 'Every princess expresses herself through art.' },
    { icon: '✈️', name: 'Dream Trip Fund', target: 'Rp 30.000.000', percent: 25, note: 'To explore every magical kingdom.' },
];

const DEMO_INVITATION: BirthdayInvitation = {
    type: 'birthday',
    code: 'demo-royal-01',
    slug: 'starry-night-demo',
    title: 'Royal Birthday Invitation',
    guestName: 'Beloved Friend',
    countdownDate: '2026-07-12T10:00:00',
    pageTitle: "Princess Aurora's Royal Birthday",
    mainDateFormatted: 'Sunday, July 12, 2026',
    events: [
        {
            name: "Princess Aurora's 8th Birthday Celebration",
            date: '2026-07-12',
            dateFormatted: 'Sunday, July 12, 2026',
            time: '10:00',
            timeEnd: '14:00',
            locationName: 'Royal Garden Hall',
            location: 'Jl. Bunga Raya No. 12, Ciawi, Bogor, West Java 16760',
            locationUrl: 'https://maps.google.com/?q=Taman+Bunga+Nusantara+Ciawi+Bogor',
            mapsEmbed: '',
            mapsLat: '',
            mapsLng: '',
            isCountdown: true,
        },
    ],
    gallery: DEMO_GALLERY,
    bankAccounts: [
        { bankName: 'BCA', accountNumber: '1234567890', accountName: 'Budi Santoso' },
        { bankName: 'Mandiri', accountNumber: '0987654321', accountName: 'Budi Santoso' },
    ],
    digitalWallets: [
        { provider: 'GoPay', label: 'GoPay', accountNumber: '0812-3456-7890', accountName: 'Budi Santoso', logoUrl: '' },
        { provider: 'DANA', label: 'DANA', accountNumber: '0812-3456-7890', accountName: 'Budi Santoso', logoUrl: '' },
    ],
    allowComments: true,
    rsvpEndpoint: '',
    wishesEndpoint: '',
    features: {
        cover: true,
        greeting: true,
        couple_profile: true,
        event_detail: true,
        countdown: true,
        location: true,
        gallery: true,
        video: true,
        love_story: true,
        rsvp: true,
        guestbook: true,
        wishes: true,
        digital_envelope: true,
        gift_wishlist: true,
        add_to_calendar: true,
        music: false,
        footer: true,
    },
    guestQrData: 'DEMO-QR-CHECKIN-001',
    guestSlug: 'beloved-friend',
    greeting: {
        buttonText: 'Open Royal Invitation',
        guestLabel: 'Royal Guest',
        message: 'Every birthday is a gift from God.',
        title: 'You are cordially invited to a magical royal celebration.',
    },
    celebrantName: 'Aurellia Safira Putri',
    celebrantNickname: 'Princess Aurora',
    celebrantAge: '8',
    celebrantBio: 'A bright little princess who loves drawing, dancing, and fairy tales.',
    celebrantPhoto: createIllustrationDataUri('Princess Aurora', 'Birthday Princess', '#fce7f3', '#ede9fe', '#8b5cf6'),
    parentName: 'Budi Santoso & Siti Aisyah',
    lifeJourney: DEMO_TIMELINE,
};

export default function BirthdayStarryNight({ invitation, visitor }: Props) {
    const data = invitation ?? DEMO_INVITATION;
    const [opened, setOpened] = useState(data.features?.cover === false);
    const [musicArmed, setMusicArmed] = useState(false);
    const [galleryFilter, setGalleryFilter] = useState('all');
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<SectionId>('hero');
    const [goalsVisible, setGoalsVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast, showToast, clearToast } = useToast();
    const [stars] = useState(() => createStars(96));
    const [balloons] = useState(() => createBalloons(12));
    const [heroDecor] = useState(() => createHeroDecor());

    const features = data.features ?? {};
    const isEnabled = (key: keyof FeatureFlags) => features[key] !== false;
    const guestLabel = visitor?.trim() || data.guestName || data.greeting?.guestLabel || 'Tamu Undangan';
    const celebrantName = data.celebrantNickname || data.celebrantName || 'Birthday Star';

    const events = data.events.length > 0 ? data.events : DEMO_INVITATION.events;
    const mainEvent = events[0];
    const profilePhoto = invitation ? data.celebrantPhoto : DEMO_INVITATION.celebrantPhoto;
    const galleryItems = data.gallery.length > 0 ? data.gallery : DEMO_GALLERY;
    const galleryCategories = Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean)));
    const filteredGallery = galleryFilter === 'all' ? galleryItems : galleryItems.filter((item) => item.category === galleryFilter);
    const timelineItems = data.lifeJourney?.length > 0 ? data.lifeJourney : DEMO_TIMELINE;
    // Bank/e-wallet accounts carry real payment details, so — unlike the placeholder
    // gallery/timeline content — a real invitation must never fall back to demo accounts
    // just because the couple hasn't linked any yet.
    const bankAccounts = invitation ? data.bankAccounts : DEMO_INVITATION.bankAccounts;
    const digitalWallets = invitation ? data.digitalWallets : DEMO_INVITATION.digitalWallets;
    const qrisPayload = data.guestQrData || data.guestSlug || `${data.code}-${guestLabel}`;
    const coverButtonText = data.greeting?.buttonText || 'Open Royal Invitation';
    const coverSubtitle = data.greeting?.title || 'You are cordially invited to a magical birthday celebration';
    const heroTagline = data.greeting?.message || '"Every princess deserves a magical birthday"';
    const calendarTitle = `${celebrantName} Birthday Celebration`;
    const mainMapsUrl = mainEvent ? buildMapsUrl(mainEvent) : '';
    const videoEmbedUrl = getVideoEmbedUrl(data.coupleVideoUrl ?? '');

    const visibleNavItems = SECTION_ORDER.filter((item) => {
        if (!NAV_SECTION_IDS.includes(item.id)) {
            return false;
        }

        switch (item.id) {
            case 'profile':
                return isEnabled('couple_profile');
            case 'event':
                return isEnabled('event_detail');
            case 'timeline':
                return isEnabled('love_story');
            case 'gallery':
                return isEnabled('gallery');
            case 'gift':
                return isEnabled('digital_envelope');
            default:
                return true;
        }
    });

    const visibleSectionKey = visibleNavItems.map((item) => item.id).join('|');

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: 48 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: 1 + Math.random() * 2,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            color: ['#f9a8d4', '#c4b5fd', '#fbbf24', '#bae6fd'][Math.floor(Math.random() * 4)],
            alpha: 0.25 + Math.random() * 0.5,
        }));

        let raf = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            raf = window.requestAnimationFrame(animate);
        };

        animate();
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = opened ? 'auto' : 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const revealTargets = document.querySelectorAll('.sn-fade-up, .sn-fade-left, .sn-fade-right');
        if (revealTargets.length === 0) return;

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('sn-visible');
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.15 },
        );

        revealTargets.forEach((el) => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const ids = visibleNavItems.map((item) => item.id);
        const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        if (elements.length === 0) return;

        setActiveSection(ids[0] ?? 'hero');
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!visible) return;
                const id = visible.target.id as SectionId;
                setActiveSection(id);
                if (id === 'goals') setGoalsVisible(true);
            },
            { threshold: [0.25, 0.45, 0.65] },
        );

        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [opened, visibleSectionKey]);

    useEffect(() => {
        if (lightboxIdx === null) return;
        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLightboxIdx(null);
                return;
            }
            if (filteredGallery.length === 0) return;
            if (event.key === 'ArrowLeft') {
                setLightboxIdx((current) => (current === null ? null : (current - 1 + filteredGallery.length) % filteredGallery.length));
            }
            if (event.key === 'ArrowRight') {
                setLightboxIdx((current) => (current === null ? null : (current + 1) % filteredGallery.length));
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIdx, filteredGallery.length]);

    const handleOpen = () => {
        setOpened(true);
        setMusicArmed(true);
    };

    const handleScrollTo = (id: SectionId) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleGoogleCalendar = () => {
        if (!mainEvent) return;
        window.open(buildGoogleCalendarUrl(mainEvent, calendarTitle), '_blank', 'noopener,noreferrer');
    };

    const handleOutlookCalendar = () => {
        if (!mainEvent) return;
        window.open(buildOutlookCalendarUrl(mainEvent, calendarTitle), '_blank', 'noopener,noreferrer');
    };

    const handleAppleCalendar = () => {
        if (!mainEvent) return;
        downloadIcs(mainEvent, calendarTitle);
    };

    const profileFacts = [
        { icon: '🎂', label: 'Birthday Name', value: data.celebrantName || celebrantName },
        { icon: '🎈', label: 'Age', value: data.celebrantAge ? `${data.celebrantAge} Years Old` : 'Sweet Birthday' },
        { icon: '👪', label: 'Parents', value: data.parentName || 'Family' },
        { icon: '💌', label: 'About', value: data.celebrantBio || 'A cheerful little princess who loves bright colors and magical stories.' },
        { icon: '📅', label: 'Celebration', value: mainEvent?.dateFormatted || data.mainDateFormatted },
        { icon: '✨', label: 'Guest', value: guestLabel },
    ];

    const qrisWallet = digitalWallets.find((wallet) => wallet.qrisQrUrl);

    return (
        <div className="sn-root">
            <canvas ref={canvasRef} className="sn-particles-canvas" />

            {isEnabled('cover') && (
                <div className={cx('sn-cover', opened && 'hidden')}>
                    <div className="sn-stars-bg">
                        {stars.map((star, index) => (
                            <span
                                key={index}
                                className="sn-star-dot"
                                style={{
                                    left: star.left,
                                    top: star.top,
                                    width: star.size,
                                    height: star.size,
                                    animationDelay: star.delay,
                                    animationDuration: star.duration,
                                    background: star.color,
                                }}
                            />
                        ))}
                    </div>

                    <div className="sn-balloon-layer" aria-hidden="true">
                        {balloons.map((balloon, index) => (
                            <span
                                key={index}
                                className="sn-balloon"
                                style={{
                                    left: balloon.left,
                                    animationDelay: balloon.delay,
                                    animationDuration: balloon.duration,
                                }}
                            >
                                <svg width={balloon.size} height={balloon.size * 1.2} viewBox="0 0 40 55">
                                    <ellipse cx="20" cy="20" rx="18" ry="20" fill={balloon.color} opacity=".9" />
                                    <line x1="20" y1="40" x2="20" y2="55" stroke={balloon.color} strokeWidth="1.5" opacity=".7" />
                                </svg>
                            </span>
                        ))}
                    </div>

                    <div className="sn-cover-castle">
                        <CastleIllustration />
                    </div>

                    <div className="sn-cover-content">
                        <p className="sn-cover-tag">✨ Royal Birthday Invitation ✨</p>
                        <p className="sn-cover-subtitle">{coverSubtitle}</p>
                        <div className="sn-cover-name">{celebrantName}</div>
                        {data.celebrantAge && <p className="sn-cover-age">🎂 Turning {data.celebrantAge} Years Old 👑</p>}
                        {mainEvent && <p className="sn-cover-date">📅 {mainEvent.dateFormatted}</p>}
                        <p className="sn-cover-guest">
                            Dear <span>{guestLabel}</span>
                        </p>
                        {data.guestQrData && (
                            <div className="sn-cover-qr">
                                <GuestQrCode
                                    data={data.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(196,181,253,0.5)' }}
                                />
                                <p>QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="sn-btn-open" onClick={handleOpen} type="button">
                            <span>{coverButtonText}</span>
                        </button>
                    </div>
                </div>
            )}

            <main className={cx('sn-main', opened && 'is-open')}>
                <nav className="sn-quick-nav sn-glass-card" aria-label="Section navigation">
                    {visibleNavItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={cx('sn-nav-chip', activeSection === item.id && 'active')}
                            onClick={() => handleScrollTo(item.id)}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {isEnabled('greeting') && (
                    <section id="hero" className="sn-section sn-hero">
                        <div className="sn-container sn-hero-shell">
                            {heroDecor.map((item, index) => (
                                <span
                                    key={index}
                                    className="sn-floating-deco"
                                    style={{
                                        top: item.top,
                                        left: item.left,
                                        right: item.right,
                                        bottom: item.bottom,
                                        fontSize: item.size,
                                        animationDuration: item.duration,
                                        animationDelay: item.delay,
                                    }}
                                >
                                    {item.icon}
                                </span>
                            ))}
                            <div className="sn-hero-crown">👑</div>
                            <p className="sn-hero-greeting">A Royal Celebration for</p>
                            <h1 className="sn-hero-name">{celebrantName}</h1>
                            {data.celebrantAge && <div className="sn-hero-age-badge">🎂 {data.celebrantAge} Years of Magic 🎂</div>}
                            <p className="sn-hero-tagline">{heroTagline}</p>
                            <div className="sn-hero-scroll-hint">↓</div>
                        </div>
                    </section>
                )}

                {isEnabled('couple_profile') && (
                    <section id="profile" className="sn-section sn-profile">
                        <div className="sn-container">
                            <SectionHeader badge="👑 The Birthday Princess" title="Our Little Princess" subtitle="Every princess has a unique story and this is ours" />
                            <div className="sn-profile-card sn-glass-card">
                                <div className="sn-profile-photo-panel sn-fade-left">
                                    <div className="sn-profile-photo-frame">
                                        <div
                                            className="sn-profile-photo-inner"
                                            style={
                                                profilePhoto
                                                    ? { backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                                    : undefined
                                            }
                                        >
                                            {!profilePhoto && '🌸'}
                                        </div>
                                    </div>
                                    <div className="sn-profile-fullname">{data.celebrantName}</div>
                                    <div className="sn-profile-nickname">{data.celebrantNickname}</div>
                                    <div className="sn-profile-sparkles">🌸 ✨ 👑</div>
                                </div>

                                <div className="sn-profile-details sn-fade-right">
                                    {profileFacts.map((fact, index) => (
                                        <div key={index} className="sn-profile-detail-item" style={{ animationDelay: `${index * 0.08}s` }}>
                                            <div className="sn-profile-detail-icon">{fact.icon}</div>
                                            <div>
                                                <span className="sn-profile-detail-label">{fact.label}</span>
                                                <span className="sn-profile-detail-value">{fact.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('countdown') && mainEvent && (
                    <section id="countdown" className="sn-section sn-countdown-section">
                        <div className="sn-container">
                            <SectionHeader
                                badge="⏳ Counting Down"
                                title="The Magic Begins In"
                                subtitle={`${mainEvent.dateFormatted}${mainEvent.time ? ` · ${mainEvent.time}${mainEvent.timeEnd ? ` - ${mainEvent.timeEnd}` : ''} WIB` : ''}`}
                                gold
                            />
                            <div className="sn-countdown-grid-section">
                                <Countdown
                                    targetDate={data.countdownDate}
                                    className="sn-countdown-grid"
                                    boxClassName="sn-countdown-card"
                                    numClassName="sn-countdown-num"
                                    labelClassName="sn-countdown-label"
                                    labels={{ days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }}
                                    doneMessage={
                                        <div className="sn-countdown-done">
                                            <div className="sn-countdown-done-icon">🎉</div>
                                            <h3>Happy Birthday!</h3>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('event_detail') && events.length > 0 && (
                    <section id="event" className="sn-section sn-event">
                        <div className="sn-container">
                            <SectionHeader badge="🏰 The Royal Event" title="Party Details" subtitle="A magical celebration prepared with love" />
                            <div className="sn-event-grid">
                                {events.map((event, index) => {
                                    const mapsUrl = buildMapsUrl(event);
                                    const calendarUrl = buildGoogleCalendarUrl(event, `${celebrantName} Birthday Celebration`);
                                    return (
                                        <article key={`${event.name}-${index}`} className="sn-event-card sn-glass-card sn-fade-up">
                                            <div className="sn-event-card-icon">🎉</div>
                                            <h3 className="sn-event-card-title">{event.name}</h3>
                                            <p className="sn-event-card-value">📅 {event.dateFormatted}</p>
                                            {event.time && <p className="sn-event-card-value">⏰ {event.time}{event.timeEnd ? ` - ${event.timeEnd}` : ''} WIB</p>}
                                            {(event.locationName || event.location) && (
                                                <p className="sn-event-card-value">
                                                    📍 {event.locationName}
                                                    {event.location ? `, ${event.location}` : ''}
                                                </p>
                                            )}
                                            <div className="sn-event-actions">
                                                {mapsUrl && (
                                                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="sn-btn-event">
                                                        🗺️ Maps
                                                    </a>
                                                )}
                                                <button className="sn-btn-event" onClick={() => window.open(calendarUrl, '_blank', 'noopener,noreferrer')} type="button">
                                                    📅 Calendar
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('love_story') && timelineItems.length > 0 && (
                    <section id="timeline" className="sn-section sn-timeline">
                        <div className="sn-container">
                            <SectionHeader badge="📖 Her Story" title="Life Journey" subtitle="A journey of love, laughter, and precious moments" />
                            <div className="sn-timeline-wrap">
                                {timelineItems.map((item, index) => (
                                    <div key={`${item.title}-${index}`} className="sn-timeline-item sn-fade-up">
                                        <div className="sn-timeline-dot-col">
                                            <div className="sn-timeline-dot">✨</div>
                                        </div>
                                        <div className="sn-timeline-content-box sn-glass-card">
                                            {item.photo && (
                                                <div className="sn-timeline-content-photo" style={{ backgroundImage: `url(${item.photo})` }} />
                                            )}
                                            <p className="sn-timeline-content-date">{item.date}</p>
                                            <h3 className="sn-timeline-content-title">{item.title}</h3>
                                            <p className="sn-timeline-content-desc">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('gallery') && galleryItems.length > 0 && (
                    <section id="gallery" className="sn-section sn-gallery">
                        <div className="sn-container">
                            <SectionHeader badge="📸 Memories" title="Photo Gallery" subtitle="Precious moments frozen in time" />

                            {galleryCategories.length > 0 && (
                                <div className="sn-gallery-tabs">
                                    <button type="button" className={cx('sn-gallery-tab', galleryFilter === 'all' && 'active')} onClick={() => setGalleryFilter('all')}>
                                        All
                                    </button>
                                    {galleryCategories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            className={cx('sn-gallery-tab', galleryFilter === category && 'active')}
                                            onClick={() => setGalleryFilter(category)}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="sn-gallery-grid">
                                {filteredGallery.map((item, index) => (
                                    <button
                                        key={`${item.label}-${index}`}
                                        type="button"
                                        className="sn-gallery-item"
                                        style={item.url ? { backgroundImage: `url(${item.url})` } : undefined}
                                        onClick={() => setLightboxIdx(index)}
                                    >
                                        <span className="sn-gallery-item-overlay">🔍</span>
                                        {!item.url && <span className="sn-gallery-item-fallback">📷</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('video') && (
                    <section id="video-section" className="sn-section sn-video">
                        <div className="sn-container">
                            <SectionHeader
                                badge="🎬 Royal Film"
                                title="Birthday Video"
                                subtitle="A special video tribute for our birthday princess"
                                gold
                            />
                            <div className="sn-video-frame sn-fade-up">
                                {data.coupleVideoUrl ? (
                                    /\.(mp4|webm|ogg)(\?.*)?$/i.test(data.coupleVideoUrl) ? (
                                        <video controls src={data.coupleVideoUrl} />
                                    ) : /youtube|youtu\.be|vimeo|embed/i.test(data.coupleVideoUrl) && videoEmbedUrl ? (
                                        <iframe
                                            src={videoEmbedUrl}
                                            title="Birthday Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="sn-video-placeholder">
                                            <div className="sn-video-placeholder-icon">🎥</div>
                                            <p>Birthday Video</p>
                                            <small>Video URL diterima, silakan sesuaikan embed jika diperlukan.</small>
                                        </div>
                                    )
                                ) : (
                                    <div className="sn-video-placeholder">
                                        <div className="sn-video-placeholder-icon">▶</div>
                                        <p>Birthday Video</p>
                                        <small>Replace this placeholder with your YouTube or MP4 video.</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('location') && mainEvent && (
                    <section id="maps" className="sn-section sn-maps">
                        <div className="sn-container">
                            <SectionHeader
                                badge="📍 Location"
                                title="Find the Castle"
                                subtitle={buildLocation(mainEvent) || 'View the party location below'}
                                gold
                            />
                            {mainEvent.mapsEmbed ? (
                                <div className="sn-map-wrap sn-fade-up">
                                    <iframe src={mainEvent.mapsEmbed} loading="lazy" title="Lokasi" allowFullScreen />
                                </div>
                            ) : (
                                <div className="sn-map-placeholder sn-fade-up">
                                    <div className="sn-map-placeholder-icon">🗺️</div>
                                    <h3>{mainEvent.locationName || 'Royal Garden Hall'}</h3>
                                    <p>{mainEvent.location || 'Jl. Bunga Raya No. 12, Ciawi, Bogor, West Java 16760'}</p>
                                </div>
                            )}

                            <div className="sn-map-actions">
                                {mainMapsUrl && (
                                    <a href={mainMapsUrl} target="_blank" rel="noreferrer" className="sn-btn-maps">
                                        🗺️ Open Google Maps
                                    </a>
                                )}
                                {mainEvent.location && (
                                    <button
                                        type="button"
                                        className="sn-btn-maps sn-btn-maps-secondary"
                                        onClick={() => copyText(mainEvent.location, 'Alamat', showToast)}
                                    >
                                        📋 Copy Address
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('rsvp') && (
                    <section id="rsvp" className="sn-section sn-rsvp">
                        <div className="sn-container">
                            <SectionHeader badge="✉️ RSVP" title="Will You Join Us?" subtitle="Please confirm your attendance and help us prepare" />
                            <RSVPForm
                                rsvpEndpoint={data.rsvpEndpoint}
                                guestName={visitor || data.guestName}
                                guestSlug={data.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'sn-rsvp-form sn-glass-card',
                                    label: 'sn-form-label',
                                    input: 'sn-form-input',
                                    select: 'sn-form-select',
                                    textarea: 'sn-form-textarea',
                                    radioGroup: 'sn-rsvp-radio-group',
                                    radioLabel: 'sn-rsvp-radio-label',
                                    errorText: 'sn-rsvp-error',
                                    submitBtn: 'sn-rsvp-submit',
                                    successBox: 'sn-rsvp-success sn-glass-card',
                                }}
                                labels={{
                                    name: 'Nama Lengkap *',
                                    guests: 'Jumlah Tamu',
                                    attendance: 'Konfirmasi Kehadiran *',
                                    attending: "🎉 Yes, I'll Be There!",
                                    notAttending: '😢 Regretfully Declining',
                                    maybe: '🤔 Maybe',
                                    message: 'Pesan / Doa',
                                    submit: '✨ Send RSVP ✨',
                                    successTitle: "🎉 Thank you! We can't wait to see you!",
                                    successSub: 'See you at the party!',
                                }}
                            />
                        </div>
                    </section>
                )}

                {isEnabled('wishes') && (
                    <section id="wishes" className="sn-section sn-wishes">
                        <div className="sn-container">
                            <SectionHeader badge="💌 Guest Book" title="Leave a Royal Wish" subtitle="Share your warmest birthday wishes" />
                            <WishesSection
                                wishesEndpoint={data.wishesEndpoint}
                                allowComments={data.allowComments}
                                initialWishes={DEMO_WISHES}
                                onToast={showToast}
                                styles={{
                                    container: 'sn-wishes-layout',
                                    formBox: 'sn-wish-form sn-glass-card',
                                    formTitle: 'sn-wish-form-title',
                                    nameInput: 'sn-wish-input',
                                    messageInput: 'sn-wish-textarea',
                                    submitBtn: 'sn-wish-submit',
                                    wishCard: 'sn-wish-card',
                                    wishAvatar: 'sn-wish-avatar',
                                    wishName: 'sn-wish-name',
                                    wishDate: 'sn-wish-date',
                                    wishMessage: 'sn-wish-message',
                                    loadMoreBtn: 'sn-wish-load-more',
                                }}
                            />
                        </div>
                    </section>
                )}

                {isEnabled('digital_envelope') && (bankAccounts.length > 0 || digitalWallets.length > 0) && (
                    <section id="gift" className="sn-section sn-gift">
                        <div className="sn-container">
                            <SectionHeader
                                badge="🎁 Royal Gifts"
                                title="Send a Gift"
                                subtitle="Your presence is the greatest gift, but if you'd like to share some love"
                                gold
                            />
                            <div className="sn-gift-grid">
                                {bankAccounts.map((bank, index) => (
                                    <article key={`${bank.bankName}-${index}`} className="sn-gift-card">
                                        <div className="sn-gift-card-logo">🏦</div>
                                        <div className="sn-gift-card-name">{bank.bankName}</div>
                                        <div className="sn-gift-card-number">{bank.accountNumber}</div>
                                        <div className="sn-gift-card-owner">a/n {bank.accountName}</div>
                                        <button className="sn-gift-copy-btn" type="button" onClick={() => copyText(bank.accountNumber, `No. Rekening ${bank.bankName}`, showToast)}>
                                            📋 Copy
                                        </button>
                                    </article>
                                ))}

                                {digitalWallets.map((wallet, index) => (
                                    <article key={`${wallet.provider}-${index}`} className="sn-gift-card">
                                        {wallet.logoUrl ? (
                                            <img src={wallet.logoUrl} alt={wallet.label || wallet.provider} className="sn-gift-card-logo-img" />
                                        ) : (
                                            <div className="sn-gift-card-logo">💳</div>
                                        )}
                                        <div className="sn-gift-card-name">{wallet.label || wallet.provider}</div>
                                        <div className="sn-gift-card-number">{wallet.accountNumber}</div>
                                        <div className="sn-gift-card-owner">{wallet.accountName}</div>
                                        <button className="sn-gift-copy-btn" type="button" onClick={() => copyText(wallet.accountNumber, wallet.label || wallet.provider, showToast)}>
                                            📋 Copy
                                        </button>
                                    </article>
                                ))}
                            </div>

                            <div className="sn-qris-card sn-fade-up">
                                <div className="sn-gift-card-name" style={{ color: 'var(--sn-gold)' }}>
                                    QRIS Payment
                                </div>
                                <div className="sn-qris-box">
                                    {qrisWallet?.qrisQrUrl ? (
                                        <img src={qrisWallet.qrisQrUrl} alt="QRIS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <GuestQrCode data={qrisPayload} size={160} style={{ borderRadius: '12px' }} />
                                    )}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,.65)', fontSize: '.75rem' }}>Scan with any payment app</div>
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('gift_wishlist') && (
                    <>
                        <section id="wishlist" className="sn-section sn-wishlist">
                            <div className="sn-container">
                                <SectionHeader badge="🌟 Gift Guide" title="Princess Wishlist" subtitle="Things our princess would love for her birthday" />
                                <div className="sn-wishlist-grid">
                                    {DEMO_WISHLIST.map((item, index) => (
                                        <article key={`${item.name}-${index}`} className="sn-wishlist-item sn-glass-card sn-fade-up">
                                            <div className="sn-wishlist-icon">{item.icon}</div>
                                            <div className="sn-wishlist-name">{item.name}</div>
                                            <div className="sn-wishlist-desc">{item.desc}</div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="goals" className="sn-section sn-goals">
                            <div className="sn-container">
                                <SectionHeader badge="🌟 Royal Dreams" title="Dream Goals" subtitle="Help our princess achieve her royal dreams" />
                                <div className="sn-goals-grid">
                                    {DEMO_GOALS.map((goal, index) => (
                                        <article key={`${goal.name}-${index}`} className="sn-goal-card sn-glass-card sn-fade-up">
                                            <div className="sn-goal-icon">{goal.icon}</div>
                                            <div className="sn-goal-name">{goal.name}</div>
                                            <div className="sn-goal-amount">Target: {goal.target}</div>
                                            <div className="sn-goal-progress-wrap">
                                                <div
                                                    className="sn-goal-progress-bar"
                                                    style={{ width: goalsVisible ? `${goal.percent}%` : '0%' }}
                                                />
                                            </div>
                                            <div className="sn-goal-percent">{goal.percent}% achieved</div>
                                            <div className="sn-goal-msg">{goal.note}</div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {isEnabled('add_to_calendar') && mainEvent && (
                    <section id="calendar-section" className="sn-section sn-calendar">
                        <div className="sn-container">
                            <SectionHeader
                                badge="📅 Save the Date"
                                title="Add to Calendar"
                                subtitle="Don't miss the magical day and save it to your calendar!"
                            />
                            <div className="sn-calendar-grid">
                                <div className="sn-calendar-card sn-glass-card sn-fade-up">
                                    <div className="sn-calendar-summary-icon">📅</div>
                                    <div className="sn-calendar-summary-title">{calendarTitle}</div>
                                    <div className="sn-calendar-summary-date">
                                        {mainEvent.dateFormatted}
                                        {mainEvent.time ? ` · ${mainEvent.time}${mainEvent.timeEnd ? ` - ${mainEvent.timeEnd}` : ''}` : ''}
                                    </div>
                                    <div className="sn-calendar-summary-location">{buildLocation(mainEvent) || 'Royal Garden Hall'}</div>
                                </div>
                            </div>
                            <div className="sn-calendar-buttons">
                                <button type="button" className="sn-btn-cal sn-btn-cal-google" onClick={handleGoogleCalendar}>
                                    Google Calendar
                                </button>
                                <button type="button" className="sn-btn-cal sn-btn-cal-apple" onClick={handleAppleCalendar}>
                                    Apple Calendar
                                </button>
                                <button type="button" className="sn-btn-cal sn-btn-cal-outlook" onClick={handleOutlookCalendar}>
                                    Outlook Calendar
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {isEnabled('footer') && (
                    <footer className="sn-footer">
                        <span className="sn-footer-script">{celebrantName}</span>
                        <p className="sn-footer-age">{data.celebrantAge ? `${data.celebrantAge}th Birthday Celebration` : 'Birthday Celebration'}</p>
                        {mainEvent && <p className="sn-footer-date">{mainEvent.dateFormatted}</p>}
                        <div className="sn-footer-hearts">💜 🌸 👑 🌸 💜</div>
                        <p className="sn-footer-credit">Made with love for our little princess ✨</p>
                    </footer>
                )}
            </main>

            {isEnabled('music') && data.music?.url && (
                <MusicPlayer
                    url={data.music.url}
                    autoplay={data.music.autoplay}
                    loop={data.music.loop}
                    triggerPlay={musicArmed}
                    buttonClassName="sn-music-btn"
                />
            )}

            <Toast message={toast} onDone={clearToast} className="sn-toast" />

            {lightboxIdx !== null && filteredGallery[lightboxIdx] && (
                <div className="sn-lightbox" onClick={() => setLightboxIdx(null)}>
                    <button type="button" className="sn-lightbox-close" onClick={() => setLightboxIdx(null)}>
                        ×
                    </button>
                    <div className="sn-lightbox-content" onClick={(event) => event.stopPropagation()}>
                        <img src={filteredGallery[lightboxIdx].url} alt={filteredGallery[lightboxIdx].label || 'Gallery'} />
                        <div className="sn-lightbox-caption">{filteredGallery[lightboxIdx].label || 'Gallery moment'}</div>
                        <div className="sn-lightbox-nav">
                            <button
                                type="button"
                                className="sn-btn-event"
                                onClick={() =>
                                    setLightboxIdx((current) => (current === null ? null : (current - 1 + filteredGallery.length) % filteredGallery.length))
                                }
                            >
                                ← Prev
                            </button>
                            <button
                                type="button"
                                className="sn-btn-event"
                                onClick={() => setLightboxIdx((current) => (current === null ? null : (current + 1) % filteredGallery.length))}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
