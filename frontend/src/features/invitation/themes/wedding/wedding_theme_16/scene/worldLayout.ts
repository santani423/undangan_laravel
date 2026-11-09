/**
 * Static layout of the voxel garden. Pure data + math (no three.js) so it can
 * be shared by the scene, the grass scatterer and the camera-clearance test.
 *
 * The garden is one continuous valley running from the entrance (+z) to the
 * ceremony arch (−z). Each invitation section has a vignette next to the path.
 */

export type ModelName =
    | 'voxel_tree'
    | 'blossom_tree'
    | 'wedding_arch'
    | 'garden_bench'
    | 'garden_lantern'
    | 'flower_arrangement'
    | 'gift_box'
    | 'garden_cottage'
    | 'grass_tile'
    | 'stepping_stones'
    | 'wedding_rings_voxel';

export interface Placement {
    x: number;
    y?: number;
    z: number;
    rotY?: number;
    scale?: number;
}

/** Half extents (x, z) and height of each model at scale 1, from the OBJ files. */
export const MODEL_BOUNDS: Record<ModelName, { hx: number; hz: number; height: number; minY: number }> = {
    voxel_tree: { hx: 0.79, hz: 0.79, height: 2.79, minY: 0 },
    blossom_tree: { hx: 0.57, hz: 0.57, height: 1.88, minY: 0 },
    wedding_arch: { hx: 1.14, hz: 0.14, height: 2.6, minY: 0 },
    garden_bench: { hx: 0.9, hz: 0.3, height: 1.27, minY: 0 },
    garden_lantern: { hx: 0.26, hz: 0.26, height: 0.99, minY: 0 },
    flower_arrangement: { hx: 0.32, hz: 0.32, height: 0.57, minY: 0 },
    gift_box: { hx: 0.5, hz: 0.5, height: 0.98, minY: 0 },
    garden_cottage: { hx: 1.05, hz: 0.9, height: 1.71, minY: 0 },
    grass_tile: { hx: 1, hz: 1, height: 0.38, minY: -0.24 },
    stepping_stones: { hx: 0.95, hz: 0.4, height: 0.08, minY: -0.04 },
    wedding_rings_voxel: { hx: 0.65, hz: 0.09, height: 0.87, minY: 0.13 },
};

// ---------------------------------------------------------------------------
// Deterministic randomness
// ---------------------------------------------------------------------------

export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------------------------------------------------------------------------
// Garden path
// ---------------------------------------------------------------------------

/** Control points (x, z) of the stepping-stone path, entrance → ceremony. */
export const PATH_POINTS: [number, number][] = [
    [0, 38],
    [0, 26],
    [0, 18],
    [-2.5, 8],
    [-1, -2],
    [2.5, -12],
    [2, -22],
    [-1.5, -32],
    [-2.5, -42],
    [0, -51],
    [1.5, -58],
    [0, -64],
    [0, -69],
];

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function samplePath(stepsPerSegment = 40): [number, number][] {
    const pts = PATH_POINTS;
    const out: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        for (let s = 0; s < stepsPerSegment; s++) {
            const t = s / stepsPerSegment;
            out.push([catmullRom(p0[0], p1[0], p2[0], p3[0], t), catmullRom(p0[1], p1[1], p2[1], p3[1], t)]);
        }
    }
    out.push(pts[pts.length - 1]);
    return out;
}

export const PATH_SAMPLES = samplePath();

/** x coordinate of the path centre line at depth z (z decreases along the path). */
export function pathXAt(z: number): number {
    const s = PATH_SAMPLES;
    if (z >= s[0][1]) return s[0][0];
    if (z <= s[s.length - 1][1]) return s[s.length - 1][0];
    let lo = 0;
    let hi = s.length - 1;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (s[mid][1] > z) lo = mid;
        else hi = mid;
    }
    const [x0, z0] = s[lo];
    const [x1, z1] = s[hi];
    const t = z0 === z1 ? 0 : (z - z0) / (z1 - z0);
    return x0 + (x1 - x0) * t;
}

