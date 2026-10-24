import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useReveal } from '../../hooks/useReveal';
import { cx } from '../../lib/cx';
import { CAMERA_STOPS } from '../../lib/journey';

interface StopBlockProps {
    stop: number;
    children: ReactNode;
    id?: string;
    labelledBy?: string;
    as?: 'section' | 'div';
    /** Wider panel for content-heavy blocks such as the RSVP form. */
    wide?: boolean;
}

/**
 * One scroll destination. The `data-camera-stop` attribute is what the master
 * ScrollTrigger measures to keep the 3D camera in sync. The block itself lets
 * pointer events fall through to the canvas; only the panel is interactive.
 *
 * Phones: the panel sits in the lower part so the 3D subject stays visible above.
 * Wide screens: the panel sits beside the subject (side configured per stop).
 */
export function StopBlock({ stop, children, id, labelledBy, as: Tag = 'section', wide = false }: StopBlockProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    useReveal(panelRef, { disabled: reduced });
    const side = CAMERA_STOPS[stop]?.panel ?? 'center';

    return (
        <Tag id={id} aria-labelledby={labelledBy} data-camera-stop={stop} className={`bt10-stop bt10-stop--${side}`}>
            <div ref={panelRef} className={cx('bt10-stop__panel', wide && 'is-wide')}>
                {children}
            </div>
        </Tag>
    );
}
