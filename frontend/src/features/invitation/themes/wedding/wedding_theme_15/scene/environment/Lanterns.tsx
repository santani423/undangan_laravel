import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../../lib/random';
import { sceneFx } from '../../lib/sceneFx';
import { nearCameraPath } from '../cameraPath';
import { buildGlowData, GlowPoints } from '../effects/GlowPoints';
import { lanternGeometry } from '../geometry';
import { Instanced, useDisposable, type InstanceItem } from '../Instanced';
import { FOCI, groundHeight, PATH_END_Z, pathX, type Vec3 } from '../layout';
import { clayMaterial } from '../materials';

interface LanternSpot {
    p: Vec3;
    warm: boolean;
    scale: number;
    /** Length of the hanging string above the lantern (0 = none). */
    hang: number;
    post?: { base: Vec3; dir: number };
}

/** Hanging lanterns belonging to set pieces (gate, arch, pavilion, wishing tree, platform, gallery). */
const SET_PIECE_LANTERNS: Array<Omit<LanternSpot, 'post'>> = [
    // Forest gate
    { p: [-1.2, 3.05, 3.1], warm: true, scale: 1, hang: 0.55 },
    { p: [0, 2.75, 3.1], warm: false, scale: 1.15, hang: 0.95 },
    { p: [1.2, 3.05, 3.1], warm: true, scale: 1, hang: 0.55 },
    // Ceremony arch
    { p: [-1.95, 1.55, -66], warm: true, scale: 0.95, hang: 0.2 },
    { p: [1.95, 1.55, -66], warm: true, scale: 0.95, hang: 0.2 },
    // Pavilion (around the roof edge)
    ...Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return { p: [FOCI.rsvp[0] + Math.cos(a) * 2.35, 2.25, FOCI.rsvp[2] + Math.sin(a) * 2.35] as Vec3, warm: i % 2 === 0, scale: 0.85, hang: 0.4 };
    }),
    // Wishing tree
    { p: [-1.9, 2.4, -113.2], warm: true, scale: 0.9, hang: 0.9 },
    { p: [2.1, 2.7, -113.6], warm: false, scale: 0.9, hang: 0.7 },
    { p: [0.6, 2.2, -112], warm: true, scale: 0.8, hang: 1.1 },
    // Gallery pavilion
    { p: [6.4, 2.4, -78.6], warm: true, scale: 0.9, hang: 0 },
    { p: [12.4, 2.4, -82.6], warm: false, scale: 0.9, hang: 0 },
];

function buildSpots(): LanternSpot[] {
    const rng = mulberry32(5);
    const spots: LanternSpot[] = SET_PIECE_LANTERNS.map((s) => ({ ...s }));
    // Set pieces plus the ceremony aisle (benches sit where path lanterns would).
    const avoid: Vec3[] = [...Object.values(FOCI), [0, 0, -56.5], [0, 0, -60.5]];
    let side = 1;
    for (let z0 = 19; z0 > PATH_END_Z + 3; z0 -= 6.2 + rng() * 1.6) {
        side *= -1;
        // Nudge the lantern (flip side, then slide along the path) until it is clear of set pieces and the resting camera.
        const options = [0, -1.5, 1.5, -3, 3].flatMap((dz) => [side, -side].map((sd) => [sd, z0 + dz] as const));
        const fit = options.find(([sd, z]) => {
            const bx = pathX(z) + sd * 1.75;
            return !avoid.some((f) => Math.hypot(f[0] - bx, f[2] - z) < 3.6) && !nearCameraPath(bx - sd * 0.42, z, 1.7);
        });
        if (!fit) continue;
        const [sd, z] = fit;
        const bx = pathX(z) + sd * 1.75;
        const by = groundHeight(bx, z);
        spots.push({ p: [bx - sd * 0.42, by + 1.62, z], warm: rng() < 0.7, scale: 1, hang: 0.24, post: { base: [bx, by, z], dir: -sd } });
    }
    return spots;
}

