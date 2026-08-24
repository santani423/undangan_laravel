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
import './birthday-theme-04.css';

interface BirthdayTheme04Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🐱', '🎀', '🍰', '🎈', '🎁'];

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

// Cute cartoon kitten illustration, adapted from the theme's original static template.
function KittenIllustration({ className, id, happy }: { className?: string; id?: string; happy?: boolean }) {
    return (
        <svg
            id={id}
            className={`${className ?? ''}${happy ? ' bt4-happy' : ''}`}
            viewBox="0 0 400 440"
            role="img"
            aria-label="Ilustrasi kucing kartun berjepit bintang sambil memegang balon hati"
        >
            <path d="M282 372 C 300 330 320 260 336 160" fill="none" stroke="#F2557E" strokeWidth="4" strokeLinecap="round" />
            <g className="bt4-hero-balloon">
                <path
                    d="M336 150 c -26 -30 -56 -12 -56 14 c 0 26 34 44 56 62 c 22 -18 56 -36 56 -62 c 0 -26 -30 -44 -56 -14 z"
                    fill="#F2557E"
                />
                <ellipse cx="316" cy="150" rx="10" ry="7" fill="#fff" opacity=".55" transform="rotate(-25 316 150)" />
            </g>

            <path d="M200 300 c -66 0 -96 44 -96 90 v30 h192 v-30 c 0 -46 -30 -90 -96 -90 z" fill="#FFF2F7" stroke="#F2557E" strokeWidth="6" />
            <path d="M200 300 c -30 0 -50 12 -64 30 h128 c -14 -18 -34 -30 -64 -30 z" fill="#B49BE8" />
            <ellipse cx="118" cy="390" rx="26" ry="20" fill="#FFF2F7" stroke="#F2557E" strokeWidth="6" />
            <ellipse cx="282" cy="374" rx="26" ry="20" fill="#FFF2F7" stroke="#F2557E" strokeWidth="6" />

            <g className="bt4-hero-head">
                <path d="M112 128 L96 40 L176 88 Z" fill="#FFF2F7" stroke="#F2557E" strokeWidth="6" strokeLinejoin="round" />
                <path d="M288 128 L304 40 L224 88 Z" fill="#FFF2F7" stroke="#F2557E" strokeWidth="6" strokeLinejoin="round" />
                <path d="M124 118 L114 68 L156 96 Z" fill="#FFC2DC" />
                <path d="M276 118 L286 68 L244 96 Z" fill="#FFC2DC" />

                <ellipse cx="200" cy="184" rx="112" ry="94" fill="#FFF9FC" stroke="#F2557E" strokeWidth="6" />

                <g stroke="#F2557E" strokeWidth="5" strokeLinecap="round">
                    <path d="M92 168 h-42 M88 190 h-46 M92 212 h-40" />
                    <path d="M308 168 h42 M312 190 h46 M308 212 h40" />
                </g>

                <ellipse className="bt4-cheek" cx="136" cy="212" rx="24" ry="15" fill="#FF9DC4" />
                <ellipse className="bt4-cheek" cx="264" cy="212" rx="24" ry="15" fill="#FF9DC4" />

                <ellipse cx="156" cy="178" rx="15" ry="19" fill="#4A2E3C" />
                <ellipse className="bt4-eye-right" cx="244" cy="178" rx="15" ry="19" fill="#4A2E3C" />
                <path className="bt4-blink-right" d="M228 182 q16 -18 32 0" fill="none" stroke="#4A2E3C" strokeWidth="6" strokeLinecap="round" />
                <circle cx="161" cy="171" r="5" fill="#fff" />
                <circle cx="249" cy="171" r="5" fill="#fff" />

                <path
                    d="M200 216 c -7 -9 -19 -3 -19 5 c 0 8 11 13 19 20 c 8 -7 19 -12 19 -20 c 0 -8 -12 -14 -19 -5 z"
                    fill="#FF7FAE"
                />
                <path d="M200 244 q-13 14 -24 2 M200 244 q13 14 24 2" fill="none" stroke="#4A2E3C" strokeWidth="5" strokeLinecap="round" />

                <g transform="translate(292 96) rotate(18)">
                    <path
                        d="M0 -26 L7 -8 L26 -8 L11 3 L17 22 L0 11 L-17 22 L-11 3 L-26 -8 L-7 -8 Z"
                        fill="#FFD86B"
                        stroke="#E9B62F"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                </g>
            </g>
        </svg>
    );
}

