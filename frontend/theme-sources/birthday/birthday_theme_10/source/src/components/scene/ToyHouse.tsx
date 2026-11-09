import * as THREE from 'three';
import { HOUSES, type HousePlacement, type HouseVariant } from '../../config/world';
import { cached, cylinder, extrudeShape, mergeParts, roundedBox, sphere, torus, type Part } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';

const VARIANTS: Record<HouseVariant, { roof: string; ridge: string; door: string; box: string }> = {
  coral: { roof: '#ff7c83', ridge: '#e85d70', door: palette.door, box: palette.lavender },
  lavender: { roof: '#a990ec', ridge: '#8a72d8', door: palette.coral, box: palette.butter },
  mint: { roof: '#5fcf9a', ridge: '#3fb27c', door: '#ff9f6e', box: palette.coral },
  sky: { roof: '#6cb8ec', ridge: '#4c9bd4', door: palette.butterDeep, box: palette.mint },
  butter: { roof: '#f7b84b', ridge: '#e39b2a', door: '#7e6ae0', box: palette.sky },
};

const W = 3.0; // wall width (x)
const D = 2.7; // wall depth (z)
const WALL_H = 2.1;
const BASE = 0.25;
const EAVE = BASE + WALL_H;
const RISE = 1.25;
const OVERHANG = 0.38;

function windowParts(x: number, y: number, z: number, rotY: number, flowerBox?: string): Part[] {
  // Local window parts are built facing +Z and then rotated around the wall.
  const rot: [number, number, number] = [0, rotY, 0];
  const place = (lx: number, ly: number, lz: number): [number, number, number] => {
    const c = Math.cos(rotY);
    const s = Math.sin(rotY);
    return [x + lx * c + lz * s, y + ly, z - lx * s + lz * c];
  };
  const parts: Part[] = [
    { geometry: roundedBox(0.74, 0.74, 0.1, 0.1), color: palette.white, position: place(0, 0, 0), rotation: rot },
    { geometry: roundedBox(0.56, 0.56, 0.06, 0.06), color: palette.window, position: place(0, 0, 0.04), rotation: rot },
    { geometry: roundedBox(0.06, 0.56, 0.05, 0.02), color: palette.white, position: place(0, 0, 0.08), rotation: rot },
    { geometry: roundedBox(0.56, 0.06, 0.05, 0.02), color: palette.white, position: place(0, 0, 0.08), rotation: rot },
  ];
  if (flowerBox) {
    parts.push({ geometry: roundedBox(0.84, 0.16, 0.22, 0.05), color: flowerBox, position: place(0, -0.47, 0.1), rotation: rot });
    for (let i = -1; i <= 1; i++) {
      parts.push({ geometry: sphere(0.08, 8, 6), color: i === 0 ? palette.butter : palette.coral, position: place(i * 0.24, -0.34, 0.12), rotation: rot });
    }
  }
  return parts;
}

function buildHouse(variant: HouseVariant) {
  const v = VARIANTS[variant];
  const ridgeY = EAVE + RISE;
  // Roof planks lie on the gable slope and overhang the walls.
  const angle = Math.atan2(RISE, W / 2);
  const slabLen = Math.hypot(W / 2, RISE) + OVERHANG / Math.cos(angle) + 0.1;
  const gable = new THREE.Shape();
  gable.moveTo(-W / 2 + 0.06, 0);
  gable.lineTo(W / 2 - 0.06, 0);
  gable.lineTo(0, RISE - 0.04);
  gable.closePath();

  const slab = (side: -1 | 1): Part => {
    const dx = side * Math.cos(angle);
    const dy = -Math.sin(angle);
    const along = slabLen / 2 - 0.1; // poke slightly past the ridge
    const nx = side * Math.sin(angle);
    const ny = Math.cos(angle);
    return {
      geometry: roundedBox(slabLen, 0.22, D + 0.5, 0.08),
      color: v.roof,
      position: [dx * along + nx * 0.11, ridgeY + dy * along + ny * 0.11, 0],
      rotation: [0, 0, -side * angle],
    };
  };

  const parts: Part[] = [
    { geometry: roundedBox(W + 0.3, BASE, D + 0.3, 0.08), color: palette.stone, position: [0, BASE / 2, 0] },
    { geometry: roundedBox(W, WALL_H, D, 0.14), color: palette.wallBottom, colorTop: palette.wallTop, position: [0, BASE + WALL_H / 2, 0] },
    { geometry: extrudeShape(gable, D - 0.12, 0.03), color: palette.wallTop, position: [0, EAVE - 0.02, 0] },
    slab(-1),
    slab(1),
    { geometry: cylinder(0.14, 0.14, D + 0.56, 12), color: v.ridge, position: [0, ridgeY + 0.14, 0], rotation: [Math.PI / 2, 0, 0] },
    { geometry: roundedBox(0.44, 0.95, 0.44, 0.08), color: palette.brick, position: [0.82, ridgeY - 0.2, -0.55] },
    { geometry: roundedBox(0.56, 0.14, 0.56, 0.05), color: palette.white, position: [0.82, ridgeY + 0.3, -0.55] },
    // door
    { geometry: roundedBox(0.92, 1.38, 0.1, 0.1), color: palette.white, position: [0, BASE + 0.69, D / 2 + 0.02] },
    { geometry: roundedBox(0.76, 1.26, 0.12, 0.1), color: v.door, position: [0, BASE + 0.65, D / 2 + 0.06] },
    { geometry: sphere(0.065, 10, 8), color: palette.butter, position: [0.24, BASE + 0.65, D / 2 + 0.14] },
    { geometry: roundedBox(1.0, 0.12, 0.55, 0.05), color: palette.stone, position: [0, 0.06, D / 2 + 0.42] },
    // round gable window
    { geometry: cylinder(0.24, 0.24, 0.06, 20), color: palette.window, position: [0, EAVE + 0.45, D / 2 - 0.02], rotation: [Math.PI / 2, 0, 0] },
    { geometry: torus(0.25, 0.05, Math.PI * 2, 8, 24), color: palette.white, position: [0, EAVE + 0.45, D / 2 + 0.01] },
    ...windowParts(-0.95, BASE + 1.25, D / 2 + 0.02, 0, v.box),
    ...windowParts(0.95, BASE + 1.25, D / 2 + 0.02, 0, v.box),
    ...windowParts(W / 2 + 0.02, BASE + 1.25, 0, Math.PI / 2),
    ...windowParts(-W / 2 - 0.02, BASE + 1.25, 0, -Math.PI / 2),
  ];
  return mergeParts(parts);
}

export const houseGeometry = (variant: HouseVariant) => cached(`house:${variant}`, () => buildHouse(variant));

export function ToyHouse({ placement }: { placement: HousePlacement }) {
  const { pos, rotation, variant, scale = 1 } = placement;
  return (
    <mesh
      geometry={houseGeometry(variant)}
      material={getMaterials().toyMatte}
      position={[pos[0], 0, pos[1]]}
      rotation-y={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

export function ToyHouses({ houses = HOUSES }: { houses?: HousePlacement[] }) {
  return (
    <group>
      {houses.map((h, i) => (
        <ToyHouse key={i} placement={h} />
      ))}
    </group>
  );
}
