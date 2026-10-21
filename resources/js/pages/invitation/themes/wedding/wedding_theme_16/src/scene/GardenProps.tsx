import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  SpriteMaterial,
  type Group,
  type InstancedMesh,
  type Sprite,
  type Texture,
} from 'three';
import { CAMERA_WAYPOINTS } from '../data/cameraWaypoints';
import { journey } from './journeyState';
import { getVoxelMaterial } from './materials';
import { sharedUniforms } from './sharedUniforms';
import { loadImageTexture, loadTexture } from './textures';
import { VoxelAsset } from './VoxelAsset';
import {
  EASELS,
  FLOATING_GIFT,
  GUESTBOOK_BENCH,
  MAP_PIN,
  PALETTE_PILLARS,
  RINGS,
  type Placement,
} from './worldLayout';

// ---------------------------------------------------------------------------
// Gallery easels — show the owner's first gallery images inside the garden.
// ---------------------------------------------------------------------------

const CANVAS_W = 1.56;
const CANVAS_H = 1.16;

function fitTexture(texture: Texture): Texture {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const aspect = image?.width && image?.height ? image.width / image.height : CANVAS_W / CANVAS_H;
  const target = CANVAS_W / CANVAS_H;
  // "object-fit: cover" crop.
  if (aspect > target) {
    texture.repeat.set(target / aspect, 1);
    texture.offset.set((1 - target / aspect) / 2, 0);
  } else {
    texture.repeat.set(1, aspect / target);
    texture.offset.set(0, (1 - aspect / target) / 2);
  }
  return texture;
}

function Easel({ placement, imageUrl, geometries }: { placement: Placement; imageUrl?: string; geometries: EaselGeometries }) {
  const material = useMemo(() => new MeshStandardMaterial({ color: '#f5eddd', roughness: 0.9 }), []);

  useEffect(() => {
    let cancelled = false;
    const apply = (texture: Texture | null) => {
      if (!texture || cancelled) return;
      material.map = texture;
      material.color.set('#ffffff');
      material.needsUpdate = true;
    };
    if (imageUrl) {
      void loadImageTexture(imageUrl).then((texture) => (texture ? apply(fitTexture(texture)) : loadTexture('ivory_fabric').then(apply)));
    } else {
      void loadTexture('ivory_fabric').then(apply);
    }
    return () => {
      cancelled = true;
    };
  }, [imageUrl, material]);

  useEffect(() => () => material.dispose(), [material]);

  const wood = getVoxelMaterial('wood');
  const gold = getVoxelMaterial('gold');

  return (
    <group position={[placement.x, 0, placement.z]} rotation={[0, placement.rotY ?? 0, 0]}>
      <mesh geometry={geometries.post} material={wood} position={[-0.72, 1.15, -0.06]} castShadow />
      <mesh geometry={geometries.post} material={wood} position={[0.72, 1.15, -0.06]} castShadow />
      <mesh geometry={geometries.ledge} material={wood} position={[0, 0.88, 0.02]} castShadow />
      <mesh geometry={geometries.frame} material={gold} position={[0, 1.58, 0]} castShadow />
      <mesh geometry={geometries.canvas} material={material} position={[0, 1.58, 0.046]} />
    </group>
  );
}

interface EaselGeometries {
  post: BoxGeometry;
  ledge: BoxGeometry;
  frame: BoxGeometry;
  canvas: PlaneGeometry;
}

