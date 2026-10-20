import { RotateCcw } from 'lucide-react'
import { wedding } from '../../config/wedding'
import { Divider } from '../ui/Ornament'

export function ClosingMessage({ onRestart, restartLabel = 'Kembali ke awal' }: { onRestart: () => void; restartLabel?: string }) {
  const { closing, couple } = wedding
  return (
    <div className="text-center">
      <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.32em] text-champagne">Panutup</p>
      <h2 className="mt-1 font-display text-4xl font-medium text-deep">{closing.title}</h2>
      <p className="mx-auto mt-3 max-w-md text-[0.88rem] leading-relaxed text-deep/80">{closing.message}</p>
      <p className="mx-auto mt-3 max-w-md font-display text-lg italic text-teak">{closing.prayer}</p>
      <Divider className="mt-4 w-32" />
      <p className="mt-2 text-[0.75rem] uppercase tracking-[0.24em] text-deep/60">{closing.signOff}</p>
      <p className="mt-1 font-script text-[2.6rem] leading-tight text-teak">
        {couple.bride.nickname} &amp; {couple.groom.nickname}
      </p>
      <p className="font-display text-base text-deep/75">{wedding.mainDateLabel}</p>
      {wedding.hashtag && <p className="mt-1 text-[0.78rem] text-champagne">{wedding.hashtag}</p>}
      <button type="button" className="jawa-button mt-5 inline-flex items-center gap-2 text-sm" onClick={onRestart}>
        <RotateCcw size={15} aria-hidden="true" /> {restartLabel}
      </button>
    </div>
  )
}
