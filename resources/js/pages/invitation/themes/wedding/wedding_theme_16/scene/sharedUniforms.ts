import { Color, Vector2, Vector3 } from 'three';

/**
 * Uniform objects shared by every shader that animates with time or wind.
 * Updated once per frame by <SceneClock />, so all foliage moves coherently.
 */
export const sharedUniforms = {
    uTime: { value: 0 },
    uDusk: { value: 0 },
    /** Normalised prevailing wind direction on the XZ plane. */
    uWindDir: { value: new Vector2(0.82, 0.57).normalize() },
    uWindStrength: { value: 0.11 },
};

/** Sky dome uniforms, blended from day to dusk by SceneLighting. */
export const skyUniforms = {
    uTop: { value: new Color('#86bce6') },
    uHorizon: { value: new Color('#f3e6cf') },
    uBottom: { value: new Color('#e7dcc3') },
    uSunDir: { value: new Vector3(0.4, 0.6, 0.3).normalize() },
    uSunColor: { value: new Color('#fff0d4') },
};
