import { useEffect, useRef, useState } from 'react';

interface MusicPlayerProps {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    triggerPlay?: boolean;
    buttonStyle?: React.CSSProperties;
    buttonClassName?: string;
}

export default function MusicPlayer({ url, autoplay = false, loop = true, triggerPlay = false, buttonStyle, buttonClassName = '' }: MusicPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume] = useState(0.35);

    useEffect(() => {
        if (!url) return;
        const audio = new Audio(url);
        audio.loop = loop;
        audio.volume = volume;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [url]);

    // Autoplay dipicu saat triggerPlay menjadi true (setelah user gesture)
    useEffect(() => {
        if (!triggerPlay || !autoplay || !audioRef.current) return;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }, [triggerPlay]);

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
