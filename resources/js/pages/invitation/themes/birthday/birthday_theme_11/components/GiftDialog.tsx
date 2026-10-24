import { useState } from 'react';
import { useSmile } from '../context/SmileContext';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { smileAssets } from '../lib/assets';
import { copyToClipboard } from '../lib/browser';
import { CloseIcon } from './Icons';

/** Digital gift sheet: bank accounts and e-wallets (with QRIS) from the invitation, each with a copy button. */
export function GiftDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { config, audio } = useSmile();
    const { ref, onBackdropClick, close } = useNativeDialog(open, onClose);
    const [copied, setCopied] = useState<string | null>(null);

    const copy = async (id: string, number: string) => {
        const ok = await copyToClipboard(number);
        setCopied(ok ? id : `${id}:failed`);
        if (ok) audio.play('pop');
        window.setTimeout(() => setCopied((c) => (c === id || c === `${id}:failed` ? null : c)), 2200);
    };

    return (
        <dialog ref={ref} className="bt11-sheet" aria-labelledby="bt11-gift-title" onClick={onBackdropClick}>
            <div className="bt11-sheet__inner">
                <button className="bt11-sheet__close" type="button" aria-label="Tutup kado digital" onClick={close}>
                    <CloseIcon />
                </button>
                <img className="bt11-sheet__art" src={smileAssets.gift} alt="" width={120} height={120} />
                <h3 id="bt11-gift-title">Kado Digital</h3>
                <p className="bt11-sheet__details">
                    Doa dan kehadiranmu sudah lebih dari cukup. Namun bila ingin mengirim tanda kasih untuk {config.child.name}, kamu bisa memakai
                    informasi berikut.
                </p>
                <ul className="bt11-gift-list">
                    {config.gift.accounts.map((a) => (
                        <li key={a.id} className="bt11-gift">
                            <p className="bt11-gift__provider">{a.provider}</p>
                            {a.number && <p className="bt11-gift__number">{a.number}</p>}
                            {a.holder && <p className="bt11-gift__holder">a.n. {a.holder}</p>}
                            {a.qrisUrl && <img className="bt11-gift__qris" src={a.qrisUrl} alt={`Kode QRIS ${a.provider}`} loading="lazy" />}
                            {a.number && (
                                <button className="bt11-btn bt11-btn--ghost bt11-btn--small" type="button" onClick={() => void copy(a.id, a.number)}>
                                    {copied === a.id ? 'Tersalin!' : copied === `${a.id}:failed` ? 'Salin manual, ya' : 'Salin nomor'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                {config.showDemoNotices && <p className="bt11-small">Nomor di atas hanya contoh.</p>}
            </div>
        </dialog>
    );
}
