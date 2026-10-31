/* LS2 · Learning Path 3 · Study guide (EXAMPLE for Roger's review, 30 Oct 2026; Safe route only so far).
   Evidence-based study tips, a spaced plan and practice in the same format as the next checkpoint (typed gaps, no notes)
   and the final exam (multiple choice with four options, gaps, points per item). Practice only: nothing is saved or marked.
   Items: {q, o} multiple choice (first option right, shown shuffled) or {q, a} gap; why = the line shown in the answer key. */
window.LP.study = {
  safe: {
    title: 'Study guide: prepare for Checkpoint 2 and the final exam',
    intro: 'How to study what you learn in this Learning Path, and practice that works like the checkpoint and looks like the exam. The answer key is at the end of each activity.',
    tips: [
      ['🧠', 'Test yourself, don’t reread', 'Close your notes and try to remember: write the words, say the rule, answer the questions. Then check. Rereading and highlighting feel useful, but you remember much less.', 'Retrieval practice · Roediger & Karpicke 2006; Dunlosky et al. 2013'],
      ['📅', 'Spread it out', 'Three short sessions of 15 minutes on different days work better than one long session the day before.', 'Spacing · Cepeda et al. 2006'],
      ['🔀', 'Mix it up', 'Practise similar things together so you learn to choose: <em>used to</em> or Past Simple? <em>which, who, where</em> or <em>when</em>?', 'Interleaving · Rohrer & Taylor 2007'],
      ['✅', 'Check and fix at once', 'Mark your answers with the key straight away and write each wrong answer again, correctly.', 'Feedback · Hattie & Timperley 2007'],
      ['💬', 'Say why', 'For every answer, say the reason: “<em>when</em>, because 31 October is a day.” Explaining makes the rule stick.', 'Self-explanation · Dunlosky et al. 2013'],
      ['😴', 'Sleep on it', 'Your brain stores what you learn while you sleep. A short self-test and a good night’s sleep beat studying late the night before.', 'Sleep and memory · Diekelmann & Born 2010']
    ],
    plan: [
      ['Today', 'Close this page. Write five new words and one example of <em>used to</em>, <em>whereas</em> and <em>where</em> from memory. Then check them.'],
      ['In 2–3 days', 'Do “Practise for Checkpoint 2” below. Look at the key and write again what you got wrong.'],
      ['Before Checkpoint 2', 'Flashcards of Learning Paths 1–3: only the cards you still miss.'],
      ['The week before the exam', 'Do the exam-style practice below, then the Sample exam. Repeat only the parts you failed.']
    ],
    coming: '<strong>Checkpoint 2</strong> (after this Learning Path): short gaps about LS1 and Learning Paths 1–3, one question at a time, about 45 seconds each, no going back and no notes. You do it once, and you must stay on the page: if you leave it, it is sent. It opens the next Learning Path.<br>' +
      '<strong>Final exam</strong>: this Learning Path comes up in the Listening (questions with four options), the Vocabulary (dates, comparing, places) and the Grammar (<em>used to</em> and Past Simple, <em>which / who / where / when</em>, <em>whereas</em>, <em>unlike</em>).',
    practice: [
      { id: 'sgCheck', title: 'Practise for Checkpoint 2', pill: 'One question at a time · 45 s',
        intro: 'It works like the real checkpoint: 11 questions, one at a time, about 45 seconds each, with no going back and no notes. This is only practice: nothing is sent, you can repeat it, and at the end you see your answers and the key.',
        mock: { secs: 45 },
        items: [
          { q: 'Thanksgiving is ___ the fourth Thursday of November.', a: ['on'], why: 'Days and dates → on.' },
          { q: 'My sister ___ (get up) at seven every day.', a: ['gets up'], why: 'Present Simple for routines: he / she / it + -s (LS1).' },
          { q: 'My grandparents ___ ___ live in a village, but now they live in Girona.', a: ['used to'], why: 'A past habit or state that is not true now.' },
          { q: 'Leicester is a city ___ thousands of people celebrate Diwali.', a: ['where'], why: 'A place → where.' },
          { q: 'At Holi, people throw coloured ___ at each other.', a: ['powder'], why: 'Holi: coloured powder (Learning Path 2).' },
          { q: '___ Diwali and Christmas are festivals of light.', a: ['both'], why: 'Both… and… for two things that are the same.' },
          { q: 'The Pilgrims ___ (have) a harvest feast in 1621.', a: ['had'], why: 'One finished event in the past: Past Simple (irregular).' },
          { q: 'How often ___ you do sport?', a: ['do'], why: 'Present Simple questions: How often do you…? (LS1).' },
          { q: 'Hanukkah is ___ to Diwali: both use lights.', a: ['similar'], why: 'similar to = almost the same as.' },
          { q: '6/1 → on the ___ of January', a: ['sixth', '6th'], why: 'Dates use ordinal numbers: the sixth.' },
          { q: 'Did you ___ to wear a costume when you were little?', a: ['use'], why: 'Questions: Did… use to…? (no -d).' }
        ] },
      { id: 'sgListen', title: 'Like the exam: Listening', pill: '4 × 2 points',
        intro: 'Listen to the podcast from this Learning Path once without the questions. Then read the questions and listen again.',
        audio: 'audio/culture-bites-origins.mp3', pts: [2, 2],
        items: [
          { q: 'When did Samhain take place?', o: ['at the end of the harvest and the start of winter', 'in the middle of summer', 'on Christmas Eve', 'at the start of spring'], why: '“…at the end of the harvest and the start of winter.”' },
          { q: 'Why did people wear masks at Samhain?', o: ['to hide from the spirits', 'to look funny', 'to keep warm', 'to win a prize'], why: '“…wear masks to hide from the spirits.”' },
          { q: 'Who were the Wampanoag?', o: ['the people who lived in the area', 'English settlers', 'Irish families in the USA', 'a group of farmers from England'], why: '“…the Wampanoag people, who lived in the area.”' },
          { q: 'Which phrase shows that not everyone sees Thanksgiving as a happy day?', o: ['“For some Native Americans, it is a day of mourning.”', '“Many people say what they are grateful for.”', '“It lasted three days.”', '“Families travel home, get together and share a big meal.”'], why: 'A day of mourning = a sad day to remember what they lost.' }
        ] },
      { id: 'sgRead', title: 'Like the exam: Reading', pill: '3 × 2 points',
        intro: 'Read the text and choose the right answer.', pts: [2, 2],
        text: '<p><strong>Bonfire Night</strong></p><p>Bonfire Night takes place in the UK on the fifth of November. It dates back to 1605, when a man called Guy Fawkes tried to blow up the Houses of Parliament in London. He failed, and people lit bonfires to celebrate that the king was safe.</p><p>Today, families go to big firework displays in parks, and many towns have a huge bonfire. Children used to make a “guy”, a doll made of old clothes, and ask people for “a penny for the guy”. Now very few children do this. People eat hot food outside, like baked potatoes and toffee apples, because it is usually cold and wet.</p>',
        items: [
          { q: 'Why did people light bonfires in 1605?', o: ['to celebrate that the king was safe', 'to keep warm in November', 'to remember Guy Fawkes as a hero', 'because the Houses of Parliament burned'], why: '“…people lit bonfires to celebrate that the king was safe.”' },
          { q: 'What did children use to do?', o: ['make a doll of old clothes and ask for money', 'buy fireworks for their parents', 'cook baked potatoes in the park', 'visit their neighbours at midnight'], why: '“Children used to make a ‘guy’… and ask people for ‘a penny for the guy’.”' },
          { q: 'Which is the correct note about Bonfire Night?', o: ['What: bonfires and fireworks · When: 5 November · Where: the UK', 'What: bonfires and fireworks · When: 1 November · Where: the UK', 'What: bonfires and fireworks · When: 5 November · Where: Ireland', 'What: costumes and sweets · When: 5 November · Where: the UK'], why: 'Check all three parts: what, when and where.' }
        ] },
      { id: 'sgVocab', title: 'Like the exam: Vocabulary', pill: '1 point · gaps 2 points',
        intro: 'Choose the right word, or type it.', pts: [1, 2],
        items: [
          { q: 'Many students ___ home for the holidays.', o: ['travel', 'trip', 'journey', 'visit'], why: 'travel home for the holidays (trip and journey are nouns).' },
          { q: 'The parade ends in the town ___, in front of the church.', o: ['square', 'roof', 'gate', 'floor'], why: 'the town square = the main open place of a town.' },
          { q: 'At Christmas the city centre has ___ streets: you can hardly walk.', o: ['crowded', 'empty', 'quiet', 'mild'], why: 'crowded = full of people.' },
          { q: 'The Pilgrims and the Wampanoag shared a harvest ___.', o: ['feast', 'field', 'flight', 'fear'], why: 'a feast = a big special meal.' },
          { q: '___ Christmas, the Castanyada is only one evening. (= different from Christmas)', a: ['unlike'], why: 'Unlike + noun shows a difference.' },
          { q: 'We celebrate the Castanyada ___ a year, on 31 October.', a: ['once'], why: 'once a year = one time every year.' }
        ] },
      { id: 'sgGrammar', title: 'Like the exam: Grammar', pill: '1 point · gaps 2 points',
        intro: 'Choose the right form, or type it.', pts: [1, 2],
        items: [
          { q: 'When I was little, I ___ believe in ghosts.', o: ['used to', 'use to', 'was used', 'using to'], why: 'Affirmative: used to + verb.' },
          { q: 'The Pilgrims ___ in America in 1620.', o: ['arrived', 'arrive', 'have arrived', 'used to arrive'], why: 'One finished event with a date: Past Simple.' },
          { q: 'Rangoli are colourful patterns ___ people make on the floor at Diwali.', o: ['which', 'who', 'where', 'when'], why: 'Things → which / that.' },
          { q: 'Ireland is the country ___ Samhain started.', o: ['where', 'which', 'when', 'who'], why: 'A place → where.' },
          { q: 'Turkey is the main dish at Thanksgiving, ___ chestnuts are the main food at the Castanyada.', a: ['whereas', 'while'], why: 'whereas / while: a contrast between two things.' },
          { q: 'My parents ___ (not / use to) celebrate Halloween.', a: ["didn't use to", 'did not use to'], why: 'Negative: didn’t use to (no -d).' }
        ] }
    ]
  }
};
