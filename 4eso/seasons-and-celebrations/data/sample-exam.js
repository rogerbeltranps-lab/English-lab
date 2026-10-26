/* LS2 · Sample exam (practice, not graded): the same format and points as the real exam (Google Forms, approved by Roger on 25 Oct 2026),
   so students know the points of every section. Everything except the email is multiple choice or a short gap and is marked automatically
   (first try = the exam score); the email gets feedback and a guide mark from ChatGPT with the 5.1 levels (ChatGPT can make mistakes; in the
   exam the teacher marks it). Each route has its own list of items (same number per route). Out of 100: listening 10 + listening chart 10,
   reading 10 + reading log 10 (the chart and the log are 5 multiple-choice questions each since Roger's change of 25 Oct 2026), vocabulary 15,
   grammar 15, writing 30. Numbered 1–43 like the real exam; multiple choice has four options (the first is the right one; the engine shuffles). */
(function () {
const L30 = [8, 15, 23, 30];
const SCRIPT = [
  ['Callum', '[cheerful] Hi, I’m Callum, from Edinburgh in Scotland. In Scotland, New Year’s Eve is called Hogmanay, and for us it’s bigger than Christmas! There’s a huge street party in the city centre, with concerts and fireworks over the castle at midnight. It’s usually freezing, so you wear about three jumpers. [laughs]'],
  ['Callum', 'Then everyone holds hands and sings an old song, “Auld Lang Syne”. [laughs] Nobody knows all the words! It’s a song about old friends and remembering the good times. After midnight, we go “first-footing”: you visit your neighbours and you’re the first person to walk into their house in the new year.'],
  ['Callum', 'You bring a small present, like shortbread or a piece of coal for the fire. My gran says the first visitor brings luck for the whole year, so she always makes sure a friendly neighbour comes first. Last year I was our neighbours’ first visitor, and they gave me a huge slice of cake. What I love is that the whole street feels like one big family.'],
  ['Yuki', '[calm] Hello, I’m Yuki, and I’m from Osaka in Japan. New Year, or Shōgatsu, is the most important holiday of the year for my family. Schools and many offices close for several days, and lots of people travel home to their parents’ houses. [thoughtful] It’s quite quiet, not like a party.'],
  ['Yuki', 'On the thirty-first of December, we clean the whole house, so we can start the year fresh. In the evening we eat long noodles, because they mean a long life. At midnight, temple bells ring one hundred and eight times. On the first of January, we eat special food that my mother and grandmother cook for days, and we visit a shrine to pray for a good year. Children get money in small envelopes.'],
  ['Yuki', 'We also send New Year cards to our friends and teachers, and they all arrive on the same morning. [softly] For me, New Year is about starting again. You leave the problems of the old year behind, and you thank your family for everything.']
];
const TEXTS = {
  beginners: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log (a piece of a tree) with a face, a red hat and a blanket. From 8 December, children “feed” it every night. On Christmas Day, they hit it with sticks and sing a song. Then the log “gives” them sweets and small presents.</p><p>In the UK, children have an Advent calendar. It has 24 small doors. Children open one door every day from 1 December. Behind each door there is a picture or a piece of chocolate.</p>',
  insecure: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log (a piece of a tree) with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song. Then the log “gives” them sweets and small presents.</p><p>In the UK and other countries, children have an Advent calendar. It has 24 small doors. Children open one door every day from 1 December. Behind each door there is a picture or a piece of chocolate.</p>',
  safe: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many have chocolate or small toys.</p>',
  daring: '<p>In Catalonia, many families have a Caga Tió at Christmas, a tradition which is thought to date back to old winter celebrations in the countryside. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks while they sing a traditional song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar, which counts down the days until Christmas. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many contain chocolate, small toys or even beauty products for adults. Some people think this shows how commercialised Christmas has become, while others say it simply shows that traditions evolve.</p>'
};
const scriptText = SCRIPT.map(l => l[0] + ': ' + l[1].replace(/\[[^\]]+\]\s*/g, '')).join('\n');
const L51 = ['Unfinished or not understandable; no clear purpose or request, or informal, even with the template.',
  'Purpose, plan and request present, close to the template or model; future forms mostly correct; errors that do not block meaning; mostly formal.',
  'Clear paragraphs (purpose, plan, request, closing), formal register, future forms and a relative clause used correctly; adapts the model.',
  'Clear, well-linked and persuasive beyond the model (varied linkers, polite requests; Daring: the concern answered), few errors.'];
const AUDIO = { audio: 'audio/sample-exam-new-year.mp3', title: 'Two New Years: Callum and Yuki', script: SCRIPT };

window.LP = {
  key: 'ls2SampleExam4ESO', n: 'E', title: 'Sample exam',
  panels: [
    { id: 'how', type: 'info', tab: { ca: 'Com és', en: 'How it works' }, title: { ca: 'Com és l’examen', en: 'How the exam works' },
      html: { ca: '<p>Aquest examen d’exemple té <strong>el mateix format i els mateixos punts que l’examen real</strong> (que faràs amb un Google Forms). 55 minuts, sense apunts.</p>' +
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 preguntes + listening chart, 5 preguntes (2 punts cada una)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 preguntes + reading log, 5 preguntes (2 punts cada una)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: un correu formal</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>Totes les preguntes es corregeixen soles: el <strong>primer intent</strong> és la teva nota, com a l’examen. El correu el corregeix <strong>ChatGPT</strong> amb els criteris de l’examen i et dona una nota orientativa. Al final, a <em>La meva nota</em>, veuràs el total.</p><p class="warm-note">⚠️ ChatGPT es pot equivocar: la seva nota només és orientativa. A l’examen real, el correu el corregeix el professorat.</p>',
        en: '<p>This sample exam has <strong>the same format and the same points as the real exam</strong> (which you will do in a Google Form). 55 minutes, no notes.</p>' +
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 questions + listening chart, 5 questions (2 points each)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 questions + reading log, 5 questions (2 points each)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: a formal email</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>All the questions are marked automatically: your <strong>first try</strong> is your score, as in the exam. The email is marked by <strong>ChatGPT</strong> with the exam criteria, which gives you a guide mark. At the end, <em>My score</em> shows your total.</p><p class="warm-note">⚠️ ChatGPT can make mistakes: its mark is only a guide. In the real exam, your teacher marks the email.</p>' } },

    { id: 'listen', type: 'quiz', tab: 'Listening', title: 'Listening: Two New Years', pts: [2, 2], start: 1,
      intro: { ca: 'Escolta dues vegades el Callum i la Yuki, que parlen del seu Cap d’Any, i respon.', en: 'Listen twice to Callum and Yuki talking about their New Year, and answer.' },
      media: AUDIO,
      items: {
        beginners: [
          { q: 'Where is Callum from?', o: ['Scotland', 'England', 'Japan', 'Ireland'] },
          { q: 'What is Hogmanay?', o: ['New Year’s Eve in Scotland', 'Christmas in Scotland', 'a Scottish song', 'a Scottish dance'] },
          { q: 'What is the weather like at Hogmanay?', o: ['very cold', 'very hot', 'rainy', 'sunny'] },
          { q: 'What does Yuki’s family do on 31 December?', o: ['They clean the house.', 'They have a street party.', 'They visit the neighbours.', 'They go to the beach.'] },
          { q: 'What do children get at New Year in Japan?', o: ['money in small envelopes', 'shortbread', 'new clothes', 'a new phone'] }
        ],
        insecure: [
          { q: 'Where is Callum from?', o: ['Edinburgh, in Scotland', 'London, in England', 'Osaka, in Japan', 'Dublin, in Ireland'] },
          { q: 'What is Hogmanay?', o: ['New Year’s Eve in Scotland', 'Christmas in Scotland', 'a Scottish song', 'a Scottish dance'] },
          { q: 'What do people sing at midnight?', o: ['an old song, “Auld Lang Syne”', 'a Christmas song', 'a pop song', 'a song about the snow'] },
          { q: 'What does Yuki’s family do on 31 December?', o: ['They clean the whole house.', 'They have a street party.', 'They visit the neighbours.', 'They go to the beach.'] },
          { q: 'What do children get at New Year in Japan?', o: ['money in small envelopes', 'shortbread', 'new clothes', 'a new phone'] }
        ],
        safe: [
          { q: 'How is Hogmanay different from Christmas for Callum?', o: ['It is bigger.', 'It is quieter.', 'It is only for families.', 'It is exactly the same.'] },
          { q: 'What is “first-footing”?', o: ['being the first visitor in a neighbour’s house in the new year', 'the first dance of the year', 'walking to the city centre at midnight', 'a special New Year meal'] },
          { q: 'What does Callum’s gran believe?', o: ['The first visitor brings luck for the year.', 'Shortbread brings bad luck.', 'Nobody should visit after midnight.', 'Children should go to bed early.'] },
          { q: 'Why does Yuki’s family clean the house on 31 December?', o: ['to start the year fresh', 'because guests are coming', 'because the temple asks them', 'because it is a school rule'] },
          { q: 'How many times do the temple bells ring?', o: ['108', '12', '100', '24'] }
        ],
        daring: [
          { q: 'Why does Callum laugh when he says “Nobody knows all the words”?', o: ['It’s funny that everyone sings a song they don’t fully know.', 'He doesn’t like the song.', 'He forgot the words himself.', 'He thinks the song is too long.'] },
          { q: 'How is Yuki’s New Year different from Callum’s?', o: ['It is quiet, not like a party.', 'It is bigger than Christmas.', 'It takes place in the street.', 'It is mainly about fireworks.'] },
          { q: 'How does Yuki sound at the end?', o: ['calm and thoughtful', 'excited', 'worried', 'angry'] },
          { q: 'What does Callum value most?', o: ['feeling that the whole street is one big family', 'the fireworks', 'the presents', 'the food'] },
          { q: 'What does Yuki mean by “you leave the problems of the old year behind”?', o: ['New Year is a fresh start.', 'Her family moves house every year.', 'Problems are only for adults.', 'You should forget your old friends.'] }
        ] } },

    { id: 'chart', type: 'quiz', tab: 'Listening chart', title: 'Listening chart', pts: [2, 2], start: 6,
      intro: { ca: 'Torna a escoltar si cal. Què valora cada persona i com ho saps? Pensa en les seves paraules i en el seu to de veu.', en: 'Listen again if you need to. What does each speaker value, and how do you know? Think about their words and their tone of voice.' },
      media: AUDIO,
      items: {
        beginners: [
          { q: 'What does Callum love most about Hogmanay?', o: ['being with his neighbours', 'the presents', 'the cold weather', 'the cake'] },
          { q: 'Which words show it?', o: ['“The whole street feels like one big family.”', '“It’s usually freezing.”', '“Nobody knows all the words!”', '“They gave me a huge slice of cake.”'] },
          { q: 'What is New Year about for Yuki?', o: ['starting again and her family', 'a big street party', 'money', 'noodles'] },
          { q: 'Which words show it?', o: ['“For me, New Year is about starting again.”', '“Children get money in small envelopes.”', '“In the evening we eat long noodles.”', '“Schools and many offices close.”'] },
          { q: 'How does Yuki sound?', o: ['calm', 'angry', 'very excited', 'scared'] }
        ],
        insecure: [
          { q: 'What does Callum love most about Hogmanay?', o: ['being together with his neighbours', 'the presents', 'the cold weather', 'the cake'] },
          { q: 'Which words from the recording show it?', o: ['“The whole street feels like one big family.”', '“It’s usually freezing.”', '“Nobody knows all the words!”', '“They gave me a huge slice of cake.”'] },
          { q: 'What is New Year about for Yuki?', o: ['starting again and thanking her family', 'a big street party', 'getting money in envelopes', 'eating long noodles'] },
          { q: 'Which words from the recording show it?', o: ['“For me, New Year is about starting again.”', '“Children get money in small envelopes.”', '“In the evening we eat long noodles.”', '“Schools and many offices close for several days.”'] },
          { q: 'How does Yuki sound?', o: ['calm', 'angry', 'very excited', 'scared'] }
        ],
        safe: [
          { q: 'What does Callum value most about Hogmanay?', o: ['the feeling of community with his neighbours', 'the concerts in the city centre', 'the presents he gets', 'the fireworks over the castle'] },
          { q: 'Which phrase from the recording shows what Callum values?', o: ['“The whole street feels like one big family.”', '“It’s usually freezing, so you wear about three jumpers.”', '“Nobody knows all the words!”', '“There’s a huge street party in the city centre.”'] },
          { q: 'What does Yuki value most about New Year?', o: ['a fresh start and thanking her family', 'the money children get in envelopes', 'the long noodles', 'sending cards to her teachers'] },
          { q: 'Which phrase from the recording shows what Yuki values?', o: ['“You leave the problems of the old year behind.”', '“Children get money in small envelopes.”', '“They all arrive on the same morning.”', '“Schools and many offices close for several days.”'] },
          { q: 'How is Callum’s tone different from Yuki’s?', o: ['Callum sounds cheerful and laughs; Yuki sounds calm and quiet.', 'Callum sounds sad; Yuki sounds excited.', 'Both sound angry.', 'Callum sounds bored; Yuki sounds nervous.'] }
        ],
        daring: [
          { q: 'Which detail best shows how much neighbours matter at Hogmanay?', o: ['After midnight, people visit their neighbours to be the first visitor of the year.', 'There are fireworks over the castle at midnight.', 'People wear about three jumpers because it is freezing.', 'There are concerts in the city centre.'] },
          { q: 'Which detail best shows that Yuki values her family?', o: ['She says New Year is a time to thank your family for everything.', 'She says schools close for several days.', 'She says the temple bells ring 108 times.', 'She says the cards all arrive on the same morning.'] },
          { q: 'How does Callum’s tone support what he says?', o: ['He laughs and sounds cheerful, which matches the party he describes.', 'He sounds calm and serious, which shows Hogmanay is a quiet holiday.', 'He sounds nervous, which shows he is afraid of the cold.', 'He sounds bored, which shows he prefers Christmas.'] },
          { q: 'What do Callum and Yuki have in common?', o: ['For both, New Year is about the people around them: neighbours for Callum, family for Yuki.', 'Both celebrate with a big street party.', 'Both get money in small envelopes.', 'Both think New Year is less important than Christmas.'] },
          { q: 'Which detail best supports Yuki’s idea of a fresh start?', o: ['Her family cleans the whole house on 31 December.', 'Children get money in small envelopes.', 'Schools and offices close for several days.', 'Her mother and grandmother cook for days.'] }
        ]
      } },

    { id: 'read', type: 'quiz', tab: 'Reading', title: 'Reading: Two winter traditions', pts: [2, 2], start: 11,
      intro: { ca: 'Llegeix el text i respon, sense apunts.', en: 'Read and answer, without notes.' },
      media: { text: TEXTS },
      items: {
        beginners: [
          { q: 'When do children start feeding the Caga Tió?', o: ['on 8 December', 'on 1 December', 'on Christmas Day', 'on 6 January'] },
          { q: 'What does the Caga Tió wear?', o: ['a red hat and a blanket', 'a mask', 'a costume', 'a scarf and gloves'] },
          { q: 'What do children do on Christmas Day?', o: ['They hit it with sticks and sing a song.', 'They open 24 doors.', 'They give it presents.', 'They take it to school.'] },
          { q: 'How many doors does an Advent calendar have?', o: ['24', '8', '12', '31'] },
          { q: 'What is behind each door?', o: ['a picture or a piece of chocolate', 'a small log', 'a song', 'a candle'] }
        ],
        insecure: [
          { q: 'When do children start feeding the Caga Tió?', o: ['on 8 December', 'on 1 December', 'on Christmas Eve', 'on 6 January'] },
          { q: 'What do children do on Christmas Eve or Christmas Day?', o: ['They hit it with sticks and sing a song.', 'They open 24 doors.', 'They give it presents.', 'They take it to school.'] },
          { q: 'What does the Caga Tió wear?', o: ['a red hat and a blanket', 'a mask', 'a costume', 'a scarf and gloves'] },
          { q: 'How many doors does an Advent calendar have?', o: ['24', '8', '12', '31'] },
          { q: 'What is behind each door?', o: ['a picture or a piece of chocolate', 'a small log', 'a song', 'a candle'] }
        ],
        safe: [
          { q: 'What do children do every night from 8 December?', o: ['They feed it and keep it warm.', 'They open a door.', 'They hit it with sticks.', 'They sing to it.'] },
          { q: 'What does the log “give” children?', o: ['sweets and small presents', 'only chocolate', 'pictures', 'money'] },
          { q: 'What did Advent calendars use to have?', o: ['only pictures', 'only chocolate', 'small toys', 'cards with songs'] },
          { q: 'When do children open the first door?', o: ['on 1 December', 'on 8 December', 'on 24 December', 'on 25 December'] },
          { q: 'Which is a similarity between the two traditions?', o: ['Both start in December and give children sweets.', 'Both come from the UK.', 'Both use a log.', 'Both are only for adults.'] }
        ],
        daring: [
          { q: 'Where does the Caga Tió probably come from?', o: ['old winter celebrations in the countryside', 'the UK', 'Advent calendars', 'a modern TV advert'] },
          { q: 'What does an Advent calendar count down?', o: ['the days until Christmas', 'the presents a child gets', 'the hours of Christmas Eve', 'the weeks of winter'] },
          { q: 'What is new in some Advent calendars today?', o: ['beauty products for adults', 'pictures', '24 small doors', 'handmade wooden doors'] },
          { q: 'What do some people think the changes show?', o: ['how commercialised Christmas has become', 'that children don’t like chocolate', 'that traditions never change', 'that Christmas is less popular'] },
          { q: 'Which tradition has changed more over time, according to the text?', o: ['the Advent calendar', 'the Caga Tió', 'both equally', 'neither of them'] }
        ] } },

    { id: 'log', type: 'quiz', tab: 'Reading log', title: 'Reading log', pts: [2, 2], start: 16,
      intro: { ca: 'Tria la nota correcta per a cada tradició, després els costums i el significat d’una paraula. Pots tornar a mirar el text.', en: 'Choose the correct note for each tradition, then the main customs and the meaning of a word from its context. You can look at the text again.' },
      media: { text: TEXTS },
      items: {
        beginners: [
          { q: 'Which is the correct note about the Caga Tió?', o: ['What: a log with a face · When: from 8 December · Where: Catalonia', 'What: a log with a face · When: from 1 December · Where: Catalonia', 'What: a calendar with doors · When: from 8 December · Where: Catalonia', 'What: a log with a face · When: from 8 December · Where: the UK'] },
          { q: 'Which is the correct note about the Advent calendar?', o: ['What: a calendar with 24 doors · When: from 1 December · Where: the UK', 'What: a calendar with 24 doors · When: from 8 December · Where: the UK', 'What: a calendar with 8 doors · When: from 1 December · Where: the UK', 'What: a calendar with 24 doors · When: from 1 December · Where: Catalonia'] },
          { q: 'Which of these is a custom of the Caga Tió?', o: ['Children “feed” it every night.', 'Children open a small door every day.', 'Children find chocolate behind a door.', 'Children send it a card.'] },
          { q: 'Which of these is a custom of the Advent calendar?', o: ['Children open one door every day.', 'Children feed it every night.', 'Children keep it warm with a blanket.', 'Children hit it with sticks.'] },
          { q: 'The Caga Tió has “a red hat and a blanket”. What is a “blanket”?', o: ['a piece of cloth that keeps you warm', 'a kind of sweet', 'a small door', 'a stick'] }
        ],
        insecure: [
          { q: 'Which is the correct note about the Caga Tió?', o: ['What: a log with a face · When: from 8 December to Christmas · Where: Catalonia', 'What: a log with a face · When: from 1 December to Christmas · Where: Catalonia', 'What: a calendar with doors · When: from 8 December to Christmas · Where: Catalonia', 'What: a log with a face · When: from 8 December to Christmas · Where: the UK'] },
          { q: 'Which is the correct note about the Advent calendar?', o: ['What: a calendar with 24 small doors · When: from 1 December · Where: the UK and other countries', 'What: a calendar with 24 small doors · When: from 8 December · Where: the UK and other countries', 'What: a calendar with 8 small doors · When: from 1 December · Where: the UK and other countries', 'What: a calendar with 24 small doors · When: from 1 December · Where: only in Catalonia'] },
          { q: 'Which of these is a custom of the Caga Tió?', o: ['Children “feed” it every night.', 'Children open a small door every day.', 'Children find chocolate behind a door.', 'Children send it a card.'] },
          { q: 'Which of these is a custom of the Advent calendar?', o: ['Children open one door every day.', 'Children feed it every night.', 'Children keep it warm with a blanket.', 'Children hit it with sticks.'] },
          { q: 'The Caga Tió has “a red hat and a blanket”, and children keep it warm. What is a “blanket”?', o: ['a piece of cloth that keeps you warm', 'a kind of sweet', 'a small door', 'a stick'] }
        ],
        safe: [
          { q: 'Which is the correct note about the Caga Tió?', o: ['What: a log with a face that “gives” sweets · When: from 8 December to Christmas · Where: Catalonia', 'What: a log with a face that “gives” sweets · When: from 1 December to Christmas · Where: Catalonia', 'What: a log with a face that “gives” sweets · When: from 8 December to Christmas · Where: the UK', 'What: a calendar with 24 small doors · When: from 8 December to Christmas · Where: Catalonia'] },
          { q: 'Which is the correct note about the Advent calendar?', o: ['What: a calendar with 24 small doors · When: from 1 December · Where: the UK and many other countries', 'What: a calendar with 24 small doors · When: from 8 December · Where: the UK and many other countries', 'What: a calendar with 12 small doors · When: from 1 December · Where: the UK and many other countries', 'What: a calendar with 24 small doors · When: from 1 December · Where: only in Catalonia'] },
          { q: 'Which are the two main customs of the Caga Tió?', o: ['feeding it every night and hitting it with sticks while singing', 'opening a door every day and eating chocolate', 'giving it presents and sending cards', 'decorating it with lights and hiding it'] },
          { q: 'Which are the two main customs of the Advent calendar?', o: ['opening one door every day and finding a picture or chocolate', 'feeding it and keeping it warm', 'hitting it with sticks and singing a song', 'giving it to a neighbour and cleaning the house'] },
          { q: 'In the text, what is a “log”?', o: ['a piece of a tree', 'a small door', 'a kind of chocolate', 'a red hat'] }
        ],
        daring: [
          { q: 'Which is the most accurate note about the Caga Tió?', o: ['What: a log that “gives” children sweets, probably from old winter celebrations · When: from 8 December to Christmas · Where: Catalonia', 'What: a log that “gives” children sweets, invented in the UK · When: from 8 December to Christmas · Where: Catalonia', 'What: a log that “gives” children sweets, probably from old winter celebrations · When: only on 8 December · Where: Catalonia', 'What: a log that “gives” adults beauty products · When: from 8 December to Christmas · Where: Catalonia'] },
          { q: 'Which is the most accurate note about the Advent calendar?', o: ['What: a calendar that counts down to Christmas, now often commercial · When: from 1 December · Where: the UK and many other countries', 'What: a calendar that counts down to Christmas, now with only pictures · When: from 1 December · Where: the UK and many other countries', 'What: a calendar that counts down to Christmas, now often commercial · When: from 8 December · Where: the UK and many other countries', 'What: a calendar that counts down to the New Year, now often commercial · When: from 1 December · Where: the UK and many other countries'] },
          { q: 'Which are the two main customs of the Caga Tió?', o: ['feeding and warming the log every night, then hitting it with sticks while singing', 'opening a door every day and finding a picture', 'carrying the log around the village in a parade', 'buying beauty products for adults'] },
          { q: 'Which are the main customs of the Advent calendar?', o: ['opening one door a day from 1 December and finding a picture or a treat', 'feeding it every night and keeping it warm', 'hitting it with sticks while singing', 'hiding it until Christmas Eve'] },
          { q: 'The text says the log “gives” children sweets. Why is “gives” in quotation marks?', o: ['Because the log can’t really give anything: adults put the sweets there.', 'Because it is a Catalan word.', 'Because the children give the sweets to the log.', 'Because the sweets are a secret from the adults.'] }
        ]
      } },

    { id: 'vocab', type: 'quiz', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Vocabulari', en: 'Vocabulary' }, pts: [1, 2], start: 21,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la paraula que falta (2 punts).', en: 'Choose the right option (1 point), then write the missing word (2 points).' },
      items: {
        beginners: [
          { q: 'It’s ___ today: take an umbrella.', o: ['rainy', 'sunny', 'hot', 'dry'] },
          { q: 'At the Castanyada we eat roasted ___.', o: ['chestnuts', 'oranges', 'flowers', 'candles'] },
          { q: 'At Christmas we ___ the house with lights.', o: ['decorate', 'dance', 'sing', 'cook'] },
          { q: 'I feel ___ before a party: I love parties!', o: ['excited', 'cold', 'windy', 'old'] },
          { q: 'On Christmas Day we have a special ___ with all the family.', o: ['meal', 'mask', 'parade', 'leaf'] },
          { q: 'Children ___ up as witches at Halloween.', o: ['dress', 'sing', 'cook', 'eat'] },
          { q: 'Dear Mr Serra, We would ___ to organise a party.', o: ['like', 'enjoy', 'mind', 'make'] },
          { q: 'At Carnival, people wear a c______ and a mask.', a: ['costume'] },
          { q: 'At night there are f________ in the sky: boom!', a: ['fireworks'] },
          { q: 'At Hanukkah, families light c______.', a: ['candles'] },
          { q: 'At Christmas we give and get p_______.', a: ['presents'] }
        ],
        insecure: [
          { q: 'It’s ___ today: take an umbrella.', o: ['rainy', 'sunny', 'mild', 'dry'] },
          { q: 'At the Castanyada we eat roasted ___.', o: ['chestnuts', 'oranges', 'flowers', 'candles'] },
          { q: 'At Christmas we ___ the house with lights.', o: ['decorate', 'dance', 'sing', 'cook'] },
          { q: 'I feel ___ to my family: they help me a lot.', o: ['grateful', 'scared', 'windy', 'boring'] },
          { q: 'On Christmas Day we have a special ___ with all the family.', o: ['meal', 'mask', 'parade', 'leaf'] },
          { q: 'Dear Mr Serra, We would ___ to organise a party.', o: ['like', 'enjoy', 'mind', 'make'] },
          { q: 'I’m going to ___ my friends at the festival.', o: ['meet', 'book', 'buy', 'wear'] },
          { q: 'At Carnival, people wear a c______ and a mask.', a: ['costume'] },
          { q: 'In spring there are lots of f______ in the park.', a: ['flowers'] },
          { q: 'We celebrate New Year o___ a year.', a: ['once'] },
          { q: 'People walk in the street in a big p_____ with music.', a: ['parade'] }
        ],
        safe: [
          { q: 'It’s ___ this morning: I can’t see the end of the street.', o: ['foggy', 'sunny', 'cosy', 'warm'] },
          { q: 'All the students ___ part in the school parade.', o: ['take', 'make', 'get', 'do'] },
          { q: 'At midnight, families ___ gifts.', o: ['exchange', 'pass', 'gather', 'spend'] },
          { q: 'Holi is a very ___ festival: people throw coloured powder.', o: ['colourful', 'secular', 'chilly', 'quiet'] },
          { q: '___ Halloween, the Castanyada is not about scary costumes.', o: ['Unlike', 'Both', 'Whereas', 'However'] },
          { q: 'I look forward ___ hearing from you.', o: ['to', 'for', 'of', 'at'] },
          { q: 'We are going to ___ invitations to all the families.', o: ['send', 'set', 'run', 'take'] },
          { q: 'The fair will take place in the c________ centre.', a: ['community'] },
          { q: 'Many students t_____ home for the holidays.', a: ['travel'] },
          { q: 'Please l__ us know if the hall is free.', a: ['let'] },
          { q: 'We need to s__ up the tables before 9.00.', a: ['set'] }
        ],
        daring: [
          { q: 'Some old traditions might ___ out if young people lose interest.', o: ['die', 'pass', 'go', 'fall'] },
          { q: 'Halloween is known ___ costumes and pumpkins.', o: ['for', 'by', 'with', 'as'] },
          { q: 'Many customs ___ from old harvest festivals.', o: ['come', 'belong', 'depend', 'consist'] },
          { q: 'We should never take our traditions for ___.', o: ['granted', 'given', 'sure', 'real'] },
          { q: 'Young people can help keep a tradition ___.', o: ['alive', 'living', 'life', 'live'] },
          { q: 'I would ___ it if you could reply by Friday.', o: ['appreciate', 'ensure', 'propose', 'thank'] },
          { q: 'Traditions ___ over time: they change and adapt.', o: ['evolve', 'commemorate', 'honour', 'celebrate'] },
          { q: 'Lighting candles is an old r_____ in many religions.', a: ['ritual'] },
          { q: 'Every student can contribute ___ the event.', a: ['to'] },
          { q: 'We would appreciate the o__________ to present our project.', a: ['opportunity'] },
          { q: 'We need to c_______ the needs of every family.', a: ['consider'] }
        ] } },

    { id: 'grammar', type: 'quiz', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica', en: 'Grammar' }, pts: [1, 2], start: 32,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la forma que falta (2 punts). Pots fer servir contraccions.', en: 'Choose the right option (1 point), then write the missing words (2 points). Contractions are accepted.' },
      items: {
        beginners: [
          { q: 'People ___ chestnuts at the Castanyada.', o: ['eat', 'eats', 'are eat', 'eating'] },
          { q: 'My sister ___ TV every day.', o: ['watches', 'watch', 'is watch', 'watching'] },
          { q: 'Diwali takes place ___ autumn.', o: ['in', 'on', 'at', 'to'] },
          { q: 'We watch the fireworks ___ night.', o: ['at', 'in', 'on', 'to'] },
          { q: 'Christmas is ___ 25 December.', o: ['on', 'in', 'at', 'for'] },
          { q: '“It’s cold in here.” “I ___ close the window.”', o: ['’ll', '’m going', 'am', 'do'] },
          { q: 'First, we clean the house. ___, we decorate it.', o: ['Then', 'Because', 'But', 'Or'] },
          { q: 'We ___ ___ ___ (visit) our grandparents at Christmas. It’s our plan.', a: ['are going to visit', '’re going to visit', "'re going to visit"] },
          { q: 'The Caga Tió ___ (give) children sweets.', a: ['gives'] },
          { q: 'There ___ ___ music and food at the party.', a: ['will be'] },
          { q: 'We would ___ to organise a party.', a: ['like'] }
        ],
        insecure: [
          { q: 'People ___ chestnuts at the Castanyada.', o: ['eat', 'eats', 'are eat', 'eating'] },
          { q: 'My sister ___ like Halloween.', o: ['doesn’t', 'don’t', 'isn’t', 'not'] },
          { q: 'Diwali takes place ___ autumn.', o: ['in', 'on', 'at', 'to'] },
          { q: 'We watch the fireworks ___ night.', o: ['at', 'in', 'on', 'to'] },
          { q: 'Christmas is ___ 25 December.', o: ['on', 'in', 'at', 'for'] },
          { q: '“It’s cold in here.” “I ___ close the window.”', o: ['’ll', '’m going', 'am', 'do'] },
          { q: 'First, we clean the house. ___, we decorate it.', o: ['Then', 'Because', 'But', 'Or'] },
          { q: 'We ___ ___ ___ (visit) our grandparents at Christmas. It’s our plan.', a: ['are going to visit', '’re going to visit', "'re going to visit"] },
          { q: 'The Caga Tió ___ (give) children sweets.', a: ['gives'] },
          { q: 'It’s cold outside, ___ the house is cosy.', a: ['but'] },
          { q: '___ you going to come to the fair?', a: ['are'] }
        ],
        safe: [
          { q: 'Advent calendars ___ have only pictures.', o: ['used to', 'use to', 'were', 'using to'] },
          { q: 'Lincoln ___ Thanksgiving official in 1863.', o: ['made', 'makes', 'has made', 'was made'] },
          { q: 'Hanukkah is a festival ___ lasts eight days.', o: ['which', 'who', 'where', 'what'] },
          { q: '31 October is the day ___ we eat panellets.', o: ['when', 'where', 'which', 'who'] },
          { q: 'We ___ the band on Saturday. It’s all arranged.', o: ['are meeting', 'meets', 'will to meet', 'meeting'] },
          { q: 'The bus to the fair ___ at 9.15. (timetable)', o: ['leaves', 'is leaving to', 'will leaves', 'leaving'] },
          { q: '___ it be possible to use the gym?', o: ['Would', 'Could we', 'Do', 'Is'] },
          { q: 'Children ___ ___ ___ (not / use to) open Advent calendars with toys.', a: ['didn’t use to', 'did not use to', "didn't use to"] },
          { q: 'The first Thanksgiving ___ (take) place in 1621.', a: ['took'] },
          { q: 'The town square is the place ___ the fair takes place.', a: ['where'] },
          { q: 'I’m sure the visitors ___ ___ (enjoy) the stall.', a: ['will enjoy', '’ll enjoy', "'ll enjoy"] }
        ],
        daring: [
          { q: 'The Caga Tió, ___ is a Catalan tradition, is popular with children.', o: ['which', 'that', 'who', 'what'] },
          { q: 'Sweets ___ to children on Christmas Day.', o: ['are given', 'give', 'are giving', 'is given'] },
          { q: '___ Diwali is a Hindu festival, people of other faiths enjoy it too.', o: ['Although', 'However', 'Unlike', 'Despite'] },
          { q: 'We look forward to ___ you at the fair.', o: ['seeing', 'see', 'seen', 'to see'] },
          { q: 'Abraham Lincoln, ___ was president in 1863, made Thanksgiving official.', o: ['who', 'which', 'that', 'whose'] },
          { q: 'Advent calendars are popular. ___, some people think they are too commercial.', o: ['On the other hand', 'Although', 'Whereas', 'Because'] },
          { q: 'Diwali, ___ is known as the festival of lights, takes place in autumn.', o: ['which', 'that', 'what', 'who'] },
          { q: 'Chestnuts ___ ___ (roast) in the streets in autumn. (passive)', a: ['are roasted'] },
          { q: 'People ___ ___ ___ (not / use to) buy Advent calendars with toys.', a: ['didn’t use to', 'did not use to', "didn't use to"] },
          { q: 'I would be grateful if you ___ (can) reply soon.', a: ['could'] },
          { q: 'Hogmanay is the night ___ people go first-footing.', a: ['when'] }
        ] } },

    { id: 'write', type: 'marked', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: '43. Escriptura: un correu formal', en: '43. Writing: a formal email' }, max: 30, criterion: '5.1 (formal email)', levels: L51, levelPts: L30,
      intro: { ca: 'Escriu sense apunts, com a l’examen.', en: 'Write without notes, as in the exam.' },
      source: 'The community centre in the student’s town is preparing an International New Year evening for families on Friday 8 January. The class wants to run an activity about a New Year tradition from another country. The email is to Mr Jordi Serra, the director of the community centre.', sourceLabel: 'Situation',
      task: { beginners: 'El centre cívic del teu poble prepara una vetllada internacional de Cap d’Any per a famílies el divendres 8 de gener. Completa la plantilla del correu (40–60 paraules) a Mr Jordi Serra, el director, per proposar una activitat sobre una tradició de Cap d’Any d’un altre país: per què escrius, quina tradició, dues coses que hi haurà (There will be…) i una petició (Could we…?).\nBanc de paraules: New Year · Scotland · Japan · a song · a dance · special food · decorations · music · a table · the hall',
        insecure: 'El centre cívic del teu poble prepara una vetllada internacional de Cap d’Any per a famílies el divendres 8 de gener. Escriu un correu formal (60–80 paraules) a Mr Jordi Serra, el director, per proposar una activitat sobre una tradició de Cap d’Any d’un altre país. Completa la plantilla: per què escrius, quina tradició i quina activitat, dues coses que hi haurà (There will be… / We are going to…) i una petició (Could you…?).\nParaules útils: activity · tradition · New Year · decorations · special food · music · a table · the hall',
        safe: 'The community centre in your town is preparing an International New Year evening for families on Friday 8 January. Write a formal email (100–130 words) to Mr Jordi Serra, the director, proposing an activity about a New Year tradition from another country. Write it in paragraphs: why you are writing, your plan (which tradition, what families will do, using future forms), one request, and a formal closing. Use at least one relative clause (who / which / where).',
        daring: 'The community centre in your town is preparing an International New Year evening for families on Friday 8 January. Write a formal email (140–180 words) to Mr Jordi Serra, the director, proposing an activity about a New Year tradition from another country. Write it in paragraphs: why you are writing, your plan (which tradition, what families will do and why it matters), one polite request, and a formal closing. Mr Serra is worried that the hall is small and the evening could be too crowded: answer this concern in your email.' },
      template: { beginners: 'Dear Mr Serra,\nI am writing to propose an activity about …\nWe would like to …\nThere will be … and …\nCould we use …?\nI look forward to hearing from you.\nYours sincerely,\n…', insecure: 'Dear Mr Serra,\nI am writing to …\nWe would like to …\nThere will be … We are going to …\nCould you …?\nI look forward to hearing from you.\nYours sincerely,\n…', safe: 'Dear Mr Serra,\n\nI am writing to propose…', daring: 'Dear Mr Serra,\n\nI am writing to propose…' },
      min: { beginners: 40, insecure: 60, safe: 100, daring: 140 } },

    { id: 'score', type: 'summary', tab: { ca: 'La meva nota', en: 'My score' }, title: { ca: 'La meva nota', en: 'My score' },
      intro: { ca: 'Primer intent de cada secció i les notes de ChatGPT que has apuntat.', en: 'Your first try in each section and the ChatGPT marks you noted.' } }
  ]
};
})();
