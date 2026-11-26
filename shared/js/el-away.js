/* 🎓 Leaving the class page (Roger, 17 Nov 2026: "And the same in class mode or when students have class": students should not go to
   other windows, tabs or apps during class). A web page cannot stop a window switch (Alt+Tab, a swipe to another desktop, the Chromebook
   shelf), so while the class is on it notices it at once and makes it cost something:
   - the moment the page loses the focus or is hidden for more than 0.4 s, a cover says "Come back to the class!";
   - back on the page, the cover stays until they tap 🎓 Back to the class (the same tap puts the full screen back if it was lost), and it
     tells them their teacher can see it;
   - each leave is counted (how many times, how many seconds in all) and handed to `back`, which writes it where the teacher sees it
     (live/{group}/fsLeft/{email}.aw / .awMs: the ↩ list on the dashboard, the class tab and the game board, elWhoLine in el-catalog.js).
   Not a leave: focus inside an embedded video or presentation (document.hasFocus() stays true for frames inside the page), the file
   picker of an upload, the microphone permission prompt, going to another page of the site, and a closed lid or a sleeping screen (the
   timers stop: a gap of more than 10 s while away; the dashboard already shows those students as "screen closed or another window").
   o = {FD: the document whose focus counts (class.html's in its frame), on: () => the class is on for this student on this page,
   ca: () => Catalan, back: (n, ms, total ms) => log a leave, off: bool => the student is away / back (the "here" beat), fsNeed: () =>
   full screen is wanted and lost, fsGo: () => ask for full screen (needs the tap), z: z-index, key: () => the class's key (fs.at, the
   counts are kept per class in this browser)}. No reads; one write per leave (in `back`). */
