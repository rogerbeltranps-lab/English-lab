// Pictures for the students' picture guide on Help (today.html#help; Roger, 7 Nov 2026: "instead of the videos (which are obsolete)
// I need a guide with images so that students can check it if they want"). Real pages of this repo, offline, with invented students
// (tools/site-video/board/demo.mjs: Alex Sample, 4 ESO Core, English; Pau Exemple, 2 ESO Base, Catalan): no Firebase, nothing saved.
// Chromebook size (1366 × 768), the students' screen. Students never see locked things, and the class full screen is not shown.
// Usage: node tools/help-guide/capture.mjs en|ca [only,ids]   → shared/img/help/<id>-<lang>.webp (needs python3 + Pillow to make WebP)
// Run it again when the student pages change a lot, then bump HELP_V in today.html so browsers fetch the new pictures.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { demo } from '../site-video/board/demo.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const LANG = process.argv[2] === 'ca' ? 'ca' : 'en';
const ONLY = process.argv[3] ? process.argv[3].split(',') : null;
const OUT = path.join(ROOT, 'shared/img/help');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'help-guide-'));
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const SCALE = 1.5, W = 1366, H = 768;

const EN = LANG === 'en';
const { today, demo: D } = demo(LANG, 'mid');
const C = EN ? { course: '4eso', dir: '4eso/seasons-and-celebrations', ls: '4eso-seasons-and-celebrations', ls1: '4eso-my-real-routine', group: '4ESOA', level: 'safe', lp: 'where-traditions-come-from', lpKey: 'ls2Traditions4ESO' }
  : { course: '2eso', dir: '2eso/free-time-live', ls: '2eso-free-time-live', ls1: '2eso-my-real-routine', group: '2ESOA', level: 'insecure', lp: 'now-or-usually', lpKey: 'ls2NowUsually2ESO' };
const open = D.ls[C.ls].open[C.group];
const info = { status: 'open', open: { [C.group]: open } };   // no pull-up: the class full screen is not for the guide
D.ls[C.ls] = info;
const pg = D.pg[C.ls];

// the class games of LP1–LP2 with a result and a few mistakes, for 🧩📚 Games and theory
const P = (n) => `${C.course}-ls2-lp${n}`;
const theory = (() => { const s = fs.readFileSync(path.join(ROOT, 'lab/game/decks/theory.js'), 'utf8'); return JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)); })();
const firstQ = (id, k) => { const p = theory[id].parts.find((x) => x.k === k) || theory[id].parts[0]; return p.slides[0].theory; };
const myGames = {
  g1: { deck: P(1) + '-vocab', ls: C.ls, kind: 'vocab', lp: 'LP1', title: theory[P(1) + '-vocab'].title, r: 9, of: 10, sid: Date.parse(`${'2026-10-27'}T10:00`), miss: [] },
  g2: { deck: P(1) + '-grammar', ls: C.ls, kind: 'grammar', lp: 'LP1', title: theory[P(1) + '-grammar'].title, r: 7, of: 10, sid: Date.parse('2026-10-28T10:00'),
    miss: EN ? [{ q: 'My grandparents ___ (visit) us every Christmas.', a: 'visits', ok: 'visit', p: 'p1' }, { q: '___ your family celebrate Diwali?', a: 'Do', ok: 'Does', p: theory[P(1) + '-grammar'].parts[1]?.k || 'p1' }, { q: 'We always ___ (eat) grapes at midnight.', a: 'eats', ok: 'eat', p: 'p1' }]
      : [{ q: 'She ___ (play) football on Mondays.', a: 'play', ok: 'plays', p: 'p1' }, { q: '___ you go to the park after school?', a: 'Does', ok: 'Do', p: theory[P(1) + '-grammar'].parts[1]?.k || 'p1' }, { q: 'I ___ (not watch) TV at night.', a: "doesn't watch", ok: "don't watch", p: 'p1' }] },
  g3: { deck: P(2) + '-vocab', ls: C.ls, kind: 'vocab', lp: 'LP2', title: theory[P(2) + '-vocab'].title, r: 8, of: 10, sid: Date.parse('2026-11-03T10:00'), miss: [] },
};
const notes = [{ deck: P(1) + '-grammar', parts: { p1: { text: EN ? 'he / she / it + verb + -s\nDo / Does for questions' : 'he / she / it + verb + -s\nDo / Does per a les preguntes' } } }];
const played = { [P(1) + '-vocab']: Date.parse('2026-10-27T10:00'), [P(1) + '-grammar']: Date.parse('2026-10-28T10:00'), [P(2) + '-vocab']: Date.parse('2026-11-03T10:00') };
const DLS = { role: 'student', group: C.group, level: C.level, info, pg, rs: D.rs, notes, myGames, played };
const WHO = { role: 'student', group: C.group, ca: !EN, uid: 'demo' };

