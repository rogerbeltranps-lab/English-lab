// Screens of the student board (today.html) for the "Your student board" video, drawn from this repo in the board's demo mode
// (window.EL_DEMO_STUDENT with the invented student of demo.mjs: no Firebase, nothing saved), offline.
// Each state is one full-page picture (1280 px wide at 1.5×) and the boxes of the parts the video points at, in picture pixels.
// Usage: node tools/site-video/board/capture.mjs en|ca [outdir]   → <outdir>/<lang>-<state>.png + <outdir>/<lang>-boxes.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { demo } from './demo.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const LANG = process.argv[2] === 'ca' ? 'ca' : 'en';
const OUT = path.resolve(process.argv[3] || path.join(HERE, 'captures'));
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const SCALE = 1.5;

// the states: page phase (mid / end of LS2), the LS and tab on screen, and what to do before the picture
const LS = LANG === 'ca' ? { ls1: '2eso-my-real-routine', ls2: '2eso-free-time-live' } : { ls1: '4eso-my-real-routine', ls2: '4eso-seasons-and-celebrations' };
const STATES = [
  { id: 'top', phase: 'mid', tab: 'week' },
  { id: 'form', phase: 'mid', tab: 'form' },
  { id: 'detail', phase: 'mid', tab: 'form', click: `[data-do="cell"][data-a="${LANG === 'ca' ? '2eso/ls2-what-are-they-doing' : '4eso/ls2-plan-the-day'}"]`, dialog: true },
  { id: 'crit', phase: 'mid', tab: 'form', click: '.sum [data-do="crit"]', dialog: true },
  { id: 'fpmid', phase: 'mid', tab: 'fp' },
  { id: 'fp', phase: 'end', tab: 'fp' },
  { id: 'endform', phase: 'end', tab: 'form' },
  { id: 'ls1', phase: 'mid', tab: 'exam', ls: LS.ls1 },
  { id: 'exam2', phase: 'mid', tab: 'exam' },
];
const only = process.argv[4] ? process.argv[4].split(',') : null;

