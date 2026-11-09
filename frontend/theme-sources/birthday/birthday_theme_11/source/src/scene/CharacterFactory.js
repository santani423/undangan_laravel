import * as THREE from 'three';
import { PALETTE } from './Materials.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { blobShadowTexture, stripeTexture } from './textures.js';
import { mergeStatic } from './mergeStatic.js';
import { damp } from '../utils/helpers.js';

/*
 * Procedural tooth characters modelled on images/tooth-friend.svg and images/dr-smiley.svg:
 * a porcelain molar crown with two cusps, two roots as legs, stubby arms and a friendly face.
 * A character stands with its feet at y = 0 and faces +Z.
 */

const FOOT_OFFSET = 1.23; // distance from the crown centre down to the root tips
const geometryCache = new Map();
const cached = (key, build) => {
  if (!geometryCache.has(key)) geometryCache.set(key, build());
  return geometryCache.get(key);
};

// The crown is a deformed sphere; this mirrors the deformation so face parts sit on the surface.
const taperAt = (y) => 1 - Math.max(0, -y) * 0.18;
function crownSurfaceZ(x, y) {
  const taper = taperAt(y);
  const vx = x / taper;
  const vy = y / 0.86;
  return Math.sqrt(Math.max(0, 1 - vx * vx - vy * vy)) * 0.82 * taper;
}

function crownGeometry() {
  return cached('crown', () => {
    const g = new THREE.SphereGeometry(1, 56, 40);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i) * 0.86;
      let z = pos.getZ(i) * 0.82;
      if (y > 0.2) {
        // Molar cusps: a shallow valley across the top.
        const k = Math.min(1, (y - 0.2) / 0.66);
        y -= 0.22 * Math.exp(-(x * x) / 0.05) * k * k;
      }
      if (y < -0.3) y = -0.3 + (y + 0.3) * 0.65; // flatter base where the roots attach
      const taper = taperAt(y);
      x *= taper;
      z *= taper;
      pos.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  });
}

function rootGeometry() {
  return cached('root', () => {
    const pts = [new THREE.Vector2(0.001, 0.12), new THREE.Vector2(0.31, 0.12), new THREE.Vector2(0.3, -0.1)];
    pts.push(new THREE.Vector2(0.26, -0.35), new THREE.Vector2(0.215, -0.52));
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(Math.max(0.001, 0.215 * Math.cos(a)), -0.52 - 0.2 * Math.sin(a)));
    }
    return new THREE.LatheGeometry(pts, 24);
  });
}

/** A flat shape bent onto the crown surface at (cx, cy). */
function conformedShape(key, shape, cx, cy, lift = 0.012) {
  return cached(key, () => {
    const g = new THREE.ShapeGeometry(shape, 16);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx;
      const y = pos.getY(i) + cy;
      pos.setXYZ(i, x, y, crownSurfaceZ(x, y) + lift);
    }
    g.computeVertexNormals();
    return g;
  });
}

function mouthShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.21, 0.035);
  s.quadraticCurveTo(0, 0.0, 0.21, 0.035);
  s.bezierCurveTo(0.19, -0.2, -0.19, -0.2, -0.21, 0.035);
  return s;
}

function ellipseShape(rx, ry, ox = 0, oy = 0) {
  const s = new THREE.Shape();
  s.absellipse(ox, oy, rx, ry, 0, Math.PI * 2, false, 0);
  return s;
}

