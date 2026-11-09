import { ExternalLink, Info, Navigation } from 'lucide-react';
import { useInvitationData } from '../../hooks/useInvitationData';
import { fullAddress, getDirectionsUrl, getEmbedUrl, getMapsUrl } from '../../lib/maps';
import { CopyButton } from '../ui/CopyButton';
import { SectionShell } from '../ui/SectionShell';

/** Section D — address, embedded map preview and Google Maps actions. */
export function LocationSection() {
  const { config } = useInvitationData();
  const { location } = config;

  return (
    <SectionShell id="lokasi" eyebrow="Lokasi" title="Menuju Taman Kami" icon="location" width="lg">
      <address className="text-center not-italic" data-reveal>
        <p className="font-serif text-2xl font-semibold text-ink">{location.venueName}</p>
        <p className="body-copy mt-1">{location.address}</p>
      </address>
      {location.notes && (
        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-ink-soft" data-reveal>
          {location.notes}
        </p>
      )}

      <figure className="mt-5" data-reveal>
        <div className="overflow-hidden rounded-lg border border-gold/50 bg-ivory-deep shadow-inner">
          <iframe
            title={`Peta lokasi ${location.venueName}`}
            src={getEmbedUrl(location)}
            className="block aspect-[16/10] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            data-testid="map-embed"
          />
        </div>
        {config.meta.isSample && (
          <figcaption className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <Info aria-hidden="true" className="size-3.5" />
            Pratinjau peta memakai koordinat contoh — ganti dengan lokasi venue Anda.
          </figcaption>
        )}
      </figure>

      <div className="mt-5 flex flex-wrap justify-center gap-2" data-reveal>
        <a className="btn btn-primary" href={getMapsUrl(location)} target="_blank" rel="noopener noreferrer" data-testid="open-maps">
          <ExternalLink aria-hidden="true" className="size-4" />
          Buka Google Maps
          <span className="sr-only">(membuka tab baru)</span>
        </a>
        <a className="btn btn-secondary" href={getDirectionsUrl(location)} target="_blank" rel="noopener noreferrer">
          <Navigation aria-hidden="true" className="size-4" />
          Petunjuk Arah
          <span className="sr-only">(membuka tab baru)</span>
        </a>
        <CopyButton text={fullAddress(location)} label="Salin Alamat" ariaLabel="Salin alamat venue" successMessage="Alamat venue disalin" />
      </div>
    </SectionShell>
  );
}
