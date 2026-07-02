import Countdown from '@/components/invitation/Countdown';
import DigitalWalletSection from '@/components/invitation/DigitalWalletSection';
import GallerySection from '@/components/invitation/GallerySection';
import GuestQrCode from '@/components/invitation/GuestQrCode';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import RSVPForm from '@/components/invitation/RSVPForm';
import Toast, { useToast } from '@/components/invitation/Toast';
import WishesSection from '@/components/invitation/WishesSection';
import type { Greeting, InvitationEvent, WeddingInvitation } from '@/types/invitation';
import {
    CalendarDays,
    ChevronUp,
    Clock,
    Gift,
    Heart,
    Images,
    MapPin,
    MessageCircleHeart,
    Music,
    Navigation,
    Sparkles,
    UserRound,
    Video,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './wedding-theme-03.css';

interface WeddingTheme03Props {
    invitation: WeddingInvitation;
    visitor?: string;
    greeting?: Greeting;
}

interface NavItem {
    id: string;
    label: string;
    Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface SectionHeadingProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    light?: boolean;
}

interface CoupleCardProps {
    role: string;
    nickname: string;
    fullName: string;
    initials: string;
    photo: string;
    childOrder: string;
    father: string;
    mother: string;
    bio: string;
    align?: 'left' | 'right';
}

const EVENT_ICONS = [Heart, Sparkles, CalendarDays, Music, Gift, Navigation];
const EMPTY_FEATURES: NonNullable<WeddingInvitation['features']> = {};

function valueText(value: unknown, fallback = ''): string {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
}

function isValidDate(value: string): boolean {
    return Boolean(value && !Number.isNaN(new Date(value).getTime()));
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

function getMapsUrl(event: InvitationEvent): string {
    const locationUrl = valueText(event.locationUrl);
    if (locationUrl) return locationUrl;

    const lat = valueText(event.mapsLat);
    const lng = valueText(event.mapsLng);
    return lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '';
}

function getEventTime(event: InvitationEvent): string {
    const start = valueText(event.time);
    const end = valueText(event.timeEnd);
    if (!start) return '';
    return end ? `${start} - ${end} WIB` : `${start} WIB`;
}

function addToCalendar(event: InvitationEvent) {
    const date = valueText(event.date);
    if (!date) return;

    const startTime = valueText(event.time, '08:00:00').replace(/:/g, '');
    const endTime = valueText(event.timeEnd || event.time, '10:00:00').replace(/:/g, '');
    const start = `${date.replace(/-/g, '')}T${startTime.padEnd(6, '0')}Z`;
    const end = `${date.replace(/-/g, '')}T${endTime.padEnd(6, '0')}Z`;
    const locationName = valueText(event.locationName);
    const location = valueText(event.location);
    const loc = locationName ? `${locationName}${location ? `, ${location}` : ''}` : location;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(valueText(event.name, 'Acara Pernikahan'))}&dates=${start}/${end}&location=${encodeURIComponent(loc)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
}

function SectionHeading({ eyebrow, title, subtitle, light = false }: SectionHeadingProps) {
    return (
        <div className={`wt3-section-header${light ? ' light' : ''}`}>
            <span className="wt3-section-label wt3-anim-up">{eyebrow}</span>
            <h2 className="wt3-section-title wt3-anim-up">{title}</h2>
            <div className="wt3-ornament-divider wt3-anim-up" aria-hidden="true">
                <span />
                <Heart size={16} strokeWidth={1.6} />
                <span />
            </div>
            {subtitle && <p className="wt3-section-subtitle wt3-anim-up">{subtitle}</p>}
        </div>
    );
}

function CoverSection({
    opened,
    onOpen,
    invitation,
    greeting,
    guestName,
    heroPhoto,
}: {
    opened: boolean;
    onOpen: () => void;
    invitation: WeddingInvitation;
    greeting?: Greeting;
    guestName: string;
    heroPhoto: string;
}) {
    const groomName = valueText(invitation.groomNickname || invitation.groomFullName, 'Mempelai Pria');
    const brideName = valueText(invitation.brideNickname || invitation.brideFullName, 'Mempelai Wanita');
    const displayGuest = guestName || valueText(greeting?.guestLabel);

    return (
        <div className={`wt3-cover${opened ? ' hidden' : ''}`}>
            {heroPhoto && <div className="wt3-cover-photo" style={{ backgroundImage: `url(${heroPhoto})` }} />}
            <div className="wt3-petal-layer" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, index) => (
                    <span
                        key={`petal-${index}`}
                        className="wt3-petal"
                        style={{
                            left: `${(index * 19) % 100}%`,
                            animationDelay: `${(index % 6) * 0.75}s`,
                            animationDuration: `${5 + (index % 5)}s`,
                        }}
                    />
                ))}
            </div>

            <div className="wt3-cover-card">
                <p className="wt3-cover-label">Wedding Invitation</p>
                <p className="wt3-cover-the">The Wedding of</p>
                <h1 className="wt3-cover-names">
                    {groomName}
                    <span>&amp;</span>
                    {brideName}
                </h1>
                {invitation.mainDateFormatted && <p className="wt3-cover-date">{invitation.mainDateFormatted}</p>}

                {displayGuest && (
                    <div className="wt3-cover-guest-box">
                        <p className="wt3-cover-to">{valueText(greeting?.title, 'Kepada Yth.')}</p>
                        <p className="wt3-cover-guest">{displayGuest}</p>
                        {guestName && greeting?.guestLabel && <p className="wt3-cover-guest-label">{greeting.guestLabel}</p>}
                    </div>
                )}

                {greeting?.message && <p className="wt3-cover-message">{greeting.message}</p>}

                {invitation.guestQrData && (
                    <div className="wt3-cover-qr">
                        <GuestQrCode data={invitation.guestQrData} size={118} style={{ borderRadius: '14px' }} />
                        <span>QR Check-in Tamu</span>
                    </div>
                )}

                <button type="button" className="wt3-cover-button" onClick={onOpen}>
                    <Sparkles size={16} strokeWidth={1.8} />
                    {valueText(greeting?.buttonText, 'Buka Undangan')}
                </button>
            </div>
        </div>
    );
}

