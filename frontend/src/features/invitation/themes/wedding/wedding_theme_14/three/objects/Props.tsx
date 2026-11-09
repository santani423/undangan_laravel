import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { journey } from '../../lib/journey';
import type { Vec3 } from '../../lib/types';
import { hipRoofGeo, quadGeo } from '../geometry';
import { useMats } from '../materials';
import { Crest, Platform, Steps } from './Joglo';
import { B, BeamRing, C, Contact, Pillar, RoofLayer } from './primitives';

/* ───────────── lanterns ───────────── */

export function LanternHead({ p = [0, 0, 0], scale = 1 }: { p?: Vec3; scale?: number }) {
    const m = useMats();
    return (
        <group position={p} scale={scale}>
            <B s={[0.26, 0.035, 0.26]} p={[0, 0.0175, 0]} m={m.brass} />
            <B s={[0.17, 0.27, 0.17]} p={[0, 0.17, 0]} m={m.lanternGlass} />
            {[
                [0.09, 0.09],
                [-0.09, 0.09],
                [0.09, -0.09],
                [-0.09, -0.09],
            ].map(([x, z], i) => (
                <B key={i} s={[0.022, 0.3, 0.022]} p={[x, 0.17, z]} m={m.brass} />
            ))}
            <B s={[0.21, 0.025, 0.21]} p={[0, 0.315, 0]} m={m.brass} />
            <mesh geometry={hipRoofGeo(0.32, 0.32, 0.04, 0.04, 0.15)} material={m.brass} position={[0, 0.325, 0]} />
            <B s={[0.04, 0.07, 0.04]} p={[0, 0.505, 0]} m={m.brass} />
        </group>
    );
}

/** Glow halo — kept outside StaticBatch (sprites are not meshes). */
export function Glow({ p, size = 1.3 }: { p: Vec3; size?: number }) {
    const m = useMats();
    return <sprite material={m.glow} position={p} scale={[size, size, size]} />;
}

/** Standing garden lantern on a stone foot and teak post. */
export function LanternPost({ p, h = 1.7 }: { p: Vec3; h?: number }) {
    const m = useMats();
    return (
        <group position={p}>
            <Contact p={[0, 0, 0]} sx={0.9} />
            <B s={[0.38, 0.08, 0.38]} p={[0, 0.04, 0]} m={m.stoneDark} />
            <B s={[0.28, 0.16, 0.28]} p={[0, 0.16, 0]} m={m.stoneDark} />
            <B s={[0.11, h, 0.11]} p={[0, 0.24 + h / 2, 0]} m={m.teakDarkV} />
            <B s={[0.2, 0.04, 0.2]} p={[0, 0.24 + h - 0.02, 0]} m={m.teakDark} />
            <LanternHead p={[0, 0.24 + h, 0]} />
        </group>
    );
}

export function lanternGlowPos(p: Vec3, h = 1.7): Vec3 {
    return [p[0], p[1] + 0.24 + h + 0.17, p[2]];
}

const HANG_SCALE = 0.9;
/** Lantern hanging on a brass rod from a beam; the rod meets the finial exactly. */
export function HangingLantern({ p, drop = 0.6 }: { p: Vec3; drop?: number }) {
    const m = useMats();
    return (
        <group position={p}>
            <B s={[0.018, drop, 0.018]} p={[0, -drop / 2, 0]} m={m.brass} />
            <LanternHead p={[0, -drop - 0.54 * HANG_SCALE, 0]} scale={HANG_SCALE} />
        </group>
    );
}

export function hangingGlowPos(p: Vec3, drop: number): Vec3 {
    return [p[0], p[1] - drop - 0.54 * HANG_SCALE + 0.17 * HANG_SCALE, p[2]];
}

/** Three crossed cards of the shrub/jasmine texture — small potted foliage. */
export function ShrubCards({ p, size = 0.4 }: { p: Vec3; size?: number }) {
    const m = useMats();
    return (
        <group position={p}>
            {[0, 1, 2].map((i) => (
                <mesh key={i} geometry={quadGeo(size, size)} material={m.bush} position={[0, size / 2, 0]} rotation={[0, (i * Math.PI) / 3, 0]} />
            ))}
        </group>
    );
}

/* ───────────── furniture ───────────── */

