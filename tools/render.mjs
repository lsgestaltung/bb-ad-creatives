/* Rendert alle Creatives pixelgenau als PNG – in allen Formaten.
   node tools/render.mjs                       → exports/<format>/*.png  (4x5, 16x9, 9x16)
   node tools/render.mjs --format 9x16         → nur ein Format
   node tools/render.mjs --only 03             → nur Creatives, deren Dateiname "03" enthält
   node tools/render.mjs --scale 2             → @2x (doppelte Pixelmaße)
   Zusätzlich: _preview/preview-<format>.png (Kontaktbogen je Format). */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const FORMATS = { '4x5': [1080, 1350], '16x9': [1920, 1080], '9x16': [1080, 1920] };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const scale = Number(opt('--scale') || 1) || 1;
const only = opt('--only');
const formats = opt('--format') ? [opt('--format')] : Object.keys(FORMATS);

const files = fs.readdirSync(path.join(ROOT, 'creatives'))
  .filter(f => f.endsWith('.html') && (!only || f.includes(only))).sort();
fs.mkdirSync(path.join(ROOT, '_preview'), { recursive: true });

const browser = await chromium.launch();
for (const fmt of formats) {
  const [W, H] = FORMATS[fmt];
  const outDir = path.join(ROOT, 'exports', fmt);
  fs.mkdirSync(outDir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  const outputs = [];
  for (const f of files) {
    const page = await ctx.newPage();
    page.on('pageerror', e => console.error(`[${fmt}/${f}] JS error:`, e.message));
    page.on('requestfailed', r => console.error(`[${fmt}/${f}] failed:`, r.url()));
    await page.goto('file://' + path.join(ROOT, 'creatives', f) + `?format=${fmt}`);
    await page.evaluate(async () => {
      document.body.classList.remove('preview');
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });
    const ad = await page.$('.ad');
    const box = await ad.boundingBox();
    if (Math.round(box.width) !== W || Math.round(box.height) !== H)
      console.warn(`[${fmt}/${f}] unerwartete Größe ${box.width}×${box.height}`);
    const name = f.replace('.html', '') + `_${fmt}_${W * scale}x${H * scale}.png`;
    const out = path.join(outDir, name);
    await ad.screenshot({ path: out, type: 'png' });
    outputs.push(out);
    console.log('✓', path.relative(ROOT, out));
    await page.close();
  }
  // Kontaktbogen je Format
  const cols = fmt === '16x9' ? 2 : 3;
  const sheet = `<html><body style="margin:0;background:#2b2b2b;padding:24px;font:600 20px Manrope,sans-serif;color:#fff">
  <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">
  ${outputs.map(o => `<figure style="margin:0"><img src="file://${o}" style="width:100%;display:block;border-radius:6px"><figcaption style="padding:10px 4px">${path.basename(o)}</figcaption></figure>`).join('')}
  </div></body></html>`;
  const sheetPath = path.join(ROOT, '_preview', `sheet-${fmt}.html`);
  fs.writeFileSync(sheetPath, sheet);
  const sp = await ctx.newPage();
  await sp.setViewportSize({ width: 1800, height: 1000 });
  await sp.goto('file://' + sheetPath);
  await sp.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await sp.screenshot({ path: path.join(ROOT, '_preview', `preview-${fmt}.png`), fullPage: true });
  console.log(`✓ _preview/preview-${fmt}.png`);
  await ctx.close();
}
await browser.close();
