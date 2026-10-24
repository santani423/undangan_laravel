import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { toyAssets } from '../lib/assets';
import { SIGNPOSTS, type SignpostPlacement, type Vec2, type Vec3 } from '../lib/world';
import { cached, cylinder, mergeParts, roundedBox, sphere, torus, type Part } from './core/geometry';
import { getMaterials, palette } from './core/materials';
import { useCanvasTexture } from './core/textures';
import { ToyText } from './ToyText';

/* ------------------------------------------------------------ signposts */

const signpostGeometry = () =>
    cached('signpost', () =>
        mergeParts([
            { geometry: cylinder(0.07, 0.09, 1.9, 10), color: palette.wood, position: [0, 0.95, 0] },
            { geometry: torus(0.47, 0.06, Math.PI * 2, 10, 32), color: palette.coral, position: [0, 1.95, 0.0] },
            { geometry: cylinder(0.47, 0.47, 0.06, 32), color: palette.white, position: [0, 1.95, -0.02], rotation: [Math.PI / 2, 0, 0] },
            { geometry: roundedBox(1.25, 0.34, 0.08, 0.06), color: palette.butter, position: [0, 1.22, 0.03] },
            { geometry: roundedBox(0.36, 0.08, 0.36, 0.03), color: palette.woodDark, position: [0, 0.04, 0] },
        ]),
    );

function Signpost({ sign }: { sign: SignpostPlacement }) {
    const texture = useCanvasTexture(toyAssets.illustrations[sign.illustration], {
        width: 256,
        height: 256,
        fit: 'contain',
        padding: 0.1,
        circle: true,
        background: '#fff8ea',
    });
    return (
        <group position={[sign.pos[0], 0, sign.pos[1]]} rotation-y={sign.rotation}>
            <mesh geometry={signpostGeometry()} material={getMaterials().toyMatte} castShadow receiveShadow />
            {texture && (
                <mesh position={[0, 1.95, 0.016]}>
                    <circleGeometry args={[0.43, 32]} />
                    <meshStandardMaterial map={texture} roughness={0.7} />
                </mesh>
            )}
            <ToyText position={[0, 1.22, 0.08]} fontSize={0.17} color={palette.ink} maxWidth={1.15}>
                {sign.label}
            </ToyText>
        </group>
    );
}

export function Signposts() {
    return (
        <group>
            {SIGNPOSTS.map((s) => (
                <Signpost key={s.label} sign={s} />
            ))}
        </group>
    );
}

/* ----------------------------------------------------------- lamp posts */

const lampGeometry = () =>
    cached('lamp', () =>
        mergeParts([
            { geometry: cylinder(0.2, 0.26, 0.2, 14), color: palette.lavenderDeep, position: [0, 0.1, 0] },
            { geometry: cylinder(0.06, 0.07, 2.4, 10), color: palette.lavender, position: [0, 1.3, 0] },
            { geometry: torus(0.1, 0.03, Math.PI * 2, 6, 16), color: palette.butterDeep, position: [0, 2.48, 0], rotation: [Math.PI / 2, 0, 0] },
            { geometry: cylinder(0.24, 0.12, 0.16, 16), color: palette.lavenderDeep, position: [0, 2.98, 0] },
        ]),
    );

export function LampPosts({ positions }: { positions: Vec3[] }) {
    const mats = getMaterials();
    return (
        <group>
            {positions.map((p, i) => (
                <group key={i} position={p}>
                    <mesh geometry={lampGeometry()} material={mats.toySatin} castShadow />
                    <mesh geometry={sphere(0.22, 16, 12)} material={mats.glow} position={[0, 2.72, 0]} />
                </group>
            ))}
        </group>
    );
}

/* ---------------------------------------------------------- picket fence */

