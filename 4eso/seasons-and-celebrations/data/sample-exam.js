/* LS2 · Sample exam (practice, not graded). Reading text approved; the listening script and grammar items follow the approved forms. */
window.LP = {
  key: 'ls2SampleExam4ESO', n: 'E', title: 'Sample exam',
  panels: [
    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: Two winter traditions', pill: '80 %',
      intro: { ca: 'Llegeix el text i respon. Fes-ho sense apunts, com a l’examen.', en: 'Read and answer, without notes, as in the exam.' },
      media: { text: {
        insecure: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log (a piece of a tree) with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song. Then the log “gives” them sweets and small presents.</p><p>In the UK and other countries, children have an Advent calendar. It has 24 small doors. Children open one door every day from 1 December. Behind each door there is a picture or a piece of chocolate.</p>',
        safe: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many have chocolate or small toys.</p>',
        daring: '<p>In Catalonia, many families have a Caga Tió at Christmas, a tradition which is thought to date back to old winter celebrations in the countryside. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks while they sing a traditional song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar, which counts down the days until Christmas. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many contain chocolate, small toys or even beauty products for adults. Some people think this shows how commercialised Christmas has become, while others say it simply shows that traditions evolve.</p>'
      } },
      items: [
        { q: 'When do children start feeding the Caga Tió?', o: ['on 8 December', 'on 1 December', 'on Christmas Eve'] },
        { q: 'What do children do on Christmas Eve or Christmas Day?', o: ['They hit it with sticks and sing a song.', 'They open 24 doors.', 'They give it presents.'] },
        { q: 'How many doors does an Advent calendar have?', o: ['24', '8', '12'] },
        { r: 'safe', q: 'What did Advent calendars use to have?', o: ['only pictures', 'only chocolate', 'small toys'] },
        { r: 'safe', q: 'Which is a similarity between the two traditions?', o: ['Both start in December and give children sweets.', 'Both come from the UK.', 'Both use a log.'] },
        { r: 'daring', q: 'Which tradition has changed more over time, according to the text?', o: ['the Advent calendar', 'the Caga Tió', 'neither'] },
        { r: 'daring', q: 'What do some people think modern Advent calendars show?', o: ['that Christmas has become commercialised', 'that the Caga Tió is more popular', 'that children prefer pictures'] }
      ] },
    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: Winter Fair radio announcement', pill: '80 %',
      intro: { ca: 'Escolta l’anunci dues vegades i respon.', en: 'Listen twice and answer.' },
      media: { audio: 'audio/winter-fair-announcement.mp3', title: 'Radio announcement: the Winter Fair', script: [
        ['Presenter', 'Good morning, everyone! Here’s some news for families in town. This year’s Winter Fair takes place on Saturday the nineteenth of December in the town square.'],
        ['Presenter', 'The fair opens at ten in the morning and closes at eight in the evening. There will be more than thirty stalls with local food, handmade decorations and presents.'],
        ['Presenter', 'At twelve o’clock, the school choir is singing traditional songs, and at six there will be a light show for the whole family.'],
        ['Presenter', 'Entry is free, but the food stalls will only take cash, so bring some coins!'],
        ['Presenter', 'And if it rains? Don’t worry. The organisers are moving the stalls to the community centre.'],
        ['Presenter', 'We think it’ll be a great day out. See you there!']] },
      items: [
        { q: 'When is the Winter Fair?', o: ['Saturday 19 December', 'Sunday 19 December', 'Saturday 9 December'] },
        { q: 'Where is it?', o: ['in the town square', 'at the school', 'in the community centre'] },
        { q: 'What time does it open?', o: ['at 10 a.m.', 'at 12 p.m.', 'at 6 p.m.'] },
        { q: 'What happens at six?', o: ['a light show', 'the choir sings', 'the fair closes'] },
        { r: 'safe', q: 'How can you pay at the food stalls?', o: ['only in cash', 'only by card', 'it’s free'] },
        { r: 'daring', q: '“The organisers are moving the stalls to the community centre.” This is…', o: ['an arrangement if it rains', 'a timetable', 'a decision made now'] }
      ] },
    { id: 'grammar', type: 'typed', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica i vocabulari', en: 'Grammar and vocabulary' }, pill: '80 %',
      intro: { ca: 'Completa sense apunts.', en: 'Complete without notes.' },
      items: [
        { q: 'Children ___ (open) one door every day.', a: ['open'] },
        { q: 'The Caga Tió ___ (give) children sweets.', a: ['gives'] },
        { q: 'Christmas is ___ 25 December.', a: ['on'] },
        { q: 'We ___ ___ ___ (visit) our grandparents at Christmas. It’s our plan.', a: ['are going to visit', "'re going to visit"] },
        { q: '“I’m cold.” “I ___ close the window.”', a: ['will', "'ll"] },
        { q: 'We would like ___ organise a winter fair.', a: ['to'] },
        { r: 'safe', q: 'Advent calendars ___ ___ have only pictures.', a: ['used to'] },
        { r: 'safe', q: 'The fair ___ (open) at ten.', a: ['opens'] },
        { r: 'safe', q: 'The town square is the place ___ the fair takes place.', a: ['where'] },
        { r: 'daring', q: 'The Caga Tió, ___ is a Catalan tradition, is very popular with children.', a: ['which'] },
        { r: 'daring', q: 'Sweets ___ ___ (give) to children on Christmas Day. (passive)', a: ['are given'] },
        { r: 'daring', q: 'We look forward to ___ (see) you at the fair.', a: ['seeing'] }
      ] },
    { id: 'write', type: 'writing', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Escriptura', en: 'Writing' },
      intro: { ca: 'Escriu sense apunts, com a l’examen. Després demana feedback.', en: 'Write without notes, as in the exam. Then get feedback.' },
      task: { insecure: 'Descriu una celebració d’hivern (60–80 paraules): què és, quan, tres costums, un menjar o símbol i com et sents.', safe: 'Compare two winter celebrations (100–130 words): similarities and differences.', daring: 'Explain how a winter celebration has changed over time and why (140–180 words).' },
      min: { insecure: 60, safe: 100, daring: 140 },
      checklist: { insecure: ['Present Simple per als costums', 'on / in / at', 'Tres costums', 'Com em sento i per què'], safe: ['Similarities (both… and / similar to)', 'Differences (whereas / different from)', 'Linked paragraphs'], daring: ['Past (used to) and present compared', 'Reasons for the change', 'Linked paragraphs with concession'] } }
  ]
};
