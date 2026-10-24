import { Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { StopBlock } from '../components/layout/StopBlock';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { toyAssets } from '../lib/assets';
import { STOP_INDEX } from '../lib/journey';

const MILESTONE_COLORS = ['coral', 'butter', 'mint', 'lavender'];

/** Scene 2 — the birthday child on the toy-block stage. */
export function BirthdayProfile() {
    const { child, invitation } = useInvitation().config;
    const [portraitFailed, setPortraitFailed] = useState(false);

    return (
        <StopBlock stop={STOP_INDEX.profile} id="profil" labelledBy="bt10-profil-title">
            <ToyCard studs={3} studOffset={1}>
                <img src={toyAssets.illustrations.mascot} alt="" aria-hidden="true" className="bt10-deco bt10-deco--corner bt10-bob" />
                <p className="bt10-eyebrow">
                    <Star size={16} aria-hidden="true" className="bt10-text-butter-deep" />
                    Si Kecil Berulang Tahun
                </p>

                <div className="bt10-profile">
                    <div className="bt10-profile__photo-wrap">
                        <div className="bt10-profile__photo">
                            <img
                                src={portraitFailed ? toyAssets.illustrations.mascot : child.portrait}
                                alt={portraitFailed ? 'Ilustrasi beruang maskot (foto tidak dapat dimuat)' : child.portraitAlt}
                                onError={() => setPortraitFailed(true)}
                                width={144}
                                height={144}
                            />
                        </div>
                        <span className="bt10-profile__age">
                            <span className="bt10-profile__age-num">{child.age ?? '★'}</span>
                            <span className="bt10-profile__age-unit">{child.age ? 'tahun' : 'hore!'}</span>
                        </span>
                    </div>
                    <div className="bt10-profile__names">
                        <h2 id="bt10-profil-title" className="bt10-profile__name">
                            {child.fullName}
                        </h2>
                        {child.parentsLine && <p className="bt10-profile__parents">{child.parentsLine}</p>}
                    </div>
                </div>

                <p className="bt10-lead">{invitation.welcomeMessage}</p>

                {child.journey.length > 0 && (
                    <div className="bt10-story">
                        <p className="bt10-story__title">
                            <Heart size={15} aria-hidden="true" className="bt10-text-coral-deep" /> Cerita kecil {child.nickname}
                        </p>
                        <ol className="bt10-story__list">
                            {child.journey.map((m, i) => (
                                <li key={`${m.period}-${i}`} className="bt10-story__item">
                                    <span className={`bt10-story__dot bt10-bg-${MILESTONE_COLORS[i % MILESTONE_COLORS.length]}`} aria-hidden="true" />
                                    <div>
                                        <p className="bt10-story__head">
                                            {m.period && <span className="bt10-story__period">{m.period}</span>}
                                            {m.title}
                                        </p>
                                        {m.text && <p className="bt10-story__text">{m.text}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
                {invitation.hashtag && <p className="bt10-hashtag">{invitation.hashtag}</p>}
            </ToyCard>
        </StopBlock>
    );
}
