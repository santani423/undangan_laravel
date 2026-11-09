import * as THREE from 'three';

/** Written by the CameraRig each frame; read by lighting so shadows follow the view. */
export const rigState = {
  /** Point the shadow frustum is centred on. */
  focus: new THREE.Vector3(0, 0, 0),
  /** Half-size of the shadow frustum (wider for the establishing shot). */
  shadowSpan: 18,
};