function postGeometry() {
    const pole = new THREE.CylinderGeometry(0.035, 0.05, 2.15, 6).translate(0, 1.075, 0);
    const arm = new THREE.CylinderGeometry(0.025, 0.025, 0.46, 5).rotateZ(Math.PI / 2).translate(0.21, 2.1, 0);
    const knob = new THREE.SphereGeometry(0.06, 8, 6).translate(0, 2.18, 0);
    return mergeGeometries([pole, arm, knob])!;
}

const WARM = new THREE.Color('#ffd27f');
const COOL = new THREE.Color('#ffc1d6');
const tmp = new THREE.Color();

export function Lanterns() {
    const spots = useMemo(buildSpots, []);
    const bodyRef = useRef<THREE.InstancedMesh>(null);
    const geos = useDisposable(() => {
        const list = {
            body: lanternGeometry(),
            cap: new THREE.CylinderGeometry(0.07, 0.1, 0.06, 10),
            post: postGeometry(),
        };
        return { ...list, dispose: () => Object.values(list).forEach((g) => g.dispose()) };
    }, []);
    const mats = useDisposable(() => {
        const list = {
            body: new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }),
            metal: clayMaterial({ color: '#6b5560', rimStrength: 0.25, roughness: 0.6 }),
            string: new THREE.LineBasicMaterial({ color: '#c9b9a0', transparent: true, opacity: 0.55 }),
        };
        return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) };
    }, []);

    const { bodies, caps, posts, halos, strings, phases } = useMemo(() => {
        const bodies: InstanceItem[] = [];
        const caps: InstanceItem[] = [];
        const posts: InstanceItem[] = [];
        const glow: Parameters<typeof buildGlowData>[0] = [];
        const lines: number[] = [];
        const phases: number[] = [];
        spots.forEach((s, i) => {
            bodies.push({ p: s.p, s: s.scale, c: s.warm ? WARM : COOL, ci: 1.6 });
            caps.push({ p: [s.p[0], s.p[1] + 0.22 * s.scale, s.p[2]], s: s.scale });
            caps.push({ p: [s.p[0], s.p[1] - 0.21 * s.scale, s.p[2]], s: s.scale * 0.8 });
            if (s.post) posts.push({ p: s.post.base, r: [0, s.post.dir > 0 ? 0 : Math.PI, 0] });
            if (s.hang > 0) lines.push(s.p[0], s.p[1] + 0.24 * s.scale, s.p[2], s.p[0], s.p[1] + 0.24 * s.scale + s.hang, s.p[2]);
            const phase = (i * 0.618) % 1;
            phases.push(phase);
            glow.push({ p: s.p, color: s.warm ? '#ffc56e' : '#ffb3cf', size: 1.7 * s.scale, intensity: 0.85, phase });
        });
        const strings = new THREE.BufferGeometry();
        strings.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
        return { bodies, caps, posts, halos: buildGlowData(glow), strings, phases };
    }, [spots]);

    // Gentle per-lantern flame flicker on the paper bodies.
    useFrame(({ clock }) => {
        const mesh = bodyRef.current;
        if (!mesh || !mesh.instanceColor || sceneFx.reducedMotion) return;
        const t = clock.elapsedTime;
        spots.forEach((s, i) => {
            const ph = phases[i] * 6.283;
            const f = 1.55 + Math.sin(t * 7.1 + ph) * 0.08 + Math.sin(t * 12.9 + ph * 2) * 0.05;
            mesh.setColorAt(i, tmp.copy(s.warm ? WARM : COOL).multiplyScalar(f));
        });
        mesh.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <Instanced meshRef={bodyRef} geometry={geos.body} material={mats.body} items={bodies} />
            <Instanced geometry={geos.cap} material={mats.metal} items={caps} />
            <Instanced geometry={geos.post} material={mats.metal} items={posts} />
            <lineSegments geometry={strings} material={mats.string} />
            <GlowPoints data={halos} flicker={0.12} fadeNear={34} fadeFar={64} />
        </group>
    );
}
