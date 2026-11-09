import { useEffect, useState } from 'react';
import { toyAssets } from '../../lib/assets';
import { cx } from '../../lib/cx';
import { useExperience } from '../../store/experience';

/**
 * Covers the page while the 3D world downloads. Progress comes from the
 * scene's loading manager (reported by the canvas); a safety timeout lets
 * guests through even if a non-critical asset hangs.
 */
export function LoadingScreen({ active }: { active: boolean }) {
    const sceneReady = useExperience((s) => s.sceneReady);
    const progress = useExperience((s) => s.loadProgress);
    const failed = useExperience((s) => s.webglUnavailable);
    const [timedOut, setTimedOut] = useState(false);
    const [hidden, setHidden] = useState(!active);

    const done = !active || sceneReady || failed || timedOut;

    useEffect(() => {
        if (done) return;
        const t = window.setTimeout(() => setTimedOut(true), 15000);
        return () => window.clearTimeout(t);
    }, [done]);

    useEffect(() => {
        if (!done) return;
        const t = window.setTimeout(() => setHidden(true), 700);
        return () => window.clearTimeout(t);
    }, [done]);

    if (hidden) return null;
    const pct = Math.round(done ? 100 : progress);

    return (
        <div className={cx('bt10-loading', done && 'is-done')}>
            <div className="bt10-loading__art" aria-hidden="true">
                <img src={toyAssets.illustrations.house} alt="" className="bt10-loading__house" />
                <img src={toyAssets.illustrations.balloons} alt="" className="bt10-loading__balloons bt10-bob" />
                <img src={toyAssets.illustrations.tree} alt="" className="bt10-loading__tree" />
            </div>
            <div className="bt10-loading__body">
                <p className="bt10-loading__title">Menyiapkan Dunia Mainan…</p>
                <div
                    className="bt10-progress"
                    role="progressbar"
                    aria-label="Memuat dunia 3D"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                >
                    <div className="bt10-progress__bar" style={{ width: `${Math.max(6, pct)}%` }} />
                </div>
                <p className="bt10-loading__pct">{pct}%</p>
            </div>
        </div>
    );
}
