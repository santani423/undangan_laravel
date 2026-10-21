/**
 * End-to-end acceptance checks against the production build, driven through a
 * locally installed Chrome (or Edge) with playwright-core.
 *
 *   npm run build && npm run test:e2e
 *
 * Env: E2E_BROWSER=chrome|msedge (default chrome), E2E_HEADED=1 to watch.
 * Screenshots are written to test-results/e2e/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, 'test-results', 'e2e');
if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const SECTIONS = ['beranda', 'mempelai', 'acara', 'lokasi', 'kisah', 'galeri', 'rsvp', 'buku-tamu', 'dress-code', 'hadiah', 'penutup'];
const PORT = 4317;
const BASE = `http://localhost:${PORT}`;

const results = [];
async function check(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name} (${Date.now() - started} ms)`);
  } catch (error) {
    results.push({ name, ok: false, error });
    console.log(`  ✗ ${name}\n      ${String(error?.message ?? error).split('\n')[0]}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const server = await preview({ root, logLevel: 'silent', preview: { port: PORT, strictPort: true } });
const browser = await chromium.launch({
  channel: process.env.E2E_BROWSER ?? 'chrome',
  headless: process.env.E2E_HEADED !== '1',
  args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--autoplay-policy=user-gesture-required'],
});

async function newPage(contextOptions = {}, query = '?debug=1') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...contextOptions });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && r.url().startsWith(BASE) && errors.push(`HTTP ${r.status()} ${r.url()}`));
  await page.goto(`${BASE}/${query}`, { waitUntil: 'domcontentloaded' });
  return { context, page, errors };
}

async function waitForLoad(page) {
  await page.waitForSelector('[data-testid="loading-screen"]', { state: 'detached', timeout: 45000 });
}

async function openInvitation(page) {
  await page.getByRole('button', { name: 'Buka Undangan' }).click();
  await page.waitForSelector('[data-testid="invitation-cover"]', { state: 'detached', timeout: 6000 });
  await page.waitForFunction(() => window.__undesia?.anchors, null, { timeout: 8000 });
}

async function goToSection(page, id) {
  const index = SECTIONS.indexOf(id);
  await page.evaluate((i) => window.scrollTo(0, window.__undesia.anchors[i]), index);
  await page.waitForTimeout(1800);
}

const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// ---------------------------------------------------------------------------
console.log('\nDesktop (1440×900)');
{
  const { context, page, errors } = await newPage();

  await check('loads the 3D garden and hides the loading screen', async () => {
    await waitForLoad(page);
    const ready = await page.$eval('[data-testid="scene-layer"]', (el) => el.className.includes('opacity-100'));
    assert(ready, 'WebGL scene did not become visible');
    assert(await page.$('canvas'), 'no canvas rendered');
    await page.screenshot({ path: path.join(outDir, 'desktop-00-cover.png') });
  });

  await check('cover shows names, date and default recipient; content is locked', async () => {
    const cover = page.getByTestId('invitation-cover');
    assert((await cover.textContent()).includes('Sabtu, 20 Maret 2027'), 'date missing on cover');
    assert((await page.getByTestId('recipient-name').textContent()).trim() === 'Tamu Undangan', 'default recipient missing');
    assert(await page.$eval('main', (m) => m.inert), 'main content should be inert behind the cover');
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(200);
    assert((await page.evaluate(() => window.scrollY)) === 0, 'page scrolled while the cover was shown');
  });

  await check('“Buka Undangan” flies the camera in, starts music, focuses the hero', async () => {
    await openInvitation(page);
    await page.waitForFunction(() => Math.abs(window.__undesia.journey.u - 1) < 0.01, null, { timeout: 6000 });
    assert((await page.getByTestId('music-status').textContent()).includes('Sedang diputar'), 'music did not start');
    assert(await page.evaluate(() => document.activeElement?.id === 'beranda-title'), 'focus not moved to hero heading');
    assert(!(await page.$eval('main', (m) => m.inert)), 'main still inert');
    await page.screenshot({ path: path.join(outDir, 'desktop-01-beranda.png') });
  });

  await check('countdown ticks', async () => {
    const read = () => page.$eval('[data-unit="seconds"]', (el) => el.textContent);
    const first = await read();
    await page.waitForTimeout(1300);
    assert((await read()) !== first, 'countdown did not change');
  });

  await check('scrolling moves the camera to every section waypoint', async () => {
    for (let i = 1; i < SECTIONS.length; i++) {
      await goToSection(page, SECTIONS[i]);
      const u = await page.evaluate(() => window.__undesia.journey.u);
      assert(Math.abs(u - (i + 1)) < 0.05, `${SECTIONS[i]}: journey.u=${u.toFixed(3)}, expected ${i + 1}`);
      await page.screenshot({ path: path.join(outDir, `desktop-${String(i + 1).padStart(2, '0')}-${SECTIONS[i]}.png`) });
    }
  });

  await check('section navigation scrolls to the chosen section', async () => {
    await page.getByRole('navigation', { name: 'Navigasi bagian undangan' }).getByRole('button', { name: 'Galeri' }).click();
    await page.waitForTimeout(2500);
    const u = await page.evaluate(() => window.__undesia.journey.u);
    assert(Math.abs(u - 6) < 0.1, `journey.u=${u}`);
  });

  await check('copy-address writes the venue address to the clipboard', async () => {
    await goToSection(page, 'acara');
    await page.getByRole('button', { name: 'Salin alamat Akad Nikah' }).click();
    await page.getByText('Alamat Akad Nikah disalin').waitFor({ timeout: 3000 });
    const text = await page.evaluate(() => navigator.clipboard.readText());
    assert(text.startsWith('Nama Venue Acara (contoh), Jl. Nama Jalan'), `clipboard: ${text}`);
  });

  await check('map embed and Google Maps link are present', async () => {
    await goToSection(page, 'lokasi');
    assert(await page.$('[data-testid="map-embed"]'), 'map iframe missing');
    const href = await page.getByTestId('open-maps').getAttribute('href');
    assert(href.startsWith('https://www.google.com/maps/search/'), href);
  });

  await check('gallery lightbox opens, navigates by keyboard and closes', async () => {
    await goToSection(page, 'galeri');
    await page.getByTestId('gallery-grid').getByRole('button').first().click();
    const dialog = page.getByTestId('lightbox');
    await dialog.waitFor({ state: 'visible' });
    const before = await dialog.getAttribute('aria-label');
    await page.keyboard.press('ArrowRight');
    assert((await dialog.getAttribute('aria-label')) !== before, 'ArrowRight did not advance');
    await page.screenshot({ path: path.join(outDir, 'desktop-lightbox.png') });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  });

  await check('RSVP validates and saves in demo mode', async () => {
    await goToSection(page, 'rsvp');
    await page.getByTestId('rsvp-submit').click();
    await page.getByText('Mohon isi nama Anda').waitFor();
    await page.getByLabel('Nama lengkap').fill('Tamu Uji Otomatis');
    await page.getByLabel('Ya, saya akan hadir').check();
    await page.getByLabel(/Jumlah tamu/).selectOption('2');
    await page.getByTestId('rsvp-submit').click();
    const success = page.getByTestId('rsvp-success');
    await success.waitFor({ timeout: 4000 });
    assert((await success.textContent()).includes('2 orang'), 'attendee count missing');
    assert((await success.textContent()).includes('Mode demo'), 'demo-mode notice missing');
  });

  await check('guestbook accepts a wish and shows it', async () => {
    await goToSection(page, 'buku-tamu');
    await page.getByTestId('guestbook-empty').waitFor();
    await page.getByLabel(/^Nama/).fill('Tamu Uji Otomatis');
    await page.getByLabel(/Ucapan & doa/).fill('Semoga menjadi keluarga yang bahagia.');
    await page.getByTestId('guestbook-submit').click();
    await page.getByTestId('guestbook-list').getByText('Semoga menjadi keluarga yang bahagia.').waitFor({ timeout: 4000 });
  });

  await check('digital gift shows placeholders, never invented numbers', async () => {
    await goToSection(page, 'hadiah');
    assert((await page.getByTestId('account-placeholder').count()) === 2, 'expected two placeholders');
    assert((await page.getByTestId('account-number').count()) === 0, 'unexpected account number');
  });

  await check('music controls pause, resume and mute', async () => {
    const status = page.getByTestId('music-status');
    await page.getByTestId('music-toggle').click();
    assert((await status.textContent()) === 'Dijeda', await status.textContent());
    await page.getByTestId('music-toggle').click();
    assert((await status.textContent()) === 'Sedang diputar', await status.textContent());
    await page.getByTestId('music-mute').click();
    assert((await status.textContent()).includes('senyap'), await status.textContent());
    await page.getByTestId('music-mute').click();
  });

  await check('no horizontal overflow and no console errors', async () => {
    assert(await noOverflow(page), 'horizontal overflow on desktop');
    assert(errors.length === 0, errors.join(' | '));
  });

  await check('rendering stays within budget', async () => {
    const info = await page.evaluate(() => window.__undesia.renderInfo());
    const fps = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();
          const step = () => (++frames, performance.now() - start < 2000 ? requestAnimationFrame(step) : resolve(frames / 2));
          requestAnimationFrame(step);
        }),
    );
    console.log(`      draw calls ${info.calls}, triangles ${info.triangles}, ~${fps} fps`);
    assert(info.calls < 150, `too many draw calls: ${info.calls}`);
  });

  await context.close();
}

// ---------------------------------------------------------------------------
console.log('\nPersonalised link');
{
  const { context, page } = await newPage({}, '?to=Bapak%20Tamu%20Uji');
  await check('?to= personalises the recipient', async () => {
    assert((await page.getByTestId('recipient-name').textContent()).trim() === 'Bapak Tamu Uji', 'recipient not personalised');
  });
  await context.close();
}

// ---------------------------------------------------------------------------
console.log('\nMobile (390×844, touch)');
{
  const { context, page, errors } = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await check('opens and renders the garden on a phone', async () => {
    await waitForLoad(page);
    await page.screenshot({ path: path.join(outDir, 'mobile-00-cover.png') });
    await openInvitation(page);
  });
  await check('every section fits the screen width', async () => {
    for (const id of SECTIONS) {
      await goToSection(page, id);
      assert(await noOverflow(page), `horizontal overflow in ${id}`);
      if (['beranda', 'acara', 'galeri', 'rsvp', 'penutup'].includes(id)) await page.screenshot({ path: path.join(outDir, `mobile-${id}.png`) });
    }
  });
  await check('mobile menu navigates between sections', async () => {
    await page.getByTestId('nav-toggle').click();
    await page.getByRole('dialog', { name: 'Pilih bagian undangan' }).getByRole('button', { name: 'Lokasi' }).click();
    await page.waitForTimeout(2500);
    const u = await page.evaluate(() => window.__undesia.journey.u);
    assert(Math.abs(u - 4) < 0.1, `journey.u=${u}`);
  });
  await check('touch targets are at least 40px', async () => {
    const small = await page.$$eval('main button, main a.btn, [data-testid="music-controller"] button', (els) =>
      els.filter((el) => el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 40).map((el) => el.textContent?.trim() || el.getAttribute('aria-label')),
    );
    assert(small.length === 0, `small targets: ${small.join(', ')}`);
  });
  await check('no console errors on mobile', async () => assert(errors.length === 0, errors.join(' | ')));
  await context.close();
}

// ---------------------------------------------------------------------------
console.log('\nWithout WebGL (?nowebgl=1)');
{
  const { context, page, errors } = await newPage({}, '?nowebgl=1&debug=1');
  await check('falls back to the static garden with complete content', async () => {
    assert(!(await page.$('canvas')), 'canvas should not be created');
    assert(await page.$('[data-testid="static-garden"]'), 'static garden missing');
    // No 3D to wait for: the loading screen must clear almost immediately.
    await page.waitForSelector('[data-testid="loading-screen"]', { state: 'detached', timeout: 3000 });
    await openInvitation(page);
    for (const id of SECTIONS) assert(await page.$(`#${id}`), `section ${id} missing`);
    await goToSection(page, 'galeri');
    await page.screenshot({ path: path.join(outDir, 'nowebgl-galeri.png') });
    assert(errors.length === 0, errors.join(' | '));
  });
  await context.close();
}

// ---------------------------------------------------------------------------
console.log('\nWebGL context loss');
{
  const { context, page } = await newPage();
  await check('switches to the static garden when the GPU context is lost', async () => {
    await waitForLoad(page);
    await page.evaluate(() => document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForSelector('[data-testid="static-garden"]', { timeout: 4000 });
    await page.waitForSelector('canvas', { state: 'detached', timeout: 4000 });
    await page.getByText('Taman 3D tidak tersedia di perangkat ini').waitFor({ timeout: 4000 });
  });
  await context.close();
}

// ---------------------------------------------------------------------------
console.log('\nReduced motion');
{
  const { context, page, errors } = await newPage({ reducedMotion: 'reduce' });
  await check('opens instantly and cuts between composed viewpoints', async () => {
    await waitForLoad(page);
    await openInvitation(page);
    assert((await page.evaluate(() => window.__undesia.journey.u)) === 1, 'camera did not jump to the hero');
    await goToSection(page, 'kisah');
    const u = await page.evaluate(() => window.__undesia.journey.u);
    assert(Math.abs(u - 5) < 0.02, `journey.u=${u}`);
    const animations = await page.evaluate(() => getComputedStyle(document.querySelector('.scroll-hint-dot') ?? document.body).animationDuration);
    assert(animations === '1e-05s' || animations === '0.01ms' || animations === '0s', `CSS animation not reduced: ${animations}`);
    assert(errors.length === 0, errors.join(' | '));
  });
  await context.close();
}

await browser.close();
await server.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots: ${path.relative(root, outDir)}`);
process.exit(failed.length > 0 ? 1 : 0);
