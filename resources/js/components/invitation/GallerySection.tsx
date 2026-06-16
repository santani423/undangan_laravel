import { useEffect, useState } from 'react';
import type { GalleryItem } from '@/types/invitation';

interface GallerySectionProps {
    items: GalleryItem[];
    styles: {
        grid: string;
        item: string;
        thumb: string;
        overlay: string;
        filterBar: string;
        filterBtn: string;
        filterBtnActive: string;
    };
    filters?: { key: string; label: string }[];
    showFilters?: boolean;
}

interface LightboxState {
    open: boolean;
    index: number;
}

export default function GallerySection({ items, styles, filters, showFilters = false }: GallerySectionProps) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [lightbox, setLightbox] = useState<LightboxState>({ open: false, index: 0 });

    const filtered = activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter);

    const openLightbox = (idx: number) => {
        setLightbox({ open: true, index: idx });
        document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
        setLightbox((prev) => ({ ...prev, open: false }));
        document.body.style.overflow = '';
    };
    const prev = () => setLightbox((lb) => ({ ...lb, index: (lb.index - 1 + filtered.length) % filtered.length }));
    const next = () => setLightbox((lb) => ({ ...lb, index: (lb.index + 1) % filtered.length }));

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!lightbox.open) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox.open, filtered.length]);

    const currentItem = filtered[lightbox.index];

    return (
        <>
            {/* {showFilters && filters && (
                <div className={styles.filterBar}>
                    <button
                        className={activeFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                        onClick={() => setActiveFilter('all')}
                    >
                        Semua
                    </button>
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            className={activeFilter === f.key ? styles.filterBtnActive : styles.filterBtn}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )} */}

            <div className={styles.grid}>
                {filtered.map((item, i) => (
                    <div key={i} className={styles.item} onClick={() => openLightbox(i)}>
                        <div
                            className={styles.thumb}
                            style={
                                item.url
                                    ? { backgroundImage: `url(${item.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                    : { background: 'linear-gradient(135deg, #a0b8c0, #607880)' }
                            }
                        />
                        <div className={styles.overlay}>Lihat Foto</div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox.open && (
                <div
                    onClick={closeLightbox}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9998,
                        background: 'rgba(0,0,0,0.92)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '30px',
                            color: 'white',
                            fontSize: '2rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        ✕
                    </button>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '80vw',
                            maxHeight: '80vh',
                            border: '3px solid rgba(201,168,76,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        {currentItem?.url ? (
                            <img
                                src={currentItem.url}
                                alt={currentItem.label ?? 'Foto'}
                                style={{ maxWidth: '80vw', maxHeight: '80vh', display: 'block' }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '400px',
                                    height: '300px',
                                    background: 'linear-gradient(135deg,#607880,#304050)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                }}
                            >
                                {currentItem?.label ?? 'Foto'}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prev();
                            }}
                            style={{
                                background: '#2D5016',
                                color: 'white',
                                border: '1px solid #C9A84C',
                                padding: '10px 25px',
                                cursor: 'pointer',
                            }}
                        >
                            ← Sebelumnya
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                next();
                            }}
                            style={{
                                background: '#2D5016',
                                color: 'white',
                                border: '1px solid #C9A84C',
                                padding: '10px 25px',
                                cursor: 'pointer',
                            }}
                        >
                            Berikutnya →
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
