// ✍ The handwriting page (Roger, 13 Nov 2026: "when they take notes it looks like hand writing and they can underline, highlight, etc."):
// a lined page where the student types in handwriting (Caveat, blue pen), with pens (blue, black, red, green), highlighters (yellow, green,
// pink), underline, wavy underline, circle, box, 🧽 take the marks off and ↶ undo. Used by the whiteboard
// students see while the teacher explains (el-whiteboard.js) and by the sections students add to 📓 My notebook (el-notebook.js).
// What it gives back: html (only the notebook's own marks, as nb-* classes; nothing else survives clean()), text (plain, for older views)
// and dr (drawings: ["b|x,y x,y …"] in a 460-wide box). Styles: shared/css/el-notebook.css.
const KEEP = new Set(['nb-pen-b', 'nb-pen-k', 'nb-pen-r', 'nb-pen-g', 'nb-hl-y', 'nb-hl-g', 'nb-hl-p', 'nb-ul', 'nb-ulw', 'nb-circ', 'nb-boxd', 'nb-cp']);
const PENS = [['b', '#1f4fb5', 'Blue pen', 'Boli blau'], ['k', '#23262b', 'Black pen', 'Boli negre'], ['r', '#d32f2f', 'Red pen', 'Boli vermell'], ['g', '#2e7d32', 'Green pen', 'Boli verd']];
const INK = Object.fromEntries(PENS.map(p => [p[0], p[1]]));
const hex2rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',') + ')';
const PEN_OF = {}; PENS.forEach(([k, h]) => { PEN_OF[h] = PEN_OF[hex2rgb(h)] = 'nb-pen-' + k; });
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function css() {
  if (document.getElementById('el-nb-css')) return;
  const l = document.createElement('link'); l.id = 'el-nb-css'; l.rel = 'stylesheet'; l.href = new URL('../css/el-notebook.css', import.meta.url).href; document.head.append(l);
}
export function clean(h) {
  let n = 0;
  const box = new DOMParser().parseFromString('<div>' + String(h || '') + '</div>', 'text/html').body.firstChild;
  const out = node => {
    if (++n > 8000) return '';
    if (node.nodeType === 3) return esc(node.nodeValue);
    if (node.nodeType !== 1) return '';
    const tag = node.tagName;
    if (tag === 'BR') return '<br>';
    if (/^(SCRIPT|STYLE|TEMPLATE|IFRAME|OBJECT|SVG|MATH|CANVAS|BUTTON)$/.test(tag)) return '';
    const inner = [...node.childNodes].map(out).join('');
    if (tag === 'DIV' || tag === 'P') return '<div>' + inner + '</div>';
    const cls = [...node.classList].filter(c => KEEP.has(c));
    const col = String((node.style && node.style.color) || node.getAttribute('color') || '').replace(/\s/g, '').toLowerCase();
    if (PEN_OF[col] && !cls.some(c => /^nb-pen-/.test(c))) cls.push(PEN_OF[col]);
    return cls.length && node.textContent ? `<span class="${cls.join(' ')}">${inner}</span>` : inner;
  };
  return box ? [...box.childNodes].map(out).join('') : '';
}
export function svg(dr, cls) {
  const st = (Array.isArray(dr) ? dr : []).map(s => { const [c, p] = String(s).split('|'); return { c: INK[c] || INK.b, p: String(p || '').split(' ').map(x => x.split(',').map(Number)).filter(x => x.length === 2 && x.every(Number.isFinite)) }; }).filter(s => s.p.length > 1);
  if (!st.length) return '';
  const h = Math.max(...st.flatMap(s => s.p.map(p => p[1]))) + 20;
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 460 ${h}" style="aspect-ratio:460/${h};height:auto" aria-hidden="true">${st.map(s => `<polyline points="${s.p.map(p => p.join(',')).join(' ')}" fill="none" stroke="${s.c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
}
const txt2html = t => String(t || '').split('\n').map(l => '<div>' + (esc(l) || '<br>') + '</div>').join('');

// host: an element on lined paper (.nb-paper). o: {html, text, dr, ca, readOnly, onChange(v), ph}
export function pad(host, o) {
  css();
  const T = (c, e) => o.ca ? c : e;
  let dr = Array.isArray(o.dr) ? o.dr.slice() : [], pen = 'b', hist = [], typing = false;
  host.innerHTML = (o.readOnly ? '' : `<div class="pad-tools" role="toolbar" aria-label="${T('Bolis i marques', 'Pens and marks')}">
      <div class="pad-g">${PENS.map(([k, h, en, ca], i) => `<button type="button" class="pad-tb pad-pen" data-pen="${k}" aria-pressed="${i === 0}" title="${T(ca, en)}"><span class="pad-dot" style="background:${h}"></span></button>`).join('')}</div>
      <div class="pad-g"><button type="button" class="pad-tb pad-mk" data-k="nb-hl-y" title="${T('Subratllador groc', 'Yellow highlighter')}"><span class="pad-hlb" style="background:var(--nb-hl-y)"></span></button><button type="button" class="pad-tb pad-mk" data-k="nb-hl-g" title="${T('Subratllador verd', 'Green highlighter')}"><span class="pad-hlb" style="background:var(--nb-hl-g)"></span></button><button type="button" class="pad-tb pad-mk" data-k="nb-hl-p" title="${T('Subratllador rosa', 'Pink highlighter')}"><span class="pad-hlb" style="background:var(--nb-hl-p)"></span></button></div>
      <div class="pad-g"><button type="button" class="pad-tb pad-mk" data-k="nb-ul" title="${T('Subratlla', 'Underline')}"><span class="nb-ul pad-l">U</span></button><button type="button" class="pad-tb pad-mk" data-k="nb-ulw" title="${T('Subratlla ondulat', 'Wavy underline')}"><span class="nb-ulw pad-l">W</span></button><button type="button" class="pad-tb pad-mk" data-k="nb-circ" title="${T('Encercla', 'Circle')}"><span class="nb-circ pad-l" style="font-size:16px">o</span></button><button type="button" class="pad-tb pad-mk" data-k="nb-boxd" title="${T('Requadre', 'Box')}"><span class="nb-boxd pad-l" style="font-size:16px">b</span></button></div>
      <div class="pad-g"><button type="button" class="pad-tb pad-clean" title="${T('Treu les marques de les paraules triades', 'Take the marks off the selected words')}">🧽</button><button type="button" class="pad-tb pad-undo" title="${T('Desfés', 'Undo')}">↶</button></div>
    </div>`) + `<div class="nb-notes pad-notes"><div class="pad-ed" ${o.readOnly ? '' : 'contenteditable="true"'} spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off" translate="no" data-ph="${esc(o.ph || T('Escriu aquí els teus apunts…', 'Write your notes here…'))}" aria-label="${T('Els teus apunts', 'Your notes')}"></div><canvas class="pad-cv"></canvas></div>`;
  const ed = host.querySelector('.pad-ed'), box = host.querySelector('.pad-notes'), cv = host.querySelector('.pad-cv'), ctx = cv.getContext('2d');
  ed.innerHTML = o.html ? clean(o.html) : o.text ? txt2html(o.text) : '';
  const art = () => { const old = box.querySelector('svg.pad-svg'); if (old) old.remove(); const s = svg(dr, 'pad-svg'); if (s) box.insertAdjacentHTML('beforeend', s); };
  art();
  const get = () => ({ html: clean(ed.innerHTML), text: ed.innerText.replace(/\n{3,}/g, '\n\n').trim().slice(0, 3000), dr: dr.slice() });
  let tm = 0; const changed = () => { clearTimeout(tm); tm = setTimeout(() => o.onChange && o.onChange(get()), 60); };
  const snap = () => { hist.push({ h: ed.innerHTML, d: dr.slice() }); if (hist.length > 60) hist.shift(); };
  let hintT; const hint = s => { let h = document.getElementById('pad-hint'); if (!h) { h = document.createElement('div'); h.id = 'pad-hint'; document.body.append(h); } h.textContent = s; h.classList.add('on'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.remove('on'), 2600); };
  if (o.readOnly) return { get, ed, destroy() {} };
  // typing: the letters take the pen chosen, and a word typed right after a mark (a highlight, a circle, a copied box) is not marked too
  const MARK = '.nb-hl-y,.nb-hl-g,.nb-hl-p,.nb-ul,.nb-ulw,.nb-circ,.nb-boxd,.nb-cp';
  ed.addEventListener('beforeinput', e => {
    if (!typing) { snap(); typing = true; setTimeout(() => { typing = false; }, 1500); }
    if (e.inputType !== 'insertText' || !e.data) return;
    const s = getSelection(); if (!s.rangeCount) return; const r = s.getRangeAt(0); if (!r.collapsed || !ed.contains(r.startContainer)) return;
    const el = r.startContainer.nodeType === 3 ? r.startContainer.parentElement : r.startContainer;
    const mark = el.closest(MARK); let atEnd = false;
    if (mark && ed.contains(mark)) { const rr = document.createRange(); rr.selectNodeContents(mark); rr.setStart(r.startContainer, r.startOffset); atEnd = rr.toString() === ''; }
    const pe = el.closest('[class*="nb-pen-"]'), cur = pe && ed.contains(pe) ? [...pe.classList].find(c => c.startsWith('nb-pen-')) : 'nb-pen-b', want = 'nb-pen-' + pen;
    if (!atEnd && cur === want) return;
    e.preventDefault();
    const sp = document.createElement('span'); sp.className = want; sp.textContent = e.data;
    if (atEnd) mark.after(sp); else r.insertNode(sp);
    const nr = document.createRange(); nr.setStart(sp.firstChild, sp.firstChild.length); nr.collapse(true); s.removeAllRanges(); s.addRange(nr); changed();
  });
  ed.addEventListener('input', e => { if (e.inputType === 'insertParagraph') ed.querySelectorAll(MARK).forEach(x => { if (!x.textContent) x.replaceWith(...x.childNodes); }); changed(); });
  // paste: plain text only, and only as much as the page can hold
  ed.addEventListener('paste', e => { e.preventDefault(); const s = ((e.clipboardData && e.clipboardData.getData('text/plain')) || '').slice(0, 2000); if (s) { snap(); document.execCommand('insertText', false, s); } });
  ed.addEventListener('drop', e => e.preventDefault());
  const selIn = () => { const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return null; const r = s.getRangeAt(0); return ed.contains(r.commonAncestorContainer) ? r : null; };
  host.querySelectorAll('.pad-tools button').forEach(b => b.addEventListener('mousedown', e => e.preventDefault()));
  host.querySelectorAll('.pad-pen').forEach(b => b.addEventListener('click', () => {
    pen = b.dataset.pen; host.querySelectorAll('.pad-pen').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const r = selIn(); if (!r) { ed.focus(); return; }
    snap(); const f = r.extractContents(); f.querySelectorAll('[class*="nb-pen-"]').forEach(x => x.classList.remove(...[...x.classList].filter(c => c.startsWith('nb-pen-'))));
    const sp = document.createElement('span'); sp.className = 'nb-pen-' + pen; sp.appendChild(f); r.insertNode(sp); getSelection().removeAllRanges(); changed();
  }));
  host.querySelectorAll('.pad-mk').forEach(b => b.addEventListener('click', () => {
    const r = selIn(); if (!r) return hint(T('Primer tria unes paraules i després toca la marca.', 'Select some words first, then tap the mark.'));
    snap(); const sp = document.createElement('span'); sp.className = b.dataset.k; sp.appendChild(r.extractContents()); r.insertNode(sp); getSelection().removeAllRanges(); changed();
  }));
  host.querySelector('.pad-clean').addEventListener('click', () => {
    const r = selIn(); if (!r) return hint(T('Tria les paraules que vols netejar.', 'Select the words you want to clean.')); snap();
    [...ed.querySelectorAll('span')].filter(s => r.intersectsNode(s) && [...s.classList].some(c => /^nb-(hl|ul|circ|boxd)/.test(c))).forEach(s => s.replaceWith(...s.childNodes)); changed();
  });
  host.querySelector('.pad-undo').addEventListener('click', () => { const h = hist.pop(); if (!h) return hint(T('No hi ha res per desfer.', 'Nothing to undo.')); ed.innerHTML = h.h; dr = h.d; art(); changed(); });
  // ✏️ draw
  const size = () => { const w = box.clientWidth || 460, h = Math.max(box.scrollHeight, ed.scrollHeight) + 240, k = devicePixelRatio || 1; cv.width = w * k; cv.height = h * k; cv.style.width = w + 'px'; cv.style.height = h + 'px'; ctx.setTransform(k * w / 460, 0, 0, k * w / 460, 0, 0); };
  const dbtn = host.querySelector('.pad-draw');
  // Roger, 13 Nov 2026: "don't add the draw feature since it doesn't draw well": no ✏️ button; old drawings still show
  if (dbtn) dbtn.addEventListener('click', () => { const on = host.classList.toggle('pad-drawing'); dbtn.setAttribute('aria-pressed', String(on)); if (on) { size(); hint(T('Dibuixa fletxes o un dibuix. Torna a tocar ✏️ per escriure.', 'Draw arrows or a picture. Tap ✏️ again to write.')); } });
  let st = null;
  const pt = e => { const r = cv.getBoundingClientRect(), s = 460 / r.width; return [Math.round((e.clientX - r.left) * s), Math.round((e.clientY - r.top) * s)]; };
  cv.addEventListener('pointerdown', e => { if (dr.length >= 300) return hint(T('La pàgina ja té molts dibuixos.', 'This page already has a lot of drawings.')); cv.setPointerCapture(e.pointerId); snap(); st = [pt(e)]; });
  cv.addEventListener('pointermove', e => {
    if (!st || st.length > 600) return; const p = pt(e), l = st[st.length - 1]; if (Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) < 2) return; st.push(p);
    ctx.strokeStyle = INK[pen]; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
  });
  const up = () => { if (!st) return; if (st.length > 1) { dr.push(pen + '|' + st.map(p => p.join(',')).join(' ')); art(); changed(); } else hist.pop(); st = null; ctx.clearRect(0, 0, cv.width, cv.height); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  return {
    get, ed,
    // ⤵ a line copied from the board, in black pen, at the end
    add(text) {
      snap(); const d = document.createElement('div'); d.innerHTML = `<span class="nb-cp">${esc(text).replace(/\n+/g, '<br>')}</span>`;
      const last = ed.lastElementChild; if (last && last.innerHTML === '<br>') last.before(d); else ed.append(d, Object.assign(document.createElement('div'), { innerHTML: '<br>' }));
      changed();
    },
    set(v) { if (document.activeElement === ed) return; ed.innerHTML = v.html ? clean(v.html) : v.text ? txt2html(v.text) : ''; dr = Array.isArray(v.dr) ? v.dr.slice() : []; art(); },
    destroy() { clearTimeout(tm); }
  };
}
