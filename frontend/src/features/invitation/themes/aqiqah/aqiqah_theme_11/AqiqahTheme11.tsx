import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './aqiqah-theme-11.css';

interface AqiqahTheme11Props {
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
    return '🌙';
}

function nasabWord(gender: string): string {
    return gender === 'Perempuan' ? 'binti' : 'bin';
}

interface DateParts {
    day: string;
    weekday: string;
    month: string;
    year: string;
    numeric: string;
}

function formatDateParts(dateStr: string): DateParts | null {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return {
        day,
        weekday: d.toLocaleDateString('id-ID', { weekday: 'long' }),
        month: d.toLocaleDateString('id-ID', { month: 'long' }),
        year: String(d.getFullYear()),
        numeric: `${day}.${month}.${d.getFullYear()}`,
    };
}

function formatTime(ev: InvitationEvent): string {
    if (!ev.time) return '';
    return ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`;
}

interface Star {
    x: number;
    y: number;
    r: number;
    phase: number;
    speed: number;
}

interface ShootingStar {
    x: number;
    y: number;
    len: number;
}

/** Twinkling star field with an occasional shooting star, drawn on a canvas that fills its parent. */
function StarSky({ paused = false }: { paused?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        let stars: Star[] = [];
        let shoot: ShootingStar | null = null;
        let frame = 0;

        const size = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const count = Math.round((rect.width * rect.height) / 3200);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.9,
                r: (Math.random() * 1.3 + 0.3) * dpr,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
            }));
        };

        const draw = (t: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                const alpha = still ? 0.75 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.phase + (t / 1000) * s.speed));
                ctx.fillStyle = `rgba(246,236,205,${alpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (still || paused) return;

            if (!shoot && Math.random() < 0.004) {
                shoot = { x: Math.random() * canvas.width * 0.7, y: Math.random() * canvas.height * 0.35, len: 0 };
            }
            if (shoot) {
                shoot.len += 14 * dpr;
                const headX = shoot.x + shoot.len;
                const headY = shoot.y + shoot.len * 0.45;
                const tailX = headX - 90 * dpr;
                const tailY = shoot.y + (shoot.len - 90 * dpr) * 0.45;
                const grad = ctx.createLinearGradient(headX, headY, tailX, tailY);
                grad.addColorStop(0, 'rgba(255,240,200,.9)');
                grad.addColorStop(1, 'rgba(255,240,200,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5 * dpr;
                ctx.beginPath();
                ctx.moveTo(headX, headY);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();
                if (shoot.len > canvas.width * 0.6) shoot = null;
            }
            frame = requestAnimationFrame(draw);
        };

        const onResize = () => {
            size();
            if (still || paused) draw(0);
        };

        size();
        frame = requestAnimationFrame(draw);
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', onResize);
        };
    }, [paused]);

    return <canvas ref={canvasRef} className="aq11-sky" aria-hidden="true" />;
}

function Moon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
            <circle cx="80" cy="80" r="66" fill="url(#aq11-g)" mask="url(#aq11-cres)" />
        </svg>
    );
}

interface HangItem {
    left: string;
    string: number;
    kind: 'lantern' | 'star8' | 'star5';
    w: number;
    h: number;
}

const HANGING: HangItem[] = [
    { left: '6%', string: 40, kind: 'lantern', w: 44, h: 88 },
    { left: '24%', string: 80, kind: 'star8', w: 18, h: 18 },
    { left: '40%', string: 24, kind: 'star5', w: 14, h: 14 },
    { left: '56%', string: 56, kind: 'lantern', w: 34, h: 68 },
];

function HangingOrnaments() {
    return (
        <>
            {HANGING.map((item, i) => (
                <div key={i} className="aq11-hang" style={{ left: item.left }} aria-hidden="true">
                    <svg width="2" height={item.string} className="aq11-hang-string">
                        <line x1="1" y1="0" x2="1" y2={item.string} stroke="#e2b857" strokeOpacity=".6" />
                    </svg>
                    <svg width={item.w} height={item.h}>
                        <use href={`#aq11-${item.kind}`} />
                    </svg>
                </div>
            ))}
        </>
    );
}

