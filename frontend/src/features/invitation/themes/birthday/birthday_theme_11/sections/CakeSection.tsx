import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { smileAssets } from '../lib/assets';
import { domConfetti } from '../lib/domConfetti';
import { cx } from '../lib/helpers';
import { SECTION_BY_KEY } from '../lib/sections';

export interface CakeHandle {
    /** What a tap on the 3D cake does: make a wish, or relight once the candles are out. */
    tap(): void;
    /** Back to lit candles without sounds or focus changes (used by "Putar ulang"). */
    reset(): void;
}

interface Mic {
    stream: MediaStream;
    source: MediaStreamAudioSourceNode;
    raf: number;
    started: number;
    last: number;
    baseline: number;
    samples: number;
    blowTime: number;
}

type StopReason = 'stopped' | 'timeout' | 'silent';

/*
 * 6 · Cake — "make a wish" works with a button tap (always) or, optionally, by blowing into
 * the microphone. The microphone is only requested after the guest presses the mic button,
 * audio never leaves the device, and the stream is stopped as soon as we're done.
 */
export const CakeSection = forwardRef<CakeHandle>(function CakeSection(_, ref) {
    const { config, audio, getWorld } = useSmile();
    const def = SECTION_BY_KEY.cake;
    const { candles, name } = config.child;
    const [blown, setBlown] = useState(false);
    const [status, setStatus] = useState('');
    const [listening, setListening] = useState(false);
    const [micBusy, setMicBusy] = useState(false);
    const [micSupported] = useState(() => Boolean(navigator.mediaDevices?.getUserMedia));
    const blownRef = useRef(false);
    const busyRef = useRef(false);
    const virtualLit = useRef(candles); // used when there is no 3D cake
    const micRef = useRef<Mic | null>(null);
    const meterRef = useRef<HTMLDivElement>(null);
    const wishRef = useRef<HTMLButtonElement>(null);
    const relightRef = useRef<HTMLButtonElement>(null);
    const focusNext = useRef<'wish' | 'relight' | null>(null);

    // Hidden buttons can't take focus, so focus moves once the swap has rendered.
    useEffect(() => {
        const target = focusNext.current === 'relight' ? relightRef.current : focusNext.current === 'wish' ? wishRef.current : null;
        focusNext.current = null;
        target?.focus({ preventScroll: true });
    }, [blown]);

    const setBlownState = (value: boolean) => {
        blownRef.current = value;
        setBlown(value);
    };

    const stopMic = (reason: StopReason) => {
        const mic = micRef.current;
        if (!mic) return;
        cancelAnimationFrame(mic.raf);
        mic.source.disconnect();
        mic.stream.getTracks().forEach((t) => t.stop());
        micRef.current = null;
        setListening(false);
        meterRef.current?.style.setProperty('--level', '0');
        if (reason === 'timeout') setStatus('Kami belum mendengar tiupan. Coba lagi, atau ketuk “Buat permohonan”.');
        if (reason === 'stopped') setStatus('Mikrofon dimatikan. Ketuk “Buat permohonan” kapan saja kamu siap.');
    };

    const celebrate = () => {
        setBlownState(true);
        audio.play('celebration');
        setStatus(`Semua ${candles} lilin sudah padam. Permohonanmu sedang terbang. Selamat ulang tahun, ${name}!`);
        focusNext.current = 'relight';
    };

    const wish = async () => {
        if (blownRef.current || busyRef.current) return;
        busyRef.current = true;
        stopMic('silent');
        audio.play('blow');
        setStatus('Fiuuuh…');
        const world = getWorld();
        if (world) {
            await world.blowCandles();
        } else {
            virtualLit.current = 0;
            if (config.features.confetti) domConfetti(wishRef.current, { amount: 80 });
        }
        celebrate();
        busyRef.current = false;
    };

    const relight = () => {
        getWorld()?.relightCandles();
        virtualLit.current = candles;
        setBlownState(false);
        audio.play('chime');
        setStatus('Lilinnya menyala lagi. Siap membuat permohonan lagi?');
        focusNext.current = 'wish';
    };

    const reset = () => {
        stopMic('silent');
        getWorld()?.relightCandles();
        virtualLit.current = candles;
        setBlownState(false);
        setStatus('');
    };

    const startMic = async () => {
        if (blownRef.current || micRef.current) return;
        const ctx = audio.ensureContext();
        if (!navigator.mediaDevices?.getUserMedia || !ctx) {
            setStatus('Browser ini tidak bisa memakai mikrofon di sini. Ketuk “Buat permohonan” saja, ya.');
            return;
        }
        setMicBusy(true);
        setStatus('Meminta izin mikrofon…');
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
        } catch (err) {
            setMicBusy(false);
            setStatus(
                (err as DOMException)?.name === 'NotAllowedError'
                    ? 'Akses mikrofon diblokir. Ketuk “Buat permohonan” untuk meniup lilinnya.'
                    : 'Mikrofon tidak ditemukan. Ketuk “Buat permohonan” untuk meniup lilinnya.',
            );
            return;
        }
        await ctx.resume().catch(() => {});
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const data = new Float32Array(analyser.fftSize);
        const started = performance.now();
        micRef.current = { stream, source, raf: 0, started, last: started, baseline: 0.01, samples: 0, blowTime: 0 };
        setMicBusy(false);
        setListening(true);
        setStatus('Mendengarkan… tarik napas dalam-dalam lalu tiup ke arah mikrofon!');

        const loop = (time: number) => {
            const mic = micRef.current;
            if (!mic) return;
            const dt = Math.min(0.1, (time - mic.last) / 1000);
            mic.last = time;
            analyser.getFloatTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
            const rms = Math.sqrt(sum / data.length);
            const elapsed = time - mic.started;
            // Calibrate to the room's background noise first.
            if (elapsed < 500) mic.baseline = (mic.baseline * mic.samples + rms) / ++mic.samples;
            const threshold = Math.max(0.05, mic.baseline * 3.2);
            meterRef.current?.style.setProperty('--level', Math.min(1, rms / (threshold * 1.6)).toFixed(3));
            if (elapsed >= 500 && rms > threshold) {
                mic.blowTime += dt;
                if (mic.blowTime >= 0.16) {
                    mic.blowTime = 0;
                    audio.play('puff');
                    const world = getWorld();
                    const remaining = world ? world.blowOneCandle() : --virtualLit.current;
                    if (remaining <= 0) {
                        stopMic('silent');
                        if (world) world.celebrate(5, { amount: 220 });
                        else if (config.features.confetti) domConfetti(wishRef.current, { amount: 80 });
                        celebrate();
                        return;
                    }
                    setStatus(`Masih ada ${remaining} lilin yang menyala. Terus tiup!`);
                }
            }
            if (elapsed > 20000) {
                stopMic('timeout');
                return;
            }
            mic.raf = requestAnimationFrame(loop);
        };
        micRef.current.raf = requestAnimationFrame(loop);
    };

    useImperativeHandle(ref, () => ({ tap: () => (blownRef.current ? relight() : void wish()), reset }));

    // Never leave the microphone on when the page goes away.
    useEffect(
        () => () => {
            const mic = micRef.current;
            if (!mic) return;
            cancelAnimationFrame(mic.raf);
            mic.stream.getTracks().forEach((t) => t.stop());
            micRef.current = null;
        },
        [],
    );

    return (
        <SceneSection
            def={def}
            art={smileAssets.cake}
            artSize={[320, 280]}
            artClassName="bt11-scene__art--cake"
            panelClassName={cx('bt11-cake-panel', blown && 'is-blown', listening && 'is-listening')}
        >
            <SectionHeading def={def} />
            <p data-reveal="">{config.copy.cakeIntro}</p>
            <div className="bt11-actions" data-reveal="">
                <button ref={wishRef} className="bt11-btn bt11-btn--primary bt11-btn--big" type="button" hidden={blown} onClick={() => void wish()}>
                    Buat permohonan
                </button>
                <button ref={relightRef} className="bt11-btn bt11-btn--primary bt11-btn--big" type="button" hidden={!blown} onClick={relight}>
                    Nyalakan lilin lagi
                </button>
                {micSupported && (
                    <button
                        className="bt11-btn bt11-btn--secondary bt11-btn--mic"
                        type="button"
                        aria-pressed={listening}
                        disabled={blown || micBusy}
                        onClick={() => (micRef.current ? stopMic('stopped') : void startMic())}
                    >
                        {listening ? 'Berhenti mendengarkan' : 'Tiup ke mikrofon'}
                    </button>
                )}
            </div>
            <div ref={meterRef} className="bt11-mic-meter" aria-hidden="true">
                <span />
            </div>
            <p className="bt11-status" role="status" aria-live="polite">
                {status}
            </p>
            {micSupported && (
                <p className="bt11-small" data-reveal="">
                    Mikrofon bersifat opsional dan hanya mendengarkan selama tombolnya bertuliskan “Berhenti mendengarkan”. Tidak ada suara yang
                    direkam atau dikirim ke mana pun.
                </p>
            )}
        </SceneSection>
    );
});