/** Evenly spaced points along the path with the heading angle of the path. */
export function pathStations(spacing: number): { x: number; z: number; angle: number }[] {
    const s = PATH_SAMPLES;
    const stations: { x: number; z: number; angle: number }[] = [];
    let walked = 0;
    let next = spacing / 2;
    for (let i = 1; i < s.length; i++) {
        const [ax, az] = s[i - 1];
        const [bx, bz] = s[i];
        const segment = Math.hypot(bx - ax, bz - az);
        while (next <= walked + segment) {
            const t = (next - walked) / segment;
            stations.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, angle: Math.atan2(bx - ax, bz - az) });
            next += spacing;
        }
        walked += segment;
    }
    return stations;
}

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------

export const TERRAIN = {
    cell: 2,
    minX: -44,
    maxX: 44,
    minZ: -100,
    maxZ: 48,
    /** Half width of the flat garden valley around the path. */
    valleyHalfWidth: 13,
};

export const POND = { minX: -14, maxX: -8, minZ: 8, maxZ: 12, waterY: -0.18, floorY: -0.6 };

export function isInPond(x: number, z: number): boolean {
    return x > POND.minX && x < POND.maxX && z > POND.minZ && z < POND.maxZ;
}

/** Integer terrace height (top surface y) of the terrain at a cell centre. */
export function terrainHeightAt(x: number, z: number): number {
    const dx = Math.abs(x - pathXAt(z));
    const beyondStart = Math.max(0, z - 40);
    const beyondEnd = Math.max(0, -86 - z);
    const d = Math.max(dx - TERRAIN.valleyHalfWidth, 0) + beyondStart * 1.2 + beyondEnd * 1.2;
    if (d <= 0) return 0;
    const wobble = Math.sin(x * 0.37 + z * 0.21) + Math.cos(z * 0.43 - x * 0.17);
    return Math.max(0, Math.min(6, Math.floor(d / 3.2 + wobble * 0.55)));
}

/** Ground height for prop placement (snaps to the cell the point falls in). */
export function groundHeightAt(x: number, z: number): number {
    const c = TERRAIN.cell;
    const cx = Math.floor(x / c) * c + c / 2;
    const cz = Math.floor(z / c) * c + c / 2;
    return terrainHeightAt(cx, cz);
}

// ---------------------------------------------------------------------------
// Hand-placed vignettes (one per invitation section)
// ---------------------------------------------------------------------------

const HALF_PI = Math.PI / 2;

export const ENTRANCE_ARCH: Placement = { x: 0, z: 18, scale: 1.9 };
export const CEREMONY_ARCH: Placement = { x: 0, z: -72, scale: 2.3 };
export const COTTAGE: Placement = { x: 10.2, z: -4.5, rotY: -HALF_PI, scale: 2.6 };
export const RINGS: Placement = { x: 0, y: 6.1, z: -71.6, scale: 2.2 };
export const MAP_PIN = { x: 10.2, y: 7.4, z: -4.5 };

export const WISHING_TREE: Placement = { x: 7, z: -50.5, scale: 3.3 };
export const GUESTBOOK_BENCH: Placement = { x: 4.3, z: -47.4, rotY: -1.07, scale: 1.1 };

export const EASELS: Placement[] = [
    { x: 3.8, z: -31.2 },
    { x: 6.2, z: -34.4 },
    { x: 7.5, z: -38.1 },
].map((p) => ({ ...p, rotY: Math.atan2(-4.2 - p.x, -24 - p.z) }));

export const PALETTE_PILLARS = { startX: -10.2, z: -57, spacing: 1.5 };

