import * as THREE from 'three';
import { CAMERA_OBSTACLES } from '../../../config/world';
import { cameraLookCurve, cameraPositionCurve } from './curves';

/**
 * Development check: samples the camera path (including the pulled-back
 * portrait framing) and warns when it would pass through a building, tree or
 * focal object. Runs once in `npm run dev`; stripped from production builds.
 */
export function validateLayout(portraitPullback = 1.22) {
  const issues = new Set<string>();
  const p = new THREE.Vector3();
  const l = new THREE.Vector3();
  const q = new THREE.Vector3();
  const samples = 800;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    cameraPositionCurve.getPoint(t, p);
    cameraLookCurve.getPoint(t, l);
    q.copy(l).add(p.clone().sub(l).multiplyScalar(portraitPullback));
    for (const cam of [p, q]) {
      if (cam.y < 1.2) issues.add(`camera too low (y=${cam.y.toFixed(2)}) at t=${t.toFixed(3)}`);
      for (const [x, z, r, h] of CAMERA_OBSTACLES) {
        const d = Math.hypot(cam.x - x, cam.z - z);
        if (cam.y < h + 0.35 && d < r + 0.45) {
          issues.add(`camera ${cam === p ? 'path' : 'portrait path'} clips obstacle at (${x}, ${z}) — d=${d.toFixed(2)} t=${t.toFixed(3)}`);
        }
      }
    }
  }

  if (issues.size) console.warn(`[ToyWorld] layout check found ${issues.size} issue(s):\n` + [...issues].slice(0, 30).join('\n'));
  else console.info('[ToyWorld] layout check passed — camera path is clear of obstacles.');
  return [...issues];
}
