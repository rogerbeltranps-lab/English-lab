// ✅ Answer check (Roger, 22 Nov 2026: "I'm detecting a lot of mistakes, do students have the same problem?"). The block
// "ANSWER CHECK … END ANSWER CHECK" (fits: when a typed answer counts) is the same in both LS2 engines and in 4 ESO Getting started:
// this check makes sure the copies match, then runs the cases below.
// Usage: node tools/answer-check/check.mjs   → exits 1 when a copy differs or a case fails.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILES = ['2eso/free-time-live/ls2-engine.js', '4eso/seasons-and-celebrations/ls2-engine.js', '4eso/seasons-and-celebrations/getting-started.html'];
const grab = f => { const s = fs.readFileSync(path.join(ROOT, f), 'utf8'), a = s.indexOf('  /* ✅ ANSWER CHECK'), b = s.indexOf('  /* END ANSWER CHECK */');
  if (a < 0 || b < 0) throw new Error(f + ': answer check block not found'); return s.slice(a, b); };
let fails = 0;
const blocks = FILES.map(grab);
blocks.forEach((b, i) => { if (b !== blocks[0]) { fails++; console.log('✗ ' + FILES[i] + ': the answer check block differs from ' + FILES[0]); } });

const norm = s => String(s || '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”"]/g, '').replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
const expand = s => (' ' + norm(s).replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/n't\b/g, ' not').replace(/'re\b/g, ' are').replace(/'ll\b/g, ' will').replace(/'m\b/g, ' am').replace(/'ve\b/g, ' have').replace(/'d\b/g, ' would').replace(/'s\b/g, ' is') + ' ').replace(/\s+/g, ' ');
const { fits } = new Function('norm', 'expand', blocks[0] + '\nreturn { fits };')(norm, expand);

const CASES = [   // [question, answers, typed, counts?]
  ['I ___ (watch) a basketball match right now.', ['am watching', "'m watching"], 'am watching', true],
  ['I ___ (watch) a basketball match right now.', ['am watching', "'m watching"], "I'm watching a basketball match right now.", true],
  ['I ___ (watch) a basketball match right now.', ['am watching', "'m watching"], 'watching', false],
  ['I ___ (be) thirteen years old.', ['am', "'m"], 'I am', true],
  ['It’s ___ today: the clouds are grey. (ennuvolat)', ['cloudy'], 'It’s cloudy today, the clouds are gray.', true],   // US spelling
  ['It’s ___ today: the clouds are grey. (ennuvolat)', ['cloudy'], 'It’s cloud today', false],
  ['We l_____ to the radio in the car. (escoltar)', ['listen'], 'listen', true],
  ['We l_____ to the radio in the car. (escoltar)', ['listen'], 'isten', true],   // only the letters still missing
  ['We l_____ to the radio in the car. (escoltar)', ['listen'], 'We listen to the radio in the car', true],
  ['We l_____ to the radio in the car. (escoltar)', ['listen'], 'listening', false],
  ['To remember and honour an important event: to c___', ['commemorate'], 'to commemorate', true],
  ['To remember and honour an important event: to c___', ['commemorate'], 'ommemorate', true],
  ['25/12 → on the ___ of December', ['twenty-fifth', 'twenty fifth', '25th'], 'twenty-fifth', true],
  ['25 December = the twenty-___ of December', ['fifth'], 'fifth', true],
  ['25 December = the twenty-___ of December', ['fifth'], 'ifth', false],   // "twenty-" is not a first-letter cue
  ['My sister ___ (practise) the piano.', ['practises'], 'practices', false],   // a grammar ending is not a spelling variant
  ['I ___ the piano every day. (practicar)', ['practise', 'practice'], 'practice', true],
  ['My favourite colour is blue: I ___ it.', ['love'], 'love', true],
  ['___ you like ___ (play) online? — Yes, I do.', ['do playing', 'do to play'], 'do to play', true],
  ['He ___ (not / like) video games.', ["doesn't like", 'does not like'], "don't like", false],
];
for (const [q, a, t, want] of CASES) { const got = fits(q, a, t); if (got !== want) { fails++; console.log('✗ ' + JSON.stringify(t) + ' for "' + q + '": ' + got + ', expected ' + want); } }
console.log(fails ? fails + ' problem(s)' : '✓ ' + FILES.length + ' copies identical, ' + CASES.length + ' cases pass');
process.exit(fails ? 1 : 0);
