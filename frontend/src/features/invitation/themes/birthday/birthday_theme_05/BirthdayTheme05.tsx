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
import './birthday-theme-05.css';

interface BirthdayTheme05Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🎂', '🕯️', '🍰', '🎉', '🎁'];
const CANDLE_DELAY_MS = 3600;

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

const tunda = (value: string): React.CSSProperties => ({ ['--bt5-tunda' as string]: value }) as React.CSSProperties;

// Tiered birthday cake that assembles itself layer by layer before the candle lights up,
// adapted from the theme's original static template animation.
function CakeIllustration({ className, id }: { className?: string; id?: string }) {
    return (
        <svg
            id={id}
            className={className}
            viewBox="0 0 400 430"
            role="img"
            aria-label="Animasi kue ulang tahun tiga tingkat yang tersusun lapis demi lapis sampai lilinnya menyala"
        >
            <ellipse className="bt5-cahaya" cx="200" cy="120" rx="150" ry="120" fill="#FFC847" />

            <g className="bt5-jatuh" style={tunda('.15s')}>
                <ellipse cx="200" cy="392" rx="152" ry="20" fill="#FFF6E9" />
                <ellipse cx="200" cy="384" rx="140" ry="16" fill="#E8DCC6" />
            </g>

            <g className="bt5-jatuh" style={tunda('.55s')}>
                <rect x="88" y="304" width="224" height="72" rx="14" fill="#E7B06B" />
                <rect x="88" y="336" width="224" height="12" fill="#CF9247" opacity=".55" />
            </g>

            <g className="bt5-jatuh" style={tunda('.95s')}>
                <rect x="84" y="288" width="232" height="22" rx="11" fill="#FFF6E9" />
                <circle cx="106" cy="310" r="9" fill="#FFF6E9" />
                <circle cx="150" cy="312" r="11" fill="#FFF6E9" />
                <circle cx="200" cy="310" r="9" fill="#FFF6E9" />
                <circle cx="252" cy="312" r="11" fill="#FFF6E9" />
                <circle cx="296" cy="310" r="9" fill="#FFF6E9" />
            </g>

            <g className="bt5-jatuh" style={tunda('1.35s')}>
                <rect x="112" y="228" width="176" height="66" rx="13" fill="#E7B06B" />
                <rect x="112" y="256" width="176" height="11" fill="#CF9247" opacity=".55" />
            </g>

            <g className="bt5-jatuh" style={tunda('1.7s')}>
                <rect x="108" y="214" width="184" height="20" rx="10" fill="#FFF6E9" />
                <circle cx="128" cy="234" r="9" fill="#FFF6E9" />
                <circle cx="172" cy="236" r="10" fill="#FFF6E9" />
                <circle cx="228" cy="236" r="10" fill="#FFF6E9" />
                <circle cx="272" cy="234" r="9" fill="#FFF6E9" />
            </g>

            <g className="bt5-jatuh" style={tunda('2.05s')}>
                <rect x="134" y="160" width="132" height="60" rx="12" fill="#E7B06B" />
                <rect x="134" y="186" width="132" height="10" fill="#CF9247" opacity=".55" />
            </g>

            <g className="bt5-jatuh" style={tunda('2.4s')}>
                <rect x="128" y="142" width="144" height="24" rx="10" fill="#FF6B5A" />
                <circle cx="146" cy="166" r="10" fill="#FF6B5A" />
                <circle cx="176" cy="169" r="14" fill="#FF6B5A" />
                <circle cx="208" cy="165" r="9" fill="#FF6B5A" />
                <circle cx="236" cy="170" r="15" fill="#FF6B5A" />
                <circle cx="262" cy="165" r="11" fill="#FF6B5A" />
            </g>

            <g className="bt5-jatuh" style={tunda('2.75s')}>
                <rect x="146" y="132" width="7" height="16" rx="3.5" fill="#4FD1A5" transform="rotate(-22 149 140)" />
                <rect x="174" y="128" width="7" height="16" rx="3.5" fill="#FFC847" transform="rotate(14 177 136)" />
                <rect x="224" y="129" width="7" height="16" rx="3.5" fill="#4FD1A5" transform="rotate(-12 227 137)" />
                <rect x="252" y="133" width="7" height="16" rx="3.5" fill="#FFC847" transform="rotate(24 255 141)" />
                <circle cx="152" cy="146" r="5" fill="#FFF6E9" />
                <circle cx="248" cy="147" r="5" fill="#FFF6E9" />
            </g>

            <g className="bt5-jatuh" style={tunda('3.1s')}>
                <rect x="192" y="86" width="16" height="60" rx="7" fill="#FFF6E9" />
                <path d="M192 100 h16 M192 116 h16 M192 132 h16" stroke="#FF6B5A" strokeWidth="7" />
                <path d="M200 86 v-10" stroke="#5A4632" strokeWidth="4" strokeLinecap="round" />
            </g>

            <g className="bt5-api-luar">
                <g className="bt5-api">
                    <path d="M200 40 c 16 16 12 32 0 38 c -12 -6 -16 -22 0 -38 z" fill="#FFC847" />
                    <path d="M200 56 c 7 7 5 14 0 17 c -5 -3 -7 -10 0 -17 z" fill="#FFF6E9" />
                </g>
            </g>
        </svg>
    );
}

