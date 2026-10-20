import { CheckCircle2, Info, Loader2, Send } from 'lucide-react'
import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import type { Attendance, RsvpRecord } from '../../config/types'
import { useGuestName } from '../../hooks/useGuestName'
import { LIMITS, rsvpService, validateRsvp, type ValidationErrors } from '../../services/rsvpService'
import { SectionHeading } from '../ui/Ornament'

const ATTENDANCE: { value: Attendance; label: string }[] = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak', label: 'Berhalangan' },
  { value: 'ragu', label: 'Belum pasti' },
]

const ATTENDANCE_BADGE: Record<Attendance, string> = {
  hadir: 'bg-leaf/15 text-leaf',
  tidak: 'bg-[#9b3b2a]/12 text-[#7d2f22]',
  ragu: 'bg-champagne/18 text-teak',
}

const relTime = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
function ago(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return relTime.format(Math.round(diff), 'second')
  if (abs < 3600) return relTime.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return relTime.format(Math.round(diff / 3600), 'hour')
  return relTime.format(Math.round(diff / 86400), 'day')
}

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; name: string } | { kind: 'error'; message: string }

function DemoNotice() {
  if (rsvpService.mode !== 'local-demo') return null
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg border border-champagne/40 bg-sand/60 px-3 py-2 text-[0.74rem] leading-snug text-deep/80">
      <Info size={14} className="mt-0.5 shrink-0 text-champagne" aria-hidden="true" />
      Mode demo: konfirmasi & ucapan hanya tersimpan di peramban perangkat ini dan tidak terkirim ke mempelai maupun terlihat oleh tamu lain.
    </p>
  )
}

