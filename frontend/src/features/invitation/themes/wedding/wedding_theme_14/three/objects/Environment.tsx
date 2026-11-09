import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { journey } from '../../lib/journey';
import { PATHS, WORLD } from '../../lib/world';
import { boxGeo, cylGeo, mulberry32, planeGeo } from '../geometry';
import { skyUniforms } from '../lightingState';
import { useMats } from '../materials';
import { StaticBatch } from '../StaticBatch';
import { B } from './primitives';

/* ───────────── sky ───────────── */

const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`;
const skyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uStars;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453); }
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.38)) : mix(uHorizon, uBottom, pow(clamp(-h, 0.0, 1.0), 0.4));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSunColor * (pow(s, 420.0) * 1.6 + pow(s, 28.0) * 0.22 + pow(s, 4.0) * 0.08);
  if (uStars > 0.001 && h > 0.05) {
    vec2 uv = vec2(atan(d.z, d.x) * 90.0, asin(clamp(d.y, -1.0, 1.0)) * 90.0);
    vec2 id = floor(uv);
    float r = hash(id);
    vec2 f = fract(uv) - 0.5;
    float star = step(0.985, r) * smoothstep(0.32, 0.0, length(f)) * smoothstep(0.05, 0.4, h);
    col += vec3(1.0, 0.95, 0.85) * star * uStars * (0.6 + 0.4 * hash(id + 3.1));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function Sky() {
    const ref = useRef<THREE.Mesh>(null);
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: skyVertex,
                fragmentShader: skyFragment,
                uniforms: skyUniforms,
                side: THREE.BackSide,
                depthWrite: false,
                fog: false,
            }),
        [],
    );
    const camera = useThree((s) => s.camera);
    useFrame(() => {
        ref.current?.position.copy(camera.position);
    });
    return (
        <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
            <sphereGeometry args={[480, 32, 16]} />
        </mesh>
    );
}

/* ───────────── distant mountains (silhouettes, coloured by the sky each frame) ───────────── */

function ridgeGeometry(radius: number, seed: number, base: number, amp: number, peaks: { angle: number; height: number; width: number }[]) {
    const rnd = mulberry32(seed);
    const seg = 160;
    const pos: number[] = [];
    const heights: number[] = [];
    for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        let hgt = base + amp * (0.5 + 0.5 * Math.sin(a * 3 + rnd() * 0.2) * Math.sin(a * 7.3 + 1.3)) + rnd() * amp * 0.15;
        for (const p of peaks) {
            let da = Math.abs(a - p.angle);
            da = Math.min(da, Math.PI * 2 - da);
            hgt += p.height * Math.max(0, 1 - da / p.width) ** 1.6;
        }
        heights.push(hgt);
    }
    for (let i = 0; i < seg; i++) {
        const a0 = (i / seg) * Math.PI * 2;
        const a1 = ((i + 1) / seg) * Math.PI * 2;
        const x0 = Math.sin(a0) * radius;
        const z0 = Math.cos(a0) * radius;
        const x1 = Math.sin(a1) * radius;
        const z1 = Math.cos(a1) * radius;
        pos.push(x0, -2, z0, x1, -2, z1, x1, heights[i + 1], z1);
        pos.push(x0, -2, z0, x1, heights[i + 1], z1, x0, heights[i], z0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
}

export function Mountains() {
    const m = useMats();
    // Volcano (Merapi-like cone) to the south-east — visible from the garden and the closing shot.
    const near = useMemo(
        () =>
            ridgeGeometry(300, 4, 6, 18, [
                { angle: Math.PI * 0.78, height: 95, width: 0.22 },
                { angle: Math.PI * 0.6, height: 30, width: 0.25 },
            ]),
        [],
    );
    const far = useMemo(
        () =>
            ridgeGeometry(360, 9, 14, 26, [
                { angle: Math.PI * 1.15, height: 70, width: 0.3 },
                { angle: Math.PI * 0.95, height: 55, width: 0.2 },
            ]),
        [],
    );
    const c = useMemo(() => new THREE.Color(), []);
    useFrame(() => {
        const top = skyUniforms.uTop.value as THREE.Color;
        const hor = skyUniforms.uHorizon.value as THREE.Color;
        m.mountain.color.copy(c.copy(hor).lerp(top, 0.35).multiplyScalar(0.78));
        m.mountainFar.color.copy(c.copy(hor).lerp(top, 0.18).multiplyScalar(0.9));
    });
    return (
        <group position={[0, 0, -30]}>
            <mesh geometry={far} material={m.mountainFar} renderOrder={-9} />
            <mesh geometry={near} material={m.mountain} renderOrder={-8} />
        </group>
    );
}

/* ───────────── ground, paths, beds ───────────── */

interface PaverSpec {
    x: number;
    z: number;
    w: number;
    d: number;
    ry: number;
    h: number;
    tint: number;
}

/** Lay andesite pavers along every path polyline: two staggered courses, gravel bed showing in the joints. */
function layPavers(): {
    pavers: PaverSpec[];
    beds: { x: number; z: number; len: number; ang: number; w: number }[];
    landings: { x: number; z: number; r: number }[];
} {
    const rnd = mulberry32(404);
    const pavers: PaverSpec[] = [];
    const beds: { x: number; z: number; len: number; ang: number; w: number }[] = [];
    const landings: { x: number; z: number; r: number }[] = [];
    const joint = 0.035;
    for (const path of PATHS) {
        const pts = path.points;
        for (let i = 0; i < pts.length - 1; i++) {
            const [ax, az] = pts[i];
            const [bx, bz] = pts[i + 1];
            const len = Math.hypot(bx - ax, bz - az);
            const ang = Math.atan2(bx - ax, bz - az);
            const dx = (bx - ax) / len;
            const dz = (bz - az) / len;
            beds.push({ x: (ax + bx) / 2, z: (az + bz) / 2, len: len + (i < pts.length - 2 ? path.width * 0.5 : 0), ang, w: path.width + 0.3 });
            // leave a landing at bends: one large round flagstone instead of overlapping courses
            const s0 = i > 0 ? path.width * 0.55 : 0;
            const s1 = i < pts.length - 2 ? len - path.width * 0.55 : len;
            if (i > 0) landings.push({ x: ax, z: az, r: path.width * 0.5 });
            const cols = Math.max(2, Math.round(path.width / 0.55));
            const cw = path.width / cols;
            for (let c = 0; c < cols; c++) {
                const across = -path.width / 2 + cw * (c + 0.5);
                let s = s0 + (c % 2 ? 0.22 : 0);
                while (s < s1 - 0.12) {
                    const pl = Math.min(0.32 + rnd() * 0.22, s1 - s);
                    const mid = s + pl / 2;
                    pavers.push({
                        x: ax + dx * mid + dz * across,
                        z: az + dz * mid - dx * across,
                        w: cw - joint,
                        d: pl - joint,
                        ry: ang + (rnd() - 0.5) * 0.04,
                        h: 0.07 + (rnd() - 0.5) * 0.012,
                        tint: 0.82 + rnd() * 0.3,
                    });
                    s += pl;
                }
            }
        }
    }
    // forecourt in front of the gate: a square-paved apron
    for (let gx = -4.2; gx <= 4.2; gx += 0.6)
        for (let gz = 1.85; gz <= 6.2; gz += 0.6) {
            if (Math.abs(gx) < 1.6) continue; // the main path runs through the middle
            pavers.push({ x: gx, z: gz, w: 0.56, d: 0.56, ry: (rnd() - 0.5) * 0.03, h: 0.07, tint: 0.85 + rnd() * 0.25 });
        }
    return { pavers, beds, landings };
}

function Pavers() {
    const m = useMats();
    const ref = useRef<THREE.InstancedMesh>(null);
    const data = useMemo(() => layPavers(), []);
    const geo = useMemo(() => boxGeo(1, 1, 1), []);
    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh) return;
        const mat = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const e = new THREE.Euler();
        const v = new THREE.Vector3();
        const sc = new THREE.Vector3();
        const c = new THREE.Color();
        data.pavers.forEach((p, i) => {
            // top surface at y = h/2 + 0.012 above ground; the rest is bedded below grade (never floating)
            q.setFromEuler(e.set(0, p.ry, 0));
            mat.compose(v.set(p.x, p.h / 2 - p.h * 0.62 + 0.035, p.z), q, sc.set(p.w, p.h, p.d));
            mesh.setMatrixAt(i, mat);
            mesh.setColorAt(i, c.setScalar(p.tint));
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [data]);
    return (
        <group>
            <instancedMesh ref={ref} args={[geo, m.paver, data.pavers.length]} receiveShadow />
            <StaticBatch castShadow={false}>
                {data.beds.map((b, i) => (
                    <mesh key={i} geometry={planeGeo(b.w, b.len)} material={m.pathBed} position={[b.x, 0.004, b.z]} rotation={[0, b.ang, 0]} />
                ))}
                <mesh geometry={planeGeo(9.6, 6.4)} material={m.pathBed} position={[0, 0.0045, 3.55]} />
                {data.landings.map((l, i) => (
                    <mesh key={`l${i}`} geometry={cylGeo(l.r, l.r * 1.04, 0.1, 18)} material={m.paver} position={[l.x, 0.02, l.z]} />
                ))}
            </StaticBatch>
        </group>
    );
}

/** Raised planter bed: brick edging, soil, jasmine planted by the vegetation layer. */
function Planter({ x, z, w, d, r }: { x: number; z: number; w: number; d: number; r: number }) {
    const m = useMats();
    return (
        <group position={[x, 0, z]} rotation={[0, r, 0]}>
            <mesh geometry={planeGeo(w, d)} material={m.soil} position={[0, 0.07, 0]} />
            <B s={[w + 0.24, 0.14, 0.12]} p={[0, 0.05, d / 2 + 0.06]} m={m.brick} />
            <B s={[w + 0.24, 0.14, 0.12]} p={[0, 0.05, -d / 2 - 0.06]} m={m.brick} />
            <B s={[d, 0.14, 0.12]} p={[w / 2 + 0.06, 0.05, 0]} r={[0, Math.PI / 2, 0]} m={m.brick} />
            <B s={[d, 0.14, 0.12]} p={[-w / 2 - 0.06, 0.05, 0]} r={[0, Math.PI / 2, 0]} m={m.brick} />
            <B s={[w, 0.05, d]} p={[0, 0.02, 0]} m={m.stoneDark} />
        </group>
    );
}

export const PLANTERS: [number, number, number, number, number][] = [
    [22, -33, 3.2, 1.6, 0.6],
    [27.5, -28.5, 2.6, 1.4, -0.3],
    [24, -43.5, 3.4, 1.5, 0.9],
    [38, -47, 3, 1.6, 0.2],
];

/** Pond with a rim of individually placed river stones (not a smooth torus). */
function Pond() {
    const m = useMats();
    const pond = WORLD.garden.pond;
    const R = WORLD.garden.pondRadius;
    const stones = useMemo(() => {
        const rnd = mulberry32(77);
        const n = 34;
        return Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2 + rnd() * 0.05;
            const rr = R + 0.1 + rnd() * 0.12;
            return {
                x: Math.cos(a) * rr,
                z: Math.sin(a) * rr,
                ry: -a + (rnd() - 0.5) * 0.3,
                w: 0.62 + rnd() * 0.25,
                h: 0.22 + rnd() * 0.12,
                d: 0.42 + rnd() * 0.15,
            };
        });
    }, [R]);
    return (
        <group position={[pond[0], 0, pond[2]]}>
            <StaticBatch>
                {stones.map((s, i) => (
                    <B key={i} s={[s.w, s.h, s.d]} p={[s.x, s.h / 2 - 0.05, s.z]} r={[0, s.ry, 0]} m={m.stoneDark} />
                ))}
            </StaticBatch>
            <mesh material={m.water} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[R + 0.05, 48]} />
            </mesh>
            {[
                [1.2, 0.8, 0.45],
                [-1.4, 0.4, 0.35],
                [0.4, -1.6, 0.4],
                [-0.6, 1.7, 0.3],
                [2.1, -0.9, 0.28],
            ].map(([x, z, r], i) => (
                <mesh key={i} material={m.lilyPad} position={[x, 0.062, z]} rotation={[-Math.PI / 2, 0, i]}>
                    <circleGeometry args={[r, 16, 0.3, Math.PI * 1.85]} />
                </mesh>
            ))}
        </group>
    );
}

export function Ground() {
    const m = useMats();
    return (
        <group>
            <mesh geometry={planeGeo(900, 900)} material={m.ground} position={[0, 0, -30]} receiveShadow />
            <Pavers />
            <StaticBatch>
                {PLANTERS.map(([x, z, w, d, r], i) => (
                    <Planter key={i} x={x} z={z} w={w} d={d} r={r} />
                ))}
            </StaticBatch>
            <Pond />
        </group>
    );
}

/* ───────────── drifting motes: pollen by day, fireflies at twilight ───────────── */

const moteVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aSeed;
varying float vTwinkle;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.21 + aSeed * 6.0) * 0.9;
  p.y += sin(uTime * 0.33 + aSeed * 11.0) * 0.35;
  p.z += cos(uTime * 0.17 + aSeed * 4.0) * 0.9;
  vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed) + aSeed * 20.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (60.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const moteFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * uOpacity * vTwinkle);
}
`;

export function Motes({
    count,
    bounds,
    color,
    size,
    opacity,
}: {
    count: number;
    bounds: [number, number, number, number, number, number];
    color: string;
    size: number;
    opacity: (progress: number) => number;
}) {
    const geo = useMemo(() => {
        const rnd = mulberry32(count * 13 + Math.round(bounds[0]));
        const pos = new Float32Array(count * 3);
        const seed = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = bounds[0] + rnd() * (bounds[1] - bounds[0]);
            pos[i * 3 + 1] = bounds[2] + rnd() * (bounds[3] - bounds[2]);
            pos[i * 3 + 2] = bounds[4] + rnd() * (bounds[5] - bounds[4]);
            seed[i] = rnd();
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
        return g;
    }, [count, bounds]);
    const mat = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: moteVertex,
                fragmentShader: moteFragment,
                uniforms: { uTime: { value: 0 }, uSize: { value: size }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        [color, size],
    );
    useFrame((_, dt) => {
        mat.uniforms.uTime.value += journey.reducedMotion ? dt * 0.2 : dt;
        mat.uniforms.uOpacity.value = opacity(journey.progress);
    });
    if (count <= 0) return null;
    return <points geometry={geo} material={mat} frustumCulled={false} />;
}
