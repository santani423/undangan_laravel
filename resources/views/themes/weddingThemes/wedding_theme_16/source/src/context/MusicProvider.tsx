import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { assetUrl } from '../lib/assets';
import { AmbientSynthEngine, FileMusicEngine, type MusicEngine } from '../lib/audio/musicEngine';
import type { MusicConfig } from '../types/invitation';
import { MusicContext, type MusicStatus, type MusicValue } from './contexts';

/**
 * Background music state. The engine is created lazily inside the first
 * user-initiated `play()` call, which satisfies browser autoplay policies.
 */
export function MusicProvider({ config, children }: { config: MusicConfig; children: ReactNode }) {
  const engine = useRef<MusicEngine | null>(null);
  const [status, setStatus] = useState<MusicStatus>('idle');
  const [muted, setMuted] = useState(false);
  const [volume, setVolumeState] = useState(config.volume);
  const resumeOnVisible = useRef(false);
  const source: 'file' | 'synth' = config.src ? 'file' : 'synth';

  const ensureEngine = useCallback((): MusicEngine | null => {
    if (engine.current) return engine.current;
    try {
      const src = assetUrl(config.src);
      engine.current = src ? new FileMusicEngine(src, volume, () => setStatus('error')) : new AmbientSynthEngine(volume);
      engine.current.setMuted(muted);
      return engine.current;
    } catch {
      setStatus('error');
      return null;
    }
  }, [config.src, volume, muted]);

  const play = useCallback(() => {
    const current = ensureEngine();
    if (!current) return;
    setStatus('playing');
    current.play().catch(() => setStatus('error'));
  }, [ensureEngine]);

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

  useEffect(
    () => () => {
      engine.current?.dispose();
      engine.current = null;
    },
    [],
  );

  const value = useMemo<MusicValue>(
    () => ({
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
    [status, muted, volume, source, config.title, config.artist, config.credit, play, pause, toggle, toggleMute, setVolume],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}
