/**
 * Generates public/audio/birthday-default.mp3 — the default background track
 * for Birthday invitations (see App\Support\InvitationMusic).
 *
 * The piece is an original composition synthesized from scratch below (no
 * samples, no existing song), so it is free to ship with the project.
 * Cheerful, playful, warm: marimba lead, ukulele-style strum, soft bass,
 * light percussion, 116 BPM in C major, 24 bars, rendered as a seamless loop.
 *
 * Usage (the MP3 encoder is not a project dependency):
 *   npm install --no-save @breezystack/lamejs
 *   node scripts/generate_birthday_music.mjs [output.mp3]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Mp3Encoder } from '@breezystack/lamejs';

const OUT = resolve(process.argv[2] ?? 'public/audio/birthday-default.mp3');

const SR = 44100;
const BPM = 116;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS = 24;
const SWING = 0.57; // where the off-beat eighth lands inside a beat (0.5 = straight)
const LOOP_LEN = Math.round(BARS * BAR * SR);
const TAIL = SR * 4; // decay that spills past the end, folded back onto the start
const N = LOOP_LEN + TAIL;

const L = new Float32Array(N);
const R = new Float32Array(N);
// Reverb send (mono)
const SEND = new Float32Array(N);

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
/** Start time of an eighth-note slot (0–7) in a bar. */
const slotTime = (bar, slot) => bar * BAR + Math.floor(slot / 2) * BEAT + (slot % 2 ? BEAT * SWING : 0);

// Deterministic noise so every run produces the same file.
let seed = 20260930;
const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296 * 2 - 1;
};

function add(start, length, pan, send, fn) {
    const s0 = Math.round(start * SR);
    const len = Math.min(Math.round(length * SR), N - s0);
    const gl = Math.cos((pan + 1) * Math.PI / 4);
    const gr = Math.sin((pan + 1) * Math.PI / 4);
    for (let i = 0; i < len; i++) {
        const v = fn(i / SR, i);
        L[s0 + i] += v * gl;
        R[s0 + i] += v * gr;
        SEND[s0 + i] += v * send;
    }
}

// ── Instruments ──────────────────────────────────────────────────────────────

/** Marimba-like mallet: fundamental + the bar's characteristic 4th partial. */
function marimba(t0, midi, gain, pan = 0) {
    const f = hz(midi);
    add(t0, 1.4, pan, 0.35, (t) => {
        const atk = Math.min(1, t / 0.003);
        return atk * gain * (
            Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 5.5)
            + 0.32 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 16)
            + 0.10 * Math.sin(2 * Math.PI * f * 9.2 * t) * Math.exp(-t * 40)
        );
    });
}

/** Glockenspiel sparkle, an octave above the lead. */
function glock(t0, midi, gain, pan = 0) {
    const f = hz(midi);
    add(t0, 1.8, pan, 0.5, (t) => {
        const atk = Math.min(1, t / 0.002);
        return atk * gain * (
            Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.6)
            + 0.22 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 9)
        );
    });
}

/** Nylon-string pluck: harmonics that decay faster the higher they are. */
function pluck(t0, midi, gain, pan = 0) {
    const f = hz(midi);
    add(t0, 1.1, pan, 0.22, (t) => {
        const atk = Math.min(1, t / 0.002);
        let v = 0;
        for (let h = 1; h <= 7; h++) {
            v += Math.sin(2 * Math.PI * f * h * t) / h ** 1.25 * Math.exp(-t * (4.5 + 2.6 * h));
        }
        return atk * gain * v;
    });
}

function strum(t0, notes, gain, up = false) {
    const order = up ? [...notes].reverse().slice(0, 3) : notes;
    order.forEach((midi, i) => pluck(t0 + i * 0.013, midi, gain * (up ? 0.7 : 1), -0.35));
}

function bass(t0, midi, dur, gain) {
    const f = hz(midi);
    add(t0, dur + 0.15, 0, 0.04, (t) => {
        const env = Math.min(1, t / 0.008) * (t < dur ? Math.exp(-t * 1.6) : Math.exp(-dur * 1.6) * Math.max(0, 1 - (t - dur) / 0.15));
        return gain * env * (Math.sin(2 * Math.PI * f * t) + 0.28 * Math.sin(2 * Math.PI * f * 2 * t) + 0.08 * Math.sin(2 * Math.PI * f * 3 * t));
    });
}

function kick(t0, gain) {
    add(t0, 0.28, 0, 0, (t) => {
        const phase = 2 * Math.PI * (48 * t + (70 / 38) * (1 - Math.exp(-t * 38)));
        return gain * Math.sin(phase) * Math.exp(-t * 15);
    });
}

