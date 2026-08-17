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
import './birthday-theme-02.css';

interface BirthdayTheme02Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const SPARKLE_COLORS = ['#FFD76A', '#F9A8D4', '#C4B5FD', '#8AD9F0', '#FFFFFF'];
const CLOUD_EMOJI = ['☁️', '☁️', '☁️'];
const EVENT_ICONS = ['🏰', '✨', '🌈', '🦄', '⭐'];

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

export default function BirthdayTheme02({ invitation, visitor, greeting }: BirthdayTheme02Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt2-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt2-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    // Deterministic magical sparkle particles (regenerated once)
    const sparkleParticles = useMemo(
        () =>
            Array.from({ length: 40 }, () => ({
                left: Math.random() * 100,
                size: 3 + Math.random() * 5,
                color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
                delay: Math.random() * 6,
                duration: 6 + Math.random() * 6,
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
        <div className="bt2-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt2-cover${opened ? ' bt2-hide' : ''}`}>
                    {confettiEnabled && (
                        <div className="bt2-sparkle-bg" aria-hidden="true">
                            {sparkleParticles.map((p, i) => (
                                <span
                                    key={i}
                                    className="bt2-sparkle-particle"
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
                    <div className="bt2-cover-rainbow" aria-hidden="true">
                        🌈
                    </div>
                    <span className="bt2-cover-star bt2-cover-star-1" aria-hidden="true">
                        ✨
                    </span>
                    <span className="bt2-cover-star bt2-cover-star-2" aria-hidden="true">
                        ⭐
                    </span>
                    <span className="bt2-cover-star bt2-cover-star-3" aria-hidden="true">
                        ✨
                    </span>
                    <span className="bt2-cover-unicorn" aria-hidden="true">
                        🦄
                    </span>
                    <div className="bt2-cover-castle" aria-hidden="true">
                        🏰
                    </div>

                    <div className="bt2-cover-card">
                        <span className="bt2-cover-tag">✨ Anda Diundang ✨</span>
                        <p className="bt2-cover-subtitle">ke pesta ulang tahun penuh keajaiban bersama</p>
                        <h1 className="bt2-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt2-cover-age-badge">🎂 Genap {formatAge(age)} 🎂</div>}
                        {invitation.mainDateFormatted && <p className="bt2-cover-date">📅 {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt2-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt2-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt2-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt2-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(255,255,255,0.65)' }} />
                                <p className="bt2-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt2-btn-open" onClick={openInvitation}>
                            ✨ {greeting?.buttonText ?? 'Buka Undangan'} ✨
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt2-main${opened ? ' bt2-main-visible' : ''}`}>
                {/* HERO */}
                <section className="bt2-hero">
                    {confettiEnabled && (
                        <div className="bt2-hero-deco" aria-hidden="true">
                            {CLOUD_EMOJI.map((c, i) => (
                                <span key={`c-${i}`} className={`bt2-cloud bt2-cloud-${i}`}>
                                    {c}
                                </span>
                            ))}
                            <span className="bt2-star bt2-star-1">⭐</span>
                            <span className="bt2-star bt2-star-2">✨</span>
                            <span className="bt2-star bt2-star-3">✨</span>
                            <span className="bt2-unicorn" aria-hidden="true">
                                🦄
                            </span>
                            <div className="bt2-hero-castle" aria-hidden="true">
                                🏰
                            </div>
                        </div>
                    )}
                    <div className="bt2-hero-inner bt2-anim-up">
                        <p className="bt2-hero-label">✨ Ulang Tahun Penuh Keajaiban ✨</p>
                        <div className="bt2-hero-photo-wrap">
                            <div
                                className="bt2-hero-photo"
                                style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {!celebrantPhoto && (displayName?.charAt(0) ?? '🎂')}
                            </div>
                            {age !== '' && <div className="bt2-hero-age-burst">{age}</div>}
                            <span className="bt2-hero-crown" aria-hidden="true">
                                👑
                            </span>
                        </div>
                        <h1 className="bt2-hero-name">{displayName}</h1>
                        <p className="bt2-hero-tagline">"Di negeri dongeng, hari ini adalah harimu, Sang Bintang"</p>
                        {invitation.mainDateFormatted && <p className="bt2-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && mainEvent && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="bt2-countdown"
                                boxClassName="bt2-countdown-box"
                                numClassName="bt2-countdown-num"
                                labelClassName="bt2-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="bt2-countdown-done">
                                        <div className="bt2-countdown-done-emoji">🏰✨🦄</div>
                                        <h3>Selamat Ulang Tahun!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="bt2-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt2-section bt2-profile-bg">
                        <h2 className="bt2-section-title bt2-anim-up">Sang Bintang Negeri Dongeng</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>🦄</span>
                        </div>
                        <div className="bt2-profile-card bt2-anim-up">
                            <div className="bt2-profile-photo-frame">
                                <div
                                    className="bt2-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '👑'}
                                </div>
                            </div>
                            <h3 className="bt2-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt2-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt2-profile-tags">
                                {age !== '' && <span className="bt2-profile-tag">🎂 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt2-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt2-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt2-section bt2-events-bg">
                        <h2 className="bt2-section-title bt2-light bt2-anim-up">Rangkaian Acara Ajaib</h2>
                        <div className="bt2-divider bt2-light bt2-anim-up">
                            <span>🌈</span>
                        </div>
                        <div className="bt2-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt2-event-card bt2-anim-up">
                                        <span className="bt2-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt2-event-name">{ev.name}</h3>
                                        <div className="bt2-event-divider" />
                                        <p className="bt2-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt2-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt2-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt2-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt2-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt2-section">
                                <h2 className="bt2-section-title bt2-anim-up">Lokasi Pesta</h2>
                                <div className="bt2-divider bt2-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt2-location-sub bt2-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt2-map-container bt2-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt2-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt2-btn-maps">
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
                    <section className="bt2-section bt2-timeline-bg">
                        <h2 className="bt2-section-title bt2-anim-up">Kisah Perjalanan Ajaib</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>🌟</span>
                        </div>
                        <p className="bt2-section-sub bt2-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt2-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt2-timeline-item bt2-anim-up">
                                    <div className="bt2-timeline-dot">✨</div>
                                    <div className="bt2-timeline-card">
                                        {item.photo && <div className="bt2-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt2-timeline-date">{item.date}</p>
                                        <h3 className="bt2-timeline-title">{item.title}</h3>
                                        <p className="bt2-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt2-section bt2-gallery-bg">
                        <h2 className="bt2-section-title bt2-anim-up">Galeri Momen Ajaib</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt2-gallery-grid',
                                item: 'bt2-gallery-item',
                                thumb: 'bt2-gallery-thumb',
                                overlay: 'bt2-gallery-overlay',
                                filterBar: 'bt2-gallery-filter-bar',
                                filterBtn: 'bt2-filter-btn',
                                filterBtnActive: 'bt2-filter-btn bt2-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt2-section">
                        <h2 className="bt2-section-title bt2-anim-up">Video Kenangan</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt2-video-frame bt2-anim-up">
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
                    <section className="bt2-section bt2-gift-bg">
                        <h2 className="bt2-section-title bt2-light bt2-anim-up">Kado Digital</h2>
                        <div className="bt2-divider bt2-light bt2-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt2-gift-subtitle bt2-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt2-bank-grid',
                                bankCard: 'bt2-bank-card',
                                bankLogo: 'bt2-bank-logo',
                                bankType: 'bt2-bank-type',
                                bankNumber: 'bt2-bank-number',
                                bankName: 'bt2-bank-name',
                                copyBankBtn: 'bt2-btn-copy-bank',
                                ewalletGrid: 'bt2-ewallet-grid',
                                ewalletCard: 'bt2-ewallet-card',
                                ewalletName: 'bt2-ewallet-name',
                                ewalletPhone: 'bt2-ewallet-phone',
                                copyEwalletBtn: 'bt2-btn-copy-ewallet',
                                ewalletTitle: 'bt2-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt2-section">
                        <h2 className="bt2-section-title bt2-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt2-rsvp-form',
                                label: 'bt2-rsvp-label',
                                input: 'bt2-rsvp-input',
                                select: 'bt2-rsvp-select',
                                textarea: 'bt2-rsvp-textarea',
                                radioGroup: 'bt2-rsvp-radio-group',
                                radioLabel: 'bt2-rsvp-radio-label',
                                errorText: 'bt2-rsvp-error',
                                submitBtn: 'bt2-rsvp-submit',
                                successBox: 'bt2-rsvp-success',
                            }}
                            labels={{
                                attending: '✨ Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '✨ Kirim Konfirmasi ✨',
                                successTitle: '✨ Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di pesta ajaib!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt2-section bt2-wishes-bg">
                        <h2 className="bt2-section-title bt2-anim-up">Ucapan &amp; Doa</h2>
                        <div className="bt2-divider bt2-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt2-wishes-layout',
                                formBox: 'bt2-wishes-form',
                                formTitle: 'bt2-wishes-form-title',
                                nameInput: 'bt2-wish-input',
                                messageInput: 'bt2-wish-input',
                                submitBtn: 'bt2-wish-btn',
                                wishCard: 'bt2-wish-card',
                                wishAvatar: 'bt2-wish-avatar',
                                wishName: 'bt2-wish-name',
                                wishDate: 'bt2-wish-date',
                                wishMessage: 'bt2-wish-message',
                                loadMoreBtn: 'bt2-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt2-closing">
                        <span className="bt2-closing-star bt2-closing-star-1" aria-hidden="true">
                            ✨
                        </span>
                        <span className="bt2-closing-star bt2-closing-star-2" aria-hidden="true">
                            ⭐
                        </span>
                        <div className="bt2-closing-castle" aria-hidden="true">
                            🏰
                        </div>
                        <div className="bt2-closing-frame bt2-anim-up">
                            <p className="bt2-closing-emoji">🏰🦄✨</p>
                            <p className="bt2-closing-title">Terima Kasih</p>
                            <p className="bt2-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt2-closing-from">Dengan penuh sukacita,</p>
                            <p className="bt2-closing-name">{displayName}</p>
                            <div className="bt2-closing-line" />
                            <p className="bt2-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt2-purple)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt2-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt2-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
