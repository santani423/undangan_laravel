import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clamp, easeInOutCubic, seededRandom } from '../lib/helpers';
import { balloonGeometry, starGeometry } from './CharacterFactory';
import { PALETTE, type Materials } from './Materials';
import { mergeStatic } from './mergeStatic';
import type { Quality } from './quality';
import { blobShadowTexture, softDotTexture, stripeTexture, swirlTexture } from './textures';

/*
 * Procedural props. Each factory returns a THREE.Group (or an object with a `group` plus
 * handles for animation). Sizes are in metres-ish world units; a tooth friend is about
 * 2 units tall.
 */

/** Material for printed surfaces (cards, signs, faces): lit, with an emissive lift so text stays readable. */
export function printMaterial(texture: THREE.Texture, { transparent = false, roughness = 0.6 } = {}) {
    return new THREE.MeshStandardMaterial({
        map: texture,
        emissive: '#ffffff',
        emissiveMap: texture,
        emissiveIntensity: 0.35,
        roughness,
        transparent,
    });
}

// Textured materials shared between identical props, so static scenery can be batched.
const texturedMaterials = new Map<string, THREE.Material>();
function texturedMaterial(key: string, build: () => THREE.Material) {
    let material = texturedMaterials.get(key);
    if (!material) {
        material = build();
        texturedMaterials.set(key, material);
    }
    return material;
}

function enableShadows<T extends THREE.Object3D>(object: T, cast = true, receive = false): T {
    object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = cast;
            child.receiveShadow = receive;
        }
    });
    return object;
}

const blobMaterials = new Map<number, THREE.MeshBasicMaterial>();
export function blobShadow(size = 2, opacity = 0.7) {
    let material = blobMaterials.get(opacity);
    if (!material) {
        material = new THREE.MeshBasicMaterial({ map: blobShadowTexture(), transparent: true, opacity, depthWrite: false });
        blobMaterials.set(opacity, material);
    }
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.03;
    mesh.renderOrder = 1;
    return mesh;
}

/* ---------------------------------------------------------------- balloons */

export interface BalloonData {
    balloon: THREE.Group;
    string: THREE.Line;
    color: string;
    phase: number;
}

let balloonWithKnot: THREE.BufferGeometry | null = null;
export function createBalloon(m: Materials, color: string, { stringLength = 2.2, scale = 0.75 } = {}) {
    const group = new THREE.Group();
    const balloon = new THREE.Group();
    // Skin and knot share one geometry (one draw call per balloon); the clearcoat supplies the shine.
    balloonWithKnot ??= (() => {
        const knot = new THREE.ConeGeometry(0.12, 0.2, 10).toNonIndexed();
        knot.translate(0, -1.18, 0);
        const skin = balloonGeometry();
        return mergeGeometries([skin.index ? skin.toNonIndexed() : skin, knot]);
    })();
    balloon.add(new THREE.Mesh(balloonWithKnot, m.balloon(color)));
    balloon.scale.setScalar(scale);
    balloon.position.y = stringLength + 1.2 * scale;

    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.12, stringLength * 0.35, 0),
        new THREE.Vector3(-0.1, stringLength * 0.7, 0),
        new THREE.Vector3(0, stringLength + 0.3 * scale, 0),
    ]);
    const string = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)), new THREE.LineBasicMaterial({ color: '#b9a9ca' }));
    group.add(balloon, string);
    group.userData = { balloon, string, color, phase: Math.random() * Math.PI * 2 } satisfies BalloonData;
    return group;
}

/** Several balloons tied to one point. The balloon groups are in userData.balloons. */
export function createBalloonCluster(
    m: Materials,
    colors: string[] = [PALETTE.pinkBright, PALETTE.blue, PALETTE.yellowDeep],
    { height = 3, spread = 0.9 } = {},
) {
    const group = new THREE.Group();
    const balloons = colors.map((color, i) => {
        const b = createBalloon(m, color, { stringLength: height + (i % 2) * 0.6 });
        const angle = (i / colors.length) * Math.PI * 2;
        b.rotation.z = Math.cos(angle) * 0.22 * spread;
        b.rotation.x = Math.sin(angle) * 0.22 * spread;
        group.add(b);
        return b;
    });
    group.userData.balloons = balloons;
    return group;
}

/* ------------------------------------------------------------------- gifts */

export function createGiftBox(m: Materials, { color = PALETTE.lavender as string, ribbon = PALETTE.pinkBright as string, size = 1.2 } = {}) {
    const group = new THREE.Group();
    const s = size;
    const box = new THREE.Mesh(new RoundedBoxGeometry(s, s * 0.85, s, 3, s * 0.06), m.get(color));
    box.position.y = (s * 0.85) / 2;
    const lid = new THREE.Mesh(new RoundedBoxGeometry(s * 1.1, s * 0.22, s * 1.1, 3, s * 0.05), m.get(color));
    lid.position.y = s * 0.85 + s * 0.08;
    const r1 = new THREE.Mesh(new THREE.BoxGeometry(s * 0.2, s * 1.08, s * 1.04), m.get(ribbon));
    r1.position.y = (s * 1.08) / 2;
    const r2 = r1.clone();
    r2.rotation.y = Math.PI / 2;
    const loopGeo = new THREE.TorusGeometry(s * 0.2, s * 0.06, 8, 20);
    const bow = new THREE.Group();
    [-1, 1].forEach((side) => {
        const loop = new THREE.Mesh(loopGeo, m.get(ribbon));
        loop.position.x = side * s * 0.18;
        loop.rotation.y = Math.PI / 2;
        loop.rotation.x = side * 0.5;
        loop.scale.set(1, 1, 0.6);
        bow.add(loop);
    });
    bow.position.y = s * 1.15;
    group.add(box, lid, r1, r2, bow);
    return enableShadows(group);
}

