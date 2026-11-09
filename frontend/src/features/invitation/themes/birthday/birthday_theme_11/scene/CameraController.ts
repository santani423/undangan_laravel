import * as THREE from 'three';
import { clamp, easeInOutCubic, lerp } from '../lib/helpers';
import { STATIONS, type Pose, type Station, type Vec3 } from './stations';

const v3 = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

export interface Viewport {
    width: number;
    height: number;
    narrow: boolean;
}

export interface ScrollMarks {
    enter: number;
    exit: number;
}

/** Part of the screen left free by a section's panel (view shift -0.5…0.5 and available fraction). */
export interface Framing {
    shiftX: number;
    shiftY: number;
    availX: number;
    availY: number;
}

interface AdaptedPose {
    position: THREE.Vector3;
    target: THREE.Vector3;
    shiftX: number;
    shiftY: number;
}

interface Frame {
    scroll: number;
    station: number;
    type: 'enter' | 'exit';
    pose: AdaptedPose;
}

/*
 * Scroll-driven camera.
 * Each station has an "enter" and an "exit" pose. While a section is on screen the camera
 * drifts slowly from enter → exit (so every scroll still moves something); between sections
 * it swoops (eased, lifted) from one station's exit to the next visible station's enter —
 * stations whose section is switched off are flown past.
 * Poses adapt to the viewport: the subject is framed beside the HTML panel on wide screens
 * and above it on narrow screens, and the camera backs off until the subject fits.
 */
