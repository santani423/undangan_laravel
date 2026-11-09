import { useSyncExternalStore } from 'react';
import { detectQualityTier, isWebGLAvailable, prefs, type QualityTier } from './device';
import { resetSceneFx } from './sceneFx';

export type SceneStatus = 'loading' | 'ready' | 'failed' | 'disabled';

export interface AppState {
    /** Cover dismissed and content unlocked. */
    opened: boolean;
    /** Opening animation is running. */
    opening: boolean;
    /** Index into the visible scene list (see lib/scenes.ts). */
    activeSection: number;
    sceneStatus: SceneStatus;
    /** 0–100, photo texture loading progress reported by the scene. */
    loadProgress: number;
    quality: QualityTier;
    /** Post-processing (bloom); switched off automatically when the frame rate drops. */
    effects: boolean;
    lightboxIndex: number | null;
    /** Story chapter currently in the reading area — highlights its floating 3D frame. */
    activeStory: number;
    /** Wishes on the list — one glowing tag each on the 3D wishing tree. */
    wishCount: number;
    /** Bumped after an RSVP with a message, so the guestbook reloads. */
    wishesVersion: number;
    musicOn: boolean;
    toast: { id: number; text: string } | null;
}

const LITE_KEY = 'wt15-lite-mode';

/* Low-frequency UI state with a tiny external store (the theme's zustand replacement). */
let state: AppState = {
    opened: false,
    opening: false,
    activeSection: 0,
    sceneStatus: 'disabled',
    loadProgress: 0,
    quality: 'medium',
    effects: false,
    lightboxIndex: null,
    activeStory: 0,
    wishCount: 0,
    wishesVersion: 0,
    musicOn: false,
    toast: null,
};
const listeners = new Set<() => void>();

export function getApp(): AppState {
    return state;
}

export function setApp(patch: Partial<AppState>) {
    let changed = false;
    for (const k in patch) {
        if (!Object.is(patch[k as keyof AppState], state[k as keyof AppState])) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
}

export function useApp<T>(select: (s: AppState) => T): T {
    return useSyncExternalStore(
        subscribe,
        () => select(state),
        () => select(state),
    );
}

/** Module state outlives the page (Inertia navigation): start every invitation from the cover. Browser only. */
export function resetApp() {
    resetSceneFx();
    const quality = detectQualityTier();
    setApp({
        opened: false,
        opening: false,
        activeSection: 0,
        sceneStatus: !isWebGLAvailable() ? 'failed' : prefs.get(LITE_KEY) === '1' ? 'disabled' : 'loading',
        loadProgress: 0,
        quality,
        effects: quality === 'high',
        lightboxIndex: null,
        activeStory: 0,
        wishCount: 0,
        wishesVersion: 0,
        musicOn: false,
        toast: null,
    });
}

export function setLiteMode(lite: boolean) {
    prefs.set(LITE_KEY, lite ? '1' : null);
    setApp({ sceneStatus: lite ? 'disabled' : isWebGLAvailable() ? 'loading' : 'failed', loadProgress: 0 });
}

export function showToast(text: string) {
    setApp({ toast: { id: Date.now(), text } });
}

export const isSceneActive = (s: SceneStatus) => s === 'loading' || s === 'ready';
