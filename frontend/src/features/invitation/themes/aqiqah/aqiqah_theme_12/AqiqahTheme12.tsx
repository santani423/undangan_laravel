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
import './aqiqah-theme-12.css';

interface AqiqahTheme12Props {
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
    dotted: string;
}

function formatDateParts(dateStr: string): DateParts | null {
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const weekday = d.toLocaleDateString('id-ID', { weekday: 'long' });
    return {
        day,
        weekday,
        month: d.toLocaleDateString('id-ID', { month: 'long' }),
        year: String(d.getFullYear()),
        dotted: `${weekday} · ${day} · ${month} · ${d.getFullYear()}`,
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

/** Twinkling star field drawn on a canvas that fills its parent. */
function StarSky({ paused = false }: { paused?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        let stars: Star[] = [];
        let frame = 0;

        const size = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const count = Math.round((rect.width * rect.height) / 5000);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: (Math.random() * 1.2 + 0.3) * dpr,
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 1.2,
            }));
        };

        const draw = (t: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                const alpha = still ? 0.7 : 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase + (t / 1000) * s.speed));
                ctx.fillStyle = `rgba(244,236,214,${alpha.toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (!still && !paused) frame = requestAnimationFrame(draw);
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

    return <canvas ref={canvasRef} className="aq12-sky" aria-hidden="true" />;
}

function Moon({ className = '' }: { className?: string }) {
    return (
        <svg className={`aq12-moon ${className}`} viewBox="0 0 44 44" aria-hidden="true">
            <path d="M28 4a18 18 0 1 0 12 28A15 15 0 0 1 28 4z" fill="#d2ad66" />
            <path d="M36 8l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="#f4f1e8" />
        </svg>
    );
}

function ArrowDown() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function AqiqahTheme12({ invitation, visitor, greeting }: AqiqahTheme12Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq12-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq12-anim-up').forEach((el) => observer.observe(el));
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
            .then(() => showToast('Alamat disalin'))
            .catch(() => showToast('Gagal menyalin alamat'));
    };

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '☾';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    const nasabLine = invitation.fatherName ? `${nasabWord(babyGender)} ${invitation.fatherName}` : '';

    const word = genderWord(babyGender);
    const parentsLabel = word ? `${word} dari` : 'Buah hati dari';

    const primaryEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const primaryParts = primaryEvent ? formatDateParts(primaryEvent.date) : null;

    const showProfile = isEnabled('couple_profile');
    const showEvents = isEnabled('event_detail') && invitation.events.length > 0;
    const showCountdown = isEnabled('countdown') && !!invitation.countdownDate;
    const showRsvp = isEnabled('rsvp');
    const showWishes = isEnabled('wishes');

    const navLinks = [
        { href: '#salam', label: 'Salam', show: true },
        { href: '#anak', label: 'Si Kecil', show: showProfile },
        { href: '#acara', label: 'Acara', show: showEvents || showCountdown },
        { href: '#rsvp', label: 'RSVP', show: showRsvp },
        { href: '#ucapan', label: 'Ucapan', show: showWishes },
    ].filter((link) => link.show);

    const archPhoto = (className: string, alt: string) => (
        <div className={`aq12-arch ${className}`}>
            {babyPhoto ? <img src={babyPhoto} alt={alt} /> : <div className="aq12-arch-initial">{babyInitial}</div>}
        </div>
    );

    return (
        <div className="aq12-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq12-overlay ${opened ? 'aq12-hide' : ''}`}>
                    <StarSky paused={opened} />
                    <div className="aq12-overlay-inner">
                        <Moon />
                        <p className="aq12-eyebrow">Walimatul Aqiqah</p>
                        {archPhoto('aq12-arch-sm', `Foto ${invitation.babyName}`)}
                        <h1 className="aq12-overlay-name">{invitation.babyName}</h1>
                        {babyGender && (
                            <p className="aq12-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        {invitation.mainDateFormatted && <p className="aq12-date">{invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <div className="aq12-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                                {guestName && greeting?.guestLabel && <small>{greeting.guestLabel}</small>}
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq12-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq12-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(210,173,102,0.6)' }}
                                />
                                <p className="aq12-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq12-cta" onClick={openInvitation}>
                            {greeting?.buttonText ?? 'Buka Undangan'}
                            <ArrowDown />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq12-main ${opened ? 'aq12-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq12-hero" id="top">
                    <StarSky />
                    <div className="aq12-col aq12-hero-inner">
                        <Moon />
                        <p className="aq12-eyebrow">Tasyakuran Aqiqah</p>
                        {archPhoto('', `Foto ${invitation.babyName}`)}
                        <p className="aq12-kicker">Dengan penuh syukur, kami mengundang Anda di hari bahagia</p>
                        <h1 className="aq12-hero-name">{invitation.babyName}</h1>
                        {primaryParts && <p className="aq12-date">{primaryParts.dotted}</p>}
                        {!coverEnabled && greetingEnabled && coverGuestName && (
                            <div className="aq12-guest">
                                <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                <strong>{coverGuestName}</strong>
                            </div>
                        )}
                        <a className="aq12-cta" href="#salam">
                            Lihat Undangan
                            <ArrowDown />
                        </a>
                    </div>
                </header>

                {/* ── QUICK NAV ─────────────────────────────────────────────────── */}
                {navLinks.length > 1 && (
                    <nav className="aq12-nav" aria-label="Bagian undangan">
                        <ul>
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a href={link.href}>{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* ── SALAM / HADITH ───────────────────────────────────────────────── */}
                <section className="aq12-section aq12-center" id="salam">
                    <div className="aq12-col">
                        <p className="aq12-eyebrow aq12-anim-up">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                        <p className="aq12-arabic aq12-anim-up" lang="ar" dir="rtl">
                            كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                        </p>
                        <blockquote className="aq12-quote aq12-anim-up">
                            “Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi
                            nama.”
                        </blockquote>
                        <p className="aq12-src aq12-anim-up">HR. Abu Dawud, dari Samurah bin Jundub</p>
                        <div className="aq12-divider aq12-anim-up" />
                        <p className="aq12-lead aq12-anim-up">
                            {invitation.openingMessage ||
                                'Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan Tasyakuran Aqiqah buah hati kami.'}
                        </p>
                    </div>
                </section>

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {showProfile && (
                    <section className="aq12-section aq12-paper" id="anak">
                        <div className="aq12-col">
                            <p className="aq12-eyebrow aq12-anim-up">Si Kecil</p>
                            <h2 className="aq12-h2 aq12-anim-up">
                                Buah hati <em>tercinta</em> kami
                            </h2>
                            <div className="aq12-profile-grid aq12-anim-up">
                                <div className="aq12-round">
                                    {babyPhoto ? (
                                        <img src={babyPhoto} alt={`Potret ${invitation.babyName}`} />
                                    ) : (
                                        <div className="aq12-round-initial">{babyInitial}</div>
                                    )}
                                </div>
                                <div>
                                    <p className="aq12-child-name">{invitation.babyName}</p>
                                    {nasabLine && <p className="aq12-bin">{nasabLine}</p>}
                                    {invitation.birthDateFormatted && <p className="aq12-bin">Lahir {invitation.birthDateFormatted}</p>}
                                    {babyGender && (
                                        <span className="aq12-gender-badge">
                                            {genderIcon(babyGender)} {babyGender}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {(invitation.fatherName || invitation.motherName) && (
                                <div className="aq12-parents aq12-anim-up">
                                    <p className="aq12-eyebrow">{parentsLabel}</p>
                                    <p className="aq12-parents-who">
                                        {invitation.fatherName && <>Bpk. {invitation.fatherName}</>}
                                        {invitation.fatherName && invitation.motherName && <span>&amp;</span>}
                                        {invitation.motherName && <>Ibu {invitation.motherName}</>}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── EVENTS + COUNTDOWN ────────────────────────────────────────── */}
                {(showEvents || showCountdown) && (
                    <section className="aq12-section aq12-night" id="acara">
                        <div className="aq12-col aq12-col-wide">
                            <p className="aq12-eyebrow aq12-anim-up">Waktu &amp; Tempat</p>
                            <h2 className="aq12-h2 aq12-anim-up">
                                Insya Allah akan <em>diselenggarakan</em> pada
                            </h2>
                            {showEvents && (
                                <div className="aq12-events-grid">
                                    {invitation.events.map((ev, i) => {
                                        const parts = formatDateParts(ev.date);
                                        const mapsUrl =
                                            ev.locationUrl ||
                                            (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                        const timeStr = formatTime(ev);
                                        return (
                                            <div key={i} className="aq12-ticket aq12-anim-up">
                                                {ev.name && <p className="aq12-ticket-name">{ev.name}</p>}
                                                <div className="aq12-ticket-top">
                                                    {parts && (
                                                        <div className="aq12-bigdate">
                                                            <span className="aq12-bigdate-d">{parts.weekday.toUpperCase()}</span>
                                                            <span className="aq12-bigdate-n">{parts.day}</span>
                                                            <span className="aq12-bigdate-m">
                                                                {parts.month} {parts.year}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="aq12-info">
                                                        {timeStr && <p className="aq12-time">Pukul {timeStr}</p>}
                                                        {ev.locationName && <p>{ev.locationName}</p>}
                                                        {ev.location && <p className="aq12-muted">{ev.location}</p>}
                                                    </div>
                                                </div>
                                                <div className="aq12-ticket-bottom">
                                                    {mapsUrl && (
                                                        <a className="aq12-btn aq12-btn-solid" href={mapsUrl} target="_blank" rel="noreferrer">
                                                            Buka Peta
                                                        </a>
                                                    )}
                                                    {(ev.locationName || ev.location) && (
                                                        <button className="aq12-btn" type="button" onClick={() => copyAddress(ev)}>
                                                            Salin Alamat
                                                        </button>
                                                    )}
                                                    <button className="aq12-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                        Simpan Tanggal
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {showCountdown && (
                                <div className="aq12-anim-up">
                                    <Countdown
                                        targetDate={invitation.countdownDate}
                                        className="aq12-countdown"
                                        boxClassName="aq12-countdown-box"
                                        numClassName="aq12-countdown-num"
                                        labelClassName="aq12-countdown-label"
                                        doneMessage={
                                            <p className="aq12-past">Acara telah berlangsung. Terima kasih atas doa dan kehadiran Bapak/Ibu/Saudara/i.</p>
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
                            <section className="aq12-section">
                                <div className="aq12-col aq12-col-wide">
                                    <p className="aq12-eyebrow aq12-anim-up">Peta</p>
                                    <h2 className="aq12-h2 aq12-anim-up">
                                        Lokasi <em>acara</em>
                                    </h2>
                                    {ev.locationName && (
                                        <p className="aq12-location-sub aq12-anim-up">
                                            {ev.name} · {ev.locationName}
                                        </p>
                                    )}
                                    <div className="aq12-map-container aq12-anim-up">
                                        {ev.mapsEmbed && (
                                            <div className="aq12-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq12-cta aq12-cta-dark">
                                                Buka Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="aq12-section aq12-paper">
                        <div className="aq12-col aq12-col-xwide">
                            <p className="aq12-eyebrow aq12-anim-up">Momen Berharga</p>
                            <h2 className="aq12-h2 aq12-h2-gap aq12-anim-up">
                                Galeri <em>foto</em>
                            </h2>
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'aq12-gallery-grid',
                                    item: 'aq12-gallery-item',
                                    thumb: 'aq12-gallery-thumb',
                                    overlay: 'aq12-gallery-overlay',
                                    filterBar: 'aq12-gallery-filter-bar',
                                    filterBtn: 'aq12-filter-btn',
                                    filterBtnActive: 'aq12-filter-btn aq12-filter-btn-active',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq12-section aq12-night">
                        <div className="aq12-col aq12-col-wide">
                            <p className="aq12-eyebrow aq12-anim-up">Kenangan</p>
                            <h2 className="aq12-h2 aq12-h2-gap aq12-anim-up">
                                Video <em>si kecil</em>
                            </h2>
                            <div className="aq12-video-frame aq12-anim-up">
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
                    <section className="aq12-section">
                        <div className="aq12-col aq12-col-xwide">
                            <p className="aq12-eyebrow aq12-anim-up">Tanda Kasih</p>
                            <h2 className="aq12-h2 aq12-anim-up">
                                Amplop <em>digital</em>
                            </h2>
                            <p className="aq12-hint aq12-hint-gap aq12-anim-up">
                                Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                                kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                            </p>
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'aq12-bank-grid',
                                    bankCard: 'aq12-bank-card',
                                    bankLogo: 'aq12-bank-logo',
                                    bankType: 'aq12-bank-type',
                                    bankNumber: 'aq12-bank-number',
                                    bankName: 'aq12-bank-name',
                                    copyBankBtn: 'aq12-btn-copy-bank',
                                    ewalletGrid: 'aq12-ewallet-grid',
                                    ewalletCard: 'aq12-ewallet-card',
                                    ewalletName: 'aq12-ewallet-name',
                                    ewalletPhone: 'aq12-ewallet-phone',
                                    copyEwalletBtn: 'aq12-btn-copy-ewallet',
                                    ewalletTitle: 'aq12-ewallet-title',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {showRsvp && (
                    <section className="aq12-section aq12-paper" id="rsvp">
                        <div className="aq12-col">
                            <p className="aq12-eyebrow aq12-anim-up">RSVP</p>
                            <h2 className="aq12-h2 aq12-anim-up">
                                Konfirmasi <em>kehadiran</em>
                            </h2>
                            <p className="aq12-hint aq12-anim-up">Mohon isi konfirmasi kehadiran Anda di bawah ini.</p>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'aq12-rsvp-form',
                                    label: 'aq12-rsvp-label',
                                    input: 'aq12-rsvp-input',
                                    select: 'aq12-rsvp-select',
                                    textarea: 'aq12-rsvp-textarea',
                                    radioGroup: 'aq12-rsvp-radio-group',
                                    radioLabel: 'aq12-rsvp-radio-label',
                                    errorText: 'aq12-rsvp-error',
                                    submitBtn: 'aq12-rsvp-submit',
                                    successBox: 'aq12-rsvp-success',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {showWishes && (
                    <section className="aq12-section" id="ucapan">
                        <div className="aq12-col aq12-col-xwide">
                            <p className="aq12-eyebrow aq12-anim-up">Ucapan &amp; Doa</p>
                            <h2 className="aq12-h2 aq12-h2-gap aq12-anim-up">
                                Kirim <em>doa</em> untuk si kecil
                            </h2>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'aq12-wishes-layout',
                                    formBox: 'aq12-wishes-form',
                                    formTitle: 'aq12-wishes-form-title',
                                    nameInput: 'aq12-wish-input',
                                    messageInput: 'aq12-wish-input',
                                    submitBtn: 'aq12-wish-btn',
                                    wishCard: 'aq12-wish-card',
                                    wishAvatar: 'aq12-wish-avatar',
                                    wishName: 'aq12-wish-name',
                                    wishDate: 'aq12-wish-date',
                                    wishMessage: 'aq12-wish-message',
                                    loadMoreBtn: 'aq12-btn-more',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <>
                        <section className="aq12-section aq12-paper aq12-center aq12-closing">
                            <div className="aq12-col">
                                <div className="aq12-divider aq12-divider-flush aq12-anim-up" />
                                <p className="aq12-anim-up">
                                    Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                    restu.
                                </p>
                                <p className="aq12-closing-salam aq12-anim-up">Wassalamu’alaikum Warahmatullahi Wabarakatuh</p>
                                <p className="aq12-eyebrow aq12-closing-from aq12-anim-up">Kami yang berbahagia</p>
                                {(invitation.fatherName || invitation.motherName) && (
                                    <p className="aq12-family aq12-anim-up">
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
                        <footer className="aq12-footer">CREATED WITH LOVE · UNDESIA DIGITAL INVITATION</footer>
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
                    buttonStyle={{ background: '#d2ad66', border: '2px solid #15343a', color: '#15343a' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq12-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq12-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">
                    ↑
                </button>
            )}
        </div>
    );
}
