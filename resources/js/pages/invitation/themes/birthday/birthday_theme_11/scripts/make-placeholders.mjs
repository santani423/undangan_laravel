// Generates the gallery placeholder images in public/assets/images/gallery/ from the supplied
// SVG illustrations. They are deliberately labelled "Your photo here" so nobody mistakes them
// for real photographs. Re-run with:  node scripts/make-placeholders.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const images = resolve(root, 'public/assets/images');
const out = resolve(images, 'gallery');
mkdirSync(out, { recursive: true });

const slots = [
  { art: 'tooth-friend.svg', bg: '#cdeefa', accent: '#55b9dc' },
  { art: 'balloons.svg', bg: '#ffe0eb', accent: '#e46d99' },
  { art: 'birthday-cake.svg', bg: '#dff6e6', accent: '#3f9d68' },
  { art: 'toothbrush.svg', bg: '#ece6ff', accent: '#7c62d6' },
  { art: 'gift-box.svg', bg: '#fff1c4', accent: '#b9862a' },
  { art: 'dr-smiley.svg', bg: '#fde3d4', accent: '#c4673c' },
];

slots.forEach((slot, i) => {
  const source = readFileSync(resolve(images, slot.art), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(source)[1];
  const inner = source.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
 <title>Placeholder for photo ${i + 1}</title>
 <rect width="600" height="600" fill="${slot.bg}"/>
 <g fill="#ffffff" opacity=".55">
  <circle cx="70" cy="80" r="14"/><circle cx="530" cy="110" r="10"/><circle cx="500" cy="520" r="16"/><circle cx="90" cy="500" r="9"/>
 </g>
 <rect x="40" y="40" width="520" height="520" rx="36" fill="none" stroke="#ffffff" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>
 <svg x="150" y="110" width="300" height="300" viewBox="${viewBox}">${inner}</svg>
 <text x="300" y="470" font-family="Fredoka, Nunito, Arial, sans-serif" font-size="40" font-weight="700" text-anchor="middle" fill="${slot.accent}">Your photo here</text>
 <text x="300" y="515" font-family="Nunito, Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="${slot.accent}" opacity=".8">Photo slot ${i + 1}</text>
</svg>
`;
  writeFileSync(resolve(out, `photo-placeholder-${i + 1}.svg`), svg);
});
console.log(`Wrote ${slots.length} placeholders to ${out}`);