export class ToothCharacter {
  /**
   * @param {object} opts
   * @param {import('./Materials.js').Materials} opts.materials
   * @param {number} [opts.scale]
   * @param {'open'|'smile'} [opts.expression]
   * @param {string[]} [opts.accessories] cap, coat, toothbrush, partyHat, bow, glasses, bowtie, headband, balloon, camera
   * @param {string} [opts.accent] accessory colour
   */
  constructor({ materials, scale = 1, expression = 'open', accessories = [], accent = PALETTE.pinkBright, name = 'tooth' }) {
    this.materials = materials;
    this.name = name;
    this.scale = scale;
    this.accent = accent;
    this.phase = Math.random() * Math.PI * 2;
    this.blinkTimer = 1 + Math.random() * 3;
    this.blink = 0;
    this.state = { wave: 0, hop: 0, cheer: 0, walk: 0, spin: 0 };
    this.targetYaw = null;

    this.root = new THREE.Group();
    this.root.name = name;
    this.root.scale.setScalar(scale);
    this.body = new THREE.Group(); // squash/hop pivot at the feet
    this.root.add(this.body);
    this.torso = new THREE.Group();
    this.torso.position.y = FOOT_OFFSET;
    this.body.add(this.torso);

    this.#buildBody(expression);
    accessories.forEach((a) => this.#accessory(a));

    const shadow = new THREE.Mesh(
      cached('blob', () => new THREE.PlaneGeometry(2.2, 2.2)),
      new THREE.MeshBasicMaterial({ map: blobShadowTexture(), transparent: true, depthWrite: false, opacity: 0.8 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    shadow.renderOrder = 1;
    this.shadow = shadow;
    this.root.add(shadow);
  }

  #buildBody(expression) {
    const m = this.materials;
    const crown = new THREE.Mesh(crownGeometry(), m.get('tooth'));
    crown.castShadow = true;
    this.crown = crown;
    this.torso.add(crown);

    this.legs = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.37, -0.48, 0);
      const leg = new THREE.Mesh(rootGeometry(), m.get('tooth'));
      leg.rotation.z = side * 0.06;
      leg.castShadow = true;
      pivot.add(leg);
      this.torso.add(pivot);
      return pivot;
    });

    // Eyes: both eyeballs share one mesh and both highlights another, so a blink is one scale.
    const eyeY = 0.12;
    const eyeZ = crownSurfaceZ(0.31, eyeY) - 0.035;
    const eyesGeo = cached('eyes', () =>
      mergeGeometries(
        [-1, 1].map((side) => new THREE.SphereGeometry(0.115, 20, 16).scale(0.85, 1.18, 0.55).translate(side * 0.31, 0, eyeZ)),
      ),
    );
    const shinesGeo = cached('shines', () =>
      mergeGeometries([-1, 1].map((side) => new THREE.SphereGeometry(0.036, 10, 8).translate(side * 0.31 + 0.032, 0.05, eyeZ + 0.06))),
    );
    this.eyes = new THREE.Group();
    this.eyes.position.y = eyeY;
    this.eyes.add(new THREE.Mesh(eyesGeo, m.get('ink')), new THREE.Mesh(shinesGeo, m.get('white')));
    this.torso.add(this.eyes);

    // Cheeks (one mesh for both)
    const cheeks = new THREE.Mesh(
      cached('cheeks', () =>
        mergeGeometries([-1, 1].map((side) => conformedShape(`cheek${side}`, ellipseShape(0.13, 0.075), side * 0.56, -0.06, 0.01))),
      ),
      m.get('cheek'),
    );
    cheeks.renderOrder = 2;
    this.torso.add(cheeks);

    // Mouth
    if (expression === 'smile') {
      const smile = new THREE.Mesh(
        cached('smile', () => new THREE.TorusGeometry(0.17, 0.035, 10, 24, Math.PI)),
        m.get('mouth'),
      );
      smile.rotation.z = Math.PI;
      smile.position.set(0, -0.06, crownSurfaceZ(0, -0.12) - 0.01);
      smile.rotation.x = 0.18;
      this.torso.add(smile);
    } else {
      const mouth = new THREE.Mesh(conformedShape('mouth', mouthShape(), 0, -0.12, 0.012), m.get('mouth'));
      const tongue = new THREE.Mesh(
        conformedShape('tongue', ellipseShape(0.085, 0.045, 0, -0.095), 0, -0.12, 0.02),
        m.get('tongue'),
      );
      this.torso.add(mouth, tongue);
    }

    // Arms (upper arm and hand in one mesh, swinging from the shoulder)
    const armGeo = cached('armHand', () =>
      mergeGeometries([
        new THREE.CapsuleGeometry(0.085, 0.3, 4, 10).translate(0, -0.22, 0).toNonIndexed(),
        new THREE.SphereGeometry(0.115, 14, 10).translate(0, -0.44, 0).toNonIndexed(),
      ]),
    );
    this.arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.84, -0.18, 0.05);
      const arm = new THREE.Mesh(armGeo, m.get('tooth'));
      arm.castShadow = true;
      pivot.add(arm);
      this.torso.add(pivot);
      return pivot;
    });
  }

  #accessory(type) {
    const m = this.materials;
    const accent = this.accent;
    switch (type) {
      case 'cap': {
        // Dentist cap from dr-smiley.svg: blue dome, pale band, white emblem with a blue cross.
        const cap = new THREE.Group();
        const dome = new THREE.Mesh(
          cached('capDome', () => new THREE.SphereGeometry(1, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2)),
          m.get('#69c9f0'),
        );
        dome.scale.set(0.9, 0.42, 0.8);
        const band = new THREE.Mesh(cached('capBand', () => new THREE.TorusGeometry(0.89, 0.07, 10, 48)), m.get('#dff8ff'));
        band.rotation.x = Math.PI / 2;
        band.scale.set(1, 0.9, 1);
        const emblem = new THREE.Mesh(cached('emblem', () => new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28)), m.get('white'));
        emblem.rotation.x = Math.PI / 2 - 0.5;
        emblem.position.set(0, 0.26, 0.64);
        const crossA = new THREE.Mesh(cached('crossA', () => new THREE.BoxGeometry(0.2, 0.06, 0.03)), m.get('#69c9f0'));
        const crossB = crossA.clone();
        crossB.rotation.z = Math.PI / 2;
        const cross = new THREE.Group();
        cross.add(crossA, crossB);
        cross.position.set(0, 0.283, 0.668);
        cross.rotation.x = -0.5;
        cap.add(dome, band, emblem, cross);
        dome.castShadow = true;
        mergeStatic(cap, { cellSize: 1000 });
        cap.position.y = 0.5;
        this.torso.add(cap);
        break;
      }
      case 'coat': {
        const pts = [];
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          pts.push(new THREE.Vector2(0.9 - t * 0.06 + Math.sin(t * Math.PI) * 0.03, -0.22 - t * 0.6));
        }
        const coat = new THREE.Mesh(
          cached('coat', () => new THREE.LatheGeometry(pts, 40)),
          m.get('#f4fbff', { side: THREE.DoubleSide }),
        );
        coat.castShadow = true;
        const collar = new THREE.Mesh(
          cached('collar', () => {
            const s = new THREE.Shape();
            s.moveTo(-0.2, 0);
            s.lineTo(0.2, 0);
            s.lineTo(0, -0.3);
            s.closePath();
            return new THREE.ShapeGeometry(s);
          }),
          m.get('#70c9e9', { side: THREE.DoubleSide }),
        );
        collar.position.set(0, -0.24, 0.9);
        collar.rotation.x = -0.05;
        const buttonGeo = cached('button', () => new THREE.SphereGeometry(0.045, 10, 8));
        const buttons = new THREE.Group();
        [-0.32, 0.32].forEach((x) => {
          const b = new THREE.Mesh(buttonGeo, m.get('blueMid'));
          b.position.set(x, -0.5, 0.82);
          buttons.add(b);
        });
        mergeStatic(buttons, { cellSize: 1000 });
        this.torso.add(coat, collar, buttons);
        break;
      }
      case 'toothbrush': {
        const brush = createMiniToothbrush(m);
        brush.position.set(0, -0.5, 0.05);
        brush.rotation.z = -0.25;
        this.arms[1].add(brush);
        this.heldProp = brush;
        break;
      }
      case 'partyHat': {
        const hat = new THREE.Group();
        const cone = new THREE.Mesh(
          cached('hatCone', () => new THREE.ConeGeometry(0.3, 0.68, 24, 1, true)),
          new THREE.MeshStandardMaterial({ map: stripeTexture(['#ffffff', accent], 5), roughness: 0.4, side: THREE.DoubleSide }),
        );
        cone.position.y = 0.34;
        const pom = new THREE.Mesh(cached('pom', () => new THREE.SphereGeometry(0.1, 12, 10)), m.get('yellowDeep'));
        pom.position.y = 0.72;
        hat.add(cone, pom);
        hat.position.set(0.28, 0.66, 0);
        hat.rotation.z = -0.32;
        this.torso.add(hat);
        break;
      }
      case 'bow': {
        const bow = new THREE.Group();
        const loopGeo = cached('bowLoop', () => new THREE.ConeGeometry(0.17, 0.3, 16));
        [-1, 1].forEach((s) => {
          const loop = new THREE.Mesh(loopGeo, m.get(accent));
          loop.rotation.z = (s * Math.PI) / 2;
          loop.position.x = s * 0.15;
          loop.scale.set(1, 1, 0.55);
          bow.add(loop);
        });
        const knot = new THREE.Mesh(cached('knot', () => new THREE.SphereGeometry(0.075, 12, 10)), m.get(accent));
        bow.add(knot);
        mergeStatic(bow, { cellSize: 1000 });
        bow.position.set(-0.48, 0.66, 0.28);
        bow.rotation.set(0.3, 0.3, 0.35);
        this.torso.add(bow);
        break;
      }
      case 'glasses': {
        const glasses = new THREE.Group();
        const ringGeo = cached('lens', () => new THREE.TorusGeometry(0.15, 0.028, 8, 24));
        [-1, 1].forEach((s) => {
          const ring = new THREE.Mesh(ringGeo, m.get(accent));
          ring.position.set(s * 0.31, 0.12, crownSurfaceZ(0.31, 0.12) + 0.06);
          glasses.add(ring);
        });
        const bridge = new THREE.Mesh(cached('bridge', () => new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6)), m.get(accent));
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.15, crownSurfaceZ(0, 0.15) + 0.06);
        glasses.add(bridge);
        mergeStatic(glasses, { cellSize: 1000 });
        this.torso.add(glasses);
        break;
      }
      case 'bowtie': {
        const tie = new THREE.Group();
        const wingGeo = cached('tieWing', () => new THREE.ConeGeometry(0.12, 0.2, 4));
        [-1, 1].forEach((s) => {
          const wing = new THREE.Mesh(wingGeo, m.get(accent));
          wing.rotation.z = (s * Math.PI) / 2;
          wing.position.x = s * 0.1;
          wing.scale.set(1, 1, 0.4);
          tie.add(wing);
        });
        tie.add(new THREE.Mesh(cached('tieKnot', () => new THREE.SphereGeometry(0.05, 10, 8)), m.get(accent)));
        mergeStatic(tie, { cellSize: 1000 });
        tie.position.set(0, -0.42, crownSurfaceZ(0, -0.36) + 0.03);
        this.torso.add(tie);
        break;
      }
      case 'headband': {
        const band = new THREE.Mesh(cached('headband', () => new THREE.TorusGeometry(0.8, 0.05, 8, 40, Math.PI)), m.get(accent));
        band.position.y = 0.38;
        band.scale.set(1.02, 1, 0.95);
        const star = new THREE.Mesh(starGeometry(0.2, 0.09, 0.06), m.get('yellowDeep'));
        star.position.set(0, 0.86, 0.06);
        this.torso.add(band, star);
        break;
      }
      case 'balloon': {
        const hand = this.arms[0];
        const balloon = new THREE.Mesh(balloonGeometry(), m.balloon(accent));
        balloon.scale.setScalar(0.42);
        balloon.position.set(-0.2, 1.65, 0);
        const string = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -0.45, 0), new THREE.Vector3(-0.2, 1.3, 0)]),
          new THREE.LineBasicMaterial({ color: '#b9a9ca' }),
        );
        hand.add(balloon, string);
        hand.userData.balloon = balloon;
        this.heldBalloon = balloon;
        break;
      }
      default:
        break;
    }
  }

  /** Swap the procedural body for a loaded GLB scene (keeps animation hooks working). */
  setCustomModel(object) {
    this.torso.visible = false;
    object.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    this.body.add(object);
    this.customModel = object;
  }

  /** Smoothly turns towards a world-space point (only around Y). */
  face(point) {
    const dx = point.x - this.root.position.x;
    const dz = point.z - this.root.position.z;
    this.targetYaw = Math.atan2(dx, dz);
  }

  update(t, dt, reducedMotion = false) {
    const s = this.state;
    const p = this.phase;
    const motion = reducedMotion ? 0.15 : 1;

    // Idle bob, hop and squash.
    const bob = Math.sin(t * 2.2 + p) * 0.035 * motion;
    const hopWave = Math.abs(Math.sin(t * 5.2 + p));
    const hop = s.hop * hopWave * 0.75 * motion;
    this.body.position.y = Math.max(0, bob + 0.035 * motion) + hop;
    const squash = 1 + (Math.sin(t * 4.4 + p) * 0.025 + (s.hop > 0 ? (hopWave - 0.5) * 0.12 * s.hop : 0)) * motion;
    this.body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    this.shadow.scale.setScalar(1 - Math.min(0.5, this.body.position.y * 0.35));

    // Arms: rest pose, waving (right arm) and cheering (both up).
    const rest = 0.42 + Math.sin(t * 2.2 + p) * 0.05 * motion;
    const wave = Math.max(s.wave, s.cheer);
    const waveAngle = 2.55 + Math.sin(t * 11 + p) * 0.35 * motion;
    const cheerAngle = 2.3 + Math.sin(t * 9 + p) * 0.25 * motion;
    this.arms[1].rotation.z = rest + (waveAngle - rest) * wave;
    this.arms[0].rotation.z = -(rest + (cheerAngle - rest) * s.cheer);

    // Legs swing while walking.
    const swing = Math.sin(t * 10 + p) * 0.45 * s.walk * motion;
    this.legs[0].rotation.x = swing;
    this.legs[1].rotation.x = -swing;

    // Blink every few seconds.
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blink = 1;
      this.blinkTimer = 2.5 + Math.random() * 3.5;
    }
    this.blink = Math.max(0, this.blink - dt * 7);
    this.eyes.scale.y = 1 - Math.sin(this.blink * Math.PI) * 0.9;

    if (this.heldBalloon) this.heldBalloon.rotation.z = Math.sin(t * 1.3 + p) * 0.12 * motion;

    if (this.targetYaw !== null) {
      // Shortest-path damped yaw.
      let delta = this.targetYaw - this.root.rotation.y;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      this.root.rotation.y += delta * (1 - Math.exp(-6 * dt));
    }
    this.root.rotation.y += s.spin * dt * 8;
    this.lean = damp(this.lean ?? 0, s.walk * 0.12, 6, dt);
    this.torso.rotation.x = this.lean;
  }
}

