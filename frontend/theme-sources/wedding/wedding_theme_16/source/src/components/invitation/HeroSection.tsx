import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CalendarPlus, ChevronsDown, Download } from 'lucide-react';
import { useExperience } from '../../hooks/useAppContext';
import { useInvitationData } from '../../hooks/useInvitationData';
import { buildIcs, downloadIcs, googleCalendarUrl } from '../../lib/calendar';
import { formatLongDate } from '../../lib/date';
import { AssetIcon } from '../ui/AssetIcon';
import { Countdown } from '../ui/Countdown';

/** Section A — names, date, invitation message and live countdown. */
export function HeroSection() {
  const { config, first, second } = useInvitationData();
  const { phase, reducedMotion } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  const revealed = phase !== 'cover';
  const coupleTitle = `${first.nickname} & ${second.nickname}`;
  const mainEvent = config.events[0];

  useLayoutEffect(() => {
    if (!revealed || reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-item]', { autoAlpha: 0, y: 26, stagger: 0.12, duration: 1.1, ease: 'power3.out', delay: 0.55 });
    }, ref);
    return () => ctx.revert();
  }, [revealed, reducedMotion]);

  return (
    <section id="beranda" aria-labelledby="beranda-title" className="relative flex min-h-[100svh] items-center justify-center px-4 py-[12svh] sm:px-8">
      <div ref={ref} className="invite-card w-full max-w-2xl text-center">
        <AssetIcon name="heart" className="mx-auto size-9" />
        <p className="eyebrow mt-3" data-hero-item>
          Pernikahan
        </p>
        <h1 id="beranda-title" tabIndex={-1} className="script mt-2 text-5xl text-rose-deep outline-none sm:text-7xl" data-hero-item>
          {first.nickname} <span className="font-serif text-4xl text-gold-deep sm:text-5xl">&amp;</span> {second.nickname}
        </h1>
        <p className="mt-3 font-serif text-xl text-ink sm:text-2xl" data-hero-item>
          {formatLongDate(config.weddingDate, config.weddingTimeZone)}
        </p>
        <div className="pixel-divider mt-4" aria-hidden="true" />
        <p className="body-copy mx-auto mt-4 max-w-lg" data-hero-item>
          {config.greeting.heroMessage}
        </p>
        {config.greeting.quote && (
          <blockquote className="mx-auto mt-4 max-w-md font-serif text-lg italic text-ink-soft" data-hero-item>
            “{config.greeting.quote.text}”
            {config.greeting.quote.source && <footer className="mt-1 text-sm not-italic">— {config.greeting.quote.source}</footer>}
          </blockquote>
        )}

        <div className="mt-6" data-hero-item>
          <Countdown target={config.weddingDate} />
        </div>

        {mainEvent && (
          <div className="mt-5 flex flex-wrap justify-center gap-2" data-hero-item>
            <a className="btn btn-secondary btn-sm" href={googleCalendarUrl(mainEvent, coupleTitle)} target="_blank" rel="noopener noreferrer">
              <CalendarPlus aria-hidden="true" className="size-4" />
              Simpan ke Google Calendar
              <span className="sr-only">(membuka tab baru)</span>
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => downloadIcs(buildIcs(config.events, coupleTitle, config.meta.slug), 'undangan-pernikahan.ics')}
            >
              <Download aria-hidden="true" className="size-4" />
              Unduh Kalender (.ics)
            </button>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gold-ink" aria-hidden="true">
          <ChevronsDown className="scroll-hint-dot size-4" />
          Gulir untuk menjelajahi taman
        </p>
      </div>
    </section>
  );
}
