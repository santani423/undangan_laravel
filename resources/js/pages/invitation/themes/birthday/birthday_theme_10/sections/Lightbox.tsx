import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { PackIcon } from '../components/ui/PackIcon';
import { useInvitation } from '../context/InvitationContext';
import { useSwipe } from '../hooks/useSwipe';
import { lockScroll } from '../lib/scrollLock';
import { setExperience, useExperience } from '../store/experience';
import { GalleryImg } from './GalleryImage';

/** Enlarged photo viewer: modal dialog with focus trap, Esc/arrow keys and swipe. */
export function Lightbox() {
    const images = useInvitation().config.gallery;
    const index = useExperience((s) => s.lightboxIndex);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const count = images.length;
    const open = index !== null && index < count;

    const close = useCallback(() => setExperience({ lightboxIndex: null }), []);
    const go = useCallback(
        (delta: number) => {
            if (index === null) return;
            const next = (index + delta + count) % count;
            setExperience({ lightboxIndex: next, galleryIndex: next });
        },
        [index, count],
    );
    const swipe = useSwipe(
        () => go(-1),
        () => go(1),
    );
    const goRef = useRef(go);
    goRef.current = go;

    // Open/close lifecycle: scroll lock, initial focus, focus restore.
    useEffect(() => {
        if (!open) return;
        const opener = document.activeElement as HTMLElement | null;
        const release = lockScroll();
        closeRef.current?.focus();
        return () => {
            release();
            opener?.focus({ preventScroll: true });
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') goRef.current(-1);
            else if (e.key === 'ArrowRight') goRef.current(1);
            else if (e.key === 'Tab' && dialogRef.current) {
                const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
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
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, close]);

    if (!open) return null;
    const image = images[index];

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bt10-lightbox-caption"
            className="bt10-lightbox"
            onClick={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <button ref={closeRef} type="button" onClick={close} className="bt10-icon-btn bt10-lightbox__close" aria-label="Tutup galeri">
                <PackIcon name="close" size={22} />
            </button>

            <figure className="bt10-lightbox__figure bt10-pop-in" style={{ touchAction: 'pan-y' }} {...swipe.handlers}>
                <div className="bt10-lightbox__frame">
                    <GalleryImg key={image.id} src={image.src} alt={image.alt} className="bt10-lightbox__img" draggable={false} />
                </div>
                <figcaption id="bt10-lightbox-caption" className="bt10-lightbox__caption">
                    {image.caption}
                    <span className="bt10-lightbox__count">
                        {index + 1} / {count}
                    </span>
                </figcaption>
            </figure>

            {count > 1 && (
                <div className="bt10-lightbox__nav">
                    <button type="button" onClick={() => go(-1)} className="bt10-icon-btn bt10-icon-btn--lg" aria-label="Foto sebelumnya">
                        <ChevronLeft size={24} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => go(1)} className="bt10-icon-btn bt10-icon-btn--lg" aria-label="Foto berikutnya">
                        <ChevronRight size={24} aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
}
