import { useEffect, useMemo, useState } from 'react';

export type CountdownStatus = 'upcoming' | 'ongoing' | 'ended' | 'invalid';

export interface Countdown {
    status: CountdownStatus;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

/**
 * Live countdown to `startISO`. Always derived from `Date.now()` (no drift),
 * re-aligned to whole seconds, and stops ticking once the event has ended.
 */
export function useCountdown(startISO: string, endISO: string): Countdown {
    const start = useMemo(() => Date.parse(startISO), [startISO]);
    // Without an end time the party is treated as ongoing for three hours.
    const end = useMemo(() => (endISO ? Date.parse(endISO) : start + 3 * 3600e3), [endISO, start]);
    const [now, setNow] = useState(() => Date.now());

    const valid = Number.isFinite(start) && Number.isFinite(end);
    const status: CountdownStatus = !valid ? 'invalid' : now < start ? 'upcoming' : now < end ? 'ongoing' : 'ended';
    const finished = status === 'ended' || status === 'invalid';

    useEffect(() => {
        if (finished) return;
        let timer = 0;
        const tick = () => {
            setNow(Date.now());
            timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
        };
        timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
        return () => window.clearTimeout(timer);
    }, [finished]);

    const diff = status === 'upcoming' ? start - now : 0;
    return {
        status,
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}