const browser = await chromium.launch();
const boxes = {};
for (const S of STATES) {
  if (only && !only.includes(S.id)) continue;
  const { today, demo: D } = demo(LANG, S.phase);
  const page = await browser.newPage({ viewport: { width: 1280, height: S.dialog ? 1010 : 720 }, deviceScaleFactor: SCALE, locale: LANG === 'ca' ? 'ca-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  await page.clock.setFixedTime(new Date(`${today}T10:30:00`));
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
  page.on('pageerror', (e) => console.error(S.id, 'page error:', e.message));
  await page.goto('http://el.local/today.html');
  await page.waitForTimeout(1200);
  if (S.ls) { await page.click(`[data-do="ls"][data-ls="${S.ls}"]`); await page.waitForTimeout(300); }
  if (S.tab) { await page.click(`[data-do="tab"][data-t="${S.tab}"]`); await page.waitForTimeout(400); }
  if (S.click) { await page.click(S.click); await page.waitForTimeout(400); }
  // the boxes: every element with an id-like hook the shots can name (see shots.mjs), in picture pixels
  const b = await page.evaluate(() => {
    const R = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)] };
    const out = {}, add = (k, el) => { if (el) out[k] = R(el) };
    const q = (s) => document.querySelector(s), qa = (s) => [...document.querySelectorAll(s)];
    add('h1', q('h1')); add('sub', q('#sub'));
    add('ann', q('.box.ann')); add('points', q('#ptbox .box')); add('work', q('.box.work')); add('workbar', q('.box.work .wkgrid'));
    add('workmiss', q('.box.work .ptmiss')); add('howto', qa('#note .pend').find((x) => /🎬/.test(x.textContent)));
    add('late', q('.pend.late')); add('ptno', q('#ptbox .ptno')); add('ptmissbox', q('#ptbox .ptmiss'));
    add('lscard', q('.lscard')); add('lspick', q('.lspick')); add('lvline', q('.lvline')); add('btabs', q('.btabs'));
    qa('.lsbtn').forEach((x, i) => add('lsbtn' + i, x));
    qa('.btab').forEach((x) => add('tab-' + [...x.classList].find((c) => c.startsWith('b-')).slice(2), x));
    add('askbtn', q('.lvline [data-do="ask"]')); add('lsopen', q('.lsopen'));
    // week tab
    qa('.tabbody > .box').forEach((x, i) => add('box' + i, x));
    add('study', q('.box.study')); add('practice', qa('.box.study')[1]); add('wkbox', q('.wkbox')); add('examday', q('.wkbox .exam'));
    add('hw', q('.wkbox .hw')); add('wknow', q('.wkbox .wk.now')); add('wkall', q('.wkbox details.all > summary'));
    // formative tab
    add('fhead', q('.fhead')); add('nextbox', q('.nextbox')); add('lpsum', q('.lpsum')); add('lptable', q('.lpst'));
    qa('.lpst tbody tr').forEach((x, i) => add('lprow' + i, x));
    add('lpmiss', q('.lpst tr.miss')); add('lptabsmiss', q('.lpst tr.miss .stp.no')); add('amber', q('.lpst .stp.lt'));
    add('lock', qa('.lpst .s-off').find((x) => /🔒/.test(x.textContent))?.closest('tr'));
    add('score', q('.lpst td.sc')); { const sc = qa('.lpst td.sc'); if (sc.length) { const a = R(sc[0]), b = R(sc[Math.min(5, sc.length - 1)]); out.scorecol = [a[0], a[1], a[2], b[1] + b[3] - a[1]] } } add('scorecp', qa('.lpst tbody tr').find((x) => /checkpoint/i.test(x.textContent))?.querySelector('td.sc'));
    add('prog', q('.box.prog')); add('wsplit', q('.wsplit')); add('wbig', q('.wbig')); add('progwarn', q('.box.prog .ptmiss'));
    add('prtable', q('.prt')); qa('.prt tbody tr').forEach((x, i) => add('pr' + i, x));
    add('prdaily', q('.prt tr.daily')); add('prtotal', q('.prt tr.tot'));
    add('avg', qa('.box').find((x) => /average mark|nota mitjana/i.test(x.textContent) && x.querySelector('.lphead'))); add('crits', q('.sum')?.closest('.box'));
    add('critpill', q('.sum [data-do="crit"]'));
    { const c = q('.sum')?.closest('.box'), r = qa('.sum tbody tr')[2]; if (c && r) { const a = R(c), b = R(r); out.crittop = [a[0], a[1], a[2], b[1] + b[3] - a[1]] } }
    add('cprow', qa('.lpst tbody tr').find((x) => /checkpoint/i.test(x.querySelector('td')?.textContent || '')));
    // dialog
    add('dlg', q('#dlg[open] #dlgc') || null);
    // final product tab
    qa('.t-fp .box').forEach((x, i) => add('fpbox' + i, x));
    add('fpsteps', q('.t-fp .fpst')); add('fpans', q('.t-fp .ans')); add('fpfeedback', q('.t-fp .fb'));
    add('fprubric', qa('.t-fp .box').pop()); add('fpmark', q('.t-fp .lphead > b')); add('fpreview', q('.t-fp .fpst a.go'));
    // exam tab
    qa('.t-exam > .box').forEach((x, i) => add('ex' + i, x));
    add('wrub', q('.wrub')); qa('.wrub .wr').forEach((x, i) => add('wr' + i, x));
    add('wbands', q('.wrub .wbands')); add('wbandon', q('.wrub .wbands li.on')); add('wweight', q('.wrub .wwt'));
    add('wfb', q('.t-exam .fb')); add('werrs', qa('.t-exam .xt.corr').pop()); add('wtexts', q('.wtexts')); add('rvl', q('.rvl')?.closest('.box'));
    add('qtable', q('.t-exam .xt.corr')); add('qrow0', q('.t-exam .xt.corr tbody tr')); add('qlp', q('.t-exam .xt.corr .rv a'));
    add('exver', q('.t-exam .tag')); add('wr1mist', qa('.wrub .wr')[1] && [...qa('.wrub .wr')[1].querySelectorAll('.wrw')].pop());
    out._page = [document.documentElement.scrollWidth, document.documentElement.scrollHeight];
    return out;
  });
  if (!S.dialog) { await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); }
  const file = `${LANG}-${S.id}.png`;
  if (S.dialog) await page.screenshot({ path: path.join(OUT, file) });
  else await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  for (const k in b) if (k !== '_page') b[k] = b[k].map((v) => Math.round(v * SCALE));
  if (S.dialog) { const sy = await page.evaluate(() => scrollY); for (const k in b) if (k !== '_page') b[k][1] -= Math.round(sy * SCALE); }
  boxes[S.id] = b;
  console.log('shot', file, b._page.join('×'));
  await page.close();
}
await browser.close();
const bf = path.join(OUT, `${LANG}-boxes.json`);
const old = fs.existsSync(bf) ? JSON.parse(fs.readFileSync(bf, 'utf8')) : {};
fs.writeFileSync(bf, JSON.stringify({ ...old, ...boxes }, null, 1));
