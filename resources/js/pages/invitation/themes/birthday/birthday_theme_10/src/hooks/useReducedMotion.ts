import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const forced = () => new URLSearchParams(window.location.search).get('motion') === 'reduce';

export function prefersReducedMotion() {
  return forced() || window.matchMedia(QUERY).matches;
}

/** Tracks the OS "reduce motion" setting (or `?motion=reduce` for testing). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(forced() || mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
