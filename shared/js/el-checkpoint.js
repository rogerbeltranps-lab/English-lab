/* Recall checkpoints that are hard to cheat on (Roger, 31 Oct 2026: “make sure they don't cheat”; docs/general/secure-checkpoints.md).
   A recall panel with `secure` in its data (LS2 checkpoints) is drawn here instead of by ls2-engine.js:
   - the page has the questions but no answers: the key is in cpKeys/{page key} (teacher only), so nothing in the page or the repo gives them away;
   - one question at a time, a timer per question (secure.secs, 45 s), no going back; a route may see a draw of secure.n[route] questions
     from a bigger bank, in its own order (kept in the progress, so a reload or another device shows the same ones);
   - the question can't be selected or copied and nothing can be pasted into the answer;
   - leaving the page (another tab, window or app) for more than 2 seconds sends the checkpoint at once with the answers so far
     (Roger, 31 Oct 2026: “if they leave the tab or open another app on their Chromebook, send the test automatically”);
   - full screen while it runs (Roger, 1 Nov 2026: other tabs were still in sight): Start puts the page in full screen; leaving it (Esc)
     shows "Back to full screen" and sends the checkpoint after 5 s (a tab or app switch keeps its 2 s);
   - the answers go once to students/{uid}/checkpoints/{page key} (firestore.rules: create only; again only when the teacher lets them);
   - the mark and the corrections only appear when the teacher releases them on the dashboard (doc.fb); the next Learning Path opens at once.
   The dashboard marks with the key (teacher.html cpInject), so the grade, the question analysis and the student's board work as before. */
