// Pictures of what the teacher's student view shows (👁, today.html?student=…) and what a real student sees, offline, with the invented
// 4 ESO Core student of tools/site-video/board/demo.mjs. No Firebase, nothing saved. Chromebook normal mode (1366 × 640, tools/devices.mjs).
// Usage: node tools/students-never-see/preview.mjs <out dir> [catalog to use instead of shared/js/el-catalog.js, e.g. the old one]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { demo } from '../site-video/board/demo.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || 'students-never-see-preview', CAT = process.argv[3], TAG = CAT ? 'before' : 'after';
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const { today, demo: D } = demo('en', 'mid');
D.ls['4eso-towards-nativeness'] = { status: 'open' };   // as on the live site: the course is open (for Roger)
const SHOTS = [
  { id: 'teacher-student-view-marks', role: 'teacher', url: 'today.html?student=demo#marks' },
  { id: 'student-marks', role: 'student', url: 'today.html#marks' },
];
const browser = await chromium.launch();
for (const S of SHOTS) {
  const ctx = await browser.newContext({ ...contextOptions(CHROMEBOOK, browser), locale: 'en-GB', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript((who) => { try { localStorage.setItem('el_who', JSON.stringify(who)); localStorage.setItem('el_phone_seen', '1'); } catch (e) {} }, { role: S.role, group: S.role === 'student' ? '4ESOA' : null, ca: false, uid: 'demo' });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
    const file = rel === 'shared/js/el-catalog.js' && CAT ? CAT : path.join(ROOT, rel);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    let body = fs.readFileSync(file);
    if (rel === 'today.html') { const s = body.toString(), m = '<script src="shared/js/el-catalog.js">', i = s.indexOf(m); body = s.slice(0, i) + `<script>window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}</script>\n` + s.slice(i); }
    route.fulfill({ status: 200, body, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(`${today}T10:30:00`));
  page.on('pageerror', (e) => console.error(S.id, 'page error:', e.message));
  await page.goto('http://el.local/' + S.url);
  await page.waitForTimeout(2000);
  const tn = await page.evaluate(() => (document.body.innerText.match(/Towards Nativeness/g) || []).length);
  const out = path.join(OUT, `${TAG}-${S.id}.png`);
  await page.screenshot({ path: out });
  console.log(out, '· "Towards Nativeness" on the page:', tn);
  await ctx.close();
}
await browser.close();