/* ------------------------------------------------------- dental props */

export function createGiantToothbrush(m: Materials, { handle = '#ff8eb4', head = '#7bd4f2', height = 9 } = {}) {
    const group = new THREE.Group();
    const handleLen = height * 0.7;
    const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, handleLen, 6, 20), m.get(handle));
    h.position.y = handleLen / 2 + 0.5;
    const gripGeo = new THREE.TorusGeometry(0.52, 0.09, 8, 28);
    for (let i = 0; i < 3; i++) {
        const grip = new THREE.Mesh(gripGeo, m.get('white'));
        grip.rotation.x = Math.PI / 2;
        grip.position.y = 1.4 + i * 0.55;
        group.add(grip);
    }
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.8, 18), m.get(handle));
    neck.position.y = handleLen + 1.1;
    const headMesh = new THREE.Mesh(new RoundedBoxGeometry(1.35, 2.3, 0.8, 4, 0.3), m.get(head));
    headMesh.position.y = handleLen + 2.4;
    // Bristle tufts on the front face, alternating white and pale blue rows.
    const bristles = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.15, 0.5, 3, 10), m.get('white', { roughness: 0.5 }), 18);
    const dummy = new THREE.Object3D();
    const tuftColors = [new THREE.Color('#ffffff'), new THREE.Color('#bfe9f8')];
    let k = 0;
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 3; col++) {
            dummy.position.set((col - 1) * 0.38, handleLen + 1.55 + row * 0.34, 0.72);
            dummy.rotation.set(Math.PI / 2, 0, 0);
            dummy.updateMatrix();
            bristles.setMatrixAt(k, dummy.matrix);
            bristles.setColorAt(k++, tuftColors[row % 2]);
        }
    }
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.6, 28), m.get('cream'));
    plinth.position.y = 0.3;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.12, 8, 32), m.get('pinkBright'));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.6;
    group.add(h, neck, headMesh, bristles, plinth, rim);
    return enableShadows(group);
}

export function createToothpaste(m: Materials, { body = PALETTE.white as string, accent = PALETTE.blueMid as string } = {}) {
    const group = new THREE.Group();
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        pts.push(new THREE.Vector2(0.55 - Math.pow(t, 3) * 0.15, t * 2.6));
    }
    const tube = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), m.get(body));
    tube.scale.z = 0.62;
    const crimp = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.3, 0.2, 2, 0.06), m.get(accent));
    crimp.position.y = 0.05;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.5, 24, 1, true), m.get(accent));
    band.scale.z = 0.62;
    band.position.y = 1.3;
    const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 0.3, 20), m.get(body));
    shoulder.position.y = 2.75;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.4, 18), m.get('pinkBright'));
    cap.position.y = 3.05;
    // A swirl of paste coming out of the cap.
    const helix: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = t * Math.PI * 4;
        const r = 0.35 * (1 - t);
        helix.push(new THREE.Vector3(Math.cos(a) * r, 3.3 + t * 0.9, Math.sin(a) * r));
    }
    const paste = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helix), 60, 0.16, 10),
        texturedMaterial('paste', () => new THREE.MeshStandardMaterial({ map: stripeTexture(['#ffffff', '#9fe3c0'], 4), roughness: 0.35 })),
    );
    group.add(tube, crimp, band, shoulder, cap, paste);
    return enableShadows(group);
}

/* -------------------------------------------------------- scenery */

export function createLollipopTree(m: Materials, color: string = PALETTE.pinkBright, height = 3.2) {
    const group = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, height, 10), m.get('white'));
    stick.position.y = height / 2;
    const faceMat = texturedMaterial(`swirl${color}`, () => new THREE.MeshStandardMaterial({ map: swirlTexture('#ffffff', color), roughness: 0.3 }));
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.3, 40), [m.get(color), faceMat, faceMat]);
    disc.rotation.x = Math.PI / 2;
    disc.position.y = height + 0.9;
    group.add(stick, disc, blobShadow(2.6, 0.5));
    return enableShadows(group);
}

