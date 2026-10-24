import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatClock, formatEventDay, formatTimeRange, getCountdown, getEventRange, offsetMinutes, venueTimeToDate } from '../src/utils/date.js';

const event = { date: '2026-12-05', startTime: '15:00', endTime: '18:00', utcOffset: '+07:00', timeZoneLabel: 'WIB', locale: 'en-GB' };

test('venue time converts to the right UTC instant', () => {
  assert.equal(venueTimeToDate('2026-12-05', '15:00', '+07:00').toISOString(), '2026-12-05T08:00:00.000Z');
  assert.equal(venueTimeToDate('2026-12-05', '09:30', '-05:00').toISOString(), '2026-12-05T14:30:00.000Z');
  assert.equal(offsetMinutes('+05:30'), 330);
});

test('end time before start rolls over to the next day', () => {
  const { start, end } = getEventRange({ ...event, startTime: '20:00', endTime: '01:00' });
  assert.equal(end - start, 5 * 3_600_000);
});

test('invalid dates throw a helpful error', () => {
  assert.throws(() => venueTimeToDate('05/12/2026', '15:00', '+07:00'), /YYYY-MM-DD/);
  assert.throws(() => offsetMinutes('WIB'), /utcOffset/);
});

test('countdown before, during and after the party', () => {
  const range = getEventRange(event);
  const before = getCountdown(range, new Date('2026-12-04T06:59:30Z'));
  assert.equal(before.status, 'upcoming');
  assert.deepEqual([before.days, before.hours, before.minutes, before.seconds], [1, 1, 0, 30]);

  const during = getCountdown(range, new Date('2026-12-05T09:00:00Z'));
  assert.equal(during.status, 'live');
  assert.equal(during.totalMs, 0);

  const after = getCountdown(range, new Date('2026-12-05T11:00:00Z'));
  assert.equal(after.status, 'ended');
  assert.deepEqual([after.days, after.hours, after.minutes, after.seconds], [0, 0, 0, 0]);
});

test('dates are formatted in venue time regardless of the viewer', () => {
  assert.equal(formatEventDay(event), 'Saturday, 5 December 2026');
  assert.equal(formatTimeRange(event), '15:00 – 18:00 WIB');
  assert.match(formatClock('15:00', 'en-US'), /^3:00\sPM$/);
});
