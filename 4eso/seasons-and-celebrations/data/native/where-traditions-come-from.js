/* LS2 · Learning Path 3 · Native route (C2 Proficiency, Roger 30 Oct 2026). Replaces panels by id; others are the Daring version. */
window.LP.native = {
  recall: { type: 'recall', tab: 'Recall', title: 'Recall: Learning Paths 1 and 2', pill: 'No notes',
    intro: 'Type the answers without looking. Collocations, word formation and emphasis from the last Learning Paths.',
    items: [
      { q: 'Today’s Halloween is a far ___ from the Celtic festival.', a: ['cry'], en: 'a far cry from = very different from.' },
      { q: 'The town is steeped ___ tradition.', a: ['in'], en: 'steeped in.' },
      { q: 'The mixing of religions into one tradition: s___', a: ['syncretism'], en: 'syncretism.' },
      { q: 'Some complain about the ___ (COMMERCIAL) of Christmas.', a: ['commercialisation', 'commercialization'] },
      { q: 'Never ___ I seen such a crowd. (1 word)', a: ['have'], en: 'Negative inversion: Never have I…' },
      { q: 'No sooner had the bells rung ___ the fireworks began.', a: ['than'], en: 'No sooner… than.' },
      { q: '___ I love most about Diwali is the lamps. (1 word)', a: ['what'], en: 'Cleft sentence: What I love is…' },
      { q: 'With all the lists and shopping, I feel as ___ I need a holiday.', a: ['though', 'if'] }
    ] },

  vocab: { type: 'vocab', tab: 'Vocabulary', title: 'C2 vocabulary: origins and change',
    intro: 'Explore, go through the cards and complete the sentences (80 %). These words let you talk about how traditions begin, change and survive.',
    receptive: 'antiquarian · revivalist · palimpsest · vestigial · Christianised',
    groups: [
      { g: 'Origins', items: [
        ['stem from', 'to come from or be caused by something', 'The custom stems from a harvest ritual.'],
        ['be rooted in', 'to have its origin or basis in something', 'Halloween is rooted in Samhain.'],
        ['give rise to', 'to cause something to begin', 'Irish emigration gave rise to the pumpkin lantern.'],
        ['date back to', 'to have existed since a time in the past', 'The fair dates back to the 1300s.'],
        ['folklore', 'traditional beliefs and stories of a community', 'In local folklore, the spirits return that night.'],
        ['an invented tradition', 'a custom presented as ancient but actually quite recent', 'Many “ancient” Christmas customs are invented traditions.']] },
      { g: 'Change', items: [
        ['evolve into', 'to develop gradually into something different', 'A solemn vigil evolved into a street party.'],
        ['morph into', 'to change gradually into something else (informal)', 'Halloween has morphed into a shopping event.'],
        ['supplant', 'to take the place of something older', 'Pumpkins supplanted turnips.'],
        ['fall into disuse', 'to stop being used or practised', 'The custom fell into disuse after the war.'],
        ['revive', 'to make something popular or active again', 'A local group revived the old dance.'],
        ['dwindle', 'to become gradually smaller or fewer', 'The number of people who observe the fast has dwindled.'],
        ['sanitise', 'to make something less unpleasant or controversial by removing parts of it', 'School plays often sanitise the Thanksgiving story.']] },
      { g: 'Attitudes', items: [
        ['nostalgic', 'remembering the past with pleasure and some sadness', 'My grandmother is nostalgic about the old Castanyada.'],
        ['sceptical', 'having doubts about something', 'Historians are sceptical of the popular version.'],
        ['contested', 'argued about; not accepted by everyone', 'The meaning of Thanksgiving is contested.'],
        ['reverent', 'showing deep respect', 'a reverent silence'],
        ['irreverent', 'not showing the expected respect, often in a funny way', 'an irreverent take on Christmas']] }
    ],
    core: ['stem from', 'be rooted in', 'give rise to', 'folklore', 'an invented tradition', 'evolve into', 'morph into', 'supplant', 'fall into disuse', 'revive', 'dwindle', 'sanitise', 'nostalgic', 'sceptical', 'contested', 'irreverent'],
    practice: [
      { q: 'The Halloween lantern ___ from an Irish custom of carving turnips.', a: ['stems'] },
      { q: 'In America, pumpkins soon ___ turnips because they were easier to carve.', a: ['supplanted'] },
      { q: 'The old dance fell into ___ but was revived in the 1980s.', a: ['disuse'] },
      { q: 'Irish emigration gave ___ to the Halloween we know today.', a: ['rise'] },
      { q: 'The number of families who observe the full ritual has ___ to a handful. (became smaller)', a: ['dwindled'] },
      { q: 'Many school plays ___ the story of the first Thanksgiving. (make it less unpleasant)', a: ['sanitise', 'sanitize'] },
      { q: 'The meaning of the holiday is ___: not everyone agrees on it.', a: ['contested'] },
      { q: 'Historians are ___ (SCEPTIC) about the popular version of the story.', a: ['sceptical', 'skeptical'] },
      { q: 'A custom that looks ancient but is actually recent is an ___ tradition.', a: ['invented'] },
      { q: 'Halloween is rooted ___ the Celtic festival of Samhain.', a: ['in'] }
    ] },

  listen: { type: 'mc', tab: 'Listening', title: 'Listening: The story behind two autumn celebrations', pill: 'Podcast · 80 %',
    intro: 'The same podcast as your class, with C2 Proficiency Listening questions (Parts 1 and 3): purpose, attitude and what the speakers imply. Listen once, read the questions, then listen again.',
    media: { audio: 'audio/culture-bites-origins.mp3', title: 'Culture Bites: the story behind two autumn celebrations' },
    items: [
      { q: 'Why does Sam introduce the turnips with “here’s a surprise”?', o: ['He expects listeners to assume pumpkins were always part of Halloween.', 'He thinks turnips are a strange food.', 'He wants to change the subject to food.', 'He is not sure the information is correct.'] },
      { q: 'What does the change from turnips to pumpkins illustrate in the podcast?', o: ['how a tradition adapts when people move to a new place', 'how expensive the festival has become', 'how Celtic beliefs were forgotten', 'how children changed the festival'] },
      { q: 'What is Emma’s purpose when she says “But it didn’t become a national holiday until 1863”?', o: ['to correct the idea that the holiday began in its present form in 1621', 'to criticise President Lincoln', 'to show that Thanksgiving is older than Halloween', 'to explain why the date changes every year'] },
      { q: 'When Emma mentions that some Native Americans see Thanksgiving as a day of mourning, her tone is best described as…', o: ['careful and fair', 'angry and accusing', 'humorous', 'doubtful about the facts'] },
      { q: 'What does the phrase “not everybody sees the story in the same way” imply?', o: ['The usual version of the story leaves out other points of view.', 'Most people have never heard the story.', 'The story changes from family to family.', 'Historians have proved the story is false.'] },
      { q: 'Which statement best expresses the speakers’ final conclusion?', o: ['Both festivals began with the harvest but have been transformed over time.', 'Both festivals have kept their original meaning.', 'Halloween has changed more than Thanksgiving.', 'Modern celebrations are less meaningful than old ones.'] },
      { q: 'How would you describe the register of the podcast?', o: ['informal but informative, aimed at a general audience', 'academic, aimed at specialists', 'formal and official', 'casual, with no factual content'] }
    ] },

  chart: { type: 'step', tab: 'Listening chart', title: 'Listening chart: how speakers show what matters', pill: 'Your teacher sees it',
    intro: 'Watch both videos. At C2 you are expected to notice not just what speakers value, but how they show it: stories, contrasts, humour, a change of tone.',
    media: { videos: [{ base: 'video/mei-lunar-new-year', title: 'Video 1 · Mei: Lunar New Year' }, { base: 'video/noah-hanukkah', title: 'Video 2 · Noah: Hanukkah' }], videoCredit: 'Illustrated videos made for English Lab. Voices generated with ElevenLabs.' },
    fields: [
      { id: 'v1', label: 'Mei: what does she really value, and which detail reveals it (not the one she says directly)?', rows: 3 },
      { id: 'v2', label: 'Noah: what does he value, and what does the story he has heard “a hundred times” do in his talk?', rows: 3 },
      { id: 'tech', label: 'One technique each speaker uses to make the listener care (humour, contrast, a personal detail…)', rows: 3 },
      { id: 'cmp', label: 'In two sentences: what do the two celebrations have in common at a deeper level?', rows: 3 }
    ],
    rate: ['I went beyond what the speakers say directly', 'I named a technique, with a quote', 'My comparison is about meaning, not just facts'] },

  grammar: { type: 'typed', tab: 'Grammar', title: 'Talking about the past at C2: reporting, would, participle clauses', pill: '80 %',
    intro: 'Key word transformations (Reading and Use of English, Part 4). Complete the second sentence with 3–8 words, including the word in CAPITALS.',
    explain: [
      '<strong>Impersonal reporting</strong> for uncertain history: <em>It is believed that… · Halloween is thought to have originated in… · The custom is said to date back to…</em> (perfect infinitive for the past).',
      '<strong>would</strong> for repeated past actions (not states): <em>On that night, people would light bonfires.</em> <strong>used to</strong> for both.',
      '<strong>Participle clauses</strong> to compress: <em>Having moved to America, Irish families… · Carved from turnips, the first lanterns…</em>',
      '<strong>Exam tip:</strong> reporting transformations almost always need the perfect infinitive (<em>to have + past participle</em>) when the action is in the past.'
    ],
    items: [
      { q: 'People believe that Halloween began in Ireland. THOUGHT → Halloween ___ in Ireland.', a: ['is thought to have begun', 'is thought to have started', 'is thought to have originated'], en: 'is thought + to have + past participle.' },
      { q: 'People say the festival dates back to Celtic times. SAID → The festival ___ back to Celtic times.', a: ['is said to date'], en: 'Present state → present infinitive: is said to date.' },
      { q: 'It is reported that the first feast lasted three days. REPORTED → The first feast ___ three days.', a: ['is reported to have lasted'], en: 'is reported to have lasted.' },
      { q: 'Every year my grandfather lit the first bonfire. WOULD → Every year my grandfather ___ the first bonfire.', a: ['would light'], en: 'would + infinitive for a repeated past action.' },
      { q: 'After they had moved to America, Irish families started carving pumpkins. HAVING → ___ to America, Irish families started carving pumpkins.', a: ['having moved'], en: 'Having + past participle = after they had…' },
      { q: 'Thanksgiving did not become official until 1863. ONLY → It was ___ Thanksgiving became official.', a: ['only in 1863 that'], en: 'Cleft: It was only in… that…' },
      { q: 'The tradition has almost disappeared. VERGE → The tradition is ___ disappearing.', a: ['on the verge of'], en: 'on the verge of + -ing.' },
      { q: 'It is possible that the custom came from Scotland. MAY → The custom ___ from Scotland.', a: ['may have come'], en: 'may have + past participle = past possibility.' },
      { q: 'People no longer carve turnips. LONGER → Turnips ___ carved.', a: ['are no longer'], en: 'Passive + no longer.' },
      { q: 'The festival changed a lot because of emigration. RESULT → The festival changed a lot ___ emigration.', a: ['as a result of'], en: 'as a result of.' }
    ] },

  mixed: { type: 'typed', tab: 'Word formation', title: 'Word formation: Inventing tradition', pill: '80 %',
    intro: 'Reading and Use of English, Part 3: form a word from the word in CAPITALS to fit each gap. Check the part of speech, the prefix (often negative) and the plural.',
    explain: [
      '<div class="reading" style="font-weight:400">Many customs we think of as ancient are, in fact, (1) ___ (SURPRISE) recent. The historian Eric Hobsbawm called them “invented traditions”: practices that claim (2) ___ (CONTINUE) with the past but were created to give a group a sense of (3) ___ (BELONG). The Scottish kilt in its modern form, for example, owes more to the nineteenth century than to any (4) ___ (ANCESTOR) clan custom. None of this makes such traditions (5) ___ (MEANING). Their (6) ___ (ATTRACT) lies precisely in the fact that they feel old, and the (7) ___ (WILLING) of people to embrace them says a great deal about our need for roots. Critics who dismiss them as mere (8) ___ (FABRICATE) miss the point.</div>'
    ],
    items: [
      { q: '(1) SURPRISE', a: ['surprisingly'], en: 'Adverb before an adjective.' },
      { q: '(2) CONTINUE', a: ['continuity'], en: 'Noun: claim continuity with.' },
      { q: '(3) BELONG', a: ['belonging'], en: 'a sense of belonging.' },
      { q: '(4) ANCESTOR', a: ['ancestral'], en: 'Adjective before a noun: ancestral.' },
      { q: '(5) MEANING', a: ['meaningless'], en: 'Negative: none of this makes them meaningless.' },
      { q: '(6) ATTRACT', a: ['attraction', 'attractiveness', 'appeal'], en: 'Noun after “Their”.' },
      { q: '(7) WILLING', a: ['willingness'], en: 'Noun after “the”.' },
      { q: '(8) FABRICATE', a: ['fabrications', 'fabrication'], en: 'Noun after “mere”.' }
    ] },

  write: { type: 'writing', product: 2, tab: 'Writing', title: 'Piece 2: essay (C2 Proficiency Writing, Part 1)',
    intro: 'This text is the second piece of your final product. In Part 1 you summarise and evaluate two short texts in an essay.',
    task: 'Read the two extracts. Write an <strong>essay</strong> (240–280 words) summarising and evaluating the key points of both texts. Use your own words throughout, and include your own ideas in your answer. Use your group’s celebration as an example in your evaluation.<br><br>' +
      '<div class="reading" style="font-weight:400"><strong>Text 1.</strong> Traditions that refuse to change die. The festivals that thrive today are those that have absorbed new music, new foods and new people, often to the dismay of purists. To demand that a celebration be preserved exactly as it was is, in effect, to ask for it to be put in a museum: admired, perhaps, but no longer lived.</div>' +
      '<div class="reading" style="font-weight:400"><strong>Text 2.</strong> Not all change is adaptation; much of it is simple erosion. When a festival is reshaped by marketing departments and tourist boards, it may gain visitors while losing the very thing that made it worth visiting. A community that no longer recognises its own celebration has not updated a tradition. It has sold one.</div>',
    model: '<em>Structure only.</em> Paragraph 1: the shared issue in one sentence, then Text 1’s point in your words. · Paragraph 2: Text 2’s point, linked as a contrast (<em>Text 2, by contrast, draws a distinction between…</em>). · Paragraph 3: your evaluation of each, with your group’s celebration as evidence. · Paragraph 4: your position, which may combine both (<em>The real test, perhaps, is who drives the change</em>).',
    min: 240,
    checklist: ['Both texts summarised, each key point in my own words (no lifted phrases)', 'Each text evaluated, not just described', 'My own ideas, with our group’s celebration as an example', 'A clear position in the conclusion', 'Essay register: formal, impersonal where useful, varied linking', '240–280 words'] },

  speak: { type: 'plan', tab: 'Speaking plan', title: 'Speaking: plan a long turn (no recording)',
    part: 'C2 Proficiency Speaking, Part 3: two minutes alone on a question, then a discussion. Here you plan it.',
    question: '<strong>Should a celebration be allowed to lose its original meaning?</strong><br><small>Ideas on the card: commercialisation · different groups, different meanings · keeping traditions alive</small>',
    tip: '<p><strong>Strategy · define before you argue.</strong> Strong C2 answers often start by questioning a word in the question. Here: what is the “original” meaning, and who decides? (Halloween’s Samhain? Thanksgiving’s 1621 or 1863?) This gives you a position instantly and shows range.</p>' +
      '<p><strong>Then use “yes, but”:</strong> give the side you disagree with its best version first, then turn it. Examiners hear this as maturity, not indecision.</p>' +
      '<p><strong>Buying time without sounding hesitant:</strong> <em>That’s a question that depends on what we mean by… · Let me come at that from a slightly different angle…</em></p>',
    fields: [
      { id: 'first', label: 'What comes to mind first? (15 seconds, everything)', rows: 3 },
      { id: 'word', label: 'Which word in the question would you challenge, and how?', rows: 2 },
      { id: 'best', label: 'Your two strongest ideas, and the example for each (from this Learning Path or your life)', rows: 3 },
      { id: 'order', label: 'Your order: the challenged word → the other side’s best case → your turn → conclusion', rows: 4 }
    ],
    modelPlan: '<div class="model" style="font-weight:400"><strong>Challenge the word:</strong> “original” is slippery: Halloween’s original meaning was Samhain; the pumpkin version is itself a change.<br><strong>The other side’s best case:</strong> when meaning goes, a festival becomes a shopping season (Halloween costumes in September).<br><strong>My turn:</strong> meanings have always shifted; what matters is whether the community still recognises itself in it. Thanksgiving shows the risk: one group’s celebration, another’s day of mourning.<br><strong>Conclusion:</strong> a celebration may change its meaning, but not by erasing the people it belonged to.</div>' +
      '<p class="tiny">Notice how the example from the podcast is used as evidence in two different places, and how the conclusion is a condition, not a yes or no.</p>' }
};

