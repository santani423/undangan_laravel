import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildMapsUrl, fillTemplate, ordinalWord, resolveConfig } from '../src/utils/helpers.js';
import { getEventRange } from '../src/utils/date.js';
import rawConfig from '../src/config/invitation.js';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const config = resolveConfig(rawConfig);

test('template tokens are filled everywhere', () => {
  assert.equal(fillTemplate("{name}'s {ageOrdinal} birthday, {age} candles", { name: 'Alya', age: 5 }), "Alya's fifth birthday, 5 candles");
  assert.equal(ordinalWord(23), '23rd');
  assert.equal(ordinalWord(11), 'eleventh');
  const leftover = JSON.stringify(config).match(/\{(name|age|ageOrdinal|pronoun)\}/);
  assert.equal(leftover, null);
});

test('sample config is internally consistent', () => {
  const { start, end } = getEventRange(config.event);
  assert.ok(end > start);
  assert.ok(config.child.age >= 1 && config.child.age <= 12, 'age drives the candle count (1–12)');
  assert.ok(config.rsvp.maxGuestsPerReply >= 1);
  const ids = config.activities.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, 'activity ids must be unique');
});

test('every local asset referenced by the config exists', () => {
  const paths = [
    ...config.gallery.map((p) => p.src),
    ...Object.values(config.audio.files),
    ...Object.values(config.models),
  ].filter((p) => p && p.startsWith('/'));
  for (const p of paths) assert.ok(existsSync(publicDir + p), `missing ${p}`);
});

test('maps link prefers explicit URL, then coordinates, then search', () => {
  assert.equal(buildMapsUrl({ mapsUrl: 'https://maps.app.goo.gl/x' }), 'https://maps.app.goo.gl/x');
  assert.equal(buildMapsUrl({ coordinates: { lat: -6.2, lng: 106.8 } }), 'https://www.google.com/maps/search/?api=1&query=-6.2,106.8');
  assert.ok(buildMapsUrl({ name: 'A & B', address: 'Jl. X' }).endsWith('query=A%20%26%20B%2C%20Jl.%20X'));
});
