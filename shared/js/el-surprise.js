/* 🎲 Surprise questions / Preguntes sorpresa (Roger, 21 Nov 2026: "They will press record and then a random question about the LS will
   pop up so that they have to use what we've learned. There will be 4 questions, from easy to more complex and according to their level.
   We will provide feedback to improve and we will mark them like the rest of the speaking but students will only see done, not done and
   things to improve"). A learning path step of the LS2 engines (type 'surprise'):
   - The student presses ● Start: the recording starts at once (el-mic.js keeps the clip of the Start button), and only then do the
     questions appear, one at a time, never before. One question per step of the bank, drawn at random: 1 About you · 2 Describe it ·
     3 the LS grammar · 4 Your opinion (bank tiers). Each tier has several questions per level, so classmates side by side get different ones.
   - By level (CFG): Starter reads the question with the Catalan and a sentence starter, Base with the Catalan and help words, both
     hear it slower; Core hears it first (the text shows when the voice ends) and can tap 💡 for two key words (the teacher sees it);
     Plus and Pro hear it, no help, longer answers. A few seconds to think, then the answer time (it grows from question 1 to 4);
     Next is ready after NEXT_AFTER seconds of answering, and the next question comes by itself when the time runs out.
   - ■ Stop ends the round: a new round always draws new questions (no waiting for easy ones). One recording per round.
   - Handed in like Speaking and Talk (ctx.handRec: the recording to the teacher's Drive with Roig's transcript and notes), with the four
     questions as the first field and sq: 1, so the Wednesday run writes "Things to improve" (el-marking.js mode 'surprise', sqText) and
     never a level. The teacher's 🔍 Analyse gives the speaking levels as for every recording. Students see only Done / Not done
     (the step's tick, To do) and the correction at the top of the tab.
   The bank is window.EL_SURPRISE[p.bank] (the LS's data/surprise.js): {tiers:[{en,ca}×4], <route>:[[{q, ca?, h?, lp}…]×4]}; h = the
   sentence starter (Starter) or the help words (Base, Core); lp = the learning path a question needs: a step with upTo: n draws only
   questions with lp ≤ n. ctx = the engine's helpers (ls2-engine.js R.surprise). */
