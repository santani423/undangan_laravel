import GuestQrCode from '@/components/invitation/GuestQrCode';
import type { BankAccount, DigitalWallet, Greeting, InvitationEvent, LoveStoryItem, WeddingInvitation } from '@/types/invitation';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Copy,
    Gift,
    Heart,
    Image as ImageIcon,
    Landmark,
    Leaf,
    Loader2,
    MapPin,
    MessageCircleHeart,
    Music2,
    Pause,
    Play,
    Quote,
    Send,
    Sparkles,
    WalletCards,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import './wedding-theme-05.css';

type AttendanceValue = 'Hadir' | 'Tidak Hadir';
type GiftTab = 'bank' | 'ewallet';
type ToastVariant = 'success' | 'error' | 'info';

interface Theme05Props {
    invitation?: Partial<WeddingInvitation>;
    visitor?: string;
    greeting?: Greeting;
}

interface ToastState {
    id: number;
    message: string;
    variant: ToastVariant;
}

interface WishEntry {
    name: string;
    attendance: AttendanceValue;
    message: string;
    date: string;
}

interface RsvpState {
    name: string;
    phone: string;
    guests: string;
    attendance: AttendanceValue;
    notes: string;
}

interface WishFormState {
    name: string;
    attendance: AttendanceValue;
    message: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    guests?: string;
    message?: string;
}

interface TimelineCardProps {
    item: LoveStoryItem;
    index: number;
}

interface EventCardProps {
    event: InvitationEvent;
    index: number;
    onNavigate: (url: string) => void;
}

interface ProfileCardProps {
    role: string;
    nickname: string;
    fullName: string;
    childOrder: string;
    father: string;
    mother: string;
    bio: string;
    photo: string;
    initials: string;
    align?: 'left' | 'right';
}

interface SectionHeaderProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    light?: boolean;
    icon?: LucideIcon;
}

interface CountdownTime {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    complete: boolean;
}

interface ThemedData {
    coverEnabled: boolean;
    greetingEnabled: boolean;
    coupleEnabled: boolean;
    eventEnabled: boolean;
    locationEnabled: boolean;
    storyEnabled: boolean;
    galleryEnabled: boolean;
    dresscodeEnabled: boolean;
    giftEnabled: boolean;
    rsvpEnabled: boolean;
    wishesEnabled: boolean;
    musicEnabled: boolean;
    footerEnabled: boolean;
    musicAutoplay: boolean;
    musicLoop: boolean;
    musicUrl: string;
    mainTitle: string;
    pageTitle: string;
    guestName: string;
    guestDisplayName: string;
    greeting: Greeting;
    heroPhoto: string;
    couplePhoto: string;
    groomFullName: string;
    groomNickname: string;
    groomInitials: string;
    groomChildOrder: string;
    groomFather: string;
    groomMother: string;
    groomBio: string;
    groomPhoto: string;
    brideFullName: string;
    brideNickname: string;
    brideInitials: string;
    brideChildOrder: string;
    brideFather: string;
    brideMother: string;
    brideBio: string;
    bridePhoto: string;
    openingQuote: string;
    mainDateFormatted: string;
    countdownTarget: string;
    events: InvitationEvent[];
    gallery: Array<{ url: string; label?: string; category?: string }>;
    loveStory: LoveStoryItem[];
    dressCodes: Array<{ name: string; hex: string }>;
    bankAccounts: BankAccount[];
    digitalWallets: DigitalWallet[];
    primaryLocationUrl: string;
    primaryMapsEmbed: string;
    primaryLocationTitle: string;
    primaryLocationAddress: string;
    rsvpEndpoint: string;
    wishesEndpoint: string;
    allowComments: boolean;
    slug: string;
    guestSlug?: string;
    guestQrData?: string;
}

const FONT_GOOGLE = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Parisienne&display=swap";

const ASSETS = {
    cover: new URL('./assets/image55.jpeg', import.meta.url).href,
    bride: new URL('./assets/image52.jpeg', import.meta.url).href,
    groom: new URL('./assets/image55.jpeg', import.meta.url).href,
    map: new URL('./slide_images/slide6.png', import.meta.url).href,
    slide1: new URL('./slide_images/slide1.png', import.meta.url).href,
    slide2: new URL('./slide_images/slide2.png', import.meta.url).href,
    slide3: new URL('./slide_images/slide3.png', import.meta.url).href,
    slide4: new URL('./slide_images/slide4.png', import.meta.url).href,
    slide5: new URL('./slide_images/slide5.png', import.meta.url).href,
    slide6: new URL('./slide_images/slide6.png', import.meta.url).href,
    slide7: new URL('./slide_images/slide7.png', import.meta.url).href,
    leaf1: new URL('./assets/image22.png', import.meta.url).href,
    leaf2: new URL('./assets/image30.png', import.meta.url).href,
    leaf3: new URL('./assets/image31.png', import.meta.url).href,
    leaf4: new URL('./assets/image32.png', import.meta.url).href,
    audio: new URL('./assets/media1.mp3', import.meta.url).href,
} as const;

const DEFAULT_GREETING: Greeting = {
    title: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    guestLabel: 'Tamu Undangan',
    buttonText: 'Buka Undangan',
    message:
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
};

const DEFAULT_EVENTS: InvitationEvent[] = [
    {
        name: 'Akad Nikah',
        date: '2026-09-14',
        dateFormatted: 'Senin, 14 September 2026',
        time: '09:00',
        timeEnd: '10:30',
        locationName: 'Kediaman Mempelai Wanita',
        location: 'Jl. Jendral Sudirman I, Petapahan, Kampar, Riau',
        locationUrl: 'https://www.google.com/maps/search/?api=1&query=Jl.%20Jendral%20Sudirman%20I%2C%20Petapahan%2C%20Kampar%2C%20Riau',
        mapsEmbed: 'https://www.google.com/maps?q=Petapahan%2C%20Kec.%20Tapung%2C%20Kabupaten%20Kampar%2C%20Riau&output=embed',
        mapsLat: '0.8261314981146747',
        mapsLng: '101.07727196653133',
        isCountdown: true,
    },
    {
        name: 'Resepsi',
        date: '2026-09-14',
        dateFormatted: 'Senin, 14 September 2026',
        time: '11:00',
        timeEnd: '14:00',
        locationName: 'Kediaman Mempelai Wanita',
        location: 'Jl. Jendral Sudirman I, Petapahan, Kampar, Riau',
        locationUrl: 'https://www.google.com/maps/search/?api=1&query=Jl.%20Jendral%20Sudirman%20I%2C%20Petapahan%2C%20Kampar%2C%20Riau',
        mapsEmbed: 'https://www.google.com/maps?q=Petapahan%2C%20Kec.%20Tapung%2C%20Kabupaten%20Kampar%2C%20Riau&output=embed',
        mapsLat: '0.8261314981146747',
        mapsLng: '101.07727196653133',
        isCountdown: false,
    },
];

