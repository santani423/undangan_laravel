// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { invitation } from '../data/invitation';
import { FALLBACK_PALETTE } from './materials';
import { boxTriangles, buildPartGeometry, createFallbackModel, orientOutward, splitByMaterial } from './voxelLoader';
import { MODEL_BOUNDS, type ModelName } from './worldLayout';

const PUBLIC = path.resolve(__dirname, '../../public');
const MODELS = path.join(PUBLIC, 'assets/models');
const MODEL_NAMES = Object.keys(MODEL_BOUNDS) as ModelName[];

function signedVolume(positions: ArrayLike<number>): number {
  let volume = 0;
  for (let i = 0; i < positions.length; i += 9) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz] = Array.from({ length: 9 }, (_, k) => positions[i + k]);
    volume += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
  }
  return volume / 6;
}

describe('supplied voxel asset pack', () => {
  const mtlText = fs.readFileSync(path.join(MODELS, 'voxel_wedding_palette.mtl'), 'utf8');
  const creator = new MTLLoader().parse(mtlText, '');

  it('includes every model referenced by the scene', () => {
    for (const name of MODEL_NAMES) expect(fs.existsSync(path.join(MODELS, `${name}.obj`)), name).toBe(true);
  });

  it('keeps the fallback palette in sync with the MTL file', () => {
    for (const [name, info] of Object.entries(creator.materialsInfo)) {
      expect(FALLBACK_PALETTE[name], name).toEqual(info.kd?.slice(0, 3));
    }
  });

  it.each(MODEL_NAMES)('%s resolves every material and is oriented outwards', (name) => {
    const text = fs.readFileSync(path.join(MODELS, `${name}.obj`), 'utf8');
    expect(text).toContain('mtllib voxel_wedding_palette.mtl');
    const root = new OBJLoader().setMaterials(creator).parse(text);
    const buckets = splitByMaterial(root);
    expect(buckets.size).toBeGreaterThan(0);

    for (const [material, positions] of buckets) {
      expect(creator.materialsInfo[material], `${name} uses unknown material "${material}"`).toBeDefined();
      expect(positions.length % 9).toBe(0);
      const geometry = buildPartGeometry([...positions]);
      // After orientation every closed cuboid set must enclose a positive volume.
      expect(signedVolume(geometry.getAttribute('position').array)).toBeGreaterThan(0);
      expect(geometry.getAttribute('uv')).toBeDefined();
      expect(geometry.getAttribute('normal')).toBeDefined();
    }
  });

  it('detects and fixes inward-facing winding', () => {
    const outward = boxTriangles([0.2, 0, 0.4], [1.2, 1.5, 1.1]);
    expect(signedVolume(outward)).toBeGreaterThan(0);
    // Wind every triangle clockwise, as the supplied OBJ files do.
    const inward = [...outward];
    for (let i = 0; i < inward.length; i += 9) {
      for (let k = 0; k < 3; k++) [inward[i + 3 + k], inward[i + 6 + k]] = [inward[i + 6 + k], inward[i + 3 + k]];
    }
    expect(signedVolume(inward)).toBeLessThan(0);
    orientOutward(inward);
    expect(inward).toEqual(outward);
    // Already-correct geometry is left untouched.
    const untouched = [...outward];
    orientOutward(untouched);
    expect(untouched).toEqual(outward);
  });

  it('builds a procedural fallback for every model', () => {
    for (const name of MODEL_NAMES) {
      const model = createFallbackModel(name);
      expect(model.isFallback).toBe(true);
      for (const part of model.parts) expect(signedVolume(part.geometry.getAttribute('position').array)).toBeGreaterThan(0);
    }
  });

  it('ships every texture and UI icon', () => {
    for (const texture of ['grass', 'dirt', 'stone', 'wood', 'ivory_fabric', 'water']) {
      expect(fs.existsSync(path.join(PUBLIC, `assets/textures/${texture}.svg`)), texture).toBe(true);
    }
    for (const icon of ['calendar', 'location', 'music', 'gift', 'heart', 'gallery']) {
      expect(fs.existsSync(path.join(PUBLIC, `assets/icons/${icon}.svg`)), icon).toBe(true);
    }
  });

  it('ships every local media file referenced by the invitation config', () => {
    const local = invitation.gallery.flatMap((item) => [item.src, item.thumbnail, item.poster]).filter((p): p is string => Boolean(p) && p!.startsWith('/'));
    for (const file of local) expect(fs.existsSync(path.join(PUBLIC, file)), file).toBe(true);
  });
});
