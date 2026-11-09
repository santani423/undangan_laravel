import * as THREE from 'three';

const PALETTES = [
    ['#ff8fb7', '#ffffff'],
    ['#78d5f4', '#fff4c2'],
    ['#ffca55', '#ff8fb7'],
    ['#b49cff', '#78d5f4'],
    ['#93dcae', '#ffffff'],
];

/** Soft additive firework bursts drawn as GPU points. Only launches while `active`. */
export class Fireworks {
    active = false;
    private max: number;
    private timer = 0.4;
    private cursor = 0;
    private alive = 0;
    private positions: Float32Array;
    private colors: Float32Array;
    private alphas: Float32Array;
    private sizes: Float32Array;
    private velocities: Float32Array;
    private life: Float32Array;
    private maxLife: Float32Array;
    private material: THREE.ShaderMaterial;
    private points: THREE.Points;

    constructor(
        scene: THREE.Object3D,
        private perBurst = 90,
        bursts = 6,
        pixelRatio = 1,
        private onBurst?: () => void,
    ) {
        this.max = perBurst * bursts;
        const geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.max * 3);
        this.colors = new Float32Array(this.max * 3);
        this.alphas = new Float32Array(this.max);
        this.sizes = new Float32Array(this.max);
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.velocities = new Float32Array(this.max * 3);
        this.life = new Float32Array(this.max);
        this.maxLife = new Float32Array(this.max);

        this.material = new THREE.ShaderMaterial({
            uniforms: { uPixelRatio: { value: pixelRatio } },
            vertexShader: /* glsl */ `
                attribute float alpha;
                attribute float size;
                attribute vec3 color;
                varying float vAlpha;
                varying vec3 vColor;
                uniform float uPixelRatio;
                void main() {
                    vAlpha = alpha;
                    vColor = color;
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * uPixelRatio * (220.0 / -mv.z);
                    gl_Position = projectionMatrix * mv;
                }`,
            fragmentShader: /* glsl */ `
                varying float vAlpha;
                varying vec3 vColor;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    float glow = smoothstep(0.5, 0.0, d);
                    gl_FragColor = vec4(vColor * (0.6 + glow), glow * vAlpha);
                    #include <colorspace_fragment>
                }`,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        this.points = new THREE.Points(geometry, this.material);
        this.points.frustumCulled = false;
        scene.add(this.points);
    }

    setPixelRatio(ratio: number) {
        this.material.uniforms.uPixelRatio.value = ratio;
    }

    burst(center: THREE.Vector3) {
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)].map((c) => new THREE.Color(c));
        const speed = 5 + Math.random() * 2.5;
        for (let k = 0; k < this.perBurst; k++) {
            const i = this.cursor;
            this.cursor = (this.cursor + 1) % this.max;
            // Even-ish distribution on a sphere.
            const u = Math.random() * 2 - 1;
            const theta = Math.random() * Math.PI * 2;
            const r = Math.sqrt(1 - u * u);
            const s = speed * (0.85 + Math.random() * 0.3);
            this.velocities[i * 3] = r * Math.cos(theta) * s;
            this.velocities[i * 3 + 1] = u * s;
            this.velocities[i * 3 + 2] = r * Math.sin(theta) * s;
            this.positions[i * 3] = center.x;
            this.positions[i * 3 + 1] = center.y;
            this.positions[i * 3 + 2] = center.z;
            const c = palette[k % palette.length];
            this.colors[i * 3] = c.r;
            this.colors[i * 3 + 1] = c.g;
            this.colors[i * 3 + 2] = c.b;
            this.maxLife[i] = this.life[i] = 1.5 + Math.random() * 0.8;
            this.sizes[i] = 1.4 + Math.random() * 1.6;
        }
        this.points.geometry.attributes.color.needsUpdate = true;
        this.points.geometry.attributes.size.needsUpdate = true;
        this.alive = this.max;
        this.onBurst?.();
    }

    /**
     * @param center point the camera is looking at; bursts appear above and behind it
     * @param away horizontal direction pointing away from the camera
     */
    update(t: number, dt: number, center: THREE.Vector3, away: THREE.Vector3) {
        if (this.active) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.timer = 0.8 + Math.random() * 0.9;
                const side = new THREE.Vector3(-away.z, 0, away.x);
                const p = center
                    .clone()
                    .addScaledVector(side, (Math.random() - 0.5) * 26)
                    .addScaledVector(away, 10 + Math.random() * 12);
                p.y = center.y + 6 + Math.random() * 7;
                this.burst(p);
            }
        }
        if (!this.alive) return;
        let alive = 0;
        const drag = Math.exp(-1.5 * dt);
        for (let i = 0; i < this.max; i++) {
            if (this.life[i] <= 0) {
                this.alphas[i] = 0;
                continue;
            }
            this.life[i] -= dt;
            this.velocities[i * 3 + 1] -= 2.4 * dt;
            for (let a = 0; a < 3; a++) {
                this.velocities[i * 3 + a] *= drag;
                this.positions[i * 3 + a] += this.velocities[i * 3 + a] * dt;
            }
            const f = Math.max(0, this.life[i] / this.maxLife[i]);
            this.alphas[i] = f * f * (0.75 + 0.25 * Math.sin(t * 40 + i));
            if (this.life[i] > 0) alive++;
        }
        this.alive = alive;
        this.points.geometry.attributes.position.needsUpdate = true;
        this.points.geometry.attributes.alpha.needsUpdate = true;
    }

    clear() {
        this.life.fill(0);
        this.alphas.fill(0);
        this.points.geometry.attributes.alpha.needsUpdate = true;
        this.alive = 0;
    }
}
