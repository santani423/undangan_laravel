import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EASE } from '../animation/easing'
import { wedding } from '../config/wedding'
import { asset } from '../lib/links'
import { useApp } from '../state/store'
import { IconChevronLeft, IconChevronRight, IconClose } from './Icons'

/** Full-screen gallery viewer: keyboard (Esc / ← / →), swipe, focus trap, neighbour preloading. */
export function Lightbox() {
  const index = useApp((s) => s.lightboxIndex)
  const setLightbox = useApp((s) => s.setLightbox)
  const images = wedding.gallery
  const open = index !== null
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [dir, setDir] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      setDir(delta)
      setLightbox((index + delta + images.length) % images.length)
    },
    [index, images.length, setLightbox],
  )
  const close = useCallback(() => setLightbox(null), [setLightbox])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    document.documentElement.classList.add('is-modal')
    const t = setTimeout(() => dialog.current?.querySelector<HTMLElement>('.lightbox__close')?.focus(), 30)
    return () => {
      clearTimeout(t)
      document.documentElement.classList.remove('is-modal')
      returnFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (index === null) return
    for (const d of [-1, 1]) {
      const img = new Image()
      img.src = asset(images[(index + d + images.length) % images.length].src)
    }
  }, [index, images])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === 'Tab') {
      const focusables = dialog.current?.querySelectorAll<HTMLElement>('button')
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const img = index !== null ? images[index] : null

  return (
    <AnimatePresence>
      {img && (
        <motion.div
          ref={dialog}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri foto, ${index! + 1} dari ${images.length}`}
          onKeyDown={onKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            if (!touch.current) return
            const dx = e.changedTouches[0].clientX - touch.current.x
            const dy = e.changedTouches[0].clientY - touch.current.y
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
            else if (dy > 90) close()
            touch.current = null
          }}
        >
          <button type="button" className="lightbox__close icon-btn" onClick={close} aria-label="Tutup galeri">
            <IconClose />
          </button>
          <figure className="lightbox__figure">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.img
                key={img.src}
                src={asset(img.src)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="lightbox__img"
                custom={dir}
                initial={{ opacity: 0, x: dir * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dir * -40, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE.out }}
                draggable={false}
              />
            </AnimatePresence>
            <figcaption className="lightbox__caption">
              <span>{img.caption}</span>
              {img.isDemo && <span className="tag">Ilustrasi contoh</span>}
              <span className="lightbox__count">
                {index! + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
          <button type="button" className="lightbox__nav lightbox__nav--prev icon-btn" onClick={() => go(-1)} aria-label="Foto sebelumnya">
            <IconChevronLeft />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next icon-btn" onClick={() => go(1)} aria-label="Foto berikutnya">
            <IconChevronRight />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
