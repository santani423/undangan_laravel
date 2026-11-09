import type { CSSProperties } from 'react';
import { IconCalendar, IconChevronDown, IconInstagram } from '../components/Icons';
import { Reveal, SectionHeading } from '../components/ui';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { useTheme, useWedding } from '../lib/context';
import { useCountdown } from '../lib/hooks';
import { useApp } from '../lib/store';
import type { Person } from '../lib/types';

const delay = (s: number) => ({ '--wt15-delay': `${s}s` }) as CSSProperties;

/** Scene 1 (after opening): forest entrance. */
export function HeroSection() {
    const { wedding, scenes } = useTheme();
    const opened = useApp((s) => s.opened);
    const { couple, guest } = wedding;
    const next = scenes[1]?.id ?? 'closing';
    return (
        <section id="home" data-scene className="wt15-section wt15-section--hero" aria-labelledby="wt15-hero-title">
            <div className={`wt15-hero ${opened ? 'is-shown' : ''}`} data-ui>
                <p className="wt15-eyebrow" style={delay(0.5)}>
                    Kamu diundang ke pernikahan
                </p>
                <h2 id="wt15-hero-title" className="wt15-display wt15-hero__names" style={delay(0.62)}>
                    {couple.bride.nickname} <span className="wt15-amp">&amp;</span> {couple.groom.nickname}
                </h2>
                <p className="wt15-hero__tagline" style={delay(0.74)}>
                    {couple.tagline}
                </p>
                {wedding.weddingDateLabel && (
                    <p className="wt15-hero__date" style={delay(0.84)}>
                        {wedding.weddingDateLabel}
                    </p>
                )}
                {wedding.sections.guest && guest.name && (
                    <p className="wt15-hero__guest" style={delay(0.94)}>
                        Teruntuk <strong>{guest.name}</strong>
                    </p>
                )}
                <a href={`#${next}`} className="wt15-scroll-cue" style={delay(1.1)}>
                    <span>Gulir untuk menjelajah</span>
                    <IconChevronDown className="wt15-scroll-cue__icon" />
                </a>
            </div>
        </section>
    );
}

function PersonCard({ person, role, delay }: { person: Person; role: string; delay: number }) {
    return (
        <Reveal className="wt15-person" delay={delay}>
            {person.photo && (
                <img
                    className="wt15-person__photo"
                    src={person.photo}
                    alt={`Foto ${person.nickname}`}
                    width={88}
                    height={88}
                    loading="lazy"
                    decoding="async"
                />
            )}
            <p className="wt15-person__role">{role}</p>
            <h3 className="wt15-person__name">{person.nickname}</h3>
            {person.fullName && <p className="wt15-person__full">{person.fullName}</p>}
            {person.parents && <p className="wt15-person__parents">{person.parents}</p>}
            {person.instagram && (
                <a className="wt15-chip" href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noopener noreferrer">
                    <IconInstagram width={16} height={16} />@{person.instagram}
                </a>
            )}
        </Reveal>
    );
}

/** Scene 2: the couple in the floral clearing. */
export function CoupleSection() {
    const { couple } = useWedding();
    return (
        <section id="couple" data-scene className="wt15-section wt15-section--left" aria-labelledby="wt15-couple-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-couple-title"
                    eyebrow="Bride & Groom"
                    title={
                        <>
                            Dua hati, <em>satu cerita</em>
                        </>
                    }
                />
                <Reveal as="p" className="wt15-lead" delay={0.1}>
                    {couple.intro}
                </Reveal>
                <div className="wt15-people">
                    <PersonCard person={couple.bride} role="Mempelai Wanita" delay={0.15} />
                    <span className="wt15-people__amp" aria-hidden="true">
                        &amp;
                    </span>
                    <PersonCard person={couple.groom} role="Mempelai Pria" delay={0.25} />
                </div>
                {couple.quote && (
                    <Reveal className="wt15-quote" delay={0.2}>
                        <blockquote>
                            <p>“{couple.quote.text}”</p>
                        </blockquote>
                        {couple.quote.source && <cite>— {couple.quote.source}</cite>}
                    </Reveal>
                )}
            </div>
        </section>
    );
}

