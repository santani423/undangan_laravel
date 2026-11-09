/**
 * Layout of the single connected Toy World island (world units ≈ metres at toy
 * scale; ground plane is y = 0, the journey heads towards -Z).
 *
 * Everything that has to agree — camera waypoints, road, destinations, decor
 * placement and grass exclusion zones — is defined here so the camera path can
 * be validated against obstacles (see components/scene/lib/validateLayout.ts).
 */
export type Vec3 = [number, number, number];
/** [x, z] on the ground plane. */
export type Vec2 = [number, number];

export const facing = (from: Vec2, to: Vec2) => Math.atan2(to[0] - from[0], to[1] - from[1]);

/* ------------------------------------------------------------------ camera */

export interface CameraKey {
    pos: Vec3;
    look: Vec3;
    /** Index into CAMERA_STOPS when this key is a section destination. */
    stop?: number;
}

/** Control points for the camera CatmullRom curves (position + look target). */
export const CAMERA_KEYS: CameraKey[] = [
    { pos: [0, 3.1, 12.5], look: [0, 2.7, 0], stop: 0 }, // entrance gate
    { pos: [0, 3.2, -1.6], look: [-3.6, 2.0, -11] }, // through the gate
    { pos: [-4.7, 3.3, -9.1], look: [-10, 1.9, -17], stop: 1 }, // block stage
    { pos: [-1.0, 3.6, -16.8], look: [5, 2.2, -27] },
    { pos: [3.2, 3.6, -22.6], look: [10, 2.0, -31], stop: 2 }, // party garden
    { pos: [1.4, 3.4, -31], look: [-5, 2.0, -42] },
    { pos: [-3.3, 3.1, -39.3], look: [-10, 1.9, -47], stop: 3 }, // photo carousel
    { pos: [-1.8, 3.2, -50], look: [0, 2.0, -62] },
    { pos: [1.0, 2.8, -61.6], look: [-1.4, 1.5, -70], stop: 4 }, // mailbox (RSVP)
    { pos: [4.3, 3.4, -63.3], look: [3, 2.0, -73], stop: 5 }, // giant gift
    { pos: [3.0, 8.8, -55.2], look: [3, 1.3, -72.5], stop: 6 }, // finale overview
];

/** Establishing shot shown behind the cover before the invitation is opened. */
export const INTRO_CAMERA = { pos: [9, 15, 32] as Vec3, look: [0, 0.5, -16] as Vec3 };

/* ------------------------------------------------------------ destinations */

export const DESTINATIONS = {
    entrance: { center: [0, 0] as Vec2, rotation: 0 },
    profile: { center: [-10, -17] as Vec2, rotation: facing([-10, -17], [-4.7, -9.1]) },
    party: { center: [10, -31] as Vec2, rotation: facing([10, -31], [3.2, -22.6]) },
    gallery: { center: [-10, -47] as Vec2, rotation: facing([-10, -47], [-3.3, -39.3]) },
    plaza: { center: [3, -73] as Vec2, rotation: 0 },
} as const;

export type DestinationId = keyof typeof DESTINATIONS;

/** Local positions inside the plaza group (plaza faces +Z towards the road). */
export const PLAZA = {
    radius: 8.5,
    gift: [0, 0, 0] as Vec3,
    mailbox: [-4.4, 0, 3.0] as Vec3,
    carousel: [-6.2, 0, -3.6] as Vec3,
    /** Balloon arch behind the gift: a backdrop that never blocks the camera. */
    arch: [0, 0, -5.6] as Vec3,
};

/** World-space origins for celebration confetti bursts. */
export const CELEBRATION_SPOTS = {
    gate: [0, 3.6, 0.6],
    stage: [-10, 3.2, -17],
    cake: [10, 3.4, -31],
    gallery: [-10, 2.8, -47],
    mailbox: [-1.4, 2.4, -70],
    gift: [3, 3.2, -73],
    plaza: [3, 5.5, -67],
} satisfies Record<string, Vec3>;

export type CelebrationSpot = keyof typeof CELEBRATION_SPOTS;

/* -------------------------------------------------------------- terrain */

/** Island outline (closed, smoothed with a CatmullRom curve). */
export const ISLAND_OUTLINE: Vec2[] = [
    [-8, 24],
    [8, 25.5],
    [21, 19.5],
    [29.5, 6],
    [31, -14],
    [30.5, -36],
    [28.5, -56],
    [21.5, -75],
    [10, -87],
    [-4, -89],
    [-15.5, -81],
    [-20.5, -64],
    [-21.5, -46],
    [-20.5, -28],
    [-18.5, -10],
    [-15.5, 8],
];

