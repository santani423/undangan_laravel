import { Check, Copy, QrCode, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { asset } from '../../config/assets'
import type { GiftAccount } from '../../config/types'
import { wedding } from '../../config/wedding'
import { copyText } from '../../services/clipboard'
import { SectionHeading } from '../ui/Ornament'

const groupDigits = (s: string) => s.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')

function AccountCard({ acc }: { acc: GiftAccount }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const onCopy = async () => {
    window.clearTimeout(timer.current)
    try {
      await copyText(acc.accountNumber.replace(/\s+/g, ''))
      setState('copied')
    } catch {
      setState('error')
    }
    timer.current = window.setTimeout(() => setState('idle'), 3200)
  }
  return (
    <div className="rounded-2xl border border-champagne/55 bg-gradient-to-br from-ivory-soft to-sand/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.26em] text-champagne">{acc.bankName}</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-wide tabular-nums text-teak select-all">{groupDigits(acc.accountNumber)}</p>
          <p className="text-[0.82rem] text-deep/75">a.n. {acc.accountHolder}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`jawa-button inline-flex shrink-0 items-center gap-1.5 !px-3 !py-2 text-[0.8rem] ${state === 'copied' ? '!bg-leaf' : ''}`}
          aria-label={`Salin nomor rekening ${acc.bankName}`}
        >
          {state === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {state === 'copied' ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Nomor rekening tersalin' : state === 'error' ? 'Gagal menyalin' : ''}
      </p>
      {state === 'error' && <p className="mt-2 text-[0.75rem] text-[#7d2f22]">Peramban tidak mengizinkan penyalinan otomatis. Silakan pilih dan salin nomor di atas secara manual.</p>}
      {acc.isPlaceholder && (
        <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-[#7d2f22]">
          <TriangleAlert size={13} aria-hidden="true" /> Contoh — bukan rekening asli. Ubah di src/config/wedding.ts.
        </p>
      )}
    </div>
  )
}

export function GiftDetails() {
  const { gift } = wedding
  return (
    <div>
      <SectionHeading icon="gift" eyebrow="Tanda Katresnan" title="Amplop Digital" />
      <p className="mx-auto mt-3 max-w-sm text-center text-[0.84rem] leading-relaxed text-deep/80">{gift.intro}</p>
      <div className="mt-4 space-y-3">
        {gift.accounts.map((a) => (
          <AccountCard key={a.id} acc={a} />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        {gift.qrisImage ? (
          <img src={asset(gift.qrisImage)} alt="Kode QRIS untuk tanda kasih" className="h-44 w-44 rounded-lg border border-champagne bg-white p-2" />
        ) : (
          <div className="grid h-36 w-36 place-items-center rounded-lg border-2 border-dashed border-champagne/70 bg-ivory-soft/60 p-3 text-center" role="img" aria-label="QRIS belum diatur">
            <div>
              <QrCode className="mx-auto text-champagne" size={30} aria-hidden="true" />
              <p className="mt-1 text-[0.7rem] leading-tight text-deep/65">QRIS belum diatur — tambahkan gambar resmi dari bank Anda</p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-4 text-center font-display text-lg italic text-teak">{gift.thanks}</p>
    </div>
  )
}
