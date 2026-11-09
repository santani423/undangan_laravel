import type { MouseEvent } from 'react';
import { Paragraphs, SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { SECTION_BY_KEY } from '../lib/sections';

/** 2 · Invitation — the floating envelope opens as the guest scrolls and the card rises out. */
export function InvitationSection() {
    const { config, goTo, nextAfter } = useSmile();
    const def = SECTION_BY_KEY.invitation;
    const next = SECTION_BY_KEY[nextAfter('invitation')];
    const onNext = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        goTo(next.key);
    };

    return (
        <SceneSection def={def} art={smileAssets.envelope} artSize={[320, 240]}>
            <SectionHeading def={def} />
            <p className="bt11-lead" data-reveal="">
                {config.copy.invitationHeading}
            </p>
            <div className="bt11-prose" data-reveal="">
                <Paragraphs text={config.copy.invitationMessage} />
            </div>
            <p className="bt11-signature" data-reveal="">
                Dengan sayang, {config.copy.signature}
            </p>
            <div className="bt11-actions" data-reveal="">
                <a className="bt11-btn bt11-btn--primary" href={`#${next.id}`} onClick={onNext}>
                    {next.key === 'details' ? 'Lihat waktu & tempat' : `Lanjut ke ${next.nav.toLowerCase()}`}
                </a>
            </div>
        </SceneSection>
    );
}
