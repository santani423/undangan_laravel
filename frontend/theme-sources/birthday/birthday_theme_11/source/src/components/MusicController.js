import { readPreference, writePreference } from '../utils/helpers.js';

/*
 * Web Audio engine.
 * - Background music: a music-box arrangement of "Happy Birthday to You" (public domain),
 *   synthesised in the browser. A licensed audio file can replace it via config.audio.files.music.
 * - Sound effects: synthesised pops, chimes, whooshes and celebrations, each replaceable by a file.
 * Nothing plays until the visitor interacts with the page (browser autoplay policy).
 */

const midiToHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// [midi note, beats]
const MELODY = [
  [67, 0.75], [67, 0.25],
  [69, 1], [67, 1], [72, 1],
  [71, 2], [67, 0.75], [67, 0.25],
  [69, 1], [67, 1], [74, 1],
  [72, 2], [67, 0.75], [67, 0.25],
  [79, 1], [76, 1], [72, 1],
  [71, 1], [69, 1], [77, 0.75], [77, 0.25],
  [76, 1], [72, 1], [74, 1],
  [72, 3],
];
const LOOP_BEATS = 27; // melody (25 beats) + 2 beats of rest
// Waltz accompaniment: [downbeat, bass note, chord tones]
const HARMONY = [
  [1, 48, [64, 67]],
  [4, 43, [59, 62, 65]],
  [7, 43, [59, 62, 65]],
  [10, 48, [64, 67]],
  [13, 48, [64, 67, 70]],
  [16, 41, [57, 60, 65]],
  [19, 43, [59, 62, 65]],
  [22, 48, [64, 67]],
];
const BPM = 96;

