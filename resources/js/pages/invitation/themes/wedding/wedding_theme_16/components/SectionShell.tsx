import { useRef, type ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';
import type { AssetIconName } from '../lib/aset';
import { contentSideOf } from '../lib/cameraWaypoints';
import { cx } from '../lib/cx';
import type { SectionId } from '../lib/sections';
import { AssetIcon } from './AssetIcon';

interface SectionShellProps {
    id: SectionId;
    eyebrow: string;
    title: string;
    icon?: AssetIconName;
    width?: 'md' | 'lg' | 'xl';
    children: ReactNode;
}

/**
 * Semantic section wrapper. On wide screens the card sits on the side given
 * by the section's camera waypoint, leaving the 3D focal point visible.
 */
export function SectionShell({ id, eyebrow, title, icon, width = 'md', children }: SectionShellProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    useReveal(cardRef);

    return (
        <section id={id} aria-labelledby={`${id}-title`} className={cx('wt16-section', `wt16-section--${contentSideOf(id)}`)}>
            <div ref={cardRef} className={cx('wt16-card', `wt16-card--${width}`)}>
                <header className="wt16-card__header">
                    {icon && <AssetIcon name={icon} className="wt16-card__icon" />}
                    <p className="wt16-eyebrow">{eyebrow}</p>
                    <h2 id={`${id}-title`} tabIndex={-1} className="wt16-title">
                        {title}
                    </h2>
                    <div className="wt16-divider" aria-hidden="true" />
                </header>
                {children}
            </div>
        </section>
    );
}
