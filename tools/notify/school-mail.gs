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
//   4. A student's ⚠️ Problem report (Roger, 8 Nov 2026: "read it straightaway … fix it and answer the student"): {idToken, action:
//      "problem"} from the student's page right after the report is saved (shared/js/el-cloud.js). Any signed-in English Lab account may
//      ask (checked with Google like the teacher's); it starts the scheduled task "English Lab: problem reports" through its API trigger
//      (PROBLEM_TASK_TOKEN below) at most once every 3 minutes and 30 times a day. The task also runs every hour, so nothing is lost.
//   5. A student's Speaking or Talk recording (Roger, 8 Nov 2026: "I want you to save audios … an audio emoji which I can listen"):
//      {idToken, action: "audio", mime, secs, data (base64), meta: {page, step, title, level, group, at}} sent by the student's page right
//      after a hand-in (shared/js/el-mic.js upload). Only a signed-in school account (or the teacher) may send it, at most 40 a day each and
//      6 MB each. It is saved in the teacher's Drive (AUDIO_FOLDER below: Teacher Studio › 04_Students (private) › Speaking recordings, shared
//      with this school account as Editor), in a folder per group, and only the teacher can open it. With GEMINI_KEY, Gemini also listens to it: a
//      transcript and kind notes on the task and pronunciation, which the page adds to the hand-in for Wednesday's correction.
//      Answer: {ok, id, secs, tr, notes}.
//   6. A student's final product video (Roger, 8 Nov 2026: "students load the final product on the web … the files could go to my drive"):
//      the page sends it in 8 MB pieces, so heavy videos work (up to 2 GB). {idToken, action: "video_start", name, size, mime, meta: {page,
//      ls, activity, group, level, title}} → {ok, token, chunk}; then {action: "video_chunk", token, offset, data (base64)} for each piece
//      → {ok, next} or, after the last one, {ok, done, id}; {action: "video_status", token} → {ok, next} to go on after a lost connection.
//      Saved in VIDEO_FOLDER (Teacher Studio › 04_Students (private) › Final product videos, shared with this school account as Editor),
//      a folder per group; only the teacher can open them. Nothing is ever deleted here (Roger deletes the year's videos himself).
//   7. Gemini watches a final product video for the teacher (Roger, 8 Nov 2026: "I give the video to Gemini and Gemini gives me the
//      feedback, then if I disagree I tell him to change whatever; Gemini can even see if the students are reading"): {idToken (teacher),
//      action: "fp_watch", fileId, ask: {course, level, student, task, group, rows: [{name, sub, w, d: [level 1 … level 4]}]}, prev, change}
//      → {ok, draft: {reading: {verdict, note}, rows: [{level 0-4 or null, why}], feedback, well_done, next_time}}. The video goes from Drive
//      to the Gemini Files API in pieces (Apps Script alone takes ~50 MB) and is deleted from Gemini as soon as the answer comes back. The
//      dashboard shows the draft next to the video; the teacher approves it or asks for a change (change + prev: Gemini watches again).
//   9. Final products handed in on Google Classroom (Roger, 8 Nov 2026: "some are links and the names are in here, what can we do?"):
//      {idToken (teacher), action: "fp_classroom", group, workId?} → {ok, course, works: [{id, title}], work, subs: [{email, name, state,
//      items: [{kind: "drive" | "youtube" | "link", id, url, title, mime}]}]}: this school account's class for the group (its name contains
//      the group, e.g. "English 2ESOA 26-27"), its assignments called "final product" (newest first) and every student's attachments, so the
//      dashboard can match them to students by email and Gemini can watch the videos (Drive files and Drive or YouTube links). Needs the
//      Google Classroom API service in this script (Editor › Services › + › Google Classroom API › Add).
//   8. Gemini spending this month for the dashboard: {idToken (teacher), action: "gemini_usage"} → {ok, months} (see addUsage below).
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
const GEMINI_MODEL = "gemini-flash-latest";   // Google's newest Flash (Gemini 3.8 Flash on 8 Nov 2026); 2.5 is closed to new users
// PROBLEM_TASK_TOKEN: the API token of the scheduled task "English Lab: problem reports" (claude.ai/code/routines > that task > API trigger >
// Generate token). Never in the repo; without it students' reports wait for the task's hourly run.
const PROBLEM_TASK_TOKEN = "PASTE-THE-TOKEN-HERE";
const PROBLEM_TASK_URL = "https://api.anthropic.com/v1/claude_code/routines/trig_01GrbR641ty9PsPJYeF8ifm9/fire";
// Final product videos (Teacher Studio › 04_Students (private) › Final product videos): share it with this school account as Editor first.
const VIDEO_FOLDER = "1BPlHZKxr7Ba2HEMSBid8StCi49-6Yg9y";
// The model that watches final product videos (Roger 8 Nov 2026: Pro for videos, Flash for speaking). "gemini-pro-latest" = Google's newest Pro
// (Gemini 3.1 Pro on 8 Nov 2026), about €0.10 a 3-minute video; "gemini-flash-latest" is about €0.03.
const FP_MODEL = "gemini-pro-latest";
const FIREBASE_WEB_KEY = "AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE";   // English Lab's public web key (shared/js/el-firebase.js), not a secret

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: "bad request"}); }
  if (m.action === "audio") return out(saveAudio(m));
  if (m.action === "video_start") return out(videoStart(m));
  if (m.action === "video_chunk") return out(videoChunk(m));
  if (m.action === "video_status") return out(videoStatus(m));
  if (m.action === "fp_watch") return out(m.idToken && isTeacher(m.idToken) ? fpWatch(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_classroom") return out(m.idToken && isTeacher(m.idToken) ? fpClassroom(m) : {ok: false, error: "not the teacher"});
  if (m.action === "gemini_usage") return out(m.idToken && isTeacher(m.idToken) ? geminiUsage() : {ok: false, error: "not the teacher"});
  const ok = a => ALLOWED.test(a) || a.toLowerCase() === TEACHER;
  const clean = l => [].concat(l || []).map(a => String(a).trim()).filter(ok);
  const keyOk = KEY.length >= 20 && KEY !== "PUT-THE-KEY-HERE" && m.key === KEY;
  if (m.action === "problem") return out(keyOk || (m.idToken && isUser(m.idToken)) ? startProblems() : {ok: false, error: "not signed in"});
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

// A student's problem report: start "English Lab: problem reports" now, unless it started less than 3 minutes ago (that run reads every
// open report) or already 30 times today. {ok: true, started} or {ok: true, already} or {ok: false, error}.
function startProblems() {
  if (!PROBLEM_TASK_TOKEN || PROBLEM_TASK_TOKEN === "PASTE-THE-TOKEN-HERE") return {ok: false, error: "no task token"};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return {ok: false, error: "busy, try again"};
  try {
    const P = PropertiesService.getScriptProperties(), last = Number(P.getProperty("problemAt") || 0);
    const day = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"), n = P.getProperty("problemDay") === day ? Number(P.getProperty("problemN") || 0) : 0;
    if (Date.now() - last < 3 * 60e3 || n >= 30) return {ok: true, already: new Date(last).toISOString()};
    const r = UrlFetchApp.fetch(PROBLEM_TASK_URL, {method: "post", contentType: "application/json", payload: "{}", muteHttpExceptions: true,
      headers: {authorization: "Bearer " + PROBLEM_TASK_TOKEN, "anthropic-beta": "experimental-cc-routine-2026-04-01", "anthropic-version": "2023-06-01"}});
    const code = r.getResponseCode();
    if (code < 200 || code >= 300) return {ok: false, error: "the task did not start (HTTP " + code + ")"};
    P.setProperties({problemAt: String(Date.now()), problemDay: day, problemN: String(n + 1)});
    return {ok: true, started: new Date().toISOString()};
  } finally { lock.releaseLock(); }
}

// any English Lab account (student, tester or teacher): a real, unexpired sign-in token of this Firebase project, checked by Google
function isUser(idToken) {
  try {
    const r = UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FIREBASE_WEB_KEY,
      {method: "post", contentType: "application/json", payload: JSON.stringify({idToken: String(idToken)}), muteHttpExceptions: true});
    return r.getResponseCode() === 200 && !!(JSON.parse(r.getContentText()).users || [])[0];
  } catch (x) { return false; }
}

// Run this once from the editor after pasting the token (Allow if Google asks): it only checks the token is there, it starts nothing.
function testMarkToken() {
  PropertiesService.getScriptProperties().getProperty("markAt");
  Logger.log(MARK_TASK_TOKEN && MARK_TASK_TOKEN !== "PASTE-THE-TOKEN-HERE" ? "Marking token pasted ✅" : "No marking token yet: paste it in MARK_TASK_TOKEN");
  Logger.log(PROBLEM_TASK_TOKEN && PROBLEM_TASK_TOKEN !== "PASTE-THE-TOKEN-HERE" ? "Problem reports token pasted ✅" : "No problem reports token yet: paste it in PROBLEM_TASK_TOKEN");
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
  const g = transcribe(data, mime, meta);
  return {ok: true, id: file.getId(), secs: Number(m.secs) || null, tr: g.tr, notes: g.notes};
}

// Gemini listens to the recording (Roger, 8 Nov 2026: "gemini can give feedback itself with a proper prompt per each activity, we need him
// not to be very strict … focus on if the student did well the task and pronunciation"). One call per recording, with the activity's own
// task (meta.task, sent by the page) and the student's route: it writes down what they said word for word (tr) and gives short, kind notes
// on the task and on pronunciation (notes). Both go into the hand-in; Wednesday's correction (in the teacher's voice) is written from them.
// {tr: "", notes: ""} without a key or when it fails: the hand-in keeps the browser's transcript. Tried as audio first, then as video/webm.
const ROUTE = {beginners: "Starter (A1, a lot of support)", insecure: "Base (A2-, support)", safe: "Core (A2)", daring: "Plus (A2+/B1)", native: "Pro"};
function transcribe(data, mime, meta) {
  const none = {tr: "", notes: ""};
  if (!GEMINI_KEY || GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE") return none;
  meta = meta || {};
  const ask = [
    "You are helping an English teacher at a secondary school in Catalonia (students aged 12-16). This is a recording of one student doing a speaking task from a learning path.",
    "These tasks are for learning, not exams: be encouraging and NOT strict. What matters is whether they did the task and how understandable their pronunciation is. Ignore small grammar slips unless they block the meaning, and ignore hesitations.",
    "The student's level: " + (ROUTE[meta.level] || "A2") + ". The task they were given: \"" + String(meta.task || meta.title || "a short speaking task").slice(0, 1500) + "\".",
    "If a computer voice reads questions in the recording, those are not the student: leave them out.",
    "Answer in JSON with these keys:",
    "transcript: exactly what the student says, word for word, in English, keeping their mistakes (empty if they say nothing);",
    "task: one or two sentences on how well they did the task (what they covered, anything important missing);",
    "pronunciation: what was clear, then at most three words or sounds to practise, each as: the word → how to say it (simple respelling, e.g. 'usually → YOO-zhoo-uh-lee');",
    "well_done: one specific thing they did well;",
    "next_time: one small, concrete tip.",
    "Write task, pronunciation, well_done and next_time in English, short and kind."
  ].join("\n");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_KEY;
  for (const mt of [mime, mime === "audio/webm" ? "video/webm" : null].filter(Boolean)) {
    try {
      const r = UrlFetchApp.fetch(url, {method: "post", contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({contents: [{parts: [{inline_data: {mime_type: mt, data}}, {text: ask}]}],
          generationConfig: {temperature: 0.2, responseMimeType: "application/json"}})});
      if (r.getResponseCode() !== 200) continue;
      const j = JSON.parse(r.getContentText());
      addUsage(GEMINI_MODEL, "audio", j);
      const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
      const o = JSON.parse(t), s = v => String(v || "").trim();
      const notes = [["Task", o.task], ["Pronunciation", o.pronunciation], ["Well done", o.well_done], ["Next time", o.next_time]]
        .filter(x => s(x[1])).map(x => x[0] + ": " + s(x[1])).join("\n");
      return {tr: s(o.transcript).slice(0, 6000), notes: notes.slice(0, 3000)};
    } catch (x) {}
  }
  return none;
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

// ---- 6. Final product videos from the student's page, in pieces (a Drive resumable upload kept here: the page never sees a Drive link
// or a token of this account, only a random upload token that works for this one file for 6 hours).
const CHUNK = 8 * 1024 * 1024;   // a multiple of 256 KB, as Drive asks; 8 MB is ~11 MB of base64 per request
function videoStart(m) {
  const who = signedIn(m.idToken);
  if (!who || !(ALLOWED.test(who.email) || who.email === TEACHER)) return {ok: false, error: "not signed in"};
  const size = Number(m.size) || 0, mime = /^video\/[\w.+-]+$/.test(m.mime || "") ? m.mime : "video/mp4";
  if (size < 1000) return {ok: false, error: "no video"};
  if (size > 2e9) return {ok: false, error: "too big"};
  const P = PropertiesService.getScriptProperties(), day = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"), k = "video:" + who.email;
  const c = JSON.parse(P.getProperty(k) || "{}"), n = c.day === day ? c.n : 0;
  if (n >= 8) return {ok: false, error: "too many videos today"};
  P.setProperty(k, JSON.stringify({day, n: n + 1}));
  const meta = m.meta || {}, clean = v => String(v || "").replace(/[\\/:*?"<>|\n\r]/g, " ").trim().slice(0, 60);
  let root;
  try { root = DriveApp.getFolderById(VIDEO_FOLDER); } catch (x) { return {ok: false, error: "no access to the videos folder"}; }
  const group = clean(meta.group) || "No group", it = root.getFoldersByName(group), folder = it.hasNext() ? it.next() : root.createFolder(group);
  const ext = (String(m.name || "").match(/\.(\w{2,4})$/) || [, mime.split("/")[1]])[1].toLowerCase();
  const stamp = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd HH.mm"), name = who.name || who.email.split("@")[0];
  const desc = JSON.stringify({email: who.email, group: meta.group || "", ls: meta.ls || "", activity: meta.activity || "", page: meta.page || "", level: meta.level || "", original: String(m.name || "").slice(0, 120)});
  const r = UrlFetchApp.fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true", {method: "post",
    contentType: "application/json; charset=UTF-8", muteHttpExceptions: true,
    headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken(), "X-Upload-Content-Type": mime, "X-Upload-Content-Length": String(size)},
    payload: JSON.stringify({name: stamp + " · " + clean(name) + " · " + clean(meta.title || meta.activity || "Final product") + "." + ext, parents: [folder.getId()], description: desc})});
  const url = header(r, "location");
  if (r.getResponseCode() !== 200 || !url) return {ok: false, error: "Drive did not start the upload (HTTP " + r.getResponseCode() + ")"};
  const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  CacheService.getScriptCache().put("up:" + token, JSON.stringify({url, size, email: who.email}), 21600);
  return {ok: true, token, chunk: CHUNK};
}
function videoChunk(m) {
  const up = upOf(m.token);
  if (!up) return {ok: false, error: "the upload expired: start again"};
  const bytes = Utilities.base64Decode(String(m.data || "")), off = Number(m.offset) || 0, end = off + bytes.length - 1;
  if (!bytes.length || end >= up.size) return {ok: false, error: "bad piece"};
  const r = UrlFetchApp.fetch(up.url, {method: "put", contentType: "application/octet-stream", payload: bytes, muteHttpExceptions: true,
    headers: {"Content-Range": "bytes " + off + "-" + end + "/" + up.size}});
  return upAnswer(r, m.token);
}
function videoStatus(m) {
  const up = upOf(m.token);
  if (!up) return {ok: false, error: "the upload expired: start again"};
  const r = UrlFetchApp.fetch(up.url, {method: "put", payload: "", muteHttpExceptions: true, headers: {"Content-Range": "bytes */" + up.size}});
  return upAnswer(r, m.token);
}
function upOf(token) { const v = token && CacheService.getScriptCache().get("up:" + token); return v ? JSON.parse(v) : null; }
// 308 = Drive wants more (Range: bytes=0-N → next = N+1); 200/201 = the file is complete
function upAnswer(r, token) {
  const code = r.getResponseCode();
  if (code === 308) { const g = String(header(r, "range") || "").match(/-(\d+)$/); return {ok: true, next: g ? Number(g[1]) + 1 : 0}; }
  if (code === 200 || code === 201) {
    CacheService.getScriptCache().remove("up:" + token);
    const f = JSON.parse(r.getContentText() || "{}");
    return {ok: true, done: true, id: f.id || "", name: f.name || ""};
  }
  return {ok: false, error: "Drive refused the piece (HTTP " + code + ")"};
}
function header(r, name) { const h = r.getAllHeaders(); for (const k in h) if (k.toLowerCase() === name) return [].concat(h[k])[0]; return ""; }

// ---- 7. Gemini watches a final product video and drafts the marks (the teacher approves or asks for a change in the dashboard).
const FP_LEVEL = {beginners: "Starter", insecure: "Base", safe: "Core", daring: "Plus", native: "Pro"};
function fpWatch(m) {
  if (!GEMINI_KEY || GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE") return {ok: false, error: "no Gemini key in the school script"};
  const t0 = Date.now(), ask = m.ask || {}, rows = [].concat(ask.rows || []).slice(0, 12);
  const G = "https://generativelanguage.googleapis.com";
  // A YouTube link (a Classroom hand-in): Gemini watches it from YouTube itself (public or unlisted videos only); nothing is uploaded.
  const yt = String(m.youtube || "").match(/^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{6,}/);
  if (yt) return fpAsk(m, ask, rows, {file_uri: yt[0]}, () => {});
  let file;
  try { file = DriveApp.getFileById(String(m.fileId || "")); } catch (x) { return {ok: false, error: "the school account cannot open that video"}; }
  const size = file.getSize(), mime = file.getMimeType();
  if (!/^video\//.test(mime)) return {ok: false, error: "that file is not a video (" + mime + ")"};
  if (size > 2e9) return {ok: false, error: "the video is over 2 GB"};
  // 1. a resumable upload to the Gemini Files API, fed from Drive 16 MB at a time
  const s = UrlFetchApp.fetch(G + "/upload/v1beta/files?key=" + GEMINI_KEY, {method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: {"X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": String(size), "X-Goog-Upload-Header-Content-Type": mime},
    payload: JSON.stringify({file: {display_name: "final product"}})});
  const upUrl = header(s, "x-goog-upload-url");
  if (!upUrl) return {ok: false, error: "Gemini did not accept the upload (HTTP " + s.getResponseCode() + ")"};
  const piece = 16 * 1024 * 1024, tok = ScriptApp.getOAuthToken();
  let gfile = null;
  for (let off = 0; off < size; off += piece) {
    if (Date.now() - t0 > 4.3 * 60e3) return {ok: false, error: "the video is too long to send in one go"};
    const end = Math.min(size, off + piece) - 1, last = end === size - 1;
    const d = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + file.getId() + "?alt=media&supportsAllDrives=true",
      {headers: {Authorization: "Bearer " + tok, Range: "bytes=" + off + "-" + end}, muteHttpExceptions: true});
    if (d.getResponseCode() !== 206 && d.getResponseCode() !== 200) return {ok: false, error: "Drive did not give the video (HTTP " + d.getResponseCode() + ")"};
    const u = UrlFetchApp.fetch(upUrl, {method: "post", contentType: "application/octet-stream", payload: d.getContent(), muteHttpExceptions: true,
      headers: {"X-Goog-Upload-Command": last ? "upload, finalize" : "upload", "X-Goog-Upload-Offset": String(off)}});
    if (u.getResponseCode() !== 200) return {ok: false, error: "Gemini refused a piece (HTTP " + u.getResponseCode() + ")"};
    if (last) gfile = (JSON.parse(u.getContentText() || "{}").file) || null;
  }
  if (!gfile || !gfile.name) return {ok: false, error: "Gemini did not keep the video"};
  const del = () => { try { UrlFetchApp.fetch(G + "/v1beta/" + gfile.name + "?key=" + GEMINI_KEY, {method: "delete", muteHttpExceptions: true}); } catch (x) {} };
  try {
    // 2. Gemini prepares the video (a few seconds to a minute)
    while (gfile.state === "PROCESSING") {
      if (Date.now() - t0 > 5 * 60e3) return {ok: false, error: "Gemini took too long to open the video: try again"};
      Utilities.sleep(4000);
      gfile = JSON.parse(UrlFetchApp.fetch(G + "/v1beta/" + gfile.name + "?key=" + GEMINI_KEY, {muteHttpExceptions: true}).getContentText() || "{}");
    }
    if (gfile.state !== "ACTIVE") return {ok: false, error: "Gemini could not read the video"};
  } catch (x) { del(); return {ok: false, error: "Gemini could not open the video: try again"}; }
  return fpAsk(m, ask, rows, {mime_type: gfile.mimeType || mime, file_uri: gfile.uri}, del);
}
// 3. one question with the rubric about the video (fd = Gemini's file_data); del() removes the uploaded copy from Gemini afterwards
function fpAsk(m, ask, rows, fd, del) {
  const G = "https://generativelanguage.googleapis.com";
  try {
    const r = UrlFetchApp.fetch(G + "/v1beta/models/" + FP_MODEL + ":generateContent?key=" + GEMINI_KEY, {method: "post", contentType: "application/json", muteHttpExceptions: true,
      payload: JSON.stringify({contents: [{parts: [{file_data: fd}, {text: fpPrompt(ask, rows, m.prev, m.change)}]}],
        generationConfig: {temperature: 0.2, responseMimeType: "application/json"}})});
    if (r.getResponseCode() !== 200) return {ok: false, error: "Gemini did not answer (HTTP " + r.getResponseCode() + ")" + (fd.mime_type ? "" : ": the YouTube video may be private")};
    const j = JSON.parse(r.getContentText());
    addUsage(FP_MODEL, "video", j);
    const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
    const o = JSON.parse(t), str = v => String(v || "").trim(), lv = v => v === null || v === undefined || v === "" ? null : Math.max(0, Math.min(4, Math.round(Number(v)))) ;
    const verdict = ["speaks", "partly", "reads"].includes(o.reading && o.reading.verdict) ? o.reading.verdict : "partly";
    return {ok: true, model: FP_MODEL, draft: {reading: {verdict, note: str(o.reading && o.reading.note).slice(0, 600)},
      rows: rows.map((x, i) => { const g = [].concat(o.rows || []).find(y => Number(y.n) === i + 1) || {}, l = isNaN(lv(g.level)) ? null : lv(g.level);
        return {level: l, mark: m.ask && m.ask.marks ? fpRowMark(l, g.mark) : null, why: str(g.why).slice(0, 700), good: str(g.good).slice(0, 400), improve: str(g.improve).slice(0, 400)}; }),
      feedback: str(o.feedback).slice(0, 2500), well_done: str(o.well_done).slice(0, 400), next_time: str(o.next_time).slice(0, 400), secs: Number(o.seconds) || null,
      sounds: [].concat(o.sounds || []).slice(0, 12).map(x => ({word: str(x && x.word).slice(0, 40), heard: str(x && x.heard).slice(0, 60), tip: str(x && x.tip).slice(0, 120)})).filter(x => x.word)}};
  } catch (x) { return {ok: false, error: "Gemini's answer could not be read: try again"}; }
  finally { del(); }
}
// Agreed with Roger, 8 Nov 2026: "I want the feedback to be positive and friendly. I assume they will all read and we have to suggest that they
// try not to do it. If we are very strict the grades will be very low. On the other hand I don't want to give grades they don't deserve", with
// his model draft for Martín (4 ESO LS1): a mark out of 10 per row with its level (3+ = top of level 3), What went well / To keep in mind with
// the student's real words, and a warm teacher comment by first name. Plus (22:39) "a list of the words that they mispronounce like walk
// (pronouncing the L) … not for the students individually but to create a listen and repeat video to correct that in class" (sounds:
// teacher only; the video itself is made without Gemini).
// a row's mark out of 10 (steps of 0.5) kept inside its level's band, so the level the student board shades (mark ÷ 2.5 rounded) is the same
const FP_BAND = [[0, 0], [1.5, 3.5], [4, 6], [6.5, 8.5], [9, 10]];
function fpRowMark(level, mark) {
  if (level === null) return null;
  const b = FP_BAND[level], n = Math.round(Number(mark) * 2) / 2;
  return isNaN(n) ? b[1] : Math.max(b[0], Math.min(b[1], n));
}
function fpPrompt(ask, rows, prev, change) {
  const marks = !!ask.marks, first = String(ask.student || "").trim().split(/\s+/)[0] || "the student";
  const lines = [
    "You are helping Roger, an English teacher at a secondary school in Catalonia, mark a final product video by a student aged 12-16.",
    "Course: " + String(ask.course || "ESO").slice(0, 40) + ". Every student is marked on the SAME rubric, at about " + String(ask.level || "A2+").slice(0, 20) + " level.",
    "The task: " + String(ask.task || "a short video presentation in English with slides").slice(0, 1500),
    ask.group ? "It is a GROUP video. The student being marked is " + String(ask.student || "").slice(0, 60) + ". Judge the group rows on the whole video and the individual rows on that student's part; if you cannot tell which person they are, say so in the reading note and judge the group." : "The student is " + String(ask.student || "the student").slice(0, 60) + " (call them " + first + ").",
    "Watch and listen to the whole video.",
    "",
    "HOW ROGER WANTS IT MARKED",
    "- Be positive, friendly and encouraging, AND honest. Give the level the video really shows: never a higher one the student has not earned, and do not be harsh either. If they would fail only because you were very strict, you are being too strict.",
    "- Most students this age read part of their presentation. That is expected. Say how much they read in the reading check, let it count only in the row about speaking without reading (Speaking), and do not lower other rows because of it. If they read, the feedback always gives a kind, practical tip to try not to read next time (e.g. use the slides only as prompts, rehearse a few times, look at the camera).",
    "- Judge the language at the course level: small slips are normal. Quote the student's real words in quotation marks, with the correct form, e.g. \"he also have breakfast\" → \"he also has breakfast\". Praise with real examples too (verbs, expressions, connectors they used).",
    "- A row that cannot be judged from the video (for example a written hand-in, notes, sources or process steps) gets level null.",
    "",
    "The rubric rows (levels: 4 = very good, 3 = good, 2 = fair, 1 = developing, 0 = no evidence):"
  ];
  rows.forEach((r, i) => {
    lines.push((i + 1) + ". " + String(r.name || "").slice(0, 80) + (r.sub ? " (" + String(r.sub).slice(0, 120) + ")" : "") + (r.w ? " · " + r.w + " %" : ""));
    [].concat(r.d || []).slice(0, 4).forEach((d, k) => lines.push("   level " + (k + 1) + ": " + String(d).slice(0, 600)));
  });
  lines.push(
    "",
    "Answer in JSON with these keys:",
    "reading: {verdict: \"speaks\" | \"partly\" | \"reads\", note: one or two sentences for Roger with evidence and times, e.g. 'reads the slides from 0:40 to 1:20'};",
    "rows: a list with one item per rubric row: {n: the row number, level: 0-4 or null (the level whose description fits best)" +
      (marks ? ", mark: the row's mark out of 10 in steps of 0.5, inside its level: level 4 = 9 to 10, level 3 = 6.5 to 8.5, level 2 = 4 to 6, level 1 = 1.5 to 3.5, level 0 = 0 (use the top of the level when the student is close to the next level)" : "") +
      ", why: one or two sentences for Roger with what you saw or heard (times help), good: 'What went well', one or two short specific sentences with real examples from the video, improve: 'To keep in mind', one short specific sentence with the real words and the correct form (empty if there is nothing to improve)};",
    "feedback: Roger's comment to the student, 3 or 4 sentences in simple English, written as their teacher to them (you): start warmly with their first name (e.g. 'Great work, " + first + "!'), say specifically what was good, then give one or two concrete things for next time (the reading tip if they read). Never mention AI, Gemini, a rubric, levels or marks;",
    "well_done: one specific thing they did well; next_time: one small, concrete tip; seconds: the length of the video in seconds;",
    "sounds: for Roger only, NOT for the student (he collects them from the whole class to make a listen-and-repeat video): a list of up to 12 English words the student mispronounced in a way that matters, typical of Catalan and Spanish speakers, e.g. 'walk' with the L sounded, 'vegetables' with 4 syllables, 'clothes' as 2 syllables, a silent -ed sounded ('watched' as 'watch-ed'), 'v' and 'b' the same. Each item: {word: the word as written, heard: how the student said it in IPA, e.g. '/wɔːlk/', tip: the correct British pronunciation in IPA and a very short note, e.g. '/wɔːk/ (the L is silent)'}. Only words you clearly heard; an empty list if there are none. Do not mention these in the feedback."
  );
  if (change) lines.push("", "You already gave this draft: " + JSON.stringify(prev || {}).slice(0, 6000), "Roger disagrees and says: \"" + String(change).slice(0, 1500) + "\". Watch again and give the whole draft again following his instruction exactly.");
  return lines.join("\n");
}

// Run this once from the editor after pasting this part (Allow if Google asks): it should log the videos folder's name.
function testVideosFolder() {
  Logger.log("Videos folder: " + DriveApp.getFolderById(VIDEO_FOLDER).getName() + " · Drive token " + (ScriptApp.getOAuthToken() ? "ok" : "missing"));
}

// ---- Gemini spending (Roger, 8 Nov 2026: "can I have a gemini count on the webpage to see if I spending too much money?"): every call
// adds its cost from Google's own token count (usageMetadata) to the month's total in this script's properties; the dashboard asks for it
// ({idToken (teacher), action: "gemini_usage"} → {ok, months: [{month, eur, calls, audio, video}]}, newest first). Paid-tier prices in US$
// per million tokens (ai.google.dev/pricing, Nov 2026); thinking tokens are billed as output. An estimate: Google's billing page is exact.
const PRICES = {"gemini-flash-latest": {text: 0.50, audio: 1.00, out: 3.00}, "gemini-pro-latest": {text: 2.00, audio: 2.00, out: 12.00},
  "gemini-2.5-flash": {text: 0.30, audio: 1.00, out: 2.50}, "gemini-2.5-pro": {text: 1.25, audio: 1.25, out: 10.00}};
const EUR_PER_USD = 0.87;
function addUsage(model, kind, j) {
  try {
    const u = j.usageMetadata || {}, p = PRICES[model] || PRICES["gemini-pro-latest"];
    const det = [].concat(u.promptTokensDetails || []), audio = det.filter(d => d.modality === "AUDIO").reduce((a, d) => a + (d.tokenCount || 0), 0);
    const input = (u.promptTokenCount || 0) - audio, out = (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0);
    const eur = (input * p.text + audio * p.audio + out * p.out) / 1e6 * EUR_PER_USD;
    const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) return;
    try {
      const P = PropertiesService.getScriptProperties(), k = "gemini:" + Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM");
      const c = JSON.parse(P.getProperty(k) || "{}");
      c.eur = (c.eur || 0) + eur; c.calls = (c.calls || 0) + 1; c[kind] = (c[kind] || 0) + 1;
      P.setProperty(k, JSON.stringify(c));
    } finally { lock.releaseLock(); }
  } catch (x) {}
}
function geminiUsage() {
  const all = PropertiesService.getScriptProperties().getProperties();
  const months = Object.keys(all).filter(k => /^gemini:\d{4}-\d{2}$/.test(k)).sort().reverse().slice(0, 12)
    .map(k => { const c = JSON.parse(all[k]); return {month: k.slice(7), eur: Math.round((c.eur || 0) * 100) / 100, calls: c.calls || 0, audio: c.audio || 0, video: c.video || 0}; });
  return {ok: true, months};
}

// ---- 9. Final products handed in on Google Classroom (see the top): read-only, nothing is changed in Classroom
function fpClassroom(m) {
  if (typeof Classroom === "undefined") return {ok: false, error: "add the Google Classroom API service to the school script (Editor › Services › + › Google Classroom API)"};
  const g = String(m.group || "").replace(/\s/g, "").toUpperCase(), flat = t => String(t || "").replace(/\s/g, "").toUpperCase();
  const courses = (Classroom.Courses.list({teacherId: "me", courseStates: ["ACTIVE"], pageSize: 50}).courses || []).filter(c => g && flat(c.name).includes(g));
  if (!courses.length) return {ok: false, error: "no Classroom class with " + g + " in its name"};
  const c = courses[0];
  const works = (Classroom.Courses.CourseWork.list(c.id, {pageSize: 100, orderBy: "updateTime desc"}).courseWork || [])
    .filter(w => /final\s*(product|task)|producte\s*final|vlog/i.test(w.title || "")).map(w => ({id: w.id, title: w.title}));
  if (!works.length) return {ok: false, error: "no assignment called Final product in " + c.name};
  const w = works.find(x => x.id === m.workId) || works[0];
  const people = {};
  let tok;
  do { const r = Classroom.Courses.Students.list(c.id, {pageSize: 100, pageToken: tok}); (r.students || []).forEach(st => people[st.userId] = st.profile || {}); tok = r.nextPageToken; } while (tok);
  const subs = [];
  tok = undefined;
  do {
    const r = Classroom.Courses.CourseWork.StudentSubmissions.list(c.id, w.id, {pageSize: 100, pageToken: tok});
    (r.studentSubmissions || []).forEach(x => {
      const pr = people[x.userId] || {}, items = [];
      ((x.assignmentSubmission || {}).attachments || []).forEach(a => {
        if (a.driveFile) { let mime = ""; try { mime = DriveApp.getFileById(a.driveFile.id).getMimeType(); } catch (e) { mime = "no access"; }
          items.push({kind: "drive", id: a.driveFile.id, title: a.driveFile.title || "", url: a.driveFile.alternateLink || "", mime}); }
        else if (a.youTubeVideo) items.push({kind: "youtube", id: a.youTubeVideo.id, title: a.youTubeVideo.title || "", url: "https://www.youtube.com/watch?v=" + a.youTubeVideo.id});
        else if (a.link) { const u = String(a.link.url || ""), d = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{20,})/), y = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
          if (d) { let mime = ""; try { mime = DriveApp.getFileById(d[1]).getMimeType(); } catch (e) { mime = "no access"; } items.push({kind: "drive", id: d[1], title: a.link.title || "", url: u, mime}); }
          else if (y) items.push({kind: "youtube", id: y[1], title: a.link.title || "", url: "https://www.youtube.com/watch?v=" + y[1]});
          else items.push({kind: "link", title: a.link.title || "", url: u}); }
      });
      subs.push({email: String(pr.emailAddress || "").toLowerCase(), name: (pr.name || {}).fullName || "", state: x.state || "", late: !!x.late, items});
    });
    tok = r.nextPageToken;
  } while (tok);
  return {ok: true, course: c.name, works, work: w, subs};
}
