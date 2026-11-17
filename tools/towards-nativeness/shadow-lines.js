// Towards Nativeness: lists the sentences for the 🗣 Shadowing steps as JSON for shadow.py. One clip per learning path (the first natural
// version of each ✨ Make it idiomatic sentence) and one per batch of My latest mistakes (its spoken and idiom sentences; the 3 newest
// batches, the ones the page shows).
// Usage (repo root): node tools/towards-nativeness/shadow-lines.js > /tmp/tn-shadow.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', '..', '4eso', 'towards-nativeness', 'data');
const KEYS = { 'talking-to-your-tech': 'tech', 'getting-things-done': 'done', 'telling-the-story': 'story', 'writing-like-a-teacher': 'teacher' };
const run = f => { const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx); return ctx.window; };
const out = [];
for (const [f, key] of Object.entries(KEYS)) {
  const w = run(f + '.js'), p = w.LP.panels.find(x => x.type === 'idiom');
  if (p) out.push({ key, title: w.LP.title + ': your sentences, the native way', file: 'shadow-' + key, sentences: p.items.map(i => i.a[0]) });
}
const W = run('my-latest-mistakes.js');
for (const b of W.TN_MISTAKES.slice(0, 3)) {
  const s = [].concat(b.spoken || [], b.idiom || []).map(i => i.a[0]);
  if (s.length) out.push({ key: 'mistakes_' + b.id, title: 'Your sentences from ' + b.date + ', the native way', file: 'shadow-mistakes-' + b.id, sentences: s });
}
process.stdout.write(JSON.stringify(out, null, 1));
