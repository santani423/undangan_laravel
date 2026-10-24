import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { setExperience, useExperience } from '../../store/experience';
import { useSwipe } from '../../hooks/useSwipe';
import { lockScroll } from '../../utils/scrollLock';
import { PackIcon } from '../ui/PackIcon';
import { GalleryImg } from './GalleryImage';

/** Enlarged photo viewer: modal dialog with focus trap, Esc/arrow keys and swipe. */
export function Lightbox() {
  const images = invitationConfig.gallery;
  const index = useExperience((s) => s.lightboxIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && images.length > 0;
  const count = images.length;

  const close = useCallback(() => setExperience({ lightboxIndex: null }), []);
  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      const next = (index + delta + count) % count;
      setExperience({ lightboxIndex: next, galleryIndex: next });
    },
    [index, count],
  );
  const swipe = useSwipe(() => go(-1), () => go(1));
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

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-caption"
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-toy-ink/90 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button ref={closeRef} type="button" onClick={close} className="toy-icon-btn absolute top-4 right-4 z-10" aria-label="Tutup galeri">
        <PackIcon name="close" size={22} />
      </button>

      <figure className="flex w-full max-w-4xl animate-pop-in flex-col items-center" style={{ touchAction: 'pan-y' }} {...swipe.handlers}>
        <div className="w-full overflow-hidden rounded-3xl border-[8px] border-white bg-white shadow-2xl">
          <GalleryImg key={image.id} src={image.src} alt={image.alt} className="max-h-[72svh] w-full object-contain" draggable={false} />
        </div>
        <figcaption id="lightbox-caption" className="mt-4 text-center font-display text-xl font-semibold text-white">
          {image.caption}
          <span className="ml-3 rounded-full bg-white/20 px-3 py-0.5 text-sm tabular-nums">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>

      <div className="mt-4 flex gap-4">
        <button type="button" onClick={() => go(-1)} className="toy-icon-btn h-12 w-12" aria-label="Foto sebelumnya">
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => go(1)} className="toy-icon-btn h-12 w-12" aria-label="Foto berikutnya">
          <ChevronRight size={24} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
