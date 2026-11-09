import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { asset, SVGS } from '../../config/assets'
import { wedding } from '../../config/wedding'
import { setUi } from '../../state/journey'
import { SectionHeading } from '../ui/Ornament'

type LightboxItem = { kind: 'image'; src: string; alt: string; caption?: string } | { kind: 'video'; src: string; poster?: string; title: string }

const ITEMS: LightboxItem[] = [
  ...wedding.gallery.map((g) => ({ kind: 'image' as const, src: asset(g.src), alt: g.alt, caption: g.caption })),
  ...(wedding.galleryVideo.src ? [{ kind: 'video' as const, src: asset(wedding.galleryVideo.src), poster: wedding.galleryVideo.poster ? asset(wedding.galleryVideo.poster) : undefined, title: wedding.galleryVideo.title }] : []),
]

const BLOCK_KEYS = new Set([' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowUp', 'ArrowDown'])

/** Accessible modal lightbox: Esc closes, ←/→ navigate, focus is trapped and restored, page scroll is paused. */
function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (dir: 1 | -1) => void }) {
  const dialog = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const item = ITEMS[index]

  useEffect(() => {
    setUi({ overlay: true })
    return () => setUi({ overlay: false })
  }, [])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    const stop = (e: Event) => e.preventDefault()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNav(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onNav(-1)
      } else if (BLOCK_KEYS.has(e.key) && !(e.target instanceof HTMLVideoElement)) {
        e.preventDefault()
      } else if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, video, a[href]')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('wheel', stop, { passive: false })
    window.addEventListener('touchmove', stop, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', onKey)
      previous?.focus({ preventScroll: true })
    }
  }, [onClose, onNav])

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Galeri foto"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <figure className="relative flex max-h-full w-full max-w-3xl flex-col items-center">
        <div className="relative max-h-[78lvh]">
          {item.kind === 'image' ? (
            <img src={item.src} alt={item.alt} className="max-h-[78lvh] w-auto rounded-md object-contain shadow-2xl" />
          ) : (
            <video src={item.src} poster={item.poster} controls playsInline className="max-h-[78lvh] w-full rounded-md bg-black" />
          )}
        </div>
        <figcaption className="mt-3 text-center text-sm text-ivory/85">
          {item.kind === 'image' ? item.caption ?? item.alt : item.title}
          <span className="ml-2 text-ivory/50">
            {index + 1} / {ITEMS.length}
          </span>
        </figcaption>
      </figure>
      <button ref={closeBtn} type="button" onClick={onClose} className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-champagne/60 bg-deep/70 text-ivory hover:bg-deep" aria-label="Tutup galeri">
        <X size={20} />
      </button>
      <button type="button" onClick={() => onNav(-1)} className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-champagne/60 bg-deep/70 text-ivory hover:bg-deep sm:left-5" aria-label="Foto sebelumnya">
        <ChevronLeft size={22} />
      </button>
      <button type="button" onClick={() => onNav(1)} className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-champagne/60 bg-deep/70 text-ivory hover:bg-deep sm:right-5" aria-label="Foto berikutnya">
        <ChevronRight size={22} />
      </button>
    </div>
  )
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const nav = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + ITEMS.length) % ITEMS.length)), [])
  const photos = wedding.gallery
  return (
    <div>
      <SectionHeading icon="images" eyebrow="Pringgitan · Kenangan" title="Galeri Prewedding" />
      <ul className="mt-4 grid grid-cols-3 gap-2.5">
        {photos.map((g, i) => (
          <li key={g.id}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-teak shadow-sm ring-champagne focus-visible:ring-2"
              aria-label={`Perbesar ${g.alt}`}
            >
              <img src={asset(g.src)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <img src={asset(SVGS.photoFrame)} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
            </button>
          </li>
        ))}
      </ul>
      {wedding.galleryVideo.src ? (
        <button type="button" className="jawa-button mt-4 inline-flex items-center gap-2 text-sm" onClick={() => setOpen(ITEMS.length - 1)}>
          <Play size={15} aria-hidden="true" /> {wedding.galleryVideo.title}
        </button>
      ) : (
        <p className="mt-3 text-center text-[0.75rem] text-deep/60">Foto di atas adalah placeholder. Video dapat ditambahkan lewat konfigurasi.</p>
      )}
      {/* portal: panels are transformed, which would otherwise trap position:fixed */}
      {open !== null && createPortal(<Lightbox index={open} onClose={close} onNav={nav} />, document.body)}
    </div>
  )
}
