/* 2 ESO · LS2 · Sample exam 1 (practice, called First exam 19–21 Nov 2026, not graded; the page is still sample-exam.html, key ls2SampleExam2ESO). Roger, 19 Nov 2026: "Adapt
   the sample exam (let's label it first exam) with only everything we've done … only up to the step of the group that has done less", and
   "tailor … so that students have an exam easy … more related to what they know best". So:
   - content = LP1 Getting started + LP2 What are they doing? only (what both 2 ESO groups have done; 2 ESO A does the LP2 grammar the same
     day): play / go / do, free-time activities, how often, Present Simple; clothes and kit, weather, events; Present Continuous. Nothing
     from LP3–LP6 (state verbs, temporary "this month", likes + -ing, screen tips and imperatives, sources, so / because).
   - format and points = Friday's web exam (data/exam.js): listening 20, reading 20, vocabulary 35, grammar 15, writing 10 (a short post).
   - items lean on what the class games and the LP1/LP2 activities show students do best (Starter/Base mostly multiple choice; no adverb
     position, no "take part", "tournament", "warm up"); different sentences from the real exam, so nothing is given away.
   Multiple choice has four options (the first is the right one; the engine shuffles). The post gets a table of mistakes from the
   student's ChatGPT, no mark (Roger, 20 Nov 2026). */
