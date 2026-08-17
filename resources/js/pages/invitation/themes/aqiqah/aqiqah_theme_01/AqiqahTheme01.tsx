import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './aqiqah-theme-01.css';

interface AqiqahTheme01Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🦁', '🐘', '🦒', '🐒', '🌴', '🍃'];

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

export default function AqiqahTheme01({ invitation, visitor, greeting }: AqiqahTheme01Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq1-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq1-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '👶';
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
        <div className="aq1-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@300;400;600;700;800&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq1-overlay${opened ? ' aq1-hide' : ''}`}>
                    <div className="aq1-overlay-decor" aria-hidden="true">
                        <span className="aq1-overlay-petal aq1-overlay-petal-1">🦁</span>
                        <span className="aq1-overlay-petal aq1-overlay-petal-2">🐘</span>
                        <span className="aq1-overlay-petal aq1-overlay-petal-3">🦒</span>
                        <span className="aq1-overlay-cloud aq1-overlay-cloud-1">☁️</span>
                        <span className="aq1-overlay-cloud aq1-overlay-cloud-2">☁️</span>
                        <span className="aq1-overlay-leaf aq1-overlay-leaf-1">🍃</span>
                    </div>
                    <div className="aq1-overlay-frame">
                        <p className="aq1-overlay-label">Walimatul Aqiqah</p>
                        <div className="aq1-overlay-divider" />
                        <div className="aq1-overlay-name">{invitation.babyName}</div>
                        {babyGender && (
                            <p className="aq1-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq1-overlay-divider" />
                        <p className="aq1-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq1-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq1-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq1-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq1-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq1-overlay-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={120}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(201,122,46,0.5)' }}
                                />
                                <p className="aq1-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq1-btn-open" onClick={openInvitation}>
                            🐾 {greeting?.buttonText ?? 'Buka Undangan'} 🐾
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq1-main${opened ? ' aq1-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="aq1-hero">
                    <div className="aq1-hero-decor" aria-hidden="true">
                        <span className="aq1-petal aq1-petal-1">🐒</span>
                        <span className="aq1-petal aq1-petal-2">🦒</span>
                        <span className="aq1-petal aq1-petal-3">🐘</span>
                        <span className="aq1-hero-cloud aq1-hero-cloud-1">☁️</span>
                        <span className="aq1-hero-cloud aq1-hero-cloud-2">☁️</span>
                        <span className="aq1-hero-leaf aq1-hero-leaf-1">🍃</span>
                        <span className="aq1-hero-leaf aq1-hero-leaf-2">🌿</span>
                        <span className="aq1-hero-ground" />
                    </div>
                    <div className="aq1-hero-frame aq1-anim-up">
                        <p className="aq1-hero-label">Walimatul Aqiqah</p>
                        <div className="aq1-hero-photo-arch">
                            <div
                                className="aq1-hero-photo"
                                style={babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!babyPhoto && babyInitial}
                            </div>
                        </div>
                        <h1 className="aq1-hero-name">{invitation.babyName}</h1>
                        {babyGender && (
                            <div className="aq1-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq1-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        <p className="aq1-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq1-countdown"
                                boxClassName="aq1-countdown-box"
                                numClassName="aq1-countdown-num"
                                labelClassName="aq1-countdown-label"
                            />
                        )}
                        <div className="aq1-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── OPENING MESSAGE ──────────────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="aq1-quote">
                        <div className="aq1-quote-mark">❝</div>
                        <p className="aq1-quote-text aq1-anim-up">{invitation.openingMessage}</p>
                        <div className="aq1-quote-divider">
                            <span className="aq1-leaf-sway">🌿</span>
                        </div>
                    </section>
                )}

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq1-section aq1-profile">
                        <h2 className="aq1-section-title aq1-anim-up">Buah Hati Kami</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>🦒</span>
                        </div>
                        <div className="aq1-profile-card aq1-anim-up">
                            <div className="aq1-profile-photo-arch">
                                <div
                                    className="aq1-profile-photo"
                                    style={
                                        babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                    }
                                >
                                    {!babyPhoto && babyInitial}
                                </div>
                            </div>
                            <h3 className="aq1-profile-name">{invitation.babyName}</h3>
                            {babyGender && (
                                <p className="aq1-profile-gender">
                                    {genderIcon(babyGender)} {babyGender}
                                </p>
                            )}
                            {invitation.birthDateFormatted && <p className="aq1-profile-birth">{invitation.birthDateFormatted}</p>}
                            {profileLine && <p className="aq1-profile-parents">{profileLine}</p>}
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq1-section aq1-events-bg">
                        <h2 className="aq1-section-title aq1-light aq1-anim-up">Rangkaian Acara</h2>
                        <div className="aq1-divider aq1-light aq1-anim-up">
                            <span>🌴</span>
                        </div>
                        <div className="aq1-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <div key={i} className="aq1-event-card aq1-anim-up">
                                        <span className="aq1-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="aq1-event-name">{ev.name}</h3>
                                        <div className="aq1-event-divider" />
                                        <p className="aq1-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <p className="aq1-event-detail">{timeStr}</p>}
                                        <div className="aq1-event-divider" />
                                        {ev.locationName && (
                                            <p className="aq1-event-detail">
                                                <strong>{ev.locationName}</strong>
                                            </p>
                                        )}
                                        {ev.location && <p className="aq1-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '25px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq1-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="aq1-btn-event" onClick={() => addToCalendar(ev, invitation.babyName)}>
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
                            <section className="aq1-section">
                                <h2 className="aq1-section-title aq1-anim-up">Lokasi Acara</h2>
                                <div className="aq1-divider aq1-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {ev.locationName && (
                                    <p className="aq1-location-sub aq1-anim-up">
                                        {ev.name} · {ev.locationName}
                                    </p>
                                )}
                                <div className="aq1-map-container aq1-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="aq1-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq1-btn-maps">
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
                    <section className="aq1-section aq1-gallery-bg">
                        <h2 className="aq1-section-title aq1-anim-up">Galeri Foto</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq1-gallery-grid',
                                item: 'aq1-gallery-item',
                                thumb: 'aq1-gallery-thumb',
                                overlay: 'aq1-gallery-overlay',
                                filterBar: 'aq1-gallery-filter-bar',
                                filterBtn: 'aq1-filter-btn',
                                filterBtnActive: 'aq1-filter-btn aq1-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq1-section">
                        <h2 className="aq1-section-title aq1-anim-up">Video Kenangan</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="aq1-video-frame aq1-anim-up">
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

                {/* ── DIGITAL GIFT ──────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq1-section aq1-gift-bg">
                        <h2 className="aq1-section-title aq1-anim-up">Amplop Digital</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="aq1-gift-subtitle aq1-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda
                            kasih untuk si kecil, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq1-bank-grid',
                                bankCard: 'aq1-bank-card',
                                bankLogo: 'aq1-bank-logo',
                                bankType: 'aq1-bank-type',
                                bankNumber: 'aq1-bank-number',
                                bankName: 'aq1-bank-name',
                                copyBankBtn: 'aq1-btn-copy-bank',
                                ewalletGrid: 'aq1-ewallet-grid',
                                ewalletCard: 'aq1-ewallet-card',
                                ewalletName: 'aq1-ewallet-name',
                                ewalletPhone: 'aq1-ewallet-phone',
                                copyEwalletBtn: 'aq1-btn-copy-ewallet',
                                ewalletTitle: 'aq1-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq1-section">
                        <h2 className="aq1-section-title aq1-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'aq1-rsvp-form',
                                label: 'aq1-rsvp-label',
                                input: 'aq1-rsvp-input',
                                select: 'aq1-rsvp-select',
                                textarea: 'aq1-rsvp-textarea',
                                radioGroup: 'aq1-rsvp-radio-group',
                                radioLabel: 'aq1-rsvp-radio-label',
                                errorText: 'aq1-rsvp-error',
                                submitBtn: 'aq1-rsvp-submit',
                                successBox: 'aq1-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq1-section aq1-wishes-bg">
                        <h2 className="aq1-section-title aq1-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq1-divider aq1-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq1-wishes-layout',
                                formBox: 'aq1-wishes-form',
                                formTitle: 'aq1-wishes-form-title',
                                nameInput: 'aq1-wish-input',
                                messageInput: 'aq1-wish-input',
                                submitBtn: 'aq1-wish-btn',
                                wishCard: 'aq1-wish-card',
                                wishAvatar: 'aq1-wish-avatar',
                                wishName: 'aq1-wish-name',
                                wishDate: 'aq1-wish-date',
                                wishMessage: 'aq1-wish-message',
                                loadMoreBtn: 'aq1-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="aq1-closing">
                        <div className="aq1-closing-decor" aria-hidden="true">
                            <span className="aq1-closing-leaf aq1-closing-leaf-1">🍃</span>
                            <span className="aq1-closing-leaf aq1-closing-leaf-2">🌿</span>
                            <span className="aq1-closing-cloud">☁️</span>
                        </div>
                        <div className="aq1-closing-frame aq1-anim-up">
                            <p className="aq1-closing-emoji">🦁🐘🌴</p>
                            <p className="aq1-closing-title">Terima Kasih</p>
                            <div className="aq1-closing-line" />
                            <p className="aq1-closing-sub">
                                Atas doa, kasih, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="aq1-closing-from">Kami yang berbahagia,</p>
                            <p className="aq1-closing-name">{invitation.babyName}</p>
                            {parentsLine && <p className="aq1-closing-family">Keluarga {parentsLine}</p>}
                            <div className="aq1-closing-line" />
                            <p className="aq1-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--aq1-amber-deep)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq1-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq1-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
