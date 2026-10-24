import type { CelebrationSpot } from '../config/world';

export interface CelebrationEvent {
  spot: CelebrationSpot;
  /** 0.4 … 1.5 — scales particle count and launch speed. */
  strength: number;
}

type Handler = (event: CelebrationEvent) => void;
const handlers = new Set<Handler>();

/** Fire a confetti celebration. Rendered by the 3D scene or the DOM fallback. */
export function celebrate(spot: CelebrationSpot, strength = 1) {
  handlers.forEach((h) => h({ spot, strength }));
}

export function onCelebrate(handler: Handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
