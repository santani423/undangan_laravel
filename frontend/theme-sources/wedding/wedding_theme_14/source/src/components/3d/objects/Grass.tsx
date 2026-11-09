import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CAMERA_SHOTS } from '../../../config/camera'
import { NO_GRASS, PATHS, WORLD } from '../../../config/world'
import { distToPolyline, mulberry32, pointInRects } from '../geometry'
import { grassLightUniforms, windUniforms } from '../wind'

/*
 * Instanced wind-responsive grass.
 * Adapted from the asset pack's shaders/grass-wind-vertex.glsl:
 *  - kept: anchored base / progressive tip bend (heightFactor²), phase from position along the
 *    wind direction, secondary cos() cross-sway
 *  - added: per-instance phase + amplitude so neighbours never sway in unison, a slow travelling
 *    gust envelope, length-preserving bend, distance fade (blades shrink into the ground before
 *    they get small enough to shimmer), per-instance colour variation, simple translucency and
 *    root occlusion. Fog and tone-mapping chunks keep it consistent with the rest of the scene.
 */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uWindStrength;
uniform vec2 uWindDir;
uniform vec2 uFade;
attribute vec4 aVar; // x: phase, y: amplitude, z: tint, w: dryness
varying float vH;
varying vec3 vTint;
varying float vLight;
#include <common>
#include <fog_pars_vertex>
uniform vec3 uSunDir;

