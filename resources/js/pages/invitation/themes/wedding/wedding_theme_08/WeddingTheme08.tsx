import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './wedding-theme-08.css';

interface WeddingTheme08Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '🎊', '🌸', '💐', '⭐', '🕋'];
const NAV_SECTIONS = ['hero', 'countdown', 'couple', 'event', 'love-story', 'gallery', 'dresscode', 'wallet', 'rsvp', 'wishes'] as const;

function addToCalendar(ev: InvitationEvent) {
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

export default function WeddingTheme08({ invitation, visitor, greeting }: WeddingTheme08Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('hero');
    const [walletTab, setWalletTab] = useState<'bank' | 'ewallet'>('bank');
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll reveal animation (AOS-lite)
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wt8-shown')),
            { threshold: 0.12 },
        );
        document.querySelectorAll('.wt8-root [data-anim]').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back-to-top visibility + nav dot highlight
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        if (!opened) return;
        const dotObs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id);
                });
            },
            { threshold: 0.35 },
        );
        NAV_SECTIONS.forEach((id) => {
            const el = document.getElementById(`wt8-${id}`);
            if (el) dotObs.observe(el);
        });
        return () => dotObs.disconnect();
    }, [opened]);

    const openInvitation = () => setOpened(true);

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const primaryEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];
    const hasBank = (invitation.bankAccounts?.length ?? 0) > 0;
    const hasEwallet = (invitation.digitalWallets?.length ?? 0) > 0;

    return (
        <div className="wt8-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&family=Dancing+Script:wght@500;700&display=swap');
            `}</style>

            {/* ── COVER ─────────────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt8-cover${opened ? ' wt8-hidden' : ''}`}>
                    <span className="wt8-cvf wt8-cvf-tl">🌸</span>
                    <span className="wt8-cvf wt8-cvf-tr">🌸</span>
                    <span className="wt8-cvf wt8-cvf-bl">🌺</span>
                    <span className="wt8-cvf wt8-cvf-br">🌺</span>
                    <div className="wt8-cv-wrap">
                        <p className="wt8-cv-sub">— Walimatul &apos;Ursy —</p>
                        <div className="wt8-cv-walimah">Undangan Pernikahan</div>
                        <div className="wt8-cv-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </div>
                        <CoupleIllustration className="wt8-cv-couple wt8-float" />
                        <div className="wt8-cv-date">{invitation.mainDateFormatted}</div>
                        <p className="wt8-cv-inv">
                            Tanpa mengurangi rasa hormat kami mengundang
                            <br />
                            Bapak / Ibu / Saudara(i)
                            <br />
                            untuk menghadiri pernikahan putra putri kami
                        </p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="wt8-cv-greet-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="wt8-cv-guest-name">{coverGuestName}</p>
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="wt8-cv-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="wt8-cv-qr-wrap">
                                <GuestQrCode data={invitation.guestQrData} size={120} className="wt8-cv-qr" />
                                <p className="wt8-cv-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="wt8-btn-open" onClick={openInvitation}>
                            💌 {greeting?.buttonText ?? "Buka Undangan"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── SCROLL TOP ────────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="wt8-stb" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Ke atas">
                    ↑
                </button>
            )}

            {/* ── NAV DOTS ──────────────────────────────────────────────────────── */}
            {opened && (
                <div className="wt8-ndots">
                    {NAV_SECTIONS.map((id) => (
                        <div
                            key={id}
                            className={`wt8-nd${activeSection === id ? ' wt8-on' : ''}`}
                            onClick={() => document.getElementById(`wt8-${id}`)?.scrollIntoView({ behavior: 'smooth' })}
                        />
                    ))}
                </div>
            )}

            {/* ═══════════ MAIN CONTENT ═══════════ */}
            <div ref={mainRef} className={`wt8-mc${opened ? ' wt8-vis' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section id="wt8-hero" className="wt8-hero">
                    <div className="wt8-hero-stars" />
                    <HeroFloral className="wt8-hero-fl wt8-hero-fl-tl" />
                    <HeroFloral className="wt8-hero-fl wt8-hero-fl-tr" />
                    <div className="wt8-hero-content" data-anim="">
                        <p className="wt8-hero-sub">— Walimatul &apos;Ursy —</p>
                        <div className="wt8-hero-walimah">Undangan Pernikahan</div>
                        <div className="wt8-line-dec" />
                        <div className="wt8-hero-photo-wrap">
                            {heroPhoto ? (
                                <img src={heroPhoto} alt="Foto Pasangan" className="wt8-hero-photo-img" />
                            ) : (
                                <span className="wt8-hero-photo-fallback">💕</span>
                            )}
                        </div>
                        <div className="wt8-hero-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </div>
                        <div className="wt8-line-dec" />
                        <div className="wt8-hero-date">{invitation.mainDateFormatted}</div>
                        {primaryEvent && (primaryEvent.locationName || primaryEvent.location) && (
                            <div className="wt8-hero-loc">
                                📍 {primaryEvent.locationName || primaryEvent.location}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── BISMILLAH / OPENING QUOTE ────────────────────────────────── */}
                {invitation.openingQuote && (
                    <section className="wt8-bismillah">
                        <div className="wt8-container">
                            <div className="wt8-bismillah-ar" data-anim="">
                                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                            </div>
                            <div className="wt8-divider">
                                <span>🌸</span>
                            </div>
                            <p className="wt8-ayat" data-anim="">
                                {invitation.openingQuote}
                            </p>
                        </div>
                    </section>
                )}

                {/* ── COUNTDOWN ─────────────────────────────────────────────────── */}
                {isEnabled('countdown') && (
                    <section id="wt8-countdown" className="wt8-countdown">
                        <span className="wt8-cd-bg wt8-cd-bg-l">🌸</span>
                        <span className="wt8-cd-bg wt8-cd-bg-r">🌺</span>
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Menuju Hari Bahagia</h2>
                                <p>{invitation.mainDateFormatted}</p>
                            </div>
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wt8-cd-grid"
                                boxClassName="wt8-cd-item"
                                numClassName="wt8-cd-num"
                                labelClassName="wt8-cd-lbl"
                                doneMessage={<div className="wt8-cd-done">Alhamdulillah, Hari Pernikahan Telah Tiba! 🎉</div>}
                            />
                        </div>
                    </section>
                )}

                {/* ── COUPLE ────────────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section id="wt8-couple" className="wt8-couple">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Mempelai</h2>
                                <p>Dua jiwa yang dipersatukan dalam ikatan suci</p>
                            </div>
                            <div className="wt8-divider">
                                <span>💍</span>
                            </div>
                            <div className="wt8-cpl-grid">
                                <div className="wt8-cpl-card wt8-cpl-w" data-anim="left">
                                    {bridePhoto ? (
                                        <img src={bridePhoto} alt="Mempelai Wanita" className="wt8-cpl-photo" />
                                    ) : (
                                        <div className="wt8-cpl-photo wt8-cpl-photo-fallback">👰</div>
                                    )}
                                    <div className="wt8-cpl-name">{invitation.brideNickname}</div>
                                    <div className="wt8-cpl-full">{invitation.brideFullName}</div>
                                    <div className="wt8-cpl-parent">
                                        {invitation.brideChildOrder || 'Putri dari'}
                                        <br />
                                        <strong>{invitation.brideFather}</strong>
                                        {invitation.brideFather && invitation.brideMother && ' & '}
                                        <strong>{invitation.brideMother}</strong>
                                    </div>
                                    {invitation.brideBio && <p className="wt8-cpl-bio">{invitation.brideBio}</p>}
                                </div>
                                <div className="wt8-cpl-mid" data-anim="zoom">
                                    <div className="wt8-cpl-amp">&amp;</div>
                                    <div className="wt8-cpl-heart">💕</div>
                                </div>
                                <div className="wt8-cpl-card wt8-cpl-m" data-anim="right">
                                    {groomPhoto ? (
                                        <img src={groomPhoto} alt="Mempelai Pria" className="wt8-cpl-photo" />
                                    ) : (
                                        <div className="wt8-cpl-photo wt8-cpl-photo-fallback">🤵</div>
                                    )}
                                    <div className="wt8-cpl-name">{invitation.groomNickname}</div>
                                    <div className="wt8-cpl-full">{invitation.groomFullName}</div>
                                    <div className="wt8-cpl-parent">
                                        {invitation.groomChildOrder || 'Putra dari'}
                                        <br />
                                        <strong>{invitation.groomFather}</strong>
                                        {invitation.groomFather && invitation.groomMother && ' & '}
                                        <strong>{invitation.groomMother}</strong>
                                    </div>
                                    {invitation.groomBio && <p className="wt8-cpl-bio">{invitation.groomBio}</p>}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── EVENT ─────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events?.length > 0 && (
                    <section id="wt8-event" className="wt8-event">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Detail Acara</h2>
                                <p>Dengan penuh kebahagiaan kami mengundang kehadiran Anda</p>
                            </div>
                            <div className="wt8-divider">
                                <span>🕌</span>
                            </div>
                            <div className="wt8-ev-grid">
                                {invitation.events.map((ev, i) => {
                                    const mapsUrl = ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                    const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                    return (
                                        <div key={i} className="wt8-ev-card" data-anim={i % 2 === 0 ? 'left' : 'right'}>
                                            <div className="wt8-ev-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</div>
                                            <div className="wt8-ev-type">{ev.name}</div>
                                            {ev.dateFormatted && (
                                                <div className="wt8-ev-row">
                                                    <span>📅</span>
                                                    <span>{ev.dateFormatted}</span>
                                                </div>
                                            )}
                                            {timeStr && (
                                                <div className="wt8-ev-row">
                                                    <span>🕐</span>
                                                    <span>{timeStr}</span>
                                                </div>
                                            )}
                                            {(ev.locationName || ev.location) && (
                                                <div className="wt8-ev-row">
                                                    <span>📍</span>
                                                    <span>
                                                        {ev.locationName}
                                                        {ev.locationName && ev.location ? ', ' : ''}
                                                        {ev.location}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="wt8-ev-actions">
                                                {mapsUrl && (
                                                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="wt8-btn-map">
                                                        🧭 Google Maps
                                                    </a>
                                                )}
                                                {isEnabled('add_to_calendar') && (
                                                    <button type="button" className="wt8-btn-map wt8-btn-cal" onClick={() => addToCalendar(ev)}>
                                                        📅 Kalender
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── LOCATION ──────────────────────────────────────────────────── */}
                {isEnabled('location') && primaryEvent && (primaryEvent.mapsEmbed || primaryEvent.locationUrl) && (
                    <section className="wt8-location">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Lokasi Acara</h2>
                                <p>Tempat berlangsungnya momen bahagia kami</p>
                            </div>
                            <div className="wt8-divider">
                                <span>📍</span>
                            </div>
                            <div className="wt8-loc-addr" data-anim="">
                                <p>
                                    <strong>{primaryEvent.locationName}</strong>
                                    <br />
                                    {primaryEvent.location}
                                </p>
                                {primaryEvent.locationUrl && (
                                    <a href={primaryEvent.locationUrl} target="_blank" rel="noopener noreferrer" className="wt8-btn-map wt8-btn-directions">
                                        🧭 Petunjuk Arah
                                    </a>
                                )}
                            </div>
                            {primaryEvent.mapsEmbed && (
                                <div className="wt8-map-wrap" data-anim="zoom">
                                    <iframe
                                        src={primaryEvent.mapsEmbed}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Lokasi Acara"
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── LOVE STORY ────────────────────────────────────────────────── */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <section id="wt8-love-story" className="wt8-love-story">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Love Story</h2>
                                <p>Perjalanan indah menuju hari yang sempurna</p>
                            </div>
                            <div className="wt8-divider">
                                <span>💑</span>
                            </div>
                            <div className="wt8-tl">
                                {invitation.loveStory.map((item, i) => {
                                    const side = i % 2 === 0 ? 'left' : 'right';
                                    const isLast = i === invitation.loveStory.length - 1;
                                    const card = (
                                        <div className={`wt8-tl-content wt8-tl-${side}`} data-anim={side}>
                                            <div className={`wt8-tl-card${isLast ? ' wt8-tl-card-last' : ''}`}>
                                                {item.date && <div className="wt8-tl-date">📅 {item.date}</div>}
                                                <div className="wt8-tl-title">{item.title}</div>
                                                <div className="wt8-tl-desc">{item.desc}</div>
                                                {item.photo && <img src={item.photo} alt="" className="wt8-tl-img" />}
                                            </div>
                                        </div>
                                    );
                                    return (
                                        <div key={i} className="wt8-tl-item">
                                            {side === 'left' ? (
                                                <>
                                                    {card}
                                                    <div className="wt8-tl-mid">
                                                        <div className={`wt8-tl-dot${isLast ? ' wt8-tl-dot-last' : ''}`} />
                                                    </div>
                                                    <div />
                                                </>
                                            ) : (
                                                <>
                                                    <div />
                                                    <div className="wt8-tl-mid">
                                                        <div className={`wt8-tl-dot${isLast ? ' wt8-tl-dot-last' : ''}`} />
                                                    </div>
                                                    {card}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section id="wt8-gallery" className="wt8-gallery">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Galeri</h2>
                                <p>Setiap foto menyimpan seribu kenangan indah</p>
                            </div>
                            <div className="wt8-divider">
                                <span>📸</span>
                            </div>
                            <GallerySection
                                items={invitation.gallery}
                                styles={{
                                    grid: 'wt8-gl-grid',
                                    item: 'wt8-gl-item',
                                    thumb: 'wt8-gl-thumb',
                                    overlay: 'wt8-gl-ov',
                                    filterBar: 'wt8-gl-filter-bar',
                                    filterBtn: 'wt8-gl-filter-btn',
                                    filterBtnActive: 'wt8-gl-filter-btn wt8-gl-filter-btn-active',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <section className="wt8-video-section">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Video Kami</h2>
                                <p>Kenangan bergerak dari perjalanan cinta kami</p>
                            </div>
                            <div className="wt8-divider">
                                <span>🎥</span>
                            </div>
                            <div className="wt8-video-frame" data-anim="zoom">
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
                )}

                {/* ── DRESS CODE ────────────────────────────────────────────────── */}
                {invitation.dressCodes?.length > 0 && (
                    <section id="wt8-dresscode" className="wt8-dresscode">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Dress Code</h2>
                                <p>Rekomendasi busana tamu undangan</p>
                            </div>
                            <div className="wt8-divider">
                                <span>👗</span>
                            </div>
                            <p className="wt8-dc-note" data-anim="">
                                Kami memohon kehadiran Anda dengan busana yang sopan dan mengikuti palet warna berikut
                            </p>
                            <div className="wt8-dc-swatches" data-anim="zoom">
                                {invitation.dressCodes.map((dc, i) => (
                                    <div className="wt8-dc-sw" key={i}>
                                        <div className="wt8-dc-circle" style={{ background: dc.hex }} />
                                        <div className="wt8-dc-lbl">{dc.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="wt8-dc-cards">
                                <div className="wt8-dc-card" data-anim="left">
                                    <div className="wt8-dc-icon">👔</div>
                                    <div className="wt8-dc-title">Pria</div>
                                    <div className="wt8-dc-desc">Baju koko / kemeja formal, celana panjang, peci / songkok. Hindari warna hitam pekat.</div>
                                </div>
                                <div className="wt8-dc-card" data-anim="">
                                    <div className="wt8-dc-icon">👗</div>
                                    <div className="wt8-dc-title">Wanita</div>
                                    <div className="wt8-dc-desc">Gamis / kebaya sopan, hijab rapi. Busana tertutup dan elegan sesuai syariat Islam.</div>
                                </div>
                                <div className="wt8-dc-card" data-anim="right">
                                    <div className="wt8-dc-icon">🚫</div>
                                    <div className="wt8-dc-title">Hindari</div>
                                    <div className="wt8-dc-desc">Pakaian kasual, warna putih polos (khusus mempelai), dan busana yang tidak sopan.</div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── DIGITAL ENVELOPE / WALLET ────────────────────────────────── */}
                {isEnabled('digital_envelope') && (hasBank || hasEwallet) && (
                    <section id="wt8-wallet" className="wt8-wallet">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Amplop Digital</h2>
                                <p>Doa restu Anda adalah hadiah terindah bagi kami</p>
                            </div>
                            <div className="wt8-divider">
                                <span>💝</span>
                            </div>
                            <p className="wt8-wl-intro" data-anim="">
                                Bagi yang ingin memberikan hadiah, kami menerima melalui rekening atau e-wallet berikut
                            </p>

                            {hasBank && hasEwallet ? (
                                <>
                                    <div className="wt8-wl-tabs">
                                        <button
                                            type="button"
                                            className={`wt8-wl-tab${walletTab === 'bank' ? ' wt8-on' : ''}`}
                                            onClick={() => setWalletTab('bank')}
                                        >
                                            Transfer Bank
                                        </button>
                                        <button
                                            type="button"
                                            className={`wt8-wl-tab${walletTab === 'ewallet' ? ' wt8-on' : ''}`}
                                            onClick={() => setWalletTab('ewallet')}
                                        >
                                            E-Wallet
                                        </button>
                                    </div>
                                    <div className={`wt8-wl-panel${walletTab === 'bank' ? ' wt8-on' : ''}`}>
                                        <DigitalWalletSection
                                            bankAccounts={invitation.bankAccounts ?? []}
                                            digitalWallets={[]}
                                            onToast={showToast}
                                            styles={walletStyles}
                                        />
                                    </div>
                                    <div className={`wt8-wl-panel${walletTab === 'ewallet' ? ' wt8-on' : ''}`}>
                                        <DigitalWalletSection
                                            bankAccounts={[]}
                                            digitalWallets={invitation.digitalWallets ?? []}
                                            onToast={showToast}
                                            styles={{ ...walletStyles, ewalletTitle: 'wt8-hide' }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <DigitalWalletSection
                                    bankAccounts={invitation.bankAccounts ?? []}
                                    digitalWallets={invitation.digitalWallets ?? []}
                                    onToast={showToast}
                                    styles={walletStyles}
                                />
                            )}
                        </div>
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section id="wt8-rsvp" className="wt8-rsvp">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Konfirmasi Kehadiran</h2>
                                <p>{invitation.rsvpDeadline ? `Mohon konfirmasi sebelum ${invitation.rsvpDeadline}` : 'Mohon konfirmasi kehadiran Anda'}</p>
                            </div>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'wt8-rv-form',
                                    label: 'wt8-fg-label',
                                    input: 'wt8-fg-input',
                                    select: 'wt8-fg-input',
                                    textarea: 'wt8-fg-input',
                                    radioGroup: 'wt8-rv-status',
                                    radioLabel: 'wt8-rv-lbl',
                                    errorText: 'wt8-rv-error',
                                    submitBtn: 'wt8-btn-sub',
                                    successBox: 'wt8-rv-success',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section id="wt8-wishes" className="wt8-wishes">
                        <div className="wt8-container">
                            <div className="wt8-sec-title" data-anim="">
                                <h2>Ucapan &amp; Doa</h2>
                                <p>Sampaikan doa terbaik untuk kebahagiaan kami</p>
                            </div>
                            <div className="wt8-divider">
                                <span>🙏</span>
                            </div>
                            <WishesSection
                                wishesEndpoint={invitation.wishesEndpoint}
                                allowComments={invitation.allowComments}
                                onToast={showToast}
                                styles={{
                                    container: 'wt8-ws-layout',
                                    formBox: 'wt8-ws-form',
                                    formTitle: 'wt8-ws-form-title',
                                    nameInput: 'wt8-ws-input',
                                    messageInput: 'wt8-ws-input',
                                    submitBtn: 'wt8-btn-wish',
                                    wishCard: 'wt8-ws-card',
                                    wishAvatar: 'wt8-ws-av',
                                    wishName: 'wt8-ws-nm',
                                    wishDate: 'wt8-ws-dt',
                                    wishMessage: 'wt8-ws-txt',
                                    loadMoreBtn: 'wt8-btn-more',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section className="wt8-closing">
                    <span className="wt8-cl-deco wt8-cl-deco-tl">🌸</span>
                    <span className="wt8-cl-deco wt8-cl-deco-br">🌺</span>
                    <div className="wt8-container wt8-cl-container" data-anim="">
                        <p className="wt8-cl-sub">Terima Kasih atas Kehadiran &amp; Doa Anda</p>
                        <div className="wt8-cl-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </div>
                        <div className="wt8-cl-line" />
                        <p className="wt8-cl-msg">
                            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir dan memberikan doa
                            restu.
                            <br />
                            <br />
                            <em>&quot;Barakallahu laka wa baraka &apos;alaika wa jama&apos;a bainakuma fi khair&quot;</em>
                        </p>
                        <div className="wt8-cl-heart">💕</div>
                        <p className="wt8-cl-salam">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                    </div>
                </section>

                {isEnabled('footer') && (
                    <footer className="wt8-footer">
                        <p>
                            Made with <span className="wt8-footer-heart">♥</span> for{' '}
                            <strong>
                                {invitation.groomNickname} &amp; {invitation.brideNickname}
                            </strong>{' '}
                            — Walimatul &apos;Ursy {invitation.mainDateFormatted}
                        </p>
                        <p className="wt8-footer-sub">Digital Wedding Invitation</p>
                    </footer>
                )}
            </div>
            {/* end #wt8-mc */}

            {/* ── MUSIC PLAYER ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonClassName="wt8-mbt"
                    buttonStyle={{ bottom: '22px', right: '22px' }}
                />
            )}

            {/* ── TOAST ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wt8-toast" />
        </div>
    );
}

const walletStyles = {
    bankGrid: 'wt8-wl-grid',
    bankCard: 'wt8-wl-card',
    bankLogo: 'wt8-wl-logo',
    bankType: 'wt8-wl-type',
    bankNumber: 'wt8-wl-num',
    bankName: 'wt8-wl-name',
    copyBankBtn: 'wt8-btn-copy',
    ewalletGrid: 'wt8-wl-grid',
    ewalletCard: 'wt8-wl-card',
    ewalletName: 'wt8-wl-bank',
    ewalletPhone: 'wt8-wl-num',
    copyEwalletBtn: 'wt8-btn-copy',
    ewalletTitle: 'wt8-wl-ewallet-title',
};

// ── Decorative inline SVGs (no photo content — purely ornamental) ─────────────

function CoupleIllustration({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g>
                <circle cx="95" cy="62" r="28" fill="#FDBCB4" />
                <rect x="73" y="28" width="44" height="18" rx="4" fill="#2D2D2D" />
                <rect x="70" y="22" width="50" height="14" rx="3" fill="#1A1A1A" />
                <rect x="73" y="90" width="44" height="72" rx="9" fill="#F5F5F5" />
                <rect x="57" y="93" width="16" height="52" rx="8" fill="#F5F5F5" />
                <rect x="117" y="93" width="16" height="52" rx="8" fill="#F5F5F5" />
                <circle cx="50" cy="144" r="9" fill="#FDBCB4" />
                <circle cx="140" cy="144" r="9" fill="#FDBCB4" />
                <rect x="73" y="160" width="18" height="60" rx="5" fill="#555" />
                <rect x="99" y="160" width="18" height="60" rx="5" fill="#555" />
                <ellipse cx="82" cy="218" rx="12" ry="6" fill="#333" />
                <ellipse cx="108" cy="218" rx="12" ry="6" fill="#333" />
                <rect x="87" y="82" width="16" height="12" fill="#FDBCB4" />
                <ellipse cx="87" cy="62" rx="4" ry="5" fill="#3D2B1F" />
                <ellipse cx="103" cy="62" rx="4" ry="5" fill="#3D2B1F" />
                <path d="M88 73 Q95 79 102 73" stroke="#D4856A" fill="none" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g>
                <ellipse cx="225" cy="56" rx="30" ry="27" fill="#FEA1C8" />
                <circle cx="225" cy="60" r="24" fill="#FDBCB4" />
                <path d="M195 70 Q225 98 255 70" fill="#FEA1C8" />
                <rect x="213" y="84" width="24" height="14" fill="#FDBCB4" />
                <path d="M193 92 Q187 155 196 222 L254 222 Q263 155 257 92 Z" fill="#F76C9A" />
                <path d="M193 92 Q177 108 182 158 L196 155 Q192 114 200 100 Z" fill="#FEA1C8" />
                <path d="M257 92 Q273 108 268 158 L254 155 Q258 114 250 100 Z" fill="#FEA1C8" />
                <circle cx="178" cy="162" r="9" fill="#FDBCB4" />
                <circle cx="272" cy="162" r="9" fill="#FDBCB4" />
                <rect x="208" y="134" width="34" height="12" rx="6" fill="#C4547A" opacity=".5" />
                <ellipse cx="216" cy="58" rx="4" ry="5" fill="#3D2B1F" />
                <ellipse cx="234" cy="58" rx="4" ry="5" fill="#3D2B1F" />
                <path d="M217 70 Q225 77 233 70" stroke="#D4856A" fill="none" strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="225" cy="30" rx="22" ry="10" fill="#F76C9A" opacity=".5" />
            </g>
        </svg>
    );
}

function HeroFloral({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g opacity=".75">
                <circle cx="110" cy="60" r="26" fill="#F76C9A" />
                <circle cx="84" cy="88" r="18" fill="#FEA1C8" />
                <circle cx="136" cy="88" r="18" fill="#FEA1C8" />
                <circle cx="66" cy="118" r="13" fill="#FFD6E7" />
                <circle cx="154" cy="118" r="13" fill="#FFD6E7" />
                <ellipse cx="44" cy="90" rx="12" ry="26" fill="#8CC068" transform="rotate(-30 44 90)" />
                <ellipse cx="175" cy="78" rx="12" ry="26" fill="#70AD47" transform="rotate(30 175 78)" />
            </g>
        </svg>
    );
}
