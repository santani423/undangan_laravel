import { ArrowUp } from 'lucide-react';
import { SECTION_IDS } from '../../data/sections';
import { useExperience, useMusic } from '../../hooks/useAppContext';
import { useInvitationData } from '../../hooks/useInvitationData';
import { formatLongDate } from '../../lib/date';
import { scrollToSection } from '../../lib/scroll';
import { SectionShell } from '../ui/SectionShell';

/** Section L — thank-you message beneath the ceremony arch and rings. */
export function ClosingSection() {
  const { config, first, second } = useInvitationData();
  const { reducedMotion } = useExperience();
  const music = useMusic();
  const { closing } = config;

  return (
    <SectionShell id="penutup" eyebrow="Penutup" title={closing.title} icon="heart">
      <div className="text-center">
        <p className="body-copy">{closing.message}</p>
        <blockquote className="mx-auto mt-4 max-w-md font-serif text-lg italic text-ink-soft">“{closing.prayer}”</blockquote>
        <p className="mt-5 text-sm text-ink-soft">{closing.signature}</p>
        <p className="script mt-1 text-5xl text-rose-deep">
          {first.nickname} <span className="font-serif text-3xl text-gold-deep">&amp;</span> {second.nickname}
        </p>
        <p className="mt-2 font-serif text-lg text-ink">{formatLongDate(config.weddingDate, config.weddingTimeZone)}</p>

        <button type="button" className="btn btn-secondary mt-6" onClick={() => scrollToSection(SECTION_IDS, 'beranda', !reducedMotion)}>
          <ArrowUp aria-hidden="true" className="size-4" />
          Kembali ke Atas
        </button>

        <footer className="mt-8 border-t border-gold/40 pt-4 text-xs text-ink-soft">
          <p>
            Undangan digital oleh <span className="font-medium text-gold-ink">Undesia</span> · taman voxel orisinal
          </p>
          <p className="mt-1">
            Musik: {music.title}
            {music.credit ? ` — ${music.credit}` : ''}
          </p>
        </footer>
      </div>
    </SectionShell>
  );
}
