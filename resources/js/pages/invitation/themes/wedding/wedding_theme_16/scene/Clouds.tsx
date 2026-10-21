import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshLambertMaterial } from 'three';
import { sharedUniforms } from './sharedUniforms';
import { mulberry32 } from './worldLayout';

interface CloudBlock {
    cloud: number;
    dx: number;
    dy: number;
    dz: number;
    sx: number;
    sy: number;
    sz: number;
}

interface Cloud {
    x: number;
    y: number;
    z: number;
    speed: number;
}

const SPAN = 360;

function buildClouds(count: number): { clouds: Cloud[]; blocks: CloudBlock[] } {
    const rand = mulberry32(99);
    const clouds: Cloud[] = [];
    const blocks: CloudBlock[] = [];
    for (let c = 0; c < count; c++) {
        clouds.push({ x: -SPAN / 2 + rand() * SPAN, y: 34 + rand() * 22, z: -170 + rand() * 210, speed: 0.6 + rand() * 0.8 });
        const pieces = 3 + Math.floor(rand() * 4);
        for (let p = 0; p < pieces; p++) {
            blocks.push({
                cloud: c,
                dx: (rand() - 0.5) * 14,
                dy: (rand() - 0.5) * 2,
                dz: (rand() - 0.5) * 7,
                sx: 6 + rand() * 9,
                sy: 1.6 + rand() * 1.6,
                sz: 4 + rand() * 5,
            });
        }
    }
    return { clouds, blocks };
}

/** Blocky clouds drifting slowly across the sky (one instanced draw call). */
export function Clouds({ count, animate }: { count: number; animate: boolean }) {
    const ref = useRef<InstancedMesh>(null);
    const { clouds, blocks } = useMemo(() => buildClouds(count), [count]);
    const resources = useMemo(
        () => ({
            geometry: new BoxGeometry(1, 1, 1),
            material: new MeshLambertMaterial({ color: '#ffffff', emissive: '#fff6ea', emissiveIntensity: 0.55, fog: false }),
        }),
        [],
    );
    const offsets = useRef<number[]>([]);

    useEffect(
        () => () => {
            resources.geometry.dispose();
            resources.material.dispose();
        },
        [resources],
    );

    const place = (mesh: InstancedMesh) => {
        const m = new Matrix4();
        blocks.forEach((b, i) => {
            const cloud = clouds[b.cloud];
            const raw = cloud.x + (offsets.current[b.cloud] ?? 0);
            const x = ((((raw + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;
            m.makeScale(b.sx, b.sy, b.sz).setPosition(x + b.dx, cloud.y + b.dy, cloud.z + b.dz);
            mesh.setMatrixAt(i, m);
        });
        mesh.instanceMatrix.needsUpdate = true;
    };

    useLayoutEffect(() => {
        if (ref.current) place(ref.current);
    });

    useFrame((_, delta) => {
        const mesh = ref.current;
        if (!mesh) return;
        const dusk = sharedUniforms.uDusk.value;
        const material = mesh.material as MeshLambertMaterial;
        material.color.lerpColors(DAY_TINT, DUSK_TINT, dusk);
        material.emissiveIntensity = 0.55 - dusk * 0.2;
        if (!animate) return;
        const dt = Math.min(delta, 0.1);
        clouds.forEach((cloud, i) => {
            offsets.current[i] = (offsets.current[i] ?? 0) + cloud.speed * dt;
        });
        place(mesh);
    });

    return <instancedMesh ref={ref} args={[resources.geometry, resources.material, blocks.length]} frustumCulled={false} />;
}

const DAY_TINT = new Color('#ffffff');
const DUSK_TINT = new Color('#ffc9ad');
