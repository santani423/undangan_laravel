import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, KhitananInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './khitanan-theme-01.css';

interface KhitananTheme01Props {
    invitation: KhitananInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '🎉', '🎊', '🎈', '🍽️', '⭐'];

function addToCalendar(ev: KhitananInvitation['events'][0]) {
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

function formatAge(age: string): string {
    if (!age) return '';
    return /^\d+$/.test(age.trim()) ? `${age.trim()} Tahun` : age;
}

export default function KhitananTheme01({ invitation, visitor, greeting }: KhitananTheme01Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('kt1-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.kt1-anim-up').forEach((el) => observer.observe(el));
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

    const childPhoto = invitation.childPhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const childVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const parentsLine =
        invitation.fatherName && invitation.motherName
            ? `Bapak ${invitation.fatherName} & Ibu ${invitation.motherName}`
            : invitation.fatherName
              ? `Bapak ${invitation.fatherName}`
              : invitation.motherName
                ? `Ibu ${invitation.motherName}`
                : '';

    return (
        <div className="kt1-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`kt1-overlay${opened ? ' hide' : ''}`}>
                    <span className="kt1-overlay-cloud kt1-cloud-1">☁️</span>
                    <span className="kt1-overlay-cloud kt1-cloud-2">☁️</span>
                    <span className="kt1-overlay-cloud kt1-cloud-3">☁️</span>
                    <span className="kt1-overlay-cloud kt1-cloud-4">☁️</span>
                    <div className="kt1-overlay-frame">
                        <div className="kt1-overlay-badge">🏅</div>
                        <p className="kt1-overlay-salam">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                        <div className="kt1-overlay-divider" />
                        <p className="kt1-overlay-label">Undangan Khitanan</p>
                        <div className="kt1-overlay-name">{invitation.childName}</div>
                        <p className="kt1-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="kt1-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="kt1-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="kt1-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="kt1-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0 20px' }}>
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '16px', border: '4px solid rgba(255,255,255,0.5)' }}
                                />
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="kt1-btn-open" onClick={openInvitation}>
                            🎈 {greeting?.buttonText ?? 'Buka Undangan'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`kt1-main${opened ? ' visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="kt1-hero">
                    <span className="kt1-hero-cloud" style={{ top: '10%', left: '6%' }}>
                        ☁️
                    </span>
                    <span className="kt1-hero-cloud" style={{ top: '18%', right: '8%', animationDelay: '-4s' }}>
                        ☁️
                    </span>
                    <span className="kt1-hero-cloud" style={{ bottom: '14%', left: '10%', animationDelay: '-8s' }}>
                        ✈️
                    </span>
                    <div className="kt1-hero-frame kt1-anim-up">
                        <p className="kt1-hero-label">Undangan Khitanan</p>
                        <h1 className="kt1-hero-name">{invitation.childName}</h1>
                        <div className="kt1-hero-photo-wrap">
                            <div
                                className="kt1-hero-photo"
                                style={
                                    childPhoto ? { backgroundImage: `url(${childPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                }
                            >
                                {!childPhoto && invitation.childName?.charAt(0)}
                            </div>
                            <span className="kt1-hero-badge">🏅</span>
                        </div>
                        {invitation.childAge && <div className="kt1-hero-age">🎂 {formatAge(invitation.childAge)}</div>}
                        <p className="kt1-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="kt1-countdown"
                                boxClassName="kt1-countdown-box"
                                numClassName="kt1-countdown-num"
                                labelClassName="kt1-countdown-label"
                            />
                        )}
                        <div className="kt1-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── OPENING MESSAGE ──────────────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="kt1-message">
                        <div className="kt1-message-icon">✉️</div>
                        <p className="kt1-message-text kt1-anim-up">{invitation.openingMessage}</p>
                    </section>
                )}

                {/* ── CHILD PROFILE ─────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="kt1-section kt1-profile">
                        <h2 className="kt1-section-title kt1-anim-up">Sang Jagoan Cilik</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>🎈</span>
                        </div>
                        <div className="kt1-profile-card kt1-anim-up">
                            <div
                                className="kt1-profile-photo"
                                style={
                                    childPhoto ? { backgroundImage: `url(${childPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                }
                            >
                                {!childPhoto && invitation.childName?.charAt(0)}
                            </div>
                            <h3 className="kt1-profile-name">{invitation.childName}</h3>
                            {invitation.childAge && <p className="kt1-profile-age">{formatAge(invitation.childAge)}</p>}
                            {parentsLine && <p className="kt1-profile-parents">Ananda putra dari {parentsLine}</p>}
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="kt1-section kt1-events-bg">
                        <h2 className="kt1-section-title light kt1-anim-up">Rangkaian Acara</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>🎊</span>
                        </div>
                        <div className="kt1-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="kt1-event-card kt1-anim-up">
                                        <span className="kt1-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="kt1-event-name">{ev.name}</h3>
                                        <div className="kt1-event-divider" />
                                        <p className="kt1-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="kt1-event-detail">{timeStr}</p>}
                                        <div className="kt1-event-divider" />
                                        {ev.locationName && (
                                            <p className="kt1-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="kt1-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="kt1-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="kt1-btn-event" onClick={() => addToCalendar(ev)}>
                                                📅 Kalender
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
                            <section className="kt1-section">
                                <h2 className="kt1-section-title kt1-anim-up">Lokasi Acara</h2>
                                <div className="kt1-divider kt1-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p style={{ textAlign: 'center', color: 'var(--kt1-blue)', fontSize: '1rem', marginBottom: '8px', fontWeight: 700 }} className="kt1-anim-up">
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div style={{ maxWidth: '900px', margin: '0 auto' }} className="kt1-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="kt1-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="kt1-btn-maps">
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
                    <section className="kt1-section kt1-gallery-bg">
                        <h2 className="kt1-section-title kt1-anim-up">Momen Seru</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'kt1-gallery-grid',
                                item: 'kt1-gallery-item',
                                thumb: 'kt1-gallery-thumb',
                                overlay: 'kt1-gallery-overlay',
                                filterBar: 'kt1-gallery-filter-bar',
                                filterBtn: 'kt1-filter-btn',
                                filterBtnActive: 'kt1-filter-btn kt1-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && childVideoEmbedUrl && (
                    <section className="kt1-section">
                        <h2 className="kt1-section-title kt1-anim-up">Video Kenangan</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="kt1-video-frame kt1-anim-up">
                            <iframe
                                src={childVideoEmbedUrl}
                                title="Video Kenangan"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* ── DIGITAL WALLET ────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="kt1-section">
                        <h2 className="kt1-section-title kt1-anim-up">Kado & Amplop Digital</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="kt1-wallet-subtitle kt1-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan kado yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda kasih,
                            kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'kt1-bank-grid',
                                bankCard: 'kt1-bank-card',
                                bankLogo: 'kt1-bank-logo',
                                bankType: 'kt1-bank-type',
                                bankNumber: 'kt1-bank-number',
                                bankName: 'kt1-bank-name',
                                copyBankBtn: 'kt1-btn-copy-bank',
                                ewalletGrid: 'kt1-ewallet-grid',
                                ewalletCard: 'kt1-ewallet-card',
                                ewalletName: 'kt1-ewallet-name',
                                ewalletPhone: 'kt1-ewallet-phone',
                                copyEwalletBtn: 'kt1-btn-copy-ewallet',
                                ewalletTitle: 'kt1-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="kt1-section">
                        <h2 className="kt1-section-title kt1-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'kt1-rsvp-form',
                                label: 'kt1-rsvp-label',
                                input: 'kt1-rsvp-input',
                                select: 'kt1-rsvp-select',
                                textarea: 'kt1-rsvp-textarea',
                                radioGroup: 'kt1-rsvp-radio-group',
                                radioLabel: 'kt1-rsvp-radio-label',
                                errorText: 'kt1-rsvp-error',
                                submitBtn: 'kt1-rsvp-submit',
                                successBox: 'kt1-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="kt1-section kt1-wishes-bg">
                        <h2 className="kt1-section-title kt1-anim-up">Doa &amp; Ucapan</h2>
                        <div className="kt1-divider kt1-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'kt1-wishes-layout',
                                formBox: 'kt1-wishes-form',
                                formTitle: 'kt1-wishes-form-title',
                                nameInput: 'kt1-wish-input',
                                messageInput: 'kt1-wish-input',
                                submitBtn: 'kt1-wish-btn',
                                wishCard: 'kt1-wish-card',
                                wishAvatar: 'kt1-wish-avatar',
                                wishName: 'kt1-wish-name',
                                wishDate: 'kt1-wish-date',
                                wishMessage: 'kt1-wish-message',
                                loadMoreBtn: 'kt1-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section className="kt1-closing">
                    <span className="kt1-hero-cloud" style={{ top: '12%', left: '10%' }}>
                        ☁️
                    </span>
                    <span className="kt1-hero-cloud" style={{ bottom: '16%', right: '10%', animationDelay: '-5s' }}>
                        ☁️
                    </span>
                    <div className="kt1-closing-frame kt1-anim-up">
                        <div className="kt1-closing-icon">🏅</div>
                        <p className="kt1-closing-title">Terima Kasih</p>
                        <p className="kt1-closing-sub">
                            Atas segala doa dan kehadiran
                            <br />
                            Bapak/Ibu/Saudara/i
                            <br />
                            yang kami muliakan.
                        </p>
                        <p className="kt1-closing-from">Kami yang berbahagia,</p>
                        <p className="kt1-closing-name">{invitation.childName}</p>
                        {parentsLine && <p className="kt1-closing-family">Keluarga {parentsLine}</p>}
                        <p className="kt1-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--kt1-blue)', color: 'white' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="kt1-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="kt1-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