function Ornament({ className = '' }: { className?: string }) {
    return (
        <div className={`aq11-ornament ${className}`}>
            <svg aria-hidden="true">
                <use href="#aq11-star8" />
            </svg>
        </div>
    );
}

export default function AqiqahTheme11({ invitation, visitor, greeting }: AqiqahTheme11Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq11-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq11-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const copyAddress = (ev: InvitationEvent) => {
        const text = [ev.locationName, ev.location].filter(Boolean).join(', ');
        if (!text) return;
        navigator.clipboard
            ?.writeText(text)
            .then(() => showToast('Alamat disalin ✦'))
            .catch(() => showToast('Gagal menyalin alamat'));
    };

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '☾';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;

    const nasabLine = invitation.fatherName ? `${nasabWord(babyGender)} ${invitation.fatherName}` : '';

    const word = genderWord(babyGender);
    const parentsLabel = word ? `${word} dari` : 'Buah hati dari';

    const primaryEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const primaryParts = primaryEvent ? formatDateParts(primaryEvent.date) : null;

    const showEvents = isEnabled('event_detail') && invitation.events.length > 0;
    const showCountdown = isEnabled('countdown') && !!invitation.countdownDate;

    return (
        <div className="aq11-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Jost:wght@400;500;600&family=Marcellus&display=swap');
            `}</style>

            {/* Reusable SVG defs (gold gradient, stars, lantern, crescent mask) */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <linearGradient id="aq11-g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f4dc9a" />
                        <stop offset=".6" stopColor="#e2b857" />
                        <stop offset="1" stopColor="#b98a2f" />
                    </linearGradient>
                    <radialGradient id="aq11-flame">
                        <stop offset="0" stopColor="#fff6d8" />
                        <stop offset=".5" stopColor="#f7cf6b" />
                        <stop offset="1" stopColor="#f7cf6b" stopOpacity="0" />
                    </radialGradient>
                    <mask id="aq11-cres">
                        <rect width="160" height="160" fill="#fff" />
                        <circle cx="108" cy="58" r="58" fill="#000" />
                    </mask>
                    <clipPath id="aq11-arch">
                        <path d="M0 300 L0 114 C0 54 60 24 100 0 C140 24 200 54 200 114 L200 300 Z" />
                    </clipPath>
                </defs>
                <symbol id="aq11-star8" viewBox="0 0 40 40">
                    <path d="M20 0l5.9 5.9H34.1V14.1L40 20l-5.9 5.9V34.1H25.9L20 40l-5.9-5.9H5.9V25.9L0 20l5.9-5.9V5.9H14.1z" fill="url(#aq11-g)" />
                </symbol>
                <symbol id="aq11-star5" viewBox="0 0 40 40">
                    <path d="M20 2l5 12.5 13.4.9-10.3 8.6 3.3 13L20 29.8 8.6 37l3.3-13L1.6 15.4 15 14.5z" fill="url(#aq11-g)" />
                </symbol>
                <symbol id="aq11-lantern" viewBox="0 0 60 120">
                    <path d="M30 0v14" stroke="#e2b857" strokeWidth="1.5" />
                    <circle cx="30" cy="17" r="4" fill="none" stroke="#e2b857" strokeWidth="2" />
                    <path d="M18 34 L30 20 L42 34Z" fill="url(#aq11-g)" />
                    <rect x="14" y="34" width="32" height="4" rx="1" fill="url(#aq11-g)" />
                    <path d="M16 38 L10 70 L16 92 H44 L50 70 L44 38Z" fill="rgba(10,18,49,.7)" stroke="url(#aq11-g)" strokeWidth="2" />
                    <ellipse className="aq11-glow" cx="30" cy="66" rx="16" ry="22" fill="url(#aq11-flame)" />
                    <path d="M30 38v54M16 38 L10 70 L16 92M44 38 L50 70 L44 92M10 70h40" stroke="#e2b857" strokeWidth="1" fill="none" opacity=".7" />
                    <rect x="14" y="92" width="32" height="5" rx="1" fill="url(#aq11-g)" />
                    <path d="M22 97 L30 108 L38 97Z" fill="url(#aq11-g)" />
                    <path d="M30 108v8" stroke="#e2b857" strokeWidth="1.5" />
                </symbol>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq11-overlay ${opened ? 'aq11-hide' : ''}`}>
                    <StarSky paused={opened} />
                    <Moon className="aq11-moon" />
                    <HangingOrnaments />
                    <div className="aq11-overlay-frame">
                        <svg className="aq11-overlay-star" aria-hidden="true">
                            <use href="#aq11-star8" />
                        </svg>
                        <p className="aq11-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq11-eyebrow">Walimatul Aqiqah</p>
                        <div className="aq11-overlay-name aq11-gold-text">{invitation.babyName}</div>
                        {babyGender && (
                            <p className="aq11-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <Ornament className="aq11-ornament-sm" />
                        <p className="aq11-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <div className="aq11-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                                {guestName && greeting?.guestLabel && <small>{greeting.guestLabel}</small>}
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq11-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq11-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(226,184,87,0.5)' }}
                                />
                                <p className="aq11-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq11-cta" onClick={openInvitation}>
                            {(greeting?.buttonText ?? 'Buka Undangan').toUpperCase()}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq11-main ${opened ? 'aq11-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq11-hero" id="top">
                    <StarSky />
                    <Moon className="aq11-moon" />
                    <HangingOrnaments />

                    <div className="aq11-col aq11-hero-inner">
                        <p className="aq11-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq11-eyebrow">Tasyakuran Aqiqah</p>
                        <div className="aq11-mihrab">
                            <svg viewBox="-12 -12 224 324" role="img" aria-label={`Foto ${invitation.babyName}`}>
                                <path
                                    d="M-10 310 L-10 112 C-10 46 56 14 100 -11 C144 14 210 46 210 112 L210 310 Z"
                                    fill="none"
                                    stroke="url(#aq11-g)"
                                    strokeWidth="2"
                                />
                                {babyPhoto ? (
                                    <image
                                        href={babyPhoto}
                                        x="0"
                                        y="0"
                                        width="200"
                                        height="300"
                                        preserveAspectRatio="xMidYMid slice"
                                        clipPath="url(#aq11-arch)"
                                    />
                                ) : (
                                    <>
                                        <rect x="0" y="0" width="200" height="300" fill="#16214f" clipPath="url(#aq11-arch)" />
                                        <text x="100" y="185" textAnchor="middle" className="aq11-mihrab-initial" fill="url(#aq11-g)">
                                            {babyInitial}
                                        </text>
                                    </>
                                )}
                                <path
                                    d="M0 300 L0 114 C0 54 60 24 100 0 C140 24 200 54 200 114 L200 300 Z"
                                    fill="none"
                                    stroke="url(#aq11-g)"
                                    strokeWidth="3"
                                />
                                <use href="#aq11-star8" x="88" y="-24" width="24" height="24" />
                            </svg>
                        </div>
                        <p className="aq11-intro">Dengan rahmat Allah, kami mengundang Anda pada tasyakuran aqiqah</p>
                        <h1 className="aq11-hero-name aq11-gold-text">{invitation.babyName}</h1>
                        {nasabLine && <p className="aq11-bin">{nasabLine}</p>}
                        {invitation.birthDateFormatted && <p className="aq11-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        {primaryParts && (
                            <p className="aq11-datechip">
                                {primaryParts.weekday.toUpperCase()} <span>✦</span> {primaryParts.numeric}
                                {primaryEvent?.time && (
                                    <>
                                        {' '}
                                        <span>✦</span> {primaryEvent.time} WIB
                                    </>
                                )}
                            </p>
                        )}
                        {!coverEnabled && greetingEnabled && coverGuestName && (
                            <div className="aq11-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                            </div>
                        )}
                        <a className="aq11-cta" href="#salam">
                            LIHAT UNDANGAN
                        </a>
                    </div>
                </header>

                {/* ── SALAM / HADITH ───────────────────────────────────────────────── */}
                <section className="aq11-section" id="salam">
                    <div className="aq11-col">
                        <p className="aq11-eyebrow aq11-anim-up">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                        <p className="aq11-arabic aq11-anim-up" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq11-quote aq11-anim-up">
                            “Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama.”
                        </blockquote>
                        <p className="aq11-src aq11-anim-up">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <Ornament className="aq11-anim-up" />
                        <p className="aq11-lead aq11-anim-up">
                            {invitation.openingMessage ||
                                'Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan Tasyakuran Aqiqah buah hati kami.'}
                        </p>
                    </div>
                </section>

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq11-section aq11-section-tight" id="anak">
                        <div className="aq11-col">
                            <p className="aq11-eyebrow aq11-anim-up">Cahaya Kecil Kami</p>
                            <h2 className="aq11-h2 aq11-anim-up">Buah hati yang dinanti</h2>
                            <div className="aq11-star-frame aq11-anim-up">
                                <svg viewBox="0 0 40 40" aria-hidden="true">
                                    <use href="#aq11-star8" />
                                </svg>
                                {babyPhoto ? (
                                    <img src={babyPhoto} alt={`Potret ${invitation.babyName}`} />
                                ) : (
                                    <div className="aq11-star-frame-initial">{babyInitial}</div>
                                )}
                            </div>
                            <p className="aq11-child-name aq11-gold-text aq11-anim-up">{invitation.babyName}</p>
                            {nasabLine && <p className="aq11-bin aq11-anim-up">{nasabLine}</p>}
                            {babyGender && (
                                <div className="aq11-gender-badge aq11-anim-up">
                                    <span>{genderIcon(babyGender)}</span> {babyGender}
                                </div>
                            )}
                            {(invitation.fatherName || invitation.motherName) && (
                                <div className="aq11-parents aq11-anim-up">
                                    <p className="aq11-eyebrow">{parentsLabel}</p>
                                    <p className="aq11-parents-who">
                                        {invitation.fatherName && <>Bpk. {invitation.fatherName}</>}
                                        {invitation.fatherName && invitation.motherName && <i>&amp;</i>}
                                        {invitation.motherName && <>Ibu {invitation.motherName}</>}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── EVENTS + COUNTDOWN ────────────────────────────────────────── */}
                {(showEvents || showCountdown) && (
                    <section className="aq11-section aq11-section-tight" id="acara">
                        <div className="aq11-col aq11-col-wide">
                            <p className="aq11-eyebrow aq11-anim-up">Waktu &amp; Tempat</p>
                            <h2 className="aq11-h2 aq11-anim-up">Insya Allah diselenggarakan pada</h2>
                            {showEvents && (
                                <div className="aq11-events-grid">
                                    {invitation.events.map((ev, i) => {
                                        const parts = formatDateParts(ev.date);
                                        const mapsUrl =
                                            ev.locationUrl ||
                                            (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                        const timeStr = formatTime(ev);
                                        return (
                                            <div key={i} className="aq11-card aq11-anim-up">
                                                <svg className="aq11-card-star" aria-hidden="true">
                                                    <use href="#aq11-star8" />
                                                </svg>
                                                <h3 className="aq11-card-name">{ev.name}</h3>
                                                {parts && (
                                                    <>
                                                        <p className="aq11-day">{parts.weekday.toUpperCase()}</p>
                                                        <p className="aq11-bignum aq11-gold-text">{parts.day}</p>
                                                        <p className="aq11-month">
                                                            {parts.month.toUpperCase()} {parts.year}
                                                        </p>
                                                    </>
                                                )}
                                                {(timeStr || ev.locationName || ev.location) && (
                                                    <div className="aq11-meta">
                                                        {timeStr && <p className="aq11-time">Pukul {timeStr}</p>}
                                                        {ev.locationName && <p>{ev.locationName}</p>}
                                                        {ev.location && <p className="aq11-muted">{ev.location}</p>}
                                                    </div>
                                                )}
                                                <div className="aq11-actions">
                                                    {mapsUrl && (
                                                        <a className="aq11-btn aq11-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                            Buka Peta
                                                        </a>
                                                    )}
                                                    {(ev.locationName || ev.location) && (
                                                        <button className="aq11-btn" type="button" onClick={() => copyAddress(ev)}>
                                                            Salin Alamat
                                                        </button>
                                                    )}
                                                    <button className="aq11-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                        Simpan Tanggal
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {showCountdown && (
                                <div className="aq11-anim-up">
                                    <Countdown
                                        targetDate={invitation.countdownDate}
                                        className="aq11-countdown"
                                        boxClassName="aq11-countdown-box"
                                        numClassName="aq11-countdown-num"
                                        labelClassName="aq11-countdown-label"
                                        doneMessage={
                                            <p className="aq11-past">Acara telah berlangsung. Jazakumullahu khairan atas doa dan kehadirannya.</p>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── LOCATION ──────────────────────────────────────────────────── */}
                {isEnabled('location') &&
                    invitation.events.length > 0 &&
                    (() => {
                        const ev = primaryEvent;
                        const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                        if (!ev.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="aq11-section aq11-section-tight">
                                <div className="aq11-col aq11-col-wide">
                                    <p className="aq11-eyebrow aq11-anim-up">Peta</p>
                                    <h2 className="aq11-h2 aq11-anim-up">Lokasi Acara</h2>
                                    {ev.locationName && (
                                        <p className="aq11-location-sub aq11-anim-up">
                                            {ev.name} · {ev.locationName}
                                        </p>
                                    )}
                                    <div className="aq11-map-container aq11-anim-up">
                                        {ev.mapsEmbed && (
                                            <div className="aq11-map-wrapper">
                                                <iframe
                                                    src={ev.mapsEmbed}
                                                    width="100%"
                                                    height="380"
                                                    style={{ border: 0, display: 'block' }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    title={`Lokasi ${ev.locationName || ev.name}`}
                                                />
                                            </div>
                                        )}
                                        {mapsUrl && (
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq11-cta">
                                                BUKA GOOGLE MAPS
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="aq11-section aq11-section-tight">
                        <div className="aq11-col aq11-col-xwide">
                            <p className="aq11-eyebrow aq11-anim-up">Momen Berharga</p>
                            <h2 className="aq11-h2 aq11-anim-up">Galeri Foto</h2>
                            <Ornament className="aq11-anim-up aq11-ornament-gap" />
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'aq11-gallery-grid',
                                    item: 'aq11-gallery-item',
                                    thumb: 'aq11-gallery-thumb',
                                    overlay: 'aq11-gallery-overlay',
                                    filterBar: 'aq11-gallery-filter-bar',
                                    filterBtn: 'aq11-filter-btn',
                                    filterBtnActive: 'aq11-filter-btn aq11-filter-btn-active',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq11-section aq11-section-tight">
                        <div className="aq11-col aq11-col-wide">
                            <p className="aq11-eyebrow aq11-anim-up">Kenangan</p>
                            <h2 className="aq11-h2 aq11-anim-up">Video Si Kecil</h2>
                            <Ornament className="aq11-anim-up aq11-ornament-gap" />
                            <div className="aq11-video-frame aq11-anim-up">
                                <iframe
                                    src={babyVideoEmbedUrl}
                                    title="Video Kenangan"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* ── DIGITAL GIFT ──────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq11-section aq11-section-tight">
                        <div className="aq11-col aq11-col-xwide">
                            <p className="aq11-eyebrow aq11-anim-up">Tanda Kasih</p>
                            <h2 className="aq11-h2 aq11-anim-up">Amplop Digital</h2>
                            <p className="aq11-lead aq11-anim-up">
                                Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                                kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                            </p>
                            <Ornament className="aq11-anim-up aq11-ornament-gap" />
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'aq11-bank-grid',
                                    bankCard: 'aq11-bank-card',
                                    bankLogo: 'aq11-bank-logo',
                                    bankType: 'aq11-bank-type',
                                    bankNumber: 'aq11-bank-number',
                                    bankName: 'aq11-bank-name',
                                    copyBankBtn: 'aq11-btn-copy-bank',
                                    ewalletGrid: 'aq11-ewallet-grid',
                                    ewalletCard: 'aq11-ewallet-card',
                                    ewalletName: 'aq11-ewallet-name',
                                    ewalletPhone: 'aq11-ewallet-phone',
                                    copyEwalletBtn: 'aq11-btn-copy-ewallet',
                                    ewalletTitle: 'aq11-ewallet-title',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq11-section aq11-section-tight" id="rsvp">
                        <div className="aq11-col">
                            <p className="aq11-eyebrow aq11-anim-up">RSVP &amp; Doa</p>
                            <h2 className="aq11-h2 aq11-anim-up">Titipkan doa untuk si kecil</h2>
                            <p className="aq11-hint aq11-anim-up">Mohon konfirmasi kehadiran Anda di bawah ini.</p>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'aq11-rsvp-form',
                                    label: 'aq11-rsvp-label',
                                    input: 'aq11-rsvp-input',
                                    select: 'aq11-rsvp-select',
                                    textarea: 'aq11-rsvp-textarea',
                                    radioGroup: 'aq11-rsvp-radio-group',
                                    radioLabel: 'aq11-rsvp-radio-label',
                                    errorText: 'aq11-rsvp-error',
                                    submitBtn: 'aq11-rsvp-submit',
                                    successBox: 'aq11-rsvp-success',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq11-section aq11-section-tight">
                        <div className="aq11-col aq11-col-xwide">
                            <p className="aq11-eyebrow aq11-anim-up">Untaian Doa</p>
                            <h2 className="aq11-h2 aq11-anim-up">Ucapan &amp; Doa</h2>
                            <Ornament className="aq11-anim-up aq11-ornament-gap" />
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'aq11-wishes-layout',
                                    formBox: 'aq11-wishes-form',
                                    formTitle: 'aq11-wishes-form-title',
                                    nameInput: 'aq11-wish-input',
                                    messageInput: 'aq11-wish-input',
                                    submitBtn: 'aq11-wish-btn',
                                    wishCard: 'aq11-wish-card',
                                    wishAvatar: 'aq11-wish-avatar',
                                    wishName: 'aq11-wish-name',
                                    wishDate: 'aq11-wish-date',
                                    wishMessage: 'aq11-wish-message',
                                    loadMoreBtn: 'aq11-btn-more',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <>
                        <section className="aq11-section aq11-section-tight aq11-closing">
                            <div className="aq11-col">
                                <Ornament className="aq11-anim-up aq11-ornament-flush" />
                                <p className="aq11-lead aq11-anim-up">
                                    Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                    restu.
                                </p>
                                <p className="aq11-closing-salam aq11-anim-up">Wassalamu’alaikum Warahmatullahi Wabarakatuh</p>
                                <p className="aq11-eyebrow aq11-closing-from aq11-anim-up">Kami yang berbahagia</p>
                                {(invitation.fatherName || invitation.motherName) && (
                                    <p className="aq11-family aq11-anim-up">
                                        Kel. {invitation.fatherName && <>Bpk. {invitation.fatherName}</>}
                                        {invitation.fatherName && invitation.motherName && <br />}
                                        {invitation.motherName && (
                                            <>
                                                {invitation.fatherName ? '& ' : ''}Ibu {invitation.motherName}
                                            </>
                                        )}
                                    </p>
                                )}
                            </div>
                        </section>
                        <footer className="aq11-footer">CREATED WITH LOVE ✦ UNDESIA DIGITAL INVITATION</footer>
                    </>
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
                    buttonStyle={{ background: 'linear-gradient(180deg,#f4dc9a,#e2b857)', border: '2px solid #0a1231', color: '#0a1231' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq11-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq11-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">
                    ↑
                </button>
            )}
        </div>
    );
}
