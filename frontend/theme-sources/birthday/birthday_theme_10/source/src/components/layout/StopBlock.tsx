import { useRef, type ReactNode } from 'react';
import { CAMERA_STOPS } from '../../config/journey';
import { useReveal } from '../../hooks/useReveal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface StopBlockProps {
  stop: number;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
  as?: 'section' | 'div';
  /** Wider panel for content-heavy blocks such as the RSVP form. */
  wide?: boolean;
}

const JUSTIFY = { left: 'md:justify-start', right: 'md:justify-end', center: 'md:justify-center' } as const;

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
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      data-camera-stop={stop}
      className={`pointer-events-none relative flex min-h-svh w-full scroll-mt-0 items-end justify-center px-4 pt-[42svh] pb-[max(2rem,env(safe-area-inset-bottom))] md:items-center md:px-10 md:py-28 lg:px-20 ${JUSTIFY[side]}`}
    >
      <div
        ref={panelRef}
        className={`pointer-events-auto w-full ${wide ? 'max-w-xl md:max-w-[min(34rem,46vw)]' : 'max-w-lg md:max-w-[min(29rem,42vw)]'}`}
      >
        {children}
      </div>
    </Tag>
  );
}
