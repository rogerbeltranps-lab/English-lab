// English Lab emails from the teacher's school account (Roger, 1 Nov 2026: students only receive mail from the school domain, and the
// school blocks app passwords). Paste this whole file in the Apps Script project "English Lab emails" of roger.beltran@ietramuntana.cat
// and deploy it as a web app (Execute as: Me · Who has access: Anyone). To update it: paste, Save, then Deploy > Manage deployments >
// ✏️ > Version: New version > Deploy (the link stays the same).
// Three kinds of request:
//   1. the GitHub Action "English Lab emails" (tools/notify/lib.mjs): {key, to, subject, body, name}; key = the GitHub secret SCHOOL_MAIL_KEY.
//   2. the teacher dashboard (Roger, 6 Nov 2026: email students the homework and announcements he sends): {idToken, bcc, subject, body, name};
//      idToken = the teacher's own English Lab sign-in, checked with Google here, so only roger.beltranps@gmail.com signed in can send.
//      The students go in Bcc (they never see each other's addresses); the email goes "to" the school account itself.
//   3. ✏️ Correct everything waiting now (Roger, 7 Nov 2026: the button must start the corrections at once, GitHub's 15-minute check ran
//      only every few hours): {idToken or key, action: "mark", at} starts the scheduled task "English Lab: mark and correct" on claude.ai
//      through its API trigger (MARK_TASK_TOKEN below), once per request (at = settings/marking.request.at) and never twice within 10 minutes.
//      Sent by the dashboard when the teacher presses the button, and by the GitHub Action "Marking on request" as a backup (with the key).
// Safety: a request without the right KEY or the teacher's sign-in is refused (the link alone is not enough); it only sends to school
// addresses (@ietramuntana.cat) and the teacher's Gmail, at most 50 people per request, within Google's daily limit.
// KEY: a long random text, the same here and in SCHOOL_MAIL_KEY; never in the repo (this copy has a placeholder and refuses the Action).
const KEY = "PUT-THE-KEY-HERE";
const TEACHER = "roger.beltranps@gmail.com";
const ALLOWED = /^[^@\s,]+@ietramuntana\.cat$/i;
// MARK_TASK_TOKEN: the API token of the scheduled task "English Lab: mark and correct" (claude.ai/code/routines > that task > API trigger >
// Generate token). Never in the repo (this copy has a placeholder: the button then falls back to the GitHub Action).
const MARK_TASK_TOKEN = "PASTE-THE-TOKEN-HERE";
const MARK_TASK_URL = "https://api.anthropic.com/v1/claude_code/routines/trig_019KQmvwTDQJ8wgujGeotDmG/fire";
const FIREBASE_WEB_KEY = "AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE";   // English Lab's public web key (shared/js/el-firebase.js), not a secret

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: "bad request"}); }
  const ok = a => ALLOWED.test(a) || a.toLowerCase() === TEACHER;
  const clean = l => [].concat(l || []).map(a => String(a).trim()).filter(ok);
  const keyOk = KEY.length >= 20 && KEY !== "PUT-THE-KEY-HERE" && m.key === KEY;
  if (!keyOk && !(m.idToken && isTeacher(m.idToken))) return out({ok: false, error: m.idToken ? "not the teacher" : "wrong key"});
  if (m.action === "mark") return out(startMarking(m.at));
  const to = clean(m.to), bcc = clean(m.bcc);
  if ((!to.length && !bcc.length) || !m.subject || !m.body) return out({ok: false, error: "nothing to send"});
  if (to.length + bcc.length > 50) return out({ok: false, error: "too many people in one email (50 at most)"});
  if (MailApp.getRemainingDailyQuota() < to.length + bcc.length) return out({ok: false, error: "daily email limit reached"});
  const mail = {to: to.length ? to.join(",") : Session.getEffectiveUser().getEmail(), subject: String(m.subject).slice(0, 200),
    body: String(m.body).slice(0, 20000), name: String(m.name || "English Lab").slice(0, 80)};
  if (bcc.length) mail.bcc = bcc.join(",");
  MailApp.sendEmail(mail);
  return out({ok: true, left: MailApp.getRemainingDailyQuota()});
}