const candyTreeCache = new Map<number, THREE.BufferGeometry>();
export function createCandyTree(m: Materials, color: string = PALETTE.pink, height = 2.6, seed = 1) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, height, 10), m.get('creamDeep'));
    trunk.position.y = height / 2;
    const key = seed % 3;
    let crownGeo = candyTreeCache.get(key);
    if (!crownGeo) {
        const rand = seededRandom(seed * 77);
        const parts: THREE.BufferGeometry[] = [];
        for (let i = 0; i < 5; i++) {
            const s = new THREE.SphereGeometry(0.8 + rand() * 0.45, 16, 12);
            s.translate((rand() - 0.5) * 1.4, rand() * 0.9, (rand() - 0.5) * 1.4);
            parts.push(s);
        }
        crownGeo = mergeGeometries(parts);
        candyTreeCache.set(key, crownGeo);
    }
    const crown = new THREE.Mesh(crownGeo, m.get(color, { roughness: 0.85 }));
    crown.position.y = height + 0.6;
    group.add(trunk, crown, blobShadow(3.4, 0.5));
    return enableShadows(group);
}

export function createSwirlBush(m: Materials, color: string = PALETTE.mintMid) {
    const group = new THREE.Group();
    [0.85, 0.65, 0.45].forEach((r, i) => {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.32 - i * 0.05, 12, 28), m.get(i % 2 ? 'white' : color));
        torus.rotation.x = Math.PI / 2;
        torus.position.y = 0.3 + i * 0.42;
        group.add(torus);
    });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 16), m.get(color));
    tip.position.y = 1.65;
    group.add(tip);
    return enableShadows(group);
}

const cloudGeometries: THREE.BufferGeometry[] = [];
export function createCloud(m: Materials, variant = 0) {
    if (!cloudGeometries[variant]) {
        const rand = seededRandom(100 + variant * 13);
        const parts: THREE.BufferGeometry[] = [];
        const count = 5 + variant;
        for (let i = 0; i < count; i++) {
            const s = new THREE.SphereGeometry(1.2 + rand() * 1.4, 18, 14);
            s.translate((i - count / 2) * 1.5 + rand() * 0.6, rand() * 0.9, (rand() - 0.5) * 1.4);
            parts.push(s);
        }
        const merged = mergeGeometries(parts);
        merged.scale(1, 0.72, 0.9);
        cloudGeometries[variant] = merged;
    }
    return new THREE.Mesh(cloudGeometries[variant], m.get('white', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.18 }));
}

export function createFloatingStar(m: Materials, color: string = PALETTE.yellowDeep, size = 0.5) {
    return new THREE.Mesh(starGeometry(size, size * 0.45, size * 0.3), m.get(color, { emissive: color, emissiveIntensity: 0.35 }));
}

/* ------------------------------------------------------------- envelope */

/** Floating invitation envelope (envelope.svg in 3D) with a hinged flap and a card. setOpen(0..1) is scroll-scrubbed. */
export function createEnvelope(m: Materials, cardTexture: THREE.Texture) {
    const group = new THREE.Group();
    const W = 6;
    const H = 4;
    const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, 0.24, 4, 0.1), m.get(PALETTE.lavender));
    const pocketShape = new THREE.Shape();
    pocketShape.moveTo(-W / 2 + 0.1, -H / 2 + 0.1);
    pocketShape.lineTo(W / 2 - 0.1, -H / 2 + 0.1);
    pocketShape.lineTo(W / 2 - 0.1, H / 2 - 0.5);
    pocketShape.lineTo(0, -0.25);
    pocketShape.lineTo(-W / 2 + 0.1, H / 2 - 0.5);
    pocketShape.closePath();
    const pocket = new THREE.Mesh(
        new THREE.ExtrudeGeometry(pocketShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 2 }),
        m.get('#b9a3f7'),
    );
    pocket.position.z = 0.2;

    // Card: plain cream board plus a printed front (2 draw calls).
    const card = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, H - 0.4, 0.04), m.get('cream'));
    const print = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, H - 0.4), printMaterial(cardTexture, { roughness: 0.55 }));
    print.position.z = 0.021;
    card.add(board, print);
    card.position.z = 0.14;
    const cardHolder = new THREE.Group();
    cardHolder.add(card);

    // Flap: triangle hinged along the top edge.
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-W / 2 + 0.05, 0);
    flapShape.lineTo(W / 2 - 0.05, 0);
    flapShape.quadraticCurveTo(0.3, -2.25, 0, -2.45);
    flapShape.quadraticCurveTo(-0.3, -2.25, -W / 2 + 0.05, 0);
    const flap = new THREE.Mesh(
        new THREE.ExtrudeGeometry(flapShape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.03, bevelSegments: 2 }),
        m.get('#a38ce9'),
    );
    const seal = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32), m.get('#ff9fc2'));
    disc.rotation.x = Math.PI / 2;
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.045, 8, 20, Math.PI), m.get('white'));
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.04, 0.06);
    seal.add(disc, smile);
    seal.position.set(0, -2.05, 0.12);
    const flapPivot = new THREE.Group();
    flapPivot.position.set(0, H / 2 - 0.05, 0.32);
    flapPivot.add(flap, seal);

    group.add(body, cardHolder, pocket, flapPivot);
    enableShadows(group);

    const setOpen = (p: number) => {
        const flapP = easeInOutCubic(clamp(p / 0.45));
        // Past 180° so the open flap leans back behind the rising card.
        flapPivot.rotation.x = -Math.PI * 1.06 * flapP;
        const cardP = easeInOutCubic(clamp((p - 0.35) / 0.6));
        card.position.y = 3.5 * cardP;
        card.position.z = 0.14 + cardP * 0.5;
        card.rotation.x = -0.12 * cardP;
        cardHolder.scale.setScalar(1 + cardP * 0.06);
    };
    setOpen(0);
    return { group, setOpen };
}

