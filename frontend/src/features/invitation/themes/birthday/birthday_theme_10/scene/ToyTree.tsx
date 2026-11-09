import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seededRandom } from '../lib/math';
import { TREES, type TreeKind, type TreePlacement } from '../lib/world';
import { cached, cone, cylinder, mergeParts, smoothWind, sphere } from './core/geometry';
import { getMaterials, palette } from './core/materials';

/**
 * Tree geometry per kind, modelled after toy-tree.svg (brown trunk, three
 * overlapping rounded canopies). Trunk vertices get aWind = 0 so they stay
 * planted; canopy vertices sway more the higher they are.
 */
const TREE_BUILDERS: Record<TreeKind, () => THREE.BufferGeometry> = {
    round: () =>
        mergeParts([
            { geometry: cylinder(0.12, 0.19, 1.25, 10), color: palette.trunk, position: [0, 0.62, 0], wind: 0 },
            { geometry: sphere(0.58), color: palette.leaf1, position: [-0.36, 1.52, 0.06], wind: smoothWind(1.0, 2.7) },
            { geometry: sphere(0.64), color: palette.leaf2, position: [0.33, 1.64, -0.06], wind: smoothWind(1.0, 2.7) },
            { geometry: sphere(0.52), color: palette.leaf3, position: [0, 2.1, 0.04], wind: smoothWind(1.0, 2.7) },
            { geometry: sphere(0.5), color: '#7edca2', position: [0.02, 1.58, -0.38], wind: smoothWind(1.0, 2.7) },
        ]),
    cone: () =>
        mergeParts([
            { geometry: cylinder(0.11, 0.16, 0.95, 10), color: palette.trunk, position: [0, 0.47, 0], wind: 0 },
            { geometry: cone(0.86, 1.05, 18), color: palette.pine1, position: [0, 1.3, 0], wind: smoothWind(0.8, 3.0) },
            { geometry: cone(0.68, 0.95, 18), color: palette.pine2, position: [0, 1.9, 0], wind: smoothWind(0.8, 3.0) },
            { geometry: cone(0.48, 0.85, 18), color: palette.pine3, position: [0, 2.46, 0], wind: smoothWind(0.8, 3.0) },
            { geometry: sphere(0.11, 10, 8), color: palette.butter, position: [0, 2.92, 0], wind: 1 },
        ]),
    blossom: () =>
        mergeParts([
            { geometry: cylinder(0.1, 0.15, 1.45, 10), color: palette.trunk, position: [0, 0.72, 0], wind: 0 },
            { geometry: sphere(0.82), color: palette.blossom1, position: [0, 2.0, 0], wind: smoothWind(1.2, 2.8) },
            { geometry: sphere(0.46), color: palette.blossom2, position: [0.48, 2.32, 0.2], wind: smoothWind(1.2, 2.8) },
            { geometry: sphere(0.4), color: '#ffa3bb', position: [-0.5, 1.9, -0.2], wind: smoothWind(1.2, 2.8) },
        ]),
};

export const treeGeometry = (kind: TreeKind) => cached(`tree:${kind}`, TREE_BUILDERS[kind]);

function TreeBatch({ kind, trees }: { kind: TreeKind; trees: TreePlacement[] }) {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const mats = getMaterials();

    useLayoutEffect(() => {
        const rand = seededRandom(kind.length * 31 + trees.length);
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3();
        const p = new THREE.Vector3();
        const c = new THREE.Color();
        trees.forEach((t, i) => {
            q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, rand() * Math.PI * 2);
            m.compose(p.set(t.pos[0], 0, t.pos[1]), q, s.setScalar(t.scale));
            ref.current.setMatrixAt(i, m);
            const tint = 0.94 + rand() * 0.1;
            ref.current.setColorAt(i, c.setRGB(tint, tint, tint));
        });
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
        ref.current.computeBoundingSphere();
    }, [kind, trees]);

    return (
        <instancedMesh
            ref={ref}
            args={[treeGeometry(kind), mats.foliage, trees.length]}
            customDepthMaterial={mats.foliageDepth}
            castShadow
            receiveShadow
        />
    );
}

/** All island trees: one instanced draw call per tree kind. */
export function ToyTrees({ trees = TREES }: { trees?: TreePlacement[] }) {
    const groups = useMemo(() => {
        const by: Record<TreeKind, TreePlacement[]> = { round: [], cone: [], blossom: [] };
        trees.forEach((t) => by[t.kind].push(t));
        return by;
    }, [trees]);

    return (
        <group>
            {(Object.keys(groups) as TreeKind[]).map((kind) =>
                groups[kind].length > 0 ? <TreeBatch key={kind} kind={kind} trees={groups[kind]} /> : null,
            )}
        </group>
    );
}
