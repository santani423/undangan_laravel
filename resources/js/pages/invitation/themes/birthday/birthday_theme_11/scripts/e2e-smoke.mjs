// End-to-end smoke test: builds nothing, serves ./dist with `vite preview`, then drives the
// real site in Chrome (via playwright-core) and checks every interactive feature.
//
//   npm run build && npm run test:e2e
//
// Requires Google Chrome to be installed (playwright-core launches it with channel "chrome").
// Set E2E_SOFTWARE_GL=1 to force SwiftShader (no GPU), E2E_URL to test an already-running server.
import { readFileSync } from 'node:fs';
import { preview } from 'vite';
import { chromium } from 'playwright-core';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

let server;
let base = process.env.E2E_URL;
if (!base) {
  server = await preview({ preview: { port: 4317, strictPort: false }, logLevel: 'silent' });
  base = server.resolvedUrls.local[0];
}

const gpuArgs = process.env.E2E_SOFTWARE_GL
  ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: [...gpuArgs, '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=user-gesture-required'],
});

async function open(path = '', { width = 1440, height = 900, mobile = false, reducedMotion = 'no-preference', routes } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion,
    acceptDownloads: true,
    permissions: ['microphone'],
  });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });
  if (routes) await routes(page);
  await page.goto(base + path, { waitUntil: 'load' });
  await page.waitForSelector('#loader[hidden]', { state: 'attached', timeout: 120000 });
  return { page, context, problems };
}

const scrollToSection = (page, id) =>
  page.evaluate((target) => {
    const el = document.getElementById(target);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }, id);

