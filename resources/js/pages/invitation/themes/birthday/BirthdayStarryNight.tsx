import Countdown from '@/components/invitation/Countdown';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { BirthdayInvitation, GalleryItem } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './starry-night.css';

interface Props {
    invitation: BirthdayInvitation;
}

const ROYAL_DIVIDER_ICON = (
    <svg viewBox="0 0 24 24" className="sn-royal-divider-icon">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

function addToCalendar(ev: BirthdayInvitation['events'][0]) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '100000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '140000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Birthday ${ev.name}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
    window.open(url, '_blank');
}

function copyText(text: string, label: string, onToast: (msg: string) => void) {
    navigator.clipboard.writeText(text)
        .then(() => onToast(`✓ ${label} disalin!`))
        .catch(() => onToast(`✓ ${label} disalin!`));
}

export default function BirthdayStarryNight({ invitation }: Props) {
    const [opened, setOpened] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [galleryFilter, setGalleryFilter] = useState('all');
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const { toast, showToast, clearToast } = useToast();

    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    // Particle animation on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: 1 + Math.random() * 2,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: ['#f9a8d4', '#c4b5fd', '#fbbf24', '#bae6fd'][Math.floor(Math.random() * 4)],
            alpha: 0.3 + Math.random() * 0.5,
        }));

        let raf: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Scroll animations after open
    useEffect(() => {
        if (!opened) return;
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('sn-visible')),
            { threshold: 0.1 },
        );
        document.querySelectorAll('.sn-fade-up,.sn-fade-left,.sn-fade-right').forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [opened]);

    // Gallery
    const galleryItems: GalleryItem[] = invitation.gallery ?? [];
    const filteredGallery = galleryFilter === 'all' ? galleryItems : galleryItems.filter((g) => g.category === galleryFilter);
    const galleryCategories = Array.from(new Set(galleryItems.map((g) => g.category).filter(Boolean)));

    // Lightbox
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (lightboxIdx === null) return;
            if (e.key === 'Escape') setLightboxIdx(null);
            if (e.key === 'ArrowLeft') setLightboxIdx((i) => i !== null ? (i - 1 + filteredGallery.length) % filteredGallery.length : null);
            if (e.key === 'ArrowRight') setLightboxIdx((i) => i !== null ? (i + 1) % filteredGallery.length : null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIdx, filteredGallery.length]);

    const age = invitation.celebrantAge ?? '';
    const celebrantPhoto = invitation.celebrantPhoto;
    const mainEvent = invitation.events?.[0];

    return (
        <div className="sn-root">
            {/* Ambient particles */}
            <canvas ref={canvasRef} className="sn-particles-canvas" />

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            <div id="cover" className={`sn-cover${opened ? ' hidden' : ''}`}>
                <div className="sn-stars-bg" id="stars-bg">
                    {Array.from({ length: 80 }).map((_, i) => {
                        const sz = 1 + Math.random() * 2;
                        return (
                            <div
                                key={i}
                                className="sn-star-dot"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    width: sz,
                                    height: sz,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${1.5 + Math.random() * 2}s`,
                                }}
                            />
                        );
                    })}
                </div>
                <div className="sn-cover-content">
                    <p className="sn-cover-tag">✨ You're Invited ✨</p>
                    <p className="sn-cover-subtitle">to the magical birthday celebration of</p>
                    <div className="sn-cover-name">{invitation.celebrantNickname || invitation.celebrantName}</div>
                    {age && <p className="sn-cover-age">🎂 Turning {age} 🎂</p>}
                    {mainEvent && <p className="sn-cover-date">📅 {mainEvent.dateFormatted}</p>}
                    {invitation.guestName && (
                        <p className="sn-cover-guest">
                            Dear <span>{invitation.guestName}</span>
                        </p>
                    )}
                    <button className="sn-btn-open" onClick={() => setOpened(true)}>
                        <span>🎉 Open Invitation 🎉</span>
                    </button>
                </div>
            </div>

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <main className="sn-main" style={{ display: opened ? 'block' : 'none' }}>

                {/* HERO */}
                <section className="sn-hero sn-section">
                    <div className="sn-hero-crown">👑</div>
                    <p className="sn-hero-greeting">Celebrating the birthday of</p>
                    <h1 className="sn-hero-name">{invitation.celebrantNickname || invitation.celebrantName}</h1>
                    {age && <div className="sn-hero-age-badge">🎂 {age} Years of Magic 🎂</div>}
                    <p className="sn-hero-tagline">"Every birthday is a gift from God"</p>
                    {isEnabled('countdown') && mainEvent && (
                        <Countdown
                            targetDate={invitation.countdownDate}
                            className="sn-countdown-grid"
                            boxClassName="sn-countdown-card"
                            numClassName="sn-countdown-num"
                            labelClassName="sn-countdown-label"
                            labels={{ days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }}
                            doneMessage={
                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem' }}>🎉</div>
                                    <h3 style={{ color: 'var(--sn-gold)', fontFamily: 'Great Vibes,cursive', fontSize: '3rem' }}>Happy Birthday!</h3>
                                </div>
                            }
                        />
                    )}
                    <div className="sn-hero-scroll">↓</div>
                </section>

                {/* PROFILE */}
                <section className="sn-section sn-profile">
                    <div className="sn-container">
                        <div className="sn-text-center sn-fade-up">
                            <span className="sn-section-badge">👑 The Birthday Princess</span>
                            <h2 className="sn-section-title">About the Celebrant</h2>
                            <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                        </div>
                        <div className="sn-profile-card sn-glass-card" style={{ padding: '2rem' }}>
                            <div className="sn-text-center sn-fade-left">
                                <div className="sn-profile-photo-frame">
                                    <div
                                        className="sn-profile-photo-inner"
                                        style={
                                            celebrantPhoto
                                                ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover' }
                                                : {}
                                        }
                                    >
                                        {!celebrantPhoto && '🌸'}
                                    </div>
                                </div>
                                <div className="sn-profile-fullname" style={{ marginTop: '1rem' }}>{invitation.celebrantName}</div>
                                <div className="sn-profile-nickname">{invitation.celebrantNickname}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '.5rem', fontSize: '1.2rem' }}>
                                    🌸 ✨ 👑
                                </div>
                            </div>
                            <div className="sn-profile-details sn-fade-right">
                                {age && (
                                    <div className="sn-profile-detail-item">
                                        <div className="sn-profile-detail-icon">🎂</div>
                                        <div>
                                            <span className="sn-profile-detail-label">Age</span>
                                            <span className="sn-profile-detail-value">{age} Years Old</span>
                                        </div>
                                    </div>
                                )}
                                {invitation.parentName && (
                                    <div className="sn-profile-detail-item">
                                        <div className="sn-profile-detail-icon">👨‍👩‍👧</div>
                                        <div>
                                            <span className="sn-profile-detail-label">Parents</span>
                                            <span className="sn-profile-detail-value">{invitation.parentName}</span>
                                        </div>
                                    </div>
                                )}
                                {invitation.celebrantBio && (
                                    <div className="sn-profile-detail-item">
                                        <div className="sn-profile-detail-icon">💜</div>
                                        <div>
                                            <span className="sn-profile-detail-label">About</span>
                                            <span className="sn-profile-detail-value">{invitation.celebrantBio}</span>
                                        </div>
                                    </div>
                                )}
                                {mainEvent && (
                                    <div className="sn-profile-detail-item">
                                        <div className="sn-profile-detail-icon">📅</div>
                                        <div>
                                            <span className="sn-profile-detail-label">Party Date</span>
                                            <span className="sn-profile-detail-value">{mainEvent.dateFormatted}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* EVENTS */}
                {invitation.events.length > 0 && (
                    <section className="sn-section sn-event">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge">🎪 The Royal Event</span>
                                <h2 className="sn-section-title">Party Details</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                            </div>
                            <div className="sn-event-grid">
                                {invitation.events.map((ev, i) => {
                                    const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                    return (
                                        <div key={i} className="sn-event-card sn-glass-card sn-fade-up">
                                            <div className="sn-event-card-icon">🎉</div>
                                            <h3 className="sn-event-card-name">{ev.name}</h3>
                                            <p className="sn-event-card-date">📅 {ev.dateFormatted}</p>
                                            {ev.time && (
                                                <p className="sn-event-card-time">
                                                    ⏰ {ev.time}{ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                                </p>
                                            )}
                                            {(ev.locationName || ev.location) && (
                                                <p className="sn-event-card-location">
                                                    📍 {ev.locationName}{ev.location ? `, ${ev.location}` : ''}
                                                </p>
                                            )}
                                            <div className="sn-event-btns">
                                                {mapsUrl && (
                                                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="sn-btn-event">
                                                        🗺️ Maps
                                                    </a>
                                                )}
                                                <button className="sn-btn-event" onClick={() => addToCalendar(ev)}>
                                                    📅 Calendar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* LIFE JOURNEY TIMELINE */}
                {isEnabled('timeline') && invitation.lifeJourney?.length > 0 && (
                    <section className="sn-section sn-timeline">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge">📖 Her Story</span>
                                <h2 className="sn-section-title">Life Journey</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                                <p className="sn-section-sub">A journey of love, laughter, and precious moments</p>
                            </div>
                            <div className="sn-timeline-wrap">
                                {invitation.lifeJourney.map((item, i) => (
                                    <div key={i} className="sn-timeline-item sn-fade-up">
                                        <div className="sn-timeline-dot-col">
                                            <div className="sn-timeline-dot">✨</div>
                                        </div>
                                        <div className="sn-timeline-content-box sn-glass-card">
                                            {item.photo && (
                                                <div
                                                    className="sn-timeline-content-photo"
                                                    style={{ backgroundImage: `url(${item.photo})` }}
                                                />
                                            )}
                                            <p className="sn-timeline-content-date">{item.date}</p>
                                            <h3 className="sn-timeline-content-title">{item.title}</h3>
                                            <p className="sn-timeline-content-desc">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && galleryItems.length > 0 && (
                    <section className="sn-section sn-gallery">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge">📷 Memories</span>
                                <h2 className="sn-section-title">Photo Gallery</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                                <p className="sn-section-sub">Precious moments frozen in time</p>
                            </div>
                            {galleryCategories.length > 0 && (
                                <div className="sn-gallery-tabs">
                                    <button
                                        className={`sn-gallery-tab${galleryFilter === 'all' ? ' active' : ''}`}
                                        onClick={() => setGalleryFilter('all')}
                                    >
                                        All
                                    </button>
                                    {galleryCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`sn-gallery-tab${galleryFilter === cat ? ' active' : ''}`}
                                            onClick={() => setGalleryFilter(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="sn-gallery-grid">
                                {filteredGallery.map((item, i) => (
                                    <div
                                        key={i}
                                        className="sn-gallery-item"
                                        style={item.url ? { backgroundImage: `url(${item.url})` } : { background: '#ede9fe' }}
                                        onClick={() => setLightboxIdx(i)}
                                    >
                                        <div className="sn-gallery-item-overlay">🔍</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* LOCATION */}
                {isEnabled('location') && invitation.events.length > 0 && (() => {
                    const ev = invitation.events[0];
                    const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                    if (!ev.mapsEmbed && !mapsUrl) return null;
                    return (
                        <section className="sn-section sn-maps">
                            <div className="sn-container">
                                <div className="sn-text-center sn-fade-up">
                                    <span className="sn-section-badge" style={{ background: 'rgba(251,191,36,.15)', borderColor: 'rgba(251,191,36,.3)', color: 'var(--sn-gold)' }}>📍 Location</span>
                                    <h2 className="sn-section-title" style={{ color: 'var(--sn-gold)' }}>Find the Castle</h2>
                                    <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                                    {(ev.locationName || ev.location) && (
                                        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem' }}>
                                            {ev.locationName}{ev.location ? ` · ${ev.location}` : ''}
                                        </p>
                                    )}
                                </div>
                                {ev.mapsEmbed && (
                                    <div className="sn-map-wrap sn-fade-up">
                                        <iframe src={ev.mapsEmbed} width="100%" height="400" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Lokasi" />
                                    </div>
                                )}
                                {mapsUrl && (
                                    <div className="sn-text-center sn-fade-up" style={{ marginTop: '1rem' }}>
                                        <a href={mapsUrl} target="_blank" rel="noreferrer" className="sn-btn-maps">
                                            🗺️ Open Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="sn-section sn-rsvp">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge">✉️ RSVP</span>
                                <h2 className="sn-section-title">Will You Join Us?</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                            </div>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                onToast={showToast}
                                styles={{
                                    form: 'sn-rsvp-form sn-glass-card',
                                    label: 'sn-form-label',
                                    input: 'sn-form-input',
                                    select: 'sn-form-select',
                                    textarea: 'sn-form-textarea',
                                    radioGroup: 'sn-rsvp-radio-group',
                                    radioLabel: 'sn-rsvp-radio-label',
                                    errorText: 'sn-rsvp-error',
                                    submitBtn: 'sn-rsvp-submit',
                                    successBox: 'sn-rsvp-success sn-glass-card',
                                }}
                                labels={{
                                    attending: '🎉 Yes, I\'ll Be There!',
                                    notAttending: '😢 Regretfully Declining',
                                    maybe: '🤔 Maybe',
                                    submit: '✨ Send RSVP ✨',
                                    successTitle: '🎉 Thank you! We can\'t wait to see you!',
                                    successSub: 'See you at the party!',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="sn-section sn-wishes">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge">💌 Guest Book</span>
                                <h2 className="sn-section-title">Leave a Royal Wish</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                                <p className="sn-section-sub">Share your warmest birthday wishes</p>
                            </div>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'sn-wishes-layout',
                                    formBox: 'sn-wish-form sn-glass-card',
                                    formTitle: 'sn-wish-form-title',
                                    nameInput: 'sn-wish-input',
                                    messageInput: 'sn-wish-textarea',
                                    submitBtn: 'sn-wish-submit',
                                    wishCard: 'sn-wish-card',
                                    wishAvatar: 'sn-wish-avatar',
                                    wishName: 'sn-wish-name',
                                    wishDate: 'sn-wish-date',
                                    wishMessage: 'sn-wish-message',
                                    loadMoreBtn: 'sn-wish-load-more',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* DIGITAL WALLET / GIFT */}
                {isEnabled('digitalWallet') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="sn-section sn-gift">
                        <div className="sn-container">
                            <div className="sn-text-center sn-fade-up">
                                <span className="sn-section-badge" style={{ background: 'rgba(251,191,36,.15)', borderColor: 'rgba(251,191,36,.3)', color: 'var(--sn-gold)' }}>🎁 Royal Gifts</span>
                                <h2 className="sn-section-title" style={{ color: 'var(--sn-gold)' }}>Send a Gift</h2>
                                <div className="sn-royal-divider">{ROYAL_DIVIDER_ICON}</div>
                                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem' }}>Your presence is the greatest gift, but if you'd like to share some love</p>
                            </div>
                            <div className="sn-gift-grid sn-fade-up">
                                {invitation.bankAccounts?.map((b, i) => (
                                    <div key={i} className="sn-gift-card">
                                        <div className="sn-gift-card-logo">🏦</div>
                                        <div className="sn-gift-card-name">{b.bankName}</div>
                                        <div className="sn-gift-card-number">{b.accountNumber}</div>
                                        <div className="sn-gift-card-owner">a.n. {b.accountName}</div>
                                        <button className="sn-gift-copy-btn" onClick={() => copyText(b.accountNumber, `No. Rekening ${b.bankName}`, showToast)}>
                                            📋 Copy
                                        </button>
                                    </div>
                                ))}
                                {invitation.digitalWallets?.map((w, i) => (
                                    <div key={i} className="sn-gift-card">
                                        {w.logoUrl ? (
                                            <img src={w.logoUrl} alt={w.label} style={{ height: '36px', objectFit: 'contain', marginBottom: '8px' }} />
                                        ) : (
                                            <div className="sn-gift-card-logo">💳</div>
                                        )}
                                        <div className="sn-gift-card-name">{w.label || w.provider}</div>
                                        <div className="sn-gift-card-number">{w.accountNumber}</div>
                                        <div className="sn-gift-card-owner">{w.accountName}</div>
                                        <button className="sn-gift-copy-btn" onClick={() => copyText(w.accountNumber, w.label || w.provider, showToast)}>
                                            📋 Copy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* FOOTER */}
                <footer className="sn-footer">
                    <span className="sn-footer-name">{invitation.celebrantNickname || invitation.celebrantName}</span>
                    {age && <p className="sn-footer-age">{age}th Birthday Celebration</p>}
                    {mainEvent && <p className="sn-footer-date">{mainEvent.dateFormatted}</p>}
                    <div className="sn-footer-hearts">💜 🌸 👑 🌸 💜</div>
                    <p className="sn-footer-credit">Created with love ✦ Undesia Digital Invitation ✨</p>
                </footer>

            </main>

            {/* Music */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    buttonClassName="sn-music-btn"
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="sn-toast" />

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <div
                    onClick={() => setLightboxIdx(null)}
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
                >
                    <button onClick={() => setLightboxIdx(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    {filteredGallery[lightboxIdx]?.url ? (
                        <img src={filteredGallery[lightboxIdx].url} alt="Gallery" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()} />
                    ) : (
                        <div style={{ width: '400px', height: '300px', background: '#ede9fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>📷</div>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i - 1 + filteredGallery.length) % filteredGallery.length : null); }} style={{ padding: '.75rem 2rem', borderRadius: '50px', background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer' }}>← Prev</button>
                        <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i !== null ? (i + 1) % filteredGallery.length : null); }} style={{ padding: '.75rem 2rem', borderRadius: '50px', background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.3)', cursor: 'pointer' }}>Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}
