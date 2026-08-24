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
import './birthday-theme-07.css';

interface BirthdayTheme07Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🦸', '🎖️', '💥', '🕵️', '🎂'];
const CONFETTI_DELAY_MS = 1150;

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

// Superhero landing scene, adapted from the theme's original static template animation.
// `staticView` renders the finished state (hero already landed, dust settled) without
// needing the `.bt7-aksi` landing trigger — used for the compact cover illustration.
function HeroLandingIllustration({ className, id, staticView }: { className?: string; id?: string; staticView?: boolean }) {
    return (
        <svg
            id={id}
            className={`${className ?? ''}${staticView ? ' bt7-adegan-static' : ''}`}
            viewBox="0 0 400 300"
            role="img"
            aria-label="Animasi pahlawan super mendarat dengan ledakan debu"
        >
            {/* speed lines */}
            <g className="bt7-garis" stroke="#FFF8E7" strokeWidth="5" strokeLinecap="round" opacity=".8">
                <path d="M330 30 l-46 62 M366 84 l-52 40 M296 6 l-30 52 M60 40 l40 52 M26 96 l52 34" />
            </g>

            {/* ground */}
            <path d="M20 274 h360" stroke="#141026" strokeWidth="6" strokeLinecap="round" />
            <g className="bt7-retak" stroke="#141026" strokeWidth="4" strokeLinecap="round">
                <path d="M150 274 l-22 16 M176 274 l-10 20 M226 274 l12 18 M252 274 l24 14" />
            </g>

            {/* landing burst */}
            <g className="bt7-ledak">
                <path
                    d="M200 274 L232 236 L226 262 L268 232 L250 264 L296 250 L258 274 L296 288 L246 284 L262 306 L228 288 L216 314 L206 286 L184 314 L172 288 L138 306 L154 284 L104 288 L142 274 L104 250 L150 264 L132 232 L174 262 L168 236 Z"
                    fill="#FFCE3A"
                    stroke="#141026"
                    strokeWidth="4"
                    strokeLinejoin="round"
                />
            </g>
            <g className="bt7-debu">
                <circle cx="128" cy="268" r="20" fill="#FFF8E7" opacity=".75" />
                <circle cx="272" cy="266" r="24" fill="#FFF8E7" opacity=".7" />
                <circle cx="96" cy="256" r="13" fill="#FFF8E7" opacity=".6" />
                <circle cx="308" cy="252" r="15" fill="#FFF8E7" opacity=".6" />
            </g>

            {/* hero */}
            <g className="bt7-pahlawan">
                <g className="bt7-jubah">
                    <path
                        d="M166 116 C 118 152, 106 214, 124 268 L 200 244 L 276 268 C 294 214, 282 152, 234 116 Z"
                        fill="#F0399B"
                        stroke="#141026"
                        strokeWidth="5"
                        strokeLinejoin="round"
                    />
                    <path d="M200 244 L 276 268 C 294 214, 282 152, 234 116 Z" fill="#D42A85" />
                </g>

                <rect x="172" y="196" width="24" height="62" rx="10" fill="#3B2AA8" stroke="#141026" strokeWidth="5" />
                <rect x="204" y="196" width="24" height="62" rx="10" fill="#3B2AA8" stroke="#141026" strokeWidth="5" />
                <rect x="164" y="248" width="36" height="26" rx="9" fill="#22D3EE" stroke="#141026" strokeWidth="5" />
                <rect x="200" y="248" width="36" height="26" rx="9" fill="#22D3EE" stroke="#141026" strokeWidth="5" />

                <path
                    d="M168 132 C 140 144, 132 172, 142 198 L 160 194 C 152 172, 158 152, 176 146 Z"
                    fill="#3B2AA8"
                    stroke="#141026"
                    strokeWidth="5"
                    strokeLinejoin="round"
                />
                <path
                    d="M232 132 C 260 144, 268 172, 258 198 L 240 194 C 248 172, 242 152, 224 146 Z"
                    fill="#3B2AA8"
                    stroke="#141026"
                    strokeWidth="5"
                    strokeLinejoin="round"
                />

                <rect x="160" y="114" width="80" height="92" rx="20" fill="#3B2AA8" stroke="#141026" strokeWidth="5" />
                <rect x="158" y="188" width="84" height="18" rx="6" fill="#FFCE3A" stroke="#141026" strokeWidth="5" />

                <circle cx="200" cy="152" r="26" fill="#FFCE3A" stroke="#141026" strokeWidth="5" />
                <g transform="translate(200 152)">
                    <path
                        d="M0 -19 L4.6 -6.3 L18.1 -5.9 L7.4 2.4 L11.2 15.4 L0 7.8 L-11.2 15.4 L-7.4 2.4 L-18.1 -5.9 L-4.6 -6.3 Z"
                        fill="#3B2AA8"
                    />
                </g>

                <circle cx="200" cy="82" r="30" fill="#F0C28E" stroke="#141026" strokeWidth="5" />
                <path d="M170 76 c 4 -26 56 -26 60 0 c -8 -8 -20 -10 -30 -6 c -10 -4 -22 -2 -30 6 z" fill="#3A2A1E" />
                <path
                    d="M172 80 h56 c 2 12 -8 18 -14 12 c -6 8 -22 8 -28 0 c -6 6 -16 0 -14 -12 z"
                    fill="#22D3EE"
                    stroke="#141026"
                    strokeWidth="4"
                    strokeLinejoin="round"
                />
                <ellipse cx="187" cy="84" rx="6.5" ry="5" fill="#FFF8E7" />
                <ellipse cx="213" cy="84" rx="6.5" ry="5" fill="#FFF8E7" />
                <path d="M190 102 q10 8 20 0" fill="none" stroke="#141026" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* comic sound bubble */}
            <g className="bt7-bunyi" transform="translate(312 208)">
                <path
                    d="M0 -46 L14 -26 L38 -34 L30 -10 L54 0 L30 10 L38 34 L14 26 L0 46 L-14 26 L-38 34 L-30 10 L-54 0 L-30 -10 L-38 -34 L-14 -26 Z"
                    fill="#22D3EE"
                    stroke="#141026"
                    strokeWidth="5"
                    strokeLinejoin="round"
                />
                <text x="0" y="10" textAnchor="middle" fontFamily="Bangers, Arial Black, sans-serif" fontSize="28" fill="#141026">
                    DUARR!
                </text>
            </g>
        </svg>
    );
}

