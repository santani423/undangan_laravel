import { useWedding } from '../lib/context';
import { SectionHeading } from './Ornament';

/**
 * Timeline of milestones. In the cinematic view each <li data-milestone> is revealed by the
 * scroll timeline one after another; in the lite view they simply appear.
 */
export function LoveStory() {
    const { story } = useWedding();
    return (
        <div>
            <SectionHeading icon="bookOpen" eyebrow="Serat Katresnan" title="Kisah Kasih Kami" />
            <ol className="wt14-timeline">
                {story.map((s, i) => (
                    <li key={s.id} data-milestone={i}>
                        <span className="wt14-timeline-dot" aria-hidden="true">
                            <span />
                        </span>
                        {s.dateLabel && <p className="wt14-card-eyebrow">{s.dateLabel}</p>}
                        <h3 className="wt14-timeline-title">{s.title}</h3>
                        {s.photo && <img className="wt14-timeline-photo" src={s.photo} alt={s.title} loading="lazy" />}
                        <p className="wt14-timeline-body">{s.body}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}
