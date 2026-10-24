import * as THREE from 'three';
import { STATIONS } from './stations.js';
import { clamp, easeInOutCubic, lerp } from '../utils/helpers.js';

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

/*
 * Scroll-driven camera.
 * Each station has an "enter" and an "exit" pose. While a section is on screen the camera
 * drifts slowly from enter → exit (so every scroll still moves something); between sections
 * it swoops (eased, lifted) from one station's exit to the next station's enter.
 * Poses are adapted to the viewport: the subject is framed beside the HTML panel on wide
 * screens and above it on narrow screens, and the camera backs off until the subject fits.
 */
export class CameraController {
  constructor(camera, { reducedMotion = false, parallax = false } = {}) {
    this.camera = camera;
    this.reducedMotion = reducedMotion;
    this.parallax = parallax;
    this.frames = [];
    this.current = { position: camera.position.clone(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0 };
    this.desired = { position: new THREE.Vector3(), target: new THREE.Vector3(), shiftX: 0, shiftY: 0, story: 0 };
    this.intro = { amount: 0 };
    this.pointer = new THREE.Vector2();
    this.pointerSmoothed = new THREE.Vector2();
    this.story = 0;
    this.viewport = { width: 1, height: 1 };
    this.snapNext = true;

    if (parallax) {
      window.addEventListener(
        'pointermove',
        (e) => {
          this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        },
        { passive: true },
      );
    }
  }

  /**
   * @param {{ width:number, height:number, narrow:boolean }} viewport
   * @param {{ enter:number, exit:number }[]} scrollMarks scroll positions per station
   * @param {{ shiftX:number, shiftY:number, availX:number, availY:number }[]} [framings] free screen area per station
   */
  setLayout(viewport, scrollMarks, framings = []) {
    this.viewport = viewport;
    const aspect = viewport.width / viewport.height;
    this.camera.fov = aspect >= 1 ? 40 : clamp(40 + (1 - aspect) * 34, 40, 58);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.frames = [];
    STATIONS.forEach((station, i) => {
      const marks = scrollMarks[i];
      const framing = framings[i] ?? this.#defaultFraming(station, viewport);
      this.frames.push({ scroll: marks.enter, station: i, type: 'enter', pose: this.#adapt(station, station.pose, viewport, framing) });
      this.frames.push({ scroll: Math.max(marks.enter, marks.exit), station: i, type: 'exit', pose: this.#adapt(station, station.exit, viewport, framing) });
    });
  }

  #defaultFraming(station, viewport) {
    const shiftX = viewport.narrow ? 0 : station.side === 'left' ? 0.21 : station.side === 'right' ? -0.21 : 0;
    const shiftY = viewport.narrow ? -0.2 : station.side === 'bottom' ? -0.14 : 0;
    return { shiftX, shiftY, availX: 1 - 2 * Math.abs(shiftX), availY: 1 - 2 * Math.abs(shiftY) };
  }

  #adapt(station, pose, viewport, framing) {
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
    return {
      position: target.clone().addScaledVector(dir, distance),
      target,
      shiftX: framing.shiftX,
      shiftY: framing.shiftY,
    };
  }

  /** Camera pose for a scroll position (before damping). */
  sample(scrollY) {
    const frames = this.frames;
    const out = this.desired;
    if (!frames.length) return out;
    if (scrollY <= frames[0].scroll) return this.#write(frames[0].pose, frames[0].pose, 0, 0, 0);
    for (let k = 0; k < frames.length - 1; k++) {
      const a = frames[k];
      const b = frames[k + 1];
      if (scrollY > b.scroll && k < frames.length - 2) continue;
      const span = b.scroll - a.scroll;
      const f = span > 0 ? clamp((scrollY - a.scroll) / span) : 1;
      if (a.type === 'enter') {
        // Dwell: slow drift between the two poses of the same station.
        return this.#write(a.pose, b.pose, f, 0, a.station);
      }
      // Travel to the next station.
      if (this.reducedMotion) {
        const pose = f < 0.5 ? a.pose : b.pose;
        return this.#write(pose, pose, 0, 0, f < 0.5 ? a.station : b.station);
      }
      const e = easeInOutCubic(f);
      const lift = Math.min(12, a.pose.position.distanceTo(b.pose.position) * 0.22);
      return this.#write(a.pose, b.pose, e, Math.sin(Math.PI * e) * lift, a.station + e);
    }
    const last = frames[frames.length - 1];
    return this.#write(last.pose, last.pose, 0, 0, last.station);
  }

  #write(a, b, f, lift, story) {
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

  update(scrollY, dt) {
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
    const lookAt = c.target.clone();

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
}
