// Towards Nativeness · the 4 listenings read by ElevenLabs men's voices (Roger, 25 Nov 2026: "I wanted a man"; he approved Chris,
// Brian and George and about 5,000 credits; the women characters became men: Claire → James, Anna → Sam, Montse → Pere, Laia → Oriol).
// PAID: about 1 credit per character. Run only after Roger's OK for that generation.
// Each line is recorded once into tools/towards-nativeness/eleven-cache/<hash>.mp3 (kept, so a rerun never pays twice), then each
// listening is put together like voice.py does (0.45 s between turns) → 4eso/towards-nativeness/audio/<name>-eleven.mp3 and
// -eleven-slow.mp3 (atempo 0.8, free), and the learning path's media.audio is pointed at it. Needs ffmpeg for the build step.
// Usage (repo root): node tools/towards-nativeness/listenings-eleven.mjs [--dry]
//   --record-only: only records the lines into eleven-cache/ (no ffmpeg needed, e.g. on Roger's PC, key in ELEVENLABS_API_KEY);
//   then run again without it where ffmpeg is installed (the cloud) to build the files from the cache for free.
//   EL_MODEL (default eleven_v3)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const LS = path.join(DIR, '..', '..', '4eso', 'towards-nativeness');
const DATA = path.join(LS, 'data');
const CACHE = path.join(DIR, 'eleven-cache');
const SLOW = 0.8, GAP = 0.45;
const MODEL = process.env.EL_MODEL || 'eleven_v3';
// speaker → ElevenLabs voice name (default voices of every account). Two speakers in one dialogue never share a voice.
const VOICE = { James: 'Chris', Marc: 'Brian', Sam: 'Brian', Tom: 'Chris', Host: 'Brian', Jordi: 'Chris', Pere: 'Chris', David: 'George', Oriol: 'Brian' };
const dry = process.argv.includes('--dry');
const KEY = process.env.ELEVENLABS_API_KEY;
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'content-type': 'application/json', ...(o.headers || {}) } });
const hash = (v, s) => crypto.createHash('sha1').update(MODEL + '|' + v + '|' + s).digest('hex').slice(0, 16);
const dur = f => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

// The listenings: every panel with media.audio + media.script in the learning paths' data files.
const items = [];
for (const f of fs.readdirSync(DATA).filter(f => f.endsWith('.js') && f !== 'tts.js')) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(DATA, f), 'utf8'), ctx);
  const LP = ctx.window.LP; if (!LP) continue;
  for (const p of LP.panels) if (p.media && p.media.audio && p.media.script) items.push({ file: f, audio: p.media.audio, script: p.media.script });
}
const base = a => a.replace(/(-eleven)?\.mp3$/, '');
const lines = items.flatMap(it => it.script.map(([who, t]) => {
  if (!VOICE[who]) { console.error('No voice for speaker', who, 'in', it.file); process.exit(1); }
  return { voice: VOICE[who], text: t };
}));
const todo = lines.filter(l => !fs.existsSync(path.join(CACHE, hash(l.voice, l.text) + '.mp3')));
console.log(items.length, 'listenings,', lines.length, 'lines,', todo.length, 'to record,', todo.reduce((n, l) => n + l.text.length, 0), 'characters');
if (dry) process.exit(0);
fs.mkdirSync(CACHE, { recursive: true });
if (todo.length) {
  if (!KEY) { console.error('Set ELEVENLABS_API_KEY'); process.exit(1); }
  const r = await (await api('/v1/voices')).json();
  const ids = {};
  for (const name of new Set(Object.values(VOICE))) {
    const v = (r.voices || []).find(x => new RegExp('^' + name + '\\b', 'i').test(x.name));
    if (!v) { console.error('No voice named', name, 'in this account'); process.exit(1); }
    ids[name] = v.voice_id; console.log('voice', v.name, v.voice_id);
  }
  for (const l of todo) {
    const body = { text: l.text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75 } };
    const res = await api(`/v1/text-to-speech/${ids[l.voice]}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) { console.error('failed:', l.text, res.status, await res.text()); process.exit(1); }
    fs.writeFileSync(path.join(CACHE, hash(l.voice, l.text) + '.mp3'), Buffer.from(await res.arrayBuffer()));
    console.log('recorded (' + l.voice + '):', l.text.slice(0, 60));
  }
}
if (process.argv.includes('--record-only')) { console.log('Done: all lines recorded.'); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(DIR, '.tmp-'));
const gap = path.join(tmp, 'gap.wav');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(GAP), gap]);
for (const it of items) {
  const parts = [];
  it.script.forEach(([who, t], i) => {
    const w = path.join(tmp, i + '.wav');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(CACHE, hash(VOICE[who], t) + '.mp3'), '-ac', '1', '-ar', '44100', w]);
    parts.push(w, gap);
  });
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map(p => "file '" + p.replace(/'/g, "'\\''") + "'").join('\n'));
  const out = base(it.audio) + '-eleven';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '44100', '-b:a', '64k', path.join(LS, out + '.mp3')]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-filter:a', 'atempo=' + SLOW, '-ac', '1', '-ar', '44100', '-b:a', '64k', path.join(LS, out + '-slow.mp3')]);
  const src = path.join(DATA, it.file);
  fs.writeFileSync(src, fs.readFileSync(src, 'utf8').split("audio: '" + it.audio + "'").join("audio: '" + out + ".mp3'"));
  console.log('built', out + '.mp3', dur(path.join(LS, out + '.mp3')).toFixed(1) + ' s');
}
fs.rmSync(tmp, { recursive: true, force: true });
