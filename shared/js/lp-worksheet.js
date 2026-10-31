/* Paper worksheets of the LS2 Learning Paths (Roger, 30 Oct 2026: "imprimibles dels learning path per castigats sense ordinador").
   shared/print/worksheet.html?ls=4eso/seasons-and-celebrations&lp=plan-the-day&route=safe[&key=1]
   Reads the same data file as the page (<ls>/data/<lp>.js, window.LP) and lays out each step for paper: write instead of type,
   a / b / c instead of tapping, lines to write on, the listening transcripts at the end. key=1 prints the answers (teacher's key).
   Same route rules as ls2-engine.js: cumulative r: tags, Beginners falls back to Insecure, Catalan for Beginners and Insecure. */
(function () {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
  const STUDENT = { beginners: 'Starter', insecure: 'Base', safe: 'Core', daring: 'Plus' };
  const COURSE = { '2eso': '2 ESO', '4eso': '4 ESO' };
  const LS = { 'free-time-live': 'Free Time, Live!', 'seasons-and-celebrations': 'Seasons & Celebrations' };
  const q = new URLSearchParams(location.search);
  const ls = q.get('ls') || '', lp = q.get('lp') || '', level = ROUTES.includes(q.get('route')) ? q.get('route') : 'insecure', key = q.get('key') === '1';
  const base = '../../' + ls + '/';
  const ca = level === 'insecure' || level === 'beginners';
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca ? (o.ca || o.en) : (o.en || o.ca));
  const byLevel = o => o == null ? '' : typeof o === 'string' ? o : (o[level] != null ? o[level] : o.safe != null && level === 'daring' ? o.safe : o.insecure);
  const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level)) : (items[level] || (level === 'beginners' ? items.insecure : null) || []);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = (c, e) => ca ? c : e;
  const transcripts = [];

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
  function gapped(it) {
    const a = it.a ? it.a[0] : '', n = (it.q.match(/_{2,}/g) || []).length;
    if (!n) return '<li><span class="q">' + it.q + '</span>' + (key ? '<div class="key-line">' + esc(a) + '</div>' : lines(1)) + '</li>';
    const q = it.q.replace(/_{2,}/g, () => key && n === 1 ? '<span class="gap filled">' + esc(a) + '</span>' : '<span class="gap"></span>');
    return '<li><span class="q">' + q + '</span>' + (key && n > 1 ? ' <span class="key-line">→ ' + esc(a) + '</span>' : '') + '</li>';
  }
  const gaps = items => '<ol class="items">' + items.map(gapped).join('') + '</ol>';
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
    if (m.audio) listen.push({ title: m.title || 'Listening', script: m.script ? m.script.map(([w, l]) => '<p><b>' + esc(w) + ':</b> ' + esc(l) + '</p>').join('') : null });
    (m.videos === true ? [{ base: 'video/halloween-castanyada', title: 'Halloween and the Castanyada' }] : m.videos || []).forEach(v => listen.push({ title: v.title, vtt: v.base + '.vtt' }));
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
  R.recall = p => gaps(forLevel(p.items));
  R.typed = p => (p.groups ? table(p) : '') + (p.explain ? '<div class="box"><b>' + T('Com funciona', 'How it works') + '</b>' + forLevel(p.explain).map(e => '<div>' + tx(e) + '</div>').join('') + '</div>' : '') + gaps(forLevel(p.items));
  function table(p) {
    const g = forLevel(p.groups);
    return '<table class="vocab"><thead><tr><th>English</th><th>Català</th><th>' + T('Exemple', 'Example') + '</th></tr></thead>' +
      g.map(x => '<tbody><tr class="grp"><td colspan="3">' + x.g + '</td></tr>' + x.items.map(i => '<tr><td><b>' + i[0] + '</b></td><td>' + i[1] + '</td><td>' + i[2] + '</td></tr>').join('') + '</tbody>').join('') + '</table>' +
      (p.receptive ? '<p class="tiny">' + T('Paraules que sentiràs o llegiràs (no cal aprendre-les): ', 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '') +
      '<p class="tip">' + T('Estudia-les: tapa la columna English i digues cada paraula en anglès. Després completa les frases sense mirar la taula.', 'Study them: cover the English column and say each word in English. Then complete the sentences without looking at the table.') + '</p>';
  }
  R.vocab = p => table(p) + (p.practice ? '<h3>' + T('Completa les frases', 'Complete the sentences') + '</h3>' + gaps(forLevel(p.practice)) : '');
  R.mc = p => media(p) + choices(forLevel(p.items));
  R.writing = p => {
    const min = byLevel(p.min), frame = byLevel(p.frame || {});
    return '<div class="box"><b>' + T('La tasca', 'Your task') + '</b><div>' + byLevel(p.task) + '</div></div>' +
      (p.model ? '<div class="box model"><b>' + T('Model (no el copiïs)', 'Model (don’t copy it)') + '</b><div>' + tx(p.model) + '</div></div>' : '') +
      (frame ? '<div class="box">' + frame + '</div>' : '') +
      (min ? '<p class="tiny">' + T('Mínim ', 'Minimum ') + min + T(' paraules.', ' words.') + '</p>' : '') + lines(Math.max(8, Math.ceil((min || 60) / 8) + 4)) +
      '<h3>' + T('Revisa abans d’entregar', 'Check before you hand it in') + '</h3>' + ticks(byLevel(p.checklist) || []);
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
      '<p class="eyebrow">' + (COURSE[course] || '') + ' · ' + name + ' · ' + T('Ruta', 'Route') + ' ' + STUDENT[level] + (key ? ' · ' + level[0].toUpperCase() + level.slice(1) + ' · ' + T('SOLUCIONS', 'ANSWER KEY') : '') + '</p>' +
      '<h1>' + (typeof LP.n === 'number' ? 'Learning Path ' + LP.n + ' · ' : '') + LP.title + '</h1>' +
      (key ? '' : '<p class="note">✏️ ' + T('Fitxa en paper: fes les mateixes activitats que a l’ordinador. On diu «escriu» o «tria», escriu la resposta o encercla la lletra. Fes-ho sense apunts la primera vegada.', 'Paper worksheet: do the same activities as on the computer. Write your answers and circle the letter of the right option. Do it without notes the first time.') + '</p>') + '</header>';
  }

  async function run() {
    const s = document.createElement('script'); s.src = base + 'data/' + lp + '.js';
    await new Promise((ok, no) => { s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    const LP = window.LP; let n = 0;
    document.title = LP.title + ' · ' + STUDENT[level] + (key ? ' · key' : '');
    const parts = LP.panels.map(p => {
      const body = (R[p.type] || (() => null))(p);
      if (body == null) return '';
      n++;
      return '<section class="step"><div class="head"><h2><span class="num">' + n + '</span>' + tx(p.title || p.tab) + '</h2>' +
        (p.intro ? '<p class="intro">' + tx(p.intro) + '</p>' : '') + '</div>' + body + '</section>';
    }).join('');
    let tr = '';
    for (const [i, t] of transcripts.entries()) tr += '<div class="tr"><h3>' + T('Transcripció ', 'Transcript ') + (i + 1) + ' · ' + esc(t.title) + '</h3>' + (t.script || await vtt(base + t.vtt)) + '</div>';
    const out = document.getElementById('sheet');
    out.innerHTML = header(LP) + parts + (tr ? '<section class="step transcripts"><h2>' + T('Transcripcions (només si no pots escoltar l’àudio)', 'Transcripts (only if you cannot listen)') + '</h2>' + tr + '</section>' : '');
    // Screen-only bits of the page content (buttons, links to open, players) make no sense on paper.
    out.querySelectorAll('button, iframe, video, audio, input, script, .btn, .actions').forEach(e => e.remove());
    out.querySelectorAll('a').forEach(a => a.replaceWith(...a.childNodes));
    if (key) out.classList.add('is-key');
    document.body.dataset.ready = '1';
  }
  run().catch(e => { document.getElementById('sheet').textContent = 'Could not load ' + base + 'data/' + lp + '.js'; document.body.dataset.ready = 'error'; console.error(e); });
})();
