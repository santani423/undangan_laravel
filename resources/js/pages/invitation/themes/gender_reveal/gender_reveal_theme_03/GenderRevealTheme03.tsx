import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { GenderRevealInvitation, Greeting } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './gender-reveal-theme-03.css';

interface GenderRevealTheme03Props {
    invitation: GenderRevealInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const STARDUST_COLORS = ['#F3C66D', '#C9B6F0', '#FFB6C9', '#A8D4F5', '#FFE9B8'];
const EVENT_ICONS = ['🌙', '⭐', '🎀', '🍼', '🧸', '✨'];
const NIGHT_STARS = [
    { top: '10%', left: '6%', size: '0.7rem', duration: '2.6s', delay: '0s' },
    { top: '20%', left: '88%', size: '0.9rem', duration: '3.2s', delay: '0.4s' },
    { top: '6%', left: '42%', size: '0.6rem', duration: '2.2s', delay: '0.9s' },
    { top: '36%', left: '15%', size: '0.8rem', duration: '3s', delay: '1.3s' },
    { top: '14%', left: '68%', size: '0.65rem', duration: '2.8s', delay: '0.6s' },
    { top: '28%', left: '94%', size: '0.7rem', duration: '2.4s', delay: '1.6s' },
    { top: '44%', left: '78%', size: '0.6rem', duration: '3.4s', delay: '0.2s' },
    { top: '4%', left: '22%', size: '0.75rem', duration: '2.9s', delay: '1s' },
    { top: '50%', left: '5%', size: '0.55rem', duration: '3.1s', delay: '0.8s' },
    { top: '18%', left: '32%', size: '0.85rem', duration: '2.5s', delay: '1.2s' },
];

function addToCalendar(ev: GenderRevealInvitation['events'][0]) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '100000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '140000').replace(/:/g, '') + '00Z';
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

export default function GenderRevealTheme03({ invitation, visitor, greeting }: GenderRevealTheme03Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered reveal animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('gr3-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.gr3-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic stardust pieces (regenerated once)
    const stardustPieces = useMemo(
        () =>
            Array.from({ length: 40 }, () => ({
                left: Math.random() * 100,
                size: 3 + Math.random() * 5,
                color: STARDUST_COLORS[Math.floor(Math.random() * STARDUST_COLORS.length)],
                delay: Math.random() * 6,
                duration: 5 + Math.random() * 5,
            })),
        [],
    );

    const parentsPhoto = invitation.parentsPhoto;
    const fatherName = invitation.fatherName;
    const motherName = invitation.motherName;
    const parentsNames = fatherName && motherName ? `${fatherName} & ${motherName}` : fatherName || motherName || '';
    const parentsLine =
        fatherName && motherName
            ? `Ayah ${fatherName} & Bunda ${motherName}`
            : fatherName
              ? `Ayah ${fatherName}`
              : motherName
                ? `Bunda ${motherName}`
                : '';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const showTeams = Boolean(invitation.teamAName && invitation.teamBName);

    return (
        <div className="gr3-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`gr3-cover${opened ? ' gr3-hide' : ''}`}>
                    <div className="gr3-cover-stars" aria-hidden="true">
                        {NIGHT_STARS.map((s, i) => (
                            <span
                                key={i}
                                className="gr3-star"
                                style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: s.duration, animationDelay: s.delay }}
                            >
                                ✦
                            </span>
                        ))}
                    </div>
                    <div className="gr3-cover-moon" aria-hidden="true">
                        🌙
                    </div>

                    {confettiEnabled && (
                        <div className="gr3-stardust-bg" aria-hidden="true">
                            {stardustPieces.map((p, i) => (
                                <span
                                    key={i}
                                    className="gr3-stardust-piece"
                                    style={{
                                        left: `${p.left}%`,
                                        width: p.size,
                                        height: p.size,
                                        background: p.color,
                                        animationDelay: `${p.delay}s`,
                                        animationDuration: `${p.duration}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="gr3-cover-card">
                        <span className="gr3-cover-tag">🌙 Bintang Kecil Kami Segera Tiba 🌙</span>
                        <p className="gr3-cover-subtitle">Temani kami menantikan kehadiran buah hati yang dinanti-nanti</p>
                        {parentsNames && <h1 className="gr3-cover-name">{parentsNames}</h1>}
                        {invitation.dueDateFormatted && <div className="gr3-cover-due-badge">🤰 HPL {invitation.dueDateFormatted}</div>}
                        {invitation.mainDateFormatted && <p className="gr3-cover-date">✨ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="gr3-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="gr3-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="gr3-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="gr3-cover-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={116}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(255,255,255,0.65)' }}
                                />
                                <p className="gr3-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="gr3-btn-open" onClick={openInvitation}>
                            ✨ {greeting?.buttonText ?? 'Buka Undangan'} ✨
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`gr3-main${opened ? ' gr3-main-visible' : ''}`}>
                {/* HERO — dreamy night sky: moon, twinkling stars, drifting clouds */}
                <section className="gr3-hero">
                    <div className="gr3-hero-stars" aria-hidden="true">
                        {NIGHT_STARS.map((s, i) => (
                            <span
                                key={i}
                                className="gr3-star"
                                style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: s.duration, animationDelay: s.delay }}
                            >
                                ✦
                            </span>
                        ))}
                    </div>
                    <div className="gr3-hero-clouds" aria-hidden="true">
                        <span className="gr3-hero-cloud gr3-hero-cloud-0">☁️</span>
                        <span className="gr3-hero-cloud gr3-hero-cloud-1">☁️</span>
                        <span className="gr3-hero-cloud gr3-hero-cloud-2">☁️</span>
                    </div>
                    <div className="gr3-hero-moon-glow" aria-hidden="true">
                        🌙
                    </div>
                    <div className="gr3-hero-inner gr3-anim-up">
                        <p className="gr3-hero-label">✨ Sebuah Bintang Kecil Akan Hadir ✨</p>
                        <div className="gr3-hero-photo-wrap">
                            <div
                                className="gr3-hero-photo"
                                style={
                                    parentsPhoto
                                        ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >
                                {!parentsPhoto && '🤰'}
                            </div>
                            <div className="gr3-hero-mystery-badge">❓</div>
                        </div>
                        {parentsNames && <h1 className="gr3-hero-name">{parentsNames}</h1>}
                        <p className="gr3-hero-tagline">"Boy or girl? Semesta sedang menyiapkan kejutan terindah untuk kita semua."</p>
                        {invitation.mainDateFormatted && <p className="gr3-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="gr3-countdown"
                                boxClassName="gr3-countdown-box"
                                numClassName="gr3-countdown-num"
                                labelClassName="gr3-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="gr3-countdown-done">
                                        <div className="gr3-countdown-done-emoji">🌟</div>
                                        <h3>Saatnya Rahasia Terungkap!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="gr3-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* OPENING MESSAGE */}
                {invitation.openingMessage && (
                    <section className="gr3-message-section">
                        <div className="gr3-message-stars" aria-hidden="true">
                            <span className="gr3-message-star">✦</span>
                            <span className="gr3-message-star gr3-message-star-2">✦</span>
                        </div>
                        <div className="gr3-message-quote">"</div>
                        <p className="gr3-message-text gr3-anim-up">{invitation.openingMessage}</p>
                    </section>
                )}

                {/* "BOY OR GIRL?" TEASER — glowing moon disc with split pink/blue starlight.
                    No real answer exists yet: this only builds anticipation for the live event. */}
                <section className="gr3-teaser-section">
                    <div className="gr3-teaser-stars" aria-hidden="true">
                        {NIGHT_STARS.map((s, i) => (
                            <span
                                key={i}
                                className="gr3-star"
                                style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: s.duration, animationDelay: s.delay }}
                            >
                                ✦
                            </span>
                        ))}
                    </div>
                    <div className="gr3-teaser-body gr3-anim-up">
                        <p className="gr3-teaser-label">Rahasia Langit Malam Kami</p>
                        <div className="gr3-teaser-disc">
                            <span className="gr3-teaser-mark">?</span>
                        </div>
                        <h2 className="gr3-teaser-title">Boy or Girl? 🌙</h2>
                        <p className="gr3-teaser-sub">
                            Jawabannya masih tersimpan rapi di balik selimut bintang. Mari hitung hari dan saksikan langsung keajaibannya bersama
                            kami!
                        </p>
                    </div>
                </section>

                {/* PARENTS / REVEAL PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="gr3-section gr3-profile-bg">
                        <h2 className="gr3-section-title gr3-anim-up">Calon Ayah &amp; Bunda</h2>
                        <div className="gr3-divider gr3-anim-up">
                            <span>🌙</span>
                        </div>
                        <div className="gr3-profile-card gr3-anim-up">
                            <div className="gr3-profile-photo-frame">
                                <div
                                    className="gr3-profile-photo"
                                    style={
                                        parentsPhoto
                                            ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!parentsPhoto && '🤰'}
                                </div>
                            </div>
                            {parentsNames && <h3 className="gr3-profile-name">{parentsNames}</h3>}
                            {parentsLine && <p className="gr3-profile-line">{parentsLine}</p>}
                            {(invitation.dueDateFormatted || invitation.revealDateFormatted) && (
                                <div className="gr3-profile-tags">
                                    {invitation.dueDateFormatted && <span className="gr3-profile-tag">🤰 HPL {invitation.dueDateFormatted}</span>}
                                    {invitation.revealDateFormatted && (
                                        <span className="gr3-profile-tag">🌟 Reveal {invitation.revealDateFormatted}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {showTeams && (
                            <>
                                <div className="gr3-teams-row gr3-anim-up">
                                    <div className="gr3-team-chip gr3-team-chip-pink">
                                        <span className="gr3-team-emoji">🌟</span>
                                        <span className="gr3-team-name">{invitation.teamAName}</span>
                                    </div>
                                    <span className="gr3-team-amp">&amp;</span>
                                    <div className="gr3-team-chip gr3-team-chip-blue">
                                        <span className="gr3-team-emoji">🌟</span>
                                        <span className="gr3-team-name">{invitation.teamBName}</span>
                                    </div>
                                </div>
                                <p className="gr3-teams-caption gr3-anim-up">
                                    Dua warna, satu keajaiban — ramaikan pesta dan tunjukkan dukunganmu untuk menyambut si kecil!
                                </p>
                            </>
                        )}
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="gr3-section gr3-events-bg">
                        <h2 className="gr3-section-title gr3-light gr3-anim-up">Rangkaian Acara</h2>
                        <div className="gr3-divider gr3-light gr3-anim-up">
                            <span>⭐</span>
                        </div>
                        <div className="gr3-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="gr3-event-card gr3-anim-up">
                                        <span className="gr3-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="gr3-event-name">{ev.name}</h3>
                                        <div className="gr3-event-divider" />
                                        <p className="gr3-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="gr3-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="gr3-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr3-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="gr3-btn-event" onClick={() => addToCalendar(ev)}>
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
                            <section className="gr3-section">
                                <h2 className="gr3-section-title gr3-anim-up">Lokasi Acara</h2>
                                <div className="gr3-divider gr3-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="gr3-location-sub gr3-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="gr3-map-container gr3-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="gr3-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr3-btn-maps">
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
                    <section className="gr3-section gr3-gallery-bg">
                        <h2 className="gr3-section-title gr3-anim-up">Galeri Kebahagiaan</h2>
                        <div className="gr3-divider gr3-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'gr3-gallery-grid',
                                item: 'gr3-gallery-item',
                                thumb: 'gr3-gallery-thumb',
                                overlay: 'gr3-gallery-overlay',
                                filterBar: 'gr3-gallery-filter-bar',
                                filterBtn: 'gr3-filter-btn',
                                filterBtnActive: 'gr3-filter-btn gr3-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="gr3-section">
                        <h2 className="gr3-section-title gr3-anim-up">Video Kebahagiaan</h2>
                        <div className="gr3-divider gr3-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="gr3-video-frame gr3-anim-up">
                            <iframe
                                src={videoEmbedUrl}
                                title="Video Kebahagiaan"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* DIGITAL GIFT */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="gr3-section gr3-gift-bg">
                        <h2 className="gr3-section-title gr3-light gr3-anim-up">Kado untuk Si Kecil</h2>
                        <div className="gr3-divider gr3-light gr3-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="gr3-gift-subtitle gr3-anim-up">
                            Kehadiran dan doa restu Bapak/Ibu/Saudara/i sudah menjadi hadiah yang paling berarti. Namun apabila ingin memberikan tanda
                            kasih untuk persiapan menyambut si kecil, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'gr3-bank-grid',
                                bankCard: 'gr3-bank-card',
                                bankLogo: 'gr3-bank-logo',
                                bankType: 'gr3-bank-type',
                                bankNumber: 'gr3-bank-number',
                                bankName: 'gr3-bank-name',
                                copyBankBtn: 'gr3-btn-copy-bank',
                                ewalletGrid: 'gr3-ewallet-grid',
                                ewalletCard: 'gr3-ewallet-card',
                                ewalletName: 'gr3-ewallet-name',
                                ewalletPhone: 'gr3-ewallet-phone',
                                copyEwalletBtn: 'gr3-btn-copy-ewallet',
                                ewalletTitle: 'gr3-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="gr3-section">
                        <h2 className="gr3-section-title gr3-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="gr3-divider gr3-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'gr3-rsvp-form',
                                label: 'gr3-rsvp-label',
                                input: 'gr3-rsvp-input',
                                select: 'gr3-rsvp-select',
                                textarea: 'gr3-rsvp-textarea',
                                radioGroup: 'gr3-rsvp-radio-group',
                                radioLabel: 'gr3-rsvp-radio-label',
                                errorText: 'gr3-rsvp-error',
                                submitBtn: 'gr3-rsvp-submit',
                                successBox: 'gr3-rsvp-success',
                            }}
                            labels={{
                                attending: '🌟 Ya, Saya Hadir!',
                                notAttending: '🌥️ Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '✨ Kirim Konfirmasi ✨',
                                successTitle: '🌙 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di malam penuh bintang nanti!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="gr3-section gr3-wishes-bg">
                        <h2 className="gr3-section-title gr3-anim-up">Doa &amp; Harapan</h2>
                        <div className="gr3-divider gr3-anim-up">
                            <span>🔮</span>
                        </div>
                        <p className="gr3-section-sub gr3-anim-up">Tulis tebakanmu, doa, atau harapan terbaik untuk si kecil yang dinanti</p>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'gr3-wishes-layout',
                                formBox: 'gr3-wishes-form',
                                formTitle: 'gr3-wishes-form-title',
                                nameInput: 'gr3-wish-input',
                                messageInput: 'gr3-wish-input',
                                submitBtn: 'gr3-wish-btn',
                                wishCard: 'gr3-wish-card',
                                wishAvatar: 'gr3-wish-avatar',
                                wishName: 'gr3-wish-name',
                                wishDate: 'gr3-wish-date',
                                wishMessage: 'gr3-wish-message',
                                loadMoreBtn: 'gr3-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="gr3-closing">
                        <div className="gr3-closing-stars" aria-hidden="true">
                            {NIGHT_STARS.slice(0, 8).map((s, i) => (
                                <span
                                    key={i}
                                    className="gr3-star"
                                    style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: s.duration, animationDelay: s.delay }}
                                >
                                    ✦
                                </span>
                            ))}
                        </div>
                        <div className="gr3-closing-moon" aria-hidden="true">
                            🌙
                        </div>
                        <div className="gr3-closing-frame gr3-anim-up">
                            <p className="gr3-closing-emoji">🌙⭐🤍</p>
                            <p className="gr3-closing-title">Terima Kasih</p>
                            <p className="gr3-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="gr3-closing-from">Dengan penuh cinta,</p>
                            {parentsNames && <p className="gr3-closing-name">{parentsNames}</p>}
                            <div className="gr3-closing-line" />
                            <p className="gr3-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--gr3-lilac)', border: '2px solid #fff', color: 'var(--gr3-navy-2)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="gr3-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="gr3-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