export function Table({
    p,
    w = 2.4,
    d = 0.85,
    h = 0.78,
    cloth,
    ry = 0,
}: {
    p: Vec3;
    w?: number;
    d?: number;
    h?: number;
    cloth?: THREE.Material;
    ry?: number;
}) {
    const m = useMats();
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <Contact p={[0, 0, 0]} sx={w + 0.5} sz={d + 0.6} />
            <B s={[w, 0.06, d]} p={[0, h - 0.03, 0]} m={m.teak} />
            {[
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
            ].map(([sx, sz], i) => (
                <B key={i} s={[0.07, h - 0.06, 0.07]} p={[sx * (w / 2 - 0.1), (h - 0.06) / 2, sz * (d / 2 - 0.1)]} m={m.teakV} />
            ))}
            <B s={[w - 0.2, 0.08, 0.04]} p={[0, h - 0.12, d / 2 - 0.1]} m={m.teak} />
            {cloth && (
                <>
                    <B s={[w * 0.72, 0.012, d + 0.04]} p={[0, h + 0.006, 0]} m={cloth} />
                    <B s={[w * 0.72, h * 0.62, 0.012]} p={[0, h - (h * 0.62) / 2, d / 2 + 0.025]} m={cloth} />
                </>
            )}
        </group>
    );
}

export function Chair({ p, ry = 0 }: { p: Vec3; ry?: number }) {
    const m = useMats();
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <Contact p={[0, 0, 0]} sx={1.0} sz={0.9} />
            <B s={[0.7, 0.12, 0.62]} p={[0, 0.48, 0]} m={m.teak} />
            <B s={[0.62, 0.08, 0.54]} p={[0, 0.58, 0.02]} m={m.maroon} />
            {[
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
            ].map(([sx, sz], i) => (
                <B key={i} s={[0.07, 0.48, 0.07]} p={[sx * 0.3, 0.24, sz * 0.26]} m={m.teakV} />
            ))}
            <B s={[0.72, 1.05, 0.08]} p={[0, 1.05, -0.28]} m={m.teak} />
            <B s={[0.54, 0.78, 0.03]} p={[0, 1.02, -0.235]} m={m.carving} />
            <Crest p={[0, 1.575, -0.28]} width={0.72} height={0.26} rich />
            {[-1, 1].map((s) => (
                <B key={s} s={[0.08, 0.3, 0.5]} p={[s * 0.34, 0.7, 0]} m={m.teak} />
            ))}
        </group>
    );
}

/** Kembar mayang — paired ornamental arrangement of young coconut leaves (janur) in a brass vessel. */
export function KembarMayang({ p }: { p: Vec3 }) {
    const m = useMats();
    const leaves = useMemo(() => {
        const out: { r: Vec3; pos: Vec3 }[] = [];
        for (let i = 0; i < 14; i++) {
            const a = (i / 14) * Math.PI * 2;
            const tier = i % 2;
            out.push({ r: [0.5 + tier * 0.35, -a, 0], pos: [Math.cos(a) * 0.08, 0.95 + tier * 0.3, Math.sin(a) * 0.08] });
        }
        return out;
    }, []);
    const leafGeo = useMemo(() => {
        const g = new THREE.PlaneGeometry(0.07, 0.75, 1, 4);
        g.translate(0, 0.375, 0);
        const pos = g.attributes.position as THREE.BufferAttribute;
        const w = new Float32Array(pos.count);
        for (let i = 0; i < pos.count; i++) w[i] = pos.getY(i) / 0.75;
        g.setAttribute('aWind', new THREE.BufferAttribute(w, 1));
        return g;
    }, []);
    return (
        <group position={p}>
            <C rt={0.18} rb={0.12} h={0.36} p={[0, 0.18, 0]} m={m.brass} seg={16} />
            <C rt={0.22} rb={0.18} h={0.05} p={[0, 0.38, 0]} m={m.brass} seg={16} />
            <C rt={0.035} h={1.4} p={[0, 1.05, 0]} m={m.janur} seg={6} />
            <mesh position={[0, 1.15, 0]} material={m.janur} scale={[0.2, 0.42, 0.2]}>
                <sphereGeometry args={[1, 14, 10]} />
            </mesh>
            {leaves.map((l, i) => (
                <mesh
                    key={i}
                    geometry={leafGeo}
                    material={m.janur}
                    position={l.pos}
                    rotation={[l.r[0], l.r[1], 0, 'YXZ']}
                    userData={{ dynamic: true }}
                />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh
                    key={`f${i}`}
                    position={[Math.cos(i) * 0.2, 1.0 + (i % 3) * 0.18, Math.sin(i) * 0.2]}
                    material={i % 2 ? m.flowerYellow : m.ivory}
                >
                    <sphereGeometry args={[0.045, 8, 6]} />
                </mesh>
            ))}
            <mesh geometry={hipRoofGeo(0.08, 0.08, 0.01, 0.01, 0.35)} material={m.gold} position={[0, 1.75, 0]} />
        </group>
    );
}

