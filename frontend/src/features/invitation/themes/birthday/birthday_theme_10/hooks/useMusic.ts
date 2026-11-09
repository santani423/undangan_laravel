import { useEffect, useRef } from 'react';
import { music, playSfx, type SfxName } from '../audio/audioEngine';
import { experienceStore, setExperience, useExperience } from '../store/experience';
import { usePageVisibility } from './usePageVisibility';

/** Keeps playback in sync with the sound toggle and pauses while the tab is hidden. */
export function useMusic(onUnavailable?: () => void) {
    const soundOn = useExperience((s) => s.soundOn);
    const visible = usePageVisibility();
    const unavailableRef = useRef(onUnavailable);
    unavailableRef.current = onUnavailable;

    useEffect(() => {
        let cancelled = false;
        if (soundOn && visible) {
            void music.play().then((ok) => {
                if (!ok && !cancelled) {
                    setExperience({ soundOn: false });
                    unavailableRef.current?.();
                }
            });
        } else {
            music.pause();
        }
        return () => {
            cancelled = true;
        };
    }, [soundOn, visible]);

    useEffect(() => () => music.pause(), []);
}

/** Plays an interaction sound only when the guest has sound switched on. */
export function sfx(name: SfxName) {
    if (experienceStore.getState().soundOn) playSfx(name);
}
