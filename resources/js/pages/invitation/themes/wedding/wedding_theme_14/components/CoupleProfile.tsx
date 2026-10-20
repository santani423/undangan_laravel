import { useWedding } from '../lib/context';
import type { Person } from '../lib/types';
import { Divider, Monogram, SectionHeading } from './Ornament';

function PersonCard({ person, role }: { person: Person; role: string }) {
    return (
        <div className="wt14-person">
            <Monogram initial={person.nickname.charAt(0)} photo={person.photo} alt={`Potret ${role} — ${person.fullName}`} />
            <p className="wt14-person-nick">{person.nickname}</p>
            <h3 className="wt14-person-name">{person.fullName}</h3>
            {(person.childOrder || person.parents) && (
                <p className="wt14-person-parents">
                    {person.childOrder}
                    {person.childOrder && person.parents && <br />}
                    {person.parents}
                </p>
            )}
            {person.instagram && (
                <a className="wt14-person-ig" href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noopener noreferrer">
                    @{person.instagram}
                </a>
            )}
        </div>
    );
}

export function CoupleProfile() {
    const { bride, groom, openingMessage, verse } = useWedding().couple;
    return (
        <div>
            <SectionHeading icon="heart" eyebrow="Pendhapa · Mempelai" title="Kedua Mempelai" />
            <p className="wt14-lead">{openingMessage}</p>
            <div className="wt14-couple">
                <PersonCard person={bride} role="mempelai wanita" />
                <p className="wt14-couple-amp" aria-hidden="true">
                    &amp;
                </p>
                <PersonCard person={groom} role="mempelai pria" />
            </div>
            <Divider className="wt14-divider-sm" />
            <figure className="wt14-verse">
                <blockquote>“{verse.text}”</blockquote>
                {(verse.translation || verse.source) && (
                    <figcaption>
                        {verse.translation}
                        {verse.translation && verse.source && ' — '}
                        {verse.source && <em>{verse.source}</em>}
                    </figcaption>
                )}
            </figure>
        </div>
    );
}
