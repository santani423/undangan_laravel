import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import { CAMERA_WAYPOINTS, WAYPOINT_COUNT } from '../data/cameraWaypoints';
import { createCameraCurves } from './cameraPath';
import { cameraFocus } from './cameraRig';
import { journey, pointer } from './journeyState';

const LENS_SHIFT = CAMERA_WAYPOINTS.map((w) => (w.contentSide === 'left' ? -1 : w.contentSide === 'right' ? 1 : 0));

function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

interface CameraControllerProps {
  reducedMotion: boolean;
  parallax: boolean;
}

/**
 * Drives the default camera along the garden journey. `journey.u` is written
 * by GSAP (opening animation + scrubbed ScrollTrigger timeline); this
 * component only reads it, so scrolling never causes React re-renders.
 */
export function CameraController({ reducedMotion, parallax }: CameraControllerProps) {
  const curves = useMemo(() => createCameraCurves(), []);
  const state = useRef({
    initialised: false,
    position: new Vector3(),
    target: new Vector3(),
    desiredPosition: new Vector3(),
    desiredTarget: new Vector3(),
    offset: new Vector3(),
    pointer: { x: 0, y: 0 },
    shift: 0,
  });

  useEffect(() => {
    if (!parallax) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      pointer.x = 0;
      pointer.y = 0;
    };
  }, [parallax]);

  useFrame(({ camera, size }, delta) => {
    const cam = camera as PerspectiveCamera;
    const s = state.current;
    const dt = Math.min(delta, 0.1);
    const last = WAYPOINT_COUNT - 1;

    const raw = Math.min(Math.max(journey.u, 0), last);
    // Reduced motion: cut between composed viewpoints instead of flying.
    const u = reducedMotion ? Math.round(raw) : raw;
    const t = u / last;
    curves.position.getPoint(t, s.desiredPosition);
    curves.target.getPoint(t, s.desiredTarget);

    const aspect = size.width / Math.max(size.height, 1);
    if (aspect < 0.9) {
      // Narrow portrait screens: step back a little so the focal prop fits.
      s.offset.subVectors(s.desiredPosition, s.desiredTarget);
      s.desiredPosition.copy(s.desiredTarget).addScaledVector(s.offset, 1.12);
      s.desiredPosition.y += 0.3;
    }

    if (parallax && !reducedMotion) {
      const k = 1 - Math.exp(-dt * 3);
      s.pointer.x += (pointer.x - s.pointer.x) * k;
      s.pointer.y += (pointer.y - s.pointer.y) * k;
      s.desiredPosition.x += s.pointer.x * 0.35;
      s.desiredPosition.y += s.pointer.y * 0.2;
    }

    const follow = !s.initialised || reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
    s.position.lerp(s.desiredPosition, follow);
    s.target.lerp(s.desiredTarget, follow);
    s.initialised = true;

    cam.position.copy(s.position);
    cam.lookAt(s.target);
    cameraFocus.copy(s.target);

    const fov = aspect < 0.9 ? 58 : aspect < 1.3 ? 50 : 45;
    if (cam.fov !== fov) cam.fov = fov;

    // Lens shift: move the focal prop away from the side holding the HTML card.
    const i0 = Math.floor(u);
    const i1 = Math.min(i0 + 1, last);
    const blend = smoothstep(u - i0);
    const wide = aspect > 1.15 && size.width >= 900;
    const shiftTarget = wide ? LENS_SHIFT[i0] + (LENS_SHIFT[i1] - LENS_SHIFT[i0]) * blend : 0;
    s.shift += (shiftTarget - s.shift) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 4));
    cam.setViewOffset(size.width, size.height, s.shift * size.width * 0.17, 0, size.width, size.height);
  });

  return null;
}