// Pro extra (Roger, 30 Oct 2026: real native-speed videos on the Learning Path's topic): added after the Listening chart tab.
window.LP.native.realvideo = { after: 'chart', type: 'mc', tab: 'Real video', title: 'Real video: the history of Halloween', pill: 'Native speed · 3 min',
  intro: 'A short National Geographic documentary at native speed, with a narrator and a historian. Listen for how they <em>interpret</em> the history, not only for the facts: several questions ask about attitude and word choice.',
  media: { youtube: 'R-VRAemIvbI', title: 'Halloween History', credit: 'Video: “Halloween History”, National Geographic (YouTube).' },
  items: [
    { q: 'Why does the narrator describe Halloween as a “patchwork” holiday?', o: ['It is made up of many different cultural, religious and occult traditions stitched together.', 'It is celebrated differently in every village.', 'People make their own costumes from old clothes.', 'It has changed its date many times.'], ex: 'A patchwork is made of different pieces sewn together: the holiday combines many traditions.' },
    { q: 'For the Celts, what made 31 October special?', o: ['It was the end of the harvest and of the year, when the boundary between the living and the dead was thinnest.', 'It was the longest night of the year.', 'It was the day the Romans arrived.', 'It was the only day without work.'], ex: 'Samhain: end of the harvest, the Celtic New Year, a “time between years” when the veil was thinnest.' },
    { q: 'What were the huge bonfires for?', o: ['To drive the spirits of the dead back to their world', 'To cook the last of the harvest', 'To keep the village warm all winter', 'To guide travellers home'], ex: 'The fires were lit to send the dead back to the spirit world.' },
    { q: 'How does the historian interpret the Church’s decision to place All Saints’ Day on 1 November?', o: ['As a deliberate strategy to draw pagans into the Church', 'As a coincidence of the calendar', 'As a way to ban Samhain completely', 'As a gift to the Celtic kings'], ex: 'He calls it a calculated move to “bring people into the fold”.' },
    { q: 'Where does the word “Halloween” come from?', o: ['All Hallows’ Eve, the night before All Saints’ Day', 'A Celtic word for bonfire', 'The name of an Irish village', 'An old English word for ghost'], ex: 'Hallow = holy / saint; the eve of All Hallows became Halloween.' },
    { q: 'How did Halloween reach America?', o: ['With Irish immigrants escaping the Potato Famine in the 1840s', 'With the first English settlers in 1620', 'Through American films in the 1930s', 'With Spanish missionaries'], ex: 'Irish immigrants brought apple bobbing and pranks in the 1840s.' },
    { q: 'Why did early pranksters wear masks?', o: ['So that nobody would recognise them', 'To scare away evil spirits', 'Because it was the law', 'To keep warm'], ex: 'Masks hid who was playing the tricks.' },
    { q: 'What is the speakers’ attitude to the origins of trick-or-treating?', o: ['Wry: they present it as something close to a protection racket, with treats as bribes.', 'Nostalgic: they miss the old version.', 'Disapproving: they think it should be banned.', 'Neutral: they give no interpretation.'], ex: 'The historian calls it an “extortion deal”: give us sweets or we wreck your house; adults paid bribes to keep the peace.' }
  ] };
