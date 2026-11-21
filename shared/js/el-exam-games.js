/* Games for students who finish the web exam early (Roger, 17 Nov 2026: "if they finish before I want them to have games to play, it can be
   hangman, etc… if they answer well the questions they have kind of points and they can build a scaffold that reaches the top of a building").
   ELExamGames.mount(el, {words: [[word, Catalan clue]], quiz: [{q, o, a}], ca, store, title}) after the exam is turned in (shared/js/el-web-exam.js),
   and on the Games page (lab/index.html 🏗 Exam games, from <ls>/data/exam-games.js; title: its own heading instead of "While you wait").
   🔤 Hangman (a solved word = 2 points) and ❓ Quick quiz (a right answer = 1 point); every point adds one level of scaffolding up the
   building, and at the top a taller building starts. Practice only: nothing goes to the cloud; the points stay in this browser (store key). */
(function () {
  const D = document;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const FLOORS = [12, 16, 20, 25, 30];   // each building is taller than the one before
  const css = `
  .eg{background:#fff;border:1px solid #d8e6df;border-radius:18px;padding:16px 18px;box-shadow:0 10px 30px rgba(31,107,82,.08);margin:14px 0}
  .eg h2{margin:0 0 4px;color:#174d3d}.eg .lead{color:#4b5d56;margin:0 0 12px}
  .eg-grid{display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px;align-items:start}
  @media(max-width:760px){.eg-grid{grid-template-columns:1fr}}
  .eg-site{background:linear-gradient(#dff1ff,#f4fbff);border:1px solid #cfe3f1;border-radius:14px;padding:10px;text-align:center}
  .eg-site svg{width:100%;height:auto;max-height:420px}.eg-pts{font-weight:800;color:#174d3d;margin-top:6px}.eg-pts small{display:block;font-weight:600;color:#4b5d56}
  .eg-tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .eg-tab{border:2px solid #d8e6df;background:#fbfdfc;border-radius:999px;padding:7px 14px;font:inherit;font-weight:800;cursor:pointer;color:#174d3d}
  .eg-tab.on{background:#174d3d;border-color:#174d3d;color:#fff}
  .eg-box{background:#f8fbf9;border:1px solid #e1ece6;border-radius:14px;padding:14px 16px;min-height:250px}
  .eg-word{font-size:2rem;letter-spacing:.35em;font-weight:800;color:#174d3d;margin:10px 0;word-break:break-all}
  .eg-clue{color:#4b5d56;font-weight:700}.eg-lives{font-size:1.2rem;margin:6px 0}
  .eg-keys{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
  .eg-key{width:36px;height:38px;border:2px solid #d8e6df;background:#fff;border-radius:9px;font:inherit;font-weight:800;cursor:pointer;color:#20312b}
  .eg-key.ok{background:#dcfce7;border-color:#86efac;color:#166534}.eg-key.bad{background:#fee2e2;border-color:#fca5a5;color:#991b1b}.eg-key:disabled{cursor:default}
  .eg-q{font-size:1.15rem;font-weight:750;margin:6px 0 12px;line-height:1.5}
  .eg-opts{display:flex;flex-wrap:wrap;gap:8px}
  .eg-opt{border:2px solid #d8e6df;background:#fff;border-radius:11px;padding:9px 14px;font:inherit;cursor:pointer;color:#20312b}
  .eg-opt.ok{background:#dcfce7;border-color:#22c55e;font-weight:800}.eg-opt.bad{background:#fee2e2;border-color:#ef4444}
  .eg-msg{margin:12px 0 0;font-weight:800;min-height:1.4em}.eg-msg.ok{color:#166534}.eg-msg.bad{color:#991b1b}
  .eg-btn{border:0;border-radius:12px;padding:10px 16px;font:inherit;font-weight:800;background:#1f6b52;color:#fff;cursor:pointer;margin-top:12px}
  .eg-top{background:#fef9c3;border:2px solid #facc15;border-radius:12px;padding:10px 14px;margin-bottom:12px;font-weight:800;color:#713f12}`;

  function mount(el, o) {
    if (!el || !o || !(o.words || []).length) return;
    const ca = !!o.ca, t = (c, e) => ca ? c : e, KEY = o.store || 'el_examgames';
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
    const st = Object.assign({ pts: 0, tab: 'hang' }, load());
    const keep = () => { try { localStorage.setItem(KEY, JSON.stringify({ pts: st.pts, tab: st.tab })); } catch (e) {} };
    if (!D.getElementById('egCss')) { const s = D.createElement('style'); s.id = 'egCss'; s.textContent = css; D.head.appendChild(s); }
    // which building and how high: the points run through the buildings one after another
    const where = () => { let p = st.pts, i = 0; while (p >= FLOORS[Math.min(i, FLOORS.length - 1)]) { p -= FLOORS[Math.min(i, FLOORS.length - 1)]; i++; } return { b: i, n: FLOORS[Math.min(i, FLOORS.length - 1)], h: p }; };
    let topMsg = '';
    el.innerHTML = '<div class="eg"><h2>' + (o.title ? esc(o.title) : '🎮 ' + t('Mentre esperes', 'While you wait')) + '</h2><p class="lead">' +
      t('Juga i guanya punts: cada punt puja un pis de la bastida. Arribaràs dalt de l’edifici?', 'Play and win points: every point builds one more level of scaffolding. Can you reach the top of the building?') + '</p>' +
      '<div class="eg-grid"><div class="eg-site" id="egSite"></div><div><div class="eg-tabs">' +
      '<button class="eg-tab" data-eg="hang">🔤 ' + t('Penjat', 'Hangman') + ' <small>+2</small></button><button class="eg-tab" data-eg="quiz">❓ ' + t('Preguntes ràpides', 'Quick quiz') + ' <small>+1</small></button></div>' +
      '<div id="egTop"></div><div class="eg-box" id="egBox"></div></div></div></div>';
    const box = el.querySelector('#egBox');
    function site() {
      const w = where(), N = w.n, W = 200, H = 380, fh = (H - 40) / N, bx = 70, bw = 110;
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(t('Edifici', 'Building')) + ' ' + (w.b + 1) + ': ' + w.h + '/' + N + '">';
      s += '<rect x="0" y="' + (H - 12) + '" width="' + W + '" height="12" fill="#86c58f"/>';
      s += '<rect x="' + bx + '" y="28" width="' + bw + '" height="' + (H - 40) + '" fill="#e9d5b7" stroke="#b08a5a"/>';
      for (let f = 0; f < N; f++) { const y = H - 12 - (f + 1) * fh; for (let c = 0; c < 3; c++) s += '<rect x="' + (bx + 12 + c * 33) + '" y="' + (y + fh * 0.22) + '" width="20" height="' + Math.max(3, fh * 0.5) + '" fill="#9cc9e6"/>'; }
      s += '<polygon points="' + (bx - 6) + ',28 ' + (bx + bw / 2) + ',8 ' + (bx + bw + 6) + ',28" fill="#b45309"/>';
      // the scaffolding: two poles and one plank per level reached, in front of the left of the building
      const sx = 22, sw = 56, top = H - 12 - w.h * fh;
      if (w.h) { s += '<line x1="' + sx + '" y1="' + (H - 12) + '" x2="' + sx + '" y2="' + top + '" stroke="#64748b" stroke-width="3"/><line x1="' + (sx + sw) + '" y1="' + (H - 12) + '" x2="' + (sx + sw) + '" y2="' + top + '" stroke="#64748b" stroke-width="3"/>';
        for (let l = 1; l <= w.h; l++) { const y = H - 12 - l * fh; s += '<rect x="' + (sx - 4) + '" y="' + (y - 2) + '" width="' + (sw + 8) + '" height="4" fill="#d97706"/>'; if (l > 1) s += '<line x1="' + sx + '" y1="' + (y + fh) + '" x2="' + (sx + sw) + '" y2="' + y + '" stroke="#94a3b8" stroke-width="1.5"/>'; } }
      s += '<text x="' + (sx + sw / 2) + '" y="' + (top - 6) + '" font-size="20" text-anchor="middle">👷</text>';
      s += '<text x="' + (bx + bw / 2) + '" y="' + (H - 1) + '" font-size="10" text-anchor="middle" fill="#14532d">' + esc(t('Edifici', 'Building')) + ' ' + (w.b + 1) + '</text></svg>';
      el.querySelector('#egSite').innerHTML = s + '<div class="eg-pts">⭐ ' + st.pts + ' ' + t('punts', 'points') + '<small>' + w.h + ' / ' + N + ' ' + t('pisos', 'levels') + (w.b ? ' · ' + w.b + ' ' + t(w.b === 1 ? 'edifici acabat' : 'edificis acabats', w.b === 1 ? 'building finished' : 'buildings finished') : '') + '</small></div>';
      el.querySelector('#egTop').innerHTML = topMsg ? '<div class="eg-top">' + topMsg + '</div>' : '';
    }
    function add(n) { const b0 = where().b; st.pts += n; keep(); topMsg = where().b > b0 ? '🎉 ' + t('Has arribat dalt de tot! Ara, un edifici més alt.', 'You reached the top! Now a taller building.') : ''; site(); }
    // 🔤 Hangman: a word of the LS with its Catalan clue, 6 lives
    let hw = null, onKey = null;
    function hang() {
      const pool = o.words.filter(x => /^[A-Za-z]+$/.test(x[0]));
      if (!hw || hw.done) { const [w, c] = pick(pool); hw = { w: w.toUpperCase(), c, used: [], bad: 0, done: false }; }
      const lives = 6, show = hw.w.split('').map(ch => hw.used.includes(ch) || hw.done ? ch : '_').join(''), won = !show.includes('_'), lost = hw.bad >= lives;
      if ((won || lost) && !hw.done) { hw.done = true; if (won) add(2); }
      box.innerHTML = '<div class="eg-clue">💡 ' + t('Pista', 'Clue') + ': ' + esc(hw.c) + ' · ' + hw.w.length + ' ' + t('lletres', 'letters') + '</div>' +
        '<div class="eg-word">' + (hw.done ? hw.w : show) + '</div><div class="eg-lives">' + '❤️'.repeat(Math.max(0, lives - hw.bad)) + '🤍'.repeat(Math.min(lives, hw.bad)) + '</div>' +
        '<div class="eg-keys">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L => { const u = hw.used.includes(L), ok = u && hw.w.includes(L);
          return '<button class="eg-key' + (u ? ok ? ' ok' : ' bad' : '') + '" data-k="' + L + '"' + (u || hw.done ? ' disabled' : '') + '>' + L + '</button>'; }).join('') + '</div>' +
        (hw.done ? '<p class="eg-msg ' + (won ? 'ok' : 'bad') + '">' + (won ? '✓ ' + t('Molt bé! +2 punts', 'Well done! +2 points') : '✗ ' + t('La paraula era', 'The word was') + ' ' + esc(hw.w)) + '</p><button class="eg-btn" id="egNext">' + t('Una altra paraula', 'Another word') + ' →</button>' : '');
      box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => guess(b.dataset.k));
      const nx = box.querySelector('#egNext'); if (nx) nx.onclick = () => { hw = null; hang(); };
    }
    function guess(L) { if (!hw || hw.done || hw.used.includes(L)) return; hw.used.push(L); if (!hw.w.includes(L)) hw.bad++; hang(); }
    // ❓ Quick quiz: one question, three options; a right answer = 1 point
    let qq = [], qi = 0;
    function quiz() {
      if (!qq.length || qi >= qq.length) { qq = shuffle(o.quiz || []); qi = 0; }
      const x = qq[qi]; if (!x) { box.textContent = ''; return; }
      box.innerHTML = '<div class="eg-q">' + esc(x.q) + '</div><div class="eg-opts">' + shuffle(x.o).map(v => '<button class="eg-opt" data-v="' + esc(v) + '">' + esc(v) + '</button>').join('') + '</div><p class="eg-msg" id="egMsg"></p>';
      box.querySelectorAll('.eg-opt').forEach(b => b.onclick = () => {
        if (box.dataset.ans) return; box.dataset.ans = '1';
        const ok = b.dataset.v === x.a; b.classList.add(ok ? 'ok' : 'bad');
        if (!ok) box.querySelectorAll('.eg-opt').forEach(y => { if (y.dataset.v === x.a) y.classList.add('ok'); });
        const m = box.querySelector('#egMsg'); m.className = 'eg-msg ' + (ok ? 'ok' : 'bad'); m.textContent = ok ? '✓ +1 ' + t('punt', 'point') : '✗ ' + t('La resposta és', 'The answer is') + ': ' + x.a;
        if (ok) add(1);
        setTimeout(() => { delete box.dataset.ans; qi++; quiz(); }, ok ? 900 : 2200);
      });
    }
    function tab(k) { st.tab = k; keep(); el.querySelectorAll('[data-eg]').forEach(b => b.classList.toggle('on', b.dataset.eg === k)); delete box.dataset.ans; (k === 'quiz' ? quiz : hang)(); }
    el.querySelectorAll('[data-eg]').forEach(b => b.onclick = () => tab(b.dataset.eg));
    if (onKey) D.removeEventListener('keydown', onKey);
    onKey = e => { if (st.tab !== 'hang' || !el.isConnected || e.ctrlKey || e.metaKey || e.altKey) return; const L = (e.key || '').toUpperCase(); if (/^[A-Z]$/.test(L)) guess(L); else if (e.key === 'Enter' && hw && hw.done) { hw = null; hang(); } };
    D.addEventListener('keydown', onKey);
    site(); tab(st.tab === 'quiz' ? 'quiz' : 'hang');
  }
  window.ELExamGames = { mount };
})();
