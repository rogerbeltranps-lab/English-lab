/* 4 ESO · LS2 · Sample exam 1 (practice, called First exam 19–21 Nov 2026, not graded; the page is still sample-exam.html, key ls2SampleExam4ESO). Roger, 19 Nov 2026: a sample
   exam "with what we've done so far" (only up to the step of the group that has done less) and "tailored … so that they get good marks". So:
   - content = LP1 Getting started (autumn words, feelings; the LP1 game: get + comparative, adjective + preposition + -ing), LP2 Celebrations
     around the world (celebrations, Present Simple for customs, on / in / at, It is celebrated / It takes place) and LP3 vocabulary + Past
     Simple / used to (4 ESO A has not done the rest of LP3 yet). Nothing from LP4–LP6 (relatives, contrast, future forms, formal email).
   - format and points = the 2 ESO first web exam: listening 20, reading 20, vocabulary 35, grammar 15, writing 10 (describe a celebration, LP2).
   - items lean on what the class games and the activities show students do best (Starter/Base mostly multiple choice; the weakest
     points, such as the passive, "dates back to", prepositions after verbs, typed used to, only as easy choices or not at all).
   Multiple choice has four options (the first is the right one; the engine shuffles). The text gets a table of mistakes from the
   student's ChatGPT, no mark (Roger, 20 Nov 2026). */