/** Open guestbook with pages and a brass pen. */
export function Guestbook({ p, ry = 0 }: { p: Vec3; ry?: number }) {
    const m = useMats();
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <B s={[0.62, 0.02, 0.44]} p={[0, 0.01, 0]} m={m.teakDark} />
            <B s={[0.29, 0.03, 0.4]} p={[-0.15, 0.03, 0]} m={m.paper} r={[0, 0, 0.06]} />
            <B s={[0.29, 0.03, 0.4]} p={[0.15, 0.03, 0]} m={m.paper} r={[0, 0, -0.06]} />
            <C rt={0.007} h={0.18} p={[0.24, 0.06, 0.12]} r={[Math.PI / 2, 0, 0.4]} m={m.gold} seg={6} />
        </group>
    );
}

/** Wooden gift chest (kotak seserahan). The lid lifts slightly during the gift scene. */
export function GiftBox({ p, ry = 0 }: { p: Vec3; ry?: number }) {
    const m = useMats();
    const lid = useRef<THREE.Group>(null);
    useFrame(() => {
        const t = THREE.MathUtils.smoothstep(journey.progress, 0.868, 0.9);
        if (lid.current) lid.current.rotation.x = -t * 0.42;
    });
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <B s={[0.56, 0.3, 0.4]} p={[0, 0.15, 0]} m={m.teak} />
            <B s={[0.5, 0.2, 0.01]} p={[0, 0.15, 0.2]} m={m.carving} />
            {[
                [1, 1],
                [-1, 1],
                [1, -1],
                [-1, -1],
            ].map(([sx, sz], i) => (
                <B key={i} s={[0.05, 0.31, 0.05]} p={[sx * 0.27, 0.155, sz * 0.19]} m={m.brass} />
            ))}
            <group ref={lid} position={[0, 0.3, -0.2]} userData={{ dynamic: true }}>
                <B s={[0.6, 0.08, 0.44]} p={[0, 0.04, 0.2]} m={m.teakDark} castShadow />
                <B s={[0.62, 0.02, 0.46]} p={[0, 0.0, 0.2]} m={m.brass} />
                <mesh geometry={hipRoofGeo(0.5, 0.34, 0.3, 0.14, 0.08)} material={m.teak} position={[0, 0.08, 0.2]} />
            </group>
            {/* soft interior glow */}
            <B s={[0.5, 0.02, 0.34]} p={[0, 0.27, 0]} m={m.maroon} />
        </group>
    );
}

export function Envelopes({ p, ry = 0 }: { p: Vec3; ry?: number }) {
    const m = useMats();
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <C rt={0.26} rb={0.22} h={0.04} p={[0, 0.02, 0]} m={m.brass} seg={24} />
            {[0, 1, 2].map((i) => (
                <group key={i} position={[(i - 1) * 0.05, 0.05 + i * 0.012, (i - 1) * 0.03]} rotation={[0, (i - 1) * 0.35, 0]}>
                    <B s={[0.3, 0.008, 0.17]} p={[0, 0, 0]} m={m.ivory} />
                    <B s={[0.05, 0.01, 0.17]} p={[0, 0.002, 0]} m={m.gold} />
                </group>
            ))}
        </group>
    );
}

export function Vase({ p }: { p: Vec3 }) {
    const m = useMats();
    return (
        <group position={p}>
            <C rt={0.06} rb={0.09} h={0.22} p={[0, 0.11, 0]} m={m.brass} seg={14} />
            <ShrubCards p={[0, 0.18, 0]} size={0.36} />
            {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[Math.cos(i * 1.3) * 0.1, 0.38 + (i % 2) * 0.04, Math.sin(i * 1.3) * 0.1]} material={m.ivory}>
                    <sphereGeometry args={[0.025, 6, 5]} />
                </mesh>
            ))}
        </group>
    );
}

