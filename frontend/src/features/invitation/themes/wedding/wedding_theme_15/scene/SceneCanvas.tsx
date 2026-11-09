import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { getApp, setApp, useApp } from '../lib/store';
import { resetHoverCursor } from './interaction';
import { disposeTextures } from './textures';
import { COVER_KEY, FOV } from './waypoints';
import { World } from './World';

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error: unknown) {
        console.error('[scene] WebGL scene failed, switching to the 2D fallback', error);
        this.props.onError();
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}

/** Flags the scene as ready once real frames are being drawn. */
function ReadySignal() {
    const frames = useRef(0);
    useFrame(() => {
        frames.current++;
        if (frames.current === 3 && getApp().sceneStatus === 'loading') setApp({ sceneStatus: 'ready' });
    });
    return null;
}

/** Mirrors photo texture loading (three's default loading manager) into the app store. */
function ProgressBridge() {
    useEffect(() => {
        const m = THREE.DefaultLoadingManager;
        const prev = { onProgress: m.onProgress, onLoad: m.onLoad };
        m.onProgress = (_url, loaded, total) => setApp({ loadProgress: total ? (loaded / total) * 100 : 100 });
        m.onLoad = () => setApp({ loadProgress: 100 });
        return () => {
            m.onProgress = prev.onProgress;
            m.onLoad = prev.onLoad;
        };
    }, []);
    return null;
}

/**
 * Frame-rate watchdog (stands in for drei's PerformanceMonitor): averages ~2.5 s windows after
 * a warm-up and reports a decline when the scene cannot keep 45 fps, a few times at most.
 */
function PerfMonitor({ onDecline }: { onDecline: () => void }) {
    const acc = useRef({ frames: 0, time: 0, warm: 0, declines: 0 });
    useFrame((_, dt) => {
        const a = acc.current;
        // Long gaps (hidden tab, debugger) say nothing about rendering speed.
        if (a.declines >= 4 || dt > 0.5) return;
        if (a.warm < 3) {
            a.warm += dt;
            return;
        }
        a.frames++;
        a.time += dt;
        if (a.time < 2.5) return;
        const fps = a.frames / a.time;
        a.frames = 0;
        a.time = 0;
        if (fps < 45) {
            a.declines++;
            a.warm = 1.5;
            onDecline();
        }
    });
    return null;
}

/** Bloom (high tier) with three's own post-processing passes; takes over rendering while mounted. */
function PostFX({ msaa }: { msaa: boolean }) {
    const gl = useThree((s) => s.gl);
    const scene = useThree((s) => s.scene);
    const camera = useThree((s) => s.camera);
    const size = useThree((s) => s.size);
    const dpr = useThree((s) => s.viewport.dpr);
    const composer = useMemo(() => {
        const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: msaa ? 4 : 0 });
        const c = new EffectComposer(gl, target);
        c.addPass(new RenderPass(scene, camera));
        c.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.62, 0.82));
        c.addPass(new OutputPass());
        return c;
    }, [gl, scene, camera, msaa]);
    useEffect(() => {
        composer.setPixelRatio(dpr);
        composer.setSize(size.width, size.height);
    }, [composer, size.width, size.height, dpr]);
    useEffect(
        () => () => {
            composer.passes.forEach((p) => p.dispose());
            composer.dispose();
        },
        [composer],
    );
    useFrame((_, dt) => composer.render(dt), 1);
    return null;
}

export default function SceneCanvas({ eventSource }: { eventSource: HTMLElement }) {
    const quality = useApp((s) => s.quality);
    const effects = useApp((s) => s.effects);
    const cap = quality === 'high' ? 1.75 : quality === 'medium' ? 1.5 : 1.1;
    const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, cap));
    const portrait = window.innerWidth / window.innerHeight < 0.85;

    useEffect(
        () => () => {
            disposeTextures();
            resetHoverCursor();
        },
        [],
    );

    return (
        <div className="wt15-scene-canvas" aria-hidden="true">
            <CanvasBoundary onError={() => setApp({ sceneStatus: 'failed' })}>
                <Canvas
                    dpr={dpr}
                    eventSource={eventSource}
                    eventPrefix="client"
                    camera={{ fov: portrait ? FOV.mobile : FOV.desktop, near: 0.1, far: 420, position: COVER_KEY.pos }}
                    gl={{
                        antialias: true,
                        alpha: false,
                        stencil: false,
                        powerPreference: 'high-performance',
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.12,
                    }}
                    onCreated={({ gl }) => {
                        // `?debug` exposes the renderer for profiling (draw calls, triangles) from the console.
                        if (new URLSearchParams(location.search).has('debug'))
                            (window as unknown as { __wt15Renderer: THREE.WebGLRenderer }).__wt15Renderer = gl;
                        gl.domElement.addEventListener('webglcontextlost', (e) => {
                            e.preventDefault();
                            setApp({ sceneStatus: 'failed' });
                        });
                    }}
                >
                    <PerfMonitor
                        onDecline={() => {
                            if (getApp().effects) setApp({ effects: false });
                            else setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)));
                        }}
                    />
                    <Suspense fallback={null}>
                        <World quality={quality} />
                    </Suspense>
                    {effects && <PostFX msaa={quality === 'high'} />}
                    <ReadySignal />
                    <ProgressBridge />
                </Canvas>
            </CanvasBoundary>
        </div>
    );
}
