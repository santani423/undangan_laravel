import { useTheme } from '../lib/context';
import { setLiteMode, useApp } from '../lib/store';
import { IconLeaf, IconMusic, IconMusicOff } from './Icons';
import { Monogram } from './Monogram';

export function TopBar() {
    const { wedding, music } = useTheme();
    const musicOn = useApp((s) => s.musicOn);
    const status = useApp((s) => s.sceneStatus);
    const lite = status === 'disabled';
    const webglMissing = status === 'failed';

    return (
        <header className="wt15-topbar">
            <a href="#home" className="wt15-topbar__brand" aria-label={`${wedding.couple.displayNames} — kembali ke awal`}>
                <Monogram size={40} />
            </a>
            <div className="wt15-topbar__actions">
                {!webglMissing && (
                    <button
                        type="button"
                        className="wt15-icon-btn"
                        aria-pressed={lite}
                        onClick={() => setLiteMode(!lite)}
                        title={lite ? 'Nyalakan hutan 3D' : 'Mode ringan (tanpa 3D, hemat baterai)'}
                    >
                        <IconLeaf />
                        <span className="wt15-sr-only">Mode ringan tanpa 3D</span>
                    </button>
                )}
                {music && (
                    <button
                        type="button"
                        className={`wt15-icon-btn ${musicOn ? 'is-on' : ''}`}
                        aria-pressed={musicOn}
                        onClick={() => void music.set(!musicOn)}
                        title={musicOn ? 'Matikan musik' : 'Putar musik'}
                    >
                        {musicOn ? <IconMusic /> : <IconMusicOff />}
                        <span className="wt15-sr-only">Musik latar</span>
                        {musicOn && (
                            <span className="wt15-icon-btn__eq" aria-hidden="true">
                                <i />
                                <i />
                                <i />
                            </span>
                        )}
                    </button>
                )}
            </div>
        </header>
    );
}
