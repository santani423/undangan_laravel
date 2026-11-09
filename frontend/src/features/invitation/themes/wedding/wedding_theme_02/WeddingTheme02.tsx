import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './wedding-theme-02.css';

interface WeddingTheme02Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '🥂', '🎊', '🌸', '⭐', '🎶'];

const NAV_SECTIONS = [
    { id: 'wt2-hero', label: 'Home' },
    { id: 'wt2-couple', label: 'Couple' },
    { id: 'wt2-event', label: 'Acara' },
    { id: 'wt2-maps', label: 'Lokasi' },
    { id: 'wt2-lovestory', label: 'Love Story' },
    { id: 'wt2-gallery', label: 'Gallery' },
    { id: 'wt2-dresscode', label: 'Dress Code' },
    { id: 'wt2-wallet', label: 'Amplop Digital' },
    { id: 'wt2-rsvp', label: 'RSVP' },
    { id: 'wt2-wishes', label: 'Wishes' },
    { id: 'wt2-closing', label: 'Penutup' },
];

const HeartIcon = () => (
    <svg className="wt2-heart-ico" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
    </svg>
);

function GoldDivider() {
    return (
        <div className="wt2-gold-divider wt2-anim-up">
            <span className="line" />
            <HeartIcon />
            <span className="line" />
        </div>
    );
}

function addToCalendar(ev: WeddingInvitation['events'][0]) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '080000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '100000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.name)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