/* ------------------------------------------------------ event details */

export function createCalendar(m: Materials, texture: THREE.Texture) {
    const group = new THREE.Group();
    const block = new THREE.Mesh(new RoundedBoxGeometry(4, 4.4, 0.5, 4, 0.25), m.get('cream'));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 4.1), printMaterial(texture, { transparent: true, roughness: 0.5 }));
    face.position.z = 0.26;
    const ringGeo = new THREE.TorusGeometry(0.32, 0.1, 10, 24);
    [-1, 1].forEach((s) => {
        const ring = new THREE.Mesh(ringGeo, m.get('#68bfe3'));
        ring.position.set(s * 1.0, 2.2, 0);
        group.add(ring);
    });
    group.add(block, face);
    return enableShadows(group);
}

export function createClock(m: Materials, texture: THREE.Texture, { hour = 10, minute = 10 } = {}) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.45, 48), m.get(PALETTE.lavender));
    body.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.14, 12, 48), m.get(PALETTE.lavenderDeep));
    rim.position.z = 0.22;
    const face = new THREE.Mesh(new THREE.CircleGeometry(1.36, 48), printMaterial(texture, { roughness: 0.5 }));
    face.position.z = 0.235;
    const hand = (len: number, width: number, color: string) => {
        const pivot = new THREE.Group();
        const mesh = new THREE.Mesh(new RoundedBoxGeometry(width, len, 0.05, 2, width / 2.5), m.get(color));
        mesh.position.y = len / 2 - 0.1;
        pivot.add(mesh);
        pivot.position.z = 0.28;
        return pivot;
    };
    const hourHand = hand(0.75, 0.14, 'ink');
    const minuteHand = hand(1.05, 0.1, 'ink');
    const secondHand = hand(1.15, 0.04, PALETTE.rose);
    hourHand.rotation.z = -(((hour % 12) + minute / 60) / 12) * Math.PI * 2;
    minuteHand.rotation.z = -(minute / 60) * Math.PI * 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16), m.get(PALETTE.rose));
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.33;
    const bellGeo = new THREE.SphereGeometry(0.45, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    [-1, 1].forEach((s) => {
        const bell = new THREE.Mesh(bellGeo, m.get('yellowDeep'));
        bell.position.set(s * 0.95, 1.35, 0);
        bell.rotation.z = -s * 0.5;
        group.add(bell);
    });
    group.add(body, rim, face, hourHand, minuteHand, secondHand, hub);
    enableShadows(group);
    return { group, secondHand };
}

export function createLocationPin(m: Materials) {
    const group = new THREE.Group();
    // Profile of a map pin (location-pin.svg): a point tapering up into a round head.
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        profile.push(new THREE.Vector2(Math.max(0.001, Math.sin((t * Math.PI) / 2) * 0.77), t * 1.556));
    }
    for (let i = 1; i <= 16; i++) {
        const a = -0.7 + (i / 16) * (Math.PI / 2 + 0.7);
        profile.push(new THREE.Vector2(Math.max(0.001, Math.cos(a)), 2.2 + Math.sin(a)));
    }
    const pin = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), m.get('#ff789f'));
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 28), m.get('cream'));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 2.2, 0.97);
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24), m.get('#72c9ec'));
    dot.rotation.x = Math.PI / 2;
    dot.position.set(0, 2.2, 1.01);
    group.add(pin, ring, dot);
    return enableShadows(group);
}

/* -------------------------------------------------------------- playground */

export function createPedestal(m: Materials, color: string = PALETTE.mint) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 0.45, 36), m.get('cream'));
    base.position.y = 0.225;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 0.08, 36), m.get(color));
    top.position.y = 0.48;
    const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.07, 8, 48),
        new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }),
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.55;
    group.add(base, top, halo);
    enableShadows(group, true, true);
    return { group, halo };
}

export function createToyBlocks(m: Materials) {
    const group = new THREE.Group();
    const geo = new RoundedBoxGeometry(0.9, 0.9, 0.9, 3, 0.12);
    (
        [
            [PALETTE.pinkBright, -0.5, 0.45, 0, 0.1],
            [PALETTE.blue, 0.5, 0.45, 0.1, -0.15],
            [PALETTE.yellowDeep, 0, 1.35, 0.05, 0.3],
        ] as const
    ).forEach(([color, x, y, z, ry]) => {
        const block = new THREE.Mesh(geo, m.get(color));
        block.position.set(x, y, z);
        block.rotation.y = ry;
        group.add(block);
    });
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 24, 16),
        texturedMaterial('ball', () => new THREE.MeshStandardMaterial({ map: stripeTexture(['#ffffff', PALETTE.mintDeep], 3), roughness: 0.3 })),
    );
    ball.position.set(1.05, 0.42, 0.6);
    group.add(ball);
    return enableShadows(group);
}

