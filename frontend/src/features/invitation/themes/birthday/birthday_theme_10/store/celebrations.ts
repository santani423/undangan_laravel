import type { CelebrationSpot } from '../lib/world';

export interface CelebrationEvent {
    spot: CelebrationSpot;
    /** 0.4 … 1.5 — scales particle count and launch speed. */
    strength: number;
}

type Handler = (event: CelebrationEvent) => void;
const handlers = new Set<Handler>();
/** Off when the invitation's "confetti" feature is switched off. */
let enabled = true;

export function setCelebrationsEnabled(value: boolean) {
    enabled = value;
}

/** Fire a confetti celebration. Rendered by the 3D scene or the DOM fallback. */
export function celebrate(spot: CelebrationSpot, strength = 1) {
    if (!enabled) return;
    handlers.forEach((h) => h({ spot, strength }));
}

export function onCelebrate(handler: Handler) {
    handlers.add(handler);
    return () => {
        handlers.delete(handler);
    };
}
