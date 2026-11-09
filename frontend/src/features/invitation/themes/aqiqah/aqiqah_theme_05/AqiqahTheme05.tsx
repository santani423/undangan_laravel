import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { AqiqahInvitation, Greeting, InvitationEvent } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import './aqiqah-theme-05.css';

interface AqiqahTheme05Props {
    invitation: AqiqahInvitation;
    visitor?: string;
    greeting?: Greeting;
}

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

function heirWord(gender: string): string {
    if (gender === 'Laki-laki') return 'Pangeran';
    if (gender === 'Perempuan') return 'Putri';
    return 'buah hati';
}

function genderIcon(gender: string): string {
    if (gender === 'Laki-laki') return '👑';
    if (gender === 'Perempuan') return '👑';
    return '👶';
}

function copyAddress(address: string, onToast: (msg: string) => void) {
    if (!address) return;
    const fallback = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = address;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            onToast('Alamat disalin.');
        } catch {
            onToast('Gagal menyalin alamat.');
        }
    };
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(address).then(() => onToast('Alamat disalin.'), fallback);
    } else {
        fallback();
    }
}

interface SealParts {
    weekday: string;
    day: string;
    month: string;
}

function sealParts(ev: InvitationEvent): SealParts {
    const d = ev.date ? new Date(`${ev.date}T00:00:00`) : null;
    if (d && !Number.isNaN(d.getTime())) {
        return {
            weekday: d.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase(),
            day: d.toLocaleDateString('id-ID', { day: '2-digit' }),
            month: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase(),
        };
    }
    const [weekdayRaw = '', restRaw = ''] = (ev.dateFormatted || '').split(',');
    const rest = restRaw.trim().split(' ');
    return {
        weekday: weekdayRaw.trim().toUpperCase(),
        day: rest[0] || '',
        month: rest.slice(1).join(' ').toUpperCase(),
    };
}

function CrownTop() {
    return (
        <div className="aq5-crown-top" aria-hidden="true">
            <svg viewBox="0 0 40 30">
                <use href="#aq5-crown" />
            </svg>
        </div>
    );
}

function LaurelDivider() {
    return (
        <svg className="aq5-laurel" viewBox="0 0 140 36" aria-hidden="true">
            <use href="#aq5-laurel" />
        </svg>
    );
}

