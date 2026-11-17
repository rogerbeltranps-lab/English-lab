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
//       Without --apply it only prints what would change.
// Both files hold personal data: keep them outside the repo (project files alumnes/ or the exam's folder).
// Sign-in: FIREBASE_SERVICE_ACCOUNT (the cloud environment's secret), else the Firebase CLI login on Roger's computer (as tools/exam-marks).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const PROJECT = "english-lab-ietm", ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2), apply = args.includes("--apply"), [cmd, key, a3, a4] = args.filter(a => !a.startsWith("--"));
if (!["export", "import"].includes(cmd) || !key || !a3 || (cmd === "import" && !a4)) {
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
  const j = await api("POST", BASE + ":runQuery", { structuredQuery: { from: [{ collectionId: "exams", allDescendants: true }], where: { fieldFilter: { field: { fieldPath: "key" }, op: "EQUAL", value: { stringValue: key } } } } });
  return j.filter(x => x.document).map(x => ({ uid: x.document.name.split("/").slice(-3)[0], d: dec({ mapValue: { fields: x.document.fields } }) }));
}
const wid = d => ((d.order || {}).writing || [])[0];

if (cmd === "export") {
  const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "2eso/free-time-live/data/exam.js"), "utf8"), ctx);   // the tasks
  const X = ctx.window.EL_EXAM, out = {};
  for (const { uid, d } of await exams()) {
    const id = wid(d); if (!id) continue;
    const st = await api("GET", DOCS + "students/" + uid, null, true), s = st ? dec({ mapValue: { fields: st.fields } }) : {};
    const it = X && X.key === key ? (X.papers[d.paper]?.sections.writing || []).find(x => x.id === id) : null, sn = (d.snaps || [])[0];
    const text = String((d.answers || {})[id] || "").trim(), first = sn ? String((sn.answers || {})[id] || "").trim() : null;
    out[uid] = { name: s.name || "", email: s.email || "", group: d.group, paper: d.paper, lang: d.paper.startsWith("base") ? "ca" : "en", status: d.status,
      task: it ? it.q : "", min: it ? it.min : null, words: words(text), text, firstText: first != null && first !== text ? first : undefined };
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
    console.log((apply ? "✓ " : "→ ") + (w.name || uid) + ": " + got + "/" + of + " → " + score + "/" + MAX + " " + lv + " · " + (w.errors || []).length + " mistakes");
    if (!apply) continue; n++;
    // students see it 4 days after the exam at 8:00 Madrid (7:00 UTC in winter), as the dashboard's 📥 Save marks (showFrom; kept if already set)
    const cur = await api("GET", DOCS + "students/" + uid + "/results/" + encodeURIComponent(ls + "__assessment"), null, true), sf = cur && cur.fields && cur.fields.showFrom && dec(cur.fields.showFrom);
    const day = new Date(d.done || d.started || Date.now()); day.setUTCDate(day.getUTCDate() + 4); day.setUTCHours(7, 0, 0, 0);
    await api("PATCH", DOCS + "students/" + uid + "/results/" + encodeURIComponent(ls + "__assessment") + "?" + ["sections.writing", "levels.writing", "report.writing", "ls", "activity", "showFrom"].map(p => "updateMask.fieldPaths=" + encodeURIComponent(p)).join("&"),
      { fields: { ls: enc(ls), activity: enc(ls + "/assessment"), sections: enc({ writing: { score, max: MAX } }), levels: enc({ writing: { "5.1": lv } }), report: enc({ writing }), showFrom: enc(sf || day.toISOString()) } });
  }
  console.log(apply ? "\nWritten: " + n : "\nNothing written: run again with --apply.");
}
