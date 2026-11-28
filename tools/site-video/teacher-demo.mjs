// The teacher dashboard (teacher.html) with SAMPLE students for the "How the dashboard works" video (Roger, 31 Oct 2026).
// teacher.html has a demo mode: a page that defines window.EL_DEMO_DATA gets that data and no Firebase, and nothing is saved.
// Every name here is invented (checked against the real student list so none matches); marks, routes and answers are random.
// Runs offline from the repo files. Usage: node tools/site-video/teacher-demo.mjs [outdir] [--serve]   → t-*.png
//   --serve: only start the page on http://127.0.0.1:8765/teacher.html (to look at it), no screenshots.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(ROOT, 'tools/site-video/captures'));

// ---- sample data ----
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const FIRST = ['Aina', 'Pol', 'Martina', 'Marc', 'Júlia', 'Jan', 'Laia', 'Biel', 'Ona', 'Nil', 'Carla', 'Arnau', 'Abril', 'Èric', 'Clàudia', 'Oriol',
  'Mireia', 'Adrià', 'Berta', 'Gerard', 'Txell', 'Roger', 'Queralt', 'Bernat', 'Neus', 'Quim', 'Elna', 'Martí', 'Duna', 'Ferran'];
const SUR = ['Puigdollers', 'Serrallonga', 'Vilalta', 'Ferrerons', 'Solanes', 'Rocamora', 'Ponsatí', 'Masdéu', 'Rierola', 'Fontcuberta', 'Costabella',
  'Boschmonar', 'Vilaplana', 'Campdepadrós', 'Salavedra', 'Pratdesaba', 'Collbató', 'Mirambell', 'Torrebadella', 'Garcies', 'Martorellas', 'Sentmenat'];
global.window = global;
// el-catalog.js sets up the video player on load: a bare document is enough in Node
global.document = global.document || { documentElement: { classList: { toggle() {} } }, addEventListener() {}, getElementById: () => null, querySelector: () => null };
for (const f of ['el-catalog', 'el-sections', 'el-criteria', 'el-plan', 'el-week', 'el-grading', 'el-points']) require(path.join(ROOT, 'shared/js', f + '.js'));
const CAT = global.EL_CATALOG, ACT = global.EL_ACTIONS;

const D = { st: {}, ro: {}, rs: {}, lv: {}, pg: {}, ls: {}, pt: {}, tm: {}, tk: {}, pb: [], sg: [], replies: {}, ck: {}, cp: {} };
const LS1 = { '2eso': '2eso-my-real-routine', '4eso': '4eso-my-real-routine' }, LS2 = { '2eso': '2eso-free-time-live', '4eso': '4eso-seasons-and-celebrations' };
const OPEN = { '2eso': ['2eso/ls2-getting-started', '2eso/ls2-what-are-they-doing', '2eso/ls2-recall-checkpoint-1'],
  '4eso': ['4eso/ls2-getting-started', '4eso/ls2-celebrations-around-the-world', '4eso/ls2-recall-checkpoint-1'] };
