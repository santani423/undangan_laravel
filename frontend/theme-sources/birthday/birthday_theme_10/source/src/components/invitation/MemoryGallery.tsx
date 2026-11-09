import { useCallback, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { invitationConfig } from '../../config/invitation.config';
import { STOP_INDEX } from '../../config/journey';
import { setExperience, useExperience } from '../../store/experience';
import { useSwipe } from '../../hooks/useSwipe';
import { StopBlock } from '../layout/StopBlock';
import { ToyCard } from '../ui/ToyCard';
import { PackIcon } from '../ui/PackIcon';
import { GalleryImg } from './GalleryImage';

const FRAME_COLORS = ['border-toy-coral', 'border-toy-sky', 'border-toy-butter', 'border-toy-mint', 'border-toy-lavender'];

/** Scene 4 — photo gallery. The active photo also turns the 3D photo carousel. */
export function MemoryGallery() {
  const images = invitationConfig.gallery;
  const index = useExperience((s) => Math.min(s.galleryIndex, Math.max(0, images.length - 1)));
  const count = images.length;

  const go = useCallback(
    (next: number) => setExperience({ galleryIndex: ((next % count) + count) % count }),
    [count],
  );
  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const swipe = useSwipe(prev, next);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  const current = images[index];

  return (
    <StopBlock stop={STOP_INDEX.gallery} as="section" id="galeri" labelledBy="galeri-title">
      <ToyCard studs={3} studOffset={3}>
        <p className="eyebrow">
          <PackIcon name="camera" size={16} className="text-toy-lavender-deep" /> Galeri Kenangan
        </p>
        <h2 id="galeri-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Momen Seru Bersama
        </h2>

        {count === 0 ? (
          <p className="mt-4 rounded-2xl bg-toy-lavender/25 p-4 text-sm">Belum ada foto di galeri.</p>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Galeri foto"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="mt-4 rounded-3xl"
          >
            <div
              className={`relative overflow-hidden rounded-3xl border-[7px] bg-white ${FRAME_COLORS[index % FRAME_COLORS.length]} shadow-[0_6px_0_rgb(59_51_85/0.12)]`}
              style={{ touchAction: 'pan-y' }}
              {...swipe.handlers}
            >
              <button
                type="button"
                className="group block aspect-[4/3] w-full cursor-zoom-in"
                onClick={() => {
                  if (!swipe.wasSwipe()) setExperience({ lightboxIndex: index });
                }}
                aria-label={`Perbesar foto: ${current.caption}`}
              >
                <GalleryImg
                  key={current.id}
                  src={current.src}
                  alt={current.alt}
                  className="h-full w-full animate-pop-in object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-toy-ink shadow transition-transform group-hover:scale-110">
                  <Expand size={18} aria-hidden="true" />
                </span>
              </button>
              <button type="button" onClick={prev} className="toy-icon-btn absolute top-1/2 left-2 -translate-y-1/2" aria-label="Foto sebelumnya">
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" onClick={next} className="toy-icon-btn absolute top-1/2 right-2 -translate-y-1/2" aria-label="Foto berikutnya">
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="font-display text-lg leading-snug font-semibold" aria-live="polite">
                {current.caption}
              </p>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 font-display text-sm font-semibold tabular-nums shadow-sm">
                {index + 1} / {count}
              </span>
            </div>
            {current.demo && invitationConfig.showDemoNotices && <span className="demo-badge mt-1">Foto contoh</span>}

            <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Pilih foto">
              {images.map((img, i) => (
                <li key={img.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Foto ${i + 1}: ${img.caption}`}
                    aria-current={i === index ? 'true' : undefined}
                    className={`block h-14 w-[4.5rem] overflow-hidden rounded-xl border-[3px] transition-transform ${
                      i === index ? `${FRAME_COLORS[i % FRAME_COLORS.length]} scale-105` : 'border-white opacity-75 hover:opacity-100'
                    }`}
                  >
                    <GalleryImg src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ToyCard>
    </StopBlock>
  );
}
