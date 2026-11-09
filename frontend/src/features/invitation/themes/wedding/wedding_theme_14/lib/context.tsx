import { createContext, useContext } from 'react';
import type { AmbientAudio } from './audio';
import type { RsvpService } from './rsvp';
import { SCENES } from './scenes';
import type { SceneConfig, SceneId, WeddingConfig } from './types';

export interface ThemeState {
    wedding: WeddingConfig;
    rsvp: RsvpService;
    /** Null when the invitation's music feature is switched off. */
    audio: AmbientAudio | null;
    /** Scenes whose panel/section is shown (the 3D world still travels through every place). */
    scenes: SceneConfig[];
}

const ThemeContext = createContext<ThemeState | null>(null);

export const ThemeProvider = ThemeContext.Provider;

export function useTheme(): ThemeState {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme outside WeddingTheme14');
    return ctx;
}

export const useWedding = () => useTheme().wedding;

/** Scene list filtered by the invitation's enabled sections. */
export function visibleScenes(w: WeddingConfig): SceneConfig[] {
    const s = w.sections;
    const show: Record<SceneId, boolean> = {
        gate: true,
        pendopo: s.couple,
        garden: s.countdown,
        ceremony: s.events,
        gallery: s.gallery || s.video,
        story: s.story,
        rsvp: s.rsvp || s.wishes,
        gift: s.gift,
        closing: true,
    };
    return SCENES.filter((sc) => show[sc.id]);
}
