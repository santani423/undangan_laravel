import type { ReactNode } from 'react'
import type { PanelSide, SceneId } from '../../config/types'

/**
 * A feature panel anchored to the camera composition. The outer layer ignores pointer events so
 * wheel/touch scrolling always reaches the page; GSAP fades the inner <section> in and out.
 * Desktop: beside the focal point (left/right). Phones: a bottom sheet under the scene, above the tab bar.
 */
export function ScenePanel({ id, side, label, children }: { id: SceneId; side: PanelSide; label: string; children: ReactNode }) {
  const desktopAlign = side === 'left' ? 'md:justify-start md:pl-20 lg:pl-28' : side === 'right' ? 'md:justify-end md:pr-16 lg:pr-24' : 'md:justify-center'
  return (
    <div className={`pointer-events-none fixed inset-0 z-10 flex items-end justify-center px-3 pb-[calc(var(--mobile-nav-h)+10px)] md:items-center md:px-8 md:pb-0 ${desktopAlign}`}>
      <section
        data-panel={id}
        aria-label={label}
        className="jawa-panel panel-scroll pointer-events-auto relative max-h-[56lvh] w-full max-w-[460px] overflow-y-auto rounded-[1.4rem] px-5 py-6 md:max-h-[min(86lvh,880px)] md:rounded-[1.6rem] md:px-7 md:py-7"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        {children}
      </section>
    </div>
  )
}
