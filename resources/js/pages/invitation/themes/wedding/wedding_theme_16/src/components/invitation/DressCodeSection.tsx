import { Palette, Shirt } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { SectionShell } from '../ui/SectionShell';

/** Section I — configurable attire guidance and colour palette. */
export function DressCodeSection() {
  const { config } = useInvitationData();
  const { dressCode } = config;

  return (
    <SectionShell id="dress-code" eyebrow="Dress Code" title={dressCode.title}>
      <p className="body-copy text-center">{dressCode.description}</p>

      <h3 className="mt-6 flex items-center justify-center gap-2 font-serif text-xl font-semibold text-ink">
        <Palette aria-hidden="true" className="size-5 text-gold-deep" />
        Palet warna yang disarankan
      </h3>
      <ul className="mt-3 flex flex-wrap justify-center gap-4" data-testid="dress-palette">
        {dressCode.palette.map((swatch) => (
          <li key={swatch.hex} className="flex w-16 flex-col items-center text-center" data-reveal>
            <span
              aria-hidden="true"
              className="block size-14 border-2 border-ivory shadow-[3px_3px_0_0_rgba(139,105,56,0.55)]"
              style={{ background: swatch.hex }}
            />
            <span className="mt-2 text-xs font-medium text-ink">{swatch.name}</span>
            <span className="text-[0.65rem] uppercase tracking-wide text-ink-soft">{swatch.hex}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-7 flex items-center justify-center gap-2 font-serif text-xl font-semibold text-ink">
        <Shirt aria-hidden="true" className="size-5 text-gold-deep" />
        Busana yang disarankan
      </h3>
      <dl className="mt-3 grid gap-3">
        {dressCode.recommendations.map((item) => (
          <div key={item.label} className="sub-card" data-reveal>
            <dt className="font-medium text-ink">{item.label}</dt>
            <dd className="body-copy mt-0.5 text-sm">{item.detail}</dd>
          </div>
        ))}
      </dl>

      {dressCode.notes && dressCode.notes.length > 0 && (
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-ink-soft">
          {dressCode.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
