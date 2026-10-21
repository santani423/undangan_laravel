import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { googleCalendarUrl } from '../../lib/calendar';
import { formatLongDate, formatTimeRange } from '../../lib/date';
import { fullAddress, getDirectionsUrl } from '../../lib/maps';
import type { WeddingEvent } from '../../types/invitation';
import { CopyButton } from '../ui/CopyButton';
import { SectionShell } from '../ui/SectionShell';

function EventCard({ event, coupleTitle }: { event: WeddingEvent; coupleTitle: string }) {
  return (
    <article className="sub-card flex flex-col" data-reveal data-testid={`event-${event.id}`}>
      <h3 className="font-serif text-2xl font-semibold text-ink">{event.name}</h3>
      {event.description && <p className="body-copy mt-1 text-sm">{event.description}</p>}
      <dl className="mt-4 space-y-3 text-sm text-ink">
        <div className="flex gap-3">
          <dt>
            <CalendarDays aria-hidden="true" className="size-5 text-gold-deep" />
            <span className="sr-only">Tanggal</span>
          </dt>
          <dd>{formatLongDate(event.start, event.timeZone)}</dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <Clock aria-hidden="true" className="size-5 text-gold-deep" />
            <span className="sr-only">Waktu</span>
          </dt>
          <dd>{formatTimeRange(event.start, event.end, event.timeZone, event.timeZoneLabel)}</dd>
        </div>
        <div className="flex gap-3">
          <dt>
            <MapPin aria-hidden="true" className="size-5 text-gold-deep" />
            <span className="sr-only">Tempat</span>
          </dt>
          <dd>
            <span className="font-medium">{event.venueName}</span>
            <br />
            <span className="text-ink-soft">{event.address}</span>
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <CopyButton
          text={fullAddress(event)}
          label="Salin Alamat"
          ariaLabel={`Salin alamat ${event.name}`}
          successMessage={`Alamat ${event.name} disalin`}
        />
        <a className="btn btn-secondary btn-sm" href={getDirectionsUrl(event)} target="_blank" rel="noopener noreferrer">
          <Navigation aria-hidden="true" className="size-4" />
          Petunjuk Arah
          <span className="sr-only">ke lokasi {event.name} (membuka tab baru)</span>
        </a>
        <a className="btn btn-secondary btn-sm" href={googleCalendarUrl(event, coupleTitle)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus aria-hidden="true" className="size-4" />
          Kalender
          <span className="sr-only">— tambahkan {event.name} ke Google Calendar (membuka tab baru)</span>
        </a>
      </div>
    </article>
  );
}

/** Section C — ceremony (akad) and reception details. */
export function EventSection() {
  const { config, first, second } = useInvitationData();
  const coupleTitle = `${first.nickname} & ${second.nickname}`;

  return (
    <SectionShell id="acara" eyebrow="Waktu & Tempat" title="Rangkaian Acara" icon="calendar" width="lg">
      <div className="grid gap-4 md:grid-cols-2">
        {config.events.map((event) => (
          <EventCard key={event.id} event={event} coupleTitle={coupleTitle} />
        ))}
      </div>
    </SectionShell>
  );
}
