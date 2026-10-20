import type { Vec3 } from '../../../config/types'
import { Motes } from '../objects/Environment'
import { Glow, LanternPost, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

const WEST_LAWN_LANTERNS: Vec3[] = [
  [-11, 0, -27.4],
  [-14.2, 0, -29.2],
  [-9, 0, -16],
  [9, 0, -16],
  [-9, 0, -32.4],
  [9, 0, -32.4],
  [-20.6, 0, -20],
  [-16.2, 0, -12.6],
]

const FIREFLY_BOUNDS: [number, number, number, number, number, number] = [-30, 6, 0.4, 2.6, -40, -6]
const POLLEN_BOUNDS: [number, number, number, number, number, number] = [12, 42, 0.5, 3.2, -50, -20]
const fireflyOpacity = (p: number) => Math.max(0, Math.min(1, (p - 0.86) / 0.08))
const pollenOpacity = (p: number) => 0.55 * Math.max(0, 1 - Math.abs(p - 0.32) / 0.12)

/** Scene 9 · Panutup — twilight: lantern-lined lawns around the pendhapa and fireflies. */
export function ClosingScene({ particles }: { particles: number }) {
  return (
    <group>
      <StaticBatch>
        {WEST_LAWN_LANTERNS.map((p, i) => (
          <LanternPost key={i} p={p} />
        ))}
      </StaticBatch>
      {WEST_LAWN_LANTERNS.map((p, i) => (
        <Glow key={i} p={lanternGlowPos(p)} size={1.3} />
      ))}
      {/* fireflies (kunang-kunang) appear only as dusk falls */}
      <Motes
        count={Math.round(particles * 0.8)}
        bounds={FIREFLY_BOUNDS}
        color="#ffd27a"
        size={2.2}
        opacity={fireflyOpacity}
      />
      {/* sparse pollen drifting through the garden by day */}
      <Motes
        count={Math.round(particles * 0.6)}
        bounds={POLLEN_BOUNDS}
        color="#fff3cf"
        size={0.9}
        opacity={pollenOpacity}
      />
    </group>
  )
}
