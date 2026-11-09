import { useCallback, useEffect, useMemo, useState } from 'react'
import { CinematicExperience } from './components/experience/CinematicExperience'
import { LiteExperience } from './components/experience/LiteExperience'
import { wedding } from './config/wedding'
import { hasWebGL } from './hooks/useWebGLSupport'
import { asset } from './config/assets'
import { AmbientAudio } from './services/ambientAudio'
import { journey, setUi } from './state/journey'

type Mode = '3d' | 'lite'

const NOTICES: Record<string, string | null> = {
  'no-webgl': 'Peramban atau perangkat ini tidak mendukung WebGL, jadi undangan ditampilkan dalam versi ringan. Semua fitur tetap tersedia.',
  'context-lost': 'Tampilan 3D dihentikan oleh peramban karena kendala grafis. Semua fitur tetap tersedia di versi ringan ini.',
  'render-error': 'Tampilan 3D tidak dapat ditampilkan di perangkat ini. Semua fitur tetap tersedia di versi ringan ini.',
  'asset-error': 'Sebagian aset 3D gagal dimuat. Semua fitur tetap tersedia di versi ringan ini.',
  user: null,
  param: null,
}

export default function App() {
  const webgl = useMemo(() => hasWebGL(), [])
  const forcedLite = useMemo(() => new URLSearchParams(window.location.search).get('mode') === 'lite', [])
  const [mode, setMode] = useState<Mode>(webgl && !forcedLite ? '3d' : 'lite')
  const [notice, setNotice] = useState<string | null>(webgl ? null : NOTICES['no-webgl'])
  const audio = useMemo(() => new AmbientAudio(wedding.audio.src ? asset(wedding.audio.src) : null), [])
  useEffect(() => () => audio.dispose(), [audio])

  const toLite = useCallback((reason: string) => {
    journey.progress = 0
    journey.intro = 1
    setUi({ opened: false, sceneIndex: 0 })
    setNotice(NOTICES[reason] ?? null)
    setMode('lite')
    window.scrollTo(0, 0)
  }, [])

  const to3D = useCallback(() => {
    setUi({ opened: false, sceneIndex: 0 })
    setNotice(null)
    window.scrollTo(0, 0)
    setMode('3d')
  }, [])

  return mode === '3d' ? (
    <CinematicExperience key="3d" audio={audio} onFallback={toLite} />
  ) : (
    <LiteExperience key="lite" audio={audio} notice={notice} canUse3D={webgl} onUse3D={to3D} />
  )
}
