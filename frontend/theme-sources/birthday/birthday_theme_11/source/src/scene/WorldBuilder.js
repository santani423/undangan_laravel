import * as THREE from 'three';
import gsap from 'gsap';
import { STATIONS } from './stations.js';
import { PALETTE } from './Materials.js';
import { ToothCharacter, createMiniToothbrush } from './CharacterFactory.js';
import * as Props from './PropFactory.js';
import * as Art from './artwork.js';
import { TitleText, createTitleSign } from './TitleText.js';
import { Confetti } from './effects/Confetti.js';
import { Fireworks } from './effects/Fireworks.js';
import { Bubbles, Sparkles } from './effects/Ambient.js';
import { mergeStatic } from './mergeStatic.js';
import { clamp, easeInOutCubic, easeOutBack, lerp, seededRandom } from '../utils/helpers.js';

const UP = new THREE.Vector3(0, 1, 0);
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const ISLAND_RADIUS = 46;
const PLAZA = new THREE.Vector3(0, 0, 2);

const FRIENDS = [
  { station: 1, accessories: ['bow'], accent: PALETTE.pinkBright, expression: 'open' },
  { station: 2, accessories: ['glasses'], accent: PALETTE.blueMid, expression: 'smile' },
  { station: 3, accessories: ['partyHat'], accent: PALETTE.yellowDeep, expression: 'open' },
  { station: 4, accessories: ['bowtie'], accent: PALETTE.lavenderDeep, expression: 'smile' },
  { station: 5, accessories: ['partyHat', 'balloon'], accent: PALETTE.pinkBright, expression: 'open' },
  { station: 6, accessories: ['headband'], accent: PALETTE.mintDeep, expression: 'open' },
];

const PATH_POINTS = [
  [0, 47], [0, 36], [-4, 28], [-15, 21], [-22, 12], [-24, 1], [-21, -9], [-14, -15], [-6, -21],
  [3, -24], [12, -20], [20, -9], [22, 1], [21, 10], [13, 12], [6, 8], [0, 2],
];

export class World {
  /**
   * @param {object} opts
   * @param {THREE.Scene} opts.scene
   * @param {import('./Materials.js').Materials} opts.materials
   * @param {object} opts.quality
   * @param {object} opts.config resolved invitation config
   * @param {Map<string, HTMLImageElement|null>} opts.images
   * @param {import('three/addons/loaders/FontLoader.js').Font|null} opts.font
   * @param {object} opts.handlers callbacks into the app (onActivity, onPhoto, onCake, onMailbox, onSection, sound)
   */
  constructor({ scene, materials, quality, config, images, font, handlers, reducedMotion, pixelRatio = 1 }) {
    this.scene = scene;
    this.m = materials;
    this.quality = quality;
    this.config = config;
    this.images = images;
    this.font = font;
    this.handlers = handlers;
    this.reducedMotion = reducedMotion;
    this.pixelRatio = pixelRatio;
    this.root = new THREE.Group();
    scene.add(this.root);
    // Scenery that never moves; merged into a few batched meshes once the world is built.
    this.staticRoot = new THREE.Group();
    this.root.add(this.staticRoot);
    this.interactives = [];
    this.updaters = [];
    this.balloons = [];
    this.story = 0;
    this.gather = 0;
    this.moods = STATIONS.map((s) => ({
      skyTop: new THREE.Color(s.mood.skyTop),
      skyBottom: new THREE.Color(s.mood.skyBottom),
      fog: new THREE.Color(s.mood.fog),
      sun: new THREE.Color(s.mood.sun),
      sunIntensity: s.mood.sunIntensity,
      hemi: s.mood.hemi,
    }));
    this.tmpColor = new THREE.Color();
  }

