/* Study guide in each Learning Path (Roger, 30–31 Oct 2026, thread "Add an exam study guide to each Learning Path").
   A folded card under "My goal" with evidence-based study tips, a spaced plan, what comes up in the next checkpoint and the final exam,
   and practice with an answer key: one block that works like the secure checkpoint (shared/js/el-checkpoint.js: one question at a time,
   a timer, no going back; then the answers next to the key) and blocks in the exam format (four options, the first right, and gaps, with
   points). Practice only: nothing is sent or saved. Never say that checkpoints are assessed.
   Content: data/study/<page>.js sets window.LP.study = {
     next: 2, covers: {ca, en}, exam: {ca, en}, today: {ca, en},
     check: [...], listen: {audio | video, items}, read: {text: {insecure, safe}, items}, vocab: [...], grammar: [...],
     native: {check, listen, vocab, grammar}   // the Pro route (4 ESO), C2 Proficiency tasks, replaces the lists above
   }
   An item is [route, question, answer, why]: route '' (every route), 'insecure', 'safe' or 'daring' (cumulative, as in the Learning Paths);
   answer is a string (a gap; 'a|b' accepts both) or an array of four options (multiple choice, the first is right);
   why is a string or [Catalan, English] (Starter and Base read the Catalan). Called from ls2-engine.js (both courses). */
