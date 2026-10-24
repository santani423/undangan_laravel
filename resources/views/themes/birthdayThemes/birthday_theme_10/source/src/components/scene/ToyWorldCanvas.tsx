import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { INTRO_CAMERA } from '../../config/world';
import { setExperience } from '../../store/experience';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import type { QualitySettings } from '../../utils/device';
import { CameraRig } from './CameraRig';
import { ToyWorldEnvironment } from './ToyWorldEnvironment';
import { FOG_COLOR, SKY_HORIZON } from './SkyAndSea';

/**
 * Mirrors real Three.js loading-manager progress into the HTML loading screen.
 * Subscribes outside React render (loaders report while components suspend)
 * and forwards on the next frame.
 */
function LoadingReporter() {
  useEffect(() => {
    let frame = 0;
    const push = (progress: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setExperience({ loadProgress: progress }));
    };
    push(useProgress.getState().progress);
    const unsubscribe = useProgress.subscribe((s) => push(s.progress));
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}

/** Signals readiness once assets are in and shaders are compiled (avoids a hitch on reveal). */
function SceneReady() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) requestAnimationFrame(() => !cancelled && setExperience({ sceneReady: true }));
    };
    gl.compileAsync(scene, camera).then(done, done);
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

interface ToyWorldCanvasProps {
  quality: QualitySettings;
  reducedMotion: boolean;
}

/**
 * The one persistent WebGL canvas for the whole invitation. It sits fixed
 * behind the scrolling HTML; React state changes never recreate it.
 */
export default function ToyWorldCanvas({ quality, reducedMotion }: ToyWorldCanvasProps) {
  const visible = usePageVisibility();
  const [dprMax, setDprMax] = useState(quality.dpr[1]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        shadows={quality.shadows ? 'percentage' : false}
        dpr={[quality.dpr[0], dprMax]}
        gl={{
          antialias: quality.antialias,
          powerPreference: 'high-performance',
          stencil: false,
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ fov: 42, near: 0.1, far: 420, position: INTRO_CAMERA.pos }}
        frameloop={visible ? 'always' : 'never'}
        style={{ touchAction: 'pan-y' }}
        onCreated={({ gl }) => {
          if (import.meta.env.DEV) (window as unknown as { __toyGL: THREE.WebGLRenderer }).__toyGL = gl;
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[ToyWorld] WebGL context lost — waiting for restore.');
          });
        }}
      >
        <color attach="background" args={[SKY_HORIZON]} />
        <fog attach="fog" args={[FOG_COLOR, 40, 150]} />
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDprMax((d) => Math.max(quality.dpr[0], +(d - 0.25).toFixed(2)))}
          onIncline={() => setDprMax((d) => Math.min(quality.dpr[1], +(d + 0.25).toFixed(2)))}
        />
        <CameraRig reducedMotion={reducedMotion} />
        <LoadingReporter />
        <Suspense fallback={null}>
          <ToyWorldEnvironment quality={quality} reducedMotion={reducedMotion} />
          <SceneReady />
        </Suspense>
      </Canvas>
    </div>
  );
}
