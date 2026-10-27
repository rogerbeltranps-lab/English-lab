// Reads the LS1 My Real Routine Learning Path pages and writes the data for the study summary (vocabulary and grammar by route).
// Usage: node tools/study-summary/dump.js <2eso|4eso> OUT.json   (run from the repo root)
// The Word and PDFs are then written by build.py. Rebuild when a Learning Path's vocabulary or grammar changes.
const fs = require('fs'), vm = require('vm');
const [course, out] = process.argv.slice(2);
if (!['2eso', '4eso'].includes(course) || !out) { console.error('usage: node dump.js <2eso|4eso> OUT.json'); process.exit(1); }
const dir = course + '/my-real-routine/';

// Source of a `const NAME=` literal (or function), read up to its matching bracket.
function literal(src, name) {
  const m = new RegExp('(?:const|function)\\s+' + name + '\\s*[=(]').exec(src);
  if (!m) throw new Error(name + ' not found');
  let i = src.indexOf(m[0].endsWith('(') ? '(' : '=', m.index) + (m[0].endsWith('(') ? 0 : 1), depth = 0, q = null;
  const start = m[0].startsWith('function') ? m.index : i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) { depth--; if (depth === 0 && !m[0].startsWith('function')) return src.slice(start, i + 1); }
    if (m[0].startsWith('function') && c === '}' && depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(name + ' not closed');
}
function load(file, names) {
  const src = fs.readFileSync(dir + file, 'utf8'), ctx = {};
  vm.createContext(ctx);
  for (const n of names) {
    const lit = literal(src, n);
    vm.runInContext(lit.startsWith('function') ? lit : 'var ' + n + '=' + lit + ';', ctx);
  }
  return ctx;
}
const ROUTES = ['insecure', 'safe', 'daring'];
const strip = h => h.replace(/<br\s*\/?>/g, ' · ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// vocabMap pages (A day in…, Healthy habits): groups per route, cumulative on the site.
function vocabMapPage(file) {
  const c = load(file, ['vocabMap', 'ca', 'examples', 'exampleFor']);
  const groups = [];
  for (const r of ROUTES) for (const [name, items] of c.vocabMap[r])
    groups.push({ name, route: r, items: items.map(x => [x, c.ca[x] || '', vm.runInContext('exampleFor(' + JSON.stringify(x) + ')', c)]) });
  return groups;
}
// Connectors of the writing task, per route (levelInfo.connectors).
function connectors(file, title) {
  const c = load(file, ['levelInfo']);
  return ROUTES.filter(r => c.levelInfo[r].connectors).map(r => ({
    title, route: r, only: true,
    how: [(r === 'insecure' ? 'Connectors de la tasca d’escriptura: ' : 'Connectors for the writing task: ') + c.levelInfo[r].connectors.join(' · ') + '.']
  }));
}
// Grammar page (`course` object): lessons = how it works; recognise, controlled, transform and edit = practice with answers.
function grammarPage(file) {
  const c = load(file, ['course']);
  return ROUTES.map(r => {
    const d = c.course[r], practice = [];
    for (const k of ['recognise', 'controlled', 'transform', 'edit']) for (const q of d[k] || []) {
      let p = strip(q.prompt);
      if (q.options && q.options.length && p.includes('___')) p += ' (' + q.options.map(strip).join(' / ') + ')';
      practice.push([p, q.answers.map(strip).join(' / '), strip(q.why || '')]);
    }
    return { title: null, route: r, only: true, lessons: d.lessons.map(([t, h]) => [strip(t), h]), practice };
  });
}

const lps = [];
if (course === '4eso') {
  const ue = load('useful-expressions.html', ['vocabBase', 'safeFocus', 'daringFocus', 'levels', 'compareSupport']);
  lps.push({ n: 1, title: 'Getting started', vocab: [], grammar: [], none: true });
  lps.push({ n: 2, title: 'A day in real life', vocab: vocabMapPage('a-day-in-real-life.html'), grammar: connectors('a-day-in-real-life.html', 'Connectors') });
  lps.push({
    n: 3, title: 'Useful expressions',
    vocab: [
      { name: 'Everyday expressions', route: 'insecure', items: ue.vocabBase.map(([e, ca, , x]) => [e, ca, x]) },
      { name: 'Expression + small word', route: 'safe', items: ue.safeFocus },
      { name: 'Comparison', route: 'daring', items: ue.daringFocus },
      { name: 'Words in the listening and the reading (to understand)', nameCa: 'Paraules de l’audició i la lectura (per entendre-les)', route: 'insecure', receptive: true, items: [
        ['set off', 'sortir (de viatge, de casa)', 'I set off at seven thirty.'],
        ['beat the morning rush', 'evitar l’hora punta del matí', 'I left early to beat the morning rush.'],
        ['catch up on', 'posar-se al dia amb', 'I caught up on emails on the train.'],
        ['get down to', 'posar-se a (fer una feina)', 'I get down to my homework after a snack.'],
        ['put off', 'ajornar, deixar per més tard', 'I put off the marking.'],
        ['pick up', 'recollir, comprar de passada', 'I picked up some groceries.'],
        ['whip up (dinner)', 'preparar (el sopar) de pressa', 'I whipped up a quick dinner.'],
        ['bite the bullet', 'fer de tripes cor', 'I bit the bullet and started the marking.'],
        ['call it a day', 'plegar per avui', 'At five, I called it a day.'],
        ['hit the road', 'posar-se en camí, marxar', 'Time to hit the road!']
      ] }
    ],
    grammar: [
      ...ROUTES.map(r => {
        const d = ue.compareSupport[r];
        const pick = { insecure: [0, 1], safe: [1, 3], daring: [2, 3] }[r];
        return { title: r === 'insecure' ? 'Rutina o un dia diferent: usually / yesterday' : 'A usual day and a different day', route: r, only: true,
          how: [d.note, ...d.models.map(([l, t]) => l + ': ' + t)],
          practice: pick.map(i => d.questions[i]).map(([q, o, a]) => [q, o[a], '']) };
      }),
      ...ROUTES.map(r => ({ title: r === 'insecure' ? 'Les expressions en frases' : r === 'safe' ? 'Expressions with at / for / with / by / on' : 'Precise expressions and comparison', route: r, only: true,
        how: [], practice: ue.levels[r].gaps.map(([q, , a]) => [q, a, '']) }))
    ]
  });
  lps.push({ n: 4, title: 'Present Simple & Phrasal verbs', vocab: [], grammar: grammarPage('grammar-phrasal-verbs.html') });
  lps.push({ n: 5, title: 'Healthy habits', vocab: vocabMapPage('healthy-habits.html'), grammar: connectors('healthy-habits.html', 'Connectors') });
} else {
  const sd = load('same-day-different-person.html', ['baseVocab', 'safeExtra', 'daringExtra', 'vocabFor', 'cardFor', 'levels']);
  const src = fs.readFileSync(dir + 'same-day-different-person.html', 'utf8');
  // The route's "Recorda / Notice / Comparison language" box: one line per row.
  const focusRows = r => {
    const html = (src.match(new RegExp("if\\(level==='" + r + "'\\)focus\\.innerHTML='([^']*)'")) || src.match(/else focus\.innerHTML='([^']*)'/))[1];
    return [...html.matchAll(/<strong>(.*?)<\/strong><div class="focus-meaning">(.*?)<\/div>/g)].map(m => strip(m[1]) + ': ' + strip(m[2]));
  };
  const why = (q, a, ca) => {
    const plural = /^(They|Mia and Leo|We|I|You)\b/.test(q);
    if (plural) return ca ? 'Amb they o dues persones: verb sense -s.' : 'They / two people: base form, no -s.';
    if (a === 'has') return ca ? 'Amb he / she, have passa a has.' : 'He / she: have → has.';
    if (a === 'does') return ca ? 'Amb he / she, do passa a does.' : 'He / she: do → does.';
    if (a === 'goes' || a === 'watches') return ca ? 'Amb he / she, afegeix -es.' : 'He / she: verb + -es.';
    return ca ? 'Amb he / she, el verb porta -s.' : 'He / she: verb + -s.';
  };
  lps.push({ n: 1, title: 'Getting started', vocab: [], grammar: [], none: true });
  lps.push({ n: 2, title: 'Routine expressions', vocab: vocabMapPage('a-day-in-my-life.html'), grammar: connectors('a-day-in-my-life.html', 'Connectors') });
  lps.push({
    n: 3, title: 'Same day, different person',
    vocab: [
      { name: 'Everyday expressions', route: 'insecure', items: sd.baseVocab.map(v => [v.e, v.m, v.x]) },
      { name: 'Expression + small word', route: 'safe', items: sd.safeExtra.map(v => [v.e, v.m, v.x]) },
      { name: 'Comparison', route: 'daring', items: sd.daringExtra.map(v => [v.e, v.m, v.x]) }
    ],
    grammar: ROUTES.map(r => ({
      title: r === 'insecure' ? 'He / she: el verb canvia' : 'He / she: verb + -s', route: r, only: true,
      how: focusRows(r),
      practice: sd.levels[r].forms.map(([q, , a]) => [q, a, why(q, a, r === 'insecure')])
    }))
  });
  lps.push({ n: 4, title: 'Present Simple', vocab: [], grammar: grammarPage('present-simple-grammar.html') });
  lps.push({ n: 5, title: 'Healthy habits', vocab: vocabMapPage('healthy-habits.html'), grammar: connectors('healthy-habits.html', 'Connectors') });
}
lps.push({ n: 6, title: 'Final product', vocab: [], grammar: [], none: true });
fs.writeFileSync(out, JSON.stringify({ course, lps }, null, 1));
console.log('wrote', out);
