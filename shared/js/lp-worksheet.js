/* Paper worksheets of the LS2 Learning Paths (Roger, 30 Oct 2026: "imprimibles dels learning path per castigats sense ordinador").
   shared/print/worksheet.html?ls=4eso/seasons-and-celebrations&lp=plan-the-day&route=safe[&key=1]
   Reads the same data file as the page (<ls>/data/<lp>.js, window.LP) and lays out each step for paper: write instead of type,
   a / b / c instead of tapping, lines to write on, the listening transcripts at the end. key=1 prints the answers (teacher's key).
   Same route rules as ls2-engine.js: cumulative r: tags, Beginners falls back to Insecure, Catalan for Beginners and Insecure. */
(function () {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring', 'native'];
  const STUDENT = { beginners: 'Starter', insecure: 'Base', safe: 'Core', daring: 'Plus', native: 'Pro' };
  const COURSE = { '2eso': '2 ESO', '4eso': '4 ESO' };
  const LS = { 'free-time-live': 'Free Time, Live!', 'seasons-and-celebrations': 'Seasons & Celebrations' };
  const q = new URLSearchParams(location.search);
  const ls = q.get('ls') || '', lp = q.get('lp') || '', level = ROUTES.includes(q.get('route')) ? q.get('route') : 'insecure', key = q.get('key') === '1';
  const base = '../../' + ls + '/';
  const ca = level === 'insecure' || level === 'beginners';
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca ? (o.ca || o.en) : (o.en || o.ca));
  // the same as ls2-engine.js: beginners → insecure, native (Pro, 4 ESO) → daring
  const byLevel = o => o == null ? '' : typeof o === 'string' ? o : (o[level] != null ? o[level] : level === 'native' && o.daring != null ? o.daring : o.safe != null && (level === 'daring' || level === 'native') ? o.safe : o.insecure);
  const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level) && (!x.only || x.only.includes(level))) : (items[level] || (level === 'beginners' ? items.insecure : level === 'native' ? items.daring : null) || []);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = (c, e) => ca ? c : e;
  const transcripts = [];
  let LP = null;
  /* Starter choices (ls2-engine.js, Roger 31 Oct 2026): in Learning Paths whose data says starter: true, Starter picks every typed answer
     from three options. Copied from ls2-engine.js (choices, verbForms, SETS; both engines have the same code) so the paper shows the
     same three options in the same order as the screen. Keep the two in step. */
  const starter = () => level === 'beginners' && !!(LP && LP.starter);
  const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const words = s => (String(s).trim().match(/\S+/g) || []).length;
  const expand = s => (' ' + norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
  const s3 = v => ({ go: 'goes', do: 'does', have: 'has', be: 'is' })[v] || (/[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : /(s|sh|ch|x|z|o)$/.test(v) ? v + 'es' : v + 's');
  const ing = v => /ie$/.test(v) ? v.slice(0, -2) + 'ying' : (/[^e]e$/.test(v) ? v.slice(0, -1) + 'ing' : /^[^aeiou]*[aeiou][bdgmnprt]$/.test(v) ? v + v.slice(-1) + 'ing' : v + 'ing');
  const hash = t => { let h = 7; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function verbForms(it) {
    const m = String(it.q).match(/\((?:not \/ )?([a-z]+)\)/); if (!m) return null;
    const v = m[1], g = ing(v), a = expand(it.a[0]).trim(), be = /(^|\W)I ___/.test(it.q) ? 'am' : 'are';
    const map = {};
    map[v] = [s3(v), be + ' ' + g]; map[s3(v)] = [v, 'is ' + g]; map[g] = [v, s3(v)];
    map['are going to ' + v] = ['is going to ' + v, 'will ' + v]; map['is going to ' + v] = ['are going to ' + v, 'will ' + v]; map['am going to ' + v] = ['is going to ' + v, 'will ' + v]; map['will ' + v] = ['is going to ' + v, s3(v)];
    map['is ' + g] = ['are ' + g, s3(v)]; map['are ' + g] = ['is ' + g, v]; map['am ' + g] = ['is ' + g, v];
    map['does not ' + v] = ["don't " + v, "isn't " + g]; map['do not ' + v] = ["doesn't " + v, "aren't " + g];
    map['is not ' + g] = ["aren't " + g, "doesn't " + v]; map['are not ' + g] = ["isn't " + g, "don't " + v]; map['am not ' + g] = ["isn't " + g, "don't " + v];
    return map[a] || null;
  }
  const SETS = [['at', 'in', 'on'], ['because', 'but', 'and', 'so', 'also'], ['first', 'then', 'finally', 'next'], ['always', 'usually', 'often', 'sometimes', 'never'], ['am', 'is', 'are'], ['do', 'does', 'is', 'are'], ['will', 'going to', 'is going to']];
  function starterChoices(it, items, salt) {
    const same = x => it.a.some(a => expand(a) === expand(x)), out = [];
    const add = x => { if (out.length < 2 && x && !same(x) && !out.some(o => expand(o) === expand(x))) out.push(x); };
    (it.d || []).forEach(add);
    (verbForms(it) || []).forEach(add);
    const ingQ = String(it.q).match(/-ing form: ([a-z]+)/); if (ingQ) { const v = ingQ[1]; [v + 'ing', v.replace(/e$/, '') + v.slice(-1) + 'ing', s3(v)].forEach(add); }
    const a0 = norm(it.a[0]), set = SETS.find(g => g.includes(a0)); if (set) set.filter(x => x !== a0).sort((x, y) => hash(salt + x) - hash(salt + y)).forEach(add);
    const wc = words(it.a[0]);
    items.map(x => x.a[0]).filter(x => x !== it.a[0]).sort((x, y) => ((words(y) === wc) - (words(x) === wc)) || (hash(salt + x) - hash(salt + y))).forEach(add);
    return [it.a[0]].concat(out).sort((x, y) => hash(salt + x) - hash(salt + y));
  }

  // The same order on every print: options are shuffled with a seed taken from the question.
  function order(n, seed) {
    let h = 2166136261; for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => { h = (h + 0x6D2B79F5) >>> 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const lines = n => '<div class="lines">' + '<span></span>'.repeat(Math.max(1, n)) + '</div>';
  const ans = s => key ? '<span class="key">' + s + '</span>' : '';
  // A gap ___ becomes a writing space; a question without a gap gets a line below. The key fills a single gap, or adds the answer after.
  // pick: the Starter options for this item (starterChoices), printed as a / b / c under the sentence; the key circles the right one.
  function gapped(it, pick) {
    const a = it.a ? it.a[0] : '', n = (it.q.match(/_{2,}/g) || []).length;
    if (pick) return '<li><span class="q">' + it.q.replace(/_{2,}/g, '<span class="gap"></span>') + '</span><div class="opts">' +
      pick.map((o, k) => '<span class="opt' + (key && o === a ? ' right' : '') + '"><b>' + 'abc'[k] + ')</b> ' + esc(o) + '</span>').join('') + '</div></li>';
    if (!n) return '<li><span class="q">' + it.q + '</span>' + (key ? '<div class="key-line">' + esc(a) + '</div>' : lines(1)) + '</li>';
    const q = it.q.replace(/_{2,}/g, () => key && n === 1 ? '<span class="gap filled">' + esc(a) + '</span>' : '<span class="gap"></span>');
    return '<li><span class="q">' + q + '</span>' + (key && n > 1 ? ' <span class="key-line">→ ' + esc(a) + '</span>' : '') + '</li>';
  }
  // prefix: the engine's id for the list (panel id, or 'vp' for vocabulary practice), which seeds the Starter options as on the screen
  const gaps = (items, prefix) => {
    const on = starter() && prefix != null && items.length;
    return (on ? '<p class="tiny">Tria la resposta correcta entre les tres opcions i escriu-la al buit (o encercla la lletra).</p>' : '') +
      '<ol class="items">' + items.map((it, i) => gapped(it, on ? starterChoices(it, items, LP.key + prefix + i) : null)).join('') + '</ol>';
  };
  function choices(items, pts) {
    return '<ol class="items">' + items.map(it => {
      const o = order(it.o.length, it.q), right = o.indexOf(0);
      return '<li><span class="q">' + it.q + (pts ? ' <small>[' + pts(it) + ']</small>' : '') + '</span><div class="opts">' +
        o.map((j, k) => '<span class="opt' + (key && k === right ? ' right' : '') + '"><b>' + 'abcd'[k] + ')</b> ' + it.o[j] + '</span>').join('') + '</div></li>';
    }).join('') + '</ol>';
  }
  const ticks = list => list && list.length ? '<ul class="ticks">' + list.map(c => '<li>' + c + '</li>').join('') + '</ul>' : '';

  async function vtt(src) {
    try {
      const t = await (await fetch(src)).text();
      // one paragraph per speaker: a cue that starts with the same "Name:" as the one before joins it
      let who = null; const out = [];
      t.split(/\r?\n\r?\n/).map(b => b.split(/\r?\n/).filter(l => l && !/-->/.test(l) && !/^(WEBVTT|NOTE|\d+$)/.test(l)).join(' ').replace(/<[^>]+>/g, '')).filter(Boolean).forEach(c => {
        const m = c.match(/^([A-Z][\w ]{0,20}):\s*(.*)$/);
        if (m && m[1] === who) out[out.length - 1] += ' ' + m[2];
        else { if (m) who = m[1]; out.push(m ? '<b>' + esc(m[1]) + ':</b> ' + esc(m[2]) : esc(c)); }
      });
      return out.map(x => '<p>' + x + '</p>').join('');
    } catch (e) { return ''; }
  }
  // Listening on paper: the teacher plays it if possible; otherwise the student reads the transcript at the end.
  function media(p) {
    const m = p.media || {}; let h = '';
    if (m.text) h += '<div class="reading">' + (m.text === true && typeof readingChat !== 'undefined' ? chat() : byLevel(m.text)) + '</div>';
    const listen = [];
    if (m.audio) listen.push({ src: m.audio, title: m.title || 'Listening', script: m.script ? m.script.map(([w, l]) => '<p><b>' + esc(w) + ':</b> ' + esc(l) + '</p>').join('') : null });
    (m.videos === true ? [{ base: 'video/halloween-castanyada', title: 'Halloween and the Castanyada' }] : m.videos || []).forEach(v => listen.push({ src: v.base, title: v.title, vtt: v.base + '.vtt' }));
    if (m.youtube) listen.push({ title: m.title || 'Video', yt: m.youtube });
    listen.forEach(l => {
      const seen = transcripts.findIndex(t => t.title === l.title), n = seen >= 0 ? seen + 1 : transcripts.length + 1;
      if (l.yt) h += '<div class="listen">🎧 <b>' + esc(l.title) + '</b> · ' + T('Vídeo de YouTube: el professor te’l posarà (youtube.com/watch?v=' + l.yt + ').', 'YouTube video: your teacher will play it for you (youtube.com/watch?v=' + l.yt + ').') + '</div>';
      else { if (seen < 0) transcripts.push(l); h += '<div class="listen">🎧 <b>' + esc(l.title) + '</b> · ' + T('Si no el pots escoltar, llegeix la transcripció ' + n + ' al final de la fitxa (dues vegades, com si l’escoltessis).', 'If you cannot listen to it, read transcript ' + n + ' at the end of the worksheet (twice, as if you were listening).') + '</div>'; }
    });
    return h;
  }
  const chat = () => '<div class="chat">' + forLevel(readingChat).map(([w, l]) => '<p><b>' + esc(w) + ':</b> ' + l + '</p>').join('') + '</div>';

  const R = {};
  R.recall = p => gaps(forLevel(p.items), p.secure ? null : p.id);
  R.typed = p => (p.groups ? table(p) : '') + (p.explain ? '<div class="box"><b>' + T('Com funciona', 'How it works') + '</b>' + forLevel(p.explain).map(e => '<div>' + tx(e) + '</div>').join('') + '</div>' : '') + gaps(forLevel(p.items), p.id);
  // ★ marks the panel's core words for the route (p.core, as the engine's Català → English cards); review: earlier paths' words.
  function table(p) {
    const g = forLevel(p.groups), c = level === 'native' || !p.core ? null : Array.isArray(p.core) ? p.core : forLevel(p.core);
    const core = c && c.length ? new Set(c.map(norm)) : null, star = w => core && core.has(norm(w)) ? '★ ' : '';
    const review = forLevel(p.review || []).flatMap(x => x.items.map(i => i[0]));
    return '<table class="vocab"><thead><tr><th>English</th><th>' + (level === 'native' ? 'Meaning' : 'Català') + '</th><th>' + T('Exemple', 'Example') + '</th></tr></thead>' +
      g.map(x => '<tbody><tr class="grp"><td colspan="3">' + x.g + '</td></tr>' + x.items.map(i => '<tr><td><b>' + star(i[0]) + i[0] + '</b></td><td>' + i[1] + '</td><td>' + i[2] + '</td></tr>').join('') + '</tbody>').join('') + '</table>' +
      (core ? '<p class="tiny">★ ' + T('Paraules clau: aprèn-les de memòria. Tapa la columna English, llegeix el català i digues o escriu la paraula en anglès.', 'Key words: learn them by heart. Cover the English column, read the Catalan and say or write the English word.') + '</p>' : '') +
      (review.length ? '<p class="tiny">' + T('Repassa també (Learning Paths anteriors): ', 'Review too (earlier Learning Paths): ') + review.join(' · ') + '</p>' : '') +
      (p.receptive ? '<p class="tiny">' + T('Paraules que sentiràs o llegiràs (no cal aprendre-les): ', 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '') +
      '<p class="tip">' + (level === 'native' ? 'Study them: cover the meaning column and define each word in your own words. Then complete the sentences without looking at the table.' : T('Estudia-les: tapa la columna English i digues cada paraula en anglès. Després completa les frases sense mirar la taula.', 'Study them: cover the English column and say each word in English. Then complete the sentences without looking at the table.')) + '</p>';
  }
  R.vocab = p => table(p) + (p.practice ? '<h3>' + T('Completa les frases', 'Complete the sentences') + '</h3>' + gaps(forLevel(p.practice), 'vp') : '');
  R.mc = p => media(p) + choices(forLevel(p.items));
  R.writing = p => {
    const min = byLevel(p.min), frame = byLevel(p.frame || {});
    return '<div class="box"><b>' + T('La tasca', 'Your task') + '</b><div>' + byLevel(p.task) + '</div></div>' +
      (p.model ? '<div class="box model"><b>' + T('Model (no el copiïs)', 'Model (don’t copy it)') + '</b><div>' + tx(p.model) + '</div></div>' : '') +
      (frame ? '<div class="box">' + frame + '</div>' : '') +
      (min ? '<p class="tiny">' + T('Mínim ', 'Minimum ') + min + T(' paraules.', ' words.') + '</p>' : '') + lines(Math.max(8, Math.ceil((min || 60) / 8) + 4)) +
      ((byLevel(p.checklist) || []).length ? '<h3>' + T('Revisa abans d’entregar', 'Check before you hand it in') + '</h3>' + ticks(byLevel(p.checklist)) : '');
  };
  const fields = list => list.map(f => '<div class="field"><b>' + tx(f.label) + '</b>' + (f.ph && !key ? '<span class="ph">' + esc(tx(f.ph)) + '</span>' : '') + lines((f.rows || 3) + 1) + '</div>').join('');
  R.form = p => (p.intro2 ? '<p>' + tx(p.intro2) + '</p>' : '') + fields(forLevel(p.fields)) + ticks(byLevel(p.checklist) || []);
  const SCALE = ca ? ['Encara no', 'En part', 'Gairebé del tot', 'Del tot'] : ['Not yet', 'Partly', 'Mostly', 'Fully'];
  R.step = p => (p.html ? '<div class="html">' + (typeof p.html === 'function' ? p.html(level) : tx(p.html)) + '</div>' : '') + media(p) + fields(forLevel(p.fields)) +
    (p.rate ? '<h3>' + T('Autoavaluació', 'Self-assessment') + '</h3><p class="tiny">' + T('Encercla: ', 'Circle: ') + SCALE.map((s, i) => (i + 1) + ' ' + s).join(' · ') + '</p><ul class="rate">' + (byLevel(p.rate) || []).map(s => '<li><span>' + s + '</span><span class="nums">1 · 2 · 3 · 4</span></li>').join('') + '</ul>' : '');
  R.info = p => '<div class="html">' + (typeof p.html === 'function' ? p.html(level) : tx(p.html)) + '</div>';
  R.checklist = p => ticks(byLevel(p.items) || []);
  R.speaking = p => '<div class="box"><b>' + T('La tasca', 'Your task') + '</b><div>' + byLevel(p.task) + '</div></div>' +
    (p.model ? '<div class="box model"><b>Model</b><div>' + byLevel(p.model) + '</div></div>' : '') +
    '<p><b>' + T('Escriu què diràs', 'Write what you will say') + '</b> · ' + T('Després llegeix-ho en veu alta tres vegades i digues-ho al professor.', 'Then read it aloud three times and say it to your teacher.') + '</p>' + lines(8);
  // Talk (four skills, 30 Oct 2026): on paper the partner's questions are written; the student notes the answers, then says them to a classmate.
  R.talk = p => '<div class="box"><b>' + T('La tasca', 'Your task') + '</b><div>' + byLevel(p.task) + '</div></div>' +
    '<ol class="items">' + forLevel(p.partner).map(x => '<li><b>' + x.q + '</b>' + (ca && x.ca ? ' <small>(' + x.ca + ')</small>' : '') + lines(2) + '</li>').join('') + '</ol>' +
    '<p><b>' + T('Després', 'Then') + '</b> · ' + T('Fes la conversa en veu alta amb un company: ell pregunta i tu respons, i després al revés.', 'Have the conversation aloud with a classmate: they ask and you answer, then swap.') + '</p>' +
    (p.model ? '<div class="box model"><b>Model</b><div>' + byLevel(p.model) + '</div></div>' : '');
  // Shadowing (30 Oct 2026): on paper, the part of the script; the teacher plays the clip and the student reads along, then repeats just behind the voice.
  R.shadow = p => '<div class="box"><b>' + T('Com es fa', 'How it works') + '</b><div>' + T('El professor posa el fragment tres vegades: primer llegeix mentre escoltes, després murmura les paraules alhora i al final repeteix-les en veu alta just darrere de la veu.', 'Your teacher plays the clip three times: first read while you listen, then mumble the words along, then say them aloud just behind the speaker.') + '</div></div>' +
    '<div class="box">' + p.clip.lines.map(l => '<p>' + (Array.isArray(l) && l.length > 1 ? '<b>' + l[0] + ':</b> ' + l[1] : (Array.isArray(l) ? l[0] : l)) + '</p>').join('') + '</div>';
  // Plan (Pro speaking, no recording): the question, the strategy, notes to write, then the model plan to compare with.
  R.plan = p => '<div class="box model"><b>The question</b><div>' + p.question + '</div>' + (p.part ? '<p class="tiny">' + p.part + '</p>' : '') + '</div>' +
    '<div class="box"><b>🧭 Strategy</b><div>' + p.tip + '</div></div>' +
    '<p><b>Your plan</b> · Write notes, not full sentences: this is the thinking you would do in the exam’s preparation time.</p>' + fields(p.fields) +
    '<div class="box"><b>A model plan</b> <small>(' + (key ? 'shown on the screen after the plan is handed in' : 'read it only after you have written your plan') + ')</small><div>' + p.modelPlan + '</div></div>' +
    '<div class="field"><b>What would you change in your plan now? (one sentence)</b>' + lines(2) + '</div>';
  const ptsOf = (p, it) => it.p || (it.o ? p.pts[0] : p.pts[1]);
  const ptsWord = n => n + ' ' + (ca ? (n === 1 ? 'punt' : 'punts') : (n === 1 ? 'point' : 'points'));
  R.quiz = p => {
    const items = forLevel(p.items);
    return media(p) + '<ol class="items" start="' + (p.start || 1) + '">' + items.map(it => {
      const pts = ' <small>[' + ptsWord(ptsOf(p, it)) + ']</small>';
      if (it.o) return choices([it], () => ptsWord(ptsOf(p, it))).replace(/^<ol class="items">|<\/ol>$/g, '');
      return gapped({ q: it.q + pts, a: it.a });
    }).join('') + '</ol>';
  };
  R.marked = p => media(p) + '<div class="box"><b>' + T('La tasca', 'Your task') + ' [' + ptsWord(p.max) + ']</b><div>' + byLevel(p.task).replace(/\n/g, '<br>') + '</div></div>' +
    (p.source ? '<div class="reading">' + byLevel(p.source) + '</div>' : '') + lines(Math.max(10, Math.ceil((byLevel(p.min) || 60) / 8) + 4));
  R.summary = () => null;

  function header(LP) {
    const course = ls.split('/')[0], name = LS[ls.split('/')[1]] || '';
    return '<header class="sheet-head"><div class="who"><span>' + T('Nom', 'Name') + ': </span><span>' + T('Grup', 'Group') + ': </span><span>' + T('Data', 'Date') + ': </span></div>' +
      '<p class="eyebrow">' + (COURSE[course] || '') + ' · ' + name + ' · ' + T('Ruta', 'Route') + ' ' + STUDENT[level] + (key ? ' · ' + T('SOLUCIONS', 'ANSWER KEY') : '') + '</p>' +
      '<h1>' + (typeof LP.n === 'number' ? 'Learning Path ' + LP.n + ' · ' : '') + LP.title + '</h1>' +
      (key ? '' : '<p class="note">✏️ ' + T('Fitxa en paper: fes les mateixes activitats que a l’ordinador. On diu «escriu» o «tria», escriu la resposta o encercla la lletra. Fes-ho sense apunts la primera vegada.', 'Paper worksheet: do the same activities as on the computer. Write your answers and circle the letter of the right option. Do it without notes the first time.') + '</p>') + '</header>';
  }

  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });

  // Pro (4 ESO): data/native/<lp>.js gives LP.native = { panelId: panel }, as ls2-engine.js usePanels(): a native panel replaces the one
  // with its id, and one with after: '<id>' is added after that panel. 4 ESO Getting started has its own renderer and window.GS_NATIVE.
  function usePanels() {
    if (level !== 'native') return;
    if (window.GS_NATIVE && !LP.native) {
      const G = window.GS_NATIVE, P = id => LP.panels.find(p => p.id === id) || {};
      LP.native = {
        recall: Object.assign({}, P('recall'), { items: G.recall }),
        words: Object.assign({}, P('words'), { groups: G.vocab, items: G.practice, receptive: null, explain: null }),
        read: Object.assign({}, P('read'), { media: { text: G.readingHtml }, items: G.readingQs }),
        listen: Object.assign({}, P('listen'), { items: G.listening }),
        speak: Object.assign({ type: 'plan', title: 'Speaking: plan your answer (no recording)' }, G.speak)
      };
      if (G.video) LP.native.realvideo = { type: 'mc', after: 'listen', title: G.video.heading, intro: G.video.intro, media: { youtube: G.video.youtube, title: G.video.title }, items: G.video.items };
    }
    if (!LP.native) return;
    const N = LP.native, extra = Object.keys(N).filter(k => N[k].after && !LP.panels.some(p => p.id === k)), as = k => Object.assign({}, N[k], { id: k });
    LP.panels = LP.panels.flatMap(p => [N[p.id] ? as(p.id) : p].concat(extra.filter(k => N[k].after === p.id).map(as)));
  }

  // "My goal" and "How did it go?" (ls2-engine.js planCard / reviewCard): every Learning Path with a recall step.
  const goal = () => '<section class="step"><div class="box"><b>🎯 ' + T('El meu objectiu', 'My goal') + '</b><div>' + T('Abans de començar: pensa en el teu últim recall o checkpoint. Què vols millorar en aquest Learning Path?', 'Before you start: think about your last recall or checkpoint. What do you want to get better at in this Learning Path?') + '</div>' + lines(1) + '</div></section>';
  const review = () => '<section class="step"><div class="box"><b>🔁 ' + T('Com m’ha anat', 'How did it go?') + '</b><div class="field"><b>' + T('Què m’ha ajudat més?', 'What helped me most?') + '</b>' + lines(1) + '</div><div class="field"><b>' + T('Què he de repassar?', 'What do I need to review?') + '</b>' + lines(1) + '</div></div></section>';

  /* Study guide (shared/js/el-study.js, data/study/<lp>.js): the same card as on the screen, laid out for paper. Tips, plan and what comes up
     as they are; options as a / b / c, gaps to write in, the "Practise for Checkpoint" questions as a list (on the screen they come one at a
     time), and the answer key at the end of the guide, as on the screen ("Show the answer key"). key=1 also marks the answers in red. */
  function studyGuide() {
    if (!LP.study || !window.ELStudy) return '';
    let seed = 0;
    window.learningSupport = window.learningSupport || {};
    const shuffle = window.learningSupport.shuffledIndexes;
    window.learningSupport.shuffledIndexes = n => order(n, LP.key + 'study' + (seed++));
    const api = { LP, level: () => level, ca: () => ca };
    let html;
    try { html = ELStudy.html(api); } finally { window.learningSupport.shuffledIndexes = shuffle; }
    const box = document.createElement('div'); box.innerHTML = html;
    const card = box.querySelector('details'); if (!card) return '';
    const title = card.querySelector('summary span').textContent; card.querySelector('summary').remove();
    const keys = [];
    card.querySelectorAll('.study-block').forEach(b => {
      const k = b.id.replace('study_', ''), items = ELStudy.items(api, k), head = b.querySelector('h3').textContent;
      b.querySelectorAll('.study-media').forEach(m => {
        const src = m.getAttribute('src') || '', t = transcripts.findIndex(x => x.src && (x.src === src || x.src === src.replace(/\.mp4$/, '')));
        m.outerHTML = '<div class="listen">🎧 ' + T('La gravació d’aquest Learning Path', 'The recording from this Learning Path') + (t >= 0 ? ' · ' + T('si no la pots escoltar, llegeix la transcripció ' + (t + 1) + ' al final.', 'if you cannot listen to it, read transcript ' + (t + 1) + ' at the end.') : '.') + '</div>';
      });
      b.querySelectorAll('.question').forEach((qn, i) => {
        const it = items[i] || {}, inp = qn.querySelector('input.typed');
        if (inp) { const t = qn.querySelector('.q-title'); t.innerHTML = t.innerHTML.replace(/_{2,}/g, '<span class="gap"></span>') + (key ? ' <span class="key-line">→ ' + esc((it.a || [''])[0]) + '</span>' : ''); inp.outerHTML = /_{2,}/.test(it.q || '') || key ? '' : lines(1); }
        const opts = qn.querySelector('.options');
        if (opts) opts.outerHTML = '<div class="opts">' + [...opts.querySelectorAll('label')].map((l, j) => '<span class="opt' + (key && l.querySelector('input').value === '0' ? ' right' : '') + '"><b>' + 'abcd'[j] + ')</b> ' + l.querySelector('span').innerHTML + '</span>').join('') + '</div>';
      });
      const mock = b.querySelector('.study-mock');
      if (mock) mock.outerHTML = '<p class="tiny">' + T('A la fitxa: tapa les preguntes i destapa-les una a una, uns 45 segons cada una, sense tornar enrere.', 'On paper: cover the questions and uncover them one at a time, about 45 seconds each, with no going back.') + '</p><ol class="items">' + items.map(x => gapped({ q: x.q, a: x.a })).join('') + '</ol>';
      keys.push('<h3>' + head + '</h3><ol class="items">' + items.map(x => '<li><b>' + esc(x.a[0]) + '</b>' + (x.why ? ' · ' + tx(x.why) : '') + '</li>').join('') + '</ol>');
      b.querySelectorAll('.study-key, .result, .feedback').forEach(e => e.remove());
    });
    card.querySelectorAll('.mini-card').forEach(c => c.classList.add('box'));
    return '<section class="step study"><div class="head"><h2>' + esc(title) + '</h2></div>' + card.innerHTML + '</section>' +
      '<section class="step study-keys"><div class="head"><h2>📚 ' + T('Guia d’estudi: solucions', 'Study guide: answer key') + '</h2><p class="intro">' + T('Mira-les només quan hagis acabat cada activitat.', 'Look at them only when you have finished each activity.') + '</p></div>' + keys.join('') + '</section>';
  }

  async function run() {
    await load(base + 'data/' + lp + '.js');
    LP = window.LP; let n = 0;
    if (level === 'native') await load(base + 'data/native/' + lp + '.js').catch(() => {});
    await load(base + 'data/study/' + lp + '.js').catch(() => {});
    usePanels();
    document.title = LP.title + ' · ' + STUDENT[level] + (key ? ' · key' : '');
    const parts = LP.panels.map(p => {
      const body = (R[p.type] || (() => null))(p);
      if (body == null) return '';
      n++;
      return '<section class="step"><div class="head"><h2><span class="num">' + n + '</span>' + tx(p.title || p.tab) + '</h2>' +
        (p.intro ? '<p class="intro">' + tx(p.intro) + '</p>' : '') + '</div>' + body + '</section>';
    }).join('');
    const reflective = LP.panels.some(p => p.id === 'recall');
    const study = studyGuide();
    let tr = '';
    for (const [i, t] of transcripts.entries()) tr += '<div class="tr"><h3>' + T('Transcripció ', 'Transcript ') + (i + 1) + ' · ' + esc(t.title) + '</h3>' + (t.script || await vtt(base + t.vtt)) + '</div>';
    const out = document.getElementById('sheet');
    out.innerHTML = header(LP) + (reflective ? goal() : '') + parts + (reflective ? review() : '') + study +
      (tr ? '<section class="step transcripts"><h2>' + T('Transcripcions (només si no pots escoltar l’àudio)', 'Transcripts (only if you cannot listen)') + '</h2>' + tr + '</section>' : '');
    // Screen-only bits of the page content (buttons, links to open, players) make no sense on paper.
    out.querySelectorAll('button, iframe, video, audio, input, textarea, script, .btn, .actions').forEach(e => e.remove());
    out.querySelectorAll('a').forEach(a => a.replaceWith(...a.childNodes));
    if (key) out.classList.add('is-key');
    document.body.dataset.ready = '1';
  }
  run().catch(e => { document.getElementById('sheet').textContent = 'Could not load ' + base + 'data/' + lp + '.js'; document.body.dataset.ready = 'error'; console.error(e); });
})();
