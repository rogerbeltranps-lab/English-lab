// Towards Nativeness · 🧠 My flashcards in the ElevenLabs voice "Chris" (Roger, 25 Nov 2026: "use eleven labs for the flashcards too";
// Chris is his Towards Nativeness voice, as in 🗣 Shadowing). PAID: Flash v2.5 ≈ 0.5 credit per character, eleven_v3 ≈ 1. Run only
// after Roger's OK for that generation. Each line of cards-lines.json (cards-lines.cjs) is recorded once into
// 4eso/towards-nativeness/audio/cards/<key>.mp3 (a rerun never pays twice) and audio/cards/index.js lists them (window.TN_CARD_VOICE);
// a card with no recording keeps Kokoro Heart. Needs only Node 18+ (no ffmpeg), so it runs on the PC, where the key is.
// Usage (repo root): ELEVENLABS_API_KEY=... node tools/towards-nativeness/cards-eleven.mjs [--dry] [--decks tn-slips,tn-prepositions]
//   EL_VOICE_ID (default: the voice named "Chris" in the account), EL_MODEL (default eleven_flash_v2_5)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, '..', '..', '4eso', 'towards-nativeness', 'audio', 'cards');
const MODEL = process.env.EL_MODEL || 'eleven_flash_v2_5';
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const decks = arg('--decks') ? arg('--decks').split(',') : null;
const KEY = process.env.ELEVENLABS_API_KEY;
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'content-type': 'application/json', ...(o.headers || {}) } });
const lines = JSON.parse(fs.readFileSync(path.join(DIR, 'cards-lines.json'), 'utf8')).filter(x => !decks || decks.includes(x.deck));
fs.mkdirSync(OUT, { recursive: true });
const file = k => path.join(OUT, k + '.mp3');
const todo = lines.filter(x => !fs.existsSync(file(x.k)));
const chars = todo.reduce((n, x) => n + x.s.length, 0);
console.log(lines.length, 'lines,', todo.length, 'to record,', chars, 'characters ≈', Math.round(chars * (/flash|turbo/.test(MODEL) ? 0.5 : 1)), 'credits (' + MODEL + ')');
const index = () => { const ks = fs.readdirSync(OUT).filter(f => /^[0-9a-f]{8}\.mp3$/.test(f)).map(f => f.slice(0, 8)).sort();
  fs.writeFileSync(path.join(OUT, 'index.js'), '/* Towards Nativeness flashcard recordings (ElevenLabs Chris), made by tools/towards-nativeness/cards-eleven.mjs. Do not edit by hand. */\nwindow.TN_CARD_VOICE = new Set(' + JSON.stringify(ks) + ');\n');
  console.log('index.js:', ks.length, 'recordings'); };
if (process.argv.includes('--dry')) process.exit(0);
if (todo.length) {
  if (!KEY) { console.error('Set ELEVENLABS_API_KEY'); process.exit(1); }
  let voice = process.env.EL_VOICE_ID;
  if (!voice) {
    const r = await (await api('/v1/voices')).json();
    const v = (r.voices || []).find(x => /^Chris\b/i.test(x.name));
    if (!v) { console.error('No voice named Chris in this account; set EL_VOICE_ID'); process.exit(1); }
    voice = v.voice_id; console.log('voice', v.name, voice);
  }
  let n = 0;
  for (const x of todo) {
    const body = { text: x.s, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } };
    const r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, { method: 'POST', body: JSON.stringify(body) });
    if (!r.ok) { console.error('failed:', x.s, r.status, await r.text()); index(); process.exit(1); }
    fs.writeFileSync(file(x.k), Buffer.from(await r.arrayBuffer()));
    if (++n % 25 === 0) console.log(n, '/', todo.length);
  }
}
index();
