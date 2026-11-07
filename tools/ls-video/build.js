// "About this LS" mini video: the LS goals, the final product, the grammar and the vocabulary, one slide per voice line.
// Usage: node tools/ls-video/build.js tools/ls-video/<spec>.json [--silent] [--out FILE]
//   Voice: tools/ls-video/voice/<spec name>/<line id>.mp3 (ElevenLabs, made by tools/site-video/voice.mjs-style generation
//   on Roger's PC with his OK). --silent builds a preview with no voice, timing each slide from its word count.
// Needs ffmpeg and Playwright (Chromium). Nothing here calls a paid service.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const specPath = process.argv[2];
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const NAME = path.basename(specPath, '.json');
const SILENT = process.argv.includes('--silent');
const oi = process.argv.indexOf('--out');
const OUT = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.join(ROOT, spec.folder, spec.out);
const VOICE = path.join(__dirname, 'voice', NAME);
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lsvid-'));
const T = spec.theme;
const W = 1280, H = 720, FPS = 25;
const LEAD = 0.35, TAIL = 0.55;

const ff = (args) => execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', ...args]);
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

// The illustration card of an LS video poster (the posters share one template: white card on the right).
function crop(rel) {
  const out = path.join(work, path.basename(rel, '.jpg') + '-card.png');
  if (!fs.existsSync(out)) ff(['-i', path.join(ROOT, spec.folder, rel), '-vf', 'crop=512:412:700:174', out]);
  return 'data:image/png;base64,' + fs.readFileSync(out).toString('base64');
}

const css = `*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;font-family:Inter,sans-serif;color:${T.ink};overflow:hidden;position:relative;
  background:radial-gradient(circle at 90% 8%,${T.soft} 0,transparent 36%),linear-gradient(135deg,${T.bg1},${T.bg2})}
.top{position:absolute;top:34px;left:60px;right:60px;display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:700;color:${T.muted}}
.top .ls{color:${T.dark}}
.k{display:inline-block;font-size:18px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${T.accent};margin-bottom:16px}
.wrap{position:absolute;left:80px;right:80px;top:96px;bottom:60px;display:flex;flex-direction:column;justify-content:center}
h1{font-size:76px;font-weight:850;letter-spacing:-.02em;color:${T.dark};line-height:1.04}
h2{font-size:44px;font-weight:800;letter-spacing:-.01em;color:${T.dark};line-height:1.15;margin-bottom:26px}
h2 b,.ex b,.q b,li b,.pt b,.note b{color:${T.accent}}
.sub{font-size:26px;font-weight:600;color:${T.muted};margin-top:20px}
.split{display:flex;gap:56px;align-items:center}
.split>div:first-child{flex:1}
.pic{width:470px;border-radius:24px;box-shadow:0 18px 40px rgba(20,40,60,.13);border:1px solid ${T.soft};background:#fff}
.q{font-size:52px;font-weight:800;line-height:1.2;color:${T.dark};max-width:1040px}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
.chip{background:#fff;border:2px solid ${T.soft};border-radius:999px;padding:9px 22px;font-size:24px;font-weight:700;color:${T.accent}}
ol.goals{list-style:none;padding:0;display:flex;flex-direction:column;gap:14px}
ol.goals li{display:flex;gap:20px;align-items:center;background:#fff;border:2px solid ${T.soft};border-radius:18px;padding:16px 24px;font-size:25px;font-weight:500;line-height:1.3;opacity:.45}
ol.goals li .n{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:22px;background:${T.soft};color:${T.accent}}
ol.goals li.done{opacity:.8}
ol.goals li.on{opacity:1;border-color:${T.accent};box-shadow:0 10px 28px rgba(20,40,60,.10);font-size:28px}
ol.goals li.on .n{background:${T.accent};color:#fff}
.pts{display:flex;flex-direction:column;gap:14px}
.pt{font-size:29px;font-weight:500;padding-left:34px;position:relative}
.pt:before{content:"";position:absolute;left:0;top:13px;width:14px;height:14px;border-radius:4px;background:${T.accent}}
.row{display:flex;gap:14px;flex-wrap:wrap}
.box{flex:1;min-width:140px;min-height:150px;display:flex;flex-direction:column;justify-content:center;background:#fff;border:2px solid ${T.soft};border-radius:20px;padding:22px 12px;text-align:center;font-size:26px;line-height:1.2;font-weight:700;color:${T.dark}}
.box .n{display:grid;place-items:center;width:40px;height:40px;margin:0 auto 12px;border-radius:50%;background:${T.accent};color:#fff;font-size:19px;font-weight:800}
.arrow{align-self:center;color:${T.accent};font-size:26px;font-weight:800}
.note{margin-top:30px;font-size:25px;font-weight:500;color:${T.muted}}
.bars{display:flex;flex-direction:column;gap:16px;max-width:980px}
.bar{display:flex;align-items:center;gap:20px;font-size:26px;font-weight:600}
.bar .l{width:360px}
.bar .t{flex:1;height:30px;background:#fff;border:2px solid ${T.soft};border-radius:999px;overflow:hidden}
.bar .f{height:100%;background:${T.accent};border-radius:999px}
.bar .v{width:70px;text-align:right;font-weight:800;color:${T.accent}}
.ex{font-size:34px;font-weight:500;line-height:1.35;background:#fff;border-left:8px solid ${T.accent};border-radius:14px;padding:14px 26px;margin-bottom:14px;box-shadow:0 6px 18px rgba(20,40,60,.05)}
.ex s{color:#b04848}
.spell{display:flex;gap:26px}
.spell div{flex:1;background:#fff;border:2px solid ${T.soft};border-radius:20px;padding:34px 10px;text-align:center;font-size:48px;font-weight:600}
.spell i{display:block;font-style:normal;color:${T.muted};font-size:28px;margin-bottom:10px}
.spell b{color:${T.accent};background:${T.hi};border-radius:4px}
.vg{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.vg div{background:#fff;border:2px solid ${T.soft};border-radius:18px;padding:16px 22px}
.vg b{display:block;font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:${T.accent};margin-bottom:6px}
.vg span{font-size:25px;font-weight:600}
`;

