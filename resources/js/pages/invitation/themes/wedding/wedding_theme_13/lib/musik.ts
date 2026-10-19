/* ===== Musik latar bernuansa kecapi suling, disintesis langsung di browser =====
   Kecapi: petikan Karplus-Strong. Suling: nada sinus dengan napas & vibrato.
   Tangga nada: pendekatan salendro (5 nada hampir sama jarak dalam satu oktaf).
   Bila undangan punya musik unggahan sendiri, berkas itu yang diputar. */
import { useCallback, useEffect, useRef, useState } from 'react';

interface Pemutar {
    readonly on: boolean;
    start(): void;
    stop(): void;
    tutup(): void;
}

type KonteksAudio = typeof AudioContext;

function buatKecapiSuling(ubah: (on: boolean) => void): Pemutar {
    let ctx: AudioContext | null = null;
    let master: GainNode;
    let rev: DelayNode;
    let timer: number | null = null;
    let langkah = 0;
    let nextT = 0;
    const DASAR = 293.66; // nada dasar (D)
    const nada = (k: number, okt = 0) => DASAR * Math.pow(2, okt + k / 5);
    const buffers = new Map<string, AudioBuffer>();

    function petik(c: AudioContext, freq: number) {
        // Karplus-Strong, disimpan agar tidak dihitung ulang
        const key = freq.toFixed(2);
        const ada = buffers.get(key);
        if (ada) return ada;
        const sr = c.sampleRate,
            len = Math.floor(sr * 2.6),
            buf = c.createBuffer(1, len, sr),
            d = buf.getChannelData(0);
        const N = Math.max(2, Math.round(sr / freq)),
            line = new Float32Array(N);
        for (let i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;
        let idx = 0,
            prev = 0;
        for (let i = 0; i < len; i++) {
            const cur = line[idx];
            const v = 0.4985 * (cur + prev) * 1.0;
            prev = cur;
            line[idx] = v;
            d[i] = cur;
            idx = (idx + 1) % N;
        }
        buffers.set(key, buf);
        return buf;
    }
    function kecapi(c: AudioContext, freq: number, t: number, vol: number) {
        const s = c.createBufferSource();
        s.buffer = petik(c, freq);
        const g = c.createGain();
        g.gain.value = vol;
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3200;
        s.connect(lp);
        lp.connect(g);
        g.connect(master);
        g.connect(rev);
        s.start(t);
    }
    function suling(c: AudioContext, freq: number, t: number, dur: number, vol: number) {
        const o = c.createOscillator(),
            o2 = c.createOscillator(),
            g = c.createGain(),
            lfo = c.createOscillator(),
            lg = c.createGain();
        o.type = 'sine';
        o2.type = 'triangle';
        o.frequency.value = freq;
        o2.frequency.value = freq * 2;
        lfo.frequency.value = 5.2;
        lg.gain.value = freq * 0.006;
        lfo.connect(lg);
        lg.connect(o.frequency);
        const g2 = c.createGain();
        g2.gain.value = 0.08;
        o2.connect(g2);
        g2.connect(g);
        o.connect(g);
        // napas: derau tersaring di sekitar nada
        const nb = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate),
            nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        const ns = c.createBufferSource();
        ns.buffer = nb;
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq * 2;
        bp.Q.value = 6;
        const ng = c.createGain();
        ng.gain.value = 0.035;
        ns.connect(bp);
        bp.connect(ng);
        ng.connect(g);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.18);
        g.gain.setValueAtTime(vol, t + dur * 0.7);
        g.gain.linearRampToValueAtTime(0, t + dur);
        g.connect(master);
        g.connect(rev);
        [o, o2, lfo, ns].forEach((n) => {
            n.start(t);
            n.stop(t + dur + 0.05);
        });
    }
    // pola kecapi berulang dan frasa suling panjang (karya sendiri, bukan lagu yang ada)
    const POLA = [0, 2, 4, 2, 1, 3, 0, 2, 4, 3, 1, 2, 0, 4, 2, 1];
    const FRASA: [number | null, number, number][] = [
        [4, 1, 2],
        [3, 1, 1],
        [2, 1, 2],
        [0, 1, 3],
        [1, 1, 2],
        [2, 1, 1],
        [4, 1, 1],
        [3, 1, 4],
        [null, 0, 2],
        [2, 1, 2],
        [4, 1, 2],
        [0, 2, 3],
        [4, 1, 3],
        [null, 0, 2],
    ];
    let fi = 0,
        sulingSampai = 0;
    function jadwal() {
        const c = ctx;
        if (!c) return;
        const ketuk = 0.32;
        while (nextT < c.currentTime + 0.7) {
            const k = POLA[langkah % POLA.length];
            kecapi(c, nada(k, -1), nextT, 0.32);
            if (langkah % 4 === 0) kecapi(c, nada(POLA[(langkah / 4) % 5], -2), nextT, 0.22);
            if (langkah % 8 === 6) kecapi(c, nada((k + 2) % 5, 0), nextT + ketuk / 2, 0.14);
            if (nextT >= sulingSampai) {
                const [nk, okt, lama] = FRASA[fi % FRASA.length];
                fi++;
                const dur = lama * ketuk * 2;
                if (nk !== null) suling(c, nada(nk, okt), nextT, dur, 0.055);
                sulingSampai = nextT + dur;
            }
            nextT += ketuk;
            langkah++;
        }
    }
    function siapkan(): AudioContext {
        const AC: KonteksAudio = window.AudioContext ?? (window as unknown as { webkitAudioContext: KonteksAudio }).webkitAudioContext;
        const c = new AC();
        master = c.createGain();
        master.gain.value = 0.8;
        master.connect(c.destination);
        // gema sederhana (delay berumpan balik) agar terasa seperti di pendopo terbuka
        rev = c.createDelay(1);
        rev.delayTime.value = 0.23;
        const fb = c.createGain();
        fb.gain.value = 0.35;
        const wet = c.createGain();
        wet.gain.value = 0.35;
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2200;
        rev.connect(lp);
        lp.connect(fb);
        fb.connect(rev);
        lp.connect(wet);
        wet.connect(c.destination);
        return c;
    }
    return {
        get on() {
            return !!timer;
        },
        start() {
            if (timer) return;
            if (!ctx) ctx = siapkan();
            ctx.resume();
            nextT = ctx.currentTime + 0.08;
            sulingSampai = nextT + 0.64;
            timer = window.setInterval(jadwal, 160);
            ubah(true);
        },
        stop() {
            if (timer) window.clearInterval(timer);
            timer = null;
            if (ctx) ctx.suspend();
            ubah(false);
        },
        tutup() {
            if (timer) window.clearInterval(timer);
            timer = null;
            ctx?.close().catch(() => {});
            ctx = null;
        },
    };
}

