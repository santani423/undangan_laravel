import { IconCalendar, IconChevronDown, IconCopy, IconPin } from '../components/Icons';
import { DemoBadge, Reveal, SectionHeading } from '../components/ui';
import { downloadIcs, googleCalendarUrl } from '../lib/calendar';
import { useWedding } from '../lib/context';
import { copyText } from '../lib/links';
import { setApp, showToast } from '../lib/store';
import type { EventDetail } from '../lib/types';

function EventCard({ event, delay }: { event: EventDetail; delay: number }) {
    const { couple, sections } = useWedding();
    const address = [event.venueName, event.venueAddress].filter(Boolean).join(', ');
    const names = couple.displayNames;
    return (
        <Reveal className="wt15-event-card" delay={delay}>
            <h3 className="wt15-event-card__name">{event.name}</h3>
            <dl className="wt15-event-card__meta">
                {event.dateLabel && (
                    <div>
                        <dt>Tanggal</dt>
                        <dd>{event.dateLabel}</dd>
                    </div>
                )}
                {event.timeLabel && (
                    <div>
                        <dt>Waktu</dt>
                        <dd>{event.timeLabel}</dd>
                    </div>
                )}
                {address && (
                    <div>
                        <dt>Tempat</dt>
                        <dd>
                            {event.venueName && <strong>{event.venueName}</strong>}
                            {event.venueName && event.venueAddress && <br />}
                            {event.venueAddress}
                        </dd>
                    </div>
                )}
            </dl>
            <div className="wt15-btn-row">
                {sections.location && event.mapsUrl && (
                    <a className="wt15-btn wt15-btn--primary wt15-btn--sm" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">
                        <IconPin /> Google Maps
                    </a>
                )}
                {sections.calendar && event.startISO && (
                    <details className="wt15-menu">
                        <summary className="wt15-btn wt15-btn--ghost wt15-btn--sm">
                            <IconCalendar /> Tambah ke Kalender <IconChevronDown className="wt15-menu__chev" />
                        </summary>
                        <div className="wt15-menu__list">
                            <a href={googleCalendarUrl(event, names)} target="_blank" rel="noopener noreferrer">
                                Google Calendar
                            </a>
                            <button type="button" onClick={() => downloadIcs([event], names, `${event.id}.ics`)}>
                                Apple / Outlook (.ics)
                            </button>
                        </div>
                    </details>
                )}
                {address && (
                    <button
                        type="button"
                        className="wt15-btn wt15-btn--ghost wt15-btn--sm"
                        onClick={async () =>
                            showToast((await copyText(address)) ? 'Alamat venue disalin ✓' : 'Gagal menyalin — silakan salin manual.')
                        }
                    >
                        <IconCopy /> Salin Alamat
                    </button>
                )}
            </div>
        </Reveal>
    );
}

/** Scene 5: ceremony & reception under the floral arch. */
export function EventSection() {
    const { events, dressCodes, isSample } = useWedding();
    // The design's "Akad & Resepsi" heading when that is exactly what the invitation holds.
    const akadResepsi = events.length === 2 && /akad|ijab/i.test(events[0].name) && /resepsi|walimah/i.test(events[1].name);
    return (
        <section id="event" data-scene className="wt15-section wt15-section--right wt15-section--tall" aria-labelledby="wt15-event-title">
            <div className="wt15-panel">
                <SectionHeading
                    id="wt15-event-title"
                    eyebrow="Wedding Day"
                    title={
                        akadResepsi ? (
                            <>
                                Akad <em>&amp;</em> Resepsi
                            </>
                        ) : (
                            <>
                                Rangkaian <em>acara</em>
                            </>
                        )
                    }
                />
                {isSample && <DemoBadge>Tanggal dan venue di bawah adalah contoh.</DemoBadge>}
                <div className="wt15-events">
                    {events.map((e, i) => (
                        <EventCard key={e.id} event={e} delay={0.08 * i} />
                    ))}
                </div>
                {dressCodes.length > 0 && (
                    <Reveal className="wt15-dresscode" delay={0.12}>
                        <p className="wt15-dresscode__title">Dress code</p>
                        <ul className="wt15-dresscode__list">
                            {dressCodes.map((d) => (
                                <li key={d.name + d.hex}>
                                    {d.hex && <span className="wt15-dresscode__swatch" style={{ background: d.hex }} aria-hidden="true" />}
                                    {d.name}
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                )}
            </div>
        </section>
    );
}

/** Scene 6: gallery grid; the same images float on frames in the 3D pavilion. */
export function GallerySection() {
    const { gallery, video, sections } = useWedding();
    const hasDemo = gallery.some((g) => g.isDemo);
    return (
        <section id="gallery" data-scene className="wt15-section wt15-section--left wt15-section--tall" aria-labelledby="wt15-gallery-title">
            <div className="wt15-panel wt15-panel--wide">
                <SectionHeading
                    id="wt15-gallery-title"
                    eyebrow="Gallery"
                    title={
                        <>
                            Momen <em>kami</em>
                        </>
                    }
                />
                {sections.gallery && hasDemo && <DemoBadge>Ilustrasi contoh, bukan foto pasangan. Foto prewedding akan tampil di sini.</DemoBadge>}
                {sections.gallery && (
                    <ul className="wt15-gallery">
                        {gallery.map((img, i) => (
                            <Reveal as="li" key={`${img.src}-${i}`} delay={(i % 4) * 0.06} className="wt15-gallery__item">
                                <button
                                    type="button"
                                    className="wt15-gallery__btn"
                                    onClick={() => setApp({ lightboxIndex: i })}
                                    aria-label={`Buka foto: ${img.caption || img.alt}`}
                                >
                                    <img src={img.thumb} alt={img.alt} width={480} height={600} loading="lazy" decoding="async" />
                                    {img.caption && <span className="wt15-gallery__caption">{img.caption}</span>}
                                </button>
                            </Reveal>
                        ))}
                    </ul>
                )}
                {sections.video && (
                    <Reveal className="wt15-video" delay={0.1}>
                        {video.kind === 'file' ? (
                            <video src={video.src} controls playsInline preload="metadata" />
                        ) : (
                            <iframe
                                src={video.src}
                                title="Video pasangan"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </Reveal>
                )}
            </div>
        </section>
    );
}