(function () {
const L10 = [3, 5, 8, 10];   // the 5.1 levels scaled to 10 points, as in the web exam (NA 8 · AS 15 · AN 23 · AE 30 of 30)
const ROW = (a, b) => '<tr><td>' + a + '</td><td style="text-align:right">' + b + '</td></tr>';
const TABLE = {
  ca: '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + ROW('1 Listening: 5 preguntes + listening chart, 5 preguntes (2 punts cada una)', 20) + ROW('2 Reading: 5 preguntes + reading log, 5 preguntes (2 punts cada una)', 20) +
    ROW('3 Vocabulary: 14 preguntes (2,5 punts cada una)', 35) + ROW('4 Grammar: 10 preguntes (1,5 punts cada una)', 15) + ROW('5 Writing: un post per al blog de la classe', 10) + ROW('<strong>Total</strong>', '<strong>100</strong>') + '</tbody></table>',
  en: '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody>' + ROW('1 Listening: 5 questions + listening chart, 5 questions (2 points each)', 20) + ROW('2 Reading: 5 questions + reading log, 5 questions (2 points each)', 20) +
    ROW('3 Vocabulary: 14 questions (2.5 points each)', 35) + ROW('4 Grammar: 10 questions (1.5 points each)', 15) + ROW('5 Writing: a post for the class blog', 10) + ROW('<strong>Total</strong>', '<strong>100</strong>') + '</tbody></table>' };
const SHADOW_VIDEO = '<video controls preload="none" playsinline poster="video/shadowing-poster.jpg" src="video/shadowing.mp4" style="width:100%;border-radius:14px;margin:8px 0;background:#000"></video>';
const SCRIPT = [
  ['Ellie', '[cheerful] Hi everyone, I’m Ellie and welcome to my vlog! Today I’m at the town theatre, because my dance group is in a competition. It’s Saturday afternoon and it’s raining outside, but in here it’s hot and really noisy. I’m wearing my black costume and white trainers, and I’m very nervous!'],
  ['Ellie', 'Right now the group from Girona is dancing on the stage, and they’re really good. We’re next! I usually practise on Tuesdays and Thursdays at the dance school, and I love it. But this month we’re training every day, because we want to win. [laughs] OK, the music is starting. Wish me luck!'],
  ['Jack', '[energetic] Hey! I’m Jack, and this is my football vlog. It’s Sunday morning and I’m at the sports centre for the school tournament. What’s the weather like? It’s cold and windy, about six degrees, so I’m wearing my tracksuit and a woolly hat.'],
  ['Jack', 'My team is playing right now. Look! My friend Tom has the ball… he’s running… and he scores! One–nil! We usually lose, so this is amazing. I’m not playing today, because my leg hurts. I’m filming the match for our class channel.'],
  ['Jack', 'One tip before I go: I love watching football videos, but don’t watch them in bed. Switch off your phone at night and sleep well. That’s what my coach says! See you next week!']
];
const TEXTS = {
  beginners: '<p><strong>Text A · Post · Carla, Saturday 11:20</strong><br>Hello from the beach! It’s sunny and warm. I’m here with my family. My brother is swimming. My mum is reading. I’m playing volleyball with my cousins. We usually come to this beach in summer. But today is a special day in November! Come and join us.</p><p><strong>Text B · Web page · Skate Fest</strong><br><strong>Sunday 29 November · 16:00 · Skate Park Nord</strong><br>Watch the best young skaters in town! There is a competition, music and free lemonade. Tickets: 3 euros. Children under 8: free. Buy your ticket now!</p><p class="tiny"><strong>Paraules:</strong> beach = platja · cousins = cosins · join us = vine amb nosaltres · skaters = patinadors · free = gratis · ticket = entrada</p>',
  insecure: '<p><strong>Text A · Post · Carla, Saturday 11:20</strong><br>Hello from the beach! It’s sunny and warm. I’m here with my family. My brother is swimming and my mum is reading. I’m playing volleyball with my cousins. We usually come to this beach in summer, but today is a special day in November! Come and join us.</p><p><strong>Text B · Web page · Skate Fest</strong><br><strong>Sunday 29 November · 16:00 · Skate Park Nord</strong><br>Watch the best young skaters in town! There is a competition, music and free lemonade. Tickets: 3 euros. Children under 8: free. Buy your ticket online now: only 150 places!</p>',
  safe: '<p><strong>Text A · Post · Carla, Saturday 11:20</strong><br>Hello from the beach! It’s sunny and warm, 22 degrees in November! I’m here with my family. My brother is swimming, my mum is reading under the umbrella and I’m playing volleyball with my cousins. We usually come to this beach in summer, so today is a special day. Come and join us: we’re here until five!</p><p><strong>Text B · Web page · Skate Fest</strong><br><strong>Sunday 29 November · 16:00 · Skate Park Nord</strong><br>Watch the best young skaters in town! There is a competition, live music and free lemonade for everyone. Tickets: 3 euros (children under 8: free). The money goes to the new skate ramp. Buy your ticket online now: there are only 150 places, and last year they sold out in two days!</p>',
  daring: '<p><strong>Text A · Post · Carla, Saturday 11:20</strong><br>Hello from the beach! It’s sunny and warm, 22 degrees in November, which is crazy! I’m here with my family. My brother is swimming, my mum is reading under the umbrella and I’m playing volleyball with my cousins, and losing, as usual. We usually come to this beach in summer, so today is a special day: a beach day in November. Come and join us, we’re here until five!</p><p><strong>Text B · Web page · Skate Fest</strong><br><strong>Sunday 29 November · 16:00 · Skate Park Nord</strong><br>Watch the best young skaters in town! There is a competition, live music and free lemonade for everyone. Tickets: 3 euros (children under 8: free). All the money goes to the new skate ramp, so you are helping the park. Buy your ticket online now: there are only 150 places, and last year they sold out in two days!</p>'
};
const scriptText = SCRIPT.map(l => l[0] + ': ' + l[1].replace(/\[[^\]]+\]\s*/g, '')).join('\n');
const L51 = ['Unfinished or not understandable; no clear parts, even with the frame.',
  'The parts are there, close to the frame; Present Continuous and Present Simple mostly correct; errors that do not block meaning.',
  'Clear parts (where and who with, weather, what people are doing, clothes, what you usually do and how often), both tenses used correctly.',
  'Clear, well-linked and personal (and, but), varied verbs and time expressions (right now, usually, twice a week), few errors.'];
const AUDIO = { audio: 'audio/sample-exam-two-vlogs.mp3', title: 'Two vlogs: Ellie and Jack', script: SCRIPT };

window.LP = {
  key: 'ls2SampleExam2ESO', n: 'E', title: 'Sample exam 1',
  panels: [
    // Shadowing review (Roger, 31 Oct 2026): the LS's shadowing video, once per LS as revision before the exam. Not a step: nothing is saved or counted.
    { id: 'shadowing', type: 'info', tab: { ca: '🗣 Shadowing', en: '🗣 Shadowing' }, title: { ca: 'Abans de l’examen: shadowing de tota la unitat', en: 'Before the exam: shadowing for the whole unit' },
      html: { ca: '<p>Un repàs de 6 minuts per escoltar i parlar: frases de les escoltes de la unitat. Escolta, repeteix en veu alta i torna-ho a fer sense text. El vídeo t’espera.</p>' + SHADOW_VIDEO,
        en: '<p>A 6-minute review for listening and speaking: sentences from the unit’s recordings. Listen, say them out loud, then do it again with no text. The video waits for you.</p>' + SHADOW_VIDEO } },
    { id: 'how', type: 'info', tab: { ca: 'Com és', en: 'How it works' }, title: { ca: 'Com és el primer examen', en: 'How the first exam works' },
      html: { ca: '<p>Aquesta pràctica té <strong>el mateix format i els mateixos punts que el primer examen</strong> (el faràs al web, en mode examen). Només surt el que hem fet a classe: <strong>LP1 Getting started</strong> i <strong>LP2 What are they doing?</strong> 55 minuts, sense apunts.</p>' + TABLE.ca +
        '<p>Les preguntes es corregeixen soles: el <strong>primer intent</strong> és la teva nota, com a l’examen. El post no té nota en aquesta pràctica: el botó obre ChatGPT, que et fa una taula de les errades (la correcció i per què) i et torna el text corregit. Al final, a <em>La meva nota</em>, veuràs el total.</p>',
        en: '<p>This practice has <strong>the same format and the same points as the first exam</strong> (which you will do on the website, in exam mode). Only what we have done in class: <strong>LP1 Getting started</strong> and <strong>LP2 What are they doing?</strong> 55 minutes, no notes.</p>' + TABLE.en +
        '<p>The questions are marked automatically: your <strong>first try</strong> is your score, as in the exam. The post has no mark in this practice: the button opens ChatGPT, which makes a table of your mistakes (the correction and why) and gives you your text, corrected. At the end, <em>My score</em> shows your total.</p>' } },

    { id: 'listen', type: 'quiz', tab: 'Listening', title: 'Listening: Two vlogs', pts: [2, 2], start: 1,
      intro: { ca: 'Escolta dues vegades l’Ellie i el Jack, que graven el seu vlog, i respon.', en: 'Listen twice to Ellie and Jack recording their vlogs, and answer.' },
      media: AUDIO,
      items: {
        beginners: [
          { q: 'Where is Ellie?', o: ['at the town theatre', 'at the sports centre', 'at the beach', 'at school'] },
          { q: 'What is the weather like outside the theatre?', o: ['It’s raining.', 'It’s sunny.', 'It’s snowing.', 'It’s hot.'] },
          { q: 'What is Ellie wearing?', o: ['a black costume', 'a tracksuit', 'shorts and a cap', 'a helmet'] },
          { q: 'Where is Jack?', o: ['at the sports centre', 'at the town theatre', 'at the beach', 'at home'] },
          { q: 'What is Jack wearing?', o: ['a tracksuit and a woolly hat', 'a black costume', 'shorts and a T-shirt', 'a helmet'] }
        ],
        insecure: [
          { q: 'Where is Ellie?', o: ['at the town theatre', 'at the sports centre', 'at the beach', 'at school'] },
          { q: 'What is the weather like outside the theatre?', o: ['It’s raining.', 'It’s sunny.', 'It’s snowing.', 'It’s windy.'] },
          { q: 'What is Ellie wearing?', o: ['a black costume and white trainers', 'a tracksuit and a woolly hat', 'shorts and a cap', 'a helmet'] },
          { q: 'What day is it in Jack’s vlog?', o: ['Sunday morning', 'Saturday afternoon', 'Friday evening', 'Monday morning'] },
          { q: 'What does Tom do?', o: ['He scores.', 'He falls.', 'He goes home.', 'He films the match.'] }
        ],
        safe: [
          { q: 'Why is Ellie at the town theatre?', o: ['Her dance group is in a competition.', 'She is watching a film.', 'She is filming a match.', 'She has a dance class.'] },
          { q: 'Who is dancing right now?', o: ['the group from Girona', 'Ellie’s group', 'Ellie’s teacher', 'nobody'] },
          { q: 'When does Ellie usually practise?', o: ['on Tuesdays and Thursdays', 'every day', 'on Saturdays', 'on Sunday mornings'] },
          { q: 'What is the temperature at the sports centre?', o: ['about six degrees', 'about sixteen degrees', 'about twenty degrees', 'minus six degrees'] },
          { q: 'Why isn’t Jack playing today?', o: ['His leg hurts.', 'He is late.', 'He doesn’t like football.', 'His team is losing.'] }
        ],
        daring: [
          { q: 'Why is Ellie nervous?', o: ['Her group is dancing next in the competition.', 'She is late for the competition.', 'She doesn’t like dancing.', 'It’s raining outside.'] },
          { q: 'Why does Jack say “this is amazing”?', o: ['His team usually loses, but now they are winning.', 'The weather is amazing.', 'He is playing very well.', 'The sports centre is new.'] },
          { q: 'What is Jack doing instead of playing?', o: ['filming the match for the class channel', 'watching videos in bed', 'warming up', 'talking to the coach'] },
          { q: 'Which sentence from Ellie describes a habit?', o: ['“I usually practise on Tuesdays and Thursdays.”', '“Today I’m at the town theatre.”', '“The group from Girona is dancing.”', '“The music is starting.”'] },
          { q: 'What is the score after Tom’s goal?', o: ['one–nil', 'two–nil', 'one–one', 'two–one'] }
        ] } },

    { id: 'chart', type: 'quiz', tab: 'Listening chart', title: 'Listening chart', pts: [2, 2], start: 6,
      intro: { ca: 'Torna a escoltar si cal. Què està fent cada vlogger, què fa normalment i quins detalls dona (lloc, roba, temps)?', en: 'Listen again if you need to. What is each vlogger doing, what do they usually do, and which details do they give (place, clothes, weather)?' },
      media: AUDIO,
      items: {
        beginners: [
          { q: 'Ellie · now: where is she?', o: ['She’s at a dance competition.', 'She’s at a football match.', 'She’s at the swimming pool.', 'She’s at school.'] },
          { q: 'Ellie · usually: what does she do?', o: ['She practises on Tuesdays and Thursdays.', 'She plays football.', 'She films matches.', 'She swims every day.'] },
          { q: 'Ellie · a detail: what is the weather like?', o: ['It’s raining.', 'It’s sunny.', 'It’s snowing.', 'It’s hot and sunny.'] },
          { q: 'Jack · now: what is he doing?', o: ['He’s filming the match.', 'He’s playing football.', 'He’s dancing.', 'He’s sleeping.'] },
          { q: 'Jack · a detail: what is the weather like?', o: ['It’s cold and windy.', 'It’s hot.', 'It’s raining.', 'It’s sunny and warm.'] }
        ],
        insecure: [
          { q: 'Ellie · now: what is she doing?', o: ['She’s waiting to dance in a competition.', 'She’s dancing on the stage.', 'She’s practising at the dance school.', 'She’s swimming.'] },
          { q: 'Ellie · usually: what does she do?', o: ['She practises on Tuesdays and Thursdays.', 'She trains every day.', 'She plays football.', 'She films matches.'] },
          { q: 'Ellie · a detail: what is the weather like?', o: ['It’s raining.', 'It’s cold and windy.', 'It’s sunny.', 'It’s snowing.'] },
          { q: 'Jack · now: what is he doing?', o: ['He’s filming the match.', 'He’s playing football.', 'He’s dancing.', 'He’s sleeping.'] },
          { q: 'Jack · a detail: what is he wearing?', o: ['a tracksuit and a woolly hat', 'a black costume', 'shorts and a T-shirt', 'a helmet'] }
        ],
        safe: [
          { q: 'Which note about Ellie is correct?', o: ['Now: waiting to dance · Usually: practises Tue and Thu · Details: town theatre, black costume, raining', 'Now: dancing on stage · Usually: trains every day · Details: town theatre, raining', 'Now: waiting to dance · Usually: practises Tue and Thu · Details: sports centre, tracksuit, sunny', 'Now: practising at the dance school · Usually: competitions · Details: hot, white costume'] },
          { q: 'Which note about Jack is correct?', o: ['Now: filming the match · Usually: his team loses · Details: sports centre, cold and windy, tracksuit', 'Now: playing football · Usually: his team wins · Details: sports centre, cold and windy', 'Now: filming the match · Usually: his team loses · Details: town theatre, raining, costume', 'Now: scoring a goal · Usually: films matches · Details: hot, six degrees'] },
          { q: 'What is the weather like outside the theatre, and how is it inside?', o: ['raining outside · hot and noisy inside', 'sunny outside · cold inside', 'raining outside · cold and quiet inside', 'windy outside · hot and quiet inside'] },
          { q: 'Which two details does Jack give about the weather?', o: ['cold and windy, about six degrees', 'hot and noisy', 'raining and warm', 'sunny, about twenty degrees'] },
          { q: 'Which words tell you that Ellie is talking about now?', o: ['“Right now the group from Girona is dancing.”', '“I usually practise on Tuesdays.”', '“I love it.”', '“We want to win.”'] }
        ],
        daring: [
          { q: 'Which note about Ellie is the most accurate?', o: ['Now: waiting, nervous, Girona group on stage · Usually: Tue and Thu at the dance school · Details: theatre, hot inside, raining outside, black costume and white trainers', 'Now: dancing · Usually: every day · Details: theatre, sunny, white costume', 'Now: waiting · Usually: Tue and Thu · Details: sports centre, cold, tracksuit', 'Now: practising · Usually: competitions · Details: theatre, raining, trainers only'] },
          { q: 'Which note about Jack is the most accurate?', o: ['Now: filming for the class channel, not playing (leg hurts) · Usually: his team loses · Details: sports centre, Sunday, cold and windy, 6 °C, tracksuit and woolly hat', 'Now: playing and scoring · Usually: wins · Details: sports centre, hot, tracksuit', 'Now: filming · Usually: plays on Tuesdays · Details: theatre, raining', 'Now: watching videos in bed · Usually: films matches · Details: cold, 16 °C'] },
          { q: 'How do you know Ellie is nervous?', o: ['She says it and she asks for luck before she dances.', 'She is wearing a black costume.', 'She practises on Tuesdays.', 'The theatre is noisy.'] },
          { q: 'What do Ellie and Jack have in common today?', o: ['Both are at an event that is different from their usual routine.', 'Both are playing in a match.', 'Both are at home.', 'Both are dancing.'] },
          { q: 'Which sentence from Jack describes a habit, not now?', o: ['“We usually lose.”', '“My team is playing right now.”', '“He’s running.”', '“I’m filming the match.”'] }
        ]
      } },

    { id: 'read', type: 'quiz', tab: 'Reading', title: 'Reading: A post and a web page', pts: [2, 2], start: 11,
      intro: { ca: 'Llegeix els dos textos i respon, sense apunts.', en: 'Read the two texts and answer, without notes.' },
      media: { text: TEXTS },
      items: {
        beginners: [
          { q: 'Where is Carla?', o: ['at the beach', 'at the skate park', 'at home', 'at school'] },
          { q: 'What is her brother doing?', o: ['swimming', 'reading', 'playing volleyball', 'skating'] },
          { q: 'What is Carla doing?', o: ['playing volleyball', 'swimming', 'reading', 'skating'] },
          { q: 'When is Skate Fest?', o: ['on Sunday 29 November at 16:00', 'on Saturday at 11:20', 'on Sunday at 10:00', 'in summer'] },
          { q: 'How much is a ticket?', o: ['3 euros', '8 euros', '150 euros', '29 euros'] }
        ],
        insecure: [
          { q: 'Where is Carla?', o: ['at the beach', 'at the skate park', 'at home', 'at school'] },
          { q: 'What is her brother doing?', o: ['swimming', 'reading', 'playing volleyball', 'skating'] },
          { q: 'When does Carla’s family usually go to this beach?', o: ['in summer', 'in November', 'every Saturday', 'in winter'] },
          { q: 'When is Skate Fest?', o: ['on Sunday 29 November at 16:00', 'on Saturday at 11:20', 'on Sunday at 10:00', 'in summer'] },
          { q: 'How much is a ticket?', o: ['3 euros', '8 euros', '150 euros', 'free for everyone'] }
        ],
        safe: [
          { q: 'Why is today a special day for Carla?', o: ['It’s a warm beach day in November.', 'It’s her birthday.', 'Her brother is swimming.', 'It’s summer.'] },
          { q: 'What is Carla doing?', o: ['playing volleyball with her cousins', 'swimming', 'reading under the umbrella', 'buying a ticket'] },
          { q: 'What is free at Skate Fest?', o: ['lemonade', 'the ticket for everyone', 'the music lessons', 'skateboards'] },
          { q: 'Where does the money from the tickets go?', o: ['to the new skate ramp', 'to the skaters', 'to the beach', 'to the music band'] },
          { q: 'What happened last year?', o: ['The tickets sold out in two days.', 'There was no competition.', 'It rained.', 'The lemonade was expensive.'] }
        ],
        daring: [
          { q: 'Why does Carla say the temperature is “crazy”?', o: ['22 degrees is very warm for November.', 'It is too cold for the beach.', 'Her brother is swimming.', 'The beach is crowded.'] },
          { q: '“And losing, as usual” tells us that Carla…', o: ['usually loses at volleyball', 'is winning today', 'never plays volleyball', 'is angry with her cousins'] },
          { q: 'Why does text B say “you are helping the park”?', o: ['because the ticket money pays for the new ramp', 'because the skaters clean the park', 'because the lemonade is free', 'because children under 8 are free'] },
          { q: 'Why does text B mention last year?', o: ['to make people buy tickets quickly', 'to explain the competition rules', 'to say the music was good', 'to describe the weather'] },
          { q: 'Which text wants you to do something at a specific time?', o: ['Both: text A says “until five” and text B gives the date and time.', 'Only text A.', 'Only text B.', 'Neither of them.'] }
        ] } },

    { id: 'log', type: 'quiz', tab: 'Reading log', title: 'Reading log', pts: [2, 2], start: 16,
      intro: { ca: 'Tria la nota correcta per a cada text: què fa la gent, on i quan, què fa normalment i el propòsit. Pots tornar a mirar el text.', en: 'Choose the correct note for each text: what people are doing, where and when, what they usually do, and the purpose. You can look at the text again.' },
      media: { text: TEXTS },
      items: {
        beginners: [
          { q: 'Text A · now: which note is correct?', o: ['brother: swimming · mum: reading', 'brother: reading · mum: swimming', 'brother: skating · mum: reading', 'brother: swimming · mum: playing volleyball'] },
          { q: 'Text A · where?', o: ['the beach', 'the skate park', 'the sports centre', 'the theatre'] },
          { q: 'Text A · usually?', o: ['They usually come to this beach in summer.', 'They usually come in November.', 'They never come to this beach.', 'They usually skate.'] },
          { q: 'Text B · what does it want?', o: ['It wants you to buy a ticket.', 'It tells you what Carla is doing.', 'It explains how to skate.', 'It talks about the weather.'] },
          { q: 'Text B · where and when?', o: ['Skate Park Nord · Sunday 29 November, 16:00', 'the beach · Saturday, 11:20', 'Skate Park Nord · Saturday, 11:20', 'the theatre · Sunday, 10:00'] }
        ],
        insecure: [
          { q: 'Text A · now: which note is correct?', o: ['brother: swimming · mum: reading · Carla: playing volleyball', 'brother: reading · mum: swimming · Carla: skating', 'brother: swimming · mum: playing volleyball · Carla: reading', 'brother: skating · mum: reading · Carla: swimming'] },
          { q: 'Text A · where and when?', o: ['the beach · Saturday, November, 11:20', 'the skate park · Sunday, 16:00', 'the beach · August', 'the sports centre · Saturday'] },
          { q: 'Text A · usually?', o: ['They usually come to this beach in summer.', 'They usually come in November.', 'They never come to this beach.', 'They usually skate.'] },
          { q: 'Text B · what is the purpose?', o: ['to sell tickets and invite you', 'to tell you what Carla is doing', 'to explain how to skate', 'to inform about the weather'] },
          { q: 'Text B · where and when?', o: ['Skate Park Nord · Sunday 29 November, 16:00', 'the beach · Saturday, 11:20', 'Skate Park Nord · Saturday, 11:20', 'the theatre · Sunday, 10:00'] }
        ],
        safe: [
          { q: 'Text A · which note is correct?', o: ['Now: swimming, reading, volleyball · Where/when: beach, Sat 11:20, Nov · Usually: summer · Purpose: inform + invite', 'Now: swimming, reading, volleyball · Where/when: beach, Sun 16:00 · Usually: November · Purpose: sell', 'Now: skating · Where/when: beach, Sat 11:20 · Usually: summer · Purpose: inform', 'Now: swimming · Where/when: skate park · Usually: winter · Purpose: invite'] },
          { q: 'Text B · which note is correct?', o: ['What: skate competition, music, free lemonade · Where/when: Skate Park Nord, Sun 29 Nov, 16:00 · Purpose: sell tickets + invite', 'What: volleyball · Where/when: beach, Saturday · Purpose: inform', 'What: skate competition · Where/when: Skate Park Nord, Sat 11:20 · Purpose: inform only', 'What: music festival · Where/when: theatre, Sunday · Purpose: sell'] },
          { q: 'Which word in text A shows the purpose “to invite”?', o: ['“Come and join us”', '“It’s sunny”', '“My brother is swimming”', '“We usually come”'] },
          { q: 'Which words in text B show the purpose “to sell”?', o: ['“Buy your ticket online now”', '“Watch the best young skaters”', '“free lemonade”', '“Sunday 29 November”'] },
          { q: 'In text B, “sold out” means…', o: ['there were no tickets left', 'the tickets were cheap', 'the skaters were very good', 'the event was cancelled'] }
        ],
        daring: [
          { q: 'Text A · which note is the most accurate?', o: ['Now: brother swimming, mum reading, Carla playing (and losing) volleyball · Beach, Sat 11:20, 22 °C in Nov · Usually: summer only · Purpose: inform friends + invite (“until five”)', 'Now: everyone swimming · Beach, Sunday · Usually: every weekend · Purpose: sell', 'Now: Carla reading · Skate park, Saturday · Usually: summer · Purpose: inform', 'Now: volleyball · Beach, August · Usually: November · Purpose: invite'] },
          { q: 'Text B · which note is the most accurate?', o: ['What: competition, live music, free lemonade · Skate Park Nord, Sun 29 Nov, 16:00 · 3 € (under 8 free), money for the new ramp · Purpose: sell tickets + invite, with urgency (150 places, sold out last year)', 'What: competition · Beach, Saturday · Free · Purpose: inform', 'What: music festival · Skate Park Nord, Sunday · 3 € · Purpose: inform about the weather', 'What: lemonade sale · Skate Park Nord, Saturday · 150 € · Purpose: invite'] },
          { q: 'Which phrase in text B creates urgency?', o: ['“last year they sold out in two days”', '“free lemonade for everyone”', '“the best young skaters in town”', '“children under 8: free”'] },
          { q: 'How are the purposes of the two texts different?', o: ['Text A shares a moment with friends and invites them; text B persuades you to buy a ticket.', 'Both texts sell something.', 'Text A sells tickets; text B informs about the beach.', 'Neither text invites anyone.'] },
          { q: 'In text A, “as usual” means…', o: ['like every other time', 'for the first time', 'only today', 'very fast'] }
        ]
      } },

    { id: 'vocab', type: 'quiz', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Vocabulari', en: 'Vocabulary' }, pts: [2.5, 2.5], start: 21,
      intro: { ca: 'Tria l’opció correcta o escriu la paraula que falta (2,5 punts cada una).', en: 'Choose the right option or write the missing word (2.5 points each).' },
      items: {
        beginners: [
          { q: 'Pau ___ football with his dad.', o: ['plays', 'does', 'goes', 'makes'] },
          { q: 'My cousin ___ gymnastics on Mondays.', o: ['does', 'plays', 'goes', 'makes'] },
          { q: 'In summer we go ___ every day.', o: ['swimming', 'swim', 'to swim', 'swam'] },
          { q: 'Ona plays ___ piano at school.', o: ['the', 'a', 'to', 'at'] },
          { q: 'Look at the sun! It’s ___.', o: ['sunny', 'raining', 'snowing', 'cloudy'] },
          { q: 'Wear a ___ on your skateboard: it’s safe.', o: ['helmet', 'cap', 'T-shirt', 'costume'] },
          { q: 'It’s very sunny. Wear a ___!', o: ['cap', 'helmet', 'uniform', 'tracksuit'] },
          { q: 'The trees are moving. It’s ___.', o: ['windy', 'sunny', 'snowing', 'hot'] },
          { q: 'She’s wearing ___.', o: ['a yellow T-shirt', 'a T-shirt yellow', 'yellow a T-shirt', 'a yellow T-shirts'] },
          { q: 'We l_____ to the radio in the car. (escoltar)', a: ['listen'] },
          { q: 'My dad r____ comics on Sundays. (llegeix)', a: ['reads'] },
          { q: 'It’s r______. Take an umbrella! (plou)', a: ['raining'] },
          { q: 'The sky is grey. It’s c_____. (ennuvolat)', a: ['cloudy'] },
          { q: 'We go s______ at the ice rink. (patinar)', a: ['skating'] }
        ],
        insecure: [
          { q: 'My friends ___ basketball after school.', o: ['play', 'do', 'go', 'make'] },
          { q: 'Joan ___ karate on Fridays.', o: ['does', 'plays', 'goes', 'makes'] },
          { q: 'We go ___ in the mountains.', o: ['cycling', 'cycle', 'to cycle', 'cycled'] },
          { q: 'We go ___ the beach in summer.', o: ['to', 'at', 'in', 'for'] },
          { q: 'I swim on Mondays and Fridays. I swim ___.', o: ['twice a week', 'once a week', 'every day', 'at the weekend'] },
          { q: 'The players wear a blue ___.', o: ['uniform', 'costume', 'helmet', 'cap'] },
          { q: 'At carnival, I wear a funny ___.', o: ['costume', 'helmet', 'trainers', 'uniform'] },
          { q: 'It’s summer and it’s hot. I’m wearing a T-shirt and ___.', o: ['shorts', 'a tracksuit', 'a helmet', 'a jacket'] },
          { q: '___ windy today. Let’s fly a kite!', o: ['It’s', 'Is', 'It makes', 'Makes'] },
          { q: 'I ___ video games with my brother. (jugar)', a: ['play'] },
          { q: 'Do you listen ___ music in the car?', a: ['to'] },
          { q: 'I run in my new ___. (bambes)', a: ['trainers'] },
          { q: 'It’s ___ in the mountains: everything is white! (neva)', a: ['snowing'] },
          { q: 'I do yoga ___ a week: only on Tuesdays. (una vegada)', a: ['once'] }
        ],
        safe: [
          { q: 'It’s ___: I can’t see the mountains.', o: ['foggy', 'freezing', 'stormy', 'sunny'] },
          { q: 'There’s thunder and lightning. It’s ___.', o: ['stormy', 'foggy', 'windy', 'sunny'] },
          { q: 'Which word doesn’t belong? swimming · skating · cycling · piano', o: ['piano', 'swimming', 'skating', 'cycling'] },
          { q: 'Choose the right sentence.', o: ['Pol is wearing a black cap and red shorts.', 'Pol is wearing a cap black and shorts red.', 'Pol is carrying a black cap and red shorts.', 'Pol wearing a black cap and red shorts.'] },
          { q: 'Our best player always ___ a goal.', o: ['scores', 'wins', 'does', 'makes'] },
          { q: 'My dad ___ yoga every evening. (do)', a: ['does'] },
          { q: 'They go ___ at the skate park. (skate)', a: ['skating'] },
          { q: 'My sister ___ the guitar in a band. (p...)', a: ['plays'] },
          { q: 'How ___ do you go to the cinema? — Once a month.', a: ['often'] },
          { q: 'We train on Tuesdays and Fridays: we train ___ a week.', a: ['twice'] },
          { q: 'I draw comics in my ___ time. (fr...)', a: ['free'] },
          { q: 'It’s very ___ today: perfect for my kite! (w...)', a: ['windy'] },
          { q: 'What’s the weather ___ in Girona? — It’s cloudy.', a: ['like'] },
          { q: 'Our team wears a green ___ for every match. (u...)', a: ['uniform'] }
        ],
        daring: [
          { q: 'Which word doesn’t belong? football · basketball · yoga · video games', o: ['yoga', 'football', 'basketball', 'video games'] },
          { q: 'Anna is really good ___ drawing.', o: ['at', 'in', 'on', 'for'] },
          { q: 'Our team needs ___ at the final! Come and support us!', o: ['fans', 'players', 'coaches', 'teams'] },
          { q: 'It’s minus five degrees! It’s ___!', o: ['freezing', 'foggy', 'stormy', 'cloudy'] },
          { q: 'Choose the right sentence.', o: ['It’s cold, so I’m wearing a warm red tracksuit.', 'It’s cold, so I’m wearing a tracksuit red warm.', 'Is cold, so I’m wearing a warm red tracksuit.', 'It’s cold, so I’m carrying a red warm tracksuit.'] },
          { q: 'Correct the mistake: “We play gymnastics.” → We ___ gymnastics.', a: ['do'] },
          { q: 'Correct the mistake: “She goes to skate on Sundays.” → She goes ___ on Sundays.', a: ['skating'] },
          { q: 'My brother ___ a lot of time playing video games. (sp...)', a: ['spends'] },
          { q: 'You need to ___ every day to get better at skating. (pr...)', a: ['practise', 'practice'] },
          { q: 'I want to ___ a dance club at school. (j...)', a: ['join'] },
          { q: 'Correct the mistake: “It’s cloud today.” → It’s ___ today.', a: ['cloudy'] },
          { q: 'Correct the mistake: “How is the weather like?” → What’s the weather ___?', a: ['like'] },
          { q: 'Our team never ___ at home: we always win! (l...)', a: ['loses'] },
          { q: 'The players are resting and drinking water: it’s ___. (h...)', a: ['half-time', 'half time', 'halftime'] }
        ] } },

    { id: 'grammar', type: 'quiz', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica', en: 'Grammar' }, pts: [1.5, 1.5], start: 35,
      intro: { ca: 'Tria l’opció correcta o escriu la forma que falta (1,5 punts cada una). Pots fer servir contraccions.', en: 'Choose the right option or write the missing words (1.5 points each). Contractions are accepted.' },
      items: {
        beginners: [
          { q: 'My brother ___ football every Sunday.', o: ['plays', 'play', 'playing', 'is play'] },
          { q: 'Ona ___ video games at night.', o: ['doesn’t play', 'don’t play', 'doesn’t plays', 'not play'] },
          { q: '___ your sister play the piano? — Yes, she does.', o: ['Does', 'Do', 'Is', 'Are'] },
          { q: '___ often do you go cycling? — Every Saturday.', o: ['How', 'What', 'Who', 'Where'] },
          { q: 'Look! Ana ___ on the ice.', o: ['is skating', 'skate', 'skating', 'skates'] },
          { q: 'I ___ a comic now.', o: ['am reading', 'read', 'reading', 'reads'] },
          { q: 'We ___ shorts today.', o: ['are wearing', 'is wearing', 'wear', 'wearing'] },
          { q: 'Is Pau swimming? — No, he ___.', o: ['isn’t', 'doesn’t', 'not', 'don’t'] },
          { q: 'My dad ___ (get) up at six every day.', a: ['gets'] },
          { q: 'Write the -ing form: read → ___', a: ['reading'] }
        ],
        insecure: [
          { q: 'Biel ___ the piano on Mondays.', o: ['plays', 'play', 'is play', 'playing'] },
          { q: 'They ___ go swimming in winter.', o: ['don’t', 'doesn’t', 'aren’t', 'not'] },
          { q: '___ you go skating at the weekend? — Yes, I do.', a: ['do'] },
          { q: '___ often do you do yoga? — Twice a week.', o: ['How', 'What', 'Where', 'Who'] },
          { q: 'Look! My friends ___ in the park.', o: ['are running', 'is running', 'running', 'run'] },
          { q: 'It ___ now. Let’s go to the park!', o: ['isn’t raining', 'doesn’t rain', 'not raining', 'isn’t rain'] },
          { q: '___ they watching the match? — Yes, they are.', o: ['Are', 'Do', 'Is', 'Does'] },
          { q: 'What ___ your friends doing? — They’re dancing.', o: ['are', 'is', 'does', 'do'] },
          { q: 'We ___ (wear) our new trainers today.', a: ['are wearing', "'re wearing"] },
          { q: 'Write the -ing form: eat → ___', a: ['eating'] }
        ],
        safe: [
          { q: 'My cousin ___ (watch) cartoons every morning.', a: ['watches'] },
          { q: 'Our coach ___ (get) up at six every day.', a: ['gets'] },
          { q: '___ your dad cook at the weekend? — Yes, he does.', a: ['does'] },
          { q: 'I ___ eat sweets before training. (never / 0 %)', a: ['never'] },
          { q: 'Look! Laia ___ (ride) her bike in the rain.', a: ['is riding', "'s riding"] },
          { q: 'We ___ (listen) to the radio right now.', a: ['are listening', "'re listening"] },
          { q: 'Are they playing tennis? — No, they ___.', a: ["aren't", 'are not'] },
          { q: 'Write the -ing form: dance → ___', a: ['dancing'] },
          { q: 'Choose the right sentence.', o: ['Right now my brother is drawing a comic.', 'Right now my brother draws a comic.', 'Right now my brother is draw a comic.', 'Right now my brother drawing a comic.'] },
          { q: 'Pol usually goes cycling on Sundays, but today he ___ football.', o: ['is playing', 'plays', 'play', 'playing'] }
        ],
        daring: [
          { q: 'My sister ___ (try) a new sport every summer.', a: ['tries'] },
          { q: 'Our teacher ___ (teach) yoga at the weekend.', a: ['teaches'] },
          { q: 'Where ___ you usually meet your friends?', a: ['do'] },
          { q: 'How ___ do you go to the gym? — Three times a week.', a: ['often'] },
          { q: 'Listen! The baby ___ (cry).', a: ['is crying', "'s crying"] },
          { q: 'We ___ (have) lunch in the park today.', a: ['are having', "'re having"] },
          { q: 'The fans ___ (sing) at the moment.', a: ['are singing', "'re singing"] },
          { q: 'Correct the mistake: “He’s runing to school.” → He’s ___ to school.', a: ['running'] },
          { q: 'Ona usually plays the piano, but today she ___ (play) the guitar.', a: ['is playing', "'s playing"] },
          { q: 'Choose the right sentence.', o: ['On Saturdays Marta goes skating.', 'On Saturdays Marta is go skating.', 'On Saturdays Marta going skating.', 'On Saturdays Marta go skating.'] }
        ] } },

    { id: 'write', type: 'marked', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: '45. Escriptura: un post per al blog de la classe', en: '45. Writing: a post for the class blog' }, max: 10, criterion: '5.1 (blog post)', levels: L51, levelPts: L10,
      intro: { ca: 'Escriu sense apunts, com a l’examen.', en: 'Write without notes, as in the exam.' },
      source: 'The student is at a free-time place or event of their choice (a park, a match, the beach, a dance class, the ice rink…) and writes a post for the class blog with these parts: where they are and who with; the weather; what people are doing right now (Present Continuous); what they are wearing; what they usually do there and how often (Present Simple + how often).', sourceLabel: 'Situation',
      task: { beginners: 'Ets en un lloc de temps lliure (el parc, la platja, un partit…). Escriu un post curt per al blog de la classe (30–50 paraules) omplint la plantilla: on ets i amb qui · quin temps fa · què està fent la gent ara (<em>is / are + -ing</em>) · què portes posat · què fas normalment allà i quan (<em>usually / on Saturdays</em>).\nParaules: the park · the beach · sunny · cold · raining · playing · swimming · wearing · on Saturdays · twice a week',
        insecure: 'Ets en un lloc de temps lliure (un partit, el parc de skate, la pista de gel, la platja…). Escriu un post per al blog de la classe (40–60 paraules): on ets i amb qui · quin temps fa · què està fent la gent ara mateix (2 o 3 frases amb <em>is / are + -ing</em>) · què portes posat · què fas normalment allà i amb quina freqüència (<em>usually / every… / twice a week</em>).\nParaules útils: today · right now · usually · on Saturdays · sunny · cold · wearing',
        safe: 'You are at a free-time place or event of your choice (a match, the ice rink, the beach, a concert…). Write a post for the class blog (60–80 words): where you are and who with, the weather, what people are doing right now (three or four Present Continuous sentences), what you are wearing or using, and what you usually do there and how often (Present Simple + how often).',
        daring: 'You are at a free-time place or event of your choice. Write a post for the class blog (70–100 words): where you are and who with, the weather, what people are doing right now (Present Continuous, with a question like “What are they doing?”), what you are wearing or using, and what you usually do there and how often (Present Simple + how often). Link your sentences with <em>and, but</em>.' },
      template: { beginners: 'Hi! I’m at … with …\nIt’s … (sunny / cold / raining).\nMy friend is …-ing. People are …-ing.\nI’m wearing …\nI usually … on …', insecure: 'Hi everyone! Today I’m at … with …\nIt’s … (weather). … is …-ing and … are …-ing.\nI’m wearing …\nI usually … here … (how often).', safe: 'Hi everyone! Today I’m at…', daring: 'Hi everyone! Today I’m at…' },
      min: { beginners: 30, insecure: 40, safe: 60, daring: 70 } },

    { id: 'score', type: 'summary', tab: { ca: 'La meva nota', en: 'My score' }, title: { ca: 'La meva nota', en: 'My score' },
      intro: { ca: 'Primer intent de cada secció. L’escriptura no té nota: en tens la correcció.', en: 'Your first try in each section. The writing has no mark: you get its correction.' } }
  ]
};
})();
