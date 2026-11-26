// ↺ Redo (Roger, 24 Nov 2026): Roger sends a handed-in step back from his dashboard; the student's tick goes, ✅ To do lists it again,
// and once the student hands it in again it is done again ("I sent this to redo and it's still here").
import { school, NOW, LS4, lpState } from './world.mjs';
import { fillChart, tabDone, todoText, stillToDo } from './01-hand-in.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html', KEY = 'ls2Traditions4ESO', RES = 'students/u-alex/results/4eso__ls2-where-traditions-come-from';
const H = 3600e3;

// Roger, on his dashboard: ✏️ Corrections › the Listening chart › All their work in this learning path › ↺ Redo
export async function rogerRedo(t, roger, now, step = 'chart', title = 'Listening chart') {
  const d = await t.device(roger, { now });
  const q = await d.open('teacher.html');
  await q.click('#tabs button[data-g="corr"]');
  await q.waitForSelector('[data-do="corropen"]', { state: 'attached', timeout: 15000 });
  await q.evaluate(() => document.querySelectorAll('#main details').forEach((x) => (x.open = true)));
  await q.locator('[data-do="corropen"]', { hasText: title }).first().click();
  await q.click('#dlg [data-do="cell"]');
  await q.waitForSelector(`#dlg button[data-do="hbback"][data-s="${step}"]`, { state: 'attached', timeout: 10000 });
  await q.evaluate(() => document.querySelectorAll('#dlg details').forEach((x) => (x.open = true)));
  await q.click(`#dlg button[data-do="hbback"][data-s="${step}"]`);
  return q;
}

export default [{
  name: 'Redo: Roger presses ↺ Redo on the dashboard, the tick goes and ✅ To do lists it again; handed in again, it is done again',
  async run(t) {
    const { alex, roger } = await school(t);
    const p = await (await t.device(alex, { now: NOW })).open(LP3);
    await fillChart(p, 'a');   // one letter per box: the hand-in Roger sent back on 24 Nov
    await t.until(() => lpState(t, alex.uid, LS4, KEY), (s) => s && s.done && s.done.chart);

    await rogerRedo(t, roger, NOW + H);
    const r = await t.until(() => t.read(RES), (x) => x && x.flags && x.flags.chart);
    t.ok(r && r.flags && r.flags.chart && r.flags.chart.done === 'redo', 'Roger pressed ↺ Redo but nothing was saved for the student (results flags.chart)');

    // the student, an hour later on another device
    const d = await t.device(alex, { now: NOW + 2 * H });
    const left = stillToDo(await todoText(await d.open('today.html#todo')), 'LP3 · Where traditions come from');
    t.ok(left && left.includes('Listening chart'), `after ↺ Redo, ✅ To do should list the Listening chart again (it lists: ${left})`);
    const p2 = await d.open(LP3);
    await p2.waitForTimeout(1500);
    t.ok(!(await tabDone(p2, 'chart')), 'after ↺ Redo the Listening chart tab still has its ✓');
    await p2.click('.tab[data-panel="chart"]');
    t.ok(/do this step again/.test(await p2.innerText('body')), 'after ↺ Redo the step does not show Roger\'s message ("do this step again…")');

    // handed in again, properly
    await fillChart(p2, 'Mei values her grandmother\'s stories: "it\'s our way to remember", she says with a big smile.');
    await p2.waitForFunction(() => document.querySelector('.tab[data-panel="chart"]').classList.contains('done'), null, { timeout: 8000 }).catch(() => {});
    t.ok(await tabDone(p2, 'chart'), 'handed in again after ↺ Redo, the Listening chart tab did not get its ✓ back');
    const st = await t.until(() => lpState(t, alex.uid, LS4, KEY), (s) => s && s.done && s.done.chart && /grandmother/.test(JSON.stringify(s.steps)));
    t.ok(st && st.done && st.done.chart && /grandmother/.test(JSON.stringify(st.steps.chart)), 'handed in again after ↺ Redo, the new answers were not saved as done');
    const again = stillToDo(await todoText(await (await t.device(alex, { now: NOW + 3 * H })).open('today.html#todo')), 'LP3 · Where traditions come from');
    t.ok(again && !again.includes('Listening chart'), `handed in again, ✅ To do still lists the Listening chart (it lists: ${again})`);
  },
}];