// Shared small geometries used by characters and props ----------------------

export function balloonGeometry() {
  return cached('balloon', () => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const a = t * Math.PI;
      // Teardrop: wider top, pinched knot at the bottom.
      const r = Math.sin(a) * (0.82 + 0.18 * Math.cos(a)) * 0.9;
      pts.push(new THREE.Vector2(Math.max(0.001, r), -Math.cos(a) * 1.1));
    }
    const g = new THREE.LatheGeometry(pts, 28);
    g.rotateX(Math.PI); // knot at the bottom
    return g;
  });
}

export function starGeometry(outer = 0.5, inner = 0.22, depth = 0.15) {
  return cached(`star${outer}-${inner}-${depth}`, () => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: depth * 0.4, bevelThickness: depth * 0.4, bevelSegments: 2 });
    g.center();
    return g;
  });
}

export function createMiniToothbrush(m, scale = 1) {
  const brush = new THREE.Group();
  const handle = new THREE.Mesh(cached('tbHandle', () => new THREE.CapsuleGeometry(0.05, 0.6, 4, 10)), m.get('pinkBright'));
  handle.position.y = 0.3;
  const head = new THREE.Mesh(cached('tbHead', () => new THREE.BoxGeometry(0.12, 0.22, 0.07)), m.get('blue'));
  head.position.y = 0.72;
  const bristles = new THREE.Mesh(cached('tbBristle', () => new THREE.BoxGeometry(0.1, 0.18, 0.1)), m.get('white'));
  bristles.position.set(0, 0.72, 0.08);
  brush.add(handle, head, bristles);
  brush.scale.setScalar(scale);
  return brush;
}

export function disposeCharacterGeometryCache() {
  for (const g of geometryCache.values()) g.dispose();
  geometryCache.clear();
}
