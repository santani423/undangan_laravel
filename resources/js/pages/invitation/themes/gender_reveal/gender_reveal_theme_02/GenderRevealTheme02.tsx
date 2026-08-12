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
import './gender-reveal-theme-02.css';

interface GenderRevealTheme02Props {
    invitation: GenderRevealInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const CONFETTI_COLORS = ['#8B5FBF', '#F0B429', '#C9A9E8', '#FFE6A8', '#B489DE'];
const BALLOON_EMOJI = ['🎈', '🎈', '🎈', '🎈'];
const EVENT_ICONS = ['🎈', '🎊', '🎉', '🍭', '🧁', '✨'];

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

export default function GenderRevealTheme02({ invitation, visitor, greeting }: GenderRevealTheme02Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('gr2-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.gr2-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic confetti pieces (regenerated once)
    const confettiPieces = useMemo(
        () =>
            Array.from({ length: 45 }, () => ({
                left: Math.random() * 100,
                size: 6 + Math.random() * 8,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: Math.random() * 5,
                duration: 4 + Math.random() * 4,
                rotate: Math.round(Math.random() * 360),
                shape: Math.random() > 0.5 ? '50%' : '3px',
            })),
        [],
    );

    const parentsPhoto = invitation.parentsPhoto;
    const fatherName = invitation.fatherName;
    const motherName = invitation.motherName;
    const parentsNames = fatherName && motherName ? `${fatherName} & ${motherName}` : fatherName || motherName || '';
    const parentsLine = fatherName && motherName ? `Ayah ${fatherName} & Bunda ${motherName}` : fatherName ? `Ayah ${fatherName}` : motherName ? `Bunda ${motherName}` : '';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const showTeams = Boolean(invitation.teamAName && invitation.teamBName);

    return (
        <div className="gr2-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`gr2-cover${opened ? ' gr2-hide' : ''}`}>
                    {confettiEnabled && (
                        <div className="gr2-confetti-bg" aria-hidden="true">
                            {confettiPieces.map((p, i) => (
                                <span
                                    key={i}
                                    className="gr2-confetti-piece"
                                    style={{
                                        left: `${p.left}%`,
                                        width: p.size,
                                        height: p.size,
                                        background: p.color,
                                        borderRadius: p.shape,
                                        animationDelay: `${p.delay}s`,
                                        animationDuration: `${p.duration}s`,
                                        transform: `rotate(${p.rotate}deg)`,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="gr2-cover-garland" aria-hidden="true" />

                    <div className="gr2-cover-card">
                        <span className="gr2-cover-tag">🎈 Kejutan Spesial Segera Tiba 🎈</span>
                        <p className="gr2-cover-subtitle">Yuk, rayakan momen penuh kejutan dan sukacita bersama kami</p>
                        {parentsNames && <h1 className="gr2-cover-name">{parentsNames}</h1>}
                        {invitation.dueDateFormatted && <div className="gr2-cover-due-badge">🤰 HPL {invitation.dueDateFormatted}</div>}
                        {invitation.mainDateFormatted && <p className="gr2-cover-date">📅 {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="gr2-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="gr2-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="gr2-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="gr2-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(255,255,255,0.65)' }} />
                                <p className="gr2-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="gr2-btn-open" onClick={openInvitation}>
                            🎈 {greeting?.buttonText ?? 'Buka Undangan'} 🎈
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`gr2-main${opened ? ' gr2-main-visible' : ''}`}>
                {/* HERO */}
                <section className="gr2-hero">
                    {confettiEnabled && (
                        <div className="gr2-hero-balloons" aria-hidden="true">
                            {BALLOON_EMOJI.map((b, i) => (
                                <span key={i} className={`gr2-balloon gr2-balloon-${i}`}>
                                    {b}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="gr2-hero-inner gr2-anim-up">
                        <p className="gr2-hero-label">✨ Balloon Reveal Party ✨</p>
                        <div className="gr2-hero-photo-wrap">
                            <div
                                className="gr2-hero-photo"
                                style={parentsPhoto ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!parentsPhoto && '🤰'}
                            </div>
                            <div className="gr2-hero-mystery-burst">❓</div>
                        </div>
                        {parentsNames && <h1 className="gr2-hero-name">{parentsNames}</h1>}
                        <p className="gr2-hero-tagline">"Satu kejutan istimewa sedang bersiap untuk pecah bersama sukacita!"</p>
                        {invitation.mainDateFormatted && <p className="gr2-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="gr2-countdown"
                                boxClassName="gr2-countdown-box"
                                numClassName="gr2-countdown-num"
                                labelClassName="gr2-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="gr2-countdown-done">
                                        <div className="gr2-countdown-done-emoji">🎉</div>
                                        <h3>Saatnya Pesta Dimulai!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="gr2-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* OPENING MESSAGE */}
                {invitation.openingMessage && (
                    <section className="gr2-message-section">
                        {confettiEnabled && (
                            <div className="gr2-message-balloons" aria-hidden="true">
                                <span className="gr2-message-balloon">🎈</span>
                                <span className="gr2-message-balloon gr2-message-balloon-2">🎈</span>
                            </div>
                        )}
                        <div className="gr2-message-quote">"</div>
                        <p className="gr2-message-text gr2-anim-up">{invitation.openingMessage}</p>
                    </section>
                )}

                {/* PARENTS / REVEAL PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="gr2-section gr2-profile-bg">
                        <h2 className="gr2-section-title gr2-anim-up">Calon Ayah &amp; Bunda</h2>
                        <div className="gr2-divider gr2-anim-up">
                            <span>🎈</span>
                        </div>
                        <div className="gr2-profile-card gr2-anim-up">
                            <div className="gr2-profile-photo-frame">
                                <div
                                    className="gr2-profile-photo"
                                    style={parentsPhoto ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!parentsPhoto && '🤰'}
                                </div>
                            </div>
                            {parentsNames && <h3 className="gr2-profile-name">{parentsNames}</h3>}
                            {parentsLine && <p className="gr2-profile-line">{parentsLine}</p>}
                            {(invitation.dueDateFormatted || invitation.revealDateFormatted) && (
                                <div className="gr2-profile-tags">
                                    {invitation.dueDateFormatted && <span className="gr2-profile-tag">🤰 HPL {invitation.dueDateFormatted}</span>}
                                    {invitation.revealDateFormatted && <span className="gr2-profile-tag">🎉 Reveal {invitation.revealDateFormatted}</span>}
                                </div>
                            )}
                        </div>

                        {showTeams && (
                            <>
                                <div className="gr2-teams-row gr2-anim-up">
                                    <div className="gr2-team-chip">
                                        <span className="gr2-team-emoji">🎈</span>
                                        <span className="gr2-team-name">{invitation.teamAName}</span>
                                    </div>
                                    <span className="gr2-team-amp">&amp;</span>
                                    <div className="gr2-team-chip">
                                        <span className="gr2-team-emoji">🎈</span>
                                        <span className="gr2-team-name">{invitation.teamBName}</span>
                                    </div>
                                </div>
                                <p className="gr2-teams-caption gr2-anim-up">
                                    Dua kubu, satu kebahagiaan — ramaikan pesta dan tunjukkan semangatmu untuk menyambut si kecil!
                                </p>
                            </>
                        )}
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="gr2-section gr2-events-bg">
                        <h2 className="gr2-section-title gr2-light gr2-anim-up">Rangkaian Acara</h2>
                        <div className="gr2-divider gr2-light gr2-anim-up">
                            <span>🎊</span>
                        </div>
                        <div className="gr2-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="gr2-event-card gr2-anim-up">
                                        <span className="gr2-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="gr2-event-name">{ev.name}</h3>
                                        <div className="gr2-event-divider" />
                                        <p className="gr2-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="gr2-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="gr2-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr2-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="gr2-btn-event" onClick={() => addToCalendar(ev)}>
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
                            <section className="gr2-section">
                                <h2 className="gr2-section-title gr2-anim-up">Lokasi Acara</h2>
                                <div className="gr2-divider gr2-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="gr2-location-sub gr2-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="gr2-map-container gr2-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="gr2-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr2-btn-maps">
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
                    <section className="gr2-section gr2-gallery-bg">
                        <h2 className="gr2-section-title gr2-anim-up">Galeri Keseruan</h2>
                        <div className="gr2-divider gr2-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'gr2-gallery-grid',
                                item: 'gr2-gallery-item',
                                thumb: 'gr2-gallery-thumb',
                                overlay: 'gr2-gallery-overlay',
                                filterBar: 'gr2-gallery-filter-bar',
                                filterBtn: 'gr2-filter-btn',
                                filterBtnActive: 'gr2-filter-btn gr2-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="gr2-section">
                        <h2 className="gr2-section-title gr2-anim-up">Video Kebahagiaan</h2>
                        <div className="gr2-divider gr2-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="gr2-video-frame gr2-anim-up">
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
                    <section className="gr2-section gr2-gift-bg">
                        <h2 className="gr2-section-title gr2-light gr2-anim-up">Kado Baby Shower</h2>
                        <div className="gr2-divider gr2-light gr2-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="gr2-gift-subtitle gr2-anim-up">
                            Kehadiran dan doa restu Bapak/Ibu/Saudara/i sudah menjadi hadiah yang paling berarti. Namun apabila ingin memberikan tanda
                            kasih untuk persiapan menyambut si kecil, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'gr2-bank-grid',
                                bankCard: 'gr2-bank-card',
                                bankLogo: 'gr2-bank-logo',
                                bankType: 'gr2-bank-type',
                                bankNumber: 'gr2-bank-number',
                                bankName: 'gr2-bank-name',
                                copyBankBtn: 'gr2-btn-copy-bank',
                                ewalletGrid: 'gr2-ewallet-grid',
                                ewalletCard: 'gr2-ewallet-card',
                                ewalletName: 'gr2-ewallet-name',
                                ewalletPhone: 'gr2-ewallet-phone',
                                copyEwalletBtn: 'gr2-btn-copy-ewallet',
                                ewalletTitle: 'gr2-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="gr2-section">
                        <h2 className="gr2-section-title gr2-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="gr2-divider gr2-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'gr2-rsvp-form',
                                label: 'gr2-rsvp-label',
                                input: 'gr2-rsvp-input',
                                select: 'gr2-rsvp-select',
                                textarea: 'gr2-rsvp-textarea',
                                radioGroup: 'gr2-rsvp-radio-group',
                                radioLabel: 'gr2-rsvp-radio-label',
                                errorText: 'gr2-rsvp-error',
                                submitBtn: 'gr2-rsvp-submit',
                                successBox: 'gr2-rsvp-success',
                            }}
                            labels={{
                                attending: '🎈 Ya, Saya Hadir!',
                                notAttending: '💐 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '🎊 Kirim Konfirmasi 🎊',
                                successTitle: '🎉 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di pesta penuh kejutan nanti!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="gr2-section gr2-wishes-bg">
                        <h2 className="gr2-section-title gr2-anim-up">Tebakan &amp; Doa</h2>
                        <div className="gr2-divider gr2-anim-up">
                            <span>🔮</span>
                        </div>
                        <p className="gr2-section-sub gr2-anim-up">Tulis tebakanmu, semangatmu, atau doa terbaik untuk si kecil yang dinanti</p>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'gr2-wishes-layout',
                                formBox: 'gr2-wishes-form',
                                formTitle: 'gr2-wishes-form-title',
                                nameInput: 'gr2-wish-input',
                                messageInput: 'gr2-wish-input',
                                submitBtn: 'gr2-wish-btn',
                                wishCard: 'gr2-wish-card',
                                wishAvatar: 'gr2-wish-avatar',
                                wishName: 'gr2-wish-name',
                                wishDate: 'gr2-wish-date',
                                wishMessage: 'gr2-wish-message',
                                loadMoreBtn: 'gr2-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="gr2-closing">
                        {confettiEnabled && (
                            <div className="gr2-closing-balloons" aria-hidden="true">
                                <span className="gr2-closing-balloon">🎈</span>
                                <span className="gr2-closing-balloon gr2-closing-balloon-2">🎈</span>
                                <span className="gr2-closing-balloon gr2-closing-balloon-3">🎈</span>
                            </div>
                        )}
                        <div className="gr2-closing-frame gr2-anim-up">
                            <p className="gr2-closing-emoji">🎈🎊💜</p>
                            <p className="gr2-closing-title">Terima Kasih</p>
                            <p className="gr2-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="gr2-closing-from">Dengan penuh sukacita,</p>
                            {parentsNames && <p className="gr2-closing-name">{parentsNames}</p>}
                            <div className="gr2-closing-line" />
                            <p className="gr2-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--gr2-purple)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="gr2-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="gr2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
