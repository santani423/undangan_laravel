import { useCountdown } from '../../hooks/useCountdown';

const UNITS = [
  { key: 'days', label: 'Hari' },
  { key: 'hours', label: 'Jam' },
  { key: 'minutes', label: 'Menit' },
  { key: 'seconds', label: 'Detik' },
] as const;

/** Live countdown to the configured wedding date. */
export function Countdown({ target }: { target: string }) {
  const parts = useCountdown(target);

  if (parts.isPast) {
    return (
      <p className="sub-card text-center font-serif text-xl text-ink" data-testid="countdown-past">
        Hari bahagia telah tiba. Terima kasih atas doa dan restu Anda.
      </p>
    );
  }

  return (
    <div role="timer" aria-live="off" data-testid="countdown">
      <p className="sr-only">
        Menuju hari bahagia: {parts.days} hari, {parts.hours} jam, dan {parts.minutes} menit lagi.
      </p>
      <ol className="grid grid-cols-4 gap-2 sm:gap-3" aria-hidden="true">
        {UNITS.map(({ key, label }) => (
          <li key={key} className="sub-card flex flex-col items-center px-1 py-3">
            <span className="font-serif text-3xl font-semibold tabular-nums text-ink sm:text-4xl" data-unit={key}>
              {String(parts[key]).padStart(2, '0')}
            </span>
            <span className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-gold-ink">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
