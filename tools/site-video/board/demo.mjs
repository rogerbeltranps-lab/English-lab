// Sample data for the "Your student board" video (Roger, 2 Nov 2026): an invented student, never a real one.
// English = a 4 ESO Core student (the board is in English for Core and Plus); Catalan = a 2 ESO Base student (in Catalan for Starter and Base).
// LS2 is the real LS2 of each course (its learning paths, recall checkpoints, time plan and final product). The exam report is an LS1
// report (LS2 has no exam marks yet): real LS1 questions, invented answers and an invented writing. The final product mark is invented too.
// phase "mid": Monday 16 Nov 2026, in the middle of LS2. phase "end": Wednesday 16 Dec 2026, the final product marked.

const DAY = (d, h = 17) => new Date(`${d}T${String(h).padStart(2, '0')}:00:00`).getTime();
const st = (done, at = {}, extra = {}) => JSON.stringify({ done: Object.fromEntries(done.map((k) => [k, true])), doneAt: at, ...extra });
const all = (ks, d) => Object.fromEntries(ks.map((k) => [k, DAY(d)]));

// ---------- 4 ESO · Core · English ----------
function en(phase) {
  const LS1 = '4eso-my-real-routine', LS2 = '4eso-seasons-and-celebrations', G = '4ESOA';
  const P = (n) => '4eso/ls2-' + n;
  const open = [P('getting-started'), P('celebrations-around-the-world'), P('recall-checkpoint-1'), P('where-traditions-come-from'), P('recall-checkpoint-2'),
    P('plan-the-day'), P('recall-checkpoint-3'), P('write-to-the-head-teacher'), P('recall-checkpoint-4'), P('celebration-day-proposal')];
  const end = phase === 'end';
  if (end) open.push(P('sample-exam'), P('research-it-right'), P('reflect'));
  const LP = ['recall', 'cards', 'practice'];
  const pg = {
    ls2GettingStarted4ESO: st(['recall', 'words', 'read', 'listen', 'speak'], all(['recall', 'words', 'read', 'listen', 'speak'], '2026-10-26')),
    // LP2: everything done; the reading log one day after its day (amber)
    ls2Celebrations4ESO: st([...LP, 'read', 'log', 'listen', 'grammar', 'mixed', 'write', 'speak'],
      { ...all([...LP, 'read', 'listen', 'grammar', 'mixed', 'write', 'speak'], '2026-10-28'), log: DAY('2026-11-03') }),
    ls2Checkpoint14ESO: st(['check'], all(['check'], '2026-11-02')),
    // LP3: Speaking and Talk missing although their day has passed
    ls2Traditions4ESO: st([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write'], all([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write'], '2026-11-04')),
    ls2Checkpoint24ESO: st(['check'], all(['check'], '2026-11-03')),
    ls2Plan4ESO: st([...LP, 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], all([...LP, 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], '2026-11-10'), { steps: { talk: { avg: 3, comment: '' } } }),
    ls2Checkpoint34ESO: st(['check'], all(['check'], '2026-11-10')),
    ls2Email4ESO: st(['recall', 'cards'], all(['recall', 'cards'], '2026-11-16')),
  };
  if (end) {
    Object.assign(pg, {
      ls2Traditions4ESO: st([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], all([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], '2026-11-04')),
      ls2Email4ESO: st([...LP, 'read', 'register', 'again', 'shadow', 'grammar', 'write', 'speak', 'talk'], all([...LP, 'read', 'register', 'again', 'shadow', 'grammar', 'write', 'speak', 'talk'], '2026-11-16')),
      ls2Checkpoint44ESO: st(['check'], all(['check'], '2026-11-16')),
      ls2Research4ESO: st(['recall', 'read', 'sources', 'respect', 'notes', 'credit', 'again', 'shadow', 'talk', 'card'], all(['recall', 'read', 'sources', 'respect', 'notes', 'credit', 'again', 'shadow', 'talk', 'card'], '2026-11-25')),
      ls2SampleExam4ESO: st(['listen', 'chart', 'read', 'log', 'vocab', 'grammar', 'write'], all(['listen', 'chart', 'read', 'log', 'vocab', 'grammar', 'write'], '2026-11-19')),
      ls2Reflect4ESO: st(['self', 'reflect'], all(['self', 'reflect'], '2026-12-14')),
    });
  }
  // the final product: every step handed in, with the self-assessment, and the teacher's answers
  const fpSteps = end ? {
    prep: { avg: 3, comment: 'I chose the email and my part about the lanterns.' }, source: { avg: 4, comment: '' }, contribution: { avg: 3, comment: '' },
    part: { avg: 3, comment: 'I was nervous in the video.' }, email: { avg: 4, comment: '' }, feedback: { avg: 3, comment: '' }, team: { avg: 4, comment: '' },
  } : { prep: { avg: 3, comment: 'I chose the email and my part about the lanterns.' } };
  pg.ls2FinalProduct4ESO = JSON.stringify({ done: end ? { video: true, email: true, submit: true } : {}, steps: fpSteps });
  const rs = {
    [P('celebrations-around-the-world')]: { activity: P('celebrations-around-the-world'), score: 9, max: 10 },
    [P('recall-checkpoint-1')]: { activity: P('recall-checkpoint-1'), score: 1, max: 1 },
    [P('where-traditions-come-from')]: { activity: P('where-traditions-come-from'), score: end ? 10 : 8, max: 11 },
    [P('recall-checkpoint-2')]: { activity: P('recall-checkpoint-2'), score: 1, max: 1 },
    [P('plan-the-day')]: { activity: P('plan-the-day'), score: 10, max: 11, replies: { write: 'Good plan! Check the future: "We are going to meet at 6", not "We go to meet".' } },
    [P('recall-checkpoint-3')]: { activity: P('recall-checkpoint-3'), score: 1, max: 1 },
    [P('celebration-day-proposal')]: end ? { activity: P('celebration-day-proposal'), score: 7.8, max: 10,
      feedback: 'Your email is polite and well organised, and your source is reliable. In the video, look at the camera and speak a bit more slowly. Well done!',
      replies: { prep: 'Good choice: now find one reliable source.', part: 'You were clear! Next time, practise your part twice before recording.' } }
      : { activity: P('celebration-day-proposal'), replies: { prep: 'Good choice: now find one reliable source.' } },
    // LS1: only the exam (75 %) and the final product (25 %)
    '4eso/final-product': { activity: '4eso/final-product', score: 8, max: 10, feedback: 'Clear presentation and good slides. Speak a bit louder next time.' },
    [LS1 + '/assessment']: { activity: LS1 + '/assessment', version: 'safe', sections: {
      listening: { score: 8, max: 10 }, reading: { score: 10, max: 10 }, vocabulary: { score: 23, max: 28 }, grammar: { score: 24, max: 32 },
      wtask: { score: 6, max: 8 }, wgrammar: { score: 2, max: 4 }, wvocab: { score: 3, max: 4 }, worg: { score: 3, max: 4 } }, report: report4() },
    [LS2 + '/assessment']: { activity: LS2 + '/assessment', progress: end
      ? { exam: 7.6, fp: 7.8, gv: 8.1, other: 8.5, total: 7.9, at: '2026-12-16', parts: { gv: { cp: 9, warm: 8.5, time: 8, skills: 7.6 } } }
      : { gv: 7.2, other: 8, at: '2026-11-16', parts: { gv: { cp: 10, warm: 9, time: 7.5, skills: 5.8 } } } },
  };
  if (end) rs[LS2 + '/assessment'].sections = { listening: { score: 16, max: 20 }, reading: { score: 15, max: 20 }, vocabulary: { score: 11, max: 15 }, grammar: { score: 11, max: 15 }, writing: { score: 23, max: 30 } };
  return {
    today: end ? '2026-12-16' : '2026-11-16',
    demo: {
      me: { name: 'Alex Sample', group: G }, rs, lv: { [LS2]: { level: 'safe', by: 'teacher' }, [LS1]: { level: 'safe', by: 'teacher' } },
      pg: { [LS2]: pg, [LS1]: {} },
      ls: { [LS1]: { status: 'closed' }, [LS2]: { status: 'open', open: { [G]: open } }, '2eso-my-real-routine': { status: 'hidden' }, '2eso-free-time-live': { status: 'hidden' } },
      pt: { t1: 18, t2: 6 }, tm: { best: { t1: 24, t2: 9 }, bestOk: { t1: 24, t2: 9 } },
      ann: [{ id: 'a1', text: 'Remember: the LS2 exam is on Monday 23 November. Do the Sample exam learning path to prepare!', created: DAY('2026-11-13', 12), read: {} }],
    },
  };
}

