// The invented school the tests start from (never a real student): Alex Sample, 4 ESO A, Core, and Pau Exemple, 2 ESO A, Base,
// both on the student list, with LS2 open for their group. Roger's account is roger.beltranps@gmail.com (the dashboard knows the teacher
// by that address), here with a test password on the test copy of the database only.
export const LS4 = '4eso-seasons-and-celebrations', LS2 = '2eso-free-time-live';
export const NOW = Date.parse('2026-11-25T10:30:00+01:00');   // Wednesday 25 Nov 2026, 10:30 in Madrid, during a class day
export const AFTERNOON = Date.parse('2026-11-25T18:30:00+01:00');   // the same day after 17:00, when Beltran's corrections show
const P4 = (n) => '4eso/ls2-' + n, P2 = (n) => '2eso/ls2-' + n;
export const OPEN4 = ['getting-started', 'celebrations-around-the-world', 'recall-checkpoint-1', 'where-traditions-come-from', 'recall-checkpoint-2', 'plan-the-day',
  'recall-checkpoint-3', 'write-to-the-head-teacher', 'recall-checkpoint-4', 'research-it-right', 'celebration-day-proposal', 'sample-exam'].map(P4);

// Alex's work so far, as the site saves it (students/{uid}/progress/{ls}.data): LP1, LP2 and the recall checkpoints done; on LP3
// (Where traditions come from) everything but the Listening chart, the Speaking and the Talk. From the board video's invented student.
const st = (done, at = '2026-11-04T17:00:00.000Z', extra = {}) => JSON.stringify(Object.assign({ done: Object.fromEntries(done.map((k) => [k, true])), doneAt: Object.fromEntries(done.map((k) => [k, Date.parse(at)])) }, extra));
const LP = ['recall', 'cards', 'practice'];
export const ALEX_WORK = {
  ls2GettingStarted4ESOLevel: 'safe', ls2GettingStarted4ESO: st(['recall', 'words', 'read', 'listen', 'speak'], '2026-10-26T17:00:00Z'),
  ls2Celebrations4ESOLevel: 'safe', ls2Celebrations4ESO: st([...LP, 'vocabEx', 'read', 'log', 'listen', 'grammar', 'mixed', 'write', 'speak'], '2026-10-28T17:00:00Z'),
  ls2Checkpoint14ESO: st(['check'], '2026-11-02T17:00:00Z'), ls2Checkpoint24ESO: st(['check'], '2026-11-03T17:00:00Z'),
  ls2Checkpoint34ESO: st(['check'], '2026-11-10T17:00:00Z'), ls2Checkpoint44ESO: st(['check'], '2026-11-16T17:00:00Z'),
  ls2Traditions4ESOLevel: 'safe', ls2Traditions4ESO: st([...LP, 'grammarPrep', 'listen', 'read', 'shadow', 'grammar', 'grammarRel', 'grammarComp', 'grammarFeel', 'mixed', 'write']),
};

// the tabs done in class with 4 ESO A, as Roger ticks them on the Time plan (ls/{id}.done[group] = {"activity#tab": day})
const tabs = (a, ids, day) => Object.fromEntries(ids.map((k) => [P4(a) + '#' + k, day]));
export const DONE4 = Object.assign({},
  tabs('getting-started', ['recall', 'words', 'read', 'listen', 'speak'], '2026-10-26'),
  tabs('celebrations-around-the-world', [...LP, 'vocabEx', 'read', 'log', 'listen', 'grammar', 'mixed', 'write', 'speak'], '2026-10-28'),
  tabs('recall-checkpoint-1', ['check'], '2026-11-02'), tabs('recall-checkpoint-2', ['check'], '2026-11-03'),
  tabs('where-traditions-come-from', [...LP, 'grammarPrep', 'listen', 'read', 'chart', 'shadow', 'grammar', 'grammarRel', 'grammarComp', 'grammarFeel', 'mixed', 'write', 'speak', 'talk'], '2026-11-04'));

export async function school(t, { level = 'safe', extra = {}, work = ALEX_WORK } = {}) {
  const alex = await t.user({ uid: 'u-alex', email: 'alex.sample@ietramuntana.cat', name: 'Alex Sample' });
  const pau = await t.user({ uid: 'u-pau', email: 'pau.exemple@ietramuntana.cat', name: 'Pau Exemple' });
  const roger = await t.user({ uid: 'u-teacher', email: 'roger.beltranps@gmail.com', name: 'Roger (test)' });
  await t.seed(Object.assign({
    'roster/alex.sample@ietramuntana.cat': { group: '4ESOA', first: 'Alex', surname1: 'Sample' },
    'roster/pau.exemple@ietramuntana.cat': { group: '2ESOA', first: 'Pau', surname1: 'Exemple' },
    'students/u-alex': { group: '4ESOA', name: 'Alex Sample', email: alex.email },
    'students/u-pau': { group: '2ESOA', name: 'Pau Exemple', email: pau.email },
    ['students/u-alex/levels/' + LS4]: { level },
    ['students/u-alex/progress/' + LS4]: { data: work },
    ['students/u-pau/levels/' + LS2]: { level: 'insecure' },
    ['ls/' + LS4]: { status: 'open', groups: ['4ESOA', '4ESOB'], open: { '4ESOA': OPEN4, '4ESOB': OPEN4 }, done: { '4ESOA': DONE4 } },
    ['ls/' + LS2]: { status: 'open', groups: ['2ESOA', '2ESOB'], open: { '2ESOA': [P2('getting-started'), P2('my-free-time')], '2ESOB': [] } },
    ['ls/4eso-my-real-routine']: { status: 'closed', groups: ['4ESOA', '4ESOB'] },
    ['ls/2eso-my-real-routine']: { status: 'closed', groups: ['2ESOA', '2ESOB'] },
  }, extra));
  return { alex, pau, roger };
}
// the state a learning path page keeps (its localStorage key, also students/{uid}/progress/{ls}.data[key])
export async function lpState(t, uid, ls, key) {
  const d = await t.read(`students/${uid}/progress/${ls}`);
  try { return JSON.parse(((d || {}).data || {})[key] || 'null'); } catch (e) { return null; }
}
