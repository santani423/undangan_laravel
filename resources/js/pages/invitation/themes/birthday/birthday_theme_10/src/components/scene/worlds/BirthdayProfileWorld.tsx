import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { invitationConfig } from '../../../config/invitation.config';
import { toyAssets } from '../../../config/assets';
import { DESTINATIONS } from '../../../config/world';
import { STOP_INDEX } from '../../../config/journey';
import { useExperience } from '../../../store/experience';
import { sfx } from '../../../hooks/useMusic';
import { seededRandom } from '../../../utils/math';
import { cached, cylinder, extrudeShape, mergeParts, roundedBox, starShape, torus, type Part } from '../lib/geometry';
import { colorMaterial, getMaterials, palette } from '../lib/materials';
import { useCanvasTexture } from '../lib/textures';
import { hoverCursor } from '../interaction';
import { Mascot } from '../Mascot';
import { BalloonCluster } from '../Balloons';
import { Sparkles } from '../Sparkles';
import { ToyText } from '../ToyText';

const BLOCK_COLORS = [palette.coral, palette.sky, palette.butter, palette.mint, palette.lavender];
const BASE_TOP = 0.5;
const TOP_TOP = 0.95;

/* Stage built from toy blocks (toy-blocks.svg palette: butter, cyan, pink). */
const stageGeometry = () =>
  cached('stage', () => {
    const rand = seededRandom(8);
    const parts: Part[] = [
      { geometry: roundedBox(7.2, BASE_TOP, 4.6, 0.16), color: palette.lavender, position: [0, BASE_TOP / 2, 0] },
      { geometry: roundedBox(5.6, TOP_TOP - BASE_TOP, 3.0, 0.14), color: palette.butter, position: [0, (BASE_TOP + TOP_TOP) / 2, -0.55] },
      { geometry: roundedBox(1.7, 0.22, 0.5, 0.07), color: palette.mint, position: [0, BASE_TOP + 0.11, 1.18] },
    ];
    // studs along the side strips, like a building brick
    for (const x of [-3.25, 3.25]) {
      for (let z = -1.8; z <= 1.81; z += 0.6) parts.push({ geometry: cylinder(0.16, 0.16, 0.1, 16), color: palette.lavender, position: [x, BASE_TOP + 0.05, z] });
    }
    // block columns + lintel framing the portrait
    for (const x of [-2.45, 2.45]) {
      for (let i = 0; i < 4; i++) {
        parts.push({
          geometry: roundedBox(0.76, 0.76, 0.76, 0.1),
          color: BLOCK_COLORS[(i + (x > 0 ? 2 : 0)) % BLOCK_COLORS.length],
          position: [x, TOP_TOP + 0.38 + i * 0.76, -1.65],
          rotation: [0, (rand() - 0.5) * 0.16, 0],
        });
      }
    }
    for (let i = 0; i < 7; i++) {
      parts.push({
        geometry: roundedBox(0.76, 0.6, 0.76, 0.1),
        color: BLOCK_COLORS[(i + 1) % BLOCK_COLORS.length],
        position: [-2.45 + i * (4.9 / 6), TOP_TOP + 3.04 + 0.3, -1.65],
        rotation: [0, (rand() - 0.5) * 0.1, 0],
      });
    }
    // portrait frame ring and stars
    parts.push({ geometry: torus(1.02, 0.14, Math.PI * 2, 14, 48), color: palette.coral, position: [0, 2.4, -1.55] });
    parts.push({ geometry: cylinder(1.0, 1.0, 0.08, 40), color: palette.white, position: [0, 2.4, -1.62], rotation: [Math.PI / 2, 0, 0] });
    for (const [x, y, s] of [[-1.45, 3.35, 1], [1.5, 1.55, 0.8], [1.35, 3.5, 0.6]] as const) {
      parts.push({ geometry: extrudeShape(starShape(0.28 * s, 0.12 * s), 0.1, 0.03), color: palette.butter, position: [x, y, -1.5] });
    }
    // age badge stand
    parts.push({ geometry: cylinder(0.05, 0.06, 1.0, 8), color: palette.wood, position: [2.05, TOP_TOP + 0.5, -0.1] });
    parts.push({ geometry: cylinder(0.6, 0.6, 0.1, 36), color: palette.butter, position: [2.05, TOP_TOP + 1.35, -0.1], rotation: [Math.PI / 2, 0, 0] });
    parts.push({ geometry: torus(0.6, 0.06, Math.PI * 2, 8, 36), color: palette.coral, position: [2.05, TOP_TOP + 1.35, -0.1] });
    return mergeParts(parts);
  });

