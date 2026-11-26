// 🧪 "Does it still open?" (Roger, 24 Nov 2026: "okay go ahead", on a check that stops a fix from breaking pages that worked).
// On every pull request it opens the main pages with INVENTED students only, on the students' two real Chromebook screens (normal
// mode 1366 × 640 and full screen 1366 × 768, ChromeOS, tools/devices.mjs) and a phone (390 × 844), and fails when a page breaks:
//   • the teacher's dashboard (teacher.html, demo data of tools/site-video/teacher-demo.mjs): every item of the side menu, one by one.
//     Each must open with no error, light up itself only, and show its own page (two items showing the same page = a wrong link,
//     as How it works opening Materials before PR #866);
//   • the student board (today.html) and each of its places, in English (4 ESO Core) and in Catalan (2 ESO Base), demo data of
//     tools/site-video/board/demo.mjs;
//   • each LS2 page of both courses (LS home, learning paths, checkpoints, final product, book…), 🎯 Practise (and its 🧠 Flashcards) and 🎲 Games.
// A page fails when it throws a JavaScript error, shows (almost) nothing, or on a phone is wider than the screen.
// Nothing leaves this computer: every request outside the repo is blocked, and any try to reach the real database (Firestore, Google
// sign-in) is a failure of its own, so a page in demo mode can never read or change real students' work.
// Usage: node tools/smoke/check.mjs [filter]        → exit 1 and a list of what broke.   SHOTS=dir also saves a picture of each page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { CHROMEBOOK, CHROMEBOOK_FULL, PHONE, contextOptions } from '../devices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILTER = process.argv[2] || '';
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : '';
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.pdf': 'application/pdf' };
const SIZES = [CHROMEBOOK, CHROMEBOOK_FULL, PHONE];
// the real database and sign-in: a demo page must never even try them
const REAL = /(^|\.)(firestore\.googleapis\.com|firebaseio\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|firebasestorage\.googleapis\.com)$|^script\.google(usercontent)?\.com$/;
// errors that are not the page's fault: a file this check blocks on purpose (fonts, CDNs) failing to load
// files a page only looks for and does well without: 🎯 Practise tries a data file for every learning path, and LS1's pages keep their data inside
const MAY_BE_MISSING = /^[24]eso\/my-real-routine\/data\/[\w-]+\.js$/;
const NOISE = /Failed to fetch dynamically imported module: https?:\/\/(?!el\.local)|Load failed|NetworkError|net::ERR_FAILED|ERR_BLOCKED/;

// ---- invented data (never a real student) ----
const { D: TEACHER, body: teacherBody } = await import('../site-video/teacher-demo.mjs');
const { demo } = await import('../site-video/board/demo.mjs');
const STUDENTS = ['en', 'ca'].map((lang) => {
  const { today, demo: D } = demo(lang, 'mid');
  const EN = lang === 'en';
  const C = EN ? { dir: '4eso/seasons-and-celebrations', ls: '4eso-seasons-and-celebrations', group: '4ESOA', level: 'safe' }
    : { dir: '2eso/free-time-live', ls: '2eso-free-time-live', group: '2ESOA', level: 'insecure' };
  const info = { status: 'open', open: { [C.group]: D.ls[C.ls].open[C.group] } };
  const DLS = { role: 'student', group: C.group, level: C.level, info, pg: D.pg[C.ls], rs: D.rs, notes: [], myGames: {}, played: {} };
  return { lang, today, D, C, DLS, who: { role: 'student', group: C.group, ca: !EN, uid: 'demo' } };
});

const problems = [];
let opened = 0;
const browser = await chromium.launch();

