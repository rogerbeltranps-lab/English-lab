// 🔄 Rebuild the reports (Roger, 28 Nov 2026): on 4 ESO A's 📄 Term reports, Roger presses 🔄 Rebuild the reports. The report saved before
// (by tools/term-report/draft.mjs, its weeks as [monday, n] pairs) is kept in termReportsBak, the new one is saved (Firestore refused it
// at first: "Nested arrays are not supported"), and ↩ Earlier versions › ↩ Put these back brings the old one back ("I want to have the old
// reports saved in case there's a problem with the new ones").
import { school, NOW } from './world.mjs';
const H = 3600e3, EMAIL = 'alex.sample@ietramuntana.cat', REP = 'termReports/' + EMAIL, BAK = 'termReportsBak/' + EMAIL;
const OLD = 'OLD REPORT: saved by the drafts run.';

// an old report as the drafts run saved it (its weeks there were [monday, n] pairs, which the test database refuses, so here they are
// already {d, n}: tools/term-report/check.mjs checks that the old pairs are turned into this shape before they are kept)
const OLD_T1 = { term: 't1', lang: 'en', at: '2026-11-25T08:00:00.000Z', comment: OLD, commentCa: 'INFORME ANTIC.', pts: [{ pct: 80, line: 'Old line.' }],
  time: { due: 14, done: 12, inWeek: 75, lastMin: 10, profile: 'steady', exam: '2026-11-20', weeks: [{ d: '2026-10-26', n: 5 }, { d: '2026-11-02', n: 0 }, { d: '2026-11-09', n: 7 }] } };
const nested = (v, inArr) => Array.isArray(v) ? (inArr || v.some((x) => nested(x, true))) : v && typeof v === 'object' ? Object.values(v).some((x) => nested(x, false)) : false;

export default [{
  name: 'Term reports: 🔄 Rebuild saves the new reports, keeps the old one, and ↩ Earlier versions puts it back',
  async run(t) {
    const { roger } = await school(t);
    await t.seed({ [REP]: { t1: OLD_T1 } });
    const q = await (await t.device(roger, { now: NOW + H })).open('teacher.html');
    await q.click('#tabs button[data-g="4ESOA"]');
    await q.locator('[data-do="place"][data-p="reports"]').first().click({ timeout: 20000 });
    await q.locator('[data-do="reprb"]').click({ timeout: 20000 });   // its "Rebuild … ?" question is answered OK (lib.mjs)

    const nw = await t.until(() => t.read(REP), (x) => x && x.t1 && x.t1.comment !== OLD, 30000);
    t.ok(nw && nw.t1 && nw.t1.comment !== OLD, 'Roger pressed 🔄 Rebuild the reports but no new report was saved (Firestore refused it?) ' + (await q.innerText('#main').catch(() => '')).slice(0, 200));
    if (nw && nw.t1) {
      t.ok(nw.t1.comment && nw.t1.commentCa, 'the rebuilt report has no comment, or no Catalan comment for the butlletí');
      t.ok(!nested(nw.t1, false), 'the rebuilt report holds an array inside an array');
    }
    const bak = await t.read(BAK);
    const v = (bak && bak.v) || [];
    t.ok(v.length === 1 && v[0].comment === OLD && v[0].bak, 'the old report was not kept in termReportsBak before the rebuild: ' + JSON.stringify(v).slice(0, 200));
    t.ok(v[0] && v[0].time && v[0].time.weeks && v[0].time.weeks[0].d === '2026-10-26' && v[0].time.weeks[0].n === 5, 'the kept old report lost its weeks: ' + JSON.stringify(v[0] && v[0].time));

    // ↩ Earlier versions › ↩ Put these back
    await q.locator('[data-do="repbak"]').click({ timeout: 10000 });
    await q.locator('[data-do="repback"]').first().click({ timeout: 15000 });
    const back = await t.until(() => t.read(REP), (x) => x && x.t1 && x.t1.comment === OLD, 20000);
    t.ok(back && back.t1 && back.t1.comment === OLD, '↩ Put these back did not bring the old report back');
    const bak2 = await t.until(() => t.read(BAK), (x) => x && (x.v || []).length >= 2);
    t.ok(bak2 && bak2.v.length === 2 && bak2.v.some((x) => x.comment !== OLD), 'putting the old report back did not keep the rebuilt one too');
    t.ok(/put back/.test(await q.innerText('#main').catch(() => '')), 'the list does not say the reports were put back');
  },
}];
