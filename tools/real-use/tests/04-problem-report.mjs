// ⚠️ Report a problem (on every page, 19 Nov 2026) → Roger's 🔔: the student's report passes the database rules, Beltran's instant
// task is woken, and Roger's 🔔 shows a red 1 on any page of his.
import { school, NOW } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html';

export default [{
  name: 'Problem report: a student sends ⚠️ Report a problem, it is saved, Beltran is woken and Roger\'s 🔔 shows 1',
  async run(t) {
    const { alex, roger } = await school(t);
    const d = await t.device(alex, { now: NOW });
    const p = await d.open(LP3);
    await p.click('.tab[data-panel="listen"]');
    await p.click('#el-cloud-bar [aria-label="Report a problem"]');
    await p.check('dialog[open] input[name="el-rep"][value="media"]');
    await p.fill('dialog[open] textarea', 'The second video does not play on my Chromebook.');
    await p.click('dialog[open] [data-ok]');
    const saved = await t.until(() => t.list('problems'), (x) => Object.keys(x).length > 0);
    const r = Object.values(saved || {})[0];
    t.ok(r, 'the problem report was not saved (the database refused it, or the window did not send it)');
    if (r) {
      t.ok(r.uid === alex.uid && r.group === '4ESOA' && r.kind === 'media' && /second video/.test(r.text), `the report was saved without what Roger needs: ${JSON.stringify(r).slice(0, 300)}`);
      t.ok(/where-traditions-come-from/.test(r.page || '') || /Where traditions/.test(r.title || ''), `the report does not say on which page it happened: page "${r.page}", title "${r.title}"`);
    }
    await p.waitForTimeout(1000);
    t.ok(d.script.length > 0, 'Beltran\'s instant task was not woken (no call to the school script), so the report would wait for the next run');
    t.ok(/report|avís|problem/i.test(await p.innerText('dialog[open]').catch(() => '')), 'after sending, the window does not tell the student it was sent');

    const q = await (await t.device(roger, { now: NOW + 60e3 })).open(LP3);
    await q.waitForSelector('#el-bell button', { timeout: 15000 }).catch(() => {});
    await q.waitForFunction(() => /1/.test((document.querySelector('#el-bell button b') || {}).textContent || ''), null, { timeout: 10000 }).catch(() => {});
    t.ok(((await q.textContent('#el-bell button b').catch(() => '')) || '').trim() === '1', `Roger's 🔔 should show a red 1 (it shows: "${await q.textContent('#el-bell button').catch(() => 'no 🔔 at all')}")`);
    await q.click('#el-bell button');
    t.ok(/second video/.test(await q.innerText('#el-bell')), 'Roger opened his 🔔 and the student\'s report is not in the list');
  },
}];
