// 🔑 Email their login (Roger, 26 Nov 2026: "Hauria de tenir al teacher dashboard, un botó per poder enviar al mail el seu usuari i
// contrasenya"): saves the students' sign-in passwords in the school Apps Script's private Script Properties (school-mail.gs v41,
// action "logins_set"), so the dashboard's 🔑 button can email one student their login without the password ever being in the repo,
// Firestore or the page. Reads the private student-passwords.csv written by student-accounts.mjs (email,group,…,password).
// Dry run by default (counts only, never prints a password); --apply sends, only on Roger's "apply". Run it again after a new student
// gets an account (a row that is already there is simply saved again).
//   SCHOOL_MAIL_URL=… SCHOOL_MAIL_KEY=… node tools/student-accounts/logins-upload.mjs <student-passwords.csv> [--apply]
import fs from "node:fs";
const [csv] = process.argv.slice(2).filter(a => !a.startsWith("--")), APPLY = process.argv.includes("--apply");
const URL_ = (process.env.SCHOOL_MAIL_URL || "").trim(), KEY = (process.env.SCHOOL_MAIL_KEY || "").trim();
if (!csv) { console.error("Usage: node logins-upload.mjs <student-passwords.csv> [--apply]"); process.exit(1); }
const lines = fs.readFileSync(csv, "utf8").split(/\r?\n/).filter(l => l.trim()), head = lines.shift().split(",").map(s => s.trim().toLowerCase());
const ie = head.indexOf("email"), ip = head.indexOf("password");
if (ie < 0 || ip < 0) { console.error("The CSV needs an email and a password column."); process.exit(1); }
const list = lines.map(l => l.split(",")).map(c => ({email: String(c[ie] || "").trim().toLowerCase(), password: String(c[ip] || "").trim()}))
  .filter(x => /^[^@\s,]+@ietramuntana\.cat$/.test(x.email) && x.password);
console.log(`${list.length} logins with a password in the CSV (${lines.length - list.length} rows left out).`);
if (!APPLY) { console.log("Dry run: nothing sent. Add --apply to save them in the school script."); process.exit(0); }
if (!URL_ || !KEY) { console.error("SCHOOL_MAIL_URL and SCHOOL_MAIL_KEY are needed."); process.exit(1); }
const post = async o => { const r = await fetch(URL_, {method: "POST", headers: {"content-type": "text/plain"}, body: JSON.stringify(Object.assign({key: KEY}, o)), redirect: "follow"}); return r.json(); };
let n = 0;
for (let i = 0; i < list.length; i += 50) { const j = await post({action: "logins_set", list: list.slice(i, i + 50)});
  if (!j || !j.ok) { console.error("The school script said:", j && j.error || "no answer", j && j.error === "nothing to send" ? "(still the old version: deploy v41 first)" : ""); process.exit(1); }
  n += j.n; }
const c = await post({action: "logins_count"});
console.log(`Saved ${n}. The school script now holds ${c && c.n} logins.`);