/** Lontar manuscript bundle on a low lectern (dhampar). */
export function Lectern({ p, ry = 0 }: { p: Vec3; ry?: number }) {
    const m = useMats();
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <B s={[1.0, 0.5, 0.6]} p={[0, 0.25, 0]} m={m.teak} />
            <B s={[0.9, 0.36, 0.02]} p={[0, 0.27, 0.305]} m={m.carving} />
            <B s={[1.04, 0.05, 0.64]} p={[0, 0.52, 0]} m={m.brass} />
            <group position={[0, 0.6, 0]} rotation={[-0.32, 0, 0]}>
                <B s={[0.9, 0.04, 0.42]} p={[0, 0, 0]} m={m.teakDark} />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <B key={i} s={[0.78, 0.008, 0.045]} p={[0, 0.03 + i * 0.006, -0.15 + i * 0.06]} m={m.paper} />
                ))}
            </group>
        </group>
    );
}

/** Blencong — the brass oil lamp of wayang performances. */
export function Blencong({ p }: { p: Vec3 }) {
    const m = useMats();
    return (
        <group position={p}>
            <C rt={0.02} h={1.6} p={[0, 0.8, 0]} m={m.brass} seg={6} />
            <C rt={0.18} rb={0.1} h={0.08} p={[0, 0.04, 0]} m={m.brass} seg={12} />
            <mesh position={[0, 1.64, 0]} material={m.brass} scale={[1.4, 0.6, 0.8]}>
                <sphereGeometry args={[0.1, 12, 8]} />
            </mesh>
            <mesh position={[0.16, 1.68, 0]} material={m.lanternGlass}>
                <sphereGeometry args={[0.035, 8, 6]} />
            </mesh>
        </group>
    );
}

/** Gunungan — the tree-of-life / mountain silhouette that opens and closes a wayang story. */
export function Gunungan({ p, h = 2.2, ry = 0 }: { p: Vec3; h?: number; ry?: number }) {
    const m = useMats();
    const geo = useMemo(() => {
        const w = h * 0.62;
        const s = new THREE.Shape();
        s.moveTo(-w / 2, 0);
        s.lineTo(w / 2, 0);
        s.bezierCurveTo(w * 0.62, h * 0.28, w * 0.38, h * 0.62, 0, h);
        s.bezierCurveTo(-w * 0.38, h * 0.62, -w * 0.62, h * 0.28, -w / 2, 0);
        const g = new THREE.ExtrudeGeometry(s, {
            depth: 0.04,
            bevelEnabled: true,
            bevelSize: 0.02,
            bevelThickness: 0.01,
            bevelSegments: 1,
            curveSegments: 18,
        });
        return g;
    }, [h]);
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <mesh geometry={geo} material={m.carvingDark} scale={[1.06, 1.03, 1]} position={[0, -0.02, -0.02]} />
            <mesh geometry={geo} material={m.carving} />
            <B s={[h * 0.32, 0.1, 0.12]} p={[0, 0.05, 0.02]} m={m.brass} />
        </group>
    );
}

/** Small limasan pavilion (4 or 6 pillars + hip roof), used at the reception and story room. */
export function Limasan({
    p,
    w,
    d,
    h = 2.9,
    ry = 0,
    platform = 0.3,
    floor = 'tile',
    steps = true,
}: {
    p: Vec3;
    w: number;
    d: number;
    h?: number;
    ry?: number;
    platform?: number;
    floor?: 'tile' | 'planks' | 'stone';
    steps?: boolean;
}) {
    const m = useMats();
    const pillars: Vec3[] = [];
    const nx = w > 6 ? 3 : 2;
    for (let i = 0; i < nx; i++) {
        const x = -w / 2 + 0.3 + (i * (w - 0.6)) / (nx - 1);
        pillars.push([x, platform, d / 2 - 0.3], [x, platform, -d / 2 + 0.3]);
    }
    return (
        <group position={p} rotation={[0, ry, 0]}>
            <Platform w={w + 0.6} d={d + 0.6} height={platform} floor={floor} coping={0.15} />
            {steps && <Steps z={(d + 0.6) / 2} width={1.8} height={platform} treads={2} />}
            {pillars.map((pp, i) => (
                <Pillar key={i} p={pp} h={h} w={0.22} m={m.teakV} />
            ))}
            <BeamRing w={w - 0.6} d={d - 0.6} y={platform + h - 0.1} t={0.16} h={0.2} m={m.teak} />
            <RoofLayer
                bw={w + 1.6}
                bd={d + 1.6}
                tw={w * 0.42}
                td={0.2}
                h={Math.min(w, d) * 0.42}
                y={platform + h + 0.04}
                top={m.roof}
                under={m.ceiling}
                ridge
            />
            <B s={[w * 0.44, 0.12, 0.24]} p={[0, platform + h + Math.min(w, d) * 0.42 + 0.04, 0]} m={m.teakDark} />
        </group>
    );
}
