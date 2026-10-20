import { useEffect, useRef, useState } from 'react';
import { getCountdown, type CountdownParts } from './date';

export function useCountdown(targetISO: string): CountdownParts {
    const [parts, setParts] = useState(() => getCountdown(targetISO));
    useEffect(() => {
        // Align ticks to wall-clock seconds.
        let timer = 0;
        const tick = () => {
            const next = getCountdown(targetISO);
            setParts(next);
            if (next.remaining > 0) timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
        };
        tick();
        return () => window.clearTimeout(timer);
    }, [targetISO]);
    return parts;
}

/**
 * Plays an element's entrance once, when it has scrolled a little into view (CSS does the motion:
 * `.wt15-reveal` → `.is-in`). Text never jumps back while reading.
 */
export function useReveal<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || shown) return;
        if (!('IntersectionObserver' in window)) {
            setShown(true);
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setShown(true);
                    io.disconnect();
                }
            },
            // A margin rather than a ratio, so very tall blocks reveal too.
            { rootMargin: '0px 0px -12% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [shown]);
    return { ref, shown };
}
