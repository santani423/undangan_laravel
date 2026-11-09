import { Dialog } from './Dialog.js';
import { assetUrl, escapeHtml, prefersReducedMotion } from '../utils/helpers.js';

const MISSING_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="#e8f6fb"/><text x="300" y="310" font-family="Nunito, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2d94c6">Photo not found</text></svg>',
  );

/** Polaroid grid with a keyboard- and swipe-friendly lightbox. */
export class Gallery {
  constructor({ grid, dialogElement, photos, onOpen }) {
    this.grid = grid;
    this.photos = photos;
    this.onOpen = onOpen;
    this.index = 0;
    this.dialog = new Dialog(dialogElement);
    this.img = dialogElement.querySelector('[data-lightbox-img]');
    this.caption = dialogElement.querySelector('[data-lightbox-caption]');
    this.count = dialogElement.querySelector('[data-lightbox-count]');
    this.prevButton = dialogElement.querySelector('[data-lightbox-prev]');
    this.nextButton = dialogElement.querySelector('[data-lightbox-next]');

    this.prevButton.addEventListener('click', () => this.show(this.index - 1));
    this.nextButton.addEventListener('click', () => this.show(this.index + 1));
    dialogElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.show(this.index - 1);
      else if (e.key === 'ArrowRight') this.show(this.index + 1);
      else if (e.key === 'Home') this.show(0);
      else if (e.key === 'End') this.show(this.photos.length - 1);
      else return;
      e.preventDefault();
    });
    this.img.addEventListener('error', () => {
      if (this.img.src !== MISSING_PHOTO) this.img.src = MISSING_PHOTO;
    });
    this.#swipe(dialogElement.querySelector('.lightbox__figure'));
    this.#render();
  }

  #render() {
    const n = this.photos.length;
    this.grid.innerHTML = this.photos
      .map((p, i) => {
        const tilt = [-3, 2, -1.5, 3, -2.5, 1.5][i % 6];
        return `
        <li>
          <button type="button" class="photo-frame" data-index="${i}" style="--tilt:${tilt}deg" aria-haspopup="dialog"
            aria-label="Open photo ${i + 1} of ${n}: ${escapeHtml(p.caption || p.alt)}">
            <span class="photo-frame__img"><img src="${assetUrl(p.src)}" alt="${escapeHtml(p.alt)}" loading="lazy" width="400" height="400"></span>
            <span class="photo-frame__caption">${escapeHtml(p.caption || '')}</span>
          </button>
        </li>`;
      })
      .join('');
    this.grid.addEventListener('click', (e) => {
      const frame = e.target.closest('.photo-frame');
      if (frame) this.open(Number(frame.dataset.index), frame);
    });
    this.grid.querySelectorAll('img').forEach((img) =>
      img.addEventListener('error', () => {
        img.src = MISSING_PHOTO;
        img.closest('.photo-frame')?.classList.add('is-missing');
      }),
    );

    // Gentle 3D tilt that follows the pointer (mouse/pen only, never with reduced motion).
    if (!prefersReducedMotion() && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.grid.addEventListener('pointermove', (e) => {
        const frame = e.target.closest('.photo-frame');
        if (!frame) return;
        const r = frame.getBoundingClientRect();
        frame.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
        frame.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`);
      });
      this.grid.addEventListener(
        'pointerleave',
        (e) => {
          const frame = e.target.closest?.('.photo-frame');
          frame?.style.removeProperty('--rx');
          frame?.style.removeProperty('--ry');
        },
        true,
      );
    }
  }

  #swipe(surface) {
    let start = null;
    surface.addEventListener('pointerdown', (e) => (start = { x: e.clientX, y: e.clientY }));
    surface.addEventListener('pointerup', (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) this.show(this.index + (dx < 0 ? 1 : -1));
    });
    surface.addEventListener('pointercancel', () => (start = null));
  }

  open(index, opener) {
    this.show(index);
    this.dialog.open(opener ?? this.grid.querySelector(`[data-index="${index}"]`));
  }

  show(index) {
    const n = this.photos.length;
    this.index = (index + n) % n;
    const photo = this.photos[this.index];
    this.img.src = assetUrl(photo.src);
    this.img.alt = photo.alt;
    this.caption.textContent = photo.caption || photo.alt;
    this.count.textContent = `${this.index + 1} / ${n}`;
    this.prevButton.hidden = this.nextButton.hidden = n < 2;
    // Preload neighbours for instant navigation.
    [this.index - 1, this.index + 1].forEach((i) => {
      const p = this.photos[(i + n) % n];
      if (p) new Image().src = assetUrl(p.src);
    });
    this.onOpen?.(this.index);
  }
}
