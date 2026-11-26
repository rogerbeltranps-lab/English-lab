// The web exam writings, corrected like the LS1 exam (Roger, 17 Nov 2026: "when students finish their exams, you correct them, the writing
// too, the same way we did in the last exam, explaining the criteria and their level of assoliment and the number").
//   node tools/web-exam/writing.mjs export <exam key> <out.json>
//       every student's writing (students/{uid}/exams/{key}): name, email, group, paper, the task, the final text, the text at the first exit
//   node tools/web-exam/writing.mjs import <exam key> <ls id> <marked.json> [--apply]
//       marked.json = {uid: {rubric: [["C1 · Task achievement", 6, 8], ["C2 · Grammar", 3, 4], ["C3 · Vocabulary", 3, 4],
//       ["C4 · Organisation and cohesion", 3, 4]], corrected: "the whole text corrected", feedback: "…", errors: [{type, orig, fix, why}],
//       copied?: "all"|"part"}} (the LS1 rubric: C1 8 + C2 4 + C3 4 + C4 4 = 20; Catalan row names and texts for Base, English for Core).
//       Writes results/{ls}__assessment: sections.writing {score: total scaled to the section's maximum, max}, levels.writing["5.1"] (the
//       level of that mark: NA < 5 · AS < 7 · AN < 9 · AE) and report.writing {original, corrected (changed words in *…*), rubric, feedback,
//       errors}, which the student's board shows as "Your writing" (today.html examWriting). Nothing else in the record changes, and the
//       dashboard's 📥 Save marks keeps a corrected writing. Students see it from showFrom (4 days after the exam, 8:00; el-cloud.js held).
//       Without --apply it only prints what would change. --draft (Roger, 23 Nov 2026: "if you have a draft I want to be able to see their
//       provisional marks here") writes only results/{ls}__assessment.wdraft {score, max, level, at}: the dashboard's web exam table shows it
//       as "≈ 6.5 draft" and a provisional exam mark; students never see it. The real import (--apply) removes the draft.
//   node tools/web-exam/writing.mjs redo <out.json>
//       🔄 Correct again (Roger, 24 Nov 2026: "change the writing correction with a button correct again or correct manually"): the writings
//       the teacher asked to correct again on the dashboard (settings/marking.examRedo, one read), as `export` writes them plus `note` (what to
//       look at), `key`, `ls` and `before` (the correction now). Correct them and `import <key> <ls> <marked.json> --apply` per exam key:
//       the import clears results .wredo and the examRedo entry. "No writings to correct again." when there are none (the marking run's step).
// Results come out when the teacher presses 📣 Publish on the dashboard (Roger, 24 Nov 2026): a record without showFrom gets 9999-12-31
// (held until then); a showFrom already there (a date, or published) stays. The dashboard saves the other parts by itself (wxSync).
// Both files hold personal data: keep them outside the repo (project files alumnes/ or the exam's folder).
// Sign-in: FIREBASE_SERVICE_ACCOUNT (the cloud environment's secret), else the Firebase CLI login on Roger's computer (as tools/exam-marks).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const PROJECT = "english-lab-ietm", ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2), draft = args.includes("--draft"), apply = args.includes("--apply") || draft, [cmd, key, a3, a4] = args.filter(a => !a.startsWith("--"));
if (!(cmd === "redo" && key) && (!["export", "import"].includes(cmd) || !key || !a3 || (cmd === "import" && !a4))) {
  console.error("Usage: node writing.mjs export <exam key> <out.json>\n       node writing.mjs import <exam key> <ls id> <marked.json> [--apply]"); process.exit(1); }

async function token() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) { const t = sa.trim().replace(/^['"]|['"]$/g, ""), k = JSON.parse(t.startsWith("{") ? t : Buffer.from(t, "base64").toString("utf8")),
    now = Math.floor(Date.now() / 1000), b = o => Buffer.from(JSON.stringify(o)).toString("base64url");
    const un = b({ alg: "RS256", typ: "JWT" }) + "." + b({ iss: k.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
    const jwt = un + "." + crypto.createSign("RSA-SHA256").update(un).sign(k.private_key).toString("base64url");
    const j = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }) })).json();
    if (!j.access_token) throw new Error("Service account token: " + JSON.stringify(j)); return j.access_token; }
  const f = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "configstore", "firebase-tools.json");
  const rt = fs.existsSync(f) && JSON.parse(fs.readFileSync(f, "utf8")).tokens?.refresh_token;
  if (!rt) throw new Error("No FIREBASE_SERVICE_ACCOUNT and not signed in to the Firebase CLI: run `npx firebase-tools login` first.");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: rt,
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com", client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi" }) });   // the Firebase CLI's public client
  const j = await r.json(); if (!j.access_token) throw new Error("Token: " + JSON.stringify(j)); return j.access_token;
}
const TOKEN = await token();
async function api(method, url, body, ok404) {
  const r = await fetch(url, { method, headers: { authorization: "Bearer " + TOKEN, "x-goog-user-project": PROJECT, "content-type": "application/json" }, body: body && JSON.stringify(body) });
  if (ok404 && r.status === 404) return null;
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(method + " " + url.split("?")[0] + ": " + (j.error?.message || r.status)); return j;
}
const BASE = "https://firestore.googleapis.com/v1/projects/" + PROJECT + "/databases/(default)/documents", DOCS = BASE + "/";
const enc = x => x == null ? { nullValue: null } : Array.isArray(x) ? { arrayValue: { values: x.map(enc) } } : typeof x === "object" ? { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, enc(v)])) } }
  : typeof x === "number" ? (Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }) : typeof x === "boolean" ? { booleanValue: x } : { stringValue: String(x) };
