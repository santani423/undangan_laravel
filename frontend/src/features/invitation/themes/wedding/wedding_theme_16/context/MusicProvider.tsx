import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AmbientSynthEngine, FileMusicEngine, type MusicEngine } from '../lib/musicEngine';
import type { MusicConfig } from '../lib/types';
import { MusicContext, type MusicStatus, type MusicValue } from './contexts';

/**
 * Background music state. The engine is created lazily inside the first
 * user-initiated `play()` call, which satisfies browser autoplay policies.
 */
export function MusicProvider({ config, enabled, children }: { config: MusicConfig; enabled: boolean; children: ReactNode }) {
    const engine = useRef<MusicEngine | null>(null);
    const [status, setStatus] = useState<MusicStatus>('idle');
    const [muted, setMuted] = useState(false);
    const [volume, setVolumeState] = useState(config.volume);
    const resumeOnVisible = useRef(false);
    const source: 'file' | 'synth' = config.src ? 'file' : 'synth';

    const ensureEngine = useCallback((): MusicEngine | null => {
        if (engine.current) return engine.current;
        try {
            engine.current = config.src
                ? new FileMusicEngine(config.src, volume, config.loop, () => setStatus('error'))
                : new AmbientSynthEngine(volume);
            engine.current.setMuted(muted);
            return engine.current;
        } catch {
            setStatus('error');
            return null;
        }
    }, [config.src, config.loop, volume, muted]);

    const play = useCallback(() => {
        if (!enabled) return;
        const current = ensureEngine();
        if (!current) return;
        setStatus('playing');
        current.play().catch(() => setStatus('error'));
    }, [enabled, ensureEngine]);

    const pause = useCallback(() => {
        engine.current?.pause();
        setStatus((s) => (s === 'playing' ? 'paused' : s));
    }, []);

    const toggle = useCallback(() => (status === 'playing' ? pause() : play()), [status, pause, play]);

    const toggleMute = useCallback(() => {
        const next = !muted;
        setMuted(next);
        engine.current?.setMuted(next);
    }, [muted]);

    const setVolume = useCallback((next: number) => {
        const clamped = Math.min(1, Math.max(0, next));
        setVolumeState(clamped);
        engine.current?.setVolume(clamped);
    }, []);

    // Pause while the tab is hidden; resume when the guest comes back.
    useEffect(() => {
        const onVisibility = () => {
            if (!engine.current) return;
            if (document.hidden && status === 'playing') {
                resumeOnVisible.current = true;
                engine.current.pause();
            } else if (!document.hidden && resumeOnVisible.current) {
                resumeOnVisible.current = false;
                engine.current.play().catch(() => setStatus('paused'));
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [status]);

    // A new track (or leaving the page) disposes the current engine.
    useEffect(
        () => () => {
            engine.current?.dispose();
            engine.current = null;
            setStatus('idle');
        },
        [config.src],
    );

    const value = useMemo<MusicValue>(
        () => ({
            enabled,
            status,
            muted,
            volume,
            source,
            title: config.title,
            artist: config.artist,
            credit: config.credit,
            play,
            pause,
            toggle,
            toggleMute,
            setVolume,
        }),
        [enabled, status, muted, volume, source, config.title, config.artist, config.credit, play, pause, toggle, toggleMute, setVolume],
    );

    return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}
