// 📓 My notebook (Roger, 13 Nov 2026; reading texts in it, 25 Nov): the reading of a learning path done in class is in the student's
// notebook on the phone too, and a ✍ note written in the notebook is saved to their account and comes back on another device.
import { school, NOW, LS4 } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html', NB = '4eso/seasons-and-celebrations/index.html#notes';

async function openLP3(p) {
  await p.locator('.nb-ctab:visible').first().waitFor({ timeout: 15000 });
  // the first visit shows a short tour of the notebook: Skip, as a student would
  if (await p.locator('.nb-tour-skip').first().waitFor({ timeout: 4000 }).then(() => true, () => false)) await p.locator('.nb-tour-skip').first().click();
  await p.locator('.nb-ctab:visible', { hasText: 'LS2' }).first().click();
  await p.locator('.nb-tab:visible', { hasText: /^LP3$/ }).first().click();
  await p.waitForTimeout(500);
}

// the notebook's pages (every page is laid out at once; ◀ ▶ only show two of them): the page that holds `re`, or 0
const pageWith = (p, re) => p.$$eval('.nb-page', (ps, src) => { const r = new RegExp(src); const i = ps.findIndex((x) => r.test(x.textContent)); return i + 1; }, re.source);

export default [{
  name: 'Notebook: the reading done on the Chromebook is in 📓 My notebook on the phone, and a ✍ note written there comes back on another device',
  async run(t) {
    const { alex } = await school(t);
    const cb = await t.device(alex, { now: NOW });
    const lp = await cb.open(LP3);
    // the reading text of LP3 at Alex's level (Core), as the Reading step shows it: the notebook glues it in (Roger, 25 Nov 2026)
    await lp.click('.tab[data-panel="read"]');
    const reading = (await lp.$$eval('#lp .reading p', (ps) => (ps.find((x) => x.offsetParent && x.textContent.trim().length > 40) || {}).textContent || '')).replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s/)[0].slice(0, 60);

    const p = await cb.open(NB);
    await openLP3(p);
    // the ✍ (Add a note below this) of LP3's Recall, on the open pages at the Chromebook's normal size (1366 × 640), so the note goes
    // into LP3 (at the old 1366 × 768 the test pressed the first ✍ it found, which was LP2's Writing on the page before)
    await p.click('.nb-page:visible:has-text("Recall: Learning Paths") [data-nbadd]:not([data-pi])');
    const pad = p.locator('.nb-editing [contenteditable="true"]:visible, .nb-ed [contenteditable="true"]:visible, .nb-ed textarea:visible').first();
    await pad.click(); await p.keyboard.type('Revise the relative clauses before Friday');
    await p.locator('.nb-ed-ok:visible').first().click();
    const saved = await t.until(() => t.read(`students/${alex.uid}/notes/nb-${LS4}`), (d) => d && /relative clauses before Friday/.test(JSON.stringify(d)));
    t.ok(saved && /relative clauses before Friday/.test(JSON.stringify(saved)), 'the ✍ note written in the notebook was not saved to the account');

    const phone = await t.device(alex, { now: NOW + 3600e3, size: t.PHONE });
    const q = await phone.open(NB);
    await openLP3(q);
    t.ok(await pageWith(q, new RegExp(reading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))), `on the phone, 📓 My notebook has no page with LP3's reading text ("${reading}…", the Reading step done on the Chromebook)`);
    t.ok(await pageWith(q, /relative clauses before Friday/), 'on the phone, 📓 My notebook has no page with the ✍ note written on the Chromebook');
    t.ok(/Where traditions come from/.test(await q.innerText('body')), 'on the phone, the notebook\'s LP3 tab does not open LP3');
  },
},
{
  // Roger, 26 Nov 2026 ("this I want it here"): the 📓 button is an icon of the bottom-right bar, beside ⚠️ 💡 📬, no longer a round button
  // floating bottom left; on the board and a learning path, on the Chromebook and on the phone, it opens the notebook
  name: 'Notebook: 📓 sits in the bottom-right bar with ⚠️ 💡 📬 (not floating bottom left) and opens My notebook',
  async run(t) {
    const { alex } = await school(t);
    for (const size of [undefined, t.PHONE]) {
      const where = size ? 'on the phone' : 'on the Chromebook';
      const d = await t.device(alex, { now: NOW, ...(size ? { size } : {}) });
      for (const page of ['today.html', LP3]) {
        const p = await d.open(page);
        await p.locator('#el-cloud-bar #el-nbfab').waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
        const nb = await p.evaluate(() => { const a = document.getElementById('el-nbfab'), bar = document.getElementById('el-cloud-bar');
          if (!a) return null; const r = a.getBoundingClientRect(), w = innerWidth;
          return { inBar: !!(bar && bar.contains(a)), shown: !!a.offsetParent && r.width > 0, href: a.getAttribute('href') || '', fixed: getComputedStyle(a).position === 'fixed',
            fits: r.right <= w + 1, tip: a.dataset.tip || '', after: [...bar.children].indexOf(a) < [...bar.children].findIndex((x) => /⚠️/.test(x.textContent)) };
        });
        t.ok(nb, `${where}, ${page} has no 📓 My notebook button`);
        if (!nb) continue;
        t.ok(nb.inBar && !nb.fixed, `${where}, on ${page} the 📓 button is not in the bottom-right bar (it floats on its own)`);
        t.ok(nb.shown && nb.fits, `${where}, on ${page} the 📓 button in the bar is hidden or off the screen`);
        t.ok(nb.after, `${where}, on ${page} the 📓 button is not before ⚠️ Report a problem in the bar`);
        t.ok(/My notebook/.test(nb.tip), `${where}, on ${page} the 📓 button has no "My notebook" name on hover (it has "${nb.tip}")`);
        t.ok(/seasons-and-celebrations\/index\.html#notes$/.test(nb.href), `${where}, on ${page} the 📓 button does not open the LS2 notebook (it opens "${nb.href}")`);
      }
    }
    const d = await t.device(alex, { now: NOW });
    const p = await d.open(LP3);
    await p.locator('#el-cloud-bar #el-nbfab').click();
    t.ok(await p.locator('.nb-ctab:visible').first().waitFor({ timeout: 15000 }).then(() => true, () => false), 'pressing 📓 in the bar did not open My notebook');
    t.ok(await p.evaluate(() => { const a = document.getElementById('el-nbfab'); return !a || !a.offsetParent; }), 'the 📓 button still shows on the notebook itself');
  },
}];
