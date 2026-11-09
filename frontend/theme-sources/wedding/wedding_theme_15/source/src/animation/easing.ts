/**
 * One easing vocabulary for the whole experience.
 * DOM (Framer Motion) uses the cubic-bezier arrays, GSAP uses the named equivalents,
 * and the 3D scene uses exponential damping with the lambdas below.
 */
export const EASE = {
  /** Content entering: quick start, long soft landing. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Scene-level moves. */
  inOut: [0.65, 0, 0.35, 1] as const,
}

export const GSAP_EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  pop: 'back.out(1.8)',
}

/** Damping lambdas for THREE.MathUtils.damp (higher = snappier). */
export const DAMP = {
  camera: 2.4,
  frame: 2.2,
  env: 1.6,
  pointer: 1.8,
  snap: 14,
}

export function smootherstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}
