// 📓 My notebook (Roger, 13 Nov 2026: "I need students to see this section as though it was hand written with an index, students say that
// is difficult for them to organise their minds with the web. So there, it should appear the theory, vocabulary we've done so far and their
// notes"). The LS page's #notes place (🎯 What's in the exam · your notes, el-notes.js) is drawn as a ring notebook for the student:
//  - page 1: the exam date on a sticky note, how to read the notebook, Sample exam and Print; page 2: the index, with page numbers;
//  - for each learning path the group has done something of (el-exam.js, only what the group did, so nothing locked shows):
//    a page with the day in the margin, the tabs done in class, 📚 the key terms in handwriting (and the vocabulary class games), and,
//    if there is grammar, a page with 🧩 the "How it works" boxes as the teacher's slips glued in, 📘 the notes taken on the whiteboard
//    while the teacher explained (el-whiteboard.js) and the grammar class games: theory slips, the student's notes in blue pen, the score
//    circled and a pink "study again" note;
//  - coloured tabs on top (Index, LP1, LP2…), ◀ ▶ (or the arrow keys) turn the pages: two pages side by side on a Chromebook, one on a phone.
// "Aa Print letters" switches the handwriting to plain letters for students who read print better (remembered on the device). Print prints
// every page. No Firestore reads of its own: el-notes.js passes what it already read. Only LS2+ home pages load it (LS1 has no #notes).
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

  // what the student wrote on the whiteboard page: only the notebook's own marks are kept (a doc is the student's own, so it is cleaned
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
  // drawings: ["b|x,y x,y …"] in a 460-wide box (the whiteboard page's width), pens b k r g
  const INK = { b: '#1f4fb5', k: '#23262b', r: '#d32f2f', g: '#2e7d32' };
  function svg(dr) {
    const st = (Array.isArray(dr) ? dr : []).map(s => { const [c, p] = String(s).split('|'); return { c: INK[c] || INK.b, p: String(p || '').split(' ').map(x => x.split(',').map(Number)).filter(x => x.length === 2 && x.every(Number.isFinite)) }; }).filter(s => s.p.length > 1);
    if (!st.length) return '';
    const h = Math.max(...st.flatMap(s => s.p.map(p => p[1]))) + 20;
    return `<svg viewBox="0 0 460 ${h}" style="height:${h * 100 / 460}%;aspect-ratio:460/${h};height:auto" aria-hidden="true">${st.map(s => `<polyline points="${s.p.map(p => p.join(',')).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
  }

  let H = null, pages = [], pg = 1, LSKEY = '', order = [], last = null, saveT = 0;
  const t = (c, e) => H.t(c, e);
  const mday = d => { if (!d || d === true) return ''; const s = String(H.exDay(d)).replace(/\.$/, '').replace(/,/g, ''); const i = s.indexOf(' '); return i > 0 ? esc(s.slice(0, i)) + '<br>' + esc(s.slice(i + 1)) : esc(s); };
  const lines = s => esc(String(s || '').trim()).replace(/\n/g, '<br>');
  const kindIcon = k => k === 'grammar' ? '🧩' : k === 'vocab' ? '📚' : '🎮';
  const gname = g => String(g.title || '').replace(/^(Grammar|Vocabulary) · /, '').replace(/^📘\s*/, '');

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
    const mine = p.html ? `<div class="nb-notes">${clean(p.html)}${svg(p.dr)}</div>` : txt ? `<div class="nb-mine">${lines(txt)}</div>` : `<p class="nb-pencil">${t('No vas prendre apunts aquí.', 'You didn\'t take notes here.')}</p>`;
    return `<div class="nb-game"><div class="nb-h3" style="color:var(--nb-black)">${rd ? '📖' : '📘'} ${esc(gname(g))}</div><span class="nb-when">${rd ? t('Lectura junts', 'Reading together') : t('Gramàtica junts', 'Grammar together')}${p.day ? ' · ' + esc(H.gtDay(p.day)) : ''}</span>${sum}<div class="nb-mine"><span class="nb-lab">✍ ${t('Els meus apunts de classe', 'My notes from class')}</span></div>${mine}</div>`;
  }

  function build(ex, games) {
    const out = [], LS = H.LS, ls = (window.EL_LS || []).find(l => l.id === LS) || {};
    const course = String(ls.course || '').replace(/^(\d)eso$/, '$1 ESO'), name = String(ls.title || '').replace(/^[^·]*·\s*/, '');
    // page 1
    const n = ex.exam && window.ELWeek ? ELWeek.days(ELWeek.today(), ex.exam) : null;
    const when = n == null || n < 0 ? '' : n === 0 ? t('avui!', 'today!') : n === 1 ? t('demà!', 'tomorrow!') : t(`d'aquí a ${n} dies`, `in ${n} days`);
    out.push({ html: `<p class="nb-h1"><u>${t('Anglès', 'English')}</u></p><div class="nb-h2">${esc(name)}</div><div class="nb-mine">${esc(course)}</div>
      <div class="nb-sticky">${ex.exam ? `🎯 ${t('EXAMEN', 'EXAM')}: ${esc(H.exDay(ex.exam))}${when ? ' · ' + when : ''}` : '🎯 ' + t('Què entra a l\'examen', 'What\'s in the exam')}<small>${t('Tot el que hi ha en aquesta llibreta és el que hem fet a classe: és el que entra a l\'examen. Cada vegada que fem alguna cosa nova, apareix aquí.', 'Everything in this notebook is what we did in class: it\'s what goes in the exam. Each time we do something new, it appears here.')}</small></div>
      ${ex.dropped.length ? `<p class="nb-pencil">✂️ ${t('No entra a l\'examen', 'Not in your exam')}: ${ex.dropped.map(a => `LP${esc(a.n)} ${esc(a.title)}`).join(' · ')}</p>` : ''}
      <div class="nb-legend"><b>${t('Com es llegeix', 'How to read it')}</b><br>📎 ${t('paper enganxat = del professor', 'glued slip = from your teacher')}<br><span style="color:var(--nb-ink)">${t('boli blau', 'blue pen')}</span> = ${t('els teus apunts', 'your own notes')}<br><span style="color:var(--nb-red)">${t('cercle', 'circle')}</span> = ${t('el teu resultat al joc', 'your game result')}<br>🩷 ${t('nota rosa = estudia-ho una altra vegada', 'pink note = study this again')}</div>
      <div class="nb-links">${ex.sample ? `<a href="${esc(ex.sample)}">📝 ${t('Examen de mostra', 'Sample exam')}</a>` : ''}<button type="button" id="notesPrint">🖨 ${t('Imprimeix la llibreta', 'Print my notebook')}</button></div>` });
    out.push({ index: true, html: '' });
    const used = new Set();
    ex.lps.forEach(lp => {
      const gs = games.filter(g => H.lpOf(g) === String(lp.n)); gs.forEach(g => used.add(g.id));
      const rd = gs.filter(g => g.gt && /-rd$/.test(g.id)), gt = gs.filter(g => g.gt && !/-rd$/.test(g.id));
      const voc = gs.filter(g => !g.gt && g.kind === 'vocab'), gram = gs.filter(g => !g.gt && g.kind !== 'vocab');
      const d0 = (lp.tabs.find(x => x.day && x.day !== true) || {}).day;
      const idx = [{ l: `LP${esc(lp.n)} ${esc(lp.title)}`, lp: true }];
      let a = `${d0 ? `<div class="nb-mdate" style="top:34px">${mday(d0)}</div>` : ''}<p class="nb-h1"><u>LP${esc(lp.n)}</u> ${esc(lp.title)}</p>`
        + (lp.tabs.length ? `<div class="nb-pencil nb-done">${t('Fet a classe', 'Done in class')}: ${lp.tabs.map(x => `<i>✓</i> ${esc(x.name)}`).join(' ')}</div>` : '');
      if (lp.terms.length) {
        a += `<div class="nb-h2" style="margin-top:24px">📚 <span class="u">${t('Paraules clau', 'Key terms')}</span></div>` + lp.terms.map(g => `${lp.terms.length > 1 ? `<div class="nb-h3">${g.g}</div>` : ''}<ul class="nb-voc">${g.items.map(x => `<li><b>${x.en}</b>${x.ca ? ` <span>– ${x.ca}</span>` : ''}</li>`).join('')}</ul>`).join('');
        idx.push({ l: '📚 ' + t('Paraules clau', 'Key terms') });
      }
      voc.forEach(g => { a += game(g); idx.push({ l: '🎮 ' + esc(gname(g)) }); });
      rd.forEach(g => { a += together(g); idx.push({ l: '📖 ' + t('Apunts de la lectura', 'Reading notes') }); });
      if (!lp.terms.length && !lp.grammar.length && !gs.length) a += `<p class="nb-pencil">${t('En aquest learning path heu fet pràctica de comprensió i expressió: obre\'l per repassar-lo.', 'In this learning path you practised the skills: open it to look at it again.')}</p>`;
      a += `<div class="nb-links"><a href="${esc(lp.href)}">${t('Obre el learning path', 'Open the learning path')} →</a></div>`;
      out.push({ key: 'lp' + lp.n, html: a, idx, tab: 'LP' + lp.n });
      if (lp.grammar.length || gt.length || gram.length) {
        let b = `<div class="nb-h2">🧩 <span class="u">${t('Gramàtica', 'Grammar')}</span> <small class="nb-pencil">· LP${esc(lp.n)}</small></div>`;
        const ib = [{ l: `LP${esc(lp.n)} · ${t('Gramàtica', 'Grammar')}`, lp: true }];
        lp.grammar.forEach(g => { b += `<div class="nb-slip"><h4>${g.title}</h4>${g.boxes.map(x => `<div class="ex-rule">${x}</div>`).join('')}</div>`; });
        if (lp.grammar.length) ib.push({ l: '🧩 ' + t('Com funciona', 'How it works') });
        gt.forEach(g => { b += together(g); ib.push({ l: '✍ ' + t('Apunts de la pissarra', 'My whiteboard notes') }); });
        gram.forEach(g => { b += game(g); ib.push({ l: '🎮 ' + esc(gname(g)) }); });
        out.push({ key: 'lp' + lp.n + 'g', html: b, idx: ib });
      }
    });
    const rest = games.filter(g => !used.has(g.id) && !ex.dropped.some(a => String(a.n) === H.lpOf(g)));
    if (rest.length) out.push({ key: 'other', html: `<div class="nb-h2">🎮 <span class="u">${t('Altres jocs de classe', 'Other class games')}</span></div>` + rest.map(g => g.gt ? together(g) : game(g)).join(''), idx: [{ l: '🎮 ' + t('Altres jocs de classe', 'Other class games'), lp: true }], tab: '🎮' });
    // ✍ the student's own sections (Roger, 13 Nov 2026: "in the index, I want them to be able to organize their notes, like moving up and
    // down the sections, and I want them to add some sections"): notes/nb-<LS> parts = {o: {list: the order of the sections}, s…: {topic,
    // html, text, dr, day}} (el-notes.js saves it). Every section but the first two pages can go ▲ up and ▼ down; new ones start at the end.
    const NB = H.nb.parts || (H.nb.parts = {}), own = Object.keys(NB).filter(k => /^s[a-z0-9]+$/.test(k) && NB[k] && typeof NB[k] === 'object');
    own.sort((x, y) => String(NB[x].day || '').localeCompare(String(NB[y].day || '')) || x.localeCompare(y)).forEach((k, j) => {
      const sx = NB[k];
      out.push({ key: k, own: true, tab: j === 0 ? '✍' : '', idx: [{ l: '✍ ' + esc(sx.topic || t('Els meus apunts', 'My notes')), lp: true }],
        html: `${sx.day ? `<div class="nb-mdate" style="top:34px">${mday(sx.day)}</div>` : ''}<p class="nb-h1">${H.own ? `<input class="nb-stitle" data-sid="${k}" maxlength="60" value="${esc(sx.topic || '')}" aria-label="${t('Títol de la secció', 'Section title')}" spellcheck="false" autocomplete="off">` : esc(sx.topic || '')}</p>`
          + `<div class="nb-padhost" data-sid="${k}"></div>${H.own ? `<div class="nb-links"><button type="button" class="nb-del" data-sid="${k}">🗑 ${t('Esborra aquesta secció', 'Delete this section')}</button></div>` : ''}` });
    });
    const fixed = out.slice(0, 2), mov = out.slice(2), list = Array.isArray((NB.o || {}).list) ? NB.o.list.filter(k => mov.some(p => p.key === k)) : [];
    mov.forEach((p, i) => { if (list.includes(p.key)) return; let j = -1; for (let q = i - 1; q >= 0 && j < 0; q--) j = list.indexOf(mov[q].key); list.splice(j + 1, 0, p.key); });
    order = list;
    const pagesOut = fixed.concat(list.map(k => mov.find(p => p.key === k)));
    // the index, now that every page has its number
    const li = (e, i) => `<a data-nbgo="${i}"><span class="t">${e.l}</span><span class="dots"></span><span class="n">${i + 1}</span></a>`;
    let ix = '';
    pagesOut.forEach((p, i) => {
      if (!p.idx || !p.idx.length) return;
      const [head, ...sub] = p.idx, at = list.indexOf(p.key);
      const mv = H.own && at >= 0 ? `<span class="nb-mv"><button type="button" data-nbmv="-1" data-k="${p.key}" aria-label="${t('Puja', 'Move up')}" ${at === 0 ? 'disabled' : ''}>▲</button><button type="button" data-nbmv="1" data-k="${p.key}" aria-label="${t('Baixa', 'Move down')}" ${at === list.length - 1 ? 'disabled' : ''}>▼</button></span>` : '';
      ix += `<li class="lp"><div class="nb-row">${li(head, i)}${mv}</div>${sub.length ? `<ul>${sub.map(e => `<li>${li(e, i)}</li>`).join('')}</ul>` : ''}</li>`;
    });
    const add = H.own ? (own.length < 18 ? `<form class="nb-add"><input maxlength="60" placeholder="${t('Nova secció: per exemple, Verbs irregulars', 'New section: for example, Irregular verbs')}" aria-label="${t('Nom de la nova secció', 'Name of the new section')}" spellcheck="false" autocomplete="off"><button type="submit">➕ ${t('Afegeix una secció', 'Add a section')}</button></form>`
      : `<p class="nb-pencil">${t('Ja tens 18 seccions teves: esborra\'n una per afegir-ne una altra.', 'You already have 18 sections of your own: delete one to add another.')}</p>`) : '';
    pagesOut[1].html = `<p class="nb-h1"><u>${t('Índex', 'Index')}</u></p>` + (ix ? `<ul class="nb-idx">${ix}</ul>` : `<p class="nb-pencil">${t('Encara no heu fet res d\'aquesta LS a classe. Quan ho feu, apareixerà aquí.', 'Your class hasn\'t done anything of this LS yet. When you do, it will appear here.')}</p>`)
      + (H.own ? `<p class="nb-pencil">${t('▲ ▼ mouen les seccions. Després de cada classe hi apareixen pàgines noves.', '▲ ▼ move the sections. New pages appear here after each class.')}</p>` : '') + add;
    return pagesOut;
  }

  const wide = () => matchMedia('(min-width:900px)').matches;
  function show() {
    const root = document.querySelector('.nb'); if (!root) return;
    pg = Math.max(0, Math.min(pages.length - 1, pg));
    const a = wide() ? pg - pg % 2 : pg;
    root.querySelectorAll('.nb-page').forEach(p => { const i = +p.dataset.i; p.classList.toggle('l', i === a); p.classList.toggle('r', wide() && i === a + 1); });
    root.querySelectorAll('.nb-page.l .nb-paper,.nb-page.r .nb-paper').forEach(p => { p.scrollTop = 0; });
    const last = wide() ? Math.min(a + 1, pages.length - 1) : a;
    root.querySelector('.nb-where').textContent = a === last ? t(`pàgina ${a + 1} de ${pages.length}`, `page ${a + 1} of ${pages.length}`) : t(`pàgines ${a + 1}–${last + 1} de ${pages.length}`, `pages ${a + 1}–${last + 1} of ${pages.length}`);
    root.querySelector('.nb-prev').disabled = a <= 0; root.querySelector('.nb-next').disabled = last >= pages.length - 1;
    let cur = null; root.querySelectorAll('.nb-tab').forEach(b => { if (+b.dataset.nbgo <= last) cur = b; });
    root.querySelectorAll('.nb-tab').forEach(b => b.setAttribute('aria-current', String(b === cur)));
    store.set('el-nb-pg|' + LSKEY, String(pg));
  }
  function go(i) { pg = i; show(); }
  // the student's sections are saved 2 s after the last change (el-notes.js writes notes/nb-<LS>)
  function save() {
    clearTimeout(saveT); const st = document.querySelector('.nb-saved'); if (st) st.textContent = t('Desant…', 'Saving…');
    saveT = setTimeout(() => { H.nb.parts.o = { list: order.slice() }; Promise.resolve(H.save && H.save(H.nb.parts)).then(() => { const s2 = document.querySelector('.nb-saved'); if (s2) s2.textContent = '✓ ' + t('Desat', 'Saved'); })
      .catch(() => { const s2 = document.querySelector('.nb-saved'); if (s2) s2.textContent = '⚠ ' + t('No s\'ha desat: torna-ho a provar', 'Not saved: try again'); }); }, 1500);
  }
  function mount() {
    const hosts = [...document.querySelectorAll('.nb .nb-padhost')]; if (!hosts.length || !me) return;
    import(new URL('./el-pad.js', me).href).then(P => hosts.forEach(h => {
      if (!h.isConnected) return; const k = h.dataset.sid, sx = H.nb.parts[k]; if (!sx) return;
      P.pad(h, { html: sx.html, text: sx.text, dr: sx.dr, ca: H.ca, readOnly: !H.own, onChange: v => { Object.assign(sx, v); save(); } });
    })).catch(e => console.warn('notebook pad', e));
  }
  const redraw = () => { if (last) draw(last[0], last[1], last[2], H); };
  function draw(box, ex, games, helpers) {
    css(); H = helpers; last = [box, ex, games]; H.nb = H.nb || { parts: {} };
    if (LSKEY !== H.LS) { LSKEY = H.LS; pg = +store.get('el-nb-pg|' + LSKEY) || 0; }
    pages = build(ex, games);
    const tabs = [`<button type="button" class="nb-tab" data-nbgo="1">${t('Índex', 'Index')}</button>`]
      .concat(pages.map((p, i) => p.tab ? `<button type="button" class="nb-tab" data-nbgo="${i}">${esc(p.tab)}</button>` : '').filter(Boolean)).join('');
    const plain = document.documentElement.classList.contains(PLAIN);
    let rings = ''; for (let i = 0; i < 14; i++) rings += '<span class="nb-ring"></span>';
    box.innerHTML = `<div class="nb"><div class="nb-bar" role="navigation" aria-label="${t('Pestanyes de la llibreta', 'Notebook tabs')}">${tabs}<span class="nb-sp"></span>`
      + (H.own ? '<span class="nb-saved nb-pencil" role="status"></span>' : '')
      + `<button type="button" class="nb-tool nb-plain" aria-pressed="${plain}">${plain ? '✍ ' + t('Lletra de mà', 'Handwriting') : 'Aa ' + t('Lletra d\'impremta', 'Print letters')}</button></div>`
      + `<div class="nb-spread">${pages.map((p, i) => `<section class="nb-page" data-i="${i}" aria-label="${t('Pàgina', 'Page')} ${i + 1}"><div class="nb-paper">${p.html}</div><span class="nb-pno">${i + 1}</span></section>`).join('')}<div class="nb-spine" aria-hidden="true">${rings}</div></div>`
      + `<nav class="nb-nav" aria-label="${t('Passa la pàgina', 'Turn the page')}"><button type="button" class="nb-prev" aria-label="${t('Pàgina anterior', 'Previous page')}">◀</button><span class="nb-where"></span><button type="button" class="nb-next" aria-label="${t('Pàgina següent', 'Next page')}">▶</button></nav></div>`;
    show(); mount();
  }
  // one set of listeners for every redraw
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('.nb [data-nbgo],.nb-prev,.nb-next,.nb-plain'); if (!el || !H) return;
    if (el.dataset.nbgo != null) { e.preventDefault(); return go(+el.dataset.nbgo); }
    if (el.classList.contains('nb-plain')) {
      const on = document.documentElement.classList.toggle(PLAIN); store.set(PLAIN, on ? '1' : '0');
      el.setAttribute('aria-pressed', String(on)); el.textContent = on ? '✍ ' + t('Lletra de mà', 'Handwriting') : 'Aa ' + t('Lletra d\'impremta', 'Print letters'); return;
    }
    const step = wide() ? 2 : 1, a = wide() ? pg - pg % 2 : pg;
    go(el.classList.contains('nb-prev') ? a - step : a + step);
  });
  document.addEventListener('click', e => {
    const mv = e.target.closest && e.target.closest('.nb [data-nbmv]'); if (!mv || !H || !H.own) return;
    const i = order.indexOf(mv.dataset.k), j = i + (+mv.dataset.nbmv); if (i < 0 || j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]]; H.nb.parts.o = { list: order.slice() }; save(); pg = 1; redraw();
    const b = document.querySelector(`.nb [data-nbmv="${mv.dataset.nbmv}"][data-k="${mv.dataset.k}"]`); if (b && !b.disabled) b.focus();
  });
  document.addEventListener('click', e => {
    const d = e.target.closest && e.target.closest('.nb .nb-del'); if (!d || !H || !H.own) return;
    if (!d.dataset.sure) { d.dataset.sure = '1'; d.textContent = '🗑 ' + t('Segur? Toca-ho una altra vegada', 'Sure? Tap again to delete'); setTimeout(() => { if (d.isConnected) { delete d.dataset.sure; d.textContent = '🗑 ' + t('Esborra aquesta secció', 'Delete this section'); } }, 4000); return; }
    delete H.nb.parts[d.dataset.sid]; order = order.filter(k => k !== d.dataset.sid); H.nb.parts.o = { list: order.slice() }; save(); pg = 1; redraw();
  });
  document.addEventListener('submit', e => {
    const f = e.target.closest && e.target.closest('.nb .nb-add'); if (!f || !H || !H.own) return; e.preventDefault();
    const name = f.querySelector('input').value.trim().slice(0, 60); if (!name) { f.querySelector('input').focus(); return; }
    const k = 's' + Date.now().toString(36), day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    H.nb.parts[k] = { topic: name, html: '', text: '', dr: [], day }; order.push(k); H.nb.parts.o = { list: order.slice() }; save(); redraw();
    const i = pages.findIndex(p => p.key === k); if (i >= 0) go(i);
    setTimeout(() => { const ed = document.querySelector(`.nb-padhost[data-sid="${k}"] .pad-ed`); if (ed) ed.focus(); }, 400);
  });
  document.addEventListener('change', e => {
    const x = e.target.closest && e.target.closest('.nb .nb-stitle'); if (!x || !H || !H.own) return;
    const sx = H.nb.parts[x.dataset.sid]; if (!sx) return; sx.topic = x.value.trim().slice(0, 60) || sx.topic; save();
    const p = pg; redraw(); go(p);
  });
  document.addEventListener('keydown', e => {
    if (!document.querySelector('.nb') || location.hash !== '#notes' || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    const b = document.querySelector(e.key === 'ArrowRight' ? '.nb-next' : e.key === 'ArrowLeft' ? '.nb-prev' : null);
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });
  addEventListener('resize', () => { if (document.querySelector('.nb')) show(); });
  return { draw, clean, svg };
})();
