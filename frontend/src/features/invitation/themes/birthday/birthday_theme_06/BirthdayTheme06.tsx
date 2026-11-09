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
import './birthday-theme-06.css';

interface BirthdayTheme06Props {
    invitation: BirthdayInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🏁', '🏎️', '🎉', '🏆', '🎂'];
const CONFETTI_DELAY_MS = 2950;

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

function startNumber(age: string | number): string {
    const str = String(age ?? '').trim();
    return /^\d+$/.test(str) ? str.padStart(2, '0') : '01';
}

// Traffic-light-then-race-car scene, adapted from the theme's original static template animation.
// `staticView` renders the finished state (green lights, car parked) without needing the
// `.bt6-jalan` run trigger — used for the compact cover illustration.
function RaceIllustration({ className, id, staticView }: { className?: string; id?: string; staticView?: boolean }) {
    return (
        <svg
            id={id}
            className={`${className ?? ''}${staticView ? ' bt6-adegan-static' : ''}`}
            viewBox="0 0 400 210"
            role="img"
            aria-label="Animasi lampu start menyala lalu mobil balap merah melaju masuk"
        >
            <rect x="196" y="60" width="8" height="34" rx="3" fill="#4A5560" />
            <rect x="128" y="12" width="144" height="50" rx="12" fill="#2A2F35" />
            <circle cx="158" cy="37" r="15" fill="#5B1E24" />
            <circle cx="200" cy="37" r="15" fill="#5B1E24" />
            <circle cx="242" cy="37" r="15" fill="#5B1E24" />
            <circle className="bt6-lampu-1" cx="158" cy="37" r="15" fill="#FF3B4E" />
            <circle className="bt6-lampu-2" cx="200" cy="37" r="15" fill="#FF3B4E" />
            <circle className="bt6-lampu-3" cx="242" cy="37" r="15" fill="#FF3B4E" />
            <g className="bt6-hijau">
                <circle cx="158" cy="37" r="15" fill="#3FBF7F" />
                <circle cx="200" cy="37" r="15" fill="#3FBF7F" />
                <circle cx="242" cy="37" r="15" fill="#3FBF7F" />
            </g>

            <g className="bt6-mobil-masuk">
                <g className="bt6-asap">
                    <circle cx="52" cy="150" r="10" fill="#C9D3DA" />
                    <circle cx="34" cy="142" r="7" fill="#DCE4E9" />
                </g>

                <g className="bt6-mobil-getar">
                    <rect x="52" y="112" width="10" height="28" rx="4" fill="#2A2F35" />
                    <rect x="36" y="104" width="46" height="11" rx="5" fill="#2A2F35" />

                    <path
                        d="M70 172 h250 c14 0 20 -8 20 -18 v-20 c0 -12 -10 -18 -24 -20 l-46 -6 -30 -24 c-6 -5 -13 -8 -21 -8 h-58 c-9 0 -16 4 -20 11 l-16 27 -32 6 c-12 2 -18 8 -18 18 v16 c0 11 6 18 15 18 z"
                        fill="#E63946"
                    />
                    <path d="M70 172 h250 c14 0 20 -8 20 -18 h-290 c0 11 6 18 20 18 z" fill="#B92A37" />

                    <path d="M148 118 l14 -22 c2 -4 6 -6 11 -6 h20 v28 z" fill="#BFE7FA" />
                    <path d="M203 90 h27 c5 0 9 2 13 6 l18 22 h-58 z" fill="#A8DCF7" />

                    <circle cx="200" cy="146" r="21" fill="#FFFBF2" />
                    <text x="200" y="156" textAnchor="middle" fontFamily="Racing Sans One, Arial Black, sans-serif" fontSize="26" fill="#242A32">
                        9
                    </text>

                    <ellipse cx="334" cy="140" rx="9" ry="7" fill="#FFD23F" />
                    <rect x="86" y="128" width="44" height="8" rx="4" fill="#FFFBF2" opacity=".85" />

                    <circle cx="122" cy="172" r="30" fill="#2A2F35" />
                    <circle cx="290" cy="172" r="30" fill="#2A2F35" />
                    <circle cx="122" cy="172" r="15" fill="#D9DEE3" />
                    <circle cx="290" cy="172" r="15" fill="#D9DEE3" />
                    <g className="bt6-roda" stroke="#8A939B" strokeWidth="4" strokeLinecap="round">
                        <path d="M122 160 v24 M110 172 h24 M113 163 l18 18 M131 163 l-18 18" />
                    </g>
                    <g className="bt6-roda" stroke="#8A939B" strokeWidth="4" strokeLinecap="round">
                        <path d="M290 160 v24 M278 172 h24 M281 163 l18 18 M299 163 l-18 18" />
                    </g>
                </g>
            </g>
        </svg>
    );
}

export default function BirthdayTheme06({ invitation, visitor, greeting }: BirthdayTheme06Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const confettiEnabled = isEnabled('confetti');

    const [opened, setOpened] = useState(!coverEnabled);
    const [runId, setRunId] = useState(0);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

    // Scroll-triggered reveal animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('bt6-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.bt6-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const rainConfetti = () => {
        if (reducedMotion) return;
        const colors = ['#E63946', '#FFD23F', '#FFFFFF', '#242A32', '#3FBF7F'];
        for (let i = 0; i < 80; i++) {
            const k = document.createElement('span');
            k.className = 'bt6-confetti';
            k.style.left = Math.random() * 100 + 'vw';
            k.style.background = colors[i % colors.length];
            k.style.animationDuration = 2.3 + Math.random() * 2.2 + 's';
            k.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 5400);
        }
    };

    // Race sequence plays once the invitation opens, and can be replayed on demand
    useEffect(() => {
        if (!opened || !confettiEnabled) return;
        const timer = setTimeout(rainConfetti, CONFETTI_DELAY_MS);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened, runId, confettiEnabled]);

    const openInvitation = () => setOpened(true);
    const replayRace = () => {
        if (reducedMotion) return;
        setRunId((n) => n + 1);
    };

    const celebrantPhoto = invitation.celebrantPhoto;
    const age = invitation.celebrantAge ?? '';
    const displayName = invitation.celebrantNickname || invitation.celebrantName;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const videoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];

    return (
        <div className="bt6-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Racing+Sans+One&family=Rubik:wght@400;600;800&display=swap');
            `}</style>

            {/* ── Cover Overlay ─────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`bt6-cover${opened ? ' bt6-hide' : ''}`}>
                    {confettiEnabled && (
                        <>
                            <span className="bt6-cover-sparkle bt6-cover-sparkle-1" aria-hidden="true">
                                🏁
                            </span>
                            <span className="bt6-cover-sparkle bt6-cover-sparkle-2" aria-hidden="true">
                                ✦
                            </span>
                            <span className="bt6-cover-sparkle bt6-cover-sparkle-3" aria-hidden="true">
                                🏁
                            </span>
                            <span className="bt6-cover-sparkle bt6-cover-sparkle-4" aria-hidden="true">
                                ✦
                            </span>
                        </>
                    )}

                    <div className="bt6-cover-card">
                        <span className="bt6-cover-tag">Lampu hijau · Ulang tahun</span>
                        <RaceIllustration className="bt6-cover-scene" staticView />
                        <p className="bt6-cover-subtitle">Satu lintasan, siap tancap gas menuju kamu</p>
                        <h1 className="bt6-cover-name">{displayName}</h1>
                        {age !== '' && <div className="bt6-cover-age-badge">🏁 Garis finis {formatAge(age)} 🏁</div>}
                        {invitation.mainDateFormatted && <p className="bt6-cover-date">🗓️ {invitation.mainDateFormatted}</p>}

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="bt6-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="bt6-cover-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="bt6-cover-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="bt6-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={116} style={{ borderRadius: '12px', border: '3px solid rgba(230,57,70,0.28)' }} />
                                <p className="bt6-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="bt6-btn-open" onClick={openInvitation}>
                            🏎️ {greeting?.buttonText ?? 'Buka Undangan'} 🏎️
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`bt6-main${opened ? ' bt6-main-visible' : ''}`}>
                {/* HERO / RACE TRACK STAGE */}
                <section className="bt6-hero">
                    <div key={runId} className={`bt6-stage${opened ? ' bt6-jalan' : ''}`}>
                        <div className="bt6-trek">
                            <div className="bt6-matahari" aria-hidden="true" />
                            <div className="bt6-awan bt6-awan-a" aria-hidden="true" />
                            <div className="bt6-awan bt6-awan-b" aria-hidden="true" />
                            <p className="bt6-eyebrow">Lampu hijau · Ulang tahun</p>
                            <RaceIllustration className="bt6-adegan" />
                        </div>

                        <div className="bt6-aspal">
                            <div className="bt6-marka" />
                        </div>

                        <div className="bt6-teks-hero">
                            {age !== '' && <p className="bt6-finis">Garis finis: {formatAge(age)}</p>}
                            <h1 className="bt6-nama">{displayName}</h1>
                            <p className="bt6-nomor">Nomor start {startNumber(age)}</p>
                            <p className="bt6-pengantar">Satu lintasan, beberapa lap, dan podium yang belum lengkap tanpa kamu. Ayo balapan bareng!</p>
                            {invitation.mainDateFormatted && <p className="bt6-hero-date">{invitation.mainDateFormatted}</p>}

                            {isEnabled('countdown') && mainEvent && (
                                <Countdown
                                    targetDate={invitation.countdownDate}
                                    className="bt6-countdown"
                                    boxClassName="bt6-countdown-box"
                                    numClassName="bt6-countdown-num"
                                    labelClassName="bt6-countdown-label"
                                    labels={{ days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik' }}
                                    doneMessage={
                                        <div className="bt6-countdown-done">
                                            <div className="bt6-countdown-done-emoji">🏁🏎️🎉</div>
                                            <h3>Selamat Ulang Tahun!</h3>
                                        </div>
                                    }
                                />
                            )}

                            <button className="bt6-btn-replay" onClick={replayRace}>
                                Gas lagi
                            </button>
                            <div className="bt6-scroll-indicator">↓</div>
                        </div>
                    </div>
                </section>

                {/* PROFILE */}
                {isEnabled('couple_profile') && (
                    <section className="bt6-section bt6-profile-bg">
                        <h2 className="bt6-section-title bt6-anim-up">Sang Pembalap Cilik</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>🏎️</span>
                        </div>
                        <div className="bt6-profile-card bt6-anim-up">
                            <div className="bt6-profile-photo-frame">
                                <div
                                    className="bt6-profile-photo"
                                    style={celebrantPhoto ? { backgroundImage: `url(${celebrantPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                >
                                    {!celebrantPhoto && '🏁'}
                                </div>
                            </div>
                            <h3 className="bt6-profile-name">{invitation.celebrantName}</h3>
                            {invitation.celebrantNickname && <p className="bt6-profile-nickname">"{invitation.celebrantNickname}"</p>}
                            <div className="bt6-profile-tags">
                                {age !== '' && <span className="bt6-profile-tag">🏁 {formatAge(age)}</span>}
                                {invitation.parentName && <span className="bt6-profile-tag">👨‍👩‍👧 Putra/i dari {invitation.parentName}</span>}
                            </div>
                            {invitation.celebrantBio && <p className="bt6-profile-bio">{invitation.celebrantBio}</p>}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="bt6-section bt6-events-bg">
                        <h2 className="bt6-section-title bt6-light bt6-anim-up">Urutan Balapan</h2>
                        <div className="bt6-divider bt6-light bt6-anim-up">
                            <span>🏁</span>
                        </div>
                        <div className="bt6-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                return (
                                    <div key={i} className="bt6-event-card bt6-anim-up">
                                        <span className="bt6-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3 className="bt6-event-name">{ev.name}</h3>
                                        <div className="bt6-event-divider" />
                                        <p className="bt6-event-detail">
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {ev.time && (
                                            <p className="bt6-event-detail">
                                                ⏰ {ev.time}
                                                {ev.timeEnd ? ` – ${ev.timeEnd}` : ''} WIB
                                            </p>
                                        )}
                                        {(ev.locationName || ev.location) && (
                                            <p className="bt6-event-detail">
                                                📍 {ev.locationName}
                                                {ev.location ? `, ${ev.location}` : ''}
                                            </p>
                                        )}
                                        <div style={{ marginTop: '22px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt6-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="bt6-btn-event" onClick={() => addToCalendar(ev, displayName)}>
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
                            <section className="bt6-section">
                                <h2 className="bt6-section-title bt6-anim-up">Lokasi Sirkuit</h2>
                                <div className="bt6-divider bt6-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {(ev.locationName || ev.location) && (
                                    <p className="bt6-location-sub bt6-anim-up">
                                        {ev.locationName}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                )}
                                <div className="bt6-map-container bt6-anim-up">
                                    {ev.mapsEmbed && (
                                        <div className="bt6-map-wrapper">
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
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="bt6-btn-maps">
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
                    <section className="bt6-section bt6-timeline-bg">
                        <h2 className="bt6-section-title bt6-anim-up">Lintasan Kenangan</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>🏁</span>
                        </div>
                        <p className="bt6-section-sub bt6-anim-up">Kilas balik momen-momen berharga sepanjang perjalanan</p>
                        <div className="bt6-timeline-wrap">
                            {invitation.lifeJourney.map((item, i) => (
                                <div key={i} className="bt6-timeline-item bt6-anim-up">
                                    <div className="bt6-timeline-dot">🏁</div>
                                    <div className="bt6-timeline-card">
                                        {item.photo && <div className="bt6-timeline-photo" style={{ backgroundImage: `url(${item.photo})` }} />}
                                        <p className="bt6-timeline-date">{item.date}</p>
                                        <h3 className="bt6-timeline-title">{item.title}</h3>
                                        <p className="bt6-timeline-desc">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="bt6-section bt6-gallery-bg">
                        <h2 className="bt6-section-title bt6-anim-up">Galeri Aksi</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'bt6-gallery-grid',
                                item: 'bt6-gallery-item',
                                thumb: 'bt6-gallery-thumb',
                                overlay: 'bt6-gallery-overlay',
                                filterBar: 'bt6-gallery-filter-bar',
                                filterBtn: 'bt6-filter-btn',
                                filterBtnActive: 'bt6-filter-btn bt6-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && videoEmbedUrl && (
                    <section className="bt6-section">
                        <h2 className="bt6-section-title bt6-anim-up">Video Kenangan</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="bt6-video-frame bt6-anim-up">
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
                    <section className="bt6-section bt6-gift-bg">
                        <h2 className="bt6-section-title bt6-light bt6-anim-up">Kado buat Pembalap</h2>
                        <div className="bt6-divider bt6-light bt6-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="bt6-gift-subtitle bt6-anim-up">
                            Kehadiran dan doa Bapak/Ibu/Saudara/i adalah kado terbaik. Namun jika ingin memberi kado, berikut informasinya.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'bt6-bank-grid',
                                bankCard: 'bt6-bank-card',
                                bankLogo: 'bt6-bank-logo',
                                bankType: 'bt6-bank-type',
                                bankNumber: 'bt6-bank-number',
                                bankName: 'bt6-bank-name',
                                copyBankBtn: 'bt6-btn-copy-bank',
                                ewalletGrid: 'bt6-ewallet-grid',
                                ewalletCard: 'bt6-ewallet-card',
                                ewalletName: 'bt6-ewallet-name',
                                ewalletPhone: 'bt6-ewallet-phone',
                                copyEwalletBtn: 'bt6-btn-copy-ewallet',
                                ewalletTitle: 'bt6-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="bt6-section">
                        <h2 className="bt6-section-title bt6-anim-up">Daftar Pembalap</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>✉️</span>
                        </div>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            styles={{
                                form: 'bt6-rsvp-form',
                                label: 'bt6-rsvp-label',
                                input: 'bt6-rsvp-input',
                                select: 'bt6-rsvp-select',
                                textarea: 'bt6-rsvp-textarea',
                                radioGroup: 'bt6-rsvp-radio-group',
                                radioLabel: 'bt6-rsvp-radio-label',
                                errorText: 'bt6-rsvp-error',
                                submitBtn: 'bt6-rsvp-submit',
                                successBox: 'bt6-rsvp-success',
                            }}
                            labels={{
                                attending: '🏁 Siap di Garis Start!',
                                notAttending: '😢 Maaf, Belum Bisa',
                                maybe: '🤔 Masih Ragu',
                                submit: '🏎️ Kirim Konfirmasi 🏎️',
                                successTitle: '🏆 Terima kasih! Konfirmasi Anda sudah kami terima.',
                                successSub: 'Sampai jumpa di garis start!',
                            }}
                        />
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="bt6-section bt6-wishes-bg">
                        <h2 className="bt6-section-title bt6-anim-up">Ucapan &amp; Semangat</h2>
                        <div className="bt6-divider bt6-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'bt6-wishes-layout',
                                formBox: 'bt6-wishes-form',
                                formTitle: 'bt6-wishes-form-title',
                                nameInput: 'bt6-wish-input',
                                messageInput: 'bt6-wish-input',
                                submitBtn: 'bt6-wish-btn',
                                wishCard: 'bt6-wish-card',
                                wishAvatar: 'bt6-wish-avatar',
                                wishName: 'bt6-wish-name',
                                wishDate: 'bt6-wish-date',
                                wishMessage: 'bt6-wish-message',
                                loadMoreBtn: 'bt6-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <section className="bt6-closing">
                        <span className="bt6-closing-sparkle bt6-closing-sparkle-1" aria-hidden="true">
                            🏁
                        </span>
                        <span className="bt6-closing-sparkle bt6-closing-sparkle-2" aria-hidden="true">
                            ✦
                        </span>
                        <div className="bt6-closing-frame bt6-anim-up">
                            <p className="bt6-closing-emoji">🏁🏎️🎉</p>
                            <p className="bt6-closing-title">Terima Kasih</p>
                            <p className="bt6-closing-sub">
                                Atas doa, ucapan, dan kehadiran
                                <br />
                                Bapak/Ibu/Saudara/i sekalian.
                            </p>
                            <p className="bt6-closing-from">Sampai jumpa di garis start,</p>
                            <p className="bt6-closing-name">{displayName}</p>
                            <div className="bt6-closing-line" />
                            <p className="bt6-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--bt6-marka)', border: '2px solid var(--bt6-tinta)', color: 'var(--bt6-tinta)' }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="bt6-toast" />

            {/* Back to Top */}
            {showBackTop && (
                <button className="bt6-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