function shaker(t0, gain) {
    let prev = 0;
    add(t0, 0.07, 0.4, 0.08, (t) => {
        const n = rand();
        const hp = n - prev; // crude high-pass
        prev = n;
        return gain * hp * Math.min(1, t / 0.006) * Math.exp(-t * 60);
    });
}

function clap(t0, gain) {
    let lp = 0;
    let prev = 0;
    add(t0, 0.18, -0.15, 0.3, (t) => {
        const n = rand();
        lp += 0.35 * (n - lp);
        const bp = lp - prev;
        prev = lp;
        // three quick bursts, like several hands
        const env = Math.exp(-((t % 0.011) * 90)) * (t < 0.033 ? 1 : 0) + (t >= 0.033 ? Math.exp(-(t - 0.033) * 34) : 0);
        return gain * bp * 2.2 * env;
    });
}

// ── Score ────────────────────────────────────────────────────────────────────

const CHORDS = {
    C:  { notes: [60, 64, 67, 72], bass: 48 },
    G:  { notes: [59, 62, 67, 71], bass: 43 },
    Am: { notes: [57, 60, 64, 69], bass: 45 },
    F:  { notes: [57, 60, 65, 69], bass: 41 },
    Dm: { notes: [57, 62, 65, 69], bass: 50 },
};

// One entry per bar; two entries = the bar is split in half.
const SECTION_A = [['C'], ['G'], ['Am'], ['F'], ['C'], ['G'], ['F', 'G'], ['C']];
const SECTION_B = [['F'], ['C'], ['G'], ['Am'], ['F'], ['C'], ['Dm'], ['G']];

// Melody per bar as [midi | null (rest), length in eighths]; each bar sums to 8.
const [C5, D5, E5, F5, G5, A5, B5, C6, D6] = [72, 74, 76, 77, 79, 81, 83, 84, 86];
const MELODY_A = [
    [[E5, 1], [G5, 1], [C6, 2], [G5, 1], [E5, 1], [G5, 2]],
    [[D5, 1], [G5, 1], [B5, 2], [G5, 1], [D5, 1], [G5, 2]],
    [[C5, 1], [E5, 1], [A5, 2], [G5, 1], [E5, 1], [C5, 2]],
    [[F5, 1], [A5, 1], [C6, 2], [A5, 2], [null, 2]],
    [[E5, 1], [G5, 1], [C6, 2], [D6, 1], [C6, 1], [G5, 2]],
    [[D5, 1], [G5, 1], [B5, 2], [D6, 1], [B5, 1], [G5, 2]],
    [[A5, 1], [F5, 1], [A5, 1], [C6, 1], [B5, 1], [G5, 1], [B5, 1], [D6, 1]],
    [[C6, 3], [G5, 1], [E5, 1], [C5, 1], [null, 2]],
];
const MELODY_B = [
    [[A5, 2], [F5, 1], [A5, 1], [C6, 2], [A5, 2]],
    [[G5, 2], [E5, 1], [G5, 1], [C6, 2], [G5, 2]],
    [[B5, 1], [A5, 1], [G5, 1], [D5, 1], [G5, 2], [B5, 2]],
    [[A5, 3], [E5, 1], [C5, 2], [E5, 2]],
    [[F5, 1], [A5, 1], [C6, 1], [A5, 1], [F5, 2], [A5, 2]],
    [[E5, 1], [G5, 1], [C6, 1], [G5, 1], [E5, 2], [G5, 2]],
    [[D5, 1], [F5, 1], [A5, 2], [F5, 1], [D5, 1], [F5, 2]],
    [[G5, 2], [A5, 1], [B5, 1], [D6, 2], [null, 2]],
];

const SECTIONS = [
    { chords: SECTION_A, melody: MELODY_A, glock: false, claps: false },
    { chords: SECTION_B, melody: MELODY_B, glock: false, claps: true },
    { chords: SECTION_A, melody: MELODY_A, glock: true, claps: true },
];

// "Island" strum: D - D U - U D U
const STRUM = [[0, false, 1], [2, false, 0.8], [3, true, 0.7], [5, true, 0.75], [6, false, 0.85], [7, true, 0.7]];

