/**
 * Generates placeholder gallery "photos" and a portrait for the demo invitation
 * by composing the asset-pack illustrations into self-contained SVG scenes.
 * Replace the output in public/assets/gallery/ with real photos for production.
 *
 *   npm run generate:gallery
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/assets/gallery');
mkdirSync(out, { recursive: true });

let uid = 0;
function illustration(name) {
  const raw = readFileSync(join(root, 'public/assets/illustrations', `${name}.svg`), 'utf8');
  const viewBox = raw.match(/viewBox="([^"]+)"/)[1];
  const prefix = `i${uid++}-`;
  const inner = raw
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/id="([^"]+)"/g, `id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
  return (x, y, size, extra = '') => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" ${extra}>${inner}</svg>`;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS = ['#ff7b84', '#ffd166', '#7fdcb0', '#7cc7f0', '#b9a6f2'];

function confetti(seed, n = 28) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const c = COLORS[Math.floor(r() * COLORS.length)];
    const x = Math.round(r() * 800);
    const y = Math.round(r() * 330);
    return r() < 0.5
      ? `<circle cx="${x}" cy="${y}" r="${4 + Math.round(r() * 5)}" fill="${c}" opacity=".85"/>`
      : `<rect x="${x}" y="${y}" width="7" height="16" rx="3" fill="${c}" opacity=".85" transform="rotate(${Math.round(r() * 180)} ${x} ${y})"/>`;
  }).join('');
}

const bunting = () => {
  let s = '<path d="M0 40 Q400 110 800 40" fill="none" stroke="#fff" stroke-width="4"/>';
  for (let i = 0; i < 11; i++) {
    const x = 20 + i * 75;
    const y = 40 + Math.sin((x / 800) * Math.PI) * 52;
    s += `<path d="M${x - 22} ${y} L${x + 22} ${y} L${x} ${y + 46}Z" fill="${COLORS[i % 5]}"/>`;
  }
  return s;
};

const sky = (top, bottom) => `<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="800" height="600" fill="url(#bg)"/>`;
const hill = (color, y = 450) => `<path d="M0 ${y} Q200 ${y - 70} 420 ${y - 20} T800 ${y - 30} V600 H0Z" fill="${color}"/>`;
const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="58" fill="#ffd166"/><circle cx="${x}" cy="${y}" r="80" fill="#ffd166" opacity=".25"/>`;
const cloud = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="70" ry="30"/><ellipse cx="-40" cy="8" rx="40" ry="24"/><ellipse cx="45" cy="6" rx="46" ry="26"/><ellipse cx="5" cy="-20" rx="38" ry="28"/></g>`;
const shadow = (x, y, w) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.14}" fill="#3b3355" opacity=".12"/>`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">${body}</svg>\n`;

const scenes = {
  'memory-01.svg': () =>
    svg(sky('#ffd1dc', '#fff3e0') + confetti(1) + bunting() + hill('#ffe2b8', 500) + shadow(400, 520, 190) + illustration('birthday-cake')(170, 110, 460) + illustration('balloon-bunch')(20, 60, 260)),
  'memory-02.svg': () =>
    svg(
      sky('#8fd3f5', '#e4f6ff') + sun(660, 110) + cloud(200, 110) + cloud(470, 70, 0.7) + hill('#8be7a7', 430) +
        '<path d="M0 520 Q400 470 800 520 V600 H0Z" fill="#f4dfb4"/><path d="M40 552 H140 M240 545 H340 M440 545 H540 M640 552 H740" stroke="#fff" stroke-width="10" stroke-linecap="round"/>' +
        illustration('toy-tree')(560, 170, 300) + shadow(370, 548, 170) + illustration('toy-car')(150, 230, 420),
    ),
  'memory-03.svg': () =>
    svg(sky('#d9cffb', '#fff1f6') + confetti(3, 20) + hill('#c3b7f0', 470) + shadow(330, 548, 140) + illustration('mascot-bear')(110, 120, 440) + illustration('balloon-bunch')(470, 40, 330)),
  'memory-04.svg': () =>
    svg(sky('#fff0b8', '#fff9e8') + confetti(4, 24) + hill('#ffe29a', 480) + shadow(400, 545, 190) + illustration('toy-blocks')(170, 120, 460)),
  'memory-05.svg': () =>
    svg(sky('#c8f1de', '#f2fff8') + confetti(5, 36) + hill('#a6ebc8', 470) + shadow(400, 545, 170) + illustration('gift-box')(170, 110, 460)),
  'memory-06.svg': () =>
    svg(
      sky('#86cef3', '#fff1d9') + sun(140, 120) + cloud(560, 100) + hill('#8be7a7', 420) + hill('#72d79a', 500) +
        shadow(300, 540, 160) + illustration('toy-house')(70, 130, 430) + illustration('toy-tree')(500, 190, 320),
    ),
  'portrait-kirana.svg': () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><radialGradient id="pbg" cx="50%" cy="40%" r="70%"><stop stop-color="#d9f1ff"/><stop offset="1" stop-color="#8fd3f5"/></radialGradient></defs>
  <rect width="512" height="512" fill="url(#pbg)"/>
  ${confetti(9, 18).replace(/cy="(\d+)"/g, (m, y) => `cy="${Math.round(y * 0.6)}"`)}
  <path d="M96 512 Q110 400 256 392 Q402 400 416 512Z" fill="#ff7b84"/>
  <path d="M206 404 Q256 446 306 404" fill="none" stroke="#fff6e5" stroke-width="14" stroke-linecap="round"/>
  <rect x="226" y="340" width="60" height="70" rx="26" fill="#f2bf98"/>
  <circle cx="148" cy="214" r="54" fill="#4a2f2a"/><circle cx="364" cy="214" r="54" fill="#4a2f2a"/>
  <circle cx="148" cy="214" r="18" fill="#ffd166"/><circle cx="364" cy="214" r="18" fill="#ffd166"/>
  <circle cx="256" cy="250" r="118" fill="#f6c9a4"/>
  <path d="M138 240 Q140 130 256 126 Q372 130 374 240 Q330 182 256 178 Q200 182 172 214 Q156 228 138 240Z" fill="#4a2f2a"/>
  <ellipse cx="214" cy="262" rx="12" ry="16" fill="#43364a"/><ellipse cx="298" cy="262" rx="12" ry="16" fill="#43364a"/>
  <circle cx="218" cy="256" r="4" fill="#fff"/><circle cx="302" cy="256" r="4" fill="#fff"/>
  <ellipse cx="186" cy="298" rx="20" ry="11" fill="#ff9da9" opacity=".8"/><ellipse cx="326" cy="298" rx="20" ry="11" fill="#ff9da9" opacity=".8"/>
  <path d="M226 306 Q256 338 286 306" fill="none" stroke="#9a5e52" stroke-width="9" stroke-linecap="round"/>
  <path d="M206 140 L256 24 L306 140Z" fill="#b9a6f2"/>
  <circle cx="240" cy="96" r="8" fill="#ffd166"/><circle cx="270" cy="70" r="7" fill="#fff"/><circle cx="262" cy="118" r="7" fill="#7fdcb0"/>
  <circle cx="256" cy="24" r="16" fill="#ffd166"/>
  <path d="M198 140 Q256 158 314 140" fill="none" stroke="#fff6e5" stroke-width="10" stroke-linecap="round"/>
</svg>
`,
};

for (const [file, build] of Object.entries(scenes)) {
  writeFileSync(join(out, file), build());
  console.log('wrote', join('public/assets/gallery', file));
}
