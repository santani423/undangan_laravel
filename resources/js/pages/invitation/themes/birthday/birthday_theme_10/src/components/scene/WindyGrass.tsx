import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GROUND_EXCLUSIONS, ROAD_WIDTH } from '../../config/world';
import { seededRandom, valueNoise2D } from '../../utils/math';
import { cameraPathPoints, distanceToRoad, insideIsland } from './lib/curves';
import { WIND_GLSL, windUniforms } from './lib/wind';

const GRASS_VERTEX = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
${WIND_GLSL}
uniform float uAmp;
attribute vec3 aTint;
attribute float aPhase;
varying float vH;
varying vec3 vTint;
varying float vGust;

void main() {
  float h = uv.y;                                   // 0 at the root, 1 at the tip
  vec4 root = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);

  // Shared gust field sampled at the root → neighbouring blades move together.
  float gust = windField(root.xz, uTime);
  // Small per-blade phase offset (fixed at creation, not random per frame).
  float flutter = sin(uTime * 2.6 + aPhase) * 0.2 + sin(uTime * 4.1 + aPhase * 1.7) * 0.07;
  float bend = h * h;                               // roots stay anchored
  vec2 disp = uWindDir * (gust + flutter) * uWindStrength * uAmp * bend;
  world.xz += disp;
  world.y -= dot(disp, disp) * 1.6;                 // keep blade length roughly constant

  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  vH = h;
  vTint = aTint;
  vGust = gust;
  #include <fog_vertex>
}`;

const GRASS_FRAGMENT = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uBase;
uniform vec3 uTip;
varying float vH;
varying vec3 vTint;
varying float vGust;

void main() {
  vec3 col = mix(uBase, uTip, smoothstep(0.0, 1.0, vH)) * vTint;
  col *= 0.94 + 0.14 * vGust * vH;                  // bent tips catch a little more light
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

function createBladeGeometry() {
  const g = new THREE.PlaneGeometry(0.075, 1, 1, 4);
  g.translate(0, 0.5, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setX(i, pos.getX(i) * (1 - Math.pow(y, 1.4) * 0.92));
    pos.setZ(i, y * y * 0.12); // slight natural curve
  }
  g.computeVertexNormals();
  return g;
}

const CHUNKS = 6;

interface GrassChunk {
  matrices: Float32Array;
  tints: Float32Array;
  phases: Float32Array;
  count: number;
}

/** Places blades along the journey corridor, avoiding the road, plazas and buildings, in noise-driven clumps. */
function sampleGrass(total: number): GrassChunk[] {
  const rand = seededRandom(1337);
  const buckets: { m: number[]; t: number[]; p: number[] }[] = Array.from({ length: CHUNKS }, () => ({ m: [], t: [], p: [] }));
  const path = cameraPathPoints;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const v = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  let placed = 0;
  let tries = 0;

  while (placed < total && tries < total * 10) {
    tries++;
    const k = Math.floor(rand() * path.length);
    const [px, pz] = path[k];
    const angle = rand() * Math.PI * 2;
    const radius = Math.pow(rand(), 0.75) * 17;
    const x = px + Math.cos(angle) * radius;
    const z = pz + Math.sin(angle) * radius;

    const clump = valueNoise2D(x * 0.32, z * 0.32);
    if (clump < 0.3 + rand() * 0.22) continue;
    if (!insideIsland(x, z, 1.1)) continue;
    const roadDist = distanceToRoad(x, z);
    if (roadDist < ROAD_WIDTH / 2 + 0.42) continue;
    let blocked = false;
    for (const [ex, ez, er] of GROUND_EXCLUSIONS) {
      if ((x - ex) ** 2 + (z - ez) ** 2 < er * er) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    const mowed = roadDist < ROAD_WIDTH / 2 + 1.4 ? 0.65 : 1;
    const height = (0.2 + 0.3 * valueNoise2D(x * 0.9 + 11, z * 0.9) + rand() * 0.08) * mowed;
    q.setFromAxisAngle(up, rand() * Math.PI * 2);
    s.set(0.8 + rand() * 0.6, height, 1);
    m.compose(v.set(x, 0, z), q, s);

    const chunk = Math.min(CHUNKS - 1, Math.floor((k / path.length) * CHUNKS));
    const b = buckets[chunk];
    b.m.push(...m.elements);
    const shade = 0.86 + rand() * 0.24;
    const warm = rand() < 0.14 ? 1.08 : 1;
    b.t.push(shade * warm, shade, shade * (warm > 1 ? 0.88 : 1));
    b.p.push(rand() * Math.PI * 2);
    placed++;
  }

  return buckets.map((b) => ({
    matrices: new Float32Array(b.m),
    tints: new Float32Array(b.t),
    phases: new Float32Array(b.p),
    count: b.p.length,
  }));
}

function GrassChunkMesh({ chunk, material }: { chunk: GrassChunk; material: THREE.ShaderMaterial }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geometry = useMemo(() => {
    const g = createBladeGeometry();
    g.setAttribute('aTint', new THREE.InstancedBufferAttribute(chunk.tints, 3));
    g.setAttribute('aPhase', new THREE.InstancedBufferAttribute(chunk.phases, 1));
    return g;
  }, [chunk]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    mesh.instanceMatrix.array.set(chunk.matrices);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    return () => geometry.dispose();
  }, [chunk, geometry]);

  if (chunk.count === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, chunk.count]} />;
}

/**
 * Instanced grass blades bent in the vertex shader by the shared wind field.
 * Split into chunks along the journey so blades behind the camera are culled.
 */
export function WindyGrass({ count }: { count: number }) {
  const chunks = useMemo(() => sampleGrass(count), [count]);
  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      vertexShader: GRASS_VERTEX,
      fragmentShader: GRASS_FRAGMENT,
      side: THREE.DoubleSide,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uBase: { value: new THREE.Color('#4fae68') },
          uTip: { value: new THREE.Color('#c2f29f') },
          uAmp: { value: 0.2 },
        },
      ]),
    });
    // Share (not clone) the wind uniforms so every system sees the same gusts.
    m.uniforms.uTime = windUniforms.uTime;
    m.uniforms.uWindDir = windUniforms.uWindDir;
    m.uniforms.uWindStrength = windUniforms.uWindStrength;
    return m;
  }, []);

  return (
    <group>
      {chunks.map((c, i) => (
        <GrassChunkMesh key={i} chunk={c} material={material} />
      ))}
    </group>
  );
}
