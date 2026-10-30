/* LS2 · Sample exam · Native route (C2 Proficiency, Roger 30 Oct 2026): the same sections, numbering and points as the class exam, with
   C2 Proficiency-style questions (same listening; a C2 reading; Use of English tasks; a C2 letter). Practice, not graded. */
(function () {
const base = id => window.LP.panels.find(p => p.id === id) || {};
window.LP.native = {
  how: { type: 'info', tab: 'How it works', title: 'How the exam works (C2 version)',
    html: '<p>Same sections and points as your class’s exam, with C2 Proficiency-style tasks. <strong>55 minutes, no notes.</strong></p>' +
      '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' +
      '<tr><td>1 Listening: attitude and implication (5) + detail and purpose (5), 2 points each</td><td style="text-align:right">20</td></tr>' +
      '<tr><td>2 Reading: a C2 text (5) + summary accuracy (5), 2 points each</td><td style="text-align:right">20</td></tr>' +
      '<tr><td>3 Vocabulary: multiple-choice cloze (7 × 1) + word formation (4 × 2)</td><td style="text-align:right">15</td></tr>' +
      '<tr><td>4 Grammar: open cloze (7 × 1) + key word transformations (4 × 2)</td><td style="text-align:right">15</td></tr>' +
      '<tr><td>5 Writing: a formal letter (C2 Proficiency, Part 2)</td><td style="text-align:right">30</td></tr></tbody></table>' +
      '<p>Your <strong>first try</strong> is your score. The letter gets feedback and a guide mark from ChatGPT.</p><p class="warm-note">⚠️ ChatGPT can make mistakes: its mark is only a guide.</p>' },

  listen: { type: 'quiz', tab: 'Listening', title: 'Listening: Two New Years', pts: [2, 2], start: 1, media: base('listen').media,
    items: [
      { q: 'Callum’s comment that Hogmanay is “bigger than Christmas” mainly reveals…', o: ['how central the celebration is to Scottish identity for him', 'that Christmas is not celebrated in Scotland', 'that he prefers parties to presents', 'that the street party is very crowded'] },
      { q: 'How does Callum feel about nobody knowing all the words to “Auld Lang Syne”?', o: ['amused and affectionate', 'embarrassed', 'critical of the tradition', 'indifferent'] },
      { q: 'Callum’s grandmother making sure “a friendly neighbour comes first” suggests that she…', o: ['takes the superstition half-seriously but still acts on it', 'does not believe in the tradition at all', 'is afraid of her neighbours', 'wants to be the first visitor herself'] },
      { q: 'The contrast between the two speakers is best described as…', o: ['outward celebration versus inward renewal', 'religious versus secular', 'traditional versus modern', 'urban versus rural'] },
      { q: 'Yuki’s tone when she describes New Year as “starting again” is…', o: ['reflective', 'excited', 'nostalgic and sad', 'ironic'] }
    ] },

  chart: { type: 'quiz', tab: 'Listening chart', title: 'Listening: detail and purpose', pts: [2, 2], start: 6, media: base('chart').media,
    items: [
      { q: 'Why does Callum mention the three jumpers?', o: ['to add a humorous, vivid detail about the cold', 'to explain the dress code', 'to complain about the weather', 'to show how poor the organisation is'] },
      { q: 'What is the purpose of the story about the slice of cake?', o: ['to show the warmth of the first-footing custom from personal experience', 'to explain what food is eaten at Hogmanay', 'to criticise his neighbours’ generosity', 'to describe a typical Scottish recipe'] },
      { q: 'Which detail shows that Shōgatsu affects the whole of society, not only families?', o: ['Schools and many offices close for several days.', 'People eat long noodles.', 'Children get money in envelopes.', 'Her grandmother cooks for days.'] },
      { q: 'The cards that “all arrive on the same morning” suggest…', o: ['a shared, nationwide moment of connection', 'that the postal service is slow', 'that cards are no longer popular', 'that only teachers receive cards'] },
      { q: 'What links the cleaning on 31 December and leaving problems behind?', o: ['Both express the idea of a fresh start.', 'Both are done to please the family.', 'Both are done only by children.', 'Both are recent customs.'] }
    ] },

  read: { type: 'quiz', tab: 'Reading', title: 'Reading: The calendar inside the calendar', pts: [2, 2], start: 11,
    media: { text: '<p><strong>The calendar inside the calendar</strong></p>' +
      '<p>Children in Catalonia spend the first weeks of December feeding a log. They cover it with a blanket, give it scraps of bread and orange peel, and on Christmas Eve, armed with sticks and a song whose lyrics would not survive translation into polite company, they beat it until it “produces” sweets. Children in Britain, meanwhile, open one cardboard door a day until the twenty-fourth. Put side by side, the two customs look like opposites: one riotous and faintly absurd, the other orderly to the point of bureaucracy.</p>' +
      '<p>Yet they are doing the same job. Both stretch a single day into a season, and both give children something adults often forget they once needed: a way of making waiting bearable. The log must be fed; the door must not be opened early. In each case, anticipation is turned into a ritual with rules, and the rules, rather than the reward, are what children remember.</p>' +
      '<p>It would be easy to read the commercial Advent calendar, now available in versions containing cheese, beauty products and craft beer, as proof that the ritual has been hollowed out. The Caga Tió has its own market too: miniature logs with painted smiles are sold in airport shops to tourists who have no intention of feeding them. But the market follows the ritual rather than replacing it. Families still argue about the right day to bring out the Tió, and children still police the calendar with a seriousness out of all proportion to the chocolate behind each door.</p>' },
    items: [
      { q: 'In the first paragraph, the writer presents the two customs as…', o: ['apparently opposite in character', 'equally old', 'both commercial', 'both religious'] },
      { q: 'What is the “same job” both customs do, according to the writer?', o: ['They turn waiting into a structured experience.', 'They teach children to share.', 'They keep children busy during the holidays.', 'They replace religious practices.'] },
      { q: 'The phrase “the rules, rather than the reward, are what children remember” suggests that…', o: ['the process matters more than the prize', 'children are disappointed by the sweets', 'parents should give fewer presents', 'the customs are too strict'] },
      { q: 'What is the writer’s view of the commercial versions of the customs?', o: ['They exist because of the ritual and have not destroyed it.', 'They have emptied the customs of meaning.', 'They are a recent improvement.', 'They are mainly bought by children.'] },
      { q: 'The phrase “a seriousness out of all proportion” is used to…', o: ['affectionately highlight how much the ritual matters to children', 'criticise children for being greedy', 'suggest the chocolate is expensive', 'show that adults take the custom too seriously'] }
    ] },

  log: { type: 'quiz', tab: 'Summary', title: 'Summary accuracy', pts: [2, 2], start: 16, media: { text: '<p class="tiny">Use the text in the Reading section.</p>' },
    items: [
      { q: 'Which is the most accurate one-sentence summary of the text?', o: ['Two very different customs both turn the wait for Christmas into a ritual that has survived commercialisation.', 'The Caga Tió is older and more meaningful than the Advent calendar.', 'Commercial Advent calendars have destroyed a children’s tradition.', 'Catalan and British children celebrate Christmas in the same way.'] },
      { q: 'Which paraphrase of “making waiting bearable” is accurate?', o: ['helping children cope with anticipation', 'making children wait longer', 'stopping children from waiting', 'rewarding children for patience'] },
      { q: 'Which note best captures paragraph 3?', o: ['commercial versions exist · but ritual still drives them', 'ritual has been hollowed out', 'tourists feed the Tió', 'calendars now contain beer'] },
      { q: 'Which of these is NOT a point the writer makes?', o: ['Parents prefer the Advent calendar because it is tidier.', 'Both customs stretch one day into a season.', 'The Tió is sold to tourists.', 'Children take the calendar rules seriously.'] },
      { q: 'Which word best describes the writer’s tone overall?', o: ['wry', 'indignant', 'neutral and technical', 'sentimental'] }
    ] },

  vocab: { type: 'quiz', tab: 'Vocabulary', title: 'Vocabulary: multiple-choice cloze and word formation', pts: [1, 2], start: 21,
    items: [
      { q: 'The village festival is ___ in tradition.', o: ['steeped', 'soaked', 'drowned', 'filled'] },
      { q: 'Halloween is ___ in the Celtic festival of Samhain.', o: ['rooted', 'grown', 'planted', 'based'] },
      { q: 'Organising the fair was no mean ___.', o: ['feat', 'deed', 'act', 'task'] },
      { q: 'The plan quickly ___ momentum.', o: ['gathered', 'collected', 'raised', 'built'] },
      { q: 'We need to ___ a balance between tradition and change.', o: ['strike', 'hit', 'make', 'reach'] },
      { q: 'The custom ___ into disuse after the war.', o: ['fell', 'went', 'dropped', 'came'] },
      { q: 'At the ___ of repeating myself: label the food.', o: ['risk', 'danger', 'chance', 'threat'] },
      { q: 'Word formation: Critics complain about the ___ (COMMERCIAL) of the festival.', a: ['commercialisation', 'commercialization'] },
      { q: 'Word formation: The festival gives people a sense of ___ (BELONG).', a: ['belonging'] },
      { q: 'Word formation: The custom is ___ (SURPRISE) recent.', a: ['surprisingly'] },
      { q: 'Word formation: The candles are lit with ___ (REVERE).', a: ['reverence'] }
    ] },

  grammar: { type: 'quiz', tab: 'Grammar', title: 'Grammar: open cloze and key word transformations', pts: [1, 2], start: 32,
    items: [
      { q: 'Open cloze (one word): No sooner had the bells rung ___ the fireworks began.', a: ['than'] },
      { q: 'Open cloze: ___ it rain, the parade will be postponed.', a: ['should'] },
      { q: 'Open cloze: It is not the presents ___ that matter.', a: ['themselves'] },
      { q: 'Open cloze: Little ___ they know what was coming.', a: ['did'] },
      { q: 'Open cloze: The custom is said to ___ originated in Ireland.', a: ['have'] },
      { q: 'Open cloze: ___ more we prepare, the less we worry.', a: ['the'] },
      { q: 'Open cloze: The answer lies ___ lowering our expectations.', a: ['in'] },
      { q: 'KWT: I have never seen such a crowd. NEVER → ___ such a crowd.', a: ['never have i seen', 'never before have i seen'] },
      { q: 'KWT: People believe the festival began in Ireland. THOUGHT → The festival ___ in Ireland.', a: ['is thought to have begun', 'is thought to have started', 'is thought to have originated'] },
      { q: 'KWT: If you have any questions, please contact us. SHOULD → ___ any questions, please contact us.', a: ['should you have'] },
      { q: 'KWT: Thanksgiving did not become official until 1863. ONLY → It was ___ Thanksgiving became official.', a: ['only in 1863 that'] }
    ] },

  write: { type: 'marked', tab: 'Writing', title: '43. Writing: a formal letter (C2)', max: 30, criterion: '5.1 (formal letter, C2 Proficiency standard)', levelPts: [8, 15, 23, 30],
    intro: 'Write without notes, as in the exam.',
    source: base('write').source, sourceLabel: 'Situation',
    task: 'The community centre in your town is preparing an International New Year evening for families on Friday 8 January. Write a formal <strong>letter</strong> (240–280 words) to Mr Jordi Serra, the director, proposing an activity about a New Year tradition from another country. Explain what the activity would involve and why it would appeal to families of all backgrounds, anticipate one practical concern, and request what you need.',
    min: 240,
    levels: ['Task only partly achieved, or register inconsistent (too informal or over-formal); ideas listed rather than organised.',
      'Task achieved with clear purpose and request; generally formal; organisation clear but linking is mechanical; good control with occasional awkwardness.',
      'Task fully achieved and persuasive; consistent C2 formal register; well organised with varied cohesive devices; a range of precise vocabulary and structures (e.g. inversion, formal conditionals) used naturally.',
      'Fully effective and elegant: the concern is answered convincingly, the tone is persuasive without being pushy, organisation is seamless, and language is precise, idiomatic and sophisticated throughout.'] }
};
})();
