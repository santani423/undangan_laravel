import { domConfetti } from './Toast.js';

/*
 * "Make a wish" interaction for section 6.
 * Works with a button tap (always) or, optionally, by blowing into the microphone.
 * The microphone is only requested after the guest presses "Blow into the microphone",
 * audio never leaves the device, and the stream is stopped as soon as we're done.
 */
export class CakeInteraction {
  constructor({ root, world, audio, toast, config }) {
    this.root = root;
    this.world = world;
    this.audio = audio;
    this.toast = toast;
    this.name = config.child.name;
    this.candleCount = Math.max(1, Math.min(12, Math.round(config.child.age)));
    this.virtualLit = this.candleCount; // used when there is no 3D cake
    this.blown = false;
    this.busy = false;
    this.mic = null;

    this.wishButton = root.querySelector('[data-cake-wish]');
    this.micButton = root.querySelector('[data-cake-mic]');
    this.relightButton = root.querySelector('[data-cake-relight]');
    this.status = root.querySelector('[data-cake-status]');
    this.meter = root.querySelector('[data-mic-meter]');

    this.wishButton.addEventListener('click', () => this.wish());
    this.relightButton.addEventListener('click', () => this.relight());
    this.micButton.addEventListener('click', () => (this.mic ? this.stopMic('stopped') : this.startMic()));
    if (!navigator.mediaDevices?.getUserMedia) {
      this.micButton.hidden = true;
    }
  }

  #setStatus(text) {
    this.status.textContent = text;
  }

  #syncButtons() {
    this.wishButton.hidden = this.blown;
    this.relightButton.hidden = !this.blown;
    this.micButton.disabled = this.blown;
  }

  async wish() {
    if (this.blown || this.busy) return;
    this.busy = true;
    this.stopMic('silent');
    this.audio.play('blow');
    this.#setStatus('Whoosh…');
    if (this.world) {
      await this.world.blowCandles();
    } else {
      this.virtualLit = 0;
      domConfetti(this.wishButton, { amount: 80 });
    }
    this.#celebrate();
    this.busy = false;
  }

  #celebrate() {
    this.blown = true;
    this.audio.play('celebration');
    this.root.classList.add('is-blown');
    this.#setStatus(`All ${this.candleCount} candles are out. Your wish is on its way. Happy birthday, ${this.name}!`);
    this.#syncButtons();
    this.relightButton.focus({ preventScroll: true });
  }

  relight() {
    this.world?.relightCandles();
    this.virtualLit = this.candleCount;
    this.blown = false;
    this.root.classList.remove('is-blown');
    this.audio.play('chime');
    this.#setStatus('The candles are lit again. Ready for another wish?');
    this.#syncButtons();
    this.wishButton.focus({ preventScroll: true });
  }

  /** Resets without sounds or focus changes (used by "Replay"). */
  reset() {
    this.stopMic('silent');
    this.world?.relightCandles();
    this.virtualLit = this.candleCount;
    this.blown = false;
    this.root.classList.remove('is-blown');
    this.#setStatus('');
    this.#syncButtons();
  }

  async startMic() {
    if (this.blown || this.mic) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioCtx) {
      this.#setStatus('This browser can’t use a microphone here. Tap “Make a wish” instead.');
      return;
    }
    this.micButton.disabled = true;
    this.#setStatus('Asking for microphone permission…');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (err) {
      this.micButton.disabled = false;
      this.#setStatus(
        err?.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Tap “Make a wish” to blow out the candles instead.'
          : 'No microphone was found. Tap “Make a wish” to blow out the candles instead.',
      );
      return;
    }
    const ctx = this.audio.ensureContext() ?? new AudioCtx();
    try {
      await ctx.resume();
    } catch {
      /* ignore */
    }
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    this.mic = { stream, source, analyser, raf: 0, started: performance.now(), last: performance.now(), baseline: 0.01, samples: 0, blowTime: 0 };
    this.micButton.disabled = false;
    this.micButton.textContent = 'Stop listening';
    this.micButton.setAttribute('aria-pressed', 'true');
    this.root.classList.add('is-listening');
    this.#setStatus('Listening… take a big breath and blow towards your microphone!');

    const loop = (now) => {
      const mic = this.mic;
      if (!mic) return;
      const dt = Math.min(0.1, (now - mic.last) / 1000);
      mic.last = now;
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const elapsed = now - mic.started;
      if (elapsed < 500) {
        // Calibrate to the room's background noise first.
        mic.baseline = (mic.baseline * mic.samples + rms) / ++mic.samples;
      }
      const threshold = Math.max(0.05, mic.baseline * 3.2);
      this.meter.style.setProperty('--level', Math.min(1, rms / (threshold * 1.6)).toFixed(3));
      if (elapsed >= 500 && rms > threshold) {
        mic.blowTime += dt;
        if (mic.blowTime >= 0.16) {
          mic.blowTime = 0;
          this.audio.play('puff');
          const remaining = this.world ? this.world.blowOneCandle() : --this.virtualLit;
          if (remaining <= 0) {
            this.stopMic('silent');
            if (this.world) this.world.celebrate(5, { amount: 220 });
            else domConfetti(this.wishButton, { amount: 80 });
            this.#celebrate();
            return;
          }
          this.#setStatus(`${remaining} ${remaining === 1 ? 'candle' : 'candles'} still glowing. Keep blowing!`);
        }
      }
      if (elapsed > 20000) {
        this.stopMic('timeout');
        return;
      }
      mic.raf = requestAnimationFrame(loop);
    };
    this.mic.raf = requestAnimationFrame(loop);
  }

  /** reason: 'stopped' | 'timeout' | 'silent' */
  stopMic(reason = 'stopped') {
    const mic = this.mic;
    if (!mic) return;
    cancelAnimationFrame(mic.raf);
    mic.source.disconnect();
    mic.stream.getTracks().forEach((t) => t.stop());
    this.mic = null;
    this.micButton.textContent = 'Blow into the microphone';
    this.micButton.setAttribute('aria-pressed', 'false');
    this.root.classList.remove('is-listening');
    this.meter.style.setProperty('--level', '0');
    if (reason === 'timeout') this.#setStatus('We didn’t hear a puff. Try again, or tap “Make a wish”.');
    if (reason === 'stopped') this.#setStatus('Microphone off. Tap “Make a wish” whenever you’re ready.');
  }
}
