import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
    AdditiveBlending,
    BoxGeometry,
    Color,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PlaneGeometry,
    SRGBColorSpace,
} from 'three';
import { getVoxelMaterial } from './materials';
import { sharedUniforms } from './sharedUniforms';
import { loadTexture } from './textures';
import { POND } from './worldLayout';

const WIDTH = POND.maxX - POND.minX;
const DEPTH = POND.maxZ - POND.minZ;

/** Scrolls the material's map on the GPU using the shared (pausable) clock. */
function scrollingUv<T extends MeshStandardMaterial | MeshBasicMaterial>(material: T, [sx, sy]: [number, number]): T {
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = sharedUniforms.uTime;
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uTime;')
            .replace(
                '#include <uv_vertex>',
                `#include <uv_vertex>\n#ifdef USE_MAP\n  vMapUv += vec2(${sx.toFixed(4)}, ${sy.toFixed(4)}) * uTime;\n#endif`,
            );
    };
    material.customProgramCacheKey = () => `wt16-water-${sx}-${sy}`;
    return material;
}

/** Rim stones laid around the pond edge. */
function rimStones(): { x: number; z: number; long: boolean }[] {
    const stones: { x: number; z: number; long: boolean }[] = [];
    for (let x = POND.minX + 0.5; x < POND.maxX; x += 1) {
        stones.push({ x, z: POND.minZ - 0.25, long: true }, { x, z: POND.maxZ + 0.25, long: true });
    }
    for (let z = POND.minZ + 0.5; z < POND.maxZ; z += 1) {
        stones.push({ x: POND.minX - 0.25, z, long: false }, { x: POND.maxX + 0.25, z, long: false });
    }
    return stones;
}

/**
 * Small garden pond: the supplied water texture scrolls slowly while a second,
 * additive layer drifts the other way to create soft moving highlights.
 */
export function Pond() {
    const rimRef = useRef<InstancedMesh>(null);
    const waterRef = useRef<Mesh>(null);
    const glintRef = useRef<Mesh>(null);
    const stones = useMemo(() => rimStones(), []);

    const resources = useMemo(
        () => ({
            plane: new PlaneGeometry(WIDTH, DEPTH).rotateX(-Math.PI / 2),
            rimGeometry: new BoxGeometry(1, 0.24, 0.5),
            water: scrollingUv(
                new MeshStandardMaterial({
                    color: new Color().setRGB(0.25, 0.58, 0.68, SRGBColorSpace),
                    roughness: 0.18,
                    metalness: 0.05,
                }),
                [0.018, 0.007],
            ),
            glint: scrollingUv(
                new MeshBasicMaterial({ transparent: true, opacity: 0.22, blending: AdditiveBlending, depthWrite: false }),
                [-0.03, 0.012],
            ),
        }),
        [],
    );

    useEffect(() => {
        let cancelled = false;
        void loadTexture('water').then((texture) => {
            const water = waterRef.current?.material as MeshStandardMaterial | undefined;
            const glint = glintRef.current?.material as MeshBasicMaterial | undefined;
            if (!texture || cancelled || !water || !glint) return;
            water.map = texture.clone();
            water.map.repeat.set(WIDTH / 4, DEPTH / 4);
            water.color.set('#ffffff');
            water.needsUpdate = true;
            glint.map = texture.clone();
            glint.map.repeat.set(WIDTH / 2.6, DEPTH / 2.6);
            glint.needsUpdate = true;
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(
        () => () => {
            resources.plane.dispose();
            resources.rimGeometry.dispose();
            resources.water.dispose();
            resources.glint.dispose();
        },
        [resources],
    );

    useLayoutEffect(() => {
        const rim = rimRef.current;
        if (!rim) return;
        const m = new Matrix4();
        stones.forEach((s, i) => {
            m.makeRotationY(s.long ? 0 : Math.PI / 2).setPosition(s.x, 0.02, s.z);
            rim.setMatrixAt(i, m);
        });
        rim.instanceMatrix.needsUpdate = true;
        rim.computeBoundingSphere();
    }, [stones]);

    const cx = (POND.minX + POND.maxX) / 2;
    const cz = (POND.minZ + POND.maxZ) / 2;

    return (
        <group>
            <mesh ref={waterRef} geometry={resources.plane} material={resources.water} position={[cx, POND.waterY, cz]} receiveShadow />
            <mesh ref={glintRef} geometry={resources.plane} material={resources.glint} position={[cx, POND.waterY + 0.01, cz]} />
            <instancedMesh ref={rimRef} args={[resources.rimGeometry, getVoxelMaterial('stone_light'), stones.length]} castShadow receiveShadow />
        </group>
    );
}
