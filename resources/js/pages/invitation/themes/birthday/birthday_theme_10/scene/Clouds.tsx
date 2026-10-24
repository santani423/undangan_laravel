import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seededRandom } from '../lib/math';
import { cached, mergeParts, sphere, type Part } from './core/geometry';
import { windUniforms } from './core/wind';

const cloudGeometry = () =>
    cached('cloud', () => {
        const rand = seededRandom(5);
        const parts: Part[] = [];
        const puffs = 7;
        for (let i = 0; i < puffs; i++) {
            const x = (i / (puffs - 1) - 0.5) * 6;
            const r = 1.3 + Math.sin((i / (puffs - 1)) * Math.PI) * 1.2 + rand() * 0.3;
            parts.push({ geometry: sphere(1, 16, 12), color: '#ffffff', position: [x, r * 0.35, (rand() - 0.5) * 1.2], scale: r });
        }
        parts.push({ geometry: sphere(1, 16, 10), color: '#f1f6ff', position: [0, 0.2, 0], scale: [3.6, 0.9, 1.6] });
        return mergeParts(parts);
    });

const BOX = { minX: -110, maxX: 110, minZ: -170, maxZ: 70 };

/** Puffy clouds drifting slowly with the shared wind direction (wrap around the island). */
export function Clouds({ count, animate }: { count: number; animate: boolean }) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const material = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#eef4ff', emissiveIntensity: 0.35, vertexColors: true }),
        [],
    );
    const clouds = useMemo(() => {
        const rand = seededRandom(21);
        return Array.from({ length: count }, () => ({
            x: BOX.minX + rand() * (BOX.maxX - BOX.minX),
            z: BOX.minZ + rand() * (BOX.maxZ - BOX.minZ),
            y: 20 + rand() * 12,
            s: 0.8 + rand() * 0.9,
            yaw: (rand() - 0.5) * 0.6,
            speed: 0.6 + rand() * 0.5,
        }));
    }, [count]);
    const m = useMemo(() => new THREE.Matrix4(), []);
    const q = useMemo(() => new THREE.Quaternion(), []);
    const v = useMemo(() => new THREE.Vector3(), []);
    const s = useMemo(() => new THREE.Vector3(), []);

    const write = () => {
        clouds.forEach((c, i) => {
            q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, c.yaw);
            m.compose(v.set(c.x, c.y, c.z), q, s.set(c.s, c.s * 0.8, c.s));
            ref.current.setMatrixAt(i, m);
        });
        ref.current.instanceMatrix.needsUpdate = true;
    };

    useLayoutEffect(() => {
        write();
        ref.current.computeBoundingSphere();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clouds]);

    useFrame((_, dt) => {
        if (!animate) return;
        const d = windUniforms.uWindDir.value;
        for (const c of clouds) {
            c.x += d.x * c.speed * dt;
            c.z += d.y * c.speed * dt;
            if (c.x > BOX.maxX) c.x = BOX.minX;
            if (c.x < BOX.minX) c.x = BOX.maxX;
            if (c.z > BOX.maxZ) c.z = BOX.minZ;
            if (c.z < BOX.minZ) c.z = BOX.maxZ;
        }
        write();
    });

    return <instancedMesh ref={ref} args={[cloudGeometry(), material, count]} frustumCulled={false} />;
}