for (const c of ['2eso', '4eso']) {
  D.ls[LS1[c]] = { status: 'closed', enabled: [], open: {} };
  const open = {}; for (const g of global.EL_GROUPS.filter((x) => x.course === c)) open[g.id] = OPEN[c].filter((id) => CAT.some((a) => a.id === id));
  D.ls[LS2[c]] = { status: 'open', enabled: [], open };
}
const used = new Set(), cut = (m) => (m < 3 ? 'beginners' : m < 6 ? 'insecure' : m < 8 ? 'safe' : 'daring');
let n = 0;
for (const g of global.EL_GROUPS) {
  const c = g.course, size = 22 + Math.floor(rnd() * 4);
  for (let i = 0; i < size; i++) {
    let first, s1, s2; do { first = pick(FIRST); s1 = pick(SUR); s2 = pick(SUR); } while (s1 === s2 || used.has(first + s1));
    used.add(first + s1);
    const email = (first + '.' + s1).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + '@school.example', uid = 'u' + (++n);
    D.ro[email] = { group: g.id, first, surname1: s1, surname2: s2, email };
    if (rnd() < 0.06) continue;                       // a few have not signed in yet
    D.st[uid] = { uid, name: first + ' ' + s1, email, group: g.id };
    // LS1 exam by sections, and the LS2 route set from it
    const e = global.EL_GRADING[LS1[c]].exam, skill = 0.25 + rnd() * 0.75, sec = {};
    e.sections.forEach(([k, , mx]) => { sec[k] = { score: Math.round(Math.min(1, Math.max(0, skill + (rnd() - 0.5) * 0.3)) * mx), max: mx }; });
    const mark = e.sections.reduce((t, [k]) => t + sec[k].score, 0) / e.sections.reduce((t, [, , mx]) => t + mx, 0) * 10;
    D.rs[uid] = { [LS1[c] + '/assessment']: { ls: LS1[c], activity: LS1[c] + '/assessment', sections: sec } };
    // LS1 final product: most presented (a mark), every fourth one 'No presentat' (0); no extra rnd() calls, so the rest of the demo stays the same
    D.rs[uid][c + '/final-product'] = { ls: LS1[c], activity: c + '/final-product', max: 10, score: n % 4 ? Math.round((3 + skill * 6.5) * 10) / 10 : 0 };
    D.lv[uid] = { [LS1[c]]: { level: 'safe', by: 'teacher' }, [LS2[c]]: { level: cut(mark), by: 'teacher', why: 'exam', changed: Date.now() - 86400e3 } };
    // LS2 work in the open learning paths
    const pg = {};
    for (const a of CAT.filter((x) => x.ls === LS2[c] && OPEN[c].includes(x.id) && !x.checkpoint)) {
      const st = ACT[a.id] || [], k = Math.min(st.length, Math.floor((skill + rnd() * 0.6) * st.length)), done = {};
      st.slice(0, k).forEach((s) => (done[s] = true));
      // first try and latest check of each step done (score out of max), and the reading log handed in
      const tries = {}, last = {}, steps = {};
      // dated tries (🌱 Progress: skill mastery over time): the learning paths in order from 26 Oct, two days a step, latest check two days later
      const ai = OPEN[c].indexOf(a.id), d0 = Date.parse('2026-10-26T09:00:00Z') + ai * 9 * 86400e3, day = (j) => Math.min(Date.now() - 3600e3, d0 + j * 2 * 86400e3);
      st.slice(0, k).forEach((s, j) => { const m = 4 + Math.floor(rnd() * 7), f = Math.round(m * Math.min(1, skill * 0.8 + rnd() * 0.3));
        tries[s] = { score: f, max: m, date: new Date(day(j)).toISOString() }; last[s] = { score: Math.min(m, f + Math.floor(rnd() * 3)), max: m, date: new Date(day(j) + 2 * 86400e3 > Date.now() ? Date.now() - 1800e3 : day(j) + 2 * 86400e3).toISOString() }; });
      if (done.log) steps.log = { f: [{ l: 'Text 1: which celebration? What is it, when and where?', v: 'Diwali. Festival of lights, in October or November, in India. It lasts five days.' },
        { l: 'Text 1: the main customs', v: 'People clean and decorate their houses with lamps. Families visit relatives and share sweets.' }], date: Date.now() - 86400e3 };
      pg[a.keys[0]] = JSON.stringify({ done, tries, last, steps });
      if (a.graded && k) {
        const r = { ls: a.ls, activity: a.id, score: Math.round(a.points * Math.min(1, skill * 0.7 + rnd() * 0.4) * k / st.length) };
        if (k === st.length) { if (rnd() < 0.7) r.locked = true; else r.markedDone = true; }
        if (r.locked && rnd() < 0.3) r.feedback = 'Well done! Check the prepositions: on 31 October, in November.';
        if (done.log && rnd() < 0.6) r.levels = { log: { '4.1': pick(['AS', 'AN', 'AN', 'AE']) } };
        D.rs[uid][a.id] = r;
      }
    }
    D.pg[uid] = { [LS2[c]]: pg };
    if (process.env.EL_DEMO_PROGRESS) {   // 🌱 Progress preview: LS1 checks from mid September, a little better each week (a hash, not rnd(), so nothing else changes)
      const h = (x) => { let v = 0; for (const ch of x) v = (v * 31 + ch.charCodeAt(0)) % 1000; return v / 1000; }, p1 = {};
      CAT.filter((x) => x.ls === LS1[c] && (x.keys || []).length && !x.checkpoint).forEach((a, ai) => { const st = ACT[a.id] || [], tries = {}, last = {};
        st.forEach((s, j) => { const t = Date.parse('2026-09-15T09:00:00Z') + (ai * 7 + j) * 86400e3, gain = (t - Date.parse('2026-09-15')) / (60 * 86400e3) * 0.25;
          const v = Math.max(0.05, Math.min(1, skill * 0.75 + gain + (h(uid + a.id + s) - 0.5) * 0.35)); tries[s] = { score: Math.round(v * 10), max: 10, date: new Date(t).toISOString() };
          last[s] = { score: Math.min(10, Math.round(v * 10) + 1), max: 10, date: new Date(t + 86400e3).toISOString() }; });
        p1[a.keys[0]] = JSON.stringify({ done: Object.fromEntries(st.map((s) => [s, true])), tries, last }); });
      D.pg[uid][LS1[c]] = p1;
      // the LS2 exam (held until Friday, as the real 2 ESO release) and some confirmed criterion degrees
      const g2 = global.EL_GRADING[LS2[c]], sec2 = {};
      g2.exam.sections.forEach(([k, , mx]) => { sec2[k] = { score: Math.round(Math.max(0, Math.min(1, skill * 0.9 + (h(uid + k) - 0.4) * 0.4)) * mx), max: mx }; });
      const fin = {}; [...g2.key, ...g2.other].forEach((cr) => { const m = Math.max(1, Math.min(10, skill * 9 + (h(uid + cr) - 0.5) * 4)); if (h(cr + uid) < 0.75) fin[cr] = m < 5 ? 'NA' : m < 7 ? 'AS' : m < 9 ? 'AN' : 'AE'; });
      D.rs[uid][LS2[c] + '/assessment'] = { ls: LS2[c], activity: LS2[c] + '/assessment', sections: sec2, final: fin, showFrom: '2026-11-27T07:00:00Z' };
    }
    D.pt[email] = { t1: Math.floor(rnd() * rnd() * 16) };
  }
  D.tm[g.id] = { best: { t1: 15 }, bestOk: { t1: 12 } };
}
// a route request, two problem reports and a suggestion, in 4 ESO A
const a4 = Object.values(D.st).filter((s) => s.group === '4ESOA');
D.lv[a4[3].uid][LS2['4eso']] = Object.assign(D.lv[a4[3].uid][LS2['4eso']], { level: 'safe', request: 'daring', reason: 'I find Core easy and I want more challenge.' });
D.pb.push({ id: 'p1', uid: a4[5].uid, group: '4ESOA', kind: 'media', text: 'The audio of the listening does not play.', page: '4eso/seasons-and-celebrations/celebrations-around-the-world.html', title: 'Celebrations around the world', section: 'Listening', route: 'safe', device: 'Chromebook', created: Date.now() - 2 * 3600e3 });
D.pb.push({ id: 'p2', uid: a4[9].uid, group: '4ESOA', kind: 'marking', text: '"It takes place in autumn" is marked wrong.', page: '4eso/seasons-and-celebrations/celebrations-around-the-world.html', title: 'Celebrations around the world', section: 'Grammar', route: 'insecure', device: 'Windows', created: Date.now() - 26 * 3600e3 });
// Claude's status + suggested reply on each report (auto: tools/problems/auto.mjs leave --status --reply)
D.pb[0].auto = { verdict: 'roger', status: 'fixed', note: 'The audio file was missing after the last update; it is back since this morning, so the listening plays again.', reply: 'You were right: the audio was missing. It works again now. Reload the page and press ▶ once.', at: new Date().toISOString() };
D.pb[1].auto = { verdict: 'roger', status: 'nobug', note: 'The key accepts "takes place in autumn"; the student wrote "It take place in autumn" (no -s), so it was marked wrong as it should be.', reply: 'He revisat la teva resposta: vas escriure "It take place", sense la -s. Amb he, she o it afegim -s: "It takes place in autumn". Torna-ho a provar i et sortirà bé!', at: new Date().toISOString() };
D.pb.push({ id: 'p3', uid: a4[11].uid, group: '4ESOA', kind: 'other', text: 'El meu cognom està mal escrit.', page: 'today.html#formative', title: 'My dashboard · English Lab', section: 'My activities', route: null, device: 'Chromebook · Chrome · 1366×768', created: Date.now() - 50 * 60e3,
  auto: { verdict: 'roger', status: 'you', note: 'The roster has the surname with a different spelling from the one the student uses (and the school email). Roster data is yours to change.', todo: 'Change the surname in 👥 Students, then send.', reply: 'Tens raó: ja he corregit el teu cognom. Recarrega la pàgina i ja el veuràs bé.', at: new Date().toISOString() } });
