// Converts the bundled Fredoka Bold WOFF (OFL-1.1, via @fontsource/fredoka) into
// the typeface JSON format that three.js FontLoader/TextGeometry understands.
// The output is committed to public/assets/fonts/, so you only need to re-run this
// if you want a different font or more glyphs:  node scripts/build-title-font.mjs
//
// The conversion mirrors three/examples/jsm/loaders/TTFLoader.js (MIT), but runs at
// build time so the site never downloads opentype.js from a CDN at runtime.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import opentype from 'opentype.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/@fontsource/fredoka/files/fredoka-latin-700-normal.woff');
const target = resolve(root, 'public/assets/fonts/fredoka-bold.typeface.json');

// Basic Latin + Latin-1 letters is enough for titles and most children's names.
const keep = (cp) => (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xc0 && cp <= 0xff) || cp === 0x2019;

const buffer = readFileSync(source);
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const round = Math.round;
const scale = 100000 / ((font.unitsPerEm || 2048) * 72);
const glyphs = {};

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  const unicodes = glyph.unicodes?.length ? glyph.unicodes : glyph.unicode !== undefined ? [glyph.unicode] : [];
  const wanted = unicodes.filter(keep);
  if (!wanted.length) continue;

  const token = {
    ha: round(glyph.advanceWidth * scale),
    x_min: round((glyph.xMin ?? 0) * scale),
    x_max: round((glyph.xMax ?? 0) * scale),
    o: '',
  };
  for (const command of glyph.path.commands) {
    const type = command.type.toLowerCase() === 'c' ? 'b' : command.type.toLowerCase();
    token.o += `${type} `;
    if (command.x !== undefined) token.o += `${round(command.x * scale)} ${round(command.y * scale)} `;
    if (command.x1 !== undefined) token.o += `${round(command.x1 * scale)} ${round(command.y1 * scale)} `;
    if (command.x2 !== undefined) token.o += `${round(command.x2 * scale)} ${round(command.y2 * scale)} `;
  }
  for (const cp of wanted) glyphs[String.fromCodePoint(cp)] = token;
}

const json = {
  glyphs,
  familyName: 'Fredoka Bold',
  ascender: round(font.ascender * scale),
  descender: round(font.descender * scale),
  underlinePosition: font.tables.post.underlinePosition,
  underlineThickness: font.tables.post.underlineThickness,
  boundingBox: {
    xMin: font.tables.head.xMin,
    xMax: font.tables.head.xMax,
    yMin: font.tables.head.yMin,
    yMax: font.tables.head.yMax,
  },
  resolution: 1000,
  original_font_information: { license: 'SIL Open Font License 1.1', copyright: 'The Fredoka Project Authors' },
};

writeFileSync(target, JSON.stringify(json));
console.log(`Wrote ${Object.keys(glyphs).length} glyphs to ${target}`);
