// The student board in Catalan (a Base route) for the "How English Lab works" video, drawn from this repo with the board's own demo
// mode (window.EL_DEMO_STUDENT: sample data, no Firebase, nothing saved). Runs offline: the pages are served from the repo files.
// Usage: node tools/site-video/capture-demo.mjs [outdir]   → r3-03-board-ca.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'tools/site-video/captures'));
const DEMO = { me: { name: 'Your name', group: '4ESOA' }, rs: {}, lv: { '4eso-seasons-and-celebrations': { level: 'insecure', by: 'teacher' } }, pg: {},
  ls: { '4eso-my-real-routine': { status: 'closed' }, '4eso-seasons-and-celebrations': { status: 'open' }, '2eso-my-real-routine': { status: 'hidden' }, '2eso-free-time-live': { status: 'hidden' } }, pt: {}, tm: {} };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };

const browser = await chromium.launch(process.env.EL_CHANNEL ? { channel: process.env.EL_CHANNEL } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
await page.route('http://el.local/**', async (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
  let body = fs.readFileSync(file);
  if (rel === 'today.html') {
    const s = body.toString(), i = s.indexOf('<script src="shared/js/el-catalog.js">');
    body = s.slice(0, i) + `<script>window.EL_DEMO_STUDENT=${JSON.stringify(DEMO)}</script>\n` + s.slice(i);
  }
  route.fulfill({ status: 200, body, contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
});
await page.goto('http://el.local/today.html');
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(OUT, 'r3-03-board-ca.png') });
await browser.close();
console.log('shot r3-03-board-ca.png');
