import { smileAssets } from '../lib/assets';
import { cx } from '../lib/helpers';

export type LoaderPhase = 'loading' | 'fading' | 'done';

/** Full-screen loading screen with a real progress bar and status messages. */
export function Loader({ title, progress, message, phase }: { title: string; progress: number; message: string; phase: LoaderPhase }) {
    if (phase === 'done') return null;
    return (
        <div className={cx('bt11-loader', phase === 'fading' && 'is-done')}>
            <div className="bt11-loader__inner">
                <img className="bt11-loader__mascot" src={smileAssets.mascot} alt="" width={148} height={148} />
                <p className="bt11-loader__title">{title}</p>
                <div
                    className="bt11-loader__track"
                    role="progressbar"
                    aria-label="Memuat petualangan"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                >
                    <span style={{ transform: `scaleX(${progress})` }} />
                </div>
                <p className="bt11-loader__status" aria-live="polite">
                    {message}
                </p>
            </div>
        </div>
    );
}
