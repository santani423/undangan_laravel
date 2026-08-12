import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, SyukuranInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './syukuran-theme-02.css';

interface SyukuranTheme02Props {
    invitation: SyukuranInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🍽️', '🌅', '🤲', '🐚', '☀️', '🌊'];

function addToCalendar(ev: SyukuranInvitation['events'][0]) {
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

export default function SyukuranTheme02({ invitation, visitor, greeting }: SyukuranTheme02Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('sy2-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.sy2-anim-up').forEach((el) => observer.observe(el));
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

    const hostPhoto = invitation.hostPhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const eventVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const occasionHeadline = invitation.occasion || 'Syukuran';

    return (
        <div className="sy2-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`sy2-overlay${opened ? ' hide' : ''}`}>
                    <div className="sy2-overlay-frame">
                        <span className="sy2-overlay-sun" />
                        <p className="sy2-overlay-eyebrow">Undangan Syukuran</p>
                        <div className="sy2-overlay-divider" />
                        <div className="sy2-overlay-headline">{occasionHeadline}</div>
                        <p className="sy2-overlay-host">{invitation.hostName}</p>
                        <div className="sy2-overlay-divider" />
                        <p className="sy2-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="sy2-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="sy2-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="sy2-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="sy2-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 20px' }}>
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '8px', border: '3px solid rgba(79,143,138,0.5)' }}
                                />
                                <p style={{ color: 'rgba(63,55,44,0.55)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1.5px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="sy2-btn-open" onClick={openInvitation}>
                            {greeting?.buttonText ?? 'Buka Undangan'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`sy2-main${opened ? ' visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="sy2-hero">
                    <div className="sy2-hero-content sy2-anim-up">
                        <p className="sy2-hero-label">Undangan Syukuran</p>
                        <div className="sy2-hero-photo-frame">
                            <div
                                className="sy2-hero-photo"
                                style={
                                    hostPhoto ? { backgroundImage: `url(${hostPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                }
                            >
                                {!hostPhoto && '🕊️'}
                            </div>
                        </div>
                        <h1 className="sy2-hero-name">{invitation.hostName}</h1>
                        {invitation.occasion && <p className="sy2-hero-occasion">{invitation.occasion}</p>}
                        <p className="sy2-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="sy2-countdown"
                                boxClassName="sy2-countdown-box"
                                numClassName="sy2-countdown-num"
                                labelClassName="sy2-countdown-label"
                            />
                        )}
                        <div className="sy2-scroll-indicator">↓</div>
                    </div>
                    <div className="sy2-horizon" />
                </section>

                <div className="sy2-wave" />

                {/* ── HOST / OCCASION PROFILE ──────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="sy2-section sy2-profile">
                        <h2 className="sy2-section-title sy2-anim-up">Rasa Syukur Kami</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <div className="sy2-profile-card sy2-anim-up">
                            <div className="sy2-profile-photo-frame">
                                <div
                                    className="sy2-profile-photo"
                                    style={
                                        hostPhoto
                                            ? { backgroundImage: `url(${hostPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!hostPhoto && '🕊️'}
                                </div>
                            </div>
                            <h3 className="sy2-profile-name">{invitation.hostName}</h3>
                            {invitation.occasion && <p className="sy2-profile-occasion">{invitation.occasion}</p>}
                            <p className="sy2-profile-text">
                                Dengan mengucap syukur kehadirat Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan acara syukuran sederhana ini.
                                Merupakan suatu kehormatan serta kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk turut
                                mendoakan dan berbagi kebahagiaan bersama kami.
                            </p>
                        </div>
                    </section>
                )}

                {/* ── OPENING MESSAGE ──────────────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="sy2-message">
                        <div className="sy2-teal-line" />
                        <p className="sy2-message-icon">🤲</p>
                        <p className="sy2-message-text sy2-anim-up">{invitation.openingMessage}</p>
                        <div className="sy2-teal-line" />
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="sy2-section sy2-events-bg">
                        <h2 className="sy2-section-title sy2-anim-up">Rangkaian Acara</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <div className="sy2-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="sy2-event-card sy2-anim-up">
                                        <span className="sy2-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="sy2-event-name">{ev.name}</h3>
                                        <div className="sy2-event-divider" />
                                        <p className="sy2-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="sy2-event-detail">{timeStr}</p>}
                                        <div className="sy2-event-divider" />
                                        {ev.locationName && (
                                            <p className="sy2-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="sy2-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '25px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="sy2-btn-event">
                                                    Lihat Peta
                                                </a>
                                            )}
                                            <button className="sy2-btn-event" onClick={() => addToCalendar(ev)}>
                                                Tambah ke Kalender
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
                            <section className="sy2-section">
                                <h2 className="sy2-section-title sy2-anim-up">Lokasi Acara</h2>
                                <div className="sy2-divider sy2-anim-up">
                                    <span>◦</span>
                                </div>
                                {ev.locationName && (
                                    <p
                                        style={{
                                            textAlign: 'center',
                                            color: 'var(--sy2-teal-dark)',
                                            fontSize: '1rem',
                                            marginBottom: '8px',
                                            fontStyle: 'italic',
                                        }}
                                        className="sy2-anim-up"
                                    >
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div style={{ maxWidth: '900px', margin: '0 auto' }} className="sy2-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="sy2-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="sy2-btn-maps">
                                                Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="sy2-section sy2-gallery-bg">
                        <h2 className="sy2-section-title sy2-anim-up">Momen Kebersamaan</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'sy2-gallery-grid',
                                item: 'sy2-gallery-item',
                                thumb: 'sy2-gallery-thumb',
                                overlay: 'sy2-gallery-overlay',
                                filterBar: 'sy2-gallery-filter-bar',
                                filterBtn: 'sy2-filter-btn',
                                filterBtnActive: 'sy2-filter-btn sy2-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && eventVideoEmbedUrl && (
                    <section className="sy2-section">
                        <h2 className="sy2-section-title sy2-anim-up">Video Kenangan</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <div className="sy2-video-frame sy2-anim-up">
                            <iframe
                                src={eventVideoEmbedUrl}
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
                    <section className="sy2-section">
                        <h2 className="sy2-section-title sy2-anim-up">Tanda Kasih</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <p className="sy2-wallet-subtitle sy2-anim-up">
                            Doa restu dan kehadiran Bapak/Ibu/Saudara/i merupakan bentuk dukungan yang paling berarti bagi kami. Namun bagi yang
                            ingin turut berbagi kebahagiaan, kami menyediakan sarana kontribusi digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'sy2-bank-grid',
                                bankCard: 'sy2-bank-card',
                                bankLogo: 'sy2-bank-logo',
                                bankType: 'sy2-bank-type',
                                bankNumber: 'sy2-bank-number',
                                bankName: 'sy2-bank-name',
                                copyBankBtn: 'sy2-btn-copy-bank',
                                ewalletGrid: 'sy2-ewallet-grid',
                                ewalletCard: 'sy2-ewallet-card',
                                ewalletName: 'sy2-ewallet-name',
                                ewalletPhone: 'sy2-ewallet-phone',
                                copyEwalletBtn: 'sy2-btn-copy-ewallet',
                                ewalletTitle: 'sy2-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="sy2-section">
                        <h2 className="sy2-section-title sy2-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'sy2-rsvp-form',
                                label: 'sy2-rsvp-label',
                                input: 'sy2-rsvp-input',
                                select: 'sy2-rsvp-select',
                                textarea: 'sy2-rsvp-textarea',
                                radioGroup: 'sy2-rsvp-radio-group',
                                radioLabel: 'sy2-rsvp-radio-label',
                                errorText: 'sy2-rsvp-error',
                                submitBtn: 'sy2-rsvp-submit',
                                successBox: 'sy2-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="sy2-section sy2-wishes-bg">
                        <h2 className="sy2-section-title sy2-anim-up">Doa &amp; Ucapan Syukur</h2>
                        <div className="sy2-divider sy2-anim-up">
                            <span>◦</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'sy2-wishes-layout',
                                formBox: 'sy2-wishes-form',
                                formTitle: 'sy2-wishes-form-title',
                                nameInput: 'sy2-wish-input',
                                messageInput: 'sy2-wish-input',
                                submitBtn: 'sy2-wish-btn',
                                wishCard: 'sy2-wish-card',
                                wishAvatar: 'sy2-wish-avatar',
                                wishName: 'sy2-wish-name',
                                wishDate: 'sy2-wish-date',
                                wishMessage: 'sy2-wish-message',
                                loadMoreBtn: 'sy2-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING / FOOTER ─────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="sy2-closing">
                        <div className="sy2-closing-content sy2-anim-up">
                            <p className="sy2-closing-icon">🕊️</p>
                            <div className="sy2-closing-line" />
                            <p className="sy2-closing-title">Terima Kasih</p>
                            <div className="sy2-closing-line" />
                            <p className="sy2-closing-sub">
                                Atas segala doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i yang kami muliakan.
                            </p>
                            <p className="sy2-closing-from">Kami yang bersyukur,</p>
                            <p className="sy2-closing-name">{invitation.hostName}</p>
                            <p className="sy2-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                        </div>
                    </section>
                )}
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--sy2-teal)', border: '1px solid var(--sy2-white)', color: 'var(--sy2-white)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="sy2-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="sy2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
