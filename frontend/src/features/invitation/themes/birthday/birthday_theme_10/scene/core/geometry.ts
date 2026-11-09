import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Geometry helpers. Static toy objects are built from primitive "parts" that
 * are merged into a single BufferGeometry with per-vertex colours and a wind
 * weight attribute — one draw call per object with a shared material.
 */

const cache = new Map<string, THREE.BufferGeometry>();

export function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
    let geo = cache.get(key) as T | undefined;
    if (!geo) {
        geo = make();
        cache.set(key, geo);
    }
    return geo;
}

/**
 * Rounded box with tessellation chosen by size: corner segments are what
 * dominate the triangle count (3 segments ≈ 590 tris, 1 segment ≈ 110), and
 * small parts never show the difference.
 */
export function roundedBox(w: number, h: number, d: number, r = 0.08, segments?: number) {
    const radius = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
    const seg = segments ?? (radius < 0.07 || Math.max(w, h, d) < 0.5 ? 1 : Math.max(w, h, d) > 2.5 ? 3 : 2);
    return cached(`rb:${w}:${h}:${d}:${radius}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, radius));
}

export const sphere = (r: number, w = 16, h = 12) => cached(`sph:${r}:${w}:${h}`, () => new THREE.SphereGeometry(r, w, h));
export const cylinder = (rt: number, rb: number, h: number, seg = 16) =>
    cached(`cyl:${rt}:${rb}:${h}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
export const cone = (r: number, h: number, seg = 16) => cached(`cone:${r}:${h}:${seg}`, () => new THREE.ConeGeometry(r, h, seg));
export const torus = (r: number, tube: number, arc = Math.PI * 2, rs = 12, ts = 36) =>
    cached(`tor:${r}:${tube}:${arc}:${rs}:${ts}`, () => new THREE.TorusGeometry(r, tube, rs, ts, arc));
export const capsule = (r: number, len: number) => cached(`cap:${r}:${len}`, () => new THREE.CapsuleGeometry(r, len, 6, 12));

export type Tuple3 = [number, number, number];

export interface Part {
    geometry: THREE.BufferGeometry;
    color: THREE.ColorRepresentation;
    /** Vertical gradient: `color` at the bottom of the part, `colorTop` at the top. */
    colorTop?: THREE.ColorRepresentation;
    position?: Tuple3;
    rotation?: Tuple3;
    scale?: number | Tuple3;
    /** Wind weight (0 anchored … 1 free), constant or computed from the final vertex position. */
    wind?: number | ((p: THREE.Vector3) => number);
}

const KEEP = new Set(['position', 'normal', 'uv']);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
const _v = new THREE.Vector3();
const _c0 = new THREE.Color();
const _c1 = new THREE.Color();

export function mergeParts(parts: Part[]): THREE.BufferGeometry {
    const prepared = parts.map((part) => {
        const g = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
        for (const name of Object.keys(g.attributes)) if (!KEEP.has(name)) g.deleteAttribute(name);
        g.morphAttributes = {};
        if (!g.attributes.normal) g.computeVertexNormals();
        const pos = g.attributes.position;
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(pos.count * 2), 2));

        const s = part.scale ?? 1;
        _s.set(...((typeof s === 'number' ? [s, s, s] : s) as Tuple3));
        _p.set(...(part.position ?? [0, 0, 0]));
        _q.setFromEuler(_e.set(...(part.rotation ?? [0, 0, 0])));
        g.applyMatrix4(_m.compose(_p, _q, _s));

        const colors = new Float32Array(pos.count * 3);
        const wind = new Float32Array(pos.count);
        _c0.set(part.color);
        let minY = Infinity;
        let maxY = -Infinity;
        if (part.colorTop !== undefined) {
            _c1.set(part.colorTop);
            for (let i = 0; i < pos.count; i++) {
                const y = pos.getY(i);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
        for (let i = 0; i < pos.count; i++) {
            if (part.colorTop !== undefined) {
                const t = maxY > minY ? (pos.getY(i) - minY) / (maxY - minY) : 0;
                colors[i * 3] = _c0.r + (_c1.r - _c0.r) * t;
                colors[i * 3 + 1] = _c0.g + (_c1.g - _c0.g) * t;
                colors[i * 3 + 2] = _c0.b + (_c1.b - _c0.b) * t;
            } else {
                colors[i * 3] = _c0.r;
                colors[i * 3 + 1] = _c0.g;
                colors[i * 3 + 2] = _c0.b;
            }
            if (typeof part.wind === 'function') wind[i] = part.wind(_v.fromBufferAttribute(pos, i));
            else wind[i] = part.wind ?? 0;
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        g.setAttribute('aWind', new THREE.Float32BufferAttribute(wind, 1));
        return g;
    });

    const merged = mergeGeometries(prepared, false);
    prepared.forEach((g) => g.dispose());
    if (!merged) throw new Error('mergeParts: incompatible geometries');
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
}

/** Extruded, bevelled 2D shape lying in the XY plane (front faces +Z). */
export function extrudeShape(shape: THREE.Shape, depth: number, bevel = 0.05) {
    const g = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: 16,
    });
    g.translate(0, 0, -depth / 2);
    return g;
}

export function starShape(outer = 0.5, inner = 0.22, points = 5) {
    const shape = new THREE.Shape();
    for (let i = 0; i <= points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    return shape;
}

export const smoothWind =
    (start: number, end: number, scale = 1) =>
    (p: THREE.Vector3) =>
        THREE.MathUtils.smoothstep(p.y, start, end) * scale;
