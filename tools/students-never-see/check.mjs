// 🙈 Students never see Roger's own course (Towards Nativeness, a personal LS: personal:true in EL_LS) (Roger, 17 + 20 Nov 2026: "students
// see towards nativeness and that was a rule, they mustn't see it"). docs/REQUIREMENTS.md §3.
// 1. Runs shared/js/el-catalog.js as each kind of visitor and checks who gets the personal LS in EL_LS / EL_CATALOG:
//    a student, a signed-out visitor and the teacher's student view (👁, today.html?student= or sessionStorage el_as) never do;
//    the teacher (own view, the dashboard, the course's own pages) and the tester do.
// 2. No student page names it: the words "Towards Nativeness" appear only in the course's own folder, the dashboard and code comments.
// Usage: node tools/students-never-see/check.mjs   (exit 1 and a list of problems if anything is off)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CAT = fs.readFileSync(path.join(ROOT, 'shared/js/el-catalog.js'), 'utf8');
const problems = [];
const store = o => ({ getItem: k => (k in o ? o[k] : null), setItem: (k, v) => { o[k] = String(v) }, removeItem: k => { delete o[k] } });
function run({ role, page = '/English-lab/today.html', search = '', as = false }) {
  const ls = role ? { el_who: JSON.stringify({ uid: 'u1', role }) } : {}, ss = as ? { el_as: JSON.stringify({ uid: 's1' }) } : {};
  const win = { localStorage: store(ls), sessionStorage: store(ss), location: { pathname: page, search, hash: '' } };
  const ctx = vm.createContext(Object.assign(win, { window: win, console }));
  win.window = win;
  vm.runInContext(CAT, ctx);
  return { ls: win.EL_LS.some(l => l.personal), cat: win.EL_CATALOG.some(a => /towards-nativeness/.test(a.ls)) };
}
const CASES = [
  ['a student', { role: 'student' }, false],
  ['a student on another page', { role: 'student', page: '/English-lab/4eso/seasons-and-celebrations/index.html' }, false],
  ['a signed-out visitor', {}, false],
  ["the teacher's student view, first load of the board (?student=)", { role: 'teacher', search: '?student=abc#marks' }, false],
  ["the teacher's student view on an LS page (el_as)", { role: 'teacher', page: '/English-lab/4eso/seasons-and-celebrations/index.html', as: true }, false],
  ["the teacher's student view on the board (el_as)", { role: 'teacher', as: true }, false],
  ["the teacher's exam report frame (?embed=exam&student=)", { role: 'teacher', search: '?embed=exam&student=abc' }, false],
  ['the teacher, own view', { role: 'teacher' }, true],
  ['the teacher on the dashboard', { role: 'teacher', page: '/English-lab/teacher.html', as: true }, true],
  ['the teacher on the course itself', { role: 'teacher', page: '/English-lab/4eso/towards-nativeness/index.html' }, true],
  ['the tester', { role: 'tester' }, true],
];
for (const [who, o, sees] of CASES) {
  const r = run(o);
  if (r.ls !== sees || r.cat !== sees) problems.push(`${who}: ${sees ? 'should' : 'must not'} get Towards Nativeness (EL_LS ${r.ls}, EL_CATALOG ${r.cat})`);
}
// 2. the name in a student page's own text (comments stripped)
const ALLOW = [/^4eso\/towards-nativeness\//, /^teacher\.html$/, /^tools\//, /^docs\//, /^AGENTS\.md$/, /^TASKS\.md$/, /^README\.md$/];
const strip = (s, ext) => ext === '.html' ? s.replace(/<!--[\s\S]*?-->/g, '') : s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`\\])\/\/[^\n]*/g, '$1');
const walk = d => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap(e => e.name.startsWith('.') || e.name === 'node_modules' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let files = 0;
for (const f of walk('.').map(f => f.replace(/^\.\//, ''))) {
  const ext = path.extname(f);
  if (!['.html', '.js', '.mjs', '.json'].includes(ext) || ALLOW.some(r => r.test(f))) continue;
  files++;
  const txt = strip(fs.readFileSync(path.join(ROOT, f), 'utf8'), ext);
  const n = (txt.match(/Towards Nativeness/gi) || []).length;
  // el-catalog.js names it once, in the hidden LS's own entry
  if (n > (f === 'shared/js/el-catalog.js' ? 1 : 0)) problems.push(`${f}: says "Towards Nativeness" ${n} time(s) outside a comment (students could see it)`);
}
if (problems.length) { console.log(problems.join('\n')); console.log(`\n${problems.length} problem(s).`); process.exit(1); }
console.log(`OK: students never see Towards Nativeness (${CASES.length} visitors, ${files} student-facing files).`);