export default function BirthdayTheme05({ invitation, visitor, greeting }: BirthdayTheme05Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt5-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt5-anim-up').forEach((el) => observer.observe(el));
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
        const colors = ['#FFC847', '#FF6B5A', '#4FD1A5', '#FFF6E9', '#E7B06B'];
        for (let i = 0; i < 80; i++) {
            const k = document.createElement('span');
            k.className = 'bt5-confetti';
            k.style.left = Math.random() * 100 + 'vw';
            k.style.background = colors[i % colors.length];
            k.style.animationDuration = 2.4 + Math.random() * 2.2 + 's';
            k.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 5400);
        }
    };

    // Cake assembly plays once the invitation opens, and can be replayed on demand
    useEffect(() => {
        if (!opened || !confettiEnabled) return;
        const timer = setTimeout(rainConfetti, CANDLE_DELAY_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, runId, confettiEnabled]);

    const openInvitation = () => setOpened(true);
    const replayCake = () => {
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
        <div className="bt5-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Titan+One&family=Nunito:wght@400;600;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt5-cover${opened ? ' bt5-hide' : ''}`}>
                    {confettiEnabled && (
                        <>
                            <span className="bt5-cover-sparkle bt5-cover-sparkle-1" aria-hidden="true">
                                ✦
                            </span>
                            <span className="bt5-cover-sparkle bt5-cover-sparkle-2" aria-hidden="true">
                                ♡
                            </span>
                            <span className="bt5-cover-sparkle bt5-cover-sparkle-3" aria-hidden="true">
                                ✦
                            </span>
                            <span className="bt5-cover-sparkle bt5-cover-sparkle-4" aria-hidden="true">
                                ♡
                            </span>
                        </>
                    )}

                    <div className="bt5-cover-card">
                        <span className="bt5-cover-tag">Satu lapis untuk setiap tahun</span>
                        <CakeIllustration className="bt5-cover-cake" />
                        <p className="bt5-cover-subtitle">Kuenya kami susun satu per satu, sama seperti tahun-tahun yang kami rayakan</p>
                        <h1 className="bt5-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt5-cover-age-badge">🎂 Genap {formatAge(age)} 🎂</div>}
                        {invitation.mainDateFormatted && <p className="bt5-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt5-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt5-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt5-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt5-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(255,200,71,0.3)' }} />
                                <p className="bt5-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt5-btn-open" onClick={openInvitation}>
                            🎂 {greeting?.buttonText ?? 'Buka Undangan'} 🎂
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt5-main${opened ? ' bt5-main-visible' : ''}`}>
                {/* HERO / CAKE STAGE */}
                <section className="bt5-hero">
                    <div className="bt5-hero-inner">
                        <p className="bt5-hero-label">Satu lapis untuk setiap tahun</p>

                        <div key={runId} className={`bt5-stage${opened ? ' bt5-jalan' : ''}`}>
                            <CakeIllustration className="bt5-cake" />
                            <div className="bt5-hero-text">
                                <h1 className="bt5-hero-name">{displayName}</h1>
                                {age !== '' && <div className="bt5-hero-age-badge">Genap {formatAge(age)}!</div>}
                                <p className="bt5-hero-tagline">
                                    Kuenya kami susun satu per satu, sama seperti tahun-tahun yang kami rayakan. Datang ya, lapisan terakhirnya
                                    untuk kamu.
                                </p>
                            </div>
                        </div>

                        {invitation.mainDateFormatted && <p className="bt5-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && mainEvent && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="bt5-countdown"
                                boxClassName="bt5-countdown-box"
                                numClassName="bt5-countdown-num"
                                labelClassName="bt5-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="bt5-countdown-done">
                                        <div className="bt5-countdown-done-emoji">🎂🕯️🎉</div>
                                        <h3>Selamat Ulang Tahun!</h3>
                                    </div>
                                }
                            />
                        )}

                        <button className="bt5-btn-replay" onClick={replayCake}>
                            Putar ulang kuenya
                        </button>
                        <div className="bt5-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt5-section bt5-profile-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Yang Berulang Tahun</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>🎂</span>
                        </div>
                        <div className="bt5-profile-card bt5-anim-up">
                            <div className="bt5-profile-photo-frame">
                                <div
                                    className="bt5-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🎂'}
                                </div>
                            </div>
                            <h3 className="bt5-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt5-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt5-profile-tags">
                                {age !== '' && <span className="bt5-profile-tag">🎂 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt5-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt5-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt5-section bt5-events-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Susunan Acara</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>🍰</span>
                        </div>
                        <div className="bt5-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt5-event-card bt5-anim-up">
                                        <span className="bt5-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt5-event-name">{ev.name}</h3>
                                        <div className="bt5-event-divider" />
                                        <p className="bt5-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt5-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt5-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt5-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt5-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt5-section">
                                <h2 className="bt5-section-title bt5-anim-up">Lokasi Pesta</h2>
                                <div className="bt5-divider bt5-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt5-location-sub bt5-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt5-map-container bt5-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt5-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt5-btn-maps">
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
                    <section className="bt5-section bt5-timeline-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Jejak Kenangan</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>🕯️</span>
                        </div>
                        <p className="bt5-section-sub bt5-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt5-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt5-timeline-item bt5-anim-up">
                                    <div className="bt5-timeline-dot">🕯️</div>
                                    <div className="bt5-timeline-card">
                                        {item.photo && <div className="bt5-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt5-timeline-date">{item.date}</p>
                                        <h3 className="bt5-timeline-title">{item.title}</h3>
                                        <p className="bt5-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt5-section bt5-gallery-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Galeri Kenangan</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt5-gallery-grid',
                                item: 'bt5-gallery-item',
                                thumb: 'bt5-gallery-thumb',
                                overlay: 'bt5-gallery-overlay',
                                filterBar: 'bt5-gallery-filter-bar',
                                filterBtn: 'bt5-filter-btn',
                                filterBtnActive: 'bt5-filter-btn bt5-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt5-section">
                        <h2 className="bt5-section-title bt5-anim-up">Video Kenangan</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt5-video-frame bt5-anim-up">
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
                    <section className="bt5-section bt5-gift-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Kado untuk Si Bintang</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt5-gift-subtitle bt5-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt5-bank-grid',
                                bankCard: 'bt5-bank-card',
                                bankLogo: 'bt5-bank-logo',
                                bankType: 'bt5-bank-type',
                                bankNumber: 'bt5-bank-number',
                                bankName: 'bt5-bank-name',
                                copyBankBtn: 'bt5-btn-copy-bank',
                                ewalletGrid: 'bt5-ewallet-grid',
                                ewalletCard: 'bt5-ewallet-card',
                                ewalletName: 'bt5-ewallet-name',
                                ewalletPhone: 'bt5-ewallet-phone',
                                copyEwalletBtn: 'bt5-btn-copy-ewallet',
                                ewalletTitle: 'bt5-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt5-section">
                        <h2 className="bt5-section-title bt5-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt5-rsvp-form',
                                label: 'bt5-rsvp-label',
                                input: 'bt5-rsvp-input',
                                select: 'bt5-rsvp-select',
                                textarea: 'bt5-rsvp-textarea',
                                radioGroup: 'bt5-rsvp-radio-group',
                                radioLabel: 'bt5-rsvp-radio-label',
                                errorText: 'bt5-rsvp-error',
                                submitBtn: 'bt5-rsvp-submit',
                                successBox: 'bt5-rsvp-success',
                            }}
                            labels={{
                                attending: '🎂 Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '🕯️ Kirim Konfirmasi 🕯️',
                                successTitle: '🎉 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di meja kue kami!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt5-section bt5-wishes-bg">
                        <h2 className="bt5-section-title bt5-anim-up">Ucapan &amp; Doa</h2>
                        <div className="bt5-divider bt5-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt5-wishes-layout',
                                formBox: 'bt5-wishes-form',
                                formTitle: 'bt5-wishes-form-title',
                                nameInput: 'bt5-wish-input',
                                messageInput: 'bt5-wish-input',
                                submitBtn: 'bt5-wish-btn',
                                wishCard: 'bt5-wish-card',
                                wishAvatar: 'bt5-wish-avatar',
                                wishName: 'bt5-wish-name',
                                wishDate: 'bt5-wish-date',
                                wishMessage: 'bt5-wish-message',
                                loadMoreBtn: 'bt5-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt5-closing">
                        <span className="bt5-closing-sparkle bt5-closing-sparkle-1" aria-hidden="true">
                            ✦
                        </span>
                        <span className="bt5-closing-sparkle bt5-closing-sparkle-2" aria-hidden="true">
                            ♡
                        </span>
                        <div className="bt5-closing-frame bt5-anim-up">
                            <p className="bt5-closing-emoji">🎂🕯️🎉</p>
                            <p className="bt5-closing-title">Terima Kasih</p>
                            <p className="bt5-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt5-closing-from">Sampai jumpa di meja kue kami,</p>
                            <p className="bt5-closing-name">{displayName}</p>
                            <div className="bt5-closing-line" />
                            <p className="bt5-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt5-emas)', border: '2px solid var(--bt5-malam-2)', color: 'var(--bt5-malam)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt5-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt5-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
