/* 🧠 Flashcards: one deck per LS with all its vocabulary and grammar, studied with spaced repetition like Anki (Roger, 24 Nov 2026:
   "I want a flashcard activity with all the vocabulary and grammar done in each route and by LS, when we add new activities they appear
   there… a spaced repetition like they do in the vocab section but for the entire unit… like Anki… all mixed with statistics like Anki
   offers, and the practice should be per LS too, for students to study something specific").

   Used by 🎯 Practise (lab/practice.html), which builds the cards from the learning paths themselves (the tabs the student's group has
   opened, at the student's route), so every new SLP adds its cards to its LS deck with no extra work.

   Modes: ▶ Study (the LS deck, everything mixed: cards to review today, then new ones, at most NEW_PER_DAY new cards a day) ·
   🎯 One part (one vocabulary set or grammar point of the LS) · 📊 Stats (today, card counts, the next 7 days, the last 5 weeks, each part).
   Scheduling (a simple Anki / SM-2): new cards go through 1 and 10 minute steps, then come back after 1 day; each Good multiplies the
   gap by the card's ease (2.5 at the start); Again brings it back in 10 minutes and lowers the ease; Hard ×1.2; Easy ×ease×1.3.
   Days start at 4:00 (as in Anki), so a late-night review counts for the same day.

   ELFlashDeck.mount(host, {
     decks: () => [{ id, name, cards: [{ id, kind: 'v'|'g'|'e', part, front (html), back (html), say, ex, star, opts }] }],
     ca: () => bool,                // Catalan (Starter)
     load: () => state, save: state => {},   // the student's progress { decks: { lsId: { c: { cardId: [...] }, log: { day: [...] } } } }
     say: x => {}                   // play a text or [word, example]
     only: 'deckId'                 // optional: open straight on that deck, no list of LSs (Towards Nativeness › 🧠 Preposition flashcards)
     names: { all, choose, chooseHow, mix, stats }   // optional: the page's own words instead of "LS" (Towards Nativeness › 🧠 My flashcards)
   }) → { render(), close() } */
