import { Clock, MapPin, Navigation } from 'lucide-react'
import type { EventItem } from '../../config/types'
import { wedding } from '../../config/wedding'
import { SectionHeading } from '../ui/Ornament'

const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
const dateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

function EventCard({ ev }: { ev: EventItem }) {
  const start = new Date(ev.start)
  const end = new Date(ev.end)
  return (
    <article className="rounded-2xl border border-champagne/55 bg-ivory-soft/85 p-4 shadow-sm">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-champagne">{ev.subtitle}</p>
      <h3 className="font-display text-2xl font-semibold text-teak">{ev.title}</h3>
      <ul className="mt-2 space-y-1.5 text-[0.85rem] text-deep/85">
        <li className="flex items-start gap-2">
          <Clock size={15} className="mt-0.5 shrink-0 text-champagne" aria-hidden="true" />
          <span>
            {dateFmt.format(start)}
            <br />
            {timeFmt.format(start)} – {timeFmt.format(end)} {ev.timezoneLabel}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-champagne" aria-hidden="true" />
          <span>
            <strong className="font-semibold">{ev.venueName}</strong>
            <br />
            {ev.address}
          </span>
        </li>
      </ul>
      {ev.note && <p className="mt-2 text-[0.78rem] italic text-deep/65">{ev.note}</p>}
      <a className="jawa-button mt-3 inline-flex items-center gap-2 text-sm" href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">
        <Navigation size={15} aria-hidden="true" /> Buka Google Maps
      </a>
    </article>
  )
}

export function EventDetails() {
  return (
    <div>
      <SectionHeading icon="mapPin" eyebrow="Pawiwahan · Rangkaian Acara" title="Waktu & Tempat" />
      <div className="mt-4 grid gap-3">
        {wedding.events.map((ev) => (
          <EventCard key={ev.id} ev={ev} />
        ))}
      </div>
    </div>
  )
}
