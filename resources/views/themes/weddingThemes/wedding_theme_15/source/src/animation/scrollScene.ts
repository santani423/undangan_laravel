import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneFx } from '../state/sceneFx'
import { useApp } from '../state/store'
import { smootherstep } from './easing'

gsap.registerPlugin(ScrollTrigger)

interface HoldRange {
  start: number
  end: number
}

let ranges: HoldRange[] = []

/**
 * Measure every `[data-scene]` section and derive its "hold" scroll range.
 * Between two hold ranges lies a transition of ~0.56 viewport heights in which
 * the camera travels to the next composition.
 */
function measure() {
  const vh = window.innerHeight
  const max = Math.max(0, document.documentElement.scrollHeight - vh)
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
  const last = sections.length - 1
  ranges = sections.map((el, i) => {
    const top = el.getBoundingClientRect().top + window.scrollY
    const h = el.offsetHeight
    const start = i === 0 ? 0 : Math.min(max, top - 0.22 * vh)
    const end = i === last ? max : Math.min(max, Math.max(start, top + h - vh + 0.22 * vh))
    return { start, end }
  })
}

/** Scroll position → camera path parameter q (see scene/waypoints.ts). */
export function qFromScroll(y: number): number {
  if (!ranges.length) return 0
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]
    if (y < r.start && i > 0) {
      const prev = ranges[i - 1]
      const t = (y - prev.end) / Math.max(1, r.start - prev.end)
      return 2 * (i - 1) + 1 + smootherstep(t)
    }
    if (y <= r.end) return 2 * i + (r.end > r.start ? (y - r.start) / (r.end - r.start) : 1)
  }
  return 2 * ranges.length - 1
}

/** Section index (fractional while travelling) from q. */
export function sectionFromQ(q: number): number {
  const i = Math.floor(q / 2)
  const local = q - 2 * i
  return local <= 1 ? i : i + (local - 1)
}

/**
 * Wires native scrolling to the scene: one master trigger feeds the camera,
 * one trigger per section drives the active navigation item, one per story chapter
 * highlights its floating frame. Everything is derived from scroll position, so
 * scrolling up reverses the scene exactly.
 */
export function useScrollScene(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const { setActiveSection, setActiveStory } = useApp.getState()
    const triggers: ScrollTrigger[] = []

    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onRefresh: (self) => {
          measure()
          sceneFx.qTarget = qFromScroll(self.scroll())
        },
        onUpdate: (self) => {
          sceneFx.qTarget = qFromScroll(self.scroll())
        },
      }),
    )

    document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActiveSection(i),
        }),
      )
    })

    document.querySelectorAll<HTMLElement>('[data-story]').forEach((el, i) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onToggle: (self) => self.isActive && setActiveStory(i),
        }),
      )
    })

    // Content height changes (fonts, wishes list, form states) must re-measure the ranges.
    let raf = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    const main = document.querySelector('main')
    if (main) ro.observe(main)
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      triggers.forEach((t) => t.kill())
    }
  }, [enabled])
}
