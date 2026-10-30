/* LS2 · Learning Path 2 · Native route (C2 Proficiency, Roger 30 Oct 2026): same topic, tasks modelled on Cambridge C2 Proficiency.
   Replaces panels by id (ls2-engine.js usePanels); panels not listed here are the Daring version. English only. */
window.LP.native = {
  recall: { type: 'recall', tab: 'Recall', title: 'Recall: Getting started', pill: 'No notes',
    intro: 'Type the answers without looking. Some are collocations, some are word formation (the word in CAPITALS changes form).',
    items: [
      { q: 'As October ends, the nights start drawing ___.', a: ['in'], en: 'The nights draw in = it gets dark earlier.' },
      { q: 'A sudden, short period of very cold weather is a cold ___.', a: ['snap', 'spell'], en: 'a cold snap / a cold spell.' },
      { q: 'Many people suffer from ___ (SEASON) affective disorder in winter.', a: ['seasonal'], en: 'Adjective: seasonal.' },
      { q: 'Shops start selling Christmas decorations ___ (ABSURD) early.', a: ['absurdly'], en: 'Adverb before an adjective: absurdly early.' },
      { q: 'Halloween has become increasingly ___ (COMMERCE) in Spain.', a: ['commercialised', 'commercialized'], en: 'commerce → commercial → commercialised.' },
      { q: 'The Castanyada dates ___ to the old harvest and All Saints’ celebrations.', a: ['back'], en: 'date back to.' },
      { q: 'I’m dying to see the fireworks. → I can hardly ___ the fireworks. (2 words)', a: ['wait for'], en: 'can hardly wait for = am very excited about.' },
      { q: 'Autumn is my favourite season, ___ far. (2 letters)', a: ['by'], en: 'by far = definitely, with a big difference.' }
    ] },

  vocab: { type: 'vocab', tab: 'Vocabulary', title: 'C2 vocabulary: ritual, festivity and meaning',
    intro: 'Explore the words (hover for a definition and an example), go through the cards and complete the sentences (80 %). These are the words that make a C2 answer sound precise rather than general.',
    receptive: 'liturgical · solstice · equinox · effigy · votive · carnivalesque',
    groups: [
      { g: 'Ritual and observance', items: [
        ['observe (a festival)', 'to follow the customs of a religious or traditional occasion', 'Fewer families observe the fast strictly these days.'],
        ['observance', 'the practice of following a religious or traditional custom', 'Religious observance has declined, but the festival survives.'],
        ['festivities', 'the activities organised to celebrate something', 'The festivities go on until dawn.'],
        ['revelry', 'noisy, lively celebration, often with drinking and dancing', 'The night of revelry ends with a fire run.'],
        ['solemn', 'serious and formal, without fun or noise', 'All Saints’ Day is a solemn occasion for many families.'],
        ['jubilant', 'extremely happy because of a success or celebration', 'Jubilant crowds filled the square at midnight.'],
        ['pagan', 'connected with old religions that existed before the main world religions', 'Many winter customs have pagan origins.'],
        ['syncretism', 'the mixing of different religions or traditions into one', 'Christmas is a textbook case of syncretism.']] },
      { g: 'Collocations and idioms', items: [
        ['steeped in tradition', 'full of a long history of customs', 'The town is steeped in tradition.'],
        ['time-honoured', 'respected because it has existed for a long time', 'a time-honoured recipe'],
        ['deeply rooted', 'firmly established for a long time, hard to change', 'The custom is deeply rooted in rural life.'],
        ['ring in the New Year', 'to celebrate the start of the year at midnight', 'We rang in the New Year in the main square.'],
        ['push the boat out', 'to spend a lot of money or effort to celebrate', 'For my grandmother’s eightieth we really pushed the boat out.'],
        ['go all out', 'to make the greatest possible effort', 'Our street goes all out for Sant Joan.'],
        ['a far cry from', 'very different from', 'Today’s Halloween is a far cry from the Celtic Samhain.'],
        ['the festive spirit', 'the happy, generous mood of a celebration', 'Not everyone is in the festive spirit in December.']] },
      { g: 'Word families (for word formation)', items: [
        ['celebratory', 'adjective: done to celebrate something', 'a celebratory dinner'],
        ['celebrant', 'noun: the person who leads a ceremony', 'The celebrant lit the first candle.'],
        ['traditionalist', 'noun: someone who wants to keep traditions as they are', 'Traditionalists complained about the new parade route.'],
        ['commercialisation', 'noun: the process of making something mainly about money', 'the commercialisation of Christmas'],
        ['ritualistic', 'adjective: done in exactly the same way every time, like a ritual', 'a ritualistic exchange of gifts'],
        ['reverence', 'noun: deep respect', 'The candles are lit with reverence.']] }
    ],
    core: ['observe (a festival)', 'observance', 'festivities', 'revelry', 'solemn', 'jubilant', 'pagan', 'syncretism', 'steeped in tradition', 'time-honoured', 'deeply rooted', 'ring in the New Year', 'push the boat out', 'a far cry from', 'celebratory', 'traditionalist', 'commercialisation', 'reverence'],
    practice: [
      { q: 'Today’s Halloween is a far ___ from the Celtic festival of Samhain.', a: ['cry'] },
      { q: 'For my parents’ anniversary we really pushed the ___ out.', a: ['boat'] },
      { q: 'The village is ___ in tradition: some customs are centuries old.', a: ['steeped'] },
      { q: 'Some people complain about the ___ (COMMERCIAL) of Christmas.', a: ['commercialisation', 'commercialization'] },
      { q: 'Lighting the candles is done with great ___ (REVERE).', a: ['reverence'] },
      { q: 'Christmas mixes Christian and pagan elements: a clear example of ___.', a: ['syncretism'] },
      { q: 'The crowd was ___ when the clock struck twelve. (very happy, starts with j)', a: ['jubilant'] },
      { q: 'Fewer families ___ the religious side of the festival nowadays. (follow the customs)', a: ['observe'] },
      { q: 'They organised a ___ (CELEBRATE) dinner after the parade.', a: ['celebratory'] },
      { q: 'We rang ___ the New Year with fireworks.', a: ['in'] }
    ] },

  read: { type: 'mc', tab: 'Reading', title: 'Reading: Why we light up the darkest days', pill: '80 % to complete',
    intro: 'A C2 Proficiency-style text (Reading and Use of English, Part 5). Read it all once for the writer’s argument, then answer. The questions test attitude, implication and reference, not facts you can simply find.',
    media: { text: '<p><strong>Why we light up the darkest days</strong></p>' +
      '<p>It is tempting to treat the festivals of light that cluster around the turn of the year as a happy coincidence: Diwali in the autumn, Hanukkah and Christmas in December, Lunar New Year as winter loosens its grip. Yet coincidence is a lazy explanation for something so persistent. Wherever the nights grow long, people seem compelled to answer the dark with flame, and to do so together.</p>' +
      '<p>The anthropologist’s answer is that these festivals are, at bottom, acts of collective reassurance. A community that gathers to light lamps is not merely decorating; it is rehearsing, year after year, the conviction that the darkness is temporary. That such rituals outlived the agricultural calendars that gave rise to them is hardly surprising. The fear they address, that things may not get better, has proved rather more durable than the threshing floor.</p>' +
      '<p>What is surprising is how readily the meaning of each festival is renegotiated. Hanukkah, a relatively minor date in the religious calendar, acquired its present prominence partly because it falls so close to Christmas. Lunar New Year, once an intensely local affair of village shrines and family altars, now triggers the largest annual migration on the planet. Diwali lamps are as likely to be LED strings bought online as clay diyas shaped by hand. Purists lament each of these shifts, and they are not entirely wrong to do so: something is lost when a ritual becomes a product.</p>' +
      '<p>But the lament usually rests on a fiction, namely that there was once an original, uncontaminated version from which everything since has declined. Festivals have always borrowed, absorbed and adapted. The evergreen tree, the Yule log and the midwinter feast were folded into Christmas centuries ago; few of those who now defend a “traditional” Christmas would recognise the one they imagine they are defending. Tradition, in other words, is less a fixed inheritance than a conversation each generation conducts with the last.</p>' +
      '<p>None of this makes the festivals less meaningful. If anything, their adaptability is the source of their strength. A ritual that could not survive the move from candle to bulb, or from village to megacity, would long since have been abandoned. The light changes; the gesture endures.</p>' },
    items: [
      { q: 'In the first paragraph, the writer suggests that calling the festivals a “coincidence” is…', o: ['an explanation that avoids thinking about why they keep happening', 'a view held mainly by religious people', 'correct, but only for festivals in the northern hemisphere', 'a common mistake made by historians'] },
      { q: 'What does the writer mean by “rehearsing” the conviction that the darkness is temporary?', o: ['repeating a belief so that it stays alive in the community', 'preparing a performance for visitors', 'practising for an event that has not happened yet', 'pretending to believe something nobody really believes'] },
      { q: 'The reference to “the threshing floor” is used to show that…', o: ['the fear behind the festivals has lasted longer than the farming life that created them', 'modern festivals still depend on the harvest', 'farmers were more afraid of the dark than city people', 'agricultural work used to take place at night'] },
      { q: 'How does the writer regard the “purists” in the third paragraph?', o: ['They have a point, but their view is only partly right.', 'They are completely mistaken.', 'They are the only people who understand the festivals.', 'They are responsible for the commercial changes.'] },
      { q: 'What is the “fiction” mentioned in the fourth paragraph?', o: ['the idea that each festival once existed in a pure, unchanged form', 'the story behind the Hanukkah candles', 'the belief that Christmas has pagan roots', 'the claim that festivals are becoming less popular'] },
      { q: 'The sentence “few of those who now defend a ‘traditional’ Christmas would recognise the one they imagine they are defending” is an example of…', o: ['irony', 'a statistic', 'a personal anecdote', 'a counter-argument the writer accepts'] },
      { q: 'Which statement best sums up the writer’s overall argument?', o: ['Festivals survive precisely because they keep changing.', 'Festivals of light are losing their original meaning.', 'Modern technology has spoiled traditional celebrations.', 'Every culture has invented the same festival independently.'] },
      { q: '“The light changes; the gesture endures.” Here “the gesture” refers to…', o: ['the shared act of answering darkness with light', 'the way people greet each other at festivals', 'the use of clay lamps', 'the religious meaning of each festival'] }
    ] },

  log: { type: 'step', tab: 'Summary', title: 'Summary and response (C2 Proficiency writing, Part 1 skills)', pill: 'Your teacher sees it',
    intro: 'Part 1 of the C2 Proficiency Writing paper asks you to summarise and evaluate the key ideas of two texts. Practise the first half here: compress the writer’s argument without copying it.',
    html: '<div class="model"><strong>Strategy · compress, don’t copy.</strong> Find the one sentence each paragraph exists to say. Then write it again with different words: nouns instead of clauses (<em>the persistence of these festivals</em>), and one linker for the turn in the argument (<em>Although purists…, the writer argues…</em>). Examiners penalise “lifting” whole phrases from the text.</div>',
    fields: [
      { id: 'sum', label: 'The writer’s argument in 50–60 words, in your own words', rows: 4 },
      { id: 'key', label: 'The two key points you would keep if you only had 25 words', rows: 2 },
      { id: 'eval', label: 'Evaluation: one point you agree with and one you would challenge, with a reason for each', rows: 4 },
      { id: 'lift', label: 'Two phrases from the text you would like to use yourself (and where)', rows: 2 }
    ],
    rate: ['My summary uses my own words, not phrases lifted from the text', 'I kept the argument’s turning point (purists vs. adaptation)', 'My evaluation gives reasons, not just opinions', 'I stayed within the word limit'] },

  listen: { type: 'step', tab: 'Listening', title: 'Listening: listen like an examiner', pill: 'Real video · BBC',
    intro: 'This BBC video is made for children, so the challenge is not understanding it: it is noticing how it is built. C2 Proficiency Listening tests purpose, attitude and what speakers imply.',
    media: { youtube: 'kjIPGD_WcEY', title: 'Happy Diwali', credit: 'Video: “Happy Diwali”, BBC / British Council LearnEnglish Kids.' },
    fields: [
      { id: 'aud', label: 'Who is the intended audience? Give two pieces of evidence from the language or the images.', rows: 3 },
      { id: 'simp', label: 'Two things the video simplifies or leaves out, compared with the reading text', rows: 3 },
      { id: 'purp', label: 'What is the video’s main purpose: to inform, to persuade, to entertain? Justify your choice.', rows: 2 },
      { id: 'adult', label: 'Rewrite one sentence of the video for an adult documentary (C2 register)', rows: 2 }
    ],
    rate: ['I gave evidence, not just impressions', 'I compared the video with the reading text', 'My rewritten sentence sounds natural for adults'] },

  grammar: { type: 'typed', tab: 'Grammar', title: 'Grammar for emphasis: inversion and cleft sentences', pill: '80 %',
    intro: 'Key word transformations (Reading and Use of English, Part 4): complete the second sentence so it means the same as the first, using 3–8 words including the word in CAPITALS. Small changes in spelling are not accepted, so be precise.',
    explain: [
      '<strong>Negative inversion</strong> for emphasis: <em>Never have I seen… · Not only does it…, but… · Only when… did… · No sooner had… than… · At no time did… · Little did they know…</em>',
      '<strong>Cleft sentences</strong> to focus on one part: <em>What I love about Diwali is the lamps. · It was in 1863 that Thanksgiving became official. · All I want is a quiet New Year.</em>',
      '<strong>Exam tip:</strong> Part 4 usually tests two things at once (grammar + a fixed phrase). Count your words and check that the key word is unchanged.'
    ],
    items: [
      { q: 'I have never seen such a spectacular parade. NEVER → ___ such a spectacular parade.', a: ['never have i seen', 'never before have i seen'], en: 'Never + have + subject + past participle.' },
      { q: 'The festival is beautiful and it is also free. ONLY → Not ___, but it is also free.', a: ['only is the festival beautiful', 'only is it beautiful'], en: 'Not only + auxiliary + subject…, but…' },
      { q: 'We realised how late it was only when the fireworks started. DID → Only when the fireworks started ___ how late it was.', a: ['did we realise', 'did we realize'], en: 'Only when… + inverted auxiliary.' },
      { q: 'As soon as the clock struck twelve, everyone started singing. SOONER → No ___ twelve than everyone started singing.', a: ['sooner had the clock struck'], en: 'No sooner had + subject + past participle + than.' },
      { q: 'They had no idea that the party was for them. LITTLE → ___ that the party was for them.', a: ['little did they know', 'little did they realise', 'little did they realize'], en: 'Little did + subject + verb.' },
      { q: 'I love the atmosphere of Sant Joan most. WHAT → ___ the atmosphere.', a: ['what i love most about sant joan is', 'what i love about sant joan most is'], en: 'What + clause + is…' },
      { q: 'Lincoln made Thanksgiving a national holiday in 1863. IT → ___ Lincoln made Thanksgiving a national holiday.', a: ['it was in 1863 that'], en: 'It was + focus + that…' },
      { q: 'You must not light fireworks indoors under any circumstances. CIRCUMSTANCES → Under ___ light fireworks indoors.', a: ['no circumstances must you', 'no circumstances should you'], en: 'Under no circumstances + inverted modal.' },
      { q: 'The only thing I want this New Year is some peace and quiet. ALL → ___ this New Year is some peace and quiet.', a: ['all i want'], en: 'All I want is…' },
      { q: 'The organisers did not apologise at any point. TIME → At ___ apologise.', a: ['no time did the organisers', 'no time did they'], en: 'At no time + did + subject + verb.' }
    ] },

  mixed: { type: 'typed', tab: 'Open cloze', title: 'Open cloze: The paradox of the festive season', pill: '80 %',
    intro: 'Reading and Use of English, Part 2: one word in each gap, mostly grammar words (prepositions, linkers, pronouns, parts of fixed phrases). Read the whole paragraph first.',
    explain: [
      '<div class="reading" style="font-weight:400">For a season supposedly devoted (1) ___ joy, December can be strangely exhausting. (2) ___ the endless lists, the crowded shops and the obligatory gatherings, many people reach January feeling (3) ___ though they need a holiday from their holidays. Psychologists point out that it is not the celebrations (4) ___ that wear us down, (5) ___ rather the pressure to enjoy them. (6) ___ more we expect to feel, the more we notice what we are not feeling. Perhaps the answer lies (7) ___ lowering our expectations, (8) ___ is easier said than done.</div>',
      '<strong>Tip:</strong> look at what comes after each gap as well as before it: (5) and (6) are parts of two-part structures.'
    ],
    items: [
      { q: '(1) supposedly devoted ___ joy', a: ['to'], en: 'devoted to.' },
      { q: '(2) ___ the endless lists… (= because of all)', a: ['with', 'between', 'what with'], en: 'With / What with = because of all these things.' },
      { q: '(3) feeling ___ though they need a holiday', a: ['as'], en: 'as though = as if.' },
      { q: '(4) it is not the celebrations ___ that wear us down', a: ['themselves'], en: 'Emphatic pronoun: the celebrations themselves.' },
      { q: '(5) not the celebrations…, ___ rather the pressure', a: ['but'], en: 'not X but rather Y.' },
      { q: '(6) ___ more we expect to feel, the more we notice…', a: ['the'], en: 'The more…, the more…' },
      { q: '(7) the answer lies ___ lowering our expectations', a: ['in'], en: 'lie in = consist of, be found in.' },
      { q: '(8) …, ___ is easier said than done', a: ['which'], en: 'Sentence relative clause: which refers to the whole idea.' }
    ] },

  write: { type: 'writing', product: 1, tab: 'Writing', title: 'Piece 1: an article (C2 Proficiency Writing, Part 2)',
    intro: 'This text is the first piece of your final product. Write it as an exam answer: plan for five minutes, write, then check.',
    task: 'An international magazine for young people is running a series called <em>“A celebration that says more about us than we think”</em>. Write an <strong>article</strong> (280–320 words) about a celebration you know well. Describe it vividly for readers who have never experienced it, and argue what it reveals about the people who celebrate it today. Give your article a title.',
    model: '<em>A different celebration, for the structure only.</em> <strong>The night the whole town stays awake</strong> · Paragraph 1: a scene, not a definition (the hour before the first bonfire). · Paragraph 2: what actually happens, with two precise details a visitor would not expect. · Paragraph 3: the turn: what the night is “officially” about, and what it is really about now. · Paragraph 4: what that reveals (belonging, release, defiance of the dark), with one concession to the sceptic. · Closing line that echoes the opening scene.',
    min: 280,
    checklist: ['A title and an opening that pulls the reader in (no dictionary definition)', 'Vivid, precise description (at least three C2 words or collocations from this Learning Path)', 'A clear argument about what the celebration reveals, with a concession', 'At least one inversion or cleft sentence used naturally', 'Paragraphs that each have one job, and a closing line that links back', 'A consistent, engaging register for a magazine (not an essay, not a chat)', '280–320 words'] },

  speak: { type: 'plan', tab: 'Speaking plan', title: 'Speaking: plan a long turn (no recording)',
    part: 'C2 Proficiency Speaking, Part 3: you get a question with some ideas on a card and speak alone for about two minutes. Here you only plan it.',
    question: '<strong>How important is it for a community to keep its traditional celebrations?</strong><br><small>Ideas on the card: identity and belonging · tourism and money · celebrations that change or disappear</small>',
    tip: '<p><strong>Step 1 · Dump, then choose (15 seconds).</strong> Write everything that comes to mind, including the obvious. Your first idea is usually everyone’s first idea: keep it as a starting point, not as your main point.</p>' +
      '<p><strong>Step 2 · Pick a line, not a list.</strong> Examiners reward a developed answer with a position. Choose two or three ideas that build on each other (for example: belonging → but tourism changes it → so the real question is who the celebration is for).</p>' +
      '<p><strong>Step 3 · Plan the shape:</strong> opening position → idea 1 with an example → idea 2 that complicates it → a conclusion that goes slightly further than your opening. You do not have to use every idea on the card.</p>',
    fields: [
      { id: 'first', label: 'What comes to mind first? (everything, in 15 seconds)', ph: 'identity, grandparents, Sant Joan, tourists, money…', rows: 3 },
      { id: 'best', label: 'Which two or three ideas are the strongest, and why? (one is allowed to be your first idea)', rows: 3 },
      { id: 'order', label: 'Your order: opening position → idea 1 (example) → idea 2 → conclusion', rows: 4 },
      { id: 'lang', label: 'Three phrases you will use to link or to buy time', ph: 'What strikes me is… / That said,… / It’s a question of…', rows: 2 }
    ],
    modelPlan: '<div class="model" style="font-weight:400"><strong>Position:</strong> Important, but not for the reason people usually give.<br><strong>Idea 1:</strong> Belonging: Sant Joan in my street, the one night neighbours who never speak share food. That is the real value.<br><strong>Idea 2 (complicates it):</strong> When a celebration is kept “for tourists”, it can survive in form and die in meaning (example: a parade staged for cameras).<br><strong>Conclusion (goes further):</strong> So the question is not whether we keep them, but who they are for. A tradition worth keeping is one the community would still do with nobody watching.</div>' +
      '<p><strong>Linking and buying time:</strong> <em>The obvious answer would be…, but… · What strikes me is… · Take…, for instance. · That said,… · Which brings me back to…</em></p>' +
      '<p class="tiny">Notice: the first idea (identity) is kept but sharpened; tourism is used to complicate it, not as a separate list item; the conclusion adds something new.</p>' }
};
