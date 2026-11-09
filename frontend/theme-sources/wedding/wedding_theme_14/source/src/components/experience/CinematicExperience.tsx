import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronsDown } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { JOURNEY_SCREENS, PANEL_FADE, SCENES, STORY_REVEAL_START, STORY_REVEAL_STEP, sceneIndexAt } from '../../config/scenes'
import { wedding } from '../../config/wedding'
import { useIsMobile, useReducedMotion } from '../../hooks/useMediaQuery'
import { detectQuality } from '../../hooks/useQualityTier'
import type { AmbientAudio } from '../../services/ambientAudio'
import { loadWorldAssets, type LoadedAssets } from '../../services/assetLoader'
import { journey, setUi, useUi } from '../../state/journey'
import { WorldCanvas } from '../3d/WorldCanvas'
import { buildTextureLibrary, disposeLibrary, type TextureLibrary } from '../3d/textures/library'
import { ClosingMessage } from '../invitation/ClosingMessage'
import { Countdown } from '../invitation/Countdown'
import { CoupleProfile } from '../invitation/CoupleProfile'
import { CoverContent } from '../invitation/Cover'
import { EventDetails } from '../invitation/EventDetails'
import { Gallery } from '../invitation/Gallery'
import { GiftDetails } from '../invitation/GiftDetails'
import { LoveStory } from '../invitation/LoveStory'
import { RsvpGuestbook } from '../invitation/RsvpGuestbook'
import { LoadingScreen } from '../ui/LoadingScreen'
import { MusicToggle } from '../ui/MusicToggle'
import { ProgressRail, SceneNav } from '../ui/SceneNav'
import { ScenePanel } from './ScenePanel'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

/** Nav jumps up to this much progress glide through the world; longer ones cross-fade through a veil. */
const GLIDE_MAX = 0.3

/** `?capture=1` — deterministic timing for automated screenshots on slow software renderers. */
const CAPTURE = new URLSearchParams(window.location.search).has('capture')
if (CAPTURE) gsap.ticker.lagSmoothing(0)

const sceneById = Object.fromEntries(SCENES.map((s) => [s.id, s]))

/**
 * The scroll-driven 3D invitation. Native page scroll → one GSAP ScrollTrigger timeline (scrubbed)
 * → journey.progress (camera, light, objects) + panel visibility. Everything is a pure function of
 * scroll position, so scrolling backwards replays the journey in reverse with no stale state.
 */