export function createPhotoCamera(m: Materials) {
    const group = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    for (let i = 0; i < 3; i++) {
        const leg = new THREE.Mesh(legGeo, m.get('woodDeep'));
        const a = (i / 3) * Math.PI * 2;
        leg.position.set(Math.cos(a) * 0.35, 0.95, Math.sin(a) * 0.35);
        leg.rotation.set(Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2);
        group.add(leg);
    }
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.0, 0.75, 3, 0.18), m.get(PALETTE.lavender));
    body.position.y = 2.35;
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.4, 28), m.get('cream'));
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 2.32, 0.5);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.24, 24), m.get('ink'));
    glass.position.set(0, 2.32, 0.705);
    const flash = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.22, 0.25, 2, 0.05), m.get('white'));
    flash.position.set(-0.4, 2.95, 0);
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 16), m.get(PALETTE.pinkBright));
    button.position.set(0.45, 2.9, 0);
    group.add(body, lens, glass, flash, button);
    return enableShadows(group);
}

export function createSmallCake(m: Materials) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.7, 32), m.get('#ffb5d0'));
    base.position.y = 0.35;
    const icing = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.14, 32), m.get('icing'));
    icing.position.y = 0.72;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 32), m.get('#91ddf4'));
    top.position.y = 1.03;
    const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), m.get(PALETTE.rose));
    cherry.position.y = 1.42;
    group.add(base, icing, top, cherry);
    return enableShadows(group);
}

/* ---------------------------------------------------------------- gallery */

export function createPolaroid(m: Materials, texture: THREE.Texture) {
    const group = new THREE.Group();
    const card = new THREE.Group();
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.75, 0.05), m.get('white'));
    const print = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.75), printMaterial(texture));
    print.position.z = 0.026;
    card.add(board, print);
    card.position.y = -1.45;
    const peg = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.5, 0.18, 2, 0.05), m.get('wood'));
    peg.position.set(0, -0.12, 0.05);
    group.add(card, peg);
    return enableShadows(group);
}

export function createPole(m: Materials, height = 7, colors: [string, string] = ['#ffffff', PALETTE.pinkBright]) {
    const group = new THREE.Group();
    const poleMat = texturedMaterial(`pole${colors.join()}${height}`, () => {
        const tex = stripeTexture(colors, 4);
        tex.repeat.set(1, height / 1.2);
        return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
    });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, height, 16), poleMat);
    pole.position.y = height / 2;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), m.get(PALETTE.yellowDeep));
    ball.position.y = height + 0.3;
    group.add(pole, ball);
    return enableShadows(group);
}

/* ------------------------------------------------------------------ cake */

function tierGeometry(radius: number, height: number) {
    const bevel = Math.min(0.18, height * 0.2);
    const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(radius, 0), new THREE.Vector2(radius, height - bevel)];
    for (let i = 1; i <= 6; i++) {
        const a = (i / 6) * (Math.PI / 2);
        pts.push(new THREE.Vector2(radius - bevel + Math.cos(a) * bevel, height - bevel + Math.sin(a) * bevel));
    }
    pts.push(new THREE.Vector2(0.001, height));
    return new THREE.LatheGeometry(pts, 64);
}

function icingDripGeometry(radius: number, seed: number) {
    const rand = seededRandom(seed);
    const phases = [rand() * 6, rand() * 6];
    const g = new THREE.CylinderGeometry(radius, radius, 1, 96, 6, true);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const f = 0.5 - pos.getY(i); // 0 at the top edge, 1 at the bottom edge
        const a = Math.atan2(pos.getZ(i), pos.getX(i));
        const drip = 0.32 * Math.pow(Math.max(0, Math.sin(a * 7 + phases[0])), 4) + 0.14 * Math.pow(Math.max(0, Math.sin(a * 13 + phases[1])), 6);
        pos.setY(i, -f * (0.14 + drip));
    }
    g.computeVertexNormals();
    return g;
}

interface Candle {
    group: THREE.Group;
    flame: THREE.Group;
    lit: number;
    scale: number;
    phase: number;
}

export type Cake = ReturnType<typeof createCake>;

/**
 * Stylised three-tier birthday cake (birthday-cake.svg in 3D) with `candleCount` candles.
 * Returns handles to blow out / relight the candles.
 */