export function RsvpGuestbook() {
  const guest = useGuestName()
  const uid = useId()
  const [tab, setTab] = useState<'rsvp' | 'guestbook'>('rsvp')
  const [name, setName] = useState(guest ?? '')
  const [attendance, setAttendance] = useState<Attendance | ''>('')
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [records, setRecords] = useState<RsvpRecord[]>([])
  const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading')

  const refresh = useCallback(async () => {
    try {
      setRecords(await rsvpService.list())
      setListState('ready')
    } catch {
      setListState('error')
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const entry = { name, attendance: attendance || undefined, guests, message }
    const v = validateRsvp(entry)
    setErrors(v)
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0]
      document.getElementById(`${uid}-${first}`)?.focus({ preventScroll: true })
      return
    }
    setStatus({ kind: 'submitting' })
    try {
      const rec = await rsvpService.submit({ name, attendance: attendance as Attendance, guests, message })
      setStatus({ kind: 'success', name: rec.name })
      setMessage('')
      await refresh()
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.' })
    }
  }

  const tabBtn = (id: 'rsvp' | 'guestbook', label: string) => (
    <button
      type="button"
      role="tab"
      id={`${uid}-tab-${id}`}
      aria-selected={tab === id}
      aria-controls={`${uid}-panel-${id}`}
      onClick={() => setTab(id)}
      className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${tab === id ? 'bg-teak text-ivory' : 'text-teak hover:bg-champagne/15'}`}
    >
      {label}
    </button>
  )

  return (
    <div>
      <SectionHeading icon="heart" eyebrow="Among Tamu" title="Konfirmasi & Ucapan" />
      <div role="tablist" aria-label="RSVP dan buku tamu" className="mt-4 flex gap-1 rounded-full border border-champagne/50 bg-ivory-soft/70 p-1">
        {tabBtn('rsvp', 'Konfirmasi Kehadiran')}
        {tabBtn('guestbook', `Buku Tamu${records.length ? ` (${records.length})` : ''}`)}
      </div>

      {tab === 'rsvp' ? (
        <div role="tabpanel" id={`${uid}-panel-rsvp`} aria-labelledby={`${uid}-tab-rsvp`}>
          {status.kind === 'success' ? (
            <div className="mt-5 text-center" role="status">
              <CheckCircle2 className="mx-auto text-leaf" size={36} aria-hidden="true" />
              <p className="mt-2 font-display text-xl text-teak">Matur nuwun, {status.name}!</p>
              <p className="mt-1 text-sm text-deep/75">Konfirmasi Anda tercatat di perangkat ini (mode demo).</p>
              <div className="mt-4 flex justify-center gap-2">
                <button type="button" className="jawa-button text-sm" onClick={() => setTab('guestbook')}>
                  Lihat buku tamu
                </button>
                <button type="button" className="jawa-button-ghost text-sm" onClick={() => setStatus({ kind: 'idle' })}>
                  Ubah konfirmasi
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
              <div>
                <label htmlFor={`${uid}-name`} className="mb-1 block text-[0.8rem] font-medium text-deep">
                  Nama
                </label>
                <input
                  id={`${uid}-name`}
                  className="field"
                  value={name}
                  maxLength={LIMITS.nameMax}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                />
                {errors.name && (
                  <p id={`${uid}-name-err`} className="mt-1 text-[0.75rem] text-[#9b3b2a]">
                    {errors.name}
                  </p>
                )}
              </div>
              <fieldset>
                <legend className="mb-1 text-[0.8rem] font-medium text-deep">Kehadiran</legend>
                <div id={`${uid}-attendance`} tabIndex={-1} className="grid grid-cols-3 gap-1.5" aria-describedby={errors.attendance ? `${uid}-att-err` : undefined}>
                  {ATTENDANCE.map((a) => (
                    <label key={a.value} className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-[0.8rem] transition-colors ${attendance === a.value ? 'border-teak bg-teak text-ivory' : 'border-teak/25 bg-ivory-soft/80 text-deep hover:border-champagne'}`}>
                      <input type="radio" name={`${uid}-att`} value={a.value} checked={attendance === a.value} onChange={() => setAttendance(a.value)} className="sr-only" />
                      {a.label}
                    </label>
                  ))}
                </div>
                {errors.attendance && (
                  <p id={`${uid}-att-err`} className="mt-1 text-[0.75rem] text-[#9b3b2a]">
                    {errors.attendance}
                  </p>
                )}
              </fieldset>
              {attendance === 'hadir' && (
                <div>
                  <label htmlFor={`${uid}-guests`} className="mb-1 block text-[0.8rem] font-medium text-deep">
                    Jumlah tamu
                  </label>
                  <select id={`${uid}-guests`} className="field" value={guests} onChange={(e) => setGuests(Number(e.target.value))} aria-invalid={!!errors.guests}>
                    {Array.from({ length: LIMITS.guestsMax }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} orang
                      </option>
                    ))}
                  </select>
                  {errors.guests && <p className="mt-1 text-[0.75rem] text-[#9b3b2a]">{errors.guests}</p>}
                </div>
              )}
              <div>
                <label htmlFor={`${uid}-message`} className="mb-1 block text-[0.8rem] font-medium text-deep">
                  Ucapan & doa <span className="font-normal text-deep/55">(opsional)</span>
                </label>
                <textarea
                  id={`${uid}-message`}
                  className="field min-h-[78px] resize-y"
                  value={message}
                  maxLength={LIMITS.messageMax}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={!!errors.message}
                  aria-describedby={`${uid}-msg-count`}
                />
                <p id={`${uid}-msg-count`} className="mt-0.5 text-right text-[0.7rem] text-deep/50">
                  {message.length}/{LIMITS.messageMax}
                </p>
              </div>
              {status.kind === 'error' && (
                <p role="alert" className="rounded-lg bg-[#9b3b2a]/10 px-3 py-2 text-[0.8rem] text-[#7d2f22]">
                  {status.message}
                </p>
              )}
              <button type="submit" className="jawa-button inline-flex w-full items-center justify-center gap-2 text-sm" disabled={status.kind === 'submitting'}>
                {status.kind === 'submitting' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                {status.kind === 'submitting' ? 'Mengirim…' : 'Kirim Konfirmasi'}
              </button>
            </form>
          )}
          <DemoNotice />
        </div>
      ) : (
        <div role="tabpanel" id={`${uid}-panel-guestbook`} aria-labelledby={`${uid}-tab-guestbook`} className="mt-4">
          {listState === 'loading' && <p className="text-center text-sm text-deep/60">Memuat…</p>}
          {listState === 'error' && <p className="text-center text-sm text-[#7d2f22]">Buku tamu tidak dapat dimuat.</p>}
          {listState === 'ready' && records.length === 0 && (
            <p className="rounded-lg border border-dashed border-champagne/60 px-3 py-6 text-center text-sm text-deep/65">Belum ada ucapan di perangkat ini. Jadilah yang pertama memberi doa restu.</p>
          )}
          {records.length > 0 && (
            <ul className="space-y-2.5" aria-live="polite">
              {records.map((r) => (
                <li key={r.id} className="rounded-xl border border-champagne/40 bg-ivory-soft/80 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-[1.05rem] font-semibold text-teak">{r.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] ${ATTENDANCE_BADGE[r.attendance]}`}>
                      {ATTENDANCE.find((a) => a.value === r.attendance)?.label}
                      {r.attendance === 'hadir' ? ` · ${r.guests}` : ''}
                    </span>
                  </div>
                  {r.message && <p className="mt-1 text-[0.84rem] leading-relaxed whitespace-pre-line text-deep/80">{r.message}</p>}
                  <p className="mt-1 text-[0.68rem] text-deep/45">
                    {ago(r.createdAt)} · tersimpan lokal
                  </p>
                </li>
              ))}
            </ul>
          )}
          <DemoNotice />
        </div>
      )}
    </div>
  )
}
