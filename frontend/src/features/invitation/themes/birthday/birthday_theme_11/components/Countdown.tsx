import { useEffect, useState } from 'react';
import { now } from '../lib/clock';
import { getCountdown } from '../lib/date';
import type { EventRange } from '../lib/types';

const UNITS = [
    ['days', 'hari'],
    ['hours', 'jam'],
    ['minutes', 'menit'],
    ['seconds', 'detik'],
] as const;

const STATUS_TEXT = {
    live: 'Pestanya sedang berlangsung sekarang!',
    ended: 'Pestanya sudah selesai. Terima kasih sudah ikut merayakan!',
};

/** Live countdown, re-aligned to whole seconds so every instance flips together; stops once the party has ended. */
export function Countdown({ range }: { range: EventRange }) {
    const [time, setTime] = useState(now);
    const state = getCountdown(range, time);
    const ended = state.status === 'ended';

    useEffect(() => {
        if (ended) return;
        let timer = 0;
        const tick = () => {
            setTime(now());
            timer = window.setTimeout(tick, 1000 - (now() % 1000) + 5);
        };
        timer = window.setTimeout(tick, 1000 - (now() % 1000) + 5);
        return () => window.clearTimeout(timer);
    }, [ended]);

    const upcoming = state.status === 'upcoming';
    const label =
        state.status === 'upcoming'
            ? `${state.days} hari, ${state.hours} jam, dan ${state.minutes} menit lagi menuju pesta`
            : STATUS_TEXT[state.status];

    return (
        <div className="bt11-countdown" role="timer" aria-label={label} data-status={state.status}>
            {upcoming ? (
                <ol className="bt11-countdown__units" aria-hidden="true">
                    {UNITS.map(([key, unit]) => (
                        <li key={key} className="bt11-countdown__unit">
                            <span className="bt11-countdown__value">{key === 'days' ? String(state[key]) : String(state[key]).padStart(2, '0')}</span>
                            <span className="bt11-countdown__label">{unit}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="bt11-countdown__status">{label}</p>
            )}
        </div>
    );
}
