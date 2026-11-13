// 📓 My notebook (Roger, 13 Nov 2026: "I need students to see this section as though it was hand written with an index, students say that
// is difficult for them to organise their minds with the web. So there, it should appear the theory, vocabulary we've done so far and their
// notes"). The LS page's #notes place (el-notes.js) is drawn as a ring notebook for the student:
//  - page 1: the exam date on a sticky note, how to read the notebook, Sample exam and Print; then the index, with page numbers;
//  - for each learning path the group has done something of (el-exam.js, only what the group did, so nothing locked shows):
//    pages with the day in the margin, the tabs done in class, 📚 the key terms in handwriting (and the vocabulary class games), and,
//    if there is grammar, pages with 🧩 the "How it works" boxes as the teacher's slips glued in, 📘 the notes taken on the whiteboard
//    while the teacher explained (el-whiteboard.js) and the grammar class games: theory slips, the student's notes in blue pen, the score
//    circled and a pink "study again" note;
//  - post-it tabs on top (Index, LP1, LP2…) and ◀ ▶, the arrow keys or dragging a page turn the pages: two pages side by side on a
//    Chromebook, one on a phone.
// The book fills the whole screen (Roger, 13 Nov 2026: "I mean that the book goes full screen, keep the path post-its") and nothing scrolls:
// what does not fit on a page goes on to the next one ("no vull que facin scroll, sinó que passin pàgines").
// Students make it theirs ("has de poder editar i afegir coses i moure seccions"): select words of any page to highlight, underline or
// circle them; ✍ add a note or 🟨 a post-it after any part; edit what they wrote on the whiteboard; ↶ undo their last change. Nothing
// moves (Roger, 13 Nov 2026: "I don't want them to move sections, only add comments"): no ▲ ▼, no new sections of their own. Everything is saved in notes/nb-<LS> (el-notes.js), the whiteboard notes in their own doc.
// (no "Aa Print letters" any more: Roger, 13 Nov 2026)
// No Firestore reads of its own: el-notes.js passes what it already read. Only LS2+ home pages load it (LS1 has no #notes).
window.ELNotebook = (function () {
  const me = document.currentScript && document.currentScript.src;
  function css() {
    if (document.getElementById('el-nb-css') || !me) return;
    const l = document.createElement('link'); l.id = 'el-nb-css'; l.rel = 'stylesheet'; l.href = new URL('../css/el-notebook.css?v=20261113j', me).href; document.head.append(l);
  }
  const PLAIN = 'el-nb-plain';
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  // (Roger, 13 Nov 2026: "I don't want Aa Print letters"): no button any more; always the handwriting
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // what the student wrote on a handwriting page: only the notebook's own marks are kept (a doc is the student's own, so it is cleaned
  // again here before the teacher's 👁 Student view shows it)
  const KEEP = new Set(['nb-pen-b', 'nb-pen-k', 'nb-pen-r', 'nb-pen-g', 'nb-hl-y', 'nb-hl-g', 'nb-hl-p', 'nb-hl-b', 'nb-hl-o', 'nb-ul', 'nb-ulw', 'nb-circ', 'nb-boxd', 'nb-cp']);
  // empty lines at the end of a note (Enter pressed many times) are left out, and more than one empty line in a row is one: they made empty
  // pages (Miquel's grammar notes: 7 empty pages). Not in a note with a drawing: the drawing lies over the lines and needs them.
  function clean(h, keep) {
    const s = cleanAll(h); return keep ? s : s.replace(/(?:<br>\s*){3,}/g, '<br><br>').replace(/(?:<br>|<div>(?:<br>|\s|&nbsp;)*<\/div>|\s|&nbsp;)+$/, '');
  }
  function cleanAll(h) {
    let n = 0;
    const box = new DOMParser().parseFromString('<div>' + String(h || '') + '</div>', 'text/html').body.firstChild;
    const out = node => {
      if (++n > 8000) return '';
      if (node.nodeType === 3) return esc(node.nodeValue);
      if (node.nodeType !== 1) return '';
      const tag = node.tagName;
      if (tag === 'BR') return '<br>';
      if (/^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|SVG|MATH)$/.test(tag)) return '';
      const inner = [...node.childNodes].map(out).join('');
      if (tag === 'DIV' || tag === 'P') return '<div>' + inner + '</div>';
      const cls = [...node.classList].filter(c => KEEP.has(c));
      return cls.length && node.textContent ? `<span class="${cls.join(' ')}">${inner}</span>` : inner;
    };
    return box ? [...box.childNodes].map(out).join('') : '';
  }
  // drawings: ["b|x,y x,y …"] in a 460-wide box (the handwriting page's width), pens b k r g
  const INK = { b: '#1f4fb5', k: '#23262b', r: '#d32f2f', g: '#2e7d32' };
  function svg(dr) {
    const st = (Array.isArray(dr) ? dr : []).map(s => { const [c, p] = String(s).split('|'); return { c: INK[c] || INK.b, p: String(p || '').split(' ').map(x => x.split(',').map(Number)).filter(x => x.length === 2 && x.every(Number.isFinite)) }; }).filter(s => s.p.length > 1);
    if (!st.length) return '';
    const h = Math.max(...st.flatMap(s => s.p.map(p => p[1]))) + 20;
    return `<svg viewBox="0 0 460 ${h}" style="aspect-ratio:460/${h};height:auto" aria-hidden="true">${st.map(s => `<polyline points="${s.p.map(p => p.join(',')).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
  }

  let H = null, secs = [], pages = [], pg = 0, LSKEY = '', order = [], last = null, saveT = 0, laid = '', gamesById = {};
  // 📓 one notebook for every LS of the course (Roger, 13 Nov 2026: "make LS1 and LS2 and the following ones part of the same notebook … one
  // Index per LS is okay, but the summary I want it of everything"): CH = the chapters, one per LS, each with its own helpers (H: LS, nb =
  // its notes/nb-<LS> doc, save) and its own order of sections. H and order are the chapter in use: a tap on a page uses that page's
  // chapter (data-ci), so marks, notes and moves are saved in that LS's own doc. ROOT = this page's LS (the cover and its colours).
  let CH = [], CI = 0, ROOT = null;
  const DIRTY = new Set();
  const use = i => { const c = CH[i]; if (c) { H = c; order = c.order || (c.order = []); CI = i; } };
  const ciOf = el => { const p = el && el.closest && el.closest('.nb-page'); return p && p.dataset.ci != null ? +p.dataset.ci : (H ? H.ci || 0 : 0); };
  const blkEls = (id, ci) => [...document.querySelectorAll(`.nb-spread .nb-page .nb-blk[data-b="${id}"]`)].filter(b => ciOf(b) === ci);
  // a link to a page: s:section, b:part or g:a point in a part, of chapter ci (resolved when the pages are laid out)
  const liTo = (l, to, ci) => `<a data-nbto="${to}|${ci}"><span class="t">${l}</span><span class="dots"></span><span class="n">00</span></a>`;
  const t = (c, e) => H.t(c, e);
  const mday = d => { if (!d || d === true) return ''; const s = String(H.exDay(d)).replace(/\.$/, '').replace(/,/g, ''); const i = s.indexOf(' '); return i > 0 ? esc(s.slice(0, i)) + '<br>' + esc(s.slice(i + 1)) : esc(s); };
  const lines = s => esc(String(s || '').trim()).replace(/\n\s*\n(\s*\n)+/g, '\n\n').replace(/\n/g, '<br>');
  const kindIcon = k => k === 'grammar' ? '🧩' : k === 'vocab' ? '📚' : '🎮';
  const gname = g => String(g.title || '').replace(/^(Grammar|Vocabulary) · /, '').replace(/^📘\s*/, '');
  const fk = s => String(s).replace(/[^A-Za-z0-9_~-]/g, '_').slice(0, 80);   // a safe key for Firestore maps and data-b
  const nid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);   // a new note's id, never the same twice
  const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const hasInk = v => !!(v && (String(v.text || '').trim() || String(v.html || '').replace(/<[^>]*>/g, '').trim() || (Array.isArray(v.dr) && v.dr.length)));

  // the student's own things in notes/nb-<LS> parts: o = {list: the sections' order, b: {section: the parts' order}}, n = {note id: {sec,
  // html, text, dr, day}} the notes added to a page, m = {part: [{s, e, c, x}]} the marks on the teacher's text (characters s to e, class c,
  // x = the first words, to find them again if the text changes), s… = the student's own sections {topic, day, html, text, dr}.
  const PT = () => H.nb.parts || (H.nb.parts = {});
  const O = () => { const p = PT(); if (!p.o || typeof p.o !== 'object') p.o = {}; if (!Array.isArray(p.o.list)) p.o.list = []; if (!p.o.b || typeof p.o.b !== 'object') p.o.b = {}; return p.o; };
  const NT = () => { const p = PT(); if (!p.n || typeof p.n !== 'object') p.n = {}; return p.n; };
  const MK = () => { const p = PT(); if (!p.m || typeof p.m !== 'object') p.m = {}; return p.m; };
  const MAXOWN = 16;   // the notes rule allows 20 parts: o, n, m and 16 sections of their own

  // a class game: the theory as slips, the notes in pen under each part, the score circled and what to study
  function game(g) {
    const r = g.res, pc = r && r.of ? Math.round(r.r / r.of * 100) : null, miss = (r && r.miss) || [];
    const hasNotes = Object.values(g.notes || {}).some(p => String(p.text || '').trim()), absent = !r && !hasNotes;
    const stamp = r ? `<span class="nb-stamp${pc >= 80 ? ' ok' : ''}">${r.r}/${r.of}${pc >= 80 ? ' ✓' : ''}</span>` : '';
    const parts = (g.parts || []).map((p, pi) => {
      const n = (g.notes || {})[p.k], txt = n && String(n.text || '').trim();
      return `<div class="nb-slip" data-gs="gm-${fk(g.id)}~${pi}">${p.slides && p.slides.length ? p.slides.map(H.slide).join('') : `<h4>${H.md(p.topic)}</h4>`}</div>`
        + (txt || (n && n.html) ? `<div class="nb-mine"><span class="nb-lab">✍ ${t('Els meus apunts', 'My notes')}${H.own ? `<button type="button" class="nb-ui nb-gned" data-g="${esc(g.id)}" data-k="${esc(p.k)}" title="${t('Edita els meus apunts', 'Edit my notes')}">✏️ ${t('Edita', 'Edit')}</button>` : ''}</span>${n.html || (n.dr && n.dr.length) ? `<div class="nb-notes">${clean(n.html, (n.dr || []).length)}${svg(n.dr)}</div>` : lines(txt)}</div>` : '');
    }).join('');
    let study = '';
    if (absent) study = `<div class="nb-sticky pink">${t('No vas fer aquest joc', 'You missed this game')}<small>${t('Llegeix la teoria i copia-la a la teva llibreta. Si tens dubtes, pregunta al professor.', 'Read the theory and copy it into your notebook. If anything is not clear, ask your teacher.')}</small></div>`;
    else if (r && !miss.length) study = `<div class="nb-sticky green">${t('Ho tens tot bé! Repassa els teus apunts abans de l\'examen.', 'All right! Read your notes again before the exam.')}</div>`;
    else if (r) {
      const by = {}; miss.forEach(x => { by[x.p || ''] = (by[x.p || ''] || 0) + 1; });
      study = `<div class="nb-sticky pink">${t('Estudia-ho una altra vegada', 'Study this again')}<ul>${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, n]) => {
        const p = (g.parts || []).find(x => x.k === k); return `<li>${p ? H.md(p.topic) : t('Altres preguntes', 'Other questions')} <small style="display:inline">(${n} ${n === 1 ? t('errada', 'mistake') : t('errades', 'mistakes')})</small></li>`;
      }).join('')}</ul></div>`;
    }
    return `<div class="nb-game"><div class="nb-h3" style="color:var(--nb-black)">${kindIcon(g.kind)} ${esc(gname(g))}${stamp}</div><span class="nb-when">${t('Joc de classe', 'Class game')}${g.when ? ' · ' + esc(H.day(g.when)) : ''}</span>${study}${parts}</div>`;
  }
  // notes taken on the whiteboard while the teacher explained (el-whiteboard.js): the boxes seen together, then the page they wrote
  function together(g) {
    const p = g.gt || {}, rd = /-rd$/.test(g.id), txt = String(p.text || '').trim();
    const sum = (p.sum || []).length ? `<div class="nb-slip">${p.sum.map(b => `<div class="ex-rule">${H.safe(b)}</div>`).join('')}<span class="nb-clip">📎 ${t('de la pissarra', 'from the whiteboard')}</span></div>` : '';
    const mine = p.html || (p.dr && p.dr.length) ? `<div class="nb-notes">${clean(p.html, (p.dr || []).length)}${svg(p.dr)}</div>` : txt ? `<div class="nb-mine">${lines(txt)}</div>` : `<p class="nb-pencil">${t('No vas prendre apunts aquí.', 'You didn\'t take notes here.')}</p>`;
    return `<div class="nb-game" data-gs="gt-${fk(g.id)}"><div class="nb-h3" style="color:var(--nb-black)">${rd ? '📖' : '📘'} ${esc(gname(g))}</div><span class="nb-when">${rd ? t('Lectura junts', 'Reading together') : t('Gramàtica junts', 'Grammar together')}${p.day ? ' · ' + esc(H.gtDay(p.day)) : ''}</span>${sum}<div class="nb-mine"><span class="nb-lab">✍ ${t('Els meus apunts de classe', 'My notes from class')}</span></div>${mine}</div>`;
  }
  const plainOf = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent; };
  const KIND = { vocab: '📚', grammar: '🧩', read: '📖', listen: '🎧', other: '📝', exam: '🎯', fp: '🎬' };
  // ✏️ the student's answers to an activity, their first try, corrected as a teacher would on paper (Roger, 13 Nov 2026: "with the
  // corrections made as if a corrector had marked them on top, only the first attempt"): their answer in blue pen in the sentence, a red
  // ✓ when it is right; when it is not, their answer crossed out in red with the right one written above it
  const blank = /_{2,}|…{1,}(?=\s*\()|\.{3,}/;
  function work(w) {
    const pen = x => esc(x).replace(/&amp;(#?\w+;)/g, '&$1');
    // a short right answer is written above the crossed-out one; a long one after it, so it never covers the line above
    const fix = x => x.ok || x.guess ? `<span class="nb-giv">${pen(x.given) || '—'}</span>`
      : !String(x.given || '').trim() ? `<span class="nb-fix in">${pen(x.right)}</span>`
      : String(x.right).length <= Math.max(14, String(x.given).length + 4) ? `<span class="nb-corr"><s class="nb-giv">${pen(x.given) || '&nbsp;—&nbsp;'}</s><span class="nb-fix">${pen(x.right)}</span></span>`
      : `<s class="nb-giv nb-x">${pen(x.given) || '&nbsp;—&nbsp;'}</s> <span class="nb-fix in">${pen(x.right)}</span>`;
    const li = x => {
      const q = String(x.q || ''), mark = x.guess ? '' : x.ok ? '<i class="nb-tick">✓</i>' : '<i class="nb-cross">✗</i>';
      if (!x.mc && blank.test(q)) return `<li>${q.replace(blank, () => fix(x))} ${mark}</li>`;
      return `<li>${q} <span class="nb-arrow">→</span> ${fix(x)} ${mark}</li>`;
    };
    const pc = w.of ? w.right / w.of : 1;
    return `<div class="nb-work"><div class="nb-wh">✏️ ${t('Les meves respostes', 'My answers')} <small>· ${t('primer intent', 'first try')}${w.day ? ' · ' + esc(H.exDay(w.day)) : ''}</small>${w.of ? `<span class="nb-stamp${pc >= .8 ? ' ok' : ''}">${w.right}/${w.of}</span>` : ''}</div><ol class="nb-ans">${w.qs.map(li).join('')}</ol></div>`;
  }
  // ⬜ an activity of a tab done in class that the student hasn't done yet: a "To do" note (Catalan for Starter/Base, as the rest of the
  // notebook) and its questions with a line to answer them, the options of a choice question in a fixed order (Roger, 13 Nov 2026)
  // 👁 in the teacher's student view the link opens through that student's board (today.html?student=uid&go=…, as the 📍 links of
  // problem reports do): a new tab doesn't keep this tab's student view, so the learning path opened as the teacher (Roger, 13 Nov 2026:
  // "this brought me to the SLP but as a teacher not a student"). Students' own links stay as they were.
  function asLink(href) {
    if (!href || !H || !H.preview || !H.uid || H.uid === 'demo') return href;
    try {
      const root = me ? new URL('../../', me) : new URL('../../', location.href), u = new URL(href, location.href);
      if (u.origin !== root.origin || !u.pathname.startsWith(root.pathname)) return href;
      const rel = u.pathname.slice(root.pathname.length) + u.hash.replace(/[!'()*~]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());   // today.html's go= takes only these characters
      return root.href + 'today.html?student=' + encodeURIComponent(H.uid) + '&go=' + encodeURIComponent(rel);
    } catch (e) { return href; }
  }
  function todo(w, go) {
    go = asLink(go);
    const line = '<span class="nb-gap"></span>';
    const li = x => `<li>${blank.test(x.q) ? String(x.q).replace(blank, line) : `${x.q}${x.o ? '' : ' ' + line}`}${x.o ? `<span class="nb-opts">${x.o.map(o => `<span>▢ ${esc(o)}</span>`).join('')}</span>` : ''}</li>`;
    return `<div class="nb-work nb-todo"><div class="nb-wh">✏️ ${t('Les meves respostes', 'My answers')}${go ? `<a class="nb-tdo nb-tdgo" href="${esc(go)}" target="_blank" rel="noopener" title="${t('Obre aquesta activitat al learning path', 'Open this activity on the learning path')}">${t('Per fer', 'To do')} ➜</a>` : `<span class="nb-tdo">${t('Per fer', 'To do')}</span>`}</div>`
      + (w.task ? `<p class="nb-pencil">${esc(plainOf(w.task)).slice(0, 400)}</p>` : '')
      + (w.qs.length ? `<ol class="nb-ans nb-tdq">${w.qs.map(li).join('')}</ol>` : `<p class="nb-pencil">${t('Encara no ho has fet: toca «Per fer ➜» per fer-ho al learning path.', 'You haven\'t done it yet: tap “To do ➜” to do it on the learning path.')}</p>`) + `</div>`;
  }
  const noteHtml = v => `${v.w ? `<span class="nb-when nb-qw">📍 ${esc(v.w)}${v.day ? ' · ' + esc(H.exDay(v.day)) : ''}</span>` : ''}<div class="nb-notes${/^[ygpb]$/.test(v.pi || '') ? ' nb-pi pi-' + v.pi : ''}">${v.html ? clean(v.html, (v.dr || []).length) : lines(v.text)}${svg(v.dr)}</div>`;

  // the parts of a section in the student's order (new parts go after the one they follow by default)
  function ordered(key, blocks) {
    const saved = (O().b[key] || []).filter(id => blocks.some(b => b.id === id)), list = saved.slice();
    blocks.forEach((b, i) => { if (list.includes(b.id)) return; let j = -1; for (let q = i - 1; q >= 0 && j < 0; q--) j = list.indexOf(blocks[q].id); list.splice(j + 1, 0, b.id); });
    // 🔒 nothing moves any more (Roger, 13 Nov 2026: "I don't want them to move sections, only add comments"): the parts of the notebook
    // stay in their own order, also for a student who moved them before; only their notes keep the place where they were added
    const fixedIds = blocks.filter(b => !b.note).map(b => b.id); let f = 0;
    return list.map(id => blocks.find(b => b.id === id).note ? id : fixedIds[f++]).map(id => blocks.find(b => b.id === id));
  }

  // 📝 the Exams section's two parts: 🎯 the exam and 🎬 the final product
  const rel = h => { const m = location.pathname.match(/\/[24]eso\/[^/]+\/[^/]*$/); return m ? '../../' + h : h; };
  // the cover's logo kept loaded and decoded, so the printed cover never shows an empty box where it goes (Roger, 13 Nov 2026: "fav icon missing")
  const LOGO = new Image(); LOGO.src = rel('favicon-192.png'); if (LOGO.decode) LOGO.decode().catch(() => {});
  // 📋 the final product rubric with the student's level underlined in every row (Roger, 13 Nov 2026: "in the final product, the rubric
  // underlining their result in each indicator"), with the teacher's ✔ / ➜ notes of that row under it. LS2: the rows of EL_GRADING fp.rows,
  // their indicators (NA … AE) and the level the teacher gave (results levels[step][c], one lower for a group row when x.down);
  // LS1: the rubric the teacher marked with (EL_FP_RUBRICS), level = the part's mark ÷ 2.5, as on the board (today.html fbRubric).
  const DEG = { AE: ['Excel·lent', 'Excellent'], AN: ['Notable', 'Very good'], AS: ['Satisfactori', 'Satisfactory'], NA: ['No satisfactori', 'Not achieved'] };
  function fpRubric(G, x, parts) {
    const lvOfM = m => { const v = parseFloat(String(m).replace(',', '.')); return isNaN(v) ? null : Math.max(0, Math.min(4, Math.round(v / 2.5))); };
    const fb = p => p && (p.ok.length || p.todo.length) ? `<ul class="nb-fbl">${p.ok.map(y => `<li class="ok">✔ ${esc(y)}</li>`).join('')}${p.todo.map(y => `<li class="todo">➜ ${esc(y)}</li>`).join('')}</ul>` : '';
    const row = (name, sub, w, cells, on, mark, p) => `<div class="nb-rub"><div class="nb-h3">${esc(name)}${sub ? ` <small>${esc(sub)}</small>` : ''}${w != null ? ` <small>(${esc(w)} %)</small>` : ''}${mark != null ? ` <span class="nb-stamp${mark >= 8 ? ' ok' : ''}">${String(mark).replace('.', ',')} / 10</span>` : ''}</div>`
      + `<ul class="nb-rbl">${cells.map((c, k) => `<li${k === on ? ' class="on"' : ''}><b>${esc(c[0])}</b> ${k === on ? `<span class="nb-hl">${esc(c[1])}</span> <span class="nb-you">◀ ${t('tu', 'you')}</span>` : esc(c[1])}</li>`).join('')}</ul>`
      + (on == null && mark === 0 ? `<p class="nb-pencil">${t('Sense evidència', 'No evidence')} ◀ ${t('tu', 'you')}</p>` : '') + fb(p) + `</div>`;
    const R = (window.EL_FP_RUBRICS || {})[G.fp.a];
    if (!G.fp.rows && R && R.rows.length && parts.length) {
      const al = alignRows(R.rows, parts);
      return `<div class="nb-when">${t('La rúbrica: el teu nivell està subratllat a cada fila.', 'The rubric: your level is underlined in every row.')}</div>`
        + R.rows.map((r, i) => { const p = al[i], L = p ? lvOfM(p.m) : null, on = L ? 4 - L : null;
          return row(r.name, r.sub, r.w, r.d.map((d, k) => [R.levels[k], d]), on != null && on < r.d.length ? on : null, p ? parseFloat(String(p.m).replace(',', '.')) : null, p); }).join('');
    }
    if (!(G.fp.rows || []).length) return '';
    const lv = x.levels || {}, found = (G.fp.rows || []).some(r => (lv[r.step] || {})[r.c]);
    if (!found && !parts.length) return '';
    return `<div class="nb-when">${t('La rúbrica: el teu nivell està subratllat a cada indicador.', 'The rubric: your level is underlined in every indicator.')}</div>`
      + G.fp.rows.map((r, i) => {
        const p = parts.find(y => y.n.toLowerCase() === String(r.name).toLowerCase()) || (parts.length === G.fp.rows.length ? parts[i] : null);
        let d = (lv[r.step] || {})[r.c]; if (d && r.step === 'group' && (x.down || {})[r.c] && window.elDegreeDown) d = elDegreeDown(d);
        if (!d && p) { const L = lvOfM(p.m); d = L ? ['NA', 'AS', 'AN', 'AE'][L - 1] : null; }
        const ind = (H.ca && G.indCa && G.indCa[r.c]) || (G.ind || {})[r.c] || [];
        const cells = ['AE', 'AN', 'AS', 'NA'].map((k, j) => [`${k} · ${t(DEG[k][0], DEG[k][1])}`, ind[3 - j] || '']);
        const mark = d ? (window.EL_DEGREE_MARK || {})[d] : p ? parseFloat(String(p.m).replace(',', '.')) : null;
        return row(r.name, /^\d/.test(r.c) ? r.c : '', r.w, cells, d ? ['AE', 'AN', 'AS', 'NA'].indexOf(d) : null, mark, p);
      }).join('');
  }
  function examBlocks(ex) {
    const G = (window.EL_GRADING || {})[H.LS] || {}, rs = H.rs || {}, out = [];
    const stamp = v => v == null ? '' : `<span class="nb-stamp${v >= 8 ? ' ok' : ''}">${String(Math.round(v * 10) / 10).replace('.', ',')} / 10</span>`;
    const paras = html => html.split(/\n\s*\n|\n/).filter(x => x.trim()).map(x => `<p class="nb-wp">${x}</p>`).join('');
    // a word-by-word diff of the student's text and the corrected one: kept words in pen, removed ones crossed out, new ones in green
    const wdiff = (a, b) => {
      const tok = x => x.replace(/\r/g, '').replace(/\n+/g, ' \u00b6 ').split(/[ \t]+/).filter(Boolean), A = tok(a), B = tok(b), n = A.length, m = B.length;
      if (n * m > 400000) return paras(esc(a));
      const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const out = []; let i = 0, j = 0, del = [], ins = [];
      const flush = () => { const d = del.filter(x => x !== '\u00b6'), s = ins.filter(x => x !== '\u00b6');
        if (d.length) out.push(`<s class="nb-giv nb-x">${esc(d.join(' '))}</s>`); if (s.length) out.push(`<span class="nb-fix in">${esc(s.join(' '))}</span>`);
        if (ins.includes('\u00b6')) out.push('\n'); del = []; ins = []; };
      while (i < n || j < m) {
        if (i < n && j < m && A[i] === B[j]) { flush(); out.push(A[i] === '\u00b6' ? '\n' : `<span class="nb-giv">${esc(A[i])}</span>`); i++; j++; }
        else if (j < m && (i >= n || L[i][j + 1] >= L[i + 1][j])) ins.push(B[j++]); else del.push(A[i++]);
      }
      flush();
      return out.join(' ').split(/ ?\n ?/).filter(x => x.trim()).map(x => `<p class="nb-wp">${x}</p>`).join('');
    };
    const fix = (mine, right) => (String(mine || '').trim() ? `<s class="nb-giv nb-x">${esc(mine)}</s> ` : '') + `<span class="nb-fix in">${esc(right || '')}</span>`;
    // 🎯 the exam
    if (G.exam) {
      const e = G.exam, x = rs[H.LS + '/assessment'] || {}, sc = x.sections || {}, r = x.report || {};
      const got = e.sections.filter(([k]) => sc[k] && sc[k].score != null);
      const max = got.reduce((n, [k, , mx]) => n + (+(sc[k].max || mx || e.max)), 0), mark = max ? got.reduce((n, [k]) => n + (+sc[k].score), 0) / max * 10 : null;
      let h = `<div class="nb-postit k-exam">🎯 ${t('Examen final', 'Final exam')}${ex.exam ? `<small>${esc(H.exDay(ex.exam))}</small>` : ''}</div>`;
      if (!got.length) h += `<p class="nb-pencil">${t('Quan el professor l\'hagi corregit, aquí hi tindràs la nota de cada part, les preguntes que cal revisar corregides i el teu writing corregit.', 'Once your teacher has marked it, you\'ll find here the mark of each part, the questions to review corrected and your writing corrected.')}</p>`;
      else {
        h += `<div class="nb-wh">🧮 ${t('La meva nota', 'My mark')} ${stamp(mark)}</div><ul class="nb-xparts">${got.map(([k, nm, mx]) => { const m = +(sc[k].max || mx || e.max), v = +sc[k].score; return `<li><b>${esc(nm)}</b> <span class="${v / m >= .5 ? 'ok' : 'ko'}">${String(Math.round(v * 10) / 10).replace('.', ',')} / ${m}</span></li>`; }).join('')}</ul>`;
        // (Roger, 13 Nov 2026: "in the exam I want all the questions and their answers, and the feedback I gave them"): every question of
        // the report, part by part, the student's answer in blue pen with ✓, or crossed out with the right one in green and why
        const all = (r.questions || []).slice().sort((a, b) => (+a.q || 0) - (+b.q || 0)), groups = [];
        all.forEach(q => { const p = q.part || ''; let g = groups.find(y => y.p === p); if (!g) groups.push(g = { p, qs: [] }); g.qs.push(q); });
        const PI = { Listening: '🎧', Reading: '📖', Vocabulary: '🔤', Grammar: '🧩' }, n1 = v => String(Math.round((+v || 0) * 10) / 10).replace('.', ',');
        const qli = q => { const pts = +q.pts || 0, got = q.ok ? pts : +q.got || 0, ok = q.ok || (pts && got >= pts), mine = String(q.mine || '').trim();
          return `<li>${esc(q.text || '')} <span class="nb-arrow">→</span> ${ok ? `<span class="nb-giv">${esc(mine || q.right || '')}</span> <i class="nb-tick">✓</i>` : `${fix(mine, q.right)} <i class="nb-cross">✗</i>`}`
            + (pts ? ` <small class="nb-pts">${n1(got)}/${n1(pts)}</small>` : '') + (!ok && q.why ? `<small class="nb-why">💡 ${esc(q.why)}</small>` : '') + `</li>`; };
        if (all.length) h += `<div class="nb-work"><div class="nb-wh">❓ ${t('Totes les preguntes', 'All the questions')}${r.full ? '' : ` <small>· ${t('les que cal revisar', 'the ones to review')}</small>`}</div>`
          + groups.map(g => `${g.p ? `<div class="nb-h3">${PI[g.p] || '📝'} ${esc(g.p)}</div>` : ''}<ol class="nb-ans" start="${+g.qs[0].q || 1}">${g.qs.map(qli).join('')}</ol>`).join('') + `</div>`;
        const w = r.writing;
        if (w) {
          const rub = (w.rubric || []).map(y => Array.isArray(y) ? y : [y.name, y.score, y.max]), tot = rub.reduce((a, y) => [a[0] + (+y[1] || 0), a[1] + (+y[2] || 0)], [0, 0]);
          h += `<div class="nb-wh">✍️ ${t('El meu writing', 'My writing')}${tot[1] ? ` <span class="nb-stamp${tot[0] / tot[1] >= .8 ? ' ok' : ''}">${String(Math.round(tot[0] * 10) / 10).replace('.', ',')} / ${tot[1]}</span>` : ''}</div>`;
          if (rub.length) h += `<ul class="nb-xparts">${rub.map(y => `<li><b>${esc(y[0])}</b> <span class="${(+y[1] || 0) / (+y[2] || 1) >= .5 ? 'ok' : 'ko'}">${String(Math.round((+y[1] || 0) * 10) / 10).replace('.', ',')} / ${esc(y[2])}</span></li>`).join('')}</ul>`;
          if (w.feedback) h += `<div class="nb-slip"><h4>💬 ${t('Comentari del professor', 'Your teacher\'s comment')}</h4><div class="ex-rule">${lines(w.feedback)}</div></div>`;
          // (Roger, 13 Nov 2026: "I want their real writing of the exam here, with the … corrected"): the student's own text with the
          // changes marked (crossed out in red, the right words in green), then the whole corrected text
          const orig = String(w.original || '').trim(), corr = String(w.corrected || '').trim();
          if (orig) h += `<div class="nb-work nb-wtext"><div class="nb-wh">📝 ${t('El meu text, corregit', 'My text, corrected')}</div>${corr ? wdiff(orig, corr.replace(/\*/g, '')) : paras(esc(orig))}</div>`;
          if (corr) h += `<div class="nb-slip nb-wfix"><h4>✅ ${t('El text corregit', 'The corrected text')}</h4>${paras(esc(corr).replace(/\*([^*\n]+)\*/g, '<b>$1</b>'))}</div>`;
          if ((w.errors || []).length) h += `<div class="nb-work"><div class="nb-wh">✏️ ${t('Les meves errades, corregides', 'My mistakes, corrected')}</div><ol class="nb-ans">${w.errors.map(y => `<li>${fix(y.orig, y.fix)}${y.why ? `<small class="nb-why">${esc(y.why)}</small>` : ''}</li>`).join('')}</ol></div>`;
        }
        if ((r.review || []).length) h += `<div class="nb-sticky pink">${t('Què has de repassar', 'What to review')}<ul>${r.review.map(y => `<li>${esc(y.text || '')}</li>`).join('')}</ul></div>`;
      }
      h += `<div class="nb-links nb-ui"><a href="${rel('today.html#exam')}">📝 ${t('L\'informe sencer de l\'examen', 'The whole exam report')} →</a></div>`;
      out.push({ id: 'x-exam', l: '🎯 ' + t('Examen final', 'Final exam'), side: t('Examen', 'Exam'), kind: 'exam', html: h });
    }
    // 🎬 the final product
    if (G.fp && G.fp.a) {
      const x = rs[G.fp.a] || {}, mark = x.max ? (+x.score || 0) / x.max * 10 : null;
      let h = `<div class="nb-postit k-fp">🎬 ${t('Producte final', 'Final product')}</div>`;
      if (mark == null && !x.feedback) h += `<p class="nb-pencil">${t('Quan el professor l\'hagi corregit, aquí hi tindràs la nota i el seu feedback.', 'Once your teacher has marked it, you\'ll find your mark and the feedback here.')}</p>`;
      else {
        if (mark != null) h += `<div class="nb-wh">🏁 ${t('La meva nota', 'My mark')} ${stamp(mark)}</div>`;
        // the feedback as the teacher writes it: "Part (w %) · m / 10" lines, then ✔ what went well and ➜ what to keep in mind
        const { parts, com } = fpParts(x.feedback);
        if (com.length) h += `<div class="nb-slip"><h4>💬 ${t('Feedback del professor', 'Your teacher\'s feedback')}</h4><div class="ex-rule">${lines(com.join('\n'))}</div></div>`;
        const rb = fpRubric(G, x, parts);
        if (rb) h += rb;
        else parts.forEach(p => { const v = parseFloat(p.m.replace(',', '.'));
          h += `<div class="nb-h3">${esc(p.n)} <small>(${esc(p.w)} %)</small> <span class="nb-stamp${v >= 8 ? ' ok' : ''}">${esc(p.m)} / 10</span></div>`
            + (p.ok.length || p.todo.length ? `<ul class="nb-fbl">${p.ok.map(y => `<li class="ok">✔ ${esc(y)}</li>`).join('')}${p.todo.map(y => `<li class="todo">➜ ${esc(y)}</li>`).join('')}</ul>` : ''); });
      }
      h += `<div class="nb-links nb-ui"><a href="${rel('today.html#final')}">🎬 ${t('El meu producte final', 'My final product')} →</a></div>`;
      out.push({ id: 'x-fp', l: '🎬 ' + t('Producte final', 'Final product'), side: t('Producte final', 'Final product'), kind: 'fp', html: h });
    }
    return out;
  }
  // 📘 the front cover (Roger, 13 Nov 2026: "Fes una portada per a cada alumne … els resums de les LS amb: competències treballades en les
  // activitats que consten a la llibreta, i AS, AN... amb l'indicador d'avaluació que els pertoca. Els percentatges d'encerts dels jocs, Les
  // activitats ben fetes en general (n/m) per cada communicative competence … El nom de l'alumne curs i English Lab, Roger Beltran i el curs
  // 2026/2027 amb el fav icon"; "La portada tb surt al obrir la llibreta"; "Per defecte la portada surt sempre"). Page 1 of every chapter and
  // of every print. One summary per LS of the course with something in it: from the learning paths' answers on this device (each step's
  // criteria in EL_STEP_CRITERIA; first try), the class games (myGames) and the results (the teacher's final level for a criterion wins).
  // the final product feedback as the teacher writes it: "Part (w %) · m / 10" lines, then ✔ what went well and ➜ what to keep in mind
  function fpParts(txt) {
    const HL = /^(.+?) \((\d+(?:[.,]\d+)?) ?%\) · ([\d.,]+) ?\/ ?10\s*$/, parts = [], com = []; let cur = null;
    String(txt || '').split('\n').forEach(l => { const s2 = l.trim(); if (!s2 || /^Final mark:/i.test(s2)) return; const m = s2.match(HL);
      if (m) { cur = { n: m[1], w: m[2], m: m[3], ok: [], todo: [] }; parts.push(cur); return; }
      if (cur && /^✔/.test(s2)) { cur.ok.push(s2.replace(/^✔\s*/, '')); return; } if (cur && /^➜/.test(s2)) { cur.todo.push(s2.replace(/^➜\s*/, '')); return; }
      if (cur) (cur.todo.length ? cur.todo : cur.ok).push(s2); else com.push(s2); });
    return { parts, com };
  }
  // which feedback part goes with which rubric row: the same first word ("Speaking & delivery" = "Speaking"), else the next free row
  // with the same weight ("Visual support (10%)" = "Google Slides", 10 %), so a feedback with a part missing still lines up
  function alignRows(rows, parts) {
    const out = rows.map(() => null), used = new Set(), w1 = x => String(x || '').toLowerCase().match(/[a-zà-ü]+/)?.[0] || '';
    parts.forEach(p => {
      let i = rows.findIndex((r, k) => !used.has(k) && w1(r.name) === w1(p.n));
      if (i < 0) i = rows.findIndex((r, k) => !used.has(k) && String(r.w) === String(p.w).replace(',', '.'));
      if (i >= 0) { used.add(i); out[i] = p; }
    });
    return out;
  }
  // which skill an activity practises, by its tab: the first tries of the cover's rings (recall and checkpoints mix them: left out)
  const SKILL = id => /^(grammar|mixed)$/.test(id) ? 'grammar' : /^(vocab|words|cards)$/.test(id) ? 'vocab' : /^(read|log|sources|ch\d+)$/.test(id) ? 'read' : /^(listen|again|chart)$/.test(id) ? 'listen' : null;
  const lsSum = L => {
    const G = (window.EL_GRADING || {})[L.id] || {}, SC = window.EL_STEP_CRITERIA || {}, crit = {}, comp = {}, skill = {}, act = { n: 0, ok: 0 };
    (window.EL_CATALOG || []).filter(a => a.ls === L.id && a.keys && a.keys[0]).forEach(a => {
      let st = null; try { st = JSON.parse(localStorage.getItem(a.keys[0]) || 'null'); } catch (e) {}
      const items = (st && st.items) || {}, first = {};
      Object.entries(items).forEach(([k, r]) => { const id = k.replace(/_[^_]+$/, ''); if (!r || !Array.isArray(r.ok) || !r.ok.length) return; if (!first[id] || String(r.date || '') < String(first[id].date || '')) first[id] = r; });
      Object.entries(first).forEach(([id, r]) => {
        const right = r.ok.filter(Boolean).length, of = r.ok.length, sk = SKILL(id);
        if (sk) { const z = skill[sk] || (skill[sk] = { r: 0, of: 0 }); z.r += right; z.of += of; }
        act.n++; if (right / of >= .5) act.ok++;
        const cs = ((SC[a.id] || {})[id] || []).filter(c => /^\d+\.\d+$/.test(c)); if (!cs.length) return;
        cs.forEach(c => { const x = crit[c] || (crit[c] = { r: 0, of: 0, n: 0 }); x.r += right; x.of += of; x.n++; });
        [...new Set(cs.map(c => c.split('.')[0]))].forEach(k => { const y = comp[k] || (comp[k] = { ok: 0, of: 0 }); y.of++; if (right / of >= .5) y.ok++; });
      });
    });
    const x = (H.rs || {})[L.id + '/assessment'] || {}, fin = x.final || {};
    // the exam is evidence too: each marked section counts for its criteria (points right out of its points), so an LS where only the
    // exam and the final product count (LS1) also shows its criteria
    ((G.exam || {}).sections || []).forEach(([k, , m, cs]) => { const v = (x.sections || {})[k]; if (!v || v.score == null) return;
      (cs || []).filter(c => /^\d+\.\d+$/.test(c)).forEach(c => { const y = crit[c] || (crit[c] = { r: 0, of: 0, n: 0 }); y.r += +v.score || 0; y.of += +(v.max || m) || 0; }); });
    // the final product is evidence too (Roger: "Final product missing"): LS2 = the level the teacher gave each fp row (results
    // levels[step][c], or the row's mark in the feedback); LS1 = the rubric's rows (EL_FP_RUBRICS, c) with the mark of each feedback part
    const fx = G.fp && (H.rs || {})[G.fp.a] || {}, fparts = fpParts(fx.feedback).parts, add = (c, m) => { if (!/^\d+\.\d+$/.test(c) || m == null || isNaN(m)) return; const y = crit[c] || (crit[c] = { r: 0, of: 0, n: 0 }); y.r += m; y.of += 10; };
    const pm = p => p ? parseFloat(String(p.m).replace(',', '.')) : null;
    if (G.fp && (G.fp.rows || []).length) G.fp.rows.forEach((r, i) => { const d = ((fx.levels || {})[r.step] || {})[r.c], p = fparts.find(y => y.n.toLowerCase() === String(r.name).toLowerCase()) || (fparts.length === G.fp.rows.length ? fparts[i] : null);
      add(r.c, d ? (window.EL_DEGREE_MARK || {})[d] : pm(p)); });
    else { const R = G.fp && (window.EL_FP_RUBRICS || {})[G.fp.a]; if (R && fparts.length) { const al = alignRows(R.rows, fparts); R.rows.forEach((r, i) => add(r.c, pm(al[i]))); } }
    Object.keys(fin).filter(c => /^\d+\.\d+$/.test(c)).forEach(c => { if (!crit[c]) crit[c] = { r: 0, of: 0, n: 0 }; });
    const rows = Object.keys(crit).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).map(c => {
      const v = crit[c], deg = fin[c] || (v.of ? window.elDegree && elDegree(v.r / v.of * 10) : null), i = (window.EL_DEGREES || []).indexOf(deg);
      const ind = (i >= 0 ? (((H.ca && G.indCa && G.indCa[c]) || (G.ind || {})[c]) || [])[i] || '' : '') || (window.elCriterionEasy && elCriterionEasy(L.course, c, true)) || (window.elCriterion ? String(elCriterion(L.course, c)).replace(/^(.{90}\S*)\s.*$/s, '$1…') : '');   // no indicators (LS1): the criterion in plain English (Roger: "the criteria of the exam should be in English")
      return { c, deg, ind, comp: window.elCompetence ? elCompetence(c) : '' };
    });
    const g = window.elGameStats ? elGameStats(Object.values(H.mg || {}).filter(y => y && y.ls === L.id)) : {};
    const e = G.exam, sc = x.sections || {}, got = e ? e.sections.filter(([k]) => sc[k] && sc[k].score != null) : [];
    const mx = got.reduce((n, [k, , m]) => n + (+(sc[k].max || m || e.max)), 0), exam = mx ? got.reduce((n, [k]) => n + (+sc[k].score), 0) / mx * 10 : null;
    const f = G.fp && (H.rs || {})[G.fp.a] || {}, fp = f.max ? (+f.score || 0) / f.max * 10 : null;
    return { L, rows, comp, skill, act, g, exam, fp, any: rows.length || g.n || exam != null || fp != null };
  };
  // the competences' names in English on the cover (Roger: "the criteria … should be in English")
  const SKI = { 1: '🌍', 2: '🎧', 3: '🗣️', 4: '📖', 5: '✍️', 6: '🔎', 7: '📚', 8: '🔁', 9: '🧭', 10: '🤝' };
  const CEN = { 1: 'Interculturality', 2: 'Listening', 3: 'Speaking', 4: 'Reading', 5: 'Writing', 6: 'Research', 7: 'Personal reading', 8: 'Mediation', 9: 'Self-regulation', 10: 'Ethical communication' };
  function front(st) {
    st = st || {};
    const me0 = (window.EL_LS || []).find(l => l.id === H.LS) || {}, grp = String(H.group || '').replace(/^(\d)ESO\s*([A-Z])?$/i, (m, n, l) => `${n} ESO${l ? ' ' + l : ''}`) || String(me0.course || '').replace(/^(\d)eso$/, '$1 ESO');
    const n1 = v => v == null ? '–' : String(Math.round(v * 10) / 10).replace('.', ',');
    const DG = { NA: t('No assolit', 'Not achieved'), AS: t('Assoliment satisfactori', 'Satisfactory'), AN: t('Assoliment notable', 'Very good'), AE: t('Assoliment excel·lent', 'Excellent') };
    // the student's level (Roger: "a la portada tb surt el nivell i nom (core...)"): "A2 · Core"
    const LVN = { beginners: 'Starter', insecure: 'Base', safe: 'Core', daring: 'Plus', native: 'Pro' }, lv = String(H.level || '').toLowerCase();
    const lvl = lv && LVN[lv] ? [window.elCefr ? elCefr(me0.course, lv) : '', LVN[lv]].filter(Boolean).join(' · ') : '';
    const sums = chapters().map(lsSum).filter(y => y.any || y.L.id === H.LS);
    // one ring: the degree, not the % (Roger: "Instead of %, the AS, AN…"): NA under 5 · AS · AN · AE from 9, the ring filled as far as they got
    const ring = (z, ic, nm, unit) => { const pc = z.of ? Math.round(z.r / z.of * 100) : null, dg = pc == null ? null : window.elDegree ? elDegree(pc / 10) : null;
      return `<div class="nb-fr-rg"><span class="nb-fr-ring${pc == null ? ' none' : ' d-' + dg}" style="--p:${pc || 0}"><b>${dg || '–'}</b></span><span><b><i>${ic}</i> ${esc(nm)}</b><small>${pc == null ? t('encara res', 'nothing yet') : `${esc(DG[dg] || '')} · ${unit ? `${z.n} ${z.n === 1 ? unit[0] : unit[1]} · ${pc} %` : `${z.r}/${z.of} ${t('bé', 'right')}`}`}</small></span></div>`; };
    // the class games of every LS of the course: only the latest play of each game counts (as the board and the mark)
    const ids = new Set(sums.map(y => y.L.id)), gl = Object.values(H.mg || {}).filter(y => y && ids.has(y.ls)), gm = { grammar: { r: 0, of: 0, n: 0 }, vocab: { r: 0, of: 0, n: 0 } };
    (window.elLatestGames ? elLatestGames(gl) : gl).forEach(y => { const z = gm[y.kind === 'vocab' ? 'vocab' : y.kind === 'grammar' ? 'grammar' : '']; if (z && y.of) { z.r += +y.r || 0; z.of += +y.of; z.n++; } });
    const act = sums.reduce((a, y) => { a.n += y.act.n; a.ok += y.act.ok; return a; }, { n: 0, ok: 0 }), here = sums.length > 1 ? `${window.elLsNum ? elLsNum(me0) : 'LS'}` : '';
    const tiles = [['✏️', act.n, t('activitats fetes', 'activities done'), act.n ? t(`${act.ok} bé al primer intent`, `${act.ok} right on the first try`) : ''],
      ['🎮', gm.grammar.n + gm.vocab.n, t('jocs de classe', 'class games played'), ''],
      ['🧭', st.lps || 0, t('learning paths començats', 'learning paths started'), here],
      ['🔤', st.words || 0, t('paraules a la llibreta', 'words in my notebook'), here],
      ['✍', st.notes || 0, t('apunts meus', 'notes I took'), here],
      ['📌', st.todo || 0, t('activitats per fer', 'activities to do'), st.todo ? t('fes-les per completar la llibreta', 'do them to complete your notebook') : t('tot fet!', 'all done!')]];
    const box = y => `<div class="nb-fr-ls"><div class="nb-fr-lh">📚 ${esc(chapName(y.L))}${y.exam != null ? ` <span class="nb-fr-k">📝 ${t('Examen', 'Exam')} <b>${n1(y.exam)}</b></span>` : ''}${y.fp != null ? ` <span class="nb-fr-k">🎬 ${t('Producte final', 'Final product')} <b>${n1(y.fp)}</b></span>` : ''}</div>`
      // (Roger, 13 Nov 2026: "The criteria should be more understandable maybe we can highlight sth, or add boxes"): one box per
      // criterion, the skill highlighted, the degree in words; the activities done well as a row of squares per skill
      + (y.rows.length ? `<div class="nb-fr-crit">${y.rows.map(r => { const k = String(r.c).split('.')[0];
        return `<div class="nb-fr-row d-${r.deg || 'x'}"><div class="nb-fr-rt"><span class="nb-fr-sk">${SKI[k] || '⭐'} <b>${esc(CEN[k] || String(r.comp).replace(/^\S+ · /, ''))}</b></span><span class="nb-fr-c">${esc(r.c)}</span><span class="nb-fr-d d-${r.deg || 'x'}">${esc(r.deg || '–')}</span><span class="nb-fr-dw">${esc(DG[r.deg] || t('encara sense nota', 'not assessed yet'))}</span></div>`
          + `${r.ind ? `<div class="nb-fr-t">${esc(r.ind)}</div>` : ''}</div>`; }).join('')}</div>` : `<p class="nb-pencil">${t('Encara no hi ha activitats corregides en aquesta LS.', 'No marked activities in this LS yet.')}</p>`)
      + `<div class="nb-fr-stats">${y.g.grammar != null || y.g.vocab != null ? `<span>🎮 ${t('Jocs', 'Games')}: 🧩 ${y.g.grammar != null ? y.g.grammar + ' %' : '–'} · 📚 ${y.g.vocab != null ? y.g.vocab + ' %' : '–'}</span>` : ''}</div>`
      + `${Object.keys(y.comp).length ? `<div class="nb-fr-ab"><div class="nb-fr-abh">✅ ${t('Activitats ben fetes', 'Activities done well')} <small>${t('(la meitat o més bé al primer intent)', '(half or more right on the first try)')}</small></div><div class="nb-fr-abl">${Object.keys(y.comp).sort((a, b) => a - b).map(k => { const z = y.comp[k], n = Math.min(z.of, 12);
        return `<div class="nb-fr-abc"><b>${SKI[k] || '⭐'} ${esc(CEN[k] || String(window.EL_COMPETENCES && EL_COMPETENCES[k] || 'CE' + k).replace(/^\S+ · /, ''))}</b><span class="nb-fr-sqs" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < Math.round(z.ok / z.of * n) ? 'ok' : ''}"></i>`).join('')}</span><small>${t(`${z.ok} de ${z.of} ben fetes`, `${z.ok} of ${z.of} done well`)}</small></div>`; }).join('')}</div></div>` : ''}</div>`;
    // a hard cover: the brand embossed on top, a white name label as on a school notebook, then the results stuck on as cards
    return `<div class="nb-front"><div class="nb-fr-top"><img src="${rel('favicon-192.png')}" alt="" width="40" height="40" decoding="sync"><b>English Lab</b><span>Roger Beltran<br>${t('curs', 'school year')} 2026/2027</span></div>`
      + `<div class="nb-fr-label">${H.own ? `<button type="button" class="nb-ui nb-cvbtn" title="${t('Canvia el color i el disseny de la portada', 'Change the colour and design of the cover')}">🎨 <span>${t('La meva portada', 'My cover')}</span></button>` : ''}<div class="nb-fr-title">${t('La meva llibreta d\'anglès', 'My English notebook')}</div>`
      + `<div class="nb-fr-line"><i>${t('Nom', 'Name')}</i><span class="nb-fr-name">${esc(H.name || '')}</span></div>`
      + `<div class="nb-fr-line"><i>${t('Grup', 'Class')}</i><span class="nb-fr-course">${esc(grp)}</span>${lvl ? `<i>${t('Nivell', 'Level')}</i><span class="nb-fr-lv">${esc(lvl)}</span>` : ''}</div></div>`
      // (Roger, 13 Nov 2026: "On the cover only this and add sth like this bit about grammar, vocabulary, reading, listening activities.
      // Then the following pages my results but in a cover style", then "This should be notebook like not like a cover"): the first tries
      // of each skill as rings, the results on the next pages, on notebook paper
      + `<div class="nb-fr-rings"><div class="nb-fr-rh">${t('Primers intents', 'First tries')}</div>${[['grammar', '🧩', t('Gramàtica', 'Grammar')], ['vocab', '📚', t('Vocabulari', 'Vocabulary')], ['read', '📖', 'Reading'], ['listen', '🎧', 'Listening']].map(([k, ic, nm]) => {
        const z = sums.reduce((a, y) => { const v = y.skill[k]; if (v) { a.r += v.r; a.of += v.of; } return a; }, { r: 0, of: 0 });
        return ring(z, ic, nm); }).join('')}`
      // 🎮 the class games and 📊 the numbers of the notebook (Roger, 13 Nov 2026: "Add more statistics here", the empty part of the cover)
      + `<div class="nb-fr-rh">${t('Jocs de classe', 'Class games')}</div>${ring(gm.grammar, '🧩', t('Jocs de gramàtica', 'Grammar games'), [t('joc', 'game'), t('jocs', 'games')])}${ring(gm.vocab, '📚', t('Jocs de vocabulari', 'Vocabulary games'), [t('joc', 'game'), t('jocs', 'games')])}</div>`
      + `<div class="nb-fr-nums"><div class="nb-fr-rh">${t('La meva feina', 'My work')}</div>${tiles.map(([ic, v, nm, sub]) => `<div class="nb-fr-num"><b>${ic} ${v}</b><span>${esc(nm)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`).join('')}</div>`
      + `</div><div class="nb-break"></div><div class="nb-front nb-fr-more">`
      + `<div class="nb-fr-res">⭐ ${t('Els meus resultats', 'My results')} <small>· ${esc(H.name || '')}</small></div>`
      + sums.map(box).join('')
      + `<p class="nb-fr-key">AE ${t('excel·lent', 'excellent')} · AN ${t('notable', 'very good')} · AS ${t('satisfactori', 'satisfactory')} · NA ${t('no assolit', 'not achieved')} </p></div><div class="nb-break"></div>`;
  }
  // 📚 the chapters (Roger, 13 Nov 2026: "Notebooks should have chapters call LS1 (Name) LS2 (Name)"): one chapter per LS of the course,
  // each on its LS page (#notes); the chapter name is "LS2 (Seasons & Celebrations)"
  const chapName = l => `${window.elLsNum ? elLsNum(l) : ''} (${String(l.title || '').replace(/^[^·]*·\s*/, '')})`;
  const chapters = () => { const me0 = (window.EL_LS || []).find(l => l.id === H.LS); return me0 ? (window.EL_LS || []).filter(l => l.course === me0.course) : []; };

  // 🎬 Final products (Roger, 13 Nov 2026: "Final products missing here"): a tab of its own beside ✨ Summary, one part per LS with
  // its mark, the teacher's feedback and the rubric with the student's level underlined (the part examBlocks makes), a side post-it per LS
  // list: [{ex, ci}]
  function fpSection(list) {
    const multi = list.length > 1, blocks = [], back = CI;
    list.forEach(({ ex, ci }) => {
      if (ci !== CI) use(ci);
      const b = examBlocks(ex).find(x => x.kind === 'fp'); if (!b) return;
      const L = (window.EL_LS || []).find(l => l.id === H.LS) || {};
      blocks.push({ id: 'fp-' + fk(H.LS), side: multi ? plainOf(window.elLsNum ? elLsNum(L) : H.LS) : b.side, kind: 'fp',
        html: b.html.replace(/^<div class="nb-postit k-fp">[^<]*<\/div>/, `<div class="nb-postit k-fp">🎬 ${esc(chapName(L))}</div>`) });
    });
    if (back !== CI) use(back);
    return { key: 'fps', fixed: true, tab: '🎬 ' + t('Productes finals', 'Final products'), l: '🎬 ' + t('Productes finals', 'Final products'), blocks,
      head: `<p class="nb-h1"><u>🎬 ${t('Productes finals', 'Final products')}</u></p>`
        + (blocks.length ? '' : `<p class="nb-pencil">${t('Quan el professor hagi corregit un producte final, aquí hi tindràs la nota i el seu feedback.', 'Once your teacher has marked a final product, you\'ll find your mark and the feedback here.')}</p>`) };
  }
  // list: [{ex, games, ci}], the chapters to sum up
  function summary(list) {
    // ✨ the last page: a summary of the LS (Roger, 13 Nov 2026: "on the last page, there should be a summary of the grammar indicating the
    // pages, and vocabulary topics and expressions. And a final sentence bigger and bolded"): every grammar point and vocabulary topic with
    // the page it is on, the expressions (the words of more than one word), and "Do shadowing, I promise it works!"
    const sg = [], sv = [], sx = [], sxSeen = new Set(), seenT = new Set();
    // one line per point (the same point in a part and in a game is listed once, at its first page)
    const once = (list, html, to) => { const k = plainOf(html).replace(/\s+/g, ' ').trim().toLowerCase(); if (!k || seenT.has((list === sg ? 'g' : 'v') + k)) return; seenT.add((list === sg ? 'g' : 'v') + k); list.push([html, to]); };
    const multi = list.length > 1;
    list.forEach(({ ex, games, ci }) => { const L = CH[ci] ? CH[ci].LS : H.LS, lsN = multi ? esc(window.elLsNum ? elLsNum((window.EL_LS || []).find(l => l.id === L) || {}) : '') + ' · ' : '';
      const li = (l, to) => liTo(l, to, ci);
    ex.lps.forEach(lp => {
      const tag = ` <small class="nb-sumlp">${lsN}LP${esc(lp.n)}</small>`, from = sg.length, fromV = sv.length;
      (lp.parts || []).forEach(pt => {
        const pid = 'lp' + lp.n + '-p-' + fk(pt.id);
        pt.grammar.forEach((g, gi) => once(sg, g.title, 'g:' + pid + '~' + gi));
        pt.terms.forEach((g, gi) => {
          if (!(g.items || []).length) return;
          once(sv, g.g || esc(pt.title && pt.title !== pt.name ? pt.title : pt.name), pt.terms.length > 1 || g.g ? 'g:' + pid + '~v' + gi : 'b:' + pid);
          g.items.forEach(x => { const w = plainOf(x.en).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim(), k = w.toLowerCase();
            if (w.split('/').some(v => /\s/.test(v.trim().replace(/^(a|an|the|to)\s+/i, ''))) && !sxSeen.has(k)) { sxSeen.add(k); sx.push(x); } });
        });
      });
      // the theory of the class games and the grammar explained on the whiteboard, too
      games.filter(g => H.lpOf(g) === String(lp.n)).forEach(g => {
        if (g.gt) { if (!/-rd$/.test(g.id)) once(sg, esc(gname(g)), 'g:gt-' + fk(g.id)); return; }
        (g.parts || []).forEach((p, pi) => once(g.kind === 'vocab' ? sv : sg, H.md(p.topic), 'g:gm-' + fk(g.id) + '~' + pi));
      });
      for (let i = from; i < sg.length; i++) sg[i] = li(sg[i][0] + tag, sg[i][1]);
      for (let i = fromV; i < sv.length; i++) sv[i] = li(sv[i][0] + tag, sv[i][1]);
    });
    });
    const sumUl = (ic, ca, en, items) => items.length ? `<div class="nb-h2">${ic} <span class="u">${t(ca, en)}</span></div><ul class="nb-idx nb-sum">${items.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
    return { key: 'sum', fixed: true, tab: '✨ ' + t('Resum de gram. i vocab.', 'Gram & Vocab summary'), l: '✨ ' + t('Resum de gramàtica i vocabulari', 'Grammar & Vocabulary summary'), blocks: [],
      head: `<p class="nb-h1"><u>✨ ${t('Resum de gramàtica i vocabulari', 'Grammar & Vocabulary summary')}</u> ${multi ? '' : `<small class="nb-chap">· ${esc(chapName((window.EL_LS || []).find(l => l.id === H.LS) || {}))}</small>`}</p>`
        + sumUl('🧩', 'Gramàtica', 'Grammar', sg) + sumUl('📚', 'Vocabulari: temes', 'Vocabulary topics', sv)
        + (sx.length ? `<div class="nb-h2">💬 <span class="u">${t('Expressions', 'Expressions')}</span></div><ul class="nb-voc">${sx.map(x => `<li><b>${x.en}</b>${x.ca ? ` <span>– ${x.ca}</span>` : ''}</li>`).join('')}</ul>` : '')
        + (!sg.length && !sv.length && !sx.length ? `<p class="nb-pencil">${t('Quan feu gramàtica i vocabulari a classe, el resum apareixerà aquí.', 'When you do grammar and vocabulary in class, the summary will appear here.')}</p>` : '')
        + `<p class="nb-final">${t('Fes shadowing, t\'ho prometo: funciona!', 'Do shadowing, I promise it works!')}</p>` };
  }
  // mode: 'one' = the notebook of one LS (cover, index, sections, summary); 'cover' = only the cover of the notebook of every LS;
  // 'chap' = one LS's chapter in it (its title page, its index and its sections; the summary of everything comes after the last one)
  function build(ex, games, mode) {
    mode = mode || 'one';
    const out = [], LS = H.LS, ls = (window.EL_LS || []).find(l => l.id === LS) || {};
    const course = String(ls.course || '').replace(/^(\d)eso$/, '$1 ESO'), name = String(ls.title || '').replace(/^[^·]*·\s*/, '');
    games.forEach(g => { gamesById[fk('g-' + g.id)] = g; });
    const notesOf = key => Object.entries(NT()).filter(([, v]) => v && !v.fl && v.sec === key).sort((a, b) => a[0].localeCompare(b[0])).map(([id, v]) => ({ id, note: true, html: noteHtml(v) }));
    const addBtn = key => H.own ? `<div class="nb-links nb-ui"><button type="button" class="nb-addnote" data-sec="${key}">✍ ${t('Afegeix una nota', 'Add a note')}</button><button type="button" class="nb-addnote" data-sec="${key}" data-pi="y">🟨 ${t('Enganxa-hi un post-it', 'Stick a post-it')}</button></div>` : '';
    // the cover
    const n = ex.exam && window.ELWeek ? ELWeek.days(ELWeek.today(), ex.exam) : null;
    const when = n == null || n < 0 ? '' : n === 0 ? t('avui!', 'today!') : n === 1 ? t('demà!', 'tomorrow!') : t(`d'aquí a ${n} dies`, `in ${n} days`);
    const st = { lps: ex.lps.filter(lp => lp.tabs.length).length, words: ex.lps.reduce((n, lp) => n + (lp.parts || []).reduce((m, pt) => m + pt.terms.reduce((k, g) => k + g.items.length, 0), 0), 0),
      todo: ex.lps.reduce((n, lp) => n + (lp.parts || []).filter(pt => pt.todo).length, 0),
      notes: Object.values(NT()).filter(v => v && (String(v.text || '').trim() || String(v.html || '').trim() || (v.dr || []).length)).length + games.filter(g => g.gt && (String(g.gt.text || '').trim() || String(g.gt.html || '').replace(/<[^>]*>/g, '').trim() || (g.gt.dr || []).length)).length
        + games.reduce((n, g) => n + Object.values(g.notes || {}).filter(v => v && (String(v.text || '').trim() || String(v.html || '').replace(/<[^>]*>/g, '').trim() || (v.dr || []).length)).length, 0) };
    const eng = `<p class="nb-h1"><u>${t('Anglès', 'English')}</u> <span class="nb-mine">${esc(course)}</span></p>`;
    const intro = `<div class="nb-links">${ex.sample ? `<a href="${esc(ex.sample)}">📝 ${t('Examen de mostra', 'Sample exam')}</a>` : ''}<button type="button" class="nb-printbtn">🖨 ${t('Imprimeix la llibreta', 'Print my notebook')}</button></div>
      <div class="nb-sticky">${ex.exam ? `🎯 ${t('EXAMEN', 'EXAM')}: ${esc(H.exDay(ex.exam))}${when ? ' · ' + when : ''}` : '🎯 ' + t('Què entra a l\'examen', 'What\'s in the exam')}<small>${t('Tot el que hi ha en aquesta llibreta és el que hem fet a classe: és el que entra a l\'examen. Cada vegada que fem alguna cosa nova, apareix aquí.', 'Everything in this notebook is what we did in class: it\'s what goes in the exam. Each time we do something new, it appears here.')}</small></div>
      ${ex.dropped.length ? `<p class="nb-pencil">✂️ ${t('No entra a l\'examen', 'Not in your exam')}: ${ex.dropped.map(a => `LP${esc(a.n)} ${esc(a.title)}`).join(' · ')}</p>` : ''}`;
    const legend = `<div class="nb-legend"><b>${t('Com es llegeix', 'How to read it')}</b><br>📎 ${t('paper enganxat = del professor', 'glued slip = from your teacher')} · <span class="nb-swp"></span> ${t('nota rosa = estudia-ho', 'pink note = study it again')}<br><span style="color:var(--nb-ink)">${t('boli blau', 'blue pen')}</span> = ${t('els teus apunts', 'your own notes')} · <span style="color:var(--nb-green)">${t('verd', 'green')}</span> = ${t('la correcció', 'the correction')} · <span style="color:var(--nb-red)">${t('cercle', 'circle')}</span> = ${t('la teva nota', 'your score')}</div>
      ${H.own ? `<div class="nb-legend"><b>${t('És la teva llibreta', 'It\'s your notebook')}</b><br>🖍 ${t('Tria unes paraules per subratllar-les o encerclar-les.', 'Select some words to highlight, underline or circle them.')}<br>✍ ${t('Afegeix notes i post-its amb ✍ 🟨. ↶ desfà el darrer canvi.', 'Add notes and post-its with ✍ 🟨. ↶ undoes your last change.')}<br>👉 ${t('Arrossega la pàgina per passar-la.', 'Drag a page to turn it.')}</div>` : ''}
`;
    const chTitle = `<div class="nb-h2">📚 ${t('Capítol', 'Chapter')} ${esc(chapName(ls))}</div>`;
    if (mode === 'cover') return [{ key: 'cover', fixed: true, blocks: [], head: front(st) + eng + `<div class="nb-links"><button type="button" class="nb-printbtn">🖨 ${t('Imprimeix la llibreta', 'Print my notebook')}</button></div>` + legend }];
    if (mode === 'chap') out.push({ key: 'chap', fixed: true, blocks: [], l: '📚 ' + esc(chapName(ls)), head: `<p class="nb-h1 nb-chh"><u>📚 ${esc(chapName(ls))}</u></p>` + intro.replace(/<button type="button" class="nb-printbtn">[^<]*<\/button>/, '') });
    else out.push({ key: 'cover', fixed: true, blocks: [], head: front(st) + eng + chTitle + intro + legend });
    out.push({ key: 'index', fixed: true, blocks: [], head: '' });
    const used = new Set();
    ex.lps.forEach(lp => {
      const gs = games.filter(g => H.lpOf(g) === String(lp.n)); gs.forEach(g => used.add(g.id));
      const rd = gs.filter(g => g.gt && /-rd$/.test(g.id)), gt = gs.filter(g => g.gt && !/-rd$/.test(g.id));
      const voc = gs.filter(g => !g.gt && g.kind === 'vocab'), gram = gs.filter(g => !g.gt && g.kind !== 'vocab');
      const d0 = (lp.tabs.find(x => x.day && x.day !== true) || {}).day, key = 'lp' + lp.n, blocks = [];
      const head = `${d0 ? `<div class="nb-mdate" style="top:34px">${mday(d0)}</div>` : ''}<p class="nb-h1"><u>LP${esc(lp.n)}</u> ${esc(lp.title)}</p>`
        + (lp.tabs.length ? `<div class="nb-pencil nb-done">${t('Fet a classe', 'Done in class')}: ${lp.tabs.map(x => `<i>✓</i> ${esc(x.name)}`).join(' ')}</div>` : '');
      // 📌 one part per tab of the learning path, in its order, with a post-it on top (Roger, 13 Nov 2026: "post-its for the sections with
      // the section's name"): key terms and how it works if it was done in class, then the student's own answers, corrected
      const parts = lp.parts || [];
      parts.forEach((pt, i) => {
        const ic = KIND[pt.kind] || '📝', nm = esc(pt.name);
        let h = `<div class="nb-postit k-${pt.kind}">${ic} ${nm}${pt.day && pt.day !== true ? `<small>${esc(H.exDay(pt.day))}</small>` : ''}</div>`;
        if (pt.title && pt.title !== pt.name) h += `<div class="nb-h3">${esc(pt.title)}</div>`;
        const pid = key + '-p-' + fk(pt.id);
        pt.terms.forEach((g, gi) => { h += `${pt.terms.length > 1 || g.g ? `<div class="nb-h3" data-gs="${pid}~v${gi}">${g.g}</div>` : ''}<ul class="nb-voc">${g.items.map(x => `<li><b>${x.en}</b>${x.ca ? ` <span>– ${x.ca}</span>` : ''}</li>`).join('')}</ul>`; });
        pt.grammar.forEach((g, gi) => { h += `<div class="nb-slip" data-gs="${pid}~${gi}"><h4>${g.title}</h4>${g.boxes.map(x => `<div class="ex-rule">${x}</div>`).join('')}</div>`; });
        if (pt.work) h += work(pt.work);
        else if (pt.todo) h += todo(pt.todo, lp.href ? lp.href.split('#')[0] + '#' + encodeURIComponent(pt.id) : '');
        else if (!pt.terms.length && !pt.grammar.length) h += `<p class="nb-pencil">✓ ${t('Fet a classe', 'Done in class')}</p>`;
        blocks.push({ id: key + '-p-' + fk(pt.id), l: ic + ' ' + nm + (pt.todo ? ` <span class="nb-tdo sm">${t('Per fer', 'To do')}</span>` : ''), side: pt.name, kind: pt.kind, html: h });
      });
      // the class games and the whiteboard notes go after the part they belong to (vocabulary / grammar / reading), else at the end
      const after = (k, list) => { const at = blocks.map(b => b.kind).lastIndexOf(k); blocks.splice(at < 0 ? blocks.length : at + 1, 0, ...list); };
      // (Roger, 13 Nov 2026: games have no theory any more and notes are taken in the SLP; the notes taken in a game before "should appear in
      // her notebook, well classified, in the vocabulary or grammar section"): a game goes inside that LP's Vocabulary / Grammar part, with
      // no index line of its own; only when the LP has no such part it stays a part of its own
      const into = (k, g) => { const b = blocks.filter(x => x.kind === k).pop(); if (!b) return false; b.html += game(g); return true; };
      const vocOwn = voc.filter(g => !into('vocab', g)), gramOwn = gram.filter(g => !into('grammar', g));
      after('vocab', vocOwn.map(g => ({ id: fk('g-' + g.id), l: '🎮 ' + esc(gname(g)), html: game(g) })));
      after('read', rd.map(g => ({ id: fk('g-' + g.id), l: '📖 ' + t('Apunts de la lectura', 'Reading notes'), html: together(g), gt: true })));
      after('grammar', gt.map(g => ({ id: fk('g-' + g.id), l: '✍ ' + t('Apunts de la pissarra', 'My whiteboard notes'), html: together(g), gt: true }))
        .concat(gramOwn.map(g => ({ id: fk('g-' + g.id), l: '🎮 ' + esc(gname(g)), html: game(g) }))));
      const empty = !blocks.length ? `<p class="nb-pencil">${t('En aquest learning path heu fet pràctica de comprensió i expressió: obre\'l per repassar-lo.', 'In this learning path you practised the skills: open it to look at it again.')}</p>` : '';
      out.push({ key, tab: 'LP' + lp.n, l: `LP${esc(lp.n)} ${esc(lp.title)}`, head: head + empty, blocks: ordered(key, blocks.concat(notesOf(key))), foot: addBtn(key) + `<div class="nb-links"><a href="${esc(lp.href)}">${t('Obre el learning path', 'Open the learning path')} →</a></div>` });
    });
    const rest = games.filter(g => !used.has(g.id) && !ex.dropped.some(a => String(a.n) === H.lpOf(g)));
    if (rest.length) out.push({ key: 'other', tab: '🎮', l: '🎮 ' + t('Altres jocs de classe', 'Other class games'), head: `<div class="nb-h2">🎮 <span class="u">${t('Altres jocs de classe', 'Other class games')}</span></div>`,
      blocks: ordered('other', rest.map(g => ({ id: fk('g-' + g.id), html: g.gt ? together(g) : game(g), gt: !!g.gt })).concat(notesOf('other'))), foot: addBtn('other') });
    // 📝 Exams (Roger, 13 Nov 2026: "Add a section (post-it) Exams, with the feedback and Final Product Feedback"): the exam, corrected as
    // on paper (the questions to review, the writing's mistakes, what to review) and the final product's mark and feedback. From the
    // student's results (results/{ls}/assessment and the final product's activity), which el-cloud.js already keeps on the device.
    // (the final product has its own 🎬 Final products tab, fpSection)
    const xb = examBlocks(ex).filter(b => b.kind !== 'fp');
    out.push({ key: 'exams', tab: t('Exàmens', 'Exams'), l: '📝 ' + t('Exàmens', 'Exams'), head: `<p class="nb-h1"><u>📝 ${t('Exàmens', 'Exams')}</u></p>`, blocks: ordered('exams', xb.concat(notesOf('exams'))), foot: addBtn('exams') });
    // ✍ the student's own sections (Roger, 13 Nov 2026: "sections in between like their notes, just in case they need to add info, but they
    // can't move the ones that come from the web"): each one goes after the section the student chose (after: its key), never moved
    const NB = PT(), own = Object.keys(NB).filter(k => /^s[a-z0-9]+$/.test(k) && NB[k] && typeof NB[k] === 'object');
    own.sort((x, y) => String(NB[x].day || '').localeCompare(String(NB[y].day || '')) || x.localeCompare(y)).forEach((k, j) => {
      const sx = NB[k], body = hasInk(sx) ? [{ id: k + '~', own: k, html: noteHtml(sx) }] : [];
      out.push({ key: k, own: true, tab: j === 0 ? '✍' : '', l: '✍ ' + esc(sx.topic || t('Els meus apunts', 'My notes')),
        head: `${sx.day ? `<div class="nb-mdate" style="top:34px">${mday(sx.day)}</div>` : ''}<p class="nb-h1">${H.own ? `<input class="nb-stitle" data-sid="${k}" maxlength="60" value="${esc(sx.topic || '')}" aria-label="${t('Títol de la secció', 'Section title')}" spellcheck="false" autocomplete="off">` : esc(sx.topic || '')}</p>`,
        blocks: ordered(k, body.concat(notesOf(k))),
        foot: H.own ? `<div class="nb-links nb-ui"><button type="button" class="nb-addnote" data-sec="${k}">✍ ${t('Escriu-hi', 'Write here')}</button><button type="button" class="nb-del" data-sid="${k}">🗑 ${t('Esborra aquesta secció', 'Delete this section')}</button></div>` : '' });
    });
    // ✍ Quick notes: the notes taken with the 📓 button on a page that is not a learning path of this notebook (el-cloud.js qnOpen), and
    // any note whose section is not in the notebook (a learning path the class hasn't started yet), so a note never gets lost
    const keys = new Set(out.map(x => x.key)), lost = Object.entries(NT()).filter(([, v]) => v && !v.fl && v.sec !== 'qn' && !keys.has(v.sec));
    const qn = notesOf('qn').concat(lost.map(([id, v]) => ({ id, note: true, html: noteHtml(v) })));
    if (qn.length) out.push({ key: 'qn', tab: '📍', l: '📍 ' + t('Notes ràpides', 'Quick notes'), head: `<p class="nb-h1"><u>📍 ${t('Notes ràpides', 'Quick notes')}</u></p>`, blocks: ordered('qn', qn), foot: addBtn('qn') });
    // 🔒 the sections from the web always in their own order; the student's own ones go in after the one they chose (a section added
    // before 13 Nov keeps its place after the web section before it in the order the student had then, else at the end)
    const fixed = out.slice(0, 2), mov = out.slice(2), web = mov.filter(p => !p.own && p.key !== 'qn'), list = web.map(p => p.key), old = O().list;
    const oldAfter = k => { const i = old.indexOf(k); for (let q = i - 1; q >= 0; q--) if (list.includes(old[q]) && !/^s[a-z0-9]+$/.test(old[q])) return old[q]; return i > 0 ? null : undefined; };
    mov.filter(p => p.own).forEach(p => {
      const sx = NB[p.key] || {}, a = sx.after !== undefined ? sx.after : oldAfter(p.key);
      let j = a === null ? -1 : list.indexOf(a); if (a !== null && j < 0) { list.push(p.key); return; }
      while (j + 1 < list.length && /^s[a-z0-9]+$/.test(list[j + 1])) j++;   // after the ones already added there
      list.splice(j + 1, 0, p.key);
    });
    if (mov.some(p => p.key === 'qn')) list.push('qn');
    order = list;
    const all = fixed.concat(list.map(k => mov.find(p => p.key === k)));
    // the index: the page numbers are written in once the pages are laid out (data-nbto)
    const li = (l, to) => liTo(l, to, CI);
    if (mode === 'one') all.push(fpSection([{ ex, ci: CI }]), summary([{ ex, games, ci: CI }]));
    const ix = all.slice(2).map(s => {
      const sub = s.blocks.filter(b => b.l);
      const ins = H.own && list.includes(s.key) && !s.own && s.key !== 'qn' ? `<span class="nb-mv nb-ui"><button type="button" data-nbins="${s.key}" title="${t('Afegeix una secció teva després d\'aquesta', 'Add a section of your own after this one')}" aria-label="${t('Afegeix una secció teva després d\'aquesta', 'Add a section of your own after this one')}">➕</button></span>` : '';
      return `<li class="lp${s.own ? ' nb-ownli' : ''}"><div class="nb-row">${li(s.l, 's:' + s.key)}${ins}</div>${sub.length ? `<ul>${sub.map(b => `<li>${li(b.l, 'b:' + b.id)}</li>`).join('')}</ul>` : ''}</li>`;
    }).join('');
    const after = list.filter(k => !/^s[a-z0-9]+$/.test(k) && k !== 'qn').map(k => mov.find(p => p.key === k));
    const add = H.own && after.length ? (own.length < MAXOWN ? `<form class="nb-add nb-ui"><input maxlength="60" placeholder="${t('Nova secció teva: per exemple, Verbs irregulars', 'A new section of your own: for example, Irregular verbs')}" aria-label="${t('Nom de la nova secció', 'Name of the new section')}" spellcheck="false" autocomplete="off">`
      + `<label class="nb-after">${t('després de', 'after')} <select>${after.map((p, i) => `<option value="${p.key}"${i === after.length - 1 ? ' selected' : ''}>${esc(plainOf(p.l))}</option>`).join('')}</select></label><button type="submit">➕ ${t('Afegeix la secció', 'Add the section')}</button></form>`
      : `<p class="nb-pencil">${t(`Ja tens ${MAXOWN} seccions teves: esborra'n una per afegir-ne una altra.`, `You already have ${MAXOWN} sections of your own: delete one to add another.`)}</p>`) : '';
    all[1].head = `<p class="nb-h1"><u>${t('Índex', 'Index')}</u> <small class="nb-chap">· ${esc(chapName((window.EL_LS || []).find(l => l.id === H.LS) || {}))}</small></p>` + (ix ? `<ul class="nb-idx">${ix}</ul>` : `<p class="nb-pencil">${t('Encara no heu fet res d\'aquesta LS a classe. Quan ho feu, apareixerà aquí.', 'Your class hasn\'t done anything of this LS yet. When you do, it will appear here.')}</p>`)
      + (H.own ? `<p class="nb-pencil">${t('Després de cada classe hi apareixen pàgines noves. Amb ➕ hi afegeixes una secció teva on vulguis.', 'New pages appear here after each class. ➕ adds a section of your own wherever you want.')}</p>` : '') + add;
    return all;
  }

  // ---------- marks on the teacher's text ----------
  const tnodes = el => { const out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && n.parentElement.closest('.nb-ui,.nb-stamp') ? 2 : 1 }); while (w.nextNode()) out.push(w.currentNode); return out; };
  function paintMarks(el, list) {
    if (!Array.isArray(list) || !list.length) return;
    const ns = tnodes(el), text = ns.map(n => n.nodeValue).join('');
    const ms = list.map(m => {
      let s = +m.s, e = +m.e; if (!(e > s)) return null;
      const x = String(m.x || '');
      if (x && text.slice(s, s + x.length) !== x) {   // the text changed: find the same words, the nearest ones
        let best = -1, i = text.indexOf(x); while (i >= 0) { if (best < 0 || Math.abs(i - s) < Math.abs(best - s)) best = i; i = text.indexOf(x, i + 1); }
        if (best < 0) return null; e += best - s; s = best;
      }
      return { s, e: Math.min(e, text.length), c: m.c };
    }).filter(m => m && /^(hl-[ygpbo]|ul|ulw|circ)$/.test(m.c));
    let a = 0;
    ns.forEach(nd => {
      const len = nd.nodeValue.length, b = a + len, hit = ms.filter(m => m.s < b && m.e > a);
      if (hit.length) {
        const cuts = [...new Set([0, len, ...hit.flatMap(m => [m.s - a, m.e - a]).filter(x => x > 0 && x < len)])].sort((x, y) => x - y);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cuts.length - 1; i++) {
          const s = cuts[i], e = cuts[i + 1], str = nd.nodeValue.slice(s, e), cl = [...new Set(hit.filter(m => m.s <= a + s && m.e >= a + e).map(m => 'nb-' + m.c))];
          if (cl.length && str.trim()) { const sp = document.createElement('span'); sp.className = cl.join(' ') + ' nb-mk'; sp.textContent = str; frag.append(sp); } else frag.append(str);
        }
        nd.replaceWith(frag);
      }
      a = b;
    });
  }
  const textOf = id => blkEls(id, H ? H.ci || 0 : 0).map(p => tnodes(p).map(n => n.nodeValue).join('')).join('');
  const GROUP = c => /^hl-/.test(c) ? 'hl' : /^ul/.test(c) ? 'ul' : c;
  function markSel(c) {
    const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed) return; const r = sel.getRangeAt(0), per = {};
    document.querySelectorAll('.nb-spread .nb-page.l .nb-blk[data-b]:not(.nb-note),.nb-spread .nb-page.r .nb-blk[data-b]:not(.nb-note)').forEach(pc => {
      if (!r.intersectsNode(pc)) return; let acc = +pc.dataset.off || 0; const pk = ciOf(pc) + '|' + pc.dataset.b;
      tnodes(pc).forEach(tn => {
        const len = tn.nodeValue.length;
        if (r.intersectsNode(tn)) { const s = tn === r.startContainer ? r.startOffset : 0, e = tn === r.endContainer ? r.endOffset : len; if (e > s) { const g = per[pk] || (per[pk] = { s: 1e9, e: -1 }); g.s = Math.min(g.s, acc + s); g.e = Math.max(g.e, acc + e); } }
        acc += len;
      });
    });
    const ids = Object.keys(per); if (!ids.length) return;
    snap();
    const was = H ? H.ci || 0 : 0;
    ids.forEach(pk => {
      const cut = pk.indexOf('|'), id = pk.slice(cut + 1); use(+pk.slice(0, cut)); const M = MK();
      const { s, e } = per[pk], txt = textOf(id), keep = [];
      (Array.isArray(M[id]) ? M[id] : []).forEach(m => {
        if (m.e <= s || m.s >= e || (c !== 'x' && GROUP(m.c) !== GROUP(c))) return keep.push(m);
        if (m.s < s) keep.push({ s: m.s, e: s, c: m.c, x: txt.slice(m.s, Math.min(s, m.s + 30)) });
        if (m.e > e) keep.push({ s: e, e: m.e, c: m.c, x: txt.slice(e, Math.min(m.e, e + 30)) });
      });
      if (c !== 'x') keep.push({ s, e, c, x: txt.slice(s, Math.min(e, s + 30)) });
      M[id] = keep.slice(-200); if (!M[id].length) delete M[id];
      save();
    });
    use(was); sel.removeAllRanges(); hideSel(); relayout();
  }
  let selT = 0;
  const selBar = () => document.querySelector('.nb .nb-selbar');
  const hideSel = () => { const b = selBar(); if (b) b.hidden = true; };
  document.addEventListener('selectionchange', () => {
    clearTimeout(selT); selT = setTimeout(() => {
      const b = selBar(); if (!b || !H || !H.own) return;
      const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return hideSel();
      const r = s.getRangeAt(0), el = n => n && (n.nodeType === 1 ? n : n.parentElement);
      const a = el(r.startContainer), z = el(r.endContainer);
      const inBlk = x => x && x.closest('.nb-spread .nb-page .nb-blk[data-b]:not(.nb-note)') && !x.closest('.nb-ui,input,textarea');
      if (!inBlk(a) && !inBlk(z)) return hideSel();
      const rc = r.getBoundingClientRect(); if (!rc.width && !rc.height) return hideSel();
      b.hidden = false; const w = b.offsetWidth, hgt = b.offsetHeight;
      b.style.left = Math.max(8, Math.min(innerWidth - w - 8, rc.left + rc.width / 2 - w / 2)) + 'px';
      b.style.top = (rc.top - hgt - 10 > 8 ? rc.top - hgt - 10 : Math.min(innerHeight - hgt - 8, rc.bottom + 10)) + 'px';
    }, 120);
  });

  // ---------- the pages: nothing scrolls, what does not fit goes on to the next page ----------
  const SPLIT = '.nb-front,.nb-fr-ls,.nb-fr-crit,.nb-legend,.nb-blk,.nb-work,ol.nb-ans,.nb-opts,.nb-rub,ul.nb-rbl,ul.nb-xparts,ul.nb-fbl,.nb-game,.nb-slip,.ex-rule,.nt-s,ul.nb-voc,.nb-notes,ul.nb-idx,.nb-idx ul,.nb-mine,.nb-sticky ul';
  const SKIP = '.nb-mdate,.nb-ui';
  function flow(sp, frag, si) {
    let page, paper, cur, stack = [], leaves = 0;
    const newPage = () => {
      // a numbered list that goes on to the next page goes on with its numbers (start = the first one + the items already placed)
      const prev = []; for (let e = cur; e && paper && e !== paper; e = e.parentNode) prev.unshift(e);
      if (page) page.classList.remove('nb-meas');
      page = document.createElement('section'); page.className = 'nb-page nb-meas'; page.dataset.i = pages.length; page.dataset.s = si;
      page.innerHTML = `<div class="nb-paper"></div><span class="nb-pno">${pages.length + 1}</span><span class="nb-corner" aria-hidden="true"></span>`; sp.append(page);
      paper = page.firstChild; pages.push({ s: si, el: page });
      cur = paper; stack.forEach((s, i) => { const c = s.cloneNode(false); c.classList.add('nb-cont');
        const o = prev.length === stack.length ? prev[i] : null; if (c.tagName === 'OL' && o) c.start = (o.start || 1) + o.querySelectorAll(':scope>li').length;
        cur.append(c); cur = c; }); leaves = 0;
    };
    const fits = () => paper.scrollHeight <= paper.clientHeight + 1;
    // a heading never stays alone at the bottom of a page: it goes on with what it is the heading of
    // (Roger, 13 Nov 2026: "heading should appear on top"): also the section post-its and "My answers", and a heading at the top of a
    // part whose first line didn't fit (it goes up through the part's boxes)
    const HEAD = '.nb-h2,.nb-h3,h4,.nb-when,.nb-lab,.nb-postit,.nb-wh,.nb-fr-lh,.nb-fr-res';
    const blank = x => (x.nodeType === 3 && !x.nodeValue.trim()) || (x.nodeType === 1 && x.matches(SKIP));
    const breakBefore = force => {
      const keep = []; let box = cur, lvl = stack.length, x = cur.lastChild;
      for (;;) {
        while (x && (blank(x) || (x.nodeType === 1 && x.matches(HEAD)))) { if (x.nodeType === 1 && !blank(x)) keep.unshift({ e: x, lvl }); x = x.previousSibling; }
        if (x || box === paper || !keep.length && box.textContent.trim()) break;
        x = box.previousSibling; box = box.parentNode; lvl--;
      }
      // only headings on this page so far: the part stays here with them (made a bit smaller if it must)
      if (!force && keep.length && keep.length >= leaves) return false;
      const n = keep.length && keep.length < leaves ? keep : [], old = cur, oldPaper = paper;
      n.forEach(k => k.e.remove());
      // no empty boxes left behind at the bottom of the old page
      for (let e = old; e && e !== oldPaper && !e.textContent.trim() && !e.querySelector('img,svg,canvas');) { const p = e.parentNode; e.remove(); e = p; }
      newPage();
      const chain = [paper]; for (let c = paper; chain.length <= stack.length;) { c = c.lastElementChild; if (!c) break; chain.push(c); }
      n.forEach(k => { const at = chain[Math.min(k.lvl, chain.length - 1)]; at.insertBefore(k.e, chain[k.lvl + 1] && chain[k.lvl + 1].parentNode === at ? chain[k.lvl + 1] : null); leaves++; });
    };
    const counts = n => n.nodeType === 1 ? !n.matches(SKIP) : !!n.nodeValue.trim();
    const place = node => {
      if (node.nodeType === 1 && node.classList.contains('nb-break')) { if (leaves) newPage(); return; }
      cur.append(node);
      if (fits()) { if (counts(node)) leaves++; return; }
      node.remove();
      if (node.nodeType === 1 && node.matches(SPLIT) && (node.childNodes.length > 1 || (node.firstChild && node.firstChild.nodeType === 1))) {
        const shell = node.cloneNode(false), c = shell.cloneNode(false); cur.append(c);
        if (!fits() && leaves) { c.remove(); breakBefore(true); return place(node); }
        stack.push(shell); cur = c;
        [...node.childNodes].forEach(place);
        stack.pop(); cur = cur.parentNode; return;
      }
      if (leaves && breakBefore() !== false) return place(node);
      // alone on a new page and still too tall: a bit smaller, so it fits
      cur.append(node); leaves++;
      if (node.nodeType === 1) { const h = node.getBoundingClientRect().height, over = paper.scrollHeight - paper.clientHeight; if (h > 0 && over > 0) node.style.zoom = String(Math.max(.35, (h - over - 4) / h)); }
    };
    newPage(); [...frag.childNodes].forEach(place); page.classList.remove('nb-meas');
    // the cover's pages look like a notebook's hard cover (Roger, 13 Nov 2026: "The cover should look like a real notebook cover")
    // only the cover itself is the blue board; ⭐ My results after it are ordinary notebook paper (Roger: "This should be notebook like not like a cover")
    pages.forEach(p => { if (p.s === si && p.el.querySelector('.nb-front:not(.nb-fr-more)')) p.el.classList.add('nb-cvp', ...(p.el.querySelector('.nb-front:not(.nb-cont):not(.nb-fr-more)') ? ['nb-cv1'] : [])); });
  }
  // where the student is: the first part on the page shown, to open there again
  const here = () => { if (!pages.length) return null; const p = pages[Math.max(0, Math.min(pages.length - 1, pg))]; const b = p && p.el.querySelector('.nb-blk[data-b]'); const f = pages.findIndex(x => x.s === p.s); return (b ? 'b:' + b.dataset.b + '@' + (b.dataset.off || 0) : 's:' + ((secs[p.s] || {}).key || '') + '@' + (pg - f)) + '|' + (p.el.dataset.ci || 0); };
  function layout(keep, force) {
    const root = document.querySelector('.nb'), sp = root && root.querySelector('.nb-spread'); if (!sp || !H || (printing() && !force)) return false;
    const W = sp.clientWidth, Hh = sp.clientHeight; if (!W || !Hh) return false;
    if (keep == null) keep = atLP() || here();
    cvSet(root);
    sp.querySelectorAll('.nb-page,.nb-leaf').forEach(p => p.remove()); pages = []; T0 = null;
    const tpl = document.createElement('template'), keepCi = H.ci || 0;
    secs.forEach((s, si) => {
      use(s.ci || 0); const M = MK(), n0 = pages.length;
      tpl.innerHTML = s.head + s.blocks.map(b => `<div class="nb-blk${b.note || b.own ? ' nb-note' : ''}" data-b="${b.id}">${b.html}</div>`).join('') + (s.foot || '');
      tpl.content.querySelectorAll('.nb-blk[data-b]:not(.nb-note)').forEach(el => paintMarks(el, M[el.dataset.b]));
      flow(sp, tpl.content, si);
      for (let i = n0; i < pages.length; i++) pages[i].el.dataset.ci = s.ci || 0;
    });
    use(keepCi);
    // empty pieces left behind when a part moved on to the next page
    sp.querySelectorAll('.nb-cont,.nb-blk,.nb-slip,.nb-game,ul,.nb-notes,.nb-mine').forEach(e => { if (!e.textContent.trim() && !e.querySelector('svg,table,img,input,button')) e.remove(); });
    // where each piece of a part starts in its text (for marks), and the tools of each part on its first page
    const seen = {};
    sp.querySelectorAll('.nb-blk[data-b]').forEach(pc => {
      const ci = ciOf(pc), id = pc.dataset.b, k = ci + ':' + id; pc.dataset.off = seen[k] || 0; seen[k] = (seen[k] || 0) + tnodes(pc).map(n => n.nodeValue).join('').length;
      if (pc.dataset.off === '0' && H.own && !(secs[+pc.closest('.nb-page').dataset.s] || {}).fixed) { use(ci); pc.insertAdjacentHTML('afterbegin', tools(pc)); }
    });
    use(keepCi);
    // page numbers in the index and the tabs
    // (keyed by chapter: two LSs have parts with the same ids)
    const secStart = {}, blkPage = {}, gsPage = {};
    pages.forEach((p, i) => { const sc = secs[p.s] || {}, c = (sc.ci || 0) + ':', k = c + sc.key; if (secStart[k] == null) secStart[k] = i; p.el.querySelectorAll('.nb-blk[data-b]').forEach(b => { if (blkPage[c + b.dataset.b] == null) blkPage[c + b.dataset.b] = i; });
      p.el.querySelectorAll('[data-gs]').forEach(g => { if (gsPage[c + g.dataset.gs] == null) gsPage[c + g.dataset.gs] = i; }); });
    const to = v => { const [v0, c0] = String(v).split('|'), c = (c0 == null || c0 === '' ? 0 : +c0) + ':', [k, id] = [v0.slice(0, 1), v0.slice(2)];
      const i = k === 's' ? secStart[c + id] : k === 'g' ? (gsPage[c + id] != null ? gsPage[c + id] : blkPage[c + id.replace(/~v?\d+$/, '')]) : blkPage[c + id]; return i == null ? null : i; };
    root.querySelectorAll('[data-nbto]').forEach(a => { const i = to(a.dataset.nbto); if (i == null) { const n = a.querySelector('.n'); if (n && n.textContent === '00') n.textContent = ''; return; } a.dataset.nbgo = i; const n = a.querySelector('.n'); if (n) n.textContent = i + 1; });
    sp.querySelectorAll('.nb-page').forEach(p => { const i = +p.dataset.i; p.setAttribute('aria-label', t('Pàgina', 'Page') + ' ' + (i + 1)); });
    const pl = root.querySelector('.nb-plist'); if (pl) pl.innerHTML = pages.map((p, i) => `<label><input type="checkbox" value="${i}"> <b>${i + 1}</b> ${esc(pname(p))}</label>`).join('');
    const pa = root.querySelector('[data-nbpr="all"]'); if (pa) pa.textContent = t('Tota la llibreta', 'The whole notebook') + ` (${pages.length})`;
    laid = W + 'x' + Hh + (document.documentElement.classList.contains(PLAIN) ? 'p' : '');
    // back to the same place
    if (typeof keep === 'number') pg = keep;
    else if (keep) {
      const [k0, c0] = String(keep).split('|'), ci = c0 == null || c0 === '' ? keepCi : +c0, [k, rest] = [k0.slice(0, 1), k0.slice(2)];
      if (k === 's') { const [key, n] = rest.split('@'), i = secStart[ci + ':' + key]; if (i != null) { let j = i + (+n || 0); while (j > i && (!pages[j] || pages[j].s !== pages[i].s)) j--; pg = j; } }
      else { const [id, off] = rest.split('@'); const hit = blkEls(id, ci).filter(b => +b.dataset.off <= +(off || 0)).pop(); if (hit) pg = +hit.closest('.nb-page').dataset.i; else if (blkPage[ci + ':' + id] != null) pg = blkPage[ci + ':' + id]; }
    }
    show(); tourSoon(); return true;
  }
  const relayout = keep => { if (!layout(keep)) laid = ''; };
  function tools(pc) {
    const id = pc.dataset.b, s = secs[+pc.closest('.nb-page').dataset.s] || {}, list = s.blocks || [], i = list.findIndex(b => b.id === id), b = list[i] || {};
    const ed = b.note || b.own || b.gt;
    // a note: no buttons (tapping it opens it); nothing moves any more (Roger, 13 Nov 2026)
    if (b.note) return '';
    return `<span class="nb-ui nb-bt"><button type="button" data-nbadd="${id}" title="${t('Afegeix una nota aquí sota', 'Add a note below this')}">✍</button><button type="button" data-nbadd="${id}" data-pi="y" title="${t('Enganxa-hi un post-it a sota', 'Stick a post-it below this')}">🟨</button>${ed ? `<button type="button" data-nbed="${id}" title="${t('Edita', 'Edit')}">✏️</button>` : ''}</span>`;
  }
  const pname = p => { const s = secs[p.s] || {}, ls = CH.length > 1 && CH[s.ci || 0] ? ' · ' + plainOf((window.elLsNum ? elLsNum((window.EL_LS || []).find(l => l.id === CH[s.ci || 0].LS) || {}) : '')) : '';
    return s.key === 'cover' ? t('Portada', 'Cover') : s.key === 'index' ? t('Índex', 'Index') + ls : plainOf(s.l); };

  const wide = () => matchMedia('(min-width:900px)').matches;
  function show() {
    const root = document.querySelector('.nb'); if (!root || !pages.length) return;
    pg = Math.max(0, Math.min(pages.length - 1, pg));
    const a = wide() ? pg - pg % 2 : pg, z = wide() ? Math.min(a + 1, pages.length - 1) : a;
    pages.forEach((p, i) => { p.el.classList.toggle('l', i === a); p.el.classList.toggle('r', wide() && i === a + 1); });
    const pc = root.querySelector('.nb-pcur'); if (pc) pc.textContent = a === z ? t(`Aquesta pàgina (${a + 1})`, `This page (${a + 1})`) : t(`Aquestes pàgines (${a + 1}–${z + 1})`, `These pages (${a + 1}–${z + 1})`);
    root.querySelector('.nb-where').textContent = a === z ? t(`pàgina ${a + 1} de ${pages.length}`, `page ${a + 1} of ${pages.length}`) : t(`pàgines ${a + 1}–${z + 1} de ${pages.length}`, `pages ${a + 1}–${z + 1} of ${pages.length}`);
    root.querySelector('.nb-prev').disabled = a <= 0; root.querySelector('.nb-next').disabled = z >= pages.length - 1;
    // the chapter on the screen: its tabs only, and its LS tab marked (the chapters of every LS in one notebook)
    const cz = pages[z] ? +(pages[z].el.dataset.ci || 0) : 0; if (CH.length > 1 && pages[a]) use(+(pages[a].el.dataset.ci || 0));
    root.querySelectorAll('.nb-tab[data-ci]').forEach(b => { b.hidden = CH.length > 1 && +b.dataset.ci !== cz; });
    let cur = null; root.querySelectorAll('.nb-tab:not(.nb-ctab)').forEach(b => { if (!b.hidden && b.dataset.nbgo != null && +b.dataset.nbgo <= z) cur = b; });
    const onSum = cur && (cur.classList.contains('nb-sumtab') || cur.classList.contains('nb-fptab'));
    root.querySelectorAll('.nb-tab').forEach(b => b.setAttribute('aria-current', String(b === cur || (b.classList.contains('nb-ctab') && !onSum && +b.dataset.chap === cz && +b.dataset.nbgo <= z))));
    store.set('el-nb-pg|' + LSKEY, String(pg)); hideSel(); side(a, z); fpiPlace();
  }
  // 📌 the sections of the learning path open on the screen, as post-its sticking out of the book's edge: a tap goes to that section
  function side(a, z) {
    const box = document.querySelector('.nb .nb-side'); if (!box) return;
    const si = pages[z] ? pages[z].s : pages[a] && pages[a].s, s = secs[si] || {}, list = (s.blocks || []).filter(b => b.side);
    const on = new Set(); for (let i = a; i <= z; i++) pages[i] && pages[i].el.querySelectorAll('.nb-blk[data-b]').forEach(b => on.add(b.dataset.b));
    const page = id => { const e = blkEls(id, s.ci || 0)[0]; return e ? +e.closest('.nb-page').dataset.i : null; };
    box.innerHTML = list.map((b, i) => { const n = page(b.id); return n == null ? '' : `<button type="button" class="nb-stab k-${b.kind}${on.has(b.id) ? ' on' : ''}" data-nbgo="${n}" style="--i:${i}">${esc(b.side)}</button>`; }).join('');
  }
  function go(i) { pg = i; show(); }
  // what the student changes is saved 1.5 s after the last change (el-notes.js writes notes/nb-<LS>)
  // 👁 the teacher's student view shows the student's own buttons (Roger, 13 Nov 2026: "I'm on the student's view and I can't see that"),
  // but nothing is saved to the student's notebook (el-notes.js saves only for the student)
  const status = s => { if (H && H.preview && /^✓/.test(s)) s = '👁 ' + t('Vista d\'alumne: no es desa', 'Student view: not saved'); const st = document.querySelector('.nb-saved'); if (st) st.textContent = s; };
  function save() {
    clearTimeout(saveT); status(t('Desant…', 'Saving…')); H.order = order; DIRTY.add(H);
    saveT = setTimeout(() => {
      const was = H, wasO = order, list = [...DIRTY]; DIRTY.clear();
      const jobs = list.map(c => { H = c; order = c.order || []; O().list = order.slice(); const p = PT(); return c.save && c.save(p); });
      H = was; order = wasO;
      Promise.all(jobs).then(() => status('✓ ' + t('Desat', 'Saved'))).catch(() => status('⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again')));
    }, 1500);
  }
  // ↶ Undo (Roger, 13 Nov 2026: "an undo button is needed"): before each change the student makes (a mark, a note or post-it, a deleted
  // note or section, a section title, the cover, a note edited in the pad, notes from class edited), how it was is kept; ↶ (or Ctrl+Z)
  // puts the last one back and saves it. Steps that changed nothing are skipped. Only this visit's changes (up to 40), never the teacher's.
  const UNDO = [];
  const nbState = () => Object.fromEntries(CH.map(c => [c.LS, JSON.stringify((c.nb && c.nb.parts) || {})]));
  function snap(x) {
    const e = x || { nb: nbState() }; UNDO.push(e); if (UNDO.length > 40) UNDO.shift(); undoBtn();
  }
  const undoSame = e => e.nb ? CH.every(c => !(c.LS in e.nb) || e.nb[c.LS] === JSON.stringify((c.nb && c.nb.parts) || {}))
    : JSON.stringify(e.k ? (e.g.notes || {})[e.k] || null : e.g.gt || null) === e.v;
  function undoBtn() { document.querySelectorAll('.nb .nb-undo').forEach(b => { b.disabled = !UNDO.some(e => !undoSame(e)); }); }
  function undo() {
    if (ED) closeEditor(true);
    let e; while ((e = UNDO.pop()) && undoSame(e));
    undoBtn(); if (!e) return;
    if (e.nb) {
      const was = H ? H.ci || 0 : 0;
      CH.forEach(c => { if (c.LS in e.nb && e.nb[c.LS] !== JSON.stringify((c.nb && c.nb.parts) || {})) { c.nb.parts = JSON.parse(e.nb[c.LS]); use(c.ci); save(); } });
      use(was);
    } else {
      const v = JSON.parse(e.v);
      if (e.k) { const N = e.g.notes || (e.g.notes = {}); if (v) N[e.k] = v; else delete N[e.k]; gnSave(e.g, e.k); }
      else { e.g.gt = v; gtSave(e.g); }
    }
    redraw(); undoBtn();
  }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.nb .nb-undo') && H && H.own) { e.preventDefault(); undo(); } });
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || (e.key || '').toLowerCase() !== 'z' || ED || !H || !H.own || !document.querySelector('.nb')) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    e.preventDefault(); undo();
  });
  // drawn again from this page's LS (all the chapters), back where the student was in the chapter in use
  const redraw = keep => { if (!last) return; const ci = H ? H.ci || 0 : 0; if (typeof keep === 'string' && !keep.includes('|')) keep += '|' + ci; draw(last[0], last[1], last[2], ROOT || H, keep); };

  const pick = e => { if (CH.length < 2) return; const p = e.target && e.target.closest && e.target.closest('.nb-spread .nb-page'); if (p && p.dataset.ci != null) use(+p.dataset.ci); };
  ['pointerdown', 'mousedown', 'touchstart', 'click', 'change', 'input', 'submit', 'keydown', 'focusin'].forEach(ev => document.addEventListener(ev, pick, true));
  // 🔍 the dictionary floats over the notebook too (Roger, 13 Nov 2026: "only the magnifier, always floating")
  function dict() { if (window.ELDict || document.getElementById('el-dict-js') || !me) return; const sc = document.createElement('script'); sc.id = 'el-dict-js'; sc.src = new URL('./el-dict.js', me).href; document.head.append(sc); }
  // 📓 opened from a learning path (el-cloud.js el_nb_at, set by the click): that LP's step in the notebook, else that LP, else its LS
  // chapter. Kept (PEND) until a layout finds that LS: the first draws can come before the other LSs' chapters are loaded.
  let PEND;
  function atLP() {
    if (PEND === undefined) { PEND = null; try { const x = JSON.parse(store.get('el_nb_at') || 'null'); localStorage.removeItem('el_nb_at'); if (x && Date.now() - x.t < 120000) PEND = x; } catch (e) {} }
    const at = PEND; if (!at || !(Date.now() - at.t < 120000)) { PEND = null; return null; }
    const ci = CH.findIndex(c => c.LS === at.ls); if (ci < 0) return null;
    const lp = ((CH[ci].ex || {}).lps || []).find(l => String(l.href || '').split('#')[0].split('/').pop() === at.page);
    if (!lp && !CH[ci].ex) return null;
    PEND = null;
    if (!lp) return CH.length > 1 ? 's:chap|' + ci : null;
    const pt = (lp.parts || []).find(x => x.id === at.panel);
    return (pt ? 'b:lp' + lp.n + '-p-' + fk(pt.id) : 's:lp' + lp.n) + '|' + ci;
  }
  function draw(box, ex, games, helpers, keep) {
    css(); dict(); H = helpers; ROOT = helpers; last = [box, ex, games]; H.nb = H.nb || { parts: {} };
    const chs = Array.isArray(helpers.chapters) && helpers.chapters.length > 1 ? helpers.chapters : null;
    CH = chs ? chs.map(c => c.cur ? Object.assign(helpers, { ex, games }) : Object.assign({}, helpers, { LS: c.LS, nb: c.nb || (c.nb = { parts: {} }), save: c.save, ex: c.ex, games: c.games || [], chapters: null }))
      : [Object.assign(helpers, { ex, games })];
    if (!CH.includes(helpers)) CH.unshift(Object.assign(helpers, { ex, games }));
    CH.forEach((c, i) => { c.ci = i; c.order = null; });
    const rootCi = CH.indexOf(helpers);
    if (LSKEY !== (chs ? 'all|' : '') + H.LS) { LSKEY = (chs ? 'all|' : '') + H.LS; pg = +store.get('el-nb-pg|' + LSKEY) || 0; }
    secs = []; gamesById = {};
    if (!chs) { use(0); secs = build(ex, games, 'one'); secs.forEach(x => { x.ci = 0; }); CH[0].order = order; }
    else {
      // the cover (this LS's helpers: its name, results and colours), then every LS's chapter in the course's order, then the summary of all
      use(rootCi); build(ex, games, 'cover').forEach(x => { x.ci = 0; secs.push(x); });
      CH.forEach((c, i) => { use(i); const ss = build(c.ex, c.games, 'chap'); ss.forEach(x => { x.ci = i; }); c.order = order; secs.push(...ss); });
      const fs = fpSection(CH.map((c, i) => ({ ex: c.ex, ci: i }))); fs.ci = CH.length - 1; fs.all = true; secs.push(fs);
      use(CH.length - 1); const sm = summary(CH.map((c, i) => ({ ex: c.ex, games: c.games, ci: i }))); sm.ci = CH.length - 1; sm.all = true; secs.push(sm);
      use(rootCi);
    }
    const lsNum = c => esc(window.elLsNum ? elLsNum((window.EL_LS || []).find(l => l.id === c.LS) || {}) : c.LS);
    const subTabs = i => [`<button type="button" class="nb-tab" data-ci="${i}" data-nbto="s:index|${i}">${t('Índex', 'Index')}</button>`]
      .concat(secs.filter(x => x.ci === i && x.tab && !x.all).map(x => `<button type="button" class="nb-tab" data-ci="${i}" data-nbto="s:${x.key}|${i}">${esc(x.tab)}</button>`));
    const tabs = (chs
      ? CH.map((c, i) => `<button type="button" class="nb-tab nb-ctab nb-ctop" data-chap="${i}" data-nbto="s:chap|${i}" title="${esc(chapName((window.EL_LS || []).find(l => l.id === c.LS) || {}))}">📚 ${lsNum(c)}</button>`)
        .concat(CH.flatMap((c, i) => subTabs(i)), [`<button type="button" class="nb-tab nb-fptab" data-nbto="s:fps|${CH.length - 1}">🎬 ${t('Productes finals', 'Final products')}</button>`, `<button type="button" class="nb-tab nb-sumtab" data-nbto="s:sum|${CH.length - 1}">✨ ${t('Resum de gram. i vocab.', 'Gram & Vocab summary')}</button>`])
      : subTabs(0)).join('');
    const plain = document.documentElement.classList.contains(PLAIN);
    let rings = ''; for (let i = 0; i < 14; i++) rings += '<span class="nb-ring"></span>';
    const MKS = [['hl-y', '<span class="pad-hlb" style="background:var(--nb-hl-y)"></span>', 'Subratllador groc', 'Yellow highlighter'], ['hl-g', '<span class="pad-hlb" style="background:var(--nb-hl-g)"></span>', 'Subratllador verd', 'Green highlighter'], ['hl-p', '<span class="pad-hlb" style="background:var(--nb-hl-p)"></span>', 'Subratllador rosa', 'Pink highlighter'], ['hl-b', '<span class="pad-hlb" style="background:var(--nb-hl-b)"></span>', 'Subratllador blau', 'Blue highlighter'], ['hl-o', '<span class="pad-hlb" style="background:var(--nb-hl-o)"></span>', 'Subratllador taronja', 'Orange highlighter'],
      ['ul', '<span class="nb-ul pad-l">U</span>', 'Subratlla', 'Underline'], ['ulw', '<span class="nb-ulw pad-l">U</span>', 'Subratlla ondulat', 'Wavy underline'], ['circ', '<span class="nb-circ pad-l">o</span>', 'Encercla', 'Circle'], ['x', '🧽', 'Treu les marques', 'Take the marks off']];
    box.innerHTML = `<div class="nb"><div class="nb-bar" role="navigation" aria-label="${t('Pestanyes de la llibreta', 'Notebook tabs')}">${tabs}<span class="nb-sp"></span>`
      + (H.own ? `<button type="button" class="nb-tool nb-undo" title="${t('Desfés el darrer canvi (Ctrl+Z)', 'Undo your last change (Ctrl+Z)')}"${UNDO.some(e => !undoSame(e)) ? '' : ' disabled'} aria-label="${t('Desfés', 'Undo')}">↶</button><button type="button" class="nb-tool nb-hlbar" title="${t('Subratlla en colors: com es fa', 'Highlight in colours: how to')}" aria-label="${t('Subratlla', 'Highlight')}">🖍</button><button type="button" class="nb-tool nb-pibar" title="${t('Enganxa un post-it en aquesta pàgina per prendre notes mentre estudies', 'Stick a post-it on this page to take notes while you study')}" aria-label="${t('Post-it', 'Post-it')}">🟨</button><span class="nb-saved nb-pencil" role="status"></span>` : '')
      + `<span class="nb-pwrap"><button type="button" class="nb-tool nb-printbtn" aria-expanded="false">🖨 ${t('Imprimeix', 'Print')}</button><div class="nb-pmenu" hidden><b>🖨 ${t('Què vols imprimir?', 'What do you want to print?')}</b>`
      + `<label class="nb-pcov"><input type="checkbox" checked> 📘 ${t('Amb la portada', 'With the cover')}</label>`
      + `<button type="button" data-nbpr="cur" class="nb-pcur"></button><button type="button" data-nbpr="all"></button>`
      + `<details><summary>${t('Tria les pàgines…', 'Choose pages…')}</summary><div class="nb-plist"></div><button type="button" data-nbpr="sel">${t('Imprimeix les pàgines triades', 'Print the pages I chose')}</button></details></div></span>`
      // 🏠 to the student's board (Roger, 13 Nov 2026: "add a button to go to the students dashboard")
      + (H.own ? `<a class="nb-tool nb-home" href="${rel('today.html')}" title="${t('El meu tauler', 'My board')}">🏠<span class="nb-hlab"> ${t('El meu tauler', 'My board')}</span></a>` : '')
      + (H.own ? `<button type="button" class="nb-tool nb-help" title="${t('Com funciona la llibreta', 'How the notebook works')}" aria-label="${t('Com funciona la llibreta', 'How the notebook works')}">❓</button>` : '')
      + `<button type="button" class="nb-tool nb-close" title="${t('Tanca la llibreta', 'Close the notebook')}">✕ ${t('Tanca', 'Close')}</button></div>`
      + `<div class="nb-spread"><div class="nb-spine" aria-hidden="true">${rings}</div><nav class="nb-side" aria-label="${t('Seccions', 'Sections')}"></nav>${chs ? `<nav class="nb-lside${CH.length > 4 ? ' nb-many' : ''}" aria-label="${t('Situacions d\'aprenentatge', 'Learning situations')}">${CH.map((c, i) => { const L = (window.EL_LS || []).find(l => l.id === c.LS) || {}; return `<button type="button" class="nb-tab nb-ctab nb-lt" data-chap="${i}" data-nbto="s:chap|${i}" style="--i:${i}" title="${esc(chapName(L))}"><b>${lsNum(c)}</b><span> ${esc(chapName(L).replace(/^\S+\s*/, '').replace(/^\((.*)\)$/, '$1'))}</span></button>`; }).join('')}</nav>` : ''}</div>`
      + (!chs && chapters().length > 1 ? `<nav class="nb-chaps" aria-label="${t('Capítols', 'Chapters')}"><span class="nb-chl">📚</span>${chapters().map(l => l.id === H.LS
        ? `<span class="nb-ch on" aria-current="page" title="${esc(chapName(l))}"><b>${esc(window.elLsNum ? elLsNum(l) : '')}</b><span> ${esc(chapName(l).replace(/^\S+\s*/, ''))}</span></span>`
        : `<a class="nb-ch" href="${rel(l.id.replace(/^(\d+eso)-/, '$1/') + '/index.html#notes')}" title="${esc(chapName(l))}"><b>${esc(window.elLsNum ? elLsNum(l) : '')}</b><span> ${esc(chapName(l).replace(/^\S+\s*/, ''))}</span></a>`).join('')}</nav>` : '')
      + `<nav class="nb-nav" aria-label="${t('Passa la pàgina', 'Turn the page')}"><button type="button" class="nb-prev" aria-label="${t('Pàgina anterior', 'Previous page')}">◀</button><span class="nb-where"></span><button type="button" class="nb-next" aria-label="${t('Pàgina següent', 'Next page')}">▶</button></nav>`
      + (H.own ? `<div class="nb-selbar" role="toolbar" aria-label="${t('Marca les paraules triades', 'Mark the words you selected')}" hidden>${MKS.map(([k, h, ca, en]) => `<button type="button" data-nbmk="${k}" title="${t(ca, en)}" aria-label="${t(ca, en)}">${h}</button>`).join('')}</div>` : '')
      + `</div>`;
    pages = []; laid = '';
    watch(box.querySelector('.nb-spread'));
    if (!layout(keep)) { /* hidden for now: laid out when it shows (watch) */ }
  }

  // 🖨 printing: the pages are laid out again for a sheet of paper (Roger, 13 Nov 2026: "Here there's space between the info and it doesn't
  // make sense": the screen's pages are wider than tall, so each printed sheet had half of it empty), one page per sheet, then back to the
  // screen's pages where the student was. PSEL = the parts and sections of the pages picked in 🖨 (printPages), which are found again in
  // the sheets' pages. Never laid out while printing otherwise.
  let PRN = false, PSEL = null, PKEEP = null;
  addEventListener('beforeprint', () => {
    PRN = true; const sp = document.querySelector('.nb .nb-spread'), h = document.documentElement;
    if (!sp || !H || !sp.getClientRects().length) return;
    PKEEP = here(); h.classList.add('nb-prlay');
    if (!layout(PKEEP, true)) { h.classList.remove('nb-prlay'); return; }
    if (PSEL) { h.classList.add('nb-printsel'); pages.forEach(p => { const bs = [...p.el.querySelectorAll('.nb-blk[data-b]')].map(b => (p.el.dataset.ci || 0) + ':' + b.dataset.b);
      p.el.classList.toggle('nb-pr', bs.length ? bs.some(b => PSEL.b.has(b)) : PSEL.s.has(p.s)); }); }
  });
  addEventListener('afterprint', () => {
    PRN = false; const h = document.documentElement, was = h.classList.contains('nb-prlay');
    h.classList.remove('nb-prlay', 'nb-printsel'); document.querySelectorAll('.nb .nb-pr').forEach(p => p.classList.remove('nb-pr')); PSEL = null;
    if (was) relayout(PKEEP);
  });
  const printing = () => PRN || matchMedia('print').matches;
  // laid out again when the book's size changes (window, Chromebook rotated, fonts loaded), not while the student types in it
  let RO = null;
  function watch(sp) {
    if (!window.ResizeObserver) return;
    if (RO) RO.disconnect();
    RO = new ResizeObserver(() => {
      const on = !!sp.getClientRects().length; document.documentElement.classList.toggle('el-nb-full', on);
      if (printing()) return;
      if (!on || !sp.clientWidth || !sp.clientHeight) return;
      const k = sp.clientWidth + 'x' + sp.clientHeight + (document.documentElement.classList.contains(PLAIN) ? 'p' : '');
      if (k === laid) return;
      const a = document.activeElement; if (a && a.closest && a.closest('.nb-ed,.nb-stitle,.nb-add')) return;
      clearTimeout(RO.t); RO.t = setTimeout(() => { if (!printing()) layout(); }, laid ? 120 : 0);
    });
    RO.observe(sp);
  }
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { if (laid && !printing() && !ED && !drag && !T0) relayout(); });


  // ---------- 👋 first time: a short guided tour of the notebook (Roger, 13 Nov 2026: "I need messages the first time they open
  // the notebook to explain how it works"). Once per student (localStorage el-nb-tour|<uid> + o.tour in the notebook doc, so another
  // Chromebook doesn't show it again); ❓ in the top bar shows it again. Only the student's own notebook, never the teacher's view.
  const TOUR_K = () => 'el-nb-tour|' + (H && H.uid || '');
  let TOUR = null, tourT = 0;
  function tourSoon() {
    if (TOUR || !H || !H.own || store.get(TOUR_K()) || O().tour) return;
    clearTimeout(tourT); tourT = setTimeout(() => { const sp = document.querySelector('.nb-spread'); if (sp && sp.getClientRects().length && !ED && !TOUR) tour(); }, 700);
  }
  const vis = sel => [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden'; });
  function steps() {
    return [
      { ic: '📓', h: t('Aquesta és la teva llibreta', 'This is your notebook'), p: t('Tot el que fem a classe hi apareix sol: la teoria, el vocabulari, les teves respostes i els teus apunts. És el que entra a l\'examen.', 'Everything we do in class appears here by itself: the theory, the vocabulary, your answers and your notes. It\'s what goes in the exam.') },
      { el: '.nb-bar .nb-tab', all: '.nb-bar .nb-tab', ic: '🗂', h: t('Les pestanyes', 'The tabs'), p: t('Toca Index o un LP per anar-hi de seguida. A l\'índex hi ha totes les parts amb el número de pàgina.', 'Tap Index or an LP to go straight there. The index lists every part with its page number.') },
      { el: '.nb-nav', ic: '👉', h: t('Passa la pàgina', 'Turn the page'), p: t('Amb ◀ ▶, amb les fletxes del teclat, o arrossegant la cantonada de la pàgina com en un llibre de veritat. Aquí no es fa scroll.', 'With ◀ ▶, the arrow keys, or by dragging the corner of the page like a real book. No scrolling here.') },
      { el: '.nb-side .nb-stab', all: '.nb-side', at: '.nb-work', wide: 1, ic: '🏷', h: t('Els post-its de les seccions', 'The section post-its'), p: t('Cada LP està dividit en seccions: Vocabulary, Reading, Grammar… Toca un post-it del costat per saltar-hi.', 'Each LP is split into sections: Vocabulary, Reading, Grammar… Tap a post-it on the edge to jump there.') },
      { el: '.nb-work', at: '.nb-work', ic: '✏️', h: t('Les teves respostes, corregides', 'Your answers, corrected'), p: t('Després de cada activitat hi veuràs el teu primer intent, corregit en vermell: el que està malament ratllat i la resposta bona a sobre. Estudia sobretot això!', 'After each activity you\'ll see your first try, corrected in red: the wrong word crossed out and the right answer above it. Study those most!'), pad: 4 },
      { el: '.nb-spread', at: '.nb-work', ic: '🖍', h: t('Subratlla i encercla', 'Highlight and circle'), p: t('Tria unes paraules amb el ratolí o el dit i apareixeran els subratlladors: groc, verd, rosa, subratllar, ondulat, encerclar. 🧽 ho treu.', 'Select some words with the mouse or your finger and the highlighters appear: yellow, green, pink, underline, wavy, circle. 🧽 takes it off.'), pad: -30 },
      { el: '.nb-bt', at: '.nb-bt', ic: '🟨', h: t('Les teves notes i post-its', 'Your notes and post-its'), p: t('Al marge de cada part: ✍ afegeix una nota a sota i 🟨 hi enganxa un post-it (tria el color). Toca una nota per canviar-la. Si t\'equivoques, ↶ Desfés.', 'In the margin of each part: ✍ adds a note below it and 🟨 sticks a post-it (choose its colour). Tap a note to change it. Made a mistake? ↶ Undo.') },
      { el: '.eldict-fab', opt: 1, ic: '🔍', h: t('El diccionari', 'The dictionary'), p: t('La lupa sempre és aquí. Busca qualsevol paraula en anglès o en català.', 'The magnifier is always here. Look up any word in English or Catalan.') },
      { el: '.nb-printbtn', ic: '🖨', h: t('Imprimeix', 'Print'), p: t('🖨 imprimeix aquestes pàgines, les que triïs o tota la llibreta.', '🖨 prints these pages, the ones you choose or the whole notebook.') },
      { el: '.nb-close', all: '.nb-close,.nb-help,.nb-home', ic: '📓', h: t('Tanca i torna', 'Close and come back'), p: t('✕ tanca la llibreta i 🏠 et porta al teu tauler. El botó 📓 de baix a l\'esquerra de cada pàgina la torna a obrir. ❓ et torna a ensenyar això.', '✕ closes the notebook and 🏠 takes you to your board. The 📓 button at the bottom left of every page opens it again. ❓ shows you this again.') }
    ].filter(x => (!x.opt || vis(x.el)) && (!x.wide || wide()) && (!x.at || document.querySelector('.nb-spread .nb-page ' + x.at)));
  }
  function tour() {
    endTour(true);
    const S = steps(), pg0 = pg; let i = 0;
    const goAt = sel => { if (sel && vis('.nb-spread .nb-page ' + sel)) return; const e = sel && document.querySelector('.nb-spread .nb-page ' + sel); const to = e ? +e.closest('.nb-page').dataset.i : pg0; if (to !== pg) { pg = to; show(); } };
    const w = document.createElement('div'); w.className = 'nb-tour'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div class="nb-tour-ring"></div><div class="nb-tour-box" tabindex="-1"></div>';
    document.body.append(w); document.documentElement.classList.add('nb-touring');
    const ring = w.querySelector('.nb-tour-ring'), bx = w.querySelector('.nb-tour-box');
    const rectOf = st => {
      if (!st.el) return null;
      const els = st.all ? [...document.querySelectorAll(st.all)].filter(e => e.getClientRects().length) : [vis(st.el)];
      if (!els.length || !els[0]) return null;
      const rs = els.map(e => e.getBoundingClientRect()), pd = st.pad != null ? st.pad : 6;
      const r = { l: Math.min(...rs.map(x => x.left)) - pd, t: Math.min(...rs.map(x => x.top)) - pd, r: Math.max(...rs.map(x => x.right)) + pd, b: Math.max(...rs.map(x => x.bottom)) + pd };
      return { l: Math.max(4, r.l), t: Math.max(4, r.t), r: Math.min(innerWidth - 4, r.r), b: Math.min(innerHeight - 4, r.b) };
    };
    const go = () => {
      const st = S[i]; goAt(st.at); const r = rectOf(st);
      bx.innerHTML = `<div class="nb-tour-h"><span class="nb-tour-ic">${st.ic}</span>${st.h}</div><p>${st.p}</p><div class="nb-tour-f"><span class="nb-tour-n">${i + 1} / ${S.length}</span>`
        + `<button type="button" class="nb-tour-skip">${i === S.length - 1 ? '' : t('Salta', 'Skip')}</button>`
        + (i ? `<button type="button" class="nb-tour-back" aria-label="${t('Enrere', 'Back')}">◀</button>` : '')
        + `<button type="button" class="nb-tour-next">${i === S.length - 1 ? t('Som-hi!', 'Let\'s go!') : t('Següent', 'Next') + ' ▶'}</button></div>`;
      if (i === S.length - 1) bx.querySelector('.nb-tour-skip').remove();
      w.setAttribute('aria-label', plainOf(st.h));
      if (r) { ring.style.cssText = `left:${r.l}px;top:${r.t}px;width:${r.r - r.l}px;height:${r.b - r.t}px`; ring.classList.remove('none'); }
      else { ring.style.cssText = `left:50%;top:50%;width:0;height:0`; ring.classList.add('none'); }
      // the message beside the lit part: below it, above it, or in the middle of a big part
      const bw = Math.min(380, innerWidth - 24); bx.style.width = bw + 'px';
      const bh = bx.offsetHeight; let x, y;
      if (!r) { x = (innerWidth - bw) / 2; y = (innerHeight - bh) / 2; }
      else {
        const big = r.b - r.t > innerHeight * 0.5;
        x = Math.min(Math.max(12, (r.l + r.r) / 2 - bw / 2), innerWidth - bw - 12);
        if (big) y = (r.t + r.b) / 2 - bh / 2;
        else if (r.b + 14 + bh < innerHeight - 8) y = r.b + 14;
        else y = Math.max(8, r.t - 14 - bh);
        if (big && innerWidth > 900) x = (innerWidth - bw) / 2;
      }
      bx.style.left = Math.round(x) + 'px'; bx.style.top = Math.round(Math.max(8, Math.min(y, innerHeight - bh - 8))) + 'px';
      bx.focus({ preventScroll: true });
    };
    const done = () => { store.set(TOUR_K(), '1'); if (!O().tour) { O().tour = 1; save(); } if (pg !== pg0) { pg = pg0; show(); } endTour(); };
    w.addEventListener('click', e => {
      if (e.target.closest('.nb-tour-next')) { if (i < S.length - 1) { i++; go(); } else done(); }
      else if (e.target.closest('.nb-tour-back')) { if (i) { i--; go(); } }
      else if (e.target.closest('.nb-tour-skip')) done();
    });
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); done(); } else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (i < S.length - 1) { i++; go(); } else done(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); if (i) { i--; go(); } } };
    const rs = () => go();
    addEventListener('keydown', key, true); addEventListener('resize', rs);
    TOUR = { w, key, rs }; go();
  }
  function endTour() {
    if (!TOUR) return; removeEventListener('keydown', TOUR.key, true); removeEventListener('resize', TOUR.rs);
    TOUR.w.remove(); TOUR = null; document.documentElement.classList.remove('nb-touring');
    const c = document.querySelector('.nb .nb-help'); if (c) c.focus({ preventScroll: true });
  }
  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.nb .nb-help')) tour(); });

  // ---------- one set of listeners for every redraw ----------
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('.nb [data-nbgo],.nb-prev,.nb-next,.nb-plain,.nb-close'); if (!el || !H) return;
    if (el.dataset.nbgo != null) { e.preventDefault(); return go(+el.dataset.nbgo); }
    if (el.classList.contains('nb-close')) { if (history.length > 1 && document.referrer) history.back(); else location.hash = ''; return; }
    if (el.classList.contains('nb-plain')) {
      const on = document.documentElement.classList.toggle(PLAIN); store.set(PLAIN, on ? '1' : '0');
      el.setAttribute('aria-pressed', String(on)); el.textContent = on ? '✍ ' + t('Lletra de mà', 'Handwriting') : 'Aa ' + t('Lletra d\'impremta', 'Print letters'); relayout(); return;
    }
    turnBy(el.classList.contains('nb-prev') ? -1 : 1);
  });
  // ✍ a note after a part; ✏️ edit a note
  const secOf = id => secs.find(s => (s.ci || 0) === (H ? H.ci || 0 : 0) && (s.blocks || []).some(b => b.id === id));
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb [data-nbadd],.nb [data-nbed],.nb .nb-addnote,.nb .nb-note'); if (!b || !H || !H.own) return;
    if (b.classList.contains('nb-note') && (e.target.closest('.nb-ui') || getSelection().toString())) return;
    e.preventDefault();
    if (b.dataset.pi && (b.dataset.nbadd || b.classList.contains('nb-addnote'))) {   // 🟨 a real post-it, stuck beside this part (fpiNew)
      const pgEl = b.closest('.nb-page'), pr = pgEl.getBoundingClientRect(), br = (b.closest('.nb-blk') || b).getBoundingClientRect();
      return fpiNew(pgEl, pr.width - FPW - 26, Math.max(8, br.top - pr.top));
    }
    if (b.dataset.nbadd || b.classList.contains('nb-addnote')) {
      const after = b.dataset.nbadd, s = after ? secOf(after) : secs.find(x => x.key === b.dataset.sec && (x.ci || 0) === (H.ci || 0)); if (!s) return;
      const id = nid(), ids = s.blocks.map(x => x.id), at = after ? ids.indexOf(after) + 1 : ids.length;
      snap();
      NT()[id] = { sec: s.key, html: '', text: '', dr: [], day: today(), pi: b.dataset.pi || '' }; ids.splice(at, 0, id); O().b[s.key] = ids;
      return editor({ kind: 'note', id, sec: s, fresh: true });
    }
    const id = b.dataset.nbed || b.dataset.b; const s = secOf(id); if (!s) return; const blk = s.blocks.find(x => x.id === id);
    if (blk.note) editor({ kind: 'note', id, sec: s }); else if (blk.own) editor({ kind: 'own', id, sec: s, k: blk.own }); else if (blk.gt && gamesById[id]) editor({ kind: 'gt', id, sec: s, g: gamesById[id] });
  });
  document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('.nb .nb-selbar button'); if (b) e.preventDefault(); });
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.nb .nb-selbar [data-nbmk]'); if (b && H && H.own) markSel(b.dataset.nbmk); });
  document.addEventListener('click', e => {
    const d = e.target.closest && e.target.closest('.nb .nb-del'); if (!d || !H || !H.own) return;
    if (!d.dataset.sure) { d.dataset.sure = '1'; d.textContent = '🗑 ' + t('Segur? Toca-ho una altra vegada', 'Sure? Tap again to delete'); setTimeout(() => { if (d.isConnected) { delete d.dataset.sure; d.textContent = '🗑 ' + t('Esborra aquesta secció', 'Delete this section'); } }, 4000); return; }
    const k = d.dataset.sid; snap(); delete PT()[k]; Object.keys(NT()).forEach(n => { if (NT()[n].sec === k) delete NT()[n]; }); delete O().b[k];
    order = order.filter(x => x !== k); O().list = order.slice(); save(); redraw('s:index');
  });
  // 🖍 Highlight in the bar (Roger, 13 Nov 2026: "highlight whatever they need in different colours on activities and theory"): how to do it,
  // in a bubble under the button (the highlighters themselves come up when words are selected on any page: answers, theory, vocabulary)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb .nb-hlbar'); if (!b) return; e.preventDefault();
    document.querySelectorAll('.nb-tipb').forEach(x => x.remove());
    const tip = document.createElement('div'); tip.className = 'nb-tipb'; tip.setAttribute('role', 'status');
    tip.innerHTML = `<b>🖍 ${t('Subratlla el que vulguis', 'Highlight anything you need')}</b><br>${t('Tria unes paraules de qualsevol pàgina (teoria, vocabulari, les teves respostes) amb el dit o el ratolí. Apareixeran 5 colors, subratllar, ondulat i encerclar. 🧽 ho treu i ↶ ho desfà.', 'Select some words on any page (theory, vocabulary, your answers) with your finger or the mouse. 5 colours, underline, wavy and circle appear. 🧽 takes it off and ↶ undoes it.')}`;
    document.querySelector('.nb').append(tip); const r = b.getBoundingClientRect();
    tip.style.left = Math.max(12, Math.min(innerWidth - tip.offsetWidth - 12, r.left + r.width / 2 - tip.offsetWidth / 2)) + 'px'; tip.style.top = (r.bottom + 8) + 'px';
    const off = () => { tip.remove(); removeEventListener('pointerdown', off, true); }; setTimeout(() => addEventListener('pointerdown', off, true), 0); setTimeout(off, 9000);
  });
  // 🟨 Post-it in the bar (Roger, 13 Nov 2026: "post-its so that they can use them to take notes when they study"): one on the section of
  // the page on the screen (the right page first), at its end; on the cover, the index or a summary page, in 📍 Quick notes
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb .nb-pibar'); if (!b || !H || !H.own) return; e.preventDefault();
    const el = document.querySelector('.nb-spread .nb-page.r') || document.querySelector('.nb-spread .nb-page.l'); if (!el) return;
    const r = el.getBoundingClientRect(), n = el.querySelectorAll('.nb-fpi').length;
    fpiNew(el, Math.max(20, r.width - FPW - 40 - n * 18), 70 + n * 26);
  });
  // 🟨 Real post-its (Roger, 13 Nov 2026: "el post-it hauria de tenir forma de post-it i poder-lo moure per tota la pàgina i que estigui
  // sempre per damunt. Si en afegir informació es mouen, que apareguin a prop de la paraula que tenien més a prop"): a small square on top
  // of the page, written on straight away, dragged anywhere by its top strip. Each one is stuck to the word nearest its corner (a: {b: the
  // part, o: where the word starts in that part's text, x: its first letters}, dx/dy from that word), so when pages flow differently it
  // comes back beside the same word. Kept with the other notes in n: {sec, fl: 1, a, dx, dy, text, pi, day}.
  const FPW = 156, FPMIN = 100, FPMAX = 320, FPPAGE = 5;   // size (px; the student can make it smaller or bigger) and at most 5 per page (Roger, 13 Nov 2026)
  const fpSize = v => [Math.max(FPMIN, Math.min(FPMAX, +v.w || FPW)), Math.max(FPMIN, Math.min(FPMAX, +v.h || FPW))];
  const pageOf = i => pages[i] && pages[i].el;
  // the word nearest a point of a page (page coordinates): its part, where it starts and its box
  function nearWord(pgEl, x, y) {
    const pr = pgEl.getBoundingClientRect(); let best = null;
    pgEl.querySelectorAll('.nb-blk[data-b]').forEach(pc => {
      let acc = +pc.dataset.off || 0;
      tnodes(pc).forEach(tn => {
        const v = tn.nodeValue, re = /\S+/g; let m;
        while ((m = re.exec(v))) {
          const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length);
          const q = r.getClientRects()[0]; if (!q || !q.width) continue;
          const wx = q.left - pr.left, wy = q.top - pr.top, dx = Math.max(wx - x, 0, x - (wx + q.width)), dy = Math.max(wy - y, 0, y - (wy + q.height)), d = dx * dx + dy * dy;
          if (!best || d < best.d) best = { d, b: pc.dataset.b, o: acc + m.index, x: v.slice(m.index, m.index + 24), wx, wy };
        }
        acc += v.length;
      });
    });
    return best;
  }
  // where a post-it goes now: beside its word (found again by its letters if the text changed), else at the top of its section
  function fpiAt(v, ci) {
    const a = v.a || {};
    if (a.b) {
      const ps = blkEls(a.b, ci); if (ps.length) {
        const full = ps.map(pc => tnodes(pc).map(n => n.nodeValue).join('')).join(''); let o = +a.o || 0;
        if (a.x && full.slice(o, o + a.x.length) !== a.x) { let bestI = -1, i = full.indexOf(a.x); while (i >= 0) { if (bestI < 0 || Math.abs(i - o) < Math.abs(bestI - o)) bestI = i; i = full.indexOf(a.x, i + 1); } if (bestI >= 0) o = bestI; }
        const pc = ps.filter(x => (+x.dataset.off || 0) <= o).pop() || ps[0]; let acc = +pc.dataset.off || 0;
        for (const tn of tnodes(pc)) {
          const L = tn.nodeValue.length;
          if (o < acc + L) { const pgEl = pc.closest('.nb-page'); return { pgEl, tn, k: Math.max(0, o - acc) }; }
          acc += L;
        }
        return { pgEl: pc.closest('.nb-page'), el: pc };
      }
    }
    const si = secs.findIndex(x => x.key === v.sec && (x.ci || 0) === ci); const i = pages.findIndex(p => p.s === si);
    return i >= 0 ? { pgEl: pageOf(i) } : null;
  }
  function fpiPlace() { 
    document.querySelectorAll('.nb-spread .nb-fpi').forEach(x => { if (!x.contains(document.activeElement) && !x.classList.contains('drag')) x.remove(); });
    if (!H) return; const keep = H.ci || 0;
    CH.forEach((c, ci) => {
      use(ci); const N = NT();
      Object.entries(N).forEach(([id, v]) => {
        if (!v || !v.fl || document.querySelector(`.nb-spread .nb-fpi[data-n="${id}"][data-ci="${ci}"]`)) return;
        const at = fpiAt(v, ci); if (!at || !at.pgEl || !at.pgEl.getClientRects().length) return;
        const pr = at.pgEl.getBoundingClientRect(); let wx = 0, wy = 0;
        if (at.tn) { const r = document.createRange(); r.setStart(at.tn, at.k); r.setEnd(at.tn, Math.min(at.tn.nodeValue.length, at.k + 1)); const q = r.getClientRects()[0]; if (q) { wx = q.left - pr.left; wy = q.top - pr.top; } }
        else if (at.el) { const q = at.el.getBoundingClientRect(); wx = q.left - pr.left; wy = q.top - pr.top; }
        const [fw, fh] = fpSize(v), x = Math.max(4, Math.min(pr.width - fw - 4, wx + (+v.dx || 0))), y = Math.max(4, Math.min(pr.height - fh - 4, wy + (+v.dy || 0)));
        at.pgEl.append(fpiEl(id, v, ci, x, y));
      });
    });
    use(keep);
  }
  const PIC = ['y', 'p', 'g', 'b'];
  function fpiEl(id, v, ci, x, y) {
    const d = document.createElement('div'); d.className = `nb-fpi nb-ui pi-${PIC.includes(v.pi) ? v.pi : 'y'}`; d.dataset.n = id; d.dataset.ci = ci;
    const [fw, fh] = fpSize(v); d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.width = fw + 'px'; d.style.height = fh + 'px'; d.style.setProperty('--rot', ((parseInt(id.slice(-2), 36) || 0) % 5 - 2) * .7 + 'deg');
    d.innerHTML = H.own ? `<div class="nb-fpi-top" title="${t('Arrossega\'l on vulguis', 'Drag it anywhere')}"><span aria-hidden="true">⠿</span><button type="button" class="nb-fpi-c" title="${t('Canvia el color', 'Change the colour')}" aria-label="${t('Canvia el color', 'Change the colour')}"></button><button type="button" class="nb-fpi-x" title="${t('Treu el post-it', 'Remove the post-it')}" aria-label="${t('Treu el post-it', 'Remove the post-it')}">✕</button></div><textarea maxlength="400" spellcheck="false" autocomplete="off" aria-label="Post-it" placeholder="${t('Escriu aquí…', 'Write here…')}">${esc(v.text || '')}</textarea><span class="nb-fpi-rs" title="${t('Arrossega per fer-lo més gran o més petit', 'Drag to make it bigger or smaller')}" aria-hidden="true"></span>`
      : `<div class="nb-fpi-top"></div><div class="nb-fpi-t">${esc(v.text || '')}</div>`;
    return d;
  }
  const fpiNote = d => { use(+d.dataset.ci); return NT()[d.dataset.n]; };
  // a new post-it at x, y of a page (page coordinates), stuck to the nearest word, ready to write on
  function fpiNew(pgEl, x, y) {
    if (!pgEl || !H || !H.own) return;
    if (pgEl.querySelectorAll('.nb-fpi').length >= FPPAGE) return fpiFull(pgEl);
    use(+(pgEl.dataset.ci || 0));
    const w = nearWord(pgEl, x, y), s = secs[+pgEl.dataset.s] || {}, id = nid();
    snap();
    NT()[id] = { sec: s.key || 'qn', fl: 1, a: w ? { b: w.b, o: w.o, x: w.x } : {}, dx: Math.round(w ? x - w.wx : x), dy: Math.round(w ? y - w.wy : y), text: '', html: '', dr: [], day: today(), pi: 'y' };
    save(); fpiPlace();
    const el = document.querySelector(`.nb-spread .nb-fpi[data-n="${id}"] textarea`); if (el) el.focus();
  }
  // no more than 5 on a page: a short note says so, on that page
  function fpiFull(pgEl) {
    pgEl.querySelectorAll('.nb-fpfull').forEach(x => x.remove());
    const m = document.createElement('div'); m.className = 'nb-fpfull nb-ui'; m.setAttribute('role', 'status');
    m.textContent = t(`Com a màxim ${FPPAGE} post-its per pàgina. Treu-ne un (✕) o posa'l en una altra pàgina.`, `${FPPAGE} post-its per page at most. Remove one (✕) or use another page.`);
    pgEl.append(m); setTimeout(() => m.remove(), 4000);
  }
  document.addEventListener('focusin', e => { const ta = e.target.closest && e.target.closest('.nb .nb-fpi textarea'); if (ta && !ta.dataset.snap) { ta.dataset.snap = '1'; snap(); } });
  document.addEventListener('input', e => {
    const ta = e.target.closest && e.target.closest('.nb .nb-fpi textarea'); if (!ta || !H || !H.own) return;
    const v = fpiNote(ta.closest('.nb-fpi')); if (v) { v.text = ta.value.slice(0, 400); save(); }
  });
  document.addEventListener('focusout', e => {
    const ta = e.target.closest && e.target.closest('.nb .nb-fpi textarea'); if (!ta) return; delete ta.dataset.snap;
    const d = ta.closest('.nb-fpi'), v = fpiNote(d);   // an empty post-it left behind goes away
    if (v && !String(v.text || '').trim() && !d.classList.contains('drag')) setTimeout(() => { if (d.contains(document.activeElement)) return; delete NT()[d.dataset.n]; save(); d.remove(); }, 150);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb .nb-fpi button'); if (!b || !H || !H.own) return; e.preventDefault();
    const d = b.closest('.nb-fpi'), v = fpiNote(d); if (!v) return; snap();
    if (b.classList.contains('nb-fpi-x')) { delete NT()[d.dataset.n]; d.remove(); }
    else { v.pi = PIC[(PIC.indexOf(v.pi) + 1) % PIC.length]; PIC.forEach(k => d.classList.toggle('pi-' + k, k === v.pi)); }
    save();
  });
  // ⠿ dragging by the top strip, anywhere on the page; on the drop it sticks to the word nearest its corner
  let FD = null;
  document.addEventListener('pointerdown', e => {
    const top = e.target.closest && e.target.closest('.nb .nb-fpi-top,.nb .nb-fpi-rs'); if (!top || e.target.closest('button') || !H || !H.own) return;
    const d = top.closest('.nb-fpi'); e.preventDefault(); e.stopPropagation();
    FD = { d, id: e.pointerId, x: e.clientX, y: e.clientY, l: parseFloat(d.style.left), t: parseFloat(d.style.top), w: d.offsetWidth, h: d.offsetHeight, rs: top.classList.contains('nb-fpi-rs'), moved: false };
    d.classList.add('drag'); try { top.setPointerCapture(e.pointerId); } catch (x) {}
  }, true);
  document.addEventListener('pointermove', e => {
    if (!FD || e.pointerId !== FD.id) return; const pgEl = FD.d.closest('.nb-page'), pr = pgEl.getBoundingClientRect();
    const dx = e.clientX - FD.x, dy = e.clientY - FD.y; if (!FD.moved && Math.hypot(dx, dy) < 4) return; FD.moved = true;
    if (FD.rs) {   // ◢ the corner: bigger or smaller, inside the page
      FD.d.style.width = Math.max(FPMIN, Math.min(FPMAX, pr.width - FD.l - 4, FD.w + dx)) + 'px'; FD.d.style.height = Math.max(FPMIN, Math.min(FPMAX, pr.height - FD.t - 4, FD.h + dy)) + 'px'; return;
    }
    FD.d.style.left = Math.max(4, Math.min(pr.width - FD.w - 4, FD.l + dx)) + 'px'; FD.d.style.top = Math.max(4, Math.min(pr.height - FD.h - 4, FD.t + dy)) + 'px';
  }, true);
  const fdEnd = e => {
    if (!FD || (e.pointerId != null && e.pointerId !== FD.id)) return; const { d, moved, rs } = FD; FD = null; d.classList.remove('drag');
    if (!moved) { const ta = d.querySelector('textarea'); if (ta) ta.focus(); return; }
    if (rs) { const v = fpiNote(d); if (!v) return; snap(); v.w = Math.round(d.offsetWidth); v.h = Math.round(d.offsetHeight); save(); return; }
    const v = fpiNote(d); if (!v) return; const x = parseFloat(d.style.left), y = parseFloat(d.style.top), w = nearWord(d.closest('.nb-page'), x, y);
    snap(); v.a = w ? { b: w.b, o: w.o, x: w.x } : {}; v.dx = Math.round(w ? x - w.wx : x); v.dy = Math.round(w ? y - w.wy : y);
    const s = secs[+d.closest('.nb-page').dataset.s]; if (s && s.key) v.sec = s.key; save();
  };
  document.addEventListener('pointerup', fdEnd, true); document.addEventListener('pointercancel', fdEnd, true);
  // ➕ a section of their own, after the web section they chose (in the index: ➕ beside a section picks it in the form)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb [data-nbins]'); if (!b || !H || !H.own) return; e.preventDefault();
    const ci = (b.closest('.nb-page') || {}).dataset ? b.closest('.nb-page').dataset.ci : null;
    const f = [...document.querySelectorAll('.nb .nb-spread .nb-add')].find(x => { const p = x.closest('.nb-page'); return p && p.dataset.ci === ci; }); if (!f) return; const sl = f.querySelector('select'); if (sl) sl.value = b.dataset.nbins;
    const pgEl = f.closest('.nb-page'); if (pgEl && !pgEl.classList.contains('l') && !pgEl.classList.contains('r')) go(+pgEl.dataset.i);
    f.classList.remove('nb-shake'); void f.offsetWidth; f.classList.add('nb-shake'); f.querySelector('input').focus();
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest && e.target.closest('.nb .nb-add'); if (!f || !H || !H.own) return; e.preventDefault();
    const name = f.querySelector('input').value.trim().slice(0, 60); if (!name) { f.querySelector('input').focus(); return; }
    const sl = f.querySelector('select'), k = 's' + Date.now().toString(36);
    snap(); PT()[k] = { topic: name, html: '', text: '', dr: [], day: today(), after: sl ? sl.value : null }; save(); redraw('s:' + k);
    const s = secs.find(x => x.key === k && (x.ci || 0) === (H.ci || 0)); const id = nid();
    if (s) { NT()[id] = { sec: k, html: '', text: '', dr: [], day: today() }; O().b[k] = [id]; editor({ kind: 'note', id, sec: s, fresh: true }); }
  });
  document.addEventListener('change', e => {
    const x = e.target.closest && e.target.closest('.nb .nb-stitle'); if (!x || !H || !H.own) return;
    const sx = PT()[x.dataset.sid]; if (!sx) return; snap(); sx.topic = x.value.trim().slice(0, 60) || sx.topic; save(); redraw('s:' + x.dataset.sid);
  });

  // ✍ the handwriting page for a note: big, on top of the book, the same pens and marks as the whiteboard (el-pad.js)
  let ED = null;
  function editor(o) {
    const root = document.querySelector('.nb'); if (!root || !me) return; closeEditor(true);
    let v, title, del = true;
    if (o.kind === 'note') { v = NT()[o.id]; title = '✍ ' + t('La meva nota', 'My note'); }
    else if (o.kind === 'own') { v = PT()[o.k]; title = '✍ ' + esc(v && v.topic || ''); del = false; }
    else if (o.kind === 'gn') { const N = o.g.notes || (o.g.notes = {}); v = N[o.k] || (N[o.k] = { text: '' }); title = '✍ ' + t('Els meus apunts', 'My notes') + ' · ' + esc(gname(o.g)); del = false; }
    else { v = o.g.gt; title = '✍ ' + t('Els meus apunts de classe', 'My notes from class') + ' · ' + esc(gname(o.g)); del = false; }
    if (!v) return;
    if (o.kind === 'gn' || o.kind === 'gt') snap({ g: o.g, k: o.kind === 'gn' ? o.k : '', v: JSON.stringify(v) });
    else if (!o.fresh) snap();
    const w = document.createElement('div'); w.className = 'nb-ed'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', plainOf(title));
    const PI = [['', t('Al full', 'On the page')], ['y', t('Post-it groc', 'Yellow post-it')], ['p', t('Post-it rosa', 'Pink post-it')], ['g', t('Post-it verd', 'Green post-it')], ['b', t('Post-it blau', 'Blue post-it')]];
    const pis = o.kind === 'note' ? `<span class="nb-pis" role="group" aria-label="${t('Com és la nota', 'What the note looks like')}">${PI.map(([k, l]) => `<button type="button" class="nb-pib pi-${k || 'n'}" data-pi="${k}" title="${l}" aria-label="${l}" aria-pressed="${(v.pi || '') === k}"></button>`).join('')}</span>` : '';
    w.innerHTML = `<div class="nb-ed-in"><div class="nb-ed-top"><b>${title}</b><span class="nb-ed-where">${esc(plainOf(o.sec.l))}</span>${pis}<span class="nb-sp"></span>${del ? `<button type="button" class="nb-tool nb-ed-del">🗑 ${t('Esborra la nota', 'Delete the note')}</button>` : ''}<button type="button" class="nb-tool nb-ed-ok">✓ ${t('Fet', 'Done')}</button></div><div class="nb-ed-sheet"><div class="nb-paper"><div class="nb-ed-host"></div></div></div></div>`;
    root.append(w); ED = { o, w, v, gtT: 0 };
    import(new URL('./el-pad.js', me).href).then(P => {
      if (ED == null || ED.w !== w) return;
      ED.p = P.pad(w.querySelector('.nb-ed-host'), { html: v.html, text: v.text, dr: v.dr, ca: H.ca, ph: t('Escriu aquí. Pots canviar de boli, subratllar i marcar.', 'Write here. You can change pens, highlight and underline.'), onChange: x => {
        Object.assign(v, x);
        if (o.kind === 'gt' || o.kind === 'gn') { status(t('Desant…', 'Saving…')); clearTimeout(ED.gtT); ED.gtT = setTimeout(() => o.kind === 'gn' ? gnSave(o.g, o.k) : gtSave(o.g), 1500); } else save();
      } });
      setTimeout(() => { if (ED && ED.p) ED.p.ed.focus(); }, 30);
    }).catch(e => console.warn('notebook pad', e));
    w.querySelector('.nb-ed-ok').addEventListener('click', () => closeEditor());
    w.querySelectorAll('.nb-pib').forEach(b => b.addEventListener('click', () => { v.pi = b.dataset.pi; w.querySelectorAll('.nb-pib').forEach(x => x.setAttribute('aria-pressed', String(x === b))); w.querySelector('.nb-ed-sheet').dataset.pi = v.pi; save(); }));
    w.querySelector('.nb-ed-sheet').dataset.pi = v.pi || '';
    const db = w.querySelector('.nb-ed-del'); if (db) db.addEventListener('click', () => {
      if (!db.dataset.sure) { db.dataset.sure = '1'; db.textContent = '🗑 ' + t('Segur? Toca-ho una altra vegada', 'Sure? Tap again to delete'); return; }
      delete NT()[o.id]; const L = O().b[o.sec.key]; if (L) O().b[o.sec.key] = L.filter(x => x !== o.id); save(); ED = null; w.remove(); redraw('s:' + o.sec.key);
    });
  }
  // ✏️ the notes taken in a class game, edited in the notebook (Roger, 13 Nov 2026: "notes taken during the activities must be editable"):
  // back into that game's own notes doc (students/{uid}/notes/<deck>, parts.<k>: text + the page with its marks)
  function gnSave(g, k) { const v = (g.notes || {})[k]; if (!H.saveGn || !v) return; Promise.resolve(H.saveGn(g.id, k, { text: String(v.text || '').slice(0, 3000), html: v.html || '', dr: v.dr || [] })).then(() => status('✓ ' + t('Desat', 'Saved'))).catch(() => status('⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again'))); }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb .nb-gned'); if (!b || !H || !H.own) return; e.preventDefault();
    const g = Object.values(gamesById).find(x => x.id === b.dataset.g), blk = b.closest('.nb-blk'), s = blk && secOf(blk.dataset.b); if (!g || !s) return;
    editor({ kind: 'gn', g, k: b.dataset.k, sec: s, blk: blk.dataset.b });
  });
  function gtSave(g) { if (!H.saveGt) return; Promise.resolve(H.saveGt(g.id, g.gt)).then(() => status('✓ ' + t('Desat', 'Saved'))).catch(() => status('⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again'))); }
  function closeEditor(quiet) {
    const E = ED; if (!E) return; ED = null;
    if (E.p) Object.assign(E.v, E.p.get());
    const o = E.o;
    if (o.kind === 'note' && !hasInk(E.v)) { delete NT()[o.id]; const L = O().b[o.sec.key]; if (L) O().b[o.sec.key] = L.filter(x => x !== o.id); save(); }
    else if (o.kind === 'gt') { clearTimeout(E.gtT); gtSave(o.g); }
    else if (o.kind === 'gn') { clearTimeout(E.gtT); gnSave(o.g, o.k); }
    else save();
    E.w.remove(); if (!quiet) redraw(o.kind === 'note' && NT()[o.id] ? 'b:' + o.id : o.kind === 'gn' && o.blk ? 'b:' + o.blk : 's:' + o.sec.key);
  }

  // 📖 Turning the pages (Roger, 13 Nov 2026: "I want them to be able to drag the pages to turn them"): ◀ ▶, the arrow keys and dragging a
  // page with a finger (or with the mouse from a margin or the folded corner, so words can still be selected) turn a paper leaf, the same
  // feel as the 📖 Book (el-book.js): the leaf follows the hand; let go past a quarter of the way (or with a quick flick) and it turns,
  // before that it falls back; letting go anywhere ends the drag. Tabs and the index jump straight to their page.
  const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let T0 = null, drag = null, noClick = 0;
  function setup(dir) {
    const root = document.querySelector('.nb'); if (!root || T0) return null;
    const wd = wide(), a = wd ? pg - pg % 2 : pg, to = a + dir * (wd ? 2 : 1);
    if (to < 0 || to >= pages.length) return null;
    const P = i => pages[i] && pages[i].el, sp = root.querySelector('.nb-spread');
    const face = (i, cls) => { const f = document.createElement('div'); f.className = 'nb-face ' + cls; const p = P(i); if (p) { f.innerHTML = p.innerHTML; ['nb-cvp', 'nb-cv1'].forEach(c => { if (p.classList.contains(c)) f.classList.add(c); }); } else f.classList.add('blank'); return f; };
    const leaf = document.createElement('div'); leaf.setAttribute('aria-hidden', 'true'); let ang;
    const cls = (i, c, on) => { const p = P(i); if (p) p.classList.toggle(c, on); };
    if (wd && dir > 0) { leaf.className = 'nb-leaf r'; leaf.append(face(a + 1, 'front'), face(to, 'back')); ang = p => -180 * p; cls(a + 1, 'r', false); cls(to + 1, 'r', true); }
    else if (wd) { leaf.className = 'nb-leaf l'; leaf.append(face(a, 'front'), face(to + 1, 'back')); ang = p => 180 * p; cls(a, 'l', false); cls(to, 'l', true); }
    else if (dir > 0) { leaf.className = 'nb-leaf one'; leaf.append(face(a, 'front')); ang = p => -180 * p; cls(a, 'l', false); cls(to, 'l', true); }
    else { leaf.className = 'nb-leaf one'; leaf.append(face(to, 'front')); ang = p => -180 * (1 - p); }
    sp.append(leaf); hideSel();
    const tt = { leaf, to, set(p) { leaf.style.transform = `perspective(2400px) rotateY(${ang(p)}deg)`; leaf.style.setProperty('--nb-sh', String(Math.sin(Math.PI * p) * .35)); } };
    tt.set(0); T0 = tt; return tt;
  }
  function finish(tt, all, dur) {
    const L = tt.leaf; let ok = false;
    const done = () => { if (ok) return; ok = true; if (T0 === tt) T0 = null; L.remove(); if (all) pg = tt.to; show(); };
    if (!motion()) return done();
    L.style.transition = `transform ${dur}s cubic-bezier(.3,.7,.4,1)`; requestAnimationFrame(() => requestAnimationFrame(() => tt.set(all ? 1 : 0)));
    L.addEventListener('transitionend', done, { once: true }); setTimeout(done, dur * 1000 + 150);
  }
  function turnBy(dir) { if (drag) return; const tt = setup(dir); if (tt) finish(tt, true, .6); }
  document.addEventListener('pointerdown', e => {
    const sp = e.target.closest && e.target.closest('.nb-spread'); if (!sp || T0 || drag || ED || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest((e.pointerType === 'mouse' ? 'a,' : '') + 'button,input,textarea,select,label,summary,[contenteditable],.nb-ui')) return;   // a finger can swipe over a link
    // with a mouse, words can be selected: the page is dragged from its margins, its folded corner or the rings
    if (e.pointerType === 'mouse' && H && H.own && !e.target.matches('.nb-paper,.nb-page,.nb-corner,.nb-spine,.nb-ring,.nb-spread,.nb-pno')) return;
    const r = sp.getBoundingClientRect();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, rx: e.clientX - r.left, w: r.width, t: null, p: 0, hist: [[e.timeStamp, e.clientX]], sp };
  });
  const drop = e => {
    const d = drag; if (!d || (e.pointerId != null && e.pointerId !== d.id)) return;
    drag = null; if (!d.t) return;
    noClick = Date.now() + 400;   // the tap that ends a drag is not a tap on the page
    const h = d.hist, a = h[0], b = h[h.length - 1], v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;   // px per ms, + to the right
    const flick = (d.dir > 0 ? -v : v) > .45 && d.p > .04, back = (d.dir > 0 ? v : -v) > .45;
    const all = e.type !== 'pointercancel' && !back && (d.p > .25 || flick);
    finish(d.t, all, all ? .22 + .45 * (1 - d.p) : .18 + .35 * d.p);
  };
  document.addEventListener('pointermove', e => {
    const d = drag; if (!d || e.pointerId !== d.id) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) return drop(e);   // the button is up but its pointerup never came
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.t) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.2) { drag = null; return; }
      d.dir = dx < 0 ? 1 : -1; d.t = setup(d.dir);
      if (!d.t) { drag = null; return; }   // nothing to turn that way
      try { d.sp.setPointerCapture(e.pointerId); } catch (x) { }
      const s = getSelection(); if (s && !s.isCollapsed) s.removeAllRanges();
    }
    e.preventDefault();
    const room = d.dir > 0 ? d.rx : d.w - d.rx, pw = d.w / (wide() ? 2 : 1);
    d.p = Math.max(0, Math.min(1, (d.dir > 0 ? -dx : dx) / Math.max(room, pw * .5)));
    d.t.set(d.p); d.hist.push([e.timeStamp, e.clientX]); if (d.hist.length > 6) d.hist.shift();
  }, { passive: false });
  document.addEventListener('pointerup', drop, true); document.addEventListener('pointercancel', drop, true);
  addEventListener('mouseup', e => { if (drag) drop({ type: 'pointerup', timeStamp: e.timeStamp }); }, true);
  addEventListener('blur', () => { if (drag) drop({ type: 'pointerup' }); });
  document.addEventListener('click', e => { if (Date.now() < noClick && e.target.closest && e.target.closest('.nb-spread')) { e.preventDefault(); e.stopPropagation(); } }, true);

  // 🖨 Print (Roger, 13 Nov 2026: "print current, selected or all the pages"): the pages on the screen now, the pages ticked in the list,
  // or the whole notebook. One page per sheet; el-copyright.js adds the copyright line and the page numbers to every printed sheet.
  // 🎨 the cover's colour and design (Roger, 13 Nov 2026: "Make it possible to change the design and colors of the cover"): saved in the
  // notebook (parts.cv = {c, d}) and on this device for the other chapters; only colours change, so nothing is laid out again
  // green with stars by default (Roger: "Set green as a default", "I mean green with stars")
  const CVC = { green: ['#1f5c3f', 'Verd', 'Green'], blue: ['#1f3c73', 'Blau', 'Blue'], red: ['#8e2430', 'Vermell', 'Red'], purple: ['#4a2c6e', 'Lila', 'Purple'],
    black: ['#2a2d33', 'Negre', 'Black'], pink: ['#a3365f', 'Rosa', 'Pink'], orange: ['#a8501c', 'Taronja', 'Orange'], teal: ['#1d5e66', 'Turquesa', 'Teal'] };
  const CVD = { stars: ['Estrelles', 'Stars'], cloth: ['Tela', 'Cloth'], dots: ['Punts', 'Dots'], stripes: ['Ratlles', 'Stripes'], checks: ['Quadres', 'Checks'], plain: ['Llisa', 'Plain'] };
  const cvGet = () => { const R = ROOT || H; let c = R && R.nb && R.nb.parts && R.nb.parts.cv; if (!c || !c.c) try { c = JSON.parse(localStorage.getItem('el_nb_cv') || 'null'); } catch (e) {} return c && CVC[c.c] ? { c: c.c, d: CVD[c.d] ? c.d : 'stars' } : { c: 'green', d: 'stars' }; };
  const cvSet = root => { const c = cvGet(); if (root) { root.dataset.cv = c.c; root.dataset.cvd = c.d; } };
  function cvPick(btn) {
    document.querySelectorAll('.nb-cvpick').forEach(x => x.remove());
    const root = document.querySelector('.nb'); if (!root || !H || !H.own) return;
    const box = document.createElement('div'); box.className = 'nb-cvpick nb-ui'; box.setAttribute('role', 'dialog');
    const paint = () => { const c = cvGet();
      box.innerHTML = `<b>🎨 ${t('Color', 'Colour')}</b><div class="row">${Object.entries(CVC).map(([k, v]) => `<button type="button" class="sw${c.c === k ? ' on' : ''}" data-cvc="${k}" style="background:${v[0]}" title="${t(v[1], v[2])}" aria-label="${t(v[1], v[2])}"></button>`).join('')}</div>`
        + `<b>✨ ${t('Disseny', 'Design')}</b><div class="row">${Object.entries(CVD).map(([k, v]) => `<button type="button" class="pt${c.d === k ? ' on' : ''}" data-cvd="${k}"><i class="nb-cvsw" data-k="${k}"></i>${t(v[0], v[1])}</button>`).join('')}</div>`
        + `<button type="button" class="ok">✓ ${t('Fet', 'Done')}</button>`;
      box.querySelectorAll('.nb-cvsw').forEach(i => { const r = document.createElement('div'); r.className = 'nb'; r.dataset.cv = c.c; r.dataset.cvd = i.dataset.k; r.style.cssText = 'display:none'; document.body.append(r); const cs = getComputedStyle(r); i.style.background = cs.getPropertyValue('--cv-pat') + ',' + cs.getPropertyValue('--cv'); r.remove(); }); };
    paint(); root.append(box);
    const rc = btn.getBoundingClientRect(), h = box.offsetHeight, w = box.offsetWidth;
    box.style.left = Math.max(12, Math.min(innerWidth - w - 12, rc.left)) + 'px'; box.style.top = Math.max(12, rc.top - h - 8 > 12 ? rc.top - h - 8 : Math.min(innerHeight - h - 12, rc.bottom + 8)) + 'px';
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('ok')) { box.remove(); return; }
      const c = cvGet(); if (b.dataset.cvc) c.c = b.dataset.cvc; if (b.dataset.cvd) c.d = b.dataset.cvd;
      const was = H.ci || 0; if (ROOT && CH.length > 1) use(ROOT.ci || 0);   // the cover's colours are kept in this page's LS
      snap(); PT().cv = c; try { localStorage.setItem('el_nb_cv', JSON.stringify(c)); } catch (x) {} cvSet(root); paint(); save(); use(was);
    });
  }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.nb .nb-cvbtn'); if (b) { e.preventDefault(); e.stopPropagation(); cvPick(b); return; }
    const p = document.querySelector('.nb-cvpick'); if (p && !(e.target.closest && e.target.closest('.nb-cvpick'))) p.remove(); }, true);
  function printPages(set) {
    const h = document.documentElement, root = document.querySelector('.nb'); if (!root) return;
    // the cover always goes first unless the student unticks it (Roger: "Per defecte la portada surt sempre")
    const cov = root.querySelector('.nb-pcov input');
    if (set && (!cov || cov.checked)) set = [...new Set(pages.map((p, i) => p.el.querySelector('.nb-front') ? i : -1).filter(i => i >= 0).concat(set))].sort((a, b) => a - b);
    // the pages picked, by what is on them: the sheets' pages are not the screen's (laid out again for paper when printing)
    PSEL = set ? { b: new Set(set.flatMap(i => pages[i] ? [...pages[i].el.querySelectorAll('.nb-blk[data-b]')].map(b => (pages[i].el.dataset.ci || 0) + ':' + b.dataset.b) : [])), s: new Set(set.map(i => pages[i] && pages[i].s)) } : null;
    const menu = root.querySelector('.nb-pmenu'); if (menu) menu.hidden = true;
    setTimeout(() => window.print(), 50);
  }
  const menuOff = () => { const m = document.querySelector('.nb .nb-pmenu'); if (m) m.hidden = true; const pb = document.querySelector('.nb-bar .nb-printbtn'); if (pb) pb.setAttribute('aria-expanded', 'false'); };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb .nb-printbtn,.nb [data-nbpr]'), menu = document.querySelector('.nb .nb-pmenu');
    if (!b) { if (menu && !menu.hidden && !(e.target.closest && e.target.closest('.nb-pmenu'))) menuOff(); return; }
    if (b.classList.contains('nb-printbtn')) { if (!menu) return; const open = menu.hidden; menuOff(); menu.hidden = !open; const pb = document.querySelector('.nb-bar .nb-printbtn'); if (pb) pb.setAttribute('aria-expanded', String(open)); if (open) { const f = menu.querySelector('button'); if (f) f.focus(); } return; }
    const k = b.dataset.nbpr, wd = wide(), a = wd ? pg - pg % 2 : pg;
    if (k === 'all') return printPages(null);
    if (k === 'cur') return printPages(wd && a + 1 < pages.length ? [a, a + 1] : [a]);
    const sel = [...menu.querySelectorAll('.nb-plist input:checked')].map(x => +x.value);
    if (!sel.length) { const l = menu.querySelector('.nb-plist'); if (l) { l.classList.remove('nb-shake'); void l.offsetWidth; l.classList.add('nb-shake'); } return; }
    printPages(sel);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !document.querySelector('.nb')) return;
    if (ED) { e.preventDefault(); return closeEditor(); }
    const m = document.querySelector('.nb .nb-pmenu'); if (m && !m.hidden) { menuOff(); const pb = document.querySelector('.nb-bar .nb-printbtn'); if (pb) pb.focus(); return; }
    const s = selBar(); if (s && !s.hidden) { hideSel(); getSelection().removeAllRanges(); }
  });
  document.addEventListener('keydown', e => {
    if (!document.querySelector('.nb') || ED || location.hash !== '#notes' || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    const b = document.querySelector(e.key === 'ArrowRight' || e.key === 'PageDown' ? '.nb-next' : e.key === 'ArrowLeft' || e.key === 'PageUp' ? '.nb-prev' : null);
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  addEventListener('resize', () => { if (document.querySelector('.nb') && pages.length) show(); });
  return { draw, clean, svg };
})();
