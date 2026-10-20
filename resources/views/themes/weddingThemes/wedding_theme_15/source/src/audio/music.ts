import { wedding } from '../config/wedding'
import { asset } from '../lib/links'
import { useApp } from '../state/store'
import { MusicBox } from './musicBox'

interface Player {
  play(): Promise<void>
  pause(): void
}

class FilePlayer implements Player {
  private el: HTMLAudioElement
  constructor(src: string) {
    this.el = new Audio(asset(src))
    this.el.loop = true
    this.el.preload = 'none'
    this.el.volume = 0.6
  }
  play() {
    return this.el.play()
  }
  pause() {
    this.el.pause()
  }
}

let player: Player | null = null
const getPlayer = () => (player ??= wedding.music.src ? new FilePlayer(wedding.music.src) : new MusicBox())

/** Must be called from a user gesture (click/tap) the first time. */
export async function setMusic(on: boolean) {
  const p = getPlayer()
  try {
    if (on) await p.play()
    else p.pause()
    useApp.getState().setMusicOn(on)
  } catch {
    useApp.getState().setMusicOn(false)
    useApp.getState().showToast('Musik tidak dapat diputar di perangkat ini.')
  }
}

// Pause when the tab is hidden; resume if it was playing.
let resumeOnShow = false
document.addEventListener('visibilitychange', () => {
  const { musicOn } = useApp.getState()
  if (document.hidden && musicOn) {
    resumeOnShow = true
    void setMusic(false)
  } else if (!document.hidden && resumeOnShow) {
    resumeOnShow = false
    void setMusic(true)
  }
})
