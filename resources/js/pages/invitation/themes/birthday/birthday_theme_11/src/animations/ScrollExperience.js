import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * Connects natural browser scrolling to the 3D story with GSAP ScrollTrigger.
 * - Section triggers update navigation and fire per-section hooks.
 * - Scrubbed proxies drive 3D state (envelope, photo reveal, finale gathering), so scrolling
 *   backwards reverses everything without resetting the world.
 * - Camera scroll marks are recomputed on every ScrollTrigger refresh (resize, font load…).
 * No pinning or scroll-jacking: the page always scrolls normally.
 */
export class ScrollExperience {
  constructor({ sections, world, cameraController, onSectionChange, onProgress, reducedMotion = false, isNarrow }) {
    this.sections = sections;
    this.world = world;
    this.cameraController = cameraController;
    this.onSectionChange = onSectionChange;
    this.onProgress = onProgress;
    this.reducedMotion = reducedMotion;
    this.isNarrow = isNarrow;
    this.active = -1;
    this.triggers = [];
    this.handleRefresh = () => this.#layoutCamera();
  }

  init() {
    this.#sectionTriggers();
    if (this.world) this.#worldTimelines();
    this.#reveals();
    this.triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => this.onProgress?.(self.progress),
      }),
    );
    ScrollTrigger.addEventListener('refresh', this.handleRefresh);
    ScrollTrigger.refresh();
    this.#layoutCamera();
  }

  refresh() {
    ScrollTrigger.refresh();
  }

  #sectionTriggers() {
    this.sections.forEach((section, index) => {
      this.triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) this.#setActive(index);
          },
        }),
      );
    });
  }

  #setActive(index) {
    if (index === this.active) return;
    const previous = this.active;
    this.active = index;
    this.sections.forEach((s, i) => s.classList.toggle('is-active', i === index));
    this.onSectionChange?.(index, previous);
  }

  /** Scroll positions where the camera arrives at / starts leaving each station. */
  #layoutCamera() {
    if (!this.cameraController) return;
    const vh = window.innerHeight;
    const max = ScrollTrigger.maxScroll(window);
    const tops = this.sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
    const marks = this.sections.map((_, i) => {
      const enter = i === 0 ? 0 : Math.max(0, tops[i] - vh * 0.12);
      const exit = i === this.sections.length - 1 ? max : Math.max(enter, tops[i + 1] - vh * 0.88);
      return { enter: Math.min(enter, max), exit: Math.min(exit, max) };
    });
    const narrow = this.isNarrow();
    const framings = this.sections.map((section, i) => this.#framing(section, marks[i].enter, narrow));
    this.cameraController.setLayout({ width: window.innerWidth, height: vh, narrow }, marks, framings);
    this.world?.setTitleLayout(window.innerWidth / vh < 0.9);
  }

  /**
   * The part of the screen left free by a section's panel when the camera arrives,
   * expressed as a view shift (-0.5…0.5) and available fraction, so the 3D subject is
   * framed beside (wide screens) or above (narrow screens) the text.
   */
  #framing(section, enterScroll, narrow) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const panel = section.querySelector('.scene__panel');
    const side = section.dataset.side;
    let x0 = 0;
    let x1 = vw;
    let y0 = header;
    let y1 = vh;
    if (panel) {
      const r = panel.getBoundingClientRect();
      const top = r.top + window.scrollY - enterScroll;
      if (side === 'bottom') y1 = vh - Math.max(16, vh * 0.04) - r.height - 12;
      else if (narrow) y1 = top - 12;
      else if (side === 'left') x0 = r.right + 24;
      else if (side === 'right') x1 = r.left - 24;
    }
    y1 = Math.min(vh, Math.max(y1, y0 + vh * 0.3));
    x1 = Math.max(x1, x0 + vw * 0.3);
    return {
      shiftX: (x0 + x1) / 2 / vw - 0.5,
      shiftY: (y0 + y1) / 2 / vh - 0.5,
      availX: (x1 - x0) / vw,
      availY: (y1 - y0) / vh,
    };
  }

  #scrub(section, start, end, apply) {
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      onUpdate: () => apply(proxy.p),
      scrollTrigger: { trigger: section, start, end, scrub: this.reducedMotion ? true : 0.6 },
    });
    this.triggers.push(tween.scrollTrigger);
    apply(0);
  }

  #worldTimelines() {
    const byId = Object.fromEntries(this.sections.map((s) => [s.id, s]));
    const world = this.world;
    if (byId.invitation) this.#scrub(byId.invitation, 'top 88%', 'top 12%', (p) => world.setEnvelopeOpen(p));
    if (byId.gallery) this.#scrub(byId.gallery, 'top 85%', 'top 15%', (p) => world.setGalleryReveal(p));
    if (byId.finale) {
      this.#scrub(byId.finale, 'top 45%', 'bottom bottom', (p) => world.setGather(p));
      this.triggers.push(
        ScrollTrigger.create({
          trigger: byId.finale,
          start: 'top 60%',
          end: 'bottom top',
          onToggle: (self) => world.setFinaleActive(self.isActive),
        }),
      );
    }
  }

  /** Panels reveal as their section arrives; reversed when scrolling back up. */
  #reveals() {
    if (this.reducedMotion) return;
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
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
      this.triggers.push(tween.scrollTrigger);
    });
  }

  destroy() {
    ScrollTrigger.removeEventListener('refresh', this.handleRefresh);
    this.triggers.forEach((t) => t?.kill());
    this.triggers = [];
  }
}

export { gsap, ScrollTrigger };
