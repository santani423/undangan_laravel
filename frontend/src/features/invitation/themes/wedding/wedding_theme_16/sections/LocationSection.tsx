import { ExternalLink, Info, Navigation } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SectionShell } from '../components/SectionShell';
import { useInvitationData } from '../hooks/useAppContext';
import { fullAddress, getDirectionsUrl, getEmbedUrl, getMapsUrl } from '../lib/maps';

/** Section D — address, embedded map preview and Google Maps actions. */
export function LocationSection() {
    const { config } = useInvitationData();
    const { location } = config;
    if (!location) return null;

    return (
        <SectionShell id="lokasi" eyebrow="Lokasi" title="Menuju Taman Kami" icon="location" width="lg">
            <address className="wt16-location" data-reveal>
                <p className="wt16-location__name">{location.venueName}</p>
                {location.address && <p className="wt16-body">{location.address}</p>}
            </address>
            {location.notes && (
                <p className="wt16-location__notes" data-reveal>
                    {location.notes}
                </p>
            )}

            <figure className="wt16-map" data-reveal>
                <div className="wt16-map__frame">
                    <iframe
                        title={`Peta lokasi ${location.venueName}`}
                        src={getEmbedUrl(location)}
                        className="wt16-map__iframe"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
                {config.meta.isSample && (
                    <figcaption className="wt16-note">
                        <Info aria-hidden="true" size={14} />
                        Pratinjau peta memakai lokasi contoh.
                    </figcaption>
                )}
            </figure>

            <div className="wt16-actions" data-reveal>
                <a className="wt16-btn wt16-btn--primary" href={getMapsUrl(location)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" size={16} />
                    Buka Google Maps
                    <span className="wt16-sr-only">(membuka tab baru)</span>
                </a>
                <a className="wt16-btn wt16-btn--secondary" href={getDirectionsUrl(location)} target="_blank" rel="noopener noreferrer">
                    <Navigation aria-hidden="true" size={16} />
                    Petunjuk Arah
                    <span className="wt16-sr-only">(membuka tab baru)</span>
                </a>
                <CopyButton text={fullAddress(location)} label="Salin Alamat" ariaLabel="Salin alamat venue" successMessage="Alamat venue disalin" />
            </div>
        </SectionShell>
    );
}
