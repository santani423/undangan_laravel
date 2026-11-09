import { RotateCcw } from 'lucide-react';
import { useWedding } from '../lib/context';
import { Divider } from './Ornament';

export function ClosingMessage({ onRestart, restartLabel = 'Kembali ke awal' }: { onRestart: () => void; restartLabel?: string }) {
    const w = useWedding();
    const { closing, couple } = w;
    return (
        <div className="wt14-closing">
            <p className="wt14-eyebrow">Panutup</p>
            <h2 className="wt14-closing-title">{closing.title}</h2>
            <p className="wt14-lead">{closing.message}</p>
            <p className="wt14-closing-prayer">{closing.prayer}</p>
            <Divider className="wt14-divider-sm" />
            <p className="wt14-closing-signoff">{closing.signOff}</p>
            <p className="wt14-closing-names">
                {couple.bride.nickname} &amp; {couple.groom.nickname}
            </p>
            {w.mainDateLabel && <p className="wt14-closing-date">{w.mainDateLabel}</p>}
            {w.hashtag && <p className="wt14-closing-tag">{w.hashtag}</p>}
            <button type="button" className="wt14-btn wt14-btn-sm-top" onClick={onRestart}>
                <RotateCcw size={15} aria-hidden="true" /> {restartLabel}
            </button>
            {w.sections.footer && (
                <p className="wt14-credit">
                    Undangan digital oleh{' '}
                    <a href="/" target="_blank" rel="noopener">
                        Undesia
                    </a>
                </p>
            )}
        </div>
    );
}
