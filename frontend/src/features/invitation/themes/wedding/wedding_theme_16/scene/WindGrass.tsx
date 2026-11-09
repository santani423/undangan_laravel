import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshLambertMaterial, SRGBColorSpace } from 'three';
import { sharedUniforms } from './sharedUniforms';
import { POND, TERRAIN, insideAny, isInPond, mulberry32, pathXAt, propFootprints, terrainHeightAt } from './worldLayout';

const BLADE_HEIGHT = 0.42;

const BLADE_COLORS: [number, number, number][] = [
    [0.3, 0.55, 0.27],
    [0.47, 0.68, 0.34],
    [0.31, 0.56, 0.29],
    [0.52, 0.66, 0.3],
];

const FLOWER_COLORS: [number, number, number][] = [
    [0.96, 0.95, 0.91],
    [0.93, 0.65, 0.65],
    [0.78, 0.37, 0.42],
    [0.83, 0.61, 0.27],
    [0.98, 0.94, 0.85],
];

/**
 * Lambert material whose vertices bend with a shared, coherent wind field:
 * a travelling wave along the wind direction, slow gusts, and a little
 * per-tuft flutter. Bending grows with height², so roots stay planted.
 * Everything runs in the vertex shader — the CPU only advances `uTime`.
 */
function createWindMaterial(kind: 'blade' | 'flower'): MeshLambertMaterial {
    const material = new MeshLambertMaterial({ color: 0xffffff });
    material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = sharedUniforms.uTime;
        shader.uniforms.uWindDir = sharedUniforms.uWindDir;
        shader.uniforms.uWindStrength = sharedUniforms.uWindStrength;
        const heightExpr = kind === 'blade' ? `clamp(position.y / ${BLADE_HEIGHT.toFixed(3)}, 0.0, 1.0)` : '1.0';
        shader.vertexShader = shader.vertexShader
            .replace(
                '#include <common>',
                `#include <common>
        uniform float uTime;
        uniform vec2 uWindDir;
        uniform float uWindStrength;
        varying float vBladeHeight;`,
            )
            .replace(
                '#include <begin_vertex>',
                /* glsl */ `#include <begin_vertex>
        vec2 windBase = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        float windH = ${heightExpr};
        float gust = 0.55 + 0.45 * sin(uTime * 0.45 + windBase.x * 0.045 + windBase.y * 0.03);
        float wave = sin(uTime * 1.6 - dot(windBase, uWindDir) * 0.35);
        float flutter = sin(uTime * 3.4 + windBase.x * 1.7 + windBase.y * 1.3) * 0.22;
        float bend = (wave * 0.65 + flutter + 0.4) * gust * uWindStrength * windH * windH;
        transformed.xz += uWindDir * bend;
        transformed.y -= abs(bend) * 0.3 * windH;
        vBladeHeight = windH;`,
            );
        shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying float vBladeHeight;')
            .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(0.6, 1.12, vBladeHeight);');
    };
    material.customProgramCacheKey = () => `wt16-wind-${kind}`;
    return material;
}

interface Scatter {
    blades: Float32Array; // x, z, scaleY, scaleXZ
    bladeColors: Uint8Array;
    flowers: Float32Array; // x, y, z
    flowerColors: Uint8Array;
}

