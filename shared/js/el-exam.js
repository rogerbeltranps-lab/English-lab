// 🎯 What's in the exam (Roger, 9 Nov 2026, from Salma's suggestion in 4ESO B: "a section covering what will be on the exam, as well as the
// key terms we need to know"; Roger: "sometimes we don't do all the theory, so when I check that we've done something we could have a section
// of what will be in the exam with the SLP and the theory … and the theory of the games … where they see their notes"; he chose ONE page with
// 📝 Your notes). The LS home's #notes place (el-notes.js draws it) shows, learning path by learning path, ONLY what the group has done:
//  - the tabs (SLPs) ticked on the Time plan or on a class day already past: ls/{id}.done[group] = {"activity#panel": day}, the same map the
//    board's "What we've done" reads (the dashboard copies it, doneSync); a class game the group played counts too (ls/{id}.played);
//  - 🔑 key terms: the words of every done tab that has a word list (p.groups, at the student's route, as the tab's Explore shows them);
//  - 🧩 grammar: the "How it works" boxes of every done tab that has them (p.explain, at the student's route); a Vocabulary step's
//    boxes are 💬 Expressions (ex: true), shown apart from the grammar;
//  - 🎮 the class games of that learning path with their theory, the student's notes, result and what to study (el-notes.js card).
// Learning paths dropped for the group (✂ on the Time plan, p._dropped) are out and named as "not in your exam". Checkpoints, the sample exam,
// the final product and Reflect are not learning paths here. Nothing that has not been done shows, so nothing locked shows.
// Content comes from each learning path's own data file (data/<page>.js, data/native/<page>.js for Pro), read as text and run on a private
// object, so the LS page's window.LP is never touched. No Firestore reads: the ls doc is already read by el-cloud.js.
// A new LS needs only <script src="../../shared/js/el-exam.js"> before el-notes.js on its home page.
window.ELExam = (function () {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring', 'native'];
  // the engine's own route filter (ls2-engine.js forLevel): items with r up to the route, or one list per route
  const forLevel = (items, level) => !items ? [] : Array.isArray(items)
    ? items.filter(x => x && ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level) && (!x.only || x.only.includes(level)))
    : (items[level] || (level === 'beginners' ? items.insecure : level === 'native' ? items.daring : null) || []);
  const files = {}, ME = document.currentScript && document.currentScript.src;
  // 📓 the notebook cover counts the latest answers too (Roger, 22 Nov 2026: "students must be their last version even on the cover"):
  // LATEST[activity][step] = {r: right now, of: questions}, filled by build for every step it draws (el-notebook.js lsSum reads it)
  const LATEST = {};
  // the section tabs of every activity (el-sections.js), loaded here when the page doesn't have them (an LS1 home, building LS2's chapter)
  let secP = null;
  const sections = () => window.EL_SECTIONS || !ME ? Promise.resolve() : secP || (secP = new Promise(ok => {
    const sc = document.createElement('script'); sc.src = new URL('./el-sections.js', ME).href; sc.onload = sc.onerror = () => ok(); document.head.append(sc); }));
  const src = url => files[url] || (files[url] = fetch(url, { cache: 'no-cache' }).then(r => r.ok ? r.text() : '').catch(() => ''));
  // base: the LS's folder from this page ('' for this LS; '../other-ls/' for another LS of the course, in the one 📓 notebook)
  async function lpData(href, native, base) {
    const page = String(href || '').replace(/[?#].*$/, '').replace(/\.html$/, ''), W = {}, b = base || '';
    const run = s => { if (s) try { new Function('window', s)(W); } catch (e) { console.warn('exam data', page, e); } };
    run(await src(b + 'data/' + page + '.js'));
    if (native && W.LP) run(await src(b + 'data/native/' + page + '.js'));
    if (W.LP && W.GS_NATIVE) W.LP._gsn = W.GS_NATIVE;   // 4 ESO LS2 Getting started: Pro's own lists (its essay, readText)
    return W.LP || null;
  }
  // the learning paths of this LS, in the order of the LS page (its <ol class="lps">), without checkpoints, extras and the final product
  function lps(doc) {
    return [...(doc || document).querySelectorAll('ol.lps a.lp[data-a]')]
      .filter(a => !a.classList.contains('cp') && !a.classList.contains('extra'))
      .map(a => ({ id: a.dataset.a, href: a.getAttribute('href'), n: ((a.querySelector('.n') || {}).textContent || '').trim(), title: ((a.querySelector('.t b') || {}).textContent || '').trim() }))
      .filter(x => x.href && !/^final product/i.test(x.title));
  }
  const sample = doc => { const a = (doc || document).querySelector('ol.lps a.lp[href*="sample-exam"]'); return a ? a.getAttribute('href') : null; };
  // another LS of the course, for the one 📓 notebook of every LS (Roger, 13 Nov 2026): its home page, read as text once
  const homes = {};
  const home = base => homes[base] || (homes[base] = src(base + 'index.html').then(h => h ? new DOMParser().parseFromString(h, 'text/html') : null));
  // the group's plan: exam day and the learning paths dropped for it
  function plan(LS, gid) {
    const W = window.ELWeek, x = W && gid ? (W.plans(gid) || []).find(y => y.ls === LS) : null;
    return { exam: x ? W.exam(x.p, x.gi) : null, dropped: x ? ((x.p._dropped || {})[x.gi] || []) : [] };
  }
  // done: {"activity#panel": day} · level: a route id · ca: Catalan for Starter/Base · games: {lpNumber: true} played
  async function build({ LS, gid, done, level, ca, played, base, rs }) {
    level = ROUTES.includes(level) ? level : 'insecure';
    PH = !!((window.EL_LS || []).find(l => l.id === LS) || {}).personal;   // 📱 phone words count as phone only in a personal LS (as its engine)
    const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca ? (o.ca || o.en) : (o.en || o.ca));
    if (base) await sections();
    const pl = plan(LS, gid), out = [], dropped = [], doc = base ? await home(base) : document;
    // the tabs the teacher excused (elExcused: work lost by the old Submit lock): shown as optional, never as to do (Roger, 14 Nov 2026)
    const RS = {}; try { const o = rs || (window.ELCloud && ELCloud.results ? await ELCloud.results() : null); Object.entries(o || {}).forEach(([k, r]) => { if (r) RS[r.activity || k] = r; }); } catch (e) { }
    if (!doc) return { lps: [], dropped: [], exam: pl.exam, sample: null };
    for (const a0 of lps(doc)) {
      const a = base ? Object.assign({}, a0, { href: base + a0.href }) : a0;
      if (pl.dropped.includes(a.id)) { dropped.push(a); continue; }
      const secs = (window.EL_SECTIONS || {})[a.id] || [], tabs = secs.filter(([id]) => done && done[a.id + '#' + id]).map(([id, name]) => ({ id, name, day: done[a.id + '#' + id] }));
      const st = mine0(a.id), tried = st && st.items && Object.keys(st.items).length;
      const fbAny = Object.values(Object.assign({}, (RS[a.id] || {}).replies, (RS[a.id] || {}).answers)).some(x => x && String(typeof x === 'object' ? x.t || '' : x).trim());
      if (!tabs.length && !(played && played[a.n]) && !tried && !fbAny) continue;
      const LP = await lpData(a0.href, level === 'native', base);
      const panels = ((LP && LP.panels) || []).map(p => level === 'native' && LP.native && LP.native[p.id] ? Object.assign({ id: p.id }, LP.native[p.id]) : p);
      const on = new Set(tabs.map(x => x.id)), mine = panels.filter(p => on.has(p.id));
      const terms = [], grammar = [], parts = [];
      // the level in a set's name ("Traditions (Safe)"): the route sets add up (a Plus student also has the Core ones, as on the learning
      // path), so the notebook leaves the label out (Roger, 13 Nov 2026: "why does she have Core and plus mixed up?")
      const nolv = s => String(s || '').replace(/\s*\((?:Beginners|Insecure|Safe|Daring|Native|Starter|Base|Core|Plus|Pro)(?: words| route)?\)/g, '');
      const termsOf = p => Array.isArray(p.groups) && p.type !== 'self' ? forLevel(p.groups, level).map(g => ({ g: nolv(tx(g.g)), items: (g.items || []).filter(Array.isArray).map(x => ({ en: x[0], ca: x[1], ex: x[2] })) })).filter(g => g.items.length) : [];
      // a Vocabulary step's boxes are 💬 Expressions, not grammar (Roger, 16 Nov 2026): ex = true
      const gramOf = p => { const ex = forLevel(p.explain, level).map(x => nolv(tx(x))).filter(Boolean); return ex.length ? [Object.assign({ title: nolv(tx(p.title)), boxes: ex }, p.type === 'vocab' || p.id === 'vocabEx' ? { ex: true } : {})] : []; };
      mine.forEach(p => { terms.push(...termsOf(p)); grammar.push(...gramOf(p)); });
      // 📓 the notebook, tab by tab in the learning path's order: what was done in class (key terms, how it works) and the student's own
      // answers to the activities, their latest answers (22 Nov 2026), as the teacher would correct them (Roger, 13 Nov 2026)
      // 💬 the teacher's feedback on each step (Roger, 18 Nov 2026: "apart from the corrections, students should see their feedback"):
      // results/{activity}.replies[step] (the writing, speaking and talk corrections, the answers to a hand-in) and answers[step].t (the
      // answer to the student's comment), as el-corrections.js shows them at the top of the step's tab; levels never. A writing comes
      // with the text the student handed in (state.steps[step].f[0].v). Steps with feedback but no panel go in one 💬 Feedback part.
      const R = RS[a.id] || {}, fbOf = id => { const text = [((R.answers || {})[id] || {}).t, (R.replies || {})[id]].filter(x => x && String(x).trim()).join('\n\n');
        if (!text) return null; const h = ((st && st.steps) || {})[id], pn = panels.find(x => x.id === id);
        return { text, corr: !!((R.levels || {})[id] && Object.keys(R.levels[id]).length) || (!!(R.fbSig || {})[id] && id !== 'reflect'),
          orig: pn && pn.type === 'writing' && h && h.f && h.f[0] ? String(h.f[0].v || '') : '' }; };
      panels.forEach(p => {
        const sec = secs.find(([id]) => id === p.id), tab = tabs.find(x => x.id === p.id), work = firstTry(p, st, tx), fb = fbOf(p.id);
        if (work && work.of) (LATEST[a.id] || (LATEST[a.id] = {}))[p.type === 'vocab' ? 'vocab' : p.id] = { r: work.right, of: work.of };
        if (!tab && !work && !fb) return;
        // (Roger, 13 Nov 2026: "even if the students don't do the activities, they must appear in the notebook, not done, with a note
        // (to do / per fer, depending on the level), and the theory of the SLPs too"): a tab done in class that the student hasn't done
        // shows its questions, unanswered, under a "To do" note; its theory shows anyway
        const sd = (st && st.done) || {}, did = p.type === 'vocab' ? !!sd.practice : !!sd[p.id];
        const todo = work || did || fb || ['info', 'summary', 'self'].includes(p.type) ? null : toDo(p, level, tx);
        const exk = window.elExcused ? elExcused(a, RS[a.id]) : [], stp = window.elSecSteps ? elSecSteps(a, p.id) : [], opt = !!todo && stp.length > 0 && stp.every(k => exk.includes(k));
        parts.push({ id: p.id, name: sec ? sec[1] : tx(p.tab) || tx(p.title), title: tx(p.title), day: tab ? tab.day : null, kind: p.type === 'vocab' || (Array.isArray(p.groups) && !p.explain) ? 'vocab' : p.explain ? 'grammar' : /read|book/i.test(p.id + ' ' + tx(p.tab)) ? 'read' : /listen/i.test(p.id) ? 'listen' : 'other',
          terms: termsOf(p), grammar: gramOf(p), text: readText(p, level, LP), work, todo, opt, fb });
      });
      const left = [...new Set([...Object.keys(R.replies || {}), ...Object.keys(R.answers || {})])].filter(k => !panels.some(p => p.id === k)).map(k => fbOf(k)).filter(Boolean);
      if (left.length) parts.push({ id: 'fb', name: ca ? 'Feedback del professor' : 'Your teacher\'s feedback', title: '', day: null, kind: 'fb', terms: [], grammar: [], work: null, todo: null, opt: false, fb: left.length > 1 ? { many: left } : left[0] });
      out.push(Object.assign({}, a, { tabs, terms, grammar, parts }));
    }
    const sm = sample(doc);
    return { lps: out, dropped, exam: pl.exam, sample: sm && base ? base + sm : sm };
  }
  /* 📖 the text of a Reading step, at the student's route, so it can be read again in the notebook (Roger, 25 Nov 2026: "Add the reading
     texts in students notebooks"): media.text (a string, or one text per route, as ls2-engine.js byLevel picks it: Pro → Plus → Core, Starter
     → Base); 4 ESO LS2 Getting started keeps its chat in media.chat (one per route) and Pro reads its essay (GS_NATIVE.readingHtml).
     Only the repo's own text, without scripts or on… handlers. '' when the step has no text. */
  const byLv = (o, level) => o == null ? '' : typeof o === 'string' ? o : (o[level] != null ? o[level] : level === 'native' && o.daring != null ? o.daring
    : o.safe != null && (level === 'daring' || level === 'native') ? o.safe : o.insecure != null ? o.insecure : '');
  function readText(p, level, LP) {
    const m = (p && p.media) || {}; let h = '';
    if (m.text === true) {
      if (level === 'native' && LP && LP._gsn && LP._gsn.readingHtml) h = LP._gsn.readingHtml;
      else { const c = m.chat && (m.chat[level] || (level === 'native' && m.chat.daring) || m.chat.insecure);
        h = Array.isArray(c) ? c.filter(Array.isArray).map(([w, x]) => '<p><b>' + w + ':</b> ' + x + '</p>').join('') : ''; }
    } else if (m.text) h = String(byLv(m.text, level) || '');
    return h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, '').trim();
  }
  // the student's own state of a learning path (the engine's localStorage, kept in sync by el-cloud.js): its first catalog key
  function mine0(id) {
    const a = (window.EL_CATALOG || []).find(x => x.id === id), k = a && a.keys && a.keys[0]; if (!k) return null;
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  /* A panel's first check (ls2-engine.js firstItems: state.items[panel_route] = {level, date, q: the question's place in the list, ok, a:
     what was typed, or the option chosen with 0 = the right one}): the questions with the student's answers, the right ones, ✓ / ✗.
     The vocabulary practice is kept under "vocab". Each question shows the student's newest answer (🆕 Roger, 22 Nov 2026: "Es millor que
     els alumnes i jo tinguin les últimes versions a la llibreta i a la pàgina"), and the score counts those: students never see their first
     try (Roger, 22 Nov 2026: "No need to say your first, students must be their last version even on the cover"; "First tries will be a
     statistic for me"). The first check only says which questions the step asked; it stays the dashboard's statistic. */
  /* ✓ today's check of a typed answer, so the notebook can show the latest answers already, before the step is opened again (Roger, 22 Nov
     2026: "So if you have their last versions I want them see them already"). A copy of ls2-engine.js norm / expand / bare / fits /
     wholeOk (Towards Nativeness' copy, the newest; 📱 phone words only in a personal LS, as there): true right, false wrong, null can't tell
     (an own sentence). Keep it in step with the engines when their check changes. */
  let PH = false;
  const nrm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const phone = s => !PH ? s : s.replace(/\b(?:cell ?phone|mobile phone|smart ?phone)\b/g, 'phone').replace(/\b(my|your|his|her|our|their|the|a) mobile\b/g, '$1 phone');
  const expand = s => (' ' + nrm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
  const bare = s => expand(s).replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  function fits(q, answers, typed) {
    const v = nrm(typed); if (!v) return false;
    if (answers.some(a => phone(nrm(a)) === phone(v) || bare(phone(nrm(a))) === bare(phone(v)))) return true;
    const t = bare(typed).split(' '); if (t.length < 2) return false;
    const parts = String(q || '').replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, ' ').split(/_{2,}(?:[\s/]*_{2,})*/), g = parts.length - 1;
    if (g < 1) return false;
    return answers.some(a => {
      const w = nrm(a).split(' '), fills = g === 1 ? [w.join(' ')] : g === w.length ? w : g === 2 && w.length > 2 ? [w[0], w.slice(1).join(' ')] : null;
      if (!fills) return false;
      const words = [], gap = [], put = (x, f) => bare(x).split(' ').filter(Boolean).forEach(y => { if (f) gap.push(words.length); words.push(y); });
      put(parts[0]); fills.forEach((f, i) => { put(f, true); put(parts[i + 1]); });
      if (!gap.length) return false;
      for (let k = 0; k + t.length <= words.length; k++)
        if (k <= gap[0] && k + t.length > gap[gap.length - 1] && t.every((x, j) => x === words[k + j])) return true;
      return false;
    });
  }
  const lev1 = (a, b) => { if (a === b) return true; const la = a.length, lb = b.length; if (Math.abs(la - lb) > 1) return false;
    let i = 0; while (i < la && i < lb && a[i] === b[i]) i++;
    if (la === lb) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
    return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1); };
  const flat = x => nrm(x).replace(/'/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  function wholeOk(it, typed) {
    return [bare, flat].some(c => {
      const t = c(typed); if (!t || t === c(it.whole)) return false;
      const tw = t.split(' '), orig = new Set(c(it.whole).split(' '));
      const same = (x, y) => x === y || (x.length >= 5 && !orig.has(y) && lev1(x, y)), ow = c(it.whole).split(' ');
      return (it.a || []).some(a => { const w = c(a).split(' ');
        if (w.length === tw.length && w.every((x, j) => same(x, tw[j]))) return true;
        let p = 0; while (p < w.length && p < ow.length && w[p] === ow[p]) p++;
        let q = 0; while (q < w.length - p && q < ow.length - p && w[w.length - 1 - q] === ow[ow.length - 1 - q]) q++;
        let lo = p, hi = w.length - q; if (hi <= lo) { lo = Math.max(0, p - 1); hi = Math.min(w.length, p + 1); }
        const inOrig = ow.some((_, k) => k + tw.length <= ow.length && tw.every((y, j) => y === ow[k + j]));
        for (let k = 0; k + tw.length <= w.length; k++) {
          if (!tw.every((y, j) => same(w[k + j], y))) continue;
          if (k <= lo && k + tw.length >= hi) return true;
          if (tw.length >= 2 && k < hi && k + tw.length > lo && !inOrig) return true;
        }
        return false; });
    });
  }
  function checkNow(it, v) {
    if (v == null || String(v).trim() === '') return null;
    if (Array.isArray(it.o)) return +v === 0;
    if (it.own) return null;
    try { const A = Array.isArray(it.a) ? it.a : [it.a]; return it.whole ? wholeOk(it, String(v)) : fits(it.q, A.filter(x => x != null).map(String), String(v)); } catch (e) { return null; }
  }
  // the newest answer to question it (ls2-engine.js newest / latestBack): state.ans[id] (.ok as the page last checked it) or a ✏️
  // correction made in the notebook look (state.nb[id].re), whichever is newer; null when there is none or it can't be marked
  function latestOf(p, st, it) {
    const id = p.type === 'vocab' ? 'vocab' : p.id, A = st && st.ans && st.ans[id], N = st && st.nb && st.nb[id], q = String(it.id || it.q || '');
    const has = x => x != null && String(x).trim() !== '';
    let best = null;
    // a step not opened since 22 Nov 2026 has no .ok yet: today's check (checkNow); an own sentence waits until the step is opened again
    const guess = v => checkNow(it, v);
    if (A && Array.isArray(A.q) && Array.isArray(A.v) && !A.from) { const j = A.q.indexOf(q), ok = j < 0 ? null : Array.isArray(A.ok) && A.ok[j] != null ? !!A.ok[j] : guess(A.v[j]); if (j >= 0 && has(A.v[j]) && ok != null) best = { v: A.v[j], ok, at: String((A.t || [])[j] || '') }; }
    const r = N && N.re && typeof N.re === 'object' ? N.re[q] : null;
    if (r && has(r.v) && (!best || (String(r.at || '') > best.at && String(r.v) !== String(best.v)))) best = { v: r.v, ok: !!r.ok, at: String(r.at || '') };
    return best;
  }
  function firstTry(p, st, tx) {
    const IT = (st && st.items) || {}, id = p.type === 'vocab' ? 'vocab' : p.id, src = p.type === 'vocab' ? p.practice : p.items;
    if (!src) return null;
    const rec = Object.keys(IT).filter(k => k.slice(0, id.length + 1) === id + '_' && ROUTES.includes(k.slice(id.length + 1))).map(k => IT[k]).filter(r => r && Array.isArray(r.q))
      .sort((x, y) => String(x.date || '').localeCompare(String(y.date || '')))[0];
    if (!rec) return null;
    const list = Array.isArray(src) ? src : forLevel(src, rec.level);
    const qs = rec.q.map((qi, j) => {
      const it = list[qi]; if (!it || typeof it !== 'object') return null;
      const mc = Array.isArray(it.o), a = (rec.a || [])[j];
      // 🔍 Spot the mistake, written (Towards Nativeness, type rewrite): the sentence as Roger wrote it is the question (Roger, 21 Nov 2026: "The heading of the questions are missing")
      const say = x => mc ? (x == null ? '' : tx(it.o[+x])) : String(x == null ? '' : x), fok = !!(rec.ok || [])[j], L = latestOf(p, st, it);
      // the newest answer (state.ans / ✏️ Correct it, in full); without one, the first check's answer (kept cut at 40 characters, 160 for a whole sentence)
      // no newer answer: the first check's answer, with today's check (an answer an older check marked wrong gets its tick once it is accepted)
      const now = L, v = now ? now.v : a, ok = now ? now.ok : fok || (!it.guess && checkNow(it, a) === true);
      return { q: it.q ? tx(it.q) : it.s ? '“' + tx(it.s) + '”' : '', mc, right: mc ? tx(it.o[0]) : it.own ? tx(it.show) : tx(Array.isArray(it.a) ? it.a[0] : it.a),
        given: say(v), ok, at: now ? String(now.at || '') : '', guess: !!it.guess, ex: it.guess ? '' : pageFb(p, it, mc, ok, v, tx) };
    }).filter(Boolean);
    if (!qs.length) return null;
    const scored = qs.filter(x => !x.guess), day = qs.reduce((d, x) => x.at > d ? x.at : d, String(rec.date || ''));
    return { day: day.slice(0, 10), qs, right: scored.filter(x => x.ok).length, of: scored.length };
  }
  /* 💬 the feedback line the step showed under that question after ✓ Check (Roger, 18 Nov 2026: "All the activities done in class should
     have the feedback that appears in the normal menu in the notebook"), as ls2-engine.js writes it: a typed question "Correct!" or
     "Not yet. " + its rule (it.en / it.ca); a choice question "Correct! / Not yet. " + its explanation (it.ex), or without one the
     learningSupport.evidence line (its Catalan hint it.h for Starter/Base). The right answer itself is already written in the notebook. */
  function pageFb(p, it, mc, ok, a, tx) {
    const ca = tx({ ca: '1', en: '0' }) === '1', T = (c, e) => ca ? c : e;
    const ex = tx(it.ex || it.why || ''), why = tx(it.en || it.ca ? { en: it.en, ca: it.ca } : '');
    const blank = a == null || String(a).trim() === '';
    if (mc) {
      if (blank) return T('No vas triar cap resposta.', 'You didn\'t choose an answer.');
      if (ex) return (ok ? T('Correcte! ', 'Correct! ') : T('Encara no. ', 'Not yet. ')) + ex;
      // learningSupport.evidence (learning-path-support.js, not loaded on the LS home): its words, kept the same
      const listen = !!(p.media && (p.media.audio || p.media.youtube));
      if (ok) return T('Correcte!', 'Correct!');
      return ca ? 'Encara no. ' + (it.h || (listen ? 'Escolta l’àudio una altra vegada i fixa’t en el detall exacte que demana la pregunta.' : 'Torna a llegir el text, busca la frase que respon la pregunta i compara-la amb cada opció.'))
        : 'Try again. ' + (listen ? 'Listen again and focus on the exact detail the question asks about, then compare it with each option.' : 'Re-read the text, find the sentence that answers the question and compare it with each option.');
    }
    if (ok) return it.own ? T('Molt bé! El professor pot llegir la teva frase.', 'Well done! Your teacher can read your sentence.') : T('Correcte!', 'Correct!') + (why || ex ? ' ' + (why || ex) : '');
    if (blank) return T('No vas escriure cap resposta.', 'You didn\'t type an answer.') + (why ? ' ' + why : '');
    return T('Encara no. ', 'Not yet. ') + (why || ex);
  }
  // the questions of an activity not done yet, at the student's route, without answers: {task, qs: [{q, o: options in a fixed order}]}
  function toDo(p, level, tx) {
    const src = p.type === 'vocab' ? p.practice : p.items, list = !src ? [] : Array.isArray(src) ? forLevel(src, level) : forLevel(src, level);
    const qs = list.filter(it => it && typeof it === 'object' && it.q).map(it => ({ q: tx(it.q), o: Array.isArray(it.o) ? it.o.map(tx).filter(Boolean).sort((a, b) => a.localeCompare(b)) : null }));
    return { task: tx(p.task) || tx(p.intro) || '', qs };
  }
  return { build, lps, plan, ROUTES, latest: (aid, id) => (LATEST[aid] || {})[id] || null };
})();