export function createCake(m: Materials, { candleCount = 5, quality }: { candleCount?: number; quality: Quality }) {
    const group = new THREE.Group();
    // Static parts are collected here and merged into a handful of meshes at the end.
    const body = new THREE.Group();
    const sticks = new THREE.Group();
    group.add(body, sticks);
    const tiers = [
        { r: 2.0, h: 1.2, color: '#ffb5d0' },
        { r: 1.45, h: 1.0, color: '#91ddf4' },
        { r: 0.95, h: 0.85, color: '#fff0f6' },
    ];
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.25, 0.16, 48), m.get('white'));
    stand.position.y = 0.08;
    body.add(stand);
    let y = 0.16;
    const rand = seededRandom(5);
    const sprinkleColors = [PALETTE.pinkBright, PALETTE.blue, PALETTE.yellowDeep, PALETTE.mintDeep, PALETTE.lavenderDeep].map(
        (c) => new THREE.Color(c),
    );
    const sprinkleCount = Math.round(150 * (quality.particleScale > 0.5 ? 1 : 0.6));
    const sprinkles = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.025, 0.08, 2, 6), m.get('white'), sprinkleCount);
    const dotGeo = new THREE.SphereGeometry(0.09, 10, 8);
    const dummy = new THREE.Object3D();
    let sprinkleIndex = 0;

    tiers.forEach((tier, index) => {
        const tierMesh = new THREE.Mesh(tierGeometry(tier.r, tier.h), m.get(tier.color, { roughness: 0.45 }));
        tierMesh.position.y = y;
        const drip = new THREE.Mesh(icingDripGeometry(tier.r + 0.035, 11 + index), m.get('icing', { side: THREE.DoubleSide }));
        drip.position.y = y + tier.h + 0.01;
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(tier.r + 0.035, tier.r + 0.035, 0.06, 64), m.get('icing', { side: THREE.DoubleSide }));
        cap.position.y = y + tier.h;
        // Piped border along the base of each tier.
        const beads = new THREE.InstancedMesh(dotGeo, m.get(index === 1 ? 'white' : '#ff86b4'), Math.round(tier.r * 18));
        for (let i = 0; i < beads.count; i++) {
            const a = (i / beads.count) * Math.PI * 2;
            dummy.position.set(Math.cos(a) * (tier.r + 0.02), y + 0.08, Math.sin(a) * (tier.r + 0.02));
            dummy.rotation.set(0, 0, 0);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            beads.setMatrixAt(i, dummy.matrix);
        }
        body.add(tierMesh, drip, cap, beads);

        // Sprinkles on the exposed top ring of each tier.
        const inner = tiers[index + 1]?.r ?? 0.35;
        const share = Math.floor(sprinkleCount / tiers.length);
        for (let i = 0; i < share && sprinkleIndex < sprinkleCount; i++) {
            const a = rand() * Math.PI * 2;
            const rr = inner + 0.1 + rand() * (tier.r - inner - 0.15);
            dummy.position.set(Math.cos(a) * rr, y + tier.h + 0.05, Math.sin(a) * rr);
            dummy.rotation.set(Math.PI / 2, rand() * Math.PI, rand() * Math.PI);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            sprinkles.setMatrixAt(sprinkleIndex, dummy.matrix);
            sprinkles.setColorAt(sprinkleIndex, sprinkleColors[Math.floor(rand() * sprinkleColors.length)]);
            sprinkleIndex++;
        }
        y += tier.h;
    });
    sprinkles.count = sprinkleIndex;
    body.add(sprinkles);

    // Candy dots on the bottom tier, as in the SVG.
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const dot = new THREE.Mesh(dotGeo, m.get('#ff7da8'));
        dot.scale.setScalar(1.4);
        dot.position.set(Math.cos(a) * 2.02, 0.16 + 0.45 + (i % 2) * 0.25, Math.sin(a) * 2.02);
        body.add(dot);
    }

    // Candles
    const topY = y;
    const count = clamp(Math.round(candleCount), 1, 12);
    const candleMat = new THREE.MeshStandardMaterial({ map: stripeTexture(['#ffffff', '#55b9dc'], 3), roughness: 0.4 });
    const candleGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.7, 14);
    const flameGeo = new THREE.SphereGeometry(0.09, 14, 10);
    const glowMat = new THREE.SpriteMaterial({
        map: softDotTexture(),
        color: '#ffb347',
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const candles: Candle[] = [];
    for (let i = 0; i < count; i++) {
        const candle = new THREE.Group();
        const a = (i / count) * Math.PI * 2;
        const r = count === 1 ? 0 : 0.58;
        candle.position.set(Math.cos(a) * r, topY, Math.sin(a) * r);
        const stick = new THREE.Mesh(candleGeo, candleMat);
        stick.position.copy(candle.position).setY(topY + 0.35);
        const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), m.get('ink'));
        wick.position.copy(candle.position).setY(topY + 0.75);
        sticks.add(stick, wick);
        const flame = new THREE.Group();
        const outer = new THREE.Mesh(flameGeo, m.get('flame', { color: '#ffb347' }));
        outer.scale.set(1, 2, 1);
        const innerFlame = new THREE.Mesh(flameGeo, m.get('flame', { color: '#fff4c2' }));
        innerFlame.scale.set(0.55, 1.2, 0.55);
        innerFlame.position.y = -0.03;
        const glow = new THREE.Sprite(glowMat);
        glow.scale.setScalar(0.75);
        flame.add(outer, innerFlame, glow);
        flame.position.y = 0.9;
        candle.add(flame);
        group.add(candle);
        candles.push({ group: candle, flame, lit: 1, scale: 1, phase: rand() * 10 });
    }

    const light = new THREE.PointLight('#ffb35c', 0, 9, 1.6);
    light.position.set(0, topY + 1.4, 0);
    group.add(light);

    // Smoke puffs for blown-out candles.
    const smokeMat = new THREE.SpriteMaterial({ map: softDotTexture(), color: '#ffffff', transparent: true, opacity: 0, depthWrite: false });
    const smoke = Array.from({ length: count * 2 }, () => {
        const sprite = new THREE.Sprite(smokeMat.clone());
        sprite.visible = false;
        group.add(sprite);
        return { sprite, life: 0 };
    });

    enableShadows(stand, false, true);
    group.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (mesh.isMesh && mesh !== stand && !(mesh.material as THREE.Material).transparent) mesh.castShadow = true;
    });
    mergeStatic(body);
    mergeStatic(sticks);

    const puff = (position: THREE.Vector3) => {
        const slot = smoke.find((s) => s.life <= 0) ?? smoke[0];
        slot.life = 1;
        slot.sprite.position.copy(position);
        slot.sprite.visible = true;
    };

    return {
        group,
        candles,
        topY,
        get litCount() {
            return candles.filter((c) => c.lit > 0.5).length;
        },
        extinguish(index: number) {
            const candle = candles[index];
            if (!candle || candle.lit <= 0.5) return false;
            candle.lit = 0;
            puff(candle.group.position.clone().add(new THREE.Vector3(0, 1.0, 0)));
            return true;
        },
        relight() {
            candles.forEach((c) => (c.lit = 1));
        },
        update(t: number, dt: number, reducedMotion: boolean) {
            let lit = 0;
            for (const c of candles) {
                c.scale += (c.lit - c.scale) * Math.min(1, dt * (c.lit > 0.5 ? 6 : 14));
                const flicker = reducedMotion ? 1 : 1 + Math.sin(t * 18 + c.phase) * 0.08 + Math.sin(t * 31 + c.phase * 2) * 0.05;
                c.flame.scale.set(c.scale, c.scale * flicker, c.scale);
                c.flame.visible = c.scale > 0.02;
                if (!reducedMotion) c.flame.rotation.z = Math.sin(t * 7 + c.phase) * 0.08;
                lit += c.scale;
            }
            light.intensity = (lit / candles.length) * (reducedMotion ? 4 : 4 + Math.sin(t * 14) * 0.5) * (quality.shadows ? 1 : 0.8);
            for (const s of smoke) {
                if (s.life <= 0) continue;
                s.life -= dt * 0.7;
                s.sprite.position.y += dt * 0.8;
                s.sprite.scale.setScalar(0.3 + (1 - s.life) * 0.9);
                s.sprite.material.opacity = Math.max(0, s.life * 0.55);
                if (s.life <= 0) s.sprite.visible = false;
            }
        },
    };
}

