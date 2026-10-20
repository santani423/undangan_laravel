import type { CameraShot, Vec3 } from './types';

/**
 * The single continuous camera route. Shots are contiguous: each one starts exactly where the
 * previous one ended, so the camera never jumps. Holds are slow drifts where a panel is readable;
 * travels carry the visitor between places. Every travel eases in and out of its holds.
 */
export const CAMERA_SHOTS: CameraShot[] = [
    // 1 · Regol — establishing shot, slow approach towards the gate
    {
        kind: 'hold',
        at: [0, 0.04],
        positions: [
            [0, 2.0, 24],
            [0, 1.9, 19.5],
        ],
        targets: [
            [0, 3.1, 0],
            [0, 2.9, 0],
        ],
    },
    // through the opening doors into the pendhapa
    {
        kind: 'travel',
        at: [0.04, 0.118],
        positions: [
            [0, 1.9, 19.5],
            [0, 1.78, 7],
            [0, 1.72, 0],
            [0, 1.85, -7],
            [0, 2.15, -14],
            [0, 2.28, -18.8],
        ],
        targets: [
            [0, 2.9, 0],
            [0, 2.5, -8],
            [0, 2.3, -16],
            [0, 2.3, -24],
            [0, 2.35, -30],
            [0, 2.4, -31],
        ],
    },
    // 2 · Pendhapa — settle in front of the carved gebyok
    {
        kind: 'hold',
        at: [0.118, 0.212],
        positions: [
            [0, 2.28, -18.8],
            [0.35, 2.32, -20.4],
        ],
        targets: [
            [0, 2.4, -31],
            [0.2, 2.55, -31],
        ],
    },
    // turn east, pass between the pillars and step down into the garden
    {
        kind: 'travel',
        at: [0.212, 0.276],
        positions: [
            [0.35, 2.32, -20.4],
            [4, 2.32, -20.4],
            [8.6, 2.0, -21.2],
            [13.2, 1.75, -24.3],
            [17, 1.6, -27.4],
        ],
        targets: [
            [0.2, 2.55, -31],
            [12, 2.3, -24],
            [22, 1.8, -31],
            [28, 1.4, -36],
            [30, 1.25, -38.5],
        ],
    },
    // 3 · Taman — living garden, wind in the grass
    {
        kind: 'hold',
        at: [0.276, 0.364],
        positions: [
            [17, 1.6, -27.4],
            [19, 1.5, -29.6],
        ],
        targets: [
            [30, 1.25, -38.5],
            [31, 1.1, -40.5],
        ],
    },
    // along the garden path towards the wedding pavilion
    {
        kind: 'travel',
        at: [0.364, 0.41],
        positions: [
            [19, 1.5, -29.6],
            [24, 1.65, -38.5],
            [29, 1.95, -47.5],
            [32, 2.1, -52.5],
        ],
        targets: [
            [31, 1.1, -40.5],
            [31.5, 1.8, -56],
            [32, 2.2, -66],
            [32, 2.3, -69],
        ],
    },
    // 4 · Pawiwahan — the pelaminan
    {
        kind: 'hold',
        at: [0.41, 0.514],
        positions: [
            [32, 2.1, -52.5],
            [32, 2.05, -55],
        ],
        targets: [
            [32, 2.3, -69],
            [32, 2.25, -69.5],
        ],
    },
    // swing west into the gallery corridor
    {
        kind: 'travel',
        at: [0.514, 0.546],
        positions: [
            [32, 2.05, -55],
            [27.5, 2.0, -58.2],
            [22.5, 1.85, -61.6],
            [17, 1.75, -62.5],
        ],
        targets: [
            [32, 2.25, -69.5],
            [22, 2.0, -66],
            [12, 1.85, -65],
            [8, 1.8, -65.2],
        ],
    },
    // 5 · Pringgitan — slow walk past the photo frames
    {
        kind: 'hold',
        at: [0.546, 0.624],
        positions: [
            [17, 1.75, -62.5],
            [2.5, 1.75, -62.3],
        ],
        targets: [
            [8, 1.8, -65.2],
            [-7, 1.8, -65.2],
        ],
    },
    // to the manuscript room at the end of the corridor
    {
        kind: 'travel',
        at: [0.624, 0.65],
        positions: [
            [2.5, 1.75, -62.3],
            [-6, 1.8, -62.8],
            [-10.8, 1.85, -63],
        ],
        targets: [
            [-7, 1.8, -65.2],
            [-18, 1.85, -63.4],
            [-21, 1.85, -63],
        ],
    },
    // 6 · Serat Katresnan
    {
        kind: 'hold',
        at: [0.65, 0.715],
        positions: [
            [-10.8, 1.85, -63],
            [-12.6, 1.85, -62.8],
        ],
        targets: [
            [-21, 1.85, -63],
            [-21.5, 1.8, -63.2],
        ],
    },
    // turn north towards the guest reception
    {
        kind: 'travel',
        at: [0.715, 0.748],
        positions: [
            [-12.6, 1.85, -62.8],
            [-10.5, 1.9, -61.4],
            [-10.9, 1.95, -58.4],
            [-13.6, 1.95, -55.6],
            [-16.6, 1.95, -53.2],
            [-18.2, 1.95, -51.4],
        ],
        targets: [
            [-21.5, 1.8, -63.2],
            [-15, 1.75, -58],
            [-17, 1.6, -52],
            [-19, 1.4, -48],
            [-19, 1.1, -45.5],
            [-19, 1.05, -45],
        ],
    },
    // 7 · Among Tamu
    {
        kind: 'hold',
        at: [0.748, 0.842],
        positions: [
            [-18.2, 1.95, -51.4],
            [-18.7, 1.9, -50.5],
        ],
        targets: [
            [-19, 1.05, -45],
            [-19.1, 1.0, -45.2],
        ],
    },
    // around the reception pavilion to the gift table
    {
        kind: 'travel',
        at: [0.842, 0.872],
        positions: [
            [-18.7, 1.9, -50.5],
            [-15.3, 1.95, -50.4],
            [-13.3, 1.95, -46.4],
            [-13.6, 1.85, -40.4],
            [-16.6, 1.8, -36.6],
        ],
        targets: [
            [-19.1, 1.0, -45.2],
            [-15, 1.5, -44],
            [-14.5, 1.4, -37],
            [-19.5, 1.0, -32],
            [-20.5, 0.95, -31],
        ],
    },
    // 8 · Tanda Katresnan
    {
        kind: 'hold',
        at: [0.872, 0.93],
        positions: [
            [-16.6, 1.8, -36.6],
            [-17.1, 1.75, -35.7],
        ],
        targets: [
            [-20.5, 0.95, -31],
            [-20.5, 0.95, -30.8],
        ],
    },
    // rise and pull back for the twilight overview
    {
        kind: 'travel',
        at: [0.93, 0.976],
        positions: [
            [-17.1, 1.75, -35.7],
            [-20.5, 2.6, -28],
            [-25, 4.4, -15],
            [-27, 5.6, -4],
        ],
        targets: [
            [-20.5, 0.95, -30.8],
            [-12, 2.4, -27],
            [-2, 3.2, -25],
            [1, 3.5, -26],
        ],
    },
    // 9 · Panutup
    {
        kind: 'hold',
        at: [0.976, 1],
        positions: [
            [-27, 5.6, -4],
            [-27.6, 6.0, -2.4],
        ],
        targets: [
            [1, 3.5, -26],
            [1.5, 3.7, -26.5],
        ],
    },
];

/** Offset applied while the cover is shown (camera pulled back & raised), eased away on "Buka Undangan". */
export const INTRO_OFFSET: { position: Vec3; target: Vec3 } = {
    position: [0, 1.4, 9],
    target: [0, 0.8, 0],
};
