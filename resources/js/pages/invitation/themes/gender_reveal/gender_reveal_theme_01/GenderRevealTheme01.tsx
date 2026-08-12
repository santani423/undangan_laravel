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
import './gender-reveal-theme-01.css';

interface GenderRevealTheme01Props {
    invitation: GenderRevealInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const CONFETTI_COLORS = ['#FF5F96', '#3FB6E8', '#FFC94D', '#FF9FC4', '#8AD4F2'];
const EVENT_ICONS = ['🎈', '👶', '🍼', '🎊', '✨', '🧸'];

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

export default function GenderRevealTheme01({ invitation, visitor, greeting }: GenderRevealTheme01Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('gr1-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.gr1-anim-up').forEach((el) => observer.observe(el));
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
            Array.from({ length: 40 }, () => ({
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
    const showVersus = Boolean(invitation.teamAName && invitation.teamBName);

    return (
        <div className="gr1-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`gr1-cover${opened ? ' gr1-hide' : ''}`}>
                    {confettiEnabled && (
                        <div className="gr1-confetti-bg" aria-hidden="true">
                            {confettiPieces.map((p, i) => (
                                <span
                                    key={i}
                                    className="gr1-confetti-piece"
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

                    <div className="gr1-cover-card">
                        <span className="gr1-cover-tag">👶 Gender Reveal Party 👶</span>
                        <p className="gr1-cover-subtitle">Kami mengundang Bapak/Ibu/Saudara/i untuk merayakan momen penantian kami</p>
                        {parentsNames && <h1 className="gr1-cover-name">{parentsNames}</h1>}
                        {invitation.dueDateFormatted && <div className="gr1-cover-due-badge">🤰 HPL {invitation.dueDateFormatted}</div>}
                        {invitation.mainDateFormatted && <p className="gr1-cover-date">📅 {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="gr1-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="gr1-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="gr1-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="gr1-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(255,255,255,0.65)' }} />
                                <p className="gr1-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="gr1-btn-open" onClick={openInvitation}>
                            🎈 {greeting?.buttonText ?? 'Buka Undangan'} 🎈
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`gr1-main${opened ? ' gr1-main-visible' : ''}`}>
                {/* HERO */}
                <section className="gr1-hero">
                    {confettiEnabled && (
                        <div className="gr1-hero-balloons" aria-hidden="true">
                            <span className="gr1-balloon gr1-balloon-blue gr1-balloon-0">🎈</span>
                            <span className="gr1-balloon gr1-balloon-pink gr1-balloon-1">🎈</span>
                            <span className="gr1-balloon gr1-balloon-blue gr1-balloon-2">🎈</span>
                        </div>
                    )}
                    <div className="gr1-hero-inner gr1-anim-up">
                        <p className="gr1-hero-label">✨ Gender Reveal Party ✨</p>
                        <div className="gr1-hero-photo-wrap">
                            <div
                                className="gr1-hero-photo"
                                style={parentsPhoto ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!parentsPhoto && '🤰'}
                            </div>
                            <div className="gr1-hero-mystery-burst">?</div>
                        </div>
                        {parentsNames && <h1 className="gr1-hero-name">{parentsNames}</h1>}
                        <p className="gr1-hero-tagline">"Laki-laki atau perempuan? Rahasianya akan segera terungkap!"</p>
                        {invitation.mainDateFormatted && <p className="gr1-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="gr1-countdown"
                                boxClassName="gr1-countdown-box"
                                numClassName="gr1-countdown-num"
                                labelClassName="gr1-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="gr1-countdown-done">
                                        <div className="gr1-countdown-done-emoji">🎉</div>
                                        <h3>Saatnya Terungkap!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="gr1-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* OPENING MESSAGE */}
                {invitation.openingMessage && (
                    <section className="gr1-message-section">
                        <div className="gr1-message-quote">"</div>
                        <p className="gr1-message-text gr1-anim-up">{invitation.openingMessage}</p>
                    </section>
                )}

                {/* PARENTS / REVEAL PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="gr1-section gr1-profile-bg">
                        <h2 className="gr1-section-title gr1-anim-up">Ayah &amp; Bunda</h2>
                        <div className="gr1-divider gr1-anim-up">
                            <span>👶</span>
                        </div>
                        <div className="gr1-profile-card gr1-anim-up">
                            <div className="gr1-profile-photo-frame">
                                <div
                                    className="gr1-profile-photo"
                                    style={parentsPhoto ? { backgroundImage: `url(${parentsPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!parentsPhoto && '🤰'}
                                </div>
                            </div>
                            {parentsNames && <h3 className="gr1-profile-name">{parentsNames}</h3>}
                            {parentsLine && <p className="gr1-profile-line">{parentsLine}</p>}
                            {(invitation.dueDateFormatted || invitation.revealDateFormatted) && (
                                <div className="gr1-profile-tags">
                                    {invitation.dueDateFormatted && <span className="gr1-profile-tag">🤰 HPL {invitation.dueDateFormatted}</span>}
                                    {invitation.revealDateFormatted && <span className="gr1-profile-tag">🎉 Reveal {invitation.revealDateFormatted}</span>}
                                </div>
                            )}
                        </div>

                        {showVersus && (
                            <>
                                <div className="gr1-versus-card gr1-anim-up">
                                    <div className="gr1-versus-side gr1-versus-a">
                                        <span className="gr1-versus-emoji">🔵</span>
                                        <p className="gr1-versus-kubu">Kubu Satu</p>
                                        <h3 className="gr1-versus-team">{invitation.teamAName}</h3>
                                    </div>
                                    <div className="gr1-versus-vs">
                                        <span>VS</span>
                                    </div>
                                    <div className="gr1-versus-side gr1-versus-b">
                                        <span className="gr1-versus-emoji">💗</span>
                                        <p className="gr1-versus-kubu">Kubu Dua</p>
                                        <h3 className="gr1-versus-team">{invitation.teamBName}</h3>
                                    </div>
                                </div>
                                <p className="gr1-versus-caption gr1-anim-up">
                                    Yuk, ramaikan dan dukung jagoanmu — jawabannya baru akan terungkap di hari bahagia itu!
                                </p>
                            </>
                        )}
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="gr1-section gr1-events-bg">
                        <h2 className="gr1-section-title gr1-light gr1-anim-up">Rangkaian Acara</h2>
                        <div className="gr1-divider gr1-light gr1-anim-up">
                            <span>🎊</span>
                        </div>
                        <div className="gr1-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="gr1-event-card gr1-anim-up">
                                        <span className="gr1-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="gr1-event-name">{ev.name}</h3>
                                        <div className="gr1-event-divider" />
                                        <p className="gr1-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="gr1-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="gr1-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr1-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="gr1-btn-event" onClick={() => addToCalendar(ev)}>
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
                            <section className="gr1-section">
                                <h2 className="gr1-section-title gr1-anim-up">Lokasi Acara</h2>
                                <div className="gr1-divider gr1-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="gr1-location-sub gr1-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="gr1-map-container gr1-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="gr1-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="gr1-btn-maps">
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
                    <section className="gr1-section gr1-gallery-bg">
                        <h2 className="gr1-section-title gr1-anim-up">Galeri Momen</h2>
                        <div className="gr1-divider gr1-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'gr1-gallery-grid',
                                item: 'gr1-gallery-item',
                                thumb: 'gr1-gallery-thumb',
                                overlay: 'gr1-gallery-overlay',
                                filterBar: 'gr1-gallery-filter-bar',
                                filterBtn: 'gr1-filter-btn',
                                filterBtnActive: 'gr1-filter-btn gr1-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="gr1-section">
                        <h2 className="gr1-section-title gr1-anim-up">Video Penantian</h2>
                        <div className="gr1-divider gr1-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="gr1-video-frame gr1-anim-up">
                            <iframe
                                src={videoEmbedUrl}
                                title="Video Penantian"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* DIGITAL GIFT */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="gr1-section gr1-gift-bg">
                        <h2 className="gr1-section-title gr1-light gr1-anim-up">Kado untuk Si Kecil</h2>
                        <div className="gr1-divider gr1-light gr1-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="gr1-gift-subtitle gr1-anim-up">
                            Kehadiran dan doa restu Bapak/Ibu/Saudara/i sudah menjadi hadiah yang paling berarti. Namun apabila ingin memberikan tanda
                            kasih untuk persiapan menyambut si kecil, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'gr1-bank-grid',
                                bankCard: 'gr1-bank-card',
                                bankLogo: 'gr1-bank-logo',
                                bankType: 'gr1-bank-type',
                                bankNumber: 'gr1-bank-number',
                                bankName: 'gr1-bank-name',
                                copyBankBtn: 'gr1-btn-copy-bank',
                                ewalletGrid: 'gr1-ewallet-grid',
                                ewalletCard: 'gr1-ewallet-card',
                                ewalletName: 'gr1-ewallet-name',
                                ewalletPhone: 'gr1-ewallet-phone',
                                copyEwalletBtn: 'gr1-btn-copy-ewallet',
                                ewalletTitle: 'gr1-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="gr1-section">
                        <h2 className="gr1-section-title gr1-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="gr1-divider gr1-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'gr1-rsvp-form',
                                label: 'gr1-rsvp-label',
                                input: 'gr1-rsvp-input',
                                select: 'gr1-rsvp-select',
                                textarea: 'gr1-rsvp-textarea',
                                radioGroup: 'gr1-rsvp-radio-group',
                                radioLabel: 'gr1-rsvp-radio-label',
                                errorText: 'gr1-rsvp-error',
                                submitBtn: 'gr1-rsvp-submit',
                                successBox: 'gr1-rsvp-success',
                            }}
                            labels={{
                                attending: '🎉 Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '✨ Kirim Konfirmasi ✨',
                                successTitle: '🎉 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di hari penuh kejutan nanti!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="gr1-section gr1-wishes-bg">
                        <h2 className="gr1-section-title gr1-anim-up">Tebakan &amp; Doa</h2>
                        <div className="gr1-divider gr1-anim-up">
                            <span>🔮</span>
                        </div>
                        <p className="gr1-section-sub gr1-anim-up">Tulis tebakanmu, semangatmu, atau doa terbaik untuk si kecil yang dinanti</p>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'gr1-wishes-layout',
                                formBox: 'gr1-wishes-form',
                                formTitle: 'gr1-wishes-form-title',
                                nameInput: 'gr1-wish-input',
                                messageInput: 'gr1-wish-input',
                                submitBtn: 'gr1-wish-btn',
                                wishCard: 'gr1-wish-card',
                                wishAvatar: 'gr1-wish-avatar',
                                wishName: 'gr1-wish-name',
                                wishDate: 'gr1-wish-date',
                                wishMessage: 'gr1-wish-message',
                                loadMoreBtn: 'gr1-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="gr1-closing">
                        <div className="gr1-closing-frame gr1-anim-up">
                            <p className="gr1-closing-emoji">🎈💙💗</p>
                            <p className="gr1-closing-title">Terima Kasih</p>
                            <p className="gr1-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="gr1-closing-from">Dengan penuh syukur,</p>
                            {parentsNames && <p className="gr1-closing-name">{parentsNames}</p>}
                            <div className="gr1-closing-line" />
                            <p className="gr1-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--gr1-pink)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="gr1-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="gr1-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