export function createRoundTable(m: Materials) {
    const group = new THREE.Group();
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector2(2.75 + Math.pow(1 - t, 2) * 0.35, 1.2 * t));
    }
    const tex = stripeTexture(['#ffffff', '#ffd3e2'], 8);
    tex.repeat.set(6, 1);
    const cloth = new THREE.Mesh(
        new THREE.LatheGeometry(pts, 48),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide }),
    );
    const top = new THREE.Mesh(new THREE.CylinderGeometry(2.78, 2.78, 0.1, 48), m.get('white'));
    top.position.y = 1.22;
    group.add(cloth, top);
    return enableShadows(group, true, true);
}

/* ------------------------------------------------------------------- RSVP */

export function createSignBoard(m: Materials, texture: THREE.Texture, { width = 5.2, height = 3.2 } = {}) {
    const group = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.16, 0.18, height + 2.2, 12);
    [-1, 1].forEach((s) => {
        const post = new THREE.Mesh(postGeo, m.get('woodDeep'));
        post.position.set(s * (width / 2 - 0.35), (height + 2.2) / 2, -0.15);
        group.add(post);
    });
    const board = new THREE.Mesh(new RoundedBoxGeometry(width, height, 0.25, 3, 0.12), m.get('wood'));
    board.position.y = 2.2 + height / 2 - 0.2;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.35, height - 0.35), printMaterial(texture));
    face.position.set(0, board.position.y, 0.13);
    group.add(board, face);
    return enableShadows(group);
}

export function createMailbox(m: Materials) {
    const group = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.2, 10), m.get('woodDeep'));
    post.position.y = 1.1;
    const box = new THREE.Group();
    const lower = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.8, 1.7, 3, 0.08), m.get(PALETTE.blueMid));
    const roofGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.7, 24, 1, false, 0, Math.PI);
    roofGeo.rotateX(Math.PI / 2); // axis along Z (the length of the box)
    roofGeo.rotateZ(Math.PI / 2); // half-cylinder dome facing up
    const roof = new THREE.Mesh(roofGeo, m.get(PALETTE.blueMid));
    roof.position.y = 0.4;
    const door = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24, 0, Math.PI), m.get(PALETTE.blueDeep));
    door.position.set(0, 0.42, 0.86);
    const doorLow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), m.get(PALETTE.blueDeep));
    doorLow.position.set(0, 0.03, 0.86);
    const heart = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), m.get(PALETTE.pinkBright));
    heart.position.set(0, 0.25, 0.87);
    box.add(lower, roof, door, doorLow, heart);
    box.position.y = 2.6;
    const flag = new THREE.Group();
    const flagPole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), m.get(PALETTE.rose));
    flagPole.position.y = 0.45;
    const flagSheet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.45), m.get(PALETTE.rose));
    flagSheet.position.set(0, 0.78, 0.2);
    flag.add(flagPole, flagSheet);
    flag.position.set(0.6, 2.4, 0.3);
    flag.rotation.x = Math.PI / 2; // lowered
    group.add(post, box, flag);
    enableShadows(group);
    return { group, flag };
}

