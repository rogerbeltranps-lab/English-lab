/* Starter's three options in the secure checkpoints (Roger, 7 Nov 2026: "make checkpoints the same level and difficulty as the LPs").
   In a Starter learning path each typed answer comes with three options (ls2-engine.js choices()). A checkpoint page has no answers,
   so the options are made here, once, from the key file kept outside the repo, with the engine's own choices() (same distractors:
   verb forms, confusable word sets, other answers of the checkpoint), and written into each Starter item of the page data as `o`.
   Only the Starter route sees them (el-checkpoint.js); the other routes still type. Run again after changing a checkpoint:
     node tools/checkpoint-keys/starter-options.cjs <keys.json>          (dry run: prints the options)
     node tools/checkpoint-keys/starter-options.cjs <keys.json> --write  (writes them into the data files) */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..', '..');
const keys = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), write = process.argv.includes('--write');
const LS = { '2ESO': '2eso/free-time-live', '4ESO': '4eso/seasons-and-celebrations' };
function helpers(dir) {   // the engine's own functions, taken from its source so the options are the ones a learning path would show
  const src = fs.readFileSync(path.join(root, dir, 'ls2-engine.js'), 'utf8');
  const grab = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error(dir + ': ' + from); return src.slice(a, b); };
  const code = grab('  const norm = s =>', '\n', 0) + '\n' + grab('  const words = s =>', '\n') + '\n' + grab('  const expand = s =>', '\n') + '\n' +
    grab('  const s3 = v =>', '  function picksHtml') + '\nreturn choices;';
  return new Function(code)();
}
// authored wrong options (like item.d in a learning path) where the automatic ones are too easy or off topic
const D = {
  ls2Checkpoint22ESO: { 'c2-02': ['cold', 'windy'] },
  ls2Checkpoint32ESO: { 'c3-07': ['takes', 'taking'], 'c3-08': ["doesn't", 'not'] },
  ls2Checkpoint42ESO: { 'c4-02': ['sunny', 'cloud'], 'c4-07': ['anyone', 'every'], 'c4-08': ['watch', 'watched'] },
  ls2Checkpoint14ESO: { 'c1-06': ['present', 'presenting'] },
  ls2Checkpoint24ESO: { 'c2-02': ['dresses', 'dressing'], 'c2-04': ['short', 'shortest'] },
  ls2Checkpoint34ESO: { 'c3-02': ['will there be', 'there is will'], 'c3-05': ['colours', 'chestnuts'], 'c3-08': ['turkey', 'pumpkins'] },
  ls2Checkpoint44ESO: { 'c4-01': ['sincere', 'faithful'], 'c4-02': ['liking', 'likes'], 'c4-03': ['for', 'that'], 'c4-05': ['they', 'it'] }
};
let changed = 0;
for (const [course, dir] of Object.entries(LS)) {
  const choices = helpers(dir);
  for (const n of [1, 2, 3, 4]) {
    const key = 'ls2Checkpoint' + n + course, k = keys[key]; if (!k) throw new Error('no key ' + key);
    const file = path.join(root, dir, 'data', 'recall-checkpoint-' + n + '.js'); let txt = fs.readFileSync(file, 'utf8');
    const starter = Object.entries(k.items).filter(([id, it]) => (it.r || 'beginners') === 'beginners' && !id.startsWith('n')).map(([id, it]) => Object.assign({ id }, it, (D[key] || {})[id] ? { d: D[key][id] } : {}));
    console.log('== ' + key);
    for (const it of starter) {
      const o = choices(it, starter, key + it.id);
      if (o.length !== 3) throw new Error(key + ' ' + it.id + ': only ' + o.length + ' options');
      console.log('  ' + it.id + '  ' + it.q + '  →  ' + o.join(' | ') + '   (answer: ' + it.a[0] + ')');
      // the item in the data file: "id": "c1-01", "r": "beginners", "q": "…" (+ an old "o" line, replaced)
      const re = new RegExp('("id": "' + it.id + '",[\\s\\S]*?"q": "(?:[^"\\\\]|\\\\.)*")(,\\s*"o": \\[[^\\]]*\\])?');
      if (!re.test(txt)) throw new Error(key + ' ' + it.id + ' not found in ' + file);
      txt = txt.replace(re, (m, head) => head + ',\n     "o": ' + JSON.stringify(o).replace(/","/g, '", "'));
    }
    if (write) { fs.writeFileSync(file, txt); changed++; }
  }
}
console.log(write ? 'Wrote ' + changed + ' files.' : 'Dry run: add --write to save.');
