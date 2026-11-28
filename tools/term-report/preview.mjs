// 📄 Preview of the reports with INVENTED students only (Alex Sample, the board demo): Term 1, Term 2 and the final report of the year
// (Roger, 28 Nov 2026: "I should have a 1st term, 2n term, 3rd term and final mark report option"), on the students' Chromebook screens and a
// phone (tools/devices.mjs), plus 🎓 My progress with its report cards. Nothing leaves this computer: every request outside the repo is blocked.
// Usage: node tools/term-report/preview.mjs <out dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { CHROMEBOOK, PHONE, contextOptions } from '../devices.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), OUT = path.resolve(process.argv[2] || 'report-preview');
fs.mkdirSync(OUT, { recursive: true });
const { demo } = await import('../site-video/board/demo.mjs');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const browser = await chromium.launch(), errs = [];
for (const lang of ['en', 'ca']) {
  const { today, demo: D } = demo(lang, 'end');
  const ls = lang === 'en' ? '4eso-seasons-and-celebrations' : '2eso-free-time-live';
  // class games played in term 2, so Term 2's "What we worked on" has points
  D.mg = Object.assign({}, D.mg, { g1: { title: 'Grammar · Past simple and used to', ls, of: 12, r: 9, day: '2026-12-02', miss: [] }, g2: { title: 'Vocabulary · Winter celebrations', ls, of: 15, r: 10, day: '2026-12-09', miss: [] } });
  D.tm = Object.assign({}, D.tm, { repPub: { t1: '2026-11-25T08:00:00Z', t2: '2026-12-15T08:00:00Z', y: '2026-12-15T08:00:00Z' }, repFinal: { t1: '2026-11-28T09:00:00Z' } });
  D.trep = { t1: {}, t2: {}, y: {} };
  for (const size of [CHROMEBOOK, PHONE]) {
    const ctx = await browser.newContext({ ...contextOptions(size, browser), locale: lang === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url()); if (u.host !== 'el.local') return route.abort('blockedbyclient');
      const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html', file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
      let b = fs.readFileSync(file);
      if (rel === 'today.html') { const s = b.toString(), m = '<script src="shared/js/el-catalog.js">', i = s.indexOf(m); b = s.slice(0, i) + `<script>window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}</script>\n` + s.slice(i); }
      route.fulfill({ status: 200, body: b, contentType: TYPES[path.extname(rel)] || 'application/octet-stream' });
    });
    const page = await ctx.newPage(); await page.clock.setFixedTime(new Date(`${today}T10:30:00`));
    page.on('pageerror', (e) => errs.push(`${lang} ${size.name}: ${e.message}`));
    for (const h of ['report', 'report-t2', 'report-y', 'progress']) {
      await page.goto(`http://el.local/today.html#${h}`, { waitUntil: 'load' }); await page.waitForTimeout(1800);
      await page.screenshot({ path: path.join(OUT, `${lang}-${size.name.replace(/\W+/g, '_')}-${h}.png`), fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
if (errs.length) { console.error('✗ ' + [...new Set(errs)].join('\n  ')); process.exit(1); }
console.log('✓ previews in ' + OUT);
