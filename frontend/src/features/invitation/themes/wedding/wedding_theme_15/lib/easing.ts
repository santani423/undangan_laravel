/**
 * One easing vocabulary for the whole experience.
 * The DOM uses the matching CSS custom properties (--ease-out / --ease-in-out, scoped to .wt15), GSAP uses the named
 * equivalents, and the 3D scene uses exponential damping with the lambdas below.
 */
export const GSAP_EASE = {
    out: 'power3.out',
    inOut: 'power2.inOut',
    pop: 'back.out(1.8)',
};

/** Damping lambdas for THREE.MathUtils.damp (higher = snappier). */
export const DAMP = {
    camera: 2.4,
    frame: 2.2,
    env: 1.6,
    pointer: 1.8,
    snap: 14,
};

export function smootherstep(t: number) {
    const x = Math.min(1, Math.max(0, t));
    return x * x * x * (x * (x * 6 - 15) + 10);
}
