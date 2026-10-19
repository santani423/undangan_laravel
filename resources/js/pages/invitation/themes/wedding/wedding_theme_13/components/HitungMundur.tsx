import { useEffect, useState } from 'react';

interface Sisa {
    hari: number;
    jam: number;
    menit: number;
    detik: number;
    selesai: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

function hitung(target: number): Sisa {
    const d = target - Date.now();
    if (d <= 0) return { hari: 0, jam: 0, menit: 0, detik: 0, selesai: true };
    const s = Math.floor(d / 1000);
    return { hari: Math.floor(s / 86400), jam: Math.floor((s % 86400) / 3600), menit: Math.floor((s % 3600) / 60), detik: s % 60, selesai: false };
}

/* Hitung mundur Poé/Jam/Menit/Detik. Nilai awal statis (0/00) agar markup server & klien sama. */
export default function HitungMundur({ target }: { target: string }) {
    const [sisa, setSisa] = useState<Sisa | null>(null);

    useEffect(() => {
        const t = new Date(target).getTime();
        if (Number.isNaN(t)) return;
        const perbarui = () => {
            const s = hitung(t);
            setSisa(s);
            return !s.selesai;
        };
        if (!perbarui()) return;
        const iv = window.setInterval(() => {
            if (!perbarui()) window.clearInterval(iv);
        }, 1000);
        return () => window.clearInterval(iv);
    }, [target]);

    if (sisa?.selesai) {
        return (
            <div className="wt13-hitung" aria-live="polite">
                <p className="wt13-kecil" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                    Hari bahagia telah tiba. Hatur nuhun atas doanya.
                </p>
            </div>
        );
    }

    return (
        <div className="wt13-hitung" aria-live="polite">
            <div>
                <b>{sisa ? sisa.hari : 0}</b>
                <small>Poé</small>
            </div>
            <div>
                <b>{pad(sisa?.jam ?? 0)}</b>
                <small>Jam</small>
            </div>
            <div>
                <b>{pad(sisa?.menit ?? 0)}</b>
                <small>Menit</small>
            </div>
            <div>
                <b>{pad(sisa?.detik ?? 0)}</b>
                <small>Detik</small>
            </div>
        </div>
    );
}
