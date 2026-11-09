import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityTier } from '../../lib/device'
import { mulberry32, pick, range } from '../../lib/random'
import { sceneFx } from '../../state/sceneFx'
import { CLEARINGS, FOCI, PATH_END_Z, groundHeight, pathX } from '../layout'
import { envState } from '../envState'
import { petalGeometry } from '../geometry'
import { clayMaterial } from '../materials'
import { mistTexture } from '../textures'
import { useDisposable } from '../Instanced'
import { GlowPoints, type GlowPointsData } from './GlowPoints'

const COUNTS: Record<QualityTier, { flies: number; dust: number; petals: number; mist: number }> = {
  high: { flies: 340, dust: 700, petals: 70, mist: 18 },
  medium: { flies: 210, dust: 340, petals: 45, mist: 12 },
  low: { flies: 110, dust: 140, petals: 26, mist: 7 },
}

function gauss(rng: () => number) {
  return (rng() + rng() + rng() - 1.5) / 1.5
}

function buildFlies(count: number, seed: number, opts: { spread: number; yMin: number; yMax: number; sizes: [number, number]; colors: string[]; intensity: number }): GlowPointsData {
  const rng = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    let x: number
    let z: number
    if (rng() < 0.35) {
      const cl = pick(rng, CLEARINGS)
      x = cl.x + gauss(rng) * cl.r
      z = cl.z + gauss(rng) * cl.r
    } else {
      z = range(rng, 22, PATH_END_Z - 8)
      x = pathX(z) + gauss(rng) * opts.spread
    }
    const y = groundHeight(x, z) + range(rng, opts.yMin, opts.yMax)
    positions.set([x, y, z], i * 3)
    c.set(pick(rng, opts.colors)).multiplyScalar(opts.intensity * range(rng, 0.7, 1.1))
    colors.set([c.r, c.g, c.b], i * 3)
    sizes[i] = range(rng, ...opts.sizes)
    phases[i] = rng()
  }
  return { positions, colors, sizes, phases }
}

/** Fireflies and floating magical dust — two GPU-animated point clouds. */
export function Fireflies({ quality }: { quality: QualityTier }) {
  const n = COUNTS[quality]
  const flies = useMemo(
    () => buildFlies(n.flies, 11, { spread: 7, yMin: 0.35, yMax: 3.4, sizes: [0.14, 0.3], colors: ['#fff1a8', '#ffe28a', '#f5d58b'], intensity: 1.7 }),
    [n.flies],
  )
  const dust = useMemo(
    () => buildFlies(n.dust, 12, { spread: 11, yMin: 0.2, yMax: 6, sizes: [0.05, 0.1], colors: ['#b9d5f2', '#d9d0ff', '#f2c5d2', '#fff8ee'], intensity: 1.1 }),
    [n.dust],
  )
  return (
    <>
      <GlowPoints data={flies} drift={1.1} twinkle={0.85} fadeNear={26} fadeFar={46} />
      <GlowPoints data={dust} drift={0.7} twinkle={0.6} opacity={0.65} fadeNear={18} fadeFar={34} />
    </>
  )
}

