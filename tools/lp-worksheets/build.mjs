// Paper worksheets of the LS2 Learning Paths as PDFs (Roger, 30 Oct 2026). Run from the repo root:
//   node tools/lp-worksheets/build.mjs OUTDIR
// Serves the repo on a local port, prints shared/print/worksheet.html for every Learning Path and route with Playwright's Chromium,
// and writes OUTDIR/<course>/<lp>/<nn>-<lp>-<route>.pdf plus OUTDIR/<course>/<lp>/<nn>-<lp>-KEY.pdf (the four routes' answers).
// The copyright line is printed by el-copyright.js at the foot of every page. The PDFs are not committed: they go to Roger's Drive.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = process.cwd(), OUT = path.resolve(process.argv[2] || 'worksheets');
const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
const NAMES = { beginners: 'starter', insecure: 'base', safe: 'core', daring: 'plus' };
// The Learning Paths with a worksheet: shared/print/lp-list.js (also read by the site's worksheet index).
const window = {}; eval(fs.readFileSync(path.join(ROOT, 'shared/print/lp-list.js'), 'utf8'));
const LSS = Object.fromEntries(Object.entries(window.LP_PRINT).map(([ls, v]) => [ls, v.lps.map(x => x[0])]));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.vtt': 'text/vtt', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/English-lab\//, '/'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage();
async function pdf(ls, lp, route, key, file) {
  await page.goto(`http://localhost:${port}/English-lab/shared/print/worksheet.html?ls=${ls}&lp=${lp}&route=${route}${key ? '&key=1' : ''}`);
  await page.waitForSelector('body[data-ready]');
  if (await page.getAttribute('body', 'data-ready') !== '1') throw new Error('failed: ' + ls + ' ' + lp);
  await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
}
for (const [ls, lps] of Object.entries(LSS)) {
  const course = ls.split('/')[0];
  for (const [i, lp] of lps.entries()) {
    const dir = path.join(OUT, course, lp), nn = String(i + 1).padStart(2, '0');
    fs.mkdirSync(dir, { recursive: true });
    const keys = [];
    for (const r of ROUTES) {
      await pdf(ls, lp, r, false, path.join(dir, `${nn}-${lp}-${NAMES[r]}.pdf`));
      const k = path.join(dir, `.key-${r}.pdf`); await pdf(ls, lp, r, true, k); keys.push(k);
    }
    // One answer key per Learning Path with the four routes, one after the other.
    execFileSync('python3', ['-c', 'import sys; from pypdf import PdfWriter; w = PdfWriter(); [w.append(f) for f in sys.argv[2:]]; w.write(sys.argv[1])',
      path.join(dir, `${nn}-${lp}-KEY.pdf`), ...keys]);
    keys.forEach(k => fs.unlinkSync(k));
    console.log(course, lp);
  }
}
await browser.close(); server.close();
