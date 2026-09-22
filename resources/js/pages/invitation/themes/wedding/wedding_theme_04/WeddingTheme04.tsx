import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer, { type MusicPlayerHandle } from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, WeddingInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './wedding-theme-04.css';

interface WeddingTheme04Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const EVENT_ICONS = ['🕌', '🏛️', '🎊', '🌸', '⭐', '🎶'];

function addToCalendar(ev: WeddingInvitation['events'][0]) {
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

export default function WeddingTheme04({ invitation, visitor, greeting }: WeddingTheme04Props) {
    const features = invitation.features ?? {};

    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const musicPlayerRef = useRef<MusicPlayerHandle>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wt4-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.wt4-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => {
        setOpened(true);
        // Called synchronously from the click handler so the browser treats
        // it as a direct result of the user's gesture and allows autoplay.
        if (invitation.music?.autoplay) musicPlayerRef.current?.play();
    };

    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    return (
        <div className="wt4-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* ── Opening Overlay / Gate ────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`wt4-overlay${opened ? ' hide' : ''}`}>
                    <span className="wt4-gate-flower wt4-gate-flower-left" aria-hidden="true">
                        ❁
                    </span>
                    <span className="wt4-gate-flower wt4-gate-flower-right" aria-hidden="true">
                        ❁
                    </span>
                    <div className="wt4-overlay-frame">
                        <p className="wt4-overlay-eyebrow">The Wedding Of</p>
                        <h1 className="wt4-overlay-names">
                            {invitation.groomNickname}
                            <span className="wt4-overlay-amp">&amp;</span>
                            {invitation.brideNickname}
                        </h1>
                        <p className="wt4-overlay-date">{invitation.mainDateFormatted}</p>
                        {heroPhoto && (
                            <div className="wt4-overlay-photo">
                                <img src={heroPhoto} alt={`${invitation.groomNickname} & ${invitation.brideNickname}`} loading="eager" />
                            </div>
                        )}
                        {greetingEnabled && coverGuestName && (
                            <div className="wt4-overlay-greeting">
                                <p className="wt4-overlay-greeting-title">{greeting?.title ?? 'Kepada Bapak/Ibu/Saudara/i'}</p>
                                <p className="wt4-overlay-guest-name">{coverGuestName}</p>
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="wt4-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0 18px' }}>
                                <GuestQrCode
                                    data={invitation.guestQrData}
                                    size={110}
                                    style={{ borderRadius: '6px', border: '3px solid rgba(202,174,78,0.6)' }}
                                />
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', marginTop: '6px', letterSpacing: '1.5px' }}>
                                    QR Check-in Tamu
                                </p>
                            </div>
                        )}
                        <button className="wt4-btn-open" onClick={openInvitation}>
                            {greeting?.buttonText ?? 'Buka Undangan'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`wt4-main${opened ? ' visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section id="wt4-home" className="wt4-hero">
                    <span className="wt4-ornament wt4-ornament-tl" aria-hidden="true">
                        ❁
                    </span>
                    <span className="wt4-ornament wt4-ornament-tr" aria-hidden="true">
                        ❁
                    </span>
                    <div className="wt4-hero-inner wt4-anim-up">
                        <p className="wt4-eyebrow">The Wedding Of</p>
                        <h2 className="wt4-hero-name">
                            {invitation.groomNickname} <span className="wt4-hero-amp">&amp;</span> {invitation.brideNickname}
                        </h2>
                        <div
                            className="wt4-hero-frame"
                            style={heroPhoto ? {} : { display: 'grid', placeItems: 'center', color: 'var(--wt4-gold)' }}
                        >
                            {heroPhoto ? (
                                <img src={heroPhoto} alt={`${invitation.groomNickname} & ${invitation.brideNickname}`} loading="eager" />
                            ) : (
                                <span>
                                    {invitation.groomInitials} &amp; {invitation.brideInitials}
                                </span>
                            )}
                        </div>
                        <p className="wt4-hero-date">{invitation.mainDateFormatted}</p>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wt4-countdown"
                                boxClassName="wt4-countdown-box"
                                numClassName="wt4-countdown-num"
                                labelClassName="wt4-countdown-label"
                            />
                        )}
                        <a className="wt4-btn wt4-btn-primary" href="#wt4-couple">
                            Lihat Detail
                        </a>
                    </div>
                </section>

                {/* ── BISMILLAH / GREETING ─────────────────────────────────────── */}
                {greetingEnabled && invitation.openingQuote && (
                    <section className="wt4-greeting">
                        <div className="wt4-narrow wt4-anim-up">
                            <p className="wt4-bismillah">Bismillahirrahmanirrahim</p>
                            <p className="wt4-quran-verse">{invitation.openingQuote}</p>
                        </div>
                    </section>
                )}

                {/* ── COUPLE ────────────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section id="wt4-couple" className="wt4-section wt4-couple">
                        <span className="wt4-ornament wt4-ornament-leaf-left" aria-hidden="true">
                            ❁
                        </span>
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">You're Invited To</p>
                            <h2>Mempelai</h2>
                        </div>
                        <div className="wt4-couple-grid">
                            <article className="wt4-couple-card wt4-anim-up">
                                <div className="wt4-portrait">
                                    {groomPhoto ? (
                                        <img src={groomPhoto} alt={invitation.groomFullName} loading="lazy" />
                                    ) : (
                                        <span className="wt4-portrait-fallback">{invitation.groomInitials}</span>
                                    )}
                                </div>
                                <div className="wt4-couple-copy">
                                    <span>{invitation.groomNickname}</span>
                                    <h3>{invitation.groomFullName}</h3>
                                    {invitation.groomChildOrder && <p className="wt4-parents">{invitation.groomChildOrder} dari:</p>}
                                    {(invitation.groomFather || invitation.groomMother) && (
                                        <p>
                                            Bapak {invitation.groomFather}
                                            {invitation.groomFather && invitation.groomMother && ' & '}
                                            Ibu {invitation.groomMother}
                                        </p>
                                    )}
                                    {invitation.groomBio && <p>{invitation.groomBio}</p>}
                                </div>
                            </article>
                            <div className="wt4-heart-center wt4-anim-up">❤</div>
                            <article className="wt4-couple-card wt4-reverse wt4-anim-up">
                                <div className="wt4-portrait">
                                    {bridePhoto ? (
                                        <img src={bridePhoto} alt={invitation.brideFullName} loading="lazy" />
                                    ) : (
                                        <span className="wt4-portrait-fallback">{invitation.brideInitials}</span>
                                    )}
                                </div>
                                <div className="wt4-couple-copy">
                                    <span>{invitation.brideNickname}</span>
                                    <h3>{invitation.brideFullName}</h3>
                                    {invitation.brideChildOrder && <p className="wt4-parents">{invitation.brideChildOrder} dari:</p>}
                                    {(invitation.brideFather || invitation.brideMother) && (
                                        <p>
                                            Bapak {invitation.brideFather}
                                            {invitation.brideFather && invitation.brideMother && ' & '}
                                            Ibu {invitation.brideMother}
                                        </p>
                                    )}
                                    {invitation.brideBio && <p>{invitation.brideBio}</p>}
                                </div>
                            </article>
                        </div>
                    </section>
                )}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section id="wt4-event" className="wt4-section wt4-event-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Save The Date</p>
                            <h2>Rangkaian Acara</h2>
                        </div>
                        <div className="wt4-event-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                return (
                                    <article key={i} className="wt4-event-card wt4-anim-up">
                                        <span className="wt4-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <h3>{ev.name}</h3>
                                        <p>
                                            <strong>{ev.dateFormatted}</strong>
                                        </p>
                                        {timeStr && <strong>{timeStr}</strong>}
                                        {ev.locationName && <p>{ev.locationName}</p>}
                                        {ev.location && <p>{ev.location}</p>}
                                        <div style={{ marginTop: '10px' }}>
                                            {mapsUrl && (
                                                <a className="wt4-btn wt4-btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer">
                                                    Buka Peta
                                                </a>
                                            )}
                                            {isEnabled('add_to_calendar') && (
                                                <button className="wt4-btn wt4-btn-secondary" type="button" onClick={() => addToCalendar(ev)}>
                                                    Tambah ke Kalender
                                                </button>
                                            )}
                                        </div>
                                    </article>
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
                            <section id="wt4-address" className="wt4-section wt4-address-section">
                                <div className="wt4-address-wrap wt4-anim-up">
                                    <div>
                                        <p className="wt4-eyebrow">Alamat Acara</p>
                                        <h2>{ev.locationName || ev.name}</h2>
                                        {ev.location && <p>{ev.location}</p>}
                                        {mapsUrl && (
                                            <a className="wt4-btn wt4-btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer">
                                                Navigasi Lokasi
                                            </a>
                                        )}
                                    </div>
                                    {ev.mapsEmbed && (
                                        <div className="wt4-map-frame">
                                            <iframe
                                                title={`Lokasi ${ev.locationName || ev.name}`}
                                                src={ev.mapsEmbed}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── LOVE STORY ────────────────────────────────────────────────── */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <section id="wt4-story" className="wt4-section wt4-story-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Our Journey</p>
                            <h2>Love Story</h2>
                        </div>
                        <div className="wt4-timeline">
                            {invitation.loveStory.map((item, i) => (
                                <article key={i} className="wt4-timeline-item wt4-anim-up">
                                    <div className="wt4-timeline-dot">{String(i + 1).padStart(2, '0')}</div>
                                    {item.photo && (
                                        <div className="wt4-timeline-photo">
                                            <img src={item.photo} alt={item.title} loading="lazy" />
                                        </div>
                                    )}
                                    <div className="wt4-timeline-copy">
                                        <time>{item.date}</time>
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section id="wt4-gallery" className="wt4-section wt4-gallery-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Moments</p>
                            <h2>Gallery</h2>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            showFilters
                            filters={[
                                { key: 'prewedding', label: 'Prewedding' },
                                { key: 'engagement', label: 'Engagement' },
                            ]}
                            styles={{
                                grid: 'wt4-gallery-grid',
                                item: 'wt4-gallery-item',
                                thumb: 'wt4-gallery-thumb',
                                overlay: 'wt4-gallery-overlay',
                                filterBar: 'wt4-gallery-filter-bar',
                                filterBtn: 'wt4-filter-btn',
                                filterBtnActive: 'wt4-filter-btn wt4-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <section className="wt4-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Our Moment</p>
                            <h2>Video Mempelai</h2>
                        </div>
                        <div className="wt4-video-frame wt4-anim-up">
                            <iframe
                                src={coupleVideoEmbedUrl}
                                title="Video Mempelai"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </section>
                )}

                {/* ── DRESS CODE ────────────────────────────────────────────────── */}
                <section id="wt4-dress" className="wt4-section wt4-dress-section">
                    <div className="wt4-dress-wrap wt4-anim-up">
                        <div>
                            <p className="wt4-eyebrow">Guest Attire</p>
                            <h2>Dress Code</h2>
                            <p>Kenakan busana terbaik dengan warna lembut yang selaras dengan nuansa acara.</p>
                        </div>
                        <div className="wt4-palette">
                            {(invitation.dressCodes?.length
                                ? invitation.dressCodes
                                : [
                                      { name: 'Teal', hex: '#28585c' },
                                      { name: 'Gold', hex: '#caae4e' },
                                      { name: 'Ivory', hex: '#eeecef' },
                                      { name: 'Sage', hex: '#8c9c75' },
                                  ]
                            ).map((dc, i) => (
                                <div key={i} className="wt4-swatch">
                                    <span style={{ background: dc.hex }} />
                                    <p>{dc.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── DIGITAL WALLET / GIFT ─────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section id="wt4-gift" className="wt4-section wt4-gift-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Wedding Gift</p>
                            <h2>Amplop Digital</h2>
                        </div>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'wt4-gift-grid',
                                bankCard: 'wt4-gift-card',
                                bankLogo: 'wt4-gift-logo',
                                bankType: 'wt4-gift-type',
                                bankNumber: 'wt4-gift-number',
                                bankName: 'wt4-gift-name',
                                copyBankBtn: 'wt4-btn wt4-btn-secondary',
                                ewalletGrid: 'wt4-gift-grid',
                                ewalletCard: 'wt4-gift-card',
                                ewalletName: 'wt4-gift-name',
                                ewalletPhone: 'wt4-gift-number',
                                copyEwalletBtn: 'wt4-btn wt4-btn-secondary',
                                ewalletTitle: 'wt4-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section id="wt4-rsvp" className="wt4-section wt4-rsvp-section">
                        <div className="wt4-form-wrap wt4-anim-up">
                            <div>
                                <p className="wt4-eyebrow">Konfirmasi</p>
                                <h2>RSVP</h2>
                                <p>Mohon isi konfirmasi kehadiran agar kami dapat menyiapkan penyambutan terbaik.</p>
                                {invitation.rsvpDeadline && (
                                    <p>
                                        <strong>Konfirmasi sebelum {invitation.rsvpDeadline}</strong>
                                    </p>
                                )}
                            </div>
                            <RSVPForm
                                rsvpEndpoint={invitation.rsvpEndpoint}
                                guestName={invitation.guestName || undefined}
                                guestSlug={invitation.guestSlug}
                                onToast={showToast}
                                styles={{
                                    form: 'wt4-form-card',
                                    label: 'wt4-form-label',
                                    input: 'wt4-form-input',
                                    select: 'wt4-form-input',
                                    textarea: 'wt4-form-input',
                                    radioGroup: 'wt4-rsvp-radio-group',
                                    radioLabel: 'wt4-rsvp-radio-label',
                                    errorText: 'wt4-rsvp-error',
                                    submitBtn: 'wt4-btn wt4-btn-primary',
                                    successBox: 'wt4-rsvp-success',
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section id="wt4-wishes" className="wt4-section wt4-wishes-section">
                        <div className="wt4-section-heading wt4-anim-up">
                            <p className="wt4-eyebrow">Wishes</p>
                            <h2>Ucapan &amp; Doa</h2>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'wt4-wish-layout',
                                formBox: 'wt4-form-card',
                                formTitle: 'wt4-wish-form-title',
                                nameInput: 'wt4-form-input',
                                messageInput: 'wt4-form-input',
                                submitBtn: 'wt4-btn wt4-btn-primary',
                                wishCard: 'wt4-wish-card',
                                wishAvatar: 'wt4-wish-avatar',
                                wishName: 'wt4-wish-name',
                                wishDate: 'wt4-wish-date',
                                wishMessage: 'wt4-wish-message',
                                loadMoreBtn: 'wt4-btn wt4-btn-secondary',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING VERSE ─────────────────────────────────────────────── */}
                {invitation.openingQuote && (
                    <section className="wt4-verse-section">
                        <div className="wt4-narrow wt4-anim-up">
                            <p>&ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.&rdquo;</p>
                            <span>QS. Ar-Rum: 21</span>
                        </div>
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section id="wt4-closing" className="wt4-closing-section">
                    <span className="wt4-ornament wt4-ornament-bl" aria-hidden="true">
                        ❁
                    </span>
                    <span className="wt4-ornament wt4-ornament-br" aria-hidden="true">
                        ❁
                    </span>
                    <div className="wt4-narrow wt4-anim-up">
                        <p>Atas kehadiran Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.</p>
                        <h2>
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </h2>
                        <p className="wt4-hero-date">{invitation.mainDateFormatted}</p>
                        <p className="wt4-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                    </div>
                </section>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    ref={musicPlayerRef}
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--wt4-teal-dark)', border: '1px solid var(--wt4-gold)', color: 'var(--wt4-gold)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wt4-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="wt4-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
