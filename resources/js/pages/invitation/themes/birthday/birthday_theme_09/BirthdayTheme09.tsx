import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { BirthdayInvitation, Greeting } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './birthday-theme-09.css';

interface BirthdayTheme09Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['📺', '🎬', '🍿', '🎉', '🦸'];
const CONFETTI_DELAY_MS = 3600;

function addToCalendar(ev: BirthdayInvitation['events'][0], celebrant: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '100000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '140000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Ulang Tahun ${celebrant}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

function formatAge(age: string | number): string {
    const str = String(age ?? '').trim();
    if (!str) return '';
    return /^\d+$/.test(str) ? `${str} Tahun` : str;
}

// Retro TV scene, adapted from the theme's original static template animation.
// `staticView` renders the finished state (last channel already showing, no
// power-on flicker) without needing the `.bt9-aksi` entrance trigger — used
// for the compact cover illustration.
function RetroTvSceneIllustration({ className, id, staticView }: { className?: string; id?: string; staticView?: boolean }) {
    return (
        <svg
            id={id}
            className={`${className ?? ''}${staticView ? ' bt9-adegan-static' : ''}`}
            viewBox="0 0 400 330"
            role="img"
            aria-label="Animasi televisi retro menyala lalu berganti saluran menampilkan kucing pahlawan, robot, alien, dan bintang ulang tahun"
        >
            {/* antena */}
            <g className="bt9-antena">
                <path d="M186 52 L124 12 M214 52 L282 14" stroke="#C9B08A" strokeWidth="6" strokeLinecap="round" />
                <circle cx="124" cy="12" r="8" fill="#F7C543" />
                <circle cx="282" cy="14" r="8" fill="#E8474B" />
            </g>

            {/* badan tv */}
            <rect x="26" y="48" width="348" height="228" rx="26" fill="#9A5230" />
            <rect x="26" y="48" width="348" height="228" rx="26" fill="none" stroke="#71391F" strokeWidth="6" />
            <rect x="40" y="62" width="252" height="200" rx="20" fill="#2A2338" />

            {/* LAYAR */}
            <svg x="46" y="68" width="240" height="188" viewBox="0 0 240 188">
                <rect x="0" y="0" width="240" height="188" rx="14" fill="#10131C" />

                {/* ===== SALURAN 1: kucing pahlawan ===== */}
                <g className="bt9-saluran bt9-ch1">
                    <rect x="0" y="0" width="240" height="188" fill="#2BB3A4" />
                    <circle cx="120" cy="98" r="70" fill="#1E9A8D" />
                    <path d="M84 78 q-34 34 -24 84 h120 q10 -50 -24 -84 z" fill="#E8474B" />
                    <ellipse cx="120" cy="150" rx="42" ry="30" fill="#F2A03D" />
                    <path d="M88 56 l4 -26 l22 16 z M152 56 l-4 -26 l-22 16 z" fill="#F2A03D" />
                    <circle cx="120" cy="86" r="42" fill="#F2A03D" />
                    <path d="M80 78 h80 q4 16 -8 18 q-10 10 -32 0 q-12 2 -8 -18 z" fill="#5D4CA8" />
                    <ellipse cx="104" cy="84" rx="8" ry="6" fill="#F8EBD4" />
                    <ellipse cx="136" cy="84" rx="8" ry="6" fill="#F8EBD4" />
                    <ellipse cx="120" cy="104" rx="16" ry="12" fill="#F8EBD4" />
                    <path d="M120 100 l-5 4 h10 z" fill="#E8474B" />
                    <path d="M120 104 v4 M120 108 q-6 5 -10 0 M120 108 q6 5 10 0" stroke="#8A5A32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M96 102 l-16 -4 M96 108 l-16 4 M144 102 l16 -4 M144 108 l16 4" stroke="#8A5A32" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* ===== SALURAN 2: robot ceria ===== */}
                <g className="bt9-saluran bt9-ch2">
                    <rect x="0" y="0" width="240" height="188" fill="#F7C543" />
                    <circle cx="120" cy="100" r="72" fill="#F0B22A" />
                    <path d="M120 34 v-14" stroke="#6E7A88" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="120" cy="16" r="8" fill="#E8474B" />
                    <rect x="80" y="36" width="80" height="66" rx="16" fill="#C3CDD8" stroke="#6E7A88" strokeWidth="4" />
                    <circle cx="102" cy="64" r="11" fill="#22B3A4" />
                    <circle cx="138" cy="64" r="11" fill="#22B3A4" />
                    <circle cx="105" cy="61" r="4" fill="#fff" />
                    <circle cx="141" cy="61" r="4" fill="#fff" />
                    <rect x="98" y="82" width="44" height="10" rx="5" fill="#6E7A88" />
                    <path d="M104 82 v10 M112 82 v10 M120 82 v10 M128 82 v10 M136 82 v10" stroke="#C3CDD8" strokeWidth="2" />
                    <rect x="90" y="108" width="60" height="56" rx="12" fill="#9AA7B4" stroke="#6E7A88" strokeWidth="4" />
                    <circle cx="120" cy="132" r="14" fill="#E8474B" />
                    <path d="M120 126 l5 5 -5 8 -5 -8 z" fill="#F8EBD4" />
                    <rect x="62" y="112" width="24" height="12" rx="6" fill="#9AA7B4" stroke="#6E7A88" strokeWidth="4" />
                    <g className="bt9-lambai">
                        <rect x="154" y="112" width="24" height="12" rx="6" fill="#9AA7B4" stroke="#6E7A88" strokeWidth="4" />
                        <circle cx="184" cy="118" r="10" fill="#C3CDD8" stroke="#6E7A88" strokeWidth="4" />
                    </g>
                </g>

                {/* ===== SALURAN 3: alien ramah ===== */}
                <g className="bt9-saluran bt9-ch3">
                    <rect x="0" y="0" width="240" height="188" fill="#5D4CA8" />
                    <circle cx="44" cy="36" r="4" fill="#F8EBD4" />
                    <circle cx="196" cy="30" r="5" fill="#F8EBD4" />
                    <circle cx="176" cy="150" r="3.5" fill="#F8EBD4" />
                    <circle cx="56" cy="150" r="4" fill="#F8EBD4" />
                    <ellipse cx="120" cy="168" rx="66" ry="14" fill="#3E3184" />
                    <path d="M104 46 q-6 -18 -20 -22 M136 46 q6 -18 20 -22" stroke="#4FBF6A" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <circle cx="82" cy="22" r="8" fill="#F7C543" />
                    <circle cx="158" cy="22" r="8" fill="#F7C543" />
                    <ellipse cx="120" cy="106" rx="52" ry="58" fill="#6FD36F" />
                    <ellipse cx="120" cy="126" rx="34" ry="34" fill="#A5E8A5" />
                    <ellipse cx="102" cy="88" rx="15" ry="19" fill="#F8EBD4" />
                    <ellipse cx="138" cy="88" rx="15" ry="19" fill="#F8EBD4" />
                    <circle cx="104" cy="92" r="7" fill="#2A2338" />
                    <circle cx="140" cy="92" r="7" fill="#2A2338" />
                    <path d="M104 124 q16 16 32 0" stroke="#2A2338" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M68 112 q-22 4 -26 22" stroke="#6FD36F" strokeWidth="12" fill="none" strokeLinecap="round" />
                    <g className="bt9-lambai">
                        <path d="M172 112 q22 0 28 -20" stroke="#6FD36F" strokeWidth="12" fill="none" strokeLinecap="round" />
                    </g>
                </g>

                {/* ===== SALURAN 4: bintang ulang tahun ===== */}
                <g className="bt9-saluran bt9-ch4">
                    <rect x="0" y="0" width="240" height="188" fill="#E8474B" />
                    <path
                        d="M120 -30 L142 60 L232 40 L160 96 L232 152 L142 132 L120 220 L98 132 L8 152 L80 96 L8 40 L98 60 Z"
                        fill="#F26065"
                    />
                    <path d="M86 74 q-32 32 -22 86 h112 q10 -54 -22 -86 z" fill="#5D4CA8" />
                    <ellipse cx="120" cy="140" rx="40" ry="34" fill="#22B3A4" />
                    <circle cx="120" cy="80" r="38" fill="#F2C08E" />
                    <path d="M84 74 h72 q3 15 -8 17 q-10 9 -28 0 q-11 2 -8 -17 z" fill="#F7C543" />
                    <ellipse cx="104" cy="80" rx="7" ry="5.5" fill="#2A2338" />
                    <ellipse cx="136" cy="80" rx="7" ry="5.5" fill="#2A2338" />
                    <path d="M108 98 q12 9 24 0" stroke="#2A2338" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                    <path d="M96 46 q24 -18 48 -2 q-10 -22 -30 -20 q-18 2 -18 22 z" fill="#4A3524" />
                    <rect x="146" y="140" width="42" height="26" rx="6" fill="#F8EBD4" />
                    <rect x="146" y="134" width="42" height="10" rx="5" fill="#FFD9E2" />
                    <rect x="164" y="116" width="6" height="18" rx="3" fill="#22B3A4" />
                    <path d="M167 112 c5 5 4 9 0 11 c-4 -2 -5 -6 0 -11 z" fill="#F7C543" />
                </g>

                {/* ===== statik ===== */}
                <g className="bt9-statik">
                    <rect x="0" y="0" width="240" height="188" fill="#3A3A44" />
                    <g className="bt9-derau" opacity=".9">
                        <rect x="0" y="0" width="240" height="6" fill="#8C8C99" />
                        <rect x="0" y="14" width="180" height="5" fill="#DADAE2" />
                        <rect x="0" y="26" width="240" height="7" fill="#5A5A66" />
                        <rect x="0" y="42" width="120" height="5" fill="#B4B4C0" />
                        <rect x="0" y="54" width="240" height="6" fill="#7A7A88" />
                        <rect x="0" y="70" width="200" height="4" fill="#EDEDF2" />
                        <rect x="0" y="82" width="240" height="7" fill="#4C4C58" />
                        <rect x="0" y="98" width="150" height="5" fill="#C6C6D0" />
                        <rect x="0" y="112" width="240" height="6" fill="#8C8C99" />
                        <rect x="0" y="126" width="210" height="4" fill="#DADAE2" />
                        <rect x="0" y="138" width="240" height="7" fill="#5A5A66" />
                        <rect x="0" y="154" width="130" height="5" fill="#B4B4C0" />
                        <rect x="0" y="166" width="240" height="6" fill="#7A7A88" />
                        <rect x="0" y="180" width="190" height="6" fill="#C6C6D0" />
                        <rect x="0" y="194" width="240" height="6" fill="#8C8C99" />
                    </g>
                </g>

                {/* kilat saat tv menyala */}
                <rect className="bt9-kilat" x="0" y="0" width="240" height="188" fill="#F8EBD4" />

                {/* pantulan kaca */}
                <path d="M0 0 L86 0 L20 188 L0 188 Z" fill="#fff" opacity=".07" />
                <rect x="0" y="0" width="240" height="188" rx="14" fill="none" stroke="#000" strokeWidth="8" opacity=".25" />
            </svg>

            {/* panel kanan */}
            <rect x="300" y="62" width="60" height="200" rx="14" fill="#B0693F" />
            <g className="bt9-kenop">
                <circle cx="330" cy="100" r="19" fill="#F8EBD4" stroke="#71391F" strokeWidth="4" />
                <rect x="328" y="86" width="5" height="12" rx="2.5" fill="#71391F" />
            </g>
            <circle cx="330" cy="150" r="14" fill="#2A2338" stroke="#71391F" strokeWidth="4" />
            <text className="bt9-nomor bt9-no1" x="330" y="156" textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize="16" fill="#F7C543">
                1
            </text>
            <text className="bt9-nomor bt9-no2" x="330" y="156" textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize="16" fill="#F7C543">
                2
            </text>
            <text className="bt9-nomor bt9-no3" x="330" y="156" textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize="16" fill="#F7C543">
                3
            </text>
            <text className="bt9-nomor bt9-no4" x="330" y="156" textAnchor="middle" fontFamily="Luckiest Guy, sans-serif" fontSize="16" fill="#F7C543">
                4
            </text>
            <g stroke="#8A4B2A" strokeWidth="4" strokeLinecap="round">
                <path d="M314 182 h32 M314 192 h32 M314 202 h32" />
            </g>
            <circle className="bt9-siar" cx="330" cy="230" r="9" fill="#E8474B" />

            {/* kaki tv */}
            <path d="M74 276 l-16 34 h30 l10 -34 z" fill="#71391F" />
            <path d="M326 276 l16 34 h-30 l-10 -34 z" fill="#71391F" />
        </svg>
    );
}

