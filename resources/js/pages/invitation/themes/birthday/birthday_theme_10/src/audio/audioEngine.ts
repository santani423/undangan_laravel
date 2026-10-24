import { invitationConfig } from '../config/invitation.config';

/**
 * Audio for the invitation. Nothing plays until the guest interacts
 * ("Buka Undangan" or the music toggle). If `music.src` is configured it is
 * streamed with an <audio> element; otherwise an original music-box melody is
 * synthesised with the Web Audio API so no third-party recording is needed.
 */

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;

function getContext() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // The reverb impulse is synthesised after the click handler returns so the
  // "Buka Undangan" animation starts without a main-thread stall.
  setTimeout(buildReverb, 0);
  return ctx;
}

/** Short generated room impulse for a soft music-box shimmer. */
function buildReverb() {
  if (!ctx || !master || reverb) return;
  const convolver = ctx.createConvolver();
  const length = Math.floor(ctx.sampleRate * 1.4);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      const decay = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * decay * decay * decay;
    }
  }
  convolver.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.28;
  convolver.connect(wet).connect(master);
  reverb = convolver;
}

/** Call synchronously inside a click handler so browsers allow playback. */
export function unlockAudio() {
  const c = getContext();
  if (c && c.state === 'suspended') void c.resume();
}

/* ------------------------------------------------------------ music box */

// Original 3/4 melody (MIDI notes, null = rest), 6 eighth-notes per bar.
const MELODY: (number | null)[] = [
  76, null, 79, null, 84, null,
  81, null, 79, null, 76, null,
  77, 76, 74, null, 76, null,
  72, null, null, null, 67, null,
  76, null, 79, null, 81, 84,
  86, null, 84, null, 81, null,
  79, 81, 79, 76, 74, 76,
  72, null, null, null, null, null,
];
const CHORDS: [number, number, number][] = [
  [60, 67, 64], [57, 64, 60], [53, 60, 57], [55, 64, 60],
  [60, 67, 64], [53, 60, 57], [55, 62, 59], [60, 67, 64],
];
const STEP = 60 / 96 / 2; // eighth notes at 96 bpm

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function tine(c: AudioContext, out: AudioNode, midi: number, time: number, level: number) {
  const f = midiToHz(midi);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, time);
  env.gain.exponentialRampToValueAtTime(level, time + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, time + 1.7);
  env.connect(out);
  if (reverb) env.connect(reverb);
  const partials: [number, number, OscillatorType][] = [
    [1, 1, 'sine'],
    [2, 0.22, 'sine'],
    [3.01, 0.05, 'triangle'],
  ];
  for (const [ratio, gain, type] of partials) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = f * ratio;
    g.gain.value = gain;
    osc.connect(g).connect(env);
    osc.start(time);
    osc.stop(time + 1.8);
  }
}

class MusicBox {
  private timer = 0;
  private step = 0;
  private nextTime = 0;

  start() {
    const c = getContext();
    if (!c || !master || this.timer) return;
    this.nextTime = c.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
  }

  stop() {
    window.clearInterval(this.timer);
    this.timer = 0;
  }

  private schedule() {
    const c = ctx;
    if (!c || !master) return;
    while (this.nextTime < c.currentTime + 0.25) {
      const i = this.step % MELODY.length;
      const note = MELODY[i];
      if (note !== null) tine(c, master, note, this.nextTime, 0.32);
      const bar = Math.floor(i / 6);
      const beat = i % 6;
      if (beat === 0) tine(c, master, CHORDS[bar][0], this.nextTime, 0.16);
      if (beat === 2 || beat === 4) tine(c, master, CHORDS[bar][beat === 2 ? 1 : 2], this.nextTime, 0.08);
      this.nextTime += STEP;
      this.step++;
    }
  }
}

/* --------------------------------------------------------- controller */

class MusicController {
  private element: HTMLAudioElement | null = null;
  private box = new MusicBox();
  private usingBox = false;

  get hasSource() {
    return Boolean(invitationConfig.music.src) || invitationConfig.music.useGeneratedFallback;
  }

  /** Resolves to `false` when no playable source exists. */
  async play(): Promise<boolean> {
    const { src, volume, useGeneratedFallback } = invitationConfig.music;
    if (src && !this.usingBox) {
      try {
        if (!this.element) {
          this.element = new Audio(src);
          this.element.loop = true;
          this.element.preload = 'auto';
        }
        this.element.volume = volume;
        await this.element.play();
        return true;
      } catch {
        this.element = null;
        if (!useGeneratedFallback) return false;
        this.usingBox = true;
      }
    }
    if (!useGeneratedFallback && !src) return false;
    const c = getContext();
    if (!c || !master) return false;
    if (c.state === 'suspended') await c.resume().catch(() => undefined);
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setTargetAtTime(volume * 0.35, c.currentTime, 0.4);
    this.box.start();
    this.usingBox = true;
    return true;
  }

  pause() {
    this.element?.pause();
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    }
    this.box.stop();
  }
}

export const music = new MusicController();

/* ---------------------------------------------------------------- sfx */

export type SfxName = 'pop' | 'chime' | 'honk' | 'boing';

/** Tiny synthesized interaction sounds (only used while sound is switched on). */
export function playSfx(name: SfxName) {
  const c = getContext();
  if (!c || c.state !== 'running') return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = 0.18;
  out.connect(c.destination);
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.connect(env).connect(out);
  env.gain.setValueAtTime(0.0001, t);
  if (name === 'pop') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(1300, t + 0.08);
    env.gain.exponentialRampToValueAtTime(0.9, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  } else if (name === 'chime') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046, t);
    osc.frequency.setValueAtTime(1318, t + 0.12);
    osc.frequency.setValueAtTime(1568, t + 0.24);
    env.gain.exponentialRampToValueAtTime(0.7, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  } else if (name === 'honk') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(392, t);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    env.gain.setValueAtTime(0.35, t + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(330, t + 0.3);
    env.gain.exponentialRampToValueAtTime(0.8, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
  }
  osc.start(t);
  osc.stop(t + 0.8);
}