// ✏️ Correct everything waiting now: start the scheduled task once for this request (the lock stops the dashboard and the Action firing
// it twice at the same moment). {ok: true, started} or {ok: true, already} or {ok: false, error}.
function startMarking(at) {
  if (!MARK_TASK_TOKEN || MARK_TASK_TOKEN === "PASTE-THE-TOKEN-HERE") return {ok: false, error: "no task token"};
  const rq = Date.parse(at || "") || Date.now(), lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return {ok: false, error: "busy, try again"};
  try {
    const P = PropertiesService.getScriptProperties(), last = Number(P.getProperty("markRequest") || 0), lastAt = Number(P.getProperty("markAt") || 0);
    if (rq <= last) return {ok: true, already: new Date(lastAt).toISOString()};
    if (Date.now() - lastAt < 10 * 60e3) return {ok: true, already: new Date(lastAt).toISOString()};
    const r = UrlFetchApp.fetch(MARK_TASK_URL, {method: "post", contentType: "application/json", payload: "{}", muteHttpExceptions: true,
      headers: {authorization: "Bearer " + MARK_TASK_TOKEN, "anthropic-beta": "experimental-cc-routine-2026-04-01", "anthropic-version": "2023-06-01"}});
    const code = r.getResponseCode();
    if (code < 200 || code >= 300) return {ok: false, error: "the task did not start (HTTP " + code + (code === 401 ? ": the token is wrong or was made again" : "") + ")"};
    P.setProperties({markRequest: String(rq), markAt: String(Date.now())});
    return {ok: true, started: new Date().toISOString()};
  } finally { lock.releaseLock(); }
}

// Run this once from the editor after pasting the token (Allow if Google asks): it only checks the token is there, it starts nothing.
function testMarkToken() {
  PropertiesService.getScriptProperties().getProperty("markAt");
  Logger.log(MARK_TASK_TOKEN && MARK_TASK_TOKEN !== "PASTE-THE-TOKEN-HERE" ? "Token pasted ✅" : "No token yet: paste it in MARK_TASK_TOKEN");
}

// the teacher's Firebase sign-in, checked by Google: a real, unexpired token of roger.beltranps@gmail.com with a verified email
function isTeacher(idToken) {
  try {
    const r = UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FIREBASE_WEB_KEY,
      {method: "post", contentType: "application/json", payload: JSON.stringify({idToken: String(idToken)}), muteHttpExceptions: true});
    if (r.getResponseCode() !== 200) return false;
    const u = (JSON.parse(r.getContentText()).users || [])[0];
    return !!u && u.emailVerified === true && String(u.email).toLowerCase() === TEACHER;
  } catch (x) { return false; }
}

// Run this once from the editor to check that sending works: you get a test email in your Gmail.
function testMe() {
  MailApp.sendEmail({to: TEACHER, subject: "English Lab: the school mail script works ✅", body: "Now deploy it as a web app and copy the link.", name: "English Lab"});
}

// One "English Lab" label in the school Gmail (Roger, 6 Nov 2026: "to see the mails I sent in a section of the mail ... together as well as
// the notifications"): every thread whose subject has "English Lab" (the students' emails, the teacher alerts sent from here to the Gmail,
// students' replies) gets it. Run setupLabel ONCE from the editor (Ejecutar): it labels the old ones and labels new ones every 10 minutes.
// No new deployment is needed for this part.
const LABEL = "English Lab";
function labelEnglishLab() {
  const l = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
  GmailApp.search('subject:"English Lab" newer_than:7d -label:english-lab', 0, 100).forEach(t => t.addLabel(l));
}
function setupLabel() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "labelEnglishLab").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("labelEnglishLab").timeBased().everyMinutes(10).create();
  const l = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
  GmailApp.search('subject:"English Lab" -label:english-lab', 0, 500).forEach(t => t.addLabel(l));
}
