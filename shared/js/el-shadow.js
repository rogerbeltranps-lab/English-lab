/* Shadowing marks and modes (Roger, 7 Nov 2026: "the shadowing sections on their own could have indications like going up/down,
   stressed words and linking" + "two options: first listen and repeat (after each sentence we give students time to repeat it) and
   the other option shadowing all as you listen").
   Used by the class shadowing page (shared/shadow/), the LS2 Learning Path Shadowing step (ls2-engine.js R.shadow) and Practise (lab/).
   clip.marks = per script line, its sentences in the shadowing video's format (tools/shadowing-video): **stressed** underlined,
   ‿ linked words, ↗ before a comma or a pause and at the end of yes/no questions, ↘ at the end of statements and wh- questions.
   clip.cues = [[from, to, slowFrom, slowTo], …] per sentence (tools/shadowing-marks/apply.py, pocketsphinx alignment).
   Marks on/off and the mode are remembered on the device (localStorage), never saved anywhere else. Clips without marks show the
   plain script and only the Shadowing mode. Every button here carries data-vs: el-cloud.js keeps [data-vs] working in the read-only
   student view and in locked sections, where listening is still allowed. */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const html = document.documentElement;
  const setMarks = on => { html.classList.toggle('shm-off', !on); put('elShadowMarks', on ? '1' : '0'); };
  html.classList.toggle('shm-off', get('elShadowMarks', '1') === '0');

  const css = document.createElement('style');
  css.textContent = '.shm-s{text-decoration:underline;text-decoration-thickness:.12em;text-underline-offset:.2em;text-decoration-color:var(--accent,#1f5f8b);font-weight:700}'
    + '.shm-l{color:var(--accent,#1f5f8b);font-weight:800}'
    + '.shm-t{font-weight:800;margin-left:.08em;font-size:.95em}.shm-t.up{color:#c2410c}.shm-t.dn{color:#1d4ed8}'
    + '.shm-off .shm-s{text-decoration:none;font-weight:inherit}.shm-off .shm-l>span,.shm-off .shm-t{display:none}.shm-off .shm-l::before{content:"\\0020"}'
    + '.shm-x{border-radius:8px;transition:background .2s,box-shadow .2s}.shm-x.now{background:#fff3c4;box-shadow:0 0 0 4px #fff3c4}'
    + '.shm-click .shm-x{cursor:pointer}.shm-click .shm-x:hover{background:#f1f5f9}.shm-click .shm-x.now:hover{background:#fff3c4}'
    + '.shm-key{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;font-size:.9rem;line-height:1.4;color:var(--muted,#5d6b75);margin:8px 0 4px}'
    + '.shm-key b{color:var(--ink,#14232e);font-weight:700}.shm-key .shm-s{color:var(--ink,#14232e)}'
    + '.shm-off .shm-key{display:none}'
    + '.shm-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}'
    + '.shm-bar [aria-pressed="true"]{background:var(--accent,#1f5f8b)!important;border-color:var(--accent,#1f5f8b)!important;color:#fff!important}'
    + '.shm-mode{display:inline-flex;flex-wrap:wrap;gap:6px;margin-right:6px}'
    + '.shm-turn{display:none;align-items:center;gap:10px;flex-wrap:wrap;font-weight:700;margin:8px 0;padding:8px 12px;border-radius:12px;background:#fff7e0;color:#7a4b00}'
    + '.shm-turn button{font:inherit;font-size:.9rem;font-weight:600;border:1px solid #e9c77d;background:#fff;color:#7a4b00;border-radius:9px;padding:4px 10px;cursor:pointer}'
    + '.shm-turn.on{display:flex}.shm-turn .bar{flex:1 1 140px;min-width:120px;height:10px;border-radius:99px;background:#f5deb0;overflow:hidden}'
    + '.shm-turn .bar i{display:block;height:100%;width:0;background:#e08a00;border-radius:99px}'
    + '@media (max-width:640px){.shm-key{font-size:.82rem;gap:4px 12px}.shm-bar{gap:6px}.shm-mode{gap:6px;margin-right:0}.shm-bar button{padding:7px 11px!important;font-size:.9rem!important;min-height:0!important}}';
  document.head.appendChild(css);

  // one marked sentence → HTML (the arrow sits right after the word, before the comma or full stop, as in the video)
  function sent(m) {
    return esc(m).replace(/-/g, '\u2011').replace(/\*\*(.+?)\*\*/g, '<span class="shm-s">$1</span>').replace(/==(.+?)==/g, '$1')
      .replace(/‿/g, '<span class="shm-l"><span>‿</span></span>')
      .replace(/([,.?!:;…])\s*([↗↘])/g, '$2$1')
      .replace(/\s*↗/g, '<span class="shm-t up" aria-hidden="true">↗</span>').replace(/\s*↘/g, '<span class="shm-t dn" aria-hidden="true">↘</span>');
  }
  const has = c => !!(c && Array.isArray(c.marks) && Array.isArray(c.cues) && c.marks.length === (c.lines || []).length);
  // the whole script: one <p> per line, each sentence in its own span (data-k = sentence number) so it can light up
  function script(c, tag) {
    tag = tag || 'b'; let k = 0;
    return (c.lines || []).map((l, i) => {
      const who = Array.isArray(l) && l.length > 1 ? '<' + tag + '>' + esc(l[0]) + ':</' + tag + '> ' : '';
      const body = has(c) ? c.marks[i].map(s => '<span class="shm-x" data-k="' + (k++) + '">' + sent(s) + '</span>').join(' ') : esc(Array.isArray(l) ? l[l.length - 1] : l);
      return '<p>' + who + body + '</p>';
    }).join('');
  }
  function key(ca) {
    return ca
      ? '<div class="shm-key"><span><span class="shm-s">subratllat</span> = síl·laba forta: més fort i més llarg</span><span><b class="shm-l">‿</b> = uneix les paraules</span><span><b class="shm-t up">↗</b> la veu puja (abans d’una coma i a les preguntes de sí o no)</span><span><b class="shm-t dn">↘</b> la veu baixa (al final i a les preguntes amb who, what, where…)</span></div>'
      : '<div class="shm-key"><span><span class="shm-s">underlined</span> = stressed: say it louder and longer</span><span><b class="shm-l">‿</b> = join the words</span><span><b class="shm-t up">↗</b> voice goes up (before a comma, yes/no questions)</span><span><b class="shm-t dn">↘</b> voice goes down (at the end, who/what/where questions)</span></div>';
  }
  const label = (ca, on) => on ? (ca ? '🎵 Amaga les marques' : '🎵 Hide the marks') : (ca ? '🎵 Mostra les marques' : '🎵 Show the marks');
  const marksOn = () => !html.classList.contains('shm-off');
  // the bar: the two modes (when the clip has sentence times) + marks on/off. cls = the page's button class.
  function bar(c, ca, cls) {
    cls = cls || '';
    const modes = has(c) ? '<span class="shm-mode" role="group" aria-label="Mode"><button type="button" class="' + cls + '" data-vs data-shm-mode="repeat">🔁 ' + (ca ? 'Escolta i repeteix' : 'Listen and repeat') + '</button>'
      + '<button type="button" class="' + cls + '" data-vs data-shm-mode="shadow">🗣 Shadowing</button></span>' : '';
    const tog = has(c) ? '<button type="button" class="' + cls + '" data-vs data-shm-marks>' + label(ca, marksOn()) + '</button>' : '';
    return '<div class="shm-bar">' + modes + tog + '</div>';
  }
  const mode = () => get('elShadowMode', 'repeat') === 'shadow' ? 'shadow' : 'repeat';
  function bindBar(root, c, ca, onMode) {
    const show = () => {
      root.querySelectorAll('[data-shm-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.shmMode === (has(c) ? mode() : 'shadow'))));
      root.querySelectorAll('[data-shm-marks]').forEach(b => { b.textContent = label(ca, marksOn()); });
    };
    root.querySelectorAll('[data-shm-mode]').forEach(b => b.onclick = () => { put('elShadowMode', b.dataset.shmMode); show(); onMode && onMode(mode()); });
    root.querySelectorAll('[data-shm-marks]').forEach(b => b.onclick = () => { setMarks(!marksOn()); document.querySelectorAll('[data-shm-marks]').forEach(x => { x.textContent = label(ca, marksOn()); }); });
    show();
  }
  const turnBox = ca => '<div class="shm-turn" role="status"><span class="msg"></span><span class="bar"><i></i></span>'
    + '<span class="btns"><button type="button" data-vs data-shm-again>↺ ' + (ca ? 'Una altra vegada' : 'Again') + '</button> <button type="button" data-vs data-shm-next>' + (ca ? 'Següent' : 'Next') + ' ⏭</button></span></div>';

  /* Listen and repeat: plays one sentence, stops, lights it up and gives time to say it (the sentence's length × 1.3 + 1.2 s,
     2.5–12 s), then plays the next. Also lights up the sentence being heard in Shadowing mode.
     o = {media, clip, src: () => url, slow: () => bool, scriptEl, turnEl, ca, onStart, onEnd} */
  function player(o) {
    const m = o.media, c = o.clip, n = has(c) ? c.cues.length : 0;
    let k = 0, run = false, endAt = 0, timer = null;
    const cue = i => { const x = c.cues[i]; return o.slow() ? [x[2], x[3]] : [x[0], x[1]]; };
    const light = i => { if (!o.scriptEl) return; o.scriptEl.querySelectorAll('.shm-x').forEach(e => e.classList.toggle('now', +e.dataset.k === i)); };
    const turn = (txt, secs) => {
      const t = o.turnEl; if (!t) return;
      t.classList.toggle('on', !!txt); t.querySelector('.msg').textContent = txt || '';
      const b = t.querySelector('.bar i'); b.style.transition = 'none'; b.style.width = '0';
      t.querySelector('.bar').style.display = secs ? '' : 'none'; t.querySelector('.btns').style.display = run ? '' : 'none';
      if (secs) { void b.offsetWidth; b.style.transition = 'width ' + secs + 's linear'; b.style.width = '100%'; }
    };
    const clear = () => { clearTimeout(timer); timer = null; endAt = 0; };
    function load(then) {
      const src = o.src(), abs = new URL(src, location.href).href;
      if (m.src !== abs) { m.src = src; m.addEventListener('loadedmetadata', then, { once: true }); m.load(); } else then();
    }
    function say(i) {
      clear(); k = i; light(i);
      turn((o.ca ? '🎧 Escolta… ' : '🎧 Listen… ') + (i + 1) + ' / ' + n);
      load(() => { const [a, b] = cue(i); m.currentTime = a; endAt = b; m.play().then(tick).catch(() => {}); });
    }
    // stop right at the end of the sentence (timeupdate alone comes only every ~250 ms and could catch the next word)
    function tick() { if (!run || !endAt) return; if (m.currentTime >= endAt) { endAt = 0; m.pause(); gap(); return; } requestAnimationFrame(tick); }
    function gap() {
      const [a, b] = cue(k), secs = Math.round(Math.min(12, Math.max(2.5, (b - a) * 1.3 + 1.2)) * 10) / 10;
      turn(o.ca ? '🗣 Ara tu: digues-ho en veu alta!' : '🗣 Your turn: say it aloud!', secs);
      timer = setTimeout(() => { timer = null; if (!run) return; if (k + 1 < n) say(k + 1); else finish(); }, secs * 1000);
    }
    function finish() { run = false; clear(); light(-1); turn(o.ca ? '✓ Molt bé! Prem ▶ per tornar a començar.' : '✓ Well done! Press ▶ to start again.'); o.onEnd && o.onEnd(); }
    m.addEventListener('timeupdate', () => {
      if (run) { if (endAt && m.currentTime >= endAt) { endAt = 0; m.pause(); gap(); } return; }
      if (n && !m.paused) { let on = -1; for (let i = 0; i < n; i++) { const [a, b] = cue(i); if (m.currentTime >= a && m.currentTime < b) on = i; } light(on); }
    });
    m.addEventListener('ended', () => { if (run && endAt) { endAt = 0; gap(); } });
    // in Listen and repeat a click on a sentence starts from it
    if (o.scriptEl && n) o.scriptEl.addEventListener('click', e => { const x = e.target.closest('.shm-x'); if (!x || mode() !== 'repeat') return; start(+x.dataset.k); });
    if (o.turnEl) { o.turnEl.querySelector('[data-shm-again]').onclick = () => run && say(k); o.turnEl.querySelector('[data-shm-next]').onclick = () => run && (k + 1 < n ? say(k + 1) : finish()); }
    const sync = () => { if (o.scriptEl) o.scriptEl.classList.toggle('shm-click', mode() === 'repeat' && n > 0); };
    sync();
    function start(i) { if (!n) return false; run = true; o.onStart && o.onStart(); say(i || 0); return true; }
    function stop() { if (run) { run = false; clear(); m.pause(); turn(''); } light(-1); }
    return { start, stop, sync, running: () => run, again: () => run && say(k), next: () => run && (k + 1 < n ? say(k + 1) : finish()), has: n > 0 };
  }

  window.elShadow = { has, sent, script, key, bar, bindBar, mode, player, turnBox, marksOn };
})();
