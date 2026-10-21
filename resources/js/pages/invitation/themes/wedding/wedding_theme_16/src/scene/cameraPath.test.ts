// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { CAMERA_WAYPOINTS } from '../data/cameraWaypoints';
import { SECTIONS } from '../data/sections';
import { createCameraCurves } from './cameraPath';
import {
  BENCHES,
  BLOSSOM_TREES,
  CEREMONY_ARCH,
  COTTAGE,
  EASELS,
  ENTRANCE_ARCH,
  FEATURE_TREES,
  FLOATING_GIFT,
  GIFTS,
  LANTERNS,
  MODEL_BOUNDS,
  RINGS,
  WISHING_TREE,
  generatePeripheralTrees,
  terrainHeightAt,
  type ModelName,
  type Placement,
} from './worldLayout';

interface Box {
  label: string;
  min: Vector3;
  max: Vector3;
}

const CLEARANCE = 0.6;

/** World AABB of a placed model; exact for quarter-turn rotations, conservative otherwise. */
function boxFor(model: ModelName, p: Placement, label: string): Box {
  const b = MODEL_BOUNDS[model];
  const s = p.scale ?? 1;
  const quarterTurns = (p.rotY ?? 0) / (Math.PI / 2);
  const aligned = Math.abs(quarterTurns - Math.round(quarterTurns)) < 1e-6;
  const swapped = aligned && Math.abs(Math.round(quarterTurns)) % 2 === 1;
  const r = Math.max(b.hx, b.hz);
  const hx = (aligned ? (swapped ? b.hz : b.hx) : r) * s;
  const hz = (aligned ? (swapped ? b.hx : b.hz) : r) * s;
  const y = p.y ?? 0;
  return {
    label,
    min: new Vector3(p.x - hx, y + b.minY * s, p.z - hz),
    max: new Vector3(p.x + hx, y + b.height * s, p.z + hz),
  };
}

/** Arches are modelled as two pillars and a beam so the camera may pass through the opening. */
function archBoxes(p: Placement, label: string): Box[] {
  const s = p.scale ?? 1;
  const part = (x0: number, x1: number, y0: number, y1: number): Box => ({
    label,
    min: new Vector3(p.x + x0 * s, y0 * s, p.z - 0.2 * s),
    max: new Vector3(p.x + x1 * s, y1 * s, p.z + 0.2 * s),
  });
  return [part(-1.14, -0.86, 0, 2.3), part(0.86, 1.14, 0, 2.3), part(-1.14, 1.14, 2.14, 2.6)];
}

function distanceToBox(point: Vector3, box: Box): number {
  const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
  const dy = Math.max(box.min.y - point.y, 0, point.y - box.max.y);
  const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
  return Math.hypot(dx, dy, dz);
}

describe('camera journey', () => {
  const curves = createCameraCurves();
  const samples = Array.from({ length: 1200 }, (_, i) => curves.position.getPoint(i / 1199));

  it('has one waypoint per section plus the cover, in order', () => {
    expect(CAMERA_WAYPOINTS.map((w) => w.id)).toEqual(['cover', ...SECTIONS.map((s) => s.id)]);
  });

  it('passes exactly through each waypoint at integer journey values', () => {
    const last = CAMERA_WAYPOINTS.length - 1;
    CAMERA_WAYPOINTS.forEach((w, i) => {
      const p = curves.position.getPoint(i / last);
      expect(p.distanceTo(new Vector3(...w.position))).toBeLessThan(1e-6);
    });
  });

  it('never clips into props', () => {
    const boxes: Box[] = [
      ...archBoxes(ENTRANCE_ARCH, 'entrance arch'),
      ...archBoxes(CEREMONY_ARCH, 'ceremony arch'),
      boxFor('garden_cottage', COTTAGE, 'cottage'),
      ...BENCHES.map((p) => boxFor('garden_bench', p, 'bench')),
      ...LANTERNS.map((p) => boxFor('garden_lantern', p, 'lantern')),
      ...GIFTS.map((p) => boxFor('gift_box', p, 'gift')),
      boxFor('gift_box', FLOATING_GIFT, 'floating gift'),
      boxFor('wedding_rings_voxel', RINGS, 'rings'),
      ...[...BLOSSOM_TREES, WISHING_TREE].map((p) => boxFor('blossom_tree', p, `blossom@${p.x},${p.z}`)),
      ...FEATURE_TREES.map((p) => boxFor('voxel_tree', p, `tree@${p.x},${p.z}`)),
      ...generatePeripheralTrees(70).map((t) => boxFor(t.model, t, `${t.model}@${t.x.toFixed(1)},${t.z.toFixed(1)}`)),
      ...EASELS.map((p) => ({ label: 'easel', min: new Vector3(p.x - 0.9, 0, p.z - 0.9), max: new Vector3(p.x + 0.9, 2.4, p.z + 0.9) })),
    ];
    const collisions = new Set<string>();
    for (const point of samples) {
      for (const box of boxes) {
        if (distanceToBox(point, box) < CLEARANCE) collisions.add(`${box.label} near ${point.toArray().map((v) => v.toFixed(0)).join(',')}`);
      }
    }
    expect([...collisions]).toEqual([]);
  });

  it('stays above the terrain', () => {
    for (const point of samples) {
      expect(point.y - terrainHeightAt(point.x, point.z)).toBeGreaterThan(1.2);
    }
  });

  it('keeps every look-at target in front of the camera', () => {
    CAMERA_WAYPOINTS.forEach((w) => {
      expect(new Vector3(...w.position).distanceTo(new Vector3(...w.target))).toBeGreaterThan(5);
    });
  });
});
