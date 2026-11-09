import { useEffect, useRef } from 'react';

interface LightboxProps {
    foto: string[];
    indeks: number;
    onTutup: () => void;
    onPindah: (indeks: number) => void;
}

/* Lightbox galeri: klik latar / Esc menutup, fokus pindah ke tombol Tutup. */
export default function Lightbox({ foto, indeks, onTutup, onPindah }: LightboxProps) {
    const tutupRef = useRef<HTMLButtonElement>(null);
    const n = foto.length;

    useEffect(() => {
        tutupRef.current?.focus();
    }, [indeks]);

    useEffect(() => {
        const tombol = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onTutup();
        };
        window.addEventListener('keydown', tombol);
        return () => window.removeEventListener('keydown', tombol);
    }, [onTutup]);

    return (
        <div
            className="wt13-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Galeri foto"
            onClick={(e) => {
                if (e.target === e.currentTarget) onTutup();
            }}
        >
            <figure>
                <img src={foto[indeks]} alt={`Foto galeri ${indeks + 1}`} />
                <figcaption>
                    <span>
                        {indeks + 1} / {n}
                    </span>
                    <span className="wt13-baris-btn">
                        <button
                            className="wt13-btn wt13-btn-garis wt13-btn-kecil"
                            type="button"
                            aria-label="Foto sebelumnya"
                            onClick={() => onPindah((indeks + n - 1) % n)}
                        >
                            ‹
                        </button>
                        <button
                            className="wt13-btn wt13-btn-garis wt13-btn-kecil"
                            type="button"
                            aria-label="Foto berikutnya"
                            onClick={() => onPindah((indeks + 1) % n)}
                        >
                            ›
                        </button>
                        <button ref={tutupRef} className="wt13-btn wt13-btn-garis wt13-btn-kecil" type="button" onClick={onTutup}>
                            Tutup
                        </button>
                    </span>
                </figcaption>
            </figure>
        </div>
    );
}