const FENCE_SEGMENT = 1.2;
const fenceGeometry = () =>
    cached('fence', () => {
        const parts: Part[] = [
            { geometry: roundedBox(FENCE_SEGMENT, 0.1, 0.07, 0.03), color: palette.white, position: [0, 0.32, 0] },
            { geometry: roundedBox(FENCE_SEGMENT, 0.1, 0.07, 0.03), color: palette.white, position: [0, 0.68, 0] },
        ];
        for (let i = 0; i < 4; i++) {
            const x = -FENCE_SEGMENT / 2 + 0.15 + i * 0.3;
            parts.push({ geometry: roundedBox(0.16, 0.86, 0.06, 0.05), color: i % 2 ? palette.white : '#fff2dc', position: [x, 0.43, 0.04] });
            parts.push({ geometry: sphere(0.08, 10, 6), color: i % 2 ? palette.white : '#fff2dc', position: [x, 0.86, 0.04], scale: [1, 0.7, 0.4] });
        }
        return mergeParts(parts);
    });

/** Picket fence runs (lists of [x, z] points) as a single instanced mesh. */
export function PicketFence({ runs }: { runs: Vec2[][] }) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const segments = useMemo(() => {
        const list: { x: number; z: number; yaw: number }[] = [];
        for (const run of runs) {
            for (let i = 0; i < run.length - 1; i++) {
                const [ax, az] = run[i];
                const [bx, bz] = run[i + 1];
                const len = Math.hypot(bx - ax, bz - az);
                const n = Math.max(1, Math.round(len / FENCE_SEGMENT));
                const yaw = Math.atan2(-(bz - az), bx - ax);
                for (let k = 0; k < n; k++) {
                    const t = (k + 0.5) / n;
                    list.push({ x: ax + (bx - ax) * t, z: az + (bz - az) * t, yaw });
                }
            }
        }
        return list;
    }, [runs]);

    useLayoutEffect(() => {
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3(1, 1, 1);
        const p = new THREE.Vector3();
        const white = new THREE.Color(1, 1, 1);
        segments.forEach((seg, i) => {
            q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, seg.yaw);
            ref.current.setMatrixAt(i, m.compose(p.set(seg.x, 0, seg.z), q, s));
            ref.current.setColorAt(i, white);
        });
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
        ref.current.computeBoundingSphere();
    }, [segments]);

    return <instancedMesh ref={ref} args={[fenceGeometry(), getMaterials().toyMatteInstanced, segments.length]} castShadow receiveShadow />;
}

/* ---------------------------------------------------------------- bench */

const benchGeometry = () =>
    cached('bench', () =>
        mergeParts([
            { geometry: roundedBox(1.5, 0.1, 0.46, 0.04), color: palette.wood, position: [0, 0.45, 0] },
            { geometry: roundedBox(1.5, 0.36, 0.08, 0.04), color: palette.wood, position: [0, 0.76, -0.22], rotation: [-0.12, 0, 0] },
            { geometry: roundedBox(0.1, 0.45, 0.42, 0.04), color: palette.mintDeep, position: [-0.62, 0.22, 0] },
            { geometry: roundedBox(0.1, 0.45, 0.42, 0.04), color: palette.mintDeep, position: [0.62, 0.22, 0] },
        ]),
    );

export function Bench({ position, rotation = 0 }: { position: Vec3; rotation?: number }) {
    return <mesh geometry={benchGeometry()} material={getMaterials().toyMatte} position={position} rotation-y={rotation} castShadow receiveShadow />;
}

/* ------------------------------------------------------------ flag pole */

const pennantGeometry = (color: string) =>
    cached(`pennant:${color}`, () => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.22, 0, 0, -0.22, 0, 0.7, 0, 0], 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0.5], 2));
        g.computeVertexNormals();
        return mergeParts([{ geometry: g, color, wind: (p) => Math.min(1, p.x / 0.7) }]);
    });

/** Small pennant flag whose free end flutters with the shared wind. */
export function Pennant({ position, color = palette.coral, height = 0.9 }: { position: Vec3; color?: string; height?: number }) {
    const mats = getMaterials();
    return (
        <group position={position}>
            <mesh geometry={cylinder(0.025, 0.025, height, 6)} material={mats.toyMatte} position={[0, height / 2, 0]} />
            <mesh geometry={pennantGeometry(color)} material={mats.flags} position={[0.02, height - 0.24, 0]} castShadow />
        </group>
    );
}
