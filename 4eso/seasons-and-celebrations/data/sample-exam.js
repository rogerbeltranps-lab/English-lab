/* LS2 · Sample exam (practice, not graded): the same format and points as the real exam (Google Forms, approved by Roger on 25 Oct 2026),
   so students know the points of every section. Auto-marked sections show points (first try = the exam score); the chart, the log and the
   email get feedback and a guide mark from ChatGPT with the criterion's levels (ChatGPT can make mistakes; in the exam the teacher marks them).
   Each route has its own list of items (same number per route). Out of 100: listening 10 + chart 10, reading 10 + log 10,
   vocabulary 15, grammar 15, writing 30. Reading texts approved on 24 Oct; the rest awaits Roger's review. */
(function () {
const L10 = [3, 5, 8, 10], L30 = [8, 15, 23, 30];
const SCRIPT = [
  ['Callum', '[cheerful] Hi, I’m Callum, from Edinburgh in Scotland. In Scotland, New Year’s Eve is called Hogmanay, and for us it’s bigger than Christmas! There’s a huge street party in the city centre, with concerts and fireworks at midnight.'],
  ['Callum', 'Then everyone holds hands and sings an old song, “Auld Lang Syne”. [laughs] Nobody knows all the words! After midnight, we go “first-footing”: you visit your neighbours and you’re the first person to walk into their house in the new year.'],
  ['Callum', 'You bring a small present, like shortbread. My gran says the first visitor brings luck for the whole year. What I love is that the whole street feels like one big family.'],
  ['Yuki', '[calm] Hello, I’m Yuki, and I’m from Osaka in Japan. New Year, or Shōgatsu, is the most important holiday of the year for my family. [thoughtful] It’s quite quiet, not like a party.'],
  ['Yuki', 'On the thirty-first of December, we clean the whole house, so we can start the year fresh. At midnight, temple bells ring one hundred and eight times. On the first of January, we eat special food that my mother and grandmother cook for days, and we visit a shrine to pray for a good year. Children get money in small envelopes.'],
  ['Yuki', '[softly] For me, New Year is about starting again. You leave the problems of the old year behind, and you thank your family for everything.']
];
const TEXTS = {
  insecure: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log (a piece of a tree) with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song. Then the log “gives” them sweets and small presents.</p><p>In the UK and other countries, children have an Advent calendar. It has 24 small doors. Children open one door every day from 1 December. Behind each door there is a picture or a piece of chocolate.</p>',
  safe: '<p>In Catalonia, many families have a Caga Tió at Christmas. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks and sing a song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many have chocolate or small toys.</p>',
  daring: '<p>In Catalonia, many families have a Caga Tió at Christmas, a tradition which is thought to date back to old winter celebrations in the countryside. It is a small log with a face, a red hat and a blanket. From 8 December, children “feed” it every night and keep it warm. On Christmas Eve or Christmas Day, they hit it with sticks while they sing a traditional song, and the log “gives” them sweets and small presents.</p><p>In the UK and many other countries, children have an Advent calendar, which counts down the days until Christmas. It has 24 small doors, and children open one every day from 1 December. Behind each door there is a picture or a piece of chocolate. Advent calendars used to have only pictures, but today many contain chocolate, small toys or even beauty products for adults. Some people think this shows how commercialised Christmas has become, while others say it simply shows that traditions evolve.</p>'
};
const scriptText = SCRIPT.map(l => l[0] + ': ' + l[1].replace(/\[[^\]]+\]\s*/g, '')).join('\n');
const L41 = ['The log is unfinished or mostly wrong: facts missing for one text, whole sentences copied, no word inferred.',
  'Both texts logged with what, when, where and two customs, close to the text and often copied; the word’s meaning partly right.',
  'Both texts logged accurately in short notes of their own, main customs chosen over minor details; the word inferred correctly from the context.',
  'Accurate, concise log in their own words; adds an idea that needs inference (why a custom matters) and explains how the context showed the word’s meaning.'];
const L22 = ['Chart missing, or it lists only facts (dates, food) and no values.',
  'Names one thing each speaker values (Insecure: from the list) and copies one word or phrase that shows it.',
  'Explains in their own words what each speaker values, with a phrase from the recording and a note on the tone.',
  'Explains the values with precise evidence from words and tone, and compares the two speakers: what they share and how they differ.'];
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
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 preguntes (2 punts cada una) + listening chart (10)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 preguntes (2 punts cada una) + reading log (10)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: un correu formal</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>Les preguntes es corregeixen soles: el <strong>primer intent</strong> és la teva nota, com a l’examen. El quadre, el log i el correu els corregeix <strong>ChatGPT</strong> amb els criteris de l’examen i et dona una nota orientativa. Al final, a <em>La meva nota</em>, veuràs el total.</p><p class="warm-note">⚠️ ChatGPT es pot equivocar: la seva nota només és orientativa. A l’examen real, el quadre, el log i el correu els corregeix el professorat.</p>',
        en: '<p>This sample exam has <strong>the same format and the same points as the real exam</strong> (which you will do in a Google Form). 55 minutes, no notes.</p>' +
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 questions (2 points each) + listening chart (10)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 questions (2 points each) + reading log (10)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: a formal email</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>Questions are marked automatically: your <strong>first try</strong> is your score, as in the exam. The chart, the log and the email are marked by <strong>ChatGPT</strong> with the exam criteria, which gives you a guide mark. At the end, <em>My score</em> shows your total.</p><p class="warm-note">⚠️ ChatGPT can make mistakes: its mark is only a guide. In the real exam, your teacher marks the chart, the log and the email.</p>' } },

    { id: 'listen', type: 'quiz', tab: 'Listening', title: 'Listening: Two New Years', pts: [2, 2], start: 1,
      intro: { ca: 'Escolta dues vegades el Callum i la Yuki, que parlen del seu Cap d’Any, i respon.', en: 'Listen twice to Callum and Yuki talking about their New Year, and answer.' },
      media: AUDIO,
      items: {
        insecure: [
          { q: 'Where is Callum from?', o: ['Edinburgh, in Scotland', 'London, in England', 'Osaka, in Japan'] },
          { q: 'What is Hogmanay?', o: ['New Year’s Eve in Scotland', 'Christmas in Scotland', 'a Scottish song'] },
          { q: 'What do people sing at midnight?', o: ['an old song, “Auld Lang Syne”', 'a Christmas song', 'a pop song'] },
          { q: 'What does Yuki’s family do on 31 December?', o: ['They clean the whole house.', 'They have a street party.', 'They visit the neighbours.'] },
          { q: 'What do children get at New Year in Japan?', o: ['money in small envelopes', 'shortbread', 'new clothes'] }
        ],
        safe: [
          { q: 'How is Hogmanay different from Christmas for Callum?', o: ['It is bigger.', 'It is quieter.', 'It is only for families.'] },
          { q: 'What is “first-footing”?', o: ['being the first visitor in a neighbour’s house in the new year', 'the first dance of the year', 'walking to the city centre at midnight'] },
          { q: 'What does Callum’s gran believe?', o: ['The first visitor brings luck for the year.', 'Shortbread brings bad luck.', 'Nobody should visit after midnight.'] },
          { q: 'Why does Yuki’s family clean the house on 31 December?', o: ['to start the year fresh', 'because guests are coming', 'because the temple asks them'] },
          { q: 'How many times do the temple bells ring?', o: ['108', '12', '100'] }
        ],
        daring: [
          { q: 'Why does Callum laugh when he says “Nobody knows all the words”?', o: ['It’s funny that everyone sings a song they don’t fully know.', 'He doesn’t like the song.', 'He forgot the words himself.'] },
          { q: 'How is Yuki’s New Year different from Callum’s?', o: ['It is quiet, not like a party.', 'It is bigger than Christmas.', 'It takes place in the street.'] },
          { q: 'How does Yuki sound at the end?', o: ['calm and thoughtful', 'excited', 'worried'] },
          { q: 'What does Callum value most?', o: ['feeling that the whole street is one big family', 'the fireworks', 'the presents'] },
          { q: 'What does Yuki mean by “you leave the problems of the old year behind”?', o: ['New Year is a fresh start.', 'Her family moves house every year.', 'Problems are only for adults.'] }
        ] } },

    { id: 'chart', type: 'marked', tab: 'Listening chart', title: 'Listening chart', max: 10, criterion: '2.2 (listening chart)', levels: L22, levelPts: L10,
      intro: { ca: 'Torna a escoltar si cal. Què valora cada persona i com ho saps?', en: 'Listen again if you need to. What does each speaker value, and how do you know?' },
      media: AUDIO, source: scriptText, sourceLabel: 'Transcript of the recording',
      task: { insecure: 'Per a cada persona: (1) què és el més important per a ella? Tria de la llista: A. sentir que tothom és una gran família · B. començar de nou i donar les gràcies a la família · C. els regals · D. la música i els concerts. (2) Copia una paraula o frase en anglès que ho mostri.',
        safe: 'For each speaker, write in your own words what they value most, copy one phrase from the recording that shows it, and add a note on their tone of voice.',
        daring: 'For each speaker, explain what they value most, with evidence from their words and their tone of voice. Then write one or two sentences comparing them: what they share and how they differ.' },
      template: { insecure: 'Callum: lletra ___ · frase: "..."\nYuki: lletra ___ · frase: "..."', safe: 'Callum values… · Phrase: "…" · Tone: …\nYuki values… · Phrase: "…" · Tone: …', daring: 'Callum: values… · Evidence (words + tone): …\nYuki: values… · Evidence (words + tone): …\nComparison: Both… whereas…' },
      min: { insecure: 8, safe: 20, daring: 40 } },

    { id: 'read', type: 'quiz', tab: 'Reading', title: 'Reading: Two winter traditions', pts: [2, 2], start: 6,
      intro: { ca: 'Llegeix el text i respon, sense apunts.', en: 'Read and answer, without notes.' },
      media: { text: TEXTS },
      items: {
        insecure: [
          { q: 'When do children start feeding the Caga Tió?', o: ['on 8 December', 'on 1 December', 'on Christmas Eve'] },
          { q: 'What do children do on Christmas Eve or Christmas Day?', o: ['They hit it with sticks and sing a song.', 'They open 24 doors.', 'They give it presents.'] },
          { q: 'What does the Caga Tió wear?', o: ['a red hat and a blanket', 'a mask', 'a costume'] },
          { q: 'How many doors does an Advent calendar have?', o: ['24', '8', '12'] },
          { q: 'What is behind each door?', o: ['a picture or a piece of chocolate', 'a small log', 'a song'] }
        ],
        safe: [
          { q: 'What do children do every night from 8 December?', o: ['They feed it and keep it warm.', 'They open a door.', 'They hit it with sticks.'] },
          { q: 'What does the log “give” children?', o: ['sweets and small presents', 'only chocolate', 'pictures'] },
          { q: 'What did Advent calendars use to have?', o: ['only pictures', 'only chocolate', 'small toys'] },
          { q: 'When do children open the first door?', o: ['on 1 December', 'on 8 December', 'on 24 December'] },
          { q: 'Which is a similarity between the two traditions?', o: ['Both start in December and give children sweets.', 'Both come from the UK.', 'Both use a log.'] }
        ],
        daring: [
          { q: 'Where does the Caga Tió probably come from?', o: ['old winter celebrations in the countryside', 'the UK', 'Advent calendars'] },
          { q: 'What does an Advent calendar count down?', o: ['the days until Christmas', 'the presents a child gets', 'the hours of Christmas Eve'] },
          { q: 'What is new in some Advent calendars today?', o: ['beauty products for adults', 'pictures', '24 small doors'] },
          { q: 'What do some people think the changes show?', o: ['how commercialised Christmas has become', 'that children don’t like chocolate', 'that traditions never change'] },
          { q: 'Which tradition has changed more over time, according to the text?', o: ['the Advent calendar', 'the Caga Tió', 'both equally'] }
        ] } },

    { id: 'log', type: 'marked', tab: 'Reading log', title: 'Reading log', max: 10, criterion: '4.1 (reading log)', levels: L41, levelPts: L10,
      intro: { ca: 'Pots tornar a mirar el text a la pestanya Reading.', en: 'You can look at the text again in the Reading tab.' },
      source: TEXTS, sourceLabel: 'The two texts the student read',
      task: { insecure: 'Per a cada tradició escriu notes curtes en anglès: What? · When? · Where? · Two customs. Després: què vol dir "blanket"? Quines paraules del text t’hi han ajudat?',
        safe: 'For each tradition, write short notes in your own words: what, when, where and the two main customs. Then explain what "log" means and which words helped you.',
        daring: 'For each tradition, write concise notes in your own words: what, when, where and the two main customs. Add one idea that is not stated directly: why one custom matters to the people who celebrate it. Then explain what "counts down" means and how the context shows it.' },
      template: { insecure: 'Text 1 · What: … · When: … · Where: … · Customs: 1 … 2 …\nText 2 · What: … · When: … · Where: … · Customs: 1 … 2 …\nWord: "blanket" = … (helped: "…")', safe: 'Tradition 1 · What: … · When: … · Where: … · Main customs: 1 … 2 …\nTradition 2 · What: … · When: … · Where: … · Main customs: 1 … 2 …\nWord: "log" = … (context: "…")', daring: 'Tradition 1 · What / When / Where: … · Main customs: …\nTradition 2 · What / When / Where: … · Main customs: …\nWhy it matters: …\nWord: "counts down" = … (context: …)' },
      min: { insecure: 20, safe: 30, daring: 50 } },

    { id: 'vocab', type: 'quiz', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Vocabulari', en: 'Vocabulary' }, pts: [1, 2], start: 11,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la paraula que falta (2 punts).', en: 'Choose the right option (1 point), then write the missing word (2 points).' },
      items: {
        insecure: [
          { q: 'It’s ___ today: take an umbrella.', o: ['rainy', 'sunny', 'mild'] },
          { q: 'At the Castanyada we eat roasted ___.', o: ['chestnuts', 'oranges', 'flowers'] },
          { q: 'At Christmas we ___ the house with lights.', o: ['decorate', 'dance', 'sing'] },
          { q: 'I feel ___ to my family: they help me a lot.', o: ['grateful', 'scared', 'windy'] },
          { q: 'On Christmas Day we have a special ___ with all the family.', o: ['meal', 'mask', 'parade'] },
          { q: 'Dear Mr Serra, We would ___ to organise a party.', o: ['like', 'want', 'love'] },
          { q: 'I’m going to ___ my friends at the festival.', o: ['meet', 'book', 'buy'] },
          { q: 'At Carnival, people wear a c______ and a mask.', a: ['costume'] },
          { q: 'In spring there are lots of f______ in the park.', a: ['flowers'] },
          { q: 'We celebrate New Year o___ a year.', a: ['once'] },
          { q: 'People walk in the street in a big p_____ with music.', a: ['parade'] }
        ],
        safe: [
          { q: 'It’s ___ this morning: I can’t see the end of the street.', o: ['foggy', 'sunny', 'cosy'] },
          { q: 'All the students ___ part in the school parade.', o: ['take', 'make', 'get'] },
          { q: 'At midnight, families ___ gifts.', o: ['exchange', 'pass', 'gather'] },
          { q: 'Holi is a very ___ festival: people throw coloured powder.', o: ['colourful', 'secular', 'chilly'] },
          { q: '___ Halloween, the Castanyada is not about scary costumes.', o: ['Unlike', 'Both', 'Whereas'] },
          { q: 'I look forward ___ hearing from you.', o: ['to', 'for', 'of'] },
          { q: 'We are going to ___ invitations to all the families.', o: ['send', 'set', 'run'] },
          { q: 'The fair will take place in the c________ centre.', a: ['community'] },
          { q: 'Many students t_____ home for the holidays.', a: ['travel'] },
          { q: 'Please l__ us know if the hall is free.', a: ['let'] },
          { q: 'We need to s__ up the tables before 9.00.', a: ['set'] }
        ],
        daring: [
          { q: 'Some old traditions might ___ out if young people lose interest.', o: ['die', 'pass', 'go'] },
          { q: 'Halloween is known ___ costumes and pumpkins.', o: ['for', 'by', 'with'] },
          { q: 'Many customs ___ from old harvest festivals.', o: ['come', 'date', 'depend'] },
          { q: 'We should never take our traditions for ___.', o: ['granted', 'given', 'sure'] },
          { q: 'Young people can help keep a tradition ___.', o: ['alive', 'living', 'life'] },
          { q: 'I would ___ it if you could reply by Friday.', o: ['appreciate', 'ensure', 'propose'] },
          { q: 'Traditions ___ over time: they change and adapt.', o: ['evolve', 'commemorate', 'honour'] },
          { q: 'Lighting candles is an old r_____ in many religions.', a: ['ritual'] },
          { q: 'Every student can contribute ___ the event.', a: ['to'] },
          { q: 'We would appreciate the o__________ to present our project.', a: ['opportunity'] },
          { q: 'We need to c_______ the needs of every family.', a: ['consider'] }
        ] } },

    { id: 'grammar', type: 'quiz', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica', en: 'Grammar' }, pts: [1, 2], start: 22,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la forma que falta (2 punts). Pots fer servir contraccions.', en: 'Choose the right option (1 point), then write the missing words (2 points). Contractions are accepted.' },
      items: {
        insecure: [
          { q: 'People ___ chestnuts at the Castanyada.', o: ['eat', 'eats', 'are eat'] },
          { q: 'My sister ___ like Halloween.', o: ['doesn’t', 'don’t', 'isn’t'] },
          { q: 'Diwali takes place ___ autumn.', o: ['in', 'on', 'at'] },
          { q: 'We watch the fireworks ___ night.', o: ['at', 'in', 'on'] },
          { q: 'Christmas is ___ 25 December.', o: ['on', 'in', 'at'] },
          { q: '“It’s cold in here.” “I ___ close the window.”', o: ['’ll', '’m going', 'am'] },
          { q: 'First, we clean the house. ___, we decorate it.', o: ['Then', 'Because', 'But'] },
          { q: 'We ___ ___ ___ (visit) our grandparents at Christmas. It’s our plan.', a: ['are going to visit', '’re going to visit', "'re going to visit"] },
          { q: 'The Caga Tió ___ (give) children sweets.', a: ['gives'] },
          { q: 'It’s cold outside, ___ the house is cosy.', a: ['but'] },
          { q: '___ you going to come to the fair?', a: ['are'] }
        ],
        safe: [
          { q: 'Advent calendars ___ have only pictures.', o: ['used to', 'use to', 'were'] },
          { q: 'Lincoln ___ Thanksgiving official in 1863.', o: ['made', 'makes', 'has made'] },
          { q: 'Hanukkah is a festival ___ lasts eight days.', o: ['which', 'who', 'where'] },
          { q: '31 October is the day ___ we eat panellets.', o: ['when', 'where', 'which'] },
          { q: 'We ___ the band on Saturday. It’s all arranged.', o: ['are meeting', 'meet', 'will to meet'] },
          { q: 'The bus to the fair ___ at 9.15. (timetable)', o: ['leaves', 'is leaving to', 'will leaves'] },
          { q: '___ it be possible to use the gym?', o: ['Would', 'Could we', 'Do'] },
          { q: 'Children ___ ___ ___ (not / use to) open Advent calendars with toys.', a: ['didn’t use to', 'did not use to', "didn't use to"] },
          { q: 'The first Thanksgiving ___ (take) place in 1621.', a: ['took'] },
          { q: 'The town square is the place ___ the fair takes place.', a: ['where'] },
          { q: 'I’m sure the visitors ___ ___ (enjoy) the stall.', a: ['will enjoy', '’ll enjoy', "'ll enjoy"] }
        ],
        daring: [
          { q: 'The Caga Tió, ___ is a Catalan tradition, is popular with children.', o: ['which', 'that', 'who'] },
          { q: 'Sweets ___ to children on Christmas Day.', o: ['are given', 'give', 'are giving'] },
          { q: '___ Diwali is a Hindu festival, people of other faiths enjoy it too.', o: ['Although', 'However', 'Unlike'] },
          { q: 'We look forward to ___ you at the fair.', o: ['seeing', 'see', 'seen'] },
          { q: 'Abraham Lincoln, ___ was president in 1863, made Thanksgiving official.', o: ['who', 'which', 'that'] },
          { q: 'Advent calendars are popular. ___, some people think they are too commercial.', o: ['On the other hand', 'Although', 'Whereas'] },
          { q: 'Diwali, ___ is known as the festival of lights, takes place in autumn.', o: ['which', 'that', 'what'] },
          { q: 'Chestnuts ___ ___ (roast) in the streets in autumn. (passive)', a: ['are roasted'] },
          { q: 'People ___ ___ ___ (not / use to) buy Advent calendars with toys.', a: ['didn’t use to', 'did not use to', "didn't use to"] },
          { q: 'I would be grateful if you ___ (can) reply soon.', a: ['could'] },
          { q: 'Hogmanay is the night ___ people go first-footing.', a: ['when'] }
        ] } },

    { id: 'write', type: 'marked', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Escriptura: un correu formal', en: 'Writing: a formal email' }, max: 30, criterion: '5.1 (formal email)', levels: L51, levelPts: L30,
      intro: { ca: 'Escriu sense apunts, com a l’examen.', en: 'Write without notes, as in the exam.' },
      source: 'The community centre in the student’s town is preparing an International New Year evening for families on Friday 8 January. The class wants to run an activity about a New Year tradition from another country. The email is to Mr Jordi Serra, the director of the community centre.', sourceLabel: 'Situation',
      task: { insecure: 'El centre cívic del teu poble prepara una vetllada internacional de Cap d’Any per a famílies el divendres 8 de gener. Escriu un correu formal (60–80 paraules) a Mr Jordi Serra, el director, per proposar una activitat sobre una tradició de Cap d’Any d’un altre país. Completa la plantilla: per què escrius, quina tradició i quina activitat, dues coses que hi haurà (There will be… / We are going to…) i una petició (Could you…?).\nParaules útils: activity · tradition · New Year · decorations · special food · music · a table · the hall',
        safe: 'The community centre in your town is preparing an International New Year evening for families on Friday 8 January. Write a formal email (100–130 words) to Mr Jordi Serra, the director, proposing an activity about a New Year tradition from another country. Write it in paragraphs: why you are writing, your plan (which tradition, what families will do, using future forms), one request, and a formal closing. Use at least one relative clause (who / which / where).',
        daring: 'The community centre in your town is preparing an International New Year evening for families on Friday 8 January. Write a formal email (140–180 words) to Mr Jordi Serra, the director, proposing an activity about a New Year tradition from another country. Write it in paragraphs: why you are writing, your plan (which tradition, what families will do and why it matters), one polite request, and a formal closing. Mr Serra is worried that the hall is small and the evening could be too crowded: answer this concern in your email.' },
      template: { insecure: 'Dear Mr Serra,\nI am writing to …\nWe would like to …\nThere will be … We are going to …\nCould you …?\nI look forward to hearing from you.\nYours sincerely,\n…', safe: 'Dear Mr Serra,\n\nI am writing to propose…', daring: 'Dear Mr Serra,\n\nI am writing to propose…' },
      min: { insecure: 60, safe: 100, daring: 140 } },

    { id: 'score', type: 'summary', tab: { ca: 'La meva nota', en: 'My score' }, title: { ca: 'La meva nota', en: 'My score' },
      intro: { ca: 'Primer intent de cada secció i les notes de ChatGPT que has apuntat.', en: 'Your first try in each section and the ChatGPT marks you noted.' } }
  ]
};
})();