// The LS1 4 ESO exam report: questions from the real LS1 exam (model B), the answers and the writing invented.
function report4() {
  const lp2 = { t: 'LP2 · A day in real life', href: '4eso/my-real-routine/a-day-in-real-life.html' }, lp3 = { t: 'LP3 · Useful expressions', href: '4eso/my-real-routine/useful-expressions.html' }, lp4 = { t: 'LP4 · Present Simple & Phrasal verbs', href: '4eso/my-real-routine/grammar-phrasal-verbs.html' };
  return {
    model: 'B',
    questions: [
      { q: 2, part: 'Listening', pts: 2, got: 0, text: 'When does Nora usually begin her homework?', mine: 'C. At 6:00.', right: 'A. At 5:00.', why: 'Listen again for the exact time: Nora starts at five, and at six she has a break.', lp: lp2 },
      { q: 14, part: 'Vocabulary', pts: 2, got: 0, text: 'To show appreciation, they ___ a compliment to the team.', mine: 'A. make', right: 'B. pay', why: 'The collocation is “pay a compliment”.', lp: lp3 },
      { q: 20, part: 'Vocabulary', pts: 3, got: 0, text: 'She winds down ___ a book.', mine: 'at', right: 'with', why: 'We say “wind down with” something (a book, music…).', lp: lp2 },
      { q: 23, part: 'Grammar', pts: 2, got: 0, text: 'She ___ usually ___ her homework until late. (negative)', mine: 'A. don’t / put off', right: 'D. doesn’t / put off', why: 'In the Present Simple, use don’t/doesn’t + the base form: she → doesn’t.', lp: lp4 },
      { q: 30, part: 'Grammar', pts: 3, got: 0, text: 'My dad ___ errands after lunch. (run)', mine: 'run', right: 'runs', why: 'Check Present Simple agreement: he/she + verb + -s.', lp: lp4 },
      { q: 33, part: 'Grammar', pts: 4, got: 1, text: 'When ___ down to work? (he / get)', mine: 'he gets', right: 'does he get', why: 'For Present Simple questions, use Do/Does + subject + base verb.', lp: lp4 },
    ],
    writing: {
      original: 'Mark gets up at seven and he have a quick shower. He has cereals for breakfast and he leave home at eight. He go to school by bus with his friends. In the afternoon he does his homework and he plays football twice a week. In the evening he chill out and he watch series. He goes to bed at eleven. My routine is similar because I play football too.',
      corrected: 'Mark gets up at seven and he *has* a quick shower. He has cereal for breakfast and he *leaves* home at eight. He *goes* to school by bus with his friends. In the afternoon, he does his homework and he plays football twice a week. In the evening, he *chills* out and *watches* series. *Finally,* he goes to bed at eleven. My routine is similar because I play football too.',
      rubric: [{ name: 'C1 · Task achievement', score: 6, max: 8 }, { name: 'C2 · Grammar', score: 2, max: 4 }, { name: 'C3 · Vocabulary', score: 3, max: 4 }, { name: 'C4 · Organisation and cohesion', score: 3, max: 4 }],
      feedback: 'Your text is clear and you describe the whole day. Add a difference and a short conclusion, and check the -s with he/she.',
      errors: [
        { type: 'Grammar', orig: 'he have a quick shower', fix: 'he has a quick shower', why: 'He/she + has.' },
        { type: 'Grammar', orig: 'he leave home', fix: 'he leaves home', why: 'Present Simple: he/she + verb + -s.' },
        { type: 'Grammar', orig: 'He go to school', fix: 'He goes to school', why: 'go → goes with he/she.' },
        { type: 'Grammar', orig: 'he chill out and he watch', fix: 'he chills out and watches', why: 'Both verbs need -s / -es.' },
        { type: 'Linkers', orig: 'He goes to bed at eleven.', fix: 'Finally, he goes to bed at eleven.', why: 'Use a linker to close the sequence of the day.' },
      ],
    },
    review: [
      { text: 'Review the Present Simple (he/she + -s) and write three new sentences of your own.', lp: lp4 },
      { text: 'Review the times and daily routines and listen to the audio again.', lp: lp2 },
    ],
  };
}

