import { SVGS } from '../lib/aset';

type IconKey = keyof typeof SVGS.icons;

/** Javanese divider from the asset pack. */
export function Divider({ className = '' }: { className?: string }) {
    return <img src={SVGS.divider} alt="" aria-hidden="true" className={`wt14-divider ${className}`} draggable={false} />;
}

/** Section heading: asset-pack icon + Javanese eyebrow + display title. */
export function SectionHeading({ icon, eyebrow, title }: { icon?: IconKey; eyebrow: string; title: string }) {
    return (
        <header className="wt14-heading">
            <div className="wt14-heading-eyebrow">
                {icon && <img src={SVGS.icons[icon]} alt="" aria-hidden="true" />}
                <p className="wt14-eyebrow">{eyebrow}</p>
            </div>
            <h2 className="wt14-heading-title">{title}</h2>
        </header>
    );
}

/** Portrait, or a monogram placeholder built from the kawung ornament when no photo is set. */
export function Monogram({ initial, photo, alt }: { initial: string; photo: string; alt: string }) {
    if (photo) return <img src={photo} alt={alt} className="wt14-portrait" />;
    return (
        <div
            role="img"
            aria-label={`${alt} (foto belum diatur)`}
            className="wt14-portrait wt14-monogram"
            style={{ backgroundImage: `url(${SVGS.kawungMotif})` }}
        >
            <span className="wt14-monogram-fill" />
            <span className="wt14-monogram-initial">{initial}</span>
        </div>
    );
}
