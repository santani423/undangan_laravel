import type { ReactNode } from 'react';
import { cx } from '../lib/helpers';
import type { SectionDef } from '../lib/sections';

interface SceneSectionProps {
    def: SectionDef;
    /** Illustration shown above the panel in the illustrated (no-WebGL) version. */
    art: string;
    artSize: [number, number];
    artClassName?: string;
    className?: string;
    panelClassName?: string;
    /** Panels reveal item by item ([data-reveal]) as the section arrives. */
    reveal?: boolean;
    children: ReactNode;
    after?: ReactNode;
}

/**
 * One scroll section = one camera stop. Only the panel takes pointer input, so taps on the
 * empty space around it reach the 3D world underneath.
 */
export function SceneSection({ def, art, artSize, artClassName, className, panelClassName, reveal = true, children, after }: SceneSectionProps) {
    return (
        <section id={def.id} className={cx('bt11-scene', className)} data-side={def.side} aria-labelledby={`${def.id}-heading`}>
            <img className={cx('bt11-scene__art', artClassName)} src={art} alt="" width={artSize[0]} height={artSize[1]} />
            <div className={cx('bt11-scene__panel', panelClassName)} data-reveal-group={reveal ? '' : undefined}>
                {children}
            </div>
            {after}
        </section>
    );
}

export function SectionHeading({ def }: { def: SectionDef }) {
    return (
        <h2 id={`${def.id}-heading`} data-reveal="">
            {def.title}
        </h2>
    );
}

/** "a\n\nb" → paragraphs, single newlines → line breaks. */
export function Paragraphs({ text }: { text: string }) {
    return (
        <>
            {text
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                    <p key={i}>
                        {p.split('\n').map((line, j) => (
                            <span key={j}>
                                {j > 0 && <br />}
                                {line}
                            </span>
                        ))}
                    </p>
                ))}
        </>
    );
}
