// 📣 Exam results are held until Roger publishes them (docs/REQUIREMENTS.md § 6.11): before, the student's 📬 has nothing about the
// exam; Roger presses 📣 Publish the results on his dashboard; then the 📬 shows a red number and "Your LS2 exam results are ready",
// and opening the list takes the number away.
import { school, NOW, LS4 } from './world.mjs';
const H = 3600e3, HOLD = '9999-12-31T00:00:00.000Z', RES = 'students/u-alex/results/' + LS4 + '__assessment';
const sections = { listening: { score: 16, max: 20 }, reading: { score: 15, max: 20 }, vocabulary: { score: 28, max: 35 }, grammar: { score: 12, max: 15 }, writing: { score: 7, max: 10 } };

// the board's daily cards (✅ Finish all your activities, the mascot's line) come first: the student presses OK, as in class
async function closeCards(p) {
  for (let i = 0; i < 4; i++) {
    await p.waitForTimeout(800);
    const ok = p.locator('button:visible', { hasText: /^\W*OK\W*$/ }).first();
    if (!(await ok.count())) return;
    await ok.click().catch(() => {});
  }
}
async function bell(p) {
  await p.waitForSelector('#el-nbell > button', { timeout: 20000 });
  await p.waitForTimeout(1500);   // the 📬 fills in once the page has the student's results
  await closeCards(p);
  const n = (await p.locator('#el-nbell > button b').innerText().catch(() => '')).trim();
  await p.click('#el-nbell > button');
  await p.waitForSelector('#el-npanel:not([hidden])', { timeout: 5000 });
  const list = await p.locator('#el-npanel').innerText();
  await p.click('#el-nbell > button');   // close it again
  return { n, list };
}

export default [{
  name: '📣 Exam results: held until Roger presses 📣 Publish, then the student\'s 📬 shows a red 1 and "Your LS2 exam results are ready"',
  async run(t) {
    const { alex, roger } = await school(t, { extra: { [RES]: { ls: LS4, activity: LS4 + '/assessment', sections, paper: 'core-A', showFrom: HOLD } } });
    // before: nothing about the exam
    const s1 = await (await t.device(alex, { now: NOW })).open('today.html');
    const b1 = await bell(s1);
    t.ok(!/exam results are ready|resultats de l'examen/i.test(b1.list), 'the 📬 told the student about exam results Roger had not published: ' + b1.list.slice(0, 160));

    // Roger: 4 ESO A › 📝 Exams › 📣 Publish the results (the page's questions are answered OK: lib.mjs)
    const q = await (await t.device(roger, { now: NOW + H })).open('teacher.html');
    await q.click('#tabs button[data-g="4ESOA"]');
    await q.locator('[data-do="place"][data-p="exams"]').first().click({ timeout: 20000 });
    await q.locator('[data-wx="pub"]').click({ timeout: 15000 });
    const r = await t.until(() => t.read(RES), (x) => x && x.showFrom && x.showFrom !== HOLD);
    t.ok(r && r.showFrom && Date.parse(r.showFrom) <= NOW + 2 * H, 'Roger pressed 📣 Publish but the results are still held (showFrom ' + (r && r.showFrom) + ')');
    await q.getByText('📣 Published').first().waitFor({ timeout: 10000 }).catch(() => t.ok(false, 'the dashboard did not say 📣 Published after publishing'));

    // after: the student, on another device, sees the red number and the news; opening the list takes the number away
    const d = await t.device(alex, { now: NOW + 2 * H });
    const s2 = await d.open('today.html');
    const b2 = await bell(s2);
    t.ok(/Your LS2 exam results are ready/.test(b2.list), 'after 📣 Publish, the 📬 does not say "Your LS2 exam results are ready": ' + b2.list.slice(0, 160));
    t.ok(+b2.n >= 1, 'after 📣 Publish, the 📬 shows no red number (it shows "' + b2.n + '")');
    await s2.reload();
    const b3 = await bell(s2);
    t.ok(+b3.n < +b2.n || !b3.n, 'the 📬 still shows the same red number after the student opened the list (' + b2.n + ' → ' + b3.n + ')');
    t.ok(/Your LS2 exam results are ready/.test(b3.list), 'the exam news left the 📬 list after it was opened (it should stay, as seen)');
  },
}];
