import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSmile } from '../context/SmileContext';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { MISSING_PHOTO } from '../lib/assets';
import { ChevronIcon, CloseIcon } from './Icons';

/** Photo viewer: native modal dialog with arrow keys, Home/End, buttons and swipe. */
export function Lightbox({ index, onChange, onClose }: { index: number | null; onChange: (index: number) => void; onClose: () => void }) {
    const { config, audio } = useSmile();
    const photos = config.gallery;
    const n = photos.length;
    const open = index !== null && n > 0;
    const { ref, onBackdropClick, close } = useNativeDialog(open, onClose, () => document.querySelector<HTMLElement>(`[data-photo="${index ?? 0}"]`));
    const [failed, setFailed] = useState<string | null>(null);
    const swipe = useRef<{ x: number; y: number } | null>(null);
    const current = open ? photos[(index + n) % n] : null;

    const show = (i: number) => {
        onChange((i + n) % n);
        audio.play('pop', { volume: 0.5 });
    };

    // Preload neighbours for instant navigation.
    useEffect(() => {
        if (index === null || n < 2) return;
        [index - 1, index + 1].forEach((i) => (new Image().src = photos[(i + n) % n].src));
    }, [index, n, photos]);

    const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
        if (index === null) return;
        if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
        else if (e.key === 'Home') show(0);
        else if (e.key === 'End') show(n - 1);
        else return;
        e.preventDefault();
    };

    return (
        <dialog ref={ref} className="bt11-lightbox" aria-labelledby="bt11-lightbox-caption" onClick={onBackdropClick} onKeyDown={onKeyDown}>
            {current && index !== null && (
                <>
                    <figure
                        className="bt11-lightbox__figure"
                        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
                        onPointerCancel={() => (swipe.current = null)}
                        onPointerUp={(e) => {
                            const start = swipe.current;
                            swipe.current = null;
                            if (!start) return;
                            const dx = e.clientX - start.x;
                            const dy = e.clientY - start.y;
                            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1));
                        }}
                    >
                        <img
                            src={failed === current.src ? MISSING_PHOTO : current.src}
                            alt={current.alt}
                            draggable={false}
                            onError={() => setFailed(current.src)}
                        />
                        <figcaption id="bt11-lightbox-caption">
                            <span>{current.caption || current.alt}</span>
                            <span className="bt11-lightbox__count">
                                {index + 1} / {n}
                            </span>
                        </figcaption>
                    </figure>
                    {n > 1 && (
                        <>
                            <button
                                className="bt11-lightbox__nav bt11-lightbox__nav--prev"
                                type="button"
                                aria-label="Foto sebelumnya"
                                onClick={() => show(index - 1)}
                            >
                                <ChevronIcon direction="left" />
                            </button>
                            <button
                                className="bt11-lightbox__nav bt11-lightbox__nav--next"
                                type="button"
                                aria-label="Foto berikutnya"
                                onClick={() => show(index + 1)}
                            >
                                <ChevronIcon direction="right" />
                            </button>
                        </>
                    )}
                </>
            )}
            <button className="bt11-lightbox__close" type="button" aria-label="Tutup penampil foto" onClick={close}>
                <CloseIcon size={22} />
            </button>
        </dialog>
    );
}
