import { CalendarHeart, Gem, Heart, Sparkles, Star, type LucideIcon } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import type { MilestoneIcon } from '../lib/types';

const ICONS: Record<MilestoneIcon, LucideIcon> = {
    meet: Sparkles,
    heart: Heart,
    star: Star,
    ring: Gem,
    calendar: CalendarHeart,
};

/** Section E — data-driven love-story timeline. */
export function LoveStorySection() {
    const { config } = useInvitationData();

    return (
        <SectionShell id="kisah" eyebrow="Kisah Cinta" title="Perjalanan Kami" icon="heart">
            <ol className="wt16-timeline">
                {config.loveStory.map((milestone) => {
                    const Icon = ICONS[milestone.icon];
                    return (
                        <li key={milestone.id} className="wt16-timeline__item" data-reveal>
                            <span aria-hidden="true" className="wt16-timeline__icon">
                                <Icon size={16} />
                            </span>
                            {milestone.dateLabel && <p className="wt16-eyebrow">{milestone.dateLabel}</p>}
                            {milestone.title && <h3 className="wt16-timeline__title">{milestone.title}</h3>}
                            {milestone.photo && (
                                <img src={milestone.photo} alt={milestone.title} loading="lazy" decoding="async" className="wt16-timeline__photo" />
                            )}
                            {milestone.description && <p className="wt16-body wt16-timeline__text">{milestone.description}</p>}
                        </li>
                    );
                })}
            </ol>
        </SectionShell>
    );
}
