import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Merges every plain (non-instanced, single-material) mesh under `root` into one mesh per
 * material + shadow setting + map cell. Used for scenery that never moves, cutting hundreds
 * of draw calls down to a few dozen. Bucketing by a coarse grid keeps frustum and
 * shadow-camera culling effective. Lines, sprites, instanced and multi-material meshes are
 * left as is. `root` must sit at the world origin with an identity transform.
 */
export function mergeStatic(root, { cellSize = 40 } = {}) {
  root.updateMatrixWorld(true);
  const buckets = new Map();
  const merged = [];
  const origin = new THREE.Vector3();
  root.traverse((object) => {
    if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material) || !object.visible) return;
    origin.setFromMatrixPosition(object.matrixWorld);
    const cell = `${Math.floor(origin.x / cellSize)},${Math.floor(origin.z / cellSize)}`;
    const key = `${object.material.uuid}|${object.castShadow}|${object.receiveShadow}|${object.renderOrder}|${cell}`;
    if (!buckets.has(key)) buckets.set(key, { material: object.material, castShadow: object.castShadow, receiveShadow: object.receiveShadow, renderOrder: object.renderOrder, geometries: [] });
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    for (const name of Object.keys(geometry.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') geometry.deleteAttribute(name);
    }
    if (!geometry.attributes.normal) geometry.computeVertexNormals();
    if (!geometry.attributes.uv) {
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
    }
    geometry.morphAttributes = {};
    geometry.clearGroups();
    geometry.applyMatrix4(object.matrixWorld);
    buckets.get(key).geometries.push(geometry);
    merged.push(object);
  });

  merged.forEach((object) => object.parent.remove(object));
  let before = merged.length;
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
  return { before, after };
}
