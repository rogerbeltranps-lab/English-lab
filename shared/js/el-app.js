// English Lab as an app (Roger, 6 Nov 2026: "I want everything to look like an app for them even though they connect through a
// Chromebook most of the time"; "these things should look like buttons"; "it's not my activities but my dashboard").
// Loaded by el-cloud.js on every page; it acts only on the student pages that are not the board (today.html) or an LS home
// (body.lsh, el-ls-home.js), which have the full menu already:
//   lp     · learning paths, checkpoints, Reflect, final product, sample exam (LS2 on: the engine's #sessionJump in .topbar)
//   course · the course pages (2eso/, 4eso/: "All Learning Situations")
//   games  · vocabulary games (<ls>/vocabulary-games.html)
//   lab    · Games and Practise (lab/, lab/practice.html), which keep their side menu, now as buttons
//   home   · the site's home page (index.html), now only a welcome page to sign in with no menu (Roger, 7 Nov 2026: "it makes no
//            sense that this menu exists since we all go to the dashboards"); whoever is signed in goes to their dashboard. Only the
//            teacher's and the test account's Courses and Learning Situations lists (#courses, #learning) stay, with this menu
// It adds the LS home's side menu on the left (a computer: brand + wide buttons; a narrow window: a strip of icon buttons) or the
// board's bottom bar (a phone):
// 🏠 My dashboard · 📚 the LS · 🗂 All Learning Situations · 🎲 Games · 🎯 Practise · ❓ Help (the teacher: 📊 Dashboard and no Help).
// Games replaced English Lab (Roger, 7 Nov 2026: "I want games on the left and vocabulary and grammar in practice, English Lab is not
// needed anymore"): lab/ is now the Games page, and Practise has the vocabulary and grammar at the student's level.
// LS1 pages keep their design (Roger's rule: leave LS1 alone). No Firestore reads: who is signed in, the group and the language
// come from el-cloud.js (ELCloud.onUser, its cached reads); the current LS from the time plan (el-plan.js, el-week.js: static files).
// Styles: shared/css/el-app.css.
(function () {
  if (window.ELApp) return;
  const ROOT = new URL("../../", document.currentScript ? document.currentScript.src : location.href).href;
  const path = location.pathname, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // LS1 learning paths (the pages with the path selector) look like LS2 (Roger, 8 Nov 2026: "Make LP and SLP of the LS1 look like the
  // LS2"; ls1-lp.js gives them the engine's parts); the rest of LS1 (home, games, models, rubric, sample exam) keeps its design
  const LS1 = /\/my-real-routine\//.test(path) && !$(".topbar #sessionJump");
  const m = path.match(/\/((?:2|4)eso)\/([^/]+)\/[^/]*$/), lsHere = m && !LS1 ? m[1] + "-" + m[2] : null;
  const mode = LS1 || /\/(today|teacher)\.html$/.test(path) || document.body.classList.contains("lsh") ? null
    : $(".topbar #sessionJump") ? "lp"
    : /\/vocabulary-games\.html$/.test(path) ? "games"
    : /\/lab\/(index\.html|practice\.html)?$/.test(path) ? "lab"
    : /\/(?:2|4)eso\/(index\.html)?$/.test(path) ? "course"
    : document.body.classList.contains("elroot") ? "home" : null;
  window.ELApp = { mode };
  // The page shows once this file has drawn it (Roger, 7 Nov 2026, video: "all pages still pop up in between"): pages with
  // <html class="elgate"> stay hidden until html.elready (el-app.css), so the browser never paints the page's own old layout, the
  // menu without its styles or a half-moved learning path. html.elhold: the page adds elready itself (English Lab, after its first
  // drawing). el-app.css shows the page anyway after 1.5 s.
  // Nobody signed in on this browser (no el_who): the page stays hidden until Firebase knows who it is (html.elwait; el-cloud.js
  // shows it, with the Sign in screen for a signed-out visitor), so the page never flashes before the Sign in (Roger, 7 Nov 2026).
  const ready = () => { const h = document.documentElement; if (h.classList.contains("elhold")) return;
    let known = true; try { known = !!localStorage.getItem("el_who"); } catch (e) {}
    if (mode === "home") known = true;   // the home page is the same for a signed-out visitor: it shows at once
    h.classList.add(known ? "elready" : "elwait"); };
  if (!mode) { ready(); return; }
  if (!document.querySelector('link[href$="shared/css/el-app.css"]')) { const css = document.createElement("link"); css.rel = "stylesheet"; css.href = ROOT + "shared/css/el-app.css"; document.head.append(css); }
  const course0 = (path.match(/\/((?:2|4)eso)\//) || [])[1] || null;

  // Who is signed in is known only once Firebase has loaded: until then the menu is drawn for who was signed in on this browser last
  // (el_who, saved by el-cloud.js), so the page opens on its real look, not the signed-out one (Roger, 7 Nov 2026).
  const W = (() => { try { return JSON.parse(localStorage.getItem("el_who") || "null"); } catch (e) { return null; } })();
  const AS0 = (() => { try { return JSON.parse(sessionStorage.getItem("el_as") || "null"); } catch (e) { return null; } })();
  let who = !W ? { role: localStorage.getItem("el_uid") ? "student" : "none" }
    : W.role === "teacher" && AS0 && AS0.uid ? { role: "student", as: AS0.uid, group: AS0.group || null }
    : { role: W.role, group: W.group || null };
  if (who.group) who.course = who.group.slice(0, 4).toLowerCase();
  // the teacher's student view (el_as): the student's language, kept with el_as (el-cloud.js), not the teacher's English first
  let CA = !!W && (who.as ? AS0.ca !== false : W.role === "student" && W.ca !== false);   // a student with no level known yet: Catalan, as el-ls-home.js (Starter and Base)
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
    const here = mode === "home" ? ((location.hash.match(/^#(courses|learning)$/) || [])[1] || "")
      : mode === "lp" ? "ls" : mode === "course" ? "all" : /practice\.html$/.test(path) ? "practise" : "games";
    const L = [];
    if (who.role === "none") {
      L.push(["home", "⌂", "Home", "Home", ROOT + "index.html"]);
      L.push(["games", "🎲", "Games", "Games", ROOT + "lab/"]);
    } else {
      L.push(teach ? ["dash", "📊", "Dashboard", "Dashboard", dash] : ["board", "🏠", t("El meu tauler", "My dashboard"), t("El meu tauler", "My dashboard"), board]);
      if (!teach) L.push(["practise", "🎯", t("Practica", "Practise"), t("Practica", "Practise"), ROOT + "lab/practice.html"]);   // students: Practise right below My dashboard (Roger, 7 Nov 2026)
      if (lsLink) L.push(["ls", "📚", lsN + (lsT ? " · " + lsT : ""), lsN, lsLink]);
      if (c) L.push(["all", "🗂", t("Totes les Learning Situations", "All Learning Situations"), t("Totes les LS", "All LS"), ROOT + c + "/index.html"]);
      L.push(["games", "🎲", t("Jocs", "Games"), t("Jocs", "Games"), ROOT + "lab/"]);
      if (teach) L.push(["practise", "🎯", t("Practica", "Practise"), t("Practica", "Practise"), ROOT + "lab/practice.html"]);
      if (!teach) L.push(["help", "❓", t("Ajuda", "Help"), t("Ajuda", "Help"), board + "#help"]);
    }
    if (mode === "home" && (who.role === "teacher" || who.role === "tester"))   // the teacher's lists: Courses and Learning Situations after Dashboard
      L.splice(1, 0, ["courses", "🏫", "Courses", "Courses", ROOT + "index.html#courses"], ["learning", "📚", "Learning Situations", "LS", ROOT + "index.html#learning"]);
    // the side menu names the LS as the LS home does: only its title (LS2 · … stays in the tooltip and the narrow strip says LS2)
    return L.map(([k, i, long, short, h]) => ({ k, i, long, short, h, side: k === "ls" && lsT ? lsT : long, si: k === "ls" && /^LS\d/.test(short) ? short : i, on: k === here }));
  }

  // ---- drawing
  // a student (and the teacher's student view): the students' menu, the same on every page (elStudentMenu in el-catalog.js; Roger,
  // 7 Nov 2026: "this should always be the same"); the teacher and testers keep this file's menu
  function stuMenu() {
    if (who.role !== "student" || !window.elStudentMenu) return null;
    const c = who.course || course0 || (curLs || "").split("-")[0];
    if (!c) return null;
    const ML = elMenuLs([c], who.group), lss = !curLs || ML.some(l => l.id === curLs) ? ML : [...ML, ...(window.EL_LS || []).filter(l => l.id === curLs)];
    const here = /practice\.html$/.test(path) ? "practise" : mode === "lab" ? "games" : mode === "course" ? "course:" + c : curLs && (mode === "lp" || mode === "games") ? "ls:" + curLs : "";
    let app = false; try { app = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) {}
    const board = who.as ? ROOT + "today.html?student=" + encodeURIComponent(who.as) : ROOT + "today.html";
    return elStudentMenu({ root: ROOT, courses: [c], lss, group: who.group, ca: CA, board, here, app });
  }
  function rail(L) {
    let r = $(".elrail");
    if (!r) { r = document.createElement("nav"); r.className = "elrail"; r.setAttribute("aria-label", "Menu"); document.body.prepend(r); }
    // a computer (Chromebook): the LS home's side menu, brand + wide buttons with labels and › (Roger, 7 Nov 2026: "the format should be
    // the same (buttons)"); a narrow window (641–980 px): the strip of icon buttons; a phone: the bottom bar (bar below)
    // a student on an LS (its learning paths, its vocabulary games): the menu is a strip of icons that opens when the mouse is on it
    // (Roger, 8 Nov 2026: "to see better the screen"; elMiniRail in el-catalog.js, el-app.css section 3)
    const sm = stuMenu(), mini = !!sm && !!curLs && (mode === "lp" || mode === "games") && !!window.elMiniRail;
    document.body.classList.toggle("elmini", mini);
    r.innerHTML = `<a class="elr-brand" href="${ROOT}index.html">English with Roger</a>`
      + `<div class="elside elw">${sm || L.map(x => `<a class="nv${x.on ? " on" : ""}" href="${x.h}"${x.on ? ' aria-current="page"' : ""}><span class="ic${x.si !== x.i ? " lsn" : ""}" aria-hidden="true">${x.si}</span><span class="lb">${esc(x.side)}</span></a>`).join("")}</div>`
      + `<div class="eln">${L.map(x => `<a class="elr${x.on ? " on" : ""}" href="${x.h}" title="${esc(x.long)}"${x.on ? ' aria-current="page"' : ""}><i aria-hidden="true">${x.i}</i><span>${esc(x.short)}</span></a>`).join("")}</div>`;
    document.body.classList.add("elhas-rail");
    if (mini) elMiniRail(r); else r.classList.remove("elopen");
  }
  function bar(L) {
    let b = $(".elbar");
    if (!b) { b = document.createElement("nav"); b.className = "elbar"; b.setAttribute("aria-label", "Menu"); document.body.append(b); }
    const sh = x => x.k === "board" ? t("Inici", "Home") : x.short;   // the board's bottom bar says Home
    b.innerHTML = L.map(x => `<a${x.on ? ' class="on" aria-current="page"' : ""} href="${x.h}"><i aria-hidden="true">${x.i}</i><span>${esc(sh(x))}</span></a>`).join("");
    document.body.classList.add("elhas-bar");
    // a student on a phone (≤640 px): the students' tab bar of every page instead (elPhoneTabs in el-catalog.js, el-phone.css; Roger, 8 Nov 2026),
    // and Practise and Games as the two halves of its Practise tab
    if (who.role === "student" && window.elPhoneTabs) {
      const board = who.as ? ROOT + "today.html?student=" + encodeURIComponent(who.as) : ROOT + "today.html";
      elPhoneTabs({ root: ROOT, board, ls: curLs, here: mode === "lab" ? "practise" : mode === "lp" || mode === "games" ? "ls" : "", ca: CA });
      if (mode === "lab") {
        const main = $("main.content");
        let sg = $(".elpseg");
        if (main && !sg) { sg = document.createElement("nav"); sg.className = "elpseg"; main.before(sg); }
        if (sg) { const pr = /practice\.html$/.test(path);
          sg.setAttribute("aria-label", t("Practica o jocs", "Practise or games"));
          sg.innerHTML = `<a href="${ROOT}lab/practice.html"${pr ? ' class="on" aria-current="page"' : ""}>${t("Practica", "Practise")}</a><a href="${ROOT}lab/"${pr ? "" : ' class="on" aria-current="page"'}>${t("Jocs", "Games")}</a>`; }
      }
    }
  }
  function side(L) {   // Games and Practise: their side menu, as the board's buttons
    const tabs = $(".sidebar .nav-tabs");
    if (!tabs) return;
    let s = $(".elside");
    if (!s) { s = document.createElement("nav"); s.className = "elside"; s.setAttribute("aria-label", "Menu"); tabs.after(s); }
    s.innerHTML = stuMenu() || L.map(x => `<a class="nv${x.on ? " on" : ""}" href="${x.h}"${x.on ? ' aria-current="page"' : ""}><span class="ic${x.si !== x.i ? " lsn" : ""}" aria-hidden="true">${x.si}</span><span class="lb">${esc(x.side)}</span></a>`).join("");
  }
  function crumb() {   // course pages: ‹ My dashboard, as on the LS home
    if (mode !== "course") return;
    let c = $(".elcrumb");
    if (who.role === "none") { if (c) c.remove(); return; }
    if (!c) { c = document.createElement("div"); c.className = "elcrumb"; const h = $("body>header"); if (h) h.after(c); else document.body.prepend(c); }
    const L = items(), first = L[0];
    c.innerHTML = `<a href="${first.h}">‹ ${esc(first.long)}</a>`;
  }
  // ---- All Learning Situations (the course page) for a signed-in user, in the board's style (Roger, 6 Nov 2026: "aquest no m'agrada
  // (all LSs)"): one list of the group's LSs, the one the group is doing now first and in the course colour, each with its number,
  // what it is about, whether it is now, open or closed, and one Open button. The page's own content stays for signed-out visitors.
  // No new reads: ELCloud.lsNow is the cached ls/{id} that el-cloud.js reads for the menus.
  let allInfo = null, allBusy = false, allGen = 0;
  async function allLs() {
    if (mode !== "course") return;
    const gen = ++allGen;
    const main = $("body>main:not(.elall)"), foot = $("body>footer");
    let box = $(".elall");
    if (who.role === "none" || !window.EL_LS) { if (box) box.hidden = true; if (main) main.hidden = false; if (foot) foot.hidden = false; return; }
    const c = who.course || course0, C = window.ELCloud, all = who.role === "teacher" || who.role === "tester";
    const list = (window.EL_LS || []).filter(l => l.course === c);
    if (!allInfo && !allBusy && C && C.lsNow) {
      allBusy = true;
      const o = {}; await Promise.all(list.map(async l => { try { o[l.id] = await C.lsNow(l.id); } catch (e) { o[l.id] = {}; } }));
      allInfo = o; allBusy = false;
      if (gen !== allGen) return allLs();   // a newer drawing came meanwhile (who is signed in is known now): draw once more, with the statuses
    }
    // before the statuses are read: the ones last read in this browser (el_ls_<id>, el-cloud.js), so the list does not change on screen
    const kept = !allInfo && (() => { const o = {}; for (const l of list) { let x = null; try { x = JSON.parse(localStorage.getItem("el_ls_" + l.id) || "null"); } catch (e) {} if (!x) return null; o[l.id] = x; } return o; })();
    const info = allInfo || kept || {}, known = !!(allInfo || kept);
    // what the page says about each LS (its card's text), by folder
    const about = {}; $$("a.card[href]").forEach(a => { const k = (a.getAttribute("href") || "").split("/")[0]; const p = a.querySelector("p"); if (p) about[k] = p.textContent.trim(); });
    const st = id => { const s = (info[id] || {}).status; return s === "public" ? "open" : s || (known ? "hidden" : "open"); };
    const vis = !all && !known ? [] : list.filter(l => all || (st(l.id) !== "hidden" && (!window.elLsForGroup || !who.group || elLsForGroup(l, info[l.id] || {}, who.group))));
    const now = who.group && window.ELWeek && (ELWeek.now(who.group) || {}).ls;
    // looked up again after the wait above: two drawings at once each added a list (Roger, 7 Nov 2026: "why do I see the same info twice?")
    box = $(".elall");
    if (!box) { box = document.createElement("main"); box.className = "elall"; (main || document.body.firstElementChild).before(box); }
    box.hidden = false; if (main) main.hidden = true; if (foot) foot.hidden = true;
    const CN = { "2eso": "2 ESO", "4eso": "4 ESO" };
    const row = l => {
      const n = list.indexOf(l) + 1, k = l.id.slice(c.length + 1), s = st(l.id), cur = l.id === now;
      const chip = !known && !cur ? "" : cur ? `<span class="ch now">${t("Ara", "Now")}</span>` : s === "closed" ? `<span class="ch cl">${t("Tancada · per repassar", "Closed · to review")}</span>` : s === "hidden" ? `<span class="ch hd">Hidden</span>` : `<span class="ch op">${t("Oberta", "Open")}</span>`;
      return `<a class="ells${cur ? " cur" : ""}" href="${ROOT + c + "/" + k + "/index.html"}"><span class="n">LS${n}</span><span class="t"><b>${esc(l.title.replace(/^\S+ · /, ""))}</b><small>${esc(about[k] || "")}</small></span>${chip}<span class="go">${t("Obre", "Open")} ›</span></a>`;
    };
    const order = vis.slice().sort((a, b) => (b.id === now) - (a.id === now));
    box.innerHTML = `<div class="elall-in"><h1>${t("Les meves Learning Situations", "My Learning Situations")}</h1>`
      + `<p class="sub">${CN[c] || ""}${who.group ? " · " + esc(who.group.replace(/^(\d)ESO/, "$1 ESO ")) : ""} · ${t("una per unitat; la de dalt és la que fem ara", "one per unit; the one at the top is the one we are doing now")}</p>`
      + `<div class="ellist">${order.map(row).join("") || (!known && !all ? "" : `<p class="sub">${t("Encara no hi ha cap Learning Situation oberta.", "No Learning Situation is open yet.")}</p>`)}</div>`
      + `<p class="more">${t("N'aniran apareixent més durant el curs.", "More will appear during the year.")}</p></div>`;
  }
  // a student sees only the button of their own level (el-cloud.js applyLevel does it again once it has read the level): at once, so
  // the teacher's Level card with four levels does not show to a student for a second and then go
  function ownLevel() {
    if ((mode !== "lp" && mode !== "games") || who.role !== "student") return;
    const b = $$(".route[data-level]"); if (b.length < 2 || b.some(x => x.style.display === "none")) return;
    const on = b.find(x => x.classList.contains("active") || x.getAttribute("aria-pressed") === "true"); if (!on) return;
    b.forEach(x => { if (x !== on) x.style.display = "none"; });
  }
  function lpBar() {   // learning paths: the back link to the LS, as a button
    if (mode !== "lp") return;
    $$(".topbar .brand>a").forEach(a => {
      if (a.classList.contains("lp-home-link") || a.hasAttribute("data-el-board") || a.classList.contains("elback")) return;
      a.dataset.ls = a.textContent.replace(/^\s*←\s*/, "").trim(); a.textContent = a.dataset.ls; a.classList.add("elback");
    });
  }
  // ---- learning paths on a computer (Roger, 6 Nov 2026: "use a column on the left with info of the LP, and it must be super easy to
  // understand"): a left column with the path (title, what it is, level and steps done, the list of steps, how it works, the study
  // guide, my goal; the teacher's tools at the end) and the step on the right. The engine redraws #lp on every route change, so the
  // pieces it draws (.lp-top, .plan-card, the steps nav) are moved into the column after each redraw; on a phone nothing moves.
  const WIDE = window.matchMedia("(min-width:1000px)");
  let col = null;
  function lpLayout() {
    if (mode !== "lp") return;
    const lp = $("#lp"), hero = $("header.hero");
    if (!lp || !hero) return;
    if (!WIDE.matches) { if (col) lpBack(); return; }
    if (!col) {
      const grid = document.createElement("div"); grid.className = "ellpgrid";
      col = document.createElement("aside"); col.className = "ellpside"; col.setAttribute("aria-label", "Learning path");
      col.innerHTML = '<div class="ellp-head"></div><div class="ellp-prog"></div><div class="ellp-steps"></div><div class="ellp-more"></div><div class="ellp-teach" hidden><div class="ellp-th">Teacher</div></div>';
      lp.before(grid); grid.append(col, lp);
      const w = hero.querySelector(".wrap") || hero, head = col.querySelector(".ellp-head"), teach = col.querySelector(".ellp-teach");
      [".eyebrow", "h1", ".lead"].forEach(q => { const e = w.querySelector(":scope>" + q); if (e) head.append(e); });
      const pr = $(".topbar .progress-shell"); if (pr) col.querySelector(".ellp-prog").append(pr);
      w.querySelectorAll(":scope>[data-el-teacher],:scope>.routes").forEach(e => teach.append(e));
      document.body.classList.add("ellp2");
    }
    const pl = col.querySelector(".ellp-prog");
    let lab = pl.querySelector(".ellp-pl"); if (!lab) { lab = document.createElement("div"); lab.className = "ellp-pl"; pl.prepend(lab); }
    lab.textContent = t("El teu progrés", "Your progress");
    const steps = col.querySelector(".ellp-steps"), more = col.querySelector(".ellp-more");
    const nav = lp.querySelector(".lp-body>nav.tabs");
    if (nav) { steps.textContent = ""; steps.append(nav); }
    // .lp-top (how it works, the study guide) and the goal card right after it; the review card at the end of the path stays there
    const top = lp.querySelector(":scope>.lp-top"), plan = top && top.nextElementSibling && top.nextElementSibling.classList.contains("plan-card") ? top.nextElementSibling : null;
    if (top) { more.textContent = ""; more.append(top); if (plan) more.append(plan); }
    // the teacher's part: class game, the level to look at, and the sections bar el-cloud.js draws (it goes where .eltsec-host is)
    const teach = col.querySelector(".ellp-teach");
    teachVis(teach);
    if (!teach._obs) { teach._obs = new MutationObserver(() => teachVis(teach)); teach._obs.observe(teach, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "hidden"] }); }
    const ban = $("#el-banner"); document.body.classList.toggle("elteach", who.role === "teacher" && !!ban && /^Teacher mode/.test(ban.textContent));
    if (!teach.querySelector(".eltsec-host")) { const h = document.createElement("div"); h.className = "eltsec-host"; teach.append(h); }
  }
  // the teacher's card shows only with something in it: the class game (el-cloud.js unhides it for the teacher), more than one level to
  // pick (a student sees only their own) or the sections bar
  function teachVis(teach) {
    const r = teach.querySelector(".routes");
    const on = !!(teach.querySelector("[data-el-teacher]:not([hidden])") || teach.querySelector("#el-tsec,#el-tsec-early") || (r && ![...r.querySelectorAll(".route")].some(x => x.style.display === "none")));
    if (teach.hidden === on) teach.hidden = !on;
  }
  // The teacher's sections card (el-cloud.js teacherSections: open sections, class mode, full screen) needs the LS document, so it came
  // a second after the page and pushed the steps down (Roger, 7 Nov 2026: "and how can you fix this?"). It is drawn at once from the copy
  // el-cloud.js keeps of its last drawing on this page (el_tsec_<page path>, this browser), with the 🔓/🔒 on the tabs; el-cloud.js puts
  // the real one in the same place when it has read the LS (the same picture unless something changed meanwhile). Clicks wait for it.
  function tsecEarly() {
    if (mode !== "lp" || who.role !== "teacher" || who.as || document.getElementById("el-tsec") || document.getElementById("el-tsec-early")) return;
    const rel = path.match(/\/((?:2|4)eso\/[^/]+\/[^/]+\.html)$/); if (!rel) return;   // the page's path from the course folder, as el-cloud.js relPath
    let c = null; try { c = JSON.parse(localStorage.getItem("el_tsec_" + rel[1]) || "null"); } catch (e) {}
    const t0 = $(".tab[data-panel]"), nav = t0 && t0.parentElement; if (!c || !c.h || !nav) return;
    if (c.css && !document.getElementById("el-tsec-css")) { const st = document.createElement("style"); st.id = "el-tsec-css"; st.textContent = c.css; document.head.append(st); }
    const bar = document.createElement("div"); bar.id = "el-tsec-early"; bar.className = "el-tsec"; bar.innerHTML = c.h;
    const host = $(".eltsec-host"); if (host) host.append(bar); else nav.before(bar);
    const all = c.all || [], off = c.off || [];
    $$(".tab[data-panel]").forEach(t => { const id = t.dataset.panel; if (!all.includes(id) || t.querySelector(".el-tsw")) return; const on = !off.includes(id);
      const sw = document.createElement("span"); sw.className = "el-tsw el-tsw-early" + (on ? "" : " off"); sw.textContent = on ? "🔓" : "🔒"; t.append(sw); t.classList.toggle("el-toff", !on); });
    const teach = $(".ellp-teach"); if (teach) teachVis(teach);
  }
  function lpBack() {   // back to the page's own layout (the window got narrow)
    const grid = col.parentElement, lp = $("#lp"), hero = $("header.hero"), w = hero.querySelector(".wrap") || hero;
    const head = col.querySelector(".ellp-head"), teach = col.querySelector(".ellp-teach");
    [...head.children].reverse().forEach(e => w.prepend(e));
    teach.querySelectorAll("[data-el-teacher],.routes").forEach(e => w.append(e));
    const pr = col.querySelector(".progress-shell"), row = $(".topbar .toprow"); if (pr && row) row.append(pr);
    const body = lp.querySelector(".lp-body"), nav = col.querySelector("nav.tabs"); if (body && nav) body.prepend(nav);
    const top = col.querySelector(".lp-top"), plan = col.querySelector(".plan-card");
    if (plan) lp.prepend(plan); if (top) lp.prepend(top);
    const t = $("#el-tsec"); if (t && nav) nav.before(t);
    grid.before(lp); grid.remove(); col = null; document.body.classList.remove("ellp2");
  }
  // ---- a learning path on a phone (≤640 px; el-phone.css section 7, Roger 8 Nov 2026, mockup option A): one screen for the step.
  // A slim top bar (‹ back to the LS, the path's name and progress, ⓘ about this path, ⋯ problem or idea) instead of the top bar and
  // the hero, the steps as chips under it, the step's next button as a bar at the bottom and no tab bar. ⓘ turns the page into the
  // path's About view (what it is, how it works, the study guide, my goal, the other paths) and back. Only CSS hides and shows: the
  // engine redraws #lp on every route change, so nothing is moved. On a computer the bar is display:none.
  function lpPhone() {
    if (mode !== "lp") return;
    let h = $(".elplh");
    if (!h) {
      h = document.createElement("header"); h.className = "elplh";
      const sv = (d, f) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="${f ? "currentColor" : "none"}" stroke="${f ? "none" : "currentColor"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
      h.innerHTML = `<a class="ib bk">${sv('<path d="m15 5-7 7 7 7"/>')}</a><div class="tt"><small></small><b></b></div>`
        + `<button class="ib inf" type="button" aria-expanded="false">${sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.01"/>')}${sv('<path d="M6 6l12 12M18 6 6 18"/>')}</button>`
        + `<button class="ib mo" type="button" aria-haspopup="true" aria-expanded="false">${sv('<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>', 1)}</button><div class="mm" hidden></div>`;
      document.body.prepend(h);
      let y = 0;
      const info = on => {
        if (on) { y = scrollY; const how = $(".lp-how"); if (how) how.open = true; }
        document.body.classList.toggle("elpinfo", on);
        lpPhone();
        scrollTo(0, on ? 0 : y);
      };
      const mm = h.querySelector(".mm"), mo = h.querySelector(".mo");
      const menu = on => { mm.hidden = !on; mo.setAttribute("aria-expanded", on ? "true" : "false"); };
      h.addEventListener("click", e => {
        if (e.target.closest(".inf")) { menu(false); info(!document.body.classList.contains("elpinfo")); }
        else if (e.target.closest(".mo")) menu(mm.hidden);
        else { const b = e.target.closest("[data-w]"); if (!b) return; menu(false);
          const w = b.dataset.w === "idea" ? "💡" : "⚠️", x = $$("#el-cloud-bar button").find(z => z.textContent.startsWith(w)); if (x) x.click(); }
      });
      document.addEventListener("click", e => {
        if (!mm.hidden && !e.target.closest(".elplh")) menu(false);
        // a step chip tapped in the About view goes back to the steps
        if (e.target.closest(".tab") && document.body.classList.contains("elpinfo")) info(false);
      });
      document.addEventListener("keydown", e => { if (e.key === "Escape") menu(false); });
      // the progress text changes as the student works: keep the bar's line in step
      const pt = $("#progressText");
      if (pt && window.MutationObserver) new MutationObserver(() => lpPhone()).observe(pt, { childList: true, characterData: true, subtree: true });
    }
    const back = $(".topbar .brand>a.elback"), bk = h.querySelector(".bk");
    bk.href = back ? back.href : (curLs && lsHref(curLs)) || ROOT + "today.html";
    bk.setAttribute("aria-label", t("Torna a ", "Back to ") + (back ? back.dataset.ls || back.textContent : "LS").trim());
    const h1 = $("header.hero h1") || $(".ellp-head h1") || $("h1"), sj = $("#sessionJump"), op = sj && sj.selectedOptions && sj.selectedOptions[0];
    const n = op && (op.textContent.match(/^\s*(\d+)\s*·/) || [])[1];
    const lab = $("#progressLabel"), pt = $("#progressText");
    h.querySelector(".tt b").textContent = h1 ? h1.textContent.trim() : document.title;
    h.querySelector(".tt small").textContent = [n ? "LP" + n : "", lab && lab.textContent.trim(), pt && pt.textContent.trim()].filter(Boolean).join(" · ");
    const inf = h.querySelector(".inf"), on = document.body.classList.contains("elpinfo");
    inf.setAttribute("aria-expanded", on ? "true" : "false");
    inf.setAttribute("aria-label", on ? t("Torna al pas", "Back to the step") : t("Sobre aquest learning path: com funciona, guia d'estudi, el meu objectiu", "About this learning path: how it works, study guide, my goal"));
    // ⋯ only for a signed-in student: Problem and Idea are the buttons of their account bar (el-cloud.js)
    const mo = h.querySelector(".mo");
    mo.hidden = !(who.role === "student" && !who.as); mo.setAttribute("aria-label", t("Més: avisa d'un problema, envia una idea", "More: report a problem, send an idea"));
    h.querySelector(".mm").innerHTML = `<button type="button" data-w="pb"><i aria-hidden="true">⚠️</i>${t("Avisa d'un problema", "Report a problem")}</button><button type="button" data-w="idea"><i aria-hidden="true">💡</i>${t("Envia una idea", "Send an idea")}</button>`;
  }
  // ---- ⛶ one step (an "SLP") full screen (Roger, 12 Nov 2026, whiteboard: "Fullscreen SLP"): a ⛶ button in each step's heading
  // shows only that step, wide, with the browser in full screen: no menu, no top bar, no left column. A slim bar on top keeps the
  // path's name and the step, ‹ Previous / Next › (the step buttons of the column, so locked and hidden steps stay as they are) and
  // ✕ Exit. Esc leaves too. It stays on while the student moves between steps (the engine redraws #lp: only the buttons are added
  // again). For the projector in class and for students on a Chromebook. LS2 on (LS1 stays as it is); not on a phone (one screen already).
  // When class mode had the browser in full screen already, ✕ leaves only this view: the browser stays in full screen. Not on a
  // recall checkpoint or the sample exam (they have their own full screen, and leaving it hands them in).
  const FSOK = mode === "lp" && !/\/my-real-routine\//.test(path) && !/\/(recall-checkpoint[^/]*|sample-exam)\.html$/.test(path);   // not a recall checkpoint or the sample exam: they have their own full screen (leaving it hands them in)
  let fsMine = false;
  const fsDoc = () => document.fullscreenElement || document.webkitFullscreenElement;
  // in class mode only the steps the teacher opened (window.elCmTabOk, el-cloud.js)
  function slpTabs() { const ok = window.elCmTabOk; return $$(".tab[data-panel]").filter(b => !b.classList.contains("el-sec-hide") && !b.classList.contains("el-cm-hide") && !b.hidden && b.style.display !== "none" && (!ok || ok(b.dataset.panel))); }
  // under the class mode bars at the top of a student's screen (🎓 #el-lock, 🌟 #el-cmcheer, el-cloud.js), not behind them
  function slpTop() { let y = 0; ["el-lock", "el-cmcheer"].forEach(id => { const x = document.getElementById(id); if (x && x.offsetHeight) y = Math.max(y, x.getBoundingClientRect().bottom); }); return Math.round(y); }
  let slpT = 0;
  function slpPlace() { const bar = $(".elslpbar"), on = document.body.classList.contains("elslpfs");
    if (!on) { clearInterval(slpT); slpT = 0; document.body.style.removeProperty("padding-top"); if (bar) bar.style.top = ""; return; }
    const y = slpTop(); if (bar) bar.style.top = y + "px"; document.body.style.setProperty("padding-top", (y + 58) + "px", "important");
    if (!slpT) slpT = setInterval(slpPlace, 1000); }
  function slpFs(on) {
    const B = document.body, was = B.classList.contains("elslpfs");
    if (on === undefined) on = was;
    if (on && !was) {
      if (!fsDoc()) { const E = document.documentElement, rq = E.requestFullscreen || E.webkitRequestFullscreen;
        try { const r = rq && rq.call(E); fsMine = !!rq; if (r && r.catch) r.catch(() => { fsMine = false; }); } catch (e) { fsMine = false; } }
    }
    if (!on && was) {
      if (fsMine && fsDoc()) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} }
      fsMine = false;
    }
    B.classList.toggle("elslpfs", !!on);
    slpDraw(); slpPlace();
    if (on !== was) scrollTo(0, 0);
  }
  function slpDraw() {
    if (!FSOK) return;
    const on = document.body.classList.contains("elslpfs");
    // the ⛶ button in every step's heading (the engine draws them again on each redraw)
    $$(".lp-panels>.panel>.panel-head").forEach(h => {
      let b = h.querySelector(":scope>.elslpgo");
      if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "elslpgo"; b.addEventListener("click", () => slpFs(true)); h.append(b); }
      const lab = t("⛶ Pantalla completa", "⛶ Full screen");
      if (b.textContent !== lab) { b.textContent = lab; b.title = t("Mostra només aquest pas, a pantalla completa", "Show only this step, full screen"); }
    });
    let bar = $(".elslpbar");
    if (!on) { if (bar) bar.hidden = true; return; }
    if (!bar) {
      bar = document.createElement("div"); bar.className = "elslpbar"; bar.setAttribute("role", "toolbar");
      bar.innerHTML = '<div class="tt"><small></small><b></b></div><div class="go"><button type="button" class="pv"></button><button type="button" class="nx"></button><button type="button" class="ex"></button></div>';
      bar.addEventListener("click", e => {
        if (e.target.closest(".ex")) return slpFs(false);
        const d = e.target.closest(".pv") ? -1 : e.target.closest(".nx") ? 1 : 0; if (!d) return;
        const L = slpTabs(), i = L.findIndex(x => x.classList.contains("active")), n = L[i + d];
        if (n) { n.click(); scrollTo(0, 0); slpDraw(); }
      });
      document.body.append(bar);
    }
    bar.hidden = false;
    const L = slpTabs(), i = L.findIndex(x => x.classList.contains("active")), a = L[i];
    const h1 = $(".ellp-head h1") || $("header.hero h1"), sj = $("#sessionJump"), op = sj && sj.selectedOptions && sj.selectedOptions[0];
    const n = op && (op.textContent.match(/^\s*(\d+)\s*·/) || [])[1];
    bar.querySelector(".tt small").textContent = (n ? "LP" + n + " · " : "") + (h1 ? h1.textContent.trim() : "");
    bar.querySelector(".tt b").textContent = a ? (i + 1) + " / " + L.length + " · " + ((a.querySelector(".tl") || a).textContent.trim()) : "";
    const pv = bar.querySelector(".pv"), nx = bar.querySelector(".nx"), ex = bar.querySelector(".ex");
    pv.textContent = t("‹ Anterior", "‹ Previous"); nx.textContent = t("Següent ›", "Next ›"); ex.textContent = t("✕ Surt", "✕ Exit");
    ex.title = t("Surt de la pantalla completa (Esc)", "Leave full screen (Esc)");
    pv.disabled = i <= 0; nx.disabled = i < 0 || i >= L.length - 1;
  }
  if (FSOK) {
    // the browser left full screen (Esc, or F11 on a Chromebook): leave this view too, unless class mode keeps the browser in full screen
    const fc = () => { if (!fsDoc() && fsMine && document.body.classList.contains("elslpfs")) { fsMine = false; slpFs(false); } };
    document.addEventListener("fullscreenchange", fc); document.addEventListener("webkitfullscreenchange", fc);
    // Esc while the browser stays in full screen (class mode): leave this view
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !fsMine && document.body.classList.contains("elslpfs") && !e.defaultPrevented) slpFs(false); });
    // a step chosen any other way (the engine's Next step button, the teacher's class tab): the bar follows
    document.addEventListener("click", e => { if (e.target.closest(".tab[data-panel],.section-next button") && document.body.classList.contains("elslpfs")) setTimeout(() => { slpDraw(); scrollTo(0, 0); }, 0); });
  }
  if (mode === "home") addEventListener("hashchange", () => draw());   // Home · Courses · Learning Situations: the button that is on
  if (mode === "lp") {
    WIDE.addEventListener ? WIDE.addEventListener("change", () => lpLayout()) : WIDE.addListener(() => lpLayout());
    let busy = false;
    new MutationObserver(() => { if (busy) return; busy = true; try { lpLayout(); slpDraw(); } finally { busy = false; } })
      .observe(document.getElementById("lp") || document.body, { childList: true });
  }

  function draw() {
    const on = mode === "home" ? who.role === "teacher" || who.role === "tester"   // the welcome page has no menu
      : who.role !== "none" || mode === "lp" || mode === "games";   // course pages and English Lab keep the public look when signed out
    document.body.classList.toggle("elapp", on);
    document.body.classList.add("el" + mode);
    if (!on) { $$(".elrail,.elbar,.elside,.elcrumb,.elptabs,.elpseg,.elplh").forEach(e => e.remove()); document.body.classList.remove("elhas-rail", "elhas-bar", "elptab", "elpinfo"); return; }
    ownLevel();
    lpBar();
    lpLayout();
    tsecEarly();
    curLs = pickLs();
    lpPhone();
    slpDraw();
    const L = items();
    if (mode === "lab") side(L); else rail(L);
    bar(L);
    crumb();
    allLs();
    document.documentElement.classList.toggle("el-ca", CA);
  }

  const start = () => {
    if (who.role === "teacher" && !who.as) $$("[data-el-teacher]").forEach(e => e.hidden = false);   // the teacher's links at once too (el-cloud.js sets them again)
    draw();
    ready();
    if (who.group) Promise.all([load("shared/js/el-plan.js", () => window.EL_PLAN), load("shared/js/el-week.js", () => window.ELWeek)]).then(() => draw());
    // the course's LSs and the time plan: static files, no reads
    load("shared/js/el-catalog.js", () => window.EL_LS).then(() => draw());
    if (mode === "lp") load("shared/js/el-dict.js", () => window.ELDict);   // 📖 Dictionary on LS2 learning paths (Roger, 12 Nov 2026)
    let tries = 0;
    (function wait() {
      const C = window.ELCloud;
      if (C && C.onUser) {
        C.onUser(async u => {
          const AS = C.viewing;
          if (!u) who = { role: "none" };
          else if (AS) who = { role: "student", as: AS.uid, group: AS.group || null };
          else if (C.isTeacher(u)) who = { role: "teacher" };
          else who = { role: C.isTester(u) && !C.viewGroup() ? "tester" : "student", group: C.group() || (W && W.uid === u.uid ? W.group || null : null) };
          const g = who.group;
          who.course = g ? ((window.EL_GROUPS || []).find(x => x.id === g) || {}).course || g.slice(0, 4).toLowerCase() : null;
          // the language changes only once el-cloud.js knows the level (C.ca true or false); unknown keeps the first drawing's, so the
          // menu does not switch Catalan → English → Catalan while the level is read
          if (who.role !== "student") CA = false; else if (C.ca === true || C.ca === false) CA = C.ca;
          if (g) await Promise.all([load("shared/js/el-plan.js", () => window.EL_PLAN), load("shared/js/el-week.js", () => window.ELWeek)]);
          draw();
        });
        return;
      }
      if (++tries < 300) setTimeout(wait, 100);
    })();
  };
  // In the page's HTML after its content (a plain <script>, not async): draw now, before the browser paints. Waiting for
  // DOMContentLoaded meant waiting for el-cloud.js and its imports too, and the page's old look showed meanwhile.
  const sync = document.currentScript && !document.currentScript.async && !document.currentScript.defer;
  if (document.readyState === "loading" && !sync) document.addEventListener("DOMContentLoaded", start); else start();
  window.ELApp.redraw = () => draw();
})();
