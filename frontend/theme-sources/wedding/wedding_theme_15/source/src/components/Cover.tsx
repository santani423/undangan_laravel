import { motion } from 'framer-motion'
import { EASE } from '../animation/easing'
import { playOpening } from '../animation/opening'
import { wedding } from '../config/wedding'
import { useGuestName } from '../hooks/useGuestName'
import { formatLongDate } from '../lib/date'
import { asset } from '../lib/links'
import { isSceneActive, useApp } from '../state/store'
import { IconEnvelopeOpen } from './Icons'

function LoadingLine() {
  const status = useApp((s) => s.sceneStatus)
  const progress = useApp((s) => s.loadProgress)
  if (!isSceneActive(status)) return null
  const ready = status === 'ready'
  const label = ready ? 'Hutan ajaib siap dijelajahi' : `Menyiapkan hutan ajaib… ${progress > 0 ? Math.round(progress) + '%' : ''}`
  return (
    <p className={`cover__loading${ready ? ' is-ready' : ''}`} role="status" aria-live="polite">
      <span className="cover__loading-dots" aria-hidden="true"><i /><i /><i /></span>
      {label}
    </p>
  )
}

/** Scene 1 overlay: the personalised invitation cover. The 3D envelope floats in the gap between the two text blocks. */
export function Cover() {
  const guest = useGuestName()
  const status = useApp((s) => s.sceneStatus)
  const { bride, groom } = wedding.couple
  return (
    <motion.section
      className="cover"
      aria-labelledby="cover-title"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE.inOut } }}
    >
      <motion.div className="cover__top" data-ui initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE.out, delay: 0.15 }}>
        <p className="eyebrow">The Wedding of</p>
        <h1 id="cover-title" className="display cover__names">
          {bride.nickname} <span className="amp">&amp;</span> {groom.nickname}
        </h1>
        <p className="cover__date">{formatLongDate(wedding.weddingDateISO)}</p>
      </motion.div>

      {/* Without WebGL the envelope is drawn in 2D so the cover keeps its centrepiece. */}
      <div className="cover__stage" aria-hidden="true">
        {!isSceneActive(status) && (
          <div className="cover__envelope2d">
            <img src={asset('assets/svg/floral-arch.svg')} alt="" />
            <IconEnvelopeOpen className="cover__envelope-icon" width={64} height={64} />
          </div>
        )}
      </div>

      <motion.div className="cover__bottom" data-ui initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE.out, delay: 0.35 }}>
        <p className="cover__to">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p className="cover__guest">{guest}</p>
        <button type="button" className="btn btn--primary btn--lg cover__cta" onClick={playOpening}>
          <IconEnvelopeOpen />
          Buka Undangan
        </button>
        <p className="cover__hint">Ketuk tombol{isSceneActive(status) ? ' atau amplopnya' : ''} untuk membuka undangan ✨</p>
        <LoadingLine />
        {wedding.isSample && <p className="cover__sample">Pratinjau dengan data contoh</p>}
      </motion.div>
    </motion.section>
  )
}
