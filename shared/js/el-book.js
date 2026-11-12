/* 📖 The book of an LS, page by page (Roger, 12 Nov 2026: "I want students to see the pages of the book as a PDF, I want them to have the
   feeling that they are reading a book, with the images they had"; "and if you could make the feeling of turning pages, that'd be
   amazing"). ELBook.mount(el, pages, opts) draws the chapter's page pictures (<LS>/book/<route>-NN.webp, made by
   tools/reading-story/build.py --web) as an open book: two pages side by side on a computer, one on a phone, and the page turns like
   paper (a 3D leaf) with the arrows, a tap on the left or right page, a swipe or the keyboard. ⤢ opens it full screen to read;
   🔍 shows one page as wide as the screen. After the last page the arrow becomes "Questions ⬇" (opts.onEnd).
   opts: {ca: Catalan labels, title: the chapter's name (alt text), onEnd()}. Used by ls2-engine.js (media.pages) on book.html. */
(function () {
  const R = 210 / 148;   // A5
  const css = `
.elb{--pw:300px;--ph:424px;--paper:#fffdf8;--desk:#efe9df;position:relative;margin:4px 0 14px;outline:none}
.elb:focus-visible .elb-book{box-shadow:0 0 0 3px var(--accent,#1f6b52),0 18px 40px rgba(0,0,0,.28)}
.elb-stage{display:flex;justify-content:center;padding:18px 8px 10px;background:var(--desk);border-radius:16px;perspective:2600px}
.elb-book{position:relative;width:calc(var(--pw)*2);height:var(--ph);box-shadow:0 18px 40px rgba(0,0,0,.28);border-radius:3px;background:var(--paper)}
.elb.single .elb-book{width:var(--pw)}
.elb-page,.elb-leaf{position:absolute;top:0;width:var(--pw);height:var(--ph);background:var(--paper)}
.elb-page img,.elb-face img{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none;pointer-events:none}
.elb-l{left:0}.elb-r{left:var(--pw)}.elb.single .elb-l{display:none}.elb.single .elb-r{left:0}
.elb-l::after,.elb-r::after{content:"";position:absolute;inset:0;pointer-events:none}
.elb-l::after{background:linear-gradient(to left,rgba(0,0,0,.16),rgba(0,0,0,0) 7%)}
.elb-r::after{background:linear-gradient(to right,rgba(0,0,0,.18),rgba(0,0,0,0) 7%)}
.elb.single .elb-r::after{background:linear-gradient(to right,rgba(0,0,0,.10),rgba(0,0,0,0) 4%)}
.elb-page.blank img{visibility:hidden}
.elb-leaf{display:none;transform-style:preserve-3d;z-index:3;transition:transform .75s cubic-bezier(.45,.05,.3,1)}
.elb-leaf.on{display:block}
.elb-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--paper);overflow:hidden}
.elb-face::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .75s ease}
.elb-front::after{background:linear-gradient(to left,rgba(0,0,0,.28),rgba(0,0,0,0) 45%)}
.elb-back{transform:rotateY(180deg)}
.elb-back::after{background:linear-gradient(to right,rgba(0,0,0,.28),rgba(0,0,0,0) 45%)}
.elb-leaf.turn .elb-face::after{opacity:1}
.elb-hit{position:absolute;top:0;bottom:0;width:50%;border:0;background:transparent;cursor:pointer;z-index:4;padding:0}
.elb-hit.prev{left:0;cursor:w-resize}.elb-hit.next{right:0;cursor:e-resize}.elb-hit:disabled{cursor:default}
.elb-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:10px}
.elb-bar button{border:1px solid var(--line,#d8e6df);background:#fff;color:var(--dark,#174d3d);border-radius:12px;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer;min-height:42px}
.elb-bar button:disabled{opacity:.4;cursor:default}
.elb-bar .elb-go{background:var(--accent,#1f6b52);color:#fff;border-color:transparent}
.elb-bar .elb-n{min-width:120px;text-align:center;color:var(--muted,#66766f);font-weight:700;font-variant-numeric:tabular-nums}
.elb-tip{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,28,25,.82);color:#fff;border-radius:999px;padding:8px 16px;font-weight:800;font-size:.92rem;z-index:5;pointer-events:none;white-space:nowrap}
.elb.full{position:fixed;inset:0;z-index:2000;margin:0;background:#2b2621;display:flex;flex-direction:column;justify-content:center;padding:10px max(10px,env(safe-area-inset-right,0px)) 10px max(10px,env(safe-area-inset-left,0px))}
.elb.full .elb-stage{background:transparent;padding:0;flex:1;align-items:center;min-height:0}
.elb.full .elb-bar{margin-top:8px}.elb.full .elb-bar button{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.18)}
.elb.full .elb-bar .elb-go{background:var(--accent,#1f6b52)}.elb.full .elb-bar .elb-n{color:#e8e1d6}
.elb.full .elb-tip{display:none}
.elb.zoom .elb-stage{overflow:auto;align-items:flex-start}
html.elb-lock{overflow:hidden}
@media (max-width:520px){.elb-stage{padding:10px 4px 8px}.elb-bar{gap:6px}.elb-bar button{padding:8px 11px;min-height:40px}.elb-bar .elb-n{min-width:0;flex-basis:100%;order:-1}}
@media (prefers-reduced-motion:reduce){.elb-leaf,.elb-face::after{transition:none}}
`;
  const T = (ca, a, b) => ca ? a : b;
  function mount(el, pages, o) {
    o = o || {};
    if (!el || !pages || !pages.length) return;
    if (!document.getElementById('elBookCss')) document.head.insertAdjacentHTML('beforeend', '<style id="elBookCss">' + css + '</style>');
    const ca = !!o.ca, n = pages.length, alt = k => (o.title || 'Book') + ' · ' + T(ca, 'pàgina ', 'page ') + (k + 1);
    el.className = 'elb'; el.tabIndex = 0;
    el.setAttribute('role', 'region'); el.setAttribute('aria-label', T(ca, 'Llibre', 'Book'));
    el.innerHTML = '<div class="elb-stage"><div class="elb-book">' +
      '<div class="elb-page elb-l"><img alt=""></div><div class="elb-page elb-r"><img alt=""></div>' +
      '<div class="elb-leaf"><div class="elb-face elb-front"><img alt=""></div><div class="elb-face elb-back"><img alt=""></div></div>' +
      '<button type="button" class="elb-hit prev" aria-label="' + T(ca, 'Pàgina anterior', 'Previous page') + '"></button>' +
      '<button type="button" class="elb-hit next" aria-label="' + T(ca, 'Pàgina següent', 'Next page') + '"></button>' +
      '<div class="elb-tip">⤢ ' + T(ca, 'Toca per llegir a pantalla completa', 'Tap to read full screen') + '</div></div></div>' +
      '<div class="elb-bar"><button type="button" class="elb-p">◀ ' + T(ca, 'Enrere', 'Back') + '</button><span class="elb-n"></span>' +
      '<button type="button" class="elb-x elb-go">' + T(ca, 'Gira la pàgina', 'Turn the page') + ' ▶</button>' +
      '<button type="button" class="elb-z" hidden>🔍 ' + T(ca, 'Més gran', 'Bigger') + '</button>' +
      '<button type="button" class="elb-f">⤢ ' + T(ca, 'Pantalla completa', 'Full screen') + '</button></div>';
    const q = s => el.querySelector(s), L = q('.elb-l'), Rp = q('.elb-r'), leaf = q('.elb-leaf'), book = q('.elb-book'), stage = q('.elb-stage');
    const nb = q('.elb-n'), bp = q('.elb-p'), bx = q('.elb-x'), bz = q('.elb-z'), bf = q('.elb-f'), tip = q('.elb-tip');
    let i = 0, busy = false, full = false, zoom = false, single = false, seen = false;
    const set = (box, k) => { const im = box.querySelector('img'); box.classList.toggle('blank', k == null || k < 0 || k >= n); if (k != null && k >= 0 && k < n) { im.src = pages[k]; im.alt = alt(k); } else im.removeAttribute('src'); };
    pages.forEach(src => { const im = new Image(); im.decoding = 'async'; im.src = src; });   // a chapter is 2–5 pages: load them all, so a turn never waits
    const step = () => single ? 1 : 2;
    function draw() {
      if (single) { set(Rp, i); set(L, null); } else { set(L, i); set(Rp, i + 1); }
      const last = Math.min(n, i + step());
      nb.textContent = (single || last - i === 1 ? T(ca, 'Pàgina ', 'Page ') + (i + 1) : T(ca, 'Pàgines ', 'Pages ') + (i + 1) + '–' + last) + T(ca, ' de ', ' of ') + n;
      bp.disabled = i === 0; q('.elb-hit.prev').disabled = i === 0;
      const end = i + step() >= n;
      bx.textContent = end ? (o.onEnd ? T(ca, 'Preguntes ⬇', 'Questions ⬇') : T(ca, 'Fi', 'The end')) : T(ca, 'Gira la pàgina', 'Turn the page') + ' ▶';
      bx.disabled = end && !o.onEnd;
    }
    function fit() {
      const W = full ? innerWidth - 20 : el.clientWidth - 16, H = full ? innerHeight - (q('.elb-bar').offsetHeight + 30) : Math.min(innerHeight * 0.82, 760);
      if (W <= 0) return;
      const was = single;
      single = zoom || W < 700;
      if (single !== was && !single && i % 2) i--;   // spreads start on an even page
      let pw = single ? (zoom ? Math.min(W - 10, 1000) : Math.min(W - 10, H / R)) : Math.min((W - 10) / 2, H / R);
      pw = Math.max(160, Math.floor(pw));
      el.style.setProperty('--pw', pw + 'px'); el.style.setProperty('--ph', Math.round(pw * R) + 'px');
      el.classList.toggle('single', single); el.classList.toggle('zoom', zoom);
      bz.hidden = !full; bz.textContent = zoom ? '📖 ' + T(ca, 'Llibre obert', 'Open book') : '🔍 ' + T(ca, 'Més gran', 'Bigger');
      tip.hidden = full || seen || innerWidth < 700;   // a phone turns the page at a tap (no full screen at a tap)
      draw();
    }
    const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Turning: the leaf is the page that moves; under it the pages that the turn uncovers are already in place.
    function turn(dir) {
      if (busy) return;
      const s = step(), to = i + dir * s;
      if (dir > 0 && i + s >= n) { if (o.onEnd) { if (full) toggleFull(false, true); setTimeout(o.onEnd, 60); } return; }
      if (dir < 0 && i === 0) return;
      seen = true; tip.hidden = true;
      if (!motion()) { i = Math.max(0, to); draw(); return; }
      busy = true;
      const front = leaf.querySelector('.elb-front'), back = leaf.querySelector('.elb-back');
      leaf.style.transition = 'none'; leaf.classList.remove('turn');
      if (single) {
        leaf.style.left = '0'; leaf.style.transformOrigin = 'left center';
        // one page: the page lifts away to the left until it is edge-on (no back to show), or comes back over the page
        if (dir > 0) { set(front, i); set(back, null); set(Rp, to); leaf.style.transform = 'rotateY(0deg)'; }
        else { set(front, to); set(back, null); leaf.style.transform = 'rotateY(-90deg)'; }
      } else if (dir > 0) {
        leaf.style.left = 'var(--pw)'; leaf.style.transformOrigin = 'left center';
        set(front, i + 1); set(back, i + 2); set(Rp, i + 3); leaf.style.transform = 'rotateY(0deg)';
      } else {
        leaf.style.left = '0'; leaf.style.transformOrigin = 'right center';
        set(front, i); set(back, i - 1); set(L, i - 2); leaf.style.transform = 'rotateY(0deg)';
      }
      leaf.classList.add('on'); void leaf.offsetWidth;
      leaf.style.transition = ''; leaf.classList.add('turn');
      leaf.style.transform = single ? (dir > 0 ? 'rotateY(-90deg)' : 'rotateY(0deg)') : (dir > 0 ? 'rotateY(-180deg)' : 'rotateY(180deg)');
      let done = false;
      const end = () => { if (done) return; done = true; i = to; draw(); leaf.classList.remove('on', 'turn'); busy = false; };
      leaf.addEventListener('transitionend', function h(e) { if (e.target !== leaf) return; leaf.removeEventListener('transitionend', h); end(); });
      setTimeout(end, 1000);
    }
    function toggleFull(on, stay) {
      full = on == null ? !full : on;
      if (!full) zoom = false;
      el.classList.toggle('full', full); document.documentElement.classList.toggle('elb-lock', full);
      bf.textContent = full ? '✕ ' + T(ca, 'Tanca', 'Close') : '⤢ ' + T(ca, 'Pantalla completa', 'Full screen');
      try { if (full && el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => {}); else if (!full && document.fullscreenElement === el) document.exitFullscreen().catch(() => {}); } catch (e) {}
      fit(); el.focus({ preventScroll: true });
      if (!full && !stay) el.scrollIntoView({ block: 'nearest' });
    }
    document.addEventListener('fullscreenchange', () => { if (full && document.fullscreenElement !== el) toggleFull(false); else fit(); });
    bp.onclick = () => turn(-1); bx.onclick = () => turn(1); bf.onclick = () => toggleFull();
    bz.onclick = () => { zoom = !zoom; fit(); stage.scrollTop = 0; };
    q('.elb-hit.prev').onclick = () => turn(-1);
    q('.elb-hit.next').onclick = () => { if (!full && !seen && innerWidth >= 700) { seen = true; toggleFull(true); return; } turn(1); };
    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && full)) { e.preventDefault(); turn(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); }
      else if (e.key === 'Escape' && full) toggleFull(false);
    });
    let sx = null, sy = null;
    book.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    book.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5 && !zoom) { e.preventDefault(); turn(dx < 0 ? 1 : -1); } });
    if (window.ResizeObserver) new ResizeObserver(() => fit()).observe(el); else addEventListener('resize', fit);
    addEventListener('resize', () => { if (full) fit(); });
    fit();
  }
  window.ELBook = { mount };
})();
