import { Color, MeshStandardMaterial, SRGBColorSpace } from 'three';
import { sharedUniforms } from './sharedUniforms';
import { loadTexture, type TextureName } from './textures';

export type RGB = [number, number, number];

/**
 * Kd values of `voxel_wedding_palette.mtl`, used only if the MTL file itself
 * fails to load. The live values always come from the MTL.
 */
export const FALLBACK_PALETTE: Record<string, RGB> = {
  grass: [0.3, 0.55, 0.27],
  grass_light: [0.47, 0.68, 0.34],
  dirt: [0.43, 0.29, 0.18],
  wood: [0.43, 0.27, 0.16],
  wood_light: [0.62, 0.42, 0.25],
  leaf: [0.2, 0.43, 0.24],
  leaf_light: [0.31, 0.56, 0.29],
  stone: [0.62, 0.62, 0.57],
  stone_light: [0.78, 0.76, 0.68],
  cream: [0.93, 0.86, 0.72],
  ivory: [0.98, 0.94, 0.85],
  gold: [0.83, 0.61, 0.27],
  rose: [0.78, 0.37, 0.42],
  blush: [0.93, 0.65, 0.65],
  white: [0.96, 0.95, 0.91],
  dark: [0.16, 0.18, 0.16],
  water: [0.25, 0.58, 0.68],
  glass: [0.55, 0.78, 0.8],
  purple: [0.47, 0.33, 0.57],
  blue: [0.35, 0.52, 0.7],
};

/**
 * Materials that receive one of the supplied SVG textures. The tint multiplies
 * the texture (which already carries the base colour) once it has loaded.
 */
const TEXTURED: Record<string, { texture: TextureName; tint: RGB }> = {
  wood: { texture: 'wood', tint: [1, 1, 1] },
  wood_light: { texture: 'wood', tint: [1.35, 1.32, 1.3] },
  stone: { texture: 'stone', tint: [0.92, 0.92, 0.92] },
  stone_light: { texture: 'stone', tint: [1.14, 1.13, 1.1] },
  cream: { texture: 'ivory_fabric', tint: [0.97, 0.92, 0.84] },
  ivory: { texture: 'ivory_fabric', tint: [1, 1, 1] },
  dirt: { texture: 'dirt', tint: [1, 1, 1] },
  grass: { texture: 'grass', tint: [1, 1, 1] },
  grass_light: { texture: 'grass', tint: [1.25, 1.22, 1.2] },
};

const library = new Map<string, MeshStandardMaterial>();

function srgb([r, g, b]: RGB): Color {
  return new Color().setRGB(r, g, b, SRGBColorSpace);
}

function bindTexture(material: MeshStandardMaterial, name: string): void {
  const spec = TEXTURED[name];
  if (!spec) return;
  void loadTexture(spec.texture).then((texture) => {
    if (!texture) return;
    material.map = texture;
    material.color.copy(srgb(spec.tint));
    material.needsUpdate = true;
  });
}

function createMaterial(name: string, kd: RGB): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    name,
    color: srgb(kd),
    roughness: 0.88,
    metalness: 0,
    flatShading: true,
  });

  switch (name) {
    case 'gold':
      material.metalness = 0.55;
      material.roughness = 0.38;
      material.emissive = srgb([0.83, 0.61, 0.27]);
      material.emissiveIntensity = 0.06;
      break;
    case 'glass':
      // Lantern panes and cottage windows glow warmer as dusk falls
      // (emissiveIntensity is driven by SceneLighting).
      material.emissive = new Color('#ffc46b');
      material.emissiveIntensity = 0.25;
      material.roughness = 0.25;
      break;
    case 'white':
    case 'ivory':
      material.roughness = 0.8;
      break;
    default:
      break;
  }

  bindTexture(material, name);
  return material;
}

/** Returns the shared material for an MTL material name (created once). */
export function getVoxelMaterial(name: string, kd?: RGB): MeshStandardMaterial {
  let material = library.get(name);
  if (!material) {
    material = createMaterial(name, kd ?? FALLBACK_PALETTE[name] ?? [0.8, 0.8, 0.8]);
    library.set(name, material);
  }
  return material;
}