// ---------- 2 ESO · Base · Catalan ----------
function ca(phase) {
  const LS1 = '2eso-my-real-routine', LS2 = '2eso-free-time-live', G = '2ESOA';
  const P = (n) => '2eso/ls2-' + n;
  const end = phase === 'end';
  const open = [P('getting-started'), P('what-are-they-doing'), P('recall-checkpoint-1'), P('now-or-usually'), P('recall-checkpoint-2'),
    P('likes-and-screen-tips'), P('recall-checkpoint-3'), P('free-time-vlog')];
  if (end) open.push(P('write-your-vlog-script'), P('recall-checkpoint-4'), P('sample-exam'), P('check-the-source'), P('reflect'));
  const LP = ['recall', 'cards', 'practice'];
  const pg = {
    ls2GettingStarted2ESO: st([...LP, 'read', 'listen', 'speak'], all([...LP, 'read', 'listen', 'speak'], '2026-10-29')),
    ls2Doing2ESO: st([...LP, 'read', 'log', 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'],
      { ...all([...LP, 'read', 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], '2026-11-05'), log: DAY('2026-11-11') }, { steps: { log: { avg: 3, comment: '' }, talk: { avg: 4, comment: '' } } }),
    ls2Checkpoint12ESO: st(['check'], all(['check'], '2026-11-05')),
    ls2NowUsually2ESO: st([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write'], all([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write'], '2026-11-12')),
    ls2Checkpoint22ESO: st(['check'], all(['check'], '2026-11-12')),
    ls2Tips2ESO: st(['recall', 'cards', 'practice'], all(['recall', 'cards', 'practice'], '2026-11-16')),
  };
  if (end) Object.assign(pg, {
    ls2NowUsually2ESO: st([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], all([...LP, 'listen', 'chart', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], '2026-11-12')),
    ls2Tips2ESO: st([...LP, 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], all([...LP, 'listen', 'again', 'shadow', 'grammar', 'mixed', 'write', 'speak', 'talk'], '2026-11-16')),
    ls2Checkpoint32ESO: st(['check'], all(['check'], '2026-11-17')), ls2Checkpoint42ESO: st(['check'], all(['check'], '2026-11-19')),
    ls2Script2ESO: st([...LP, 'read', 'parts', 'again', 'shadow', 'grammar', 'write', 'speak', 'talk'], all([...LP, 'read', 'parts', 'again', 'shadow', 'grammar', 'write', 'speak', 'talk'], '2026-11-25')),
    ls2SampleExam2ESO: st(['listen', 'chart', 'read', 'log', 'vocab', 'grammar', 'write'], all(['listen', 'chart', 'read', 'log', 'vocab', 'grammar', 'write'], '2026-11-19')),
    ls2Source2ESO: st([...LP, 'read', 'sources', 'credit', 'again', 'shadow', 'talk', 'factfile'], all([...LP, 'read', 'sources', 'credit', 'again', 'shadow', 'talk', 'factfile'], '2026-11-26')),
    ls2Reflect2ESO: st(['self', 'reflect'], all(['self', 'reflect'], '2026-12-11')),
  });
  const fpSteps = end ? {
    prep: { avg: 3, comment: 'Faré el vlog sobre el bàsquet.' }, source: { avg: 3, comment: '' }, slides: { avg: 4, comment: '' }, script: { avg: 3, comment: '' },
    edit: { avg: 3, comment: '' }, feedback: { avg: 4, comment: '' }, tips: { avg: 4, comment: '' },
  } : { prep: { avg: 3, comment: 'Faré el vlog sobre el bàsquet.' } };
  pg.ls2FinalProduct2ESO = JSON.stringify({ done: end ? { video: true, submit: true } : {}, steps: fpSteps });
  const rs = {
    [P('what-are-they-doing')]: { activity: P('what-are-they-doing'), score: 11, max: 13, replies: { write: 'Molt bé! Recorda: «She is playing», no «She playing».' } },
    [P('recall-checkpoint-1')]: { activity: P('recall-checkpoint-1'), score: 1, max: 1 },
    [P('now-or-usually')]: { activity: P('now-or-usually'), score: end ? 10 : 8, max: 11 },
    [P('recall-checkpoint-2')]: { activity: P('recall-checkpoint-2'), score: 1, max: 1 },
    [P('free-time-vlog')]: end ? { activity: P('free-time-vlog'), score: 7.5, max: 10,
      feedback: 'El vlog és clar i el guió està ben organitzat. La font és fiable. Parla una mica més a poc a poc i mira la càmera. Molt bona feina!',
      replies: { prep: 'Bona tria! Ara busca una font fiable.', script: 'Bon guió. Revisa: «He plays basketball», amb -s.' } }
      : { activity: P('free-time-vlog'), replies: { prep: 'Bona tria! Ara busca una font fiable.' } },
    '2eso/final-product': { activity: '2eso/final-product', score: 7, max: 10, feedback: 'Bona presentació. Parla una mica més fort la propera vegada.' },
    [LS1 + '/assessment']: { activity: LS1 + '/assessment', version: 'insecure', sections: {
      listening: { score: 8, max: 10 }, reading: { score: 10, max: 10 }, vchoose: { score: 14, max: 16 }, vcomplete: { score: 9, max: 12 }, gchoose: { score: 10, max: 14 },
      gcomplete: { score: 12, max: 18 }, wtask: { score: 6, max: 8 }, wgrammar: { score: 2, max: 4 }, wvocab: { score: 3, max: 4 }, worg: { score: 2, max: 4 } }, report: report2() },
    [LS2 + '/assessment']: { activity: LS2 + '/assessment', progress: end
      ? { exam: 7.1, fp: 7.5, gv: 7.9, other: 8, total: 7.5, at: '2026-12-16', parts: { gv: { cp: 8.5, warm: 8, time: 8, skills: 7.4 } } }
      : { gv: 7, other: 8, at: '2026-11-16', parts: { gv: { cp: 10, warm: 9, time: 7, skills: 5.5 } } } },
  };
  if (end) rs[LS2 + '/assessment'].sections = { listening: { score: 15, max: 20 }, reading: { score: 14, max: 20 }, vocabulary: { score: 10, max: 15 }, grammar: { score: 10, max: 15 }, writing: { score: 22, max: 30 } };
  return {
    today: end ? '2026-12-16' : '2026-11-16',
    demo: {
      me: { name: 'Pau Exemple', group: G }, rs, lv: { [LS2]: { level: 'insecure', by: 'teacher' }, [LS1]: { level: 'insecure', by: 'teacher' } },
      pg: { [LS2]: pg, [LS1]: {} },
      ls: { [LS1]: { status: 'closed' }, [LS2]: { status: 'open', open: { [G]: open } }, '4eso-my-real-routine': { status: 'hidden' }, '4eso-seasons-and-celebrations': { status: 'hidden' } },
      pt: { t1: 15, t2: 5 }, tm: { best: { t1: 21, t2: 8 }, bestOk: { t1: 21, t2: 8 } },
      ann: [{ id: 'a1', text: "Recordeu: l'examen de la LS2 és el divendres 20 de novembre. Feu el learning path Sample exam per preparar-lo!", created: DAY('2026-11-13', 12), read: {} }],
    },
  };
}

