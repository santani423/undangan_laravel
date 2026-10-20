import { wedding } from '../../config/wedding'
import type { Person } from '../../config/types'
import { Divider, Monogram, SectionHeading } from '../ui/Ornament'

function PersonCard({ person, role }: { person: Person; role: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Monogram initial={person.nickname.charAt(0)} photo={person.photo} alt={`Potret ${role} — ${person.fullName}`} />
      <p className="mt-3 font-script text-[2rem] leading-none text-teak">{person.nickname}</p>
      <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-deep">{person.fullName}</h3>
      <p className="mt-1 text-[0.8rem] leading-relaxed text-deep/70">
        {person.childOrder}
        <br />
        {person.parents}
      </p>
    </div>
  )
}

export function CoupleProfile() {
  const { bride, groom, openingMessage, verse } = wedding.couple
  return (
    <div>
      <SectionHeading icon="heart" eyebrow="Pendhapa · Mempelai" title="Kedua Mempelai" />
      <p className="mx-auto mt-3 max-w-sm text-center text-[0.86rem] leading-relaxed text-deep/80">{openingMessage}</p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <PersonCard person={bride} role="mempelai wanita" />
        <p className="self-center text-center font-script text-4xl text-champagne" aria-hidden="true">
          &amp;
        </p>
        <PersonCard person={groom} role="mempelai pria" />
      </div>
      <Divider className="mt-5 w-32 opacity-80" />
      <figure className="mt-2 text-center">
        <blockquote className="font-display text-lg italic text-teak">“{verse.text}”</blockquote>
        <figcaption className="mt-1 text-[0.75rem] text-deep/65">
          {verse.translation} — <span className="italic">{verse.source}</span>
        </figcaption>
      </figure>
    </div>
  )
}