export default function WeddingTheme02({ invitation, visitor, greeting }: WeddingTheme02Props) {
    const features = invitation.features ?? {};

    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState('wt2-hero');
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wt2-visible')),
            { threshold: 0.12 },
        );
        document.querySelectorAll('.wt2-anim-up, .wt2-anim-left, .wt2-anim-right').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top + active nav dot
    useEffect(() => {
        const handler = () => {
            setShowBackTop(window.scrollY > 400);
            let current = NAV_SECTIONS[0].id;
            for (const s of NAV_SECTIONS) {
                const el = document.getElementById(s.id);
                if (el && window.scrollY >= el.offsetTop - 300) current = s.id;
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];

    return (
        <div className="wt2-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt2-overlay${opened ? ' hide' : ''}`}>
                    {heroPhoto && <div className="wt2-overlay-photo-bg" style={{ backgroundImage: `url(${heroPhoto})` }} />}
                    <svg className="wt2-cover-floral tl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="150" cy="150" r="60" stroke="#b8975a" strokeWidth="1" fill="none" />
                        <path d="M150 90 C130 70, 90 80, 80 110 C70 140, 90 160, 120 155" stroke="#b8975a" strokeWidth="1.5" fill="none" />
                        <path d="M150 90 C170 70, 210 80, 220 110 C230 140, 210 160, 180 155" stroke="#b8975a" strokeWidth="1.5" fill="none" />
                        <circle cx="150" cy="150" r="8" fill="#b8975a" opacity="0.5" />
                    </svg>
                    <svg className="wt2-cover-floral br" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="150" cy="150" r="60" stroke="#b8975a" strokeWidth="1" fill="none" />
                        <path d="M150 90 C130 70, 90 80, 80 110 C70 140, 90 160, 120 155" stroke="#b8975a" strokeWidth="1.5" fill="none" />
                        <circle cx="150" cy="150" r="8" fill="#b8975a" opacity="0.5" />
                    </svg>

                    <div className="wt2-cover-inner">
                        <p className="wt2-cover-tag">Wedding Invitation</p>
                        <div className="wt2-gold-divider" style={{ margin: '12px auto' }}>
                            <span className="line" />
                            <HeartIcon />
                            <span className="line" />
                        </div>
                        <h1 className="wt2-cover-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </h1>
                        <p className="wt2-cover-amp">— Undangan Pernikahan —</p>
                        <p className="wt2-cover-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="wt2-cover-to">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="wt2-cover-guest">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="wt2-cover-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 24px' }}>
                                <GuestQrCode data={invitation.guestQrData} size={120} style={{ borderRadius: '8px', border: '3px solid rgba(212,175,114,0.6)' }} />
                                <p style={{ color: 'rgba(212,175,114,0.6)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1.5px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="wt2-cover-btn" onClick={openInvitation}>
                            {greeting?.buttonText ?? 'Buka Undangan'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Navigation Dots ───────────────────────────────────────────────── */}
            {opened && (
                <nav className="wt2-nav-dots">
                    {NAV_SECTIONS.map((s) => (
                        <a
                            key={s.id}
                            className={`wt2-nav-dot${activeSection === s.id ? ' active' : ''}`}
                            href={`#${s.id}`}
                            title={s.label}
                        />
                    ))}
                </nav>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={opened ? 'wt2-visible' : ''}>
                {/* HERO */}
                <section id="wt2-hero" className="wt2-hero">
                    <div className="wt2-hero-bg-pattern" />
                    <svg className="wt2-hero-floral-tl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 290 Q60 200, 150 160 Q200 80, 280 10" stroke="#b8975a" strokeWidth="1.5" fill="none" opacity="0.8" />
                        <ellipse cx="60" cy="220" rx="25" ry="12" fill="#b8975a" opacity="0.2" transform="rotate(-45 60 220)" />
                    </svg>
                    <svg className="wt2-hero-floral-br" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 290 Q60 200, 150 160 Q200 80, 280 10" stroke="#b8975a" strokeWidth="1.5" fill="none" opacity="0.8" />
                        <ellipse cx="60" cy="220" rx="25" ry="12" fill="#b8975a" opacity="0.2" transform="rotate(-45 60 220)" />
                    </svg>

                    <div className="wt2-hero-content wt2-container">
                        <p className="wt2-hero-tag wt2-anim-up">— The Wedding Of —</p>
                        {invitation.openingQuote && <p className="wt2-hero-bismillah wt2-anim-up">{invitation.openingQuote}</p>}
                        <div
                            className="wt2-hero-photo-wrap wt2-anim-up"
                            style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : {}}
                        >
                            {!heroPhoto && `${invitation.groomInitials ?? ''} & ${invitation.brideInitials ?? ''}`}
                        </div>
                        <h1 className="wt2-hero-names wt2-anim-up">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </h1>
                        <p className="wt2-hero-amp wt2-anim-up">— Kami Mengundang Kehadiran Anda —</p>
                        <div className="wt2-hero-date-wrap wt2-anim-up">
                            <div className="wt2-hero-date-line" />
                            <div className="wt2-hero-date">{invitation.mainDateFormatted}</div>
                            <div className="wt2-hero-date-line" />
                        </div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wt2-hero-countdown wt2-anim-up"
                                boxClassName="wt2-cd-box"
                                numClassName="wt2-cd-num"
                                labelClassName="wt2-cd-label"
                            />
                        )}
                        <a href="#wt2-couple" className="wt2-btn-primary wt2-anim-up">
                            Lihat Detail Acara
                        </a>
                    </div>
                </section>

                {/* ── COUPLE ────────────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section id="wt2-couple" className="wt2-section wt2-couple">
                        <div className="wt2-container">
                            <div className="wt2-couple-header">
                                <span className="wt2-section-tag wt2-anim-up">The Couple</span>
                                <h2 className="wt2-script-title wt2-anim-up">Mempelai Bahagia</h2>
                                <GoldDivider />
                                {invitation.openingQuote && <p className="wt2-couple-quote wt2-anim-up">{invitation.openingQuote}</p>}
                            </div>

                            <div className="wt2-couple-grid">
                                {/* Groom */}
                                <div className="wt2-couple-card wt2-anim-left">
                                    <div
                                        className="wt2-couple-photo"
                                        style={groomPhoto ? { backgroundImage: `url(${groomPhoto})` } : {}}
                                    >
                                        {!groomPhoto && invitation.groomInitials}
                                    </div>
                                    <p className="wt2-couple-name">{invitation.groomNickname}</p>
                                    <p className="wt2-couple-fullname">{invitation.groomFullName}</p>
                                    {invitation.groomChildOrder && (
                                        <p className="wt2-couple-parents">
                                            {invitation.groomChildOrder} dari
                                            {invitation.groomFather && (
                                                <>
                                                    <br />
                                                    <strong>{invitation.groomFather}</strong>
                                                </>
                                            )}
                                            {invitation.groomFather && invitation.groomMother && ' & '}
                                            {invitation.groomMother && <strong>{invitation.groomMother}</strong>}
                                        </p>
                                    )}
                                    {invitation.groomBio && <p className="wt2-couple-bio">{invitation.groomBio}</p>}
                                </div>

                                {/* Divider */}
                                <div className="wt2-couple-divider-v">
                                    <span className="line" />
                                    <HeartIcon />
                                    <span className="line" />
                                </div>

                                {/* Bride */}
                                <div className="wt2-couple-card wt2-anim-right">
                                    <div
                                        className="wt2-couple-photo"
                                        style={bridePhoto ? { backgroundImage: `url(${bridePhoto})` } : {}}
                                    >
                                        {!bridePhoto && invitation.brideInitials}
                                    </div>
                                    <p className="wt2-couple-name">{invitation.brideNickname}</p>
                                    <p className="wt2-couple-fullname">{invitation.brideFullName}</p>
                                    {invitation.brideChildOrder && (
                                        <p className="wt2-couple-parents">
                                            {invitation.brideChildOrder} dari
                                            {invitation.brideFather && (
                                                <>
                                                    <br />
                                                    <strong>{invitation.brideFather}</strong>
                                                </>
                                            )}
                                            {invitation.brideFather && invitation.brideMother && ' & '}
                                            {invitation.brideMother && <strong>{invitation.brideMother}</strong>}
                                        </p>
                                    )}
                                    {invitation.brideBio && <p className="wt2-couple-bio">{invitation.brideBio}</p>}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events?.length > 0 && (
                    <section id="wt2-event" className="wt2-section wt2-events-bg">
                        <div className="wt2-container">
                            <span className="wt2-section-tag wt2-anim-up">Rangkaian Acara</span>
                            <h2 className="wt2-serif-title light wt2-anim-up">Hari Istimewa Kami</h2>
                            <GoldDivider />

                            <div className="wt2-event-cards">
                                {invitation.events.map((ev, i) => {
                                    const mapsUrl =
                                        ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                    const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB s/d selesai`) : '';
                                    return (
                                        <div key={i} className="wt2-event-card wt2-anim-up">
                                            <span className="wt2-event-card-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                            <p className="wt2-event-card-type">{ev.name}</p>
                                            <h3 className="wt2-event-card-title">{ev.name}</h3>
                                            <div className="wt2-event-detail-row">
                                                <span className="wt2-event-detail-icon">📅</span>
                                                <div className="wt2-event-detail-text">
                                                    <strong>{ev.dateFormatted}</strong>
                                                </div>
                                            </div>
                                            {timeStr && (
                                                <div className="wt2-event-detail-row">
                                                    <span className="wt2-event-detail-icon">🕐</span>
                                                    <div className="wt2-event-detail-text">{timeStr}</div>
                                                </div>
                                            )}
                                            {(ev.locationName || ev.location) && (
                                                <div className="wt2-event-detail-row">
                                                    <span className="wt2-event-detail-icon">📍</span>
                                                    <div className="wt2-event-detail-text">
                                                        {ev.locationName && <strong>{ev.locationName}</strong>}
                                                        {ev.location}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="wt2-event-card-actions">
                                                {mapsUrl && (
                                                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt2-event-card-map-btn">
                                                        📍 Lihat Peta
                                                    </a>
                                                )}
                                                <button className="wt2-event-card-map-btn" onClick={() => addToCalendar(ev)}>
                                                    📅 Kalender
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── LOCATION / MAP ────────────────────────────────────────────── */}
                {isEnabled('location') &&
                    mainEvent &&
                    (() => {
                        const mapsUrl =
                            mainEvent.locationUrl || (mainEvent.mapsLat && mainEvent.mapsLng ? `https://maps.google.com/?q=${mainEvent.mapsLat},${mainEvent.mapsLng}` : '');
                        if (!mainEvent.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section id="wt2-maps" className="wt2-maps-section">
                                <div className="wt2-container">
                                    <span className="wt2-section-tag wt2-anim-up">Lokasi Acara</span>
                                    <h2 className="wt2-serif-title wt2-anim-up">Temukan Kami Di Sini</h2>
                                    <GoldDivider />

                                    {mainEvent.mapsEmbed && (
                                        <div className="wt2-map-embed wt2-anim-up">
                                            <iframe
                                                src={mainEvent.mapsEmbed}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title={`Lokasi ${mainEvent.locationName || mainEvent.name}`}
                                            />
                                        </div>
                                    )}
                                    {(mainEvent.locationName || mainEvent.location) && (
                                        <p className="wt2-map-address wt2-anim-up">
                                            {mainEvent.locationName}
                                            {mainEvent.locationName && mainEvent.location && <br />}
                                            {mainEvent.location}
                                        </p>
                                    )}
                                    {mapsUrl && (
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }} className="wt2-anim-up">
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt2-btn-primary">
                                                🗺️ Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── LOVE STORY ────────────────────────────────────────────────── */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <section id="wt2-lovestory" className="wt2-lovestory">
                        <div className="wt2-container">
                            <div className="wt2-lovestory-header">
                                <span className="wt2-section-tag wt2-anim-up">Our Journey</span>
                                <h2 className="wt2-script-title wt2-anim-up">Love Story</h2>
                                <GoldDivider />
                                <p className="wt2-lovestory-sub wt2-anim-up">Setiap perjalanan cinta memiliki ceritanya sendiri. Inilah kisah kita.</p>
                            </div>

                            <div className="wt2-timeline">
                                {invitation.loveStory.map((item, i) => {
                                    const side = i % 2 === 0 ? 'left' : 'right';
                                    const content = (
                                        <div className={`wt2-tl-content-${side} wt2-anim-up`}>
                                            {item.photo && <div className="wt2-tl-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                            <p className="wt2-tl-year">{item.date}</p>
                                            <p className="wt2-tl-title">{item.title}</p>
                                            <p className="wt2-tl-desc">{item.desc}</p>
                                        </div>
                                    );
                                    return (
                                        <div key={i} className="wt2-timeline-item">
                                            {side === 'left' ? (
                                                <>
                                                    {content}
                                                    <div className="wt2-tl-center">
                                                        <div className="wt2-tl-dot" />
                                                    </div>
                                                    <div />
                                                </>
                                            ) : (
                                                <>
                                                    <div />
                                                    <div className="wt2-tl-center">
                                                        <div className="wt2-tl-dot" />
                                                    </div>
                                                    {content}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section id="wt2-gallery" className="wt2-gallery-bg">
                        <div className="wt2-container">
                            <div className="wt2-gallery-header">
                                <span className="wt2-section-tag wt2-anim-up">Gallery</span>
                                <h2 className="wt2-script-title wt2-anim-up">Momen Berharga</h2>
                                <GoldDivider />
                            </div>
                            <GallerySection
                                items={invitation.gallery}
                                showFilters
                                filters={[
                                    { key: 'prewedding', label: 'Prewedding' },
                                    { key: 'engagement', label: 'Engagement' },
                                ]}
                                styles={{
                                    grid: 'wt2-gallery-grid',
                                    item: 'wt2-gallery-item',
                                    thumb: 'wt2-gallery-thumb',
                                    overlay: 'wt2-gallery-overlay',
                                    filterBar: 'wt2-gallery-filter-bar',
                                    filterBtn: 'wt2-filter-btn',
                                    filterBtnActive: 'wt2-filter-btn wt2-filter-btn-active',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <section className="wt2-section">
                        <div className="wt2-container" style={{ textAlign: 'center' }}>
                            <span className="wt2-section-tag wt2-anim-up">Video</span>
                            <h2 className="wt2-serif-title wt2-anim-up">Video Mempelai</h2>
                            <GoldDivider />
                            <div className="wt2-video-frame wt2-anim-up">
                                <iframe
                                    src={coupleVideoEmbedUrl}
                                    title="Video Mempelai"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* ── DRESS CODE ────────────────────────────────────────────────── */}
                {invitation.dressCodes && invitation.dressCodes.length > 0 && (
                    <section id="wt2-dresscode" className="wt2-dresscode">
                        <div className="wt2-container">
                            <span className="wt2-section-tag wt2-anim-up">Dress Code</span>
                            <h2 className="wt2-serif-title wt2-anim-up">Kode Berpakaian Tamu</h2>
                            <GoldDivider />

                            <div className="wt2-dc-icons wt2-anim-up">
                                <div className="wt2-dc-icon-item">
                                    <div className="wt2-dc-icon-circle">👔</div>
                                    <p className="wt2-dc-icon-label">Pria</p>
                                </div>
                                <div className="wt2-dc-icon-item">
                                    <div className="wt2-dc-icon-circle">👗</div>
                                    <p className="wt2-dc-icon-label">Wanita</p>
                                </div>
                                <div className="wt2-dc-icon-item">
                                    <div className="wt2-dc-icon-circle">🎀</div>
                                    <p className="wt2-dc-icon-label">Formal</p>
                                </div>
                            </div>

                            <div className="wt2-dc-palette wt2-anim-up">
                                {invitation.dressCodes.map((dc, i) => (
                                    <div key={i} className="wt2-dc-swatch">
                                        <div className="wt2-dc-color" style={{ background: dc.hex }} />
                                        <p className="wt2-dc-name">{dc.name}</p>
                                        <p className="wt2-dc-hex">{dc.hex}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="wt2-dc-notes wt2-anim-up">
                                <ul>
                                    <li>Mohon hindari pakaian berwarna putih penuh agar tidak menyerupai pakaian pengantin</li>
                                    <li>Kami memohon tamu undangan berpakaian semi-formal hingga formal</li>
                                    <li>Sesuaikan warna pakaian dengan palet di atas bila memungkinkan</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── DIGITAL WALLET ────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section id="wt2-wallet" className="wt2-wallet">
                        <div className="wt2-container">
                            <span className="wt2-section-tag wt2-anim-up">Amplop Digital</span>
                            <h2 className="wt2-serif-title light wt2-anim-up">Hadiah &amp; Doa</h2>
                            <GoldDivider />
                            <p className="wt2-wallet-subtitle wt2-anim-up">
                                Doa restu Anda adalah hadiah terindah bagi kami. Namun bagi yang ingin memberikan hadiah, kami menyediakan pilihan berikut.
                            </p>
                            <DigitalWalletSection
                                bankAccounts={invitation.bankAccounts ?? []}
                                digitalWallets={invitation.digitalWallets ?? []}
                                onToast={showToast}
                                styles={{
                                    bankGrid: 'wt2-bank-grid',
                                    bankCard: 'wt2-bank-card',
                                    bankLogo: 'wt2-bank-logo',
                                    bankType: 'wt2-bank-type',
                                    bankNumber: 'wt2-bank-number',
                                    bankName: 'wt2-bank-name',
                                    copyBankBtn: 'wt2-btn-copy-bank',
                                    ewalletGrid: 'wt2-ewallet-grid',
                                    ewalletCard: 'wt2-ewallet-card',
                                    ewalletName: 'wt2-ewallet-name',
                                    ewalletPhone: 'wt2-ewallet-phone',
                                    copyEwalletBtn: 'wt2-btn-copy-ewallet',
                                    ewalletTitle: 'wt2-ewallet-title',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section id="wt2-rsvp" className="wt2-rsvp">
                        <div className="wt2-rsvp-inner wt2-container">
                            <span className="wt2-section-tag wt2-anim-up">Konfirmasi Kehadiran</span>
                            <h2 className="wt2-serif-title wt2-anim-up">RSVP</h2>
                            <GoldDivider />
                            {invitation.rsvpDeadline && (
                                <p className="wt2-rsvp-deadline wt2-anim-up">Mohon konfirmasi sebelum {invitation.rsvpDeadline}</p>
                            )}
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'wt2-rsvp-form wt2-anim-up',
                                    label: 'wt2-rsvp-label',
                                    input: 'wt2-rsvp-input',
                                    select: 'wt2-rsvp-select',
                                    textarea: 'wt2-rsvp-textarea',
                                    radioGroup: 'wt2-rsvp-radio-group',
                                    radioLabel: 'wt2-rsvp-radio-label',
                                    errorText: 'wt2-rsvp-error',
                                    submitBtn: 'wt2-rsvp-submit',
                                    successBox: 'wt2-rsvp-success',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section id="wt2-wishes" className="wt2-wishes">
                        <div className="wt2-container">
                            <div className="wt2-wishes-header">
                                <span className="wt2-section-tag wt2-anim-up">Ucapan &amp; Doa</span>
                                <h2 className="wt2-script-title wt2-anim-up">Pesan untuk Kami</h2>
                                <GoldDivider />
                            </div>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'wt2-wishes-layout',
                                    formBox: 'wt2-wishes-form',
                                    formTitle: 'wt2-wishes-form-title',
                                    nameInput: 'wt2-wish-input',
                                    messageInput: 'wt2-wish-input',
                                    submitBtn: 'wt2-wish-btn',
                                    wishCard: 'wt2-wish-card',
                                    wishAvatar: 'wt2-wish-avatar',
                                    wishName: 'wt2-wish-name',
                                    wishDate: 'wt2-wish-date',
                                    wishMessage: 'wt2-wish-message',
                                    loadMoreBtn: 'wt2-btn-more wt2-btn-outline',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section id="wt2-closing" className="wt2-closing">
                    <div className="wt2-container" style={{ position: 'relative', zIndex: 1 }}>
                        <p className="wt2-closing-tag wt2-anim-up">Terima Kasih</p>
                        <div className="wt2-gold-divider wt2-anim-up" style={{ justifyContent: 'center' }}>
                            <span className="line" style={{ background: 'rgba(184,151,90,.4)' }} />
                            <HeartIcon />
                            <span className="line" style={{ background: 'rgba(184,151,90,.4)' }} />
                        </div>
                        <p className="wt2-closing-quote wt2-anim-up">
                            Kami mengucapkan terima kasih yang sebesar-besarnya atas doa dan restu Anda. Kehadiran Anda adalah cahaya paling indah di
                            hari bahagia kami.
                        </p>
                        <h2 className="wt2-closing-names wt2-anim-up">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </h2>
                        <p className="wt2-closing-amp wt2-anim-up">— Bersama dalam cinta dan doa —</p>
                        <p className="wt2-closing-thanks wt2-anim-up">
                            {invitation.mainDateFormatted}
                            <br />
                            Keluarga Besar {invitation.groomFather}
                            {invitation.groomMother ? ` & ${invitation.groomMother}` : ''}
                            <br />
                            Keluarga Besar {invitation.brideFather}
                            {invitation.brideMother ? ` & ${invitation.brideMother}` : ''}
                        </p>
                    </div>
                </section>

                <footer className="wt2-footer">
                    <p>
                        Made with ❤️ for {invitation.groomNickname} &amp; {invitation.brideNickname} · Undesia Digital Invitation
                    </p>
                </footer>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--wt2-gold)', border: 'none', color: 'var(--wt2-white)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wt2-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="wt2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