export const BLOSSOM_TREES: Placement[] = [
    { x: -6.6, z: 16.5, scale: 2.2 },
    { x: 6.6, z: 16.5, scale: 2.2 },
    { x: -9.4, z: 4.4, scale: 2.3 },
    { x: -13.2, z: 4.6, scale: 2.4 },
    { x: 13.8, z: -0.5, scale: 2.4 },
    { x: -5.6, z: -17.5, scale: 2.1 },
    { x: 11.5, z: -27, scale: 2.2 },
    { x: -12.6, z: -36.5, scale: 2.3 },
    WISHING_TREE,
    { x: -6.8, z: -73.5, scale: 2.6 },
    { x: 6.8, z: -73.5, scale: 2.6 },
    { x: -13.5, z: -63, scale: 2.2 },
];

export const FEATURE_TREES: Placement[] = [
    { x: -9.5, z: 21, scale: 2.3 },
    { x: 9.5, z: 21.5, scale: 2.4 },
    { x: -16.8, z: 2.5, scale: 2.6 },
    { x: -17.2, z: 11.5, scale: 2.4 },
    { x: 15.8, z: -5.5, scale: 2.7 },
    { x: 14.6, z: -10, scale: 2.3 },
    { x: -9, z: -27.5, scale: 2.4 },
    { x: 10.5, z: -40.5, scale: 2.5 },
    { x: -14, z: -42.5, scale: 2.6 },
    { x: 11.8, z: -52.5, scale: 2.4 },
    { x: -12.8, z: -52, scale: 2.4 },
    { x: -10.5, z: -76, scale: 2.8 },
    { x: 10.5, z: -76, scale: 2.8 },
    { x: -3.8, z: -79.5, scale: 3.0 },
    { x: 3.8, z: -79.5, scale: 3.0 },
    { x: 14.5, z: -64.5, scale: 2.5 },
];

export const BENCHES: Placement[] = [
    // Couple vignette, facing the pond.
    { x: -11.3, z: 6.2, scale: 1.15 },
    // Event pavilion, facing the path.
    { x: 6.3, z: -1.2, rotY: -HALF_PI, scale: 1.1 },
    { x: 6.3, z: -8.2, rotY: -HALF_PI, scale: 1.1 },
    // RSVP seating, three rows awaiting guests.
    { x: -9.8, z: -40.5, scale: 1.15 },
    { x: -6.6, z: -40.5, scale: 1.15 },
    { x: -9.8, z: -43, scale: 1.15 },
    { x: -6.6, z: -43, scale: 1.15 },
    { x: -9.8, z: -45.5, scale: 1.15 },
    { x: -6.6, z: -45.5, scale: 1.15 },
    GUESTBOOK_BENCH,
    // Ceremony seating on both sides of the aisle, facing the arch.
    { x: -4.4, z: -62.5, rotY: Math.PI, scale: 1.15 },
    { x: 4.4, z: -62.5, rotY: Math.PI, scale: 1.15 },
    { x: -4.4, z: -66, rotY: Math.PI, scale: 1.15 },
    { x: 4.4, z: -66, rotY: Math.PI, scale: 1.15 },
];

function pathLantern(z: number, side: 1 | -1, offset = 2.3, scale = 1.25): Placement {
    return { x: pathXAt(z) + side * offset, z, scale };
}

export const LANTERNS: Placement[] = [
    // Entrance.
    { x: -2.7, z: 19.8, scale: 1.4 },
    { x: 2.7, z: 19.8, scale: 1.4 },
    pathLantern(31, 1),
    pathLantern(25, -1),
    pathLantern(11, 1),
    pathLantern(3, -1),
    // Couple pond.
    { x: -6.9, z: 12.6, scale: 1.1 },
    // Event pavilion door.
    { x: 7.1, z: -3.4, scale: 1.25 },
    { x: 7.1, z: -7.2, scale: 1.25 },
    // Love-story lantern walk.
    pathLantern(-11, -1),
    pathLantern(-14.5, 1),
    pathLantern(-18, -1),
    pathLantern(-21.5, 1),
    pathLantern(-25, -1),
    pathLantern(-28.5, 1),
    pathLantern(-36, 1),
    // RSVP and guestbook.
    { x: -12, z: -46, scale: 1.1 },
    { x: 4.6, z: -49.2, scale: 0.95 },
    { x: 9.6, z: -49.4, scale: 0.95 },
    { x: 5, z: -52.7, scale: 0.95 },
    { x: 9.2, z: -52.4, scale: 0.95 },
    // Ceremony aisle.
    { x: -2.3, z: -60.5, scale: 1.2 },
    { x: 2.3, z: -60.5, scale: 1.2 },
    { x: -2.3, z: -64.3, scale: 1.2 },
    { x: 2.3, z: -64.3, scale: 1.2 },
    { x: -2.3, z: -68, scale: 1.2 },
    { x: 2.3, z: -68, scale: 1.2 },
];

