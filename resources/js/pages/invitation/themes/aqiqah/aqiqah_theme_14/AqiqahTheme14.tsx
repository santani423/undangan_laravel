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
import './aqiqah-theme-14.css';

interface AqiqahTheme14Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

const DAY_NAMES = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const FLAG_COLORS = ['#1aa3de', '#f6a623', '#ef6a3a', '#5bc0eb'];
const FLAG_COUNT = 11;

/** "13:00" / "13.00" → "130000" (floating local time for Google Calendar). */
function calTime(time: string | undefined, fallback: string): string {
    const digits = (time || '').replace(/\D/g, '');
    return (digits ? digits.padStart(4, '0').slice(0, 4) : fallback) + '00';
}

function addToCalendar(ev: InvitationEvent, babyName: string) {
    const day = (ev.date || '').replace(/-/g, '');
    const start = `${day}T${calTime(ev.time, '0900')}`;
    const end = `${day}T${calTime(ev.timeEnd || ev.time, '1200')}`;
    const loc = ev.locationName ? `${ev.locationName}${ev.location ? ', ' + ev.location : ''}` : ev.location || '';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Tasyakuran Aqiqah ${babyName}`)}&dates=${start}/${end}&ctz=Asia/Jakarta&location=${encodeURIComponent(loc)}`;
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

/** Split "YYYY-MM-DD" into the three lines of the date block. */
function dateParts(ev: InvitationEvent): { day: string; num: string; monthYear: string } | null {
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

function Bunting() {
    return (
        <>
            <svg className="aq14-bunting" viewBox="0 0 460 86" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 8 Q230 70 460 8" fill="none" stroke="#ef6a3a" strokeWidth="2" />
            </svg>
            <div className="aq14-flags" aria-hidden="true">
                {Array.from({ length: FLAG_COUNT }, (_, i) => {
                    const t = (i + 0.5) / FLAG_COUNT;
                    return (
                        <div
                            key={i}
                            className="aq14-flag"
                            style={{ left: `calc(${t * 100}% - 11px)`, top: 6 + 124 * t * (1 - t), background: FLAG_COLORS[i % FLAG_COLORS.length] }}
                        />
                    );
                })}
            </div>
        </>
    );
}

function CoverDecor() {
    return (
        <>
            <Bunting />
            <div className="aq14-band aq14-b1" aria-hidden="true" />
            <div className="aq14-band aq14-b2" aria-hidden="true" />
            <svg className="aq14-moon" viewBox="0 0 50 50" aria-hidden="true">
                <path d="M34 6a20 20 0 1 0 12 30A17 17 0 0 1 34 6z" fill="#f6a623" />
                <path d="M34 6a20 20 0 0 0-3 36 17 17 0 0 0 15-6A17 17 0 0 1 34 6z" fill="#f8c15a" />
            </svg>
            <svg className="aq14-star" viewBox="0 0 40 40" aria-hidden="true">
                <path
                    d="M20 2l5 12 13 1-10 8 3 13-11-7-11 7 3-13L2 15l13-1z"
                    fill="#f6a623"
                    stroke="#ef6a3a"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
            <svg className="aq14-cloud" viewBox="0 0 70 40" aria-hidden="true">
                <path d="M12 38a11 11 0 0 1 2-22 15 15 0 0 1 28-4 12 12 0 0 1 20 10 9 9 0 0 1-2 16z" fill="#2d78b8" />
                <path d="M20 38a9 9 0 0 1 3-17 12 12 0 0 1 22 1 8 8 0 0 1 13 7 7 7 0 0 1-2 9z" fill="#1aa3de" />
            </svg>
        </>
    );
}

const SCALLOP_PATH =
    'M282.0 150.0 A24 24 0 0 1 274.0 195.1 A24 24 0 0 1 251.1 234.8 A24 24 0 0 1 216.0 264.3 A24 24 0 0 1 172.9 280.0 A24 24 0 0 1 127.1 280.0 A24 24 0 0 1 84.0 264.3 A24 24 0 0 1 48.9 234.8 A24 24 0 0 1 26.0 195.1 A24 24 0 0 1 18.0 150.0 A24 24 0 0 1 26.0 104.9 A24 24 0 0 1 48.9 65.2 A24 24 0 0 1 84.0 35.7 A24 24 0 0 1 127.1 20.0 A24 24 0 0 1 172.9 20.0 A24 24 0 0 1 216.0 35.7 A24 24 0 0 1 251.1 65.2 A24 24 0 0 1 274.0 104.9 A24 24 0 0 1 282.0 150.0Z';

function BabyFrame({ photo, name, clipId }: { photo?: string; name: string; clipId: string }) {
    return (
        <div className="aq14-frame">
            <svg viewBox="0 0 300 300" role="img" aria-label={`Foto ${name}`}>
                <defs>
                    <clipPath id={clipId}>
                        <circle cx="150" cy="150" r="112" />
                    </clipPath>
                </defs>
                <path d={SCALLOP_PATH} fill="#0f7cc4" />
                <circle cx="150" cy="150" r="120" fill="#fff" />
                {photo ? (
                    <image href={photo} x="38" y="38" width="224" height="224" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
                ) : (
                    <>
                        <circle cx="150" cy="150" r="112" fill="#cfeafb" />
                        <text
                            x="150"
                            y="150"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontFamily="Grand Hotel, cursive"
                            fontSize="130"
                            fill="#0c4a7e"
                        >
                            {name?.charAt(0) || '·'}
                        </text>
                    </>
                )}
            </svg>
        </div>
    );
}

function RattleToy() {
    return (
        <svg className="aq14-toy" style={{ right: -18, top: -26 }} viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="24" cy="22" r="18" fill="#f0719a" />
            <path d="M8 18h32M8 26h32" stroke="#5bc0eb" strokeWidth="4" />
            <path d="M36 34l14 18" stroke="#f6a623" strokeWidth="5" strokeLinecap="round" />
            <circle cx="52" cy="54" r="5" fill="none" stroke="#f6a623" strokeWidth="3" />
        </svg>
    );
}

function DuckToy() {
    return (
        <svg className="aq14-toy" style={{ left: -22, bottom: -24 }} viewBox="0 0 60 50" aria-hidden="true">
            <ellipse cx="30" cy="36" rx="24" ry="12" fill="#fcd12a" />
            <circle cx="36" cy="18" r="12" fill="#fcd12a" />
            <path d="M47 18l9 3-9 3z" fill="#ef6a3a" />
            <circle cx="39" cy="15" r="2" fill="#23384d" />
            <path d="M14 32q10 10 22 0" fill="none" stroke="#f0b400" strokeWidth="3" />
        </svg>
    );
}

/* ── Theme ─────────────────────────────────────────────────────────────────── */

export default function AqiqahTheme14({ invitation, visitor, greeting }: AqiqahTheme14Props) {
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
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq14-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq14-anim-up').forEach((el) => observer.observe(el));
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

    const genderWord = genderLabel(babyGender);
    const lineage = lineageWord(babyGender);
    const lineageLine = lineage && invitation.fatherName ? `${lineage} ${invitation.fatherName}` : '';

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
        <div className="aq14-root">
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Grand+Hotel&family=Nunito:wght@400;600;700;800&display=swap');
            `}</style>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq14-overlay${opened ? 'aq14-hide' : ''}`}>
                    <div className="aq14-wrap">
                        <header className="aq14-cover">
                            <CoverDecor />
                            <p className="aq14-eyebrow">Tasyakuran Aqiqah</p>
                            <BabyFrame photo={babyPhoto} name={invitation.babyName} clipId="aq14-clip-overlay" />
                            <p className="aq14-name">{invitation.babyName}</p>
                            {lineageLine && <p className="aq14-bin">{lineageLine}</p>}
                            {invitation.birthDateFormatted && <span className="aq14-born">Lahir {invitation.birthDateFormatted}</span>}

                            {greetingEnabled && coverGuestName && (
                                <div className="aq14-to">
                                    <small>{greeting?.title ?? 'Kepada Yth. Bapak/Ibu/Saudara/i'}</small>
                                    <strong>{coverGuestName}</strong>
                                    {guestName && greeting?.guestLabel ? <span>{greeting.guestLabel}</span> : <span>di tempat</span>}
                                </div>
                            )}
                            {greetingEnabled && greeting?.message && <p className="aq14-overlay-message">{greeting.message}</p>}
                            {invitation.guestQrData && (
                                <div className="aq14-overlay-qr">
                                    <GuestQrCode
                                        data={invitation.guestQrData}
                                        size={120}
                                        style={{ borderRadius: '10px', border: '4px solid #fff', background: '#fff' }}
                                    />
                                    <p className="aq14-overlay-qr-label">QR Check-in Tamu</p>
                                </div>
                            )}
                            <button type="button" className="aq14-open" onClick={openInvitation}>
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
            <div className={`aq14-main${opened ? 'aq14-main-visible' : ''}`}>
                <div className="aq14-wrap">
                    {/* ── HERO ──────────────────────────────────────────────────────── */}
                    <header className="aq14-cover">
                        <CoverDecor />
                        <p className="aq14-eyebrow">Tasyakuran Aqiqah</p>
                        <BabyFrame photo={babyPhoto} name={invitation.babyName} clipId="aq14-clip-hero" />
                        <h1 className="aq14-name">{invitation.babyName}</h1>
                        {lineageLine && <p className="aq14-bin">{lineageLine}</p>}
                        {invitation.birthDateFormatted && <span className="aq14-born">Lahir {invitation.birthDateFormatted}</span>}
                        {invitation.mainDateFormatted && <p className="aq14-hero-date">{invitation.mainDateFormatted}</p>}
                        {isEnabled('countdown') && invitation.countdownDate && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq14-countdown"
                                boxClassName="aq14-countdown-box"
                                numClassName="aq14-countdown-num"
                                labelClassName="aq14-countdown-label"
                            />
                        )}
                    </header>

                    <main>
                        {/* ── OPENING / BABY NAME ─────────────────────────────────── */}
                        <section className="aq14-card aq14-anim-up">
                            <p className="aq14-bism" lang="ar" dir="rtl">
                                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                            </p>
                            <p className="aq14-salam">Assalamu’alaikum Warahmatullahi Wabarakatuh</p>
                            {invitation.openingMessage ? (
                                <p className="aq14-lead">{invitation.openingMessage}</p>
                            ) : (
                                <p className="aq14-lead">
                                    Alhamdulillah, puji syukur kehadirat Allah SWT. Sebagai ungkapan rasa syukur, kami bermaksud menyelenggarakan{' '}
                                    <q>Tasyakuran Aqiqah</q> {genderWord ? `${genderWord.toLowerCase()} kami` : 'buah hati kami'}:
                                </p>
                            )}
                            <h2 className="aq14-h2" style={{ marginTop: 14 }}>
                                {invitation.babyName}
                            </h2>
                            {lineageLine && <p className="aq14-bin">{lineageLine}</p>}
                        </section>

                        {/* ── EVENTS ──────────────────────────────────────────────── */}
                        {isEnabled('event_detail') &&
                            invitation.events.map((ev, i) => {
                                const mapsUrl = mapsUrlOf(ev);
                                const timeStr = ev.time ? (ev.timeEnd ? `Pukul ${ev.time} – ${ev.timeEnd} WIB` : `Pukul ${ev.time} WIB`) : '';
                                const hasAddress = Boolean(ev.locationName || ev.location);
                                const parts = dateParts(ev);
                                return (
                                    <section key={i} className="aq14-card aq14-anim-up">
                                        {i === 0 && <RattleToy />}
                                        <h2 className="aq14-h2">{i === 0 ? 'Waktu & Tempat' : ev.name}</h2>
                                        <span className="aq14-ribbon">
                                            {i === 0 && ev.name ? `${ev.name} insya Allah dilaksanakan pada` : 'Insya Allah dilaksanakan pada'}
                                        </span>
                                        <div className="aq14-when">
                                            {parts ? (
                                                <div className="aq14-date">
                                                    <span className="aq14-date-d">{parts.day}</span>
                                                    <span className="aq14-date-n">{parts.num}</span>
                                                    <span className="aq14-date-m">{parts.monthYear}</span>
                                                </div>
                                            ) : (
                                                ev.dateFormatted && (
                                                    <div className="aq14-date">
                                                        <span className="aq14-date-m">{ev.dateFormatted}</span>
                                                    </div>
                                                )
                                            )}
                                            <div className="aq14-where">
                                                {timeStr && <p className="aq14-time">{timeStr}</p>}
                                                {ev.locationName && (
                                                    <p>
                                                        <strong>{ev.locationName}</strong>
                                                    </p>
                                                )}
                                                {ev.location && <p>{ev.location}</p>}
                                            </div>
                                        </div>
                                        <div className="aq14-actions">
                                            {mapsUrl && (
                                                <a className="aq14-btn aq14-btn-solid" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                                    Lihat Peta
                                                </a>
                                            )}
                                            {hasAddress && (
                                                <button className="aq14-btn" type="button" onClick={() => copyAddress(ev)}>
                                                    Salin Alamat
                                                </button>
                                            )}
                                            <button className="aq14-btn" type="button" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                Simpan ke Kalender
                                            </button>
                                        </div>
                                        {i === invitation.events.length - 1 && <DuckToy />}
                                    </section>
                                );
                            })}

                        {/* ── PARENTS ─────────────────────────────────────────────── */}
                        {isEnabled('couple_profile') && hasParents && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Orang Tua</h2>
                                <span className="aq14-ribbon">{genderWord ? `${genderWord} tercinta dari` : 'Buah hati tercinta dari'}</span>
                                <ul className="aq14-hosts">
                                    {invitation.fatherName && (
                                        <li>
                                            {invitation.fatherName}
                                            <span>Ayah</span>
                                        </li>
                                    )}
                                    {invitation.motherName && (
                                        <li>
                                            {invitation.motherName}
                                            <span>Ibu</span>
                                        </li>
                                    )}
                                </ul>
                            </section>
                        )}

                        {/* ── LOCATION ────────────────────────────────────────────── */}
                        {isEnabled('location') && mapEvent?.mapsEmbed && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Lokasi Acara</h2>
                                {mapEvent.locationName && (
                                    <p className="aq14-sub">
                                        {mapEvent.name} · {mapEvent.locationName}
                                    </p>
                                )}
                                <div className="aq14-map-wrapper">
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
                                    <div className="aq14-actions">
                                        <a className="aq14-btn aq14-btn-solid" href={mapEventUrl} target="_blank" rel="noopener noreferrer">
                                            Buka Google Maps
                                        </a>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ── GALLERY ─────────────────────────────────────────────── */}
                        {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Galeri Foto</h2>
                                <p className="aq14-sub">Momen-momen kecil yang kami syukuri</p>
                                <GallerySection
                                    items={invitation.gallery}
                                    styles={{
                                        grid: 'aq14-gallery-grid',
                                        item: 'aq14-gallery-item',
                                        thumb: 'aq14-gallery-thumb',
                                        overlay: 'aq14-gallery-overlay',
                                        filterBar: 'aq14-gallery-filter-bar',
                                        filterBtn: 'aq14-filter-btn',
                                        filterBtnActive: 'aq14-filter-btn aq14-filter-btn-active',
                                    }}
                                />
                            </section>
                        )}

                        {/* ── VIDEO ───────────────────────────────────────────────── */}
                        {isEnabled('video') && babyVideoEmbedUrl && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Video Kenangan</h2>
                                <div className="aq14-video-frame">
                                    <iframe
                                        src={babyVideoEmbedUrl}
                                        title="Video Kenangan"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── DIGITAL GIFT ────────────────────────────────────────── */}
                        {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Amplop Digital</h2>
                                <p className="aq14-sub">
                                    Doa restu Bapak/Ibu/Saudara/i adalah hadiah yang paling berarti. Bagi yang ingin memberikan tanda kasih untuk si
                                    kecil, dapat melalui:
                                </p>
                                <DigitalWalletSection
                                    bankAccounts={invitation.bankAccounts ?? []}
                                    digitalWallets={invitation.digitalWallets ?? []}
                                    onToast={showToast}
                                    styles={{
                                        bankGrid: 'aq14-bank-grid',
                                        bankCard: 'aq14-bank-card',
                                        bankLogo: 'aq14-bank-logo',
                                        bankType: 'aq14-bank-type',
                                        bankNumber: 'aq14-bank-number',
                                        bankName: 'aq14-bank-name',
                                        copyBankBtn: 'aq14-btn-copy',
                                        ewalletGrid: 'aq14-ewallet-grid',
                                        ewalletCard: 'aq14-ewallet-card',
                                        ewalletName: 'aq14-ewallet-name',
                                        ewalletPhone: 'aq14-ewallet-phone',
                                        copyEwalletBtn: 'aq14-btn-copy',
                                        ewalletTitle: 'aq14-ewallet-title',
                                    }}
                                />
                            </section>
                        )}

                        {/* ── RSVP ────────────────────────────────────────────────── */}
                        {isEnabled('rsvp') && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Konfirmasi Kehadiran</h2>
                                <p className="aq14-sub">Mohon kabari kami apakah Anda dapat hadir</p>
                                <RSVPForm
                                    rsvpEndpoint={invitation.rsvpEndpoint}
                                    guestName={invitation.guestName || undefined}
                                    guestSlug={invitation.guestSlug}
                                    onToast={showToast}
                                    styles={{
                                        form: 'aq14-rsvp-form',
                                        label: 'aq14-rsvp-label',
                                        input: 'aq14-input',
                                        select: 'aq14-input',
                                        textarea: 'aq14-input aq14-textarea',
                                        radioGroup: 'aq14-rsvp-radio-group',
                                        radioLabel: 'aq14-rsvp-radio-label',
                                        errorText: 'aq14-rsvp-error',
                                        submitBtn: 'aq14-submit',
                                        successBox: 'aq14-rsvp-success',
                                    }}
                                />
                            </section>
                        )}

                        {/* ── WISHES ──────────────────────────────────────────────── */}
                        {isEnabled('wishes') && (
                            <section className="aq14-card aq14-anim-up">
                                <h2 className="aq14-h2">Ucapan &amp; Doa</h2>
                                <p className="aq14-sub">Titipkan doa terbaik untuk {invitation.babyName}</p>
                                <WishesSection
                                    wishesEndpoint={invitation.wishesEndpoint}
                                    allowComments={invitation.allowComments}
                                    onToast={showToast}
                                    styles={{
                                        container: 'aq14-wishes-layout',
                                        formBox: 'aq14-wishes-form',
                                        formTitle: 'aq14-wishes-form-title',
                                        nameInput: 'aq14-input aq14-wish-input',
                                        messageInput: 'aq14-input aq14-wish-input',
                                        submitBtn: 'aq14-submit',
                                        wishCard: 'aq14-wish-card',
                                        wishAvatar: 'aq14-wish-avatar',
                                        wishName: 'aq14-wish-name',
                                        wishDate: 'aq14-wish-date',
                                        wishMessage: 'aq14-wish-message',
                                        loadMoreBtn: 'aq14-btn aq14-btn-more',
                                    }}
                                />
                            </section>
                        )}

                        {/* ── CLOSING ─────────────────────────────────────────────── */}
                        {isEnabled('footer') && (
                            <section className="aq14-card aq14-anim-up">
                                <p className="aq14-close">Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.</p>
                                <p className="aq14-salam" style={{ marginTop: 12 }}>
                                    Wassalamu’alaikum Warahmatullahi Wabarakatuh
                                </p>
                                <p className="aq14-label">Kami yang Mengundang</p>
                                <p className="aq14-family">{familyLine ? `Kel. ${familyLine}` : `Keluarga ${invitation.babyName}`}</p>
                            </section>
                        )}

                        <p className="aq14-credit">Created with love ✦ Undesia Digital Invitation</p>
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
                    buttonStyle={{ background: 'var(--aq14-navy)', border: '2px solid #fff', color: '#fff' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq14-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq14-back-top" aria-label="Kembali ke atas" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            )}
        </div>
    );
}
