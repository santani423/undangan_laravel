import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { DefaultLoadingManager, NeutralToneMapping } from 'three';
import { CAMERA_WAYPOINTS } from '../data/cameraWaypoints';
import { QUALITY_PRESETS, lowerTier, type QualityTier } from '../lib/quality';
import { isDebug } from '../lib/urlFlags';
import { CameraController } from './CameraController';
import { Clouds } from './Clouds';
import { GardenEnvironment } from './GardenEnvironment';
import { journey } from './journeyState';
import { disposeMaterials } from './materials';
import { SceneLighting } from './SceneLighting';
import { sceneStatus } from './sceneStatus';
import { sharedUniforms } from './sharedUniforms';
import { Sky } from './Sky';
import { disposeTextures } from './textures';
import { disposeVoxelModels } from './voxelLoader';

export interface WeddingSceneProps {
  initialTier: QualityTier;
  reducedMotion: boolean;
  /** Dress-code palette hex colours (shown as voxel pillars). */
  palette: string[];
  /** Gallery images shown on the garden easels. */
  galleryImages: string[];
  onFailure: (reason: string) => void;
}

DefaultLoadingManager.onStart = () => sceneStatus.set({ phase: 'loading' });
DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  if (sceneStatus.get().phase !== 'ready') sceneStatus.set({ phase: 'loading', progress: total > 0 ? loaded / total : 0 });
};

/** Advances the shared shader clock (frozen when reduced motion is requested). */
function SceneClock({ animate }: { animate: boolean }) {
  useFrame((_, delta) => {
    if (animate) sharedUniforms.uTime.value += Math.min(delta, 0.1);
  });
  return null;
}

/** Reports readiness once the suspended garden has rendered a couple of frames. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 3) sceneStatus.set({ phase: 'ready', progress: 1 });
  });
  return null;
}

/** Exposes renderer stats for automated tests when `?debug=1` is present. */
function DebugBridge() {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    if (!isDebug()) return;
    const target = window as unknown as { __undesia?: Record<string, unknown> };
    target.__undesia = { ...target.__undesia, journey, renderInfo: () => ({ ...gl.info.render, ...gl.info.memory }) };
  }, [gl]);
  return null;
}

export default function WeddingScene({ initialTier, reducedMotion, palette, galleryImages, onFailure }: WeddingSceneProps) {
  const [tier, setTier] = useState(initialTier);
  // Shadows and antialiasing are fixed at start-up; runtime downgrades only
  // touch resolution and decorative density, which is cheap to change.
  const [startup] = useState(() => QUALITY_PRESETS[initialTier]);
  const settings = QUALITY_PRESETS[tier];
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, startup.dpr[1]));
  const animate = !reducedMotion;
  const parallax = !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  useEffect(() => {
    sceneStatus.set({ phase: 'loading' });
    return () => {
      disposeVoxelModels();
      disposeMaterials();
      disposeTextures();
    };
  }, []);

  return (
    <Canvas
      dpr={dpr}
      shadows={startup.shadows ? 'percentage' : false}
      gl={{ antialias: startup.antialias, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 45, near: 0.1, far: 900, position: CAMERA_WAYPOINTS[0].position }}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1.02;
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          sceneStatus.set({ phase: 'failed' });
          onFailure('Konteks WebGL hilang');
        });
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((current) => Math.max(1, Math.round((current - 0.25) * 100) / 100))}
        onIncline={() => setDpr((current) => Math.min(startup.dpr[1], Math.min(window.devicePixelRatio || 1, current + 0.25)))}
        onFallback={() => {
          setDpr(1);
          setTier((current) => lowerTier(current));
        }}
      />
      <SceneClock animate={animate} />
      <CameraController reducedMotion={reducedMotion} parallax={parallax} />
      <SceneLighting shadows={startup.shadows} shadowMapSize={startup.shadowMapSize} pointLights={startup.pointLights} />
      <Sky />
      <Clouds count={settings.clouds} animate={animate} />
      <DebugBridge />
      <Suspense fallback={null}>
        <GardenEnvironment
          settings={{ ...settings, shadows: startup.shadows }}
          palette={palette}
          galleryImages={galleryImages}
          animate={animate}
          pixelRatio={dpr}
        />
        <ReadySignal />
      </Suspense>
    </Canvas>
  );
}