const STORE = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const KEEP = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
// the counts of this class (key = fs.at, or the game's sid), shared with the full-screen writers so each write carries all the fields
export const awayCount = key => { const v = key && STORE('el_aw_' + key); return { aw: v && +v.n || 0, awMs: v && +v.ms || 0 }; };
export const awaySecs = ms => { const s = Math.max(1, Math.round(ms / 1000)); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min' + (s % 60 ? ' ' + (s % 60) + ' s' : ''); };
let ask = 0;   // a file picker or a permission prompt is open (its window takes the focus): not a leave, for a minute at most
const asking = () => ask && Date.now() - ask < 60e3;
if (typeof document !== 'undefined') {
  const isFile = e => { const t = e.target; if (!t || !t.closest) return false; if (t.type === 'file') return true; const l = t.closest('label'); return !!(l && l.control && l.control.type === 'file'); };
  document.addEventListener('click', e => { if (isFile(e)) ask = Date.now(); }, true);
  ['change', 'cancel'].forEach(ev => document.addEventListener(ev, e => { if (e.target && e.target.type === 'file') ask = 0; }, true));
  try { const M = navigator.mediaDevices, gum = M && M.getUserMedia; if (gum && !gum.elAway) { const w = function () { ask = Date.now(); return gum.apply(M, arguments).finally(() => { ask = 0; }); }; w.elAway = true; M.getUserMedia = w; } } catch (e) {}
}
export function awayWatch(o) {
  const FD = o.FD || document, ca = () => !!(o.ca && o.ca()), t = (cat, en) => ca() ? cat : en;
  let away = 0, pend = 0, slept = false, last = Date.now(), bye = false, cover = null;
  // another page of the site: not a leave (still here 3 s after beforeunload: it was a download or a cancelled move, so it counts again)
  addEventListener('beforeunload', () => { bye = true; setTimeout(() => { bye = false; }, 3000); }); addEventListener('pagehide', () => { bye = true; });
  addEventListener('pageshow', e => { if (e.persisted) bye = false; });
  const out = () => FD.visibilityState === 'hidden' || !FD.hasFocus();
  function show(back, total) {
    if (!cover) { cover = document.createElement('div'); cover.id = 'el-away'; cover.setAttribute('role', 'alertdialog');
      cover.style.cssText = 'position:fixed;inset:0;z-index:' + (o.z || 2147483003) + ';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;background:#9a3412;color:#fff;font:600 18px system-ui,sans-serif';
      document.body.append(cover); }
    const k = back ? 'b' + total.n + '.' + total.ms : 'a';
    if (cover.dataset.k === k) return; cover.dataset.k = k;
    cover.innerHTML = '<div style="font-size:64px">🎓</div><div style="font-size:28px;font-weight:800;max-width:680px"></div><div style="font-size:19px;max-width:620px;opacity:.95"></div>';
    cover.children[1].textContent = back ? t('Has sortit de la pàgina de la classe.', 'You left the class page.') : t('Torna a la classe!', 'Come back to the class!');
    cover.children[2].textContent = back
      ? t('El professor ho veu: ' + total.n + (total.n === 1 ? ' vegada' : ' vegades') + ' en aquesta classe (' + awaySecs(total.ms) + ' en total).', 'Your teacher can see it: ' + total.n + (total.n === 1 ? ' time' : ' times') + ' in this class (' + awaySecs(total.ms) + ' in all).')
      : t('Durant la classe no pots anar a altres finestres, pestanyes o aplicacions. El professor ho veu.', 'During the class you can’t go to other windows, tabs or apps. Your teacher can see it.');
    if (back) { const b = document.createElement('button'); b.type = 'button'; b.textContent = '🎓 ' + t('Torna a la classe', 'Back to the class') + ' →';
      b.style.cssText = 'margin-top:6px;border:0;background:#fff;color:#9a3412;border-radius:999px;padding:14px 30px;font:800 20px system-ui,sans-serif;cursor:pointer';
      b.onclick = () => { hide(); try { if (o.fsNeed && o.fsNeed()) o.fsGo(); } catch (e) {} }; cover.append(b); setTimeout(() => { try { b.focus(); } catch (e) {} }, 50); }
  }
  function hide() { if (cover) cover.remove(); cover = null; }
  function tick() {
    const now = Date.now(), gap = now - last; last = now;
    if (!o.on()) { if (away) { away = 0; pend = 0; o.off && o.off(false); } if (cover && cover.dataset.k === 'a') hide(); return; }
    if (away && gap > 10e3 && now - away < 270e3) slept = true;   // the timers stopped: the device slept (a hidden page still ticks every second)
    if (bye) return;
    if (out()) {
      if (asking() && !away) return;
      if (!away) { if (!pend) pend = now; if (now - pend >= 400) { away = pend; pend = 0; show(false); o.off && o.off(true); } }
      return;
    }
    pend = 0; if (!away) return;
    const ms = now - away; away = 0; o.off && o.off(false);
    if (slept) { slept = false; hide(); return; }
    const key = o.key && o.key(), c = awayCount(key), total = { n: c.aw + 1, ms: c.awMs + ms };
    if (key) KEEP('el_aw_' + key, { n: total.n, ms: total.ms });
    show(true, total);
    try { o.back && o.back(total.n, ms, total.ms); } catch (e) { console.warn('away', e); }
  }
  setInterval(tick, 250);
  // in class.html the parent's window and document count too: their listeners go when this page goes (the frame's next page adds its own)
  const W = FD.defaultView || window, later = () => setTimeout(tick, 420), on = (x, add) => {
    x[add ? 'addEventListener' : 'removeEventListener']('blur', later); x[add ? 'addEventListener' : 'removeEventListener']('focus', tick); };
  const vis = add => FD[add ? 'addEventListener' : 'removeEventListener']('visibilitychange', later);
  on(window, true); vis(true);
  if (W !== window) { on(W, true); addEventListener('pagehide', () => { on(W, false); vis(false); }); addEventListener('pageshow', e => { if (e.persisted) { on(W, true); vis(true); } }); }
  return { tick, away: () => !!away };
}
