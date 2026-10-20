import { SVGS } from '../lib/aset';

export function LoadingScreen({ progress, label, hidden }: { progress: number; label: string; hidden: boolean }) {
    const pct = Math.round(progress * 100);
    return (
        <div className={`wt14-loading ${hidden ? 'wt14-hidden' : ''}`} aria-hidden={hidden} role="status" aria-live="polite">
            <div className="wt14-loading-inner">
                <img src={SVGS.kawungMotif} alt="" aria-hidden="true" className="wt14-loading-motif" />
                <p className="wt14-loading-title">Pawiwahan Agung</p>
                <p className="wt14-loading-label">{label}</p>
                <div
                    className="wt14-loading-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    aria-label="Memuat undangan"
                >
                    <div style={{ width: `${pct}%` }} />
                </div>
                <p className="wt14-loading-pct">{pct}%</p>
            </div>
        </div>
    );
}