window.ELCheckpoint = (function () {
  const FS = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
  const GRACE = 2000;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let fs = null, timer = null, off = [];
  const fsLib = async () => fs || (fs = await import(FS));
  const cloud = () => window.ELCloud && window.ELCloud.user ? window.ELCloud : null;
  const act = key => (window.EL_CATALOG || []).find(a => (a.keys || []).includes(key)) || null;
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const ref = (F, key) => F.doc(window.ELCloud.db, 'students', window.ELCloud.user.uid, 'checkpoints', key);
  function stop() { clearInterval(timer); timer = null; off.forEach(f => f()); off = []; }
  // full screen while a checkpoint runs (not on iPhones, which can't put a page in full screen)
  const FS_GRACE = 5000, D = document, E = D.documentElement;
  const fsOk = () => !!(D.fullscreenEnabled || D.webkitFullscreenEnabled);
  const isFull = () => !!(D.fullscreenElement || D.webkitFullscreenElement);
  const goFull = () => { try { if (!fsOk() || isFull()) return; const r = (E.requestFullscreen || E.webkitRequestFullscreen).call(E); if (r && r.catch) r.catch(() => {}); } catch (e) {} };
  const exitFull = () => { try { if (isFull()) (D.exitFullscreen || D.webkitExitFullscreen).call(D); } catch (e) {} };
  const on = (el, ev, f, o) => { el.addEventListener(ev, f, o); off.push(() => el.removeEventListener(ev, f, o)); };

  /* api (from ls2-engine.js): LP, level(), ca(), state, save(), complete(id), forLevel(items) */
  function panel(p, api) {
    const LP = api.LP, key = LP.key, S = p.secure || {}, secs = S.secs || 45, ca = api.ca, t = (c, e) => ca() ? c : e;
    const st = () => { const s = api.state; s.cp = s.cp || {}; return s.cp; };
    const byId = id => (p.items || []).find(x => x.id === id);
    const html = '<div class="section-card cp-box" id="' + p.id + 'Cp"><p class="tiny">' + t('Carregant…', 'Loading…') + '</p></div>' +
      '<style>.cp-box .cp-q{font-size:1.15rem;font-weight:700;margin:10px 0 12px;-webkit-user-select:none;user-select:none}.cp-box .cp-bar{height:8px;border-radius:9px;background:#e8eef7;overflow:hidden;margin:6px 0 4px}' +
      '.cp-box .cp-bar i{display:block;height:100%;background:var(--accent,#315f9f);transition:width .25s linear}.cp-box .cp-bar i.low{background:#d9534f}.cp-box .cp-rules{margin:8px 0 14px;padding-left:20px;line-height:1.6}' +
      '.cp-box .cp-fb{border-top:1px solid var(--line,#dbe5f1);padding:10px 0}.cp-box .cp-fb .ok{color:#16a34a}.cp-box .cp-fb .no{color:#b42318}.cp-box .cp-warn{background:#fff4e5;border:1px solid #f5b971;border-radius:13px;padding:10px 14px;margin:6px 0 12px}.cp-box .cp-warn h3{margin:0;color:#8a4b00}.cp-box .cp-ok{display:flex;gap:8px;align-items:center;font-weight:700;margin:6px 0}.cp-veil{position:fixed;inset:0;background:#0f172a;color:#fff;display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;z-index:999;text-align:center;padding:20px}</style>';

    function box() { return document.getElementById(p.id + 'Cp'); }
    function draw() {   // the route's questions: all of them, or a draw of secure.n[route] from the bank, in a new order
      const pool = api.forLevel(p.items).filter(x => x.id), n = (S.n || {})[api.level()];
      return shuffle(n && n < pool.length ? shuffle(pool).slice(0, n) : pool).map(x => x.id);
    }

    // ---- states: intro → running → sent (waiting) → feedback (released) ----
    function intro(note) {
      stop(); const n = ((S.n || {})[api.level()]) || api.forLevel(p.items).filter(x => x.id).length;
      // the rules before the first question (Roger, 31 Oct 2026: “before entering the checkpoint, the instructions and what happens if they
      // copy-paste or leave the tab”); Start needs the “I have read the rules” tick
      box().innerHTML = (note ? '<p class="feedback no">' + note + '</p>' : '') +
        '<h3>' + t('Com funciona', 'How it works') + '</h3><ul class="cp-rules">' +
        '<li>' + t(n + ' preguntes, una cada vegada. Tens uns ' + secs + ' segons per a cada una.', n + ' questions, one at a time. You have about ' + secs + ' seconds for each one.') + '</li>' +
        '<li>' + t('No pots tornar enrere. Quan el temps s’acaba, passes a la pregunta següent.', 'You can’t go back. When the time is up, the next question comes.') + '</li>' +
        '<li>' + t('Només el pots fer <strong>una vegada</strong>.', 'You can only do it <strong>once</strong>.') + '</li></ul>' +
        '<div class="cp-warn"><h3>⚠️ ' + t('Important', 'Important') + '</h3><ul class="cp-rules">' +
        '<li><strong>' + t('No surtis d’aquesta pàgina.', 'Don’t leave this page.') + '</strong> ' + t('Si canvies de pestanya, de finestra o d’aplicació més de 2 segons, el checkpoint <strong>s’envia automàticament</strong> amb les respostes que tinguis, i ja no el pots continuar.', 'If you change to another tab, window or app for more than 2 seconds, your checkpoint <strong>is sent automatically</strong> with the answers you have, and you can’t go on with it.') + '</li>' +
        (fsOk() ? '<li><strong>' + t('Es fa a pantalla completa.', 'It runs in full screen.') + '</strong> ' + t('Quan comencis, la pàgina ocuparà tota la pantalla i no veuràs les altres pestanyes. Si en surts (Esc) i no hi tornes en 5 segons amb el botó, el checkpoint <strong>s’envia automàticament</strong>.', 'When you start, the page fills the whole screen and you can’t see your other tabs. If you leave full screen (Esc) and don’t go back within 5 seconds with the button, your checkpoint <strong>is sent automatically</strong>.') + '</li>' : '') +
        '<li><strong>' + t('No es pot copiar ni enganxar.', 'No copying or pasting.') + '</strong> ' + t('Les preguntes no es poden copiar i a les caselles no s’hi pot enganxar res: escriu tu les respostes.', 'The questions can’t be copied and nothing can be pasted into the boxes: type your own answers.') + '</li>' +
        '<li><strong>' + t('Sense apunts ni ajuda', 'No notes or help') + '</strong>' + t(': ni traductor, ni IA, ni companys.', ': no translator, no AI, no classmates.') + '</li></ul></div>' +
        '<p>' + t('Quan l’enviïs, s’obrirà el següent Learning Path. Veuràs la correcció quan el professor la publiqui.', 'When you send it, the next Learning Path opens. You will see the corrections when your teacher shares them.') + '</p>' +
        '<label class="cp-ok"><input type="checkbox" id="' + p.id + 'Read"> ' + t('He llegit les instruccions', 'I have read the rules') + '</label>' +
        '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Start" disabled>' + t('Comença', 'Start') + '</button><span class="tiny" id="' + p.id + 'Wait">' + t('Un moment…', 'One moment…') + '</span></div>';
      // Start only once the cloud knows who it is (and has had time to reload the page with the student's progress) and the rules are ticked
      let cloudOk = false;
      const ready = () => { const b = document.getElementById(p.id + 'Start'), w = document.getElementById(p.id + 'Wait'), r = document.getElementById(p.id + 'Read'); if (!b) return;
        b.disabled = !(cloudOk && r.checked); if (w) w.textContent = cloudOk ? (r.checked ? '' : t('Marca la casella per començar.', 'Tick the box to start.')) : t('Un moment…', 'One moment…'); };
      document.getElementById(p.id + 'Read').onchange = ready;
      if (window.EL_CP_PREVIEW) { cloudOk = true; ready(); } else waitCloud(() => setTimeout(() => { cloudOk = true; ready(); }, 1500));
      document.getElementById(p.id + 'Start').onclick = () => {
        const c = st(); Object.keys(c).forEach(k => delete c[k]);
        Object.assign(c, { level: api.level(), ids: draw(), answers: [], times: [], leaves: [], i: 0, started: new Date().toISOString(), qAt: Date.now() });
        api.save(); goFull(); run();
      };
    }

    function run() {
      stop(); const c = st(), b = box();
      if (c.i >= c.ids.length) return send(null);
      const it = byId(c.ids[c.i]) || { q: '?' }, last = c.i === c.ids.length - 1;
      b.innerHTML = '<p class="tiny">' + t('Pregunta ', 'Question ') + (c.i + 1) + ' / ' + c.ids.length + '</p><div class="cp-bar"><i id="' + p.id + 'Bar" style="width:100%"></i></div>' +
        '<p class="cp-q">' + it.q + '</p><div class="question" style="margin:0"><input type="text" class="typed" id="' + p.id + 'In" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + t('La teva resposta', 'Your answer') + '"></div>' +
        '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Next">' + (last ? t('Envia', 'Send') : t('Següent →', 'Next →')) + '</button></div>';
      const inp = document.getElementById(p.id + 'In'), bar = document.getElementById(p.id + 'Bar');
      inp.value = (c.draft && c.draft.i === c.i ? c.draft.v : '') || '';
      inp.oninput = () => { c.draft = { i: c.i, v: inp.value }; api.save(); };
      inp.onkeydown = e => { if (e.key === 'Enter') next(); };
      document.getElementById(p.id + 'Next').onclick = () => next();
      ['copy', 'cut', 'paste', 'drop', 'contextmenu', 'dragstart'].forEach(ev => on(b, ev, e => e.preventDefault()));
      setTimeout(() => inp.focus(), 50);
      const left = () => secs * 1000 - (Date.now() - c.qAt);
      timer = setInterval(() => { const l = left(); bar.style.width = Math.max(0, l / (secs * 10)) + '%'; bar.classList.toggle('low', l < 10000); if (l <= 0) next(); }, 250);
      function next() {
        if (c.i >= c.ids.length) return;
        c.answers[c.i] = String(inp.value || '').trim().slice(0, 80); c.times[c.i] = Math.round((Date.now() - c.qAt) / 1000);
        c.i++; c.qAt = Date.now(); delete c.draft; api.save();
        if (c.i >= c.ids.length) send(null); else run();
      }
      // leaving the page: hidden at once; back within 2 s only counts as a glance (shown to the teacher), otherwise it is sent
      let away = 0, veil = null, wait = null;
      const sendNow = () => { c.answers[c.i] = String(inp.value || '').trim().slice(0, 80); c.times[c.i] = Math.round((Date.now() - c.qAt) / 1000); send('left'); };
      let fullAway = false;
      const leave = full => { if (away) { if (!full && fullAway) { fullAway = false; clearTimeout(wait); wait = setTimeout(sendNow, GRACE); } return; }   // out of full screen and then another tab: 2 s
        away = Date.now(); fullAway = !!full; c.away = away; api.save();
        veil = document.createElement('div'); veil.className = 'cp-veil'; veil.textContent = t('Torna a la pàgina del checkpoint!', 'Come back to the checkpoint page!'); document.body.appendChild(veil);
        if (full) { veil.textContent = t('Torna a la pantalla completa en 5 segons o el checkpoint s’enviarà.', 'Go back to full screen within 5 seconds or your checkpoint will be sent.');
          const bt = document.createElement('button'); bt.className = 'btn'; bt.type = 'button'; bt.textContent = t('⛶ Torna a la pantalla completa', '⛶ Back to full screen'); bt.onclick = () => goFull(); veil.appendChild(bt); }
        wait = setTimeout(sendNow, full ? FS_GRACE : GRACE); };
      const back = () => { if (!away || c.sentAt) return; clearTimeout(wait); fullAway = false; c.leaves.push({ at: new Date(away).toISOString(), ms: Date.now() - away }); delete c.away; away = 0; api.save(); if (veil) veil.remove(); veil = null; inp.focus(); };
      on(window, 'blur', () => leave()); on(document, 'visibilitychange', () => document.hidden ? leave() : isFull() || !fsOk() ? back() : null); on(window, 'focus', () => isFull() || !fsOk() || !wasFull ? back() : null);
      // full screen (Roger, 1 Nov 2026: "you can't browse the website but can go to other tabs"): the tabs are out of sight; leaving full screen
      // counts as leaving the page, with 5 s to press "Back to full screen" (an Esc by mistake), shown to the teacher like a glance
      let wasFull = isFull();
      on(document, 'fullscreenchange', () => { if (isFull()) { wasFull = true; back(); } else if (wasFull) leave(true); });
      on(document, 'webkitfullscreenchange', () => { if (isFull()) { wasFull = true; back(); } else if (wasFull) leave(true); });
      on(window, 'pagehide', () => { c.away = c.away || Date.now(); api.save(); });
      off.push(() => { clearTimeout(wait); if (veil) veil.remove(); });
    }

    // the answers go once to the cloud; the step is done (the next Learning Path opens) as soon as they are sent
    let busy = false;
    async function send(auto) {
      stop(); exitFull(); const c = st(); if (c.sentAt && c.ok) return sent(); if (busy) return; busy = true;
      c.auto = c.auto || auto; c.sentAt = c.sentAt || new Date().toISOString(); delete c.away; delete c.draft; api.save();
      while (c.answers.length < c.ids.length) { c.answers.push(''); c.times.push(0); }
      box().innerHTML = '<p>' + t('Enviant…', 'Sending…') + '</p>';
      const A = act(key);
      try {
        if (!window.EL_CP_PREVIEW) {
          if (!cloud()) throw new Error('not signed in');
          const F = await fsLib();
          await F.setDoc(ref(F, key), { ls: A ? A.ls : null, activity: A ? A.id : null, key, level: c.level, ids: c.ids, answers: c.answers, times: c.times,
            leaves: c.leaves.slice(0, 50), auto: c.auto || null, started: c.started, sent: F.serverTimestamp() });
        }
        c.ok = true; busy = false; api.save(); api.complete(p.id); sent();
      } catch (e) {
        busy = false;
        console.warn('checkpoint', e);
        // already in the cloud (sent from another device or before a reload): that copy counts
        try { const F = await fsLib(), d = cloud() && await F.getDoc(ref(F, key)); if (d && d.exists() && !d.data().redo) { c.ok = true; api.save(); api.complete(p.id); return sent(d.data()); } } catch (x) {}
        box().innerHTML = '<p class="feedback no">' + t('No s’ha pogut enviar. Comprova la connexió i torna-ho a provar.', 'It couldn’t be sent. Check your connection and try again.') + '</p><div class="actions"><button class="btn" type="button" id="' + p.id + 'Retry">' + t('Torna-ho a enviar', 'Send again') + '</button></div>';
        document.getElementById(p.id + 'Retry').onclick = () => send(null);
      }
    }

    function sent(d) {
      stop(); const c = st(), fb = d && d.fb;
      if (!fb) {
        box().innerHTML = '<h3>✓ ' + t('Enviat', 'Sent') + '</h3>' + (c.auto === 'left' || (d && d.auto === 'left') ? '<p class="instruction">' + t('S’ha enviat quan has sortit de la pàgina.', 'It was sent when you left the page.') + '</p>' : '') +
          '<p>' + t('Ja pots fer el següent Learning Path. Veuràs la correcció quan el professor la publiqui.', 'You can go on to the next Learning Path. You will see the corrections when your teacher shares them.') + '</p>' + testerBtn();
        return bindTester();
      }
      // released: the student's answers with the corrections; the first try is kept for Reflect and the board (the dashboard marks from the key)
      const s = api.state; s.first = s.first || {}; s.first[d.level] = { score: fb.score, max: fb.max, date: fb.at || c.sentAt }; api.save();
      box().innerHTML = '<h3>' + fb.score + ' / ' + fb.max + t(' correctes', ' correct') + '</h3><p class="instruction">' + t('Llegeix la correcció i repassa el que has fallat.', 'Read the corrections and review what you missed.') + '</p>' +
        d.ids.map((id, i) => { const it = byId(id) || {}, ok = fb.ok[i], w = (fb.why || [])[i] || {}, why = ca() ? (w.ca || w.en || '') : (w.en || w.ca || '');
          return '<div class="cp-fb"><p class="q-title">' + (i + 1) + '. ' + (it.q || '') + '</p><p>' + t('La teva resposta: ', 'Your answer: ') + '<strong>' + esc(d.answers[i] || '–') + '</strong> <span class="' + (ok ? 'ok">✓' : 'no">✗') + '</span></p>' +
            (ok ? '' : '<p>' + t('Resposta: ', 'Answer: ') + '<strong>' + esc((fb.right || [])[i] || '') + '</strong>' + (why ? ' · ' + esc(why) : '') + '</p>') + '</div>'; }).join('') + testerBtn();
      bindTester();
    }
    // done the old way (before 31 Oct 2026, answers checked on the page): that try stays, nothing to do again
    function legacy() {
      stop(); const f = api.state.first || {}, r = f[api.level()] || Object.values(f)[0];
      box().innerHTML = '<h3>✓ ' + t('Fet', 'Done') + '</h3><p>' + t('Ja vas fer aquest checkpoint', 'You already did this checkpoint') + (r ? ' (' + r.score + ' / ' + r.max + ')' : '') + '. ' + t('Pots continuar amb el següent Learning Path.', 'You can go on to the next Learning Path.') + '</p>' + testerBtn();
      bindTester();
    }
    // testers can delete their own try to see the checkpoint again (firestore.rules)
    const isTester = () => !!(window.ELCloud && window.ELCloud.user && window.ELCloud.isTester(window.ELCloud.user));
    const testerBtn = () => isTester() || window.EL_CP_PREVIEW ? '<div class="actions"><button class="btn secondary" type="button" id="' + p.id + 'Reset">🧪 ' + t('Prova (tester): torna a començar', 'Tester: start again') + '</button></div>' : '';
    function bindTester() {
      const b = document.getElementById(p.id + 'Reset'); if (!b) return;
      b.onclick = async () => { try { if (!window.EL_CP_PREVIEW) { const F = await fsLib(); await F.deleteDoc(ref(F, key)); } } catch (e) { console.warn(e); }
        const s = api.state; s.cp = {}; if (s.first) delete s.first[api.level()]; if (s.done) delete s.done[p.id]; api.save(); intro(); };
    }

    function waitCloud(f) { let n = 0, done = false; const once = () => { if (!done) { done = true; f(); } };
      const go = () => { if (cloud()) return once(); if (window.ELCloud && window.ELCloud.onUser) window.ELCloud.onUser(u => u && once()); else if (n++ < 120) setTimeout(go, 500); }; go(); }

    async function bind() {
      stop(); const c = st();
      if (window.EL_CP_PREVIEW) { const d = window.EL_CP_PREVIEW.doc; return d ? sent(d) : c.sentAt && c.ok ? sent() : c.ids ? (c.away ? send('left') : run()) : intro(); }
      // what the cloud has decides: sent (with or without corrections), or let do again by the teacher (redo)
      if (c.ids && !c.sentAt) {   // started and the page was left or reloaded: it is sent (the 2 s margin can't apply after leaving the page)
        // except a reload in the first seconds with nothing answered (the page reloads itself once after sign-in): it goes on
        if (!c.i && !c.draft && !(c.leaves || []).length && Date.now() - Date.parse(c.started) < 15000) { delete c.away; api.save(); return run(); }
        box().innerHTML = '<p>' + t('Enviant…', 'Sending…') + '</p>';
        return waitCloud(() => send('left'));
      }
      box().innerHTML = '<p class="tiny">' + t('Carregant…', 'Loading…') + '</p>';
      waitCloud(async () => {
        try {
          const F = await fsLib(), s = await F.getDoc(ref(F, key)), d = s.exists() ? s.data() : null;
          if (d && d.redo) { if (c.sentAt) { api.state.cp = {}; if (api.state.done) delete api.state.done[p.id]; api.save(); } return intro(t('El professor t’ha deixat tornar a fer aquest checkpoint.', 'Your teacher has let you do this checkpoint again.')); }
          if (d) { if (!c.ok) { Object.assign(c, { ok: true, sentAt: c.sentAt || new Date().toISOString(), level: d.level, ids: d.ids }); api.save(); } if (!(api.state.done || {})[p.id]) api.complete(p.id); return sent(d); }
          if (c.sentAt) return send(c.auto || null);   // sent here but never reached the cloud: try again
          if (!c.ids && ((api.state.done || {})[p.id] || Object.keys(api.state.first || {}).length)) return legacy();   // done before it was secure: it stays done
          intro();
        } catch (e) { console.warn('checkpoint', e); if (c.sentAt) sent(); else intro(); }
      });
    }
    return { html, bind };
  }
  return { panel, stop };
})();
