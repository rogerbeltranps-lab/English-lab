// 🛠 Maintenance mode (Roger, 7 Nov 2026: "que els estudiants no puguin entrar a la web, deixant un missatge que estic fent manteniment,
// i que es puguin descarregar pdf imprimibles dels 2 primers LP de les dues LS"). The teacher turns it on and off on the dashboard
// (teacher.html, 🛠 Maintenance), which writes site/maintenance = {on, note, since}. While it is on, el-cloud.js covers every student
// page with this message (students only: the teacher, the teacher's student view and the test account in its "see everything" view get
// in as usual) and the page saves nothing. The message has the paper worksheets of the student's own course and level to download and
// print, and it opens the page again by itself when the teacher turns maintenance off.
// No DOM work at the top level: tools/lp-worksheets/build.mjs imports PDFS in Node to print the files.

// What students can download (Roger, 7 Nov 2026: "make possible to select the pdf that they can download"): the teacher ticks the items
// in the dashboard's 🛠 Maintenance dialog, level by level (site/maintenance.pdfs = {course: {route: [item ids]}}); nothing saved yet =
// DEFAULT for every level. Each student gets the items ticked for their own level, in their level's version only. Items: a learning path's paper worksheet (no answer keys: the repo is public; recall checkpoints are
// left out, their questions stay secure), the vocabulary and grammar summary and the reading story (both already in the LS's downloads).
// The worksheets are printed into <ls>/downloads/worksheets/ by
//   node tools/lp-worksheets/build.mjs --maintenance
// and committed. A new LS: add it here and run that command again.
export const PDFS = {
  "2eso": { ls: "2eso/free-time-live", name: "LS2 Free Time, Live!", items: [
    ["getting-started", "LP1 · Getting started"], ["what-are-they-doing", "LP2 · What are they doing?"], ["now-or-usually", "LP3 · Now or usually?"],
    ["check-the-source", "LP4 · Check the source"], ["likes-and-screen-tips", "LP5 · Likes and screen tips"],
    ["write-your-vlog-script", "LP6 · Write your vlog script"], ["sample-exam", "Sample exam"],
    ["summary", "Vocabulary and grammar summary", "Resum de vocabulari i gramàtica"], ["story", "Reading story · Maya Live!", "Història per llegir · Maya Live!"]] },
  "4eso": { ls: "4eso/seasons-and-celebrations", name: "LS2 Seasons & Celebrations", items: [
    ["getting-started", "LP1 · Getting started"], ["celebrations-around-the-world", "LP2 · Celebrations around the world"],
    ["where-traditions-come-from", "LP3 · Where traditions come from"], ["research-it-right", "LP4 · Research it right"],
    ["plan-the-day", "LP5 · Plan the day"], ["write-to-the-head-teacher", "LP6 · Write to the head teacher"], ["sample-exam", "Sample exam"],
    ["summary", "Vocabulary and grammar summary", "Resum de vocabulari i gramàtica"], ["story", "Reading story · Lantern Night", "Història per llegir · Lantern Night"]] }
};
export const DEFAULT = { "2eso": ["getting-started", "what-are-they-doing"], "4eso": ["getting-started", "celebrations-around-the-world"] };
export const ROUTES = { "2eso": ["beginners", "insecure", "safe", "daring"], "4eso": ["beginners", "insecure", "safe", "daring", "native"] };
// the learning paths that have a worksheet PDF (not the summary or the story)
export const worksheets = course => PDFS[course].items.filter(x => x[0] !== "summary" && x[0] !== "story").map(x => x[0]);
export const pdfPath = (course, item, route) => {
  const ls = PDFS[course].ls;
  if (item === "summary") return `${ls}/downloads/ls2-vocabulary-grammar-${route}.pdf`;
  if (item === "story") return `${ls}/downloads/ls2-story-${route}.pdf`;   // 4 ESO Pro has its own C2 book (ls2-story-native.pdf, 12 Nov 2026)
  return `${ls}/downloads/worksheets/${item}-${route}.pdf`;
};
// the items a course shows to one level: the teacher's choice (in the catalogue's order), or DEFAULT when nothing was saved.
// Per level (Roger, 8 Nov 2026: "aquí he de poder posar tots els nivells, que l'alumne vegi el pdf en funció del nivell que tingui"):
// pdfs[course] = {route: [item ids]}, each level its own list; the older form, pdfs[course] = [item ids], is the same list for every level.
export const chosen = (course, pdfs, route) => { const c = PDFS[course]; if (!c) return [];
  const p = pdfs && pdfs[course], r = routeFor(course, route);
  const want = Array.isArray(p) ? p : p && typeof p === "object" ? (Array.isArray(p[r]) ? p[r] : []) : DEFAULT[course];
  return c.items.filter(x => want.includes(x[0])); };
