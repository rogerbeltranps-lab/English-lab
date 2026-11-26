/* 🔊 Read aloud (Roger, 21 Nov 2026: "is it possible to make kokoro read the readings? Heart voice?"; "And can you add it to students'
   readings too? Not in the exams").
   Every reading text of a learning path (a .reading box: Towards Nativeness and the LS2 learning paths of 2 ESO and 4 ESO, every route)
   is recorded with Kokoro (free, open source, Apache 2.0), voice af_heart (American English), by tools/voice (readings.js →
   readings.py) as audio/read/<key>.mp3. audio/read/index.js (window.EL_READ) lists each recorded key with the second where each
   paragraph starts, so the paragraph being read is lit up.
   key = FNV-1a of the reading's letters and digits only (lower case), so a change of spaces, quotes or tags never loses the recording;
   a changed word does: run tools/voice again. A reading with no recording shows no button.
   Never on an exam, a sample exam or a recall checkpoint page (Roger: "Not in the exams"), and those texts are never recorded.
   Loaded by learning-path-support.js on the Learning Path pages. */
(function (root) {
  const BLOCK = 'p,li,h1,h2,h3,h4,h5,blockquote,tr,dt,dd';
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); };
  // the text a block shows, with a line break read as a full stop ("…11:05<br>Live from the wall" → "…11:05. Live from the wall")
  function said(n) {
    let s = '';
    (function walk(x) { for (const c of x.childNodes) { if (c.nodeType === 3) s += c.nodeValue; else if (c.nodeType === 1 && !(c.classList && (c.classList.contains('el-ra-bar') || c.classList.contains('el-er-bar') || c.classList.contains('el-er-dim')))) { if (c.tagName === 'BR') s += '\n'; else walk(c); } } })(n);
    return s;
  }
  const speakable = s => String(s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/_{2,}/g, ' blank ').replace(/\s*[·•|]\s*/g, ', ')
    .replace(/([^.!?:;,\s])[ \t]*\n+/g, '$1.\n').replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
  // the blocks of a reading (paragraphs, list items, table rows: the innermost ones) and its key
  function parts(el) {
    let bl = [...el.querySelectorAll(BLOCK)].filter(b => !b.closest('.el-ra-bar, .el-er-bar') && !b.querySelector(BLOCK));
    if (!bl.length) bl = [el];
    const texts = bl.map(said), key = fnv(texts.join(' ').toLowerCase().replace(/[^a-z0-9]/g, ''));
    // the Catalan word help under a text ("Paraules: …", "Words: …") is not read
    return { key, blocks: bl, say: texts.map(t => /^\s*(paraules|words|glossary)\s*:/i.test(t) ? '' : speakable(t)) };
  }
  const api = { parts, speakable };
  root.ELRead = api;
  if (/exam|checkpoint/i.test(location.pathname)) return;   // never in the exams

  const me = document.currentScript && document.currentScript.src;
  const base = me ? new URL('../../audio/read/', me).href : '/audio/read/';
  if (!root.EL_READ && !document.querySelector('script[data-el-read]')) {
    const t = document.createElement('script'); t.src = base + 'index.js?v=1'; t.dataset.elRead = '1'; t.onload = () => scan(); document.head.appendChild(t);
  }
  const ca = () => /^beginners$/.test(String(root.level || (document.querySelector('.route.active') || {}).dataset?.level || ''));
  function css() {
    if (document.getElementById('el-read-css')) return;
    const st = document.createElement('style'); st.id = 'el-read-css';
    st.textContent = '.el-ra-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px}' +
      '.el-ra-bar button{font:inherit;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:700;font-size:.95rem;line-height:1.2;border:0;border-radius:999px;padding:8px 16px;background:#eaf0ff;color:#2a4bd7;cursor:pointer}' +
      '.el-ra-bar button.el-ra-play{background:#2a4bd7;color:#fff}.el-ra-bar button[aria-pressed="true"]{background:#2a4bd7;color:#fff}' +
      '.el-ra-bar .el-ra-time{font:600 .85rem/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:inherit;opacity:.7;font-variant-numeric:tabular-nums}' +
      '.el-ra-on{background:rgba(255,214,64,.28)!important;border-radius:6px;box-shadow:0 0 0 4px rgba(255,214,64,.28);transition:background .2s}';
    document.head.appendChild(st);
  }
  let cur = null;   // the reading playing now: one at a time on the page
  const mmss = t => { t = Math.max(0, Math.round(t || 0)); return Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2); };
  function attach(el) {
    if (el.closest('.el-ra-skip')) return;
    const P = parts(el), starts = root.EL_READ && root.EL_READ[P.key];
    if (el.dataset.raKey === P.key && el.querySelector(':scope > .el-ra-bar')) return;
    el.querySelectorAll(':scope > .el-ra-bar').forEach(b => b.remove());
    el.dataset.raKey = P.key;
    if (!starts) return;
    css();
    const bar = document.createElement('div'); bar.className = 'el-ra-bar';
    bar.innerHTML = '<button type="button" class="el-ra-play"></button><button type="button" class="el-ra-slow" aria-pressed="false"></button><span class="el-ra-time"></span>';
    const [bp, bs] = bar.querySelectorAll('button'), tm = bar.querySelector('.el-ra-time');
    const a = new Audio(); a.preload = 'none'; a.src = base + P.key + '.mp3';
    let on = -1;
    const lit = i => { if (i === on) return; if (P.blocks[on]) P.blocks[on].classList.remove('el-ra-on'); on = i; if (P.blocks[i] && P.blocks.length > 1) P.blocks[i].classList.add('el-ra-on'); };
    const label = () => {
      const play = a.paused;
      bp.textContent = play ? (a.currentTime > 0 && !a.ended ? '▶ ' + (ca() ? 'Continua' : 'Go on') : '🔊 ' + (ca() ? 'Escolta el text' : 'Listen to the text')) : '⏸ ' + (ca() ? 'Pausa' : 'Pause');
      bs.textContent = '🐢 ' + (ca() ? 'Més a poc a poc' : 'Slower');
      tm.textContent = a.currentTime > 0 ? mmss(a.currentTime) + (a.duration ? ' / ' + mmss(a.duration) : '') : '';
    };
    bp.onclick = () => {
      if (!a.paused) { a.pause(); return; }
      if (cur && cur !== a) cur.pause();
      cur = a; if (a.ended) a.currentTime = 0;
      a.playbackRate = bs.getAttribute('aria-pressed') === 'true' ? 0.8 : 1;
      a.play().catch(() => {});
    };
    bs.onclick = () => { const s = bs.getAttribute('aria-pressed') !== 'true'; bs.setAttribute('aria-pressed', String(s)); a.playbackRate = s ? 0.8 : 1; };
    a.ontimeupdate = () => { let i = -1; for (let k = 0; k < starts.length; k++) if (a.currentTime + 0.05 >= starts[k]) i = k; lit(a.paused && !a.currentTime ? -1 : i); label(); };
    a.onplay = a.onpause = label;
    a.onended = () => { lit(-1); label(); };
    // the text leaves the page (another route drawn, another tab): stop it
    const gone = new MutationObserver(() => { if (!bar.isConnected) { a.pause(); lit(-1); gone.disconnect(); } });
    gone.observe(document.body, { childList: true, subtree: true });
    el.insertBefore(bar, el.firstChild); label();
  }
  let t = 0;
  function scan() { clearTimeout(t); t = setTimeout(() => document.querySelectorAll('.reading').forEach(attach), 60); }
  api.scan = scan;
  const go = () => { scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})(window);
