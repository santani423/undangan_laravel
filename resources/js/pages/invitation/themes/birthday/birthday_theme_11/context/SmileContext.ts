import { createContext, useContext } from 'react';
import type { MusicController } from '../audio/MusicController';
import type { SectionDef } from '../lib/sections';
import type { SectionKey, SmileConfig } from '../lib/types';
import type { World } from '../scene/WorldBuilder';
import type { RsvpService } from '../services/rsvpService';

export interface SmileValue {
    config: SmileConfig;
    /** Sections shown for this invitation, in scroll order. */
    sections: SectionDef[];
    audio: MusicController;
    rsvpService: RsvpService;
    reducedMotion: boolean;
    /** Smooth-scrolls to a section, moves focus to its heading and updates the URL hash. */
    goTo(key: SectionKey): void;
    /** The 3D world, or null while loading / in the illustrated (no-WebGL) version. */
    getWorld(): World | null;
    toast(message: string): void;
    /** Key of the first visible section after `key` (e.g. where "Mulai petualangan" leads). */
    nextAfter(key: SectionKey): SectionKey;
}

export const SmileContext = createContext<SmileValue | null>(null);

export function useSmile(): SmileValue {
    const value = useContext(SmileContext);
    if (!value) throw new Error('useSmile must be used inside <BirthdayTheme11>.');
    return value;
}