export class CameraController {
    /** Opening fly-in amount (1 = high above the island, 0 = at the gate); tweened by GSAP. */
    readonly intro = { amount: 0 };
    private frames: Frame[] = [];
    private current: AdaptedPose;
    private desired = { position: new THREE.Vector3(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0, story: 0 };
    private pointer = new THREE.Vector2();
    private pointerSmoothed = new THREE.Vector2();
    private story = 0;
    private viewport: Viewport = { width: 1, height: 1, narrow: false };
    private snapNext = true;
    private lookAt = new THREE.Vector3();
    private removePointer: (() => void) | null = null;

    constructor(
        private camera: THREE.PerspectiveCamera,
        private reducedMotion = false,
        private parallax = false,
    ) {
        this.current = { position: camera.position.clone(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0 };
        if (parallax) {
            const onMove = (e: PointerEvent) => this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
            window.addEventListener('pointermove', onMove, { passive: true });
            this.removePointer = () => window.removeEventListener('pointermove', onMove);
        }
    }

    /**
     * @param stations station indices of the visible sections, in scroll order
     * @param scrollMarks scroll positions where the camera arrives at / starts leaving each of them
     * @param framings free screen area per visible section
     */
    setLayout(viewport: Viewport, stations: number[], scrollMarks: ScrollMarks[], framings: Framing[]) {
        this.viewport = viewport;
        const aspect = viewport.width / viewport.height;
        this.camera.fov = aspect >= 1 ? 40 : clamp(40 + (1 - aspect) * 34, 40, 58);
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        this.frames = [];
        stations.forEach((index, i) => {
            const station = STATIONS[index];
            const marks = scrollMarks[i];
            const framing = framings[i] ?? this.defaultFraming(station, viewport);
            this.frames.push({ scroll: marks.enter, station: index, type: 'enter', pose: this.adapt(station, station.pose, viewport, framing) });
            this.frames.push({
                scroll: Math.max(marks.enter, marks.exit),
                station: index,
                type: 'exit',
                pose: this.adapt(station, station.exit, viewport, framing),
            });
        });
    }

    private defaultFraming(station: Station, viewport: Viewport): Framing {
        const shiftX = viewport.narrow ? 0 : station.side === 'left' ? 0.21 : station.side === 'right' ? -0.21 : 0;
        const shiftY = viewport.narrow ? -0.2 : station.side === 'bottom' ? -0.14 : 0;
        return { shiftX, shiftY, availX: 1 - 2 * Math.abs(shiftX), availY: 1 - 2 * Math.abs(shiftY) };
    }

    private adapt(station: Station, pose: Pose, viewport: Viewport, framing: Framing): AdaptedPose {
        const target = v3(pose.target);
        const position = v3(pose.position);
        const dir = position.clone().sub(target);
        const baseDistance = dir.length();
        dir.normalize();
        const aspect = viewport.width / viewport.height;
        const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
        const tanH = tanV * aspect;
        // Back the camera off until the subject fits the free part of the screen.
        const fitW = station.fit.width / (2 * tanH * Math.max(0.2, framing.availX));
        const fitH = station.fit.height / (2 * tanV * Math.max(0.2, framing.availY));
        const distance = Math.max(baseDistance, fitW, fitH);
        return { position: target.clone().addScaledVector(dir, distance), target, shiftX: framing.shiftX, shiftY: framing.shiftY };
    }

    /** Camera pose for a scroll position (before damping). */
    private sample(scrollY: number) {
        const frames = this.frames;
        if (!frames.length) return this.desired;
        if (scrollY <= frames[0].scroll) return this.write(frames[0].pose, frames[0].pose, 0, 0, frames[0].station);
        for (let k = 0; k < frames.length - 1; k++) {
            const a = frames[k];
            const b = frames[k + 1];
            if (scrollY > b.scroll && k < frames.length - 2) continue;
            const span = b.scroll - a.scroll;
            const f = span > 0 ? clamp((scrollY - a.scroll) / span) : 1;
            // Dwell: slow drift between the two poses of the same station.
            if (a.type === 'enter') return this.write(a.pose, b.pose, f, 0, a.station);
            // Travel to the next station.
            if (this.reducedMotion) {
                const pose = f < 0.5 ? a.pose : b.pose;
                return this.write(pose, pose, 0, 0, f < 0.5 ? a.station : b.station);
            }
            const e = easeInOutCubic(f);
            const lift = Math.min(12, a.pose.position.distanceTo(b.pose.position) * 0.22);
            return this.write(a.pose, b.pose, e, Math.sin(Math.PI * e) * lift, lerp(a.station, b.station, e));
        }
        const last = frames[frames.length - 1];
        return this.write(last.pose, last.pose, 0, 0, last.station);
    }

    private write(a: AdaptedPose, b: AdaptedPose, f: number, lift: number, story: number) {
        const out = this.desired;
        out.position.lerpVectors(a.position, b.position, f);
        out.position.y += lift;
        out.target.lerpVectors(a.target, b.target, f);
        out.shiftX = lerp(a.shiftX, b.shiftX, f);
        out.shiftY = lerp(a.shiftY, b.shiftY, f);
        out.story = story;
        return out;
    }

    /** Jump straight to the scroll pose on the next update (no easing). */
    snap() {
        this.snapNext = true;
    }

    update(scrollY: number, dt: number) {
        const desired = this.sample(scrollY);
        const c = this.current;
        const instant = this.snapNext || this.reducedMotion;
        const k = instant ? 1 : 1 - Math.exp(-4.2 * dt);
        c.position.lerp(desired.position, k);
        c.target.lerp(desired.target, k);
        c.shiftX += (desired.shiftX - c.shiftX) * k;
        c.shiftY += (desired.shiftY - c.shiftY) * k;
        this.story = instant ? desired.story : this.story + (desired.story - this.story) * k;
        this.snapNext = false;

        const cam = this.camera;
        cam.position.copy(c.position);
        const lookAt = this.lookAt.copy(c.target);

        // Opening fly-in: start high above the island and swoop down to the gate.
        const a = this.intro.amount;
        if (a > 0) {
            cam.position.add(new THREE.Vector3(-14 * a, 42 * a, 34 * a));
            lookAt.add(new THREE.Vector3(0, -7 * a, -26 * a));
        }

        if (this.parallax && !this.reducedMotion) {
            this.pointerSmoothed.lerp(this.pointer, 1 - Math.exp(-3 * dt));
            const forward = lookAt.clone().sub(cam.position).normalize();
            const right = new THREE.Vector3().crossVectors(forward, cam.up).normalize();
            cam.position.addScaledVector(right, this.pointerSmoothed.x * 0.7).addScaledVector(cam.up, -this.pointerSmoothed.y * 0.4);
        }
        cam.lookAt(lookAt);

        const { width, height } = this.viewport;
        cam.setViewOffset(width, height, -c.shiftX * width, -c.shiftY * height, width, height);
        return { story: this.story, focus: c.target };
    }

    dispose() {
        this.removePointer?.();
        this.removePointer = null;
    }
}
