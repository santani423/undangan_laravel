import { asset, SVGS } from '../../config/assets'

type IconKey = keyof typeof SVGS.icons

/** Javanese divider from the asset pack. */
export function Divider({ className = '' }: { className?: string }) {
  return <img src={asset(SVGS.divider)} alt="" aria-hidden="true" className={`mx-auto h-auto w-40 select-none ${className}`} draggable={false} />
}

/** Section heading: asset-pack icon + Javanese eyebrow + display title. */
export function SectionHeading({ icon, eyebrow, title, align = 'center', tone = 'dark' }: { icon?: IconKey; eyebrow: string; title: string; align?: 'center' | 'left'; tone?: 'dark' | 'light' }) {
  const color = tone === 'dark' ? 'text-deep' : 'text-ivory'
  return (
    <header className={align === 'center' ? 'text-center' : 'text-left'}>
      <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
        {icon && <img src={asset(SVGS.icons[icon])} alt="" aria-hidden="true" className={`h-4 w-4 ${tone === 'light' ? 'brightness-[3] sepia' : ''}`} />}
        <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.32em] text-champagne">{eyebrow}</p>
      </div>
      <h2 className={`mt-1 font-display text-[1.9rem] leading-tight font-medium ${color}`}>{title}</h2>
    </header>
  )
}

/** Monogram portrait placeholder built from the kawung ornament. */
export function Monogram({ initial, photo, alt }: { initial: string; photo: string | null; alt: string }) {
  if (photo) {
    return <img src={asset(photo)} alt={alt} className="h-24 w-24 rounded-full border-2 border-champagne object-cover shadow-md" />
  }
  return (
    <div
      role="img"
      aria-label={`${alt} (foto belum diatur)`}
      className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-champagne shadow-md"
      style={{ backgroundImage: `url(${asset(SVGS.kawungMotif)})`, backgroundSize: '64px' }}
    >
      <span className="absolute inset-2 rounded-full bg-teak/88" />
      <span className="relative font-script text-4xl text-champagne-light">{initial}</span>
    </div>
  )
}