/** Closed ring road. Cars loop it; the camera journey follows its west half. */
export const ROAD_LOOP: Vec2[] = [
    [0, 16],
    [0, 5],
    [-0.1, -3],
    [-1.5, -10],
    [-2.6, -16],
    [-0.2, -23],
    [2.6, -30],
    [0.6, -38],
    [-2.2, -46],
    [-1.4, -53],
    [3, -58.4],
    [11, -61],
    [18.5, -55],
    [22, -42],
    [22.5, -28],
    [21, -14],
    [16.5, -1],
    [10.5, 10],
    [4.5, 16.5],
];
export const ROAD_WIDTH = 2.8;

/* ----------------------------------------------------------------- decor */

export type HouseVariant = 'coral' | 'lavender' | 'mint' | 'sky' | 'butter';
export interface HousePlacement {
    pos: Vec2;
    rotation: number;
    variant: HouseVariant;
    scale?: number;
}

export const HOUSES: HousePlacement[] = [
    { pos: [-7.6, -3.4], rotation: Math.PI / 2, variant: 'coral' },
    { pos: [7.2, -4.2], rotation: -Math.PI / 2, variant: 'sky', scale: 0.95 },
    { pos: [-8.2, 7.2], rotation: Math.PI / 2 - 0.35, variant: 'mint', scale: 0.9 },
    { pos: [8.2, 9.2], rotation: -Math.PI / 2 + 0.3, variant: 'lavender' },
    { pos: [12.6, -14.8], rotation: -Math.PI / 2, variant: 'butter', scale: 0.95 },
    { pos: [-13.4, -31.5], rotation: Math.PI / 2, variant: 'sky', scale: 1.05 },
    { pos: [14.2, -44], rotation: -Math.PI / 2, variant: 'coral', scale: 0.95 },
    { pos: [15.6, -67.5], rotation: -Math.PI / 2 - 0.6, variant: 'mint' },
    { pos: [-10.5, -66], rotation: Math.PI / 2 + 0.3, variant: 'lavender', scale: 0.95 },
];

export type TreeKind = 'round' | 'cone' | 'blossom';
export interface TreePlacement {
    pos: Vec2;
    kind: TreeKind;
    scale: number;
}

export const TREES: TreePlacement[] = [
    // entrance framing
    { pos: [-4.6, 6.2], kind: 'round', scale: 1.1 },
    { pos: [4.7, 5.4], kind: 'blossom', scale: 1.0 },
    { pos: [-4.6, -2.6], kind: 'cone', scale: 1.15 },
    { pos: [4.6, -1.4], kind: 'round', scale: 1.0 },
    { pos: [-11.5, 2.5], kind: 'cone', scale: 1.25 },
    { pos: [-10.5, 14.5], kind: 'cone', scale: 1.2 },
    { pos: [13.5, 17], kind: 'round', scale: 1.2 },
    { pos: [12.5, 3], kind: 'blossom', scale: 1.05 },
    // block stage
    { pos: [-14.4, -20.5], kind: 'round', scale: 1.3 },
    { pos: [-14, -12.6], kind: 'cone', scale: 1.2 },
    { pos: [-6.4, -22.2], kind: 'blossom', scale: 1.0 },
    // party garden
    { pos: [14.8, -34.5], kind: 'round', scale: 1.3 },
    { pos: [13.6, -25.4], kind: 'blossom', scale: 1.1 },
    { pos: [7.4, -37.2], kind: 'cone', scale: 1.1 },
    // between destinations
    { pos: [-6.6, -27.5], kind: 'round', scale: 1.2 },
    { pos: [-8.6, -37.5], kind: 'cone', scale: 1.3 },
    { pos: [6.8, -44], kind: 'round', scale: 1.1 },
    { pos: [7.8, -51], kind: 'blossom', scale: 1.0 },
    // photo carousel garden
    { pos: [-15.2, -50.5], kind: 'round', scale: 1.3 },
    { pos: [-14.6, -42.6], kind: 'cone', scale: 1.2 },
    { pos: [-12.8, -54.2], kind: 'blossom', scale: 1.1 },
    { pos: [-6.4, -54.4], kind: 'round', scale: 1.0 },
    // plaza
    { pos: [-4.8, -80], kind: 'round', scale: 1.2 },
    { pos: [13.2, -81], kind: 'cone', scale: 1.2 },
    { pos: [14.4, -74.5], kind: 'blossom', scale: 1.05 },
    { pos: [-7.2, -73.5], kind: 'cone', scale: 1.1 },
    // east loop + island rim
    { pos: [26, -20], kind: 'cone', scale: 1.3 },
    { pos: [26.5, -35], kind: 'round', scale: 1.4 },
    { pos: [25.5, -50], kind: 'cone', scale: 1.2 },
    { pos: [24.5, 2], kind: 'round', scale: 1.3 },
    { pos: [17, -30], kind: 'round', scale: 1.15 },
    { pos: [-17, -5], kind: 'round', scale: 1.3 },
    { pos: [-17.6, -38], kind: 'cone', scale: 1.3 },
    { pos: [-17, -58], kind: 'round', scale: 1.2 },
];

