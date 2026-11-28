// 📋 How I'm working (🎓 My progress, today.html howCard): pictures for Roger with INVENTED students only (Alex Sample, Pau Exemple),
// in Term 2 with levels on, on the students' Chromebook (1366 × 640) and a phone. Nothing leaves this computer.
// Usage: node tools/progress-table/preview.mjs <folder>   (scale 2 pictures; add a 3rd argument 1 for scale 1)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), OUT = path.resolve(process.argv[2] || 'progress-table-preview');
const { CHROMEBOOK, PHONE, contextOptions } = await import('../devices.mjs');
const { demo } = await import('../site-video/board/demo.mjs');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const TODAY = '2026-12-11', ms = (d, h = 17) => Date.parse(`${d}T${String(h).padStart(2, '0')}:00:00+01:00`);
// a term-2 fortnight: what was done in class, when the student finished it, its latest score or the correction's level
function term2(lang) {
  const { demo: D } = demo(lang, 'end'), en = lang === 'en';
  const C = en ? { ls: '4eso-seasons-and-celebrations', g: '4ESOA', A: '4eso/ls2-write-to-the-head-teacher', kA: 'ls2Email4ESO', B: '4eso/ls2-research-it-right', kB: 'ls2Research4ESO' }
    : { ls: '2eso-free-time-live', g: '2ESOA', A: '2eso/ls2-write-your-vlog-script', kA: 'ls2Script2ESO', B: '2eso/ls2-check-the-source', kB: 'ls2Source2ESO' };
  if (!en) { D.me.name = 'Pau Exemple'; D.lv[C.ls] = { level: 'beginners', by: 'teacher' }; }
  D.me.group = C.g;
  const tick = { [C.B + '#recall']: '2026-11-24', [C.A + '#vocab']: '2026-11-30', [C.A + '#grammar']: '2026-11-30', [C.A + '#read']: '2026-12-02', [C.A + '#shadow']: '2026-12-02',
    [C.B + '#read']: '2026-12-07', [C.A + '#write']: '2026-12-07', [C.A + '#speak']: '2026-12-09', [C.B + '#sources']: '2026-12-09' };
  if (!en) { tick[C.A + '#write'] = '2026-12-07'; delete tick[C.A + '#grammar']; tick[C.A + '#grammar'] = '2026-11-30'; }
  D.ls[C.ls].done = { [C.g]: tick };
  const S = (done, last) => JSON.stringify({ done: Object.fromEntries(Object.keys(done).map((k) => [k, true])), doneAt: Object.fromEntries(Object.entries(done).map(([k, d]) => [k, ms(d)])),
    last: Object.fromEntries(Object.entries(last).map(([k, v]) => [k, { score: v, max: 10, date: new Date(ms(done[k] || '2026-12-01')).toISOString() }])) });
  D.pg[C.ls][C.kA] = S({ cards: '2026-12-01', practice: '2026-12-01', grammar: '2026-12-02', read: '2026-12-09', shadow: '2026-12-03', write: '2026-12-08' }, { practice: 9.4, grammar: 8, read: 6 });
  D.pg[C.ls][C.kB] = S({ recall: '2026-11-24', read: '2026-12-08' }, { recall: 7, read: 8 });
  D.rs[C.A] = Object.assign(D.rs[C.A] || {}, { activity: C.A, levels: { shadow: { '3.2': 'AN' } }, marked: { shadow: '2026-12-04T16:00:00Z' }, fbGo: { shadow: '2026-12-04T16:00:00Z' } });
  D.tm = Object.assign(D.tm || {}, { formative: { t2: 'levels', from: '2026-11-30' } });
  return { D, C };
}
const browser = await chromium.launch(); fs.mkdirSync(OUT, { recursive: true });
async function shot(lang, size, name, sel, place = 'progress', term, full) {
  const { D, C } = term2(lang);
  const ctx = await browser.newContext({ ...contextOptions(size, browser, { scale: +(process.argv[3] || 2) }), locale: lang === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([who]) => { try { localStorage.setItem('el_who', JSON.stringify(who)); localStorage.setItem('el_phone_seen', '1'); } catch (e) {} }, [{ role: 'student', group: C.g, ca: lang === 'ca', uid: 'demo' }]);
  await ctx.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.host !== 'el.local') return r.abort();
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html', f = path.join(ROOT, rel);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return r.fulfill({ status: 404, body: '' });
    let b = fs.readFileSync(f);
    if (rel === 'today.html') { const s = b.toString(), m = '<script src="shared/js/el-catalog.js">', i = s.indexOf(m); b = s.slice(0, i) + `<script>window.EL_TODAY=${JSON.stringify(TODAY)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}</script>\n` + s.slice(i); }
    r.fulfill({ status: 200, body: b, contentType: TYPES[path.extname(rel)] || 'application/octet-stream' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.setFixedTime(new Date(`${TODAY}T10:30:00`));
  await p.goto('http://el.local/today.html#' + place); await p.waitForTimeout(2500);
  if (term) { await p.click(`[data-do="pterm"][data-t="${term}"]`); await p.waitForTimeout(800); }
  await p.evaluate(() => document.querySelectorAll('.mc-pop,.elm-say,#mascotSay,dialog[open]').forEach((e) => e.close ? e.close() : e.remove()));
  if (sel) { const el = await p.$(sel); if (!el) console.log(name, 'NOT FOUND', sel); else { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await el.screenshot({ path: path.join(OUT, name) }); } }
  else await p.screenshot({ path: path.join(OUT, name), fullPage: !!full });
  if (errs.length) console.log(name, errs);
  await ctx.close();
}
// 🎓 My progress in tabs (28 Nov 2026): each tab on the Chromebook, the Catalan (Starter) overview, a phone, and My marks with the tabs
await shot('en', CHROMEBOOK, '1-overview.png', null, 'progress');
await shot('en', CHROMEBOOK, '2-activities.png', null, 'progress-activities');
await shot('en', CHROMEBOOK, '3-skills.png', null, 'progress-skills');
await shot('en', CHROMEBOOK, '4-competences.png', null, 'progress-competences');
await shot('en', CHROMEBOOK, '5-my-marks.png', null, 'marks');
await shot('en', CHROMEBOOK, '6-reports.png', null, 'progress-reports');
await shot('ca', CHROMEBOOK, '7-overview-catalan-starter.png', null, 'progress');
await shot('en', PHONE, '8-overview-phone.png', null, 'progress', null, true);
await shot('en', CHROMEBOOK, '9-activities-term1.png', null, 'progress-activities', 1);
await shot('en', CHROMEBOOK, '10-dashboard-chip.png', null, '');
await browser.close();
