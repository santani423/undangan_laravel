import { CalendarPlus, Clock, ExternalLink, PartyPopper, Shirt } from 'lucide-react';
import { StopBlock } from '../components/layout/StopBlock';
import { PackIcon } from '../components/ui/PackIcon';
import { useToast } from '../components/ui/Toast';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { useCountdown } from '../hooks/useCountdown';
import { toyAssets } from '../lib/assets';
import { downloadEventICS } from '../lib/calendar';
import { STOP_INDEX } from '../lib/journey';

const UNITS = [
    { key: 'days', label: 'Hari', color: 'coral' },
    { key: 'hours', label: 'Jam', color: 'butter' },
    { key: 'minutes', label: 'Menit', color: 'mint' },
    { key: 'seconds', label: 'Detik', color: 'sky' },
] as const;

function CountdownBoard({ startISO, endISO }: { startISO: string; endISO: string }) {
    const countdown = useCountdown(startISO, endISO);

    if (countdown.status === 'ongoing') {
        return (
            <p className="bt10-notice bt10-notice--mint bt10-notice--big">
                <PartyPopper aria-hidden="true" size={22} /> Pestanya sedang berlangsung — ayo bergabung!
            </p>
        );
    }
    if (countdown.status === 'ended') {
        return <p className="bt10-notice bt10-notice--lavender bt10-notice--big">Pesta telah usai. Terima kasih atas doa dan kehadirannya!</p>;
    }
    if (countdown.status === 'invalid') {
        return <p className="bt10-notice bt10-notice--coral">Tanggal acara belum diatur.</p>;
    }

    const summary = `${countdown.days} hari ${countdown.hours} jam ${countdown.minutes} menit lagi`;
    return (
        <div role="timer" aria-live="off" aria-label={`Hitung mundur: ${summary}`}>
            <ol className="bt10-countdown" aria-hidden="true">
                {UNITS.map((u) => (
                    <li key={u.key} className={`bt10-countdown__cell bt10-tint-${u.color}`}>
                        <span className="bt10-countdown__num">{String(countdown[u.key]).padStart(2, '0')}</span>
                        <span className="bt10-countdown__unit">{u.label}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/** Scene 3 — date, time, venue, live countdown and map. */
export function EventDetails() {
    const { config } = useInvitation();
    const toast = useToast();
    const { event, otherEvents, features, child, dressCode } = config;
    if (!event) return null;
    const showLocation = features.location && (event.venueName || event.address);
    const countdownStart = config.countdownISO || event.startISO;
    // The party's end time only applies when it comes after the countdown target.
    const countdownEnd = event.endISO && Date.parse(event.endISO) > Date.parse(countdownStart) ? event.endISO : '';

    return (
        <StopBlock stop={STOP_INDEX.party} id="acara" labelledBy="bt10-acara-title">
            <ToyCard studs={3} studOffset={2}>
                <img src={toyAssets.illustrations.cake} alt="" aria-hidden="true" className="bt10-deco bt10-deco--corner bt10-bob" />
                <p className="bt10-eyebrow">
                    <PackIcon name="calendar" size={16} className="bt10-text-sky-deep" /> Waktu &amp; Tempat
                </p>
                <h2 id="bt10-acara-title" className="bt10-title">
                    {event.title}
                </h2>

                <dl className="bt10-facts">
                    {event.dateLabel && (
                        <div className="bt10-fact">
                            <dt className="bt10-fact__icon bt10-tint-coral">
                                <PackIcon name="calendar" size={20} />
                                <span className="bt10-sr-only">Tanggal</span>
                            </dt>
                            <dd className="bt10-fact__value">{event.dateLabel}</dd>
                        </div>
                    )}
                    {event.timeLabel && (
                        <div className="bt10-fact">
                            <dt className="bt10-fact__icon bt10-tint-butter">
                                <Clock size={20} aria-hidden="true" />
                                <span className="bt10-sr-only">Waktu</span>
                            </dt>
                            <dd className="bt10-fact__value">{event.timeLabel}</dd>
                        </div>
                    )}
                    {showLocation && (
                        <div className="bt10-fact">
                            <dt className="bt10-fact__icon bt10-tint-mint">
                                <PackIcon name="mapPin" size={20} />
                                <span className="bt10-sr-only">Tempat</span>
                            </dt>
                            <dd>
                                {event.venueName && <p className="bt10-fact__venue">{event.venueName}</p>}
                                {event.address && <address className="bt10-fact__address">{event.address}</address>}
                            </dd>
                        </div>
                    )}
                    <div className="bt10-fact">
                        <dt className="bt10-fact__icon bt10-tint-lavender">
                            <Shirt size={20} aria-hidden="true" />
                            <span className="bt10-sr-only">Kostum</span>
                        </dt>
                        <dd className="bt10-fact__note">{dressCode}</dd>
                    </div>
                </dl>

                {features.countdown && countdownStart && (
                    <div className="bt10-block">
                        <p className="bt10-label">Menuju hari pesta</p>
                        <CountdownBoard startISO={countdownStart} endISO={countdownEnd} />
                    </div>
                )}

                {otherEvents.length > 0 && (
                    <div className="bt10-block">
                        <p className="bt10-label">Acara lainnya</p>
                        <ul className="bt10-other-events">
                            {otherEvents.map((ev) => (
                                <li key={ev.id} className="bt10-other-event">
                                    <p className="bt10-other-event__title">{ev.title}</p>
                                    <p className="bt10-muted bt10-small">{[ev.dateLabel, ev.timeLabel].filter(Boolean).join(' · ')}</p>
                                    {features.location && (ev.venueName || ev.address) && (
                                        <p className="bt10-small">{[ev.venueName, ev.address].filter(Boolean).join(', ')}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="bt10-actions">
                    {showLocation && event.mapUrl && (
                        <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="bt10-btn bt10-btn--mint">
                            <PackIcon name="mapPin" size={20} /> Buka Google Maps
                            <ExternalLink size={16} aria-hidden="true" />
                            <span className="bt10-sr-only">(membuka tab baru)</span>
                        </a>
                    )}
                    {features.calendar && event.startISO && (
                        <button
                            type="button"
                            className="bt10-btn bt10-btn--white"
                            onClick={() => {
                                if (downloadEventICS(event, child.nickname)) toast('File kalender diunduh');
                                else toast('Tanggal acara belum diatur', 'error');
                            }}
                        >
                            <CalendarPlus size={20} aria-hidden="true" /> Simpan ke Kalender
                        </button>
                    )}
                </div>
            </ToyCard>
        </StopBlock>
    );
}