export default function BirthdayTheme04({ invitation, visitor, greeting }: BirthdayTheme04Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [happy, setHappy] = useState(false);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered reveal animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt4-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt4-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const rainHearts = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const shapes = ['♡', '✦', '♥', '★', '♡'];
        const colors = ['#F2557E', '#B49BE8', '#FFD86B', '#7FDDC4', '#FF9DC4'];
        for (let i = 0; i < 40; i++) {
            const h = document.createElement('span');
            h.className = 'bt4-heart';
            h.textContent = shapes[i % shapes.length];
            h.style.color = colors[i % colors.length];
            h.style.left = Math.random() * 100 + 'vw';
            h.style.animationDuration = 2.6 + Math.random() * 2 + 's';
            h.style.animationDelay = Math.random() * 0.7 + 's';
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 5500);
        }
    };

    const toggleHappy = () => {
        const next = !happy;
        setHappy(next);
        if (next && confettiEnabled) rainHearts();
    };

    // Deterministic floating sparkles
    const sparkles = useMemo(() => ['✦', '♡', '✦', '♡'], []);

    const celebrantPhoto = invitation.celebrantPhoto;
    const age = invitation.celebrantAge ?? '';
    const displayName = invitation.celebrantNickname || invitation.celebrantName;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];

    return (
        <div className="bt4-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Quicksand:wght@500;700&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt4-cover${opened ? ' bt4-hide' : ''}`}>
                    {confettiEnabled &&
                        sparkles.map((s, i) => (
                            <span key={i} className={`bt4-cover-sparkle bt4-cover-sparkle-${i + 1}`} aria-hidden="true">
                                {s}
                            </span>
                        ))}

                    <div className="bt4-cover-card">
                        <span className="bt4-cover-tag">Pesta kucing manis</span>
                        <KittenIllustration className="bt4-cover-cat" />
                        <p className="bt4-cover-subtitle">Yuk datang, main, dan makan kue bersama</p>
                        <h1 className="bt4-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt4-cover-age-badge">🎂 Genap {formatAge(age)} 🎂</div>}
                        {invitation.mainDateFormatted && <p className="bt4-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt4-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt4-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt4-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt4-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(242,85,126,0.25)' }} />
                                <p className="bt4-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt4-btn-open" onClick={openInvitation}>
                            🐾 {greeting?.buttonText ?? 'Buka Undangan'} 🐾
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt4-main${opened ? ' bt4-main-visible' : ''}`}>
                {/* HERO */}
                <section className="bt4-hero">
                    {confettiEnabled && (
                        <div className="bt4-hero-deco" aria-hidden="true">
                            <span className="bt4-hero-sparkle bt4-hero-sparkle-0">✦</span>
                            <span className="bt4-hero-sparkle bt4-hero-sparkle-1">♡</span>
                            <span className="bt4-hero-sparkle bt4-hero-sparkle-2">✦</span>
                        </div>
                    )}
                    <div className="bt4-hero-inner bt4-anim-up">
                        <p className="bt4-hero-label">Pesta kucing manis</p>
                        <button
                            type="button"
                            onClick={toggleHappy}
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'block', margin: '0 auto' }}
                            title="Bikin kucingnya senang"
                        >
                            <KittenIllustration className="bt4-hero-cat" happy={happy} />
                        </button>
                        <h1 className="bt4-hero-name">{displayName}</h1>
                        {age !== '' && <div className="bt4-hero-age-badge">Genap {formatAge(age)}!</div>}
                        <p className="bt4-hero-tagline">Kucing kecil kami ulang tahun. Yuk datang, main, dan makan kue bersama.</p>
                        {happy && <p className="bt4-hero-blown-msg">Nyaa~ Selamat ulang tahun, {displayName}! 🎉</p>}
                        {invitation.mainDateFormatted && <p className="bt4-hero-date">{invitation.mainDateFormatted}</p>}

                        {isEnabled('countdown') && mainEvent && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="bt4-countdown"
                                boxClassName="bt4-countdown-box"
                                numClassName="bt4-countdown-num"
                                labelClassName="bt4-countdown-label"
                                labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                doneMessage={
                                    <div className="bt4-countdown-done">
                                        <div className="bt4-countdown-done-emoji">🐱🎀🎉</div>
                                        <h3>Selamat Ulang Tahun!</h3>
                                    </div>
                                }
                            />
                        )}
                        <div className="bt4-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt4-section bt4-profile-bg">
                        <h2 className="bt4-section-title bt4-anim-up">Sang Kucing Kecil</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>🐾</span>
                        </div>
                        <div className="bt4-profile-card bt4-anim-up">
                            <div className="bt4-profile-photo-frame">
                                <div
                                    className="bt4-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🐱'}
                                </div>
                            </div>
                            <h3 className="bt4-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt4-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt4-profile-tags">
                                {age !== '' && <span className="bt4-profile-tag">🎂 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt4-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt4-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt4-section bt4-events-bg">
                        <h2 className="bt4-section-title bt4-light bt4-anim-up">Susunan Acara</h2>
                        <div className="bt4-divider bt4-light bt4-anim-up">
                            <span>🎀</span>
                        </div>
                        <div className="bt4-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt4-event-card bt4-anim-up">
                                        <span className="bt4-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt4-event-name">{ev.name}</h3>
                                        <div className="bt4-event-divider" />
                                        <p className="bt4-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt4-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt4-event-detail">
                                                🏠 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt4-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt4-btn-event" onClick={() => addToCalendar(ev, displayName)}>
                                                📅 Simpan ke Kalender
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
                            <section className="bt4-section">
                                <h2 className="bt4-section-title bt4-anim-up">Lokasi Pesta</h2>
                                <div className="bt4-divider bt4-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt4-location-sub bt4-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt4-map-container bt4-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt4-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt4-btn-maps">
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
                    <section className="bt4-section bt4-timeline-bg">
                        <h2 className="bt4-section-title bt4-anim-up">Jejak Kucing Kecil</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>🐾</span>
                        </div>
                        <p className="bt4-section-sub bt4-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt4-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt4-timeline-item bt4-anim-up">
                                    <div className="bt4-timeline-dot">🐾</div>
                                    <div className="bt4-timeline-card">
                                        {item.photo && <div className="bt4-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt4-timeline-date">{item.date}</p>
                                        <h3 className="bt4-timeline-title">{item.title}</h3>
                                        <p className="bt4-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt4-section bt4-gallery-bg">
                        <h2 className="bt4-section-title bt4-anim-up">Galeri Momen Manis</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt4-gallery-grid',
                                item: 'bt4-gallery-item',
                                thumb: 'bt4-gallery-thumb',
                                overlay: 'bt4-gallery-overlay',
                                filterBar: 'bt4-gallery-filter-bar',
                                filterBtn: 'bt4-filter-btn',
                                filterBtnActive: 'bt4-filter-btn bt4-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt4-section">
                        <h2 className="bt4-section-title bt4-anim-up">Video Kenangan</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt4-video-frame bt4-anim-up">
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
                    <section className="bt4-section bt4-gift-bg">
                        <h2 className="bt4-section-title bt4-light bt4-anim-up">Kado Manis</h2>
                        <div className="bt4-divider bt4-light bt4-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt4-gift-subtitle bt4-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt4-bank-grid',
                                bankCard: 'bt4-bank-card',
                                bankLogo: 'bt4-bank-logo',
                                bankType: 'bt4-bank-type',
                                bankNumber: 'bt4-bank-number',
                                bankName: 'bt4-bank-name',
                                copyBankBtn: 'bt4-btn-copy-bank',
                                ewalletGrid: 'bt4-ewallet-grid',
                                ewalletCard: 'bt4-ewallet-card',
                                ewalletName: 'bt4-ewallet-name',
                                ewalletPhone: 'bt4-ewallet-phone',
                                copyEwalletBtn: 'bt4-btn-copy-ewallet',
                                ewalletTitle: 'bt4-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt4-section">
                        <h2 className="bt4-section-title bt4-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt4-rsvp-form',
                                label: 'bt4-rsvp-label',
                                input: 'bt4-rsvp-input',
                                select: 'bt4-rsvp-select',
                                textarea: 'bt4-rsvp-textarea',
                                radioGroup: 'bt4-rsvp-radio-group',
                                radioLabel: 'bt4-rsvp-radio-label',
                                errorText: 'bt4-rsvp-error',
                                submitBtn: 'bt4-rsvp-submit',
                                successBox: 'bt4-rsvp-success',
                            }}
                            labels={{
                                attending: '🐱 Ya, Saya Hadir!',
                                notAttending: '😢 Maaf, Berhalangan',
                                maybe: '🤔 Masih Ragu',
                                submit: '🎀 Kirim Konfirmasi 🎀',
                                successTitle: '🎀 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di pesta kucing kami!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt4-section bt4-wishes-bg">
                        <h2 className="bt4-section-title bt4-anim-up">Ucapan &amp; Doa</h2>
                        <div className="bt4-divider bt4-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt4-wishes-layout',
                                formBox: 'bt4-wishes-form',
                                formTitle: 'bt4-wishes-form-title',
                                nameInput: 'bt4-wish-input',
                                messageInput: 'bt4-wish-input',
                                submitBtn: 'bt4-wish-btn',
                                wishCard: 'bt4-wish-card',
                                wishAvatar: 'bt4-wish-avatar',
                                wishName: 'bt4-wish-name',
                                wishDate: 'bt4-wish-date',
                                wishMessage: 'bt4-wish-message',
                                loadMoreBtn: 'bt4-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt4-closing">
                        <span className="bt4-closing-sparkle bt4-closing-sparkle-1" aria-hidden="true">
                            ♡
                        </span>
                        <span className="bt4-closing-sparkle bt4-closing-sparkle-2" aria-hidden="true">
                            ✦
                        </span>
                        <div className="bt4-closing-frame bt4-anim-up">
                            <p className="bt4-closing-emoji">🐱🎀🎉</p>
                            <p className="bt4-closing-title">Terima Kasih</p>
                            <p className="bt4-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt4-closing-from">Sampai jumpa di pesta kami,</p>
                            <p className="bt4-closing-name">{displayName}</p>
                            <div className="bt4-closing-line" />
                            <p className="bt4-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt4-strawberry)', border: '2px solid var(--bt4-yellow)', color: '#fff' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt4-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt4-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