D.sg.push({ id: 's1', uid: a4[7].uid, group: '4ESOA', text: 'Could we have more vocabulary games for each Learning Path?', page: 'lab/index.html', created: Date.now() - 5 * 3600e3 });
// an idea with Beltran's draft reply (Roger, 20 Nov 2026: tools/problems/auto.mjs idea → suggestions/{id}.auto)
{ const a2 = Object.values(D.st).filter((s) => s.group === '2ESOA');
  D.sg.push({ id: 's2', uid: a2[4].uid, group: '2ESOA', text: "alguna activitat per estudiar l'examen", page: 'today.html', created: Date.now() - 2 * 3600e3,
    auto: { note: 'The LS page already has the sample exam and 🎯 Practise has lots of exercises at their level: the draft points to them.',
      ca: "Gràcies per la idea! Ja tens l'examen de mostra a la pàgina de la LS i molts exercicis a 🎯 Practica, al teu nivell. Fes-los uns dies abans del pròxim examen i repassa només el que t'hagi sortit malament.",
      en: 'Thanks for the idea! You already have the sample exam on the LS page and lots of exercises in 🎯 Practise, at your level. Do them a few days before the next exam and go over only what you got wrong.', at: Date.now() - 2 * 3600e3 + 240e3 } }); }
// the class games of LS2 (gameResults): a vocabulary and a grammar game for LP1-LP3 in every group, a few students absent from each
const LS2T = { '2eso': 'LS2 · Free Time, Live!', '4eso': 'LS2 · Seasons & Celebrations' };
D.games = [];
for (const g of global.EL_GROUPS) {
  const studs = Object.values(D.st).filter((s) => s.group === g.id), skill = Object.fromEntries(studs.map((s) => [s.email, [0.35 + rnd() * 0.65, 0.35 + rnd() * 0.65]]));
  [1, 2, 3].forEach((lp) => ['vocab', 'grammar'].forEach((kind) => { const done = 10;
    D.games.push({ group: g.id, course: g.course, kind, lsId: LS2[g.course], ls: LS2T[g.course], lp: 'LP' + lp, title: (kind === 'vocab' ? 'Vocabulary' : 'Grammar') + ' · LP' + lp, day: '2026-11-0' + (2 + lp), done,
      deck: `${g.course}-ls2-lp${lp}-${kind}`, sid: Date.parse('2026-11-0' + (2 + lp) + 'T09:00:00Z') + (kind === 'grammar' ? 1800e3 : 0),
      // a = questions answered: everyone all of them, except one late arrival per game (3 of 10, so that game is left out of their mark)
      stu: studs.filter(() => rnd() > 0.12).map((s, i) => { const r = Math.min(done, Math.round(done * skill[s.email][kind === 'vocab' ? 1 : 0] * (0.8 + rnd() * 0.4))), late = i === lp + 2;
        return { e: s.email.toLowerCase(), r: late ? Math.min(r, 3) : r, a: late ? 3 : done }; }) });
  }));
  // the LP1 grammar game played again a week later (Roger, 11 Nov 2026: only the latest play counts): most students do better, nothing random
  const g1 = D.games.find((x) => x.group === g.id && x.deck === g.course + '-ls2-lp1-grammar');
  D.games.push(Object.assign({}, g1, { day: '2026-11-10', sid: Date.parse('2026-11-10T09:00:00Z'), stu: g1.stu.map((y) => ({ e: y.e, r: Math.min(10, y.r + 2), a: 10 })) }));
}

