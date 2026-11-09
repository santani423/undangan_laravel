/**
 * Background audio controller.
 * - If a licensed track is configured, it plays that file (looped).
 * - Otherwise it synthesises an original, quiet slendro-scale metallophone texture with the
 *   Web Audio API (inharmonic partials + slow "ombak" beating + a soft gong every cycle).
 * Playback only starts from a user gesture (the "Buka Undangan" button or the music toggle).
 */
type Listener = (playing: boolean) => void

// Slendro is roughly five near-equal steps per octave (~240 cents).
const SLENDRO = [0, 240, 480, 720, 960].map((c) => Math.pow(2, c / 1200))
const BASE = 261.6
// A slow, cyclic balungan-like phrase (scale degrees, octave shifts as +5)
const PHRASE = [2, 1, 2, 3, 5, 3, 2, 1, 3, 5, 6, 5, 3, 2, 1, 2]
const BEAT = 0.92 // seconds

export class AmbientAudio {
  private el: HTMLAudioElement | null = null
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer = 0
  private nextTime = 0
  private step = 0
  private listeners = new Set<Listener>()
  playing = false
  readonly src: string | null

  constructor(src: string | null) {
    this.src = src
  }

  onChange(l: Listener) {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }

  private emit() {
    this.listeners.forEach((l) => l(this.playing))
  }

  async play(): Promise<boolean> {
    try {
      if (this.src) {
        if (!this.el) {
          this.el = new Audio(this.src)
          this.el.loop = true
          this.el.volume = 0.55
          this.el.preload = 'auto'
        }
        await this.el.play()
      } else {
        await this.startSynth()
      }
      this.playing = true
    } catch {
      this.playing = false
    }
    this.emit()
    return this.playing
  }

  pause() {
    if (this.el) this.el.pause()
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(t)
      this.master.gain.setTargetAtTime(0, t, 0.25)
      window.clearInterval(this.timer)
      this.timer = 0
      const ctx = this.ctx
      window.setTimeout(() => {
        if (!this.playing) void ctx.suspend().catch(() => undefined)
      }, 900)
    }
    this.playing = false
    this.emit()
  }

  toggle() {
    return this.playing ? (this.pause(), Promise.resolve(false)) : this.play()
  }

  dispose() {
    window.clearInterval(this.timer)
    this.el?.pause()
    this.el = null
    void this.ctx?.close().catch(() => undefined)
    this.ctx = null
    this.listeners.clear()
  }

  /* ───────────── generative synth ───────────── */

  private async startSynth() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) throw new Error('Web Audio unavailable')
    if (!this.ctx) {
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      const reverb = this.ctx.createConvolver()
      reverb.buffer = this.impulse(this.ctx, 2.8)
      const wet = this.ctx.createGain()
      wet.gain.value = 0.35
      this.master.connect(this.ctx.destination)
      this.master.connect(reverb)
      reverb.connect(wet)
      wet.connect(this.ctx.destination)
    }
    await this.ctx.resume()
    const t = this.ctx.currentTime
    this.master!.gain.cancelScheduledValues(t)
    this.master!.gain.setTargetAtTime(0.16, t, 0.6)
    this.nextTime = t + 0.15
    window.clearInterval(this.timer)
    this.timer = window.setInterval(() => this.schedule(), 120)
    this.schedule()
  }

  private schedule() {
    const ctx = this.ctx
    if (!ctx) return
    while (this.nextTime < ctx.currentTime + 0.5) {
      const deg = PHRASE[this.step % PHRASE.length]
      const octave = deg > 5 ? 2 : 1
      const ratio = SLENDRO[(deg - 1) % 5] * octave
      this.strike(BASE * ratio, this.nextTime, 0.5, 2.6) // saron-like
      if (this.step % 2 === 1) this.strike(BASE * 2 * ratio, this.nextTime + BEAT / 2, 0.18, 1.4) // light peking
      if (this.step % PHRASE.length === PHRASE.length - 1) this.gong(this.nextTime + BEAT * 0.9)
      this.step++
      this.nextTime += BEAT
    }
  }

  private strike(freq: number, when: number, gain: number, decay: number) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, when)
    out.gain.exponentialRampToValueAtTime(gain, when + 0.008)
    out.gain.exponentialRampToValueAtTime(0.0001, when + decay)
    out.connect(this.master!)
    // inharmonic metallophone partials; two slightly detuned fundamentals give gamelan "ombak" shimmer
    const partials: [number, number][] = [[1, 1], [1.006, 0.8], [2.76, 0.28], [5.4, 0.1]]
    for (const [mult, amp] of partials) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * mult
      g.gain.value = amp
      osc.connect(g)
      g.connect(out)
      osc.start(when)
      osc.stop(when + decay + 0.05)
    }
  }

  private gong(when: number) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, when)
    out.gain.exponentialRampToValueAtTime(0.55, when + 0.05)
    out.gain.exponentialRampToValueAtTime(0.0001, when + 7)
    out.connect(this.master!)
    for (const [f, a] of [[65.4, 1], [66.1, 0.8], [130.8, 0.25]] as [number, number][]) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.frequency.value = f
      g.gain.value = a
      osc.connect(g)
      g.connect(out)
      osc.start(when)
      osc.stop(when + 7.2)
    }
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    }
    return buf
  }
}
