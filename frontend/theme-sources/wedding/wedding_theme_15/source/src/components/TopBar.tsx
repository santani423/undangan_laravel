import { motion } from 'framer-motion'
import { setMusic } from '../audio/music'
import { wedding } from '../config/wedding'
import { useApp } from '../state/store'
import { IconLeaf, IconMusic, IconMusicOff } from './Icons'
import { Monogram } from './Monogram'

export function TopBar() {
  const musicOn = useApp((s) => s.musicOn)
  const status = useApp((s) => s.sceneStatus)
  const setLiteMode = useApp((s) => s.setLiteMode)
  const lite = status === 'disabled'
  const webglMissing = status === 'failed'

  return (
    <motion.header className="topbar" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
      <a href="#home" className="topbar__brand" aria-label={`${wedding.couple.displayNames} — kembali ke awal`}>
        <Monogram size={40} />
      </a>
      <div className="topbar__actions">
        {!webglMissing && (
          <button
            type="button"
            className="icon-btn"
            aria-pressed={lite}
            onClick={() => setLiteMode(!lite)}
            title={lite ? 'Nyalakan hutan 3D' : 'Mode ringan (tanpa 3D, hemat baterai)'}
          >
            <IconLeaf />
            <span className="sr-only">Mode ringan tanpa 3D</span>
          </button>
        )}
        <button
          type="button"
          className={`icon-btn${musicOn ? ' is-on' : ''}`}
          aria-pressed={musicOn}
          onClick={() => void setMusic(!musicOn)}
          title={musicOn ? 'Matikan musik' : 'Putar musik'}
        >
          {musicOn ? <IconMusic /> : <IconMusicOff />}
          <span className="sr-only">Musik latar</span>
          {musicOn && <span className="icon-btn__eq" aria-hidden="true"><i /><i /><i /></span>}
        </button>
      </div>
    </motion.header>
  )
}
