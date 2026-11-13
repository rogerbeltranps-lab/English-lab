/* 📖 The book of an LS, page by page (Roger, 12 Nov 2026: "I want students to see the pages of the book as a PDF, I want them to have the
   feeling that they are reading a book, with the images they had"; "and if you could make the feeling of turning pages, that'd be
   amazing"). ELBook.mount(el, pages, opts) draws the chapter's page pictures (<LS>/book/<route>-NN.webp, made by
   tools/reading-story/build.py --web) as an open book: two pages side by side on a computer, one on a phone, and the page turns like
   paper (a 3D leaf) with the arrows, a tap on the left or right page, dragging the page with a finger or the mouse, or the keyboard. ⤢ opens it full screen to read;
   🔍 shows one page as wide as the screen.
   The questions are the book's last page (Roger, 12 Nov 2026: "can we make them do the activity in full screen (the book) and that they
   press the options there?"): opts.end is a live element (the engine's form) shown as a page after the pictures. While it is on screen
   the page taps don't turn (the options take the taps); during a turn the moving paper shows a copy of it.
   Full screen is the browser's (on <html>, so going from one chapter to the next keeps it) plus a cover over the page; it leaves the
   browser's full screen only if it entered it (class mode keeps its own).
   opts: {ca: Catalan labels, title: the chapter's name (alt text), end: element, atEnd(): the end page is on screen}.
   opts.start: the page to open at; opts.pre: words before "Page n of m"; opts.onTurn(i): the page on screen changed.
   Returns {open(), close(keepBrowserFullScreen), isFull(), toEnd(), destroy(keepBrowserFullScreen)}. Used by ls2-engine.js on book.html. */
