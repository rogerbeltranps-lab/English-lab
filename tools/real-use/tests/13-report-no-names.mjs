// 🕶 A problem report's 📸 screenshot never shows a name (Roger, 27 Nov 2026, "Yes"; REQUIREMENTS § 8): the picture hides the
// student's name under the menu and in "Hi, Name", while the page itself still shows it. The test wraps html2canvas so it can read
// the copy of the page that would be drawn.
import { school, NOW } from './world.mjs';

export default [{
  name: 'Report screenshot: 📸 Capture this screen hides the student\'s name, the page keeps it',
  async run(t) {
    const { alex } = await school(t);
    const d = await t.device(alex, { now: NOW });
    const p = await d.open('today.html');
    await p.waitForFunction(() => /Alex/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
    t.ok(/Alex/.test(await p.innerText('body')), 'the board does not show the student\'s name at all, so there is nothing to hide (the test cannot check anything)');
    await p.evaluate(() => {
      window.html2canvas = async (el, o) => {
        const c = document.implementation.createHTMLDocument('shot'); c.body.innerHTML = document.body.innerHTML;
        if (o && o.onclone) o.onclone(c);
        window.__shot = c.body.textContent;
        const cv = document.createElement('canvas'); cv.width = cv.height = 8; return cv;
      };
    });
    await p.click('#el-cloud-bar [aria-label="Report a problem"]');
    await p.click('dialog[open] [data-cap]');
    await p.waitForFunction(() => typeof window.__shot === 'string', null, { timeout: 10000 }).catch(() => {});
    const shot = await p.evaluate(() => window.__shot);
    t.ok(typeof shot === 'string', 'pressing 📸 Capture this screen did not take a picture');
    if (typeof shot === 'string') {
      t.ok(!/\bAlex\b|\bSample\b/.test(shot), `the screenshot still shows the student's name: "…${(shot.match(/.{0,40}(Alex|Sample).{0,40}/) || [''])[0]}…"`);
      t.ok(/•••/.test(shot), 'the screenshot has no ••• where the name was');
    }
    t.ok(/Alex/.test(await p.innerText('body')), 'taking the screenshot took the name off the student\'s own page');
  },
}];
