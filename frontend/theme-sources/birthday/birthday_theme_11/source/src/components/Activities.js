import { Dialog } from './Dialog.js';
import { assetUrl, escapeHtml } from '../utils/helpers.js';
import { formatClock } from '../utils/date.js';

/** Illustration for each activity icon. Supplied SVGs where they exist, two new ones in the same style. */
export const ACTIVITY_ICONS = {
  games: '/assets/images/icons/games.svg',
  dental: '/assets/images/toothbrush.svg',
  photo: '/assets/images/icons/camera.svg',
  cake: '/assets/images/birthday-cake.svg',
  gift: '/assets/images/gift-box.svg',
  balloons: '/assets/images/balloons.svg',
};
const FALLBACK_ICON = '/assets/images/tooth-friend.svg';

/** Activity cards (section 4) and the detail sheet they open. */
export class Activities {
  constructor({ list, dialogElement, activities, locale, onOpen }) {
    this.list = list;
    this.activities = activities;
    this.locale = locale;
    this.onOpen = onOpen;
    this.index = 0;
    this.dialog = new Dialog(dialogElement);
    this.parts = {
      art: dialogElement.querySelector('[data-activity-art]'),
      time: dialogElement.querySelector('[data-activity-time]'),
      title: dialogElement.querySelector('[data-activity-title]'),
      details: dialogElement.querySelector('[data-activity-details]'),
      prev: dialogElement.querySelector('[data-activity-prev]'),
      next: dialogElement.querySelector('[data-activity-next]'),
      count: dialogElement.querySelector('[data-activity-count]'),
    };
    this.parts.prev.addEventListener('click', () => this.#show(this.index - 1));
    this.parts.next.addEventListener('click', () => this.#show(this.index + 1));
    this.#render();
  }

  icon(activity) {
    return assetUrl(ACTIVITY_ICONS[activity.icon] ?? FALLBACK_ICON);
  }

  time(activity) {
    return activity.time ? formatClock(activity.time, this.locale) : '';
  }

  #render() {
    this.list.innerHTML = this.activities
      .map(
        (a) => `
        <li>
          <button type="button" class="activity-card" data-activity="${escapeHtml(a.id)}" aria-haspopup="dialog">
            <img class="activity-card__art" src="${this.icon(a)}" alt="" width="64" height="64" loading="lazy">
            <span class="activity-card__text">
              ${a.time ? `<span class="activity-card__time">${escapeHtml(this.time(a))}</span>` : ''}
              <span class="activity-card__title">${escapeHtml(a.title)}</span>
              <span class="activity-card__summary">${escapeHtml(a.summary)}</span>
            </span>
          </button>
        </li>`,
      )
      .join('');
    this.list.addEventListener('click', (e) => {
      const card = e.target.closest('[data-activity]');
      if (card) this.open(card.dataset.activity, card);
    });
  }

  open(id, opener) {
    const index = this.activities.findIndex((a) => a.id === id);
    if (index < 0) return;
    this.#show(index);
    this.dialog.open(opener ?? this.list.querySelector(`[data-activity="${CSS.escape(id)}"]`));
  }

  #show(index) {
    const n = this.activities.length;
    this.index = (index + n) % n;
    const a = this.activities[this.index];
    this.parts.art.src = this.icon(a);
    this.parts.time.textContent = this.time(a);
    this.parts.time.hidden = !a.time;
    this.parts.title.textContent = a.title;
    this.parts.details.textContent = a.details || a.summary;
    this.parts.count.textContent = `${this.index + 1} of ${n}`;
    this.parts.prev.hidden = this.parts.next.hidden = n < 2;
    this.onOpen?.(a.id);
  }
}
