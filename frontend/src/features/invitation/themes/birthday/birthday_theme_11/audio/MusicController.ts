import { readPreference, writePreference } from '../lib/helpers';

/*
 * Web Audio engine.
 * - Background music: the invitation's uploaded track, or a music-box arrangement of
 *   "Happy Birthday to You" (public domain) synthesised in the browser when there is none
 *   or it cannot play.
 * - Sound effects: synthesised pops, chimes, whooshes and celebrations.
 * Nothing plays until the visitor interacts with the page (browser autoplay policy).
 */

export type SoundName = 'pop' | 'chime' | 'whoosh' | 'celebration' | 'blow' | 'firework' | 'puff';

export interface AudioState {
    music: boolean;
    sfx: boolean;
    supported: boolean;
}

interface MusicOptions {
    src: string | null;
    loop: boolean;
    volume: number;
}

type AudioCtor = typeof AudioContext;

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// [midi note, beats]
const MELODY: [number, number][] = [
    [67, 0.75],
    [67, 0.25],
    [69, 1],
    [67, 1],
    [72, 1],
    [71, 2],
    [67, 0.75],
    [67, 0.25],
    [69, 1],
    [67, 1],
    [74, 1],
    [72, 2],
    [67, 0.75],
    [67, 0.25],
    [79, 1],
    [76, 1],
    [72, 1],
    [71, 1],
    [69, 1],
    [77, 0.75],
    [77, 0.25],
    [76, 1],
    [72, 1],
    [74, 1],
    [72, 3],
];
const LOOP_BEATS = 27; // melody (25 beats) + 2 beats of rest
// Waltz accompaniment: [downbeat, bass note, chord tones]
const HARMONY: [number, number, number[]][] = [
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
const MUSIC_BOX_VOLUME = 0.35;
const EFFECTS_VOLUME = 0.6;

const audioCtor = (): AudioCtor | undefined =>
    typeof window === 'undefined' ? undefined : (window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext);

export class MusicController {
    ctx: AudioContext | null = null;
    private master!: GainNode;
    private musicGain!: GainNode;
    private sfxGain!: GainNode;
    private musicOn = false;
    private sfxOn: boolean;
    private musicPreference: boolean | null;
    private scheduler = 0;
    private nextNoteTime = 0;
    private noteIndex = 0;
    private loopStart = 0;
    private harmonyTime: number | undefined;
    private harmonyLoop = 0;
    private harmonyIndex = 0;
    private noiseBuffer: AudioBuffer | null = null;
    private track: HTMLAudioElement | null = null;
    /** The uploaded track failed once; the music box takes over for the rest of the visit. */
    private trackFailed = false;
    private listeners = new Set<() => void>();
    private snapshot: AudioState;
    private cleanups: (() => void)[] = [];

    constructor(private options: MusicOptions) {
        this.sfxOn = readPreference('bt11:sfx', true) !== false;
        this.musicPreference = readPreference('bt11:music', null);
        this.snapshot = this.makeState();

        const unlock = () => {
            this.ensureContext();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { passive: true });
        window.addEventListener('keydown', unlock);
        const onVisibility = () => {
            if (document.hidden) {
                this.ctx?.suspend().catch(() => {});
                this.track?.pause();
            } else {
                if (this.musicOn || this.sfxOn) this.ctx?.resume().catch(() => {});
                if (this.musicOn) this.track?.play().catch(() => {});
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        this.cleanups.push(
            () => window.removeEventListener('pointerdown', unlock),
            () => window.removeEventListener('keydown', unlock),
            () => document.removeEventListener('visibilitychange', onVisibility),
        );
    }

    /** True when the visitor has not muted the music on an earlier visit. */
    get musicAllowedByPreference() {
        return this.musicPreference !== false;
    }

    get supported() {
        return Boolean(audioCtor());
    }

    private makeState(): AudioState {
        return { music: this.musicOn, sfx: this.sfxOn, supported: this.supported };
    }

    /** useSyncExternalStore-compatible snapshot (stable until something changes). */
    getState = () => this.snapshot;

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    private emit() {
        this.snapshot = this.makeState();
        for (const listener of this.listeners) listener();
    }

    ensureContext(): AudioContext | null {
        const Ctx = audioCtor();
        if (!Ctx) return null;
        if (!this.ctx) {
            const ctx = new Ctx();
            this.ctx = ctx;
            this.master = ctx.createGain();
            this.master.connect(ctx.destination);
            this.musicGain = ctx.createGain();
            this.musicGain.gain.value = 0;
            this.sfxGain = ctx.createGain();
            this.sfxGain.gain.value = EFFECTS_VOLUME;

            // A soft feedback delay gives the music box a little room sound.
            const delay = ctx.createDelay(1);
            delay.delayTime.value = 0.28;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.28;
            const tone = ctx.createBiquadFilter();
            tone.type = 'lowpass';
            tone.frequency.value = 2400;
            this.musicGain.connect(this.master);
            this.musicGain.connect(delay);
            delay.connect(tone);
            tone.connect(feedback);
            feedback.connect(delay);
            tone.connect(this.master);
            this.sfxGain.connect(this.master);
        }
        if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume().catch(() => {});
        return this.ctx;
    }

    /* ---------------------------------------------------------------- music */

    /** Starts the music; resolves to false when the browser refused to play it. */
    async playMusic(): Promise<boolean> {
        if (this.musicOn) return true;
        if (this.options.src && !this.trackFailed && (await this.playTrack())) return this.markPlaying();
        const ctx = this.ensureContext();
        if (!ctx) return false;
        try {
            await ctx.resume();
        } catch {
            return false;
        }
        if (ctx.state !== 'running' || this.musicOn) return this.musicOn;
        this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
        this.musicGain.gain.setTargetAtTime(MUSIC_BOX_VOLUME, ctx.currentTime, 0.4);
        this.startScheduler();
        return this.markPlaying();
    }

    private markPlaying() {
        this.musicOn = true;
        this.musicPreference = true;
        writePreference('bt11:music', true);
        this.emit();
        return true;
    }

    private async playTrack(): Promise<boolean> {
        if (!this.track) {
            const track = new Audio(this.options.src ?? undefined);
            track.loop = this.options.loop;
            track.volume = this.options.volume;
            track.preload = 'auto';
            track.addEventListener('error', () => {
                // A broken file mid-visit: hand over to the music box if the music was on.
                this.trackFailed = true;
                if (this.musicOn && !this.scheduler) {
                    this.musicOn = false;
                    this.playMusic().catch(() => {});
                }
            });
            track.addEventListener('ended', () => {
                if (!track.loop) {
                    this.musicOn = false;
                    this.emit();
                }
            });
            this.track = track;
        }
        try {
            await this.track.play();
            return true;
        } catch (error) {
            // NotAllowedError = autoplay policy (try again on the next tap); anything else = unplayable file.
            if (!(error instanceof DOMException && error.name === 'NotAllowedError')) this.trackFailed = true;
            return false;
        }
    }

    pauseMusic({ remember = true } = {}) {
        if (!this.musicOn) return;
        this.musicOn = false;
        if (remember) {
            this.musicPreference = false;
            writePreference('bt11:music', false);
        }
        this.track?.pause();
        if (this.ctx) {
            const now = this.ctx.currentTime;
            this.musicGain.gain.cancelScheduledValues(now);
            this.musicGain.gain.setTargetAtTime(0, now, 0.15);
        }
        window.clearInterval(this.scheduler);
        this.scheduler = 0;
        this.emit();
    }

    toggleMusic(): Promise<boolean> {
        if (this.musicOn) {
            this.pauseMusic();
            return Promise.resolve(false);
        }
        return this.playMusic();
    }

    private startScheduler() {
        const ctx = this.ctx!;
        const beat = 60 / BPM;
        this.noteIndex = 0;
        this.loopStart = ctx.currentTime + 0.1;
        this.nextNoteTime = this.loopStart;
        this.harmonyTime = undefined;
        const lookahead = 0.25;
        const schedule = () => {
            while (this.nextNoteTime < ctx.currentTime + lookahead) {
                const [note, beats] = MELODY[this.noteIndex];
                this.musicBoxNote(midiToHz(note), this.nextNoteTime, 0.22, Math.max(0.6, beats * beat * 1.6));
                this.nextNoteTime += beats * beat;
                this.noteIndex++;
                if (this.noteIndex >= MELODY.length) {
                    this.noteIndex = 0;
                    this.loopStart += LOOP_BEATS * beat;
                    this.nextNoteTime = this.loopStart;
                }
            }
            // Accompaniment is scheduled a little ahead of time, one downbeat after another.
            while (this.harmonyTime === undefined || this.harmonyTime < ctx.currentTime + lookahead) {
                if (this.harmonyTime === undefined) {
                    this.harmonyLoop = this.loopStart;
                    this.harmonyIndex = 0;
                }
                const [downbeat, bass, chord] = HARMONY[this.harmonyIndex];
                const t = this.harmonyLoop + downbeat * beat;
                this.musicBoxNote(midiToHz(bass), t, 0.16, 1.4, 'triangle');
                chord.forEach((n) => {
                    this.musicBoxNote(midiToHz(n), t + beat, 0.045, 0.5);
                    this.musicBoxNote(midiToHz(n), t + beat * 2, 0.045, 0.5);
                });
                this.harmonyTime = t;
                this.harmonyIndex++;
                if (this.harmonyIndex >= HARMONY.length) {
                    this.harmonyIndex = 0;
                    this.harmonyLoop += LOOP_BEATS * beat;
                }
            }
        };
        schedule();
        this.scheduler = window.setInterval(schedule, 60);
    }

    private musicBoxNote(freq: number, time: number, volume: number, decay: number, type: OscillatorType = 'sine') {
        const ctx = this.ctx!;
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, time);
        out.gain.exponentialRampToValueAtTime(volume, time + 0.006);
        out.gain.exponentialRampToValueAtTime(0.0001, time + decay);
        out.connect(this.musicGain);
        const partials: [number, number][] =
            type === 'sine'
                ? [
                      [1, 1],
                      [2, 0.32],
                      [3.01, 0.12],
                  ]
                : [[1, 1]];
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

    toggleSfx() {
        this.sfxOn = !this.sfxOn;
        writePreference('bt11:sfx', this.sfxOn);
        this.emit();
        if (this.sfxOn) this.play('pop');
        return this.sfxOn;
    }

    play(name: SoundName, { volume = 1 } = {}) {
        if (!this.sfxOn) return;
        const ctx = this.ensureContext();
        if (!ctx || ctx.state !== 'running') return;
        const t = ctx.currentTime + 0.01;
        switch (name) {
            case 'pop':
                this.tone({ t, from: 380, to: 1100, dur: 0.11, vol: 0.35 * volume });
                break;
            case 'chime':
                [1047, 1319, 1568].forEach((f, i) => this.bell(f, t + i * 0.07, 0.16 * volume, 1.1));
                break;
            case 'whoosh':
                this.noise({ t, dur: 0.55, vol: 0.18 * volume, from: 300, to: 2200, q: 0.9 });
                break;
            case 'celebration':
                [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.bell(f, t + i * 0.06, 0.14 * volume, 0.9));
                for (let i = 0; i < 6; i++) this.noise({ t: t + 0.35 + i * 0.09, dur: 0.06, vol: 0.08 * volume, from: 4000, to: 6000, q: 2 });
                break;
            case 'blow':
                this.noise({ t, dur: 0.75, vol: 0.28 * volume, from: 900, to: 300, q: 0.4, type: 'lowpass' });
                break;
            case 'puff':
                this.noise({ t, dur: 0.25, vol: 0.12 * volume, from: 1500, to: 500, q: 0.6 });
                break;
            case 'firework':
                this.tone({ t, from: 140, to: 40, dur: 0.35, vol: 0.25 * volume });
                for (let i = 0; i < 5; i++) this.noise({ t: t + 0.05 + i * 0.07, dur: 0.08, vol: 0.06 * volume, from: 3000, to: 5000, q: 1.5 });
                break;
        }
    }

    private tone({ t, from, to, dur, vol }: { t: number; from: number; to: number; dur: number; vol: number }) {
        const ctx = this.ctx!;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(from, t);
        osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    private bell(freq: number, t: number, vol: number, decay: number) {
        const ctx = this.ctx!;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        g.connect(this.sfxGain);
        (
            [
                [1, 1],
                [2.76, 0.25],
                [5.4, 0.08],
            ] as const
        ).forEach(([ratio, amp]) => {
            const osc = ctx.createOscillator();
            const pg = ctx.createGain();
            osc.frequency.value = freq * ratio;
            pg.gain.value = amp;
            osc.connect(pg).connect(g);
            osc.start(t);
            osc.stop(t + decay + 0.05);
        });
    }

    private noise({
        t,
        dur,
        vol,
        from,
        to,
        q = 1,
        type = 'bandpass',
    }: {
        t: number;
        dur: number;
        vol: number;
        from: number;
        to: number;
        q?: number;
        type?: BiquadFilterType;
    }) {
        const ctx = this.ctx!;
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

    /** Stops everything and releases the audio context (the invitation page is leaving). */
    dispose() {
        this.pauseMusic({ remember: false });
        this.cleanups.forEach((off) => off());
        this.cleanups = [];
        if (this.track) {
            this.track.removeAttribute('src');
            this.track.load();
            this.track = null;
        }
        this.ctx?.close().catch(() => {});
        this.ctx = null;
        this.listeners.clear();
    }
}
