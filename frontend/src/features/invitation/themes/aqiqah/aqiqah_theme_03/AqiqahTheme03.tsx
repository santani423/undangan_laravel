import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './aqiqah-theme-03.css';

interface AqiqahTheme03Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🌸', '🎀', '👑', '🕊️', '🌷', '💗'];

function addToCalendar(ev: AqiqahInvitation['events'][0], babyName: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '090000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '120000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Aqiqah ${babyName}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

function genderLabel(gender: string): string {
    if (gender === 'Laki-laki') return 'Putra';
    if (gender === 'Perempuan') return 'Putri';
    return '';
}

function genderIcon(gender: string): string {
    if (gender === 'Laki-laki') return '👦';
    if (gender === 'Perempuan') return '👧';
    return '👶';
}

export default function AqiqahTheme03({ invitation, visitor, greeting }: AqiqahTheme03Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Falling sakura petals decoration (stable per mount)
    const petals = useMemo(
        () =>
            Array.from({ length: 14 }, () => ({
                left: Math.random() * 100,
                duration: 9 + Math.random() * 9,
                delay: -(Math.random() * 16),
                scale: 0.6 + Math.random() * 0.7,
            })),
        [],
    );

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq3-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq3-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '👶';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;
    const bintiWord = babyGender === 'Laki-laki' ? 'bin' : 'binti';

    const parentsLine =
        invitation.fatherName && invitation.motherName
            ? `Bapak ${invitation.fatherName} & Ibu ${invitation.motherName}`
            : invitation.fatherName
              ? `Bapak ${invitation.fatherName}`
              : invitation.motherName
                ? `Ibu ${invitation.motherName}`
                : '';

    const genderWord = genderLabel(babyGender);
    const profileLine = parentsLine ? `${genderWord ? genderWord + ' dari ' : 'Buah hati dari '}${parentsLine}` : '';

    return (
        <div className="aq3-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,400;1,6..96,500&family=Lexend+Deca:wght@300;400;500;600&family=Parisienne&display=swap');
            `}</style>

            {/* Reusable decorative SVG defs */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <linearGradient id="aq3-rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f6dccf" />
                        <stop offset=".55" stopColor="#c8917b" />
                        <stop offset="1" stopColor="#a86f5c" />
                    </linearGradient>
                    <symbol id="aq3-heart" viewBox="0 0 24 22">
                        <path
                            d="M12 21S1 14 1 7a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 7-11 14-11 14z"
                            fill="#e3849f"
                        />
                    </symbol>
                    <symbol id="aq3-flourish" viewBox="0 0 150 24">
                        <path
                            d="M4 12C30 12 40 2 56 6 66 9 62 18 54 16M146 12C120 12 110 2 94 6 84 9 88 18 96 16"
                            fill="none"
                            stroke="#c8917b"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                        />
                        <path d="M75 4c3 4 3 12 0 16-3-4-3-12 0-16z" fill="#e3849f" />
                        <path d="M67 12c4-3 12-3 16 0-4 3-12 3-16 0z" fill="#f5a8bd" />
                    </symbol>
                </defs>
            </svg>

            {/* Falling petals */}
            <div className="aq3-petals" aria-hidden="true">
                {petals.map((p, i) => (
                    <span
                        key={i}
                        className="aq3-petal-fall"
                        style={{
                            left: `${p.left}%`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            width: `${12 * p.scale}px`,
                            height: `${10 * p.scale}px`,
                        }}
                    />
                ))}
            </div>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq3-overlay${opened ? ' aq3-hide' : ''}`}>
                    <div className="aq3-overlay-decor" aria-hidden="true">
                        <span className="aq3-overlay-petal aq3-overlay-petal-1">🌸</span>
                        <span className="aq3-overlay-petal aq3-overlay-petal-2">🎀</span>
                        <span className="aq3-overlay-petal aq3-overlay-petal-3">🌷</span>
                    </div>
                    <div className="aq3-overlay-frame">
                        <p className="aq3-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq3-overlay-label">Tasyakuran Aqiqah</p>
                        <div className="aq3-overlay-divider" />
                        <div className="aq3-overlay-name script">{invitation.babyName}</div>
                        {invitation.fatherName && (
                            <p className="aq3-overlay-binti">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <p className="aq3-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq3-overlay-divider" />
                        <p className="aq3-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq3-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq3-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq3-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq3-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq3-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(185,85,122,0.4)' }}
                                />
                                <p className="aq3-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq3-btn-open" onClick={openInvitation}>
                            🌸 {greeting?.buttonText ?? 'Buka Undangan'} 🌸
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq3-main${opened ? ' aq3-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="aq3-hero">
                    <svg className="aq3-sakura aq3-sk-tl" aria-hidden="true" viewBox="-20 -30 270 180">
                        <path d="M0 0C70 20 140 50 230 110" fill="none" stroke="#8a5a5a" strokeWidth="3.5" strokeLinecap="round" />
                        <g fill="#f7b7c8">
                            <ellipse cx="26.7" cy="-11.5" rx="5.4" ry="8" />
                            <ellipse cx="56.9" cy="21.6" rx="4.3" ry="6.4" />
                        </g>
                        <circle cx="83.7" cy="26.3" r="3.5" fill="#f7b7c8" />
                        <circle cx="169.8" cy="58.9" r="3.5" fill="#f7b7c8" />
                    </svg>
                    <svg className="aq3-sakura aq3-sk-tr" aria-hidden="true" viewBox="-20 -30 270 180">
                        <path d="M0 0C70 20 140 50 230 110" fill="none" stroke="#8a5a5a" strokeWidth="3.5" strokeLinecap="round" />
                        <g fill="#f39bb4">
                            <ellipse cx="83.6" cy="22.9" rx="5.8" ry="8.5" />
                            <ellipse cx="147.8" cy="64.6" rx="5.7" ry="8.4" />
                        </g>
                        <circle cx="128.1" cy="43.6" r="3.5" fill="#f7b7c8" />
                        <circle cx="27.2" cy="15.6" r="3.5" fill="#f7b7c8" />
                    </svg>
                    <div className="aq3-hero-frame aq3-anim-up">
                        <p className="aq3-hero-label">Tasyakuran Aqiqah</p>
                        <div className="aq3-oval">
                            <div className="aq3-oval-lace" aria-hidden="true" />
                            <div className="aq3-oval-rim">
                                <div
                                    className="aq3-oval-inner"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && (
                                        <div className="aq3-oval-placeholder">
                                            <svg viewBox="0 0 160 160" role="img" aria-label={`Monogram ${invitation.babyName}`}>
                                                <circle cx="80" cy="80" r="62" fill="var(--aq3-blush)" />
                                                <text x="80" y="104" textAnchor="middle" fontFamily="Parisienne, cursive" fontSize="78" fill="var(--aq3-rose-d)">
                                                    {babyInitial}
                                                </text>
                                                <g fill="#f39bb4">
                                                    <circle cx="34" cy="40" r="4" />
                                                    <circle cx="128" cy="50" r="3" />
                                                    <circle cx="120" cy="128" r="4" />
                                                    <circle cx="40" cy="122" r="3" />
                                                </g>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <svg className="aq3-tiara" viewBox="0 0 120 64" aria-hidden="true">
                                <path
                                    d="M6 56C20 40 30 34 40 36L46 14 56 30 60 2 64 30 74 14 80 36C90 34 100 40 114 56Z"
                                    fill="url(#aq3-rg)"
                                    stroke="#a86f5c"
                                    strokeWidth="1"
                                />
                                <path d="M6 56Q60 44 114 56L112 62Q60 52 8 62Z" fill="url(#aq3-rg)" stroke="#a86f5c" strokeWidth="1" />
                                <circle className="aq3-gem" cx="60" cy="30" r="5" fill="#f39bb4" stroke="#fff" strokeWidth="1.5" />
                                <circle className="aq3-gem" cx="44" cy="40" r="3.4" fill="#c9b5f0" stroke="#fff" strokeWidth="1" />
                                <circle className="aq3-gem" cx="76" cy="40" r="3.4" fill="#c9b5f0" stroke="#fff" strokeWidth="1" />
                                <circle cx="60" cy="3" r="3" fill="#fff" />
                                <circle cx="46" cy="14" r="2.4" fill="#fff" />
                                <circle cx="74" cy="14" r="2.4" fill="#fff" />
                            </svg>
                            <svg className="aq3-bow" viewBox="0 0 80 40" aria-hidden="true">
                                <path d="M40 20L6 4Q0 20 6 36Z" fill="#e3849f" />
                                <path d="M40 20L74 4Q80 20 74 36Z" fill="#e3849f" />
                                <path d="M34 22l-8 18h8zM46 22l8 18h-8z" fill="#b9557a" />
                                <circle cx="40" cy="20" r="7" fill="#f5a8bd" />
                            </svg>
                        </div>
                        <p className="aq3-hero-pre">Dengan penuh syukur, kami memperkenalkan buah hati kami</p>
                        <h1 className="aq3-hero-name script">{invitation.babyName}</h1>
                        {invitation.fatherName && (
                            <p className="aq3-hero-binti">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <div className="aq3-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq3-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        <p className="aq3-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq3-countdown"
                                boxClassName="aq3-countdown-box"
                                numClassName="aq3-countdown-num"
                                labelClassName="aq3-countdown-label"
                            />
                        )}
                        <div className="aq3-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── OPENING MESSAGE / SALAM ──────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="aq3-section">
                        <div className="aq3-card aq3-anim-up">
                            <svg className="aq3-card-heart" aria-hidden="true">
                                <use href="#aq3-heart" />
                            </svg>
                            <p className="aq3-eyebrow">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <p className="aq3-arabic" lang="ar" dir="rtl">
                                يَهَبُ لِمَنْ يَشَاءُ إِنَاثًا وَيَهَبُ لِمَنْ يَشَاءُ الذُّكُورَ
                            </p>
                            <blockquote className="aq3-blockquote">
                                "…Dia memberikan anak perempuan kepada siapa yang Dia kehendaki, dan memberikan anak laki-laki kepada siapa yang Dia
                                kehendaki."
                            </blockquote>
                            <p className="aq3-src">QS. Asy-Syura: 49</p>
                            <svg className="aq3-flourish" aria-hidden="true">
                                <use href="#aq3-flourish" />
                            </svg>
                            <p className="aq3-lead">{invitation.openingMessage}</p>
                        </div>
                    </section>
                )}

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq3-section">
                        <div className="aq3-card aq3-anim-up">
                            <svg className="aq3-card-heart" aria-hidden="true">
                                <use href="#aq3-heart" />
                            </svg>
                            <p className="aq3-eyebrow">Sang Buah Hati</p>
                            <div className="aq3-profile-photo-oval">
                                <div className="aq3-profile-photo-rim">
                                    <div
                                        className="aq3-profile-photo-inner"
                                        style={
                                            babyPhoto
                                                ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                                : {}
                                        }
                                    >
                                        {!babyPhoto && <span>{babyInitial}</span>}
                                    </div>
                                </div>
                            </div>
                            <p className="aq3-princess-name script">{invitation.babyName}</p>
                            {invitation.fatherName && (
                                <p className="aq3-kid-binti">
                                    {bintiWord} {invitation.fatherName}
                                </p>
                            )}
                            {babyGender && (
                                <p className="aq3-profile-gender">
                                    {genderIcon(babyGender)} {babyGender}
                                </p>
                            )}
                            {invitation.birthDateFormatted && <p className="aq3-profile-birth">{invitation.birthDateFormatted}</p>}
                            {profileLine && <p className="aq3-profile-parents">{profileLine}</p>}
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq3-section aq3-events-bg">
                        <h2 className="aq3-section-title aq3-light aq3-anim-up">Waktu &amp; Tempat</h2>
                        <div className="aq3-divider aq3-light aq3-anim-up">
                            <span>🌸</span>
                        </div>
                        <div className="aq3-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="aq3-event-card aq3-anim-up">
                                        <svg className="aq3-card-heart" aria-hidden="true">
                                            <use href="#aq3-heart" />
                                        </svg>
                                        <span className="aq3-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="aq3-event-name">{ev.name}</h3>
                                        <div className="aq3-event-divider" />
                                        <p className="aq3-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="aq3-event-detail">{timeStr}</p>}
                                        <div className="aq3-event-divider" />
                                        {ev.locationName && (
                                            <p className="aq3-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="aq3-event-detail">{ev.location}</p>}
                                        <div className="aq3-event-actions">
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq3-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="aq3-btn-event" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                📅 Tambah ke Kalender
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
                            <section className="aq3-section">
                                <h2 className="aq3-section-title aq3-anim-up">Lokasi Acara</h2>
                                <div className="aq3-divider aq3-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p className="aq3-location-sub aq3-anim-up">
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div className="aq3-map-container aq3-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="aq3-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq3-btn-maps">
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
                    <section className="aq3-section">
                        <h2 className="aq3-section-title aq3-anim-up">Galeri Foto</h2>
                        <div className="aq3-divider aq3-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq3-gallery-grid',
                                item: 'aq3-gallery-item',
                                thumb: 'aq3-gallery-thumb',
                                overlay: 'aq3-gallery-overlay',
                                filterBar: 'aq3-gallery-filter-bar',
                                filterBtn: 'aq3-filter-btn',
                                filterBtnActive: 'aq3-filter-btn aq3-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq3-section">
                        <h2 className="aq3-section-title aq3-anim-up">Video Kenangan</h2>
                        <div className="aq3-divider aq3-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="aq3-video-frame aq3-anim-up">
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

                {/* ── DIGITAL ENVELOPE ─────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq3-section aq3-gift-bg">
                        <h2 className="aq3-section-title aq3-anim-up">Amplop Digital</h2>
                        <div className="aq3-divider aq3-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="aq3-gift-subtitle aq3-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                            kasih untuk sang buah hati, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq3-bank-grid',
                                bankCard: 'aq3-bank-card',
                                bankLogo: 'aq3-bank-logo',
                                bankType: 'aq3-bank-type',
                                bankNumber: 'aq3-bank-number',
                                bankName: 'aq3-bank-name',
                                copyBankBtn: 'aq3-btn-copy-bank',
                                ewalletGrid: 'aq3-ewallet-grid',
                                ewalletCard: 'aq3-ewallet-card',
                                ewalletName: 'aq3-ewallet-name',
                                ewalletPhone: 'aq3-ewallet-phone',
                                copyEwalletBtn: 'aq3-btn-copy-ewallet',
                                ewalletTitle: 'aq3-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq3-section">
                        <h2 className="aq3-section-title aq3-anim-up">RSVP &amp; Doa</h2>
                        <div className="aq3-divider aq3-anim-up">
                            <span>✉️</span>
                        </div>
                        <p className="aq3-rsvp-hint aq3-anim-up">Titipkan doa untuk sang buah hati.</p>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'aq3-rsvp-form',
                                label: 'aq3-rsvp-label',
                                input: 'aq3-rsvp-input',
                                select: 'aq3-rsvp-select',
                                textarea: 'aq3-rsvp-textarea',
                                radioGroup: 'aq3-rsvp-radio-group',
                                radioLabel: 'aq3-rsvp-radio-label',
                                errorText: 'aq3-rsvp-error',
                                submitBtn: 'aq3-rsvp-submit',
                                successBox: 'aq3-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq3-section aq3-wishes-bg">
                        <h2 className="aq3-section-title aq3-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq3-divider aq3-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq3-wishes-layout',
                                formBox: 'aq3-wishes-form',
                                formTitle: 'aq3-wishes-form-title',
                                nameInput: 'aq3-wish-input',
                                messageInput: 'aq3-wish-input',
                                submitBtn: 'aq3-wish-btn',
                                wishCard: 'aq3-wish-card',
                                wishAvatar: 'aq3-wish-avatar',
                                wishName: 'aq3-wish-name',
                                wishDate: 'aq3-wish-date',
                                wishMessage: 'aq3-wish-message',
                                loadMoreBtn: 'aq3-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="aq3-section">
                        <div className="aq3-card aq3-anim-up">
                            <svg className="aq3-card-heart" aria-hidden="true">
                                <use href="#aq3-heart" />
                            </svg>
                            <p className="aq3-lead">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq3-closing-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <svg className="aq3-flourish" aria-hidden="true">
                                <use href="#aq3-flourish" />
                            </svg>
                            <p className="aq3-eyebrow" style={{ marginTop: '14px' }}>
                                Kami yang berbahagia
                            </p>
                            <p className="aq3-closing-family">
                                {invitation.babyName}
                                {parentsLine && (
                                    <>
                                        <br />
                                        Keluarga {parentsLine}
                                    </>
                                )}
                            </p>
                            <p className="aq3-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--aq3-rose-d)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq3-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq3-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
