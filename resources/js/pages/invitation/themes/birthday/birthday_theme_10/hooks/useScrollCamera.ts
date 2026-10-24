import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import { CAMERA_STOPS, sectionForStop } from '../lib/journey';
import { clamp, smootherstep } from '../lib/math';
import { experienceStore, setExperience } from '../store/experience';
import { journey } from '../store/journey';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

interface StopRange {
    stop: number;
    top: number;
    /** Scroll range in which the camera rests at this stop. */
    holdStart: number;
    holdEnd: number;
}

/** Fraction of the viewport around each block's top edge where the camera dwells. */
const HOLD_PAD = 0.15;

let ranges: StopRange[] = [];

function measureStops(): StopRange[] {
    const vh = window.innerHeight;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-camera-stop]'))
        .map((el) => {
            const rect = el.getBoundingClientRect();
            return { stop: Number(el.dataset.cameraStop), top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
        })
        .filter((b) => Number.isFinite(b.stop))
        .sort((a, b) => a.stop - b.stop);

    let previousEnd = 0;
    return blocks.map((b, i) => {
        let holdStart = i === 0 ? 0 : b.top - HOLD_PAD * vh;
        let holdEnd = Math.max(holdStart, b.bottom - vh + HOLD_PAD * vh);
        if (i === blocks.length - 1) holdEnd = Math.max(holdEnd, maxScroll);
        holdStart = clamp(Math.max(holdStart, previousEnd), 0, maxScroll);
        holdEnd = clamp(holdEnd, holdStart, Math.max(maxScroll, holdStart));
        previousEnd = holdEnd;
        return { stop: b.stop, top: Math.min(b.top, maxScroll), holdStart, holdEnd };
    });
}

/**
 * Maps a scroll offset to a fractional stop index. Between two stops the value
 * follows a smootherstep curve so the camera eases out of one destination and
 * settles into the next exactly as its panel arrives.
 */
export function scrollToJourney(scroll: number, list: StopRange[] = ranges) {
    if (list.length === 0) return 0;
    for (let i = 0; i < list.length; i++) {
        const a = list[i];
        if (scroll <= a.holdEnd) return a.stop;
        const b = list[i + 1];
        if (b && scroll < b.holdStart) {
            const f = (scroll - a.holdEnd) / Math.max(1, b.holdStart - a.holdEnd);
            return a.stop + (b.stop - a.stop) * smootherstep(f);
        }
    }
    return list[list.length - 1].stop;
}

/**
 * Creates the single master ScrollTrigger that drives the 3D camera journey.
 * The trigger only writes `journey.target`; the CameraRig eases towards it in
 * the render loop, so forward, reverse, fast and programmatic scrolling all
 * stay in sync without competing tweens on the camera.
 */
export function useScrollCamera({ enabled, reducedMotion }: { enabled: boolean; reducedMotion: boolean }) {
    useLayoutEffect(() => {
        if (!enabled) return;

        const update = (scroll: number) => {
            const j = scrollToJourney(scroll);
            journey.target = reducedMotion ? Math.round(j) : j;
            journey.snap = reducedMotion;
            const stop = clamp(Math.round(j), 0, CAMERA_STOPS.length - 1);
            if (experienceStore.getState().activeStop !== stop) {
                setExperience({ activeStop: stop, activeSection: sectionForStop(stop) });
            }
        };

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                id: 'toy-world-journey',
                start: 0,
                end: 'max',
                onRefresh: (self) => {
                    ranges = measureStops();
                    update(self.scroll());
                },
                onUpdate: (self) => update(self.scroll()),
            });
        });
        ranges = measureStops();
        update(window.scrollY);

        // Content height can change without a window resize (images, fonts, RSVP results).
        let frame = 0;
        const observer = new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        const main = document.getElementById('bt10-journey');
        if (main) observer.observe(main);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            ctx.revert();
        };
    }, [enabled, reducedMotion]);
}

/** Smoothly scrolls to a camera stop (navigation, "back to start", etc.). */
export function scrollToStop(stop: number, reducedMotion: boolean) {
    if (ranges.length === 0) ranges = measureStops();
    // A switched-off section has no block: go to the next stop that exists.
    const range = ranges.find((r) => r.stop >= stop);
    if (!range) return;
    const target = stop === 0 ? 0 : range.top;
    if (reducedMotion) {
        gsap.killTweensOf(window);
        window.scrollTo({ top: target, behavior: 'auto' });
        return;
    }
    const distance = Math.abs(window.scrollY - target) / window.innerHeight;
    gsap.to(window, {
        scrollTo: { y: target, autoKill: true },
        duration: clamp(0.5 + distance * 0.32, 0.6, 2.6),
        ease: 'power2.inOut',
        overwrite: true,
    });
}

export { ScrollTrigger };
