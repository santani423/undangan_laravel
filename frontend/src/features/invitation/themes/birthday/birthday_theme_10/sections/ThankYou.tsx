import { ArrowUp, Heart, PartyPopper } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { StopBlock } from '../components/layout/StopBlock';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { sfx } from '../hooks/useMusic';
import { scrollToStop } from '../hooks/useScrollCamera';
import { toyAssets } from '../lib/assets';
import { STOP_INDEX } from '../lib/journey';
import { celebrate } from '../store/celebrations';
import { useExperience } from '../store/experience';

/** Scene 5c — closing message and final celebration over the party plaza. */
export function ThankYou({ reducedMotion }: { reducedMotion: boolean }) {
    const { invitation, child, features } = useInvitation().config;
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
        <StopBlock stop={STOP_INDEX.finale} labelledBy="bt10-thanks-title">
            <ToyCard studs={5} className="bt10-center">
                <img src={toyAssets.illustrations.balloons} alt="" aria-hidden="true" className="bt10-deco bt10-deco--thanks bt10-bob" />
                <h2 id="bt10-thanks-title" className="bt10-thanks__title">
                    Terima Kasih!
                </h2>
                <p className="bt10-lead bt10-thanks__message">{invitation.closingMessage}</p>
                <p className="bt10-thanks__signature">
                    Dengan sayang,
                    <br />
                    <span className="bt10-text-lavender-deep">{invitation.signature}</span>
                </p>
                <div className="bt10-thanks__actions">
                    {features.confetti && (
                        <button
                            type="button"
                            className="bt10-btn bt10-btn--butter"
                            onClick={() => {
                                celebrate('plaza', 1.4);
                                sfx('chime');
                            }}
                        >
                            <PartyPopper size={20} aria-hidden="true" /> Rayakan!
                        </button>
                    )}
                    <button type="button" className="bt10-btn bt10-btn--white" onClick={() => scrollToStop(0, reducedMotion)}>
                        <ArrowUp size={20} aria-hidden="true" /> Kembali ke Gerbang
                    </button>
                </div>
                {features.footer && (
                    <footer className="bt10-footer">
                        <p className="bt10-footer__line">
                            Dibuat dengan <Heart size={12} aria-hidden="true" className="bt10-text-coral-deep" /> untuk {child.nickname}
                            {invitation.hashtag ? ` · ${invitation.hashtag}` : ''}
                        </p>
                        <p className="bt10-mt-1">Ilustrasi &amp; tekstur: Toy World Birthday Asset Pack</p>
                    </footer>
                )}
            </ToyCard>
        </StopBlock>
    );
}