export const GRASS_TILES: Placement[] = [
    // Planters beside the entrance arch.
    { x: -4.4, z: 18.6, scale: 0.8 },
    { x: 4.4, z: 18.6, scale: 0.8 },
    // Ceremony platform.
    { x: -2, z: -72 },
    { x: 0, z: -72 },
    { x: 2, z: -72 },
    // Dress-code palette plinths.
    ...Array.from({ length: 5 }, (_, i) => ({ x: PALETTE_PILLARS.startX + i * PALETTE_PILLARS.spacing, z: PALETTE_PILLARS.z, scale: 0.7 })),
];

export const FLOWERS: Placement[] = [
    { x: -4.4, y: 0.05, z: 18.6, scale: 1.5 },
    { x: 4.4, y: 0.05, z: 18.6, scale: 1.5 },
    { x: -7.4, z: 6.9, scale: 1.3 },
    { x: -15, z: 7.2, scale: 1.3 },
    { x: 7.4, z: 0.6, scale: 1.3 },
    { x: 7.4, z: -10.1, scale: 1.3 },
    { x: pathXAt(-16) - 1.9, z: -16, scale: 1.0 },
    { x: pathXAt(-23) + 1.9, z: -23, scale: 1.0 },
    { x: pathXAt(-27) - 1.9, z: -27, scale: 1.0 },
    { x: 2.4, z: -33, scale: 1.1 },
    { x: -11.8, z: -40.2, scale: 1.0 },
    { x: -4.9, z: -39.6, scale: 1.0 },
    { x: -2.9, z: -71.4, scale: 1.6 },
    { x: 2.9, z: -71.4, scale: 1.6 },
    { x: -1.5, z: -59.2, scale: 0.9 },
    { x: 1.5, z: -59.2, scale: 0.9 },
    { x: -11.6, z: -56.4, scale: 1.1 },
    { x: -2.8, z: -56.4, scale: 1.1 },
];

export const GIFTS: Placement[] = [
    { x: 9.8, z: -60.8, rotY: 0.3, scale: 1.7 },
    { x: 8.1, z: -59.2, rotY: 0.5, scale: 1.0 },
    { x: 11.4, z: -59.7, rotY: -0.35, scale: 1.15 },
    { x: 11, z: -62.6, rotY: 0.9, scale: 0.9 },
    { x: 8.4, z: -62.3, rotY: -0.6, scale: 0.85 },
];

/** The small gift that floats above the pile. */
export const FLOATING_GIFT: Placement = { x: 9.8, y: 2.25, z: -60.8, rotY: 0.6, scale: 0.72 };

// ---------------------------------------------------------------------------
// Exclusion zones (keep generated trees and grass away from vignettes)
// ---------------------------------------------------------------------------

export interface Circle {
    x: number;
    z: number;
    r: number;
}

export const VIGNETTE_ZONES: Circle[] = [
    { x: 0, z: 18, r: 7 },
    { x: -11, z: 8, r: 6.5 },
    { x: 10.5, z: -4.5, r: 6.5 },
    { x: 6, z: -34.5, r: 5 },
    { x: -8.2, z: -43, r: 5 },
    { x: 7, z: -50.5, r: 5 },
    { x: -7.2, z: -57, r: 5 },
    { x: 9.8, z: -60.8, r: 4.5 },
    { x: 0, z: -68, r: 9 },
];

