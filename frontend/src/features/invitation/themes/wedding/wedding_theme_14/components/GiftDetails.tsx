import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';
import { useWedding } from '../lib/context';
import type { GiftAccount } from '../lib/types';
import { SectionHeading } from './Ornament';

/** "000011112222" → "0000 1111 2222"; non-numeric values (e.g. e-mail) are kept. */
const groupDigits = (s: string) => (/^[\d\s]+$/.test(s) ? s.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ') : s);

function AccountCard({ acc }: { acc: GiftAccount }) {
    const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const onCopy = async () => {
        window.clearTimeout(timer.current);
        try {
            await copyText(acc.accountNumber.replace(/\s+/g, ''));
            setState('copied');
        } catch {
            setState('error');
        }
        timer.current = window.setTimeout(() => setState('idle'), 3200);
    };
    return (
        <div className="wt14-card wt14-account">
            <div className="wt14-account-row">
                <div>
                    <p className="wt14-card-eyebrow">{acc.bankName}</p>
                    <p className="wt14-account-number">{groupDigits(acc.accountNumber)}</p>
                    {acc.accountHolder && <p className="wt14-account-holder">a.n. {acc.accountHolder}</p>}
                </div>
                <button
                    type="button"
                    onClick={onCopy}
                    className={`wt14-btn wt14-btn-sm ${state === 'copied' ? 'wt14-btn-done' : ''}`}
                    aria-label={`Salin nomor rekening ${acc.bankName}`}
                >
                    {state === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    {state === 'copied' ? 'Tersalin' : 'Salin'}
                </button>
            </div>
            <p className="wt14-sr-only" role="status" aria-live="polite">
                {state === 'copied' ? 'Nomor rekening tersalin' : state === 'error' ? 'Gagal menyalin' : ''}
            </p>
            {state === 'error' && (
                <p className="wt14-error">Peramban tidak mengizinkan penyalinan otomatis. Silakan pilih dan salin nomor di atas secara manual.</p>
            )}
        </div>
    );
}

export function GiftDetails() {
    const { gift, isExampleData } = useWedding();
    return (
        <div>
            <SectionHeading icon="gift" eyebrow="Tanda Katresnan" title="Amplop Digital" />
            <p className="wt14-lead">{gift.intro}</p>
            <div className="wt14-stack">
                {gift.accounts.map((a) => (
                    <AccountCard key={a.id} acc={a} />
                ))}
            </div>
            {gift.qris.map((q) => (
                <figure key={q.id} className="wt14-qris">
                    <img src={q.src} alt={`Kode QRIS ${q.label}`} />
                    <figcaption>QRIS{q.label ? ` · ${q.label}` : ''}</figcaption>
                </figure>
            ))}
            {isExampleData && <p className="wt14-note">Contoh — bukan rekening asli.</p>}
            <p className="wt14-gift-thanks">{gift.thanks}</p>
        </div>
    );
}
