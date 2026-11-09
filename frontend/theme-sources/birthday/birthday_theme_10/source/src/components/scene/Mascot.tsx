import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../config/world';
import { celebrate } from '../../store/celebrations';
import type { CelebrationSpot } from '../../config/world';
import { sfx } from '../../hooks/useMusic';
import { cached, capsule, cone, mergeParts, sphere, torus, roundedBox } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';
import { hoverCursor } from './interaction';

/* Geometry modelled on mascot-bear.svg: tan head, darker ears, cream snout, coral scarf. */
const bodyGeometry = () =>
  cached('bear-body', () =>
    mergeParts([
      { geometry: capsule(0.13, 0.14), color: palette.bear, position: [-0.19, 0.18, 0.02] },
      { geometry: capsule(0.13, 0.14), color: palette.bear, position: [0.19, 0.18, 0.02] },
      { geometry: sphere(0.13, 12, 10), color: palette.bearDark, position: [-0.2, 0.06, 0.09], scale: [1, 0.5, 1.25] },
      { geometry: sphere(0.13, 12, 10), color: palette.bearDark, position: [0.2, 0.06, 0.09], scale: [1, 0.5, 1.25] },
      { geometry: sphere(0.44, 24, 18), color: palette.bear, position: [0, 0.64, 0], scale: [1, 1.05, 0.9] },
      { geometry: sphere(0.3, 20, 14), color: palette.bearLight, position: [0, 0.6, 0.27], scale: [1, 1.05, 0.5] },
      { geometry: torus(0.29, 0.08, Math.PI * 2, 10, 28), color: palette.coral, position: [0, 1.0, 0], rotation: [Math.PI / 2, 0, 0] },
      { geometry: roundedBox(0.14, 0.26, 0.08, 0.04), color: palette.coral, position: [0.14, 0.88, 0.27], rotation: [0.2, 0, -0.3] },
    ]),
  );

const headGeometry = (hat: string) =>
  cached(`bear-head:${hat}`, () =>
    mergeParts([
      { geometry: sphere(0.45, 28, 20), color: palette.bear, position: [0, 0.4, 0] },
      { geometry: sphere(0.17, 14, 12), color: palette.bearDark, position: [-0.34, 0.74, -0.03] },
      { geometry: sphere(0.17, 14, 12), color: palette.bearDark, position: [0.34, 0.74, -0.03] },
      { geometry: sphere(0.1, 12, 10), color: '#ffc7a3', position: [-0.34, 0.74, 0.08], scale: [1, 1, 0.5] },
      { geometry: sphere(0.1, 12, 10), color: '#ffc7a3', position: [0.34, 0.74, 0.08], scale: [1, 1, 0.5] },
      { geometry: sphere(0.2, 18, 14), color: palette.bearLight, position: [0, 0.27, 0.37], scale: [1.25, 0.88, 0.85] },
      { geometry: sphere(0.07, 12, 10), color: palette.eye, position: [0, 0.34, 0.54], scale: [1.3, 0.9, 0.9] },
      { geometry: sphere(0.058, 12, 10), color: palette.eye, position: [-0.16, 0.47, 0.39], scale: [0.85, 1.15, 0.6] },
      { geometry: sphere(0.058, 12, 10), color: palette.eye, position: [0.16, 0.47, 0.39], scale: [0.85, 1.15, 0.6] },
      { geometry: sphere(0.018, 6, 6), color: '#ffffff', position: [-0.14, 0.5, 0.43] },
      { geometry: sphere(0.018, 6, 6), color: '#ffffff', position: [0.18, 0.5, 0.43] },
      { geometry: sphere(0.075, 12, 10), color: palette.cheek, position: [-0.29, 0.3, 0.33], scale: [1.3, 0.7, 0.4] },
      { geometry: sphere(0.075, 12, 10), color: palette.cheek, position: [0.29, 0.3, 0.33], scale: [1.3, 0.7, 0.4] },
      { geometry: torus(0.07, 0.016, Math.PI, 6, 14), color: '#9a5e52', position: [0, 0.22, 0.5], rotation: [0.3, 0, Math.PI] },
      { geometry: cone(0.17, 0.42, 20), color: hat, position: [0.1, 0.98, 0], rotation: [0, 0, -0.28] },
      { geometry: torus(0.16, 0.035, Math.PI * 2, 8, 20), color: palette.white, position: [0.045, 0.79, 0], rotation: [Math.PI / 2, 0.28, 0] },
      { geometry: sphere(0.07, 12, 10), color: palette.butter, position: [0.16, 1.19, 0] },
    ]),
  );