export default function AqiqahTheme05({ invitation, visitor, greeting }: AqiqahTheme05Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const mainRef = useRef<HTMLDivElement>(null);
    const { toast, showToast, clearToast } = useToast();

    useEffect(() => {
        if (!opened) return;
        const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('aq5-visible')), {
            threshold: 0.1,
        });
        document.querySelectorAll('.aq5-anim-up').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    useEffect(() => {
        const handler = () => setShowBackTop(window.scrollY > 400);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const openInvitation = () => setOpened(true);

    const babyPhoto = invitation.babyPhoto;
    const babyGender = invitation.babyGender || '';
    const babyInitial = invitation.babyName?.charAt(0) || '👶';
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const babyVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');
    const genderDataAttr = babyGender === 'Laki-laki' || babyGender === 'Perempuan' ? babyGender : undefined;
    const bintiWord = babyGender === 'Perempuan' ? 'binti' : 'bin';
    const sheepCount = babyGender === 'Perempuan' ? 1 : 2;
    const heir = heirWord(babyGender);

    const parentsLine =
        invitation.fatherName && invitation.motherName
            ? `Bapak ${invitation.fatherName} & Ibu ${invitation.motherName}`
            : invitation.fatherName
              ? `Bapak ${invitation.fatherName}`
              : invitation.motherName
                ? `Ibu ${invitation.motherName}`
                : '';

    const profileLine = parentsLine ? `${heir === 'buah hati' ? 'Buah hati dari' : heir + ' kecil dari'} ${parentsLine}` : '';

    const countdownEvent = invitation.events.find((e) => e.isCountdown) ?? invitation.events[0];
    const mapsUrlFor = (ev: InvitationEvent) =>
        ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');

    return (
        <div className="aq5-root" data-gender={genderDataAttr}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel+Decorative:wght@400;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500;1,600&display=swap');
            `}</style>

            {/* Reusable decorative SVG defs */}
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
                <defs>
                    <linearGradient id="aq5-g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f6dc98" />
                        <stop offset=".55" stopColor="#d6a23e" />
                        <stop offset="1" stopColor="#a87a26" />
                    </linearGradient>
                    <symbol id="aq5-crown" viewBox="0 0 40 30">
                        <path d="M4 26L2 8l9 7 9-13 9 13 9-7-2 18Z" fill="url(#aq5-g)" stroke="#9f7424" strokeWidth="1" />
                        <rect x="4" y="24" width="32" height="5" rx="1.5" fill="url(#aq5-g)" stroke="#9f7424" strokeWidth="1" />
                        <circle cx="20" cy="3" r="2.4" fill="#f0cf7c" />
                        <circle cx="2" cy="7" r="2" fill="#f0cf7c" />
                        <circle cx="38" cy="7" r="2" fill="#f0cf7c" />
                        <circle cx="20" cy="18" r="2.6" fill="#3a5bb8" />
                        <circle cx="11" cy="20" r="1.8" fill="#c0392b" />
                        <circle cx="29" cy="20" r="1.8" fill="#c0392b" />
                    </symbol>
                    <symbol id="aq5-laurel" viewBox="0 0 140 36">
                        <g fill="#d6a23e">
                            <path d="M70 30C50 30 26 24 8 8" stroke="#d6a23e" strokeWidth="1.5" fill="none" />
                            <path d="M70 30C90 30 114 24 132 8" stroke="#d6a23e" strokeWidth="1.5" fill="none" />
                            <ellipse cx="20" cy="14" rx="7" ry="3" transform="rotate(35 20 14)" />
                            <ellipse cx="34" cy="21" rx="7" ry="3" transform="rotate(25 34 21)" />
                            <ellipse cx="50" cy="26" rx="7" ry="3" transform="rotate(12 50 26)" />
                            <ellipse cx="120" cy="14" rx="7" ry="3" transform="rotate(-35 120 14)" />
                            <ellipse cx="106" cy="21" rx="7" ry="3" transform="rotate(-25 106 21)" />
                            <ellipse cx="90" cy="26" rx="7" ry="3" transform="rotate(-12 90 26)" />
                            <ellipse cx="26" cy="10" rx="6" ry="2.6" transform="rotate(-20 26 10)" />
                            <ellipse cx="42" cy="17" rx="6" ry="2.6" transform="rotate(-30 42 17)" />
                            <ellipse cx="114" cy="10" rx="6" ry="2.6" transform="rotate(20 114 10)" />
                            <ellipse cx="98" cy="17" rx="6" ry="2.6" transform="rotate(30 98 17)" />
                        </g>
                        <circle cx="70" cy="30" r="3.5" fill="#d6a23e" />
                    </symbol>
                    <symbol id="aq5-cub" viewBox="0 0 100 100">
                        <path
                            className="aq5-cub-tail"
                            d="M80 86c12-2 16-12 12-22"
                            stroke="#e8b15e"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <circle cx="92" cy="62" r="5" fill="#c47128" />
                        <ellipse cx="56" cy="84" rx="26" ry="14" fill="#e8b15e" />
                        <g fill="#c47128">
                            <circle cx="44" cy="48" r="30" />
                        </g>
                        <g fill="#d98a3a">
                            <circle cx="20" cy="36" r="9" />
                            <circle cx="68" cy="36" r="9" />
                            <circle cx="16" cy="56" r="9" />
                            <circle cx="72" cy="56" r="9" />
                            <circle cx="26" cy="72" r="9" />
                            <circle cx="62" cy="72" r="9" />
                            <circle cx="44" cy="20" r="9" />
                            <circle cx="28" cy="24" r="8" />
                            <circle cx="60" cy="24" r="8" />
                        </g>
                        <circle cx="44" cy="50" r="21" fill="#f2c57a" />
                        <circle cx="28" cy="32" r="6" fill="#f2c57a" />
                        <circle cx="28" cy="32" r="3" fill="#f5a896" />
                        <circle cx="60" cy="32" r="6" fill="#f2c57a" />
                        <circle cx="60" cy="32" r="3" fill="#f5a896" />
                        <ellipse cx="44" cy="58" rx="10" ry="7" fill="#fff4dd" />
                        <circle cx="36" cy="48" r="3" fill="#1f2544" />
                        <circle cx="52" cy="48" r="3" fill="#1f2544" />
                        <circle cx="37" cy="47" r="1" fill="#fff" />
                        <circle cx="53" cy="47" r="1" fill="#fff" />
                        <path d="M40 55h8l-4 4z" fill="#8a4a2a" />
                        <path d="M40 61q4 3 8 0" stroke="#8a4a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                        <ellipse cx="30" cy="57" rx="4" ry="2.4" fill="#f5a896" opacity=".7" />
                        <ellipse cx="58" cy="57" rx="4" ry="2.4" fill="#f5a896" opacity=".7" />
                        <use href="#aq5-crown" x="30" y="6" width="28" height="21" />
                        <ellipse cx="42" cy="94" rx="7" ry="5" fill="#f2c57a" />
                        <ellipse cx="66" cy="94" rx="7" ry="5" fill="#f2c57a" />
                    </symbol>
                    <symbol id="aq5-seal-shape" viewBox="0 0 150 150">
                        <path
                            d="M75 4l9 8 12-3 5 11 12 2 1 12 11 6-3 12 8 9-8 9 3 12-11 6-1 12-12 2-5 11-12-3-9 8-9-8-12 3-5-11-12-2-1-12-11-6 3-12-8-9 8-9-3-12 11-6 1-12 12-2 5-11 12 3z"
                            fill="url(#aq5-g)"
                        />
                        <circle cx="75" cy="75" r="50" fill="none" stroke="#1b2a5c" strokeWidth="1.5" strokeDasharray="3 4" />
                    </symbol>
                    <clipPath id="aq5-shield-clip">
                        <path d="M0 0H200V150C200 210 150 245 100 262C50 245 0 210 0 150Z" />
                    </clipPath>
                </defs>
            </svg>

            {/* ── Opening Overlay ────────────────────────────────────────────────── */}
            {coverEnabled && (
                <div className={`aq5-overlay${opened ? ' aq5-hide' : ''}`}>
                    <div className="aq5-overlay-decor" aria-hidden="true">
                        <svg className="aq5-overlay-crown aq5-overlay-crown-1" viewBox="0 0 40 30">
                            <use href="#aq5-crown" />
                        </svg>
                        <svg className="aq5-overlay-crown aq5-overlay-crown-2" viewBox="0 0 40 30">
                            <use href="#aq5-crown" />
                        </svg>
                    </div>
                    <div className="aq5-overlay-frame">
                        <p className="aq5-overlay-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq5-overlay-label">Tasyakuran Aqiqah</p>
                        <div className="aq5-overlay-divider" />
                        <div className="aq5-overlay-name">{invitation.babyName}</div>
                        {invitation.fatherName && (
                            <p className="aq5-overlay-binti">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <p className="aq5-overlay-gender">
                                {genderIcon(babyGender)} {babyGender}
                            </p>
                        )}
                        <div className="aq5-overlay-divider" />
                        <p className="aq5-overlay-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <>
                                <p className="aq5-overlay-greeting-title">{greeting?.title ?? 'Kepada Yth.'}</p>
                                <p className="aq5-overlay-guest-name">{coverGuestName}</p>
                                {guestName && greeting?.guestLabel && <p className="aq5-overlay-guest-label">{greeting.guestLabel}</p>}
                            </>
                        )}
                        {greetingEnabled && greeting?.message && <p className="aq5-overlay-message">{greeting.message}</p>}
                        {invitation.guestQrData && (
                            <div className="aq5-overlay-qr">
                                <GuestQrCode data={invitation.guestQrData} size={120} style={{ borderRadius: '10px', border: '3px solid #1b2a5c' }} />
                                <p className="aq5-overlay-qr-label">QR Check-in Tamu</p>
                            </div>
                        )}
                        <button className="aq5-btn-open" onClick={openInvitation}>
                            👑 {greeting?.buttonText ?? 'Buka Undangan'} 👑
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div ref={mainRef} className={`aq5-main${opened ? ' aq5-main-visible' : ''}`}>
                {/* ── HERO ──────────────────────────────────────────────────────── */}
                <header className="aq5-hero">
                    <svg className="aq5-pennants" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 4Q200 44 400 4" stroke="#d6a23e" strokeWidth="1.2" fill="none" />
                        <g className="aq5-pen">
                            <path d="M24 8h22v22l-11-7-11 7z" fill="#d6a23e" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M72 15h22v22l-11-7-11 7z" fill="#dde8f6" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M120 20h22v22l-11-7-11 7z" fill="#d6a23e" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M168 23h22v22l-11-7-11 7z" fill="#dde8f6" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M210 23h22v22l-11-7-11 7z" fill="#d6a23e" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M258 20h22v22l-11-7-11 7z" fill="#dde8f6" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M306 15h22v22l-11-7-11 7z" fill="#d6a23e" />
                        </g>
                        <g className="aq5-pen">
                            <path d="M354 8h22v22l-11-7-11 7z" fill="#dde8f6" />
                        </g>
                    </svg>
                    <div className="aq5-hero-inner aq5-anim-up">
                        <p className="aq5-bism" lang="ar" dir="rtl">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ
                        </p>
                        <p className="aq5-kicker aq5-kicker-light">Tasyakuran Aqiqah</p>
                        <div className="aq5-shield">
                            <svg className="aq5-shield-frame" viewBox="-14 -60 228 330" role="img" aria-label={`Foto ${invitation.babyName}`}>
                                <use href="#aq5-crown" x="64" y="-58" width="72" height="54" />
                                <circle className="aq5-shield-shine" cx="100" cy="-52" r="3" fill="#fff" />
                                {babyPhoto ? (
                                    <image
                                        href={babyPhoto}
                                        x="0"
                                        y="0"
                                        width="200"
                                        height="272"
                                        preserveAspectRatio="xMidYMid slice"
                                        clipPath="url(#aq5-shield-clip)"
                                    />
                                ) : (
                                    <g clipPath="url(#aq5-shield-clip)">
                                        <rect x="0" y="0" width="200" height="272" fill="var(--aq5-powder)" />
                                        <text
                                            x="100"
                                            y="180"
                                            textAnchor="middle"
                                            fontFamily="Cinzel Decorative, Georgia, serif"
                                            fontWeight="700"
                                            fontSize="90"
                                            fill="var(--aq5-gold)"
                                        >
                                            {babyInitial}
                                        </text>
                                    </g>
                                )}
                                <path
                                    d="M-10 -6H210V152C210 216 156 254 100 272C44 254 -10 216 -10 152Z"
                                    fill="none"
                                    stroke="url(#aq5-g)"
                                    strokeWidth="2"
                                />
                                <path d="M0 0H200V150C200 210 150 245 100 262C50 245 0 210 0 150Z" fill="none" stroke="url(#aq5-g)" strokeWidth="5" />
                            </svg>
                            <svg className="aq5-cub" viewBox="0 0 100 100" aria-hidden="true">
                                <use href="#aq5-cub" />
                            </svg>
                        </div>
                        <p className="aq5-pre">Sambutlah sang {heir} kecil kami</p>
                        <h1 className="aq5-hero-name">{invitation.babyName}</h1>
                        {invitation.fatherName && (
                            <p className="aq5-lineage">
                                {bintiWord} {invitation.fatherName}
                            </p>
                        )}
                        {babyGender && (
                            <div className="aq5-gender-badge">
                                <span>{genderIcon(babyGender)}</span> {babyGender}
                            </div>
                        )}
                        {invitation.birthDateFormatted && <p className="aq5-hero-sub">Lahir pada {invitation.birthDateFormatted}</p>}
                        <div className="aq5-royal-date">
                            <svg aria-hidden="true">
                                <use href="#aq5-crown" />
                            </svg>
                            <span>{invitation.mainDateFormatted}</span>
                        </div>
                        <div className="aq5-guest">
                            <small>Kepada Yth. Bapak/Ibu/Saudara/i</small>
                            <strong>{guestName || 'Tamu Undangan'}</strong>
                        </div>
                        <div className="aq5-scroll-indicator" aria-hidden="true">
                            ↓
                        </div>
                    </div>
                </header>

                {/* ── OPENING MESSAGE / SALAM ──────────────────────────────────────── */}
                {invitation.openingMessage && (
                    <section className="aq5-section">
                        <div className="aq5-card aq5-anim-up">
                            <CrownTop />
                            <p className="aq5-kicker">Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <p className="aq5-arabic" lang="ar" dir="rtl">
                                كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى
                            </p>
                            <blockquote className="aq5-blockquote">
                                "Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan
                                diberi nama."
                            </blockquote>
                            <p className="aq5-src">HR. Abu Dawud, dari Samurah bin Jundub</p>
                            <LaurelDivider />
                            <p className="aq5-lead">{invitation.openingMessage}</p>
                        </div>
                    </section>
                )}

                {/* ── BABY PROFILE ──────────────────────────────────────────────── */}
                {isEnabled('couple_profile') && (
                    <section className="aq5-section">
                        <div className="aq5-card aq5-anim-up">
                            <CrownTop />
                            <p className="aq5-kicker">Sang {heir} Kecil</p>
                            <div className="aq5-crest">
                                <svg viewBox="0 0 170 120" role="img" aria-label={`Monogram ${invitation.babyName}`}>
                                    <use href="#aq5-laurel" x="15" y="70" width="140" height="36" />
                                    <use href="#aq5-crown" x="62" y="0" width="46" height="34" />
                                    <circle cx="85" cy="66" r="30" fill="#1b2a5c" stroke="url(#aq5-g)" strokeWidth="3" />
                                    <text
                                        x="85"
                                        y="78"
                                        textAnchor="middle"
                                        fontFamily="Cinzel Decorative, Georgia, serif"
                                        fontWeight="700"
                                        fontSize="34"
                                        fill="#f0cf7c"
                                    >
                                        {babyInitial}
                                    </text>
                                </svg>
                            </div>
                            <div
                                className="aq5-kid-pic"
                                style={
                                    babyPhoto ? { backgroundImage: `url(${babyPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
                                }
                            >
                                {!babyPhoto && <span>{babyInitial}</span>}
                            </div>
                            <p className="aq5-kid-name">{invitation.babyName}</p>
                            {invitation.fatherName && (
                                <p className="aq5-kid-binti">
                                    {bintiWord} {invitation.fatherName}
                                </p>
                            )}
                            {babyGender && (
                                <p className="aq5-profile-gender">
                                    {genderIcon(babyGender)} {babyGender}
                                </p>
                            )}
                            {invitation.birthDateFormatted && <p className="aq5-profile-birth">{invitation.birthDateFormatted}</p>}
                            {profileLine && (
                                <div className="aq5-parents">
                                    <p className="aq5-parents-who">{profileLine}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── EVENTS / ACARA ────────────────────────────────────────────── */}
                {isEnabled('event_detail') && invitation.events.length > 0 && (
                    <section className="aq5-section aq5-events-bg">
                        <CrownTop />
                        <p className="aq5-kicker aq5-kicker-light">Waktu &amp; Tempat</p>
                        <h2 className="aq5-h2 aq5-h2-light aq5-anim-up">Insya Allah diselenggarakan pada</h2>
                        <p className="aq5-flock-note aq5-anim-up">
                            Aqiqah dengan {sheepCount} ekor kambing{babyGender ? ` untuk sang ${heir.toLowerCase()}` : ''} 🐐
                            {sheepCount === 2 ? '🐐' : ''}
                        </p>

                        {invitation.events.map((ev, i) => {
                            const mapsUrl = mapsUrlFor(ev);
                            const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                            const parts = sealParts(ev);
                            return (
                                <div key={i} className="aq5-seal-card aq5-anim-up">
                                    {ev.name && <p className="aq5-event-name">{ev.name}</p>}
                                    <div className="aq5-seal">
                                        <svg viewBox="0 0 150 150" aria-hidden="true">
                                            <use href="#aq5-seal-shape" />
                                        </svg>
                                        <div className="aq5-seal-txt">
                                            <span>{parts.weekday}</span>
                                            <b>{parts.day}</b>
                                            <span>{parts.month}</span>
                                        </div>
                                    </div>
                                    <div className="aq5-where">
                                        {timeStr && <p className="aq5-where-time">PUKUL {timeStr}</p>}
                                        {ev.locationName && <p className="aq5-where-name">{ev.locationName}</p>}
                                        {ev.location && <p className="aq5-where-addr">{ev.location}</p>}
                                    </div>
                                    <div className="aq5-actions">
                                        {mapsUrl && (
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq5-btn aq5-btn-solid">
                                                Buka Peta
                                            </a>
                                        )}
                                        {ev.location && (
                                            <button type="button" className="aq5-btn" onClick={() => copyAddress(ev.location, showToast)}>
                                                Salin Alamat
                                            </button>
                                        )}
                                        {isEnabled('add_to_calendar') && (
                                            <button type="button" className="aq5-btn" onClick={() => addToCalendar(ev, invitation.babyName)}>
                                                Simpan Tanggal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isEnabled('countdown') && invitation.countdownDate && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="aq5-count aq5-anim-up"
                                boxClassName="aq5-count-box"
                                numClassName="aq5-count-num"
                                labelClassName="aq5-count-label"
                                doneMessage={<p className="aq5-past">Acara telah berlangsung. Terima kasih atas doa dan kehadirannya.</p>}
                            />
                        )}
                    </section>
                )}

                {/* ── LOCATION ──────────────────────────────────────────────────── */}
                {isEnabled('location') &&
                    countdownEvent &&
                    (() => {
                        const mapsUrl = mapsUrlFor(countdownEvent);
                        if (!countdownEvent.mapsEmbed && !mapsUrl) return null;
                        return (
                            <section className="aq5-section">
                                <CrownTop />
                                <h2 className="aq5-section-title aq5-anim-up">Lokasi Acara</h2>
                                <div className="aq5-divider aq5-anim-up">
                                    <span>🗺️</span>
                                </div>
                                {countdownEvent.locationName && (
                                    <p className="aq5-location-sub aq5-anim-up">
                                        {countdownEvent.name} · {countdownEvent.locationName}
                                    </p>
                                )}
                                <div className="aq5-anim-up">
                                    {countdownEvent.mapsEmbed && (
                                        <div className="aq5-map-wrapper">
                                            <iframe
                                                src={countdownEvent.mapsEmbed}
                                                width="100%"
                                                height="400"
                                                style={{ border: 0, display: 'block' }}
                                                allowFullScreen
                                                loading="lazy"
                                                title={`Lokasi ${countdownEvent.locationName || countdownEvent.name}`}
                                            />
                                        </div>
                                    )}
                                    {mapsUrl && (
                                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="aq5-btn-maps">
                                                🗺️ Buka Google Maps
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })()}

                {/* ── GALLERY ───────────────────────────────────────────────────── */}
                {isEnabled('gallery') && invitation.gallery?.length > 0 && (
                    <section className="aq5-section">
                        <CrownTop />
                        <h2 className="aq5-section-title aq5-anim-up">Galeri Foto</h2>
                        <div className="aq5-divider aq5-anim-up">
                            <span>📷</span>
                        </div>
                        <GallerySection
                            items={invitation.gallery}
                            styles={{
                                grid: 'aq5-gallery-grid',
                                item: 'aq5-gallery-item',
                                thumb: 'aq5-gallery-thumb',
                                overlay: 'aq5-gallery-overlay',
                                filterBar: 'aq5-gallery-filter-bar',
                                filterBtn: 'aq5-filter-btn',
                                filterBtnActive: 'aq5-filter-btn aq5-filter-btn-active',
                            }}
                        />
                    </section>
                )}

                {/* ── VIDEO ─────────────────────────────────────────────────────── */}
                {isEnabled('video') && babyVideoEmbedUrl && (
                    <section className="aq5-section">
                        <CrownTop />
                        <h2 className="aq5-section-title aq5-anim-up">Video Kenangan</h2>
                        <div className="aq5-divider aq5-anim-up">
                            <span>▶</span>
                        </div>
                        <div className="aq5-video-frame aq5-anim-up">
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

                {/* ── DIGITAL ENVELOPE ─────────────────────────────────────────────── */}
                {isEnabled('digital_envelope') && (invitation.bankAccounts?.length > 0 || invitation.digitalWallets?.length > 0) && (
                    <section className="aq5-section aq5-gift-bg">
                        <CrownTop />
                        <h2 className="aq5-section-title aq5-light aq5-anim-up">Amplop Digital</h2>
                        <div className="aq5-divider aq5-light aq5-anim-up">
                            <span>🎁</span>
                        </div>
                        <p className="aq5-gift-subtitle aq5-anim-up">
                            Doa restu Bapak/Ibu/Saudara/i merupakan hadiah yang paling berarti bagi kami. Namun bagi yang ingin memberikan tanda kasih
                            untuk sang {heir}, kami telah menyediakan amplop digital berikut.
                        </p>
                        <DigitalWalletSection
                            bankAccounts={invitation.bankAccounts ?? []}
                            digitalWallets={invitation.digitalWallets ?? []}
                            onToast={showToast}
                            styles={{
                                bankGrid: 'aq5-bank-grid',
                                bankCard: 'aq5-bank-card',
                                bankLogo: 'aq5-bank-logo',
                                bankType: 'aq5-bank-type',
                                bankNumber: 'aq5-bank-number',
                                bankName: 'aq5-bank-name',
                                copyBankBtn: 'aq5-btn-copy-bank',
                                ewalletGrid: 'aq5-ewallet-grid',
                                ewalletCard: 'aq5-ewallet-card',
                                ewalletName: 'aq5-ewallet-name',
                                ewalletPhone: 'aq5-ewallet-phone',
                                copyEwalletBtn: 'aq5-btn-copy-ewallet',
                                ewalletTitle: 'aq5-ewallet-title',
                            }}
                        />
                    </section>
                )}

                {/* ── RSVP ──────────────────────────────────────────────────────── */}
                {isEnabled('rsvp') && (
                    <section className="aq5-section">
                        <CrownTop />
                        <h2 className="aq5-section-title aq5-anim-up">RSVP &amp; Doa</h2>
                        <div className="aq5-divider aq5-anim-up">
                            <span>✉️</span>
                        </div>
                        <p className="aq5-rsvp-hint aq5-anim-up">Titipkan doa barakah untuk sang {heir} kecil.</p>
                        <RSVPForm
                            rsvpEndpoint={invitation.rsvpEndpoint}
                            guestName={invitation.guestName || undefined}
                            guestSlug={invitation.guestSlug}
                            onToast={showToast}
                            labels={{
                                attending: '👑 Insya Allah Hadir',
                                notAttending: '🙏 Berhalangan Hadir',
                                maybe: '🤔 Belum Bisa Pastikan',
                            }}
                            styles={{
                                form: 'aq5-rsvp-form',
                                label: 'aq5-rsvp-label',
                                input: 'aq5-rsvp-input',
                                select: 'aq5-rsvp-select',
                                textarea: 'aq5-rsvp-textarea',
                                radioGroup: 'aq5-rsvp-radio-group',
                                radioLabel: 'aq5-rsvp-radio-label',
                                errorText: 'aq5-rsvp-error',
                                submitBtn: 'aq5-rsvp-submit',
                                successBox: 'aq5-rsvp-success',
                            }}
                        />
                    </section>
                )}

                {/* ── WISHES ────────────────────────────────────────────────────── */}
                {isEnabled('wishes') && (
                    <section className="aq5-section aq5-wishes-bg">
                        <CrownTop />
                        <h2 className="aq5-section-title aq5-anim-up">Ucapan &amp; Doa</h2>
                        <div className="aq5-divider aq5-anim-up">
                            <span>💬</span>
                        </div>
                        <WishesSection
                            wishesEndpoint={invitation.wishesEndpoint}
                            allowComments={invitation.allowComments}
                            onToast={showToast}
                            styles={{
                                container: 'aq5-wishes-layout',
                                formBox: 'aq5-wishes-form',
                                formTitle: 'aq5-wishes-form-title',
                                nameInput: 'aq5-wish-input',
                                messageInput: 'aq5-wish-input',
                                submitBtn: 'aq5-wish-btn',
                                wishCard: 'aq5-wish-card',
                                wishAvatar: 'aq5-wish-avatar',
                                wishName: 'aq5-wish-name',
                                wishDate: 'aq5-wish-date',
                                wishMessage: 'aq5-wish-message',
                                loadMoreBtn: 'aq5-btn-more',
                            }}
                        />
                    </section>
                )}

                {/* ── CLOSING ───────────────────────────────────────────────────── */}
                {isEnabled('footer') && (
                    <section className="aq5-section">
                        <div className="aq5-card aq5-anim-up">
                            <CrownTop />
                            <p className="aq5-lead" style={{ marginTop: 0 }}>
                                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa
                                restu.
                            </p>
                            <p className="aq5-closing-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
                            <LaurelDivider />
                            <p className="aq5-kicker" style={{ marginTop: '14px' }}>
                                Kami yang Berbahagia
                            </p>
                            <p className="aq5-closing-family">{parentsLine ? `Kel. ${parentsLine}` : invitation.babyName}</p>
                            <p className="aq5-closing-credit">Dibuat dengan ♥ · Undangan Digital</p>
                        </div>
                    </section>
                )}

                <footer className="aq5-footer">DESAIN: PANGERAN KECIL</footer>
            </div>
            {/* end main */}

            {/* ── Music Player ──────────────────────────────────────────────────── */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonStyle={{ background: 'var(--aq5-navy)', border: '2px solid var(--aq5-gold)', color: 'var(--aq5-gold-2)' }}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────── */}
            <Toast message={toast} onDone={clearToast} className="aq5-toast" />

            {/* ── Back to Top ───────────────────────────────────────────────────── */}
            {showBackTop && (
                <button className="aq5-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Kembali ke atas">
                    ↑
                </button>
            )}
        </div>
    );
}