function Unit({ value, label }: { value: number; label: string }) {
    return (
        <div className="wt15-countdown__unit">
            <span className="wt15-countdown__value">{String(value).padStart(2, '0')}</span>
            <span className="wt15-countdown__label">{label}</span>
        </div>
    );
}

/** Scene 3: live countdown on the moonlit platform. */
export function CountdownSection() {
    const wedding = useWedding();
    const c = useCountdown(wedding.weddingDateISO);
    const lastEnd = wedding.events.reduce(
        (m, e) => Math.max(m, e.endISO ? new Date(e.endISO).getTime() : 0),
        new Date(wedding.weddingDateISO).getTime(),
    );
    const done = c.remaining <= 0;
    const over = done && Date.now() > lastEnd;
    const dated = wedding.events.filter((e) => e.startISO);
    const names = wedding.couple.displayNames;
    return (
        <section id="countdown" data-scene className="wt15-section wt15-section--right" aria-labelledby="wt15-countdown-title">
            <div className="wt15-panel wt15-panel--center">
                <SectionHeading id="wt15-countdown-title" eyebrow="Save the Date" title="Menuju hari bahagia" />
                {wedding.weddingDateLabel && (
                    <Reveal as="p" className="wt15-countdown__date" delay={0.1}>
                        {wedding.weddingDateLabel}
                    </Reveal>
                )}
                <Reveal delay={0.18}>
                    {done ? (
                        <p className="wt15-countdown__done">
                            {over ? 'Terima kasih telah menjadi bagian dari hari bahagia kami 💛' : 'Hari bahagia telah tiba! ✨'}
                        </p>
                    ) : (
                        <div className="wt15-countdown" role="timer" aria-label={`${c.days} hari ${c.hours} jam ${c.minutes} menit lagi`}>
                            <Unit value={c.days} label="Hari" />
                            <Unit value={c.hours} label="Jam" />
                            <Unit value={c.minutes} label="Menit" />
                            <Unit value={c.seconds} label="Detik" />
                        </div>
                    )}
                </Reveal>
                <Reveal as="p" className="wt15-muted" delay={0.24}>
                    Seperti bulan yang setia menunggu senja, kami menghitung setiap detik menuju hari di mana kami bisa merayakannya bersamamu.
                </Reveal>
                {!over && wedding.sections.calendar && dated.length > 0 && (
                    <Reveal className="wt15-btn-row wt15-btn-row--center" delay={0.3}>
                        <a className="wt15-btn wt15-btn--ghost" href={googleCalendarUrl(dated[0], names)} target="_blank" rel="noopener noreferrer">
                            <IconCalendar /> Google Calendar
                        </a>
                        <button
                            type="button"
                            className="wt15-btn wt15-btn--ghost"
                            onClick={() => downloadIcs(dated, names, 'undangan-pernikahan.ics')}
                        >
                            <IconCalendar /> Apple / Outlook
                        </button>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

/** Scene 4: storybook timeline; each chapter highlights its floating frame in the glade. */
export function StorySection() {
    const { story } = useWedding();
    return (
        <section id="story" data-scene className="wt15-section wt15-section--left wt15-section--tall" aria-labelledby="wt15-story-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-story-title"
                    eyebrow="Our Story"
                    title={
                        <>
                            Kisah kecil <em>kami</em>
                        </>
                    }
                />
                <ol className="wt15-timeline">
                    {story.map((ch, i) => (
                        <Reveal as="li" key={ch.id} className="wt15-timeline__item" delay={0.05 * i} data-story={i}>
                            <span className="wt15-timeline__dot" aria-hidden="true" />
                            {ch.image ? (
                                <img className="wt15-timeline__img" src={ch.image} alt="" width={96} height={120} loading="lazy" decoding="async" />
                            ) : (
                                <span className="wt15-timeline__img wt15-timeline__img--empty" aria-hidden="true" />
                            )}
                            <div className="wt15-timeline__body">
                                <p className="wt15-timeline__label">
                                    {ch.label} {ch.dateLabel && <span>· {ch.dateLabel}</span>}
                                </p>
                                {ch.title && <h3 className="wt15-timeline__title">{ch.title}</h3>}
                                {ch.text && <p className="wt15-timeline__text">{ch.text}</p>}
                            </div>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}
