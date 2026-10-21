import { CatmullRomCurve3, Vector3 } from 'three';
import { CAMERA_WAYPOINTS } from '../lib/cameraWaypoints';

/** Camera position and look-at curves through every waypoint. */
export function createCameraCurves() {
    const positions = CAMERA_WAYPOINTS.map((w) => new Vector3(...w.position));
    const targets = CAMERA_WAYPOINTS.map((w) => new Vector3(...w.target));
    // Centripetal Catmull-Rom avoids loops and overshoot between waypoints.
    return {
        position: new CatmullRomCurve3(positions, false, 'centripetal'),
        target: new CatmullRomCurve3(targets, false, 'centripetal'),
    };
}
