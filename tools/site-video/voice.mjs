// Voice-over for the "How English Lab works" video: one mp3 per line of script.json, by ElevenLabs (PAID: about 1 credit per
// character). Only run it after Roger's go-ahead. A line whose mp3 already exists is skipped, so a rerun never pays twice;
// to redo a line, delete its mp3 first.
// Usage: ELEVENLABS_API_KEY=... node tools/site-video/voice.mjs [only=l03,l08]
//   EL_VOICE_ID (default: the voice named "Amelia" in the account), EL_MODEL (default eleven_v3), EL_SPEED (default 0.95)
//   EL_LANG=ca reads each line's Catalan text (the Catalan version), EL_OUT = output folder name next to this file (default voice)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const LANG = process.env.EL_LANG === 'ca' ? 'ca' : 'en';
const OUT = path.join(DIR, process.env.EL_OUT || 'voice');
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Set ELEVENLABS_API_KEY'); process.exit(1); }
const MODEL = process.env.EL_MODEL || 'eleven_v3';
const SPEED = +(process.env.EL_SPEED || 0.95);
const only = (process.argv.find((a) => a.startsWith('only=')) || '').slice(5).split(',').filter(Boolean);
const api = (p, o = {}) => fetch('https://api.elevenlabs.io' + p, { ...o, headers: { 'xi-api-key': KEY, 'content-type': 'application/json', ...(o.headers || {}) } });

const script = JSON.parse(fs.readFileSync(path.join(DIR, 'script.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

let voice = process.env.EL_VOICE_ID;
if (!voice) {
  const r = await (await api('/v1/voices')).json();
  const v = (r.voices || []).find((x) => /^Amelia\b/i.test(x.name));
  if (!v) { console.error('No voice named Amelia in this account; set EL_VOICE_ID'); process.exit(1); }
  voice = v.voice_id;
  console.log('voice', v.name, voice);
}
const sub = async () => { const s = await (await api('/v1/user/subscription')).json(); return s.character_limit - s.character_count; };
const before = await sub();
console.log('credits left before:', before);

const todo = script.lines.filter((l) => (!only.length || only.includes(l.id)) && !fs.existsSync(path.join(OUT, l.id + '.mp3')));
console.log(todo.length, 'lines,', todo.reduce((s, l) => s + l[LANG].length, 0), 'characters');
for (const l of todo) {
  const body = { text: l[LANG], model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: SPEED } };
  let r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
  if (r.status === 400 || r.status === 422) {   // a model that does not take speed: try once without it
    delete body.voice_settings.speed;
    r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
  }
  if (!r.ok) { console.error(l.id, r.status, await r.text()); process.exit(1); }
  fs.writeFileSync(path.join(OUT, l.id + '.mp3'), Buffer.from(await r.arrayBuffer()));
  console.log('ok', l.id, l[LANG].length);
}
const after = await sub();
console.log('credits left after:', after, '· used:', before - after);
fs.writeFileSync(path.join(OUT, 'voice-log.txt'), `model ${MODEL} · voice ${voice} · speed ${SPEED} · ${LANG}\ncredits before ${before} · after ${after} · used ${before - after}\n`);
