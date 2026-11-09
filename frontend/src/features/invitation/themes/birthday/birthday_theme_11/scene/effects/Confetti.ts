import * as THREE from 'three';

const COLORS = ['#ff8fb7', '#78d5f4', '#ffca55', '#93dcae', '#b49cff', '#ffffff', '#f05b78'].map((c) => new THREE.Color(c));

interface Particle {
    life: number;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Vector3;
    spin: THREE.Vector3;
    landed: boolean;
    ground: number;
}

export interface BurstOptions {
    amount?: number;
    spread?: number;
    up?: number;
    groundY?: number;
}

/** Pooled instanced confetti that bursts, flutters down, lands on the ground and fades. */
export class Confetti {
    private mesh: THREE.InstancedMesh;
    private particles: Particle[];
    private cursor = 0;
    private active = 0;
    private dummy = new THREE.Object3D();

    constructor(
        scene: THREE.Object3D,
        private count = 400,
        private groundY = 0.06,
    ) {
        this.mesh = new THREE.InstancedMesh(
            new THREE.PlaneGeometry(0.16, 0.26),
            new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.55 }),
            count,
        );
        this.mesh.frustumCulled = false;
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.particles = Array.from({ length: count }, (_, i) => {
            this.mesh.setColorAt(i, COLORS[i % COLORS.length]);
            return {
                life: 0,
                pos: new THREE.Vector3(),
                vel: new THREE.Vector3(),
                rot: new THREE.Vector3(),
                spin: new THREE.Vector3(),
                landed: false,
                ground: groundY,
            };
        });
        this.hideAll();
        scene.add(this.mesh);
    }

    private hideAll() {
        this.dummy.scale.setScalar(0);
        this.dummy.updateMatrix();
        for (let i = 0; i < this.count; i++) this.mesh.setMatrixAt(i, this.dummy.matrix);
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    burst(origin: THREE.Vector3, { amount = 140, spread = 7, up = 9, groundY }: BurstOptions = {}) {
        const n = Math.min(amount, this.count);
        for (let k = 0; k < n; k++) {
            const p = this.particles[this.cursor];
            this.cursor = (this.cursor + 1) % this.count;
            p.life = 3.2 + Math.random() * 2;
            p.landed = false;
            p.ground = groundY ?? this.groundY;
            p.pos.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.5, (Math.random() - 0.5) * 0.8));
            p.vel.set((Math.random() - 0.5) * spread, up * (0.55 + Math.random() * 0.6), (Math.random() - 0.5) * spread);
            p.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
            p.spin.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
        }
        this.active = this.count;
    }

    update(t: number, dt: number) {
        if (!this.active) return;
        let alive = 0;
        const drag = Math.exp(-1.4 * dt);
        for (let i = 0; i < this.count; i++) {
            const p = this.particles[i];
            if (p.life <= 0) continue;
            p.life -= dt;
            if (!p.landed) {
                p.vel.y -= 6.5 * dt;
                p.vel.multiplyScalar(drag);
                p.vel.y = Math.max(p.vel.y, -3.2); // paper flutters, it doesn't plummet
                p.pos.addScaledVector(p.vel, dt);
                p.pos.x += Math.sin(t * 3 + i) * dt * 0.6;
                p.rot.addScaledVector(p.spin, dt);
                if (p.pos.y <= p.ground) {
                    p.pos.y = p.ground + (i % 7) * 0.002;
                    p.landed = true;
                    p.rot.set(-Math.PI / 2, 0, p.rot.z);
                    p.life = Math.min(p.life, 2.5);
                }
            }
            this.dummy.position.copy(p.pos);
            this.dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
            this.dummy.scale.setScalar(p.life > 0 ? Math.min(1, p.life * 1.5) : 0);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            if (p.life > 0) alive++;
        }
        this.mesh.instanceMatrix.needsUpdate = true;
        this.active = alive;
    }

    clear() {
        this.particles.forEach((p) => (p.life = 0));
        this.active = 0;
        this.hideAll();
    }
}
