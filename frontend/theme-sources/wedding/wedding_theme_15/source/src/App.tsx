import { AnimatePresence, MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import { EASE } from './animation/easing'
import { useScrollScene } from './animation/scrollScene'
import { Cover } from './components/Cover'
import { FallbackBackdrop } from './components/FallbackBackdrop'
import { Lightbox } from './components/Lightbox'
import { Nav } from './components/Nav'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import { prefersReducedMotion } from './lib/device'
import { ClosingSection } from './sections/ClosingSection'
import { EventSection, GallerySection } from './sections/EventGallerySections'
import { CountdownSection, CoupleSection, HeroSection, StorySection } from './sections/IntroSections'
import { RsvpSection } from './sections/RsvpSection'
import { WishesSection } from './sections/WishesSection'
import { sceneFx } from './state/sceneFx'
import { isSceneActive, useApp } from './state/store'

// three.js and the forest are code-split so the cover paints immediately.
const SceneCanvas = lazy(() => import('./scene/SceneCanvas'))

function useGlobalInputs() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => (sceneFx.reducedMotion = mq.matches)
    syncMotion()
    mq.addEventListener('change', syncMotion)
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      sceneFx.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      sceneFx.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      mq.removeEventListener('change', syncMotion)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])
}

export default function App() {
  const opened = useApp((s) => s.opened)
  const opening = useApp((s) => s.opening)
  const status = useApp((s) => s.sceneStatus)
  const sceneOn = isSceneActive(status)

  useGlobalInputs()
  useScrollScene(opened)

  // The invitation always starts at the cover; the hash (if any) is honoured after opening.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !opened)
    document.documentElement.classList.toggle('is-2d', !sceneOn)
  }, [opened, sceneOn])

  // Reduced-motion users skip the envelope animation entirely via the opening timeline.
  useEffect(() => {
    if (prefersReducedMotion()) document.documentElement.classList.add('reduced-motion')
  }, [])

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: EASE.out, duration: 0.8 }}>
      {sceneOn ? (
        <Suspense fallback={<div className="scene-placeholder" aria-hidden="true" />}>
          <SceneCanvas />
        </Suspense>
      ) : (
        <FallbackBackdrop />
      )}
      <div className="scene-veil" aria-hidden="true" />

      <a className="skip-link" href="#main">Lewati ke isi undangan</a>
      {opened && <TopBar />}
      {opened && <Nav />}

      <main id="main" inert={!opened}>
        <HeroSection />
        <CoupleSection />
        <CountdownSection />
        <StorySection />
        <EventSection />
        <GallerySection />
        <RsvpSection />
        <WishesSection />
        <ClosingSection />
      </main>

      <AnimatePresence>{!opened && !opening && <Cover key="cover" />}</AnimatePresence>
      <Lightbox />
      <Toast />
    </MotionConfig>
  )
}
