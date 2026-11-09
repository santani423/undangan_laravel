import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../../hooks/useAppContext';

function statusLabel(status: string, muted: boolean): string {
  if (status === 'playing') return muted ? 'Diputar · senyap' : 'Sedang diputar';
  if (status === 'paused') return 'Dijeda';
  if (status === 'error') return 'Tidak dapat diputar';
  return 'Belum diputar';
}

/** Compact, always-reachable background music control. */
export function MusicController() {
  const music = useMusic();
  const [volumeOpen, setVolumeOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playing = music.status === 'playing';
  const volumePercent = Math.round(music.volume * 100);

  useEffect(() => {
    if (!volumeOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setVolumeOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setVolumeOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [volumeOpen]);

  const slider = (className: string) => (
    <input
      type="range"
      min={0}
      max={100}
      step={5}
      value={volumePercent}
      onChange={(event) => music.setVolume(Number(event.target.value) / 100)}
      aria-label="Volume musik"
      aria-valuetext={`${volumePercent}%`}
      className={`accent-[var(--color-gold-deep)] ${className}`}
    />
  );

  return (
    <div
      ref={wrapperRef}
      className="fixed right-3 z-40 sm:right-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Kontrol musik latar"
      data-testid="music-controller"
    >
      {volumeOpen && (
        <div id={panelId} className="glass-pill absolute bottom-full right-0 mb-2 flex items-center gap-2 rounded-xl px-3 py-2.5 md:hidden">
          {slider('w-36')}
          <span className="w-9 text-right text-xs tabular-nums text-ink-soft">{volumePercent}%</span>
        </div>
      )}
      <div className="glass-pill flex items-center gap-1 rounded-full py-1.5 pl-1.5 pr-3">
        <button
          type="button"
          onClick={music.toggle}
          aria-label={playing ? 'Jeda musik latar' : 'Putar musik latar'}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-deep text-[#fffaf0] transition hover:bg-gold-ink"
          data-testid="music-toggle"
        >
          {playing ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5 translate-x-px" />}
        </button>
        <button
          type="button"
          onClick={music.toggleMute}
          aria-label={music.muted ? 'Bunyikan musik' : 'Senyapkan musik'}
          aria-pressed={music.muted}
          className="grid size-10 shrink-0 place-items-center rounded-full text-gold-ink transition hover:bg-ivory-deep"
          data-testid="music-mute"
        >
          {music.muted ? <VolumeX aria-hidden="true" className="size-5" /> : <Volume2 aria-hidden="true" className="size-5" />}
        </button>
        <button
          type="button"
          onClick={() => setVolumeOpen((open) => !open)}
          aria-label="Atur volume"
          aria-expanded={volumeOpen}
          aria-controls={panelId}
          className="grid size-10 shrink-0 place-items-center rounded-full text-gold-ink transition hover:bg-ivory-deep md:hidden"
        >
          <SlidersHorizontal aria-hidden="true" className="size-5" />
        </button>
        <div className="hidden items-center md:flex">{slider('w-20')}</div>

        <div className={`ml-1 hidden h-4 items-end gap-[3px] sm:flex ${playing && !music.muted ? 'eq-playing' : ''}`} aria-hidden="true">
          {[0.9, 0.5, 0.75].map((h, i) => (
            <span key={i} className="eq-bar" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
        <div className="ml-2 min-w-0">
          <p className="hidden max-w-36 truncate text-xs font-medium text-ink sm:block">{music.title}</p>
          <p className="text-[0.72rem] text-ink-soft" aria-live="polite" data-testid="music-status">
            {statusLabel(music.status, music.muted)}
          </p>
        </div>
      </div>
    </div>
  );
}