function FloatingNavigation({ items, activeSection, visible }: { items: NavItem[]; activeSection: string; visible: boolean }) {
    if (!visible || items.length === 0) return null;

    return (
        <nav className="wt3-floating-nav" aria-label="Navigasi undangan">
            {items.map(({ id, label, Icon }) => (
                <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} aria-label={label} title={label}>
                    <Icon size={17} strokeWidth={1.8} />
                </a>
            ))}
        </nav>
    );
}

function HeroSection({ invitation, heroPhoto, hasCountdown }: { invitation: WeddingInvitation; heroPhoto: string; hasCountdown: boolean }) {
    const groomName = valueText(invitation.groomNickname || invitation.groomFullName, 'Mempelai Pria');
    const brideName = valueText(invitation.brideNickname || invitation.brideFullName, 'Mempelai Wanita');
    const initials = `${valueText(invitation.groomInitials, 'G')} & ${valueText(invitation.brideInitials, 'B')}`;

    return (
        <section id="wt3-hero" className="wt3-hero">
            <div className="wt3-hero-florals" aria-hidden="true" />
            <div className="wt3-corner wt3-corner-tl" aria-hidden="true" />
            <div className="wt3-corner wt3-corner-br" aria-hidden="true" />

            <div className="wt3-hero-content">
                <p className="wt3-hero-label wt3-anim-up">The Wedding of</p>
                <h1 className="wt3-hero-names wt3-anim-up">
                    {groomName}
                    <span>&amp;</span>
                    {brideName}
                </h1>

                <div className="wt3-hero-photo-frame wt3-anim-scale">
                    <div className="wt3-hero-photo" style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined}>
                        {!heroPhoto && <span>{initials}</span>}
                    </div>
                </div>

                {invitation.mainDateFormatted && (
                    <div className="wt3-hero-date wt3-anim-up">
                        <CalendarDays size={16} strokeWidth={1.8} />
                        <span>{invitation.mainDateFormatted}</span>
                    </div>
                )}

                {hasCountdown && (
                    <Countdown
                        targetDate={invitation.countdownDate}
                        className="wt3-countdown wt3-anim-up"
                        boxClassName="wt3-countdown-item"
                        numClassName="wt3-countdown-num"
                        labelClassName="wt3-countdown-label"
                        doneMessage={<p className="wt3-countdown-done">Acara telah berlangsung</p>}
                    />
                )}

                <a href="#wt3-couple" className="wt3-primary-button wt3-anim-up">
                    <Navigation size={16} strokeWidth={1.8} />
                    Lihat Undangan
                </a>
            </div>
        </section>
    );
}

