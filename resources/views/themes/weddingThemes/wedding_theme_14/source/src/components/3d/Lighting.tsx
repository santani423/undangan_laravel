import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { journey } from '../../state/journey'
import { cameraTarget } from './CameraRig'
import { createLightingSample, sampleLighting, skyUniforms } from './lightingState'
import { useMats } from './materials'
import { grassLightUniforms, windUniforms } from './wind'

/**
 * Time-of-day driven by journey progress: sun, hemisphere fill, fog, sky shader, exposure,
 * lantern glow and point lights all come from one interpolated sample per frame.
 */
const SHADOW_HALF = 24
const ORIGIN = new THREE.Vector3()
const UP = new THREE.Vector3(0, 1, 0)

export function Lighting({ shadows, shadowMap = 2048, pointLights }: { shadows: boolean; shadowMap?: number; pointLights: { position: [number, number, number] }[] }) {
  const { scene, gl, camera } = useThree()
  const m = useMats()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const lamps = useRef<(THREE.PointLight | null)[]>([])
  const sample = useMemo(() => createLightingSample(), [])
  const fog = useMemo(() => new THREE.Fog('#efe2c6', 30, 150), [])
  const tmp = useMemo(() => ({ center: new THREE.Vector3(), fwd: new THREE.Vector3(), rot: new THREE.Matrix4(), inv: new THREE.Matrix4() }), [])

  useEffect(() => {
    scene.fog = fog
    // Neutral studio environment for subtle reflections on brass/water (no HDRI ships with the pack).
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.42
    return () => {
      scene.fog = null
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [scene, gl, fog])

  useEffect(() => {
    const s = sun.current
    if (!s) return
    scene.add(s.target)
    return () => {
      scene.remove(s.target)
    }
  }, [scene])

  useFrame((_, dt) => {
    sampleLighting(journey.progress, sample)
    const s = sun.current
    if (s) {
      s.color.copy(sample.sunColor)
      s.intensity = sample.sunIntensity
      // Centre the shadow frustum on the ground the camera actually sees (a little ahead of it),
      // then snap that centre to the shadow-map texel grid in light space so shadows never
      // shimmer or crawl while the camera travels.
      tmp.fwd.subVectors(cameraTarget, camera.position).setY(0)
      const fl = tmp.fwd.length()
      if (fl > 1e-4) tmp.fwd.multiplyScalar(1 / fl)
      tmp.center.copy(camera.position).addScaledVector(tmp.fwd, SHADOW_HALF * 0.55).setY(0)
      tmp.rot.lookAt(sample.sunDir, ORIGIN, UP)
      tmp.inv.copy(tmp.rot).invert()
      tmp.center.applyMatrix4(tmp.inv)
      const texel = (SHADOW_HALF * 2) / shadowMap
      tmp.center.x = Math.round(tmp.center.x / texel) * texel
      tmp.center.y = Math.round(tmp.center.y / texel) * texel
      tmp.center.applyMatrix4(tmp.rot)
      s.target.position.copy(tmp.center)
      s.position.copy(tmp.center).addScaledVector(sample.sunDir, 70)
      s.target.updateMatrixWorld()
    }
    if (hemi.current) {
      hemi.current.color.copy(sample.hemiSky)
      // warm ground bounce lifts pavilion ceilings and undersides of eaves
      hemi.current.groundColor.copy(sample.hemiGround).multiplyScalar(1.45)
      hemi.current.intensity = sample.hemiIntensity
    }
    fog.color.copy(sample.skyHorizon)
    fog.near = sample.fogNear
    fog.far = sample.fogFar
    skyUniforms.uTop.value.copy(sample.skyTop)
    skyUniforms.uHorizon.value.copy(sample.skyHorizon)
    skyUniforms.uBottom.value.copy(sample.skyBottom)
    skyUniforms.uSunColor.value.copy(sample.sunColor)
    skyUniforms.uSunDir.value.copy(sample.sunDir)
    skyUniforms.uStars.value = sample.stars
    gl.toneMappingExposure = sample.exposure

    m.lanternGlass.emissiveIntensity = 0.35 + sample.lanternGlow * 2.6
    m.glow.opacity = 0.08 + sample.lanternGlow * 0.6
    lamps.current.forEach((l) => {
      if (l) l.intensity = sample.lanternGlow * 9
    })

    grassLightUniforms.uSunColor.value.copy(sample.sunColor)
    grassLightUniforms.uSunIntensity.value = sample.sunIntensity
    grassLightUniforms.uAmbient.value.copy(sample.hemiSky).multiplyScalar(sample.hemiIntensity * 0.85)
    grassLightUniforms.uSunDir.value.copy(sample.sunDir)

    windUniforms.uTime.value += dt * (journey.reducedMotion ? 0.35 : 1)
    windUniforms.uWindStrength.value = journey.reducedMotion ? 0.35 : 1
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#cfd9e6', '#5a4a35', 0.9]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-camera-left={-SHADOW_HALF}
        shadow-camera-right={SHADOW_HALF}
        shadow-camera-top={SHADOW_HALF}
        shadow-camera-bottom={-SHADOW_HALF}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-radius={3}
      />
      {pointLights.map((pl, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            lamps.current[i] = el
          }}
          position={pl.position}
          color="#ffb867"
          distance={12}
          decay={1.6}
          intensity={0}
        />
      ))}
    </>
  )
}
