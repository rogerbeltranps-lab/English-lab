/* Web exams (Roger, 17 Nov 2026: "Like the checkpoints, students will do it on the web… if they exit full screen the exam is over, but
   if I want it, I want to be able to allow students to go back to the exam… I introduce a password… it's important that they can check
   their answers before turning in the exam… questions according to their level… randomized… 2 versions of each level").
   The page (e.g. 2eso/free-time-live/exam.html) has window.EL_EXAM (data/exam.js, built by tools/web-exam/build.mjs): the questions of
   four papers (base-A, base-B, core-A, core-B) and NO answers; the key is in cpKeys/{key}.web (teacher only), marked on the dashboard.
   - Starter and Base take the base paper, Core and Plus the core one (the student's route); version A or B comes from the account, so
     classmates get different papers; the questions of each section and the options of each question are shuffled per student.
   - Sections: 🎧 Listening first (the teacher plays the audio twice for the class; once a student presses "Listening finished" those
     answers are locked), then 📖 Reading, 📚 Vocabulary, 🧩 Grammar in any order, and ✅ Review: every answer, blanks in red, before 🏁 Turn in.
   - Full screen. Leaving it (or another tab, window or app for more than 2 s, or closing / reloading the page) STOPS the exam: a lock screen
     with the answers saved. Only the teacher's password opens it again (a PBKDF2 hash in the data, never the password). Each exit saves a
     copy of the answers at that moment (snaps, which firestore.rules never let the student change), and every answer changed after coming
     back is logged (changes), so the dashboard shows whether going out changed anything.
   - The answers save to students/{uid}/exams/{key} as they go (a few seconds after a change), so nothing is lost if a Chromebook dies.
     A student can start only while the teacher has opened the exam for the group (ls/{ls}.webExam[group].open, dashboard 📝 Exams).
   - Page text can't be copied, and nothing from outside can be pasted; students can copy and paste their own text inside their boxes (el-nocopy.js); no marks or answers on the page: the marks reach the student's board when the teacher
     saves them (dashboard → results/{ls}__assessment, as every exam).
   The teacher (and window.EL_EXAM_PREVIEW) sees a preview with every paper and the audio, and nothing is saved. */