// 📈 class performance (classPerf): four class modes per group, the steps ticked ✔ Finished and each student's share (a few absent each time)
D.classPerf = [];
const STEPS = [['Vocabulary', 'Reading'], ['Listening', 'Listen again', 'Grammar'], ['Reading log', 'Writing'], ['Grammar', 'Mixed', 'Speaking', 'Talk']];
for (const g of global.EL_GROUPS) {
  const studs = Object.values(D.st).filter((s) => s.group === g.id), will = Object.fromEntries(studs.map((s) => [s.email, 0.3 + rnd() * 0.75]));
  ['2026-11-04', '2026-11-06', '2026-11-11', '2026-11-13'].forEach((day, i) => { const st = STEPS[i], s = Date.parse(day + 'T08:00:00Z');
    D.classPerf.push({ group: g.id, day, s, steps: st.map((n) => ({ it: '', n, ls: LS2[g.course] })),
      rows: studs.filter(() => rnd() > 0.08).map((x) => { const did = st.filter(() => rnd() < will[x.email]); return { e: x.email.toLowerCase(), uid: x.uid, name: x.name, n: did.length, of: st.length, left: st.filter((n) => !did.includes(n)) }; }) }); });
}

// ✏️ Corrections (Roger, 14 Nov 2026: Gemini's and Claude's corrections in two tables, by student › task › day): speaking recordings Gemini
// transcribed with notes, Claude's Wednesday corrections, a comment answered, a piece sent back to redo, and final product drafts (DEMO.fpg)
D.fpg = {};
{ const day = (d, h) => new Date(Date.parse('2026-11-' + String(d).padStart(2, '0') + 'T' + String(h).padStart(2, '0') + ':' + String(10 + d).padStart(2, '0') + ':00Z')).toISOString();
  for (const [gid, k] of [['2ESOA', 7], ['4ESOB', 4]]) {
    const c = gid.startsWith('2') ? '2eso' : '4eso', gs = CAT.find((a) => a.id === c + '/ls2-getting-started'), fp = global.EL_GRADING[LS2[c]].fp.a;
    Object.values(D.st).filter((s) => s.group === gid).slice(0, k).forEach((s, i) => {
      const pg = D.pg[s.uid][LS2[c]], st = JSON.parse(pg[gs.keys[0]] || '{}'); st.steps = st.steps || {};
      st.steps.speak = { title: 'Speaking: my free time', date: day(6 + (i % 3), 9 + i), audio: Object.assign({ id: 'demo', s: 35 + i * 4 }, i % 2 ? {} : { eur: 0.0036 + i * 0.0002 }),
        f: [{ l: 'Transcript', v: 'In my free time I play football and I listen music.' }, { l: 'Transcript of the recording', v: 'In my free time I play football with my friends and I listen to music.', rec: 1 },
          { l: 'Notes from the recording (task and pronunciation)', v: 'Answers the task. Says "music" as "mu-SIC": stress on the first syllable.', rec: 1 }] };
      pg[gs.keys[0]] = JSON.stringify(st);
      const r = D.rs[s.uid][gs.id] = D.rs[s.uid][gs.id] || { ls: LS2[c], activity: gs.id };
      if (i % 4 !== 3) Object.assign(r, { fbSig: { speak: 'demo' + i }, fbAt: { speak: day(11, 13) }, replies: { speak: 'Well done! "listen TO music".' } });
      if (i % 3 === 0) r.answers = { speak: { t: 'Yes, "listen to" always takes "to".', at: day(12 + (i % 2), 11) } };
      if (i === 1) r.flags = { read: { auto: true, done: 'redo', at: day(7, 17) } };
      if (i < 4) (D.fpg[fp] = D.fpg[fp] || {})[s.uid] = Object.assign({ at: day(13 - i, 18), draft: { rows: [], secs: 95 + i * 25 }, model: 'gemini-4-argon', approved: i % 2 === 0 }, i < 2 ? { eur: 0.0712 + i * 0.03, n: 1 + i } : {});
    });
  }
}

