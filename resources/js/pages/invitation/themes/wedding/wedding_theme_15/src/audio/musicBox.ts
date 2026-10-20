/**
 * Generative "music box" played with the Web Audio API.
 * The melody is original and synthesised in the browser, so no audio file or licence is needed.
 * Swap in a licensed track via `wedding.music.src` if preferred.
 */

// Gentle I–vi–IV–V progression in C major, written as scale degrees of a two-octave pentatonic-ish set.
const NOTE = (semitone: number) => 261.63 * Math.pow(2, semitone / 12)
const MELODY: Array<[number | null, number]> = [
  // [semitone from C4 or null = rest, length in eighths]
  [7, 2], [12, 2], [11, 1], [12, 1], [14, 2],
  [12, 2], [9, 2], [7, 4],
  [5, 2], [9, 2], [7, 1], [9, 1], [12, 2],
  [11, 2], [7, 2], [null, 4],
  [7, 2], [12, 2], [14, 1], [16, 1], [17, 2],
  [16, 2], [14, 1], [12, 1], [9, 4],
  [9, 2], [7, 2], [5, 1], [4, 1], [5, 2],
  [7, 6], [null, 2],
]
const CHORDS = [
  [0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2],
  [0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2],
]
const EIGHTH = 60 / 76 / 2

export class MusicBox {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private wet: GainNode | null = null
  private timer: number | null = null
  private nextTime = 0
  private step = 0
  private bar = 0
  private barTime = 0

  private ensure() {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // Small synthetic reverb: decaying stereo noise impulse.
    const len = Math.floor(ctx.sampleRate * 2.6)
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
    }
    const reverb = ctx.createConvolver()
    reverb.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    wet.connect(reverb)
    reverb.connect(master)

    this.ctx = ctx
    this.master = master
    this.wet = wet
    return ctx
  }

  private pluck(freq: number, t: number, gain: number, decay: number) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    out.gain.setValueAtTime(0, t)
    out.gain.linearRampToValueAtTime(gain, t + 0.006)
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    out.connect(this.master!)
    out.connect(this.wet!)
    for (const [mult, type, g] of [
      [1, 'sine', 1],
      [2, 'triangle', 0.18],
      [4.02, 'sine', 0.06],
    ] as const) {
      const osc = ctx.createOscillator()
      const og = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq * mult
      og.gain.value = g
      osc.connect(og)
      og.connect(out)
      osc.start(t)
      osc.stop(t + decay + 0.05)
    }
  }

  private schedule = () => {
    const ctx = this.ctx!
    while (this.nextTime < ctx.currentTime + 0.6) {
      const [note, len] = MELODY[this.step]
      if (note !== null) this.pluck(NOTE(note), this.nextTime, 0.16, 1.6)
      // Soft chord on each bar (8 eighths).
      if (this.nextTime >= this.barTime - 1e-4) {
        for (const s of CHORDS[this.bar % CHORDS.length]) this.pluck(NOTE(s - 12), this.barTime, 0.05, 3.2)
        this.bar++
        this.barTime += EIGHTH * 8
      }
      this.nextTime += EIGHTH * len
      this.step = (this.step + 1) % MELODY.length
      if (this.step === 0) {
        // Re-align bars with the melody loop to avoid drift.
        this.barTime = this.nextTime
        this.bar = 0
      }
    }
  }

  async play() {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
    if (this.timer === null) {
      this.nextTime = ctx.currentTime + 0.1
      this.barTime = this.nextTime
      this.step = 0
      this.bar = 0
      this.timer = window.setInterval(this.schedule, 150)
      this.schedule()
    }
    const g = this.master!.gain
    g.cancelScheduledValues(ctx.currentTime)
    g.setValueAtTime(g.value, ctx.currentTime)
    g.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5)
  }

  pause() {
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const g = this.master.gain
    g.cancelScheduledValues(ctx.currentTime)
    g.setValueAtTime(g.value, ctx.currentTime)
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    window.setTimeout(() => {
      if (this.timer !== null) {
        window.clearInterval(this.timer)
        this.timer = null
      }
      void ctx.suspend()
    }, 550)
  }
}
