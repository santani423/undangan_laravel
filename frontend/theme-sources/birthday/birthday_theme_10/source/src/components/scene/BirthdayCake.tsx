import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { fallbackSoftParticle, useSafeTexture } from './lib/criticalTextures';
import { toyAssets } from '../../config/assets';
import type { Vec3 } from '../../config/world';
import { celebrate } from '../../store/celebrations';
import { sfx } from '../../hooks/useMusic';
import { cached, capsule, cylinder, mergeParts, sphere, torus, type Part } from './lib/geometry';
import { getMaterials, palette } from './lib/materials';
import { hoverCursor } from './interaction';
import { ToyText } from './ToyText';

const T1 = { r: 1.15, h: 0.85, y: 0.14 };
const T2 = { r: 0.78, h: 0.7, y: T1.y + T1.h + 0.12 };
export const CAKE_TOP = T2.y + T2.h + 0.1;

function drips(radius: number, y: number, count: number, seed: number): Part[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const len = 0.08 + (((i * 7 + seed) % 5) / 5) * 0.16;
    return { geometry: capsule(0.06, len), color: palette.frosting, position: [Math.cos(a) * radius, y - len / 2, Math.sin(a) * radius] as Vec3 };
  });
}

function dots(radius: number, y: number, count: number, offset = 0): Part[] {
  return Array.from({ length: count }, (_, i) => {
    const a = ((i + offset) / count) * Math.PI * 2;
    return { geometry: sphere(0.055, 8, 6), color: '#ffffff', position: [Math.cos(a) * radius, y + (i % 2) * 0.12, Math.sin(a) * radius] as Vec3 };
  });
}

/* Based on birthday-cake.svg: light-blue plate, pink sponge, cream wavy frosting, white dots. */
const cakeGeometry = () =>
  cached('cake', () =>
    mergeParts([
      { geometry: cylinder(1.5, 1.38, 0.14, 48), color: palette.plate, position: [0, 0.07, 0] },
      { geometry: torus(1.46, 0.05, Math.PI * 2, 8, 48), color: '#5eb8cb', position: [0, 0.13, 0], rotation: [Math.PI / 2, 0, 0] },
      { geometry: cylinder(T1.r, T1.r, T1.h, 48), color: palette.cakeDeep, colorTop: palette.cake, position: [0, T1.y + T1.h / 2, 0] },
      { geometry: cylinder(T1.r + 0.04, T1.r + 0.04, 0.14, 48), color: palette.frosting, position: [0, T1.y + T1.h + 0.04, 0] },
      ...drips(T1.r + 0.02, T1.y + T1.h, 16, 1),
      ...dots(T1.r + 0.02, T1.y + 0.32, 14),
      { geometry: cylinder(T2.r, T2.r, T2.h, 40), color: palette.cakeDeep, colorTop: palette.cake, position: [0, T2.y + T2.h / 2, 0] },
      { geometry: cylinder(T2.r + 0.04, T2.r + 0.04, 0.12, 40), color: palette.frosting, position: [0, T2.y + T2.h + 0.03, 0] },
      ...drips(T2.r + 0.02, T2.y + T2.h, 11, 3),
      ...dots(T2.r + 0.02, T2.y + 0.25, 10, 0.5),
      { geometry: sphere(0.09, 10, 8), color: '#ff5c7a', position: [0.62, CAKE_TOP + 0.04, 0.1] },
      { geometry: sphere(0.09, 10, 8), color: '#ff5c7a', position: [-0.5, CAKE_TOP + 0.04, 0.35] },
      { geometry: sphere(0.09, 10, 8), color: '#ff5c7a', position: [-0.1, CAKE_TOP + 0.04, -0.62] },
    ]),
  );

