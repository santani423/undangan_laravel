import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './aqiqah-theme-10.css';

interface AqiqahTheme10Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

function addToCalendar(ev: InvitationEvent, babyName: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '090000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '120000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Tasyakuran Aqiqah ${babyName}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
    window.open(url, '_blank');
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

function genderWord(gender: string): string {
    if (gender === 'Laki-laki') return 'Putra';
    if (gender === 'Perempuan') return 'Putri';
    return '';
}

function genderIcon(gender: string): string {
    if (gender === 'Laki-laki') return '👦';
    if (gender === 'Perempuan') return '👧';
    return '🌱';
}

function nasabWord(gender: string): string {
    return gender === 'Perempuan' ? 'binti' : 'bin';
}

interface DateParts {
    day: string;
    weekday: string;
    month: string;
    year: string;
}

function formatDateParts(dateStr: string): DateParts | null {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return {
        day: String(d.getDate()).padStart(2, '0'),
        weekday: d.toLocaleDateString('id-ID', { weekday: 'long' }),
        month: d.toLocaleDateString('id-ID', { month: 'long' }),
        year: String(d.getFullYear()),
    };
}

interface WreathLeaf {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    color: string;
}

interface Berry {
    x: number;
    y: number;
}

const WREATH_COLORS = ['#2f5236', '#3f6b43', '#5a8a52', '#7ea66b', '#a7c08f'];

function buildWreathLeaves(count: number): WreathLeaf[] {
    const leaves: WreathLeaf[] = [];
    for (let i = 0; i < count; i++) {
        const angle = (360 / count) * i - 90;
        const rad = (angle * Math.PI) / 180;
        const radius = 124;
        leaves.push({
            x: 150 + radius * Math.cos(rad),
            y: 150 + radius * Math.sin(rad),
            rotate: angle + 90 + (Math.random() * 16 - 8),
            scale: 0.78 + Math.random() * 0.32,
            color: WREATH_COLORS[i % WREATH_COLORS.length],
        });
    }
    return leaves;
}

function buildBerries(count: number): Berry[] {
    const berries: Berry[] = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 360;
        const rad = (angle * Math.PI) / 180;
        const radius = 100 + Math.random() * 28;
        berries.push({ x: 150 + radius * Math.cos(rad), y: 150 + radius * Math.sin(rad) });
    }
    return berries;
}

interface FallingLeaf {
    left: number;
    duration: number;
    delay: number;
    opacity: number;
    color: string;
}

const FALL_COLORS = ['#7ea66b', '#a7c08f', '#5a8a52', '#f2c14e'];

function buildFallingLeaves(count: number): FallingLeaf[] {
    return Array.from({ length: count }, (_, i) => ({
        left: 5 + Math.random() * 88,
        duration: 11 + Math.random() * 9,
        delay: -(Math.random() * 18),
        opacity: 0.5 + Math.random() * 0.4,
        color: FALL_COLORS[i % FALL_COLORS.length],
    }));
}

