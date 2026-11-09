import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import { googleCalendarUrl } from '../lib/calendar';
import { fullAddress, getDirectionsUrl, getMapsUrl } from '../lib/maps';
import type { WeddingEvent } from '../lib/types';

function EventCard({ event, coupleTitle, calendar }: { event: WeddingEvent; coupleTitle: string; calendar: boolean }) {
    const hasPlace = Boolean(event.venueName || event.address || event.coordinates || event.mapsUrl);
    return (
        <article className="wt16-sub wt16-event" data-reveal>
            <h3 className="wt16-event__name">{event.name}</h3>
            {event.description && <p className="wt16-body wt16-event__desc">{event.description}</p>}
            <dl className="wt16-event__meta">
                {event.dateLabel && (
                    <div className="wt16-event__row">
                        <dt>
                            <CalendarDays aria-hidden="true" size={20} />
                            <span className="wt16-sr-only">Tanggal</span>
                        </dt>
                        <dd>{event.dateLabel}</dd>
                    </div>
                )}
                {event.timeLabel && (
                    <div className="wt16-event__row">
                        <dt>
                            <Clock aria-hidden="true" size={20} />
                            <span className="wt16-sr-only">Waktu</span>
                        </dt>
                        <dd>{event.timeLabel}</dd>
                    </div>
                )}
                {(event.venueName || event.address) && (
                    <div className="wt16-event__row">
                        <dt>
                            <MapPin aria-hidden="true" size={20} />
                            <span className="wt16-sr-only">Tempat</span>
                        </dt>
                        <dd>
                            {event.venueName && <span className="wt16-event__venue">{event.venueName}</span>}
                            {event.venueName && event.address && <br />}
                            {event.address && <span className="wt16-event__address">{event.address}</span>}
                        </dd>
                    </div>
                )}
            </dl>
            <div className="wt16-event__actions">
                {(event.venueName || event.address) && (
                    <CopyButton
                        text={fullAddress(event)}
                        label="Salin Alamat"
                        ariaLabel={`Salin alamat ${event.name}`}
                        successMessage={`Alamat ${event.name} disalin`}
                    />
                )}
                {hasPlace && (
                    <a
                        className="wt16-btn wt16-btn--secondary wt16-btn--sm"
                        href={event.mapsUrl && !event.coordinates ? getMapsUrl(event) : getDirectionsUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Navigation aria-hidden="true" size={16} />
                        Petunjuk Arah
                        <span className="wt16-sr-only">ke lokasi {event.name} (membuka tab baru)</span>
                    </a>
                )}
                {calendar && event.start && (
                    <a
                        className="wt16-btn wt16-btn--secondary wt16-btn--sm"
                        href={googleCalendarUrl(event, coupleTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <CalendarPlus aria-hidden="true" size={16} />
                        Kalender
                        <span className="wt16-sr-only">— tambahkan {event.name} ke Google Calendar (membuka tab baru)</span>
                    </a>
                )}
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
            <div className="wt16-grid-2">
                {config.events.map((event) => (
                    <EventCard key={event.id} event={event} coupleTitle={coupleTitle} calendar={config.sections.calendar} />
                ))}
            </div>
        </SectionShell>
    );
}
