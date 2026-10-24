import { getCountdown } from '../utils/date.js';

const UNITS = [
  ['days', 'days', 'day'],
  ['hours', 'hours', 'hour'],
  ['minutes', 'minutes', 'minute'],
  ['seconds', 'seconds', 'second'],
];

const STATUS_TEXT = {
  live: 'The party is happening right now!',
  ended: 'The party has ended. Thank you for celebrating with us!',
};

/**
 * Renders a live countdown into every element matching [data-countdown].
 * One interval drives all instances. `clock()` can be overridden for previews/tests.
 */
export class Countdown {
  constructor(range, { roots, clock = () => Date.now(), onStatusChange } = {}) {
    this.range = range;
    this.clock = clock;
    this.onStatusChange = onStatusChange;
    this.status = null;
    this.timer = null;
    this.instances = roots.map((root) => this.#render(root));
    this.tick = this.tick.bind(this);
  }

  #render(root) {
    root.classList.add('countdown');
    root.setAttribute('role', 'timer');
    root.innerHTML = `
      <ol class="countdown__units">
        ${UNITS.map(
          ([key]) => `
          <li class="countdown__unit">
            <span class="countdown__value" data-unit="${key}">00</span>
            <span class="countdown__label" data-label="${key}">${key}</span>
          </li>`,
        ).join('')}
      </ol>
      <p class="countdown__status" hidden></p>`;
    return {
      root,
      list: root.querySelector('.countdown__units'),
      status: root.querySelector('.countdown__status'),
      values: Object.fromEntries(UNITS.map(([key]) => [key, root.querySelector(`[data-unit="${key}"]`)])),
      labels: Object.fromEntries(UNITS.map(([key]) => [key, root.querySelector(`[data-label="${key}"]`)])),
    };
  }

  start() {
    this.stop();
    if (this.tick().status === 'ended') return; // nothing left to count
    // Align ticks to the next whole second so every instance flips together.
    const delay = 1000 - (this.clock() % 1000);
    this.timer = setTimeout(() => {
      if (this.tick().status === 'ended') return;
      this.timer = setInterval(this.tick, 1000);
    }, delay);
  }

  stop() {
    clearTimeout(this.timer);
    clearInterval(this.timer);
    this.timer = null;
  }

  tick() {
    const state = getCountdown(this.range, this.clock());
    for (const inst of this.instances) {
      for (const [key, plural, singular] of UNITS) {
        const value = state[key];
        const text = key === 'days' ? String(value) : String(value).padStart(2, '0');
        if (inst.values[key].textContent !== text) inst.values[key].textContent = text;
        const label = value === 1 ? singular : plural;
        if (inst.labels[key].textContent !== label) inst.labels[key].textContent = label;
      }
      const upcoming = state.status === 'upcoming';
      inst.list.hidden = !upcoming;
      inst.status.hidden = upcoming;
      if (!upcoming) inst.status.textContent = STATUS_TEXT[state.status];
      inst.root.setAttribute(
        'aria-label',
        upcoming
          ? `${state.days} days, ${state.hours} hours and ${state.minutes} minutes until the party`
          : STATUS_TEXT[state.status],
      );
      inst.root.dataset.status = state.status;
    }
    if (state.status !== this.status) {
      this.status = state.status;
      this.onStatusChange?.(state.status);
      if (state.status === 'ended') this.stop();
    }
    return state;
  }
}