// The LS1 2 ESO exam report (Base, so its texts are in Catalan): real LS1 questions, invented answers and writing.
function report2() {
  const lp2 = { t: 'LP2 · A day in my life', href: '2eso/my-real-routine/a-day-in-my-life.html' }, lp4 = { t: 'LP4 · Present Simple', href: '2eso/my-real-routine/present-simple-grammar.html' },
    lp5 = { t: 'LP5 · Healthy habits', href: '2eso/my-real-routine/healthy-habits.html' };
  return {
    model: 'C',
    questions: [
      { q: 3, part: 'Listening', pts: 2, got: 0, text: 'What time does Nora get home?', mine: 'B. 5:30', right: 'A. 4:30', why: "Repassa les dades de l'àudio: persones, hores i accions.", lp: lp2 },
      { q: 12, part: 'Vocabulary', pts: 2, got: 0, text: 'Every morning, I take the 8:15 from the station near my house. I go to school ___.', mine: 'C. by bus', right: 'A. by train', why: "L'estació («station») et diu que és el tren.", lp: lp2 },
      { q: 19, part: 'Vocabulary', pts: 3, got: 0, text: 'I go to school ___ foot.', mine: 'by', right: 'on', why: "Diem «on foot» (a peu), però «by bus», «by train».", lp: lp2 },
      { q: 28, part: 'Grammar', pts: 2, got: 0, text: '___ your brother play football?', mine: 'A. Do', right: 'C. Does', why: 'Preguntes en Present Simple amb he/she/it: Does + subjecte + verb base.', lp: lp4 },
      { q: 29, part: 'Grammar', pts: 2, got: 0, text: 'My parents ___ go to bed late.', mine: "B. doesn't", right: "D. don't", why: "Amb I/you/we/they la negativa és don't.", lp: lp4 },
      { q: 30, part: 'Grammar', pts: 3, got: 1, text: 'Lucía ___ English on Mondays. (study)', mine: 'studys', right: 'studies', why: 'Consonant + y → -ies amb he/she/it.', lp: lp4 },
      { q: 34, part: 'Grammar', pts: 4, got: 0, text: '— El teu pare fa el sopar? — No, he ___.', mine: "don't", right: "doesn't", why: "Amb he/she/it, la resposta curta negativa és doesn't.", lp: lp4 },
    ],
    writing: {
      original: "Laia wakes up at seven o'clock and she have breakfast with her brother. She go to school by bus. After school she play basketball on Mondays and Wednesdays. In the evening she do her homework and she watches TV. She goes to bed at ten.",
      corrected: "Laia wakes up at seven o'clock and she *has* breakfast with her brother. She *goes* to school by bus. After school, she *plays* basketball on Mondays and Wednesdays. In the evening, she *does* her homework and *then* she watches TV. *Finally,* she goes to bed at ten.",
      rubric: [{ name: 'C1 · Tasca i contingut', score: 6, max: 8 }, { name: 'C2 · Grammar', score: 2, max: 4 }, { name: 'C3 · Vocabulary', score: 3, max: 4 }, { name: 'C4 · Organització i cohesió', score: 2, max: 4 }],
      feedback: "Expliques bé la rutina de la Laia. Afegeix-hi alguna cosa teva i revisa la -s amb he/she.",
      errors: [
        { type: 'Present Simple', orig: 'she have breakfast', fix: 'she has breakfast', why: 'Amb he/she fem servir has.' },
        { type: 'Present Simple', orig: 'She go to school', fix: 'She goes to school', why: 'go → goes amb he/she.' },
        { type: 'Present Simple', orig: 'she play basketball', fix: 'she plays basketball', why: 'Amb he/she el verb porta -s.' },
        { type: 'Present Simple', orig: 'she do her homework', fix: 'she does her homework', why: 'do → does amb he/she.' },
        { type: 'Connectors', orig: 'She goes to bed at ten.', fix: 'Finally, she goes to bed at ten.', why: 'Fes servir connectors (then, finally) per ordenar el dia.' },
      ],
    },
    review: [
      { text: 'Repassa el Present Simple (he/she + -s, doesn\'t, preguntes amb Does) i escriu tres frases noves.', lp: lp4 },
      { text: 'Repassa el vocabulari dels hàbits saludables i escriu tres frases teves.', lp: lp5 },
    ],
  };
}

export const demo = (lang, phase = 'mid') => (lang === 'ca' ? ca(phase) : en(phase));
