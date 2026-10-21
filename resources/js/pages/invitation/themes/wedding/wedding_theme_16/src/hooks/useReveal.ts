import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useExperience } from './useAppContext';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades a section's content in as it enters the viewport. Children marked
 * with `data-reveal` are staggered. Disabled for reduced motion, and only
 * armed once the invitation has been opened.
 */
export function useReveal(ref: RefObject<HTMLElement | null>): void {
  const { phase, reducedMotion } = useExperience();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || phase !== 'open' || reducedMotion) return;
    const ctx = gsap.context(() => {
      const items = element.querySelectorAll<HTMLElement>('[data-reveal]');
      gsap.from(element, {
        autoAlpha: 0,
        y: 36,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', toggleActions: 'play none none none' },
      });
      if (items.length > 0) {
        gsap.from(items, {
          autoAlpha: 0,
          y: 18,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.15,
          scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
        });
      }
    }, element);
    return () => ctx.revert();
  }, [ref, phase, reducedMotion]);
}