// 🚩 Possible problems (Roger, 28 Nov 2026: "a place to see the possible problems like redo, copying"): a possible copy waiting, work sent
// back (by Beltran: mostly pasted, not a real try; by the teacher), one handed in again, a copy accepted, a recall checkpoint sent by
// itself, and 4 ESO B's LS2 web exam tries with the ⚠️ checks (D.ex). No rnd() calls, so the rest of the demo stays the same.
{ const at = (d, h, m = 0) => new Date(Date.UTC(2026, 10, d, h, m)).toISOString(), ls4 = LS2['4eso'], ls2 = LS2['2eso'];
  const c4 = CAT.find((a) => a.id === '4eso/ls2-celebrations-around-the-world'), t4 = CAT.find((a) => a.id === '4eso/ls2-where-traditions-come-from'), d2 = CAT.find((a) => a.id === '2eso/ls2-what-are-they-doing');
  const B = Object.values(D.st).filter((s) => s.group === '4ESOB'), A2 = Object.values(D.st).filter((s) => s.group === '2ESOA');
  const step = (s, a, k, h) => { const pg = (D.pg[s.uid] = D.pg[s.uid] || {}), L = (pg[a.ls] = pg[a.ls] || {}), st = JSON.parse(L[a.keys[0]] || '{}'); st.steps = st.steps || {}; st.steps[k] = h; L[a.keys[0]] = JSON.stringify(st); };
  const flag = (s, a, k, f) => { const r = (D.rs[s.uid][a.id] = D.rs[s.uid][a.id] || { ls: a.ls, activity: a.id }); r.flags = Object.assign({}, r.flags, { [k]: f }); };
  const TXT = 'Diwali is the festival of lights. It is celebrated in India in October or November and it lasts five days. People clean their houses, light oil lamps and share sweets with their families.';
  const W = (s, a, date, ty) => step(s, a, 'write', { title: 'Writing', w: 1, date, ty, f: [{ l: 'My text', v: TXT }] });
  if (B[8]) { W(B[8], c4, at(27, 16, 51), { p: 495, k: 26, s: 180 }); flag(B[8], c4, 'write', { why: 'written in 3 minutes: 26 keys for 521 characters, 495 pasted', at: at(27, 16, 54), ty: { p: 495, k: 26, s: 180 }, lv: {}, fb: '' }); }
  if (B[9]) { step(B[9], t4, 'chart', { title: 'Listening chart', date: at(24, 9, 40), f: [{ l: 'Where', v: 'a' }, { l: 'When', v: 'a' }, { l: 'Why', v: 'a' }] });
    flag(B[9], t4, 'chart', { done: 'redo', reopen: true, auto: true, why: 'one letter in every box', back: 'Please write a real answer in each box and hand it in again.', at: at(25, 16, 43) }); }
  if (B[10]) { W(B[10], c4, at(16, 18, 2), { p: 610, k: 12, s: 60 }); flag(B[10], c4, 'write', { why: 'mostly pasted: 610 of 640 characters', done: 'redo', auto: true, at: at(18, 16, 43) }); }
  if (B[11]) { W(B[11], c4, at(23, 19, 10), { p: 0, k: 640, s: 1500 }); flag(B[11], c4, 'write', { why: 'mostly pasted: 590 of 600 characters', done: 'redo', auto: true, at: at(18, 16, 43) }); }
  if (B[12]) { W(B[12], c4, at(12, 17, 0), { p: 120, k: 400, s: 900 }); flag(B[12], c4, 'write', { why: 'a long sentence pasted in the middle', done: 'accepted', at: at(13, 16, 43) }); }
  if (A2[8]) { step(A2[8], d2, 'write', { title: 'Writing', w: 1, date: at(19, 12, 30), f: [{ l: 'My text', v: 'In the photo they are play football.' }] });
    flag(A2[8], d2, 'write', { done: 'redo', back: 'Please write it again in your own words: two or three sentences about the photo.', at: at(20, 18, 5) }); }
  // a kind of problem Beltran hadn't seen before (marks.mjs ask; Roger, 28 Nov 2026: only these and possible copies need him), and a redo
  // Roger took back with ↩ No need to redo (done "kept")
  if (B[14]) { W(B[14], t4, at(26, 18, 20), { p: 0, k: 610, s: 1400 }); flag(B[14], t4, 'write', { why: 'the same text as last week’s writing, word for word (typed, not pasted): reused or a mistake?', kind: 'The same text handed in twice', lv: {}, at: at(27, 16, 50) }); }
  if (A2[9]) { step(A2[9], d2, 'write', { title: 'Writing', w: 1, date: at(19, 12, 40), f: [{ l: 'My text', v: 'They are dancing in the street. They are wearing masks.' }] });
    flag(A2[9], d2, 'write', { done: 'kept', back: 'Please write it again in your own words.', at: at(20, 18, 5), keptAt: at(21, 9, 10), keptNote: 'No cal que tornis a fer aquest pas: el deixo tal com l’has entregat. 👍' }); }
  // a recall checkpoint sent by itself (left the page) after three quick glances
  const cp = CAT.find((a) => a.id === '4eso/ls2-recall-checkpoint-1');
  if (cp && B[13]) { const key = cp.keys[0];
    D.ck[key] = { items: { q1: { a: ['went'], q: 'Yesterday we ___ (go) to the parade.' }, q2: { a: ['on'], q: 'We exchange gifts ___ Christmas Day.' }, q3: { a: ['which', 'that'], q: 'The lamp ___ we lit was red.' } } };
    (D.cp[B[13].uid] = D.cp[B[13].uid] || {})[key] = { level: 'safe', ids: ['q1', 'q2', 'q3'], answers: ['went', 'on', 'which'], times: [12, 9, 15], started: at(17, 10, 31), sent: at(17, 10, 33), auto: 'left',
      leaves: [{ at: at(17, 10, 31, 40), ms: 900 }, { at: at(17, 10, 32), ms: 1200 }, { at: at(17, 10, 32, 30), ms: 700 }] }; }
  // 4 ESO B's LS2 web exam (Mon 23 Nov, class 15:00 Madrid = 14:00 UTC): one from home in the evening, one on a phone, one very fast, one who left full screen
  D.ex = {};
  B.slice(0, 8).forEach((s, i) => { const st = i === 1 ? at(23, 19, 40) : at(23, 14, 4 + (i % 3)), mins = i === 3 ? 11 : 38 + i;
    D.ex[s.uid] = { key: 'ls2Exam4ESO', status: 'done', paper: 'core-A', started: st, done: new Date(Date.parse(st) + mins * 60e3).toISOString(), env: { dev: i === 2 ? 'mobile' : 'cros', net: i === 1 ? '9f31c0aa' : '5e0d27b4' },
      exits: i === 4 ? [{ at: at(23, 14, 21), why: 'fullscreen', back: at(23, 14, 23) }, { at: at(23, 14, 30), why: 'left', back: at(23, 14, 31) }] : [] }; });
}

