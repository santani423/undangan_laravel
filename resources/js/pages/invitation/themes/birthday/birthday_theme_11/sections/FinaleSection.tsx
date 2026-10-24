import type { MouseEvent } from 'react';
import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { formatEventDay } from '../lib/date';
import { SECTION_BY_KEY } from '../lib/sections';

/** 8 · Thank you — the camera pulls up over the island, everyone gathers at the maypole, fireworks at dusk. */
export function FinaleSection({ onReplay }: { onReplay: () => void }) {
    const { config, sections, goTo } = useSmile();
    const def = SECTION_BY_KEY.finale;
    const day = formatEventDay(config.event);
    const rsvp = sections.some((s) => s.key === 'rsvp') && (config.features.rsvp || config.features.wishes) ? SECTION_BY_KEY.rsvp : null;

    const toRsvp = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        goTo('rsvp');
    };

    return (
        <SceneSection def={def} art={smileAssets.balloons} artSize={[300, 340]} className="bt11-scene--finale" panelClassName="bt11-finale-panel">
            <SectionHeading def={def} />
            <p className="bt11-lead" data-reveal="">
                {config.copy.finaleHeading}
            </p>
            <p data-reveal="">{config.copy.finaleMessage}</p>
            <p className="bt11-signature" data-reveal="">
                {day ? `Sampai jumpa pada ${day}.` : 'Sampai jumpa di pesta!'}
            </p>
            <div className="bt11-actions bt11-actions--center" data-reveal="">
                {rsvp && (
                    <a className="bt11-btn bt11-btn--primary" href={`#${rsvp.id}`} onClick={toRsvp}>
                        {config.features.rsvp ? 'Konfirmasi kehadiran' : 'Kirim ucapan'}
                    </a>
                )}
                <button className="bt11-btn bt11-btn--secondary" type="button" onClick={() => goTo('hero')}>
                    Kembali ke awal
                </button>
                <button className="bt11-btn bt11-btn--ghost" type="button" onClick={onReplay}>
                    Putar ulang petualangan
                </button>
            </div>
        </SceneSection>
    );
}
