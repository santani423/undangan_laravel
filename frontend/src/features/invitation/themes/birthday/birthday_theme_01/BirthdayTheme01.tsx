import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { BirthdayInvitation, Greeting } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './birthday-theme-01.css';

interface BirthdayTheme01Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const CONFETTI_COLORS = ['#FF3D82', '#FFD23F', '#1EC8C8', '#9B5DE5', '#FF8A3D'];
const BALLOON_EMOJI = ['🎈', '🎈', '🎈', '🎈'];
const GIFT_EMOJI = ['🎁', '🎁', '🎁'];
const EVENT_ICONS = ['🎉', '🎂', '🎈', '🎁', '🍰', '🥳'];

function addToCalendar(ev: BirthdayInvitation['events'][0], celebrant: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '100000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '140000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Pesta Ulang Tahun ${celebrant}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

function formatAge(age: string | number): string {
    const str = String(age ?? '').trim();
    if (!str) return '';
    return /^\d+$/.test(str) ? `${str} Tahun` : str;
}

export default function BirthdayTheme01({ invitation, visitor, greeting }: BirthdayTheme01Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt1-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt1-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic confetti pieces (generated once)
    const confettiPieces = useMemo(
        () =>
            Array.from({ length: 50 }, () => ({
                left: Math.random() * 100,
                size: 6 + Math.random() * 9,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: Math.random() * 5,
                duration: 3.5 + Math.random() * 4,
                rotate: Math.round(Math.random() * 360),
                shape: Math.random() > 0.5 ? '50%' : '3px',
            })),
        [],
    );

    const celebrantPhoto = invitation.celebrantPhoto;
    const age = invitation.celebrantAge ?? '';
    const displayName = invitation.celebrantNickname || invitation.celebrantName;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];

    return (
        <div className="bt1-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt1-cover${opened ? ' bt1-hide' : ''}`}>
                    {confettiEnabled && (
                        <div className="bt1-confetti-bg" aria-hidden="true">
                            {confettiPieces.map((p, i) => (
                                <span
                                    key={i}
                                    className="bt1-confetti-piece"
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
                    <span className="bt1-cover-balloon bt1-cover-balloon-1" aria-hidden="true">
                        🎈
                    </span>
                    <span className="bt1-cover-balloon bt1-cover-balloon-2" aria-hidden="true">
                        🎈
                    </span>
                    <span className="bt1-cover-balloon bt1-cover-balloon-3" aria-hidden="true">
                        🎈
                    </span>

                    <div className="bt1-cover-card">
                        <span className="bt1-cover-tag">🥳 Kamu Diundang! 🥳</span>
                        <p className="bt1-cover-subtitle">ke pesta ulang tahun penuh keceriaan bersama</p>
                        <h1 className="bt1-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt1-cover-age-badge">🎂 Genap {formatAge(age)} 🎂</div>}
                        {invitation.mainDateFormatted && <p className="bt1-cover-date">📅 {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt1-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt1-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt1-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt1-cover-qr">
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={116}
                                    style={{ borderRadius: '12px', border: '3px solid rgba(255,255,255,0.65)' }}
                                />
                                <p className="bt1-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt1-btn-open" onClick={openInvitation}>
                            🎉 {greeting?.buttonText ?? 'Buka Undangan'} 🎉
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt1-main${opened ? ' bt1-main-visible' : ''}`}>
                {/* HERO */}
                <section className="bt1-hero">
                    {confettiEnabled && (
                        <div className="bt1-hero-deco" aria-hidden="true">
                            {BALLOON_EMOJI.map((b, i) => (
                                <span key={`b-${i}`} className={`bt1-hero-balloon bt1-hero-balloon-${i}`}>
                                    {b}
                                </span>
                            ))}
                            {GIFT_EMOJI.map((g, i) => (
                                <span key={`g-${i}`} className={`bt1-deco-gift bt1-deco-gift-${i}`}>
                                    {g}
                                </span>
                            ))}
                            <span className="bt1-hero-star bt1-hero-star-1">⭐</span>
                            <span className="bt1-hero-star bt1-hero-star-2">✨</span>
                        </div>
                    )}
                    <div className="bt1-hero-inner bt1-anim-up">
                        <p className="bt1-hero-label">🎉 Pesta Ulang Tahun 🎉</p>
                        <div className="bt1-hero-photo-wrap">
                            <div
                                className="bt1-hero-photo"
                                style={
                                    celebrantPhoto
                                        ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >
                                {!celebrantPhoto && (displayName?.charAt(0) ?? '🎂')}
                            </div>
                            {age !== '' && <div className="bt1-hero-age-burst">{age}</div>}
                            <span className="bt1-hero-hat" aria-hidden="true">
                                🎉
                            </span>
                        </div>
                        <h1 className="bt1-hero-name">{displayName}</h1>
                        <p className="bt1-hero-tagline">"Waktunya berpesta dan bersuka cita bersama!"</p>
                        {invitation.mainDateFormatted && <p className="bt1-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && mainEvent && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="bt1-countdown"
                                boxClassName="bt1-countdown-box"
                                numClassName="bt1-countdown-num"
                                labelClassName="bt1-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="bt1-countdown-done">
                                        <div className="bt1-countdown-done-emoji">🎉🎂🎉</div>
                                        <h3>Selamat Ulang Tahun!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="bt1-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* GREETING / OPENING MESSAGE */}
                {greetingEnabled && greeting?.message && (
                    <section className="bt1-message">
                        <div className="bt1-message-icon">💌</div>
                        <p className="bt1-message-text bt1-anim-up">{greeting.message}</p>
                    </section>
                )}

                {/* CELEBRANT PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt1-section bt1-profile-bg">
                        <h2 className="bt1-section-title bt1-anim-up">Yang Berulang Tahun</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>🎈</span>
                        </div>
                        <div className="bt1-profile-card bt1-anim-up">
                            <div className="bt1-profile-photo-frame">
                                <div
                                    className="bt1-profile-photo"
                                    style={
                                        celebrantPhoto
                                            ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!celebrantPhoto && '🎉'}
                                </div>
                            </div>
                            <h3 className="bt1-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt1-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt1-profile-tags">
                                {age !== '' && <span className="bt1-profile-tag">🎂 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt1-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt1-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt1-section bt1-events-bg">
                        <h2 className="bt1-section-title bt1-light bt1-anim-up">Detail Pesta</h2>
                        <div className="bt1-divider bt1-light bt1-anim-up">
                            <span>🎊</span>
                        </div>
                        <div className="bt1-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt1-event-card bt1-anim-up">
                                        <span className="bt1-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt1-event-name">{ev.name}</h3>
                                        <div className="bt1-event-divider" />
                                        <p className="bt1-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt1-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt1-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt1-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt1-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                        const ev = mainEvent ?? invitation.events[0];
                        const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                        if (!ev.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="bt1-section">
                                <h2 className="bt1-section-title bt1-anim-up">Lokasi Acara</h2>
                                <div className="bt1-divider bt1-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt1-location-sub bt1-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt1-map-container bt1-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt1-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt1-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* LIFE JOURNEY (bonus milestones) */}
                {isEnabled('love_story') && invitation.lifeJourney?.length > 0 && (
                    <section className="bt1-section bt1-timeline-bg">
                        <h2 className="bt1-section-title bt1-anim-up">Perjalanan Ceria</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>🌟</span>
                        </div>
                        <p className="bt1-section-sub bt1-anim-up">Sepenggal kisah dan momen berharga sepanjang perjalanan</p>
                        <div className="bt1-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt1-timeline-item bt1-anim-up">
                                    <div className="bt1-timeline-dot">🎈</div>
                                    <div className="bt1-timeline-card">
                                        {item.photo && <div className="bt1-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt1-timeline-date">{item.date}</p>
                                        <h3 className="bt1-timeline-title">{item.title}</h3>
                                        <p className="bt1-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt1-section bt1-gallery-bg">
                        <h2 className="bt1-section-title bt1-anim-up">Galeri Momen</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt1-gallery-grid',
                                item: 'bt1-gallery-item',
                                thumb: 'bt1-gallery-thumb',
                                overlay: 'bt1-gallery-overlay',
                                filterBar: 'bt1-gallery-filter-bar',
                                filterBtn: 'bt1-filter-btn',
                                filterBtnActive: 'bt1-filter-btn bt1-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt1-section">
                        <h2 className="bt1-section-title bt1-anim-up">Video Kenangan</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt1-video-frame bt1-anim-up">
                            <iframe
                                src={videoEmbedUrl}
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
                    <section className="bt1-section bt1-gift-bg">
                        <h2 className="bt1-section-title bt1-light bt1-anim-up">Kado Untuk Sang Bintang</h2>
                        <div className="bt1-divider bt1-light bt1-anim-up">
                            <span>🎁</span>
                        </div>
                        <div className="bt1-giftbox-row bt1-anim-up" aria-hidden="true">
                            <span className="bt1-giftbox" style={{ animationDelay: '0s' }}>
                                🎁
                            </span>
                            <span className="bt1-giftbox" style={{ animationDelay: '-0.8s' }}>
                                🎁
                            </span>
                            <span className="bt1-giftbox" style={{ animationDelay: '-1.6s' }}>
                                🎁
                            </span>
                        </div>
                        <p className="bt1-gift-subtitle bt1-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt1-bank-grid',
                                bankCard: 'bt1-bank-card',
                                bankLogo: 'bt1-bank-logo',
                                bankType: 'bt1-bank-type',
                                bankNumber: 'bt1-bank-number',
                                bankName: 'bt1-bank-name',
                                copyBankBtn: 'bt1-btn-copy-bank',
                                ewalletGrid: 'bt1-ewallet-grid',
                                ewalletCard: 'bt1-ewallet-card',
                                ewalletName: 'bt1-ewallet-name',
                                ewalletPhone: 'bt1-ewallet-phone',
                                copyEwalletBtn: 'bt1-btn-copy-ewallet',
                                ewalletTitle: 'bt1-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt1-section">
                        <h2 className="bt1-section-title bt1-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt1-rsvp-form',
                                label: 'bt1-rsvp-label',
                                input: 'bt1-rsvp-input',
                                select: 'bt1-rsvp-select',
                                textarea: 'bt1-rsvp-textarea',
                                radioGroup: 'bt1-rsvp-radio-group',
                                radioLabel: 'bt1-rsvp-radio-label',
                                errorText: 'bt1-rsvp-error',
                                submitBtn: 'bt1-rsvp-submit',
                                successBox: 'bt1-rsvp-success',
                            }}
                            labels={{
                                attending: '🎉 Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '✨ Kirim Konfirmasi ✨',
                                successTitle: '🎉 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di pesta!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt1-section bt1-wishes-bg">
                        <h2 className="bt1-section-title bt1-anim-up">Doa &amp; Ucapan</h2>
                        <div className="bt1-divider bt1-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt1-wishes-layout',
                                formBox: 'bt1-wishes-form',
                                formTitle: 'bt1-wishes-form-title',
                                nameInput: 'bt1-wish-input',
                                messageInput: 'bt1-wish-input',
                                submitBtn: 'bt1-wish-btn',
                                wishCard: 'bt1-wish-card',
                                wishAvatar: 'bt1-wish-avatar',
                                wishName: 'bt1-wish-name',
                                wishDate: 'bt1-wish-date',
                                wishMessage: 'bt1-wish-message',
                                loadMoreBtn: 'bt1-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt1-closing">
                        <span className="bt1-closing-balloon bt1-closing-balloon-1" aria-hidden="true">
                            🎈
                        </span>
                        <span className="bt1-closing-balloon bt1-closing-balloon-2" aria-hidden="true">
                            🎈
                        </span>
                        <div className="bt1-closing-frame bt1-anim-up">
                            <p className="bt1-closing-emoji">🎉🎂🎁</p>
                            <p className="bt1-closing-title">Terima Kasih</p>
                            <p className="bt1-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt1-closing-from">Dengan penuh sukacita,</p>
                            <p className="bt1-closing-name">{displayName}</p>
                            <div className="bt1-closing-line" />
                            <p className="bt1-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt1-purple)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt1-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt1-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
