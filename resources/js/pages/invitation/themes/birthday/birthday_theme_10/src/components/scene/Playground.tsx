import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAYGROUND } from '../../config/world';
import { cached, cylinder, mergeParts, roundedBox, sphere, type Part } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';
import { windField } from './lib/wind';

const slideGeometry = () =>
  cached('slide', () => {
    const parts: Part[] = [
      { geometry: roundedBox(1.2, 0.14, 1.2, 0.05), color: palette.butter, position: [0, 1.4, 0] },
      { geometry: roundedBox(1.25, 0.5, 0.08, 0.04), color: palette.coral, position: [0, 1.72, -0.58] },
      { geometry: roundedBox(0.08, 0.5, 1.2, 0.04), color: palette.coral, position: [-0.6, 1.72, 0] },
      // slide chute
      { geometry: roundedBox(0.66, 0.08, 2.4, 0.04), color: palette.mint, position: [0, 0.78, 1.55], rotation: [0.62, 0, 0] },
      { geometry: roundedBox(0.08, 0.2, 2.4, 0.04), color: palette.mintDeep, position: [-0.33, 0.86, 1.55], rotation: [0.62, 0, 0] },
      { geometry: roundedBox(0.08, 0.2, 2.4, 0.04), color: palette.mintDeep, position: [0.33, 0.86, 1.55], rotation: [0.62, 0, 0] },
    ];
    for (const [x, z] of [[-0.52, -0.52], [0.52, -0.52], [-0.52, 0.52], [0.52, 0.52]]) {
      parts.push({ geometry: cylinder(0.06, 0.06, 1.4, 8), color: palette.lavender, position: [x, 0.7, z] });
    }
    // ladder at the back
    parts.push({ geometry: cylinder(0.04, 0.04, 1.6, 6), color: palette.lavenderDeep, position: [-0.3, 0.75, -1.0], rotation: [0.35, 0, 0] });
    parts.push({ geometry: cylinder(0.04, 0.04, 1.6, 6), color: palette.lavenderDeep, position: [0.3, 0.75, -1.0], rotation: [0.35, 0, 0] });
    for (let i = 0; i < 4; i++) {
      parts.push({ geometry: cylinder(0.03, 0.03, 0.6, 6), color: palette.butter, position: [0, 0.2 + i * 0.36, -1.24 + i * 0.13], rotation: [0, 0, Math.PI / 2] });
    }
    return mergeParts(parts);
  });

const swingFrame = () =>
  cached('swing-frame', () =>
    mergeParts([
      { geometry: cylinder(0.06, 0.06, 2.6, 8), color: palette.sky, position: [0, 2.2, 0], rotation: [0, 0, Math.PI / 2] },
      { geometry: cylinder(0.06, 0.06, 2.4, 8), color: palette.coral, position: [-1.22, 1.08, 0.4], rotation: [-0.36, 0, 0] },
      { geometry: cylinder(0.06, 0.06, 2.4, 8), color: palette.coral, position: [-1.22, 1.08, -0.4], rotation: [0.36, 0, 0] },
      { geometry: cylinder(0.06, 0.06, 2.4, 8), color: palette.coral, position: [1.22, 1.08, 0.4], rotation: [-0.36, 0, 0] },
      { geometry: cylinder(0.06, 0.06, 2.4, 8), color: palette.coral, position: [1.22, 1.08, -0.4], rotation: [0.36, 0, 0] },
      { geometry: sphere(0.1, 10, 8), color: palette.butter, position: [-1.3, 2.2, 0] },
      { geometry: sphere(0.1, 10, 8), color: palette.butter, position: [1.3, 2.2, 0] },
    ]),
  );

const swingSeat = () =>
  cached('swing-seat', () =>
    mergeParts([
      { geometry: cylinder(0.012, 0.012, 1.6, 4), color: '#8c8ab0', position: [-0.22, -0.8, 0] },
      { geometry: cylinder(0.012, 0.012, 1.6, 4), color: '#8c8ab0', position: [0.22, -0.8, 0] },
      { geometry: roundedBox(0.56, 0.07, 0.26, 0.03), color: palette.butter, position: [0, -1.6, 0] },
    ]),
  );

/** Slide and a swing set whose seats rock gently with the wind. */
export function Playground({ animate }: { animate: boolean }) {
  const seats = useRef<THREE.Group>(null!);
  const mat = getMaterials().toyMatte;
  const [x, z] = PLAYGROUND.center;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const gust = windField(x, z, t);
    seats.current.children.forEach((seat, i) => {
      seat.rotation.x = animate ? Math.sin(t * 1.7 + i * 1.3) * (0.08 + gust * 0.12) : 0;
    });
  });

  return (
    <group position={[x, 0, z]} rotation-y={PLAYGROUND.rotation}>
      <mesh geometry={slideGeometry()} material={mat} position={[-1.6, 0, 0]} castShadow receiveShadow />
      <group position={[1.4, 0, 0]}>
        <mesh geometry={swingFrame()} material={mat} castShadow />
        <group ref={seats} position={[0, 2.2, 0]}>
          <mesh geometry={swingSeat()} material={mat} position={[-0.6, 0, 0]} castShadow />
          <mesh geometry={swingSeat()} material={mat} position={[0.6, 0, 0]} castShadow />
        </group>
      </group>
    </group>
  );
}
