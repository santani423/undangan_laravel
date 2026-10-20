import * as THREE from 'three'

export interface ClayOptions {
  color?: THREE.ColorRepresentation
  rim?: THREE.ColorRepresentation
  rimStrength?: number
  rimPower?: number
  roughness?: number
  emissive?: THREE.ColorRepresentation
  emissiveIntensity?: number
  vertexColors?: boolean
  flatShading?: boolean
  transparent?: boolean
  opacity?: number
  side?: THREE.Side
  /** Adds the vertex/instance colour as emission — glowing caps, petals, lantern paper. */
  selfGlow?: number
}

/**
 * Matte "clay" material with a soft twilight rim light (fresnel), which gives every
 * prop the glowing storybook edge without extra real-time lights.
 */
export function clayMaterial(opts: ClayOptions = {}): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: opts.color ?? '#ffffff',
    roughness: opts.roughness ?? 0.86,
    metalness: 0,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    vertexColors: opts.vertexColors ?? false,
    flatShading: opts.flatShading ?? false,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
  })
  const rimColor = new THREE.Color(opts.rim ?? '#9a93d6')
  const rimStrength = opts.rimStrength ?? 0.32
  const rimPower = opts.rimPower ?? 2.6
  const selfGlow = opts.selfGlow ?? 0
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: rimColor }
    shader.uniforms.uRimStrength = { value: rimStrength }
    shader.uniforms.uRimPower = { value: rimPower }
    shader.uniforms.uSelfGlow = { value: selfGlow }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec3 uRimColor;\nuniform float uRimStrength;\nuniform float uRimPower;\nuniform float uSelfGlow;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), uRimPower);
        totalEmissiveRadiance += uRimColor * rimF * uRimStrength;
        #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_COLOR_ALPHA )
          totalEmissiveRadiance += vColor.rgb * uSelfGlow;
        #endif`,
      )
  }
  mat.customProgramCacheKey = () => 'clay-rim'
  return mat
}

/** Unlit glowing material; colour can exceed 1 so it blooms when post-processing is on. */
export function glowMaterial(color: THREE.ColorRepresentation, intensity = 1.6, opts: Partial<THREE.MeshBasicMaterialParameters> = {}) {
  const c = new THREE.Color(color).multiplyScalar(intensity)
  return new THREE.MeshBasicMaterial({ color: c, toneMapped: false, ...opts })
}

export const PALETTE = {
  navy: '#171A35',
  midnight: '#24294B',
  lavender: '#8580B7',
  moon: '#B9D5F2',
  blush: '#F2C5D2',
  sage: '#A6C5A4',
  gold: '#F5D58B',
  cream: '#FFF8EE',
  bark: '#4a3a52',
  barkLight: '#6b5568',
  wood: '#8a6a6e',
  stone: '#7d7a9e',
  moss: '#3f5f5a',
  skin: '#f3d2c1',
  hair: '#3b2a3d',
}
