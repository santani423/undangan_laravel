import { motion } from 'framer-motion'
import { EASE } from '../animation/easing'
import { wedding } from '../config/wedding'
import type { Person } from '../config/types'
import { useCountdown } from '../hooks/useCountdown'
import { useGuestName } from '../hooks/useGuestName'
import { downloadIcs, googleCalendarUrl } from '../lib/calendar'
import { formatLongDate } from '../lib/date'
import { asset } from '../lib/links'
import { useApp } from '../state/store'
import { IconCalendar, IconChevronDown, IconInstagram } from '../components/Icons'
import { Reveal, SectionHeading } from '../components/ui'

const { couple } = wedding

/** Scene 1 (after opening): forest entrance. */
export function HeroSection() {
  const opened = useApp((s) => s.opened)
  const guest = useGuestName()
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: { duration: 1, ease: EASE.out, delay: opened ? delay : 0 },
  })
  return (
    <section id="home" data-scene className="section section--hero" aria-labelledby="hero-title">
      <div className="hero" data-ui>
        <motion.p className="eyebrow" {...show(0.5)}>Kamu diundang ke pernikahan</motion.p>
        <motion.h2 id="hero-title" className="display hero__names" {...show(0.62)}>
          {couple.bride.nickname} <span className="amp">&amp;</span> {couple.groom.nickname}
        </motion.h2>
        <motion.p className="hero__tagline" {...show(0.74)}>{couple.tagline}</motion.p>
        <motion.p className="hero__date" {...show(0.84)}>
          {formatLongDate(wedding.weddingDateISO)}
        </motion.p>
        <motion.p className="hero__guest" {...show(0.94)}>
          Teruntuk <strong>{guest}</strong>
        </motion.p>
        <motion.a href="#couple" className="scroll-cue" {...show(1.1)}>
          <span>Gulir untuk menjelajah</span>
          <IconChevronDown className="scroll-cue__icon" />
        </motion.a>
      </div>
    </section>
  )
}

function PersonCard({ person, role, delay }: { person: Person; role: string; delay: number }) {
  return (
    <Reveal className="person" delay={delay}>
      <p className="person__role">{role}</p>
      <h3 className="person__name">{person.nickname}</h3>
      <p className="person__full">{person.fullName}</p>
      <p className="person__parents">{person.parents}</p>
      {person.instagram && (
        <a className="chip" href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noopener noreferrer">
          <IconInstagram width={16} height={16} />@{person.instagram}
        </a>
      )}
    </Reveal>
  )
}

/** Scene 2: the couple in the floral clearing. */
export function CoupleSection() {
  return (
    <section id="couple" data-scene className="section section--left" aria-labelledby="couple-title">
      <div className="panel">
        <SectionHeading id="couple-title" eyebrow="Bride & Groom" title={<>Dua hati, <em>satu cerita</em></>} />
        <Reveal as="p" className="lead" delay={0.1}>{couple.intro}</Reveal>
        <div className="people">
          <PersonCard person={couple.bride} role="Mempelai Wanita" delay={0.15} />
          <span className="people__amp" aria-hidden="true">&amp;</span>
          <PersonCard person={couple.groom} role="Mempelai Pria" delay={0.25} />
        </div>
        {couple.quote && (
          <Reveal className="quote" delay={0.2}>
            <blockquote>
              <p>“{couple.quote.text}”</p>
            </blockquote>
            <cite>— {couple.quote.source}</cite>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown__unit">
      <span className="countdown__value">{String(value).padStart(2, '0')}</span>
      <span className="countdown__label">{label}</span>
    </div>
  )
}

/** Scene 3: live countdown on the moonlit platform. */
export function CountdownSection() {
  const c = useCountdown(wedding.weddingDateISO)
  const lastEnd = wedding.events.reduce((m, e) => Math.max(m, new Date(e.endISO).getTime()), 0)
  const done = c.remaining <= 0
  const over = done && Date.now() > lastEnd
  const first = wedding.events[0]
  return (
    <section id="countdown" data-scene className="section section--right" aria-labelledby="countdown-title">
      <div className="panel panel--center">
        <SectionHeading id="countdown-title" eyebrow="Save the Date" title="Menuju hari bahagia" />
        <Reveal as="p" className="countdown__date" delay={0.1}>
          {formatLongDate(wedding.weddingDateISO)}
        </Reveal>
        <Reveal delay={0.18}>
          {done ? (
            <p className="countdown__done">{over ? 'Terima kasih telah menjadi bagian dari hari bahagia kami 💛' : 'Hari bahagia telah tiba! ✨'}</p>
          ) : (
            <div className="countdown" role="timer" aria-label={`${c.days} hari ${c.hours} jam ${c.minutes} menit lagi`}>
              <Unit value={c.days} label="Hari" />
              <Unit value={c.hours} label="Jam" />
              <Unit value={c.minutes} label="Menit" />
              <Unit value={c.seconds} label="Detik" />
            </div>
          )}
        </Reveal>
        <Reveal as="p" className="muted" delay={0.24}>
          Seperti bulan yang setia menunggu senja, kami menghitung setiap detik menuju hari di mana kami bisa merayakannya bersamamu.
        </Reveal>
        {!over && first && (
          <Reveal className="btn-row btn-row--center" delay={0.3}>
            <a className="btn btn--ghost" href={googleCalendarUrl(first)} target="_blank" rel="noopener noreferrer">
              <IconCalendar /> Google Calendar
            </a>
            <button type="button" className="btn btn--ghost" onClick={() => downloadIcs(wedding.events, 'undangan-pernikahan.ics')}>
              <IconCalendar /> Apple / Outlook
            </button>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/** Scene 4: storybook timeline; each chapter highlights its floating frame in the glade. */
export function StorySection() {
  return (
    <section id="story" data-scene className="section section--left section--tall" aria-labelledby="story-title">
      <div className="panel">
        <SectionHeading id="story-title" eyebrow="Our Story" title={<>Kisah kecil <em>kami</em></>} />
        <ol className="timeline">
          {wedding.story.map((ch, i) => (
            <Reveal as="li" key={ch.id} className="timeline__item" delay={0.05 * i} data-story={i}>
              <span className="timeline__dot" aria-hidden="true" />
              {ch.image && <img className="timeline__img" src={asset(ch.image)} alt="" width={96} height={120} loading="lazy" decoding="async" />}
              <div className="timeline__body">
                <p className="timeline__label">
                  {ch.label} <span>· {ch.dateLabel}</span>
                </p>
                <h3 className="timeline__title">{ch.title}</h3>
                <p className="timeline__text">{ch.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

