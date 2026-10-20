import { MailOpen } from 'lucide-react'
import { wedding } from '../../config/wedding'
import { useGuestName } from '../../hooks/useGuestName'
import { Divider } from '../ui/Ornament'

/** The invitation cover content (shared by the cinematic overlay and the lite layout). */
export function CoverContent({ onOpen, opening = false }: { onOpen: () => void; opening?: boolean }) {
  const guest = useGuestName()
  const { bride, groom } = wedding.couple
  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.42em] text-champagne-light">{wedding.invitationSubtitle}</p>
      <p className="mt-1 font-display text-lg tracking-[0.18em] text-ivory/85 uppercase">{wedding.invitationTitle}</p>
      <Divider className="mt-3 w-44 opacity-90" />
      <h1 className="mt-2 font-script text-[3.4rem] leading-[1.05] text-ivory drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-[4.6rem]">
        {bride.nickname}
        <span className="mx-3 text-champagne-light">&amp;</span>
        {groom.nickname}
      </h1>
      <p className="mt-2 font-display text-xl text-ivory/90">{wedding.mainDateLabel}</p>

      <div className="mt-7 w-full max-w-xs rounded-xl border border-champagne/50 bg-ink/35 px-5 py-3 backdrop-blur-sm">
        <p className="text-[0.75rem] text-ivory/70">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="mt-0.5 font-display text-2xl font-semibold text-ivory">{guest ?? 'Tamu Undangan'}</p>
        <p className="mt-0.5 text-[0.68rem] text-ivory/55">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={opening}
        className="jawa-button mt-6 inline-flex items-center gap-2.5 !px-7 !py-3.5 text-base shadow-[0_8px_30px_rgba(181,138,69,0.35)]"
      >
        <MailOpen size={18} aria-hidden="true" /> Buka Undangan
      </button>
      {wedding.isExampleData && (
        <p className="mt-4 max-w-xs text-[0.66rem] leading-snug text-ivory/50">Nama, tanggal, lokasi, dan rekening di undangan ini masih data contoh.</p>
      )}
    </div>
  )
}
