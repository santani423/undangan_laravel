import * as THREE from 'three';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { canvasTexture, DISPLAY_FONT, fitText } from './textures.js';

/*
 * The hero's 3D title, built letter by letter from Fredoka Bold so each glyph can
 * bounce independently. Two layouts are prepared (2 lines for wide screens, 3 for
 * portrait) and swapped on resize.
 */

export async function loadTitleFont(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Title font request failed (HTTP ${res.status})`);
  return new Font(await res.json());
}

/** Splits words into `lines` lines, minimising the longest line. */
export function balanceLines(text, lines) {
  const words = String(text).trim().split(/\s+/);
  if (lines <= 1 || words.length <= 1) return [words.join(' ')];
  const n = Math.min(lines, words.length);
  let best = null;
  const search = (start, remaining, acc) => {
    if (remaining === 1) {
      const result = [...acc, words.slice(start).join(' ')];
      const longest = Math.max(...result.map((l) => l.length));
      // Ties prefer longer earlier lines, which reads more naturally for titles.
      if (!best || longest < best.longest || (longest === best.longest && result[0].length > best.lines[0].length)) {
        best = { longest, lines: result };
      }
      return;
    }
    for (let end = start + 1; end <= words.length - (remaining - 1); end++) {
      search(end, remaining - 1, [...acc, words.slice(start, end).join(' ')]);
    }
  };
  search(0, n, []);
  return best.lines;
}

const LINE_STYLES = [
  { front: '#55b9dc', side: '#2d94c6' },
  { front: '#ff8fb7', side: '#e46d99' },
  { front: '#b49cff', side: '#8a6fe0' },
];

export class TitleText {
  constructor(font, text, { size = 1.7, depth = 0.55, lineHeight = 2.25 } = {}) {
    this.font = font;
    this.size = size;
    this.depth = depth;
    this.lineHeight = lineHeight;
    this.group = new THREE.Group();
    this.geometryCache = new Map();
    // One material for every letter: front and side colours are baked into vertex colours,
    // so each glyph is a single draw call.
    this.material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0 });
    this.styles = LINE_STYLES.map((s) => ({ front: new THREE.Color(s.front), side: new THREE.Color(s.side) }));
    this.layouts = {
      wide: this.#build(balanceLines(text, 2)),
      narrow: this.#build(balanceLines(text, 3)),
    };
    this.group.add(this.layouts.wide.group, this.layouts.narrow.group);
    this.setLayout('wide');
  }

  #glyph(char, styleIndex) {
    const key = `${char}|${styleIndex}`;
    if (!this.geometryCache.has(key)) {
      const geo = new TextGeometry(char, {
        font: this.font,
        size: this.size,
        depth: this.depth,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.07,
        bevelSize: 0.045,
        bevelSegments: 2,
      });
      // Group 0 = front/back caps, group 1 = sides (ExtrudeGeometry convention).
      const style = this.styles[styleIndex];
      const count = geo.attributes.position.count;
      const colors = new Float32Array(count * 3);
      for (const group of geo.groups) {
        const c = group.materialIndex === 0 ? style.front : style.side;
        for (let i = group.start; i < Math.min(count, group.start + group.count); i++) colors.set([c.r, c.g, c.b], i * 3);
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.clearGroups();
      geo.computeBoundingBox();
      // Read the centre before translating: translate() recomputes boundingBox in place.
      const centerX = (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2;
      // Pivot each glyph at its bottom centre so it can squash and hop in place.
      geo.translate(-centerX, 0, -this.depth / 2);
      geo.userData.offsetX = centerX;
      this.geometryCache.set(key, geo);
    }
    return this.geometryCache.get(key);
  }

  #build(lines) {
    const group = new THREE.Group();
    const letters = [];
    const scale = this.size / this.font.data.resolution;
    let widest = 0;
    lines.forEach((line, lineIndex) => {
      const lineGroup = new THREE.Group();
      const styleIndex = lineIndex % this.styles.length;
      let x = 0;
      const lineLetters = [];
      for (const char of line) {
        const glyph = this.font.data.glyphs[char] ?? this.font.data.glyphs['?'];
        const advance = (glyph?.ha ?? this.font.data.resolution * 0.5) * scale;
        if (char.trim()) {
          const geo = this.#glyph(char, styleIndex);
          const mesh = new THREE.Mesh(geo, this.material);
          const pivot = new THREE.Group();
          pivot.position.x = x + geo.userData.offsetX;
          pivot.add(mesh);
          lineGroup.add(pivot);
          lineLetters.push(pivot);
        }
        x += advance;
      }
      lineLetters.forEach((p) => (p.position.x -= x / 2));
      lineGroup.position.y = (lines.length - 1 - lineIndex) * this.lineHeight;
      widest = Math.max(widest, x);
      group.add(lineGroup);
      letters.push(...lineLetters);
    });
    letters.forEach((pivot, i) => {
      pivot.userData.baseY = 0;
      pivot.userData.index = i;
    });
    return { group, letters, width: widest, height: (lines.length - 1) * this.lineHeight + this.size * 1.1 };
  }

  setLayout(name) {
    this.layoutName = name;
    this.layouts.wide.group.visible = name === 'wide';
    this.layouts.narrow.group.visible = name === 'narrow';
    this.current = this.layouts[name];
  }

  /** Letters drop in one after another. */
  playIntro(gsap, { delay = 0 } = {}) {
    for (const layout of Object.values(this.layouts)) {
      layout.letters.forEach((pivot, i) => {
        gsap.killTweensOf([pivot.position, pivot.rotation, pivot.scale]);
        gsap.fromTo(pivot.position, { y: 9 }, { y: 0, duration: 1.1, delay: delay + i * 0.045, ease: 'bounce.out' });
        gsap.fromTo(pivot.rotation, { z: (i % 2 ? 1 : -1) * 0.6 }, { z: 0, duration: 1.2, delay: delay + i * 0.045, ease: 'back.out(2)' });
      });
    }
  }

  update(t, reducedMotion) {
    if (reducedMotion) return;
    for (const pivot of this.current.letters) {
      const i = pivot.userData.index;
      pivot.children[0].position.y = Math.max(0, Math.sin(t * 2.4 - i * 0.42)) * 0.16;
    }
  }
}

/** Fallback when the font can't load: the title painted on a floating rounded sign. */
export function createTitleSign(text) {
  const texture = canvasTexture(1400, 420, (ctx, w, h) => {
    ctx.fillStyle = '#fff8ef';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 80);
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ff9fc2';
    ctx.stroke();
    const size = fitText(ctx, text, w - 140, 150, 700, DISPLAY_FONT);
    ctx.fillStyle = '#2d94c6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${size}px ${DISPLAY_FONT}`;
    ctx.fillText(text, w / 2, h / 2 + 6);
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.2), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  return mesh;
}
