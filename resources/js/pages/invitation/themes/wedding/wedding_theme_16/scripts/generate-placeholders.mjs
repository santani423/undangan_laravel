/**
 * Generates clearly-labelled voxel-art placeholder images for the gallery.
 * They contain no people and are marked "FOTO CONTOH" so they can never be
 * mistaken for the couple's real photos. Run: npm run generate:placeholders
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'public', 'gallery');
fs.mkdirSync(outDir, { recursive: true });

const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

function tree(x, ground, s, blossom = false) {
  const leaf = blossom ? '#c56f78' : '#4f8f45';
  const light = blossom ? '#eda6a6' : '#6aa957';
  return [
    rect(x - 8 * s, ground - 90 * s, 16 * s, 90 * s, '#80532f'),
    rect(x - 48 * s, ground - 150 * s, 96 * s, 70 * s, leaf),
    rect(x - 32 * s, ground - 182 * s, 64 * s, 38 * s, light),
    rect(x - 48 * s, ground - 150 * s, 30 * s, 26 * s, light, 'opacity="0.6"'),
  ].join('');
}

function arch(cx, ground, s) {
  return [
    rect(cx - 90 * s, ground - 260 * s, 26 * s, 260 * s, '#f1e3c6'),
    rect(cx + 64 * s, ground - 260 * s, 26 * s, 260 * s, '#f1e3c6'),
    rect(cx - 100 * s, ground - 280 * s, 200 * s, 26 * s, '#c9a25c'),
    rect(cx - 50 * s, ground - 302 * s, 30 * s, 24 * s, '#c56f78'),
    rect(cx - 15 * s, ground - 308 * s, 30 * s, 30 * s, '#eda6a6'),
    rect(cx + 20 * s, ground - 302 * s, 30 * s, 24 * s, '#c56f78'),
    rect(cx - 100 * s, ground - 250 * s, 44 * s, 28 * s, '#eda6a6'),
    rect(cx + 56 * s, ground - 220 * s, 44 * s, 28 * s, '#c56f78'),
  ].join('');
}

function lantern(x, ground, s) {
  return [
    rect(x - 12 * s, ground - 8 * s, 24 * s, 8 * s, '#80532f'),
    rect(x - 9 * s, ground - 40 * s, 18 * s, 32 * s, '#ffe2a8'),
    rect(x - 13 * s, ground - 48 * s, 26 * s, 9 * s, '#c9a25c'),
  ].join('');
}

function ring(cx, cy, s, color) {
  const t = 18 * s;
  const w = 120 * s;
  return [
    rect(cx - w / 2, cy - w / 2, w, t, color),
    rect(cx - w / 2, cy + w / 2 - t, w, t, color),
    rect(cx - w / 2, cy - w / 2, t, w, color),
    rect(cx + w / 2 - t, cy - w / 2, t, w, color),
  ].join('');
}

function heart(cx, cy, s, color) {
  const rows = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  const size = 14 * s;
  return rows
    .flatMap((row, y) => [...row].map((c, x) => (c === '1' ? rect(cx + (x - 3.5) * size, cy + (y - 3) * size, size, size, color) : '')))
    .join('');
}

function label(width, height, title, subtitle) {
  const w = Math.min(width * 0.78, 620);
  const x = (width - w) / 2;
  const y = height - 190;
  return `
    <g>
      ${rect(x, y, w, 130, '#fbf6ec', 'opacity="0.92" rx="10"')}
      ${rect(x + 10, y + 10, 14, 14, '#c9a25c')}
      ${rect(x + w - 24, y + 106, 14, 14, '#c9a25c')}
      <text x="${width / 2}" y="${y + 58}" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" letter-spacing="6" fill="#74552a">${title}</text>
      <text x="${width / 2}" y="${y + 98}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#564e42">${subtitle}</text>
    </g>`;
}

function scene({ width, height, sky, ground, extras, title = 'FOTO CONTOH', subtitle }) {
  const groundY = height - 260;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky[0]}"/>
      <stop offset="1" stop-color="${sky[1]}"/>
    </linearGradient>
  </defs>
  ${rect(0, 0, width, height, 'url(#sky)')}
  ${rect(0, groundY, width, height - groundY, ground)}
  ${Array.from({ length: Math.ceil(width / 40) }, (_, i) => rect(i * 40, groundY, 40, 14, i % 2 ? '#79ad57' : '#5f9a4a')).join('')}
  ${extras(groundY)}
  ${label(width, height, title, subtitle)}
</svg>
`;
}

const images = {
  'placeholder-portrait-1.svg': scene({
    width: 900,
    height: 1200,
    sky: ['#f6d9d3', '#fbf1e4'],
    ground: '#4d8a43',
    subtitle: 'Ganti dengan foto potret pasangan',
    extras: (g) => arch(450, g, 1.5) + tree(140, g, 1.4, true) + tree(770, g, 1.3, true) + lantern(300, g + 40, 1.6) + lantern(600, g + 40, 1.6),
  }),
  'placeholder-portrait-2.svg': scene({
    width: 900,
    height: 1200,
    sky: ['#e9dff3', '#fbf6ec'],
    ground: '#4d8a43',
    subtitle: 'Ganti dengan foto potret pasangan',
    extras: (g) => heart(450, g - 330, 2.6, '#c56f78') + lantern(220, g + 30, 2) + lantern(680, g + 30, 2) + tree(110, g, 1.1) + tree(800, g, 1.2),
  }),
  'placeholder-prewedding-1.svg': scene({
    width: 1200,
    height: 900,
    sky: ['#9cc8ea', '#f4e7d1'],
    ground: '#4d8a43',
    subtitle: 'Ganti dengan foto prewedding',
    extras: (g) => tree(150, g, 1.2) + tree(330, g, 0.9, true) + tree(880, g, 1.0) + tree(1060, g, 1.3, true) + arch(600, g, 0.9),
  }),
  'placeholder-prewedding-2.svg': scene({
    width: 1200,
    height: 900,
    sky: ['#6f78b4', '#f6b487'],
    ground: '#3f6b3a',
    subtitle: 'Ganti dengan foto prewedding',
    extras: (g) =>
      `<circle cx="600" cy="${g - 40}" r="90" fill="#ffd9a6" opacity="0.9"/>` + tree(170, g, 1.3) + tree(1030, g, 1.3, true) + lantern(420, g + 30, 1.6) + lantern(780, g + 30, 1.6),
  }),
  'placeholder-engagement-1.svg': scene({
    width: 1200,
    height: 900,
    sky: ['#f8e8cf', '#fbf6ec'],
    ground: '#c9a25c',
    subtitle: 'Ganti dengan foto lamaran',
    extras: (g) => ring(540, g - 160, 1.4, '#d39b45') + ring(660, g - 160, 1.4, '#efe3c6') + heart(600, g - 360, 1.2, '#c56f78'),
  }),
  'placeholder-engagement-2.svg': scene({
    width: 1200,
    height: 900,
    sky: ['#f3d6d9', '#fbf6ec'],
    ground: '#4d8a43',
    subtitle: 'Ganti dengan foto lamaran',
    extras: (g) =>
      rect(500, g - 170, 200, 170, '#c56f78') + rect(490, g - 190, 220, 30, '#c9a25c') + rect(588, g - 190, 24, 190, '#f1e3c6') + tree(220, g, 1.1, true) + tree(980, g, 1.1, true),
  }),
  'placeholder-video.svg': scene({
    width: 1200,
    height: 675,
    sky: ['#2e2a22', '#564e42'],
    ground: '#3f3a30',
    title: 'VIDEO CONTOH',
    subtitle: 'Tambahkan video pernikahan Anda',
    extras: (g) => `<polygon points="560,${g - 220} 560,${g - 100} 660,${g - 160}" fill="#fbf6ec"/>` + rect(470, g - 260, 260, 200, 'none', 'stroke="#c9a25c" stroke-width="10"'),
  }),
};

for (const [name, svg] of Object.entries(images)) {
  fs.writeFileSync(path.join(outDir, name), svg);
  console.log('wrote', path.relative(root, path.join(outDir, name)));
}
