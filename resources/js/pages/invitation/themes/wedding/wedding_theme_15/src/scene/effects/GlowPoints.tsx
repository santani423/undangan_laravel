import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneFx } from '../../state/sceneFx'

export interface GlowPointsData {
  positions: Float32Array
  colors: Float32Array
  /** World-space diameter of each glow. */
  sizes: Float32Array
  phases: Float32Array
}

interface Props {
  data: GlowPointsData
  /** Wander radius (fireflies, dust). */
  drift?: number
  /** 0..1 strength of slow blinking. */
  twinkle?: number
  /** 0..1 strength of fast flame flicker. */
  flicker?: number
  opacity?: number
  fadeNear?: number
  fadeFar?: number
  renderOrder?: number
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  uniform float uDrift;
  uniform float uTwinkle;
  uniform float uFlicker;
  uniform float uOpacity;
  uniform float uFadeNear;
  uniform float uFadeFar;
  attribute vec3 color;
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float ph = aPhase * 6.2831853;
    vec3 p = position;
    p += uDrift * vec3(
      sin(uTime * 0.31 + ph) * 0.9 + sin(uTime * 0.17 + ph * 2.3) * 0.5,
      sin(uTime * 0.47 + ph * 1.7) * 0.45,
      cos(uTime * 0.27 + ph * 1.3) * 0.9
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = mix(1.0, 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.9 + aPhase * 1.6) + ph), 2.0), uTwinkle);
    float fl = 1.0 + uFlicker * (sin(uTime * 7.3 + ph) * 0.55 + sin(uTime * 12.7 + ph * 3.0) * 0.45);
    float dist = -mv.z;
    vAlpha = tw * fl * uOpacity * (1.0 - smoothstep(uFadeNear, uFadeFar, dist)) * smoothstep(0.6, 2.2, dist);
    vColor = color;
    gl_PointSize = min(aSize * uScale / max(dist, 0.1), 256.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float core = exp(-d * d * 18.0);
    float halo = exp(-d * d * 3.2) * 0.5;
    float a = (core + halo) * (1.0 - smoothstep(0.8, 1.0, d)) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * (1.0 + core * 0.6), a);
  }
`

/**
 * One draw call for many soft glows (fireflies, lantern halos, mushroom glow, stars…).
 * Motion runs entirely on the GPU.
 */
export function GlowPoints({ data, drift = 0, twinkle = 0, flicker = 0, opacity = 1, fadeNear = 40, fadeFar = 70, renderOrder = 2 }: Props) {
  const { size, viewport } = useThree()
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(data.phases, 1))
    g.computeBoundingSphere()
    if (g.boundingSphere) g.boundingSphere.radius += drift * 2
    return g
  }, [data, drift])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: 500 },
          uDrift: { value: drift },
          uTwinkle: { value: twinkle },
          uFlicker: { value: flicker },
          uOpacity: { value: opacity },
          uFadeNear: { value: fadeNear },
          uFadeFar: { value: fadeFar },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [drift, twinkle, flicker, opacity, fadeNear, fadeFar],
  )

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  useFrame(({ camera, clock }) => {
    const cam = camera as THREE.PerspectiveCamera
    const fov = THREE.MathUtils.degToRad(cam.fov)
    material.uniforms.uScale.value = (size.height * viewport.dpr) / (2 * Math.tan(fov / 2))
    material.uniforms.uTime.value = sceneFx.reducedMotion ? 0 : clock.elapsedTime
  })

  return <points geometry={geometry} material={material} renderOrder={renderOrder} />
}

/** Helper to build GlowPoints data from a list of points. */
export function buildGlowData(
  items: Array<{ p: [number, number, number]; color: THREE.ColorRepresentation; size: number; intensity?: number; phase?: number }>,
): GlowPointsData {
  const n = items.length
  const positions = new Float32Array(n * 3)
  const colors = new Float32Array(n * 3)
  const sizes = new Float32Array(n)
  const phases = new Float32Array(n)
  const c = new THREE.Color()
  items.forEach((it, i) => {
    positions.set(it.p, i * 3)
    c.set(it.color).multiplyScalar(it.intensity ?? 1)
    colors.set([c.r, c.g, c.b], i * 3)
    sizes[i] = it.size
    phases[i] = it.phase ?? Math.random()
  })
  return { positions, colors, sizes, phases }
}
