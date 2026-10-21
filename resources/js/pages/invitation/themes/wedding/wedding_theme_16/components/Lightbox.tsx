import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { useMusic } from '../hooks/useAppContext';
import type { GalleryItem } from '../lib/types';

interface LightboxProps {
    items: GalleryItem[];
    index: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

/**
 * Accessible media viewer built on the native <dialog> element (focus
 * trapping, Esc to close). Arrow keys, on-screen buttons and horizontal
 * swipes move between items.
 */
export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const swipeStart = useRef<{ x: number; y: number } | null>(null);
    const music = useMusic();
    const open = index !== null;
    const item = index !== null ? items[index] : null;
    const count = items.length;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
        // Own class so the cover's scroll lock (`wt16-locked`) is never touched.
        document.documentElement.classList.toggle('wt16-modal', open);
    }, [open]);

    useEffect(() => () => document.documentElement.classList.remove('wt16-modal'), []);

    // Preload neighbours for instant navigation.
    useEffect(() => {
        if (index === null) return;
        [index - 1, index + 1].forEach((i) => {
            const neighbour = items[(i + count) % count];
            if (neighbour?.kind === 'image' && neighbour.src) {
                const img = new Image();
                img.src = neighbour.src;
            }
        });
    }, [index, items, count]);

    const step = (delta: number) => {
        if (index === null || count < 2) return;
        onIndexChange((index + delta + count) % count);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') step(1);
        if (event.key === 'ArrowLeft') step(-1);
    };

    const onPointerDown = (event: PointerEvent) => {
        swipeStart.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    };

    const pauseMusic = () => music.status === 'playing' && music.pause();

    return (
        <dialog
            ref={dialogRef}
            className="wt16-lightbox"
            aria-label={item ? `Galeri: ${item.caption ?? item.alt}` : 'Galeri'}
            onClose={onClose}
            onKeyDown={onKeyDown}
        >
            {item && index !== null && (
                <div className="wt16-lightbox__body">
                    <div className="wt16-lightbox__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                        {item.kind === 'image' && item.src && (
                            <img src={item.src} alt={item.alt} className="wt16-lightbox__image" decoding="async" draggable={false} />
                        )}
                        {item.kind === 'video' && item.src && (
                            <video src={item.src} poster={item.poster} controls playsInline className="wt16-lightbox__video" onPlay={pauseMusic} />
                        )}
                        {item.kind === 'video' && !item.src && item.embedUrl && (
                            <iframe
                                src={item.embedUrl}
                                title={item.caption ?? item.alt}
                                className="wt16-lightbox__embed"
                                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onLoad={pauseMusic}
                            />
                        )}
                    </div>
                    <p className="wt16-lightbox__caption">
                        {item.caption ?? item.alt}
                        <span className="wt16-lightbox__count">
                            {index + 1} / {count}
                        </span>
                    </p>
                </div>
            )}
            <button type="button" onClick={onClose} className="wt16-lightbox__btn wt16-lightbox__btn--close" aria-label="Tutup galeri" autoFocus>
                <X aria-hidden="true" size={20} />
            </button>
            {count > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => step(-1)}
                        className="wt16-lightbox__btn wt16-lightbox__btn--prev"
                        aria-label="Media sebelumnya"
                    >
                        <ChevronLeft aria-hidden="true" size={24} />
                    </button>
                    <button
                        type="button"
                        onClick={() => step(1)}
                        className="wt16-lightbox__btn wt16-lightbox__btn--next"
                        aria-label="Media berikutnya"
                    >
                        <ChevronRight aria-hidden="true" size={24} />
                    </button>
                </>
            )}
        </dialog>
    );
}
