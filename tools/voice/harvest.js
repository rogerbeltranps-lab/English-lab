/* Collects every English text a flashcard can say (word + example), for every route, into tools/voice/lines.json.
   Sources: LS2 data files (vocab groups + review, Pro panels), the pages with a #flashcard (LS1 and Getting started, read in a
   headless browser for every route and both card directions), LS1 vocabMap/examples (lab/practice.html word cards) and flashcards/cards.json.
   Run from the repo root: node tools/voice/harvest.js  (then python tools/voice/generate.py). */
const fs = require('fs'), path = require('path'), http = require('http');
const V = require('../../shared/js/el-voice.js');
const ROOT = path.resolve(__dirname, '../..');
const out = new Map();
const add = (t, src) => { const n = V.norm(t); if (!n || !/[a-z]/i.test(n)) return; const k = V.key(n); if (!out.has(k)) out.set(k, { key: k, text: n, say: V.speakable(n), src }); };

// LS2 data: any {groups|review:[{items:[[en, ca, ex]]}]} or {items:[{en, ex}]} anywhere in LP / LP.native
function walk(o, src) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach(x => walk(x, src));
  ['groups', 'review'].forEach(f => Array.isArray(o[f]) && o[f].forEach(g => (g.items || []).forEach(it => {
    if (Array.isArray(it)) { add(it[0], src); if (it[2]) add(it[2], src); } else if (it && it.en) { add(it.en, src); if (it.ex) add(it.ex, src); }
  })));
  Object.values(o).forEach(x => walk(x, src));
}
for (const ls of ['2eso/free-time-live', '4eso/seasons-and-celebrations']) {
  for (const sub of ['data', 'data/native']) {
    const dir = path.join(ROOT, ls, sub); if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
      const w = { LP: { panels: [], base: [] } }; try { new Function('window', fs.readFileSync(path.join(dir, f), 'utf8'))(w); } catch (e) { console.warn('skip', f, e.message); continue; }
      walk(w.LP, ls + '/' + sub + '/' + f);
    }
  }
}
try { JSON.parse(fs.readFileSync(path.join(ROOT, 'flashcards/cards.json'), 'utf8')).forEach(c => add(c.term, 'flashcards')); } catch (e) {}

// pages: headless browser
const pages = [];
(function find(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/node_modules|\.git|audio|docs|tools/.test(f)) find(p); } else if (f.endsWith('.html')) { const h = fs.readFileSync(p, 'utf8'); if (/id="flashcard"|const vocabMap\s*=/.test(h)) pages.push(path.relative(ROOT, p)); } } })(path.join(ROOT, '2eso')), (function find(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!/audio|video/.test(f)) find(p); } else if (f.endsWith('.html')) { const h = fs.readFileSync(p, 'utf8'); if (/id="flashcard"|const vocabMap\s*=/.test(h)) pages.push(path.relative(ROOT, p)); } } })(path.join(ROOT, '4eso'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); }); }).listen(0, async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch(); const pg = await b.newPage();
  await pg.route(/gstatic|googleapis|firebase|google/, r => r.abort());
  for (const u of pages) {
    try { await pg.goto('http://localhost:' + srv.address().port + '/' + u); await pg.waitForTimeout(800); } catch (e) { console.warn('fail', u); continue; }
    const got = await pg.evaluate(`(() => { const r = [], lv = [...new Set([...document.querySelectorAll('.route[data-level]')].map(b => b.dataset.level).concat(['beginners','insecure','safe','daring','native']))];
      const push = (w, x) => { if (w) r.push(String(w)); if (x) r.push(String(x)); };
      try { if (typeof vocabMap !== 'undefined') JSON.stringify(vocabMap, (k, v) => { if (typeof v === 'string') r.push(v); return v; }); } catch (e) {}
      try { if (typeof examples !== 'undefined') Object.values(examples).forEach(v => r.push(String(v))); } catch (e) {}
      const L0 = typeof level !== 'undefined' ? level : null;
      for (const l of lv) { try { level = l; } catch (e) {}
        try { if (typeof deck === 'function') deck().forEach(v => push(v.expression || v[0], v.example || v[3])); } catch (e) {}
        try { if (typeof levels !== 'undefined' && levels[l] && levels[l].cards) levels[l].cards.forEach(v => push(v[0], v[3])); } catch (e) {}
        try { if (typeof cardDeck === 'function') { const d0 = state.cardDir; state.cardDir = 'en'; cardDeck().forEach(v => push(v[0], v[3])); state.cardDir = 'ca'; cardDeck().forEach(v => push(v[1], v[3])); state.cardDir = d0; } } catch (e) {}
      }
      try { level = L0; } catch (e) {}
      return r; })()`);
    const before = out.size; got.forEach(t => add(t, u)); console.log(u, got.length, '+' + (out.size - before));
  }
  await b.close(); srv.close();
  const list = [...out.values()];
  fs.writeFileSync(path.join(__dirname, 'lines.json'), JSON.stringify(list, null, 1));
  console.log('lines', list.length, 'chars', list.reduce((a, x) => a + x.say.length, 0));
});
