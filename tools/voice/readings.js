/* Collects every reading text of the learning paths (media.text, and the study guide's read.text: a string or one text per route) into tools/voice/readings.json,
   split into the blocks shared/js/el-read-aloud.js lights up, with its key. Exams, sample exams and recall checkpoints are left out
   (Roger, 21 Nov 2026: "Not in the exams"). The blocks and key come from el-read-aloud.js itself in a headless browser, so they
   always match what the page finds.
   Run from the repo root: node tools/voice/readings.js  (then python tools/voice/readings.py <onnx> <voices>). */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const skip = f => /exam|checkpoint/i.test(f);
const texts = [];   // [{ html, src }]
function walk(o, src) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach(x => walk(x, src));
  for (const m of [o.media, o.read]) if (m && m.text) { const t = m.text; (typeof t === 'string' ? [t] : Object.values(t)).forEach(h => typeof h === 'string' && texts.push({ html: h, src })); }
  Object.values(o).forEach(x => walk(x, src));
}
for (const ls of ['2eso', '4eso'].flatMap(c => fs.readdirSync(path.join(ROOT, c)).map(d => c + '/' + d)).filter(d => fs.existsSync(path.join(ROOT, d, 'data')))) {
  for (const sub of ['data', 'data/native', 'data/study']) {
    const dir = path.join(ROOT, ls, sub); if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js') && !skip(f))) {
      const w = { LP: { panels: [], base: [] } }; try { new Function('window', fs.readFileSync(path.join(dir, f), 'utf8'))(w); } catch (e) { console.warn('skip', f, e.message); continue; }
      walk(w.LP, ls + '/' + sub + '/' + f);
    }
  }
}
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto('about:blank'); await pg.addScriptTag({ path: path.join(ROOT, 'shared/js/el-read-aloud.js') });
  const got = await pg.evaluate(list => list.map(x => { const d = document.createElement('div'); d.className = 'reading'; d.innerHTML = x.html; const p = ELRead.parts(d); return { key: p.key, say: p.say, src: x.src }; }), texts);
  await b.close();
  const out = new Map(); got.forEach(x => { if (x.say.join('').trim() && !out.has(x.key)) out.set(x.key, x); });
  const list = [...out.values()];
  fs.writeFileSync(path.join(__dirname, 'readings.json'), JSON.stringify(list, null, 1));
  console.log('readings', list.length, 'chars', list.reduce((a, x) => a + x.say.join(' ').length, 0));
})();
