import * as THREE from 'three';

/**
 * Shared wind + lighting uniforms. One object instance is referenced by every patched
 * material, so a single per-frame update drives all foliage on the GPU (no CPU per-vertex work).
 */
export const windUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 1 },
    uWindDir: { value: new THREE.Vector2(0.82, -0.57).normalize() },
};

export const grassLightUniforms = {
    uSunColor: { value: new THREE.Color('#fff1d8') },
    uSunIntensity: { value: 1 },
    uAmbient: { value: new THREE.Color('#9fa88a') },
    uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.5).normalize() },
};

export interface WindOptions {
    /** Max horizontal sway in metres at the reference height. */
    amplitude: number;
    /** Height (local Y) at which sway reaches full amplitude. */
    height: number;
    /** Extra high-frequency flutter for leaves. */
    flutter?: number;
    /** Base offset in local Y below which nothing moves (anchored trunk/root). */
    anchor?: number;
    /**
     * How the bend factor is measured:
     *  - 'height'    local Y (default) — single meshes whose origin is at the root
     *  - 'attribute' per-vertex `aWind` (0 = anchored, 1 = free tip) baked into the geometry
     *  - 'instanceY' world height of each instance — tiny instanced items like flowers
     */
    mode?: 'height' | 'attribute' | 'instanceY';
    /**
     * Foliage cards carry hand-authored "canopy" normals; keep them on back faces too
     * (three.js would otherwise flip them for DoubleSide, making the far side of a crown dark).
     */
    keepNormals?: boolean;
}

/**
 * Inject wind sway into a built-in material (MeshStandard/Lambert) via onBeforeCompile.
 * Works for plain and instanced meshes — phase comes from each instance's world position,
 * so neighbouring plants never move in lock-step.
 */
export function applyWind<T extends THREE.Material>(material: T, opts: WindOptions): T {
    const { amplitude, height, flutter = 0, anchor = 0, mode = 'height', keepNormals = false } = opts;
    const factor =
        mode === 'attribute'
            ? 'aWind'
            : mode === 'instanceY'
              ? `clamp((wBase.y - ${anchor.toFixed(3)}) / ${height.toFixed(3)}, 0.0, 1.6)`
              : `clamp((position.y - ${anchor.toFixed(3)}) / ${height.toFixed(3)}, 0.0, 1.6)`;
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, windUniforms);
        shader.vertexShader = shader.vertexShader
            .replace(
                '#include <common>',
                `#include <common>
uniform float uTime;
uniform float uWindStrength;
uniform vec2 uWindDir;
${mode === 'attribute' ? 'attribute float aWind;' : ''}`,
            )
            .replace(
                '#include <begin_vertex>',
                `vec3 transformed = vec3(position);
{
  #ifdef USE_INSTANCING
    vec3 wBase = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #else
    vec3 wBase = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #endif
  float hF = ${factor};
  hF *= hF;
  float ph = dot(wBase.xz, uWindDir) * 0.18 + fract(sin(dot(wBase.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
  float gust = 0.65 + 0.35 * sin(uTime * 0.31 + dot(wBase.xz, uWindDir) * 0.04);
  float sway = (sin(uTime * 1.05 + ph) * 0.7 + sin(uTime * 2.1 + ph * 1.7) * 0.3) * gust;
  transformed.x += uWindDir.x * sway * ${amplitude.toFixed(3)} * uWindStrength * hF;
  transformed.z += uWindDir.y * sway * ${amplitude.toFixed(3)} * uWindStrength * hF;
  ${
      flutter > 0
          ? `float fl = sin(uTime * 4.3 + position.x * 5.1 + position.z * 4.3 + ph * 3.0);
  transformed.y += fl * ${flutter.toFixed(3)} * uWindStrength * hF;
  transformed.x += fl * ${(flutter * 0.5).toFixed(3)} * uWindStrength * hF;`
          : ''
  }
}`,
            );
        if (keepNormals) {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <normal_fragment_begin>',
                '#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\n  normal *= faceDirection;\n#endif',
            );
        }
    };
    material.customProgramCacheKey = () => `wind-${mode}-${amplitude}-${height}-${flutter}-${anchor}-${keepNormals}`;
    return material;
}
