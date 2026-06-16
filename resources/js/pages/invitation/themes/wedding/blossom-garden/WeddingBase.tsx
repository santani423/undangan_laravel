import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { WeddingInvitation } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './wedding-base.css';

interface WeddingBaseProps {
    invitation: WeddingInvitation;
}

const EVENT_ICONS = ['🕌', '🏛️', '🎊', '🌸', '⭐', '🎶'];

function addToCalendar(ev: WeddingInvitation['events'][0]) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '080000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '100000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.name)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
    window.open(url, '_blank');
}

export default function WeddingBase({ invitation }: WeddingBaseProps) {
    const [opened, setOpened] = useState(false);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('wb-visible')),
            { threshold: 0.1 },
        );
        document.querySelectorAll('.wb-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Back to top visibility
    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const groomPhoto  = invitation.groomPhoto;
    const bridePhoto  = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    // Hero photo: prefer couplePhoto, fallback to groomPhoto
    const heroPhoto   = couplePhoto || groomPhoto;

    return (
        <div className="wb-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Lato:wght@300;400;700&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            <div className={`wb-overlay${opened ? ' hide' : ''}`}>
                {/* Background foto mempelai */}
                {heroPhoto && (
                    <div
                        className="wb-overlay-photo-bg"
                        style={{ backgroundImage: `url(${heroPhoto})` }}
                    />
                )}
                <div className="wb-overlay-frame">
                    <div className="wb-corner-tr" />
                    <div className="wb-corner-bl" />
                    <span className="wb-overlay-leaves wb-leaf-tl">🌿</span>
                    <span className="wb-overlay-leaves wb-leaf-tr">🌿</span>
                    <span className="wb-overlay-leaves wb-leaf-bl">🌿</span>
                    <span className="wb-overlay-leaves wb-leaf-br">🌿</span>
                    <p className="wb-overlay-bismillah">بسم الله الرحمن الرحيم</p>
                    <div className="wb-overlay-divider" />
                    {/* Foto mempelai bulat di overlay */}
                    {(groomPhoto || bridePhoto) && (
                        <div className="wb-overlay-couple-photos">
                            {groomPhoto && (
                                <div
                                    className="wb-overlay-couple-photo"
                                    style={{ backgroundImage: `url(${groomPhoto})` }}
                                    title={invitation.groomNickname}
                                />
                            )}
                            {bridePhoto && (
                                <div
                                    className="wb-overlay-couple-photo wb-overlay-couple-photo--bride"
                                    style={{ backgroundImage: `url(${bridePhoto})` }}
                                    title={invitation.brideNickname}
                                />
                            )}
                        </div>
                    )}
                    {invitation.guestName && (
                        <p style={{ color: 'rgba(232,213,163,0.6)', fontSize: '0.8rem', marginBottom: '8px', letterSpacing: '2px' }}>
                            Kepada Yth. {invitation.guestName}
                        </p>
                    )}
                    <p className="wb-overlay-of">The Wedding of</p>
                    <div className="wb-overlay-names">
                        {invitation.groomFullName}
                        <span className="wb-overlay-amp">&</span>
                        {invitation.brideFullName}
                    </div>
                    <div className="wb-overlay-divider" />
                    <p className="wb-overlay-date">{invitation.mainDateFormatted}</p>
                    <button className="wb-btn-open" onClick={openInvitation}>
                        ✦ Buka Undangan ✦
                    </button>
                </div>
            </div>

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`wb-main${opened ? ' visible' : ''}`}>

                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <section className="wb-hero">
                    <div className="wb-hero-frame wb-anim-up">
                        <p className="wb-hero-label">The Wedding of</p>
                        <h1 className="wb-hero-name">{invitation.groomNickname}</h1>
                        <span className="wb-hero-amp">&amp;</span>
                        <h1 className="wb-hero-name">{invitation.brideNickname}</h1>
                        <div
                            className="wb-hero-photo"
                            style={
                                heroPhoto
                                    ? { backgroundImage: `url(${heroPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                    : {}
                            }
                        >
                            {!heroPhoto && `${invitation.groomInitials} & ${invitation.brideInitials}`}
                        </div>
                        <p className="wb-hero-date">{invitation.mainDateFormatted}</p>
                        <div className="wb-gold-divider"><span>✦</span></div>
                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wb-countdown"
                                boxClassName="wb-countdown-box"
                                numClassName="wb-countdown-num"
                                labelClassName="wb-countdown-label"
                            />
                        )}
                        <div className="wb-scroll-indicator">↓</div>
                    </div>
                </section>

                {/* ── BISMILLAH ─────────────────────────────────────────────────── */}
                <section className="wb-bismillah">
                    <div className="wb-gold-line" />
                    <p className="wb-arabic">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                    <div className="wb-gold-line" />
                    <p className="wb-quran-verse wb-anim-up">
                        {invitation.openingQuote ||
                            '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."'}
                    </p>
                    <p className="wb-quran-ref wb-anim-up">(QS. Ar-Rum: 21)</p>
                </section>

                {/* ── COUPLE ────────────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && <section className="wb-section wb-couple">
                    <h2 className="wb-section-title wb-anim-up">Mempelai</h2>
                    <div className="wb-gold-divider wb-anim-up"><span>💍</span></div>
                    <div className="wb-couple-grid">
                        {/* Groom */}
                        <div className="wb-couple-card wb-anim-up">
                            <span className="wb-couple-badge">♚ Mempelai Pria</span>
                            <div
                                className="wb-couple-photo wb-groom-photo"
                                style={
                                    groomPhoto
                                        ? { backgroundImage: `url(${groomPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >
                                {!groomPhoto && invitation.groomInitials}
                            </div>
                            <h3 className="wb-couple-name">{invitation.groomFullName}</h3>
                            {invitation.groomChildOrder && (
                                <p className="wb-couple-child">{invitation.groomChildOrder} dari:</p>
                            )}
                            <p className="wb-couple-parents">
                                {invitation.groomFather}
                                {invitation.groomFather && invitation.groomMother && <><br />&amp; </>}
                                {invitation.groomMother}
                            </p>
                            {invitation.groomBio && <p className="wb-couple-bio">{invitation.groomBio}</p>}
                        </div>
                        {/* Heart */}
                        <div className="wb-heart-center wb-anim-up">❤</div>
                        {/* Bride */}
                        <div className="wb-couple-card wb-anim-up">
                            <span className="wb-couple-badge" style={{ background: '#c47f8a' }}>♛ Mempelai Wanita</span>
                            <div
                                className="wb-couple-photo wb-bride-photo"
                                style={
                                    bridePhoto
                                        ? { backgroundImage: `url(${bridePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >
                                {!bridePhoto && invitation.brideInitials}
                            </div>
                            <h3 className="wb-couple-name">{invitation.brideFullName}</h3>
                            {invitation.brideChildOrder && (
                                <p className="wb-couple-child">{invitation.brideChildOrder} dari:</p>
                            )}
                            <p className="wb-couple-parents">
                                {invitation.brideFather}
                                {invitation.brideFather && invitation.brideMother && <><br />&amp; </>}
                                {invitation.brideMother}
                            </p>
                            {invitation.brideBio && <p className="wb-couple-bio">{invitation.brideBio}</p>}
                        </div>
                    </div>
                </section>}

                {/* ── EVENTS ────────────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="wb-section wb-events-bg">
                        <h2 className="wb-section-title light wb-anim-up">Rangkaian Acara</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>🌿</span></div>
                        <div className="wb-events-grid">
                            {invitation.events.map((ev, i) => {
                                const mapsUrl =
                                    ev.locationUrl ||
                                    (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                const timeStr = ev.time
                                    ? ev.timeEnd
                                        ? `${ev.time} – ${ev.timeEnd} WIB`
                                        : `${ev.time} WIB`
                                    : '';
                                return (
                                    <div key={i} className="wb-event-card wb-anim-up">
                                        <span className="wb-event-icon">{EVENT_ICONS[i % EVENT_ICONS.length]}</span>
                                        <p className="wb-event-type">{ev.name}</p>
                                        <h3 className="wb-event-name">{ev.name}</h3>
                                        <div className="wb-event-divider" />
                                        <p className="wb-event-detail"><strong>{ev.dateFormatted}</strong></p>
                                        {timeStr && <p className="wb-event-detail">{timeStr}</p>}
                                        <div className="wb-event-divider" />
                                        {ev.locationName && <p className="wb-event-detail"><strong>{ev.locationName}</strong></p>}
                                        {ev.location && <p className="wb-event-detail">{ev.location}</p>}
                                        <div style={{ marginTop: '25px' }}>
                                            {mapsUrl && (
                                                <a href={mapsUrl} target="_blank" rel="noreferrer" className="wb-btn-event">
                                                    🗺️ Lihat Peta
                                                </a>
                                            )}
                                            <button className="wb-btn-event" onClick={() => addToCalendar(ev)}>
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
                {isEnabled('location') && invitation.events.length > 0 && (() => {
                    const ev = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
                    const mapsUrl =
                        ev.locationUrl ||
                        (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                    if (!ev.mapsEmbed && !mapsUrl) return null;
                    return (
                        <section className="wb-section">
                            <h2 className="wb-section-title wb-anim-up">Lokasi Acara</h2>
                            <div className="wb-gold-divider wb-anim-up"><span>🗺️</span></div>
                            {ev.locationName && (
                                <p style={{ textAlign: 'center', color: 'var(--wb-gold)', fontSize: '1rem', marginBottom: '8px', fontStyle: 'italic' }} className="wb-anim-up">
                                    {ev.name} · {ev.locationName}
                                </p>
                            )}
                            <div style={{ maxWidth: '900px', margin: '0 auto' }} className="wb-anim-up">
                                {ev.mapsEmbed && (
                                    <div className="wb-map-wrapper">
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
                                        <a href={mapsUrl} target="_blank" rel="noreferrer" className="wb-btn-maps">
                                            🗺️ Buka Google Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    );
                })()}

                {/* ── LOVE STORY TIMELINE ───────────────────────────────────────── */}
                {isEnabled('love_story') && invitation.loveStory?.length > 0 && (
                    <section className="wb-section">
                        <h2 className="wb-section-title wb-anim-up">Perjalanan Cinta Kami</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>💕</span></div>
                        <div className="wb-timeline-container">
                            <div className="wb-timeline-line" />
                            {invitation.loveStory.map((item, i) => {
                                const side = i % 2 === 0 ? 'left' : 'right';
                                const content = (
                                    <div className={`wb-timeline-content ${side} wb-anim-up`}>
                                        {item.photo && (
                                            <div
                                                className="wb-timeline-photo"
                                                style={{ backgroundImage: `url(${item.photo})` }}
                                            />
                                        )}
                                        <p className="wb-timeline-date">{item.date}</p>
                                        <h3 className="wb-timeline-title">{item.title}</h3>
                                        <p className="wb-timeline-desc">{item.desc}</p>
                                    </div>
                                );
                                return (
                                    <div key={i} className="wb-timeline-item">
                                        {side === 'left' ? (
                                            <>
                                                {content}
                                                <div className="wb-timeline-dot" />
                                                <div />
                                            </>
                                        ) : (
                                            <>
                                                <div />
                                                <div className="wb-timeline-dot" />
                                                {content}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="wb-section wb-gallery-bg">
                        <h2 className="wb-section-title wb-anim-up">Galeri Foto</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>📷</span></div>
                        <GallerySection
                            items={invitation.gallery}
                            showFilters
                            filters={[
                                { key: 'prewedding', label: 'Prewedding' },
                                { key: 'engagement', label: 'Engagement' },
                            ]}
                            styles={{
                                grid: 'wb-gallery-grid',
                                item: 'wb-gallery-item',
                                thumb: 'wb-gallery-thumb',
                                overlay: 'wb-gallery-overlay',
                                filterBar: 'wb-gallery-filter-bar',
                                filterBtn: 'wb-filter-btn',
                                filterBtnActive: 'wb-filter-btn wb-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── DRESS CODE ────────────────────────────────────────────────── */}
                {(invitation.dressCodes && invitation.dressCodes.length > 0) && (
                    <section className="wb-section wb-dresscode-bg">
                        <h2 className="wb-section-title light wb-anim-up">Dress Code</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>👗</span></div>
                        <p className="wb-dresscode-note wb-anim-up">
                            Kami dengan hormat memohon tamu undangan untuk mengenakan pakaian formal/semi-formal sesuai palet warna berikut:
                        </p>
                        {invitation.dressCodes && invitation.dressCodes.length > 0 ? (
                            <div className="wb-color-swatches wb-anim-up">
                                {invitation.dressCodes.map((dc, i) => (
                                    <div key={i} className="wb-swatch">
                                        <div className="wb-swatch-circle" style={{ background: dc.hex }} />
                                        <p className="wb-swatch-name">{dc.name}</p>
                                        <p className="wb-swatch-hex">{dc.hex}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="wb-color-swatches wb-anim-up">
                                {[
                                    { name: 'Hijau Hutan', hex: '#2D5016' },
                                    { name: 'Emas', hex: '#C9A84C' },
                                    { name: 'Krem/Ivory', hex: '#FDF8F0' },
                                    { name: 'Dusty Rose', hex: '#E8B4B8' },
                                ].map((dc, i) => (
                                    <div key={i} className="wb-swatch">
                                        <div className="wb-swatch-circle" style={{ background: dc.hex }} />
                                        <p className="wb-swatch-name">{dc.name}</p>
                                        <p className="wb-swatch-hex">{dc.hex}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="wb-dresscode-rules wb-anim-up">
                            <ul>
                                <li>Mohon hindari pakaian berwarna putih atau hitam pekat</li>
                                <li>Pakaian formal: jas, kemeja, batik formal untuk pria</li>
                                <li>Gaun/kebaya/dress formal untuk wanita</li>
                                <li>Sepatu tertutup direkomendasikan</li>
                            </ul>
                        </div>
                    </section>
                )}

                {/* ── DIGITAL WALLET ────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="wb-section">
                        <h2 className="wb-section-title wb-anim-up">Amplop Digital</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>💌</span></div>
                        <p className="wb-wallet-subtitle wb-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin
                            memberikan tanda kasih, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'wb-bank-grid',
                                bankCard: 'wb-bank-card',
                                bankLogo: 'wb-bank-logo',
                                bankType: 'wb-bank-type',
                                bankNumber: 'wb-bank-number',
                                bankName: 'wb-bank-name',
                                copyBankBtn: 'wb-btn-copy-bank',
                                ewalletGrid: 'wb-ewallet-grid',
                                ewalletCard: 'wb-ewallet-card',
                                ewalletName: 'wb-ewallet-name',
                                ewalletPhone: 'wb-ewallet-phone',
                                copyEwalletBtn: 'wb-btn-copy-ewallet',
                                ewalletTitle: 'wb-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="wb-section">
                        <h2 className="wb-section-title wb-anim-up">Konfirmasi Kehadiran</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>✉️</span></div>
                        {invitation.rsvpDeadline && (
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <span style={{
                                    background: 'var(--wb-green)', color: 'var(--wb-gold-light)',
                                    padding: '10px 20px', fontSize: '0.85rem', letterSpacing: '2px',
                                    display: 'inline-block',
                                }}>
                                    ⏰ Konfirmasi sebelum {invitation.rsvpDeadline}
                                </span>
                            </div>
                        )}
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            onToast={showToast}
                            styles={{
                                form: 'wb-rsvp-form',
                                label: 'wb-rsvp-label',
                                input: 'wb-rsvp-input',
                                select: 'wb-rsvp-select',
                                textarea: 'wb-rsvp-textarea',
                                radioGroup: 'wb-rsvp-radio-group',
                                radioLabel: 'wb-rsvp-radio-label',
                                errorText: 'wb-rsvp-error',
                                submitBtn: 'wb-rsvp-submit',
                                successBox: 'wb-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="wb-section wb-wishes-bg">
                        <h2 className="wb-section-title wb-anim-up">Ucapan &amp; Doa</h2>
                        <div className="wb-gold-divider wb-anim-up"><span>💬</span></div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'wb-wishes-layout',
                                formBox: 'wb-wishes-form',
                                formTitle: 'wb-wishes-form-title',
                                nameInput: 'wb-wish-input',
                                messageInput: 'wb-wish-input',
                                submitBtn: 'wb-wish-btn',
                                wishCard: 'wb-wish-card',
                                wishAvatar: 'wb-wish-avatar',
                                wishName: 'wb-wish-name',
                                wishDate: 'wb-wish-date',
                                wishMessage: 'wb-wish-message',
                                loadMoreBtn: 'wb-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                <section className="wb-closing">
                    <div className="wb-closing-frame wb-anim-up">
                        <div className="wb-gold-line" />
                        <p className="wb-closing-title">Terima Kasih</p>
                        <div className="wb-gold-line" />
                        <p className="wb-closing-sub">
                            Atas segala doa dan kehadiran<br />
                            Bapak/Ibu/Saudara/i<br />
                            yang kami muliakan.
                        </p>
                        <p className="wb-closing-from">Kami yang berbahagia,</p>
                        <p className="wb-closing-names">
                            {invitation.groomNickname} &amp; {invitation.brideNickname}
                        </p>
                        <p className="wb-closing-family">
                            Keluarga Besar {invitation.groomFather}{invitation.groomMother ? ` & ${invitation.groomMother}` : ''}<br />
                            Keluarga Besar {invitation.brideFather}{invitation.brideMother ? ` & ${invitation.brideMother}` : ''}
                        </p>
                        <div className="wb-gold-line" />
                        <p style={{ color: 'var(--wb-gold)', fontSize: '1.5rem', animation: 'wbFloat 3s ease-in-out infinite' }}>❤</p>
                        <p className="wb-closing-credit">Created with love ✦ Undesia Digital Invitation</p>
                    </div>
                </section>

            </div>{/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    buttonStyle={{ background: 'var(--wb-green)', border: '1px solid var(--wb-gold)', color: 'var(--wb-gold)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="wb-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="wb-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