const DEFAULT_GALLERY = [
    { url: ASSETS.slide1, label: 'Cover slide', category: 'cover' },
    { url: ASSETS.slide2, label: 'Detail dekorasi', category: 'decor' },
    { url: ASSETS.slide3, label: 'Profil mempelai', category: 'couple' },
    { url: ASSETS.slide4, label: 'Jadwal acara', category: 'events' },
    { url: ASSETS.slide5, label: 'Ucapan tamu', category: 'wishes' },
    { url: ASSETS.slide6, label: 'Denah lokasi', category: 'location' },
    { url: ASSETS.slide7, label: 'Penutup', category: 'closing' },
    { url: ASSETS.cover, label: 'Momen utama', category: 'couple' },
    { url: ASSETS.bride, label: 'Putri Aisyah', category: 'couple' },
];

const DEFAULT_STORY: LoveStoryItem[] = [
    {
        date: '10 Oktober 2017',
        title: 'Awal Pertemuan',
        desc: 'Pertama kali bertemu di bangku kuliah, berawal dari tugas kelompok yang perlahan menumbuhkan kedekatan.',
        photo: ASSETS.slide3,
    },
    {
        date: '15 Juni 2018',
        title: 'Menjalin Komitmen',
        desc: 'Setelah saling mengenal lebih dekat, kami memutuskan untuk melangkah bersama ke arah yang lebih serius.',
        photo: ASSETS.slide4,
    },
    {
        date: '14 April 2025',
        title: 'Lamaran',
        desc: 'Keluarga besar bertemu dalam suasana hangat untuk merencanakan hari bahagia yang kami nantikan.',
        photo: ASSETS.slide5,
    },
    {
        date: '14 September 2026',
        title: 'Menuju Hari Bahagia',
        desc: 'Dengan doa dan restu keluarga, kami bersiap mengikat janji suci dalam ikatan pernikahan.',
        photo: ASSETS.slide7,
    },
];

const DEFAULT_DRESS_CODES = [
    { name: 'Sage Green', hex: '#8A9A86' },
    { name: 'Olive Green', hex: '#606C38' },
    { name: 'Cream Gold', hex: '#DDA15E' },
    { name: 'Emerald', hex: '#2D5A27' },
    { name: 'Terracotta', hex: '#BC6C25' },
];

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
    { bankName: 'BANK MANDIRI', accountNumber: '1234567890', accountName: 'PUTRI AISYAH' },
    { bankName: 'BANK BCA', accountNumber: '0987654321', accountName: 'PUTRA SULUNG' },
];

const DEFAULT_DIGITAL_WALLETS: DigitalWallet[] = [
    { provider: 'DANA', label: 'DANA / GoPay', accountNumber: '081234567890', accountName: 'PUTRA SULUNG', logoUrl: '', qrisQrUrl: null },
    { provider: 'OVO', label: 'OVO', accountNumber: '081298765432', accountName: 'PUTRI AISYAH', logoUrl: '', qrisQrUrl: null },
];

const DEFAULT_WISHES: WishEntry[] = [
    {
        name: 'Dinda Lestari',
        attendance: 'Hadir',
        message: 'Selamat menempuh hidup baru, semoga menjadi keluarga yang sakinah, mawaddah, dan warahmah.',
        date: '2026-07-06T20:15:00+07:00',
    },
    {
        name: 'Budi Pratama',
        attendance: 'Hadir',
        message: 'Doa terbaik untuk Putri & Putra. Semoga lancar sampai hari H dan selalu diberkahi.',
        date: '2026-07-06T09:10:00+07:00',
    },
    {
        name: 'Siti Rahmawati',
        attendance: 'Tidak Hadir',
        message: 'Mohon maaf belum bisa hadir, semoga acara berjalan khidmat dan penuh kebahagiaan.',
        date: '2026-07-05T18:30:00+07:00',
    },
    {
        name: 'Rizky Fauzi',
        attendance: 'Hadir',
        message: 'Barakallahu laka wa baraka alaika. Semoga pernikahan kalian menjadi awal yang indah.',
        date: '2026-07-05T08:20:00+07:00',
    },
];

const WISH_AVATAR_COLORS = ['#3b6b35', '#c5a059', '#8a9a86', '#a0b8c0', '#bc6c25', '#6f8f63'];

function textValue(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || fallback;
    }
    return fallback;
}

function formatNumber(number: string): string {
    const clean = number.replace(/\D/g, '');
    if (!clean) return number;
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatDateLabel(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parsed);
}

function formatRelativeTime(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const diffMs = Date.now() - parsed.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} hari lalu`;
    return formatDateLabel(value);
}

function escapeText(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return map[char] ?? char;
    });
}

function createCalendarUrl(event: InvitationEvent): string {
    const start = buildCalendarStamp(event.date, event.time || '09:00');
    const end = buildCalendarStamp(event.date, event.timeEnd || event.time || '10:30');
    const location = [event.locationName, event.location].filter(Boolean).join(', ');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&location=${encodeURIComponent(location)}`;
}

function buildCalendarStamp(date: string, time: string): string {
    const normalizedTime = time.length <= 5 ? `${time}:00` : time;
    const parsed = new Date(`${date}T${normalizedTime}`);
    if (Number.isNaN(parsed.getTime())) return '20260914T090000Z';
    return parsed.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function calcCountdown(targetDate: string): CountdownTime {
    const target = new Date(targetDate);
    if (Number.isNaN(target.getTime())) {
        return { days: '00', hours: '00', minutes: '00', seconds: '00', complete: true };
    }

    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
        return { days: '00', hours: '00', minutes: '00', seconds: '00', complete: true };
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        complete: false,
    };
}

function loadStoredWishes(storageKey: string): WishEntry[] {
    if (typeof window === 'undefined') return [...DEFAULT_WISHES];

    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return [...DEFAULT_WISHES];

        const parsed = JSON.parse(raw) as Array<Partial<WishEntry>>;
        if (!Array.isArray(parsed)) return [...DEFAULT_WISHES];

        const normalized = parsed
            .map((item) => ({
                name: textValue(item.name, 'Tamu Undangan'),
                attendance: item.attendance === 'Tidak Hadir' ? 'Tidak Hadir' : 'Hadir',
                message: textValue(item.message, ''),
                date: textValue(item.date, new Date().toISOString()),
            }))
            .filter((item) => Boolean(item.name && item.message));

        return normalized.length > 0 ? normalized : [...DEFAULT_WISHES];
    } catch {
        return [...DEFAULT_WISHES];
    }
}

function persistWishes(storageKey: string, wishes: WishEntry[]): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(wishes));
    } catch {
        // Ignore storage issues in constrained browsers.
    }
}

