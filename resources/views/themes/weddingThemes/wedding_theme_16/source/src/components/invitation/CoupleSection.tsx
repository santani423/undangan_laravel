import { AtSign, UserRound } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { assetUrl } from '../../lib/assets';
import type { Person } from '../../types/invitation';
import { SectionShell } from '../ui/SectionShell';

function PersonCard({ person, role }: { person: Person; role: string }) {
  return (
    <article className="sub-card flex flex-col items-center text-center" data-reveal>
      {person.photo ? (
        <img
          src={assetUrl(person.photo)}
          alt={person.photoAlt ?? `Foto ${person.fullName}`}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-36 rounded-md border-4 border-ivory object-cover shadow-md"
        />
      ) : (
        <div
          role="img"
          aria-label={`Foto ${role.toLowerCase()} belum ditambahkan`}
          className="grid aspect-[3/4] w-32 place-items-center rounded-md border-2 border-dashed border-gold/70 bg-ivory-deep/70 px-2 text-ink-soft"
        >
          <div>
            <UserRound aria-hidden="true" className="mx-auto size-10 text-gold-deep" />
            <p className="mt-2 text-[0.7rem] leading-tight">Foto belum ditambahkan</p>
          </div>
        </div>
      )}
      <p className="eyebrow mt-4">{role}</p>
      <p className="script mt-1 text-4xl text-rose-deep">{person.nickname}</p>
      <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{person.fullName}</h3>
      <p className="body-copy mt-2 text-sm">
        {person.childOrder}
        <br />
        {person.father}
        <br />
        &amp; {person.mother}
      </p>
      {person.instagram && (
        <a
          className="btn btn-secondary btn-sm mt-3"
          href={`https://www.instagram.com/${encodeURIComponent(person.instagram)}/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <AtSign aria-hidden="true" className="size-4" />
          {person.instagram}
          <span className="sr-only">di Instagram (membuka tab baru)</span>
        </a>
      )}
    </article>
  );
}

/** Section B — bride, groom and their parents. */
export function CoupleSection() {
  const { config, first, second } = useInvitationData();
  const roleOf = (person: Person) => (person === config.couple.bride ? 'Mempelai Wanita' : 'Mempelai Pria');

  return (
    <SectionShell id="mempelai" eyebrow="Mempelai" title="Dua Hati, Satu Taman" icon="heart" width="lg">
      <p className="body-copy mx-auto mb-6 max-w-lg text-center">
        Dengan memohon rahmat dan restu, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
      </p>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <PersonCard person={first} role={roleOf(first)} />
        <p className="script text-center text-5xl text-gold-deep" aria-hidden="true">
          &amp;
        </p>
        <PersonCard person={second} role={roleOf(second)} />
      </div>
    </SectionShell>
  );
}
