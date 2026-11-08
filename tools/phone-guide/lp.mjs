// Phone-size picture of a learning path as a student sees it (for the hero of the "Study on your phone" guide), offline:
// Firebase is blocked, el_who says "student", and the student's level button is clicked (only that route shows).
// Usage: node tools/phone-guide/lp.mjs <outdir>  → <outdir>/lp-en.png (390×750 at 2× (4 ESO Core), lp-ca.png (2 ESO Base))
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'captures'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp' };
const PAGES = {
  en: { url: '4eso/seasons-and-celebrations/where-traditions-come-from.html', level: 'safe', group: '4ESOA', ca: false },
  ca: { url: '2eso/free-time-live/now-or-usually.html', level: 'insecure', group: '2ESOA', ca: true },
};
const browser = await chromium.launch();
for (const LANG of ['en', 'ca']) {
  const P = PAGES[LANG];
  const page = await browser.newPage({ viewport: { width: 390, height: 750 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: LANG === 'ca' ? 'ca-ES' : 'en-GB' });
  await page.addInitScript((P) => { try { localStorage.setItem('el_who', JSON.stringify({ uid: 'demo', role: 'student', group: P.group, ca: P.ca })) } catch (e) {} }, P);
  await page.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.abort();
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  await page.goto('http://el.local/' + P.url);
  await page.waitForTimeout(1500);
  await page.evaluate((lv) => { const b = document.querySelector(`button.route[data-level="${lv}"]`); if (b) b.click() }, P.level);
  await page.waitForTimeout(800);
  // the step strip at the top of the screen, with the first step under it
  await page.evaluate(() => { const n = document.querySelector('nav.tabs, .tabs'); if (n) scrollTo(0, n.getBoundingClientRect().top + scrollY - 12) });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `lp-${LANG}.png`) });
  console.log('shot lp', LANG);
  await page.close();
}
await browser.close();
