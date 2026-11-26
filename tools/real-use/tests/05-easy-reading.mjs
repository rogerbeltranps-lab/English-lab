// Aa Easy reading (Roger, 25 Nov 2026) on a reading the student has already done, and on a closed LS where the page is read-only
// (PR #908: on a step already done every tick box of the page was switched off, Easy reading's too, so it could not be changed).
import { school, NOW, LS4 } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html';
const cls = (p) => p.evaluate(() => document.documentElement.className);

async function easy(t, p, where) {
  await p.click('.tab[data-panel="read"]');
  const btn = p.locator('#lp .el-er-btn:visible').first();
  t.ok(await btn.count(), `${where}: no "Aa Easy reading" button on the reading`);
  if (!(await btn.count())) return;
  await btn.click();
  t.ok(/\bel-er-on\b/.test(await cls(p)), `${where}: "Aa Easy reading" did not turn on (the text stays as it was)`);
  const cream = p.locator('.el-er-panel:visible input[data-k="cream"]').first();
  t.ok(await cream.count() && !(await cream.isDisabled()), `${where}: the Easy reading tick boxes can't be used (switched off with the rest of the page)`);
  if (await cream.count()) { await cream.check({ force: true }).catch(() => {}); }
  t.ok(/\bel-er-cream\b/.test(await cls(p)), `${where}: ticking "Cream page" did nothing`);
  await p.reload(); await t.signedIn(p);
  t.ok(/\bel-er-on\b/.test(await cls(p)) && /\bel-er-cream\b/.test(await cls(p)), `${where}: after a reload Easy reading is off again (the choice should stay on this device)`);
}

export default [{
  name: 'Easy reading: Aa Easy reading and its tick boxes work on a reading already done, and on a closed, read-only LS',
  async run(t) {
    const { alex } = await school(t);
    await easy(t, await (await t.device(alex, { now: NOW })).open(LP3), 'reading already done');
    await t.seed({ ['ls/' + LS4]: { status: 'closed', groups: ['4ESOA', '4ESOB'] } });
    const p = await (await t.device(alex, { now: NOW })).open(LP3);
    t.ok(/only see|només pots|can't change|consultar/i.test(await p.innerText('body')), 'a closed LS should say the student can only look at their work');
    await easy(t, p, 'closed LS (read-only)');
  },
}];
