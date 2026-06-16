import { useEffect, useRef, useState } from 'react';

interface MusicPlayerProps {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    buttonStyle?: React.CSSProperties;
    buttonClassName?: string;
}

export default function MusicPlayer({ url, autoplay = false, loop = true, buttonStyle, buttonClassName = '' }: MusicPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.35);

    useEffect(() => {
        if (!url) return;
        const audio = new Audio(url);
        audio.loop = loop;
        audio.volume = volume;
        audioRef.current = audio;

        if (autoplay) {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        }

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [url]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.loop = loop;
    }, [loop]);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        }
    };

    if (!url) return null;

    return (
        <button
            onClick={toggle}
            className={buttonClassName}
            title={playing ? 'Pause musik' : 'Play musik'}
            style={{
                position: 'fixed',
                bottom: '25px',
                right: '80px',
                zIndex: 998,
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                border: 'none',
                ...buttonStyle,
            }}
        >
            {playing ? '⏸' : '▶'}
        </button>
    );
}
