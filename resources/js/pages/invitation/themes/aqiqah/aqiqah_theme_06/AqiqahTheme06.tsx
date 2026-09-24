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
import './aqiqah-theme-06.css';

interface AqiqahTheme06Props {
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
    return '🐰';
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

export default function AqiqahTheme06({ invitation, visitor, greeting }: AqiqahTheme06Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq6-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq6-anim-up').forEach((el) => observer.observe(el));
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
        <div className="aq6-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Fuzzy+Bubbles:wght@400;700&family=Nunito+Sans:opsz,wght@6..12,500;6..12,600;6..12,700;6..12,800&family=Sniglet:wght@400;800&display=swap');
            `}</style>

            {/* Reusable SVG symbols */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <symbol id="aq6-carrot-icon" viewBox="0 0 24 24">
                    <path d="M6 20C4 18 8 10 12 7l5 5c-3 4-9 10-11 8z" fill="#f5913e" />
                    <path d="M9 13l2 1M8 16l2 1M12 10l2 1" stroke="#c96d24" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M15 8c0-3 1-5 3-6 0 2-1 4-2 5 2-1 4-1 6 0-2 2-4 2-6 2z" fill="#63b35f" />
                </symbol>
                <symbol id="aq6-cardears-icon" viewBox="0 0 84 60">
                    <path d="M22 60C14 40 12 12 22 4c10 8 10 36 8 56z" fill="#fff" />
                    <path d="M23 56C18 40 17 18 22 10c5 8 5 28 4 46z" fill="#fbd3dc" />
                    <path d="M62 60C70 40 72 12 62 4c-10 8-10 36-8 56z" fill="#fff" />
                    <path d="M61 56C66 40 67 18 62 10c-5 8-5 28-4 46z" fill="#fbd3dc" />
                </symbol>
                <symbol id="aq6-hop-icon" viewBox="0 0 56 50">
                    <g>
                        <ellipse cx="26" cy="36" rx="18" ry="12" fill="#fff" stroke="#dfe7e3" strokeWidth="1.5" />
                        <circle cx="8" cy="34" r="5" fill="#fff" stroke="#dfe7e3" strokeWidth="1.5" />
                        <circle cx="42" cy="26" r="11" fill="#fff" stroke="#dfe7e3" strokeWidth="1.5" />
                        <path d="M38 17C34 8 34 2 37 1c3 1 4 8 4 15z" fill="#fff" stroke="#dfe7e3" strokeWidth="1.5" />
                        <path d="M44 16c1-9 4-14 7-13 2 2-1 9-4 14z" fill="#fff" stroke="#dfe7e3" strokeWidth="1.5" />
                        <circle cx="46" cy="25" r="1.8" fill="#3a4a44" />
                        <circle cx="52" cy="29" r="1.6" fill="#f08aa3" />
                        <ellipse cx="44" cy="30" rx="2.5" ry="1.5" fill="#fbd3dc" />
                    </g>
                </symbol>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq6-overlay${opened ? ' aq6-hide' : ''}`}>
                    <div className="aq6-overlay-decor" aria-hidden="true">
                        <span className="aq6-overlay-sprite aq6-overlay-sprite-1">🐰</span>
                        <span className="aq6-overlay-sprite aq6-overlay-sprite-2">🥕</span>
                        <span className="aq6-overlay-sprite aq6-overlay-sprite-3">🌿</span>
                        <span className="aq6-overlay-cloud aq6-overlay-cloud-1">☁️</span>
                        <span className="aq6-overlay-cloud aq6-overlay-cloud-2">☁️</span>
                    </div>
                    <div className="aq6-overlay-frame">
                        <span className="aq6-pill">Tasyakuran Aqiqah</span>
                        <div className="aq6-overlay-ears" aria-hidden="true">
                            <svg viewBox="0 0 190 130">
                                <g>
                                    <path d="M52 130C30 90 26 30 50 6c24 22 26 82 18 124z" fill="#fff" />
                                    <path d="M53 122C38 88 36 42 50 20c14 20 16 66 11 102z" fill="#fbd3dc" />
                                </g>
                                <g>
                                    <path d="M138 130c22-40 26-100 2-124-24 22-26 82-18 124z" fill="#fff" />
                                    <path d="M137 122c15-34 17-80 3-102-14 20-16 66-11 102z" fill="#fbd3dc" />
                                </g>
                            </svg>
                        </div>
                        <div className="aq6-overlay-name">{invitation.babyName}</div>
                        {nasabLine && <p className="aq6-overlay-nasab">{nasabLine}</p>}
                        <p className="aq6-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <div className="aq6-overlay-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq6-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq6-overlay-qr">
                                <GuestQrCode data={invitation.guestQrData} size={120} style={{ borderRadius: '16px', border: '4px solid #fff' }} />
                                <p className="aq6-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq6-btn-open" onClick={openInvitation}>
                            🐾 {greeting?.buttonText ?? 'Buka Undangan'} 🐾
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq6-main${opened ? ' aq6-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq6-hero">
                    <div className="aq6-col">
                        <p className="aq6-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <span className="aq6-pill">Tasyakuran Aqiqah</span>
                        <div className="aq6-bunnyframe aq6-anim-up">
                            <svg className="aq6-ears" viewBox="0 0 190 130" aria-hidden="true">
                                <g>
                                    <path d="M52 130C30 90 26 30 50 6c24 22 26 82 18 124z" fill="#fff" />
                                    <path d="M53 122C38 88 36 42 50 20c14 20 16 66 11 102z" fill="#fbd3dc" />
                                </g>
                                <g>
                                    <path d="M138 130c22-40 26-100 2-124-24 22-26 82-18 124z" fill="#fff" />
                                    <path d="M137 122c15-34 17-80 3-102-14 20-16 66-11 102z" fill="#fbd3dc" />
                                </g>
                            </svg>
                            <div className="aq6-ring">
                                <div
                                    className="aq6-hero-photo"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && genderIcon(babyGender)}
                                </div>
                            </div>
                            <svg className="aq6-paws" viewBox="0 0 110 30" aria-hidden="true">
                                <ellipse cx="30" cy="15" rx="22" ry="13" fill="#fff" stroke="#dfe7e3" strokeWidth="2" />
                                <ellipse cx="80" cy="15" rx="22" ry="13" fill="#fff" stroke="#dfe7e3" strokeWidth="2" />
                                <g fill="#fbd3dc">
                                    <circle cx="22" cy="12" r="3" />
                                    <circle cx="30" cy="9" r="3" />
                                    <circle cx="38" cy="12" r="3" />
                                    <circle cx="72" cy="12" r="3" />
                                    <circle cx="80" cy="9" r="3" />
                                    <circle cx="88" cy="12" r="3" />
                                </g>
                            </svg>
                        </div>
                        <p className="aq6-pre">hop hop… ada kabar gembira!</p>
                        <h1 className="aq6-hero-name">{invitation.babyName}</h1>
                        {nasabLine && <p className="aq6-bin">{nasabLine}</p>}
                        <div className="aq6-tags">
                            {invitation.mainDateFormatted && (
                                <span>
                                    <svg aria-hidden="true">
                                        <use href="#aq6-carrot-icon" />
                                    </svg>
                                    {invitation.mainDateFormatted}
                                </span>
                            )}
                            {primaryTimeStr && (
                                <span>
                                    <svg aria-hidden="true">
                                        <use href="#aq6-carrot-icon" />
                                    </svg>
                                    {primaryTimeStr}
                                </span>
                            )}
                        </div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq6-countdown"
                                boxClassName="aq6-countdown-box"
                                numClassName="aq6-countdown-num"
                                labelClassName="aq6-countdown-label"
                            />
                        )}
                        <div className="aq6-scroll-indicator">↓</div>
                    </div>
                    <div className="aq6-meadow" aria-hidden="true">
                        <svg className="aq6-hill" viewBox="0 0 400 120" preserveAspectRatio="none">
                            <path d="M0 70Q100 30 200 60T400 50V120H0Z" fill="#8fcf7a" />
                            <path d="M0 92Q120 64 240 88T400 80V120H0Z" fill="#5fae5a" />
                            <g fill="#fff">
                                <circle cx="60" cy="62" r="3" />
                                <circle cx="300" cy="58" r="3" />
                                <circle cx="180" cy="80" r="3" />
                            </g>
                            <g fill="#f08aa3">
                                <circle cx="120" cy="70" r="3" />
                                <circle cx="350" cy="78" r="3" />
                            </g>
                        </svg>
                        <svg className="aq6-hopper">
                            <use href="#aq6-hop-icon" />
                        </svg>
                    </div>
                </header>

                <main className="aq6-col">
                    {/* ── OPENING MESSAGE / SALAM ──────────────────────────────────── */}
                    <section className="aq6-card aq6-anim-up">
                        <svg className="aq6-cardears" aria-hidden="true">
                            <use href="#aq6-cardears-icon" />
                        </svg>
                        <p className="aq6-hand">Assalamu'alaikum</p>
                        <p className="aq6-arabic" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq6-blockquote">
                            "Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama."
                        </blockquote>
                        <p className="aq6-src">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <div className="aq6-carrots" aria-hidden="true">
                            <svg>
                                <use href="#aq6-carrot-icon" />
                            </svg>
                            <svg>
                                <use href="#aq6-carrot-icon" />
                            </svg>
                            <svg>
                                <use href="#aq6-carrot-icon" />
                            </svg>
                        </div>
                        {invitation.openingMessage && <p className="aq6-lead">{invitation.openingMessage}</p>}
                    </section>

                    {/* ── BABY PROFILE ─────────────────────────────────────────────── */}
                    {isEnabled('couple_profile') && (
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">kenalan yuk</p>
                            <h2 className="aq6-h2">Si kelinci kecil kami</h2>
                            <div className="aq6-kid">
                                <div
                                    className="aq6-kid-pic"
                                    style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!babyPhoto && <span className="aq6-kid-pic-fallback">{genderIcon(babyGender)}</span>}
                                </div>
                                <div>
                                    <p className="aq6-kid-n">{invitation.babyName}</p>
                                    {nasabLine && <p className="aq6-kid-b">{nasabLine}</p>}
                                    {invitation.birthDateFormatted && <p className="aq6-kid-quote">Lahir pada {invitation.birthDateFormatted}</p>}
                                </div>
                            </div>
                            {parentsLine && (
                                <div className="aq6-parents">
                                    <p className="aq6-parents-label">{parentsLabel}</p>
                                    <p className="aq6-parents-who">{parentsLine}</p>
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
                            const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                            return (
                                <section className="aq6-card aq6-anim-up" key={i}>
                                    <svg className="aq6-cardears" aria-hidden="true">
                                        <use href="#aq6-cardears-icon" />
                                    </svg>
                                    <p className="aq6-hand">waktu &amp; tempat</p>
                                    <h2 className="aq6-h2">{ev.name}</h2>
                                    <div className="aq6-datebox">
                                        <div className="aq6-bigcarrot">
                                            <svg viewBox="0 0 120 150" aria-hidden="true">
                                                <path
                                                    d="M60 40c-8-14-22-24-34-22 8 8 16 16 26 22M60 40c0-16 4-30 14-36 2 12-2 26-8 36M60 40c10-10 26-14 36-8-10 6-24 10-32 12"
                                                    fill="#63b35f"
                                                />
                                                <path d="M22 44Q60 30 98 44Q96 100 60 148Q24 100 22 44Z" fill="#f5913e" />
                                                <path d="M34 60h14M72 76h16M40 100h12M66 116h10" stroke="#c96d24" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            {parts && <b>{parts.day}</b>}
                                        </div>
                                        <div className="aq6-datebox-txt">
                                            {parts && <p className="aq6-datebox-d">{parts.weekday}</p>}
                                            {parts && <p className="aq6-datebox-m">{parts.month}</p>}
                                            {timeStr && <span className="aq6-datebox-t">Pukul {timeStr}</span>}
                                        </div>
                                    </div>
                                    {(ev.locationName || ev.location) && (
                                        <div className="aq6-place">
                                            {ev.locationName && <p>{ev.locationName}</p>}
                                            {ev.location && <p className="aq6-muted">{ev.location}</p>}
                                        </div>
                                    )}
                                    <div className="aq6-actions">
                                        {mapsUrl && (
                                            <a className="aq6-btn aq6-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                Buka Peta
                                            </a>
                                        )}
                                        <button className="aq6-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                            Simpan Tanggal
                                        </button>
                                    </div>
                                </section>
                            );
                        })}

                    {/* ── LOCATION MAP ──────────────────────────────────────────────── */}
                    {isEnabled('location') &&
                        primaryEvent &&
                        (primaryEvent.mapsEmbed || primaryEvent.locationUrl) &&
                        (() => {
                            const mapsUrl =
                                primaryEvent.locationUrl ||
                                (primaryEvent.mapsLat && primaryEvent.mapsLng ? `https://maps.google.com/?q=${primaryEvent.mapsLat},${primaryEvent.mapsLng}` : '');
                            return (
                                <section className="aq6-card aq6-anim-up">
                                    <svg className="aq6-cardears" aria-hidden="true">
                                        <use href="#aq6-cardears-icon" />
                                    </svg>
                                    <p className="aq6-hand">peta lokasi</p>
                                    <h2 className="aq6-h2">Lokasi Acara</h2>
                                    {primaryEvent.mapsEmbed && (
                                        <div className="aq6-map-wrapper">
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
                                        <div className="aq6-actions">
                                            <a className="aq6-btn aq6-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </section>
                            );
                        })()}

                    {/* ── GALLERY ───────────────────────────────────────────────────── */}
                    {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">kenangan manis</p>
                            <h2 className="aq6-h2">Galeri Foto</h2>
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'aq6-gallery-grid',
                                    item: 'aq6-gallery-item',
                                    thumb: 'aq6-gallery-thumb',
                                    overlay: 'aq6-gallery-overlay',
                                    filterBar: 'aq6-gallery-filter-bar',
                                    filterBtn: 'aq6-filter-btn',
                                    filterBtnActive: 'aq6-filter-btn aq6-filter-btn-active',
                                }}
                            />
                        </section>
                    )}

                    {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                    {isEnabled('video') && babyVideoEmbedUrl && (
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">video kenangan</p>
                            <h2 className="aq6-h2">Video Kenangan</h2>
                            <div className="aq6-video-frame">
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
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">kasih sayang</p>
                            <h2 className="aq6-h2">Amplop Digital</h2>
                            <p className="aq6-lead">
                                Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan
                                tanda kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                            </p>
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'aq6-bank-grid',
                                    bankCard: 'aq6-bank-card',
                                    bankLogo: 'aq6-bank-logo',
                                    bankType: 'aq6-bank-type',
                                    bankNumber: 'aq6-bank-number',
                                    bankName: 'aq6-bank-name',
                                    copyBankBtn: 'aq6-btn-copy-bank',
                                    ewalletGrid: 'aq6-ewallet-grid',
                                    ewalletCard: 'aq6-ewallet-card',
                                    ewalletName: 'aq6-ewallet-name',
                                    ewalletPhone: 'aq6-ewallet-phone',
                                    copyEwalletBtn: 'aq6-btn-copy-ewallet',
                                    ewalletTitle: 'aq6-ewallet-title',
                                }}
                            />
                        </section>
                    )}

                    {/* ── RSVP ──────────────────────────────────────────────────────── */}
                    {isEnabled('rsvp') && (
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">RSVP &amp; doa</p>
                            <h2 className="aq6-h2">Titip doa untuk {invitation.babyName}</h2>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'aq6-rsvp-form',
                                    label: 'aq6-label',
                                    input: 'aq6-input',
                                    select: 'aq6-select',
                                    textarea: 'aq6-textarea',
                                    radioGroup: 'aq6-seg',
                                    radioLabel: 'aq6-seg-label',
                                    errorText: 'aq6-err',
                                    submitBtn: 'aq6-send',
                                    successBox: 'aq6-rsvp-success',
                                }}
                            />
                        </section>
                    )}

                    {/* ── WISHES ────────────────────────────────────────────────────── */}
                    {isEnabled('wishes') && (
                        <section className="aq6-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-hand">ucapan &amp; doa</p>
                            <h2 className="aq6-h2">Ucapan untuk {invitation.babyName}</h2>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'aq6-wishes-layout',
                                    formBox: 'aq6-wishes-form',
                                    formTitle: 'aq6-wishes-form-title',
                                    nameInput: 'aq6-wish-input',
                                    messageInput: 'aq6-wish-input',
                                    submitBtn: 'aq6-wish-btn',
                                    wishCard: 'aq6-wish-card',
                                    wishAvatar: 'aq6-wish-avatar',
                                    wishName: 'aq6-wish-name',
                                    wishDate: 'aq6-wish-date',
                                    wishMessage: 'aq6-wish-message',
                                    loadMoreBtn: 'aq6-btn-more',
                                }}
                            />
                        </section>
                    )}

                    {/* ── CLOSING ───────────────────────────────────────────────────── */}
                    {isEnabled('footer') && (
                        <section className="aq6-card aq6-closing-card aq6-anim-up">
                            <svg className="aq6-cardears" aria-hidden="true">
                                <use href="#aq6-cardears-icon" />
                            </svg>
                            <p className="aq6-lead" style={{ marginTop: 0 }}>
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq6-closing-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <div className="aq6-carrots" aria-hidden="true">
                                <svg>
                                    <use href="#aq6-carrot-icon" />
                                </svg>
                            </div>
                            <p className="aq6-hand" style={{ marginTop: '14px' }}>
                                kami yang berbahagia
                            </p>
                            {parentsLine && <p className="aq6-family">Kel. {parentsLine}</p>}
                            <p className="aq6-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--aq6-carrot)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq6-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq6-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
