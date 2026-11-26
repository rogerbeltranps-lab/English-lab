// ✏️ Correct a wrong answer in the notebook look, one question at a time (Roger, 19 Nov 2026: "I want them to be able to redo the
// questions one by one"). Offline check + pictures on a Chromebook screen (normal mode, 1366 × 640), with an invented student and nothing saved
// anywhere: 2 ESO LP2 "What are they doing?" Listening, q7 wrong at the first try, then corrected in the notebook.
// Usage: node tools/answers-stay/nb-redo.mjs [out dir]   (PNG pictures; exits 1 when a check fails)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'nb-redo-'));
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const KEY = 'ls2Doing2ESO', LV = process.env.LV || 'safe', LANG = process.env.LANG_UI || 'en';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...contextOptions(CHROMEBOOK, browser, { scale: 1.5 }), locale: LANG === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
await ctx.addInitScript(([lv, ca]) => { try { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('el_who', JSON.stringify({ role: 'student', group: '2ESOA', ca, uid: 'demo' })); localStorage.setItem('ls2Doing2ESOLevel', lv); localStorage.setItem('el_phone_seen', '1'); localStorage.setItem('el_dict_seen_demo', '1'); } } catch (e) {} }, [LV, LANG === 'ca']);
await ctx.route('**/*', async (route) => {
  const u = new URL(route.request().url());
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.host)) return route.continue().catch(() => route.fulfill({ status: 404, body: '' }));
  if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });
  const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
  route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
});
const page = await ctx.newPage();
page.on('pageerror', (e) => { console.error('page error:', e.message); fails++; });
const shot = async (name, sel) => {
  if (sel) await page.evaluate((s) => { const e = document.querySelector(s); if (e) scrollTo({ top: e.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }); }, sel);
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => { const r = document.querySelector('.lp-panels').getBoundingClientRect(); return { x: Math.max(0, r.left - 16), y: 0, width: Math.min(innerWidth, r.right + 16) - Math.max(0, r.left - 16), height: innerHeight }; });
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip }); console.log('shot', name);
};
const tap = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);   // a real click() (the side rail can sit over a button)
const st = () => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
await page.goto('http://el.local/2eso/free-time-live/what-are-they-doing.html');
await page.waitForTimeout(1500);
await tap('.tab[data-panel="listen"]'); await page.waitForTimeout(400);
ok(await page.evaluate(() => document.documentElement.classList.contains('el-lpnb')), 'the notebook look is on');
// the first try: every question right except "How does Marc usually play?" (as a forward), each with its own ✓ Check
const qs = await page.evaluate(() => [...document.querySelectorAll('#listenForm>.question')].map((q) => q.querySelector('.q-title').textContent));
const W = qs.findIndex((t) => /How does Marc usually play/.test(t));
ok(W >= 0, 'the Marc question is there (q' + (W + 1) + ' of ' + qs.length + ')');
for (let i = 0; i < qs.length; i++) {
  await page.evaluate(([i, v]) => { const r = document.querySelector('input[name="listen' + i + '"][value="' + v + '"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, [i, i === W ? 1 : 0]);
  await tap(`button[data-one="listen"][data-i="${i}"]`); await page.waitForTimeout(80);
}
let s = await st();
const first = JSON.stringify(s.items && s.items['listen_' + LV]), firstTries = JSON.stringify(s.tries && s.tries.listen);
ok(s.tries && s.tries.listen && s.tries.listen.score === qs.length - 1 && s.tries.listen.full, 'mark = first try ' + (s.tries.listen || {}).score + ' / ' + (s.tries.listen || {}).max);
ok(await page.evaluate(() => document.querySelector('#listenForm>.question').inert), 'frozen in pen: a right question can’t be changed');
ok(await page.locator('#listenForm .el-nbfix').count() === 1, 'one ✏️ Correct it, under the wrong answer only');
await shot('1-frozen-wrong-answer-correct-it', `#listenForm>.question:nth-child(${W + 1})`);
// ✏️ Correct it: only that question opens
await tap('#listenForm .el-nbfix'); await page.waitForTimeout(200);
ok(await page.evaluate((W) => { const q = document.querySelectorAll('#listenForm>.question')[W]; return q.classList.contains('el-nbopen') && !q.querySelector('input').inert && !q.querySelector('input:checked'); }, W), 'the question opens empty');
ok(await page.evaluate((W) => getComputedStyle(document.querySelectorAll('#listenForm>.question')[W].querySelector('.el-one')).display !== 'none', W), 'its own ✓ Check shows');
await shot('2-open-to-correct', `#listenForm>.question:nth-child(${W + 1})`);
// wrong again (as a goalkeeper), then right (as a defender)
const pick = (v) => page.evaluate(([W, v]) => { const r = document.querySelector('input[name="listen' + W + '"][value="' + v + '"]'); r.closest('label').click(); }, [W, v]);
await pick(2); await tap(`button[data-one="listen"][data-i="${W}"]`); await page.waitForTimeout(200);
ok(await page.evaluate((W) => document.querySelector('#listenf' + W).classList.contains('no'), W), 'wrong again: Not yet, the question stays open');
await pick(0); await tap(`button[data-one="listen"][data-i="${W}"]`); await page.waitForTimeout(200);
ok(await page.evaluate((W) => document.querySelector('#listenf' + W).classList.contains('ok'), W), 'right: Correct!');
ok(await page.locator('#listenForm .el-nbfix').count() === 0, 'no ✏️ left');
ok(await page.evaluate((W) => document.querySelectorAll('#listenForm>.question')[W].querySelector('.options').inert, W), 'the correction is in pen too');
ok(!/first try|primer intent/i.test(await page.textContent('#listenResult')), 'the result never mentions the first try (22 Nov 2026)');
await shot('3-corrected', `#listenForm>.question:nth-child(${W + 1})`);
s = await st();
ok(JSON.stringify(s.items['listen_' + LV]) === first && JSON.stringify(s.tries.listen) === firstTries, 'the mark and the first try did not change');
ok(s.nb.listen.v[W] === 1 && s.ans.listen.v[W] === 0, 'the first try (statistic) keeps "as a forward", the latest answer is the correction');
ok(s.nb.listen.re && Object.values(s.nb.listen.re)[0].v === 0, 'the correction is saved in the notebook');
ok(s.last && s.last.listen && s.last.listen.score === qs.length && s.tries.listen.score === qs.length - 1, 'dashboard: first try ' + (s.tries.listen || {}).score + ' → latest ' + ((s.last || {}).listen || {}).score + ' / ' + qs.length);
// back later: the correction is still there
await page.reload(); await page.waitForTimeout(1500); await tap('.tab[data-panel="listen"]'); await page.waitForTimeout(400);
ok(await page.evaluate((W) => { const c = document.querySelector('input[name="listen' + W + '"]:checked'); return c && c.value === '0'; }, W), 'after a reload the corrected answer is there');
ok(await page.evaluate(() => !document.querySelector('#listenForm .el-nbwas, #listenResult .el-nbmark') && !/first try|primer intent/i.test(document.querySelector('#listen').textContent)), 'only the latest answer, no first try line');
await shot('4-after-reload', `#listenResult`);
// the laptop look shows the latest answer too (22 Nov 2026)
await page.evaluate(() => window.elLpNb(false)); await page.waitForTimeout(400);
ok(await page.evaluate((W) => { const c = document.querySelector('input[name="listen' + W + '"]:checked'); return c && c.value === '0'; }, W), 'the laptop look shows the corrected answer');
ok(await page.locator('#listenForm .el-nbfix, #listenForm .el-nbwas').count() === 0, 'no ✏️ in the laptop look');
await page.evaluate(() => window.elLpNb(true)); await page.waitForTimeout(400);
await browser.close();
console.log(fails ? fails + ' FAILED' : 'all good', '·', OUT);
process.exit(fails ? 1 : 0);
