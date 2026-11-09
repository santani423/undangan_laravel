import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SectionDef } from '../lib/sections';
import type { CameraController, Framing } from '../scene/CameraController';
import type { World } from '../scene/WorldBuilder';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollSection {
    el: HTMLElement;
    def: SectionDef;
}

interface ScrollOptions {
    root: HTMLElement;
    sections: ScrollSection[];
    world: World | null;
    cameraController: CameraController | null;
    reducedMotion: boolean;
    isNarrow: () => boolean;
    onProgress: (progress: number) => void;
    onSectionChange: (index: number, previous: number) => void;
}

/*
 * Connects natural browser scrolling to the 3D story with GSAP ScrollTrigger.
 * - Section triggers update navigation and fire per-section hooks.
 * - Scrubbed proxies drive 3D state (envelope, photo reveal, finale gathering), so scrolling
 *   backwards reverses everything without resetting the world.
 * - Camera scroll marks are recomputed on every ScrollTrigger refresh (resize, font load, content changes).
 * No pinning or scroll-jacking: the page always scrolls normally.
 */
export class ScrollExperience {
    private active = -1;
    private triggers: ScrollTrigger[] = [];
    private handleRefresh = () => this.layoutCamera();

    constructor(private o: ScrollOptions) {}

    init() {
        this.sectionTriggers();
        if (this.o.world) this.worldTimelines(this.o.world);
        this.reveals();
        this.triggers.push(ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => this.o.onProgress(self.progress) }));
        ScrollTrigger.addEventListener('refresh', this.handleRefresh);
        ScrollTrigger.refresh();
        this.layoutCamera();
    }

    refresh() {
        ScrollTrigger.refresh();
    }

    private sectionTriggers() {
        this.o.sections.forEach(({ el }, index) => {
            this.triggers.push(
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 55%',
                    end: 'bottom 55%',
                    onToggle: (self) => {
                        if (self.isActive) this.setActive(index);
                    },
                }),
            );
        });
    }

    private setActive(index: number) {
        if (index === this.active) return;
        const previous = this.active;
        this.active = index;
        this.o.onSectionChange(index, previous);
    }

    /** Scroll positions where the camera arrives at / starts leaving each station. */
    private layoutCamera() {
        const { cameraController, sections, world } = this.o;
        if (!cameraController) return;
        const vh = window.innerHeight;
        const max = ScrollTrigger.maxScroll(window);
        const tops = sections.map(({ el }) => el.getBoundingClientRect().top + window.scrollY);
        const marks = sections.map((_, i) => {
            const enter = i === 0 ? 0 : Math.max(0, tops[i] - vh * 0.12);
            const exit = i === sections.length - 1 ? max : Math.max(enter, tops[i + 1] - vh * 0.88);
            return { enter: Math.min(enter, max), exit: Math.min(exit, max) };
        });
        const narrow = this.o.isNarrow();
        const framings = sections.map((s, i) => this.framing(s, marks[i].enter, narrow));
        cameraController.setLayout(
            { width: window.innerWidth, height: vh, narrow },
            sections.map((s) => s.def.station),
            marks,
            framings,
        );
        world?.setTitleLayout(window.innerWidth / vh < 0.9);
    }

    /**
     * The part of the screen left free by a section's panel when the camera arrives, as a
     * view shift (-0.5…0.5) and available fraction, so the 3D subject is framed beside
     * (wide screens) or above (narrow screens) the text.
     */
    private framing({ el, def }: ScrollSection, enterScroll: number, narrow: boolean): Framing {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const header = parseFloat(getComputedStyle(this.o.root).getPropertyValue('--bt11-header-h')) || 64;
        const panel = el.querySelector('.bt11-scene__panel');
        let x0 = 0;
        let x1 = vw;
        const y0 = header;
        let y1 = vh;
        if (panel) {
            const r = panel.getBoundingClientRect();
            const top = r.top + window.scrollY - enterScroll;
            if (def.side === 'bottom') y1 = vh - Math.max(16, vh * 0.04) - r.height - 12;
            else if (narrow) y1 = top - 12;
            else if (def.side === 'left') x0 = r.right + 24;
            else if (def.side === 'right') x1 = r.left - 24;
        }
        y1 = Math.min(vh, Math.max(y1, y0 + vh * 0.3));
        x1 = Math.max(x1, x0 + vw * 0.3);
        return { shiftX: (x0 + x1) / 2 / vw - 0.5, shiftY: (y0 + y1) / 2 / vh - 0.5, availX: (x1 - x0) / vw, availY: (y1 - y0) / vh };
    }

    private scrub(section: HTMLElement, start: string, end: string, apply: (p: number) => void) {
        const proxy = { p: 0 };
        const tween = gsap.to(proxy, {
            p: 1,
            ease: 'none',
            onUpdate: () => apply(proxy.p),
            scrollTrigger: { trigger: section, start, end, scrub: this.o.reducedMotion ? true : 0.6 },
        });
        if (tween.scrollTrigger) this.triggers.push(tween.scrollTrigger);
        apply(0);
    }

    private worldTimelines(world: World) {
        const byKey = new Map(this.o.sections.map((s) => [s.def.key, s.el]));
        const invitation = byKey.get('invitation');
        const gallery = byKey.get('gallery');
        const finale = byKey.get('finale');
        if (invitation) this.scrub(invitation, 'top 88%', 'top 12%', (p) => world.setEnvelopeOpen(p));
        if (gallery) this.scrub(gallery, 'top 85%', 'top 15%', (p) => world.setGalleryReveal(p));
        else world.setGalleryReveal(1);
        if (finale) {
            this.scrub(finale, 'top 45%', 'bottom bottom', (p) => world.setGather(p));
            this.triggers.push(
                ScrollTrigger.create({
                    trigger: finale,
                    start: 'top 60%',
                    end: 'bottom top',
                    onToggle: (self) => world.setFinaleActive(self.isActive),
                }),
            );
        }
    }

    /** Panels reveal as their section arrives; reversed when scrolling back up. */
    private reveals() {
        if (this.o.reducedMotion) return;
        this.o.root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
            const items = group.querySelectorAll('[data-reveal]');
            if (!items.length) return;
            const tween = gsap.fromTo(
                items,
                { autoAlpha: 0, y: 26 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    stagger: 0.07,
                    scrollTrigger: { trigger: group, start: 'top 82%', toggleActions: 'play none none reverse' },
                },
            );
            if (tween.scrollTrigger) this.triggers.push(tween.scrollTrigger);
        });
    }

    destroy() {
        ScrollTrigger.removeEventListener('refresh', this.handleRefresh);
        this.triggers.forEach((t) => {
            t.animation?.kill();
            t.kill();
        });
        this.triggers = [];
    }
}

export { gsap, ScrollTrigger };