// The level a student without one works on (as on the learning paths): Base
export const routeFor = (course, route) => (ROUTES[course] || []).includes(route) ? route : "insecure";

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NAMES = { beginners: "Starter", insecure: "Base", safe: "Core", daring: "Plus", native: "Pro" };

// The message's HTML. o = {course, route, ca, note, pdfs, root}: pdfs = site/maintenance.pdfs: root = the site's base URL (the PDF links); ca = Catalan (Starter, Base, no level).
// A course unknown (no group yet) shows no worksheets.
export function html(o) {
  const ca = !!o.ca, c = PDFS[o.course], r = c && routeFor(o.course, o.route), root = o.root || "";
  const T = ca ? {
    h: "Estic fent manteniment de la web",
    p: "Ara mateix English Lab no està disponible. Torna-ho a provar més tard: aquesta pàgina s'obrirà sola quan la web torni a funcionar.",
    w: "Mentrestant, pots descarregar i imprimir aquests materials per treballar en paper:",
    lv: "El teu nivell", out: "Surt del compte"
  } : {
    h: "I'm doing some maintenance on the site",
    p: "English Lab is not available right now. Please try again later: this page will open by itself when the site is working again.",
    w: "Meanwhile, you can download and print these materials to work on paper:",
    lv: "Your level", out: "Sign out"
  };
  const items = chosen(o.course, o.pdfs, r);
  const list = c && items.length ? `<p class="mt-w">${T.w}</p><p class="mt-ls">${esc(c.name)} · ${T.lv}: <b>${NAMES[r]}</b></p><div class="mt-pdfs">`
    + items.map(([id, t, tca]) => `<a class="mt-pdf" href="${esc(root + pdfPath(o.course, id, r))}" target="_blank" rel="noopener"><span>${id === "story" ? "📖" : "📄"}</span><b>${esc(ca && tca || t)}</b><small>PDF</small></a>`).join("")
    + `</div>` : "";
  return `<div class="mt-box"><div class="mt-ic">🛠</div><h1>${T.h}</h1><p>${T.p}</p>`
    + (o.note ? `<p class="mt-note">${esc(o.note)}</p>` : "") + list
    + (o.signOut ? `<p class="mt-out"><button type="button" data-mt-out>${T.out}</button></p>` : "") + `</div>`;
}
export const CSS = `.mt-box{max-width:560px;margin:auto;text-align:center;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a}
.mt-ic{font-size:44px;line-height:1;margin-bottom:6px}.mt-box h1{font-size:26px;margin:0 0 10px}.mt-box p{margin:0 0 12px;color:#334155}
.mt-note{background:#fef3c7;border-radius:12px;padding:10px 14px;color:#78350f!important;white-space:pre-line}
.mt-w{margin-top:20px!important;font-weight:600;color:#0f172a!important}.mt-ls{font-size:14px;color:#64748b!important}
.mt-pdfs{display:grid;gap:10px;margin:6px 0 18px}
.mt-pdf{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #0f766e;border-radius:14px;background:#fff;color:#0f172a;text-decoration:none;text-align:left}
.mt-pdf:hover{background:#f0fdfa}.mt-pdf span{font-size:24px}.mt-pdf b{flex:1}.mt-pdf small{background:#0f766e;color:#fff;border-radius:999px;padding:2px 10px;font-weight:700}
.mt-out button{border:0;background:none;color:#64748b;text-decoration:underline;cursor:pointer;font:inherit;font-size:14px}`;
