import { asset, SVGS } from '../../config/assets'

export function LoadingScreen({ progress, label, hidden }: { progress: number; label: string; hidden: boolean }) {
  const pct = Math.round(progress * 100)
  return (
    <div
      className={`fixed inset-0 z-[90] grid place-items-center bg-deep transition-opacity duration-700 ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      aria-hidden={hidden}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center px-6 text-center">
        <img src={asset(SVGS.kawungMotif)} alt="" aria-hidden="true" className="animate-soft-spin h-16 w-16 rounded-full border border-champagne/60 opacity-90" />
        <p className="mt-5 font-display text-2xl tracking-[0.2em] text-ivory uppercase">Pawiwahan Agung</p>
        <p className="mt-1 text-[0.75rem] tracking-[0.18em] text-champagne-light uppercase">{label}</p>
        <div className="mt-5 h-[3px] w-56 overflow-hidden rounded-full bg-ivory/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Memuat undangan">
          <div className="h-full rounded-full bg-gradient-to-r from-champagne to-champagne-light transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-[0.7rem] tabular-nums text-ivory/50">{pct}%</p>
      </div>
    </div>
  )
}
