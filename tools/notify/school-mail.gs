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
//      (PROBLEM_TASK_TOKEN below) at most once every 3 minutes and 30 times a day. A report sent while the task started less than 3 minutes ago starts it again
//      3 minutes later by itself (startProblemsLater), so nothing is lost. The task has no schedule: it runs only for reports.
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
//  20. v31 (Roger, 17 Nov 2026, Towards Nativeness: "speaking task should be corrected instantly and then I would need to answer a new task
//      out of my mistakes"): a recording whose meta.coach is "c2" (only the Towards Nativeness pages send it) gets a C2 coach prompt
//      instead of the kind A2 one: every grammar or idiom slip as {said, natural, why} and a new task built from those mistakes
//      ({questions, use}). Answer adds {fixes, next}; the page shows them at once and 🔁 Speak again asks the new task. Same model and cost.
//  19. v30 (Roger, 17 Nov 2026: "I want to be able to listen to the audio in the web when I press them and see the feedback. In my iPad
//      it got me to the Drive file and it didn't work"): new action {idToken (teacher), action: "audio_get", fileId} → {ok, mime, name,
//      data (base64)}: the dashboard plays a student's Speaking or Talk recording inside the page, next to the correction, instead of
//      opening Drive. Only the teacher may ask, and only for a file in AUDIO_FOLDER (Speaking recordings or one of its group folders).
//  18. v29 (Roger, 14 Nov 2026: "que els alumnes no vegin la hora en que els envio els missatges"): emails to students sent between 21:00
//      and 7:30 (Madrid) wait here until 7:30, so Gmail never shows a late hour. The dashboard asks the teacher first and sends at (the
//      7:30 in ms: hold until then) or now: true ("Send now anyway"); anything else to a school address in those hours (a scheduled
//      announcement, the GitHub Action) waits too. Answer {ok, later (ISO time)}. Kept in Script properties (late:…), sent by the
//      trigger sendLate; lateStatus() in the editor logs what is waiting. Emails only to the teacher are never held. See "v29" below.
//  17. v28 (Roger, 14 Nov 2026: "I see that some presentations have the link of the video, tell gemini to check that"): new action
//      {idToken (teacher), action: "fp_slides_video", fileId, student} → {ok, video: {id | youtube, name}} or {ok: false, links, error}: it
//      looks inside the student's slides or document (or the PDF copy made from them, by the [id] in its name) for a link to their video
//      (Google Vids, a Drive video or audio file, YouTube); a Google Vids is turned into an mp4 first. Gemini then watches that video.
//  16. v27 (Roger, 14 Nov 2026: "we need to tell gemini that if there's no video the mark is a 0"): in "fp_watch", a hand-in where the
//      student cannot be heard speaking (slides or a PDF only, a silent video, only music, someone else talking) gets level 0 = mark 0 on
//      EVERY row, and the comment asks for the video (it used to mark the slides and leave the speaking rows empty: 4.1/10 for slides only).
//  15. v26 (Roger, 14 Nov 2026: "I want to receive a notification when students upload it"): every final product video a student finishes
//      uploading on the site sends the teacher an email "English Lab: 🎬 new final product video · name (group)" (see "v26" below).
//  14. v25 (Roger, 14 Nov 2026: "I will ask students to load it on the web"): Gemini drafts every final product video uploaded on the site
//      by itself, right after the upload (actions fp_auto_setup / fp_auto_list / fp_auto_ack, see "v25" below). Students never see it.
//  13. v24 (Roger, 14 Nov 2026: "4/4 is 10/10"): in "fp_watch", a rubric row at level 4 (Very good) is always 10/10 (it was 9 to 10).
//  12. v23 (Roger, 14 Nov 2026: "I want gemini see my changes and learn from them"): "fp_watch" also takes ask.lessons, Roger's latest
//      corrections of Gemini's final product drafts (up to 6 short texts from the dashboard, no names), and puts them in the prompt.
//      Nothing else changes; a dashboard that sends none gets the same prompt as v22.
//  11. v22 (Roger, 14 Nov 2026: "and on each video the money that costed"): each Gemini answer also says what that one call cost
//      (eur, from Google's token count, as the month total): "audio" → {…, eur}, "fp_watch" → {…, eur}. The pages keep it with the
//      recording (audio.eur) and the draft (eur), and the dashboard's ✏️ Corrections shows it on each row. Nothing else changes.
//  10. v20 (Roger, 13 Nov 2026: the email about the 📓 notebook "I need to add an image"): an email from the key holder can carry a
//      formatted (html) version with up to 3 pictures inside; nothing else changes.
//   9. v19 (Roger, 12 Nov 2026: "can you read the emails of the school account and tell me which need my reply"): READ ONLY.
//      {key, action: "inbox", days (1-30, default 7), max (1-50, default 30)} → {ok, threads: [{id, subject, unread, starred, messages:
//      [{from, to, cc, date, body}]}]}. It never sends, marks as read, labels, archives or deletes anything.
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
// PROBLEM_TASK_TOKEN: the API token of the scheduled task "English Lab: problem reports (instant)" (claude.ai/code/routines > that task > API trigger >
// Generate token). Never in the repo; without it students' reports wait until Roger answers them on the dashboard.
const PROBLEM_TASK_TOKEN = "PASTE-THE-TOKEN-HERE";
const PROBLEM_TASK_URL = "https://api.anthropic.com/v1/claude_code/routines/trig_019JfVaVpNJdhGnFTsMxcWYg/fire";
// Final product videos (Teacher Studio › 04_Students (private) › Final product videos): share it with this school account as Editor first.
const VIDEO_FOLDER = "1BPlHZKxr7Ba2HEMSBid8StCi49-6Yg9y";
// The model that watches final product videos (Roger 8 Nov 2026: Pro for videos, Flash for speaking). v18 (Roger, 10 Nov 2026: "gemini was
// completely mistaken" about Ashot and Hajra, 2 ESO A): "gemini-pro-latest" turned out to be Gemini 3.1 Pro Preview (January 2026), so the
// videos now go to Google's flagship Gemini 4 Argon, with sharper frames (MEDIA_RESOLUTION_HIGH) and the default temperature 1.0 that Google
// advises for Gemini 3 and later. About €0.07 a 100-second video (introductory price; Google doubles it on 1 Dec 2026).
const FP_MODEL = "gemini-4-argon";
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
  if (m.action === "fp_convert") return out(m.idToken && isTeacher(m.idToken) ? fpConvert(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_slides_video") { if (!(m.idToken && isTeacher(m.idToken))) return out({ok: false, error: "not the teacher"});
    try { return out(fpSlidesVideo(m)); } catch (x) { return out({ok: false, error: "slides: " + String(x && x.message || x).slice(0, 200)}); } }
  if (m.action === "fp_copy") return out(m.idToken && isTeacher(m.idToken) ? fpCopy(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_folder") return out(m.idToken && isTeacher(m.idToken) ? fpFolder(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_classroom") { if (!(m.idToken && isTeacher(m.idToken))) return out({ok: false, error: "not the teacher"});
    try { return out(fpClassroom(m)); } catch (x) { return out({ok: false, error: "Classroom: " + String(x && x.message || x).slice(0, 300)}); } }
  if (m.action === "fp_auto_setup") return out(m.idToken && isTeacher(m.idToken) ? fpaSetup(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_auto_list") return out(m.idToken && isTeacher(m.idToken) ? fpaList(m) : {ok: false, error: "not the teacher"});
  if (m.action === "fp_auto_ack") return out(m.idToken && isTeacher(m.idToken) ? fpaAck(m) : {ok: false, error: "not the teacher"});
  if (m.action === "audio_get") return out(m.idToken && isTeacher(m.idToken) ? audioGet(m) : {ok: false, error: "not the teacher"});
  if (m.action === "gemini_usage") return out(m.idToken && isTeacher(m.idToken) ? geminiUsage() : {ok: false, error: "not the teacher"});
  const ok = a => ALLOWED.test(a) || a.toLowerCase() === TEACHER;
  const clean = l => [].concat(l || []).map(a => String(a).trim()).filter(ok);
  const keyOk = KEY.length >= 20 && KEY !== "PUT-THE-KEY-HERE" && m.key === KEY;
  if (m.action === "problem") return out(keyOk || (m.idToken && isUser(m.idToken)) ? startProblems() : {ok: false, error: "not signed in"});
  if (!keyOk && !(m.idToken && isTeacher(m.idToken))) return out({ok: false, error: m.idToken ? "not the teacher" : "wrong key"});
  if (m.action === "mark") return out(startMarking(m.at));
  if (m.action === "inbox") return out(readInbox(m));
  const to = clean(m.to), bcc = clean(m.bcc);
  if ((!to.length && !bcc.length) || !m.subject || !m.body) return out({ok: false, error: "nothing to send"});
  if (to.length + bcc.length > 50) return out({ok: false, error: "too many people in one email (50 at most)"});
  if (MailApp.getRemainingDailyQuota() < to.length + bcc.length) return out({ok: false, error: "daily email limit reached"});
  const mail = {to: to.length ? to.join(",") : Session.getEffectiveUser().getEmail(), subject: String(m.subject).slice(0, 200),
    body: String(m.body).slice(0, 20000), name: String(m.name || "English Lab").slice(0, 80)};
  if (bcc.length) mail.bcc = bcc.join(",");
  // v20: an email can also carry a formatted version with pictures inside (html + images {cid: {data: base64, type}}, at most 3,
  // shown with <img src="cid:name">); the plain text stays for email apps that do not show it
  if (m.html) mail.htmlBody = String(m.html).slice(0, 60000);
  if (m.images && typeof m.images === "object") { const im = {};
    Object.keys(m.images).slice(0, 3).forEach(k => { const x = m.images[k] || {};
      if (/^[a-z0-9_-]{1,30}$/i.test(k) && x.data && String(x.data).length < 2800000)
        im[k] = Utilities.newBlob(Utilities.base64Decode(String(x.data)), /^image\/(png|jpeg|gif)$/.test(x.type) ? x.type : "image/jpeg", k); });
    if (Object.keys(im).length) mail.inlineImages = im; }
  // v29: late emails to students wait until 7:30 (an email with pictures inside goes at once: they are too big to keep)
  const later = mail.inlineImages ? 0 : lateUntil(m, to.concat(bcc));
  if (later) { lateQueue(mail, later); return out({ok: true, later: new Date(later).toISOString(), left: MailApp.getRemainingDailyQuota()}); }
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
    if (Date.now() - last < 3 * 60e3 || n >= 30) { if (n < 30) problemsLater(last); return {ok: true, already: new Date(last).toISOString()}; }
    const r = UrlFetchApp.fetch(PROBLEM_TASK_URL, {method: "post", contentType: "application/json", payload: "{}", muteHttpExceptions: true,
      headers: {authorization: "Bearer " + PROBLEM_TASK_TOKEN, "anthropic-beta": "experimental-cc-routine-2026-04-01", "anthropic-version": "2023-06-01"}});
    const code = r.getResponseCode();
    if (code < 200 || code >= 300) return {ok: false, error: "the task did not start (HTTP " + code + ")"};
    P.setProperties({problemAt: String(Date.now()), problemDay: day, problemN: String(n + 1)});
    return {ok: true, started: new Date().toISOString()};
  } finally { lock.releaseLock(); }
}

// A report came in while the last run was less than 3 minutes old (it may have read the list before this report): start the task once more
// when the 3 minutes are over, with one Apps Script timer (never two at a time).
function problemsLater(last) {
  try {
    if (ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === "startProblemsLater")) return;
    ScriptApp.newTrigger("startProblemsLater").timeBased().after(Math.max(60e3, last + 3 * 60e3 - Date.now() + 30e3)).create();
  } catch (x) {}
}
function startProblemsLater() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "startProblemsLater").forEach(t => ScriptApp.deleteTrigger(t));
  startProblems();
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
  // v31: only Roger's own accounts get the C2 coach (Roger, 17 Nov 2026: "I only want my stuff to be corrected straight away"); students
  // always get the usual transcript and kind notes, corrected on Wednesday, whatever their page sends.
  const ME = [TEACHER, "roger.beltran@ietramuntana.cat"].indexOf(who.email) >= 0;
  const g = meta.coach === "c2" && ME ? coachC2(data, mime, meta) : transcribe(data, mime, meta);
  return {ok: true, id: file.getId(), secs: Number(m.secs) || null, tr: g.tr, notes: g.notes, eur: g.eur || null, fixes: g.fixes || null, next: g.next || null};
}

