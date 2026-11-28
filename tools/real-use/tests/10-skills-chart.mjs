// 📈 How my skills grow (🎓 My progress) never counts a step the student has only started (problem report, 2ESOB, 27 Nov 2026: "El listening
// és un error"). The student checked only question 1 of a Listening (✓ Check per question, right), so its first try was saved as 1 / 8 with
// full: false (the other 7 count 0 for the mark until they are checked) and the chart drew Listening at 13 %.
// Since 28 Nov 2026 the chart sits in the 💪 My skills tab of 🎓 My progress (#progress-skills).
import { school, NOW, ALEX_WORK } from './world.mjs';

// Getting started's Listening checked question by question: only question 1 so far, right (as the site saves it, ls2-engine.js firsts())
const half = JSON.parse(ALEX_WORK.ls2GettingStarted4ESO);
half.done = Object.assign({}, half.done, { listen: false });
half.tries = { listen: { score: 1, max: 8, level: 'safe', date: '2026-11-24T09:28:15.748Z', per: 1, full: false } };
half.last = { listen: { score: 1, max: 8, level: 'safe', date: '2026-11-24T09:28:15.749Z' } };
half.all = { listen: { s: 0, n: 0 } };
// and Celebrations' Listening, finished: 8 / 8
const whole = JSON.parse(ALEX_WORK.ls2Celebrations4ESO);
whole.tries = { listen: { score: 8, max: 8, level: 'safe', date: '2026-10-28T17:00:00.000Z', per: 1, full: true } };
whole.last = { listen: { score: 8, max: 8, level: 'safe', date: '2026-10-28T17:00:00.001Z' } };

export default [{
  name: 'Skills chart: a Listening with only one question checked does not pull 🎧 Listening down in 📈 How my skills grow',
  async run(t) {
    const { alex } = await school(t, { work: Object.assign({}, ALEX_WORK, { ls2GettingStarted4ESO: JSON.stringify(half), ls2Celebrations4ESO: JSON.stringify(whole) }) });
    const p = await (await t.device(alex, { now: NOW })).open('today.html#progress-skills');
    await t.signedIn(p);
    await p.waitForSelector('.skg svg', { timeout: 20000 });
    const txt = await p.innerText('.skg');
    const m = txt.match(/Listening\s+(\d+)\s*%/);
    t.ok(m, `📈 How my skills grow should show 🎧 Listening (the Celebrations listening is finished) (it shows: ${txt.slice(0, 200)})`);
    t.ok(m && +m[1] === 100, `🎧 Listening should stay at 100 %: the listening with only one question checked is not finished yet (it shows ${m ? m[1] : '?'} %)`);
  },
}];