SECTIONS.forEach((section, s) => {
    section.chords.forEach((barChords, b) => {
        const bar = s * 8 + b;
        const chordAt = (slot) => CHORDS[barChords.length === 2 && slot >= 4 ? barChords[1] : barChords[0]];

        // Ukulele
        for (const [slot, up, accent] of STRUM) {
            strum(slotTime(bar, slot), chordAt(slot).notes, 0.085 * accent, up);
        }

        // Bass: root on 1, fifth (or the second chord's root) on 3
        const first = chordAt(0);
        const second = chordAt(4);
        bass(slotTime(bar, 0), first.bass, BEAT * 1.6, 0.30);
        bass(slotTime(bar, 4), barChords.length === 2 ? second.bass : first.bass + 7, BEAT * 1.3, 0.24);
        bass(slotTime(bar, 7), second.bass, BEAT * 0.4, 0.16);

        // Percussion
        kick(slotTime(bar, 0), 0.42);
        kick(slotTime(bar, 4), 0.34);
        for (let slot = 0; slot < 8; slot++) {
            shaker(slotTime(bar, slot), slot % 2 ? 0.05 : 0.032);
        }
        if (section.claps) {
            clap(slotTime(bar, 2), 0.16);
            clap(slotTime(bar, 6), 0.16);
        }

        // Lead
        let slot = 0;
        for (const [midi, len] of section.melody[b]) {
            if (midi !== null) {
                const accent = slot % 2 ? 0.85 : 1;
                marimba(slotTime(bar, slot), midi, 0.30 * accent, 0.12);
                if (section.glock && slot % 2 === 0) {
                    glock(slotTime(bar, slot), midi + 12, 0.055, 0.45);
                }
            }
            slot += len;
        }
    });
});

// ── Room reverb (damped feedback combs on the send bus) ──────────────────────

function comb(input, delaySec, feedback, damp) {
    const d = Math.round(delaySec * SR);
    const buf = new Float32Array(d);
    const out = new Float32Array(input.length);
    let lp = 0;
    for (let i = 0, p = 0; i < input.length; i++) {
        const y = buf[p];
        lp += damp * (y - lp);
        buf[p] = input[i] + lp * feedback;
        out[i] = y;
        p = p + 1 === d ? 0 : p + 1;
    }
    return out;
}

const WET = 0.22;
[[0.0297, 0.0437, 0.0571], [0.0319, 0.0411, 0.0617]].forEach((delays, ch) => {
    const target = ch === 0 ? L : R;
    for (const delay of delays) {
        const wet = comb(SEND, delay, 0.74, 0.35);
        for (let i = 0; i < N; i++) target[i] += wet[i] * WET / delays.length;
    }
});

// ── Fold the tail onto the start so the loop point is inaudible ──────────────

for (let i = 0; i < TAIL; i++) {
    L[i] += L[LOOP_LEN + i];
    R[i] += R[LOOP_LEN + i];
}

// ── Master: gentle soft-clip, then normalize well below full scale ───────────

let peak = 0;
for (let i = 0; i < LOOP_LEN; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const drive = 1.1 / peak;
const TARGET_PEAK = 0.62; // ≈ -4 dBFS: background music, not a foreground track
const norm = TARGET_PEAK / Math.tanh(1.1);

const pcmL = new Int16Array(LOOP_LEN);
const pcmR = new Int16Array(LOOP_LEN);
let sumSq = 0;
for (let i = 0; i < LOOP_LEN; i++) {
    const l = Math.tanh(L[i] * drive) * norm;
    const r = Math.tanh(R[i] * drive) * norm;
    sumSq += l * l + r * r;
    pcmL[i] = Math.round(l * 32767);
    pcmR[i] = Math.round(r * 32767);
}

// ── Encode ───────────────────────────────────────────────────────────────────

const encoder = new Mp3Encoder(2, SR, 128);
const chunks = [];
const FRAME = 1152;
for (let i = 0; i < LOOP_LEN; i += FRAME) {
    const out = encoder.encodeBuffer(pcmL.subarray(i, i + FRAME), pcmR.subarray(i, i + FRAME));
    if (out.length) chunks.push(Buffer.from(out));
}
const end = encoder.flush();
if (end.length) chunks.push(Buffer.from(end));

mkdirSync(dirname(OUT), { recursive: true });
const mp3 = Buffer.concat(chunks);
writeFileSync(OUT, mp3);

const rmsDb = 20 * Math.log10(Math.sqrt(sumSq / (LOOP_LEN * 2)));
console.log(`${OUT}\n  ${(LOOP_LEN / SR).toFixed(1)}s, ${(mp3.length / 1024).toFixed(0)} KB, peak ${(20 * Math.log10(TARGET_PEAK)).toFixed(1)} dBFS, RMS ${rmsDb.toFixed(1)} dBFS`);
