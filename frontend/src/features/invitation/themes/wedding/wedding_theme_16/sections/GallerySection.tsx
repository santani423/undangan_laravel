import { CirclePlay, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Lightbox } from '../components/Lightbox';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import { cx } from '../lib/cx';
import type { GalleryCategory, GalleryItem } from '../lib/types';

const FILTERS: { id: 'all' | GalleryCategory; label: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'photo', label: 'Foto' },
    { id: 'video', label: 'Video' },
];

function Thumbnail({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
    const image = item.thumbnail ?? (item.kind === 'image' ? item.src : item.poster);
    return (
        <button type="button" onClick={onOpen} className="wt16-thumb" aria-label={`Buka ${item.caption ?? item.alt}`}>
            {image && <img src={image} alt={item.alt} loading="lazy" decoding="async" className="wt16-thumb__img" />}
            {item.kind === 'video' && (
                <span className="wt16-thumb__play">
                    <CirclePlay aria-hidden="true" size={48} />
                </span>
            )}
            {item.isPlaceholder && <span className="wt16-thumb__badge">Contoh</span>}
        </button>
    );
}

/** Section F — photo/video gallery with an accessible lightbox. */
export function GallerySection() {
    const { config } = useInvitationData();
    const [filter, setFilter] = useState<'all' | GalleryCategory>('all');
    const [index, setIndex] = useState<number | null>(null);

    // Filters only make sense when the gallery mixes photos and a video.
    const filters = useMemo(() => {
        const present = new Set(config.gallery.map((item) => item.category));
        return present.size > 1 ? FILTERS : [];
    }, [config.gallery]);
    const items = useMemo(() => config.gallery.filter((item) => filter === 'all' || item.category === filter), [config.gallery, filter]);
    const anyPlaceholder = config.gallery.some((item) => item.isPlaceholder);

    return (
        <SectionShell id="galeri" eyebrow="Galeri" title="Momen Berharga" icon="gallery" width="lg">
            {filters.length > 0 && (
                <div className="wt16-filters" role="group" aria-label="Filter galeri">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setFilter(f.id)}
                            aria-pressed={filter === f.id}
                            className={cx('wt16-btn', 'wt16-btn--sm', filter === f.id ? 'wt16-btn--primary' : 'wt16-btn--secondary')}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            <ul className="wt16-gallery">
                {items.map((item, i) => (
                    <li key={item.id} data-reveal>
                        <Thumbnail item={item} onOpen={() => setIndex(i)} />
                    </li>
                ))}
            </ul>

            {anyPlaceholder && (
                <p className="wt16-note">
                    <Info aria-hidden="true" size={14} />
                    Ilustrasi contoh — foto dan video pasangan akan tampil di sini.
                </p>
            )}

            <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
        </SectionShell>
    );
}