// 📐 Levels NA–AE (EL_DEMO_LV=1; Roger, 24 Nov 2026): term 1 of the demo counts levels from 1 Nov, so the Learning paths table shows the chips
if (process.env.EL_DEMO_LV) Object.values(D.tm).forEach((t) => { t.formative = { t1: 'levels', from: '2026-11-01' }; });
// …and every tab of 4 ESO LS2's first three paths was done in class on 5 Nov in 4 ESO A (Time plan ticks), so their two weeks are over
if (process.env.EL_DEMO_LV) { const ls = '4eso-seasons-and-celebrations', its = [];
  CAT.filter((a) => a.ls === ls && /getting-started|celebrations-around|where-traditions/.test(a.id)).forEach((a) => ((global.EL_SECTIONS || {})[a.id] || []).forEach(([t]) => its.push(a.id + '#' + t)));
  D.ls[ls].planEdits = Object.assign({}, D.ls[ls].planEdits, { '4ESOA': { agenda: JSON.stringify({ days: { '2026-11-05': its } }) } }); }
// 🗣 Speaking analyses (EL_DEMO_SPEAK=1): Roig's analysis of the 2 ESO A Getting started recordings (all but the last two), teacher only
if (process.env.EL_DEMO_SPEAK) {
  const c = '2eso', ls = LS2[c], gs = CAT.find((a) => a.id === c + '/ls2-getting-started'), doc = D.spk = {}, d = doc['spk_' + ls + '_2ESOA'] = {};
  const SND = [['walk', '/wɔːlk/', '/wɔːk/ (the L is silent)'], ['clothes', '/ˈkloθes/', '/kləʊðz/ (one syllable)'], ['watched', '/ˈwɒtʃɪd/', '/wɒtʃt/ (silent e)'],
    ['very', '/ˈbeɾi/', '/ˈveri/ (v with the teeth)'], ['sport', '/esˈpoɾt/', '/spɔːt/ (no e before s)'], ['music', '/muˈsik/', '/ˈmjuːzɪk/ (stress on mu)'], ['usually', '/ˈusuali/', '/ˈjuːʒuəli/'],
    ['friends', '/frens/', '/frendz/ (say the d and z)'], ['play', '/pleɪ/', ''], ['three', '/tri/', '/θriː/ (th)']];
  const GOOD = [['thing', 'th'], ['weekend', 'stress on week'], ['played', 'one syllable'], ['vegetables', '3 syllables'], ['basketball', ''], ['listen', 'silent t'], ['comfortable', '3 syllables']];
  const ERR = [['he play football', 'he plays football', 'he/she/it + -s'], ['I listen music', 'I listen to music', 'listen TO'], ['I go to the cinema the Saturday', 'I go to the cinema on Saturday', 'on + day'],
    ['she don\'t like', 'she doesn\'t like', 'doesn\'t with he/she/it'], ['I am agree', 'I agree', 'agree (no be)'], ['is very funny play', 'it is very fun to play', 'missing subject it']];
  const CON = ['and', 'but', 'because', 'then', 'also', 'so', 'first', 'after that'], TOP = ['football', 'play video games', 'go out with friends', 'listen to music', 'on Saturdays', 'swimming pool', 'hang out', 'my favourite hobby', 'twice a week'];
  const SEN = ['simple', 'joined', 'joined', 'simple', 'complex', 'words', 'joined'];
  Object.values(D.st).filter((s) => s.group === '2ESOA').slice(0, 7).forEach((s, i) => {
    const pg = D.pg[s.uid][ls], st = JSON.parse(pg[gs.keys[0]] || '{}'); st.steps.speak.audio.id = 'demo-' + s.uid; pg[gs.keys[0]] = JSON.stringify(st);
    if (i >= 5) return;
    const lv = (b) => Math.max(1, Math.min(4, b + ((i * 7 + b) % 3) - 1)), sk = 1 + (i % 3);
    d[s.uid] = { ['demo-' + s.uid]: { a: gs.id, k: 'speak', at: st.steps.speak.date, model: 'gemini-flash-latest', eur: 0.0052 + i * 0.0003, done: '2026-11-20T19:30:00Z', an: {
      summary: ['Speaks for about 40 seconds without reading; clear ideas, but the -s of he/she/it is often missing.', 'Hesitant, with long pauses; a list of hobbies with little linking.', 'Fluent and natural; good range of free-time expressions, joins ideas with because.', 'Reads part of it; short simple sentences, understandable.', 'Speaks freely with a clear start and end; some Catalan sounds in v/b.'][i],
      fluency: ['free', 'hesitant', 'free', 'reads', 'free'][i],
      good: GOOD.slice(i % 3, i % 3 + 3 + (i % 2)).map(([word, note]) => ({ word, note })),
      sounds: SND.filter((x, j) => (j + i) % 3 !== 0 && x[2]).slice(0, 3 + i % 3).map(([word, heard, tip]) => ({ word, heard, tip })),
      voc: { topic: TOP.slice(i % 4, i % 4 + 4), conn: CON.slice(0, 2 + (sk + i) % 4), rep: i % 2 ? ['like'] : ['very'], l1: i === 1 ? ['pues'] : [], note: ['Basic but enough for the task.', 'Basic: mostly "like" and "play".', 'Varied, with chunks like "hang out" and "twice a week".', 'Basic, repeats "very".', 'Good range for A2.'][i], level: lv(2 + (i === 2)) },
      gram: { good: ['present simple: "I play"', 'like + -ing: "I like swimming"', 'frequency: "twice a week"'].slice(0, 1 + i % 3), errors: ERR.filter((x, j) => (j + i) % 2 === 0).slice(0, 2 + i % 3).map(([said, correct, rule]) => ({ said, correct, rule })), note: 'Mostly present simple; no past.', level: lv(2) },
      str: { opening: i !== 1, ending: i % 2 === 0, sentences: SEN[i], order: ['A list of hobbies, then when and with whom.', 'Jumps between ideas.', 'First, then, after that: a clear sequence with reasons.', 'A list.', 'Introduction, three hobbies with reasons, a short ending.'][i], note: '', level: lv(2 + (i % 2)) },
      pron: { note: 'Understandable; the main problem is the vowel before s + consonant.', level: lv(3) }, task: { done: i === 1 ? 'partly' : 'yes', note: i === 1 ? 'Does not say how often.' : 'Covers what, when and with whom.' },
      n: { words: 70 + i * 9, clear: 46 + i * 7, sentences: 8 + (i % 3), correct: 3 + (i % 4), conn: 2 + (sk + i) % 4, secs: 40 + i * 4 } } } };
    // 📈 two later recordings (What are they doing? Speaking, then Talk), each a little better, for the 📈 Over time chart
    const wd = CAT.find((a) => a.id === c + '/ls2-what-are-they-doing'), wk = wd.keys[0], ws = JSON.parse(pg[wk] || '{"steps":{}}'); ws.steps = ws.steps || {};
    [['speak', '2026-11-11T09:20:00Z', 1], ['talk', '2026-11-18T09:40:00Z', 2]].forEach(([k, at, g]) => {
      const fid = 'demo-' + k + '-' + s.uid; ws.steps[k] = { title: k === 'talk' ? 'Talk: what are they doing?' : 'Speaking: a photo', date: at, audio: { id: fid, s: 45 + i * 5 + g * 6 } };
      d[s.uid][fid] = { a: wd.id, k, at, model: 'gemini-flash-latest', eur: 0.0055, done: at, an: { summary: 'Clearer than last time.', fluency: g === 2 || i % 2 === 0 ? 'free' : 'hesitant',
        good: [], sounds: SND.slice(0, Math.max(1, 3 - g)).map(([word, heard, tip]) => ({ word, heard, tip })), voc: { topic: TOP.slice(0, 3), conn: CON.slice(0, 2 + g + (i % 2)), rep: [], l1: [] },
        gram: { good: [], errors: ERR.slice(0, Math.max(1, 3 - g)).map(([said, correct, rule]) => ({ said, correct, rule })) }, str: { opening: true, ending: g === 2, sentences: g === 2 ? 'complex' : 'joined', level: Math.min(4, lv(2) + g - 1) },
        pron: { level: Math.min(4, lv(3) + (g === 2 ? 1 : 0)) },
        n: { words: 80 + i * 9 + g * 12, clear: 58 + i * 7 + g * 10, sentences: 9 + g, correct: 4 + (i % 4) + g * 2, conn: 2 + g + (i % 2), secs: 45 + i * 5 + g * 6 } } };
    });
    pg[wk] = JSON.stringify(ws);
  });
}

