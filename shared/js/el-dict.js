// 🔍 Dictionary on the learning path steps (🔍, not 📖: 📖 is Books in the menu) (Roger, 12 Nov 2026: "és possible que els alumnes tinguin una pantalla emergent en els SLP on
// puguin buscar paraules i traduccions de l'anglès?"). Loaded by el-app.js on LS2 learning paths (not LS1, recall checkpoints, the sample
// exam, the final product or Reflect). A 🔍 button bottom right (above the account bar) opens a small window: the student types a word (English or Catalan) or
// double-clicks a word on the page.
//  1. This LS's word list first (every vocabulary panel of every learning path of the LS, from its data/*.js: English, Catalan, example).
//  2. Then, if the word isn't there (or "More meanings"), free online sources, no key, nothing paid, no Claude: Google Translate's free
//     endpoint (the same one the announcements use) for the translation, and dictionaryapi.dev for a short English meaning.
// It never gives answers away: words, phrasal verbs or short expressions only (max 4 words online; up to 6 when the expression is on the
// LS's list; 60 characters); hidden on Recall steps ("No notes"); a Catalan
// word whose English is an answer of an activity on this page shows "Try it yourself first" instead. Chrome page translate and
// copy/paste stay blocked (el-nocopy.js). Nothing is saved in the cloud; the last 8 lookups stay in this browser (el_dict_recent).
(function () {
  if (window.ELDict) return;
  var MODE = 'both';   // 'both': EN ↔ CA, LS list + online · 'en-ca': English → Catalan only · 'ls': this LS's word list only
  var d = document, path = location.pathname, here = path.split('/').pop() || 'index.html';
  var base = path.slice(0, path.lastIndexOf('/') + 1);
  if (!/\/(?:2|4)eso\/[^/]+\/[^/]+\.html$/.test(path) || /\/my-real-routine\//.test(path)) return;
  if (/^(recall-checkpoint-\d+|sample-exam|reflect)\.html$/.test(here)) return;
  var ELD = window.ELDict = { words: [], answers: [] };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ca = function () { return d.documentElement.classList.contains('el-ca'); };
  var t = function (c, e) { return ca() ? c : e; };
  // lower case, straight apostrophes, no accents for matching, no punctuation at the ends
  var norm = function (s) { return String(s || '').toLowerCase().replace(/[’‘`´]/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9'·\- ]+/g, ' ').replace(/\s+/g, ' ').trim(); };
  var bare = function (s) { return norm(s).replace(/^(to|a|an|the|el|la|els|les|un|una|l')\s+/, '').replace(/^l'/, ''); };
  // "win / lose a match", "autumn (UK) / fall (US)", "càlid, calent" → the forms a student might type
  var forms = function (s) { var o = [norm(s)]; String(s || '').replace(/\([^)]*\)/g, ' ').split(/\s*[\/,;]\s*/).forEach(function (x) { x = norm(x); if (x && o.indexOf(x) < 0) o.push(x); }); return o; };

  // ---- the LS's words and this page's answers, from the data files (static files: no Firestore reads) ----
  function run(src) {   // a data file sets window.LP and sometimes keeps lists in top-level consts (4 ESO Getting started)
    var names = []; src.replace(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm, function (m, n) { if (names.indexOf(n) < 0) names.push(n); });
    var w = {};
    try { return new Function('window', src + '\n;return {LP: window.LP, more: {' + names.map(function (n) { return n + ': typeof ' + n + ' === "undefined" ? null : ' + n; }).join(',') + '}};')(w); }
    catch (e) { return { LP: w.LP || null, more: {} }; }
  }
  function walk(o, fn, seen) {
    if (!o || typeof o !== 'object') return; seen = seen || []; if (seen.indexOf(o) >= 0) return; seen.push(o);
    if (Array.isArray(o)) { o.forEach(function (x) { walk(x, fn, seen); }); return; }
    fn(o); Object.keys(o).forEach(function (k) { walk(o[k], fn, seen); });
  }
  function harvest(data, lp) {
    walk(data, function (o) {
      if (!Array.isArray(o.items)) return;
      o.items.forEach(function (it) {
        if (!Array.isArray(it) || typeof it[0] !== 'string' || typeof it[1] !== 'string') return;
        var k = norm(it[0]) + '|' + norm(it[1]);
        if (ELD.words.some(function (w) { return w.k === k; })) return;
        ELD.words.push({ k: k, en: it[0], ca: it[1], ex: typeof it[2] === 'string' ? it[2] : '', lp: lp, ef: forms(it[0]), cf: forms(it[1]) });
      });
    });
  }
  function answers(data) {
    walk(data, function (o) {
      var a = o.a != null ? o.a : o.answer;
      (Array.isArray(a) ? a : [a]).forEach(function (x) { if (typeof x === 'string' && x.trim()) { var b = bare(x); if (b && ELD.answers.indexOf(b) < 0) ELD.answers.push(b); } });
    });
  }
  var loaded = fetch(base + 'ls2-engine.js').then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; }).then(function (eng) {
    var pages = [], re = /\['([\w-]+\.html)',\s*'(\d+)\s*·\s*([^']*)'\]/g, m;
    while ((m = re.exec(eng))) pages.push({ f: m[1], n: +m[2], fp: /final product/i.test(m[3]) });
    var me = pages.filter(function (p) { return p.f === here; })[0];
    if (!pages.length || !me || me.fp) return false;   // not a learning path of an LS2-engine LS (or its final product)
    return Promise.all(pages.map(function (p) {
      return fetch(base + 'data/' + p.f.replace(/\.html$/, '.js')).then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
    })).then(function (srcs) {   // in the LS's order, so a word is labelled with the first learning path that has it
      srcs.forEach(function (src, i) { if (!src) return; var x = run(src); harvest(x, pages[i].n); if (pages[i].f === here) answers(x); });
      if (window.LP) answers(window.LP); return true;
    });
  });

  // ---- looking a word up ----
  function stems(q) { var o = [q]; [[/ies$/, 'y'], [/(ss|sh|ch|x|o)es$/, '$1'], [/s$/, ''], [/ing$/, ''], [/ing$/, 'e'], [/ed$/, ''], [/ed$/, 'e'], [/(.)\1ing$/, '$1'], [/(.)\1ed$/, '$1']].forEach(function (r) { if (r[0].test(q)) { var s = q.replace(r[0], r[1]); if (s.length > 1 && o.indexOf(s) < 0) o.push(s); } }); return o; }
  function inList(q) {
    var n = norm(q), st = stems(n), out = [];
    ELD.words.forEach(function (w) {
      var score = 0;
      if (w.ef.indexOf(n) >= 0) score = 5; else if (w.cf.indexOf(n) >= 0) score = 4;
      else if (st.some(function (s) { return w.ef.indexOf(s) >= 0; })) score = 3;
      else if (n.length > 2 && (' ' + w.ef[0] + ' ').indexOf(' ' + n + ' ') >= 0) score = 2;
      else if (n.length > 2 && (' ' + w.cf[0] + ' ').indexOf(' ' + n + ' ') >= 0) score = 1;
      if (score) out.push({ w: w, s: score, dir: score === 4 || score === 1 ? 'ca' : 'en' });
    });
    return out.sort(function (a, b) { return b.s - a.s || a.w.en.length - b.w.en.length; }).slice(0, 4);
  }
  // an answer of this page, or one inside it ("spend" in "spend time + -ing", "hot" in "It's hot"); short grammar words don't count inside
  var SMALL = ['is', 'are', 'am', 'was', 'were', 'be', 'do', 'does', 'did', 'has', 'have', 'had', 'can', 'not', "don't", "doesn't", "isn't", "aren't", 'and', 'the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'it', "it's", 'you', 'he', 'she', 'we', 'they', 'i', 'my', 'your', 'his', 'her', 'our', 'their', 'for', 'with', 'or', 'but', 'so', 'yes', 'no'];
  var isAnswer = function (en) {
    return forms(en).some(function (f) {
      var b = bare(f), w = ' ' + norm(f) + ' ';
      return ELD.answers.some(function (a) { return a === b || (a.length > 2 && SMALL.indexOf(a) < 0 && w.indexOf(' ' + a + ' ') >= 0); });
    });
  };
  var GT = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dj=1&hl=en';
  function gt(q, sl, tl) { return fetch(GT + '&sl=' + sl + '&tl=' + tl + '&q=' + encodeURIComponent(q)).then(function (r) { if (!r.ok) throw r.status; return r.json(); }); }
  function online(q) {
    return gt(q, 'auto', 'ca').then(function (j) {
      if (j.src === 'en') return { dir: 'en', j: j };
      if (MODE === 'en-ca') return { dir: 'ca', blockedDir: true };
      return gt(q, j.src && j.src !== 'auto' ? j.src : 'ca', 'en').then(function (k) { return { dir: 'ca', j: k }; });
    }).then(function (r) {
      if (!r.j) return r;
      var j = r.j, main = (j.sentences || []).map(function (s) { return s.trans || ''; }).join('').trim(), more = [];
      (j.dict || []).forEach(function (g) { (g.terms || []).slice(0, 4).forEach(function (x) { if (norm(x) !== norm(main) && more.indexOf(x) < 0) more.push(x); }); });
      r.main = main; r.more = more.slice(0, 5); r.pos = ((j.dict || [])[0] || {}).pos || '';
      r.same = norm(main) === norm(q);
      return r;
    });
  }
  function meaning(word) {   // a short English meaning (and the IPA) for an English word
    return fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word)).then(function (r) { if (!r.ok) throw r.status; return r.json(); }).then(function (a) {
      var e = a && a[0]; if (!e) return null;
      var ph = e.phonetic || ((e.phonetics || []).filter(function (p) { return p.text; })[0] || {}).text || '';
      var defs = []; (e.meanings || []).forEach(function (m) { (m.definitions || []).slice(0, 1).forEach(function (x) { if (defs.length < 2) defs.push({ pos: m.partOfSpeech, d: x.definition, ex: x.example || '' }); }); });
      return { ph: ph, defs: defs };
    }).catch(function () { return null; });
  }
  function say(text) {
    try {
      var s = window.speechSynthesis; if (!s) return; s.cancel();
      var u = new SpeechSynthesisUtterance(text), v = s.getVoices().filter(function (x) { return /^en[-_]GB/i.test(x.lang); })[0] || s.getVoices().filter(function (x) { return /^en/i.test(x.lang); })[0];
      u.lang = 'en-GB'; if (v) u.voice = v; u.rate = .9; s.speak(u);
    } catch (e) {}
  }

  // ---- the window ----
  var css = '.eldict-fab{position:fixed;right:18px;bottom:calc(var(--el-bar-space,0px) + 14px);z-index:9000;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:11px 18px 11px 14px;background:var(--accent,#1f6b52);color:#fff;font:800 1rem/1 inherit;font-family:inherit;box-shadow:0 8px 24px rgba(15,23,42,.22);cursor:pointer}'
    + '.eldict-fab i{font-style:normal;font-size:1.25rem}.eldict-fab:hover{filter:brightness(1.08)}.eldict-fab[hidden],.eldict[hidden]{display:none!important}'
    + '.eldict{position:fixed;right:18px;bottom:calc(var(--el-bar-space,0px) + 74px);z-index:9001;width:380px;max-width:calc(100vw - 24px);max-height:min(560px,calc(100vh - 100px));display:flex;flex-direction:column;background:#fff;border:1px solid #d8e6df;border-radius:18px;box-shadow:0 18px 48px rgba(15,23,42,.25);color:#20312b;font-family:inherit;overflow:hidden}'
    + '.eldict-h{display:flex;align-items:center;gap:8px;padding:12px 12px 10px 16px;background:var(--soft,#e9f5ef);font-weight:850;font-size:1.05rem}.eldict-h span{flex:1}'
    + '.eldict-x{border:0;background:#fff;border-radius:10px;width:34px;height:34px;font-size:1.05rem;cursor:pointer;color:#20312b}'
    + '.eldict-f{display:flex;gap:8px;padding:12px 14px 6px}.eldict-f input{flex:1;min-width:0;border:2px solid #d8e6df;border-radius:12px;padding:10px 12px;font:600 1.02rem inherit;font-family:inherit;color:#20312b;-webkit-user-select:text;user-select:text}'
    + '.eldict-f input:focus{outline:0;border-color:var(--accent,#1f6b52)}.eldict-f button{border:0;border-radius:12px;padding:0 14px;background:var(--accent,#1f6b52);color:#fff;font-weight:800;font-family:inherit;cursor:pointer}'
    + '.eldict-tip{padding:0 16px 8px;font-size:.84rem;color:#66766f}.eldict-b{overflow:auto;padding:4px 14px 14px}'
    + '.eldict-r{border:1px solid #d8e6df;border-radius:14px;padding:11px 13px;margin-top:9px}.eldict-r.ls{background:#f6fbf8}.eldict-src{font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#66766f;margin-bottom:4px}'
    + '.eldict-w{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.eldict-w b{font-size:1.12rem}.eldict-ph{color:#66766f;font-size:.9rem}.eldict-say{border:0;background:var(--soft,#e9f5ef);border-radius:9px;padding:3px 8px;cursor:pointer;font-size:.95rem}'
    + '.eldict-tr{margin-top:3px;font-size:1.02rem}.eldict-tr em{font-style:normal;color:#66766f;font-size:.86rem}.eldict-ex{margin-top:5px;font-size:.9rem;color:#4b5b55;font-style:italic}'
    + '.eldict-def{margin-top:6px;font-size:.9rem;line-height:1.4}.eldict-def i{color:#66766f}.eldict-more{margin-top:10px;border:1px solid #d8e6df;background:#fff;border-radius:11px;padding:7px 12px;font-weight:750;font-family:inherit;cursor:pointer;color:var(--dark,#174d3d)}'
    + '.eldict-msg{margin-top:10px;padding:11px 13px;border-radius:13px;background:#fff8e1;border:1px solid #f3d27a;color:#5b4300;font-size:.95rem;line-height:1.4}.eldict-msg.no{background:#fdecec;border-color:#f3b4b4;color:#7a1d1d}'
    + '.eldict-rec{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.eldict-rec span{font-size:.78rem;color:#66766f;width:100%}.eldict-rec button{border:1px solid #d8e6df;background:#fff;border-radius:999px;padding:4px 10px;font-family:inherit;cursor:pointer;color:#20312b}'
    + 'body.elslpfs .eldict-fab{bottom:76px}body.elslpfs .eldict{bottom:134px}'
    + '.eldict-tipbox{position:fixed;right:18px;bottom:calc(var(--el-bar-space,0px) + 80px);z-index:9002;width:320px;max-width:calc(100vw - 24px);background:#20312b;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 14px 40px rgba(15,23,42,.35);font-family:inherit;line-height:1.45;animation:eldictIn .35s ease-out}'
    + '.eldict-tipbox::after{content:"";position:absolute;right:40px;bottom:-9px;border:9px solid transparent;border-bottom:0;border-top-color:#20312b}'
    + '.eldict-tipbox b{display:block;font-size:1.08rem;margin-bottom:4px}.eldict-tipbox p{margin:0 0 4px;font-size:.96rem}.eldict-tipbox small{display:block;color:#cfe3da;font-size:.85rem}'
    + '.eldict-tipbox div{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}.eldict-tipbox button{border:0;border-radius:10px;padding:8px 13px;font-weight:800;font-family:inherit;cursor:pointer;background:#fff;color:#20312b}.eldict-tipbox button.go{background:#9fd8bf}'
    + '@keyframes eldictIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.eldict-fab.hint{animation:eldictPulse 1.6s ease-in-out 3}@keyframes eldictPulse{50%{box-shadow:0 0 0 10px rgba(31,107,82,.25),0 8px 24px rgba(15,23,42,.22)}}'
    + 'body.elslpfs .eldict-tipbox{bottom:140px}'
    + '.eldict-fab.intop{position:static;flex:0 0 auto;margin-left:auto;padding:9px 16px 9px 13px;font-size:.95rem;box-shadow:0 2px 8px rgba(15,23,42,.16);z-index:auto}'
    + '.eldict-tipbox.up::after{bottom:auto;top:-9px;right:10px;border-top:0;border-bottom:9px solid #20312b}'
    + '@media (max-width:640px){.eldict-tipbox{right:10px;bottom:146px}.eldict-tipbox::after{right:28px}}'
    + '@media (max-width:640px){.eldict-fab{right:12px;bottom:84px;padding:12px 13px}.eldict-fab b{display:none}.eldict{left:8px;right:8px;width:auto;bottom:140px;max-height:calc(100vh - 160px)}}@media (pointer:coarse){.eldict-tip.dbl{display:none}}'
    + '@media print{.eldict-fab,.eldict{display:none!important}}';
  var fab, box, inp, out, last = '';
  function recent() { try { return JSON.parse(localStorage.getItem('el_dict_recent') || '[]') || []; } catch (e) { return []; } }
  function remember(q) { try { var r = recent().filter(function (x) { return norm(x) !== norm(q); }); r.unshift(q); localStorage.setItem('el_dict_recent', JSON.stringify(r.slice(0, 8))); } catch (e) {} }
  function build() {
    var st = d.createElement('style'); st.id = 'eldictCss'; st.textContent = css; d.head.appendChild(st);
    fab = d.createElement('button'); fab.type = 'button'; fab.className = 'eldict-fab notranslate'; d.body.appendChild(fab);
    box = d.createElement('div'); box.className = 'eldict notranslate'; box.hidden = true; box.setAttribute('role', 'dialog'); d.body.appendChild(box);
    fab.onclick = function () { box.hidden ? open('') : close(); };
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
    d.addEventListener('dblclick', function (e) {   // double-click a word on the page (not in the answer boxes or the dictionary)
      if (fab.hidden || box.contains(e.target) || (e.target.closest && e.target.closest('input,textarea,select,[contenteditable],video,audio,.eldict-fab'))) return;
      var w = wordAt(e.clientX, e.clientY); if (w) open(w);
    });
    label(); setInterval(vis, 800); vis();
  }
  function label() {
    fab.innerHTML = '<i aria-hidden="true">🔍</i><b>' + t('Diccionari', 'Dictionary') + '</b>';
    fab.title = t('Busca una paraula en anglès o en català', 'Look up a word in English or Catalan');
  }
  function wordAt(x, y) {
    var r = d.caretRangeFromPoint ? d.caretRangeFromPoint(x, y) : null, node, off;
    if (r) { node = r.startContainer; off = r.startOffset; }
    else if (d.caretPositionFromPoint) { var p = d.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; off = p.offset; } }
    if (!node || node.nodeType !== 3) return '';
    var s = node.data, a = off, b = off, ok = /[A-Za-zÀ-ÿ'’·\-]/;
    while (a > 0 && ok.test(s[a - 1])) a--; while (b < s.length && ok.test(s[b])) b++;
    return s.slice(a, b).replace(/^['’\-]+|['’\-]+$/g, '');
  }
  function activeStep() {   // the step on screen: LP panel object, or null
    var sec = d.querySelector('.panel.active[id]'), lp = window.LP;
    if (!sec || !lp || !lp.panels) return sec ? { id: sec.id } : null;
    return lp.panels.filter(function (p) { return p.id === sec.id; })[0] || { id: sec.id };
  }
  function vis() {
    var p = activeStep(), noNotes = !!p && (p.id === 'recall' || p.type === 'recall');
    var off = noNotes;
    if (fab.hidden !== off) { fab.hidden = off; if (off) close(); }
    if (fab.querySelector('b').textContent !== t('Diccionari', 'Dictionary')) label();
    hint(!off);
    place();
  }
  /* Stacked above the other floating buttons bottom right (✅ To do, the account bar) instead of on top of them (Roger, 12 Nov 2026:
     "on és el diccionari?"): its height is measured, so it follows the To do button on a Chromebook and on a phone. */
  /* Where the button sits (Roger, 12 Nov 2026: "pot posar-lo a dalt a la dreta ja que ara els alumnes tenen un espai en buit? ... make sure
     it doesn't hide any other thing"): in the top bar, on the right (the Learning Path dropdown there is hidden since #537), on a computer;
     its window and the first-time bubble open under it. On a phone, and in the step's full screen view (no top bar), it floats bottom
     right, stacked above the other floating buttons there (✅ To do, the account bar, the full screen bar) instead of on top of them. */
  function place() {
    if (fab.hidden) return;
    var row = d.querySelector('.topbar .toprow'), bar = row && row.closest('.topbar');
    var top = !!row && innerWidth > 640 && !d.body.classList.contains('elslpfs') && getComputedStyle(bar).display !== 'none';
    if (top && fab.parentNode !== row) { row.appendChild(fab); fab.classList.add('intop'); fab.style.bottom = ''; }
    if (!top && fab.parentNode !== d.body) { d.body.appendChild(fab); fab.classList.remove('intop'); }
    if (top) {
      var r = fab.getBoundingClientRect(), y = Math.max(8, Math.round(r.bottom + 10)), x = Math.max(8, Math.round(innerWidth - r.right));
      box.style.top = y + 'px'; box.style.bottom = 'auto'; box.style.right = x + 'px'; box.style.maxHeight = 'calc(100vh - ' + (y + 16) + 'px)';
      // the bubble hangs to the left of the button, so the step's own buttons under it (⛶ Full screen) stay visible
      if (tip) { tip.style.top = (y + 2) + 'px'; tip.style.bottom = 'auto'; tip.style.right = Math.max(8, Math.round(innerWidth - r.left - 22)) + 'px'; tip.classList.add('up'); }
      return;
    }
    var low = innerHeight, vw = innerWidth;
    ['#el-todo-btn', '#el-cloud-bar', '.elslpbar'].forEach(function (q) {
      var e = d.querySelector(q); if (!e || e.hidden) return;
      var cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var rr = e.getBoundingClientRect(); if (!rr.height || rr.right < vw * .6 || rr.top < innerHeight * .5) return;   // only what sits bottom right
      low = Math.min(low, rr.top);
    });
    var b = Math.round(innerHeight - low + 10); if (b < 14) b = 14;
    fab.style.bottom = b + 'px';
    box.style.top = ''; box.style.right = ''; box.style.bottom = (b + 60) + 'px'; box.style.maxHeight = 'calc(100vh - ' + (b + 80) + 'px)';
    if (tip) { tip.style.top = ''; tip.style.right = ''; tip.style.bottom = (b + 66) + 'px'; tip.classList.remove('up'); }
  }
  /* The first time a student meets it (Roger, 12 Nov 2026: "when they enter the first time, either in class mode or when doing the
     activities, I want a message telling them that they have a dictionary in case they need to look up any word they don't understand"):
     a bubble over the 🔍 button on the first learning path step where it shows, until they press Got it / Try it or open the dictionary.
     Once per student on this browser (el_dict_seen_<uid>: el_ keys stay after a sign-out and are not synced). */
  var tip = null, since = Date.now();
  function seenKey() { var u = ''; try { u = (JSON.parse(localStorage.getItem('el_who') || 'null') || {}).uid || ''; } catch (e) {} return 'el_dict_seen' + (u ? '_' + u : ''); }
  function seen() { try { return !!localStorage.getItem(seenKey()); } catch (e) { return true; } }
  function seenNow() { try { localStorage.setItem(seenKey(), String(Date.now())); } catch (e) {} if (tip) { tip.remove(); tip = null; } fab.classList.remove('hint'); }
  function hint(on) {
    if (!on || seen() || Date.now() - since < 1500 || !box.hidden) { if (tip && (!on || !box.hidden)) { tip.remove(); tip = null; fab.classList.remove('hint'); } return; }
    if (tip && tip.dataset.ca === String(ca())) return;
    if (tip) tip.remove();
    tip = d.createElement('div'); tip.className = 'eldict-tipbox notranslate'; tip.setAttribute('role', 'status'); tip.dataset.ca = String(ca());
    tip.innerHTML = '<b>🔍 ' + t('Tens un diccionari!', 'You have a dictionary!') + '</b>'
      + '<p>' + t('Si no entens una paraula, busca-la aquí: en anglès o en català.', 'If you don’t understand a word, look it up here, in English or Catalan.') + '</p>'
      + '<small>' + t('També pots fer doble clic a qualsevol paraula de la pàgina.', 'You can also double-click any word on the page.') + '</small>'
      + '<div><button type="button" class="ok">' + t('D’acord', 'Got it') + '</button><button type="button" class="go">' + t('Prova’l', 'Try it') + '</button></div>';
    d.body.appendChild(tip); fab.classList.add('hint'); place();
    tip.querySelector('.ok').onclick = seenNow;
    tip.querySelector('.go').onclick = function () { seenNow(); open(''); };
  }
  function head() {
    return '<div class="eldict-h"><span>🔍 ' + t('Diccionari', 'Dictionary') + '</span><button type="button" class="eldict-x" aria-label="' + t('Tanca', 'Close') + '">✕</button></div>'
      + '<form class="eldict-f" autocomplete="off"><input type="search" maxlength="60" spellcheck="false" placeholder="' + esc(MODE === 'en-ca' ? t('Escriu una paraula en anglès', 'Type an English word') : t('Paraula en anglès o en català', 'A word in English or Catalan')) + '"><button type="submit">' + t('Busca', 'Look up') + '</button></form>'
      + '<div class="eldict-tip dbl">' + t('Consell: fes doble clic a qualsevol paraula de la pàgina.', 'Tip: double-click any word on the page.') + '</div><div class="eldict-b" aria-live="polite"></div>';
  }
  function open(q) {
    if (!box.firstChild || box.dataset.ca !== String(ca())) {
      box.innerHTML = head(); box.dataset.ca = String(ca());
      inp = box.querySelector('input'); out = box.querySelector('.eldict-b');
      box.querySelector('.eldict-x').onclick = close;
      box.querySelector('form').onsubmit = function (e) { e.preventDefault(); look(inp.value); };
    }
    box.hidden = false; if (!seen()) seenNow(); place();
    if (q) { inp.value = q; look(q); } else { if (!last) showRecent(); setTimeout(function () { inp.focus(); inp.select && inp.select(); }, 30); }
  }
  function close() { if (box) box.hidden = true; }
  function showRecent() {
    var r = recent(); out.innerHTML = r.length ? '<div class="eldict-rec"><span>' + t('Darreres paraules', 'Recent words') + '</span>' + r.map(function (x) { return '<button type="button">' + esc(x) + '</button>'; }).join('') + '</div>' : '';
    [].forEach.call(out.querySelectorAll('.eldict-rec button'), function (b) { b.onclick = function () { inp.value = b.textContent; look(b.textContent); }; });
  }
  var msg = function (h, no) { return '<div class="eldict-msg' + (no ? ' no' : '') + '">' + h + '</div>'; };
  var tryIt = function () { return msg('💪 ' + t('Aquesta paraula és una resposta d’una activitat d’aquest learning path. Prova-ho tu primer!', 'This word is an answer in an activity of this learning path. Try it yourself first!')); };
  var sayBtn = function (w) { return '<button type="button" class="eldict-say" data-say="' + esc(w) + '" aria-label="' + t('Escolta', 'Listen') + '">🔊</button>'; };
  function wire() {
    [].forEach.call(out.querySelectorAll('[data-say]'), function (b) { b.onclick = function () { say(b.getAttribute('data-say')); }; });
    var m = out.querySelector('.eldict-more'); if (m) m.onclick = function () { m.remove(); web(m.getAttribute('data-q'), true); };
  }
  var seq = 0;
  function look(q) {
    q = String(q || '').replace(/\s+/g, ' ').trim(); last = q;
    if (!q) { showRecent(); return; }
    // phrasal verbs and expressions (Roger, 12 Nov 2026): up to 4 words online; longer expressions only when they are on the LS's list
    var nw = q.split(' ').length, long = msg(t('Només paraules o expressions curtes (fins a 4 paraules). Per a frases senceres, busca-hi les paraules una a una.', 'Only words, phrasal verbs or short expressions (up to 4 words). For a whole sentence, look up its words one by one.'), true);
    if (nw > 6 || q.length > 60) { out.innerHTML = long; return; }
    var my = ++seq; out.innerHTML = '<div class="eldict-tip" style="padding:10px 2px">' + t('Buscant…', 'Looking up…') + '</div>';
    loaded.then(function () {
      if (my !== seq) return;
      remember(q);
      var hits = inList(q).filter(function (h) { return MODE !== 'en-ca' || h.dir === 'en'; }), html = '', hidden = 0;
      hits.forEach(function (h) {
        if (h.dir === 'ca' && isAnswer(h.w.en)) { hidden++; return; }
        html += '<div class="eldict-r ls"><div class="eldict-src">' + t('Vocabulari d’aquesta LS', 'This LS’s vocabulary') + (h.w.lp ? ' · LP' + h.w.lp : '') + '</div>'
          + '<div class="eldict-w"><b>' + esc(h.w.en) + '</b>' + sayBtn(h.w.en) + '</div><div class="eldict-tr">' + esc(h.w.ca) + '</div>' + (h.w.ex ? '<div class="eldict-ex">' + esc(h.w.ex) + '</div>' : '') + '</div>';
      });
      if (hidden && !html) { out.innerHTML = tryIt(); wire(); return; }   // its English is an answer here: no online look-up either
      var exact = hits.some(function (h) { return h.s >= 4; });
      if (nw > 4) { out.innerHTML = exact ? html : long; wire(); return; }
      if (MODE === 'ls') { out.innerHTML = html || msg(t('Aquesta paraula no és al vocabulari d’aquesta LS.', 'This word isn’t in this LS’s vocabulary.')); wire(); return; }
      if (hidden) { out.innerHTML = html; wire(); return; }
      if (html && exact) { out.innerHTML = html + '<button type="button" class="eldict-more" data-q="' + esc(q) + '">🌐 ' + t('Més significats', 'More meanings') + '</button>'; wire(); return; }
      out.innerHTML = html; web(q, !!html);
    });
  }
  function web(q, keep) {
    var my = seq, slot = d.createElement('div'); slot.innerHTML = '<div class="eldict-tip" style="padding:10px 2px">' + t('Buscant al diccionari…', 'Looking in the dictionary…') + '</div>';
    if (!keep) out.innerHTML = ''; out.appendChild(slot);
    online(q).then(function (r) {
      if (my !== seq) return;
      if (r.blockedDir) { slot.innerHTML = msg(t('Aquí només pots buscar paraules en anglès.', 'Here you can only look up English words.')); return; }
      var none = function () { slot.innerHTML = msg(t('No l’he trobada. Revisa com s’escriu.', 'Not found. Check the spelling.'), true); };
      if (!r.main) { none(); return; }
      if (r.dir === 'ca' && (isAnswer(r.main) || r.more.some(isAnswer))) { slot.innerHTML = tryIt(); return; }
      var en = r.dir === 'en' ? q : r.main, tr = r.dir === 'en' ? r.main : q;
      var card = function (m) {
        return '<div class="eldict-r"><div class="eldict-src">' + t('Diccionari en línia', 'Online dictionary') + '</div>'
          + '<div class="eldict-w"><b>' + esc(en) + '</b>' + (m && m.ph ? '<span class="eldict-ph">' + esc(m.ph) + '</span>' : '') + sayBtn(en) + '</div>'
          + '<div class="eldict-tr">' + esc(tr) + (r.pos ? ' <em>(' + esc(r.pos) + ')</em>' : '') + '</div>'
          + (r.more.length ? '<div class="eldict-tr"><em>' + (r.dir === 'en' ? t('També: ', 'Also: ') : t('També: ', 'Also: ')) + esc(r.more.join(', ')) + '</em></div>' : '')
          + (m && m.defs.length ? m.defs.map(function (x) { return '<div class="eldict-def"><i>' + esc(x.pos) + '</i> · ' + esc(x.d) + (x.ex ? '<div class="eldict-ex">' + esc(x.ex) + '</div>' : '') + '</div>'; }).join('') : '')
          + '</div>';
      };
      // the same word back (festival, hotel, piano… or a typo): show it only if the English dictionary knows it
      if (r.same && !r.more.length) { meaning(en).then(function (m) { if (my !== seq) return; if (m && r.dir === 'en') { slot.innerHTML = card(m); wire(); } else none(); }); return; }
      slot.innerHTML = card(null); wire();
      if (en.split(' ').length <= 3) meaning(en).then(function (m) { if (my === seq && m) { slot.innerHTML = card(m); wire(); } });
    }).catch(function () {
      if (my === seq) slot.innerHTML = msg(t('Ara no puc connectar amb el diccionari en línia. Torna-ho a provar d’aquí a una estona.', 'I can’t reach the online dictionary right now. Try again in a moment.'), true);
    });
  }
  ELD.look = function (q) { open(q); };
  loaded.then(function (ok) { if (!ok) return; if (d.body) build(); else d.addEventListener('DOMContentLoaded', build); });
})();
