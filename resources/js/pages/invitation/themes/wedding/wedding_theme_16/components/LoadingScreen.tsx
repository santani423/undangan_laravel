import { useEffect, useState } from 'react';
import { cx } from '../lib/cx';
import { useSceneStatus } from '../scene/sceneStatus';

const HEART = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];

/** The pixel heart of the loading screen (blush highlights on the two top lobes). */
export function VoxelHeart() {
    return (
        <div className="wt16-voxel-heart" aria-hidden="true">
            {HEART.flatMap((row, y) =>
                [...row].map((cell, x) => (
                    <span
                        key={`${x}-${y}`}
                        style={{ background: cell === '1' ? (y < 2 && (x === 1 || x === 4) ? '#eda6a6' : '#c56f78') : 'transparent' }}
                    />
                )),
            )}
        </div>
    );
}

/**
 * Shown while the 3D garden loads. Guests can skip it after a few seconds;
 * it also gives up automatically so slow devices are never stuck here.
 */
export function LoadingScreen({ active, title }: { active: boolean; title: string }) {
    const status = useSceneStatus();
    const [skipped, setSkipped] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    // Without the 3D garden there is nothing to wait for: never shown.
    const [removed, setRemoved] = useState(!active);
    const done = !active || skipped || status.phase === 'ready' || status.phase === 'failed';
    const percent = Math.round(status.progress * 100);

    useEffect(() => {
        if (!active) return;
        const skipTimer = window.setTimeout(() => setCanSkip(true), 4000);
        const giveUpTimer = window.setTimeout(() => setSkipped(true), 15000);
        return () => {
            window.clearTimeout(skipTimer);
            window.clearTimeout(giveUpTimer);
        };
    }, [active]);

    useEffect(() => {
        if (!done) return;
        const timer = window.setTimeout(() => setRemoved(true), 700);
        return () => window.clearTimeout(timer);
    }, [done]);

    if (removed) return null;

    return (
        <div className={cx('wt16-loading', done && 'is-done')} role="status" aria-live="polite" aria-busy={!done}>
            <div className="wt16-loading__inner">
                <VoxelHeart />
                <p className="wt16-loading__title">{title}</p>
                <p className="wt16-loading__text">Menyiapkan taman undangan…</p>
                <div className="wt16-progress" aria-hidden="true">
                    <div className="wt16-progress__bar" style={{ width: `${Math.max(6, percent)}%` }} />
                </div>
                <p className="wt16-loading__percent">{percent}%</p>
                {canSkip && !done && (
                    <button type="button" className="wt16-btn wt16-btn--secondary wt16-btn--sm wt16-loading__skip" onClick={() => setSkipped(true)}>
                        Lanjutkan tanpa menunggu
                    </button>
                )}
            </div>
        </div>
    );
}
