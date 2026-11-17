// Towards Nativeness: lists the listening scripts of 4eso/towards-nativeness/data/*.js as JSON for voice.py.
// Usage (repo root): node tools/towards-nativeness/listenings.js > /tmp/tn-lines.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', '..', '4eso', 'towards-nativeness', 'data');
const out = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'tts.js')) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);
  const LP = ctx.window.LP; if (!LP) continue;
  for (const p of LP.panels) if (p.media && p.media.audio && p.media.script) out.push({ audio: p.media.audio, script: p.media.script });
}
process.stdout.write(JSON.stringify(out, null, 1));
