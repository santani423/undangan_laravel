import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Box, Info } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { SCENES } from '../../config/scenes'
import type { SceneId } from '../../config/types'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import type { AmbientAudio } from '../../services/ambientAudio'
import { setUi } from '../../state/journey'
import { ClosingMessage } from '../invitation/ClosingMessage'
import { Countdown } from '../invitation/Countdown'
import { CoupleProfile } from '../invitation/CoupleProfile'
import { CoverContent } from '../invitation/Cover'
import { EventDetails } from '../invitation/EventDetails'
import { Gallery } from '../invitation/Gallery'
import { GiftDetails } from '../invitation/GiftDetails'
import { LoveStory } from '../invitation/LoveStory'
import { RsvpGuestbook } from '../invitation/RsvpGuestbook'
import { MusicToggle } from '../ui/MusicToggle'
import { SceneNav } from '../ui/SceneNav'

gsap.registerPlugin(ScrollToPlugin)

/** Section that fades/rises in once when it enters the viewport (instant with reduced motion). */
function Reveal({ id, tone, children }: { id: SceneId; tone: 'ivory' | 'dark'; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced)
  useEffect(() => {
    if (reduced) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])
  return (
    <section
      ref={ref}
      id={`bagian-${id}`}
      data-scene={id}
      className={`relative scroll-mt-4 px-4 py-16 sm:py-20 ${tone === 'ivory' ? 'batik-kawung-bg' : 'batik-parang-bg'}`}
    >
      <div className={`absolute inset-0 ${tone === 'ivory' ? 'bg-ivory/90' : 'bg-deep/80'}`} aria-hidden="true" />
      <div
        className={`jawa-panel relative mx-auto max-w-xl rounded-[1.6rem] px-5 py-8 transition-all duration-1000 ease-out sm:px-8 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      >
        {children}
      </div>
    </section>
  )
}

/**
 * Lightweight invitation (WebGL unavailable, user choice, or a 3D failure).
 * Same features and content, standard document flow, simple section transitions.
 */
export function LiteExperience({ audio, notice, canUse3D, onUse3D }: { audio: AmbientAudio; notice: string | null; canUse3D: boolean; onUse3D: () => void }) {
  const [opened, setOpened] = useState(false)
  const reduced = useReducedMotion()
  const jumpTween = useRef<gsap.core.Tween | null>(null)
  const jumping = useRef(false)

  useEffect(() => {
    document.documentElement.classList.remove('is-locked')
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto'
  }, [])

  // keep the nav's current-scene highlight in sync
  useEffect(() => {
    if (!opened || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !jumping.current) {
            const idx = SCENES.findIndex((s) => s.id === (e.target as HTMLElement).dataset.scene)
            if (idx >= 0) setUi({ sceneIndex: idx })
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    document.querySelectorAll('[data-scene]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [opened])

  const open = () => {
    void audio.play()
    setOpened(true)
    requestAnimationFrame(() => document.getElementById('bagian-pendopo')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }))
  }
  const jump = useCallback(
    (i: number) => {
      const id = SCENES[i].id
      const el = id === 'gate' ? null : document.getElementById(`bagian-${id}`)
      const y = el ? el.getBoundingClientRect().top + window.scrollY : 0
      jumpTween.current?.kill()
      if (reduced) {
        window.scrollTo({ top: y, behavior: 'instant' })
        return
      }
      // eased glide whose length grows gently with distance, so far jumps don't whip past
      const screens = Math.abs(y - window.scrollY) / window.innerHeight
      const done = () => {
        jumping.current = false
        jumpTween.current = null
      }
      jumping.current = true
      setUi({ sceneIndex: i })
      jumpTween.current = gsap.to(window, {
        scrollTo: { y, autoKill: true, onAutoKill: done },
        duration: Math.min(0.7 + Math.sqrt(screens) * 0.35, 1.8),
        ease: 'power3.inOut',
        onComplete: done,
      })
    },
    [reduced],
  )
  const restart = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })

  return (
    <div className={`min-h-[100lvh] bg-deep ${opened ? 'pb-[var(--mobile-nav-h)] md:pb-0' : ''}`}>
      <header data-scene="gate" className="batik-parang-bg relative flex min-h-[100lvh] items-center justify-center px-5 py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-deep/75 to-ink/90" aria-hidden="true" />
        <div className="relative">
          <CoverContent onOpen={open} />
          {notice && (
            <p className="mx-auto mt-6 flex max-w-sm items-start gap-2 rounded-lg border border-champagne/40 bg-ink/40 px-3 py-2 text-left text-[0.74rem] text-ivory/80">
              <Info size={14} className="mt-0.5 shrink-0 text-champagne-light" aria-hidden="true" /> {notice}
            </p>
          )}
        </div>
      </header>

      {opened && (
        <main>
          <Reveal id="pendopo" tone="ivory">
            <CoupleProfile />
          </Reveal>
          <Reveal id="garden" tone="dark">
            <Countdown />
          </Reveal>
          <Reveal id="ceremony" tone="ivory">
            <EventDetails />
          </Reveal>
          <Reveal id="gallery" tone="dark">
            <Gallery />
          </Reveal>
          <Reveal id="story" tone="ivory">
            <LoveStory />
          </Reveal>
          <Reveal id="rsvp" tone="dark">
            <RsvpGuestbook />
          </Reveal>
          <Reveal id="gift" tone="ivory">
            <GiftDetails />
          </Reveal>
          <Reveal id="closing" tone="dark">
            <ClosingMessage onRestart={restart} />
          </Reveal>
          {canUse3D && (
            <div className="bg-deep px-4 py-6 text-center">
              <button type="button" onClick={onUse3D} className="inline-flex items-center gap-2 text-[0.8rem] text-champagne-light underline-offset-4 hover:underline">
                <Box size={15} aria-hidden="true" /> Buka versi 3D sinematik
              </button>
            </div>
          )}
        </main>
      )}

      {opened && <SceneNav onJump={jump} onLite={canUse3D ? onUse3D : undefined} liteLabel="Buka versi 3D sinematik" />}
      <div className="fixed top-[max(env(safe-area-inset-top),14px)] right-3.5 z-[60] sm:right-5">
        <MusicToggle audio={audio} />
      </div>
    </div>
  )
}
