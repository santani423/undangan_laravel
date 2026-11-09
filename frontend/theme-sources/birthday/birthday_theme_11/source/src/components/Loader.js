/** Full-screen loading screen with a real progress bar and status messages. */
export class Loader {
  constructor(root) {
    this.root = root;
    this.bar = root.querySelector('[data-loader-bar]');
    this.meter = root.querySelector('[role="progressbar"]');
    this.status = root.querySelector('[data-loader-status]');
    this.value = 0;
  }

  set(progress, message) {
    this.value = Math.max(this.value, Math.min(1, progress));
    const pct = Math.round(this.value * 100);
    this.bar.style.transform = `scaleX(${this.value})`;
    this.meter.setAttribute('aria-valuenow', String(pct));
    if (message) this.status.textContent = message;
  }

  /** Fades the loader out and removes it from the accessibility tree. */
  finish() {
    this.set(1, 'Ready!');
    return new Promise((resolve) => {
      this.root.classList.add('is-done');
      document.body.classList.remove('is-loading');
      const done = () => {
        this.root.hidden = true;
        resolve();
      };
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) done();
      else setTimeout(done, 700);
    });
  }
}
