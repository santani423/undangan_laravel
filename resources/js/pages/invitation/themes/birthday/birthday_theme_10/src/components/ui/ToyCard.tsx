import type { HTMLAttributes, ReactNode } from 'react';

const STUD_COLORS = ['bg-toy-coral', 'bg-toy-butter', 'bg-toy-mint', 'bg-toy-sky', 'bg-toy-lavender'];

interface ToyCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Number of brick studs drawn on the top edge. */
  studs?: number;
  studOffset?: number;
}

export function ToyCard({ children, studs = 3, studOffset = 0, className = '', ...rest }: ToyCardProps) {
  return (
    <div className={`toy-card ${className}`} {...rest}>
      {studs > 0 && (
        <div className="toy-studs" aria-hidden="true">
          {Array.from({ length: studs }, (_, i) => (
            <span key={i} className={STUD_COLORS[(i + studOffset) % STUD_COLORS.length]} />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
