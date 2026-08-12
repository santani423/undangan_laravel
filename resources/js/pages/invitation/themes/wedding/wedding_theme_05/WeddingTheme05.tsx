import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './wedding-theme-05.css';

const bismillahGold = new URL('./assets/bismillah-gold.png', import.meta.url).href;

interface WeddingTheme05Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['💍', '🎂', '🎊', '🌿', '⭐', '🎶'];

function addToCalendar(ev: InvitationEvent) {
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

/** Gold botanical corner sprig — replaces the mismatched PPT-extracted icon PNGs
 * (which turned out to be a gift box / speaker / text-label graphic, not leaves)
 * with a lightweight inline SVG that matches the "gold botanical corner" motif
 * described in the design brief. */
function LeafOrnament() {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M6,6 C24,10 34,24 32,42 C30,56 40,66 56,64"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <ellipse cx="16" cy="14" rx="7" ry="3.2" transform="rotate(35 16 14)" fill="currentColor" opacity="0.85" />
            <ellipse cx="30" cy="28" rx="7.5" ry="3.2" transform="rotate(70 30 28)" fill="currentColor" opacity="0.75" />
            <ellipse cx="31" cy="46" rx="7" ry="3" transform="rotate(115 31 46)" fill="currentColor" opacity="0.65" />
            <ellipse cx="46" cy="62" rx="7" ry="3" transform="rotate(155 46 62)" fill="currentColor" opacity="0.55" />
        </svg>
    );
}

const LEAF_GLYPHS = ['❧', '✦', '❦', '✿'];

