/* ✅ Correct together: the slides (Roger, 12 Nov 2026: "find how I do the reading corrections for everybody in class, covering the levels";
   then "don't change any reading that's already done in class or set as homework").
   Reads the Learning Path's own data file (window.LP, the same one the students' page reads) and changes nothing in it: the answers, the
   sentences to highlight and the reading-log model notes come from the data or from shared/correct/notes.js (window.EL_CORRECT).
   Two kinds of reading (AGENTS.md "Correct together"):
   · a list of questions with r: tags (Learning Paths): one text that grows with the level, the same questions for everyone plus extras for
     Base, Core and Plus. One slide per question, "Everyone" first, then the extras, each with the levels that have it.
   · an object with one list per route (sample exams): each level its own questions on the same text. Slide n shows question n of
     every level side by side.
   Pro (4 ESO, data/native/<lp>.js) has its own essay and questions: its slides come last, only when the group has a Pro student.
   Same route rules as ls2-engine.js (forLevel, byLevel). Classic script: works in the page and in Node (tests). */
(function (root) {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring', 'native'];
  const NAME = { beginners: 'Starter', insecure: 'Base', safe: 'Core', daring: 'Plus', native: 'Pro' };
  const ri = r => ROUTES.indexOf(r || 'beginners');
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (o.en || o.ca || '');
  // the same as ls2-engine.js: beginners → insecure, daring → safe when the data has no text of its own
  const byLevel = (o, r) => o == null ? '' : typeof o === 'string' ? o : (o[r] != null ? o[r] : o.safe != null && r === 'daring' ? o.safe : o.insecure);
  const forLevel = (items, r) => !items ? [] : Array.isArray(items) ? items.filter(x => ri(x.r) <= ri(r) && (!x.only || x.only.includes(r))) : (items[r] || (r === 'beginners' ? items.insecure : null) || []);
  const qid = it => String(it && (it.id || it.q) || '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plain = h => String(h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const answerOf = it => it.o ? it.o[0] : it.a ? [].concat(it.a)[0] : '';

  /* ---------- the text of a level, cut into sentences ---------- */
  // after . ! ? … (and a closing quote) followed by a space and a word that does not go on the sentence (not "10.00", not "…”, and");
  // a list number ("4.") stays with its sentence
  function sentences(para) {
    const out = [];
    para.split(/(?<=[.!?…]["”’)]*)\s+(?=[^a-z,;:0-9])/).map(x => x.trim()).filter(Boolean).forEach(x => {
      if (out.length && /^\d+\.$/.test(out[out.length - 1])) out[out.length - 1] += ' ' + x; else out.push(x);
    });
    return out;
  }
  // a paragraph per block, a sentence per unit; a chat (4 ESO LP1: readingChat) is one unit per message, with the speaker
  function units(html, chat) {
    if (chat) return chat.map(([w, l], i) => ({ p: i, who: w, s: plain(l).trim() }));
    const out = [];
    plain(html).split(/\n+/).map(x => x.trim()).filter(Boolean).forEach((para, p) => {
      sentences(para).forEach(s => out.push({ p, s }));
    });
    return out;
  }
  const STOP = new Set('a an the and or but of to in on at for from with by is are was were be been being it its this that these those there here what which who whom whose when where why how do does did doing done have has had i you he she we they me him her us them my your his our their not no yes as so if than then too very can will would could should may might must also just only about into over after before up down out off all some any every each other one two three four five more most much many such own same few both again once true false text word words mean means meaning say says said tell tells show shows why'.split(' '));
  const stem = w => w.replace(/'s$/, '').replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '').replace(/(.)\1$/, '$1');
  const toks = s => (String(s).toLowerCase().replace(/[’‘]/g, "'").match(/[a-zà-ÿ0-9']+/g) || []).filter(w => w.length > 1 && !STOP.has(w)).map(stem);
  // the phrases a question quotes, each as its parts around a gap ("Lunar New Year ___ in China…" → ["Lunar New Year", "in China"])
  const quoted = s => (String(s).match(/[“"«]([^”"»]+)[”"»]/g) || []).map(q => q.slice(1, -1).replace(/\s*(…|\.\.\.)\s*$/, '').split(/_{2,}/).map(x => x.trim()).filter(x => x.length > 2)).filter(x => x.length);
  const has = (s, phrase) => String(s).toLowerCase().replace(/[’‘]/g, "'").includes(String(phrase).toLowerCase().replace(/[’‘]/g, "'"));

  // the sentence(s) of a level's text that answer the question: an override (notes.js ev) wins, else the best match of the answer's and
  // the question's words (answer words count three times, a quoted phrase from the question wins outright)
  function evidence(us, it, over) {
    if (over === false) return [];
    if (over) {
      const ph = [].concat(over), hit = [];
      ph.forEach(x => { const i = us.findIndex(u => has(u.s, x)); if (i >= 0 && !hit.some(h => h.i === i)) hit.push({ i, phrase: x }); });
      if (hit.length) return hit.sort((a, b) => a.i - b.i);
    }
    const q = tx(it.q), ans = [].concat(it.o ? it.o[0] : it.a || []), qs = quoted(q);
    const at = new Set(toks(ans.join(' '))), qt = new Set(toks(q.replace(/[“"«][^”"»]+[”"»]/g, ' ')));
    let best = -1, bi = -1;
    us.forEach((u, i) => {
      const w = new Set(toks((u.who || '') + ' ' + u.s));
      let sc = 0; at.forEach(t => { if (w.has(t)) sc += 3; }); qt.forEach(t => { if (w.has(t)) sc += 1; });
      qs.forEach(ps => { if (ps.every(p => has(u.s, p))) sc += 20; });
      if (ans.some(a => a.length > 3 && has(u.s, a))) sc += 6;
      if (sc > best) { best = sc; bi = i; }
    });
    if (best <= 0) return [];
    // a chat message with several sentences: mark only the one that answers
    const u = us[bi];
    if (u.who) { const ss = sentences(u.s); if (ss.length > 1) { const sub = units(ss.join('\n')); const e = evidence(sub, it); if (e.length) return [{ i: bi, phrase: sub[e[0].i].s, sub: true }]; } }
    return [{ i: bi }];
  }

  /* ---------- the slides ---------- */
  // panel: the reading step (type mc / quiz with media.text, or a reading log: type step with fields)
  // ctx: {LP, key ("<ls>/<lp>"), routes (the course's routes, Pro left out), chat (readingChat or null), notes (EL_CORRECT[key] or {})}
  function textFor(ctx, panel, r) {
    const src = panel.media && panel.media.text ? panel : ctx.textPanel || panel;
    const m = src.media && src.media.text;
    if (m === true && ctx.chat) { const c = byLevel(ctx.chat, r); return { html: '', units: units('', c), chat: true }; }
    const html = byLevel(m, r) || '';
    return { html, units: units(html) };
  }
  function slidesFor(ctx, panel, pro) {
    const routes = pro ? ['native'] : ctx.routes, N = (ctx.notes || {}), evOver = (N.ev || {})[panel.id + (pro ? '.native' : '')] || {};
    const out = [], kind = panel.fields ? 'log' : Array.isArray(panel.items) ? 'shared' : 'own';
    const texts = {}; routes.forEach(r => { texts[r] = textFor(ctx, panel, r); });
    const ev = (r, it) => { const o = evOver[qid(it)]; const x = o && typeof o === 'object' && !Array.isArray(o) ? (o[r] !== undefined ? o[r] : o.all) : o; return evidence(texts[r].units, it, x); };
    if (kind === 'log') {
      const fields = panel.fields.filter(f => routes.some(r => forLevel([f], r).length));
      const model = (N.log || {})[panel.id + (pro ? '.native' : '')] || {};
      out.push({ kind: 'log', panel: panel.id, pro, routes, note: (N.logNote || {})[panel.id] || '', rows: fields.map(f => ({ id: f.id, label: tx(f.label), cells: routes.map(r => forLevel([f], r).length ? (model[f.id] || {})[r] || '' : null) })) });
      return out;
    }
    if (kind === 'shared') {
      const items = panel.items.map((it, n) => ({ it, n, on: routes.filter(r => forLevel([it], r).length) })).filter(x => x.on.length);
      // Everyone first, then Base+, Core+, Plus (stable: the data's order inside each group)
      items.sort((a, b) => (a.on.length === routes.length ? -1 : ri(a.on[0])) - (b.on.length === routes.length ? -1 : ri(b.on[0])) || a.n - b.n);
      items.forEach(({ it, on }) => out.push({
        kind: 'shared', panel: panel.id, pro, q: tx(it.q), ans: answerOf(it), alt: it.a ? [].concat(it.a).slice(1) : [], mc: !!it.o, qid: qid(it), routes, on, all: on.length === routes.length,
        per: on.map(r => ({ r, num: forLevel(panel.items, r).indexOf(it) + 1, ev: ev(r, it), units: texts[r].units, chat: !!texts[r].chat }))
      }));
      return out;
    }
    const n = Math.max(0, ...routes.map(r => forLevel(panel.items, r).length));
    for (let i = 0; i < n; i++) out.push({
      kind: 'own', panel: panel.id, pro, routes, num: i + 1,
      per: routes.map(r => { const it = forLevel(panel.items, r)[i]; return it ? { r, q: tx(it.q), ans: answerOf(it), mc: !!it.o, qid: qid(it), ev: ev(r, it), units: texts[r].units, chat: !!texts[r].chat } : { r, none: true }; })
    });
    return out;
  }

  // the snippet shown under a level: the paragraph's sentences around the evidence, the evidence marked (h: highlight on): the whole
  // sentence, or in a chat message only the sentence of the message that answers (sub)
  function snippet(per, h) {
    const us = per.units, ev = per.ev || [];
    if (!ev.length) return '';
    const keep = new Set(); ev.forEach(e => { keep.add(e.i); if (us[e.i - 1] && us[e.i - 1].p === us[e.i].p && !per.chat) keep.add(e.i - 1); if (us[e.i + 1] && us[e.i + 1].p === us[e.i].p && !per.chat) keep.add(e.i + 1); });
    const idx = [...keep].sort((a, b) => a - b);
    let html = '', last = -2;
    idx.forEach(i => {
      const u = us[i], e = ev.find(x => x.i === i);
      if (last >= 0 && i !== last + 1) html += ' … ';
      else if (last === -2 && i > 0 && us[i - 1].p === u.p) html += '… ';
      let s = esc(u.s);
      if (e && h) s = e.sub ? s.replace(new RegExp(esc(e.phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), m => '<mark>' + m + '</mark>') : '<mark>' + s + '</mark>';
      html += (per.chat ? (html ? '<br>' : '') + '<b>' + esc(u.who) + ':</b> ' : (html && !/… $/.test(html) ? ' ' : '')) + s;
      last = i;
    });
    if (!per.chat && us[last + 1] && us[last + 1].p === us[last].p) html += ' …';
    return html;
  }

  const api = { ROUTES, NAME, byLevel, forLevel, qid, esc, plain, units, evidence, slidesFor, snippet, textFor, answerOf };
  root.ELCorrect = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
