/* 2 ESO · LS2 · Sample exam (practice, not graded): the same format and points as the real exam (the 4 ESO LS2 format approved by Roger on 25 Oct 2026,
   applied to 2 ESO), so students know the points of every section. Everything except the writing is multiple choice or a short gap and is marked
   automatically (first try = the exam score); the vlog script gets feedback and a guide mark from ChatGPT with the 5.1 levels (ChatGPT can make
   mistakes; in the exam the teacher marks it). Each route has its own list of items (same number per route). Out of 100: listening 10 + listening
   chart 10, reading 10 + reading log 10, vocabulary 15, grammar 15, writing 30. Numbered 1–43 like the real exam; multiple choice has four options
   (the first is the right one; the engine shuffles). */
(function () {
const L30 = [8, 15, 23, 30];
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
const L51 = ['Unfinished or not understandable; no clear parts, even with the template; no time expressions or tips.',
  'The parts are there, close to the template or model; Present Continuous and Present Simple mostly correct; errors that do not block meaning; the tips are imperatives.',
  'Clear parts (now, usually, likes, tips), time expressions, likes with -ing and imperatives used correctly; adapts the model.',
  'Clear, well-linked and personal beyond the model (and, but, because, so; Daring: a temporary situation and an opinion), few errors.'];
const AUDIO = { audio: 'audio/sample-exam-two-vlogs.mp3', title: 'Two vlogs: Ellie and Jack', script: SCRIPT };

window.LP = {
  key: 'ls2SampleExam2ESO', n: 'E', title: 'Sample exam',
  panels: [
    // Shadowing review (Roger, 31 Oct 2026): the LS's shadowing video, once per LS as revision before the exam. Not a step: nothing is saved or counted.
    { id: 'shadowing', type: 'info', tab: { ca: '🗣 Shadowing', en: '🗣 Shadowing' }, title: { ca: 'Abans de l’examen: shadowing de tota la unitat', en: 'Before the exam: shadowing for the whole unit' },
      html: { ca: '<p>Un repàs de 6 minuts per escoltar i parlar: frases de les escoltes de la unitat. Escolta, repeteix en veu alta i torna-ho a fer sense text. El vídeo t’espera.</p>' + SHADOW_VIDEO,
        en: '<p>A 6-minute review for listening and speaking: sentences from the unit’s recordings. Listen, say them out loud, then do it again with no text. The video waits for you.</p>' + SHADOW_VIDEO } },
    { id: 'how', type: 'info', tab: { ca: 'Com és', en: 'How it works' }, title: { ca: 'Com és l’examen', en: 'How the exam works' },
      html: { ca: '<p>Aquest examen d’exemple té <strong>el mateix format i els mateixos punts que l’examen real</strong> (que faràs amb un Google Forms). 55 minuts, sense apunts.</p>' +
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 preguntes + listening chart, 5 preguntes (2 punts cada una)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 preguntes + reading log, 5 preguntes (2 punts cada una)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 d’opcions (1 punt) + 4 per completar (2 punts)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: el guió d’un vlog</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>Totes les preguntes es corregeixen soles: el <strong>primer intent</strong> és la teva nota, com a l’examen. El guió el corregeix <strong>ChatGPT</strong> amb els criteris de l’examen i et dona una nota orientativa. Al final, a <em>La meva nota</em>, veuràs el total.</p><p class="warm-note">⚠️ ChatGPT es pot equivocar: la seva nota només és orientativa. A l’examen real, el guió el corregeix el professorat.</p>',
        en: '<p>This sample exam has <strong>the same format and the same points as the real exam</strong> (which you will do in a Google Form). 55 minutes, no notes.</p>' +
        '<table class="score-table" style="width:100%;border-collapse:collapse"><tbody><tr><td>1 Listening: 5 questions + listening chart, 5 questions (2 points each)</td><td style="text-align:right">20</td></tr><tr><td>2 Reading: 5 questions + reading log, 5 questions (2 points each)</td><td style="text-align:right">20</td></tr><tr><td>3 Vocabulary: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>4 Grammar: 7 multiple choice (1 point) + 4 gaps (2 points)</td><td style="text-align:right">15</td></tr><tr><td>5 Writing: a vlog script</td><td style="text-align:right">30</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>100</strong></td></tr></tbody></table>' +
        '<p>All the questions are marked automatically: your <strong>first try</strong> is your score, as in the exam. The script is marked by <strong>ChatGPT</strong> with the exam criteria, which gives you a guide mark. At the end, <em>My score</em> shows your total.</p><p class="warm-note">⚠️ ChatGPT can make mistakes: its mark is only a guide. In the real exam, your teacher marks the script.</p>' } },

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
          { q: 'Why is Ellie’s group training every day this month?', o: ['because they want to win the competition', 'because the dance school is closed', 'because it is raining', 'because Ellie is nervous'] },
          { q: 'Why does Jack say “this is amazing”?', o: ['His team usually loses, but now they are winning.', 'The weather is amazing.', 'He is playing very well.', 'The sports centre is new.'] },
          { q: 'What is Jack doing instead of playing?', o: ['filming the match for the class channel', 'watching videos in bed', 'warming up', 'talking to the coach'] },
          { q: 'Which sentence from Ellie describes a habit?', o: ['“I usually practise on Tuesdays and Thursdays.”', '“Today I’m at the town theatre.”', '“The group from Girona is dancing.”', '“The music is starting.”'] },
          { q: 'Who gives Jack the screen tip?', o: ['his coach', 'his friend Tom', 'his teacher', 'his mum'] }
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
          { q: 'What is temporary (this month) for Ellie?', o: ['training every day', 'practising on Tuesdays and Thursdays', 'wearing white trainers', 'loving dance'] },
          { q: 'Which two details does Jack give about the weather?', o: ['cold and windy, about six degrees', 'hot and noisy', 'raining and warm', 'sunny, about twenty degrees'] },
          { q: 'Which words tell you that Ellie is talking about now?', o: ['“Right now the group from Girona is dancing.”', '“I usually practise on Tuesdays.”', '“I love it.”', '“We want to win.”'] }
        ],
        daring: [
          { q: 'Which note about Ellie is the most accurate?', o: ['Now: waiting, nervous, Girona group on stage · Usually: Tue and Thu at the dance school · This month: training every day · Details: theatre, hot inside, raining outside, black costume', 'Now: dancing · Usually: every day · Details: theatre, sunny, white costume', 'Now: waiting · Usually: Tue and Thu · This month: no training · Details: sports centre, cold', 'Now: practising · Usually: competitions · Details: theatre, raining, trainers only'] },
          { q: 'Which note about Jack is the most accurate?', o: ['Now: filming for the class channel, not playing (leg hurts) · Usually: his team loses · Details: sports centre, Sunday, cold and windy, 6 °C, tracksuit and woolly hat', 'Now: playing and scoring · Usually: wins · Details: sports centre, hot, tracksuit', 'Now: filming · Usually: plays on Tuesdays · Details: theatre, raining', 'Now: watching videos in bed · Usually: films matches · Details: cold, 16 °C'] },
          { q: 'How do you know Ellie is nervous?', o: ['She says it and she asks for luck before she dances.', 'She is wearing a black costume.', 'She practises on Tuesdays.', 'The theatre is noisy.'] },
          { q: 'What do Ellie and Jack have in common today?', o: ['Both are at an event that is different from their usual routine.', 'Both are playing in a match.', 'Both are at home.', 'Both are dancing.'] },
          { q: 'Why does Jack mention his coach at the end?', o: ['The screen tip comes from his coach.', 'His coach is filming.', 'His coach scored a goal.', 'His coach is angry.'] }
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

    { id: 'vocab', type: 'quiz', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Vocabulari', en: 'Vocabulary' }, pts: [1, 2], start: 21,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la paraula que falta (2 punts).', en: 'Choose the right option (1 point), then write the missing word (2 points).' },
      items: {
        beginners: [
          { q: 'I ___ football on Saturdays.', o: ['play', 'do', 'go', 'make'] },
          { q: 'We go ___ in the sea.', o: ['swimming', 'swim', 'to swim', 'swam'] },
          { q: 'It’s ___: look at the sun!', o: ['sunny', 'raining', 'cold', 'cloudy'] },
          { q: 'On your bike, wear a ___.', o: ['helmet', 'cap', 'T-shirt', 'costume'] },
          { q: 'I ___ photos of my dog.', o: ['take', 'do', 'make', 'play'] },
          { q: 'I ___ skating: it’s my favourite hobby!', o: ['love', 'hate', 'mind', 'want'] },
          { q: '___ a break every 30 minutes.', o: ['Take', 'Make', 'Do', 'Go'] },
          { q: 'It’s very c___ today: 2 degrees! (fred)', a: ['cold'] },
          { q: 'I l_____ to music on the bus. (escoltar)', a: ['listen'] },
          { q: 'I’m wearing a T-s____ and shorts. (samarreta)', a: ['t-shirt', 'tshirt', 't shirt'] },
          { q: 'I play football on S________. (dissabtes)', a: ['saturdays', 'saturday'] }
        ],
        insecure: [
          { q: 'I ___ karate on Tuesdays.', o: ['do', 'play', 'go', 'make'] },
          { q: 'We go ___ at the skate park.', o: ['skating', 'skate', 'to skate', 'skated'] },
          { q: 'It’s ___: take an umbrella.', o: ['raining', 'sunny', 'hot', 'windy'] },
          { q: 'On your bike, wear a ___.', o: ['helmet', 'cap', 'T-shirt', 'costume'] },
          { q: 'I ___ photos of my dog for my vlog.', o: ['take', 'do', 'make', 'play'] },
          { q: 'I ___ skating: it’s my favourite hobby!', o: ['love', 'hate', 'mind', 'want'] },
          { q: '___ a break every 30 minutes.', o: ['Take', 'Make', 'Do', 'Go'] },
          { q: 'I run in my new t_______. (bambes)', a: ['trainers'] },
          { q: 'It’s very c___ today: 2 degrees! (fred)', a: ['cold'] },
          { q: 'I l_____ to music on the bus. (escoltar)', a: ['listen'] },
          { q: 'R____ now I’m at home. (ara mateix)', a: ['right'] }
        ],
        safe: [
          { q: 'Our team is in a ___ with 12 teams this weekend.', o: ['tournament', 'show', 'fair', 'concert'] },
          { q: 'It’s ___: I can’t see the end of the street.', o: ['foggy', 'freezing', 'stormy', 'sunny'] },
          { q: 'Marc is a great player: he ___ a goal in every match.', o: ['scores', 'wins', 'loses', 'practises'] },
          { q: 'We ___ a video to the club channel every Sunday.', o: ['upload', 'download', 'follow', 'search'] },
          { q: 'My ___ time is three hours a day. Too much!', o: ['screen', 'phone', 'social', 'online'] },
          { q: '___ your phone away at dinner.', o: ['Put', 'Switch', 'Take', 'Set'] },
          { q: 'I’m getting ___ at skating: I don’t fall now.', o: ['better', 'good', 'well', 'best'] },
          { q: 'Set a time l____ of one hour for games.', a: ['limit'] },
          { q: 'I f_____ a climbing channel with two million subscribers.', a: ['follow'] },
          { q: 'What’s the w______ like today? — It’s sunny.', a: ['weather'] },
          { q: 'I want to j___ a dance club.', a: ['join'] }
        ],
        daring: [
          { q: 'The ___ is cheering: five hundred people!', o: ['crowd', 'team', 'coach', 'channel'] },
          { q: 'Some games are very ___: you can’t stop playing.', o: ['addictive', 'healthy', 'reliable', 'boring'] },
          { q: 'Go outside ___ of watching videos all afternoon.', o: ['instead', 'because', 'so', 'but'] },
          { q: 'A museum website is a ___ source.', o: ['reliable', 'addictive', 'temporary', 'free'] },
          { q: 'I can’t ___ with notifications on.', o: ['concentrate', 'cheer', 'upload', 'score'] },
          { q: 'Before the match, the players ___ up.', o: ['warm', 'take', 'turn', 'put'] },
          { q: 'I ___ the park to the sports hall.', o: ['prefer', 'believe', 'mean', 'need'] },
          { q: 'Is this page up to d___? It says 2019.', a: ['date'] },
          { q: 'For me, climbing m____ freedom.', a: ['means'] },
          { q: 'This page is not information: it’s an a_____ for trainers.', a: ['advert', 'advertisement'] },
          { q: 'Twenty teams are taking p___ in the tournament.', a: ['part'] }
        ] } },

    { id: 'grammar', type: 'quiz', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Gramàtica', en: 'Grammar' }, pts: [1, 2], start: 32,
      intro: { ca: 'Tria l’opció correcta (1 punt) i escriu la forma que falta (2 punts). Pots fer servir contraccions.', en: 'Choose the right option (1 point), then write the missing words (2 points). Contractions are accepted.' },
      items: {
        beginners: [
          { q: 'Look! Pol ___ on the ramp.', o: ['is skating', 'skate', 'skating', 'skates'] },
          { q: 'I ___ a video now.', o: ['am recording', 'record', 'recording', 'records'] },
          { q: 'They ___ T-shirts today.', o: ['are wearing', 'is wearing', 'wear', 'wearing'] },
          { q: 'The -ing form of “swim” is…', o: ['swimming', 'swiming', 'swimning', 'swime'] },
          { q: 'I usually ___ football on Saturdays.', o: ['play', 'am playing', 'playing', 'plays'] },
          { q: 'I love ___ comics.', o: ['reading', 'read', 'to reading', 'reads'] },
          { q: '___ use your phone in bed.', o: ['Don’t', 'Not', 'No', 'Doesn’t'] },
          { q: 'She ___ (dance) now.', a: ['is dancing', "'s dancing"] },
          { q: 'We ___ (play) basketball today.', a: ['are playing', "'re playing"] },
          { q: 'I usually ___ (go) to the park on Sundays.', a: ['go'] },
          { q: '___ a break and drink some water. (fer, imperatiu)', a: ['take'] }
        ],
        insecure: [
          { q: 'Look! Pol ___ on the ramp.', o: ['is skating', 'skate', 'skating', 'skates'] },
          { q: 'They ___ football today: it’s raining.', o: ['aren’t playing', 'don’t playing', 'isn’t playing', 'not play'] },
          { q: '___ you listening to music? — Yes, I am.', o: ['Are', 'Do', 'Is', 'Does'] },
          { q: 'The -ing form of “swim” is…', o: ['swimming', 'swiming', 'swimning', 'swime'] },
          { q: 'I usually ___ football on Saturdays.', o: ['play', 'am playing', 'playing', 'plays'] },
          { q: 'I love ___ comics.', o: ['reading', 'read', 'to reading', 'reads'] },
          { q: '___ use your phone in bed.', o: ['Don’t', 'Not', 'No', 'Doesn’t'] },
          { q: 'She ___ (dance) right now.', a: ['is dancing', "'s dancing"] },
          { q: 'What ___ Marta doing? — She’s taking photos.', a: ['is'] },
          { q: 'My brother ___ (not / like) swimming.', a: ["doesn't like", 'does not like'] },
          { q: '___ a break and drink some water. (fer, imperatiu)', a: ['take'] }
        ],
        safe: [
          { q: 'Marc usually plays as a defender, but today he ___ as a forward.', o: ['is playing', 'plays', 'play', 'playing'] },
          { q: 'I ___ a new helmet. Mine is too small.', o: ['want', 'am wanting', 'wanting', 'wants'] },
          { q: 'Is she playing well? — Yes, she ___.', o: ['is', 'does', 'plays', '’s'] },
          { q: 'Who ___ the race today? — Noah is.', o: ['is filming', 'films', 'film', 'does film'] },
          { q: 'Set a time limit, ___ you have time for other things.', o: ['so', 'because', 'but', 'or'] },
          { q: 'Do you like ___ online?', o: ['playing', 'play', 'to playing', 'played'] },
          { q: 'The -ing form of “get” is…', o: ['getting', 'geting', 'gettin', 'gets'] },
          { q: 'Leo usually wins, and he ___ (win) again today!', a: ['is winning', "'s winning"] },
          { q: 'I ___ (not / understand) the rules. Can you help me?', a: ["don't understand", 'do not understand'] },
          { q: 'She hates ___ (lose) a match.', a: ['losing'] },
          { q: 'Switch off your phone at night, ___ the light keeps you awake.', a: ['because'] }
        ],
        daring: [
          { q: 'This month I ___ for a race, so I ride every day.', o: ['am training', 'train', 'trains', 'training'] },
          { q: 'I ___ skating is the best sport. (opinion)', o: ['think', 'am thinking', 'thinks', 'thinking'] },
          { q: 'Be quiet! I ___ about my next video.', o: ['am thinking', 'think', 'thinks', 'thought'] },
          { q: 'Go outside instead of ___ videos.', o: ['watching', 'watch', 'to watch', 'watched'] },
          { q: 'Leo ___ all the routes in the park.', o: ['knows', 'is knowing', 'know', 'knowing'] },
          { q: 'Why ___ cheering?', o: ['are the fans', 'the fans are', 'do the fans', 'the fans'] },
          { q: 'One hour of games a day is ___.', o: ['enough', 'instead', 'addictive enough', 'too'] },
          { q: 'My cousin ___ (stay) with us this week, so we skate every afternoon.', a: ['is staying', "'s staying"] },
          { q: 'Correct the mistake: “She’s studing for the exam.” → She’s ___ for the exam.', a: ['studying'] },
          { q: 'I prefer the park ___ the sports hall.', a: ['to'] },
          { q: 'Correct the mistake: “Don’t to use your phone in bed.” → ___ use your phone in bed.', a: ["don't", 'do not'] }
        ] } },

    { id: 'write', type: 'marked', tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: '43. Escriptura: el guió d’un vlog', en: '43. Writing: a vlog script' }, max: 30, criterion: '5.1 (vlog script)', levels: L51, levelPts: L30,
      intro: { ca: 'Escriu sense apunts, com a l’examen.', en: 'Write without notes, as in the exam.' },
      source: 'The student is recording a short vlog at a free-time event or hobby of their choice (a match, a skate park, a dance class, a concert, the beach…). The script has these parts: greeting; now (where they are, the weather, what people are doing, clothes or kit); usually; likes and dislikes; screen tips; goodbye.', sourceLabel: 'Situation',
      task: { beginners: 'Estàs gravant un vlog curt en un lloc de temps lliure (el parc, la platja, un partit…). Escriu el guió (40–60 paraules) omplint la plantilla: salutació · on ets, quin temps fa i què està fent una persona (<em>is + -ing</em>) · què fas normalment allà (<em>usually</em>) · una cosa que t’agrada (<em>I love + -ing</em>) · un consell de pantalla · comiat.\nParaules: the park · the beach · sunny · cold · raining · playing · swimming · on Saturdays · take a break · don’t use your phone in bed',
        insecure: 'Estàs gravant un vlog curt en un lloc de temps lliure (un partit, el parc de skate, una classe de dansa, la platja…). Escriu el guió (60–80 paraules) amb la plantilla: salutació · on ets, quin temps fa i què està fent la gent (Present Continuous) · què fas normalment allà (Present Simple) · una cosa que t’agrada (<em>I love / like + -ing</em>) · dos consells de pantalla amb imperatius · comiat.\nParaules útils: today · right now · usually · on Saturdays · sunny · cold · wearing · take a break · don’t',
        safe: 'You are recording a short vlog at a free-time event or hobby of your choice (a match, a skate park, a dance class, a concert, the beach…). Write the script (90–120 words) with these parts: greeting · live now (where you are, the weather, what people are doing and wearing: Present Continuous) · what you usually do there (Present Simple) · likes and dislikes (love / like / hate + -ing) · three screen tips with imperatives · goodbye. Use time expressions.',
        daring: 'You are recording a short vlog at a free-time event or hobby of your choice. Write the script (120–160 words) with these parts: greeting · live now (Present Continuous) · what you usually do there, plus a temporary situation this month · likes, dislikes and one opinion with a state verb (<em>I think / I prefer</em>) · three screen tips with a reason each (<em>because / so</em>) · goodbye. Link your sentences with <em>and, but, because, so</em>.' },
      template: { beginners: 'Hi everyone! I’m … and this is my vlog about …\nToday I’m at … It’s … (sunny / cold / raining). My friend is …-ing.\nI usually … on …\nI love …-ing.\nOne tip: …\nThanks for watching!', insecure: 'Hi everyone! I’m … and this is my vlog about …\nToday I’m at … It’s … (weather). … is …-ing and … are …-ing. I’m wearing …\nI usually … on …\nI love …-ing because …\nTwo tips: … Don’t …\nThanks for watching! See you next time!', safe: 'Hi everyone! I’m … and welcome to my vlog about …\nToday I’m at…', daring: 'Hi everyone! I’m … and welcome to my vlog about …\nToday I’m at…' },
      min: { beginners: 40, insecure: 60, safe: 90, daring: 120 } },

    { id: 'score', type: 'summary', tab: { ca: 'La meva nota', en: 'My score' }, title: { ca: 'La meva nota', en: 'My score' },
      intro: { ca: 'Primer intent de cada secció i les notes de ChatGPT que has apuntat.', en: 'Your first try in each section and the ChatGPT marks you noted.' } }
  ]
};
})();
