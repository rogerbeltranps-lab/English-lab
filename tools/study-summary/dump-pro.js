// Reads the 4 ESO LS2 Pro (native) data files and writes the data for the Pro study summary (pro.py).
// Usage: node tools/study-summary/dump-pro.js OUT.json   (run from the repo root)
// Rebuild when a Pro Learning Path's vocabulary or grammar changes (data/native/*.js).
const fs = require('fs'), vm = require('vm');
const dir = '4eso/seasons-and-celebrations/data/native/';
const strip = h => String(h).replace(/<br\s*\/?>/g, ' · ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function load(file) {
  const ctx = { window: { LP: { panels: [] } } };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(dir + file, 'utf8'), ctx);
  return ctx.window;
}
// Answers are stored in lower case: capitalise I, names and the first word when the gap starts the sentence.
const answer = q => { const a = q.a[0].replace(/\bi\b/g, 'I').replace(/sant joan/g, 'Sant Joan'); return /(→|^)\s*___/.test(q.q) ? a[0].toUpperCase() + a.slice(1) : a; };
// Grammar = the typed 'grammar' panel: how it works (explain) + practice with answers.
const grammar = p => p && p.type === 'typed' && p.explain ? [{ title: p.title, how: p.explain,
  practice: p.items.map(q => [strip(q.q), answer(q), strip(q.en || '')]) }] : [];
const gs = load('getting-started.js').GS_NATIVE;
const lps = [{ n: 1, title: 'Getting started', vocab: gs.vocab.map(g => ({ name: g.g, items: g.items })), grammar: [] }];
[[2, 'Celebrations around the world', 'celebrations-around-the-world.js'], [3, 'Where traditions come from', 'where-traditions-come-from.js'],
 [4, 'Research it right', 'research-it-right.js'], [5, 'Plan the day', 'plan-the-day.js'], [6, 'Write to the head teacher', 'write-to-the-head-teacher.js']]
  .forEach(([n, title, file]) => {
    const N = load(file).LP.native || {};
    lps.push({ n, title, vocab: N.vocab ? N.vocab.groups.map(g => ({ name: g.g, items: g.items })) : [], grammar: grammar(N.grammar) });
  });
fs.writeFileSync(process.argv[2], JSON.stringify({ course: '4eso', ls: 'LS2 Seasons & Celebrations',
  order: 'Learning Path 4 (Research it right) has no new vocabulary or grammar: it trains reading, sources and paraphrase.',
  gintro: 'Learning Path 1 is a warm-up and Learning Path 4 trains research skills: they have no new grammar. The word formation, open cloze and multiple-choice cloze tasks are on the pages.', lps }, null, 1));
