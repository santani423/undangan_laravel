import { Pause, Play, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useMusic } from '../hooks/useAppContext';
import { cx } from '../lib/cx';

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
            className={cx('wt16-range', className)}
        />
    );

    return (
        <div ref={wrapperRef} className="wt16-music" role="region" aria-label="Kontrol musik latar">
            {volumeOpen && (
                <div id={panelId} className="wt16-pill wt16-music__panel">
                    {slider('wt16-range--panel')}
                    <span className="wt16-music__percent">{volumePercent}%</span>
                </div>
            )}
            <div className="wt16-pill wt16-music__bar">
                <button
                    type="button"
                    onClick={music.toggle}
                    aria-label={playing ? 'Jeda musik latar' : 'Putar musik latar'}
                    className="wt16-music__toggle"
                >
                    {playing ? <Pause aria-hidden="true" size={20} /> : <Play aria-hidden="true" size={20} className="wt16-music__play" />}
                </button>
                <button
                    type="button"
                    onClick={music.toggleMute}
                    aria-label={music.muted ? 'Bunyikan musik' : 'Senyapkan musik'}
                    aria-pressed={music.muted}
                    className="wt16-music__icon-btn"
                >
                    {music.muted ? <VolumeX aria-hidden="true" size={20} /> : <Volume2 aria-hidden="true" size={20} />}
                </button>
                <button
                    type="button"
                    onClick={() => setVolumeOpen((open) => !open)}
                    aria-label="Atur volume"
                    aria-expanded={volumeOpen}
                    aria-controls={panelId}
                    className="wt16-music__icon-btn wt16-music__volume-btn"
                >
                    <SlidersHorizontal aria-hidden="true" size={20} />
                </button>
                <div className="wt16-music__inline-volume">{slider('wt16-range--inline')}</div>

                <div className={cx('wt16-eq', playing && !music.muted && 'is-playing')} aria-hidden="true">
                    {[0.9, 0.5, 0.75].map((h, i) => (
                        <span key={i} className="wt16-eq__bar" style={{ height: `${h * 16}px`, animationDelay: `${i * 0.18}s` }} />
                    ))}
                </div>
                <div className="wt16-music__meta">
                    <p className="wt16-music__title">{music.title}</p>
                    <p className="wt16-music__status" aria-live="polite">
                        {statusLabel(music.status, music.muted)}
                    </p>
                </div>
            </div>
        </div>
    );
}
