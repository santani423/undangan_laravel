import { BufferGeometry, Float32BufferAttribute, type Material, type Mesh } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FALLBACK_PALETTE, type RGB } from './materials';
import { ASSET_BASE } from './textures';
import type { ModelName } from './worldLayout';

export const MODEL_DIR = `${ASSET_BASE}models/`;
export const PALETTE_FILE = 'voxel_wedding_palette.mtl';

/** One merged geometry per MTL material — rendered as one instanced draw call. */
export interface VoxelPart {
  material: string;
  color: RGB;
  geometry: BufferGeometry;
}

export interface VoxelModel {
  name: ModelName;
  parts: VoxelPart[];
  /** True when the OBJ failed to load and procedural geometry is used instead. */
  isFallback: boolean;
}

type Palette = Record<string, RGB>;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/**
 * The supplied OBJ files wind every face clockwise (normals point inwards).
 * Each material bucket is made of closed cuboids, so a negative signed volume
 * tells us to flip the triangles; correctly wound assets are left untouched.
 */
export function orientOutward(positions: number[]): void {
  let volume = 0;
  for (let i = 0; i < positions.length; i += 9) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = positions.slice(i, i + 9);
    volume += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
  }
  if (volume >= 0) return;
  for (let i = 0; i < positions.length; i += 9) {
    for (let k = 0; k < 3; k++) {
      const tmp = positions[i + 3 + k];
      positions[i + 3 + k] = positions[i + 6 + k];
      positions[i + 6 + k] = tmp;
    }
  }
}

/** Planar box-projected UVs (1 texture repeat per world unit) for untextured OBJ cuboids. */
export function applyBoxUVs(geometry: BufferGeometry): void {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uvs = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    if (ny >= nx && ny >= nz) {
      uvs[i * 2] = x;
      uvs[i * 2 + 1] = z;
    } else if (nx >= nz) {
      uvs[i * 2] = z;
      uvs[i * 2 + 1] = y;
    } else {
      uvs[i * 2] = x;
      uvs[i * 2 + 1] = y;
    }
  }
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
}