// v30: a recording for the dashboard's in-page player (action "audio_get", see 19 above). Only files inside AUDIO_FOLDER (directly or
// in a group folder), so the teacher's sign-in cannot be used to read anything else from this school account's Drive.
function audioGet(m) {
  const id = String(m.fileId || "");
  let f;
  try { f = DriveApp.getFileById(id); } catch (x) { return {ok: false, error: "the recording could not be opened"}; }
  let inside = false;
  for (const ps = f.getParents(); ps.hasNext() && !inside;) {
    const p = ps.next();
    if (p.getId() === AUDIO_FOLDER) inside = true;
    else for (const qs = p.getParents(); qs.hasNext();) if (qs.next().getId() === AUDIO_FOLDER) inside = true;
  }
  if (!inside) return {ok: false, error: "that file is not a speaking recording"};
  if (f.getSize() > 9e6) return {ok: false, error: "the recording is too long to play here"};
  const b = f.getBlob();
  return {ok: true, mime: b.getContentType() || "audio/webm", name: f.getName(), data: Utilities.base64Encode(b.getBytes())};
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
      const eur = addUsage(GEMINI_MODEL, "audio", j);
      const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
      const o = JSON.parse(t), s = v => String(v || "").trim();
      const notes = [["Task", o.task], ["Pronunciation", o.pronunciation], ["Well done", o.well_done], ["Next time", o.next_time]]
        .filter(x => s(x[1])).map(x => x[0] + ": " + s(x[1])).join("\n");
      return {tr: s(o.transcript).slice(0, 6000), notes: notes.slice(0, 3000), eur};
    } catch (x) {}
  }
  return none;
}

