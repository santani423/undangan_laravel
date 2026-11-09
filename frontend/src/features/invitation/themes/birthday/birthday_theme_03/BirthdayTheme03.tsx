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
import './birthday-theme-03.css';

interface BirthdayTheme03Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const LEAF_EMOJI = ['🍃', '🍁', '🍂'];
const EVENT_ICONS = ['🐻', '🍯', '🌲', '🎪', '🎈'];

function addToCalendar(ev: BirthdayInvitation['events'][0], celebrant: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '100000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '140000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Ulang Tahun ${celebrant}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

export default function BirthdayTheme03({ invitation, visitor, greeting }: BirthdayTheme03Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [candleBlown, setCandleBlown] = useState(false);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered reveal animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt3-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt3-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic falling leaves / honey specks
    const leafParticles = useMemo(
        () =>
            Array.from({ length: 26 }, (_, i) => ({
                left: Math.random() * 100,
                emoji: LEAF_EMOJI[i % LEAF_EMOJI.length],
                size: 14 + Math.random() * 12,
                delay: Math.random() * 8,
                duration: 9 + Math.random() * 8,
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
        <div className="bt3-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt3-cover${opened ? ' bt3-hide' : ''}`}>
                    {confettiEnabled && (
                        <div className="bt3-leaf-bg" aria-hidden="true">
                            {leafParticles.map((p, i) => (
                                <span
                                    key={i}
                                    className="bt3-leaf-particle"
                                    style={{
                                        left: `${p.left}%`,
                                        fontSize: p.size,
                                        animationDelay: `${p.delay}s`,
                                        animationDuration: `${p.duration}s`,
                                    }}
                                >
                                    {p.emoji}
                                </span>
                            ))}
                        </div>
                    )}
                    <span className="bt3-cover-bee bt3-cover-bee-1" aria-hidden="true">
                        🐝
                    </span>
                    <span className="bt3-cover-bee bt3-cover-bee-2" aria-hidden="true">
                        🐝
                    </span>
                    <span className="bt3-cover-pine bt3-cover-pine-1" aria-hidden="true">
                        🌲
                    </span>
                    <span className="bt3-cover-pine bt3-cover-pine-2" aria-hidden="true">
                        🌲
                    </span>
                    <div className="bt3-cover-bear" aria-hidden="true">
                        🐻
                    </div>

                    <div className="bt3-cover-card">
                        <span className="bt3-cover-tag">🍯 Anda Diundang 🍯</span>
                        <p className="bt3-cover-subtitle">ke pesta kecil di rumah beruang, merayakan hari bahagia</p>
                        <h1 className="bt3-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt3-cover-age-badge">🎂 Genap {formatAge(age)} 🎂</div>}
                        {invitation.mainDateFormatted && <p className="bt3-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt3-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt3-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt3-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt3-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(255,244,226,0.7)' }} />
                                <p className="bt3-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt3-btn-open" onClick={openInvitation}>
                            🐾 {greeting?.buttonText ?? 'Buka Undangan'} 🐾
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt3-main${opened ? ' bt3-main-visible' : ''}`}>
                {/* HERO */}
                <section className="bt3-hero">
                    {confettiEnabled && (
                        <div className="bt3-hero-deco" aria-hidden="true">
                            <span className="bt3-leaf bt3-leaf-0">🍃</span>
                            <span className="bt3-leaf bt3-leaf-1">🍂</span>
                            <span className="bt3-leaf bt3-leaf-2">🍁</span>
                            <span className="bt3-bee bt3-bee-1">🐝</span>
                            <span className="bt3-bee bt3-bee-2">🐝</span>
                            <div className="bt3-hero-pine" aria-hidden="true">
                                🌲
                            </div>
                        </div>
                    )}
                    <div className="bt3-hero-inner bt3-anim-up">
                        <p className="bt3-hero-label">🍯 Pesta Kecil di Rumah Beruang 🍯</p>
                        <div className="bt3-hero-photo-wrap">
                            <div
                                className="bt3-hero-photo"
                                style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!celebrantPhoto && (displayName?.charAt(0) ?? '🐻')}
                            </div>
                            {age !== '' && <div className="bt3-hero-age-burst">{age}</div>}
                            <button
                                type="button"
                                className={`bt3-hero-candle${candleBlown ? ' bt3-candle-blown' : ''}`}
                                aria-hidden="true"
                                onClick={() => setCandleBlown((v) => !v)}
                                title="Tiup lilinnya"
                            >
                                🕯️
                            </button>
                        </div>
                        <h1 className="bt3-hero-name">{displayName}</h1>
                        <p className="bt3-hero-tagline">"Beruang kecil kami tumbuh setahun lagi, datang dan rayakan bersama"</p>
                        {candleBlown && <p className="bt3-hero-blown-msg">Hore! Selamat ulang tahun, {displayName}! 🎉</p>}
                        {invitation.mainDateFormatted && <p className="bt3-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && mainEvent && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="bt3-countdown"
                                boxClassName="bt3-countdown-box"
                                numClassName="bt3-countdown-num"
                                labelClassName="bt3-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="bt3-countdown-done">
                                        <div className="bt3-countdown-done-emoji">🐻🍯🎉</div>
                                        <h3>Selamat Ulang Tahun!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="bt3-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt3-section bt3-profile-bg">
                        <h2 className="bt3-section-title bt3-anim-up">Sang Beruang Kecil</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>🐾</span>
                        </div>
                        <div className="bt3-profile-card bt3-anim-up">
                            <div className="bt3-profile-photo-frame">
                                <div
                                    className="bt3-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🐻'}
                                </div>
                            </div>
                            <h3 className="bt3-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt3-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt3-profile-tags">
                                {age !== '' && <span className="bt3-profile-tag">🎂 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt3-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt3-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt3-section bt3-events-bg">
                        <h2 className="bt3-section-title bt3-light bt3-anim-up">Rangkaian Acara di Hutan</h2>
                        <div className="bt3-divider bt3-light bt3-anim-up">
                            <span>🌲</span>
                        </div>
                        <div className="bt3-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt3-event-card bt3-anim-up">
                                        <span className="bt3-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt3-event-name">{ev.name}</h3>
                                        <div className="bt3-event-divider" />
                                        <p className="bt3-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt3-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt3-event-detail">
                                                🏡 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt3-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt3-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt3-section">
                                <h2 className="bt3-section-title bt3-anim-up">Lokasi Pesta</h2>
                                <div className="bt3-divider bt3-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt3-location-sub bt3-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt3-map-container bt3-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt3-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt3-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* LIFE JOURNEY */}
                {isEnabled('love_story') && invitation.lifeJourney?.length > 0 && (
                    <section className="bt3-section bt3-timeline-bg">
                        <h2 className="bt3-section-title bt3-anim-up">Jejak Petualangan Kecil</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>🐾</span>
                        </div>
                        <p className="bt3-section-sub bt3-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt3-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt3-timeline-item bt3-anim-up">
                                    <div className="bt3-timeline-dot">🍯</div>
                                    <div className="bt3-timeline-card">
                                        {item.photo && <div className="bt3-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt3-timeline-date">{item.date}</p>
                                        <h3 className="bt3-timeline-title">{item.title}</h3>
                                        <p className="bt3-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt3-section bt3-gallery-bg">
                        <h2 className="bt3-section-title bt3-anim-up">Galeri Momen di Hutan</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt3-gallery-grid',
                                item: 'bt3-gallery-item',
                                thumb: 'bt3-gallery-thumb',
                                overlay: 'bt3-gallery-overlay',
                                filterBar: 'bt3-gallery-filter-bar',
                                filterBtn: 'bt3-filter-btn',
                                filterBtnActive: 'bt3-filter-btn bt3-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt3-section">
                        <h2 className="bt3-section-title bt3-anim-up">Video Kenangan</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt3-video-frame bt3-anim-up">
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
                    <section className="bt3-section bt3-gift-bg">
                        <h2 className="bt3-section-title bt3-light bt3-anim-up">Kado Madu</h2>
                        <div className="bt3-divider bt3-light bt3-anim-up">
                            <span>🍯</span>
                        </div>
                        <p className="bt3-gift-subtitle bt3-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt3-bank-grid',
                                bankCard: 'bt3-bank-card',
                                bankLogo: 'bt3-bank-logo',
                                bankType: 'bt3-bank-type',
                                bankNumber: 'bt3-bank-number',
                                bankName: 'bt3-bank-name',
                                copyBankBtn: 'bt3-btn-copy-bank',
                                ewalletGrid: 'bt3-ewallet-grid',
                                ewalletCard: 'bt3-ewallet-card',
                                ewalletName: 'bt3-ewallet-name',
                                ewalletPhone: 'bt3-ewallet-phone',
                                copyEwalletBtn: 'bt3-btn-copy-ewallet',
                                ewalletTitle: 'bt3-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt3-section">
                        <h2 className="bt3-section-title bt3-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt3-rsvp-form',
                                label: 'bt3-rsvp-label',
                                input: 'bt3-rsvp-input',
                                select: 'bt3-rsvp-select',
                                textarea: 'bt3-rsvp-textarea',
                                radioGroup: 'bt3-rsvp-radio-group',
                                radioLabel: 'bt3-rsvp-radio-label',
                                errorText: 'bt3-rsvp-error',
                                submitBtn: 'bt3-rsvp-submit',
                                successBox: 'bt3-rsvp-success',
                            }}
                            labels={{
                                attending: '🐻 Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '🍯 Kirim Konfirmasi 🍯',
                                successTitle: '🍯 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di hutan kecil kami!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt3-section bt3-wishes-bg">
                        <h2 className="bt3-section-title bt3-anim-up">Ucapan &amp; Doa</h2>
                        <div className="bt3-divider bt3-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt3-wishes-layout',
                                formBox: 'bt3-wishes-form',
                                formTitle: 'bt3-wishes-form-title',
                                nameInput: 'bt3-wish-input',
                                messageInput: 'bt3-wish-input',
                                submitBtn: 'bt3-wish-btn',
                                wishCard: 'bt3-wish-card',
                                wishAvatar: 'bt3-wish-avatar',
                                wishName: 'bt3-wish-name',
                                wishDate: 'bt3-wish-date',
                                wishMessage: 'bt3-wish-message',
                                loadMoreBtn: 'bt3-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt3-closing">
                        <span className="bt3-closing-leaf bt3-closing-leaf-1" aria-hidden="true">
                            🍃
                        </span>
                        <span className="bt3-closing-leaf bt3-closing-leaf-2" aria-hidden="true">
                            🍂
                        </span>
                        <div className="bt3-closing-pine" aria-hidden="true">
                            🌲
                        </div>
                        <div className="bt3-closing-frame bt3-anim-up">
                            <p className="bt3-closing-emoji">🐻🍯🎉</p>
                            <p className="bt3-closing-title">Terima Kasih</p>
                            <p className="bt3-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt3-closing-from">Sampai jumpa di hutan kecil kami,</p>
                            <p className="bt3-closing-name">{displayName}</p>
                            <div className="bt3-closing-line" />
                            <p className="bt3-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt3-pine)', border: '2px solid var(--bt3-cream)', color: 'var(--bt3-honey)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt3-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt3-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
