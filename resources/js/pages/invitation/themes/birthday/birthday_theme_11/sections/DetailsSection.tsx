import { Countdown } from '../components/Countdown';
import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { buildGoogleCalendarUrl, downloadIcs } from '../lib/calendar';
import { formatEventDay, formatTimeRange } from '../lib/date';
import { SECTION_BY_KEY } from '../lib/sections';

/** 3 · When & where — calendar, ticking alarm clock and bouncing map pin. */
export function DetailsSection() {
    const { config, audio, toast } = useSmile();
    const { child, event, venue, features, otherEvents } = config;
    const def = SECTION_BY_KEY.details;
    const day = formatEventDay(event);
    const time = formatTimeRange(event);
    const googleUrl = features.calendar
        ? buildGoogleCalendarUrl(config, typeof window === 'undefined' ? '' : window.location.href.split('#')[0])
        : '';

    const addToCalendar = () => {
        try {
            const name = downloadIcs(config);
            audio.play('chime');
            toast(`Berkas kalender diunduh: ${name}`);
        } catch (err) {
            console.error(err);
            toast('Berkas kalender tidak dapat dibuat. Silakan catat tanggalnya secara manual.');
        }
    };

    return (
        <SceneSection def={def} art={smileAssets.calendar} artSize={[260, 260]}>
            <SectionHeading def={def} />
            <dl className="bt11-facts" data-reveal="">
                <div className="bt11-fact">
                    <dt>Ulang tahun</dt>
                    <dd>{child.age ? `${child.name} genap ${child.age} tahun` : `${child.name} berulang tahun`}</dd>
                </div>
                {day && (
                    <div className="bt11-fact">
                        <dt>Tanggal</dt>
                        <dd>{day}</dd>
                    </div>
                )}
                {time && (
                    <div className="bt11-fact">
                        <dt>Waktu</dt>
                        <dd>{time}</dd>
                    </div>
                )}
                {(venue.name || venue.address) && (
                    <div className="bt11-fact bt11-fact--wide">
                        <dt>Tempat</dt>
                        <dd>
                            {venue.name && <strong>{venue.name}</strong>}
                            {venue.name && venue.address && <br />}
                            {venue.address && <span>{venue.address}</span>}
                        </dd>
                    </div>
                )}
                {event.dressCode && (
                    <div className="bt11-fact bt11-fact--wide">
                        <dt>Dress code</dt>
                        <dd>{event.dressCode}</dd>
                    </div>
                )}
            </dl>
            {otherEvents.length > 0 && (
                <div className="bt11-other-events" data-reveal="">
                    <h3>Acara lainnya</h3>
                    <ul>
                        {otherEvents.map((e, i) => (
                            <li key={i}>
                                <strong>{e.title}</strong>
                                <span>{[e.dayLabel, e.timeLabel].filter(Boolean).join(' · ')}</span>
                                {e.venue && <span>{e.venue}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {features.countdown && config.range && (
                <div className="bt11-details-countdown" data-reveal="">
                    <p className="bt11-countdown-label">Hitung mundur menuju pesta</p>
                    <Countdown range={config.range} />
                </div>
            )}
            {(features.location || features.calendar) && (
                <div className="bt11-actions" data-reveal="">
                    {features.location && (
                        <a
                            className="bt11-btn bt11-btn--primary"
                            href={venue.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => audio.play('pop')}
                        >
                            Buka Google Maps
                        </a>
                    )}
                    {features.calendar && (
                        <button className="bt11-btn bt11-btn--secondary" type="button" onClick={addToCalendar}>
                            Tambah ke kalender
                        </button>
                    )}
                </div>
            )}
            {features.calendar && googleUrl && (
                <p className="bt11-small" data-reveal="">
                    “Tambah ke kalender” mengunduh berkas .ics untuk Apple Calendar, Outlook, dan aplikasi kalender lainnya. Pakai Google Calendar?{' '}
                    <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                        Tambahkan di sana saja
                    </a>
                    .
                </p>
            )}
            <p className="bt11-note" data-reveal="">
                {config.copy.detailsNote}
            </p>
        </SceneSection>
    );
}