export function GalleryEasels({ images }: { images: string[] }) {
  const geometries = useMemo<EaselGeometries>(
    () => ({
      post: new BoxGeometry(0.12, 2.3, 0.12),
      ledge: new BoxGeometry(1.7, 0.1, 0.22),
      frame: new BoxGeometry(CANVAS_W + 0.18, CANVAS_H + 0.18, 0.08),
      canvas: new PlaneGeometry(CANVAS_W, CANVAS_H),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  return (
    <>
      {EASELS.map((placement, i) => (
        <Easel key={`${placement.x}:${placement.z}`} placement={placement} imageUrl={images[i]} geometries={geometries} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Dress-code palette pillars — coloured from the invitation configuration.
// ---------------------------------------------------------------------------

const PILLAR_HEIGHTS = [2, 3, 2, 3, 2, 3];
const CUBE = 0.78;

export function PalettePillars({ palette }: { palette: string[] }) {
  const ref = useRef<InstancedMesh>(null);
  const cubes = useMemo(() => {
    const list: { x: number; y: number; z: number; color: string }[] = [];
    palette.slice(0, 5).forEach((hex, i) => {
      const x = PALETTE_PILLARS.startX + i * PALETTE_PILLARS.spacing;
      for (let k = 0; k < PILLAR_HEIGHTS[i]; k++) {
        list.push({ x, y: 0.05 + CUBE / 2 + k * CUBE, z: PALETTE_PILLARS.z, color: hex });
      }
    });
    return list;
  }, [palette]);

  const resources = useMemo(
    () => ({ geometry: new BoxGeometry(CUBE, CUBE, CUBE), material: new MeshStandardMaterial({ roughness: 0.75, flatShading: true }) }),
    [],
  );
  useEffect(
    () => () => {
      resources.geometry.dispose();
      resources.material.dispose();
    },
    [resources],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new Color();
    const matrix = new Matrix4();
    cubes.forEach((cube, i) => {
      mesh.setMatrixAt(i, matrix.makeTranslation(cube.x, cube.y, cube.z));
      mesh.setColorAt(i, color.set(cube.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [cubes]);

  if (cubes.length === 0) return null;
  return <instancedMesh ref={ref} args={[resources.geometry, resources.material, cubes.length]} castShadow receiveShadow />;
}

// ---------------------------------------------------------------------------
// Location pin — pops up above the venue pavilion in the aerial map view.
// ---------------------------------------------------------------------------

const PIN_PIXELS: [number, number, 'rose' | 'ivory'][] = [
  [-1, 4, 'rose'], [0, 4, 'rose'], [1, 4, 'rose'],
  [-2, 3, 'rose'], [-1, 3, 'rose'], [0, 3, 'ivory'], [1, 3, 'rose'], [2, 3, 'rose'],
  [-2, 2, 'rose'], [-1, 2, 'rose'], [0, 2, 'rose'], [1, 2, 'rose'], [2, 2, 'rose'],
  [-1, 1, 'rose'], [0, 1, 'rose'], [1, 1, 'rose'],
  [0, 0, 'rose'],
];
const LOCATION_INDEX = CAMERA_WAYPOINTS.findIndex((w) => w.id === 'lokasi');

export function MapPin({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const ref = useRef<InstancedMesh>(null);
  const resources = useMemo(
    () => ({
      geometry: new BoxGeometry(0.5, 0.5, 0.5),
      material: new MeshStandardMaterial({ roughness: 0.6, emissive: '#7a2a35', emissiveIntensity: 0.25, flatShading: true }),
    }),
    [],
  );
  useEffect(
    () => () => {
      resources.geometry.dispose();
      resources.material.dispose();
    },
    [resources],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const color = new Color();
    const matrix = new Matrix4();
    PIN_PIXELS.forEach(([x, y, tone], i) => {
      mesh.setMatrixAt(i, matrix.makeTranslation(x * 0.5, y * 0.5, 0));
      mesh.setColorAt(i, tone === 'rose' ? color.setRGB(0.78, 0.37, 0.42, SRGBColorSpace) : color.setRGB(0.98, 0.94, 0.85, SRGBColorSpace));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const distance = Math.abs(journey.u - LOCATION_INDEX);
    const visibility = Math.max(0, Math.min(1, (1.3 - distance) / 0.6));
    g.visible = visibility > 0.01;
    const scale = visibility * visibility * (3 - 2 * visibility);
    g.scale.setScalar(scale * 1.3);
    const t = animate ? clock.elapsedTime : 0;
    g.position.y = MAP_PIN.y + Math.sin(t * 1.6) * 0.25;
    g.rotation.y = animate ? t * 0.6 : 0.6;
  });

  return (
    <group ref={group} position={[MAP_PIN.x, MAP_PIN.y, MAP_PIN.z]} visible={false}>
      <instancedMesh ref={ref} args={[resources.geometry, resources.material, PIN_PIXELS.length]} castShadow />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Floating gift, wedding rings and the guestbook
// ---------------------------------------------------------------------------

const ORIGIN: Placement = { x: 0, z: 0 };

export function FloatingGift({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g || !animate) return;
    const t = clock.elapsedTime;
    g.position.y = (FLOATING_GIFT.y ?? 0) + Math.sin(t * 1.3) * 0.12;
    g.rotation.y = (FLOATING_GIFT.rotY ?? 0) + Math.sin(t * 0.5) * 0.35;
  });
  return (
    <group
      ref={group}
      position={[FLOATING_GIFT.x, FLOATING_GIFT.y ?? 0, FLOATING_GIFT.z]}
      rotation={[0, FLOATING_GIFT.rotY ?? 0, 0]}
      scale={FLOATING_GIFT.scale}
    >
      <VoxelAsset model="gift_box" placement={ORIGIN} />
    </group>
  );
}

function createGlowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** The supplied voxel rings above the ceremony arch, with a soft glow that strengthens at dusk. */
export function WeddingRings({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);
  const glowRef = useRef<Sprite>(null);
  const glow = useMemo(() => {
    const map = createGlowTexture();
    return new SpriteMaterial({ map, color: '#ffd08a', transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false });
  }, []);
  useEffect(
    () => () => {
      glow.map?.dispose();
      glow.dispose();
    },
    [glow],
  );

  useFrame(({ clock }) => {
    const sprite = glowRef.current;
    if (sprite) (sprite.material as SpriteMaterial).opacity = 0.18 + sharedUniforms.uDusk.value * 0.42;
    const g = group.current;
    if (!g || !animate) return;
    const t = clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.45) * 0.32;
    g.position.y = (RINGS.y ?? 0) + Math.sin(t * 1.1) * 0.12;
  });

  const scale = RINGS.scale ?? 1;
  return (
    <>
      <sprite ref={glowRef} material={glow} position={[RINGS.x, (RINGS.y ?? 0) + 0.5 * scale, RINGS.z - 0.3]} scale={[3.4 * scale, 3.4 * scale, 1]} />
      <group ref={group} position={[RINGS.x, RINGS.y ?? 0, RINGS.z]} scale={scale}>
        <VoxelAsset model="wedding_rings_voxel" placement={ORIGIN} />
      </group>
    </>
  );
}

/** An open guestbook resting on the bench beneath the wishing tree. */
export function Guestbook() {
  const resources = useMemo(
    () => ({
      cover: new BoxGeometry(0.62, 0.05, 0.44),
      page: new BoxGeometry(0.27, 0.05, 0.4),
      ribbon: new BoxGeometry(0.04, 0.02, 0.5),
      coverMaterial: new MeshStandardMaterial({ color: new Color().setRGB(0.78, 0.37, 0.42, SRGBColorSpace), roughness: 0.8 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      resources.cover.dispose();
      resources.page.dispose();
      resources.ribbon.dispose();
      resources.coverMaterial.dispose();
    },
    [resources],
  );
  const seatTop = 0.74 * (GUESTBOOK_BENCH.scale ?? 1);
  const ivory = getVoxelMaterial('ivory');
  const gold = getVoxelMaterial('gold');
  return (
    <group position={[GUESTBOOK_BENCH.x, seatTop, GUESTBOOK_BENCH.z]} rotation={[0, GUESTBOOK_BENCH.rotY ?? 0, 0]}>
      <mesh geometry={resources.cover} material={resources.coverMaterial} position={[0, 0.025, 0.05]} castShadow />
      <mesh geometry={resources.page} material={ivory} position={[-0.15, 0.07, 0.05]} rotation={[0, 0, 0.06]} />
      <mesh geometry={resources.page} material={ivory} position={[0.15, 0.07, 0.05]} rotation={[0, 0, -0.06]} />
      <mesh geometry={resources.ribbon} material={gold} position={[0.02, 0.1, 0.08]} />
    </group>
  );
}
