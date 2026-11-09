import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { islandPolygon } from './lib/curves';
import { windUniforms } from './lib/wind';
import { SUN_DIRECTION } from './SceneLights';

export const SKY_HORIZON = '#e4f4fc';
export const FOG_COLOR = '#dcf0fa';

/** Pastel gradient sky with a soft sun glow. Follows the camera so it never clips. */
export function SkyDome() {
  const mesh = useRef<THREE.Mesh>(null!);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        uniforms: {
          uTop: { value: new THREE.Color('#6fc0ef') },
          uMid: { value: new THREE.Color('#a9dcf6') },
          uHorizon: { value: new THREE.Color(SKY_HORIZON) },
          uSun: { value: new THREE.Color('#fff2cf') },
          uSunDir: { value: SUN_DIRECTION.clone() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunDir;
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.18, h));
            col = mix(col, uTop, smoothstep(0.18, 0.7, h));
            float sun = max(dot(d, normalize(uSunDir)), 0.0);
            col = mix(col, uSun, pow(sun, 6.0) * 0.35);
            col += uSun * pow(sun, 180.0) * 0.5;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );

  useFrame(({ camera }) => mesh.current.position.copy(camera.position));

  return (
    <mesh ref={mesh} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[320, 32, 16]} />
    </mesh>
  );
}

const SEA_LEVEL = -0.78;

/** Toy-like pastel sea with wind-aligned ripples. */
export function Sea() {
  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uDeep: { value: new THREE.Color('#5fc1ea') },
          uShallow: { value: new THREE.Color('#9be2f6') },
        },
      ]),
      vertexShader: /* glsl */ `
        #include <common>
        #include <fog_pars_vertex>
        varying vec3 vWorld;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vec4 mvPosition = viewMatrix * world;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: /* glsl */ `
        #include <common>
        #include <fog_pars_fragment>
        uniform vec3 uDeep; uniform vec3 uShallow;
        uniform float uTime; uniform vec2 uWindDir;
        varying vec3 vWorld;
        void main() {
          vec2 p = vWorld.xz;
          vec2 perp = vec2(-uWindDir.y, uWindDir.x);
          float a = sin(dot(p, uWindDir) * 0.55 - uTime * 1.1) * 0.5 + 0.5;
          float b = sin(dot(p, perp) * 0.9 + uTime * 0.6 + sin(p.x * 0.15) * 1.5) * 0.5 + 0.5;
          vec3 col = mix(uDeep, uShallow, 0.32 + 0.28 * a * b);
          float glint = smoothstep(0.985, 1.0, sin(dot(p, uWindDir) * 1.6 - uTime * 1.4 + sin(dot(p, perp) * 0.45) * 2.4));
          glint *= 0.5 + 0.5 * sin(dot(p, perp) * 0.33 + uTime * 0.4);
          col = mix(col, vec3(1.0), glint * 0.16);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    });
    m.uniforms.uTime = windUniforms.uTime;
    m.uniforms.uWindDir = windUniforms.uWindDir;
    return m;
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, SEA_LEVEL, -30]} material={material}>
      <circleGeometry args={[340, 64]} />
    </mesh>
  );
}

/** Offsets the island outline outward along its normals. */
function offsetOutline(distance: number) {
  const pts = islandPolygon;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[(i + 1) % pts.length];
    area += x1 * z2 - x2 * z1;
  }
  const sign = area > 0 ? -1 : 1;
  return pts.map(([x, z], i) => {
    const [px, pz] = pts[(i - 1 + pts.length) % pts.length];
    const [nx, nz] = pts[(i + 1) % pts.length];
    const tx = nx - px;
    const tz = nz - pz;
    const len = Math.hypot(tx, tz) || 1;
    return new THREE.Vector2(x + (sign * tz * distance) / len, z - (sign * tx * distance) / len);
  });
}

/** White foam ring hugging the island's beach. */
export function ShoreFoam() {
  const ref = useRef<THREE.MeshBasicMaterial>(null!);
  const geometry = useMemo(() => {
    // Shape lives in XY with y = -worldZ so rotating -90° about X lays it on the ground.
    const outer = offsetOutline(2.4).map((v) => new THREE.Vector2(v.x, -v.y));
    const inner = offsetOutline(0.7).map((v) => new THREE.Vector2(v.x, -v.y));
    const shape = new THREE.Shape(outer);
    shape.holes.push(new THREE.Path(inner));
    return new THREE.ShapeGeometry(shape, 1);
  }, []);

  useFrame(({ clock }) => {
    ref.current.opacity = 0.42 + Math.sin(clock.elapsedTime * 0.9) * 0.12;
  });

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} position={[0, SEA_LEVEL + 0.02, 0]}>
      <meshBasicMaterial ref={ref} color="#ffffff" transparent depthWrite={false} />
    </mesh>
  );
}

export { SEA_LEVEL };
