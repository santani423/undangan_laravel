import { Menu, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useActiveSection } from '../hooks/useActiveSection';
import { useInvitationData } from '../hooks/useAppContext';
import { cx } from '../lib/cx';
import { scrollToSection } from '../lib/scroll';
import type { SectionId } from '../lib/sections';

/**
 * Section navigation: labelled voxel dots on large screens, and a compact
 * menu sheet on phones and tablets. Scrolling to a section drives the camera
 * to the matching place in the garden.
 */
export function SectionNavigation({ reducedMotion }: { reducedMotion: boolean }) {
    const { sections } = useInvitationData();
    const ids = useMemo(() => sections.map((section) => section.id), [sections]);
    const active = useActiveSection(ids, true);
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const go = (id: SectionId) => {
        setOpen(false);
        scrollToSection(ids, id, !reducedMotion);
    };

    useEffect(() => {
        if (!open) return;
        panelRef.current?.querySelector<HTMLButtonElement>('button[aria-current="true"], button')?.focus();
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                toggleRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <nav aria-label="Navigasi bagian undangan" className="wt16-dots">
                <ol className="wt16-dots__list">
                    {sections.map((section) => {
                        const current = active === section.id;
                        return (
                            <li key={section.id}>
                                <button
                                    type="button"
                                    onClick={() => go(section.id)}
                                    aria-current={current ? 'true' : undefined}
                                    className={cx('wt16-dots__btn', current && 'is-current')}
                                >
                                    <span className="wt16-dots__label">{section.label}</span>
                                    <span aria-hidden="true" className="wt16-dots__dot" />
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <div className="wt16-menu">
                {open && (
                    <div ref={panelRef} id={panelId} className="wt16-pill wt16-menu__panel" role="dialog" aria-label="Pilih bagian undangan">
                        <ol className="wt16-menu__list">
                            {sections.map((section) => {
                                const current = active === section.id;
                                return (
                                    <li key={section.id}>
                                        <button
                                            type="button"
                                            onClick={() => go(section.id)}
                                            aria-current={current ? 'true' : undefined}
                                            className={cx('wt16-menu__item', current && 'is-current')}
                                        >
                                            <span aria-hidden="true" className="wt16-menu__dot" />
                                            {section.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}
                <button
                    ref={toggleRef}
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="wt16-pill wt16-menu__toggle"
                >
                    {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
                    Menu
                </button>
            </div>
        </>
    );
}
