/* 🧑‍🎨 The streak mascot (Roger, 24–25 Nov 2026: "I want to introduce a personalised mascot into English Lab, based on … my mini avatar";
   "Can you put the mascot next to level and always visible the strike?"; "Maybe if the students touch the avatar they can go to flashcards";
   "And messages like do your flashcards, I promise it works or do some shadowing, i promise it works"; then "Merge").

   Roger's own avatar in six moods (shared/img/streak/*.webp) and the ⚡ streak badge (a golden bolt and the number in a rounded blue badge).
   The streak is the 🧠 Flashcards one (ELFlashDeck.streak: days in a row with at least one card studied; weekends and school holidays never
   break it). No Firestore reads or writes of its own: the board reads the copy of the flashcards already in the browser (el_flash_<uid>)
   and the counts 🎯 Practise leaves there (el_flash_sum_<uid>); what was already shown today is kept in the browser only.

   Moods (ELMascot.mood):
     😴 sleeping   studied today and nothing left for today
     ⚡ energised  studied today with 7+ days in a row (before 17:00 also when today is still to do)
     🙂 happy      studied today, or before 17:00 with today still to do
     😟 worried    from 17:00 with today's cards still to do
     😢 sad        the streak was just lost (once; then worried or happy again)
     🎉 party      a milestone: 7, 14, 30, 50, 100, 150, 200 days in a row (once each)

   Used by today.html (next to 🎯 My level, the daily message, the daily cards), lab/practice.html and el-flashdeck.js (the Flashcards tile,
   the Choose an LS header, Done for today, milestones, ⚡ in statistics) and teacher.html (⚡ in the 🧠 Flashcards tile). Never in exams,
   checkpoints, the sample exam or on the projector. */
