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
import './birthday-theme-08.css';

interface BirthdayTheme08Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🦒', '🦓', '🦁', '🐘', '🎪'];
const CONFETTI_DELAY_MS = 3300;

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

// Safari jeep scene, adapted from the theme's original static template animation.
// `staticView` renders the finished state (jeep already arrived, dust settled, animals
// already peeking out) without needing the `.bt8-aksi` entrance trigger — used for the
// compact cover illustration.
function SafariSceneIllustration({ className, id, staticView }: { className?: string; id?: string; staticView?: boolean }) {
    return (
        <svg
            id={id}
            className={`${className ?? ''}${staticView ? ' bt8-adegan-static' : ''}`}
            viewBox="0 0 400 280"
            role="img"
            aria-label="Animasi jip safari melaju masuk lalu jerapah, zebra, singa, gajah, dan monyet bermunculan dari balik rumput"
        >
            {/* matahari & burung */}
            <circle cx="316" cy="58" r="34" fill="#FFE7A8" opacity=".55" />
            <circle cx="316" cy="58" r="24" fill="#FFF3CE" />
            <g className="bt8-burung" stroke="#6B4A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".7">
                <path d="M40 46 q7 -7 14 0 q7 -7 14 0 M84 66 q6 -6 12 0 q6 -6 12 0" />
            </g>

            {/* pohon akasia */}
            <path d="M52 205 v-64" stroke="#6B4A2A" strokeWidth="9" strokeLinecap="round" />
            <path d="M52 148 l-24 -18 M52 152 l26 -16" stroke="#6B4A2A" strokeWidth="7" strokeLinecap="round" />
            <path d="M8 122 q44 -30 92 0 q-46 12 -92 0 z" fill="#5A6D2A" />
            <path d="M14 116 q40 -24 82 0 q-42 10 -82 0 z" fill="#6E8434" />
            <path d="M368 205 v-42" stroke="#6B4A2A" strokeWidth="7" strokeLinecap="round" />
            <path d="M340 146 q30 -22 62 0 q-32 10 -62 0 z" fill="#5A6D2A" />

            {/* monyet bergelantungan */}
            <g className="bt8-monyet">
                <path d="M78 132 q10 12 4 24" fill="none" stroke="#8A5A32" strokeWidth="5" strokeLinecap="round" />
                <circle cx="80" cy="170" r="15" fill="#A66C3C" />
                <circle cx="80" cy="152" r="12" fill="#A66C3C" />
                <circle cx="69" cy="150" r="5" fill="#C99565" />
                <circle cx="91" cy="150" r="5" fill="#C99565" />
                <ellipse cx="80" cy="155" rx="8" ry="6" fill="#E6C39A" />
                <circle cx="77" cy="150" r="2" fill="#3B2A1C" />
                <circle cx="84" cy="150" r="2" fill="#3B2A1C" />
            </g>

            {/* JERAPAH */}
            <g className="bt8-hewan" style={{ ['--bt8-tunda' as string]: '1.5s' }}>
                <path d="M128 208 L124 124 L150 120 L152 208 Z" fill="#EDBB5E" />
                <ellipse cx="130" cy="140" rx="6" ry="5" fill="#B57B34" />
                <ellipse cx="144" cy="164" rx="6" ry="5" fill="#B57B34" />
                <ellipse cx="131" cy="186" rx="6" ry="5" fill="#B57B34" />
                <path d="M126 108 v-10 M146 106 v-10" stroke="#8A5A32" strokeWidth="5" strokeLinecap="round" />
                <circle cx="126" cy="94" r="5" fill="#8A5A32" />
                <circle cx="146" cy="92" r="5" fill="#8A5A32" />
                <ellipse cx="140" cy="114" rx="28" ry="17" fill="#EDBB5E" transform="rotate(-8 140 114)" />
                <ellipse cx="160" cy="118" rx="12" ry="9" fill="#D9A24C" transform="rotate(-8 160 118)" />
                <circle cx="134" cy="107" r="3.2" fill="#3B2A1C" />
                <path d="M118 106 l-12 -6" stroke="#EDBB5E" strokeWidth="9" strokeLinecap="round" />
            </g>

            {/* ZEBRA */}
            <g className="bt8-hewan" style={{ ['--bt8-tunda' as string]: '1.95s' }}>
                <path d="M186 156 l-4 -16 l12 8 z M206 152 l6 -16 l6 16 z" fill="#F7F2E6" stroke="#2B2620" strokeWidth="3" />
                <ellipse cx="198" cy="180" rx="27" ry="22" fill="#F7F2E6" />
                <path
                    d="M186 162 q10 6 8 18 M198 158 q2 10 0 22 M210 162 q-8 6 -6 18 M176 182 q10 2 12 10 M220 182 q-10 2 -12 10"
                    stroke="#2B2620"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                />
                <ellipse cx="198" cy="199" rx="13" ry="10" fill="#4A4139" />
                <circle cx="194" cy="199" r="2.5" fill="#2B2620" />
                <circle cx="203" cy="199" r="2.5" fill="#2B2620" />
                <circle cx="188" cy="174" r="3.4" fill="#2B2620" />
                <circle cx="209" cy="174" r="3.4" fill="#2B2620" />
            </g>

            {/* SINGA */}
            <g className="bt8-hewan" style={{ ['--bt8-tunda' as string]: '2.4s' }}>
                <circle cx="266" cy="176" r="34" fill="#C8873D" />
                <circle cx="266" cy="176" r="27" fill="#B3762F" opacity=".5" />
                <circle cx="250" cy="152" r="8" fill="#E8B978" />
                <circle cx="282" cy="152" r="8" fill="#E8B978" />
                <circle cx="266" cy="180" r="23" fill="#E8B978" />
                <circle cx="258" cy="174" r="3.4" fill="#3B2A1C" />
                <circle cx="274" cy="174" r="3.4" fill="#3B2A1C" />
                <path d="M266 184 l-6 4 h12 z" fill="#8A5A32" />
                <path d="M266 188 v5 M266 193 q-7 6 -12 0 M266 193 q7 6 12 0" fill="none" stroke="#8A5A32" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* GAJAH */}
            <g className="bt8-hewan" style={{ ['--bt8-tunda' as string]: '2.85s' }}>
                <ellipse cx="308" cy="180" rx="22" ry="27" fill="#7E8B98" />
                <ellipse cx="340" cy="178" rx="30" ry="29" fill="#94A1AE" />
                <path d="M352 196 q10 14 2 26 q-2 8 -10 6" fill="none" stroke="#94A1AE" strokeWidth="15" strokeLinecap="round" />
                <path d="M330 200 q-4 10 -10 12 M348 202 q4 8 10 10" stroke="#F7F2E6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="334" cy="170" r="3.4" fill="#3B2A1C" />
                <circle cx="352" cy="170" r="3.4" fill="#3B2A1C" />
            </g>

            {/* tanah */}
            <rect x="-20" y="205" width="440" height="90" fill="#7A8F3C" />
            <path d="M-20 205 h440" stroke="#5A6D2A" strokeWidth="5" />
            <g className="bt8-ilalang" fill="#5A6D2A">
                <path
                    d="M10 206 q4 -20 10 -24 q-2 16 2 24 z M40 206 q-4 -18 -10 -22 q3 14 0 22 z M96 206 q4 -22 12 -26 q-4 18 0 26 z
                   M240 206 q-5 -20 -12 -24 q4 16 1 24 z M300 206 q5 -18 12 -22 q-4 14 -1 22 z M368 206 q4 -22 12 -25 q-5 17 -1 25 z"
                />
            </g>

            {/* JIP */}
            <g className="bt8-jip">
                <g className="bt8-debu">
                    <circle cx="96" cy="246" r="12" fill="#E8DCC0" />
                    <circle cx="76" cy="238" r="8" fill="#F2EAD6" />
                </g>
                <g className="bt8-badan-jip">
                    {/* atap & tiang */}
                    <rect x="136" y="186" width="112" height="9" rx="4" fill="#FDF4E3" />
                    <rect x="140" y="182" width="104" height="6" rx="3" fill="#3B2A1C" opacity=".25" />
                    <rect x="140" y="192" width="7" height="30" fill="#6B4A2A" />
                    <rect x="238" y="192" width="7" height="30" fill="#6B4A2A" />
                    {/* bodi */}
                    <path
                        d="M118 250 h164 c8 0 12 -5 12 -12 v-14 h-32 l-12 -18 h-120 c-8 0 -12 5 -12 12 v22 c0 6 4 10 0 10 z"
                        fill="#C89F5D"
                    />
                    <rect x="118" y="228" width="164" height="22" rx="6" fill="#C89F5D" />
                    <rect x="118" y="240" width="176" height="10" rx="5" fill="#A5813F" />
                    <path d="M262 224 h32 v10 h-32 z" fill="#A5813F" />
                    {/* corak safari */}
                    <ellipse cx="150" cy="236" rx="10" ry="7" fill="#6B4A2A" />
                    <ellipse cx="180" cy="234" rx="7" ry="5" fill="#6B4A2A" />
                    <ellipse cx="212" cy="237" rx="9" ry="6" fill="#6B4A2A" />
                    {/* kaca depan */}
                    <path d="M248 224 l10 -16 h6 l-6 16 z" fill="#BFE0E6" />
                    {/* lampu */}
                    <circle cx="290" cy="230" r="5" fill="#FFE7A8" />
                </g>
                {/* roda */}
                <circle cx="152" cy="252" r="19" fill="#2B2620" />
                <circle cx="256" cy="252" r="19" fill="#2B2620" />
                <circle cx="152" cy="252" r="9" fill="#D9CDB4" />
                <circle cx="256" cy="252" r="9" fill="#D9CDB4" />
                <g className="bt8-roda" stroke="#8A7C63" strokeWidth="3" strokeLinecap="round">
                    <path d="M152 244 v16 M144 252 h16 M146 246 l12 12 M158 246 l-12 12" />
                </g>
                <g className="bt8-roda" stroke="#8A7C63" strokeWidth="3" strokeLinecap="round">
                    <path d="M256 244 v16 M248 252 h16 M250 246 l12 12 M262 246 l-12 12" />
                </g>
            </g>
        </svg>
    );
}

