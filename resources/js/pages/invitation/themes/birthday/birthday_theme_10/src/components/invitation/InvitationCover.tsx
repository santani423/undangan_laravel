import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MapPinned } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { toyAssets } from '../../config/assets';
import { useExperience } from '../../store/experience';
import { useGuestName } from '../../hooks/useGuestName';
import { scrollToStop } from '../../hooks/useScrollCamera';
import { unlockAudio, music } from '../../audio/audioEngine';
import { formatEventDate, formatEventTime } from '../../utils/format';
import { ToyCard } from '../ui/ToyCard';
import { PackIcon } from '../ui/PackIcon';

interface InvitationCoverProps {
  onOpen: () => void;
  reducedMotion: boolean;
}

/** Scene 1 — the Toy World entrance: invitation cover, then the welcome hero. */
export function InvitationCover({ onOpen, reducedMotion }: InvitationCoverProps) {
  const opened = useExperience((s) => s.opened);
  const guest = useGuestName();
  const cardRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const [opening, setOpening] = useState(false);
  const { child, invitation, event } = invitationConfig;

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    unlockAudio();
    if (reducedMotion || !cardRef.current) {
      onOpen();
      return;
    }
    gsap
      .timeline({ onComplete: onOpen })
      .to(cardRef.current, { scale: 1.03, duration: 0.14, ease: 'power1.out' })
      .to(cardRef.current, { scale: 0.85, opacity: 0, y: -36, duration: 0.42, ease: 'back.in(1.7)' });
  };

  useEffect(() => {
    if (opened) heroHeadingRef.current?.focus({ preventScroll: true });
  }, [opened]);

  return (
    <section
      id="beranda"
      aria-labelledby="cover-title"
      data-camera-stop={0}
      className="pointer-events-none relative flex min-h-svh flex-col items-center px-4"
    >
      {!opened ? (
        // Fixed overlay with its own scrolling: the page is locked until opened, but a
        // short screen (phone in landscape) can still reach the button.
        <div className="pointer-events-auto fixed inset-0 z-30 overflow-y-auto overscroll-contain px-4">
          <div className="flex min-h-full w-full items-center justify-center py-12 [@media(max-height:560px)]:py-8">
            <div ref={cardRef} className="w-full max-w-md">
              <ToyCard studs={4} className="text-center [@media(max-height:560px)]:py-4">
                <img
                  src={toyAssets.illustrations.balloons}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-5 h-28 w-28 animate-bob sm:-right-10 sm:h-32 sm:w-32"
                />
                <img
                  src={toyAssets.illustrations.mascot}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-7 -left-6 h-24 w-24 -rotate-6 sm:-left-10"
                />
                <p className="eyebrow">
                  <PackIcon name="gift" size={16} className="text-toy-coral-deep" />
                  {invitation.eyebrow}
                </p>
                <p className="mt-5 text-sm font-semibold tracking-wide text-toy-ink-soft uppercase [@media(max-height:560px)]:mt-3">Kepada Yth.</p>
                <p className="font-display text-xl font-semibold break-words">{guest.name}</p>
  
                <h1 id="cover-title" className="mt-4 leading-none [@media(max-height:560px)]:mt-2">
                  <span className="block font-display text-6xl font-bold text-toy-coral-deep text-shadow-soft sm:text-7xl [@media(max-height:560px)]:text-5xl">
                    {child.nickname}
                  </span>
                  <span className="mt-2 block font-display text-2xl font-semibold">Ulang Tahun ke-{child.age}</span>
                </h1>
                <p className="mt-2 font-display text-lg text-toy-lavender-deep">{invitation.title}</p>
  
                <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-toy-sky/25 px-4 py-1.5 font-semibold [@media(max-height:560px)]:mt-2">
                  <PackIcon name="calendar" size={18} />
                  {formatEventDate(event.startISO)}
                </p>
                <p className="mx-auto mt-4 max-w-xs text-toy-ink-soft [@media(max-height:560px)]:hidden">{invitation.coverMessage}</p>
  
                <button
                  type="button"
                  onClick={handleOpen}
                  disabled={opening}
                  aria-describedby={music.hasSource ? 'cover-music-hint' : undefined}
                  className="toy-btn toy-btn-coral mt-6 w-full max-w-xs text-xl [@media(max-height:560px)]:mt-4"
                >
                  <PackIcon name="gift" size={22} />
                  {opening ? 'Membuka…' : 'Buka Undangan'}
                </button>
                {music.hasSource && (
                  <p id="cover-music-hint" className="mt-3 flex items-center justify-center gap-1.5 text-xs text-toy-ink-soft">
                    <PackIcon name="music" size={14} /> Musik akan diputar setelah undangan dibuka
                  </p>
                )}
              </ToyCard>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-svh w-full flex-col items-center justify-between pt-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pt-24">
          <div className="pointer-events-auto w-full max-w-xl animate-pop-in text-center">
            <ToyCard studs={5} className="px-5 py-5 sm:px-8 sm:py-6">
              <p className="eyebrow">Selamat datang, {guest.name}!</p>
              <h1
                id="cover-title"
                ref={heroHeadingRef}
                tabIndex={-1}
                className="mt-3 font-display text-4xl leading-tight font-bold sm:text-5xl"
              >
                Dunia Mainan <span className="text-toy-coral-deep">{child.nickname}</span>
              </h1>
              <p className="mt-2 font-display text-lg text-toy-ink-soft">
                Pesta ulang tahun ke-{child.age} · {formatEventDate(event.startISO)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-toy-butter/45 px-3 py-1">
                  <PackIcon name="calendar" size={16} /> {formatEventTime(event.startISO)} {event.timeZoneLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-toy-mint/45 px-3 py-1">
                  <MapPinned size={16} aria-hidden="true" /> {event.venueName}
                </span>
              </div>
            </ToyCard>
          </div>

          <button
            type="button"
            onClick={() => scrollToStop(1, reducedMotion)}
            className="pointer-events-auto flex flex-col items-center gap-1 rounded-3xl px-4 py-2 font-display font-semibold text-toy-ink"
          >
            <span className="rounded-full bg-white/85 px-4 py-1.5 text-sm shadow">Gulir untuk mulai berpetualang</span>
            <span className="flex h-10 w-10 animate-nudge items-center justify-center rounded-full bg-toy-butter shadow-[0_4px_0_var(--color-toy-butter-deep)]">
              <PackIcon name="chevronDown" size={22} />
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
