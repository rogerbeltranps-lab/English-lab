/* Seasons & Celebrations (4 ESO, LS2): renders a Learning Path from the page's window.LP config.
   Content lives in each page; this file only holds the activity types, scoring and progress.
   Routes are cumulative: an item with r:"safe" is shown to Safe and Daring. Auto-corrected steps
   complete at 80 % (rounded up); the recall warm-up completes when submitted and keeps the first attempt. */
var LS2 = (function () {
  // Beginners (A1) sits below Insecure: it sees every untagged item and, where a text or list has no 'beginners' version, the Insecure one.
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring'];
  const PAGES = [
    ['getting-started.html', '1 · Getting started'],
    ['celebrations-around-the-world.html', '2 · Celebrations around the world'],
    ['recall-checkpoint-1.html', 'Recall checkpoint 1'],
    ['where-traditions-come-from.html', '3 · Where traditions come from'],
    ['recall-checkpoint-2.html', 'Recall checkpoint 2'],
    ['research-it-right.html', '4 · Research it right'],
    ['plan-the-day.html', '5 · Plan the day'],
    ['recall-checkpoint-3.html', 'Recall checkpoint 3'],
    ['write-to-the-head-teacher.html', '6 · Write to the head teacher'],
    ['recall-checkpoint-4.html', 'Recall checkpoint 4'],
    ['sample-exam.html', 'Sample exam'],
    ['celebration-day-proposal.html', '7 · Final product'],
    ['reflect.html', 'Reflect']
  ];
  const PRODUCTS = 'ls2Products4ESO';
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
  function typedHtml(items, prefix) {
    return items.map((it, i) => '<div class="question"><p class="q-title">' + (i + 1) + '. ' + it.q + '</p>' +
      '<input type="text" class="typed" id="' + prefix + i + '" autocomplete="off" autocapitalize="off" spellcheck="false">' +
      '<div class="feedback" id="' + prefix + 'f' + i + '"></div></div>').join('');
  }
  // reveal: true shows the answer at once (recall); otherwise the answer appears after the second wrong try.
  function checkTyped(items, prefix, reveal) {
    let score = 0;
    items.forEach((it, i) => {
      const v = norm($('#' + prefix + i).value), ok = it.a.some(a => norm(a) === v), f = $('#' + prefix + 'f' + i);
      const key = prefix + i;
      if (ok) score++; else if (v) tries[key] = (tries[key] || 0) + 1;
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

  /* ---------- panels ---------- */
  const R = {};
  R.recall = p => ({
    html: '<div class="section-card"><div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button></div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      const items = forLevel(p.items);
      $('#' + p.id + 'List').innerHTML = typedHtml(items, p.id);
      $('#' + p.id + 'Check').onclick = () => {
        const s = checkTyped(items, p.id, true);
        state.first = state.first || {};
        if (!state.first[level]) state.first[level] = { score: s, max: items.length, date: new Date().toISOString() };
        lastTry(p.id, s, items.length); save();
        const el = $('#' + p.id + 'Result');
        el.textContent = s + ' / ' + items.length + (ca() ? ' correctes · Pas completat ✓ Llegeix el feedback de les que has fallat.' : ' correct · Step complete ✓ Read the feedback for the ones you missed.');
        el.classList.add('show');
        complete(p.id);
      };
    }
  });

  R.vocab = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'Explora' : 'Explore') + '</h3><div class="vocab-groups" id="vocabGroups"></div>' +
      (p.receptive ? '<p class="tiny">' + (ca() ? 'Paraules que sentiràs o llegiràs (no cal aprendre-les): ' : 'Words you will hear or read (no need to learn them): ') + p.receptive + '</p>' : '') + '</div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Targetes' : 'Study cards') + '</h3><p class="instruction">' + (ca() ? 'Digues l’expressió en veu alta i intenta recordar què vol dir. Després gira la targeta.' : 'Say the expression aloud and try to remember its meaning. Then turn the card.') + '</p>' +
      '<div class="flashcard" id="flashcard" tabindex="0"><div class="flash-inner"><div class="face front"><div class="label" id="cardIcon"></div><strong id="cardFront"></strong><p>' + (ca() ? 'Clica per girar la targeta' : 'Click to turn the card') + '</p></div><div class="face back"><div class="label">Català + example</div><strong id="cardMeaning"></strong><p id="cardBack"></p></div></div></div>' +
      '<div class="counter" id="cardCounter"></div><div class="flash-actions"><button class="btn secondary" id="prevCard" type="button">← ' + (ca() ? 'Anterior' : 'Previous') + '</button><button class="btn" id="gotCard" type="button"></button><button class="btn secondary" id="againCard" type="button"></button><button class="btn secondary" id="nextCard" type="button">' + (ca() ? 'Següent' : 'Next') + ' →</button><button class="btn secondary" id="newCards" type="button"></button><button class="btn secondary" id="skipCards" type="button"></button></div><p class="instruction" id="cardNote"></p></div>' +
      (p.practice ? '<div class="section-card"><h3>' + (ca() ? 'Completa les frases' : 'Complete the sentences') + '</h3>' + '<div id="vocabPractice"></div><div class="actions"><button class="btn" type="button" id="vocabCheck">' + (ca() ? 'Comprova' : 'Check') + '</button></div><div class="result" id="vocabResult"></div></div>' : ''),
    bind() {
      const groups = forLevel(p.groups);
      $('#vocabGroups').innerHTML = groups.map(g => '<article class="vocab-group"><h3>' + g.g + '</h3><div class="chips">' + g.items.map(x => '<span class="chip" tabindex="0">' + x[0] + '<span class="chip-tooltip"><b>' + x[1] + '</b>' + x[2] + '</span></span>').join('') + '</div></article>').join('');
      const deck = () => {
        const own = forLevel(p.groups).flatMap(g => g.items.map(x => [x[0], x[1], g.g, x[2]]));
        const earlier = forLevel(p.review || []).flatMap(g => g.items.map(x => [x[0], x[1], g.g + ' · review', x[2]]));
        return own.concat(earlier);
      };
      $('#flashcard').onclick = () => $('#flashcard').classList.toggle('flipped');
      $('#flashcard').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#flashcard').classList.toggle('flipped'); } };
      window.renderCards = window.renderCards || function () {};
      flashcardSet.cards = []; flashcardSet.lastLevel = null;
      if (!flashcardSet.config) flashcardSet.init({ cards: deck, level: () => level, complete: () => complete('cards'), isDone: () => !!state.done.cards });
      else { flashcardSet.config.cards = deck; flashcardSet.render(); }
      if (p.practice) {
        const items = forLevel(p.practice);
        $('#vocabPractice').innerHTML = typedHtml(items, 'vp');
        $('#vocabCheck').onclick = () => { const s = checkTyped(items, 'vp'); firstTry('practice', s, items.length); const ok = s >= need(items.length); result($('#vocabResult'), s, items.length, ok); if (ok) complete('practice'); };
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
  R.mc = p => ({
    html: '<div class="section-card">' + mediaHtml(p) + '<form id="' + p.id + 'Form"></form><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button></div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      bindAudio(p);
      const items = forLevel(p.items), f = $('#' + p.id + 'Form');
      f.innerHTML = items.map((q, i) => '<div class="question"><p class="q-title">' + (i + 1) + '. ' + q.q + '</p><div class="options">' +
        learningSupport.shuffledIndexes(q.o.length).map(j => '<label class="option"><input type="radio" name="' + p.id + i + '" value="' + j + '"><span>' + q.o[j] + '</span></label>').join('') +
        '</div><div class="feedback" id="' + p.id + 'f' + i + '"></div></div>').join('');
      $('#' + p.id + 'Check').onclick = () => {
        let score = 0;
        items.forEach((q, i) => {
          const c = document.querySelector('input[name="' + p.id + i + '"]:checked'), ok = !!c && +c.value === 0, fb = $('#' + p.id + 'f' + i);
          if (ok) score++;
          fb.textContent = q.ex && c ? (ok ? (ca() ? 'Correcte! ' : 'Correct! ') : (ca() ? 'Encara no. ' : 'Not yet. ')) + tx(q.ex)
            : learningSupport.evidence(level, ok, c, q.o[0], ca() ? q.h : null, !!(p.media && (p.media.audio || p.media.youtube)));
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
        });
        firstTry(p.id, score, items.length);
        const ok = score >= need(items.length);
        result($('#' + p.id + 'Result'), score, items.length, ok);
        if (ok) complete(p.id);
      };
    }
  });

  R.typed = p => ({
    html: (p.explain ? '<div class="section-card worked"><h3>' + (ca() ? 'Com funciona' : 'How it works') + '</h3>' + forLevel(p.explain).map(e => '<div class="model">' + tx(e) + '</div>').join('') + '</div>' : '') +
      '<div class="section-card"><div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button></div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      const items = forLevel(p.items);
      $('#' + p.id + 'List').innerHTML = typedHtml(items, p.id);
      $('#' + p.id + 'Check').onclick = () => { const s = checkTyped(items, p.id); firstTry(p.id, s, items.length); const ok = s >= need(items.length); result($('#' + p.id + 'Result'), s, items.length, ok); if (ok) complete(p.id); };
    }
  });

  function aiPrompt(p, text) {
    return 'Actua com a professor d’anglès de 4t d’ESO. Learning Situation “Seasons & Celebrations”, Learning Path ' + LP.n + ' “' + LP.title + '”.\n\nNivell: ' + cap(level) + '.\nTasca: ' + byLevel(p.task).replace(/<[^>]+>/g, '') +
      '\n\nText de l’alumne:\n"""\n' + text + '\n"""\n\n' + learningSupport.aiLanguage(level) +
      ' No reescriguis tot el text i no posis nota numèrica. Respon només amb aquests apartats:\n1. ✅ Què has fet bé — dues coses concretes.\n2. 🔧 Errors importants — màxim 4; per a cada un, copia la frase, explica el perquè breument i dona la versió correcta.\n3. 📋 Tasca — digues si compleix cada punt de la tasca.\n4. 🎯 Un següent pas — una millora concreta per a la versió final.';
  }
  R.writing = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="' + p.id + 'Task"></p>' +
      (p.model ? '<div class="model"><strong>' + (ca() ? 'Model (no el copiïs: és sobre una altra celebració)' : 'Model (don’t copy it: it is about another celebration)') + '</strong><br>' + tx(p.model) + '</div>' : '') +
      '<div class="model" id="' + p.id + 'Frame" hidden></div><textarea id="' + p.id + 'Text" placeholder="Write here…"></textarea><p class="tiny" id="' + p.id + 'Count"></p></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Revisa abans d’enviar' : 'Check before you send') + '</h3><div class="options" id="' + p.id + 'List"></div>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Ai">' + (ca() ? 'Desa i corregeix amb IA ↗' : 'Save and correct with AI ↗') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p>' +
      '<p class="instruction">' + (ca() ? 'Llegeix el feedback, millora el text aquí mateix i torna a desar-lo: la versió desada és la que faràs servir al producte final.' : 'Read the feedback, improve your text here and save it again: the saved version is the one you will use in the final product.') + '</p></div>',
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
        msg.className = 'feedback ok';
        msg.textContent = ca() ? 'Desat ✓ S’ha obert ChatGPT amb el teu text. Llegeix el perquè de cada correcció i millora el text.' : 'Saved ✓ ChatGPT has opened with your text. Read each explanation and improve your text.';
        complete(p.id);
      };
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
    html: '<div class="section-card">' + (p.html ? (typeof p.html === 'function' ? p.html(level) : tx(p.html)) : '') + mediaHtml(p) + '<div id="' + p.id + 'Fields"></div></div>' +
      (p.rate ? '<div class="section-card"><h3>' + (ca() ? 'Autoavaluació' : 'Self-assessment') + '</h3><p class="instruction">' + (ca() ? 'Puntua’t amb sinceritat: 1 ' + SCALE.ca[0] + ' · 2 ' + SCALE.ca[1] + ' · 3 ' + SCALE.ca[2] + ' · 4 ' + SCALE.ca[3] + '.' : 'Be honest: 1 ' + SCALE.en[0] + ' · 2 ' + SCALE.en[1] + ' · 3 ' + SCALE.en[2] + ' · 4 ' + SCALE.en[3] + '.') + '</p><div id="' + p.id + 'Rate"></div></div>' : '') +
      (p.peers ? '<div class="section-card"><h3>' + (ca() ? 'Els meus companys' : 'My teammates') + '</h3><p class="instruction">' + tx(p.peersIntro) + '</p><div id="' + p.id + 'Peers"></div></div>' : '') +
      '<div class="section-card"><label class="field"><strong>' + (ca() ? 'Vols dir alguna cosa al professor? Un problema que hàgiu tingut? (opcional)' : 'Anything you want to tell your teacher? A problem you or your group faced? (optional)') + '</strong><textarea id="' + p.id + 'Comment" rows="3"></textarea></label>' +
      '<div class="actions"><button class="btn" type="button" id="' + p.id + 'Send">' + (ca() ? 'Entrega aquest pas' : 'Hand in this step') + '</button></div><p class="feedback" id="' + p.id + 'Msg"></p></div>',
    bind() {
      bindAudio(p);
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
  let audioCtx, sourceNode, processor, micStream, pcm = [], recRate = 44100, recBlob = null, recUrl = null, recognition = null, srActive = false, srTimer = null, srFinal = '';
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
        recognition.onresult = e => { let interim = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) srFinal += t.trim() + ' '; else interim += t; } $('#speechTranscript').value = (srFinal + interim).trim(); };
        recognition.onend = () => { if (srActive) srTimer = setTimeout(launch, 180); };
        recognition.start();
      } catch (e) { if (srActive) srTimer = setTimeout(launch, 250); }
    };
    launch();
  }
  function stopSR() { srActive = false; if (srTimer) clearTimeout(srTimer); try { if (recognition) recognition.stop(); } catch (e) {} }
  function downloadWav() { if (!recUrl) return; const a = document.createElement('a'); a.href = recUrl; a.download = 'ls2-lp' + LP.n + '-' + level + '.wav'; document.body.appendChild(a); a.click(); a.remove(); }
  R.speaking = p => ({
    html: '<div class="section-card"><h3>' + (ca() ? 'La tasca' : 'Your task') + '</h3><p class="instruction" id="spTask"></p><div class="speak-support"><div class="mini-card"><strong>Model</strong><div class="model" id="spModel"></div></div><div class="mini-card"><strong>' + (ca() ? 'Prepara què diràs' : 'Prepare') + '</strong><textarea id="spPlan" placeholder="Key words or short sentences…"></textarea></div></div></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Grava i escolta’t' : 'Record') + '</h3><div class="actions" style="justify-content:flex-start"><button class="btn" type="button" id="startRecord">● ' + (ca() ? 'Grava' : 'Record') + '</button><button class="btn secondary" type="button" id="stopRecord" disabled>■ ' + (ca() ? 'Atura' : 'Stop') + '</button><button class="btn secondary" type="button" id="downloadWav" disabled>' + (ca() ? 'Descarrega el WAV' : 'Download WAV') + '</button></div><div class="record-status" id="recordStatus">' + (ca() ? 'A punt per gravar.' : 'Ready to record.') + '</div><audio id="recordedAudio" controls style="width:100%;display:none"></audio></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Revisa la transcripció' : 'Transcript') + '</h3><p class="instruction">' + (ca() ? 'Amb Chrome, la transcripció es crea mentre graves. Corregeix-la perquè digui el que has dit.' : 'With Chrome, a transcript is created while you record. Correct it so it matches what you said.') + '</p><textarea id="speechTranscript" placeholder="Your transcript will appear here."></textarea></div>' +
      '<div class="section-card"><h3>' + (ca() ? 'Demana feedback' : 'Get feedback') + '</h3><p class="instruction">' + (ca() ? 'Prem <strong>Corregeix amb IA</strong>: es descarrega el WAV i s’obre ChatGPT. Adjunta el WAV i prem Envia. Després torna a gravar la versió millorada.' : 'Press <strong>Correct with AI</strong>: the WAV downloads and ChatGPT opens. Attach the WAV and press Send. Then record an improved version.') + '</p><div class="actions"><button class="btn" type="button" id="spAi" disabled>' + (ca() ? 'Corregeix amb IA ↗' : 'Correct with AI ↗') + '</button></div><p class="tiny" id="spStatus"></p></div>',
    bind() {
      $('#spTask').innerHTML = byLevel(p.task); $('#spModel').innerHTML = byLevel(p.model);
      $('#startRecord').onclick = async () => {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioCtx = new (window.AudioContext || window.webkitAudioContext)(); recRate = audioCtx.sampleRate;
          sourceNode = audioCtx.createMediaStreamSource(micStream); processor = audioCtx.createScriptProcessor(4096, 1, 1); pcm = [];
          processor.onaudioprocess = e => pcm.push(new Float32Array(e.inputBuffer.getChannelData(0)));
          sourceNode.connect(processor); processor.connect(audioCtx.destination); startSR();
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
        complete(p.id);
      };
      $('#downloadWav').onclick = downloadWav;
      $('#spAi').onclick = () => {
        const tr = $('#speechTranscript').value.trim();
        const prompt = 'IMPORTANT: ENCARA NO DONIS FEEDBACK SI NO HI HA CAP ÀUDIO ADJUNT. Si aquest missatge arriba abans que l’àudio, respon només: "Adjunta l’àudio i l’escoltaré."\n\nQuan l’àudio estigui adjunt, escolta’l i actua com a professor d’anglès de 4t d’ESO dins de la Learning Situation “Seasons & Celebrations”, Learning Path ' + LP.n + ' “' + LP.title + '”.\n\nNivell: ' + cap(level) + '.\nTasca: ' + byLevel(p.task).replace(/<[^>]+>/g, '') + '\n\n' +
          (tr ? 'Transcripció automàtica de suport (pot contenir errors):\n"' + tr + '"\n\nPrimer escolta l’àudio i dona prioritat al que realment s’hi sent.' : 'No hi ha transcripció automàtica. Escolta l’àudio abans de donar feedback.') +
          '\n\n' + learningSupport.aiLanguage(level) + ' No posis nota numèrica. Respon només amb aquests apartats:\n1. 📝 Transcripció\n2. ✅ Què ha fet bé — una o dues coses concretes.\n3. 🔧 Què ha de corregir — màxim 2 errors importants, amb la frase correcta.\n4. 🗣️ Pronunciació — un sol problema clar, si n’hi ha.\n5. 📋 Instruccions — si ha complert la tasca.\n6. 🎯 Un següent pas.';
        const win = window.open('https://chatgpt.com/?prompt=' + encodeURIComponent(prompt), '_blank', 'noopener,noreferrer');
        downloadWav();
        $('#spStatus').textContent = win ? (ca() ? '✓ WAV descarregat · ChatGPT obert. Adjunta el WAV i prem Envia.' : '✓ WAV downloaded · ChatGPT opened. Attach the WAV and press Send.') : (ca() ? 'El navegador ha bloquejat la pestanya. Permet les finestres emergents.' : 'The browser blocked the tab. Allow pop-ups and try again.');
      };
    }
  });

  /* ---------- sample exam: points per item, tasks marked by ChatGPT, score summary ---------- */
  const ptsOf = (p, q) => q.p || (q.o ? p.pts[0] : p.pts[1]);
  const maxOf = p => p.type === 'quiz' ? forLevel(p.items).reduce((t, q) => t + ptsOf(p, q), 0) : p.max;
  const ptsWord = n => n + ' ' + (ca() ? (n === 1 ? 'punt' : 'punts') : (n === 1 ? 'point' : 'points'));
  const aiWarning = () => ca() ? '⚠️ ChatGPT es pot equivocar: la seva nota només és orientativa. A l’examen real, el correu el corregeix el professorat.'
    : '⚠️ ChatGPT can make mistakes: its mark is only a guide. In the real exam, your teacher marks the email.';
  // Multiple choice ({q, o}: first option right, shown shuffled) and gaps ({q, a}) in one list, each with its points.
  R.quiz = p => ({
    html: '<div class="section-card">' + mediaHtml(p) + '<div id="' + p.id + 'List"></div><div class="actions"><button class="btn" type="button" id="' + p.id + 'Check">' + (ca() ? 'Comprova' : 'Check') + '</button></div><div class="result" id="' + p.id + 'Result"></div></div>',
    bind() {
      bindAudio(p);
      const items = forLevel(p.items), start = p.start || 1;
      $('#' + p.id + 'List').innerHTML = items.map((q, i) => '<div class="question"><p class="q-title">' + (start + i) + '. ' + q.q + ' <small>[' + ptsWord(ptsOf(p, q)) + ']</small></p>' +
        (q.o ? '<div class="options">' + learningSupport.shuffledIndexes(q.o.length).map(j => '<label class="option"><input type="radio" name="' + p.id + i + '" value="' + j + '"><span>' + q.o[j] + '</span></label>').join('') + '</div>'
             : '<input type="text" class="typed" id="' + p.id + i + '" autocomplete="off" autocapitalize="off" spellcheck="false">') +
        '<div class="feedback" id="' + p.id + 'f' + i + '"></div></div>').join('');
      $('#' + p.id + 'Check').onclick = () => {
        let right = 0, pts = 0;
        items.forEach((q, i) => {
          const fb = $('#' + p.id + 'f' + i);
          let ok;
          if (q.o) {
            const c = document.querySelector('input[name="' + p.id + i + '"]:checked'); ok = !!c && +c.value === 0;
            fb.textContent = learningSupport.evidence(level, ok, c, q.o[0], null, !!(p.media && p.media.audio));
          } else {
            const v = norm($('#' + p.id + i).value), key = p.id + i; ok = q.a.some(a => norm(a) === v);
            if (!ok && v) tries[key] = (tries[key] || 0) + 1;
            fb.innerHTML = ok ? (ca() ? 'Correcte!' : 'Correct!') : !v ? (ca() ? 'Escriu una resposta.' : 'Type an answer.')
              : (ca() ? 'Encara no. ' : 'Not yet. ') + (tries[key] >= 2 ? (ca() ? 'Resposta: ' : 'Answer: ') + '<strong>' + esc(q.a[0]) + '</strong>' : (ca() ? 'Torna-ho a provar.' : 'Try again.'));
          }
          fb.className = 'feedback ' + (ok ? 'ok' : 'no');
          if (ok) { right++; pts += ptsOf(p, q); }
        });
        const tk = p.id + '_' + level;
        firstTry(tk, pts, maxOf(p));
        const done = right >= need(items.length);
        result($('#' + p.id + 'Result'), right, items.length, done, ' · ' + pts + ' / ' + ptsWord(maxOf(p)) + (ca() ? ' (primer intent: ' : ' (first try: ') + state.tries[tk].score + ')');
        if (done) complete(p.id);
        if (LP.onScore) LP.onScore();
      };
    }
  });
  // An open task (for example the sample exam's email): the student writes, then ChatGPT gives feedback and an orientative mark
  // with the criterion's levels; the student can note that mark for the summary.
  function markPrompt(p, text) {
    const lv = { beginners: 'Beginners (A1, amb molt suport)', insecure: 'Insecure (A2 / A2+, amb suport)', safe: 'Safe (B1)', daring: 'Daring (B1 / B1+)' }[level];
    const src = byLevel(p.source || '');
    return (ca() ? 'Actua com a professor d’anglès de 4t d’ESO. És l’EXAMEN D’EXEMPLE (pràctica) de la Learning Situation “Seasons & Celebrations”.' : 'Act as a 4 ESO English teacher. This is the SAMPLE EXAM (practice) of the Learning Situation “Seasons & Celebrations”.') +
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
  function render() {
    const active = ($('.tab.active') || {}).dataset ? $('.tab.active').dataset.panel : LP.panels[0].id;
    $('#lp').innerHTML = trackNote() + '<nav class="tabs" aria-label="Sections">' + LP.panels.map((p, i) => '<button class="tab' + (p.id === active ? ' active' : '') + '" data-panel="' + p.id + '">' + (i + 1) + ' ' + tx(p.tab) + '</button>').join('') + '</nav>' +
      LP.panels.map(p => { const r = R[p.type](p); p._r = r; return '<section class="panel' + (p.id === active ? ' active' : '') + '" id="' + p.id + '"><div class="panel-head"><div><h2>' + tx(p.title) + '</h2><p class="instruction">' + tx(p.intro || '') + '</p>' + '</div>' + (p.pill ? '<span class="pill">' + tx(p.pill) + '</span>' : '') + '</div>' + r.html + '</section>'; }).join('') +
      '<p class="footer-note">' + (ca() ? 'Les respostes i el progrés es desen per a cada ruta.' : 'Your answers and progress are saved for each route.') + '</p>';
    flashcardSet.config = null;
    LP.panels.forEach(p => p._r.bind());
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
