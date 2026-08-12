import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { useEffect, useState } from 'react';
import './wedding-theme-12.css';

const placeholderCouple = new URL('./img/placeholder-couple.svg', import.meta.url).href;
const placeholderGroom = new URL('./img/placeholder-groom.svg', import.meta.url).href;
const placeholderBride = new URL('./img/placeholder-bride.svg', import.meta.url).href;
const placeholderStory = new URL('./img/placeholder-story.svg', import.meta.url).href;

interface WeddingTheme12Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const ID_MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

interface SimpleDate {
    day: string;
    month: string;
    year: string;
}

function splitEventDate(dateStr: string): SimpleDate | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts.map((p) => parseInt(p, 10));
    if (!y || !m || !d) return null;
    return { day: String(d), month: ID_MONTHS[m - 1] ?? '', year: String(y) };
}

function getEventTime(ev: InvitationEvent): string {
    if (!ev.time) return '';
    return ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`;
}

function getMapsUrl(ev: InvitationEvent): string {
    if (ev.locationUrl) return ev.locationUrl;
    if (ev.mapsLat && ev.mapsLng) return `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}`;
    return '';
}

function addToCalendar(ev: InvitationEvent) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '080000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '100000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.name)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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

function AkadIcon() {
    return (
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M30 25v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function ResepsiIcon() {
    return (
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M18 38l4-8 4 4 4-6 4 4 4-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M15 22h30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

const EVENT_ICONS = [AkadIcon, ResepsiIcon];

function Divider({ icon }: { icon: string }) {
    return (
        <div className="wt12-ornament-divider" aria-hidden="true">
            <span className="wt12-ornament-line" />
            <span className="wt12-ornament-icon">{icon}</span>
            <span className="wt12-ornament-line" />
        </div>
    );
}

export default function WeddingTheme12({ invitation, visitor, greeting }: WeddingTheme12Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const [opened, setOpened] = useState(!coverEnabled);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered reveal animations (mirrors the source's IntersectionObserver reveal)
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('wt12-visible');
                        observer.unobserve(entry.target);
                    }
                }),
            { threshold: 0.15 },
        );
        document.querySelectorAll('.wt12-reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    const openInvitation = () => setOpened(true);

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    const primaryEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const heroDate = primaryEvent ? splitEventDate(primaryEvent.date) : null;
    const hasMapsAddress = invitation.events.some((e) => e.locationName || e.location);

    // Alternates the ornament icon between dividers, in render order.
    let dividerToggle = 0;
    const divider = () => {
        const icon = dividerToggle % 2 === 0 ? '✦' : '❧';
        dividerToggle += 1;
        return <Divider icon={icon} />;
    };

    const eventOrCountdownVisible = (isEnabled('event_detail') && invitation.events.length > 0) || (isEnabled('countdown') && !!invitation.countdownDate);

    return (
        <div className="wt12-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap');
            `}</style>

            {/* ── Cover / Gate ──────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt12-cover${opened ? ' wt12-hide' : ''}`}>
                    <div className="wt12-cover-deco wt12-cover-deco--tl" />
                    <div className="wt12-cover-deco wt12-cover-deco--br" />
                    <div className="wt12-cover-inner">
                        <p className="wt12-cover-subtitle wt12-fade-in">Undangan Pernikahan</p>
                        <h1 className="wt12-cover-names wt12-script wt12-fade-in wt12-delay-1">
                            {invitation.groomNickname} <span>&amp;</span> {invitation.brideNickname}
                        </h1>
                        <p className="wt12-cover-date wt12-fade-in wt12-delay-2">{invitation.mainDateFormatted}</p>
                        <div className="wt12-cover-photo wt12-fade-in wt12-delay-3">
                            <img src={heroPhoto || placeholderCouple} alt="Foto Pasangan" />
                        </div>

                        {greetingEnabled && coverGuestName && (
                            <div className="wt12-cover-greeting wt12-fade-in wt12-delay-3">
                                <p className="wt12-cover-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="wt12-cover-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="wt12-cover-guest-label">{greeting.guestLabel}</p>}
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && (
                            <p className="wt12-cover-message wt12-fade-in wt12-delay-3">{greeting.message}</p>
                        )}

                        {invitation.guestQrData && (
                            <div className="wt12-cover-qr-wrap wt12-fade-in wt12-delay-3">
                                <GuestQrCode data={invitation.guestQrData} size={110} className="wt12-cover-qr" />
                                <p className="wt12-cover-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="wt12-btn-open wt12-fade-in wt12-delay-4" onClick={openInvitation}>
                            <span>{greeting?.buttonText ?? 'Buka Undangan'}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <main className={`wt12-main${opened ? ' wt12-open' : ''}`}>
                {/* 1. Hero */}
                <section className="wt12-section wt12-hero">
                    <div className="wt12-hero-deco wt12-hero-deco--top" />
                    <div className="wt12-section-inner">
                        <p className="wt12-eyebrow wt12-reveal">Bismillahirrahmanirrahim</p>
                        <p className="wt12-hero-sub wt12-reveal wt12-delay-1">
                            Dengan memohon rahmat dan ridho Allah SWT,
                            <br />
                            kami mengundang Bapak/Ibu/Saudara/i
                        </p>
                        <h2 className="wt12-script wt12-hero-names wt12-reveal wt12-delay-2">
                            {invitation.groomNickname} <span className="wt12-amp">&amp;</span> {invitation.brideNickname}
                        </h2>
                        <p className="wt12-hero-desc wt12-reveal wt12-delay-3">
                            untuk hadir dan memberikan doa restu pada hari pernikahan kami
                        </p>
                        {heroDate ? (
                            <div className="wt12-hero-date wt12-reveal wt12-delay-4">
                                <div className="wt12-date-block">
                                    <span className="wt12-date-num">{heroDate.day}</span>
                                    <span className="wt12-date-sep">|</span>
                                    <span className="wt12-date-month">{heroDate.month}</span>
                                    <span className="wt12-date-sep">|</span>
                                    <span className="wt12-date-year">{heroDate.year}</span>
                                </div>
                            </div>
                        ) : (
                            invitation.mainDateFormatted && (
                                <div className="wt12-hero-date wt12-reveal wt12-delay-4">
                                    <div className="wt12-date-block">
                                        <span className="wt12-date-month">{invitation.mainDateFormatted}</span>
                                    </div>
                                </div>
                            )
                        )}
                        <div className="wt12-hero-photo wt12-reveal wt12-delay-5">
                            <img src={heroPhoto || placeholderCouple} alt="Foto Bersama" />
                            <div className="wt12-photo-frame-deco" />
                        </div>
                    </div>
                    <div className="wt12-hero-deco wt12-hero-deco--bot" />
                </section>

                {divider()}

                {/* 2. Opening Quote */}
                {invitation.openingQuote && (
                    <>
                        <section className="wt12-section wt12-quote-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-quote-text wt12-reveal">{invitation.openingQuote}</p>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 3. Couple */}
                {isEnabled('couple_profile') && (
                    <>
                        <section className="wt12-section wt12-couple-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Mempelai</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">The Happy Couple</h2>
                                <div className="wt12-couple-grid">
                                    {/* Groom */}
                                    <div className="wt12-couple-card wt12-reveal">
                                        <div className="wt12-couple-photo-wrap">
                                            <img src={groomPhoto || placeholderGroom} alt="Mempelai Pria" />
                                            <div className="wt12-couple-photo-ring" />
                                        </div>
                                        <p className="wt12-couple-role">Mempelai Pria</p>
                                        <h3 className="wt12-couple-name wt12-script">{invitation.groomFullName}</h3>
                                        {invitation.groomChildOrder && (
                                            <p className="wt12-couple-child">{invitation.groomChildOrder} dari:</p>
                                        )}
                                        <p className="wt12-couple-parent">
                                            {invitation.groomFather}
                                            {invitation.groomFather && invitation.groomMother && (
                                                <>
                                                    <br />
                                                    &amp;{' '}
                                                </>
                                            )}
                                            {invitation.groomMother}
                                        </p>
                                        {invitation.groomBio && <p className="wt12-couple-bio">{invitation.groomBio}</p>}
                                    </div>
                                    {/* Bride */}
                                    <div className="wt12-couple-card wt12-reveal wt12-delay-2">
                                        <div className="wt12-couple-photo-wrap">
                                            <img src={bridePhoto || placeholderBride} alt="Mempelai Wanita" />
                                            <div className="wt12-couple-photo-ring" />
                                        </div>
                                        <p className="wt12-couple-role">Mempelai Wanita</p>
                                        <h3 className="wt12-couple-name wt12-script">{invitation.brideFullName}</h3>
                                        {invitation.brideChildOrder && (
                                            <p className="wt12-couple-child">{invitation.brideChildOrder} dari:</p>
                                        )}
                                        <p className="wt12-couple-parent">
                                            {invitation.brideFather}
                                            {invitation.brideFather && invitation.brideMother && (
                                                <>
                                                    <br />
                                                    &amp;{' '}
                                                </>
                                            )}
                                            {invitation.brideMother}
                                        </p>
                                        {invitation.brideBio && <p className="wt12-couple-bio">{invitation.brideBio}</p>}
                                    </div>
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 4. Event + Countdown */}
                {eventOrCountdownVisible && (
                    <>
                        <section className="wt12-section wt12-event-section">
                            <div className="wt12-event-bg-deco" />
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Rangkaian Acara</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Save the Date</h2>

                                {isEnabled('event_detail') && invitation.events.length > 0 && (
                                    <div className="wt12-event-grid">
                                        {invitation.events.map((ev, i) => {
                                            const Icon = EVENT_ICONS[i % EVENT_ICONS.length];
                                            const mapsUrl = getMapsUrl(ev);
                                            const timeStr = getEventTime(ev);
                                            return (
                                                <div key={i} className={`wt12-event-card wt12-reveal${i % 2 === 1 ? ' wt12-delay-2' : ''}`}>
                                                    <div className="wt12-event-icon">
                                                        <Icon />
                                                    </div>
                                                    <h3 className="wt12-event-title">{ev.name}</h3>
                                                    {ev.dateFormatted && (
                                                        <p className="wt12-event-detail">
                                                            <strong>{ev.dateFormatted}</strong>
                                                        </p>
                                                    )}
                                                    {timeStr && <p className="wt12-event-detail">{timeStr}</p>}
                                                    {(ev.locationName || ev.location) && (
                                                        <p className="wt12-event-location">
                                                            {ev.locationName}
                                                            {ev.locationName && ev.location && <br />}
                                                            {ev.location}
                                                        </p>
                                                    )}
                                                    <div className="wt12-event-actions">
                                                        {mapsUrl && (
                                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt12-btn-map">
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                >
                                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                                    <circle cx="12" cy="10" r="3" />
                                                                </svg>
                                                                Lihat Peta
                                                            </a>
                                                        )}
                                                        <button type="button" className="wt12-btn-map" onClick={() => addToCalendar(ev)}>
                                                            <svg
                                                                width="14"
                                                                height="14"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                                <path d="M16 2v4M8 2v4M3 10h18" />
                                                            </svg>
                                                            Tambah Kalender
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {isEnabled('countdown') && invitation.countdownDate && (
                                    <div className="wt12-countdown-wrap wt12-reveal wt12-delay-3">
                                        <p className="wt12-countdown-label">Menuju Hari Bahagia</p>
                                        <Countdown
                                            targetDate={invitation.countdownDate}
                                            className="wt12-countdown"
                                            boxClassName="wt12-cd-item"
                                            numClassName="wt12-cd-num"
                                            labelClassName="wt12-cd-label"
                                        />
                                    </div>
                                )}
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 5. Maps / Location */}
                {isEnabled('location') &&
                    invitation.events.length > 0 &&
                    primaryEvent &&
                    (() => {
                        const mapsUrl = getMapsUrl(primaryEvent);
                        if (!primaryEvent.mapsEmbed && !mapsUrl && !hasMapsAddress) return null;
                        return (
                            <>
                                <section className="wt12-section wt12-maps-section">
                                    <div className="wt12-section-inner">
                                        <p className="wt12-section-tag wt12-reveal">Lokasi Acara</p>
                                        <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Temukan Kami</h2>
                                        {hasMapsAddress && (
                                            <div className="wt12-maps-address wt12-reveal wt12-delay-2">
                                                {invitation.events
                                                    .filter((e) => e.locationName || e.location)
                                                    .map((e, i) => (
                                                        <div className="wt12-address-card" key={i}>
                                                            <h4>{e.name}</h4>
                                                            <p>
                                                                {e.locationName}
                                                                {e.locationName && e.location && <br />}
                                                                {e.location}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                        {primaryEvent.mapsEmbed && (
                                            <div className="wt12-maps-embed wt12-reveal wt12-delay-3">
                                                <iframe
                                                    src={primaryEvent.mapsEmbed}
                                                    width="100%"
                                                    height="320"
                                                    style={{ border: 0 }}
                                                    allowFullScreen
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title="Lokasi Acara"
                                                />
                                            </div>
                                        )}
                                        {mapsUrl && (
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt12-btn-primary wt12-reveal wt12-delay-4">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                Navigasi ke Lokasi
                                            </a>
                                        )}
                                    </div>
                                </section>
                                {divider()}
                            </>
                        );
                    })()}

                {/* 6. Love Story */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <>
                        <section className="wt12-section wt12-story-section">
                            <div className="wt12-story-bg-deco" />
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Perjalanan Cinta</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Our Love Story</h2>
                                <div className="wt12-timeline">
                                    {invitation.loveStory.map((item, i) => {
                                        const side = i % 2 === 0 ? 'left' : 'right';
                                        return (
                                            <div
                                                key={i}
                                                className={`wt12-timeline-item wt12-reveal${i % 2 === 1 ? ' wt12-delay-1' : ''}`}
                                                data-side={side}
                                            >
                                                <div className="wt12-timeline-content">
                                                    <div className="wt12-timeline-img">
                                                        <img src={item.photo || placeholderStory} alt={item.title} />
                                                    </div>
                                                    <div className="wt12-timeline-dot" />
                                                    <div className="wt12-timeline-body">
                                                        <span className="wt12-timeline-date">{item.date}</span>
                                                        <h4>{item.title}</h4>
                                                        <p>{item.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 7. Gallery */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <>
                        <section className="wt12-section wt12-gallery-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Galeri Foto</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Our Memories</h2>
                                <div className="wt12-reveal wt12-delay-2">
                                    <GallerySection
                                        items={invitation.gallery}
                                        styles={{
                                            grid: 'wt12-gallery-grid',
                                            item: 'wt12-gallery-item',
                                            thumb: 'wt12-gallery-thumb',
                                            overlay: 'wt12-gallery-overlay',
                                            filterBar: 'wt12-gallery-filter-bar',
                                            filterBtn: 'wt12-filter-btn',
                                            filterBtnActive: 'wt12-filter-btn wt12-filter-btn-active',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 8. Video */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <>
                        <section className="wt12-section wt12-video-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Video Kami</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Wedding Video</h2>
                                <div className="wt12-video-frame wt12-reveal wt12-delay-2">
                                    <iframe
                                        src={coupleVideoEmbedUrl}
                                        title="Video Mempelai"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 9. Dress Code */}
                {invitation.dressCodes && invitation.dressCodes.length > 0 && (
                    <>
                        <section className="wt12-section wt12-dresscode-section">
                            <div className="wt12-dresscode-bg-deco" />
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Kode Busana</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Dress Code</h2>
                                <p className="wt12-dresscode-note wt12-reveal wt12-delay-2">
                                    Kami dengan hangat mengundang Anda untuk tampil menawan pada hari istimewa kami.
                                    <br />
                                    Silakan kenakan busana dengan warna-warna berikut:
                                </p>
                                <div className="wt12-dresscode-palette wt12-reveal wt12-delay-3">
                                    {invitation.dressCodes.map((dc, i) => (
                                        <div className="wt12-palette-item" key={i}>
                                            <div className="wt12-palette-color" style={{ background: dc.hex }} />
                                            <span>{dc.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="wt12-dresscode-icons wt12-reveal wt12-delay-4">
                                    <div className="wt12-dc-icon">
                                        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <ellipse cx="30" cy="16" rx="12" ry="12" stroke="currentColor" strokeWidth="1.5" />
                                            <path
                                                d="M10 72 L18 34 Q22 28 30 28 Q38 28 42 34 L50 72"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                fill="none"
                                            />
                                            <path d="M18 34 L10 28 M42 34 L50 28" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <p>Pria</p>
                                        <small>Kemeja / Jas</small>
                                    </div>
                                    <div className="wt12-dc-icon">
                                        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <ellipse cx="30" cy="14" rx="11" ry="11" stroke="currentColor" strokeWidth="1.5" />
                                            <path
                                                d="M14 72 C14 52 8 42 16 32 Q22 26 30 26 Q38 26 44 32 C52 42 46 52 46 72"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                fill="none"
                                            />
                                            <path d="M14 72 L46 72" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <p>Wanita</p>
                                        <small>Kebaya / Gaun</small>
                                    </div>
                                </div>
                                <p className="wt12-dresscode-note wt12-reveal wt12-delay-5" style={{ marginTop: '1.5rem' }}>
                                    <em>*Mohon hindari warna putih dan merah muda terang</em>
                                </p>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 10. Digital Wallet */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <>
                        <section className="wt12-section wt12-wallet-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Amplop Digital</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Wedding Gift</h2>
                                <p className="wt12-wallet-note wt12-reveal wt12-delay-2">
                                    Bagi yang ingin memberikan hadiah, Anda dapat mengirimkan melalui:
                                </p>
                                <div className="wt12-reveal wt12-delay-3">
                                    <DigitalWalletSection
                                        bankAccounts={invitation.bankAccounts ?? []}
                                        digitalWallets={invitation.digitalWallets ?? []}
                                        onToast={showToast}
                                        styles={{
                                            bankGrid: 'wt12-wallet-grid',
                                            bankCard: 'wt12-wallet-card',
                                            bankLogo: 'wt12-wallet-logo',
                                            bankType: 'wt12-wallet-type',
                                            bankNumber: 'wt12-wallet-number',
                                            bankName: 'wt12-wallet-name',
                                            copyBankBtn: 'wt12-btn-copy',
                                            ewalletGrid: 'wt12-wallet-grid',
                                            ewalletCard: 'wt12-wallet-card',
                                            ewalletName: 'wt12-wallet-logo',
                                            ewalletPhone: 'wt12-wallet-number',
                                            copyEwalletBtn: 'wt12-btn-copy',
                                            ewalletTitle: 'wt12-ewallet-title',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 11. RSVP */}
                {isEnabled('rsvp') && (
                    <>
                        <section className="wt12-section wt12-rsvp-section">
                            <div className="wt12-rsvp-bg-deco" />
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Konfirmasi Kehadiran</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">RSVP</h2>
                                {invitation.rsvpDeadline && (
                                    <p className="wt12-rsvp-note wt12-reveal wt12-delay-2">
                                        Mohon konfirmasi kehadiran Anda sebelum <strong>{invitation.rsvpDeadline}</strong>
                                    </p>
                                )}
                                <div className="wt12-reveal wt12-delay-3">
                                    <RSVPForm
                                        rsvpEndpoint={invitation.rsvpEndpoint}
                                        guestName={invitation.guestName || undefined}
                                        guestSlug={invitation.guestSlug}
                                        onToast={showToast}
                                        styles={{
                                            form: 'wt12-rsvp-form',
                                            label: 'wt12-form-label',
                                            input: 'wt12-form-input',
                                            select: 'wt12-form-input',
                                            textarea: 'wt12-form-input wt12-form-textarea',
                                            radioGroup: 'wt12-radio-group',
                                            radioLabel: 'wt12-radio-label',
                                            errorText: 'wt12-form-error',
                                            submitBtn: 'wt12-btn-primary wt12-btn-full',
                                            successBox: 'wt12-rsvp-success',
                                        }}
                                    />
                                </div>
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 12. Wishes */}
                {isEnabled('wishes') && (
                    <>
                        <section className="wt12-section wt12-wishes-section">
                            <div className="wt12-section-inner">
                                <p className="wt12-section-tag wt12-reveal">Ucapan &amp; Doa</p>
                                <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Wedding Wishes</h2>
                                <WishesSection
                                    wishesEndpoint={invitation.wishesEndpoint}
                                    allowComments={invitation.allowComments}
                                    onToast={showToast}
                                    styles={{
                                        container: 'wt12-wishes-layout',
                                        formBox: 'wt12-wish-form',
                                        formTitle: 'wt12-wish-form-title',
                                        nameInput: 'wt12-form-input',
                                        messageInput: 'wt12-form-input wt12-form-textarea',
                                        submitBtn: 'wt12-btn-primary',
                                        wishCard: 'wt12-wish-item',
                                        wishAvatar: 'wt12-wish-avatar',
                                        wishName: 'wt12-wish-name',
                                        wishDate: 'wt12-wish-time',
                                        wishMessage: 'wt12-wish-text',
                                        loadMoreBtn: 'wt12-pg-btn',
                                    }}
                                />
                            </div>
                        </section>
                        {divider()}
                    </>
                )}

                {/* 13. Closing */}
                <section className="wt12-section wt12-closing-section">
                    <div className="wt12-closing-deco wt12-closing-deco--top" />
                    <div className="wt12-section-inner">
                        <p className="wt12-eyebrow wt12-closing-eyebrow wt12-reveal">Wassalamualaikum Wr. Wb.</p>
                        <h2 className="wt12-section-title wt12-script wt12-reveal wt12-delay-1">Terima Kasih</h2>
                        <p className="wt12-closing-text wt12-reveal wt12-delay-2">
                            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
                            <br />
                            Bapak / Ibu / Saudara / i berkenan hadir untuk memberikan doa
                            <br />
                            dan restu kepada kami.
                        </p>
                        <p className="wt12-closing-quote wt12-reveal wt12-delay-3">
                            <em>
                                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu
                                sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan
                                sayang.&rdquo;
                            </em>
                            <br />
                            <small>(QS. Ar-Rum: 21)</small>
                        </p>
                        <div className="wt12-closing-names wt12-reveal wt12-delay-4">
                            <p className="wt12-script">
                                {invitation.groomNickname} <span className="wt12-amp">&amp;</span> {invitation.brideNickname}
                            </p>
                        </div>
                        <p className="wt12-closing-tagline wt12-reveal wt12-delay-5">Kami yang berbahagia</p>
                    </div>
                    <div className="wt12-closing-deco wt12-closing-deco--bot" />

                    {isEnabled('footer') && (
                        <footer className="wt12-footer">
                            <p>
                                Made with ❤ &nbsp;&middot;&nbsp; {invitation.groomNickname} &amp; {invitation.brideNickname} Wedding
                            </p>
                            <p className="wt12-footer-sub">Undangan ini dibuat dengan cinta untuk Anda</p>
                        </footer>
                    )}
                </section>
            </main>

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{
                        bottom: '1.5rem',
                        right: '1.5rem',
                        width: '48px',
                        height: '48px',
                        background: 'var(--wt12-espresso)',
                        color: 'var(--wt12-blush)',
                        border: 'none',
                        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
                    }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wt12-toast" />
        </div>
    );
}
