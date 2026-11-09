import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CAMERA_WAYPOINTS } from '../data/cameraWaypoints';
import { SECTION_IDS } from '../data/sections';
import { maxScroll, measureSectionAnchors } from '../lib/scroll';
import { isDebug } from '../lib/urlFlags';
import { journey } from '../scene/journeyState';

gsap.registerPlugin(ScrollTrigger);

/**
 * Binds the garden camera journey to page scroll with a scrubbed GSAP
 * timeline. Each section contributes one segment that runs between the scroll
 * positions where neighbouring sections are framed, so the camera arrives at
 * a waypoint exactly when its HTML section is in view — regardless of how
 * tall each section is. The timeline is rebuilt when the layout changes
 * (images loading, new guestbook entries, viewport resize).
 */
export function useScrollCamera(enabled: boolean, reducedMotion: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return;
    let timeline: gsap.core.Timeline | null = null;
    let signature = '';

    const build = () => {
      const max = maxScroll();
      const anchors = measureSectionAnchors(SECTION_IDS);
      const next = `${max}|${anchors.map(Math.round).join(',')}`;
      if (next === signature) return;
      signature = next;

      timeline?.scrollTrigger?.kill();
      timeline?.kill();

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      for (let i = 0; i < anchors.length - 1; i++) {
        const from = CAMERA_WAYPOINTS[i + 1];
        const to = CAMERA_WAYPOINTS[i + 2];
        tl.fromTo(
          journey,
          { u: i + 1, dusk: from.dusk },
          { u: i + 2, dusk: to.dusk, ease: 'sine.inOut', duration: anchors[i + 1] - anchors[i], immediateRender: false },
          anchors[i],
        );
      }

      const trigger = ScrollTrigger.create({
        animation: tl,
        start: 0,
        end: Math.max(max, 1),
        scrub: reducedMotion ? true : 0.8,
      });
      // Jump straight to the current scroll position (no catch-up flight after a rebuild).
      tl.progress(trigger.progress);
      timeline = tl;

      if (isDebug()) {
        const target = window as unknown as { __undesia?: Record<string, unknown> };
        target.__undesia = { ...target.__undesia, journey, anchors };
      }
    };

    build();
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 160);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.clearTimeout(timer);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
    };
  }, [enabled, reducedMotion]);
}
