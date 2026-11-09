import * as THREE from 'three';
import { CAMERA_STOPS } from '../../lib/journey';
import { lerp } from '../../lib/math';
import { CAMERA_KEYS, ISLAND_OUTLINE, ROAD_LOOP, type Vec2 } from '../../lib/world';

const v3 = ([x, y, z]: [number, number, number]) => new THREE.Vector3(x, y, z);

/* ---------------------------------------------------------------- camera */

export const cameraPositionCurve = new THREE.CatmullRomCurve3(
    CAMERA_KEYS.map((k) => v3(k.pos)),
    false,
    'centripetal',
);
export const cameraLookCurve = new THREE.CatmullRomCurve3(
    CAMERA_KEYS.map((k) => v3(k.look)),
    false,
    'centripetal',
);

/** Curve parameter (CatmullRom `getPoint` t) of each camera stop. */
export const STOP_T: number[] = CAMERA_STOPS.map((_, stop) => {
    const index = CAMERA_KEYS.findIndex((k) => k.stop === stop);
    if (index < 0) throw new Error(`Camera key for stop ${stop} is missing`);
    return index / (CAMERA_KEYS.length - 1);
});

/** Maps the fractional journey value (stop index) to a curve parameter. */
export function journeyToT(journey: number) {
    const max = STOP_T.length - 1;
    const j = Math.min(max, Math.max(0, journey));
    const a = Math.floor(j);
    const b = Math.min(max, a + 1);
    return lerp(STOP_T[a], STOP_T[b], j - a);
}

/* ------------------------------------------------------------------ road */

export const roadCurve = new THREE.CatmullRomCurve3(
    ROAD_LOOP.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    true,
    'centripetal',
);
export const ROAD_LENGTH = roadCurve.getLength();
const roadPolyline: Vec2[] = roadCurve.getSpacedPoints(260).map((p) => [p.x, p.z]);

function distanceToPolyline(x: number, z: number, line: Vec2[]) {
    let best = Infinity;
    for (let i = 0; i < line.length - 1; i++) {
        const [ax, az] = line[i];
        const [bx, bz] = line[i + 1];
        const dx = bx - ax;
        const dz = bz - az;
        const len2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
        const px = ax + dx * t - x;
        const pz = az + dz * t - z;
        const d = px * px + pz * pz;
        if (d < best) best = d;
    }
    return Math.sqrt(best);
}

export const distanceToRoad = (x: number, z: number) => distanceToPolyline(x, z, roadPolyline);

/** Nearest point on the road to (x, z). */
export function nearestRoadPoint(x: number, z: number): Vec2 {
    let best: Vec2 = roadPolyline[0];
    let bestD = Infinity;
    for (const p of roadPolyline) {
        const d = (p[0] - x) ** 2 + (p[1] - z) ** 2;
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    }
    return best;
}

/* ---------------------------------------------------------------- island */

const islandCurve = new THREE.CatmullRomCurve3(
    ISLAND_OUTLINE.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    true,
    'centripetal',
);
export const islandPolygon: Vec2[] = islandCurve.getSpacedPoints(180).map((p) => [p.x, p.z]);

export function insideIsland(x: number, z: number, margin = 0) {
    let inside = false;
    const poly = islandPolygon;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i];
        const [xj, zj] = poly[j];
        if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
    }
    if (!inside) return false;
    return margin <= 0 || distanceToPolyline(x, z, poly) > margin;
}

/* ---------------------------------------------------------- camera path */

const cameraPolyline: Vec2[] = cameraPositionCurve.getSpacedPoints(220).map((p) => [p.x, p.z]);
export const distanceToCameraPath = (x: number, z: number) => distanceToPolyline(x, z, cameraPolyline);
export const cameraPathPoints = cameraPolyline;
