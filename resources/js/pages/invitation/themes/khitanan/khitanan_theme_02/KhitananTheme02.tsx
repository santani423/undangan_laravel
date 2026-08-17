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
import './khitanan-theme-02.css';

interface KhitananTheme02Props {
    invitation: KhitananInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '👑', '🏰', '✨', '🍽️', '⭐'];

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

export default function KhitananTheme02({ invitation, visitor, greeting }: KhitananTheme02Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('kt2-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.kt2-anim-up').forEach((el) => observer.observe(el));
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
        <div className="kt2-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Amiri:ital@0;1&family=Mulish:wght@300;400;600;700&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`kt2-overlay${opened ? ' hide' : ''}`}>
                    <span className="kt2-deco kt2-deco-cloud" style={{ top: '10%', left: '8%' }}>
                        ☁️
                    </span>
                    <span className="kt2-deco kt2-deco-sparkle" style={{ top: '16%', right: '10%', animationDelay: '-1s' }}>
                        ✨
                    </span>
                    <span className="kt2-deco kt2-deco-cloud" style={{ bottom: '14%', right: '9%', animationDelay: '-6s' }}>
                        ☁️
                    </span>
                    <span className="kt2-deco kt2-deco-sparkle" style={{ bottom: '18%', left: '11%', animationDelay: '-2s' }}>
                        ⭐
                    </span>
                    <div className="kt2-overlay-frame">
                        <div className="kt2-corner-tr" />
                        <div className="kt2-corner-bl" />
                        <div className="kt2-overlay-crown">👑</div>
                        <p className="kt2-overlay-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                        <div className="kt2-overlay-divider" />
                        <p className="kt2-overlay-label">Walimatul Khitan</p>
                        <div className="kt2-overlay-name">{invitation.childName}</div>
                        <div className="kt2-overlay-divider" />
                        <p className="kt2-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="kt2-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="kt2-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="kt2-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="kt2-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 20px' }}>
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '8px', border: '3px solid rgba(242,226,168,0.6)' }}
                                />
                                <p style={{ color: 'rgba(242,226,168,0.55)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1.5px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="kt2-btn-open" onClick={openInvitation}>
                            👑 {greeting?.buttonText ?? 'Buka Undangan'} 👑
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`kt2-main${opened ? ' visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="kt2-hero">
                    <span className="kt2-deco kt2-deco-cloud" style={{ top: '9%', left: '7%' }}>
                        ☁️
                    </span>
                    <span className="kt2-deco kt2-deco-sparkle" style={{ top: '15%', right: '9%', animationDelay: '-1.4s' }}>
                        ✨
                    </span>
                    <span className="kt2-deco kt2-deco-cloud" style={{ bottom: '12%', right: '8%', animationDelay: '-7s' }}>
                        ☁️
                    </span>
                    <span className="kt2-castle-silhouette" aria-hidden="true">
                        🏰
                    </span>
                    <div className="kt2-hero-frame kt2-anim-up">
                        <p className="kt2-hero-label">Walimatul Khitan</p>
                        <h1 className="kt2-hero-name">{invitation.childName}</h1>
                        <div className="kt2-hero-photo-wrap">
                            <span className="kt2-crown">👑</span>
                            <div className="kt2-hero-photo-arch">
                                <div
                                    className="kt2-hero-photo"
                                    style={
                                        childPhoto
                                            ? { backgroundImage: `url(${childPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!childPhoto && invitation.childName?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        {invitation.childAge && <p className="kt2-hero-sub">Genap berusia {formatAge(invitation.childAge)}</p>}
                        <p className="kt2-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="kt2-countdown"
                                boxClassName="kt2-countdown-box"
                                numClassName="kt2-countdown-num"
                                labelClassName="kt2-countdown-label"
                            />
                        )}
                        <div className="kt2-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── OPENING MESSAGE ──────────────────────────────────────────────── */}
                <section className="kt2-bismillah">
                    <p className="kt2-bismillah-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                    <div className="kt2-gold-line" />
                    {invitation.openingMessage && <p className="kt2-message-text kt2-anim-up">{invitation.openingMessage}</p>}
                    <div className="kt2-gold-line" />
                </section>

                {/* ── CHILD PROFILE ─────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="kt2-section kt2-profile">
                        <h2 className="kt2-section-title kt2-anim-up">Ananda Tersayang</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>👑</span>
                        </div>
                        <div className="kt2-profile-card kt2-anim-up">
                            <div className="kt2-profile-photo-arch">
                                <div
                                    className="kt2-profile-photo"
                                    style={
                                        childPhoto
                                            ? { backgroundImage: `url(${childPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!childPhoto && invitation.childName?.charAt(0)}
                                </div>
                            </div>
                            <h3 className="kt2-profile-name">{invitation.childName}</h3>
                            {invitation.childAge && <p className="kt2-profile-age">{formatAge(invitation.childAge)}</p>}
                            {parentsLine && <p className="kt2-profile-parents">Ananda putra dari {parentsLine}</p>}
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="kt2-section kt2-events-bg">
                        <h2 className="kt2-section-title light kt2-anim-up">Rangkaian Acara</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>🏰</span>
                        </div>
                        <div className="kt2-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="kt2-event-card kt2-anim-up">
                                        <span className="kt2-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="kt2-event-name">{ev.name}</h3>
                                        <div className="kt2-event-divider" />
                                        <p className="kt2-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="kt2-event-detail">{timeStr}</p>}
                                        <div className="kt2-event-divider" />
                                        {ev.locationName && (
                                            <p className="kt2-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="kt2-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '25px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="kt2-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="kt2-btn-event" onClick={() => addToCalendar(ev)}>
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
                            <section className="kt2-section">
                                <h2 className="kt2-section-title kt2-anim-up">Lokasi Acara</h2>
                                <div className="kt2-divider kt2-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p
                                        style={{
                                            textAlign: 'center',
                                            color: 'var(--kt2-gold)',
                                            fontSize: '1rem',
                                            marginBottom: '8px',
                                            fontStyle: 'italic',
                                        }}
                                        className="kt2-anim-up"
                                    >
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div style={{ maxWidth: '900px', margin: '0 auto' }} className="kt2-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="kt2-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="kt2-btn-maps">
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
                    <section className="kt2-section kt2-gallery-bg">
                        <h2 className="kt2-section-title kt2-anim-up">Galeri Foto</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'kt2-gallery-grid',
                                item: 'kt2-gallery-item',
                                thumb: 'kt2-gallery-thumb',
                                overlay: 'kt2-gallery-overlay',
                                filterBar: 'kt2-gallery-filter-bar',
                                filterBtn: 'kt2-filter-btn',
                                filterBtnActive: 'kt2-filter-btn kt2-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && childVideoEmbedUrl && (
                    <section className="kt2-section">
                        <h2 className="kt2-section-title kt2-anim-up">Video Kenangan</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="kt2-video-frame kt2-anim-up">
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
                    <section className="kt2-section">
                        <h2 className="kt2-section-title kt2-anim-up">Amplop Digital</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>💌</span>
                        </div>
                        <p className="kt2-wallet-subtitle kt2-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                            kasih, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'kt2-bank-grid',
                                bankCard: 'kt2-bank-card',
                                bankLogo: 'kt2-bank-logo',
                                bankType: 'kt2-bank-type',
                                bankNumber: 'kt2-bank-number',
                                bankName: 'kt2-bank-name',
                                copyBankBtn: 'kt2-btn-copy-bank',
                                ewalletGrid: 'kt2-ewallet-grid',
                                ewalletCard: 'kt2-ewallet-card',
                                ewalletName: 'kt2-ewallet-name',
                                ewalletPhone: 'kt2-ewallet-phone',
                                copyEwalletBtn: 'kt2-btn-copy-ewallet',
                                ewalletTitle: 'kt2-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="kt2-section">
                        <h2 className="kt2-section-title kt2-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'kt2-rsvp-form',
                                label: 'kt2-rsvp-label',
                                input: 'kt2-rsvp-input',
                                select: 'kt2-rsvp-select',
                                textarea: 'kt2-rsvp-textarea',
                                radioGroup: 'kt2-rsvp-radio-group',
                                radioLabel: 'kt2-rsvp-radio-label',
                                errorText: 'kt2-rsvp-error',
                                submitBtn: 'kt2-rsvp-submit',
                                successBox: 'kt2-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="kt2-section kt2-wishes-bg">
                        <h2 className="kt2-section-title kt2-anim-up">Doa &amp; Ucapan</h2>
                        <div className="kt2-divider kt2-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'kt2-wishes-layout',
                                formBox: 'kt2-wishes-form',
                                formTitle: 'kt2-wishes-form-title',
                                nameInput: 'kt2-wish-input',
                                messageInput: 'kt2-wish-input',
                                submitBtn: 'kt2-wish-btn',
                                wishCard: 'kt2-wish-card',
                                wishAvatar: 'kt2-wish-avatar',
                                wishName: 'kt2-wish-name',
                                wishDate: 'kt2-wish-date',
                                wishMessage: 'kt2-wish-message',
                                loadMoreBtn: 'kt2-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section className="kt2-closing">
                    <span className="kt2-deco kt2-deco-cloud" style={{ top: '10%', left: '9%' }}>
                        ☁️
                    </span>
                    <span className="kt2-deco kt2-deco-sparkle" style={{ top: '14%', right: '11%', animationDelay: '-1.6s' }}>
                        ✨
                    </span>
                    <span className="kt2-deco kt2-deco-sparkle" style={{ bottom: '16%', left: '10%', animationDelay: '-0.8s' }}>
                        ⭐
                    </span>
                    <div className="kt2-closing-frame kt2-anim-up">
                        <p className="kt2-closing-arabic">جَزَاكُمُ اللَّهُ خَيْرًا</p>
                        <div className="kt2-gold-line" />
                        <p className="kt2-closing-title">Terima Kasih</p>
                        <div className="kt2-gold-line" />
                        <p className="kt2-closing-sub">
                            Atas segala doa dan kehadiran
                            <br />
                            Bapak/Ibu/Saudara/i
                            <br />
                            yang kami muliakan.
                        </p>
                        <p className="kt2-closing-from">Kami yang berbahagia,</p>
                        <p className="kt2-closing-name">{invitation.childName}</p>
                        {parentsLine && <p className="kt2-closing-family">Keluarga {parentsLine}</p>}
                        <div className="kt2-gold-line" />
                        <p className="kt2-closing-moon">☾</p>
                        <p className="kt2-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--kt2-green)', border: '1px solid var(--kt2-gold)', color: 'var(--kt2-gold)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="kt2-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="kt2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