/* -------------------------------------------------------------- bunting */

export function createBunting(
    m: Materials,
    from: THREE.Vector3,
    to: THREE.Vector3,
    {
        sag = 1.2,
        flags = 9,
        colors = [PALETTE.pinkBright, PALETTE.yellowDeep, PALETTE.blue, PALETTE.mintDeep, PALETTE.lavenderDeep] as string[],
    } = {},
) {
    const group = new THREE.Group();
    const mid = from.clone().lerp(to, 0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: '#ffffff' })));
    const flagShape = new THREE.Shape();
    flagShape.moveTo(-0.32, 0);
    flagShape.lineTo(0.32, 0);
    flagShape.lineTo(0, -0.62);
    flagShape.closePath();
    const flagGeo = new THREE.ShapeGeometry(flagShape);
    for (let i = 1; i <= flags; i++) {
        const t = i / (flags + 1);
        const flag = new THREE.Mesh(flagGeo, m.get(colors[i % colors.length], { side: THREE.DoubleSide }));
        flag.position.copy(curve.getPoint(t));
        const tangent = curve.getTangent(t);
        flag.rotation.y = Math.atan2(-tangent.z, tangent.x);
        group.add(flag);
    }
    return group;
}

export function createMaypole(m: Materials) {
    const group = new THREE.Group();
    group.add(createPole(m, 6.5, ['#ffffff', PALETTE.blue]));
    const star = createFloatingStar(m, PALETTE.yellowDeep, 0.6);
    star.position.y = 7.4;
    group.add(star);
    const colors = [PALETTE.pinkBright, PALETTE.yellowDeep, PALETTE.blue, PALETTE.mintDeep, PALETTE.lavenderDeep, PALETTE.rose];
    const balloons: THREE.Group[] = [];
    colors.forEach((color, i) => {
        const a = (i / colors.length) * Math.PI * 2;
        const end = new THREE.Vector3(Math.cos(a) * 5, 0.25, Math.sin(a) * 5);
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 6.3, 0),
            new THREE.Vector3(Math.cos(a) * 2.8, 2.2, Math.sin(a) * 2.8),
            end,
        );
        group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.045, 6), m.get(color)));
        const peg = createBalloon(m, color, { stringLength: 1.3, scale: 0.45 });
        peg.position.copy(end);
        group.add(peg);
        balloons.push(peg);
    });
    enableShadows(group);
    return { group, star, balloons };
}

export function createPlaza(m: Materials) {
    const group = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 0.12, 64), m.get('#fff3d6'));
    disc.position.y = 0.06;
    disc.receiveShadow = true;
    group.add(disc);
    const dotGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16);
    const colors = [PALETTE.pinkBright, PALETTE.blue, PALETTE.yellowDeep, PALETTE.mintDeep];
    for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        const dot = new THREE.Mesh(dotGeo, m.get(colors[i % colors.length]));
        dot.position.set(Math.cos(a) * 6.9, 0.1, Math.sin(a) * 6.9);
        dot.receiveShadow = true;
        group.add(dot);
    }
    return group;
}

/* -------------------------------------------------------------- gate */

/** Entrance gate: two giant toothbrush pillars joined by a striped toothpaste arch. */
export function createGate(m: Materials) {
    const group = new THREE.Group();
    const left = createGiantToothbrush(m, { handle: '#ff8eb4', head: '#7bd4f2' });
    left.position.x = -6.6;
    const right = createGiantToothbrush(m, { handle: '#7bd4f2', head: '#ff8eb4' });
    right.position.x = 6.6;
    const arc = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6.6, 9.4, 0.1),
        new THREE.Vector3(-4.4, 11.6, 0.1),
        new THREE.Vector3(0, 12.5, 0.1),
        new THREE.Vector3(4.4, 11.6, 0.1),
        new THREE.Vector3(6.6, 9.4, 0.1),
    ]);
    const tex = stripeTexture(['#ffffff', '#9fe3c0'], 4);
    tex.repeat.set(14, 1);
    const paste = new THREE.Mesh(new THREE.TubeGeometry(arc, 80, 0.48, 14), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }));
    paste.castShadow = true;
    const bunting = createBunting(m, new THREE.Vector3(-6.1, 7.6, 0.6), new THREE.Vector3(6.1, 7.6, 0.6), { sag: 1.4, flags: 11 });
    group.add(left, right, paste, bunting);
    return group;
}

/** Forgets the shared prop geometries/materials (the ones in use are disposed with the scene). */
export function clearPropCaches() {
    texturedMaterials.clear();
    blobMaterials.clear();
    candyTreeCache.clear();
    cloudGeometries.length = 0;
    balloonWithKnot = null;
}
