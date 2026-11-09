import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../../../config/types'
import { WORLD } from '../../../config/world'
import { useMats } from '../materials'
import { Gebyok, Joglo } from '../objects/Joglo'
import { B } from '../objects/primitives'
import { Chair, Glow, KembarMayang, LanternPost, Vase, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

/** Janur kuning pole — a bent bamboo pole with young-coconut-leaf streamers that move in the wind. */
function JanurPole({ p, ry }: { p: Vec3; ry: number }) {
  const m = useMats()
  const geo = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3.6, 0), new THREE.Vector3(1.1, 4.6, 0))
    const pole = new THREE.TubeGeometry(curve, 16, 0.045, 6, false)
    const streamers: THREE.BufferGeometry[] = []
    for (let i = 0; i < 9; i++) {
      const len = 0.9 + (i % 3) * 0.35
      const g = new THREE.PlaneGeometry(0.06, len, 1, 5)
      g.translate(0, -len / 2, 0)
      const pos = g.attributes.position as THREE.BufferAttribute
      const w = new Float32Array(pos.count)
      for (let k = 0; k < pos.count; k++) w[k] = -pos.getY(k) / len
      g.setAttribute('aWind', new THREE.BufferAttribute(w, 1))
      g.rotateY((i / 9) * Math.PI)
      g.translate(1.1 + (i - 4) * 0.02, 4.55, (i - 4) * 0.025)
      streamers.push(g)
    }
    return { pole, streamers }
  }, [])
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <mesh geometry={geo.pole} material={m.janur} castShadow />
      {geo.streamers.map((g, i) => (
        <mesh key={i} geometry={g} material={m.janur} userData={{ dynamic: true }} />
      ))}
    </group>
  )
}

/** Scene 4 · Pawiwahan — wedding pavilion with the pelaminan (bridal dais). */
export function CeremonyScene() {
  const m = useMats()
  const { position, size, platform } = WORLD.ceremony
  const [px, , pz] = position
  const y = platform
  const stageZ = pz - 3.2
  const posts: Vec3[] = [
    [px - 3.4, 0, pz + 7.6],
    [px + 3.4, 0, pz + 7.6],
    [px - 3.4, 0, pz + 11.5],
    [px + 3.4, 0, pz + 11.5],
  ]
  return (
    <group>
      <StaticBatch>
        <Joglo position={position} size={size} platform={platform} />
        {/* pelaminan dais */}
        <B s={[6.4, 0.18, 2.8]} p={[px, y + 0.09, stageZ]} m={m.teakDark} />
        <B s={[6.0, 0.18, 2.5]} p={[px, y + 0.27, stageZ - 0.1]} m={m.teak} />
        <B s={[5.8, 0.012, 2.2]} p={[px, y + 0.366, stageZ - 0.1]} m={m.batikParang} />
        <B s={[2.6, 0.012, 1.6]} p={[px, y + 0.006, stageZ + 2.2]} m={m.batikKawung} />
        <Gebyok position={[px, y + 0.36, pz - 4.45]} width={6.4} height={2.9} cols={5} rich />
        <Chair p={[px - 0.55, y + 0.36, stageZ - 0.3]} />
        <Chair p={[px + 0.55, y + 0.36, stageZ - 0.3]} />
        <KembarMayang p={[px - 2.35, y + 0.36, stageZ - 0.2]} />
        <KembarMayang p={[px + 2.35, y + 0.36, stageZ - 0.2]} />
        <Vase p={[px - 2.8, y + 0.36, stageZ + 0.95]} />
        <Vase p={[px + 2.8, y + 0.36, stageZ + 0.95]} />
        <Vase p={[px - 1.3, y + 0.36, stageZ + 0.95]} />
        <Vase p={[px + 1.3, y + 0.36, stageZ + 0.95]} />
        {/* parang drapes hanging from the soko guru beams */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <B s={[0.02, 2.6, 1.3]} p={[px + s * 2.05, y + 2.85, pz - 0.2]} m={m.batikParang} />
            <B s={[0.05, 0.12, 1.4]} p={[px + s * 2.05, y + 4.18, pz - 0.2]} m={m.gold} />
          </group>
        ))}
        {posts.map((pp, i) => (
          <LanternPost key={i} p={pp} />
        ))}
      </StaticBatch>
      <JanurPole p={[px - 2.7, 0, pz + 7.7]} ry={0.25} />
      <JanurPole p={[px + 2.7, 0, pz + 7.7]} ry={Math.PI - 0.25} />
      {posts.map((pp, i) => (
        <Glow key={i} p={lanternGlowPos(pp)} size={1.2} />
      ))}
    </group>
  )
}
