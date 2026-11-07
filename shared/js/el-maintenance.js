// 🛠 Maintenance mode (Roger, 7 Nov 2026: "que els estudiants no puguin entrar a la web, deixant un missatge que estic fent manteniment,
// i que es puguin descarregar pdf imprimibles dels 2 primers LP de les dues LS"). The teacher turns it on and off on the dashboard
// (teacher.html, 🛠 Maintenance), which writes site/maintenance = {on, note, since}. While it is on, el-cloud.js covers every student
// page with this message (students only: the teacher, the teacher's student view and the test account in its "see everything" view get
// in as usual) and the page saves nothing. The message has the paper worksheets of the student's own course and level to download and
// print, and it opens the page again by itself when the teacher turns maintenance off.
// No DOM work at the top level: tools/lp-worksheets/build.mjs imports PDFS in Node to print the files.

// The worksheets students can download (no answer keys: the repo is public). Printed into <ls>/downloads/worksheets/ by
//   node tools/lp-worksheets/build.mjs --maintenance
// and committed. Another LS or learning path: add it here and run that command again.
export const PDFS = {
  "2eso": { ls: "2eso/free-time-live", name: "LS2 Free Time, Live!", lps: [
    ["getting-started", "LP1 · Getting started"], ["what-are-they-doing", "LP2 · What are they doing?"]] },
  "4eso": { ls: "4eso/seasons-and-celebrations", name: "LS2 Seasons & Celebrations", lps: [
    ["getting-started", "LP1 · Getting started"], ["celebrations-around-the-world", "LP2 · Celebrations around the world"]] }
};
export const ROUTES = { "2eso": ["beginners", "insecure", "safe", "daring"], "4eso": ["beginners", "insecure", "safe", "daring", "native"] };
export const pdfPath = (course, lp, route) => `${PDFS[course].ls}/downloads/worksheets/${lp}-${route}.pdf`;
// The level a student without one works on (as on the learning paths): Base
export const routeFor = (course, route) => (ROUTES[course] || []).includes(route) ? route : "insecure";

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NAMES = { beginners: "Starter", insecure: "Base", safe: "Core", daring: "Plus", native: "Pro" };

// The message's HTML. o = {course, route, ca, note, root}: root = the site's base URL (the PDF links); ca = Catalan (Starter, Base, no level).
// A course unknown (no group yet) shows no worksheets.
export function html(o) {
  const ca = !!o.ca, c = PDFS[o.course], r = c && routeFor(o.course, o.route), root = o.root || "";
  const T = ca ? {
    h: "Estic fent manteniment de la web",
    p: "Ara mateix English Lab no està disponible. Torna-ho a provar més tard: aquesta pàgina s'obrirà sola quan la web torni a funcionar.",
    w: "Mentrestant, pots descarregar i imprimir aquestes fitxes per treballar en paper:",
    lv: "El teu nivell", out: "Surt del compte"
  } : {
    h: "I'm doing some maintenance on the site",
    p: "English Lab is not available right now. Please try again later: this page will open by itself when the site is working again.",
    w: "Meanwhile, you can download and print these worksheets to work on paper:",
    lv: "Your level", out: "Sign out"
  };
  const list = c ? `<p class="mt-w">${T.w}</p><p class="mt-ls">${esc(c.name)} · ${T.lv}: <b>${NAMES[r]}</b></p><div class="mt-pdfs">`
    + c.lps.map(([lp, t]) => `<a class="mt-pdf" href="${esc(root + pdfPath(o.course, lp, r))}" target="_blank" rel="noopener" download><span>📄</span><b>${esc(t)}</b><small>PDF</small></a>`).join("")
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
