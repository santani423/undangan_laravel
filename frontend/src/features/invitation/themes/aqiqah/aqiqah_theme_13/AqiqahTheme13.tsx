import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { useEffect, useState } from 'react';
import './aqiqah-theme-13.css';

interface AqiqahTheme13Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const DAY_NAMES = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

function addToCalendar(ev: InvitationEvent, babyName: string) {
    const start = (ev.date || '').replace(/-/g, '') + 'T' + (ev.time || '090000').replace(/:/g, '') + '00Z';
    const end = (ev.date || '').replace(/-/g, '') + 'T' + (ev.timeEnd || ev.time || '120000').replace(/:/g, '') + '00Z';
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Tasyakuran Aqiqah ${babyName}`)}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;
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

function lineageWord(gender: string): string {
    if (gender === 'Laki-laki') return 'bin';
    if (gender === 'Perempuan') return 'binti';
    return '';
}

/** Split "YYYY-MM-DD" into the three lines printed on the calendar badge. */
function badgeParts(ev: InvitationEvent): { day: string; num: string; monthYear: string } | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ev.date || '');
    if (!m) return null;
    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    if (Number.isNaN(date.getTime())) return null;
    return { day: DAY_NAMES[date.getDay()], num: d, monthYear: `${MONTH_NAMES[date.getMonth()]} ${y}` };
}

function mapsUrlOf(ev: InvitationEvent): string {
    if (ev.locationUrl) return ev.locationUrl;
    if (ev.mapsLat && ev.mapsLng) return `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}`;
    const q = [ev.locationName, ev.location].filter(Boolean).join(' ');
    return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/* ── Decorative pieces ─────────────────────────────────────────────────────── */

function PacifierSymbol() {
    return (
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <symbol id="aq13-paci" viewBox="0 0 60 90">
                <path d="M22 44 C18 26 22 6 30 4 C38 6 42 26 38 44Z" fill="#f7a92d" stroke="#2d1a3a" strokeWidth="3" />
                <path d="M26 30 C25 20 27 12 30 10" fill="none" stroke="#ffd680" strokeWidth="3" strokeLinecap="round" />
                <rect x="6" y="42" width="48" height="12" rx="6" fill="#e9528f" stroke="#2d1a3a" strokeWidth="3" transform="rotate(-8 30 48)" />
                <circle cx="30" cy="72" r="12" fill="none" stroke="#e9528f" strokeWidth="6" />
                <circle cx="30" cy="72" r="12" fill="none" stroke="#2d1a3a" strokeWidth="2" />
                <rect x="26" y="54" width="8" height="8" fill="#b83a73" stroke="#2d1a3a" strokeWidth="2" />
            </symbol>
        </svg>
    );
}

function CoverToys() {
    return (
        <>
            <svg className="aq13-toy aq13-wobble" style={{ left: -4, top: 150, width: 46, height: 70 }} aria-hidden="true">
                <use href="#aq13-paci" />
            </svg>
            <svg className="aq13-toy" style={{ right: 6, top: 118, width: 34, height: 34 }} viewBox="0 0 40 40" aria-hidden="true">
                <path d="M10 10l20 20M30 10L10 30" stroke="#f07c12" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <svg className="aq13-toy" style={{ right: 18, top: 270, width: 26, height: 26 }} viewBox="0 0 26 26" aria-hidden="true">
                <circle cx="13" cy="13" r="12" fill="#fff" />
            </svg>
            <svg className="aq13-toy" style={{ left: 10, top: 330, width: 30, height: 30 }} viewBox="0 0 30 30" aria-hidden="true">
                <path d="M15 3v24M3 15h24" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
            </svg>
        </>
    );
}

function Banner() {
    return (
        <div className="aq13-banner">
            <svg viewBox="0 0 360 80" role="img" aria-label="Tasyakuran Aqiqah">
                <path d="M6 30 L50 22 L50 70 L6 76 L22 52Z" fill="#b83a73" />
                <path d="M354 30 L310 22 L310 70 L354 76 L338 52Z" fill="#b83a73" />
                <path d="M50 70 L64 60 L64 76Z M310 70 L296 60 L296 76Z" fill="#8a1a4f" />
                <path d="M40 14 Q180 -6 320 14 L320 62 Q180 42 40 62Z" fill="#e9528f" />
                <text
                    x="180"
                    y="46"
                    fontFamily="Lilita One, Arial Black, sans-serif"
                    fontSize="22"
                    fill="#fff"
                    letterSpacing="1"
                    textAnchor="middle"
                    textLength="236"
                    lengthAdjust="spacingAndGlyphs"
                >
                    TASYAKURAN AQIQAH
                </text>
            </svg>
        </div>
    );
}

function BabyFrame({ photo, name }: { photo?: string; name: string }) {
    return (
        <div className="aq13-frame">
            {photo ? <img src={photo} alt={`Foto ${name}`} /> : <span className="aq13-frame-initial">{name?.charAt(0) || '👶'}</span>}
        </div>
    );
}

function DateBadge({ ev }: { ev: InvitationEvent }) {
    const parts = badgeParts(ev);
    return (
        <div className="aq13-badge">
            <svg viewBox="0 0 120 120" role="img" aria-label={ev.dateFormatted || ev.date}>
                <g fill="none" stroke="#3d2a33" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M26 88 C8 70 8 40 24 20" />
                    <path d="M94 88 C112 70 112 40 96 20" />
                </g>
                <g fill="#3d2a33">
                    <ellipse cx="14" cy="60" rx="3.5" ry="8" transform="rotate(-10 14 60)" />
                    <ellipse cx="15" cy="42" rx="3.5" ry="8" transform="rotate(20 15 42)" />
                    <ellipse cx="20" cy="76" rx="3.5" ry="8" transform="rotate(-35 20 76)" />
                    <ellipse cx="22" cy="27" rx="3.5" ry="7" transform="rotate(35 22 27)" />
                    <ellipse cx="106" cy="60" rx="3.5" ry="8" transform="rotate(10 106 60)" />
                    <ellipse cx="105" cy="42" rx="3.5" ry="8" transform="rotate(-20 105 42)" />
                    <ellipse cx="100" cy="76" rx="3.5" ry="8" transform="rotate(35 100 76)" />
                    <ellipse cx="98" cy="27" rx="3.5" ry="7" transform="rotate(-35 98 27)" />
                </g>
                {parts && (
                    <>
                        <text
                            x="60"
                            y="30"
                            textAnchor="middle"
                            fontFamily="Baloo 2, sans-serif"
                            fontWeight="800"
                            fontSize="11"
                            letterSpacing="2"
                            fill="#86666f"
                        >
                            {parts.day}
                        </text>
                        <text x="60" y="70" textAnchor="middle" fontFamily="Lilita One, Arial Black, sans-serif" fontSize="44" fill="#3d2a33">
                            {parts.num}
                        </text>
                        <text
                            x="60"
                            y="84"
                            textAnchor="middle"
                            fontFamily="Baloo 2, sans-serif"
                            fontWeight="800"
                            fontSize="11"
                            letterSpacing="1"
                            fill="#3d2a33"
                        >
                            {parts.monthYear}
                        </text>
                    </>
                )}
                <path d="M10 92 L28 88 L28 108 L10 112 L18 100Z M110 92 L92 88 L92 108 L110 112 L102 100Z" fill="#c9600a" />
                <path d="M24 90 Q60 82 96 90 L96 110 Q60 102 24 110Z" fill="#f07c12" />
                <text
                    x="60"
                    y="104"
                    textAnchor="middle"
                    fontFamily="Lilita One, Arial Black, sans-serif"
                    fontSize="12"
                    letterSpacing="1.5"
                    fill="#fff"
                >
                    AQIQAH
                </text>
            </svg>
        </div>
    );
}

/* ── Theme ─────────────────────────────────────────────────────────────────── */

export default function AqiqahTheme13({ invitation, visitor, greeting }: AqiqahTheme13Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const { toast, showToast, clearToast } = useToast();

    // Scroll-triggered animations
    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq13-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq13-anim-up').forEach((el) => observer.observe(el));
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
        window.scrollTo({ top: 0 });
    };

    const copyAddress = (ev: InvitationEvent) => {
        const text = [ev.locationName, ev.location].filter(Boolean).join(', ');
        if (!text) return;
        navigator.clipboard?.writeText(text).then(
            () => showToast('Alamat disalin'),
            () => showToast('Gagal menyalin alamat'),
        );
    };

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;

    const genderWord = genderLabel(babyGender);
    const lineage = lineageWord(babyGender);
    const bornLine = [genderWord || 'Buah hati', invitation.babyName].filter(Boolean).join(' · ');

    const hasParents = Boolean(invitation.fatherName || invitation.motherName);
    const familyLine =
        invitation.fatherName && invitation.motherName
            ? `Bpk. ${invitation.fatherName} & Ibu ${invitation.motherName}`
            : invitation.fatherName
              ? `Bpk. ${invitation.fatherName}`
              : invitation.motherName
                ? `Ibu ${invitation.motherName}`
                : '';

    const mapEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const mapEventUrl = mapEvent ? mapsUrlOf(mapEvent) : '';

    return (
        <div className="aq13-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Baloo+2:wght@400;600;700;800&family=Lilita+One&family=Pacifico&display=swap');
            `}</style>

            <PacifierSymbol />

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq13-overlay${opened ? ' aq13-hide' : ''}`}>
                    <div className="aq13-wrap">
                        <header className="aq13-cover">
                            <CoverToys />
                            <p className="aq13-title">UNDANGAN</p>
                            <BabyFrame photo={babyPhoto} name={invitation.babyName} />
                            <Banner />
                            <span className="aq13-born">{bornLine}</span>

                            {greetingEnabled && coverGuestName && (
                                <div className="aq13-to">
                                    <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                    <strong>{coverGuestName}</strong>
                                    {guestName && greeting?.guestLabel ? <span>{greeting.guestLabel}</span> : <span>di tempat</span>}
                                </div>
                            )}
                            {greetingEnabled && greeting?.message && <p className="aq13-overlay-message">{greeting.message}</p>}
                            {invitation.guestQrData && (
                                <div className="aq13-overlay-qr">
                                    <GuestQrCode
                                        data={invitation.guestQrData}
                                        size={120}
                                        style={{ borderRadius: '12px', border: '4px solid #fff', background: '#fff' }}
                                    />
                                    <p className="aq13-overlay-qr-label">QR Check-in Tamu</p>
                                </div>
                            )}
                            <button type="button" className="aq13-open" onClick={openInvitation}>
                                {greeting?.buttonText ?? 'Buka Undangan'}
                                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                    <path
                                        d="M8 3v10M3 8l5 5 5-5"
                                        stroke="#fff"
                                        strokeWidth="2.4"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </header>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div className={`aq13-main${opened ? ' aq13-main-visible' : ''}`}>
                <div className="aq13-wrap">
                    {/* ── HERO ──────────────────────────────────────────────────────── */}
                    <header className="aq13-cover">
                        <CoverToys />
                        <h1 className="aq13-title">UNDANGAN</h1>
                        <BabyFrame photo={babyPhoto} name={invitation.babyName} />
                        <Banner />
                        <span className="aq13-born">{bornLine}</span>
                        {invitation.mainDateFormatted && <p className="aq13-hero-date">{invitation.mainDateFormatted}</p>}
                        {isEnabled('countdown') && invitation.countdownDate && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq13-countdown"
                                boxClassName="aq13-countdown-box"
                                numClassName="aq13-countdown-num"
                                labelClassName="aq13-countdown-label"
                            />
                        )}
                    </header>

                    <main>
                        {/* ── OPENING / BABY NAME ─────────────────────────────────── */}
                        <section className="aq13-card aq13-anim-up">
                            <div className="aq13-in">
                                <p className="aq13-bism" lang="ar" dir="rtl">
                                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                                </p>
                                <p className="aq13-salam">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                                {invitation.openingMessage ? (
                                    <p className="aq13-lead">{invitation.openingMessage}</p>
                                ) : (
                                    <p className="aq13-lead">
                                        Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan{' '}
                                        <q>Tasyakuran Aqiqah</q> {genderWord ? `${genderWord.toLowerCase()} kami` : 'buah hati kami'}:
                                    </p>
                                )}
                                <p className="aq13-name">{invitation.babyName}</p>
                                {lineage && invitation.fatherName && (
                                    <p className="aq13-bin">
                                        {lineage} {invitation.fatherName}
                                    </p>
                                )}
                                {invitation.birthDateFormatted && <p className="aq13-birth">Lahir {invitation.birthDateFormatted}</p>}
                            </div>
                        </section>

                        {/* ── EVENTS ──────────────────────────────────────────────── */}
                        {isEnabled('event_detail') &&
                            invitation.events.map((ev, i) => {
                                const mapsUrl = mapsUrlOf(ev);
                                const timeStr = ev.time ? (ev.timeEnd ? `Pukul ${ev.time} – ${ev.timeEnd} WIB` : `Pukul ${ev.time} WIB`) : '';
                                const hasAddress = Boolean(ev.locationName || ev.location);
                                return (
                                    <section key={i} className="aq13-card aq13-anim-up">
                                        <div className="aq13-in">
                                            <h2 className="aq13-h2">{i === 0 ? 'Waktu & Tempat' : ev.name}</h2>
                                            <p className="aq13-sub">
                                                {i === 0 && ev.name
                                                    ? `${ev.name} insya Allah diselenggarakan pada`
                                                    : 'Insya Allah akan diselenggarakan pada'}
                                            </p>
                                            <div className="aq13-when">
                                                <DateBadge ev={ev} />
                                                <div className="aq13-where">
                                                    {timeStr && <p className="aq13-time">{timeStr}</p>}
                                                    {!badgeParts(ev) && ev.dateFormatted && <p className="aq13-where-date">{ev.dateFormatted}</p>}
                                                    {ev.locationName && (
                                                        <p>
                                                            <strong>{ev.locationName}</strong>
                                                        </p>
                                                    )}
                                                    {ev.location && <p>{ev.location}</p>}
                                                </div>
                                            </div>
                                            <div className="aq13-actions">
                                                {mapsUrl && (
                                                    <a className="aq13-btn aq13-btn-solid" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                                        Lihat Peta
                                                    </a>
                                                )}
                                                {hasAddress && (
                                                    <button className="aq13-btn" type="button" onClick={() => copyAddress(ev)}>
                                                        Salin Alamat
                                                    </button>
                                                )}
                                                <button className="aq13-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                    Simpan ke Kalender
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                );
                            })}

                        {/* ── PARENTS ─────────────────────────────────────────────── */}
                        {isEnabled('couple_profile') && hasParents && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <span className="aq13-tag">{genderWord ? `${genderWord} dari` : 'Buah hati dari'}</span>
                                    <p className="aq13-parents">
                                        {invitation.fatherName && <>Bpk. {invitation.fatherName}</>}
                                        {invitation.fatherName && invitation.motherName && <span>&amp;</span>}
                                        {invitation.motherName && <>Ibu {invitation.motherName}</>}
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* ── LOCATION ────────────────────────────────────────────── */}
                        {isEnabled('location') && mapEvent?.mapsEmbed && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Lokasi Acara</h2>
                                    {mapEvent.locationName && (
                                        <p className="aq13-sub">
                                            {mapEvent.name} · {mapEvent.locationName}
                                        </p>
                                    )}
                                    <div className="aq13-map-wrapper">
                                        <iframe
                                            src={mapEvent.mapsEmbed}
                                            width="100%"
                                            height="300"
                                            style={{ border: 0, display: 'block' }}
                                            allowFullScreen
                                            loading="lazy"
                                            title={`Lokasi ${mapEvent.locationName || mapEvent.name}`}
                                        />
                                    </div>
                                    {mapEventUrl && (
                                        <div className="aq13-actions">
                                            <a className="aq13-btn aq13-btn-solid" href={mapEventUrl} target="_blank" rel="noopener noreferrer">
                                                Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* ── GALLERY ─────────────────────────────────────────────── */}
                        {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Galeri Foto</h2>
                                    <p className="aq13-sub">Momen-momen kecil yang kami syukuri</p>
                                    <GallerySection
                                        items={invitation.gallery}
                                        styles={{
                                            grid: 'aq13-gallery-grid',
                                            item: 'aq13-gallery-item',
                                            thumb: 'aq13-gallery-thumb',
                                            overlay: 'aq13-gallery-overlay',
                                            filterBar: 'aq13-gallery-filter-bar',
                                            filterBtn: 'aq13-filter-btn',
                                            filterBtnActive: 'aq13-filter-btn aq13-filter-btn-active',
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── VIDEO ───────────────────────────────────────────────── */}
                        {isEnabled('video') && babyVideoEmbedUrl && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Video Kenangan</h2>
                                    <div className="aq13-video-frame">
                                        <iframe
                                            src={babyVideoEmbedUrl}
                                            title="Video Kenangan"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── DIGITAL GIFT ────────────────────────────────────────── */}
                        {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Amplop Digital</h2>
                                    <p className="aq13-sub">
                                        Doa restu Bapak/Ibu/Saudara/i adalah hadiah yang paling berarti. Bagi yang ingin memberikan tanda kasih untuk
                                        si kecil, dapat melalui:
                                    </p>
                                    <DigitalWalletSection
                                        bankAccounts={invitation.bankAccounts ?? []}
                                        digitalWallets={invitation.digitalWallets ?? []}
                                        onToast={showToast}
                                        styles={{
                                            bankGrid: 'aq13-bank-grid',
                                            bankCard: 'aq13-bank-card',
                                            bankLogo: 'aq13-bank-logo',
                                            bankType: 'aq13-bank-type',
                                            bankNumber: 'aq13-bank-number',
                                            bankName: 'aq13-bank-name',
                                            copyBankBtn: 'aq13-btn-copy',
                                            ewalletGrid: 'aq13-ewallet-grid',
                                            ewalletCard: 'aq13-ewallet-card',
                                            ewalletName: 'aq13-ewallet-name',
                                            ewalletPhone: 'aq13-ewallet-phone',
                                            copyEwalletBtn: 'aq13-btn-copy',
                                            ewalletTitle: 'aq13-ewallet-title',
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── RSVP ────────────────────────────────────────────────── */}
                        {isEnabled('rsvp') && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Konfirmasi Kehadiran</h2>
                                    <p className="aq13-sub">Mohon kabari kami apakah Anda dapat hadir</p>
                                    <RSVPForm
                                        rsvpEndpoint={invitation.rsvpEndpoint}
                                        guestName={invitation.guestName || undefined}
                                        guestSlug={invitation.guestSlug}
                                        onToast={showToast}
                                        styles={{
                                            form: 'aq13-rsvp-form',
                                            label: 'aq13-rsvp-label',
                                            input: 'aq13-input',
                                            select: 'aq13-input',
                                            textarea: 'aq13-input aq13-textarea',
                                            radioGroup: 'aq13-rsvp-radio-group',
                                            radioLabel: 'aq13-rsvp-radio-label',
                                            errorText: 'aq13-rsvp-error',
                                            submitBtn: 'aq13-submit',
                                            successBox: 'aq13-rsvp-success',
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── WISHES ──────────────────────────────────────────────── */}
                        {isEnabled('wishes') && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <h2 className="aq13-h2">Ucapan &amp; Doa</h2>
                                    <p className="aq13-sub">Titipkan doa terbaik untuk {invitation.babyName}</p>
                                    <WishesSection
                                        wishesEndpoint={invitation.wishesEndpoint}
                                        allowComments={invitation.allowComments}
                                        onToast={showToast}
                                        styles={{
                                            container: 'aq13-wishes-layout',
                                            formBox: 'aq13-wishes-form',
                                            formTitle: 'aq13-wishes-form-title',
                                            nameInput: 'aq13-input aq13-wish-input',
                                            messageInput: 'aq13-input aq13-wish-input',
                                            submitBtn: 'aq13-submit',
                                            wishCard: 'aq13-wish-card',
                                            wishAvatar: 'aq13-wish-avatar',
                                            wishName: 'aq13-wish-name',
                                            wishDate: 'aq13-wish-date',
                                            wishMessage: 'aq13-wish-message',
                                            loadMoreBtn: 'aq13-btn aq13-btn-more',
                                        }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── CLOSING ─────────────────────────────────────────────── */}
                        {isEnabled('footer') && (
                            <section className="aq13-card aq13-anim-up">
                                <div className="aq13-in">
                                    <p className="aq13-close">Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.</p>
                                    <p className="aq13-salam" style={{ marginTop: 12 }}>
                                        Wassalamu’alaikum Warahmatullahi Wabarakatuh
                                    </p>
                                    <p className="aq13-label">Kami yang Mengundang</p>
                                    {familyLine ? (
                                        <p className="aq13-family">Kel. {familyLine}</p>
                                    ) : (
                                        <p className="aq13-family">Keluarga {invitation.babyName}</p>
                                    )}
                                </div>
                            </section>
                        )}

                        <p className="aq13-credit">Created with love ✦ Undesia Digital Invitation</p>
                    </main>
                </div>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq13-plum)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq13-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq13-back-top" aria-label="Kembali ke atas" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
