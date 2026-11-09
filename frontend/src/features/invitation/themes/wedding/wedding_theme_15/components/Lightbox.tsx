import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useWedding } from '../lib/context';
import { setApp, useApp } from '../lib/store';
import { IconChevronLeft, IconChevronRight, IconClose } from './Icons';

const CLOSE_MS = 280;

/** Full-screen gallery viewer: keyboard (Esc / ← / →), swipe, focus trap, neighbour preloading. */
export function Lightbox() {
    const index = useApp((s) => s.lightboxIndex);
    const images = useWedding().gallery;
    const open = index !== null && index < images.length;
    const dialog = useRef<HTMLDivElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const [dir, setDir] = useState(0);
    const [closing, setClosing] = useState(false);
    const touch = useRef<{ x: number; y: number } | null>(null);

    const go = useCallback(
        (delta: number) => {
            if (index === null) return;
            setDir(delta);
            setApp({ lightboxIndex: (index + delta + images.length) % images.length });
        },
        [index, images.length],
    );
    const close = useCallback(() => setClosing(true), []);

    useEffect(() => {
        if (!closing) return;
        const t = setTimeout(() => {
            setClosing(false);
            setDir(0);
            setApp({ lightboxIndex: null });
        }, CLOSE_MS);
        return () => clearTimeout(t);
    }, [closing]);

    useEffect(() => {
        if (!open) return;
        returnFocus.current = document.activeElement as HTMLElement;
        document.documentElement.classList.add('wt15-modal');
        const t = setTimeout(() => dialog.current?.querySelector<HTMLElement>('.wt15-lightbox__close')?.focus(), 30);
        return () => {
            clearTimeout(t);
            document.documentElement.classList.remove('wt15-modal');
            returnFocus.current?.focus?.();
        };
    }, [open]);

    useEffect(() => {
        if (index === null || !images.length) return;
        for (const d of [-1, 1]) {
            const img = new Image();
            img.src = images[(index + d + images.length) % images.length].src;
        }
    }, [index, images]);

    // Esc / ← / → work from the moment the viewer opens, wherever focus is.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight' && images.length > 1) go(1);
            else if (e.key === 'ArrowLeft' && images.length > 1) go(-1);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, close, go, images.length]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            const focusables = dialog.current?.querySelectorAll<HTMLElement>('button');
            if (!focusables?.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    if (!open) return null;
    const img = images[index];
    const single = images.length < 2;

    return (
        <div
            ref={dialog}
            className={`wt15-lightbox ${closing ? 'is-leaving' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Galeri foto, ${index + 1} dari ${images.length}`}
            onKeyDown={onKeyDown}
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
            onTouchEnd={(e) => {
                if (!touch.current) return;
                const dx = e.changedTouches[0].clientX - touch.current.x;
                const dy = e.changedTouches[0].clientY - touch.current.y;
                if (!single && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
                else if (dy > 90) close();
                touch.current = null;
            }}
        >
            <button type="button" className="wt15-lightbox__close wt15-icon-btn" onClick={close} aria-label="Tutup galeri">
                <IconClose />
            </button>
            <figure className="wt15-lightbox__figure">
                <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    className={`wt15-lightbox__img ${dir > 0 ? 'from-right' : dir < 0 ? 'from-left' : ''}`}
                    draggable={false}
                />
                <figcaption className="wt15-lightbox__caption">
                    {img.caption && <span>{img.caption}</span>}
                    {img.isDemo && <span className="wt15-tag">Ilustrasi contoh</span>}
                    <span className="wt15-lightbox__count">
                        {index + 1} / {images.length}
                    </span>
                </figcaption>
            </figure>
            {!single && (
                <>
                    <button
                        type="button"
                        className="wt15-lightbox__nav wt15-lightbox__nav--prev wt15-icon-btn"
                        onClick={() => go(-1)}
                        aria-label="Foto sebelumnya"
                    >
                        <IconChevronLeft />
                    </button>
                    <button
                        type="button"
                        className="wt15-lightbox__nav wt15-lightbox__nav--next wt15-icon-btn"
                        onClick={() => go(1)}
                        aria-label="Foto berikutnya"
                    >
                        <IconChevronRight />
                    </button>
                </>
            )}
        </div>
    );
}
