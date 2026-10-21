import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import { CAMERA_WAYPOINTS, waypointIndex } from '../lib/cameraWaypoints';
import { maxScroll, measureSectionAnchors } from '../lib/scroll';
import type { SectionId } from '../lib/sections';
import { exposeDebug } from '../lib/urlFlags';
import { journey } from '../scene/journeyState';

/**
 * Binds the garden camera journey to page scroll with a scrubbed GSAP
 * timeline. Each visible section contributes one segment that runs between
 * the scroll positions where neighbouring sections are framed, so the camera
 * arrives at a waypoint exactly when its HTML section is in view — regardless
 * of how tall each section is. Hidden sections are flown past. The timeline
 * is rebuilt when the layout changes (images loading, new guestbook entries,
 * viewport resize).
 */
export function useScrollCamera(enabled: boolean, reducedMotion: boolean, ids: readonly SectionId[]): void {
    useLayoutEffect(() => {
        if (!enabled) return;
        gsap.registerPlugin(ScrollTrigger);
        const stops = ids.map(waypointIndex);
        let timeline: gsap.core.Timeline | null = null;
        let signature = '';

        const build = () => {
            const max = maxScroll();
            const anchors = measureSectionAnchors(ids);
            const next = `${max}|${anchors.map(Math.round).join(',')}`;
            if (next === signature) return;
            signature = next;

            timeline?.scrollTrigger?.kill();
            timeline?.kill();

            const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
            for (let i = 0; i < anchors.length - 1; i++) {
                const from = CAMERA_WAYPOINTS[stops[i]];
                const to = CAMERA_WAYPOINTS[stops[i + 1]];
                tl.fromTo(
                    journey,
                    { u: stops[i], dusk: from.dusk },
                    { u: stops[i + 1], dusk: to.dusk, ease: 'sine.inOut', duration: anchors[i + 1] - anchors[i], immediateRender: false },
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
            exposeDebug({ journey, anchors });
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
    }, [enabled, reducedMotion, ids]);
}
