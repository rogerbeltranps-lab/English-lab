/* Free Time, Live! (2 ESO, LS2): renders a Learning Path from the page's window.LP config. Copied from 4 ESO LS2 (the living model);
   only the page list, the storage keys, the LS names in the AI prompts and the route levels differ.
   Content lives in each page; this file only holds the activity types, scoring and progress.
   Routes are cumulative: an item with r:"safe" is shown to Safe and Daring. Auto-corrected steps
   complete at 80 % (rounded up); the recall warm-up completes when submitted and keeps the first attempt. */
var LS2 = (function () {
  // Beginners (A1) sits below Insecure: it sees every untagged item and, where a text or list has no 'beginners' version, the Insecure one.
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
  const PAGES = [
    ['getting-started.html', '1 · Getting started'],
    ['what-are-they-doing.html', '2 · What are they doing?'],
    ['recall-checkpoint-1.html', 'Recall checkpoint 1'],
    ['now-or-usually.html', '3 · Now or usually?'],
    ['recall-checkpoint-2.html', 'Recall checkpoint 2'],
    ['check-the-source.html', '4 · Check the source'],
    ['likes-and-screen-tips.html', '5 · Likes and screen tips'],
    ['recall-checkpoint-3.html', 'Recall checkpoint 3'],
    ['write-your-vlog-script.html', '6 · Write your vlog script'],
    ['recall-checkpoint-4.html', 'Recall checkpoint 4'],
    ['sample-exam.html', 'Sample exam'],
    ['free-time-vlog.html', '7 · Final product'],
    ['reflect.html', 'Reflect']
  ];
  const PRODUCTS = 'ls2Products2ESO';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  let LP, level, state;
  const ca = () => level === 'insecure' || level === 'beginners';
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca() ? (o.ca || o.en) : (o.en || o.ca));
  const byLevel = o => o == null ? '' : typeof o === 'string' ? o : (o[level] != null ? o[level] : o.safe != null && level === 'daring' ? o.safe : o.insecure);   // beginners → insecure
  // A list is cumulative (r: tags); an object keyed by route gives each route its own list (the sample exam: same number of items per route).
  const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level)) : (items[level] || (level === 'beginners' ? items.insecure : null) || []);
  const need = n => Math.ceil(n * 0.8);
  const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const words = s => (String(s).trim().match(/\S+/g) || []).length;

  function save() { localStorage.setItem(LP.key, JSON.stringify(state)); localStorage.setItem(LP.key + 'Level', level); progress(); }
  // doneAt[k]: when the step was first completed; tries[k]: the first check of an auto-corrected step. The teacher dashboard
  // uses them for the grammar and vocabulary block (first try + done by the session deadline in el-plan.js).
  // last[k]: the latest check, shown on the dashboard next to the first try (never counted).
  function complete(k) { if (!state.done[k]) { state.done[k] = true; stamp(k); save(); } else progress(); }
  function stamp(k) { state.doneAt = state.doneAt || {}; if (!state.doneAt[k]) state.doneAt[k] = new Date().toISOString(); }
  function lastTry(k, score, max) { state.last = state.last || {}; state.last[k] = { score, max, level, date: new Date().toISOString() }; }
  function firstTry(k, score, max) { state.tries = state.tries || {}; if (!state.tries[k]) state.tries[k] = { score, max, level, date: new Date().toISOString() }; lastTry(k, score, max); save(); }
  // items[panel_route]: every question of a panel's first counted check, kept once per route, for the dashboard's Question analysis
  // (Roger, 26 Oct 2026). q: the question's place in the page's list (in the route's own list when the page gives one per route),
  // ok: 1 right / 0 wrong, a: what was typed or the option chosen (0 = the right one). Students never see it.
  function firstItems(id, src, items, got) {
    state.items = state.items || {}; const k = id + '_' + level; if (state.items[k]) return;
    state.items[k] = { level, date: new Date().toISOString(), q: items.map((it, i) => Array.isArray(src) ? src.indexOf(it) : i), ok: got.map(g => g[0] ? 1 : 0), a: got.map(g => g[1]) }; save();
  }
  function steps() { return LP.panels.flatMap(p => p.type === 'info' || p.type === 'summary' ? [] : p.type === 'vocab' ? (p.practice ? ['cards', 'practice'] : ['cards']) : [p.id]); }
  function progress() {
    const s = steps(), n = s.filter(k => state.done[k]).length;
    $('#progressLabel').textContent = cap(level);
    $('#progressText').textContent = n + ' / ' + s.length;
    $('#progressBar').style.width = (n / s.length * 100) + '%';
  }
  function saveProduct(piece, text) {
    let all = {}; try { all = JSON.parse(localStorage.getItem(PRODUCTS) || '{}'); } catch (e) {}
    all[piece] = { level, text, date: new Date().toISOString() };
    localStorage.setItem(PRODUCTS, JSON.stringify(all));
  }

  /* ---------- continuous assessment note (Roger, 26 Oct 2026) ---------- */
  // The same note on every page: the teacher tracks every activity and some are assessed. Never say which steps count.
  function trackNote() {
    return '<p class="track-note">' + (ca()
      ? '📋 <strong>El professor fa el seguiment de totes les activitats que fas.</strong> Algunes s’avaluaran i seran la teva avaluació contínua, que és una part de la nota. Fes cada activitat tu sol/a i sense apunts la primera vegada; després la pots repetir per practicar. Acaba-les a temps: mira «El meu pla setmanal» al teu tauler.'
      : '📋 <strong>Your teacher keeps track of all the activities you do.</strong> Some of them will be assessed and make up your continuous assessment, which is part of your mark. Do each activity on your own and without notes the first time; you can repeat it later to practise. Finish them on time: check “My week plan” on your board.') + '</p>';
  }

  /* ---------- typed answers (recall, practice, grammar) ---------- */
  const tries = {};
  /* Four skills (Roger, 30 Oct 2026: “work the 4 communicative competences equally”): Use of English practice can also be heard or said.
     mode 'listen' (listen and complete): the browser's English voice says the sentence with a beep for the gap; the student types the missing
     words and opens the written sentence only if they need it. mode 'say' (say it): the student reads the sentence and says it whole; speech
     recognition fills the box when it hears an accepted answer. Without speech recognition, after a mic error or two misses, the box can be typed in. */
  const SRC = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceEn = () => { const s = window.speechSynthesis; if (!s) return null; const v = s.getVoices(); return v.find(x => /^en(-|_)GB/i.test(x.lang)) || v.find(x => /^en(-|_)/i.test(x.lang)) || null; };
  const spoken = q => String(q).replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, ' ').replace(/→/g, '. ').replace(/[“”]/g, '').replace(/\s+/g, ' ').trim();
  const cue = q => (String(q).replace(/<[^>]+>/g, '').match(/\([^)]*\)/g) || []).join(' ');
  let sayTok = 0, utt = [], bctx = null;
  function beep(done) { try { bctx = bctx || new (window.AudioContext || window.webkitAudioContext)(); const o = bctx.createOscillator(), g = bctx.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(bctx.destination); o.start(); setTimeout(() => { o.stop(); done && done(); }, 450); } catch (e) { done && done(); } }
  // Says text (or a gapped sentence, with a beep for each gap) in order; a newer call stops an older one.
  function sayLine(q, rate, onend) {
    const s = window.speechSynthesis; if (!s) { if (onend) onend(); return; } s.cancel(); const tok = ++sayTok;
    const seq = String(q).replace(/<[^>]+>/g, '').split(/_{2,}(?:[\s/]*_{2,})*/).flatMap((t, i) => i ? [null, t] : [t]).filter(t => t === null || /[A-Za-z0-9]/.test(spoken(t)));
    let i = 0; utt = [];
    const next = () => { if (tok !== sayTok) return; if (i >= seq.length) { if (onend) onend(); return; } const t = seq[i++]; if (t === null) return beep(next);
      // a browser without English voices may never fire 'end': a watchdog moves on after the time the line needs
      const u = new SpeechSynthesisUtterance(spoken(t)), v = voiceEn(); let once = false; const go = () => { if (!once) { once = true; next(); } };
      u.lang = 'en-GB'; if (v) u.voice = v; u.rate = rate || 0.95; u.onend = u.onerror = go; utt.push(u); s.speak(u);
      setTimeout(go, 1500 + spoken(t).split(' ').length * 450 / (rate || 0.95)); };
    next();
  }
  const modeHow = m => m === 'listen' ? (ca() ? 'Prem ▶, escolta la frase i escriu el que falta on sents el xiulet. Obre la frase només si ho necessites.' : 'Press ▶, listen to the sentence and type what is missing where you hear the beep. Open the sentence only if you need it.')
    : m === 'say' ? (ca() ? 'Llegeix la frase, prem 🎤 i digues-la sencera en veu alta, amb el que falta. Si l’ordinador no t’entén dues vegades, la pots escriure.' : 'Read the sentence, press 🎤 and say the whole sentence aloud, with what is missing. If the computer doesn’t understand you twice, you can type it.') : '';
  function typedHtml(items, prefix, mode) {
    return items.map((it, i) => '<div class="question">' + (mode === 'listen'
        ? '<div class="actions" style="justify-content:flex-start;align-items:center"><strong>' + (i + 1) + '.</strong><button class="btn secondary" type="button" data-hear="' + prefix + i + '">▶ ' + (ca() ? 'Escolta' : 'Listen') + '</button><button class="btn secondary" type="button" data-hear-slow="' + prefix + i + '">🐢 ' + (ca() ? 'Més lent' : 'Slower') + '</button>' + (cue(it.q) ? '<span class="tiny">' + esc(cue(it.q)) + '</span>' : '') + '</div>' +
          '<details class="draft-box"><summary>' + (ca() ? 'Mostra la frase' : 'Show the sentence') + '</summary><p class="q-title">' + it.q + '</p></details>'
        : '<p class="q-title">' + (i + 1) + '. ' + it.q + '</p>' + (mode === 'say' ? '<div class="actions" style="justify-content:flex-start;align-items:center"><button class="btn secondary" type="button" data-mic="' + prefix + i + '"' + (SRC() ? '' : ' hidden') + '>🎤 ' + (ca() ? 'Digues la frase' : 'Say the sentence') + '</button><span class="tiny" id="' + prefix + 'h' + i + '"></span></div>' : '')) +
      '<input type="text" class="typed" id="' + prefix + i + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (mode === 'say' && SRC() ? ' readonly placeholder="' + (ca() ? 'Prem 🎤 i digues la frase' : 'Press 🎤 and say the sentence') + '"' : '') + '>' +
      '<div class="feedback" id="' + prefix + 'f' + i + '"></div></div>').join('');
  }
  const expand = s => (' ' + norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
  // the accepted answer the student said (in any recognition alternative), or null
  const saidAnswer = (alts, answers) => { const heard = alts.map(expand); return answers.find(a => { const x = expand(a); return x.trim() && heard.some(h => h.includes(x)); }) || null; };
  function bindModes(items, prefix, mode) {
    if (mode === 'listen') items.forEach((it, i) => {
      $('[data-hear="' + prefix + i + '"]').onclick = () => sayLine(it.q, 0.9);
      $('[data-hear-slow="' + prefix + i + '"]').onclick = () => sayLine(it.q, 0.65);
    });
    const SR = SRC(); if (mode !== 'say' || !SR) return;
    items.forEach((it, i) => {
      const b = $('[data-mic="' + prefix + i + '"]'), box = $('#' + prefix + i), h = $('#' + prefix + 'h' + i), k = prefix + i + 'say';
      b.onclick = () => {
        let r; try { r = new SR(); } catch (e) { box.readOnly = false; return; }
        r.lang = 'en-GB'; r.interimResults = false; r.maxAlternatives = 5; b.disabled = true; h.textContent = ca() ? 'T’escolto…' : 'Listening…';
        r.onresult = e => {
          const alts = Array.from(e.results[0]).map(x => x.transcript), hit = saidAnswer(alts, it.a), said = (ca() ? 'He sentit: ' : 'I heard: ') + '“' + alts[0] + '”';
          if (hit) { box.value = hit; h.textContent = said + ' ✓'; box.dispatchEvent(new Event('input', { bubbles: true })); return; }
          tries[k] = (tries[k] || 0) + 1; if (tries[k] >= 2) box.readOnly = false;
          h.textContent = said + '. ' + (tries[k] >= 2 ? (ca() ? 'Pots escriure-ho a la casella.' : 'You can type it in the box.') : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
        };
        r.onerror = () => { box.readOnly = false; h.textContent = ca() ? 'No t’he sentit. Torna-ho a provar o escriu-ho.' : 'I couldn’t hear you. Try again or type it.'; };
        r.onend = () => { b.disabled = false; if (h.textContent === 'T’escolto…' || h.textContent === 'Listening…') h.textContent = ''; };
        try { r.start(); } catch (e) { b.disabled = false; box.readOnly = false; }
      };
    });
  }
  // reveal: true shows the answer at once (recall); otherwise the answer appears after the second wrong try.
  // got: [right, what was typed] per question of the last check (firstItems)
  let got = [];
  const typedAs = el => String(el.value || '').trim().slice(0, 40);
  function checkTyped(items, prefix, reveal, count) {
    let score = 0; got = [];
    items.forEach((it, i) => {
      const v = norm($('#' + prefix + i).value), ok = it.a.some(a => norm(a) === v), f = $('#' + prefix + 'f' + i);
      got.push([ok, typedAs($('#' + prefix + i))]);
      const key = prefix + i;
      if (ok) score++; else if (v && count !== false) tries[key] = (tries[key] || 0) + 1;
      const why = ca() ? (it.ca || it.en || '') : (it.en || it.ca || '');
      const show = reveal || tries[key] >= 2;
      f.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!')
        : !v ? (ca() ? 'Escriu una resposta.' : 'Type an answer.')
        : (ca() ? 'Encara no. ' : 'Not yet. ') + (why ? why + ' ' : '') +
          (show ? (ca() ? 'Resposta: ' : 'Answer: ') + '<strong>' + esc(it.a[0]) + '</strong>'
                : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
      f.className = 'feedback ' + (ok ? 'ok' : 'no');
    });
    return score;
  }
  function result(el, score, n, done, extra) {
    el.textContent = score + ' / ' + n + (ca() ? ' correctes' : ' correct') +
      (done ? (ca() ? ' · Pas completat ✓' : ' · Step complete ✓')
            : (ca() ? ' · Necessites ' + need(n) + ' per completar el pas.' : ' · You need ' + need(n) + ' to complete the step.')) + (extra || '');
    el.classList.add('show');
  }
  /* ---------- answers and feedback stay (Roger, 26 Oct 2026) ---------- */
  // What a student typed or chose, with its feedback, is back when they return to the page (state.ans[id], synced like the rest),
  // until they press "Do it again" next to Check. A restore shows the feedback again without counting a try.
  // Answers not checked yet stay too (state.typing[id_route], saved as the student types or chooses), so leaving the page for a
  // presentation or a game loses nothing (problem report, 26 Oct 2026).
  function keep(id, prefix, v) { state.ans = state.ans || {}; state.ans[id] = { v, tries: Object.fromEntries(Object.entries(tries).filter(([k]) => k.startsWith(prefix))) }; if (state.typing) delete state.typing[id + '_' + level]; save(); }
  function kept(id) { const a = state.ans && state.ans[id]; if (a) Object.assign(tries, a.tries || {}); return a ? a.v : null; }
  function forget(id, prefix) { if (state.ans) delete state.ans[id]; if (state.typing) delete state.typing[id + '_' + level]; Object.keys(tries).forEach(k => { if (k.startsWith(prefix)) delete tries[k]; }); save(); }
  const againBtn = id => '<button class="btn secondary" type="button" id="' + id + 'Again">' + (ca() ? 'Torna-ho a fer' : 'Do it again') + '</button>';
  const vals = (items, prefix) => items.map((q, i) => { if (q.o) { const c = document.querySelector('input[name="' + prefix + i + '"]:checked'); return c ? +c.value : null; } const t = $('#' + prefix + i); return t ? t.value : null; });
  function fill(items, prefix, v) { items.forEach((q, i) => { if (q.o) { const c = document.querySelector('input[name="' + prefix + i + '"][value="' + v[i] + '"]'); if (c) c.checked = true; } else { const t = $('#' + prefix + i); if (t) t.value = v[i] || ''; } }); }
  function clearStep(id, listId) { $$('#' + listId + ' input').forEach(x => { if (x.type === 'radio') x.checked = false; else x.value = ''; }); $$('#' + listId + ' .feedback').forEach(f => { f.textContent = ''; f.className = 'feedback'; }); const r = $('#' + id + 'Result'); if (r) { r.textContent = ''; r.classList.remove('show'); } }
  // check(count): the step's own check; stays(id, prefix, listId, items, check) wires Check, Do it again and the restore.
  function stays(id, prefix, listId, items, check) {
    $('#' + id + 'Check').onclick = () => { check(true); keep(id, prefix, vals(items, prefix)); };
    $('#' + id + 'Again').onclick = () => { forget(id, prefix); clearStep(id, listId); };
    $('#' + listId).oninput = $('#' + listId).onchange = () => { state.typing = state.typing || {}; state.typing[id + '_' + level] = vals(items, prefix); save(); };
    const v = kept(id), t = (state.typing || {})[id + '_' + level]; if (v) { fill(items, prefix, v); check(false); } else if (t) fill(items, prefix, t);
  }

  /* ---------- panels ---------- */
  const R = {};
  R.recall = p => ({
    html: '<div class="section-card"><div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      const items = forLevel(p.items);
      $('#' + p.id + 'List').innerHTML = typedHtml(items, p.id);
      stays(p.id, p.id, p.id + 'List', items, count => {
        const s = checkTyped(items, p.id, true, count);
        if (count) {
          firstItems(p.id, p.items, items, got);
          state.first = state.first || {};
          if (!state.first[level]) state.first[level] = { score: s, max: items.length, date: new Date().toISOString() };
          lastTry(p.id, s, items.length); save();
        }
        const el = $('#' + p.id + 'Result');
        el.textContent = s + ' / ' + items.length + (ca() ? ' correctes · Pas completat ✓ Llegeix el feedback de les que has fallat.' : ' correct · Step complete ✓ Read the feedback for the ones you missed.');
        el.classList.add('show');
        if (count) complete(p.id);
      });
    }
  });

  R.vocab = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'Explora' : 'Explore') + '</h3><div class="vocab-groups" id="vocabGroups"></div>' +
      (p.receptive ? '<p class="tiny">' + (ca() ? 'Paraules que sentiràs o llegiràs (no cal aprendre-les): ' : 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '') + '</div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Targetes' : 'Study cards') + '</h3>' +
      '<div class="actions dir-toggle" role="group" aria-label="' + (ca() ? 'Direcció de les targetes' : 'Card direction') + '"><button class="btn secondary" type="button" data-dir="en">English → Català</button><button class="btn secondary" type="button" data-dir="ca">Català → English</button></div>' +
      '<p class="instruction" id="cardHow"></p>' +
      '<div class="flashcard" id="flashcard" tabindex="0"><div class="flash-inner"><div class="face front"><div class="label" id="cardIcon"></div><strong id="cardFront"></strong><p>' + (ca() ? 'Clica per girar la targeta' : 'Click to turn the card') + '</p></div><div class="face back"><div class="label" id="cardBackLabel">Català + example</div><strong id="cardMeaning"></strong><p id="cardBack"></p></div></div></div>' +
      '<div class="actions" id="cardTypeRow" hidden><input type="text" class="typed" id="cardType" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + (ca() ? 'Escriu la paraula en anglès' : 'Type the English') + '"><button class="btn" type="button" id="cardTypeCheck">' + (ca() ? 'Comprova i gira' : 'Check and turn') + '</button></div><p class="feedback" id="cardTypeMsg"></p>' +
      '<div class="counter" id="cardCounter"></div><div class="flash-actions"><button class="btn secondary" id="prevCard" type="button">← ' + (ca() ? 'Anterior' : 'Previous') + '</button><button class="btn" id="gotCard" type="button"></button><button class="btn secondary" id="againCard" type="button"></button><button class="btn secondary" id="nextCard" type="button">' + (ca() ? 'Següent' : 'Next') + ' →</button><button class="btn secondary" id="newCards" type="button"></button><button class="btn secondary" id="skipCards" type="button"></button></div><p class="instruction" id="cardNote"></p></div>' +
      (p.practice ? '<div class="section-card"><h3>' + (p.practiceMode === 'listen' ? (ca() ? 'Escolta i completa' : 'Listen and complete') : (ca() ? 'Completa les frases' : 'Complete the sentences')) + '</h3>' + (p.practiceMode ? '<p class="instruction">' + modeHow(p.practiceMode) + '</p>' : '') + '<div id="vocabPractice"></div><div class="actions"><button class="btn" type="button" id="vocabCheck">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn('vocab') + '</div><div class="result" id="vocabResult"></div></div>' : ''),
    bind() {
      const groups = forLevel(p.groups);
      $('#vocabGroups').innerHTML = groups.map(g => '<article class="vocab-group"><h3>' + g.g + '</h3><div class="chips">' + g.items.map(x => '<span class="chip" tabindex="0">' + x[0] + '<span class="chip-tooltip"><b>' + x[1] + '</b>' + x[2] + '</span></span>').join('') + '</div></article>').join('');
      /* Catalan → English (research audit, Roger 26 Oct 2026): the card shows the Catalan, the student types (or says) the English, then turns it.
         It uses the core words of the panel (p.core: a list of English words, or one list per route) and, until the LS project marks them,
         every word of the Learning Path. state.cardDir remembers the direction. */
      const dir = () => state.cardDir === 'ca' ? 'ca' : 'en';
      const coreSet = () => { const c = p.core; if (!c) return null; const l = Array.isArray(c) ? c : forLevel(c); return l.length ? new Set(l.map(norm)) : null; };
      const deck = () => {
        if (dir() === 'ca') {
          const core = coreSet(), all = forLevel(p.groups).flatMap(g => g.items.map(x => [x[1], x[0], g.g, x[2]]));
          const pick = core ? all.filter(x => core.has(norm(x[1]))) : [];
          return pick.length ? pick : all;
        }
        const own = forLevel(p.groups).flatMap(g => g.items.map(x => [x[0], x[1], g.g, x[2]]));
        const earlier = forLevel(p.review || []).flatMap(g => g.items.map(x => [x[0], x[1], g.g + ' · review', x[2]]));
        return own.concat(earlier);
      };
      const showDir = () => {
        const c = dir() === 'ca';
        $$('.dir-toggle [data-dir]').forEach(b => { const on = b.dataset.dir === dir(); b.classList.toggle('secondary', !on); b.setAttribute('aria-pressed', on); });
        $('#cardHow').textContent = c ? (ca() ? 'Llegeix la paraula en català, escriu-la o digues-la en anglès i després gira la targeta per comprovar-ho.' : 'Read the Catalan, type or say the English, then turn the card to check.')
          : (ca() ? 'Digues l’expressió en veu alta i intenta recordar què vol dir. Després gira la targeta.' : 'Say the expression aloud and try to remember its meaning. Then turn the card.');
        $('#cardBackLabel').textContent = c ? 'English + example' : 'Català + example';
        $('#cardTypeRow').hidden = !c; $('#cardType').value = ''; $('#cardTypeMsg').textContent = '';
      };
      const typedCheck = () => {
        const card = flashcardSet.cards[flashcardSet.index]; if (!card) return;
        const v = norm($('#cardType').value), ok = !!v && String(card[1]).split(/\s*[\/,;]\s*/).some(a => norm(a.replace(/\([^)]*\)/g, '')) === v || norm(a) === v);
        $('#cardTypeMsg').className = 'feedback ' + (ok ? 'ok' : 'no');
        $('#cardTypeMsg').textContent = !v ? (ca() ? 'Escriu-la o digues-la en veu alta i gira la targeta.' : 'Type it, or say it aloud and turn the card.') : ok ? (ca() ? 'Correcte! Tria «Ho sé».' : 'Correct! Choose “Got it”.') : (ca() ? 'Compara-la amb la targeta. Si no la sabies, tria «Un altre cop».' : 'Compare it with the card. If you didn’t know it, choose “Again”.');
        $('#flashcard').classList.add('flipped');
      };
      $('#flashcard').onclick = () => $('#flashcard').classList.toggle('flipped');
      $('#flashcard').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#flashcard').classList.toggle('flipped'); } };
      window.renderCards = window.renderCards || function () {};
      flashcardSet.cards = []; flashcardSet.lastLevel = null;
      if (!flashcardSet.config) flashcardSet.init({ cards: deck, level: () => level, complete: () => complete('cards'), isDone: () => !!state.done.cards });
      else { flashcardSet.config.cards = deck; flashcardSet.render(); }
      showDir();
      $$('.dir-toggle [data-dir]').forEach(b => b.onclick = () => { state.cardDir = b.dataset.dir; save(); flashcardSet.cards = []; flashcardSet.render(); showDir(); });
      new MutationObserver(() => { if (!$('#flashcard').classList.contains('flipped')) { $('#cardType').value = ''; $('#cardTypeMsg').textContent = ''; } }).observe($('#flashcard'), { attributes: true, attributeFilter: ['class'] });
      $('#cardTypeCheck').onclick = typedCheck;
      $('#cardType').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); typedCheck(); } };
      if (p.practice) {
        const items = forLevel(p.practice);
        $('#vocabPractice').innerHTML = typedHtml(items, 'vp', p.practiceMode); bindModes(items, 'vp', p.practiceMode);
        stays('vocab', 'vp', 'vocabPractice', items, count => { const s = checkTyped(items, 'vp', false, count); if (count) { firstTry('practice', s, items.length); firstItems('vocab', p.practice, items, got); } const ok = s >= need(items.length); result($('#vocabResult'), s, items.length, ok); if (ok && count) complete('practice'); });
      }
    }
  });

  function mediaHtml(p) {
    const m = p.media || {};
    let h = '';
    if (m.text) h += '<div class="reading">' + byLevel(m.text) + '</div>'; // a string, or one text per route
    if (m.youtube) h += '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + m.youtube + '" title="' + esc(m.title || 'Video') + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>' +
      '<div class="actions"><a class="btn secondary" href="https://www.youtube.com/watch?v=' + m.youtube + '" target="_blank" rel="noopener">Open on YouTube ↗</a></div>' + (m.credit ? '<p class="tiny">' + m.credit + '</p>' : '');
    // Local videos (normal + "-slow" copy, WebVTT subtitles, poster), e.g. the listening chart: media.videos = [{ base: 'video/name', title }]
    if (m.videos) h += m.videos.map((v, i) => '<div class="video-card" style="margin:14px 0"><strong>' + esc(v.title) + '</strong>' +
      '<div class="actions" role="group" aria-label="Video speed"><button class="btn secondary" type="button" data-vs="' + p.id + i + '" data-slow="0">' + (ca() ? 'Velocitat normal' : 'Normal speed') + '</button><button class="btn secondary" type="button" data-vs="' + p.id + i + '" data-slow="1">' + (ca() ? 'Versió més lenta' : 'Slower version') + '</button></div>' +
      '<video id="' + p.id + 'Video' + i + '" data-base="' + v.base + '" controls preload="metadata" playsinline style="width:100%;border-radius:14px;margin:8px 0;background:#000" poster="' + v.base + '-poster.jpg"><source src="' + v.base + '.mp4" type="video/mp4"><track kind="subtitles" srclang="en" label="English" src="' + v.base + '.vtt"></video></div>').join('') +
      (m.videoCredit ? '<p class="tiny">' + m.videoCredit + '</p>' : '');
    if (m.audio) h += '<div class="audio-card"><strong>' + esc(m.title || 'Listening') + '</strong><audio class="audio-player" id="' + p.id + 'Audio" controls preload="none" src="' + m.audio + '"></audio>' +
      (ca() ? '<div class="audio-row" id="' + p.id + 'Speed" hidden><button class="btn secondary" type="button" id="' + p.id + 'Slow">Versió més lenta</button></div>' : '') +
      '<div class="audio-row" id="' + p.id + 'Tts" hidden><button class="btn secondary" type="button" id="' + p.id + 'Speak">▶ ' + (ca() ? 'Escolta (veu de l’ordinador)' : 'Listen (computer voice)') + '</button><button class="btn secondary" type="button" id="' + p.id + 'Stop">■ Stop</button><span class="audio-status">' + (ca() ? 'L’àudio definitiu arribarà aviat.' : 'The final recording is coming soon.') + '</span></div></div>';
    return h;
  }
  // Until an MP3 exists, read the script with the browser's voices (one voice per speaker).
  function bindAudio(p) {
    const m = p.media || {};
    (m.videos || []).forEach((v, i) => {
      const vid = $('#' + p.id + 'Video' + i), btns = $$('[data-vs="' + p.id + i + '"]');
      const mark = slow => btns.forEach(b => { const on = (b.dataset.slow === '1') === slow; b.setAttribute('aria-pressed', on); b.style.setProperty('background', on ? 'var(--accent)' : '', on ? 'important' : ''); b.style.setProperty('color', on ? '#fff' : '', on ? 'important' : ''); });
      btns.forEach(b => b.onclick = () => {
        const slow = b.dataset.slow === '1', base = v.base + (slow ? '-slow' : '');
        if (vid.dataset.base !== base) { vid.dataset.base = base; vid.querySelector('source').src = base + '.mp4'; vid.querySelector('track').src = base + '.vtt'; vid.load(); }
        mark(slow);
      });
      mark(false);
    });
    if (!m.audio || !m.script) return;
    fetch(m.audio, { method: 'HEAD' }).then(r => { if (!r.ok) throw 0; }).catch(() => {
      $('#' + p.id + 'Audio').hidden = true; $('#' + p.id + 'Tts').hidden = false;
    });
    // Insecure can switch to the slower copy (same audio, made with ffmpeg) when it exists.
    const slowBtn = $('#' + p.id + 'Slow');
    if (slowBtn) {
      const slow = m.audio.replace(/\.mp3$/, '-slow.mp3');
      fetch(slow, { method: 'HEAD' }).then(r => { if (r.ok) $('#' + p.id + 'Speed').hidden = false; }).catch(() => {});
      slowBtn.onclick = () => {
        const a = $('#' + p.id + 'Audio'), toSlow = !a.src.endsWith('-slow.mp3');
        a.src = toSlow ? slow : m.audio;
        slowBtn.textContent = toSlow ? 'Velocitat normal' : 'Versió més lenta';
      };
    }
    $('#' + p.id + 'Speak').onclick = () => {
      const synth = window.speechSynthesis; if (!synth) return;
      synth.cancel();
      const voices = synth.getVoices().filter(v => /^en(-|_)/i.test(v.lang));
      const speakers = [...new Set(m.script.map(l => l[0]))];
      m.script.forEach(([who, line]) => {
        const u = new SpeechSynthesisUtterance(line), i = speakers.indexOf(who);
        u.lang = 'en-GB'; if (voices.length) u.voice = voices[i % voices.length];
        u.pitch = i % 2 ? 1.15 : 0.95; u.rate = 0.95; synth.speak(u);
      });
    };
    $('#' + p.id + 'Stop').onclick = () => window.speechSynthesis && speechSynthesis.cancel();
  }
  /* Listening cycle (research audit, Roger 27 Oct 2026): every listening (audio, YouTube or video) opens with a prediction and has a gist
     check between the first and the second listen; the questions are the second, detailed listen and the dictation (below) the third.
     Generic prompts, so no LS content is needed. Practice: not a step, not marked; saved in state.cycle[panel]. */
  const isListening = p => !!(p.media && (p.media.audio || p.media.youtube || p.media.videos));
  function predictHtml(p) {
    if (!isListening(p)) return '';
    return '<div class="cycle-box"><strong>🔮 ' + (ca() ? 'Abans d’escoltar' : 'Before you listen') + '</strong><p class="instruction">' + (ca() ? 'Llegeix el títol i les preguntes. Escriu 2 o 3 paraules o idees que creus que sentiràs.' : 'Read the title and the questions. Write 2 or 3 words or ideas you think you will hear.') + '</p>' +
      '<input type="text" class="typed" id="' + p.id + 'Predict" maxlength="160" placeholder="' + (ca() ? 'Per exemple: un lloc, una persona, un dia' : 'For example: a place, a person, a day') + '"></div>';
  }
  function gistHtml(p) {
    if (!isListening(p)) return '';
    return '<div class="cycle-box"><strong>👂 ' + (ca() ? 'Després de la primera escolta' : 'After the first listen') + '</strong><p class="instruction">' + (ca() ? 'Escolta una vegada sense mirar les preguntes. De què parla? Escriu una frase.' : 'Listen once without looking at the questions. What is it about? Write one sentence.') + '</p>' +
      '<input type="text" class="typed" id="' + p.id + 'Gist" maxlength="200">' +
      '<p class="instruction" style="margin-top:10px">' + (ca() ? 'Has sentit les paraules que havies predit?' : 'Did you hear the words you predicted?') + '</p><div class="actions" role="group">' +
      [['all', ca() ? 'Totes' : 'All of them'], ['some', ca() ? 'Algunes' : 'Some'], ['none', ca() ? 'Cap' : 'None']].map(([v, t]) => '<button class="btn secondary" type="button" data-heard="' + p.id + '" data-v="' + v + '">' + t + '</button>').join('') + '</div>' +
      '<p class="instruction" style="margin-top:10px"><strong>' + (ca() ? 'Ara torna a escoltar per als detalls i respon les preguntes.' : 'Now listen again for the details and answer the questions.') + '</strong></p></div>';
  }
  function bindCycle(p) {
    if (!isListening(p)) return;
    if (!document.getElementById('cycleCss')) document.head.insertAdjacentHTML('beforeend', '<style id="cycleCss">.cycle-box{margin:12px 0;padding:12px 14px;border:1px dashed var(--line);border-radius:13px;background:#fbfdff}.cycle-box .instruction{margin:6px 0}.cycle-box .typed{width:100%;max-width:440px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;font:inherit}</style>');
    state.cycle = state.cycle || {}; const c = state.cycle[p.id] = state.cycle[p.id] || {};
    const pr = $('#' + p.id + 'Predict'), g = $('#' + p.id + 'Gist'), heard = $$('[data-heard="' + p.id + '"]');
    const mark = () => heard.forEach(b => { const on = b.dataset.v === c.heard; b.classList.toggle('secondary', !on); b.setAttribute('aria-pressed', on); });
    pr.value = c.predict || ''; g.value = c.gist || ''; mark();
    pr.onchange = () => { c.predict = pr.value.trim(); save(); };
    g.onchange = () => { c.gist = g.value.trim(); save(); };
    heard.forEach(b => b.onclick = () => { c.heard = b.dataset.v; save(); mark(); });
  }
  /* Micro-dictation (research audit, Roger 26 Oct 2026): after the questions of a listening (or a listening chart step), 2–3 short chunks of its script (p.chunks,
     chosen in the LS project) are said with the browser's English voice and the student writes them. Practice: not a step, not marked;
     the answers stay in state.dict[panel]. Without p.chunks nothing is shown. */
  function dictHtml(p) {
    if (!p.chunks || !p.chunks.length) return '';
    return '<div class="section-card"><h3>✍️ ' + (ca() ? 'Microdictat' : 'Micro-dictation') + '</h3><p class="instruction">' + (ca() ? 'Escolta cada fragment del listening (pots repetir-lo) i escriu-lo exactament.' : 'Listen to each bit from the listening (you can play it again) and write it exactly.') + '</p>' +
      p.chunks.map((c, i) => '<div class="question"><div class="actions"><button class="btn secondary" type="button" data-say="' + p.id + i + '">▶ ' + (ca() ? 'Escolta' : 'Listen') + ' ' + (i + 1) + '</button><button class="btn secondary" type="button" data-say-slow="' + p.id + i + '">🐢 ' + (ca() ? 'Més a poc a poc' : 'Slower') + '</button></div>' +
        '<input type="text" class="typed" id="' + p.id + 'D' + i + '" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="feedback" id="' + p.id + 'Df' + i + '"></div></div>').join('') +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'DCheck">' + (ca() ? 'Comprova' : 'Check') + '</button></div></div>';
  }
  function bindDict(p) {
    if (!p.chunks || !p.chunks.length) return;
    const say = (t, rate) => { const s = window.speechSynthesis; if (!s) return; s.cancel(); const u = new SpeechSynthesisUtterance(t), v = s.getVoices().find(x => /^en(-|_)GB/i.test(x.lang)) || s.getVoices().find(x => /^en(-|_)/i.test(x.lang)); u.lang = 'en-GB'; if (v) u.voice = v; u.rate = rate; s.speak(u); };
    state.dict = state.dict || {}; const kept = state.dict[p.id] || [];
    p.chunks.forEach((c, i) => {
      $('[data-say="' + p.id + i + '"]').onclick = () => say(c, 0.9);
      $('[data-say-slow="' + p.id + i + '"]').onclick = () => say(c, 0.6);
      $('#' + p.id + 'D' + i).value = kept[i] || '';
    });
    $('#' + p.id + 'DCheck').onclick = () => {
      state.dict[p.id] = p.chunks.map((c, i) => {
        const v = $('#' + p.id + 'D' + i).value, ok = norm(v) === norm(c), f = $('#' + p.id + 'Df' + i);
        f.className = 'feedback ' + (ok ? 'ok' : 'no');
        f.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!') : (ca() ? 'Era: ' : 'It was: ') + '<strong>' + esc(c) + '</strong>' + (ca() ? '. Compara-ho paraula per paraula.' : '. Compare it word by word.');
        return v;
      });
      save();
    };
  }
  R.mc = p => ({
    html: '<div class="section-card">' + predictHtml(p) + mediaHtml(p) + gistHtml(p) + '<form id="' + p.id + 'Form"></form><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>' + dictHtml(p),
    bind() {
      bindAudio(p); bindCycle(p); bindDict(p);
      const items = forLevel(p.items), f = $('#' + p.id + 'Form');
      f.innerHTML = items.map((q, i) => '<div class="question"><p class="q-title">' + (i + 1) + '. ' + q.q + '</p><div class="options">' +
        learningSupport.shuffledIndexes(q.o.length).map(j => '<label class="option"><input type="radio" name="' + p.id + i + '" value="' + j + '"><span>' + q.o[j] + '</span></label>').join('') +
        '</div><div class="feedback" id="' + p.id + 'f' + i + '"></div></div>').join('');
      stays(p.id, p.id, p.id + 'Form', items, count => {
        let score = 0; const g = [];
        items.forEach((q, i) => {
          const c = document.querySelector('input[name="' + p.id + i + '"]:checked'), ok = !!c && +c.value === 0, fb = $('#' + p.id + 'f' + i);
          if (ok) score++; g.push([ok, c ? +c.value : null]);
          fb.textContent = q.ex && c ? (ok ? (ca() ? 'Correcte! ' : 'Correct! ') : (ca() ? 'Encara no. ' : 'Not yet. ')) + tx(q.ex)
            : learningSupport.evidence(level, ok, c, q.o[0], ca() ? q.h : null, !!(p.media && (p.media.audio || p.media.youtube)));
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
        });
        if (count) { firstTry(p.id, score, items.length); firstItems(p.id, p.items, items, g); }
        const ok = score >= need(items.length);
        result($('#' + p.id + 'Result'), score, items.length, ok);
        if (ok && count) complete(p.id);
      });
    }
  });

  R.typed = p => ({
    html: (p.explain ? '<div class="section-card worked"><h3>' + (ca() ? 'Com funciona' : 'How it works') + '</h3>' + forLevel(p.explain).map(e => '<div class="model">' + tx(e) + '</div>').join('') + '</div>' : '') +
      '<div class="section-card">' + (p.mode ? '<p class="instruction">' + modeHow(p.mode) + '</p>' : '') + '<div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      const items = forLevel(p.items);
      $('#' + p.id + 'List').innerHTML = typedHtml(items, p.id, p.mode); bindModes(items, p.id, p.mode);
      stays(p.id, p.id, p.id + 'List', items, count => { const s = checkTyped(items, p.id, false, count); if (count) { firstTry(p.id, s, items.length); firstItems(p.id, p.items, items, got); } const ok = s >= need(items.length); result($('#' + p.id + 'Result'), s, items.length, ok); if (ok && count) complete(p.id); });
    }
  });

  /* Revision counts (research audit, Roger 26 Oct 2026): the first version sent for feedback is kept as the draft (state.drafts[key]);
     the step completes only when the student saves an improved final version (state.finals[key]) with a line on what they changed.
     The teacher sees draft, final version and that line in the activity dialog; the student sees their own draft here. */
  const revWords = s => (String(s || '').trim().match(/\S+/g) || []).length;
  function keepDraft(key, text) {
    state.drafts = state.drafts || {};
    if (state.drafts[key]) return false;
    state.drafts[key] = { text, at: new Date().toISOString() }; save(); return true;
  }
  function revisionHtml(id) {
    return '<div class="section-card" id="' + id + 'Rev" hidden><h3>' + (ca() ? 'La teva versió final' : 'Your final version') + '</h3>' +
      '<details class="draft-box"><summary>' + (ca() ? 'El teu primer esborrany' : 'Your first draft') + '</summary><p class="model" id="' + id + 'Draft" style="white-space:pre-wrap;font-weight:400"></p></details>' +
      '<p class="instruction">' + (ca() ? 'Millora la teva versió amb el feedback. Després explica en una frase què has canviat i desa-la: és la que compta i la que faràs servir al producte final.' : 'Improve your version with the feedback. Then say in one sentence what you changed and save it: this is the version that counts and the one you will use in the final product.') + '</p>' +
      '<label class="field"><strong>' + (ca() ? 'Què he canviat' : 'What I changed') + '</strong><input type="text" class="typed" id="' + id + 'Changed" maxlength="300" placeholder="' + (ca() ? 'Per exemple: he corregit els verbs amb -s i he afegit un costum.' : 'For example: I corrected the -s verbs and added one more custom.') + '"></label>' +
      '<div class="actions"><button class="btn" type="button" id="' + id + 'Final">' + (ca() ? 'Desa la versió final' : 'Save my final version') + '</button></div><p class="feedback" id="' + id + 'FinalMsg"></p></div>';
  }
  // getText(): the current version; onFinal(text): extra work when the final version is saved (the product piece). Returns show().
  function bindRevision(id, key, getText, onFinal) {
    const box = $('#' + id + 'Rev'), ch = $('#' + id + 'Changed'), msg = $('#' + id + 'FinalMsg');
    state.finals = state.finals || {};
    const show = () => {
      const d = (state.drafts || {})[key]; if (!d) return;
      box.hidden = false; $('#' + id + 'Draft').textContent = d.text || (ca() ? '(buit)' : '(empty)');
      const f = state.finals[key];
      if (f) { ch.value = f.changed; msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Versió final desada el ' : 'Final version saved on ') + new Date(f.at).toLocaleDateString() + (ca() ? '. Si la tornes a millorar, desa-la una altra vegada.' : '. If you improve it again, save it again.'); }
    };
    $('#' + id + 'Final').onclick = () => {
      const d = (state.drafts || {})[key], text = getText();
      if (!d) return;
      if (d.text && text.replace(/\s+/g, ' ') === String(d.text).replace(/\s+/g, ' ')) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Encara és igual que l’esborrany: aplica almenys una millora del feedback.' : 'It is still the same as your draft: make at least one improvement from the feedback.'; return; }
      if (revWords(ch.value) < 3) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Explica en una frase què has canviat (almenys 3 paraules).' : 'Say in one sentence what you changed (at least 3 words).'; ch.focus(); return; }
      state.finals[key] = { text, changed: ch.value.trim(), at: new Date().toISOString() };
      if (onFinal) onFinal(text);
      save(); complete(id); show();
    };
    show();
    return show;
  }
  function aiPrompt(p, text) {
    return 'Actua com a professor d’anglès de 2n d’ESO. Learning Situation “Free Time, Live!”, Learning Path ' + LP.n + ' “' + LP.title + '”.\n\nNivell: ' + cap(level) + '.\nTasca: ' + byLevel(p.task).replace(/<[^>]+>/g, '') +
      '\n\nText de l’alumne:\n"""\n' + text + '\n"""\n\n' + learningSupport.aiLanguage(level) +
      ' No reescriguis tot el text i no posis nota numèrica. Respon només amb aquests apartats:\n1. ✅ Què has fet bé — dues coses concretes.\n2. 🔧 Errors importants — màxim 4; per a cada un, copia la frase, explica el perquè breument i dona la versió correcta.\n3. 📋 Tasca — digues si compleix cada punt de la tasca.\n4. 🎯 Un següent pas — una millora concreta per a la versió final.';
  }
  R.writing = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="' + p.id + 'Task"></p>' +
      (p.model ? '<div class="model"><strong>' + (ca() ? 'Model (no el copiïs: és sobre una altra afició)' : 'Model (don’t copy it: it is about another hobby)') + '</strong><br>' + tx(p.model) + '</div>' : '') +
      '<div class="model" id="' + p.id + 'Frame" hidden></div><textarea id="' + p.id + 'Text" placeholder="Write here…"></textarea><p class="tiny" id="' + p.id + 'Count"></p></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Revisa abans d’enviar' : 'Check before you send') + '</h3><div class="options" id="' + p.id + 'List"></div>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Ai">' + (ca() ? 'Desa i corregeix amb IA ↗' : 'Save and correct with AI ↗') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p>' +
      '</div>' + revisionHtml(p.id),
    bind() {
      const ta = $('#' + p.id + 'Text'), key = p.id + '_' + level;
      state.texts = state.texts || {};
      ta.value = state.texts[key] || '';
      $('#' + p.id + 'Task').innerHTML = byLevel(p.task);
      const frame = byLevel(p.frame || {});
      if (frame) { $('#' + p.id + 'Frame').hidden = false; $('#' + p.id + 'Frame').innerHTML = frame; }
      const min = byLevel(p.min);
      const count = () => { $('#' + p.id + 'Count').textContent = words(ta.value) + ' ' + (ca() ? 'paraules' : 'words') + (min ? ' · ' + (ca() ? 'mínim ' : 'minimum ') + min : ''); };
      ta.oninput = () => { state.texts[key] = ta.value; save(); count(); };
      count();
      const checks = byLevel(p.checklist) || [];
      $('#' + p.id + 'List').innerHTML = checks.map(c => '<label class="option"><input type="checkbox"><span>' + c + '</span></label>').join('');
      $('#' + p.id + 'Ai').onclick = () => {
        const boxes = $$('#' + p.id + 'List input'), msg = $('#' + p.id + 'Msg');
        if (min && words(ta.value) < min) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Encara és massa curt: escriu almenys ' + min + ' paraules.' : 'Too short: write at least ' + min + ' words.'; return; }
        if (boxes.some(b => !b.checked)) { msg.className = 'feedback no'; msg.textContent = learningSupport.missing(level, boxes); return; }
        window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(aiPrompt(p, ta.value.trim())), '_blank', 'noopener,noreferrer');
        if (p.product) saveProduct(p.product, ta.value.trim());
        const first = keepDraft(key, ta.value.trim());
        msg.className = 'feedback ok';
        msg.textContent = first ? (ca() ? 'Esborrany desat ✓ S’ha obert ChatGPT amb el teu text. Llegeix el perquè de cada correcció, millora el text aquí mateix i desa la versió final a sota.' : 'Draft saved ✓ ChatGPT has opened with your text. Read each explanation, improve your text here and save your final version below.')
          : (ca() ? 'S’ha obert ChatGPT amb la teva nova versió.' : 'ChatGPT has opened with your new version.');
        showRevision();
      };
      const showRevision = bindRevision(p.id, key, () => ta.value.trim(), text => { if (p.product) saveProduct(p.product, text); });
    }
  });

  R.form = p => ({
    html: '<div class="section-card"><p class="instruction">' + tx(p.intro2 || '') + '</p><div id="' + p.id + 'Fields"></div></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Revisa' : 'Check') + '</h3><div class="options" id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Save">' + (ca() ? 'Desa la fitxa' : 'Save the card') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      const fields = forLevel(p.fields);
      state.form = state.form || {};
      $('#' + p.id + 'Fields').innerHTML = fields.map(f => '<label class="field"><strong>' + tx(f.label) + '</strong><textarea data-f="' + f.id + '" rows="3" placeholder="' + esc(f.ph || '') + '"></textarea></label>').join('');
      $$('#' + p.id + 'Fields textarea').forEach(t => { t.value = state.form[t.dataset.f] || ''; t.oninput = () => { state.form[t.dataset.f] = t.value; save(); }; });
      $('#' + p.id + 'List').innerHTML = (byLevel(p.checklist) || []).map(c => '<label class="option"><input type="checkbox"><span>' + c + '</span></label>').join('');
      $('#' + p.id + 'Save').onclick = () => {
        const empty = fields.filter(f => !(state.form[f.id] || '').trim()), boxes = $$('#' + p.id + 'List input'), msg = $('#' + p.id + 'Msg');
        if (empty.length) { msg.className = 'feedback no'; msg.textContent = (ca() ? 'Falta omplir: ' : 'Still empty: ') + empty.map(f => tx(f.label)).join(' · '); return; }
        if (boxes.some(b => !b.checked)) { msg.className = 'feedback no'; msg.textContent = learningSupport.missing(level, boxes); return; }
        if (p.product) saveProduct(p.product, fields.map(f => tx(f.label) + ': ' + state.form[f.id].trim()).join('\n'));
        msg.className = 'feedback ok'; msg.textContent = ca() ? 'Fitxa desada ✓ La trobaràs a la pàgina del producte final.' : 'Card saved ✓ You will find it on the final product page.';
        complete(p.id);
      };
    }
  });

  // Final-product step: individual task fields + self-assessment (1–4 per statement) + optional comment
  // (+ optional teammate ratings). Handing in stores state.steps[id]; the teacher dashboard reads it.
  const SCALE = { ca: ['Encara no', 'En part', 'Gairebé del tot', 'Del tot'], en: ['Not yet', 'Partly', 'Mostly', 'Fully'] };
  R.step = p => ({
    html: '<div class="section-card">' + (p.html ? (typeof p.html === 'function' ? p.html(level) : tx(p.html)) : '') + predictHtml(p) + mediaHtml(p) + gistHtml(p) + '<div id="' + p.id + 'Fields"></div></div>' + dictHtml(p) +
      (p.rate ? '<div class="section-card"><h3>' + (ca() ? 'Autoavaluació' : 'Self-assessment') + '</h3><p class="instruction">' + (ca() ? 'Puntua’t amb sinceritat: 1 ' + SCALE.ca[0] + ' · 2 ' + SCALE.ca[1] + ' · 3 ' + SCALE.ca[2] + ' · 4 ' + SCALE.ca[3] + '.' : 'Be honest: 1 ' + SCALE.en[0] + ' · 2 ' + SCALE.en[1] + ' · 3 ' + SCALE.en[2] + ' · 4 ' + SCALE.en[3] + '.') + '</p><div id="' + p.id + 'Rate"></div></div>' : '') +
      (p.peers ? '<div class="section-card"><h3>' + (ca() ? 'Els meus companys' : 'My teammates') + '</h3><p class="instruction">' + tx(p.peersIntro) + '</p><div id="' + p.id + 'Peers"></div></div>' : '') +
      '<div class="section-card"><label class="field"><strong>' + (ca() ? 'Vols dir alguna cosa al professor? Un problema que hàgiu tingut? (opcional)' : 'Anything you want to tell your teacher? A problem you or your group faced? (optional)') + '</strong><textarea id="' + p.id + 'Comment" rows="3"></textarea></label>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Send">' + (ca() ? 'Entrega aquest pas' : 'Hand in this step') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      bindAudio(p); bindCycle(p); bindDict(p);
      state.steps = state.steps || {};
      const key = p.id, draft = (state.stepDraft = state.stepDraft || {})[key] = state.stepDraft[key] || { f: p.product && state.form ? Object.assign({}, state.form) : {}, rate: [], peers: [] };
      const fields = forLevel(p.fields), stm = byLevel(p.rate) || [];
      const keep = () => save();
      $('#' + key + 'Fields').innerHTML = fields.map(f => '<label class="field"><strong>' + tx(f.label) + '</strong><textarea data-f="' + f.id + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(tx(f.ph) || '') + '"></textarea></label>').join('');
      $$('#' + key + 'Fields textarea').forEach(t => { t.value = draft.f[t.dataset.f] || ''; t.oninput = () => { draft.f[t.dataset.f] = t.value; keep(); }; });
      const scale = ca() ? SCALE.ca : SCALE.en;
      const radios = (name, val) => [1, 2, 3, 4].map(v => '<label class="option" style="display:inline-flex;margin:3px"><input type="radio" name="' + name + '" value="' + v + '"' + (val === v ? ' checked' : '') + '><span>' + v + ' · ' + scale[v - 1] + '</span></label>').join('');
      if (p.rate) {
        $('#' + key + 'Rate').innerHTML = stm.map((s, i) => '<div style="margin:12px 0"><strong>' + s + '</strong><div>' + radios(key + 'R' + i, draft.rate[i]) + '</div></div>').join('');
        $$('#' + key + 'Rate input').forEach(r => r.onchange = () => { draft.rate[+r.name.slice((key + 'R').length)] = +r.value; keep(); });
      }
      if (p.peers) {
        const ps = byLevel(p.peerRate) || [];
        $('#' + key + 'Peers').innerHTML = [0, 1, 2].map(n => { const d = draft.peers[n] || {}; return '<div class="mini-card" style="margin:10px 0"><label class="field"><strong>' + (ca() ? 'Nom del company ' : 'Teammate ') + (n + 1) + (n === 2 ? (ca() ? ' (si en teniu)' : ' (if any)') : '') + '</strong><input class="typed" data-pn="' + n + '" value="' + esc(d.name || '') + '"></label>' +
          ps.map((s, i) => '<div style="margin:8px 0"><span>' + s + '</span><div>' + radios(key + 'P' + n + '_' + i, (d.r || [])[i]) + '</div></div>').join('') + '</div>'; }).join('');
        $$('#' + key + 'Peers input[data-pn]').forEach(t => t.oninput = () => { const n = +t.dataset.pn; draft.peers[n] = draft.peers[n] || { r: [] }; draft.peers[n].name = t.value; keep(); });
        $$('#' + key + 'Peers input[type=radio]').forEach(r => r.onchange = () => { const [n, i] = r.name.slice((key + 'P').length).split('_').map(Number); draft.peers[n] = draft.peers[n] || { r: [] }; draft.peers[n].r = draft.peers[n].r || []; draft.peers[n].r[i] = +r.value; keep(); });
      }
      const com = $('#' + key + 'Comment'); com.value = draft.comment || ''; com.oninput = () => { draft.comment = com.value; keep(); };
      const msg = $('#' + key + 'Msg');
      if (state.steps[key]) { msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregat el ' : 'Handed in on ') + new Date(state.steps[key].date).toLocaleDateString() + (ca() ? '. Si canvies alguna cosa, torna’l a entregar.' : '. If you change anything, hand it in again.'); }
      $('#' + key + 'Send').onclick = () => {
        const empty = fields.filter(f => !f.optional && !(draft.f[f.id] || '').trim());
        if (empty.length) { msg.className = 'feedback no'; msg.textContent = (ca() ? 'Falta omplir: ' : 'Still empty: ') + empty.map(f => tx(f.label)).join(' · '); return; }
        const blocked = p.check ? p.check(level) : '';
        if (blocked) { msg.className = 'feedback no'; msg.textContent = blocked; return; }
        if (stm.some((s, i) => !draft.rate[i])) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Puntua totes les frases de l’autoavaluació.' : 'Rate every statement of the self-assessment.'; return; }
        const ps = byLevel(p.peerRate) || [], peers = (draft.peers || []).filter(d => d && (d.name || '').trim());
        if (p.peers && (peers.length < (p.minPeers || 2) || peers.some(d => ps.some((s, i) => !(d.r || [])[i])))) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Escriu el nom de cada company i puntua totes les frases.' : 'Write each teammate’s name and rate every statement.'; return; }
        const rate = stm.map((s, i) => ({ s, v: draft.rate[i] }));
        state.steps[key] = { level, title: tx(p.title), f: fields.map(f => ({ l: tx(f.label), v: (draft.f[f.id] || '').trim() })), rate, avg: rate.length ? Math.round(rate.reduce((a, x) => a + x.v, 0) / rate.length * 10) / 10 : null,
          peers: p.peers ? peers.map(d => ({ name: d.name.trim(), r: ps.map((s, i) => ({ s, v: d.r[i] })) })) : undefined, comment: (draft.comment || '').trim(), date: new Date().toISOString() };
        // A step can also be a product piece (the research card): it then appears on the final product page too.
        if (p.product) saveProduct(p.product, state.steps[key].f.filter(f => f.v).map(f => f.l + ': ' + f.v).join('\n'));
        state.done[key] = true; stamp(key); save();
        msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregat ✓ El professor ho veurà al seu tauler.' : 'Handed in ✓ Your teacher will see it on the dashboard.') + (p.product ? (ca() ? ' També la trobaràs a la pàgina del producte final.' : ' You will also find it on the final product page.') : '');
      };
    }
  });

  // Static content; html may be a function so it can read saved work. Not a step.
  R.info = p => ({ html: '<div class="section-card">' + (typeof p.html === 'function' ? p.html(level) : tx(p.html)) + '</div>', bind() { if (p.after) p.after(level); } });

  R.checklist = p => ({
    html: '<div class="section-card"><div class="options" id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Ok">' + (ca() ? 'Fet ✓' : 'Done ✓') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      state.ticks = state.ticks || {};
      const items = byLevel(p.items) || [], key = p.id + '_' + level;
      $('#' + p.id + 'List').innerHTML = items.map((c, i) => '<label class="option"><input type="checkbox" data-i="' + i + '"' + ((state.ticks[key] || [])[i] ? ' checked' : '') + '><span>' + c + '</span></label>').join('');
      $$('#' + p.id + 'List input').forEach(b => b.onchange = () => { state.ticks[key] = $$('#' + p.id + 'List input').map(x => x.checked); save(); });
      $('#' + p.id + 'Ok').onclick = () => {
        const boxes = $$('#' + p.id + 'List input'), msg = $('#' + p.id + 'Msg');
        if (boxes.some(b => !b.checked)) { msg.className = 'feedback no'; msg.textContent = learningSupport.missing(level, boxes); return; }
        msg.className = 'feedback ok'; msg.textContent = ca() ? 'Fet ✓' : 'Done ✓'; complete(p.id);
      };
    }
  });

  /* ---------- speaking (recording code from the 4 ESO course reference) ---------- */
  let srBox = null, audioCtx, sourceNode, processor, micStream, pcm = [], recRate = 44100, recBlob = null, recUrl = null, recognition = null, srActive = false, srTimer = null, srFinal = '';
  function encodeWav(buffers, rate) {
    const len = buffers.reduce((n, a) => n + a.length, 0), samples = new Float32Array(len); let o = 0;
    buffers.forEach(a => { samples.set(a, o); o += a.length; });
    const ab = new ArrayBuffer(44 + samples.length * 2), v = new DataView(ab), w = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples.length * 2, true);
    let q = 44; for (let i = 0; i < samples.length; i++, q += 2) { const s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(q, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([v], { type: 'audio/wav' });
  }
  function startSR() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
    srActive = true; srFinal = '';
    const launch = () => {
      if (!srActive) return;
      try {
        recognition = new SR(); recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = true;
        recognition.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) srFinal += t.trim() + ' '; else interim += t; } (srBox || $('#speechTranscript')).value = (srFinal + interim).trim(); };
        recognition.onend = () => { if (srActive) srTimer = setTimeout(launch, 180); };
        recognition.start();
      } catch (e) { if (srActive) srTimer = setTimeout(launch, 250); }
    };
    launch();
  }
  function stopSR() { srActive = false; if (srTimer) clearTimeout(srTimer); try { if (recognition) recognition.stop(); } catch (e) {} }
  function downloadWav() { if (!recUrl) return; const a = document.createElement('a'); a.href = recUrl; a.download = 'ls2-2eso-lp' + LP.n + '-' + level + '.wav'; document.body.appendChild(a); a.click(); a.remove(); }
  R.speaking = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="spTask"></p><div class="speak-support"><div class="mini-card"><strong>Model</strong><div class="model" id="spModel"></div></div><div class="mini-card"><strong>' + (ca() ? 'Prepara què diràs' : 'Prepare') + '</strong><textarea id="spPlan" placeholder="Key words or short sentences…"></textarea></div></div></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Grava i escolta’t' : 'Record') + '</h3><div class="actions" style="justify-content:flex-start"><button class="btn" type="button" id="startRecord">● ' + (ca() ? 'Grava' : 'Record') + '</button><button class="btn secondary" type="button" id="stopRecord" disabled>■ ' + (ca() ? 'Atura' : 'Stop') + '</button><button class="btn secondary" type="button" id="downloadWav" disabled>' + (ca() ? 'Descarrega el WAV' : 'Download WAV') + '</button></div><div class="record-status" id="recordStatus">' + (ca() ? 'A punt per gravar.' : 'Ready to record.') + '</div><audio id="recordedAudio" controls style="width:100%;display:none"></audio></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Revisa la transcripció' : 'Transcript') + '</h3><p class="instruction">' + (ca() ? 'Amb Chrome, la transcripció es crea mentre graves. Corregeix-la perquè digui el que has dit.' : 'With Chrome, a transcript is created while you record. Correct it so it matches what you said.') + '</p><textarea id="speechTranscript" placeholder="Your transcript will appear here."></textarea></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Demana feedback' : 'Get feedback') + '</h3><p class="instruction">' + (ca() ? 'Prem <strong>Corregeix amb IA</strong>: es descarrega el WAV i s’obre ChatGPT. Adjunta el WAV i prem Envia. Després torna a gravar la versió millorada.' : 'Press <strong>Correct with AI</strong>: the WAV downloads and ChatGPT opens. Attach the WAV and press Send. Then record an improved version.') + '</p><div class="actions"><button class="btn" type="button" id="spAi" disabled>' + (ca() ? 'Corregeix amb IA ↗' : 'Correct with AI ↗') + '</button></div><p class="tiny" id="spStatus"></p></div>' + revisionHtml(p.id),
    bind() {
      $('#spTask').innerHTML = byLevel(p.task); $('#spModel').innerHTML = byLevel(p.model);
      // the transcript of the version sent for feedback is the draft; the improved recording's transcript is the final version
      const spKey = p.id + '_' + level, showRevision = bindRevision(p.id, spKey, () => $('#speechTranscript').value.trim());
      // the plan and the transcript stay too (state.speak[key]); a recording itself is never saved
      state.speak = state.speak || {}; const sp = state.speak[spKey] = state.speak[spKey] || {};
      const keepSp = () => { sp.plan = $('#spPlan').value; sp.tr = $('#speechTranscript').value; save(); };
      $('#spPlan').value = sp.plan || ''; $('#speechTranscript').value = sp.tr || '';
      $('#spPlan').oninput = keepSp; $('#speechTranscript').oninput = keepSp;
      $('#startRecord').onclick = async () => {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
          sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
          processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
          sourceNode.connect(processor); processor.connect(audioCtx.destination); srBox = null; startSR();
          $('#recordStatus').textContent = ca() ? 'Gravant… parla ara.' : 'Recording… speak now.';
          $('#startRecord').disabled = true; $('#stopRecord').disabled = false; $('#downloadWav').disabled = true; $('#spAi').disabled = true;
        } catch (e) { $('#recordStatus').textContent = ca() ? 'No s’ha pogut fer servir el micròfon. Dona permís i torna-ho a provar.' : 'Microphone access was not available. Allow it and try again.'; }
      };
      $('#stopRecord').onclick = async () => {
        if (!processor) return;
        processor.disconnect(); sourceNode.disconnect(); micStream.getTracks().forEach(t => t.stop()); await audioCtx.close(); stopSR();
        recBlob = encodeWav(pcm, recRate); if (recUrl) URL.revokeObjectURL(recUrl); recUrl = URL.createObjectURL(recBlob);
        $('#recordedAudio').src = recUrl; $('#recordedAudio').style.display = 'block';
        $('#downloadWav').disabled = false; $('#spAi').disabled = false; $('#startRecord').disabled = false; $('#stopRecord').disabled = true; processor = null;
        $('#recordStatus').textContent = ca() ? 'Gravació a punt. Escolta-la abans de demanar feedback.' : 'Recording ready. Listen to it before asking for feedback.';
        setTimeout(keepSp, 1500);   // the last words of the automatic transcript arrive after Stop
      };
      $('#downloadWav').onclick = downloadWav;
      $('#spAi').onclick = () => {
        const tr = $('#speechTranscript').value.trim();
        const prompt = 'IMPORTANT: ENCARA NO DONIS FEEDBACK SI NO HI HA CAP ÀUDIO ADJUNT. Si aquest missatge arriba abans que l’àudio, respon només: "Adjunta l’àudio i l’escoltaré."\n\nQuan l’àudio estigui adjunt, escolta’l i actua com a professor d’anglès de 2n d’ESO dins de la Learning Situation “Free Time, Live!”, Learning Path ' + LP.n + ' “' + LP.title + '”.\n\nNivell: ' + cap(level) + '.\nTasca: ' + byLevel(p.task).replace(/<[^>]+>/g, '') + '\n\n' +
          (tr ? 'Transcripció automàtica de suport (pot contenir errors):\n"' + tr + '"\n\nPrimer escolta l’àudio i dona prioritat al que realment s’hi sent.' : 'No hi ha transcripció automàtica. Escolta l’àudio abans de donar feedback.') +
          '\n\n' + learningSupport.aiLanguage(level) + ' No posis nota numèrica. Respon només amb aquests apartats:\n1. 📝 Transcripció\n2. ✅ Què ha fet bé — una o dues coses concretes.\n3. 🔧 Què ha de corregir — màxim 2 errors importants, amb la frase correcta.\n4. 🗣️ Pronunciació — un sol problema clar, si n’hi ha.\n5. 📋 Instruccions — si ha complert la tasca.\n6. 🎯 Un següent pas.';
        const win = window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(prompt), '_blank', 'noopener,noreferrer');
        downloadWav(); keepSp(); keepDraft(spKey, tr); showRevision();
        $('#spStatus').textContent = win ? (ca() ? '✓ WAV descarregat · ChatGPT obert. Adjunta el WAV i prem Envia.' : '✓ WAV downloaded · ChatGPT opened. Attach the WAV and press Send.') : (ca() ? 'El navegador ha bloquejat la pestanya. Permet les finestres emergents.' : 'The browser blocked the tab. Allow pop-ups and try again.');
      };
    }
  });

  /* Talk (four skills, Roger 30 Oct 2026): a spoken interaction for self-study. The browser's English voice asks the partner's questions
     (p.partner: [{q, ca}], cumulative by route like items) one by one with time to answer while the student is recorded; the transcript is
     made only while the student answers. Then AI feedback and a hand-in like a step (state.steps[id], read on the dashboard), done when the
     transcript has p.min words (per route). Safe and Daring hear each question before they can read it. Native (Pro): no recording (Roger),
     a written plan for each question instead. */
  R.talk = p => {
    const id = p.id, nat = level === 'native';
    return {
      html: '<div class="section-card"><h3>' + (ca() ? 'La conversa' : 'The conversation') + '</h3><p class="instruction" id="' + id + 'Task"></p>' +
        '<ol id="' + id + 'Qs" style="margin:8px 0 12px;padding-left:22px;line-height:2"></ol>' +
        '<details class="draft-box"><summary>' + (ca() ? 'Mira un model (després d’intentar-ho)' : 'See a model (after you try)') + '</summary><div class="model" id="' + id + 'Model"></div></details></div>' +
        (nat ? '<div class="section-card"><h3>Your plan</h3><p class="instruction">No recording on your route: for each question, write the ideas you would use and how you would develop them (notes, not full sentences).</p><div id="' + id + 'Notes"></div></div>'
          : '<div class="section-card"><h3>' + (ca() ? 'Parla' : 'Talk') + '</h3><p class="instruction">' + (ca() ? 'Prem <strong>Comença</strong>: es grava la conversa i l’ordinador et fa les preguntes una a una, amb temps per respondre. Respon en veu alta amb frases completes i afegeix-hi algun detall. Millor amb auriculars.' : 'Press <strong>Start</strong>: the recording starts and the computer asks you the questions one by one, with time to answer. Answer out loud in full sentences and add a detail. Headphones help.') + '</p>' +
          '<div class="actions" style="justify-content:flex-start"><button class="btn" type="button" id="' + id + 'Start">● ' + (ca() ? 'Comença' : 'Start') + '</button><button class="btn secondary" type="button" id="' + id + 'Stop" disabled>■ ' + (ca() ? 'Atura' : 'Stop') + '</button><button class="btn secondary" type="button" id="' + id + 'Wav" disabled>' + (ca() ? 'Descarrega el WAV' : 'Download WAV') + '</button></div>' +
          '<div class="record-status" id="' + id + 'Status">' + (ca() ? 'A punt.' : 'Ready.') + '</div><audio id="' + id + 'Audio" controls style="width:100%;display:none"></audio></div>' +
          '<div class="section-card"><h3>' + (ca() ? 'Revisa la transcripció' : 'Transcript') + '</h3><p class="instruction">' + (ca() ? 'Amb Chrome, les teves respostes s’escriuen mentre parles. Corregeix-les perquè diguin el que has dit.' : 'With Chrome, your answers are written down while you speak. Correct them so they match what you said.') + '</p><textarea id="' + id + 'Tr" placeholder="Your answers will appear here."></textarea>' +
          '<p class="instruction">' + (ca() ? 'Prem <strong>Feedback amb IA</strong>: es descarrega el WAV i s’obre ChatGPT. Adjunta el WAV i prem Envia. Si vols, torna a fer la conversa millor.' : 'Press <strong>AI feedback</strong>: the WAV downloads and ChatGPT opens. Attach the WAV and press Send. You can do the conversation again, better.') + '</p>' +
          '<div class="actions"><button class="btn secondary" type="button" id="' + id + 'Ai" disabled>' + (ca() ? 'Feedback amb IA ↗' : 'AI feedback ↗') + '</button></div><p class="tiny" id="' + id + 'AiMsg"></p></div>') +
        '<div class="section-card"><div class="actions"><button class="btn" type="button" id="' + id + 'Send">' + (ca() ? 'Entrega la conversa' : 'Hand in the conversation') + '</button></div><p class="feedback" id="' + id + 'Msg"></p></div>',
      bind() {
        const qs = forLevel(p.partner), key = id + '_' + level, wait = (p.wait || { beginners: 12, insecure: 12, safe: 16, daring: 20 })[level] || 16;
        state.steps = state.steps || {}; state.speak = state.speak || {}; const sp = state.speak[key] = state.speak[key] || {};
        $('#' + id + 'Task').innerHTML = byLevel(p.task); $('#' + id + 'Model').innerHTML = byLevel(p.model);
        $('#' + id + 'Qs').innerHTML = qs.map((q, i) => '<li><button class="btn secondary" type="button" data-tq="' + id + i + '" aria-label="Listen">▶</button> ' +
          (ca() ? q.q + (q.ca ? ' <span class="tiny">(' + q.ca + ')</span>' : '') : '<details style="display:inline-block;vertical-align:middle"><summary>' + 'Show the question' + '</summary>' + q.q + '</details>') + '</li>').join('');
        qs.forEach((q, i) => { $('[data-tq="' + id + i + '"]').onclick = () => sayLine(q.q, ca() ? 0.85 : 0.95); });
        const msg = $('#' + id + 'Msg'), min = (p.min || { beginners: 15, insecure: 25, safe: 50, daring: 70, native: 40 })[level] || 30;
        const text = () => nat ? qs.map((q, i) => q.q + ' — ' + ((sp.notes || [])[i] || '').trim()).join('\n') : (sp.tr || '').trim();
        if (nat) {
          sp.notes = sp.notes || [];
          $('#' + id + 'Notes').innerHTML = qs.map((q, i) => '<label class="field"><strong>' + q.q + '</strong><textarea data-n="' + i + '" rows="2"></textarea></label>').join('');
          $$('#' + id + 'Notes textarea').forEach(t => { t.value = sp.notes[+t.dataset.n] || ''; t.oninput = () => { sp.notes[+t.dataset.n] = t.value; save(); }; });
        } else {
          const tr = $('#' + id + 'Tr'), st = $('#' + id + 'Status'), btn = n => $('#' + id + n);
          tr.value = sp.tr || ''; tr.oninput = () => { sp.tr = tr.value; save(); };
          // speech recognition only while the student answers, so the computer's questions are not written down
          let rec = null, timer = null, run = 0;
          const listen = on => {
            try { if (rec) rec.stop(); } catch (e) {} rec = null; const SR = SRC(); if (!on || !SR) return;
            const base = tr.value.trim() ? tr.value.trim() + ' ' : ''; let fin = '';
            try { rec = new SR(); rec.lang = 'en-GB'; rec.continuous = true; rec.interimResults = true;
              rec.onresult = e => { let inter = ''; for (let k = e.resultIndex; k < e.results.length; k++) { const t = e.results[k][0].transcript; if (e.results[k].isFinal) fin += t.trim() + ' '; else inter += t; } tr.value = (base + fin + inter).trim(); sp.tr = tr.value; save(); };
              rec.start(); } catch (e) {}
          };
          const stop = async () => {
            run++; clearTimeout(timer); sayTok++; if (window.speechSynthesis) speechSynthesis.cancel(); listen(false);
            if (!processor) return;
            processor.disconnect(); sourceNode.disconnect(); micStream.getTracks().forEach(t => t.stop()); await audioCtx.close(); processor = null;
            recBlob = encodeWav(pcm, recRate); if (recUrl) URL.revokeObjectURL(recUrl); recUrl = URL.createObjectURL(recBlob);
            const a = $('#' + id + 'Audio'); a.src = recUrl; a.style.display = 'block';
            btn('Start').disabled = false; btn('Stop').disabled = true; btn('Wav').disabled = false; btn('Ai').disabled = false;
            st.textContent = ca() ? 'Gravació a punt. Escolta-la, revisa la transcripció i demana feedback.' : 'Recording ready. Listen to it, check the transcript and ask for feedback.';
          };
          btn('Start').onclick = async () => {
            try {
              micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
              sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
              processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
              sourceNode.connect(processor); processor.connect(audioCtx.destination);
            } catch (e) { st.textContent = ca() ? 'No s’ha pogut fer servir el micròfon. Dona permís i torna-ho a provar.' : 'Microphone access was not available. Allow it and try again.'; return; }
            btn('Start').disabled = true; btn('Stop').disabled = false; btn('Wav').disabled = true; btn('Ai').disabled = true;
            if (tr.value.trim()) { tr.value = ''; sp.tr = ''; save(); }
            const me = ++run; let i = 0;
            const next = () => {
              if (me !== run) return; listen(false);
              if (i >= qs.length) { stop(); return; }
              const q = qs[i++]; st.textContent = (ca() ? 'Pregunta ' : 'Question ') + i + ' / ' + qs.length + ' 🔊';
              sayLine(q.q, ca() ? 0.85 : 0.95, () => {
                if (me !== run) return; listen(true); let left = wait;
                const tick = () => { if (me !== run) return; st.textContent = (ca() ? 'Respon ara… ' : 'Answer now… ') + left + ' s · ' + (ca() ? 'pregunta ' : 'question ') + i + ' / ' + qs.length; if (left-- <= 0) return next(); timer = setTimeout(tick, 1000); };
                tick();
              });
            };
            next();
          };
          btn('Stop').onclick = stop;
          btn('Wav').onclick = downloadWav;
          btn('Ai').onclick = () => {
            const prompt = 'IMPORTANT: ENCARA NO DONIS FEEDBACK SI NO HI HA CAP ÀUDIO ADJUNT. Si aquest missatge arriba abans que l’àudio, respon només: "Adjunta l’àudio i l’escoltaré."\n\nQuan l’àudio estigui adjunt, escolta’l i actua com a professor d’anglès de 2n d’ESO dins de la Learning Situation “Free Time, Live!”, Learning Path ' + LP.n + ' “' + LP.title + '”.\n\nÉs una conversa: l’ordinador fa les preguntes i l’alumne respon.\nNivell: ' + cap(level) + '.\nTasca: ' + byLevel(p.task).replace(/<[^>]+>/g, '') + '\nPreguntes: ' + qs.map((q, i) => (i + 1) + '. ' + q.q).join(' ') + '\n\n' +
              (tr.value.trim() ? 'Transcripció automàtica de les respostes (pot contenir errors):\n"' + tr.value.trim() + '"\n\nDona prioritat al que realment se sent a l’àudio.' : 'No hi ha transcripció automàtica. Escolta l’àudio abans de donar feedback.') +
              '\n\n' + learningSupport.aiLanguage(level) + ' No posis nota numèrica. Respon només amb aquests apartats:\n1. ✅ Què ha fet bé — una o dues coses concretes.\n2. 🔧 Què ha de corregir — màxim 2 errors importants, amb la frase correcta.\n3. 💬 Interacció — si respon a cada pregunta, amb frases completes i algun detall.\n4. 🗣️ Pronunciació — un sol problema clar, si n’hi ha.\n5. 🎯 Un següent pas.';
            const win = window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(prompt), '_blank', 'noopener,noreferrer');
            downloadWav();
            $('#' + id + 'AiMsg').textContent = win ? (ca() ? '✓ WAV descarregat · ChatGPT obert. Adjunta el WAV i prem Envia.' : '✓ WAV downloaded · ChatGPT opened. Attach the WAV and press Send.') : (ca() ? 'El navegador ha bloquejat la pestanya. Permet les finestres emergents.' : 'The browser blocked the tab. Allow pop-ups and try again.');
          };
        }
        if (state.steps[id] && state.done[id]) { msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregada el ' : 'Handed in on ') + new Date(state.steps[id].date).toLocaleDateString() + (ca() ? '. Si la tornes a fer, entrega-la una altra vegada.' : '. If you do it again, hand it in again.'); }
        $('#' + id + 'Send').onclick = () => {
          const n = nat ? words((sp.notes || []).join(' ')) : words(sp.tr || '');
          if (n < min) { msg.className = 'feedback no'; msg.textContent = nat ? 'Write a few ideas for every question (at least ' + min + ' words in all).' : ca() ? 'La transcripció té ' + n + ' paraules: respon totes les preguntes (almenys ' + min + ' paraules). Si Chrome no l’ha escrita, escriu el que has dit.' : 'Your transcript has ' + n + ' words: answer every question (at least ' + min + ' words). If Chrome didn’t write it, type what you said.'; return; }
          state.steps[id] = { level, title: tx(p.title), f: [{ l: nat ? 'Plan' : (ca() ? 'Transcripció' : 'Transcript'), v: text() }], rate: [], avg: null, comment: '', date: new Date().toISOString() };
          complete(id); save();
          msg.className = 'feedback ok'; msg.textContent = ca() ? 'Entregada ✓ El professor ho veurà al seu tauler.' : 'Handed in ✓ Your teacher will see it on the dashboard.';
        };
      }
    };
  };

  /* ---------- sample exam: points per item, tasks marked by ChatGPT, score summary ---------- */
  const ptsOf = (p, q) => q.p || (q.o ? p.pts[0] : p.pts[1]);
  const maxOf = p => p.type === 'quiz' ? forLevel(p.items).reduce((t, q) => t + ptsOf(p, q), 0) : p.max;
  const ptsWord = n => n + ' ' + (ca() ? (n === 1 ? 'punt' : 'punts') : (n === 1 ? 'point' : 'points'));
  const aiWarning = () => ca() ? '⚠️ ChatGPT es pot equivocar: la seva nota només és orientativa. A l’examen real, el guió el corregeix el professorat.'
    : '⚠️ ChatGPT can make mistakes: its mark is only a guide. In the real exam, your teacher marks the script.';
  // Multiple choice ({q, o}: first option right, shown shuffled) and gaps ({q, a}) in one list, each with its points.
  R.quiz = p => ({
    html: '<div class="section-card">' + mediaHtml(p) + '<div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      bindAudio(p);
      const items = forLevel(p.items), start = p.start || 1;
      $('#' + p.id + 'List').innerHTML = items.map((q, i) => '<div class="question"><p class="q-title">' + (start + i) + '. ' + q.q + ' <small>[' + ptsWord(ptsOf(p, q)) + ']</small></p>' +
        (q.o ? '<div class="options">' + learningSupport.shuffledIndexes(q.o.length).map(j => '<label class="option"><input type="radio" name="' + p.id + i + '" value="' + j + '"><span>' + q.o[j] + '</span></label>').join('') + '</div>'
             : '<input type="text" class="typed" id="' + p.id + i + '" autocomplete="off" autocapitalize="off" spellcheck="false">') +
        '<div class="feedback" id="' + p.id + 'f' + i + '"></div></div>').join('');
      stays(p.id, p.id, p.id + 'List', items, count => {
        let right = 0, pts = 0; const g = [];
        items.forEach((q, i) => {
          const fb = $('#' + p.id + 'f' + i);
          let ok;
          if (q.o) {
            const c = document.querySelector('input[name="' + p.id + i + '"]:checked'); ok = !!c && +c.value === 0; g.push([ok, c ? +c.value : null]);
            fb.textContent = learningSupport.evidence(level, ok, c, q.o[0], null, !!(p.media && p.media.audio));
          } else {
            const v = norm($('#' + p.id + i).value), key = p.id + i; ok = q.a.some(a => norm(a) === v); g.push([ok, typedAs($('#' + p.id + i))]);
            if (!ok && v && count) tries[key] = (tries[key] || 0) + 1;
            fb.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!') : !v ? (ca() ? 'Escriu una resposta.' : 'Type an answer.')
              : (ca() ? 'Encara no. ' : 'Not yet. ') + (tries[key] >= 2 ? (ca() ? 'Resposta: ' : 'Answer: ') + '<strong>' + esc(q.a[0]) + '</strong>' : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
          }
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
          if (ok) { right++; pts += ptsOf(p, q); }
        });
        const tk = p.id + '_' + level;
        if (count) { firstTry(tk, pts, maxOf(p)); firstItems(p.id, p.items, items, g); }
        const done = right >= need(items.length);
        result($('#' + p.id + 'Result'), right, items.length, done, ' · ' + pts + ' / ' + ptsWord(maxOf(p)) + (ca() ? ' (primer intent: ' : ' (first try: ') + ((state.tries || {})[tk] || {}).score + ')');
        if (done && count) complete(p.id);
        if (LP.onScore) LP.onScore();
      });
    }
  });
  // An open task (for example the sample exam's email): the student writes, then ChatGPT gives feedback and an orientative mark
  // with the criterion's levels; the student can note that mark for the summary.
  function markPrompt(p, text) {
    const lv = { beginners: 'Beginners (A1, amb molt suport)', insecure: 'Insecure (A1+ / A2 inicial, amb bastides)', safe: 'Safe (A2 funcional)', daring: 'Daring (A2+ / B1 emergent)' }[level];
    const src = byLevel(p.source || '');
    return (ca() ? 'Actua com a professor d’anglès de 2n d’ESO. És l’EXAMEN D’EXEMPLE (pràctica) de la Learning Situation “Free Time, Live!”.' : 'Act as a 2 ESO English teacher. This is the SAMPLE EXAM (practice) of the Learning Situation “Free Time, Live!”.') +
      '\n\nRoute / level: ' + lv + '.\nTask (' + p.max + ' points): ' + byLevel(p.task).replace(/<[^>]+>/g, '') +
      (src ? '\n\n' + (p.sourceLabel || 'Source') + ':\n"""\n' + src.replace(/<[^>]+>/g, ' ').replace(/\s+\n/g, '\n') + '\n"""' : '') +
      '\n\nStudent’s answer:\n"""\n' + text + '\n"""\n\n' +
      'Mark it with the four levels of criterion ' + p.criterion + ':\n' + ['NA', 'AS', 'AN', 'AE'].map((l, i) => l + ' (' + p.levelPts[i] + ' points): ' + p.levels[i]).join('\n') +
      '\nBlank, not in English or off task: 0 points.\n\n' + learningSupport.aiLanguage(level) +
      ' Do not rewrite the whole answer. Reply only with these parts:\n1. 📊 Level and mark: "Level: AN · ' + p.levelPts[2] + '/' + p.max + '", and one sentence saying which description fits and why.\n2. ✅ Two things done well.\n3. 🔧 Up to 4 important problems: quote the words, explain why briefly, give a better version.\n4. 🎯 One thing to do to reach the next level.\n5. ⚠️ End with one line: this mark is only a guide, AI can make mistakes, and in the real exam the teacher marks it.';
  }
  R.marked = p => ({
    html: '<div class="section-card">' + mediaHtml(p) + '<h3>' + (ca() ? 'La tasca' : 'Your task') + ' <small>[' + ptsWord(p.max) + ']</small></h3><p class="instruction" id="' + p.id + 'Task"></p>' +
      '<textarea id="' + p.id + 'Text" rows="9"></textarea><p class="tiny" id="' + p.id + 'Count"></p></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Feedback i nota orientativa' : 'Feedback and a guide mark') + '</h3><p class="instruction">' + (ca() ? 'Prem el botó: s’obre ChatGPT amb la teva resposta i els criteris de correcció. Et dirà el nivell (NA, AS, AN, AE), els punts i què has de millorar.' : 'Press the button: ChatGPT opens with your answer and the marking criteria. It tells you the level (NA, AS, AN, AE), the points and what to improve.') + '</p>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Ai">' + (ca() ? 'Desa i corregeix amb ChatGPT ↗' : 'Save and mark with ChatGPT ↗') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p>' +
      '<label class="field"><strong>' + (ca() ? 'Punts que t’ha donat ChatGPT (de ' + p.max + ')' : 'Points ChatGPT gave you (out of ' + p.max + ')') + '</strong><input type="number" class="typed" id="' + p.id + 'Pts" min="0" max="' + p.max + '" step="1" style="max-width:120px"></label>' +
      '<p class="warm-note">' + aiWarning() + '</p></div>',
    bind() {
      bindAudio(p);
      const ta = $('#' + p.id + 'Text'), key = p.id + '_' + level, min = byLevel(p.min);
      state.texts = state.texts || {}; state.ai = state.ai || {};
      ta.value = state.texts[key] || ''; ta.placeholder = byLevel(p.template || '');
      $('#' + p.id + 'Task').innerHTML = byLevel(p.task).replace(/\n/g, '<br>');
      const count = () => { $('#' + p.id + 'Count').textContent = words(ta.value) + ' ' + (ca() ? 'paraules' : 'words') + (min ? ' · ' + (ca() ? 'mínim ' : 'minimum ') + min : ''); };
      ta.oninput = () => { state.texts[key] = ta.value; save(); count(); };
      count();
      const pts = $('#' + p.id + 'Pts'), k = p.id + '_' + level;
      pts.value = state.ai[k] != null ? state.ai[k] : '';
      pts.oninput = () => { const v = pts.value === '' ? null : Math.max(0, Math.min(p.max, Math.round(+pts.value))); if (v == null) delete state.ai[k]; else state.ai[k] = v; save(); if (LP.onScore) LP.onScore(); };
      $('#' + p.id + 'Ai').onclick = () => {
        const msg = $('#' + p.id + 'Msg');
        if (words(ta.value) < (min || 10)) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Encara és massa curt: escriu almenys ' + (min || 10) + ' paraules.' : 'Too short: write at least ' + (min || 10) + ' words.'; return; }
        window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(markPrompt(p, ta.value.trim())), '_blank', 'noopener,noreferrer');
        msg.className = 'feedback ok';
        msg.textContent = ca() ? 'Desat ✓ S’ha obert ChatGPT. Apunta aquí sota els punts que et doni i llegeix què has de millorar.' : 'Saved ✓ ChatGPT has opened. Note the points it gives you below and read what to improve.';
        complete(p.id);
      };
    }
  });
  // My score: auto-marked sections (first try, as in the exam) + the guide marks noted from ChatGPT.
  R.summary = p => ({
    html: '<div class="section-card"><div id="' + p.id + 'Table"></div><p class="warm-note">' + aiWarning() + '</p></div>',
    bind() {
      const draw = () => {
        let got = 0, max = 0, missing = false;
        const rows = LP.panels.filter(x => x.type === 'quiz' || x.type === 'marked').map(x => {
          const m = maxOf(x), t = x.type === 'quiz' ? (state.tries || {})[x.id + '_' + level] : null, a = x.type === 'marked' ? (state.ai || {})[x.id + '_' + level] : null;
          const v = x.type === 'quiz' ? (t ? t.score : null) : (a != null ? a : null);
          max += m; if (v == null) missing = true; else got += v;
          return '<tr><td>' + tx(x.tab) + (x.type === 'marked' ? ' <small>(ChatGPT)</small>' : '') + '</td><td style="text-align:right">' + (v == null ? '–' : v) + ' / ' + m + '</td></tr>';
        });
        $('#' + p.id + 'Table').innerHTML = '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + rows.join('') +
          '<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>' + got + ' / ' + max + '</strong> · ' + (Math.round(got / max * 100) / 10) + ' / 10</td></tr></tbody></table>' +
          (missing ? '<p class="tiny">' + (ca() ? '– = encara no ho has fet (o no has apuntat els punts de ChatGPT).' : '– = not done yet (or ChatGPT’s points not noted).') + '</p>' : '');
      };
      LP.onScore = draw; draw();
    }
  });

  /* ---------- page ---------- */
  /* Plan and review (research audit, Roger 26 Oct 2026: metacognition): a one-line goal before the Learning Path and two short answers
     after it, saved in state.plan / state.review (per route) and shown to the teacher in the activity dialog. Never a step, never marked. */
  const reflective = () => LP.panels.some(p => p.id === 'recall');
  function planCard() {
    if (!reflective()) return '';
    return '<div class="section-card plan-card"><h3>🎯 ' + (ca() ? 'El meu objectiu' : 'My goal') + '</h3><p class="instruction">' + (ca() ? 'Abans de començar: pensa en el teu últim recall o checkpoint. Què vols millorar en aquest Learning Path?' : 'Before you start: think about your last recall or checkpoint. What do you want to get better at in this Learning Path?') + '</p>' +
      '<input type="text" class="typed" id="lpGoal" maxlength="200" placeholder="' + (ca() ? 'Per exemple: recordar les paraules noves sense mirar.' : 'For example: remember the new words without looking.') + '"></div>';
  }
  function reviewCard() {
    if (!reflective()) return '';
    return '<div class="section-card plan-card"><h3>🔁 ' + (ca() ? 'Com m’ha anat' : 'How did it go?') + '</h3>' +
      '<label class="field"><strong>' + (ca() ? 'Què m’ha ajudat més?' : 'What helped me most?') + '</strong><input type="text" class="typed" id="lpHelped" maxlength="200"></label>' +
      '<label class="field"><strong>' + (ca() ? 'Què he de repassar?' : 'What do I need to review?') + '</strong><input type="text" class="typed" id="lpReview" maxlength="200"></label>' +
      '<p class="tiny" id="lpReviewMsg"></p></div>';
  }
  function bindPlan() {
    if (!reflective()) return;
    state.plan = state.plan || {}; state.review = state.review || {};
    const g = $('#lpGoal'), h = $('#lpHelped'), r = $('#lpReview'), rv = state.review[level] || {};
    g.value = state.plan[level] || ''; h.value = rv.helped || ''; r.value = rv.review || '';
    g.onchange = () => { state.plan[level] = g.value.trim(); save(); };
    const keep = () => { state.review[level] = { helped: h.value.trim(), review: r.value.trim(), at: new Date().toISOString() }; save(); $('#lpReviewMsg').textContent = ca() ? 'Desat ✓' : 'Saved ✓'; };
    h.onchange = keep; r.onchange = keep;
  }
  function render() {
    const active = ($('.tab.active') || {}).dataset ? $('.tab.active').dataset.panel : LP.panels[0].id;
    $('#lp').innerHTML = trackNote() + planCard() + '<nav class="tabs" aria-label="Sections">' + LP.panels.map((p, i) => '<button class="tab' + (p.id === active ? ' active' : '') + '" data-panel="' + p.id + '">' + (i + 1) + ' ' + tx(p.tab) + '</button>').join('') + '</nav>' +
      LP.panels.map(p => { const r = R[p.type](p); p._r = r; return '<section class="panel' + (p.id === active ? ' active' : '') + '" id="' + p.id + '"><div class="panel-head"><div><h2>' + tx(p.title) + '</h2><p class="instruction">' + tx(p.intro || '') + '</p>' + '</div>' + (p.pill ? '<span class="pill">' + tx(p.pill) + '</span>' : '') + '</div>' + r.html + '</section>'; }).join('') +
      reviewCard() + '<p class="footer-note">' + (ca() ? 'Les respostes i el progrés es desen per a cada ruta.' : 'Your answers and progress are saved for each route.') + '</p>';
    flashcardSet.config = null;
    LP.panels.forEach(p => p._r.bind());
    bindPlan();
    $$('.tab').forEach(t => t.onclick = () => { $$('.tab,.panel').forEach(x => x.classList.remove('active')); t.classList.add('active'); $('#' + t.dataset.panel).classList.add('active'); window.scrollTo({ top: $('#lp').offsetTop - 64, behavior: 'smooth' }); });
    initNext();
    progress();
  }
  function stepDone(p) { return p.type === 'info' || p.type === 'summary' ? true : p.type === 'vocab' ? !!state.done.cards && (!p.practice || !!state.done.practice) : !!state.done[p.id]; }
  function initNext() {
    $$('.section-next').forEach(e => e.remove());
    const last = LP.panels[LP.panels.length - 1];
    sectionNext.init({ level: () => level, panels: LP.panels.slice(0, -1).map(p => ({ id: p.id, done: () => stepDone(p), detail: c => c ? 'Completa les activitats d’aquesta secció (80 % on es corregeix).' : 'Finish this section’s activities (80 % where they are corrected).' })) });
    sectionNext.final({ id: last.id, level: () => level, done: () => stepDone(last), detail: c => c ? 'Completa l’última activitat.' : 'Finish the last activity.' });
  }
  function init(config) {
    if (!document.getElementById('trackNoteCss')) document.head.insertAdjacentHTML('beforeend', '<style id="trackNoteCss">.track-note{margin:0 0 14px;padding:10px 13px;background:#fff8e1;border:1px solid #f3d27a;border-radius:13px;color:#5b4300;font-size:.95rem;line-height:1.45}</style>');
    LP = config;
    level = localStorage.getItem(LP.key + 'Level') || 'insecure';
    if (ROUTES.indexOf(level) < 0) level = 'insecure';
    try { state = JSON.parse(localStorage.getItem(LP.key) || '{}'); } catch (e) { state = {}; }
    state.done = state.done || {};
    const sel = $('#sessionJump');
    if (sel) { const here = location.pathname.split('/').pop(); sel.innerHTML = PAGES.map(([f, t]) => '<option value="' + f + '"' + (f === here ? ' selected' : '') + '>' + t + '</option>').join(''); sel.onchange = () => { location.href = sel.value; }; }
    $$('.route').forEach(b => { b.classList.toggle('active', b.dataset.level === level); b.onclick = () => { level = b.dataset.level; $$('.route').forEach(x => x.classList.toggle('active', x === b)); save(); render(); learningSupport.apply(level); }; });
    render();
    learningSupport.apply(level);
  }
  return { init, PAGES, PRODUCTS, get level() { return level; }, get state() { return state; } };
})();
