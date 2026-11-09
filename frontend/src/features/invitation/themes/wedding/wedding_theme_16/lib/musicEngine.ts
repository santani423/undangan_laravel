/**
 * Background-music engines. Both must be started from a user gesture
 * (browsers block autoplay); the MusicProvider guarantees that.
 */
export interface MusicEngine {
    readonly kind: 'file' | 'synth';
    play(): Promise<void>;
    pause(): void;
    setVolume(volume: number): void;
    setMuted(muted: boolean): void;
    dispose(): void;
}

/** Plays the invitation's uploaded audio file. */
export class FileMusicEngine implements MusicEngine {
    readonly kind = 'file' as const;
    private audio: HTMLAudioElement;

    constructor(src: string, volume: number, loop: boolean, onError: () => void) {
        this.audio = new Audio(src);
        this.audio.loop = loop;
        this.audio.preload = 'auto';
        this.audio.volume = volume;
        this.audio.addEventListener('error', onError);
    }

    play(): Promise<void> {
        return this.audio.play();
    }

    pause(): void {
        this.audio.pause();
    }

    setVolume(volume: number): void {
        this.audio.volume = Math.min(1, Math.max(0, volume));
    }

    setMuted(muted: boolean): void {
        this.audio.muted = muted;
    }

    dispose(): void {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
    }
}

// ---------------------------------------------------------------------------
// Original generative "music box in a garden" piece (no audio file needed)
// ---------------------------------------------------------------------------

interface Chord {
    bass: number;
    tones: number[];
}

// F major — D minor — B♭ major — C (MIDI note numbers).
const PROGRESSION: Chord[] = [
    { bass: 41, tones: [53, 57, 60, 64] },
    { bass: 38, tones: [50, 53, 57, 60] },
    { bass: 46, tones: [46, 50, 53, 57] },
    { bass: 36, tones: [48, 52, 55, 58] },
];

const PATTERNS: (number | null)[][] = [
    [0, 1, 2, 3, 2, 1, 3, 2],
    [0, 2, 3, null, 2, 1, 3, null],
];

const TEMPO = 66;
const STEP = 60 / TEMPO / 2; // eighth notes
const LOOKAHEAD = 0.4;

const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12);

type AudioContextCtor = typeof AudioContext;

export class AmbientSynthEngine implements MusicEngine {
    readonly kind = 'synth' as const;
    private ctx: AudioContext;
    private master: GainNode;
    private bus: GainNode;
    private timer: number | null = null;
    private step = 0;
    private nextTime = 0;
    private volume: number;
    private muted = false;

    constructor(volume: number) {
        const Ctor: AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioContextCtor }).webkitAudioContext;
        this.ctx = new Ctor();
        this.volume = volume;

        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.ctx.destination);

        this.bus = this.ctx.createGain();
        this.bus.gain.value = 0.9;
        this.bus.connect(this.master);

        // Soft echo for a spacious, garden-like ambience.
        const delay = this.ctx.createDelay(2);
        delay.delayTime.value = STEP * 3;
        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.32;
        const tone = this.ctx.createBiquadFilter();
        tone.type = 'lowpass';
        tone.frequency.value = 2200;
        const wet = this.ctx.createGain();
        wet.gain.value = 0.28;
        this.bus.connect(delay);
        delay.connect(tone);
        tone.connect(feedback);
        feedback.connect(delay);
        tone.connect(wet);
        wet.connect(this.master);
    }

    private targetGain(): number {
        return this.muted ? 0 : this.volume * 0.85;
    }

    private bell(frequency: number, time: number, velocity: number): void {
        const envelope = this.ctx.createGain();
        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(velocity, time + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.0001, time + 1.9);
        envelope.connect(this.bus);
        const partials: [number, number][] = [
            [1, 1],
            [2, 0.2],
            [3.01, 0.06],
        ];
        for (const [ratio, level] of partials) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequency * ratio;
            const gain = this.ctx.createGain();
            gain.gain.value = level;
            osc.connect(gain);
            gain.connect(envelope);
            osc.start(time);
            osc.stop(time + 2);
        }
    }

    private pad(chord: Chord, time: number, duration: number): void {
        const envelope = this.ctx.createGain();
        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(0.045, time + 1.4);
        envelope.gain.setValueAtTime(0.045, time + duration - 0.4);
        envelope.gain.linearRampToValueAtTime(0, time + duration + 0.9);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 850;
        filter.connect(envelope);
        envelope.connect(this.bus);

        const voices = [...chord.tones.slice(0, 3).map((n) => n - 12), chord.bass];
        voices.forEach((note, i) => {
            const osc = this.ctx.createOscillator();
            osc.type = i === voices.length - 1 ? 'sine' : 'triangle';
            osc.frequency.value = midiToHz(note);
            osc.detune.value = (i % 2 === 0 ? 1 : -1) * 5;
            osc.connect(filter);
            osc.start(time);
            osc.stop(time + duration + 1);
        });
    }

    private schedule = () => {
        while (this.nextTime < this.ctx.currentTime + LOOKAHEAD) {
            const bar = Math.floor(this.step / 8);
            const position = this.step % 8;
            const chord = PROGRESSION[bar % PROGRESSION.length];
            if (position === 0) this.pad(chord, this.nextTime, STEP * 8);
            const index = PATTERNS[bar % PATTERNS.length][position];
            if (index !== null) {
                const accent = position === 0 ? 0.16 : 0.1;
                this.bell(midiToHz(chord.tones[index] + 12), this.nextTime, accent);
            }
            if (position === 0 && bar % 4 === 3) this.bell(midiToHz(chord.tones[3] + 24), this.nextTime + STEP * 0.5, 0.06);
            this.nextTime += STEP;
            this.step += 1;
        }
    };

    async play(): Promise<void> {
        await this.ctx.resume();
        this.nextTime = this.ctx.currentTime + 0.08;
        if (this.timer === null) this.timer = window.setInterval(this.schedule, 100);
        this.schedule();
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setTargetAtTime(this.targetGain(), this.ctx.currentTime, 0.4);
    }

    pause(): void {
        if (this.timer !== null) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
        this.master.gain.cancelScheduledValues(this.ctx.currentTime);
        this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
        window.setTimeout(() => {
            if (this.timer === null) void this.ctx.suspend();
        }, 400);
    }

    setVolume(volume: number): void {
        this.volume = Math.min(1, Math.max(0, volume));
        if (this.timer !== null) this.master.gain.setTargetAtTime(this.targetGain(), this.ctx.currentTime, 0.1);
    }

    setMuted(muted: boolean): void {
        this.muted = muted;
        if (this.timer !== null) this.master.gain.setTargetAtTime(this.targetGain(), this.ctx.currentTime, 0.1);
    }

    dispose(): void {
        if (this.timer !== null) window.clearInterval(this.timer);
        this.timer = null;
        void this.ctx.close();
    }
}
