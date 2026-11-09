import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DAMP } from '../animation/easing'
import { sectionFromQ } from '../animation/scrollScene'
import { sceneFx } from '../state/sceneFx'
import { envState } from './envState'
import { buildCameraCurves } from './cameraPath'
import { COVER_FRAME, FOV, WAYPOINTS } from './waypoints'

const tmpPos = new THREE.Vector3()
const tmpTarget = new THREE.Vector3()
const coverPos = new THREE.Vector3()
const coverTarget = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)
const colA = new THREE.Color()
const colB = new THREE.Color()
const lightA = new THREE.Vector3()
const lightB = new THREE.Vector3()

/**
 * The only writer of camera transform, projection offset and environment state.
 * Reads the scroll target (sceneFx.qTarget) and the opening progress (sceneFx.intro),
 * damps toward them, and samples the waypoint curves.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const mobile = size.width / size.height < 0.85
  const curves = useMemo(() => buildCameraCurves(mobile), [mobile])
  const state = useRef({ q: 0, fx: 0, fy: 0, px: 0, py: 0, fov: mobile ? FOV.mobile : FOV.desktop })
  const n = WAYPOINTS.length * 2 - 1

  useEffect(() => {
    return () => camera.clearViewOffset()
  }, [camera])

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = state.current
    const reduced = sceneFx.reducedMotion

    // 1. Scroll parameter (damped glide, or snap to the nearest composition for reduced motion).
    const qGoal = reduced ? Math.round(sceneFx.qTarget / 2) * 2 : sceneFx.qTarget
    s.q = THREE.MathUtils.damp(s.q, qGoal, reduced ? DAMP.snap : DAMP.camera, dt)
    if (Math.abs(s.q - qGoal) < 1e-4) s.q = qGoal
    const u = THREE.MathUtils.clamp(s.q / n, 0, 1)
    curves.pos.getPoint(u, tmpPos)
    curves.target.getPoint(u, tmpTarget)

    // 2. Opening: glide from the envelope close-up into the forest.
    const intro = sceneFx.intro
    if (intro < 1) {
      const e = intro
      coverPos.copy(curves.cover.pos).lerp(tmpPos, e)
      coverTarget.copy(curves.cover.target).lerp(tmpTarget, e)
      tmpPos.copy(coverPos)
      tmpTarget.copy(coverTarget)
    }

    // 3. Pointer parallax + idle breathing (secondary motion, small amplitudes).
    s.px = THREE.MathUtils.damp(s.px, reduced ? 0 : sceneFx.pointerX, DAMP.pointer, dt)
    s.py = THREE.MathUtils.damp(s.py, reduced ? 0 : sceneFx.pointerY, DAMP.pointer, dt)
    right.subVectors(tmpTarget, tmpPos).cross(up).normalize()
    const t = reduced ? 0 : clock.elapsedTime
    tmpPos.addScaledVector(right, s.px * 0.32 + Math.sin(t * 0.21) * 0.05)
    tmpPos.y += s.py * 0.18 + Math.sin(t * 0.33) * 0.04

    camera.position.copy(tmpPos)
    camera.lookAt(tmpTarget)
    envState.focus.copy(tmpTarget)

    // 4. Composition: where the subject sits on screen for this section.
    const sec = sectionFromQ(s.q)
    const i0 = Math.min(WAYPOINTS.length - 1, Math.floor(sec))
    const i1 = Math.min(WAYPOINTS.length - 1, i0 + 1)
    const f = sec - i0
    const key = mobile ? 'mobile' : 'desktop'
    const a = WAYPOINTS[i0].frame[key]
    const b = WAYPOINTS[i1].frame[key]
    let gx = a[0] + (b[0] - a[0]) * f
    let gy = a[1] + (b[1] - a[1]) * f
    if (intro < 1) {
      gx = COVER_FRAME[key][0] + (gx - COVER_FRAME[key][0]) * intro
      gy = COVER_FRAME[key][1] + (gy - COVER_FRAME[key][1]) * intro
    }
    s.fx = THREE.MathUtils.damp(s.fx, gx, reduced ? DAMP.snap : DAMP.frame, dt)
    s.fy = THREE.MathUtils.damp(s.fy, gy, reduced ? DAMP.snap : DAMP.frame, dt)
    s.fov = THREE.MathUtils.damp(s.fov, mobile ? FOV.mobile : FOV.desktop, 3, dt)
    const w = size.width
    const h = size.height
    camera.fov = s.fov
    camera.setViewOffset(w, h, -s.fx * w, s.fy * h, w, h)
    camera.updateProjectionMatrix()

    // 5. Environment blend between the two neighbouring sections.
    const ea = WAYPOINTS[i0].env
    const eb = WAYPOINTS[i1].env
    colA.set(ea.fog)
    colB.set(eb.fog)
    envState.fog.copy(colA.lerp(colB, f))
    envState.fogNear = ea.fogNear + (eb.fogNear - ea.fogNear) * f
    envState.fogFar = ea.fogFar + (eb.fogFar - ea.fogFar) * f
    envState.light.copy(lightA.set(...ea.light).lerp(lightB.set(...eb.light), f))
    envState.lightIntensity = ea.lightIntensity + (eb.lightIntensity - ea.lightIntensity) * f
    envState.moon = ea.moon + (eb.moon - ea.moon) * f
    envState.section = sec
  })

  return null
}
