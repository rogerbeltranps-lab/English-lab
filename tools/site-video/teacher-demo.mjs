// The teacher dashboard (teacher.html) with SAMPLE students for the "How the dashboard works" video (Roger, 31 Oct 2026).
// teacher.html has a demo mode: a page that defines window.EL_DEMO_DATA gets that data and no Firebase, and nothing is saved.
// Every name here is invented (checked against the real student list so none matches); marks, routes and answers are random.
// Runs offline from the repo files. Usage: node tools/site-video/teacher-demo.mjs [outdir] [--serve]   → t-*.png
//   --serve: only start the page on http://127.0.0.1:8765/teacher.html (to look at it), no screenshots.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
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
    D.lv[uid] = { [LS1[c]]: { level: 'safe', by: 'teacher' }, [LS2[c]]: { level: cut(mark), by: 'teacher', why: 'exam', changed: Date.now() - 86400e3 } };
    // LS2 work in the open learning paths
    const pg = {};
    for (const a of CAT.filter((x) => x.ls === LS2[c] && OPEN[c].includes(x.id) && !x.checkpoint)) {
      const st = ACT[a.id] || [], k = Math.min(st.length, Math.floor((skill + rnd() * 0.6) * st.length)), done = {};
      st.slice(0, k).forEach((s) => (done[s] = true));
      // first try and latest check of each step done (score out of max), and the reading log handed in
      const tries = {}, last = {}, steps = {};
      st.slice(0, k).forEach((s) => { const m = 4 + Math.floor(rnd() * 7), f = Math.round(m * Math.min(1, skill * 0.8 + rnd() * 0.3));
        tries[s] = { score: f, max: m }; last[s] = { score: Math.min(m, f + Math.floor(rnd() * 3)), max: m, date: Date.now() - 86400e3 }; });
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
    D.pt[email] = { t1: Math.floor(rnd() * rnd() * 16) };
  }
  D.tm[g.id] = { best: { t1: 15 }, bestOk: { t1: 12 } };
}
// a route request, two problem reports and a suggestion, in 4 ESO A
const a4 = Object.values(D.st).filter((s) => s.group === '4ESOA');
D.lv[a4[3].uid][LS2['4eso']] = Object.assign(D.lv[a4[3].uid][LS2['4eso']], { level: 'safe', request: 'daring', reason: 'I find Core easy and I want more challenge.' });
D.pb.push({ id: 'p1', uid: a4[5].uid, group: '4ESOA', kind: 'media', text: 'The audio of the listening does not play.', page: '4eso/seasons-and-celebrations/celebrations-around-the-world.html', title: 'Celebrations around the world', section: 'Listening', route: 'safe', device: 'Chromebook', created: Date.now() - 2 * 3600e3 });
D.pb.push({ id: 'p2', uid: a4[9].uid, group: '4ESOA', kind: 'marking', text: '"It takes place in autumn" is marked wrong.', page: '4eso/seasons-and-celebrations/celebrations-around-the-world.html', title: 'Celebrations around the world', section: 'Grammar', route: 'insecure', device: 'Windows', created: Date.now() - 26 * 3600e3 });
D.sg.push({ id: 's1', uid: a4[7].uid, group: '4ESOA', text: 'Could we have more vocabulary games for each Learning Path?', page: 'lab/index.html', created: Date.now() - 5 * 3600e3 });

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
if (process.argv.includes('--serve')) {
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
