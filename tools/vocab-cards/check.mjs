// Every study card must be on the Explora word list (Roger, 8 Nov 2026), for every route of every LS2-style Learning Path.
// It reads each <ls>/data/*.js (and data/native/*.js) that has a vocab panel and checks, route by route, with the engine's forLevel rule:
//   - English → Català cards = groups + review: the engine lists both in Explora, so a review word must not be missing its meaning;
//   - Català → English cards = the panel's core words: every core word must be an item the route sees in Explora.
// Usage: node tools/vocab-cards/check.mjs   (exit 1 and a list of problems if anything is off)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
const lsDirs = ['2eso', '4eso'].flatMap(c => fs.readdirSync(c).map(d => path.join(c, d)))
  .filter(d => fs.existsSync(path.join(d, 'ls2-engine.js')));
const problems = []; let panels = 0;
for (const d of lsDirs) {
  const engine = fs.readFileSync(path.join(d, 'ls2-engine.js'), 'utf8');
  const ROUTES = (engine.match(/const ROUTES = (\[[^\]]*\])/) || [])[1];
  const routes = ROUTES ? JSON.parse(ROUTES.replace(/'/g, '"')) : ['beginners', 'insecure', 'safe', 'daring'];
  const files = ['data', 'data/native'].flatMap(s => { const p = path.join(d, s); return fs.existsSync(p) ? fs.readdirSync(p).filter(f => f.endsWith('.js')).map(f => path.join(p, f)) : []; });
  for (const f of files) {
    const ctx = { window: {} };
    try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), ctx); } catch { continue; }
    const LP = ctx.window.LP;
    for (const p of (LP && LP.panels || []).filter(p => p.type === 'vocab')) {
      panels++;
      for (const level of f.includes('/native/') ? ['native'] : routes) {
        const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => routes.indexOf(x.r || 'beginners') <= routes.indexOf(level) && (!x.only || x.only.includes(level))) : (items[level] || (level === 'beginners' ? items.insecure : null) || []);
        const groups = forLevel(p.groups).concat(forLevel(p.review || []));
        const list = new Set(groups.flatMap(g => g.items.map(x => norm(x[0]))));
        groups.forEach(g => g.items.forEach(x => { if (!x[1]) problems.push(`${f} · ${level} · "${x[0]}" has no meaning`); }));
        const c = p.core, core = !c ? [] : Array.isArray(c) ? c : forLevel(c);
        core.filter(w => !list.has(norm(w))).forEach(w => problems.push(`${f} · ${level} · core card "${w}" is not on the Explora list`));
      }
    }
  }
}
if (problems.length) { console.log(problems.join('\n')); console.log(`\n${problems.length} problem(s) in ${panels} vocab panels.`); process.exit(1); }
console.log(`OK: every study card is on its Explora list (${panels} vocab panels, every route).`);
