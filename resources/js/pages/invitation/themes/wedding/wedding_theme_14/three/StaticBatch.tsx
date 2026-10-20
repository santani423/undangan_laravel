import { useLayoutEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Authoring stays declarative (lots of small meshes), but at mount every static child mesh is
 * merged per-material into a handful of draw calls. Meshes flagged `userData.dynamic` are left alone.
 */
export function StaticBatch({
    children,
    castShadow = true,
    receiveShadow = true,
}: {
    children: ReactNode;
    castShadow?: boolean;
    receiveShadow?: boolean;
}) {
    const root = useRef<THREE.Group>(null);
    const output = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        const src = root.current;
        const out = output.current;
        if (!src || !out) return;
        src.updateWorldMatrix(true, true);
        const inv = new THREE.Matrix4().copy(src.matrixWorld).invert();
        const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
        const hidden: THREE.Mesh[] = [];

        src.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh || (mesh as unknown as THREE.InstancedMesh).isInstancedMesh) return;
            let p: THREE.Object3D | null = mesh;
            while (p && p !== src) {
                if (p.userData.dynamic) return;
                p = p.parent;
            }
            if (Array.isArray(mesh.material)) return;
            const g0 = mesh.geometry;
            if (!g0.attributes.uv || !g0.attributes.normal) return;
            const g = g0.index ? g0.toNonIndexed() : g0.clone();
            // keep only shared attributes so geometries are mergeable
            for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
            g.clearGroups();
            g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
            if (!buckets.has(mesh.material)) buckets.set(mesh.material, []);
            buckets.get(mesh.material)!.push(g);
            hidden.push(mesh);
        });

        const created: THREE.Mesh[] = [];
        buckets.forEach((geos, mat) => {
            const merged = mergeGeometries(geos, false);
            geos.forEach((g) => g.dispose());
            if (!merged) return;
            merged.computeBoundingSphere();
            const m = new THREE.Mesh(merged, mat);
            // decals / glass never cast; alpha-tested foliage does
            m.castShadow = castShadow && !mat.transparent;
            m.receiveShadow = receiveShadow && !mat.transparent;
            if (mat.transparent) m.renderOrder = 1;
            out.add(m);
            created.push(m);
        });
        hidden.forEach((m) => (m.visible = false));

        return () => {
            created.forEach((m) => {
                out.remove(m);
                m.geometry.dispose();
            });
            hidden.forEach((m) => (m.visible = true));
        };
    }, [castShadow, receiveShadow]);

    return (
        <>
            <group ref={root}>{children}</group>
            <group ref={output} />
        </>
    );
}
