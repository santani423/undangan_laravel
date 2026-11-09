import * as THREE from 'three';

/**
 * One shared wind field for the whole island. Grass, foliage, flowers and
 * flags read these uniforms in their vertex shaders; balloons and clouds use
 * the JS mirror below — so every gust travels across the world coherently in
 * the same direction instead of each object wobbling randomly.
 */
export const windUniforms = {
  uTime: { value: 0 },
  uWindDir: { value: new THREE.Vector2(0.86, -0.51).normalize() },
  uWindStrength: { value: 1 },
};

export const WIND_GLSL = /* glsl */ `
uniform float uTime;
uniform vec2 uWindDir;
uniform float uWindStrength;

// Travelling gust waves: 0.1 (lull) … 1.0 (gust). Mirrored in windField() (TS).
float windField(vec2 p, float t) {
  float along = dot(p, uWindDir);
  float across = dot(p, vec2(-uWindDir.y, uWindDir.x));
  float w = sin(along * 0.21 - t * 1.35) * 0.5
          + sin(along * 0.47 - t * 2.3 + across * 0.23) * 0.3
          + sin(across * 0.13 + t * 0.6) * 0.2;
  return 0.55 + 0.45 * w;
}
`;

export function windField(x: number, z: number, t: number) {
  const d = windUniforms.uWindDir.value;
  const along = x * d.x + z * d.y;
  const across = -x * d.y + z * d.x;
  const w =
    Math.sin(along * 0.21 - t * 1.35) * 0.5 +
    Math.sin(along * 0.47 - t * 2.3 + across * 0.23) * 0.3 +
    Math.sin(across * 0.13 + t * 0.6) * 0.2;
  return 0.55 + 0.45 * w;
}

/**
 * Replacement for three's `project_vertex` chunk. Vertices are bent in world
 * space by `aWind` (0 = anchored root/trunk, 1 = free tip), so trunks and grass
 * roots never move while canopies, petals and flag tips sway.
 */
const PROJECT_WITH_WIND = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 windWorld = modelMatrix * mvPosition;
if ( aWind > 0.0 ) {
  float gust = windField( windWorld.xz, uTime );
  float flutter = sin( uTime * 3.1 + windWorld.x * 1.7 + windWorld.z * 1.3 ) * 0.5
                + sin( uTime * 5.7 + windWorld.x * 2.9 - windWorld.z * 2.1 ) * 0.25;
  vec2 perp = vec2( -uWindDir.y, uWindDir.x );
  vec2 disp = ( uWindDir * ( gust + flutter * uFlutter ) + perp * flutter * uFlutter * 0.6 )
            * uWindStrength * uWindAmp * aWind;
  windWorld.xz += disp;
  windWorld.y -= dot( disp, disp ) * 0.6;
}
mvPosition = viewMatrix * windWorld;
gl_Position = projectionMatrix * mvPosition;
`;

export interface WindOptions {
  /** Max displacement (world units) of a vertex with aWind = 1 during a full gust. */
  amplitude?: number;
  /** Extra fast flutter (flags, petals). */
  flutter?: number;
}

/** Patches a built-in material (standard, depth …) to follow the shared wind field. */
export function applyWind<T extends THREE.Material>(material: T, { amplitude = 0.2, flutter = 0.25 }: WindOptions = {}): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.uniforms.uWindDir = windUniforms.uWindDir;
    shader.uniforms.uWindStrength = windUniforms.uWindStrength;
    shader.uniforms.uWindAmp = { value: amplitude };
    shader.uniforms.uFlutter = { value: flutter };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\nattribute float aWind;\nuniform float uWindAmp;\nuniform float uFlutter;\n${WIND_GLSL}`,
      )
      .replace('#include <project_vertex>', PROJECT_WITH_WIND);
  };
  material.customProgramCacheKey = () => `wind:${amplitude}:${flutter}`;
  return material;
}