function OpeningQuoteSection({ quote }: { quote: string }) {
    if (!quote) return null;

    return (
        <section className="wt3-opening-quote">
            <div className="wt3-container">
                <p className="wt3-bismillah wt3-anim-up">Bismillahirrahmanirrahim</p>
                <p className="wt3-opening-text wt3-anim-up">{quote}</p>
            </div>
        </section>
    );
}

function CoupleCard({ role, nickname, fullName, initials, photo, childOrder, father, mother, bio, align = 'left' }: CoupleCardProps) {
    const hasParents = Boolean(father || mother);

    return (
        <article className={`wt3-couple-card wt3-anim-${align}`}>
            <div className="wt3-couple-photo-wrap">
                <div className="wt3-couple-photo" style={photo ? { backgroundImage: `url(${photo})` } : undefined}>
                    {!photo && <UserRound size={44} strokeWidth={1.3} />}
                </div>
                {!photo && initials && <span className="wt3-couple-initials">{initials}</span>}
            </div>
            <p className="wt3-couple-role">{role}</p>
            <h3 className="wt3-couple-name">{nickname || fullName}</h3>
            {fullName && <p className="wt3-couple-fullname">{fullName}</p>}
            {(childOrder || hasParents) && (
                <div className="wt3-couple-parents">
                    {childOrder && <p>{hasParents ? `${childOrder} dari` : childOrder}</p>}
                    {hasParents && (
                        <p>
                            {father && <strong>{father}</strong>}
                            {father && mother && <span> dan </span>}
                            {mother && <strong>{mother}</strong>}
                        </p>
                    )}
                </div>
            )}
            {bio && <p className="wt3-couple-bio">{bio}</p>}
        </article>
    );
}

function CoupleSection({ invitation }: { invitation: WeddingInvitation }) {
    const groomName = valueText(invitation.groomNickname || invitation.groomFullName, 'Mempelai Pria');
    const brideName = valueText(invitation.brideNickname || invitation.brideFullName, 'Mempelai Wanita');

    return (
        <section id="wt3-couple" className="wt3-section wt3-couple-section">
            <div className="wt3-container">
                <SectionHeading
                    eyebrow="Mempelai"
                    title="Pasangan Bahagia"
                    subtitle="Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan kami."
                />

                <div className="wt3-couple-grid">
                    <CoupleCard
                        role="Mempelai Pria"
                        nickname={groomName}
                        fullName={valueText(invitation.groomFullName)}
                        initials={valueText(invitation.groomInitials)}
                        photo={valueText(invitation.groomPhoto)}
                        childOrder={valueText(invitation.groomChildOrder)}
                        father={valueText(invitation.groomFather)}
                        mother={valueText(invitation.groomMother)}
                        bio={valueText(invitation.groomBio)}
                        align="left"
                    />

                    <div className="wt3-couple-divider" aria-hidden="true">
                        <span />
                        <Heart size={24} strokeWidth={1.4} />
                        <span />
                    </div>

                    <CoupleCard
                        role="Mempelai Wanita"
                        nickname={brideName}
                        fullName={valueText(invitation.brideFullName)}
                        initials={valueText(invitation.brideInitials)}
                        photo={valueText(invitation.bridePhoto)}
                        childOrder={valueText(invitation.brideChildOrder)}
                        father={valueText(invitation.brideFather)}
                        mother={valueText(invitation.brideMother)}
                        bio={valueText(invitation.brideBio)}
                        align="right"
                    />
                </div>
            </div>
        </section>
    );
}

