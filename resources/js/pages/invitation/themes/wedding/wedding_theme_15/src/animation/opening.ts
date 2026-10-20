import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { wedding } from '../config/wedding'
import { setMusic } from '../audio/music'
import { prefersReducedMotion } from '../lib/device'
import { sceneFx } from '../state/sceneFx'
import { isSceneActive, useApp } from '../state/store'
import { GSAP_EASE } from './easing'

/**
 * "Buka Undangan": seal pops → flap opens → letter rises → petals burst →
 * envelope drifts away while the camera glides into the forest.
 * Content unlocks ~1.6 s in; the camera finishes its glide in the background.
 */
export function playOpening() {
  const app = useApp.getState()
  if (app.opened || app.opening) return
  app.setOpening(true)

  // Called synchronously inside the click handler, so autoplay policies allow it.
  if (wedding.music.playOnOpen) void setMusic(true)

  const finish = () => {
    useApp.getState().setOpening(false)
    ScrollTrigger.refresh()
  }
  const unlock = () => {
    useApp.getState().setOpened(true)
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView())
  }

  if (prefersReducedMotion() || !isSceneActive(app.sceneStatus)) {
    gsap.set(sceneFx, { seal: 1, flap: 1, letter: 1, away: 1 })
    gsap.to(sceneFx, { intro: 1, duration: 0.5, ease: 'none', onComplete: finish })
    unlock()
    return
  }

  gsap
    .timeline({ onComplete: finish })
    .to(sceneFx, { seal: 1, duration: 0.35, ease: 'back.in(2)' })
    .to(sceneFx, { flap: 1, duration: 0.7, ease: GSAP_EASE.inOut }, '-=0.05')
    .to(sceneFx, { letter: 1, duration: 0.8, ease: GSAP_EASE.out }, '-=0.25')
    .call(() => {
      sceneFx.burstAt = performance.now() / 1000
    }, undefined, '-=0.45')
    .addLabel('travel', '+=0.1')
    .to(sceneFx, { away: 1, duration: 1.1, ease: 'power2.in' }, 'travel')
    .to(sceneFx, { intro: 1, duration: 2.2, ease: GSAP_EASE.inOut }, 'travel+=0.15')
    .call(unlock, undefined, 'travel+=0.7')
}
