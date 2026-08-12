import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import { useEffect, useMemo, useRef, useState } from 'react';
import './wedding-theme-11.css';

// Decorative vintage floral corner art — genuinely load-bearing for this
// theme's visual identity, kept from the original static prototype.
const floralCornerUrl = new URL('./assets/img/floral-corner.png', import.meta.url).href;
const floralCorner2Url = new URL('./assets/img/floral-corner-2.png', import.meta.url).href;

interface WeddingTheme11Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

interface PetalStyle {
    left: string;
    size: number;
    duration: string;
    delay: string;
    opacity: number;
}

interface NavLink {
    id: string;
    label: string;
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 2c2.7 0 3 .01 4.1.06 1.1.05 1.8.22 2.4.46.7.27 1.2.63 1.7 1.13.5.5.86 1 1.13 1.7.24.6.4 1.3.46 2.4.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.1-.22 1.8-.46 2.4-.27.7-.63 1.2-1.13 1.7-.5.5-1 .86-1.7 1.13-.6.24-1.3.4-2.4.46-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.1-.05-1.8-.22-2.4-.46a4.9 4.9 0 0 1-1.7-1.13 4.9 4.9 0 0 1-1.13-1.7c-.24-.6-.4-1.3-.46-2.4C2.01 15 2 14.7 2 12s.01-3 .06-4.1c.05-1.1.22-1.8.46-2.4.27-.7.63-1.2 1.13-1.7.5-.5 1-.86 1.7-1.13.6-.24 1.3-.4 2.4-.46C9 2.01 9.3 2 12 2Zm0 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4ZM17.3 6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
            />
        </svg>
    );
}

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

// Style-prop maps for the shared, behavior-only components. Defined once
// outside the component so identity stays stable across renders.
const walletStyles = {
    bankGrid: 'wt11-bank-grid',
    bankCard: 'wt11-bank-card',
    bankLogo: 'wt11-bank-logo',
    bankType: 'wt11-bank-type',
    bankNumber: 'wt11-bank-number',
    bankName: 'wt11-bank-name',
    copyBankBtn: 'wt11-btn-copy',
    ewalletGrid: 'wt11-ewallet-grid',
    ewalletCard: 'wt11-ewallet-card',
    ewalletName: 'wt11-ewallet-name',
    ewalletPhone: 'wt11-ewallet-phone',
    copyEwalletBtn: 'wt11-btn-copy',
    ewalletTitle: 'wt11-ewallet-title',
};

const rsvpStyles = {
    form: 'wt11-form',
    label: 'wt11-form-label',
    input: 'wt11-form-input',
    select: 'wt11-form-select',
    textarea: 'wt11-form-textarea',
    radioGroup: 'wt11-radio-group',
    radioLabel: 'wt11-radio-chip',
    errorText: 'wt11-form-error',
    submitBtn: 'wt11-btn wt11-btn-accent wt11-btn-block',
    successBox: 'wt11-form-success',
};

const wishesStyles = {
    container: 'wt11-wishes-layout',
    formBox: 'wt11-wishes-form-box',
    formTitle: 'wt11-wishes-form-title',
    nameInput: 'wt11-form-input',
    messageInput: 'wt11-form-textarea',
    submitBtn: 'wt11-btn wt11-btn-accent',
    wishCard: 'wt11-wish-card',
    wishAvatar: 'wt11-wish-avatar',
    wishName: 'wt11-wish-name',
    wishDate: 'wt11-wish-date',
    wishMessage: 'wt11-wish-message',
    loadMoreBtn: 'wt11-btn wt11-btn-outline wt11-btn-block',
};

const galleryStyles = {
    grid: 'wt11-gallery-grid',
    item: 'wt11-gallery-item',
    thumb: 'wt11-gallery-thumb',
    overlay: 'wt11-gallery-overlay',
    filterBar: 'wt11-gallery-filter-bar',
    filterBtn: 'wt11-gallery-filter-btn',
    filterBtnActive: 'wt11-gallery-filter-btn wt11-gallery-filter-btn-active',
};

