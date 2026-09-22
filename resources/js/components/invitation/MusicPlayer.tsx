import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface MusicPlayerProps {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    triggerPlay?: boolean;
    buttonStyle?: React.CSSProperties;
    buttonClassName?: string;
}

export interface MusicPlayerHandle {
    play: () => void;
    pause: () => void;
}

const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer(
    { url, autoplay = false, loop = true, triggerPlay = false, buttonStyle, buttonClassName = '' },
    ref,
) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);
    const [volume] = useState(0.35);

    useEffect(() => {
        if (!url) return;
        const audio = new Audio(url);
        audio.loop = loop;
        audio.volume = volume;
        audioRef.current = audio;
        setPlaying(false);

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [url]);

    // Exposes an imperative play() so callers can start playback synchronously
    // from within a real click handler (e.g. the "Buka Undangan" button),
    // which browsers require for autoplay to be allowed.
    useImperativeHandle(ref, () => ({
        play: () => {
            audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        },
        pause: () => {
            audioRef.current?.pause();
            setPlaying(false);
        },
    }));

    useEffect(() => {
        if (!triggerPlay || !autoplay || !audioRef.current) return;
        const audio = audioRef.current;

        const resume = () => {
            audio.play().then(() => setPlaying(true)).catch(() => {});
        };

        audio.play().then(() => setPlaying(true)).catch(() => {
            // Browser blocked the deferred autoplay call (common on mobile); resume on the next tap.
            document.addEventListener('click', resume, { once: true });
            document.addEventListener('touchstart', resume, { once: true });
        });

        return () => {
            document.removeEventListener('click', resume);
            document.removeEventListener('touchstart', resume);
        };
    }, [triggerPlay, autoplay]);

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
            className={`${buttonClassName}${playing ? ' playing' : ''}`.trim()}
            title={playing ? 'Pause musik' : 'Putar musik'}
            aria-pressed={playing}
            type="button"
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
});

export default MusicPlayer;