export default function BirthdayTheme08({ invitation, visitor, greeting }: BirthdayTheme08Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt8-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt8-anim-up').forEach((el) => observer.observe(el));
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
        const colors = ['#F5B942', '#7A8F3C', '#B4703C', '#2E9E8F', '#FDF4E3'];
        for (let i = 0; i < 75; i++) {
            const k = document.createElement('span');
            k.className = 'bt8-confetti';
            k.style.left = Math.random() * 100 + 'vw';
            k.style.background = colors[i % colors.length];
            k.style.animationDuration = 2.4 + Math.random() * 2.2 + 's';
            k.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 5400);
        }
    };

    // Jeep entrance sequence plays once the invitation opens, and can be replayed on demand
    useEffect(() => {
        if (!opened || !confettiEnabled) return;
        const timer = setTimeout(rainConfetti, CONFETTI_DELAY_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, runId, confettiEnabled]);

    const openInvitation = () => setOpened(true);
    const replayJourney = () => {
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
        <div className="bt8-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Work+Sans:wght@400;600;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt8-cover${opened ? ' bt8-hide' : ''}`}>
                    {confettiEnabled && (
                        <>
                            <span className="bt8-cover-sparkle bt8-cover-sparkle-1" aria-hidden="true">
                                🌿
                            </span>
                            <span className="bt8-cover-sparkle bt8-cover-sparkle-2" aria-hidden="true">
                                ☀️
                            </span>
                            <span className="bt8-cover-sparkle bt8-cover-sparkle-3" aria-hidden="true">
                                🦋
                            </span>
                            <span className="bt8-cover-sparkle bt8-cover-sparkle-4" aria-hidden="true">
                                🌿
                            </span>
                        </>
                    )}

                    <div className="bt8-cover-card">
                        <span className="bt8-cover-tag">Ekspedisi safari · Ulang tahun</span>
                        <SafariSceneIllustration className="bt8-cover-scene" staticView />
                        <p className="bt8-cover-subtitle">Ada jejak yang belum terbaca, hewan yang belum disapa, dan kue yang belum dipotong</p>
                        <h1 className="bt8-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt8-cover-age-badge">🐾 Genap {formatAge(age)} 🐾</div>}
                        {invitation.mainDateFormatted && <p className="bt8-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt8-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt8-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt8-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt8-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid var(--bt8-kayu)' }} />
                                <p className="bt8-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt8-btn-open" onClick={openInvitation}>
                            🦒 {greeting?.buttonText ?? 'Mulai Jelajah'} 🦒
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt8-main${opened ? ' bt8-main-visible' : ''}`}>
                {/* HERO / SAVANA STAGE */}
                <section className="bt8-hero">
                    <div key={runId} className={`bt8-stage${opened ? ' bt8-aksi' : ''}`}>
                        <div className="bt8-panel">
                            <p className="bt8-eyebrow">Ekspedisi safari</p>
                            <SafariSceneIllustration className="bt8-adegan" />
                        </div>

                        <div className="bt8-teks-hero">
                            <p className="bt8-tiket">Tiket ekspedisi · 1 orang</p>
                            <h1 className="bt8-nama">{displayName}</h1>
                            {age !== '' && <p className="bt8-umur">Genap {formatAge(age)}</p>}
                            <p className="bt8-pengantar">
                                Ada jejak yang belum terbaca, hewan yang belum disapa, dan kue yang belum dipotong. Ikut jelajah bareng kami ya.
                            </p>
                            {invitation.mainDateFormatted && <p className="bt8-hero-date">{invitation.mainDateFormatted}</p>}

                            {isEnabled('countdown') && mainEvent && (
                                <Countdown
                                    targetDate={invitation.countdownDate}
                                    className="bt8-countdown"
                                    boxClassName="bt8-countdown-box"
                                    numClassName="bt8-countdown-num"
                                    labelClassName="bt8-countdown-label"
                                    labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                    doneMessage={
                                        <div className="bt8-countdown-done">
                                            <div className="bt8-countdown-done-emoji">🦒🎉🌿</div>
                                            <h3>Selamat Ulang Tahun!</h3>
                                        </div>
                                    }
                                />
                            )}

                            <button className="bt8-btn-replay" onClick={replayJourney}>
                                Jalan lagi
                            </button>
                            <div className="bt8-scroll-indicator">↓</div>
                        </div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt8-section bt8-profile-bg">
                        <h2 className="bt8-section-title bt8-anim-up">Sang Penjelajah Cilik</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>🌿</span>
                        </div>
                        <div className="bt8-profile-card bt8-anim-up">
                            <div className="bt8-profile-photo-frame">
                                <div
                                    className="bt8-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🦒'}
                                </div>
                            </div>
                            <h3 className="bt8-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt8-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt8-profile-tags">
                                {age !== '' && <span className="bt8-profile-tag">🐾 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt8-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt8-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt8-section bt8-events-bg">
                        <h2 className="bt8-section-title bt8-light bt8-anim-up">Rencana Jelajah</h2>
                        <div className="bt8-divider bt8-light bt8-anim-up">
                            <span>🧭</span>
                        </div>
                        <div className="bt8-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt8-event-card bt8-anim-up">
                                        <span className="bt8-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt8-event-name">{ev.name}</h3>
                                        <div className="bt8-event-divider" />
                                        <p className="bt8-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt8-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt8-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt8-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt8-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt8-section">
                                <h2 className="bt8-section-title bt8-anim-up">Titik Kumpul</h2>
                                <div className="bt8-divider bt8-anim-up">
                                    <span>📍</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt8-location-sub bt8-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt8-map-container bt8-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt8-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt8-btn-maps">
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
                    <section className="bt8-section bt8-timeline-bg">
                        <h2 className="bt8-section-title bt8-anim-up">Jejak Sang Penjelajah</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>🐾</span>
                        </div>
                        <p className="bt8-section-sub bt8-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt8-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt8-timeline-item bt8-anim-up">
                                    <div className="bt8-timeline-dot">🐾</div>
                                    <div className="bt8-timeline-card">
                                        {item.photo && <div className="bt8-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt8-timeline-date">{item.date}</p>
                                        <h3 className="bt8-timeline-title">{item.title}</h3>
                                        <p className="bt8-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt8-section bt8-gallery-bg">
                        <h2 className="bt8-section-title bt8-anim-up">Galeri Ekspedisi</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt8-gallery-grid',
                                item: 'bt8-gallery-item',
                                thumb: 'bt8-gallery-thumb',
                                overlay: 'bt8-gallery-overlay',
                                filterBar: 'bt8-gallery-filter-bar',
                                filterBtn: 'bt8-filter-btn',
                                filterBtnActive: 'bt8-filter-btn bt8-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt8-section">
                        <h2 className="bt8-section-title bt8-anim-up">Video Kenangan</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt8-video-frame bt8-anim-up">
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
                    <section className="bt8-section bt8-gift-bg">
                        <h2 className="bt8-section-title bt8-light bt8-anim-up">Kado buat Penjelajah</h2>
                        <div className="bt8-divider bt8-light bt8-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt8-gift-subtitle bt8-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt8-bank-grid',
                                bankCard: 'bt8-bank-card',
                                bankLogo: 'bt8-bank-logo',
                                bankType: 'bt8-bank-type',
                                bankNumber: 'bt8-bank-number',
                                bankName: 'bt8-bank-name',
                                copyBankBtn: 'bt8-btn-copy-bank',
                                ewalletGrid: 'bt8-ewallet-grid',
                                ewalletCard: 'bt8-ewallet-card',
                                ewalletName: 'bt8-ewallet-name',
                                ewalletPhone: 'bt8-ewallet-phone',
                                copyEwalletBtn: 'bt8-btn-copy-ewallet',
                                ewalletTitle: 'bt8-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt8-section">
                        <h2 className="bt8-section-title bt8-anim-up">Daftar Penjelajah</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt8-rsvp-form',
                                label: 'bt8-rsvp-label',
                                input: 'bt8-rsvp-input',
                                select: 'bt8-rsvp-select',
                                textarea: 'bt8-rsvp-textarea',
                                radioGroup: 'bt8-rsvp-radio-group',
                                radioLabel: 'bt8-rsvp-radio-label',
                                errorText: 'bt8-rsvp-error',
                                submitBtn: 'bt8-rsvp-submit',
                                successBox: 'bt8-rsvp-success',
                            }}
                            labels={{
                                attending: '🦒 Siap Berangkat',
                                notAttending: '😢 Maaf, Belum Bisa',
                                maybe: '🤔 Masih Ragu',
                                submit: '🦒 Kirim Konfirmasi 🦒',
                                successTitle: '🌿 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di gerbang timur!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt8-section bt8-wishes-bg">
                        <h2 className="bt8-section-title bt8-anim-up">Ucapan &amp; Semangat</h2>
                        <div className="bt8-divider bt8-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt8-wishes-layout',
                                formBox: 'bt8-wishes-form',
                                formTitle: 'bt8-wishes-form-title',
                                nameInput: 'bt8-wish-input',
                                messageInput: 'bt8-wish-input',
                                submitBtn: 'bt8-wish-btn',
                                wishCard: 'bt8-wish-card',
                                wishAvatar: 'bt8-wish-avatar',
                                wishName: 'bt8-wish-name',
                                wishDate: 'bt8-wish-date',
                                wishMessage: 'bt8-wish-message',
                                loadMoreBtn: 'bt8-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt8-closing">
                        <span className="bt8-closing-sparkle bt8-closing-sparkle-1" aria-hidden="true">
                            🌿
                        </span>
                        <span className="bt8-closing-sparkle bt8-closing-sparkle-2" aria-hidden="true">
                            ☀️
                        </span>
                        <div className="bt8-closing-frame bt8-anim-up">
                            <p className="bt8-closing-emoji">🦒🎉🌿</p>
                            <p className="bt8-closing-title">Terima Kasih</p>
                            <p className="bt8-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt8-closing-from">Sampai jumpa di gerbang timur,</p>
                            <p className="bt8-closing-name">{displayName}</p>
                            <div className="bt8-closing-line" />
                            <p className="bt8-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt8-matahari)', border: '2px solid var(--bt8-kayu)', color: 'var(--bt8-kayu)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt8-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt8-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
