import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { toyAssets } from '../../config/assets';
import { STOP_INDEX } from '../../config/journey';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';

/** Scene 2 — the birthday child on the toy-block stage. */
export function BirthdayProfile() {
  const { child, invitation } = invitationConfig;
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <StopBlock stop={STOP_INDEX.profile} as="section" id="profil" labelledBy="profil-title">
      <ToyCard studs={3} studOffset={1}>
        <img
          src={toyAssets.illustrations.mascot}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-4 h-24 w-24 animate-bob sm:-right-8"
        />
        <p className="eyebrow">
          <Star size={16} aria-hidden="true" className="text-toy-butter-deep" />
          Si Kecil Berulang Tahun
        </p>

        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="h-36 w-36 overflow-hidden rounded-full border-[6px] border-white bg-toy-sky/30 shadow-[0_0_0_5px_var(--color-toy-coral),0_14px_28px_-10px_rgb(59_51_85/0.5)]">
              <img
                src={portraitFailed ? toyAssets.illustrations.mascot : child.portrait}
                alt={portraitFailed ? 'Ilustrasi beruang maskot (foto tidak dapat dimuat)' : child.portraitAlt}
                onError={() => setPortraitFailed(true)}
                className="h-full w-full object-cover"
                width={144}
                height={144}
              />
            </div>
            <span className="absolute -right-2 -bottom-1 flex h-14 w-14 rotate-6 flex-col items-center justify-center rounded-2xl bg-toy-butter font-display leading-none font-bold shadow-[0_4px_0_var(--color-toy-butter-deep)]">
              <span className="text-2xl">{child.age}</span>
              <span className="text-[10px] tracking-wide uppercase">tahun</span>
            </span>
          </div>
          <div className="text-center sm:text-left">
            <h2 id="profil-title" className="font-display text-3xl leading-tight font-bold sm:text-4xl">
              {child.fullName}
            </h2>
            <p className="mt-1 text-sm font-semibold text-toy-ink-soft">{child.parentsLine}</p>
          </div>
        </div>

        <p className="mt-5 text-[1.05rem] leading-relaxed">{invitation.welcomeMessage}</p>

        {child.favorites.length > 0 && (
          <div className="mt-5">
            <p className="flex items-center gap-1.5 font-display text-sm font-semibold text-toy-ink-soft">
              <Heart size={15} aria-hidden="true" className="text-toy-coral-deep" /> Hal-hal kesukaan {child.nickname}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {child.favorites.map((f, i) => (
                <li
                  key={f}
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    ['bg-toy-coral/30', 'bg-toy-butter/50', 'bg-toy-mint/45', 'bg-toy-lavender/40'][i % 4]
                  }`}
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        {invitation.hashtag && (
          <p className="mt-5 font-display text-lg font-semibold text-toy-lavender-deep">{invitation.hashtag}</p>
        )}
      </ToyCard>
    </StopBlock>
  );
}
