// 📨 Send on a problem report goes back to the list (Roger, 28 Nov 2026: "when I send a message it should go back to problems"): Roger
// opens one report on his dashboard, presses 📨 Send on Beltran's suggested reply, the answer is saved and the page shows ‹ All reports'
// list again, so the next report is one click away.
import { school, NOW } from './world.mjs';

export default [{
  name: 'Problem report: after 📨 Send on the suggested reply, the dashboard goes back to the list of reports',
  async run(t) {
    const { alex, roger } = await school(t);
    const report = (id, text, min) => ({ uid: alex.uid, group: '4ESOA', route: 'safe', kind: 'other', text, page: 'today.html', title: 'My dashboard',
      created: new Date(NOW - min * 60e3).toISOString(), auto: { status: 'you', note: 'Not a bug: the step is open.', reply: 'It is open now: try again.', reply2: 'Ja està obert: torna-ho a provar.' } });
    await t.seed({ 'problems/p1': report('p1', 'I cannot open the reading.', 30), 'problems/p2': report('p2', 'The video does not play.', 20) });

    const d = await t.device(roger, { now: NOW });
    const q = await d.open('teacher.html#pb-p1');
    await q.waitForSelector('#pb-p1 [data-do="pbsug"]', { timeout: 25000 }).catch(() => {});
    t.ok(await q.locator('#pb-p1').count(), 'teacher.html#pb-p1 did not open the report on its own (the test could not start)');
    await q.click('#pb-p1 [data-do="pbsug"]');
    const saved = await t.until(() => t.read('problems/p1'), (x) => x && (x.msgs || []).length > 0);
    t.ok(saved && (saved.msgs || []).length === 1, 'Roger pressed 📨 Send but the answer was not saved on the report');
    await q.waitForSelector('#probs .ibl', { timeout: 10000 }).catch(() => {});
    t.ok(!(await q.locator('#probs .mail').count()), 'after 📨 Send the page still shows the report alone, not the list of reports');
    t.ok(/The video does not play/.test(await q.innerText('#probs').catch(() => '')), 'after 📨 Send the list does not show the next report waiting');
  },
}];
