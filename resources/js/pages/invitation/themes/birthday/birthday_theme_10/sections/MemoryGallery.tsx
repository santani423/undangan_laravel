import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { useCallback, type KeyboardEvent } from 'react';
import { StopBlock } from '../components/layout/StopBlock';
import { PackIcon } from '../components/ui/PackIcon';
import { ToyCard } from '../components/ui/ToyCard';
import { useInvitation } from '../context/InvitationContext';
import { useSwipe } from '../hooks/useSwipe';
import { cx } from '../lib/cx';
import { STOP_INDEX } from '../lib/journey';
import { setExperience, useExperience } from '../store/experience';
import { GalleryImg } from './GalleryImage';

const FRAME_COLORS = ['coral', 'sky', 'butter', 'mint', 'lavender'];

/** Scene 4 — photo gallery. The active photo also turns the 3D photo carousel. */
export function MemoryGallery() {
    const { gallery: images, showDemoNotices } = useInvitation().config;
    const count = images.length;
    const index = useExperience((s) => Math.min(s.galleryIndex, Math.max(0, count - 1)));

    const go = useCallback((next: number) => setExperience({ galleryIndex: ((next % count) + count) % count }), [count]);
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
        <StopBlock stop={STOP_INDEX.gallery} id="galeri" labelledBy="bt10-galeri-title">
            <ToyCard studs={3} studOffset={3}>
                <p className="bt10-eyebrow">
                    <PackIcon name="camera" size={16} className="bt10-text-lavender-deep" /> Galeri Kenangan
                </p>
                <h2 id="bt10-galeri-title" className="bt10-title">
                    Momen Seru Bersama
                </h2>

                {!current ? (
                    <p className="bt10-notice bt10-notice--lavender">Belum ada foto di galeri.</p>
                ) : (
                    <div
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Galeri foto"
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        className="bt10-gallery"
                    >
                        <div
                            className={`bt10-gallery__frame bt10-frame-${FRAME_COLORS[index % FRAME_COLORS.length]}`}
                            style={{ touchAction: 'pan-y' }}
                            {...swipe.handlers}
                        >
                            <button
                                type="button"
                                className="bt10-gallery__zoom"
                                onClick={() => {
                                    if (!swipe.wasSwipe()) setExperience({ lightboxIndex: index });
                                }}
                                aria-label={`Perbesar foto: ${current.caption}`}
                            >
                                <GalleryImg
                                    key={current.id}
                                    src={current.src}
                                    alt={current.alt}
                                    className="bt10-gallery__img bt10-pop-in"
                                    draggable={false}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <span className="bt10-gallery__expand">
                                    <Expand size={18} aria-hidden="true" />
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={prev}
                                className="bt10-icon-btn bt10-gallery__nav bt10-gallery__nav--prev"
                                aria-label="Foto sebelumnya"
                            >
                                <ChevronLeft size={22} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={next}
                                className="bt10-icon-btn bt10-gallery__nav bt10-gallery__nav--next"
                                aria-label="Foto berikutnya"
                            >
                                <ChevronRight size={22} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="bt10-gallery__meta">
                            <p className="bt10-gallery__caption" aria-live="polite">
                                {current.caption}
                            </p>
                            <span className="bt10-counter">
                                {index + 1} / {count}
                            </span>
                        </div>
                        {current.demo && showDemoNotices && <span className="bt10-demo-badge">Foto contoh</span>}

                        <ul className="bt10-thumbs" aria-label="Pilih foto">
                            {images.map((img, i) => (
                                <li key={img.id}>
                                    <button
                                        type="button"
                                        onClick={() => go(i)}
                                        aria-label={`Foto ${i + 1}: ${img.caption}`}
                                        aria-current={i === index ? 'true' : undefined}
                                        className={cx('bt10-thumb', i === index && `is-active bt10-frame-${FRAME_COLORS[i % FRAME_COLORS.length]}`)}
                                    >
                                        <GalleryImg src={img.src} alt="" loading="lazy" draggable={false} />
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
