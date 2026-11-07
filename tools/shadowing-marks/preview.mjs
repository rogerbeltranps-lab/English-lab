// Screenshots of the shadowing marks + modes (class page, LP Shadowing step, Practise) at Chromebook size and phone size, and a
// Listen-and-repeat run check (the clip stops after sentence 1 and the "Your turn" bar shows). Offline from the repo files.
//   node tools/shadowing-marks/preview.mjs <out dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || '/tmp/shadow-preview';
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webp': 'image/webp' };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function ctxFor(opts) {
  const ctx = await browser.newContext(opts);
  await ctx.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });
    const rel = decodeURIComponent(u.pathname).replace(/^\/+(English-lab\/)?/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  return ctx;
}
const errs = [];
async function lp(ctx, dir, f, level, name, full) {
  const page = await ctx.newPage(); page.on('pageerror', e => errs.push(f + ': ' + e.message));
  await page.goto(`http://el.local/English-lab/${dir}/${f}`);
  await page.waitForFunction(() => window.LP && window.LS2);
  const key = await page.evaluate(() => window.LP.key);
  await page.evaluate(([k, r]) => localStorage.setItem(k + 'Level', r), [key, level]);
  await page.reload(); await page.waitForTimeout(500);
  await page.locator('.tab', { hasText: 'Shadowing' }).first().click(); await page.waitForTimeout(300);
  const card = page.locator('[id$="Modes"]').first().locator('xpath=..');
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: path.join(OUT, name) });
  return page;
}
// Chromebook 1366x768
let ctx = await ctxFor({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
let p = await ctx.newPage(); p.on('pageerror', e => errs.push('class: ' + e.message));
await p.goto('http://el.local/English-lab/shared/shadow/index.html?ls=2eso/free-time-live'); await p.waitForTimeout(800);
await p.screenshot({ path: path.join(OUT, '1-class-2eso-listen-and-repeat.png'), fullPage: true });
const opt = await p.evaluate(() => [...document.querySelectorAll('#clip option')].find(o => /sports hall/.test(o.textContent)).value);
await p.selectOption('#clip', opt); await p.waitForTimeout(300);
// the repeat run: press play and wait past sentence 1
await p.click('#play'); await p.waitForTimeout(4200);
const turn = await p.evaluate(() => [document.querySelector('.shm-turn .msg').textContent, document.querySelector('.shm-x.now')?.dataset.k]);
console.log('class repeat after 4.2 s:', turn);
await p.screenshot({ path: path.join(OUT, '2-class-your-turn.png'), fullPage: true });
await p.click('#stop');
await p.click('[data-shm-mode="shadow"]'); await p.waitForTimeout(200);
await p.screenshot({ path: path.join(OUT, '3-class-shadowing-mode.png'), fullPage: true });
await p.click('[data-shm-marks]'); await p.waitForTimeout(200);
await p.screenshot({ path: path.join(OUT, '4-class-marks-hidden.png'), fullPage: true });
await p.click('[data-shm-marks]'); await p.click('[data-shm-mode="repeat"]');
await p.goto('http://el.local/English-lab/shared/shadow/index.html?ls=4eso/seasons-and-celebrations'); await p.waitForTimeout(800);
await p.screenshot({ path: path.join(OUT, '5-class-4eso.png'), fullPage: true });
await lp(ctx, '2eso/free-time-live', 'what-are-they-doing.html', 'insecure', '6-lp-2eso-base-catalan.png');
await lp(ctx, '4eso/seasons-and-celebrations', 'plan-the-day.html', 'safe', '7-lp-4eso-core.png');
await ctx.close();
// phone
ctx = await ctxFor({ ...devices['iPhone 13'] });
await lp(ctx, '2eso/free-time-live', 'what-are-they-doing.html', 'insecure', '8-phone-lp-2eso.png');
p = await ctx.newPage();
await p.goto('http://el.local/English-lab/shared/shadow/index.html?ls=4eso/seasons-and-celebrations'); await p.waitForTimeout(800);
await p.screenshot({ path: path.join(OUT, '9-phone-class.png'), fullPage: true });
await ctx.close();
await browser.close();
console.log(errs.length ? 'ERRORS\n' + errs.join('\n') : 'no page errors');
