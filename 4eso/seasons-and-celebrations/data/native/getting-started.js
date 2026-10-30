/* LS2 · Learning Path 1 · Getting started · Native route (C2 Proficiency, Roger 30 Oct 2026). getting-started.html has its own renderer,
   so it reads these lists from window.GS_NATIVE when the route is Native (same steps: recall, words, read, listen, speak). English only. */
window.GS_NATIVE = {
  // Recall (LS1, My Real Routine) at C2: phrasal verbs, collocations and word formation about routines
  recall: [
    { q: 'I’m shattered: I’m going to turn ___ early tonight.', a: ['in'], en: 'turn in = go to bed.' },
    { q: 'I keep putting ___ my homework until the last minute.', a: ['off'], en: 'put off = postpone.' },
    { q: 'My alarm went off, but I lay ___ for another twenty minutes.', a: ['in'], en: 'lie in = stay in bed later than usual.' },
    { q: 'I’m not a morning ___: I can’t think before nine.', a: ['person'], en: 'a morning person.' },
    { q: 'Weekends throw my sleep pattern completely out of ___.', a: ['sync', 'kilter', 'balance'], en: 'out of sync / out of kilter.' },
    { q: 'Sticking to a routine requires a lot of ___ (DISCIPLINE).', a: ['self-discipline', 'discipline'], en: 'Compound noun: self-discipline.' },
    { q: 'Scrolling at night makes it ___ (NOTORIOUS) hard to fall asleep.', a: ['notoriously'], en: 'Adverb before an adjective.' },
    { q: 'Hardly ___ I sat down when my phone rang. (1 word)', a: ['had'], en: 'Hardly had… when: negative inversion.' }
  ],
  // Autumn words at C2: items [word, definition, example]
  vocab: [
    { g: 'The turning year', items: [
      ['the nights draw in', 'it starts getting dark earlier in the evening', 'Once the clocks go back, the nights really draw in.'],
      ['a nip in the air', 'a slight coldness in the weather', 'There’s a nip in the air this morning.'],
      ['crisp', 'cold, dry and fresh (weather); firm and fresh (leaves, food)', 'a crisp autumn morning'],
      ['a cold snap', 'a sudden short period of very cold weather', 'The cold snap killed the last tomatoes.'],
      ['an Indian summer', 'a period of unusually warm weather in autumn', 'We had an Indian summer in October.'],
      ['dank', 'unpleasantly wet and cold', 'a dank November afternoon'],
      ['to wane', 'to become gradually smaller or weaker (light, interest)', 'The light wanes by five o’clock.']] },
    { g: 'Harvest and the land', items: [
      ['bountiful', 'producing large amounts', 'a bountiful harvest'],
      ['to forage', 'to search for wild food', 'We foraged for mushrooms and chestnuts.'],
      ['to gather in (the harvest)', 'to collect crops when they are ready', 'Farmers gathered in the grapes.'],
      ['russet', 'reddish-brown', 'russet leaves'],
      ['mellow', 'soft, warm and gentle, not harsh', 'the mellow light of late October'],
      ['to hibernate', 'to sleep through the winter', 'Hedgehogs hibernate in piles of leaves.']] },
    { g: 'Mood and season', items: [
      ['wistful', 'sadly thinking about something you cannot have or that has passed', 'Autumn always makes me wistful.'],
      ['to hunker down', 'to stay inside and prepare to wait for a long time', 'We hunker down at home when it gets cold.'],
      ['cosy', 'comfortable, warm and relaxing', 'a cosy evening by the fire'],
      ['the winter blues', 'a low mood some people feel when the days are short', 'Light lamps help with the winter blues.'],
      ['seasonal affective disorder', 'a kind of depression linked to the dark months', 'SAD affects many people in northern countries.']] }
  ],
  practice: [
    { q: 'Once the clocks go back, the nights really ___ in.', a: ['draw'] },
    { q: 'There’s a ___ in the air: time to get the coats out.', a: ['nip'] },
    { q: 'We had an Indian ___: 25 degrees in mid-October.', a: ['summer'] },
    { q: 'On Sunday we ___ for mushrooms in the forest. (searched for wild food)', a: ['foraged'] },
    { q: 'The harvest was ___ this year: the trees were full. (producing a lot)', a: ['bountiful'] },
    { q: 'The ___ light of late October is soft and golden.', a: ['mellow'] },
    { q: 'Old photos always make my grandmother ___. (sad about the past)', a: ['wistful'] },
    { q: 'When it gets cold, we ___ down at home with blankets.', a: ['hunker'] },
    { q: 'Interest in the old customs is slowly ___ (becoming weaker).', a: ['waning'] },
    { q: 'A sudden, short spell of freezing weather: a cold ___.', a: ['snap'] }
  ],
  // Reading (C2 Proficiency, Part 5 style): a personal essay
  readingHtml: '<div class="reading" style="font-weight:400"><p><strong>In praise of the in-between season</strong></p>' +
    '<p>Summer has a lobby and winter has a fan club, but autumn, for most people, is something that happens to them on the way to somewhere else. It arrives as a series of small inconveniences: a jumper retrieved from the back of a drawer, a bike ride home in unexpected darkness, the faint indignity of turning the heating on in October. We tend to describe it in terms of what it is taking away.</p>' +
    '<p>And yet the season has a stubborn way of insisting on itself. In Catalonia it does so with the smell of chestnuts roasting on street corners, in Britain with a sky full of fireworks on the fifth of November, in half the world with pumpkins grinning from doorsteps. It is striking how many of these customs involve fire or light. A cynic might say that people simply need an excuse to stay outside a little longer before the long hibernation. A more generous reading is that autumn is the season in which communities make a point of gathering precisely because the year is telling them to disperse.</p>' +
    '<p>There is also something honest about it. Summer promises that the good times will last; autumn makes no such claim. The light wanes, the leaves come down, and the dead, in many traditions, are given their night. Far from being morbid, this strikes me as a kind of grown-up tenderness. A culture that sets aside a day to remember the people it has lost, and then sits down to share chestnuts and sweet potatoes, has understood something about how grief and appetite live side by side.</p>' +
    '<p>I used to think of autumn as the year’s waiting room. I have come round to the view that it is the only season that tells the truth.</p></div>',
  readingQs: [
    { q: 'What does the writer suggest with “Summer has a lobby and winter has a fan club”?', o: ['Other seasons have enthusiastic supporters, whereas autumn is overlooked.', 'Summer and winter are more political than autumn.', 'Most people prefer winter to summer.', 'Autumn is the most popular season.'] },
    { q: 'The examples in the first paragraph (the jumper, the bike ride, the heating) show autumn as…', o: ['a series of minor annoyances', 'a dangerous time of year', 'an expensive season', 'a time for exercise'] },
    { q: 'How does the writer treat the “cynic’s” view of autumn customs?', o: ['as possible, but less convincing than a more generous interpretation', 'as completely wrong', 'as the only realistic explanation', 'as offensive to people who celebrate'] },
    { q: 'What is the paradox in “communities make a point of gathering precisely because the year is telling them to disperse”?', o: ['People come together just when the season pushes them apart.', 'Communities are too large to gather in autumn.', 'People prefer to celebrate alone in autumn.', 'Autumn festivals are disappearing.'] },
    { q: 'Why does the writer call autumn “honest”?', o: ['It does not pretend that good things last forever.', 'People tell the truth more in autumn.', 'It has no commercial celebrations.', 'Its weather is predictable.'] },
    { q: 'What does “grown-up tenderness” refer to?', o: ['remembering the dead while also enjoying food together', 'parents caring for their children in winter', 'the warmth of autumn colours', 'avoiding the subject of death'] },
    { q: '“I have come round to the view…” tells us that the writer…', o: ['has changed their mind over time', 'has always held this opinion', 'is still undecided', 'is repeating someone else’s view'] },
    { q: 'Which phrase best describes the tone of the text?', o: ['reflective and gently persuasive', 'angry and critical', 'neutral and informative', 'humorous and dismissive'] }
  ],
  // Listening: the class video, with C2 questions on purpose and implication
  listening: [
    { q: 'Why does the presenter open with a question (“where do two famous autumn celebrations come from?”)?', o: ['to frame the whole episode around origins', 'to test the listener’s knowledge', 'to introduce a debate between the speakers', 'to advertise the next episode'] },
    { q: 'What does “here’s a surprise” assume about the audience?', o: ['They associate Halloween only with pumpkins.', 'They have never heard of Halloween.', 'They know a lot about Celtic history.', 'They dislike turnips.'] },
    { q: 'The story of the bell ringers is introduced with “People say that…”. This signals that…', o: ['it is a traditional explanation, not a proven fact', 'it is the speakers’ own opinion', 'it happened recently', 'historians have confirmed it'] },
    { q: 'Why does Emma mention that chestnuts and sweet potatoes are “easy to find”?', o: ['to give a practical explanation alongside the traditional story', 'to recommend a recipe', 'to contradict Sam', 'to explain why they are cheap in shops today'] },
    { q: 'What is the function of the final line, “But they feel very different!”?', o: ['to contrast shared origins with different modern experiences', 'to say which celebration is better', 'to admit the speakers disagree', 'to correct a mistake made earlier'] },
    { q: 'Which statement would the speakers most likely agree with?', o: ['Traditions change as people move and circumstances change.', 'The Castanyada is older than Halloween.', 'Halloween has no connection to remembering the dead.', 'Traditions should never change.'] }
  ],
  // Speaking: a written plan, no recording (Roger, 30 Oct 2026)
  speak: {
    question: '<strong>“Autumn is a season people endure rather than enjoy.” How far do you agree?</strong><br><small>C2 Proficiency Speaking, Part 3 style: about two minutes alone. Here you only plan it.</small>',
    tip: '<p><strong>Strategy · “How far do you agree?” is never yes or no.</strong> The examiner wants a position with a degree: <em>largely, up to a point, only if…</em> Decide your degree first; everything else follows from it.</p>' +
      '<p><strong>Find the hidden word.</strong> Every statement has one word that does the work. Here it is <em>endure</em>: who endures autumn (commuters in the dark?) and who enjoys it (children on 31 October?). Splitting the people is an easy way to build a nuanced answer.</p>' +
      '<p><strong>Use one concrete scene</strong> (your street on the night of the Castanyada, the first evening the heating goes on). One vivid example beats three general ones.</p>',
    fields: [
      { id: 'first', label: 'What comes to mind first? (15 seconds, everything)', rows: 3 },
      { id: 'degree', label: 'Your degree of agreement, in one sentence', rows: 2 },
      { id: 'best', label: 'Your two strongest ideas and the scene you will use', rows: 3 },
      { id: 'order', label: 'Your order: degree → idea 1 + scene → idea 2 (the other side) → conclusion', rows: 4 }
    ],
    modelPlan: '<div class="model" style="font-weight:400"><strong>Degree:</strong> Up to a point: it depends on whose autumn we mean.<br><strong>Idea 1 (agree):</strong> for adults it’s endured: dark commutes, the heating bill, the winter blues.<br><strong>Scene:</strong> 31 October in my street: chestnuts, children in costumes, grandparents on the doorstep. Nobody is enduring anything.<br><strong>Idea 2 (turn):</strong> communities invented festivals precisely to make the season enjoyable; the customs are the answer to the problem.<br><strong>Conclusion:</strong> we endure the weather, but we enjoy what we built to cope with it.</div>' +
      '<p><strong>Phrases:</strong> <em>Up to a point… · It rather depends on… · Take…, for example. · That said,… · What it comes down to is…</em></p>'
  }
};
