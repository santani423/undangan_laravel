import { useRef, type ReactNode } from 'react';
import { CAMERA_WAYPOINTS } from '../../data/cameraWaypoints';
import type { SectionId } from '../../data/sections';
import { useReveal } from '../../hooks/useReveal';
import type { AssetIconName } from '../../lib/assets';
import { AssetIcon } from './AssetIcon';

const WIDTHS = { md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-3xl' } as const;

interface SectionShellProps {
  id: SectionId;
  eyebrow: string;
  title: string;
  icon?: AssetIconName;
  width?: keyof typeof WIDTHS;
  children: ReactNode;
}

/**
 * Semantic section wrapper. On wide screens the card sits on the side given
 * by the section's camera waypoint, leaving the 3D focal point visible.
 */
export function SectionShell({ id, eyebrow, title, icon, width = 'md', children }: SectionShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useReveal(cardRef);
  const side = CAMERA_WAYPOINTS.find((w) => w.id === id)?.contentSide ?? 'center';
  const justify = side === 'left' ? 'md:justify-start' : side === 'right' ? 'md:justify-end' : 'md:justify-center';

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative flex min-h-[100svh] w-full items-center justify-center px-4 py-[14svh] sm:px-8 lg:px-14 ${justify}`}
    >
      <div ref={cardRef} className={`invite-card w-full ${WIDTHS[width]}`}>
        <header className="mb-6 text-center">
          {icon && <AssetIcon name={icon} className="mx-auto mb-3 size-10" />}
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} tabIndex={-1} className="section-title mt-2 outline-none">
            {title}
          </h2>
          <div className="pixel-divider mt-4" aria-hidden="true" />
        </header>
        {children}
      </div>
    </section>
  );
}