function PortraitPhoto() {
  const texture = useCanvasTexture(
    invitationConfig.child.portrait,
    { width: 512, height: 512, fit: 'cover', circle: true, background: '#e6f5ff' },
    toyAssets.illustrations.mascot,
  );
  if (!texture) return null;
  return (
    <mesh position={[0, 2.4, -1.555]}>
      <circleGeometry args={[0.93, 48]} />
      <meshStandardMaterial map={texture} roughness={0.6} />
    </mesh>
  );
}

const BLOCK = 0.7;

/** Letter blocks spelling the child's nickname; they drop in when the stage is reached. Tap to bounce. */
function LetterBlocks({ text, reached, animate }: { text: string; reached: boolean; animate: boolean }) {
  const letters = useMemo(() => [...text.toUpperCase()].slice(0, 9), [text]);
  const spacing = Math.min(0.84, 6.4 / letters.length);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const state = useRef(letters.map((_, i) => ({ y: 4 + i * 0.6, v: 0, hop: 0, hopV: 0 })));

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    letters.forEach((_, i) => {
      const g = refs.current[i];
      const s = state.current[i];
      if (!g) return;
      if (!animate) s.y = 0;
      else if (reached) {
        s.v -= 22 * dt;
        s.y += s.v * dt;
        if (s.y < 0) {
          s.y = 0;
          s.v = Math.abs(s.v) > 1.5 ? -s.v * 0.35 : 0;
        }
      }
      s.hopV -= 20 * dt;
      s.hop = Math.max(0, s.hop + s.hopV * dt);
      if (s.hop === 0) s.hopV = 0;
      g.visible = reached || !animate;
      g.position.y = BASE_TOP + BLOCK / 2 + s.y + s.hop;
    });
  });

  const onClick = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (state.current[i].hop === 0) state.current[i].hopV = 4;
    sfx('boing');
  };

  return (
    <group position={[0, 0, 1.78]}>
      {letters.map((ch, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[(i - (letters.length - 1) / 2) * spacing, BASE_TOP + BLOCK / 2, 0]}
          rotation-y={(i % 2 ? 1 : -1) * 0.06}
          onClick={onClick(i)}
          {...hoverCursor}
        >
          <mesh geometry={roundedBox(BLOCK, BLOCK, BLOCK, 0.1)} material={colorMaterial(BLOCK_COLORS[i % BLOCK_COLORS.length], 0.45)} castShadow receiveShadow />
          <ToyText position={[0, 0, BLOCK / 2 + 0.006]} fontSize={0.48} color={palette.white} outlineWidth={0.02} outlineColor={palette.ink}>
            {ch}
          </ToyText>
          <ToyText position={[0, BLOCK / 2 + 0.006, 0]} rotation-x={-Math.PI / 2} fontSize={0.4} color={palette.white}>
            {ch}
          </ToyText>
        </group>
      ))}
    </group>
  );
}

/** Destination 2 — the birthday stage built from toy blocks. */
export function BirthdayProfileWorld({ animate }: { animate: boolean }) {
  const { center, rotation } = DESTINATIONS.profile;
  const reached = useExperience((s) => s.activeStop >= STOP_INDEX.profile);
  const latched = useRef(false);
  if (reached) latched.current = true;
  const { child } = invitationConfig;
  const mats = getMaterials();

  return (
    <group position={[center[0], 0, center[1]]} rotation-y={rotation}>
      <mesh geometry={stageGeometry()} material={mats.toyMatte} castShadow receiveShadow />
      <PortraitPhoto />
      <ToyText position={[2.05, TOP_TOP + 1.42, -0.03]} fontSize={0.55} color={palette.coralDeep}>
        {String(child.age)}
      </ToyText>
      <ToyText position={[2.05, TOP_TOP + 1.08, -0.03]} fontSize={0.13} color={palette.ink}>
        TAHUN
      </ToyText>
      <LetterBlocks text={child.nickname} reached={latched.current} animate={animate} />
      <Mascot position={[-1.65, TOP_TOP, -0.05]} rotation={0.3} mode="dance" scale={1.12} hatColor={palette.coral} animate={animate} celebrateSpot="stage" />
      <BalloonCluster anchor={[-3.25, BASE_TOP, 1.85]} count={4} height={3.3} seed={5} animate={animate} />
      <BalloonCluster anchor={[3.25, BASE_TOP, 1.85]} count={4} height={3.0} seed={6} animate={animate} />
      <Sparkles position={[0, 1.0, -1.2]} radius={2.8} height={3.6} animate={animate} />
    </group>
  );
}
