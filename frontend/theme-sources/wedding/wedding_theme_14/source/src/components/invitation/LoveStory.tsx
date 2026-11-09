import { wedding } from '../../config/wedding'
import { SectionHeading } from '../ui/Ornament'

/**
 * Timeline of milestones. In the cinematic view each <li data-milestone> is revealed by the
 * scroll timeline one after another; in the lite view they simply appear.
 */
export function LoveStory() {
  return (
    <div>
      <SectionHeading icon="bookOpen" eyebrow="Serat Katresnan" title="Kisah Kasih Kami" />
      <ol className="relative mt-5 space-y-4 pl-7 before:absolute before:top-1 before:bottom-1 before:left-[0.6rem] before:w-px before:bg-gradient-to-b before:from-champagne before:via-champagne/60 before:to-transparent">
        {wedding.story.map((s, i) => (
          <li key={s.id} data-milestone={i} className="relative">
            <span className="absolute top-1.5 -left-[1.42rem] grid h-4 w-4 rotate-45 place-items-center border border-champagne bg-ivory" aria-hidden="true">
              <span className="h-1.5 w-1.5 bg-champagne" />
            </span>
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.26em] text-champagne">{s.dateLabel}</p>
            <h3 className="font-display text-xl font-semibold text-teak">{s.title}</h3>
            <p className="mt-0.5 text-[0.84rem] leading-relaxed text-deep/80">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
