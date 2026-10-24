import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRsvpMessage, buildWhatsAppUrl, normalizeWhatsAppNumber, validateRsvp } from '../src/components/RSVPForm.js';
import { resolveConfig } from '../src/utils/helpers.js';
import rawConfig from '../src/config/invitation.js';

const config = resolveConfig(rawConfig);

test('validation requires a name and an answer', () => {
  const errors = validateRsvp({ name: ' ', attendance: '' });
  assert.ok(errors.name);
  assert.ok(errors.attendance);
  assert.equal(errors.guests, undefined);
});

test('guest count is checked only when attending', () => {
  assert.ok(validateRsvp({ name: 'Ana', attendance: 'yes', guests: '0' }, { maxGuests: 4 }).guests);
  assert.ok(validateRsvp({ name: 'Ana', attendance: 'yes', guests: '5' }, { maxGuests: 4 }).guests);
  assert.ok(validateRsvp({ name: 'Ana', attendance: 'yes', guests: '2.5' }, { maxGuests: 4 }).guests);
  assert.deepEqual(validateRsvp({ name: 'Ana', attendance: 'yes', guests: '4' }, { maxGuests: 4 }), {});
  assert.deepEqual(validateRsvp({ name: 'Ana', attendance: 'no', guests: '' }, { maxGuests: 4 }), {});
});

test('message length limit', () => {
  assert.ok(validateRsvp({ name: 'Ana', attendance: 'no', message: 'x'.repeat(281) }, { messageMaxLength: 280 }).message);
});

test('WhatsApp numbers are normalised', () => {
  assert.equal(normalizeWhatsAppNumber('+62 812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsAppNumber('123'), '');
  assert.throws(() => buildWhatsAppUrl('', 'hi'), /WhatsApp number/);
});

test('WhatsApp URL carries the encoded RSVP message', () => {
  const message = buildRsvpMessage({ name: 'Budi', attendance: 'yes', guests: '3', message: 'See you & happy birthday!' }, config);
  assert.match(message, /Name: Budi/);
  assert.match(message, /Attending: Yes/);
  assert.match(message, /Number of guests: 3/);
  assert.match(message, /Message for Alya: See you & happy birthday!/);
  const url = buildWhatsAppUrl('+62 800-0000-0000', message);
  assert.ok(url.startsWith('https://wa.me/6280000000000?text='));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), message);
});

test('declining omits the guest count', () => {
  const message = buildRsvpMessage({ name: 'Budi', attendance: 'no', guests: '3' }, config);
  assert.match(message, /Sorry, we can't make it/);
  assert.doesNotMatch(message, /Number of guests/);
});