function footprint(model: ModelName, p: Placement, pad: number): Circle {
    const b = MODEL_BOUNDS[model];
    const s = p.scale ?? 1;
    return { x: p.x, z: p.z, r: Math.max(b.hx, b.hz) * s + pad };
}

/** Footprints where grass blades should not grow. */
export function propFootprints(): Circle[] {
    const trunk = (p: Placement): Circle => ({ x: p.x, z: p.z, r: 0.35 * (p.scale ?? 1) });
    return [
        ...[ENTRANCE_ARCH, CEREMONY_ARCH].map((p) => footprint('wedding_arch', p, 0.2)),
        footprint('garden_cottage', COTTAGE, 0.4),
        ...BENCHES.map((p) => footprint('garden_bench', p, 0.1)),
        ...LANTERNS.map((p) => footprint('garden_lantern', p, 0.05)),
        ...FLOWERS.map((p) => footprint('flower_arrangement', p, 0.05)),
        ...GIFTS.map((p) => footprint('gift_box', p, 0.1)),
        ...GRASS_TILES.map((p) => footprint('grass_tile', p, 0)),
        ...BLOSSOM_TREES.map(trunk),
        ...FEATURE_TREES.map(trunk),
        ...EASELS.map((p) => ({ x: p.x, z: p.z, r: 1.1 })),
    ];
}

export function insideAny(x: number, z: number, circles: Circle[]): boolean {
    for (const c of circles) {
        const dx = x - c.x;
        const dz = z - c.z;
        if (dx * dx + dz * dz < c.r * c.r) return true;
    }
    return false;
}

/** Background trees scattered over the valley edges and terraces. */
export function generatePeripheralTrees(count: number, seed = 20270320): (Placement & { model: 'voxel_tree' | 'blossom_tree' })[] {
    const rand = mulberry32(seed);
    const trees: (Placement & { model: 'voxel_tree' | 'blossom_tree' })[] = [];
    const blocked: Circle[] = [...VIGNETTE_ZONES, ...[...BLOSSOM_TREES, ...FEATURE_TREES].map((p) => ({ x: p.x, z: p.z, r: 3 }))];
    let attempts = 0;
    while (trees.length < count && attempts < count * 60) {
        attempts++;
        const z = -92 + rand() * 132;
        const side = rand() < 0.5 ? -1 : 1;
        const x = pathXAt(z) + side * (7.5 + rand() * 26);
        if (x < TERRAIN.minX + 2 || x > TERRAIN.maxX - 2) continue;
        if (insideAny(x, z, blocked)) continue;
        if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.4)) continue;
        const model = rand() < 0.2 ? 'blossom_tree' : 'voxel_tree';
        trees.push({
            model,
            x,
            z,
            y: groundHeightAt(x, z),
            rotY: Math.floor(rand() * 4) * HALF_PI,
            scale: model === 'blossom_tree' ? 2 + rand() * 0.6 : 2 + rand() * 1,
        });
    }
    return trees;
}

// ---------------------------------------------------------------------------
// Firefly / sparkle zones
// ---------------------------------------------------------------------------

export const SPARKLE_ZONES: { min: [number, number, number]; max: [number, number, number]; weight: number }[] = [
    { min: [-5, 0.5, 13], max: [5, 4, 24], weight: 1 },
    { min: [-15, 0.4, 3], max: [-6, 3, 13], weight: 1 },
    { min: [-3, 0.4, -31], max: [6, 3, -9], weight: 1.6 },
    { min: [3, 0.6, -54], max: [11, 5.5, -47], weight: 1.2 },
    { min: [-7, 0.5, -75], max: [7, 7, -58], weight: 2.2 },
];
