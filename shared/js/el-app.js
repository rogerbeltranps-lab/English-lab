// English Lab as an app (Roger, 6 Nov 2026: "I want everything to look like an app for them even though they connect through a
// Chromebook most of the time"; "these things should look like buttons"; "it's not my activities but my dashboard").
// Loaded by el-cloud.js on every page; it acts only on the student pages that are not the board (today.html) or an LS home
// (body.lsh, el-ls-home.js), which have the full menu already:
//   lp     · learning paths, checkpoints, Reflect, final product, sample exam (LS2 on: the engine's #sessionJump in .topbar)
//   course · the course pages (2eso/, 4eso/: "All Learning Situations")
//   games  · vocabulary games (<ls>/vocabulary-games.html)
//   lab    · English Lab and Practise (lab/, lab/practice.html), which keep their side menu, now as buttons
// It adds the board's menu as one strip of icon buttons on the left (a computer) or the board's bottom bar (a phone):
// 🏠 My dashboard · 📚 the LS · 🗂 All Learning Situations · 🧪 English Lab · 🎯 Practise · ❓ Help (the teacher: 📊 Dashboard and no Help).
// LS1 pages keep their design (Roger's rule: leave LS1 alone). No Firestore reads: who is signed in, the group and the language
// come from el-cloud.js (ELCloud.onUser, its cached reads); the current LS from the time plan (el-plan.js, el-week.js: static files).
// Styles: shared/css/el-app.css.
(function () {
  if (window.ELApp) return;
  const ROOT = new URL("../../", document.currentScript ? document.currentScript.src : location.href).href;
  const path = location.pathname, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const LS1 = /\/my-real-routine\//.test(path);
  const m = path.match(/\/((?:2|4)eso)\/([^/]+)\/[^/]*$/), lsHere = m && !LS1 ? m[1] + "-" + m[2] : null;
  const mode = LS1 || /\/(today|teacher)\.html$/.test(path) || document.body.classList.contains("lsh") ? null
    : $(".topbar #sessionJump") ? "lp"
    : /\/vocabulary-games\.html$/.test(path) ? "games"
    : /\/lab\/(index\.html|practice\.html)?$/.test(path) ? "lab"
    : /\/(?:2|4)eso\/(index\.html)?$/.test(path) ? "course" : null;
  window.ELApp = { mode };
  if (!mode) return;
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = ROOT + "shared/css/el-app.css"; document.head.append(css);
  const course0 = (path.match(/\/((?:2|4)eso)\//) || [])[1] || null;

  let who = { role: localStorage.getItem("el_uid") ? "student" : "none" }, CA = false;   // a student who signed in here before: no flash
  const t = (ca, en) => CA ? ca : en;
  const load = (src, has) => has() ? Promise.resolve() : new Promise(r => { const s = document.createElement("script"); s.src = ROOT + src; s.onload = s.onerror = r; document.head.append(s); });
  const lsHref = id => { const l = (window.EL_LS || []).find(x => x.id === id); return l ? ROOT + l.course + "/" + l.id.slice(l.course.length + 1) + "/index.html" : null; };
  const lsName = id => { const l = (window.EL_LS || []).find(x => x.id === id); return l ? l.title.replace(/^\S+ · /, "") : ""; };

  // the LS the menu opens: this page's LS, else the group's LS by the time plan, else the course's last LS
  let curLs = lsHere;
  function pickLs() {
    if (lsHere) return lsHere;
    const g = who.group, c = who.course || course0;
    const now = g && window.ELWeek && ELWeek.now(g);
    if (now && now.ls) return now.ls;
    const ls = (window.EL_LS || []).filter(l => l.course === c && !/my-real-routine/.test(l.id));
    return ls.length ? ls[ls.length - 1].id : null;
  }
  function items() {
    const teach = who.role === "teacher", C = window.ELCloud;
    const board = who.as ? ROOT + "today.html?student=" + encodeURIComponent(who.as) : ROOT + "today.html";
    const c = who.course || course0 || (curLs || "").split("-")[0];
    const dash = ROOT + "teacher.html" + (c ? "?course=" + c + (curLs ? "&ls=" + encodeURIComponent(curLs) : "") : "");
    const lsLink = curLs && lsHref(curLs), back = $(".topbar .brand>a.elback"), lsT = lsName(curLs) || (back && back.dataset.ls) || "";
    const lsN = (() => { const cl = (window.EL_LS || []).filter(l => l.id.split("-")[0] === (curLs || "").split("-")[0]); const i = cl.findIndex(l => l.id === curLs); return i >= 0 ? "LS" + (i + 1) : "LS"; })();
    const here = mode === "lp" || mode === "games" ? "ls" : mode === "course" ? "all" : /practice\.html$/.test(path) ? "practise" : "lab";
    const L = [];
    if (who.role === "none") {
      L.push(["home", "⌂", "Home", "Home", ROOT + "index.html"]);
      L.push(["lab", "🧪", "English Lab", "Lab", ROOT + "lab/"]);
    } else {
      L.push(teach ? ["dash", "📊", "Dashboard", "Dashboard", dash] : ["board", "🏠", t("El meu tauler", "My dashboard"), t("El meu tauler", "My dashboard"), board]);
      if (lsLink) L.push(["ls", "📚", lsN + (lsT ? " · " + lsT : ""), lsN, lsLink]);
      if (c) L.push(["all", "🗂", t("Totes les Learning Situations", "All Learning Situations"), t("Totes les LS", "All LS"), ROOT + c + "/index.html"]);
      L.push(["lab", "🧪", "English Lab", "Lab", ROOT + "lab/"]);
      L.push(["practise", "🎯", t("Practica", "Practise"), t("Practica", "Practise"), ROOT + "lab/practice.html"]);
      if (!teach) L.push(["help", "❓", t("Ajuda", "Help"), t("Ajuda", "Help"), board + "#help"]);
    }
    return L.map(([k, i, long, short, h]) => ({ k, i, long, short, h, on: k === here }));
  }

  // ---- drawing
  function rail(L) {
    let r = $(".elrail");
    if (!r) { r = document.createElement("nav"); r.className = "elrail"; r.setAttribute("aria-label", "Menu"); document.body.prepend(r); }
    r.innerHTML = L.map(x => `<a class="elr${x.on ? " on" : ""}" href="${x.h}" title="${esc(x.long)}"${x.on ? ' aria-current="page"' : ""}><i aria-hidden="true">${x.i}</i><span>${esc(x.short)}</span></a>`).join("");
    document.body.classList.add("elhas-rail");
  }
  function bar(L) {
    let b = $(".elbar");
    if (!b) { b = document.createElement("nav"); b.className = "elbar"; b.setAttribute("aria-label", "Menu"); document.body.append(b); }
    const sh = x => x.k === "board" ? t("Inici", "Home") : x.short;   // the board's bottom bar says Home
    b.innerHTML = L.map(x => `<a${x.on ? ' class="on" aria-current="page"' : ""} href="${x.h}"><i aria-hidden="true">${x.i}</i><span>${esc(sh(x))}</span></a>`).join("");
    document.body.classList.add("elhas-bar");
  }
  function side(L) {   // English Lab and Practise: their side menu, as the board's buttons
    const tabs = $(".sidebar .nav-tabs");
    if (!tabs) return;
    let s = $(".elside");
    if (!s) { s = document.createElement("nav"); s.className = "elside"; s.setAttribute("aria-label", "Menu"); tabs.after(s); }
    s.innerHTML = L.map(x => `<a class="nv${x.on ? " on" : ""}" href="${x.h}"${x.on ? ' aria-current="page"' : ""}><span class="ic" aria-hidden="true">${x.i}</span><span class="lb">${esc(x.long)}</span></a>`).join("");
  }
  function crumb() {   // course pages: ‹ My dashboard, as on the LS home
    if (mode !== "course") return;
    let c = $(".elcrumb");
    if (who.role === "none") { if (c) c.remove(); return; }
    if (!c) { c = document.createElement("div"); c.className = "elcrumb"; const h = $("body>header"); if (h) h.after(c); else document.body.prepend(c); }
    const L = items(), first = L[0];
    c.innerHTML = `<a href="${first.h}">‹ ${esc(first.long)}</a>`;
  }
  function lpBar() {   // learning paths: the back link to the LS, as a button
    if (mode !== "lp") return;
    $$(".topbar .brand>a").forEach(a => {
      if (a.classList.contains("lp-home-link") || a.hasAttribute("data-el-board") || a.classList.contains("elback")) return;
      a.dataset.ls = a.textContent.replace(/^\s*←\s*/, "").trim(); a.textContent = a.dataset.ls; a.classList.add("elback");
    });
  }
  function draw() {
    const on = who.role !== "none" || mode === "lp" || mode === "games";   // course pages and English Lab keep the public look when signed out
    document.body.classList.toggle("elapp", on);
    document.body.classList.add("el" + mode);
    if (!on) { $$(".elrail,.elbar,.elside,.elcrumb").forEach(e => e.remove()); document.body.classList.remove("elhas-rail", "elhas-bar"); return; }
    lpBar();
    curLs = pickLs();
    const L = items();
    if (mode === "lab") side(L); else rail(L);
    bar(L);
    crumb();
    document.documentElement.classList.toggle("el-ca", CA);
  }

  const start = () => {
    draw();
    // the course's LSs and the time plan: static files, no reads
    load("shared/js/el-catalog.js", () => window.EL_LS).then(() => draw());
    let tries = 0;
    (function wait() {
      const C = window.ELCloud;
      if (C && C.onUser) {
        C.onUser(async u => {
          const AS = C.viewing;
          if (!u) who = { role: "none" };
          else if (AS) who = { role: "student", as: AS.uid, group: AS.group || null };
          else if (C.isTeacher(u)) who = { role: "teacher" };
          else who = { role: C.isTester(u) && !C.viewGroup() ? "tester" : "student", group: C.group() };
          const g = who.group;
          who.course = g ? ((window.EL_GROUPS || []).find(x => x.id === g) || {}).course || g.slice(0, 4).toLowerCase() : null;
          CA = (who.role === "student") && C.ca === true;
          if (g) await Promise.all([load("shared/js/el-plan.js", () => window.EL_PLAN), load("shared/js/el-week.js", () => window.ELWeek)]);
          draw();
        });
        return;
      }
      if (++tries < 300) setTimeout(wait, 100);
    })();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.ELApp.redraw = () => draw();
})();