function openExternal(url: string): void {
    if (typeof window === 'undefined' || !url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
}

function resolveTheme05Data(invitation?: Partial<WeddingInvitation>, visitor?: string, greeting?: Greeting): ThemedData {
    const activeGreeting = invitation?.greeting ?? greeting ?? DEFAULT_GREETING;
    const guestName = textValue(invitation?.guestName, textValue(visitor, ''));
    const bankAccounts = invitation?.bankAccounts?.length ? invitation.bankAccounts : DEFAULT_BANK_ACCOUNTS;
    const digitalWallets = invitation?.digitalWallets?.length ? invitation.digitalWallets : DEFAULT_DIGITAL_WALLETS;
    const events = invitation?.events?.length ? invitation.events : DEFAULT_EVENTS;
    const gallery = invitation?.gallery?.length ? invitation.gallery : DEFAULT_GALLERY;
    const loveStory = invitation?.loveStory?.length ? invitation.loveStory : DEFAULT_STORY;
    const dressCodes = invitation?.dressCodes?.length ? invitation.dressCodes : DEFAULT_DRESS_CODES;
    const heroPhoto = textValue(invitation?.couplePhoto, textValue(invitation?.groomPhoto, textValue(invitation?.bridePhoto, ASSETS.cover)));
    const mainEvent = events[0] ?? DEFAULT_EVENTS[0];
    const locationUrl = textValue(mainEvent.locationUrl, DEFAULT_EVENTS[0].locationUrl);
    const mapsEmbed = textValue(mainEvent.mapsEmbed, DEFAULT_EVENTS[0].mapsEmbed);

    const features = (invitation?.features ?? {}) as Record<string, boolean | undefined>;
    const featureEnabled = (key: string) => features[key] !== false;
    const allowComments = invitation?.allowComments !== false;

    return {
        coverEnabled: featureEnabled('cover'),
        greetingEnabled: featureEnabled('greeting'),
        coupleEnabled: featureEnabled('couple_profile'),
        eventEnabled: featureEnabled('event_detail'),
        locationEnabled: featureEnabled('location'),
        storyEnabled: featureEnabled('love_story'),
        galleryEnabled: featureEnabled('gallery'),
        dresscodeEnabled: true,
        giftEnabled: (featureEnabled('digital_envelope') || featureEnabled('gift_wishlist')) && (bankAccounts.length > 0 || digitalWallets.length > 0),
        rsvpEnabled: featureEnabled('rsvp'),
        wishesEnabled: featureEnabled('wishes') && allowComments,
        musicEnabled: featureEnabled('music'),
        footerEnabled: featureEnabled('footer'),
        musicAutoplay: invitation?.music?.autoplay ?? true,
        musicLoop: invitation?.music?.loop ?? true,
        musicUrl: invitation?.music?.url || ASSETS.audio,
        mainTitle: invitation?.title || 'Undangan Pernikahan',
        pageTitle: invitation?.pageTitle || 'Undangan Pernikahan: Putri & Putra',
        guestName,
        guestDisplayName: guestName || activeGreeting.guestLabel || 'Tamu Undangan',
        greeting: activeGreeting,
        heroPhoto,
        couplePhoto: heroPhoto,
        groomFullName: textValue(invitation?.groomFullName, 'Putra Sulung'),
        groomNickname: textValue(invitation?.groomNickname, 'Putra'),
        groomInitials: textValue(invitation?.groomInitials, 'PS'),
        groomChildOrder: textValue(invitation?.groomChildOrder, 'Putra pertama dari'),
        groomFather: textValue(invitation?.groomFather, 'Sugeng'),
        groomMother: textValue(invitation?.groomMother, 'Susi'),
        groomBio: textValue(invitation?.groomBio, 'Pribadi yang hangat, bertanggung jawab, dan mencintai keluarga.'),
        groomPhoto: textValue(invitation?.groomPhoto, ASSETS.groom),
        brideFullName: textValue(invitation?.brideFullName, 'Putri Aisyah'),
        brideNickname: textValue(invitation?.brideNickname, 'Putri'),
        brideInitials: textValue(invitation?.brideInitials, 'PA'),
        brideChildOrder: textValue(invitation?.brideChildOrder, 'Putri pertama dari'),
        brideFather: textValue(invitation?.brideFather, 'Dody'),
        brideMother: textValue(invitation?.brideMother, 'Aisyah'),
        brideBio: textValue(invitation?.brideBio, 'Dikenal ceria, lembut, dan selalu membawa suasana hangat di sekelilingnya.'),
        bridePhoto: textValue(invitation?.bridePhoto, ASSETS.bride),
        openingQuote: textValue(
            invitation?.openingQuote,
            'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
        ),
        mainDateFormatted: textValue(invitation?.mainDateFormatted, 'Senin, 14 September 2026'),
        countdownTarget: textValue(invitation?.countdownDate, `${mainEvent.date || '2026-09-14'}T09:00:00+07:00`),
        events,
        gallery: gallery.map((item) => ({
            url: textValue(item.url, ASSETS.cover),
            label: item.label,
            category: item.category,
        })),
        loveStory,
        dressCodes,
        bankAccounts,
        digitalWallets,
        primaryLocationUrl: locationUrl,
        primaryMapsEmbed: mapsEmbed,
        primaryLocationTitle: textValue(mainEvent.locationName, 'Kediaman Mempelai Wanita'),
        primaryLocationAddress: textValue(mainEvent.location, 'Jl. Jendral Sudirman I, Petapahan, Kampar, Riau'),
        rsvpEndpoint: textValue(invitation?.rsvpEndpoint, ''),
        wishesEndpoint: textValue(invitation?.wishesEndpoint, ''),
        allowComments,
        slug: textValue(invitation?.slug, 'wedding-theme-05'),
        guestSlug: invitation?.guestSlug,
        guestQrData: invitation?.guestQrData,
    };
}

function SectionHeader({ eyebrow, title, subtitle, light = false, icon: Icon }: SectionHeaderProps) {
    return (
        <div className={`wt5-section-head wt5-reveal${light ? ' wt5-section-head--light' : ''}`}>
            <span className="wt5-eyebrow">
                {Icon ? <Icon size={16} strokeWidth={1.8} /> : null}
                {eyebrow}
            </span>
            <h2 className="wt5-section-title">{title}</h2>
            {subtitle ? <p className="wt5-section-subtitle">{subtitle}</p> : null}
        </div>
    );
}

function CountdownStrip({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => calcCountdown(targetDate));

    useEffect(() => {
        setTimeLeft(calcCountdown(targetDate));
        const timer = window.setInterval(() => {
            setTimeLeft(calcCountdown(targetDate));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="wt5-countdown" aria-label="Hitung mundur menuju hari bahagia">
            <div className="wt5-countdown-cell">
                <span className="wt5-countdown-num">{timeLeft.days}</span>
                <span className="wt5-countdown-label">Hari</span>
            </div>
            <div className="wt5-countdown-cell">
                <span className="wt5-countdown-num">{timeLeft.hours}</span>
                <span className="wt5-countdown-label">Jam</span>
            </div>
            <div className="wt5-countdown-cell">
                <span className="wt5-countdown-num">{timeLeft.minutes}</span>
                <span className="wt5-countdown-label">Menit</span>
            </div>
            <div className="wt5-countdown-cell">
                <span className="wt5-countdown-num">{timeLeft.seconds}</span>
                <span className="wt5-countdown-label">Detik</span>
            </div>
        </div>
    );
}

function ProfileCard({
    role,
    nickname,
    fullName,
    childOrder,
    father,
    mother,
    bio,
    photo,
    initials,
    align = 'left',
}: ProfileCardProps) {
    return (
        <article className={`wt5-profile-card wt5-reveal wt5-profile-card--${align}`}>
            <div className="wt5-profile-photo">
                <img src={photo} alt={fullName} loading="lazy" />
            </div>
            <div className="wt5-profile-copy">
                <span className="wt5-profile-role">{role}</span>
                <h3 className="wt5-profile-name">{nickname}</h3>
                <p className="wt5-profile-fullname">{fullName}</p>
                <p className="wt5-profile-parents">
                    {childOrder}:
                    <br />
                    <strong>Bapak {father}</strong>
                    <br />
                    <strong>Ibu {mother}</strong>
                </p>
                <p className="wt5-profile-bio">{bio}</p>
                <span className="wt5-profile-initials" aria-hidden="true">
                    {initials}
                </span>
            </div>
        </article>
    );
}

function EventCard({ event, index, onNavigate }: EventCardProps) {
    const isPrimary = index === 0;

    return (
        <article className={`wt5-event-card wt5-reveal${isPrimary ? ' wt5-event-card--primary' : ''}`}>
            <div className="wt5-event-card__icon">
                {isPrimary ? <Heart size={18} fill="currentColor" /> : <CalendarDays size={18} />}
            </div>
            <span className="wt5-event-chip">{isPrimary ? 'Countdown' : 'Acara'}</span>
            <h3 className="wt5-event-title">{event.name}</h3>
            <ul className="wt5-event-details">
                <li>
                    <strong>{event.dateFormatted}</strong>
                </li>
                <li>
                    <Clock3 size={14} />
                    {event.time} WIB s/d {event.timeEnd} WIB
                </li>
                <li>
                    <MapPin size={14} />
                    {event.locationName}
                </li>
                <li>{event.location}</li>
            </ul>
            <div className="wt5-event-actions">
                <button type="button" className="wt5-btn wt5-btn--ghost wt5-btn--small" onClick={() => onNavigate(event.locationUrl)}>
                    <MapPin size={16} />
                    Buka Maps
                </button>
                <button type="button" className="wt5-btn wt5-btn--accent wt5-btn--small" onClick={() => onNavigate(createCalendarUrl(event))}>
                    <CalendarDays size={16} />
                    Kalender
                </button>
            </div>
        </article>
    );
}

function TimelineCard({ item, index }: TimelineCardProps) {
    return (
        <article className={`wt5-timeline-item wt5-reveal${index % 2 === 1 ? ' wt5-timeline-item--reverse' : ''}`}>
            <div className="wt5-timeline-dot" aria-hidden="true" />
            <div className="wt5-timeline-content">
                {item.photo ? (
                    <div className="wt5-timeline-photo">
                        <img src={item.photo} alt={item.title} loading="lazy" />
                    </div>
                ) : null}
                <div className="wt5-timeline-copy">
                    <p className="wt5-timeline-date">{item.date}</p>
                    <h3 className="wt5-timeline-title">{item.title}</h3>
                    <p className="wt5-timeline-text">{item.desc}</p>
                </div>
            </div>
        </article>
    );
}

function WishCard({ wish, index }: { wish: WishEntry; index: number }) {
    const avatar = wish.name.trim().charAt(0).toUpperCase() || 'T';
    const avatarColor = WISH_AVATAR_COLORS[index % WISH_AVATAR_COLORS.length];

    return (
        <article className="wt5-wish-card">
            <div className="wt5-wish-head">
                <div className="wt5-wish-avatar" style={{ background: avatarColor }}>
                    {avatar}
                </div>
                <div className="wt5-wish-meta">
                    <p className="wt5-wish-name">{wish.name}</p>
                    <p className="wt5-wish-time">{formatRelativeTime(wish.date)}</p>
                </div>
                <span className={`wt5-wish-badge${wish.attendance === 'Tidak Hadir' ? ' wt5-wish-badge--absent' : ''}`}>{wish.attendance}</span>
            </div>
            <p className="wt5-wish-message">{wish.message}</p>
        </article>
    );
}

function CopyActionButton({
    text,
    label,
    onCopy,
}: {
    text: string;
    label: string;
    onCopy: (message: string, variant?: ToastVariant) => void;
}) {
    return (
        <button
            type="button"
            className="wt5-btn wt5-btn--ghost wt5-btn--small wt5-copy-btn"
            onClick={async () => {
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = text;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                    }
                    onCopy(`${label} berhasil disalin.`);
                } catch {
                    onCopy('Gagal menyalin ke clipboard.', 'error');
                }
            }}
        >
            <Copy size={14} />
            Salin
        </button>
    );
}

export default function WeddingTheme05({ invitation, visitor, greeting }: Theme05Props) {
    const data = useMemo(() => resolveTheme05Data(invitation, visitor, greeting), [invitation, visitor, greeting]);
    const contentRef = useRef<HTMLElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [opened, setOpened] = useState(!data.coverEnabled);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [activeGiftTab, setActiveGiftTab] = useState<GiftTab>(data.bankAccounts.length > 0 ? 'bank' : 'ewallet');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [visibleWishes, setVisibleWishes] = useState(3);
    const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
    const [wishSubmitting, setWishSubmitting] = useState(false);
    const [rsvpErrors, setRsvpErrors] = useState<FormErrors>({});
    const [wishErrors, setWishErrors] = useState<FormErrors>({});
    const wishesStorageKey = `wt5-wishes-${data.slug || 'default'}`;
    const rsvpStorageKey = `wt5-rsvps-${data.slug || 'default'}`;
    const [wishes, setWishes] = useState<WishEntry[]>(() => loadStoredWishes(wishesStorageKey));
    const [rsvpState, setRsvpState] = useState<RsvpState>(() => ({
        name: data.guestName || '',
        phone: '',
        guests: '1',
        attendance: 'Hadir',
        notes: '',
    }));
    const [wishForm, setWishForm] = useState<WishFormState>(() => ({
        name: data.guestName || '',
        attendance: 'Hadir',
        message: '',
    }));

    const showToast = (message: string, variant: ToastVariant = 'success') => {
        setToast({ id: Date.now(), message, variant });
    };

    const openInvitation = () => {
        if (!opened) setOpened(true);
        requestAnimationFrame(() => {
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        });
        if (data.musicEnabled && data.musicAutoplay) {
            void playMusic();
        }
    };

    async function playMusic() {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            await audio.play();
            setIsMusicPlaying(true);
        } catch {
            setIsMusicPlaying(false);
        }
    }

    async function toggleMusic() {
        const audio = audioRef.current;
        if (!audio || !data.musicEnabled) return;

        if (!audio.paused) {
            audio.pause();
            setIsMusicPlaying(false);
            return;
        }

        try {
            await audio.play();
            setIsMusicPlaying(true);
        } catch {
            showToast('Browser memblokir pemutaran audio. Coba tekan tombol musik lagi.', 'error');
        }
    }

    function handleExternalNavigate(url: string) {
        if (!url) return;
        openExternal(url);
    }

    function resetMusicState() {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        setIsMusicPlaying(false);
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = data.musicUrl;
        audio.loop = data.musicLoop;
        audio.preload = 'metadata';
    }, [data.musicUrl, data.musicLoop]);

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        if (!opened) return;
        const root = contentRef.current;
        if (!root) return;

        const revealTargets = Array.from(root.querySelectorAll<HTMLElement>('.wt5-reveal'));
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { root, threshold: 0.18 },
        );

        revealTargets.forEach((target) => revealObserver.observe(target));

        return () => {
            revealObserver.disconnect();
        };
    }, [opened, wishes.length]);

    useEffect(() => {
        persistWishes(wishesStorageKey, wishes);
    }, [wishes, wishesStorageKey]);

    useEffect(() => {
        if (lightboxIndex === null) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setLightboxIndex(null);
            if (event.key === 'ArrowLeft') setLightboxIndex((current) => {
                if (current === null) return current;
                return (current - 1 + data.gallery.length) % data.gallery.length;
            });
            if (event.key === 'ArrowRight') setLightboxIndex((current) => {
                if (current === null) return current;
                return (current + 1) % data.gallery.length;
            });
        };

        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [lightboxIndex, data.gallery.length]);

    useEffect(() => {
        if (opened && data.musicEnabled && data.musicAutoplay) {
            void playMusic();
        }
        if (!opened) {
            resetMusicState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, data.musicEnabled, data.musicAutoplay]);

    useEffect(() => {
        if (!data.guestName) {
            setRsvpState((current) => (current.name ? current : { ...current, name: data.guestDisplayName }));
            setWishForm((current) => (current.name ? current : { ...current, name: data.guestDisplayName }));
        }
    }, [data.guestDisplayName, data.guestName]);

    const currentGalleryItem = lightboxIndex === null ? null : data.gallery[lightboxIndex] ?? null;

    const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: FormErrors = {};
        if (!rsvpState.name.trim()) nextErrors.name = 'Nama tamu wajib diisi.';
        if (!rsvpState.phone.trim()) nextErrors.phone = 'Nomor WhatsApp wajib diisi.';
        if (rsvpState.phone.trim() && !/^[0-9+\-() ]{8,}$/.test(rsvpState.phone.trim())) {
            nextErrors.phone = 'Nomor WhatsApp tidak valid.';
        }
        if (!rsvpState.guests.trim()) nextErrors.guests = 'Jumlah tamu wajib diisi.';

        setRsvpErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setRsvpSubmitting(true);
        const payload = {
            name: rsvpState.name.trim(),
            phone: rsvpState.phone.trim(),
            guests: Number(rsvpState.guests) || 1,
            attendance: rsvpState.attendance,
            notes: rsvpState.notes.trim(),
            guest_slug: data.guestSlug || data.slug,
        };

        try {
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

            const backupKey = rsvpStorageKey;
            const stored = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem(backupKey) || '[]') : [];
            const nextStored = Array.isArray(stored) ? [...stored, { ...payload, created_at: new Date().toISOString() }] : [{ ...payload, created_at: new Date().toISOString() }];
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(backupKey, JSON.stringify(nextStored));
            }

            showToast('Konfirmasi RSVP tersimpan.');
            setRsvpState({
                name: data.guestName || '',
                phone: '',
                guests: '1',
                attendance: 'Hadir',
                notes: '',
            });
        } catch {
            showToast('Gagal mengirim RSVP. Silakan coba lagi.', 'error');
        } finally {
            setRsvpSubmitting(false);
        }
    };

    const handleWishSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: FormErrors = {};
        if (!wishForm.name.trim()) nextErrors.name = 'Nama pengirim wajib diisi.';
        if (!wishForm.message.trim()) nextErrors.message = 'Pesan & doa wajib diisi.';
        setWishErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setWishSubmitting(true);

        const payload: WishEntry = {
            name: wishForm.name.trim(),
            attendance: wishForm.attendance,
            message: wishForm.message.trim(),
            date: new Date().toISOString(),
        };

        try {
            if (data.wishesEndpoint) {
                void fetch(data.wishesEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        name: payload.name,
                        message: payload.message,
                        attendance: payload.attendance,
                        guest_slug: data.guestSlug || data.slug,
                    }),
                }).catch(() => undefined);
            }

            setWishes((current) => [payload, ...current]);
            showToast('Ucapan berhasil dikirim.');
            setWishForm({
                name: data.guestName || '',
                attendance: 'Hadir',
                message: '',
            });
            setVisibleWishes((current) => Math.max(current, 3));
        } catch {
            showToast('Gagal mengirim ucapan. Silakan coba lagi.', 'error');
        } finally {
            setWishSubmitting(false);
        }
    };

    return (
        <div className="wt5-root">
            <style>{`
                @import url('${FONT_GOOGLE}');
            `}</style>

            {data.musicEnabled ? (
                <audio
                    ref={audioRef}
                    className="wt5-audio"
                    src={data.musicUrl}
                    loop={data.musicLoop}
                    preload="metadata"
                    onPlay={() => setIsMusicPlaying(true)}
                    onPause={() => setIsMusicPlaying(false)}
                />
            ) : null}

            <div className={`wt5-overlay${opened ? ' wt5-overlay--opened' : ''}`} aria-hidden={opened}>
                <div className="wt5-overlay-inner">
                    <div className="wt5-overlay-heading">
                        <p className="wt5-overlay-heading__eyebrow">{data.greeting.title}</p>
                        <h1 className="wt5-overlay-heading__names">
                            {data.groomNickname} &amp; {data.brideNickname}
                        </h1>
                        <p className="wt5-overlay-heading__subtitle">{data.mainTitle}</p>
                    </div>

                    <div className="wt5-envelope-shell" onClick={openInvitation} role="presentation">
                        <div className={`wt5-envelope${opened ? ' wt5-envelope--open' : ''}`}>
                            <div className="wt5-envelope-flap wt5-envelope-flap--top" />
                            <div className="wt5-envelope-flap wt5-envelope-flap--left" />
                            <div className="wt5-envelope-flap wt5-envelope-flap--right" />
                            <div className="wt5-envelope-flap wt5-envelope-flap--bottom" />

                            <button type="button" className="wt5-envelope-seal" aria-label="Buka undangan" onClick={openInvitation}>
                                <Heart size={18} fill="currentColor" />
                            </button>

                            <div className="wt5-envelope-card">
                                <div className="wt5-envelope-card__copy">
                                    <p className="wt5-envelope-card__guest-label">{data.greeting.guestLabel}</p>
                                    <p className="wt5-envelope-card__guest-name">{data.guestDisplayName}</p>
                                </div>
                                <div className="wt5-envelope-card__actions">
                                    <button type="button" className="wt5-btn wt5-btn--primary wt5-btn--full" onClick={openInvitation}>
                                        {data.greeting.buttonText}
                                    </button>
                                    <p className="wt5-envelope-card__hint">Klik segel atau tombol untuk membuka undangan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {data.guestQrData ? (
                        <div className="wt5-overlay-qr">
                            <GuestQrCode
                                data={data.guestQrData}
                                size={100}
                                style={{ borderRadius: '10px', border: '3px solid rgba(197, 160, 89, 0.6)' }}
                            />
                            <p className="wt5-overlay-qr__label">QR Check-in Tamu</p>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="wt5-shell">
                <aside
                    className="wt5-cover-panel"
                    aria-hidden={!opened}
                    style={{ '--wt5-cover-bg': `url(${data.heroPhoto})` } as CSSProperties}
                >
                    <div className="wt5-cover-panel__frame">
                        <p className="wt5-cover-panel__eyebrow">The Wedding Of</p>
                        <h2 className="wt5-cover-panel__names">
                            {data.groomNickname} &amp; {data.brideNickname}
                        </h2>
                        <div className="wt5-cover-panel__photo">
                            <img src={data.heroPhoto} alt={`${data.groomNickname} & ${data.brideNickname}`} loading="eager" />
                        </div>
                        <div className="wt5-cover-panel__date">{data.mainDateFormatted}</div>
                        <p className="wt5-cover-panel__guest">
                            Untuk {data.guestDisplayName}
                        </p>
                        <p className="wt5-cover-panel__note">
                            Gunakan panel kanan atau navigasi melayang untuk menjelajahi semua bagian undangan.
                        </p>
                    </div>
                </aside>

                <main ref={contentRef} className={`wt5-main${opened ? ' wt5-main--opened' : ''}`}>
                    <section
                        id="hero"
                        data-section-id="hero"
                        className="wt5-section wt5-section--hero"
                        style={{ '--wt5-hero-bg': `url(${data.heroPhoto})` } as CSSProperties}
                    >
                        <img className="wt5-decor wt5-decor--tl" src={ASSETS.leaf1} alt="" aria-hidden="true" />
                        <img className="wt5-decor wt5-decor--br" src={ASSETS.leaf3} alt="" aria-hidden="true" />
                        <div className="wt5-container wt5-container--narrow">
                            <div className="wt5-frame wt5-hero-frame wt5-reveal">
                                <p className="wt5-eyebrow wt5-eyebrow--center">Undangan Pernikahan</p>
                                <h1 className="wt5-hero-title">
                                    {data.groomNickname} <span>&amp;</span> {data.brideNickname}
                                </h1>
                                <div className="wt5-hero-photo">
                                    <img src={data.heroPhoto} alt={`${data.groomNickname} & ${data.brideNickname}`} loading="eager" />
                                </div>
                                <CountdownStrip targetDate={data.countdownTarget} />
                                <div className="wt5-hero-date">{data.mainDateFormatted}</div>
                            </div>
                        </div>
                    </section>

                    {data.greetingEnabled ? (
                        <section id="verse" data-section-id="verse" className="wt5-section wt5-section--alt">
                            <div className="wt5-container wt5-container--narrow">
                                <div className="wt5-frame wt5-verse-card wt5-reveal">
                                    <Quote className="wt5-verse-icon" size={28} />
                                    <p className="wt5-verse-eyebrow">QS. Ar-Ruum : 21</p>
                                    <p className="wt5-verse-text">{data.openingQuote}</p>
                                    <p className="wt5-verse-message">{data.greeting.message}</p>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.coupleEnabled ? (
                        <section id="couple" data-section-id="couple" className="wt5-section">
                            <img className="wt5-decor wt5-decor--tr" src={ASSETS.leaf2} alt="" aria-hidden="true" />
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Assalamu'alaikum Warahmatullahi Wabarakatuh"
                                    title="Kedua Mempelai"
                                    subtitle="Dengan penuh rasa syukur, kami perkenalkan dua insan yang akan melangkah ke jenjang pernikahan."
                                    icon={Sparkles}
                                />
                                <div className="wt5-couple-grid">
                                    <ProfileCard
                                        role="Mempelai Pria"
                                        nickname={data.groomNickname}
                                        fullName={data.groomFullName}
                                        childOrder={data.groomChildOrder}
                                        father={data.groomFather}
                                        mother={data.groomMother}
                                        bio={data.groomBio}
                                        photo={data.groomPhoto}
                                        initials={data.groomInitials}
                                    />
                                    <div className="wt5-couple-divider wt5-reveal" aria-hidden="true">
                                        <span>&amp;</span>
                                    </div>
                                    <ProfileCard
                                        role="Mempelai Wanita"
                                        nickname={data.brideNickname}
                                        fullName={data.brideFullName}
                                        childOrder={data.brideChildOrder}
                                        father={data.brideFather}
                                        mother={data.brideMother}
                                        bio={data.brideBio}
                                        photo={data.bridePhoto}
                                        initials={data.brideInitials}
                                        align="right"
                                    />
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.eventEnabled ? (
                        <section id="events" data-section-id="events" className="wt5-section wt5-section--alt">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Save The Date"
                                    title="Waktu & Tempat Acara"
                                    subtitle="Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami."
                                    icon={CalendarDays}
                                />
                                <div className="wt5-events-grid">
                                    {data.events.map((event, index) => (
                                        <EventCard key={`${event.name}-${event.date}-${index}`} event={event} index={index} onNavigate={handleExternalNavigate} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.locationEnabled ? (
                        <section id="location" data-section-id="location" className="wt5-section">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Petunjuk Arah"
                                    title="Lokasi Acara"
                                    subtitle="Berikut denah dan tautan navigasi ke lokasi acara agar tamu lebih mudah menuju tempat pernikahan."
                                    icon={MapPin}
                                />
                                <div className="wt5-location-grid">
                                    <div className="wt5-frame wt5-location-card wt5-reveal">
                                        <div className="wt5-location-title">Denah Lokasi</div>
                                        <img className="wt5-location-map-image" src={ASSETS.map} alt="Denah lokasi acara" />
                                        <div className="wt5-location-meta">
                                            <strong>{data.primaryLocationTitle}</strong>
                                            <span>{data.primaryLocationAddress}</span>
                                        </div>
                                    </div>
                                    <div className="wt5-frame wt5-location-embed wt5-reveal">
                                        <iframe
                                            title="Lokasi acara"
                                            src={data.primaryMapsEmbed}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                                <div className="wt5-location-actions wt5-reveal">
                                    <button type="button" className="wt5-btn wt5-btn--primary" onClick={() => handleExternalNavigate(data.primaryLocationUrl)}>
                                        <MapPin size={18} />
                                        Petunjuk Navigasi GPS
                                    </button>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.storyEnabled ? (
                        <section id="story" data-section-id="story" className="wt5-section wt5-section--alt">
                            <img className="wt5-decor wt5-decor--bl" src={ASSETS.leaf4} alt="" aria-hidden="true" />
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Perjalanan Kami"
                                    title="Kisah Cinta"
                                    subtitle="Setiap pasangan punya cerita sendiri. Berikut sepenggal perjalanan kami hingga sampai di titik ini."
                                    icon={Quote}
                                />
                                <div className="wt5-timeline">
                                    {data.loveStory.map((item, index) => (
                                        <TimelineCard key={`${item.title}-${index}`} item={item} index={index} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.galleryEnabled ? (
                        <section id="gallery" data-section-id="gallery" className="wt5-section">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Momen Kami"
                                    title="Galeri Foto"
                                    subtitle="Klik salah satu foto untuk memperbesar tampilan dan menjelajahi momen indah kami."
                                    icon={ImageIcon}
                                />
                                <div className="wt5-gallery-grid">
                                    {data.gallery.map((item, index) => (
                                        <button
                                            key={`${item.url}-${index}`}
                                            type="button"
                                            className="wt5-gallery-item wt5-reveal"
                                            onClick={() => setLightboxIndex(index)}
                                            aria-label={`Buka foto ${item.label || index + 1}`}
                                        >
                                            <img src={item.url} alt={item.label || `Galeri ${index + 1}`} loading="lazy" />
                                            <span className="wt5-gallery-overlay">
                                                <ImageIcon size={18} />
                                                Lihat Foto
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.dresscodeEnabled ? (
                        <section id="dresscode" data-section-id="dresscode" className="wt5-section wt5-section--alt">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Tuntunan Busana"
                                    title="Dress Code"
                                    subtitle="Untuk menjaga harmoni visual dan kenyamanan dokumentasi, kami menyarankan tamu hadir dengan nuansa warna berikut."
                                    icon={Leaf}
                                />
                                <div className="wt5-dresscode-wrap wt5-reveal">
                                    <div className="wt5-dresscode-notes">
                                        <p>Demi keselarasan acara dan keindahan dokumentasi, tamu dianjurkan mengenakan pakaian bernuansa hijau, krem, atau emas.</p>
                                        <ul>
                                            <li>Batik atau formal casual dipersilakan.</li>
                                            <li>Hindari warna yang terlalu mencolok agar tetap serasi.</li>
                                            <li>Pastikan tetap nyaman untuk mengikuti rangkaian acara.</li>
                                        </ul>
                                    </div>
                                    <div className="wt5-dresscode-swatches">
                                        {data.dressCodes.map((item) => (
                                            <div key={item.name} className="wt5-swatch">
                                                <span className="wt5-swatch-color" style={{ background: item.hex }} />
                                                <span className="wt5-swatch-name">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.giftEnabled ? (
                        <section id="gift" data-section-id="gift" className="wt5-section">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Tanpa Mengurangi Rasa Hormat"
                                    title="Amplop Digital"
                                    subtitle="Doa restu adalah hadiah terbaik. Namun bila ingin memberi tanda kasih, Anda dapat menggunakan rekening atau e-wallet berikut."
                                    icon={Gift}
                                />

                                {(data.bankAccounts.length > 0 || data.digitalWallets.length > 0) && (data.bankAccounts.length > 0 && data.digitalWallets.length > 0) ? (
                                    <div className="wt5-gift-tabs wt5-reveal">
                                        <button
                                            type="button"
                                            className={`wt5-gift-tab${activeGiftTab === 'bank' ? ' is-active' : ''}`}
                                            onClick={() => setActiveGiftTab('bank')}
                                        >
                                            <Landmark size={16} />
                                            Transfer Bank
                                        </button>
                                        <button
                                            type="button"
                                            className={`wt5-gift-tab${activeGiftTab === 'ewallet' ? ' is-active' : ''}`}
                                            onClick={() => setActiveGiftTab('ewallet')}
                                        >
                                            <WalletCards size={16} />
                                            E-Wallet
                                        </button>
                                    </div>
                                ) : null}

                                <div className="wt5-gift-panel wt5-reveal">
                                    {activeGiftTab === 'bank' && data.bankAccounts.length > 0 ? (
                                        <div className="wt5-gift-grid">
                                            {data.bankAccounts.map((account) => (
                                                <article key={`${account.bankName}-${account.accountNumber}`} className="wt5-gift-card">
                                                    <div className="wt5-gift-card__label">{account.bankName}</div>
                                                    <div className="wt5-gift-card__number">{formatNumber(account.accountNumber)}</div>
                                                    <div className="wt5-gift-card__name">a.n. {account.accountName}</div>
                                                    <CopyActionButton
                                                        text={account.accountNumber}
                                                        label={`${account.bankName} ${account.accountNumber}`}
                                                        onCopy={showToast}
                                                    />
                                                </article>
                                            ))}
                                        </div>
                                    ) : null}

                                    {activeGiftTab === 'ewallet' && data.digitalWallets.length > 0 ? (
                                        <div className="wt5-gift-grid">
                                            {data.digitalWallets.map((wallet) => (
                                                <article key={`${wallet.provider}-${wallet.accountNumber}`} className="wt5-gift-card wt5-gift-card--ewallet">
                                                    <div className="wt5-gift-card__label">{wallet.label || wallet.provider}</div>
                                                    <div className="wt5-gift-card__number">{formatNumber(wallet.accountNumber)}</div>
                                                    <div className="wt5-gift-card__name">a.n. {wallet.accountName}</div>
                                                    <CopyActionButton
                                                        text={wallet.accountNumber}
                                                        label={`${wallet.label || wallet.provider} ${wallet.accountNumber}`}
                                                        onCopy={showToast}
                                                    />
                                                </article>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.rsvpEnabled ? (
                        <section id="rsvp" data-section-id="rsvp" className="wt5-section wt5-section--alt">
                            <div className="wt5-container wt5-container--narrow">
                                <SectionHeader
                                    eyebrow="Konfirmasi Kehadiran"
                                    title="RSVP"
                                    subtitle="Mohon konfirmasi kehadiran Bapak/Ibu/Saudara/i sebelum hari acara agar kami dapat menyiapkan layanan dengan lebih baik."
                                    icon={Send}
                                />
                                <form className="wt5-form wt5-reveal" onSubmit={handleRsvpSubmit}>
                                    <div className="wt5-field">
                                        <label htmlFor="wt5-rsvp-name">Nama Tamu</label>
                                        <input
                                            id="wt5-rsvp-name"
                                            type="text"
                                            value={rsvpState.name}
                                            onChange={(event) => setRsvpState((current) => ({ ...current, name: event.target.value }))}
                                            placeholder="Nama lengkap"
                                            autoComplete="name"
                                        />
                                        {rsvpErrors.name ? <span className="wt5-field-error">{rsvpErrors.name}</span> : null}
                                    </div>
                                    <div className="wt5-field">
                                        <label htmlFor="wt5-rsvp-phone">Nomor WhatsApp</label>
                                        <input
                                            id="wt5-rsvp-phone"
                                            type="tel"
                                            value={rsvpState.phone}
                                            onChange={(event) => setRsvpState((current) => ({ ...current, phone: event.target.value }))}
                                            placeholder="08xxxxxxxxxx"
                                            autoComplete="tel"
                                        />
                                        {rsvpErrors.phone ? <span className="wt5-field-error">{rsvpErrors.phone}</span> : null}
                                    </div>
                                    <div className="wt5-form-grid">
                                        <div className="wt5-field">
                                            <label htmlFor="wt5-rsvp-guests">Jumlah Tamu</label>
                                            <select
                                                id="wt5-rsvp-guests"
                                                value={rsvpState.guests}
                                                onChange={(event) => setRsvpState((current) => ({ ...current, guests: event.target.value }))}
                                            >
                                                {Array.from({ length: 6 }, (_, index) => index + 1).map((value) => (
                                                    <option key={value} value={value}>
                                                        {value} orang
                                                    </option>
                                                ))}
                                            </select>
                                            {rsvpErrors.guests ? <span className="wt5-field-error">{rsvpErrors.guests}</span> : null}
                                        </div>
                                        <div className="wt5-field">
                                            <label htmlFor="wt5-rsvp-attendance">Status Kehadiran</label>
                                            <select
                                                id="wt5-rsvp-attendance"
                                                value={rsvpState.attendance}
                                                onChange={(event) => setRsvpState((current) => ({ ...current, attendance: event.target.value as AttendanceValue }))}
                                            >
                                                <option value="Hadir">Hadir</option>
                                                <option value="Tidak Hadir">Tidak Hadir</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="wt5-field">
                                        <label htmlFor="wt5-rsvp-notes">Ucapan / Pesan Tambahan</label>
                                        <textarea
                                            id="wt5-rsvp-notes"
                                            rows={4}
                                            value={rsvpState.notes}
                                            onChange={(event) => setRsvpState((current) => ({ ...current, notes: event.target.value }))}
                                            placeholder="Tulis ucapan selamat Anda..."
                                        />
                                    </div>
                                    <button type="submit" className="wt5-btn wt5-btn--primary wt5-btn--full" disabled={rsvpSubmitting}>
                                        {rsvpSubmitting ? <Loader2 size={16} className="wt5-spin" /> : <Send size={16} />}
                                        Kirim Konfirmasi RSVP
                                    </button>
                                    <p className="wt5-form-note">Data disimpan untuk simulasi dan bisa diarahkan ke endpoint backend bila tersedia.</p>
                                </form>
                            </div>
                        </section>
                    ) : null}

                    {data.wishesEnabled ? (
                        <section id="wishes" data-section-id="wishes" className="wt5-section">
                            <div className="wt5-container">
                                <SectionHeader
                                    eyebrow="Doa & Harapan"
                                    title="Ucapan untuk Kami"
                                    subtitle="Silakan tinggalkan doa, ucapan, dan harapan terbaik untuk kedua mempelai."
                                    icon={MessageCircleHeart}
                                />
                                <div className="wt5-wishes-layout">
                                    <form className="wt5-form wt5-form--compact wt5-reveal" onSubmit={handleWishSubmit}>
                                        <div className="wt5-field">
                                            <label htmlFor="wt5-wish-name">Nama Pengirim</label>
                                            <input
                                                id="wt5-wish-name"
                                                type="text"
                                                value={wishForm.name}
                                                onChange={(event) => setWishForm((current) => ({ ...current, name: event.target.value }))}
                                                placeholder="Nama Anda"
                                                autoComplete="name"
                                            />
                                            {wishErrors.name ? <span className="wt5-field-error">{wishErrors.name}</span> : null}
                                        </div>
                                        <div className="wt5-field">
                                            <label htmlFor="wt5-wish-attendance">Konfirmasi Kehadiran</label>
                                            <select
                                                id="wt5-wish-attendance"
                                                value={wishForm.attendance}
                                                onChange={(event) => setWishForm((current) => ({ ...current, attendance: event.target.value as AttendanceValue }))}
                                            >
                                                <option value="Hadir">Hadir</option>
                                                <option value="Tidak Hadir">Tidak Hadir</option>
                                            </select>
                                        </div>
                                        <div className="wt5-field">
                                            <label htmlFor="wt5-wish-message">Pesan & Doa Restu</label>
                                            <textarea
                                                id="wt5-wish-message"
                                                rows={5}
                                                value={wishForm.message}
                                                onChange={(event) => setWishForm((current) => ({ ...current, message: event.target.value }))}
                                                placeholder="Tuliskan ucapan dan doa terbaik Anda..."
                                            />
                                            {wishErrors.message ? <span className="wt5-field-error">{wishErrors.message}</span> : null}
                                        </div>
                                        <button type="submit" className="wt5-btn wt5-btn--primary wt5-btn--full" disabled={wishSubmitting}>
                                            {wishSubmitting ? <Loader2 size={16} className="wt5-spin" /> : <Send size={16} />}
                                            Kirim Doa Restu
                                        </button>
                                    </form>

                                    <div className="wt5-wishes-board wt5-reveal">
                                        <div className="wt5-wishes-list">
                                            {wishes.slice(0, visibleWishes).map((wish, index) => (
                                                <WishCard key={`${wish.name}-${wish.date}-${index}`} wish={wish} index={index} />
                                            ))}
                                            {wishes.length === 0 ? <p className="wt5-wishes-empty">Belum ada ucapan. Jadilah yang pertama!</p> : null}
                                        </div>
                                        {visibleWishes < wishes.length ? (
                                            <button type="button" className="wt5-btn wt5-btn--ghost wt5-btn--full wt5-load-more" onClick={() => setVisibleWishes((current) => current + 3)}>
                                                Lihat Lebih Banyak
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.footerEnabled ? (
                        <section id="closing" data-section-id="closing" className="wt5-section wt5-section--closing">
                            <img className="wt5-decor wt5-decor--tr wt5-decor--soft" src={ASSETS.leaf1} alt="" aria-hidden="true" />
                            <img className="wt5-decor wt5-decor--bl wt5-decor--soft" src={ASSETS.leaf4} alt="" aria-hidden="true" />
                            <div className="wt5-container wt5-container--narrow">
                                <div className="wt5-closing-card wt5-reveal">
                                    <p className="wt5-script wt5-closing-script">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                                    <p className="wt5-closing-text">
                                        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
                                    </p>
                                    <h2 className="wt5-closing-names">
                                        {data.groomNickname} &amp; {data.brideNickname}
                                    </h2>
                                    <p className="wt5-closing-family">
                                        Keluarga Bapak {data.groomFather} &amp; Ibu {data.groomMother}
                                        <br />
                                        Keluarga Bapak {data.brideFather} &amp; Ibu {data.brideMother}
                                    </p>
                                    <footer className="wt5-footer">
                                        <span>© 2026 Putri &amp; Putra Wedding Invitation</span>
                                        <span>Created with love.</span>
                                    </footer>
                                </div>
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>

            {data.musicEnabled ? (
                <button
                    type="button"
                    className={`wt5-music-toggle${isMusicPlaying ? ' is-playing' : ''}`}
                    onClick={toggleMusic}
                    aria-label={isMusicPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
                >
                    {isMusicPlaying ? <Pause size={18} /> : <Music2 size={18} />}
                </button>
            ) : null}

            {toast ? (
                <div className={`wt5-toast wt5-toast--${toast.variant}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            ) : null}

            {lightboxIndex !== null && currentGalleryItem ? (
                <div
                    className="wt5-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={currentGalleryItem.label || 'Foto galeri'}
                    onClick={() => setLightboxIndex(null)}
                >
                    <button type="button" className="wt5-lightbox__close" onClick={() => setLightboxIndex(null)} aria-label="Tutup galeri">
                        <X size={20} />
                    </button>
                    <button
                        type="button"
                        className="wt5-lightbox__nav wt5-lightbox__nav--prev"
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIndex((current) => {
                                if (current === null) return current;
                                return (current - 1 + data.gallery.length) % data.gallery.length;
                            });
                        }}
                        aria-label="Foto sebelumnya"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="wt5-lightbox__panel" onClick={(event) => event.stopPropagation()}>
                        <img src={currentGalleryItem.url} alt={currentGalleryItem.label || 'Foto galeri'} />
                        <p className="wt5-lightbox__caption">{currentGalleryItem.label || 'Galeri Foto'}</p>
                    </div>
                    <button
                        type="button"
                        className="wt5-lightbox__nav wt5-lightbox__nav--next"
                        onClick={(event) => {
                            event.stopPropagation();
                            setLightboxIndex((current) => {
                                if (current === null) return current;
                                return (current + 1) % data.gallery.length;
                            });
                        }}
                        aria-label="Foto berikutnya"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
