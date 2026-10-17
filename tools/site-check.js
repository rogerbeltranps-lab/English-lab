#!/usr/bin/env node
// Weekly site health check: internal links/assets, external links, and headless page loads.
// Usage: node tools/site-check.js [--no-external]   (needs playwright + chromium)
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const skipExternal = process.argv.includes('--no-external');
const problems = [];
const add = (kind, page, msg) => problems.push({ kind, page, msg });

function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.name.startsWith('.') || f.name === 'node_modules') continue;
    const p = path.join(d, f.name);
    f.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const pages = walk(root).filter(f => f.endsWith('.html'));
const rel = f => path.relative(root, f);
const external = new Map();

// 1. Static pass: internal href/src targets and anchors
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]));
  for (const m of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const u = m[1].trim();
    if (/^(mailto:|tel:|javascript:|data:|#?$)/.test(u) || u.includes('${')) continue;
    if (/^https?:\/\//.test(u)) { if (!external.has(u)) external.set(u, rel(f)); continue; }
    const [pathPart, hash] = u.split('#');
    // GitHub Pages serves the repo under /English-lab/, so root-absolute links map to the repo root
    const target = pathPart ? (pathPart.startsWith('/') ? path.join(root, pathPart.split('?')[0].replace(/^\/English-lab/, '')) : path.resolve(path.dirname(f), pathPart.split('?')[0])) : f;
    let t = target;
    if (fs.existsSync(t) && fs.statSync(t).isDirectory()) t = path.join(t, 'index.html');
    if (!fs.existsSync(t)) { add('broken-internal', rel(f), u); continue; }
    if (hash && t.endsWith('.html') && !pathPart) { if (!ids.has(hash)) add('missing-anchor', rel(f), '#' + hash); }
  }
}

// 2. External links
// curl honours HTTPS_PROXY (Node's fetch does not), so it also works in sandboxed runners
async function checkExternal() {
  const { execFileSync } = require('child_process');
  const failed = [];
  for (const [u, from] of external) {
    let code = '000';
    for (const args of [['-I'], []]) {
      try {
        code = execFileSync('curl', ['-sL', ...args, '-o', '/dev/null', '-w', '%{http_code}', '-A', 'Mozilla/5.0', '--max-time', '20', u], { encoding: 'utf8' }).trim();
      } catch (e) { code = '000'; }
      if (code < 400 && code !== '000') break;
    }
    if (code === '000' || code >= 400) { failed.push({ u, from, code }); }
  }
  // If nothing at all was reachable, the runner has no outbound network: report once, not per link
  if (failed.filter(x => x.code === '000').length >= external.size / 2) add('external-skipped', '-', 'most external hosts unreachable from this runner (network policy?); external links not verified');
  else failed.forEach(x => add('broken-external', x.from, `${x.u} -> ${x.code}`));
}

// 3. Load every page in headless Chromium
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/English-lab/, ''));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  for (const f of pages) {
    const page = await browser.newPage();
    const name = rel(f);
    page.on('pageerror', e => add('js-error', name, e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED/.test(m.text())) add('console-error', name, m.text()); });
    page.on('requestfailed', r => { if (r.url().startsWith(base)) add('failed-request', name, r.url().replace(base, '')); });
    page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) add('http-' + r.status(), name, r.url().replace(base, '')); });
    await page.goto(`${base}/${name}`, { waitUntil: 'load', timeout: 20000 }).catch(e => add('load-fail', name, e.message));
    await page.waitForTimeout(1000);
    // Smoke-click: each visible tab/route/check/flip button should not throw
    const btns = await page.$$('button:not([disabled])');
    for (const b of btns.slice(0, 40)) {
      if (!(await b.isVisible().catch(() => false))) continue;
      await b.click({ timeout: 1000, trial: false }).catch(() => {});
    }
    await page.close();
  }
  await browser.close(); server.close();
  if (!skipExternal) await checkExternal();
  const seen = new Set();
  const uniq = problems.filter(p => { const k = JSON.stringify(p); return seen.has(k) ? false : seen.add(k); });
  console.log(`Pages checked: ${pages.length}; external links: ${external.size}; problems: ${uniq.length}`);
  for (const p of uniq) console.log(`[${p.kind}] ${p.page}: ${p.msg}`);
  process.exit(uniq.length ? 1 : 0);
})();
