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
import './aqiqah-theme-07.css';

interface AqiqahTheme07Props {
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
    return '🐻';
}

function nasabWord(gender: string): string {
    return gender === 'Perempuan' ? 'binti' : 'bin';
}

interface DateParts {
    day: string;
    weekday: string;
    month: string;
}

function formatDateParts(dateStr: string): DateParts | null {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return {
        day: String(d.getDate()).padStart(2, '0'),
        weekday: d.toLocaleDateString('id-ID', { weekday: 'long' }),
        month: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    };
}

export default function AqiqahTheme07({ invitation, visitor, greeting }: AqiqahTheme07Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq7-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq7-anim-up').forEach((el) => observer.observe(el));
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
    const primaryTimeStr = primaryEvent?.time ? (primaryEvent.timeEnd ? `${primaryEvent.time} – ${primaryEvent.timeEnd} WIB` : `${primaryEvent.time} WIB`) : '';

    return (
        <div className="aq7-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Grandstander:wght@500;600;700;800&family=Mulish:wght@500;600;700;800&display=swap');
            `}</style>

            {/* Reusable SVG symbols */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <symbol id="aq7-paw-icon" viewBox="0 0 24 24">
                    <g fill="currentColor">
                        <ellipse cx="12" cy="16" rx="6" ry="5" />
                        <circle cx="5" cy="9" r="2.4" />
                        <circle cx="10" cy="5" r="2.4" />
                        <circle cx="15" cy="5" r="2.4" />
                        <circle cx="19" cy="9" r="2.4" />
                    </g>
                </symbol>
                <symbol id="aq7-heart-icon" viewBox="0 0 24 22">
                    <path d="M12 21S1 14 1 7a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 7-11 14-11 14z" fill="#f5bfb0" />
                </symbol>
                <symbol id="aq7-peekbear-icon" viewBox="0 0 96 60">
                    <g>
                        <circle cx="24" cy="16" r="11" fill="#c8864f" />
                        <circle cx="24" cy="16" r="6" fill="#f5bfb0" />
                        <circle cx="72" cy="16" r="11" fill="#c8864f" />
                        <circle cx="72" cy="16" r="6" fill="#f5bfb0" />
                        <ellipse cx="48" cy="40" rx="32" ry="28" fill="#c8864f" />
                        <ellipse cx="48" cy="48" rx="13" ry="10" fill="#f3d6b3" />
                        <circle cx="37" cy="36" r="3.4" fill="#4a3226" />
                        <circle cx="59" cy="36" r="3.4" fill="#4a3226" />
                        <circle cx="38" cy="35" r="1.1" fill="#fff" />
                        <circle cx="60" cy="35" r="1.1" fill="#fff" />
                        <ellipse cx="48" cy="44" rx="4.5" ry="3.2" fill="#4a3226" />
                        <path d="M44 50q4 4 8 0" stroke="#4a3226" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <ellipse cx="28" cy="46" rx="5" ry="3" fill="#f5a896" opacity=".7" />
                        <ellipse cx="68" cy="46" rx="5" ry="3" fill="#f5a896" opacity=".7" />
                    </g>
                    <ellipse cx="22" cy="58" rx="10" ry="6" fill="#b87744" />
                    <ellipse cx="74" cy="58" rx="10" ry="6" fill="#b87744" />
                </symbol>
                <symbol id="aq7-balloon-icon" viewBox="0 0 46 110">
                    <ellipse cx="23" cy="26" rx="21" ry="24" fill="#bcdcf2" />
                    <ellipse cx="16" cy="18" rx="5" ry="8" fill="#fff" opacity=".6" />
                    <path d="M20 50h6l-3 5z" fill="#9cc6e6" />
                    <path d="M23 55c-6 14 6 24-2 54" stroke="#8a6c5b" strokeWidth="1.2" fill="none" />
                </symbol>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq7-overlay${opened ? ' aq7-hide' : ''}`}>
                    <div className="aq7-overlay-decor" aria-hidden="true">
                        <span className="aq7-overlay-sprite aq7-overlay-sprite-1">🧸</span>
                        <span className="aq7-overlay-sprite aq7-overlay-sprite-2">🎈</span>
                        <span className="aq7-overlay-sprite aq7-overlay-sprite-3">🍯</span>
                        <span className="aq7-overlay-cloud aq7-overlay-cloud-1">☁️</span>
                        <span className="aq7-overlay-cloud aq7-overlay-cloud-2">☁️</span>
                    </div>
                    <div className="aq7-overlay-frame">
                        <span className="aq7-pill">Tasyakuran Aqiqah</span>
                        <div className="aq7-bearframe aq7-overlay-bearframe">
                            <span className="aq7-ear aq7-ear-l" aria-hidden="true" />
                            <span className="aq7-ear aq7-ear-r" aria-hidden="true" />
                            <div className="aq7-face">
                                <div
                                    className="aq7-face-photo"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && genderIcon(babyGender)}
                                </div>
                            </div>
                            <svg className="aq7-bow" viewBox="0 0 80 40" aria-hidden="true">
                                <path d="M40 20L8 4Q2 20 8 36Z" fill="#5f93bd" />
                                <path d="M40 20L72 4Q78 20 72 36Z" fill="#5f93bd" />
                                <circle cx="40" cy="20" r="8" fill="#bcdcf2" />
                            </svg>
                        </div>
                        <div className="aq7-overlay-name">{invitation.babyName}</div>
                        {nasabLine && <p className="aq7-overlay-nasab">{nasabLine}</p>}
                        {babyGender && (
                            <p className="aq7-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <p className="aq7-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <div className="aq7-overlay-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq7-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq7-overlay-qr">
                                <GuestQrCode data={invitation.guestQrData} size={120} style={{ borderRadius: '16px', border: '4px solid #fff' }} />
                                <p className="aq7-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq7-btn-open" onClick={openInvitation}>
                            🐾 {greeting?.buttonText ?? 'Buka Undangan'} 🐾
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq7-main${opened ? ' aq7-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq7-hero">
                    <svg className="aq7-bunting" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 8 Q200 60 400 8" fill="none" stroke="#8a6c5b" strokeWidth="1.5" />
                        <path d="M34 14l30 8-10 28z" fill="#bcdcf2" />
                        <path d="M72 21l30 6-11 28z" fill="#f5bfb0" />
                        <path d="M110 26l30 5-12 28z" fill="#eab66d" />
                        <path d="M148 31l30 3-14 27z" fill="#bcdcf2" />
                        <path d="M186 34h30l-15 27z" fill="#c8864f" />
                        <path d="M224 34l30-3-16 27z" fill="#f5bfb0" />
                        <path d="M262 31l30-5-18 28z" fill="#eab66d" />
                        <path d="M300 26l30-7-9 28z" fill="#bcdcf2" />
                        <path d="M338 20l30-8-8 28z" fill="#c8864f" />
                    </svg>
                    <svg className="aq7-balloon aq7-balloon-l" viewBox="0 0 46 110" aria-hidden="true">
                        <use href="#aq7-balloon-icon" />
                    </svg>
                    <svg className="aq7-balloon aq7-balloon-r" viewBox="0 0 46 110" aria-hidden="true">
                        <use href="#aq7-balloon-icon" />
                    </svg>
                    <div className="aq7-col">
                        <p className="aq7-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <span className="aq7-pill">Tasyakuran Aqiqah</span>
                        <div className="aq7-bearframe aq7-anim-up">
                            <span className="aq7-ear aq7-ear-l" aria-hidden="true" />
                            <span className="aq7-ear aq7-ear-r" aria-hidden="true" />
                            <div className="aq7-face">
                                <div
                                    className="aq7-face-photo"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && genderIcon(babyGender)}
                                </div>
                            </div>
                            <svg className="aq7-bow" viewBox="0 0 80 40" aria-hidden="true">
                                <path d="M40 20L8 4Q2 20 8 36Z" fill="#5f93bd" />
                                <path d="M40 20L72 4Q78 20 72 36Z" fill="#5f93bd" />
                                <circle cx="40" cy="20" r="8" fill="#bcdcf2" />
                            </svg>
                        </div>
                        <p className="aq7-pre">Ada si kecil yang ingin bertemu Anda…</p>
                        <h1 className="aq7-hero-name">{invitation.babyName}</h1>
                        {nasabLine && <p className="aq7-bin">{nasabLine}</p>}
                        <div className="aq7-tags">
                            {invitation.mainDateFormatted && (
                                <span>
                                    <svg aria-hidden="true">
                                        <use href="#aq7-paw-icon" />
                                    </svg>
                                    {invitation.mainDateFormatted}
                                </span>
                            )}
                            {primaryTimeStr && (
                                <span>
                                    <svg aria-hidden="true">
                                        <use href="#aq7-paw-icon" />
                                    </svg>
                                    {primaryTimeStr}
                                </span>
                            )}
                        </div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq7-countdown"
                                boxClassName="aq7-countdown-box"
                                numClassName="aq7-countdown-num"
                                labelClassName="aq7-countdown-label"
                            />
                        )}
                        <div className="aq7-scroll-indicator">↓</div>
                    </div>
                </header>

                <main className="aq7-col">
                    {/* ── OPENING MESSAGE / SALAM ──────────────────────────────────── */}
                    <section className="aq7-card aq7-anim-up">
                        <svg className="aq7-peek aq7-peek-l" aria-hidden="true">
                            <use href="#aq7-peekbear-icon" />
                        </svg>
                        <p className="aq7-hand">Assalamu'alaikum</p>
                        <p className="aq7-arabic" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq7-blockquote">
                            "Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama."
                        </blockquote>
                        <p className="aq7-src">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <div className="aq7-hearts" aria-hidden="true">
                            <svg>
                                <use href="#aq7-heart-icon" />
                            </svg>
                            <svg>
                                <use href="#aq7-heart-icon" />
                            </svg>
                            <svg>
                                <use href="#aq7-heart-icon" />
                            </svg>
                        </div>
                        {invitation.openingMessage && <p className="aq7-lead">{invitation.openingMessage}</p>}
                    </section>

                    {/* ── BABY PROFILE ─────────────────────────────────────────────── */}
                    {isEnabled('couple_profile') && (
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-r" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">Kenalan yuk!</p>
                            <h2 className="aq7-h2">Si beruang kecil kami</h2>
                            <div className="aq7-kid">
                                <div
                                    className="aq7-kid-pic"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && <span className="aq7-kid-pic-fallback">{genderIcon(babyGender)}</span>}
                                </div>
                                <div>
                                    <p className="aq7-kid-n">{invitation.babyName}</p>
                                    {nasabLine && <p className="aq7-kid-b">{nasabLine}</p>}
                                    <ul className="aq7-facts">
                                        {babyGender && (
                                            <li>
                                                <svg aria-hidden="true">
                                                    <use href="#aq7-paw-icon" />
                                                </svg>
                                                {babyGender}
                                            </li>
                                        )}
                                        {invitation.birthDateFormatted && (
                                            <li>
                                                <svg aria-hidden="true">
                                                    <use href="#aq7-paw-icon" />
                                                </svg>
                                                Lahir {invitation.birthDateFormatted}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            {parentsLine && (
                                <div className="aq7-parents">
                                    <p className="aq7-parents-label">{parentsLabel}</p>
                                    <p className="aq7-parents-who">{parentsLine}</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ── EVENTS ────────────────────────────────────────────────────── */}
                    {isEnabled('event_detail') &&
                        invitation.events.length > 0 &&
                        invitation.events.map((ev, i) => {
                            const parts = formatDateParts(ev.date);
                            const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                            return (
                                <section className="aq7-card aq7-anim-up" key={i}>
                                    <svg className="aq7-peek aq7-peek-l" aria-hidden="true">
                                        <use href="#aq7-peekbear-icon" />
                                    </svg>
                                    <p className="aq7-hand">Waktu &amp; Tempat</p>
                                    <h2 className="aq7-h2">{ev.name}</h2>
                                    <div className="aq7-datebox">
                                        {parts && (
                                            <div>
                                                <b>{parts.weekday}</b>
                                                <span>HARI</span>
                                            </div>
                                        )}
                                        {parts && (
                                            <div className="aq7-datebox-mid">
                                                <b>{parts.day}</b>
                                                <span>{parts.month.toUpperCase()}</span>
                                            </div>
                                        )}
                                        {ev.time && (
                                            <div>
                                                <b>{ev.time}</b>
                                                <span>WIB</span>
                                            </div>
                                        )}
                                    </div>
                                    {(ev.locationName || ev.location) && (
                                        <div className="aq7-place">
                                            <p className="aq7-place-time">Lokasi Acara</p>
                                            {ev.locationName && <p>{ev.locationName}</p>}
                                            {ev.location && <p className="aq7-muted">{ev.location}</p>}
                                        </div>
                                    )}
                                    <div className="aq7-actions">
                                        {mapsUrl && (
                                            <a className="aq7-btn aq7-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                Buka Peta
                                            </a>
                                        )}
                                        <button className="aq7-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                            Simpan Tanggal
                                        </button>
                                    </div>
                                </section>
                            );
                        })}

                    {/* ── LOCATION MAP ─────────────────────────────────────────────── */}
                    {isEnabled('location') &&
                        primaryEvent &&
                        (primaryEvent.mapsEmbed || primaryEvent.locationUrl) &&
                        (() => {
                            const mapsUrl =
                                primaryEvent.locationUrl ||
                                (primaryEvent.mapsLat && primaryEvent.mapsLng
                                    ? `https://maps.google.com/?q=${primaryEvent.mapsLat},${primaryEvent.mapsLng}`
                                    : '');
                            return (
                                <section className="aq7-card aq7-anim-up">
                                    <svg className="aq7-peek aq7-peek-r" aria-hidden="true">
                                        <use href="#aq7-peekbear-icon" />
                                    </svg>
                                    <p className="aq7-hand">Peta Lokasi</p>
                                    <h2 className="aq7-h2">Lokasi Acara</h2>
                                    {primaryEvent.mapsEmbed && (
                                        <div className="aq7-map-wrapper">
                                            <iframe
                                                src={primaryEvent.mapsEmbed}
                                                width="100%"
                                                height="260"
                                                style={{ border: 0, display: 'block' }}
                                                allowFullScreen
                                                loading="lazy"
                                                title={`Lokasi ${primaryEvent.locationName || primaryEvent.name}`}
                                            />
                                        </div>
                                    )}
                                    {mapsUrl && (
                                        <div className="aq7-actions">
                                            <a className="aq7-btn aq7-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </section>
                            );
                        })()}

                    {/* ── GALLERY ───────────────────────────────────────────────────── */}
                    {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-l" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">Kenangan Manis</p>
                            <h2 className="aq7-h2">Galeri Foto</h2>
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'aq7-gallery-grid',
                                    item: 'aq7-gallery-item',
                                    thumb: 'aq7-gallery-thumb',
                                    overlay: 'aq7-gallery-overlay',
                                    filterBar: 'aq7-gallery-filter-bar',
                                    filterBtn: 'aq7-filter-btn',
                                    filterBtnActive: 'aq7-filter-btn aq7-filter-btn-active',
                                }}
                            />
                        </section>
                    )}

                    {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                    {isEnabled('video') && babyVideoEmbedUrl && (
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-r" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">Video Kenangan</p>
                            <h2 className="aq7-h2">Video Kenangan</h2>
                            <div className="aq7-video-frame">
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
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-l" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">Kasih Sayang</p>
                            <h2 className="aq7-h2">Amplop Digital</h2>
                            <p className="aq7-lead">
                                Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan
                                tanda kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                            </p>
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'aq7-bank-grid',
                                    bankCard: 'aq7-bank-card',
                                    bankLogo: 'aq7-bank-logo',
                                    bankType: 'aq7-bank-type',
                                    bankNumber: 'aq7-bank-number',
                                    bankName: 'aq7-bank-name',
                                    copyBankBtn: 'aq7-btn-copy-bank',
                                    ewalletGrid: 'aq7-ewallet-grid',
                                    ewalletCard: 'aq7-ewallet-card',
                                    ewalletName: 'aq7-ewallet-name',
                                    ewalletPhone: 'aq7-ewallet-phone',
                                    copyEwalletBtn: 'aq7-btn-copy-ewallet',
                                    ewalletTitle: 'aq7-ewallet-title',
                                }}
                            />
                        </section>
                    )}

                    {/* ── RSVP ──────────────────────────────────────────────────────── */}
                    {isEnabled('rsvp') && (
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-r" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">RSVP &amp; Doa</p>
                            <h2 className="aq7-h2">Titip doa untuk {invitation.babyName}</h2>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'aq7-rsvp-form',
                                    label: 'aq7-label',
                                    input: 'aq7-input',
                                    select: 'aq7-select',
                                    textarea: 'aq7-textarea',
                                    radioGroup: 'aq7-radio-group',
                                    radioLabel: 'aq7-radio-label',
                                    errorText: 'aq7-err',
                                    submitBtn: 'aq7-send',
                                    successBox: 'aq7-rsvp-success',
                                }}
                            />
                        </section>
                    )}

                    {/* ── WISHES ────────────────────────────────────────────────────── */}
                    {isEnabled('wishes') && (
                        <section className="aq7-card aq7-anim-up">
                            <svg className="aq7-peek aq7-peek-l" aria-hidden="true">
                                <use href="#aq7-peekbear-icon" />
                            </svg>
                            <p className="aq7-hand">Ucapan &amp; Doa</p>
                            <h2 className="aq7-h2">Ucapan untuk {invitation.babyName}</h2>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'aq7-wishes-layout',
                                    formBox: 'aq7-wishes-form',
                                    formTitle: 'aq7-wishes-form-title',
                                    nameInput: 'aq7-wish-input',
                                    messageInput: 'aq7-wish-input',
                                    submitBtn: 'aq7-wish-btn',
                                    wishCard: 'aq7-wish-card',
                                    wishAvatar: 'aq7-wish-avatar',
                                    wishName: 'aq7-wish-name',
                                    wishDate: 'aq7-wish-date',
                                    wishMessage: 'aq7-wish-message',
                                    loadMoreBtn: 'aq7-btn-more',
                                }}
                            />
                        </section>
                    )}

                    {/* ── CLOSING ───────────────────────────────────────────────────── */}
                    {isEnabled('footer') && (
                        <section className="aq7-card aq7-closing-card aq7-anim-up">
                            <svg className="aq7-sleepbear" viewBox="0 0 150 80" role="img" aria-label="Beruang kecil tertidur">
                                <ellipse cx="75" cy="70" rx="60" ry="8" fill="#ecd8bf" />
                                <ellipse cx="80" cy="54" rx="42" ry="20" fill="#c8864f" />
                                <circle cx="44" cy="44" r="22" fill="#c8864f" />
                                <circle cx="30" cy="26" r="8" fill="#c8864f" />
                                <circle cx="30" cy="26" r="4" fill="#f5bfb0" />
                                <circle cx="56" cy="24" r="8" fill="#c8864f" />
                                <circle cx="56" cy="24" r="4" fill="#f5bfb0" />
                                <ellipse cx="42" cy="52" rx="9" ry="7" fill="#f3d6b3" />
                                <ellipse cx="42" cy="49" rx="3" ry="2.2" fill="#4a3226" />
                                <path d="M31 42q4 3 8 0M47 42q4 3 8 0" stroke="#4a3226" strokeWidth="2" fill="none" strokeLinecap="round" />
                                <path d="M58 60c10-6 34-6 52 0" stroke="#bcdcf2" strokeWidth="10" strokeLinecap="round" fill="none" />
                                <text className="aq7-zz" x="70" y="22" fontFamily="Grandstander, sans-serif" fontWeight="800" fontSize="14" fill="#8a6c5b">
                                    z
                                </text>
                                <text
                                    className="aq7-zz aq7-zz-2"
                                    x="82"
                                    y="12"
                                    fontFamily="Grandstander, sans-serif"
                                    fontWeight="800"
                                    fontSize="10"
                                    fill="#8a6c5b"
                                >
                                    z
                                </text>
                            </svg>
                            <p className="aq7-lead">
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq7-closing-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <p className="aq7-hand" style={{ marginTop: '16px' }}>
                                Kami yang berbahagia
                            </p>
                            <p className="aq7-closing-name">{invitation.babyName}</p>
                            {parentsLine && <p className="aq7-family">Kel. {parentsLine}</p>}
                            <p className="aq7-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </section>
                    )}
                </main>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq7-caramel)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq7-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq7-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