export default function BirthdayTheme07({ invitation, visitor, greeting }: BirthdayTheme07Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt7-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt7-anim-up').forEach((el) => observer.observe(el));
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
        const colors = ['#FFCE3A', '#F0399B', '#22D3EE', '#3B2AA8', '#FFF8E7'];
        for (let i = 0; i < 80; i++) {
            const k = document.createElement('span');
            k.className = 'bt7-confetti';
            k.style.left = Math.random() * 100 + 'vw';
            k.style.background = colors[i % colors.length];
            k.style.animationDuration = 2.3 + Math.random() * 2.2 + 's';
            k.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 5400);
        }
    };

    // Landing sequence plays once the invitation opens, and can be replayed on demand
    useEffect(() => {
        if (!opened || !confettiEnabled) return;
        const timer = setTimeout(rainConfetti, CONFETTI_DELAY_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, runId, confettiEnabled]);

    const openInvitation = () => setOpened(true);
    const replayLanding = () => {
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
        <div className="bt7-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Poppins:wght@400;600;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt7-cover${opened ? ' bt7-hide' : ''}`}>
                    {confettiEnabled && (
                        <>
                            <span className="bt7-cover-sparkle bt7-cover-sparkle-1" aria-hidden="true">
                                💥
                            </span>
                            <span className="bt7-cover-sparkle bt7-cover-sparkle-2" aria-hidden="true">
                                ⭐
                            </span>
                            <span className="bt7-cover-sparkle bt7-cover-sparkle-3" aria-hidden="true">
                                💥
                            </span>
                            <span className="bt7-cover-sparkle bt7-cover-sparkle-4" aria-hidden="true">
                                ⭐
                            </span>
                        </>
                    )}

                    <div className="bt7-cover-card">
                        <span className="bt7-cover-tag">Panggilan darurat! · Ulang tahun</span>
                        <HeroLandingIllustration className="bt7-cover-scene" staticView />
                        <p className="bt7-cover-subtitle">Satu misi, satu markas, dan tim yang belum lengkap tanpa kamu</p>
                        <h1 className="bt7-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt7-cover-age-badge">🦸 Genap {formatAge(age)} 🦸</div>}
                        {invitation.mainDateFormatted && <p className="bt7-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt7-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt7-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt7-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt7-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid var(--bt7-tinta)' }} />
                                <p className="bt7-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt7-btn-open" onClick={openInvitation}>
                            🦸 {greeting?.buttonText ?? 'Buka Undangan'} 🦸
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt7-main${opened ? ' bt7-main-visible' : ''}`}>
                {/* HERO / LANDING STAGE */}
                <section className="bt7-hero">
                    <div key={runId} className={`bt7-stage${opened ? ' bt7-aksi' : ''}`}>
                        <div className="bt7-panel">
                            <p className="bt7-eyebrow">Panggilan darurat!</p>
                            <HeroLandingIllustration className="bt7-adegan" />
                        </div>

                        <div className="bt7-teks-hero">
                            <p className="bt7-balon">Kamu direkrut jadi pahlawan!</p>
                            <h1 className="bt7-nama">{displayName}</h1>
                            {age !== '' && <p className="bt7-umur">Genap {formatAge(age)}</p>}
                            <p className="bt7-pengantar">
                                Markas butuh satu anggota lagi. Datang pakai kostum pahlawan buatanmu sendiri dan selamatkan hari ini bersama kami.
                            </p>
                            {invitation.mainDateFormatted && <p className="bt7-hero-date">{invitation.mainDateFormatted}</p>}

                            {isEnabled('countdown') && mainEvent && (
                                <Countdown
                                    targetDate={invitation.countdownDate}
                                    className="bt7-countdown"
                                    boxClassName="bt7-countdown-box"
                                    numClassName="bt7-countdown-num"
                                    labelClassName="bt7-countdown-label"
                                    labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                    doneMessage={
                                        <div className="bt7-countdown-done">
                                            <div className="bt7-countdown-done-emoji">🦸🎉⭐</div>
                                            <h3>Selamat Ulang Tahun!</h3>
                                        </div>
                                    }
                                />
                            )}

                            <button className="bt7-btn-replay" onClick={replayLanding}>
                                Mendarat lagi
                            </button>
                            <div className="bt7-scroll-indicator">↓</div>
                        </div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt7-section bt7-profile-bg">
                        <h2 className="bt7-section-title bt7-anim-up">Sang Pahlawan Kecil</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>⭐</span>
                        </div>
                        <div className="bt7-profile-card bt7-anim-up">
                            <div className="bt7-profile-photo-frame">
                                <div
                                    className="bt7-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🦸'}
                                </div>
                            </div>
                            <h3 className="bt7-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt7-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt7-profile-tags">
                                {age !== '' && <span className="bt7-profile-tag">🦸 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt7-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt7-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt7-section bt7-events-bg">
                        <h2 className="bt7-section-title bt7-light bt7-anim-up">Urutan Misi</h2>
                        <div className="bt7-divider bt7-light bt7-anim-up">
                            <span>🎖️</span>
                        </div>
                        <div className="bt7-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt7-event-card bt7-anim-up">
                                        <span className="bt7-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt7-event-name">{ev.name}</h3>
                                        <div className="bt7-event-divider" />
                                        <p className="bt7-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt7-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt7-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt7-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt7-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt7-section">
                                <h2 className="bt7-section-title bt7-anim-up">Markas Misi</h2>
                                <div className="bt7-divider bt7-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt7-location-sub bt7-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt7-map-container bt7-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt7-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt7-btn-maps">
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
                    <section className="bt7-section bt7-timeline-bg">
                        <h2 className="bt7-section-title bt7-anim-up">Jejak Sang Pahlawan</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>⭐</span>
                        </div>
                        <p className="bt7-section-sub bt7-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt7-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt7-timeline-item bt7-anim-up">
                                    <div className="bt7-timeline-dot">🦸</div>
                                    <div className="bt7-timeline-card">
                                        {item.photo && <div className="bt7-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt7-timeline-date">{item.date}</p>
                                        <h3 className="bt7-timeline-title">{item.title}</h3>
                                        <p className="bt7-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt7-section bt7-gallery-bg">
                        <h2 className="bt7-section-title bt7-anim-up">Galeri Aksi</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt7-gallery-grid',
                                item: 'bt7-gallery-item',
                                thumb: 'bt7-gallery-thumb',
                                overlay: 'bt7-gallery-overlay',
                                filterBar: 'bt7-gallery-filter-bar',
                                filterBtn: 'bt7-filter-btn',
                                filterBtnActive: 'bt7-filter-btn bt7-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt7-section">
                        <h2 className="bt7-section-title bt7-anim-up">Video Kenangan</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt7-video-frame bt7-anim-up">
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
                    <section className="bt7-section bt7-gift-bg">
                        <h2 className="bt7-section-title bt7-light bt7-anim-up">Kado buat Pahlawan</h2>
                        <div className="bt7-divider bt7-light bt7-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt7-gift-subtitle bt7-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt7-bank-grid',
                                bankCard: 'bt7-bank-card',
                                bankLogo: 'bt7-bank-logo',
                                bankType: 'bt7-bank-type',
                                bankNumber: 'bt7-bank-number',
                                bankName: 'bt7-bank-name',
                                copyBankBtn: 'bt7-btn-copy-bank',
                                ewalletGrid: 'bt7-ewallet-grid',
                                ewalletCard: 'bt7-ewallet-card',
                                ewalletName: 'bt7-ewallet-name',
                                ewalletPhone: 'bt7-ewallet-phone',
                                copyEwalletBtn: 'bt7-btn-copy-ewallet',
                                ewalletTitle: 'bt7-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt7-section">
                        <h2 className="bt7-section-title bt7-anim-up">Rekrutmen Pahlawan</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt7-rsvp-form',
                                label: 'bt7-rsvp-label',
                                input: 'bt7-rsvp-input',
                                select: 'bt7-rsvp-select',
                                textarea: 'bt7-rsvp-textarea',
                                radioGroup: 'bt7-rsvp-radio-group',
                                radioLabel: 'bt7-rsvp-radio-label',
                                errorText: 'bt7-rsvp-error',
                                submitBtn: 'bt7-rsvp-submit',
                                successBox: 'bt7-rsvp-success',
                            }}
                            labels={{
                                attending: '🦸 Siap Bertugas!',
                                notAttending: '😢 Maaf, Belum Bisa',
                                maybe: '🤔 Masih Ragu',
                                submit: '🦸 Kirim Konfirmasi 🦸',
                                successTitle: '🎖️ Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di markas!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt7-section bt7-wishes-bg">
                        <h2 className="bt7-section-title bt7-anim-up">Ucapan &amp; Semangat</h2>
                        <div className="bt7-divider bt7-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt7-wishes-layout',
                                formBox: 'bt7-wishes-form',
                                formTitle: 'bt7-wishes-form-title',
                                nameInput: 'bt7-wish-input',
                                messageInput: 'bt7-wish-input',
                                submitBtn: 'bt7-wish-btn',
                                wishCard: 'bt7-wish-card',
                                wishAvatar: 'bt7-wish-avatar',
                                wishName: 'bt7-wish-name',
                                wishDate: 'bt7-wish-date',
                                wishMessage: 'bt7-wish-message',
                                loadMoreBtn: 'bt7-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt7-closing">
                        <span className="bt7-closing-sparkle bt7-closing-sparkle-1" aria-hidden="true">
                            💥
                        </span>
                        <span className="bt7-closing-sparkle bt7-closing-sparkle-2" aria-hidden="true">
                            ⭐
                        </span>
                        <div className="bt7-closing-frame bt7-anim-up">
                            <p className="bt7-closing-emoji">🦸🎉⭐</p>
                            <p className="bt7-closing-title">Terima Kasih</p>
                            <p className="bt7-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt7-closing-from">Sampai jumpa di markas,</p>
                            <p className="bt7-closing-name">{displayName}</p>
                            <div className="bt7-closing-line" />
                            <p className="bt7-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt7-emas)', border: '2px solid var(--bt7-tinta)', color: 'var(--bt7-tinta)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt7-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt7-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
