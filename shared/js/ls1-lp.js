/* LS1 learning paths in the LS2 layout (Roger, 8 Nov 2026: "Make LP and SLP of the LS1 look like the LS2 (with the new design)").
   The LS1 pages keep their own content and scripts; this file only gives them the parts the LS2 engine pages draw in #lp, so
   el-app.js (lpLayout) puts the path in the left column on a computer: main#lp > .lp-top (extra hero pieces: warm note, class
   slides, sample slides and rubric) + .lp-body > nav.tabs (steps as .tn number + .tl label, done/next) + .lp-panels.
   Load it after section-next.js and before the page's sectionNext.init: it reads each step's done() from that call.
   Content, answers and saving are unchanged. No Firestore reads. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const main = $("main.wrap"), nav = main && main.querySelector(":scope>nav.tabs"), hero = $("header.hero");
  if (!main || !nav || main.id === "lp") return;

  // the engine's step and column styles (ls2-engine.js, #trackNoteCss), for the phone and narrow windows too
  if (!document.getElementById("trackNoteCss")) document.head.insertAdjacentHTML("beforeend", '<style id="trackNoteCss">'
    + '.tab .tn{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-width:24px;height:24px;border-radius:999px;font-size:.85rem}.tab.done .tn{background:#16a34a!important;color:#fff!important;font-size:0}.tab.done .tn::after{content:"✓";font-size:.85rem}.tab.next:not(.active){box-shadow:inset 0 0 0 2px var(--accent,#315f9f)}'
    + '@media (min-width:1000px){.lp-body{display:grid;grid-template-columns:250px minmax(0,1fr);gap:22px;align-items:start}.lp-body>.el-tsec{grid-column:1/-1}.lp-body>.tabs{flex-direction:column;overflow:visible;position:sticky;top:76px;padding:0;gap:6px}.lp-body .tab{display:flex;align-items:center;gap:10px;text-align:left;white-space:normal;padding:11px 13px}.lp-body .tab.next:not(.active)::after{content:attr(data-next);margin-left:auto;font-size:.7rem;letter-spacing:.06em;color:var(--accent,#315f9f)}}'
    + '.lp-top{display:flex;flex-direction:column;gap:10px;align-items:stretch;margin:0 0 14px}.lp-top>*{margin:0!important}.lp-top .hero-quick-actions{justify-content:flex-start}.lp-top .deck-link{align-self:flex-start}.routes:has(.route[style*="none"]){display:flex;flex-wrap:wrap}.routes:has(.route[style*="none"]) .route{flex:0 0 auto;padding:8px 16px;min-height:0}'
    + '.hero{padding:24px 0 18px!important}.hero h1{font-size:clamp(2rem,3.4vw,2.8rem)!important;margin:.15em 0 .2em!important}'
    + '@media (max-width:640px){.topbar{position:static!important}.hero{padding:14px 0 10px!important}.hero h1{font-size:1.75rem!important}.hero .lead{font-size:.98rem;margin:.2em 0 .6em}.hero .eyebrow{font-size:.72rem}.lp-body>.tabs{position:sticky;top:0;z-index:25;margin:0 -16px 10px;padding:8px 16px;background:var(--bg,#f4f7fb);box-shadow:0 6px 10px -8px #0f172a40;gap:6px;scrollbar-width:none}.lp-body>.tabs::-webkit-scrollbar{display:none}.lp-body .tab{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;font-size:.92rem;border-radius:11px}.lp-body .tab .tn{min-width:22px;height:22px}.panel{padding:16px!important;border-radius:16px!important}.panel-head h2{font-size:1.35rem}}'
    + '</style>');

  // the hero: the eyebrow straight in .wrap (the final product has it in .hero-topline), and every other piece (warm note, class
  // slides, sample slides and rubric) in .lp-top, which el-app.js shows in the left column under the steps
  const w = hero && (hero.querySelector(".wrap") || hero), top = document.createElement("div");
  top.className = "lp-top";
  if (w) {
    const tl = w.querySelector(":scope>.hero-topline");
    if (tl) { const eb = tl.querySelector(".eyebrow"); if (eb) tl.before(eb); [...tl.children].forEach(e => top.append(e)); tl.remove(); }
    [...w.children].forEach(e => { if (!e.matches(".eyebrow,h1,.lead,.routes,[data-el-teacher]")) top.append(e); });
  }

  // the back button says which LS, as on LS2 ("‹ LS2 · Free Time, Live!")
  const back = $('.topbar .brand>a[href="index.html"]');
  if (back && !/LS1/.test(back.textContent)) back.textContent = back.textContent.replace(/^\s*(←\s*)?/, "$1LS1 · ");

  // main#lp > .lp-top + .lp-body (nav.tabs + .lp-panels)
  main.id = "lp";
  const body = document.createElement("div"), panels = document.createElement("div");
  body.className = "lp-body"; panels.className = "lp-panels";
  const after = []; for (let e = nav.nextSibling; e; e = e.nextSibling) after.push(e);
  const before = []; for (let e = nav.previousSibling; e; e = e.previousSibling) before.unshift(e);
  if (!nav.getAttribute("aria-label")) nav.setAttribute("aria-label", "Sections");
  after.forEach(e => panels.append(e));
  body.append(nav, panels);
  if (top.children.length) main.append(top);
  before.forEach(e => main.append(e));
  main.append(body);

  // steps as number + label; the pages rewrite a tab's text when the route changes (Catalan / English), so it is done again then.
  // The page's own number is kept (the final product's steps are 1-8 after Mission, as its headings say); a tab without one gets ★.
  // The nav moves into the left column on a computer (el-app.js), so it is always found from `nav`, never from .lp-body.
  const tabs = () => [...nav.querySelectorAll(":scope>.tab")];
  let busy = false;
  function wrapTabs() {
    if (busy) return; busy = true;
    tabs().forEach(t => {
      if (t.querySelector(":scope>.tn")) return;
      const sw = [...t.querySelectorAll(":scope>.el-tsw")];
      const raw = t.textContent.replace(/[🔓🔒]/gu, "").trim(), num = (raw.match(/^(\d+)\s*[·.]?\s*/) || [])[1];
      t.textContent = "";
      const n = document.createElement("span"); n.className = "tn"; n.textContent = num || "★";
      const txt = raw.replace(/^\d+\s*[·.]?\s*/, "");
      const l = document.createElement("span"); l.className = "tl"; l.textContent = txt;
      t.append(n, " ", l, ...sw);
    });
    busy = false;
  }
  wrapTabs();
  new MutationObserver(() => { if (!busy) wrapTabs(); }).observe(nav, { childList: true, subtree: true, characterData: true });

  // a tick on every step done, the first one not done marked NEXT (ls2-engine.js markTabs), from the page's own sectionNext steps
  const steps = []; let lev = () => "insecure";
  const sn = window.sectionNext;
  if (sn) {
    const init = sn.init, fin = sn.final;
    sn.init = function (c) { if (c && c.panels) c.panels.forEach(p => steps.push(p)); if (c && c.level) lev = c.level; const r = init.apply(this, arguments); markTabs(); return r; };
    if (fin) sn.final = function (c) { if (c) steps.push(c); const r = fin.apply(this, arguments); markTabs(); return r; };
  }
  function markTabs() {
    let next = false; const ca = /^(insecure|beginners)$/.test(lev());
    tabs().forEach(t => {
      const s = steps.find(x => x.id === t.dataset.panel); if (!s) return;
      let d = false; try { d = !!s.done(); } catch (e) {}
      t.classList.toggle("done", d); t.classList.toggle("next", !d && !next); t.dataset.next = ca ? "SEGÜENT" : "NEXT";
      if (!d) next = true;
    });
  }
  ["click", "input", "change"].forEach(type => document.addEventListener(type, () => setTimeout(markTabs, 80)));
  const pt = document.getElementById("progressText");
  if (pt) new MutationObserver(() => markTabs()).observe(pt, { childList: true, characterData: true, subtree: true });
  window.ls1Lp = { markTabs };
})();
