import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '../../../store/experience';
import { cached, cylinder, mergeParts, roundedBox, sphere, torus, type Part } from '../lib/geometry';
import { getMaterials, palette } from '../lib/materials';
import { Mascot } from '../Mascot';
import { BalloonCluster } from '../Balloons';
import { Bushes } from '../Flowers';
import { Pennant, PicketFence } from '../Props';
import { ToyText } from '../ToyText';

const PILLAR_X = 2.3;
const HINGE_X = 1.88;
const DOOR_W = 1.82;

const pillarGeometry = () =>
  cached('gate-pillar', () => {
    const parts: Part[] = [{ geometry: roundedBox(1.0, 0.3, 1.0, 0.08), color: palette.wood, position: [0, 0.15, 0] }];
    for (let i = 0; i < 5; i++) {
      parts.push({ geometry: cylinder(0.42, 0.42, 0.56, 28), color: i % 2 ? palette.white : palette.coral, position: [0, 0.58 + i * 0.56, 0] });
    }
    parts.push({ geometry: cylinder(0.5, 0.5, 0.12, 28), color: palette.butter, position: [0, 3.16, 0] });
    parts.push({ geometry: sphere(0.38, 22, 16), color: palette.butter, position: [0, 3.55, 0] });
    return mergeParts(parts);
  });

const archGeometry = () =>
  cached('gate-arch', () => {
    const parts: Part[] = [{ geometry: torus(PILLAR_X, 0.24, Math.PI, 14, 48), color: palette.lavender, position: [0, 3.25, 0] }];
    for (let i = 1; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      parts.push({ geometry: sphere(0.13, 12, 10), color: [palette.butter, palette.mint, palette.coral][i % 3], position: [Math.cos(a) * PILLAR_X, 3.25 + Math.sin(a) * PILLAR_X, 0.22] });
    }
    // hanging welcome sign
    parts.push({ geometry: cylinder(0.03, 0.03, 0.45, 6), color: palette.woodDark, position: [-1.1, 5.0, 0.04] });
    parts.push({ geometry: cylinder(0.03, 0.03, 0.45, 6), color: palette.woodDark, position: [1.1, 5.0, 0.04] });
    parts.push({ geometry: roundedBox(3.5, 0.92, 0.16, 0.12), color: palette.coral, position: [0, 4.52, 0.02] });
    parts.push({ geometry: roundedBox(3.22, 0.68, 0.2, 0.1), color: palette.cream, position: [0, 4.52, 0.04] });
    return mergeParts(parts);
  });

const doorGeometry = () =>
  cached('gate-door', () => {
    const parts: Part[] = [
      { geometry: roundedBox(DOOR_W, 0.13, 0.1, 0.04), color: palette.butter, position: [DOOR_W / 2, 0.42, 0] },
      { geometry: roundedBox(DOOR_W, 0.13, 0.1, 0.04), color: palette.butter, position: [DOOR_W / 2, 1.08, 0] },
    ];
    for (let i = 0; i < 5; i++) {
      const x = 0.2 + i * 0.355;
      const color = i % 2 ? palette.white : '#fff2dc';
      parts.push({ geometry: roundedBox(0.24, 1.25, 0.08, 0.06), color, position: [x, 0.74, 0.07] });
      parts.push({ geometry: sphere(0.12, 12, 8), color, position: [x, 1.37, 0.07], scale: [1, 0.75, 0.33] });
    }
    return mergeParts(parts);
  });

/** Striped toy gate with a hanging welcome sign; its doors swing open with "Buka Undangan". */
function Gate({ opened, animate }: { opened: boolean; animate: boolean }) {
  const left = useRef<THREE.Group>(null!);
  const right = useRef<THREE.Group>(null!);
  const amount = useRef(0);
  const mats = getMaterials();

  useFrame((_, dt) => {
    amount.current = animate ? THREE.MathUtils.damp(amount.current, opened ? 1 : 0, 2.4, Math.min(dt, 0.05)) : opened ? 1 : 0;
    const a = amount.current * 1.72;
    left.current.rotation.y = a;
    right.current.rotation.y = Math.PI - a;
  });

  return (
    <group>
      <mesh geometry={pillarGeometry()} material={mats.toySatin} position={[-PILLAR_X, 0, 0]} castShadow receiveShadow />
      <mesh geometry={pillarGeometry()} material={mats.toySatin} position={[PILLAR_X, 0, 0]} castShadow receiveShadow />
      <mesh geometry={archGeometry()} material={mats.toySatin} castShadow />
      <ToyText position={[0, 4.52, 0.16]} fontSize={0.34} color={palette.coralDeep}>
        Selamat Datang
      </ToyText>
      <group ref={left} position={[-HINGE_X, 0, 0]}>
        <mesh geometry={doorGeometry()} material={mats.toyMatte} castShadow />
      </group>
      <group ref={right} position={[HINGE_X, 0, 0]} rotation-y={Math.PI}>
        <mesh geometry={doorGeometry()} material={mats.toyMatte} castShadow />
      </group>
      <Pennant position={[-PILLAR_X, 3.85, 0]} color={palette.mint} height={0.85} />
      <Pennant position={[PILLAR_X, 3.85, 0]} color={palette.coral} height={0.85} />
    </group>
  );
}

const FENCE_RUNS: [number, number][][] = [
  [[-2.95, 0], [-9.8, 0], [-11.4, -2.6]],
  [[2.95, 0], [9.8, 0], [11.2, -2.4]],
];

const BUSHES: [number, number][] = [
  [-5.2, 0.9], [-7.6, 1.0], [5.6, 1.0], [8.4, 0.9], [-10.2, -1.2], [10.4, -1.1],
];

/** Destination 1 — the Toy World entrance gate, welcoming mascot and balloons. */
export function EntranceWorld({ animate }: { animate: boolean }) {
  const opened = useExperience((s) => s.opened);
  return (
    <group>
      <Gate opened={opened} animate={animate} />
      <PicketFence runs={FENCE_RUNS} />
      <Bushes positions={BUSHES} />
      <Mascot position={[3.55, 0, 1.75]} rotation={-0.4} mode="wave" animate={animate} celebrateSpot="gate" />
      <BalloonCluster anchor={[-2.95, 0.9, 0.55]} count={4} height={3.1} seed={1} animate={animate} />
      <BalloonCluster anchor={[2.95, 0.9, 0.55]} count={3} height={2.8} seed={2} animate={animate} />
    </group>
  );
}
