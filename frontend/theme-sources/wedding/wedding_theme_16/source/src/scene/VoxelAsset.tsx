import { use, useLayoutEffect, useMemo, useRef } from 'react';
import { Euler, Matrix4, Quaternion, Vector3, type BufferGeometry, type InstancedMesh, type Material } from 'three';
import { getSwayMaterial, getVoxelMaterial, type SwayConfig } from './materials';
import { loadVoxelModel } from './voxelLoader';
import type { ModelName, Placement } from './worldLayout';

interface VoxelInstancesProps {
  model: ModelName;
  placements: Placement[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  sway?: SwayConfig;
}

/**
 * Renders every placement of a supplied OBJ model with one InstancedMesh per
 * material, so e.g. 60 trees cost three draw calls. Suspends until the model
 * (or its procedural fallback) is ready.
 */
export function VoxelInstances({ model, placements, castShadow = true, receiveShadow = true, sway }: VoxelInstancesProps) {
  const voxel = use(loadVoxelModel(model));

  const materials = useMemo(
    () =>
      voxel.parts.map((part) =>
        sway && (!sway.materials || sway.materials.includes(part.material))
          ? getSwayMaterial(part.material, sway, part.color)
          : getVoxelMaterial(part.material, part.color),
      ),
    [voxel, sway],
  );

  if (placements.length === 0) return null;

  return (
    <>
      {voxel.parts.map((part, index) => (
        <PartInstances
          key={part.material}
          geometry={part.geometry}
          material={materials[index]}
          placements={placements}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </>
  );
}

interface PartInstancesProps {
  geometry: BufferGeometry;
  material: Material;
  placements: Placement[];
  castShadow: boolean;
  receiveShadow: boolean;
}

const tmpMatrix = new Matrix4();
const tmpPosition = new Vector3();
const tmpQuaternion = new Quaternion();
const tmpEuler = new Euler();
const tmpScale = new Vector3();

function PartInstances({ geometry, material, placements, castShadow, receiveShadow }: PartInstancesProps) {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    placements.forEach((p, i) => {
      tmpPosition.set(p.x, p.y ?? 0, p.z);
      tmpQuaternion.setFromEuler(tmpEuler.set(0, p.rotY ?? 0, 0));
      tmpScale.setScalar(p.scale ?? 1);
      mesh.setMatrixAt(i, tmpMatrix.compose(tmpPosition, tmpQuaternion, tmpScale));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/** Convenience wrapper for a single placed asset. */
export function VoxelAsset({ model, placement, ...rest }: Omit<VoxelInstancesProps, 'placements'> & { placement: Placement }) {
  const placements = useMemo(() => [placement], [placement]);
  return <VoxelInstances model={model} placements={placements} {...rest} />;
}