function EventSection({ events }: { events: InvitationEvent[] }) {
    if (events.length === 0) return null;

    return (
        <section id="wt3-events" className="wt3-section wt3-events-section">
            <div className="wt3-container">
                <SectionHeading eyebrow="Rangkaian Acara" title="Detail Acara" light />

                <div className="wt3-event-grid">
                    {events.map((event, index) => {
                        const Icon = EVENT_ICONS[index % EVENT_ICONS.length];
                        const mapsUrl = getMapsUrl(event);
                        const time = getEventTime(event);
                        const name = valueText(event.name, 'Acara Pernikahan');
                        const key = `${name}-${valueText(event.date)}-${index}`;

                        return (
                            <article key={key} className="wt3-event-card wt3-anim-up">
                                <div className="wt3-event-icon">
                                    <Icon size={28} strokeWidth={1.6} />
                                </div>
                                <p className="wt3-event-type">{name}</p>
                                <h3 className="wt3-event-name">{name}</h3>

                                {event.dateFormatted && (
                                    <p className="wt3-event-detail">
                                        <CalendarDays size={16} strokeWidth={1.7} />
                                        <strong>{event.dateFormatted}</strong>
                                    </p>
                                )}
                                {time && (
                                    <p className="wt3-event-detail">
                                        <Clock size={16} strokeWidth={1.7} />
                                        <span>{time}</span>
                                    </p>
                                )}
                                {(event.locationName || event.location) && (
                                    <p className="wt3-event-detail">
                                        <MapPin size={16} strokeWidth={1.7} />
                                        <span>
                                            {event.locationName && <strong>{event.locationName}</strong>}
                                            {event.locationName && event.location && <br />}
                                            {event.location}
                                        </span>
                                    </p>
                                )}

                                <div className="wt3-event-actions">
                                    {mapsUrl && (
                                        <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt3-outline-button">
                                            <MapPin size={15} strokeWidth={1.8} />
                                            Peta
                                        </a>
                                    )}
                                    {event.date && (
                                        <button type="button" className="wt3-outline-button" onClick={() => addToCalendar(event)}>
                                            <CalendarDays size={15} strokeWidth={1.8} />
                                            Kalender
                                        </button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function LocationSection({ event }: { event?: InvitationEvent }) {
    if (!event) return null;

    const mapsUrl = getMapsUrl(event);
    const embed = valueText(event.mapsEmbed);

    if (!embed && !mapsUrl && !event.locationName && !event.location) return null;

    return (
        <section id="wt3-location" className="wt3-section wt3-location-section">
            <div className="wt3-container">
                <SectionHeading eyebrow="Lokasi" title="Tempat Acara" subtitle="Kami menantikan kehadiran Anda di hari bahagia kami." />

                {embed && (
                    <div className="wt3-map-frame wt3-anim-up">
                        <iframe
                            src={embed}
                            title={`Lokasi ${valueText(event.locationName || event.name, 'Acara')}`}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}

                {(event.locationName || event.location) && (
                    <div className="wt3-address-card wt3-anim-up">
                        {event.locationName && <h3>{event.locationName}</h3>}
                        {event.location && <p>{event.location}</p>}
                        {mapsUrl && (
                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="wt3-primary-button">
                                <MapPin size={16} strokeWidth={1.8} />
                                Buka Google Maps
                            </a>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

function LoveStorySection({ invitation }: { invitation: WeddingInvitation }) {
    const stories = Array.isArray(invitation.loveStory) ? invitation.loveStory : [];
    if (stories.length === 0) return null;

    return (
        <section id="wt3-love-story" className="wt3-section wt3-love-story-section">
            <div className="wt3-container">
                <SectionHeading
                    eyebrow="Our Journey"
                    title="Love Story"
                    subtitle="Setiap cerita menyimpan langkah kecil yang membawa kami sampai di hari ini."
                />

                <div className="wt3-timeline">
                    {stories.map((story, index) => {
                        const key = `${valueText(story.title, 'story')}-${valueText(story.date)}-${index}`;

                        return (
                            <article key={key} className="wt3-timeline-item wt3-anim-up">
                                <div className="wt3-timeline-dot">
                                    <Heart size={16} strokeWidth={1.6} />
                                </div>
                                <div className="wt3-timeline-card">
                                    {story.photo && <div className="wt3-timeline-photo" style={{ backgroundImage: `url(${story.photo})` }} />}
                                    {story.date && <p className="wt3-timeline-date">{story.date}</p>}
                                    <h3>{valueText(story.title, 'Cerita Kami')}</h3>
                                    {story.desc && <p>{story.desc}</p>}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function GallerySectionBlock({ invitation }: { invitation: WeddingInvitation }) {
    const gallery = Array.isArray(invitation.gallery) ? invitation.gallery : [];
    if (gallery.length === 0) return null;

    return (
        <section id="wt3-gallery" className="wt3-section wt3-gallery-section">
            <div className="wt3-container">
                <SectionHeading eyebrow="Gallery" title="Momen Berharga" light />
                <GallerySection
                    items={gallery}
                    showFilters
                    filters={[
                        { key: 'prewedding', label: 'Prewedding' },
                        { key: 'engagement', label: 'Engagement' },
                    ]}
                    styles={{
                        grid: 'wt3-gallery-grid',
                        item: 'wt3-gallery-item',
                        thumb: 'wt3-gallery-thumb',
                        overlay: 'wt3-gallery-overlay',
                        filterBar: 'wt3-gallery-filter-bar',
                        filterBtn: 'wt3-filter-btn',
                        filterBtnActive: 'wt3-filter-btn wt3-filter-btn-active',
                    }}
                />
            </div>
        </section>
    );
}

function VideoSection({ embedUrl }: { embedUrl: string }) {
    if (!embedUrl) return null;

    return (
        <section id="wt3-video" className="wt3-section wt3-video-section">
            <div className="wt3-container">
                <SectionHeading eyebrow="Video" title="Video Mempelai" />
                <div className="wt3-video-frame wt3-anim-up">
                    <iframe
                        src={embedUrl}
                        title="Video Mempelai"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
}

function DressCodeSection({ invitation }: { invitation: WeddingInvitation }) {
    const dressCodes = Array.isArray(invitation.dressCodes) ? invitation.dressCodes : [];
    if (dressCodes.length === 0) return null;

    return (
        <section id="wt3-dress-code" className="wt3-section wt3-dress-section">
            <div className="wt3-container">
                <SectionHeading
                    eyebrow="Dress Code"
                    title="Palet Busana"
                    subtitle="Dengan hormat, tamu undangan dapat menyesuaikan busana dengan palet berikut."
                />
                <div className="wt3-dress-grid wt3-anim-up">
                    {dressCodes.map((dressCode, index) => (
                        <div key={`${valueText(dressCode.name, 'warna')}-${index}`} className="wt3-dress-card">
                            <span className="wt3-dress-swatch" style={{ background: valueText(dressCode.hex, '#e8c4b8') }} />
                            <p>{valueText(dressCode.name, 'Warna Busana')}</p>
                            {dressCode.hex && <small>{dressCode.hex}</small>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function GiftSection({ invitation, onToast }: { invitation: WeddingInvitation; onToast: (message: string) => void }) {
    const bankAccounts = Array.isArray(invitation.bankAccounts) ? invitation.bankAccounts : [];
    const digitalWallets = Array.isArray(invitation.digitalWallets) ? invitation.digitalWallets : [];

    if (bankAccounts.length === 0 && digitalWallets.length === 0) return null;

    return (
        <section id="wt3-gift" className="wt3-section wt3-gift-section">
            <div className="wt3-container">
                <SectionHeading
                    eyebrow="Wedding Gift"
                    title="Amplop Digital"
                    subtitle="Doa restu Anda adalah hadiah terindah. Bagi yang ingin berbagi tanda kasih, tersedia pilihan berikut."
                />
                <DigitalWalletSection
                    bankAccounts={bankAccounts}
                    digitalWallets={digitalWallets}
                    onToast={onToast}
                    styles={{
                        bankGrid: 'wt3-bank-grid',
                        bankCard: 'wt3-bank-card',
                        bankLogo: 'wt3-bank-logo',
                        bankType: 'wt3-bank-type',
                        bankNumber: 'wt3-bank-number',
                        bankName: 'wt3-bank-name',
                        copyBankBtn: 'wt3-copy-button',
                        ewalletGrid: 'wt3-ewallet-grid',
                        ewalletCard: 'wt3-ewallet-card',
                        ewalletName: 'wt3-ewallet-name',
                        ewalletPhone: 'wt3-ewallet-phone',
                        copyEwalletBtn: 'wt3-copy-button',
                        ewalletTitle: 'wt3-ewallet-title',
                    }}
                />
            </div>
        </section>
    );
}

function RsvpSection({ invitation, onToast }: { invitation: WeddingInvitation; onToast: (message: string) => void }) {
    return (
        <section id="wt3-rsvp" className="wt3-section wt3-rsvp-section">
            <div className="wt3-container">
                <SectionHeading
                    eyebrow="Konfirmasi"
                    title="RSVP"
                    subtitle={invitation.rsvpDeadline ? `Mohon konfirmasi sebelum ${invitation.rsvpDeadline}.` : 'Mohon konfirmasi kehadiran Anda.'}
                />
                <RSVPForm
                    rsvpEndpoint={invitation.rsvpEndpoint}
                    guestName={invitation.guestName || undefined}
                    guestSlug={invitation.guestSlug}
                    onToast={onToast}
                    styles={{
                        form: 'wt3-rsvp-form wt3-anim-up',
                        label: 'wt3-form-label',
                        input: 'wt3-form-input',
                        select: 'wt3-form-input',
                        textarea: 'wt3-form-input wt3-textarea',
                        radioGroup: 'wt3-radio-group',
                        radioLabel: 'wt3-radio-label',
                        errorText: 'wt3-form-error',
                        submitBtn: 'wt3-submit-button',
                        successBox: 'wt3-rsvp-success',
                    }}
                    labels={{
                        attending: 'Hadir',
                        notAttending: 'Tidak Hadir',
                        maybe: 'Belum Pasti',
                        submit: 'Kirim Konfirmasi',
                    }}
                />
            </div>
        </section>
    );
}

function WishesSectionBlock({ invitation, onToast }: { invitation: WeddingInvitation; onToast: (message: string) => void }) {
    return (
        <section id="wt3-wishes" className="wt3-section wt3-wishes-section">
            <div className="wt3-container">
                <SectionHeading eyebrow="Ucapan" title="Doa & Ucapan" subtitle="Tuliskan doa terbaik untuk kedua mempelai." light />
                <WishesSection
                    wishesEndpoint={invitation.wishesEndpoint}
                    allowComments={invitation.allowComments}
                    onToast={onToast}
                    styles={{
                        container: 'wt3-wishes-layout',
                        formBox: 'wt3-wishes-form',
                        formTitle: 'wt3-wishes-form-title',
                        nameInput: 'wt3-wish-input',
                        messageInput: 'wt3-wish-input wt3-wish-textarea',
                        submitBtn: 'wt3-wish-button',
                        wishCard: 'wt3-wish-card',
                        wishAvatar: 'wt3-wish-avatar',
                        wishName: 'wt3-wish-name',
                        wishDate: 'wt3-wish-date',
                        wishMessage: 'wt3-wish-message',
                        loadMoreBtn: 'wt3-load-more',
                    }}
                />
            </div>
        </section>
    );
}

function ClosingSection({ invitation }: { invitation: WeddingInvitation }) {
    const groomName = valueText(invitation.groomNickname || invitation.groomFullName, 'Mempelai Pria');
    const brideName = valueText(invitation.brideNickname || invitation.brideFullName, 'Mempelai Wanita');
    const groomFamily = [valueText(invitation.groomFather), valueText(invitation.groomMother)].filter(Boolean).join(' dan ');
    const brideFamily = [valueText(invitation.brideFather), valueText(invitation.brideMother)].filter(Boolean).join(' dan ');

    return (
        <footer id="wt3-closing" className="wt3-closing">
            <div className="wt3-container">
                <div className="wt3-closing-card wt3-anim-up">
                    <p className="wt3-closing-label">Terima Kasih</p>
                    <h2>
                        {groomName} &amp; {brideName}
                    </h2>
                    <p className="wt3-closing-text">
                        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
                    </p>
                    {(groomFamily || brideFamily) && (
                        <div className="wt3-family-list">
                            {groomFamily && <p>Keluarga besar {groomFamily}</p>}
                            {brideFamily && <p>Keluarga besar {brideFamily}</p>}
                        </div>
                    )}
                    <p className="wt3-credit">Undesia Digital Invitation</p>
                </div>
            </div>
        </footer>
    );
}

export default function WeddingTheme03({ invitation, visitor, greeting }: WeddingTheme03Props) {
    const features = invitation.features ?? EMPTY_FEATURES;
    const coverEnabled = features.cover !== false;
    const greetingEnabled = features.greeting !== false;
    const [opened, setOpened] = useState(!coverEnabled);
    const [showBackTop, setShowBackTop] = useState(false);
    const [activeSection, setActiveSection] = useState('wt3-hero');
    const { toast, showToast, clearToast } = useToast();
    const mainRef = useRef<HTMLDivElement>(null);

    const events = Array.isArray(invitation.events) ? invitation.events : [];
    const mainEvent = events.find((event) => event.isCountdown) ?? events[0];
    const heroPhoto = valueText(invitation.couplePhoto || invitation.groomPhoto || invitation.bridePhoto);
    const guestName = valueText(invitation.guestName || visitor);
    const hasCountdown = features.countdown !== false && isValidDate(valueText(invitation.countdownDate));
    const videoEmbedUrl = getVideoEmbedUrl(valueText(invitation.coupleVideoUrl));
    const loveStories = Array.isArray(invitation.loveStory) ? invitation.loveStory : [];
    const gallery = Array.isArray(invitation.gallery) ? invitation.gallery : [];
    const dressCodes = Array.isArray(invitation.dressCodes) ? invitation.dressCodes : [];
    const hasGift = (invitation.bankAccounts?.length ?? 0) > 0 || (invitation.digitalWallets?.length ?? 0) > 0;

    const isEnabled = useCallback((key: keyof NonNullable<WeddingInvitation['features']>) => features[key] !== false, [features]);

    const navItems = useMemo<NavItem[]>(() => {
        const items: NavItem[] = [{ id: 'wt3-hero', label: 'Home', Icon: Heart }];

        if (isEnabled('couple_profile')) items.push({ id: 'wt3-couple', label: 'Mempelai', Icon: UserRound });
        if (isEnabled('event_detail') && events.length > 0) items.push({ id: 'wt3-events', label: 'Acara', Icon: CalendarDays });
        if (isEnabled('location') && mainEvent) items.push({ id: 'wt3-location', label: 'Lokasi', Icon: MapPin });
        if (isEnabled('love_story') && loveStories.length > 0) items.push({ id: 'wt3-love-story', label: 'Love Story', Icon: Heart });
        if (isEnabled('gallery') && gallery.length > 0) items.push({ id: 'wt3-gallery', label: 'Galeri', Icon: Images });
        if (isEnabled('video') && videoEmbedUrl) items.push({ id: 'wt3-video', label: 'Video', Icon: Video });
        if (dressCodes.length > 0) items.push({ id: 'wt3-dress-code', label: 'Dress Code', Icon: Sparkles });
        if (isEnabled('digital_envelope') && hasGift) items.push({ id: 'wt3-gift', label: 'Gift', Icon: Gift });
        if (isEnabled('rsvp')) items.push({ id: 'wt3-rsvp', label: 'RSVP', Icon: MessageCircleHeart });
        if (isEnabled('wishes')) items.push({ id: 'wt3-wishes', label: 'Ucapan', Icon: MessageCircleHeart });

        return items;
    }, [dressCodes.length, events.length, gallery.length, hasGift, isEnabled, loveStories.length, mainEvent, videoEmbedUrl]);

    useEffect(() => {
        if (!coverEnabled) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = opened ? '' : 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [coverEnabled, opened]);

    useEffect(() => {
        if (!opened) return;

        const observer = new IntersectionObserver(
            (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('wt3-visible')),
            { threshold: 0.12 },
        );

        document.querySelectorAll('.wt3-anim-up, .wt3-anim-left, .wt3-anim-right, .wt3-anim-scale').forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [opened]);

    useEffect(() => {
        if (!opened) return;

        const handler = () => {
            setShowBackTop(window.scrollY > 420);

            let current = navItems[0]?.id ?? 'wt3-hero';
            for (const section of navItems) {
                const element = document.getElementById(section.id);
                if (element && window.scrollY >= element.offsetTop - 280) {
                    current = section.id;
                }
            }
            setActiveSection(current);
        };

        handler();
        window.addEventListener('scroll', handler, { passive: true });

        return () => window.removeEventListener('scroll', handler);
    }, [navItems, opened]);

    const openInvitation = () => setOpened(true);

    return (
        <div className="wt3-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Great+Vibes&family=Montserrat:wght@300;400;500;600&display=swap');
            `}</style>

            {coverEnabled && (
                <CoverSection
                    opened={opened}
                    onOpen={openInvitation}
                    invitation={invitation}
                    greeting={greetingEnabled ? greeting : undefined}
                    guestName={guestName}
                    heroPhoto={heroPhoto}
                />
            )}

            <FloatingNavigation items={navItems} activeSection={activeSection} visible={opened} />

            <div ref={mainRef} className={`wt3-main${opened ? ' visible' : ''}`}>
                <HeroSection invitation={invitation} heroPhoto={heroPhoto} hasCountdown={hasCountdown} />
                <OpeningQuoteSection quote={valueText(invitation.openingQuote)} />
                {isEnabled('couple_profile') && <CoupleSection invitation={invitation} />}
                {isEnabled('event_detail') && <EventSection events={events} />}
                {isEnabled('location') && <LocationSection event={mainEvent} />}
                {isEnabled('love_story') && <LoveStorySection invitation={invitation} />}
                {isEnabled('gallery') && <GallerySectionBlock invitation={invitation} />}
                {isEnabled('video') && <VideoSection embedUrl={videoEmbedUrl} />}
                <DressCodeSection invitation={invitation} />
                {isEnabled('digital_envelope') && <GiftSection invitation={invitation} onToast={showToast} />}
                {isEnabled('rsvp') && <RsvpSection invitation={invitation} onToast={showToast} />}
                {isEnabled('wishes') && <WishesSectionBlock invitation={invitation} onToast={showToast} />}
                <ClosingSection invitation={invitation} />
            </div>

            {isEnabled('music') && invitation.music?.url && (
                <MusicPlayer
                    url={invitation.music.url}
                    autoplay={invitation.music.autoplay}
                    loop={invitation.music.loop}
                    triggerPlay={opened}
                    buttonClassName="wt3-music-button"
                    buttonStyle={{ background: 'var(--wt3-gold)', color: 'var(--wt3-dark)' }}
                />
            )}

            <Toast message={toast} onDone={clearToast} className="wt3-toast" />

            {showBackTop && (
                <button
                    className="wt3-back-top"
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Kembali ke atas"
                >
                    <ChevronUp size={20} strokeWidth={1.8} />
                </button>
            )}
        </div>
    );
}
