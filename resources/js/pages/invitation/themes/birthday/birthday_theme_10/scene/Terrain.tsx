import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { toyAssets } from '../lib/assets';
import { seededRandom } from '../lib/math';
import { DESTINATIONS, PLAZA, ROAD_WIDTH } from '../lib/world';
import { useSafeTexture } from './core/criticalTextures';
import { islandPolygon, nearestRoadPoint, ROAD_LENGTH, roadCurve } from './core/curves';
import { cylinder, roundedBox } from './core/geometry';
import { palette } from './core/materials';

/** Thick, bevelled island: grass maps from the asset pack on top, sandy rounded edge into the sea. */
export function Island() {
    const gl = useThree((s) => s.gl);
    const color = useSafeTexture(toyAssets.textures.grassColor);
    const normal = useSafeTexture(toyAssets.textures.grassNormal);
    const roughness = useSafeTexture(toyAssets.textures.grassRoughness);

    const materials = useMemo(() => {
        const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
        for (const t of [color, normal, roughness]) {
            if (!t) continue;
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.set(0.3, 0.3);
            t.anisotropy = aniso;
        }
        if (color) color.colorSpace = THREE.SRGBColorSpace;
        if (normal) normal.colorSpace = THREE.NoColorSpace;
        if (roughness) roughness.colorSpace = THREE.NoColorSpace;
        // Each map is optional: a missing file degrades to a flat painted-grass colour.
        const grass = new THREE.MeshStandardMaterial({
            map: color,
            normalMap: normal,
            normalScale: new THREE.Vector2(0.45, 0.45),
            roughnessMap: roughness,
            roughness: roughness ? 1 : 0.92,
            color: color ? '#f2fff0' : '#72d38a',
        });
        const sand = new THREE.MeshStandardMaterial({ color: palette.sand, roughness: 0.92 });
        return [grass, sand];
    }, [color, normal, roughness, gl]);

    const geometry = useMemo(() => {
        const shape = new THREE.Shape(islandPolygon.map(([x, z]) => new THREE.Vector2(x, -z)));
        const depth = 1.2;
        const bevel = 0.42;
        const g = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: 0.8,
            bevelSegments: 5,
            curveSegments: 4,
        });
        g.rotateX(-Math.PI / 2);
        g.translate(0, -(depth + bevel), 0); // top cap at y = 0
        return g;
    }, []);

    return <mesh geometry={geometry} material={materials} receiveShadow />;
}

function createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = palette.road;
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = '#ead09a';
    ctx.fillRect(0, 0, 12, 256);
    ctx.fillRect(116, 0, 12, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(14, 0, 4, 256);
    ctx.fillRect(110, 0, 4, 256);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(58, 40, 12, 120, 6);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    return texture;
}

/** Flat ribbon that follows a closed curve (used for the ring road). */
function buildRibbon(curve: THREE.Curve<THREE.Vector3>, width: number, y: number, segments: number, length: number) {
    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        curve.getPointAt(u % 1, p);
        curve.getTangentAt(u % 1, t);
        const nx = -t.z;
        const nz = t.x;
        const len = Math.hypot(nx, nz) || 1;
        const hx = (nx / len) * (width / 2);
        const hz = (nz / len) * (width / 2);
        positions.push(p.x + hx, y, p.z + hz, p.x - hx, y, p.z - hz);
        normals.push(0, 1, 0, 0, 1, 0);
        const v = (u * length) / 3.2;
        uvs.push(0, v, 1, v);
        if (i < segments) {
            const a = i * 2;
            indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    g.computeBoundingSphere();
    return g;
}

export function Road() {
    const texture = useMemo(createRoadTexture, []);
    const geometry = useMemo(() => buildRibbon(roadCurve, ROAD_WIDTH, 0.025, 640, ROAD_LENGTH), []);
    return (
        <mesh geometry={geometry} receiveShadow>
            <meshStandardMaterial
                map={texture}
                roughness={0.88}
                side={THREE.DoubleSide}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
            />
        </mesh>
    );
}

/** Alternating coral/cream toy curbs along both road edges (one instanced draw call). */
export function RoadCurbs() {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const spacing = 0.64;
    const perSide = Math.floor(ROAD_LENGTH / spacing);
    const count = perSide * 2;
    const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.5 }), []);

    useLayoutEffect(() => {
        const mesh = ref.current;
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3(1, 1, 1);
        const p = new THREE.Vector3();
        const t = new THREE.Vector3();
        const c = new THREE.Color();
        const coral = new THREE.Color(palette.coral);
        const cream = new THREE.Color(palette.white);
        for (let i = 0; i < perSide; i++) {
            const u = i / perSide;
            roadCurve.getPointAt(u, p);
            roadCurve.getTangentAt(u, t);
            const yaw = Math.atan2(t.x, t.z);
            q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, yaw);
            const nx = -t.z;
            const nz = t.x;
            const len = Math.hypot(nx, nz) || 1;
            for (let side = 0; side < 2; side++) {
                const off = (side === 0 ? 1 : -1) * (ROAD_WIDTH / 2 + 0.14);
                m.compose(new THREE.Vector3(p.x + (nx / len) * off, 0.07, p.z + (nz / len) * off), q, s);
                const idx = i * 2 + side;
                mesh.setMatrixAt(idx, m);
                mesh.setColorAt(idx, c.copy(i % 2 === 0 ? coral : cream));
            }
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [perSide]);

    return <instancedMesh ref={ref} args={[roundedBox(0.24, 0.14, 0.56, 0.06), material, count]} receiveShadow castShadow={false} />;
}

/** Stepping-stone paths from the road to each destination. */
export function SteppingStones() {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const stones = useMemo(() => {
        const rand = seededRandom(77);
        const list: { x: number; z: number; r: number; color: string }[] = [];
        const targets: [number, number, number][] = [
            [DESTINATIONS.profile.center[0], DESTINATIONS.profile.center[1], 4.4],
            [DESTINATIONS.party.center[0], DESTINATIONS.party.center[1], 3.9],
            [DESTINATIONS.gallery.center[0], DESTINATIONS.gallery.center[1], 3.7],
            [DESTINATIONS.plaza.center[0], DESTINATIONS.plaza.center[1], PLAZA.radius + 0.2],
        ];
        const colors = [palette.stone, '#f6e9d6', '#e7dcf7', '#fbe3c4'];
        for (const [cx, cz, radius] of targets) {
            const [rx, rz] = nearestRoadPoint(cx, cz);
            const dx = cx - rx;
            const dz = cz - rz;
            const dist = Math.hypot(dx, dz);
            const ux = dx / dist;
            const uz = dz / dist;
            const start = ROAD_WIDTH / 2 + 0.55;
            const end = dist - radius;
            for (let d = start; d < end; d += 0.72) {
                const side = (rand() - 0.5) * 0.35;
                list.push({
                    x: rx + ux * d - uz * side,
                    z: rz + uz * d + ux * side,
                    r: 0.26 + rand() * 0.08,
                    color: colors[Math.floor(rand() * colors.length)],
                });
            }
        }
        return list;
    }, []);
    const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);

    useLayoutEffect(() => {
        const mesh = ref.current;
        const m = new THREE.Matrix4();
        const c = new THREE.Color();
        stones.forEach((s, i) => {
            m.makeScale(s.r / 0.3, 1, s.r / 0.3).setPosition(s.x, 0.035, s.z);
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, c.set(s.color));
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
    }, [stones]);

    return <instancedMesh ref={ref} args={[cylinder(0.3, 0.32, 0.07, 14), material, stones.length]} receiveShadow />;
}
