import { AtSign, UserRound } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import type { Person } from '../lib/types';

function PersonCard({ person, role }: { person: Person; role: string }) {
    const parents = [person.father, person.mother].filter(Boolean);
    return (
        <article className="wt16-sub wt16-person" data-reveal>
            {person.photo ? (
                <img
                    src={person.photo}
                    alt={`Foto ${person.fullName || person.nickname}`}
                    loading="lazy"
                    decoding="async"
                    className="wt16-person__photo"
                />
            ) : (
                <div role="img" aria-label={`Foto ${role.toLowerCase()} belum ditambahkan`} className="wt16-person__placeholder">
                    <div>
                        <UserRound aria-hidden="true" size={40} />
                        <p>Foto belum ditambahkan</p>
                    </div>
                </div>
            )}
            <p className="wt16-eyebrow wt16-person__role">{role}</p>
            <p className="wt16-script wt16-person__nick">{person.nickname}</p>
            {person.fullName && <h3 className="wt16-person__name">{person.fullName}</h3>}
            {parents.length > 0 && (
                <p className="wt16-body wt16-person__parents">
                    {person.childOrder}
                    <br />
                    {parents[0]}
                    {parents[1] && (
                        <>
                            <br />
                            &amp; {parents[1]}
                        </>
                    )}
                </p>
            )}
            {person.bio && <p className="wt16-person__bio">{person.bio}</p>}
            {person.instagram && (
                <a
                    className="wt16-btn wt16-btn--secondary wt16-btn--sm wt16-person__ig"
                    href={`https://www.instagram.com/${encodeURIComponent(person.instagram)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <AtSign aria-hidden="true" size={16} />
                    {person.instagram}
                    <span className="wt16-sr-only">di Instagram (membuka tab baru)</span>
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
            <p className="wt16-body wt16-lead">Dengan memohon rahmat dan restu, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>
            <div className="wt16-couple">
                <PersonCard person={first} role={roleOf(first)} />
                <p className="wt16-script wt16-couple__amp" aria-hidden="true">
                    &amp;
                </p>
                <PersonCard person={second} role={roleOf(second)} />
            </div>
        </SectionShell>
    );
}
