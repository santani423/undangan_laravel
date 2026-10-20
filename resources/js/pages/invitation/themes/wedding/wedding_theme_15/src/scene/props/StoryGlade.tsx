import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { wedding } from '../../config/wedding'
import { mulberry32, range } from '../../lib/random'
import { sceneFx } from '../../state/sceneFx'
import { useApp } from '../../state/store'
import { envState } from '../envState'
import { FOCI, groundHeight, pathX } from '../layout'
import { lathe } from '../geometry'
import { clayMaterial, glowMaterial } from '../materials'
import { Instanced, useDisposable, type InstanceItem } from '../Instanced'
import { buildGlowData, GlowPoints } from '../effects/GlowPoints'
import { PhotoFrame } from './PhotoFrame'

const STREAM_Z = -48.2
const streamZ = (x: number) => STREAM_Z + Math.sin(x * 0.18) * 1.1

/** Glowing stream ribbon with flowing sparkles in the shader. */
function Stream() {
  const geometry = useDisposable(() => {
    const verts: number[] = []
    const uvs: number[] = []
    const idx: number[] = []
    let row = 0
    for (let x = -16; x <= 12; x += 0.4) {
      const z = streamZ(x)
      const w = 0.75 + Math.sin(x * 0.4) * 0.12
      for (const s of [-1, 1]) {
        const zz = z + s * w
        verts.push(x, Math.max(groundHeight(x, zz), 0) + 0.05, zz)
        uvs.push((x + 16) / 28, s < 0 ? 0 : 1)
      }
      if (row > 0) {
        const a = (row - 1) * 2
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
      row++
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(idx)
    return g
  }, [])
  const material = useDisposable(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
          void main() {
            float edge = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
            float ends = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
            vec2 flow = vec2(vUv.x * 60.0 - uTime * 0.6, vUv.y * 4.0);
            float ripple = 0.5 + 0.5 * sin(flow.x * 0.7 + sin(vUv.y * 9.0 + uTime) * 1.5);
            vec2 cell = floor(flow);
            float sparkle = step(0.93, hash(cell)) * smoothstep(0.5, 0.0, length(fract(flow) - 0.5)) * (0.5 + 0.5 * sin(uTime * 3.0 + hash(cell) * 40.0));
            vec3 deep = vec3(0.10, 0.16, 0.36);
            vec3 glow = vec3(0.45, 0.68, 0.98);
            vec3 col = mix(deep, glow, ripple * 0.35 + 0.15) + sparkle * vec3(1.0, 0.95, 0.85) * 1.4;
            gl_FragColor = vec4(col, edge * ends * 0.92);
          }
        `,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = sceneFx.reducedMotion ? 0 : clock.elapsedTime
  })
  return <mesh geometry={geometry} material={material} renderOrder={2} />
}

/** Small arched wooden bridge where the path crosses the stream. */
function Bridge() {
  const bx = pathX(STREAM_Z)
  const bz = streamZ(bx)
  const geos = useDisposable(() => {
    const plank = new RoundedBoxGeometry(1.5, 0.06, 0.26, 2, 0.02)
    const arc = (x: number, lift: number) =>
      new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => {
        const t = i / 8
        return new THREE.Vector3(x, Math.sin(t * Math.PI) * 0.42 + 0.16 + lift, -1.8 + t * 3.6)
      }))
    const railL = new THREE.TubeGeometry(arc(-0.72, 0.5), 30, 0.03, 6)
    const railR = new THREE.TubeGeometry(arc(0.72, 0.5), 30, 0.03, 6)
    const post = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6).translate(0, 0.3, 0)
    return { plank, railL, railR, post, dispose: () => [plank, railL, railR, post].forEach((g) => g.dispose()) }
  }, [])
  const mat = useDisposable(() => clayMaterial({ color: '#8a6a6e', rim: '#f5d58b', rimStrength: 0.25 }), [])
  const { planks, posts } = useMemo(() => {
    const planks: InstanceItem[] = []
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      const y = Math.sin(t * Math.PI) * 0.42 + 0.14
      const slope = Math.cos(t * Math.PI) * 0.42 * Math.PI / 3.6
      planks.push({ p: [0, y, -1.8 + t * 3.6], r: [-Math.atan(slope), 0, 0] })
    }
    const posts: InstanceItem[] = []
    for (const x of [-0.72, 0.72]) for (const t of [0, 0.5, 1]) posts.push({ p: [x, Math.sin(t * Math.PI) * 0.42 + 0.14, -1.8 + t * 3.6] })
    return { planks, posts }
  }, [])
  const dir = Math.atan2(pathX(STREAM_Z - 1) - pathX(STREAM_Z + 1), -2)
  return (
    <group position={[bx, groundHeight(bx, bz), bz]} rotation={[0, dir + Math.PI, 0]}>
      <Instanced geometry={geos.plank} material={mat} items={planks} />
      <Instanced geometry={geos.post} material={mat} items={posts} />
      <mesh geometry={geos.railL} material={mat} />
      <mesh geometry={geos.railR} material={mat} />
    </group>
  )
}

/** A storybook mushroom cottage with a glowing window. */
function MushroomCottage() {
  const [sx, , sz] = FOCI.story
  const geos = useDisposable(() => {
    const stem = lathe([[0.0001, 0], [0.95, 0], [0.88, 0.2], [0.78, 0.9], [0.74, 1.5], [0.8, 1.7], [0.0001, 1.72]], 20)
    const capPts: Array<[number, number]> = [[0.0001, 1.55], [1.5, 1.6], [1.85, 1.7]]
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * (Math.PI / 2)
      capPts.push([Math.max(0.0001, Math.cos(a) * 1.85), 1.7 + Math.sin(a) * 1.25])
    }
    const cap = lathe(capPts, 28)
    const dot = new THREE.SphereGeometry(0.16, 12, 8)
    const door = new RoundedBoxGeometry(0.5, 0.8, 0.12, 3, 0.06)
    const win = new THREE.CircleGeometry(0.2, 24)
    const frame = new THREE.TorusGeometry(0.21, 0.035, 8, 24)
    return { stem, cap, dot, door, win, frame, dispose: () => [stem, cap, dot, door, win, frame].forEach((g) => g.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const list = {
      stem: clayMaterial({ color: '#efe0d4', rim: '#ffffff', rimStrength: 0.3 }),
      cap: clayMaterial({ color: '#d4708e', rim: '#ffc9d8', rimStrength: 0.45 }),
      dot: clayMaterial({ color: '#fff8ee', selfGlow: 0, emissive: '#5a5050', emissiveIntensity: 0.4 }),
      door: clayMaterial({ color: '#6b4a5a', rimStrength: 0.2 }),
      win: glowMaterial('#ffd88f', 1.9),
      frame: clayMaterial({ color: '#8a6a6e' }),
    }
    return { ...list, dispose: () => Object.values(list).forEach((m) => m.dispose()) }
  }, [])
  const dots = useMemo(() => {
    const rng = mulberry32(3)
    return Array.from({ length: 11 }, () => {
      const a = rng() * Math.PI * 2
      const e = range(rng, 0.25, 1.2)
      return { p: [Math.cos(a) * Math.cos(e) * 1.85, 1.7 + Math.sin(e) * 1.25, Math.sin(a) * Math.cos(e) * 1.85] as [number, number, number], s: range(rng, 0.6, 1.2) }
    })
  }, [])
  const glow = useMemo(() => buildGlowData([{ p: [0.35, 1.0, 0.8], color: '#ffc56e', size: 1.8, intensity: 0.8 }]), [])
  const x = sx - 3.2
  const z = sz - 2.4
  return (
    <group position={[x, groundHeight(x, z) - 0.05, z]} rotation={[0, 0.6, 0]} scale={0.95}>
      <mesh geometry={geos.stem} material={mats.stem} />
      <mesh geometry={geos.cap} material={mats.cap} />
      {dots.map((d, i) => (
        <mesh key={i} geometry={geos.dot} material={mats.dot} position={d.p} scale={[d.s, d.s * 0.45, d.s]} />
      ))}
      <mesh geometry={geos.door} material={mats.door} position={[-0.25, 0.4, 0.8]} rotation={[0, -0.25, 0]} />
      <mesh geometry={geos.win} material={mats.win} position={[0.4, 1.0, 0.76]} rotation={[0, 0.45, 0]} />
      <mesh geometry={geos.frame} material={mats.frame} position={[0.4, 1.0, 0.765]} rotation={[0, 0.45, 0]} />
      <GlowPoints data={glow} flicker={0.1} fadeNear={30} fadeFar={60} />
    </group>
  )
}

/** Scene 4: floating storybook frames — the chapter in the reading area lifts and glows. */
export function StoryGlade() {
  const [sx, , sz] = FOCI.story
  const cam = new THREE.Vector3(-0.4, 2.3, -36.2)
  const frames = useMemo(
    () =>
      wedding.story.map((ch, i) => {
        const a = -0.9 + (i / Math.max(1, wedding.story.length - 1)) * 1.8
        const p: [number, number, number] = [sx + 0.8 + Math.sin(a) * 2.3, 1.9 + (i % 2) * 0.45, sz + 1.2 + Math.cos(a) * 0.6 - 1]
        const yaw = Math.atan2(cam.x - p[0], cam.z - p[2])
        return { ch, p, yaw, i }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sx, sz],
  )
  return (
    <group>
      <Stream />
      <Bridge />
      <MushroomCottage />
      {frames.map(({ ch, p, yaw, i }) =>
        ch.image ? (
          <PhotoFrame
            key={ch.id}
            url={ch.image}
            position={p}
            rotation={[0, yaw, 0]}
            scale={0.9}
            phase={i * 0.27}
            highlight={() => {
              const near = 1 - THREE.MathUtils.smoothstep(Math.abs(envState.section - 3), 0.2, 0.8)
              return useApp.getState().activeStory === i ? near : 0
            }}
          />
        ) : null,
      )}
    </group>
  )
}