// 🧠 Practise flashcards (students/{uid}/flashcards/all): most students of each group studied some days of the last two weeks, a few never
{
  const day = (t) => { const d = new Date(t - 4 * 36e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  D.flash = {};
  for (const g of global.EL_GROUPS) Object.values(D.st).filter((s) => s.group === g.id).forEach((s, i) => {
    if (i % 5 === 4) return;   // never used them
    const ls = LS2[g.course], log = {}, c = {}, keen = rnd();
    for (let k = 0; k < 14; k++) if (rnd() < keen) { const n = 5 + Math.floor(rnd() * 30), r = Math.floor(n * (0.4 + rnd() * 0.3)); log[day(Date.now() - k * 864e5)] = [n, Math.floor(n * (0.7 + rnd() * 0.25)), n * (6 + Math.floor(rnd() * 8)), Math.min(15, n - r), r, Math.floor(r * (0.65 + rnd() * 0.3))]; }
    const seen = Object.values(log).reduce((a, x) => a + x[3], 0);
    for (let k = 0; k < seen; k++) { const ivl = rnd() < 0.7 ? 1 + Math.floor(rnd() * (k % 7 ? 8 : 30)) : 0; c['v:demo' + k] = ivl ? [2, Date.now() + ivl * 864e5, ivl, 2500, 0, 3, 0, Date.now()] : [1, Date.now(), 0, 2500, 1, 1, 0, Date.now()]; }
    if (Object.keys(log).length) D.flash[s.uid] = { decks: { [ls]: { c, log } } };
  });
}

// none of the invented names may be a real student's (the private list, if it is on this machine)
const LIST = process.env.EL_STUDENT_LIST;
if (LIST && fs.existsSync(LIST)) {
  const real = fs.readFileSync(LIST, 'utf8').toLowerCase();
  const clash = Object.values(D.ro).filter((r) => real.includes(r.surname1.toLowerCase()) && real.includes(r.first.toLowerCase()));
  if (clash.length) { console.error('Names that may be real:', clash.map((r) => r.first + ' ' + r.surname1).join(', ')); process.exit(1); }
}

// ---- serve the repo with the data injected ----
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4' };
const body = (rel) => {
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return null;
  let b = fs.readFileSync(file);
  if (rel === 'teacher.html') { const s = b.toString(), i = s.indexOf('<script src="shared/js/el-catalog.js">'); b = s.slice(0, i) + `<script>window.EL_DEMO_DATA=${JSON.stringify(D)}</script>\n` + s.slice(i); }
  return b;
};
// tools/smoke/check.mjs imports the data (and the page with it injected) without serving or taking pictures
export { D, body };
const MAIN = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (!MAIN) { /* imported */ } else if (process.argv.includes('--serve')) {
  http.createServer((q, r) => { const rel = decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/^\/+/, '') || 'teacher.html', b = body(rel);
    if (b == null) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': TYPES[path.extname(rel)] || 'application/octet-stream' }); r.end(b); }).listen(8765);
  console.log('http://127.0.0.1:8765/teacher.html');
} else {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await page.route('http://el.local/**', (route) => { const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, '') || 'teacher.html', b = body(rel);
    return b == null ? route.fulfill({ status: 404, body: '' }) : route.fulfill({ status: 200, body: b, contentType: TYPES[path.extname(rel)] || 'application/octet-stream' }); });
  await page.route(/^https?:\/\/(?!el\.local)/, (r) => r.abort());
  page.on('pageerror', (e) => console.log('page error:', e.message));
  const { shots } = await import('./teacher-shots.mjs');
  await page.goto('http://el.local/teacher.html');
  await page.waitForTimeout(1500);
  await shots(page, OUT);
  await browser.close();
}
