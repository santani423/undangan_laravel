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
import './wedding-theme-01.css';

interface WeddingTheme01Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '🏛️', '🎊', '🌸', '⭐', '🎶'];

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

export default function WeddingTheme01({ invitation, visitor, greeting }: WeddingTheme01Props) {
    const features = invitation.features ?? {};

    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wt1-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.wt1-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    return (
        <div className="wt1-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Lato:wght@300;400;700&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt1-overlay${opened ? ' hide' : ''}`}>
                    <div className="wt1-overlay-frame">
                        <span className="wt1-overlay-leaves wt1-leaf-tl">🌿</span>
                        <span className="wt1-overlay-leaves wt1-leaf-tr">🌿</span>
                        <span className="wt1-overlay-leaves wt1-leaf-bl">🌿</span>
                        <span className="wt1-overlay-leaves wt1-leaf-br">🌿</span>
                        <div className="wt1-corner-tr" />
                        <div className="wt1-corner-bl" />
                        {invitation.openingQuote && <p className="wt1-overlay-bismillah">بسم الله الرحمن الرحيم</p>}
                        <div className="wt1-overlay-divider" />
                        <p className="wt1-overlay-wedding-of">The Wedding of</p>
                        <div className="wt1-overlay-names">
                            {invitation.groomFullName}
                            <span className="wt1-overlay-amp">&amp;</span>
                            {invitation.brideFullName}
                        </div>
                        <div className="wt1-overlay-divider" />
                        <p className="wt1-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="wt1-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="wt1-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="wt1-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="wt1-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 20px' }}>
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '8px', border: '3px solid rgba(232,213,163,0.6)' }}
                                />
                                <p style={{ color: 'rgba(232,213,163,0.55)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1.5px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="wt1-btn-open" onClick={openInvitation}>
                            ✦ {greeting?.buttonText ?? 'Buka Undangan'} ✦
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`wt1-main${opened ? ' visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="wt1-hero">
                    <div className="wt1-hero-frame wt1-anim-up">
                        <p className="wt1-hero-label">The Wedding of</p>
                        <h1 className="wt1-hero-name">{invitation.groomNickname}</h1>
                        <span className="wt1-hero-amp">&amp;</span>
                        <h1 className="wt1-hero-name">{invitation.brideNickname}</h1>
                        <div
                            className="wt1-hero-photo"
                            style={heroPhoto ? { backgroundImage: `url(${heroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                        >
                            {!heroPhoto && `${invitation.groomInitials} & ${invitation.brideInitials}`}
                        </div>
                        <p className="wt1-hero-date">{invitation.mainDateFormatted}</p>
                        <div className="wt1-gold-divider">
                            <span>✦</span>
                        </div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wt1-countdown"
                                boxClassName="wt1-countdown-box"
                                numClassName="wt1-countdown-num"
                                labelClassName="wt1-countdown-label"
                            />
                        )}
                        <div className="wt1-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── BISMILLAH / OPENING QUOTE ─────────────────────────────────── */}
                {invitation.openingQuote && (
                    <section className="wt1-bismillah">
                        <div className="wt1-gold-line" />
                        <p className="wt1-quran-verse wt1-anim-up">{invitation.openingQuote}</p>
                        <div className="wt1-gold-line" />
                    </section>
                )}

                {/* ── COUPLE ────────────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="wt1-section wt1-couple">
                        <h2 className="wt1-section-title wt1-anim-up">Mempelai</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>💍</span>
                        </div>
                        <div className="wt1-couple-grid">
                            {/* Groom */}
                            <div className="wt1-couple-card wt1-anim-up">
                                <span className="wt1-couple-badge">♚ Mempelai Pria</span>
                                <div
                                    className="wt1-couple-photo wt1-groom-photo"
                                    style={
                                        groomPhoto
                                            ? { backgroundImage: `url(${groomPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!groomPhoto && invitation.groomInitials}
                                </div>
                                <h3 className="wt1-couple-name">{invitation.groomFullName}</h3>
                                {invitation.groomChildOrder && <p className="wt1-couple-child">{invitation.groomChildOrder} dari:</p>}
                                <p className="wt1-couple-parents">
                                    {invitation.groomFather}
                                    {invitation.groomFather && invitation.groomMother && (
                                        <>
                                            <br />
                                            &amp;{' '}
                                        </>
                                    )}
                                    {invitation.groomMother}
                                </p>
                                {invitation.groomBio && <p className="wt1-couple-bio">{invitation.groomBio}</p>}
                            </div>
                            {/* Heart */}
                            <div className="wt1-heart-center wt1-anim-up">❤</div>
                            {/* Bride */}
                            <div className="wt1-couple-card wt1-anim-up">
                                <span className="wt1-couple-badge" style={{ background: '#c47f8a' }}>
                                    ♛ Mempelai Wanita
                                </span>
                                <div
                                    className="wt1-couple-photo wt1-bride-photo"
                                    style={
                                        bridePhoto
                                            ? { backgroundImage: `url(${bridePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!bridePhoto && invitation.brideInitials}
                                </div>
                                <h3 className="wt1-couple-name">{invitation.brideFullName}</h3>
                                {invitation.brideChildOrder && <p className="wt1-couple-child">{invitation.brideChildOrder} dari:</p>}
                                <p className="wt1-couple-parents">
                                    {invitation.brideFather}
                                    {invitation.brideFather && invitation.brideMother && (
                                        <>
                                            <br />
                                            &amp;{' '}
                                        </>
                                    )}
                                    {invitation.brideMother}
                                </p>
                                {invitation.brideBio && <p className="wt1-couple-bio">{invitation.brideBio}</p>}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="wt1-section wt1-events-bg">
                        <h2 className="wt1-section-title light wt1-anim-up">Rangkaian Acara</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>🌿</span>
                        </div>
                        <div className="wt1-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="wt1-event-card wt1-anim-up">
                                        <span className="wt1-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <p className="wt1-event-type">{ev.name}</p>
                                        <h3 className="wt1-event-name">{ev.name}</h3>
                                        <div className="wt1-event-divider" />
                                        <p className="wt1-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="wt1-event-detail">{timeStr}</p>}
                                        <div className="wt1-event-divider" />
                                        {ev.locationName && (
                                            <p className="wt1-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="wt1-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '25px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt1-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="wt1-btn-event" onClick={() => addToCalendar(ev)}>
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
                            <section className="wt1-section">
                                <h2 className="wt1-section-title wt1-anim-up">Lokasi Acara</h2>
                                <div className="wt1-gold-divider wt1-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p
                                        style={{
                                            textAlign: 'center',
                                            color: 'var(--wt1-gold)',
                                            fontSize: '1rem',
                                            marginBottom: '8px',
                                            fontStyle: 'italic',
                                        }}
                                        className="wt1-anim-up"
                                    >
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div style={{ maxWidth: '900px', margin: '0 auto' }} className="wt1-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="wt1-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt1-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── LOVE STORY TIMELINE ───────────────────────────────────────── */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <section className="wt1-section">
                        <h2 className="wt1-section-title wt1-anim-up">Perjalanan Cinta Kami</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>💕</span>
                        </div>
                        <div className="wt1-timeline-container">
                            <div className="wt1-timeline-line" />
                            {invitation.loveStory.map((item, i) => {
                                const side = i % 2 === 0 ? 'left' : 'right';
                                const content = (
                                    <div className={`wt1-timeline-content ${side} wt1-anim-up`}>
                                        {item.photo && <div className="wt1-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="wt1-timeline-date">{item.date}</p>
                                        <h3 className="wt1-timeline-title">{item.title}</h3>
                                        <p className="wt1-timeline-desc">{item.desc}</p>
                                    </div>
                                );
                                return (
                                    <div key={i} className="wt1-timeline-item">
                                        {side === 'left' ? (
                                            <>
                                                {content}
                                                <div className="wt1-timeline-dot" />
                                                <div />
                                            </>
                                        ) : (
                                            <>
                                                <div />
                                                <div className="wt1-timeline-dot" />
                                                {content}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="wt1-section wt1-gallery-bg">
                        <h2 className="wt1-section-title wt1-anim-up">Galeri Foto</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            showFilters
                            filters={[
                                { key: 'prewedding', label: 'Prewedding' },
                                { key: 'engagement', label: 'Engagement' },
                            ]}
                            styles={{
                                grid: 'wt1-gallery-grid',
                                item: 'wt1-gallery-item',
                                thumb: 'wt1-gallery-thumb',
                                overlay: 'wt1-gallery-overlay',
                                filterBar: 'wt1-gallery-filter-bar',
                                filterBtn: 'wt1-filter-btn',
                                filterBtnActive: 'wt1-filter-btn wt1-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <section className="wt1-section">
                        <h2 className="wt1-section-title wt1-anim-up">Video Mempelai</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="wt1-video-frame wt1-anim-up">
                            <iframe
                                src={coupleVideoEmbedUrl}
                                title="Video Mempelai"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* ── DRESS CODE ────────────────────────────────────────────────── */}
                {invitation.dressCodes && invitation.dressCodes.length > 0 && (
                    <section className="wt1-section wt1-dresscode-bg">
                        <h2 className="wt1-section-title light wt1-anim-up">Dress Code</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>👗</span>
                        </div>
                        <p className="wt1-dresscode-note wt1-anim-up">
                            Kami dengan hormat memohon tamu undangan untuk mengenakan pakaian formal/semi-formal sesuai palet warna berikut:
                        </p>
                        <div className="wt1-color-swatches wt1-anim-up">
                            {invitation.dressCodes.map((dc, i) => (
                                <div key={i} className="wt1-swatch">
                                    <div className="wt1-swatch-circle" style={{ background: dc.hex }} />
                                    <p className="wt1-swatch-name">{dc.name}</p>
                                    <p className="wt1-swatch-hex">{dc.hex}</p>
                                </div>
                            ))}
                        </div>
                        <div className="wt1-dresscode-rules wt1-anim-up">
                            <ul>
                                <li>Mohon hindari pakaian berwarna putih atau hitam pekat</li>
                                <li>Pakaian formal: jas, kemeja, batik formal untuk pria</li>
                                <li>Gaun/kebaya/dress formal untuk wanita</li>
                                <li>Sepatu tertutup direkomendasikan</li>
                            </ul>
                        </div>
                    </section>
                )}

                {/* ── DIGITAL WALLET ────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="wt1-section">
                        <h2 className="wt1-section-title wt1-anim-up">Amplop Digital</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>💌</span>
                        </div>
                        <p className="wt1-wallet-subtitle wt1-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                            kasih, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'wt1-bank-grid',
                                bankCard: 'wt1-bank-card',
                                bankLogo: 'wt1-bank-logo',
                                bankType: 'wt1-bank-type',
                                bankNumber: 'wt1-bank-number',
                                bankName: 'wt1-bank-name',
                                copyBankBtn: 'wt1-btn-copy-bank',
                                ewalletGrid: 'wt1-ewallet-grid',
                                ewalletCard: 'wt1-ewallet-card',
                                ewalletName: 'wt1-ewallet-name',
                                ewalletPhone: 'wt1-ewallet-phone',
                                copyEwalletBtn: 'wt1-btn-copy-ewallet',
                                ewalletTitle: 'wt1-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="wt1-section">
                        <h2 className="wt1-section-title wt1-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>✉️</span>
                        </div>
                        {invitation.rsvpDeadline && (
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <span
                                    style={{
                                        background: 'var(--wt1-green)',
                                        color: 'var(--wt1-gold-light)',
                                        padding: '10px 20px',
                                        fontSize: '0.85rem',
                                        letterSpacing: '2px',
                                        display: 'inline-block',
                                    }}
                                >
                                    ⏰ Konfirmasi sebelum {invitation.rsvpDeadline}
                                </span>
                            </div>
                        )}
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'wt1-rsvp-form',
                                label: 'wt1-rsvp-label',
                                input: 'wt1-rsvp-input',
                                select: 'wt1-rsvp-select',
                                textarea: 'wt1-rsvp-textarea',
                                radioGroup: 'wt1-rsvp-radio-group',
                                radioLabel: 'wt1-rsvp-radio-label',
                                errorText: 'wt1-rsvp-error',
                                submitBtn: 'wt1-rsvp-submit',
                                successBox: 'wt1-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="wt1-section wt1-wishes-bg">
                        <h2 className="wt1-section-title wt1-anim-up">Ucapan &amp; Doa</h2>
                        <div className="wt1-gold-divider wt1-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'wt1-wishes-layout',
                                formBox: 'wt1-wishes-form',
                                formTitle: 'wt1-wishes-form-title',
                                nameInput: 'wt1-wish-input',
                                messageInput: 'wt1-wish-input',
                                submitBtn: 'wt1-wish-btn',
                                wishCard: 'wt1-wish-card',
                                wishAvatar: 'wt1-wish-avatar',
                                wishName: 'wt1-wish-name',
                                wishDate: 'wt1-wish-date',
                                wishMessage: 'wt1-wish-message',
                                loadMoreBtn: 'wt1-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section className="wt1-closing">
                    <div className="wt1-closing-frame wt1-anim-up">
                        <div className="wt1-gold-line" />
                        <p className="wt1-closing-title">Terima Kasih</p>
                        <div className="wt1-gold-line" />
                        <p className="wt1-closing-sub">
                            Atas segala doa dan kehadiran
                            <br />
                            Bapak/Ibu/Saudara/i
                            <br />
                            yang kami muliakan.
                        </p>
                        <p className="wt1-closing-from">Kami yang berbahagia,</p>
                        <p className="wt1-closing-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </p>
                        <p className="wt1-closing-family">
                            Keluarga Besar {invitation.groomFather}
                            {invitation.groomMother ? ` & ${invitation.groomMother}` : ''}
                            <br />
                            Keluarga Besar {invitation.brideFather}
                            {invitation.brideMother ? ` & ${invitation.brideMother}` : ''}
                        </p>
                        <div className="wt1-gold-line" />
                        <p style={{ color: 'var(--wt1-gold)', fontSize: '1.5rem', animation: 'wt1Float 3s ease-in-out infinite' }}>❤</p>
                        <p className="wt1-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                    </div>
                </section>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--wt1-green)', border: '1px solid var(--wt1-gold)', color: 'var(--wt1-gold)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wt1-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="wt1-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
