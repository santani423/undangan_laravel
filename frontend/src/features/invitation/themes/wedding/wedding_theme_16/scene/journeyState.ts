/**
 * Mutable state shared between the GSAP scroll timeline (DOM side) and the
 * render loop (WebGL side). It is intentionally *not* React state: it changes
 * every frame and must never trigger React re-renders.
 */
export const journey = {
    /** Waypoint parameter: 0 = cover, 1 = hero … WAYPOINT_COUNT - 1 = closing. */
    u: 0,
    /** Atmosphere blend: 0 = afternoon, 1 = dusk. */
    dusk: 0.05,
};

/** Normalised pointer position (-1…1) for subtle desktop parallax. */
export const pointer = { x: 0, y: 0 };

/** Back to the establishing shot (a newly mounted invitation always starts at the cover). */
export function resetJourney(): void {
    journey.u = 0;
    journey.dusk = 0.05;
    pointer.x = 0;
    pointer.y = 0;
}
