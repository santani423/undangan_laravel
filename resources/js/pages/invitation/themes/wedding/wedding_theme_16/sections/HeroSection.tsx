import { gsap } from 'gsap';
import { CalendarPlus, ChevronsDown, Download } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { AssetIcon } from '../components/AssetIcon';
import { Countdown } from '../components/Countdown';
import { useExperience, useInvitationData } from '../hooks/useAppContext';
import { buildIcs, downloadIcs, googleCalendarUrl } from '../lib/calendar';

/** Section A — names, date, invitation message and live countdown. */
export function HeroSection() {
    const { config, first, second } = useInvitationData();
    const { phase, reducedMotion } = useExperience();
    const ref = useRef<HTMLDivElement>(null);
    const revealed = phase !== 'cover';
    const coupleTitle = `${first.nickname} & ${second.nickname}`;
    const mainEvent = config.events.find((event) => event.start);
    const { quote } = config.greeting;

    useLayoutEffect(() => {
        if (!revealed || reducedMotion) return;
        const ctx = gsap.context(() => {
            gsap.from('[data-hero-item]', { autoAlpha: 0, y: 26, stagger: 0.12, duration: 1.1, ease: 'power3.out', delay: 0.55 });
        }, ref);
        return () => ctx.revert();
    }, [revealed, reducedMotion]);

    return (
        <section id="beranda" aria-labelledby="beranda-title" className="wt16-section wt16-section--center wt16-hero">
            <div ref={ref} className="wt16-card wt16-card--lg wt16-hero__card">
                <AssetIcon name="heart" className="wt16-hero__icon" />
                <p className="wt16-eyebrow" data-hero-item>
                    Pernikahan
                </p>
                <h1 id="beranda-title" tabIndex={-1} className="wt16-script wt16-hero__names" data-hero-item>
                    {first.nickname} <span className="wt16-hero__amp">&amp;</span> {second.nickname}
                </h1>
                {config.weddingDateLabel && (
                    <p className="wt16-hero__date" data-hero-item>
                        {config.weddingDateLabel}
                    </p>
                )}
                <div className="wt16-divider" aria-hidden="true" />
                <p className="wt16-body wt16-hero__message" data-hero-item>
                    {config.greeting.heroMessage}
                </p>
                {quote && (
                    <blockquote className="wt16-quote" data-hero-item>
                        “{quote.text}”{quote.source && <footer className="wt16-quote__source">— {quote.source}</footer>}
                    </blockquote>
                )}

                {config.sections.countdown && (
                    <div className="wt16-hero__countdown" data-hero-item>
                        <Countdown target={config.weddingDate} />
                    </div>
                )}

                {config.sections.calendar && mainEvent && (
                    <div className="wt16-actions wt16-hero__actions" data-hero-item>
                        <a
                            className="wt16-btn wt16-btn--secondary wt16-btn--sm"
                            href={googleCalendarUrl(mainEvent, coupleTitle)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <CalendarPlus aria-hidden="true" size={16} />
                            Simpan ke Google Calendar
                            <span className="wt16-sr-only">(membuka tab baru)</span>
                        </a>
                        <button
                            type="button"
                            className="wt16-btn wt16-btn--secondary wt16-btn--sm"
                            onClick={() => downloadIcs(buildIcs(config.events, coupleTitle, config.meta.slug), 'undangan-pernikahan.ics')}
                        >
                            <Download aria-hidden="true" size={16} />
                            Unduh Kalender (.ics)
                        </button>
                    </div>
                )}

                <p className="wt16-hero__hint" aria-hidden="true">
                    <ChevronsDown size={16} className="wt16-scroll-hint" />
                    Gulir untuk menjelajahi taman
                </p>
            </div>
        </section>
    );
}
