import * as THREE from 'three';
import { Materials } from './Materials.js';
import { createAdaptiveQuality } from './quality.js';

/*
 * Owns the renderer, scene, camera and the single animation loop.
 * Also handles pointer picking for interactive 3D objects, resizing, pausing while the
 * tab is hidden and clean disposal of every GPU resource.
 */
export class SceneManager {
  constructor(canvas, { quality, reducedMotion = false, onContextLost } = {}) {
    this.canvas = canvas;
    this.quality = quality;
    this.reducedMotion = reducedMotion;
    this.onContextLost = onContextLost;
    this.listeners = [];
    this.frameHooks = new Set();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias, powerPreference: 'high-performance', alpha: false });
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor('#e8f6fb');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 900);
    this.materials = new Materials(quality);
    this.adaptive = createAdaptiveQuality(this.renderer, quality, { disableShadows: () => this.disableShadows() });

    this.raycaster = new THREE.Raycaster();
    this.pointerNdc = new THREE.Vector2();
    this.pointerInside = false;
    this.pickPending = false;
    this.hovered = null;
    this.down = null;

    this.lastTime = 0;
    this.elapsed = 0;
    this.running = false;
    this.frame = this.frame.bind(this);

    this.#listen(canvas, 'pointermove', (e) => this.#onPointerMove(e));
    this.#listen(canvas, 'pointerleave', () => this.#setHover(null));
    this.#listen(canvas, 'pointerdown', (e) => (this.down = { x: e.clientX, y: e.clientY, time: performance.now() }));
    this.#listen(canvas, 'pointerup', (e) => this.#onPointerUp(e));
    this.#listen(canvas, 'pointercancel', () => (this.down = null));
    this.#listen(document, 'visibilitychange', () => (document.hidden ? this.stop() : this.start()));
    this.#listen(canvas, 'webglcontextlost', (e) => {
      e.preventDefault();
      this.stop();
      this.onContextLost?.();
    });
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.documentElement);
  }

  #listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  setWorld(world) {
    this.world = world;
  }

  setCameraController(controller) {
    this.cameraController = controller;
  }

  /** Called every frame with (t, dt, state). Returns an unsubscribe function. */
  onFrame(hook) {
    this.frameHooks.add(hook);
    return () => this.frameHooks.delete(hook);
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
    this.onResize?.({ width, height });
  }

  start() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.lastTime = performance.now();
    this.renderer.setAnimationLoop(this.frame);
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  frame(now) {
    // Cap long frames (tab switches, hitches) but keep slow devices moving at real speed.
    const dt = Math.min(0.1, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.elapsed += dt;
    const t = this.elapsed;
    const state = this.cameraController ? this.cameraController.update(window.scrollY, dt) : { story: 0, focus: new THREE.Vector3() };
    if (this.pickPending) {
      this.pickPending = false;
      this.#setHover(this.pointerInside ? this.#pick() : null);
    }
    this.world?.update(t, dt, { ...state, camera: this.camera });
    for (const hook of this.frameHooks) hook(t, dt, state);
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
      if (object.isLight) object.castShadow = false;
      const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      materials.forEach((m) => (m.needsUpdate = true));
    });
  }

  /* ---------------------------------------------------------------- picking */

  #updatePointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNdc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  }

  #onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    this.#updatePointer(e);
    this.pointerInside = true;
    this.pickPending = true;
  }

  #onPointerUp(e) {
    const down = this.down;
    this.down = null;
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved > 8 || performance.now() - down.time > 700) return;
    this.#updatePointer(e);
    const entry = this.#pick();
    if (entry?.onClick) entry.onClick();
  }

  #pick() {
    if (!this.world?.interactives?.length) return null;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const objects = this.world.interactives.filter((e) => e.enabled && e.object.visible).map((e) => e.object);
    const hits = this.raycaster.intersectObjects(objects, true);
    for (const hit of hits) {
      let node = hit.object;
      while (node && !node.userData?.interactive) node = node.parent;
      const entry = node?.userData.interactive;
      if (entry?.enabled) return entry;
    }
    return null;
  }

  #setHover(entry) {
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
    const disposed = new Set();
    const free = (resource) => {
      if (resource && !disposed.has(resource)) {
        disposed.add(resource);
        resource.dispose();
      }
    };
    this.scene.traverse((object) => {
      free(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) if (value?.isTexture) free(value);
        if (material.uniforms) for (const u of Object.values(material.uniforms)) if (u.value?.isTexture) free(u.value);
        free(material);
      }
    });
    this.materials.dispose();
    this.renderer.dispose();
  }
}
