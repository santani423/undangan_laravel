import * as THREE from 'three'
import { CAMERA_SHOTS } from '../../config/camera'
import type { CameraShot } from '../../config/types'

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

interface CompiledShot {
  shot: CameraShot
  pos: THREE.CatmullRomCurve3
  tgt: THREE.CatmullRomCurve3
}

/**
 * Samples the camera route at a normalized progress. Each shot is a centripetal Catmull-Rom
 * spline sampled by arc length, eased in/out so the camera settles at every hold.
 */
export class CameraPath {
  private shots: CompiledShot[]

  constructor(shots: CameraShot[] = CAMERA_SHOTS) {
    this.shots = shots.map((shot) => {
      const pos = new THREE.CatmullRomCurve3(shot.positions.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
      const tgt = new THREE.CatmullRomCurve3(shot.targets.map((p) => new THREE.Vector3(...p)), false, 'centripetal')
      pos.arcLengthDivisions = 120
      tgt.arcLengthDivisions = 120
      return { shot, pos, tgt }
    })
  }

  /**
   * @param cut reduced-motion mode: travels become instant cuts at their midpoint, holds stay.
   */
  sample(progress: number, outPos: THREE.Vector3, outTgt: THREE.Vector3, cut = false) {
    const p = Math.min(1, Math.max(0, progress))
    let s = this.shots[this.shots.length - 1]
    for (const c of this.shots) {
      if (p <= c.shot.at[1]) {
        s = c
        break
      }
    }
    const [a, b] = s.shot.at
    let t = (p - a) / (b - a || 1)
    t = Math.min(1, Math.max(0, t))
    if (cut && s.shot.kind === 'travel') t = t < 0.5 ? 0 : 1
    const e = easeInOutSine(t)
    s.pos.getPointAt(e, outPos)
    s.tgt.getPointAt(e, outTgt)
  }
}
