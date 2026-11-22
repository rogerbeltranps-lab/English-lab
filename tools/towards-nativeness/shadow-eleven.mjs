// Towards Nativeness · 🗣 Shadowing clips in the ElevenLabs voice "Chris" (Roger, 22 Nov 2026: "use the best American man voice";
// he picked Chris, natural and casual). PAID: about 1 credit per character (all 74 sentences ≈ 3,600). Run only after Roger's OK.
// Each sentence is recorded once into tools/towards-nativeness/eleven-cache/<hash>.mp3 (kept, so a rerun never pays twice), then each
// clip is put together like shadow.py does: 0.4 s lead, sentence, 0.9 s pause, … → 4eso/towards-nativeness/audio/<file>-chris.mp3 and
// -chris-slow.mp3 (atempo 0.8, free) + <file>-chris.json with the sentence times, and data/shadow.js is rewritten with the
// hand-written marks of shadow-marks.json. Needs ffmpeg + ffprobe.
// Usage (repo root): node tools/towards-nativeness/shadow-lines.js > tn-shadow.json
//                    ELEVENLABS_API_KEY=... node tools/towards-nativeness/shadow-eleven.mjs tn-shadow.json [--dry]
//   --record-only: only records the sentences into eleven-cache/ (no ffmpeg needed, e.g. on the PC); then run again without it
//   where ffmpeg is installed (the cloud) to build the clips from the cache for free.
//   EL_VOICE_ID (default: the voice named "Chris" in the account), EL_MODEL (default eleven_v3)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..', '..');
const LS = path.join(ROOT, '4eso', 'towards-nativeness');
const CACHE = path.join(DIR, 'eleven-cache');
const SLOW = 0.8, LEAD = 0.4, GAP = 0.9;
const MODEL = process.env.EL_MODEL || 'eleven_v3';
const dry = process.argv.includes('--dry');
const items = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const MARKS = JSON.parse(fs.readFileSync(path.join(DIR, 'shadow-marks.json'), 'utf8'));
const KEY = process.env.ELEVENLABS_API_KEY;
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'content-type': 'application/json', ...(o.headers || {}) } });
const hash = s => crypto.createHash('sha1').update(MODEL + '|' + s).digest('hex').slice(0, 16);
const dur = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const arrows = s => s.replace(/,/g, ' ↗,').trimEnd() + (/\?$/.test(s.trim()) && /^(is|are|am|was|were|do|does|did|can|could|will|would|should|shall|have|has|had|may|might|must)n?\b/i.test(s.trim()) ? ' ↗' : ' ↘');

fs.mkdirSync(CACHE, { recursive: true });
const all = [...new Set(items.flatMap(i => i.sentences))];
const todo = all.filter(s => !fs.existsSync(path.join(CACHE, hash(s) + '.mp3')));
console.log(all.length, 'sentences,', todo.length, 'to record,', todo.reduce((n, s) => n + s.length, 0), 'characters');
if (dry) process.exit(0);
if (todo.length) {
  if (!KEY) { console.error('Set ELEVENLABS_API_KEY'); process.exit(1); }
  let voice = process.env.EL_VOICE_ID;
  if (!voice) {
    const r = await (await api('/v1/voices')).json();
    const v = (r.voices || []).find(x => /^Chris\b/i.test(x.name));
    if (!v) { console.error('No voice named Chris in this account; set EL_VOICE_ID'); process.exit(1); }
    voice = v.voice_id; console.log('voice', v.name, voice);
  }
  for (const s of todo) {
    const body = { text: s, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } };
    const r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
    if (!r.ok) { console.error('failed:', s, r.status, await r.text()); process.exit(1); }
    fs.writeFileSync(path.join(CACHE, hash(s) + '.mp3'), Buffer.from(await r.arrayBuffer()));
    console.log('recorded:', s);
  }
}
if (process.argv.includes('--record-only')) { console.log('recorded; build the clips where ffmpeg is installed'); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(DIR, '.tmp-'));
const sil = (n, t) => { const f = path.join(tmp, n + '.wav'); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(t), f]); return f; };
const lead = sil('lead', LEAD), gap = sil('gap', GAP);
const clips = {};
for (const it of items) {
  const parts = [lead], cues = []; let t = LEAD;
  it.sentences.forEach((s, i) => {
    const w = path.join(tmp, it.key + i + '.wav');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(CACHE, hash(s) + '.mp3'), '-ac', '1', '-ar', '44100', w]);
    const d = dur(w); parts.push(w, gap); cues.push([+t.toFixed(2), +(t + d).toFixed(2)]); t += d + GAP;
  });
  const list = path.join(tmp, it.key + '.txt');
  fs.writeFileSync(list, parts.map(p => "file '" + p.replace(/'/g, "'\\''") + "'").join('\n'));
  const base = path.join(LS, 'audio', it.file + '-chris');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '44100', '-b:a', '64k', base + '.mp3']);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-filter:a', 'atempo=' + SLOW, '-ac', '1', '-ar', '44100', '-b:a', '64k', base + '-slow.mp3']);
  const end = +t.toFixed(2);
  fs.writeFileSync(base + '.json', JSON.stringify({ sentences: it.sentences, cues, end }));
  clips[it.key] = { title: it.title, src: 'audio/' + it.file + '-chris.mp3', slow: 'audio/' + it.file + '-chris-slow.mp3', t: [0, end], ts: [0, +(end / SLOW).toFixed(2)],
    lines: it.sentences.map(s => [s]), marks: it.sentences.map(s => [MARKS[s] || (console.log('no marks, arrows only:', s), arrows(s))]),
    cues: cues.map(([a, b]) => [a, b, +(a / SLOW).toFixed(2), +(b / SLOW).toFixed(2)]) };
  console.log('built', it.file + '-chris', end + ' s');
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(LS, 'data', 'shadow.js'), '/* Towards Nativeness · 🗣 Shadowing clips, made by tools/towards-nativeness/shadow-eleven.mjs (ElevenLabs, Chris). Do not edit by hand:\n'
  + '   change the sentences in the learning path (✨ Make it idiomatic) or in My latest mistakes, add their marks to shadow-marks.json and run the tool again. */\n'
  + 'window.TN_SHADOW = ' + JSON.stringify(clips, null, 1) + ';\n');
console.log('wrote data/shadow.js with', Object.keys(clips).length, 'clips');
