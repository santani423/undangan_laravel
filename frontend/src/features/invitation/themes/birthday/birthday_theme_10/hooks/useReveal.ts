import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, type RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Slides a panel in as it scrolls into view and reverses when scrolling back.
 * Only opacity/translate are animated (no scale: scaling large text layers makes
 * the browser re-rasterise them when the animation ends), so content stays
 * focusable and readable by assistive technology at all times.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, { disabled = false, delay = 0 } = {}) {
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || disabled) return;
        const ctx = gsap.context(() => {
            gsap.from(el, {
                opacity: 0,
                y: 40,
                duration: 0.7,
                delay,
                ease: 'back.out(1.4)',
                scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
            });
        }, el);
        return () => ctx.revert();
    }, [ref, disabled, delay]);
}
