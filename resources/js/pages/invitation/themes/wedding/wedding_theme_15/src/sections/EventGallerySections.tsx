import { wedding } from '../config/wedding'
import type { EventDetail } from '../config/types'
import { downloadIcs, googleCalendarUrl } from '../lib/calendar'
import { formatLongDate, formatTimeRange } from '../lib/date'
import { asset, copyText, mapsUrlFor } from '../lib/links'
import { useApp } from '../state/store'
import { IconCalendar, IconChevronDown, IconCopy, IconPin } from '../components/Icons'
import { DemoBadge, Reveal, SectionHeading } from '../components/ui'

function EventCard({ event, delay }: { event: EventDetail; delay: number }) {
  const showToast = useApp((s) => s.showToast)
  const address = `${event.venueName}, ${event.venueAddress}`
  return (
    <Reveal className="event-card" delay={delay}>
      <h3 className="event-card__name">{event.name}</h3>
      <dl className="event-card__meta">
        <div>
          <dt>Tanggal</dt>
          <dd>{formatLongDate(event.startISO)}</dd>
        </div>
        <div>
          <dt>Waktu</dt>
          <dd>{formatTimeRange(event.startISO, event.endISO)}</dd>
        </div>
        <div>
          <dt>Tempat</dt>
          <dd>
            <strong>{event.venueName}</strong>
            <br />
            {event.venueAddress}
          </dd>
        </div>
        {event.dressCode && (
          <div>
            <dt>Dress code</dt>
            <dd>{event.dressCode}</dd>
          </div>
        )}
      </dl>
      {event.notes?.length ? (
        <ul className="event-card__notes">
          {event.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
      <div className="btn-row">
        <a className="btn btn--primary btn--sm" href={mapsUrlFor(event)} target="_blank" rel="noopener noreferrer">
          <IconPin /> Google Maps
        </a>
        <details className="menu">
          <summary className="btn btn--ghost btn--sm">
            <IconCalendar /> Tambah ke Kalender <IconChevronDown className="menu__chev" />
          </summary>
          <div className="menu__list">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">Google Calendar</a>
            <button type="button" onClick={() => downloadIcs([event], `${event.id}.ics`)}>Apple / Outlook (.ics)</button>
          </div>
        </details>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={async () => showToast((await copyText(address)) ? 'Alamat venue disalin ✓' : 'Gagal menyalin — silakan salin manual.')}
        >
          <IconCopy /> Salin Alamat
        </button>
      </div>
    </Reveal>
  )
}

/** Scene 5: ceremony & reception under the floral arch. */
export function EventSection() {
  return (
    <section id="event" data-scene className="section section--right section--tall" aria-labelledby="event-title">
      <div className="panel">
        <SectionHeading id="event-title" eyebrow="Wedding Day" title={<>Akad <em>&amp;</em> Resepsi</>} />
        {wedding.isSample && <DemoBadge>Tanggal dan venue di bawah adalah contoh — ubah di <code>src/config/wedding.ts</code>.</DemoBadge>}
        <div className="events">
          {wedding.events.map((e, i) => (
            <EventCard key={e.id} event={e} delay={0.08 * i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Scene 6: gallery grid; the same images float on frames in the 3D pavilion. */
export function GallerySection() {
  const setLightbox = useApp((s) => s.setLightbox)
  const hasDemo = wedding.gallery.some((g) => g.isDemo)
  return (
    <section id="gallery" data-scene className="section section--left section--tall" aria-labelledby="gallery-title">
      <div className="panel panel--wide">
        <SectionHeading id="gallery-title" eyebrow="Gallery" title={<>Momen <em>kami</em></>} />
        {hasDemo && <DemoBadge>Ilustrasi contoh, bukan foto pasangan. Ganti dengan foto kalian di konfigurasi.</DemoBadge>}
        <ul className="gallery">
          {wedding.gallery.map((img, i) => (
            <Reveal as="li" key={img.src} delay={(i % 4) * 0.06} className="gallery__item">
              <button type="button" className="gallery__btn" onClick={() => setLightbox(i)} aria-label={`Buka foto: ${img.caption ?? img.alt}`}>
                <img src={asset(img.thumb)} alt={img.alt} width={480} height={600} loading="lazy" decoding="async" />
                {img.caption && <span className="gallery__caption">{img.caption}</span>}
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
