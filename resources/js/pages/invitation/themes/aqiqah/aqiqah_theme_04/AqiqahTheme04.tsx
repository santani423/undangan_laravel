import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './aqiqah-theme-04.css';

interface AqiqahTheme04Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🐑', '🌾', '🐐', '🌤️', '🌿', '🧺'];

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

export default function AqiqahTheme04({ invitation, visitor, greeting }: AqiqahTheme04Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq4-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq4-anim-up').forEach((el) => observer.observe(el));
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
    const bintiWord = babyGender === 'Perempuan' ? 'binti' : 'bin';
    const sheepCount = babyGender === 'Perempuan' ? 1 : 2;

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
        <div className="aq4-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Atkinson+Hyperlegible:wght@400;700&family=Gluten:wght@500;600;700;800&display=swap');
            `}</style>

            {/* Reusable decorative SVG defs */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <symbol id="aq4-sheep" viewBox="0 0 74 56">
                        <g fill="#3b3435">
                            <rect x="18" y="38" width="5" height="16" rx="2.5" />
                            <rect x="28" y="40" width="5" height="14" rx="2.5" />
                            <rect x="42" y="40" width="5" height="14" rx="2.5" />
                            <rect x="51" y="38" width="5" height="16" rx="2.5" />
                        </g>
                        <g className="aq4-sheep-body" fill="#fff" stroke="#d9e4d4" strokeWidth="1.5">
                            <circle cx="22" cy="26" r="11" />
                            <circle cx="34" cy="20" r="12" />
                            <circle cx="46" cy="22" r="11" />
                            <circle cx="52" cy="32" r="10" />
                            <circle cx="38" cy="36" r="11" />
                            <circle cx="22" cy="36" r="10" />
                        </g>
                        <g className="aq4-sheep-head">
                            <ellipse cx="62" cy="24" rx="9" ry="11" fill="#3b3435" />
                            <ellipse cx="54" cy="19" rx="6" ry="3" fill="#3b3435" transform="rotate(-25 54 19)" />
                            <ellipse cx="70" cy="18" rx="6" ry="3" fill="#3b3435" transform="rotate(25 70 18)" />
                            <circle cx="58" cy="14" r="5" fill="#fff" />
                            <circle cx="64" cy="13" r="5" fill="#fff" />
                            <circle cx="61" cy="10" r="4.5" fill="#fff" />
                            <circle cx="59" cy="23" r="1.6" fill="#fff" />
                            <circle cx="66" cy="23" r="1.6" fill="#fff" />
                            <ellipse cx="57" cy="28" rx="2" ry="1.2" fill="#f5a896" opacity=".8" />
                            <ellipse cx="68" cy="28" rx="2" ry="1.2" fill="#f5a896" opacity=".8" />
                        </g>
                    </symbol>
                    <symbol id="aq4-puff" viewBox="0 0 90 34">
                        <path d="M14 33a13 13 0 0 1 2-26 18 18 0 0 1 32-4 14 14 0 0 1 24 6 12 12 0 0 1 4 24z" fill="#fff" />
                    </symbol>
                    <symbol id="aq4-wheat" viewBox="0 0 120 28">
                        <path d="M6 14H114" stroke="#c7902a" strokeWidth="1.3" />
                        <g fill="#f2c14b">
                            <ellipse cx="44" cy="10" rx="5" ry="2.4" transform="rotate(-30 44 10)" />
                            <ellipse cx="44" cy="18" rx="5" ry="2.4" transform="rotate(30 44 18)" />
                            <ellipse cx="36" cy="10" rx="5" ry="2.4" transform="rotate(-30 36 10)" />
                            <ellipse cx="36" cy="18" rx="5" ry="2.4" transform="rotate(30 36 18)" />
                            <ellipse cx="50" cy="14" rx="5" ry="2.4" />
                            <ellipse cx="76" cy="10" rx="5" ry="2.4" transform="rotate(30 76 10)" />
                            <ellipse cx="76" cy="18" rx="5" ry="2.4" transform="rotate(-30 76 18)" />
                            <ellipse cx="84" cy="10" rx="5" ry="2.4" transform="rotate(30 84 10)" />
                            <ellipse cx="84" cy="18" rx="5" ry="2.4" transform="rotate(-30 84 18)" />
                            <ellipse cx="70" cy="14" rx="5" ry="2.4" />
                        </g>
                        <circle cx="60" cy="14" r="4" fill="#8cc56b" />
                    </symbol>
                </defs>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq4-overlay${opened ? ' aq4-hide' : ''}`}>
                    <div className="aq4-overlay-decor" aria-hidden="true">
                        <span className="aq4-overlay-petal aq4-overlay-petal-1">🐑</span>
                        <span className="aq4-overlay-petal aq4-overlay-petal-2">🌾</span>
                        <span className="aq4-overlay-petal aq4-overlay-petal-3">☁️</span>
                    </div>
                    <div className="aq4-overlay-frame">
                        <p className="aq4-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq4-overlay-label">Tasyakuran Aqiqah</p>
                        <div className="aq4-overlay-divider" />
                        <div className="aq4-overlay-name">{invitation.babyName}</div>
                        {invitation.fatherName && (
                            <p className="aq4-overlay-binti">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <p className="aq4-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq4-overlay-divider" />
                        <p className="aq4-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq4-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq4-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq4-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq4-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq4-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(63,127,65,0.5)' }}
                                />
                                <p className="aq4-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq4-btn-open" onClick={openInvitation}>
                            🐑 {greeting?.buttonText ?? 'Buka Undangan'} 🐑
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq4-main${opened ? ' aq4-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="aq4-hero">
                    <div className="aq4-sun" aria-hidden="true" />
                    <svg className="aq4-cloudlet aq4-cloudlet-1" aria-hidden="true">
                        <use href="#aq4-puff" />
                    </svg>
                    <svg className="aq4-cloudlet aq4-cloudlet-2" aria-hidden="true">
                        <use href="#aq4-puff" />
                    </svg>
                    <div className="aq4-hero-frame aq4-anim-up">
                        <p className="aq4-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq4-badge" style={{ marginTop: '6px' }}>
                            Tasyakuran Aqiqah
                        </p>
                        <div className="aq4-wool">
                            <svg className="aq4-ears" viewBox="0 0 180 40" aria-hidden="true">
                                <ellipse cx="22" cy="24" rx="20" ry="9" fill="#3b3435" transform="rotate(-25 22 24)" />
                                <ellipse cx="158" cy="24" rx="20" ry="9" fill="#3b3435" transform="rotate(25 158 24)" />
                            </svg>
                            <svg className="aq4-wool-scallop" viewBox="0 0 300 300" aria-hidden="true">
                                <path
                                    d="M278.0 150.0 A30 30 0 0 1 268.3 199.0 A30 30 0 0 1 240.5 240.5 A30 30 0 0 1 199.0 268.3 A30 30 0 0 1 150.0 278.0 A30 30 0 0 1 101.0 268.3 A30 30 0 0 1 59.5 240.5 A30 30 0 0 1 31.7 199.0 A30 30 0 0 1 22.0 150.0 A30 30 0 0 1 31.7 101.0 A30 30 0 0 1 59.5 59.5 A30 30 0 0 1 101.0 31.7 A30 30 0 0 1 150.0 22.0 A30 30 0 0 1 199.0 31.7 A30 30 0 0 1 240.5 59.5 A30 30 0 0 1 268.3 101.0 A30 30 0 0 1 278.0 150.0Z"
                                    fill="#fff"
                                    stroke="var(--aq4-line)"
                                    strokeWidth="2"
                                />
                            </svg>
                            <div
                                className="aq4-wool-photo"
                                role="img"
                                aria-label={babyPhoto ? `Foto ${invitation.babyName}` : `Monogram ${invitation.babyName}`}
                                style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!babyPhoto && (
                                    <svg viewBox="0 0 160 160" aria-hidden="true">
                                        <circle cx="80" cy="80" r="62" fill="var(--aq4-mint)" />
                                        <text x="80" y="102" textAnchor="middle" fontFamily="Gluten, cursive" fontSize="70" fill="var(--aq4-grass-3)">
                                            {babyInitial}
                                        </text>
                                    </svg>
                                )}
                            </div>
                            <div className="aq4-wool-ring" aria-hidden="true" />
                        </div>
                        <p className="aq4-pre">Alhamdulillah, telah lahir buah hati kami</p>
                        <h1 className="aq4-hero-name">{invitation.babyName}</h1>
                        {invitation.fatherName && (
                            <p className="aq4-lineage">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <div className="aq4-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq4-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        <p className="aq4-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq4-countdown"
                                boxClassName="aq4-countdown-box"
                                numClassName="aq4-countdown-num"
                                labelClassName="aq4-countdown-label"
                            />
                        )}
                        <div className="aq4-scroll-indicator">↓</div>
                    </div>
                    <div className="aq4-pasture" aria-hidden="true">
                        <svg className="aq4-hills" viewBox="0 0 400 150" preserveAspectRatio="none">
                            <path d="M0 70Q90 30 190 64T400 52V150H0Z" fill="#8cc56b" />
                            <path d="M0 104Q130 70 250 100T400 92V150H0Z" fill="#5da653" />
                            <g fill="#fff">
                                <circle cx="70" cy="80" r="2.5" />
                                <circle cx="210" cy="84" r="2.5" />
                                <circle cx="330" cy="72" r="2.5" />
                            </g>
                            <g fill="#f2c14b">
                                <circle cx="140" cy="76" r="2.5" />
                                <circle cx="290" cy="110" r="2.5" />
                            </g>
                        </svg>
                        <svg className="aq4-grazer" style={{ left: '14%', bottom: '62px' }}>
                            <use href="#aq4-sheep" />
                        </svg>
                        <svg className="aq4-grazer" style={{ left: '58%', bottom: '72px', width: '58px', height: '44px', transform: 'scaleX(-1)' }}>
                            <use href="#aq4-sheep" />
                        </svg>
                        <svg className="aq4-grazer aq4-grazer-walk" style={{ bottom: '22px' }}>
                            <use href="#aq4-sheep" />
                        </svg>
                    </div>
                </section>

                {/* ── OPENING MESSAGE / SALAM ──────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="aq4-section">
                        <div className="aq4-card aq4-anim-up">
                            <p className="aq4-badge">Assalamu'alaikum</p>
                            <p className="aq4-arabic" lang="ar" dir="rtl">
                                عَنِ الْغُلَامِ شَاتَانِ مُكَافِئَتَانِ، وَعَنِ الْجَارِيَةِ شَاةٌ
                            </p>
                            <blockquote className="aq4-blockquote">
                                "Untuk anak laki-laki dua ekor kambing yang sepadan, dan untuk anak perempuan satu ekor kambing."
                            </blockquote>
                            <p className="aq4-src">HR. Tirmidzi, dari Aisyah radhiyallahu 'anha</p>
                            <svg className="aq4-divider-svg" aria-hidden="true">
                                <use href="#aq4-wheat" />
                            </svg>
                            <p className="aq4-lead">{invitation.openingMessage}</p>
                        </div>
                    </section>
                )}

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq4-section">
                        <div className="aq4-card aq4-anim-up">
                            <p className="aq4-badge">Si Kecil</p>
                            <h2 className="aq4-h2">Buah hati penuh barakah</h2>
                            <div className="aq4-kid">
                                <div
                                    className="aq4-kid-pic"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && <span>{babyInitial}</span>}
                                </div>
                                <div>
                                    <p className="aq4-kid-name">{invitation.babyName}</p>
                                    {invitation.fatherName && (
                                        <p className="aq4-kid-binti">
                                            {bintiWord} {invitation.fatherName}
                                        </p>
                                    )}
                                    {babyGender && (
                                        <p className="aq4-profile-gender">
                                            {genderIcon(babyGender)} {babyGender}
                                        </p>
                                    )}
                                    {invitation.birthDateFormatted && <p className="aq4-profile-birth">{invitation.birthDateFormatted}</p>}
                                </div>
                            </div>
                            {profileLine && (
                                <div className="aq4-parents">
                                    <p className="aq4-parents-who">{profileLine}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq4-section aq4-events-bg">
                        <h2 className="aq4-section-title aq4-light aq4-anim-up">Waktu &amp; Tempat</h2>
                        <div className="aq4-flock aq4-anim-up" aria-hidden="true">
                            {Array.from({ length: sheepCount }).map((_, i) => (
                                <svg key={i}>
                                    <use href="#aq4-sheep" />
                                </svg>
                            ))}
                        </div>
                        <p className="aq4-flock-note aq4-anim-up">
                            Aqiqah dengan {sheepCount} ekor kambing{genderWord ? ` untuk sang ${genderWord.toLowerCase()}` : ''}
                        </p>
                        <div className="aq4-divider aq4-light aq4-anim-up">
                            <span>🌾</span>
                        </div>
                        <div className="aq4-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="aq4-event-card aq4-anim-up">
                                        <span className="aq4-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="aq4-event-name">{ev.name}</h3>
                                        <div className="aq4-event-divider" />
                                        <p className="aq4-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="aq4-event-detail">{timeStr}</p>}
                                        <div className="aq4-event-divider" />
                                        {ev.locationName && (
                                            <p className="aq4-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="aq4-event-detail">{ev.location}</p>}
                                        <div className="aq4-event-actions">
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq4-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="aq4-btn-event" onClick={() => addToCalendar(ev, invitation.babyName)}>
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
                            <section className="aq4-section">
                                <h2 className="aq4-section-title aq4-anim-up">Lokasi Acara</h2>
                                <div className="aq4-divider aq4-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p className="aq4-location-sub aq4-anim-up">
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div className="aq4-map-container aq4-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="aq4-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq4-btn-maps">
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
                    <section className="aq4-section">
                        <h2 className="aq4-section-title aq4-anim-up">Galeri Foto</h2>
                        <div className="aq4-divider aq4-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq4-gallery-grid',
                                item: 'aq4-gallery-item',
                                thumb: 'aq4-gallery-thumb',
                                overlay: 'aq4-gallery-overlay',
                                filterBar: 'aq4-gallery-filter-bar',
                                filterBtn: 'aq4-filter-btn',
                                filterBtnActive: 'aq4-filter-btn aq4-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq4-section">
                        <h2 className="aq4-section-title aq4-anim-up">Video Kenangan</h2>
                        <div className="aq4-divider aq4-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="aq4-video-frame aq4-anim-up">
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
                    <section className="aq4-section aq4-gift-bg">
                        <h2 className="aq4-section-title aq4-anim-up">Amplop Digital</h2>
                        <div className="aq4-divider aq4-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="aq4-gift-subtitle aq4-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda kasih
                            untuk sang buah hati, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq4-bank-grid',
                                bankCard: 'aq4-bank-card',
                                bankLogo: 'aq4-bank-logo',
                                bankType: 'aq4-bank-type',
                                bankNumber: 'aq4-bank-number',
                                bankName: 'aq4-bank-name',
                                copyBankBtn: 'aq4-btn-copy-bank',
                                ewalletGrid: 'aq4-ewallet-grid',
                                ewalletCard: 'aq4-ewallet-card',
                                ewalletName: 'aq4-ewallet-name',
                                ewalletPhone: 'aq4-ewallet-phone',
                                copyEwalletBtn: 'aq4-btn-copy-ewallet',
                                ewalletTitle: 'aq4-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq4-section">
                        <h2 className="aq4-section-title aq4-anim-up">RSVP &amp; Doa</h2>
                        <div className="aq4-divider aq4-anim-up">
                            <span>✉️</span>
                        </div>
                        <p className="aq4-rsvp-hint aq4-anim-up">Titipkan doa barakah untuk sang buah hati.</p>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'aq4-rsvp-form',
                                label: 'aq4-rsvp-label',
                                input: 'aq4-rsvp-input',
                                select: 'aq4-rsvp-select',
                                textarea: 'aq4-rsvp-textarea',
                                radioGroup: 'aq4-rsvp-radio-group',
                                radioLabel: 'aq4-rsvp-radio-label',
                                errorText: 'aq4-rsvp-error',
                                submitBtn: 'aq4-rsvp-submit',
                                successBox: 'aq4-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq4-section aq4-wishes-bg">
                        <h2 className="aq4-section-title aq4-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq4-divider aq4-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq4-wishes-layout',
                                formBox: 'aq4-wishes-form',
                                formTitle: 'aq4-wishes-form-title',
                                nameInput: 'aq4-wish-input',
                                messageInput: 'aq4-wish-input',
                                submitBtn: 'aq4-wish-btn',
                                wishCard: 'aq4-wish-card',
                                wishAvatar: 'aq4-wish-avatar',
                                wishName: 'aq4-wish-name',
                                wishDate: 'aq4-wish-date',
                                wishMessage: 'aq4-wish-message',
                                loadMoreBtn: 'aq4-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="aq4-section">
                        <div className="aq4-card aq4-anim-up">
                            <p className="aq4-lead">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq4-closing-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <svg className="aq4-divider-svg" aria-hidden="true">
                                <use href="#aq4-wheat" />
                            </svg>
                            <p className="aq4-badge" style={{ marginTop: '14px' }}>
                                Kami yang berbahagia
                            </p>
                            <p className="aq4-closing-family">
                                {invitation.babyName}
                                {parentsLine && (
                                    <>
                                        <br />
                                        Keluarga {parentsLine}
                                    </>
                                )}
                            </p>
                            <p className="aq4-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </div>
                    </section>
                )}

                <svg className="aq4-fence" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 40Q200 22 400 40V60H0Z" fill="#5da653" />
                    <g fill="#c99a6b" stroke="#a9774c" strokeWidth="1.5">
                        <rect x="0" y="16" width="400" height="6" />
                        <rect x="0" y="30" width="400" height="6" />
                        <path d="M20 44V10l5-6 5 6v34zM80 42V8l5-6 5 6v34zM140 40V6l5-6 5 6v34zM200 38V4l5-6 5 6v34zM260 38V4l5-6 5 6v34zM320 40V6l5-6 5 6v34zM380 42V8l5-6 5 6v34z" />
                    </g>
                </svg>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq4-grass-3)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq4-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq4-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
