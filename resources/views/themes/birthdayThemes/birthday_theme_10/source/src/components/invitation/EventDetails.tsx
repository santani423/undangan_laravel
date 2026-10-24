import { CalendarPlus, Clock, ExternalLink, PartyPopper, Shirt } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { toyAssets } from '../../config/assets';
import { STOP_INDEX } from '../../config/journey';
import { useCountdown } from '../../hooks/useCountdown';
import { downloadEventICS } from '../../utils/calendar';
import { formatEventDate, formatEventTime } from '../../utils/format';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';
import { PackIcon } from '../ui/PackIcon';
import { useToast } from '../ui/Toast';

const UNITS = [
  { key: 'days', label: 'Hari', color: 'bg-toy-coral/35' },
  { key: 'hours', label: 'Jam', color: 'bg-toy-butter/55' },
  { key: 'minutes', label: 'Menit', color: 'bg-toy-mint/50' },
  { key: 'seconds', label: 'Detik', color: 'bg-toy-sky/45' },
] as const;

function CountdownBoard() {
  const { event } = invitationConfig;
  const countdown = useCountdown(event.startISO, event.endISO);

  if (countdown.status === 'ongoing') {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-toy-mint/45 px-4 py-3 font-display text-lg font-semibold">
        <PartyPopper aria-hidden="true" size={22} /> Pestanya sedang berlangsung — ayo bergabung!
      </p>
    );
  }
  if (countdown.status === 'ended') {
    return (
      <p className="rounded-2xl bg-toy-lavender/35 px-4 py-3 font-display text-lg font-semibold">
        Pesta telah usai. Terima kasih atas doa dan kehadirannya!
      </p>
    );
  }
  if (countdown.status === 'invalid') {
    return <p className="rounded-2xl bg-toy-coral/25 px-4 py-3 text-sm">Tanggal acara belum diatur dengan benar.</p>;
  }

  const summary = `${countdown.days} hari ${countdown.hours} jam ${countdown.minutes} menit lagi`;
  return (
    <div role="timer" aria-live="off" aria-label={`Hitung mundur: ${summary}`}>
      <ol className="grid grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
        {UNITS.map((u) => (
          <li key={u.key} className={`flex flex-col items-center rounded-2xl py-2.5 ${u.color} shadow-[inset_0_-4px_0_rgb(59_51_85/0.08)]`}>
            <span className="font-display text-3xl leading-none font-bold tabular-nums sm:text-4xl">
              {String(countdown[u.key]).padStart(2, '0')}
            </span>
            <span className="mt-1 text-xs font-bold tracking-wide uppercase">{u.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Scene 3 — date, time, venue, live countdown and map. */
export function EventDetails() {
  const { event } = invitationConfig;
  const toast = useToast();

  return (
    <StopBlock stop={STOP_INDEX.party} as="section" id="acara" labelledBy="acara-title">
      <ToyCard studs={3} studOffset={2}>
        <img
          src={toyAssets.illustrations.cake}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -top-14 -right-3 h-24 w-24 animate-bob sm:-right-8"
        />
        <p className="eyebrow">
          <PackIcon name="calendar" size={16} className="text-toy-sky-deep" /> Waktu &amp; Tempat
        </p>
        <h2 id="acara-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {event.title}
        </h2>

        <dl className="mt-5 space-y-3.5">
          <div className="flex gap-3">
            <dt className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-toy-coral/30">
              <PackIcon name="calendar" size={20} />
              <span className="sr-only">Tanggal</span>
            </dt>
            <dd className="self-center font-display text-lg font-semibold">{formatEventDate(event.startISO)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-toy-butter/55">
              <Clock size={20} aria-hidden="true" />
              <span className="sr-only">Waktu</span>
            </dt>
            <dd className="self-center font-display text-lg font-semibold">
              {formatEventTime(event.startISO)} – {formatEventTime(event.endISO)} {event.timeZoneLabel}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-toy-mint/50">
              <PackIcon name="mapPin" size={20} />
              <span className="sr-only">Tempat</span>
            </dt>
            <dd>
              <p className="font-display text-lg leading-snug font-semibold">{event.venueName}</p>
              <p className="text-sm font-semibold text-toy-ink-soft">{event.venueDetail}</p>
              <address className="mt-0.5 text-sm not-italic">{event.address}</address>
            </dd>
          </div>
          {event.dressCode && (
            <div className="flex gap-3">
              <dt className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-toy-lavender/40">
                <Shirt size={20} aria-hidden="true" />
                <span className="sr-only">Kostum</span>
              </dt>
              <dd className="self-center text-sm">{event.dressCode}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          <p className="mb-2 font-display text-sm font-semibold text-toy-ink-soft">Menuju hari pesta</p>
          <CountdownBoard />
        </div>

        <div className="mt-6 grid gap-3">
          <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="toy-btn toy-btn-mint">
            <PackIcon name="mapPin" size={20} /> Buka Google Maps
            <ExternalLink size={16} aria-hidden="true" />
            <span className="sr-only">(membuka tab baru)</span>
          </a>
          <button
            type="button"
            className="toy-btn toy-btn-white"
            onClick={() => {
              downloadEventICS();
              toast('File kalender diunduh');
            }}
          >
            <CalendarPlus size={20} aria-hidden="true" /> Simpan ke Kalender
          </button>
        </div>
        {event.notes && <p className="mt-4 text-sm text-toy-ink-soft">{event.notes}</p>}
      </ToyCard>
    </StopBlock>
  );
}
