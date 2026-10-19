/* Pemuat: siger-gunungan digambar perlahan sambil tekstur adegan 3D dimuat. */

interface PemuatProps {
    nama: string;
    progres: number;
    selesai: boolean;
}

export default function Pemuat({ nama, progres, selesai }: PemuatProps) {
    return (
        <div className={selesai ? 'wt13-pemuat wt13-selesai' : 'wt13-pemuat'} role="status" aria-live="polite">
            <div className="wt13-pemuat-isi">
                <svg className="wt13-gunungan" viewBox="0 0 120 120" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                        <path d="M14 96 L60 14 L106 96 Q60 108 14 96 Z" />
                        <path d="M30 92 L60 36 L90 92" />
                        <path d="M60 58 c-8 10 -8 18 0 24 c8 -6 8 -14 0 -24 z M44 84 h32" />
                    </g>
                </svg>
                <p className="wt13-judul">{nama}</p>
                <p>Nyiapkeun uleman…</p>
                <div className="wt13-bilah">
                    <i style={{ width: `${Math.round(progres * 100)}%` }} />
                </div>
            </div>
        </div>
    );
}
