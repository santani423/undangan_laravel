import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface Bucket {
    material: THREE.Material;
    castShadow: boolean;
    receiveShadow: boolean;
    renderOrder: number;
    geometries: THREE.BufferGeometry[];
}

/**
 * Merges every plain (non-instanced, single-material) mesh under `root` into one mesh per
 * material + shadow setting + map cell. Used for scenery that never moves, cutting hundreds
 * of draw calls down to a few dozen. Bucketing by a coarse grid keeps frustum and
 * shadow-camera culling effective. Lines, sprites, instanced and multi-material meshes are
 * left as is. `root` must sit at the world origin with an identity transform.
 */
export function mergeStatic(root: THREE.Object3D, { cellSize = 40 } = {}) {
    root.updateMatrixWorld(true);
    const buckets = new Map<string, Bucket>();
    const merged: THREE.Mesh[] = [];
    const origin = new THREE.Vector3();
    root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || Array.isArray(mesh.material) || !mesh.visible) return;
        const material = mesh.material as THREE.Material;
        origin.setFromMatrixPosition(mesh.matrixWorld);
        const cell = `${Math.floor(origin.x / cellSize)},${Math.floor(origin.z / cellSize)}`;
        const key = `${material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}|${mesh.renderOrder}|${cell}`;
        let bucket = buckets.get(key);
        if (!bucket) {
            bucket = { material, castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow, renderOrder: mesh.renderOrder, geometries: [] };
            buckets.set(key, bucket);
        }
        const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        for (const name of Object.keys(geometry.attributes)) {
            if (name !== 'position' && name !== 'normal' && name !== 'uv') geometry.deleteAttribute(name);
        }
        if (!geometry.attributes.normal) geometry.computeVertexNormals();
        if (!geometry.attributes.uv) {
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
        }
        geometry.morphAttributes = {};
        geometry.clearGroups();
        geometry.applyMatrix4(mesh.matrixWorld);
        bucket.geometries.push(geometry);
        merged.push(mesh);
    });

    merged.forEach((mesh) => mesh.parent?.remove(mesh));
    let after = 0;
    for (const bucket of buckets.values()) {
        const geometry = bucket.geometries.length === 1 ? bucket.geometries[0] : mergeGeometries(bucket.geometries, false);
        bucket.geometries.forEach((g) => g !== geometry && g.dispose());
        if (!geometry) continue;
        geometry.computeBoundingSphere();
        const mesh = new THREE.Mesh(geometry, bucket.material);
        mesh.castShadow = bucket.castShadow;
        mesh.receiveShadow = bucket.receiveShadow;
        mesh.renderOrder = bucket.renderOrder;
        mesh.matrixAutoUpdate = false;
        root.add(mesh);
        after++;
    }
    return { before: merged.length, after };
}