window.ELStudy = (function () {
  const ROUTES = ['beginners', 'insecure', 'safe', 'daring', 'native'];
  let api = null, timer = null;
  const $ = s => document.querySelector(s);
  const ca = () => api.ca(), t = (c, e) => ca() ? c : e, tx = o => o == null ? '' : typeof o === 'string' ? o : (ca() ? (o.ca || o.en) : (o.en || o.ca));
  const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pts = n => n + ' ' + t(n === 1 ? 'punt' : 'punts', n === 1 ? 'point' : 'points');
  const item = a => ({ r: a[0] || 'beginners', q: a[1], o: Array.isArray(a[2]) ? a[2] : null, a: Array.isArray(a[2]) ? [a[2][0]] : String(a[2]).split('|'), why: Array.isArray(a[3]) ? { ca: a[3][0], en: a[3][1] } : a[3] });
  const mine = list => (list || []).map(item).filter(x => ROUTES.indexOf(x.r) <= ROUTES.indexOf(api.level()));
  const native = () => api.level() === 'native' && api.LP.study.native;
  const src = k => native() ? native()[k] : api.LP.study[k];

  const TIPS = [
    ['🧠', ['Posa’t a prova, no rellegeixis', 'Test yourself, don’t reread'], ['Tanca els apunts i intenta recordar: escriu les paraules, digues la regla, respon les preguntes. Després comprova-ho. Rellegir i subratllar sembla útil, però recordes molt menys.', 'Close your notes and try to remember: write the words, say the rule, answer the questions. Then check. Rereading and highlighting feel useful, but you remember much less.'], 'Retrieval practice · Roediger & Karpicke 2006; Dunlosky et al. 2013'],
    ['📅', ['Reparteix l’estudi', 'Spread it out'], ['Tres sessions curtes de 15 minuts en dies diferents funcionen millor que una sessió llarga el dia abans.', 'Three short sessions of 15 minutes on different days work better than one long session the day before.'], 'Spacing · Cepeda et al. 2006'],
    ['🔀', ['Barreja', 'Mix it up'], ['Practica coses que s’assemblen juntes, així aprens a triar quina va a cada frase.', 'Practise similar things together so you learn to choose the right one for each sentence.'], 'Interleaving · Rohrer & Taylor 2007'],
    ['✅', ['Corregeix de seguida', 'Check and fix at once'], ['Mira les solucions just després i torna a escriure bé cada resposta que has fallat.', 'Mark your answers with the key straight away and write each wrong answer again, correctly.'], 'Feedback · Hattie & Timperley 2007'],
    ['💬', ['Digues per què', 'Say why'], ['Per a cada resposta, digues la raó: «on, perquè és una data». Explicar-ho fa que la regla es quedi.', 'For every answer, say the reason: “on, because it’s a date.” Explaining makes the rule stick.'], 'Self-explanation · Dunlosky et al. 2013'],
    ['😴', ['Dorm bé', 'Sleep on it'], ['El cervell guarda el que aprens mentre dorms. Una petita prova i dormir bé és millor que estudiar fins tard la nit abans.', 'Your brain stores what you learn while you sleep. A short self-test and a good night’s sleep beat studying late the night before.'], 'Sleep and memory · Diekelmann & Born 2010']
  ];
  const KIND = {
    check: () => [t('Practica per al Checkpoint ', 'Practise for Checkpoint ') + api.LP.study.next, t('Una pregunta cada vegada · 45 s', 'One question at a time · 45 s')],
    listen: () => [t('Com a l’examen: Listening', 'Like the exam: Listening'), null],
    read: () => [t('Com a l’examen: Reading', 'Like the exam: Reading'), null],
    vocab: () => [t('Com a l’examen: Vocabulary', 'Like the exam: Vocabulary'), t('1 punt · buits 2 punts', '1 point · gaps 2 points')],
    grammar: () => [t('Com a l’examen: Grammar', 'Like the exam: Grammar'), t('1 punt · buits 2 punts', '1 point · gaps 2 points')]
  };
  const INTRO = {
    listen: () => t('Escolta l’àudio d’aquest Learning Path una vegada sense mirar les preguntes. Després llegeix-les i torna’l a escoltar.', 'Listen to the recording from this Learning Path once without the questions. Then read the questions and listen again.'),
    read: () => t('Llegeix el text i tria la resposta correcta.', 'Read the text and choose the right answer.'),
    vocab: () => t('Tria la paraula correcta o escriu-la.', 'Choose the right word, or type it.'),
    grammar: () => t('Tria la forma correcta o escriu-la.', 'Choose the right form, or type it.')
  };
  const wt = (k, x) => k === 'listen' || k === 'read' ? 2 : x.o ? 1 : 2;

  function css() {
    if (document.getElementById('elStudyCss')) return;
    document.head.insertAdjacentHTML('beforeend', '<style id="elStudyCss">.study-card summary{display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;font-weight:800;color:var(--dark);font-size:1.05rem}.study-card summary small{color:var(--muted);font-weight:600}.study-card[open] summary small{display:none}.study-card h3{margin:18px 0 8px;color:var(--dark)}.study-card .model{font-weight:500;line-height:1.6}.study-tips{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}.study-tips p{margin:6px 0 0}.study-plan{margin:0;padding-left:20px;line-height:1.6}.study-block{margin-top:18px;padding-top:14px;border-top:1px dashed var(--line)}.study-bar{height:8px;border-radius:9px;background:#e8eef7;overflow:hidden;margin:6px 0 4px}.study-bar i{display:block;height:100%;background:var(--accent);transition:width .25s linear}.study-bar i.low{background:#d97706}.study-q{font-size:1.1rem;font-weight:700;margin:10px 0 12px}.study-review{margin:10px 0 0;padding-left:32px;line-height:1.5}.study-review li{margin:0 0 8px}.study-review li.ok{color:#166534}.study-review li.no{color:#9f1239}.study-review .tiny{color:var(--muted)}.study-key{margin:10px 0 0;padding:12px 12px 12px 32px;background:#f3f8ff;border:1px solid var(--line);border-radius:12px;line-height:1.6}.study-media{width:100%;margin:6px 0 10px;border-radius:12px}</style>');
  }

  function html(a) {
    api = a; const d = api.LP.study; if (!d) return ''; css();
    const n = d.next, nat = native();
    const plan = [
      [t('Avui', 'Today'), t('Tanca aquesta pàgina i escriu de memòria: ', 'Close this page and write from memory: ') + tx(d.today) + t('. Després comprova-ho.', '. Then check.')],
      [t('D’aquí a 2–3 dies', 'In 2–3 days'), t('Fes «Practica per al Checkpoint ' + n + '» aquí sota. Mira les solucions i torna a escriure el que has fallat.', 'Do “Practise for Checkpoint ' + n + '” below. Look at the key and write again what you got wrong.')],
      [t('Abans del Checkpoint ' + n, 'Before Checkpoint ' + n), t('Repassa amb les targetes (flashcards) només les paraules que encara falles.', 'Go over the flashcards: only the ones you still miss.')],
      [t('La setmana abans de l’examen', 'The week before the exam'), t('Fes la pràctica tipus examen de cada Learning Path i després el Sample exam. Repeteix només el que has fallat.', 'Do the exam-style practice in every Learning Path, then the Sample exam. Repeat only the parts you failed.')]
    ];
    const coming = '<strong>Checkpoint ' + n + '</strong> (' + tx(d.covers) + '): ' +
      (nat ? 'short gaps, collocations and word formation' : t('frases curtes amb un buit', 'short gaps')) + t(', una pregunta cada vegada, uns 45 segons per a cada una, sense tornar enrere i sense apunts. El fas una sola vegada i t’has de quedar a la pàgina: si en surts, s’envia. Quan l’acabis, s’obrirà el següent Learning Path.',
        ', one question at a time, about 45 seconds each, no going back and no notes. You do it once, and you must stay on the page: if you leave it, it is sent. It opens the next Learning Path.') +
      '<br><strong>' + t('Examen final', 'Final exam') + '</strong>: ' + tx(nat && d.native.exam ? d.native.exam : d.exam);
    const blocks = ['check', 'listen', 'read', 'vocab', 'grammar'].filter(k => { const s = src(k); return s && mine(Array.isArray(s) ? s : s.items).length; });
    return '<details class="section-card study-card"><summary><span>📚 ' + t('Guia d’estudi: prepara el Checkpoint ' + n + ' i l’examen final', 'Study guide: prepare for Checkpoint ' + n + ' and the final exam') + '</span><small>' + t('Obre la guia', 'Open the guide') + '</small></summary>' +
      '<p class="instruction">' + t('Com estudiar el que aprens en aquest Learning Path, i pràctica que funciona com el checkpoint i s’assembla a l’examen. Cada activitat té les solucions al final.', 'How to study what you learn in this Learning Path, and practice that works like the checkpoint and looks like the exam. The answer key is at the end of each activity.') + '</p>' +
      '<h3>' + t('Com estudiar', 'How to study') + '</h3><div class="study-tips">' + TIPS.map(x => '<div class="mini-card"><strong>' + x[0] + ' ' + t(x[1][0], x[1][1]) + '</strong><p>' + t(x[2][0], x[2][1]) + '</p><p class="tiny">' + x[3] + '</p></div>').join('') + '</div>' +
      '<h3>' + t('El meu pla', 'My plan') + '</h3><ol class="study-plan">' + plan.map(r => '<li><strong>' + r[0] + '</strong> · ' + r[1] + '</li>').join('') + '</ol>' +
      '<h3>' + t('Què et trobaràs', 'What comes up') + '</h3><div class="model">' + coming + '</div>' +
      blocks.map(k => block(k)).join('') + '</details>';
  }

  function block(k) {
    const s = src(k), items = mine(Array.isArray(s) ? s : s.items), id = 'study_' + k, [title, pill0] = KIND[k]();
    const pill = pill0 || (items.length + ' × ' + pts(2));
    const intro = k === 'check' ? t('Funciona com el checkpoint de veritat: ' + items.length + ' preguntes, una cada vegada, uns 45 segons per a cada una, sense tornar enrere i sense apunts. És només pràctica: no s’envia res, la pots repetir i al final veus les teves respostes i les solucions.',
      'It works like the real checkpoint: ' + items.length + ' questions, one at a time, about 45 seconds each, with no going back and no notes. This is only practice: nothing is sent, you can repeat it, and at the end you see your answers and the key.') : INTRO[k]();
    const media = s.audio ? '<audio class="study-media" controls preload="none" src="' + s.audio + '"></audio>' : s.video ? '<video class="study-media" controls preload="none" src="' + s.video + '"></video>' : '';
    const text = s.text ? '<div class="reading">' + (typeof s.text === 'string' ? s.text : (s.text[api.level()] || (api.level() === 'beginners' ? s.text.insecure : s.text.safe) || s.text.insecure)) + '</div>' : '';
    const q = (x, i) => '<div class="question"><p class="q-title">' + (i + 1) + '. ' + x.q + ' <small>[' + pts(wt(k, x)) + ']</small></p>' +
      (x.o ? '<div class="options">' + learningSupport.shuffledIndexes(x.o.length).map(j => '<label class="option"><input type="radio" name="' + id + i + '" value="' + j + '"><span>' + x.o[j] + '</span></label>').join('') + '</div>'
           : '<input type="text" class="typed" id="' + id + i + '" autocomplete="off" autocapitalize="off" spellcheck="false">') + '<div class="feedback" id="' + id + 'f' + i + '"></div></div>';
    return '<div class="study-block" id="' + id + '"><div class="panel-head"><div><h3>' + title + '</h3><p class="instruction">' + intro + '</p></div><span class="pill">' + pill + '</span></div>' + media + text +
      (k === 'check' ? '<div class="study-mock" id="' + id + 'Mock"></div>' : items.map(q).join('') +
        '<div class="actions"><button class="btn" type="button" data-study-check="' + k + '">' + t('Comprova', 'Check') + '</button><button class="btn secondary" type="button" data-study-key="' + k + '">' + t('Mostra les solucions', 'Show the answer key') + '</button></div>' +
        '<div class="result" id="' + id + 'Result"></div><ol class="study-key" id="' + id + 'Key" hidden>' + items.map(x => '<li><strong>' + esc(x.a[0]) + '</strong>' + (x.why ? ' · ' + tx(x.why) : '') + '</li>').join('') + '</ol>') + '</div>';
  }

  function bind(a) {
    api = a; clearInterval(timer); if (!api.LP.study) return;
    ['listen', 'read', 'vocab', 'grammar'].forEach(k => {
      const b = $('[data-study-check="' + k + '"]'); if (!b) return;
      const s = src(k), items = mine(Array.isArray(s) ? s : s.items), id = 'study_' + k;
      b.onclick = () => {
        let right = 0, got = 0, max = 0;
        items.forEach((x, i) => {
          const fb = $('#' + id + 'f' + i), w = wt(k, x); let ok;
          if (x.o) { const c = document.querySelector('input[name="' + id + i + '"]:checked'); ok = !!c && +c.value === 0; }
          else ok = x.a.some(v => norm(v) === norm($('#' + id + i).value));
          fb.textContent = ok ? t('Correcte!', 'Correct!') : t('Encara no: mira les solucions.', 'Not yet: check the answer key.');
          fb.className = 'feedback ' + (ok ? 'ok' : 'no'); max += w; if (ok) { right++; got += w; }
        });
        const r = $('#' + id + 'Result'); r.textContent = right + ' / ' + items.length + ' · ' + got + ' / ' + pts(max); r.classList.add('show');
      };
      $('[data-study-key="' + k + '"]').onclick = () => { const el = $('#' + id + 'Key'); el.hidden = !el.hidden; };
    });
    if ($('#study_checkMock')) mock(mine(src('check')));
  }

  // A rehearsal of the secure checkpoint: one question at a time, 45 s each, no going back; then the answers next to the key, repeatable.
  function mock(items) {
    const box = $('#study_checkMock'), secs = 45;
    const start = () => {
      const order = learningSupport.shuffledIndexes(items.length), ans = []; let i = 0, at = 0;
      const ask = () => {
        clearInterval(timer);
        if (i >= order.length) return end(order, ans);
        const x = items[order[i]];
        box.innerHTML = '<p class="tiny">' + t('Pregunta ', 'Question ') + (i + 1) + ' / ' + order.length + '</p><div class="study-bar"><i style="width:100%"></i></div>' +
          '<p class="study-q">' + x.q + '</p><input type="text" class="typed" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="' + t('La teva resposta', 'Your answer') + '">' +
          '<div class="actions"><button class="btn" type="button">' + (i === order.length - 1 ? t('Acaba', 'Finish') : t('Següent →', 'Next →')) + '</button></div>';
        const inp = box.querySelector('input'), bar = box.querySelector('.study-bar i');
        const next = () => { if (ans.length > i) return; ans.push(inp.value.trim()); i++; ask(); };
        box.querySelector('button').onclick = next; inp.onkeydown = e => { if (e.key === 'Enter') next(); };
        inp.focus({ preventScroll: true }); at = Date.now();
        timer = setInterval(() => { if (!document.body.contains(bar)) return clearInterval(timer); const l = secs * 1000 - (Date.now() - at); bar.style.width = Math.max(0, l / (secs * 10)) + '%'; bar.classList.toggle('low', l < 10000); if (l <= 0) next(); }, 250);
      };
      ask();
    };
    const end = (order, ans) => {
      let right = 0;
      const rows = order.map((n, k) => { const x = items[n], ok = x.a.some(v => norm(v) === norm(ans[k])); if (ok) right++;
        return '<li class="' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓ ' : '✗ ') + x.q + '<br><span class="tiny">' + t('La teva resposta: ', 'Your answer: ') + (ans[k] ? esc(ans[k]) : '–') + (ok ? '' : ' · <strong>' + esc(x.a[0]) + '</strong>') + (x.why ? ' · ' + tx(x.why) : '') + '</span></li>'; }).join('');
      box.innerHTML = '<div class="result show">' + right + ' / ' + order.length + '</div><ol class="study-review">' + rows + '</ol>' +
        '<div class="actions"><button class="btn secondary" type="button">' + t('Torna-ho a fer (en un altre ordre)', 'Do it again (in a new order)') + '</button></div>';
      box.querySelector('button').onclick = start;
    };
    box.innerHTML = '<div class="actions"><button class="btn" type="button">' + t('Comença la pràctica', 'Start the practice') + '</button></div>';
    box.querySelector('button').onclick = start;
  }

  return { html, bind };
})();