// serves the repo itself at http://el.local/, with the demo data put into the page; blocks everything else
async function context(size, student) {
  const ctx = await browser.newContext({ ...contextOptions(size, browser), locale: student?.lang === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  const real = [], missing = [];
  if (student) await ctx.addInitScript(([who, pg, ls, level]) => {
    try { localStorage.setItem('el_who', JSON.stringify(who)); for (const k in pg) { localStorage.setItem(k, pg[k]); localStorage.setItem(k + 'Level', level); }
      localStorage.setItem('el_phone_seen', '1'); } catch (e) {}
  }, [student.who, student.D.pg[student.C.ls] || {}, student.C.ls, student.C.level]);
  await ctx.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') { if (REAL.test(u.host)) real.push(u.host + u.pathname); return route.abort('blockedbyclient'); }
    const rel = decodeURIComponent(u.pathname).replace(/^\/+(English-lab\/)?/, '').replace(/\/$/, '/index.html') || 'index.html';
    let b;
    if (rel === 'teacher.html') b = teacherBody(rel);
    else {
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { if (!MAY_BE_MISSING.test(rel)) missing.push(rel); return route.fulfill({ status: 404, body: '' }); }
      b = fs.readFileSync(file);
      if (student && /\.html$/.test(rel)) {
        const S = student, inject = (marker, js) => { const s = b.toString(), i = s.indexOf(marker); if (i >= 0) b = s.slice(0, i) + `<script>${js}</script>\n` + s.slice(i); };
        if (rel === 'today.html') inject('<script src="shared/js/el-catalog.js">', `window.EL_TODAY=${JSON.stringify(S.today)};window.EL_DEMO_STUDENT=${JSON.stringify(S.D)}`);
        else if (rel === S.C.dir + '/index.html') inject('<script src="../../shared/js/el-ls-home.js">', `window.EL_TODAY=${JSON.stringify(S.today)};window.EL_DEMO_LS=${JSON.stringify(S.DLS)}`);
        else if (/^lab\/(index|practice)\.html$/.test(rel)) inject('<script', `window.EL_DEMO_STUDENT=${JSON.stringify({ group: S.C.group, levels: S.D.lv, ls: S.D.ls })}`);
      }
    }
    route.fulfill({ status: 200, body: b, contentType: TYPES[path.extname(rel)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  if (student) await page.clock.setFixedTime(new Date(`${student.today}T10:30:00`));
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  const errs = [];
  const keep = (m) => { m = String(m); if (!NOISE.test(m)) errs.push(m.split('\n')[0].slice(0, 200)); };
  page.on('pageerror', (e) => keep(e.message || e));
  // an error thrown inside a timer is reported on the console here (the test clock runs the timers), so the console counts too
  page.on('console', (m) => { if (m.type() === 'error' && /^(Uncaught )?(\w*Error|TypeError|ReferenceError|SyntaxError)\b/.test(m.text())) keep(m.text()); });
  return { ctx, page, errs, real, missing };
}

// what is wrong with the page as it is now
async function look(page, size) {
  return page.evaluate(([phone, w]) => {
    const out = [], text = (document.body?.innerText || '').trim();
    if (text.length < 40) out.push('shows (almost) nothing');
    if (phone) {
      // compared with the phone's own width: a phone browser zooms out to fit a page that is too wide, so innerWidth would grow with it
      const wide = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - w;
      if (wide > 2) out.push(`is ${wide}px wider than the phone screen (it scrolls sideways or shows tiny)`);
    }
    return out;
  }, [!!size.phone, size.width]);
}
const label = (who, size, what) => `${who} · ${size.name} · ${what}`;
async function report(name, size, c, extra = []) {
  opened++;
  const found = [...new Set(c.errs.splice(0))].map((e) => 'JavaScript error: ' + e);
  if (c.missing.length) found.push('a file it needs is missing: ' + [...new Set(c.missing.splice(0))].join(', '));
  if (c.real.length) found.push('tried to reach the real database: ' + [...new Set(c.real.splice(0))].join(', '));
  found.push(...extra);
  for (const f of found) problems.push(`${name}: ${f}`);
  if (SHOTS) await c.page.screenshot({ path: path.join(SHOTS, name.replace(/[^\w.-]+/g, '_') + '.png') }).catch(() => {});
}
const settle = (page, ms = 900) => page.waitForLoadState('load').catch(() => {}).then(() => page.waitForTimeout(ms));

// ---- 1. the teacher's dashboard: every item of the side menu ----
for (const size of SIZES) {
  if (FILTER && !'teacher'.includes(FILTER) && !FILTER.startsWith('teacher')) break;
  const c = await context(size, null);
  await c.page.goto('http://el.local/teacher.html'); await settle(c.page, 1500);
  await report(label('Dashboard', size, 'Home'), size, c, await look(c.page, size));
  const items = await c.page.$$eval('#tabs button[data-g]', (a) => a.map((e) => ({ g: e.dataset.g, t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) })));
  if (items.length < 5) problems.push(label('Dashboard', size, `the side menu has only ${items.length} items`));
  const seen = new Map();
  for (const { g, t } of items) {
    const btn = c.page.locator(`#tabs button[data-g="${g}"]`).first();
    // on a phone the menu may be folded away: press the button the same way a tap would reach it
    if (!size.phone) await btn.click().catch((e) => problems.push(label('Dashboard', size, `${t}: the menu item can't be clicked (${e.message.split('\n')[0]})`)));
    else await btn.evaluate((e) => e.click());
    await settle(c.page, 600);
    const s = await c.page.evaluate((g) => {
      const on = [...document.querySelectorAll('#tabs button[data-g]')].filter((e) => e.classList.contains('on') || e.getAttribute('aria-current') === 'true' || e.getAttribute('aria-current') === 'page').map((e) => e.dataset.g);
      const m = document.getElementById('main');
      return { on: [...new Set(on)], text: (m?.innerText || '').replace(/\s+/g, ' ').trim() };
    }, g);
    const extra = await look(c.page, size);
    if (!s.on.includes(g)) extra.push(`the menu does not light up "${t}" (lit: ${s.on.join(', ') || 'nothing'})`);
    else if (s.on.length > 1) extra.push(`more than one menu item is lit (${s.on.join(', ')})`);
    if (s.text.length < 20) extra.push('the page is empty');
    const key = s.text.slice(0, 2000);
    if (seen.has(key) && seen.get(key) !== g) extra.push(`opens the same page as "${items.find((x) => x.g === seen.get(key)).t}" (a wrong link?)`);
    seen.set(key, g);
    await report(label('Dashboard', size, t), size, c, extra);
  }
  await c.ctx.close();
}

// ---- 2. the students' pages, in English (4 ESO Core) and Catalan (2 ESO Base) ----
const BOARD = ['', '#todo', '#homework', '#marks', '#progress', '#exam-practice', '#books', '#help'];
const SKIP = /^(.*-model|exam)\.html$/;   // the real exam page needs Roger's exam mode; the models are only videos
for (const S of STUDENTS) {
  const lsPages = fs.readdirSync(path.join(ROOT, S.C.dir)).filter((f) => f.endsWith('.html') && !SKIP.test(f)).sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));
  const urls = [...BOARD.map((h) => 'today.html' + h), ...lsPages.map((f) => `${S.C.dir}/${f}`), 'lab/practice.html', 'lab/practice.html#deck', 'lab/index.html']
    .filter((u) => !FILTER || u.includes(FILTER) || S.lang === FILTER);
  for (const size of SIZES) {
    const c = await context(size, S);
    for (const u of urls) {
      const name = label(`Student ${S.lang === 'en' ? '4 ESO Core (English)' : '2 ESO Base (Catalan)'}`, size, u);
      try {
        // a fresh load each time (going from today.html to today.html#marks would only change the place, not run the page again)
        await c.page.goto('about:blank');
        await c.page.goto('http://el.local/' + u, { waitUntil: 'load', timeout: 30000 }); await settle(c.page);
        await report(name, size, c, await look(c.page, size));
      } catch (e) { problems.push(`${name}: the page did not open (${e.message.split('\n')[0]})`); }
    }
    await c.ctx.close();
  }
}
await browser.close();

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s) in ${opened} page(s) opened.`);
  process.exit(1);
}
console.log(`OK: ${opened} pages opened with invented students (Chromebook normal mode, Chromebook full screen and phone): no errors, nothing empty, nothing wider than a phone, no try to reach the real database.`);
