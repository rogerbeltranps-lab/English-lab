// 📝 The web exam (docs/REQUIREMENTS.md § 6.10): a student sits it from the rules screen to 🏁 Turn in, and what was saved is the
// turned-in exam with every answer; and leaving full screen stops (locks) the exam, so a student can't look things up.
import { school, NOW, LS4 } from './world.mjs';

const EXAM = '4eso/seasons-and-celebrations/exam.html', KEY = 'ls2Exam4ESO';
const examOpen = { ['ls/' + LS4]: { status: 'open', groups: ['4ESOA', '4ESOB'], open: {}, webExam: { '4ESOA': { open: true } } } };

async function start(t, p) {
  await p.waitForSelector('#wxRead', { timeout: 20000 });
  await p.check('#wxRead');
  await p.click('#wxStart');
  await p.waitForSelector('.wx-run #wxTabs', { timeout: 15000 });
  await p.waitForTimeout(5500);   // past the first 5 s of full screen, when a lost focus still gets a short grace
}
const full = (p) => p.evaluate(() => !!document.fullscreenElement);

export default [
  { name: '📝 Exam: the student sits it from the rules to 🏁 Turn in, and the turned-in exam is saved with the answers', async run(t) {
    const { alex } = await school(t, { extra: examOpen });
    const p = await (await t.device(alex, { now: NOW, size: t.CHROMEBOOK_FULL })).open(EXAM);
    await start(t, p);
    t.ok(await full(p), 'the exam did not go to full screen when it started');
    // Listening: one answer, then ✅ Listening finished → Yes, go on (the other sections stay closed until then)
    t.ok(await p.locator('#wxTabs [data-sec="reading"]').isDisabled(), 'Reading could be opened before the Listening was finished');
    await p.locator('.wx-opt').first().click();
    await p.click('#wxLDone');
    await p.locator('#wxLYes:not([disabled])').click({ timeout: 5000 });
    await p.waitForSelector('.wx-read .wx-text', { timeout: 5000 });
    t.ok(!(await p.locator('#wxTabs [data-sec="reading"]').isDisabled()), 'Reading did not open after Listening finished');
    // Reading, Vocabulary, Grammar: one answer each (a choice, or a word in a gap)
    const answer = async () => {
      const opt = p.locator('#wxBody .wx-opt:not([disabled])').first(), box = p.locator('#wxBody .wx-in:not([disabled])').first();
      if (await opt.count()) await opt.click(); else if (await box.count()) await box.fill('celebrate');
    };
    for (const sec of ['reading', 'vocabulary', 'grammar']) {
      await p.click('#wxTabs [data-sec="' + sec + '"]');
      await p.waitForTimeout(200);
      await answer();
    }
    // Writing
    const TEXT = 'Hi Sam! Last weekend we celebrated my grandmother\'s birthday. We cooked a big lunch and we played music all afternoon.';
    await p.click('#wxTabs [data-sec="writing"]');
    await p.fill('#wxBody .wx-ta', TEXT);
    t.ok(/words/.test(await p.locator('#wxBody .wx-wc').innerText()), 'the writing did not count the words');
    // ✅ Review shows the blanks, then 🏁 Turn in → Yes
    await p.click('#wxTabs [data-sec="review"]');
    await p.waitForSelector('#wxEnd');
    t.ok(await p.locator('.wx-rev tr.blank').count() > 0, '✅ Review did not show the blank questions in red');
    t.ok(/birthday/.test(await p.locator('.wx-rev').innerText()), '✅ Review did not show the start of the writing');
    await p.click('#wxEnd');
    await p.locator('#wxYes:not([disabled])').click({ timeout: 5000 });
    await p.getByText('Exam turned in').waitFor({ timeout: 15000 });
    await p.waitForFunction(() => !document.fullscreenElement, null, { timeout: 4000 }).catch(() => {});
    t.ok(!(await full(p)), 'the page stayed in full screen after the exam was turned in');
    // what was saved
    const d = (await t.until(() => t.read(`students/${alex.uid}/exams/${KEY}`), (x) => x && x.status === 'done', 10000)) || {};
    t.ok(d.status === 'done', 'the exam was not saved as turned in (status ' + d.status + ')');
    t.ok(d.answers && Object.values(d.answers).includes(TEXT), 'the saved exam does not have the writing');
    t.ok(Object.keys(d.answers || {}).length >= 5, 'the saved exam has only ' + Object.keys(d.answers || {}).length + ' answers (5 or more were given)');
    t.ok(d.listenDone && d.group === '4ESOA' && /^core-/.test(d.paper || ''), 'the saved exam is missing its listening end, group or Core paper (' + d.paper + ')');
    t.ok(!(d.exits || []).length, 'the exam saved an exit, but the student never left it');
    // coming back to the page shows it turned in, never a new exam
    await p.reload(); await p.getByText('Exam turned in').waitFor({ timeout: 15000 });
  } },

  { name: '📝 Exam: leaving full screen stops the exam at once and it is saved as locked', async run(t) {
    const { alex } = await school(t, { extra: examOpen });
    const p = await (await t.device(alex, { now: NOW, size: t.CHROMEBOOK_FULL })).open(EXAM);
    await start(t, p);
    await p.locator('.wx-opt').first().click();
    await p.evaluate(() => document.exitFullscreen());
    await p.waitForTimeout(1200);
    t.ok(!(await p.locator('.wx-run #wxTabs').isVisible().catch(() => false)), 'the exam kept running after the student left full screen');
    const d = (await t.until(() => t.read(`students/${alex.uid}/exams/${KEY}`), (x) => x && x.status === 'out', 10000)) || {};
    t.ok(d.status === 'out', 'the exam was not saved as locked (status ' + d.status + ')');
    t.ok((d.exits || []).length === 1, 'the saved exam does not record the exit');
    // a reload does not get the student back in without the teacher's password
    await p.reload(); await p.waitForTimeout(3000);
    t.ok(!(await p.locator('.wx-run #wxTabs').isVisible().catch(() => false)), 'a reload let the student back into a locked exam');
  } },
];
