// ✅ A step handed in gets its tick, is saved for good, and leaves ✅ To do on every device.
import { school, NOW, LS4, lpState } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html', KEY = 'ls2Traditions4ESO';

// fills in the Listening chart of LP3 the way a student does: types each box, picks each self-assessment rating
export async function fillChart(p, words = 'She values her family, because she smiles when she talks about them.') {
  await p.click('.tab[data-panel="chart"]');
  const boxes = p.locator('#chartFields textarea');
  // typed key by key, as a student does (writing boxes refuse text that arrives in one chunk: dictation, swipe, Playwright's fill)
  for (let i = 0; i < await boxes.count(); i++) { await boxes.nth(i).click(); await p.keyboard.type(words + ' (' + (i + 1) + ')'); }
  const names = await p.$$eval('#chartRate input[type=radio]', (rs) => [...new Set(rs.map((r) => r.name))]);
  for (const n of names) await p.check(`#chartRate input[name="${n}"][value="3"]`);
}
export const tabDone = (p, id) => p.$eval(`.tab[data-panel="${id}"]`, (e) => e.classList.contains('done'));
export const todoText = async (p) => { await p.waitForSelector('text=Still to do', { timeout: 15000 }); return p.evaluate(() => document.body.innerText); };
// the "Still to do" tabs of one learning path on the board's ✅ To do page
export const stillToDo = (text, lp) => { const i = text.indexOf(lp); if (i < 0) return null; const rest = text.slice(i + lp.length), j = rest.search(/\nLP\d|\nRecall checkpoint|\n🎯/);
  return (j < 0 ? rest : rest.slice(0, j)).split('\n').map((s) => s.replace(/\s*→$/, '').trim()).filter((s) => s && !/^(\d+ %|⏰ late|Still to do:)$/.test(s)); };

export default [{
  name: 'Hand in a step: the Listening chart is handed in by itself, gets its ✓ and leaves ✅ To do on another device',
  async run(t) {
    const { alex } = await school(t);
    const before = stillToDo(await todoText(await (await t.device(alex, { now: NOW })).open('today.html#todo')), 'LP3 · Where traditions come from');
    t.ok(before && before.includes('Listening chart'), `before: ✅ To do should list LP3's Listening chart (it lists: ${before})`);

    const cb = await t.device(alex, { now: NOW });
    const p = await cb.open(LP3);
    t.ok(!(await tabDone(p, 'chart')), 'before: the Listening chart tab already had its ✓');
    await fillChart(p);
    await p.waitForFunction(() => /Handed in ✓/.test(document.getElementById('chartMsg').textContent), null, { timeout: 8000 }).catch(() => {});
    t.ok(/Handed in ✓/.test(await p.textContent('#chartMsg')), `the chart did not say "Handed in ✓" once every box and rating was filled in (it says: "${await p.textContent('#chartMsg')}")`);
    t.ok(await tabDone(p, 'chart'), 'the Listening chart tab did not get its ✓ after handing it in');

    const st = await t.until(() => lpState(t, alex.uid, LS4, KEY), (s) => s && s.done && s.done.chart);
    t.ok(st && st.done && st.done.chart, 'the hand-in was not saved in the database (progress: done.chart)');
    t.ok(st && st.steps && st.steps.chart && /values her family/.test(JSON.stringify(st.steps.chart.f)), 'the database does not hold the chart as handed in (steps.chart.f), so Roger would not see it');

    // the next day on the phone: the tick is there, and ✅ To do no longer lists it
    const phone = await t.device(alex, { now: NOW, size: t.PHONE });
    const left = stillToDo(await todoText(await phone.open('today.html#todo')), 'LP3 · Where traditions come from');
    t.ok(left && !left.includes('Listening chart') && left.includes('Speaking'), `on the phone, ✅ To do should list Speaking and Talk but no longer the Listening chart (it lists: ${left})`);
    const p2 = await phone.open(LP3);
    t.ok(await tabDone(p2, 'chart'), 'on the phone, the Listening chart tab has lost its ✓');
    t.ok((await p2.inputValue('#chartFields textarea >> nth=0')).includes('values her family'), 'on the phone, the chart does not show what was handed in');
  },
}];
