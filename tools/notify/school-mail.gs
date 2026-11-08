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
//   5. A student's Speaking or Talk recording (Roger, 8 Nov 2026: "I want you to save audios … an audio emoji which I can listen"):
//      {idToken, action: "audio", mime, secs, data (base64), meta: {page, step, title, level, group, at}} sent by the student's page right
//      after a hand-in (shared/js/el-mic.js upload). Only a signed-in school account (or the teacher) may send it, at most 40 a day each and
//      6 MB each. It is saved in the teacher's Drive (AUDIO_FOLDER below: Teacher Studio › 04_Students (private) › Speaking recordings, shared
//      with this school account as Editor), in a folder per group, and only the teacher can open it. With GEMINI_KEY, Gemini also writes a
//      transcript from the audio, which the page adds to the hand-in for Wednesday's correction. Answer: {ok, id, secs, tr}.
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
// The Drive folder for recordings (Teacher Studio › 04_Students (private) › Speaking recordings): share it with this school account as
// Editor first, or saving fails with "no access to the recordings folder".
const AUDIO_FOLDER = "1O_TFIuX433T03sMhD6tMIFx8NcO-NqlF";
// GEMINI_KEY: a Gemini API key (aistudio.google.com > Get API key, on a project with billing: on the free tier Google may use the audio to
// improve its products). Never in the repo. Without it the recording is saved but not transcribed.
const GEMINI_KEY = "PASTE-THE-GEMINI-KEY-HERE";
const GEMINI_MODEL = "gemini-2.5-flash";
const FIREBASE_WEB_KEY = "AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE";   // English Lab's public web key (shared/js/el-firebase.js), not a secret

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: "bad request"}); }
  if (m.action === "audio") return out(saveAudio(m));
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

// A student's recording: check the sign-in, save it in the group's folder, transcribe it with Gemini when there is a key.
function saveAudio(m) {
  const who = signedIn(m.idToken);
  if (!who || !(ALLOWED.test(who.email) || who.email === TEACHER)) return {ok: false, error: "not signed in"};
  const data = String(m.data || "");
  if (!data || data.length > 8.2e6) return {ok: false, error: data ? "too long" : "no audio"};
  const P = PropertiesService.getScriptProperties(), day = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"), k = "audio:" + who.email;
  const c = JSON.parse(P.getProperty(k) || "{}"), n = c.day === day ? c.n : 0;
  if (n >= 40) return {ok: false, error: "too many recordings today"};
  P.setProperty(k, JSON.stringify({day, n: n + 1}));
  const meta = m.meta || {}, clean = v => String(v || "").replace(/[\\/:*?"<>|\n\r]/g, " ").trim().slice(0, 60);
  const mime = /^audio\/(webm|ogg|mp4)$/.test(m.mime) ? m.mime : "audio/webm", ext = mime === "audio/mp4" ? "m4a" : mime.split("/")[1];
  let root;
  try { root = DriveApp.getFolderById(AUDIO_FOLDER); } catch (x) { return {ok: false, error: "no access to the recordings folder"}; }
  const group = clean(meta.group) || "No group", it = root.getFoldersByName(group), folder = it.hasNext() ? it.next() : root.createFolder(group);
  const page = clean(String(meta.page || "").replace(/^\/|\.html$/g, "").replace(/\//g, " · ")), name = who.name || who.email.split("@")[0];
  const stamp = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd HH.mm");
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(data), mime, stamp + " · " + clean(name) + " · " + page + " · " + clean(meta.title || meta.step) + "." + ext));
  file.setDescription(JSON.stringify({email: who.email, group: meta.group || "", page: meta.page || "", step: meta.step || "", level: meta.level || "", secs: m.secs || null}));
  return {ok: true, id: file.getId(), secs: Number(m.secs) || null, tr: transcribe(data, mime)};
}

// Gemini writes down what the student said, word for word with their mistakes ("" without a key or when it fails: the hand-in keeps
// the browser's transcript). Tried as audio first, then as video/webm, which Gemini also reads.
function transcribe(data, mime) {
  if (!GEMINI_KEY || GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE") return "";
  const ask = "This is a recording of a secondary-school student doing an English speaking task. Write down exactly what the student says, " +
    "word for word, in English, keeping their mistakes, hesitations like \"em\" left out. Do not correct, translate or comment. Leave out any " +
    "question read by a computer voice. If the student says nothing, answer with nothing.";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_KEY;
  for (const mt of [mime, mime === "audio/webm" ? "video/webm" : null].filter(Boolean)) {
    try {
      const r = UrlFetchApp.fetch(url, {method: "post", contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({contents: [{parts: [{inline_data: {mime_type: mt, data}}, {text: ask}]}], generationConfig: {temperature: 0}})});
      if (r.getResponseCode() !== 200) continue;
      const j = JSON.parse(r.getContentText()), parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      return parts.map(p => p.text || "").join("").trim().slice(0, 6000);
    } catch (x) {}
  }
  return "";
}

// any English Lab account: {email, name} from a real, unexpired sign-in token of this Firebase project, checked by Google; null otherwise
function signedIn(idToken) {
  try {
    const r = UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FIREBASE_WEB_KEY,
      {method: "post", contentType: "application/json", payload: JSON.stringify({idToken: String(idToken || "")}), muteHttpExceptions: true});
    if (r.getResponseCode() !== 200) return null;
    const u = (JSON.parse(r.getContentText()).users || [])[0];
    return u && u.email ? {email: String(u.email).toLowerCase(), name: u.displayName || ""} : null;
  } catch (x) { return null; }
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

// Run this once from the editor after pasting the recordings part (it asks for Drive permission): it should log the folder's name.
function testRecordingsFolder() {
  Logger.log("Recordings folder: " + DriveApp.getFolderById(AUDIO_FOLDER).getName() + (GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE" ? " · no Gemini key yet" : " · Gemini key set"));
}
