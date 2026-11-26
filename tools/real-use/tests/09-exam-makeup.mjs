// ↺ A make-up after a try that can't count (docs/REQUIREMENTS.md § 6.10; Roger, 26 Nov 2026: "in case a student does the exam from home
// … I must be able to delete that exam and make him do another version of the exam, another day"; the bug of 25 Nov: a deleted try came
// back from the student's browser). Roger sees ⚠️ check on the row, presses ↺ Redo it another day in the student's window: the old try
// and its marks are kept apart, the marks leave the results, and on the make-up day the student starts a NEW paper, never the old try.
// ↩ Put the old try back brings everything back as it was.
import { school, NOW, LS4 } from './world.mjs';

const EXAM = '4eso/seasons-and-celebrations/exam.html', KEY = 'ls2Exam4ESO', HOLD = '9999-12-31T00:00:00.000Z';
const OLD = '2026-11-23T07:29:00.000Z';
const RES = 'students/u-alex/results/' + LS4 + '__assessment';
const sections = { listening: { score: 16, max: 20 }, reading: { score: 15, max: 20 }, vocabulary: { score: 28, max: 35 }, grammar: { score: 12, max: 15 }, writing: { score: 7, max: 10 } };
// Alex's try "from home": started outside class time (07:29 UTC = 8:29 Madrid, Monday), not on a Chromebook, and the browser still has it
const oldTry = { ls: LS4, key: KEY, paper: 'core-A', level: 'safe', group: '4ESOA', order: { listening: ['l1'], reading: [], vocabulary: [], grammar: [], writing: [] },
  answers: { l1: 'B' }, started: OLD, listenDone: '2026-11-23T07:31:00.000Z', status: 'done', done: '2026-11-23T07:42:00.000Z',
  exits: [], glances: [], changes: [], snaps: [], tries: 0, plays: 0, env: { dev: 'other', net: 'aaaa1111' }, updated: { __ts: Date.parse('2026-11-23T07:42:00Z') } };
const base = (extra) => Object.assign({
  ['students/u-alex/exams/' + KEY]: oldTry,
  [RES]: { ls: LS4, activity: LS4 + '/assessment', sections, webPaper: 'core-A', levels: { writing: { '5.1': 'AN' } }, showFrom: HOLD },
}, extra);

async function redo(t, roger) {
  const q = await (await t.device(roger, { now: NOW })).open('teacher.html');
  await q.click('#tabs button[data-g="4ESOA"]');
  await q.locator('[data-do="place"][data-p="exams"]').first().click({ timeout: 20000 });
  const row = q.locator('tr[data-wx="dlg"][data-u="u-alex"]');
  await row.waitFor({ timeout: 20000 });
  t.ok(/⚠️ check/.test(await row.innerText()), 'the row of a try started outside class time, not on a Chromebook, has no ⚠️ check');
  await row.click();
  await q.locator('[data-wx="redo"]').click({ timeout: 10000 });   // the page's question is answered OK (lib.mjs)
  return q;
}

export default [
  { name: '↺ Exam make-up: Roger sets a try aside, its marks leave the results, and the student starts a new paper, never the old try', async run(t) {
    const { alex, roger } = await school(t, { extra: base() });
    const q = await redo(t, roger);
    const gone = await t.until(() => t.read('students/u-alex/exams/' + KEY), (x) => !x, 12000);
    t.ok(!gone, 'after ↺ Redo it another day, the old try is still the exam (it was not set aside)');
    const kept = Object.values(await t.list('students/u-alex/exams')).find((x) => x.of === KEY);
    t.ok(kept && kept.exam && kept.exam.started === OLD && kept.result && kept.result.sections, 'the old try and its marks were not kept apart (no copy with them)');
    const r = (await t.read(RES)) || {};
    t.ok(!r.sections && !r.levels?.writing && r.showFrom === HOLD, 'the old try\'s marks are still in the results (or not held): ' + JSON.stringify(r).slice(0, 160));
    const l = (await t.read('ls/' + LS4)) || {};
    t.ok(((l.webExam || {})['4ESOA'] || {}).reset?.['u-alex'] === OLD, 'the old try was not marked as set aside on the LS (reset)');
    await q.getByText('Set aside for a make-up').first().waitFor({ timeout: 8000 }).catch(() => t.ok(false, 'the row does not say the try was set aside for a make-up'));

    // the make-up day: 👤 only Alex; his browser still has the old try saved, and it must not come back
    await t.seed({ ['ls/' + LS4]: Object.assign({}, l, { webExam: { '4ESOA': { open: true, only: [alex.email], reset: { 'u-alex': OLD } } } }) });
    const mine = Object.assign({}, oldTry, { status: 'in', updated: null, at: NOW });   // the old try as this browser last kept it, still running
    const d = await t.device(alex, { now: NOW + 3600e3, local: { ['el_webexam_' + KEY + '_u-alex']: JSON.stringify(mine) } });
    // the connection check: the free address service answers with an invented address (only a short code of it may be saved)
    await d.ctx.route(/api\.ipify\.org/, (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ip":"203.0.113.7"}' }));
    const p = await d.open(EXAM);
    await p.waitForSelector('#wxRead', { timeout: 20000 }).catch(() => {});
    t.ok(!(await p.getByText('Exam turned in').count()), 'the student saw the old try "turned in" instead of a new exam');
    t.ok(await p.locator('#wxRead').count() > 0, 'the student did not get the rules of a new exam');
    await p.check('#wxRead'); await p.click('#wxStart');
    await p.waitForSelector('.wx-run #wxTabs', { timeout: 15000 });
    const n = await t.until(() => t.read('students/u-alex/exams/' + KEY), (x) => x && x.started && x.started !== OLD, 12000);
    t.ok(n && n.started !== OLD && n.status === 'in', 'the make-up did not start a new try');
    t.ok(n && n.paper !== 'core-A', 'the make-up gave the same version as the old try (' + (n && n.paper) + '), not the next one');
    t.ok(n && n.env && n.env.dev, 'the new try did not save which device it was done on (env.dev)');
    const net = await t.until(() => t.read('students/u-alex/exams/' + KEY), (x) => x && x.env && x.env.net, 15000);
    t.ok(net && /^[0-9a-f]{8}$/.test(net.env.net), 'the new try did not save the short code of its connection (env.net)');
    t.ok(!JSON.stringify(net || {}).includes('203.0.113'), 'the connection\'s address itself was saved (only a short code may be)');
  } },

  { name: '↩ Exam make-up: Put the old try back brings the try and its marks back as they were', async run(t) {
    const { roger } = await school(t, { extra: base() });
    const q = await redo(t, roger);
    await t.until(() => t.read('students/u-alex/exams/' + KEY), (x) => !x, 12000);
    await q.locator('[data-wx="unredo"][data-u="u-alex"]').click({ timeout: 10000 });
    const back = await t.until(() => t.read('students/u-alex/exams/' + KEY), (x) => x && x.started === OLD, 12000);
    t.ok(back && back.status === 'done' && back.answers && back.answers.l1 === 'B', 'the old try did not come back as it was');
    const r = await t.until(() => t.read(RES), (x) => x && x.sections, 12000);
    t.ok(r && r.sections && r.sections.writing && r.sections.writing.score === 7, 'the old try\'s marks did not come back');
    const l = (await t.read('ls/' + LS4)) || {};
    t.ok(!(((l.webExam || {})['4ESOA'] || {}).reset || {})['u-alex'], 'the set-aside mark stayed on the LS after putting the old try back');
  } },
];
