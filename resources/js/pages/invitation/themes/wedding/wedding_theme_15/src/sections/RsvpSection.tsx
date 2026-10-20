import { AnimatePresence, motion } from 'framer-motion'
import { useId, useRef, useState, type FormEvent } from 'react'
import { wedding } from '../config/wedding'
import { getRsvpMode, postRsvp, rsvpWhatsappUrl, type RsvpPayload } from '../services/rsvp'
import { useGuestName } from '../hooks/useGuestName'
import { IconAlert, IconCheck, IconWhatsapp } from '../components/Icons'
import { DemoBadge, Reveal, SectionHeading, Spinner } from '../components/ui'

type Status = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'success'; waUrl?: string } | { kind: 'error'; message: string }
type Errors = Partial<Record<'name' | 'attendance' | 'guests' | 'message', string>>

const MAX_MESSAGE = 300

function validate(p: Partial<RsvpPayload>): Errors {
  const e: Errors = {}
  const name = p.name?.trim() ?? ''
  if (name.length < 2) e.name = 'Mohon isi nama kamu (minimal 2 huruf).'
  else if (name.length > 60) e.name = 'Nama terlalu panjang (maksimal 60 karakter).'
  if (!p.attendance) e.attendance = 'Pilih salah satu: hadir atau tidak dapat hadir.'
  if (p.attendance === 'yes' && (!p.guests || p.guests < 1 || p.guests > wedding.rsvp.maxGuests)) e.guests = `Jumlah tamu 1–${wedding.rsvp.maxGuests} orang.`
  if ((p.message?.length ?? 0) > MAX_MESSAGE) e.message = `Maksimal ${MAX_MESSAGE} karakter.`
  return e
}