function scatterGrass(bladeCount: number, flowerCount: number): Scatter {
    const rand = mulberry32(7331);
    const blocked = propFootprints();
    const blades: number[] = [];
    const bladeColors: number[] = [];
    const flowers: number[] = [];
    const flowerColors: number[] = [];
    const flowerChance = Math.min(1, flowerCount / Math.max(1, bladeCount / 5));
    const { cell } = TERRAIN;

    let attempts = 0;
    while (blades.length / 4 < bladeCount && attempts < bladeCount * 2) {
        attempts++;
        const z = -84 + rand() * 118;
        const dx = (rand() * 2 - 1) * 12.4;
        if (Math.abs(dx) < 1.7) continue; // keep the stepping-stone path clear
        const x = pathXAt(z) + dx;
        if (isInPond(x, z) || (x > POND.minX - 0.5 && x < POND.maxX + 0.5 && z > POND.minZ - 0.5 && z < POND.maxZ + 0.5)) continue;
        const cx = Math.floor(x / cell) * cell + cell / 2;
        const cz = Math.floor(z / cell) * cell + cell / 2;
        if (terrainHeightAt(cx, cz) !== 0) continue;
        if (insideAny(x, z, blocked)) continue;

        const tuft = 3 + Math.floor(rand() * 5);
        let tallest = 0;
        const color = BLADE_COLORS[Math.floor(rand() * BLADE_COLORS.length)];
        for (let k = 0; k < tuft && blades.length / 4 < bladeCount; k++) {
            const sy = 0.55 + rand() * 0.7;
            tallest = Math.max(tallest, sy);
            blades.push(x + (rand() - 0.5) * 0.5, z + (rand() - 0.5) * 0.5, sy, 0.75 + rand() * 0.3);
            const shade = 0.88 + rand() * 0.2;
            bladeColors.push(color[0] * shade * 255, color[1] * shade * 255, color[2] * shade * 255);
        }
        if (flowers.length / 3 < flowerCount && rand() < flowerChance) {
            const c = FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)];
            flowers.push(x, BLADE_HEIGHT * tallest + 0.02, z);
            flowerColors.push(c[0] * 255, c[1] * 255, c[2] * 255);
        }
    }
    return {
        blades: Float32Array.from(blades),
        bladeColors: Uint8Array.from(bladeColors),
        flowers: Float32Array.from(flowers),
        flowerColors: Uint8Array.from(flowerColors),
    };
}

interface WindGrassProps {
    bladeCount: number;
    flowerCount: number;
    receiveShadow: boolean;
}

export function WindGrass({ bladeCount, flowerCount, receiveShadow }: WindGrassProps) {
    const bladesRef = useRef<InstancedMesh>(null);
    const flowersRef = useRef<InstancedMesh>(null);

    const scatter = useMemo(() => scatterGrass(bladeCount, flowerCount), [bladeCount, flowerCount]);
    const resources = useMemo(
        () => ({
            bladeGeometry: new BoxGeometry(0.06, BLADE_HEIGHT, 0.06, 1, 2, 1).translate(0, BLADE_HEIGHT / 2, 0),
            flowerGeometry: new BoxGeometry(0.1, 0.1, 0.1),
            bladeMaterial: createWindMaterial('blade'),
            flowerMaterial: createWindMaterial('flower'),
        }),
        [],
    );

    useEffect(
        () => () => {
            resources.bladeGeometry.dispose();
            resources.flowerGeometry.dispose();
            resources.bladeMaterial.dispose();
            resources.flowerMaterial.dispose();
        },
        [resources],
    );

    useLayoutEffect(() => {
        const blades = bladesRef.current;
        const flowers = flowersRef.current;
        if (!blades || !flowers) return;
        const m = new Matrix4();
        const color = new Color();
        const { blades: b, bladeColors: bc, flowers: f, flowerColors: fc } = scatter;

        for (let i = 0; i < b.length / 4; i++) {
            const sxz = b[i * 4 + 3];
            m.makeScale(sxz, b[i * 4 + 2], sxz).setPosition(b[i * 4], 0, b[i * 4 + 1]);
            blades.setMatrixAt(i, m);
            blades.setColorAt(i, color.setRGB(bc[i * 3] / 255, bc[i * 3 + 1] / 255, bc[i * 3 + 2] / 255, SRGBColorSpace));
        }
        blades.count = b.length / 4;
        blades.instanceMatrix.needsUpdate = true;
        if (blades.instanceColor) blades.instanceColor.needsUpdate = true;
        blades.computeBoundingSphere();

        for (let i = 0; i < f.length / 3; i++) {
            m.makeTranslation(f[i * 3], f[i * 3 + 1], f[i * 3 + 2]);
            flowers.setMatrixAt(i, m);
            flowers.setColorAt(i, color.setRGB(fc[i * 3] / 255, fc[i * 3 + 1] / 255, fc[i * 3 + 2] / 255, SRGBColorSpace));
        }
        flowers.count = f.length / 3;
        flowers.instanceMatrix.needsUpdate = true;
        if (flowers.instanceColor) flowers.instanceColor.needsUpdate = true;
        flowers.computeBoundingSphere();
    }, [scatter]);

    return (
        <>
            <instancedMesh
                ref={bladesRef}
                args={[resources.bladeGeometry, resources.bladeMaterial, Math.max(1, scatter.blades.length / 4)]}
                receiveShadow={receiveShadow}
            />
            <instancedMesh
                ref={flowersRef}
                args={[resources.flowerGeometry, resources.flowerMaterial, Math.max(1, scatter.flowers.length / 3)]}
                receiveShadow={receiveShadow}
            />
        </>
    );
}