export interface SwayConfig {
  /** Local-space height of the rotation pivot (e.g. where the canopy starts). */
  pivotY: number;
  /** Maximum rotation in radians. Keep tiny so voxel blocks stay rigid. */
  amplitude: number;
  /** MTL material names that sway; omitted = every part sways. */
  materials?: string[];
}

/**
 * Variant of a palette material whose vertices rotate rigidly around a pivot
 * (no shearing, so blocks keep their shape). The phase comes from the
 * instance position, so neighbouring trees never move in lock-step.
 */
export function getSwayMaterial(name: string, sway: SwayConfig, kd?: RGB): MeshStandardMaterial {
  const key = `${name}|sway|${sway.pivotY}|${sway.amplitude}`;
  let material = library.get(key);
  if (material) return material;

  material = createMaterial(name, kd ?? FALLBACK_PALETTE[name] ?? [0.8, 0.8, 0.8]);
  material.name = key;
  const { pivotY, amplitude } = sway;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sharedUniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 swayOrigin = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        #else
          vec2 swayOrigin = vec2(0.0);
        #endif
        float swayPhase = swayOrigin.x * 0.37 + swayOrigin.y * 0.23;
        float swayA = sin(uTime * 1.1 + swayPhase) * ${amplitude.toFixed(4)};
        float swayB = sin(uTime * 0.8 + swayPhase * 1.7) * ${(amplitude * 0.6).toFixed(4)};
        vec3 swayP = transformed - vec3(0.0, ${pivotY.toFixed(4)}, 0.0);
        float swayCA = cos(swayA); float swaySA = sin(swayA);
        float swayCB = cos(swayB); float swaySB = sin(swayB);
        swayP = vec3(swayP.x * swayCA - swayP.y * swaySA, swayP.x * swaySA + swayP.y * swayCA, swayP.z);
        swayP = vec3(swayP.x, swayP.y * swayCB - swayP.z * swaySB, swayP.y * swaySB + swayP.z * swayCB);
        transformed = swayP + vec3(0.0, ${pivotY.toFixed(4)}, 0.0);`,
      );
  };
  material.customProgramCacheKey = () => key;
  library.set(key, material);
  return material;
}

/**
 * Dirt side material for the top block of each terrain column: the upper
 * band is painted grass green with a stepped, pixel-jagged edge so terraces
 * read as grassy steps rather than bare walls.
 */
export function getTerrainLipMaterial(): MeshStandardMaterial {
  const key = 'dirt|lip';
  let material = library.get(key);
  if (material) return material;

  material = createMaterial('dirt', FALLBACK_PALETTE.dirt);
  material.name = key;
  const lip = new Color('#4f8c45');
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLipColor = { value: lip };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vLipUv;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLipUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uLipColor;\nvarying vec2 vLipUv;')
      .replace(
        '#include <map_fragment>',
        /* glsl */ `#include <map_fragment>
        float lipCell = floor(vLipUv.x * 8.0);
        float lipEdge = 0.8 - 0.08 * step(0.5, fract(sin(lipCell * 12.9898) * 43758.5453));
        if (vLipUv.y > lipEdge) {
          float lipNoise = fract(sin(dot(floor(vLipUv * 16.0), vec2(12.9898, 78.233))) * 43758.5453);
          diffuseColor.rgb = uLipColor * (0.9 + 0.2 * lipNoise);
        }`,
      );
  };
  material.customProgramCacheKey = () => key;
  library.set(key, material);
  return material;
}

/** Iterates every created palette material (used for dusk-driven updates). */
export function forEachVoxelMaterial(name: string, callback: (material: MeshStandardMaterial) => void): void {
  library.forEach((material, key) => {
    if (key === name || key.startsWith(`${name}|`)) callback(material);
  });
}

export function disposeMaterials(): void {
  library.forEach((material) => material.dispose());
}