// the learning path in progress (LP3): its Listening not done yet, so the picture shows it answered and checked now
const lpNotDone = (k) => { const o = JSON.parse(pg[C.lpKey]); delete o.done[k]; delete o.doneAt[k]; return { [C.lpKey]: JSON.stringify(o) }; };
const toTop = (sel, off = 90) => `(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(e)scrollTo({top:e.getBoundingClientRect().top+scrollY-${off},behavior:'instant'})})()`;
// the pictures: page, what to do on it (click, a script), and the part of the screen to keep (a selector, or the whole screen)
const SHOTS = [
  { id: 'board', url: 'today.html' },
  { id: 'menu', url: 'today.html', clip: 'aside.side', pad: 0 },
  { id: 'ls', url: `${C.dir}/index.html` },
  { id: 'lp', url: `${C.dir}/${C.lp}.html`, pg: lpNotDone('listen'), click: '.tab[data-panel="listen"]',
    run: `(()=>{const f=document.querySelector('#listenForm');const qs=f.querySelectorAll('.question');qs.forEach((q,i)=>{const r=q.querySelector('input[value="'+(i===qs.length-2?1:0)+'"]');if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}});
      document.querySelector('#listenCheck').click();setTimeout(()=>{const e=document.querySelector('#listenCheck');scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight+200,behavior:'instant'})},200)})()` },
  { id: 'cards', url: `${C.dir}/${C.lp}.html`, click: '.tab[data-panel="vocab"]', run: toTop('#flashcard', 260) },
  { id: 'notes', url: `${C.dir}/index.html#notes`, run: toTop('.ncard:nth-of-type(2), .ncard + .ncard', 30) },
  { id: 'marks', url: 'today.html#marks' },
  { id: 'marks-lps', url: 'today.html#marks', run: toTop('#ptbox + *', 30) },
  { id: 'marks-exam', url: 'today.html#marks', click: `[data-do="ls"][data-ls="${C.ls1}"]`, click2: '[data-do="tab"][data-t="exam"]', run: toTop('#ptbox + *', 30) },
  { id: 'practise', url: 'lab/practice.html' },
  { id: 'games', url: 'lab/' },
  // previews of the guide itself (only when named: node capture.mjs en help,help-open → PNG in $PREVIEW_DIR or the system temp folder)
  { id: 'help', url: 'today.html#help', preview: true, full: true },
  { id: 'help-phone', url: 'today.html#help', preview: true, full: true, w: 390, h: 844, run: `document.querySelectorAll('details.hgp')[0].open=true` },
  { id: 'help-open', url: 'today.html#help', preview: true, full: true, run: `document.querySelectorAll('details.hgp')[3].open=true` },
];

const browser = await chromium.launch();
for (const S of SHOTS) {
  if (ONLY ? !ONLY.includes(S.id) : S.preview) continue;
  const ctx = await browser.newContext({ viewport: { width: S.w || W, height: S.h || H }, deviceScaleFactor: SCALE, locale: EN ? 'en-GB' : 'ca-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([who, pgs, lvKey, lv]) => {   // who was signed in on this browser (el-app.js draws the student's menu) and the answers
    try { localStorage.setItem('el_who', JSON.stringify(who)); for (const k in pgs) localStorage.setItem(k, pgs[k]); localStorage.setItem(lvKey, lv); localStorage.setItem('el_phone_seen', '1'); } catch (e) {}
  }, [WHO, { ...pg, ...(S.pg || {}) }, C.lpKey + 'Level', C.level]);
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'el.local') return route.fulfill({ status: 404, body: '' });
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '').replace(/\/$/, '/index.html') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    let body = fs.readFileSync(file);
    const inject = (marker, js) => { const s = body.toString(), i = s.indexOf(marker); if (i >= 0) body = s.slice(0, i) + `<script>${js}</script>\n` + s.slice(i); };
    if (rel === 'today.html') inject('<script src="shared/js/el-catalog.js">', `window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_STUDENT=${JSON.stringify(D)}`);
    if (/\/index\.html$/.test(rel) && rel.startsWith(C.dir)) inject('<script src="../../shared/js/el-ls-home.js">', `window.EL_TODAY=${JSON.stringify(today)};window.EL_DEMO_LS=${JSON.stringify(DLS)}`);
    if (/^lab\/(index|practice)\.html$/.test(rel)) inject('<script', `window.EL_DEMO_STUDENT=${JSON.stringify({ group: C.group, levels: D.lv, ls: D.ls })}`);
    route.fulfill({ status: 200, body, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(`${today}T10:30:00`));
  page.on('pageerror', (e) => console.error(S.id, 'page error:', e.message));
  await page.goto('http://el.local/' + S.url);
  await page.waitForTimeout(1500);
  if (S.click) { await page.click(S.click); await page.waitForTimeout(500); }
  if (S.click2) { await page.click(S.click2); await page.waitForTimeout(500); }
  if (S.run) { await page.evaluate(S.run); await page.waitForTimeout(700); }
  const png = path.join(TMP, `${S.id}-${LANG}.png`);
  let clip = null;
  if (S.clip) clip = await page.evaluate(([sel, pad]) => { const e = [...document.querySelectorAll(sel)].find((x) => x.offsetParent); if (!e) return null; const r = e.getBoundingClientRect();
    return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: r.width + 2 * pad, height: Math.min(r.height + 2 * pad, innerHeight) }; }, [S.clip, S.pad ?? 10]);
  if (S.preview) { const out = path.join(process.env.PREVIEW_DIR || TMP, `${S.id}-${LANG}.png`); await page.screenshot({ path: out, fullPage: !!S.full }); console.log('preview', out); await ctx.close(); continue; }
  await page.screenshot({ path: png, ...(clip ? { clip } : {}) });
  const webp = path.join(OUT, `${S.id}-${LANG}.webp`);
  execFileSync('python3', ['-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB");im.save(sys.argv[2],"WEBP",quality=82,method=6)', png, webp]);
  console.log('shot', path.relative(ROOT, webp), clip ? 'clip' : 'screen', fs.statSync(webp).size >> 10, 'KB');
  await ctx.close();
}
await browser.close();
