import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../config/world';
import { seededRandom } from '../../utils/math';
import { sfx } from '../../hooks/useMusic';
import { cached, cone, mergeParts, sphere } from './lib/geometry';
import { BALLOON_COLORS, getMaterials } from './lib/materials';
import { windField } from './lib/wind';
import { hoverCursor } from './interaction';

const RADIUS = 0.34;
const balloonGeometry = () =>
  cached('balloon', () =>
    mergeParts([
      { geometry: sphere(RADIUS, 20, 14), color: '#ffffff', scale: [1, 1.18, 1] },
      { geometry: cone(0.06, 0.09, 10), color: '#ffffff', position: [0, -RADIUS * 1.18 - 0.02, 0], rotation: [Math.PI, 0, 0] },
    ]),
  );

const SEGMENTS = 8;

interface BalloonClusterProps {
  /** Local anchor point where the strings are tied. */
  anchor: Vec3;
  count?: number;
  height?: number;
  spread?: number;
  seed?: number;
  colors?: string[];
  animate: boolean;
  position?: Vec3;
  rotation?: number;
}

/**
 * A bunch of balloons on strings (like balloon-bunch.svg). Balloons bob,
 * lean with the shared wind, and bounce when tapped. One instanced mesh plus
 * one line set per cluster.
 */
export function BalloonCluster({ anchor, count = 4, height = 3, spread = 0.7, seed = 1, colors = BALLOON_COLORS, animate, position, rotation = 0 }: BalloonClusterProps) {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const lines = useRef<THREE.LineSegments>(null!);
  const mats = getMaterials();

  const balloons = useMemo(() => {
    const rand = seededRandom(seed * 97);
    const start = Math.floor(rand() * colors.length);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + rand() * 0.6;
      const r = spread * (0.45 + rand() * 0.55);
      return {
        rest: new THREE.Vector3(Math.cos(a) * r, height * (0.82 + rand() * 0.22), Math.sin(a) * r),
        phase: rand() * Math.PI * 2,
        color: colors[(start + i) % colors.length],
        bounce: 0,
        velocity: 0,
        pos: new THREE.Vector3(),
      };
    });
  }, [count, height, spread, seed, colors]);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * SEGMENTS * 2 * 3), 3));
    return g;
  }, [count]);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), world: new THREE.Vector3(), a: new THREE.Vector3(), c: new THREE.Vector3(), e: new THREE.Euler() }), []);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    balloons.forEach((b, i) => mesh.current.setColorAt(i, c.set(b.color)));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [balloons]);

  const update = (time: number, dt: number) => {
    group.current.getWorldPosition(tmp.world);
    const gust = windField(tmp.world.x, tmp.world.z, time);
    const anchorV = tmp.a.set(...anchor);
    const posAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
    balloons.forEach((b, i) => {
      // Spring for tap bounces.
      b.velocity += (-b.bounce * 30 - b.velocity * 5) * dt;
      b.bounce += b.velocity * dt;
      const bob = animate ? Math.sin(time * 0.9 + b.phase) * 0.12 : 0;
      const lean = animate ? (gust - 0.5) * 0.45 : 0;
      b.pos.copy(b.rest);
      b.pos.y += bob + b.bounce;
      b.pos.x += lean * 0.6 + (animate ? Math.sin(time * 0.6 + b.phase) * 0.06 : 0);
      b.pos.z -= lean * 0.35;
      const tilt = (b.pos.x - anchorV.x) * 0.12;
      tmp.q.setFromEuler(tmp.e.set(0, 0, -tilt));
      tmp.m.compose(tmp.c.copy(anchorV).add(b.pos), tmp.q, tmp.s);
      mesh.current.setMatrixAt(i, tmp.m);

      // String: gentle curve from the anchor to the balloon knot.
      const knotY = anchorV.y + b.pos.y - RADIUS * 1.18 - 0.06;
      for (let k = 0; k < SEGMENTS; k++) {
        for (let e = 0; e < 2; e++) {
          const t = (k + e) / SEGMENTS;
          const sag = Math.sin(t * Math.PI) * 0.12;
          const x = anchorV.x + b.pos.x * t + sag * 0.5;
          const y = anchorV.y + (knotY - anchorV.y) * t;
          const z = anchorV.z + b.pos.z * t;
          posAttr.setXYZ((i * SEGMENTS + k) * 2 + e, x, y, z);
        }
      }
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    posAttr.needsUpdate = true;
  };

  useLayoutEffect(() => {
    update(0, 0);
    mesh.current.computeBoundingSphere();
    lineGeometry.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balloons]);

  useFrame((state, dt) => update(state.clock.elapsedTime, Math.min(dt, 0.05)));

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    balloons[e.instanceId].velocity += 4.5;
    sfx('boing');
  };

  return (
    <group ref={group} position={position} rotation-y={rotation}>
      <instancedMesh ref={mesh} args={[balloonGeometry(), mats.balloon, count]} castShadow onClick={onClick} {...hoverCursor} />
      <lineSegments ref={lines} geometry={lineGeometry} material={mats.string} frustumCulled={false} />
    </group>
  );
}

interface BalloonArchProps {
  radius?: number;
  count?: number;
  position?: Vec3;
  rotation?: number;
  animate: boolean;
}

/** Semicircular balloon arch (two interleaved rows) for the party plaza entrance. */
export function BalloonArch({ radius = 3.2, count = 30, position, rotation = 0, animate }: BalloonArchProps) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const row = i % 2;
        const t = (Math.floor(i / 2) + row * 0.5) / Math.ceil(count / 2 - 0.5);
        const a = Math.PI * Math.min(1, t);
        const r = radius + (row ? 0.22 : -0.1);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: row ? 0.24 : -0.18, phase: i * 0.7, color: BALLOON_COLORS[i % BALLOON_COLORS.length], s: row ? 1.0 : 1.12 };
      }),
    [count, radius],
  );
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), v: new THREE.Vector3(), s: new THREE.Vector3() }), []);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    items.forEach((it, i) => mesh.current.setColorAt(i, c.set(it.color)));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [items]);

  const write = (time: number) => {
    items.forEach((it, i) => {
      const bob = animate ? Math.sin(time * 1.4 + it.phase) * 0.04 : 0;
      tmp.m.compose(tmp.v.set(it.x, it.y + 0.3 + bob, it.z), tmp.q, tmp.s.setScalar(it.s));
      mesh.current.setMatrixAt(i, tmp.m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    write(0);
    mesh.current.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useFrame((state) => animate && write(state.clock.elapsedTime));

  return (
    <group position={position} rotation-y={rotation}>
      <instancedMesh ref={mesh} args={[balloonGeometry(), getMaterials().balloon, count]} castShadow />
    </group>
  );
}
