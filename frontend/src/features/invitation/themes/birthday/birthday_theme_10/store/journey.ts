/**
 * Per-frame camera journey values. Deliberately *not* React state: the DOM
 * scroll system writes `target`, the render loop eases `value` towards it, and
 * GSAP tweens `intro` once when the invitation is opened. The CameraRig is the
 * only code that turns these numbers into a camera transform, so no two
 * animation systems ever fight over the camera.
 */
export const journey = {
    /** Fractional camera stop index derived from scroll position (0 … stops-1). */
    target: 0,
    /** Eased value actually rendered. */
    value: 0,
    /** 0 = establishing shot behind the cover, 1 = journey camera. */
    intro: 0,
    /** Set by the scroll hook when a jump should not be eased (reduced motion). */
    snap: false,
};

export function resetJourney() {
    journey.target = 0;
    journey.value = 0;
    journey.intro = 0;
    journey.snap = false;
}

// Exposed for automated QA in development builds only.
if (import.meta.env.DEV) (window as unknown as { __toyJourney: typeof journey }).__toyJourney = journey;
