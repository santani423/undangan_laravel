import { Clock, MapPin, Navigation, Shirt } from 'lucide-react';
import { useWedding } from '../lib/context';
import type { EventItem } from '../lib/types';
import { SectionHeading } from './Ornament';

function EventCard({ ev, showMap }: { ev: EventItem; showMap: boolean }) {
    return (
        <article className="wt14-card">
            <p className="wt14-card-eyebrow">{ev.subtitle}</p>
            <h3 className="wt14-card-title">{ev.title}</h3>
            <ul className="wt14-event-list">
                {(ev.dateLabel || ev.timeLabel) && (
                    <li>
                        <Clock size={15} aria-hidden="true" />
                        <span>
                            {ev.dateLabel}
                            {ev.dateLabel && ev.timeLabel && <br />}
                            {ev.timeLabel}
                        </span>
                    </li>
                )}
                {(ev.venueName || ev.address) && (
                    <li>
                        <MapPin size={15} aria-hidden="true" />
                        <span>
                            {ev.venueName && <strong>{ev.venueName}</strong>}
                            {ev.venueName && ev.address && <br />}
                            {ev.address}
                        </span>
                    </li>
                )}
            </ul>
            {showMap && ev.mapsUrl && (
                <a className="wt14-btn wt14-btn-sm-top" href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation size={15} aria-hidden="true" /> Buka Google Maps
                </a>
            )}
        </article>
    );
}

export function EventDetails() {
    const w = useWedding();
    return (
        <div>
            <SectionHeading icon="mapPin" eyebrow="Pawiwahan · Rangkaian Acara" title="Waktu & Tempat" />
            <div className="wt14-stack">
                {w.events.map((ev) => (
                    <EventCard key={ev.id} ev={ev} showMap={w.sections.location} />
                ))}
            </div>
            {w.dressCodes.length > 0 && (
                <div className="wt14-dress">
                    <p className="wt14-dress-title">
                        <Shirt size={14} aria-hidden="true" /> Busana
                    </p>
                    <ul>
                        {w.dressCodes.map((d) => (
                            <li key={d.name}>
                                {d.hex && <span className="wt14-swatch" style={{ background: d.hex }} aria-hidden="true" />}
                                {d.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
