// 🧠 Flashcards and the ⚡ streak (Roger, 24–25 Nov 2026): 5 cards studied make ⚡ 1 in the bar as soon as the session is closed, they are saved to the account,
// and the phone shows ⚡ 1 too (problem report, 4ESOA, 25 Nov 2026: "some students say that they practiced but it doesn't show the number 1").
import { school, NOW } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html';
const bolt = (p) => p.$eval('.elcb-mz', (a) => a.getAttribute('aria-label') || '').catch(() => '(no mascot in the bar)');

export async function study(p, n) {
  await p.waitForSelector('[data-fd="ls"]', { timeout: 15000 });
  await p.click('[data-fd="ls"] >> nth=0');
  await p.click('.elfd-main[data-fd="study"]');
  for (let i = 0; i < n; i++) {
    await p.click('[data-fd="show"]');
    await p.click('[data-fd="ans"][data-v="3"]');   // Good
  }
  await p.click('.elfd-x[data-fd="close"]');   // ✕ Close: the session is saved at once
}

export default [{
  name: 'Flashcards: 5 cards studied make ⚡ 1 in the bar as soon as the session is closed, saved to the account, and the phone shows ⚡ 1 too',
  async run(t) {
    const { alex } = await school(t);
    const cb = await t.device(alex, { now: NOW });
    const lp = await cb.open(LP3);
    await lp.waitForSelector('.elcb-mz', { timeout: 10000 }).catch(() => {});
    t.ok(/⚡ 0 days/.test(await bolt(lp)), `before studying, the bar should say ⚡ 0 (it says: ${await bolt(lp)})`);

    const old = await cb.open('lab/practice.html#deck');   // a Flashcards tab opened earlier and left open on its old copy
    await old.waitForSelector('[data-fd="ls"]', { timeout: 15000 });
    const p = await cb.open('lab/practice.html#deck');
    await study(p, 5);
    await p.waitForTimeout(600);
    t.ok(/⚡ 1 day in a row/.test(await bolt(p)), `after 5 cards and ✕ Close the bar should say ⚡ 1 at once, without a reload (it says: ${await bolt(p)})`);
    const saved = await t.until(() => t.read('students/u-alex/flashcards/all'), (d) => d && /"log"/.test(d.p || ''));
    t.ok(saved && /"log"/.test(saved.p || ''), 'the cards studied were not saved to the account (students/{uid}/flashcards/all), so another device would not see them');

    // the tab left open on its old copy: one more card there, then it is closed. It must add to the 5, never wipe them (the 25 Nov bug)
    await study(old, 1);
    await old.close({ runBeforeUnload: true });
    // (two tabs on one day count the day once: the bigger count of cards wins, el-flashdeck.js merge)
    const cards = (d) => { try { return Object.values(JSON.parse(d.p).decks || {}).reduce((n, x) => n + Object.keys(x.c || {}).length, 0); } catch (e) { return 0; } };
    await t.sleep(1500);
    const after = await t.read('students/u-alex/flashcards/all');
    t.ok(after && cards(after) >= 5, `a Flashcards tab left open on its old copy, used and closed, wiped the cards studied in the other tab: the account keeps ${after ? cards(after) : 0} of the 5`);

    const phone = await t.device(alex, { now: NOW + 3600e3, size: t.PHONE });
    const q = await phone.open(LP3);
    await q.waitForFunction(() => /⚡ 1 day/.test((document.querySelector('.elcb-mz') || {}).ariaLabel || (document.querySelector('.elcb-mz') || { getAttribute: () => '' }).getAttribute('aria-label') || ''), null, { timeout: 10000 }).catch(() => {});
    t.ok(/⚡ 1 day in a row/.test(await bolt(q)), `on the phone the bar should say ⚡ 1 (it says: ${await bolt(q)})`);
    const b = await phone.open('today.html');
    await b.waitForTimeout(1500);
    t.ok(/⚡\s*1\b/.test(await b.innerText('body')) || /⚡ 1 day/.test(await bolt(b)), 'on the phone, My dashboard does not show ⚡ 1 beside the mascot');
  },
}];
