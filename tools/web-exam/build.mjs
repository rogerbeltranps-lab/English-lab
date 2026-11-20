// Web exams (Roger, 17 Nov 2026: 2 ESO LS2 exam on the site; shared/js/el-web-exam.js). The source with the answers lives OUTSIDE the
// repo (project files web-exam-2eso-ls2/source.mjs; Drive Teacher Studio): the repo is public, so the page data has no answers.
//   node tools/web-exam/build.mjs <source.mjs> [--keys <keys.json>]
// writes <ls folder>/data/exam.js (questions only; the options of each question in alphabetical order, the page shuffles them) and
// the answer key as keys.json next to the source (cpKeys/{key}.web: {id: {a: [accepted], q, s: section, p: paper}}), which
// tools/web-exam/upload-keys.mjs sends to Firestore (teacher only). The re-entry password is never stored: only a PBKDF2 hash of it
// (env EXAM_PASSWORD, or the hash already in the old exam.js is kept).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [src] = process.argv.slice(2).filter(a => !a.startsWith("--"));
if (!src) { console.error("Usage: node tools/web-exam/build.mjs <source.mjs>"); process.exit(1); }
const S = (await import(pathToFileURL(path.resolve(src)).href)).default;
const SECTIONS = ["listening", "reading", "vocabulary", "grammar", "writing"];   // writing: a free text the teacher marks with a level (no key)
const FOLDERS = { "2eso-free-time-live": "2eso/free-time-live", "4eso-my-real-routine": "4eso/my-real-routine", "4eso-seasons-and-celebrations": "4eso/seasons-and-celebrations" }, folder = FOLDERS[S.ls];
if (!folder) throw new Error("Unknown LS " + S.ls);
const out = path.join(ROOT, folder, "data", "exam.js");
// the password hash: PBKDF2-SHA256, 150 000 rounds, random salt (shared/js/el-web-exam.js checks it in the browser)
let pass = null;
if (process.env.EXAM_PASSWORD) {
  const salt = crypto.randomBytes(16).toString("hex"), it = 150000;
  pass = { salt, it, h: crypto.pbkdf2Sync(process.env.EXAM_PASSWORD, Buffer.from(salt, "hex"), it, 32, "sha256").toString("hex") };
} else {   // the hash already in this exam, else the one of another web exam (the same teacher password everywhere)
  for (const f of [out, ...Object.values(FOLDERS).map(x => path.join(ROOT, x, "data", "exam.js"))]) {
    if (pass || !fs.existsSync(f)) continue;
    const m = fs.readFileSync(f, "utf8").match(/"pass":\s*(\{[^}]*\})/); if (m) pass = JSON.parse(m[1]);
  }
}
if (!pass) throw new Error("No password hash: run with EXAM_PASSWORD=… the first time");
const keys = {}, papers = {};
const sortO = o => o.slice().sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
// Typed answers with more than one word (Roger, 20 Nov 2026: "whenever they have two words, we must allow students to only write the
// words like Does go, or the entire sentence or the chunk"): besides the answer itself, accept the whole sentence with the gaps filled
// (without the clue in brackets; also for one-word answers), the part of it after → or —, the chunk from the first gap to the last, and "does / go", "does - go".
const GAP = /_{3,}/g, nrm = x => String(x).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”"]/g, "").replace(/[.,!?;:…→]/g, " ").replace(/\s+/g, " ").trim();
function accepted(q, list) {
  const out = list.slice(), seen = new Set(out.map(nrm)), add = x => { x = String(x).replace(/\s+/g, " ").replace(/\s+(['’](?:re|s|m|ve|ll|d|t))\b/gi, "$1").trim(); if (x && !seen.has(nrm(x))) { seen.add(nrm(x)); out.push(x); } };
  const n = (q.match(GAP) || []).length;
  if (!n) return out;
  for (const a of list) {
    const w = String(a).trim().split(/\s+/);
    const fill = n === 1 ? [w.join(" ")] : n === 2 && w.length >= 2 ? [w.slice(0, -1).join(" "), w[w.length - 1]] : null;
    if (!fill) continue;
    if (n === 2) { add(fill.join(" / ")); add(fill.join("/")); add(fill.join(" - ")); add(fill.join(" ... ")); }
    let k = 0; const filled = q.replace(/\s*\([^)]*\)/g, "").replace(GAP, () => fill[k++]);
    add(filled);
    let j = 0; const marked = q.replace(/\s*\([^)]*\)/g, "").replace(GAP, () => "\u0001" + fill[j++] + "\u0002");
    for (const seg of marked.split(/\s*(?:→|—|–)\s*|(?<=[.!?])\s+/)) if (seg.includes("\u0001")) {
      add(seg.replace(/[\u0001\u0002]/g, ""));
      if (n === 2) { const a0 = seg.indexOf("\u0001"), b0 = seg.lastIndexOf("\u0002"); if (a0 >= 0 && b0 > a0) {
        const chunk = seg.slice(a0, b0).replace(/[\u0001\u0002]/g, ""), next = (seg.slice(b0 + 1).match(/^\s*([A-Za-z’']+)/) || [])[1];
        add(chunk); if (/\u0002\s*\u0001/.test(seg) && next) add(chunk + " " + next); } }   // two gaps side by side ("I ___ ___ believe"): also "used to believe"
    }
  }
  return out;
}
for (const [p, P] of Object.entries(S.papers)) {
  papers[p] = { text: P.text, sections: {} };
  for (const s of SECTIONS) {
    papers[p].sections[s] = (P[s] || []).map(it => {
      if (it.t === "write") return Object.assign({ id: it.id, t: "write", q: it.q, min: it.min, max: it.max }, it.ca ? { ca: it.ca } : {}, it.frame ? { frame: it.frame } : {});
      if (keys[it.id]) throw new Error("Duplicate id " + it.id);
      keys[it.id] = { a: it.t === "mc" ? [it.o[0]] : accepted(it.q, it.a || []), q: it.q, s, p, t: it.t };   // t: the dashboard is lenient with extra words only in typed answers
      if (it.t === "mc" && new Set(it.o).size !== it.o.length) throw new Error("Repeated option in " + it.id);
      if (it.t === "gap" && !(it.a || []).length) throw new Error("No answer in " + it.id);
      return it.t === "mc" ? { id: it.id, t: "mc", q: it.q, o: sortO(it.o) } : Object.assign({ id: it.id, t: "gap", q: it.q }, it.split ? { split: true } : {});   // split: one box per gap (Roger, 20 Nov 2026)
    });
  }
}
// games for students who finish early: practice only, so their answers can be public (the right option is the first in the source)
const games = S.games ? { words: S.games.words, quiz: S.games.quiz.map(x => ({ q: x.q, o: sortO(x.o), a: x.o[0] })) } : null;
const data = Object.assign({ key: S.key, ls: S.ls, audio: S.audio, pass, papers }, S.lsShort ? { lsShort: S.lsShort } : {}, games ? { games } : {});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "/* Web exam " + S.key + " (shared/js/el-web-exam.js): built by tools/web-exam/build.mjs from a source kept outside the repo.\n" +
  "   No answers here: the key is in cpKeys/" + S.key + " (teacher only). pass = a PBKDF2 hash of the re-entry password, never the password. */\n" +
  "window.EL_EXAM = " + JSON.stringify(data, null, 1) + ";\n");
const kf = path.join(path.dirname(path.resolve(src)), "keys.json");
fs.writeFileSync(kf, JSON.stringify({ [S.key]: { web: keys } }, null, 1));
const n = Object.values(papers).map(P => SECTIONS.map(s => P.sections[s].length).join("+"));
console.log("✓ " + path.relative(ROOT, out) + " · " + Object.keys(papers).join(", ") + " · " + n.join(" | ") + "\n✓ " + kf + " · " + Object.keys(keys).length + " answers");
