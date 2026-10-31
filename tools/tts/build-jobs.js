/* Lists every line the LS2 engines say with the browser voice and writes the ElevenLabs jobs for them.
   node tools/tts/build-jobs.js <out.json> [course] [lp]   e.g. node tools/tts/build-jobs.js jobs.json 2eso 6
   Each job: id (= ttsKey of the text the engine passes, the file name), voice, the full sentence to generate (gap filled with
   the first accepted answer) and the answers to cover with a beep after alignment. Micro-dictation chunks are not jobs: they are cut
   from the LS's own recordings (cut-chunks.py). Started paths (2 ESO LP1, 4 ESO LP1-LP2) are left out. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '../..');
const LS = { '2eso': '2eso/free-time-live', '4eso': '4eso/seasons-and-celebrations' };
const FROZEN = { '2eso': [1], '4eso': [1, 2] };
// Voices Roger approved for LS2 (eleven_v3). Listen and complete rotates through them; each Talk path gets one partner.
const VOICES = { Amelia: 'ZF6FPAbjXT4488VcRRnw', Julian: '9IzcwKmvwJcw58h3KnlH', Zara: 'jqcCZkN6Knx8BJ5TBdYR', Finn: 'vBKc2FfBKJfcZNyEt1n6',
  Clyde: 'wyWA56cQNU2KqUW4eCsI', Tonia: 'ui11Rd52NKH2DbWlcbvw', Lewis: 'gUbIduqGzBP438teh4ZA' };
const ROT = ['Amelia', 'Finn', 'Tonia', 'Julian', 'Zara', 'Lewis', 'Clyde'];
const PARTNER = { 2: 'Zara', 3: 'Finn', 4: 'Amelia', 5: 'Julian', 6: 'Tonia' };
const key = require('./tts-key.js');
const spoken = q => String(q).replace(/<[^>]+>/g, '').replace(/\([^)]*\)/g, ' ').replace(/→/g, '. ').replace(/[“”]/g, '').replace(/\s+/g, ' ').trim();
const GAP = /_{2,}(?:[\s/]*_{2,})*/g;
const tag = t => /!/.test(t) ? '[excited] ' : /\?$/.test(t) ? '[curious] ' : '';
const [out, onlyC, onlyN] = process.argv.slice(2);
const jobs = [], seen = new Set();
for (const [c, dir] of Object.entries(LS)) {
  if (onlyC && c !== onlyC) continue;
  for (const f of fs.readdirSync(path.join(root, dir, 'data')).filter(f => f.endsWith('.js'))) {
    const ctx = { window: {} }; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(root, dir, 'data', f), 'utf8'), ctx);
    const nf = path.join(root, dir, 'data/native', f); if (fs.existsSync(nf)) vm.runInContext(fs.readFileSync(nf, 'utf8'), ctx);
    const LP = ctx.window.LP; if (!LP || !LP.n || FROZEN[c].includes(LP.n) || (onlyN && LP.n !== +onlyN)) continue;
    const panels = [...(LP.panels || []), ...Object.entries(LP.native || {}).map(([id, p]) => ({ ...p, id }))];
    let rot = LP.n;
    const add = (q, kind, voice, answers) => {
      const id = key(q); if (seen.has(id)) return; seen.add(id);
      const parts = String(q).replace(/<[^>]+>/g, '').split(GAP), gaps = parts.length - 1;
      const a0 = answers && answers.length ? String(answers[0]) : '';
      // one gap: the whole answer; several gaps: one word each ("do playing" for "___ you like ___ (play)")
      const fill = gaps === 1 ? [a0] : a0.split(/\s+/).length === gaps ? a0.split(/\s+/) : null;
      if (gaps && !fill) throw new Error('Cannot fill the gaps of: ' + q);
      // mask = the words (by index in the spoken text) to cover with a beep, so 'do' in "Do you…? — Yes, I do." is only hidden once
      const W = t => spoken(t).split(' ').filter(w => /[A-Za-z0-9]/.test(w)).length, mask = [];
      let text = String(q);
      if (gaps) { let pre = ''; parts.slice(0, gaps).forEach((p, i) => { pre += p; const from = W(pre); pre += ' ' + fill[i] + ' '; mask.push([from, W(pre) - 1]); }); text = parts.map((p, i) => p + (i < gaps ? ' ' + fill[i] + ' ' : '')).join(''); }
      text = spoken(text).replace(/\s+([?!.,:;])/g, '$1').replace(/^[a-z]/, m => m.toUpperCase());
      jobs.push({ id, course: c, lp: LP.n, page: f.replace('.js', ''), kind, voice, voice_id: VOICES[voice],
        text: tag(text) + text, mask, answers: fill || [], q: String(q) });
    };
    for (const p of panels) {
      if (p.type === 'typed' && p.mode === 'listen') (p.items || []).forEach(it => add(it.q, 'listen', ROT[rot++ % ROT.length], it.a));
      if (p.practice && p.practiceMode === 'listen') (p.practice || []).forEach(it => add(it.q, 'listen', ROT[rot++ % ROT.length], it.a));
      if (p.type === 'talk') (p.partner || []).forEach(q => add(q.q, 'talk', PARTNER[LP.n] || 'Amelia'));
    }
  }
}
fs.writeFileSync(out, JSON.stringify(jobs, null, 1));
console.log(jobs.length, 'jobs,', jobs.reduce((s, j) => s + j.text.length, 0), 'characters');