(function () {
  const R = 210 / 148;   // A5
  const css = `
.elb{--pw:300px;--ph:424px;--paper:#fffdf8;--desk:#efe9df;position:relative;margin:4px 0 14px;outline:none}
.elb:focus-visible .elb-book{box-shadow:0 0 0 3px var(--accent,#1f6b52),0 18px 40px rgba(0,0,0,.28)}
.elb-stage{display:flex;justify-content:center;padding:18px 8px 10px;background:var(--desk);border-radius:16px;perspective:2600px}
.elb-book{position:relative;width:calc(var(--pw)*2);height:var(--ph);box-shadow:0 18px 40px rgba(0,0,0,.28);border-radius:3px;background:var(--paper)}
.elb.single .elb-book{width:var(--pw)}
.elb-book{touch-action:pan-y;user-select:none;-webkit-user-select:none}.elb.zoom .elb-book{touch-action:auto}
.elb-hit.prev,.elb-hit.next{cursor:grab}.elb-hit:active{cursor:grabbing}
.elb-page,.elb-leaf{position:absolute;top:0;width:var(--pw);height:var(--ph);background:var(--paper)}
.elb-page img,.elb-face img{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none;pointer-events:none}
.elb-l{left:0}.elb-r{left:var(--pw)}.elb.single .elb-l{display:none}.elb.single .elb-r{left:0}
.elb-l::after,.elb-r::after{content:"";position:absolute;inset:0;pointer-events:none}
.elb-l::after{background:linear-gradient(to left,rgba(0,0,0,.16),rgba(0,0,0,0) 7%)}
.elb-r::after{background:linear-gradient(to right,rgba(0,0,0,.18),rgba(0,0,0,0) 7%)}
.elb.single .elb-r::after{background:linear-gradient(to right,rgba(0,0,0,.10),rgba(0,0,0,0) 4%)}
.elb-page.blank img{visibility:hidden}
.elb-page.html img,.elb-face.html img{display:none}
.elb-hit.off{display:none}
.elb-leaf{display:none;transform-style:preserve-3d;z-index:3;transition:transform .75s cubic-bezier(.45,.05,.3,1)}
.elb-leaf.on{display:block}
.elb-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:var(--paper);overflow:hidden}
.elb-face::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .75s ease}
.elb-front::after{background:linear-gradient(to left,rgba(0,0,0,.28),rgba(0,0,0,0) 45%)}
.elb-back{transform:rotateY(180deg)}
.elb-back::after{background:linear-gradient(to right,rgba(0,0,0,.28),rgba(0,0,0,0) 45%)}
.elb-leaf.turn .elb-face::after{opacity:1}
.elb-hit{position:absolute;top:0;bottom:0;width:50%;border:0;background:transparent;cursor:pointer;z-index:4;padding:0}
.elb-hit.prev{left:0}.elb-hit.next{right:0}.elb-hit:disabled{cursor:default}
.elb-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:10px}
.elb-bar button{border:1px solid var(--line,#d8e6df);background:#fff;color:var(--dark,#174d3d);border-radius:12px;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer;min-height:42px}
.elb-bar button:disabled{opacity:.4;cursor:default}
.elb-bar .elb-go{background:var(--accent,#1f6b52);color:#fff;border-color:transparent}
.elb-bar .elb-n{min-width:120px;text-align:center;color:var(--muted,#66766f);font-weight:700;font-variant-numeric:tabular-nums}
.elb-tip{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:rgba(20,28,25,.82);color:#fff;border-radius:999px;padding:8px 16px;font-weight:800;font-size:.92rem;z-index:5;pointer-events:none;white-space:nowrap}
.elb.full{position:fixed;inset:0;z-index:9600;margin:0;background:#2b2621;display:flex;flex-direction:column;justify-content:center;padding:10px max(10px,env(safe-area-inset-right,0px)) 10px max(10px,env(safe-area-inset-left,0px))}
.elb.full .elb-stage{background:transparent;padding:0;flex:1;align-items:center;min-height:0}
.elb.full .elb-bar{margin-top:8px}.elb.full .elb-bar button{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.18)}
.elb.full .elb-bar .elb-go{background:var(--accent,#1f6b52)}.elb.full .elb-bar .elb-n{color:#e8e1d6}
.elb.full .elb-tip{display:none}
.elb.zoom .elb-stage{overflow:auto;align-items:flex-start}
html.elb-lock{overflow:hidden}
.elb-q{--bk:#c8622a;position:absolute;inset:0;overflow:auto;padding:7% 8% 6%;background:var(--paper);color:#22262a;text-align:left;font-family:Caladea,Georgia,'Times New Roman',serif;font-size:max(12px,calc(var(--pw)*.034));line-height:1.35}
.elb-q *{box-sizing:border-box}
.elbq-top{font:700 .6em/1.2 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a8f94;margin:0 0 1.1em}
.elb-q .elbq-k{font:800 .78em/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--bk);border-top:2px solid var(--bk);padding-top:.8em;margin:0 0 .35em}
.elbq-how{font:.7em/1.4 Inter,system-ui,sans-serif;color:#6b7280;margin:0 0 1.1em}
.elb-q .question{margin:0 0 .9em;padding:0;border:0;background:none;box-shadow:none}
.elbq-lab{font:700 .64em/1.3 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin:0 0 .25em}
.elb-q .q-title{font-weight:700;color:#17463a;font-size:1.06em;margin:0;line-height:1.3}
.elbq-ca{font-style:italic;color:#5b6168;font-size:.88em;margin:.1em 0 0}
.elb-q .options{display:flex;flex-direction:column;gap:.1em;margin:.4em 0 0}
.elb-q .option{position:relative;display:flex;align-items:center;gap:.6em;margin:0;padding:.24em .5em;border-radius:.5em;cursor:pointer;border:1px solid transparent;background:transparent;font-weight:400;box-shadow:none;min-height:0}
.elb-q .option input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
.elbq-l{flex:0 0 auto;width:2.2em;height:2.2em;border:1.5px solid var(--bk);border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 .68em Inter,system-ui,sans-serif;color:var(--bk);background:#fff}
.elb-q:not(.locked) .option:hover{background:rgba(200,98,42,.07)}
.elb-q .option:has(input:checked){background:rgba(200,98,42,.10);border-color:rgba(200,98,42,.35)}
.elb-q .option:has(input:checked) .elbq-l{background:var(--bk);color:#fff}
.elb-q .option:has(input:focus-visible){outline:2px solid var(--bk);outline-offset:1px}
.elb-q .option.right,.elb-q .option.right:has(input:checked){background:#e3f4ea;border-color:#86c9a0}.elb-q .option.right .elbq-l,.elb-q .option.right:has(input:checked) .elbq-l{background:#1f8a4c;border-color:#1f8a4c;color:#fff}
.elb-q .option.wrong,.elb-q .option.wrong:has(input:checked){background:#fde8e6;border-color:#f0a59c}.elb-q .option.wrong .elbq-l,.elb-q .option.wrong:has(input:checked) .elbq-l{background:#c0392b;border-color:#c0392b;color:#fff}
.elb-q.locked .option{cursor:default}
.elb-q .feedback{font:600 .74em/1.35 Inter,system-ui,sans-serif;margin:.4em 0 0;padding:0;background:none;border:0}
.elb-q .feedback:empty{display:none}.elb-q .feedback.ok{color:#17703f}.elb-q .feedback.no{color:#b3261e}
.elb-q .actions{display:flex;gap:.6em;flex-wrap:wrap;margin:.7em 0 0}
.elb-q [hidden]{display:none!important}
.elb-q .btn{font:800 .8em/1.2 Inter,system-ui,sans-serif;padding:.7em 1.2em;border-radius:.7em;min-height:0;text-decoration:none;display:inline-flex;align-items:center;cursor:pointer}
.elb-q .result{font:700 .76em/1.35 Inter,system-ui,sans-serif;margin:.4em 0 0;padding:.6em .8em;border-radius:.6em;background:#f1f6f3;color:#17463a;border:0}
.elb-q .result:not(.show){display:none}
.elbq-after{margin-top:.6em}.elbq-after .actions{margin-top:.5em}.elbq-after[hidden]{display:none}
.elbq-end{font:700 .8em/1.35 Inter,system-ui,sans-serif;color:#17463a;margin:0}
.elb-q .guess-back{font:.7em/1.45 Inter,system-ui,sans-serif;background:#fff4e8;border:1px solid #f3cfa8;border-radius:.6em;padding:.6em .8em;margin:0 0 1.1em;color:#5b3a12}
@media (max-width:520px){.elb-stage{padding:10px 4px 8px}.elb-bar{gap:6px}.elb-bar button{padding:8px 11px;min-height:40px}.elb-bar .elb-n{min-width:0;flex-basis:100%;order:-1}}
@media (prefers-reduced-motion:reduce){.elb-leaf,.elb-face::after{transition:none}}
`;
  const T = (ca, a, b) => ca ? a : b;
  let fsMine = false;   // the browser's full screen is this script's (so it leaves it); one for every book of the page
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  function mount(el, pages, o) {
    o = o || {};
    if (!el || !pages || !pages.length) return null;
    const endEl = o.end || null, home = endEl && endEl.parentNode;   // destroy() gives the end page back to where it was
    if (endEl && endEl.parentNode) endEl.parentNode.removeChild(endEl);
    if (!document.getElementById('elBookCss')) document.head.insertAdjacentHTML('beforeend', '<style id="elBookCss">' + css + '</style>');
    const all = endEl ? pages.concat([endEl]) : pages.slice();
    const ca = !!o.ca, n = all.length, alt = k => (o.title || 'Book') + ' · ' + T(ca, 'pàgina ', 'page ') + (k + 1);
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
      '<button type="button" class="elb-f">⤢ ' + T(ca, 'Pantalla completa', 'Full screen') + '</button></div><div class="elb-hold" hidden></div>';
    const q = s => el.querySelector(s), L = q('.elb-l'), Rp = q('.elb-r'), leaf = q('.elb-leaf'), book = q('.elb-book'), stage = q('.elb-stage');
    const nb = q('.elb-n'), bp = q('.elb-p'), bx = q('.elb-x'), bz = q('.elb-z'), bf = q('.elb-f'), tip = q('.elb-tip'), hold = q('.elb-hold');
    if (endEl) hold.appendChild(endEl);
    let i = Math.max(0, Math.min(n - 1, o.start | 0)), busy = false, full = false, zoom = false, single = false, seen = false, dead = false, atI = -1;
    // the end page on the moving paper: a copy without ids or names (the live form stays where the engine finds it)
    const copyOf = x => { const c = x.cloneNode(true); c.classList.add('elb-copy'); c.removeAttribute('id'); c.querySelectorAll('[id],[name]').forEach(e => { e.removeAttribute('id'); e.removeAttribute('name'); }); c.querySelectorAll('input,button,a').forEach(e => { e.tabIndex = -1; if ('disabled' in e) e.disabled = true; }); return c; };
    const set = (box, k) => {
      const im = box.querySelector('img'), pg = k != null && k >= 0 && k < n ? all[k] : null, live = pg && typeof pg !== 'string' ? pg : null;
      Array.from(box.children).forEach(c => { if (c === endEl) hold.appendChild(c); else if (c.classList.contains('elb-copy')) c.remove(); });
      box.classList.toggle('blank', !pg); box.classList.toggle('html', !!live);
      if (!pg || live) im.removeAttribute('src');
      if (live) box.appendChild(box.classList.contains('elb-face') ? copyOf(live) : live);
      else if (pg) { im.src = pg; im.alt = alt(k); }
    };
    pages.forEach(src => { const im = new Image(); im.decoding = 'async'; im.src = src; });   // a chapter is 2–5 pages: load them all, so a turn never waits
    const step = () => single ? 1 : 2;
    function draw() {
      if (dead) return;
      if (single) { set(Rp, i); set(L, null); } else { set(L, i); set(Rp, i + 1); }
      const last = Math.min(n, i + step()), qs = endEl && last === n && (single || last - i === 1);
      const lt = endEl ? Math.min(last, n - 1) : last;   // the last picture on screen (the questions page is not counted as a page)
      nb.textContent = (o.pre || '') + (qs ? T(ca, 'Preguntes', 'Questions') : (single || lt - i <= 1 ? T(ca, 'Pàgina ', 'Page ') + (i + 1) : T(ca, 'Pàgines ', 'Pages ') + (i + 1) + '–' + lt) + T(ca, ' de ', ' of ') + (endEl ? n - 1 : n) + (endEl && last === n ? ' · ' + T(ca, 'Preguntes', 'Questions') : ''));
      bp.disabled = i === 0; q('.elb-hit.prev').disabled = i === 0;
      const end = i + step() >= n, onEnd = endEl && last === n;
      // the end page takes the taps (its options); the arrows, the keys and dragging the page still turn
      q('.elb-hit.prev').classList.toggle('off', !!onEnd); q('.elb-hit.next').classList.toggle('off', !!onEnd);
      bx.textContent = end ? T(ca, 'Fi', 'The end') : (endEl && i + 2 * step() >= n ? T(ca, 'Preguntes', 'Questions') + ' ▶' : T(ca, 'Gira la pàgina', 'Turn the page') + ' ▶');
      bx.disabled = end; bx.hidden = end && !!endEl;
      if (onEnd && o.atEnd) o.atEnd();
      if (i !== atI) { atI = i; if (o.onTurn) o.onTurn(i); }   // where the student is (the one-book page keeps it to come back there)
    }
    function fit() {
      if (dead) return;
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
    // setup(dir) puts the leaf at its start (a0) and returns where it ends (a1); go() moves it to the end or back to the start.
    function setup(dir) {
      const s = step(), to = i + dir * s;
      if (dir > 0 && i + s >= n) return null;
      if (dir < 0 && i === 0) return null;
      seen = true; tip.hidden = true;
      const front = leaf.querySelector('.elb-front'), back = leaf.querySelector('.elb-back');
      leaf.style.transition = 'none'; leaf.classList.remove('turn');
      let a0 = 0, a1;
      if (single) {
        leaf.style.left = '0'; leaf.style.transformOrigin = 'left center';
        // one page: the page lifts away to the left until it is edge-on (no back to show), or comes back over the page
        if (dir > 0) { set(front, i); set(back, null); set(Rp, to); a1 = -90; }
        else { set(front, to); set(back, null); a0 = -90; a1 = 0; }
      } else if (dir > 0) {
        leaf.style.left = 'var(--pw)'; leaf.style.transformOrigin = 'left center';
        set(front, i + 1); set(back, i + 2); set(Rp, i + 3); a1 = -180;
      } else {
        leaf.style.left = '0'; leaf.style.transformOrigin = 'right center';
        set(front, i); set(back, i - 1); set(L, i - 2); a1 = 180;
      }
      leaf.style.transform = 'rotateY(' + a0 + 'deg)';
      leaf.classList.add('on'); void leaf.offsetWidth;
      return { to, a0, a1 };
    }
    function go(t, all, sec) {
      busy = true;
      leaf.style.transition = 'transform ' + sec + 's cubic-bezier(.3,.1,.3,1)'; leaf.classList.add('turn');
      leaf.style.transform = 'rotateY(' + (all ? t.a1 : t.a0) + 'deg)';
      let done = false;
      const end = () => { if (done) return; done = true; if (all) i = t.to; draw(); leaf.classList.remove('on', 'turn'); leaf.style.transition = ''; busy = false; };
      leaf.addEventListener('transitionend', function h(e) { if (e.target !== leaf) return; leaf.removeEventListener('transitionend', h); end(); });
      setTimeout(end, sec * 1000 + 300);
    }
    function turn(dir) {
      if (dead || busy || drag) return;
      if (!motion()) { const s = step(); if ((dir > 0 && i + s >= n) || (dir < 0 && i === 0)) return; seen = true; tip.hidden = true; i = Math.max(0, i + dir * s); draw(); return; }
      const t = setup(dir); if (t) { leaf.style.transition = ''; go(t, true, .75); }
    }
    // Dragging the page (Roger, 13 Nov 2026: "I want them to pass pages by dragging them"): with a finger or the mouse the paper follows
    // the hand, its edge where the hand is; let go past a third of the way (or with a quick flick) and it turns, before that it falls back.
    // A tap still turns (or opens full screen the first time); the end page's options and buttons keep their taps.
    let drag = null, noClick = 0;
    const angle = (d, p) => single ? (d > 0 ? -Math.acos(1 - p) : -Math.acos(p)) : (d > 0 ? -1 : 1) * Math.acos(1 - 2 * p);
    book.addEventListener('pointerdown', e => {
      if (busy || drag || zoom || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.target.closest && e.target.closest('.elb-q :is(label,input,button,a,select,textarea)')) return;
      const r = book.getBoundingClientRect();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, rx: e.clientX - r.left, w: r.width, t: null, p: 0, hist: [[e.timeStamp, e.clientX]] };
    });
    book.addEventListener('pointermove', e => {
      const d = drag; if (!d || e.pointerId !== d.id) return;
      if (e.pointerType === 'mouse' && !(e.buttons & 1)) return drop(e);   // the button is up but its pointerup never came (Roger, 13 Nov 2026: "when I drag I can't release")
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.t) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.2) { drag = null; return; }   // up and down: the page scrolls (the questions page)
        d.dir = dx < 0 ? 1 : -1; d.t = setup(d.dir);
        if (!d.t) { drag = null; return; }   // nothing to turn that way
        busy = true;
        try { book.setPointerCapture(e.pointerId); } catch (x) { }
        if (motion()) leaf.classList.add('turn');
      }
      e.preventDefault();
      const room = d.dir > 0 ? d.rx : d.w - d.rx, pw = d.w / (single ? 1 : 2);
      d.p = Math.max(0, Math.min(1, (d.dir > 0 ? -dx : dx) / Math.max(room, pw * .5)));
      leaf.style.transform = 'rotateY(' + angle(d.dir, d.p) * 180 / Math.PI + 'deg)';
      d.hist.push([e.timeStamp, e.clientX]); if (d.hist.length > 6) d.hist.shift();
    });
    const drop = e => {
      const d = drag; if (!d || e.pointerId !== d.id) return;
      drag = null; if (!d.t) return;
      noClick = Date.now() + 400;   // the tap that ends a drag is not a tap on the page
      const h = d.hist, a = h[0], b = h[h.length - 1], v = b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;   // px per ms, + to the right
      const flick = (d.dir > 0 ? -v : v) > .45 && d.p > .04, back = (d.dir > 0 ? v : -v) > .45;
      const all = e.type !== 'pointercancel' && !back && (d.p > .25 || flick);
      busy = false; go(d.t, all, all ? .22 + .45 * (1 - d.p) : .18 + .35 * d.p);
    };
    book.addEventListener('pointerup', drop); book.addEventListener('pointercancel', drop); book.addEventListener('lostpointercapture', drop);
    // let go anywhere: outside the book, outside the page's frame (the preview), or the window losing the mouse
    const dropAny = e => { if (drag && (!e || e.pointerId == null || e.pointerId === drag.id)) drop({ type: 'pointerup', pointerId: drag.id, timeStamp: e && e.timeStamp || performance.now() }); };
    const mUp = e => dropAny({ timeStamp: e.timeStamp }), wBlur = () => dropAny();
    addEventListener('pointerup', dropAny, true); addEventListener('mouseup', mUp, true); addEventListener('blur', wBlur);
    book.addEventListener('click', e => { if (Date.now() < noClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    function toggleFull(on, stay, keepFs) {
      full = on == null ? !full : on;
      if (!full) zoom = false;
      el.classList.toggle('full', full); document.documentElement.classList.toggle('elb-lock', full);
      bf.textContent = full ? '✕ ' + T(ca, 'Tanca', 'Close') : '⤢ ' + T(ca, 'Pantalla completa', 'Full screen');
      const E = document.documentElement, rq = E.requestFullscreen || E.webkitRequestFullscreen;
      try {
        if (full && !fsEl() && rq) { fsMine = true; const r = rq.call(E); if (r && r.catch) r.catch(() => { fsMine = false; }); }
        else if (!full && !keepFs && fsMine && fsEl()) { fsMine = false; (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
      } catch (e) { fsMine = false; }
      fit(); if (full) el.focus({ preventScroll: true });
      if (!full && !stay) el.scrollIntoView({ block: 'nearest' });
    }
    const fc = () => { if (!fsEl()) { if (full && fsMine) { fsMine = false; toggleFull(false); } else if (!full) fsMine = false; } fit(); };
    document.addEventListener('fullscreenchange', fc); document.addEventListener('webkitfullscreenchange', fc);
    bp.onclick = () => turn(-1); bx.onclick = () => turn(1); bf.onclick = () => toggleFull();
    bz.onclick = () => { zoom = !zoom; fit(); stage.scrollTop = 0; };
    q('.elb-hit.prev').onclick = () => turn(-1);
    q('.elb-hit.next').onclick = () => { if (!full && !seen && innerWidth >= 700) { seen = true; toggleFull(true); return; } turn(1); };
    el.addEventListener('keydown', e => {
      if (dead) return;
      if (e.key !== 'Escape' && e.target.closest && e.target.closest('input,button,a,textarea,select') && e.target !== el) return;   // the end page's options and buttons keep their keys
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && full)) { e.preventDefault(); turn(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); turn(-1); }
      else if (e.key === 'Escape' && full) { e.preventDefault(); toggleFull(false); }
    });
    const ro = window.ResizeObserver ? new ResizeObserver(() => fit()) : null, rz = () => { if (full || !ro) fit(); };
    if (ro) ro.observe(el); addEventListener('resize', rz);
    if (!single && i % 2 && innerWidth >= 700) i--;
    fit();
    return {
      open() { if (!full) { seen = true; toggleFull(true); } },
      close(keepFs) { if (full) toggleFull(false, true, keepFs); },
      isFull: () => full,
      toEnd() { i = single ? n - 1 : (n - 1) - ((n - 1) % 2); draw(); },
      // another chapter in the same place (one-book page): listeners off, the end page back home, the browser's full screen kept if asked
      destroy(keepFs) {
        if (dead) return; if (full) toggleFull(false, true, keepFs); dead = true;
        document.removeEventListener('fullscreenchange', fc); document.removeEventListener('webkitfullscreenchange', fc);
        removeEventListener('resize', rz); if (ro) ro.disconnect();
        removeEventListener('pointerup', dropAny, true); removeEventListener('mouseup', mUp, true); removeEventListener('blur', wBlur);
        if (endEl && home) home.appendChild(endEl);
        el.innerHTML = '';
      }
    };
  }
  window.ELBook = { mount };
})();
