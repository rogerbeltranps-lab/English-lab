// ⛵ The voyage map on the student board (Roger, 19-20 Nov 2026): pictures of the real board offline, with the invented students of
// tools/site-video/board/demo.mjs (Alex Sample, 4 ESO Core, English; Pau Exemple, 2 ESO Base, Catalan) and invented classmates.
// No Firebase, nothing saved. Chromebook normal mode (1366 × 640, tools/devices.mjs). Usage: node tools/voyage/preview.mjs en|ca [out dir] [only,ids]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { demo } from '../site-video/board/demo.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LANG = process.argv[2] === 'ca' ? 'ca' : 'en', EN = LANG === 'en';
const OUT = process.argv[3] || fs.mkdtempSync(path.join(os.tmpdir(), 'voyage-'));
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const { today, demo: D } = demo(LANG, 'mid');
const C = EN ? { group: '4ESOA', ls: '4eso-seasons-and-celebrations' } : { group: '2ESOA', ls: '2eso-free-time-live' };
// invented classmates on the group's road document (road/{ls}__{group}): first name + steps done
const NAMES = ['Marta', 'Oriol', 'Sara', 'Hugo', 'Carla', 'Èric', 'Paula', 'Martí', 'Lucía', 'Iker', 'Noa', 'Dani', 'Emma', 'Pol', 'Júlia', 'Biel', 'Aina', 'Joel', 'Laia', 'Nil'];
const SPREAD = [38, 31, 44, 26, 36, 12, 40, 33, 36, 9, 35, 29, 47, 36, 30, 22, 37, 34, 41, 18];
D.road = { me: 'demo', mates: Object.fromEntries(NAMES.map((n, i) => ['u' + i, { n, s: EN ? Math.round(SPREAD[i] / 2.2) : SPREAD[i] }])) };
// a Time plan agenda like the teacher's (only these tabs are stops; class games and notes are not): ls/{id}.planEdits[group].agenda
if (EN) { const P = (a, ...t) => t.map(x => '4eso/ls2-' + a + '#' + x);
  D.ls[C.ls].planEdits = { [C.group]: { agenda: JSON.stringify({ exam: '2026-11-23', days: {
    '2026-10-26': P('getting-started', 'recall', 'words', 'read', 'listen', 'speak'),
    '2026-10-28': P('celebrations-around-the-world', 'recall', 'vocab', 'read', 'listen'),
    '2026-11-02': P('celebrations-around-the-world', 'grammar', 'mixed', 'write', 'speak', 'log'),
    '2026-11-06': [...P('where-traditions-come-from', 'recall'), '4eso/ls2-getting-started#game:4eso-ls2-lp1-grammar'],
    '2026-11-09': ['note:🎬 Shadowing with the whole class', '4eso/ls2-recall-checkpoint-1#', ...P('where-traditions-come-from', 'listen', 'chart')],
    '2026-11-16': P('where-traditions-come-from', 'vocab', 'grammarPrep', 'read'),
    '2026-11-18': [...P('where-traditions-come-from', 'grammar'), ...P('celebrations-around-the-world', 'vocabEx')] } }) } } }
const SHOTS = [
  { id: 'home', url: 'today.html' },
  { id: 'home-top', url: 'today.html', run: `document.querySelector('.vy-sc')&&(document.querySelector('.vy-sc').scrollTop=0)` },
  { id: 'home-start', url: 'today.html', run: `(()=>{const s=document.querySelector('.vy-sc');if(s)s.scrollTop=s.scrollHeight})()` },
  { id: 'phone', url: 'today.html', w: 390, h: 844, full: true },
  // the "Port reached" card: as if nothing was done on the last visit (rewards compare with what this browser kept)
  // an activity page after the board (the board keeps the steps for it in this browser): 🧭 Your steps on the left, 📓 and 🔍 at the bottom
  { id: 'activity', url: 'today.html', then: '4eso/seasons-and-celebrations/where-traditions-come-from.html#read', en: true },
  { id: 'port-reached', url: 'today.html', seed: { d: [], k: [], p: [], f: false }, wait: 2600 },
];
const browser = await chromium.launch();
for (const S of SHOTS) {
  if (ONLY && !ONLY.includes(S.id) || S.en && !EN) continue;
  const ctx = await browser.newContext({ ...contextOptions(S.w ? { width: S.w, height: S.h, phone: S.w < 500 } : CHROMEBOOK, browser), locale: EN ? 'en-GB' : 'ca-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([who, seed, key]) => { try { localStorage.setItem('el_who', JSON.stringify(who)); localStorage.setItem('el_phone_seen', '1'); if (seed) localStorage.setItem(key, JSON.stringify(seed)); } catch (e) {} }, [{ role: 'student', group: C.group, ca: !EN, uid: 'demo' }, S.seed || null, 'el_voyage_demo_' + C.ls]);
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    let body = fs.readFileSync(file);
    if (rel === 'today.html') { const s = body.toString(), m = '<script src="shared/js/el-catalog.js">', i = s.indexOf(m); body = s.slice(0, i) + `<script>window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}</script>\n` + s.slice(i); }
    route.fulfill({ status: 200, body, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(`${today}T10:30:00`));
  page.on('pageerror', (e) => console.error(S.id, 'page error:', e.message));
  await page.goto('http://el.local/' + S.url);
  await page.waitForTimeout(S.wait || 1500);
  if (S.run) { const r = await page.evaluate(S.run); if (typeof r === 'string') console.log(r); await page.waitForTimeout(500); }
  if (S.then) { await page.goto('http://el.local/' + S.then); await page.waitForTimeout(2500); }
  const out = path.join(OUT, `${S.id}-${LANG}.png`);
  await page.screenshot({ path: out, fullPage: !!S.full });
  console.log('shot', out);
  await ctx.close();
}
await browser.close();
