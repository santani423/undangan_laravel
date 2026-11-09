import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '../lib/date';

/**
 * Live countdown to `targetIso`, ticking on each wall-clock second. Only the
 * component that uses it re-renders.
 */
export function useCountdown(targetIso: string): CountdownParts {
  const [parts, setParts] = useState(() => getCountdownParts(targetIso));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const next = getCountdownParts(targetIso);
      setParts(next);
      if (!next.isPast) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, [targetIso]);

  return parts;
}
