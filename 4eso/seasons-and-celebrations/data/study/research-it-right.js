/* LS2 · Learning Path 4 · Study guide (shared/js/el-study.js). Practice only, new items (not the checkpoint's or the sample exam's).
   Checkpoint 3 covers LS1, Learning Paths 1–3 and 5 (not this one), so the checkpoint practice here is spaced review of 1–3. */
window.LP.study = {
  next: 3,
  covers: { ca: 'LS1, Learning Paths 1–3 i 5', en: 'LS1, Learning Paths 1–3 and 5' },
  today: { ca: 'tres coses que has de mirar en una font i cinc paraules dels Learning Paths 1–3', en: 'three things to check in a source and five words from Learning Paths 1–3' },
  exam: { ca: 'el que aprens aquí t’ajuda al Reading (prendre notes com al reading log). Aprofita aquest Learning Path per repassar el vocabulari i la gramàtica dels Learning Paths 1–3.', en: 'what you learn here helps in the Reading (taking notes, like the reading log). Use this Learning Path to review the vocabulary and grammar of Learning Paths 1–3.' },
  check: [
    ['', 'The days get ___ in summer.', 'longer', ['A l’estiu els dies s’allarguen: longer.', 'Summer: the days get longer.']],
    ['', 'Hanukkah is a festival of eight ___.', 'nights', ['Vuit nits = eight nights.', 'eight nights = vuit nits.']],
    ['', 'We visit our grandparents ___ Sunday.', 'on', ['Dies de la setmana → on.', 'Days → on.']],
    ['', 'Families eat turkey at ___ in the USA.', 'thanksgiving', ['Thanksgiving: el gall dindi.', 'Thanksgiving: turkey.']],
    ['', 'My friends ___ (play) football after school.', 'play', ['My friends = they: sense -s.', 'They: no -s.']],
    ['insecure', 'At Lunar New Year, children get red envelopes with ___.', 'money', ['Sobres vermells amb diners.', 'Red envelopes with money.']],
    ['insecure', 'I feel ___ when I watch a horror film.', 'scared', ['Tenir por = scared.', 'scared = afraid.']],
    ['insecure', 'We have a special ___ with all the family at Christmas.', 'meal', ['Un àpat especial = a special meal.', 'a special meal = a big family lunch or dinner.']],
    ['safe', 'The festival ___ ___ every year in March.', 'takes place|is held', 'take place / be held = happen.'],
    ['safe', 'Lunar New Year is ___ to Christmas: families get together.', 'similar', 'similar to = almost the same as.'],
    ['safe', 'Did people in Ireland ___ to carve turnips?', 'use', 'Questions: Did… use to…? (no -d).'],
    ['daring', 'Candles ___ ___ (light) every night at Hanukkah.', 'are lit', 'Passive: are + past participle (light → lit).'],
    ['daring', 'Many traditions ___ when families move to a new country.', 'evolve|change|adapt', 'evolve / adapt = change little by little.']
  ],
  read: {
    text: {
      insecure: '<p><strong>Sant Jordi</strong></p><p>On 23 April, Catalonia celebrates Sant Jordi. It is a day of books and roses. People give a rose or a book to someone they love. The streets of Barcelona are full of stalls, and writers sign their books.</p><p>The story says that Sant Jordi killed a dragon, and a red rose grew from its blood. In 1995, UNESCO made 23 April World Book Day, so now people in many countries celebrate books on this day.</p>',
      safe: '<p><strong>Sant Jordi</strong></p><p>Every year on 23 April, Catalonia celebrates Sant Jordi, a day of books and roses. Traditionally, people give a rose or a book to someone they love, although today many people give both. The streets of Barcelona fill with stalls, and queues form in front of famous writers who sign their books.</p><p>According to the legend, Sant Jordi killed a dragon, and a red rose grew from its blood. The day became even more international in 1995, when UNESCO chose 23 April as World Book Day, the date when both Cervantes and Shakespeare died.</p>'
    },
    items: [
      ['', 'What do people give on Sant Jordi?', ['a rose or a book', 'chocolate eggs', 'a present for children only', 'money'], ['«…a rose or a book to someone they love.»', '“…a rose or a book to someone they love.”']],
      ['', 'Where does the legend say the rose came from?', ['the dragon’s blood', 'a garden in Barcelona', 'a writer’s book', 'the king’s castle'], ['«…a red rose grew from its blood.»', '“…a red rose grew from its blood.”']],
      ['', 'Which is the correct note about Sant Jordi?', ['What: books and roses · When: 23 April · Where: Catalonia', 'What: books and roses · When: 24 April · Where: Catalonia', 'What: books and roses · When: 23 April · Where: the UK', 'What: dragons and fireworks · When: 23 April · Where: Catalonia'], ['Comprova les tres parts: què, quan i on.', 'Check all three parts: what, when and where.']],
      ['', 'You want to check when UNESCO made it World Book Day. Which source is best?', ['UNESCO’s official website', 'a bookshop advert', 'a 10-second video with no author', 'a forum answer from 2010'], ['Una web oficial és més fiable.', 'An official website is the most reliable.']]
    ]
  },
  vocab: [
    ['', 'At Diwali, people give each other ___.', ['presents', 'costumes', 'turnips', 'parades'], ['Regals = presents.', 'presents = gifts.']],
    ['', 'In ___, it is hot and sunny.', ['summer', 'winter', 'autumn', 'harvest'], ['Estiu = summer.', 'summer = estiu.']],
    ['', 'We ___ the Christmas tree with lights.', ['decorate', 'dress', 'celebrate', 'visit'], ['Guarnir = decorate.', 'decorate = make it look nice.']],
    ['insecure', 'Children dress ___ as witches at Halloween.', ['up', 'on', 'in', 'out'], ['Disfressar-se = dress up.', 'dress up = wear a costume.']],
    ['safe', 'Everybody takes ___ in the school parade.', 'part', 'take part in = join.'],
    ['daring', 'Some people say Christmas is all about c___: buying more and more.', 'consumerism', 'consumerism = buying too much.']
  ],
  grammar: [
    ['', 'Lunar New Year ___ in late January or February.', ['is', 'are', 'be', 'am'], ['Lunar New Year = it: is.', 'It → is.']],
    ['', 'My mum ___ the house before the party.', ['cleans', 'clean', 'cleaning', 'are clean'], ['She → cleans.', 'She → cleans.']],
    ['', 'We eat twelve grapes ___ midnight on New Year’s Eve.', ['at', 'on', 'in', 'to'], ['Hora → at.', 'Time → at.']],
    ['insecure', 'Diwali ___ (last) five days.', 'lasts', ['It → lasts.', 'It → lasts.']],
    ['safe', 'Many years ago, people ___ ___ make panellets at home. Now they buy them.', 'used to', 'A past habit that is not true now.'],
    ['daring', 'Abraham Lincoln, ___ made Thanksgiving official, was president in 1863.', 'who', 'Non-defining relative for people: who.']
  ],
  native: {
    exam: 'the C2 version: listening for attitude and implication, a long reading, vocabulary (multiple-choice cloze and word formation), grammar (open cloze and key word transformations) and a formal letter.',
    check: [
      ['', 'Always go back to the ___ source, not a summary of it.', 'original|primary', 'the original / primary source.'],
      ['', 'The evidence for a pagan origin is ___ (CONCLUDE).', 'inconclusive', 'conclude → inconclusive.'],
      ['', 'Two things looking similar does not ___ that one caused the other.', 'prove|mean|imply', 'Similarity is not proof of cause.'],
      ['', 'The article makes ___ claims without citing any evidence.', 'sweeping|bold|unfounded', 'sweeping claims = very general claims.'],
      ['', 'Take viral “facts” with a pinch of ___.', 'salt', 'with a pinch of salt = with doubt.'],
      ['', 'It is ___ (WIDE) believed that the custom is ancient.', 'widely', 'wide → widely.'],
      ['', 'The museum is ___ for the accuracy of its articles.', 'renowned|known|famous', 'renowned for.'],
      ['', 'On no account ___ you copy a source word for word.', 'should', 'On no account + inversion.'],
      ['', 'Make sure you give credit where credit is ___.', 'due', 'give credit where credit is due.'],
      ['', 'The claim doesn’t hold ___ when you check the dates.', 'up|water', 'hold up / hold water = stay convincing.']
    ],
    vocab: [
      ['', 'The so-called ancient tradition turned out to be a recent ___.', ['invention', 'investment', 'intention', 'inspection'], 'a recent invention.'],
      ['', 'The writer ___ that the evidence is limited.', ['concedes', 'consents', 'condones', 'confers'], 'concede = admit.'],
      ['', 'The figures are ___ (DATE): they are from 2012.', 'outdated|out of date', 'date → outdated.'],
      ['', 'The claim is ___ (VERIFY): there is no way to check it.', 'unverifiable', 'verify → unverifiable.']
    ],
    grammar: [
      ['', 'People claim that the custom is pagan. CLAIMED → The custom ___ pagan.', 'is claimed to be', 'is claimed to + infinitive.'],
      ['', 'You must not copy sources in any circumstances. ACCOUNT → On no ___ copy sources.', 'account should you|account must you', 'On no account + inversion.'],
      ['', 'Open cloze: ___ the evidence is limited, the theory remains popular.', 'although|though|while', 'Concession.'],
      ['', 'Open cloze: This is not to ___ that the theory is wrong.', 'say', 'This is not to say that…']
    ]
  }
};