(function () {
  const X = window.EL_EXAM; if (!X) return;
  const FS = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
  const SECS = ['listening', 'reading', 'vocabulary', 'grammar', 'writing'];   // writing: free text, marked by the teacher
  const ICON = { listening: '🎧', reading: '📖', vocabulary: '📚', grammar: '🧩', writing: '✍️', review: '✅' };
  const NAME = { listening: ['Listening', 'Listening'], reading: ['Reading', 'Reading'], vocabulary: ['Vocabulari', 'Vocabulary'], grammar: ['Gramàtica', 'Grammar'], writing: ['Writing', 'Writing'], review: ['Revisa i entrega', 'Review and turn in'] };
  const GRACE = 400, FS_GRACE = 300, SAVE_MS = 4000;   // leaving is not allowed at all (Roger, 17 Nov 2026): 0.4 s only covers a stray blur
  const D = document, E = D.documentElement, $ = s => D.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PV = window.EL_EXAM_PREVIEW || null;
  // 📝 on the exam page a student is not moved by class mode, a class game or a pull-up (el-cloud.js reads EL_EXAM_LOCK; Roger, 17 Nov 2026:
  // "Elunei will take the exam during class mode, there mustn't be any problem"). Set before el-cloud.js runs; off on "not open yet" and
  // after turning in, so class mode takes them on again. The page never stays inside class.html (the class full screen): it has its own.
  window.EL_EXAM_LOCK = true;
  try { if (!PV && window.parent !== window && window.frameElement && window.frameElement.id === 'el-shell') window.parent.location.replace(location.href); } catch (e) {}
  let fs = null; const fsLib = async () => PV && PV.fs ? PV.fs : fs || (fs = await import(FS));
  const C = () => window.ELCloud;
  let ca = true; const t = (c, e) => ca ? c : e;
  let S = null, me = null, mode = 'student', off = [], saveT = null, dirty = false, busy = false, lsDoc = null;

  // ---------- helpers ----------
  function hash32(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const paperOf = lvl => (lvl === 'safe' || lvl === 'daring' || lvl === 'native' ? 'core' : 'base');
  const P = () => X.papers[S.paper];
  const pick = (pl, v) => X.papers[pl + '-' + v] ? pl + '-' + v : pl + '-A';   // an exam with one version per level (a make-up) has only -A
  const items = s => P().sections[s] || [];
  const byId = id => { for (const s of SECS) { const it = items(s).find(x => x.id === id); if (it) return it; } return null; };
  const words = v => (String(v || '').trim().match(/[A-Za-zÀ-ÿ’'0-9-]+/g) || []).length;
  const answered = s => items(s).filter(it => String(S.answers[it.id] || '').trim()).length;
  const now = () => new Date().toISOString();
  const fsOk = () => !!(D.fullscreenEnabled || D.webkitFullscreenEnabled);
  const isFull = () => !!(D.fullscreenElement || D.webkitFullscreenElement);
  const goFull = () => { try { if (!fsOk()) return Promise.resolve();
    const lock = () => { try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(() => {}); } catch (e) {} };
    if (isFull()) { lock(); return Promise.resolve(); }
    const r = (E.requestFullscreen || E.webkitRequestFullscreen).call(E); return r && r.then ? r.then(lock, () => {}) : (lock(), Promise.resolve()); } catch (e) { return Promise.resolve(); } };
  const exitFull = () => { try { if (isFull()) (D.exitFullscreen || D.webkitExitFullscreen).call(D); } catch (e) {} };
  const on = (el, ev, f, o) => { el.addEventListener(ev, f, o); off.push(() => el.removeEventListener(ev, f, o)); };
  const unbind = () => { off.forEach(f => f()); off = []; };
  const LK = () => 'el_webexam_' + X.key + '_' + (me ? me.uid : 'preview');
  const local = { get() { try { return JSON.parse(localStorage.getItem(LK()) || 'null'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(LK(), JSON.stringify(v)); } catch (e) {} }, del() { try { localStorage.removeItem(LK()); } catch (e) {} } };

  // ---------- the page ----------
  const root = D.getElementById('exam'); if (!root) return;
  const css = D.createElement('style');
  css.textContent = `
  #exam{max-width:1180px;margin:0 auto;padding:18px 16px 60px}
  .wx-card{background:#fff;border:1px solid #d8e6df;border-radius:18px;padding:18px 20px;box-shadow:0 10px 30px rgba(31,107,82,.08);margin:14px 0}
  .wx-card h2{margin:0 0 10px;color:#174d3d}.wx-card h3{margin:14px 0 6px;color:#174d3d}
  .wx-rules{line-height:1.6;padding-left:20px;margin:6px 0}.wx-warn{background:#fff4e5;border:1px solid #f5b971;border-radius:13px;padding:10px 14px;margin:12px 0}
  .wx-btn{border:0;border-radius:12px;padding:11px 18px;font:inherit;font-weight:800;background:#1f6b52;color:#fff;cursor:pointer}
  .wx-btn.sec{background:#fff;color:#174d3d;border:1px solid #c9dcd2}.wx-btn:disabled{opacity:.45;cursor:default}.wx-btn.red{background:#b42318}
  .wx-run{position:fixed;inset:0;z-index:2147483000;background:#f4f8f6;overflow:auto;display:flex;flex-direction:column}
  .wx-top{position:sticky;top:0;z-index:2;background:#174d3d;color:#fff;padding:8px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
  .wx-top b.wx-t{margin-right:8px;font-size:1.02rem}.wx-tabs{display:flex;flex-wrap:wrap;gap:6px}
  .wx-tab{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:6px 12px;font:inherit;font-weight:700;cursor:pointer}
  .wx-tab.on{background:#fff;color:#174d3d}.wx-tab:disabled{opacity:.45;cursor:not-allowed}.wx-tab small{font-weight:600;opacity:.85}
  .wx-saved{margin-left:auto;font-size:.82rem;opacity:.85}
  .wx-body{max-width:1180px;width:100%;margin:0 auto;padding:16px;box-sizing:border-box;flex:1}
  .wx-sec h2{margin:4px 0 4px;color:#174d3d}.wx-lead{color:#4b5d56;margin:0 0 12px}
  .wx-q{background:#fff;border:1px solid #d8e6df;border-radius:14px;padding:12px 14px;margin:10px 0;scroll-margin-top:80px}
  .wx-q.blank{border-left:5px solid #f59e0b}.wx-q .wx-n{font-weight:800;color:#1f6b52;margin-right:6px}
  .wx-qt{font-weight:650;line-height:1.5;-webkit-user-select:none;user-select:none}
  .wx-opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}
  .wx-opt{border:2px solid #d8e6df;background:#fbfdfc;border-radius:11px;padding:8px 13px;font:inherit;text-align:left;cursor:pointer;color:#20312b}
  .wx-opt.on{border-color:#1f6b52;background:#e2f3ea;font-weight:800}.wx-opt:disabled{cursor:default}
  .wx-in{margin-top:9px;width:100%;max-width:460px;padding:9px 11px;border:2px solid #d8e6df;border-radius:10px;font:inherit;box-sizing:border-box}
  .wx-in:focus{border-color:#1f6b52;outline:none}.wx-in:disabled{background:#f1f5f3}
  .wx-ta{margin-top:9px;width:100%;padding:11px 13px;border:2px solid #d8e6df;border-radius:12px;font:inherit;line-height:1.6;box-sizing:border-box;resize:vertical}
  .wx-ta:focus{border-color:#1f6b52;outline:none}.wx-ta:disabled{background:#f1f5f3}
  .wx-frame{margin-top:9px;background:#f4f8f6;border:1px dashed #9cc3b2;border-radius:10px;padding:8px 12px;line-height:1.6}.wx-ca{margin-top:6px;color:#4b5d56;font-size:.94rem;line-height:1.5;font-style:italic}.wx-wc{margin-top:6px;font-size:.88rem;color:#4b5d56;font-weight:700}
  .wx-read{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:18px;align-items:start}
  .wx-text{position:sticky;top:64px;background:#fff;border:1px solid #d8e6df;border-radius:14px;padding:14px 16px;line-height:1.7;max-height:calc(100vh - 90px);overflow:auto;-webkit-user-select:none;user-select:none}
  .wx-text p{margin:0 0 12px}
  @media(max-width:900px){.wx-read{grid-template-columns:1fr}.wx-text{position:static;max-height:none}}
  .wx-nav{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:16px 0}
  .wx-done{background:#ecfdf3;border:1px solid #86efac;border-radius:12px;padding:10px 14px;margin:10px 0;font-weight:700;color:#166534}
  .wx-rev table{width:100%;border-collapse:collapse;font-size:.95rem}.wx-rev td,.wx-rev th{border-bottom:1px solid #e3ece7;padding:7px 8px;text-align:left;vertical-align:top}
  .wx-rev tr.blank td{background:#fff7ed}.wx-rev .go{border:0;background:none;color:#1f6b52;font-weight:800;cursor:pointer;text-decoration:underline;font:inherit}
  .wx-sum{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 14px}.wx-sum span{background:#fff;border:1px solid #d8e6df;border-radius:12px;padding:8px 12px;font-weight:700}
  .wx-sum span.bad{border-color:#f5b971;background:#fff7ed}
  .wx-sure{background:#fff4e5;border:2px solid #f5b971;border-radius:13px;padding:12px 16px;margin-top:12px}
  .wx-lock{position:fixed;inset:0;z-index:2147483600;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center}
  .wx-lock .box{max-width:560px}.wx-lock h1{font-size:1.8rem;margin:0 0 10px}.wx-lock p{line-height:1.6;color:#dbe4ee}
  .wx-lock input{padding:11px 13px;border-radius:11px;border:0;font:inherit;width:240px;max-width:100%}.wx-lock .err{color:#fca5a5;font-weight:700;min-height:1.4em}
  .wx-veil{position:fixed;inset:0;z-index:2147483500;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;text-align:center;padding:20px}
  .wx-esc{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:3;background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;border-radius:11px;padding:9px 14px;font-weight:700;max-width:90vw}
  .wx-teacher{background:#eef6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 14px;margin:0 0 12px}
  .wx-teacher audio{width:100%;max-width:520px;margin-top:6px}
  .wx-au{background:#fff7ed;border-color:#fdba74}.wx-au .wx-btn{margin-top:8px}.wx-aubar{display:inline-block;vertical-align:middle;width:200px;max-width:40vw;height:10px;border-radius:6px;background:#fed7aa;overflow:hidden;margin:8px 8px 0}.wx-aubar i{display:block;height:100%;width:0;background:#ea580c}
  `;
  D.head.appendChild(css);

  // ---------- start ----------
  function boot() {
    if (PV) { me = { uid: PV.uid || 'preview-uid' }; mode = PV.teacher ? 'teacher' : 'student'; return PV.teacher ? teacherPick() : student(PV.level || 'insecure', PV.group || '2ESOA'); }
    root.innerHTML = '<div class="wx-card"><p>' + t('Carregant…', 'Loading…') + '</p></div>';
    const go = u => { if (!u) return; me = u; const c = C();
      if (c.isTeacher(u) && !c.viewing) { mode = 'teacher'; return teacherPick(); }
      if (c.viewing) { mode = 'view'; me = c.viewing; }
      c.levels().then(lv => student((window.elRouteOf ? elRouteOf(lv, X.ls).level : null) || 'insecure', c.viewing ? c.viewing.group : c.group()))
        .catch(e => { console.warn('exam levels', e); student('insecure', c.group()); }); };
    let n = 0; const wait = () => { const c = C(); if (c && c.onUser) c.onUser(u => u && go(u)); else if (n++ < 120) setTimeout(wait, 500); }; wait();
  }

  // ---------- the cloud ----------
  const ref = F => F.doc(C().db, 'students', me.uid, 'exams', X.key);
  async function readDoc() { if (PV) return PV.doc || null; const F = await fsLib(), s = await F.getDoc(ref(F)); return s.exists() ? s.data() : null; }
  async function readLs() { if (PV) return PV.ls || { webExam: { [S && S.group || '2ESOA']: { open: true } } };
    const F = await fsLib(), s = await F.getDoc(F.doc(C().db, 'ls', X.ls)); return s.exists() ? s.data() : {}; }
  // open for the group; with .only (a make-up exam, Roger 17 Nov 2026: Elunei's LS1 exam) only for the students listed by email
  const isOpen = (l, g) => { const w = (((l || {}).webExam || {})[g] || {}); return !!w.open && (!Array.isArray(w.only) || !!(me && me.email && w.only.includes(String(me.email).toLowerCase()))); };
  const payload = F => ({ ls: X.ls, key: X.key, paper: S.paper, level: S.level, group: S.group || null, order: S.order, answers: S.answers, started: S.started,
    listenDone: S.listenDone || null, status: S.status, exits: S.exits.slice(0, 30), glances: S.glances.slice(-60), changes: S.changes.slice(-300),
    snaps: S.snaps.slice(0, 30), tries: S.tries || 0, plays: S.plays || 0, done: S.done || null, updated: F.serverTimestamp() });
  function keep() { S.at = Date.now(); local.set(S); }
  function touch() { keep(); dirty = true; clearTimeout(saveT); saveT = setTimeout(save, SAVE_MS); mark(t('Desant…', 'Saving…')); }
  async function save() {
    clearTimeout(saveT); saveT = null; if (mode !== 'student') { dirty = false; return mark(''); }
    if (busy) { saveT = setTimeout(save, 1000); return; }
    busy = true; const was = dirty; dirty = false;
    try { const F = await fsLib(); await F.setDoc(ref(F), payload(F)); S.cloudAt = now(); keep(); mark('✓ ' + t('Desat', 'Saved') + ' ' + new Date().toTimeString().slice(0, 5)); busy = false; return true; }
    catch (e) { busy = false; dirty = dirty || was; console.warn('exam save', e);
      if (e && /permission/i.test(String(e.code || e.message))) { try { const l = await readLs(); if (!isOpen(l, S.group) && S.status !== 'done') return closedNow(); } catch (x) {} }
      mark('⚠️ ' + t('No s’ha pogut desar: es tornarà a provar', 'Not saved yet: trying again'), true); saveT = setTimeout(save, 8000); return false; }
  }
  function mark(txt, bad) { const el = $('#wxSaved'); if (el) { el.textContent = txt; el.style.color = bad ? '#fecaca' : ''; } }

  // ---------- the student ----------
  async function student(level, group) {
    ca = paperOf(level) === 'base';
    let d = null, l = null;
    try { [d, l] = await Promise.all([readDoc(), readLs()]); } catch (e) { console.warn('exam read', e); }
    lsDoc = l; const loc = local.get();
    if (mode === 'view') return viewOnly(d);
    if (d && d.status === 'done') { S = Object.assign({}, d); return handedIn(); }
    // started here or on another device: the cloud copy, unless this browser has newer answers that never reached it
    const cloudMs = d && d.updated ? (d.updated.toMillis ? d.updated.toMillis() : Date.parse(d.updated) || 0) : 0;
    const base = loc && loc.started && loc.paper && (!d || (loc.at || 0) > cloudMs) ? loc : d;
    if (base && base.started) {
      S = Object.assign({ exits: [], glances: [], changes: [], snaps: [], answers: {} }, base, { group: base.group || group });
      S.plays = Math.max(+(loc && loc.started === S.started && loc.plays) || 0, +(d && d.plays) || 0);   // listening plays used: never fewer than either copy
      // the exam was running when the page closed or reloaded: that is leaving it, so it locks (a reload in the first seconds with
      // nothing answered, as when the site reloads itself once after signing in, only asks to go back to full screen)
      if (S.status === 'in') {
        const fresh = !Object.keys(S.answers).length && !S.exits.length && Date.now() - Date.parse(S.started) < 20000;
        if (fresh) return resume();
        exitNow('reload'); return;
      }
      return S.status === 'out' ? locked() : resume();
    }
    S = { group, level, paper: null };
    if (!isOpen(l, group) && !PV && !isTester()) return notOpen();   // the tester can try it while it is closed (Roger, 17 Nov 2026)
    intro();
  }
  function notOpen() {
    window.EL_EXAM_LOCK = false;
    root.innerHTML = '<div class="wx-card"><h2>📝 ' + t('L’examen encara no està obert', 'The exam is not open yet') + '</h2><p>' + t('El professor l’obrirà a classe. Quan t’ho digui, prem el botó.', 'Your teacher will open it in class. When they tell you, press the button.') + '</p><button class="wx-btn" id="wxAgain">🔄 ' + t('Torna-ho a mirar', 'Check again') + '</button></div>';
    $('#wxAgain').onclick = async () => { $('#wxAgain').disabled = true; try { lsDoc = await readLs(); } catch (e) {} if (isOpen(lsDoc, S.group)) { window.EL_EXAM_LOCK = true; intro(); } else { $('#wxAgain').disabled = false; $('#wxAgain').textContent = '🔄 ' + t('Encara no. Torna-ho a mirar', 'Not yet. Check again'); } };
  }
  let tPaper = null;   // 🧪 the paper the tester chose
  function intro() {
    if (tPaper) { S.level = tPaper.startsWith('core') ? 'safe' : 'insecure'; ca = tPaper.startsWith('base'); }
    const pl = paperOf(S.level), n = SECS.reduce((a, s) => a + X.papers[pick(pl, 'A')].sections[s].length, 0);
    root.innerHTML = '<div class="wx-card"><h2>📝 ' + t('Examen', 'Exam') + ' · ' + (X.lsShort || 'LS2') + ' · ' + (pl === 'core' ? 'Core' : 'Base') + '</h2>' +
      '<p>' + t('Té 5 parts: <b>🎧 Listening</b> (tots junts, al principi), <b>📖 Reading</b>, <b>📚 Vocabulari</b>, <b>🧩 Gramàtica</b> i <b>✍️ Writing</b> (un text curt). ', 'It has 5 parts: <b>🎧 Listening</b> (all together, at the start), <b>📖 Reading</b>, <b>📚 Vocabulary</b>, <b>🧩 Grammar</b> and <b>✍️ Writing</b> (a short text). ') + t((n - 1) + ' preguntes i un text.', (n - 1) + ' questions and one text.') + '</p>' +
      '<ul class="wx-rules"><li>' + t('El <b>Listening</b> es fa primer: el professor posa l’àudio dues vegades. Quan acabi, prem <b>Listening acabat</b>: després ja no pots canviar aquestes respostes.', '<b>Listening</b> comes first: your teacher plays the audio twice. When it ends, press <b>Listening finished</b>: after that you can’t change those answers.') + '</li>' +
      '<li>' + t('Després pots anar d’una part a l’altra i canviar les respostes tantes vegades com vulguis.', 'Then you can move between the parts and change your answers as often as you like.') + '</li>' +
      '<li>' + t('Al final, a <b>✅ Revisa i entrega</b>, veuràs totes les respostes i les que tens en blanc. Llavors prem <b>🏁 Entrega</b>.', 'At the end, in <b>✅ Review and turn in</b>, you see all your answers and any blanks. Then press <b>🏁 Turn in</b>.') + '</li></ul>' +
      '<div class="wx-warn"><b>⚠️ ' + t('Important', 'Important') + '</b><ul class="wx-rules">' +
      (fsOk() ? '<li><b>' + t('Es fa a pantalla completa.', 'It runs in full screen.') + '</b> ' + t('Si surts de la pantalla completa, <b>l’examen s’acaba</b> i queda bloquejat amb les respostes que tinguis. Només el professor el pot tornar a obrir.', 'If you leave full screen, <b>your exam is over</b> and locks with the answers you have. Only your teacher can open it again.') + '</li>' : '') +
      '<li>' + t('No canviïs de pestanya, de finestra ni d’aplicació, i no tanquis ni recarreguis la pàgina: també <b>acaba l’examen</b>.', 'Don’t change to another tab, window or app, and don’t close or reload the page: that also <b>ends your exam</b>.') + '</li>' +
      '<li>' + t('No es pot copiar ni enganxar res de fora (només el teu propi text dins de les teves respostes). Sense apunts, traductor, IA ni companys.', 'You can’t copy or paste anything from outside (only your own text inside your answers). No notes, translator, AI or classmates.') + '</li>' +
      '<li>' + t('Les respostes es desen soles mentre treballes.', 'Your answers save by themselves as you work.') + '</li></ul></div>' +
      '<label style="display:flex;gap:8px;align-items:center;font-weight:700;margin:12px 0"><input type="checkbox" id="wxRead"> ' + t('He llegit les instruccions', 'I have read the rules') + '</label>' +
      '<button class="wx-btn" id="wxStart" disabled>' + t('Comença l’examen', 'Start the exam') + '</button>' +
      (isTester() ? '<div class="wx-warn" style="background:#eef6ff;border-color:#bfdbfe">🧪 <b>Tester</b>: you can do it while it is closed for the groups. Paper: ' +
        Object.keys(X.papers).map(p => '<button class="wx-btn sec" data-tp="' + p + '" style="margin:3px;padding:6px 11px' + ((tPaper || pick(paperOf(S.level), hash32(String(me.uid) + X.key) % 2 ? 'B' : 'A')) === p ? ';background:#174d3d;color:#fff' : '') + '">' + p.replace('base', 'Base').replace('core', 'Core').replace('-', ' ') + '</button>').join('') +
        '<br><small>Everything works as for a student (full screen, lock, password, saving, turn in, games). Your try shows as 🧪 in the dashboard’s Web exam box, in every group (it is never saved with the marks). 🧪 Tester: start again, at the end, deletes it.</small></div>' : '') + '</div>';
    root.querySelectorAll('[data-tp]').forEach(b => b.onclick = () => { tPaper = b.dataset.tp; intro(); });
    $('#wxRead').onchange = e => { $('#wxStart').disabled = !e.target.checked; };
    if (waitMode()) $('#wxStart').textContent = '⛶ ' + t('Estic a punt: pantalla completa', 'I’m ready: full screen');
    $('#wxStart').onclick = async () => {
      $('#wxStart').disabled = true;
      if (!PV && !isTester()) { try { lsDoc = await readLs(); } catch (e) {} if (!isOpen(lsDoc, S.group)) return notOpen(); }
      if (waitMode() && !goNow) { await goFull(); return waiting(); }
      begin();
    };
  }
  // 📝 Exam mode (Roger, 17 Nov 2026: "all students get pulled up and I explain the rules and then I press start and they can't exit"):
  // while the teacher has exam mode on (ls/{ls}.webExam[group].mode) and has not pressed ▶ Start yet, a student who has read the rules
  // goes to full screen and waits here; ▶ Start (live/{group}.exam.go, read live) starts everyone's exam at once. Arriving after it, the
  // usual Start button. Leaving full screen while waiting changes nothing (the exam has not started): the button takes them back.
  const waitMode = () => { const w = (((lsDoc || {}).webExam || {})[S.group] || {}); return !PV && !isTester() && !!w.mode && !w.go; };
  let liveOff = null, goNow = false;
  async function watchGo() { if (liveOff || PV || !S.group) return;
    try { const F = await fsLib(); liveOff = F.onSnapshot(F.doc(C().db, 'live', S.group), s => { const x = s.exists() ? s.data() : null, e = x && x.exam;
      if (e && e.go && !goNow) { goNow = true; if ($('#wxWait')) { if (!fsOk() || isFull()) begin(); else waiting(); } } }, e => console.warn('exam live', e)); } catch (e) { console.warn('exam live', e); } }
  function waiting() { watchGo();
    const full = !fsOk() || isFull();
    root.innerHTML = '<div class="wx-card" id="wxWait" style="text-align:center"><h2>⏳ ' + (goNow ? t('Ja pots començar!', 'You can start now!') : t('Espera el professor', 'Wait for your teacher')) + '</h2>' +
      '<p>' + (goNow ? t('El professor ha començat l’examen.', 'Your teacher has started the exam.') : t('Quan el professor premi <b>Comença</b>, l’examen començarà sol per a tothom.', 'When your teacher presses <b>Start</b>, the exam starts by itself for everyone.')) + '</p>' +
      (goNow ? '<button class="wx-btn" id="wxGoNow">▶ ' + t('Comença l’examen', 'Start the exam') + '</button>'
        : full ? '<p class="wx-done">✓ ' + t('Estàs a pantalla completa. No en surtis.', 'You are in full screen. Don’t leave it.') + '</p>'
        : '<button class="wx-btn" id="wxBackFs">⛶ ' + t('Torna a la pantalla completa', 'Back to full screen') + '</button>') + '</div>';
    const b = $('#wxBackFs'); if (b) b.onclick = () => goFull().then(waiting);
    const g = $('#wxGoNow'); if (g) g.onclick = () => begin();
  }
  D.addEventListener('fullscreenchange', () => { if ($('#wxWait') && !goNow) waiting(); });
  D.addEventListener('webkitfullscreenchange', () => { if ($('#wxWait') && !goNow) waiting(); });
  async function begin() {
      if (S && S.started) return;
      const pl = paperOf(S.level), v = hash32(String(me.uid) + X.key) % 2 ? 'B' : 'A', paper = PV && PV.paper || tPaper || pick(pl, v);
      const order = {}; SECS.forEach(s => order[s] = X.papers[paper].sections[s].map(x => x.id));   // in the paper's order: the audio's and the text's (Roger, 17 Nov 2026)
      const opts = {}; SECS.forEach(s => X.papers[paper].sections[s].forEach(it => { if (it.t === 'mc') opts[it.id] = shuffle(it.o.map((_, i) => i)); }));
      S = { group: S.group, level: S.level, paper, order, opts, answers: {}, started: now(), status: 'in', sec: 'listening', exits: [], glances: [], changes: [], snaps: [], tries: 0 };
      await goFull(); keep(); run(); save();
  }
  function resume() {   // back in after the password, or a reload in the first seconds: full screen needs a click
    if (fsOk() && !isFull() && !PV) {
      root.innerHTML = '<div class="wx-card"><h2>📝 ' + t('Continua l’examen', 'Go on with the exam') + '</h2><p>' + t('Prem el botó per tornar a la pantalla completa.', 'Press the button to go back to full screen.') + '</p><button class="wx-btn" id="wxBack">⛶ ' + t('Continua a pantalla completa', 'Continue in full screen') + '</button></div>';
      $('#wxBack').onclick = async () => { await goFull(); S.status = 'in'; keep(); run(); save(); };
      return;
    }
    S.status = 'in'; keep(); run();
  }

  // ---------- running ----------
  let wrap = null;
  function run() {
    unbind(); if (wrap) wrap.remove();
    wrap = D.createElement('div'); wrap.className = 'wx-run'; D.body.appendChild(wrap);
    wrap.innerHTML = '<div class="wx-top"><b class="wx-t">📝 ' + t('Examen', 'Exam') + ' ' + (X.lsShort || 'LS2') + ' · ' + (S.paper.startsWith('core') ? 'Core' : 'Base') + '</b><div class="wx-tabs" id="wxTabs"></div><span class="wx-saved" id="wxSaved"></span></div><div class="wx-body" id="wxBody"></div>';
    draw();
    // nothing from the page can be copied, and nothing from outside pasted; inside their own answer boxes students can copy, cut and paste
    // their OWN text (Roger, 17 Nov 2026, as on the rest of the site: el-nocopy.js lets a paste through only when it is text they copied
    // from their boxes on this page). No right-click menu at all in the exam.
    const box = e => !!(e.target && e.target.closest && e.target.closest('.wx-in,.wx-ta'));
    ['copy', 'cut', 'paste', 'drop', 'dragstart'].forEach(ev => on(wrap, ev, e => { if (!box(e)) e.preventDefault(); }));
    on(wrap, 'contextmenu', e => e.preventDefault());
    if (mode !== 'student' && mode !== 'teacher') return;
    if (mode === 'teacher') return;
    // Esc: a warning instead of leaving (Chrome locks it; holding it down still leaves full screen, and that stops the exam)
    on(D, 'keydown', e => { if (e.key !== 'Escape') return; e.preventDefault(); let w = $('.wx-esc'); if (!w) { w = D.createElement('div'); w.className = 'wx-esc'; wrap.appendChild(w); }
      w.innerHTML = '⚠️ ' + t('Si surts de la pantalla completa, l’examen s’acaba. Per acabar, ves a <b>✅ Revisa i entrega</b>.', 'If you leave full screen, your exam is over. To finish, go to <b>✅ Review and turn in</b>.'); setTimeout(() => w && w.remove(), 6000); });
    // Any switch to another tab, window, desktop/Space or app locks the exam (Roger, 17 Nov 2026: a quick swipe to another full-screen
    // window used to count only as a "glance"). A hidden page or a window that loses focus locks if it is not back
    // within 0.4 s (that only absorbs a stray blur/focus flicker, e.g. 0.1 s when full screen comes back; his swipes took 0.7-1.9 s).
    let away = 0, veil = null, wait = null;
    const out = why => { clearTimeout(wait); wait = null; exitNow(why); };
    const leave = full => { if (S.status !== 'in') return; if (away) { if (full) { clearTimeout(wait); wait = setTimeout(() => out('fullscreen'), FS_GRACE); } return; }
      away = Date.now(); veil = D.createElement('div'); veil.className = 'wx-veil'; veil.textContent = t('Torna a l’examen!', 'Come back to the exam!'); D.body.appendChild(veil);
      wait = setTimeout(() => { if (!full && D.hasFocus() && !D.hidden) return back(); out(full ? 'fullscreen' : 'left'); }, full ? FS_GRACE : GRACE); };
    const back = () => { if (!away || S.status !== 'in') return; if (D.hidden || (fsOk() && !isFull())) return; clearTimeout(wait); S.glances.push({ at: new Date(away).toISOString(), ms: Date.now() - away }); away = 0; if (veil) veil.remove(); veil = null; touch(); };
    on(window, 'blur', () => leave(false)); on(D, 'visibilitychange', () => D.hidden ? leave(false) : back()); on(window, 'focus', back);
    const fsc = () => { if (isFull()) back(); else if (fsOk()) leave(true); };
    on(D, 'fullscreenchange', fsc); on(D, 'webkitfullscreenchange', fsc);
    on(window, 'pagehide', () => { if (S.status === 'in') { S.pendingExit = now(); keep(); } });
    off.push(() => { clearTimeout(wait); if (veil) veil.remove(); });
  }
  function tabs() {
    const tb = $('#wxTabs'); if (!tb) return;
    tb.innerHTML = SECS.concat(['review']).map(s => { const dis = s !== 'listening' && !S.listenDone && mode !== 'teacher' && mode !== 'view';
      const cnt = s === 'review' ? '' : ' <small>' + answered(s) + '/' + items(s).length + '</small>';
      return '<button class="wx-tab' + (S.sec === s ? ' on' : '') + '" data-sec="' + s + '"' + (dis ? ' disabled title="' + esc(t('Primer acaba el Listening', 'Finish the Listening first')) + '"' : '') + '>' + ICON[s] + ' ' + NAME[s][ca ? 0 : 1] + cnt + '</button>'; }).join('');
    tb.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => { if (b.disabled) return; S.sec = b.dataset.sec; keep(); draw(); });
  }
  const wcText = (w, min) => '✍️ ' + w + ' words' + (min && w < min ? ' · at least ' + min : ' ✓');   // the writing is in English for every level (Roger, 17 Nov 2026)
  function qHtml(it, i, lockedSec) {
    const v = S.answers[it.id], blank = !String(v || '').trim();
    let body;
    if (it.t === 'mc') { const ord = (S.opts && S.opts[it.id]) || it.o.map((_, k) => k);
      body = '<div class="wx-opts">' + ord.map(k => { const o = it.o[k]; return '<button type="button" class="wx-opt' + (v === o ? ' on' : '') + '" data-q="' + it.id + '" data-v="' + esc(o) + '"' + (lockedSec ? ' disabled' : '') + ' aria-pressed="' + (v === o) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
    else if (it.t === 'write') { const w = words(v);
      body = (it.ca ? '<div class="wx-ca"><b>Català:</b> ' + esc(it.ca) + '</div>' : '') + (it.frame ? '<div class="wx-frame"><b>Frame:</b> ' + esc(it.frame) + '</div>' : '') +
        '<textarea class="wx-ta" data-q="' + it.id + '" maxlength="1500" rows="9" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' + (lockedSec ? ' disabled' : '') + ' aria-label="Your text">' + esc(v || '') + '</textarea>' +
        '<div class="wx-wc" data-wc="' + it.id + '" data-min="' + (it.min || 0) + '">' + wcText(w, it.min) + '</div>'; }
    else body = '<input class="wx-in" type="text" data-q="' + it.id + '" value="' + esc(v || '') + '" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false"' + (lockedSec ? ' disabled' : '') + ' aria-label="' + esc(t('La teva resposta', 'Your answer')) + '">';
    return '<div class="wx-q' + (blank ? ' blank' : '') + '" id="q-' + it.id + '"><div class="wx-qt"><span class="wx-n">' + (i + 1) + '.</span>' + esc(it.q) + '</div>' + body + '</div>';
  }
  function draw(scrollTo) {
    tabs(); const b = $('#wxBody'); const s = S.sec;
    if (s === 'review') return review(b);
    const ids = S.order[s], list = ids.map(id => items(s).find(x => x.id === id)).filter(Boolean), lockL = s === 'listening' && !!S.listenDone && mode !== 'teacher';
    const ro = mode === 'view' || lockL;
    const lead = { listening: selfAu() ? t('Posa l’àudio tu mateix (el pots escoltar ' + X.audio.plays + ' vegades) i tria la resposta correcta.', 'Play the audio yourself (you can listen to it ' + X.audio.plays + ' times) and choose the right answer.')
        : t('Escolta l’àudio (el professor el posa dues vegades) i tria la resposta correcta.', 'Listen to the audio (your teacher plays it twice) and choose the right answer.'),
      reading: t('Llegeix els dos textos i tria la resposta correcta.', 'Read the two texts and choose the right answer.'),
      vocabulary: t('Tria o escriu la paraula que falta. Entre parèntesis tens una pista.', 'Choose or type the missing word. The brackets give you a clue.'),
      grammar: t('Tria o escriu la forma correcta. Si hi ha dos buits (___ … ___), escriu les dues paraules a la casella.', 'Choose or type the right form. With two gaps (___ … ___), type both words in the box.'),
      writing: 'Write your text in the box. Use full sentences and check them before you turn in.' }[s];
    const qs = list.map((it, i) => qHtml(it, i, ro)).join('');
    let html = '<div class="wx-sec"><h2>' + ICON[s] + ' ' + NAME[s][ca ? 0 : 1] + '</h2><p class="wx-lead">' + lead + '</p>';
    if (s === 'listening' && mode === 'teacher' && X.audio) html += '<div class="wx-teacher">🔊 <b>' + esc(X.audio.title) + '</b> · ' + (X.audio.plays ? t('L’alumne el posa ell mateix (' + X.audio.plays + ' vegades com a màxim, sense pausa ni tornar enrere).', 'The student plays it herself or himself (' + X.audio.plays + ' times at most, no pause, no rewind).') : t('Només el veu el professor: posa-ho dues vegades al projector.', 'Only you see this: play it twice on the projector.')) + '<br>' + (X.audio.src ? '<audio controls preload="none" src="' + esc(X.audio.src) + '"></audio>' : '') + (X.audio.link ? ' <a href="' + esc(X.audio.link) + '" target="_blank" rel="noopener">🔊 ' + t('Obre l’àudio', 'Open the audio') + ' ↗</a>' : '') + '</div>';
    if (s === 'listening' && selfAu() && !lockL && mode === 'student') html += auHtml();
    if (lockL) html += '<div class="wx-done">🔒 ' + t('Listening acabat: aquestes respostes ja no es poden canviar.', 'Listening finished: these answers can’t be changed any more.') + '</div>';
    html += s === 'reading' ? '<div class="wx-read"><div class="wx-text">' + P().text + '</div><div>' + qs + '</div></div>' : qs;
    const next = SECS[SECS.indexOf(s) + 1] || 'review';
    html += '<div class="wx-nav">' + (s === 'listening' && !S.listenDone && mode !== 'view'
      ? '<button class="wx-btn" id="wxLDone">✅ ' + t('Listening acabat → continua', 'Listening finished → go on') + '</button><span id="wxLSure"></span>'
      : '<button class="wx-btn" id="wxNext">' + t('Següent', 'Next') + ': ' + ICON[next] + ' ' + NAME[next][ca ? 0 : 1] + ' →</button>') + '</div></div>';
    b.innerHTML = html;
    if (!ro) {
      b.querySelectorAll('.wx-opt').forEach(x => x.onclick = () => { set(x.dataset.q, x.dataset.v); b.querySelectorAll('.wx-opt[data-q="' + x.dataset.q + '"]').forEach(y => { y.classList.toggle('on', y === x); y.setAttribute('aria-pressed', y === x); }); x.closest('.wx-q').classList.remove('blank'); });
      b.querySelectorAll('.wx-in').forEach(x => { x.oninput = () => { set(x.dataset.q, x.value.slice(0, 80)); x.closest('.wx-q').classList.toggle('blank', !x.value.trim()); };
        x.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); const all = [...b.querySelectorAll('.wx-in')], k = all.indexOf(x); if (all[k + 1]) all[k + 1].focus(); } }; });
      b.querySelectorAll('.wx-ta').forEach(x => { x.oninput = () => { set(x.dataset.q, x.value.slice(0, 1500)); x.closest('.wx-q').classList.toggle('blank', !x.value.trim());
        const wc = b.querySelector('[data-wc="' + x.dataset.q + '"]'); if (wc) wc.textContent = wcText(words(x.value), +wc.dataset.min); }; });
    }
    const ab = $('#wxAuGo'); if (ab) ab.onclick = auPlay;
    const nx = $('#wxNext'); if (nx) nx.onclick = () => { S.sec = next; keep(); draw(); wrap.scrollTop = 0; };
    const ld = $('#wxLDone'); if (ld) ld.onclick = () => {
      const left = items('listening').length - answered('listening'), sure = $('#wxLSure');
      ld.hidden = true; sure.innerHTML = '<div class="wx-sure"><p><b>⚠️ ' + t('Has acabat el Listening?', 'Have you finished the Listening?') + '</b><br>' + (left ? t('Tens <b>' + left + '</b> pregunt' + (left === 1 ? 'a' : 'es') + ' en blanc. ', 'You have <b>' + left + '</b> blank question' + (left === 1 ? '' : 's') + '. ') : '') + t('Després ja no podràs canviar aquestes respostes.', 'After this you can’t change these answers.') + '</p><button class="wx-btn sec" id="wxLNo">← ' + t('No, encara no', 'No, not yet') + '</button> <button class="wx-btn" id="wxLYes" disabled>' + t('Sí, continua', 'Yes, go on') + '</button></div>';
      $('#wxLNo').onclick = () => { sure.innerHTML = ''; ld.hidden = false; };
      $('#wxLYes').onclick = () => { auStop(); S.listenDone = now(); S.sec = 'reading'; touch(); draw(); wrap.scrollTop = 0; save(); };
      setTimeout(() => { const y = $('#wxLYes'); if (y) y.disabled = false; }, 1500);
    };
    if (scrollTo) { const q = D.getElementById('q-' + scrollTo); if (q) { q.scrollIntoView({ block: 'center' }); const f = q.querySelector('input,textarea'); if (f && !f.disabled) f.focus(); q.style.boxShadow = '0 0 0 3px #f59e0b'; setTimeout(() => { q.style.boxShadow = ''; }, 1800); } }
  }
  // 🔊 the student plays the listening herself, at most X.audio.plays times, with no pause and no rewind (Roger, 17 Nov 2026: Elunei's
  // make-up exam, alone, with no projector). A play counts as soon as it starts (S.plays, saved, never goes down: firestore.rules);
  // leaving the exam while it plays stops it and that play is used. Only when the exam data has audio.plays and an audio.src.
  let AU = null;
  const selfAu = () => !!(X.audio && X.audio.src && X.audio.plays > 0);
  function auStop() { if (!AU) return; const a = AU; AU = null; try { a.pause(); } catch (e) {} }
  function auHtml() { const max = X.audio.plays, n = S.plays || 0, left = Math.max(0, max - n);
    return '<div class="wx-teacher wx-au" id="wxAu">⚠️ <b>' + t('Només pots posar l’àudio ' + max + ' vegades. Quan comença, no el pots aturar ni tornar enrere.', 'You can only play the audio ' + max + ' times. Once it starts, you can’t pause it or rewind it.') + '</b><br>' +
      '<button class="wx-btn" id="wxAuGo"' + (AU || !left ? ' disabled' : '') + '>' + (AU ? '🔊 ' + t('Sonant… (' + n + ' de ' + max + ')', 'Playing… (' + n + ' of ' + max + ')')
        : left ? '▶ ' + t('Posa l’àudio (' + (n + 1) + ' de ' + max + ')', 'Play the audio (' + (n + 1) + ' of ' + max + ')') : '🔇 ' + t('Ja l’has escoltat ' + max + ' vegades', 'You have listened to it ' + max + ' times')) + '</button>' +
      '<span class="wx-aubar"><i id="wxAuBar"></i></span><span id="wxAuTime"></span></div>'; }
  function auBox() { const b = $('#wxAu'); if (!b) return; const x = D.createElement('div'); x.innerHTML = auHtml(); b.replaceWith(x.firstChild); const g = $('#wxAuGo'); if (g) g.onclick = auPlay; }
  function auPlay() {
    if (AU || (S.plays || 0) >= X.audio.plays || S.status !== 'in' || S.listenDone || mode !== 'student') return;
    const a = new Audio(X.audio.src); a.preload = 'auto'; AU = a;
    S.plays = (S.plays || 0) + 1; touch(); save();
    const mm = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');
    a.ontimeupdate = () => { if (AU !== a) return; const bar = $('#wxAuBar'), tm = $('#wxAuTime'); if (bar && a.duration) bar.style.width = (100 * a.currentTime / a.duration) + '%'; if (tm && a.duration) tm.textContent = mm(a.currentTime) + ' / ' + mm(a.duration); };
    a.onended = () => { if (AU === a) { AU = null; auBox(); } };
    a.onpause = () => { if (AU === a && !a.ended) a.play().catch(() => {}); };   // a headphone or keyboard media key: it goes on
    a.onseeking = () => {};
    try { if (navigator.mediaSession) ['pause', 'stop', 'seekbackward', 'seekforward', 'seekto', 'previoustrack'].forEach(k => { try { navigator.mediaSession.setActionHandler(k, () => {}); } catch (e) {} }); } catch (e) {}
    a.play().then(auBox, e => {   // it never started (no sound file, blocked): that play is given back
      console.warn('exam audio', e); if (AU !== a) return; AU = null; S.plays = Math.max(0, S.plays - 1); touch(); auBox();
      const b = $('#wxAuTime'); if (b) b.textContent = ' ⚠️ ' + t('No s’ha pogut posar. Torna-ho a provar o avisa el professor.', 'It could not play. Try again or tell your teacher.'); });
    auBox();
  }
  function set(id, v) {
    if (S.status !== 'in' || mode === 'view') return;
    const was = S.answers[id] || '';
    if (v === was) return;
    if (S.exits.length) {   // changed after coming back: logged for the teacher (one line per question and visit, the latest value)
      const n = S.exits.length, last = S.changes[S.changes.length - 1];
      if (last && last.id === id && last.n === n) { last.to = v; last.at = now(); }
      else S.changes.push({ id, from: was, to: v, at: now(), n });
    }
    if (v) S.answers[id] = v; else delete S.answers[id];
    touch(); tabs();
  }
  function review(b) {
    const sum = SECS.map(s => { const n = items(s).length, a = answered(s); return '<span class="' + (a < n ? 'bad' : '') + '">' + ICON[s] + ' ' + NAME[s][ca ? 0 : 1] + ': ' + a + '/' + n + '</span>'; }).join('');
    const blanks = SECS.reduce((x, s) => x + items(s).length - answered(s), 0);
    const rows = SECS.map(s => '<tr><th colspan="3">' + ICON[s] + ' ' + NAME[s][ca ? 0 : 1] + (s === 'listening' && S.listenDone ? ' · 🔒' : '') + '</th></tr>' +
      S.order[s].map((id, i) => { const it = items(s).find(x => x.id === id), v = S.answers[id];
        return '<tr class="' + (String(v || '').trim() ? '' : 'blank') + '"><td>' + (i + 1) + '</td><td>' + (it.t === 'write' ? t('El teu text', 'Your text') : esc(it.q)) + '</td><td>' + (String(v || '').trim() ? (it.t === 'write' ? '<b>' + words(v) + ' ' + t('paraules', 'words') + '</b> · <span style="color:#4b5d56">' + esc(String(v).trim().slice(0, 90)) + (String(v).trim().length > 90 ? '…' : '') + '</span>' : '<b>' + esc(v) + '</b>') : '<span style="color:#b45309;font-weight:800">' + t('en blanc', 'blank') + '</span>') +
          (s === 'listening' && S.listenDone && mode !== 'teacher' ? '' : ' <button class="go" data-go="' + s + '|' + id + '">' + t('canvia', 'change') + '</button>') + '</td></tr>'; }).join('')).join('');
    b.innerHTML = '<div class="wx-sec wx-rev"><h2>✅ ' + NAME.review[ca ? 0 : 1] + '</h2><p class="wx-lead">' + t('Revisa totes les respostes. Prem <b>canvia</b> per anar a una pregunta.', 'Check all your answers. Press <b>change</b> to go to a question.') + '</p><div class="wx-sum">' + sum + '</div>' +
      '<table><tbody>' + rows + '</tbody></table>' +
      (mode === 'view' ? '' : '<div class="wx-nav"><button class="wx-btn red" id="wxEnd">🏁 ' + t('Entrega l’examen', 'Turn in the exam') + '</button></div><div id="wxSure"></div>') + '</div>';
    b.querySelectorAll('[data-go]').forEach(x => x.onclick = () => { const [s, id] = x.dataset.go.split('|'); S.sec = s; keep(); draw(id); });
    const end = $('#wxEnd'); if (end) end.onclick = () => {
      end.hidden = true; const sure = $('#wxSure');
      sure.innerHTML = '<div class="wx-sure"><p><b>⚠️ ' + t('Vols entregar l’examen?', 'Turn in your exam?') + '</b><br>' + (blanks ? t('Tens <b>' + blanks + '</b> pregunt' + (blanks === 1 ? 'a' : 'es') + ' en blanc. ', 'You have <b>' + blanks + '</b> blank question' + (blanks === 1 ? '' : 's') + '. ') : t('Has contestat totes les preguntes. ', 'You have answered every question. ')) + t('Quan l’entreguis, ja no el podràs canviar.', 'Once you turn it in, you can’t change it.') + '</p><button class="wx-btn sec" id="wxNo">← ' + t('No, continua', 'No, go on') + '</button> <button class="wx-btn red" id="wxYes" disabled>' + t('Sí, entrega-ho', 'Yes, turn it in') + '</button></div>';
      $('#wxNo').onclick = () => { sure.innerHTML = ''; end.hidden = false; };
      $('#wxYes').onclick = () => turnIn();
      setTimeout(() => { const y = $('#wxYes'); if (y) y.disabled = false; }, 2000);
      $('#wxNo').focus();
    };
  }
  async function turnIn() {
    if (mode === 'teacher') { unbind(); if (wrap) wrap.remove(); wrap = null; exitFull(); return teacherPick(t('Prova acabada: no s’ha desat res.', 'Preview finished: nothing was saved.')); }
    S.status = 'done'; S.done = now(); keep(); unbind();
    const yes = $('#wxYes'); if (yes) { yes.disabled = true; yes.textContent = t('Enviant…', 'Sending…'); }
    const ok = await save();
    if (!ok) { S.status = 'in'; keep(); run(); S.sec = 'review'; draw(); mark('⚠️ ' + t('No s’ha pogut entregar. Comprova la connexió i torna-ho a provar.', 'It couldn’t be turned in. Check the connection and try again.'), true); return; }
    if (wrap) wrap.remove(); wrap = null; exitFull(); handedIn();
  }
  function handedIn() {
    window.EL_EXAM_LOCK = false;
    root.innerHTML = '<div class="wx-card"><h2>✓ ' + t('Examen entregat', 'Exam turned in') + '</h2><p>' + t('Molt bé! Les teves respostes s’han enviat al professor.', 'Well done! Your answers have reached your teacher.') + ' ' + t('Veuràs la nota al teu tauler quan el professor la publiqui.', 'You will see your mark on your board when your teacher shares it.') + '</p>' + testerReset() + '</div><div id="wxGames"></div>';
    bindReset(); games();
  }
  // 🎮 games while the others finish (el-exam-games.js; practice only, points kept in this browser)
  function games() { const g = $('#wxGames'); if (g && X.games && window.ELExamGames) ELExamGames.mount(g, { words: X.games.words, quiz: X.games.quiz, ca, store: 'el_examgames_' + X.key + '_' + (me ? me.uid : 'preview') }); }
  function closedNow() {
    unbind(); if (wrap) wrap.remove(); wrap = null; exitFull(); S.status = 'done'; keep();
    root.innerHTML = '<div class="wx-card"><h2>🔒 ' + t('El professor ha tancat l’examen', 'Your teacher has closed the exam') + '</h2><p>' + t('S’han desat les respostes fins a ', 'Your answers were saved up to ') + esc((S.cloudAt || S.started || '').slice(11, 16)) + '.</p></div>';
  }

  // ---------- leaving: the exam stops and locks ----------
  async function exitNow(why) {
    if (S.status !== 'in' || mode !== 'student') return;
    auStop(); unbind(); const at = S.pendingExit || now(); delete S.pendingExit;
    S.status = 'out'; S.exits.push({ at, why }); S.snaps.push({ at, answers: Object.assign({}, S.answers) });
    keep(); if (wrap) wrap.remove(); wrap = null; locked(); save();
  }
  function locked() {
    auStop(); unbind(); exitFull(); if (wrap) { wrap.remove(); wrap = null; }
    const why = (S.exits[S.exits.length - 1] || {}).why;
    root.innerHTML = '';
    const L = D.createElement('div'); L.className = 'wx-lock';
    L.innerHTML = '<div class="box"><h1>⛔ ' + t('Has sortit de l’examen', 'You left the exam') + '</h1><p>' +
      (why === 'fullscreen' ? t('Has sortit de la pantalla completa.', 'You left full screen.') : why === 'reload' ? t('La pàgina s’ha tancat o recarregat.', 'The page was closed or reloaded.') : t('Has canviat de pestanya, de finestra o d’aplicació.', 'You changed to another tab, window or app.')) + ' ' +
      t('L’examen s’ha aturat i les respostes que tenies s’han desat.', 'Your exam has stopped and the answers you had are saved.') + '</p><p><b>' + t('Aixeca la mà: només el professor pot deixar-te tornar a l’examen.', 'Put your hand up: only your teacher can let you go back to the exam.') + '</b></p>' +
      '<p style="margin-top:18px"><input type="password" id="wxPw" autocomplete="off" placeholder="' + esc(t('Contrasenya del professor', 'Teacher’s password')) + '"> <button class="wx-btn" id="wxPwGo">🔓 ' + t('Torna a l’examen', 'Back to the exam') + '</button></p><p class="err" id="wxPwErr"></p></div>';
    D.body.appendChild(L);
    // when they are back on this page (still locked) the time is logged too, so the teacher sees how long they were really away
    // and how long they then waited for the password (Roger, 17 Nov 2026: "I want to know the time he's been out")
    const seen = () => { const l = S.exits[S.exits.length - 1]; if (!l || l.ret || l.back || D.hidden || !D.hasFocus()) return; l.ret = now(); keep(); save(); };
    on(window, 'focus', seen); on(D, 'visibilitychange', seen); setTimeout(seen, 800);
    const go = async () => { const inp = $('#wxPw'), err = $('#wxPwErr'), btn = $('#wxPwGo'); if (btn.disabled) return;
      if ((S.wait || 0) > Date.now()) { err.textContent = t('Espera uns segons…', 'Wait a few seconds…'); return; }
      btn.disabled = true; err.textContent = '';
      const ok = await checkPw(inp.value); btn.disabled = false;
      if (!ok) { S.tries = (S.tries || 0) + 1; if (S.tries % 3 === 0) S.wait = Date.now() + 20000; touch(); inp.value = ''; err.textContent = t('Contrasenya incorrecta.', 'Wrong password.'); return; }
      const last = S.exits[S.exits.length - 1]; if (last) last.back = now();
      await goFull(); L.remove(); S.status = 'in'; keep(); run(); save(); };
    $('#wxPwGo').onclick = go; $('#wxPw').onkeydown = e => { if (e.key === 'Enter') go(); };
    setTimeout(() => { const i = $('#wxPw'); if (i) i.focus(); }, 50);
  }
  async function checkPw(pw) {
    const p = X.pass; if (!p || !pw) return false;
    try { const enc = new TextEncoder(), k = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const salt = new Uint8Array(p.salt.match(/../g).map(h => parseInt(h, 16)));
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: p.it, hash: 'SHA-256' }, k, 256);
      return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('') === p.h; } catch (e) { console.warn('exam password', e); return false; }
  }

  // ---------- 🎓 class mode on the exam (the class tab) ----------
  // Class mode on the exam day opens this page on the class tab (dashboard cmTarget, or 📝 Exam on the 📋 Today agenda). Here it turns exam
  // mode on for the group (ls/{ls}.webExam[group] and live/{group}.exam, as the dashboard's 📝 Exam mode): every student is taken to the exam,
  // reads the rules and waits in full screen; ▶ Start begins it for everyone, 🔒 Close ends it. A make-up for some students (.only, set on
  // the dashboard) stays as it is. The class audio plays here, on the projector (Roger, 17 Nov 2026: "when I go class mode they should all go").
  const cmGroup = () => { try { const o = JSON.parse(sessionStorage.getItem('el_cm') || 'null'); return o && o.g && Date.now() < o.until ? o.g : null; } catch (e) { return null; } };
  const pageRel = () => location.pathname.split('/').slice(-3).join('/');
  async function classPanel(g, box) {
    const gn = ((window.EL_GROUPS || []).find(x => x.id === g) || {}).name || g;
    const F = await fsLib(), db = C().db, lsRef = F.doc(db, 'ls', X.ls), liveRef = F.doc(db, 'live', g);
    const write = (w, live) => Promise.all([F.setDoc(lsRef, { webExam: { [g]: w } }, { merge: true }), F.setDoc(liveRef, { exam: live }, { merge: true })]);
    let w = {}; try { const d = await F.getDoc(lsRef); w = ((d.exists() ? d.data() : {}).webExam || {})[g] || {}; } catch (e) { console.warn('exam class', e); }
    const fresh = w.at && Date.now() - Date.parse(w.at) < 3 * 3600e3;
    if (!(w.open && w.mode && fresh)) {   // exam mode on for the group, unless it is already on (a reload of this tab, or started)
      const at = new Date().toISOString(), only = w.open && Array.isArray(w.only) ? w.only : null;
      w = { open: true, mode: true, go: null, only, at };
      try { await write(w, { on: true, href: pageRel(), ls: X.ls, only, at: Date.now(), go: null }); } catch (e) { box.innerHTML = '<p class="wx-warn">✗ Exam mode could not start: ' + esc(e.message || e) + '</p>'; return; }
    }
    const draw = msg => {
      const started = !!w.go, au = X.audio && X.audio.src && !X.audio.plays;
      box.innerHTML = '<h2>🎓 ' + esc(gn) + ' · 📝 Exam mode' + (w.only ? ' · ' + w.only.length + ' student' + (w.only.length === 1 ? '' : 's') : '') + '</h2>' +
        (started ? '<p class="wx-done">▶ The exam has started (' + new Date(w.go).toTimeString().slice(0, 5) + '). Students who arrive now press Start themselves.</p>'
          : '<p>Every student of ' + esc(gn) + (w.only ? ' on the list' : '') + ' with the site open is taken to the exam: they read the rules and wait in full screen. Explain the rules, then press <b>▶ Start</b>: it starts for everyone at once.</p>') +
        '<p>' + (started ? '' : '<button class="wx-btn" id="wxCmGo">▶ Start the exam</button> ') + '<button class="wx-btn sec" id="wxCmEnd">🔒 Close the exam</button></p>' +
        (au ? '<div class="wx-teacher">🔊 <b>' + esc(X.audio.title) + '</b> · play it twice on the projector<br><audio controls preload="auto" src="' + esc(X.audio.src) + '"></audio></div>' : '') +
        (msg ? '<p class="wx-warn">' + esc(msg) + '</p>' : '');
      const go = $('#wxCmGo'); if (go) go.onclick = async () => { go.disabled = true; const t = Date.now();
        try { await write(Object.assign({}, w, { go: t }), { on: true, href: pageRel(), ls: X.ls, only: w.only || null, at: Date.parse(w.at) || t, go: t }); w.go = t; draw(); } catch (e) { go.disabled = false; draw('✗ Not started: ' + (e.message || e)); } };
      $('#wxCmEnd').onclick = async () => { if (!confirm('Close the exam for ' + gn + '?\n\nStudents still writing can no longer save. Close it only when everyone has turned in.')) return;
        try { await write({ open: false, mode: false, go: null, only: null, at: new Date().toISOString() }, null); w = {}; box.innerHTML = '<h2>🎓 ' + esc(gn) + ' · 🔒 Exam closed</h2><p>Exam mode is over: class mode goes on as usual.</p>'; } catch (e) { draw('✗ Not closed: ' + (e.message || e)); } };
    };
    draw();
  }

  // ---------- the teacher (preview) and the student view ----------
  function teacherPick(note) {
    ca = false;
    root.innerHTML = '<div class="wx-card"><h2>📝 Exam preview (teacher)</h2>' + (note ? '<p class="wx-done">' + esc(note) + '</p>' : '') +
      '<p>Students see only their own paper: <b>Base</b> for Starter and Base, <b>Core</b> for Core and Plus, version A or B from their account, with the questions in order (as in the audio and the texts) and the options shuffled. Here you can try any paper; nothing is saved. Open and close the exam for each group, and see the answers, on the dashboard (📝 Exams).</p>' +
      '<p>' + Object.keys(X.papers).map(p => '<button class="wx-btn sec" data-p="' + p + '" style="margin:4px">' + p.replace('base', 'Base').replace('core', 'Core').replace('-', ' ') + '</button>').join('') + '</p>' +
      '<p><button class="wx-btn sec" id="wxTryLock">🧪 Try the lock screen (your password)</button>' + (X.games ? ' <button class="wx-btn sec" id="wxTryGames">🎮 Try the games (after turning in)</button>' : '') + '</p></div><div id="wxGames"></div>';
    const tg = $('#wxTryGames'); if (tg) tg.onclick = () => { tg.disabled = true; games(); $('#wxGames').scrollIntoView({ behavior: 'smooth' }); };
    const cg = !PV && cmGroup(); if (cg && !$('#wxCm')) { const box = D.createElement('div'); box.className = 'wx-card'; box.id = 'wxCm'; box.style.borderColor = '#4338ca'; box.innerHTML = '<p>Loading exam mode…</p>'; root.prepend(box); classPanel(cg, box).catch(e => { box.innerHTML = '<p class="wx-warn">✗ ' + esc(e.message || e) + '</p>'; }); }
    root.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { const paper = b.dataset.p;
      const order = {}; SECS.forEach(s => order[s] = X.papers[paper].sections[s].map(x => x.id));   // in the paper's order: the audio's and the text's (Roger, 17 Nov 2026)
      const opts = {}; SECS.forEach(s => X.papers[paper].sections[s].forEach(it => { if (it.t === 'mc') opts[it.id] = shuffle(it.o.map((_, i) => i)); }));
      S = { paper, level: paper.startsWith('core') ? 'safe' : 'insecure', order, opts, answers: {}, started: now(), status: 'in', sec: 'listening', exits: [], glances: [], changes: [], snaps: [] };
      ca = paper.startsWith('base'); run(); });
    $('#wxTryLock').onclick = () => { S = S || { exits: [], answers: {} }; S.exits = [{ at: now(), why: 'fullscreen' }]; S.status = 'out'; ca = false;
      locked(); const L = $('.wx-lock .box'); const x = D.createElement('p'); x.innerHTML = '<button class="wx-btn sec" id="wxLockOut">Close this test</button>'; L.appendChild(x);
      $('#wxLockOut').onclick = () => { $('.wx-lock').remove(); teacherPick(); };
      const go = $('#wxPwGo'); go.onclick = async () => { const ok = await checkPw($('#wxPw').value); $('#wxPwErr').textContent = ok ? '✓ Right password: the student would go back to the exam.' : 'Wrong password.'; $('#wxPwErr').style.color = ok ? '#86efac' : ''; }; };
  }
  function viewOnly(d) {
    if (!d) { root.innerHTML = '<div class="wx-card"><p>👁 ' + t('Aquest alumne encara no ha començat l’examen.', 'This student has not started the exam.') + '</p></div>'; return; }
    S = Object.assign({ exits: [], glances: [], changes: [], snaps: [], answers: {} }, d); S.sec = 'review'; ca = S.paper.startsWith('base');
    root.innerHTML = '<div class="wx-card"><p>👁 Student view · ' + esc(S.paper) + ' · ' + esc(S.status) + '</p></div>'; run();
  }
  const isTester = () => !!(!PV && C() && C().user && C().isTester(C().user));
  const testerReset = () => isTester() || (PV && PV.tester) ? '<p><button class="wx-btn sec" id="wxReset">🧪 Tester: start again</button></p>' : '';
  function bindReset() { const b = $('#wxReset'); if (!b) return;
    b.onclick = async () => { try { if (!PV) { const F = await fsLib(); await F.deleteDoc(ref(F)); } } catch (e) { console.warn(e); } local.del(); S = { group: S.group, level: S.level }; intro(); }; }
  // the lock screen of a student who never came back also offers the tester reset
  window.ELWebExam = { get state() { return S; }, exitNow, checkPw, save };
  boot();
})();
