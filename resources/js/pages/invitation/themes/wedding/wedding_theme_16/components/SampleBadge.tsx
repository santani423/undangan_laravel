import { Info } from 'lucide-react';

/** Discreet notice that this is the theme's sample invitation. */
export function SampleBadge() {
    return (
        <p className="wt16-pill wt16-sample" title="Nama, lokasi, foto, dan data hadiah pada undangan contoh ini bersifat fiktif.">
            <Info aria-hidden="true" size={14} />
            Undangan contoh<span className="wt16-sample__more"> · data fiktif</span>
        </p>
    );
}
