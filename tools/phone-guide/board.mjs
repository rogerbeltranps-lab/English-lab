// Phone-size pictures of the student board (today.html) in demo mode (window.EL_DEMO_STUDENT, the invented students of
// tools/site-video/board/demo.mjs: no Firebase, nothing saved), offline. Used by make.mjs for the "Study on your phone" guide.
// Usage: node tools/phone-guide/board.mjs <outdir>  → <outdir>/board-{en,ca}-{height}.png (390 px wide at 2×, the viewport only)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { demo } from '../site-video/board/demo.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'captures'));
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp' };
// page heights at 390 px wide: the page area of each drawn phone in make.mjs (Android under Chrome's bar, iPhone above Safari's bar, the hero)
const HEIGHTS = [666, 649, 803];

const browser = await chromium.launch();
for (const LANG of ['en', 'ca']) {
  const { today, demo: D } = demo(LANG, 'mid');
  D.ls[Object.keys(D.ls).find((k) => D.ls[k].push)].push = {};   // no pull-up card: the board as a student opens it at home
  const page = await browser.newPage({ viewport: { width: 390, height: 720 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: LANG === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid',
    userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
  await page.clock.setFixedTime(new Date(`${today}T17:30:00`));
  await page.addInitScript(() => { try { localStorage.setItem('el_phone_seen', '1') } catch (e) {} });
  await page.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.abort();
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    let body = fs.readFileSync(file);
    if (rel === 'today.html') {
      const s = body.toString(), i = s.indexOf('<script src="shared/js/el-catalog.js">');
      body = s.slice(0, i) + `<script>window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}</script>\n` + s.slice(i);
    }
    route.fulfill({ status: 200, body, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  page.on('pageerror', (e) => console.error(LANG, 'page error:', e.message));
  await page.goto('http://el.local/today.html');
  await page.waitForTimeout(1500);
  for (const h of HEIGHTS) { await page.setViewportSize({ width: 390, height: h }); await page.waitForTimeout(300); await page.screenshot({ path: path.join(OUT, `board-${LANG}-${h}.png`) }) }
  console.log('shot board', LANG);
  await page.close();
}
await browser.close();
