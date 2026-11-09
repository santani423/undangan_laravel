import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { wedding } from '../config/wedding'
import { addWish, getGuestbookMode, listWishes, type Wish } from '../services/guestbook'
import { useGuestName } from '../hooks/useGuestName'
import { useApp } from '../state/store'
import { IconAlert } from '../components/Icons'
import { DemoBadge, EmptyState, Reveal, SectionHeading, Spinner } from '../components/ui'

const rtf = new Intl.RelativeTimeFormat(wedding.locale, { numeric: 'auto' })
function relative(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'baru saja'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day')
  return new Intl.DateTimeFormat(wedding.locale, { dateStyle: 'medium', timeZone: wedding.timeZone }).format(new Date(iso))
}

type ListState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; wishes: Wish[] }

/** Scene 8: digital guestbook beside the wishing tree. Every wish adds a glowing tag to the tree. */
export function WishesSection() {
  const mode = getGuestbookMode()
  const guest = useGuestName()
  const uid = useId()
  const setWishCount = useApp((s) => s.setWishCount)
  const [list, setList] = useState<ListState>({ kind: 'loading' })
  const [name, setName] = useState(guest === wedding.guest.fallbackName ? '' : guest)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const max = wedding.guestbook.maxLength

  const load = useCallback(async () => {
    setList({ kind: 'loading' })
    try {
      const wishes = await listWishes()
      setList({ kind: 'ready', wishes })
    } catch (e) {
      console.warn('[guestbook]', e)
      setList({ kind: 'error' })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (list.kind === 'ready') setWishCount(list.wishes.length)
  }, [list, setWishCount])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Mohon isi nama kamu (minimal 2 huruf).')
    if (message.trim().length < 3) return setError('Tulis ucapan atau doa terlebih dahulu.')
    setError(null)
    setSending(true)
    try {
      const { wish, pending } = await addWish(name.slice(0, 60), message.slice(0, max))
      setMessage('')
      if (pending) setNotice('Terima kasih! Ucapanmu akan tampil setelah disetujui oleh mempelai.')
      else setNotice(mode === 'local' ? 'Ucapan tersimpan di browser ini (mode demo).' : 'Terima kasih atas doa dan ucapanmu 💛')
      if (wish) setList((l) => (l.kind === 'ready' ? { kind: 'ready', wishes: [wish, ...l.wishes] } : { kind: 'ready', wishes: [wish] }))
    } catch (err) {
      console.warn('[guestbook]', err)
      setError('Ucapan gagal terkirim. Coba lagi sebentar lagi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="wishes" data-scene className="section section--left section--tall" aria-labelledby="wishes-title">
      <div className="panel">
        <SectionHeading id="wishes-title" eyebrow="Wishes" title={<>Pohon <em>harapan</em></>} />
        <Reveal as="p" className="lead" delay={0.1}>
          Gantungkan doa dan ucapanmu di pohon harapan kami — setiap pesan menjadi satu cahaya kecil di dahannya.
        </Reveal>
        {mode === 'local' && <DemoBadge>Mode demo: ucapan hanya tersimpan di browser ini dan tidak terlihat oleh tamu lain.</DemoBadge>}

        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor={`${uid}-name`}>Nama</label>
            <input id={`${uid}-name`} autoComplete="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-msg`}>Ucapan &amp; doa</label>
            <textarea id={`${uid}-msg`} rows={3} value={message} maxLength={max} onChange={(e) => setMessage(e.target.value)} aria-describedby={`${uid}-count`} />
            <p className="field__hint" id={`${uid}-count`}>{message.length}/{max}</p>
          </div>
          {error && (
            <p className="field__error" role="alert">
              <IconAlert width={15} height={15} /> {error}
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={sending} aria-busy={sending}>
            {sending ? <Spinner label="Mengirim ucapan" /> : 'Kirim Ucapan'}
          </button>
          <AnimatePresence>
            {notice && (
              <motion.p className="result result--ok small" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {notice}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <div className="wishes" aria-live="polite" aria-busy={list.kind === 'loading'}>
          {list.kind === 'loading' && (
            <div className="wishes__state">
              <Spinner label="Memuat ucapan" />
            </div>
          )}
          {list.kind === 'error' && (
            <div className="wishes__state">
              <p>Ucapan belum bisa dimuat.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => void load()}>Coba lagi</button>
            </div>
          )}
          {list.kind === 'ready' && list.wishes.length === 0 && <EmptyState title="Belum ada ucapan" text="Jadilah yang pertama menggantungkan doa di pohon harapan ✨" />}
          {list.kind === 'ready' && list.wishes.length > 0 && (
            <ul className="wishes__list">
              <AnimatePresence initial={false}>
                {list.wishes.map((w) => (
                  <motion.li key={w.id} className="wish" layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="wish__head">
                      <strong>{w.name}</strong>
                      <time dateTime={w.createdAt}>{relative(w.createdAt)}</time>
                    </p>
                    <p className="wish__msg">{w.message}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
