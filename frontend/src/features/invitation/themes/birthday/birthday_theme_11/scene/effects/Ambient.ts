import * as THREE from 'three';
import { seededRandom } from '../../lib/helpers';
import { softDotTexture } from '../textures';

interface Bubble {
    x: number;
    y: number;
    z: number;
    speed: number;
    size: number;
    phase: number;
}

/** Soap bubbles drifting up around the island. */
export class Bubbles {
    private mesh: THREE.InstancedMesh;
    private items: Bubble[];
    private rand = seededRandom(42);
    private dummy = new THREE.Object3D();

    constructor(
        scene: THREE.Object3D,
        private count = 60,
        physical = true,
        private radius = 48,
    ) {
        const material = physical
            ? new THREE.MeshPhysicalMaterial({
                  color: '#ffffff',
                  transparent: true,
                  opacity: 0.34,
                  roughness: 0.05,
                  metalness: 0,
                  iridescence: 1,
                  iridescenceIOR: 1.3,
                  clearcoat: 1,
                  depthWrite: false,
              })
            : new THREE.MeshStandardMaterial({
                  color: '#eaf8ff',
                  transparent: true,
                  opacity: 0.38,
                  roughness: 0.1,
                  emissive: '#cfefff',
                  emissiveIntensity: 0.25,
                  depthWrite: false,
              });
        this.mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), material, count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = 5;
        this.items = Array.from({ length: count }, () => this.spawn(true));
        scene.add(this.mesh);
    }

    private spawn(initial = false): Bubble {
        const rand = this.rand;
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * this.radius;
        return {
            x: Math.cos(a) * r,
            z: Math.sin(a) * r,
            y: initial ? rand() * 20 : -1 - rand() * 3,
            speed: 0.35 + rand() * 0.6,
            size: 0.12 + rand() * 0.38,
            phase: rand() * 10,
        };
    }

    update(t: number, dt: number, reducedMotion: boolean) {
        const motion = reducedMotion ? 0 : 1;
        for (let i = 0; i < this.count; i++) {
            const b = this.items[i];
            b.y += b.speed * dt * motion;
            if (b.y > 24) this.items[i] = this.spawn();
            const wobble = Math.sin(t * 1.3 + b.phase) * 0.4 * motion;
            this.dummy.position.set(b.x + wobble, b.y, b.z + Math.cos(t + b.phase) * 0.3 * motion);
            const grow = Math.min(1, (b.y + 1) / 1.5);
            this.dummy.scale.setScalar(b.size * Math.max(0, grow));
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }
}

/** Twinkling sparkle points floating above the island. */
export class Sparkles {
    private material: THREE.ShaderMaterial;

    constructor(scene: THREE.Object3D, count = 220, pixelRatio = 1) {
        const rand = seededRandom(7);
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const palette = ['#ffffff', '#fff1a8', '#ffd1e3', '#c9f1ff'].map((c) => new THREE.Color(c));
        for (let i = 0; i < count; i++) {
            const a = rand() * Math.PI * 2;
            const r = 8 + rand() * 55;
            positions[i * 3] = Math.cos(a) * r;
            positions[i * 3 + 1] = 2 + rand() * 26;
            positions[i * 3 + 2] = Math.sin(a) * r;
            const c = palette[i % palette.length];
            colors.set([c.r, c.g, c.b], i * 3);
            phases[i] = rand() * 20;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        this.material = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uMap: { value: softDotTexture() }, uStrength: { value: 1 } },
            vertexShader: /* glsl */ `
                attribute float phase;
                attribute vec3 color;
                uniform float uTime;
                uniform float uPixelRatio;
                varying float vTwinkle;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vTwinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 1.7 + phase), 3.0);
                    vec3 p = position + vec3(0.0, sin(uTime * 0.5 + phase) * 0.4, 0.0);
                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_PointSize = (2.0 + 3.0 * vTwinkle) * uPixelRatio * (60.0 / -mv.z);
                    gl_Position = projectionMatrix * mv;
                }`,
            fragmentShader: /* glsl */ `
                uniform sampler2D uMap;
                uniform float uStrength;
                varying float vTwinkle;
                varying vec3 vColor;
                void main() {
                    vec4 tex = texture2D(uMap, gl_PointCoord);
                    gl_FragColor = vec4(vColor, tex.a * vTwinkle * uStrength);
                    #include <colorspace_fragment>
                }`,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geometry, this.material);
        points.frustumCulled = false;
        scene.add(points);
    }

    setPixelRatio(ratio: number) {
        this.material.uniforms.uPixelRatio.value = ratio;
    }

    update(t: number, reducedMotion: boolean) {
        if (!reducedMotion) this.material.uniforms.uTime.value = t;
    }
}
