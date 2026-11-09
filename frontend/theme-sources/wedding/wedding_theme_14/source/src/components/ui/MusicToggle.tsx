import { Music, Pause } from 'lucide-react'
import { useEffect, useState } from 'react'
import { wedding } from '../../config/wedding'
import type { AmbientAudio } from '../../services/ambientAudio'

export function MusicToggle({ audio }: { audio: AmbientAudio }) {
  const [playing, setPlaying] = useState(audio.playing)
  useEffect(() => audio.onChange(setPlaying), [audio])
  return (
    <button
      type="button"
      onClick={() => void audio.toggle()}
      aria-pressed={playing}
      aria-label={playing ? `Jeda musik (${wedding.audio.title})` : `Putar musik (${wedding.audio.title})`}
      title={wedding.audio.credit}
      className="group relative grid h-11 w-11 place-items-center rounded-full border border-champagne/70 bg-deep/70 text-ivory shadow-lg backdrop-blur-md transition-colors hover:bg-deep"
    >
      {playing ? <Pause size={17} aria-hidden="true" /> : <Music size={17} aria-hidden="true" />}
      {playing && <span className="absolute inset-0 animate-ping rounded-full border border-champagne/40 [animation-duration:2.4s]" aria-hidden="true" />}
    </button>
  )
}
