import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGoogleCalendarUrl, buildIcs, escapeIcsText, foldIcsLine, icsFileName } from '../src/components/CalendarDownload.js';
import { resolveConfig } from '../src/utils/helpers.js';
import rawConfig from '../src/config/invitation.js';

const config = resolveConfig(rawConfig);

test('ics contains the configured event in UTC', () => {
  const ics = buildIcs(config, { now: new Date('2026-10-23T00:00:00Z'), pageUrl: 'https://example.com/invite/' });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART:20261205T080000Z'));
  assert.ok(ics.includes('DTEND:20261205T110000Z'));
  assert.ok(ics.includes('DTSTAMP:20261023T000000Z'));
  assert.ok(ics.includes("SUMMARY:Alya's 5th Birthday Party"));
  assert.ok(ics.includes('LOCATION:Rainbow Sprinkle Party Garden\\, Jl. Pelangi Ceria No. 12\\,'));
  assert.ok(ics.includes('URL:https://example.com/invite/'));
  assert.ok(ics.includes('BEGIN:VALARM'));
});

test('ics lines are folded to 75 octets', () => {
  const ics = buildIcs(config, { now: new Date('2026-10-23T00:00:00Z') });
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, line);
  const folded = foldIcsLine(`DESCRIPTION:${'é'.repeat(80)}`);
  assert.ok(folded.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75));
  assert.equal(folded.replace(/\r\n /g, ''), `DESCRIPTION:${'é'.repeat(80)}`);
});

test('ics text escaping', () => {
  assert.equal(escapeIcsText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
});

test('ics file name and Google Calendar link', () => {
  assert.equal(icsFileName(config), 'alya-birthday-party.ics');
  assert.equal(icsFileName({ child: { name: 'Zoë Ann' } }), 'zoe-ann-birthday-party.ics');
  const url = new URL(buildGoogleCalendarUrl(config));
  assert.equal(url.searchParams.get('dates'), '20261205T080000Z/20261205T110000Z');
  assert.equal(url.searchParams.get('text'), "Alya's 5th Birthday Party");
});
