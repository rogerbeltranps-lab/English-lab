/* Vocabulary and grammar summary of a whole LS, per route (Roger, 31 Oct 2026: "make sure the printable versions match the current
   learning paths"). shared/print/summary.html?ls=4eso/seasons-and-celebrations&route=safe
   Built from the same data files as the Learning Paths (<ls>/data/<lp>.js, + data/native/<lp>.js for Pro), so it always matches them:
   every vocabulary panel (and a typed panel with groups) with the route's words, ★ on the route's key words (p.core), the review words
   and the receptive words; every typed panel with "How it works" (explain) with its practice and the answers and why (not Mixed,
   as the summaries always were).
   Same route rules as ls2-engine.js. The PDFs in <ls>/downloads/ls2-vocabulary-grammar-<route>.pdf are printed from this page by
   tools/lp-worksheets/build.mjs --summaries. */
(function () {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring', 'native'];
  const STUDENT = { beginners: 'Starter', insecure: 'Base', safe: 'Core', daring: 'Plus', native: 'Pro' };
  const COURSE = { '2eso': '2 ESO', '4eso': '4 ESO' };
  const q = new URLSearchParams(location.search);
  const ls = q.get('ls') || '', level = ROUTES.includes(q.get('route')) ? q.get('route') : 'insecure';
  const base = '../../' + ls + '/', pro = level === 'native';
  const ca = level === 'insecure' || level === 'beginners';
  const T = (c, e) => ca ? c : e;
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca ? (o.ca || o.en) : (o.en || o.ca));
  const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level) && (!x.only || x.only.includes(level))) : (items[level] || (level === 'beginners' ? items.insecure : level === 'native' ? items.daring : null) || []);
  const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });

  // One Learning Path's panels for the route (Pro: LP.native replaces panels by id, as ls2-engine.js usePanels; 4 ESO Getting started: GS_NATIVE).
  async function lpData(lp) {
    delete window.LP; delete window.GS_NATIVE;
    await load(base + 'data/' + lp + '.js');
    const LP = window.LP;
    if (pro) {
      await load(base + 'data/native/' + lp + '.js').catch(() => {});
      const G = window.GS_NATIVE;
      if (G && !LP.native) LP.native = { words: Object.assign({}, LP.panels.find(p => p.id === 'words'), { groups: G.vocab, items: G.practice, receptive: null, explain: null, core: null }) };
      const N = LP.native || {};
      LP.panels = LP.panels.map(p => N[p.id] ? Object.assign({}, N[p.id], { id: p.id }) : p);
    }
    return LP;
  }

  function vocab(p) {
    const g = forLevel(p.groups); if (!g.length) return '';
    const c = pro || !p.core ? null : Array.isArray(p.core) ? p.core : forLevel(p.core), core = c && c.length ? new Set(c.map(norm)) : null;
    const review = forLevel(p.review || []).flatMap(x => x.items.map(i => i[0]));
    return '<table class="vocab"><thead><tr><th>' + T('Paraula o expressió', 'Word or expression') + '</th><th>' + (pro ? 'Meaning' : T('En català', 'In Catalan')) + '</th><th>' + T('Exemple', 'Example') + '</th></tr></thead>' +
      g.map(x => '<tbody><tr class="grp"><td colspan="3">' + x.g + ' · ' + x.items.length + '</td></tr>' + x.items.map(i => '<tr><td><b>' + (core && core.has(norm(i[0])) ? '★ ' : '') + i[0] + '</b></td><td>' + i[1] + '</td><td><i>' + i[2] + '</i></td></tr>').join('') + '</tbody>').join('') + '</table>' +
      (review.length ? '<p class="tiny">' + T('Repàs de Learning Paths anteriors: ', 'Review from earlier Learning Paths: ') + review.join(' · ') + '</p>' : '') +
      (p.receptive ? '<p class="tiny">' + T('Paraules que sentiràs o llegiràs (no cal aprendre-les): ', 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '');
  }
  function grammar(p) {
    const ex = forLevel(p.explain), items = forLevel(p.items); if (!ex.length) return '';
    return '<h4>' + tx(p.title) + '</h4><div class="box"><b>' + T('Com funciona', 'How it works') + '</b><ul>' + ex.map(e => '<li>' + tx(e) + '</li>').join('') + '</ul></div>' +
      (items.length ? '<p class="sub">' + T('Pràctica del Learning Path, amb les respostes', 'Practice from the Learning Path, with answers') + '</p>' +
        '<table class="practice"><thead><tr><th>' + T('Frase', 'Sentence') + '</th><th>' + T('Resposta', 'Answer') + '</th><th>' + T('Per què', 'Why') + '</th></tr></thead><tbody>' +
        items.map(it => '<tr><td>' + it.q + '</td><td><b>' + it.a.map(esc).join(' / ') + '</b></td><td>' + (tx({ ca: it.ca, en: it.en }) || '') + '</td></tr>').join('') + '</tbody></table>' : '');
  }

  async function run() {
    await load('lp-list.js');
    const L = (window.LP_PRINT || {})[ls]; if (!L) throw new Error('no LS ' + ls);
    const lps = L.lps.filter(([lp]) => !/^recall-checkpoint|^sample-exam/.test(lp));
    const voc = [], gr = [], noVoc = [], noGr = [];
    for (const [lp, title] of lps) {
      const LP = await lpData(lp), name = 'Learning Path ' + title.replace(/ · /, ' · ');
      const v = LP.panels.filter(p => p.groups && (p.type === 'vocab' || p.type === 'typed')).map(vocab).join('');
      const g = LP.panels.filter(p => p.type === 'typed' && p.explain && p.id !== 'mixed').map(grammar).join('');
      const n = title.split(' · ')[0];
      if (v) voc.push('<section class="lp"><h3>' + name + '</h3>' + v + '</section>'); else noVoc.push(n);
      if (g) gr.push('<section class="lp"><h3>' + name + '</h3>' + g + '</section>'); else noGr.push(n);
    }
    const list = a => a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + T(' i ', ' and ') + a[a.length - 1];
    const course = COURSE[ls.split('/')[0]] || '', ls2 = L.title.replace(/^\d ESO · /, '');
    document.title = ls2 + ' · ' + STUDENT[level] + ' · ' + T('Vocabulari i gramàtica', 'Vocabulary and grammar');
    document.getElementById('sheet').innerHTML =
      '<p class="eyebrow">' + course + ' · ' + esc(ls2) + '</p>' +
      '<h1>' + T('Ruta ' + STUDENT[level] + ' · Vocabulari i gramàtica', STUDENT[level] + ' route · Vocabulary and grammar' + (pro ? ' (C2 Proficiency)' : '')) + '</h1>' +
      '<p>' + T('Tot el vocabulari i la gramàtica dels Learning Paths de la ruta ' + STUDENT[level] + ', tal com surten al web.', 'All the vocabulary and grammar of the Learning Paths on the ' + STUDENT[level] + ' route, as they appear on the site.') + '</p>' +
      '<div class="box"><b>' + T('Com estudiar-ho', 'How to study it') + '</b>' +
      '<p>' + T('Primer tot el vocabulari i després tota la gramàtica, Learning Path per Learning Path.', 'First all the vocabulary, then all the grammar, Learning Path by Learning Path.') + '</p>' +
      '<p><b>' + T('Vocabulari', 'Vocabulary') + ':</b> ' + (pro ? 'cover the meaning column and define each word in your own words; then write a new example sentence of your own.'
        : T('tapa la columna English, llegeix el català i digues la paraula en anglès; després llegeix l’exemple en veu alta. ★ = paraules clau: aprèn-les de memòria.', 'cover the English column, read the Catalan and say the English word; then read the example aloud. ★ = key words: learn them by heart.')) + '</p>' +
      '<p><b>' + T('Gramàtica', 'Grammar') + ':</b> ' + T('llegeix com funciona, tapa la columna de respostes i completa les frases; comprova-ho i llegeix el perquè.', 'read how it works, cover the answer column and complete the sentences; then check and read why.') + '</p></div>' +
      '<h2>1 · ' + T('Vocabulari', 'Vocabulary') + '</h2>' + (noVoc.length ? '<p class="tiny">' + T('Sense vocabulari nou: Learning Path ', 'No new vocabulary: Learning Path ') + list(noVoc) + '.</p>' : '') + voc.join('') +
      '<h2 class="part">2 · ' + T('Gramàtica', 'Grammar') + '</h2>' + (noGr.length ? '<p class="tiny">' + T('Sense gramàtica nova: Learning Path ', 'No new grammar: Learning Path ') + list(noGr) + '.</p>' : '') + gr.join('');
    document.body.dataset.ready = '1';
  }
  run().catch(e => { document.getElementById('sheet').textContent = 'Could not build the summary: ' + e.message; document.body.dataset.ready = 'error'; console.error(e); });
})();
