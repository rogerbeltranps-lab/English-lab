// Regression check (Roger, 6 Nov 2026: "ALL THE ACTIVITIES STUDENTS DID, THEY MUST SEE THEM WITH THEIR RESPONSES UNLESS THEY REDO THAT
// ACTIVITY"). For every LS2 learning path page of both courses and every route it answers every activity (types in each box, picks an
// option in each question, presses every Check, leaves some boxes typed but not checked), then:
//   1. reloads the page: every answer must be back;
//   2. changes the level and comes back: every answer must be back.
// Runs offline from the repo files (Firebase is not loaded, so it checks the page's own saving and restoring in the browser).
// Usage: node tools/answers-stay/check.mjs [page filter]    → exits 1 and lists what was lost when an answer does not come back.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
// a new LS: add its folder and routes here
const LSS = [['2eso/free-time-live', ['beginners', 'insecure', 'safe', 'daring']], ['4eso/seasons-and-celebrations', ['beginners', 'insecure', 'safe', 'daring', 'native']]];
// pages with nothing to keep or with one try only (secure checkpoints, the sample exam starts fresh at each try)
const SKIP = /^(recall-checkpoint-\d|sample-exam|index|vocabulary-games|.*-model)\.html$/;
const filter = process.argv[2] || '';

const browser = await chromium.launch();
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });   // no Firebase, fonts or CDNs: the page's own code only
    const rel = decodeURIComponent(u.pathname).replace(/^\/+(English-lab\/)?/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  page.on('dialog', d => d.accept().catch(() => {}));
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  return { ctx, page, errs };
}
// every answer box of the learning path: id or radio group → value
const SNAP = () => {
  // not answers: the study guide's practice ("nothing sent or saved", AGENTS.md) and the study card being typed now
  const NOT_KEPT = /^(study_|card)/;
  const o = {};
  document.querySelectorAll('#lp input, #lp textarea, #lp select, main input, main textarea, main select').forEach(e => {
    if (e.closest('[data-el-teacher],.routes,#el-bar,#el-tsec') || NOT_KEPT.test(e.id || e.name)) return;
    if (e.type === 'radio') { if (e.checked) o['radio:' + e.name] = e.value; return; }
    if (e.type === 'checkbox') { if (e.checked) o['cb:' + (e.id || e.name || e.value)] = '1'; return; }
    if (e.type === 'file' || e.type === 'button' || e.type === 'submit' || e.type === 'hidden' || e.type === 'range') return;
    const k = e.id || e.name; if (!k || !e.value) return;
    o[k] = e.value;
  });
  // the corrections: every result line shown and how many questions show their feedback
  const root = document.getElementById('lp') || document.querySelector('main') || document.body;
  root.querySelectorAll('.result.show[id]').forEach(e => { o['result:' + e.id] = 'shown'; });
  root.querySelectorAll('.feedback.ok, .feedback.no').forEach((e, i) => { const h = e.id || ((e.closest('[id]') || {}).id + ' #' + [...e.parentElement.children].indexOf(e)); if (!NOT_KEPT.test(h)) o['feedback:' + h] = 'shown'; });
  return o;
};
// answers every activity on the page; checks all of them except every third box group, left typed but not checked
const ANSWER = () => {
  const ev = (e, t) => e.dispatchEvent(new Event(t, { bubbles: true }));
  const seen = new Set();
  document.querySelectorAll(document.getElementById('lp') ? '#lp input, #lp textarea, #lp select' : 'main input, main textarea, main select').forEach((e, i) => {
    if (e.disabled || e.readOnly || e.closest('[data-el-teacher],.routes')) return;
    if (e.type === 'radio') { if (seen.has(e.name)) return; seen.add(e.name); e.checked = true; ev(e, 'input'); ev(e, 'change'); return; }
    if (e.type === 'checkbox') return;
    if (e.type === 'file' || e.type === 'button' || e.type === 'submit' || e.type === 'hidden' || e.type === 'range') return;
    if (e.tagName === 'SELECT') { if (e.options.length > 1) { e.selectedIndex = 1; ev(e, 'change'); } return; }
    e.value = (e.tagName === 'TEXTAREA' ? 'I like playing football with my friends at the weekend because it is fun ' : 'answer') + i; ev(e, 'input'); ev(e, 'change');
  });
  // picks (word bank buttons) are not answers; Check buttons: every one but each third, which stays typed only
  const checks = [...document.querySelectorAll(document.getElementById('lp') ? '#lp button[id$="Check"]' : 'main button[id$="Check"]')];
  checks.forEach((b, i) => { if (i % 3 !== 2 && !b.disabled) b.click(); });
  return checks.length;
};
const lost = [];
let runs = 0;
const jobs = [];
for (const [dir, routes] of LSS) {
  // LS2 engine pages, plus the 4 ESO Getting started (its own inline engine: storageKey, level)
  const pages = fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.html') && !SKIP.test(f) && /LS2\.init|storageKey\+"Level"/.test(fs.readFileSync(path.join(ROOT, dir, f), 'utf8')));
  for (const f of pages) if (!filter || (dir + '/' + f).includes(filter)) for (const r of routes) jobs.push([dir, f, r, routes]);
}
const KEY = () => window.LP && window.LS2 ? window.LP.key : (typeof storageKey !== 'undefined' ? storageKey : null);
const LEVEL = () => window.LS2 ? window.LS2.level : (typeof level !== 'undefined' ? level : null);
async function run([dir, f, r, routes]) {
  const { ctx, page, errs } = await newPage();
  try {
    await page.goto(`http://el.local/English-lab/${dir}/${f}`);
    await page.waitForFunction(KEY, null, { timeout: 8000 });
    const key = await page.evaluate(KEY);
    await page.evaluate(([k, r]) => { localStorage.clear(); localStorage.setItem(k + 'Level', r); }, [key, r]);
    await page.reload(); await page.waitForTimeout(400);
    if (await page.evaluate(LEVEL) !== r) return;   // the page has no such route
    await page.evaluate(ANSWER); await page.waitForTimeout(300);
    const before = await page.evaluate(SNAP);
    runs++;
    const cmp = (after, when) => { for (const k of Object.keys(before)) if (after[k] !== before[k]) lost.push(`${dir}/${f} · ${r} · ${when}: ${k} was "${String(before[k]).slice(0, 40)}", now "${String(after[k] ?? '').slice(0, 40)}"`); };
    await page.reload(); await page.waitForTimeout(500);
    cmp(await page.evaluate(SNAP), 'after reload');
    // the teacher changes the level, then back: the student's answers must still be there
    const other = routes.find(x => x !== r);
    await page.evaluate(([k, o]) => localStorage.setItem(k + 'Level', o), [key, other]); await page.reload(); await page.waitForTimeout(400);
    await page.evaluate(([k, r]) => localStorage.setItem(k + 'Level', r), [key, r]); await page.reload(); await page.waitForTimeout(500);
    cmp(await page.evaluate(SNAP), 'after a level change and back');
    if (errs.length) lost.push(`${dir}/${f} · ${r} · page error: ${errs[0]}`);
  } catch (e) { lost.push(`${dir}/${f} · ${r} · could not run: ${String(e.message || e).split('\n')[0]}`); }
  finally { await ctx.close(); }
}
await Promise.all(Array.from({ length: 6 }, async () => { while (jobs.length) await run(jobs.shift()); }));
await browser.close();
console.log(`${runs} page/level runs checked.`);
if (lost.length) { console.log(`${lost.length} answers did not come back:\n` + lost.join('\n')); process.exit(1); }
console.log('Every answer came back after a reload and after a level change.');
