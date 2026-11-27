// 🧑‍🎨 Roger's own mascot opens his Towards Nativeness 🧠 My flashcards and its ⚡ counts them (Roger, 27 Nov 2026: "the teacher mascot on the
// teachers mode needs to go to towards nativeness flashcard and count the streak there"). Invented data only: Roger studied 🧠 Flashcards
// (students' decks) on Mon 23 Nov and his TN decks on Tue 24 and Wed 25 Nov, all on another device, so only his account has them.
import { school, NOW } from './world.mjs';
const TN = '4eso-towards-nativeness';
const day = (n) => [n, n, 60, 0, 0, 0];
const card = (k) => ({ [k]: [2, NOW + 2 * 864e5, 3, 2.5, 0, 0, 1, NOW - 3600e3] });
const label = (p) => p.$eval('.elcb-mz', (a) => (a.getAttribute('aria-label') || '') + ' → ' + a.getAttribute('href')).catch(() => '(no mascot in the bar)');

export default [{
  name: "Roger's mascot opens Towards Nativeness › 🧠 My flashcards, and its ⚡ there and in the bar counts every day he studied (TN and 🧠 Flashcards)",
  async run(t) {
    const { alex, roger } = await school(t);
    const tnFlash = JSON.stringify({ decks: { 'tn-slips': { c: card('s1'), log: { '2026-11-24': day(4), '2026-11-25': day(3) } } } });
    const lsFlash = JSON.stringify({ decks: { '4eso-seasons-and-celebrations': { c: card('v1'), log: { '2026-11-23': day(5) } } } });
    await t.seed({
      ['students/u-teacher/progress/' + TN]: { data: { tnFlash } },
      'students/u-teacher/flashcards/all': { p: lsFlash },
    });

    // Roger's own browser already knows he is the teacher (el_who, saved by el-cloud.js on his first page), as on his Mac
    const d = await t.device(roger, { now: NOW, local: { el_who: JSON.stringify({ uid: 'u-teacher', role: 'teacher', t: NOW - 864e5 }) } });
    const q = await d.open('teacher.html');
    await q.waitForFunction(() => /⚡ 3 days/.test((document.querySelector('.elcb-mz') || { getAttribute: () => '' }).getAttribute('aria-label') || ''), null, { timeout: 20000 }).catch(() => {});
    const bar = await label(q);
    t.ok(/towards-nativeness\/flashcards\.html/.test(bar), `on the dashboard Roger's mascot should open Towards Nativeness › 🧠 My flashcards (it is: ${bar})`);
    t.ok(/My flashcards · ⚡ 3 days in a row/.test(bar), `on the dashboard Roger's ⚡ should count Mon, Tue and Wed: 3 days (it says: ${bar})`);

    await q.click('.elcb-mz');
    await q.waitForURL(/towards-nativeness\/flashcards\.html/, { timeout: 15000 }).catch(() => {});
    t.ok(/towards-nativeness\/flashcards\.html/.test(q.url()), `a tap on the mascot did not open his TN flashcards (it opened ${q.url()})`);
    const head = () => q.$eval('.elfd-mz .elmz-badge', (b) => b.textContent.trim()).catch(() => '(no ⚡ on the page)');
    await q.waitForFunction(() => /^3$/.test(((document.querySelector('.elfd-mz .elmz-badge') || {}).textContent || '').trim()), null, { timeout: 20000 }).catch(() => {});
    t.ok((await head()) === '3', `on 🧠 My flashcards the ⚡ should be the mascot's 3 days, the 🧠 Flashcards day too (it says ${await head()})`);
    await q.waitForSelector('.elcb-mz', { timeout: 15000 }).catch(() => {});
    const tb = await label(q);
    t.ok(/⚡ 3 days/.test(tb), `on 🧠 My flashcards the bar's ⚡ should say 3 too (it says: ${tb})`);
    const saved = await t.read('students/u-teacher/progress/' + TN);
    t.ok(!/4eso-seasons-and-celebrations/.test(((saved || {}).data || {}).tnFlash || ''), 'the 🧠 Flashcards decks were saved into his TN flashcards: they must only count in the ⚡');

    // a student's mascot still opens 🧠 Flashcards
    const s = await (await t.device(alex, { now: NOW })).open('4eso/seasons-and-celebrations/where-traditions-come-from.html');
    await s.waitForSelector('.elcb-mz', { timeout: 15000 }).catch(() => {});
    const sb = await label(s);
    t.ok(/lab\/practice\.html#deck/.test(sb) && !/towards-nativeness/.test(sb), `a student's mascot should open 🧠 Flashcards, never Towards Nativeness (it is: ${sb})`);
  },
}];
