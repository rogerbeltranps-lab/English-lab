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
// circle them; ✍ add a note after any part; ▲ ▼ move the parts of a page and, in the index, whole sections; add sections of their own; edit
// what they wrote on the whiteboard. Everything is saved in notes/nb-<LS> (el-notes.js), the whiteboard notes in their own doc.
// "Aa Print letters" switches the handwriting to plain letters for students who read print better (remembered on the device).
// No Firestore reads of its own: el-notes.js passes what it already read. Only LS2+ home pages load it (LS1 has no #notes).
window.ELNotebook = (function () {
  const me = document.currentScript && document.currentScript.src;
  function css() {
    if (document.getElementById('el-nb-css') || !me) return;
    const l = document.createElement('link'); l.id = 'el-nb-css'; l.rel = 'stylesheet'; l.href = new URL('../css/el-notebook.css', me).href; document.head.append(l);
  }
  const PLAIN = 'el-nb-plain';
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  if (store.get(PLAIN) === '1') document.documentElement.classList.add(PLAIN);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // what the student wrote on a handwriting page: only the notebook's own marks are kept (a doc is the student's own, so it is cleaned
  // again here before the teacher's 👁 Student view shows it)
  const KEEP = new Set(['nb-pen-b', 'nb-pen-k', 'nb-pen-r', 'nb-pen-g', 'nb-hl-y', 'nb-hl-g', 'nb-hl-p', 'nb-ul', 'nb-ulw', 'nb-circ', 'nb-boxd', 'nb-cp']);
  function clean(h) {
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
  const t = (c, e) => H.t(c, e);
  const mday = d => { if (!d || d === true) return ''; const s = String(H.exDay(d)).replace(/\.$/, '').replace(/,/g, ''); const i = s.indexOf(' '); return i > 0 ? esc(s.slice(0, i)) + '<br>' + esc(s.slice(i + 1)) : esc(s); };
  const lines = s => esc(String(s || '').trim()).replace(/\n/g, '<br>');
  const kindIcon = k => k === 'grammar' ? '🧩' : k === 'vocab' ? '📚' : '🎮';
  const gname = g => String(g.title || '').replace(/^(Grammar|Vocabulary) · /, '').replace(/^📘\s*/, '');
  const fk = s => String(s).replace(/[^A-Za-z0-9_~-]/g, '_').slice(0, 80);   // a safe key for Firestore maps and data-b
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
    const parts = (g.parts || []).map(p => {
      const n = (g.notes || {})[p.k], txt = n && String(n.text || '').trim();
      return `<div class="nb-slip">${p.slides && p.slides.length ? p.slides.map(H.slide).join('') : `<h4>${H.md(p.topic)}</h4>`}</div>`
        + (txt ? `<div class="nb-mine"><span class="nb-lab">✍ ${t('Els meus apunts', 'My notes')}</span>${lines(txt)}</div>` : '');
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
    const mine = p.html || (p.dr && p.dr.length) ? `<div class="nb-notes">${clean(p.html)}${svg(p.dr)}</div>` : txt ? `<div class="nb-mine">${lines(txt)}</div>` : `<p class="nb-pencil">${t('No vas prendre apunts aquí.', 'You didn\'t take notes here.')}</p>`;
    return `<div class="nb-game"><div class="nb-h3" style="color:var(--nb-black)">${rd ? '📖' : '📘'} ${esc(gname(g))}</div><span class="nb-when">${rd ? t('Lectura junts', 'Reading together') : t('Gramàtica junts', 'Grammar together')}${p.day ? ' · ' + esc(H.gtDay(p.day)) : ''}</span>${sum}<div class="nb-mine"><span class="nb-lab">✍ ${t('Els meus apunts de classe', 'My notes from class')}</span></div>${mine}</div>`;
  }
  const plainOf = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent; };
  const noteHtml = v => `<div class="nb-notes">${v.html ? clean(v.html) : lines(v.text)}${svg(v.dr)}</div>`;

  // the parts of a section in the student's order (new parts go after the one they follow by default)
  function ordered(key, blocks) {
    const saved = (O().b[key] || []).filter(id => blocks.some(b => b.id === id)), list = saved.slice();
    blocks.forEach((b, i) => { if (list.includes(b.id)) return; let j = -1; for (let q = i - 1; q >= 0 && j < 0; q--) j = list.indexOf(blocks[q].id); list.splice(j + 1, 0, b.id); });
    return list.map(id => blocks.find(b => b.id === id));
  }

  function build(ex, games) {
    const out = [], LS = H.LS, ls = (window.EL_LS || []).find(l => l.id === LS) || {};
    const course = String(ls.course || '').replace(/^(\d)eso$/, '$1 ESO'), name = String(ls.title || '').replace(/^[^·]*·\s*/, '');
    gamesById = {}; games.forEach(g => { gamesById[fk('g-' + g.id)] = g; });
    const notesOf = key => Object.entries(NT()).filter(([, v]) => v && v.sec === key).sort((a, b) => a[0].localeCompare(b[0])).map(([id, v]) => ({ id, note: true, html: noteHtml(v) }));
    const addBtn = key => H.own ? `<div class="nb-links nb-ui"><button type="button" class="nb-addnote" data-sec="${key}">✍ ${t('Afegeix una nota', 'Add a note')}</button></div>` : '';
    // the cover
    const n = ex.exam && window.ELWeek ? ELWeek.days(ELWeek.today(), ex.exam) : null;
    const when = n == null || n < 0 ? '' : n === 0 ? t('avui!', 'today!') : n === 1 ? t('demà!', 'tomorrow!') : t(`d'aquí a ${n} dies`, `in ${n} days`);
    out.push({ key: 'cover', fixed: true, blocks: [], head: `<p class="nb-h1"><u>${t('Anglès', 'English')}</u></p><div class="nb-h2">${esc(name)}</div><div class="nb-mine">${esc(course)}</div>
      <div class="nb-links">${ex.sample ? `<a href="${esc(ex.sample)}">📝 ${t('Examen de mostra', 'Sample exam')}</a>` : ''}<button type="button" class="nb-printbtn">🖨 ${t('Imprimeix la llibreta', 'Print my notebook')}</button></div>
      <div class="nb-sticky">${ex.exam ? `🎯 ${t('EXAMEN', 'EXAM')}: ${esc(H.exDay(ex.exam))}${when ? ' · ' + when : ''}` : '🎯 ' + t('Què entra a l\'examen', 'What\'s in the exam')}<small>${t('Tot el que hi ha en aquesta llibreta és el que hem fet a classe: és el que entra a l\'examen. Cada vegada que fem alguna cosa nova, apareix aquí.', 'Everything in this notebook is what we did in class: it\'s what goes in the exam. Each time we do something new, it appears here.')}</small></div>
      ${ex.dropped.length ? `<p class="nb-pencil">✂️ ${t('No entra a l\'examen', 'Not in your exam')}: ${ex.dropped.map(a => `LP${esc(a.n)} ${esc(a.title)}`).join(' · ')}</p>` : ''}
      <div class="nb-legend"><b>${t('Com es llegeix', 'How to read it')}</b><br>📎 ${t('paper enganxat = del professor', 'glued slip = from your teacher')} · 🩷 ${t('nota rosa = estudia-ho', 'pink note = study it again')}<br><span style="color:var(--nb-ink)">${t('boli blau', 'blue pen')}</span> = ${t('els teus apunts', 'your own notes')} · <span style="color:var(--nb-red)">${t('cercle', 'circle')}</span> = ${t('el teu resultat al joc', 'your game result')}</div>
      ${H.own ? `<div class="nb-legend"><b>${t('És la teva llibreta', 'It\'s your notebook')}</b><br>🖍 ${t('Tria unes paraules per subratllar-les o encerclar-les.', 'Select some words to highlight, underline or circle them.')}<br>✍ ${t('Afegeix notes on vulguis i mou les parts amb ▲ ▼.', 'Add notes anywhere and move the parts with ▲ ▼.')}<br>👉 ${t('Arrossega la pàgina per passar-la.', 'Drag a page to turn it.')}</div>` : ''}
` });
    out.push({ key: 'index', fixed: true, blocks: [], head: '' });
    const used = new Set();
    ex.lps.forEach(lp => {
      const gs = games.filter(g => H.lpOf(g) === String(lp.n)); gs.forEach(g => used.add(g.id));
      const rd = gs.filter(g => g.gt && /-rd$/.test(g.id)), gt = gs.filter(g => g.gt && !/-rd$/.test(g.id));
      const voc = gs.filter(g => !g.gt && g.kind === 'vocab'), gram = gs.filter(g => !g.gt && g.kind !== 'vocab');
      const d0 = (lp.tabs.find(x => x.day && x.day !== true) || {}).day, key = 'lp' + lp.n, blocks = [];
      const head = `${d0 ? `<div class="nb-mdate" style="top:34px">${mday(d0)}</div>` : ''}<p class="nb-h1"><u>LP${esc(lp.n)}</u> ${esc(lp.title)}</p>`
        + (lp.tabs.length ? `<div class="nb-pencil nb-done">${t('Fet a classe', 'Done in class')}: ${lp.tabs.map(x => `<i>✓</i> ${esc(x.name)}`).join(' ')}</div>` : '');
      if (lp.terms.length) blocks.push({ id: key + '-terms', l: '📚 ' + t('Paraules clau', 'Key terms'), html: `<div class="nb-h2" style="margin-top:24px">📚 <span class="u">${t('Paraules clau', 'Key terms')}</span></div>` + lp.terms.map(g => `${lp.terms.length > 1 ? `<div class="nb-h3">${g.g}</div>` : ''}<ul class="nb-voc">${g.items.map(x => `<li><b>${x.en}</b>${x.ca ? ` <span>– ${x.ca}</span>` : ''}</li>`).join('')}</ul>`).join('') });
      voc.forEach(g => blocks.push({ id: fk('g-' + g.id), l: '🎮 ' + esc(gname(g)), html: game(g) }));
      rd.forEach(g => blocks.push({ id: fk('g-' + g.id), l: '📖 ' + t('Apunts de la lectura', 'Reading notes'), html: together(g), gt: true }));
      const empty = !lp.terms.length && !lp.grammar.length && !gs.length ? `<p class="nb-pencil">${t('En aquest learning path heu fet pràctica de comprensió i expressió: obre\'l per repassar-lo.', 'In this learning path you practised the skills: open it to look at it again.')}</p>` : '';
      out.push({ key, tab: 'LP' + lp.n, l: `LP${esc(lp.n)} ${esc(lp.title)}`, head: head + empty, blocks: ordered(key, blocks.concat(notesOf(key))), foot: addBtn(key) + `<div class="nb-links"><a href="${esc(lp.href)}">${t('Obre el learning path', 'Open the learning path')} →</a></div>` });
      if (lp.grammar.length || gt.length || gram.length) {
        const kg = key + 'g', bg = [];
        lp.grammar.forEach((g, i) => bg.push({ id: kg + '-' + i, l: i ? '' : '🧩 ' + t('Com funciona', 'How it works'), html: `<div class="nb-slip"><h4>${g.title}</h4>${g.boxes.map(x => `<div class="ex-rule">${x}</div>`).join('')}</div>` }));
        gt.forEach(g => bg.push({ id: fk('g-' + g.id), l: '✍ ' + t('Apunts de la pissarra', 'My whiteboard notes'), html: together(g), gt: true }));
        gram.forEach(g => bg.push({ id: fk('g-' + g.id), l: '🎮 ' + esc(gname(g)), html: game(g) }));
        out.push({ key: kg, l: `LP${esc(lp.n)} · ${t('Gramàtica', 'Grammar')}`, head: `<div class="nb-h2">🧩 <span class="u">${t('Gramàtica', 'Grammar')}</span> <small class="nb-pencil">· LP${esc(lp.n)}</small></div>`, blocks: ordered(kg, bg.concat(notesOf(kg))), foot: addBtn(kg) });
      }
    });
    const rest = games.filter(g => !used.has(g.id) && !ex.dropped.some(a => String(a.n) === H.lpOf(g)));
    if (rest.length) out.push({ key: 'other', tab: '🎮', l: '🎮 ' + t('Altres jocs de classe', 'Other class games'), head: `<div class="nb-h2">🎮 <span class="u">${t('Altres jocs de classe', 'Other class games')}</span></div>`,
      blocks: ordered('other', rest.map(g => ({ id: fk('g-' + g.id), html: g.gt ? together(g) : game(g), gt: !!g.gt })).concat(notesOf('other'))), foot: addBtn('other') });
    // ✍ the student's own sections (Roger, 13 Nov 2026: "in the index, I want them to be able to organize their notes, like moving up and
    // down the sections, and I want them to add some sections"); every section after the index can go ▲ up and ▼ down
    const NB = PT(), own = Object.keys(NB).filter(k => /^s[a-z0-9]+$/.test(k) && NB[k] && typeof NB[k] === 'object');
    own.sort((x, y) => String(NB[x].day || '').localeCompare(String(NB[y].day || '')) || x.localeCompare(y)).forEach((k, j) => {
      const sx = NB[k], body = hasInk(sx) ? [{ id: k + '~', own: k, html: noteHtml(sx) }] : [];
      out.push({ key: k, own: true, tab: j === 0 ? '✍' : '', l: '✍ ' + esc(sx.topic || t('Els meus apunts', 'My notes')),
        head: `${sx.day ? `<div class="nb-mdate" style="top:34px">${mday(sx.day)}</div>` : ''}<p class="nb-h1">${H.own ? `<input class="nb-stitle" data-sid="${k}" maxlength="60" value="${esc(sx.topic || '')}" aria-label="${t('Títol de la secció', 'Section title')}" spellcheck="false" autocomplete="off">` : esc(sx.topic || '')}</p>`,
        blocks: ordered(k, body.concat(notesOf(k))),
        foot: H.own ? `<div class="nb-links nb-ui"><button type="button" class="nb-addnote" data-sec="${k}">✍ ${t('Escriu-hi', 'Write here')}</button><button type="button" class="nb-del" data-sid="${k}">🗑 ${t('Esborra aquesta secció', 'Delete this section')}</button></div>` : '' });
    });
    const fixed = out.slice(0, 2), mov = out.slice(2), list = O().list.filter(k => mov.some(p => p.key === k));
    mov.forEach((p, i) => { if (list.includes(p.key)) return; let j = -1; for (let q = i - 1; q >= 0 && j < 0; q--) j = list.indexOf(mov[q].key); list.splice(j + 1, 0, p.key); });
    order = list;
    const all = fixed.concat(list.map(k => mov.find(p => p.key === k)));
    // the index: the page numbers are written in once the pages are laid out (data-nbto)
    const li = (l, to) => `<a data-nbto="${to}"><span class="t">${l}</span><span class="dots"></span><span class="n">00</span></a>`;
    const ix = all.slice(2).map(s => {
      const at = list.indexOf(s.key), sub = s.blocks.filter(b => b.l);
      const mv = H.own && at >= 0 ? `<span class="nb-mv nb-ui"><button type="button" data-nbmv="-1" data-k="${s.key}" aria-label="${t('Puja', 'Move up')}" ${at === 0 ? 'disabled' : ''}>▲</button><button type="button" data-nbmv="1" data-k="${s.key}" aria-label="${t('Baixa', 'Move down')}" ${at === list.length - 1 ? 'disabled' : ''}>▼</button></span>` : '';
      return `<li class="lp"><div class="nb-row">${li(s.l, 's:' + s.key)}${mv}</div>${sub.length ? `<ul>${sub.map(b => `<li>${li(b.l, 'b:' + b.id)}</li>`).join('')}</ul>` : ''}</li>`;
    }).join('');
    const add = H.own ? (own.length < MAXOWN ? `<form class="nb-add nb-ui"><input maxlength="60" placeholder="${t('Nova secció: per exemple, Verbs irregulars', 'New section: for example, Irregular verbs')}" aria-label="${t('Nom de la nova secció', 'Name of the new section')}" spellcheck="false" autocomplete="off"><button type="submit">➕ ${t('Afegeix una secció', 'Add a section')}</button></form>`
      : `<p class="nb-pencil">${t(`Ja tens ${MAXOWN} seccions teves: esborra'n una per afegir-ne una altra.`, `You already have ${MAXOWN} sections of your own: delete one to add another.`)}</p>`) : '';
    all[1].head = `<p class="nb-h1"><u>${t('Índex', 'Index')}</u></p>` + (ix ? `<ul class="nb-idx">${ix}</ul>` : `<p class="nb-pencil">${t('Encara no heu fet res d\'aquesta LS a classe. Quan ho feu, apareixerà aquí.', 'Your class hasn\'t done anything of this LS yet. When you do, it will appear here.')}</p>`)
      + (H.own ? `<p class="nb-pencil">${t('▲ ▼ mouen les seccions. Després de cada classe hi apareixen pàgines noves.', '▲ ▼ move the sections. New pages appear here after each class.')}</p>` : '') + add;
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
    }).filter(m => m && /^(hl-[ygp]|ul|ulw|circ)$/.test(m.c));
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
  const textOf = id => [...document.querySelectorAll(`.nb-spread .nb-page .nb-blk[data-b="${id}"]`)].map(p => tnodes(p).map(n => n.nodeValue).join('')).join('');
  const GROUP = c => /^hl-/.test(c) ? 'hl' : /^ul/.test(c) ? 'ul' : c;
  function markSel(c) {
    const sel = getSelection(); if (!sel.rangeCount || sel.isCollapsed) return; const r = sel.getRangeAt(0), per = {};
    document.querySelectorAll('.nb-spread .nb-page.l .nb-blk[data-b]:not(.nb-note),.nb-spread .nb-page.r .nb-blk[data-b]:not(.nb-note)').forEach(pc => {
      if (!r.intersectsNode(pc)) return; let acc = +pc.dataset.off || 0;
      tnodes(pc).forEach(tn => {
        const len = tn.nodeValue.length;
        if (r.intersectsNode(tn)) { const s = tn === r.startContainer ? r.startOffset : 0, e = tn === r.endContainer ? r.endOffset : len; if (e > s) { const g = per[pc.dataset.b] || (per[pc.dataset.b] = { s: 1e9, e: -1 }); g.s = Math.min(g.s, acc + s); g.e = Math.max(g.e, acc + e); } }
        acc += len;
      });
    });
    const ids = Object.keys(per); if (!ids.length) return;
    const M = MK();
    ids.forEach(id => {
      const { s, e } = per[id], txt = textOf(id), keep = [];
      (Array.isArray(M[id]) ? M[id] : []).forEach(m => {
        if (m.e <= s || m.s >= e || (c !== 'x' && GROUP(m.c) !== GROUP(c))) return keep.push(m);
        if (m.s < s) keep.push({ s: m.s, e: s, c: m.c, x: txt.slice(m.s, Math.min(s, m.s + 30)) });
        if (m.e > e) keep.push({ s: e, e: m.e, c: m.c, x: txt.slice(e, Math.min(m.e, e + 30)) });
      });
      if (c !== 'x') keep.push({ s, e, c, x: txt.slice(s, Math.min(e, s + 30)) });
      M[id] = keep.slice(-200); if (!M[id].length) delete M[id];
    });
    sel.removeAllRanges(); hideSel(); save(); relayout();
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
  const SPLIT = '.nb-legend,.nb-blk,.nb-game,.nb-slip,.nt-s,ul.nb-voc,.nb-notes,ul.nb-idx,.nb-idx ul,.nb-mine,.nb-sticky ul';
  const SKIP = '.nb-mdate,.nb-ui';
  function flow(sp, frag, si) {
    let page, paper, cur, stack = [], leaves = 0;
    const newPage = () => {
      if (page) page.classList.remove('nb-meas');
      page = document.createElement('section'); page.className = 'nb-page nb-meas'; page.dataset.i = pages.length; page.dataset.s = si;
      page.innerHTML = `<div class="nb-paper"></div><span class="nb-pno">${pages.length + 1}</span><span class="nb-corner" aria-hidden="true"></span>`; sp.append(page);
      paper = page.firstChild; pages.push({ s: si, el: page });
      cur = paper; stack.forEach(s => { const c = s.cloneNode(false); c.classList.add('nb-cont'); cur.append(c); cur = c; }); leaves = 0;
    };
    const fits = () => paper.scrollHeight <= paper.clientHeight + 1;
    // a heading never stays alone at the bottom of a page: it goes on with what it is the heading of
    const HEAD = '.nb-h2,.nb-h3,h4,.nb-when,.nb-lab';
    const breakBefore = () => {
      const keep = []; let x = cur.lastChild;
      while (x && ((x.nodeType === 3 && !x.nodeValue.trim()) || (x.nodeType === 1 && x.matches(HEAD)))) { if (x.nodeType === 1) keep.unshift(x); x = x.previousSibling; }
      const n = keep.length && keep.length < leaves ? keep : [];
      n.forEach(e => e.remove()); newPage(); n.forEach(e => { cur.append(e); leaves++; });
    };
    const counts = n => n.nodeType === 1 ? !n.matches(SKIP) : !!n.nodeValue.trim();
    const place = node => {
      cur.append(node);
      if (fits()) { if (counts(node)) leaves++; return; }
      node.remove();
      if (node.nodeType === 1 && node.matches(SPLIT) && (node.childNodes.length > 1 || (node.firstChild && node.firstChild.nodeType === 1))) {
        const shell = node.cloneNode(false), c = shell.cloneNode(false); cur.append(c);
        if (!fits() && leaves) { c.remove(); breakBefore(); return place(node); }
        stack.push(shell); cur = c;
        [...node.childNodes].forEach(place);
        stack.pop(); cur = cur.parentNode; return;
      }
      if (leaves) { breakBefore(); return place(node); }
      // alone on a new page and still too tall: a bit smaller, so it fits
      cur.append(node); leaves++;
      if (node.nodeType === 1) { const h = node.getBoundingClientRect().height, over = paper.scrollHeight - paper.clientHeight; if (h > 0 && over > 0) node.style.zoom = String(Math.max(.35, (h - over - 4) / h)); }
    };
    newPage(); [...frag.childNodes].forEach(place); page.classList.remove('nb-meas');
  }
  function layout(keep) {
    const root = document.querySelector('.nb'), sp = root && root.querySelector('.nb-spread'); if (!sp || !H || printing()) return false;
    const W = sp.clientWidth, Hh = sp.clientHeight; if (!W || !Hh) return false;
    // where the student is: the first part on the page shown, to open there again
    if (keep == null && pages.length) { const p = pages[Math.max(0, Math.min(pages.length - 1, pg))]; const b = p && p.el.querySelector('.nb-blk[data-b]'); const f = pages.findIndex(x => x.s === p.s); keep = b ? 'b:' + b.dataset.b + '@' + (b.dataset.off || 0) : 's:' + ((secs[p.s] || {}).key || '') + '@' + (pg - f); }
    sp.querySelectorAll('.nb-page,.nb-leaf').forEach(p => p.remove()); pages = []; T0 = null;
    const tpl = document.createElement('template'), M = MK();
    secs.forEach((s, si) => {
      tpl.innerHTML = s.head + s.blocks.map(b => `<div class="nb-blk${b.note || b.own ? ' nb-note' : ''}" data-b="${b.id}">${b.html}</div>`).join('') + (s.foot || '');
      tpl.content.querySelectorAll('.nb-blk[data-b]:not(.nb-note)').forEach(el => paintMarks(el, M[el.dataset.b]));
      flow(sp, tpl.content, si);
    });
    // empty pieces left behind when a part moved on to the next page
    sp.querySelectorAll('.nb-cont,.nb-blk,.nb-slip,.nb-game,ul,.nb-notes,.nb-mine').forEach(e => { if (!e.textContent.trim() && !e.querySelector('svg,table,img,input,button')) e.remove(); });
    // where each piece of a part starts in its text (for marks), and the tools of each part on its first page
    const seen = {};
    sp.querySelectorAll('.nb-blk[data-b]').forEach(pc => {
      const id = pc.dataset.b; pc.dataset.off = seen[id] || 0; seen[id] = (seen[id] || 0) + tnodes(pc).map(n => n.nodeValue).join('').length;
      if (pc.dataset.off === '0' && H.own) pc.insertAdjacentHTML('afterbegin', tools(pc));
    });
    // page numbers in the index and the tabs
    const secStart = {}, blkPage = {};
    pages.forEach((p, i) => { const k = (secs[p.s] || {}).key; if (secStart[k] == null) secStart[k] = i; p.el.querySelectorAll('.nb-blk[data-b]').forEach(b => { if (blkPage[b.dataset.b] == null) blkPage[b.dataset.b] = i; }); });
    const to = v => { const [k, id] = [v.slice(0, 1), v.slice(2)]; const i = k === 's' ? secStart[id] : blkPage[id]; return i == null ? null : i; };
    root.querySelectorAll('[data-nbto]').forEach(a => { const i = to(a.dataset.nbto); if (i == null) return; a.dataset.nbgo = i; const n = a.querySelector('.n'); if (n) n.textContent = i + 1; });
    sp.querySelectorAll('.nb-page').forEach(p => { const i = +p.dataset.i; p.setAttribute('aria-label', t('Pàgina', 'Page') + ' ' + (i + 1)); });
    const pl = root.querySelector('.nb-plist'); if (pl) pl.innerHTML = pages.map((p, i) => `<label><input type="checkbox" value="${i}"> <b>${i + 1}</b> ${esc(pname(p))}</label>`).join('');
    const pa = root.querySelector('[data-nbpr="all"]'); if (pa) pa.textContent = t('Tota la llibreta', 'The whole notebook') + ` (${pages.length})`;
    laid = W + 'x' + Hh + (document.documentElement.classList.contains(PLAIN) ? 'p' : '');
    // back to the same place
    if (typeof keep === 'number') pg = keep;
    else if (keep) {
      const [k, rest] = [keep.slice(0, 1), keep.slice(2)];
      if (k === 's') { const [key, n] = rest.split('@'), i = secStart[key]; if (i != null) { let j = i + (+n || 0); while (j > i && (!pages[j] || pages[j].s !== pages[i].s)) j--; pg = j; } }
      else { const [id, off] = rest.split('@'); const hit = [...sp.querySelectorAll(`.nb-blk[data-b="${id}"]`)].filter(b => +b.dataset.off <= +(off || 0)).pop(); if (hit) pg = +hit.closest('.nb-page').dataset.i; else if (blkPage[id] != null) pg = blkPage[id]; }
    }
    show(); return true;
  }
  const relayout = keep => { if (!layout(keep)) laid = ''; };
  function tools(pc) {
    const id = pc.dataset.b, s = secs[+pc.closest('.nb-page').dataset.s] || {}, list = s.blocks || [], i = list.findIndex(b => b.id === id), b = list[i] || {};
    const ed = b.note || b.own || b.gt;
    return `<span class="nb-ui nb-bt"><button type="button" data-nbbm="-1" data-b="${id}" title="${t('Puja aquesta part', 'Move this part up')}" ${i <= 0 ? 'disabled' : ''}>▲</button><button type="button" data-nbbm="1" data-b="${id}" title="${t('Baixa aquesta part', 'Move this part down')}" ${i >= list.length - 1 ? 'disabled' : ''}>▼</button>`
      + `<button type="button" data-nbadd="${id}" title="${t('Afegeix una nota aquí sota', 'Add a note below this')}">✍</button>${ed ? `<button type="button" data-nbed="${id}" title="${t('Edita', 'Edit')}">✏️</button>` : ''}</span>`;
  }
  const pname = p => { const s = secs[p.s] || {}; return s.key === 'cover' ? t('Portada', 'Cover') : s.key === 'index' ? t('Índex', 'Index') : plainOf(s.l); };

  const wide = () => matchMedia('(min-width:900px)').matches;
  function show() {
    const root = document.querySelector('.nb'); if (!root || !pages.length) return;
    pg = Math.max(0, Math.min(pages.length - 1, pg));
    const a = wide() ? pg - pg % 2 : pg, z = wide() ? Math.min(a + 1, pages.length - 1) : a;
    pages.forEach((p, i) => { p.el.classList.toggle('l', i === a); p.el.classList.toggle('r', wide() && i === a + 1); });
    const pc = root.querySelector('.nb-pcur'); if (pc) pc.textContent = a === z ? t(`Aquesta pàgina (${a + 1})`, `This page (${a + 1})`) : t(`Aquestes pàgines (${a + 1}–${z + 1})`, `These pages (${a + 1}–${z + 1})`);
    root.querySelector('.nb-where').textContent = a === z ? t(`pàgina ${a + 1} de ${pages.length}`, `page ${a + 1} of ${pages.length}`) : t(`pàgines ${a + 1}–${z + 1} de ${pages.length}`, `pages ${a + 1}–${z + 1} of ${pages.length}`);
    root.querySelector('.nb-prev').disabled = a <= 0; root.querySelector('.nb-next').disabled = z >= pages.length - 1;
    let cur = null; root.querySelectorAll('.nb-tab').forEach(b => { if (b.dataset.nbgo != null && +b.dataset.nbgo <= z) cur = b; });
    root.querySelectorAll('.nb-tab').forEach(b => b.setAttribute('aria-current', String(b === cur)));
    store.set('el-nb-pg|' + LSKEY, String(pg)); hideSel();
  }
  function go(i) { pg = i; show(); }
  // what the student changes is saved 1.5 s after the last change (el-notes.js writes notes/nb-<LS>)
  const status = s => { const st = document.querySelector('.nb-saved'); if (st) st.textContent = s; };
  function save() {
    clearTimeout(saveT); status(t('Desant…', 'Saving…'));
    saveT = setTimeout(() => { O().list = order.slice(); Promise.resolve(H.save && H.save(PT())).then(() => status('✓ ' + t('Desat', 'Saved'))).catch(() => status('⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again'))); }, 1500);
  }
  const redraw = keep => { if (last) { draw(last[0], last[1], last[2], H, keep); } };

  function draw(box, ex, games, helpers, keep) {
    css(); H = helpers; last = [box, ex, games]; H.nb = H.nb || { parts: {} };
    if (LSKEY !== H.LS) { LSKEY = H.LS; pg = +store.get('el-nb-pg|' + LSKEY) || 0; }
    secs = build(ex, games);
    const tabs = [`<button type="button" class="nb-tab" data-nbto="s:index">${t('Índex', 'Index')}</button>`]
      .concat(secs.map(s => s.tab ? `<button type="button" class="nb-tab" data-nbto="s:${s.key}">${esc(s.tab)}</button>` : '').filter(Boolean)).join('');
    const plain = document.documentElement.classList.contains(PLAIN);
    let rings = ''; for (let i = 0; i < 14; i++) rings += '<span class="nb-ring"></span>';
    const MKS = [['hl-y', '<span class="pad-hlb" style="background:var(--nb-hl-y)"></span>', 'Subratllador groc', 'Yellow highlighter'], ['hl-g', '<span class="pad-hlb" style="background:var(--nb-hl-g)"></span>', 'Subratllador verd', 'Green highlighter'], ['hl-p', '<span class="pad-hlb" style="background:var(--nb-hl-p)"></span>', 'Subratllador rosa', 'Pink highlighter'],
      ['ul', '<span class="nb-ul pad-l">U</span>', 'Subratlla', 'Underline'], ['ulw', '<span class="nb-ulw pad-l">U</span>', 'Subratlla ondulat', 'Wavy underline'], ['circ', '<span class="nb-circ pad-l">o</span>', 'Encercla', 'Circle'], ['x', '🧽', 'Treu les marques', 'Take the marks off']];
    box.innerHTML = `<div class="nb"><div class="nb-bar" role="navigation" aria-label="${t('Pestanyes de la llibreta', 'Notebook tabs')}">${tabs}<span class="nb-sp"></span>`
      + (H.own ? '<span class="nb-saved nb-pencil" role="status"></span>' : '')
      + `<span class="nb-pwrap"><button type="button" class="nb-tool nb-printbtn" aria-expanded="false">🖨 ${t('Imprimeix', 'Print')}</button><div class="nb-pmenu" hidden><b>🖨 ${t('Què vols imprimir?', 'What do you want to print?')}</b>`
      + `<button type="button" data-nbpr="cur" class="nb-pcur"></button><button type="button" data-nbpr="all"></button>`
      + `<details><summary>${t('Tria les pàgines…', 'Choose pages…')}</summary><div class="nb-plist"></div><button type="button" data-nbpr="sel">${t('Imprimeix les pàgines triades', 'Print the pages I chose')}</button></details></div></span>`
      + `<button type="button" class="nb-tool nb-plain" aria-pressed="${plain}">${plain ? '✍ ' + t('Lletra de mà', 'Handwriting') : 'Aa ' + t('Lletra d\'impremta', 'Print letters')}</button>`
      + `<button type="button" class="nb-tool nb-close" title="${t('Tanca la llibreta', 'Close the notebook')}">✕ ${t('Tanca', 'Close')}</button></div>`
      + `<div class="nb-spread"><div class="nb-spine" aria-hidden="true">${rings}</div></div>`
      + `<nav class="nb-nav" aria-label="${t('Passa la pàgina', 'Turn the page')}"><button type="button" class="nb-prev" aria-label="${t('Pàgina anterior', 'Previous page')}">◀</button><span class="nb-where"></span><button type="button" class="nb-next" aria-label="${t('Pàgina següent', 'Next page')}">▶</button></nav>`
      + (H.own ? `<div class="nb-selbar" role="toolbar" aria-label="${t('Marca les paraules triades', 'Mark the words you selected')}" hidden>${MKS.map(([k, h, ca, en]) => `<button type="button" data-nbmk="${k}" title="${t(ca, en)}" aria-label="${t(ca, en)}">${h}</button>`).join('')}</div>` : '')
      + `</div>`;
    pages = []; laid = '';
    watch(box.querySelector('.nb-spread'));
    if (!layout(keep)) { /* hidden for now: laid out when it shows (watch) */ }
  }

  // never while printing: the printed sheets are the pages on the screen
  let PRN = false; addEventListener('beforeprint', () => { PRN = true; }); addEventListener('afterprint', () => { PRN = false; });
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
  // ▲ ▼ whole sections, in the index
  document.addEventListener('click', e => {
    const mv = e.target.closest && e.target.closest('.nb [data-nbmv]'); if (!mv || !H || !H.own) return;
    const i = order.indexOf(mv.dataset.k), j = i + (+mv.dataset.nbmv); if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]]; O().list = order.slice(); save(); redraw('s:index');
    const b = document.querySelector(`.nb [data-nbmv="${mv.dataset.nbmv}"][data-k="${mv.dataset.k}"]`); if (b && !b.disabled) b.focus();
  });
  // ▲ ▼ the parts of a section, on its pages; ✍ a note after a part; ✏️ edit a note
  const secOf = id => secs.find(s => (s.blocks || []).some(b => b.id === id));
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.nb [data-nbbm],.nb [data-nbadd],.nb [data-nbed],.nb .nb-addnote,.nb .nb-note'); if (!b || !H || !H.own) return;
    if (b.classList.contains('nb-note') && (e.target.closest('.nb-ui') || getSelection().toString())) return;
    e.preventDefault();
    if (b.dataset.nbbm) {
      const s = secOf(b.dataset.b); if (!s) return; const ids = s.blocks.map(x => x.id), i = ids.indexOf(b.dataset.b), j = i + (+b.dataset.nbbm);
      if (i < 0 || j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; O().b[s.key] = ids; save(); redraw('b:' + b.dataset.b);
      setTimeout(() => { const nb = document.querySelector(`.nb [data-nbbm="${b.dataset.nbbm}"][data-b="${b.dataset.b}"]`); if (nb && !nb.disabled) nb.focus(); }, 30); return;
    }
    if (b.dataset.nbadd || b.classList.contains('nb-addnote')) {
      const after = b.dataset.nbadd, s = after ? secOf(after) : secs.find(x => x.key === b.dataset.sec); if (!s) return;
      const id = 'n' + Date.now().toString(36), ids = s.blocks.map(x => x.id), at = after ? ids.indexOf(after) + 1 : ids.length;
      NT()[id] = { sec: s.key, html: '', text: '', dr: [], day: today() }; ids.splice(at, 0, id); O().b[s.key] = ids;
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
    const k = d.dataset.sid; delete PT()[k]; Object.keys(NT()).forEach(n => { if (NT()[n].sec === k) delete NT()[n]; }); delete O().b[k];
    order = order.filter(x => x !== k); O().list = order.slice(); save(); redraw('s:index');
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest && e.target.closest('.nb .nb-add'); if (!f || !H || !H.own) return; e.preventDefault();
    const name = f.querySelector('input').value.trim().slice(0, 60); if (!name) { f.querySelector('input').focus(); return; }
    const k = 's' + Date.now().toString(36);
    PT()[k] = { topic: name, html: '', text: '', dr: [], day: today() }; order.push(k); O().list = order.slice(); save(); redraw('s:' + k);
    const s = secs.find(x => x.key === k); const id = 'n' + Date.now().toString(36);
    if (s) { NT()[id] = { sec: k, html: '', text: '', dr: [], day: today() }; O().b[k] = [id]; editor({ kind: 'note', id, sec: s, fresh: true }); }
  });
  document.addEventListener('change', e => {
    const x = e.target.closest && e.target.closest('.nb .nb-stitle'); if (!x || !H || !H.own) return;
    const sx = PT()[x.dataset.sid]; if (!sx) return; sx.topic = x.value.trim().slice(0, 60) || sx.topic; save(); redraw('s:' + x.dataset.sid);
  });

  // ✍ the handwriting page for a note: big, on top of the book, the same pens and marks as the whiteboard (el-pad.js)
  let ED = null;
  function editor(o) {
    const root = document.querySelector('.nb'); if (!root || !me) return; closeEditor(true);
    let v, title, del = true;
    if (o.kind === 'note') { v = NT()[o.id]; title = '✍ ' + t('La meva nota', 'My note'); }
    else if (o.kind === 'own') { v = PT()[o.k]; title = '✍ ' + esc(v && v.topic || ''); del = false; }
    else { v = o.g.gt; title = '✍ ' + t('Els meus apunts de classe', 'My notes from class') + ' · ' + esc(gname(o.g)); del = false; }
    if (!v) return;
    const w = document.createElement('div'); w.className = 'nb-ed'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', plainOf(title));
    w.innerHTML = `<div class="nb-ed-in"><div class="nb-ed-top"><b>${title}</b><span class="nb-ed-where">${esc(plainOf(o.sec.l))}</span><span class="nb-sp"></span>${del ? `<button type="button" class="nb-tool nb-ed-del">🗑 ${t('Esborra la nota', 'Delete the note')}</button>` : ''}<button type="button" class="nb-tool nb-ed-ok">✓ ${t('Fet', 'Done')}</button></div><div class="nb-ed-sheet"><div class="nb-paper"><div class="nb-ed-host"></div></div></div></div>`;
    root.append(w); ED = { o, w, v, gtT: 0 };
    import(new URL('./el-pad.js', me).href).then(P => {
      if (ED == null || ED.w !== w) return;
      ED.p = P.pad(w.querySelector('.nb-ed-host'), { html: v.html, text: v.text, dr: v.dr, ca: H.ca, ph: t('Escriu aquí. Pots canviar de boli, subratllar i dibuixar.', 'Write here. You can change pens, highlight and draw.'), onChange: x => {
        Object.assign(v, x);
        if (o.kind === 'gt') { status(t('Desant…', 'Saving…')); clearTimeout(ED.gtT); ED.gtT = setTimeout(() => gtSave(o.g), 1500); } else save();
      } });
      setTimeout(() => { if (ED && ED.p) ED.p.ed.focus(); }, 30);
    }).catch(e => console.warn('notebook pad', e));
    w.querySelector('.nb-ed-ok').addEventListener('click', () => closeEditor());
    const db = w.querySelector('.nb-ed-del'); if (db) db.addEventListener('click', () => {
      if (!db.dataset.sure) { db.dataset.sure = '1'; db.textContent = '🗑 ' + t('Segur? Toca-ho una altra vegada', 'Sure? Tap again to delete'); return; }
      delete NT()[o.id]; const L = O().b[o.sec.key]; if (L) O().b[o.sec.key] = L.filter(x => x !== o.id); save(); ED = null; w.remove(); redraw('s:' + o.sec.key);
    });
  }
  function gtSave(g) { if (!H.saveGt) return; Promise.resolve(H.saveGt(g.id, g.gt)).then(() => status('✓ ' + t('Desat', 'Saved'))).catch(() => status('⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again'))); }
  function closeEditor(quiet) {
    const E = ED; if (!E) return; ED = null;
    if (E.p) Object.assign(E.v, E.p.get());
    const o = E.o;
    if (o.kind === 'note' && !hasInk(E.v)) { delete NT()[o.id]; const L = O().b[o.sec.key]; if (L) O().b[o.sec.key] = L.filter(x => x !== o.id); save(); }
    else if (o.kind === 'gt') { clearTimeout(E.gtT); gtSave(o.g); }
    else save();
    E.w.remove(); if (!quiet) redraw(o.kind === 'note' && NT()[o.id] ? 'b:' + o.id : 's:' + o.sec.key);
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
    const face = (i, cls) => { const f = document.createElement('div'); f.className = 'nb-face ' + cls; const p = P(i); if (p) f.innerHTML = p.innerHTML; else f.classList.add('blank'); return f; };
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
  function printPages(set) {
    const h = document.documentElement, root = document.querySelector('.nb'); if (!root) return;
    if (set) { h.classList.add('nb-printsel'); pages.forEach((p, i) => p.el.classList.toggle('nb-pr', set.includes(i))); }
    const menu = root.querySelector('.nb-pmenu'); if (menu) menu.hidden = true;
    const off = () => { h.classList.remove('nb-printsel'); root.querySelectorAll('.nb-pr').forEach(p => p.classList.remove('nb-pr')); removeEventListener('afterprint', off); };
    addEventListener('afterprint', off); setTimeout(() => window.print(), 50);
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