(function (root) {
  if (root.ELFlashDeck) return;
  const NEW_PER_DAY = 15, LEARN = [1, 10], RELEARN = [10], AHEAD = 20, START_EASE = 2500, MIN_EASE = 1300, MAX_IVL = 365, MATURE = 21;
  const MIN = 60e3, DAY = 864e5;
  // a day starts at 4:00, local time
  const dayStart = t => { const d = new Date(t - 4 * 36e5); d.setHours(0, 0, 0, 0); return d.getTime() + 4 * 36e5; };
  const dayKey = t => { const d = new Date(dayStart(t)); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // a card's state: [kind 1 learning / 2 review / 3 relearning, due ms, interval days, ease ×1000, step, reviews, lapses, last review ms]; no state = new
  const S_LRN = 1, S_REV = 2, S_RELRN = 3;
  function next(st, ans, now) {   // ans 1 Again · 2 Hard · 3 Good · 4 Easy → the new state
    const s = st ? st.slice() : [S_LRN, now, 0, START_EASE, 0, 0, 0, 0];
    const [kind, , ivl, ease, step] = s; s[5]++; s[7] = now;
    const grad = days => { s[0] = S_REV; s[2] = Math.min(MAX_IVL, Math.max(1, Math.round(days))); s[4] = 0; s[1] = dayStart(now) + s[2] * DAY; };
    if (kind === S_REV) {
      if (ans === 1) { s[0] = S_RELRN; s[4] = 0; s[6]++; s[3] = Math.max(MIN_EASE, ease - 200); s[2] = Math.max(1, Math.round(ivl * .5)); s[1] = now + RELEARN[0] * MIN; return s; }
      const hard = Math.max(ivl + 1, ivl * 1.2), good = Math.max(hard + 1, ivl * ease / 1000), easy = Math.max(good + 1, ivl * ease / 1000 * 1.3);
      if (ans === 2) s[3] = Math.max(MIN_EASE, ease - 150); if (ans === 4) s[3] = ease + 150;
      grad(ans === 2 ? hard : ans === 3 ? good : easy); return s;
    }
    const steps = kind === S_RELRN ? RELEARN : LEARN, base = kind === S_RELRN ? ivl : 1;
    if (ans === 1) { s[4] = 0; s[1] = now + steps[0] * MIN; return s; }
    if (ans === 2) { s[1] = now + (step === 0 && steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[step]) * MIN; return s; }
    if (ans === 3) { if (step + 1 < steps.length) { s[4] = step + 1; s[1] = now + steps[step + 1] * MIN; return s; } grad(base); return s; }
    grad(kind === S_RELRN ? ivl + 1 : 4); return s;
  }
  // "<1 min", "10 min", "1 day", "4 days", "2 mo"
  const span = (ms, ca) => { const m = ms / MIN; if (m < 1.5) return ca ? '<1 min' : '<1 min'; if (m < 60) return Math.round(m) + ' min';
    const h = m / 60; if (h < 20) return Math.round(h) + ' h'; const d = Math.round(ms / DAY); if (d < 31) return d + (ca ? (d === 1 ? ' dia' : ' dies') : d === 1 ? ' day' : ' days');
    const mo = Math.round(d / 30 * 10) / 10; return mo < 12 ? mo + (ca ? ' mesos' : ' mo') : Math.round(mo / 12 * 10) / 10 + (ca ? ' anys' : ' yr'); };
  const until = (st, now) => st[1] - now;

  const CSS = `
.elfd{color:#172033}
.elfd-how{background:#f8fafc;border-radius:14px;padding:10px 14px;margin:0 0 12px;line-height:1.5}
.elfd-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:10px;margin:0 0 12px}.elfd-head h3{margin:0 0 2px;font-size:1.25rem}.elfd-head p{margin:0;color:#667085}
.elfd-lss{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:0 0 12px}
.elfd-ls{display:flex;flex-direction:column;align-items:flex-start;gap:3px;border:2px solid #ddd6fe;border-radius:20px;padding:16px 18px;background:linear-gradient(180deg,#f5f3ff,#fff);text-align:left;cursor:pointer;font:inherit;color:#172033}
.elfd-ls:hover{border-color:#7c3aed;box-shadow:0 12px 30px rgba(109,40,217,.12)}.elfd-ls .t{font-weight:800;font-size:1.12rem;margin-bottom:6px}
.elfd-ls .big{font-size:2.4rem;font-weight:800;line-height:1;color:#6d28d9}.elfd-ls .big.ok{color:#15803d}.elfd-ls small{color:#667085;font-weight:600}.elfd-ls .ln{font-weight:700}
.elfd-ls .elfd-bar{width:100%;margin:8px 0 2px}.elfd-ls .go{align-self:flex-end;margin-top:6px;background:#6d28d9;color:#fff;border-radius:999px;padding:6px 16px;font-weight:800}
.elfd-mixc{display:flex;align-items:center;gap:16px;width:100%;margin-top:4px;border:0;border-radius:20px;padding:18px 20px;background:linear-gradient(120deg,#0f766e,#0369a1);color:#fff;text-align:left;cursor:pointer;font:inherit;box-shadow:0 10px 26px rgba(3,105,161,.18)}.elfd-mixc:hover{filter:brightness(1.08)}.elfd-mixc:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}.elfd-mixc .ic{flex:none;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.18);font-size:1.9rem}.elfd-mixc .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}.elfd-mixc .tx>b{font-size:1.3rem;line-height:1.2}.elfd-mixc small{font-weight:600;font-size:.95rem}.elfd-mixc small span{color:#fff!important}.elfd-mixc .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}.elfd-mixc .chip{background:rgba(255,255,255,.2);border-radius:999px;padding:3px 10px;font-weight:700;font-size:.88rem}.elfd-mixc .chip b{margin-left:2px}.elfd-mixc .go{flex:none;background:#fff;color:#0f766e;border-radius:999px;padding:9px 20px;font-weight:800;font-size:1.05rem}.elfd-mixc:disabled{background:#e2e8f0;color:#334155;box-shadow:none;cursor:default}.elfd-mixc:disabled small span,.elfd-mixc:disabled .chip{color:#334155!important}.elfd-mixc:disabled .chip{background:#fff}@media (max-width:640px){.elfd-mixc{flex-wrap:wrap;gap:12px;padding:16px}.elfd-mixc .ic{width:46px;height:46px;font-size:1.5rem}.elfd-mixc .tx{flex-basis:calc(100% - 62px)}.elfd-mixc .tx>b{font-size:1.15rem}.elfd-mixc .go{width:100%;text-align:center}}
.elfd-main{display:flex;flex-direction:column;align-items:flex-start;gap:4px;width:100%;border:0;border-radius:20px;padding:18px 20px;background:linear-gradient(120deg,#6d28d9,#3157d5);color:#fff;text-align:left;cursor:pointer;font:inherit}
.elfd-main b{font-size:1.3rem;color:#fff!important}.elfd-main small{font-weight:600;opacity:.95}.elfd-main small span{color:#fff!important}.elfd-main:disabled{background:#e2e8f0;color:#334155;cursor:default}
.elfd-deck{border:1px solid #e5e7eb;border-radius:18px;padding:14px 16px;margin:10px 0;background:#fff;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px}
.elfd-deck.all{background:linear-gradient(180deg,#f5f3ff,#fff);border-color:#ddd6fe}
.elfd-deck h3{margin:0;font-size:1.08rem;flex:1 1 220px}.elfd-deck h3 small{display:block;color:#667085;font-weight:600;font-size:.85rem;margin-top:2px}
.elfd-n{display:flex;gap:12px;font-weight:800;font-variant-numeric:tabular-nums}.elfd-n span{display:flex;flex-direction:column;align-items:center;min-width:46px;font-size:1.15rem}
.elfd-n small{font-size:.72rem;font-weight:700;color:#667085}
.elfd .new{color:#2563eb}.elfd .lrn{color:#dc2626}.elfd .due{color:#15803d}
.elfd .b{border:0;background:#3157d5;color:#fff;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit;font-weight:700}
.elfd .b.g{background:#eaf0ff;color:#3157d5}.elfd .b.sm{padding:5px 12px;font-size:.9rem}.elfd .b:disabled{opacity:.45;cursor:default}
.elfd-acts{display:flex;flex-wrap:wrap;gap:8px}
.elfd-parts{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin:10px 0}
.elfd-part{border:1px solid #e5e7eb;border-radius:16px;padding:12px 14px;background:#fff;text-align:left;cursor:pointer;font:inherit;color:inherit}
.elfd-part:hover{box-shadow:0 10px 26px rgba(23,32,51,.08)}.elfd-part b{display:block;color:#172033!important}.elfd-part small{color:#667085}
.elfd-bar{height:8px;border-radius:99px;background:#eef2f7;overflow:hidden;display:flex;margin-top:8px}.elfd-bar i{display:block;height:100%}
.elfd-full{position:fixed;inset:0;z-index:2147480000;display:flex;flex-direction:column;padding:16px clamp(14px,4vw,48px);background:#f5f7fb;overflow:auto;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.elfd-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px}.elfd-top .grow{flex:1}.elfd-top .nm{font-weight:800;color:#475569}
.elfd-x{border:0;background:#172033;color:#fff;border-radius:999px;padding:8px 16px;font:inherit;font-weight:800;cursor:pointer}
.elfd-cnt{display:flex;gap:14px;font-weight:800;font-size:1.1rem;font-variant-numeric:tabular-nums}.elfd-cnt u{text-decoration-thickness:3px;text-underline-offset:4px}
.elfd-card{flex:1;min-height:260px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:14px;border:2px solid #e5e7eb;border-radius:24px;padding:24px;background:linear-gradient(180deg,#fff,#f8fafc)}
.elfd-tag{font-weight:700;color:#667085;font-size:.95rem}.elfd-tag.g{color:#7c3aed}.elfd-tag.e{color:#0f766e}
.elfd-front{font-size:clamp(1.6rem,4.4vw,3rem);font-weight:800;letter-spacing:-.02em;line-height:1.25;max-width:30ch}
.elfd-front.s{font-size:clamp(1.25rem,3vw,2rem);font-weight:700;max-width:36ch}
.elfd-front em{font-style:normal;color:#7c3aed}.elfd-gap{display:inline-block;min-width:3.2em;border-bottom:3px solid #94a3b8;margin:0 .15em}
.elfd-opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.elfd-opts span{border:1px solid #cbd5e1;border-radius:10px;padding:4px 12px;background:#fff;font-weight:700}
.elfd-back{border-top:2px dashed #e5e7eb;padding-top:14px;display:flex;flex-direction:column;gap:10px;align-items:center;max-width:40ch}
.elfd-ans{font-size:clamp(1.3rem,3.4vw,2.2rem);font-weight:800;color:#0f766e}.elfd-ans mark{background:#dcfce7;color:#14532d;border-radius:6px;padding:0 .2em}
.elfd-ex{color:#667085;font-style:italic;font-size:clamp(1rem,2vw,1.3rem)}.elfd-why{background:#fffbeb;color:#92400e;border-radius:10px;padding:6px 12px}
.elfd-star{color:#d97706}
.elfd-rate{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px auto 4px;width:min(720px,100%)}
.elfd-rate button{border:0;border-radius:16px;padding:10px 6px;font:inherit;font-weight:800;cursor:pointer;color:#fff;display:flex;flex-direction:column;align-items:center;gap:2px}
.elfd-rate button small{font-weight:600;opacity:.9;font-size:.82rem}
.elfd-rate .a1{background:#dc2626}.elfd-rate .a2{background:#d97706}.elfd-rate .a3{background:#16a34a}.elfd-rate .a4{background:#2563eb}
.elfd-show{margin:14px auto 4px;font-size:1.15rem;padding:12px 34px}
.elfd-keys{text-align:center;color:#94a3b8;font-size:.85rem;margin:2px 0 0}
.elfd-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:10px 0 16px}
.elfd-stat div{border:1px solid #e5e7eb;border-radius:16px;padding:12px 14px;background:#fff}.elfd-stat b{display:block;font-size:1.6rem;letter-spacing:-.02em}.elfd-stat small{color:#667085;font-weight:600}
.elfd h4{margin:18px 0 8px}
.elfd-states{display:flex;height:22px;border-radius:99px;overflow:hidden;background:#eef2f7}.elfd-states i{display:block;height:100%}
.elfd-key{display:flex;flex-wrap:wrap;gap:6px 16px;margin:8px 0 0;font-size:.9rem}.elfd-key span::before{content:"";display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;background:var(--c)}
.elfd-fc{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:150px;padding:6px 0 0}
.elfd-fc div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px;font-size:.8rem;color:#667085;font-weight:700}
.elfd-fc i{display:block;width:70%;background:#16a34a;border-radius:6px 6px 2px 2px;min-height:2px}.elfd-fc b{color:#172033}
.elfd-cal{display:grid;grid-template-columns:repeat(7,minmax(0,34px));gap:5px}.elfd-cal span{aspect-ratio:1;border-radius:6px;background:#eef2f7}
.elfd-cal .h{background:none;color:#667085;font-size:.75rem;font-weight:700;text-align:center;aspect-ratio:auto}
.elfd-cal .l1{background:#bbf7d0}.elfd-cal .l2{background:#4ade80}.elfd-cal .l3{background:#16a34a}.elfd-cal .l4{background:#14532d}.elfd-cal .td{outline:2px solid #172033;outline-offset:1px}
.elfd-done{font-size:clamp(1.4rem,3.4vw,2.2rem);font-weight:800}
html.elfd-on,html.elfd-on body{overflow:hidden}
.elfd-mz{display:flex;align-items:center;gap:12px;margin-left:auto}.elfd-mz .elmz{margin-left:28px}
.elfd-say{position:relative;background:#fff;border:2px solid #c7d2fe;border-radius:16px;padding:8px 12px;font-weight:600;font-size:.95rem;line-height:1.3;color:#1e293b;box-shadow:0 4px 12px rgba(15,23,42,.06);max-width:380px}
.elfd-say b{color:#1d4ed8}.elfd-say:after{content:"";position:absolute;right:-17px;top:50%;margin-top:-8px;border:8px solid transparent;border-left-color:#c7d2fe}
.elfd-head .elfd-side{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end}
.elfd-card .elmz-img{margin:-6px auto -4px}
@media (max-width:640px){.elfd-rate{gap:6px}.elfd-rate button{padding:9px 2px;font-size:.92rem}.elfd-n span{min-width:38px;font-size:1rem}.elfd-card{padding:16px;min-height:200px}.elfd-full{padding:12px}}`;
  const css = () => { if (document.getElementById('elfd-css')) return; const s = document.createElement('style'); s.id = 'elfd-css'; s.textContent = CSS; document.head.appendChild(s); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const COL = { new: '#60a5fa', lrn: '#f87171', young: '#86efac', mature: '#15803d' };

  const streakOf = (P, now) => streak(P, now);
  function mount(host, o) {
    css();
    const ca = () => !!(o.ca && o.ca()), t = (c, e) => ca() ? c : e;
    // o.names: the page's own words for the decks (Towards Nativeness › 🧠 My flashcards has decks, not LSs): all, choose, chooseHow, mix, stats
    const N = (k, c, e) => (o.names && o.names[k]) || t(c, e);
    const say = x => { try { (o.say || (y => root.ELVoice && root.ELVoice.say(y)))(x); } catch (e) {} };
    let P = o.load() || {}; P.decks = P.decks || {};
    const D = id => (P.decks[id] = P.decks[id] || { c: {}, log: {} });
    // Saved only after studying (dirty), and merged with the copy saved last (another tab, or the account's copy the page merged in), so a tab
    // left open on an old copy never wipes cards studied elsewhere when it is hidden or closed (problem seen 25 Nov 2026: students studied
    // and their ⚡ stayed at 0, their saved copy empty).
    let dirty = false;
    const sync = () => { P = merge(o.load() || {}, P); P.decks = P.decks || {}; };
    const flush = () => { if (!dirty) return; dirty = false; sync(); o.save(P); };
    const saveSoon = (() => { let tm = null; return now => { clearTimeout(tm); if (now) { flush(); return; } tm = setTimeout(flush, 15e3); }; })();
    // o.only: a page with one deck of its own (Towards Nativeness › 🧠 Preposition flashcards) opens straight on that deck, with no LS list
    let view = o.only ? { k: 'ls', id: o.only } : { k: 'list' }, ses = null, layer = null;
    // Which side comes first on a vocabulary card (Roger, 25 Nov 2026: "I want them to be able to choose whether they see the Catalan first or
    // the English first… it makes more sense to say Fer fotos means take pictures"; "when they are collocations first Catalan as a default"):
    // auto = a word of two or more words (a collocation, an expression) in Catalan first, a single word in English first; or always English /
    // always Catalan first. The student's choice stays in this browser (el_fd_dir). Cards with no Catalan (Pro) stay English first.
    const DIRS = ['auto', 'en', 'ca'];
    let dir = (() => { try { const v = localStorage.getItem('el_fd_dir'); return DIRS.includes(v) ? v : 'auto'; } catch (e) { return 'auto'; } })();
    const caFirst = c => c && c.kind === 'v' && !!c.ca && (dir === 'ca' || dir === 'auto' && /\S\s+\S/.test(String(c.en || '').trim()));
    const dirLbl = () => dir === 'en' ? t('Primer l’anglès', 'English first') : dir === 'ca' ? t('Primer el català', 'Catalan first') : t('Primer: automàtic', 'First: automatic');

    const decks = () => (o.decks() || []).filter(d => d.cards.length);
    // 🧑‍🎨 the streak mascot (el-mascot.js), when the page has it: the Choose an LS header, Done for today, milestones
    const MZ = () => root.ELMascot, me = () => (o.me ? o.me() : null);
    const leftToday = () => { const now = Date.now(); return decks().reduce((a, d) => { const n = counts(d, now); return a + n.newToday + n.lrn + n.due; }, 0); };
    function mzHead() {
      const M = MZ(); if (!M) return '';
      const st = streak(P, Date.now()), left = leftToday(), m = M.mood({ st, left }), n = st.n;
      const line = st.today && !left ? t('Tot fet per avui. Fins demà! 😴', 'All done for today. See you tomorrow! 😴')
        : st.today ? (n > 1 ? t(`<b>${n} dies seguits!</b> Continua així ⚡`, `<b>${n} days in a row!</b> Keep going ⚡`) : t('Bon començament! Torna demà i seran 2 ⚡', 'Good start! Come back tomorrow to make it 2 ⚡'))
        : n ? t(`Estudia avui i mantens la ratxa de <b>${n} ${n === 1 ? 'dia' : 'dies'}</b>!`, `Study today to keep your <b>${n}-day</b> streak!`)
        : t("Unes quantes targetes cada dia i la ratxa ⚡ creix. T'ho prometo, funciona!", 'A few cards every day and your ⚡ streak grows. I promise it works!');
      return `<div class="elfd-mz"><span class="elfd-say">${line}</span><span class="elmz" style="cursor:default">${M.img(m, 72, '')}${M.badge(n)}</span></div>`;
    }
    function mzDone() {   // the picture at the end of a session: 🎉 a milestone (once, shared with the board), 😴 nothing left today, or 🙂
      const M = MZ(); if (!M) return { h: '', mile: 0 };
      const st = streak(P, Date.now()), mile = M.milestone(st), k = 'el_mz_party_' + (me() || ''), v = mile + '@' + dayKey(Date.now());
      if (mile && me() !== null && M.seen.get(k) !== v) { M.seen.set(k, v); return { h: M.img('party', 150, '') + M.badge(st.n, 'xl'), mile }; }
      return { h: M.img(leftToday() ? (st.n >= 7 ? 'energised' : 'happy') : 'sleeping', 130, '') + M.badge(st.n), mile: 0 };
    }
    const stOf = (d, c) => D(d.id).c[c.id];
    function counts(d, now) {
      const n = { new: 0, lrn: 0, due: 0, young: 0, mature: 0, total: d.cards.length }, end = dayStart(now) + DAY;
      d.cards.forEach(c => { const s = stOf(d, c); if (!s) return n.new++;
        if (s[0] !== S_REV) { n.lrn += s[1] < end ? 1 : 0; } else { if (s[1] < end) n.due++; }
        if (s[0] === S_REV) s[2] >= MATURE ? n.mature++ : n.young++; else n.lrnAll = (n.lrnAll || 0) + 1; });
      const today = (D(d.id).log[dayKey(now)] || [])[3] || 0;
      n.newToday = Math.max(0, Math.min(n.new, NEW_PER_DAY - today));
      return n;
    }
    const allDeck = ds => ({ id: '*', name: N('all', 'Totes les meves LS', 'All my LSs'), cards: ds.flatMap(d => d.cards.map(c => Object.assign({}, c, { deck: d.id }))), parts: false });
    const deckOfCard = (d, c) => c.deck || d.id;

    // ---------- a study session ----------
    function start(d, part) {
      const now = Date.now(), cards = part ? d.cards.filter(c => c.part === part) : d.cards;
      const st = c => D(deckOfCard(d, c)).c[c.id], end = dayStart(now) + DAY;
      let fresh = shuffle(cards.filter(c => !st(c)));
      if (!part) { const left = {}; fresh = fresh.filter(c => { const k = deckOfCard(d, c); if (left[k] == null) left[k] = counts({ id: k, cards: (decks().find(x => x.id === k) || { cards: [] }).cards }, now).newToday; return left[k]-- > 0; }); }
      const due = shuffle(cards.filter(c => { const s = st(c); return s && s[0] === S_REV && s[1] < end; }));
      const extra = part ? shuffle(cards.filter(c => { const s = st(c); return s && s[0] === S_REV && s[1] >= end; })) : [];   // one part: the rest of it too
      ses = { d, part, fresh, due, extra, lrn: cards.filter(c => { const s = st(c); return s && s[0] !== S_REV; }), cur: null, shown: false, n: 0, t0: Date.now(), turn: 0 };
      view = { k: 'study' }; open(); pick();
    }
    function pick() {
      const now = Date.now(), d = ses.d, st = c => D(deckOfCard(d, c)).c[c.id];
      ses.lrn.sort((a, b) => st(a)[1] - st(b)[1]);
      const lrnNow = ses.lrn.filter(c => st(c)[1] <= now);
      let c = null;
      if (lrnNow.length) c = lrnNow[0];
      else if (ses.due.length || ses.fresh.length) { ses.turn++;
        // new cards mixed in among the reviews (Anki: one new card every few reviews)
        const takeNew = ses.fresh.length && (!ses.due.length || ses.turn % Math.max(1, Math.round(ses.due.length / ses.fresh.length) + 1) === 0);
        c = takeNew ? ses.fresh.shift() : ses.due.shift(); }
      else if (ses.extra.length) c = ses.extra.shift();
      else if (ses.lrn.length && st(ses.lrn[0])[1] - now <= AHEAD * MIN) c = ses.lrn[0];   // learn ahead when nothing else is left
      ses.cur = c; ses.shown = false; ses.t1 = Date.now(); render();
    }
    function answer(ans) {
      const c = ses.cur; if (!c || !ses.shown) return;
      const now = Date.now(), dk = deckOfCard(ses.d, c), deck = D(dk), old = deck.c[c.id], wasNew = !old, wasRev = old && old[0] === S_REV, early = ses.part && wasRev && old[1] >= dayStart(now) + DAY;
      // one part, a card not due yet: a right answer keeps its date; a wrong one brings it back sooner
      const nu = early && ans >= 3 ? Object.assign(old.slice(), { 5: old[5] + 1, 7: now }) : next(old, ans, now);
      deck.c[c.id] = nu;
      const day = dayKey(now), L = deck.log[day] = deck.log[day] || [0, 0, 0, 0, 0, 0];
      L[0]++; if (ans > 1) L[1]++; L[2] += Math.min(60, Math.round((now - ses.t1) / 1000)); if (wasNew) L[3]++; if (wasRev) { L[4]++; if (ans > 1) L[5]++; }
      ses.n++;
      const i = ses.lrn.indexOf(c); if (i >= 0) ses.lrn.splice(i, 1);
      if (nu[0] !== S_REV) ses.lrn.push(c);
      dirty = true; saveSoon(); pick();
    }

    // ---------- screens ----------
    const num = (v, cl, en, cat) => `<span class="${cl}">${v}<small>${t(cat, en)}</small></span>`;
    // Flashcards opens on the LSs to choose from (Roger, 24 Nov 2026: "it's not clear what they are selecting. I want the user to go to
    // flashcards and there select LS or see statistics"): one big card per LS, 📊 My statistics, and ▶ all my LSs mixed. An LS opens its own
    // page: ▶ Study everything mixed, or one part.
    const todayOf = d => { const n = d.id === '*' ? decks().map(x => counts(x, Date.now())).reduce((a, b) => ({ newToday: a.newToday + b.newToday, lrn: a.lrn + b.lrn, due: a.due + b.due, total: a.total + b.total }), { newToday: 0, lrn: 0, due: 0, total: 0 }) : counts(d, Date.now());
      return { nw: n.newToday, lrn: n.lrn, due: n.due, total: n.total, all: n.newToday + n.lrn + n.due }; };
    const todayLine = n => [n.nw ? `<span class="new">${n.nw} ${t(n.nw === 1 ? 'nova' : 'noves', 'new')}</span>` : '', n.lrn ? `<span class="lrn">${n.lrn} ${t('aprenent', 'learning')}</span>` : '', n.due ? `<span class="due">${n.due} ${t('per repassar', 'to review')}</span>` : ''].filter(Boolean).join(' · ');
    function list() {
      const ds = decks();
      if (!ds.length) return `<div class="elfd-how">${t('Encara no hi ha targetes: apareixeran quan feu el vocabulari i la gramàtica a classe.', 'No cards yet: they will appear when you do the vocabulary and grammar in class.')}</div>`;
      const card = d => { const n = todayOf(d), s = strength(d, d.cards);
        return `<button class="elfd-ls" data-fd="ls" data-v="${esc(d.id)}"><span class="t">🧠 ${esc(d.name)}</span>
          ${n.all ? `<span class="big">${n.all}</span><small>${t('targetes per estudiar avui', 'cards to study today')}</small><small class="ln">${todayLine(n)}</small>` : `<span class="big ok">✓</span><small>${t('Fet per avui', 'Done for today')}</small><small class="ln">&nbsp;</small>`}
          ${bar(s)}<small>${d.cards.length} ${t('targetes', 'cards')} · ${Math.round((s.mat + s.young) / s.n * 100)}% ${t('apreses', 'learnt')}</small><span class="go">${t('Obre', 'Open')} ›</span></button>`; };
      const all = ds.length > 1 ? todayOf({ id: '*' }) : null;
      return `<div class="elfd-head"><div><h3>${N('choose', 'Tria una LS', 'Choose an LS')}</h3><p>${N('chooseHow', 'Cada LS té les seves targetes amb el vocabulari i la gramàtica que heu fet a classe.', 'Each LS has its own cards with the vocabulary and grammar you have done in class.')}</p></div>
        <div class="elfd-side">${mzHead()}<button class="b g" data-fd="stats" data-v="*">📊 ${t('Les meves estadístiques', 'My statistics')}</button></div></div>
        <div class="elfd-lss">${ds.map(card).join('')}</div>
        ${all ? mixCard(ds, all) : ''}`;
    }
    // 🔀 every LS mixed (Roger, 25 Nov 2026: "this should be another color and more accesible or visual"): a big teal card like the LS
    // page's ▶ Study everything mixed, with today's cards, one chip per LS and a ▶ Start pill; white text on a dark teal for contrast
    function mixCard(ds, all) {
      const chips = ds.map(d => { const n = todayOf(d).all; return `<span class="chip">${esc(String(d.name).split(' · ')[0])} <b>${n || '✓'}</b></span>`; }).join('');
      return `<button class="elfd-mixc" data-fd="study" data-v="*" ${all.all ? '' : 'disabled'}><span class="ic" aria-hidden="true">🔀</span>
        <span class="tx"><b>${N('mix', 'Estudia totes les meves LS barrejades', 'Study all my LSs mixed')}</b>
        <small>${all.all ? `${all.all} ${t('targetes avui', 'cards today')}: ${todayLine(all)}` : t('Fet per avui ✓ Torna demà!', 'Done for today ✓ Come back tomorrow!')}</small>
        <span class="chips">${chips}</span></span>${all.all ? `<span class="go">▶ ${t('Comença', 'Start')}</span>` : ''}</button>`;
    }
    function partsOf(d) {
      const m = new Map(); d.cards.forEach(c => { if (!m.has(c.part)) m.set(c.part, { part: c.part, kind: c.kind, cards: [] }); m.get(c.part).cards.push(c); });
      return [...m.values()];
    }
    const strength = (d, cards) => { let mat = 0, young = 0, lrn = 0; cards.forEach(c => { const s = D(deckOfCard(d, c)).c[c.id]; if (!s) return; if (s[0] === S_REV) s[2] >= MATURE ? mat++ : young++; else lrn++; }); return { mat, young, lrn, nw: cards.length - mat - young - lrn, n: cards.length }; };
    const bar = s => `<div class="elfd-bar">${[['mat', COL.mature], ['young', COL.young], ['lrn', COL.lrn], ['nw', '#dbeafe']].map(([k, c]) => s[k] ? `<i style="width:${s[k] / s.n * 100}%;background:${c}"></i>` : '').join('')}</div>`;
    const icon = k => k === 'g' ? '📘' : k === 'e' ? '💬' : '🃏';
    function lsPage(d) {
      const ps = partsOf(d), now = Date.now(), end = dayStart(now) + DAY, n = todayOf(d);
      return `<div class="elfd-head">${o.only ? '<span></span>' : `<button class="b g sm" data-fd="back">← ${N('all', 'Totes les LS', 'All LSs')}</button>`}<button class="b g" data-fd="stats" data-v="${esc(d.id)}">📊 ${t('Estadístiques', 'Statistics')}</button></div>
        <h3 style="margin:6px 0 10px">🧠 ${esc(d.name)}</h3>
        <button class="elfd-main" data-fd="study" data-v="${esc(d.id)}" ${n.all ? '' : 'disabled'}><b>▶ ${t('Estudia-ho tot barrejat', 'Study everything mixed')}</b>
          <small>${n.all ? `${n.all} ${t('targetes avui', 'cards today')}: ${todayLine(n)}` : t('Fet per avui ✓ Torna demà, o estudia una part aquí sota.', 'Done for today ✓ Come back tomorrow, or study one part below.')}</small></button>
        <h4>🎯 ${t('O estudia només una part', 'Or study only one part')}</h4>
        <div class="elfd-parts">${ps.map(p => { const s = strength(d, p.cards), due = p.cards.filter(c => { const x = D(d.id).c[c.id]; return x && x[1] < end; }).length;
          return `<button class="elfd-part" data-fd="part" data-v="${esc(d.id)}" data-p="${esc(p.part)}"><b>${icon(p.kind)} ${esc(p.part)}</b><small>${p.cards.length} ${t('targetes', 'cards')} · ${Math.round((s.mat + s.young) / s.n * 100)}% ${t('apreses', 'learnt')}${due ? ` · <span class="due">${due} ${t('per repassar', 'to review')}</span>` : ''}</small>${bar(s)}</button>`; }).join('')}</div>
        <div class="elfd-key">${[[COL.mature, t('Madures (21+ dies)', 'Mature (21+ days)')], [COL.young, t('Joves', 'Young')], [COL.lrn, t('Aprenent', 'Learning')], ['#dbeafe', t('Noves', 'New')]].map(([c, l]) => `<span style="--c:${c}">${l}</span>`).join('')}</div>`;
    }
    function stats(d) {
      const now = Date.now(), ids = d.id === '*' ? decks().map(x => x.id) : [d.id], logs = ids.map(id => D(id).log);
      const sumDay = k => logs.reduce((a, L) => { const x = L[k]; if (x) x.forEach((v, i) => a[i] += v); return a; }, [0, 0, 0, 0, 0, 0]);
      const td = sumDay(dayKey(now)), s = strength(d, d.cards);
      let rv = 0, rok = 0; for (let i = 0; i < 30; i++) { const x = sumDay(dayKey(now - i * DAY)); rv += x[4]; rok += x[5]; }
      const streak = streakOf(P, now).n;
      const end = dayStart(now) + DAY, fc = [0, 0, 0, 0, 0, 0, 0];
      d.cards.forEach(c => { const x = D(deckOfCard(d, c)).c[c.id]; if (!x) return; const i = x[1] < end ? 0 : Math.floor((x[1] - end) / DAY) + 1; if (i < 7) fc[i]++; });
      const mx = Math.max(1, ...fc), WD = ca() ? ['Avui', 'Demà'] : ['Today', 'Tmrw'], dn = i => i < 2 ? WD[i] : new Date(now + i * DAY).toLocaleDateString(ca() ? 'ca' : 'en-GB', { weekday: 'short' });
      // the last 5 weeks, Monday first
      const today0 = dayStart(now), wd = (new Date(today0 - 4 * 36e5).getDay() + 6) % 7, first = today0 - (wd + 28) * DAY, cells = [];
      for (let i = 0; i < 35; i++) { const tt = first + i * DAY; if (tt > today0) { cells.push('<span style="visibility:hidden"></span>'); continue; } const n = sumDay(dayKey(tt + 5 * 36e5))[0];
        cells.push(`<span class="${n ? 'l' + (n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4) : ''}${tt === today0 ? ' td' : ''}" title="${new Date(tt).toLocaleDateString()} · ${n}"></span>`); }
      const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';
      const ps = d.id === '*' ? [] : partsOf(d);
      return `<div class="elfd-head"><button class="b g sm" data-fd="back">← ${d.id === '*' ? N('all', 'Totes les LS', 'All LSs') : esc(d.name)}</button></div><h3 style="margin:6px 0 6px">📊 ${d.id === '*' ? N('stats', 'Les meves estadístiques · totes les LS', 'My statistics · all my LSs') : esc(d.name)}</h3>
        <h4>${t('Avui', 'Today')}</h4><div class="elfd-stat"><div><b>${td[0]}</b><small>${t('targetes estudiades', 'cards studied')}</small></div><div><b>${Math.round(td[2] / 60)} min</b><small>${t('de temps', 'of study')}</small></div>
          <div><b>${pct(td[1], td[0])}</b><small>${t('encertades', 'right')} (${td[0] - td[1]} ${t('cops “De nou”', '× Again')})</small></div><div><b>${td[3]}</b><small>${t('targetes noves', 'new cards')}</small></div></div>
        <div class="elfd-stat"><div><b>${root.ELMascot ? ELMascot.badge(streak) : '⚡ ' + streak}</b><small>${t(streak === 1 ? 'dia seguit' : 'dies seguits', streak === 1 ? 'day in a row' : 'days in a row')}</small></div><div><b>${pct(rok, rv)}</b><small>${t('record (repassos, 30 dies)', 'remembered (reviews, 30 days)')}</small></div></div>
        <h4>${t('Les teves targetes', 'Your cards')} · ${s.n}</h4><div class="elfd-states">${[['nw', COL.new], ['lrn', COL.lrn], ['young', COL.young], ['mat', COL.mature]].map(([k, c]) => s[k] ? `<i style="width:${s[k] / s.n * 100}%;background:${c}" title="${s[k]}"></i>` : '').join('')}</div>
        <div class="elfd-key">${[['nw', COL.new, 'Noves', 'New'], ['lrn', COL.lrn, 'Aprenent', 'Learning'], ['young', COL.young, 'Joves', 'Young'], ['mat', COL.mature, 'Madures', 'Mature']].map(([k, c, a, b]) => `<span style="--c:${c}">${t(a, b)} <b>${s[k]}</b></span>`).join('')}</div>
        <h4>${t('Per repassar els propers 7 dies', 'To review in the next 7 days')}</h4><div class="elfd-fc">${fc.map((v, i) => `<div><b>${v}</b><i style="height:${v / mx * 100}%"></i>${esc(dn(i))}</div>`).join('')}</div>
        <h4>${t('Les últimes 5 setmanes', 'The last 5 weeks')}</h4><div class="elfd-cal">${(ca() ? 'dl dt dc dj dv ds dg' : 'Mo Tu We Th Fr Sa Su').split(' ').map(x => `<span class="h">${x}</span>`).join('')}${cells.join('')}</div>
        ${ps.length ? `<h4>${t('Cada part', 'Each part')}</h4><div class="elfd-parts">${ps.map(p => { const x = strength(d, p.cards); return `<div class="elfd-part" style="cursor:default"><b>${icon(p.kind)} ${esc(p.part)}</b><small>${pct(x.mat + x.young, x.n)} ${t('apreses', 'learnt')} · ${x.n} ${t('targetes', 'cards')}</small>${bar(x)}</div>`; }).join('')}</div>` : ''}`;
    }
    function studyHtml() {
      const d = ses.d, c = ses.cur, now = Date.now(), st = x => D(deckOfCard(d, x)).c[x.id];
      const nN = ses.fresh.length, nL = ses.lrn.filter(x => st(x)[1] - now <= AHEAD * MIN).length, nR = ses.due.length + ses.extra.length;
      const kindOf = x => !x ? '' : !st(x) ? 'new' : st(x)[0] === S_REV ? 'due' : 'lrn';
      const top = `<div class="elfd-top"><button class="elfd-x" data-fd="close">✕ ${t('Tanca', 'Close')}</button><span class="nm">${esc(d.name)}${ses.part ? ' · ' + esc(ses.part) : ''}</span><span class="grow"></span><button class="b g sm elfd-dir" data-fd="dir" title="${esc(t('Automàtic: les expressions de més d’una paraula surten primer en català, i les paraules soles en anglès. Toca per canviar-ho.', 'Automatic: expressions of more than one word show the Catalan first, single words the English first. Tap to change it.'))}">⇄ ${dirLbl()}</button>
        <span class="elfd-cnt"><span class="new">${kindOf(c) === 'new' && !ses.shown ? '<u>' + (nN + 1) + '</u>' : nN}</span><span class="lrn">${kindOf(c) === 'lrn' && !ses.shown ? '<u>' + nL + '</u>' : nL}</span><span class="due">${kindOf(c) === 'due' && !ses.shown ? '<u>' + (nR + 1) + '</u>' : nR}</span></span></div>`;
      if (!c) {
        const later = ses.lrn.length ? Math.min(...ses.lrn.map(x => st(x)[1])) - now : 0;
        const z = mzDone();
        return top + `<div class="elfd-card">${z.h ? `<div class="elmz" style="cursor:default;margin-left:30px">${z.h}</div>` : ''}<div class="elfd-done">${z.mile ? t(`${z.mile} dies seguits! 🎉`, `${z.mile} days in a row! 🎉`) : (z.h ? '' : '🎉 ') + (later > 0 || leftToday() ? t('Fet per ara!', 'Done for now!') : t('Fet per avui!', 'Done for today!'))}</div><p>${t(`Has estudiat ${ses.n} targetes.`, `You studied ${ses.n} cards.`)}</p>
          <p class="elfd-tag">${later > 0 ? t('Algunes targetes tornen d’aquí a ', 'Some cards come back in ') + span(later, ca()) + '.' : t('Torna demà: repassar una mica cada dia és el que fa que tot es quedi.', 'Come back tomorrow: a little every day is what makes it stick.')}</p>
          <div class="elfd-acts"><button class="b" data-fd="statsnow">📊 ${t('Estadístiques', 'Stats')}</button><button class="b g" data-fd="close">${t('Tanca', 'Close')}</button></div></div>`;
      }
      const tag = `<div class="elfd-tag ${c.kind}">${icon(c.kind)} ${c.kind === 'v' ? t('Vocabulari', 'Vocabulary') : c.kind === 'e' ? 'Expressions' : t('Gramàtica', 'Grammar')} · ${esc(c.part)}</div>`;
      const rev = caFirst(c);
      const front = `<div class="elfd-front${c.kind === 'v' ? '' : ' s'}">${rev ? esc(c.ca) : c.front}${c.star ? ' <span class="elfd-star">⭐</span>' : ''}</div>${c.opts && c.opts.length ? `<div class="elfd-opts">${c.opts.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}`;
      const listen = c.say ? `<button class="b g sm" data-fd="say">🔊 ${t('Escolta', 'Listen')}</button>` : '';
      const help = c.kind === 'v' ? t('Digues què vol dir en veu alta. Després gira la targeta.', 'Say what it means out loud. Then turn the card over.') : t('Digues la frase completa en veu alta. Després gira la targeta.', 'Say the whole sentence out loud. Then turn the card over.');
      const help2 = rev ? t('Digues-ho en anglès en veu alta. Després gira la targeta.', 'Say it in English out loud. Then turn the card over.') : help;
      if (!ses.shown) return top + `<div class="elfd-card">${tag}${front}${c.kind === 'v' && !rev ? listen : ''}<p class="elfd-tag">${help2}</p></div><button class="b elfd-show" data-fd="show">${t('Gira la targeta', 'Turn over')}</button><p class="elfd-keys">${t('Espai: girar', 'Space: turn over')}</p>`;
      const s = st(c), opt = [1, 2, 3, 4].map(a => { const early = ses.part && s && s[0] === S_REV && s[1] >= dayStart(now) + DAY && a >= 3; if (early) return t('igual', 'same'); const x = next(s, a, now); return span(x[0] === S_REV ? x[2] * DAY : until(x, now), ca()); });
      const L = [['De nou', 'Again'], ['Difícil', 'Hard'], ['Bé', 'Good'], ['Fàcil', 'Easy']];
      const back = rev ? `<div class="elfd-ans">${esc(c.en)}</div>${c.ex ? `<div class="elfd-ex">${esc(c.ex)}</div>` : ''}` : c.back;
      return top + `<div class="elfd-card">${tag}${front}<div class="elfd-back">${back}${listen}</div></div>
        <div class="elfd-rate">${L.map(([a, b], i) => `<button class="a${i + 1}" data-fd="ans" data-v="${i + 1}">${t(a, b)}<small>${opt[i]}</small></button>`).join('')}</div><p class="elfd-keys">${t('Tecles 1 2 3 4', 'Keys 1 2 3 4')}</p>`;
    }

    function open() { document.documentElement.classList.add('elfd-on'); if (!layer) { layer = document.createElement('div'); layer.className = 'elfd elfd-full'; layer.setAttribute('role', 'dialog'); layer.setAttribute('aria-modal', 'true'); layer.addEventListener('click', click); } if (!layer.isConnected) document.body.appendChild(layer); }
    function close() { if (layer && layer.isConnected) layer.remove(); document.documentElement.classList.remove('elfd-on'); if (ses) saveSoon(true); const id = ses && ses.d.id; ses = null; if (view.k === 'study') view = id && id !== '*' ? { k: 'ls', id } : { k: 'list' }; render(); }
    function render() {
      host.classList.add('elfd');
      if (view.k === 'study' && ses) { open(); layer.innerHTML = studyHtml(); return; }
      const ds = decks(), d = view.id === '*' ? allDeck(ds) : ds.find(x => x.id === view.id);
      host.innerHTML = view.k === 'ls' && d ? lsPage(d) : view.k === 'stats' && d ? stats(d) : list();
    }
    function click(e) {
      const el = e.target.closest('[data-fd]'); if (!el) return; const k = el.dataset.fd, v = el.dataset.v, ds = decks(), d = v === '*' ? allDeck(ds) : ds.find(x => x.id === v);
      if (k === 'study' && d) start(d);
      else if (k === 'part' && d) start(d, el.dataset.p);
      else if (k === 'ls' || k === 'stats') { view = { k, id: v }; render(); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      else if (k === 'back') { view = o.only ? { k: 'ls', id: o.only } : view.k === 'stats' && view.id !== '*' ? { k: 'ls', id: view.id } : { k: 'list' }; render(); }
      else if (k === 'close') close();
      else if (k === 'statsnow') { const id = ses.d.id; close(); view = { k: 'stats', id }; render(); }
      else if (k === 'show') { ses.shown = true; const c = ses.cur; if (c.say) say(c.kind === 'v' && c.ex ? [c.say, c.ex] : c.say); render(); }
      else if (k === 'ans') answer(+v);
      else if (k === 'say') say(ses.cur.say);
      else if (k === 'dir') { dir = DIRS[(DIRS.indexOf(dir) + 1) % DIRS.length]; try { localStorage.setItem('el_fd_dir', dir); } catch (e) {} render(); }
    }
    host.addEventListener('click', click);
    document.addEventListener('keydown', e => {
      if (!ses || view.k !== 'study' || (e.target.closest && e.target.closest('input,textarea,select'))) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if ((e.key === ' ' || e.key === 'Enter') && !ses.shown && ses.cur) { e.preventDefault(); click({ target: layer.querySelector('[data-fd="show"]') }); }
      else if (ses.shown && /^[1-4]$/.test(e.key)) { e.preventDefault(); answer(+e.key); }
    });
    addEventListener('pagehide', () => saveSoon(true));
    // hidden: save what was studied here; visible again: take in what another tab saved meanwhile
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSoon(true); else { sync(); if (!ses) render(); } });
    render();
    return { render, close, reload() { sync(); render(); },   // the account's copy came in: merged, never replacing cards studied meanwhile
      summary() { const ds = decks(), now = Date.now(); return ds.reduce((a, d) => { const n = counts(d, now); a.due += n.due + n.lrn; a.new += n.newToday; a.total += n.total; return a; }, { due: 0, new: 0, total: 0 }); } };
  }
  // the numbers the tile on Practise shows before the deck is open
  function summary(ds, P) {
    const now = Date.now(), end = dayStart(now) + DAY, out = { due: 0, new: 0, total: 0 };
    (ds || []).forEach(d => { const dk = ((P || {}).decks || {})[d.id] || { c: {}, log: {} }; let nw = 0;
      d.cards.forEach(c => { const s = dk.c[c.id]; out.total++; if (!s) nw++; else if (s[1] < end) out.due++; });
      out.new += Math.max(0, Math.min(nw, NEW_PER_DAY - ((dk.log[dayKey(now)] || [])[3] || 0))); });
    return out;
  }
  // ⚡ days in a row (Roger, 25 Nov 2026, with the streak mascot): a day counts when the student studied at least one card, in any LS.
  // Weekends and school holidays (EL_TIMETABLE.off, el-plan.js) never break it, and studying on them still counts. Today not studied yet
  // doesn't break it either. → { n, today (studied today), lost (the streak that broke at the last school day missed, when n is 0), gap (that day) }
  function streak(P, now) {
    now = now || Date.now(); const on = new Set();
    Object.values((P && P.decks) || {}).forEach(d => Object.entries((d && d.log) || {}).forEach(([k, a]) => { if (a && a[0] > 0) on.add(k); }));
    const off = ((root.EL_TIMETABLE || {}).off) || [];
    const rest = k => { const [y, m, dd] = k.split('-').map(Number), wd = new Date(y, m - 1, dd).getDay(); return wd === 0 || wd === 6 || off.some(o => Array.isArray(o) ? o[0] <= k && k <= o[1] : o === k); };
    const today = dayKey(now), at = i => dayKey(dayStart(now) - i * DAY + 5 * 36e5);
    let n = 0, i = on.has(today) ? 0 : 1, gap = null;
    for (; i < 800; i++) { const k = at(i); if (on.has(k)) n++; else if (!rest(k)) { gap = k; break; } }
    let lost = 0;
    if (!n && gap) for (i++; i < 800; i++) { const k = at(i); if (on.has(k)) lost++; else if (!rest(k)) break; }
    return { n, today: on.has(today), lost, gap: lost ? gap : null, used: on.size > 0 };
  }
  // merge two saved copies (this device and the account): for each card the one reviewed last, for each day the bigger log
  function merge(a, b) {
    const out = { decks: {} }; a = a || {}; b = b || {};
    new Set(Object.keys(a.decks || {}).concat(Object.keys(b.decks || {}))).forEach(id => {
      const x = (a.decks || {})[id] || { c: {}, log: {} }, y = (b.decks || {})[id] || { c: {}, log: {} }, c = Object.assign({}, x.c), log = Object.assign({}, x.log);
      Object.keys(y.c || {}).forEach(k => { if (!c[k] || (y.c[k][7] || 0) > (c[k][7] || 0)) c[k] = y.c[k]; });
      Object.keys(y.log || {}).forEach(k => { if (!log[k] || y.log[k][0] > log[k][0]) log[k] = y.log[k]; });
      out.decks[id] = { c, log };
    });
    return out;
  }
  root.ELFlashDeck = { mount, summary, merge, next, dayKey, streak, _span: span };
})(typeof window !== 'undefined' ? window : globalThis);
