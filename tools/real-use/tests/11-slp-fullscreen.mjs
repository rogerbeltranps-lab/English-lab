// ⛶ Full screen of one learning path step stays at the top right while the student scrolls down the step (Roger, 27 Nov 2026: "the
// full screen button could be always at the top right even if the students scrolls down"; a 2ESOB student scrolled past the heading's
// button and reported "Aquí falta full screen").
import { school, NOW } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html';
const shown = (p) => p.evaluate(() => { const f = document.querySelector('.elslpfl'); return !!f && !f.hidden && getComputedStyle(f).display !== 'none'; });

export default [{
  name: 'Full screen button: stays at the top right while scrolling down a step, and opens the step full screen',
  async run(t) {
    const { alex } = await school(t);
    const p = await (await t.device(alex, { now: NOW })).open(LP3);
    await p.click('.tab[data-panel="read"]');
    t.ok(!(await shown(p)), 'at the top of the step only the heading\'s own ⛶ Full screen should show, not a second one');
    await p.evaluate(() => scrollTo(0, document.querySelector('.lp-panels>.panel.active').getBoundingClientRect().bottom + scrollY - innerHeight));
    await p.waitForTimeout(300);
    t.ok(await shown(p), 'after scrolling down the step, no ⛶ Full screen button at the top right');
    if (!(await shown(p))) return;
    const box = await p.locator('.elslpfl').boundingBox();
    t.ok(box && box.y >= 0 && box.y < 120 && box.x + box.width > (p.viewportSize()?.width || 1366) - 60, 'the floating ⛶ Full screen is not at the top right of the screen');
    await p.click('.elslpfl');
    t.ok(await p.evaluate(() => document.body.classList.contains('elslpfs')), 'pressing the floating ⛶ Full screen did not open the step full screen');
    t.ok(!(await shown(p)), 'in the full screen view the floating button should go (the view has its own ✕ Exit)');
  },
}];
