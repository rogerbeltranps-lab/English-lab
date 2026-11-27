// ↵ Enter starts a new line in "Your own example" (Roger, 27 Nov 2026: "Enter a new line"; problem report, 4ESOA: Enter checked the
// student's own sentence before it was finished, twice). The ✏️ own-example box of a grammar step holds more than one line: Enter adds a
// line and checks nothing, only its ✓ Check checks it, and the two lines come back after a reload. In a fill-the-gap box Enter still checks.
import { school, NOW, LS4, ALEX_WORK, lpState } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html', KEY = 'ls2Traditions4ESO';

// Alex's work without LP3's Grammar · -ed / -ing, so the step opens empty
function work() {
  const s = JSON.parse(ALEX_WORK[KEY]); delete s.done.grammarFeel; if (s.doneAt) delete s.doneAt.grammarFeel;
  return Object.assign({}, ALEX_WORK, { [KEY]: JSON.stringify(s) });
}

export default [{
  name: 'Own example: Enter starts a new line (it checks nothing), ✓ Check checks it, and both lines come back after a reload',
  async run(t) {
    const { alex } = await school(t, { work: work() });
    for (const size of [undefined, t.CHROMEBOOK_FULL, t.PHONE]) {
      const where = size === t.PHONE ? 'on the phone' : size ? 'on the Chromebook in full screen (1366 × 768)' : 'on the Chromebook (1366 × 640)';
      const d = await t.device(alex, { now: NOW, ...(size ? { size } : {}) });
      const p = await d.open(LP3);
      await p.click('.tab[data-panel="grammarFeel"]');
      const box = p.locator('#grammarFeelList textarea.typed.own:visible').first();
      t.ok(await box.waitFor({ timeout: 8000 }).then(() => true, () => false), `${where}, the ✏️ Your own example box of Grammar · -ed / -ing is not a box that takes more than one line`);
      if (!(await box.count())) continue;
      const id = await box.getAttribute('id'), fb = '#' + id.replace(/(\d+)$/, 'f$1');
      // the box fits the screen and its ✓ Check sits under it, not squeezed beside it
      const g = await p.evaluate((i) => { const b = document.getElementById(i), c = b.parentElement.querySelector('.el-one'), r = b.getBoundingClientRect(), k = c && c.getBoundingClientRect();
        return { fits: r.right <= innerWidth + 1 && r.width > 200, under: !!k && k.top >= r.bottom - 1 }; }, id);
      t.ok(g.fits, `${where}, the own-example box is too narrow or wider than the screen`);
      t.ok(g.under, `${where}, the ✓ Check of the own-example box is not under the box`);
      if (size) continue;   // the typing is checked once, on the Chromebook students use

      await box.click();
      await p.keyboard.type('I was so excited at the parade.');
      await p.keyboard.press('Enter');
      await p.keyboard.type('The fireworks were amazing.');
      const v = await box.inputValue();
      t.ok(v === 'I was so excited at the parade.\nThe fireworks were amazing.', `Enter did not start a new line in the own-example box (the box holds: ${JSON.stringify(v)})`);
      t.ok(!(await p.textContent(fb)).trim(), `Enter checked the own example before ✓ Check was pressed (it says: "${(await p.textContent(fb)).trim()}")`);
      await p.locator(`button.el-one[data-i="${id.match(/\d+$/)[0]}"][data-one="grammarFeel"]`).click();
      t.ok(/Well done/.test(await p.textContent(fb)), `✓ Check did not accept a two-line own example with an -ed and an -ing word (it says: "${(await p.textContent(fb)).trim()}")`);

      // a fill-the-gap box of the same step: Enter still checks it
      const gap = p.locator('#grammarFeelList input.typed:not([readonly]):visible').first();
      const gid = await gap.getAttribute('id');
      await gap.fill('bored'); await gap.press('Enter');
      t.ok((await p.textContent('#' + gid.replace(/(\d+)$/, 'f$1'))).trim(), 'in a fill-the-gap box, Enter no longer checks the answer');

      // saved with its two lines, and back after a reload
      const st = await t.until(() => lpState(t, alex.uid, LS4, KEY), (s) => s && /parade\.\nThe fireworks/.test(JSON.stringify(s).replace(/\\n/g, '\n')));
      t.ok(st, 'the two-line own example was not saved to the account');
      const q = await d.open(LP3);
      await q.click('.tab[data-panel="grammarFeel"]');
      const back = await q.locator('#' + id).inputValue().catch(() => '');
      t.ok(back === v, `after a reload the own example came back as ${JSON.stringify(back)}, not with its two lines`);
    }
  },
}];