export default function BirthdayTheme09({ invitation, visitor, greeting }: BirthdayTheme09Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [runId, setRunId] = useState(0);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

    // Scroll-triggered reveal animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt9-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt9-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const rainConfetti = () => {
        if (reducedMotion) return;
        const colors = ['#E8474B', '#F7C543', '#22B3A4', '#5D4CA8', '#F8EBD4'];
        for (let i = 0; i < 80; i++) {
            const k = document.createElement('span');
            k.className = 'bt9-confetti';
            k.style.left = Math.random() * 100 + 'vw';
            k.style.background = colors[i % colors.length];
            k.style.animationDuration = 2.3 + Math.random() * 2.2 + 's';
            k.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 5400);
        }
    };

    // Channel-flip entrance sequence plays once the invitation opens, and can be replayed on demand
    useEffect(() => {
        if (!opened || !confettiEnabled) return;
        const timer = setTimeout(rainConfetti, CONFETTI_DELAY_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, runId, confettiEnabled]);

    const openInvitation = () => setOpened(true);
    const replayBroadcast = () => {
        if (reducedMotion) return;
        setRunId((n) => n + 1);
    };

    const celebrantPhoto = invitation.celebrantPhoto;
    const age = invitation.celebrantAge ?? '';
    const displayName = invitation.celebrantNickname || invitation.celebrantName;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];

    return (
        <div className="bt9-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Figtree:wght@400;600;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt9-cover${opened ? ' bt9-hide' : ''}`}>
                    {confettiEnabled && (
                        <>
                            <span className="bt9-cover-sparkle bt9-cover-sparkle-1" aria-hidden="true">
                                📺
                            </span>
                            <span className="bt9-cover-sparkle bt9-cover-sparkle-2" aria-hidden="true">
                                ⭐
                            </span>
                            <span className="bt9-cover-sparkle bt9-cover-sparkle-3" aria-hidden="true">
                                🎈
                            </span>
                            <span className="bt9-cover-sparkle bt9-cover-sparkle-4" aria-hidden="true">
                                📺
                            </span>
                        </>
                    )}

                    <div className="bt9-cover-card">
                        <span className="bt9-cover-tag">Saluran spesial · Ulang tahun</span>
                        <RetroTvSceneIllustration className="bt9-cover-scene" staticView />
                        <p className="bt9-cover-subtitle">Studio kami buka satu hari saja, siaran langsung penuh kejutan dan kostum favoritmu</p>
                        <h1 className="bt9-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt9-cover-age-badge">🎬 Genap {formatAge(age)} 🎬</div>}
                        {invitation.mainDateFormatted && <p className="bt9-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt9-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt9-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt9-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt9-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid var(--bt9-ungu)' }} />
                                <p className="bt9-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt9-btn-open" onClick={openInvitation}>
                            📺 {greeting?.buttonText ?? 'Nyalakan Siaran'} 📺
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt9-main${opened ? ' bt9-main-visible' : ''}`}>
                {/* HERO / STUDIO STAGE */}
                <section className="bt9-hero">
                    <div key={runId} className={`bt9-stage${opened ? ' bt9-aksi' : ''}`}>
                        <div className="bt9-panel">
                            <p className="bt9-eyebrow">Saluran spesial ulang tahun</p>
                            <RetroTvSceneIllustration className="bt9-adegan" />
                        </div>

                        <div className="bt9-teks-hero">
                            <p className="bt9-cap">Sedang tayang</p>
                            <h1 className="bt9-nama">{displayName}</h1>
                            {age !== '' && <p className="bt9-umur">Genap {formatAge(age)}</p>}
                            <p className="bt9-pengantar">
                                Studio kami buka satu hari saja. Datang pakai kostum karakter favoritmu — pahlawan, robot, alien, atau ciptaanmu
                                sendiri.
                            </p>
                            {invitation.mainDateFormatted && <p className="bt9-hero-date">{invitation.mainDateFormatted}</p>}

                            {isEnabled('countdown') && mainEvent && (
                                <Countdown
                                    targetDate={invitation.countdownDate}
                                    className="bt9-countdown"
                                    boxClassName="bt9-countdown-box"
                                    numClassName="bt9-countdown-num"
                                    labelClassName="bt9-countdown-label"
                                    labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                    doneMessage={
                                        <div className="bt9-countdown-done">
                                            <div className="bt9-countdown-done-emoji">📺🎉⭐</div>
                                            <h3>Selamat Ulang Tahun!</h3>
                                        </div>
                                    }
                                />
                            )}

                            <button className="bt9-btn-replay" onClick={replayBroadcast}>
                                Ganti saluran lagi
                            </button>
                            <div className="bt9-scroll-indicator">↓</div>
                        </div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt9-section bt9-profile-bg">
                        <h2 className="bt9-section-title bt9-anim-up">Sang Bintang Utama</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>⭐</span>
                        </div>
                        <div className="bt9-profile-card bt9-anim-up">
                            <div className="bt9-profile-photo-frame">
                                <div
                                    className="bt9-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🦸'}
                                </div>
                            </div>
                            <h3 className="bt9-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt9-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt9-profile-tags">
                                {age !== '' && <span className="bt9-profile-tag">🎬 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt9-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt9-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt9-section bt9-events-bg">
                        <h2 className="bt9-section-title bt9-light bt9-anim-up">Jadwal Tayang</h2>
                        <div className="bt9-divider bt9-light bt9-anim-up">
                            <span>📅</span>
                        </div>
                        <div className="bt9-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt9-event-card bt9-anim-up">
                                        <span className="bt9-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt9-event-name">{ev.name}</h3>
                                        <div className="bt9-event-divider" />
                                        <p className="bt9-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt9-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt9-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt9-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt9-btn-event" onClick={() => addToCalendar(ev, displayName)}>
                                                📅 Simpan ke Kalender
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* LOCATION */}
                {isEnabled('location') &&
                    invitation.events.length > 0 &&
                    (() => {
                        const ev = mainEvent ?? invitation.events[0];
                        const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                        if (!ev.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="bt9-section">
                                <h2 className="bt9-section-title bt9-anim-up">Lokasi Studio</h2>
                                <div className="bt9-divider bt9-anim-up">
                                    <span>📍</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt9-location-sub bt9-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt9-map-container bt9-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt9-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt9-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* LIFE JOURNEY */}
                {isEnabled('love_story') && invitation.lifeJourney?.length > 0 && (
                    <section className="bt9-section bt9-timeline-bg">
                        <h2 className="bt9-section-title bt9-anim-up">Episode Kenangan</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>🎞️</span>
                        </div>
                        <p className="bt9-section-sub bt9-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt9-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt9-timeline-item bt9-anim-up">
                                    <div className="bt9-timeline-dot">🎬</div>
                                    <div className="bt9-timeline-card">
                                        {item.photo && <div className="bt9-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt9-timeline-date">{item.date}</p>
                                        <h3 className="bt9-timeline-title">{item.title}</h3>
                                        <p className="bt9-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt9-section bt9-gallery-bg">
                        <h2 className="bt9-section-title bt9-anim-up">Galeri Adegan</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt9-gallery-grid',
                                item: 'bt9-gallery-item',
                                thumb: 'bt9-gallery-thumb',
                                overlay: 'bt9-gallery-overlay',
                                filterBar: 'bt9-gallery-filter-bar',
                                filterBtn: 'bt9-filter-btn',
                                filterBtnActive: 'bt9-filter-btn bt9-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt9-section">
                        <h2 className="bt9-section-title bt9-anim-up">Video Kenangan</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt9-video-frame bt9-anim-up">
                            <iframe
                                src={videoEmbedUrl}
                                title="Video Kenangan"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* DIGITAL GIFT */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="bt9-section bt9-gift-bg">
                        <h2 className="bt9-section-title bt9-light bt9-anim-up">Kado buat Bintang</h2>
                        <div className="bt9-divider bt9-light bt9-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt9-gift-subtitle bt9-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt9-bank-grid',
                                bankCard: 'bt9-bank-card',
                                bankLogo: 'bt9-bank-logo',
                                bankType: 'bt9-bank-type',
                                bankNumber: 'bt9-bank-number',
                                bankName: 'bt9-bank-name',
                                copyBankBtn: 'bt9-btn-copy-bank',
                                ewalletGrid: 'bt9-ewallet-grid',
                                ewalletCard: 'bt9-ewallet-card',
                                ewalletName: 'bt9-ewallet-name',
                                ewalletPhone: 'bt9-ewallet-phone',
                                copyEwalletBtn: 'bt9-btn-copy-ewallet',
                                ewalletTitle: 'bt9-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt9-section">
                        <h2 className="bt9-section-title bt9-anim-up">Daftar Bintang Tamu</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt9-rsvp-form',
                                label: 'bt9-rsvp-label',
                                input: 'bt9-rsvp-input',
                                select: 'bt9-rsvp-select',
                                textarea: 'bt9-rsvp-textarea',
                                radioGroup: 'bt9-rsvp-radio-group',
                                radioLabel: 'bt9-rsvp-radio-label',
                                errorText: 'bt9-rsvp-error',
                                submitBtn: 'bt9-rsvp-submit',
                                successBox: 'bt9-rsvp-success',
                            }}
                            labels={{
                                attending: '📺 Siap Naik Panggung',
                                notAttending: '😢 Maaf, Belum Bisa',
                                maybe: '🤔 Masih Ragu',
                                submit: '📺 Kirim Konfirmasi 📺',
                                successTitle: '⭐ Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di studio!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt9-section bt9-wishes-bg">
                        <h2 className="bt9-section-title bt9-anim-up">Ucapan &amp; Semangat</h2>
                        <div className="bt9-divider bt9-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt9-wishes-layout',
                                formBox: 'bt9-wishes-form',
                                formTitle: 'bt9-wishes-form-title',
                                nameInput: 'bt9-wish-input',
                                messageInput: 'bt9-wish-input',
                                submitBtn: 'bt9-wish-btn',
                                wishCard: 'bt9-wish-card',
                                wishAvatar: 'bt9-wish-avatar',
                                wishName: 'bt9-wish-name',
                                wishDate: 'bt9-wish-date',
                                wishMessage: 'bt9-wish-message',
                                loadMoreBtn: 'bt9-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt9-closing">
                        <span className="bt9-closing-sparkle bt9-closing-sparkle-1" aria-hidden="true">
                            📺
                        </span>
                        <span className="bt9-closing-sparkle bt9-closing-sparkle-2" aria-hidden="true">
                            ⭐
                        </span>
                        <div className="bt9-closing-frame bt9-anim-up">
                            <p className="bt9-closing-emoji">📺🎉⭐</p>
                            <p className="bt9-closing-title">Terima Kasih</p>
                            <p className="bt9-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt9-closing-from">Sampai jumpa di studio,</p>
                            <p className="bt9-closing-name">{displayName}</p>
                            <div className="bt9-closing-line" />
                            <p className="bt9-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </div>
                    </section>
                )}
            </div>
            {/* end main */}

            {/* Music */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--bt9-kuning)', border: '2px solid var(--bt9-ungu)', color: 'var(--bt9-ungu)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt9-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt9-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
