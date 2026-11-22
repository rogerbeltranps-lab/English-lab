// ✏️ Spelling slips (Roger, 22 Nov 2026: "the feedback is wrong then because I didn't make a grammar mistake"). The block
// "SPELLING SLIPS … END SPELLING SLIPS" is the same in every ls2-engine.js and in lab/practice.html: this check makes sure the copies
// match, then runs the cases below. A slip gets "Almost! Check the spelling of ‘laod’."; a grammar or word mistake keeps its rule.
// Usage: node tools/spelling-hint/check.mjs   → exits 1 when a copy differs or a case fails.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILES = ['4eso/towards-nativeness/ls2-engine.js', '4eso/seasons-and-celebrations/ls2-engine.js', '2eso/free-time-live/ls2-engine.js', 'lab/practice.html'];
const grab = f => { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'), a = s.indexOf('  /* ✏️ SPELLING SLIPS'), b = s.indexOf('  /* END SPELLING SLIPS */');
  if (a < 0 || b < 0) throw new Error(f + ': spelling block not found'); return s.slice(a, b); };
let fails = 0;
const blocks = FILES.map(grab);
blocks.forEach((b, i) => { if (b !== blocks[0]) { fails++; console.log('✗ ' + FILES[i] + ': the spelling block differs from ' + FILES[0]); } });

// the same norm / expand / esc as the pages
const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
const expand = s => (' ' + norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
const esc = s => String(s);
const { spellSlips, spellHint } = new Function('norm', 'expand', 'esc', blocks[0] + '\nreturn { spellSlips, spellHint };')(norm, expand, esc);
const hint = (q, a, t) => { const r = spellSlips(q, a, t); return r ? spellHint(r, false).replace(/<[^>]+>/g, '') : null; };

const AGES = ['It’s taking ages to load', 'It takes ages to load', 'It’s taking a long time to load', 'It takes a long time to load'];
const NAME = ['It turns out the file had a different name', 'Turns out the doc had another name'];
const CASES = [   // [question, answers, typed, the hint (null = no spelling hint: the grammar rule stays)]
  ['', AGES, 'It takes ages to laod.', 'Almost! Check the spelling of ‘laod’.'],
  ['', NAME, 'Turns out the doc had an other name.', 'Almost! ‘an other’ is one word.'],
  ['', NAME, 'It turns out the file had a diferent name', 'Almost! Check the spelling of ‘diferent’.'],
  ['', AGES, 'Its taking ages to load', 'Almost! Check the apostrophes (’).'],
  ['', ['There are a lot of people'], 'There are alot of people', 'Almost! ‘alot’ is two words.'],
  ['She ___ (watch) TV now.', ['is watching'], 'is wacthing', 'Almost! Check the spelling of ‘wacthing’.'],
  ['She ___ (watch) TV now.', ['is watching'], 'She is watchin TV now', 'Almost! Check the spelling of ‘watchin’.'],
  ['', ['beautiful'], 'beautifull', 'Almost! Check the spelling of ‘beautifull’.'],
  ['', ['What exactly did you do'], 'What exactly did you od', 'Almost! Check the spelling of ‘od’.'],
  // grammar and word mistakes keep their rule
  ['', AGES, 'It take ages to load.', null],
  ['', AGES, 'It takes ages for load', null],
  ['She ___ (watch) TV now.', ['is watching'], 'is watch', null],
  ['I ___ to school every day.', ['go'], 'goes', null],
  ['We play ___ Sunday.', ['on'], 'in', null],
  ['', ['The menu is at the top right'], 'The menu is on the top right', null],
  ['', ['I haven’t tried it on my phone yet'], 'I havent tried it in my phone yet', null],
  ['', ['their house'], 'there house', null],
  ['', ['I bought it'], 'I brought it', null],
  ['', ['How long will I have to wait'], 'How long I will have to wait', null],
  ['', ['I worked yesterday'], 'I work yesterday', null],
  ['', AGES, 'xyz', null],
];
for (const [q, a, t, want] of CASES) { const got = hint(q, a, t);
  if (got !== want) { fails++; console.log('✗ "' + t + '": ' + JSON.stringify(got) + ', expected ' + JSON.stringify(want)); } }
console.log(fails ? fails + ' problem(s)' : '✓ ' + FILES.length + ' copies match, ' + CASES.length + ' cases right');
process.exit(fails ? 1 : 0);