const armGeometry = () =>
  cached('bear-arm', () =>
    mergeParts([
      { geometry: capsule(0.1, 0.26), color: palette.bear, position: [0, -0.2, 0] },
      { geometry: sphere(0.11, 12, 10), color: palette.bearLight, position: [0, -0.38, 0.02] },
    ]),
  );

interface MascotProps {
  position?: Vec3;
  rotation?: number;
  scale?: number;
  mode?: 'wave' | 'dance';
  hatColor?: string;
  animate: boolean;
  celebrateSpot?: CelebrationSpot;
}

/** Friendly bear mascot with restrained idle animation; tap for a happy hop. */
export function Mascot({ position, rotation = 0, scale = 1, mode = 'wave', hatColor = palette.lavender, animate, celebrateSpot }: MascotProps) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const hop = useRef({ y: 0, v: 0, spin: 0 });
  const mat = getMaterials().toySatin;
  const geos = useMemo(() => ({ body: bodyGeometry(), head: headGeometry(hatColor), arm: armGeometry() }), [hatColor]);
  const phase = useMemo(() => Math.random() * 10, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime + phase;
    const h = hop.current;
    h.v -= 18 * dt;
    h.y = Math.max(0, h.y + h.v * dt);
    if (h.y === 0) h.v = 0;
    h.spin = THREE.MathUtils.damp(h.spin, 0, 5, dt);

    const motion = animate ? 1 : 0;
    body.current.scale.y = 1 + Math.sin(t * 2.2) * 0.015 * (animate ? 1 : 0.4);
    head.current.rotation.z = Math.sin(t * 1.1) * 0.07 * motion;
    head.current.rotation.x = Math.sin(t * 0.8) * 0.04 * motion;

    let danceY = 0;
    let leftZ = 0.35;
    let rightZ = -0.35;
    if (animate && mode === 'dance') {
      danceY = Math.abs(Math.sin(t * 3)) * 0.08;
      root.current.rotation.z = Math.sin(t * 3) * 0.05;
      leftZ = 0.6 + Math.sin(t * 3) * 0.7;
      rightZ = -0.6 + Math.sin(t * 3) * 0.7;
    } else if (animate) {
      // Wave for ~1.8 s every 5 s.
      const cycle = t % 5;
      const env = cycle < 1.8 ? Math.sin((cycle / 1.8) * Math.PI) : 0;
      rightZ = THREE.MathUtils.lerp(-0.35, -2.6, Math.min(1, env * 1.6)) + Math.sin(t * 10) * 0.3 * env;
    }
    leftArm.current.rotation.z = leftZ;
    rightArm.current.rotation.z = rightZ;
    root.current.position.y = (position?.[1] ?? 0) + h.y + danceY;
    root.current.rotation.y = rotation + h.spin;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (hop.current.y === 0) {
      hop.current.v = animate ? 5 : 2.5;
      if (animate) hop.current.spin = Math.PI * 2;
    }
    sfx('boing');
    if (celebrateSpot) celebrate(celebrateSpot, 0.5);
  };

  return (
    <group ref={root} position={position} rotation-y={rotation} scale={scale} onClick={onClick} {...hoverCursor}>
      <group ref={body}>
        <mesh geometry={geos.body} material={mat} castShadow receiveShadow />
      </group>
      <group ref={head} position={[0, 1.02, 0]}>
        <mesh geometry={geos.head} material={mat} castShadow />
      </group>
      <group ref={leftArm} position={[0.36, 0.88, 0.02]}>
        <mesh geometry={geos.arm} material={mat} castShadow />
      </group>
      <group ref={rightArm} position={[-0.36, 0.88, 0.02]}>
        <mesh geometry={geos.arm} material={mat} castShadow />
      </group>
    </group>
  );
}
