import { CalendarPlus, Download } from 'lucide-react'
import { useCountdown } from '../../hooks/useCountdown'
import { downloadIcs, googleCalendarUrl } from '../../services/calendar'
import { wedding } from '../../config/wedding'
import { SectionHeading } from '../ui/Ornament'

const pad = (n: number) => String(n).padStart(2, '0')

export function Countdown() {
  const c = useCountdown(wedding.mainDate)
  const couple = `${wedding.couple.bride.nickname} & ${wedding.couple.groom.nickname}`
  const units = [
    { label: 'Hari', value: c.days },
    { label: 'Jam', value: c.hours },
    { label: 'Menit', value: c.minutes },
    { label: 'Detik', value: c.seconds },
  ]
  return (
    <div>
      <SectionHeading icon="calendar" eyebrow="Taman Sari · Menuju Hari Bahagia" title="Hitung Mundur" />
      <p className="mt-2 text-center font-display text-lg text-teak">{wedding.mainDateLabel}</p>
      {c.done ? (
        <p className="mt-4 text-center text-sm text-deep/80">Hari bahagia telah tiba — matur nuwun atas doa restu Anda.</p>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2" role="timer" aria-live="off" aria-label={`${c.days} hari ${c.hours} jam ${c.minutes} menit lagi`}>
          {units.map((u) => (
            <div key={u.label} className="rounded-xl border border-champagne/50 bg-ivory-soft/80 px-1 py-3 text-center shadow-sm">
              <div className="font-display text-[2rem] leading-none font-semibold tabular-nums text-teak">{u.label === 'Hari' ? u.value : pad(u.value)}</div>
              <div className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-deep/60">{u.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <a className="jawa-button inline-flex items-center gap-2 text-sm" href={googleCalendarUrl(wedding.events[0], couple)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus size={16} aria-hidden="true" /> Google Calendar
        </a>
        <button type="button" className="jawa-button-ghost inline-flex items-center gap-2 text-sm" onClick={() => downloadIcs(wedding.events, couple)}>
          <Download size={16} aria-hidden="true" /> Unduh .ics
        </button>
      </div>
    </div>
  )
}