export default function AqiqahTheme10({ invitation, visitor, greeting }: AqiqahTheme10Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq10-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq10-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const wreathLeaves = useMemo(() => buildWreathLeaves(40), []);
    const berries = useMemo(() => buildBerries(7), []);
    const fallingLeaves = useMemo(() => buildFallingLeaves(9), []);

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '🌱';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;

    const nasabLine = invitation.fatherName ? `${nasabWord(babyGender)} ${invitation.fatherName}` : '';

    const parentsLine =
        invitation.fatherName && invitation.motherName
            ? `Bpk. ${invitation.fatherName} & Ibu ${invitation.motherName}`
            : invitation.fatherName
              ? `Bpk. ${invitation.fatherName}`
              : invitation.motherName
                ? `Ibu ${invitation.motherName}`
                : '';

    const word = genderWord(babyGender);
    const parentsLabel = word ? `${word} dari` : 'Buah hati dari';

    const primaryEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const primaryTimeStr = primaryEvent?.time
        ? primaryEvent.timeEnd
            ? `${primaryEvent.time} – ${primaryEvent.timeEnd} WIB`
            : `${primaryEvent.time} WIB`
        : '';

    return (
        <div className="aq10-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Caveat:wght@500;600&family=Figtree:wght@400;500;600;700&family=Young+Serif&display=swap');
            `}</style>

            {/* Reusable SVG symbols (leaf / branch / sprig decorations) */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <symbol id="aq10-leaf" viewBox="0 -8 34 16">
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="currentColor" />
                </symbol>
                <symbol id="aq10-br" viewBox="-10 -20 250 160">
                    <path d="M0 0 C60 10 120 40 220 120" fill="none" stroke="#4d6b3f" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(13.9 2.7) rotate(67) scale(1.21)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(27.8 6.1) rotate(-40) scale(1.17)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(42.0 10.5) rotate(74) scale(1.13)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(56.5 15.8) rotate(-33) scale(1.10)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#7ea66b" transform="translate(71.5 22.1) rotate(79) scale(1.06)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(87.0 29.6) rotate(-28) scale(1.02)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#a7c08f" transform="translate(103.2 38.2) rotate(84) scale(0.98)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(120.1 48.2) rotate(-24) scale(0.94)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#3f6b43" transform="translate(137.9 59.5) rotate(88) scale(0.90)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(156.7 72.2) rotate(-20) scale(0.87)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#3f6b43" transform="translate(176.5 86.5) rotate(91) scale(0.83)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#a7c08f" transform="translate(197.6 102.4) rotate(-17) scale(0.79)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(220 120) rotate(40) scale(1.1)" />
                </symbol>
                <symbol id="aq10-br2" viewBox="-10 -20 250 160">
                    <path d="M0 0 C60 10 120 40 220 120" fill="none" stroke="#4d6b3f" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#a7c08f" transform="translate(18.0 3.6) rotate(68) scale(1.20)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(36.3 8.6) rotate(-38) scale(1.15)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#a7c08f" transform="translate(55.1 15.2) rotate(76) scale(1.10)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#a7c08f" transform="translate(74.6 23.5) rotate(-30) scale(1.05)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(95.0 33.8) rotate(83) scale(1.00)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(116.6 46.1) rotate(-24) scale(0.95)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(139.7 60.7) rotate(89) scale(0.90)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(164.5 77.8) rotate(-19) scale(0.85)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#2f5236" transform="translate(191.2 97.5) rotate(92) scale(0.80)" />
                    <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill="#5a8a52" transform="translate(220 120) rotate(40) scale(1.1)" />
                </symbol>
                <symbol id="aq10-sprig" viewBox="0 0 120 30">
                    <path d="M10 15H110" stroke="#7c5f43" strokeWidth="1.2" />
                    <g fill="#5a8a52">
                        <path d="M40 15c3-8 10-10 16-9-3 6-9 9-16 9z" />
                        <path d="M40 15c3 8 10 10 16 9-3-6-9-9-16-9z" />
                        <path d="M80 15c-3-8-10-10-16-9 3 6 9 9 16 9z" />
                        <path d="M80 15c-3 8-10 10-16 9 3-6 9-9 16-9z" />
                    </g>
                    <circle cx="60" cy="15" r="4" fill="#f2c14e" />
                </symbol>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq10-overlay ${opened ? 'aq10-hide' : ''}`}>
                    <div className="aq10-overlay-decor" aria-hidden="true">
                        <svg className="aq10-overlay-branch aq10-overlay-branch-l aq10-sway" aria-hidden="true">
                            <use href="#aq10-br" />
                        </svg>
                        <svg className="aq10-overlay-branch aq10-overlay-branch-r aq10-sway" aria-hidden="true">
                            <use href="#aq10-br2" />
                        </svg>
                        <span className="aq10-overlay-leaf aq10-overlay-leaf-1">🍃</span>
                        <span className="aq10-overlay-leaf aq10-overlay-leaf-2">🌿</span>
                    </div>
                    <div className="aq10-overlay-frame">
                        <p className="aq10-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq10-overlay-label">Walimatul Aqiqah</p>
                        <div className="aq10-overlay-divider" />
                        <div className="aq10-overlay-name">{invitation.babyName}</div>
                        {babyGender && (
                            <p className="aq10-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq10-overlay-divider" />
                        <p className="aq10-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq10-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq10-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq10-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq10-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq10-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(79,122,74,0.4)' }}
                                />
                                <p className="aq10-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq10-btn-open" onClick={openInvitation}>
                            🌿 {greeting?.buttonText ?? 'Buka Undangan'} 🌿
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq10-main ${opened ? 'aq10-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="aq10-hero" id="top">
                    <svg className="aq10-branch aq10-br-tl aq10-sway" aria-hidden="true">
                        <use href="#aq10-br" />
                    </svg>
                    <svg className="aq10-branch aq10-br-tr aq10-sway" aria-hidden="true">
                        <use href="#aq10-br2" />
                    </svg>
                    <div className="aq10-fall" aria-hidden="true">
                        {fallingLeaves.map((leaf, i) => (
                            <svg
                                key={i}
                                viewBox="0 -8 34 16"
                                style={{
                                    left: `${leaf.left}%`,
                                    animationDuration: `${leaf.duration}s`,
                                    animationDelay: `${leaf.delay}s`,
                                    opacity: leaf.opacity,
                                }}
                            >
                                <path d="M0 0C8 -7 24 -8 34 0C24 8 8 7 0 0Z" fill={leaf.color} />
                            </svg>
                        ))}
                    </div>
                    <div className="aq10-hero-frame aq10-anim-up">
                        <p className="aq10-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <span className="aq10-label">Tasyakuran Aqiqah</span>
                        <div className="aq10-wreath">
                            <svg viewBox="0 0 300 300" aria-hidden="true">
                                <circle cx="150" cy="150" r="126" fill="none" stroke="#5a7a4a" strokeWidth="1.5" />
                                {wreathLeaves.map((l, i) => (
                                    <use
                                        key={i}
                                        href="#aq10-leaf"
                                        width="34"
                                        height="16"
                                        style={{ color: l.color }}
                                        transform={`translate(${l.x} ${l.y}) rotate(${l.rotate}) scale(${l.scale})`}
                                    />
                                ))}
                                {berries.map((b, i) => (
                                    <g key={i} transform={`translate(${b.x} ${b.y})`}>
                                        <circle r="5" fill="#f2c14e" />
                                        <circle r="2" fill="#c98a1e" />
                                    </g>
                                ))}
                            </svg>
                            <div
                                className="aq10-wreath-photo"
                                style={
                                    babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                }
                            >
                                {!babyPhoto && babyInitial}
                            </div>
                        </div>
                        <p className="aq10-hand">tumbuh bersama doa &amp; cinta</p>
                        <h1 className="aq10-hero-name">{invitation.babyName}</h1>
                        {nasabLine && <p className="aq10-hero-nasab">{nasabLine}</p>}
                        {babyGender && (
                            <div className="aq10-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq10-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        <div className="aq10-when-line">
                            {invitation.mainDateFormatted && (
                                <span>
                                    <i /> {invitation.mainDateFormatted}
                                </span>
                            )}
                            {primaryTimeStr && (
                                <span>
                                    <i /> {primaryTimeStr}
                                </span>
                            )}
                            {primaryEvent?.locationName && (
                                <span>
                                    <i /> {primaryEvent.locationName}
                                </span>
                            )}
                        </div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq10-countdown"
                                boxClassName="aq10-countdown-box"
                                numClassName="aq10-countdown-num"
                                labelClassName="aq10-countdown-label"
                            />
                        )}
                        <div className="aq10-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── SALAM / OPENING QUOTE ────────────────────────────────────────── */}
                <section className="aq10-quote" id="salam">
                    <div className="aq10-quote-inner">
                        <p className="aq10-hand aq10-anim-up">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                        <p className="aq10-arabic aq10-anim-up" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq10-quote-text aq10-anim-up">
                            “Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama.”
                        </blockquote>
                        <p className="aq10-quote-src aq10-anim-up">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <svg className="aq10-sprig aq10-anim-up" aria-hidden="true">
                            <use href="#aq10-sprig" />
                        </svg>
                        <p className="aq10-quote-lead aq10-anim-up">
                            {invitation.openingMessage ||
                                'Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan Tasyakuran Aqiqah buah hati kami.'}
                        </p>
                    </div>
                </section>

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq10-section aq10-profile" id="anak">
                        <p className="aq10-hand aq10-anim-up" style={{ textAlign: 'center' }}>
                            si kecil
                        </p>
                        <h2 className="aq10-section-title aq10-anim-up">Tunas kecil kami yang baru tumbuh</h2>
                        <div className="aq10-child-grid aq10-anim-up">
                            <div className="aq10-leafpic">
                                <div
                                    className="aq10-leafpic-photo"
                                    style={
                                        babyPhoto
                                            ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!babyPhoto && babyInitial}
                                </div>
                            </div>
                            <div>
                                <p className="aq10-child-name">{invitation.babyName}</p>
                                {nasabLine && <p className="aq10-child-nasab">{nasabLine}</p>}
                                <p className="aq10-child-note">semoga tumbuh kuat seperti pohon yang akarnya teguh 🌱</p>
                            </div>
                        </div>
                        {parentsLine && (
                            <div className="aq10-parents aq10-anim-up">
                                <p className="aq10-parents-cap">{parentsLabel}</p>
                                <p className="aq10-parents-who">{parentsLine}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq10-section aq10-events-bg" id="acara">
                        <p className="aq10-hand aq10-light aq10-anim-up" style={{ textAlign: 'center' }}>
                            waktu &amp; tempat
                        </p>
                        <h2 className="aq10-section-title aq10-light aq10-anim-up">Insya Allah diselenggarakan pada</h2>
                        <div className="aq10-events-grid">
                            {invitation.events.map((ev, i) => {
                                const parts = formatDateParts(ev.date);
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="aq10-board aq10-anim-up">
                                        <svg className="aq10-board-branch" aria-hidden="true">
                                            <use href="#aq10-br" />
                                        </svg>
                                        <h3 className="aq10-board-name">{ev.name}</h3>
                                        {parts && (
                                            <div className="aq10-dayrow">
                                                <span className="aq10-dayrow-d">{parts.weekday.toUpperCase()}</span>
                                                <span className="aq10-dayrow-n">{parts.day}</span>
                                                <span className="aq10-dayrow-m">
                                                    {parts.month}
                                                    <span>{parts.year}</span>
                                                </span>
                                            </div>
                                        )}
                                        {timeStr && <span className="aq10-board-time">Pukul {timeStr}</span>}
                                        {(ev.locationName || ev.location) && (
                                            <p className="aq10-board-addr">
                                                {ev.locationName && <strong>{ev.locationName}</strong>}
                                                {ev.location && <span>{ev.location}</span>}
                                            </p>
                                        )}
                                        <div className="aq10-actions">
                                            {mapsUrl && (
                                                <a className="aq10-btn aq10-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                    Buka Peta
                                                </a>
                                            )}
                                            <button className="aq10-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                Simpan Tanggal
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── LOCATION ──────────────────────────────────────────────────── */}
                {isEnabled('location') &&
                    invitation.events.length > 0 &&
                    (() => {
                        const ev = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
                        const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                        if (!ev.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="aq10-section">
                                <h2 className="aq10-section-title aq10-anim-up">Lokasi Acara</h2>
                                <div className="aq10-divider aq10-anim-up">
                                    <svg className="aq10-sprig" aria-hidden="true">
                                        <use href="#aq10-sprig" />
                                    </svg>
                                </div>
                                {ev.locationName && (
                                    <p className="aq10-location-sub aq10-anim-up">
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div className="aq10-map-container aq10-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="aq10-map-wrapper">
                                            <iframe
                                                src={ev.mapsEmbed}
                                                width="100%"
                                                height="400"
                                                style={{ border: 0, display: 'block' }}
                                                allowFullScreen
                                                loading="lazy"
                                                title={`Lokasi ${ev.locationName || ev.name}`}
                                            />
                                        </div>
                                    )}
                                    {mapsUrl && (
                                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq10-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="aq10-section aq10-gallery-bg">
                        <h2 className="aq10-section-title aq10-anim-up">Galeri Foto</h2>
                        <div className="aq10-divider aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq10-gallery-grid',
                                item: 'aq10-gallery-item',
                                thumb: 'aq10-gallery-thumb',
                                overlay: 'aq10-gallery-overlay',
                                filterBar: 'aq10-gallery-filter-bar',
                                filterBtn: 'aq10-filter-btn',
                                filterBtnActive: 'aq10-filter-btn aq10-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq10-section">
                        <h2 className="aq10-section-title aq10-anim-up">Video Kenangan</h2>
                        <div className="aq10-divider aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                        </div>
                        <div className="aq10-video-frame aq10-anim-up">
                            <iframe
                                src={babyVideoEmbedUrl}
                                title="Video Kenangan"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* ── DIGITAL GIFT ──────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq10-section aq10-gift-bg">
                        <h2 className="aq10-section-title aq10-light aq10-anim-up">Amplop Digital</h2>
                        <div className="aq10-divider aq10-light aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                        </div>
                        <p className="aq10-gift-subtitle aq10-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda kasih
                            untuk si kecil, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq10-bank-grid',
                                bankCard: 'aq10-bank-card',
                                bankLogo: 'aq10-bank-logo',
                                bankType: 'aq10-bank-type',
                                bankNumber: 'aq10-bank-number',
                                bankName: 'aq10-bank-name',
                                copyBankBtn: 'aq10-btn-copy-bank',
                                ewalletGrid: 'aq10-ewallet-grid',
                                ewalletCard: 'aq10-ewallet-card',
                                ewalletName: 'aq10-ewallet-name',
                                ewalletPhone: 'aq10-ewallet-phone',
                                copyEwalletBtn: 'aq10-btn-copy-ewallet',
                                ewalletTitle: 'aq10-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq10-section" id="rsvp">
                        <p className="aq10-hand aq10-anim-up" style={{ textAlign: 'center' }}>
                            RSVP &amp; doa
                        </p>
                        <h2 className="aq10-section-title aq10-anim-up">Titipkan doa untuk si kecil</h2>
                        <div className="aq10-divider aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'aq10-rsvp-form',
                                label: 'aq10-rsvp-label',
                                input: 'aq10-rsvp-input',
                                select: 'aq10-rsvp-select',
                                textarea: 'aq10-rsvp-textarea',
                                radioGroup: 'aq10-rsvp-radio-group',
                                radioLabel: 'aq10-rsvp-radio-label',
                                errorText: 'aq10-rsvp-error',
                                submitBtn: 'aq10-rsvp-submit',
                                successBox: 'aq10-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq10-section aq10-wishes-bg">
                        <h2 className="aq10-section-title aq10-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq10-divider aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq10-wishes-layout',
                                formBox: 'aq10-wishes-form',
                                formTitle: 'aq10-wishes-form-title',
                                nameInput: 'aq10-wish-input',
                                messageInput: 'aq10-wish-input',
                                submitBtn: 'aq10-wish-btn',
                                wishCard: 'aq10-wish-card',
                                wishAvatar: 'aq10-wish-avatar',
                                wishName: 'aq10-wish-name',
                                wishDate: 'aq10-wish-date',
                                wishMessage: 'aq10-wish-message',
                                loadMoreBtn: 'aq10-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="aq10-closing">
                        <div className="aq10-closing-decor" aria-hidden="true">
                            <span className="aq10-closing-leaf aq10-closing-leaf-1">🍃</span>
                            <span className="aq10-closing-leaf aq10-closing-leaf-2">🌿</span>
                        </div>
                        <div className="aq10-closing-frame aq10-anim-up">
                            <svg className="aq10-sprig" aria-hidden="true">
                                <use href="#aq10-sprig" />
                            </svg>
                            <p className="aq10-closing-lead">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq10-closing-salam">Wassalamu’alaikum Warahmatullahi Wabarakatuh</p>
                            <p className="aq10-hand aq10-closing-from">kami yang berbahagia</p>
                            {parentsLine && <p className="aq10-closing-family">Kel. {parentsLine}</p>}
                            <p className="aq10-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </div>
                    </section>
                )}
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq10-leaf)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq10-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq10-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
