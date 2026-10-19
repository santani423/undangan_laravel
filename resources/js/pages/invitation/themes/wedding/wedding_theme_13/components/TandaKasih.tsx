import type { BankAccount, DigitalWallet } from '@/types/invitation';
import { useEffect, useRef, useState } from 'react';
import { Ikon } from './Ikon';

/** "000011112222" → "0000 1111 2222" seperti tampilan nomor pada tema asli. */
const formatNomor = (n: string) => (/^\d+$/.test(n.trim()) ? n.trim().replace(/(\d{4})(?=\d)/g, '$1 ') : n.trim());

function BarisRekening({ judul, nomor }: { judul: string; nomor: string }) {
    const [label, setLabel] = useState('Salin');
    const nomorRef = useRef<HTMLElement>(null);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const salin = () => {
        const ok = () => {
            setLabel('Tersalin');
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setLabel('Salin'), 1600);
        };
        // cadangan bila clipboard tidak diizinkan: blok nomornya agar mudah disalin manual
        const pilih = () => {
            const el = nomorRef.current;
            const sel = window.getSelection();
            if (!el || !sel) return;
            const r = document.createRange();
            r.selectNodeContents(el);
            sel.removeAllRanges();
            sel.addRange(r);
            setLabel('Terpilih');
        };
        try {
            navigator.clipboard.writeText(nomor.replace(/\s/g, '')).then(ok, pilih);
        } catch {
            pilih();
        }
    };

    return (
        <div className="wt13-rek">
            <div>
                <span className="wt13-kecil">{judul}</span>
                <br />
                <b ref={nomorRef}>{formatNomor(nomor)}</b>
            </div>
            <button className="wt13-btn wt13-btn-garis wt13-btn-kecil" type="button" onClick={salin}>
                {label}
            </button>
        </div>
    );
}

/* Tanda kasih: rekening bank, dompet digital, dan QRIS. */
export default function TandaKasih({ rekening, dompet }: { rekening: BankAccount[]; dompet: DigitalWallet[] }) {
    const qris = dompet.filter((w) => w.qrisQrUrl);

    return (
        <div>
            <h3 className="wt13-judul-ikon">
                <Ikon nama="hadiah" />
                Tanda Kasih
            </h3>
            <p className="wt13-kecil" style={{ margin: '6px 0 12px' }}>
                Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:
            </p>
            <div className="wt13-rekening">
                {rekening.map((r, i) => (
                    <BarisRekening key={`b${i}`} judul={`${r.bankName} · a.n. ${r.accountName}`} nomor={r.accountNumber} />
                ))}
                {dompet
                    .filter((w) => w.accountNumber.trim())
                    .map((w, i) => (
                        <BarisRekening key={`w${i}`} judul={`${w.label || w.provider} · a.n. ${w.accountName}`} nomor={w.accountNumber} />
                    ))}
            </div>
            {qris.map((w, i) => (
                <div className="wt13-qris" key={i}>
                    <p className="wt13-kecil" style={{ margin: '12px 0 6px' }}>
                        QRIS{w.label || w.provider ? ` · ${w.label || w.provider}` : ''}
                    </p>
                    <img src={w.qrisQrUrl ?? ''} alt="Kode QRIS untuk tanda kasih" loading="lazy" />
                </div>
            ))}
        </div>
    );
}