function buatPemutarBerkas(url: string, loop: boolean, ubah: (on: boolean) => void): Pemutar {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = 0.35;
    audio.preload = 'auto';
    const sinkron = () => ubah(!audio.paused);
    audio.addEventListener('play', sinkron);
    audio.addEventListener('pause', sinkron);
    audio.addEventListener('ended', sinkron);
    return {
        get on() {
            return !audio.paused;
        },
        start() {
            audio.play().catch(() => ubah(false));
        },
        stop() {
            audio.pause();
        },
        tutup() {
            audio.pause();
            audio.removeEventListener('play', sinkron);
            audio.removeEventListener('pause', sinkron);
            audio.removeEventListener('ended', sinkron);
            audio.removeAttribute('src');
            audio.load();
        },
    };
}

/**
 * Musik latar tema. Pemutar dibuat malas (saat pertama diputar) agar AudioContext
 * lahir di dalam gestur pengguna — syarat autoplay di browser seluler.
 */
export function useMusikLatar(url: string, loop: boolean) {
    const ref = useRef<Pemutar | null>(null);
    const [main, setMain] = useState(false);

    useEffect(
        () => () => {
            ref.current?.tutup();
            ref.current = null;
            setMain(false);
        },
        [url, loop],
    );

    const pemutar = useCallback(() => {
        if (!ref.current) ref.current = url ? buatPemutarBerkas(url, loop, setMain) : buatKecapiSuling(setMain);
        return ref.current;
    }, [url, loop]);

    const putar = useCallback(() => {
        try {
            pemutar().start();
        } catch {
            setMain(false);
        }
    }, [pemutar]);

    const alih = useCallback(() => {
        try {
            const p = pemutar();
            if (p.on) p.stop();
            else p.start();
        } catch {
            setMain(false);
        }
    }, [pemutar]);

    return { main, putar, alih };
}
