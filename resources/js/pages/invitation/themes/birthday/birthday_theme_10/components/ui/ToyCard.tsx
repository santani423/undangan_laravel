import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

const STUD_COLORS = ['coral', 'butter', 'mint', 'sky', 'lavender'];

interface ToyCardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    /** Number of brick studs drawn on the top edge. */
    studs?: number;
    studOffset?: number;
}

/** Chunky "toy plastic" card with studs on top like a building brick. */
export function ToyCard({ children, studs = 3, studOffset = 0, className, ...rest }: ToyCardProps) {
    return (
        <div className={cx('bt10-card', className)} {...rest}>
            {studs > 0 && (
                <div className="bt10-studs" aria-hidden="true">
                    {Array.from({ length: studs }, (_, i) => (
                        <span key={i} className={`bt10-bg-${STUD_COLORS[(i + studOffset) % STUD_COLORS.length]}`} />
                    ))}
                </div>
            )}
            {children}
        </div>
    );
}
