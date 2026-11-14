// Builds the model final product VIDEO from <course>/<ls>/<route>-model.html: one screenshot per slide (1280x720)
// + the voice recorded by voice.py (tools/model-video/out/<course>-<route>/NN.wav) -> <ls>/video/<route>-model.mp4,
// -model.vtt (captions, one cue per sentence, timed by voice.py) and -model-poster.jpg. Free: Playwright + ffmpeg, no paid service.
// Run from the repo root: node tools/model-video/build.js 2eso/free-time-live/safe-model.html
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '..', '..');
const page = process.argv[2];
const course = page.split('/')[0], lsDir = path.dirname(page), route = path.basename(page).replace('-model.html', '');
const out = path.join(__dirname, 'out', `${course}-${route}`);
const lines = JSON.parse(fs.readFileSync(path.join(out, 'lines.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...args]);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/English-lab\//, '/'));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); } });
});
const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = (s % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x}`; };
(async () => {
  await new Promise((ok) => server.listen(0, ok));
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:${server.address().port}/${page}`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.topbar,.intro,.controls,.notes-wrap,.foot,.mv-tabs,.mv,[class*=copyright]{display:none!important} .presentation-shell{display:block!important} main{padding:0!important} .stage{position:fixed!important;inset:0!important;max-width:none!important;width:1280px!important;height:720px!important;border-radius:0!important;box-shadow:none!important;margin:0!important} body{overflow:hidden!important}' });
  const n = await p.$$eval('.slide', (s) => s.length);
  if (n !== lines.length) throw new Error(`slides ${n} but script lines ${lines.length}`);
  const segs = [];
  for (let i = 0; i < n; i++) {
    await p.$$eval('.slide', (s, k) => s.forEach((x, j) => { x.hidden = j !== k; }), i);
    await p.waitForTimeout(400);
    const png = path.join(out, `${String(i).padStart(2, '0')}.png`);
    await p.screenshot({ path: png });
    const seg = path.join(out, `seg${i}.mp4`);
    ff(['-loop', '1', '-framerate', '25', '-i', png, '-i', path.join(out, `${String(i).padStart(2, '0')}.wav`), '-shortest', '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '24', '-c:a', 'aac', '-b:a', '96k', '-ar', '44100', seg]);
    segs.push(seg);
  }
  await browser.close(); server.close();
  const list = path.join(out, 'list.txt');
  fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
  const vdir = path.join(ROOT, lsDir, 'video'); fs.mkdirSync(vdir, { recursive: true });
  const mp4 = path.join(vdir, `${route}-model.mp4`);
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', mp4]);
  ff(['-i', path.join(out, '00.png'), '-q:v', '4', path.join(vdir, `${route}-model-poster.jpg`)]);
  // captions: one cue per sentence, times measured when voice.py recorded it
  let t = 0, k = 1, vtt = 'WEBVTT\n';
  for (const L of lines) {
    L.cues.forEach((c, j) => { vtt += `\n${k++}\n${ts(t + c.start)} --> ${ts(t + c.end)}\n${j === 0 && L.who ? L.who + ': ' : ''}${c.text}\n`; });
    t += L.sec;
  }
  fs.writeFileSync(path.join(vdir, `${route}-model.vtt`), vtt);
  console.log('done', mp4, (fs.statSync(mp4).size / 1e6).toFixed(1), 'MB', t.toFixed(1), 's');
})().catch((e) => { console.error(e); process.exit(1); });
