import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SVGS } from '../lib/aset';
import { useWedding } from '../lib/context';
import { setUi } from '../lib/journey';
import { SectionHeading } from './Ornament';

type LightboxItem =
    | { kind: 'image'; src: string; alt: string; caption: string }
    | { kind: 'video'; src: string; title: string }
    | { kind: 'embed'; src: string; title: string };

const BLOCK_KEYS = new Set([' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowUp', 'ArrowDown']);

/** Accessible modal lightbox: Esc closes, ←/→ navigate, focus is trapped and restored, page scroll is paused. */
function Lightbox({ items, index, onClose, onNav }: { items: LightboxItem[]; index: number; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
    const dialog = useRef<HTMLDivElement>(null);
    const closeBtn = useRef<HTMLButtonElement>(null);
    const item = items[index];
    const many = items.length > 1;

    useEffect(() => {
        setUi({ overlay: true });
        return () => setUi({ overlay: false });
    }, []);

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        closeBtn.current?.focus();
        const stop = (e: Event) => e.preventDefault();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                onNav(1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                onNav(-1);
            } else if (BLOCK_KEYS.has(e.key) && !(e.target instanceof HTMLVideoElement)) {
                e.preventDefault();
            } else if (e.key === 'Tab' && dialog.current) {
                const f = dialog.current.querySelectorAll<HTMLElement>('button, video, iframe, a[href]');
                if (!f.length) return;
                const first = f[0];
                const last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('wheel', stop, { passive: false });
        window.addEventListener('touchmove', stop, { passive: false });
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('wheel', stop);
            window.removeEventListener('touchmove', stop);
            window.removeEventListener('keydown', onKey);
            previous?.focus({ preventScroll: true });
        };
    }, [onClose, onNav]);

    return (
        <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label="Galeri foto"
            className="wt14 wt14-lightbox"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <figure className="wt14-lightbox-figure">
                {item.kind === 'image' && <img src={item.src} alt={item.alt} className="wt14-lightbox-media" />}
                {item.kind === 'video' && <video src={item.src} controls playsInline className="wt14-lightbox-media wt14-lightbox-video" />}
                {item.kind === 'embed' && (
                    <iframe
                        src={item.src}
                        title={item.title}
                        className="wt14-lightbox-embed"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )}
                <figcaption>
                    {item.kind === 'image' ? item.caption || item.alt : item.title}
                    {many && (
                        <span>
                            {index + 1} / {items.length}
                        </span>
                    )}
                </figcaption>
            </figure>
            <button ref={closeBtn} type="button" onClick={onClose} className="wt14-round wt14-lightbox-close" aria-label="Tutup galeri">
                <X size={20} />
            </button>
            {many && (
                <>
                    <button type="button" onClick={() => onNav(-1)} className="wt14-round wt14-lightbox-nav wt14-prev" aria-label="Sebelumnya">
                        <ChevronLeft size={22} />
                    </button>
                    <button type="button" onClick={() => onNav(1)} className="wt14-round wt14-lightbox-nav wt14-next" aria-label="Berikutnya">
                        <ChevronRight size={22} />
                    </button>
                </>
            )}
        </div>
    );
}

export function Gallery() {
    const w = useWedding();
    const photos = useMemo(() => (w.sections.gallery ? w.gallery : []), [w]);
    const video = w.sections.video ? w.galleryVideo : null;
    const items = useMemo<LightboxItem[]>(
        () => [
            ...photos.map((g) => ({ kind: 'image' as const, src: g.src, alt: g.alt, caption: g.caption })),
            ...(video ? [{ kind: video.kind === 'embed' ? ('embed' as const) : ('video' as const), src: video.src, title: video.title }] : []),
        ],
        [photos, video],
    );
    const [open, setOpen] = useState<number | null>(null);
    const close = useCallback(() => setOpen(null), []);
    const nav = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)), [items.length]);

    return (
        <div>
            <SectionHeading icon="images" eyebrow="Pringgitan · Kenangan" title="Galeri Prewedding" />
            {photos.length > 0 && (
                <ul className="wt14-gallery">
                    {photos.map((g, i) => (
                        <li key={g.id}>
                            <button type="button" onClick={() => setOpen(i)} className="wt14-gallery-item" aria-label={`Perbesar ${g.alt}`}>
                                <img src={g.src} alt="" loading="lazy" className="wt14-gallery-photo" />
                                <img src={SVGS.photoFrame} alt="" aria-hidden="true" className="wt14-gallery-frame" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {video && (
                <div className="wt14-actions">
                    <button type="button" className="wt14-btn" onClick={() => setOpen(items.length - 1)}>
                        <Play size={15} aria-hidden="true" /> {video.title}
                    </button>
                </div>
            )}
            {w.isExampleData && photos.length > 0 && (
                <p className="wt14-note">Foto di atas adalah contoh. Unggah foto prewedding di pengaturan galeri.</p>
            )}
            {/* portal: panels are transformed, which would otherwise trap position:fixed */}
            {open !== null && items[open] && createPortal(<Lightbox items={items} index={open} onClose={close} onNav={nav} />, document.body)}
        </div>
    );
}
