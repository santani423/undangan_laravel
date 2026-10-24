import { gsap } from 'gsap';
import { MapPinned } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { music, unlockAudio } from '../audio/audioEngine';
import { PackIcon } from '../components/ui/PackIcon';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { scrollToStop } from '../hooks/useScrollCamera';
import { toyAssets } from '../lib/assets';
import { formatEventDate } from '../lib/format';
import { useExperience } from '../store/experience';

interface InvitationCoverProps {
    onOpen: () => void;
    reducedMotion: boolean;
}

/** Scene 1 — the Toy World entrance: invitation cover, then the welcome hero. */
export function InvitationCover({ onOpen, reducedMotion }: InvitationCoverProps) {
    const { config } = useInvitation();
    const opened = useExperience((s) => s.opened);
    const cardRef = useRef<HTMLDivElement>(null);
    const heroHeadingRef = useRef<HTMLHeadingElement>(null);
    const [opening, setOpening] = useState(false);
    const { child, invitation, event, guest, features } = config;
    const dateLabel = event?.dateLabel || formatEventDate(config.countdownISO);
    const withMusic = features.music && music.hasSource && config.music.autoplay;

    const handleOpen = () => {
        if (opening) return;
        setOpening(true);
        unlockAudio();
        if (reducedMotion || !cardRef.current) {
            onOpen();
            return;
        }
        gsap.timeline({ onComplete: onOpen })
            .to(cardRef.current, { scale: 1.03, duration: 0.14, ease: 'power1.out' })
            .to(cardRef.current, { scale: 0.85, opacity: 0, y: -36, duration: 0.42, ease: 'back.in(1.7)' });
    };

    useEffect(() => {
        // Only a guest who pressed "Buka Undangan" is taken to the welcome heading.
        if (opened && opening) heroHeadingRef.current?.focus({ preventScroll: true });
    }, [opened, opening]);

    return (
        <section id="beranda" aria-labelledby="bt10-cover-title" data-camera-stop={0} className="bt10-cover">
            {!opened ? (
                // Fixed overlay with its own scrolling: the page is locked until opened, but a
                // short screen (phone in landscape) can still reach the button.
                <div className="bt10-cover__overlay">
                    <div className="bt10-cover__center">
                        <div ref={cardRef} className="bt10-cover__card-wrap">
                            <ToyCard studs={4} className="bt10-cover__card">
                                <img
                                    src={toyAssets.illustrations.balloons}
                                    alt=""
                                    aria-hidden="true"
                                    className="bt10-deco bt10-deco--cover-balloons bt10-bob"
                                />
                                <img src={toyAssets.illustrations.mascot} alt="" aria-hidden="true" className="bt10-deco bt10-deco--cover-mascot" />
                                <p className="bt10-eyebrow">
                                    <PackIcon name="gift" size={16} className="bt10-text-coral-deep" />
                                    {invitation.eyebrow}
                                </p>
                                {features.greeting && (
                                    <>
                                        <p className="bt10-cover__to">{guest.label}</p>
                                        <p className="bt10-cover__guest">{guest.name}</p>
                                    </>
                                )}

                                <h1 id="bt10-cover-title" className="bt10-cover__title">
                                    <span className="bt10-cover__name">{child.nickname}</span>
                                    <span className="bt10-cover__age">{child.age ? `Ulang Tahun ke-${child.age}` : 'Pesta Ulang Tahun'}</span>
                                </h1>
                                <p className="bt10-cover__subtitle">{invitation.title}</p>

                                {dateLabel && (
                                    <p className="bt10-cover__date">
                                        <PackIcon name="calendar" size={18} />
                                        {dateLabel}
                                    </p>
                                )}
                                <p className="bt10-cover__message">{invitation.coverMessage}</p>

                                <button
                                    type="button"
                                    onClick={handleOpen}
                                    disabled={opening}
                                    aria-describedby={withMusic ? 'bt10-cover-music-hint' : undefined}
                                    className="bt10-btn bt10-btn--coral bt10-cover__open"
                                >
                                    <PackIcon name="gift" size={22} />
                                    {opening ? 'Membuka…' : invitation.buttonText}
                                </button>
                                {withMusic && (
                                    <p id="bt10-cover-music-hint" className="bt10-cover__hint">
                                        <PackIcon name="music" size={14} /> Musik akan diputar setelah undangan dibuka
                                    </p>
                                )}
                            </ToyCard>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bt10-hero">
                    <div className="bt10-hero__card-wrap bt10-pop-in">
                        <ToyCard studs={5} className="bt10-hero__card">
                            <p className="bt10-eyebrow">{guest.personalised ? `Selamat datang, ${guest.name}!` : 'Selamat datang!'}</p>
                            <h1 id="bt10-cover-title" ref={heroHeadingRef} tabIndex={-1} className="bt10-hero__title">
                                Dunia Mainan <span className="bt10-text-coral-deep">{child.nickname}</span>
                            </h1>
                            <p className="bt10-hero__meta">
                                {child.age ? `Pesta ulang tahun ke-${child.age}` : 'Pesta ulang tahun'}
                                {dateLabel && ` · ${dateLabel}`}
                            </p>
                            {event && (event.timeLabel || event.venueName) && (
                                <div className="bt10-hero__chips">
                                    {event.timeLabel && (
                                        <span className="bt10-chip bt10-chip--butter">
                                            <PackIcon name="calendar" size={16} /> {event.timeLabel}
                                        </span>
                                    )}
                                    {event.venueName && (
                                        <span className="bt10-chip bt10-chip--mint">
                                            <MapPinned size={16} aria-hidden="true" /> {event.venueName}
                                        </span>
                                    )}
                                </div>
                            )}
                        </ToyCard>
                    </div>

                    <button type="button" onClick={() => scrollToStop(1, reducedMotion)} className="bt10-hero__scroll">
                        <span className="bt10-hero__scroll-label">Gulir untuk mulai berpetualang</span>
                        <span className="bt10-hero__scroll-icon bt10-nudge">
                            <PackIcon name="chevronDown" size={22} />
                        </span>
                    </button>
                </div>
            )}
        </section>
    );
}