export function CinematicExperience({ audio, onFallback }: { audio: AmbientAudio; onFallback: (reason: string) => void }) {
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const quality = useMemo(() => detectQuality(), [])
  const opened = useUi((s) => s.opened)

  const [world, setWorld] = useState<{ assets: LoadedAssets; lib: TextureLibrary } | null>(null)
  const [loadPct, setLoadPct] = useState(0)
  const [stage, setStage] = useState<'files' | 'textures'>('files')
  const [worldReady, setWorldReady] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const spacer = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const fade = useRef<HTMLDivElement>(null)
  const railFill = useRef<HTMLDivElement>(null)
  const veil = useRef<HTMLDivElement>(null)
  const st = useRef<ScrollTrigger | null>(null)
  /** In-flight nav jump (scroll glide or veil timeline) and the wait for the scrub to catch up. */
  const jumpAnim = useRef<gsap.core.Animation | null>(null)
  const jumpSettle = useRef<gsap.core.Tween | null>(null)
  const jumping = useRef(false)
  const [veilScene, setVeilScene] = useState(0)

  useEffect(() => {
    journey.reducedMotion = reduced
  }, [reduced])

  /* ── assets ── */
  useEffect(() => {
    let alive = true
    let built: TextureLibrary | null = null
    ;(async () => {
      const a = await loadWorldAssets((l, t) => alive && setLoadPct((l / t) * 0.45), quality.tier === 'low' ? 512 : 1024)
      if (!alive) return
      if (a.failures.length) console.warn('[pawiwahan] some assets failed to load and use fallbacks:', a.failures)
      setStage('textures')
      // progressive: files first, then procedural PBR sets generated in small yielding steps
      const lib = await buildTextureLibrary(a, quality.tier, (f) => alive && setLoadPct(0.45 + f * 0.45))
      built = lib
      if (!alive) {
        disposeLibrary(lib)
        return
      }
      setWorld({ assets: a, lib })
    })().catch(() => alive && onFallback('asset-error'))
    return () => {
      alive = false
      if (built) disposeLibrary(built)
    }
  }, [quality.tier, onFallback])

  /* ── start at the top, locked until the invitation is opened ── */
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !opened)
    return () => document.documentElement.classList.remove('is-locked')
  }, [opened])

  /* ── scroll length in px (only recomputed when the width changes, so mobile URL bars & keyboards never shift progress) ── */
  useLayoutEffect(() => {
    const el = spacer.current
    if (!el) return
    let lastW = window.innerWidth
    const apply = () => {
      el.style.height = `${Math.round(window.innerHeight * JOURNEY_SCREENS)}px`
    }
    apply()
    const onResize = () => {
      if (window.innerWidth === lastW) return
      lastW = window.innerWidth
      apply()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  /* ── the master scroll timeline ── */
  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: spacer.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced || CAPTURE ? true : 1.1,
          onUpdate: (self) => !jumping.current && setUi({ sceneIndex: sceneIndexAt(self.progress) }),
        },
      })
      tl.to(journey, { progress: 1, duration: 1 }, 0)
      if (railFill.current) tl.fromTo(railFill.current, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)

      const dy = reduced ? 0 : 22
      for (const s of SCENES) {
        const el = root.current?.querySelector(`[data-panel="${s.id}"]`)
        if (!el) continue
        if (s.panel.in <= 0) gsap.set(el, { autoAlpha: 1, y: 0 })
        else tl.fromTo(el, { autoAlpha: 0, y: dy }, { autoAlpha: 1, y: 0, duration: PANEL_FADE }, s.panel.in)
        if (s.panel.out < 1) tl.fromTo(el, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -dy * 0.6, duration: PANEL_FADE, immediateRender: false }, s.panel.out)
      }
      root.current?.querySelectorAll('[data-panel="story"] [data-milestone]').forEach((li, i) => {
        tl.fromTo(li, { autoAlpha: 0, x: reduced ? 0 : -12 }, { autoAlpha: 1, x: 0, duration: 0.008 }, STORY_REVEAL_START + i * STORY_REVEAL_STEP)
      })
      st.current = tl.scrollTrigger ?? null
    }, root)
    return () => {
      st.current = null
      ctx.revert()
    }
  }, [reduced])

  /* ── pointer parallax input ── */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      journey.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      journey.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  /* ── open / restart / jump ── */
  const openInvitation = useCallback(() => {
    void audio.play() // user gesture → autoplay-safe
    window.scrollTo(0, 0)
    setUi({ opened: true })
    gsap.to(cover.current, { autoAlpha: 0, duration: reduced ? 0.01 : 0.9, ease: 'power2.out' })
    gsap.to(journey, { intro: 0, duration: reduced ? 0.01 : 2.6, ease: 'power2.inOut', overwrite: 'auto' })
    ;(document.activeElement as HTMLElement | null)?.blur()
  }, [audio, reduced])

  /** Snap the scrubbed timeline to the scroll position so the camera doesn't fly through the world. */
  const settleScrub = useCallback(() => {
    ScrollTrigger.update()
    const tween = st.current?.getTween?.() as gsap.core.Tween | undefined
    if (tween && typeof tween.progress === 'function') tween.progress(1)
    else st.current?.animation?.progress(st.current.progress)
  }, [])

  const endJump = useCallback(() => {
    jumpAnim.current?.kill()
    jumpSettle.current?.kill()
    jumpAnim.current = jumpSettle.current = null
    jumping.current = false
    root.current?.removeAttribute('data-jumping')
    root.current?.querySelector('[data-jump-target]')?.removeAttribute('data-jump-target')
    if (st.current) setUi({ sceneIndex: sceneIndexAt(st.current.progress) })
  }, [])

  const restart = useCallback(() => {
    endJump()
    gsap.set(veil.current, { autoAlpha: 0 })
    const f = fade.current
    gsap
      .timeline()
      .to(f, { autoAlpha: 1, duration: reduced ? 0.01 : 0.6, ease: 'power1.inOut' })
      .add(() => {
        // 'instant' also cancels any smooth scroll still in flight (e.g. from the scene menu)
        window.scrollTo({ top: 0, behavior: 'instant' })
        gsap.killTweensOf(journey, 'intro')
        journey.intro = 1
        setUi({ opened: false, sceneIndex: 0 })
        gsap.set(cover.current, { autoAlpha: 1 })
        // settle the scrub instantly so the camera doesn't rewind through the whole world
        settleScrub()
      })
      .to(f, { autoAlpha: 0, duration: reduced ? 0.01 : 0.9, delay: 0.2, ease: 'power1.inOut' })
      .add(() => cover.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }))
  }, [reduced, endJump, settleScrub])

  const jump = useCallback(
    (index: number) => {
      const t = st.current
      if (!t) return
      const target = SCENES[index]
      const y = t.start + (t.end - t.start) * target.navAt
      const dist = Math.abs(target.navAt - t.progress)
      endJump()
      if (dist < 0.002) return
      jumping.current = true
      setUi({ sceneIndex: index }) // highlight the destination right away, not every scene flown past

      if (reduced) {
        window.scrollTo({ top: y, behavior: 'instant' })
        settleScrub()
        endJump()
        return
      }

      // Release only once the scrubbed timeline has caught up, so no in-between panel flashes at the end.
      const finish = () => {
        const check = () => {
          const s = st.current
          if (!s?.animation || Math.abs(s.animation.progress() - s.progress) < 0.002) endJump()
          else jumpSettle.current = gsap.delayedCall(0.05, check)
        }
        check()
      }

      if (dist <= GLIDE_MAX) {
        // glide: ease the scroll itself; the scrub adds the camera's inertia on top
        gsap.to(veil.current, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' })
        root.current?.setAttribute('data-jumping', '')
        root.current?.querySelector(`[data-panel="${target.id}"]`)?.setAttribute('data-jump-target', '')
        jumpAnim.current = gsap.to(window, {
          scrollTo: { y, autoKill: true, onAutoKill: finish },
          duration: Math.min(1.1 + dist * 4.5, 2.4),
          ease: 'power2.inOut',
          onComplete: finish,
        })
      } else {
        // far: cross-fade through a veil naming the destination, cut the camera there underneath
        setVeilScene(index)
        jumpAnim.current = gsap
          .timeline({ onComplete: endJump })
          .to(veil.current, { autoAlpha: 1, duration: 0.45, ease: 'power2.in' })
          .fromTo('[data-veil-label]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.2)
          .add(() => {
            window.scrollTo({ top: y, behavior: 'instant' })
            settleScrub()
          })
          .to(veil.current, { autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, '+=0.35')
      }
    },
    [reduced, endJump, settleScrub],
  )

  const loadingLabel = !world ? (stage === 'files' ? 'Memuat aset' : 'Menenun tekstur kayu, batu & genteng') : !worldReady ? 'Membangun pendhapa' : 'Siap'
  const progress = !world ? loadPct : worldReady ? 1 : 0.94
  const p = sceneById

  return (
    <div ref={root}>
      {world && (
        <WorldCanvas initialQuality={quality} assets={world.assets} lib={world.lib} isMobile={isMobile} onReady={() => setWorldReady(true)} onFailure={onFallback} />
      )}

      {/* cinematic vignette for depth and text contrast */}
      <div className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(20,12,8,0.42)_100%)]" aria-hidden="true" />

      {/* scroll length */}
      <div ref={spacer} aria-hidden="true" style={{ height: '1900vh' }} />

      {/* Scene 1 title card (after opening) */}
      <div className={`pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center pb-[calc(var(--mobile-nav-h)+12px)] transition-opacity md:pb-[max(env(safe-area-inset-bottom),28px)] duration-700 ${opened ? 'opacity-100' : 'opacity-0'}`}>
        <div data-panel="gate" className="text-center" style={{ visibility: 'hidden', opacity: 0 }}>
          <div className="rounded-3xl bg-gradient-to-t from-ink/70 via-ink/45 to-transparent px-10 pt-10 pb-5">
            <p className="font-sans text-[0.7rem] tracking-[0.4em] text-champagne-light uppercase">{wedding.couple.openingGreeting}</p>
            <p className="mt-1 font-script text-5xl text-ivory drop-shadow">
              {wedding.couple.bride.nickname} <span className="text-champagne-light">&amp;</span> {wedding.couple.groom.nickname}
            </p>
            <p className="mt-1 font-display text-lg text-ivory/85">{wedding.mainDateLabel}</p>
            <p className="mt-5 flex flex-col items-center gap-1 text-[0.72rem] tracking-[0.25em] text-ivory/75 uppercase">
              Gulir untuk memasuki regol
              <ChevronsDown size={18} className="animate-scroll-hint" aria-hidden="true" />
            </p>
          </div>
        </div>
      </div>

      <ScenePanel id="pendopo" side={p.pendopo.panel.side} label="Profil mempelai">
        <CoupleProfile />
      </ScenePanel>
      <ScenePanel id="garden" side={p.garden.panel.side} label="Hitung mundur">
        <Countdown />
      </ScenePanel>
      <ScenePanel id="ceremony" side={p.ceremony.panel.side} label="Detail acara">
        <EventDetails />
      </ScenePanel>
      <ScenePanel id="gallery" side={p.gallery.panel.side} label="Galeri foto">
        <Gallery />
      </ScenePanel>
      <ScenePanel id="story" side={p.story.panel.side} label="Kisah kasih">
        <LoveStory />
      </ScenePanel>
      <ScenePanel id="rsvp" side={p.rsvp.panel.side} label="RSVP dan buku tamu">
        <RsvpGuestbook />
      </ScenePanel>
      <ScenePanel id="gift" side={p.gift.panel.side} label="Tanda kasih">
        <GiftDetails />
      </ScenePanel>
      <ScenePanel id="closing" side={p.closing.panel.side} label="Penutup">
        <ClosingMessage onRestart={restart} />
      </ScenePanel>

      {/* HUD */}
      {opened && <SceneNav onJump={jump} onLite={() => onFallback('user')} />}
      <div className={opened ? '' : 'invisible'}>
        <ProgressRail fillRef={railFill} onJump={jump} />
      </div>
      <div className="fixed top-[max(env(safe-area-inset-top),14px)] right-3.5 z-[60] sm:right-5">
        <MusicToggle audio={audio} />
      </div>

      {/* Cover */}
      <div ref={cover} className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-gradient-to-b from-ink/55 via-ink/25 to-ink/70 px-5 py-10">
        <CoverContent onOpen={openInvitation} />
      </div>

      {/* far-jump veil */}
      <div ref={veil} className="pointer-events-none fixed inset-0 z-[84] grid place-items-center bg-deep" style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true">
        <div data-veil-label className="text-center">
          <p className="text-[0.7rem] tracking-[0.4em] text-champagne-light uppercase">{SCENES[veilScene].javanese}</p>
          <p className="mt-1 font-display text-3xl text-ivory">{SCENES[veilScene].label}</p>
        </div>
      </div>

      {/* restart fade */}
      <div ref={fade} className="pointer-events-none fixed inset-0 z-[85] bg-deep" style={{ visibility: 'hidden', opacity: 0 }} aria-hidden="true" />

      <LoadingScreen progress={progress} label={loadingLabel} hidden={worldReady} />
    </div>
  )
}
