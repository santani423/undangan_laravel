import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { NeutralToneMapping } from 'three';
import { CAMERA_WAYPOINTS } from '../lib/cameraWaypoints';
import { QUALITY_PRESETS, lowerTier, type QualityTier } from '../lib/quality';
import { exposeDebug } from '../lib/urlFlags';
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
    useEffect(() => exposeDebug({ journey, renderInfo: () => ({ ...gl.info.render, ...gl.info.memory }) }), [gl]);
    return null;
}

interface PerformanceWatchProps {
    onDecline: () => void;
    onIncline: () => void;
    /** Called once the quality has flip-flopped `flipflops` times. */
    onFallback: () => void;
    flipflops: number;
}

const SAMPLE_MS = 250;
const SAMPLES = 10;
const LOWER_FPS = 45;
const UPPER_FPS = 57;

/**
 * Small stand-in for drei's PerformanceMonitor: averages the frame rate over
 * 250 ms windows and, every ten windows, asks for lower quality when ≥ 75 % of
 * them were slow, or higher quality when ≥ 75 % were smooth. Measuring starts
 * once the garden is ready, so loading hitches are ignored.
 */
function PerformanceWatch({ onDecline, onIncline, onFallback, flipflops }: PerformanceWatchProps) {
    const state = useRef({ frames: 0, elapsed: 0, samples: [] as number[], last: 0 as -1 | 0 | 1, flips: 0, done: false });
    useFrame((_, delta) => {
        const s = state.current;
        if (s.done || sceneStatus.get().phase !== 'ready' || document.hidden || delta > 0.5) return;
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
        if (s.flips >= flipflops) {
            s.done = true;
            onFallback();
        } else if (direction < 0) {
            onDecline();
        } else {
            onIncline();
        }
    });
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
        sceneStatus.set({ phase: 'loading', progress: 0 });
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
            <PerformanceWatch
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
