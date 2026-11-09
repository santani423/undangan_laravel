import { useEffect, useRef } from 'react'
import { asset } from '../lib/links'
import { useApp } from '../state/store'

/**
 * 2D twilight forest used when WebGL is unavailable, fails, or the guest picks "mode ringan".
 * Built from the bundled SVG illustrations with light CSS parallax.
 */
export function FallbackBackdrop() {
  const root = useRef<HTMLDivElement>(null)
  const active = useApp((s) => s.activeSection)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        root.current?.style.setProperty('--p', String(window.scrollY / max))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return (
    <div ref={root} className="fallback" data-section={active} aria-hidden="true">
      <img className="fallback__hills" src={asset('assets/svg/forest-hills.svg')} alt="" />
      <img className="fallback__moon float-gently" src={asset('assets/svg/moon.svg')} alt="" />
      <img className="fallback__flies twinkle" src={asset('assets/svg/fireflies.svg')} alt="" />
      <img className="fallback__lantern float-gently" src={asset('assets/svg/lantern.svg')} alt="" />
      <img className="fallback__mushrooms" src={asset('assets/svg/mushroom-cluster.svg')} alt="" />
      <img className="fallback__flowers" src={asset('assets/svg/wildflowers.svg')} alt="" />
      <div className="fallback__tint" />
    </div>
  )
}
