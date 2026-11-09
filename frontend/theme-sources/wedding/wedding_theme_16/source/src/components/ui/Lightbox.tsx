import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMusic } from '../../hooks/useAppContext';
import { assetUrl } from '../../lib/assets';
import type { GalleryItem } from '../../types/invitation';

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
    // Own class so the cover's scroll lock (`is-locked`) is never touched.
    document.documentElement.classList.toggle('has-modal', open);
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove('has-modal'), []);

  // Preload neighbours for instant navigation.
  useEffect(() => {
    if (index === null) return;
    [index - 1, index + 1].forEach((i) => {
      const neighbour = items[(i + count) % count];
      if (neighbour?.kind === 'image' && neighbour.src) {
        const img = new Image();
        img.src = assetUrl(neighbour.src) ?? '';
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

  return (
    <dialog
      ref={dialogRef}
      className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ink/85"
      aria-label={item ? `Galeri: ${item.caption ?? item.alt}` : 'Galeri'}
      onClose={onClose}
      onKeyDown={onKeyDown}
      data-testid="lightbox"
    >
      {item && index !== null && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-3 py-14 sm:px-16">
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-1 touch-pan-y items-center justify-center"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {item.kind === 'image' && item.src && (
              <img
                src={assetUrl(item.src)}
                alt={item.alt}
                className="max-h-[75dvh] w-auto max-w-full rounded-md object-contain shadow-2xl"
                decoding="async"
                draggable={false}
              />
            )}
            {item.kind === 'video' && item.src && (
              <video
                src={assetUrl(item.src)}
                poster={assetUrl(item.poster)}
                controls
                playsInline
                className="max-h-[75dvh] w-full rounded-md bg-black"
                onPlay={() => music.status === 'playing' && music.pause()}
              />
            )}
            {item.kind === 'video' && !item.src && item.youtubeId && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.youtubeId)}`}
                title={item.caption ?? item.alt}
                className="aspect-video w-full rounded-md"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <p className="max-w-xl text-center text-sm text-ivory">
            {item.caption ?? item.alt}
            <span className="ml-2 text-ivory/70">
              {index + 1} / {count}
            </span>
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-ivory/90 text-ink"
        aria-label="Tutup galeri"
        autoFocus
      >
        <X aria-hidden="true" className="size-5" />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink sm:left-4"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ivory/90 text-ink sm:right-4"
            aria-label="Foto berikutnya"
          >
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </>
      )}
    </dialog>
  );
}