/** Scene 7: RSVP in the lantern-lit gazebo. */
export function RsvpSection() {
  const mode = getRsvpMode()
  const guest = useGuestName()
  const uid = useId()
  const form = useRef<HTMLFormElement>(null)
  const [name, setName] = useState(guest === wedding.guest.fallbackName ? '' : guest)
  const [attendance, setAttendance] = useState<'yes' | 'no' | ''>('')
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const payload: RsvpPayload = { name: name.trim(), attendance: attendance as 'yes' | 'no', guests: attendance === 'yes' ? guests : 0, message: message.trim() }
    const errs = validate({ ...payload, attendance: attendance || undefined })
    setErrors(errs)
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    if (mode === 'whatsapp') {
      // Opened synchronously inside the submit gesture so pop-up blockers allow it.
      const url = rsvpWhatsappUrl(payload)
      window.open(url, '_blank', 'noopener')
      setStatus({ kind: 'success', waUrl: url })
      return
    }
    if (mode === 'demo') {
      setStatus({ kind: 'success' })
      return
    }
    setStatus({ kind: 'submitting' })
    try {
      await postRsvp(payload)
      setStatus({ kind: 'success' })
    } catch (err) {
      console.warn('[rsvp]', err)
      setStatus({ kind: 'error', message: 'Konfirmasi gagal terkirim. Periksa koneksi internet lalu coba lagi.' })
    }
  }

  const reset = () => {
    setStatus({ kind: 'idle' })
  }
  const err = (k: keyof Errors) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${uid}-${k}-err` } : {})

  return (
    <section id="rsvp" data-scene className="section section--right section--tall" aria-labelledby="rsvp-title">
      <div className="panel">
        <SectionHeading id="rsvp-title" eyebrow="RSVP" title={<>Akankah kamu <em>hadir?</em></>} />
        <Reveal as="p" className="lead" delay={0.1}>
          {wedding.rsvp.deadlineLabel}. Kehadiran dan doamu adalah hadiah terindah bagi kami.
        </Reveal>
        {mode === 'demo' && <DemoBadge>Mode demo: RSVP belum terhubung ke WhatsApp atau server, jadi jawabanmu tidak dikirim ke mana pun.</DemoBadge>}
        {mode === 'whatsapp' && <p className="muted small">Konfirmasi dikirim lewat WhatsApp — pesan akan terisi otomatis.</p>}

        <AnimatePresence mode="wait" initial={false}>
          {status.kind === 'success' ? (
            <motion.div key="ok" className="result result--ok" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <IconCheck className="result__icon" />
              {mode === 'endpoint' && <p><strong>Terima kasih, {name.trim()}!</strong> Konfirmasimu sudah kami terima.</p>}
              {mode === 'whatsapp' && (
                <>
                  <p><strong>Hampir selesai!</strong> WhatsApp sudah terbuka dengan pesan konfirmasi. Tekan <em>Kirim</em> di WhatsApp untuk menyelesaikan RSVP.</p>
                  <a className="btn btn--ghost btn--sm" href={status.waUrl} target="_blank" rel="noopener noreferrer">
                    <IconWhatsapp /> Buka WhatsApp lagi
                  </a>
                </>
              )}
              {mode === 'demo' && <p><strong>Formulir valid ✓</strong> Ini mode demo — tidak ada data yang dikirim atau disimpan.</p>}
              <button type="button" className="link-btn" onClick={reset}>Ubah jawaban</button>
            </motion.div>
          ) : (
            <motion.form key="form" ref={form} className="form" noValidate onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="field">
                <label htmlFor={`${uid}-name`}>Nama</label>
                <input id={`${uid}-name`} name="name" autoComplete="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" {...err('name')} />
                {errors.name && <p className="field__error" id={`${uid}-name-err`}><IconAlert width={15} height={15} /> {errors.name}</p>}
              </div>

              <fieldset className="field" {...(errors.attendance ? { 'aria-describedby': `${uid}-attendance-err` } : {})}>
                <legend>Kehadiran</legend>
                <div className="choice-row">
                  {([['yes', 'Ya, saya akan hadir', '🌿'], ['no', 'Maaf, tidak bisa hadir', '🌙']] as const).map(([v, label, emoji]) => (
                    <label key={v} className={`choice${attendance === v ? ' is-checked' : ''}`}>
                      <input type="radio" name="attendance" value={v} checked={attendance === v} onChange={() => setAttendance(v)} aria-invalid={errors.attendance ? true : undefined} />
                      <span aria-hidden="true">{emoji}</span> {label}
                    </label>
                  ))}
                </div>
                {errors.attendance && <p className="field__error" id={`${uid}-attendance-err`}><IconAlert width={15} height={15} /> {errors.attendance}</p>}
              </fieldset>

              {attendance === 'yes' && (
                <div className="field">
                  <label htmlFor={`${uid}-guests`}>Jumlah tamu (termasuk kamu)</label>
                  <select id={`${uid}-guests`} value={guests} onChange={(e) => setGuests(Number(e.target.value))} {...err('guests')}>
                    {Array.from({ length: wedding.rsvp.maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} orang</option>
                    ))}
                  </select>
                  {errors.guests && <p className="field__error" id={`${uid}-guests-err`}><IconAlert width={15} height={15} /> {errors.guests}</p>}
                </div>
              )}

              <div className="field">
                <label htmlFor={`${uid}-msg`}>Catatan <span className="optional">(opsional — misalnya kebutuhan makanan)</span></label>
                <textarea id={`${uid}-msg`} rows={3} value={message} maxLength={MAX_MESSAGE} onChange={(e) => setMessage(e.target.value)} {...err('message')} />
                <p className="field__hint" aria-live="off">{message.length}/{MAX_MESSAGE}</p>
                {errors.message && <p className="field__error" id={`${uid}-message-err`}><IconAlert width={15} height={15} /> {errors.message}</p>}
              </div>

              {status.kind === 'error' && (
                <p className="result result--error" role="alert">
                  <IconAlert className="result__icon" /> {status.message}
                </p>
              )}

              <button type="submit" className="btn btn--primary btn--block" disabled={status.kind === 'submitting'} aria-busy={status.kind === 'submitting'}>
                {status.kind === 'submitting' ? <Spinner label="Mengirim konfirmasi" /> : mode === 'whatsapp' ? <><IconWhatsapp /> Kirim via WhatsApp</> : 'Kirim Konfirmasi'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
