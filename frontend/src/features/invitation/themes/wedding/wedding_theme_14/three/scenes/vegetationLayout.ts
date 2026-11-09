import { CAMERA_SHOTS } from '../../lib/camera';
import { NO_GRASS, PATHS, WORLD } from '../../lib/world';
import { distToPolyline, mulberry32, pointInRects } from '../geometry';
import { TREE_SPREAD, type PlantInstance, type TreeGroup } from '../objects/Vegetation';

/** Camera route as a 2D polyline — scattered plants keep clear of it so nothing blocks a shot. */
const CAMERA_LINE: [number, number][] = CAMERA_SHOTS.flatMap((s) => s.positions.map((p) => [p[0], p[2]] as [number, number]));

function clearOf(x: number, z: number, pad: number) {
    if (pointInRects(x, z, NO_GRASS, pad)) return false;
    if (PATHS.some((p) => distToPolyline(x, z, p.points) < p.width / 2 + pad * 0.7)) return false;
    if (distToPolyline(x, z, CAMERA_LINE) < pad + 2) return false;
    const pond = WORLD.garden.pond;
    if (Math.hypot(x - pond[0], z - pond[2]) < WORLD.garden.pondRadius + pad * 0.5) return false;
    return true;
}

function scatter(
    seed: number,
    n: number,
    x0: number,
    x1: number,
    z0: number,
    z1: number,
    pad: number,
    minGap: number,
    sMin: number,
    sMax: number,
    extra?: (x: number, z: number) => boolean,
) {
    const rnd = mulberry32(seed);
    const out: PlantInstance[] = [];
    let guard = 0;
    while (out.length < n && guard++ < n * 60) {
        const x = x0 + rnd() * (x1 - x0);
        const z = z0 + rnd() * (z1 - z0);
        if (!clearOf(x, z, pad)) continue;
        if (extra && !extra(x, z)) continue;
        if (out.some((o) => Math.hypot(o.p[0] - x, o.p[2] - z) < minGap)) continue;
        out.push({ p: [x, 0, z], s: sMin + rnd() * (sMax - sMin), r: rnd() * Math.PI * 2, hue: rnd() });
    }
    return out;
}

export interface VegetationLayout {
    trees: TreeGroup[];
    palms: PlantInstance[];
    bananas: PlantInstance[];
    jasmine: PlantInstance[];
    contacts: { x: number; z: number; r: number }[];
}

/** Instances far from every camera position use the lighter leaf-card LOD (fixed assignment → no popping). */
const isFar = (it: PlantInstance) => distToPolyline(it.p[0], it.p[2], CAMERA_LINE) > 32;

