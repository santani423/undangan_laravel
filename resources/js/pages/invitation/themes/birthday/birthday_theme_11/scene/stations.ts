import { SECTIONS } from '../lib/sections';
import type { SectionKey } from '../lib/types';

/*
 * World layout. One station per scroll section, in the order of lib/sections.ts.
 * The island is centred on the origin (radius ≈ 46); stations sit along a winding path.
 *
 *  pose / exit  camera position + look-at target when the section arrives / just before it leaves
 *  fit          world-space size of the subject that must stay in frame (used on narrow screens)
 *  side         where the HTML panel sits on wide screens, so the subject is framed on the other side
 *  mascot       where Dr. Senyum stands: [x, y, z] in world space, or { r, f } = units to the right of /
 *               further away from the station camera (keeps characters beside the subject, never in front)
 *  friend       where this station's tooth friend waits before the finale (same format)
 */

export type Vec3 = [number, number, number];
export type Spot = Vec3 | { r: number; f: number } | null;

export interface Mood {
    skyTop: string;
    skyBottom: string;
    fog: string;
    sun: string;
    sunIntensity: number;
    hemi: number;
}

export interface Pose {
    position: Vec3;
    target: Vec3;
}

export interface Station {
    index: number;
    key: SectionKey;
    anchor: Vec3;
    pose: Pose;
    exit: Pose;
    fit: { width: number; height: number };
    side: 'left' | 'right' | 'bottom';
    mood: Mood;
    mascot: Spot;
    friend: Spot;
}

type Layout = Omit<Station, 'index' | 'key' | 'side'>;

const STATION_LAYOUT: Record<SectionKey, Layout> = {
    hero: {
        anchor: [0, 0, 36],
        pose: { position: [0, 7.2, 63], target: [0, 7.4, 36] },
        exit: { position: [-3, 8.4, 60], target: [-0.8, 7, 35] },
        fit: { width: 22, height: 17 },
        mood: { skyTop: '#8fd3f0', skyBottom: '#fff3e6', fog: '#e8f6fb', sun: '#fff1dc', sunIntensity: 2.4, hemi: 1.15 },
        mascot: { r: 0, f: -5.2 },
        friend: null,
    },
    invitation: {
        anchor: [-20, 5.6, 27],
        pose: { position: [-27.6, 8, 38.6], target: [-20, 7.2, 27] },
        exit: { position: [-25.2, 8.6, 40], target: [-19.6, 7.3, 27] },
        fit: { width: 15, height: 12 },
        mood: { skyTop: '#a3c4f5', skyBottom: '#fbeaff', fog: '#efe9fb', sun: '#fff0f6', sunIntensity: 2.3, hemi: 1.15 },
        mascot: { r: 5, f: -0.8 },
        friend: { r: -5.2, f: 0.2 },
    },
    details: {
        anchor: [-31, 4.4, 1],
        pose: { position: [-46, 6.6, 1.6], target: [-31, 4.6, 1] },
        exit: { position: [-45.4, 7.2, -1.6], target: [-31, 4.6, 0.6] },
        fit: { width: 15, height: 9.5 },
        mood: { skyTop: '#93d8f2', skyBottom: '#f3fbff', fog: '#e6f6fb', sun: '#fff6e6', sunIntensity: 2.4, hemi: 1.15 },
        mascot: { r: -5.8, f: 0.2 },
        friend: { r: 3.4, f: -2.4 },
    },
    activities: {
        anchor: [-21, 0, -22],
        pose: { position: [-33.4, 7.4, -34.6], target: [-21, 1.8, -22] },
        exit: { position: [-35.2, 7.2, -31.6], target: [-21.4, 1.8, -22] },
        fit: { width: 19.5, height: 7 },
        mood: { skyTop: '#94dbe8', skyBottom: '#f0fff4', fog: '#e4f7ef', sun: '#fffbe6', sunIntensity: 2.4, hemi: 1.2 },
        mascot: { r: -9.1, f: 0.4 },
        friend: { r: 9.1, f: 0.2 },
    },
    gallery: {
        anchor: [4, 0, -32],
        pose: { position: [5.6, 6, -48.5], target: [4, 4.3, -32] },
        exit: { position: [2, 6.4, -48.2], target: [3.6, 4.3, -32] },
        fit: { width: 19.5, height: 8 },
        mood: { skyTop: '#a2d3f0', skyBottom: '#fff4e0', fog: '#f6f1e6', sun: '#ffeccc', sunIntensity: 2.4, hemi: 1.15 },
        mascot: { r: -9.2, f: -0.8 },
        friend: { r: 9.2, f: -1 },
    },
    cake: {
        anchor: [27, 0, -13],
        pose: { position: [38.6, 7, -18.4], target: [27, 3.6, -13] },
        exit: { position: [37.6, 7.6, -7.6], target: [27, 3.5, -12.6] },
        fit: { width: 13, height: 8 },
        mood: { skyTop: '#f2b3cf', skyBottom: '#ffe1b8', fog: '#fbe6dc', sun: '#ffd9a8', sunIntensity: 1.9, hemi: 0.95 },
        mascot: { r: -5.2, f: 0.4 },
        friend: { r: 4.8, f: -0.2 },
    },
    rsvp: {
        anchor: [28, 0, 14],
        pose: { position: [40.6, 5.8, 20.6], target: [28, 3.2, 14] },
        exit: { position: [41.6, 6.2, 17], target: [28, 3.2, 13.6] },
        fit: { width: 15, height: 7.5 },
        mood: { skyTop: '#adbff3', skyBottom: '#ffe5f0', fog: '#f2e9f6', sun: '#fff0e6', sunIntensity: 2.2, hemi: 1.1 },
        mascot: { r: -5.4, f: -0.2 },
        friend: { r: 6, f: -0.8 },
    },
    finale: {
        anchor: [0, 0, 2],
        pose: { position: [0, 30, 62], target: [0, 2, 0] },
        exit: { position: [4, 11, 23], target: [0, 1.8, 3] },
        fit: { width: 18, height: 12 },
        mood: { skyTop: '#5f63b4', skyBottom: '#ffb3c7', fog: '#d9c6e6', sun: '#ffd6e6', sunIntensity: 1.6, hemi: 0.85 },
        mascot: [0, 0, 7.2],
        friend: null,
    },
};

export const STATIONS: Station[] = SECTIONS.map((section, index) => ({
    index,
    key: section.key,
    side: section.side,
    ...STATION_LAYOUT[section.key],
}));
