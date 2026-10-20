import { Music, Pause } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../lib/context';

export function MusicToggle() {
    const { audio, wedding } = useTheme();
    const [playing, setPlaying] = useState(audio?.playing ?? false);
    useEffect(() => audio?.onChange(setPlaying), [audio]);
    if (!audio) return null;
    return (
        <div className="wt14-music">
            <button
                type="button"
                onClick={() => void audio.toggle()}
                aria-pressed={playing}
                aria-label={playing ? `Jeda musik (${wedding.audio.title})` : `Putar musik (${wedding.audio.title})`}
                title={wedding.audio.credit}
                className="wt14-round"
            >
                {playing ? <Pause size={17} aria-hidden="true" /> : <Music size={17} aria-hidden="true" />}
                {playing && <span className="wt14-ping" aria-hidden="true" />}
            </button>
        </div>
    );
}
