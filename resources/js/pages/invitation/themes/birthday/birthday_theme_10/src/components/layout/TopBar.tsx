import { useEffect, useRef, type ReactNode } from 'react';
import { House, Mail, Star } from 'lucide-react';
import { SECTIONS, CAMERA_STOPS } from '../../config/journey';
import { toyAssets } from '../../config/assets';
import { invitationConfig } from '../../config/invitation.config';
import { setExperience, useExperience } from '../../store/experience';
import { journey } from '../../store/journey';
import { scrollToStop } from '../../hooks/useScrollCamera';
import { unlockAudio, music } from '../../audio/audioEngine';
import { PackIcon } from '../ui/PackIcon';
import type { SectionId } from '../../types/invitation';

const SECTION_ICONS: Record<SectionId, ReactNode> = {
  beranda: <House size={18} aria-hidden="true" />,
  profil: <Star size={18} aria-hidden="true" />,
  acara: <PackIcon name="calendar" size={18} />,
  galeri: <PackIcon name="camera" size={18} />,
  rsvp: <Mail size={18} aria-hidden="true" />,
};

function MusicToggle() {
  const soundOn = useExperience((s) => s.soundOn);
  if (!music.hasSource) return <span />;
  return (
    <button
      type="button"
      className="toy-icon-btn pointer-events-auto relative h-12 w-12"
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Matikan musik' : 'Putar musik'}
      title={invitationConfig.music.title}
      onClick={() => {
        unlockAudio();
        setExperience({ soundOn: !soundOn });
      }}
    >
      <PackIcon name="music" size={20} className={soundOn ? 'text-toy-coral-deep' : 'text-toy-ink/60'} />
      <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-toy-butter text-toy-ink shadow">
        <PackIcon name={soundOn ? 'pause' : 'play'} size={12} />
      </span>
    </button>
  );
}

function SiteNav({ reducedMotion }: { reducedMotion: boolean }) {
  const active = useExperience((s) => s.activeSection);
  return (
    <nav aria-label="Navigasi undangan" className="pointer-events-auto">
      <ul className="flex items-center gap-1 rounded-full bg-white/95 p-1.5 shadow-[0_4px_0_rgb(59_51_85/0.12),0_10px_24px_-12px_rgb(59_51_85/0.5)]">
        {SECTIONS.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => scrollToStop(s.stop, reducedMotion)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={s.label}
                className={`flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 font-display text-sm font-semibold transition-colors lg:px-3.5 ${
                  isActive ? 'bg-toy-butter text-toy-ink shadow-[inset_0_-3px_0_var(--color-toy-butter-deep)]' : 'text-toy-ink/75 hover:bg-toy-sky/25'
                }`}
              >
                {SECTION_ICONS[s.id]}
                <span className="hidden lg:inline">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Thin road at the very top with the pack's toy car driving along with the camera. */
function JourneyProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let frame = 0;
    const last = CAMERA_STOPS.length - 1;
    const loop = () => {
      const p = Math.min(1, Math.max(0, journey.value / last));
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (carRef.current) carRef.current.style.left = `calc(${p * 100}% - ${p * 28}px)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden="true" className="relative h-1.5 w-full bg-white/50">
      <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-toy-coral via-toy-butter to-toy-mint" style={{ transform: 'scaleX(0)' }} />
      <img ref={carRef} src={toyAssets.illustrations.car} alt="" className="absolute -top-[11px] h-7 w-7 drop-shadow" style={{ left: 0 }} />
    </div>
  );
}

export function TopBar({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <header className="hide-while-typing pointer-events-none fixed inset-x-0 top-0 z-40 animate-pop-in transition-[opacity,transform] duration-300">
      <JourneyProgress />
      <div className="flex items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        <MusicToggle />
        <SiteNav reducedMotion={reducedMotion} />
      </div>
    </header>
  );
}
