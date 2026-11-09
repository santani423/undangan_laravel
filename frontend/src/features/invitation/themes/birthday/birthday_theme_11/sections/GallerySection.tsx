import { useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { SceneSection, SectionHeading } from '../components/SceneSection';
import { useSmile } from '../context/SmileContext';
import { MISSING_PHOTO, smileAssets } from '../lib/assets';
import { cx } from '../lib/helpers';
import { SECTION_BY_KEY } from '../lib/sections';

const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];

/** 5 · Gallery — polaroids flip onto a clothesline; the grid opens the lightbox. */
export function GallerySection({ onOpen }: { onOpen: (index: number) => void }) {
    const { config, reducedMotion } = useSmile();
    const def = SECTION_BY_KEY.gallery;
    const photos = config.gallery;
    const [missing, setMissing] = useState<ReadonlySet<number>>(new Set());
    // Gentle 3D tilt that follows the pointer (mouse/pen only, never with reduced motion).
    const [tilt] = useState(() => !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

    const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
        const frame = e.currentTarget;
        const r = frame.getBoundingClientRect();
        frame.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
        frame.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`);
    };
    const onLeave = (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.currentTarget.style.removeProperty('--rx');
        e.currentTarget.style.removeProperty('--ry');
    };

    return (
        <SceneSection
            def={def}
            art={smileAssets.toothFriend}
            artSize={[300, 300]}
            className="bt11-scene--wide"
            panelClassName="bt11-scene__panel--wide"
        >
            <SectionHeading def={def} />
            <p data-reveal="">{config.copy.galleryIntro}</p>
            <ul className="bt11-photo-grid" data-reveal="">
                {photos.map((p, i) => (
                    <li key={`${i}-${p.src}`}>
                        <button
                            type="button"
                            className={cx('bt11-photo-frame', missing.has(i) && 'is-missing')}
                            style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
                            aria-haspopup="dialog"
                            aria-label={`Buka foto ${i + 1} dari ${photos.length}: ${p.caption || p.alt}`}
                            data-photo={i}
                            onClick={() => onOpen(i)}
                            onPointerMove={tilt ? onMove : undefined}
                            onPointerLeave={tilt ? onLeave : undefined}
                        >
                            <span className="bt11-photo-frame__img">
                                <img
                                    src={missing.has(i) ? MISSING_PHOTO : p.src}
                                    alt={p.alt}
                                    loading="lazy"
                                    width={400}
                                    height={400}
                                    onError={() => setMissing((set) => new Set(set).add(i))}
                                />
                            </span>
                            <span className="bt11-photo-frame__caption">{p.caption}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {photos.some((p) => p.demo) && (
                <p className="bt11-small" data-reveal="">
                    Kartu-kartu ini hanya contoh pengganti foto.
                </p>
            )}
        </SceneSection>
    );
}
