// Paper worksheets of the LS2 Learning Paths as PDFs (Roger, 30 Oct 2026). Run from the repo root:
//   node tools/lp-worksheets/build.mjs OUTDIR
//   node tools/lp-worksheets/build.mjs --summaries     (only the vocabulary and grammar summaries, into each LS's downloads folder)
// Serves the repo on a local port, prints shared/print/worksheet.html for every Learning Path and route with Playwright's Chromium,
// and writes OUTDIR/<course>/<lp>/<nn>-<lp>-<route>.pdf plus OUTDIR/<course>/<lp>/<nn>-<lp>-KEY.pdf (every route's answers, Pro last in 4 ESO).
// It also prints shared/print/summary.html for every route into <ls>/downloads/ls<n>-vocabulary-grammar-<route>.pdf (committed: the
// dashboard's Materials tab links them), so the summaries always match the Learning Paths.
// The copyright line is printed by el-copyright.js at the foot of every page. The PDFs are not committed: they go to Roger's Drive.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ONLY_SUMMARIES = process.argv.includes('--summaries');
const ROOT = process.cwd(), OUT = path.resolve(ONLY_SUMMARIES ? '.' : process.argv[2] || 'worksheets');
// Secure recall checkpoints (31 Oct 2026) have no answers or hints in the repo: pass the keys file (kept outside the repo) to print them,
//   node tools/lp-worksheets/build.mjs OUTDIR --keys <ls2-checkpoint-keys.json>
const KEYS = (i => i > 0 ? JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8')) : null)(process.argv.indexOf('--keys'));
// fills a / ca / en back into a checkpoint data file as it is served
const withKeys = src => !KEYS ? src : src + '\n;(function (K) { const fix = p => { if (!p || !p.items) return; const k = (K[(window.LP || {}).key] || {}).items || {};' +
  ' p.items = p.items.map(it => k[it.id] ? Object.assign({}, it, { a: (k[it.id].a || []).concat(k[it.id].extra || []), ca: k[it.id].ca, en: k[it.id].en }) : it); };' +
  ' ((window.LP || {}).panels || []).forEach(fix); Object.values((window.LP || {}).native || {}).forEach(fix); })(' + JSON.stringify(KEYS) + ');\n';
const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
// Pro (native, C2) only in 4 ESO, where the Learning Paths have data/native/<lp>.js
const routesOf = ls => ls.startsWith('4eso/') ? ROUTES.concat('native') : ROUTES;
const NAMES = { beginners: 'starter', insecure: 'base', safe: 'core', daring: 'plus', native: 'pro' };
// The Learning Paths with a worksheet: shared/print/lp-list.js (also read by the site's worksheet index).
const window = {}; eval(fs.readFileSync(path.join(ROOT, 'shared/print/lp-list.js'), 'utf8'));
const LSS = Object.fromEntries(Object.entries(window.LP_PRINT).map(([ls, v]) => [ls, v.lps.map(x => x[0])]));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.vtt': 'text/vtt', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/English-lab\//, '/'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  if (/data\/(native\/)?recall-checkpoint-\d+\.js$/.test(f)) return res.end(withKeys(fs.readFileSync(f, 'utf8')));
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage();
async function pdf(ls, lp, route, key, file, page_ = 'worksheet') {
  await page.goto(`http://localhost:${port}/English-lab/shared/print/${page_}.html?ls=${ls}&lp=${lp}&route=${route}${key ? '&key=1' : ''}`);
  await page.waitForSelector('body[data-ready]');
  await page.evaluate(() => document.body.classList.remove('locked'));   // the teacher gate (shared/print/teacher-gate.js) stays shut here: no sign-in
  if (await page.getAttribute('body', 'data-ready') !== '1') throw new Error('failed: ' + ls + ' ' + lp);
  await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
}
// Vocabulary and grammar summaries per route (Starter has its own since 31 Oct 2026), into the LS's downloads folder.
for (const ls of Object.keys(LSS)) {
  const n = (window.LP_PRINT[ls].title.match(/LS(\d+)/) || [])[1];
  for (const r of routesOf(ls)) await pdf(ls, '', r, false, path.join(ROOT, ls, 'downloads', `ls${n}-vocabulary-grammar-${r}.pdf`), 'summary');
  console.log('summaries', ls);
}
for (const [ls, lps] of ONLY_SUMMARIES ? [] : Object.entries(LSS)) {
  const course = ls.split('/')[0];
  for (const [i, lp] of lps.entries()) {
    const dir = path.join(OUT, course, lp), nn = String(i + 1).padStart(2, '0');
    fs.mkdirSync(dir, { recursive: true });
    const keys = [];
    for (const r of routesOf(ls)) {
      await pdf(ls, lp, r, false, path.join(dir, `${nn}-${lp}-${NAMES[r]}.pdf`));
      const k = path.join(dir, `.key-${r}.pdf`); await pdf(ls, lp, r, true, k); keys.push(k);
    }
    // One answer key per Learning Path with every route, one after the other.
    execFileSync('python3', ['-c', 'import sys; from pypdf import PdfWriter; w = PdfWriter(); [w.append(f) for f in sys.argv[2:]]; w.write(sys.argv[1])',
      path.join(dir, `${nn}-${lp}-KEY.pdf`), ...keys]);
    keys.forEach(k => fs.unlinkSync(k));
    console.log(course, lp);
  }
}
await browser.close(); server.close();
