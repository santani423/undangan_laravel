import { useMemo, useState } from 'react';
import { CirclePlay, Film, Info } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { assetUrl } from '../../lib/assets';
import type { GalleryCategory, GalleryItem } from '../../types/invitation';
import { Lightbox } from '../ui/Lightbox';
import { SectionShell } from '../ui/SectionShell';

const FILTERS: { id: 'all' | GalleryCategory; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'portrait', label: 'Potret' },
  { id: 'engagement', label: 'Lamaran' },
  { id: 'prewedding', label: 'Prewedding' },
  { id: 'video', label: 'Video' },
];

const hasMedia = (item: GalleryItem) => Boolean(item.src || item.youtubeId);

function Thumbnail({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const image = assetUrl(item.thumbnail ?? (item.kind === 'image' ? item.src : item.poster));
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-square w-full overflow-hidden rounded-md border border-gold/40 bg-ivory-deep"
      aria-label={`Buka ${item.caption ?? item.alt}`}
    >
      {image && (
        <img
          src={image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          width={item.width}
          height={item.height}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      {item.kind === 'video' && (
        <span className="absolute inset-0 grid place-items-center bg-ink/25">
          <CirclePlay aria-hidden="true" className="size-12 text-ivory drop-shadow" />
        </span>
      )}
      {item.isPlaceholder && (
        <span className="absolute left-1.5 top-1.5 rounded bg-ink/75 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-ivory">
          Contoh
        </span>
      )}
    </button>
  );
}

/** Section F — filterable photo/video gallery with an accessible lightbox. */
export function GallerySection() {
  const { config } = useInvitationData();
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all');
  const [index, setIndex] = useState<number | null>(null);

  const items = useMemo(
    () => config.gallery.filter((item) => filter === 'all' || item.category === filter),
    [config.gallery, filter],
  );
  const viewable = useMemo(() => items.filter(hasMedia), [items]);
  const anyPlaceholder = config.gallery.some((item) => item.isPlaceholder);

  return (
    <SectionShell id="galeri" eyebrow="Galeri" title="Momen Berharga" icon="gallery" width="lg">
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter galeri">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="sub-card text-center text-sm text-ink-soft">Belum ada media pada kategori ini.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-testid="gallery-grid">
          {items.map((item) => (
            <li key={item.id} data-reveal>
              {hasMedia(item) ? (
                <Thumbnail item={item} onOpen={() => setIndex(viewable.indexOf(item))} />
              ) : (
                <div className="relative grid aspect-square place-items-center overflow-hidden rounded-md border border-dashed border-gold/60 bg-ivory-deep/80 p-3 text-center">
                  {item.poster && (
                    <img src={assetUrl(item.poster)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
                  )}
                  <div className="relative">
                    <Film aria-hidden="true" className="mx-auto size-8 text-gold-deep" />
                    <p className="mt-2 text-xs font-medium text-ink">{item.caption ?? item.alt}</p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {anyPlaceholder && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
          <Info aria-hidden="true" className="size-3.5 shrink-0" />
          Ilustrasi contoh — ganti dengan foto dan video milik pasangan.
        </p>
      )}

      <Lightbox items={viewable} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </SectionShell>
  );
}