// v31: the C2 coach for Towards Nativeness (Roger's own course, Roger is the student). Grammar and idiom only, never pronunciation or
// hesitations; every slip with the native version; then a NEW task (3 questions on a related topic) that can only be answered naturally
// by reusing the corrected forms. {tr, notes, fixes: [{said, natural, why}], next: {questions: [], use: []}, eur}; empty without a key.
function coachC2(data, mime, meta) {
  const none = {tr: "", notes: "", fixes: null, next: null};
  if (!GEMINI_KEY || GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE") return none;
  meta = meta || {};
  const ask = [
    "You are an English coach. The speaker is Roger, a Catalan-speaking English teacher with C1 English who wants to sound like a native speaker (C2). This is a recording of him answering speaking questions.",
    "The questions he was asked: \"" + String(meta.task || meta.title || "").slice(0, 1500) + "\". A computer voice may read the questions in the recording: leave it out.",
    "Correct ONLY grammar and idiom: every place where a native speaker would say it differently (Catalan or Spanish calques, prepositions, word order, questions, articles, countable/uncountable nouns, verb patterns like want someone to, tenses, collocations, unnatural phrasing). Ignore pronunciation, accent, hesitations, false starts, fillers and self-corrections. Do not correct what is already natural.",
    "Answer in JSON with these keys:",
    "transcript: exactly what he says, word for word, keeping his mistakes;",
    "fixes: an array (at most 12, the most important first) of {said: his exact words (only the part that changes, with a few words around it), natural: how a native speaker would say that part, why: the rule in at most 12 words};",
    "well_done: one natural, native-like phrase he used (quote it);",
    "next_questions: an array of 3 NEW speaking questions on a related but different topic, each written so that answering it naturally needs the corrected forms from fixes (if there are no fixes, use more advanced idiomatic language);",
    "use: an array of 3 to 6 short corrected chunks from fixes that he must use when answering next_questions."
  ].join("\n");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_KEY;
  for (const mt of [mime, mime === "audio/webm" ? "video/webm" : null].filter(Boolean)) {
    try {
      const r = UrlFetchApp.fetch(url, {method: "post", contentType: "application/json", muteHttpExceptions: true,
        payload: JSON.stringify({contents: [{parts: [{inline_data: {mime_type: mt, data}}, {text: ask}]}],
          generationConfig: {temperature: 0.2, responseMimeType: "application/json"}})});
      if (r.getResponseCode() !== 200) continue;
      const j = JSON.parse(r.getContentText());
      const eur = addUsage(GEMINI_MODEL, "audio", j);
      const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
      const o = JSON.parse(t), s = v => String(v || "").trim();
      const fixes = (Array.isArray(o.fixes) ? o.fixes : []).slice(0, 12).map(f => ({said: s(f.said).slice(0, 300), natural: s(f.natural).slice(0, 300), why: s(f.why).slice(0, 200)})).filter(f => f.said && f.natural);
      const next = {questions: (Array.isArray(o.next_questions) ? o.next_questions : []).map(s).filter(Boolean).slice(0, 3).map(q => q.slice(0, 400)),
        use: (Array.isArray(o.use) ? o.use : []).map(s).filter(Boolean).slice(0, 6).map(u => u.slice(0, 120))};
      const notes = ["Corrections:"].concat(fixes.map(f => "- " + f.said + " → " + f.natural + (f.why ? " (" + f.why + ")" : "")))
        .concat(s(o.well_done) ? ["Well done: " + s(o.well_done)] : []).join("\n");
      return {tr: s(o.transcript).slice(0, 6000), notes: notes.slice(0, 3000), fixes, next: next.questions.length ? next : null, eur};
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

// Run this once from the editor after pasting the Gemini key (v9): it asks Gemini one tiny question and logs the answer, or Google's error.
function testGemini() {
  if (!GEMINI_KEY || GEMINI_KEY === "PASTE-THE-GEMINI-KEY-HERE") { Logger.log("No Gemini key yet"); return; }
  const r = UrlFetchApp.fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + GEMINI_KEY,
    {method: "post", contentType: "application/json", muteHttpExceptions: true,
     payload: JSON.stringify({contents: [{parts: [{text: "Say hello to an English teacher in five words."}]}]})});
  if (r.getResponseCode() !== 200) { Logger.log("Gemini said no ❌ (" + r.getResponseCode() + "): " + r.getContentText().slice(0, 400)); return; }
  const j = JSON.parse(r.getContentText());
  addUsage(GEMINI_MODEL, "audio", j);
  Logger.log("Gemini works ✅ It says: " + ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join(""));
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
  CacheService.getScriptCache().put("up:" + token, JSON.stringify({url, size, email: who.email, name: who.name || "",   // v25: meta for the automatic draft
    meta: {activity: String(meta.activity || "").slice(0, 80), uid: String(meta.uid || "").slice(0, 64), level: String(meta.level || "").slice(0, 20), group: String(meta.group || "").slice(0, 20)}}), 21600);
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
    const up = upOf(token);
    CacheService.getScriptCache().remove("up:" + token);
    const f = JSON.parse(r.getContentText() || "{}");
    try { fpAutoQueue(up, f.id); } catch (x) { console.warn("fpAutoQueue " + x); }   // v25: Gemini drafts it by itself
    try { videoMail(up, f); } catch (x) { console.warn("videoMail " + x); }   // v26: an email to the teacher for every upload
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
  // Roger, 9 Nov 2026: two 2 ESO A final products were handed in as a PDF and as an audio file, and one student sent her slides (PDF) and her
  // voice (mp4) separately: Gemini gets up to 3 files of one student together (fileIds), video, audio or PDF, and the prompt says what it got
  const ids = [String(m.fileId || "")].concat([].concat(m.fileIds || []).map(String)).filter((x, k, a) => x && a.indexOf(x) === k).slice(0, 3);
  if (!ids.length) return {ok: false, error: "no file"};
  const got = [], dels = [], delAll = () => dels.forEach(f => f());
  for (const id of ids) {
    const r = fpSend(id, t0);
    if (!r.ok) { delAll(); return r; }
    got.push(r); dels.push(r.del);
  }
  const kinds = got.map(r => r.kind);
  ask.media = kinds.includes("video") ? (kinds.includes("pdf") ? "video+pdf" : "video") : kinds.includes("audio") ? (kinds.includes("pdf") ? "audio+pdf" : "audio") : "pdf";
  return fpAsk(m, ask, rows, got.map(r => r.fd), delAll);
}
// one Drive file (video, audio or PDF) sent to the Gemini Files API: {ok, fd: file_data, kind, del} or {ok: false, error}
function fpSend(id, t0) {
  const G = "https://generativelanguage.googleapis.com";
  let file;
  try { file = DriveApp.getFileById(id); } catch (x) { return {ok: false, error: "the school account cannot open that file"}; }
  const size = file.getSize(), mime = file.getMimeType();
  if (!/^(video|audio)\//.test(mime) && mime !== "application/pdf") return {ok: false, error: "that file is not a video, an audio or a PDF (" + mime + ")"};
  const kind = /^audio\//.test(mime) ? "audio" : mime === "application/pdf" ? "pdf" : "video";
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
  return {ok: true, kind, fd: {mime_type: gfile.mimeType || mime, file_uri: gfile.uri}, del};
}
// 3. one question with the rubric about the video (fd = Gemini's file_data); del() removes the uploaded copy from Gemini afterwards
function fpAsk(m, ask, rows, fd, del) {
  const G = "https://generativelanguage.googleapis.com";
  try {
    const r = UrlFetchApp.fetch(G + "/v1beta/models/" + FP_MODEL + ":generateContent?key=" + GEMINI_KEY, {method: "post", contentType: "application/json", muteHttpExceptions: true,
      payload: JSON.stringify({contents: [{parts: [].concat(fd).map(f => ({file_data: f})).concat([{text: fpPrompt(ask, rows, m.prev, m.change)}])}],
        generationConfig: {temperature: 1.0, mediaResolution: "MEDIA_RESOLUTION_HIGH", responseMimeType: "application/json"}})});
    if (r.getResponseCode() !== 200) return {ok: false, error: "Gemini did not answer (HTTP " + r.getResponseCode() + ")" + ([].concat(fd)[0].mime_type ? "" : ": the YouTube video may be private")};
    const j = JSON.parse(r.getContentText());
    const eur = addUsage(FP_MODEL, "video", j);
    const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
    const o = JSON.parse(t), str = v => String(v || "").trim(), lv = v => v === null || v === undefined || v === "" ? null : Math.max(0, Math.min(4, Math.round(Number(v)))) ;
    const verdict = ["speaks", "partly", "reads"].includes(o.reading && o.reading.verdict) ? o.reading.verdict : "partly";
    return {ok: true, model: FP_MODEL, eur, draft: {reading: {verdict, note: str(o.reading && o.reading.note).slice(0, 600)},
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
// v24 (Roger, 14 Nov 2026: "4/4 is 10/10"): level 4 (Very good) is always 10
const FP_BAND = [[0, 0], [1.5, 3.5], [4, 6], [6.5, 8.5], [10, 10]];
function fpRowMark(level, mark) {
  if (level === null) return null;
  const b = FP_BAND[level], n = Math.round(Number(mark) * 2) / 2;
  return isNaN(n) ? b[1] : Math.max(b[0], Math.min(b[1], n));
}
function fpPrompt(ask, rows, prev, change) {
  // the dashboard sends "Surname1 Surname2, First" (v18: Gemini called Hajra Zaman "Zaman"): turn it into "First Surname1 Surname2"
  const nm = String(ask.student || "").trim(), cm = nm.indexOf(",");
  if (cm > 0) ask = Object.assign({}, ask, {student: (nm.slice(cm + 1).trim() + " " + nm.slice(0, cm).trim()).trim()});
  const marks = !!ask.marks, first = String(ask.student || "").trim().split(/\s+/)[0] || "the student";
  const lines = [
    "You are helping Roger, an English teacher at a secondary school in Catalonia, mark a final product video by a student aged 12-16.",
    "Course: " + String(ask.course || "ESO").slice(0, 40) + ". Every student is marked on the SAME rubric, at about " + String(ask.level || "A2+").slice(0, 20) + " level.",
    "The task: " + String(ask.task || "a short video presentation in English with slides").slice(0, 1500),
    ask.group ? "It is a GROUP video. The student being marked is " + String(ask.student || "").slice(0, 60) + ". Judge the group rows on the whole video and the individual rows on that student's part; if you cannot tell which person they are, say so in the reading note and judge the group." : "The student is " + String(ask.student || "the student").slice(0, 60) + " (only so you know who it is: never write their name, see below).",
    ask.media === "audio" ? "This hand-in is an AUDIO recording only (no picture, no slides). Listen to the whole recording. Rows about slides, pictures or anything visual get level null; say in the reading note that it is audio only and judge reading from how it sounds."
      : ask.media === "pdf" ? "This hand-in is a PDF only: slides or a document with NO recording of the student speaking. The final product is a spoken video presentation, so this is a fail (see NO VIDEO = 0 below): every row level 0, reading verdict \"reads\", its note says \"No recording: slides only\". Do not list any sounds."
      : ask.media === "video+pdf" || ask.media === "audio+pdf" ? "This hand-in has two parts: the student's slides as a PDF and the student's " + (ask.media === "video+pdf" ? "video" : "voice recording (audio only)") + ". Look at the whole PDF and listen to the whole recording, and judge them together as one presentation."
      : "Watch and listen to the whole video.",
    "",
    "HOW ROGER WANTS IT MARKED",
    "- Be positive, friendly and encouraging, AND honest. Give the level the video really shows: never a higher one the student has not earned, and do not be harsh either. If they would fail only because you were very strict, you are being too strict.",
    "- Most students this age read part of their presentation. That is expected. Say how much they read in the reading check, let it count only in the row about speaking without reading (Speaking), and do not lower other rows because of it. If they read, the feedback always gives a kind, practical tip to try not to read next time (e.g. use the slides only as prompts, rehearse a few times, look at the camera).",
    "- Judge the language at the course level: small slips are normal. Quote the student's real words in quotation marks, with the correct form, e.g. \"he also have breakfast\" → \"he also has breakfast\". Praise with real examples too (verbs, expressions, connectors they used).",
    "- A row that cannot be judged from the video (for example a written hand-in, notes, sources or process steps) gets level null.",
    // v27 (Roger, 14 Nov 2026: "this should be a video and therefore the student needs to fail" … "if there's no video the mark is a 0")
    "- NO VIDEO = 0: the final product is a presentation the student SPEAKS in English. If you cannot hear the student speaking (slides or a PDF only, a silent video, only music, a computer voice, or someone else talking), it is a fail: give EVERY row level 0" + (marks ? " and mark 0" : "") + " (never null), whatever the slides show, and say so in each row's why. The reading note starts \"No recording:\" and says what you got. The feedback thanks them kindly, says you only received the slides (or what you got) and asks them to record themselves presenting and hand in the video; no praise of the slides, no 'next time' tips.",
    // v21 (Roger, 14 Nov 2026: "Tell Gemini not to use names or surnames when giving feedback")
    "- NO NAMES: never write anyone's name or surname anywhere in your answer, not the student's and not a classmate's or the person they interviewed. Talk to the student as \"you\" and say \"your classmate\" or \"the person you interviewed\"; in the notes for Roger say \"the student\". When you quote the student's real words, replace any name with \"…\".",
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
      (marks ? ", mark: the row's mark out of 10 in steps of 0.5, inside its level: level 4 = always 10, level 3 = 6.5 to 8.5, level 2 = 4 to 6, level 1 = 1.5 to 3.5, level 0 = 0 (use the top of the level when the student is close to the next level)" : "") +
      ", why: one or two sentences for Roger with what you saw or heard (times help), good: 'What went well', one or two short specific sentences with real examples from the video, improve: 'To keep in mind', one short specific sentence with the real words and the correct form (empty if there is nothing to improve)};",
    "feedback: Roger's comment to the student, 3 or 4 sentences in simple English, written as their teacher to them (you): start warmly with no name (e.g. 'Great work!'), say specifically what was good, then give one or two concrete things for next time (the reading tip if they read). Never mention AI, Gemini, a rubric, levels or marks;",
    "well_done: one specific thing they did well; next_time: one small, concrete tip; seconds: the length of the video in seconds;",
    "sounds: for Roger only, NOT for the student (he collects them from the whole class to make a listen-and-repeat video): a list of up to 12 English words the student mispronounced in a way that matters, typical of Catalan and Spanish speakers, e.g. 'walk' with the L sounded, 'vegetables' with 4 syllables, 'clothes' as 2 syllables, a silent -ed sounded ('watched' as 'watch-ed'), 'v' and 'b' the same. Each item: {word: the word as written, heard: how the student said it in IPA, e.g. '/wɔːlk/', tip: the correct British pronunciation in IPA and a very short note, e.g. '/wɔːk/ (the L is silent)'}. Only words you clearly heard; an empty list if there are none. Do not mention these in the feedback."
  );
  // v23 (Roger, 14 Nov 2026: "I want gemini see my changes and learn from them", final product videos only): Gemini keeps nothing between
  // two videos, so the dashboard sends Roger's latest corrections of earlier drafts (ask.lessons: up to 6 short texts, no names) and they go here
  const les = [].concat(ask.lessons || []).map(x => String(x || "").replace(/\s+/g, " ").trim().slice(0, 700)).filter(Boolean).slice(0, 6);
  if (les.length) {
    let room = 3500;
    lines.push("", "HOW ROGER CORRECTED YOUR RECENT DRAFTS (other students' videos). Learn his standard from them: where he moved a level or a mark up or down, mark the same kind of performance the same way; where he rewrote your comment, write like him. Do not copy anything from these examples into this answer: judge THIS video only.");
    les.forEach((x, i) => { if (x.length <= room) { lines.push("Correction " + (i + 1) + ": " + x); room -= x.length; } });
  }
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
  "gemini-4-argon": {text: 2.00, audio: 2.00, out: 10.00},   // introductory price until 30 Nov 2026; from 1 Dec: text/audio 4.00, out 20.00
  "gemini-2.5-flash": {text: 0.30, audio: 1.00, out: 2.50}, "gemini-2.5-pro": {text: 1.25, audio: 1.25, out: 10.00}};
const EUR_PER_USD = 0.87;
function addUsage(model, kind, j) {
  try {
    const u = j.usageMetadata || {}, p = PRICES[model] || PRICES["gemini-pro-latest"];
    const det = [].concat(u.promptTokensDetails || []), audio = det.filter(d => d.modality === "AUDIO").reduce((a, d) => a + (d.tokenCount || 0), 0);
    const input = (u.promptTokenCount || 0) - audio, out = (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0);
    const eur = (input * p.text + audio * p.audio + out * p.out) / 1e6 * EUR_PER_USD;
    const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) return eur;
    try {
      const P = PropertiesService.getScriptProperties(), k = "gemini:" + Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM");
      const c = JSON.parse(P.getProperty(k) || "{}");
      c.eur = (c.eur || 0) + eur; c.calls = (c.calls || 0) + 1; c[kind] = (c[kind] || 0) + 1;
      P.setProperty(k, JSON.stringify(c));
    } finally { lock.releaseLock(); }
    return Math.round(eur * 1e5) / 1e5;   // v22: this call's cost, for the row in the dashboard
  } catch (x) { return null; }
}
function geminiUsage() {
  const all = PropertiesService.getScriptProperties().getProperties();
  const months = Object.keys(all).filter(k => /^gemini:\d{4}-\d{2}$/.test(k)).sort().reverse().slice(0, 12)
    .map(k => { const c = JSON.parse(all[k]); return {month: k.slice(7), eur: Math.round((c.eur || 0) * 100) / 100, calls: c.calls || 0, audio: c.audio || 0, video: c.video || 0}; });
  return {ok: true, months};
}

// ---- 9. Final products handed in on Google Classroom (see the top): read-only, nothing is changed in Classroom
// 📁 a Drive folder of final products the teacher collected himself (Roger, 9 Nov 2026: the 2 ESO A videos that were not on Classroom, each
// file named after its student): the files the school account can open in it, for the dashboard to match to the students by name
// ▶ a Classroom video the teacher's Gmail can play (Roger, 9 Nov 2026: "I can't see the videos"): the students' files are shared only with
// this school account, and the dashboard runs on his Gmail, so Drive's player said "You need access". A copy goes into Final product videos ›
// Classroom copies (his own folder, so his Gmail can open it; one copy per file, found again by the original id in its name). A file his Gmail
// already owns is played as it is. He deletes these with the rest once a year.
function fpCopy(m) {
  const id = String(m.fileId || "");
  let f;
  try { f = DriveApp.getFileById(id); } catch (x) { return {ok: false, error: "the school account cannot open that file"}; }
  try { const o = f.getOwner(); if (o && /@gmail\.com$/i.test(o.getEmail())) return {ok: true, id}; } catch (x) {}
  let root, dir;
  try { root = DriveApp.getFolderById(VIDEO_FOLDER); } catch (x) { return {ok: false, error: "no access to the videos folder"}; }
  const it = root.getFoldersByName("Classroom copies");
  dir = it.hasNext() ? it.next() : root.createFolder("Classroom copies");
  for (const ps = f.getParents(); ps.hasNext();) { const pid = ps.next().getId(); if (pid === dir.getId() || pid === VIDEO_FOLDER) return {ok: true, id}; }   // already in his folder
  const tag = "[" + id + "]", old = dir.searchFiles("title contains '" + tag.replace(/'/g, "") + "' and trashed = false");
  if (old.hasNext()) return {ok: true, id: old.next().getId()};
  const c = f.makeCopy(f.getName().replace(/(\.[a-z0-9]{2,4})?$/i, " " + tag + "$1"), dir);
  return {ok: true, id: c.getId()};
}
// 🔄 a Classroom hand-in Gemini cannot read as it is (Roger, 9 Nov 2026: "aren't you able to download the videos one by one?" on the 2 ESO B
// report: Google Vids videos, slides, documents): a Google Vids video becomes an mp4 and Google Slides or a Google Doc becomes a PDF, saved in
// Final product videos › Classroom copies as "Student name - title" (found again by the original id in the name, so it is made once). The
// dashboard then gives that file to Gemini. A Vids video too big to export this way (over ~50 MB) is reported, to download by hand.
function fpConvert(m) {
  const id = String(m.fileId || ""), who = String(m.student || "").replace(/[\\/:*?"<>|]/g, " ").slice(0, 60);
  let f;
  try { f = DriveApp.getFileById(id); } catch (x) { return {ok: false, error: "the school account cannot open that file"}; }
  const mime = f.getMimeType();
  let root, dir;
  try { root = DriveApp.getFolderById(VIDEO_FOLDER); } catch (x) { return {ok: false, error: "no access to the videos folder"}; }
  const it = root.getFoldersByName("Classroom copies");
  dir = it.hasNext() ? it.next() : root.createFolder("Classroom copies");
  const tag = "[" + id + "]", old = dir.searchFiles("title contains '" + tag.replace(/'/g, "") + "' and trashed = false");
  if (old.hasNext()) { const o = old.next(); return {ok: true, id: o.getId(), mime: o.getMimeType()}; }
  const name = (who ? who + " - " : "") + f.getName().slice(0, 80) + " " + tag;
  try {
    if (/vnd\.google-apps\.(presentation|document|spreadsheet|drawing)$/.test(mime)) {
      const c = dir.createFile(f.getAs("application/pdf").setName(name + ".pdf"));
      return {ok: true, id: c.getId(), mime: "application/pdf"};
    }
    if (/vnd\.google-apps\.vid/.test(mime)) {
      const tok = ScriptApp.getOAuthToken(), meta = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + id + "?fields=exportLinks&supportsAllDrives=true",
        {headers: {Authorization: "Bearer " + tok}, muteHttpExceptions: true});
      const links = (JSON.parse(meta.getContentText() || "{}").exportLinks) || {}, url = links["video/mp4"];
      if (!url) return {ok: false, error: "Google Vids does not offer an mp4 of this video: open it and download it as mp4"};
      const r = UrlFetchApp.fetch(url, {headers: {Authorization: "Bearer " + tok}, muteHttpExceptions: true, followRedirects: true});
      if (r.getResponseCode() !== 200) return {ok: false, error: "Google Vids did not give the mp4 (HTTP " + r.getResponseCode() + "): open it and download it as mp4"};
      const c = dir.createFile(r.getBlob().setName(name + ".mp4").setContentType("video/mp4"));
      return {ok: true, id: c.getId(), mime: "video/mp4"};
    }
  } catch (x) { return {ok: false, error: "it could not be converted (" + String(x.message || x).slice(0, 120) + ")"}; }
  return {ok: false, error: "nothing to convert (" + mime + ")"};
}
// ---- v28: the video linked inside the slides (Roger, 14 Nov 2026: some students put the link to their video on a slide and handed in
// only the slides). The links come from the Google Slides / Docs file itself (exported as pptx / html with the Drive scope this script
// already has, so no new permission), visible URLs and hidden links alike. The first one that this account can open and that is a
// video wins: Google Vids → an mp4 in "Classroom copies" (as fp_convert), a Drive video or audio file as it is, or a YouTube link.
function fpSlidesVideo(m) {
  let id = String(m.fileId || ""), f;
  try { f = DriveApp.getFileById(id); } catch (x) { return {ok: false, error: "the school account cannot open that file"}; }
  // the PDF copy made by fp_convert keeps the original's id in its name: "… [id].pdf"
  if (f.getMimeType() === "application/pdf") { const t = (f.getName().match(/\[([\w-]{25,})\]/) || [])[1]; if (t) { try { f = DriveApp.getFileById(t); id = t; } catch (x) {} } }
  const mime = f.getMimeType(), tok = ScriptApp.getOAuthToken(), H = {headers: {Authorization: "Bearer " + tok}, muteHttpExceptions: true};
  const exp = /presentation$/.test(mime) ? "application/vnd.openxmlformats-officedocument.presentationml.presentation" : /document$/.test(mime) ? "text/html" : "";
  if (!exp) return {ok: false, links: [], error: "only Google Slides or Docs can be searched for a video link (" + mime + ")"};
  const r = UrlFetchApp.fetch("https://www.googleapis.com/drive/v3/files/" + id + "/export?mimeType=" + encodeURIComponent(exp), H);
  if (r.getResponseCode() !== 200) return {ok: false, links: [], error: "the slides could not be read (HTTP " + r.getResponseCode() + ")"};
  let texts = [];
  if (/presentation/.test(exp)) Utilities.unzip(r.getBlob().setContentType("application/zip")).forEach(b => { if (/^ppt\/slides\//.test(b.getName())) texts.push(b.getDataAsString()); });
  else texts.push(r.getContentText());
  const raw = [];
  texts.forEach(t => { (t.match(/https?:\/\/[^\s"'<>]+/g) || []).forEach(u => raw.push(u.replace(/&amp;/g, "&"))); });
  const clean = u => { const q = (u.match(/[?&]q=([^&]+)/) || [])[1]; if (/google\.com\/url/.test(u) && q) u = decodeURIComponent(q); return u; };
  const links = [], seen = {};
  raw.map(clean).forEach(u => {
    const v = (u.match(/docs\.google\.com\/videos\/(?:u\/\d+\/)?d\/([\w-]{25,})/) || [])[1], d = (u.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]{25,})/) || [])[1],
      y = /(?:youtube\.com\/(?:watch|shorts|live)|youtu\.be\/)/.test(u) ? u : "";
    const k = v || d || y; if (!k || seen[k]) return; seen[k] = 1; links.push({url: u, id: v || d || "", youtube: y});
  });
  if (!links.length) return {ok: false, links: [], error: "no link to a video in the slides"};
  const errs = [];
  for (const L of links.slice(0, 5)) {
    if (L.youtube) return {ok: true, links, video: {youtube: L.youtube, name: "YouTube video linked in the slides"}};
    let g; try { g = DriveApp.getFileById(L.id); } catch (x) { errs.push("a linked video the school account cannot open (ask the student to share it)"); continue; }
    const gm = g.getMimeType();
    if (/^(video|audio)\//.test(gm)) return {ok: true, links, video: {id: L.id, name: g.getName()}};
    if (/vnd\.google-apps\.vid/.test(gm)) { const c = fpConvert({fileId: L.id, student: m.student}); if (c.ok) return {ok: true, links, video: {id: c.id, name: g.getName() + " (converted)"}}; errs.push(c.error); continue; }
    errs.push("a linked file that is not a video (" + gm + ")");
  }
  return {ok: false, links, error: errs[0] || "no video the school account can open"};
}
function fpFolder(m) {
  let f;
  try { f = DriveApp.getFolderById(String(m.folderId || "")); } catch (x) { return {ok: false, error: "the school account cannot open that folder: share it with " + Session.getActiveUser().getEmail()}; }
  const files = [], it = f.getFiles();
  while (it.hasNext() && files.length < 80) { const x = it.next(); files.push({id: x.getId(), name: x.getName(), mime: x.getMimeType(), size: x.getSize()}); }
  return {ok: true, folder: f.getName(), files};
}
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

// Run once from the editor (Classroom API service added): Google asks for the Classroom permission (tick every box; requireAllScopes asks for all of them at once, as Google may grant
// them one by one) and the log lists the 2ESOA assignments. Without that permission fp_classroom answers "No tienes permiso para llamar a classroom.courses.list" (Roger, 9 Nov 2026).
function testClassroom() {
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  const c = (Classroom.Courses.list({teacherId: "me", pageSize: 20}).courses || []).find(x => /2ESOA/.test(x.name.replace(/\s/g, "")));
  Logger.log(c.name + ": " + (Classroom.Courses.CourseWork.list(c.id, {pageSize: 20}).courseWork || []).map(x => x.title).join(" · "));
  Logger.log("Students: " + (Classroom.Courses.Students.list(c.id, {pageSize: 50}).students || []).length);
}

// 9. READ ONLY look at the inbox for Claude's "which emails need my reply" (v19). Plain text only, each message cut to 6000 characters,
// attachments listed by name. getPlainBody() does not mark anything as read.
function readInbox(m) {
  const days = Math.min(30, Math.max(1, Number(m.days) || 7)), max = Math.min(50, Math.max(1, Number(m.max) || 30));
  const threads = GmailApp.search("in:inbox newer_than:" + days + "d", 0, max);
  return {ok: true, threads: threads.map(t => ({id: t.getId(), subject: t.getFirstMessageSubject(), unread: t.isUnread(),
    starred: t.hasStarredMessages(), messages: t.getMessages().slice(-6).map(x => ({from: x.getFrom(), to: x.getTo(), cc: x.getCc(),
      date: x.getDate().toISOString(), body: String(x.getPlainBody() || "").slice(0, 6000),
      files: x.getAttachments().map(a => a.getName())}))}))};
}

// ---- v25 (Roger, 14 Nov 2026: "next final product, I will ask students to load it on the web" … "students don't have to see that I use
// Gemini"): Gemini drafts every final product video uploaded on the site BY ITSELF, right after the upload, so the draft is waiting in the
// dashboard (🎬 Final product table) when Roger opens it. Nothing changes for the student: the page only says the video reached the teacher.
//   - The dashboard keeps here what Gemini needs per final product (the rubric, the task, Roger's latest corrections, no names):
//     {idToken (teacher), action: "fp_auto_setup", tpls: {activityId: {course, level, task, marks, group, rows, lessons}}, on: {activityId: true|false}}
//     → {ok, on: {activityId: bool}}. A final product is On the first time it arrives; "on" switches it off or on (🤖 in the dashboard).
//   - The last piece of an upload with meta.activity puts the video in a queue (one per student and final product: a newer version
//     replaces the older one), and up to FPA_PAR videos are watched at the same time by one-off triggers (fpAutoRun, one video each, as
//     fp_watch does). A failed watch is tried once more 4 minutes later; at most FPA_DAY automatic watches a day (cost guard).
//   - Each answer is kept as a small JSON file in "Automatic drafts" inside VIDEO_FOLDER until the dashboard takes it:
//     {idToken (teacher), action: "fp_auto_list", act?} → {ok, on, queue: [{act, uid, email, fileId, at, state: "waiting" | "queued" |
//     "watching"}], done: [{rid, act, uid, email, fileId, at, ok, draft, model, eur, error}]}; {action: "fp_auto_ack", rids} marks them
//     taken (the file name starts with ✓; nothing is deleted).
const FPA_PAR = 3, FPA_DAY = 120;
function fpaGet(k) { const P = PropertiesService.getScriptProperties(), n = Number(P.getProperty(k + "#n") || 0); if (!n) return null;
  let s = ""; for (let i = 0; i < n; i++) s += P.getProperty(k + "#" + i) || ""; try { return JSON.parse(s); } catch (x) { return null; } }
function fpaPut(k, o) { const P = PropertiesService.getScriptProperties(), s = JSON.stringify(o), old = Number(P.getProperty(k + "#n") || 0), parts = {};
  let n = 0; for (let i = 0; i < s.length; i += 8000) parts[k + "#" + (n++)] = s.slice(i, i + 8000);
  parts[k + "#n"] = String(n); P.setProperties(parts); for (let i = n; i < old; i++) P.deleteProperty(k + "#" + i); }
function fpaOn() { return JSON.parse(PropertiesService.getScriptProperties().getProperty("fpa:on") || "{}"); }
function fpaSetup(m) {
  const P = PropertiesService.getScriptProperties(), on = fpaOn(), clean = v => String(v || "").slice(0, 200);
  Object.keys(m.tpls || {}).slice(0, 12).forEach(act => { const t = m.tpls[act] || {};
    if (!/^[\w-]+\/[\w-]+$/.test(act) || !Array.isArray(t.rows) || !t.rows.length) return;
    fpaPut("fpt:" + act, {course: clean(t.course), level: clean(t.level), task: String(t.task || "").slice(0, 1500), marks: !!t.marks, group: !!t.group,
      rows: t.rows.slice(0, 12), lessons: [].concat(t.lessons || []).slice(0, 6).map(x => String(x).slice(0, 700))});
    if (!(act in on)) on[act] = true; });
  Object.keys(m.on || {}).forEach(act => { if (/^[\w-]+\/[\w-]+$/.test(act)) on[act] = !!m.on[act]; });
  P.setProperty("fpa:on", JSON.stringify(on));
  fpAutoKick();
  return {ok: true, on};
}
// the last piece of an upload arrived: queue it for Gemini when the page said which final product it is
function fpAutoQueue(up, fileId) {
  const mt = up && up.meta || {};
  if (!fileId || !/^[\w-]+\/[\w-]+$/.test(mt.activity || "")) return;
  const P = PropertiesService.getScriptProperties(), key = "fpq:" + mt.activity + "|" + up.email;
  P.setProperty(key, JSON.stringify({act: mt.activity, email: up.email, name: String(up.name || "").slice(0, 80), uid: String(mt.uid || "").slice(0, 64),
    level: String(mt.level || "").slice(0, 20), group: String(mt.group || "").slice(0, 20), fileId, at: new Date().toISOString(), tries: 0, claimed: 0, after: 0}));
  fpAutoKick();
}
function fpaQueue() { const all = PropertiesService.getScriptProperties().getProperties(), q = [];
  Object.keys(all).forEach(k => { if (k.indexOf("fpq:") === 0) try { q.push(Object.assign(JSON.parse(all[k]), {key: k})); } catch (x) {} });
  return q.sort((a, b) => a.at < b.at ? -1 : 1); }
const fpaLive = x => x.claimed && Date.now() - x.claimed < 8 * 60e3;   // being watched now (a run that died frees it after 8 minutes)
// start enough one-off runs for the videos waiting, never more than FPA_PAR at a time
function fpAutoKick() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(10000)) return;
  try {
    const on = fpaOn(), q = fpaQueue(), now = Date.now();
    const ready = q.filter(x => on[x.act] && !fpaLive(x) && (x.after || 0) <= now && fpaGet("fpt:" + x.act)).length, live = q.filter(fpaLive).length;
    const pend = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "fpAutoRun").length;
    for (let i = 0; i < Math.min(ready - pend, FPA_PAR - live - pend); i++) ScriptApp.newTrigger("fpAutoRun").timeBased().after(15e3).create();
    if (!ready && !pend && q.some(x => on[x.act] && (x.after || 0) > now)) ScriptApp.newTrigger("fpAutoRun").timeBased().after(4.5 * 60e3).create();
  } catch (x) { console.warn("fpAutoKick " + x); } finally { lock.releaseLock(); }
}
// one run = one video: claim the oldest ready one, let Gemini watch it (fpWatch, as the dashboard's 🎬 does), keep the answer for the dashboard
function fpAutoRun(e) {
  try { ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "fpAutoRun" && (!e || !e.triggerUid || t.getUniqueId() === e.triggerUid)).forEach(t => ScriptApp.deleteTrigger(t)); } catch (x) {}
  const P = PropertiesService.getScriptProperties(), lock = LockService.getScriptLock();
  let it = null, tpl = null;
  if (!lock.tryLock(20000)) return;
  try {
    const on = fpaOn(), now = Date.now(), day = Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd"), c = JSON.parse(P.getProperty("fpa:day") || "{}");
    if (c.day === day && c.n >= FPA_DAY) return;
    for (const x of fpaQueue()) { if (!on[x.act] || fpaLive(x) || (x.after || 0) > now) continue; tpl = fpaGet("fpt:" + x.act); if (tpl) { it = x; break; } }
    if (!it) return;
    if ((it.tries || 0) >= 3) {   // three runs died on it (too long for one go): leave it to Roger's 🎬 in the dashboard
      fpaKeep({act: it.act, uid: it.uid, email: it.email, group: it.group, fileId: it.fileId, at: it.at, watched: new Date().toISOString(), ok: false, draft: null,
        model: "", eur: null, error: "the video is too long to watch by itself: press 🎬 to try again"});
      P.deleteProperty(it.key); it = null; return;
    }
    it.claimed = now; it.tries = (it.tries || 0) + 1;
    const key = it.key; delete it.key; P.setProperty(key, JSON.stringify(it)); it.key = key;
    P.setProperty("fpa:day", JSON.stringify({day, n: (c.day === day ? c.n : 0) + 1}));
  } finally { lock.releaseLock(); }
  let r;
  try { r = fpWatch({fileId: it.fileId, ask: Object.assign({}, tpl, {student: it.name || it.email.split("@")[0], route: it.level})}); }
  catch (x) { r = {ok: false, error: String(x && x.message || x).slice(0, 200)}; }
  const lock2 = LockService.getScriptLock(); lock2.tryLock(20000);
  try {
    const cur = JSON.parse(P.getProperty(it.key) || "null"), same = cur && cur.fileId === it.fileId;
    if (!r.ok && it.tries < 2 && same) { cur.claimed = 0; cur.after = Date.now() + 4 * 60e3; cur.tries = it.tries; P.setProperty(it.key, JSON.stringify(cur)); }
    else {
      fpaKeep({act: it.act, uid: it.uid, email: it.email, group: it.group, fileId: it.fileId, at: it.at, watched: new Date().toISOString(),
        ok: !!r.ok, draft: r.draft || null, model: r.model || "", eur: typeof r.eur === "number" ? r.eur : null, error: r.ok ? "" : String(r.error || "")});
      if (same) P.deleteProperty(it.key);   // a newer version uploaded meanwhile stays in the queue
    }
  } finally { try { lock2.releaseLock(); } catch (x) {} }
  fpAutoKick();
}
function fpaFolder() { const root = DriveApp.getFolderById(VIDEO_FOLDER), it = root.getFoldersByName("Automatic drafts"); return it.hasNext() ? it.next() : root.createFolder("Automatic drafts"); }
function fpaKeep(o) { const clean = v => String(v || "").replace(/[\\/:*?"<>|\n\r]/g, " ").slice(0, 60);
  fpaFolder().createFile(Utilities.newBlob(JSON.stringify(o), "application/json", Utilities.formatDate(new Date(), "Europe/Madrid", "yyyy-MM-dd HH.mm.ss") + " · " + clean(o.act) + " · " + clean(o.email) + ".json")); }
function fpaList(m) {
  const on = fpaOn(), act = String(m.act || ""), mine = x => !act || x.act === act, done = [];
  const queue = fpaQueue().filter(mine).map(x => ({act: x.act, uid: x.uid, email: x.email, fileId: x.fileId, at: x.at,
    state: !on[x.act] || !fpaGet("fpt:" + x.act) ? "waiting" : fpaLive(x) ? "watching" : "queued"}));
  const fs = fpaFolder().getFiles();
  while (fs.hasNext() && done.length < 80) { const f = fs.next(); if (/^✓/.test(f.getName())) continue;
    try { const o = JSON.parse(f.getBlob().getDataAsString()); if (mine(o)) done.push(Object.assign(o, {rid: f.getId()})); } catch (x) {} }
  return {ok: true, on, queue, done};
}
function fpaAck(m) {
  let n = 0;
  [].concat(m.rids || []).slice(0, 80).forEach(id => { try { const f = DriveApp.getFileById(String(id));
    if (f.getParents().hasNext() && f.getParents().next().getName() === "Automatic drafts" && !/^✓/.test(f.getName())) { f.setName("✓ " + f.getName()); n++; } } catch (x) {} });
  return {ok: true, n};
}
// Run this once from the editor after pasting v25 (Allow if Google asks): it lists the automatic queue and the drafts not taken yet.
function testAutoDrafts() { const r = fpaList({}); Logger.log("On: " + JSON.stringify(r.on) + " · queue " + r.queue.length + " · drafts waiting " + r.done.length + " · folder " + fpaFolder().getName()); }

// ---- v26 (Roger, 14 Nov 2026: "I want to receive a notification when students upload it"): one email to the teacher per finished upload,
// with the student's name, group, final product, time and links to the video in Drive and to the dashboard. Students never see it.
function videoMail(up, f) {
  if (!up) return;
  const m = up.meta || {}, who = up.name || String(up.email || "").split("@")[0], group = m.group || "?";
  const when = Utilities.formatDate(new Date(), "Europe/Madrid", "EEE d MMM, HH:mm");
  const mb = up.size ? Math.round(up.size / 1048576) + " MB" : "";
  MailApp.sendEmail({to: TEACHER, name: "English Lab",
    subject: "English Lab: 🎬 new final product video · " + who + " (" + group + ")",
    body: who + " (" + group + ", " + (up.email || "") + ") has just uploaded a final product video on the website.\n\n" +
      "Final product: " + (m.activity || "?") + "\nWhen: " + when + (mb ? "\nSize: " + mb : "") + "\nFile: " + (f.name || "") + "\n\n" +
      (f.id ? "Watch it in Drive: https://drive.google.com/file/d/" + f.id + "/view\n" : "") +
      "Dashboard (🎬 Final product, the draft is ready in a few minutes): https://rogerbeltranps-lab.github.io/English-lab/teacher.html\n"});
}

// Run this once from the editor after pasting v26 (Allow if Google asks): you get one sample email like the ones uploads will send.
function testVideoMail() {
  videoMail({name: "Test Student", email: "test@ietramuntana.cat", size: 52428800, meta: {group: "2ESOB", activity: "2eso/final-product"}},
    {id: "", name: "2026-11-14 19.40 · Test Student · Final product.mp4"});
}

// ---- v29: late emails wait until 7:30 (Roger, 14 Nov 2026: students should not see the time he sends them messages; "I want to have the
// option to tell you send it anyway and you always ask me": the dashboard asks him and sends at or now). Each held email is kept in
// Script properties as late:<time>_<id> (in pieces, like the automatic drafts) and one trigger, sendLate, sends the ones that are due.
const LATE_TZ = "Europe/Madrid", LATE_FROM = 21 * 60, LATE_TO = 7 * 60 + 30;
// the next 7:30 in Madrid when it is now between 21:00 and 7:30 there, otherwise 0
function lateNext(now) {
  const hm = Number(Utilities.formatDate(now, LATE_TZ, "H")) * 60 + Number(Utilities.formatDate(now, LATE_TZ, "m"));
  if (hm >= LATE_TO && hm < LATE_FROM) return 0;
  const base = new Date(now.getTime() + (hm >= LATE_FROM ? 12 : 6) * 3600e3);   // a moment on the morning in question (its date and UTC offset)
  return Date.parse(Utilities.formatDate(base, LATE_TZ, "yyyy-MM-dd") + "T07:30:00" + Utilities.formatDate(base, LATE_TZ, "XXX")) || 0;
}
// when this email should go: 0 = now. Only emails to students (a school address other than this account) are ever held.
function lateUntil(m, people) {
  if (m.now === true) return 0;
  const me = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
  if (!people.some(a => ALLOWED.test(a) && a.toLowerCase() !== me)) return 0;
  const at = Number(m.at) || 0, now = Date.now();
  if (at > now + 60e3) return Math.min(at, now + 3 * 864e5);   // the dashboard's 🌙 7:30 (never more than 3 days away)
  return lateNext(new Date(now));
}
function lateQueue(mail, at) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { fpaPut("late:" + at + "_" + Utilities.getUuid().slice(0, 8), {at, mail}); lateTrigger(60e3); } finally { lock.releaseLock(); }
}
function lateKeys() { return PropertiesService.getScriptProperties().getKeys().filter(k => /^late:[^#]+#n$/.test(k)).map(k => k.slice(0, -2)); }
function lateDel(k) { const P = PropertiesService.getScriptProperties(), n = Number(P.getProperty(k + "#n") || 0);
  for (let i = 0; i < n; i++) P.deleteProperty(k + "#" + i); P.deleteProperty(k + "#n"); }
// one sendLate trigger, at the first email's time (and at least wait from now)
function lateTrigger(wait) {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "sendLate").forEach(t => ScriptApp.deleteTrigger(t));
  const ks = lateKeys(); if (!ks.length) return;
  const first = Math.min.apply(null, ks.map(k => Number(k.slice(5).split("_")[0]) || 0));
  ScriptApp.newTrigger("sendLate").timeBased().at(new Date(Math.max(first, Date.now() + wait))).create();
}
function sendLate() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { ScriptApp.newTrigger("sendLate").timeBased().after(5 * 60e3).create(); return; }
  try {
    let short = false;
    lateKeys().forEach(k => {
      if (Number(k.slice(5).split("_")[0]) > Date.now() + 60e3) return;
      const o = fpaGet(k), mail = o && o.mail;
      if (mail) {
        const n = String(mail.to || "").split(",").length + (mail.bcc ? String(mail.bcc).split(",").length : 0);
        if (MailApp.getRemainingDailyQuota() < n) { short = true; return; }   // Google's daily limit: it stays and goes later
        try { MailApp.sendEmail(mail); } catch (x) { console.warn("sendLate " + k + ": " + x); }
      }
      lateDel(k);
    });
    lateTrigger(short ? 60 * 60e3 : 60e3);
  } finally { lock.releaseLock(); }
}
// Run from the editor to see what is waiting (nothing is sent).
function lateStatus() {
  const ks = lateKeys();
  Logger.log(ks.length ? ks.map(k => { const o = fpaGet(k) || {}, m = o.mail || {};
    return Utilities.formatDate(new Date(o.at || 0), LATE_TZ, "EEE d MMM HH:mm") + " · " + m.subject + " · " + (m.bcc ? String(m.bcc).split(",").length + " in Bcc" : m.to); }).join("\n")
    : "Nothing waiting");
  Logger.log("Now in Madrid: " + Utilities.formatDate(new Date(), LATE_TZ, "EEE d MMM HH:mm") + " · next 7:30 if late: " + (lateNext(new Date()) ? new Date(lateNext(new Date())).toISOString() : "not late now"));
}
