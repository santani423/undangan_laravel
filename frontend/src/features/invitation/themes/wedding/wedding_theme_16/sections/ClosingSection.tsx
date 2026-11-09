import { ArrowUp } from 'lucide-react';
import { useMemo } from 'react';
import { SectionShell } from '../components/SectionShell';
import { useExperience, useInvitationData, useMusic } from '../hooks/useAppContext';
import { scrollToSection } from '../lib/scroll';

/** Section L — thank-you message beneath the ceremony arch and rings. */
export function ClosingSection() {
    const { config, first, second, sections } = useInvitationData();
    const { reducedMotion } = useExperience();
    const music = useMusic();
    const { closing } = config;
    const ids = useMemo(() => sections.map((section) => section.id), [sections]);

    return (
        <SectionShell id="penutup" eyebrow="Penutup" title={closing.title} icon="heart">
            <div className="wt16-closing">
                <p className="wt16-body">{closing.message}</p>
                <blockquote className="wt16-quote">“{closing.prayer}”</blockquote>
                <p className="wt16-closing__signature">{closing.signature}</p>
                <p className="wt16-script wt16-closing__names">
                    {first.nickname} <span className="wt16-closing__amp">&amp;</span> {second.nickname}
                </p>
                {config.weddingDateLabel && <p className="wt16-closing__date">{config.weddingDateLabel}</p>}

                <button
                    type="button"
                    className="wt16-btn wt16-btn--secondary wt16-closing__top"
                    onClick={() => scrollToSection(ids, 'beranda', !reducedMotion)}
                >
                    <ArrowUp aria-hidden="true" size={16} />
                    Kembali ke Atas
                </button>

                {config.sections.footer && (
                    <footer className="wt16-footer">
                        <p>Taman voxel, model 3D, dan ilustrasi dibuat khusus untuk undangan ini.</p>
                        {music.enabled && (
                            <p>
                                Musik: {music.title}
                                {music.credit ? ` — ${music.credit}` : ''}
                            </p>
                        )}
                    </footer>
                )}
            </div>
        </SectionShell>
    );
}
