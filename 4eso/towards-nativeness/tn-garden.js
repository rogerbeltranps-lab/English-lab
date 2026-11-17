/* 🌱 Roger's own garden (Roger, 17 Nov 2026: "I want to have a garden too"): the students' garden (shared/js/el-garden.js) for Towards
   Nativeness. Every learning path is a bed (LP1–LP4, then ✦ for My latest mistakes) and every tab of it a plant: a flower when the tab
   is done (state.done[tab]), a bud when it is started (anything saved under the tab's id), a sprout when it is not. The tabs come from
   the course's own data files (data/*.js, read once); the progress from the saved state of each path (localStorage on the course home,
   the tester account's progress on the teacher dashboard). Used by index.html (the course home) and teacher.html (✦ Towards Nativeness).
   TNGarden.load(base) → {key: LP}; TNGarden.html(lps, getState, base, store) → the garden's HTML ("" before anything is loaded). */
(function () {
  const FILES = ['talking-to-your-tech', 'getting-things-done', 'telling-the-story', 'writing-like-a-teacher', 'my-latest-mistakes'];
  const js = src => new Promise(r => { const s = document.createElement('script'); s.src = src; s.onload = () => r(true); s.onerror = () => r(false); document.head.append(s); });
  let busy = null;
  async function load(base) {
    if (busy) return busy;
    busy = (async () => {
      const keep = window.LP, out = {};
      if (!window.TN_SHADOW) await js(base + 'data/shadow.js');
      for (const f of FILES) { window.LP = null; await js(base + 'data/' + f + '.js'); if (window.LP && window.LP.key) out[window.LP.key] = Object.assign({ file: f }, window.LP); }
      window.LP = keep; return out;
    })();
    return busy;
  }
  // a tab is started when anything is saved under its id (answers, tries, recordings, drafts, ratings…): key === id or id_<route>
  const started = (st, id) => Object.values(st || {}).some(m => m && typeof m === 'object' && !Array.isArray(m) && Object.keys(m).some(k => k === id || k.startsWith(id + '_')));
  // the flower of each tab: the students' kinds (el-garden.js kindOf reads the plant's id), from the tab's id or its type
  const KIND = [[/^(talk|talk2|fluency|shadow|spoken)/, 'talk'], [/^(listen|movie)/, 'listen'], [/^(read)/, 'read'], [/^(vocab)/, 'vocab'],
    [/^(write|idiom)/, 'write'], [/^(week|review)/, 'recall'], [/^(spot|fix|ca|translate|grammar|preps)/, 'grammar']];
  const kind = p => (KIND.find(([re]) => re.test(p.id)) || KIND.find(([re]) => re.test(p.type || '')) || [0, 'other'])[1];
  function html(lps, getState, base, store) {
    if (!window.elGarden || !lps || !Object.keys(lps).length) return '';
    const beds = FILES.map(f => Object.values(lps).find(l => l.file === f)).filter(Boolean).map(lp => {
      const st = getState(lp.key) || {}, done = st.done || {};
      return { id: lp.key, label: lp.n === 5 ? '✦' : 'LP' + lp.n, title: lp.title, kind: 'lp',
        plants: lp.panels.filter(p => p && p.id).map(p => ({ id: kind(p), key: lp.key + '#' + p.id, name: String(p.tab || p.title || p.id).replace(/<[^>]+>/g, ''),
          href: base + lp.file + '.html#' + p.id, st: done[p.id] ? 'bloom' : started(st, p.id) ? 'bud' : 'sprout' })) };
    }).filter(b => b.plants.length);
    return beds.length ? elGarden({ ls: 'Towards Nativeness', beds, store: store || null, save: !!store }, { en: true }) : '';
  }
  window.TNGarden = { load, html };
})();
