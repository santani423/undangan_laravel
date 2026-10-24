import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FLOWER_BEDS, ROAD_WIDTH, type Vec2 } from '../../config/world';
import { seededRandom } from '../../utils/math';
import { distanceToRoad } from './lib/curves';
import { cached, cylinder, mergeParts, sphere } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';

const STEM_HEIGHT = 0.34;

/** Stem + leaf + flower centre (green/yellow vertex colours, not instance-tinted). */
const stemGeometry = () =>
  cached('flower-stem', () =>
    mergeParts([
      { geometry: cylinder(0.014, 0.018, STEM_HEIGHT, 5), color: palette.leafDeep, position: [0, STEM_HEIGHT / 2, 0], wind: (p) => p.y / STEM_HEIGHT },
      { geometry: sphere(0.05, 5, 3), color: palette.leaf1, position: [0.05, 0.12, 0], scale: [1.4, 0.4, 0.8], wind: 0.3 },
      { geometry: sphere(0.045, 7, 5), color: palette.butter, position: [0, STEM_HEIGHT + 0.01, 0], scale: [1, 0.6, 1], wind: 1 },
    ]),
  );

/** Five petals (white vertex colour, tinted per instance). */
const petalGeometry = () =>
  cached('flower-petals', () =>
    mergeParts(
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return {
          geometry: sphere(0.06, 6, 4),
          color: '#ffffff',
          position: [Math.cos(a) * 0.07, STEM_HEIGHT, Math.sin(a) * 0.07] as [number, number, number],
          scale: [1, 0.45, 0.75] as [number, number, number],
          rotation: [0, -a, 0] as [number, number, number],
          wind: 1,
        };
      }),
    ),
  );

const FLOWER_COLORS = [palette.coral, palette.butter, palette.lavender, '#ffffff', palette.sky, '#ff9fbc'];

interface FlowerInstance {
  x: number;
  z: number;
  yaw: number;
  scale: number;
  color: string;
}

function placeFlowers(scale: number): FlowerInstance[] {
  const rand = seededRandom(4242);
  const out: FlowerInstance[] = [];
  for (const bed of FLOWER_BEDS) {
    const palettePick = [FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)], FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)]];
    const n = Math.max(6, Math.round(bed.count * scale));
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * bed.radius;
      const x = bed.center[0] + Math.cos(a) * r;
      const z = bed.center[1] + Math.sin(a) * r;
      if (distanceToRoad(x, z) < ROAD_WIDTH / 2 + 0.35) continue;
      out.push({ x, z, yaw: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.5, color: palettePick[i % 2] });
    }
  }
  return out;
}

export function Flowers({ density = 1 }: { density?: number }) {
  const stems = useRef<THREE.InstancedMesh>(null!);
  const petals = useRef<THREE.InstancedMesh>(null!);
  const flowers = useMemo(() => placeFlowers(density), [density]);
  const material = getMaterials().flowers;

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    const white = new THREE.Color(1, 1, 1);
    flowers.forEach((f, i) => {
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, f.yaw);
      m.compose(p.set(f.x, 0, f.z), q, s.setScalar(f.scale));
      stems.current.setMatrixAt(i, m);
      petals.current.setMatrixAt(i, m);
      // Both meshes carry instance colours so they share one shader program.
      stems.current.setColorAt(i, white);
      petals.current.setColorAt(i, c.set(f.color));
    });
    for (const mesh of [stems.current, petals.current]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [flowers]);

  return (
    <group>
      <instancedMesh ref={stems} args={[stemGeometry(), material, flowers.length]} />
      <instancedMesh ref={petals} args={[petalGeometry(), material, flowers.length]} castShadow={false} />
    </group>
  );
}

const bushGeometry = () =>
  cached('bush', () =>
    mergeParts([
      { geometry: sphere(0.42, 14, 10), color: palette.leaf1, position: [0, 0.32, 0], scale: [1.15, 0.85, 1], wind: (p) => Math.max(0, p.y - 0.15) * 0.35 },
      { geometry: sphere(0.32, 12, 9), color: palette.leaf2, position: [0.38, 0.26, 0.08], wind: (p) => Math.max(0, p.y - 0.15) * 0.35 },
      { geometry: sphere(0.3, 12, 9), color: palette.leafDeep, position: [-0.36, 0.24, -0.06], wind: (p) => Math.max(0, p.y - 0.15) * 0.35 },
    ]),
  );

/** Round hedge bushes (instanced, gently swaying tops). */
export function Bushes({ positions }: { positions: Vec2[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const mats = getMaterials();

  useLayoutEffect(() => {
    const rand = seededRandom(99);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    positions.forEach(([x, z], i) => {
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, rand() * Math.PI * 2);
      m.compose(p.set(x, 0, z), q, s.setScalar(0.85 + rand() * 0.45));
      ref.current.setMatrixAt(i, m);
      // Instance tint keeps the foliage program identical to the (tinted) trees.
      const tint = 0.95 + rand() * 0.08;
      ref.current.setColorAt(i, c.setRGB(tint, tint, tint));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [positions]);

  return (
    <instancedMesh
      ref={ref}
      args={[bushGeometry(), mats.foliage, positions.length]}
      customDepthMaterial={mats.foliageDepth}
      castShadow
      receiveShadow
    />
  );
}
