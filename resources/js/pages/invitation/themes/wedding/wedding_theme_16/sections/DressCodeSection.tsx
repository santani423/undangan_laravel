import { Palette, Shirt } from 'lucide-react';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';

/** Section I — attire guidance and the invitation's colour palette (also shown as 3D pillars). */
export function DressCodeSection() {
    const { config } = useInvitationData();
    const { dressCode } = config;

    return (
        <SectionShell id="dress-code" eyebrow="Dress Code" title={dressCode.title}>
            <p className="wt16-body wt16-center">{dressCode.description}</p>

            <h3 className="wt16-subhead wt16-subhead--center">
                <Palette aria-hidden="true" size={20} />
                Palet warna yang disarankan
            </h3>
            <ul className="wt16-swatches">
                {dressCode.palette.map((swatch) => (
                    <li key={`${swatch.name}-${swatch.hex}`} className="wt16-swatch" data-reveal>
                        <span aria-hidden="true" className="wt16-swatch__chip" style={{ background: swatch.hex }} />
                        <span className="wt16-swatch__name">{swatch.name}</span>
                        <span className="wt16-swatch__hex">{swatch.hex}</span>
                    </li>
                ))}
            </ul>

            <h3 className="wt16-subhead wt16-subhead--center">
                <Shirt aria-hidden="true" size={20} />
                Busana yang disarankan
            </h3>
            <dl className="wt16-recs">
                {dressCode.recommendations.map((item) => (
                    <div key={item.label} className="wt16-sub" data-reveal>
                        <dt className="wt16-recs__label">{item.label}</dt>
                        <dd className="wt16-body wt16-recs__detail">{item.detail}</dd>
                    </div>
                ))}
            </dl>

            {dressCode.notes.length > 0 && (
                <ul className="wt16-notes">
                    {dressCode.notes.map((note) => (
                        <li key={note}>{note}</li>
                    ))}
                </ul>
            )}
        </SectionShell>
    );
}
