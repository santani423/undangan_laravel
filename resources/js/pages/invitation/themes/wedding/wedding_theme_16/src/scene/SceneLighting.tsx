import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Fog, Vector3, type DirectionalLight, type HemisphereLight, type PointLight } from 'three';
import { cameraFocus } from './cameraRig';
import { journey } from './journeyState';
import { forEachVoxelMaterial } from './materials';
import { sharedUniforms, skyUniforms } from './sharedUniforms';

const sunDir = new Vector3();

const DAY = {
  top: new Color('#86bce6'),
  horizon: new Color('#f4e7d1'),
  bottom: new Color('#e7dcc3'),
  fog: new Color('#e9e2cf'),
  sun: new Color('#fff1d6'),
  sunIntensity: 2.6,
  hemiSky: new Color('#e6f2ff'),
  hemiGround: new Color('#6f8a4f'),
  hemiIntensity: 1.25,
  sunDir: new Vector3(0.55, 0.75, 0.38).normalize(),
};

const DUSK = {
  top: new Color('#5f6cab'),
  horizon: new Color('#f7b487'),
  bottom: new Color('#d99a84'),
  fog: new Color('#eab595'),
  sun: new Color('#ff9f66'),
  sunIntensity: 2.0,
  hemiSky: new Color('#ffd2b4'),
  hemiGround: new Color('#5f4d45'),
  hemiIntensity: 0.9,
  sunDir: new Vector3(-0.22, 0.24, -1).normalize(),
};

const POINT_LIGHTS: { position: [number, number, number]; color: string; max: number; from: number }[] = [
  { position: [0, 3.2, -69.5], color: '#ffb46b', max: 30, from: 0.55 },
  { position: [7, 2.6, -50.5], color: '#ffc27a', max: 18, from: 0.35 },
  { position: [1, 1.6, -19], color: '#ffc27a', max: 12, from: 0.15 },
];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

interface SceneLightingProps {
  shadows: boolean;
  shadowMapSize: number;
  pointLights: boolean;
}

/**
 * Sun, sky light, fog and lantern glow. Everything blends between an
 * afternoon and a golden-hour palette based on `journey.dusk`, which the
 * scroll timeline advances as the guest nears the ceremony arch.
 */
export function SceneLighting({ shadows, shadowMapSize, pointLights }: SceneLightingProps) {
  const sunRef = useRef<DirectionalLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const pointRefs = useRef<(PointLight | null)[]>([]);
  const dusk = useRef(journey.dusk);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    dusk.current += (journey.dusk - dusk.current) * (1 - Math.exp(-dt * 3));
    const d = dusk.current;
    sharedUniforms.uDusk.value = d;

    skyUniforms.uTop.value.lerpColors(DAY.top, DUSK.top, d);
    skyUniforms.uHorizon.value.lerpColors(DAY.horizon, DUSK.horizon, d);
    skyUniforms.uBottom.value.lerpColors(DAY.bottom, DUSK.bottom, d);
    skyUniforms.uSunColor.value.lerpColors(DAY.sun, DUSK.sun, d);
    if (state.scene.fog instanceof Fog) state.scene.fog.color.lerpColors(DAY.fog, DUSK.fog, d);

    sunDir.lerpVectors(DAY.sunDir, DUSK.sunDir, d).normalize();
    skyUniforms.uSunDir.value.copy(sunDir);

    const sun = sunRef.current;
    if (sun) {
      sun.position.copy(cameraFocus).addScaledVector(sunDir, 45);
      sun.target.position.copy(cameraFocus);
      sun.target.updateMatrixWorld();
      sun.color.lerpColors(DAY.sun, DUSK.sun, d);
      sun.intensity = DAY.sunIntensity + (DUSK.sunIntensity - DAY.sunIntensity) * d;
    }

    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.lerpColors(DAY.hemiSky, DUSK.hemiSky, d);
      hemi.groundColor.lerpColors(DAY.hemiGround, DUSK.hemiGround, d);
      hemi.intensity = DAY.hemiIntensity + (DUSK.hemiIntensity - DAY.hemiIntensity) * d;
    }

    forEachVoxelMaterial('glass', (material) => {
      material.emissiveIntensity = 0.25 + d * 2.4;
    });
    forEachVoxelMaterial('gold', (material) => {
      material.emissiveIntensity = 0.06 + d * 0.16;
    });

    POINT_LIGHTS.forEach((light, i) => {
      const ref = pointRefs.current[i];
      if (ref) ref.intensity = light.max * smoothstep(light.from, 1, d);
    });
  });

  return (
    <>
      <fog attach="fog" args={[DAY.fog.clone(), 50, 190]} />
      <hemisphereLight ref={hemiRef} args={[DAY.hemiSky, DAY.hemiGround, DAY.hemiIntensity]} />
      <directionalLight
        ref={sunRef}
        castShadow={shadows}
        intensity={DAY.sunIntensity}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      {pointLights &&
        POINT_LIGHTS.map((light, i) => (
          <pointLight
            key={light.position.join(',')}
            ref={(node) => {
              pointRefs.current[i] = node;
            }}
            position={light.position}
            color={light.color}
            intensity={0}
            distance={16}
            decay={1.6}
          />
        ))}
    </>
  );
}
