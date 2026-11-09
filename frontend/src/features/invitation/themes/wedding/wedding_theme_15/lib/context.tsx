import { createContext, useContext } from 'react';
import type { MusicPlayer } from './music';
import type { RsvpService } from './rsvp';
import type { SceneDef } from './scenes';
import type { WeddingConfig } from './types';

export interface ThemeState {
    wedding: WeddingConfig;
    rsvp: RsvpService;
    /** Null when the invitation's music feature is switched off. */
    music: MusicPlayer | null;
    /** Sections shown for this invitation, in scroll order (the camera path follows them). */
    scenes: SceneDef[];
}

const ThemeContext = createContext<ThemeState | null>(null);

export const ThemeProvider = ThemeContext.Provider;

/** Also works inside the 3D canvas: React Three Fiber bridges context into its renderer. */
export function useTheme(): ThemeState {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme outside WeddingTheme15');
    return ctx;
}

export const useWedding = () => useTheme().wedding;