export interface FlowerBed {
    center: Vec2;
    radius: number;
    count: number;
}

export const FLOWER_BEDS: FlowerBed[] = [
    { center: [-3.6, 3.2], radius: 1.0, count: 26 },
    { center: [3.6, 3.0], radius: 1.0, count: 26 },
    { center: [-6.2, 4.4], radius: 0.9, count: 18 },
    { center: [6.0, 2.6], radius: 0.9, count: 18 },
    { center: [-6.6, -12.8], radius: 1.2, count: 28 },
    { center: [-13, -15.5], radius: 1.0, count: 20 },
    { center: [6.4, -26.6], radius: 1.1, count: 24 },
    { center: [14.2, -30], radius: 1.0, count: 20 },
    { center: [-6.0, -43.4], radius: 1.4, count: 34 },
    { center: [-6.6, -49.8], radius: 1.2, count: 28 },
    { center: [-12.2, -41.6], radius: 1.0, count: 22 },
    { center: [-3.4, -66.5], radius: 1.1, count: 24 },
    { center: [9.6, -66.4], radius: 1.1, count: 24 },
    { center: [-5, -60], radius: 1.0, count: 20 },
    { center: [17, -10], radius: 1.2, count: 24 },
    { center: [9, -18], radius: 1.0, count: 18 },
];

export interface SignpostPlacement {
    pos: Vec2;
    rotation: number;
    label: string;
    illustration: 'house' | 'mascot' | 'cake' | 'car' | 'gift';
}

/** Wayfinding signs sit beside the road at each path entrance, off to the side of the camera's view. */
export const SIGNPOSTS: SignpostPlacement[] = [
    { pos: [-2.9, 3.9], rotation: 0.3, label: 'Kota Mainan', illustration: 'house' },
    { pos: [-4.4, -15.2], rotation: facing([-4.4, -15.2], [-1.5, -9]), label: 'Panggung', illustration: 'mascot' },
    { pos: [4.6, -28.6], rotation: facing([4.6, -28.6], [2.5, -22]), label: 'Pesta', illustration: 'cake' },
    { pos: [-4.3, -44.6], rotation: facing([-4.3, -44.6], [-2, -38]), label: 'Galeri', illustration: 'car' },
    { pos: [-3.4, -63.8], rotation: facing([-3.4, -63.8], [1, -59]), label: 'Plaza Kado', illustration: 'gift' },
];

export const PLAYGROUND = { center: [16.6, -21.5] as Vec2, rotation: -Math.PI / 2 - 0.3 };

/** Circles (x, z, radius) where grass and flowers must not grow. */
export const GROUND_EXCLUSIONS: [number, number, number][] = [
    [0, 0, 3.0],
    ...HOUSES.map((h): [number, number, number] => [h.pos[0], h.pos[1], 2.7 * (h.scale ?? 1)]),
    [DESTINATIONS.profile.center[0], DESTINATIONS.profile.center[1], 5.2],
    [DESTINATIONS.party.center[0], DESTINATIONS.party.center[1], 4.8],
    [DESTINATIONS.gallery.center[0], DESTINATIONS.gallery.center[1], 4.0],
    [DESTINATIONS.plaza.center[0], DESTINATIONS.plaza.center[1], PLAZA.radius + 0.4],
    [PLAYGROUND.center[0], PLAYGROUND.center[1], 3.6],
];

/** Obstacles the camera must never pass through: [x, z, radius, height]. */
export const CAMERA_OBSTACLES: [number, number, number, number][] = [
    [-2.3, 0, 0.6, 5.2], // gate pillars
    [2.3, 0, 0.6, 5.2],
    ...HOUSES.map((h): [number, number, number, number] => [h.pos[0], h.pos[1], 2.2 * (h.scale ?? 1), 4.6 * (h.scale ?? 1)]),
    ...TREES.map((t): [number, number, number, number] => [t.pos[0], t.pos[1], 1.1 * t.scale, 3.4 * t.scale]),
    ...SIGNPOSTS.map((s): [number, number, number, number] => [s.pos[0], s.pos[1], 0.6, 2.4]),
    [DESTINATIONS.profile.center[0], DESTINATIONS.profile.center[1], 4.2, 4.5],
    [DESTINATIONS.party.center[0], DESTINATIONS.party.center[1], 3.6, 4.2],
    [DESTINATIONS.gallery.center[0], DESTINATIONS.gallery.center[1], 3.4, 3.4],
];
