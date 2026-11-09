import { useMemo } from 'react';
import type { QualityTier } from '../../lib/device';
import { mulberry32, pick, range } from '../../lib/random';
import { nearCameraPath } from '../cameraPath';
import { buildGlowData, GlowPoints } from '../effects/GlowPoints';
import { flowerHeadGeometry, flowerStemGeometry, grassTuftGeometry, mushroomCapGeometry, mushroomStemGeometry, rockGeometry } from '../geometry';
import { Instanced, useDisposable, type InstanceItem } from '../Instanced';
import { CLEARINGS, FOCI, groundHeight, PATH_END_Z, pathX, type Vec3 } from '../layout';
import { clayMaterial } from '../materials';

const FLOWER_COLORS = ['#F2C5D2', '#F2C5D2', '#B9D5F2', '#c9b8f0', '#FFF8EE', '#F5D58B'];
const CAP_COLORS = ['#ef9fbd', '#9cc6f2', '#a8dcb6', '#b9a6f2', '#f5c98b'];
const GRASS = ['#3d6a5f', '#4a7867', '#4f6688', '#5b7a6a'];

const SCALE: Record<QualityTier, number> = { high: 1, medium: 0.6, low: 0.35 };

/** Keep set-piece footprints clear of ground clutter. */
const BLOCKERS: Array<[Vec3, number]> = [
    [FOCI.couple, 2.4],
    [FOCI.countdown, 3.4],
    [FOCI.event, 3.2],
    [[0, 0, -59], 3.2],
    [FOCI.rsvp, 3.4],
    [FOCI.wishes, 2.6],
    [[4.2, 0, -109], 3.6],
];
const blocked = (x: number, z: number, lens = 1.1) => BLOCKERS.some(([p, r]) => Math.hypot(x - p[0], z - p[2]) < r) || nearCameraPath(x, z, lens);

/** Random point near the path edge or around a clearing rim. */
function sample(rng: () => number, minD: number, maxD: number): [number, number] {
    if (rng() < 0.3) {
        const c = pick(rng, CLEARINGS);
        const a = rng() * Math.PI * 2;
        const r = c.r * range(rng, 0.55, 1.15);
        return [c.x + Math.cos(a) * r, c.z + Math.sin(a) * r];
    }
    const z = range(rng, 24, PATH_END_Z - 4);
    const side = rng() < 0.5 ? -1 : 1;
    return [pathX(z) + side * range(rng, minD, maxD), z];
}

export function Vegetation({ quality }: { quality: QualityTier }) {
    const k = SCALE[quality];

    const data = useMemo(() => {
        const rng = mulberry32(99);
        const grass: InstanceItem[] = [];
        const stems: InstanceItem[] = [];
        const heads: InstanceItem[] = [];
        const mStems: InstanceItem[] = [];
        const caps: InstanceItem[] = [];
        const rocks: InstanceItem[] = [];
        const glows: Parameters<typeof buildGlowData>[0] = [];

        for (let i = 0; i < 1500 * k; i++) {
            const [x, z] = sample(rng, 1.35, 9);
            if (blocked(x, z, 0.7)) continue;
            const s = range(rng, 0.7, 1.5);
            grass.push({ p: [x, groundHeight(x, z) - 0.02, z], r: [0, rng() * 6, 0], s: [s, s * range(rng, 0.8, 1.4), s], c: pick(rng, GRASS) });
        }
        for (let i = 0; i < 800 * k; i++) {
            const [x, z] = sample(rng, 1.3, 4.5);
            if (blocked(x, z)) continue;
            const y = groundHeight(x, z);
            const s = range(rng, 0.8, 1.5);
            const r: Vec3 = [range(rng, -0.15, 0.15), rng() * 6, range(rng, -0.15, 0.15)];
            stems.push({ p: [x, y, z], r, s, c: '#5f8a6c' });
            heads.push({ p: [x, y, z], r, s, c: pick(rng, FLOWER_COLORS) });
        }
        for (let i = 0; i < 55 * k + 8; i++) {
            const [cx, cz] = sample(rng, 1.7, 5);
            if (blocked(cx, cz, 1.8)) continue;
            const color = pick(rng, CAP_COLORS);
            const n = 2 + Math.floor(rng() * 4);
            for (let j = 0; j < n; j++) {
                const x = cx + range(rng, -0.4, 0.4);
                const z = cz + range(rng, -0.4, 0.4);
                const s = range(rng, 0.6, 1.5) * (j === 0 ? 1.4 : 1);
                const r: Vec3 = [range(rng, -0.12, 0.12), rng() * 6, range(rng, -0.12, 0.12)];
                const p: Vec3 = [x, groundHeight(x, z) - 0.02, z];
                mStems.push({ p, r, s, c: '#f8e6d2' });
                caps.push({ p, r, s, c: color });
            }
            glows.push({ p: [cx, groundHeight(cx, cz) + 0.35, cz], color, size: 1.3, intensity: 0.55 });
        }
        for (let i = 0; i < 140 * k + 20; i++) {
            const [x, z] = sample(rng, 1.6, 8);
            if (blocked(x, z)) continue;
            const s = range(rng, 0.18, 0.55);
            rocks.push({
                p: [x, groundHeight(x, z) - 0.04, z],
                r: [0, rng() * 6, 0],
                s: [s * range(rng, 1, 1.5), s, s],
                c: pick(rng, ['#6c6994', '#5f6b84', '#77739c']),
            });
        }
        return { grass, stems, heads, mStems, caps, rocks, glow: buildGlowData(glows) };
    }, [k]);

    const geos = useDisposable(() => {
        const list = {
            grass: grassTuftGeometry(),
            stem: flowerStemGeometry(),
            head: flowerHeadGeometry(),
            mStem: mushroomStemGeometry(),
            cap: mushroomCapGeometry(),
            rock: rockGeometry(5),
        };
        return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) };
    }, []);
    const mats = useDisposable(() => {
        const list = {
            plant: clayMaterial({ vertexColors: true, rimStrength: 0.3, rim: '#9fd0b8' }),
            plainPlant: clayMaterial({ rimStrength: 0.25 }),
            flower: clayMaterial({ selfGlow: 0.35, rimStrength: 0.25, rim: '#fff8ee' }),
            cap: clayMaterial({ vertexColors: true, selfGlow: 0.6, rimStrength: 0.35, rim: '#fff8ee' }),
            rock: clayMaterial({ roughness: 0.92, rimStrength: 0.22 }),
        };
        return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) };
    }, []);

    return (
        <group>
            <Instanced geometry={geos.grass} material={mats.plant} items={data.grass} />
            <Instanced geometry={geos.stem} material={mats.plainPlant} items={data.stems} />
            <Instanced geometry={geos.head} material={mats.flower} items={data.heads} />
            <Instanced geometry={geos.mStem} material={mats.plant} items={data.mStems} />
            <Instanced geometry={geos.cap} material={mats.cap} items={data.caps} />
            <Instanced geometry={geos.rock} material={mats.rock} items={data.rocks} />
            <GlowPoints data={data.glow} twinkle={0.3} fadeNear={28} fadeFar={55} />
        </group>
    );
}
