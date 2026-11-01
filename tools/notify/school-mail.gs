// English Lab emails from the teacher's school account (Roger, 1 Nov 2026: students only receive mail from the school domain, and the
// school blocks app passwords). Paste this whole file in a new Apps Script project of roger.beltran@ietramuntana.cat and deploy it as a
// web app (Execute as: Me · Who has access: Anyone). The web app link goes into the GitHub secret SCHOOL_MAIL_URL; the GitHub Action
// "English Lab emails" (tools/notify/lib.mjs) sends each email to it. The link is long and random and only lives in that secret.
// Safety: it only sends to school addresses (@ietramuntana.cat) and the teacher's Gmail, one message per request, within Google's daily limit.
const TEACHER = "roger.beltranps@gmail.com";
const ALLOWED = /^[^@\s,]+@ietramuntana\.cat$/i;

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  let m;
  try { m = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: "bad request"}); }
  const to = [].concat(m.to || []).map(a => String(a).trim()).filter(a => ALLOWED.test(a) || a.toLowerCase() === TEACHER);
  if (!to.length || !m.subject || !m.body) return out({ok: false, error: "nothing to send"});
  if (MailApp.getRemainingDailyQuota() < to.length) return out({ok: false, error: "daily email limit reached"});
  MailApp.sendEmail({to: to.join(","), subject: String(m.subject).slice(0, 200), body: String(m.body).slice(0, 20000),
    name: String(m.name || "English Lab").slice(0, 80)});
  return out({ok: true});
}

// Run this once from the editor to check that sending works: you get a test email in your Gmail.
function testMe() {
  MailApp.sendEmail({to: TEACHER, subject: "English Lab: the school mail script works ✅", body: "Now deploy it as a web app and copy the link.", name: "English Lab"});
}
