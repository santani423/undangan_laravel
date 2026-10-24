// node render.mjs <svgDir> <outDir> [names...] — renders each SVG at its own width/height into PNG (needs playwright-core + local Chrome)
import { chromium } from 'playwright-core';
import { readdirSync, readFileSync } from 'node:fs';
const [, , dir, outDir, ...only] = process.argv;
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.svg') && (!only.length || only.includes(f.replace('.svg', ''))))) {
    const svg = readFileSync(`${dir}/${f}`, 'utf8');
    const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    await page.setViewportSize({ width: +w, height: +h });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${outDir}/${f.replace('.svg', '.png')}`, clip: { x: 0, y: 0, width: +w, height: +h } });
    console.log('rendered', f);
}
await browser.close();
