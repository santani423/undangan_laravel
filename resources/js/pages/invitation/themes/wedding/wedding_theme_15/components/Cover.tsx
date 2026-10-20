import { SVGS } from '../lib/aset';
import { useTheme } from '../lib/context';
import { playOpening } from '../lib/opening';
import { isSceneActive, useApp } from '../lib/store';
import { IconEnvelopeOpen } from './Icons';

function LoadingLine() {
    const status = useApp((s) => s.sceneStatus);
    const progress = useApp((s) => s.loadProgress);
    if (!isSceneActive(status)) return null;
    const ready = status === 'ready';
    const label = ready
        ? 'Hutan ajaib siap dijelajahi'
        : `Menyiapkan hutan ajaib… ${progress > 0 && progress < 100 ? Math.round(progress) + '%' : ''}`;
    return (
        <p className={`wt15-cover__loading ${ready ? 'is-ready' : ''}`} role="status" aria-live="polite">
            <span className="wt15-cover__loading-dots" aria-hidden="true">
                <i />
                <i />
                <i />
            </span>
            {label}
        </p>
    );
}

/** Scene 1 overlay: the personalised invitation cover. The 3D envelope floats in the gap between the two text blocks. */
export function Cover() {
    const { wedding, music } = useTheme();
    const status = useApp((s) => s.sceneStatus);
    const leaving = useApp((s) => s.opening);
    const { bride, groom } = wedding.couple;
    const { guest } = wedding;
    const open = () => playOpening(music && wedding.music.autoplay ? music : null);
    return (
        <section className={`wt15-cover ${leaving ? 'is-leaving' : ''}`} aria-labelledby="wt15-cover-title">
            <div className="wt15-cover__top" data-ui>
                <p className="wt15-eyebrow">The Wedding of</p>
                <h1 id="wt15-cover-title" className="wt15-display wt15-cover__names">
                    {bride.nickname} <span className="wt15-amp">&amp;</span> {groom.nickname}
                </h1>
                {wedding.weddingDateLabel && <p className="wt15-cover__date">{wedding.weddingDateLabel}</p>}
            </div>

            {/* Without WebGL the envelope is drawn in 2D so the cover keeps its centrepiece. */}
            <div className="wt15-cover__stage" aria-hidden="true">
                {!isSceneActive(status) && (
                    <div className="wt15-cover__envelope2d">
                        <img src={SVGS.floralArch} alt="" />
                        <IconEnvelopeOpen className="wt15-cover__envelope-icon" width={64} height={64} />
                    </div>
                )}
            </div>

            <div className="wt15-cover__bottom" data-ui>
                {wedding.sections.guest && (
                    <>
                        <p className="wt15-cover__to">{guest.title}</p>
                        <p className="wt15-cover__guest">{guest.name || guest.label}</p>
                    </>
                )}
                <button type="button" className="wt15-btn wt15-btn--primary wt15-btn--lg wt15-cover__cta" onClick={open} disabled={leaving}>
                    <IconEnvelopeOpen />
                    {guest.buttonText}
                </button>
                <p className="wt15-cover__hint">Ketuk tombol{isSceneActive(status) ? ' atau amplopnya' : ''} untuk membuka undangan ✨</p>
                <LoadingLine />
                {wedding.isSample && <p className="wt15-cover__sample">Pratinjau dengan data contoh</p>}
            </div>
        </section>
    );
}
