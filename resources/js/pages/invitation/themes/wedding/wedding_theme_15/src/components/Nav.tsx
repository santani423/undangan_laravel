import { motion } from 'framer-motion'
import type { ComponentType, SVGProps } from 'react'
import { EASE } from '../animation/easing'
import { useApp } from '../state/store'
import { IconArch, IconBook, IconHeart, IconHome, IconImage, IconLetter, IconMoon, IconSparkleChat } from './Icons'

interface NavItem {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Scene indices that light this item up. */
  sections: number[]
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: IconHome, sections: [0] },
  { id: 'couple', label: 'Couple', icon: IconHeart, sections: [1] },
  { id: 'countdown', label: 'Date', icon: IconMoon, sections: [2] },
  { id: 'story', label: 'Story', icon: IconBook, sections: [3] },
  { id: 'event', label: 'Event', icon: IconArch, sections: [4] },
  { id: 'gallery', label: 'Gallery', icon: IconImage, sections: [5] },
  { id: 'rsvp', label: 'RSVP', icon: IconLetter, sections: [6] },
  { id: 'wishes', label: 'Wishes', icon: IconSparkleChat, sections: [7, 8] },
]

/**
 * Plain anchor links: native scrolling moves the page, the scroll timeline moves the camera,
 * and every click is a history entry, so Back/Forward walk through the scenes.
 */
export function Nav() {
  const active = useApp((s) => s.activeSection)
  return (
    <motion.nav
      className="nav"
      aria-label="Navigasi undangan"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE.out, delay: 0.4 }}
    >
      <ul className="nav__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.sections.includes(active)
          const Icon = item.icon
          return (
            <li key={item.id}>
              <a href={`#${item.id}`} className={`nav__link${isActive ? ' is-active' : ''}`} aria-current={isActive ? 'location' : undefined}>
                {isActive && <motion.span layoutId="nav-pill" className="nav__pill" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <Icon className="nav__icon" />
                <span className="nav__label">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </motion.nav>
  )
}
