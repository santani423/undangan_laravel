import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePageVisibility } from '../hooks/usePageVisibility';
import type { QualitySettings } from '../lib/device';
import { INTRO_CAMERA } from '../lib/world';
import { experienceStore, setExperience } from '../store/experience';
import { CameraRig } from './CameraRig';
import { getLoadProgress, onLoadProgress } from './core/loading';
import { FOG_COLOR, SKY_HORIZON } from './SkyAndSea';
import { ToyWorldEnvironment } from './ToyWorldEnvironment';

/**
 * Mirrors the scene's loading-manager progress into the HTML loading screen.
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
        push(getLoadProgress());
        const unsubscribe = onLoadProgress(push);
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

const SAMPLE_MS = 250;
const SAMPLES = 10;
const LOWER_FPS = 45;
const UPPER_FPS = 57;

/**
 * Small stand-in for drei's PerformanceMonitor: averages the frame rate over
 * 250 ms windows and, every ten windows, asks for a lower resolution when ≥ 75 %
 * of them were slow, or a higher one when ≥ 75 % were smooth. Stops adjusting
 * after `flipflops` direction changes. Measuring starts once the scene is ready.
 */
function PerformanceWatch({ onDecline, onIncline, flipflops }: { onDecline: () => void; onIncline: () => void; flipflops: number }) {
    const state = useRef({ frames: 0, elapsed: 0, samples: [] as number[], last: 0 as -1 | 0 | 1, flips: 0 });
    useFrame((_, delta) => {
        const s = state.current;
        if (s.flips >= flipflops || !experienceStore.getState().sceneReady || document.hidden || delta > 0.5) return;
        s.frames += 1;
        s.elapsed += delta;
        if (s.elapsed * 1000 < SAMPLE_MS) return;
        s.samples.push(s.frames / s.elapsed);
        s.frames = 0;
        s.elapsed = 0;
        if (s.samples.length < SAMPLES) return;
        const slow = s.samples.filter((fps) => fps < LOWER_FPS).length / SAMPLES;
        const smooth = s.samples.filter((fps) => fps >= UPPER_FPS).length / SAMPLES;
        s.samples = [];
        const direction = slow >= 0.75 ? -1 : smooth >= 0.75 ? 1 : 0;
        if (direction === 0) return;
        if (s.last !== 0 && direction !== s.last) s.flips += 1;
        s.last = direction;
        if (direction < 0) onDecline();
        else onIncline();
    });
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
        <div className="bt10-canvas" aria-hidden="true">
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
                <PerformanceWatch
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
