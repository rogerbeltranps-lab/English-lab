// 📄 Term 2 report (Roger, 28 Nov 2026: "I should have a 1st term, 2n term, 3rd term and final mark report option"; REQUIREMENTS § 3
// "Term report"): Roger chooses Term 2 on the group's 📄 Term reports page and presses 🔄 Rebuild the reports (the report is saved in
// termReportsN/t2_{email}, with Firestore's own rules); the student can't open it until Roger publishes it; after ✅ Publish the final version
// the student opens 📄 My Term 2 report and sees the saved comment, which proves the rules let them read their own report then.
import { school, NOW } from './world.mjs';
const H = 3600e3, DOC = 'termReportsN/t2_alex.sample@ietramuntana.cat';

export default [{
  name: '📄 Term 2 report: Roger rebuilds it, the student sees it only after ✅ Publish the final version',
  async run(t) {
    const { alex, roger } = await school(t);
    // before: no chip, and #report-t2 sends the student back to the board
    const s1 = await (await t.device(alex, { now: NOW })).open('today.html#report-t2');
    await s1.waitForTimeout(2500);
    t.ok(!/My Term 2 report/.test(await s1.innerText('body')), 'the board showed "My Term 2 report" before Roger published it');
    t.ok(!/report-t2/.test(s1.url()), 'the student stayed on the Term 2 report before Roger published it: ' + s1.url());

    // Roger: 4 ESO A › 📄 Term reports › Term 2 › 🔄 Rebuild the reports (its question is answered OK: lib.mjs)
    const q = await (await t.device(roger, { now: NOW + H })).open('teacher.html');
    await q.click('#tabs button[data-g="4ESOA"]');
    await q.locator('[data-do="place"][data-p="reports"]').first().click({ timeout: 20000 });
    await q.locator('[data-do="repterm"][data-v="t2"]').click({ timeout: 15000 });
    await q.locator('[data-do="reprb"]').click({ timeout: 15000 });
    const r = await t.until(() => t.read(DOC), (x) => x && x.at && Array.isArray(x.wk), 25000);
    t.ok(r && r.term === 't2' && typeof r.comment === 'string' && r.comment.length > 20, '🔄 Rebuild did not save a Term 2 report with a comment: ' + JSON.stringify(r).slice(0, 200));
    t.ok(r && !/\{(tw|nx|Nx|Anx|by)\}/.test(r.comment + r.commentCa), 'the saved comment kept a {placeholder}: ' + (r && r.comment));
    const old = await t.read('termReports/alex.sample@ietramuntana.cat');
    t.ok(!old || !old.t2, 'the Term 2 rebuild wrote into the Term 1 report document');

    // ✅ Publish the final version (Term 2)
    await q.locator('[data-do="repfin"][data-v="1"]').first().click({ timeout: 15000 });
    const tm = await t.until(() => t.read('teams/4ESOA'), (x) => x && x.repFinal && x.repFinal.t2, 15000);
    t.ok(tm && tm.repPub && tm.repPub.t2 && !(tm.repPub || {}).t1, 'publishing the Term 2 report must publish Term 2 only: ' + JSON.stringify(tm && { p: tm.repPub, f: tm.repFinal }));

    // after: the student, on another device, has the chip and reads the saved report
    const s2 = await (await t.device(alex, { now: NOW + 2 * H })).open('today.html#report-t2');
    const want = String(r && r.comment || '').replace(/<[^>]+>/g, '').slice(0, 40);
    await s2.waitForFunction((w) => document.body.innerText.includes(w), want, { timeout: 20000 }).catch(() => {});
    const body = await s2.innerText('body');
    t.ok(/Final version/.test(body) && /Term 2 report/.test(body), 'after ✅ Publish the student does not see the final version of the Term 2 report');
    t.ok(!!want && body.includes(want), 'the student does not see the saved comment (could they read their termReportsN document?): ' + want);
  },
}];
