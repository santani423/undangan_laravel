import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { ACTIVITY_ART, smileAssets } from '../lib/assets';
import { SECTION_BY_KEY } from '../lib/sections';

/** 4 · Activities — toys on pedestals; each card (or toy) opens the activity sheet. */
export function ActivitiesSection({ onOpen }: { onOpen: (id: string) => void }) {
    const { config } = useSmile();
    const def = SECTION_BY_KEY.activities;
    return (
        <SceneSection def={def} art={smileAssets.balloons} artSize={[300, 340]} className="bt11-scene--wide" panelClassName="bt11-scene__panel--wide">
            <SectionHeading def={def} />
            <p data-reveal="">
                Ketuk sebuah aktivitas untuk melihat rencananya<span className="bt11-only-3d"> (atau ketuk mainannya di pulau)</span>.
            </p>
            <ul className="bt11-activity-list" data-reveal="">
                {config.activities.map((a) => (
                    <li key={a.id}>
                        <button type="button" className="bt11-activity-card" data-activity={a.id} aria-haspopup="dialog" onClick={() => onOpen(a.id)}>
                            <img className="bt11-activity-card__art" src={ACTIVITY_ART[a.icon]} alt="" width={64} height={64} loading="lazy" />
                            <span className="bt11-activity-card__text">
                                <span className="bt11-activity-card__title">{a.title}</span>
                                <span className="bt11-activity-card__summary">{a.summary}</span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </SceneSection>
    );
}
