import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SECTIONS, SECTION_IDS, type SectionId } from '../../data/sections';
import { useActiveSection } from '../../hooks/useActiveSection';
import { scrollToSection } from '../../lib/scroll';

/**
 * Section navigation: labelled voxel dots on large screens, and a compact
 * menu sheet on phones and tablets. Scrolling to a section drives the camera
 * to the matching place in the garden.
 */
export function SectionNavigation({ reducedMotion }: { reducedMotion: boolean }) {
  const active = useActiveSection(SECTION_IDS, true);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const go = (id: SectionId) => {
    setOpen(false);
    scrollToSection(SECTION_IDS, id, !reducedMotion);
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
      <nav aria-label="Navigasi bagian undangan" className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
        <ol className="flex flex-col items-end gap-2">
          {SECTIONS.map((section) => {
            const current = active === section.id;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => go(section.id)}
                  aria-current={current ? 'true' : undefined}
                  className="group flex min-h-7 items-center gap-3 rounded px-1"
                >
                  <span className="pointer-events-none rounded bg-ink/85 px-2 py-1 text-xs text-ivory opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {section.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`block border border-gold-deep transition-all ${current ? 'size-3.5 bg-gold-deep' : 'size-2.5 bg-ivory/80 group-hover:bg-champagne'}`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="fixed left-3 z-40 xl:hidden" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {open && (
          <div
            ref={panelRef}
            id={panelId}
            className="glass-pill absolute bottom-full left-0 mb-2 w-60 rounded-xl p-2"
            role="dialog"
            aria-label="Pilih bagian undangan"
          >
            <ol className="flex max-h-[60svh] flex-col overflow-y-auto">
              {SECTIONS.map((section) => {
                const current = active === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => go(section.id)}
                      aria-current={current ? 'true' : undefined}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm ${current ? 'bg-champagne/70 font-medium text-ink' : 'text-ink-soft hover:bg-ivory-deep'}`}
                    >
                      <span aria-hidden="true" className={`block size-2.5 border border-gold-deep ${current ? 'bg-gold-deep' : ''}`} />
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
          className="glass-pill flex h-14 items-center gap-2 rounded-full px-4 text-sm font-medium text-gold-ink"
          data-testid="nav-toggle"
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          Menu
        </button>
      </div>
    </>
  );
}