export function buildPartGeometry(positions: number[]): BufferGeometry {
  orientOutward(positions);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals(); // non-indexed → flat per-face normals
  applyBoxUVs(geometry);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Outward-wound triangles for an axis-aligned box. */
export function boxTriangles(min: [number, number, number], max: [number, number, number]): number[] {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const quads: number[][] = [
    [x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1], // +x
    [x0, y0, z1, x0, y1, z1, x0, y1, z0, x0, y0, z0], // -x
    [x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0], // +y
    [x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1], // -y
    [x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], // +z
    [x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], // -z
  ];
  const out: number[] = [];
  for (const q of quads) {
    out.push(q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7], q[8]);
    out.push(q[0], q[1], q[2], q[6], q[7], q[8], q[9], q[10], q[11]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Procedural fallbacks (used only if an OBJ cannot be loaded)
// ---------------------------------------------------------------------------

type FallbackBox = [material: string, min: [number, number, number], max: [number, number, number]];

const FALLBACK_RECIPES: Record<ModelName, FallbackBox[]> = {
  voxel_tree: [
    ['wood', [-0.16, 0, -0.16], [0.16, 1.6, 0.16]],
    ['leaf_light', [-0.75, 1.24, -0.75], [0.75, 2.4, 0.75]],
    ['leaf', [-0.45, 2.3, -0.45], [0.45, 2.79, 0.45]],
  ],
  blossom_tree: [
    ['wood_light', [-0.11, 0, -0.11], [0.11, 1.1, 0.11]],
    ['rose', [-0.57, 0.98, -0.57], [0.57, 1.6, 0.57]],
    ['blush', [-0.35, 1.55, -0.35], [0.35, 1.88, 0.35]],
  ],
  wedding_arch: [
    ['cream', [-1.14, 0, -0.14], [-0.86, 2.3, 0.14]],
    ['cream', [0.86, 0, -0.14], [1.14, 2.3, 0.14]],
    ['gold', [-1.14, 2.14, -0.14], [1.14, 2.42, 0.14]],
    ['rose', [-0.5, 2.42, -0.12], [0.5, 2.6, 0.12]],
  ],
  garden_bench: [
    ['wood_light', [-0.9, 0.56, -0.28], [0.9, 0.74, 0.28]],
    ['wood', [-0.9, 0.62, -0.3], [0.9, 1.27, -0.14]],
    ['wood', [-0.76, 0, -0.08], [-0.6, 0.6, 0.08]],
    ['wood', [0.6, 0, -0.08], [0.76, 0.6, 0.08]],
  ],
  garden_lantern: [
    ['wood', [-0.24, 0.06, -0.24], [0.24, 0.18, 0.24]],
    ['glass', [-0.19, 0.18, -0.19], [0.19, 0.72, 0.19]],
    ['gold', [-0.26, 0.71, -0.26], [0.26, 0.99, 0.26]],
  ],
  flower_arrangement: [
    ['leaf', [-0.08, 0, -0.08], [0.08, 0.4, 0.08]],
    ['rose', [-0.32, 0.33, -0.12], [-0.08, 0.57, 0.12]],
    ['blush', [0.08, 0.33, -0.12], [0.32, 0.57, 0.12]],
  ],
  gift_box: [
    ['rose', [-0.45, 0, -0.45], [0.45, 0.7, 0.45]],
    ['gold', [-0.5, 0.68, -0.5], [0.5, 0.8, 0.5]],
    ['cream', [-0.07, 0, -0.5], [0.07, 0.72, 0.5]],
  ],
  garden_cottage: [
    ['cream', [-0.9, 0, -0.75], [0.9, 1.3, 0.75]],
    ['rose', [-1.05, 1.26, -0.9], [1.05, 1.71, 0.9]],
    ['wood', [-0.59, 0.1, 0.73], [-0.25, 0.75, 0.81]],
  ],
  grass_tile: [
    ['dirt', [-1, -0.24, -1], [1, 0, 1]],
    ['grass', [-1, -0.03, -1], [1, 0.05, 1]],
  ],
  stepping_stones: [
    ['stone_light', [-0.94, -0.04, -0.29], [-0.36, 0.08, 0.29]],
    ['stone_light', [-0.35, -0.04, -0.3], [0.35, 0.08, 0.4]],
    ['stone_light', [0.41, -0.04, -0.31], [0.95, 0.08, 0.23]],
  ],
  wedding_rings_voxel: [
    ['gold', [-0.65, 0.13, -0.09], [-0.55, 0.87, 0.09]],
    ['gold', [-0.13, 0.13, -0.09], [-0.03, 0.87, 0.09]],
    ['gold', [-0.65, 0.77, -0.09], [-0.03, 0.87, 0.09]],
    ['gold', [-0.65, 0.13, -0.09], [-0.03, 0.23, 0.09]],
    ['cream', [0.03, 0.13, -0.09], [0.13, 0.87, 0.09]],
    ['cream', [0.55, 0.13, -0.09], [0.65, 0.87, 0.09]],
    ['cream', [0.03, 0.77, -0.09], [0.65, 0.87, 0.09]],
    ['cream', [0.03, 0.13, -0.09], [0.65, 0.23, 0.09]],
  ],
};

export function createFallbackModel(name: ModelName, palette: Palette = FALLBACK_PALETTE): VoxelModel {
  const buckets = new Map<string, number[]>();
  for (const [material, min, max] of FALLBACK_RECIPES[name]) {
    const bucket = buckets.get(material) ?? [];
    bucket.push(...boxTriangles(min, max));
    buckets.set(material, bucket);
  }
  return {
    name,
    isFallback: true,
    parts: [...buckets].map(([material, positions]) => ({
      material,
      color: palette[material] ?? FALLBACK_PALETTE[material] ?? [0.8, 0.8, 0.8],
      geometry: buildPartGeometry(positions),
    })),
  };
}

// ---------------------------------------------------------------------------
// OBJ + MTL loading
// ---------------------------------------------------------------------------

let paletteRequest: Promise<{ creator: MTLLoader.MaterialCreator | null; palette: Palette }> | null = null;

function loadPalette() {
  if (!paletteRequest) {
    paletteRequest = new MTLLoader()
      .setPath(MODEL_DIR)
      .loadAsync(PALETTE_FILE)
      .then((creator) => {
        creator.preload();
        const palette: Palette = { ...FALLBACK_PALETTE };
        for (const [name, info] of Object.entries(creator.materialsInfo)) {
          if (info.kd && info.kd.length >= 3) palette[name] = [info.kd[0], info.kd[1], info.kd[2]];
        }
        return { creator, palette };
      })
      .catch((error: unknown) => {
        console.warn('[undesia] Palet MTL gagal dimuat; memakai palet cadangan.', error);
        return { creator: null, palette: { ...FALLBACK_PALETTE } };
      });
  }
  return paletteRequest;
}

/**
 * Splits an OBJLoader result into one position buffer per material name.
 * Exported for tests (they parse the real OBJ files from disk).
 */
export function splitByMaterial(root: { traverse: (cb: (obj: unknown) => void) => void }): Map<string, number[]> {
  const buckets = new Map<string, number[]>();
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry as BufferGeometry;
    const position = geometry.getAttribute('position');
    const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const groups = geometry.groups.length > 0 ? geometry.groups : [{ start: 0, count: position.count, materialIndex: 0 }];
    for (const group of groups) {
      const name = materials[group.materialIndex ?? 0]?.name || 'default';
      const bucket = buckets.get(name) ?? [];
      const end = Math.min(position.count, group.start + group.count);
      for (let i = group.start; i < end; i++) bucket.push(position.getX(i), position.getY(i), position.getZ(i));
      buckets.set(name, bucket);
    }
    geometry.dispose();
  });
  return buckets;
}

const modelRequests = new Map<ModelName, Promise<VoxelModel>>();
const builtModels = new Set<VoxelModel>();

async function requestModel(name: ModelName): Promise<VoxelModel> {
  const { creator, palette } = await loadPalette();
  try {
    const loader = new OBJLoader().setPath(MODEL_DIR);
    if (creator) loader.setMaterials(creator);
    const root = await loader.loadAsync(`${name}.obj`);
    const buckets = splitByMaterial(root);
    if (buckets.size === 0) throw new Error('OBJ tidak memiliki mesh');

    const parts: VoxelPart[] = [];
    for (const [material, positions] of buckets) {
      if (creator && !creator.materialsInfo[material]) {
        console.warn(`[undesia] Material "${material}" pada ${name}.obj tidak ada di ${PALETTE_FILE}.`);
      }
      parts.push({ material, color: palette[material] ?? [0.8, 0.8, 0.8], geometry: buildPartGeometry(positions) });
    }
    return { name, parts, isFallback: false };
  } catch (error) {
    console.warn(`[undesia] Model "${name}" gagal dimuat; memakai geometri cadangan.`, error);
    return createFallbackModel(name, palette);
  }
}

/** Cached, never-rejecting model request (safe to pass to React `use`). */
export function loadVoxelModel(name: ModelName): Promise<VoxelModel> {
  let request = modelRequests.get(name);
  if (!request) {
    request = requestModel(name).then((model) => {
      builtModels.add(model);
      return model;
    });
    modelRequests.set(name, request);
  }
  return request;
}

export function disposeVoxelModels(): void {
  builtModels.forEach((model) => model.parts.forEach((part) => part.geometry.dispose()));
}
