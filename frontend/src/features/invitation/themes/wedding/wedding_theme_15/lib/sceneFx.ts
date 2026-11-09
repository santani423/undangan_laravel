/**
 * Per-frame values shared between the DOM (GSAP, scroll, pointer) and the 3D scene.
 * Plain mutable object on purpose: it is written by exactly one producer per field
 * and read inside useFrame, so React never re-renders for it.
 */
export const sceneFx = {
    /** Scroll-derived camera parameter along the 2N-point path (see lib/scrollScene.ts). */
    qTarget: 0,
    /** 0 = cover pose, 1 = arrived at the forest entrance. Tweened by the opening timeline. */
    intro: 0,
    /** Envelope opening stages, each 0 → 1. */
    seal: 0,
    flap: 0,
    letter: 0,
    away: 0,
    /** Clock time (seconds) at which the petal burst started; -1 = idle. */
    burstAt: -1,
    /** Normalised pointer, -1..1, damped in the camera rig. */
    pointerX: 0,
    pointerY: 0,
    /** Whether reduced-motion is requested (camera snaps instead of gliding). */
    reducedMotion: false,
};

export type SceneFx = typeof sceneFx;

export function resetSceneFx() {
    Object.assign(sceneFx, { qTarget: 0, intro: 0, seal: 0, flap: 0, letter: 0, away: 0, burstAt: -1, pointerX: 0, pointerY: 0 });
}
