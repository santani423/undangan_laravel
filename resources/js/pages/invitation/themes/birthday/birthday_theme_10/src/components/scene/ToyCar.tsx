import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { cached, cylinder, mergeParts, roundedBox, sphere, torus } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';
import { roadCurve, ROAD_LENGTH } from './lib/curves';
import { sfx } from '../../hooks/useMusic';
import { useExperience } from '../../store/experience';
import { hoverCursor } from './interaction';

const WHEEL_R = 0.19;

/* Based on toy-car.svg: rounded coral body, pale-blue windows, chunky dark wheels, butter lights. Front faces +Z. */
const carBody = (color: string) =>
  cached(`car:${color}`, () =>
    mergeParts([
      { geometry: roundedBox(0.84, 0.4, 1.5, 0.14), color, position: [0, 0.38, 0] },
      { geometry: roundedBox(0.74, 0.42, 0.78, 0.16), color, position: [0, 0.74, -0.12] },
      { geometry: roundedBox(0.76, 0.3, 0.06, 0.04), color: palette.window, position: [0, 0.76, 0.28], rotation: [-0.25, 0, 0] },
      { geometry: roundedBox(0.76, 0.28, 0.06, 0.04), color: palette.window, position: [0, 0.76, -0.52], rotation: [0.2, 0, 0] },
      { geometry: roundedBox(0.06, 0.26, 0.6, 0.04), color: palette.window, position: [0.37, 0.76, -0.12] },
      { geometry: roundedBox(0.06, 0.26, 0.6, 0.04), color: palette.window, position: [-0.37, 0.76, -0.12] },
      { geometry: sphere(0.08, 10, 8), color: palette.butter, position: [0.27, 0.42, 0.74], scale: [1, 0.8, 0.5] },
      { geometry: sphere(0.08, 10, 8), color: palette.butter, position: [-0.27, 0.42, 0.74], scale: [1, 0.8, 0.5] },
      { geometry: roundedBox(0.88, 0.1, 0.12, 0.04), color: palette.white, position: [0, 0.24, 0.76] },
      { geometry: roundedBox(0.88, 0.1, 0.12, 0.04), color: palette.white, position: [0, 0.24, -0.76] },
      { geometry: sphere(0.06, 8, 6), color: '#ff5c7a', position: [0.3, 0.42, -0.76], scale: [1, 0.8, 0.5] },
      { geometry: sphere(0.06, 8, 6), color: '#ff5c7a', position: [-0.3, 0.42, -0.76], scale: [1, 0.8, 0.5] },
    ]),
  );

const wheelGeometry = () =>
  cached('car-wheel', () =>
    mergeParts([
      { geometry: cylinder(WHEEL_R, WHEEL_R, 0.16, 18), color: palette.rubber, rotation: [0, 0, Math.PI / 2] },
      { geometry: cylinder(0.08, 0.08, 0.17, 12), color: '#c5d8e8', rotation: [0, 0, Math.PI / 2] },
      { geometry: torus(0.13, 0.02, Math.PI * 2, 6, 16), color: palette.white, position: [0.085, 0, 0], rotation: [0, Math.PI / 2, 0] },
      { geometry: torus(0.13, 0.02, Math.PI * 2, 6, 16), color: palette.white, position: [-0.085, 0, 0], rotation: [0, Math.PI / 2, 0] },
    ]),
  );

const WHEELS: [number, number, number][] = [
  [0.42, WHEEL_R, 0.48],
  [-0.42, WHEEL_R, 0.48],
  [0.42, WHEEL_R, -0.48],
  [-0.42, WHEEL_R, -0.48],
];

const CARS = [
  { color: palette.coral, start: 0.02, speed: 1.9 },
  { color: palette.sky, start: 0.36, speed: 1.9 },
  { color: palette.butter, start: 0.69, speed: 1.9 },
];

const LANE_OFFSET = 0.66;

function Car({ color, start, speed, driving }: { color: string; start: number; speed: number; driving: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const wheels = useRef<THREE.Group>(null!);
  const st = useRef({ u: start, distance: 0, hop: 0, hopV: 0 });
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), []);
  const mat = getMaterials().toySatin;

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    if (driving) {
      const step = speed * dt;
      s.u = (s.u + step / ROAD_LENGTH) % 1;
      s.distance += step;
    }
    roadCurve.getPointAt(s.u, tmp.p);
    roadCurve.getTangentAt(s.u, tmp.t);
    // Indonesia drives on the left: offset to the left of the travel direction.
    const rx = -tmp.t.z;
    const rz = tmp.t.x;
    const len = Math.hypot(rx, rz) || 1;
    root.current.position.set(tmp.p.x - (rx / len) * LANE_OFFSET, 0.02, tmp.p.z - (rz / len) * LANE_OFFSET);
    root.current.rotation.y = Math.atan2(tmp.t.x, tmp.t.z);

    s.hopV -= 16 * dt;
    s.hop = Math.max(0, s.hop + s.hopV * dt);
    if (s.hop === 0) s.hopV = 0;
    body.current.position.y = s.hop + (driving ? Math.abs(Math.sin(s.distance * 3.1)) * 0.015 : 0);
    wheels.current.children.forEach((w) => (w.rotation.x = s.distance / WHEEL_R));
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (st.current.hop === 0) st.current.hopV = 3.2;
    sfx('honk');
  };

  return (
    <group ref={root} onClick={onClick} {...hoverCursor}>
      <group ref={body}>
        <mesh geometry={carBody(color)} material={mat} castShadow receiveShadow />
      </group>
      <group ref={wheels}>
        {WHEELS.map((p, i) => (
          <mesh key={i} geometry={wheelGeometry()} material={mat} position={p} castShadow />
        ))}
      </group>
    </group>
  );
}

/** Toy cars following the ring road at a fixed spacing (never collide). They start once the gate opens. */
export function ToyCars({ animate }: { animate: boolean }) {
  const driving = useExperience((s) => s.opened) && animate;
  return (
    <group>
      {CARS.map((c, i) => (
        <Car key={i} {...c} driving={driving} />
      ))}
    </group>
  );
}