const candleGeometry = () =>
  cached('candle', () =>
    mergeParts([
      { geometry: cylinder(0.05, 0.05, 0.42, 10), color: palette.candle, position: [0, 0.21, 0] },
      { geometry: torus(0.052, 0.012, Math.PI * 2, 4, 12), color: '#ffffff', position: [0, 0.12, 0], rotation: [Math.PI / 2, 0, 0.3] },
      { geometry: torus(0.052, 0.012, Math.PI * 2, 4, 12), color: '#ffffff', position: [0, 0.28, 0], rotation: [Math.PI / 2, 0, 0.3] },
      { geometry: cylinder(0.008, 0.008, 0.06, 4), color: '#4a3b35', position: [0, 0.45, 0] },
    ]),
  );

interface BirthdayCakeProps {
  position?: Vec3;
  candles: number;
  age: number;
  /** Candles are lit when the party destination is reached. */
  lit: boolean;
  animate: boolean;
}

/** Oversized two-tier birthday cake. Tap it for a candle flare and confetti. */
export function BirthdayCake({ position, candles, age, lit, animate }: BirthdayCakeProps) {
  const glowMap = useSafeTexture(toyAssets.sprites.softParticle) ?? fallbackSoftParticle();
  const flames = useRef<THREE.Group>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const state = useRef({ level: 0, flare: 0 });
  const mats = getMaterials();
  const count = Math.max(1, Math.min(9, candles));
  const spots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.PI / 2;
        const r = count === 1 ? 0 : 0.48;
        return [Math.cos(a) * r, CAKE_TOP, Math.sin(a) * r] as Vec3;
      }),
    [count],
  );
  const glowMaterial = useMemo(
    () => new THREE.SpriteMaterial({ map: glowMap, color: '#ffd77a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
    [glowMap],
  );

  useFrame((s, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = state.current;
    st.level = THREE.MathUtils.damp(st.level, lit ? 1 : 0, 3, dt);
    st.flare = THREE.MathUtils.damp(st.flare, 0, 1.6, dt);
    const t = s.clock.elapsedTime;
    flames.current.children.forEach((flame, i) => {
      const flicker = animate ? 1 + Math.sin(t * 13 + i * 1.7) * 0.08 + Math.sin(t * 23 + i) * 0.05 : 1;
      const k = st.level * flicker * (1 + st.flare * 0.7);
      flame.scale.set(k, k * (1 + st.flare * 0.4), k);
    });
    glowMaterial.opacity = st.level * (0.55 + st.flare * 0.4);
    light.current.intensity = st.level * (1.6 + st.flare * 2.5);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    state.current.flare = 1;
    celebrate('cake', 0.9);
    sfx('chime');
  };

  return (
    <group position={position}>
      <mesh geometry={cakeGeometry()} material={mats.toySatin} castShadow receiveShadow onClick={onClick} {...hoverCursor} />
      {spots.map((p, i) => (
        <mesh key={i} geometry={candleGeometry()} material={mats.toySatin} position={p} castShadow />
      ))}
      <group ref={flames}>
        {spots.map((p, i) => (
          <group key={i} position={[p[0], p[1] + 0.52, p[2]]}>
            <mesh material={mats.flame} scale={[1, 1.8, 1]}>
              <sphereGeometry args={[0.055, 10, 8]} />
            </mesh>
            <sprite material={glowMaterial} scale={0.45} />
          </group>
        ))}
      </group>
      <pointLight ref={light} position={[0, CAKE_TOP + 0.8, 0.2]} color="#ffcf7a" intensity={0} distance={5} decay={1.6} />
      {/* age topper */}
      <mesh position={[0, CAKE_TOP + 0.35, 0]} material={mats.toyMatte}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
      </mesh>
      <group position={[0, CAKE_TOP + 0.82, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.27, 0.27, 0.06, 28]} />
          <meshStandardMaterial color={palette.butter} roughness={0.5} />
        </mesh>
        <ToyText position={[0, 0.0, 0.035]} fontSize={0.36} color={palette.coralDeep}>
          {String(age)}
        </ToyText>
        <ToyText position={[0, 0.0, -0.035]} rotation-y={Math.PI} fontSize={0.36} color={palette.coralDeep}>
          {String(age)}
        </ToyText>
      </group>
    </group>
  );
}
