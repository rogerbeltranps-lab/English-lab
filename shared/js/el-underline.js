/* 🖍 Underline (Roger, 25 Nov 2026: "I want students to be able to underline readings when doing activities").
   A button beside Aa Easy reading on every reading text that has it (.reading boxes of the learning paths, study guides, sample exams,
   recall checkpoints and Towards Nativeness; .wx-text of the web exams). Pressing it turns the text into a page to mark, like with a
   pen: drag across the words (mouse or finger, sideways), or tap one word. Four pens: a red underline and three highlighters
   (yellow, green, pink); 🧽 Rubber takes marks away, and tapping a marked word again with the same pen rubs it out too.
   Page text still can't be selected, copied or translated (el-nocopy.js): the marks are drawn by this file, never by a text selection.
   Saved per student and page: localStorage key ulMarks-<page> ({hash of the text: [[start, end, pen], …]}), which el-cloud.js sends
   with the rest of the LS's progress (students/{uid}/progress/{ls}): no new Firestore reads, and the marks come back on another device
   and in the teacher's 👁 student view. Towards Nativeness uses tnUlMarks-<page> (the teacher's own keys start with tn). The web exam
   keeps them in this browser only (el_ul_exam-<uid>-<page>). A text that changes keeps no old marks (its hash changes).
   Loaded by el-easy-read.js, so LS1 (My Real Routine) pages are left as they are. */
