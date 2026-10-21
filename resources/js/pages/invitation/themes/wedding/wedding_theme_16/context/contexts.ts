import { createContext } from 'react';
import type { SectionInfo } from '../lib/sections';
import type { InvitationConfig, Person } from '../lib/types';

export interface InvitationValue {
    config: InvitationConfig;
    /** Couple in display order (configurable bride-first / groom-first). */
    first: Person;
    second: Person;
    /** Sections shown for this invitation, in journey order. */
    sections: SectionInfo[];
}

export const InvitationContext = createContext<InvitationValue | null>(null);

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastValue {
    notify: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastValue | null>(null);

export type MusicStatus = 'idle' | 'playing' | 'paused' | 'error';

export interface MusicValue {
    /** False when the invitation switched music off. */
    enabled: boolean;
    status: MusicStatus;
    muted: boolean;
    volume: number;
    source: 'file' | 'synth';
    title: string;
    artist?: string;
    credit?: string;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
}

export const MusicContext = createContext<MusicValue | null>(null);

export type ExperiencePhase = 'cover' | 'opening' | 'open';

export interface ExperienceValue {
    phase: ExperiencePhase;
    reducedMotion: boolean;
}

export const ExperienceContext = createContext<ExperienceValue>({ phase: 'cover', reducedMotion: false });
