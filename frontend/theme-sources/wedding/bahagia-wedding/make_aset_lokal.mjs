/**
 * Bundle the 3D scene's textures into assets/aset-lokal.js as data URIs.
 *
 * Browsers refuse local files as WebGL textures when bahagia-wedding.html is opened straight
 * from disk (file://), which leaves the scene black. The page loads this bundle only in that case;
 * over http(s) it keeps loading the normal files. Re-run after changing any texture:
 *
 *   node make_aset_lokal.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), 'assets');
// semua nama yang dipakai tex() di bahagia-wedding.html, plus foto sampul di layar ponsel
const FILES = [
  'grass.jpg', 'grass_n.jpg', 'fabric.jpg', 'fabric_n.jpg', 'wood.jpg', 'wood_n.jpg',
  'paper.jpg', 'paper_n.jpg', 'petal.png', 'leaf.png', 'leaf_n.jpg', 'eucalyptus.png',
  'flame.png', 'wax.jpg', 'sky_golden.jpg', 'galeri-gapura.jpg',
];
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png' };

const entries = FILES.map(name => {
  const data = readFileSync(join(ASSETS, name)).toString('base64');
  return `  ${JSON.stringify(name)}: "data:${MIME[extname(name)]};base64,${data}"`;
});
const out = join(ASSETS, 'aset-lokal.js');
writeFileSync(out, `// Dibuat otomatis oleh make_aset_lokal.mjs, jangan diedit manual.\nwindow.ASET_LOKAL = {\n${entries.join(',\n')}\n};\n`);
console.log(`${FILES.length} aset -> ${out} (${Math.round(statSync(out).size / 1024)} KB)`);