(function (root) {
  if (root.ELMascot) return;
  const me = document.currentScript && document.currentScript.src;
  const DIR = me ? new URL('../img/streak/', me).href : 'shared/img/streak/';
  const MOODS = ['happy', 'energised', 'worried', 'sad', 'sleeping', 'party'], MILES = [7, 14, 30, 50, 100, 150, 200];
  const BOLT = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M12 1L2 14h7l-2 9 11-14h-7l3-8z" fill="#facc15" stroke="#a16207" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const CSS = `
.elmz-badge{display:inline-flex;align-items:center;gap:2px;background:linear-gradient(#3b82f6,#1d4ed8);border:3px solid #1e3a8a;border-radius:14px;padding:1px 9px 1px 4px;color:#fff!important;font:900 20px/1.25 Inter,system-ui,sans-serif;box-shadow:0 2px 0 #1e3a8a;white-space:nowrap;font-variant-numeric:tabular-nums;letter-spacing:0}
.elmz-badge svg{width:.95em;height:1.15em;flex:none}
.elmz-badge.sm{font-size:15px;border-width:2px;border-radius:11px;padding:0 7px 0 3px;box-shadow:0 2px 0 #1e3a8a}
.elmz-badge.xl{font-size:34px;border-width:4px;border-radius:20px;padding:2px 16px 2px 8px;box-shadow:0 3px 0 #1e3a8a}
.elmz-img{display:block;filter:drop-shadow(0 3px 4px rgba(0,0,0,.14));user-select:none;-webkit-user-drag:none}
.elmz{position:relative;display:inline-flex;align-items:flex-end;flex:none;border:0;background:none;padding:0;margin:0;cursor:pointer;color:inherit;font:inherit;text-decoration:none}
.elmz .elmz-badge{position:absolute;left:-30px;bottom:6px;z-index:1}
.elmz:hover .elmz-img,.elmz:focus-visible .elmz-img{transform:translateY(-2px) rotate(-2deg)}.elmz .elmz-img{transition:transform .15s}
.elmz-say{position:absolute;z-index:40;width:max-content;max-width:280px;background:#fff;color:#1e293b!important;border:2px solid #c7d2fe;border-radius:16px;padding:9px 13px;font:600 15px/1.35 Inter,system-ui,sans-serif;text-align:left;box-shadow:0 8px 22px rgba(15,23,42,.14);cursor:pointer;animation:elmzin .35s ease-out}
.elmz-say b{color:#1d4ed8!important}.elmz-say.out{opacity:0;transition:opacity .5s}
.elmz-say:after{content:"";position:absolute;left:var(--t,calc(100% - 50px));top:-17px;border:8px solid transparent;border-bottom-color:#c7d2fe}
@keyframes elmzin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.phead>.elmz{align-self:flex-start;margin-top:-10px}
@media (prefers-reduced-motion:reduce){.elmz-say{animation:none}.elmz .elmz-img{transition:none}}
@media print{.elmz,.elmz-say{display:none!important}}`;
  const css = () => { if (document.getElementById('elmz-css')) return; const s = document.createElement('style'); s.id = 'elmz-css'; s.textContent = CSS; document.head.appendChild(s); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const src = m => DIR + (MOODS.includes(m) ? m : 'happy') + '.webp?v=20261125';
  const img = (m, h, alt) => { css(); return `<img class="elmz-img" src="${src(m)}" alt="${esc(alt || '')}" width="${h}" height="${h}" style="width:${h}px;height:${h}px" draggable="false">`; };
  const badge = (n, cl) => { css(); return `<span class="elmz-badge${cl ? ' ' + cl : ''}" title="⚡ ${+n || 0}">${BOLT}${+n || 0}</span>`; };
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { Storage.prototype.setItem.call(localStorage, k, v); } catch (e) {} } };
  const load = k => { try { return JSON.parse(ls.get(k) || 'null'); } catch (e) { return null; } };
  const FD = () => root.ELFlashDeck;
  // the student's flashcards and the counts Practise left: { P, st (streak), left (cards still to study today, null = not known) }
  function data(uid, P) {
    const F = FD(); if (!F) return null;
    P = P || load('el_flash' + (uid ? '_' + uid : '')) || {};
    const now = Date.now(), st = F.streak(P, now), today = F.dayKey(now), sum = load('el_flash_sum' + (uid ? '_' + uid : ''));
    let left = null;
    if (sum && sum.d === today) left = (+sum.due || 0) + (+sum.nw || 0);
    else if (sum) {   // counted on another day: the reviews due by tonight from the saved cards, and the new cards Practise had then
      const end = new Date(); if (end.getHours() >= 4) end.setDate(end.getDate() + 1); end.setHours(4, 0, 0, 0); let due = 0;
      Object.values(P.decks || {}).forEach(d => Object.values((d && d.c) || {}).forEach(c => { if (c && c[1] < end.getTime()) due++; }));
      left = due + (+sum.un || 0);
    }
    return { P, st, left, today };
  }
  // the mood: see the list on top
  function mood(x, o) {
    o = o || {}; const st = x.st, h = new Date().getHours(), late = h >= 17 || h < 4;
    if (o.sad && st.lost >= 2 && !st.today) return 'sad';
    if (st.today && x.left === 0) return 'sleeping';
    if (st.today) return st.n >= 7 ? 'energised' : 'happy';
    if (late && st.used) return 'worried';
    return st.n >= 7 ? 'energised' : 'happy';
  }
  const milestone = st => st.today && MILES.includes(st.n) ? st.n : 0;
  // a speech bubble under (or beside) an element, gone after `ms` or on a tap; `href` makes the bubble a link
  function say(anchor, html, o) {
    css(); o = o || {}; const old = document.getElementById('elmz-say'); if (old) old.remove();
    const b = document.createElement(o.href ? 'a' : 'div'); b.id = 'elmz-say'; b.className = 'elmz-say'; b.innerHTML = html; b.setAttribute('role', 'status');
    if (o.href) { b.href = o.href; b.style.textDecoration = 'none'; }
    const host = o.host || anchor.offsetParent || document.body; host.appendChild(b);
    const place = () => { const a = anchor.getBoundingClientRect(), hr = host.getBoundingClientRect(), w = b.offsetWidth;
      let left = a.right - hr.left - w + (o.dx || 0); left = Math.max(8 - hr.left, left);
      b.style.left = left + 'px'; b.style.top = (a.bottom - hr.top + 10) + 'px';
      b.style.setProperty('--t', Math.min(w - 26, Math.max(10, a.left + a.width / 2 - hr.left - left - 8)) + 'px'); };
    place();
    let tm = null; const gone = () => { clearTimeout(tm); b.classList.add('out'); setTimeout(() => b.remove(), 500); };
    tm = setTimeout(gone, o.ms || 9000);
    if (!o.href) b.addEventListener('click', gone);
    return { el: b, close: gone };
  }
  root.ELMascot = { DIR, MOODS, MILES, css, img, badge, data, mood, milestone, say, seen: ls, src };
})(typeof window !== 'undefined' ? window : globalThis);
