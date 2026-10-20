import type { Vec3 } from './types';

/**
 * World layout in metres (Y up). Visitors arrive from +Z and walk "into" the compound (−Z).
 * Camera shots and scene compositions both reference these anchors so they never drift apart.
 *
 *            +Z  (arrival forecourt)
 *        ┌──────── Regol gate (z = 0) ────────┐
 *        │                                     │
 *   gift ●        ┌─ Pendhapa (0,-24) ─┐        Taman garden (26,-34)
 *        │        └────────────────────┘           pond
 *  reception ●                                      │
 *        │                                     Pawiwahan pavilion (32,-66)
 *   story ●══════ Pringgitan gallery corridor (z=-63) ══════╝
 */
export const WORLD = {
    gate: { position: [0, 0, 0] as Vec3, passageWidth: 3.2, wallReach: 22 },
    pendopo: { position: [0, 0, -24] as Vec3, size: 14, platform: 0.6 },
    garden: { center: [26, 0, -34] as Vec3, pond: [33, 0, -38] as Vec3, pondRadius: 3.6 },
    ceremony: { position: [32, 0, -66] as Vec3, size: 12, platform: 0.5 },
    corridor: { z: -63, xStart: 20, xEnd: -12.5, width: 4.4, floor: 0.3 },
    story: { position: [-17, 0, -63] as Vec3, size: 8.4 },
    reception: { position: [-19, 0, -45.5] as Vec3 },
    gift: { position: [-20.5, 0, -31] as Vec3 },
};

/** Stone path polylines: [points], width */
export const PATHS: { points: [number, number][]; width: number }[] = [
    {
        points: [
            [0, 36],
            [0, 1.5],
        ],
        width: 3.2,
    },
    {
        points: [
            [0, -1.5],
            [0, -16.6],
        ],
        width: 3,
    },
    {
        points: [
            [7.2, -20.4],
            [12.5, -23.5],
            [18.5, -29],
            [23.5, -38],
            [28.5, -47.5],
            [31.5, -58.5],
        ],
        width: 2.2,
    },
    {
        points: [
            [29.5, -58.5],
            [24, -61],
            [20.5, -62.6],
        ],
        width: 2,
    },
    {
        points: [
            [-14.5, -58.6],
            [-16.6, -52],
            [-18.4, -49.6],
        ],
        width: 2,
    },
    {
        points: [
            [-16.8, -41.8],
            [-16.8, -35.5],
            [-18.8, -32.8],
        ],
        width: 2,
    },
    {
        points: [
            [-16.6, -30],
            [-11, -27.2],
            [-7.4, -25],
        ],
        width: 2,
    },
];

/** Axis-aligned rectangles (xMin, xMax, zMin, zMax) where grass must not grow. */
export const NO_GRASS: [number, number, number, number][] = [
    [-8.2, 8.2, -32.2, -15.8], // pendhapa platform
    [-23, 23, -2.4, 2.4], // gate & wall
    [25, 39, -73, -59], // ceremony pavilion
    [-13, 21, -66, -60], // corridor
    [-22, -12, -68, -58], // story room
    [-24, -14.5, -50, -41.5], // reception
    [-24, -17, -34.5, -27.5], // gift area
];
