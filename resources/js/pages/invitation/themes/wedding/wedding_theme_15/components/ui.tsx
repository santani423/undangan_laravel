import { createElement, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { SVGS } from '../lib/aset';
import { useReveal } from '../lib/hooks';
import { IconAlert } from './Icons';

type RevealProps = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'p' } & Omit<
    HTMLAttributes<HTMLElement>,
    'children'
> & {
        'data-story'?: number;
    };

/** Content reveal: restrained fade + rise, staggered by `delay` (seconds). Plays once so text never jumps while reading. */
export function Reveal({ children, delay = 0, className = '', as = 'div', style, ...rest }: RevealProps) {
    const { ref, shown } = useReveal<HTMLElement>();
    return createElement(
        as,
        {
            ...rest,
            ref,
            className: `wt15-reveal${shown ? ' is-in' : ''}${className ? ` ${className}` : ''}`,
            style: { ...style, '--wt15-delay': `${delay}s` } as CSSProperties,
        },
        children,
    );
}

export function SectionHeading({ eyebrow, title, id }: { eyebrow: string; title: ReactNode; id: string }) {
    return (
        <header className="wt15-section-heading">
            <Reveal as="p" className="wt15-eyebrow">
                {eyebrow}
            </Reveal>
            <Reveal delay={0.08}>
                <h2 id={id} className="wt15-h2">
                    {title}
                </h2>
            </Reveal>
            <Reveal delay={0.14}>
                <Divider />
            </Reveal>
        </header>
    );
}

export function Divider({ className = '' }: { className?: string }) {
    return <img className={`wt15-divider ${className}`} src={SVGS.divider} alt="" width={180} height={24} />;
}

export function DemoBadge({ children }: { children: ReactNode }) {
    return (
        <p className="wt15-demo-badge" role="note">
            <IconAlert width={16} height={16} />
            <span>{children}</span>
        </p>
    );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
    return (
        <div className="wt15-empty-state">
            <img src={SVGS.mushrooms} alt="" width={120} height={92} />
            <p className="wt15-empty-state__title">{title}</p>
            <p className="wt15-empty-state__text">{text}</p>
        </div>
    );
}

export function Spinner({ label }: { label?: string }) {
    return (
        <span className="wt15-spinner" role={label ? 'status' : undefined}>
            <span className="wt15-spinner__dot" />
            <span className="wt15-spinner__dot" />
            <span className="wt15-spinner__dot" />
            {label && <span className="wt15-sr-only">{label}</span>}
        </span>
    );
}