  /** Builds everything, reporting progress between steps so the loader can update. */
  async build(onStep = async () => {}) {
    const steps = [
      ['Painting the sky', () => this.#buildSky()],
      ['Raising the candy island', () => this.#buildIsland()],
      ['Laying the sprinkle path', () => this.#buildPath()],
      ['Building the toothbrush gate', () => this.#buildGate()],
      ['Sealing the invitation', () => this.#buildEnvelopeStation()],
      ['Hanging the calendar', () => this.#buildDetailsStation()],
      ['Setting up the games', () => this.#buildPlayground()],
      ['Pegging up the photos', () => this.#buildGallery()],
      ['Baking the cake', () => this.#buildCakeStation()],
      ['Painting the RSVP board', () => this.#buildRsvpStation()],
      ['Decorating the plaza', () => this.#buildPlaza()],
      ['Waking up the Tooth Friends', () => this.#buildCharacters()],
      ['Planting lollipop trees', () => this.#buildDecorations()],
      ['Blowing bubbles', () => this.#buildEffects()],
    ];
    for (let i = 0; i < steps.length; i++) {
      await onStep(i / steps.length, steps[i][0]);
      steps[i][1]();
    }
    this.mergeStats = mergeStatic(this.staticRoot);
    await onStep(1, 'Ready!');
  }

  /* -------------------------------------------------------------- helpers */

  #basis(station) {
    const pos = v3(station.pose.position);
    const target = v3(station.pose.target);
    const forward = target.clone().sub(pos).setY(0).normalize();
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
    return { forward, right, yaw: Math.atan2(-forward.x, -forward.z), camera: pos };
  }

  /** A point relative to a station in its camera's frame (right / up / away from camera). */
  #place(station, r = 0, u = 0, f = 0, base = null) {
    const { forward, right } = this.#basis(station);
    const origin = base ? base.clone() : new THREE.Vector3(station.anchor[0], 0, station.anchor[2]);
    return origin.addScaledVector(right, r).addScaledVector(UP, u).addScaledVector(forward, f);
  }

  /** Station spot: absolute [x, y, z] or camera-relative { r, f }. */
  #spot(station, spec) {
    if (Array.isArray(spec)) return v3(spec);
    return this.#place(station, spec?.r ?? 0, 0, spec?.f ?? 0);
  }

  #interactive(object, { onClick, label = '', hoverScale = 1.06 } = {}) {
    const entry = { object, onClick, label, hovered: false, baseScale: object.scale.clone(), hoverScale, enabled: true };
    object.userData.interactive = entry;
    this.interactives.push(entry);
    return entry;
  }

  #add(object) {
    this.root.add(object);
    return object;
  }

  #addStatic(object) {
    this.staticRoot.add(object);
    return object;
  }

  #balloonCluster(position, colors, opts) {
    const cluster = Props.createBalloonCluster(this.m, colors, opts);
    cluster.position.copy(position);
    cluster.userData.balloons.forEach((b) => this.#registerBalloon(b));
    return this.#add(cluster);
  }

  #registerBalloon(balloonGroup) {
    const target = balloonGroup.userData.balloon;
    const entry = { group: balloonGroup, target, popped: false, scale: 1, regrowAt: 0 };
    this.balloons.push(entry);
    this.#interactive(target, {
      label: 'Pop the balloon',
      hoverScale: 1.08,
      onClick: () => this.popBalloon(entry),
    });
  }

  popBalloon(entry) {
    if (entry.popped) return;
    entry.popped = true;
    entry.target.userData.interactive.enabled = false;
    const world = entry.target.getWorldPosition(new THREE.Vector3());
    this.confetti?.burst(world, { amount: this.reducedMotion ? 12 : 45, spread: 4, up: 3, groundY: 0.06 });
    this.handlers.sound?.('pop');
    gsap.to(entry.target.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.12, ease: 'power2.in' });
    entry.group.userData.string.visible = false;
    gsap.delayedCall(5, () => this.#regrow(entry));
  }

  #regrow(entry) {
    if (!entry.popped) return;
    entry.group.userData.string.visible = true;
    const s = entry.target.userData.interactive.baseScale;
    gsap.to(entry.target.scale, {
      x: s.x, y: s.y, z: s.z, duration: 0.8, ease: 'back.out(2.5)',
      onComplete: () => {
        entry.popped = false;
        entry.target.userData.interactive.enabled = true;
      },
    });
  }

  /* ---------------------------------------------------------------- sky */

  #buildSky() {
    this.skyUniforms = {
      topColor: { value: this.moods[0].skyTop.clone() },
      bottomColor: { value: this.moods[0].skyBottom.clone() },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(420, 32, 16),
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vPos;
          void main() {
            float h = clamp(vPos.y * 1.6 + 0.25, 0.0, 1.0);
            gl_FragColor = vec4(mix(bottomColor, topColor, smoothstep(0.0, 1.0, h)), 1.0);
            #include <colorspace_fragment>
          }`,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    );
    sky.renderOrder = -10;
    this.#add(sky);
    this.scene.fog = new THREE.Fog(this.moods[0].fog.clone(), 75, 240);

    this.hemi = new THREE.HemisphereLight('#e3f6ff', '#ffe6f0', 1.15);
    this.sun = new THREE.DirectionalLight('#fff1dc', 2.4);
    this.sun.position.set(18, 32, 22);
    this.sunOffset = new THREE.Vector3(18, 32, 22);
    if (this.quality.shadows) {
      this.sun.castShadow = true;
      this.sun.shadow.mapSize.set(this.quality.shadowMapSize, this.quality.shadowMapSize);
      const c = this.sun.shadow.camera;
      c.left = c.bottom = -20;
      c.right = c.top = 20;
      c.near = 5;
      c.far = 90;
      this.sun.shadow.bias = -0.0004;
      this.sun.shadow.normalBias = 0.03;
    }
    const fill = new THREE.DirectionalLight('#ffe3ef', 0.55);
    fill.position.set(-20, 10, -10);
    this.root.add(this.hemi, this.sun, this.sun.target, fill);

    // Puffy clouds around and below the island.
    this.clouds = new THREE.Group();
    const rand = seededRandom(9);
    const cloudCount = Math.round(16 * this.quality.decorationScale);
    for (let i = 0; i < cloudCount; i++) {
      const cloud = Props.createCloud(this.m, i % 3);
      const a = (i / cloudCount) * Math.PI * 2 + rand() * 0.3;
      const r = 62 + rand() * 60;
      cloud.position.set(Math.cos(a) * r, -16 + rand() * 42, Math.sin(a) * r);
      cloud.scale.setScalar(1.4 + rand() * 1.6);
      cloud.rotation.y = rand() * Math.PI;
      this.clouds.add(cloud);
    }
    mergeStatic(this.clouds, { cellSize: 1000 }); // one draw call; the whole ring drifts together
    this.#add(this.clouds);
  }

  /* ------------------------------------------------------------- island */

  #buildIsland() {
    const m = this.m;
    // Grass top: a square grid squeezed into a disc so it has interior vertices for colour variation.
    const seg = 72;
    const plane = new THREE.PlaneGeometry(2, 2, seg, seg);
    plane.rotateX(-Math.PI / 2);
    const pos = plane.attributes.position;
    const colors = [];
    const light = new THREE.Color('#c8f1d4');
    const mid = new THREE.Color(PALETTE.mint);
    const deep = new THREE.Color('#a6e3b9');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const u = x * Math.sqrt(1 - (z * z) / 2);
      const w = z * Math.sqrt(1 - (x * x) / 2);
      const px = u * ISLAND_RADIUS;
      const pz = w * ISLAND_RADIUS;
      pos.setXYZ(i, px, 0, pz);
      const n = Math.sin(px * 0.21) * Math.cos(pz * 0.17) + Math.sin((px + pz) * 0.09) * 0.6;
      c.copy(mid).lerp(n > 0 ? light : deep, Math.min(1, Math.abs(n) * 0.6));
      colors.push(c.r, c.g, c.b);
    }
    plane.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    plane.computeVertexNormals();
    const top = new THREE.Mesh(plane, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }));
    top.receiveShadow = true;
    this.ground = top;
    this.#add(top);

    // Cake-layer sides: frosting drips, sponge, filling and a lavender rock underside.
    const drips = new THREE.CylinderGeometry(ISLAND_RADIUS + 0.25, ISLAND_RADIUS + 0.25, 1, 160, 4, true);
    const dp = drips.attributes.position;
    for (let i = 0; i < dp.count; i++) {
      const a = Math.atan2(dp.getZ(i), dp.getX(i));
      const f = 0.5 - dp.getY(i);
      const drip = 1.9 * Math.pow(Math.max(0, Math.sin(a * 23)), 3) + 0.8 * Math.pow(Math.max(0, Math.sin(a * 37 + 1)), 5);
      dp.setY(i, 0.05 - f * (0.7 + drip));
    }
    drips.computeVertexNormals();
    const frosting = new THREE.Mesh(drips, m.get('white', { roughness: 0.4, side: THREE.DoubleSide }));
    const lip = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_RADIUS, 0.45, 10, 160), m.get('white', { roughness: 0.4 }));
    lip.rotation.x = Math.PI / 2;
    lip.position.y = -0.05;
    const sponge = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS - 0.4, 3.6, 120, 1, true), m.get('#ffc8db', { roughness: 0.75 }));
    sponge.position.y = -1.9;
    const filling = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_RADIUS - 0.2, ISLAND_RADIUS - 0.2, 0.7, 120, 1, true), m.get('cream', { roughness: 0.5 }));
    filling.position.y = -3.95;
    const sponge2 = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_RADIUS - 0.5, ISLAND_RADIUS - 1.6, 3, 120, 1, true), m.get('#cdeefc', { roughness: 0.75 }));
    sponge2.position.y = -5.8;
    const rock = new THREE.ConeGeometry(ISLAND_RADIUS - 1.6, 20, 64, 8, true);
    rock.rotateX(Math.PI);
    const rp = rock.attributes.position;
    const rand = seededRandom(3);
    const noise = Array.from({ length: 64 }, () => rand());
    for (let i = 0; i < rp.count; i++) {
      const y = rp.getY(i);
      const a = Math.atan2(rp.getZ(i), rp.getX(i));
      const k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 63);
      const bump = 1 + (noise[k] - 0.5) * 0.18 * (1 - (y + 10) / 20);
      rp.setX(i, rp.getX(i) * bump);
      rp.setZ(i, rp.getZ(i) * bump);
    }
    rock.computeVertexNormals();
    const underside = new THREE.Mesh(rock, m.get('#d8cbff', { roughness: 0.8, flatShading: true }));
    underside.position.y = -17.3;
    this.#add(frosting);
    this.root.add(lip, sponge, filling, sponge2, underside);

    // Small floating islets for depth.
    this.islets = [];
    const isletCount = Math.round(5 * this.quality.decorationScale) + 1;
    for (let i = 0; i < isletCount; i++) {
      const islet = new THREE.Group();
      const r = 3 + rand() * 2.5;
      const grass = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.95, 0.8, 32), m.get(PALETTE.mint, { roughness: 0.9 }));
      const under = new THREE.Mesh(new THREE.ConeGeometry(r * 0.95, r * 1.8, 24), m.get('#d8cbff', { roughness: 0.8, flatShading: true }));
      under.rotation.x = Math.PI;
      under.position.y = -0.4 - r * 0.9;
      islet.add(grass, under);
      const tree = i % 2 ? Props.createLollipopTree(m, [PALETTE.pinkBright, PALETTE.blue, PALETTE.lavenderDeep][i % 3], 2.4) : Props.createCandyTree(m, [PALETTE.pink, PALETTE.lavender, PALETTE.blue][i % 3], 2, i + 1);
      tree.position.y = 0.4;
      islet.add(tree);
      mergeStatic(islet, { cellSize: 1000 }); // merged while still at the origin, then floated into place
      const a = (i / isletCount) * Math.PI * 2 + 0.5;
      const dist = 62 + rand() * 14;
      islet.position.set(Math.cos(a) * dist, -2 + rand() * 9, Math.sin(a) * dist);
      islet.userData.baseY = islet.position.y;
      islet.userData.phase = rand() * 6;
      this.islets.push(islet);
      this.#add(islet);
    }
  }

  /* --------------------------------------------------------------- path */

  #buildPath() {
    const curve = new THREE.CatmullRomCurve3(PATH_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.pathCurve = curve;
    const samples = 700;
    const width = 3.2;
    const positions = [];
    const indices = [];
    const pts = curve.getSpacedPoints(samples);
    this.pathSamples = pts.filter((_, i) => i % 6 === 0);
    for (let i = 0; i <= samples; i++) {
      const p = pts[i];
      const tangent = curve.getTangentAt(i / samples);
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width / 2);
      positions.push(p.x + side.x, 0.05, p.z + side.z, p.x - side.x, 0.05, p.z - side.z);
      if (i < samples) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const path = new THREE.Mesh(geometry, this.m.get('#fff1d2', { roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }));
    path.receiveShadow = true;
    this.#add(path);

    // Candy stones along both edges.
    const length = curve.getLength();
    const stoneCount = Math.floor(length / 1.5);
    const stones = new THREE.InstancedMesh(new THREE.SphereGeometry(0.32, 12, 8), this.m.get('white', { roughness: 0.35 }), stoneCount * 2);
    const dummy = new THREE.Object3D();
    const colors = [PALETTE.pinkBright, PALETTE.blue, PALETTE.yellowDeep, PALETTE.lavenderDeep].map((c) => new THREE.Color(c));
    let k = 0;
    for (let i = 0; i < stoneCount; i++) {
      const t = i / stoneCount;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      for (const s of [-1, 1]) {
        dummy.position.copy(p).addScaledVector(side, s * (width / 2 + 0.25));
        dummy.position.y = 0.1;
        dummy.scale.set(1, 0.45, 1);
        dummy.updateMatrix();
        stones.setMatrixAt(k, dummy.matrix);
        stones.setColorAt(k, colors[(i + (s > 0 ? 2 : 0)) % colors.length]);
        k++;
      }
    }
    stones.receiveShadow = true;
    this.#add(stones);
  }

  /* ------------------------------------------------------- 0 · entrance */

  #buildGate() {
    const station = STATIONS[0];
    const m = this.m;
    const gate = Props.createGate(m);
    gate.position.set(station.anchor[0], 0, station.anchor[2]);
    this.#addStatic(gate);

    // 3D title (or a painted sign if the font could not load).
    if (this.font) {
      this.title = new TitleText(this.font, this.config.copy.siteTitle);
      this.title.group.position.set(0, 10.4, station.anchor[2] + 1.4);
      this.#add(this.title.group);
    } else {
      const sign = createTitleSign(this.config.copy.siteTitle);
      sign.position.set(0, 12.2, station.anchor[2] + 1.4);
      this.#add(sign);
    }

    [-1, 1].forEach((s, i) => {
      this.#balloonCluster(new THREE.Vector3(s * 8.6, 0, station.anchor[2] + 1.5), i ? [PALETTE.blue, PALETTE.yellowDeep, PALETTE.pinkBright] : [PALETTE.pinkBright, PALETTE.lavenderDeep, PALETTE.blue], { height: 3.4 });
      const gift = Props.createGiftBox(m, { color: i ? PALETTE.pink : PALETTE.lavender, ribbon: i ? PALETTE.blueMid : PALETTE.pinkBright, size: 1.1 });
      gift.position.set(s * 9.6, 0, station.anchor[2] + 3.4);
      gift.rotation.y = s * 0.4;
      this.#addStatic(gift);
    });
    const paste = Props.createToothpaste(m);
    paste.position.set(-10.8, 0, station.anchor[2] - 1);
    paste.rotation.set(0, 0.6, 0.12);
    this.#addStatic(paste);
  }

  /* ------------------------------------------------------ 1 · envelope */

  #buildEnvelopeStation() {
    const station = STATIONS[1];
    const { yaw } = this.#basis(station);
    const envelope = Props.createEnvelope(this.m, Art.invitationCardTexture(this.config, this.images));
    envelope.group.position.copy(v3(station.anchor));
    envelope.group.rotation.y = yaw;
    envelope.group.userData.baseY = station.anchor[1];
    this.envelope = envelope;
    this.#add(envelope.group);
    this.#interactive(envelope.group, { label: 'Open the invitation', onClick: () => this.handlers.onSection?.('invitation') });

    const cloud = Props.createCloud(this.m, 1);
    cloud.scale.setScalar(0.62);
    cloud.position.copy(v3(station.anchor)).add(new THREE.Vector3(0, -3.4, 0));
    this.#addStatic(cloud);
    const gifts = [
      [-4.2, PALETTE.pink, PALETTE.blueMid, 1.0],
      [-5.6, PALETTE.yellow, PALETTE.pinkBright, 0.75],
    ];
    gifts.forEach(([r, color, ribbon, size]) => {
      const gift = Props.createGiftBox(this.m, { color, ribbon, size });
      gift.position.copy(this.#place(station, r, 0, 1.2));
      gift.rotation.y = yaw + r * 0.1;
      this.#addStatic(gift);
    });
    this.#balloonCluster(this.#place(station, 4.6, 0, 1.8), [PALETTE.lavenderDeep, PALETTE.pinkBright], { height: 2.8 });
  }

  /* ------------------------------------------------------- 2 · details */

  #buildDetailsStation() {
    const station = STATIONS[2];
    const { yaw } = this.#basis(station);
    const anchor = v3(station.anchor);
    const calendar = Props.createCalendar(this.m, Art.calendarTexture(this.config.event));
    calendar.position.copy(anchor);
    calendar.rotation.y = yaw;
    calendar.userData.baseY = anchor.y;
    this.calendar = calendar;
    this.#add(calendar);
    this.#interactive(calendar, { label: 'Party details', onClick: () => this.handlers.onSection?.('details') });

    const [hh, mm] = String(this.config.event.startTime).split(':').map(Number);
    const clock = Props.createClock(this.m, Art.clockTexture(), { hour: hh, minute: mm });
    clock.group.position.copy(this.#place(station, -3.6, 7.6, 1));
    clock.group.rotation.set(0, yaw + 0.2, 0.08);
    clock.group.userData.baseY = clock.group.position.y;
    this.clock = clock;
    this.#add(clock.group);
    this.#interactive(clock.group, { label: 'Party time', onClick: () => this.handlers.onSection?.('details') });

    const pin = Props.createLocationPin(this.m);
    pin.position.copy(this.#place(station, 5.1, 1.6, 0.4));
    pin.rotation.y = yaw - 0.3;
    pin.userData.baseY = pin.position.y;
    pin.scale.setScalar(0.95);
    this.pin = pin;
    this.#add(pin);
    this.#interactive(pin, { label: 'Party location', onClick: () => this.handlers.onSection?.('details') });
    const pinShadow = Props.blobShadow(2.4, 0.5);
    pinShadow.position.copy(this.#place(station, 5.1, 0.03, 0.4));
    this.#addStatic(pinShadow);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 1.2, 32), this.m.get('cream'));
    plinth.position.copy(this.#place(station, 0, 0.6, 0.3));
    plinth.castShadow = plinth.receiveShadow = true;
    this.#addStatic(plinth);
    const gift = Props.createGiftBox(this.m, { color: PALETTE.blue, ribbon: PALETTE.yellowDeep, size: 0.9 });
    gift.position.copy(this.#place(station, -2.8, 0, -1.4));
    gift.rotation.y = yaw + 0.4;
    this.#addStatic(gift);
  }

  /* ---------------------------------------------------- 3 · playground */

  #activityProp(icon) {
    const m = this.m;
    switch (icon) {
      case 'games':
        return Props.createToyBlocks(m);
      case 'dental': {
        const g = new THREE.Group();
        const paste = Props.createToothpaste(m);
        paste.scale.setScalar(0.62);
        paste.position.x = -0.35;
        const brush = createMiniToothbrush(m, 2.6);
        brush.position.set(0.55, 0, 0);
        brush.rotation.z = -0.15;
        g.add(paste, brush);
        return g;
      }
      case 'photo': {
        const cam = Props.createPhotoCamera(m);
        cam.scale.setScalar(0.78);
        return cam;
      }
      case 'cake':
        return Props.createSmallCake(m);
      case 'balloons': {
        const cluster = Props.createBalloonCluster(m, [PALETTE.pinkBright, PALETTE.blue, PALETTE.yellowDeep], { height: 1.4, spread: 0.7 });
        cluster.scale.setScalar(0.7);
        return cluster;
      }
      case 'gift':
      default: {
        const g = new THREE.Group();
        const a = Props.createGiftBox(m, { color: PALETTE.lavender, ribbon: PALETTE.pinkBright, size: 1.0 });
        const b = Props.createGiftBox(m, { color: PALETTE.pink, ribbon: PALETTE.blueMid, size: 0.65 });
        a.position.x = -0.3;
        b.position.set(0.65, 0, 0.4);
        b.rotation.y = 0.5;
        g.add(a, b);
        return g;
      }
    }
  }

  #buildPlayground() {
    const station = STATIONS[3];
    const { yaw } = this.#basis(station);
    const activities = this.config.activities;
    const n = activities.length;
    const spacing = n > 6 ? 2.6 : 3.1;
    const colors = [PALETTE.mint, PALETTE.pink, PALETTE.sky, PALETTE.yellow, PALETTE.lavender];
    this.activityProps = new Map();
    activities.forEach((activity, i) => {
      const x = (i - (n - 1) / 2) * spacing;
      const group = new THREE.Group();
      group.position.copy(this.#place(station, x, 0, 1.6 - x * x * 0.06));
      group.rotation.y = yaw - x * 0.04;
      const pedestal = Props.createPedestal(this.m, colors[i % colors.length]);
      const prop = new THREE.Group();
      prop.add(this.#activityProp(activity.icon));
      mergeStatic(prop, { cellSize: 1000 }); // the toy bobs as one piece
      prop.position.y = 0.52;
      prop.userData.baseY = 0.52;
      group.add(pedestal, prop);
      group.userData = { prop, halo: pedestal.userData.halo, phase: i * 0.7, bounce: 0 };
      this.#add(group);
      this.activityProps.set(activity.id, group);
      this.#interactive(group, { label: activity.title, onClick: () => this.handlers.onActivity?.(activity.id) });
    });
    const sign = Props.createPole(this.m, 4.2, ['#ffffff', PALETTE.mintDeep]);
    sign.position.copy(this.#place(station, -(n / 2) * spacing - 1.6, 0, 3.4));
    this.#addStatic(sign);
    this.#balloonCluster(this.#place(station, (n / 2) * spacing + 1.8, 0, 3), [PALETTE.yellowDeep, PALETTE.mintDeep, PALETTE.pinkBright], { height: 3 });
  }

  /* ------------------------------------------------------- 4 · gallery */

  #buildGallery() {
    const station = STATIONS[4];
    const { yaw } = this.#basis(station);
    const photos = this.config.gallery.slice(0, 8);
    const halfSpan = 7.6;
    const height = 7;
    const leftPole = Props.createPole(this.m, height, ['#ffffff', PALETTE.blue]);
    leftPole.position.copy(this.#place(station, -halfSpan, 0, 0));
    const rightPole = Props.createPole(this.m, height, ['#ffffff', PALETTE.pinkBright]);
    rightPole.position.copy(this.#place(station, halfSpan, 0, 0));
    this.staticRoot.add(leftPole, rightPole);
    const from = leftPole.position.clone().setY(height - 0.2);
    const to = rightPole.position.clone().setY(height - 0.2);
    const mid = from.clone().lerp(to, 0.5);
    mid.y -= 1.2;
    const string = new THREE.QuadraticBezierCurve3(from, mid, to);
    this.#add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(string.getPoints(40)), new THREE.LineBasicMaterial({ color: '#ffffff' })));

    this.polaroids = photos.map((photo, i) => {
      const image = this.images.get(`gallery:${i}`) ?? null;
      const polaroid = Props.createPolaroid(this.m, Art.polaroidTexture(image, photo.caption));
      const t = (i + 1) / (photos.length + 1);
      polaroid.position.copy(string.getPoint(t));
      polaroid.rotation.y = yaw;
      const pivot = new THREE.Group(); // flips the card around its hanging point
      pivot.position.copy(polaroid.position);
      polaroid.position.set(0, 0, 0);
      pivot.rotation.y = yaw;
      polaroid.rotation.y = 0;
      pivot.add(polaroid);
      pivot.userData = { phase: i * 1.3, reveal: 0, inner: polaroid };
      this.#add(pivot);
      this.#interactive(pivot, { label: photo.caption, onClick: () => this.handlers.onPhoto?.(i) });
      return pivot;
    });
    this.setGalleryReveal(0);
    const camera = Props.createPhotoCamera(this.m);
    camera.position.copy(this.#place(station, halfSpan + 4.6, 0, 1.8));
    camera.rotation.y = yaw - 0.5;
    camera.scale.setScalar(0.9);
    this.#addStatic(camera);
  }

  /* ---------------------------------------------------------- 5 · cake */

  #buildCakeStation() {
    const station = STATIONS[5];
    const { yaw } = this.#basis(station);
    const anchor = new THREE.Vector3(station.anchor[0], 0, station.anchor[2]);
    const table = Props.createRoundTable(this.m);
    table.position.copy(anchor);
    this.#addStatic(table);
    const cake = Props.createCake(this.m, { candleCount: this.config.child.age, quality: this.quality });
    cake.group.position.copy(anchor).setY(1.27);
    cake.group.rotation.y = yaw;
    this.cake = cake;
    this.#add(cake.group);
    this.#interactive(cake.group, { label: 'Blow out the candles', hoverScale: 1.03, onClick: () => this.handlers.onCake?.() });

    // Printed on the front only; the back is plain ribbon so it never reads mirrored from afar.
    const bannerTexture = Art.bannerTexture(`Happy birthday, ${this.config.child.name}!`);
    const banner = new THREE.Group();
    const front = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.93), Props.printMaterial(bannerTexture, { transparent: true }));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.29), this.m.get(PALETTE.pinkBright, { roughness: 0.7 }));
    back.rotation.y = Math.PI;
    back.position.set(0, 0.13, -0.01);
    banner.add(front, back);
    banner.position.copy(this.#place(station, 0, 8.4, 3.2));
    banner.rotation.y = yaw;
    this.banner = banner;
    this.#add(banner);
    [-1, 1].forEach((s) => {
      const pole = Props.createPole(this.m, 8.6, ['#ffffff', s > 0 ? PALETTE.pinkBright : PALETTE.blue]);
      pole.position.copy(this.#place(station, s * 4.9, 0, 3.4));
      this.#addStatic(pole);
    });
    [
      [-6.2, PALETTE.lavender, PALETTE.yellowDeep, 1.0, 1.2],
      [6.2, PALETTE.yellow, PALETTE.pinkBright, 0.85, 1.2],
      [6.9, PALETTE.blue, PALETTE.pinkBright, 0.6, -0.4],
    ].forEach(([r, color, ribbon, size, f]) => {
      const gift = Props.createGiftBox(this.m, { color, ribbon, size });
      gift.position.copy(this.#place(station, r, 0, f));
      gift.rotation.y = yaw + r * 0.1;
      this.#addStatic(gift);
    });
    this.#balloonCluster(this.#place(station, -7.4, 0, 2.6), [PALETTE.pinkBright, PALETTE.yellowDeep, PALETTE.blue], { height: 3.6 });
  }

  /* ---------------------------------------------------------- 6 · RSVP */

  #buildRsvpStation() {
    const station = STATIONS[6];
    const { yaw } = this.#basis(station);
    const board = Props.createSignBoard(this.m, Art.rsvpBoardTexture(this.config, this.images));
    board.position.copy(this.#place(station, -1.6, 0, 0.6));
    board.rotation.y = yaw;
    this.#add(board);
    this.#interactive(board, { label: 'Reply to the invitation', hoverScale: 1.02, onClick: () => this.handlers.onMailbox?.() });

    const mailbox = Props.createMailbox(this.m);
    mailbox.group.position.copy(this.#place(station, 3.4, 0, -0.4));
    mailbox.group.rotation.y = yaw - 0.35;
    this.mailbox = mailbox;
    this.#add(mailbox.group);
    this.#interactive(mailbox.group, { label: 'Reply to the invitation', onClick: () => this.handlers.onMailbox?.() });
    const bunting = Props.createBunting(this.m, this.#place(station, -4.4, 5.8, 0.4), this.#place(station, -6.8, 4.2, 2.6), { sag: 0.5, flags: 4 });
    this.#addStatic(bunting);
    this.#balloonCluster(this.#place(station, 8.2, 0, 1.8), [PALETTE.blue, PALETTE.pinkBright], { height: 2.6 });
  }

  /* --------------------------------------------------------- 7 · plaza */

  #buildPlaza() {
    const plaza = Props.createPlaza(this.m);
    plaza.position.copy(PLAZA);
    this.#addStatic(plaza);
    const maypole = Props.createMaypole(this.m);
    maypole.position.copy(PLAZA);
    this.maypole = maypole;
    this.#add(maypole);
    maypole.children.forEach((child) => {
      if (child.userData?.balloon) this.#registerBalloon(child);
    });
  }

  /* ---------------------------------------------------- characters */

  #buildCharacters() {
    const m = this.m;
    this.mascot = new ToothCharacter({ materials: m, scale: 1.55, accessories: ['cap', 'coat', 'toothbrush'], accent: PALETTE.blueMid, name: 'Dr. Smiley' });
    this.mascotSpots = STATIONS.map((s) => this.#spot(s, s.mascot));
    this.mascot.root.position.copy(this.mascotSpots[0]);
    this.#add(this.mascot.root);
    this.#interactive(this.mascot.torso, {
      label: 'Dr. Smiley',
      hoverScale: 1.04,
      onClick: () => {
        this.handlers.sound?.('pop');
        this.#cheer(this.mascot, 1.4);
      },
    });

    // Gather spots: an arc around the maypole, facing the finale camera.
    const finaleCam = v3(STATIONS[7].exit.position);
    const spots = FRIENDS.map((_, i) => {
      const a = lerp(-1.25, 1.25, i / (FRIENDS.length - 1));
      const dir = finaleCam.clone().sub(PLAZA).setY(0).normalize();
      const side = new THREE.Vector3(dir.z, 0, -dir.x);
      return PLAZA.clone().addScaledVector(dir, Math.cos(a) * 4.6).addScaledVector(side, Math.sin(a) * 5.4);
    });
    this.friends = FRIENDS.map((f, i) => {
      const character = new ToothCharacter({ materials: m, accessories: f.accessories, accent: f.accent, expression: f.expression, name: `friend-${i}` });
      const home = this.#spot(STATIONS[f.station], STATIONS[f.station].friend);
      character.root.position.copy(home);
      character.home = home;
      character.gatherSpot = spots[i];
      character.station = f.station;
      this.#add(character.root);
      this.#interactive(character.torso, {
        label: 'Tooth friend',
        hoverScale: 1.06,
        onClick: () => {
          this.handlers.sound?.('pop');
          this.#cheer(character, 1.2);
        },
      });
      return character;
    });
  }

  #cheer(character, seconds = 1.5) {
    gsap.killTweensOf(character.state);
    gsap.to(character.state, { hop: 1, cheer: 1, duration: 0.2 });
    gsap.to(character.state, { hop: 0, cheer: 0, duration: 0.4, delay: seconds });
  }

  /* -------------------------------------------------- decorations */

  #isClear(x, z, margin = 0) {
    const r = Math.hypot(x, z);
    if (r > ISLAND_RADIUS - 3) return false;
    if (Math.hypot(x - PLAZA.x, z - PLAZA.z) < 10 + margin) return false;
    for (const s of STATIONS) if (Math.hypot(x - s.anchor[0], z - s.anchor[2]) < 10.5 + margin) return false;
    for (const p of this.pathSamples) if (Math.hypot(x - p.x, z - p.z) < 3.4 + margin) return false;
    // Keep each station's camera sight line clear.
    for (const s of STATIONS.slice(0, 7)) {
      const cam = s.pose.position;
      const a = s.anchor;
      const t = clamp(((x - a[0]) * (cam[0] - a[0]) + (z - a[2]) * (cam[2] - a[2])) / ((cam[0] - a[0]) ** 2 + (cam[2] - a[2]) ** 2));
      const px = a[0] + (cam[0] - a[0]) * t;
      const pz = a[2] + (cam[2] - a[2]) * t;
      if (Math.hypot(x - px, z - pz) < 6 + margin) return false;
    }
    return true;
  }

  #buildDecorations() {
    const m = this.m;
    const rand = seededRandom(21);
    const scale = this.quality.decorationScale;
    const treeColors = [PALETTE.pinkBright, PALETTE.blue, PALETTE.lavenderDeep, PALETTE.yellowDeep, PALETTE.mintDeep];
    const candyColors = [PALETTE.pink, PALETTE.lavender, PALETTE.blue, '#ffd6a5'];
    let placed = 0;
    let attempts = 0;
    const trees = Math.round(30 * scale);
    while (placed < trees && attempts < 2000) {
      attempts++;
      const a = rand() * Math.PI * 2;
      const r = 8 + Math.sqrt(rand()) * (ISLAND_RADIUS - 10);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!this.#isClear(x, z, 1)) continue;
      const kind = placed % 3;
      const obj =
        kind === 0
          ? Props.createLollipopTree(m, treeColors[placed % treeColors.length], 2.6 + rand() * 1.4)
          : kind === 1
            ? Props.createCandyTree(m, candyColors[placed % candyColors.length], 2 + rand() * 1.2, placed)
            : Props.createSwirlBush(m, [PALETTE.mintMid, PALETTE.pink, PALETTE.sky][placed % 3]);
      obj.position.set(x, 0, z);
      obj.rotation.y = Math.atan2(x, z) + (rand() - 0.5) * 0.6;
      obj.scale.setScalar(0.85 + rand() * 0.4);
      this.#addStatic(obj);
      placed++;
    }

    // Giant toothpaste tubes as landmarks.
    [[-36, -24], [36, 26], [-8, 40]].forEach(([x, z], i) => {
      if (!this.#isClear(x, z)) return;
      const tube = Props.createToothpaste(m, { accent: [PALETTE.blueMid, PALETTE.pinkBright, PALETTE.mintDeep][i] });
      tube.position.set(x, 0, z);
      tube.rotation.set(0, rand() * 6, 0.1);
      tube.scale.setScalar(1.3);
      this.#addStatic(tube);
    });

    // Instanced flowers.
    const flowerCount = Math.round(320 * scale);
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), m.get('white', { roughness: 0.6 }), flowerCount);
    const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 5), m.get(PALETTE.mintDeep), flowerCount);
    const flowerColors = ['#ff9fc2', '#ffe28a', '#c8b5ff', '#ffffff', '#9fdcff'].map((c) => new THREE.Color(c));
    const dummy = new THREE.Object3D();
    let f = 0;
    attempts = 0;
    while (f < flowerCount && attempts < flowerCount * 12) {
      attempts++;
      const a = rand() * Math.PI * 2;
      const r = 4 + Math.sqrt(rand()) * (ISLAND_RADIUS - 6);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (r > ISLAND_RADIUS - 2.5 || Math.hypot(x - PLAZA.x, z - PLAZA.z) < 8) continue;
      if (this.pathSamples.some((p) => Math.hypot(x - p.x, z - p.z) < 2.2)) continue;
      dummy.position.set(x, 0.22, z);
      dummy.scale.setScalar(1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      stems.setMatrixAt(f, dummy.matrix);
      dummy.position.y = 0.48;
      dummy.scale.set(1, 0.7, 1);
      dummy.updateMatrix();
      heads.setMatrixAt(f, dummy.matrix);
      heads.setColorAt(f, flowerColors[f % flowerColors.length]);
      f++;
    }
    heads.count = stems.count = f;
    this.root.add(heads, stems);

    // Floating stars (one instanced draw call).
    const starCount = Math.round(16 * scale);
    const starMesh = new THREE.InstancedMesh(
      Props.createFloatingStar(m).geometry,
      m.get('white', { emissive: '#ffd36b', emissiveIntensity: 0.3 }),
      starCount,
    );
    starMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    starMesh.frustumCulled = false;
    const starColors = [new THREE.Color(PALETTE.yellowDeep), new THREE.Color(PALETTE.pinkBright)];
    this.stars = Array.from({ length: starCount }, (_, i) => {
      starMesh.setColorAt(i, starColors[i % 3 ? 0 : 1]);
      const a = rand() * Math.PI * 2;
      const r = 14 + rand() * 40;
      return { x: Math.cos(a) * r, y: 13 + rand() * 14, z: Math.sin(a) * r, size: 0.9 + rand() * 0.7, phase: rand() * 6 };
    });
    this.starMesh = starMesh;
    this.#add(starMesh);
  }

  /* ------------------------------------------------------- effects */

  #buildEffects() {
    const ps = this.quality.particleScale;
    this.confetti = new Confetti(this.root, { count: Math.round(480 * ps) });
    this.fireworks = new Fireworks(this.root, {
      perBurst: Math.round(110 * Math.max(0.5, ps)),
      bursts: 6,
      pixelRatio: this.pixelRatio,
      onBurst: () => this.handlers.sound?.('firework', { volume: 0.45 }),
    });
    this.bubbles = new Bubbles(this.root, { count: Math.round(60 * ps), physical: this.quality.physicalMaterials });
    this.sparkles = new Sparkles(this.root, { count: Math.round(240 * ps), pixelRatio: this.pixelRatio });
  }

  /* ------------------------------------------------------- public API */

  setPixelRatio(ratio) {
    this.fireworks?.setPixelRatio(ratio);
    this.sparkles?.setPixelRatio(ratio);
  }

  setTitleLayout(narrow) {
    this.title?.setLayout(narrow ? 'narrow' : 'wide');
  }

  setEnvelopeOpen(p) {
    this.envelope?.setOpen(clamp(p));
  }

  setGalleryReveal(p) {
    if (!this.polaroids) return;
    const n = this.polaroids.length;
    this.polaroids.forEach((pivot, i) => {
      const local = clamp((p * (n + 2) - i) / 3);
      pivot.userData.reveal = easeOutBack(local);
    });
  }

  setGather(g) {
    this.gather = clamp(g);
  }

  setFinaleActive(active) {
    if (!this.fireworks) return;
    this.fireworks.active = active && !this.reducedMotion;
  }

  raiseMailboxFlag(up = true) {
    if (!this.mailbox) return;
    gsap.to(this.mailbox.flag.rotation, { x: up ? 0 : Math.PI / 2, duration: 0.7, ease: up ? 'back.out(3)' : 'power2.out' });
    if (up) this.celebrate(6, { amount: 70 });
  }

  /** Confetti and cheering at a station. */
  celebrate(stationIndex, { amount = 160 } = {}) {
    const station = STATIONS[stationIndex];
    const origin = stationIndex === 5 ? this.cake.group.position.clone().setY(this.cake.topY + 2) : this.#place(station, 0, 3, 0);
    this.confetti?.burst(origin, { amount: this.reducedMotion ? Math.round(amount * 0.2) : amount, spread: 8, up: 9 });
    this.#cheer(this.mascot, 2.2);
    this.friends?.forEach((f) => {
      if (f.station === stationIndex || this.story > 6.5) this.#cheer(f, 2);
    });
  }

  /** Blows the candles out one after another. Resolves when all are out. */
  blowCandles({ stagger = 0.12 } = {}) {
    if (!this.cake) return Promise.resolve(false);
    const lit = this.cake.candles.map((c, i) => (c.lit > 0.5 ? i : -1)).filter((i) => i >= 0);
    if (!lit.length) return Promise.resolve(false);
    return new Promise((resolve) => {
      lit.forEach((index, k) => {
        gsap.delayedCall(k * (this.reducedMotion ? 0.02 : stagger), () => {
          this.cake.extinguish(index);
          if (k === lit.length - 1) {
            gsap.delayedCall(0.35, () => {
              this.celebrate(5, { amount: 220 });
              resolve(true);
            });
          }
        });
      });
    });
  }

  /** Extinguishes a single candle (used by microphone blowing). Returns how many remain lit. */
  blowOneCandle() {
    if (!this.cake) return 0;
    const index = this.cake.candles.findIndex((c) => c.lit > 0.5);
    if (index >= 0) this.cake.extinguish(index);
    return this.cake.litCount;
  }

  relightCandles() {
    this.cake?.relight();
  }

  highlightActivity(id) {
    const group = this.activityProps?.get(id);
    if (!group) return;
    gsap.fromTo(group.userData, { bounce: 1 }, { bounce: 0, duration: 1.4, ease: 'power2.out' });
  }

  playIntro() {
    this.title?.playIntro(gsap, { delay: 0.5 });
    gsap.delayedCall(1.2, () => {
      gsap.to(this.mascot.state, { wave: 1, duration: 0.3 });
      gsap.to(this.mascot.state, { wave: 0, duration: 0.5, delay: 2.4 });
    });
    if (!this.reducedMotion) gsap.delayedCall(1.6, () => this.confetti?.burst(new THREE.Vector3(0, 13, 38), { amount: 120, spread: 10, up: 6 }));
  }

  /** Replaces a character's procedural body with a GLB scene (normalised to ~2.1 units tall). */
  useCustomCharacter(character, object) {
    character.setCustomModel(object);
    this.#playModelAnimation(object);
  }

  /** Replaces the procedural cake tiers with a GLB, keeping the interactive candles on top. */
  useCustomCake(object) {
    if (!this.cake) return;
    this.cake.body.visible = false; // tiers, icing, stand; candles and flames stay
    object.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    this.cake.group.add(object);
    this.#playModelAnimation(object);
  }

  #playModelAnimation(object) {
    const clips = object.userData.animations;
    if (!clips?.length) return;
    this.mixers ??= [];
    const mixer = new THREE.AnimationMixer(object);
    const clip = clips.find((c) => /idle/i.test(c.name)) ?? clips[0];
    mixer.clipAction(clip).play();
    this.mixers.push(mixer);
  }

  resetForReplay() {
    this.relightCandles();
    this.raiseMailboxFlag(false);
    this.confetti?.clear();
    this.fireworks?.clear();
    this.balloons.forEach((b) => {
      if (b.popped) this.#regrow(b);
    });
  }

  /* --------------------------------------------------------------- update */

  /**
   * @param {number} t elapsed seconds
   * @param {number} dt frame delta
   * @param {{ story: number, camera: THREE.Camera, focus: THREE.Vector3 }} state
   */
  update(t, dt, { story, camera, focus }) {
    const reduced = this.reducedMotion;
    const motion = reduced ? 0 : 1;
    this.story = story;

    this.#updateMood(story, focus);

    if (this.title) {
      // 3D letters read mirrored from the far side of the island, so the title only shows near the gate.
      this.title.group.visible = story < 1.6;
      this.title.update(t, reduced);
    }
    this.clouds.rotation.y = t * 0.004 * motion;
    for (const islet of this.islets) islet.position.y = islet.userData.baseY + Math.sin(t * 0.6 + islet.userData.phase) * 0.6 * motion;
    if (this.starMesh) {
      const d = this.dummy ?? (this.dummy = new THREE.Object3D());
      this.stars.forEach((s, i) => {
        d.position.set(s.x, s.y + Math.sin(t + s.phase) * 0.5 * motion, s.z);
        d.rotation.set(0, t * 0.8 * motion + s.phase, 0);
        d.scale.setScalar(s.size);
        d.updateMatrix();
        this.starMesh.setMatrixAt(i, d.matrix);
      });
      this.starMesh.instanceMatrix.needsUpdate = true;
    }
    if (this.envelope) {
      const g = this.envelope.group;
      g.position.y = g.userData.baseY + Math.sin(t * 1.1) * 0.25 * motion;
      g.rotation.z = Math.sin(t * 0.8) * 0.03 * motion;
    }
    if (this.calendar) this.calendar.position.y = this.calendar.userData.baseY + Math.sin(t * 1.3 + 1) * 0.15 * motion;
    if (this.clock) {
      this.clock.group.position.y = this.clock.group.userData.baseY + Math.sin(t * 1.2) * 0.25 * motion;
      this.clock.secondHand.rotation.z = -Math.floor(t) * ((Math.PI * 2) / 60);
    }
    if (this.pin) {
      this.pin.position.y = this.pin.userData.baseY + Math.abs(Math.sin(t * 1.8)) * 0.6 * motion;
      this.pin.children[0].rotation.y = t * 0.6 * motion;
    }
    this.activityProps?.forEach((group) => {
      const d = group.userData;
      d.prop.position.y = d.prop.userData.baseY + (Math.sin(t * 2 + d.phase) * 0.06 * motion + d.bounce * Math.abs(Math.sin(t * 9)) * 0.6);
      const hovered = group.userData.interactive?.hovered ? 1 : 0;
      d.halo.material.opacity += ((hovered ? 0.9 : d.bounce * 0.9) - d.halo.material.opacity) * Math.min(1, dt * 8);
    });
    this.polaroids?.forEach((pivot) => {
      const d = pivot.userData;
      d.inner.rotation.y = (1 - d.reveal) * Math.PI;
      d.inner.rotation.z = Math.sin(t * 1.4 + d.phase) * 0.05 * motion;
      d.inner.scale.setScalar(0.6 + 0.4 * clamp(d.reveal, 0, 1.2));
    });
    this.cake?.update(t, dt, reduced);
    if (this.maypole) this.maypole.userData.star.rotation.y = t * 1.2;

    for (const b of this.balloons) {
      const d = b.group.userData;
      b.group.rotation.z = Math.sin(t * 1.1 + d.phase) * 0.05 * motion;
      d.balloon.position.x = Math.sin(t * 0.9 + d.phase) * 0.12 * motion;
    }

    this.#updateCharacters(t, dt, story, camera);
    this.mixers?.forEach((mixer) => mixer.update(dt));

    // Hover feedback for interactive props.
    for (const entry of this.interactives) {
      if (!entry.enabled) continue; // popped balloons are being animated by GSAP
      const target = entry.hovered ? entry.hoverScale : 1;
      const s = entry.object.scale;
      const k = Math.min(1, dt * 10);
      s.x += (entry.baseScale.x * target - s.x) * k;
      s.y += (entry.baseScale.y * target - s.y) * k;
      s.z += (entry.baseScale.z * target - s.z) * k;
    }

    this.confetti?.update(t, dt);
    if (this.fireworks) {
      const away = (focus ?? PLAZA).clone().sub(camera.position).setY(0).normalize();
      this.fireworks.update(t, dt, focus ?? PLAZA, away);
    }
    this.bubbles?.update(t, dt, reduced);
    this.sparkles?.update(t, reduced);
  }

  #updateMood(story, focus) {
    const i = clamp(Math.floor(story), 0, this.moods.length - 1);
    const j = Math.min(i + 1, this.moods.length - 1);
    const f = clamp(story - i);
    const a = this.moods[i];
    const b = this.moods[j];
    this.skyUniforms.topColor.value.copy(a.skyTop).lerp(b.skyTop, f);
    this.skyUniforms.bottomColor.value.copy(a.skyBottom).lerp(b.skyBottom, f);
    this.scene.fog.color.copy(a.fog).lerp(b.fog, f);
    this.sun.color.copy(a.sun).lerp(b.sun, f);
    this.sun.intensity = lerp(a.sunIntensity, b.sunIntensity, f);
    this.hemi.intensity = lerp(a.hemi, b.hemi, f);
    if (focus) {
      this.sun.target.position.set(focus.x, 0, focus.z);
      this.sun.position.copy(this.sun.target.position).add(this.sunOffset);
    }
  }

  #updateCharacters(t, dt, story, camera) {
    const reduced = this.reducedMotion;
    const camPos = camera.position;

    // Dr. Smiley hops from station to station alongside the camera.
    const i = clamp(Math.floor(story), 0, this.mascotSpots.length - 1);
    const j = Math.min(i + 1, this.mascotSpots.length - 1);
    const f = clamp(story - i);
    const from = this.mascotSpots[i];
    const to = this.mascotSpots[j];
    const travelling = f > 0.001 && f < 0.999 && i !== j;
    const mascot = this.mascot;
    mascot.root.position.lerpVectors(from, to, easeInOutCubic(f));
    if (travelling && !reduced) {
      const hops = Math.max(2, Math.round(from.distanceTo(to) / 7));
      mascot.root.position.y = Math.abs(Math.sin(f * Math.PI * hops)) * 1.8;
      mascot.face(to);
      mascot.state.walk = 1;
    } else {
      mascot.root.position.y = 0;
      mascot.face(camPos);
      mascot.state.walk = 0;
    }
    mascot.update(t, dt, reduced);

    // Friends wave when their station is on screen and gather at the plaza in the finale.
    const g = easeInOutCubic(this.gather);
    for (const friend of this.friends) {
      const near = Math.abs(story - friend.station) < 0.35;
      friend.state.wave += ((near ? 1 : 0) - friend.state.wave) * Math.min(1, dt * 4);
      friend.root.position.lerpVectors(friend.home, friend.gatherSpot, g);
      const moving = g > 0.001 && g < 0.999;
      if (moving && !reduced) {
        friend.root.position.y = Math.abs(Math.sin(g * Math.PI * 4)) * 2.2;
        friend.face(friend.gatherSpot);
      } else {
        friend.root.position.y = 0;
        friend.face(camPos);
      }
      friend.state.walk = moving ? 1 : 0;
      if (g >= 0.999 && friend.state.cheer < 0.5 && !gsap.isTweening(friend.state)) friend.state.hop = friend.state.cheer = 0.8;
      if (g < 0.999 && friend.state.cheer > 0 && !gsap.isTweening(friend.state)) friend.state.cheer = friend.state.hop = 0;
      friend.update(t, dt, reduced);
    }
  }
}
