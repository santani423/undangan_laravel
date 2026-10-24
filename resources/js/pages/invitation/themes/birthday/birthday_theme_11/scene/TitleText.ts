import type { gsap as GSAP } from 'gsap';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js';
import { canvasTexture, DISPLAY_FONT, fitText } from './textures';

/*
 * The hero's 3D title, built letter by letter from Fredoka Bold so each glyph can bounce
 * independently. Two layouts are prepared (2 lines for wide screens, 3 for portrait) and
 * swapped on resize.
 */

export async function loadTitleFont(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Title font request failed (HTTP ${res.status})`);
    return new Font((await res.json()) as FontData);
}

/** Splits words into `lines` lines, minimising the longest line. */
export function balanceLines(text: string, lines: number): string[] {
    const words = String(text).trim().split(/\s+/);
    if (lines <= 1 || words.length <= 1) return [words.join(' ')];
    const n = Math.min(lines, words.length);
    let best: { longest: number; lines: string[] } | null = null;
    const search = (start: number, remaining: number, acc: string[]) => {
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
    return best!.lines;
}

const LINE_STYLES = [
    { front: '#55b9dc', side: '#2d94c6' },
    { front: '#ff8fb7', side: '#e46d99' },
    { front: '#b49cff', side: '#8a6fe0' },
];

interface Layout {
    group: THREE.Group;
    letters: THREE.Group[];
}

interface FontGlyphs {
    resolution: number;
    glyphs: Record<string, { ha: number } | undefined>;
}

export class TitleText {
    readonly group = new THREE.Group();
    private geometryCache = new Map<string, THREE.BufferGeometry>();
    // One material for every letter: front and side colours are baked into vertex colours,
    // so each glyph is a single draw call.
    private material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, metalness: 0 });
    private styles = LINE_STYLES.map((s) => ({ front: new THREE.Color(s.front), side: new THREE.Color(s.side) }));
    private layouts: { wide: Layout; narrow: Layout };
    private current: Layout;

    constructor(
        private font: Font,
        text: string,
        private size = 1.7,
        private depth = 0.55,
        private lineHeight = 2.25,
    ) {
        this.layouts = { wide: this.build(balanceLines(text, 2)), narrow: this.build(balanceLines(text, 3)) };
        this.group.add(this.layouts.wide.group, this.layouts.narrow.group);
        this.current = this.layouts.wide;
        this.setLayout('wide');
    }

    private get data() {
        return this.font.data as unknown as FontGlyphs;
    }

    private glyph(char: string, styleIndex: number) {
        const key = `${char}|${styleIndex}`;
        let geo = this.geometryCache.get(key);
        if (!geo) {
            geo = new TextGeometry(char, {
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
            const centerX = (geo.boundingBox!.min.x + geo.boundingBox!.max.x) / 2;
            // Pivot each glyph at its bottom centre so it can squash and hop in place.
            geo.translate(-centerX, 0, -this.depth / 2);
            geo.userData.offsetX = centerX;
            this.geometryCache.set(key, geo);
        }
        return geo;
    }

    private build(lines: string[]): Layout {
        const group = new THREE.Group();
        const letters: THREE.Group[] = [];
        const scale = this.size / this.data.resolution;
        lines.forEach((line, lineIndex) => {
            const lineGroup = new THREE.Group();
            const styleIndex = lineIndex % this.styles.length;
            let x = 0;
            const lineLetters: THREE.Group[] = [];
            for (const char of line) {
                const glyph = this.data.glyphs[char] ?? this.data.glyphs['?'];
                const advance = (glyph?.ha ?? this.data.resolution * 0.5) * scale;
                if (char.trim()) {
                    const geo = this.glyph(char, styleIndex);
                    const pivot = new THREE.Group();
                    pivot.position.x = x + (geo.userData.offsetX as number);
                    pivot.add(new THREE.Mesh(geo, this.material));
                    lineGroup.add(pivot);
                    lineLetters.push(pivot);
                }
                x += advance;
            }
            lineLetters.forEach((p) => (p.position.x -= x / 2));
            lineGroup.position.y = (lines.length - 1 - lineIndex) * this.lineHeight;
            group.add(lineGroup);
            letters.push(...lineLetters);
        });
        letters.forEach((pivot, i) => (pivot.userData.index = i));
        return { group, letters };
    }

    setLayout(name: 'wide' | 'narrow') {
        this.layouts.wide.group.visible = name === 'wide';
        this.layouts.narrow.group.visible = name === 'narrow';
        this.current = this.layouts[name];
    }

    /** Letters drop in one after another. */
    playIntro(gsap: typeof GSAP, { delay = 0 } = {}) {
        for (const layout of Object.values(this.layouts)) {
            layout.letters.forEach((pivot, i) => {
                gsap.killTweensOf([pivot.position, pivot.rotation]);
                gsap.fromTo(pivot.position, { y: 9 }, { y: 0, duration: 1.1, delay: delay + i * 0.045, ease: 'bounce.out' });
                gsap.fromTo(pivot.rotation, { z: (i % 2 ? 1 : -1) * 0.6 }, { z: 0, duration: 1.2, delay: delay + i * 0.045, ease: 'back.out(2)' });
            });
        }
    }

    /** Tweens target the letters' transforms; called when the world is torn down. */
    tweenTargets() {
        return Object.values(this.layouts).flatMap((l) => l.letters.flatMap((p) => [p.position, p.rotation]));
    }

    update(t: number, reducedMotion: boolean) {
        if (reducedMotion) return;
        for (const pivot of this.current.letters) {
            pivot.children[0].position.y = Math.max(0, Math.sin(t * 2.4 - (pivot.userData.index as number) * 0.42)) * 0.16;
        }
    }
}

/** Fallback when the font can't load: the title painted on a floating rounded sign. */
export function createTitleSign(text: string) {
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
    return new THREE.Mesh(new THREE.PlaneGeometry(14, 4.2), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
}
