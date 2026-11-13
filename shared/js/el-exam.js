// 🎯 What's in the exam (Roger, 9 Nov 2026, from Salma's suggestion in 4ESO B: "a section covering what will be on the exam, as well as the
// key terms we need to know"; Roger: "sometimes we don't do all the theory, so when I check that we've done something we could have a section
// of what will be in the exam with the SLP and the theory … and the theory of the games … where they see their notes"; he chose ONE page with
// 📝 Your notes). The LS home's #notes place (el-notes.js draws it) shows, learning path by learning path, ONLY what the group has done:
//  - the tabs (SLPs) ticked on the Time plan or on a class day already past: ls/{id}.done[group] = {"activity#panel": day}, the same map the
//    board's "What we've done" reads (the dashboard copies it, doneSync); a class game the group played counts too (ls/{id}.played);
//  - 🔑 key terms: the words of every done tab that has a word list (p.groups, at the student's route, as the tab's Explore shows them);
//  - 🧩 grammar: the "How it works" boxes of every done tab that has them (p.explain, at the student's route);
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
  const files = {};
  const src = url => files[url] || (files[url] = fetch(url, { cache: 'no-cache' }).then(r => r.ok ? r.text() : '').catch(() => ''));
  async function lpData(href, native) {
    const page = String(href || '').replace(/[?#].*$/, '').replace(/\.html$/, ''), W = {};
    const run = s => { if (s) try { new Function('window', s)(W); } catch (e) { console.warn('exam data', page, e); } };
    run(await src('data/' + page + '.js'));
    if (native && W.LP) run(await src('data/native/' + page + '.js'));
    return W.LP || null;
  }
  // the learning paths of this LS, in the order of the LS page (its <ol class="lps">), without checkpoints, extras and the final product
  function lps() {
    return [...document.querySelectorAll('ol.lps a.lp[data-a]')]
      .filter(a => !a.classList.contains('cp') && !a.classList.contains('extra'))
      .map(a => ({ id: a.dataset.a, href: a.getAttribute('href'), n: ((a.querySelector('.n') || {}).textContent || '').trim(), title: ((a.querySelector('.t b') || {}).textContent || '').trim() }))
      .filter(x => x.href && !/^final product/i.test(x.title));
  }
  const sample = () => { const a = document.querySelector('ol.lps a.lp[href*="sample-exam"]'); return a ? a.getAttribute('href') : null; };
  // the group's plan: exam day and the learning paths dropped for it
  function plan(LS, gid) {
    const W = window.ELWeek, x = W && gid ? (W.plans(gid) || []).find(y => y.ls === LS) : null;
    return { exam: x ? W.exam(x.p, x.gi) : null, dropped: x ? ((x.p._dropped || {})[x.gi] || []) : [] };
  }
  // done: {"activity#panel": day} · level: a route id · ca: Catalan for Starter/Base · games: {lpNumber: true} played
  async function build({ LS, gid, done, level, ca, played }) {
    level = ROUTES.includes(level) ? level : 'insecure';
    const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca ? (o.ca || o.en) : (o.en || o.ca));
    const pl = plan(LS, gid), out = [], dropped = [];
    for (const a of lps()) {
      if (pl.dropped.includes(a.id)) { dropped.push(a); continue; }
      const secs = (window.EL_SECTIONS || {})[a.id] || [], tabs = secs.filter(([id]) => done && done[a.id + '#' + id]).map(([id, name]) => ({ id, name, day: done[a.id + '#' + id] }));
      const st = mine0(a.id), tried = st && st.items && Object.keys(st.items).length;
      if (!tabs.length && !(played && played[a.n]) && !tried) continue;
      const LP = await lpData(a.href, level === 'native');
      const panels = ((LP && LP.panels) || []).map(p => level === 'native' && LP.native && LP.native[p.id] ? Object.assign({ id: p.id }, LP.native[p.id]) : p);
      const on = new Set(tabs.map(x => x.id)), mine = panels.filter(p => on.has(p.id));
      const terms = [], grammar = [], parts = [];
      const termsOf = p => Array.isArray(p.groups) && p.type !== 'self' ? forLevel(p.groups, level).map(g => ({ g: tx(g.g), items: (g.items || []).filter(Array.isArray).map(x => ({ en: x[0], ca: x[1], ex: x[2] })) })).filter(g => g.items.length) : [];
      const gramOf = p => { const ex = forLevel(p.explain, level).map(tx).filter(Boolean); return ex.length ? [{ title: tx(p.title), boxes: ex }] : []; };
      mine.forEach(p => { terms.push(...termsOf(p)); grammar.push(...gramOf(p)); });
      // 📓 the notebook, tab by tab in the learning path's order: what was done in class (key terms, how it works) and the student's own
      // answers to the activities, their first try only, as the teacher would correct them (Roger, 13 Nov 2026)
      panels.forEach(p => {
        const sec = secs.find(([id]) => id === p.id), tab = tabs.find(x => x.id === p.id), work = firstTry(p, st, tx);
        if (!tab && !work) return;
        // (Roger, 13 Nov 2026: "even if the students don't do the activities, they must appear in the notebook, not done, with a note
        // (to do / per fer, depending on the level), and the theory of the SLPs too"): a tab done in class that the student hasn't done
        // shows its questions, unanswered, under a "To do" note; its theory shows anyway
        const sd = (st && st.done) || {}, did = p.type === 'vocab' ? !!sd.practice : !!sd[p.id];
        const todo = work || did || ['info', 'summary', 'self'].includes(p.type) ? null : toDo(p, level, tx);
        parts.push({ id: p.id, name: sec ? sec[1] : tx(p.tab) || tx(p.title), title: tx(p.title), day: tab ? tab.day : null, kind: p.type === 'vocab' || (Array.isArray(p.groups) && !p.explain) ? 'vocab' : p.explain ? 'grammar' : /read|book/i.test(p.id + ' ' + tx(p.tab)) ? 'read' : /listen/i.test(p.id) ? 'listen' : 'other',
          terms: termsOf(p), grammar: gramOf(p), work, todo });
      });
      out.push(Object.assign({}, a, { tabs, terms, grammar, parts }));
    }
    return { lps: out, dropped, exam: pl.exam, sample: sample() };
  }
  // the student's own state of a learning path (the engine's localStorage, kept in sync by el-cloud.js): its first catalog key
  function mine0(id) {
    const a = (window.EL_CATALOG || []).find(x => x.id === id), k = a && a.keys && a.keys[0]; if (!k) return null;
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  /* A panel's first check (ls2-engine.js firstItems: state.items[panel_route] = {level, date, q: the question's place in the list, ok, a:
     what was typed, or the option chosen with 0 = the right one}): the questions with the student's answers, the right ones, ✓ / ✗.
     The vocabulary practice is kept under "vocab". Only the first try, whatever the route it was done at. */
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
      return { q: tx(it.q), mc, right: mc ? tx(it.o[0]) : tx(Array.isArray(it.a) ? it.a[0] : it.a), given: mc ? (a == null ? '' : tx(it.o[+a])) : String(a == null ? '' : a), ok: !!(rec.ok || [])[j], guess: !!it.guess };
    }).filter(Boolean);
    if (!qs.length) return null;
    const scored = qs.filter(x => !x.guess);
    return { day: String(rec.date || '').slice(0, 10), qs, right: scored.filter(x => x.ok).length, of: scored.length };
  }
  // the questions of an activity not done yet, at the student's route, without answers: {task, qs: [{q, o: options in a fixed order}]}
  function toDo(p, level, tx) {
    const src = p.type === 'vocab' ? p.practice : p.items, list = !src ? [] : Array.isArray(src) ? forLevel(src, level) : forLevel(src, level);
    const qs = list.filter(it => it && typeof it === 'object' && it.q).map(it => ({ q: tx(it.q), o: Array.isArray(it.o) ? it.o.map(tx).filter(Boolean).sort((a, b) => a.localeCompare(b)) : null }));
    return { task: tx(p.task) || tx(p.intro) || '', qs };
  }
  return { build, lps, plan, ROUTES };
})();