(function () {
  if (window.elSurprise) return;
  const CFG = {
    beginners: { think: 8, ans: [20, 20, 25, 30], help: 'start', rate: 0.85 },
    insecure: { think: 8, ans: [20, 25, 30, 35], help: 'chips', rate: 0.85 },
    safe: { think: 5, ans: [25, 30, 35, 45], help: 'tap', rate: 0.95 },
    daring: { think: 5, ans: [30, 35, 45, 60], help: null, rate: 0.95 },
    native: { think: 5, ans: [30, 40, 50, 60], help: null, rate: 1 }
  };
  const NEXT_AFTER = 8, MIN_SECS = 24, RUN = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mmss = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  if (!document.getElementById('elSqCss')) document.head.insertAdjacentHTML('beforeend', '<style id="elSqCss">'
    + '.sq-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0}.sq-steps div{background:var(--soft,#e9f5ef);border-radius:14px;padding:12px;font-size:.93rem}.sq-steps b{display:block;font-size:1.25rem;color:var(--accent,#1f6b52)}'
    + '.sq-stage{border-radius:20px;background:var(--soft,#e9f5ef);padding:16px;display:grid;gap:12px}'
    + '.sq-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}'
    + '.sq-rec{display:inline-flex;align-items:center;gap:8px;font-weight:800;color:#b42318;background:#fdecea;padding:5px 11px;border-radius:999px;font-variant-numeric:tabular-nums}.sq-rec i{width:10px;height:10px;border-radius:50%;background:#d92d20;animation:sqBlink 1s infinite}@keyframes sqBlink{50%{opacity:.25}}'
    + '.sq-dots{display:flex;gap:6px}.sq-dots span{width:34px;height:8px;border-radius:99px;background:var(--soft2,#d8eee3)}.sq-dots .on{background:var(--accent,#1f6b52)}.sq-dots .done{background:var(--dark,#174d3d)}'
    + '.sq-q{background:#fff;border-radius:18px;padding:18px;border:2px solid var(--accent,#1f6b52);display:grid;gap:10px}.sq-q.pop{animation:sqPop .45s cubic-bezier(.2,1.4,.4,1)}@keyframes sqPop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}'
    + '.sq-qn{font-size:.8rem;font-weight:800;color:var(--accent,#1f6b52);letter-spacing:.04em;text-transform:uppercase}.sq-qt{font-size:1.4rem;line-height:1.3;font-weight:750;color:var(--ink,#20312b);margin:0}.sq-ca{color:var(--muted,#66766f);margin:0}'
    + '.sq-start{background:#fff4dc;color:#7a4a00;border-radius:12px;padding:9px 12px;font-weight:650;margin:0}.sq-chips{display:flex;gap:6px;flex-wrap:wrap}.sq-chips span{background:var(--soft,#e9f5ef);color:var(--dark,#174d3d);border-radius:999px;padding:3px 10px;font-size:.88rem;font-weight:700}'
    + '.sq-bar{height:10px;border-radius:99px;background:var(--soft2,#d8eee3);overflow:hidden}.sq-bar i{display:block;height:100%;background:var(--accent,#1f6b52);transition:width 1s linear}.sq-bar.think i{background:#b7791f}'
    + '.sq-st{font-weight:700;color:var(--dark,#174d3d);font-variant-numeric:tabular-nums;margin:0}.sq-big{font-size:3.2rem;font-weight:800;text-align:center;color:var(--accent,#1f6b52);padding:26px 0;margin:0}'
    + '@media (max-width:640px){.sq-steps{grid-template-columns:1fr}.sq-qt{font-size:1.15rem}}@media (prefers-reduced-motion:reduce){.sq-q.pop{animation:none}.sq-rec i{animation:none}.sq-bar i{transition:none}}</style>');

  function bankOf(p, level) {
    const B = (window.EL_SURPRISE || {})[p.bank]; if (!B) return null;
    const rows = B[level] || (level === 'native' ? B.daring : null) || B.insecure; return rows ? { tiers: B.tiers || [], rows } : null;
  }
  // one question per tier, from the paths done (lp ≤ upTo), not one of the last round's when there is another
  function draw(p, level, last) {
    const B = bankOf(p, level); if (!B) return [];
    return B.rows.map((tier, i) => {
      const pool = tier.filter(q => !p.upTo || (q.lp || 1) <= p.upTo), fresh = pool.filter(q => !(last || []).includes(q.q)), from = fresh.length ? fresh : pool;
      return from.length ? Object.assign({ tier: i }, from[Math.floor(Math.random() * from.length)]) : null;
    }).filter(Boolean);
  }

  function panel(p, X) {
    const id = p.id, T = (c, e) => X.ca() ? c : e, el = s => document.getElementById(id + s);
    const cfg = () => CFG[X.level] || CFG.insecure, tierName = i => { const B = bankOf(p, X.level), t = B && B.tiers[i]; return t ? T(t.ca || t.en, t.en) : ''; };
    const R = RUN[id] = RUN[id] || { phase: 'idle', qs: [], k: 0, left: 0, secs: 0, helped: [], tick: null, clock: null, stream: null, url: null };
    const html = '<div class="section-card"><h3>' + T('Com funciona', 'How it works') + '</h3>'
      + '<p class="instruction">' + T('No veuràs les preguntes abans. Prem <strong>Comença</strong>: es comença a gravar i les preguntes surten una a una, de més fàcil a més difícil. Respon en veu alta amb frases completes i fes servir el que hem après.', 'You won’t see the questions before. Press <strong>Start</strong>: the recording starts and the questions pop up one by one, from easy to harder. Answer out loud in full sentences and use what we’ve learned.') + '</p>'
      + '<div class="sq-steps"><div><b>1</b>' + T('Prem Comença: et graves des del principi.', 'Press Start: you are recorded from the start.') + '</div><div><b>2</b>' + T('Surt una pregunta. Tens uns segons per pensar i després parles.', 'A question pops up. You get a few seconds to think, then you speak.') + '</div><div><b>3</b>' + T('Quan acabes, prem Següent. Després de la quarta, escolta’t i entrega-ho.', 'When you finish, press Next. After the fourth, listen to yourself and hand it in.') + '</div></div>'
      + '<p class="tiny">' + T('Millor amb auriculars.', 'Headphones help.') + '</p>'
      + '<div class="actions" style="justify-content:flex-start"><button class="btn" type="button" id="' + id + 'Start">● ' + T('Comença', 'Start') + '</button></div><p class="feedback" id="' + id + 'Msg"></p></div>'
      + '<div id="' + id + 'Stage"></div>'
      + '<div class="section-card" id="' + id + 'Hand" hidden><h3>' + T('Entrega-ho al professor', 'Hand it in') + '</h3><audio id="' + id + 'Audio" controls style="width:100%"></audio>'
      + '<p class="instruction">' + T('Escolta’t. Quan t’agradi com ha quedat, entrega-ho: el professor rebrà la gravació i et tornarà aquí mateix què pots millorar. Si en fas una altra ronda, sortiran preguntes noves.', 'Listen to yourself. When you are happy with it, hand it in: your teacher gets the recording and will tell you right here what to improve. If you do another round, you will get new questions.') + '</p>'
      + '<p class="tiny" id="' + id + 'Asked"></p><div class="actions"><button class="btn" type="button" id="' + id + 'Send">' + T('Entrega al professor', 'Hand it in to my teacher') + '</button></div><p class="feedback" id="' + id + 'Hmsg"></p></div>';

    const stopTimers = () => { clearInterval(R.tick); R.tick = null; };
    const stopRec = () => { clearInterval(R.clock); R.clock = null; if (R.stream) { R.stream.getTracks().forEach(t => t.stop()); R.stream = null; } X.stopSay(); };
    const msg = (t, c) => { ['Msg', 'Hmsg'].forEach(k => { const m = el(k); if (m) { m.className = 'feedback' + (c ? ' ' + c : ''); m.textContent = ''; } });   // the message shows where the student is: the hand-in card while it is open
      const m = el(R.phase === 'review' ? 'Hmsg' : 'Msg'); if (m) m.textContent = t || ''; };
    const handed = () => { const h = ((X.state || {}).steps || {})[id]; if (!h) return '';
      return T('Entregada el ' + new Date(h.date).toLocaleDateString() + '. El professor et dirà aquí mateix què pots millorar. Pots fer una altra ronda i tornar-la a entregar.', 'Handed in on ' + new Date(h.date).toLocaleDateString() + '. Your teacher will tell you right here what to improve. You can do another round and hand it in again.'); };

    function paint() {
      const st = el('Stage'), start = el('Start'), hand = el('Hand'); if (!st) return;
      if (start) start.disabled = R.phase !== 'idle' && R.phase !== 'review';
      if (hand) hand.hidden = R.phase !== 'review';
      if (R.phase === 'idle' || R.phase === 'review') { st.innerHTML = ''; return; }
      const top = '<div class="sq-top"><span class="sq-rec"><i></i>REC <span id="' + id + 'Clock">' + mmss(R.secs) + '</span></span><span class="sq-dots">'
        + [0, 1, 2, 3].map(i => '<span class="' + (i < R.k ? 'done' : i === R.k && R.phase !== 'count' ? 'on' : '') + '"></span>').join('') + '</span>'
        + '<button class="btn secondary" type="button" id="' + id + 'Stop">■ ' + T('Atura', 'Stop') + '</button></div>';
      if (R.phase === 'count') { st.innerHTML = '<div class="sq-stage">' + top + '<p class="sq-big" aria-live="polite">' + R.left + '</p><p class="sq-st" style="text-align:center">' + T('Prepara’t… ja t’estàs gravant.', 'Get ready… you are being recorded.') + '</p></div>'; bindStage(); return; }
      const q = R.qs[R.k], c = cfg(), shown = R.heard;
      let help = '';
      if (shown && q.h && c.help === 'start') help = '<p class="sq-start">💬 ' + esc(q.h) + '</p>';
      else if (shown && q.h && (c.help === 'chips' || c.help === 'tap' && R.helped.includes(R.k))) help = '<div class="sq-chips">' + [].concat(q.h).map(w => '<span>' + esc(w) + '</span>').join('') + '</div>';
      else if (shown && q.h && c.help === 'tap') help = '<div><button class="btn secondary" type="button" id="' + id + 'Help">💡 Help</button></div>';
      st.innerHTML = '<div class="sq-stage">' + top + '<div class="sq-q' + (R.pop ? ' pop' : '') + '"><span class="sq-qn">' + T('Pregunta', 'Question') + ' ' + (R.k + 1) + ' / ' + R.qs.length + (tierName(q.tier) ? ' · ' + esc(tierName(q.tier)) : '') + '</span>'
        + (shown ? '<p class="sq-qt">' + esc(q.q) + '</p>' + (X.ca() && q.ca ? '<p class="sq-ca">(' + esc(q.ca) + ')</p>' : '') : '<p class="sq-ca" style="font-weight:700">🔊 ' + T('Escolta la pregunta…', 'Listen to the question…') + '</p>') + help
        + '<div class="sq-bar' + (R.phase === 'think' ? ' think' : '') + '"><i id="' + id + 'Bar"></i></div><p class="sq-st" id="' + id + 'St" aria-live="polite"></p>'
        + '<div class="actions" style="justify-content:flex-start"><button class="btn secondary" type="button" id="' + id + 'Again">🔊 ' + T('Torna-la a sentir', 'Hear it again') + '</button>'
        + (R.phase === 'answer' ? '<button class="btn" type="button" id="' + id + 'Next">' + (R.k < R.qs.length - 1 ? T('Següent pregunta ⏭', 'Next question ⏭') : T('He acabat ✓', 'I’ve finished ✓')) + '</button>' : '<button class="btn" type="button" id="' + id + 'Now">' + T('Ja puc parlar', 'I’m ready to speak') + '</button>') + '</div></div></div>';
      R.pop = false; bindStage(); upd();
    }
    function upd() {
      const s = el('St'), b = el('Bar'), n = el('Next'), c = cfg();
      if (R.phase === 'think') { if (s) s.textContent = T('Pensa… comences a parlar d’aquí a ', 'Think… you start speaking in ') + R.left + ' s'; if (b) b.style.width = (R.left / c.think * 100) + '%'; }
      if (R.phase === 'answer') { if (s) s.textContent = T('Parla ara… ', 'Speak now… ') + R.left + ' s'; if (b) b.style.width = (R.left / R.full * 100) + '%'; if (n) n.disabled = R.ready < NEXT_AFTER; }
    }
    function bindStage() {
      const on = (s, f) => { const b = el(s); if (b) b.onclick = f; };
      on('Stop', () => { stopTimers(); stopRec(); spend(); R.phase = 'idle'; paint(); msg(T('Has aturat la ronda. Prem Comença per fer-ne una de nova: sortiran preguntes noves.', 'You stopped the round. Press Start for a new one: you will get new questions.'), 'no'); });
      on('Again', () => { const q = R.qs[R.k]; X.sayLine(q.q, cfg().rate, () => { if (!R.heard) { R.heard = true; paint(); } }); });
      on('Now', () => answer());
      on('Next', () => next());
      on('Help', () => { R.helped.push(R.k); paint(); });
    }
    // the round's questions are spent once it has started (state.sq[id].last), so a new round draws others
    function spend() { const S = X.state; S.sq = S.sq || {}; S.sq[id] = { last: R.qs.map(q => q.q), at: new Date().toISOString() }; X.save(); }
    function ask() {
      stopTimers(); const c = cfg(), q = R.qs[R.k];
      R.phase = 'think'; R.left = c.think; R.heard = X.ca(); R.pop = true; paint();
      // Core and up hear the question first: its text shows when the voice ends (or after a few seconds if the voice does not start)
      let once = false; const heard = () => { if (once) return; once = true; if (!R.heard && R.phase !== 'idle') { R.heard = true; paint(); } };
      X.sayLine(q.q, c.rate, heard); setTimeout(heard, 6000);
      R.tick = setInterval(() => { if (--R.left <= 0) answer(); else upd(); }, 1000);
    }
    function answer() {
      stopTimers(); R.phase = 'answer'; R.heard = true; R.full = R.left = cfg().ans[R.k] || 30; R.ready = 0; paint();
      R.tick = setInterval(() => { R.ready++; if (--R.left <= 0) next(); else upd(); }, 1000);
    }
    function next() { stopTimers(); X.stopSay(); R.k++; if (R.k >= R.qs.length) finish(); else ask(); }
    function finish() {
      stopTimers(); stopRec(); R.phase = 'review'; R.done = true; paint();
      el('Asked').textContent = T('Les teves preguntes: ', 'Your questions: ') + R.qs.map((q, i) => (i + 1) + '. ' + q.q).join(' · ');
      msg(''); const hd = el('Hand'); if (hd) hd.scrollIntoView({ behavior: 'smooth', block: 'center' });   // the hand-in card can be below the screen on a Chromebook
      // el-mic.js keeps the compressed clip when the tracks stop: play it here
      setTimeout(() => { const c = window.elMic && elMic.clip && elMic.clip(), a = el('Audio'); if (!a) return;
        if (c && c.blob) { if (R.url) URL.revokeObjectURL(R.url); R.url = URL.createObjectURL(c.blob); a.src = R.url; } else a.hidden = true; }, 600);
    }
    async function start() {
      if (R.phase !== 'idle' && R.phase !== 'review') return;
      const S = X.state, last = ((S.sq || {})[id] || {}).last || [];
      R.qs = draw(p, X.level, last);
      if (R.qs.length < 1) { msg(T('Aquesta activitat encara no té preguntes.', 'This activity has no questions yet.'), 'no'); return; }
      el('Start').disabled = true; msg('');
      try { R.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { el('Start').disabled = false; msg(T('No s’ha pogut fer servir el micròfon. Mira el missatge de sota.', 'The microphone was not available. See the message below.'), 'no'); return; }
      R.k = 0; R.secs = 0; R.helped = []; R.done = false; R.phase = 'count'; R.left = 3; spend(); paint();
      { const st = el('Stage'); if (st) st.scrollIntoView({ behavior: 'smooth', block: 'center' }); }   // the questions show below the card: bring them into view
      R.clock = setInterval(() => { R.secs++; const c = el('Clock'); if (c) c.textContent = mmss(R.secs); }, 1000);
      R.tick = setInterval(() => { if (--R.left <= 0) ask(); else paint(); }, 1000);
    }
    let sending = false;
    async function send() {
      if (sending || !R.done) return;
      const secs = X.recSecs(id + 'Start');
      if (secs < MIN_SECS) { msg(T('La gravació és massa curta. Fes una ronda nova i respon les quatre preguntes. Si el micròfon no funciona, prem 🎙️ No puc gravar.', 'The recording is too short. Do a new round and answer the four questions. If the microphone doesn’t work, press 🎙️ I can’t record.'), 'no'); return; }
      const title = X.tx(p.title), asked = R.qs.map((q, i) => (i + 1) + '. ' + q.q).join('\n');
      const task = 'Surprise questions: the student had not seen the questions; they answered them on the spot, from easy to harder. Questions: ' + R.qs.map(q => q.q).join(' / ');
      sending = true; msg(T('Enviant la gravació al professor…', 'Sending your recording to your teacher…'));
      const r = await X.handRec(id + 'Start', id, title, task); sending = false;
      if (!r) { msg(T('La gravació no s’ha pogut enviar. Torna-ho a provar d’aquí a una estona.', 'Your recording could not be sent. Try again in a moment.'), 'no'); return; }
      const S = X.state; S.steps = S.steps || {};
      const f = [{ l: 'Questions asked', v: asked }].concat(R.helped.length ? [{ l: 'Help used', v: '💡 on question ' + R.helped.map(k => k + 1).join(', ') }] : [], r.f);
      S.steps[id] = { level: X.level, title, ty: null, sq: 1, audio: r.audio, f, rate: [], avg: null, comment: '', date: new Date().toISOString() };
      X.complete(id); X.save(); R.phase = 'idle'; paint();
      msg(T('Entregada ✓ ', 'Handed in ✓ ') + handed() + ' 🔊', 'ok');
    }
    return {
      html,
      bind() {
        X.cantRow(el('Start').closest('.section-card'), id, X.tx(p.title));
        el('Start').onclick = start; el('Send').onclick = send;
        if (R.phase === 'idle' && handed()) msg(handed(), 'ok');
        paint();
        if (R.phase === 'review') { const a = el('Audio'); if (R.url) a.src = R.url; el('Asked').textContent = T('Les teves preguntes: ', 'Your questions: ') + R.qs.map((q, i) => (i + 1) + '. ' + q.q).join(' · '); }
      }
    };
  }
  window.elSurprise = { panel, draw, CFG };
})();
