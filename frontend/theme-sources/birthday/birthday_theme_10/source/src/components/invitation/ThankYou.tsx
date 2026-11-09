import { useEffect, useRef } from 'react';
import { ArrowUp, Heart, PartyPopper } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { toyAssets } from '../../config/assets';
import { STOP_INDEX } from '../../config/journey';
import { useExperience } from '../../store/experience';
import { celebrate } from '../../store/celebrations';
import { scrollToStop } from '../../hooks/useScrollCamera';
import { sfx } from '../../hooks/useMusic';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';

/** Scene 5c — closing message and final celebration over the party plaza. */
export function ThankYou({ reducedMotion }: { reducedMotion: boolean }) {
  const { invitation, child } = invitationConfig;
  const activeStop = useExperience((s) => s.activeStop);
  const celebrated = useRef(false);

  useEffect(() => {
    if (activeStop === STOP_INDEX.finale && !celebrated.current && !reducedMotion) {
      celebrated.current = true;
      const t = window.setTimeout(() => celebrate('plaza', 0.9), 900);
      return () => window.clearTimeout(t);
    }
  }, [activeStop, reducedMotion]);

  return (
    <StopBlock stop={STOP_INDEX.finale} labelledBy="thanks-title">
      <ToyCard studs={5} className="text-center">
        <img
          src={toyAssets.illustrations.balloons}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-4 h-28 w-28 animate-bob sm:-left-10"
        />
        <h2 id="thanks-title" className="font-display text-4xl font-bold text-toy-coral-deep text-shadow-soft sm:text-5xl">
          Terima Kasih!
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[1.05rem] leading-relaxed">{invitation.closingMessage}</p>
        <p className="mt-4 font-display text-lg font-semibold">
          Dengan sayang,
          <br />
          <span className="text-toy-lavender-deep">{invitation.signature}</span>
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="toy-btn toy-btn-butter"
            onClick={() => {
              celebrate('plaza', 1.4);
              sfx('chime');
            }}
          >
            <PartyPopper size={20} aria-hidden="true" /> Rayakan!
          </button>
          <button type="button" className="toy-btn toy-btn-white" onClick={() => scrollToStop(0, reducedMotion)}>
            <ArrowUp size={20} aria-hidden="true" /> Kembali ke Gerbang
          </button>
        </div>
        <footer className="mt-7 border-t-2 border-dashed border-toy-ink/10 pt-4 text-xs text-toy-ink-soft">
          <p className="flex items-center justify-center gap-1">
            Dibuat dengan <Heart size={12} aria-hidden="true" className="text-toy-coral-deep" /> untuk {child.nickname}
            {invitation.hashtag ? ` · ${invitation.hashtag}` : ''}
          </p>
          <p className="mt-1">Ilustrasi &amp; tekstur: Toy World Birthday Asset Pack</p>
        </footer>
      </ToyCard>
    </StopBlock>
  );
}
