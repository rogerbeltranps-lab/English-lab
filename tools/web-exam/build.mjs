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
const SECTIONS = ["listening", "reading", "vocabulary", "grammar"];
const folder = { "2eso-free-time-live": "2eso/free-time-live" }[S.ls];
if (!folder) throw new Error("Unknown LS " + S.ls);
const out = path.join(ROOT, folder, "data", "exam.js");
// the password hash: PBKDF2-SHA256, 150 000 rounds, random salt (shared/js/el-web-exam.js checks it in the browser)
let pass = null;
if (process.env.EXAM_PASSWORD) {
  const salt = crypto.randomBytes(16).toString("hex"), it = 150000;
  pass = { salt, it, h: crypto.pbkdf2Sync(process.env.EXAM_PASSWORD, Buffer.from(salt, "hex"), it, 32, "sha256").toString("hex") };
} else if (fs.existsSync(out)) {
  const m = fs.readFileSync(out, "utf8").match(/"pass":\s*(\{[^}]*\})/); if (m) pass = JSON.parse(m[1]);
}
if (!pass) throw new Error("No password hash: run with EXAM_PASSWORD=… the first time");
const keys = {}, papers = {};
const sortO = o => o.slice().sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
for (const [p, P] of Object.entries(S.papers)) {
  papers[p] = { text: P.text, sections: {} };
  for (const s of SECTIONS) {
    papers[p].sections[s] = P[s].map(it => {
      if (keys[it.id]) throw new Error("Duplicate id " + it.id);
      keys[it.id] = { a: it.t === "mc" ? [it.o[0]] : it.a, q: it.q, s, p };
      if (it.t === "mc" && new Set(it.o).size !== it.o.length) throw new Error("Repeated option in " + it.id);
      if (it.t === "gap" && !(it.a || []).length) throw new Error("No answer in " + it.id);
      return it.t === "mc" ? { id: it.id, t: "mc", q: it.q, o: sortO(it.o) } : { id: it.id, t: "gap", q: it.q };
    });
  }
}
const data = { key: S.key, ls: S.ls, audio: S.audio, pass, papers };
fs.writeFileSync(out, "/* Web exam " + S.key + " (shared/js/el-web-exam.js): built by tools/web-exam/build.mjs from a source kept outside the repo.\n" +
  "   No answers here: the key is in cpKeys/" + S.key + " (teacher only). pass = a PBKDF2 hash of the re-entry password, never the password. */\n" +
  "window.EL_EXAM = " + JSON.stringify(data, null, 1) + ";\n");
const kf = path.join(path.dirname(path.resolve(src)), "keys.json");
fs.writeFileSync(kf, JSON.stringify({ [S.key]: { web: keys } }, null, 1));
const n = Object.values(papers).map(P => SECTIONS.map(s => P.sections[s].length).join("+"));
console.log("✓ " + path.relative(ROOT, out) + " · " + Object.keys(papers).join(", ") + " · " + n.join(" | ") + "\n✓ " + kf + " · " + Object.keys(keys).length + " answers");
