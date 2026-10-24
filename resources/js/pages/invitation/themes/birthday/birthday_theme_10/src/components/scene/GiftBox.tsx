import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vec3 } from '../../config/world';
import { cached, extrudeShape, mergeParts, roundedBox, sphere, starShape, torus } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';
import { hoverCursor } from './interaction';

export interface GiftColors {
  box: string;
  ribbon: string;
  lid: string;
}

export const GIFT_STYLES: GiftColors[] = [
  { box: palette.giftBlue, ribbon: palette.giftRibbon, lid: palette.butter }, // gift-box.svg
  { box: palette.coral, ribbon: palette.white, lid: palette.mint },
  { box: palette.lavender, ribbon: palette.butter, lid: palette.coral },
  { box: palette.mint, ribbon: palette.coral, lid: palette.sky },
  { box: palette.butter, ribbon: palette.lavender, lid: palette.giftBlue },
];

const H = 0.8; // body height as a fraction of the edge

const bodyGeometry = (c: GiftColors) =>
  cached(`gift-body:${c.box}:${c.ribbon}`, () =>
    mergeParts([
      { geometry: roundedBox(1, H, 1, 0.06), color: c.box, position: [0, H / 2, 0] },
      { geometry: roundedBox(0.22, H + 0.004, 1.012, 0.03), color: c.ribbon, position: [0, H / 2, 0] },
      { geometry: roundedBox(1.012, H + 0.004, 0.22, 0.03), color: c.ribbon, position: [0, H / 2, 0] },
    ]),
  );

/** Lid built around its hinge at the back top edge so it can swing open. */
const lidGeometry = (c: GiftColors) =>
  cached(`gift-lid:${c.lid}:${c.ribbon}`, () =>
    mergeParts([
      { geometry: roundedBox(1.1, 0.22, 1.1, 0.07), color: c.lid, position: [0, 0.11, 0.5] },
      { geometry: roundedBox(0.23, 0.226, 1.112, 0.03), color: c.ribbon, position: [0, 0.11, 0.5] },
      { geometry: roundedBox(1.112, 0.226, 0.23, 0.03), color: c.ribbon, position: [0, 0.11, 0.5] },
      { geometry: torus(0.17, 0.06, Math.PI * 2, 10, 24), color: c.ribbon, position: [-0.17, 0.34, 0.5], rotation: [0, 0.35, 0.55], scale: [1, 1, 0.8] },
      { geometry: torus(0.17, 0.06, Math.PI * 2, 10, 24), color: c.ribbon, position: [0.17, 0.34, 0.5], rotation: [0, -0.35, -0.55], scale: [1, 1, 0.8] },
      { geometry: sphere(0.09, 12, 10), color: c.ribbon, position: [0, 0.26, 0.5] },
    ]),
  );

const surpriseGeometry = () =>
  cached('gift-surprise', () =>
    mergeParts([
      { geometry: extrudeShape(starShape(0.36, 0.16), 0.12, 0.04), color: palette.butter, position: [0, 0.38, 0] },
      { geometry: sphere(0.05, 8, 6), color: palette.eye, position: [-0.07, 0.42, 0.11] },
      { geometry: sphere(0.05, 8, 6), color: palette.eye, position: [0.07, 0.42, 0.11] },
      { geometry: torus(0.05, 0.012, Math.PI, 4, 10), color: palette.eye, position: [0, 0.35, 0.11], rotation: [0, 0, Math.PI] },
    ]),
  );

const springGeometry = () =>
  cached('gift-spring', () => {
    const points = Array.from({ length: 120 }, (_, i) => {
      const t = i / 119;
      return new THREE.Vector3(Math.cos(t * Math.PI * 12) * 0.08, t * 0.4, Math.sin(t * Math.PI * 12) * 0.08);
    });
    return mergeParts([{ geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, 0.016, 5), color: palette.coral }]);
  });

interface GiftBoxProps {
  position?: Vec3;
  rotation?: number;
  size?: number;
  colors?: GiftColors;
  open: boolean;
  /** Show a jack-in-the-box star when opened (the giant plaza gift). */
  surprise?: boolean;
  animate: boolean;
  onActivate?: () => void;
}

/** Toy gift box whose lid springs open (damped animation driven by the `open` prop). */
export function GiftBox({ position, rotation = 0, size = 1, colors = GIFT_STYLES[0], open, surprise = false, animate, onActivate }: GiftBoxProps) {
  const lid = useRef<THREE.Group>(null!);
  const pop = useRef<THREE.Group>(null!);
  const spring = useRef<THREE.Mesh>(null!);
  const st = useRef({ open: 0, wobble: 0 });
  const mat = getMaterials().toySatin;
  const geos = useMemo(() => ({ body: bodyGeometry(colors), lid: lidGeometry(colors) }), [colors]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    s.open = animate ? THREE.MathUtils.damp(s.open, open ? 1 : 0, 4, dt) : open ? 1 : 0;
    s.wobble = THREE.MathUtils.damp(s.wobble, 0, 3, dt);
    const t = state.clock.elapsedTime;
    lid.current.rotation.x = -1.95 * s.open - Math.abs(Math.sin(t * 18)) * s.wobble * 0.12;
    lid.current.position.y = H + s.open * 0.12;
    if (pop.current) {
      const p = Math.max(0, (s.open - 0.35) / 0.65);
      const bounce = animate ? Math.sin(t * 2.2) * 0.04 * p : 0;
      pop.current.scale.setScalar(Math.max(0.001, p));
      pop.current.position.y = H * 0.55 + p * 0.35 + bounce;
      pop.current.rotation.y = animate ? Math.sin(t * 0.9) * 0.4 : 0;
      spring.current.scale.y = Math.max(0.01, p * 1.6);
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    st.current.wobble = 1;
    onActivate?.();
  };

  return (
    <group position={position} rotation-y={rotation} scale={size} onClick={onClick} {...hoverCursor}>
      <mesh geometry={geos.body} material={mat} castShadow receiveShadow />
      <group ref={lid} position={[0, H, -0.5]}>
        <mesh geometry={geos.lid} material={mat} castShadow />
      </group>
      {surprise && (
        <>
          <mesh ref={spring} geometry={springGeometry()} material={mat} position={[0, H * 0.55, 0]} />
          <group ref={pop}>
            <mesh geometry={surpriseGeometry()} material={mat} castShadow />
          </group>
        </>
      )}
    </group>
  );
}
