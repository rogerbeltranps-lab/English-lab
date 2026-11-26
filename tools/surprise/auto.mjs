// 🎲 Automatic Surprise questions (Roger, 21 Nov 2026: "Both" — written questions where an SLP has them, automatic ones from the SLP's
// own words and grammar for the rest). Reads each learning path's data file of an LS and writes <ls dir>/data/surprise-auto.js:
// window.EL_SURPRISE_AUTO[bank]["activity#panel"][route] = [{tier, q, ca?, h}], drawn by shared/js/el-surprise.js (pool) only for SLPs with
// no written question. Run it again when an LP's data changes: node tools/surprise/auto.mjs
//   vocabulary tab → tier 1 (a sentence about you with one core word) and tier 2 (your week with two core words)
//   💬 expressions → tier 1 (your own sentence like a model sentence of the tab)
//   reading / listening → tier 2 (what you remember from that text, two things)
//   grammar / mixed → tier 3 (three sentences about you and people you know with that grammar, a model sentence as help)
//   talk → its partner's questions (tiers 3 and 4); speaking / writing → the path's speaking task said out loud (tier 4)
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LSS = [
  { bank: '2eso-free-time-live', dir: '2eso/free-time-live', id: f => '2eso/ls2-' + f },
  { bank: '4eso-seasons-and-celebrations', dir: '4eso/seasons-and-celebrations', id: f => '4eso/ls2-' + f }
];
const ROUTES = ['beginners', 'insecure', 'safe', 'daring'], CAT = r => r === 'beginners' || r === 'insecure';
const tx = (v, en) => !v ? '' : typeof v === 'string' ? v : (en ? v.en : v.ca) || v.en || '';
const clean = s => String(s || '').replace(/^(Reading|Listening|Listen again|Listen|Speaking|Talk|Writing|Piece \d+|Mixed practice|Grammar)\s*:\s*/i, '').replace(/\s+/g, ' ').trim();
const your = s => s.replace(/\bmy\b/gi, 'your').replace(/\bI\b/g, 'you');
const forR = (it, r) => !it.only || it.only.includes(r) || (r === 'daring' && it.only.includes('safe') && !it.only.includes('daring') && false);
const full = it => { const a = [].concat(it.a || [])[0]; if (!it.q || !a || /→|:|“/.test(it.q) || (it.q.match(/_{3,}/g) || []).length !== 1) return ''; const f = it.q.replace(/_{3,}(\s*\([^)]*\))?/, a).replace(/\s*\([^)]*\)\s*$/, '').trim(); return /_{2,}/.test(f) ? '' : f; };
const take = (arr, n, seed) => { const out = []; for (let i = 0; i < arr.length && out.length < n; i++) out.push(arr[(i * 7 + seed) % arr.length]); return [...new Set(out)]; };
function load(file) { const ctx = { window: {}, document: undefined, console }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); return ctx.window.LP; }
function qs(p, r, lp) {
  const out = [], ca = CAT(r), push = (tier, q, c, h) => out.push(Object.assign({ tier, q }, ca && c ? { ca: c } : {}, h ? { h } : {}));
  const ty = p.type, id = p.id, t = clean(tx(p.title, true)), ps = lp.panels || lp.base || [];
  if (ty === 'vocab' && p.core) {
    const w = p.core[r] || p.core.insecure || p.core.safe || [];
    take(w, 4, 1).forEach(x => push(0, `Say a sentence about you with “${x}”.`, `Digues una frase sobre tu amb «${x}».`, r === 'beginners' ? `I… ${x}…` : [x]));
    for (let i = 0; i + 1 < Math.min(w.length, 8); i += 2) push(1, `Tell me about your week. Use “${w[i]}” and “${w[i + 1]}”.`, `Explica'm la teva setmana. Fes servir «${w[i]}» i «${w[i + 1]}».`, r === 'beginners' ? `This week I… ${w[i]}…` : [w[i], w[i + 1]]);
  } else if ((/^vocab/.test(id) || id === 'vocabEx') && p.items) {
    take(p.items.filter(it => forR(it, r)).map(full).filter(Boolean), 4, 2).forEach(m => push(0, `Say your own sentence like this one: “${m}”`, `Digues una frase teva com aquesta: «${m}»`, r === 'beginners' ? m.split(' ').slice(0, 3).join(' ') + '…' : null));
  } else if (/^(grammar|mixed)/.test(id) && p.items) {
    const gp = /^(mixed|choose|review)/i.test(t) || /^mixed/.test(id) ? ps.find(x => /^grammar/.test(x.id) && x.items) || p : p;
    const g = clean(tx(gp.title, true)).replace(/\?$/, ''), ms = take(p.items.filter(it => forR(it, r)).map(full).filter(Boolean), 3, 3);
    ms.forEach(m => push(2, `Say three sentences about you and people you know. Use this grammar: ${g}.`, `Digues tres frases sobre tu i gent que coneixes. Fes servir aquesta gramàtica: ${g}.`, r === 'beginners' ? m : ['like this: ' + m]));
  } else if (/^(read|listen|again)/.test(id) && t) {
    push(1, `What do you remember from “${t}”? Tell me two things.`, `Què recordes de «${t}»? Explica'n dues coses.`, r === 'beginners' ? 'I remember that…' : null);
  } else if (id === 'talk' && Array.isArray(p.partner)) {
    const qq = p.partner.filter(x => x && x.q); qq.forEach((x, i) => push(i < qq.length / 2 ? 2 : 3, x.q, x.ca || '', null));
  } else if (/^(speak|write)/.test(id)) {
    const sp = ps.find(x => x.id === 'speak' && x.task) || (id === 'speak' ? p : null), en = sp && sp.task && (sp.task.safe || sp.task.daring);
    if (en && !/\b(write|words)\b/i.test(en)) push(3, en.replace(/\s*\(\d+[–-]\d+\s*s(econds)?\)\.?$/, '.').replace(/\.\.$/, '.'), ca ? String(sp.task[r] || '').replace(/<[^>]+>/g, '').replace(/\s*\([^)]*segons\)\.?$/, '.') : '', null);
  }
  return out;
}
for (const L of LSS) {
  const dd = path.join(ROOT, L.dir, 'data'), out = {};
  for (const f of fs.readdirSync(dd).filter(f => f.endsWith('.js') && !/^(surprise|book|recall-checkpoint|sample-exam|reflect|free-time-vlog|celebration-day-proposal)/.test(f))) {
    let lp; try { lp = load(path.join(dd, f)); } catch (e) { console.warn('skip', f, e.message); continue; }
    const ps = lp && (lp.panels || lp.base); if (!ps || typeof lp.n !== 'number') continue;
    ps.forEach(p => { if (/^(recall|shadow|book|check)/.test(p.id)) return; const per = {}; ROUTES.forEach(r => { const q = qs(p, r, lp); if (q.length) per[r] = q; });
      if (Object.keys(per).length) out[L.id(f.replace(/\.js$/, '')) + '#' + p.id] = per; });
  }
  const body = '/* Generated by tools/surprise/auto.mjs from the learning paths\' data: automatic 🎲 Surprise questions for SLPs with no written question (shared/js/el-surprise.js). */\nwindow.EL_SURPRISE_AUTO = window.EL_SURPRISE_AUTO || {};\nwindow.EL_SURPRISE_AUTO[' + JSON.stringify(L.bank) + '] = ' + JSON.stringify(out, null, 0).replace(/\],"/g, '],\n"').replace(/\},"/g, '},\n"') + ';\n';
  fs.writeFileSync(path.join(dd, 'surprise-auto.js'), body);
  console.log(L.bank, Object.keys(out).length, 'SLPs');
}
