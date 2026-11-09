import { WORLD } from '../../../config/world'
import type { Vec3 } from '../../../config/types'
import { Gate } from '../objects/Gate'
import { Glow, LanternPost, lanternGlowPos } from '../objects/Props'
import { StaticBatch } from '../StaticBatch'

const LANTERNS: Vec3[] = [
  [-2.6, 0, 5],
  [2.6, 0, 5],
  [-2.6, 0, 13],
  [2.6, 0, 13],
  [-2.6, 0, 21],
  [2.6, 0, 21],
]

/** Scene 1 · Regol — the gateway, forecourt lanterns. (Avenue trees live in the vegetation layer.) */
export function EntranceScene() {
  return (
    <group>
      <Gate position={WORLD.gate.position} passage={WORLD.gate.passageWidth} wallReach={WORLD.gate.wallReach} />
      <StaticBatch>
        {LANTERNS.map((p, i) => (
          <LanternPost key={i} p={p} />
        ))}
      </StaticBatch>
      {LANTERNS.map((p, i) => (
        <Glow key={i} p={lanternGlowPos(p)} size={1.2} />
      ))}
    </group>
  )
}
