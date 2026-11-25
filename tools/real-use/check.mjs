// 🤖 Real-use tests (Roger, 25 Nov 2026: "Your call: should the real-use tests go ahead? … Yes"). A robot uses the site the way a
// student (and Roger) does, in a real browser, on the real pages with the real Firebase code and the real firestore.rules, but against a
// FREE TEST COPY of the database that lives only on the computer running the check (the Firebase emulator, project demo-english-lab).
// Only invented people (Alex Sample, Pau Exemple…); nothing ever reaches the real database: a try is blocked and counts as a failure.
// Each test starts from an empty copy, fills in what it needs, does what a student does (hand in a step, study flashcards, sit the
// exam…) and then checks what the student and Roger would see, and what was saved. A failure says, in plain words, what broke.
// The rule (docs/REQUIREMENTS.md § 11): every bug a student reports becomes a new test here, in the same PR as its fix.
// Usage: node tools/real-use/check.mjs [filter]
//   It starts the emulator itself (npx firebase emulators:exec, Java needed) unless FIRESTORE_EMULATOR_HOST is set already.
//   SHOTS=dir also saves a picture at the end of each test.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  // start the test copy of the database, run this file inside it, stop it again
  // its settings, made for this run at the repo's top (the emulator only loads rules inside the folder of its settings file)
  const cfg = path.join(HERE, '../../.real-use-firebase.json');
  fs.writeFileSync(cfg, JSON.stringify({ firestore: { rules: 'firestore.rules' }, emulators: { firestore: { host: '127.0.0.1', port: 8080 }, auth: { host: '127.0.0.1', port: 9099 },
    ui: { enabled: false }, logging: { host: '127.0.0.1' }, hub: { host: '127.0.0.1' }, singleProjectMode: true } }));
  const bin = path.join(path.dirname(require.resolve('firebase-tools/package.json')), 'lib/bin/firebase.js');
  const args = [bin, 'emulators:exec', '--project', 'demo-english-lab', '--only', 'firestore,auth', '--config', cfg,
    [process.execPath, fileURLToPath(import.meta.url), ...process.argv.slice(2)].map((a) => JSON.stringify(a)).join(' ')];
  if (process.env.SHOTS) process.env.SHOTS = path.resolve(process.env.SHOTS);   // the tests run in another folder: the pictures go where the caller meant
  const r = spawnSync(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', env: process.env, cwd: os.tmpdir(), maxBuffer: 64 << 20 });
  fs.rmSync(cfg, { force: true });
  if (r.status && !(r.stdout || '').includes('🤖')) process.stdout.write((r.stdout || '') + (r.stderr || ''));   // the emulator did not start: say why
  // the emulator's own lines are noise: show only the tests' report
  const out = r.stdout || '', i = out.indexOf('🤖');
  // and anything the check itself threw (a crash before or after the tests)
  const crash = (r.stderr || '').split('\n').filter((l) => /Error|at file:/.test(l) && !/MetadataLookup|DeprecationWarning/.test(l)).slice(0, 8).join('\n');
  if (r.status && crash) process.stdout.write('\n' + crash + '\n');
  process.stdout.write(i >= 0 ? out.slice(i).split('\n').filter((l) => !/^(✔|i |⚠|Error: Script)/.test(l)).join('\n').trim() + '\n' : out);
  process.exit(r.status ?? 1);
}

// a stray error in a test (a promise nobody waited for) must say what it was, not stop the report without a word
for (const ev of ['unhandledRejection', 'uncaughtException']) process.on(ev, (e) => { console.log('💥 ' + String(e && e.message || e).split('\n')[0]); process.exitCode = 1; });
const L = await import('./lib.mjs');
const FILTER = process.argv[2] || '';
const files = fs.readdirSync(path.join(HERE, 'tests')).filter((f) => /^\d+-.*\.mjs$/.test(f)).sort();   // tests/NN-name.mjs; world.mjs holds the shared invented school
const results = [];
console.log('🤖 Real-use tests: a robot uses the site like a student, against a test copy of the database.\n');
for (const f of files) {
  const mod = await import('./tests/' + f);
  for (const t of mod.default) {
    if (FILTER && !(f + ' ' + t.name).toLowerCase().includes(FILTER.toLowerCase())) continue;
    const fails = [], devices = [];
    const ctx = Object.assign({}, L, {
      ok: (cond, msg) => { if (!cond) fails.push(msg); return !!cond; },
      device: async (...a) => { const d = await L.device(...a); devices.push(d); return d; },
    });
    const t0 = Date.now();
    try { await L.reset(); await t.run(ctx); }
    catch (e) { const m = String(e && e.message || e), w = (m.match(/waiting for (.*)/) || [])[1];
      fails.push('the test could not finish: ' + m.split('\n')[0] + (w ? ' (waiting for ' + w.slice(0, 160) + ')' : '')); }
    const stuck = fails.length;   // the test stopped or a check failed: say where each device was and what it showed
    for (const [n, d] of devices.entries()) {
      const last = d.pages[d.pages.length - 1];
      if (stuck && last) { const txt = await last.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 220)).catch(() => '?');
        fails.push('device ' + (n + 1) + ' was on ' + last.url().replace(/^https?:\/\/[^/]+\//, '') + ': "' + txt + '"'); }
      for (const e of new Set(d.errors)) fails.push('JavaScript error on ' + e);
      if (d.real.length) fails.push('tried to reach the REAL database: ' + [...new Set(d.real)].join(', '));
      if (d.missing.length) fails.push('a file it needs is missing: ' + [...new Set(d.missing)].join(', '));
      if (process.env.SHOTS && d.pages.length) { fs.mkdirSync(process.env.SHOTS, { recursive: true });
        await d.pages[d.pages.length - 1].screenshot({ path: path.join(process.env.SHOTS, (f + '-' + t.name).replace(/[^\w.-]+/g, '_').slice(0, 110) + '-' + (n + 1) + '.png') }).catch(() => {}); }
      await d.ctx.close().catch(() => {});
    }
    const gone = L.missing(); if (gone.length) fails.push('a file the site needs is missing: ' + gone.join(', '));
    results.push({ name: t.name, fails, s: ((Date.now() - t0) / 1e3).toFixed(1) });
    console.log(`${fails.length ? '❌' : '✅'} ${t.name} (${results.at(-1).s} s)` + fails.map((x) => '\n     · ' + x).join(''));
  }
}
await L.close();
const bad = results.filter((r) => r.fails.length);
console.log(`\n${results.length - bad.length} of ${results.length} real-use tests passed.`);
process.exitCode = bad.length ? 1 : 0;   // not process.exit(): the last lines must reach the report first