export function buildVegetation(density: number): VegetationLayout {
    const d = (n: number) => Math.max(1, Math.round(n * density));

    // Hand-placed compositions
    const avenue: PlantInstance[] = [];
    for (const z of [7, 15, 23, 31]) {
        avenue.push({ p: [-7.6, 0, z], s: 0.72, r: z, hue: 0.3 }, { p: [7.6, 0, z], s: 0.72, r: z * 2, hue: 0.6 });
    }
    const landmark: PlantInstance[] = [
        { p: [41, 0, -29], s: 1.15, r: 0.4, hue: 0.7 },
        { p: [43, 0, -44], s: 1.25, r: 1.4, hue: 0.5 },
        { p: [21.5, 0, -50], s: 1.0, r: 2.4, hue: 0.9 },
        { p: [12.5, 0, -45], s: 0.85, r: 0.8, hue: 0.1 },
        { p: [41, 0, -60], s: 1.1, r: 0.3, hue: 0.6 },
        { p: [23, 0, -71], s: 1.2, r: 1.1, hue: 0.4 },
        { p: [-27, 0, -55], s: 1.15, r: 0.2, hue: 0.3 },
        { p: [-28, 0, -38], s: 1.0, r: 2.2, hue: 0.8 },
        { p: [-11, 0, -40], s: 0.85, r: 1.7, hue: 0.5 },
        { p: [-12, 0, -11], s: 1.2, r: 0.9, hue: 0.2 },
        { p: [12, 0, -9], s: 1.15, r: 0.5, hue: 0.65 },
    ];
    const periphery = scatter(77, d(70), -70, 75, -115, 48, 3.5, 6.5, 0.85, 1.45, (x, z) => {
        // a loose ring: dense outside the compound, sparse inside
        const inside = x > -26 && x < 46 && z > -76 && z < 2;
        return !inside || Math.hypot(x - 10, z + 35) > 34;
    });

    const palms: PlantInstance[] = [
        { p: [37.8, 0, -33.5], s: 1.0, r: 0.3 },
        { p: [37.2, 0, -41.8], s: 1.1, r: 2.1 },
        { p: [29.6, 0, -42.6], s: 0.9, r: 4.0 },
        { p: [33, 0, -31.2], s: 1.05, r: 5.1 },
        { p: [9.5, 0, -6], s: 1.15, r: 1.2 },
        { p: [-9.5, 0, -5], s: 1.05, r: 3.3 },
        { p: [-24.5, 0, -24], s: 1.1, r: 0.6 },
        { p: [16, 0, -70], s: 1.0, r: 2.9 },
        ...scatter(31, d(10), -40, 60, -95, 30, 4, 8, 0.9, 1.2, (x, z) => !(x > -24 && x < 44 && z > -72 && z < 0)),
    ];

    const bananas: PlantInstance[] = [
        { p: [12, 0, -33.5], s: 1.0, r: 0.4 },
        { p: [11.2, 0, -37], s: 1.15, r: 1.9 },
        { p: [13.4, 0, -39.4], s: 0.9, r: 3.2 },
        { p: [40.5, 0, -51], s: 1.1, r: 2.5 },
        { p: [42.6, 0, -49], s: 0.95, r: 0.7 },
        { p: [-25.2, 0, -49], s: 1.0, r: 1.3 },
        { p: [-25.8, 0, -46], s: 0.9, r: 2.6 },
        ...scatter(55, d(8), 8, 46, -58, -14, 2.8, 3.5, 0.85, 1.15),
    ];

    const jasmine: PlantInstance[] = [
        // along the garden path
        ...[
            [15.6, -26.2],
            [20.8, -31.6],
            [22.2, -35],
            [26.4, -41.6],
            [27, -45],
            [31.4, -51.5],
            [29.8, -55.2],
            [34.6, -36.2],
            [35.8, -39.4],
            [31.2, -40.4],
            [30, -34.4],
        ].map(([x, z], i) => ({ p: [x, 0, z] as [number, number, number], s: 0.9 + (i % 3) * 0.15, r: i, hue: (i * 0.37) % 1 })),
        // flanking the ceremony & reception & gift areas
        ...[
            [26.6, -59.4],
            [37.4, -59.4],
            [-23.6, -40.8],
            [-14.6, -41.6],
            [-23.9, -28.4],
            [-23.2, -33.4],
            [-8.8, -18.2],
            [8.8, -18.2],
            [-4.6, 2.2],
            [4.6, 2.2],
        ].map(([x, z], i) => ({ p: [x, 0, z] as [number, number, number], s: 0.85 + (i % 2) * 0.2, r: i * 1.7, hue: (i * 0.53) % 1 })),
        ...scatter(91, d(22), 10, 45, -56, -16, 1.6, 2.2, 0.7, 1.1),
    ];

    // waringin kembar — the twin banyans of a kraton forecourt
    const banyans: PlantInstance[] = [
        { p: [-16.5, 0, 18], s: 1.0, r: 1, hue: 0.2 },
        { p: [16.5, 0, 18], s: 1.0, r: 2.6, hue: 0.4 },
    ];
    const round = [...landmark, ...periphery];
    const split = (list: PlantInstance[]) => ({ near: list.filter((i) => !isFar(i)), far: list.filter(isFar) });
    const trees: TreeGroup[] = [
        { style: 'compact', seed: 21, leaf: 0, ...split(avenue) },
        { style: 'banyan', seed: 5, leaf: 2, ...split(banyans) },
        { style: 'round', seed: 3, leaf: 0, ...split(round.filter((_, i) => i % 2 === 0)) },
        { style: 'round', seed: 8, leaf: 1, ...split(round.filter((_, i) => i % 2 === 1)) },
    ];
    const contacts = [
        ...avenue.map((t) => ({ x: t.p[0], z: t.p[2], r: TREE_SPREAD.compact * t.s * 0.9 })),
        ...banyans.map((t) => ({ x: t.p[0], z: t.p[2], r: TREE_SPREAD.banyan * t.s * 0.75 })),
        ...round.map((t) => ({ x: t.p[0], z: t.p[2], r: TREE_SPREAD.round * t.s * 0.8 })),
        ...palms.map((t) => ({ x: t.p[0] + 0.5 * t.s, z: t.p[2], r: 1.3 * t.s })),
        ...bananas.map((t) => ({ x: t.p[0], z: t.p[2], r: 1.0 * t.s })),
        ...jasmine.map((t) => ({ x: t.p[0], z: t.p[2], r: 0.7 * t.s })),
    ];
    return { trees, palms, bananas, jasmine, contacts };
}