const dec = v => !v ? null : "stringValue" in v ? v.stringValue : "integerValue" in v ? +v.integerValue : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue :
  "arrayValue" in v ? (v.arrayValue.values || []).map(dec) : "mapValue" in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, dec(x)])) : "timestampValue" in v ? v.timestampValue : null;
const words = s => (String(s || "").trim().match(/[A-Za-zÀ-ÿ’'0-9-]+/g) || []).length;

// every exam doc of this key (collection group "exams"), with its uid
async function exams() {
  try {
    const j = await api("POST", BASE + ":runQuery", { structuredQuery: { from: [{ collectionId: "exams", allDescendants: true }], where: { fieldFilter: { field: { fieldPath: "key" }, op: "EQUAL", value: { stringValue: key } } } } });
    return j.filter(x => x.document).map(x => ({ uid: x.document.name.split("/").slice(-3)[0], d: dec({ mapValue: { fields: x.document.fields } }) }));
  } catch (e) {   // the collection-group query needs an index the project may not have (400): read students/{uid}/exams/{key} one by one
    console.warn("(collection-group query refused: " + e.message + "; reading each student)");
    let ids = [], tok = "";
    do { const j = await api("GET", BASE + "/students?pageSize=300&mask.fieldPaths=group" + (tok ? "&pageToken=" + tok : "")); ids = ids.concat((j.documents || []).map(x => x.name.split("/").pop())); tok = j.nextPageToken; } while (tok);
    const out = [];
    for (const uid of ids) { const x = await api("GET", DOCS + "students/" + uid + "/exams/" + key, null, true); if (x && x.fields) out.push({ uid, d: dec({ mapValue: { fields: x.fields } }) }); }
    return out;
  }
}
const wid = d => ((d.order || {}).writing || [])[0];

// the exam page's data file of this key (the tasks): every <course>/<ls>/data/exam.js
function examData(k) {
  for (const c of ["2eso", "4eso"]) for (const l of fs.readdirSync(path.join(ROOT, c), { withFileTypes: true })) {
    const f = path.join(ROOT, c, l.name, "data/exam.js"); if (!l.isDirectory() || !fs.existsSync(f)) continue;
    const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(f, "utf8"), ctx); if (ctx.window.EL_EXAM && ctx.window.EL_EXAM.key === k) return ctx.window.EL_EXAM; }
  return null;
}
async function exportOne(uid, d, X) {
  const id = wid(d); if (!id) return null;
  const st = await api("GET", DOCS + "students/" + uid, null, true), s = st ? dec({ mapValue: { fields: st.fields } }) : {};
  const it = X ? (X.papers[d.paper]?.sections.writing || []).find(x => x.id === id) : null, sn = (d.snaps || [])[0];
  const text = String((d.answers || {})[id] || "").trim(), first = sn ? String((sn.answers || {})[id] || "").trim() : null;
  return { name: s.name || "", email: s.email || "", group: d.group, paper: d.paper, lang: d.level === "beginners" ? "ca" : "en", status: d.status,
    task: it ? it.q : "", min: it ? it.min : null, words: words(text), text, firstText: first != null && first !== text ? first : undefined };
}
if (cmd === "redo") {
  const m = await api("GET", DOCS + "settings/marking", null, true), R = m && m.fields && m.fields.examRedo ? dec(m.fields.examRedo) : {}, out = {};
  for (const r of Object.values(R || {})) {
    if (!r || !r.uid || !r.key) continue;
    const x = await api("GET", DOCS + "students/" + r.uid + "/exams/" + r.key, null, true); if (!x || !x.fields) { console.log("✗ " + r.uid + ": no exam " + r.key); continue; }
    const one = await exportOne(r.uid, dec({ mapValue: { fields: x.fields } }), examData(r.key)); if (!one) continue;
    const cur = await api("GET", DOCS + "students/" + r.uid + "/results/" + encodeURIComponent(r.ls + "__assessment"), null, true);
    out[r.uid] = Object.assign(one, { key: r.key, ls: r.ls, note: r.note || "", asked: r.at, before: cur && cur.fields && cur.fields.report ? (dec(cur.fields.report) || {}).writing || null : null });
  }
  const n = Object.keys(out).length; if (!n) { console.log("No writings to correct again."); process.exit(0); }
  fs.writeFileSync(key, JSON.stringify(out, null, 1));
  console.log("✓ " + key + ": " + n + " writing(s) to correct again (" + [...new Set(Object.values(out).map(x => x.key + " " + x.ls))].join(", ") + "). Import each exam key with --apply.");
  process.exit(0);
}
if (cmd === "export") {
  const X = examData(key), out = {};
  for (const { uid, d } of await exams()) {
    const one = await exportOne(uid, d, X); if (one) out[uid] = one;
  }
  fs.writeFileSync(a3, JSON.stringify(out, null, 1));
  const v = Object.values(out); console.log("✓ " + a3 + ": " + v.length + " writings (" + v.filter(x => x.status === "done").length + " turned in, " + v.filter(x => !x.words).length + " blank)");
} else {
  const ls = a3, marked = JSON.parse(fs.readFileSync(a4, "utf8")), docs = Object.fromEntries((await exams()).map(x => [x.uid, x.d]));
  const g = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "shared/js/el-grading.js"), "utf8"), g);
  const e = (g.window.EL_GRADING[ls] || {}).exam, sec = e && e.sections.find(s => s[0] === "writing"); if (!sec) throw new Error("No writing section in EL_GRADING['" + ls + "'].exam");
  const MAX = sec[2] || e.max, deg = m => m < 5 ? "NA" : m < 7 ? "AS" : m < 9 ? "AN" : "AE";
  // the corrected text with the changed words in *…* (as tools/exam-report/build-ls1-reports.py `marked`)
  const mark = (a0, b0) => { const a = a0.match(/\S+|\s+/g) || [], b = b0.match(/\S+|\s+/g) || [], n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, out = "", run = "";
    const flush = () => { if (run.trim()) { const lead = run.match(/^\s*/)[0], trail = run.match(/\s*$/)[0]; out += lead + "*" + run.trim() + "*" + trail; } else out += run; run = ""; };
    while (j < m) { if (i < n && a[i] === b[j]) { flush(); out += b[j]; i++; j++; } else if (i < n && L[i + 1][j] >= L[i][j + 1]) i++; else { run += b[j]; j++; } }
    flush(); return out.replace(/\*([ \t]+)\*/g, "$1"); };
  let n = 0;
  for (const [uid, w] of Object.entries(marked)) {
    const d = docs[uid]; if (!d) { console.log("✗ " + uid + ": no exam"); continue; }
    const id = wid(d), orig = String((d.answers || {})[id] || "").trim(), rub = w.rubric || [];
    const got = rub.reduce((t, r) => t + (+r[1] || 0), 0), of = rub.reduce((t, r) => t + (+r[2] || 0), 0);
    const score = orig ? (of ? Math.round(got / of * MAX * 10) / 10 : 0) : 0, lv = deg(score / MAX * 10);
    const writing = Object.assign({ original: orig || "(blank)", rubric: rub.map(([name, s, m]) => ({ name, score: +s || 0, max: +m })) },
      w.corrected && orig ? { corrected: mark(orig, String(w.corrected).trim()) } : {}, w.feedback ? { feedback: w.feedback } : {}, { errors: w.errors || [] }, w.copied ? { copied: w.copied } : {});
    console.log((draft ? "≈ " : apply ? "✓ " : "→ ") + (w.name || uid) + ": " + got + "/" + of + " → " + score + "/" + MAX + " " + lv + " · " + (w.errors || []).length + " mistakes");
    if (!apply) continue; n++;
    const rid = DOCS + "students/" + uid + "/results/" + encodeURIComponent(ls + "__assessment");
    // `updated` too: the dashboard only fetches results whose `updated` is newer than its copy (Roger, 23 Nov 2026: the saved marks didn't show)
    const upd = { timestampValue: new Date().toISOString() };
    if (draft) { await api("PATCH", rid + "?updateMask.fieldPaths=wdraft&updateMask.fieldPaths=updated", { fields: { wdraft: enc({ score, max: MAX, level: lv, at: new Date().toISOString() }), updated: upd } }); continue; }
    // students see it when the teacher presses 📣 Publish (showFrom kept if already set, else held: 9999-12-31); a 🔄 Correct again is done
    const cur = await api("GET", DOCS + "students/" + uid + "/results/" + encodeURIComponent(ls + "__assessment"), null, true), sf = cur && cur.fields && cur.fields.showFrom && dec(cur.fields.showFrom);
    await api("PATCH", DOCS + "students/" + uid + "/results/" + encodeURIComponent(ls + "__assessment") + "?" + ["sections.writing", "levels.writing", "report.writing", "ls", "activity", "showFrom", "wdraft", "wredo", "updated"].map(p => "updateMask.fieldPaths=" + encodeURIComponent(p)).join("&"),
      { fields: { ls: enc(ls), activity: enc(ls + "/assessment"), sections: enc({ writing: { score, max: MAX } }), levels: enc({ writing: { "5.1": lv } }), report: enc({ writing }), showFrom: enc(sf || "9999-12-31T00:00:00.000Z"), updated: upd } });
    await api("PATCH", DOCS + "settings/marking?updateMask.fieldPaths=" + encodeURIComponent("examRedo.`" + uid + "__" + ls + "`"), { fields: {} }).catch(e => console.warn("examRedo", e.message));
  }
  console.log(apply ? "\nWritten" + (draft ? " as drafts" : "") + ": " + n : "\nNothing written: run again with --draft (provisional, dashboard only) or --apply.");
}
