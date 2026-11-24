/* Free Time, Live! (2 ESO, LS2): renders a Learning Path from the page's window.LP config. Copied from 4 ESO LS2 (the living model);
   only the page list, the storage keys, the LS names in the AI prompts and the route levels differ.
   Content lives in each page; this file only holds the activity types, scoring and progress.
   Routes are cumulative: an item with r:"safe" is shown to Safe and Daring. Auto-corrected steps
   complete once every question is answered and checked, whatever the score (Roger, 6 Nov 2026; was 80 %); the recall warm-up completes when submitted and keeps the first attempt. */
var LS2 = (function () {
  // Beginners (A1) sits below Insecure: it sees every untagged item and, where a text or list has no 'beginners' version, the Insecure one.
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
  const PAGES = [
    ['getting-started.html', '1 · Getting started'],
    ['book.html', '📖 Book · Maya Live!'],
    ['what-are-they-doing.html', '2 · What are they doing?'],
    ['recall-checkpoint-1.html', 'Recall checkpoint 1'],
    ['now-or-usually.html', '3 · Now or usually?'],
    ['recall-checkpoint-2.html', 'Recall checkpoint 2'],
    // no gap in the numbers (Roger, 21 Nov 2026): Check the source (dropped for now) is LP6, after the paths students do, as in EL_CATALOG
    ['likes-and-screen-tips.html', '4 · Likes and screen tips'],
    ['recall-checkpoint-3.html', 'Recall checkpoint 3'],
    ['write-your-vlog-script.html', '5 · Write your vlog script'],
    ['recall-checkpoint-4.html', 'Recall checkpoint 4'],
    ['check-the-source.html', '6 · Check the source'],
    ['sample-exam.html', 'Sample exam 1'],
    ['free-time-vlog.html', '7 · Final product'],
    ['reflect.html', 'Reflect']
  ];
  const PRODUCTS = 'ls2Products2ESO';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  let LP, level, state;
  // Catalan only for Starter (Roger, 21 Nov 2026: "base is also in English, no Catalan help"). Base keeps its extra support
  // (questions shown, slower voice), now in English: sup().
  const ca = () => level === 'beginners', sup = () => level === 'beginners' || level === 'insecure';
  window.elMicCa = ca;   // the microphone helper (shared/js/el-mic.js) speaks the route's language
  /* Starter works differently, not only with fewer questions (Roger, 31 Oct 2026, thread "Explain Starter vs Base learning paths").
     Only in Learning Paths whose data says starter: true (paths students had not started that day; started ones stay as they were):
     Starter picks typed answers from three options (a wrong pick is crossed out and they try again), starts every listening and
     video on the slow copy with English subtitles, and has 16 s to answer in Talk. Base and the other routes do not change. */
  const starter = () => level === 'beginners' && !!(LP && LP.starter);
  const tx = o => o == null ? '' : typeof o === 'string' ? o : (ca() ? (o.ca || o.en) : (o.en || o.ca));
  const byLevel = o => o == null ? '' : typeof o === 'string' ? o : (o[level] != null ? o[level] : o.safe != null && level === 'daring' ? o.safe : o.insecure);   // beginners → insecure
  // only: ['insecure'] keeps an item to the routes listed (Base-only practice of a basic form the higher routes already know).
  // A list is cumulative (r: tags); an object keyed by route gives each route its own list (the sample exam: same number of items per route).
  const forLevel = items => !items ? [] : Array.isArray(items) ? items.filter(x => ROUTES.indexOf(x.r || 'beginners') <= ROUTES.indexOf(level) && (!x.only || x.only.includes(level))) : (items[level] || (level === 'beginners' ? items.insecure : null) || []);
  const need = n => Math.ceil(n * 0.8);   // no longer decides a step (kept for older notes)
  /* A step is done once every activity has been answered and checked, whatever the score (Roger, 6 Nov 2026: "when all the activities
     have been done the SLP counts as done"). The score still shows, the first try still counts for the mark. */
  const answered = (items, prefix) => vals(items, prefix).every(v => v != null && String(v).trim() !== '');
  const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const words = s => (String(s).trim().match(/\S+/g) || []).length;
  /* Words that count for a writing's minimum (Roger, 4 Nov 2026: a student filled the text with "c c c c" to reach it): a letter
     repeated alone ("c", "cc", "xxxx") is not a word; "a", "I" and numbers are. The tip under the box says single letters don't count. */
  const realWords = s => (String(s).match(/\S+/g) || []).filter(w => { const l = w.toLowerCase().replace(/[^a-zà-ÿ]/g, ''); return /\d/.test(w) || (l && (!/^(.)\1*$/.test(l) || l === 'a' || l === 'i')); }).length;
  const padNote = s => words(s) - realWords(s) >= 3 ? (ca() ? ' Les lletres soltes (com «c c c») no compten.' : ' Single letters (like "c c c") don\u2019t count.') : '';

  function save() { localStorage.setItem(LP.key, JSON.stringify(state)); localStorage.setItem(LP.key + 'Level', level); progress(); }
  /* Own work follows the route (Roger, 2 Nov 2026, problem report: a student wrote the LP2 writing on Daring, the teacher moved him to Safe
     from the LS1 exam, and the Writing tab showed an empty box). Texts, speaking plans and transcripts, Talk answers, drafts, final
     versions and the goal and review cards are saved per route; when the route on screen has nothing yet, the newest (else the longest)
     from another route is copied in, so the student sees it, can improve it and hand it in. Never overwrites what the route already has. */
  function carryRoute() {
    const rx = new RegExp('^(.*)_(' + ROUTES.join('|') + ')$');
    const size = v => typeof v === 'string' ? v.trim().length : v && typeof v === 'object' ? Object.keys(v).filter(k => k !== 'at').reduce((n, k) => n + size(v[k]), 0) : 0;
    const at = v => v && typeof v === 'object' && typeof v.at === 'string' ? v.at : '';
    const better = (a, b) => at(a) !== at(b) ? at(a) > at(b) : size(a) > size(b);
    let moved = false;
    const carry = (o, base) => {   // o[key] for every route: keys "<base>_<route>", or the route itself when base is null
      const key = r => base == null ? r : base + '_' + r;
      if (size(o[key(level)])) return;
      let best = null;
      ROUTES.forEach(r => { const v = o[key(r)]; if (r !== level && size(v) && (best == null || better(v, best))) best = v; });
      if (best != null) { o[key(level)] = JSON.parse(JSON.stringify(best)); moved = true; }
    };
    ['texts', 'speak', 'drafts', 'finals'].forEach(n => {
      const o = state[n]; if (!o || typeof o !== 'object') return;
      new Set(Object.keys(o).map(k => (k.match(rx) || [])[1]).filter(b => b != null)).forEach(b => carry(o, b));
    });
    ['plan', 'review'].forEach(n => { if (state[n] && typeof state[n] === 'object') carry(state[n], null); });
    if (moved) save();
  }
  // doneAt[k]: when the step was first completed; tries[k]: the first check of an auto-corrected step. The teacher dashboard
  // uses them for the grammar and vocabulary block (first try + done by the session deadline in el-plan.js).
  // last[k]: the latest check, shown on the dashboard next to the first try (never counted).
  function complete(k) { if (!state.done[k]) { state.done[k] = true; stamp(k); save(); } else progress(); }
  // a step checked earlier with every question answered but under the old 80 %: done now, on the day of that check (Roger, 6 Nov 2026)
  function doneFrom(k, tk) { if (state.done[k]) return; const d = ((state.last || {})[tk] || (state.tries || {})[tk] || {}).date; if (!d) return; state.done[k] = true; state.doneAt = state.doneAt || {}; if (!state.doneAt[k]) state.doneAt[k] = d; save(); }
  function stamp(k) { state.doneAt = state.doneAt || {}; if (!state.doneAt[k]) state.doneAt[k] = new Date().toISOString(); }
  // all[k] {s, n}: every try of a step (s = the sum of score/max, n = how many), for the LS home's % per skill (Roger, 20 Nov 2026:
  // "average of all tries"). A step tried before 20 Nov 2026 starts from its latest try and its first one (the only two kept then).
  // whole = false: a check of only some of the questions, not a try (the questions not answered yet would count as wrong).
  function lastTry(k, score, max, whole) {
    state.last = state.last || {}; state.all = state.all || {};
    if (!state.all[k]) { const A = state.all[k] = { s: 0, n: 0 }, P = state.last[k], F = (state.tries || {})[k], add = x => { if (x && +x.max > 0) { A.s += (+x.score || 0) / +x.max; A.n++; } };
      if (P) { add(P); if (F && Date.parse(P.date) - Date.parse(F.date) > 5000) add(F); } }
    if (whole !== false && +max > 0) { const A = state.all[k]; A.s = Math.round((A.s + score / max) * 1000) / 1000; A.n++; }
    state.last[k] = { score, max, level, date: new Date().toISOString() };
  }
  function firstTry(k, score, max) { state.tries = state.tries || {}; if (!state.tries[k]) state.tries[k] = { score, max, level, date: new Date().toISOString() }; lastTry(k, score, max); save(); }
  // items[panel_route]: every question of a panel's first counted check, kept once per route, for the dashboard's Question analysis
  // (Roger, 26 Oct 2026). q: the question's place in the page's list (in the route's own list when the page gives one per route),
  // ok: 1 right / 0 wrong, a: what was typed or the option chosen (0 = the right one). Students never see it.
  function firstItems(id, src, items, got) {
    state.items = state.items || {}; const k = id + '_' + level; if (state.items[k]) return;
    state.items[k] = { level, date: new Date().toISOString(), q: items.map((it, i) => Array.isArray(src) ? src.indexOf(it) : i), ok: got.map(g => g[0] ? 1 : 0), a: got.map(g => g[1]) }; save();
  }
  function steps() { return LP.panels.flatMap(p => p.type === 'info' || p.type === 'summary' ? [] : p.type === 'vocab' ? (p.practice ? ['cards', 'practice'] : ['cards']) : [p.id]); }
  // steps of a section the teacher has not opened yet and the student never did are left out (EL_HIDDEN_STEPS, el-cloud.js lockSections):
  // students never see that anything is locked (Roger, 7 Nov 2026)
  function progress() {
    const hid = window.EL_HIDDEN_STEPS || [], s = steps().filter(k => state.done[k] || !hid.includes(k)), n = s.filter(k => state.done[k]).length;
    $('#progressLabel').textContent = cap(level);
    $('#progressText').textContent = n + ' / ' + s.length;
    $('#progressBar').style.width = (n / s.length * 100) + '%';
    if (LP && LP.panels) markTabs();
  }
  window.elProgress = () => { try { progress(); } catch (e) {} };
  function saveProduct(piece, text) {
    let all = {}; try { all = JSON.parse(localStorage.getItem(PRODUCTS) || '{}'); } catch (e) {}
    all[piece] = { level, text, date: new Date().toISOString() };
    localStorage.setItem(PRODUCTS, JSON.stringify(all));
  }

  /* ---------- continuous assessment note (Roger, 26 Oct 2026) ---------- */
  // The same note on every page: the teacher tracks every activity and some are assessed. Never say which steps count.
  function trackNote() {
    return '<p class="track-note">' + (ca()
      ? '📋 <strong>El professor fa el seguiment de totes les activitats que fas.</strong> Algunes s’avaluaran i seran la teva avaluació contínua, que és una part de la nota. Fes cada activitat tu sol/a i sense apunts la primera vegada; després la pots repetir per practicar. Acaba-les a temps: mira «Deures» al teu tauler.'
      : '📋 <strong>Your teacher keeps track of all the activities you do.</strong> Some of them will be assessed and make up your continuous assessment, which is part of your mark. Do each activity on your own and without notes the first time; you can repeat it later to practise. Finish them on time: check “Homework” on your board.') + '</p>';
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
  /* ElevenLabs recordings (Roger, 31 Oct 2026: "all the audios with ElevenLabs"): tools/tts records each line the browser voice used to
     say as audio/tts/<key>.mp3 (+ -slow.mp3, the same audio at 0.75), key = FNV-1a of the text exactly as passed here (tools/tts/tts-key.js);
     data/tts.js lists the recorded keys. Listen-and-complete recordings already have the beep in the gap. A line with no recording still
     uses the browser voice. */
  const ttsKey = s => { let h = 0x811c9dc5; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
  (function () { if (window.LS2_TTS || document.querySelector('script[data-tts]')) return; const t = document.createElement('script'); t.src = 'data/tts.js'; t.dataset.tts = '1'; document.head.appendChild(t); })();
  let recAudio = null;
  function stopSay() { sayTok++; if (recAudio) { recAudio.pause(); recAudio = null; } if (window.speechSynthesis) speechSynthesis.cancel(); }
  // plays the recording of text (slow when rate < 0.8) and returns true, or returns false when there is none
  function playRec(text, rate, onend) {
    const k = ttsKey(text); if (!window.LS2_TTS || !window.LS2_TTS.has(k)) return false;
    stopSay(); const tok = sayTok, a = new Audio('audio/tts/' + k + ((rate || 1) < 0.8 ? '-slow' : '') + '.mp3'); recAudio = a;
    let once = false; const done = () => { if (once || tok !== sayTok) return; once = true; if (onend) onend(); };
    a.onended = done; a.onerror = () => { if (tok !== sayTok) return; recAudio = null; window.LS2_TTS.delete(k); sayLine(text, rate, onend); };
    a.play().catch(() => {}); return true;
  }
  function beep(done) { try { bctx = bctx || new (window.AudioContext || window.webkitAudioContext)(); const o = bctx.createOscillator(), g = bctx.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(bctx.destination); o.start(); setTimeout(() => { o.stop(); done && done(); }, 450); } catch (e) { done && done(); } }
  // Says text (or a gapped sentence, with a beep for each gap) in order; a newer call stops an older one.
  function sayLine(q, rate, onend) {
    if (playRec(q, rate, onend)) return;
    if (recAudio) { recAudio.pause(); recAudio = null; }
    const s = window.speechSynthesis; if (!s) { if (onend) onend(); return; } if (s.speaking || s.pending) s.cancel(); const tok = ++sayTok;   // cancel only when something is playing: on the iPhone a speak() straight after cancel() can stay silent
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
  /* ---------- Starter choices: the right answer + two distractors ---------- */
  // Authored distractors first (item.d), then forms of the verb in brackets (Present Simple / Continuous, affirmative or negative),
  // then other answers of the same step with the same number of words. The order is fixed per item so a page reload shows the same.
  const s3 = v => ({ go: 'goes', do: 'does', have: 'has', be: 'is' })[v] || (/[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : /(s|sh|ch|x|z|o)$/.test(v) ? v + 'es' : v + 's');
  const ing = v => /ie$/.test(v) ? v.slice(0, -2) + 'ying' : (/[^e]e$/.test(v) ? v.slice(0, -1) + 'ing' : /^[^aeiou]*[aeiou][bdgmnprt]$/.test(v) ? v + v.slice(-1) + 'ing' : v + 'ing');
  const hash = t => { let h = 7; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function verbForms(it) {
    const m = String(it.q).match(/\((?:not \/ )?([a-z]+)\)/); if (!m) return null;
    const v = m[1], g = ing(v), a = expand(it.a[0]).trim(), be = /(^|\W)I ___/.test(it.q) ? 'am' : 'are';
    const map = {};
    map[v] = [s3(v), be + ' ' + g]; map[s3(v)] = [v, 'is ' + g]; map[g] = [v, s3(v)];
    map['are going to ' + v] = ['is going to ' + v, 'will ' + v]; map['is going to ' + v] = ['are going to ' + v, 'will ' + v]; map['am going to ' + v] = ['is going to ' + v, 'will ' + v]; map['will ' + v] = ['is going to ' + v, s3(v)];
    map['is ' + g] = ['are ' + g, s3(v)]; map['are ' + g] = ['is ' + g, v]; map['am ' + g] = ['is ' + g, v];
    map['does not ' + v] = ["don't " + v, "isn't " + g]; map['do not ' + v] = ["doesn't " + v, "aren't " + g];
    map['is not ' + g] = ["aren't " + g, "doesn't " + v]; map['are not ' + g] = ["isn't " + g, "don't " + v]; map['am not ' + g] = ["isn't " + g, "don't " + v];
    return map[a] || null;
  }
  // words that are confused with each other: a wrong option from the same set teaches more than a random word
  const SETS = [['at', 'in', 'on'], ['because', 'but', 'and', 'so', 'also'], ['first', 'then', 'finally', 'next'], ['always', 'usually', 'often', 'sometimes', 'never'], ['am', 'is', 'are'], ['do', 'does', 'is', 'are'], ['will', 'going to', 'is going to']];
  function choices(it, items, salt) {
    const same = x => it.a.some(a => expand(a) === expand(x)), out = [];
    const add = x => { if (out.length < 2 && x && !same(x) && !out.some(o => expand(o) === expand(x))) out.push(x); };
    (it.d || []).forEach(add);
    (verbForms(it) || []).forEach(add);
    const ingQ = String(it.q).match(/-ing form: ([a-z]+)/); if (ingQ) { const v = ingQ[1]; [v + 'ing', v.replace(/e$/, '') + v.slice(-1) + 'ing', s3(v)].forEach(add); }
    const a0 = norm(it.a[0]), set = SETS.find(g => g.includes(a0)); if (set) set.filter(x => x !== a0).sort((x, y) => hash(salt + x) - hash(salt + y)).forEach(add);
    const wc = words(it.a[0]);
    items.map(x => x.a[0]).filter(x => x !== it.a[0]).sort((x, y) => ((words(y) === wc) - (words(x) === wc)) || (hash(salt + x) - hash(salt + y))).forEach(add);
    return [it.a[0]].concat(out).sort((x, y) => hash(salt + x) - hash(salt + y));
  }
  function picksHtml(it, items, prefix, i, mode) {
    const salt = LP.key + prefix + i, opts = it.opts ? it.opts.slice().sort((x, y) => hash(salt + x) - hash(salt + y)) : choices(it, items, salt);
    return '<div class="actions pick-row" style="justify-content:flex-start" data-for="' + prefix + i + '">' + opts.map(o =>
      '<button class="btn secondary" type="button" data-pick="' + prefix + i + '"' + (mode === 'say' ? ' data-say="1"' : '') + ' data-v="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>';
  }
  // highlights the option that is in the box (after a pick or when saved answers come back)
  function syncPicks() {
    $$('.pick-row').forEach(r => { const box = $('#' + r.dataset.for), v = box ? norm(box.value) : '';
      r.querySelectorAll('[data-pick]').forEach(b => { const on = !!v && norm(b.dataset.v) === v; b.setAttribute('aria-pressed', on); b.style.setProperty('background', on ? 'var(--accent)' : '', on ? 'important' : ''); b.style.setProperty('color', on ? '#fff' : '', on ? 'important' : ''); }); });
  }
  function bindPicks() {
    if (document.body.dataset.picks) return; document.body.dataset.picks = '1';
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-pick]'); if (!b || b.disabled) return;
      const box = $('#' + b.dataset.pick); if (!box) return;
      if (b.dataset.say && box.readOnly) { const h = $('#' + b.dataset.pick.replace(/(\d+)$/, 'h$1')); if (h) h.textContent = 'Primer prem 🎤 i digues la frase sencera amb aquesta resposta.'; return; }
      box.value = b.dataset.v; box.dispatchEvent(new Event('input', { bubbles: true })); syncPicks();
    });
  }
  /* Grammar in parts (Roger, 13 Nov 2026: "students don't have good activities to practise this theory"): a typed panel with `parts`
     ([{id, r, title, note}]) shows its items in blocks, one per grammar point (item.p = the part's id), each item with its own kind:
     hear: 1 = 🎧 listen and complete · opts: [...] = 👆 choose (buttons for every route; the first right answer is in a) ·
     k: 'join' | 'change' | 'fix' = 🔗 / 🔄 / 🔧 · own: {must: [regex], min} = ✏️ a sentence of their own, right when it has at least
     min words and every pattern (the teacher reads it in the activity) · otherwise ✏️ complete. show: the answer as the student sees it.
     Without parts, nothing changes: the panel's mode is for every item, as before. */
  const picking = it => !it.own && (starter() || !!it.opts);
  // a step in parts keeps the panel's mode for its plain gaps (4 ESO LP3 has none: no listening there; the other LPs keep theirs)
  const itemMode = (it, mode, parts) => parts ? (it.hear ? 'listen' : it.say ? 'say' : it.opts || it.k || it.own ? null : mode || null) : mode;
  /* 7 compulsory questions per block, the rest is extra practice (Roger, 13 Nov 2026: "they are too many activities, make 7 of each section
     compulsory and the rest to practice … when they have done 7, a message appears saying you can turn in this activity"). Per block, in the
     route's own list: the first 6 questions plus the ✏️ own example (or the first 7 when there is none) are compulsory, shown first; the rest
     follow under "➕ Extra practice". Only the compulsory ones count: the step is done when they are all answered and checked, and the mark
     (first try) is over them; the extras get feedback but never count, and an empty extra is no error. */
  /* How many are compulsory per block is the panel's `req` (Roger, 13 Nov 2026, new flow: explanation → 🙌 all together → notebook / pairs →
     "a short individual set … it's not about volume but quality"): `req: 4` = 3 questions + the own example. Without `req`, 7. */
  const REQ = 7, EXTRA = new WeakSet();
  function arrange(items, n) {
    n = n || REQ;
    const order = [], by = {};
    items.forEach(it => { if (!by[it.p]) { by[it.p] = []; order.push(it.p); } by[it.p].push(it); });
    const out = [], need = [], per = {};
    order.forEach(k => {
      const list = by[k], own = list.filter(x => x.own), plain = list.filter(x => !x.own);
      const req = own.length ? plain.slice(0, n - 1).concat(own.slice(0, 1)) : plain.slice(0, n);
      const ext = list.filter(x => !req.includes(x));
      per[k] = [];
      req.forEach(it => { per[k].push(out.length); need.push(out.length); out.push(it); });
      ext.forEach(it => { EXTRA.add(it); out.push(it); });
    });
    return { items: out, need, per };
  }
  const ownOk = (it, v) => { const t = String(v || '').trim(); return words(t) >= (it.own.min || 5) && (it.own.must || []).every(re => new RegExp(re, 'i').test(t)); };
  function kindChip(it, m) {
    const K = { listen: ['🎧', 'Escolta i completa', 'Listen and complete'], pick: ['👆', 'Tria', 'Choose'], join: ['🔗', 'Uneix les dues frases', 'Join the two sentences'],
      change: ['🔄', 'Canvia la frase', 'Change the sentence'], fix: ['🔧', 'Troba l’error i corregeix-lo', 'Find the mistake and correct it'],
      own: ['✏️', 'El teu exemple', 'Your own example'], fill: ['✏️', 'Completa', 'Complete'] };
    const key = m === 'listen' ? 'listen' : it.own ? 'own' : it.k && K[it.k] ? it.k : it.opts ? 'pick' : 'fill';
    if (key === 'pick' || key === 'fill') return '';   // 👆 Choose / ✏️ Complete are obvious from the question itself (Roger, 19 Nov 2026)
    const k = K[key];
    return '<span class="gkind gk-' + (it.own ? 'own' : m === 'listen' ? 'listen' : it.k || (it.opts ? 'pick' : 'fill')) + '">' + k[0] + ' ' + (ca() ? k[1] : k[2]) + '</span>';
  }
  function partsCss() {
    if (document.getElementById('el-gparts-css')) return;
    const st = document.createElement('style'); st.id = 'el-gparts-css';
    st.textContent = '.gpart{margin:26px 0 6px;padding-top:14px;border-top:2px dashed var(--line,#d8e0ea)}.gpart:first-child{margin-top:0;padding-top:0;border-top:0}.gpart h3{margin:0 0 6px}' +
      '.gnote{padding:10px 14px;border-radius:12px;background:#f3f7fc;border:1px solid #c5d8ef;line-height:1.55;margin-bottom:6px}' +
      '.gkind{display:inline-block;margin:0 0 6px;padding:2px 10px;border-radius:999px;font-size:.82em;font-weight:800;background:#eef2f7;color:#334155}' +
      '.gk-pick{background:#e0f2fe;color:#075985}.gk-join{background:#ede9fe;color:#5b21b6}.gk-change{background:#fef3c7;color:#92400e}.gk-fix{background:#fee2e2;color:#991b1b}.gk-own{background:#dcfce7;color:#166534}.gk-listen{background:#f1f5f9;color:#334155}' +
      '.question input.typed.own{width:100%;max-width:none}' +
      '.gcount{display:inline-block;margin-left:8px;padding:2px 10px;border-radius:999px;font-size:.62em;font-weight:800;vertical-align:middle;background:#eef2f7;color:#334155}.gcount.ok{background:#dcfce7;color:#166534}' +
      '.gbd{margin:14px 0 0;padding:10px 14px;border-radius:12px;background:#dcfce7;border:1px solid #86efac;color:#14532d;font-weight:700}' +
      '#el-gready{font:700 15px system-ui,-apple-system,Segoe UI,sans-serif;position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147481000;display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 32px);padding:12px 18px;border-radius:16px;background:#14532d;color:#fff;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
      '#el-gready button{border:0;border-radius:999px;padding:8px 16px;background:#fff;color:#14532d;font-weight:800;cursor:pointer}' +
      '.gextra{margin:22px 0 4px;padding:10px 14px;border-radius:12px;background:#fff7ed;border:1px dashed #fdba74;color:#7c2d12}';
    document.head.appendChild(st);
  }
  // one: every question gets its own ✓ Check (not the recall warm-up, which is one try for the whole set)
  function typedHtml(items, prefix, mode, parts, one) {
    if (starter() || items.some(it => it.opts)) bindPicks();
    if (parts) partsCss();
    if (one) oneCss();
    let sec = null, np = 0, inX = false;   // blocks are numbered in the order this route sees them
    const head = it => {
      if (!parts) return '';
      if (it.p === sec) { if (EXTRA.has(it) && !inX) { inX = true; return '<div class="gextra">➕ <b>' + (ca() ? 'Pràctica extra (opcional)' : 'Extra practice (optional)') + '</b>: ' + (ca() ? 'no compta per a la nota. Fes-la si vols practicar més.' : 'it doesn’t count for your mark. Do it if you want more practice.') + '</div>'; } return ''; }
      sec = it.p; inX = false; const pt = parts.find(x => x.id === it.p);
      return pt ? '<div class="gpart"><h3>' + (++np) + ' · ' + tx(pt.title) + ' <span class="gcount" data-part="' + esc(it.p) + '"></span></h3>' + (pt.note ? '<div class="gnote">' + tx(pt.note) + '</div>' : '') + '</div>' : ''; };
    return (starter() && items.length ? '<p class="instruction">Tria la resposta correcta entre les tres opcions. Si falles, aquella opció queda ratllada, llegeixes la pista i tornes a provar.</p>' : '') +
      items.map((it, i) => { const m = itemMode(it, mode, parts), pk = picking(it); return head(it) + '<div class="question' + (EXTRA.has(it) ? ' gx' : '') + '">' + (parts ? kindChip(it, m) : '') + (m === 'listen'
        ? '<div class="actions" style="justify-content:flex-start;align-items:center"><strong>' + (i + 1) + '.</strong><button class="btn secondary" type="button" data-hear="' + prefix + i + '">▶ ' + (ca() ? 'Escolta' : 'Listen') + '</button><button class="btn secondary" type="button" data-hear-slow="' + prefix + i + '">🐢 ' + (ca() ? 'Més lent' : 'Slower') + '</button>' + (cue(it.q) ? '<span class="tiny">' + esc(cue(it.q)) + '</span>' : '') + '</div>' +
          '<details class="draft-box"><summary>' + (ca() ? 'Mostra la frase' : 'Show the sentence') + '</summary><p class="q-title">' + it.q + '</p></details>'
        : '<p class="q-title">' + (i + 1) + '. ' + it.q + '</p>' + (m === 'say' ? '<div class="actions" style="justify-content:flex-start;align-items:center"><button class="btn secondary" type="button" data-mic="' + prefix + i + '"' + (SRC() ? '' : ' hidden') + '>🎤 ' + (ca() ? 'Digues la frase' : 'Say the sentence') + '</button><span class="tiny" id="' + prefix + 'h' + i + '"></span></div>' : '')) +
      (one ? '<div class="el-onerow">' : '') + '<input type="text" class="typed' + (it.own ? ' own' : '') + '" id="' + prefix + i + '" autocomplete="off" autocapitalize="off" spellcheck="false"' + (m === 'say' && SRC() ? ' readonly placeholder="' + (ca() ? 'Prem 🎤 i digues la frase' : 'Press 🎤 and say the sentence') + '"' : pk ? ' readonly placeholder="' + (ca() ? 'Tria una opció' : 'Choose an option') + '"' : it.own ? ' placeholder="' + (ca() ? 'Escriu la teva frase' : 'Write your own sentence') + '"' : '') + '>' + (one ? oneBtn(prefix, i) + '</div>' : '') +
      (pk ? picksHtml(it, items, prefix, i, m) : '') +
      '<div class="feedback" id="' + prefix + 'f' + i + '"></div></div>' + (parts && !EXTRA.has(it) && (!items[i + 1] || items[i + 1].p !== it.p || EXTRA.has(items[i + 1])) ? '<div class="gbd" data-part="' + esc(it.p) + '" hidden></div>' : ''); }).join('');
  }
  const expand = s => (' ' + norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
  /* ✅ ANSWER CHECK (the same block in 2eso/free-time-live/ls2-engine.js, 4eso/seasons-and-celebrations/ls2-engine.js and
     4eso/seasons-and-celebrations/getting-started.html; tools/answer-check/check.mjs keeps the copies identical and runs its cases).
     More than the gap is right too (problem report, 2ESOA, 13 Nov 2026: "Poso tota la frase i diu que no ho he fet bé"): "I am watching" or the
     whole sentence for "I ___ (watch) a basketball match right now." counts when it is a run of words of the sentence with the gap filled
     that holds every word of the answer (contractions either way, the verb in brackets left out). A wrong verb form still fails.
     Roger, 22 Nov 2026 ("I'm detecting a lot of mistakes, do students have the same problem?"): American spellings count as the British ones
     (gray = grey, color = colour, favorite = favourite…), and a gap that shows its first letters (l_____, to c___) takes the whole word or only
     the letters still missing. */
  const UK_US = { gray: 'grey', color: 'colour', colors: 'colours', colorful: 'colourful', favorite: 'favourite', favorites: 'favourites',
    neighbor: 'neighbour', neighbors: 'neighbours', center: 'centre', theater: 'theatre', honor: 'honour', honors: 'honours', honored: 'honoured',
    behavior: 'behaviour', flavor: 'flavour', humor: 'humour', organize: 'organise', organized: 'organised', organizing: 'organising',
    organization: 'organisation', realize: 'realise', realized: 'realised', recognize: 'recognise', apologize: 'apologise', symbolize: 'symbolise',
    criticize: 'criticise', commercialized: 'commercialised', commercialization: 'commercialisation', traveling: 'travelling', traveled: 'travelled',
    traveler: 'traveller', canceled: 'cancelled', cozy: 'cosy', pajamas: 'pyjamas', program: 'programme', programs: 'programmes', mom: 'mum',
    practice: 'practise', practiced: 'practised', practicing: 'practising', jewelry: 'jewellery', catalog: 'catalogue', dialog: 'dialogue',
    skeptical: 'sceptical', defense: 'defence', liter: 'litre', fiber: 'fibre' };
  const bare = s => expand(s).replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/[a-z]+/g, w => UK_US[w] || w);
  function fits(q, answers, typed) {
    const v = norm(typed); if (!v) return false;
    if (answers.some(a => norm(a) === v || bare(a) === bare(v))) return true;   // contractions either way (it's = it is), US spellings
    const Q = String(q || '').replace(/<[^>]+>/g, ''), cue = ((Q.match(/(?:^|[^a-z'’-])([a-z]{1,3})_{2,}/i) || [])[1] || '').toLowerCase();
    if (cue && answers.some(a => { const x = bare(a); return x.startsWith(cue) && x.slice(cue.length) === bare(typed); })) return true;   // l_____ → isten
    const t = bare(typed).split(' '); if (t.length < 2) return false;
    const parts = Q.replace(/(^|[^a-z'’-])[a-z]{1,3}(?=_{2,})/gi, '$1').replace(/\([^)]*\)/g, ' ').split(/_{2,}(?:[\s/]*_{2,})*/), g = parts.length - 1;
    if (g < 1) return false;
    return answers.some(a => {
      const w = norm(a).split(' '), fills = g === 1 ? [w.join(' ')] : g === w.length ? w : g === 2 && w.length > 2 ? [w[0], w.slice(1).join(' ')] : null;
      if (!fills) return false;
      const words = [], gap = [], put = (x, f) => bare(x).split(' ').filter(Boolean).forEach(y => { if (f) gap.push(words.length); words.push(y); });
      put(parts[0]); fills.forEach((f, i) => { put(f, true); put(parts[i + 1]); });
      if (!gap.length) return false;
      for (let k = 0; k + t.length <= words.length; k++)
        if (k <= gap[0] && k + t.length > gap[gap.length - 1] && t.every((x, j) => x === words[k + j])) return true;
      return false;
    });
  }
  /* END ANSWER CHECK */
  /* ✏️ SPELLING SLIPS (same block in every ls2-engine.js and lab/practice.html; tools/spelling-hint/check.mjs keeps them identical).
     Roger, 22 Nov 2026: "the feedback is wrong then because I didn't make a grammar mistake" ("It takes ages to laod." got the grammar rule).
     When a wrong answer matches an accepted one except for spelling, the feedback names the word instead of the grammar rule:
     "Almost! Check the spelling of ‘laod’." A slip is two letters swapped (laod, od for do), or one wrong, missing or extra letter in a word of 4+ letters
     (two in a word of 8+), or a word split or joined (an other = another, alot = a lot); a missing apostrophe gets "Check the apostrophes".
     It is still not right (a spelling slip is wrong, as in the exams, 18 Nov 2026), but it doesn't count as one of the two tries before the
     answer shows. Never a slip: a real word for another (in / on, then / than, were / where, take / took), or a grammar ending (take / takes,
     work / worked, go / going), so grammar mistakes keep their grammar rule. */
  const SP_KNOWN = new Set(('a an the this that these those there their theyre then than them they he she it its we you your youre our out hour ' +
    'i me my mine his her him us who whom whose what when where were wear which witch why how here hear too to two of off on in at by for from form ' +
    'with into onto about above below under over after before since ago during while until till still yet already just even ever never always often ' +
    'also very really quite quiet quit every each both either neither other another others else own same some any much many more most less least few ' +
    'little lot lots no not nor now know knew known new or and but so if as be been being is are was am will would could should shall can may might ' +
    'must have has had having do does did done doing make made take took taken give gave given get got go went gone come came say said tell told see ' +
    'saw seen think thought though through tough buy bought bring brought lose loose loss lost live life lives leave left right write wrote written ' +
    'rise raise lie lay laid lain affect effect accept except advice advise practice practise piece peace brake break weather whether like likes ' +
    'liked well good better best bad worse worst far further farther one ones won once only way ways weigh week weak').split(' '));
  const spEdit = (a, b) => {   // letters to change, add, drop or swap to turn a into b
    const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 3;
    const d = []; for (let i = 0; i <= m; i++) d.push([i]); for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[m][n]; };
  const spSwap = (t, a, K) => t.length === a.length && (a.length >= 3 || !K.has(t)) && t !== a && spEdit(t, a) === 1 && [...t].sort().join('') === [...a].sort().join('');
  const spGram = (t, a) => ['s', 'es', 'd', 'ed', 'ing', 'n', 'en', 'r', 'er', 'est', 'ly'].some(e => t === a + e || a === t + e);
  const spSlip = (t, a, K) => t !== a && !/\d/.test(t + a) && (spSwap(t, a, K) ||
    (a.length >= 4 && !K.has(t) && !spGram(t, a) && spEdit(t, a) <= (a.length >= 8 ? 2 : 1)));
  // the typed words T against the words A from index i: the same, a slip, or a word split or joined. [[typed, right, 0 slip / 1 split / 2 joined]], or null
  function spAlign(A, T, i, j, end, K, out) {
    if (j === T.length) return end(i) ? out : null;
    if (i === A.length) return null;
    if (A[i] === T[j]) return spAlign(A, T, i + 1, j + 1, end, K, out);
    let r = null;
    if (j + 1 < T.length && T[j] + T[j + 1] === A[i]) r = spAlign(A, T, i + 1, j + 2, end, K, out.concat([[T[j] + ' ' + T[j + 1], A[i], 1]]));
    if (!r && i + 1 < A.length && A[i] + A[i + 1] === T[j]) r = spAlign(A, T, i + 2, j + 1, end, K, out.concat([[T[j], A[i] + ' ' + A[i + 1], 2]]));
    if (!r && spSlip(T[j], A[i], K)) r = spAlign(A, T, i + 1, j + 1, end, K, out.concat([[T[j], A[i], 0]]));
    return r; }
  const spBare = s => expand(s).replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const spFlat = s => norm(s).replace(/'/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  // what the slips are (an empty list = only the apostrophes), or null when the answer is wrong for another reason
  function spellSlips(q, answers, typed, more) {
    answers = (answers || []).filter(a => typeof a === 'string' && a.trim()); if (!answers.length || !norm(typed)) return null;
    const K = new Set(SP_KNOWN); answers.concat(more || []).forEach(a => spFlat(a).split(' ').forEach(x => K.add(x)));
    const parts = String(q || '').replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, ' ').split(/_{2,}(?:[\s/]*_{2,})*/), g = parts.length - 1;
    for (const W of [spBare, spFlat]) {
      const T = W(typed).split(' ').filter(Boolean), most = Math.max(1, Math.ceil(T.length / 3)), fine = r => r && r.length <= most;
      if (!T.length) continue;
      for (const a of answers) {   // the answer on its own (a gap, or a whole sentence)
        const A = W(a).split(' ').filter(Boolean), r = spAlign(A, T, 0, 0, i => i === A.length, K, []);
        if (fine(r) && (r.length || W === spFlat)) return r;
      }
      if (g < 1 || T.length < 2) continue;
      for (const a of answers) {   // more than the gap: a run of the sentence with the gap filled that holds the whole answer
        const w = norm(a).split(' '), fills = g === 1 ? [w.join(' ')] : g === w.length ? w : g === 2 && w.length > 2 ? [w[0], w.slice(1).join(' ')] : null;
        if (!fills) continue;
        const A = [], gap = [], put = (x, f) => W(x).split(' ').filter(Boolean).forEach(y => { if (f) gap.push(A.length); A.push(y); });
        put(parts[0]); fills.forEach((f, i) => { put(f, true); put(parts[i + 1]); });
        if (!gap.length) continue;
        for (let k = 0; k <= gap[0]; k++) { const r = spAlign(A, T, k, 0, i => i > gap[gap.length - 1], K, []); if (fine(r) && (r.length || W === spFlat)) return r; }
      }
    }
    return null; }
  // "Almost! Check the spelling of ‘laod’." / "‘an other’ is one word." (cat: the Catalan of Starter)
  function spellHint(sl, cat) {
    const qt = s => '<strong>‘' + esc(s) + '’</strong>', list = xs => xs.length > 1 ? xs.slice(0, -1).map(qt).join(', ') + (cat ? ' i ' : ' and ') + qt(xs[xs.length - 1]) : qt(xs[0]);
    const sp = sl.filter(x => !x[2]).map(x => x[0]), one = sl.filter(x => x[2] === 1).map(x => x[0]), two = sl.filter(x => x[2] === 2).map(x => x[0]), out = [];
    if (sp.length) out.push(cat ? 'Revisa com s’escriu ' + list(sp) : 'Check the spelling of ' + list(sp));
    if (one.length) out.push(list(one) + (cat ? ' s’escriu tot junt' : one.length > 1 ? ' are one word each' : ' is one word'));
    if (two.length) out.push(list(two) + (cat ? ' són dues paraules' : two.length > 1 ? ' are two words each' : ' is two words'));
    if (!out.length) out.push(cat ? 'Revisa els apòstrofs (’)' : 'Check the apostrophes (’)');
    return (cat ? 'Gairebé! ' : 'Almost! ') + out.join('. ') + '.'; }
  /* END SPELLING SLIPS */
  // the accepted answer the student said (in any recognition alternative), or null
  const saidAnswer = (alts, answers) => { const heard = alts.map(expand); return answers.find(a => { const x = expand(a); return x.trim() && heard.some(h => h.includes(x)); }) || null; };
  function bindModes(items, prefix, mode, parts) {
    items.forEach((it, i) => {
      if (itemMode(it, mode, parts) !== 'listen') return;
      $('[data-hear="' + prefix + i + '"]').onclick = () => sayLine(it.q, 0.9);
      $('[data-hear-slow="' + prefix + i + '"]').onclick = () => sayLine(it.q, 0.65);
    });
    const SR = SRC(); if (!SR) return;
    items.forEach((it, i) => {
      if (itemMode(it, mode, parts) !== 'say') return;
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
  // only: the questions to check and show (one sentence's ✓ Check, or the ones checked before on a restore); null = all of them
  function checkTyped(items, prefix, reveal, count, only) {
    let score = 0; got = [];
    items.forEach((it, i) => {
      const v = norm($('#' + prefix + i).value), ok = it.own ? ownOk(it, $('#' + prefix + i).value) : fits(it.q, it.a, $('#' + prefix + i).value), f = $('#' + prefix + 'f' + i);
      got.push([ok, typedAs($('#' + prefix + i))]);
      if (only && !only.includes(i)) return;
      const key = prefix + i;
      // a spelling slip (laod for load): the word is named instead of the grammar rule, and it isn't one of the two tries before the answer
      const sl = !ok && v && !it.own && !it.whole && !picking(it) ? spellSlips(it.q, it.a, $('#' + prefix + i).value, items.flatMap(x => Array.isArray(x.a) ? x.a : [])) : null;
      if (ok) score++; else if (v && count !== false && !sl) tries[key] = (tries[key] || 0) + 1;
      if (picking(it) && v && !ok) $$('[data-pick="' + key + '"]').forEach(b => { if (norm(b.dataset.v) === v) { b.disabled = true; b.style.textDecoration = 'line-through'; } });
      const why = ca() ? (it.ca || it.en || '') : (it.en || it.ca || '');
      const show = reveal || tries[key] >= 2;
      if (!v && EXTRA.has(it)) { f.innerHTML = ''; f.className = 'feedback'; return; }
      f.innerHTML = ok ? (it.own ? (ca() ? 'Molt bé! El professor pot llegir la teva frase.' : 'Well done! Your teacher can read your sentence.') : (ca() ? 'Correcte!' : 'Correct!'))
        : !v ? (picking(it) ? (ca() ? 'Tria una resposta.' : 'Choose an answer.') : ca() ? 'Escriu una resposta.' : 'Type an answer.')
        : sl ? spellHint(sl, ca()) + ' ' + (show ? (ca() ? 'Resposta: ' : 'Answer: ') + '<strong>' + esc(it.show || it.a[0]) + '</strong>' : (ca() ? 'Torna-ho a provar.' : 'Try again.'))
        : (ca() ? 'Encara no. ' : 'Not yet. ') + (why ? why + ' ' : '') +
          (show ? (it.own ? (ca() ? 'Un exemple: ' : 'An example: ') : (ca() ? 'Resposta: ' : 'Answer: ')) + '<strong>' + esc(it.show || (it.a || [])[0] || '') + '</strong>'
                : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
      f.className = 'feedback ' + (ok ? 'ok' : 'no');
    });
    return score;
  }
  // left (set by doneNow): which questions are missing, so the student knows what to do (Roger, 22 Nov 2026: 9 / 10 with all ten typed)
  function leftNote(left) {
    const nums = left.map(i => i + 1), list = nums.length > 1 ? nums.slice(0, -1).join(', ') + (ca() ? ' i ' : ' and ') + nums[nums.length - 1] : String(nums[0]);
    return ca() ? ' · Per completar el pas, respon i comprova ' + (nums.length > 1 ? 'les preguntes ' : 'la pregunta ') + list + ' (✓ Comprova).'
                : ' · To complete the step, answer and check question' + (nums.length > 1 ? 's ' : ' ') + list + ' (✓ Check).';
  }
  function result(el, score, n, done, extra) {
    const left = LEFT; LEFT = null;
    el.textContent = score + ' / ' + n + (ca() ? ' correctes' : ' correct') +
      (done ? (ca() ? ' · Pas completat ✓' : ' · Step complete ✓')
            : left && left.length ? leftNote(left)
            : (ca() ? ' · Respon totes les preguntes per completar el pas.' : ' · Answer every question to complete the step.')) + (extra || '');
    el.classList.add('show');
  }
  /* ---------- ✓ Check one sentence at a time (Roger, 16 Nov 2026: "I want students to be able to check each sentence of a set of sentences
     when doing an activity, since they end up checking the answers before finishing") ----------
     Every question of a typed, vocabulary-practice or reading / listening (mc) activity has its own small Check (button[data-one]); Enter in
     a box checks that box. The step's button (now "Check all") checks every answered question, and an empty one is never marked wrong.
     What counts for the mark is each question's FIRST check: state.items[id_route] (per: 1) is built question by question, and tries[k] is
     the right first checks over every counted question, so a question not checked yet counts 0 until it is (as an empty one did before).
     The step is done once every counted question has been answered and checked. Records saved before this (no per) never change. */
  const CHK = {};   // step id → the questions checked in this attempt (positions; saved as state.ans[id].c; "Check all" adds the empty ones too)
  const chk = id => CHK[id] || (CHK[id] = new Set());
  const filledV = x => x != null && String(x).trim() !== '';
  const allIx = items => items.map((_, i) => i);
  // the questions a check has just marked: the ones shown that have an answer
  const marked = (items, prefix, only) => { const v = vals(items, prefix); return (only || allIx(items)).filter(i => filledV(v[i])); };
  // k: the step (tries / last / done); id: the activity (state.items id_route); need: the counted positions; idx: the ones just checked;
  // g: [right, answer] per question; counts(i): false for a question that is saved but never scored (a 🔮 guess)
  function firsts(k, id, src, items, need, idx, g, counts) {
    idx = idx.filter(i => need.includes(i)); if (!idx.length) return;
    counts = counts || (() => true);
    const now = new Date().toISOString(), sc = need.filter(counts);
    lastTry(k, sc.filter(i => g[i] && g[i][0]).length, sc.length, sc.every(i => g[i] && g[i][1] != null && String(g[i][1]).trim() !== ''));
    state.items = state.items || {}; state.tries = state.tries || {};
    const key = id + '_' + level; let R = state.items[key];
    if (R && !R.per) return save();   // checked as a whole set before 16 Nov 2026: that first try stays
    if (!R) R = state.items[key] = { level, date: now, q: [], ok: [], a: [], per: 1 };
    const qi = i => Array.isArray(src) ? src.indexOf(items[i]) : i;
    idx.forEach(i => { const q = qi(i); if (q < 0 || R.q.includes(q)) return; R.q.push(q); R.ok.push(g[i][0] ? 1 : 0); R.a.push(g[i][1]); });
    const at = i => R.q.indexOf(qi(i)), full = need.every(i => at(i) >= 0), T = state.tries[k];
    if (!T || (T.per && (T.level === level || !T.full)))
      state.tries[k] = { score: sc.filter(i => at(i) >= 0 && R.ok[at(i)]).length, max: sc.length, level, date: T && T.per && T.level === level ? T.date : now, per: 1, full };
    save();
  }
  // done: every counted question answered and checked in this attempt, or each one checked once (its first check) on this route
  // LEFT: the questions still to answer or check, for result() just after (the message names them instead of "Answer every question")
  let LEFT = null;
  const doneNow = (id, k, items, prefix, need) => { const v = vals(items, prefix), C = chk(id), T = (state.tries || {})[k];
    LEFT = need.filter(i => !(C.has(i) && filledV(v[i])));
    return !LEFT.length || !!(T && T.per && T.full && T.level === level); };
  function oneCss() {
    if (document.getElementById('el-one-css')) return;
    const st = document.createElement('style'); st.id = 'el-one-css';
    st.textContent = '.el-onerow{display:flex;gap:8px;align-items:center}.el-onerow>input.typed{flex:1 1 auto;min-width:0}' +
      '.el-one{flex:0 0 auto;padding:6px 14px!important;font-size:.9em!important;min-height:0!important;white-space:nowrap}' +
      '.question>.el-one{display:inline-block;margin-top:8px}.el-nbink .el-one{display:none!important}.el-nbink .question.gx .el-one{display:inline-block!important}' +
      '.el-nbink .question.el-nbopen .el-one{display:inline-block!important}.el-nbfix{display:inline-block;margin-top:6px;padding:6px 14px!important;font-size:.9em!important;min-height:0!important}' +
      'html.el-lpnb .lp-panels .panel .question.el-nbopen{outline:2px dashed var(--nb-ink,#1f4fb5);outline-offset:6px;border-radius:6px}';
    document.head.appendChild(st);
  }
  const oneBtn = (prefix, i) => '<button class="btn secondary el-one" type="button" data-one="' + prefix + '" data-i="' + i + '" title="' + (ca() ? 'Comprova només aquesta pregunta' : 'Check only this question') + '">✓ ' + (ca() ? 'Comprova' : 'Check') + '</button>';
  const allLabel = () => ca() ? 'Comprova-ho tot' : 'Check all';
  /* ---------- answers and feedback stay (Roger, 26 Oct 2026) ---------- */
  // What a student typed or chose, with its feedback, is back when they return to the page (state.ans[id], synced like the rest),
  // until they press "Do it again" next to Check. A restore shows the feedback again without counting a try.
  // Answers not checked yet stay too (state.typing[id_route], saved as the student types or chooses), so leaving the page for a
  // presentation or a game loses nothing (problem report, 26 Oct 2026).
  /* Answers follow a level change (Roger, 3 Nov 2026: "si faig un canvi de nivell a mig LP l'alumne ha de guardar les activitats que hagi fet").
     Each route sees its own list of questions (cumulative r: tags, only:, a list per route), so answers saved by position landed on other
     questions after the teacher changed the level (a Base grammar step done 9 / 9 showed 6 / 17 with three "Not yet" at Core). state.ans[id]
     now keeps the route (l) and each question (q: its id or text); a restore at another route puts every answer back on the same question and
     leaves the route's new questions empty. done, doneAt and the first try never change, so the step stays done and keeps its mark.
     Answers saved before this (no q) are placed with the route of their check (last / tries .level); with no route known, they are only
     shown when the list has the same length. Answers not checked yet (state.typing[id_route]) are carried in the same way. */
  const qid = it => String(it && (it.id || it.q) || '');
  const atLevel = (L, fn) => { const was = level; level = L; try { return fn(); } finally { level = was; } };
  function checkLevel(id) {   // the route of the latest check of a step, for answers saved without one
    const L = state.last || {}, T = state.tries || {}, k = id === 'vocab' ? 'practice' : id, x = L[k] || T[k];
    if (x && x.level) return x.level;
    const rs = ROUTES.filter(r => L[id + '_' + r] || T[id + '_' + r]), d = r => ((L[id + '_' + r] || T[id + '_' + r]).date || '');
    return rs.sort((a, b) => d(b) > d(a) ? 1 : -1)[0] || null;
  }
  // moves v (answers in the order of the questions `from`) onto `items`; tr: tries keyed prefix + position. null when no question is shared.
  function moveTo(items, from, v, prefix, tr) {
    const used = {}, pos = items.map(it => { const j = from.findIndex((x, n) => x === qid(it) && !used[n]); if (j >= 0) used[j] = 1; return j; });
    if (!pos.some(j => j >= 0)) return null;
    const out = { v: pos.map(j => j < 0 ? null : v[j]), tries: {}, same: pos.every((j, i) => j === i) && from.length === items.length };
    Object.keys(tr || {}).forEach(k => { const m = k.slice(prefix.length).match(/^(\d+)(\D.*)?$/); if (!m || !k.startsWith(prefix)) return; const i = pos.indexOf(+m[1]); if (i >= 0) out.tries[prefix + i + (m[2] || '')] = tr[k]; });
    return out;
  }
  const qsAt = (L, src) => src ? atLevel(L, () => forLevel(src)).map(qid) : null;
  /* 🆕 The latest answer shows (Roger, 22 Nov 2026: "Es millor que els alumnes i jo tinguin les últimes versions a la llibreta i a la
     pàgina, així si ja ho han arreglat ho veuen bé"): a step opened again shows, question by question, the newest answer the student gave
     (a new ✓ Check on the page, ↺ Practise again, or ✏️ Correct it in the notebook), checked again with today's check, in the laptop look
     and in the notebook look; 📓 My notebook (el-exam.js) shows it too. The first try is kept as information only (Roger, 22 Nov 2026: first tries never count for the mark) (state.items,
     state.tries and state.nb[id].v never change) and is written small under a changed answer. state.ans[id] is the newest answers:
     .t[i] when question i's answer was checked, .ok[i] 1 / 0 as the page showed it (written back each time the step opens, so 📓 My
     notebook follows today's check). Answers saved before this have no t: one that differs from the first try counts from the step's
     last check (state.last), the first try from state.tries, and a ✏️ correction (state.nb[id].re) from its own time. */
  const tkOf = id => id === 'vocab' ? 'practice' : id;
  const firstAt = id => String(((state.tries || {})[tkOf(id)] || {}).date || '');
  function ansAt(id, A, j) {
    if (A.t && A.t[j]) return String(A.t[j]);
    const N = state.nb && state.nb[id], n = N && N !== A && Array.isArray(N.q) ? N.q.indexOf(A.q[j]) : -1;
    return n >= 0 && String(N.v[n]) === String(A.v[j]) ? firstAt(id) : String(((state.last || {})[tkOf(id)] || {}).date || firstAt(id));
  }
  // rec (state.ans[id], or the notebook's first try state.nb[id]) with each answered question's newest answer, and its tries
  function newest(id, rec, prefix) {
    if (!rec || !Array.isArray(rec.v) || !Array.isArray(rec.q) || !rec.q.length) return rec;
    const A = state.ans && state.ans[id], N = state.nb && state.nb[id], re = N && N.re && typeof N.re === 'object' ? N.re : {};
    const useA = !!A && A !== rec && Array.isArray(A.q) && Array.isArray(A.v) && !A.from;
    const out = Object.assign({}, rec, { v: rec.v.slice(), tries: Object.assign({}, rec.tries || {}) });
    rec.q.forEach((q, i) => {
      if (!filledV(rec.v[i])) return;   // a question not answered in this try (a new try after ↺ Practise again) stays empty
      let at = rec === A ? ansAt(id, A, i) : firstAt(id), best = null;
      const j = useA ? A.q.indexOf(q) : -1;
      if (j >= 0 && filledV(A.v[j])) { const t = ansAt(id, A, j); if (t > at) { at = t; best = { v: A.v[j], t: (A.tries || {})[prefix + j] }; } }
      const r = re[q]; if (r && filledV(r.v) && String(r.at || '') > at) best = { v: r.v, t: r.t };
      if (!best || String(best.v) === String(rec.v[i])) return;
      out.v[i] = best.v;
      Object.keys(out.tries).forEach(k => { if (new RegExp('^' + prefix + i + '(\\D|$)').test(k)) delete out.tries[k]; });
      if (best.t) out.tries[prefix + i] = best.t;
    });
    return out;
  }
  const okIn = f => !f ? null : f.classList.contains('ok') ? 1 : f.classList.contains('no') ? 0 : null;
  // question it's answer v goes into the newest answers (state.ans[id]): when it was checked (at) and whether it was right (ok)
  function setAns(id, it, v, ok, at) {
    const A = state.ans && state.ans[id]; if (!A || !Array.isArray(A.q) || !Array.isArray(A.v) || A.from) return false;
    const j = A.q.indexOf(qid(it)); if (j < 0) return false;
    if (state.nb && state.nb[id] === A) state.nb[id] = JSON.parse(JSON.stringify(A));   // the notebook's first try never changes with it
    let ch = false;
    if (String(A.v[j]) !== String(v)) { A.v[j] = v; A.t = A.t || []; A.t[j] = at || new Date().toISOString(); ch = true; }
    if (ok != null) { A.ok = A.ok || []; if (A.ok[j] !== ok) { A.ok[j] = ok; ch = true; } }
    if (Array.isArray(A.c) && !A.c.includes(j)) { A.c.push(j); A.c.sort((a, b) => a - b); ch = true; }
    return ch;
  }
  // a step opened again: what the page shows (the newest answers, checked with today's check) goes back into state.ans[id]
  function latestBack(id, prefix, items) {
    if (fresh[id] || !state.ans || !state.ans[id]) return;
    const v = vals(items, prefix), N = state.nb && state.nb[id], re = N && N.re && typeof N.re === 'object' ? N.re : {}; let ch = false;
    items.forEach((it, i) => { const ok = okIn($('#' + prefix + 'f' + i)); if (ok == null || !filledV(v[i])) return;
      const r = re[qid(it)]; if (setAns(id, it, v[i], ok, r && String(r.v) === String(v[i]) ? r.at : null)) ch = true; });
    try { if (NBS[id] && NBS[id].one && lastFromPage(id, prefix, NBS[id].one, v)) ch = true; } catch (e) {}   // NBS is set up further down
    if (ch) save();
  }
  /* 📊 The latest score on the teacher's dashboard (state.last: "First try 6/10 → latest 9/10"; Roger, 22 Nov 2026: "On the teacher's
     dashboard I want to see the first tries and last tries"): the counted questions as they stand now, after a ✏️ correction or today's
     check. Only when every answered counted question shows ✓ or ✗ (an empty one is not right) and they are the same questions as the saved
     score. The first try never changes. */
  function lastFromPage(id, prefix, one, v) {
    const tk = tkOf(id), L = (state.last || {})[tk] || (state.tries || {})[tk]; if (!L || !one || !one.length || one.length !== L.max) return false;
    const oks = one.map(i => { const o = okIn($('#' + prefix + 'f' + i)); return o == null && !filledV((v || [])[i]) ? 0 : o; }); if (oks.some(x => x == null)) return false;
    const sc = oks.filter(Boolean).length; if (sc === L.score) return false;
    lastTry(tk, sc, one.length); return true;
  }
  // c: the questions checked in this attempt (✓ Check one at a time, 16 Nov 2026). The notebook gets each question's answer at its first
  // check (nb.c); a notebook kept before (no c) or on another route stays as it is.
  function keep(id, prefix, v, items) {
    delete fresh[id]; if (state.again) delete state.again[id]; state.ans = state.ans || {}; const was = state.ans[id], now = new Date().toISOString();
    const tr = Object.fromEntries(Object.entries(tries).filter(([k]) => k.startsWith(prefix) && /^\d/.test(k.slice(prefix.length)))), one = !!(NBS[id] && NBS[id].one), C = [...chk(id)].sort((a, b) => a - b);
    state.ans[id] = { v, tries: tr, l: level, q: (items || []).map(qid) }; if (one) state.ans[id].c = C;
    // the newest answers: when each one was checked (an answer that didn't change keeps its time) and whether it was right (see newest)
    const A = state.ans[id], wq = was && Array.isArray(was.q) && Array.isArray(was.v) ? was.q : [];
    A.t = A.q.map((q, i) => { const j = wq.indexOf(q); return !filledV(v[i]) ? null : j >= 0 && String(was.v[j]) === String(v[i]) ? ansAt(id, was, j) : now; });
    A.ok = A.q.map((q, i) => okIn($('#' + prefix + 'f' + i)));
    if (state.typing) delete state.typing[id + '_' + level];
    state.nb = state.nb || {}; const nb = state.nb[id];
    const F = C.filter(i => filledV(v[i]));   // the notebook keeps answers only (an empty question checked with "Check all" is not in it)
    if (!nb || nbOff(id)) state.nb[id] = one ? { v: v.map((x, i) => F.includes(i) ? x : null), tries: tr, l: level, q: state.ans[id].q, c: F } : state.ans[id];
    else if (one && Array.isArray(nb.c) && nb.l === level && Array.isArray(nb.v)) F.forEach(i => { if (nb.c.includes(i)) return; nb.v[i] = v[i]; nb.c.push(i); Object.keys(tr).forEach(k => { if (new RegExp('^' + prefix + i + '(\\D|$)').test(k)) nb.tries[k] = tr[k]; }); });
    save();
  }
  // the answers to show on this route ({v, moved}), with their tries, or null
  // raw: the record as it is (the notebook's first try); otherwise each question's newest answer (newest)
  function kept(id, prefix, items, src, rec, raw) {
    const a0 = rec || (!fresh[id] && state.ans && state.ans[id]), a = raw ? a0 : newest(id, a0, prefix); if (!a || !Array.isArray(a.v)) return null;
    const L = a.l || checkLevel(id), from = a.q && a.q.length ? a.q : L ? qsAt(L, src) : null;
    const cOf = v => Array.isArray(a.c) ? v.map((x, i) => x ? i : -1).filter(i => i >= 0) : null;   // null: checked as a whole set (before 16 Nov 2026)
    if (!from) { if (a.v.length !== items.length) return null; Object.assign(tries, a.tries || {}); return { v: a.v, moved: false, c: cOf(a.v.map((_, i) => Array.isArray(a.c) && a.c.includes(i))) }; }
    const m = moveTo(items, from, a.v, prefix, a.tries); if (!m) return null;
    Object.assign(tries, m.tries);
    const mc = Array.isArray(a.c) ? moveTo(items, from, a.v.map((_, i) => a.c.includes(i)), prefix) : null;
    // the same questions in a new order (a step rebuilt in blocks, 13 Nov 2026) is no news for the student: no note
    const nu = m.v.some(x => x == null); return { v: m.v, moved: !m.same && (nu || L !== level), fresh: nu, added: L === level, c: mc ? cOf(mc.v) : null };
  }
  // answers typed but not checked yet: this route's, else the fullest from another route, moved onto this route's questions
  function typed(id, prefix, items, src) {
    const T = state.typing || {}, own = T[id + '_' + level]; if (own) return own;
    const n = v => (v || []).filter(x => x != null && x !== '').length;
    const r = ROUTES.filter(x => x !== level && n(T[id + '_' + x])).sort((a, b) => n(T[id + '_' + b]) - n(T[id + '_' + a]))[0];
    const m = r && src ? moveTo(items, qsAt(r, src), T[id + '_' + r], prefix) : null;
    return m && n(m.v) ? m.v : null;
  }
  // a note under the result when the answers come from another level; a step already done stays done
  // added: same level, so the activity itself changed (new questions added to it; Roger, 9 Nov 2026: -ed / -ing in 4 ESO LS2 LP3)
  function movedNote(id, fresh, added) {
    const el = $('#' + id + 'Result'); if (!el) return;
    const done = state.done[id === 'vocab' ? 'practice' : id];
    if (done) el.textContent = el.textContent.replace(/ · (You need \d+ to complete the step\.|Necessites \d+ per completar el pas\.|Answer every question to complete the step\.|Respon totes les preguntes per completar el pas\.|To complete the step, answer and check [^.]*\.|Per completar el pas, respon i comprova [^.]*\.)/, ca() ? ' · Pas completat ✓' : ' · Step complete ✓');
    if (done && !/✓/.test(el.textContent)) el.textContent += ca() ? ' · Pas completat ✓' : ' · Step complete ✓';
    const p = document.createElement('span'); p.className = 'moved-note'; p.style.cssText = 'display:block;margin-top:6px;font-weight:400';
    p.textContent = added ? (ca()
      ? '✨ He afegit preguntes noves a aquesta activitat. Les respostes que ja havies fet hi són' + (done ? ' i aquest pas continua fet ✓. Pots fer les noves per practicar.' : ': respon també les preguntes buides per completar el pas.')
      : '✨ I’ve added new questions to this activity. The answers you had already given are here' + (done ? ' and this step stays done ✓. You can do the new ones to practise.' : ': answer the empty questions too to complete the step.'))
      : ca()
      ? '🔁 Has canviat de nivell. Les respostes que ja havies fet hi són' + (done ? ' i aquest pas continua fet ✓.' + (fresh ? ' Les preguntes buides són noves del teu nivell: les pots fer per practicar.' : '') : '.' + (fresh ? ' Respon també les preguntes buides per completar el pas.' : ''))
      : '🔁 Your level has changed. The answers you had already given are here' + (done ? ' and this step stays done ✓.' + (fresh ? ' The empty questions are new at your level: you can do them to practise.' : '') : '.' + (fresh ? ' Answer the empty questions too to complete the step.' : ''));
    el.appendChild(p); el.classList.add('show');
  }
  /* ↺ Practise again (Roger, 6 Nov 2026: "if they don't finish and leave the page without checking, next time they come back they see the
     old results"): the boxes empty for a new try, but the last checked answers stay saved (state.ans) until the new try is checked. */
  const fresh = {};
  /* A class game took the student away in the middle of a new try (Roger, 16 Nov 2026: Víctor "was doing the activities when I started
     the game and he says his answers didn't save"): el-cloud.js gamePush notes this page in sessionStorage el_game_took before it opens
     the game. Back here, an activity with a checked try AND answers typed at this level after it (state.typing: an unchecked new try)
     opens as that new try again, with what they had typed, instead of the old checked answers (the 6 Nov rule "leave without checking
     = old results back" is for leaving on their own). el-cloud.js forgets the note when this page is left (not on its own reload). */
  const gameTook = (() => { try { const o = JSON.parse(sessionStorage.getItem('el_game_took') || 'null'); return !!o && o.p === location.pathname && Date.now() - o.at < 3 * 3600e3; } catch (e) { return false; } })();
  let gameBack = false;
  function retryBack(id) {
    // state.again[id]: ↺ Practise again was pressed and nothing of the new try is checked yet (forget sets it, keep clears it), so the
    // typing is a new try, not the unchecked rest of a first try checked one question at a time
    const v = gameTook && state.again && state.again[id] && state.ans && state.ans[id] && state.typing && state.typing[id + '_' + level];
    if (!Array.isArray(v) || !v.some(x => x != null && x !== '')) return;
    fresh[id] = true;
    // like ↺ Practise again in the notebook look: the new try is done in the laptop look (el-app.js draws the look after this script)
    if (!gameBack) { gameBack = true; const go = () => { if (window.elLpNb && !window.elNbOnly && document.documentElement.classList.contains('el-lpnb')) window.elLpNb(false); }; document.readyState === 'complete' ? setTimeout(go, 0) : addEventListener('load', go); }
  }
  function forget(id, prefix) { fresh[id] = true; CHK[id] = new Set(); state.again = state.again || {}; state.again[id] = 1; if (state.typing) ROUTES.forEach(r => delete state.typing[id + '_' + r]); Object.keys(tries).forEach(k => { if (k.startsWith(prefix)) delete tries[k]; }); save(); }
  /* One activity at a time (Roger, 4 Nov 2026: "they should be able to redo one activity of the section and still see all the answers of
     the other activities"): every checked activity of a section has its own "↺ Redo this activity" next to Check (the questions, the
     practice, the micro-dictation), which clears only that activity. There is no button that clears a whole section. */
  const againLabel = () => '↺ ' + (ca() ? 'Torna a practicar' : 'Practise again');
  const againBtn = id => '<button class="btn secondary" type="button" id="' + id + 'Again">' + againLabel() + '</button>';
  const vals = (items, prefix) => items.map((q, i) => { if (q.o) { const c = document.querySelector('input[name="' + prefix + i + '"]:checked'); return c ? +c.value : null; } const t = $('#' + prefix + i); return t ? t.value : null; });
  function fill(items, prefix, v) { items.forEach((q, i) => { if (q.o) { const c = document.querySelector('input[name="' + prefix + i + '"][value="' + v[i] + '"]'); if (c) c.checked = true; } else { const t = $('#' + prefix + i); if (t) t.value = v[i] || ''; } }); syncPicks(); }
  function clearStep(id, listId) { $$('#' + listId + ' input').forEach(x => { if (x.type === 'radio') x.checked = false; else x.value = ''; }); $$('#' + listId + ' .feedback').forEach(f => { f.textContent = ''; f.className = 'feedback'; }); const r = $('#' + id + 'Result'); if (r) { r.textContent = ''; r.classList.remove('show'); } $$('#' + listId + ' [data-pick]').forEach(b => { b.disabled = false; b.style.textDecoration = ''; }); syncPicks(); }
  // check(count, only): the step's own check (only: the questions to check and show; null = all); stays(id, prefix, listId, items, check)
  // wires Check, Do it again and the restore. src: the panel's whole list (p.items / p.practice), to place answers saved at another route.
  // one: the counted questions (positions) when every question has its own ✓ Check; without it (the recall warm-up) one Check for the set.
  function stays(id, prefix, listId, items, check, src, one) {
    $('#' + id + 'Check').onclick = () => { if (one) allIx(items).forEach(i => chk(id).add(i)); check(true, null); keep(id, prefix, vals(items, prefix), items); if (nbFrozen(id)) nbLock(id, listId, true); nbSaved(id, true); };
    if (one) {
      const go = i => {
        if (!(i >= 0 && i < items.length)) return;
        if (nbFrozen(id) && one.includes(i)) return nbRedo(id, i);   // ➕ extra practice stays open in the notebook look; a wrong answer opened with ✏️ is checked by nbRedo
        const v = vals(items, prefix);
        if (!filledV(v[i])) return check(false, [i]);   // "Type an answer": nothing is marked or saved
        chk(id).add(i);
        /* every counted question has an answer: the ones typed but not checked yet are checked too, so the step ends with its ✓ (Roger,
           22 Nov 2026: "It should have a tick saying done"; question 9 was typed but its ✓ Check never pressed, and the step said 9 / 10) */
        const now = [i].concat(one.every(j => filledV(v[j])) ? one.filter(j => j !== i && !chk(id).has(j)) : []);
        now.forEach(j => chk(id).add(j)); check(true, now); keep(id, prefix, vals(items, prefix), items); if (nbFrozen(id)) nbLock(id, listId, true); nbSaved(id, true);
      };
      const L = $('#' + listId);
      L.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button[data-one]'); if (b && b.dataset.one === prefix) go(+b.dataset.i); });
      L.addEventListener('keydown', e => { const t = e.target; if (e.key !== 'Enter' || !t.matches || !t.matches('input.typed') || t.id.indexOf(prefix) !== 0) return; const i = t.id.slice(prefix.length); if (!/^\d+$/.test(i)) return; e.preventDefault(); go(+i); });
    }
    // ↺ in the notebook look: the page goes back to the laptop look and the new try is done there (nbShow below)
    // ⛵ a student who sees only the notebook look (window.elNbOnly, el-app.js; Roger, 19 Nov 2026): the new try is a fresh notebook page
    // (state.nbAgain[id]: the page shows the latest try from now on, as the laptop look did); the first try still counts for the mark
    $('#' + id + 'Again').onclick = () => { const nbk = nbFrozen(id); if (nbk && window.elNbOnly) { state.nbAgain = state.nbAgain || {}; state.nbAgain[id] = 1; } forget(id, prefix); if (nbk && window.elLpNb && !window.elNbOnly) window.elLpNb(false); clearStep(id, listId); nbLock(id, listId, false); nbSaved(id, false); };
    $('#' + listId).oninput = $('#' + listId).onchange = () => { state.typing = state.typing || {}; state.typing[id + '_' + level] = vals(items, prefix); save(); };
    // an activity checked before the notebook kept anything (14 Nov 2026): its answers as they are now go into the notebook
    if (state.ans && state.ans[id] && !(state.nb && state.nb[id])) { state.nb = state.nb || {}; state.nb[id] = state.ans[id]; }
    NBS[id] = { id, prefix, listId, items, check, src, one };
    retryBack(id);
    if (nbFrozen(id)) return nbShow(NBS[id]);
    const k = kept(id, prefix, items, src), t = k ? null : typed(id, prefix, items, src); CHK[id] = new Set(k && k.c ? k.c : k ? allIx(items) : []);
    if (k) { fill(items, prefix, k.v); check(false, k.c); if (k.moved) movedNote(id, k.fresh, k.added); } else if (t) fill(items, prefix, t);
    nbSaved(id, !!k); if (k) latestBack(id, prefix, items);
  }
  /* 📓 The notebook keeps the first try (Roger, 14 Nov 2026: "If they want to do the activity again, they can see the button there but
     they are pulled up to the laptop version to do it there and the new results are only shown there, not in the notebook").
     state.nb[id]: the answers of the activity's first check (like state.ans). With the notebook look on (html.el-lpnb, el-app.js) a
     checked activity shows those answers with their corrections, written in pen: nothing can be changed (inert) and Check is hidden.
     ↺ Practise again stays: it takes the page back to the laptop look (window.elLpNb(false)) and clears the activity there; the new
     answers show in the laptop look (and, since 22 Nov 2026, in the notebook look too: newest). el-app.js calls window.elNbRefresh() when the look changes. Marks never change. */
  const NBS = {};
  // a notebook filled question by question (nb.c) is frozen only once every counted question is in it; until then the activity stays open
  /* a notebook record that holds none of this step's questions is not this step's first try (problem report, 4ESOA, 18 Nov 2026: "no em
     deixa donar-li a Comprova"): the one-step Grammar kept before the split (LP.split) froze the new Past Simple / used to step, so
     ✓ Check did nothing and nothing showed. Such a record never freezes the step, and the step's first real check replaces it. */
  const nbOff = id => { const nb = state.nb && state.nb[id], S = NBS[id];
    return !!(nb && Array.isArray(nb.q) && nb.q.length && S && Array.isArray(S.items) && !S.items.some(it => nb.q.includes(qid(it)))); };
  const nbFrozen = id => { const nb = state.nb && state.nb[id], S = NBS[id];
    return document.documentElement.classList.contains('el-lpnb') && !fresh[id] && !(state.nbAgain && state.nbAgain[id]) && !!(nb && Array.isArray(nb.v)) && !nbOff(id) && (!Array.isArray(nb.c) || !S || !S.one || S.one.every(i => nb.c.includes(i))); };
  /* ➕ Extra practice stays open (problem report, 4ESOB, 17 Nov 2026: "no puc fer les opcionals"): a frozen notebook freezes only the
     counted questions, so the optional extras below them can still be typed and checked one by one. Marks never change (firsts: need only). */
  function nbLock(id, listId, on) {
    // one Check per question: each counted question is locked on its own (not the whole list), so ➕ extras and ✏️ Correct it stay usable
    const l = $('#' + listId), S = NBS[id], per = !!(on && l && S && S.one);
    if (l) { l.inert = on && !per; l.classList.toggle('el-nbink', on); l.querySelectorAll(':scope>.question').forEach(q => { q.inert = per && !q.classList.contains('gx'); }); }
    const c = $('#' + id + 'Check'); if (c) c.style.display = on ? 'none' : '';
    nbFix(id, per);
  }
  function nbShow(S) {
    const { id, prefix, listId, items, check, src } = S, on = nbFrozen(id);
    if (!$('#' + listId)) return;
    Object.keys(tries).forEach(k => { if (k.startsWith(prefix)) delete tries[k]; });
    clearStep(id, listId);
    // k0: the first try (written small under an answer that changed), k: the newest answers, shown and checked again
    const T0 = Object.assign({}, tries), k0 = on ? kept(id, prefix, items, src, state.nb[id], true) : null;
    Object.keys(tries).forEach(x => { delete tries[x]; }); Object.assign(tries, T0);
    const k = kept(id, prefix, items, src, on ? state.nb[id] : null), t = k || on ? null : typed(id, prefix, items, src); CHK[id] = new Set(k && k.c ? k.c : k ? allIx(items) : []);
    nbMerge(S, on && k0, on && k);
    if (k) { fill(items, prefix, k.v); check(false, k.c); } else if (t) fill(items, prefix, t);
    nbLock(id, listId, on && !!k); nbSaved(id, !!k); if (k) latestBack(id, prefix, items);
  }
  /* ✏️ Correct a wrong answer in the notebook, one question at a time (Roger, 19 Nov 2026: "I want them to be able to redo the questions
     one by one"). In the frozen notebook look every counted question answered wrong has its own "✏️ Correct it": it opens only that
     question, the student answers it again and presses its ✓ Check, as often as they need (a typed answer shows after the second wrong
     try, as in the laptop look). The correction stays in the notebook (state.nb[id].re, by question id: {v, t: tries, ok, at}). The first
     try (state.items, state.tries, state.nb[id]) is only the dashboard's statistic, never shown to students and never the mark. Since 22 Nov
     2026 the correction is also the newest answer (state.ans, setAns), so the laptop look and 📓 My notebook show it too (see newest). */
  // k0: the frozen notebook's first try (kept raw), k: its newest answers (🆕 22 Nov 2026: a correction on the page or with ✏️ Correct it)
  function nbMerge(S, k0, k) {
    S.open = new Set(); S.first = k0 ? k0.v.slice() : null; S.cur = k0 && k ? k.v.slice() : null;
  }
  // on: the notebook look is frozen; draws ✏️ Correct it under each wrong answer. Students see only their newest answer: the first try is
  // never shown to them (Roger, 22 Nov 2026: "No need to say your first, students must be their last version"; "First tries will be a
  // statistic for me"): it stays in state.items / state.tries / state.nb for the dashboard only
  function nbFix(id, on) {
    const S = NBS[id], l = S && $('#' + S.listId); if (!l) return;
    l.querySelectorAll('.el-nbfix,.el-nbwas').forEach(x => x.remove());
    l.querySelectorAll(':scope>.question').forEach(q => { q.classList.remove('el-nbopen'); [...q.children].forEach(c => { c.inert = false; }); });
    const r = $('#' + id + 'Result'), m = r && r.querySelector('.el-nbmark'); if (m) m.remove();
    if (!on || !S.one) return;
    if (!S.open) S.open = new Set();
    if (!S.first) S.first = vals(S.items, S.prefix);   // frozen just now, with the last ✓ Check: what is on the page is the first try
    S.one.forEach(i => {
      const f = $('#' + S.prefix + 'f' + i), q = f && f.closest('.question'), it = S.items[i]; if (!q || !filledV((S.cur || S.first)[i])) return;
      const open = S.open.has(i), wrong = f.classList.contains('no');
      if (!wrong && !open) { if (!q.inert) [...q.children].forEach(c => { c.inert = true; }); return; }   // right (corrected too): it stays in pen
      q.inert = false;
      if (open) q.classList.add('el-nbopen'); else [...q.children].forEach(c => { c.inert = true; });
      const at = f;
      if (wrong && !open) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn secondary el-nbfix';
        b.textContent = '✏️ ' + (ca() ? 'Corregeix-la' : 'Correct it');
        b.title = ca() ? 'Torna a fer només aquesta pregunta.' : 'Do only this question again.';
        b.onclick = () => nbOpen(id, i);
        at.after(b);
      }
    });
  }
  // ✏️ Correct it: only that question opens, empty, with its own ✓ Check
  function nbOpen(id, i) {
    const S = NBS[id]; if (!S || !nbFrozen(id)) return;
    if (!S.open) S.open = new Set(); S.open.add(i);
    const it = S.items[i], f = $('#' + S.prefix + 'f' + i), box = $('#' + S.prefix + i);
    if (it.o) $$('input[name="' + S.prefix + i + '"]').forEach(x => { x.checked = false; }); else if (box) box.value = '';
    syncPicks();
    if (f) { f.textContent = ''; f.className = 'feedback'; }
    nbFix(id, true);
    const t = it.o ? $('input[name="' + S.prefix + i + '"]') : box;
    if (t) { try { t.focus({ preventScroll: true }); } catch (e) {} }
  }
  // its ✓ Check (or Enter): shows the correction, saves it in the notebook; nothing counts for the mark
  function nbRedo(id, i) {
    const S = NBS[id]; if (!S || !S.open || !S.open.has(i)) return;
    const v = vals(S.items, S.prefix)[i], f = $('#' + S.prefix + 'f' + i), key = S.prefix + i;
    S.check(false, [i]);
    if (!filledV(v)) return nbFix(id, true);   // "Type an answer": nothing is saved
    const ok = !!(f && f.classList.contains('ok'));
    if (!ok) { tries[key] = (tries[key] || 0) + 1; S.check(false, [i]); }
    const nb = state.nb[id]; nb.re = nb.re || {};
    const at = new Date().toISOString(); nb.re[qid(S.items[i])] = { v, t: tries[key] || 0, ok: ok ? 1 : 0, at };
    setAns(id, S.items[i], v, ok ? 1 : 0, at); if (!S.cur) S.cur = S.first.slice(); S.cur[i] = v;   // the newest answer, on the page too
    if (ok) S.open.delete(i);
    lastFromPage(id, S.prefix, S.one, vals(S.items, S.prefix));   // 📊 the dashboard's latest score follows the correction
    save(); nbFix(id, true);
  }
  /* "📓 Saved in your notebook ✓" under a checked activity (Roger, 14 Nov 2026: "so somehow they have the feeling that they are writing
     in their own notebook"): the first try is in 📓 My notebook (el-exam.js), and the link opens it at this step (el-cloud.js el_nb_at) */
  function nbSaved(id, on) {
    const r = $('#' + id + 'Result'), c = $('#' + id + 'Check'), at = r || (c && c.parentNode); if (!at) return;
    let a = document.getElementById(id + 'NbSaved');
    if (!a) { if (!on) return; a = document.createElement('a'); a.id = id + 'NbSaved'; a.className = 'el-nbsaved'; a.href = 'index.html#notes'; at.after(a); }
    a.textContent = ca() ? '📓 Desat a la teva llibreta ✓' : '📓 Saved in your notebook ✓';
    a.title = ca() ? 'Obre la teva llibreta en aquest pas' : 'Open your notebook at this step';
    a.hidden = !on;
  }
  window.elNbRefresh = () => { Object.values(NBS).forEach(S => { try { nbShow(S); } catch (e) {} }); };

  /* ---------- redo one activity (Roger, 2 Nov 2026: "I don't want them restart the whole learning path"; 4 Nov 2026: "I only want
     redo this activity, not the entire page") ---------- */
  // No section-wide button any more: each activity clears only itself with its own "↺ Redo this activity" (againBtn). Marks are never
  // touched: done/doneAt (done on time), tries/first/items (first try only) and hand-ins stay; new checks only update last[k].

  /* ---------- panels ---------- */
  const R = {};
  let WC = null;   // the word cards of the Vocabulary step (el-wordcards.js)
  // a checkpoint with `secure` (answers not in the page, one try, feedback when the teacher releases it): shared/js/el-checkpoint.js
  R.recall = p => p.secure && window.ELCheckpoint ? ELCheckpoint.panel(p, { LP, level: () => level, ca, get state() { return state; }, save, complete, forLevel }) : ({
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
      }, p.items);
    }
  });

  R.vocab = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'Explora' : 'Explore') + '</h3><div class="vocab-groups" id="vocabGroups"></div>' +
      (p.receptive ? '<p class="tiny">' + (ca() ? 'Paraules que sentiràs o llegiràs (no cal aprendre-les): ' : 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '') + '</div>' +
      // How it works for the structures in these words (Roger, 13 Nov 2026: "Also vocab structures like prepositions"): the same visual boxes as Grammar,
      // titled 💬 Expressions, not grammar (Roger, 16 Nov 2026: "can we label them as Expressions, since they are expressions"): play / go / do,
      // on / at / in + time, verb + preposition are words that go together, learnt as one block. The class games put them in the 🧩 grammar game.
      // Since 16 Nov 2026 they are their own step, 💬 Expressions (vocabEx, a typed panel after Vocabulary), so no Vocabulary panel has explain now.
      (p.explain ? '<div class="section-card worked vocab-expr"><h3>💬 Expressions</h3><p class="instruction">' + (ca() ? 'Paraules que van juntes: aprèn-les en bloc.' : 'Words that go together: learn them as one block.') + '</p>' + forLevel(p.explain).map(e => '<div class="model">' + tx(e) + '</div>').join('') + '</div>' : '') +
      '<div class="section-card"><h3>' + (ca() ? 'Targetes' : 'Study cards') + '</h3>' +
      '<div class="actions dir-toggle" role="group" aria-label="' + (ca() ? 'Direcció de les targetes' : 'Card direction') + '"><button class="btn secondary" type="button" data-dir="en">English → Català</button><button class="btn secondary" type="button" data-dir="ca">Català → English</button></div>' +
      '<div id="wordCards"></div></div>' +
      (p.practice ? '<div class="section-card"><h3>' + (p.practiceMode === 'listen' ? (ca() ? 'Escolta i completa' : 'Listen and complete') : (ca() ? 'Completa les frases' : 'Complete the sentences')) + '</h3>' + (p.practiceMode ? '<p class="instruction">' + modeHow(p.practiceMode) + '</p>' : '') + '<div id="vocabPractice"></div><div class="actions"><button class="btn" type="button" id="vocabCheck">' + allLabel() + '</button>' + againBtn('vocab') + '</div><div class="result" id="vocabResult"></div></div>' : ''),
    bind() {
      const groups = forLevel(p.groups);
      /* Review words (Roger, 8 Nov 2026: "no flashcards that don't appear on the list"): the English → Català deck adds p.review
         (words from earlier Learning Paths), so Explora shows them too, in one "Review" box per earlier path, after this path's words. */
      const revGroups = []; forLevel(p.review || []).forEach(g => { const o = revGroups.find(x => x.g === g.g); if (o) o.items = o.items.concat(g.items); else revGroups.push({ g: g.g, items: g.items.slice() }); });
      const chipsHtml = items => '<div class="chips">' + items.map(x => '<span class="chip" tabindex="0">' + x[0] + '<span class="chip-tooltip"><b>' + x[1] + '</b>' + x[2] + '</span></span>').join('') + '</div>';
      $('#vocabGroups').innerHTML = groups.map(g => '<article class="vocab-group"><h3>' + g.g + '</h3>' + chipsHtml(g.items) + '</article>').join('') +
        revGroups.map(g => '<article class="vocab-group vocab-review" style="border-style:dashed"><h3>🔁 ' + (ca() ? 'Repàs · ' : 'Review · ') + g.g + '</h3>' + chipsHtml(g.items) + '</article>').join('');
      /* Catalan → English (research audit, Roger 26 Oct 2026): the card shows the Catalan and the student says the English, then turns it.
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
      const showDir = () => $$('.dir-toggle [data-dir]').forEach(b => { const on = b.dataset.dir === dir(); b.classList.toggle('secondary', !on); b.setAttribute('aria-pressed', on); });
      /* 🃏 The cards (Roger, 20 Nov 2026: "simplify the vocabulary cards, no writing the prediction, simple like this and full screen,
         like Practise"): shared/js/el-wordcards.js, the same cards as 🎯 Practise. Look, say it, turn over, ✓ Ho sabia / ↺ Encara no;
         no typing; full screen on the first turn. The step is done when the student knows 10 cards (all of them if there are fewer),
         as with the old set of 10. */
      const known = new Set(), goal = () => Math.min(10, deck().length);
      if (WC) WC.gone();
      WC = ELWordCards.mount($('#wordCards'), {
        cards: () => deck().map(x => { const en = dir() === 'ca' ? x[1] : x[0]; return { front: x[0], back: x[1], en, ex: x[3], src: x[2] }; }),
        ca,
        how: () => dir() === 'ca' ? (ca() ? 'Llegeix la paraula en català, digues-la en anglès en veu alta i després gira la targeta.' : 'Read the Catalan, say the English out loud, then turn the card over.')
          : (ca() ? 'Mira la paraula, digues-la en veu alta i pensa què vol dir. Després gira la targeta.' : 'Look at the word, say it out loud and think what it means. Then turn the card over.'),
        note: () => state.done.cards ? (ca() ? '✓ Pas fet. Pots continuar practicant tant com vulguis.' : '✓ Step done. Keep practising as much as you like.')
          : (ca() ? 'El pas queda fet quan sàpigues ' + goal() + ' targetes (' + known.size + '/' + goal() + ').' : 'The step is done when you know ' + goal() + ' cards (' + known.size + '/' + goal() + ').'),
        onKnow: w => { known.add(w.front); if (!state.done.cards && known.size >= goal()) complete('cards'); }
      });
      showDir();
      $$('.dir-toggle [data-dir]').forEach(b => b.onclick = () => { state.cardDir = b.dataset.dir; save(); known.clear(); showDir(); WC.render(); });
      if (p.practice) {
        const items = forLevel(p.practice);
        $('#vocabPractice').innerHTML = typedHtml(items, 'vp', p.practiceMode, null, true); bindModes(items, 'vp', p.practiceMode);
        const all = allIx(items);
        stays('vocab', 'vp', 'vocabPractice', items, (count, only) => { checkTyped(items, 'vp', false, count, only); if (count) firsts('practice', 'vocab', p.practice, items, all, marked(items, 'vp', only), got); const C = chk('vocab'), s = all.filter(i => C.has(i) && got[i][0]).length, ok = doneNow('vocab', 'practice', items, 'vp', all); result($('#vocabResult'), s, items.length, ok); if (ok) { if (count) complete('practice'); else doneFrom('practice', 'practice'); }; }, p.practice, all);
      }
    }
  });

  function mediaHtml(p) {
    const m = p.media || {};
    let h = '';
    if (m.text) h += '<div class="reading">' + byLevel(m.text) + '</div>'; // a string, or one text per route
    if (m.pages) h += '<div class="el-book" id="' + p.id + 'Book"></div>';   // 📖 the book's page pictures, one list per route (shared/js/el-book.js)
    if (m.youtube) h += '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + m.youtube + '" title="' + esc(m.title || 'Video') + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>' +
      '<div class="actions"><a class="btn secondary" href="https://www.youtube.com/watch?v=' + m.youtube + '" target="_blank" rel="noopener">Open on YouTube ↗</a></div>' + (m.credit ? '<p class="tiny">' + m.credit + '</p>' : '');
    // Local videos (normal + "-slow" copy, WebVTT subtitles, poster), e.g. the listening chart: media.videos = [{ base: 'video/name', title }]
    if (m.videos) h += m.videos.map((v, i) => '<div class="video-card" style="margin:14px 0"><strong>' + esc(v.title) + '</strong>' +
      '<div class="actions" role="group" aria-label="Video speed"><button class="btn secondary" type="button" data-vs="' + p.id + i + '" data-slow="0">' + (ca() ? 'Velocitat normal' : 'Normal speed') + '</button><button class="btn secondary" type="button" data-vs="' + p.id + i + '" data-slow="1">' + (ca() ? 'Versió més lenta' : 'Slower version') + '</button></div>' +
      '<video id="' + p.id + 'Video' + i + '" data-base="' + v.base + (starter() ? '-slow' : '') + '" controls preload="metadata" playsinline style="width:100%;border-radius:14px;margin:8px 0;background:#000" poster="' + v.base + '-poster.jpg"><source src="' + v.base + (starter() ? '-slow' : '') + '.mp4" type="video/mp4"><track kind="subtitles" srclang="en" label="English" src="' + v.base + (starter() ? '-slow' : '') + '.vtt"' + (starter() ? ' default' : '') + '></video></div>').join('') +
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
      mark(starter());
    });
    // Starter: the listening starts on the slower copy when it exists (the button goes back to normal speed)
    if (m.audio && starter()) {
      const slow = m.audio.replace(/\.mp3$/, '-slow.mp3'), a = $('#' + p.id + 'Audio'), b = $('#' + p.id + 'Slow');
      fetch(slow, { method: 'HEAD' }).then(r => { if (!r.ok) return; a.src = slow; $('#' + p.id + 'Speed').hidden = false; if (b) b.textContent = 'Velocitat normal'; }).catch(() => {});
      if (b && !m.script) b.onclick = () => { const toSlow = !a.src.endsWith('-slow.mp3'); a.src = toSlow ? slow : m.audio; b.textContent = toSlow ? 'Velocitat normal' : 'Versió més lenta'; };
    }
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
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'DCheck">' + (ca() ? 'Comprova' : 'Check') + '</button>' + againBtn(p.id + 'D') + '</div></div>';
  }
  function bindDict(p) {
    if (!p.chunks || !p.chunks.length) return;
    const say = (t, rate) => { if (playRec(t, rate)) return; if (recAudio) { recAudio.pause(); recAudio = null; } const s = window.speechSynthesis; if (!s) return; if (s.speaking || s.pending) s.cancel(); const u = new SpeechSynthesisUtterance(t), v = s.getVoices().find(x => /^en(-|_)GB/i.test(x.lang)) || s.getVoices().find(x => /^en(-|_)/i.test(x.lang)); u.lang = 'en-GB'; if (v) u.voice = v; u.rate = rate; s.speak(u); };
    state.dict = state.dict || {}; const kept = state.dict[p.id] || [];
    // typed but not checked yet stays too (state.dictT[panel]; Roger, 6 Nov 2026: "they must see them with their responses")
    state.dictT = state.dictT || {}; const typedD = kept.some(v => v) ? [] : state.dictT[p.id] || [];   // Practise again keeps state.dict until the new check
    p.chunks.forEach((c, i) => {
      $('[data-say="' + p.id + i + '"]').onclick = () => say(c, 0.9);
      $('[data-say-slow="' + p.id + i + '"]').onclick = () => say(c, 0.6);
      const box = $('#' + p.id + 'D' + i); box.value = kept[i] || typedD[i] || '';
      box.oninput = () => { state.dictT[p.id] = p.chunks.map((x, j) => $('#' + p.id + 'D' + j).value); save(); };
    });
    // Checked answers come back with their feedback (Roger, 2 Nov 2026: students always see a path they did with its corrections).
    const show = () => p.chunks.map((c, i) => {
        const v = $('#' + p.id + 'D' + i).value, ok = norm(v) === norm(c), f = $('#' + p.id + 'Df' + i);
        f.className = 'feedback ' + (ok ? 'ok' : 'no');
        f.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!') : (ca() ? 'Era: ' : 'It was: ') + '<strong>' + esc(c) + '</strong>' + (ca() ? '. Compara-ho paraula per paraula.' : '. Compare it word by word.');
        return v;
      });
    $('#' + p.id + 'DCheck').onclick = () => { state.dict[p.id] = show(); delete state.dictT[p.id]; save(); };
    $('#' + p.id + 'DAgain').onclick = () => {   // only the dictation: the questions and the prediction above stay
      delete state.dictT[p.id]; save();
      p.chunks.forEach((c, i) => { $('#' + p.id + 'D' + i).value = ''; const f = $('#' + p.id + 'Df' + i); f.textContent = ''; f.className = 'feedback'; });
    };
    if (kept.some(v => v)) show();
  }
  R.mc = p => p.book ? bookPanel(p) : ({
    html: '<div class="section-card">' + guessBackHtml(p) + predictHtml(p) + mediaHtml(p) + gistHtml(p) + '<form id="' + p.id + 'Form"></form><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + allLabel() + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>' + dictHtml(p),
    bind() {
      bindAudio(p); bindCycle(p); bindDict(p); oneCss();
      const items = forLevel(p.items), f = $('#' + p.id + 'Form'), scored = items.filter(q => !q.guess).length, all = allIx(items);
      f.innerHTML = items.map((q, i) => '<div class="question' + (q.guess ? ' guess-q' : '') + '"><p class="q-title">' + (i + 1) + '. ' + (q.guess ? '🔮 ' : '') + q.q + (q.qca && ca() ? ' <span class="q-ca">[' + q.qca + ']</span>' : '') + '</p><div class="options">' +
        learningSupport.shuffledIndexes(q.o.length).map(j => '<label class="option"><input type="radio" name="' + p.id + i + '" value="' + j + '"><span>' + q.o[j] + '</span></label>').join('') +
        '</div>' + oneBtn(p.id, i) + '<div class="feedback" id="' + p.id + 'f' + i + '"></div></div>').join('');
      stays(p.id, p.id, p.id + 'Form', items, (count, only) => {
        let score = 0; const g = [];
        items.forEach((q, i) => {
          const c = document.querySelector('input[name="' + p.id + i + '"]:checked'), ok = !!c && +c.value === 0, fb = $('#' + p.id + 'f' + i);
          g.push([ok, c ? +c.value : null]);
          if (only && !only.includes(i)) return;
          if (q.guess) { fb.textContent = c ? guessSaved(p) : (ca() ? 'Tria una resposta.' : 'Choose an answer.'); fb.className = 'feedback ' + (c ? 'ok' : 'no'); return; }
          if (ok) score++;
          fb.textContent = q.ex && c ? (ok ? (ca() ? 'Correcte! ' : 'Correct! ') : (ca() ? 'Encara no. ' : 'Not yet. ')) + tx(q.ex)
            : learningSupport.evidence(level, ok, c, q.o[0], ca() ? q.h : sup() ? q.he : null, !!(p.media && (p.media.audio || p.media.youtube)));
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
        });
        if (count) firsts(p.id, p.id, p.items, items, all, marked(items, p.id, only), g, i => !items[i].guess);
        const C = chk(p.id); score = all.filter(i => !items[i].guess && C.has(i) && g[i][0]).length;
        const ok = doneNow(p.id, p.id, items, p.id, all);
        result($('#' + p.id + 'Result'), score, scored, ok);
        if (ok) { if (count) complete(p.id); else doneFrom(p.id, p.id); };
        guessBack(p); LP.panels.filter(x => x.prev === p.id).forEach(guessBack);
      }, p.items, all);
      guessBack(p);
    }
  });
  /* 📖 Book chapters (Roger, 12 Nov 2026: "a Book LP with a section per chapter"; book.html, data/book.js from tools/reading-story/lp.py).
     An mc item with guess: true ("What happens next? Guess!") is saved like any answer but never marked or scored: the step's score is
     the other questions. The next chapter (p.prev = the chapter before) opens with the student's guess and, once it is checked, says
     whether the guess was right (the right option is the first, as in every mc item). */
  /* Answered in the book (Roger, 12 Nov 2026: "can we make them do the activity in full screen (the book) and that they press the options
     there? and then they get the feedback? they can only do it once and when they finish, they can go to the other chapter or leave the
     LP"). The questions are the chapter's last page (ELBook opts.end): the student taps an option on the page and presses Check, which works
     only when both are answered and counts once: the feedback stays on the page (the right option green, a wrong one red) and nothing can
     be changed or done again (no ↺). Then "Chapter n ▶" goes on with the next chapter (still full screen if the book was), and "Leave the
     Book" goes back to the LS page. */
  /* One book, one step (Roger, 13 Nov 2026: "some students will have different paces when reading the book so I need you to make only one
     SLP for the book so that people can continue where they left off"; "when they have finished, to continue reading as many chapters as
     wanted"): LP.book = {tab, title, intro} makes the page ONE tab, "book", with one book on it. The chapters stay the steps (LP.panels,
     state.done.ch1 …), but they are not tabs: the book opens where the student left it (state.bookAt = {c: chapter, i: page}, saved with
     their work), a chapter opens once the one before it is answered, and the row of chapters above the book takes them back to any
     chapter they have read. */
  const ONE = { book: null, c: null };
  const reachable = c => !c.prev || !!state.done[c.prev];
  function oneStart() {
    const at = state.bookAt || {}, s = LP.panels.find(c => c.id === at.c && reachable(c));
    return s ? { c: s, i: at.i | 0 } : { c: LP.panels.find(c => !state.done[c.id]) || LP.panels[LP.panels.length - 1], i: 0 };
  }
  // the chapter c on the book, at page i; full: keep the full screen the book is in
  function oneShow(c, i, full) {
    const el = $('#bookBook'); if (!el || !window.ELBook) return;
    if (ONE.book) ONE.book.destroy(true);
    ONE.c = c;
    const pg = x => x && x.media && x.media.pages ? byLevel(x.media.pages) : [], pages = pg(c), n = LP.panels.indexOf(c) + 1;
    const nx = LP.panels.find(x => x.prev === c.id), pv = LP.panels.find(x => x.id === c.prev);
    // the paper turns on into the next chapter once this one is answered, and back into the one before (Roger, 13 Nov 2026: "they should
    // be able to drag on to the next chapter")
    ONE.book = ELBook.mount(el, pages, { ca: ca(), title: tx(c.title), end: $('#' + c.id + 'QPage'), atEnd: c._after, start: i,
      pre: (ca() ? 'Capítol ' : 'Chapter ') + n + ' · ',
      after: nx ? pg(nx) : null, before: pv ? pg(pv).concat([$('#' + pv.id + 'QPage')]) : null, canNext: () => !!state.done[c.id],
      nextLabel: nx ? tx(nx.tab) : '', more: d => { const full = !!ONE.book && ONE.book.isFull(), to = d > 0 ? nx : pv; if (to) oneShow(to, d > 0 ? 0 : 'end', full); },
      onTurn: k => { const o = state.bookAt || {}; if (o.c !== c.id || o.i !== k) { state.bookAt = { c: c.id, i: k }; save(); } } });
    if (full && ONE.book) ONE.book.open();
    oneChs();
  }
  function oneChs() {
    const el = $('#bookChs'); if (!el) return;
    el.innerHTML = '<span class="elb-chl">' + (ca() ? 'Capítols' : 'Chapters') + '</span>' + LP.panels.filter(reachable).map(c => { const n = LP.panels.indexOf(c) + 1, d = !!state.done[c.id];
      return '<button type="button" class="elb-ch' + (c === ONE.c ? ' on' : '') + (d ? ' done' : '') + '" data-ch="' + c.id + '" title="' + esc(tx(c.title)) + '">' + (d ? '✓ ' : '') + n + '</button>'; }).join('');
    el.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { const c = LP.panels.find(x => x.id === b.dataset.ch); if (c && c !== ONE.c) oneShow(c, 0, false); });
  }
  R.onebook = () => ({
    html: '<style>.elb-chs{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}.elb-chl{font-weight:800;color:var(--muted,#66766f);margin-right:4px;font-size:.9rem}'
      + '.elb-ch{min-width:44px;min-height:38px;border:1px solid var(--line,#d8e6df);background:#fff;color:var(--dark,#174d3d);border-radius:999px;padding:6px 12px;font:inherit;font-weight:800;cursor:pointer}'
      + '.elb-ch.done{background:#ecfdf3;border-color:#86c9a0;color:#17703f}.elb-ch.on{background:var(--accent,#1f6b52);border-color:transparent;color:#fff}</style>'
      + '<div class="section-card"><div class="elb-chs" id="bookChs"></div><div class="el-book" id="bookBook"></div>'
      + '<div id="bookStash" hidden>' + LP.panels.map(c => { const r = bookPanel(c); c._r = r; return r.html; }).join('') + '</div></div>',
    bind() {
      LP.panels.forEach(c => c._r.bind());
      const s = oneStart(); oneShow(s.c, s.i, false);
    }
  });
  function bookPanel(p) {
    const T2 = (a, b) => ca() ? a : b, id = p.id;
    const page = '<div class="elb-q" id="' + id + 'QPage"><div class="elbq-top">' + esc(tx(p.title)) + '</div>' + guessBackHtml(p) +
      '<h3 class="elbq-k">Think about it</h3><p class="elbq-how" id="' + id + 'How">' + T2('Toca una resposta a cada pregunta i prem Comprova. Només ho pots fer una vegada!', 'Tap one answer for each question and press Check. You can only do it once!') + '</p>' +
      '<form id="' + id + 'Form"></form><div class="actions"><button class="btn" type="button" id="' + id + 'Check">' + T2('Comprova', 'Check') + '</button>' + againBtn(id) + '</div>' +
      '<div class="result" id="' + id + 'Result"></div><div class="elbq-after" id="' + id + 'After" hidden></div></div>';
    const lab = q => q.guess ? '2 · What happens next? Guess!' + T2(' · Què passarà? Endevina-ho!', '') : '1 · Did you understand?' + T2(' · Ho has entès?', '');
    function lock() {
      const pg = $('#' + id + 'QPage'); pg.classList.add('locked');
      $$('#' + id + 'Form input').forEach(x => { x.disabled = true; });
      $('#' + id + 'Check').hidden = true; $('#' + id + 'How').hidden = true;
      after(); oneChs(); if (ONE.c === p && ONE.book) ONE.book.refresh();
    }
    function after() {
      const el = $('#' + id + 'After'); if (!el || !$('#' + id + 'QPage').classList.contains('locked')) return;
      const nx = LP.panels.find(x => x.prev === id);
      const h = (!nx ? '<p class="elbq-end">🎉 ' + T2('Has acabat el llibre! En parlarem a classe.', 'You’ve finished the book! We’ll talk about it in class.') + '</p>'
        : '<p class="elbq-end">' + T2('Vols continuar llegint? Pots passar al ' + esc(tx(nx.tab)).toLowerCase() + ' ara mateix.', 'Want to keep reading? You can go on to ' + esc(tx(nx.tab)) + ' now.') + '</p>') +
        '<div class="actions">' + (nx ? '<button class="btn" type="button" data-go="next">' + esc(tx(nx.tab)) + ' ▶</button>' : '') +
        '<a class="btn secondary" href="index.html">' + T2('Surt del llibre', 'Leave the Book') + '</a></div>';
      if (el.innerHTML !== h) el.innerHTML = h;
      el.hidden = false;
      const b = el.querySelector('[data-go]');
      if (b) b.onclick = () => {
        const full = !!ONE.book && ONE.book.isFull();
        oneShow(nx, 0, full);   // the browser stays in full screen for the next chapter
        if (!full) { const n = $('#bookBook'); if (n) n.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      };
    }
    p._after = after;
    return {
      html: page,
      bind() {
        const items = forLevel(p.items), scored = items.filter(q => !q.guess).length;
        $('#' + id + 'Form').innerHTML = items.map((q, i) => '<div class="question' + (q.guess ? ' guess-q' : '') + '"><p class="elbq-lab">' + lab(q) + '</p><p class="q-title">' + q.q + '</p>' +
          (q.qca && ca() ? '<p class="elbq-ca">' + q.qca + '</p>' : '') + '<div class="options">' +
          learningSupport.shuffledIndexes(q.o.length).map((j, n) => '<label class="option"><input type="radio" name="' + id + i + '" value="' + j + '"><b class="elbq-l">' + 'ABCD'[n] + '</b><span>' + q.o[j] + '</span></label>').join('') +
          '</div><div class="feedback" id="' + id + 'f' + i + '"></div></div>').join('');
        $('#' + id + 'Again').hidden = true; $('#' + id + 'Again').style.display = 'none';
        stays(id, id, id + 'Form', items, count => {
          let score = 0; const g = [];
          items.forEach((q, i) => {
            const c = document.querySelector('input[name="' + id + i + '"]:checked'), ok = !!c && +c.value === 0, fb = $('#' + id + 'f' + i);
            g.push([ok, c ? +c.value : null]);
            $$('input[name="' + id + i + '"]').forEach(x => { const l = x.closest('.option'); l.classList.toggle('right', !q.guess && +x.value === 0); l.classList.toggle('wrong', !q.guess && x.checked && +x.value !== 0); });
            if (q.guess) { fb.textContent = c ? '🔮 ' + guessSaved(p) : ''; fb.className = 'feedback ok'; return; }
            if (ok) score++;
            fb.textContent = ok ? T2('✓ Correcte!', '✓ Correct!') : T2('✗ No és aquesta: la resposta és «' + q.o[0] + '».', '✗ Not this one: the answer is “' + q.o[0] + '”.');
            fb.className = 'feedback ' + (ok ? 'ok' : 'no');
          });
          if (count) { firstTry(id, score, scored); firstItems(id, p.items, items, g); }
          const ok = answered(items, id);
          result($('#' + id + 'Result'), score, scored, ok);
          if (ok) { if (count) complete(id); else doneFrom(id, id); }
          guessBack(p); LP.panels.filter(x => x.prev === id).forEach(guessBack);
          lock();
        }, p.items);
        // one try: Check only with every question answered
        const btn = $('#' + id + 'Check'), go = btn.onclick;
        btn.onclick = () => {
          const miss = items.findIndex((q, i) => !document.querySelector('input[name="' + id + i + '"]:checked'));
          if (miss >= 0) { const fb = $('#' + id + 'f' + miss); fb.textContent = T2('Tria una resposta abans de comprovar.', 'Choose an answer before you check.'); fb.className = 'feedback no'; return; }
          go();
        };
        $('#' + id + 'Form').addEventListener('change', e => { const fb = e.target.closest('.question') && e.target.closest('.question').querySelector('.feedback.no'); if (fb && !$('#' + id + 'QPage').classList.contains('locked')) { fb.textContent = ''; fb.className = 'feedback'; } });
        guessBack(p);
      }
    };
  }
  function guessSaved(p) {
    const next = LP.panels.some(x => x.prev === p.id);
    return next ? (ca() ? 'Desat! Ho descobriràs al capítol següent.' : 'Saved! You’ll find out in the next chapter.') : (ca() ? 'Desat! En parlarem a classe.' : 'Saved! We’ll talk about it in class.');
  }
  function guessBackHtml(p) { return p.prev ? '<div class="guess-back" id="' + p.id + 'Back" hidden></div>' : ''; }
  function guessBack(p) {
    const el = $('#' + p.id + 'Back'); if (!el) return;
    const pp = LP.panels.find(x => x.id === p.prev), its = pp ? forLevel(pp.items) : [], gi = its.findIndex(q => q.guess);
    if (gi < 0) { el.hidden = true; return; }
    const a = (state.ans || {})[pp.id], k = a && a.q ? a.q.indexOf(qid(its[gi])) : gi, v = a && a.v && k >= 0 ? a.v[k] : null, q = its[gi], n = tx(pp.tab);
    const mine = v != null && q.o[v] != null ? q.o[v] : null;
    let h = '<strong>🔮 ' + q.q + '</strong><br>';
    if (mine == null) h += ca() ? 'Al ' + n.toLowerCase() + ' no vas triar cap resposta. Llegeix i descobreix què passa!' : 'You didn’t guess in ' + n + '. Read and find out what happens!';
    else h += (ca() ? 'Al ' + n.toLowerCase() + ' vas dir: ' : 'In ' + n + ' you guessed: ') + '<b>' + mine + '</b>. ';
    if (mine != null && !state.done[p.id]) h += ca() ? 'Llegeix i descobreix si l’has encertat!' : 'Read and find out if you were right!';
    else if (mine != null) h += +v === 0 ? (ca() ? '✓ Ho has endevinat!' : '✓ You guessed right!') : (ca() ? 'Aquesta vegada no: era <b>' + q.o[0] + '</b>.' : 'Not this time: it was <b>' + q.o[0] + '</b>.');
    el.innerHTML = h; el.hidden = false;
  }

  // a box of How it works tied to a block (e.p) gets the block's number, so "2" in the theory is "2" in the practice
  function boxNum(p, e) {
    if (!p.parts || !e || !e.p) return '';
    const order = []; forLevel(p.items).forEach(it => { if (!order.includes(it.p)) order.push(it.p); });
    const n = order.indexOf(e.p) + 1;
    return n ? '<span style="display:inline-block;min-width:1.6em;margin-right:6px;padding:0 6px;border-radius:999px;background:var(--accent,#2d5b9a);color:#fff;font-weight:800;text-align:center">' + n + '</span>' : '';
  }
  R.typed = p => ({
    // 💬 Expressions (vocabEx, Roger 16 Nov 2026): its boxes are the expressions of the Vocabulary words, not "How it works"
    html: (p.explain ? (p.id === 'vocabEx' ? '<div class="section-card worked vocab-expr"><h3>💬 Expressions</h3><p class="instruction">' + (ca() ? 'Paraules que van juntes: aprèn-les en bloc.' : 'Words that go together: learn them as one block.') + '</p>'
      : '<div class="section-card worked"><h3>' + (ca() ? 'Com funciona' : 'How it works') + '</h3>') + forLevel(p.explain).map(e => '<div class="model">' + boxNum(p, e) + tx(e) + '</div>').join('') + '</div>' : '') +
      '<div class="section-card">' + (p.mode && !p.parts ? '<p class="instruction">' + modeHow(p.mode) + '</p>' : '') + '<div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + allLabel() + '</button>' + againBtn(p.id) + '</div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      if (p.parts) return partsBind(p);
      const items = forLevel(p.items);
      $('#' + p.id + 'List').innerHTML = typedHtml(items, p.id, p.mode, p.parts, true); bindModes(items, p.id, p.mode, p.parts);
      const all = allIx(items);
      stays(p.id, p.id, p.id + 'List', items, (count, only) => { checkTyped(items, p.id, false, count, only); if (count) firsts(p.id, p.id, p.items, items, all, marked(items, p.id, only), got); const C = chk(p.id), s = all.filter(i => C.has(i) && got[i][0]).length, ok = doneNow(p.id, p.id, items, p.id, all); result($('#' + p.id + 'Result'), s, items.length, ok); if (ok) { if (count) complete(p.id); else doneFrom(p.id, p.id); }; }, p.items, all);
    }
  });

  // a grammar step in parts: only the compulsory questions count (arrange); each block shows "3 / 7 compulsory" as the student answers
  function partsBind(p) {
    const A = arrange(forLevel(p.items), p.req), items = A.items, list = $('#' + p.id + 'List');
    list.innerHTML = typedHtml(items, p.id, p.mode, p.parts, true); bindModes(items, p.id, p.mode, p.parts);
    const filled = i => { const t = $('#' + p.id + i); return !!(t && String(t.value).trim()); };
    const ready = () => { let b = $('#el-gready'); const panel = $('#' + p.id), show = !state.done[p.id] && A.need.every(filled) && panel && panel.offsetParent !== null;
      if (!show) { if (b) b.remove(); return; }
      if (b) return;
      b = document.createElement('div'); b.id = 'el-gready';
      b.innerHTML = '<span>✅ ' + (ca() ? 'Ja has respost totes les preguntes obligatòries. Ja pots entregar l’activitat.' : 'You’ve answered all the compulsory questions. You can hand in this activity now.') + '</span>';
      const go = document.createElement('button'); go.type = 'button'; go.textContent = (ca() ? 'Comprova i entrega' : 'Check and hand it in') + ' ✓';
      go.onclick = () => { b.remove(); const c = $('#' + p.id + 'Check'); if (c) { c.click(); const r = $('#' + p.id + 'Result'); if (r) r.scrollIntoView({ block: 'center', behavior: 'smooth' }); } };
      b.appendChild(go); document.documentElement.appendChild(b); };
    const counts = () => {
      $$('#' + p.id + 'List .gcount').forEach(c => { const ix = A.per[c.dataset.part] || [], n = ix.filter(filled).length, all = n === ix.length;
        c.textContent = (all ? '✅ ' : '') + n + ' / ' + ix.length + (ca() ? ' obligatòries' : ' compulsory'); c.classList.toggle('ok', all); });
      $$('#' + p.id + 'List .gbd').forEach(d => { const ix = A.per[d.dataset.part] || [], all = ix.length && ix.every(filled), more = !!(d.nextElementSibling && d.nextElementSibling.classList.contains('gextra'));
        d.hidden = !all; if (all) d.textContent = '✅ ' + (ca() ? 'Has fet les ' + ix.length + ' preguntes obligatòries d’aquest bloc.' + (more ? ' Les de sota són pràctica extra, opcional.' : '') : 'You’ve done the ' + ix.length + ' compulsory questions of this block.' + (more ? ' The ones below are optional extra practice.' : '')); });
      ready();
    };
    document.addEventListener('click', e => { if (e.target.closest && e.target.closest('.tab')) setTimeout(ready, 150); });
    list.addEventListener('input', counts);
    stays(p.id, p.id, p.id + 'List', items, (count, only) => {
      checkTyped(items, p.id, false, count, only);
      const C = chk(p.id), s = A.need.filter(i => C.has(i) && got[i] && got[i][0]).length, n = A.need.length;
      if (count) firsts(p.id, p.id, p.items, items, A.need, marked(items, p.id, only), got);
      const left = A.need.filter(i => !(C.has(i) && filled(i))).length, ok = !left || doneNow(p.id, p.id, items, p.id, A.need), el = $('#' + p.id + 'Result');
      el.innerHTML = '<b>' + s + ' / ' + n + '</b> ' + (ca() ? 'correctes (preguntes obligatòries)' : 'correct (compulsory questions)') + ' · ' + (ok
        ? (ca() ? '✅ Ja has fet les preguntes obligatòries de tots els blocs: aquesta activitat està feta i entregada. La ➕ pràctica extra és opcional i no compta.' : '✅ You’ve done the compulsory questions of every block: this activity is done and handed in. The ➕ extra practice is optional and doesn’t count.')
        : (ca() ? 'Et falten ' + left + ' preguntes obligatòries per respondre i comprovar (mira el comptador de cada bloc).' : left + ' compulsory question' + (left > 1 ? 's' : '') + ' left to answer and check (see the counter in each block).'));
      el.classList.add('show');
      if (ok) { if (count) complete(p.id); else doneFrom(p.id, p.id); }
      counts();
    }, p.items, A.need);
    counts();
  }

  /* Revision counts (research audit, Roger 26 Oct 2026): the first version sent for feedback is kept as the draft (state.drafts[key]);
     the step completes only when the student saves an improved final version (state.finals[key]) with a line on what they changed.
     The teacher sees draft, final version and that line in the activity dialog; the student sees their own draft here. */
  const revWords = s => (String(s || '').trim().match(/\S+/g) || []).length;
  // Teacher-marked writing (p.teacher on a writing or marked panel; Roger, 31 Oct 2026: "instead of sending the writing to ChatGPT …
  // the teacher corrects"): the button hands the text in like a step (state.steps[p.id], with the writing log of el-typing.js), with no
  // ChatGPT and no points typed by the student. The level and the correction come from the marking sheet a week later
  // (shared/js/el-marking.js) and show in this panel (shared/js/el-corrections.js); a marked panel then counts the teacher's level as
  // its points (EL_DEGREE_MARK: NA 2.5 · AS 5 · AN 7.5 · AE 10 out of 10), sent by el-corrections.js as the "el-levels" event.
  function handToTeacher(p, text) {
    state.steps = state.steps || {};
    state.steps[p.id] = { level, title: tx(p.title), w: p.type === 'writing' ? 1 : undefined, ty: window.elTyping ? elTyping.sum('#' + p.id + 'Text') : null, f: [{ l: ca() ? 'El meu text' : 'My text', v: text }], rate: [], avg: null, comment: '', date: new Date().toISOString() };
    complete(p.id); save();
  }
  function teacherBtn() { return ca() ? 'Entrega al professor' : 'Hand it in to my teacher'; }
  // Every writing panel hands in to the teacher (Roger, 1 Nov 2026: "Desa i corregeix amb IA no hauria de sortir ja que ho corregeixes
  // tu … entregar al professor"), not only the ones with teacher: true; teacher: false keeps the old ChatGPT button. Claude corrects
  // them in the Wednesday run: a table of mistakes and the text corrected with the fewest changes (el-marking.js, mode "writing").
  const toTeacher = p => p.teacher !== false;
  function handedMsg(p) { const h = (state.steps || {})[p.id]; return h ? (ca() ? 'Entregat el ' + new Date(h.date).toLocaleDateString() + '. El professor et tornarà la correcció aquí mateix. Si canvies el text, torna’l a entregar.' : 'Handed in on ' + new Date(h.date).toLocaleDateString() + '. Your teacher’s correction will appear right here. If you change your text, hand it in again.') : ''; }
  /* A writing handed in is kept as it was (Roger, 2 Nov 2026: "they should see what they did, and warn them that they won't be able to
     modify it once handed in"): the box shows the text handed in, read-only, and the hand-in button is gone. It opens again only when
     the teacher asks for it again: "Redo in class" on a possible copy (results.flags[step].done = "redo", after that hand-in) or
     "Reopen" on the dashboard (results.reopenedAt after it). el-corrections.js sends the activity's result as the "el-result" event. */
  const reopened = {};
  const handedText = id => { const h = (state.steps || {})[id]; return h && h.f && h.f[0] ? String(h.f[0].v || '') : ''; };
  window.elHandedText = id => (LP.panels || []).some(p => p.id === id && p.type === 'writing') ? handedText(id) : '';
  function wroteMsg(p) { const h = (state.steps || {})[p.id]; return ca() ? 'Entregat el ' + new Date(h.date).toLocaleDateString() + '. Ja no el pots canviar. Quan el professor l’hagi corregit, veuràs la correcció a dalt de tot d’aquesta secció: el teu text, una taula amb les errades i el text corregit.' : 'Handed in on ' + new Date(h.date).toLocaleDateString() + '. You can’t change it now. When your teacher has corrected it, you will see the correction at the top of this section: your text, a table with your mistakes and your text, corrected.'; }
  addEventListener('el-result', e => {
    const r = (e.detail || {}).result || {}, ms = v => v == null ? 0 : typeof v === 'number' ? v : v.toDate ? +v.toDate() : v.seconds ? v.seconds * 1000 : +new Date(v) || 0;
    (LP.panels || []).filter(p => p.type === 'writing' && toTeacher(p)).forEach(p => {
      const h = (state.steps || {})[p.id]; if (!h || reopened[p.id]) return;
      const fl = (r.flags || {})[p.id], at = ms(h.date);
      if ((fl && fl.done === 'redo' && ms(fl.at) >= at) || ms(r.reopenedAt) > at) { reopened[p.id] = true; if (p._lock) p._lock(); }
    });
  });
  addEventListener('el-levels', e => {
    const lv = (e.detail || {}).levels || {}, M = { NA: 2.5, AS: 5, AN: 7.5, AE: 10 };
    (LP.panels || []).filter(p => p.teacher && p.type === 'marked' && lv[p.id]).forEach(p => {
      const xs = Object.values(lv[p.id]).map(x => M[x]).filter(x => x != null); if (!xs.length) return;
      state.ai = state.ai || {}; const k = p.id + '_' + level, v = Math.round(xs.reduce((a, b) => a + b, 0) / xs.length / 10 * p.max);
      if (state.ai[k] !== v) { state.ai[k] = v; save(); if (LP.onScore) LP.onScore(); }
    });
  });
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
      '<div class="section-card"><div id="' + p.id + 'Send"><h3>' + (ca() ? 'Revisa abans d’enviar' : 'Check before you send') + '</h3><div class="options" id="' + p.id + 'List"></div>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Ai">' + (toTeacher(p) ? teacherBtn() : ca() ? 'Desa i corregeix amb IA ↗' : 'Save and correct with AI ↗') + '</button></div>' + (toTeacher(p) ? '<p class="tiny">' + (ca() ? 'El professor et corregirà el text i et tornarà la correcció aquí mateix: el teu text, una taula amb les errades i el text corregit. <strong>Un cop entregat, ja no el podràs canviar.</strong>' : 'Your teacher will correct your text and give you the correction right here: your text, a table with your mistakes and your text, corrected. <strong>Once you hand it in, you can’t change it.</strong>') + '</p>' : '') + '</div><p class="feedback" id="' + p.id + 'Msg"></p>' +
      '</div>' + (toTeacher(p) ? '' : revisionHtml(p.id)),
    bind() {
      const ta = $('#' + p.id + 'Text'), key = p.id + '_' + level;
      state.texts = state.texts || {};
      ta.value = state.texts[key] || '';
      $('#' + p.id + 'Task').innerHTML = byLevel(p.task);
      const frame = byLevel(p.frame || {});
      if (frame) { $('#' + p.id + 'Frame').hidden = false; $('#' + p.id + 'Frame').innerHTML = frame; }
      const min = byLevel(p.min);
      const count = () => { $('#' + p.id + 'Count').textContent = realWords(ta.value) + ' ' + (ca() ? 'paraules' : 'words') + (min ? ' · ' + (ca() ? 'mínim ' : 'minimum ') + min : ''); };
      ta.oninput = () => { state.texts[key] = ta.value; save(); count(); };
      count();
      const checks = byLevel(p.checklist) || [];
      $('#' + p.id + 'List').innerHTML = checks.map(c => '<label class="option"><input type="checkbox"><span>' + c + '</span></label>').join('');
      $('#' + p.id + 'Ai').onclick = () => {
        const boxes = $$('#' + p.id + 'List input'), msg = $('#' + p.id + 'Msg');
        if (min && realWords(ta.value) < min) { msg.className = 'feedback no'; msg.textContent = (ca() ? 'Encara és massa curt: escriu almenys ' + min + ' paraules.' : 'Too short: write at least ' + min + ' words.') + padNote(ta.value); return; }
        if (boxes.some(b => !b.checked)) { msg.className = 'feedback no'; msg.textContent = learningSupport.missing(level, boxes); return; }
        if (toTeacher(p)) {
          if (!confirm(ca() ? 'Vols entregar el text al professor? Un cop entregat, ja no el podràs canviar.' : 'Hand your text in to your teacher? Once you hand it in, you can’t change it.')) return;
          handToTeacher(p, ta.value.trim()); if (p.product) saveProduct(p.product, ta.value.trim()); reopened[p.id] = false; lock(); return;
        }
        window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(aiPrompt(p, ta.value.trim())), '_blank', 'noopener,noreferrer');
        if (p.product) saveProduct(p.product, ta.value.trim());
        const first = keepDraft(key, ta.value.trim());
        msg.className = 'feedback ok';
        msg.textContent = first ? (ca() ? 'Esborrany desat ✓ S’ha obert ChatGPT amb el teu text. Llegeix el perquè de cada correcció, millora el text aquí mateix i desa la versió final a sota.' : 'Draft saved ✓ ChatGPT has opened with your text. Read each explanation, improve your text here and save your final version below.')
          : (ca() ? 'S’ha obert ChatGPT amb la teva nova versió.' : 'ChatGPT has opened with your new version.');
        showRevision();
      };
      // handed in: the text as handed in, read-only, no button (reopened by the teacher: editable again, hand it in again)
      function lock() {
        const h = (state.steps || {})[p.id], on = !!h && !reopened[p.id], msg = $('#' + p.id + 'Msg');
        ta.readOnly = on; ta.style.background = on ? '#eef2f7' : ''; ta.style.fieldSizing = on ? 'content' : ''; $('#' + p.id + 'Send').hidden = on;
        if (on) { ta.value = handedText(p.id) || ta.value; count(); msg.className = 'feedback ok'; msg.textContent = wroteMsg(p); }
        else if (h) { msg.className = 'feedback'; msg.textContent = ca() ? 'El professor et demana que el tornis a fer: millora’l i torna’l a entregar.' : 'Your teacher asks you to do it again: improve it and hand it in again.'; }
      }
      if (toTeacher(p)) { p._lock = lock; lock(); return; }
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
      '<div class="section-card"><label class="field"><strong>' + (ca() ? 'Tens algun dubte o problema per explicar al professor? (opcional: si tot ha anat bé, deixa-ho en blanc)' : 'Any question or problem to tell your teacher? (optional: if everything went well, leave it empty)') + '</strong><textarea id="' + p.id + 'Comment" rows="3"></textarea></label>' +
      '<p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      bindAudio(p); bindCycle(p); bindDict(p);
      state.steps = state.steps || {};
      const key = p.id, draft = (state.stepDraft = state.stepDraft || {})[key] = state.stepDraft[key] || { f: p.product && state.form ? Object.assign({}, state.form) : {}, rate: [], peers: [] };
      const fields = forLevel(p.fields), stm = byLevel(p.rate) || [];
      let tm = 0; const keep = () => { save(); clearTimeout(tm); tm = setTimeout(() => hand(), 700); };
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
      // No Hand in button (Roger, 24 Nov 2026: "I don't want them to have to press any button, the system needs to understand it as done"):
      // once every box, rating and teammate is filled in, the step is handed in by itself, and every later change updates it.
      const wait = t => { if (state.steps[key]) return; msg.className = 'feedback'; msg.textContent = (ca() ? 'Quan ho tinguis tot fet, s’entrega sol. ' : 'Once it is all done, it is handed in by itself. ') + t; };
      function hand() {
        const empty = fields.filter(f => !f.optional && !(draft.f[f.id] || '').trim());
        if (empty.length) { wait((ca() ? 'Falta omplir: ' : 'Still empty: ') + empty.map(f => tx(f.label)).join(' · ')); return; }
        const blocked = p.check ? p.check(level) : '';
        if (blocked) { wait(blocked); return; }
        if (stm.some((s, i) => !draft.rate[i])) { wait(ca() ? 'Puntua totes les frases de l’autoavaluació.' : 'Rate every statement of the self-assessment.'); return; }
        const ps = byLevel(p.peerRate) || [], peers = (draft.peers || []).filter(d => d && (d.name || '').trim());
        if (p.peers && (peers.length < (p.minPeers || 2) || peers.some(d => ps.some((s, i) => !(d.r || [])[i])))) { wait(ca() ? 'Escriu el nom de cada company i puntua totes les frases.' : 'Write each teammate’s name and rate every statement.'); return; }
        const rate = stm.map((s, i) => ({ s, v: draft.rate[i] }));
        state.steps[key] = { level, title: tx(p.title), ty: window.elTyping ? elTyping.sum('#' + key + 'Fields') : null, f: fields.map(f => ({ l: tx(f.label), v: (draft.f[f.id] || '').trim() })), rate, avg: rate.length ? Math.round(rate.reduce((a, x) => a + x.v, 0) / rate.length * 10) / 10 : null,
          peers: p.peers ? peers.map(d => ({ name: d.name.trim(), r: ps.map((s, i) => ({ s, v: d.r[i] })) })) : undefined, comment: (draft.comment || '').trim(), date: new Date().toISOString() };
        // A step can also be a product piece (the research card): it then appears on the final product page too.
        if (p.product) saveProduct(p.product, state.steps[key].f.filter(f => f.v).map(f => f.l + ': ' + f.v).join('\n'));
        state.done[key] = true; stamp(key); save();
        shown();
      }
      function shown() { msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregat ✓ El professor ho veurà al seu tauler. Els canvis es desen sols.' : 'Handed in ✓ Your teacher will see it on the dashboard. Changes are saved by themselves.') + (p.product ? (ca() ? ' També la trobaràs a la pàgina del producte final.' : ' You will also find it on the final product page.') : ''); }
      if (state.steps[key]) shown(); else hand();   // work written before 24 Nov 2026 and never handed in counts as soon as the page opens
    }
  });

  // Self-assessment at the end of the LS (Roger, 2 Nov 2026): tap 1–4 on "I can…" statements by competence (shared/js/el-self.js,
  // loaded by the Reflect page). Saved in state[p.id]; the dashboard's Self-assessment box reads it.
  R.self = p => window.ELSelf ? ELSelf.panel(p, { ca, tx, esc, pages: PAGES, level: () => level, state: () => state, save, done: k => { state.done[k] = true; stamp(k); save(); } })
    : { html: '<div class="section-card"><p>…</p></div>', bind() {} };

  // Static content; html may be a function so it can read saved work. Not a step.
  R.info = p => ({ html: '<div class="section-card">' + (typeof p.html === 'function' ? p.html(level) : tx(p.html)) + '</div>', bind() { if (p.after) p.after(level); } });

  /* p.video (final product, Roger 8 Nov 2026: "students load the final product on the web"): an "Upload your video" card above the list
     (shared/js/el-video.js). The upload is kept as the hand-in state.steps.video ({video: {id, name, size, at}}, no fields, so the
     Wednesday correction skips it); the dashboard plays it and Gemini watches it. p.video === 'group': any member may upload the group's
     video, so Done does not wait for it; otherwise Done waits for the upload. */
  R.checklist = p => ({
    html: (p.video ? '<div id="' + p.id + 'Video"></div>' : '') + '<div class="section-card"><div class="options" id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Ok">' + (ca() ? 'Fet ✓' : 'Done ✓') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      state.ticks = state.ticks || {};
      const items = byLevel(p.items) || [], key = p.id + '_' + level;
      $('#' + p.id + 'List').innerHTML = items.map((c, i) => '<label class="option"><input type="checkbox" data-i="' + i + '"' + ((state.ticks[key] || [])[i] ? ' checked' : '') + '><span>' + c + '</span></label>').join('');
      $$('#' + p.id + 'List input').forEach(b => b.onchange = () => { state.ticks[key] = $$('#' + p.id + 'List input').map(x => x.checked); save(); });
      state.steps = state.steps || {};
      if (p.video && window.elVideo) elVideo.mount($('#' + p.id + 'Video'), { ca: ca(), saved: (state.steps.video || {}).video,
        meta: { activity: p.videoActivity || '', level, title: tx(p.videoTitle || { ca: 'Producte final', en: 'Final product' }) },
        onDone: v => { state.steps.video = { level, title: ca() ? 'El meu vídeo' : 'My video', f: [], video: v, rate: [], avg: null, comment: '', date: v.at }; save(); } });
      $('#' + p.id + 'Ok').onclick = () => {
        const boxes = $$('#' + p.id + 'List input'), msg = $('#' + p.id + 'Msg');
        if (p.video === true && window.elVideo && !(state.steps.video || {}).video) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Primer puja el teu vídeo a dalt.' : 'Upload your video above first.'; return; }
        if (boxes.some(b => !b.checked)) { msg.className = 'feedback no'; msg.textContent = learningSupport.missing(level, boxes); return; }
        msg.className = 'feedback ok'; msg.textContent = ca() ? 'Fet ✓' : 'Done ✓'; complete(p.id);
      };
    }
  });

  /* ---------- speaking (recording code from the 4 ESO course reference) ---------- */
  let audioCtx, sourceNode, processor, micStream, pcm = [], recRate = 44100, recBlob = null, recUrl = null;
  function encodeWav(buffers, rate) {
    const len = buffers.reduce((n, a) => n + a.length, 0), samples = new Float32Array(len); let o = 0;
    buffers.forEach(a => { samples.set(a, o); o += a.length; });
    const ab = new ArrayBuffer(44 + samples.length * 2), v = new DataView(ab), w = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples.length * 2, true);
    let q = 44; for (let i = 0; i < samples.length; i++, q += 2) { const s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(q, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([v], { type: 'audio/wav' });
  }
  /* Recording only, no transcript (Roger, 14 Nov 2026: "let's take the transcript option off since Gemini can understand well what
     they say"; 16 Nov 2026: "Didn't we say that there were not going to be transcripts in the speaking activities?"): Speaking and Talk
     show no transcript at all and never use Chrome's speech recognition. The student records, listens and hands in the recording:
     handRec waits until el-mic.js has uploaded it to the teacher's Drive (school Apps Script) and keeps Gemini's transcript and notes
     (task and pronunciation) as the step's fields, which the teacher and the marking read; the dashboard has the 🔊.
     A microphone that doesn't work at all: 🎙️ I can't record (el-mic.js cant), which the teacher sees when class mode starts. */
  const recFields = r => [r.tr ? { l: ca() ? 'Transcripció de la gravació' : 'Transcript of the recording', v: String(r.tr).slice(0, 6000), rec: 1 } : null,
    r.notes ? { l: 'Notes from the recording (task and pronunciation)', v: String(r.notes).slice(0, 3000), rec: 1 } : null].filter(Boolean);
  const handRec = (btn, id, title, task) => !window.elMic || !elMic.upload ? Promise.resolve(null)
    : elMic.upload({ btn, step: id, title, level, task }).then(r => r && r.ok ? { audio: Object.assign({ id: r.id, s: r.secs || null }, r.eur != null ? { eur: r.eur } : {}), f: recFields(r) } : null, () => null);
  const recSecs = btn => window.elMic && elMic.recSecs ? elMic.recSecs(btn) : 0;
  const cantRow = (host, id, title) => { if (host && window.elMic && elMic.cant) host.append(elMic.cant({ step: id, title })); };
  function downloadWav() { if (!recUrl) return; const a = document.createElement('a'); a.href = recUrl; a.download = 'ls2-2eso-lp' + LP.n + '-' + level + '.wav'; document.body.appendChild(a); a.click(); a.remove(); }
  /* Speaking hands in to the teacher: the recording itself (see handRec above), corrected in the Wednesday run (marks.mjs fb-*,
     spoken mode, from Gemini's transcript and notes); the correction shows at the top of this tab (el-corrections.js). Handing in
     completes the step; a better recording handed in again is corrected again. The plan stays (state.speak[key].plan). */
  R.speaking = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="spTask"></p><div class="speak-support"><div class="mini-card"><strong>Model</strong><div class="model" id="spModel"></div></div><div class="mini-card"><strong>' + (ca() ? 'Prepara què diràs' : 'Prepare') + '</strong><textarea id="spPlan" placeholder="Key words or short sentences…"></textarea></div></div></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Grava i escolta’t' : 'Record') + '</h3><div class="actions" style="justify-content:flex-start"><button class="btn" type="button" id="startRecord">● ' + (ca() ? 'Grava' : 'Record') + '</button><button class="btn secondary" type="button" id="stopRecord" disabled>■ ' + (ca() ? 'Atura' : 'Stop') + '</button><button class="btn secondary" type="button" id="downloadWav" disabled>' + (ca() ? 'Descarrega el WAV' : 'Download WAV') + '</button></div><div class="record-status" id="recordStatus">' + (ca() ? 'A punt per gravar.' : 'Ready to record.') + '</div><audio id="recordedAudio" controls style="width:100%;display:none"></audio></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Entrega-ho al professor' : 'Hand it in') + '</h3><p class="instruction">' + (ca() ? 'Escolta la teva gravació. Quan t’agradi com ha quedat, prem <strong>Entrega al professor</strong>: el professor rebrà la gravació i et tornarà la correcció aquí mateix. Si després et tornes a gravar millor, torna-la a entregar.' : 'Listen to your recording. When you are happy with it, press <strong>Hand it in to my teacher</strong>: your teacher gets the recording, and the correction will appear right here. If you record a better version later, hand it in again.') + '</p><div class="actions"><button class="btn" type="button" id="spSend">' + teacherBtn() + '</button></div><p class="feedback" id="spMsg"></p></div>',
    bind() {
      $('#spTask').innerHTML = byLevel(p.task); $('#spModel').innerHTML = byLevel(p.model);
      const spKey = p.id + '_' + level;
      state.speak = state.speak || {}; const sp = state.speak[spKey] = state.speak[spKey] || {};
      const keepSp = () => { sp.plan = $('#spPlan').value; save(); };
      $('#spPlan').value = sp.plan || '';
      cantRow($('#startRecord').closest('.section-card'), p.id, tx(p.title));
      $('#spPlan').oninput = keepSp;
      $('#startRecord').onclick = async () => {
        if (processor) return; $('#startRecord').disabled = true;
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
          sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
          processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
          sourceNode.connect(processor); processor.connect(audioCtx.destination);
          $('#recordStatus').textContent = ca() ? 'Gravant… parla ara.' : 'Recording… speak now.';
          $('#startRecord').disabled = true; $('#stopRecord').disabled = false; $('#downloadWav').disabled = true;
        } catch (e) { $('#startRecord').disabled = false; $('#recordStatus').textContent = ca() ? 'No s’ha pogut fer servir el micròfon. Mira el missatge de sota.' : 'Microphone access was not available. See the message below.'; }
      };
      $('#stopRecord').onclick = async () => {
        if (!processor) return;
        processor.disconnect(); sourceNode.disconnect(); micStream.getTracks().forEach(t => t.stop()); await audioCtx.close();
        recBlob = encodeWav(pcm, recRate); if (recUrl) URL.revokeObjectURL(recUrl); recUrl = URL.createObjectURL(recBlob);
        $('#recordedAudio').src = recUrl; $('#recordedAudio').style.display = 'block';
        $('#downloadWav').disabled = false; $('#startRecord').disabled = false; $('#stopRecord').disabled = true; processor = null;
        $('#recordStatus').textContent = ca() ? 'Gravació a punt. Escolta-la i entrega-la al professor.' : 'Recording ready. Listen to it, then hand it in to your teacher.';
      };
      $('#downloadWav').onclick = downloadWav;
      const msg = $('#spMsg');
      const handed = () => { const h = (state.steps || {})[p.id]; if (!h) return; msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregada el ' + new Date(h.date).toLocaleDateString() + '. El professor et tornarà la correcció aquí mateix. Si et tornes a gravar millor, torna-la a entregar.' : 'Handed in on ' + new Date(h.date).toLocaleDateString() + '. Your teacher’s correction will appear right here. If you record a better version, hand it in again.'); };
      handed();
      let sending = false;
      $('#spSend').onclick = async () => {
        if (processor) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Atura la gravació primer.' : 'Stop the recording first.'; return; }
        if (sending) return;
        // the recording has to be long enough for the task (about 0.6 s a word of the old word minimum)
        const min = (p.speakMin || { beginners: 10, insecure: 15, safe: 25, daring: 35 })[level] || 15, recMin = Math.max(8, Math.round(min * 0.6));
        if (recSecs('startRecord') < recMin) { msg.className = 'feedback no'; msg.textContent = ca()
          ? 'Grava’t fent tota la tasca (almenys ' + recMin + ' segons) i després entrega la gravació. Si el micròfon no funciona, prem 🎙️ No puc gravar.'
          : 'Record yourself doing the whole task (at least ' + recMin + ' seconds), then hand in your recording. If the microphone doesn’t work, press 🎙️ I can’t record.'; return; }
        sending = true; msg.className = 'feedback'; msg.textContent = ca() ? 'Enviant la gravació al professor…' : 'Sending your recording to your teacher…';
        const title = tx(p.title), r = await handRec('startRecord', p.id, title, $('#spTask').textContent); sending = false;
        if (!r) { msg.className = 'feedback no'; msg.textContent = ca() ? 'La gravació no s’ha pogut enviar. Torna-ho a provar d’aquí a una estona.' : 'Your recording could not be sent. Try again in a moment.'; return; }
        state.steps = state.steps || {};
        state.steps[p.id] = { level, title, ty: null, audio: r.audio, f: r.f.length ? r.f : [{ l: ca() ? 'Transcripció' : 'Transcript', v: '' }], rate: [], avg: null, comment: '', date: new Date().toISOString() };
        keepSp(); complete(p.id); save(); handed(); msg.textContent += ' 🔊 ' + (ca() ? 'Gravació desada.' : 'Recording saved.');
      };
    }
  });

  /* Talk (four skills, Roger 30 Oct 2026): a spoken interaction for self-study. The browser's English voice asks the partner's questions
     (p.partner: [{q, ca}], cumulative by route like items) one by one with time to answer while the whole conversation is recorded; no
     transcript (Roger, 16 Nov 2026). The recording is handed in like a step (handRec: Gemini's transcript and notes as its fields) and
     corrected in the Wednesday run like the speaking; it has to last p.min words × 0.6 s (per route). Safe and Daring hear each question
     before they can read it. Native (Pro): no recording (Roger), a written plan for each question instead. */
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
          '') +
        '<div class="section-card"><h3>' + (ca() ? 'Entrega-la al professor' : 'Hand it in') + '</h3><p class="instruction">' + (nat ? 'When your notes are ready, hand them in. Your teacher’s reply will appear right here.' : ca() ? 'Escolta la gravació i, quan t’agradi com ha quedat, entrega la conversa: el professor rebrà la gravació i et tornarà la correcció aquí mateix.' : 'Listen to your recording and, when you are happy with it, hand in the conversation: your teacher gets the recording, and the correction will appear right here.') + '</p><div class="actions"><button class="btn" type="button" id="' + id + 'Send">' + (ca() ? 'Entrega la conversa' : 'Hand in the conversation') + '</button></div><p class="feedback" id="' + id + 'Msg"></p></div>',
      bind() {
        const qs = forLevel(p.partner), key = id + '_' + level, wait = (p.wait || { beginners: starter() ? 16 : 12, insecure: 12, safe: 16, daring: 20 })[level] || 16;
        state.steps = state.steps || {}; state.speak = state.speak || {}; const sp = state.speak[key] = state.speak[key] || {};
        $('#' + id + 'Task').innerHTML = byLevel(p.task); $('#' + id + 'Model').innerHTML = byLevel(p.model);
        $('#' + id + 'Qs').innerHTML = qs.map((q, i) => '<li><button class="btn secondary" type="button" data-tq="' + id + i + '" aria-label="Listen">▶</button> ' +
          (sup() ? q.q + (ca() && q.ca ? ' <span class="tiny">(' + q.ca + ')</span>' : '') : '<details style="display:inline-block;vertical-align:middle"><summary>' + 'Show the question' + '</summary>' + q.q + '</details>') + '</li>').join('');
        qs.forEach((q, i) => { $('[data-tq="' + id + i + '"]').onclick = () => sayLine(q.q, sup() ? 0.85 : 0.95); });
        const msg = $('#' + id + 'Msg'), min = (p.min || { beginners: 15, insecure: 25, safe: 50, daring: 70, native: 40 })[level] || 30;
        const text = () => qs.map((q, i) => q.q + ' — ' + ((sp.notes || [])[i] || '').trim()).join('\n');
        if (nat) {
          sp.notes = sp.notes || [];
          $('#' + id + 'Notes').innerHTML = qs.map((q, i) => '<label class="field"><strong>' + q.q + '</strong><textarea data-n="' + i + '" rows="2"></textarea></label>').join('');
          $$('#' + id + 'Notes textarea').forEach(t => { t.value = sp.notes[+t.dataset.n] || ''; t.oninput = () => { sp.notes[+t.dataset.n] = t.value; save(); }; });
        } else {
          const st = $('#' + id + 'Status'), btn = n => $('#' + id + n);
          let timer = null, run = 0;
          const answerTime = (me, k, then) => { let left = wait;
            const tick = () => { if (me !== run) return; st.textContent = (ca() ? 'Respon ara… ' : 'Answer now… ') + left + ' s · ' + (ca() ? 'pregunta ' : 'question ') + (k + 1) + ' / ' + qs.length; if (left-- <= 0) return then(); timer = setTimeout(tick, 1000); };
            tick(); };
          cantRow(btn('Start').closest('.section-card'), id, tx(p.title));
          const stop = async () => {
            run++; clearTimeout(timer); stopSay();
            if (!processor) return;
            processor.disconnect(); sourceNode.disconnect(); micStream.getTracks().forEach(t => t.stop()); await audioCtx.close(); processor = null;
            recBlob = encodeWav(pcm, recRate); if (recUrl) URL.revokeObjectURL(recUrl); recUrl = URL.createObjectURL(recBlob);
            const a = $('#' + id + 'Audio'); a.src = recUrl; a.style.display = 'block';
            btn('Start').disabled = false; btn('Stop').disabled = true; btn('Wav').disabled = false;
            st.textContent = ca() ? 'Gravació a punt. Escolta-la i entrega la conversa.' : 'Recording ready. Listen to it, then hand in the conversation.';
          };
          btn('Start').onclick = async () => {
            if (processor) return; run++; clearTimeout(timer); stopSay(); btn('Start').disabled = true;
            try {
              micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
              sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
              processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
              sourceNode.connect(processor); processor.connect(audioCtx.destination);
            } catch (e) { btn('Start').disabled = false; st.textContent = ca() ? 'No s’ha pogut fer servir el micròfon. Mira el missatge de sota.' : 'Microphone access was not available. See the message below.'; return; }
            btn('Start').disabled = true; btn('Stop').disabled = false; btn('Wav').disabled = true;
            const me = ++run; let i = 0;
            const next = () => {
              if (me !== run) return;
              if (i >= qs.length) { stop(); return; }
              const k = i++; st.textContent = (ca() ? 'Pregunta ' : 'Question ') + (k + 1) + ' / ' + qs.length + ' 🔊';
              sayLine(qs[k].q, sup() ? 0.85 : 0.95, () => { if (me !== run) return; answerTime(me, k, next); });
            };
            next();
          };
          btn('Stop').onclick = stop;
          btn('Wav').onclick = downloadWav;
        }
        if (state.steps[id] && state.done[id]) { msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregada el ' : 'Handed in on ') + new Date(state.steps[id].date).toLocaleDateString() + (ca() ? '. El professor et tornarà la correcció aquí mateix. Si la tornes a fer, entrega-la una altra vegada.' : '. Your teacher’s correction will appear right here. If you do it again, hand it in again.'); }
        let sending = false;
        $('#' + id + 'Send').onclick = async () => {
          if (!nat && processor) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Atura la gravació primer.' : 'Stop the recording first.'; return; }
          if (sending) return;
          const title = tx(p.title), date = new Date().toISOString();
          if (nat) {
            if (words((sp.notes || []).join(' ')) < min) { msg.className = 'feedback no'; msg.textContent = 'Write a few ideas for every question (at least ' + min + ' words in all).'; return; }
            state.steps[id] = { level, title, ty: null, f: [{ l: 'Plan', v: text() }], rate: [], avg: null, comment: '', date }; complete(id); save();
            msg.className = 'feedback ok'; msg.textContent = 'Handed in ✓ Your teacher’s correction will appear right here.'; return;
          }
          // the recording of the conversation, if it is long enough (about 0.6 s a word of the old word minimum)
          const recMin = Math.max(15, Math.round(min * 0.6)), task = $('#' + id + 'Task').textContent + ' Questions: ' + qs.map(q => spoken(q.q)).join(' / ');
          if (recSecs(id + 'Start') < recMin) { msg.className = 'feedback no'; msg.textContent = ca()
            ? 'Prem Comença i respon totes les preguntes (almenys ' + recMin + ' segons de gravació); després entrega la conversa. Si el micròfon no funciona, prem 🎙️ No puc gravar.'
            : 'Press Start and answer every question (at least ' + recMin + ' seconds of recording), then hand in the conversation. If the microphone doesn’t work, press 🎙️ I can’t record.'; return; }
          sending = true; msg.className = 'feedback'; msg.textContent = ca() ? 'Enviant la gravació al professor…' : 'Sending your recording to your teacher…';
          const r = await handRec(id + 'Start', id, title, task); sending = false;
          if (!r) { msg.className = 'feedback no'; msg.textContent = ca() ? 'La gravació no s’ha pogut enviar. Torna-ho a provar d’aquí a una estona.' : 'Your recording could not be sent. Try again in a moment.'; return; }
          state.steps[id] = { level, title, ty: null, audio: r.audio, f: r.f.length ? r.f : [{ l: ca() ? 'Transcripció' : 'Transcript', v: '' }], rate: [], avg: null, comment: '', date }; complete(id); save();
          msg.className = 'feedback ok'; msg.textContent = (ca() ? 'Entregada ✓ El professor et tornarà la correcció aquí mateix.' : 'Handed in ✓ Your teacher’s correction will appear right here.') + ' 🔊 ' + (ca() ? 'Gravació desada.' : 'Recording saved.');
        };
      }
    };
  };

  /* 🎲 Surprise questions (Roger, 21 Nov 2026: "press record and then a random question about the LS will pop up"): shared/js/el-surprise.js
     draws the step (type 'surprise', bank in data/surprise.js); the engine lends it its recorder hand-in, voice and progress helpers. */
  R.surprise = p => window.elSurprise ? elSurprise.panel(p, { get level() { return level; }, ca, tx, get state() { return state; }, save, complete, handRec, recSecs, cantRow, sayLine, stopSay }) : { html: '', bind() {} };

  /* Shadowing (four skills, Roger 30 Oct 2026: "I usually do 5 minutes of shadowing at the beginning of each class … add that to the LS and
     count it"). p.clip = a 25–45 s part of a recording the LS already has, played as it is (the listenings never change): src and slow
     (-slow copy), t / ts = [from, to] seconds in each, lines = the script of that part ([speaker, text]), video: true for an mp4.
     Four rounds: listen and read, mumble along, shadow with the script, shadow without it (the script is hidden and the last go can be
     recorded; speech recognition shows how much of the script it caught, feedback only). Done after 3 plays and a self-rating, counted by
     completion, never by accuracy: state.shadow[id_route] = {plays, rate, pct, date}. Insecure and Beginners start on the slower copy.
     Marks + two modes (Roger, 7 Nov 2026): the script shows stressed words, linking and ↗ ↘ (clip.marks, key + show/hide), and
     🔁 Listen and repeat (clip.cues: one sentence, a pause to say it, the next) sits next to 🗣 Shadowing (shared/js/el-shadow.js).
     A Listen and repeat run counts as a play. Listening buttons carry data-vs, so they still work in the teacher's read-only student
     view and in locked sections (el-cloud.js leaves [data-vs] on; Roger, 7 Nov 2026: "it's not working" in student view). */
  R.shadow = p => {
    const id = p.id, c = p.clip, SH = window.elShadow;
    const repeatHow = ca() ? ['Prem ▶: sentiràs una frase i l’àudio s’aturarà.', 'Digues la frase en veu alta: copia les síl·labes fortes, les paraules unides i la melodia (↗ ↘).', 'La frase següent sona sola. Amb ↺ Una altra vegada la tornes a sentir.', 'Després prova 🗣 Shadowing: tot el fragment seguit, parlant alhora.']
      : ['Press ▶: you hear one sentence, then the audio stops.', 'Say the sentence aloud: copy the stressed words, the linking and the melody (↗ ↘).', 'The next sentence plays by itself. Press ↺ Again to hear a sentence once more.', 'Then try 🗣 Shadowing: the whole clip, speaking along.'];
    const howList = list => '<ol style="margin:6px 0;padding-left:22px;line-height:1.8">' + list.map(r => '<li>' + r + '</li>').join('') + '</ol>';
    const rounds = ca() ? ['Escolta i llegeix el text.', 'Torna-ho a escoltar i murmura les paraules alhora, fluix.', 'Repeteix en veu alta just darrere de la veu, amb el text: com una ombra.', 'Amaga el text i fes-ho sense mirar. Si vols, grava aquesta última vegada.']
      : ['Listen and read the script.', 'Listen again and mumble the words along with the speaker, quietly.', 'Say it aloud just behind the speaker, with the script: like a shadow.', 'Hide the script and do it without looking. Record this last go if you like.'];
    return {
      html: '<div class="section-card"><h3>' + (ca() ? 'Com es fa' : 'How it works') + '</h3><div id="' + id + 'How">' + howList(SH && SH.has(c) && SH.mode() === 'repeat' ? repeatHow : rounds) + '</div><p class="tiny">' + (ca() ? 'Millor amb auriculars.' : 'Best with headphones.') + '</p></div>' +
        '<div class="section-card"><strong>' + esc(c.title || 'Listening') + '</strong>' + (SH ? '<div id="' + id + 'Modes">' + SH.bar(c, ca(), 'btn secondary') + '</div>' : '') +
        (c.video ? '<video id="' + id + 'Media" preload="metadata" playsinline style="width:100%;border-radius:14px;margin:8px 0;background:#000"' + (c.poster ? ' poster="' + c.poster + '"' : '') + '></video>' : '<audio id="' + id + 'Media" preload="metadata"></audio>') +
        '<div class="actions" style="justify-content:flex-start;align-items:center"><button class="btn" type="button" data-vs id="' + id + 'Play">▶ ' + (ca() ? 'Escolta el fragment' : 'Play the clip') + '</button><button class="btn secondary" type="button" data-vs id="' + id + 'Stop">■ Stop</button>' +
        '<button class="btn secondary" type="button" data-vs data-sh="' + id + '" data-slow="0">' + (ca() ? 'Velocitat normal' : 'Normal speed') + '</button><button class="btn secondary" type="button" data-vs data-sh="' + id + '" data-slow="1">' + (ca() ? 'Versió més lenta' : 'Slower version') + '</button>' +
        '<span class="tiny" id="' + id + 'Count"></span></div>' + (SH ? '<div id="' + id + 'Turn">' + SH.turnBox(ca()) + '</div>' : '') +
        '<div class="actions" style="justify-content:flex-start"><button class="btn secondary" type="button" data-vs id="' + id + 'Hide">' + (ca() ? 'Amaga el text' : 'Hide the script') + '</button></div>' +
        '<div id="' + id + 'Key">' + (SH && SH.has(c) ? SH.key(ca()) : '') + '</div>' +
        '<div class="reading" id="' + id + 'Script">' + (SH ? SH.script(c, 'strong') : c.lines.map(l => '<p>' + (Array.isArray(l) && l.length > 1 ? '<strong>' + esc(l[0]) + ':</strong> ' + esc(l[1]) : esc(Array.isArray(l) ? l[0] : l)) + '</p>').join('')) + '</div></div>' +
        '<div class="section-card"><h3>' + (ca() ? 'Grava l’última vegada' : 'Record your last go') + '</h3><p class="instruction">' + (ca() ? 'Prem <strong>Grava i escolta</strong>: el fragment sona i tu el repeteixes darrere la veu. Amb Chrome veuràs quantes paraules del text ha entès l’ordinador. No compta per a la nota: és per veure com millores.' : 'Press <strong>Record and play</strong>: the clip plays and you shadow it. With Chrome you will see how many words of the script the computer caught. It is just for you, to see how you improve.') + '</p>' +
        '<div class="actions" style="justify-content:flex-start"><button class="btn secondary" type="button" id="' + id + 'Rec">● ' + (ca() ? 'Grava i escolta' : 'Record and play') + '</button><button class="btn secondary" type="button" id="' + id + 'RecStop" disabled>■ ' + (ca() ? 'Atura' : 'Stop') + '</button></div><div class="record-status" id="' + id + 'RecMsg"></div><audio id="' + id + 'Mine" controls style="width:100%;display:none"></audio></div>' +
        '<div class="section-card"><h3>' + (ca() ? 'Com ha anat?' : 'How did it go?') + '</h3><div class="actions" style="justify-content:flex-start" role="group">' +
        [['3', ca() ? '😀 Ho he seguit tot' : '😀 I kept up all the way'], ['2', ca() ? '🙂 Gairebé tot' : '🙂 Most of it'], ['1', ca() ? '😕 Em perdia' : '😕 I got lost']].map(r => '<button class="btn secondary" type="button" data-rate="' + id + '" data-v="' + r[0] + '">' + r[1] + '</button>').join('') +
        '</div><div class="actions"><button class="btn" type="button" id="' + id + 'Done">' + (ca() ? 'Fet ✓' : 'Done ✓') + '</button></div><p class="feedback" id="' + id + 'Msg"></p></div>',
      bind() {
        const key = id + '_' + level, m = $('#' + id + 'Media'), msg = $('#' + id + 'Msg');
        state.shadow = state.shadow || {}; const sh = state.shadow[key] = state.shadow[key] || { plays: 0 };
        let slow = sup(), endAt = 0, onEnd = null;
        const count = () => { $('#' + id + 'Count').textContent = (ca() ? 'Vegades: ' : 'Plays: ') + (sh.plays || 0); };
        const mark = () => $$('[data-sh="' + id + '"]').forEach(b => { const on = (b.dataset.slow === '1') === slow; b.setAttribute('aria-pressed', on); b.style.setProperty('background', on ? 'var(--accent)' : '', on ? 'important' : ''); b.style.setProperty('color', on ? '#fff' : '', on ? 'important' : ''); });
        const rate = () => $$('[data-rate="' + id + '"]').forEach(b => { const on = String(sh.rate) === b.dataset.v; b.setAttribute('aria-pressed', on); b.style.setProperty('background', on ? 'var(--accent)' : '', on ? 'important' : ''); b.style.setProperty('color', on ? '#fff' : '', on ? 'important' : ''); });
        const halt = () => { m.pause(); const f = onEnd; onEnd = null; if (f) f(); };
        m.ontimeupdate = () => { if (endAt && m.currentTime >= endAt) { endAt = 0; halt(); } };
        m.onended = () => { endAt = 0; halt(); };
        m.onerror = () => { endAt = 0; $('#' + id + 'Count').textContent = ca() ? 'El fragment no s’ha pogut carregar. Recarrega la pàgina.' : 'The clip could not load. Reload the page.'; halt(); };
        const play = done => {
          const src = slow ? c.slow : c.src, t = slow ? c.ts : c.t;
          const go = () => { if (SH) SH.lead(m, t[0]); else m.currentTime = t[0]; endAt = t[1]; onEnd = done || null; m.play().catch(e => { if (e && e.name === 'AbortError') return; endAt = 0; $('#' + id + 'Count').textContent = ca() ? 'El fragment no s’ha pogut reproduir. Torna-ho a provar.' : 'The clip could not play. Try again.'; halt(); }); sh.plays = (sh.plays || 0) + 1; count(); save(); };
          if (!m.src || !m.src.endsWith(src)) { m.src = src; m.addEventListener('loadedmetadata', go, { once: true }); m.load(); } else go();
        };
        // Listen and repeat: el-shadow.js plays sentence by sentence; a run counts as one play
        const rp = SH ? SH.player({ media: m, clip: c, src: () => slow ? c.slow : c.src, slow: () => slow, scriptEl: $('#' + id + 'Script'), turnEl: $('#' + id + 'Turn .shm-turn'), ca: ca(),
          onStart: () => { sh.plays = (sh.plays || 0) + 1; count(); save(); } }) : null;
        const repeat = () => rp && rp.has && SH.mode() === 'repeat';
        if (SH) SH.bindBar($('#' + id + 'Modes'), c, ca(), () => { rp.stop(); endAt = 0; halt(); rp.sync(); $('#' + id + 'How').innerHTML = howList(repeat() ? repeatHow : rounds); });
        $('#' + id + 'Play').onclick = () => { if (repeat()) { endAt = 0; onEnd = null; rp.start(0); } else { if (rp) rp.stop(); play(); } };
        $('#' + id + 'Stop').onclick = () => { if (rp) rp.stop(); endAt = 0; halt(); };
        $$('[data-sh="' + id + '"]').forEach(b => b.onclick = () => { if (rp) rp.stop(); slow = b.dataset.slow === '1'; endAt = 0; m.pause(); mark(); });
        $('#' + id + 'Hide').onclick = e => { const s = $('#' + id + 'Script'), h = !s.hidden; s.hidden = h; $('#' + id + 'Key').hidden = h; e.target.textContent = h ? (ca() ? 'Mostra el text' : 'Show the script') : (ca() ? 'Amaga el text' : 'Hide the script'); };
        $$('[data-rate="' + id + '"]').forEach(b => b.onclick = () => { sh.rate = +b.dataset.v; rate(); save(); });
        // the last go: the mic records while the clip plays; recognition counts the script words it heard (feedback only, never saved as a mark)
        const recMsg = $('#' + id + 'RecMsg'), recBtn = $('#' + id + 'Rec'), recStop = $('#' + id + 'RecStop');
        recStop.onclick = () => { if (rp) rp.stop(); endAt = 0; halt(); };
        recBtn.onclick = async () => {
          if (processor) return; recBtn.disabled = true; if (rp) rp.stop();
          try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
            sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
            processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
            sourceNode.connect(processor); processor.connect(audioCtx.destination);
          } catch (e) { recBtn.disabled = false; recMsg.textContent = ca() ? 'No s’ha pogut fer servir el micròfon. Mira el missatge de sota.' : 'Microphone access was not available. See the message below.'; return; }
          let rec = null, heard = ''; const SR = SRC();
          if (SR) try { rec = new SR(); rec.lang = 'en-GB'; rec.continuous = true; rec.interimResults = false; rec.onresult = e => { for (let k = e.resultIndex; k < e.results.length; k++) if (e.results[k].isFinal) heard += ' ' + e.results[k][0].transcript; }; rec.start(); } catch (e) { rec = null; }
          const rr = repeat();   // Listen and repeat: the recording follows the pauses after each sentence (Roger, 7 Nov 2026)
          recStop.disabled = false; recMsg.textContent = rr ? (ca() ? 'Gravant… repeteix cada frase quan s’aturi.' : 'Recording… say each sentence when it stops.') : (ca() ? 'Gravant… repeteix darrere la veu.' : 'Recording… shadow the speaker.');
          (c.video ? m : recBtn).scrollIntoView({ behavior: 'smooth', block: 'center' });   // the video has to be in view to follow it
          const fin = async () => {
            recStop.disabled = true;
            try { if (rec) rec.stop(); } catch (e) {}
            if (processor) { processor.disconnect(); sourceNode.disconnect(); micStream.getTracks().forEach(t => t.stop()); await audioCtx.close(); processor = null; }
            recBlob = encodeWav(pcm, recRate); if (recUrl) URL.revokeObjectURL(recUrl); recUrl = URL.createObjectURL(recBlob);
            const a = $('#' + id + 'Mine'); a.src = recUrl; a.style.display = 'block'; recBtn.disabled = false;
            setTimeout(() => {   // the last words arrive after stop
              const toks = s => norm(s).replace(/[^a-z0-9' ]+/g, ' ').split(' ').filter(Boolean), said = new Set(toks(heard)), want = c.lines.map(l => Array.isArray(l) ? l[l.length - 1] : l).join(' ').replace(/\[[^\]]*\]/g, ' ');
              const ws = toks(want), got = ws.filter(w => said.has(w)).length, pct = ws.length ? Math.round(got / ws.length * 100) : 0;
              if (SR && heard.trim()) { sh.pct = pct; save(); }
              recMsg.textContent = SR && heard.trim() ? (ca() ? 'L’ordinador ha entès el ' + pct + ' % de les paraules. Escolta’t i torna-ho a provar si vols.' : 'The computer caught ' + pct + ' % of the words. Listen to yourself and try again if you like.')
                : (ca() ? 'Gravació a punt. Escolta’t.' : 'Recording ready. Listen to yourself.') + (SR && window.elMic && window.elMic.srBroken() ? ' ' + window.elMic.text(window.elMic.srBroken()).split('. ')[0] + '.' : '');
            }, 900);
          };
          if (rr) rp.start(0, fin); else play(fin);
        };
        count(); mark(); rate();
        if (state.done[id]) { msg.className = 'feedback ok'; msg.textContent = ca() ? 'Fet ✓ Pots tornar-ho a fer sempre que vulguis.' : 'Done ✓ You can do it again whenever you like.'; }
        $('#' + id + 'Done').onclick = () => {
          if ((sh.plays || 0) < 3) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Escolta el fragment almenys 3 vegades (una per ronda).' : 'Play the clip at least 3 times (one for each round).'; return; }
          if (!sh.rate) { msg.className = 'feedback no'; msg.textContent = ca() ? 'Tria com ha anat.' : 'Choose how it went.'; return; }
          sh.date = new Date().toISOString(); complete(id); save();
          msg.className = 'feedback ok'; msg.textContent = ca() ? 'Fet ✓ Molt bé! Com més ho facis, més fàcil serà.' : 'Done ✓ Well done! The more you do it, the easier it gets.';
        };
      }
    };
  };

  /* ---------- sample exam: points per item, the writing corrected by the student's ChatGPT (a table of mistakes, no mark), score summary ---------- */
  const ptsOf = (p, q) => q.p || (q.o ? p.pts[0] : p.pts[1]);
  const maxOf = p => p.type === 'quiz' ? forLevel(p.items).reduce((t, q) => t + ptsOf(p, q), 0) : p.max;
  const ptsWord = n => n + ' ' + (ca() ? (n === 1 ? 'punt' : 'punts') : (n === 1 ? 'point' : 'points'));
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
            const v = norm($('#' + p.id + i).value), key = p.id + i; ok = fits(q.q, q.a, $('#' + p.id + i).value); g.push([ok, typedAs($('#' + p.id + i))]);
            const sl = !ok && v ? spellSlips(q.q, q.a, $('#' + p.id + i).value, items.flatMap(x => Array.isArray(x.a) ? x.a : [])) : null;
            if (!ok && v && count && !sl) tries[key] = (tries[key] || 0) + 1;
            fb.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!') : !v ? (ca() ? 'Escriu una resposta.' : 'Type an answer.')
              : (sl ? spellHint(sl, ca()) + ' ' : ca() ? 'Encara no. ' : 'Not yet. ') + (tries[key] >= 2 ? (ca() ? 'Resposta: ' : 'Answer: ') + '<strong>' + esc(q.a[0]) + '</strong>' : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
          }
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
          if (ok) { right++; pts += ptsOf(p, q); }
        });
        const tk = p.id + '_' + level;
        if (count) { firstTry(tk, pts, maxOf(p)); firstItems(p.id, p.items, items, g); }
        const done = answered(items, p.id);
        result($('#' + p.id + 'Result'), right, items.length, done, ' · ' + pts + ' / ' + ptsWord(maxOf(p)));   // the first try is the dashboard's statistic, never shown (22 Nov 2026)
        if (done) { if (count) complete(p.id); else doneFrom(p.id, p.id + '_' + level); };
        if (LP.onScore) LP.onScore();
      }, p.items);
    }
  });
  // An open task (the sample exam's writing). Roger, 20 Nov 2026: the student's own ChatGPT gives feedback "like grades" and he wants
  // "their chat gpt to do that" instead: only a table of mistakes (no., criterion C2/C3/C4, mistake, correction, why with its kind),
  // like the exam report on My marks, and their text corrected. No mark, no level and no points box.
  const KIND = () => ca() ? 'Ortografia, Gramàtica, Lèxic o Expressió i estil' : 'Spelling, Grammar, Vocabulary or Expression and style';
  function markPrompt(p, text) {
    const lv = { beginners: 'Beginners (A1)', insecure: 'Insecure (A1+ / A2 inicial)', safe: 'Safe (A2)', daring: 'Daring (A2+ / B1 emergent)' }[level];   // CEFR only: students copy this prompt (Roger, 1 Nov 2026: no "molt suport")
    const src = byLevel(p.source || ''), C = ca();
    return (C ? 'Actua com a professor d’anglès de 2n d’ESO. És una pràctica de l’examen de la Learning Situation “Free Time, Live!”.' : 'Act as a 2 ESO English teacher. This is practice for the exam of the Learning Situation “Free Time, Live!”.') +
      '\n\nRoute / level: ' + lv + '.\nTask: ' + byLevel(p.task).replace(/<[^>]+>/g, '') +
      (src ? '\n\n' + (p.sourceLabel || 'Source') + ':\n"""\n' + src.replace(/<[^>]+>/g, ' ').replace(/\s+\n/g, '\n') + '\n"""' : '') +
      '\n\nStudent’s answer:\n"""\n' + text + '\n"""\n\n' +
      (C ? 'Corregeix-lo. NO posis cap nota, punts ni nivell (res de NA, AS, AN, AE ni “x/10”) i no comentis què està bé. Respon NOMÉS amb:\n' +
          '1. Un títol: ✏️ Errades: correcció i explicació\n' +
          '2. Una taula amb aquestes columnes: Núm. | Criteri | Errada | Correcció | Per què\n' +
          '   - Núm.: 1, 2, 3…\n   - Criteri: C2 (gramàtica), C3 (vocabulari) o C4 (ortografia, majúscules, puntuació i connectors); buit si és d’expressió i estil.\n' +
          '   - Errada: les paraules exactes de l’alumne, ratllades (~~així~~).\n   - Correcció: la forma correcta en anglès, en negreta.\n' +
          '   - Per què: primer el tipus entre claudàtors, [' + KIND() + '], i després una explicació molt curta en català fàcil.\n' +
          '   Totes les errades reals (màxim 12), les més importants primer. Corregeix només el que està malament: no reescriguis per estil ni ho facis més avançat que el seu nivell.\n' +
          '3. El títol ✅ El teu text corregit i el text sencer amb només aquestes errades corregides, amb els canvis en negreta.\n' +
          'Si no hi ha errades, digues-ho en una frase i no facis la taula.'
        : 'Correct it. Do NOT give any mark, points or level (no NA, AS, AN, AE, no “x/10”) and do not comment on what is good. Reply ONLY with:\n' +
          '1. A title: ✏️ Mistakes: correction and why\n' +
          '2. A table with these columns: No. | Criterion | Mistake | Correction | Why\n' +
          '   - No.: 1, 2, 3…\n   - Criterion: C2 (grammar), C3 (vocabulary) or C4 (spelling, capital letters, punctuation and linkers); empty for expression and style.\n' +
          '   - Mistake: the student’s exact words, struck through (~~like this~~).\n   - Correction: the correct form, in bold.\n' +
          '   - Why: first the kind in brackets, [' + KIND() + '], then a very short explanation in simple English.\n' +
          '   Every real mistake (at most 12), the most important first. Correct only what is wrong: do not rewrite for style or make it more advanced than their level.\n' +
          '3. The title ✅ Your text, corrected and the whole text with only those mistakes fixed, changes in bold.\n' +
          'If there are no mistakes, say so in one sentence and leave the table out.');
  }
  R.marked = p => ({
    html: '<div class="section-card">' + mediaHtml(p) + '<h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="' + p.id + 'Task"></p>' +
      '<textarea id="' + p.id + 'Text" rows="9"></textarea><p class="tiny" id="' + p.id + 'Count"></p></div>' +
      '<div class="section-card"><h3>✏️ ' + (ca() ? 'Les teves errades' : 'Your mistakes') + '</h3><p class="instruction">' + (ca() ? 'Prem el botó: s’obre ChatGPT amb el teu text i et fa una taula amb cada errada, la correcció i per què. No té nota: llegeix cada explicació i aprèn de les errades abans de l’examen.' : 'Press the button: ChatGPT opens with your text and makes a table with each mistake, the correction and why. There is no mark: read each explanation and learn from your mistakes before the exam.') + '</p>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Ai">' + (ca() ? 'Desa i corregeix amb ChatGPT ↗' : 'Save and correct with ChatGPT ↗') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p>' +
      '<p class="warm-note">' + (ca() ? '⚠️ ChatGPT es pot equivocar: si una correcció no et quadra, pregunta-la a classe.' : '⚠️ ChatGPT can make mistakes: if a correction doesn’t make sense, ask about it in class.') + '</p></div>',
    bind() {
      bindAudio(p);
      const ta = $('#' + p.id + 'Text'), key = p.id + '_' + level, min = byLevel(p.min);
      state.texts = state.texts || {};
      ta.value = state.texts[key] || ''; ta.placeholder = byLevel(p.template || '');
      $('#' + p.id + 'Task').innerHTML = byLevel(p.task).replace(/\n/g, '<br>');
      const count = () => { $('#' + p.id + 'Count').textContent = realWords(ta.value) + ' ' + (ca() ? 'paraules' : 'words') + (min ? ' · ' + (ca() ? 'mínim ' : 'minimum ') + min : ''); };
      ta.oninput = () => { state.texts[key] = ta.value; save(); count(); };
      count();
      $('#' + p.id + 'Ai').onclick = () => {
        const msg = $('#' + p.id + 'Msg');
        if (realWords(ta.value) < (min || 10)) { msg.className = 'feedback no'; msg.textContent = (ca() ? 'Encara és massa curt: escriu almenys ' + (min || 10) + ' paraules.' : 'Too short: write at least ' + (min || 10) + ' words.') + padNote(ta.value); return; }
        window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(markPrompt(p, ta.value.trim())), '_blank', 'noopener,noreferrer');
        msg.className = 'feedback ok';
        msg.textContent = ca() ? 'Desat ✓ S’ha obert ChatGPT amb la taula de les teves errades. Llegeix per què de cada una.' : 'Saved ✓ ChatGPT has opened with the table of your mistakes. Read why for each one.';
        complete(p.id); if (LP.onScore) LP.onScore();
      };
    }
  });
  // My score: the auto-marked sections (first try, as in the exam). The writing has no points in this practice (Roger, 20 Nov 2026).
  R.summary = p => ({
    html: '<div class="section-card"><div id="' + p.id + 'Table"></div></div>',
    bind() {
      const draw = () => {
        let got = 0, max = 0, missing = false, writing = false;
        const rows = LP.panels.filter(x => x.type === 'quiz' || x.type === 'marked').map(x => {
          if (x.type === 'marked') {
            writing = true; const d = (state.done || {})[x.id];
            return '<tr><td>' + tx(x.tab) + '</td><td style="text-align:right">' + (d ? (ca() ? '✏️ Fet: sense nota' : '✏️ Done: no mark') : (ca() ? '✏️ Encara no l’has fet' : '✏️ Not done yet')) + '</td></tr>';
          }
          const m = maxOf(x), t = (state.tries || {})[x.id + '_' + level], v = t ? t.score : null;
          max += m; if (v == null) missing = true; else got += v;
          return '<tr><td>' + tx(x.tab) + '</td><td style="text-align:right">' + (v == null ? '–' : v) + ' / ' + m + '</td></tr>';
        });
        $('#' + p.id + 'Table').innerHTML = '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + rows.join('') +
          '<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>' + got + ' / ' + max + '</strong>' + (max ? ' · ' + (Math.round(got / max * 100) / 10) + ' / 10' : '') + '</td></tr></tbody></table>' +
          (missing ? '<p class="tiny">' + (ca() ? '– = encara no ho has fet.' : '– = not done yet.') + '</p>' : '') +
          (writing ? '<p class="tiny">' + (ca() ? 'L’escriptura no té nota en aquesta pràctica: aprens de la taula d’errades.' : 'The writing has no mark in this practice: you learn from the table of mistakes.') + '</p>' : '');
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
  /* Simple pages (Roger, 6 Nov 2026: "the menus have little information and when you go to a place you can find the info that you need"):
     the hero's "Remember before you look" and the tracking note fold into one "How this learning path works" row (closed), and on a
     computer the tabs become a list of steps beside the open step, each with ✓ when done and the next one marked (progress()). */
  function howTo() {
    if (typeof LP.dyn === 'function') return '';   // 🎲 Surprise questions: not a learning path
    const warm = document.querySelector('.hero .warm-note');
    if (warm) warm.hidden = true;
    return '<details class="lp-how"><summary>ⓘ ' + (ca() ? 'Com funciona aquest learning path' : 'How this learning path works') + '</summary>' + (warm ? '<p class="track-note">💡 ' + warm.innerHTML + '</p>' : '') + trackNote() + '</details>';
  }
  function markTabs() {
    let next = false;
    tabsOf().forEach(p => { const t = document.querySelector('.tab[data-panel="' + p.id + '"]'); if (!t || t.classList.contains('el-sec-hide')) return; if (t.classList.contains('el-sec-cls')) { t.classList.remove('next'); return; } const d = stepDone(p); t.classList.toggle('done', d); t.classList.toggle('next', !d && !next); t.dataset.next = ca() ? 'SEGÜENT' : 'NEXT'; if (!d) next = true; });
    // Phone (Roger, 6 Nov 2026): keep the open step visible in the strip of steps.
    const a = $('.lp-body>.tabs .tab.active');
    if (a && innerWidth < 1000 && markTabs.on !== a.dataset.panel) { markTabs.on = a.dataset.panel; a.parentNode.scrollLeft = a.offsetLeft - a.parentNode.offsetLeft - 16; }
  }
  /* Study guide (Roger, 31 Oct 2026): shared/js/el-study.js draws it from LP.study (data/study/<page>.js). */
  const studyApi = () => ({ LP, level: () => level, ca });
  function studyCard() { return window.ELStudy && LP.study ? ELStudy.html(studyApi()) : ''; }
  function bindStudy() { if (window.ELStudy && LP.study) ELStudy.bind(studyApi()); }
  function render() {
    carryRoute();
    const PS = tabsOf(), act0 = ($('.tab.active') || {}).dataset ? $('.tab.active').dataset.panel : null, active = PS.some(p => p.id === act0) ? act0 : PS[0].id;
    $('#lp').innerHTML = '<div class="lp-top">' + howTo() + studyCard() + '</div>' + planCard() + '<div class="lp-body"><nav class="tabs" aria-label="Sections">' + PS.map((p, i) => '<button class="tab' + (p.id === active ? ' active' : '') + '" data-panel="' + p.id + '"><span class="tn">' + (i + 1) + '</span> <span class="tl">' + tx(p.tab) + '</span></button>').join('') + '</nav><div class="lp-panels">' +
      PS.map(p => { const r = R[p.type](p); p._r = r; return '<section class="panel' + (p.id === active ? ' active' : '') + '" id="' + p.id + '"><div class="panel-head"><div><h2>' + tx(p.title) + '</h2><p class="instruction">' + tx(p.intro || '') + '</p>' + '</div>' + (p.pill ? '<span class="pill">' + tx(p.pill) + '</span>' : '') + '</div>' + r.html + '</section>'; }).join('') + '</div></div>' +
      reviewCard() + '<p class="footer-note">' + (ca() ? 'Les respostes i el progrés es desen per a cada ruta.' : 'Your answers and progress are saved for each route.') + '</p>';
    if (WC) { WC.gone(); WC = null; }
    PS.forEach(p => p._r.bind());
    bindPlan();
    bindStudy();
    $$('.tab').forEach(t => t.onclick = () => { $$('.tab,.panel').forEach(x => x.classList.remove('active')); t.classList.add('active'); $('#' + t.dataset.panel).classList.add('active'); markTabs(); const top = innerWidth <= 640 ? $('.lp-body').getBoundingClientRect().top + scrollY : $('#lp').offsetTop - 64; if (innerWidth > 640 || scrollY > top) window.scrollTo({ top, behavior: 'smooth' }); });
    if (!LP.book) initNext();
    progress();
  }
  // the page's tabs: its panels, or one tab for the whole book (LP.book: the chapters are its steps)
  function tabsOf() { return LP.book ? [{ id: 'book', type: 'onebook', tab: LP.book.tab, title: LP.book.title, intro: LP.book.intro, steps: LP.panels }] : LP.panels; }
  function stepDone(p) { if (p.steps) return p.steps.every(stepDone); return p.type === 'info' || p.type === 'summary' ? true : p.type === 'vocab' ? !!state.done.cards && (!p.practice || !!state.done.practice) : !!state.done[p.id]; }
  function initNext() {
    $$('.section-next').forEach(e => e.remove());
    const last = LP.panels[LP.panels.length - 1];
    sectionNext.init({ level: () => level, panels: LP.panels.slice(0, -1).map(p => ({ id: p.id, done: () => stepDone(p), detail: c => c ? 'Respon i comprova totes les activitats d’aquesta secció.' : 'Answer and check every activity in this section.' })) });
    sectionNext.final({ id: last.id, level: () => level, done: () => stepDone(last), detail: c => c ? 'Completa l’última activitat.' : 'Finish the last activity.' });
  }
  /* 🎲 Panels made from data that arrives later (LP.dyn, the Surprise questions page: one tab per activity the teacher made on the
     Time plan, el-catalog.js elSqSync): built at init from this browser's copy and again when "el-sq" brings the LS document's list. */
  function addDyn() { if (!LP || typeof LP.dyn !== 'function') return false; const ps = LP.dyn(), ids = ps.map(p => p.id).join('|'); if (ids === LP._dyn) return false; LP._dyn = ids; LP.panels = ps; return true; }
  window.addEventListener('el-sq', () => { if (addDyn()) render(); });
  function init(config) {
    if (!document.getElementById('trackNoteCss')) document.head.insertAdjacentHTML('beforeend', '<style id="trackNoteCss">.lp-how{margin:0 0 14px;background:#fff;border:1px solid var(--line,#dbe5f1);border-radius:14px;padding:0 14px}.lp-how>summary{cursor:pointer;padding:12px 0;font-weight:750;color:var(--dark,#234777)}.lp-how .track-note{margin:0 0 12px}'
      + '.tab .tn{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-width:24px;height:24px;border-radius:999px;font-size:.85rem}.tab.done .tn{background:#16a34a!important;color:#fff!important;font-size:0}.tab.done .tn::after{content:"✓";font-size:.85rem}.tab.next:not(.active){box-shadow:inset 0 0 0 2px var(--accent,#315f9f)}'
      + '@media (min-width:1000px){.lp-body{display:grid;grid-template-columns:250px minmax(0,1fr);gap:22px;align-items:start}.lp-body>.el-tsec{grid-column:1/-1}.lp-body>.tabs{flex-direction:column;overflow:visible;position:sticky;top:76px;padding:0;gap:6px}.lp-body .tab{display:flex;align-items:center;gap:10px;text-align:left;white-space:normal;padding:11px 13px}.lp-body .tab.next:not(.active)::after{content:attr(data-next);margin-left:auto;font-size:.7rem;letter-spacing:.06em;color:var(--accent,#315f9f)}}'
      + '.lp-top{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;align-items:start;margin:0 0 14px}.lp-top>*{margin:0!important}.routes:has(.route[style*="none"]){display:flex;flex-wrap:wrap}.routes:has(.route[style*="none"]) .route{flex:0 0 auto;padding:8px 16px;min-height:0}'
      + '.hero{padding:24px 0 18px!important}.hero h1{font-size:clamp(2rem,3.4vw,2.8rem)!important;margin:.15em 0 .2em!important}.lp-top+.plan-card{padding:12px 16px!important;margin-bottom:14px}.lp-top+.plan-card h3{display:inline;font-size:1rem;margin:0}.lp-top+.plan-card .instruction{display:inline;margin:0 0 0 6px;font-size:.92rem}.lp-top+.plan-card input{display:block;width:100%;box-sizing:border-box;margin-top:8px}'
      + '@media (max-width:640px){.topbar{position:static!important}.hero{padding:14px 0 10px!important}.hero h1{font-size:1.75rem!important}.hero .lead{font-size:.98rem;margin:.2em 0 .6em}.hero .eyebrow{font-size:.72rem}.lp-body>.tabs{position:sticky;top:0;z-index:25;margin:0 -16px 10px;padding:8px 16px;background:var(--bg,#f4f7fb);box-shadow:0 6px 10px -8px #0f172a40;gap:6px;scrollbar-width:none}.lp-body>.tabs::-webkit-scrollbar{display:none}.lp-body .tab{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;font-size:.92rem;border-radius:11px}.lp-body .tab .tn{min-width:22px;height:22px}.panel{padding:16px!important;border-radius:16px!important}.panel-head h2{font-size:1.35rem}.lp-how>summary{padding:11px 0}}'
      + '.track-note{margin:0 0 14px;padding:10px 13px;background:#fff8e1;border:1px solid #f3d27a;border-radius:13px;color:#5b4300;font-size:.95rem;line-height:1.45}.redo-sec{justify-content:flex-end;align-items:center;margin:0 0 12px}.redo-sec[hidden]{display:none}.redo-sec .tiny{margin:0}</style>');
    LP = config; addDyn();
    level = localStorage.getItem(LP.key + 'Level') || 'insecure';
    if (ROUTES.indexOf(level) < 0) level = 'insecure';
    try { state = JSON.parse(localStorage.getItem(LP.key) || '{}'); } catch (e) { state = {}; }
    state.done = state.done || {};
    /* Do it again after new questions (Roger, 9 Nov 2026: "the students who did the grammar need to do it again and it's like they didn't
       do that. No messages to those students"): a panel with redoBefore (a date) quietly clears the work a student checked before that date
       (done, first and last try, answers, first-try items, typing), so the step is to do again and nothing old counts. Nothing is shown. */
    LP.panels.forEach(p => {
      if (!p.redoBefore) return; const k = p.id, d = [(state.doneAt || {})[k], ((state.tries || {})[k] || {}).date, ((state.last || {})[k] || {}).date].filter(Boolean);
      if (!d.length || !d.some(x => x < p.redoBefore)) return;
      delete state.done[k]; ['doneAt', 'tries', 'last', 'ans'].forEach(f => { if (state[f]) delete state[f][k]; });
      ['items', 'typing'].forEach(f => { if (state[f]) Object.keys(state[f]).forEach(x => { if (x.startsWith(k + '_')) delete state[f][x]; }); });
      localStorage.setItem(LP.key, JSON.stringify(state));
      // the cloud copy gets it with a normal save once the page has pulled the student's progress (el-cloud.js loads after this)
      setTimeout(() => { try { save(); } catch (e) {} }, 4000);
    });
    // a page outside the learning paths (🎲 Surprise questions) gets its own first option, so it has no LP number
    const sel = $('#sessionJump');
    if (sel) { const here = location.pathname.split('/').pop(); sel.innerHTML = (PAGES.some(([f]) => f === here) ? '' : '<option value="' + here + '" selected>🎲 ' + (ca() ? 'Preguntes sorpresa' : 'Surprise questions') + '</option>') + PAGES.map(([f, t]) => '<option value="' + f + '"' + (f === here ? ' selected' : '') + '>' + t + '</option>').join(''); sel.onchange = () => { location.href = sel.value; }; }
    $$('.route').forEach(b => { b.classList.toggle('active', b.dataset.level === level); b.onclick = () => { level = b.dataset.level; $$('.route').forEach(x => x.classList.toggle('active', x === b)); save(); render(); learningSupport.apply(level); }; });
    render();
    learningSupport.apply(level);
  }
  return { init, PAGES, PRODUCTS, get level() { return level; }, get state() { return state; } };
})();
