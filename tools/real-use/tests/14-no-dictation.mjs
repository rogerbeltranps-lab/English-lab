// ✋ No dictation in writing boxes (Roger, 28 Nov 2026: a writing of 521 characters went in with 26 keys in 3 minutes; "lock it").
// A writing box of an activity takes text only a few letters at a time, as a keyboard types it. A sentence that arrives in one go
// (dictation on a Chromebook or a phone, swipe typing, a word suggestion: here the browser's own insertText, which is what they send)
// is refused, the student sees why, and the writing log counts the refused characters for the marking sheet. Typing still works, and
// moving their own text between boxes never counts as pasted.
import { school, NOW } from './world.mjs';
const LP3 = '4eso/seasons-and-celebrations/where-traditions-come-from.html';

export default [{
  name: 'Writing boxes refuse dictated or swiped text (a whole chunk at once) but take typing; the writing log counts what was refused, never their own text moved',
  async run(t) {
    const { alex } = await school(t);
    for (const size of [undefined, t.PHONE]) {
      const where = size ? 'on the phone' : 'on the Chromebook';
      const d = await t.device(alex, { now: NOW, ...(size ? { size } : {}) });
      const p = await d.open(LP3);
      await p.click('.tab[data-panel="chart"]');
      const box = p.locator('#chartFields textarea').first();
      await box.click();
      const cdp = await p.context().newCDPSession(p);
      await cdp.send('Input.insertText', { text: 'She values her family because she smiles.' });
      t.ok((await box.inputValue()) === '', `${where}, a dictated sentence went into the writing box (it holds: "${await box.inputValue()}")`);
      t.ok(await p.locator('.el-type-tip').isVisible().catch(() => false), `${where}, the student was not told why the dictated text did not appear`);
      await p.keyboard.type('She values her family.');
      t.ok((await box.inputValue()) === 'She values her family.', `${where}, typing key by key no longer works in the writing box (it holds: "${await box.inputValue()}")`);
      const log = await p.evaluate(() => window.elTyping && elTyping.sum('#chartFields'));
      t.ok(log && log.c >= 40, `${where}, the writing log does not count the refused characters (log: ${JSON.stringify(log)})`);
      // moving their own text (cut it from one box, paste it into another) is not pasting (Roger, 28 Nov 2026: a Reading log was sent
      // back as "pasted 251 of 315 characters" for answers moved between boxes)
      if (!size) {
        await box.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Control+X');
        const box2 = p.locator('#chartFields textarea').nth(1); await box2.click(); await p.keyboard.press('Control+V');
        const moved = await box2.inputValue();
        const log2 = await p.evaluate(() => window.elTyping && elTyping.sum('#chartFields'));
        t.ok(moved !== 'She values her family.' || (log2 && !log2.p), `moving their own text into another box counts as pasted characters (log: ${JSON.stringify(log2)})`);
        t.ok(moved === 'She values her family.', `their own text could not be moved to another box with cut and paste (the box holds: "${moved}")`);
      }
    }
  },
}];