void main() {
  vec3 p = position;
  float heightFactor = clamp(uv.y, 0.0, 1.0);
  vec4 base = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float dist = distance(base.xz, cameraPosition.xz);
  float fade = 1.0 - smoothstep(uFade.x, uFade.y, dist);
  vec4 wp = modelMatrix * instanceMatrix * vec4(p.x * fade, p.y * fade, p.z * fade, 1.0);
  vec2 dir = normalize(uWindDir + vec2(0.0001));
  float along = dot(base.xz, dir);
  float phase = along * 0.42 + aVar.x;
  float gust = 0.6 + 0.4 * sin(uTime * 0.42 - along * 0.09);
  float sway = (sin(uTime * 1.35 + phase) * 0.72 + sin(uTime * 2.6 + phase * 1.9) * 0.28) * uWindStrength * gust * aVar.y;
  float bladeH = length(instanceMatrix[1].xyz) * fade;
  float bend = heightFactor * heightFactor;
  float lean = 0.12 * uWindStrength * gust;
  float offs = (sway * 0.3 + lean) * bend * bladeH;
  wp.xz += dir * offs;
  wp.xz += vec2(-dir.y, dir.x) * cos(uTime * 1.1 + phase * 0.7) * uWindStrength * 0.05 * bend * bladeH;
  wp.y -= offs * offs / max(bladeH, 0.05) * 0.5; // keep blade length ~constant while bending
  vH = heightFactor;
  vTint = vec3(aVar.z, aVar.w, 0.0);
  // blades are thin: light them mostly by how much sun reaches the canopy, with back-light glow
  vec3 viewDir = normalize(cameraPosition - wp.xyz);
  float back = pow(max(dot(-viewDir, uSunDir), 0.0), 3.0);
  vLight = 0.55 + 0.45 * max(uSunDir.y, 0.0) + back * 0.6 * heightFactor;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uAmbient;
varying float vH;
varying vec3 vTint;
varying float vLight;
#include <common>
#include <fog_pars_fragment>

void main() {
  vec3 root = vec3(0.035, 0.055, 0.02);
  vec3 mid = vec3(0.12, 0.2, 0.05);
  vec3 tipLush = vec3(0.24, 0.34, 0.09);
  vec3 tipDry = vec3(0.38, 0.36, 0.14);
  vec3 tip = mix(tipLush, tipDry, vTint.y);
  vec3 col = vH < 0.5 ? mix(root, mid, vH * 2.0) : mix(mid, tip, (vH - 0.5) * 2.0);
  col *= 0.82 + vTint.x * 0.36;
  float ao = 0.45 + 0.55 * smoothstep(0.0, 0.6, vH);
  vec3 light = uAmbient * ao + uSunColor * uSunIntensity * 0.3 * vLight * ao;
  gl_FragColor = vec4(col * light, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`

function bladeGeometry() {
  const segs = 4
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const w = 0.045 * (1 - Math.pow(t, 1.4) * 0.94)
    const curve = t * t * 0.1
    pos.push(-w / 2, t, curve, w / 2, t, curve)
    uv.push(0, t, 1, t)
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

const CAMERA_LINE: [number, number][] = CAMERA_SHOTS.flatMap((s) => s.positions.map((p) => [p[0], p[2]] as [number, number]))

/**
 * Grass density: full strength within the band the camera actually looks at, tapering with
 * distance so blades are spent where they are seen. Lawns of the taman are always lush.
 */
function grassWeight(x: number, z: number) {
  const d = distToPolyline(x, z, CAMERA_LINE)
  let w = d < 16 ? 1 : d < 34 ? 1 - ((d - 16) / 18) * 0.75 : 0.18
  if (x > 10 && x < 46 && z > -54 && z < -16) w = Math.max(w, 0.85)
  return w
}

export function Grass({ count, fade }: { count: number; fade: [number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geometry = useMemo(() => bladeGeometry(), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
          ...windUniforms,
          ...grassLightUniforms,
          uFade: { value: new THREE.Vector2(fade[0], fade[1]) },
        },
        side: THREE.DoubleSide,
        fog: true,
      }),
    [fade],
  )

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const rnd = mulberry32(2027)
    const vars = new Float32Array(count * 4)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3()
    const v = new THREE.Vector3()
    const pond = WORLD.garden.pond
    let n = 0
    let guard = 0
    while (n < count && guard++ < count * 30) {
      const cx = -48 + rnd() * 100
      const cz = -92 + rnd() * 134
      if (rnd() > grassWeight(cx, cz)) continue
      if (pointInRects(cx, cz, NO_GRASS, 0.25)) continue
      if (PATHS.some((p) => distToPolyline(cx, cz, p.points) < p.width / 2 + 0.15)) continue
      if (Math.hypot(cx - pond[0], cz - pond[2]) < WORLD.garden.pondRadius + 0.45) continue
      // tufts: several blades sharing a root area, the tallest in the middle
      const clump = 4 + Math.floor(rnd() * 7)
      const tuftH = 0.22 + rnd() * 0.3
      const dry = rnd() < 0.18 ? 0.5 + rnd() * 0.5 : rnd() * 0.25
      for (let k = 0; k < clump && n < count; k++) {
        const a = rnd() * Math.PI * 2
        const rr = Math.sqrt(rnd()) * 0.22
        const x = cx + Math.cos(a) * rr
        const z = cz + Math.sin(a) * rr
        const h = tuftH * (0.6 + (1 - rr / 0.22) * 0.5 + rnd() * 0.25)
        e.set((rnd() - 0.5) * 0.35 + Math.cos(a) * rr * 0.8, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.35 + Math.sin(a) * rr * 0.8)
        q.setFromEuler(e)
        s.set(0.75 + rnd() * 0.6, h, 1)
        m.compose(v.set(x, -0.01, z), q, s)
        mesh.setMatrixAt(n, m)
        vars[n * 4] = rnd() * Math.PI * 2
        vars[n * 4 + 1] = 0.7 + rnd() * 0.6
        vars[n * 4 + 2] = rnd()
        vars[n * 4 + 3] = dry
        n++
      }
    }
    mesh.count = n
    geometry.setAttribute('aVar', new THREE.InstancedBufferAttribute(vars, 4))
    mesh.instanceMatrix.needsUpdate = true
  }, [count, geometry])

  useLayoutEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />
}
