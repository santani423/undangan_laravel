import { CalendarHeart, Gem, Heart, Sparkles, Star, type LucideIcon } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import type { MilestoneIcon } from '../../types/invitation';
import { SectionShell } from '../ui/SectionShell';

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
      <ol className="relative ml-4 border-l-2 border-dashed border-gold/60">
        {config.loveStory.map((milestone) => {
          const Icon = ICONS[milestone.icon];
          return (
            <li key={milestone.id} className="relative pb-7 pl-8 last:pb-0" data-reveal>
              <span
                aria-hidden="true"
                className="absolute -left-[17px] top-0 grid size-8 place-items-center border-2 border-gold-deep bg-ivory text-rose-deep shadow-[3px_3px_0_0_rgba(237,166,166,0.8)]"
              >
                <Icon className="size-4" />
              </span>
              <p className="eyebrow">{milestone.dateLabel}</p>
              <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{milestone.title}</h3>
              <p className="body-copy mt-1 text-sm">{milestone.description}</p>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
