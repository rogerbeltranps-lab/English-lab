// Towards Nativeness: lists the ✍️ micro-dictation bits (p.chunks) of 4eso/towards-nativeness/data/*.js as JSON for dictation.py,
// each with its key (tools/tts/tts-key.js, the same FNV-1a the engine's playRec uses), and rewrites data/tts.js with every key,
// so ▶ Listen and 🐢 Slower play a recording (audio/tts/<key>.mp3 and -slow.mp3) instead of the browser voice, which stays silent
// on the iPhone (Roger, 22 Nov 2026: "It doesn't work").
// Usage (repo root): node tools/towards-nativeness/dictation.js > /tmp/tn-dict.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const ttsKey = require('../tts/tts-key.js');
const ls = path.join(__dirname, '..', '..', '4eso', 'towards-nativeness'), dir = path.join(ls, 'data');
const out = [], seen = new Set();
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'tts.js').sort()) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
  const LP = ctx.window.LP; if (!LP || !LP.panels) continue;
  for (const p of LP.panels) for (const text of p.chunks || []) {
    const key = ttsKey(text); if (seen.has(key)) continue; seen.add(key); out.push({ key, text });
  }
}
fs.writeFileSync(path.join(dir, 'tts.js'), '/* Towards Nativeness: the recorded lines (audio/tts/<key>.mp3 + -slow.mp3, Kokoro Heart, tools/towards-nativeness/dictation.py):\n' +
  '   the ✍️ micro-dictation bits. Lines not listed here (Talk, listen and complete) use the browser voice. */\n' +
  'window.LS2_TTS = new Set(' + JSON.stringify(out.map(x => x.key)) + ');\n');
process.stdout.write(JSON.stringify(out, null, 1));
