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
      if (!tabs.length && !(played && played[a.n])) continue;
      const LP = await lpData(a.href, level === 'native');
      const panels = ((LP && LP.panels) || []).map(p => level === 'native' && LP.native && LP.native[p.id] ? Object.assign({ id: p.id }, LP.native[p.id]) : p);
      const on = new Set(tabs.map(x => x.id)), mine = panels.filter(p => on.has(p.id));
      const terms = [], grammar = [];
      mine.forEach(p => {
        if (Array.isArray(p.groups) && p.type !== 'self') forLevel(p.groups, level).forEach(g => {
          const items = (g.items || []).filter(Array.isArray).map(x => ({ en: x[0], ca: x[1], ex: x[2] }));
          if (items.length) terms.push({ g: tx(g.g), items });
        });
        const ex = forLevel(p.explain, level).map(tx).filter(Boolean);
        if (ex.length) grammar.push({ title: tx(p.title), boxes: ex });
      });
      out.push(Object.assign({}, a, { tabs, terms, grammar }));
    }
    return { lps: out, dropped, exam: pl.exam, sample: sample() };
  }
  return { build, lps, plan, ROUTES };
})();
