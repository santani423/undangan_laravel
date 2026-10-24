import * as THREE from 'three';
import type { CameraController } from './CameraController';
import { Materials } from './Materials';
import { createAdaptiveQuality, type Quality } from './quality';
import type { Interactive, World } from './WorldBuilder';

/*
 * Owns the renderer, scene, camera and the single animation loop.
 * Also handles pointer picking for interactive 3D objects, resizing, pausing while the
 * tab is hidden and clean disposal of every GPU resource.
 */
export class SceneManager {
    readonly renderer: THREE.WebGLRenderer;
    readonly canvas: HTMLCanvasElement;
    readonly scene = new THREE.Scene();
    readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 900);
    readonly materials: Materials;
    readonly pixelRatio: number;
    world: World | null = null;
    cameraController: CameraController | null = null;

    private listeners: (() => void)[] = [];
    private adaptive: (dt: number) => void;
    private raycaster = new THREE.Raycaster();
    private pointerNdc = new THREE.Vector2();
    private pointerInside = false;
    private pickPending = false;
    private hovered: Interactive | null = null;
    private down: { x: number; y: number; time: number } | null = null;
    private lastTime = 0;
    private elapsed = 0;
    private running = false;
    private width = 0;
    private height = 0;
    private resizeObserver: ResizeObserver;
    private idleState = { story: 0, focus: new THREE.Vector3() };

    /** The canvas is created here and removed again on dispose, so a new world never inherits a lost context. */
    constructor(
        container: HTMLElement,
        quality: Quality,
        private onContextLost?: () => void,
    ) {
        const canvas = document.createElement('canvas');
        canvas.className = 'bt11-world__canvas';
        canvas.setAttribute('aria-hidden', 'true');
        container.appendChild(canvas);
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias, powerPreference: 'high-performance', alpha: false });
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.NeutralToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = quality.shadows;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.setClearColor('#e8f6fb');
        this.materials = new Materials(quality);
        this.adaptive = createAdaptiveQuality(this.renderer, quality, () => this.disableShadows());

        this.listen(canvas, 'pointermove', (e) => this.onPointerMove(e as PointerEvent));
        this.listen(canvas, 'pointerleave', () => this.setHover(null));
        this.listen(canvas, 'pointerdown', (e) => {
            const p = e as PointerEvent;
            this.down = { x: p.clientX, y: p.clientY, time: performance.now() };
        });
        this.listen(canvas, 'pointerup', (e) => this.onPointerUp(e as PointerEvent));
        this.listen(canvas, 'pointercancel', () => (this.down = null));
        this.listen(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.start()));
        this.listen(canvas, 'webglcontextlost', (e) => {
            e.preventDefault();
            this.stop();
            this.onContextLost?.();
        });
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(document.documentElement);
    }

    private listen(target: EventTarget, type: string, handler: (e: Event) => void) {
        target.addEventListener(type, handler);
        this.listeners.push(() => target.removeEventListener(type, handler));
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width === this.width && height === this.height) return;
        this.width = width;
        this.height = height;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    start() {
        if (this.running || document.hidden) return;
        this.running = true;
        this.lastTime = performance.now();
        this.renderer.setAnimationLoop((now) => this.frame(now));
    }

    stop() {
        this.running = false;
        this.renderer.setAnimationLoop(null);
    }

    private frame(now: number) {
        // Cap long frames (tab switches, hitches) but keep slow devices moving at real speed.
        const dt = Math.min(0.1, Math.max(0, (now - this.lastTime) / 1000));
        this.lastTime = now;
        this.elapsed += dt;
        const t = this.elapsed;
        const state = this.cameraController ? this.cameraController.update(window.scrollY, dt) : this.idleState;
        if (this.pickPending) {
            this.pickPending = false;
            this.setHover(this.pointerInside ? this.pick() : null);
        }
        this.world?.update(t, dt, { ...state, camera: this.camera });
        this.renderer.render(this.scene, this.camera);
        const before = this.renderer.getPixelRatio();
        this.adaptive(dt);
        const after = this.renderer.getPixelRatio();
        if (after !== before) this.world?.setPixelRatio(after);
    }

    /** Turns off real-time shadow maps (characters and props keep their soft blob shadows). */
    disableShadows() {
        this.renderer.shadowMap.enabled = false;
        this.scene.traverse((object) => {
            if ((object as THREE.Light).isLight) object.castShadow = false;
            const material = (object as THREE.Mesh).material;
            const list = Array.isArray(material) ? material : material ? [material] : [];
            list.forEach((m) => (m.needsUpdate = true));
        });
    }

    /* ---------------------------------------------------------------- picking */

    private updatePointer(e: PointerEvent) {
        const rect = this.canvas.getBoundingClientRect();
        this.pointerNdc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    }

    private onPointerMove(e: PointerEvent) {
        if (e.pointerType === 'touch') return;
        this.updatePointer(e);
        this.pointerInside = true;
        this.pickPending = true;
    }

    private onPointerUp(e: PointerEvent) {
        const down = this.down;
        this.down = null;
        if (!down) return;
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        if (moved > 8 || performance.now() - down.time > 700) return;
        this.updatePointer(e);
        this.pick()?.onClick?.();
    }

    private pick(): Interactive | null {
        const interactives = this.world?.interactives;
        if (!interactives?.length) return null;
        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        const objects = interactives.filter((e) => e.enabled && e.object.visible).map((e) => e.object);
        for (const hit of this.raycaster.intersectObjects(objects, true)) {
            let node: THREE.Object3D | null = hit.object;
            while (node && !node.userData.interactive) node = node.parent;
            const entry = node?.userData.interactive as Interactive | undefined;
            if (entry?.enabled) return entry;
        }
        return null;
    }

    private setHover(entry: Interactive | null) {
        if (entry === this.hovered) return;
        if (this.hovered) this.hovered.hovered = false;
        this.hovered = entry;
        if (entry) entry.hovered = true;
        this.canvas.style.cursor = entry ? 'pointer' : '';
        this.canvas.title = entry?.label ?? '';
    }

    /* ---------------------------------------------------------------- cleanup */

    dispose() {
        this.stop();
        this.resizeObserver.disconnect();
        this.listeners.forEach((off) => off());
        this.listeners = [];
        const disposed = new Set<{ dispose(): void }>();
        const free = (resource: { dispose(): void } | null | undefined) => {
            if (resource && !disposed.has(resource)) {
                disposed.add(resource);
                resource.dispose();
            }
        };
        this.scene.traverse((object) => {
            const mesh = object as THREE.Mesh;
            free(mesh.geometry);
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const material of materials) {
                if (!material) continue;
                for (const value of Object.values(material)) if ((value as THREE.Texture | null)?.isTexture) free(value as THREE.Texture);
                const uniforms = (material as THREE.ShaderMaterial).uniforms;
                if (uniforms)
                    for (const u of Object.values(uniforms)) if ((u.value as THREE.Texture | null)?.isTexture) free(u.value as THREE.Texture);
                free(material);
            }
        });
        this.materials.dispose();
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.canvas.remove();
    }
}
