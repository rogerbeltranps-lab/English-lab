// 🧠 Flashcards study screen: 🌙 dark mode and ⚠️ Report a problem (Roger, 27 Nov 2026: "I want dark mode available here and a report the
// problem (also for my students)"). The study screen covers the page's bottom bar, so it has its own ⚠️ (the same window, saved to
// problems/{id}, told which deck and card) and its own 🌙 / ☀️, kept on that device. Esc in the ⚠️ window closes only the window.
import { school, NOW } from './world.mjs';

async function openStudy(p) {
  await p.waitForSelector('[data-fd="ls"]', { timeout: 15000 });
  await p.click('[data-fd="ls"] >> nth=0');
  await p.click('.elfd-main[data-fd="study"]');
  await p.waitForSelector('.elfd-full [data-fd="show"]', { timeout: 8000 });
}
const darkNow = (p) => p.$eval('.elfd-full', (l) => l.classList.contains('elfd-dark') && /invert/.test(getComputedStyle(l).filter)).catch(() => false);

export default [{
  name: 'Flashcards: the study screen has 🌙 dark mode (kept on the device) and ⚠️ Report a problem that saves the deck and card',
  async run(t) {
    const { alex } = await school(t);
    const cb = await t.device(alex, { now: NOW });
    const p = await cb.open('lab/practice.html#deck');
    await openStudy(p);

    // 🌙 dark mode: off at first, on with a tap, still on in the next session, off again with ☀️
    t.ok(!(await darkNow(p)), 'the study screen started dark: dark mode must be off until the student turns it on');
    const moon = await p.$('.elfd-top [data-fd="theme"]');
    t.ok(moon, 'the study screen has no 🌙 Dark mode button in its top bar');
    if (moon) {
      await moon.click();
      t.ok(await darkNow(p), 'after 🌙 the study screen is not dark');
      t.ok(/☀️/.test(await p.textContent('.elfd-top [data-fd="theme"]')), 'once dark, the button should offer ☀️ Light mode');
      await p.click('.elfd-x[data-fd="close"]');
      await p.click('.elfd-main[data-fd="study"]');
      await p.waitForSelector('.elfd-full [data-fd="show"]', { timeout: 8000 });
      t.ok(await darkNow(p), 'dark mode was not kept: the next study session opened light again');
      await p.click('.elfd-top [data-fd="theme"]');
      t.ok(!(await darkNow(p)), 'after ☀️ the study screen is still dark');
    }

    // ⚠️ Report a problem, from the card on screen
    const warn = await p.$('.elfd-top [data-fd="report"]');
    t.ok(warn, 'the study screen has no ⚠️ Report a problem button (the page\'s bottom bar is covered)');
    if (!warn) return;
    const front = (await p.textContent('.elfd-front')).replace('⭐', '').replace(/\s+/g, ' ').trim();
    await warn.click();
    await p.waitForSelector('dialog[open]', { timeout: 5000 });
    // Esc closes the window, never the study session behind it
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    t.ok(!(await p.$('dialog[open]')) && !!(await p.$('.elfd-full [data-fd="show"]')), 'Esc in the ⚠️ window closed the study session too (it should close only the window)');
    await p.click('.elfd-top [data-fd="report"]');
    await p.check('dialog[open] input[name="el-rep"][value="other"]');
    await p.fill('dialog[open] textarea', 'This card has the wrong answer.');
    await p.click('dialog[open] [data-ok]');
    const saved = await t.until(() => t.list('problems'), (x) => Object.keys(x).length > 0);
    const r = Object.values(saved || {})[0];
    t.ok(r, 'the problem report from the flashcards was not saved');
    if (r) {
      t.ok(r.uid === alex.uid && r.group === '4ESOA' && /wrong answer/.test(r.text), `the report was saved without what Roger needs: ${JSON.stringify(r).slice(0, 300)}`);
      t.ok(/Flashcards/.test(r.section || '') && /\[[^\]]+\]/.test(r.section || ''), `the report does not say it came from the flashcards and which card: section "${r.section}"`);
      t.ok((r.section || '').includes(front.slice(0, 20)), `the report does not quote the card on screen ("${front.slice(0, 40)}"): section "${r.section}"`);
    }
    await p.click('dialog[open] button');   // OK
    t.ok(!!(await p.$('.elfd-full [data-fd="show"]')), 'after sending the report the student lost the card they were studying');
  },
}];
