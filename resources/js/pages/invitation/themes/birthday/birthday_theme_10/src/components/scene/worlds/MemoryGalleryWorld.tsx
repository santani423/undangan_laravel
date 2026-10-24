import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { invitationConfig } from '../../../config/invitation.config';
import { toyAssets } from '../../../config/assets';
import { DESTINATIONS, type Vec2, type Vec3 } from '../../../config/world';
import { setExperience, useExperience } from '../../../store/experience';
import { sfx } from '../../../hooks/useMusic';
import { cached, cone, cylinder, mergeParts, roundedBox, sphere, torus, type Part } from '../lib/geometry';
import { getMaterials, palette } from '../lib/materials';
import { useCanvasTexture } from '../lib/textures';
import { hoverCursor } from '../interaction';
import { Bushes } from '../Flowers';
import { LampPosts } from '../Props';
import type { GalleryImage } from '../../../types/invitation';

const RING_RADIUS = 2.2;
const BASE_TOP = 0.36;
const FRAME_COLORS = [palette.coral, palette.sky, palette.butter, palette.mint, palette.lavender];

const turntableGeometry = () =>
  cached('turntable', () => {
    const parts: Part[] = [
      { geometry: cylinder(3.0, 3.12, 0.3, 56), color: palette.mintDeep, colorTop: palette.mint, position: [0, 0.15, 0] },
      { geometry: torus(3.02, 0.08, Math.PI * 2, 8, 64), color: palette.butter, position: [0, 0.3, 0], rotation: [Math.PI / 2, 0, 0] },
      { geometry: cylinder(2.75, 2.75, 0.06, 56), color: palette.cream, position: [0, 0.33, 0] },
    ];
    for (let i = 0; i < 6; i++) {
      parts.push({ geometry: cylinder(0.15, 0.15, 0.42, 18), color: i % 2 ? palette.white : palette.coral, position: [0, BASE_TOP + 0.21 + i * 0.42, 0] });
    }
    parts.push({ geometry: cone(1.0, 0.62, 28), color: palette.coral, position: [0, BASE_TOP + 2.85, 0] });
    parts.push({ geometry: torus(0.98, 0.07, Math.PI * 2, 8, 40), color: palette.butter, position: [0, BASE_TOP + 2.55, 0], rotation: [Math.PI / 2, 0, 0] });
    parts.push({ geometry: sphere(0.14, 12, 10), color: palette.butter, position: [0, BASE_TOP + 3.22, 0] });
    return mergeParts(parts);
  });

const frameGeometry = (color: string) =>
  cached(`photo-frame:${color}`, () =>
    mergeParts([
      { geometry: cylinder(0.05, 0.05, 0.62, 8), color: palette.woodDark, position: [0, BASE_TOP + 0.31, -0.02] },
      { geometry: roundedBox(1.66, 1.32, 0.14, 0.1), color, position: [0, BASE_TOP + 1.25, 0] },
      { geometry: roundedBox(1.4, 1.06, 0.05, 0.03), color: palette.white, position: [0, BASE_TOP + 1.25, 0.06] },
      { geometry: cylinder(0.08, 0.08, 0.06, 12), color: palette.white, position: [-0.45, BASE_TOP + 1.94, 0], rotation: [0, 0, 0] },
      { geometry: cylinder(0.08, 0.08, 0.06, 12), color: palette.white, position: [0.45, BASE_TOP + 1.94, 0] },
    ]),
  );

let placeholder: THREE.Texture | null = null;
/** 1×1 lavender texture so photo materials always compile with a map (no recompiles later). */
const placeholderTexture = () => {
  if (!placeholder) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e9e2fb';
    ctx.fillRect(0, 0, 1, 1);
    placeholder = new THREE.CanvasTexture(canvas);
    placeholder.colorSpace = THREE.SRGBColorSpace;
  }
  return placeholder;
};

function PhotoFrame({ image, index, count, active, load, animate }: { image: GalleryImage; index: number; count: number; active: boolean; load: boolean; animate: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const lift = useRef(0);
  const gl = useThree((s) => s.gl);
  const texture = useCanvasTexture(load ? image.src : null, { width: 640, height: 480, fit: 'cover' }, toyAssets.gallery.fallback);
  const material = useRef<THREE.MeshStandardMaterial>(null!);
  const angle = (index / count) * Math.PI * 2;
  const color = FRAME_COLORS[index % FRAME_COLORS.length];

  // The material always has a map (placeholder first), so swapping in the photo
  // needs no shader recompile; uploading now avoids a hitch when it comes into view.
  useEffect(() => {
    if (!texture) return;
    gl.initTexture(texture);
    material.current.map = texture;
  }, [texture, gl]);

  useFrame((_, dt) => {
    lift.current = animate ? THREE.MathUtils.damp(lift.current, active ? 1 : 0, 5, Math.min(dt, 0.05)) : active ? 1 : 0;
    group.current.position.y = lift.current * 0.2;
    group.current.scale.setScalar(1 + lift.current * 0.1);
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setExperience({ galleryIndex: index, lightboxIndex: index });
    sfx('pop');
  };

  return (
    <group position={[Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS]} rotation-y={angle}>
      <group ref={group} onClick={onClick} {...hoverCursor}>
        <mesh geometry={frameGeometry(color)} material={getMaterials().toySatin} castShadow />
        <mesh position={[0, BASE_TOP + 1.25, 0.09]}>
          <planeGeometry args={[1.32, 0.99]} />
          <meshStandardMaterial ref={material} map={placeholderTexture()} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

const BUSHES: Vec2[] = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (0.62 + (i / 8) * 0.76);
  return [Math.sin(a) * 4.3, Math.cos(a) * 4.3];
});

const LAMPS: Vec3[] = [
  [-3.7, 0, 1.6],
  [3.7, 0, 1.6],
];

/** Destination 4 — a toy photo carousel; the selected photo turns to face the visitor. */
export function MemoryGalleryWorld({ animate }: { animate: boolean }) {
  const { center, rotation } = DESTINATIONS.gallery;
  const images = useMemo(() => invitationConfig.gallery.slice(0, 8), []);
  const count = Math.max(1, images.length);
  const galleryIndex = useExperience((s) => s.galleryIndex % count);
  // Photos are non-critical: load them in idle time once the critical scene is ready.
  const load = useExperience((s) => s.sceneReady);
  const ring = useRef<THREE.Group>(null!);
  const current = useRef(0);

  useFrame((_, dt) => {
    // Rotate the shortest way so the active frame faces the camera (+Z in local space).
    let target = -(galleryIndex / count) * Math.PI * 2;
    while (target - current.current > Math.PI) target -= Math.PI * 2;
    while (target - current.current < -Math.PI) target += Math.PI * 2;
    current.current = animate ? THREE.MathUtils.damp(current.current, target, 3.2, Math.min(dt, 0.05)) : target;
    ring.current.rotation.y = current.current;
  });

  return (
    <group position={[center[0], 0, center[1]]} rotation-y={rotation}>
      <mesh geometry={turntableGeometry()} material={getMaterials().toySatin} castShadow receiveShadow />
      <group ref={ring}>
        {images.map((img, i) => (
          <PhotoFrame key={img.id} image={img} index={i} count={count} active={i === galleryIndex} load={load} animate={animate} />
        ))}
      </group>
      <Bushes positions={BUSHES} />
      <LampPosts positions={LAMPS} />
    </group>
  );
}