export default function WeddingTheme11({ invitation, visitor, greeting }: WeddingTheme11Props) {
    const features = invitation.features ?? {};
    const isEnabled = (key: keyof typeof features) => features[key] !== false;

    const coverEnabled = isEnabled('cover');
    const greetingEnabled = isEnabled('greeting');

    const [opened, setOpened] = useState(!coverEnabled);
    const [navOpen, setNavOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [petals, setPetals] = useState<PetalStyle[]>([]);
    const [giftTab, setGiftTab] = useState<'bank' | 'ewallet'>('bank');
    const { toast, showToast, clearToast } = useToast();
    const rootRef = useRef<HTMLDivElement>(null);

    const groomPhoto = invitation.groomPhoto;
    const bridePhoto = invitation.bridePhoto;
    const couplePhoto = invitation.couplePhoto;
    const heroPhoto = couplePhoto || groomPhoto || bridePhoto;
    const guestName = invitation.guestName || visitor || '';
    const coverGuestName = guestName || greeting?.guestLabel || '';
    const coupleVideoEmbedUrl = getVideoEmbedUrl(invitation.coupleVideoUrl ?? '');

    const hasBank = (invitation.bankAccounts?.length ?? 0) > 0;
    const hasEwallet = (invitation.digitalWallets?.length ?? 0) > 0;

    const mainEvent = invitation.events?.find((e) => e.isCountdown) ?? invitation.events?.[0];
    const mainEventMapsUrl = mainEvent
        ? mainEvent.locationUrl || (mainEvent.mapsLat && mainEvent.mapsLng ? `https://maps.google.com/?q=${mainEvent.mapsLat},${mainEvent.mapsLng}` : '')
        : '';

    const hashtag = `#${(invitation.groomNickname || '').replace(/\s+/g, '')}${(invitation.brideNickname || '').replace(/\s+/g, '')}`;

    // Default the gift tab to whichever payment method actually has data.
    useEffect(() => {
        if (hasBank) setGiftTab('bank');
        else if (hasEwallet) setGiftTab('ewallet');
    }, [hasBank, hasEwallet]);

    // Ambient falling petals — generated client-side once on mount.
    useEffect(() => {
        const count = window.innerWidth < 640 ? 10 : 18;
        setPetals(
            Array.from({ length: count }, () => ({
                left: `${Math.random() * 100}vw`,
                size: 8 + Math.random() * 10,
                duration: `${12 + Math.random() * 14}s`,
                delay: `${Math.random() * -20}s`,
                opacity: 0.3 + Math.random() * 0.35,
            })),
        );
    }, []);

    // Scroll-reveal animation for every `.wt11-reveal` element on the page.
    useEffect(() => {
        if (!opened) return;
        const root = rootRef.current;
        if (!root) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('wt11-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 },
        );
        root.querySelectorAll('.wt11-reveal').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [opened]);

    // Love-story timeline center line "draws" itself in once scrolled into view.
    useEffect(() => {
        if (!opened) return;
        const root = rootRef.current;
        const el = root?.querySelector('.wt11-timeline');
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('wt11-drawn');
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [opened, invitation.loveStory]);

    // Nav shadow-on-scroll + back-to-top visibility.
    useEffect(() => {
        const handler = () => {
            setScrolled(window.scrollY > 40);
            setShowBackTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const navLinks: NavLink[] = useMemo(() => {
        const links: NavLink[] = [];
        if (isEnabled('couple_profile')) links.push({ id: 'couple', label: 'Mempelai' });
        if (isEnabled('event_detail') && invitation.events?.length > 0) links.push({ id: 'event', label: 'Acara' });
        if (isEnabled('love_story') && invitation.loveStory?.length > 0) links.push({ id: 'love-story', label: 'Love Story' });
        if (isEnabled('gallery') && invitation.gallery?.length > 0) links.push({ id: 'gallery', label: 'Galeri' });
        if (isEnabled('digital_envelope') && (hasBank || hasEwallet)) links.push({ id: 'gift', label: 'Amplop Digital' });
        if (isEnabled('rsvp')) links.push({ id: 'rsvp', label: 'RSVP' });
        if (isEnabled('wishes')) links.push({ id: 'wishes', label: 'Ucapan' });
        return links;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [features, invitation.events, invitation.loveStory, invitation.gallery, hasBank, hasEwallet]);

    // Highlight active nav link while scrolling.
    useEffect(() => {
        if (!opened || navLinks.length === 0) return;
        const root = rootRef.current;
        const sections = root?.querySelectorAll<HTMLElement>('[data-navsection]');
        if (!sections || sections.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -45% 0px' },
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [opened, navLinks]);

    const scrollToId = (id: string) => {
        setNavOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openInvitation = () => setOpened(true);

    return (
        <div className="wt11-root" ref={rootRef}>
            {/* Google Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
            `}</style>

            {/* Ambient decor */}
            <div className="wt11-petals" aria-hidden="true">
                {petals.map((p, i) => (
                    <span
                        key={i}
                        className="wt11-petal"
                        style={{
                            left: p.left,
                            width: p.size,
                            height: p.size,
                            animationDuration: p.duration,
                            animationDelay: p.delay,
                            opacity: p.opacity,
                        }}
                    />
                ))}
            </div>

            {/* ── COVER / GATE ──────────────────────────────────────────────────── */}
            {coverEnabled && (
                <section className={`wt11-cover${opened ? ' wt11-cover-open' : ''}`} aria-hidden={opened}>
                    <div className="wt11-cover-bg" style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined}>
                        {!heroPhoto && (
                            <div className="wt11-cover-placeholder">
                                {invitation.groomInitials}
                                <span className="wt11-amp">&amp;</span>
                                {invitation.brideInitials}
                            </div>
                        )}
                    </div>
                    <div className="wt11-cover-scrim" />
                    <img className="wt11-cover-corner wt11-cover-corner-tl" src={floralCorner2Url} alt="" aria-hidden="true" />
                    <img className="wt11-cover-corner wt11-cover-corner-br" src={floralCornerUrl} alt="" aria-hidden="true" />

                    <div className="wt11-cover-content">
                        <p className="wt11-eyebrow wt11-cover-eyebrow">Undangan Pernikahan</p>
                        <h1 className="wt11-script-names wt11-cover-names">
                            {invitation.groomNickname} <span className="wt11-amp">&amp;</span> {invitation.brideNickname}
                        </h1>
                        <p className="wt11-cover-date">{invitation.mainDateFormatted}</p>

                        {greetingEnabled && coverGuestName && (
                            <div className="wt11-cover-guest">
                                <span className="wt11-cover-guest-title">{greeting?.title ?? 'Kepada Yth.'}</span>
                                <strong className="wt11-cover-guest-name">{coverGuestName}</strong>
                                {guestName && greeting?.guestLabel && <span className="wt11-cover-guest-label">{greeting.guestLabel}</span>}
                            </div>
                        )}
                        {greetingEnabled && greeting?.message && <p className="wt11-cover-guest-message">{greeting.message}</p>}

                        {invitation.guestQrData && (
                            <div className="wt11-cover-qr">
                                <GuestQrCode data={invitation.guestQrData} size={110} className="wt11-cover-qr-canvas" />
                                <p>QR Check-in Tamu</p>
                            </div>
                        )}

                        <button className="wt11-btn-open" type="button" onClick={openInvitation}>
                            <span className="wt11-btn-ring" />
                            <span className="wt11-btn-label">{greeting?.buttonText ?? 'Buka Undangan'}</span>
                        </button>
                    </div>
                </section>
            )}

            {/* ── SITE ──────────────────────────────────────────────────────────── */}
            <div className={`wt11-site${opened ? ' wt11-site-open' : ''}`}>
                {/* NAV */}
                <nav className={`wt11-nav${scrolled ? ' wt11-nav-scrolled' : ''}`}>
                    <a className="wt11-nav-brand wt11-script-names" onClick={() => scrollToId('hero')}>
                        {(invitation.groomNickname || '?').charAt(0)}
                        <span className="wt11-amp">&amp;</span>
                        {(invitation.brideNickname || '?').charAt(0)}
                    </a>
                    {navLinks.length > 0 && (
                        <>
                            <button
                                className={`wt11-nav-toggle${navOpen ? ' wt11-nav-toggle-open' : ''}`}
                                onClick={() => setNavOpen((v) => !v)}
                                aria-label="Buka menu"
                                type="button"
                            >
                                <span />
                                <span />
                                <span />
                            </button>
                            <ul className={`wt11-nav-list${navOpen ? ' wt11-nav-list-open' : ''}`}>
                                {navLinks.map((link) => (
                                    <li key={link.id}>
                                        <a
                                            className={activeSection === link.id ? 'wt11-nav-active' : ''}
                                            onClick={() => scrollToId(link.id)}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </nav>

                {/* HERO */}
                <header className="wt11-hero" id="hero">
                    <div className="wt11-hero-bg" style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined}>
                        {!heroPhoto && (
                            <div className="wt11-hero-placeholder">
                                {invitation.groomInitials}
                                <span className="wt11-amp">&amp;</span>
                                {invitation.brideInitials}
                            </div>
                        )}
                    </div>
                    <div className="wt11-hero-scrim" />
                    <div className="wt11-hero-content">
                        <p className="wt11-eyebrow wt11-reveal wt11-fade-up">You&apos;re Invited to</p>
                        <p className="wt11-eyebrow wt11-eyebrow-lg wt11-reveal wt11-fade-up wt11-delay-1">The Wedding Of</p>
                        <h2 className="wt11-script-names wt11-hero-names wt11-reveal wt11-fade-in wt11-delay-2">
                            {invitation.groomNickname} <span className="wt11-amp">&amp;</span> {invitation.brideNickname}
                        </h2>
                        <p className="wt11-hero-date wt11-reveal wt11-fade-up wt11-delay-3">{invitation.mainDateFormatted}</p>

                        {isEnabled('countdown') && (
                            <Countdown
                                targetDate={invitation.countdownDate}
                                className="wt11-countdown wt11-reveal wt11-fade-up wt11-delay-4"
                                boxClassName="wt11-countdown-box"
                                numClassName="wt11-countdown-num"
                                labelClassName="wt11-countdown-label"
                            />
                        )}
                    </div>
                    <div className="wt11-hero-scroll-cue" aria-hidden="true">
                        <span />
                    </div>
                </header>

                {/* INTRO / OPENING VERSE */}
                <section className="wt11-section wt11-section-intro">
                    <img className="wt11-deco wt11-deco-corner-left" src={floralCorner2Url} alt="" aria-hidden="true" />
                    <div className="wt11-container wt11-container-narrow">
                        <p className="wt11-intro-arabic wt11-reveal wt11-fade-up">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                        <p className="wt11-intro-salam wt11-reveal wt11-fade-up wt11-delay-1">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
                        <p className="wt11-intro-text wt11-serif wt11-reveal wt11-fade-up wt11-delay-2">
                            Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta&apos;ala, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk
                            menghadiri acara pernikahan putra&ndash;putri kami. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
                            Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
                        </p>
                    </div>
                </section>

                {/* COUPLE */}
                {isEnabled('couple_profile') && (
                    <section className="wt11-section wt11-section-alt" id="couple" data-navsection>
                        <img className="wt11-deco wt11-deco-corner-right" src={floralCornerUrl} alt="" aria-hidden="true" />
                        <div className="wt11-container">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Kedua Mempelai</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Mempelai</h2>

                            <div className="wt11-couple-grid">
                                <article className="wt11-couple-card wt11-reveal wt11-fade-right">
                                    <div className="wt11-couple-frame">
                                        {groomPhoto ? (
                                            <img src={groomPhoto} alt={invitation.groomFullName} loading="lazy" />
                                        ) : (
                                            <div className="wt11-couple-placeholder">{invitation.groomInitials}</div>
                                        )}
                                    </div>
                                    <h3 className="wt11-script-names wt11-couple-name">{invitation.groomFullName}</h3>
                                    {invitation.groomChildOrder && <p className="wt11-couple-order">{invitation.groomChildOrder}</p>}
                                    {(invitation.groomFather || invitation.groomMother) && (
                                        <p className="wt11-couple-parents">
                                            Putra dari {invitation.groomFather}
                                            {invitation.groomFather && invitation.groomMother && <> &amp; </>}
                                            {invitation.groomMother}
                                        </p>
                                    )}
                                    {invitation.groomBio && <p className="wt11-couple-bio">{invitation.groomBio}</p>}
                                    {invitation.groomInstagram && (
                                        <a
                                            className="wt11-couple-ig"
                                            href={`https://instagram.com/${invitation.groomInstagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <InstagramIcon />
                                            <span>{invitation.groomInstagram}</span>
                                        </a>
                                    )}
                                </article>

                                <div className="wt11-couple-amp wt11-reveal wt11-fade-in wt11-delay-1">&amp;</div>

                                <article className="wt11-couple-card wt11-reveal wt11-fade-left">
                                    <div className="wt11-couple-frame">
                                        {bridePhoto ? (
                                            <img src={bridePhoto} alt={invitation.brideFullName} loading="lazy" />
                                        ) : (
                                            <div className="wt11-couple-placeholder">{invitation.brideInitials}</div>
                                        )}
                                    </div>
                                    <h3 className="wt11-script-names wt11-couple-name">{invitation.brideFullName}</h3>
                                    {invitation.brideChildOrder && <p className="wt11-couple-order">{invitation.brideChildOrder}</p>}
                                    {(invitation.brideFather || invitation.brideMother) && (
                                        <p className="wt11-couple-parents">
                                            Putri dari {invitation.brideFather}
                                            {invitation.brideFather && invitation.brideMother && <> &amp; </>}
                                            {invitation.brideMother}
                                        </p>
                                    )}
                                    {invitation.brideBio && <p className="wt11-couple-bio">{invitation.brideBio}</p>}
                                    {invitation.brideInstagram && (
                                        <a
                                            className="wt11-couple-ig"
                                            href={`https://instagram.com/${invitation.brideInstagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <InstagramIcon />
                                            <span>{invitation.brideInstagram}</span>
                                        </a>
                                    )}
                                </article>
                            </div>

                            {invitation.openingQuote && (
                                <blockquote className="wt11-quote wt11-reveal wt11-fade-up">
                                    <p className="wt11-serif">&ldquo;{invitation.openingQuote}&rdquo;</p>
                                </blockquote>
                            )}
                        </div>
                    </section>
                )}

                {/* EVENTS */}
                {isEnabled('event_detail') && (invitation.events?.length ?? 0) > 0 && (
                    <section className="wt11-section" id="event" data-navsection>
                        <img className="wt11-deco wt11-deco-corner-left" src={floralCorner2Url} alt="" aria-hidden="true" />
                        <div className="wt11-container">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Save The Date</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Rangkaian Acara</h2>

                            <div className="wt11-event-grid">
                                {invitation.events.map((ev, i) => {
                                    const mapsUrl =
                                        ev.locationUrl || (ev.mapsLat && ev.mapsLng ? `https://maps.google.com/?q=${ev.mapsLat},${ev.mapsLng}` : '');
                                    const timeStr = ev.time ? (ev.timeEnd ? `${ev.time} – ${ev.timeEnd} WIB` : `${ev.time} WIB`) : '';
                                    return (
                                        <div
                                            key={i}
                                            className="wt11-event-card wt11-reveal wt11-fade-up"
                                            style={{ transitionDelay: `${(i % 4) * 0.1}s` }}
                                        >
                                            <h3 className="wt11-event-label">{ev.name}</h3>
                                            {ev.dateFormatted && <p className="wt11-event-date">{ev.dateFormatted}</p>}
                                            {timeStr && <p className="wt11-event-time">{timeStr}</p>}
                                            <div className="wt11-event-divider" />
                                            {ev.locationName && <p className="wt11-event-place">{ev.locationName}</p>}
                                            {ev.location && <p className="wt11-event-address">{ev.location}</p>}
                                            <div className="wt11-event-actions">
                                                {mapsUrl && (
                                                    <a className="wt11-btn wt11-btn-outline" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                                        Lihat Lokasi
                                                    </a>
                                                )}
                                                {isEnabled('add_to_calendar') && (
                                                    <button type="button" className="wt11-btn wt11-btn-outline" onClick={() => addToCalendar(ev)}>
                                                        + Kalender
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

                {/* ADDRESS / MAP */}
                {isEnabled('location') && mainEvent && (mainEvent.mapsEmbed || mainEventMapsUrl) && (
                    <section className="wt11-section wt11-section-alt" id="address">
                        <div className="wt11-container">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Lokasi Acara</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">
                                {mainEvent.locationName || 'Lokasi Acara'}
                            </h2>

                            <div className="wt11-address-grid">
                                <div className="wt11-address-card wt11-reveal wt11-fade-right">
                                    <h3>Alamat Lengkap</h3>
                                    {mainEvent.location && <p>{mainEvent.location}</p>}
                                    <div className="wt11-address-actions">
                                        {mainEventMapsUrl && (
                                            <a href={mainEventMapsUrl} className="wt11-btn wt11-btn-accent" target="_blank" rel="noopener noreferrer">
                                                Buka di Google Maps
                                            </a>
                                        )}
                                        {mainEventMapsUrl && (
                                            <a href={mainEventMapsUrl} className="wt11-btn wt11-btn-outline" target="_blank" rel="noopener noreferrer">
                                                Petunjuk Arah
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {mainEvent.mapsEmbed && (
                                    <div className="wt11-address-map wt11-reveal wt11-fade-left">
                                        <iframe
                                            src={mainEvent.mapsEmbed}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Lokasi Acara"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* LOVE STORY */}
                {isEnabled('love_story') && (invitation.loveStory?.length ?? 0) > 0 && (
                    <section className="wt11-section" id="love-story" data-navsection>
                        <img className="wt11-deco wt11-deco-corner-right" src={floralCornerUrl} alt="" aria-hidden="true" />
                        <div className="wt11-container">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Our Journey</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Love Story</h2>

                            <div className="wt11-timeline">
                                {invitation.loveStory.map((item, i) => (
                                    <div key={i} className="wt11-timeline-item wt11-reveal wt11-fade-up">
                                        <span className="wt11-timeline-dot" />
                                        {item.photo && <img className="wt11-timeline-photo" src={item.photo} alt={item.title} loading="lazy" />}
                                        {item.date && <p className="wt11-timeline-date">{item.date}</p>}
                                        <h3 className="wt11-timeline-title">{item.title}</h3>
                                        <p className="wt11-timeline-desc">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* GALLERY */}
                {isEnabled('gallery') && (invitation.gallery?.length ?? 0) > 0 && (
                    <section className="wt11-section wt11-section-alt" id="gallery" data-navsection>
                        <div className="wt11-container">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Moments</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Galeri Foto</h2>
                            <div className="wt11-reveal wt11-fade-up wt11-delay-2">
                                <GallerySection items={invitation.gallery} styles={galleryStyles} />
                            </div>
                        </div>
                    </section>
                )}

                {/* VIDEO */}
                {isEnabled('video') && coupleVideoEmbedUrl && (
                    <section className="wt11-section" id="video">
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Our Video</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Video Mempelai</h2>
                            <div className="wt11-video-frame wt11-reveal wt11-fade-up wt11-delay-2">
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

                {/* DRESS CODE */}
                {(invitation.dressCodes?.length ?? 0) > 0 && (
                    <section className="wt11-section" id="dresscode">
                        <img className="wt11-deco wt11-deco-corner-left" src={floralCorner2Url} alt="" aria-hidden="true" />
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Dress Code</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Tema Busana</h2>
                            <p className="wt11-section-intro wt11-center wt11-reveal wt11-fade-up wt11-delay-2">
                                Kami mengundang Bapak/Ibu/Saudara/i untuk mengenakan busana rapi dan sopan dengan palet warna berikut, agar
                                dokumentasi acara terlihat senada dan indah.
                            </p>

                            <div className="wt11-palette">
                                {invitation.dressCodes.map((c, i) => (
                                    <div
                                        key={i}
                                        className="wt11-swatch wt11-reveal wt11-fade-up"
                                        style={{ transitionDelay: `${(i % 4) * 0.1}s` }}
                                    >
                                        <div className="wt11-swatch-circle" style={{ background: c.hex }} />
                                        <div className="wt11-swatch-name">{c.name}</div>
                                        <div className="wt11-swatch-hex">{c.hex}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="wt11-dress-lists">
                                <div className="wt11-dress-list wt11-dress-list-do wt11-reveal wt11-fade-right">
                                    <h3>Disarankan</h3>
                                    <ul>
                                        <li>Busana formal / semi-formal (batik, kebaya, gaun, kemeja rapi)</li>
                                        <li>Warna selaras dengan palet yang disarankan di atas</li>
                                        <li>Sepatu tertutup atau heels yang nyaman untuk area outdoor</li>
                                    </ul>
                                </div>
                                <div className="wt11-dress-list wt11-dress-list-dont wt11-reveal wt11-fade-left">
                                    <h3>Dihindari</h3>
                                    <ul>
                                        <li>Warna putih polos (disediakan khusus untuk pengantin)</li>
                                        <li>Pakaian olahraga, sandal jepit, atau denim kasual</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* DIGITAL GIFT */}
                {isEnabled('digital_envelope') && (hasBank || hasEwallet) && (
                    <section className="wt11-section wt11-section-alt" id="gift" data-navsection>
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Wedding Gift</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Amplop Digital</h2>
                            <p className="wt11-section-intro wt11-center wt11-reveal wt11-fade-up wt11-delay-2">
                                Doa restu Bapak/Ibu/Saudara/i adalah hadiah yang paling berarti bagi kami. Namun jika berkenan memberi tanda kasih,
                                dapat melalui:
                            </p>

                            {hasBank && hasEwallet ? (
                                <>
                                    <div className="wt11-gift-tabs wt11-reveal wt11-fade-up wt11-delay-3">
                                        <button
                                            type="button"
                                            className={`wt11-gift-tab${giftTab === 'bank' ? ' wt11-gift-tab-active' : ''}`}
                                            onClick={() => setGiftTab('bank')}
                                        >
                                            Transfer Bank
                                        </button>
                                        <button
                                            type="button"
                                            className={`wt11-gift-tab${giftTab === 'ewallet' ? ' wt11-gift-tab-active' : ''}`}
                                            onClick={() => setGiftTab('ewallet')}
                                        >
                                            E-Wallet
                                        </button>
                                    </div>
                                    <div className="wt11-gift-panel wt11-gift-panel-tabbed wt11-reveal wt11-fade-up wt11-delay-4">
                                        {giftTab === 'bank' ? (
                                            <DigitalWalletSection
                                                bankAccounts={invitation.bankAccounts ?? []}
                                                digitalWallets={[]}
                                                onToast={showToast}
                                                styles={walletStyles}
                                            />
                                        ) : (
                                            <DigitalWalletSection
                                                bankAccounts={[]}
                                                digitalWallets={invitation.digitalWallets ?? []}
                                                onToast={showToast}
                                                styles={walletStyles}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="wt11-gift-panel wt11-reveal wt11-fade-up wt11-delay-3">
                                    <DigitalWalletSection
                                        bankAccounts={invitation.bankAccounts ?? []}
                                        digitalWallets={invitation.digitalWallets ?? []}
                                        onToast={showToast}
                                        styles={walletStyles}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* RSVP */}
                {isEnabled('rsvp') && (
                    <section className="wt11-section" id="rsvp" data-navsection>
                        <img className="wt11-deco wt11-deco-corner-right" src={floralCornerUrl} alt="" aria-hidden="true" />
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Kehadiran Anda</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">RSVP</h2>
                            <p className="wt11-section-intro wt11-center wt11-reveal wt11-fade-up wt11-delay-2">
                                Mohon konfirmasi kehadiran Anda {invitation.rsvpDeadline ? `sebelum ${invitation.rsvpDeadline} ` : ''}agar kami
                                dapat mempersiapkan penyambutan dengan lebih baik.
                            </p>
                            <div className="wt11-reveal wt11-fade-up wt11-delay-3">
                                <RSVPForm
                                    rsvpEndpoint={invitation.rsvpEndpoint}
                                    guestName={invitation.guestName || undefined}
                                    guestSlug={invitation.guestSlug}
                                    onToast={showToast}
                                    styles={rsvpStyles}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* WISHES */}
                {isEnabled('wishes') && (
                    <section className="wt11-section wt11-section-alt" id="wishes" data-navsection>
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Ucapan &amp; Doa</p>
                            <h2 className="wt11-heading wt11-center wt11-reveal wt11-fade-up wt11-delay-1">Kirim Ucapan</h2>
                            <div className="wt11-reveal wt11-fade-up wt11-delay-2">
                                <WishesSection
                                    wishesEndpoint={invitation.wishesEndpoint}
                                    allowComments={invitation.allowComments}
                                    onToast={showToast}
                                    styles={wishesStyles}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* CLOSING / FOOTER */}
                {isEnabled('footer') && (
                    <footer className="wt11-closing" id="closing">
                        <img className="wt11-deco wt11-closing-corner wt11-closing-corner-left" src={floralCorner2Url} alt="" aria-hidden="true" />
                        <img className="wt11-deco wt11-closing-corner wt11-closing-corner-right" src={floralCornerUrl} alt="" aria-hidden="true" />
                        <div className="wt11-container wt11-container-narrow">
                            <p className="wt11-eyebrow wt11-center wt11-reveal wt11-fade-up">Terima Kasih</p>
                            <p className="wt11-closing-text wt11-serif wt11-reveal wt11-fade-up wt11-delay-1">
                                Atas doa dan restu yang Bapak/Ibu/Saudara/i berikan, kami mengucapkan terima kasih yang sebesar-besarnya. Sampai
                                jumpa di hari bahagia kami.
                            </p>
                            <h2 className="wt11-script-names wt11-closing-names wt11-reveal wt11-fade-in wt11-delay-2">
                                {invitation.groomNickname} <span className="wt11-amp">&amp;</span> {invitation.brideNickname}
                            </h2>
                            <p className="wt11-closing-wassalam wt11-reveal wt11-fade-up wt11-delay-3">
                                Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh
                            </p>
                            <div className="wt11-closing-footer">
                                <p>
                                    Dibuat dengan &hearts; &mdash; <span>{hashtag}</span>
                                </p>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
            {/* end .wt11-site */}

            {/* Back to top */}
            {showBackTop && (
                <button
                    className="wt11-back-to-top"
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Kembali ke atas"
                >
                    &uarr;
                </button>
            )}

            {/* Music player */}
            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonClassName="wt11-music-toggle"
                    buttonStyle={{
                        bottom: '24px',
                        right: '22px',
                        width: '52px',
                        height: '52px',
                        background: 'var(--wt11-white)',
                        color: 'var(--wt11-accent)',
                        boxShadow: 'var(--wt11-shadow-card)',
                    }}
                />
            )}

            {/* Toast */}
            <Toast message={toast} onDone={clearToast} className="wt11-toast" />
        </div>
    );
}