(function (root) {
  if (root.ELUnderline) return;
  const doc = document, html = doc.documentElement;
  const BOX = '.reading, .wx-text';
  const SKIP = 'script,style,textarea,input,select,button,.el-ra-bar,.el-er-bar,.el-er-dim,.el-ul-panel';
  const PENS = ['u', 'y', 'g', 'p'];
  const ca = () => /^beginners$/.test(String(root.level || (doc.querySelector('.route.active') || {}).dataset?.level || ''));
  const T = {
    btn: ['🖍 Subratlla', '🖍 Underline'],
    tip: ['Arrossega per sobre de les paraules o toca una paraula. Toca-la una altra vegada per esborrar-la.',
      'Drag across the words, or tap one word. Tap it again to rub it out.'],
    u: ['Subratlla', 'Underline'], y: ['Groc', 'Yellow'], g: ['Verd', 'Green'], p: ['Rosa', 'Pink'], x: ['🧽 Goma', '🧽 Rubber'],
    done: ['✓ Fet', '✓ Done'], clear: ['🗑 Esborra-ho tot', '🗑 Clear all'], sure: ['Toca de nou per esborrar-ho tot', 'Tap again to clear all']
  };
  const t = k => T[k][ca() ? 0 : 1];
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };

  // ---- where the marks are kept ----
  const page = location.pathname.replace(/^.*?\/((?:2|4)eso\/.*|lab\/.*)$/, '$1').replace(/\.html$/, '').replace(/[^\w-]+/g, '_') || 'page';
  const exam = !!root.EL_EXAM && /(^|\/)exam\.html$/.test(location.pathname);
  const KEY = exam ? 'el_ul_exam-' + (localStorage.getItem('el_uid') || 'x') + '-' + page
    : (/towards-nativeness/.test(location.pathname) ? 'tnUlMarks-' : 'ulMarks-') + page;
  let mem = null;   // what this page holds (a read-only page, e.g. the 👁 student view, keeps marks for the visit but saves nothing)
  const store = () => {
    if (!mem) { try { mem = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { mem = {}; } }
    return mem;
  };
  const save = () => {
    const o = store();
    for (const h in o) if (!o[h] || !o[h].length) delete o[h];
    const ks = Object.keys(o); while (ks.length > 40) delete o[ks.shift()];   // never more than 40 texts a page
    try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) {}
  };
  // the cloud copy can arrive after the page has drawn (el-cloud.js pull): read it again then
  root.addEventListener('storage', e => { if (e.key === KEY) { mem = null; doc.querySelectorAll('.el-ul-box').forEach(b => { b.__ulHash = ''; }); scan(); } });

  function css() {
    if (doc.getElementById('el-ul-css')) return;
    const st = doc.createElement('style'); st.id = 'el-ul-css';
    const pen = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M4 24l3-8 13-13 5 5-13 13z' fill='%23facc15' stroke='%23854d0e' stroke-width='1.6' stroke-linejoin='round'/%3E%3Cpath d='M4 24l3-8 5 5z' fill='%23854d0e'/%3E%3C/svg%3E\") 3 25, crosshair";
    st.textContent =
      '.el-ul-btn.el-ul-btn.el-ul-btn{font:700 .95rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:0!important;word-spacing:0!important;border:0;border-radius:999px;padding:8px 16px;background:#fff4d6;color:#8a4b00!important;cursor:pointer}' +
      '.el-ul-btn.el-ul-btn.el-ul-btn[aria-pressed="true"]{background:#b45309;color:#fff!important}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel{flex-basis:100%;display:grid;gap:8px;margin:4px 0 2px;padding:12px 14px;border-radius:12px;background:#fffaf0;border:1px solid #f1dcb0;color:#1c2330!important;font:500 .92rem/1.35 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:0!important;word-spacing:0!important;text-align:left}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel[hidden]{display:none!important}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel .el-ul-tip{margin:0;font:inherit!important;letter-spacing:0!important;word-spacing:0!important;line-height:1.35!important;color:#4a3b22!important}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel .el-ul-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button{font:700 .9rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:0!important;border:2px solid transparent;border-radius:999px;padding:7px 14px;cursor:pointer;background:#fff;color:#1c2330!important;box-shadow:0 0 0 1px #e3d3ad inset}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-pen[aria-pressed="true"]{border-color:#1c2330;box-shadow:none}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-pen-u span{text-decoration:underline 3px #e11d48;text-underline-offset:3px}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-pen-y{background:#fde68a}.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-pen-g{background:#bbf7d0}.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-pen-p{background:#fbcfe8}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-done{margin-left:auto;background:#b45309;color:#fff!important;box-shadow:none}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-clear{background:#fff;color:#9a3412!important}.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-clear.sure{background:#9a3412;color:#fff!important}' +
      // always usable, even on a read-only page or section (el-cloud.js freeze, el-sec-off: pointer-events:none around it)
      '.el-ul-btn,.el-ul-panel,.el-ul-panel *,.el-ul-box.el-ul-on{pointer-events:auto!important}' +
      // the text while the pen is on: a pen cursor, no page scroll from a sideways drag, no phone pop-up
      '.el-ul-box.el-ul-on{cursor:' + pen + ';touch-action:pan-y;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;outline:2px dashed #f0b44c;outline-offset:3px}' +
      '.el-ul-box.el-ul-on :is(.el-ra-bar,.el-er-bar){cursor:auto}' +
      // the marks
      'mark.el-ul{background:none;color:inherit;padding:0;margin:0;border-radius:3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}' +
      'mark.el-ul-u{text-decoration:underline 3px #e11d48!important;text-decoration-skip-ink:none;text-underline-offset:.18em}' +
      'mark.el-ul-y{background:#fde047}mark.el-ul-g{background:#86efac}mark.el-ul-p{background:#f9a8d4}' +
      'mark.el-ul.el-ul-try{opacity:.75}' +
      // dark text on a highlighter, also at night in Towards Nativeness and with the coloured letters of Easy reading
      'html.tn-dark mark.el-ul:not(.el-ul-u),html.tn-dark mark.el-ul:not(.el-ul-u) *{color:#111!important}' +
      'html.tn-dark mark.el-ul-u{text-decoration-color:#fb7185!important}' +
      'html.tn-dark mark.el-ul:not(.el-ul-u) .el-er-b{color:#1f5fd1!important}html.tn-dark mark.el-ul:not(.el-ul-u) .el-er-d{color:#c2410c!important}' +
      'html.tn-dark mark.el-ul:not(.el-ul-u) .el-er-p{color:#15803d!important}html.tn-dark mark.el-ul:not(.el-ul-u) .el-er-q{color:#8a2bc9!important}' +
      '.el-ul-btn,.el-ul-panel button{-webkit-tap-highlight-color:transparent}' +
      // on a phone the pens float at the bottom of the screen while marking, so the text stays where it is and the pens are always at hand
      '@media (max-width:640px){.el-ul-panel.el-ul-panel.el-ul-panel{position:fixed;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);z-index:2147483000;margin:0;padding:10px 10px 8px;gap:6px;box-shadow:0 10px 30px rgba(28,35,48,.28)}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel .el-ul-tip{font-size:.8rem!important}.el-ul-panel.el-ul-panel.el-ul-panel button.el-ul-done{margin-left:0}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel .el-ul-row{gap:6px}' +
      '.el-ul-panel.el-ul-panel.el-ul-panel button{padding:7px 10px;font-size:.84rem!important;flex:none}}' +
      '@media print{.el-ul-btn,.el-ul-panel{display:none!important}}';
    doc.head.appendChild(st);
  }

  // ---- the text of a box: its text nodes (not the bars, buttons or answer boxes) and their place in the whole text ----
  function textMap(box) {
    const nodes = []; let text = '';
    const w = doc.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && n.parentElement.closest(SKIP) && box.contains(n.parentElement.closest(SKIP)) ? 2 : 1 });
    let n; while ((n = w.nextNode())) { nodes.push({ n, s: text.length }); text += n.nodeValue; }
    return { nodes, text };
  }
  function at(m, off, end) {   // the text node and offset of a place in the whole text
    for (let i = 0; i < m.nodes.length; i++) {
      const x = m.nodes[i], len = x.n.nodeValue.length;
      if (off < x.s + len || (end && off === x.s + len)) return [x.n, off - x.s];
    }
    const l = m.nodes[m.nodes.length - 1]; return l ? [l.n, l.n.nodeValue.length] : null;
  }
  const WORD = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
  function words(box) {
    const m = textMap(box), out = [], r = doc.createRange();
    let x; WORD.lastIndex = 0;
    while ((x = WORD.exec(m.text))) {
      const s = x.index, e = s + x[0].length, a = at(m, s), b = at(m, e, true); if (!a || !b) continue;
      try { r.setStart(a[0], a[1]); r.setEnd(b[0], b[1]); } catch (er) { continue; }
      const rs = [...r.getClientRects()].filter(q => q.width > 0 && q.height > 0);
      if (rs.length) out.push({ s, e, rs });
    }
    return out;
  }
  // the word under the pointer; while dragging, the nearest one on that line (or the nearest line)
  function hit(W, x, y, loose) {
    let best = -1, bd = Infinity;
    for (let i = 0; i < W.length; i++) for (const q of W[i].rs) {
      const inY = y >= q.top - 2 && y <= q.bottom + 2, inX = x >= q.left - 2 && x <= q.right + 2;
      if (inY && inX) return i;
      if (!loose) continue;
      const dy = inY ? 0 : Math.min(Math.abs(y - q.top), Math.abs(y - q.bottom)), dx = inX ? 0 : Math.min(Math.abs(x - q.left), Math.abs(x - q.right));
      const d = dy * 4 + dx; if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  // ---- marks: a sorted list of [start, end, pen] that never overlap ----
  function cut(list, s, e) {
    const out = [];
    for (const m of list) {
      if (m[1] <= s || m[0] >= e) { out.push(m); continue; }
      if (m[0] < s) out.push([m[0], s, m[2]]);
      if (m[1] > e) out.push([e, m[1], m[2]]);
    }
    return out;
  }
  function add(list, s, e, c) { return cut(list, s, e).concat([[s, e, c]]); }
  // tidy: no mark starts or ends with a space, and marks of one pen with only spaces between them become one
  function tidy(list, text) {
    const m = [];
    list.map(x => { let [s, e, c] = x; while (s < e && /\s/.test(text[s])) s++; while (e > s && /\s/.test(text[e - 1])) e--; return [s, e, c]; })
      .filter(x => x[1] > x[0]).sort((a, b) => a[0] - b[0])
      .forEach(x => { const l = m[m.length - 1]; if (l && l[2] === x[2] && !text.slice(l[1], x[0]).trim()) l[1] = Math.max(l[1], x[1]); else m.push(x.slice()); });
    return m;
  }

  // ---- drawing them ----
  let mine = false;
  function unwrap(box) {
    const ps = new Set();
    box.querySelectorAll('mark.el-ul').forEach(k => { const p = k.parentNode; while (k.firstChild) p.insertBefore(k.firstChild, k); p.removeChild(k); ps.add(p); });
    ps.forEach(p => p.normalize && p.normalize());
  }
  function draw(box, list, tryMark) {
    mine = true;
    try {
      unwrap(box);
      const m = textMap(box);
      const all = tidy(tryMark ? (tryMark[2] === 'x' ? cut(list, tryMark[0], tryMark[1]) : add(list, tryMark[0], tryMark[1], tryMark[2])) : list, m.text);
      if (!all.length) return;
      m.nodes.forEach(({ n, s: ns }) => {
        const v = n.nodeValue, ne = ns + v.length;
        if (!v.trim()) return;   // the spaces between paragraphs
        const segs = all.filter(k => k[0] < ne && k[1] > ns).map(k => [Math.max(k[0], ns) - ns, Math.min(k[1], ne) - ns, k[2]]).sort((a, b) => b[0] - a[0]);
        segs.forEach(([a, b, c]) => {
          if (b < n.nodeValue.length) n.splitText(b);
          const mid = a > 0 ? n.splitText(a) : n;
          const k = doc.createElement('mark'); k.className = 'el-ul el-ul-' + c + (tryMark ? ' el-ul-try' : '');
          mid.parentNode.insertBefore(k, mid); k.appendChild(mid);
        });
      });
    } finally { obs && obs.takeRecords(); mine = false; }
  }

  // ---- the pen ----
  let pen = 'y';
  try { const p = localStorage.getItem('el_ul_pen'); if (PENS.concat('x').includes(p)) pen = p; } catch (e) {}
  function setPen(p) { pen = p; try { localStorage.setItem('el_ul_pen', p); } catch (e) {} doc.querySelectorAll('.el-ul-panel .el-ul-pen').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pen === p))); }
  // the same text twice on a page (a Reading log shows the Reading tab's text again): marks made on one show on the other at once
  function twins(box, list) { doc.querySelectorAll('.el-ul-box').forEach(b => { if (b !== box && b.__ulHash === box.__ulHash) draw(b, list); }); }
  function onBox(box) {
    let g = null, W = null, raf = 0;
    const list = () => store()[box.__ulHash] || [];
    const range = () => { const a = W[g.a], b = W[g.b]; return [Math.min(a.s, b.s), Math.max(a.e, b.e)]; };
    box.addEventListener('pointerdown', e => {
      if (!box.classList.contains('el-ul-on') || e.button > 0 || !e.isPrimary) return;
      if (e.target.closest && e.target.closest('.el-ra-bar,.el-er-bar,.el-ul-panel,button,input,textarea,select,a,label')) return;
      W = words(box); const i = hit(W, e.clientX, e.clientY, false); if (i < 0) return;
      e.preventDefault();
      g = { a: i, b: i, moved: false, id: e.pointerId };
      try { box.setPointerCapture(e.pointerId); } catch (er) {}
      const [s, en] = range(); draw(box, list(), [s, en, pen]);
    });
    box.addEventListener('pointermove', e => {
      if (!g || e.pointerId !== g.id) return;
      const i = hit(W, e.clientX, e.clientY, true); if (i < 0 || i === g.b) return;
      g.b = i; g.moved = true;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!g) return; const [s, en] = range(); draw(box, list(), [s, en, pen]); });
    });
    const end = (e, ok) => {
      if (!g || e.pointerId !== g.id) return;
      cancelAnimationFrame(raf);
      const [s, en] = range(), o = store(), cur = list();
      let next;
      if (!ok) next = cur;
      else if (pen === 'x') next = cut(cur, s, en);
      // a tap on a word already marked with this pen rubs it out
      else if (!g.moved && cur.some(k => k[2] === pen && k[0] <= s && k[1] >= en)) next = cut(cur, s, en);
      else next = add(cur, s, en, pen);
      g = null; W = null;
      if (ok) { o[box.__ulHash] = tidy(next, textMap(box).text); save(); next = o[box.__ulHash]; }
      draw(box, next); if (ok) twins(box, next);
    };
    box.addEventListener('pointerup', e => end(e, true));
    box.addEventListener('pointercancel', e => end(e, false));   // the page scrolled instead (an up or down swipe on a phone)
  }

  // Read-only pages and sections disable every button in them (el-cloud.js freeze, el-sec-off, el-sec-cls): marking only
  // changes how the text looks, so its controls are given back (as Aa Easy reading's).
  function guard(el) {
    const fix = () => {
      if (el.disabled) el.disabled = false;
      if (el.tabIndex < 0) el.tabIndex = 0;
      if (el.style.pointerEvents) el.style.pointerEvents = '';
      if (el.dataset.elro) delete el.dataset.elro;
      if (el.dataset.elcls) delete el.dataset.elcls;
    };
    fix();
    new MutationObserver(fix).observe(el, { attributes: true, attributeFilter: ['disabled', 'style', 'tabindex', 'data-elro', 'data-elcls'] });
  }
  function panel(box, btn) {
    const p = doc.createElement('div'); p.className = 'el-ul-panel'; p.hidden = true;
    p.innerHTML = '<div class="el-ul-tip">' + t('tip') + '</div><div class="el-ul-row">' +
      PENS.map(k => '<button type="button" class="el-ul-pen el-ul-pen-' + k + '" data-pen="' + k + '" aria-pressed="' + (pen === k) + '"><span>' + t(k) + '</span></button>').join('') +
      '<button type="button" class="el-ul-pen el-ul-pen-x" data-pen="x" aria-pressed="' + (pen === 'x') + '">' + t('x') + '</button>' +
      '<button type="button" class="el-ul-done">' + t('done') + '</button><button type="button" class="el-ul-clear">' + t('clear') + '</button></div>';
    p.querySelectorAll('.el-ul-pen').forEach(b => { b.onclick = () => setPen(b.dataset.pen); });
    const close = () => { p.hidden = true; box.classList.remove('el-ul-on'); btn.setAttribute('aria-pressed', 'false'); };
    p.querySelector('.el-ul-done').onclick = close;
    const clr = p.querySelector('.el-ul-clear'); let sure = 0;
    clr.onclick = () => {
      if (!sure) { clr.classList.add('sure'); clr.textContent = t('sure'); sure = setTimeout(() => { sure = 0; clr.classList.remove('sure'); clr.textContent = t('clear'); }, 3000); return; }
      clearTimeout(sure); sure = 0; clr.classList.remove('sure'); clr.textContent = t('clear');
      delete store()[box.__ulHash]; save(); draw(box, []); twins(box, []);
    };
    p.querySelectorAll('button').forEach(guard);
    p.__close = close;
    return p;
  }

  function attach(box) {
    const er = box.querySelector(':scope > .el-ra-bar > .el-er-btn, :scope > .el-er-bar > .el-er-btn');
    if (!er) return;   // Aa Easy reading puts its bar first; the pen goes beside it
    if (!box.classList.contains('el-ul-box')) { box.classList.add('el-ul-box'); onBox(box); }
    let u = box.__ul;
    if (!u) {
      const btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'el-ul-btn'; btn.textContent = t('btn'); btn.setAttribute('aria-pressed', 'false');
      guard(btn);
      const pn = panel(box, btn);
      btn.onclick = () => { if (pn.hidden) { pn.hidden = false; box.classList.add('el-ul-on'); btn.setAttribute('aria-pressed', 'true'); } else pn.__close(); };
      u = box.__ul = { btn, pn };
    }
    // beside the Aa button, wherever it is (its own bar first, then the 🔊 Listen bar when the recording appears)
    const bar = er.parentNode;
    if (u.btn.previousElementSibling !== er) bar.insertBefore(u.btn, er.nextSibling);
    if (u.pn.parentNode !== bar || bar.lastElementChild !== u.pn) bar.appendChild(u.pn);
    // the marks: drawn again when the text was drawn again (another route, the notebook look…) or changed
    const h = fnv(textMap(box).text), list = store()[h] || [];
    if (box.__ulHash !== h) { box.__ulHash = h; draw(box, list); }
    else if (list.length && !box.querySelector('mark.el-ul')) draw(box, list);
  }

  let timer = 0, obs = null;
  function scan() {
    clearTimeout(timer);
    timer = setTimeout(() => { mine = true; try { doc.querySelectorAll(BOX).forEach(attach); } finally { obs && obs.takeRecords(); mine = false; } }, 150);
  }
  root.ELUnderline = { scan };
  css();
  const go = () => { scan(); obs = new MutationObserver(() => { if (!mine) scan(); }); obs.observe(doc.body, { childList: true, subtree: true }); };
  if (doc.body) go(); else doc.addEventListener('DOMContentLoaded', go);
})(window);