(function () {
const L10 = [3, 5, 8, 10];   // the 5.1 levels scaled to 10 points (NA 8 · AS 15 · AN 23 · AE 30 of 30)
const ROW = (a, b) => '<tr><td>' + a + '</td><td style="text-align:right">' + b + '</td></tr>';
const TABLE = {
  ca: '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + ROW('1 Listening: 5 preguntes + listening chart, 5 preguntes (2 punts cada una)', 20) + ROW('2 Reading: 5 preguntes + reading log, 5 preguntes (2 punts cada una)', 20) +
    ROW('3 Vocabulary: 14 preguntes (2,5 punts cada una)', 35) + ROW('4 Grammar: 10 preguntes (1,5 punts cada una)', 15) + ROW('5 Writing: descriu una celebració', 10) + ROW('<strong>Total</strong>', '<strong>100</strong>') + '</tbody></table>',
  en: '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + ROW('1 Listening: 5 questions + listening chart, 5 questions (2 points each)', 20) + ROW('2 Reading: 5 questions + reading log, 5 questions (2 points each)', 20) +
    ROW('3 Vocabulary: 14 questions (2.5 points each)', 35) + ROW('4 Grammar: 10 questions (1.5 points each)', 15) + ROW('5 Writing: describe a celebration', 10) + ROW('<strong>Total</strong>', '<strong>100</strong>') + '</tbody></table>' };
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
const L51 = ['Unfinished or not understandable; no clear parts (what, when, customs), even with the frame.',
  'What, when and customs are there, close to the frame or model; Present Simple and on / in / at mostly correct; errors that do not block meaning.',
  'Clear parts (what, when, customs, food or symbol, feelings), Present Simple for customs, on / in / at and It is celebrated used correctly; adapts the model.',
  'Clear, well-linked and personal beyond the model (varied adjectives, used to, a passive; Daring: what it means to people), few errors.'];
const AUDIO = { audio: 'audio/sample-exam-new-year.mp3', title: 'Two New Years: Callum and Yuki', script: SCRIPT };

window.LP = {
  key: 'ls2SampleExam4ESO', n: 'E', title: 'Sample exam 1',
  panels: [
    { id: 'how', type: 'info', tab: { ca: 'Com és', en: 'How it works' }, title: { ca: 'Com és el primer examen', en: 'How the first exam works' },
      html: { ca: '<p>Aquesta pràctica té <strong>el mateix format i els mateixos punts que el primer examen</strong>. Només surt el que hem fet a classe: <strong>LP1 Getting started</strong>, <strong>LP2 Celebrations around the world</strong> i el vocabulari i la gramàtica (Past Simple / used to) de <strong>LP3 Where traditions come from</strong>. 55 minuts, sense apunts.</p>' + TABLE.ca +
        '<p>Les preguntes es corregeixen soles: el <strong>primer intent</strong> és la teva nota, com a l’examen. El text no té nota en aquesta pràctica: el botó obre ChatGPT, que et fa una taula de les errades (la correcció i per què) i et torna el text corregit. Al final, a <em>La meva nota</em>, veuràs el total.</p>',
        en: '<p>This practice has <strong>the same format and the same points as the first exam</strong>. Only what we have done in class: <strong>LP1 Getting started</strong>, <strong>LP2 Celebrations around the world</strong> and the vocabulary and grammar (Past Simple / used to) of <strong>LP3 Where traditions come from</strong>. 55 minutes, no notes.</p>' + TABLE.en +
        '<p>The questions are marked automatically: your <strong>first try</strong> is your score, as in the exam. The text has no mark in this practice: the button opens ChatGPT, which makes a table of your mistakes (the correction and why) and gives you your text, corrected. At the end, <em>My score</em> shows your total.</p>' } },

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
      intro: { ca: 'Torna a escoltar si cal. Tria la nota correcta sobre cada celebració: quan és, què fa la gent i què mengen.', en: 'Listen again if you need to. Choose the correct note about each celebration: when it is, what people do and what they eat.' },
      media: AUDIO,
      items: {
        beginners: [
          { q: 'Callum · when is Hogmanay?', o: ['on New Year’s Eve', 'on Christmas Day', 'in summer', 'on 6 January'] },
          { q: 'Callum · what do people do at midnight?', o: ['They hold hands and sing an old song.', 'They clean the house.', 'They eat long noodles.', 'They open presents.'] },
          { q: 'Callum · what is the weather like?', o: ['It’s freezing.', 'It’s hot.', 'It’s mild.', 'It’s foggy.'] },
          { q: 'Yuki · what do they eat on the evening of 31 December?', o: ['long noodles', 'cake', 'chestnuts', 'twelve grapes'] },
          { q: 'Yuki · what do children get?', o: ['money in small envelopes', 'chocolate', 'a costume', 'a cake'] }
        ],
        insecure: [
          { q: 'Callum · where is the big party?', o: ['in the city centre', 'at his gran’s house', 'at a temple', 'at school'] },
          { q: 'Callum · what do people do after midnight?', o: ['They visit their neighbours.', 'They go to bed.', 'They clean the house.', 'They watch TV.'] },
          { q: 'Callum · what does he wear?', o: ['about three jumpers', 'a costume', 'a T-shirt', 'a mask'] },
          { q: 'Yuki · why do they clean the house on 31 December?', o: ['to start the year fresh', 'because guests come', 'because it’s very dirty', 'for the temple'] },
          { q: 'Yuki · what do they do on 1 January?', o: ['They eat special food and visit a shrine.', 'They go to a street party.', 'They sing “Auld Lang Syne”.', 'They watch fireworks over the castle.'] }
        ],
        safe: [
          { q: 'Which note about Hogmanay is correct?', o: ['When: 31 December · Customs: street party, fireworks, an old song, first-footing · Weather: freezing', 'When: 1 January · Customs: cleaning the house · Weather: mild', 'When: 31 December · Customs: long noodles · Weather: freezing', 'When: 24 December · Customs: presents · Weather: rainy'] },
          { q: 'Which note about Shōgatsu is correct?', o: ['When: 31 December–1 January · Customs: cleaning, long noodles, temple bells, a shrine, cards · Feeling: quiet', 'When: 31 December · Customs: a street party with fireworks · Feeling: noisy', 'When: 1 January · Customs: first-footing · Feeling: quiet', 'When: summer · Customs: noodles · Feeling: exciting'] },
          { q: 'What do visitors bring when they go first-footing?', o: ['a small present, like shortbread or coal', 'long noodles', 'money in envelopes', 'flowers'] },
          { q: 'Why do people in Japan eat long noodles?', o: ['They mean a long life.', 'They are cheap.', 'Children love them.', 'They are easy to cook.'] },
          { q: 'What happened to Callum last year?', o: ['He was his neighbours’ first visitor and got a big slice of cake.', 'He sang all the words of the song.', 'He visited Japan.', 'He got money in an envelope.'] }
        ],
        daring: [
          { q: 'Which note about Hogmanay is the most accurate?', o: ['31 Dec · street party, concerts, fireworks over the castle, “Auld Lang Syne”, first-footing with a small present · freezing · bigger than Christmas', 'Bigger than Christmas · quiet, family only · noodles and temple bells', '1 Jan · first-footing only · mild weather', '31 Dec · fireworks · warm weather · smaller than Christmas'] },
          { q: 'Which note about Shōgatsu is the most accurate?', o: ['31 Dec–1 Jan · clean the house, long noodles, 108 bells, special food, a shrine, envelopes for children, cards · quiet, with the family', 'A noisy street party with fireworks', '1 Jan only · first-footing · cake', 'A summer festival · noodles · a temple'] },
          { q: 'Why does Callum’s gran want a friendly neighbour to come first?', o: ['She believes the first visitor brings luck for the year.', 'She wants cake.', 'She doesn’t like strangers at night.', 'It’s a rule in Scotland.'] },
          { q: 'Why do so many people in Japan travel at New Year?', o: ['They go home to their parents’ houses.', 'They go on holiday abroad.', 'They go to Edinburgh.', 'They visit their offices.'] },
          { q: 'Which custom happens at the same moment in both places?', o: ['Something special happens at midnight: a song in Scotland, temple bells in Japan.', 'Both families clean the house.', 'Both eat long noodles.', 'Both visit a shrine.'] }
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

    { id: 'vocab', type: 'quiz', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Vocabulari', en: 'Vocabulary' }, pts: [2.5, 2.5], start: 21,
      intro: { ca: 'Tria l’opció correcta o escriu la paraula que falta (2,5 punts cada una).', en: 'Choose the right option or write the missing word (2.5 points each).' },
      items: {
        beginners: [
          { q: 'I can’t see the end of the street. It’s ___.', o: ['foggy', 'sunny', 'windy', 'hot'] },
          { q: 'At the Castanyada we eat roasted ___.', o: ['chestnuts', 'pumpkins', 'grapes', 'candles'] },
          { q: 'At Halloween people ___ pumpkins to make scary faces.', o: ['carve', 'cook', 'light', 'wear'] },
          { q: 'In autumn the leaves ___ colour.', o: ['change', 'make', 'do', 'take'] },
          { q: 'At Carnival, children dress ___ as pirates.', o: ['up', 'on', 'in', 'out'] },
          { q: 'On 25 December the whole family eats ___.', o: ['together', 'alone', 'outside', 'early'] },
          { q: 'At the end of the summer, farmers collect the food: it’s the ___.', o: ['harvest', 'parade', 'fireworks', 'costume'] },
          { q: 'In the USA, autumn is called ___.', o: ['fall', 'spring', 'season', 'harvest'] },
          { q: 'At Christmas we have a big family ___.', o: ['get-together', 'parade', 'harvest', 'firework'] },
          { q: 'I feel ___ the night before a big party: I love parties!', o: ['excited', 'scared', 'bored', 'cold'] },
          { q: 'At night there are f________ in the sky: boom! (focs artificials)', a: ['fireworks'] },
          { q: 'On Sunday we v____ our grandparents. (visitem)', a: ['visit'] },
          { q: 'It isn’t hot or cold. It’s m___. (suau)', a: ['mild'] },
          { q: 'At Christmas we d_______ the house with lights. (decorem)', a: ['decorate'] }
        ],
        insecure: [
          { q: 'It’s ___ outside: wear a jumper.', o: ['chilly', 'hot', 'sunny', 'mild'] },
          { q: 'At the end of October the clocks go ___ one hour.', o: ['back', 'up', 'down', 'out'] },
          { q: 'In the USA, autumn is called ___.', o: ['fall', 'spring', 'season', 'harvest'] },
          { q: 'Children ___ up as witches and ghosts.', o: ['dress', 'wear', 'put', 'make'] },
          { q: 'At Diwali, people ___ small oil lamps.', o: ['light', 'carve', 'roast', 'wear'] },
          { q: 'At Christmas we have a big family ___.', o: ['get-together', 'parade', 'harvest', 'firework'] },
          { q: 'At the end of the summer, farmers collect the food: it’s the ___.', o: ['harvest', 'parade', 'fireworks', 'costume'] },
          { q: 'I can’t see the road. It’s very ___.', o: ['foggy', 'mild', 'sunny', 'cosy'] },
          { q: 'At Halloween people ___ pumpkins to make scary faces.', o: ['carve', 'cook', 'light', 'wear'] },
          { q: 'On 25 December the whole family eats ___.', o: ['together', 'alone', 'outside', 'early'] },
          { q: 'In autumn the days get ___. (més curts)', a: ['shorter'] },
          { q: 'People walk through the streets in a big p_____. (desfilada)', a: ['parade'] },
          { q: 'We ___ our relatives in Girona every summer. (visitem)', a: ['visit'] },
          { q: 'At the Castanyada we roast ___. (castanyes)', a: ['chestnuts'] }
        ],
        safe: [
          { q: 'There was ___ on the cars this morning, so we scraped the windows.', o: ['frost', 'fog', 'harvest', 'rain'] },
          { q: 'Chestnuts and mushrooms are ___ food: they grow at this time of year.', o: ['seasonal', 'secular', 'crowded', 'local'] },
          { q: 'On New Year’s Eve, families ___ for a big dinner.', o: ['get together', 'take part', 'pass down', 'look forward'] },
          { q: 'Christmas is a ___ holiday for some families and a secular one for others.', o: ['religious', 'crowded', 'seasonal', 'colourful'] },
          { q: 'In 1621 the Pilgrims had a big harvest ___ that lasted three days.', o: ['feast', 'bonfire', 'parade', 'turnip'] },
          { q: 'Which word doesn’t belong? foggy · chilly · mild · harvest', o: ['harvest', 'foggy', 'chilly', 'mild'] },
          { q: 'At midnight we eat twelve grapes and ___ a wish.', o: ['make', 'do', 'take', 'have'] },
          { q: 'In the USA, autumn is called ___.', o: ['fall', 'spring', 'harvest', 'season'] },
          { q: 'It isn’t hot and it isn’t cold. It’s ___. (m...)', a: ['mild'] },
          { q: 'The clocks went back, so now it gets ___ early. (d...)', a: ['dark'] },
          { q: 'Families ___ gifts at Diwali. (ex...)', a: ['exchange'] },
          { q: 'At Halloween people ___ pumpkins to make scary faces. (c...)', a: ['carve'] },
          { q: 'Children ___ up as witches and ghosts at Halloween. (d...)', a: ['dress'] },
          { q: 'In October the leaves ___ colour. (ch...)', a: ['change'] }
        ],
        daring: [
          { q: 'It’s ___ outside: wear a jumper and a scarf.', o: ['chilly', 'cosy', 'mild', 'seasonal'] },
          { q: 'Celebrations give people a sense of ___ to a community.', o: ['belonging', 'heritage', 'ritual', 'gratitude'] },
          { q: 'Many families ___ their ancestors on All Saints’ Day.', o: ['honour', 'mark', 'pass', 'wish'] },
          { q: 'Some people think Christmas is too ___: it’s all about buying things.', o: ['commercialised', 'inclusive', 'ancient', 'sacred'] },
          { q: 'Schools help to keep the tradition ___.', o: ['alive', 'out', 'back', 'down'] },
          { q: 'Children dress up and go trick or ___.', o: ['treating', 'treat', 'treats', 'to treat'] },
          { q: 'The recipe for panellets is passed ___ from grandparents to grandchildren.', o: ['down', 'on', 'up', 'out'] },
          { q: 'There was ___ on the cars this morning, so we scraped the windows.', o: ['frost', 'fog', 'harvest', 'mist'] },
          { q: 'In October the leaves ___ colour. (ch...)', a: ['change'] },
          { q: 'At the Castanyada we ___ chestnuts in a hot pan. (r...)', a: ['roast'] },
          { q: 'Our living room is warm and comfortable on a cold night. It’s very ___. (c...)', a: ['cosy', 'cozy'] },
          { q: 'On Sunday we ___ a big family get-together. (h...)', a: ['have'] },
          { q: 'Chestnuts and mushrooms are ___ food: they grow at this time of year. (s...)', a: ['seasonal'] },
          { q: 'The clocks go ___ one hour at the end of October.', a: ['back'] }
        ] } },

    { id: 'grammar', type: 'quiz', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica', en: 'Grammar' }, pts: [1.5, 1.5], start: 35,
      intro: { ca: 'Tria l’opció correcta o escriu la forma que falta (1,5 punts cada una). Pots fer servir contraccions.', en: 'Choose the right option or write the missing words (1.5 points each). Contractions are accepted.' },
      items: {
        beginners: [
          { q: 'My grandmother ___ a special meal every year.', o: ['cooks', 'cook', 'cooking', 'is cook'] },
          { q: 'Christmas is ___ 25 December.', o: ['on', 'in', 'at', 'to'] },
          { q: 'We watch the fireworks ___ night.', o: ['at', 'on', 'in', 'to'] },
          { q: '___ your family decorate the house? — Yes, it does.', o: ['Does', 'Do', 'Is', 'Are'] },
          { q: 'In autumn the days get ___.', o: ['shorter', 'short', 'more short', 'shortest'] },
          { q: 'Yesterday my mum ___ panellets at the bakery.', o: ['bought', 'buyed', 'buy', 'buys'] },
          { q: 'Children ___ (dress) up at Halloween.', a: ['dress'] },
          { q: 'Hanukkah ___ (last) eight nights.', a: ['lasts'] },
          { q: 'Lunar New Year ___ celebrated in January or February.', a: ['is'] },
          { q: 'Did you ___ (go) trick or treating last Halloween?', a: ['go'] }
        ],
        insecure: [
          { q: 'Diwali takes place ___ autumn.', o: ['in', 'on', 'at', 'to'] },
          { q: 'The parade starts ___ ten o’clock.', o: ['at', 'on', 'in', 'to'] },
          { q: '___ Diwali last five days?', o: ['Does', 'Do', 'Is', 'Are'] },
          { q: 'Some children are scared of ___ past the pumpkins.', o: ['walking', 'walk', 'to walk', 'walked'] },
          { q: 'When I was little, I ___ believe in the Three Kings. Now I don’t!', o: ['used to', 'use to', 'was', 'did'] },
          { q: 'It’s November: every morning it gets ___.', o: ['colder', 'more cold', 'coldest', 'cold'] },
          { q: 'My grandmother ___ (cook) a special meal every year.', a: ['cooks'] },
          { q: 'We ___ (not / go) to school on 25 December.', a: ["don't go", 'do not go'] },
          { q: 'Lunar New Year ___ place in late January or February.', a: ['takes'] },
          { q: 'My mum ___ (buy) panellets at the bakery yesterday.', a: ['bought'] }
        ],
        safe: [
          { q: 'Look outside! It ___ dark already.', o: ['is getting', 'gets', 'get', 'getting'] },
          { q: 'I’m proud ___ making panellets with my grandma.', o: ['of', 'for', 'about', 'at'] },
          { q: 'Lunar New Year ___ celebrated in late January or February.', o: ['is', 'are', 'does', 'has'] },
          { q: 'Thirty years ago, children ___ go trick or treating in Catalonia.', o: ['didn’t use to', 'don’t use to', 'didn’t used to', 'weren’t use to'] },
          { q: 'People light candles ___ night.', o: ['at', 'in', 'on', 'by'] },
          { q: '___ your town have a parade at Carnival? — Yes, it does.', o: ['Does', 'Do', 'Is', 'Has'] },
          { q: 'Families ___ (exchange) gifts at Diwali.', a: ['exchange'] },
          { q: 'Hanukkah ___ (last) eight nights.', a: ['lasts'] },
          { q: 'We ___ (never / work) on 1 January.', a: ['never work'] },
          { q: 'Did you ___ (go) to the Castanyada party last year?', a: ['go'] }
        ],
        daring: [
          { q: '___ Diwali last five days? — Yes, it does.', o: ['Does', 'Do', 'Is', 'Has'] },
          { q: 'Our town gets ___ at Christmas: lots of people come to the market.', o: ['busier', 'more busy', 'busiest', 'busy'] },
          { q: 'Which sentence is correct?', o: ['The Castanyada is held on 31 October.', 'The Castanyada is held in 31 October.', 'The Castanyada holds on 31 October.', 'The Castanyada is hold on 31 October.'] },
          { q: 'People exchange gifts. → Gifts ___.', o: ['are exchanged', 'are exchange', 'is exchanged', 'exchanged'] },
          { q: 'Look! The leaves ___ from the trees.', o: ['are falling', 'fall', 'falls', 'is falling'] },
          { q: 'My family ___ Halloween, but we love the Castanyada.', o: ['doesn’t celebrate', 'don’t celebrate', 'isn’t celebrating', 'doesn’t celebrates'] },
          { q: 'Diwali ___ (take) place in October or November.', a: ['takes'] },
          { q: 'Josh is grateful for ___ (have) friends in Catalonia.', a: ['having'] },
          { q: 'When my grandparents were young, they ___ ___ ___ (live) in a small village.', a: ['used to live'] },
          { q: 'My mum ___ (buy) panellets at the bakery yesterday.', a: ['bought'] }
        ] } },

    { id: 'write', type: 'marked', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: '45. Escriptura: descriu una celebració', en: '45. Writing: describe a celebration' }, max: 10, criterion: '5.1 (describe a celebration)', levels: L51, levelPts: L10,
      intro: { ca: 'Escriu sense apunts, com a l’examen.', en: 'Write without notes, as in the exam.' },
      source: 'The student describes a celebration for a visitor who doesn’t know it (as in LP2): what it is, when it is (It is celebrated on / in…), customs (Present Simple), a food or symbol, and how they feel and why.', sourceLabel: 'Situation',
      task: { beginners: 'Descriu una celebració (35–50 paraules) per a un visitant amb la pauta: què és, quan és (<em>It is celebrated on / in…</em>), dos costums (<em>People… / Children…</em>), un menjar i com et sents.\nBanc de paraules: celebrate · decorate · dress up · give presents · eat together · fireworks · lights · special meal · happy · excited',
        insecure: 'Descriu una celebració (50–70 paraules) per a algú que no la coneix: què és, quan és (<em>It is celebrated on / in…</em>), tres costums (<em>People… / Children… / Families…</em>), un menjar o símbol i com et sents i per què.',
        safe: 'Describe a celebration for a visitor who doesn’t know it (80–110 words): what it is, when it is (It is celebrated / It takes place…), three customs, one food or symbol, two adjectives (traditional, family-friendly, colourful…) and one thing people used to do in the past.',
        daring: 'Describe a celebration for a visitor who doesn’t know it (110–140 words): what it is, when, customs, food or symbols, what it means to people (belonging, heritage, honour…), one thing people used to do in the past and at least one Present Simple passive (… is eaten, … are decorated).' },
      template: { beginners: '… is celebrated on / in …\nPeople …\nChildren …\nWe eat …\nI feel … because …', insecure: '… is celebrated on / in …\nPeople … Children … Families …\nWe eat …\nI feel … because …', safe: '… is celebrated…', daring: '… is celebrated…' },
      min: { beginners: 35, insecure: 50, safe: 80, daring: 110 } },

    { id: 'score', type: 'summary', tab: { ca: 'La meva nota', en: 'My score' }, title: { ca: 'La meva nota', en: 'My score' },
      intro: { ca: 'Primer intent de cada secció. L’escriptura no té nota: en tens la correcció.', en: 'Your first try in each section. The writing has no mark: you get its correction.' } }
  ]
};
})();
