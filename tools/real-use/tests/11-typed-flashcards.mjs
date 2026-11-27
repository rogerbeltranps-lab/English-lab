// ✍ A flashcard that asks to write is really written (Roger, 27 Nov 2026: "pots fer que a les flashcards que diu escriu sigui de veritat que
// escriguin?"): on 2 ESO's "Write the -ing form" cards the student types the answer and presses ✓ Check. A wrong answer turns the card over
// with "✗ You wrote: …" and Again outlined, a right one (capitals and a full stop don't matter) with "✓ Right!", and a spelling slip names the
// word once before the next check counts.
import { school, NOW, LS2 } from './world.mjs';
const P2 = (n) => '2eso/ls2-' + n;
const ING = { sit: 'sitting', make: 'making', read: 'reading', run: 'running', get: 'getting', write: 'writing', swim: 'swimming', eat: 'eating', dance: 'dancing', take: 'taking' };

export default [{
  name: 'Flashcards: a "Write the -ing form" card is typed and checked (wrong, spelling slip, right) before it turns over',
  async run(t) {
    const { pau } = await school(t, { extra: { ['ls/' + LS2]: { status: 'open', groups: ['2ESOA', '2ESOB'],
      open: { '2ESOA': [P2('getting-started'), P2('my-free-time'), P2('what-are-they-doing')], '2ESOB': [] } } } });
    const cb = await t.device(pau, { now: NOW });
    const p = await cb.open('lab/practice.html#deck');
    await p.waitForSelector('[data-fd="ls"]', { timeout: 15000 });
    await p.click('[data-fd="ls"][data-v="' + LS2 + '"]');
    const part = await p.$$eval('[data-fd="part"]', (a) => (a.map((e) => e.dataset.p).find((x) => /spell -ing|escriu la -ing/i.test(x)) || ''));
    t.ok(part, 'the LS2 deck has no "How to spell -ing" part for a Base student with What are they doing? open');
    if (!part) return;
    await p.click(`[data-fd="part"][data-p="${part}"]`);
    const verb = async () => ((await p.$eval('.elfd-full .elfd-front', (e) => e.textContent).catch(() => '')).match(/form: (\w+)/) || [])[1];
    const toTyped = async () => { for (let i = 0; i < 10; i++) { if (await p.$('#elfdIn') && ING[await verb()]) return true;
      if (await p.$('#elfdIn')) { await p.fill('#elfdIn', 'zzz'); await p.click('[data-fd="check"]'); } else await p.click('[data-fd="show"]');
      await p.click('[data-fd="ans"][data-v="4"]'); } return false; };

    t.ok(await toTyped(), 'no "Write the -ing form" card with a box to type in came up (it still only turns over?)');
    t.ok(!(await p.$('[data-fd="show"], [data-fd="idk"]')), 'a "Write…" card still has a button that turns it over without writing');
    await p.fill('#elfdIn', 'gone');
    await p.click('[data-fd="check"]');
    const no = await p.textContent('.elfd-res').catch(() => '');
    t.ok(/You wrote: gone/.test(no), `a wrong answer should turn over with "✗ You wrote: gone" (it shows: ${no || 'nothing'})`);
    t.ok(!!(await p.$('.elfd-rate .a1.sug')), 'after a wrong answer, Again is not outlined');
    await p.click('[data-fd="ans"][data-v="1"]');

    t.ok(await toTyped(), 'a second "Write the -ing form" card did not come up');
    const right = ING[await verb()], slip = right.slice(0, -3) + 'nig';
    await p.fill('#elfdIn', slip);
    await p.press('#elfdIn', 'Enter');
    const fb = await p.textContent('.elfd-fbk').catch(() => '');
    t.ok(/Check the spelling of ‘/.test(fb) && !(await p.$('.elfd-res')), `a spelling slip (${slip}) should say "Check the spelling" and let them try again (it shows: ${fb || 'nothing'})`);
    await p.fill('#elfdIn', right.toUpperCase() + '.');
    await p.press('#elfdIn', 'Enter');
    const ok = await p.textContent('.elfd-res').catch(() => '');
    t.ok(/Right!/.test(ok), `the right answer (${right.toUpperCase()}.) should turn over with "✓ Right!" (it shows: ${ok || 'nothing'})`);
    await p.click('[data-fd="ans"][data-v="3"]');
  },
}];
