import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE } from '../animation/easing'
import { asset } from '../lib/links'
import { IconAlert } from './Icons'

/** Content reveal: restrained fade + rise, staggered by `delay`. Plays once so text never jumps while reading. */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div', ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'p' } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const Tag = as === 'li' ? motion.li : as === 'p' ? motion.p : motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: EASE.out, delay }}
      {...(rest as object)}
    >
      {children}
    </Tag>
  )
}

export function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: ReactNode; id: string }) {
  return (
    <header className="section-heading">
      <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>
      <Reveal delay={0.08}>
        <h2 id={id} className="h2">{title}</h2>
      </Reveal>
      <Reveal delay={0.14}>
        <Divider />
      </Reveal>
    </header>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  return <img className={`divider ${className}`} src={asset('assets/svg/sparkle-divider.svg')} alt="" width={180} height={24} />
}

export function DemoBadge({ children }: { children: ReactNode }) {
  return (
    <p className="demo-badge" role="note">
      <IconAlert width={16} height={16} />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <img src={asset('assets/svg/mushroom-cluster.svg')} alt="" width={120} height={92} />
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__text">{text}</p>
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner" role={label ? 'status' : undefined}>
      <span className="spinner__dot" />
      <span className="spinner__dot" />
      <span className="spinner__dot" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}
