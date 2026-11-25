/* Aa Easy reading (Roger, 25 Nov 2026: "could we have a dislexic option reding where … some important letters are in a different
   color?"; then "okay do it", choosing: every student can use it, exam readings too, the coloured letters an optional extra).
   A button beside 🔊 Listen to the text on every reading text (.reading boxes of the learning paths, study guides, sample exams,
   recall checkpoints and Towards Nativeness; .wx-text of the web exams). Turning it on makes the text bigger with more space between
   letters and words (Zorzi et al. 2012, PNAS) in a plain sans font (Lexend; the notebook look's handwriting font is the hardest kind
   to read); a small panel adds a cream page, a reading ruler and b d p q in four colours (no study behind the letters: optional,
   off by default). Dyslexia fonts, coloured overlays and bold word starts were left out: studies found no benefit.
   The choice is one for the whole site, kept in this browser (localStorage el_easy_read): no Firestore reads or writes.
   Off = nothing on the page changes. LS1 (My Real Routine) pages are left as they are (finished). Loaded by learning-path-support.js
   and el-web-exam.js. */
(function (root) {
  if (root.ELEasyRead) return;
  if (/my-real-routine/.test(location.pathname)) return;
  const KEY = 'el_easy_read';
  const OPTS = ['big', 'plain', 'cream', 'ruler', 'letters'];
  const DEF = { on: false, big: true, plain: true, cream: false, ruler: false, letters: false };
  let S = Object.assign({}, DEF);
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const BOX = '.reading, .wx-text';
  const SKIP = 'script,style,textarea,input,select,button,.el-ra-bar,.el-er-bar,.el-er-panel,.el-er-dim,.el-er-l';
  const doc = document, html = doc.documentElement;

  const ca = () => /^beginners$/.test(String(root.level || (doc.querySelector('.route.active') || {}).dataset?.level || ''));
  const T = {
    btn: ['Aa Lectura fàcil', 'Aa Easy reading'],
    big: ['Més gran i amb més espai', 'Bigger, with more space'],
    plain: ['Lletra clara', 'Plain letters'],
    cream: ['Pàgina crema', 'Cream page'],
    ruler: ['Regle de lectura (mou el ratolí o toca una línia)', 'Reading ruler (move the mouse or tap a line)'],
    letters: ['Colors per a les lletres', 'Colour the letters'],
    off: ['Treu la lectura fàcil', 'Turn Easy reading off'],
    done: ['Fet', 'Done']
  };
  const t = k => T[k][ca() ? 0 : 1];

  function css() {
    if (doc.getElementById('el-er-css')) return;
    const st = doc.createElement('style'); st.id = 'el-er-css';
    // higher specificity than the notebook look's reading font (html.el-lpnb .lp-panels .panel .reading)
    const B = 'html.el-er-on body .el-er-box.el-er-box.el-er-box';
    st.textContent =
      '.el-er-btn{font:700 .95rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:0!important;word-spacing:0!important;border:0;border-radius:999px;padding:8px 16px;background:#eaf0ff;color:#2a4bd7!important;cursor:pointer}' +
      '.el-er-btn[aria-pressed="true"]{background:#2a4bd7;color:#fff!important}' +
      '.el-er-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px}' +
      '.el-er-panel{flex-basis:100%;display:grid;gap:6px;margin:4px 0 2px;padding:12px 14px;border-radius:12px;background:#f4f6fb;border:1px solid #d9dee8;color:#1c2330!important;font:500 .92rem/1.35 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:0!important;word-spacing:0!important;text-align:left}' +
      '.el-er-panel[hidden]{display:none!important}' +
      '.el-er-panel label{display:flex;gap:10px;align-items:center;cursor:pointer;color:#1c2330!important;font:inherit!important}' +
      '.el-er-panel input{width:18px;height:18px;accent-color:#2a4bd7;flex:none;margin:0}' +
      '.el-er-panel .el-er-legend{font-weight:800}' +
      '.el-er-panel .el-er-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}' +
      '.el-er-panel .el-er-row button{font:700 .88rem/1.2 system-ui,-apple-system,"Segoe UI",sans-serif!important;border:0;border-radius:999px;padding:7px 14px;cursor:pointer;background:#2a4bd7;color:#fff!important}' +
      '.el-er-panel .el-er-row button.el-er-quit{background:#fff;color:#2a4bd7!important;border:1.5px solid #2a4bd7}' +
      // bigger, more space (BDA style guide; Zorzi et al. 2012)
      'html.el-er-big body .el-er-box.el-er-box.el-er-box,html.el-er-big body .el-er-box.el-er-box.el-er-box :is(p,li,td,th,dd,dt,blockquote,span,strong,b,em,i){font-size:max(17px,min(21px,4.6vw))!important;line-height:1.8!important;letter-spacing:.09em!important;word-spacing:.22em!important}' +
      'html.el-er-big body .el-er-box.el-er-box.el-er-box :is(p,li,blockquote){max-width:62ch}' +
      // a narrow phone column keeps more words per line: less side padding
      'html.el-er-big body .el-er-box.el-er-box.el-er-box.el-er-box.el-er-box{padding-left:max(12px,min(26px,3vw))!important;padding-right:max(12px,min(26px,3vw))!important;margin-left:min(6px,1vw)!important;margin-right:min(6px,1vw)!important}' +
      'html.el-er-big body .el-er-box.el-er-box.el-er-box :is(.tiny,small){font-size:max(16px,min(18px,4.4vw))!important}' +
      // a plain sans font instead of the handwriting one
      'html.el-er-plain body .el-er-box.el-er-box.el-er-box,html.el-er-plain body .el-er-box.el-er-box.el-er-box :is(p,li,td,th,dd,dt,blockquote,span,strong,b,em,i,h3,h4){font-family:"Lexend",Verdana,Arial,sans-serif!important;font-style:normal!important}' +
      // cream page (not at night in Towards Nativeness)
      'html.el-er-cream:not(.tn-dark) body .el-er-box.el-er-box.el-er-box{background:#fbf6e6!important;color:#2b2a26!important}' +
      // the bars and the panel keep their own size and spacing
      'html.el-er-on body .el-er-box.el-er-box.el-er-box :is(.el-ra-bar,.el-er-bar,.el-er-panel) :is(span,b,strong,label,button){letter-spacing:0!important;word-spacing:0!important;line-height:1.3!important;font-size:.92rem!important;font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important}' +
      'html.el-er-on body .el-er-box.el-er-box.el-er-box :is(.el-ra-bar,.el-er-bar,.el-er-panel) .el-er-legend span{font-size:1.1rem!important;font-weight:800}' +
      // the four letters
      '.el-er-l{font-weight:800}' +
      '.el-er-b{color:#1f5fd1!important}.el-er-d{color:#c2410c!important}.el-er-p{color:#15803d!important}.el-er-q{color:#8a2bc9!important}' +
      'html.tn-dark .el-er-b{color:#8fb3ff!important}html.tn-dark .el-er-d{color:#ffa070!important}html.tn-dark .el-er-p{color:#74d99d!important}html.tn-dark .el-er-q{color:#d6a3ff!important}' +
      // reading ruler: the text above and below the line is dimmed
      'html.el-er-ruler body .el-er-box.el-er-box.el-er-box{position:relative}' +
      '.el-er-dim{display:none;position:absolute;left:0;right:0;background:rgba(20,24,34,.22);pointer-events:none;z-index:2}' +
      'html.el-er-ruler .el-er-box.el-er-ruled>.el-er-dim{display:block}';
    doc.head.appendChild(st);
  }
  let fontLoaded = false;
  function font() {
    if (fontLoaded || !S.on || !S.plain) return;
    fontLoaded = true;
    const l = doc.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap';
    doc.head.appendChild(l);
  }

  // b d p q in their colours: each letter in a span, only in the reading's own text
  function colour(box) {
    const w = doc.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: n => /[bdpq]/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest(SKIP)) ? 1 : 2 });
    const list = []; let n; while ((n = w.nextNode())) list.push(n);
    list.forEach(n => {
      const f = doc.createDocumentFragment();
      n.nodeValue.split(/([bdpq])/).forEach(p => {
        if (!p) return;
        if (/^[bdpq]$/.test(p)) { const s = doc.createElement('span'); s.className = 'el-er-l el-er-' + p; s.textContent = p; f.appendChild(s); }
        else f.appendChild(doc.createTextNode(p));
      });
      n.parentNode.replaceChild(f, n);
    });
  }
  function uncolour(box) {
    const ps = new Set();
    box.querySelectorAll('span.el-er-l').forEach(s => { ps.add(s.parentNode); s.replaceWith(doc.createTextNode(s.textContent)); });
    ps.forEach(p => p && p.normalize && p.normalize());
  }

  // reading ruler: two shades, above and below the line under the pointer
  function ruler(box) {
    if (box.dataset.erRuler) return;
    box.dataset.erRuler = '1';
    const move = y => {
      if (!html.classList.contains('el-er-ruler')) return;
      let top = box.querySelector(':scope > .el-er-dim.el-er-top'), bot = box.querySelector(':scope > .el-er-dim.el-er-bot');
      if (!top) { top = doc.createElement('div'); top.className = 'el-er-dim el-er-top'; box.appendChild(top); }
      if (!bot) { bot = doc.createElement('div'); bot.className = 'el-er-dim el-er-bot'; box.appendChild(bot); }
      const r = box.getBoundingClientRect(), p = box.querySelector('p,li') || box;
      const lh = parseFloat(getComputedStyle(p).lineHeight) || 34;
      const at = y - r.top + box.scrollTop, a = Math.max(0, at - lh * 0.6), b = at + lh * 0.6;
      top.style.top = '0px'; top.style.height = a + 'px';
      bot.style.top = b + 'px'; bot.style.height = Math.max(0, box.scrollHeight - b) + 'px';
      box.classList.add('el-er-ruled');
    };
    box.addEventListener('mousemove', e => move(e.clientY));
    box.addEventListener('click', e => move(e.clientY));
    box.addEventListener('touchstart', e => { if (e.touches[0]) move(e.touches[0].clientY); }, { passive: true });
    box.addEventListener('mouseleave', () => box.classList.remove('el-er-ruled'));
  }

  function apply() {
    OPTS.concat('on').forEach(k => html.classList.toggle(k === 'on' ? 'el-er-on' : 'el-er-' + k, !!(S.on && (k === 'on' || S[k]))));
    font();
    doc.querySelectorAll('.el-er-box').forEach(box => { if (S.on && S.letters) colour(box); else uncolour(box); });
    doc.querySelectorAll('.el-er-btn').forEach(b => { b.setAttribute('aria-pressed', String(!!S.on)); b.textContent = t('btn') + (S.on ? ' ✓' : ''); });
    doc.querySelectorAll('.el-er-panel').forEach(p => p.querySelectorAll('input[data-k]').forEach(i => { i.checked = !!S[i.dataset.k]; }));
  }
  function set(k, v) { S[k] = v; save(); apply(); }

  function panel() {
    const p = doc.createElement('div'); p.className = 'el-er-panel'; p.hidden = true;
    p.innerHTML = OPTS.map(k => '<label><input type="checkbox" data-k="' + k + '"> <span>' + t(k) +
      (k === 'letters' ? ' <span class="el-er-legend"><span class="el-er-b">b</span> <span class="el-er-d">d</span> <span class="el-er-p">p</span> <span class="el-er-q">q</span></span>' : '') + '</span></label>').join('') +
      '<div class="el-er-row"><button type="button" class="el-er-done">✓ ' + t('done') + '</button><button type="button" class="el-er-quit">' + t('off') + '</button></div>';
    p.querySelectorAll('input[data-k]').forEach(i => { i.onchange = () => set(i.dataset.k, i.checked); });
    p.querySelector('.el-er-done').onclick = () => { p.hidden = true; };
    p.querySelector('.el-er-quit').onclick = () => { p.hidden = true; set('on', false); };
    return p;
  }
  function attach(box) {
    if (!box.classList.contains('el-er-box')) box.classList.add('el-er-box');
    ruler(box);
    const ra = box.querySelector(':scope > .el-ra-bar');
    let btn = box.querySelector(':scope > .el-ra-bar > .el-er-btn, :scope > .el-er-bar > .el-er-btn');
    let pn = box.querySelector(':scope > .el-ra-bar > .el-er-panel, :scope > .el-er-bar > .el-er-panel');
    const own = box.querySelector(':scope > .el-er-bar');
    if (ra && btn && btn.parentNode !== ra) { ra.appendChild(btn); if (pn) ra.appendChild(pn); }
    if (ra && own) own.remove();
    if (!btn) {
      btn = doc.createElement('button'); btn.type = 'button'; btn.className = 'el-er-btn';
      pn = panel();
      btn.onclick = () => { if (!S.on) { set('on', true); pn.hidden = false; } else pn.hidden = !pn.hidden; };
      if (ra) { ra.appendChild(btn); ra.appendChild(pn); }
      else { const bar = doc.createElement('div'); bar.className = 'el-er-bar'; bar.append(btn, pn); box.insertBefore(bar, box.firstChild); }
      btn.setAttribute('aria-pressed', String(!!S.on)); btn.textContent = t('btn') + (S.on ? ' ✓' : '');
      pn.querySelectorAll('input[data-k]').forEach(i => { i.checked = !!S[i.dataset.k]; });
    }
    if (S.on && S.letters) colour(box);
  }

  let timer = 0, busy = false;
  function scan() {
    clearTimeout(timer);
    timer = setTimeout(() => { if (busy) return; busy = true; try { doc.querySelectorAll(BOX).forEach(attach); } finally { busy = false; } }, 80);
  }
  root.ELEasyRead = { scan, get: () => Object.assign({}, S) };
  css(); apply();
  const go = () => { scan(); new MutationObserver(scan).observe(doc.body, { childList: true, subtree: true }); };
  if (doc.body) go(); else doc.addEventListener('DOMContentLoaded', go);
  root.addEventListener('storage', e => { if (e.key === KEY) { try { S = Object.assign({}, DEF, JSON.parse(e.newValue || '{}')); } catch (x) {} apply(); } });
})(window);
