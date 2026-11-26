/* Towards Nativeness · 🧠 My flashcards: every line a card says (data/flashcards.js, TN_FLASH_DECKS) → cards-lines.json
   [{ k: ELVoice key, s: what the voice reads, deck }], for cards-eleven.mjs. Free; run in the repo root after a new list or step:
   node tools/towards-nativeness/cards-lines.cjs */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), D = path.join(ROOT, '4eso/towards-nativeness/data/'), V = require(path.join(ROOT, 'shared/js/el-voice.js'));
const w = { TN_LPS: [] };
for (const f of ['talking-to-your-tech', 'getting-things-done', 'telling-the-story', 'writing-like-a-teacher']) { new Function('window', fs.readFileSync(D + f + '.js', 'utf8'))(w); w.TN_LPS.push(w.LP); }
for (const f of ['my-latest-mistakes', 'flashcards']) new Function('window', fs.readFileSync(D + f + '.js', 'utf8'))(w);
const out = new Map();
for (const d of w.TN_FLASH_DECKS()) for (const c of d.cards) for (const t of [c.say, c.kind === 'v' ? c.ex : null]) {
  const s = t && V.speakable(t); if (s && !out.has(V.key(t))) out.set(V.key(t), { k: V.key(t), s, deck: d.id }); }
const list = [...out.values()];
fs.writeFileSync(path.join(__dirname, 'cards-lines.json'), JSON.stringify(list, null, 1) + '\n');
console.log(list.length, 'lines,', list.reduce((n, x) => n + x.s.length, 0), 'characters');
