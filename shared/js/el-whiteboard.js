// 📘 📖 The whiteboard (Roger, 13 Nov 2026: "when doing an activity together, and I'm explaining theory I want students to only see a
// whiteboard and that when they take notes it looks like hand writing and they can underline, highlight, etc. this notes appear in their
// notes", and "when doing theory like grammar or whatever, they must only see their notes"). While the teacher explains together
// (📘 Grammar together or 📖 Read together, live/{group}.rt, el-cloud.js), the student's Chromebook shows only this screen, over the page:
// the board on the left (the boxes or the text the projector shows, the one being explained marked with a red arrow; in Read together ⤵
// copies a part into the notes) and the handwriting page on the right (el-pad.js). It closes by itself when the teacher goes on to ⏱ Your turn or leaves.
// el-cloud.js saves the page in the student's notes (📓 My notebook on the LS page shows it). Nothing here reads or writes Firestore.
// No copying the theory (Roger, 19 Nov 2026: "when students are taking notes when we [work] together in class, I don't want them to be
// able to copy the theory, since if they do, they have the information doubled in their notebooks" + "remind them that in their notes
// they can write examples, or just important things to remember and that it's optional"): 📓 My notebook already shows every grammar box,
// so the grammar boards have no ⤵ copy button (Read together keeps it: the notebook doesn't keep the reading text), a slip above the page
// says notes are optional (examples, things to remember), and if a student types 7 words in a row that are on the board, a tip says it is
// already in the notebook (typing is never stopped). Ctrl+C / paste from the board were already blocked (el-nocopy.js).
import { pad, css } from './el-pad.js';
let root = null, P = null, sig = '', o = {}, grams = new Set(), nudged = 0;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const T = (c, e) => o.ca ? c : e;
function items() {
  const inn = root && root.querySelector('.wb-in'); if (!inn) return [];
  return o.kind === 'grammar' ? [...inn.querySelectorAll('.model')] : [...inn.children].filter(e => !e.classList.contains('tiny'));
}
// o: {kind: 'grammar' | 'reading', title, head, html, k, n, chat, ca, saved: {html, text, dr}, onChange(v)}
export function render(x) {
  o = x; css();
  if (!root) {
    root = document.createElement('div'); root.id = 'el-wb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = `<div class="wb-top"><b class="wb-h"></b><span class="s wb-step"></span><span class="sp"></span><span class="wb-saved"></span></div>
      <div class="wb-main"><div class="wb-board"><div class="wb-scroll"><h2 class="wb-title"></h2><div class="wb-in"></div></div></div>
      <div class="wb-np"><p class="wb-remind" style="margin:0 0 8px;padding:7px 12px;background:#fff7c2;border:1px solid #f0dc7a;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,.1);font:500 14px/1.35 var(--nb-sans,system-ui,sans-serif);color:#3d3a1f;transition:background .3s"></p><div class="wb-sheet"><div class="nb-paper"></div></div><div class="wb-foot"><span class="wb-tip"></span></div></div></div>`;
    document.body.append(root); document.documentElement.classList.add('el-wb-on');
    P = pad(root.querySelector('.nb-paper'), { html: o.saved && o.saved.html, text: o.saved && o.saved.text, dr: o.saved && o.saved.dr, ca: o.ca, ph: T('Exemples teus o coses importants per recordar… (opcional)', 'Your own examples or important things to remember… (optional)'), onChange: v => { copied(v); o.onChange && o.onChange(v); } });
    root.querySelector('.nb-paper').insertAdjacentHTML('afterbegin', '');
    const ed = P.ed; setTimeout(() => { try { ed.focus({ preventScroll: true }); } catch (e) {} }, 300);
  }
  root.querySelector('.wb-h').textContent = (o.kind === 'grammar' ? '📘 ' + T('Aprenem junts', 'Learning together') : '📖 ' + T('Llegim junts', 'Reading together')) + (o.head ? ' · ' + o.head : '');
  root.querySelector('.wb-title').textContent = o.title || '';
  const gr = o.kind === 'grammar';
  root.querySelector('.wb-remind').textContent = gr
    ? T('📓 La teoria ja és a la teva llibreta: no la copiïs. Aquí pots escriure exemples teus o només les coses importants per recordar. És opcional.', '📓 The theory is already in your notebook: don\'t copy it. Here you can write your own examples or just the important things to remember. It\'s optional.')
    : T('Aquí pots escriure exemples teus o només les coses importants per recordar. És opcional.', 'Here you can write your own examples or just the important things to remember. It\'s optional.');
  root.querySelector('.wb-tip').textContent = gr
    ? T('Tria paraules i toca un subratllador o una marca. Tot va a 📓 La meva llibreta.', 'Select words, then tap a highlighter or a mark. Everything goes into 📓 My notebook.')
    : T('Tria paraules i toca un subratllador o una marca. ⤵ copia una part del text. Tot va a 📓 La meva llibreta.', 'Select words, then tap a highlighter or a mark. ⤵ copies a part of the text. Everything goes into 📓 My notebook.');
  const s = o.kind + '|' + (o.ca ? 1 : 0) + '|' + String(o.html || '').length + '|' + String(o.html || '').slice(0, 120);
  if (s !== sig) {
    sig = s; const inn = root.querySelector('.wb-in'); inn.innerHTML = o.html || '';
    inn.querySelectorAll('script,iframe,audio,video,input,textarea,select,button').forEach(e => e.remove());
    grams = o.kind === 'grammar' ? ngrams(inn.innerText) : new Set();
    items().forEach(el => {
      el.classList.add('wb-it');
      if (o.kind === 'grammar') return;   // the grammar is already in 📓 My notebook: nothing to copy
      const b = document.createElement('button'); b.type = 'button'; b.className = 'wb-copy'; b.textContent = '⤵ ' + T('Copia als apunts', 'Copy to my notes');
      b.addEventListener('click', () => { const c = el.cloneNode(true); c.querySelectorAll('.wb-copy').forEach(x => x.remove()); if (o.kind === 'grammar') { const l = c.querySelector('span'); if (l && l === c.firstElementChild && l.textContent.length < 30) l.remove(); }
        c.querySelectorAll('table').forEach(t => t.replaceWith([...t.rows].map(r => [...r.cells].map(x => x.textContent.trim()).join(' · ')).join('\n')));
        P.add(c.innerText.replace(/\s*\n\s*/g, '\n').trim()); status(T('Copiat als teus apunts ✓', 'Copied into your notes ✓')); });
      el.append(b);
    });
  }
  mark(o.k);
  return root;
}
// 7 words in a row that are also on the board = copying the theory: a tip, at most every 20 s (the notes stay as they are)
const N = 7;
const words = t => String(t || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-zà-ÿ0-9']+/g, ' ').trim().split(' ').filter(Boolean);
function ngrams(t) { const w = words(t), g = new Set(); for (let i = 0; i + N <= w.length; i++) g.add(w.slice(i, i + N).join(' ')); return g; }
function copied(v) {
  if (!grams.size || !root || Date.now() - nudged < 20e3) return;
  const w = words(v && v.text); let hit = false;
  for (let i = 0; i + N <= w.length && !hit; i++) hit = grams.has(w.slice(i, i + N).join(' '));
  if (!hit) return;
  nudged = Date.now();
  const r = root.querySelector('.wb-remind'); r.style.background = '#ffd8d2'; setTimeout(() => { if (r.isConnected) r.style.background = '#fff7c2'; }, 2500);
  let h = document.getElementById('pad-hint'); if (!h) { h = document.createElement('div'); h.id = 'pad-hint'; document.body.append(h); }
  h.textContent = T('📓 Això ja és a la teva llibreta: no cal copiar-ho. Escriu-hi un exemple teu.', '📓 This is already in your notebook: no need to copy it. Write an example of your own.');
  h.classList.add('on'); clearTimeout(h._t); h._t = setTimeout(() => h.classList.remove('on'), 5000);
}
function mark(k) {
  const it = items(), inn = root.querySelector('.wb-in'); it.forEach(e => e.classList.remove('wb-now', 'wb-seen'));
  const n = it.length; inn.classList.toggle('all', !(k >= 0));
  if (!(k >= 0) || !n) { root.querySelector('.wb-step').textContent = T('El professor comença a explicar', 'Your teacher is about to explain'); return; }
  const i = o.chat && n !== o.n ? Math.round(k * (n - 1) / Math.max(1, o.n - 1)) : Math.min(k, n - 1);
  it.forEach((e, j) => { if (j < i) e.classList.add('wb-seen'); });
  it[i].classList.add('wb-now');
  root.querySelector('.wb-step').textContent = o.kind === 'grammar' ? T(`El professor explica · requadre ${i + 1} de ${n}`, `Your teacher is explaining · box ${i + 1} of ${n}`) : T(`Llegim junts · part ${i + 1} de ${n}`, `Reading together · part ${i + 1} of ${n}`);
  const key = sig + '|' + i; if (root.dataset.k !== key) { root.dataset.k = key; it[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}
export function status(txt) { if (root) root.querySelector('.wb-saved').textContent = txt || ''; }
export function get() { return P ? P.get() : null; }
export function set(v) { if (P) P.set(v); }
export function close() { if (root) { root.remove(); root = null; P = null; sig = ''; grams = new Set(); document.documentElement.classList.remove('el-wb-on'); } }
export function isOpen() { return !!root; }
