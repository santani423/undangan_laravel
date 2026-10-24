// Checks that every file the site references exists, and lists the optional slots.
//   npm run check:assets
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import config from '../src/config/invitation.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (p) => resolve(root, 'public', p.replace(/^\//, ''));
let missing = 0;

const required = [
  '/assets/fonts/fredoka-bold.typeface.json',
  '/favicon.svg',
  ...['dr-smiley', 'tooth-friend', 'birthday-cake', 'gift-box', 'balloons', 'toothbrush', 'envelope', 'calendar', 'location-pin'].map((n) => `/assets/images/${n}.svg`),
  '/assets/images/icons/games.svg',
  '/assets/images/icons/camera.svg',
  ...config.gallery.map((p) => p.src),
];

console.log('Required files');
for (const p of required) {
  if (/^https?:/.test(p)) continue;
  const ok = existsSync(pub(p));
  if (!ok) missing++;
  console.log(`  ${ok ? '✓' : '✗ MISSING'}  ${p}`);
}

// Every /assets/ path written into index.html must exist too.
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
for (const [, p] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
  if (!existsSync(pub(p))) {
    missing++;
    console.log(`  ✗ MISSING (index.html)  ${p}`);
  }
}

console.log('\nOptional slots (the site works without them)');
const optional = [
  ...Object.entries(config.models).map(([k, v]) => [`models.${k}`, v]),
  ...Object.entries(config.audio.files).map(([k, v]) => [`audio.files.${k}`, v]),
];
for (const [key, value] of optional) {
  if (!value) console.log(`  ·  ${key.padEnd(24)} not set → built-in fallback`);
  else if (/^https?:/.test(value)) console.log(`  ?  ${key.padEnd(24)} ${value} (remote, not checked)`);
  else {
    const ok = existsSync(pub(value));
    if (!ok) missing++;
    console.log(`  ${ok ? '✓' : '✗ MISSING'}  ${key.padEnd(24)} ${value}`);
  }
}

if (config.host.whatsappNumber === '6280000000000') {
  console.log('\n! The WhatsApp number is still the sample value. Set host.whatsappNumber in src/config/invitation.js.');
}
console.log(missing ? `\n${missing} missing file(s).` : '\nAll referenced files are present.');
process.exit(missing ? 1 : 0);
