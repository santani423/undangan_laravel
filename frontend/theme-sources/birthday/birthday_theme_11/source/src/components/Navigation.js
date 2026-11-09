import { scrollToElement } from '../utils/helpers.js';

/**
 * Header navigation: a section trail on wide screens and a menu sheet on small ones.
 * Links are real anchors (#section-id), enhanced with smooth scrolling.
 */
export class Navigation {
  constructor({ trail, menuButton, menu, progress, sections, onNavigate }) {
    this.trail = trail;
    this.menuButton = menuButton;
    this.menu = menu;
    this.progress = progress;
    this.sections = sections;
    this.onNavigate = onNavigate;
    this.links = [];

    const items = sections.map(
      (s, i) => `<li><a href="#${s.id}" data-index="${i}"><span class="trail__dot" aria-hidden="true"></span><span class="trail__label">${s.label}</span></a></li>`,
    );
    trail.innerHTML = `<ol>${items.join('')}</ol>`;
    menu.querySelector('ol').innerHTML = sections
      .map((s, i) => `<li><a href="#${s.id}" data-index="${i}"><span class="menu__step" aria-hidden="true">${i + 1}</span>${s.label}</a></li>`)
      .join('');
    this.links = [...trail.querySelectorAll('a'), ...menu.querySelectorAll('a')];

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      this.closeMenu(false);
      this.goTo(id);
    });

    menuButton.addEventListener('click', () => (this.isOpen ? this.closeMenu() : this.openMenu()));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
    });
    document.addEventListener('pointerdown', (e) => {
      if (this.isOpen && !menu.contains(e.target) && !menuButton.contains(e.target)) this.closeMenu(false);
    });
  }

  get isOpen() {
    return this.menuButton.getAttribute('aria-expanded') === 'true';
  }

  goTo(id) {
    scrollToElement(id);
    this.onNavigate?.(id);
    const target = document.getElementById(id);
    // Move keyboard focus to the section heading without jumping the scroll position.
    const heading = target?.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  }

  openMenu() {
    this.menu.hidden = false;
    this.menuButton.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => this.menu.classList.add('is-open'));
    (this.menu.querySelector('a[aria-current="step"]') ?? this.menu.querySelector('a'))?.focus();
  }

  closeMenu(returnFocus = true) {
    if (!this.isOpen) return;
    this.menuButton.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('is-open');
    this.menu.hidden = true;
    if (returnFocus) this.menuButton.focus();
  }

  setActive(index) {
    for (const link of this.links) {
      if (Number(link.dataset.index) === index) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
  }

  setProgress(p) {
    this.progress.style.transform = `scaleX(${p.toFixed(4)})`;
  }
}
