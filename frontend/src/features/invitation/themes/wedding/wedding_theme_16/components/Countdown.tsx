import { useCountdown } from '../hooks/useCountdown';

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
        return <p className="wt16-sub wt16-countdown-past">Hari bahagia telah tiba. Terima kasih atas doa dan restu Anda.</p>;
    }

    return (
        <div role="timer" aria-live="off">
            <p className="wt16-sr-only">
                Menuju hari bahagia: {parts.days} hari, {parts.hours} jam, dan {parts.minutes} menit lagi.
            </p>
            <ol className="wt16-countdown" aria-hidden="true">
                {UNITS.map(({ key, label }) => (
                    <li key={key} className="wt16-sub wt16-countdown__cell">
                        <span className="wt16-countdown__num">{String(parts[key]).padStart(2, '0')}</span>
                        <span className="wt16-countdown__label">{label}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
