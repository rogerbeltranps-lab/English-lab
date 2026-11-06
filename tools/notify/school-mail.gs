// English Lab emails from the teacher's school account (Roger, 1 Nov 2026: students only receive mail from the school domain, and the
// school blocks app passwords). Paste this whole file in the Apps Script project "English Lab emails" of roger.beltran@ietramuntana.cat
// and deploy it as a web app (Execute as: Me · Who has access: Anyone). To update it: paste, Save, then Deploy > Manage deployments >
// ✏️ > Version: New version > Deploy (the link stays the same).
// Two kinds of request:
//   1. the GitHub Action "English Lab emails" (tools/notify/lib.mjs): {key, to, subject, body, name}; key = the GitHub secret SCHOOL_MAIL_KEY.
//   2. the teacher dashboard (Roger, 6 Nov 2026: email students the homework and announcements he sends): {idToken, bcc, subject, body, name};
//      idToken = the teacher's own English Lab sign-in, checked with Google here, so only roger.beltranps@gmail.com signed in can send.
//      The students go in Bcc (they never see each other's addresses); the email goes "to" the school account itself.
// Safety: a request without the right KEY or the teacher's sign-in is refused (the link alone is not enough); it only sends to school
// addresses (@ietramuntana.cat) and the teacher's Gmail, at most 50 people per request, within Google's daily limit.
// KEY: a long random text, the same here and in SCHOOL_MAIL_KEY; never in the repo (this copy has a placeholder and refuses the Action).
const KEY = "PUT-THE-KEY-HERE";
const TEACHER = "roger.beltranps@gmail.com";
const ALLOWED = /^[^@\s,]+@ietramuntana\.cat$/i;
const FIREBASE_WEB_KEY = "AIzaSyCdO9ygUg8GzhfKsmqJKBg7-k_BDE3ZvKE";   // English Lab's public web key (shared/js/el-firebase.js), not a secret

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: "bad request"}); }
  const ok = a => ALLOWED.test(a) || a.toLowerCase() === TEACHER;
  const clean = l => [].concat(l || []).map(a => String(a).trim()).filter(ok);
  const keyOk = KEY.length >= 20 && KEY !== "PUT-THE-KEY-HERE" && m.key === KEY;
  if (!keyOk && !(m.idToken && isTeacher(m.idToken))) return out({ok: false, error: m.idToken ? "not the teacher" : "wrong key"});
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
