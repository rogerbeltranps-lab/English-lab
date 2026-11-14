// 📘 📖 The whiteboard (Roger, 13 Nov 2026: "when doing an activity together, and I'm explaining theory I want students to only see a
// whiteboard and that when they take notes it looks like hand writing and they can underline, highlight, etc. this notes appear in their
// notes", and "when doing theory like grammar or whatever, they must only see their notes"). While the teacher explains together
// (📘 Grammar together or 📖 Read together, live/{group}.rt, el-cloud.js), the student's Chromebook shows only this screen, over the page:
// the board on the left (the boxes or the text the projector shows, the one being explained marked with a red arrow, ⤵ to copy a box into
// the notes) and the handwriting page on the right (el-pad.js). It closes by itself when the teacher goes on to ⏱ Your turn or leaves.
// el-cloud.js saves the page in the student's notes (📓 My notebook on the LS page shows it). Nothing here reads or writes Firestore.
import { pad, css } from './el-pad.js';
let root = null, P = null, sig = '', o = {};
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
      <div class="wb-np"><div class="wb-sheet"><div class="nb-paper"></div></div><div class="wb-foot"><span class="wb-tip"></span></div></div></div>`;
    document.body.append(root); document.documentElement.classList.add('el-wb-on');
    P = pad(root.querySelector('.nb-paper'), { html: o.saved && o.saved.html, text: o.saved && o.saved.text, dr: o.saved && o.saved.dr, ca: o.ca, onChange: v => o.onChange && o.onChange(v) });
    root.querySelector('.nb-paper').insertAdjacentHTML('afterbegin', '');
    const ed = P.ed; setTimeout(() => { try { ed.focus({ preventScroll: true }); } catch (e) {} }, 300);
  }
  root.querySelector('.wb-h').textContent = (o.kind === 'grammar' ? '📘 ' + T('Aprenem junts', 'Learning together') : '📖 ' + T('Llegim junts', 'Reading together')) + (o.head ? ' · ' + o.head : '');
  root.querySelector('.wb-title').textContent = o.title || '';
  root.querySelector('.wb-tip').textContent = T('Tria paraules i toca un subratllador o una marca. ⤵ copia un requadre de la pissarra. Tot va a 📓 La meva llibreta.', 'Select words, then tap a highlighter or a mark. ⤵ copies a box from the board. Everything goes into 📓 My notebook.');
  const s = o.kind + '|' + (o.ca ? 1 : 0) + '|' + String(o.html || '').length + '|' + String(o.html || '').slice(0, 120);
  if (s !== sig) {
    sig = s; const inn = root.querySelector('.wb-in'); inn.innerHTML = o.html || '';
    inn.querySelectorAll('script,iframe,audio,video,input,textarea,select,button').forEach(e => e.remove());
    items().forEach(el => {
      el.classList.add('wb-it');
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
export function close() { if (root) { root.remove(); root = null; P = null; sig = ''; document.documentElement.classList.remove('el-wb-on'); } }
export function isOpen() { return !!root; }
