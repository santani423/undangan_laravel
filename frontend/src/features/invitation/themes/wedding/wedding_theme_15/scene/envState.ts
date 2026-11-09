import * as THREE from 'three';
import { WAYPOINTS } from './waypoints';

/**
 * Interpolated environment for the current scroll position.
 * Written only by CameraRig, read by lights / sky / fog consumers.
 */
export const envState = {
    fog: new THREE.Color(WAYPOINTS[0].env.fog),
    fogNear: WAYPOINTS[0].env.fogNear,
    fogFar: WAYPOINTS[0].env.fogFar,
    light: new THREE.Vector3(...WAYPOINTS[0].env.light),
    lightIntensity: WAYPOINTS[0].env.lightIntensity,
    moon: WAYPOINTS[0].env.moon,
    /** Fractional section index (0 = home … 8 = closing). */
    section: 0,
    /** Camera look-at point; petals and other camera-relative effects follow it. */
    focus: new THREE.Vector3(0, 1.8, 8),
};