export class MusicController {
  constructor(config) {
    this.config = config.audio;
    this.ctx = null;
    this.buffers = new Map();
    this.loading = new Map();
    this.musicOn = false;
    this.sfxOn = readPreference('lsda:sfx', true);
    this.musicPreference = readPreference('lsda:music', null);
    this.scheduler = null;
    this.nextNoteTime = 0;
    this.noteIndex = 0;
    this.loopStart = 0;
    this.fileSource = null;
    this.listeners = new Set();
    this.noiseBuffer = null;

    const unlock = () => {
      this.ensureContext();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else if (this.musicOn || this.sfxOn) this.ctx.resume().catch(() => {});
    });
  }

  /** True when the visitor has not muted the music before. */
  get musicAllowedByPreference() {
    return this.musicPreference !== false;
  }

  onChange(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  get state() {
    return { music: this.musicOn, sfx: this.sfxOn, supported: this.supported };
  }

  get supported() {
    return typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);
  }

  #emit() {
    for (const listener of this.listeners) listener(this.state);
  }

  ensureContext() {
    if (!this.supported) return null;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.config.effectsVolume ?? 0.6;

      // A soft feedback delay gives the music box a little room sound.
      const delay = this.ctx.createDelay(1);
      delay.delayTime.value = 0.28;
      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.28;
      const tone = this.ctx.createBiquadFilter();
      tone.type = 'lowpass';
      tone.frequency.value = 2400;
      this.musicGain.connect(this.master);
      this.musicGain.connect(delay);
      delay.connect(tone);
      tone.connect(feedback);
      feedback.connect(delay);
      tone.connect(this.master);
      this.sfxGain.connect(this.master);
      this.#preloadFiles();
    }
    if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  #preloadFiles() {
    Object.entries(this.config.files || {}).forEach(([name, url]) => {
      if (url) this.#loadBuffer(name, url);
    });
  }

  #loadBuffer(name, url) {
    if (this.loading.has(name)) return this.loading.get(name);
    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => this.ctx.decodeAudioData(data))
      .then((buffer) => {
        this.buffers.set(name, buffer);
        return buffer;
      })
      .catch((err) => {
        console.warn(`[audio] Could not load "${url}" (${err.message}). Using the built-in synthesised sound instead.`);
        return null;
      });
    this.loading.set(name, promise);
    return promise;
  }

  /* ---------------------------------------------------------------- music */

  async playMusic() {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    try {
      await ctx.resume();
    } catch {
      return false;
    }
    if (ctx.state !== 'running') return false;
    if (this.musicOn) return true;
    this.musicOn = true;
    this.musicPreference = true;
    writePreference('lsda:music', true);

    const target = this.config.musicVolume ?? 0.35;
    this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
    this.musicGain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);

    const fileBuffer = this.config.files?.music ? await this.#loadBuffer('music', this.config.files.music) : null;
    if (!this.musicOn) return false; // paused while loading
    if (fileBuffer) {
      this.fileSource = ctx.createBufferSource();
      this.fileSource.buffer = fileBuffer;
      this.fileSource.loop = true;
      this.fileSource.connect(this.musicGain);
      this.fileSource.start();
    } else {
      this.#startScheduler();
    }
    this.#emit();
    return true;
  }

  pauseMusic({ remember = true } = {}) {
    if (!this.musicOn) return;
    this.musicOn = false;
    if (remember) {
      this.musicPreference = false;
      writePreference('lsda:music', false);
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0, now, 0.15);
    }
    clearInterval(this.scheduler);
    this.scheduler = null;
    if (this.fileSource) {
      const source = this.fileSource;
      setTimeout(() => source.stop(), 600);
      this.fileSource = null;
    }
    this.#emit();
  }

  toggleMusic() {
    return this.musicOn ? (this.pauseMusic(), false) : this.playMusic();
  }

  #startScheduler() {
    const beat = 60 / BPM;
    this.noteIndex = 0;
    this.loopStart = this.ctx.currentTime + 0.1;
    this.nextNoteTime = this.loopStart;
    this.harmonyIndex = 0;
    const lookahead = 0.25;
    const schedule = () => {
      const ctx = this.ctx;
      while (this.nextNoteTime < ctx.currentTime + lookahead) {
        const [note, beats] = MELODY[this.noteIndex];
        this.#musicBoxNote(midiToHz(note), this.nextNoteTime, 0.22, Math.max(0.6, beats * beat * 1.6));
        this.nextNoteTime += beats * beat;
        this.noteIndex++;
        if (this.noteIndex >= MELODY.length) {
          this.noteIndex = 0;
          this.loopStart += LOOP_BEATS * beat;
          this.nextNoteTime = this.loopStart;
        }
      }
      // Accompaniment is scheduled per loop in one go, a little ahead of time.
      while (this.harmonyTime === undefined || this.harmonyTime < ctx.currentTime + lookahead) {
        if (this.harmonyTime === undefined) {
          this.harmonyLoop = this.loopStart;
          this.harmonyIndex = 0;
        }
        const [downbeat, bass, chord] = HARMONY[this.harmonyIndex];
        const t = this.harmonyLoop + downbeat * beat;
        this.#musicBoxNote(midiToHz(bass), t, 0.16, 1.4, 'triangle');
        chord.forEach((n) => {
          this.#musicBoxNote(midiToHz(n), t + beat, 0.045, 0.5);
          this.#musicBoxNote(midiToHz(n), t + beat * 2, 0.045, 0.5);
        });
        this.harmonyTime = t;
        this.harmonyIndex++;
        if (this.harmonyIndex >= HARMONY.length) {
          this.harmonyIndex = 0;
          this.harmonyLoop += LOOP_BEATS * beat;
        }
      }
    };
    this.harmonyTime = undefined;
    schedule();
    this.scheduler = setInterval(schedule, 60);
  }

  #musicBoxNote(freq, time, volume, decay, type = 'sine') {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, time);
    out.gain.exponentialRampToValueAtTime(volume, time + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    out.connect(this.musicGain);
    const partials = type === 'sine' ? [[1, 1], [2, 0.32], [3.01, 0.12]] : [[1, 1]];
    partials.forEach(([ratio, amp]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.value = amp;
      osc.connect(g).connect(out);
      osc.start(time);
      osc.stop(time + decay + 0.05);
    });
  }

  /* ------------------------------------------------------------- effects */

  setSfx(on) {
    this.sfxOn = Boolean(on);
    writePreference('lsda:sfx', this.sfxOn);
    this.#emit();
  }

  toggleSfx() {
    this.setSfx(!this.sfxOn);
    if (this.sfxOn) this.play('pop');
    return this.sfxOn;
  }

  /** name: 'pop' | 'chime' | 'whoosh' | 'celebration' | 'blow' | 'firework' | 'puff' */
  play(name, { volume = 1 } = {}) {
    if (!this.sfxOn) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const buffer = this.buffers.get(name);
    if (buffer) {
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      g.gain.value = volume;
      src.buffer = buffer;
      src.connect(g).connect(this.sfxGain);
      src.start();
      return;
    }
    const t = ctx.currentTime + 0.01;
    switch (name) {
      case 'pop':
        this.#tone({ t, from: 380, to: 1100, dur: 0.11, vol: 0.35 * volume });
        break;
      case 'chime':
        [1047, 1319, 1568].forEach((f, i) => this.#bell(f, t + i * 0.07, 0.16 * volume, 1.1));
        break;
      case 'whoosh':
        this.#noise({ t, dur: 0.55, vol: 0.18 * volume, from: 300, to: 2200, q: 0.9 });
        break;
      case 'celebration':
        [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.#bell(f, t + i * 0.06, 0.14 * volume, 0.9));
        for (let i = 0; i < 6; i++) this.#noise({ t: t + 0.35 + i * 0.09, dur: 0.06, vol: 0.08 * volume, from: 4000, to: 6000, q: 2 });
        break;
      case 'blow':
        this.#noise({ t, dur: 0.75, vol: 0.28 * volume, from: 900, to: 300, q: 0.4, type: 'lowpass' });
        break;
      case 'puff':
        this.#noise({ t, dur: 0.25, vol: 0.12 * volume, from: 1500, to: 500, q: 0.6 });
        break;
      case 'firework':
        this.#tone({ t, from: 140, to: 40, dur: 0.35, vol: 0.25 * volume });
        for (let i = 0; i < 5; i++) this.#noise({ t: t + 0.05 + i * 0.07, dur: 0.08, vol: 0.06 * volume, from: 3000, to: 5000, q: 1.5 });
        break;
      default:
        break;
    }
  }

  #tone({ t, from, to, dur, vol, type = 'sine' }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  #bell(freq, t, vol, decay) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.sfxGain);
    [[1, 1], [2.76, 0.25], [5.4, 0.08]].forEach(([ratio, amp]) => {
      const osc = ctx.createOscillator();
      const pg = ctx.createGain();
      osc.frequency.value = freq * ratio;
      pg.gain.value = amp;
      osc.connect(pg).connect(g);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    });
  }

  #noise({ t, dur, vol, from, to, q = 1, type = 'bandpass' }) {
    const ctx = this.ctx;
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.04, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }
}
