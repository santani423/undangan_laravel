import type { ThreeElements } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../../lib/types';
import { boxGeo, cylGeo, fasciaGeo, hipRoofGeo, planeGeo } from '../geometry';
import { useMats } from '../materials';

type MeshProps = Omit<ThreeElements['mesh'], 'args'>;

/** Chamfered box with metre UVs. */
export function B({ s, p = [0, 0, 0], m, r, ...rest }: { s: Vec3; p?: Vec3; m: THREE.Material; r?: Vec3 } & MeshProps) {
    return <mesh geometry={boxGeo(s[0], s[1], s[2])} material={m} position={p} rotation={r} {...rest} />;
}

/** Cylinder with metre UVs. */
export function C({
    rt,
    rb,
    h,
    seg = 14,
    p = [0, 0, 0],
    m,
    r,
    ...rest
}: { rt: number; rb?: number; h: number; seg?: number; p?: Vec3; m: THREE.Material; r?: Vec3 } & MeshProps) {
    return <mesh geometry={cylGeo(rt, rb ?? rt, h, seg)} material={m} position={p} rotation={r} {...rest} />;
}

/**
 * Soft contact-shadow / ambient-occlusion decal lying on a surface at height `y`.
 * Sits 6 mm above the surface with polygon offset — never coplanar, never z-fighting.
 */
export function Contact({
    p,
    sx,
    sz = sx,
    strip = false,
    ry = 0,
    opacity,
}: {
    p: Vec3;
    sx: number;
    sz?: number;
    strip?: boolean;
    ry?: number;
    opacity?: number;
}) {
    const m = useMats();
    const mat = useMemo(() => {
        const base = strip ? m.contactStrip : m.contact;
        if (opacity === undefined) return base;
        const c = base.clone();
        c.opacity = opacity;
        return c;
    }, [m, strip, opacity]);
    return <mesh geometry={planeGeo(sx, sz)} material={mat} position={[p[0], p[1] + 0.006, p[2]]} rotation={[0, ry, 0]} renderOrder={1} />;
}

/** Umpak — the carved andesite base a Javanese pillar sits on (stepped, truncated pyramid). */
export function Umpak({ p, size = 0.5 }: { p: Vec3; size?: number }) {
    const m = useMats();
    const h = size * 0.5;
    return (
        <group position={p}>
            <B s={[size * 1.08, 0.06, size * 1.08]} p={[0, 0.03, 0]} m={m.stoneDark} />
            <mesh geometry={hipRoofGeo(size, size, size * 0.64, size * 0.64, h)} material={m.stoneDark} position={[0, 0.06, 0]} />
            <B s={[size * 0.68, 0.05, size * 0.68]} p={[0, 0.06 + h + 0.025, 0]} m={m.stoneDark} />
        </group>
    );
}

/** Square teak pillar: umpak, chamfered shaft, brass collar and a stepped capital. */
export function Pillar({
    p,
    h,
    w = 0.26,
    m,
    collar,
    contact = true,
}: {
    p: Vec3;
    h: number;
    w?: number;
    m: THREE.Material;
    base?: THREE.Material;
    collar?: THREE.Material;
    contact?: boolean;
}) {
    const mats = useMats();
    const ub = w * 1.9;
    const umpakH = 0.06 + ub * 0.5 + 0.05;
    const shaft = h - umpakH - 0.12;
    return (
        <group position={p}>
            {contact && <Contact p={[0, 0, 0]} sx={ub * 3.4} />}
            <Umpak p={[0, 0, 0]} size={ub} />
            <B s={[w, shaft, w]} p={[0, umpakH + shaft / 2, 0]} m={m} />
            {/* capital: two stepped blocks (sunduk / kili) */}
            <B s={[w + 0.06, 0.06, w + 0.06]} p={[0, umpakH + shaft + 0.03, 0]} m={mats.teakDark} />
            <B s={[w + 0.12, 0.06, w + 0.12]} p={[0, umpakH + shaft + 0.09, 0]} m={mats.teakDark} />
            {collar && <B s={[w + 0.03, 0.05, w + 0.03]} p={[0, umpakH + 0.16, 0]} m={collar} />}
            {collar && <B s={[w + 0.03, 0.04, w + 0.03]} p={[0, umpakH + shaft - 0.12, 0]} m={collar} />}
        </group>
    );
}

/** Rectangular ring of beams (blandar / sunduk). Every member is modelled along its own length so grain runs true. */
export function BeamRing({ w, d, y, t = 0.2, h = 0.22, m }: { w: number; d: number; y: number; t?: number; h?: number; m: THREE.Material }) {
    return (
        <group position={[0, y, 0]}>
            <B s={[w + t, h, t]} p={[0, 0, d / 2]} m={m} />
            <B s={[w + t, h, t]} p={[0, 0, -d / 2]} m={m} />
            <B s={[d - t, h, t]} p={[w / 2, 0, 0]} r={[0, Math.PI / 2, 0]} m={m} />
            <B s={[d - t, h, t]} p={[-w / 2, 0, 0]} r={[0, Math.PI / 2, 0]} m={m} />
        </group>
    );
}

/**
 * Roof layer with real thickness: clay-tile top, rafter ceiling underneath, a teak fascia board
 * along the eave and rounded ridge tiles (wuwungan) along the four hips (and the ridge if any).
 */
export function RoofLayer({
    bw,
    bd,
    tw,
    td,
    h,
    y,
    top,
    under,
    thickness = 0.14,
    hips = true,
    ridge = false,
}: {
    bw: number;
    bd: number;
    tw: number;
    td: number;
    h: number;
    y: number;
    top: THREE.Material;
    under: THREE.Material;
    thickness?: number;
    hips?: boolean;
    ridge?: boolean;
}) {
    const m = useMats();
    const g = hipRoofGeo(bw, bd, tw, td, h);
    const hipMeshes = useMemo(() => {
        if (!hips) return [];
        const out: { pos: THREE.Vector3; quat: THREE.Quaternion; len: number }[] = [];
        const corners: [number, number][] = [
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1],
        ];
        for (const [sx, sz] of corners) {
            const a = new THREE.Vector3((sx * bw) / 2, 0.02, (sz * bd) / 2);
            const b = new THREE.Vector3((sx * tw) / 2, h + 0.02, (sz * td) / 2);
            const dir = b.clone().sub(a);
            const len = dir.length();
            out.push({
                pos: a.clone().add(b).multiplyScalar(0.5),
                quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
                len,
            });
        }
        return out;
    }, [bw, bd, tw, td, h, hips]);
    return (
        <group position={[0, y, 0]}>
            <mesh geometry={g} material={top} />
            <mesh geometry={g} material={under} position={[0, -thickness, 0]} />
            <mesh geometry={fasciaGeo(bw, bd, thickness + 0.02)} material={m.teakDark} position={[0, 0.01, 0]} />
            {hipMeshes.map((hm, i) => (
                <mesh key={i} geometry={cylGeo(0.075, 0.075, hm.len, 8)} material={m.roofRidge} position={hm.pos} quaternion={hm.quat} />
            ))}
            {ridge && td < 0.5 && (
                <mesh geometry={cylGeo(0.09, 0.09, tw + 0.1, 10)} material={m.roofRidge} position={[0, h + 0.03, 0]} rotation={[0, 0, Math.PI / 2]} />
            )}
        </group>
    );
}