function body(s, line) {
  const top = `<div class="top"><span class="ls">${spec.course} · ${spec.ls}</span><span>English with Roger</span></div>`;
  const k = s.kicker ? `<span class="k">${s.kicker}</span>` : '';
  let m = '';
  switch (s.type) {
    case 'title': case 'end':
      m = `<div class="split"><div>${k}<h1>${s.title}</h1>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}${s.text ? `<div class="sub">${s.text}</div>` : ''}</div>${s.img ? `<img class="pic" src="${crop(s.img)}">` : ''}</div>`; break;
    case 'question':
      m = `${k}<div class="q">${s.text}</div><div class="chips">${s.chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>`; break;
    case 'goals':
      m = `<span class="k">Your goals</span><ol class="goals">${spec.goals.map((g, i) => `<li class="${i < s.on ? 'done' : i === s.on ? 'on' : ''}"><span class="n">${i + 1}</span><span>${g}</span></li>`).join('')}</ol>`; break;
    case 'card':
      m = `<div class="split"><div>${k}<h2>${s.title}</h2><div class="pts">${s.points.map((p) => `<div class="pt">${p}</div>`).join('')}</div></div>${s.img ? `<img class="pic" src="${crop(s.img)}">` : ''}</div>`; break;
    case 'parts': case 'steps':
      m = `${k}<h2>${s.type === 'parts' ? 'Seven slides' : 'Step by step'}</h2><div class="row">${s.items.map((x, i) => `<div class="box"><span class="n">${i + 1}</span>${x}</div>`).join('')}</div>${s.note ? `<div class="note">${s.note}</div>` : ''}`; break;
    case 'marks':
      m = `${k}<h2>How it is marked</h2><div class="bars">${s.rows.map(([l, v]) => `<div class="bar"><span class="l">${l}</span><span class="t"><span class="f" style="display:block;width:${v * 2.2}%"></span></span><span class="v">${v} %</span></div>`).join('')}</div>`; break;
    case 'grammar':
      m = `${k}<h2>${s.title}</h2>${s.examples.map((e) => `<div class="ex">${e}</div>`).join('')}${s.note ? `<div class="note">${s.note}</div>` : ''}`; break;
    case 'spell':
      m = `${k}<h2>Spelling: <b>-ing</b></h2><div class="spell">${s.pairs.map(([a, b]) => `<div><i>${a}</i>${b}</div>`).join('')}</div>`; break;
    case 'vocab':
      m = `${k}<h2>The words you need</h2><div class="vg">${s.groups.map(([n, w]) => `<div><b>${n}</b><span>${w}</span></div>`).join('')}</div>`; break;
    default: throw new Error('slide type ' + s.type + ' in ' + line.id);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${top}<div class="wrap">${m}</div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const parts = [];
  let total = 0;
  for (const [i, line] of spec.lines.entries()) {
    const png = path.join(work, line.id + '.png');
    await page.setContent(body(line.slide, line), { waitUntil: 'load' });
    await page.screenshot({ path: png });
    if (i === 0) fs.copyFileSync(png, path.join(work, 'poster.png'));
    const voice = path.join(VOICE, line.id + '.mp3');
    const a = SILENT ? null : voice;
    if (a && !fs.existsSync(a)) throw new Error('missing voice ' + a + ' (use --silent for a preview)');
    const len = a ? dur(a) : line.en.split(/\s+/).length / 2.35;
    const d = +(LEAD + len + TAIL).toFixed(2);
    const seg = path.join(work, line.id + '.mp4');
    const vf = `fps=${FPS},format=yuv420p,fade=t=in:st=0:d=0.25,fade=t=out:st=${(d - 0.2).toFixed(2)}:d=0.2`;
    const audio = a
      ? ['-i', a, '-filter_complex', `[1:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${LEAD * 1000}|${LEAD * 1000},apad[a]`, '-map', '0:v', '-map', '[a]']
      : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-map', '0:v', '-map', '1:a'];
    ff(['-loop', '1', '-framerate', String(FPS), '-i', png, ...audio, '-vf', vf, '-t', String(d),
      '-c:v', 'libx264', '-preset', 'medium', '-tune', 'stillimage', '-crf', '24', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', seg]);
    parts.push(seg); total += d;
    console.log(line.id, d.toFixed(1) + 's');
  }
  await browser.close();
  const list = path.join(work, 'list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const loud = SILENT ? [] : ['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11'];
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'copy', ...loud, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', OUT]);
  ff(['-i', path.join(work, 'poster.png'), '-q:v', '3', OUT.replace(/\.mp4$/, '-poster.jpg')]);
  console.log('→', path.relative(ROOT, OUT), Math.floor(total / 60) + ':' + String(Math.round(total % 60)).padStart(2, '0'));
})();