/** Low drifting mist sprites between the trees — layered depth without volumetrics. */
export function Mist({ quality }: { quality: QualityTier }) {
  const count = COUNTS[quality].mist
  const items = useMemo(() => {
    const rng = mulberry32(31)
    return Array.from({ length: count }, (_, i) => {
      const z = 20 - (i / count) * 128 + range(rng, -3, 3)
      const x = pathX(z) + range(rng, -6, 6)
      return { x, y: groundHeight(x, z) + range(rng, 0.4, 1.1), z, s: range(rng, 7, 12), o: range(rng, 0.07, 0.14), ph: rng() * 6 }
    })
  }, [count])
  const refs = useRef<Array<THREE.Sprite | null>>([])
  useFrame(({ clock, camera }) => {
    const t = sceneFx.reducedMotion ? 0 : clock.elapsedTime
    items.forEach((m, i) => {
      const s = refs.current[i]
      if (!s) return
      s.position.x = m.x + Math.sin(t * 0.05 + m.ph) * 1.6
      // Never let a puff sit on the lens.
      const d = s.position.distanceTo(camera.position)
      ;(s.material as THREE.SpriteMaterial).opacity = m.o * THREE.MathUtils.smoothstep(d, 3, 8)
    })
  })
  return (
    <group>
      {items.map((m, i) => (
        <sprite key={i} ref={(el) => (refs.current[i] = el)} position={[m.x, m.y, m.z]} scale={[m.s, m.s * 0.4, 1]} renderOrder={3}>
          <spriteMaterial map={mistTexture()} color="#b4afe6" transparent opacity={m.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

const PETAL_COLORS = ['#F2C5D2', '#f7d7e1', '#FFF8EE', '#d9c8f2', '#efb3c6']
const dummy = new THREE.Object3D()
const col = new THREE.Color()

/**
 * Occasional falling petals around wherever the camera is looking,
 * denser at the ceremony; plus a burst from the envelope when it opens.
 */
export function Petals({ quality }: { quality: QualityTier }) {
  const count = COUNTS[quality].petals
  const mesh = useRef<THREE.InstancedMesh>(null)
  const geo = useDisposable(() => petalGeometry(), [])
  const mat = useDisposable(() => clayMaterial({ side: THREE.DoubleSide, selfGlow: 0.25, rimStrength: 0.2, rim: '#fff8ee' }), [])
  const sim = useMemo(() => {
    const rng = mulberry32(77)
    return Array.from({ length: count }, () => ({
      p: new THREE.Vector3(range(rng, -8, 8), range(rng, 0, 7), range(rng, -8, 8)),
      v: new THREE.Vector3(0, -range(rng, 0.25, 0.5), 0),
      rot: new THREE.Euler(rng() * 6, rng() * 6, rng() * 6),
      spin: range(rng, 0.6, 1.8),
      ph: rng() * 6,
      scale: range(rng, 0.7, 1.3),
      color: pick(rng, PETAL_COLORS),
      burst: false,
      rng,
    }))
  }, [count])
  const lastBurst = useRef(-1)
  const colored = useRef(false)

  useFrame(({ clock }, rawDt) => {
    const m = mesh.current
    if (!m) return
    const dt = Math.min(rawDt, 0.05)
    const t = clock.elapsedTime
    const focus = envState.focus
    // Ceremony (section 4) and the closing get a gentle shower; elsewhere petals are sparse.
    const sec = envState.section
    const density = 0.35 + 0.65 * Math.max(Math.exp(-Math.pow(sec - 4, 2) * 2), Math.exp(-Math.pow(sec - 8, 2) * 2), Math.exp(-Math.pow(sec - 7, 2) * 3))

    if (sceneFx.burstAt > 0 && sceneFx.burstAt !== lastBurst.current) {
      lastBurst.current = sceneFx.burstAt
      const [ex, ey, ez] = FOCI.envelope
      sim.forEach((s, i) => {
        if (i % 2) return
        s.burst = true
        s.p.set(ex + range(s.rng, -0.2, 0.2), ey + range(s.rng, -0.1, 0.2), ez)
        const a = s.rng() * Math.PI * 2
        s.v.set(Math.cos(a) * range(s.rng, 0.8, 2.2), range(s.rng, 1, 2.6), Math.sin(a) * 0.8 - 0.4)
      })
    }

    sim.forEach((s, i) => {
      if (!sceneFx.reducedMotion) {
        if (s.burst) {
          s.v.y -= 1.4 * dt
          s.v.multiplyScalar(1 - 0.9 * dt)
          if (s.v.y < -0.45) {
            s.v.y = -0.45
            s.burst = false
          }
        }
        s.p.addScaledVector(s.v, dt)
        s.p.x += Math.sin(t * 0.8 + s.ph) * 0.25 * dt
        s.p.z += Math.cos(t * 0.6 + s.ph) * 0.15 * dt
        s.rot.x += s.spin * dt
        s.rot.y += s.spin * 0.7 * dt
      }
      // Respawn above the current focus when out of range.
      const dx = s.p.x - focus.x
      const dz = s.p.z - focus.z
      if (!s.burst && (s.p.y < groundHeight(s.p.x, s.p.z) - 0.1 || Math.abs(dx) > 9 || Math.abs(dz) > 9)) {
        s.p.set(focus.x + range(s.rng, -8, 8), focus.y + range(s.rng, 2.5, 6), focus.z + range(s.rng, -8, 8))
        s.v.set(0, -range(s.rng, 0.25, 0.5), 0)
      }
      const visible = s.burst || i / count < density
      dummy.position.copy(s.p)
      dummy.rotation.copy(s.rot)
      dummy.scale.setScalar(visible ? s.scale : 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      if (!colored.current) m.setColorAt(i, col.set(s.color))
    })
    colored.current = true
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
}