export default function WeddingTheme05({ invitation, visitor, greeting }: WeddingTheme05Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');

    const [envelopeOpening, setEnvelopeOpening] = useState(!coverEnabled);
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    const openInvitation = () => {
        if (envelopeOpening) return;
        setEnvelopeOpening(true);
        window.setTimeout(() => setOpened(true), 1400);
    };

    // Scroll-triggered reveal animations (replaces script.js's getBoundingClientRect polling)
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wt5-visible-anim')),
            { threshold: 0.12 },
        );
        document.querySelectorAll('.wt5-anim').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 500);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    const heroBgStyle = heroPhoto ? ({ ['--wt5-hero-bg' as string]: `url(${heroPhoto})` } as CSSProperties) : undefined;

    // Deterministic (SSR-safe) falling particle positions
    const particles = Array.from({ length: 10 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: (i * 1.1) % 9,
        duration: 9 + ((i * 3) % 8),
        glyph: LEAF_GLYPHS[i % LEAF_GLYPHS.length],
    }));

    return (
        <div className="wt5-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Parisienne&family=Montserrat:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* ── 3D Envelope Preloader ─────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt5-envelope-overlay${opened ? ' wt5-hidden' : ''}`}>
                    {particles.map((p, i) => (
                        <span
                            key={i}
                            className="wt5-leaf-particle"
                            style={{
                                left: `${p.left}%`,
                                animationDelay: `${p.delay}s`,
                                animationDuration: `${p.duration}s`,
                            }}
                        >
                            {p.glyph}
                        </span>
                    ))}
                    <div
                        className={`wt5-envelope-wrapper${envelopeOpening ? ' wt5-open' : ''}`}
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('.wt5-btn-open, .wt5-wax-seal')) return;
                            openInvitation();
                        }}
                    >
                        <div className="wt5-envelope">
                            <div className="wt5-envelope-flap wt5-top" />
                            <div className="wt5-envelope-flap wt5-left" />
                            <div className="wt5-envelope-flap wt5-right" />
                            <div className="wt5-envelope-flap wt5-bottom" />

                            <div className="wt5-wax-seal" onClick={openInvitation}>
                                ♥
                            </div>

                            <div className="wt5-envelope-card">
                                <div>
                                    <h3>Undangan Pernikahan</h3>
                                    <div className="wt5-envelope-names">
                                        {invitation.groomNickname || invitation.groomFullName} &amp;{' '}
                                        {invitation.brideNickname || invitation.brideFullName}
                                    </div>
                                    <div className="wt5-envelope-to-text">{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i:'}</div>
                                    {greetingEnabled && coverGuestName && <div className="wt5-envelope-guest-name">{coverGuestName}</div>}
                                    {greetingEnabled && greeting?.message && <p className="wt5-envelope-message">{greeting.message}</p>}
                                    {invitation.guestQrData && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
                                            <GuestQrCode
                                                data={invitation.guestQrData}
                                                size={92}
                                                style={{ borderRadius: '6px', border: '2px solid rgba(197,160,89,0.5)' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <button className="wt5-btn-open" type="button" onClick={openInvitation}>
                                        {greeting?.buttonText ?? 'Buka Undangan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main content ──────────────────────────────────────────────── */}
            <div ref={mainRef} className={`wt5-main${opened ? ' wt5-visible' : ''}`}>
                <div className="wt5-page-shell">
                    {/* 1. Hero */}
                    <section className="wt5-section wt5-hero-section" style={heroBgStyle}>
                        <div className="wt5-gold-card-frame">
                            <div className="wt5-leaf-decor wt5-tl">
                                <LeafOrnament />
                            </div>
                            <div className="wt5-leaf-decor wt5-tr">
                                <LeafOrnament />
                            </div>
                            <div className="wt5-leaf-decor wt5-bl">
                                <LeafOrnament />
                            </div>
                            <div className="wt5-leaf-decor wt5-br">
                                <LeafOrnament />
                            </div>

                            <div className="wt5-hero-title-sub wt5-serif">Undangan Pernikahan</div>
                            <h1 className="wt5-hero-names wt5-cursive">
                                {invitation.groomNickname || invitation.groomFullName} &amp; {invitation.brideNickname || invitation.brideFullName}
                            </h1>

                            <div className="wt5-hero-photo-frame">
                                {heroPhoto ? (
                                    <img src={heroPhoto} alt={`${invitation.groomNickname} & ${invitation.brideNickname}`} />
                                ) : (
                                    <span className="wt5-photo-fallback">
                                        {invitation.groomInitials}
                                        {invitation.brideInitials}
                                    </span>
                                )}
                            </div>

                            <div className="wt5-hero-date wt5-serif">{invitation.mainDateFormatted}</div>

                            {isEnabled('countdown') && invitation.countdownDate && (
                                <Countdown
                                    targetDate={invitation.countdownDate}
                                    className="wt5-countdown"
                                    boxClassName="wt5-countdown-box"
                                    numClassName="wt5-countdown-num"
                                    labelClassName="wt5-countdown-label"
                                />
                            )}
                        </div>
                    </section>

                    {/* 2. Opening quote / verse */}
                    {invitation.openingQuote && (
                        <section className="wt5-section wt5-verse-section">
                            <div className="wt5-section-inner">
                                <img src={bismillahGold} alt="Bismillahirrahmanirrahim" className="wt5-bismillah-img wt5-anim" />
                                <p className="wt5-verse-text wt5-anim">&ldquo;{invitation.openingQuote}&rdquo;</p>
                            </div>
                        </section>
                    )}

                    {/* 3. Couple */}
                    {isEnabled('couple_profile') && (
                        <section className="wt5-section wt5-couple-section">
                            <div className="wt5-section-inner">
                                <div className="wt5-gold-card-frame wt5-anim">
                                    <div className="wt5-leaf-decor wt5-tl">
                                        <LeafOrnament />
                                    </div>
                                    <div className="wt5-leaf-decor wt5-br">
                                        <LeafOrnament />
                                    </div>

                                    <p className="wt5-couple-greeting">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                                    <p className="wt5-verse-text" style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                                        Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan penuh syukur, kami
                                        bermaksud menyelenggarakan pernikahan:
                                    </p>

                                    {/* Bride */}
                                    <div className="wt5-couple-profile">
                                        <div className="wt5-couple-photo-frame">
                                            {bridePhoto ? (
                                                <img src={bridePhoto} alt={invitation.brideFullName} />
                                            ) : (
                                                <span className="wt5-photo-fallback">{invitation.brideInitials}</span>
                                            )}
                                        </div>
                                        <h2 className="wt5-couple-name wt5-serif">{invitation.brideFullName}</h2>
                                        {invitation.brideChildOrder && <p className="wt5-couple-child">{invitation.brideChildOrder}</p>}
                                        <p className="wt5-couple-parents">
                                            Putri dari
                                            <br />
                                            <strong>
                                                {invitation.brideFather}
                                                {invitation.brideFather && invitation.brideMother ? ' & ' : ''}
                                                {invitation.brideMother}
                                            </strong>
                                        </p>
                                        {invitation.brideBio && <p className="wt5-couple-bio">{invitation.brideBio}</p>}
                                    </div>

                                    <div className="wt5-ampersand-divider wt5-cursive">&amp;</div>

                                    {/* Groom */}
                                    <div className="wt5-couple-profile">
                                        <div className="wt5-couple-photo-frame">
                                            {groomPhoto ? (
                                                <img src={groomPhoto} alt={invitation.groomFullName} />
                                            ) : (
                                                <span className="wt5-photo-fallback">{invitation.groomInitials}</span>
                                            )}
                                        </div>
                                        <h2 className="wt5-couple-name wt5-serif">{invitation.groomFullName}</h2>
                                        {invitation.groomChildOrder && <p className="wt5-couple-child">{invitation.groomChildOrder}</p>}
                                        <p className="wt5-couple-parents">
                                            Putra dari
                                            <br />
                                            <strong>
                                                {invitation.groomFather}
                                                {invitation.groomFather && invitation.groomMother ? ' & ' : ''}
                                                {invitation.groomMother}
                                            </strong>
                                        </p>
                                        {invitation.groomBio && <p className="wt5-couple-bio">{invitation.groomBio}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 4. Events */}
                    {isEnabled('event_detail') && invitation.events.length > 0 && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Waktu &amp; Tempat Acara</h2>
                                <p className="wt5-section-sub wt5-anim">
                                    Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara
                                    pernikahan kami:
                                </p>

                                {invitation.events.map((ev, i) => {
                                    const mapsUrl =
                                        ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                    const timeStr = ev.time ? (ev.timeEnd ? `Pukul ${ev.time} – ${ev.timeEnd} WIB` : `Pukul ${ev.time} WIB`) : '';
                                    return (
                                        <div key={i} className="wt5-event-card wt5-anim">
                                            <div className="wt5-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</div>
                                            <h3 className="wt5-event-title wt5-serif">{ev.name}</h3>
                                            <ul className="wt5-event-details">
                                                <li>
                                                    <strong>{ev.dateFormatted}</strong>
                                                </li>
                                                {timeStr && <li>{timeStr}</li>}
                                                {ev.locationName && <li>Tempat: {ev.locationName}</li>}
                                                {ev.location && <li>{ev.location}</li>}
                                            </ul>
                                            <div className="wt5-event-actions">
                                                {mapsUrl && (
                                                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt5-btn-gold">
                                                        📍 Lihat Peta
                                                    </a>
                                                )}
                                                {isEnabled('add_to_calendar') && (
                                                    <button type="button" className="wt5-btn-gold" onClick={() => addToCalendar(ev)}>
                                                        🗓️ Tambah ke Kalender
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Map */}
                    {isEnabled('location') &&
                        invitation.events.length > 0 &&
                        (() => {
                            const ev = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
                            const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                            if (!ev.mapsEmbed && !mapsUrl) return null;
                            return (
                                <section className="wt5-section wt5-map-section">
                                    <div className="wt5-section-inner">
                                        <h2 className="wt5-section-heading wt5-serif wt5-anim">Lokasi Acara</h2>
                                        <p className="wt5-section-sub wt5-anim">
                                            {ev.locationName ? `${ev.name} · ${ev.locationName}` : 'Berikut adalah peta lokasi pernikahan kami:'}
                                        </p>
                                        {ev.mapsEmbed && (
                                            <div className="wt5-map-embed wt5-anim">
                                                <iframe
                                                    src={ev.mapsEmbed}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    allowFullScreen
                                                    title={`Lokasi ${ev.locationName || ev.name}`}
                                                />
                                            </div>
                                        )}
                                        {mapsUrl && (
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt5-btn-gold wt5-anim">
                                                🧭 Petunjuk Navigasi GPS
                                            </a>
                                        )}
                                    </div>
                                </section>
                            );
                        })()}

                    {/* 5. Love story */}
                    {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Kisah Cinta Kami</h2>
                                <p className="wt5-section-sub wt5-anim">Perjalanan cinta kami hingga menuju gerbang pernikahan:</p>
                                <div className="wt5-timeline">
                                    {invitation.loveStory.map((item, i) => (
                                        <div key={i} className="wt5-timeline-item wt5-anim">
                                            <div className="wt5-timeline-dot" />
                                            <div className="wt5-timeline-content">
                                                {item.photo && <div className="wt5-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                                <div className="wt5-timeline-date">{item.date}</div>
                                                <h4 className="wt5-timeline-title wt5-serif">{item.title}</h4>
                                                <p className="wt5-timeline-text">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 6. Gallery */}
                    {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Galeri Foto Kami</h2>
                                <p className="wt5-section-sub wt5-anim">Momen-momen indah kebersamaan kami:</p>
                                <div className="wt5-anim">
                                    <GallerySection
                                        items={invitation.gallery}
                                        styles={{
                                            grid: 'wt5-gallery-grid',
                                            item: 'wt5-gallery-item',
                                            thumb: 'wt5-gallery-thumb',
                                            overlay: 'wt5-gallery-overlay',
                                            filterBar: 'wt5-gallery-filter-bar',
                                            filterBtn: 'wt5-filter-btn',
                                            filterBtnActive: 'wt5-filter-btn wt5-filter-btn-active',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Video */}
                    {isEnabled('video') && coupleVideoEmbedUrl && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Video Mempelai</h2>
                                <div className="wt5-video-frame wt5-anim">
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

                    {/* 7. Dress code */}
                    {invitation.dressCodes && invitation.dressCodes.length > 0 && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Dress Code Tamu</h2>
                                <p className="wt5-section-sub wt5-anim" style={{ marginBottom: 0 }}>
                                    Demi keselarasan acara dan keindahan dokumentasi, para tamu undangan direkomendasikan mengenakan pakaian
                                    dengan nuansa warna berikut:
                                </p>
                                <div className="wt5-dress-code-box wt5-anim">
                                    <div className="wt5-dress-code-palette">
                                        {invitation.dressCodes.map((dc, i) => (
                                            <div key={i} className="wt5-color-dot-wrap">
                                                <div className="wt5-color-dot" style={{ background: dc.hex }} title={dc.name} />
                                                <div className="wt5-color-dot-name">{dc.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="wt5-dress-code-note">Mohon hindari warna putih agar selaras dengan busana mempelai.</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 8. Digital wallet / gift */}
                    {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Kado Digital / Amplop</h2>
                                <p className="wt5-section-sub wt5-anim">
                                    Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan kado digital atau tanda kasih, dapat mentransfer melalui
                                    rekening berikut:
                                </p>
                                <div className="wt5-anim">
                                    <DigitalWalletSection
                                        bankAccounts={invitation.bankAccounts ?? []}
                                        digitalWallets={invitation.digitalWallets ?? []}
                                        onToast={showToast}
                                        styles={{
                                            bankGrid: 'wt5-bank-grid',
                                            bankCard: 'wt5-bank-card',
                                            bankLogo: 'wt5-bank-logo',
                                            bankType: 'wt5-bank-type',
                                            bankNumber: 'wt5-bank-number',
                                            bankName: 'wt5-bank-name',
                                            copyBankBtn: 'wt5-btn-copy',
                                            ewalletGrid: 'wt5-ewallet-grid',
                                            ewalletCard: 'wt5-ewallet-card',
                                            ewalletName: 'wt5-ewallet-name',
                                            ewalletPhone: 'wt5-ewallet-phone',
                                            copyEwalletBtn: 'wt5-btn-copy',
                                            ewalletTitle: 'wt5-ewallet-title',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 9. RSVP */}
                    {isEnabled('rsvp') && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <div className="wt5-gold-card-frame wt5-anim">
                                    <div className="wt5-leaf-decor wt5-tl">
                                        <LeafOrnament />
                                    </div>
                                    <div className="wt5-leaf-decor wt5-br">
                                        <LeafOrnament />
                                    </div>

                                    <h2 className="wt5-section-heading wt5-serif">Konfirmasi Kehadiran</h2>
                                    <p className="wt5-section-sub">Mohon konfirmasikan kehadiran Anda melalui form RSVP di bawah ini:</p>
                                    {invitation.rsvpDeadline && (
                                        <p style={{ fontSize: '0.78rem', color: 'var(--wt5-gold-dark)', marginBottom: '18px', fontWeight: 600 }}>
                                            ⏰ Konfirmasi sebelum {invitation.rsvpDeadline}
                                        </p>
                                    )}

                                    <RSVPForm
                                        rsvpEndpoint={invitation.rsvpEndpoint}
                                        guestName={invitation.guestName || undefined}
                                        guestSlug={invitation.guestSlug}
                                        onToast={showToast}
                                        styles={{
                                            form: 'wt5-rsvp-form',
                                            label: 'wt5-form-label',
                                            input: 'wt5-form-control',
                                            select: 'wt5-form-control wt5-form-select',
                                            textarea: 'wt5-form-control',
                                            radioGroup: 'wt5-radio-group',
                                            radioLabel: 'wt5-radio-label',
                                            errorText: 'wt5-error-text',
                                            submitBtn: 'wt5-btn-gold wt5-rsvp-submit',
                                            successBox: 'wt5-rsvp-success',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 10. Wishes */}
                    {isEnabled('wishes') && (
                        <section className="wt5-section">
                            <div className="wt5-section-inner">
                                <h2 className="wt5-section-heading wt5-serif wt5-anim">Doa &amp; Ucapan Tamu</h2>
                                <p className="wt5-section-sub wt5-anim">Kirimkan doa restu Anda kepada kedua mempelai:</p>
                                <div className="wt5-anim">
                                    <WishesSection
                                        wishesEndpoint={invitation.wishesEndpoint}
                                        allowComments={invitation.allowComments}
                                        onToast={showToast}
                                        styles={{
                                            container: 'wt5-wishes-layout',
                                            formBox: 'wt5-wishes-form-box',
                                            formTitle: 'wt5-wishes-form-title',
                                            nameInput: 'wt5-wish-input',
                                            messageInput: 'wt5-wish-input',
                                            submitBtn: 'wt5-wish-submit',
                                            wishCard: 'wt5-wish-item',
                                            wishAvatar: 'wt5-wish-avatar',
                                            wishName: 'wt5-wish-name',
                                            wishDate: 'wt5-wish-date',
                                            wishMessage: 'wt5-wish-message',
                                            loadMoreBtn: 'wt5-btn-more',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 11. Closing */}
                    <section className="wt5-closing-section">
                        <p className="wt5-cursive">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                        <p>
                            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan
                            do&apos;a restu kepada kedua mempelai.
                        </p>
                        <p>Atas kehadiran dan do&apos;a restunya kami ucapkan terima kasih yang sebesar-besarnya.</p>

                        <h2 className="wt5-closing-names wt5-cursive">
                            {invitation.groomNickname || invitation.groomFullName} &amp; {invitation.brideNickname || invitation.brideFullName}
                        </h2>

                        <p className="wt5-closing-family">
                            Kami yang berbahagia,
                            <br />
                            Kel. {invitation.brideFather}
                            {invitation.brideFather && invitation.brideMother ? ' & ' : ''}
                            {invitation.brideMother}
                            <br />
                            Kel. {invitation.groomFather}
                            {invitation.groomFather && invitation.groomMother ? ' & ' : ''}
                            {invitation.groomMother}
                        </p>

                        {isEnabled('footer') && (
                            <footer className="wt5-footer">
                                &copy; {new Date().getFullYear()} {invitation.groomNickname || invitation.groomFullName} &amp;{' '}
                                {invitation.brideNickname || invitation.brideFullName} Wedding Invitation. Created with love.
                            </footer>
                        )}
                    </section>
                </div>
            </div>

            {/* Floating music player */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={envelopeOpening}
                    buttonStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid var(--wt5-gold)',
                        color: 'var(--wt5-green)',
                    }}
                />
            )}

            <Toast message={toast} onDone={clearToast} className="wt5-toast" />

            {showBackTop && (
                <button className="wt5-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">
                    ↑
                </button>
            )}
        </div>
    );
}
