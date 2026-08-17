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
import './aqiqah-theme-02.css';

interface AqiqahTheme02Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🐑', '✂️', '🍽️', '🤲', '⭐', '🌙'];

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

export default function AqiqahTheme02({ invitation, visitor, greeting }: AqiqahTheme02Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq2-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq2-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic twinkling stars for the overlay/night sections
    const overlayStars = useMemo(
        () =>
            Array.from({ length: 40 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 1 + Math.random() * 2.4,
                delay: Math.random() * 4,
                duration: 2 + Math.random() * 3,
            })),
        [],
    );
    const closingStars = useMemo(
        () =>
            Array.from({ length: 30 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 1 + Math.random() * 2.2,
                delay: Math.random() * 4,
                duration: 2 + Math.random() * 3,
            })),
        [],
    );
    // Extra twinkling sparkle accents layered on top of the plain star dots
    const sparkles = useMemo(
        () =>
            Array.from({ length: 8 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay: Math.random() * 4,
                duration: 3 + Math.random() * 2.5,
            })),
        [],
    );

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '⭐';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;

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
        <div className="aq2-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Karla:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq2-cover${opened ? ' aq2-hide' : ''}`}>
                    <div className="aq2-star-field" aria-hidden="true">
                        {overlayStars.map((s, i) => (
                            <span
                                key={i}
                                className="aq2-star-dot"
                                style={{
                                    left: `${s.left}%`,
                                    top: `${s.top}%`,
                                    width: s.size,
                                    height: s.size,
                                    animationDelay: `${s.delay}s`,
                                    animationDuration: `${s.duration}s`,
                                }}
                            />
                        ))}
                        {sparkles.map((s, i) => (
                            <span
                                key={`sp-${i}`}
                                className="aq2-sparkle"
                                style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
                            >
                                ✨
                            </span>
                        ))}
                        <span className="aq2-moon">🌙</span>
                        <span className="aq2-cloud aq2-cloud-3">☁️</span>
                        <span className="aq2-float-star aq2-float-star-1">✦</span>
                        <span className="aq2-float-star aq2-float-star-2">✦</span>
                        {confettiEnabled && (
                            <>
                                <span className="aq2-cloud aq2-cloud-1">☁️</span>
                                <span className="aq2-cloud aq2-cloud-2">☁️</span>
                            </>
                        )}
                    </div>

                    <div className="aq2-cover-card">
                        <div className="aq2-baby-badge" aria-hidden="true">
                            <span className="aq2-baby-badge-glow" />
                            <span className="aq2-baby-badge-icon">👶</span>
                            <span className="aq2-baby-badge-sparkle aq2-baby-badge-sparkle-1">✨</span>
                            <span className="aq2-baby-badge-sparkle aq2-baby-badge-sparkle-2">✨</span>
                        </div>
                        <span className="aq2-cover-tag">✦ Walimatul Aqiqah ✦</span>
                        <h1 className="aq2-cover-name">{invitation.babyName}</h1>
                        {babyGender && (
                            <p className="aq2-cover-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        {invitation.mainDateFormatted && <p className="aq2-cover-date">⭐ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq2-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq2-cover-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq2-cover-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq2-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="aq2-cover-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={116}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(242,193,105,0.6)' }}
                                />
                                <p className="aq2-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="aq2-btn-open" onClick={openInvitation}>
                            ⭐ {greeting?.buttonText ?? 'Buka Undangan'} ⭐
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq2-main${opened ? ' aq2-main-visible' : ''}`}>
                {/* HERO */}
                <section className="aq2-hero">
                    <div className="aq2-star-field" aria-hidden="true">
                        {overlayStars.slice(0, 24).map((s, i) => (
                            <span
                                key={i}
                                className="aq2-star-dot"
                                style={{
                                    left: `${s.left}%`,
                                    top: `${s.top}%`,
                                    width: s.size,
                                    height: s.size,
                                    animationDelay: `${s.delay}s`,
                                    animationDuration: `${s.duration}s`,
                                }}
                            />
                        ))}
                        {sparkles.map((s, i) => (
                            <span
                                key={`hsp-${i}`}
                                className="aq2-sparkle"
                                style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
                            >
                                ✨
                            </span>
                        ))}
                        <span className="aq2-hero-moon">🌙</span>
                        <span className="aq2-hero-cloud aq2-hero-cloud-1">☁️</span>
                        <span className="aq2-hero-cloud aq2-hero-cloud-2">☁️</span>
                        <span className="aq2-float-star aq2-float-star-1">✦</span>
                        <span className="aq2-float-star aq2-float-star-2">✦</span>
                    </div>
                    <div className="aq2-hero-inner aq2-anim-up">
                        <p className="aq2-hero-label">✦ Selamat Datang, Bintang Kecil ✦</p>
                        <div className="aq2-hero-photo-wrap">
                            <div
                                className="aq2-hero-photo"
                                style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!babyPhoto && babyInitial}
                            </div>
                            <span className="aq2-hero-star-badge">⭐</span>
                        </div>
                        <h1 className="aq2-hero-name">{invitation.babyName}</h1>
                        {babyGender && (
                            <div className="aq2-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq2-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        {invitation.mainDateFormatted && <p className="aq2-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq2-countdown"
                                boxClassName="aq2-countdown-box"
                                numClassName="aq2-countdown-num"
                                labelClassName="aq2-countdown-label"
                            />
                        )}
                        <div className="aq2-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* OPENING MESSAGE */}
                {invitation.openingMessage && (
                    <section className="aq2-quote">
                        <p className="aq2-quote-moon">🌙</p>
                        <p className="aq2-quote-text aq2-anim-up">{invitation.openingMessage}</p>
                        <div className="aq2-quote-divider">
                            <span>✦</span>
                        </div>
                    </section>
                )}

                {/* BABY PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="aq2-section aq2-profile-bg">
                        <h2 className="aq2-section-title aq2-anim-up">Si Kecil yang Dinanti</h2>
                        <div className="aq2-divider aq2-anim-up">
                            <span>⭐</span>
                        </div>
                        <div className="aq2-profile-card aq2-anim-up">
                            <div className="aq2-profile-photo-frame">
                                <div
                                    className="aq2-profile-photo"
                                    style={
                                        babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                    }
                                >
                                    {!babyPhoto && babyInitial}
                                </div>
                            </div>
                            <h3 className="aq2-profile-name">{invitation.babyName}</h3>
                            {babyGender && (
                                <p className="aq2-profile-gender">
                                    {genderIcon(babyGender)} {babyGender}
                                </p>
                            )}
                            <div className="aq2-profile-tags">
                                {invitation.birthDateFormatted && <span className="aq2-profile-tag">🌙 {invitation.birthDateFormatted}</span>}
                                {profileLine && <span className="aq2-profile-tag">✨ {profileLine}</span>}
                            </div>
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq2-section aq2-events-bg">
                        <div className="aq2-star-field" aria-hidden="true">
                            {closingStars.map((s, i) => (
                                <span
                                    key={i}
                                    className="aq2-star-dot"
                                    style={{
                                        left: `${s.left}%`,
                                        top: `${s.top}%`,
                                        width: s.size,
                                        height: s.size,
                                        animationDelay: `${s.delay}s`,
                                        animationDuration: `${s.duration}s`,
                                    }}
                                />
                            ))}
                        </div>
                        <h2 className="aq2-section-title aq2-light aq2-anim-up">Rangkaian Acara</h2>
                        <div className="aq2-divider aq2-light aq2-anim-up">
                            <span>🌙</span>
                        </div>
                        <div className="aq2-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="aq2-event-card aq2-anim-up">
                                        <span className="aq2-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="aq2-event-name">{ev.name}</h3>
                                        <div className="aq2-event-divider" />
                                        <p className="aq2-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="aq2-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="aq2-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq2-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="aq2-btn-event" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                📅 Tambah ke Kalender
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* LOCATION */}
                {isEnabled('location') &&
                    invitation.events.length > 0 &&
                    (() => {
                        const ev = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
                        const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                        if (!ev.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="aq2-section">
                                <h2 className="aq2-section-title aq2-anim-up">Lokasi Acara</h2>
                                <div className="aq2-divider aq2-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="aq2-location-sub aq2-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="aq2-map-container aq2-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="aq2-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq2-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="aq2-section aq2-gallery-bg">
                        <h2 className="aq2-section-title aq2-anim-up">Galeri Momen</h2>
                        <div className="aq2-divider aq2-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq2-gallery-grid',
                                item: 'aq2-gallery-item',
                                thumb: 'aq2-gallery-thumb',
                                overlay: 'aq2-gallery-overlay',
                                filterBar: 'aq2-gallery-filter-bar',
                                filterBtn: 'aq2-filter-btn',
                                filterBtnActive: 'aq2-filter-btn aq2-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq2-section">
                        <h2 className="aq2-section-title aq2-anim-up">Video Kenangan</h2>
                        <div className="aq2-divider aq2-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="aq2-video-frame aq2-anim-up">
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

                {/* DIGITAL GIFT */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq2-section aq2-gift-bg">
                        <div className="aq2-star-field" aria-hidden="true">
                            {closingStars.slice(0, 20).map((s, i) => (
                                <span
                                    key={i}
                                    className="aq2-star-dot"
                                    style={{
                                        left: `${s.left}%`,
                                        top: `${s.top}%`,
                                        width: s.size,
                                        height: s.size,
                                        animationDelay: `${s.delay}s`,
                                        animationDuration: `${s.duration}s`,
                                    }}
                                />
                            ))}
                        </div>
                        <h2 className="aq2-section-title aq2-light aq2-anim-up">Kado Digital</h2>
                        <div className="aq2-divider aq2-light aq2-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="aq2-gift-subtitle aq2-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik untuk si kecil. Namun jika ingin memberi kado, berikut
                            informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq2-bank-grid',
                                bankCard: 'aq2-bank-card',
                                bankLogo: 'aq2-bank-logo',
                                bankType: 'aq2-bank-type',
                                bankNumber: 'aq2-bank-number',
                                bankName: 'aq2-bank-name',
                                copyBankBtn: 'aq2-btn-copy-bank',
                                ewalletGrid: 'aq2-ewallet-grid',
                                ewalletCard: 'aq2-ewallet-card',
                                ewalletName: 'aq2-ewallet-name',
                                ewalletPhone: 'aq2-ewallet-phone',
                                copyEwalletBtn: 'aq2-btn-copy-ewallet',
                                ewalletTitle: 'aq2-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="aq2-section">
                        <h2 className="aq2-section-title aq2-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="aq2-divider aq2-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'aq2-rsvp-form',
                                label: 'aq2-rsvp-label',
                                input: 'aq2-rsvp-input',
                                select: 'aq2-rsvp-select',
                                textarea: 'aq2-rsvp-textarea',
                                radioGroup: 'aq2-rsvp-radio-group',
                                radioLabel: 'aq2-rsvp-radio-label',
                                errorText: 'aq2-rsvp-error',
                                submitBtn: 'aq2-rsvp-submit',
                                successBox: 'aq2-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="aq2-section aq2-wishes-bg">
                        <h2 className="aq2-section-title aq2-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq2-divider aq2-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq2-wishes-layout',
                                formBox: 'aq2-wishes-form',
                                formTitle: 'aq2-wishes-form-title',
                                nameInput: 'aq2-wish-input',
                                messageInput: 'aq2-wish-input',
                                submitBtn: 'aq2-wish-btn',
                                wishCard: 'aq2-wish-card',
                                wishAvatar: 'aq2-wish-avatar',
                                wishName: 'aq2-wish-name',
                                wishDate: 'aq2-wish-date',
                                wishMessage: 'aq2-wish-message',
                                loadMoreBtn: 'aq2-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="aq2-closing">
                        <div className="aq2-star-field" aria-hidden="true">
                            {closingStars.map((s, i) => (
                                <span
                                    key={i}
                                    className="aq2-star-dot"
                                    style={{
                                        left: `${s.left}%`,
                                        top: `${s.top}%`,
                                        width: s.size,
                                        height: s.size,
                                        animationDelay: `${s.delay}s`,
                                        animationDuration: `${s.duration}s`,
                                    }}
                                />
                            ))}
                            <span className="aq2-closing-moon">🌙</span>
                            <span className="aq2-float-star aq2-float-star-1">✦</span>
                            <span className="aq2-float-star aq2-float-star-2">✦</span>
                        </div>
                        <div className="aq2-closing-frame aq2-anim-up">
                            <p className="aq2-closing-emoji">🌙⭐🧸</p>
                            <p className="aq2-closing-title">Terima Kasih</p>
                            <p className="aq2-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="aq2-closing-from">Dengan penuh syukur,</p>
                            <p className="aq2-closing-name">{invitation.babyName}</p>
                            {parentsLine && <p className="aq2-closing-family">Keluarga {parentsLine}</p>}
                            <div className="aq2-closing-line" />
                            <p className="aq2-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </div>
                    </section>
                )}
            </div>
            {/* end main */}

            {/* Music */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq2-navy)', border: '2px solid var(--aq2-gold)', color: 'var(--aq2-gold)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="aq2-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="aq2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