/* ------------------------------------------------------------ desktop run */
{
  const { page, context, problems } = await open();

  // Loading & 3D
  check('3D world started (no fallback)', await page.evaluate(() => !document.documentElement.classList.contains('no-webgl') && !!window.__smile.state.experience));
  check('3D title rendered from Fredoka font', await page.evaluate(() => document.documentElement.classList.contains('has-3d-title')));
  check('Child name bound from config', (await page.textContent('.hero__child')).trim() === 'Alya');
  check('Event date formatted', (await page.textContent('.hero__when')).includes('Saturday, 5 December 2026'));

  // Countdown ticks
  const s1 = await page.textContent('#hero [data-unit="seconds"]');
  await page.waitForTimeout(1300);
  const s2 = await page.textContent('#hero [data-unit="seconds"]');
  check('Countdown updates every second', s1 !== s2, `${s1} → ${s2}`);

  // Start button → invitation, envelope opens (scroll-scrubbed)
  await page.click('[data-start]');
  await page.waitForTimeout(2500);
  const atInvitation = await page.evaluate(() => Math.abs(document.getElementById('invitation').getBoundingClientRect().top) < 40);
  check('"Start the adventure" scrolls to the invitation', atInvitation);
  const envelope = await page.evaluate(() => window.__smile.state.experience.world.envelope.card.position.y);
  check('Envelope opened and card rose out', envelope > 3, `card y=${envelope.toFixed(2)}`);
  check('Music started with the adventure', await page.evaluate(() => window.__smile.audio.state.music === true && window.__smile.audio.ctx.state === 'running'));

  // Trail navigation
  await page.click('.trail a[href="#details"]');
  await page.waitForTimeout(2200);
  check('Header trail navigates to section', await page.evaluate(() => Math.abs(document.getElementById('details').getBoundingClientRect().top) < 40));
  check('Active section marked in navigation', (await page.getAttribute('.trail a[href="#details"]', 'aria-current')) === 'step');

  // Maps & calendar
  const maps = await page.getAttribute('[data-maps-link]', 'href');
  check('Google Maps link built from venue', maps.startsWith('https://www.google.com/maps/search/?api=1&query=Rainbow%20Sprinkle'), maps.slice(0, 80));
  const gcal = await page.getAttribute('[data-google-calendar]', 'href');
  check('Google Calendar link has UTC dates', gcal.includes('dates=20261205T080000Z%2F20261205T110000Z'));
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-calendar-download]')]);
  const ics = readFileSync(await download.path(), 'utf8');
  check('.ics file downloaded', download.suggestedFilename() === 'alya-birthday-party.ics', download.suggestedFilename());
  check('.ics contains the event', ics.startsWith('BEGIN:VCALENDAR') && ics.includes('DTSTART:20261205T080000Z') && ics.includes('DTEND:20261205T110000Z') && ics.includes("SUMMARY:Alya's 5th Birthday Party"));
  check('.ics uses CRLF line endings', ics.includes('\r\n') && !/[^\r]\n/.test(ics));

  // Activities (HTML card)
  await scrollToSection(page, 'activities');
  await page.waitForTimeout(2500);
  await page.click('[data-activity="games"]');
  await page.waitForSelector('#activity-dialog[open]');
  check('Activity card opens details dialog', (await page.textContent('#activity-title')) === 'Party games');
  await page.click('[data-activity-next]');
  check('Dialog "Next activity" works', (await page.textContent('#activity-title')) === 'Dental adventure');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  check('Escape closes dialog', !(await page.evaluate(() => document.getElementById('activity-dialog').open)));
  check('Focus returns to the activity card', await page.evaluate(() => document.activeElement?.dataset.activity === 'games'));

  // Activities (3D prop click via raycasting)
  await page.waitForTimeout(800);
  const propPoint = await page.evaluate(() => {
    const exp = window.__smile.state.experience;
    const v = new exp.THREE.Vector3();
    exp.world.activityProps.get('cake').getWorldPosition(v);
    v.y += 1;
    v.project(exp.sceneManager.camera);
    return { x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight };
  });
  await page.mouse.click(propPoint.x, propPoint.y);
  await page.waitForTimeout(400);
  const dialog3d = await page.evaluate(() => document.getElementById('activity-dialog').open && document.getElementById('activity-title').textContent);
  check('Clicking a 3D activity prop opens its details', dialog3d === 'Cake cutting', String(dialog3d));
  await page.keyboard.press('Escape');

  // Gallery & lightbox
  await scrollToSection(page, 'gallery');
  await page.waitForTimeout(2500);
  await page.click('.photo-frame[data-index="1"]');
  await page.waitForSelector('#lightbox[open]');
  check('Photo opens in lightbox', (await page.textContent('[data-lightbox-count]')) === '2 / 6');
  await page.keyboard.press('ArrowRight');
  check('Arrow key → next photo', (await page.textContent('[data-lightbox-count]')) === '3 / 6');
  await page.click('[data-lightbox-next]');
  check('Next button → next photo', (await page.textContent('[data-lightbox-count]')) === '4 / 6');
  await page.click('[data-lightbox-prev]');
  await page.click('[data-lightbox-prev]');
  await page.click('[data-lightbox-prev]');
  await page.click('[data-lightbox-prev]');
  check('Previous wraps around to the last photo', (await page.textContent('[data-lightbox-count]')) === '6 / 6');
  await page.click('#lightbox .lightbox__close');
  await page.waitForTimeout(200);
  check('Close button closes lightbox', !(await page.evaluate(() => document.getElementById('lightbox').open)));
  check('3D polaroids revealed while gallery is on screen', await page.evaluate(() => window.__smile.state.experience.world.polaroids.every((p) => p.userData.reveal > 0.9)));

  // Cake: wish, relight, microphone
  await scrollToSection(page, 'cake');
  await page.waitForTimeout(2500);
  check('All candles lit initially', (await page.evaluate(() => window.__smile.state.experience.world.cake.litCount)) === 5);
  await page.click('[data-cake-wish]');
  await page.waitForTimeout(2000);
  check('"Make a wish" blows out every candle', (await page.evaluate(() => window.__smile.state.experience.world.cake.litCount)) === 0);
  check('Wish status announced', (await page.textContent('[data-cake-status]')).includes('candles are out'));
  check('Relight button shown after wish', await page.isVisible('[data-cake-relight]'));
  await page.click('[data-cake-relight]');
  await page.waitForTimeout(300);
  check('Candles relight', (await page.evaluate(() => window.__smile.state.experience.world.cake.litCount)) === 5);
  // Chrome's fake microphone plays a periodic beep, which is loud enough to count as blowing.
  await page.click('[data-cake-mic]');
  await page.waitForTimeout(300);
  check('Microphone mode starts after a click (fake device)', (await page.getAttribute('[data-cake-mic]', 'aria-pressed')) === 'true' || (await page.textContent('[data-cake-status]')).includes('candles are out'));
  await page.waitForFunction(() => window.__smile.state.experience.world.cake.litCount === 0, null, { timeout: 15000 }).catch(() => {});
  const micBlown = await page.evaluate(() => window.__smile.state.experience.world.cake.litCount === 0);
  check('Blowing into the microphone blows out the candles', micBlown, await page.textContent('[data-cake-status]'));
  check('Microphone is released afterwards', (await page.getAttribute('[data-cake-mic]', 'aria-pressed')) === 'false');
  await page.click('[data-cake-relight]');
  await page.click('[data-cake-mic]');
  await page.waitForTimeout(150);
  if ((await page.getAttribute('[data-cake-mic]', 'aria-pressed')) === 'true') {
    await page.click('[data-cake-mic]');
    check('"Stop listening" turns the microphone off', (await page.getAttribute('[data-cake-mic]', 'aria-pressed')) === 'false');
  }

  // RSVP validation + WhatsApp
  await scrollToSection(page, 'rsvp');
  await page.waitForTimeout(2200);
  await page.evaluate(() => {
    window.__opened = [];
    window.open = (url) => {
      window.__opened.push(url);
      return { opener: 1 };
    };
  });
  await page.click('.rsvp-form button[type="submit"]');
  check('Empty RSVP shows name error', await page.isVisible('[data-error-for="name"]'));
  check('Empty RSVP shows attendance error', await page.isVisible('[data-error-for="attendance"]'));
  check('Focus moves to the first invalid field', await page.evaluate(() => document.activeElement?.id === 'rsvp-name'));
  check('Nothing opened for invalid RSVP', (await page.evaluate(() => window.__opened.length)) === 0);
  await page.fill('#rsvp-name', 'Budi Santoso');
  await page.check('input[name="attendance"][value="yes"]');
  check('Guest counter appears when attending', await page.isVisible('[data-guests-group]'));
  await page.click('[data-step="1"]');
  await page.click('[data-step="1"]');
  await page.click('[data-step="1"]');
  check('Guest counter capped at config maximum', (await page.inputValue('#rsvp-guests')) === '4' && (await page.isDisabled('[data-step="1"]')));
  await page.click('[data-step="-1"]');
  await page.fill('#rsvp-message', 'Happy birthday Alya! 🎂');
  await page.click('.rsvp-form button[type="submit"]');
  await page.waitForTimeout(400);
  const opened = await page.evaluate(() => window.__opened[0]);
  const text = decodeURIComponent((opened ?? '').split('?text=')[1] ?? '');
  check('WhatsApp opened with configured number', opened?.startsWith('https://wa.me/6280000000000?text='), opened?.slice(0, 40));
  check('WhatsApp message contains the answers', text.includes('Name: Budi Santoso') && text.includes('Number of guests: 3') && text.includes('Happy birthday Alya! 🎂'));
  check('Success panel explains the manual send step', (await page.textContent('[data-rsvp-success-lead]')).includes('Press send in WhatsApp'));
  await page.waitForTimeout(900); // flag animation
  check('Mailbox flag raised in 3D', await page.evaluate(() => Math.abs(window.__smile.state.experience.world.mailbox.flag.rotation.x) < 0.2));
  await page.click('[data-rsvp-edit]');
  await page.check('input[name="attendance"][value="no"]');
  check('Guest counter hidden when not attending', !(await page.isVisible('[data-guests-group]')));
  await page.evaluate(() => (window.open = () => null));
  await page.click('.rsvp-form button[type="submit"]');
  check('Blocked pop-up path offers a WhatsApp button', (await page.textContent('[data-rsvp-success-lead]')).includes('blocked') && (await page.getAttribute('[data-rsvp-whatsapp]', 'href')).startsWith('https://wa.me/'));

  // Sound toggles
  await page.click('[data-music-toggle]');
  check('Music toggle pauses', (await page.getAttribute('[data-music-toggle]', 'aria-pressed')) === 'false');
  await page.click('[data-music-toggle]');
  await page.waitForTimeout(200);
  check('Music toggle plays again', (await page.getAttribute('[data-music-toggle]', 'aria-pressed')) === 'true');
  await page.click('[data-sfx-toggle]');
  check('Sound effects toggle off', (await page.getAttribute('[data-sfx-toggle]', 'aria-pressed')) === 'false');

  // Finale, fireworks, gathering
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(3000);
  const finale = await page.evaluate(() => {
    const w = window.__smile.state.experience.world;
    return { gather: w.gather, fireworks: w.fireworks.active, alive: w.fireworks.alive };
  });
  check('Tooth friends gather at the plaza at the end', finale.gather > 0.95, `gather=${finale.gather.toFixed(2)}`);
  check('Fireworks run in the finale', finale.fireworks && finale.alive > 0);

  // Backward scroll reverses the story
  await scrollToSection(page, 'invitation');
  await page.waitForTimeout(2500);
  const back = await page.evaluate(() => {
    const w = window.__smile.state.experience.world;
    return { gather: w.gather, fireworks: w.fireworks.active, story: window.__smile.state.experience.cameraController.story };
  });
  check('Scrolling back un-gathers characters and stops fireworks', back.gather < 0.01 && !back.fireworks);
  check('Camera returns to the invitation station', Math.abs(back.story - 1) < 0.1, `story=${back.story.toFixed(2)}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  check('Envelope closes again when scrolling back to the start', (await page.evaluate(() => window.__smile.state.experience.world.envelope.card.position.y)) < 0.2);

  // Back to start & replay
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  await page.click('[data-back-to-start]');
  await page.waitForTimeout(2500);
  check('"Back to start" returns to the top', await page.evaluate(() => window.scrollY < 40));
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);
  await page.click('[data-replay]');
  await page.waitForTimeout(1500);
  check('"Replay" jumps to the top and replays the intro', await page.evaluate(() => window.scrollY < 5 && window.__smile.state.experience.cameraController.intro.amount > 0));
  await page.waitForTimeout(2500);
  check('Replay focuses the start button', await page.evaluate(() => document.activeElement?.matches('[data-start]')));

  // Performance sanity
  const perf = await page.evaluate(async () => {
    let frames = 0;
    const t0 = performance.now();
    await new Promise((r) => {
      const f = () => (++frames, performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r());
      requestAnimationFrame(f);
    });
    const exp = window.__smile.state.experience;
    const info = exp.sceneManager.renderer.info;
    return { fps: frames / ((performance.now() - t0) / 1000), calls: info.render.calls, triangles: info.render.triangles, merge: exp.world.mergeStats };
  });
  console.log(`      fps≈${perf.fps.toFixed(0)}, draw calls=${perf.calls}, triangles=${perf.triangles}, static meshes merged ${perf.merge.before}→${perf.merge.after}`);

  check('No console errors or failed requests (desktop)', problems.length === 0, problems.slice(0, 3).join(' | '));
  await context.close();
}

/* -------------------------------------------------------------- mobile run */
{
  const { page, context, problems } = await open('', { width: 390, height: 844, mobile: true });
  check('Mobile: low-power quality tier selected', await page.evaluate(() => window.__smile.state.experience && window.__smile.state.experience.sceneManager.renderer.shadowMap.enabled === false));
  check('Mobile: no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.click('[data-menu-button]');
  check('Mobile: menu opens', await page.isVisible('#menu'));
  await page.click('#menu a[href="#rsvp"]');
  await page.waitForTimeout(2500);
  check('Mobile: menu link navigates and closes menu', !(await page.isVisible('#menu')) && (await page.evaluate(() => Math.abs(document.getElementById('rsvp').getBoundingClientRect().top) < 40)));
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('.btn, .icon-btn, .menu-btn, .stepper__btn')]
      .filter((b) => b.offsetParent)
      .filter((b) => b.getBoundingClientRect().height < 44)
      .map((b) => b.textContent.trim() || b.getAttribute('aria-label')),
  );
  check('Mobile: touch targets are at least 44px tall', small.length === 0, small.join(', '));
  check('No console errors or failed requests (mobile)', problems.length === 0, problems.slice(0, 3).join(' | '));
  await context.close();
}

/* ------------------------------------------------------- fallbacks & edge cases */
{
  const { page, context, problems } = await open('?nowebgl');
  check('Fallback: no-WebGL mode shows illustrated version', await page.evaluate(() => document.documentElement.classList.contains('no-webgl') && getComputedStyle(document.querySelector('.scene__art')).display !== 'none'));
  await scrollToSection(page, 'cake');
  await page.click('[data-cake-wish]');
  await page.waitForTimeout(400);
  check('Fallback: cake wish still works without 3D', (await page.textContent('[data-cake-status]')).includes('candles are out'));
  check('Fallback: visible page title', await page.isVisible('#hero-heading'));
  check('No console errors (fallback)', problems.length === 0, problems.slice(0, 3).join(' | '));
  await context.close();
}
{
  const { page, context } = await open('?now=2026-12-06T00:00:00Z');
  check('Countdown: past date shows "ended"', (await page.textContent('#hero .countdown__status')).includes('ended'));
  await context.close();
}
{
  const { page, context } = await open('?now=2026-12-05T09:30:00Z');
  check('Countdown: during the party shows "happening now"', (await page.textContent('#hero .countdown__status')).includes('happening right now'));
  await context.close();
}
{
  const { page, context, problems } = await open('', { reducedMotion: 'reduce' });
  check('Reduced motion: hero content visible immediately', await page.evaluate(() => getComputedStyle(document.querySelector('[data-hero-item]')).opacity === '1'));
  check('Reduced motion: no camera fly-in', await page.evaluate(() => window.__smile.state.experience.cameraController.intro.amount === 0));
  check('No console errors (reduced motion)', problems.length === 0, problems.slice(0, 3).join(' | '));
  await context.close();
}
{
  const { page, context, problems } = await open('', {
    routes: (p) => p.route('**/photo-placeholder-3.svg', (route) => route.abort()),
  });
  await scrollToSection(page, 'gallery');
  await page.waitForTimeout(800);
  check('Missing photo: frame shows a placeholder instead of breaking', await page.evaluate(() => document.querySelector('.photo-frame[data-index="2"]').classList.contains('is-missing')));
  check('Missing photo: no uncaught errors', !problems.some((p) => p.startsWith('pageerror')));
  await context.close();
}

{
  // Optional GLB/GLTF loading: a tiny generated glTF replaces the mascot; a missing cake model falls back.
  const triangle = Buffer.from(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]).buffer).toString('base64');
  const gltf = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    buffers: [{ uri: `data:application/octet-stream;base64,${triangle}`, byteLength: 36 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
  };
  const { page, context, problems } = await open('', {
    routes: (p) => p.route('**/e2e-mascot.gltf', (route) => route.fulfill({ contentType: 'model/gltf+json', body: JSON.stringify(gltf) })),
  });
  const result = await page.evaluate(async () => {
    const exp = window.__smile.state.experience;
    await exp.applyOptionalModels(exp.world, { mascot: '/e2e-mascot.gltf', cake: '/assets/models/does-not-exist.glb' });
    const cakeVisible = exp.world.cake.body.visible;
    return { custom: !!exp.world.mascot.customModel, procedural: exp.world.mascot.torso.visible, cakeVisible };
  });
  check('Optional model: GLTF replaces the procedural mascot', result.custom && !result.procedural);
  check('Optional model: missing file keeps the procedural cake', result.cakeVisible);
  check('Optional model: no uncaught errors', !problems.some((p) => p.startsWith('pageerror')));
  await context.close();
}

await browser.close();
await server?.httpServer?.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
