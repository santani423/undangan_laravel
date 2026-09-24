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
import './aqiqah-theme-09.css';

interface AqiqahTheme09Props {
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
    monthNum: string;
    month: string;
    yearShort: string;
    year: string;
}

function formatDateParts(dateStr: string): DateParts | null {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const year = String(d.getFullYear());
    return {
        day: String(d.getDate()).padStart(2, '0'),
        weekday: d.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase(),
        monthNum: String(d.getMonth() + 1).padStart(2, '0'),
        month: d.toLocaleDateString('id-ID', { month: 'long' }).toUpperCase(),
        yearShort: year.slice(-2),
        year,
    };
}

export default function AqiqahTheme09({ invitation, visitor, greeting }: AqiqahTheme09Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq9-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq9-anim-up').forEach((el) => observer.observe(el));
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
    const babyInitial = invitation.babyName?.charAt(0) || '🌙';
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

    const nameParts = (invitation.babyName || '').trim().split(' ');
    const firstName = nameParts[0] ?? '';
    const restName = nameParts.slice(1).join(' ');

    const primaryEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const primaryTimeStr = primaryEvent?.time
        ? primaryEvent.timeEnd
            ? `${primaryEvent.time} – ${primaryEvent.timeEnd} WIB`
            : `${primaryEvent.time} WIB`
        : '';

    const copyAddress = (address: string) => {
        if (!address) return;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard
                .writeText(address)
                .then(() => showToast('Alamat disalin.'))
                .catch(() => showToast('Gagal menyalin alamat.'));
        } else {
            showToast('Gagal menyalin alamat.');
        }
    };

    return (
        <div className="aq9-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap');
            `}</style>

            {/* Reusable SVG symbols */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <symbol id="aq9-puff" viewBox="0 0 120 60">
                    <path d="M20 58a18 18 0 0 1 2-36 22 22 0 0 1 40-10 18 18 0 0 1 30 8 16 16 0 0 1 8 38Z" fill="#fff" />
                </symbol>
                <symbol id="aq9-sparkle" viewBox="0 0 24 24">
                    <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="#ffd466" />
                </symbol>
                <symbol id="aq9-balloon" viewBox="0 0 60 90">
                    <path d="M30 2C14 2 4 14 4 28c0 16 16 28 20 36h12c4-8 20-20 20-36C56 14 46 2 30 2z" fill="#f497b6" />
                    <path d="M30 2c-7 0-12 12-12 26 0 16 6 28 8 36h8c2-8 8-20 8-36C42 14 37 2 30 2z" fill="#ffd466" />
                    <path d="M30 2c-2 0-3 12-3 26 0 16 1 28 2 36h2c1-8 2-20 2-36C33 14 32 2 30 2z" fill="#fff" />
                    <path d="M24 64l2 12M36 64l-2 12" stroke="#6f6a98" strokeWidth="1.5" />
                    <rect x="23" y="76" width="14" height="11" rx="3" fill="#b98a5a" />
                </symbol>
                <symbol id="aq9-sleepy" viewBox="0 0 90 70">
                    <path d="M44 6a30 30 0 1 0 30 44A25 25 0 0 1 44 6z" fill="#ffd466" />
                    <path d="M30 34q4 4 8 0" stroke="#3d3868" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <circle cx="26" cy="42" r="3.5" fill="#f497b6" opacity=".7" />
                    <text className="aq9-z" x="62" y="20" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="14" fill="#6f6a98">
                        z
                    </text>
                    <text
                        className="aq9-z aq9-z-b"
                        x="72"
                        y="10"
                        fontFamily="Fredoka, sans-serif"
                        fontWeight="700"
                        fontSize="10"
                        fill="#6f6a98"
                    >
                        z
                    </text>
                </symbol>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq9-overlay ${opened ? 'aq9-hide' : ''}`}>
                    <div className="aq9-overlay-decor" aria-hidden="true">
                        <svg className="aq9-overlay-puff aq9-overlay-puff-1 aq9-drift-a" aria-hidden="true">
                            <use href="#aq9-puff" />
                        </svg>
                        <svg className="aq9-overlay-puff aq9-overlay-puff-2 aq9-drift-b" aria-hidden="true">
                            <use href="#aq9-puff" />
                        </svg>
                        <span className="aq9-overlay-star aq9-overlay-star-1">✦</span>
                        <span className="aq9-overlay-star aq9-overlay-star-2">✧</span>
                    </div>
                    <div className="aq9-overlay-frame">
                        <svg className="aq9-overlay-sleepy" viewBox="0 0 90 70" aria-hidden="true">
                            <use href="#aq9-sleepy" />
                        </svg>
                        <p className="aq9-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq9-overlay-label">Tasyakuran Aqiqah</p>
                        <div className="aq9-overlay-divider" />
                        <div className="aq9-overlay-name">{invitation.babyName}</div>
                        {babyGender && (
                            <p className="aq9-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq9-overlay-divider" />
                        <p className="aq9-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq9-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq9-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq9-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq9-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq9-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '18px', border: '3px solid rgba(244,151,182,0.4)' }}
                                />
                                <p className="aq9-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq9-btn-open" onClick={openInvitation}>
                            ✦ {greeting?.buttonText ?? 'Buka Undangan'} ✦
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq9-main ${opened ? 'aq9-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq9-hero" id="top">
                    <svg className="aq9-drift aq9-drift-1" aria-hidden="true">
                        <use href="#aq9-puff" />
                    </svg>
                    <svg className="aq9-drift aq9-drift-2" aria-hidden="true">
                        <use href="#aq9-puff" />
                    </svg>
                    <svg className="aq9-drift aq9-drift-3" aria-hidden="true">
                        <use href="#aq9-puff" />
                    </svg>
                    <svg className="aq9-balloon aq9-balloon-l aq9-float" aria-hidden="true">
                        <use href="#aq9-balloon" />
                    </svg>
                    <svg className="aq9-balloon aq9-balloon-r aq9-float aq9-float-b" aria-hidden="true">
                        <use href="#aq9-balloon" />
                    </svg>

                    <div className="aq9-hero-inner aq9-anim-up">
                        <svg className="aq9-sleepy" viewBox="0 0 90 70" role="img" aria-label="Bulan sabit tertidur">
                            <use href="#aq9-sleepy" />
                        </svg>
                        <p className="aq9-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq9-tag">Tasyakuran Aqiqah</p>

                        <div className="aq9-photo">
                            <div className="aq9-photo-ring" />
                            {babyPhoto ? (
                                <img src={babyPhoto} alt={invitation.babyName} />
                            ) : (
                                <div className="aq9-photo-fallback">{babyInitial}</div>
                            )}
                            <svg className="aq9-photo-base" viewBox="0 0 300 80" aria-hidden="true">
                                <path d="M30 78a26 26 0 0 1 6-50 34 34 0 0 1 58-14 30 30 0 0 1 52 2 36 36 0 0 1 62 6 28 28 0 0 1 50 8 24 24 0 0 1 12 48Z" fill="#fff" />
                            </svg>
                            <svg className="aq9-twinkle aq9-tw" style={{ top: '-6px', right: '4px' }} viewBox="0 0 24 24" aria-hidden="true">
                                <use href="#aq9-sparkle" />
                            </svg>
                            <svg
                                className="aq9-twinkle aq9-tw aq9-tw-b"
                                style={{ top: '30%', left: '-14px', width: '18px' }}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <use href="#aq9-sparkle" />
                            </svg>
                        </div>

                        <p className="aq9-pre">Bismillah, kami mengundang Anda merayakan syukur untuk</p>
                        <h1 className="aq9-hero-name">
                            {firstName} {restName && <span>{restName}</span>}
                        </h1>
                        {nasabLine && <p className="aq9-bin">{nasabLine}</p>}
                        {babyGender && (
                            <div className="aq9-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq9-hero-birth">Lahir pada {invitation.birthDateFormatted}</p>}

                        <div className="aq9-pills">
                            {invitation.mainDateFormatted && <span>{invitation.mainDateFormatted}</span>}
                            {primaryTimeStr && <span>{primaryTimeStr}</span>}
                        </div>

                        <div className="aq9-guest">
                            <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                            <strong>{coverGuestName || 'Tamu Undangan'}</strong>
                        </div>

                        <a className="aq9-cta" href="#salam">
                            Lihat Undangan
                            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                                <path
                                    d="M8 3v10M3 8l5 5 5-5"
                                    stroke="#fff"
                                    strokeWidth="2.4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </a>
                    </div>
                </header>

                <main className="aq9-col">
                    {/* ── SALAM / OPENING QUOTE ────────────────────────────────────────── */}
                    <section className="aq9-cloud aq9-anim-up" id="salam">
                        <p className="aq9-tag">Assalamu’alaikum</p>
                        <p className="aq9-arabic" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq9-quote">
                            “Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama.”
                        </blockquote>
                        <p className="aq9-src">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <div className="aq9-dots" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                        </div>
                        <p className="aq9-lead">
                            {invitation.openingMessage ||
                                'Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan Tasyakuran Aqiqah buah hati kami.'}
                        </p>
                    </section>

                    {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                    {isEnabled('couple_profile') && (
                        <section className="aq9-cloud aq9-anim-up" id="anak">
                            <p className="aq9-tag">Si Kecil</p>
                            <h2 className="aq9-title">Mimpi kecil kami jadi nyata</h2>
                            <div className="aq9-kid">
                                <div className="aq9-kid-photo">
                                    {babyPhoto ? (
                                        <img src={babyPhoto} alt={invitation.babyName} />
                                    ) : (
                                        <div className="aq9-kid-fallback">{babyInitial}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="aq9-kid-name">{invitation.babyName}</p>
                                    {nasabLine && <p className="aq9-kid-bin">{nasabLine}</p>}
                                </div>
                            </div>
                            {parentsLine && (
                                <div className="aq9-parents">
                                    <p className="aq9-parents-cap">{parentsLabel}</p>
                                    <p className="aq9-parents-who">{parentsLine}</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ── EVENTS + COUNTDOWN ───────────────────────────────────────────── */}
                    {isEnabled('event_detail') && invitation.events.length > 0 && (
                        <section id="acara">
                            <p className="aq9-tag aq9-tag-center">Waktu &amp; Tempat</p>
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Insya Allah diselenggarakan pada</h2>
                            {invitation.events.map((ev, i) => {
                                const parts = formatDateParts(ev.date);
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                const fullAddress = [ev.locationName, ev.location].filter(Boolean).join(', ');
                                const isPrimary = ev === primaryEvent;
                                return (
                                    <div key={i} className="aq9-cloud aq9-anim-up">
                                        <h3 className="aq9-event-name">{ev.name}</h3>
                                        {parts && (
                                            <div className="aq9-date-grid">
                                                <div className="aq9-date-box aq9-date-box-a">
                                                    <b>{parts.day}</b>
                                                    <span>{parts.weekday}</span>
                                                </div>
                                                <div className="aq9-date-box aq9-date-box-b">
                                                    <b>{parts.monthNum}</b>
                                                    <span>{parts.month}</span>
                                                </div>
                                                <div className="aq9-date-box aq9-date-box-c">
                                                    <b>{parts.yearShort}</b>
                                                    <span>{parts.year}</span>
                                                </div>
                                            </div>
                                        )}
                                        {(timeStr || ev.locationName || ev.location) && (
                                            <div className="aq9-place">
                                                {timeStr && <p className="aq9-time">Pukul {timeStr}</p>}
                                                {ev.locationName && <p className="aq9-addr">{ev.locationName}</p>}
                                                {ev.location && <p className="aq9-addr-sub">{ev.location}</p>}
                                            </div>
                                        )}
                                        <div className="aq9-actions">
                                            {mapsUrl && (
                                                <a className="aq9-btn aq9-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                    Buka Peta
                                                </a>
                                            )}
                                            {fullAddress && (
                                                <button className="aq9-btn" type="button" onClick={() => copyAddress(fullAddress)}>
                                                    Salin Alamat
                                                </button>
                                            )}
                                            {isEnabled('add_to_calendar') && (
                                                <button className="aq9-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                    Simpan Tanggal
                                                </button>
                                            )}
                                        </div>
                                        {isPrimary && isEnabled('countdown') && (
                                            <Countdown
                                                targetDate={invitation.countdownDate}
                                                className="aq9-countdown"
                                                boxClassName="aq9-countdown-box"
                                                numClassName="aq9-countdown-num"
                                                labelClassName="aq9-countdown-label"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </section>
                    )}

                    {/* ── LOCATION ──────────────────────────────────────────────────── */}
                    {isEnabled('location') &&
                        invitation.events.length > 0 &&
                        (() => {
                            const ev = primaryEvent;
                            const mapsUrl =
                                ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                            if (!ev.mapsEmbed && !mapsUrl) return null;
                            return (
                                <section className="aq9-section">
                                    <h2 className="aq9-title aq9-title-center aq9-anim-up">Lokasi Acara</h2>
                                    <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                        <i />
                                        <i />
                                        <i />
                                    </div>
                                    {ev.locationName && (
                                        <p className="aq9-location-sub aq9-anim-up">
                                            {ev.name} · {ev.locationName}
                                        </p>
                                    )}
                                    <div className="aq9-map-container aq9-anim-up">
                                        {ev.mapsEmbed && (
                                            <div className="aq9-map-wrapper">
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
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq9-btn-maps">
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
                        <section className="aq9-section aq9-gallery-bg">
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Galeri Foto</h2>
                            <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'aq9-gallery-grid',
                                    item: 'aq9-gallery-item',
                                    thumb: 'aq9-gallery-thumb',
                                    overlay: 'aq9-gallery-overlay',
                                    filterBar: 'aq9-gallery-filter-bar',
                                    filterBtn: 'aq9-filter-btn',
                                    filterBtnActive: 'aq9-filter-btn aq9-filter-btn-active',
                                }}
                            />
                        </section>
                    )}

                    {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                    {isEnabled('video') && babyVideoEmbedUrl && (
                        <section className="aq9-section">
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Video Kenangan</h2>
                            <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <div className="aq9-video-frame aq9-anim-up">
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
                        <section className="aq9-section aq9-gift-bg">
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Amplop Digital</h2>
                            <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <p className="aq9-gift-subtitle aq9-anim-up">
                                Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan
                                tanda kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                            </p>
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'aq9-bank-grid',
                                    bankCard: 'aq9-bank-card',
                                    bankLogo: 'aq9-bank-logo',
                                    bankType: 'aq9-bank-type',
                                    bankNumber: 'aq9-bank-number',
                                    bankName: 'aq9-bank-name',
                                    copyBankBtn: 'aq9-btn-copy-bank',
                                    ewalletGrid: 'aq9-ewallet-grid',
                                    ewalletCard: 'aq9-ewallet-card',
                                    ewalletName: 'aq9-ewallet-name',
                                    ewalletPhone: 'aq9-ewallet-phone',
                                    copyEwalletBtn: 'aq9-btn-copy-ewallet',
                                    ewalletTitle: 'aq9-ewallet-title',
                                }}
                            />
                        </section>
                    )}

                    {/* ── RSVP ──────────────────────────────────────────────────────── */}
                    {isEnabled('rsvp') && (
                        <section className="aq9-section" id="rsvp">
                            <p className="aq9-tag aq9-tag-center">RSVP &amp; Doa</p>
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Titip doa untuk si kecil</h2>
                            <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'aq9-rsvp-form',
                                    label: 'aq9-rsvp-label',
                                    input: 'aq9-rsvp-input',
                                    select: 'aq9-rsvp-select',
                                    textarea: 'aq9-rsvp-textarea',
                                    radioGroup: 'aq9-rsvp-radio-group',
                                    radioLabel: 'aq9-rsvp-radio-label',
                                    errorText: 'aq9-rsvp-error',
                                    submitBtn: 'aq9-rsvp-submit',
                                    successBox: 'aq9-rsvp-success',
                                }}
                            />
                        </section>
                    )}

                    {/* ── WISHES ────────────────────────────────────────────────────── */}
                    {isEnabled('wishes') && (
                        <section className="aq9-section aq9-wishes-bg">
                            <h2 className="aq9-title aq9-title-center aq9-anim-up">Ucapan &amp; Doa</h2>
                            <div className="aq9-dots aq9-anim-up" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'aq9-wishes-layout',
                                    formBox: 'aq9-wishes-form',
                                    formTitle: 'aq9-wishes-form-title',
                                    nameInput: 'aq9-wish-input',
                                    messageInput: 'aq9-wish-input',
                                    submitBtn: 'aq9-wish-btn',
                                    wishCard: 'aq9-wish-card',
                                    wishAvatar: 'aq9-wish-avatar',
                                    wishName: 'aq9-wish-name',
                                    wishDate: 'aq9-wish-date',
                                    wishMessage: 'aq9-wish-message',
                                    loadMoreBtn: 'aq9-btn-more',
                                }}
                            />
                        </section>
                    )}

                    {/* ── CLOSING ───────────────────────────────────────────────────── */}
                    {isEnabled('footer') && (
                        <section className="aq9-cloud aq9-anim-up">
                            <p className="aq9-lead" style={{ marginTop: 0 }}>
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq9-closing-salam">Wassalamu’alaikum Warahmatullahi Wabarakatuh</p>
                            <div className="aq9-dots" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </div>
                            <p className="aq9-closing-from">Kami yang berbahagia</p>
                            {parentsLine && <p className="aq9-family">Kel. {parentsLine}</p>}
                            <p className="aq9-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--aq9-pink)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq9-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq9-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
