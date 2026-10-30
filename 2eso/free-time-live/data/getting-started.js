/* 2 ESO · LS2 Free Time, Live! · Learning Path 1 · Getting started (warm-up, not graded; docs/2eso/ls2-free-time-live/overview.md) */
window.LP = {
  key: 'ls2GettingStarted2ESO', n: 1, title: 'Getting started: what do you do in your free time?',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: què recordes de My Real Routine?', en: 'Recall: what do you remember from My Real Routine?' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res. Si falles, llegeix el feedback: així s’aprèn.', en: 'Type the answers without looking. If you miss one, read the feedback: that is how you learn.' },
      items: [
        { q: 'She ___ (get) up at seven every day.', a: ['gets'], ca: 'Present Simple, 3a persona: -s.', en: 'Present Simple, third person: -s.' },
        { r: 'insecure', q: '___ he walk to school? — Yes, he does.', a: ['does'], ca: 'Pregunta amb he/she/it: Does.', en: 'Question with he/she/it: Does.' },
        { r: 'insecure', q: 'We ___ (not / have) lunch at school.', a: ["don't have", 'do not have'], ca: 'Negativa amb we: don’t.', en: 'Negative with we: don’t.' },
        { q: 'I ___ (be) thirteen years old.', a: ['am', "'m"], ca: 'Verb be: I am.', en: 'Verb be: I am.' },
        { q: 'My sister ___ got a bike.', a: ['has'], ca: 'have got, 3a persona: has got.', en: 'have got, third person: has got.' },
        { q: 'I ___ go to bed late. (never / 0 %)', a: ['never'], ca: 'Adverbi de freqüència: 0 % = never.', en: 'Frequency adverb: 0 % = never.' },
        { r: 'insecure', q: 'First, I get up. ___, I have a shower. (després)', a: ['then', 'after that', 'next'], ca: 'Seqüència: Then / After that.', en: 'Sequence: Then / After that.' },
        { q: 'I go to school ___ Monday to Friday.', a: ['from'], ca: 'from… to…', en: 'from… to…' },
        { r: 'safe', q: 'What time ___ you get up at the weekend?', a: ['do'], en: 'Question with you: do.' },
        { r: 'safe', q: 'He ___ (study) in the evening, but not at night.', a: ['studies'], en: 'Spelling: consonant + y → -ies.' },
        { r: 'daring', q: 'Put the adverb in: “She is late.” (always) → ___', a: ['she is always late', "she's always late"], en: 'Adverb after the verb be.' },
        { r: 'daring', q: 'How ___ do you play football? — Twice a week.', a: ['often'], en: 'How often…? asks about frequency.' }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Activitats de temps lliure', en: 'Free-time activities' },
      intro: { ca: 'Explora les paraules, practica amb les targetes i completa les frases (80 %).', en: 'Explore the words, practise with the cards and complete the sentences (80 %).' },
      receptive: 'livestream · subscribers · highlights · fans',
      core: { insecure: ['play football', 'play basketball', 'play video games', 'play the guitar', 'play the piano', 'go swimming', 'go skating', 'go cycling', 'go to the park', 'do karate', 'do gymnastics', 'do yoga', 'dance', 'draw', 'read comics', 'listen to music', 'meet friends'], safe: ['play football', 'play basketball', 'play video games', 'play the guitar', 'go swimming', 'go skating', 'go cycling', 'do karate', 'do gymnastics', 'do yoga', 'dance', 'draw', 'read comics', 'listen to music', 'meet friends', 'once a week', 'twice a week', 'every day', 'at the weekend', 'in my free time'], daring: ['play football', 'play video games', 'play the guitar', 'go swimming', 'go skating', 'go cycling', 'do karate', 'do yoga', 'draw', 'read comics', 'listen to music', 'meet friends', 'once a week', 'twice a week', 'at the weekend', 'in my free time', 'be good at', 'spend time + -ing', 'join a club', 'practise'] },
      groups: [
        { g: 'play + sport / game', items: [['play football', 'jugar a futbol', 'I play football on Saturday mornings.'], ['play basketball', 'jugar a bàsquet', 'We play basketball at the park.'], ['play video games', 'jugar a videojocs', 'He plays video games after dinner.'], ['play the guitar', 'tocar la guitarra', 'She plays the guitar in a band.'], ['play the piano', 'tocar el piano', 'My cousin plays the piano very well.']] },
        { g: 'go + -ing', items: [['go swimming', 'anar a nedar', 'We go swimming in summer.'], ['go skating', 'anar a patinar', 'They go skating at the skate park.'], ['go cycling', 'anar amb bici', 'I go cycling with my dad.'], ['go to the park', 'anar al parc', 'We go to the park after school.']] },
        { g: 'do + activity', items: [['do karate', 'fer karate', 'He does karate on Tuesdays.'], ['do gymnastics', 'fer gimnàstica', 'She does gymnastics at a club.'], ['do yoga', 'fer ioga', 'My mum does yoga in the morning.']] },
        { g: 'Other activities', items: [['dance', 'ballar', 'I dance in my room.'], ['draw', 'dibuixar', 'She draws comics.'], ['read comics', 'llegir còmics', 'I read comics at night.'], ['listen to music', 'escoltar música', 'We listen to music on the bus.'], ['meet friends', 'quedar amb amics', 'I meet friends on Saturday afternoons.']] },
        { r: 'safe', g: 'How often? (Safe)', items: [['once a week', 'un cop per setmana', 'I go swimming once a week.'], ['twice a week', 'dos cops per setmana', 'We train twice a week.'], ['every day', 'cada dia', 'He practises every day.'], ['at the weekend', 'el cap de setmana', 'I meet friends at the weekend.'], ['in my free time', 'en el meu temps lliure', 'In my free time I draw.']] },
        { r: 'daring', g: 'Talking about hobbies (Daring)', items: [['be good at', 'ser bo en', 'She is good at drawing.'], ['spend time + -ing', 'passar temps fent', 'I spend time playing the guitar.'], ['join a club', 'apuntar-se a un club', 'He wants to join a climbing club.'], ['practise', 'practicar', 'They practise after school.']] }
      ],
      review: [
        { g: 'My Real Routine', items: [['get up', 'llevar-se', 'I get up at seven.'], ['have breakfast', 'esmorzar', 'We have breakfast at eight.'], ['go to bed', 'anar a dormir', 'She goes to bed at ten.'], ['do homework', 'fer deures', 'I do homework after school.']] }
      ],
      practice: [
        { q: 'I ___ football with my friends on Saturdays. (jugar)', a: ['play'] },
        { q: 'We go ___ in the sea in August. (nedar)', a: ['swimming'] },
        { r: 'insecure', q: 'My brother ___ karate twice a week. (fer)', a: ['does'] },
        { r: 'insecure', q: 'She plays ___ guitar in her room. (article)', a: ['the'] },
        { q: 'I like to ___ comics at night. (llegir)', a: ['read'] },
        { q: 'We ___ friends in the square after school. (quedar amb)', a: ['meet'] },
        { q: 'They go ___ at the skate park. (patinar)', a: ['skating'] },
        { q: 'I ___ to music on the bus. (escoltar)', a: ['listen'] },
        { r: 'insecure', q: 'My sister ___ pictures of animals. (dibuixar)', a: ['draws'] },
        { r: 'insecure', q: 'We go ___ the park after lunch.', a: ['to'] },
        { r: 'safe', q: 'I go cycling ___ a week: on Saturday and Sunday.', a: ['twice'] },
        { r: 'safe', q: 'I don’t play football during the week, only ___ the weekend.', a: ['at'] },
        { r: 'daring', q: 'He is very good ___ basketball.', a: ['at'] },
        { r: 'daring', q: 'I ___ a lot of time drawing. (passar)', a: ['spend'] }
      ] },
    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: Two posts from Saturday', pill: '80 %',
      intro: { ca: 'Llegeix dos missatges d’un grup de classe. Fixa’t en què fan normalment i en què fan avui.', en: 'Read two posts from a class group chat. Notice what people usually do and what they are doing today.' },
      media: { text: {
        beginners: '<p><strong>Post 1 · Marta, 10:30</strong><br>Hi! I’m at the skate park. ☀️ It’s sunny. I’m here with Pol and Aina. Pol is skating. Aina is taking photos. I usually come here on Saturdays. Today there is a competition at 12. Come and watch!</p><p><strong>Post 2 · Hugo, 16:45</strong><br>Hi! I’m at home. ☔ It’s raining. No football today. I usually play football on Saturdays. Now I’m playing video games with my brother. Boring!</p><p class="tiny"><strong>Paraules:</strong> skate park = parc d’skate · taking photos = fent fotos · competition = competició · raining = plou · boring = avorrit</p>',
        insecure: '<p><strong>Post 1 · Marta, 10:30</strong><br>Good morning from the skate park! ☀️ It’s sunny today. I’m here with Pol and Aina. Pol is skating and Aina is taking photos. I usually come on Saturdays, but today is special: there is a competition at 12! Come and watch us!</p><p><strong>Post 2 · Hugo, 16:45</strong><br>Hi! I’m at home. It’s raining now, so no football today. ☔ I usually play football on Saturday afternoons. Now I’m playing video games with my brother and we’re listening to music. Boring day!</p>',
        safe: '<p><strong>Post 1 · Marta, 10:30</strong><br>Good morning from the skate park! ☀️ It’s sunny and a bit windy today. I’m here with Pol and Aina. Pol is skating on the big ramp and Aina is taking photos for our club channel. I usually come here on Saturday mornings to practise, but today is special: there is a competition at 12 o’clock and lots of people are watching. Come and support us!</p><p><strong>Post 2 · Hugo, 16:45</strong><br>Hi everyone! I’m at home. It’s raining now, so there is no football today. ☔ I usually play football on Saturday afternoons and then I meet my friends in the square. Right now I’m playing video games with my brother and we’re listening to music. What are you doing? Send photos!</p>',
        daring: '<p><strong>Post 1 · Marta, 10:30</strong><br>Good morning from the skate park! ☀️ It’s sunny and a bit windy today, perfect for skating. I’m here with Pol and Aina. Pol is skating on the big ramp and Aina is taking photos for our club channel, because we’re uploading a video tonight. I usually come here on Saturday mornings to practise, but today is special: there is a competition at 12 o’clock and lots of people are already watching. Come and support us, we need fans!</p><p><strong>Post 2 · Hugo, 16:45</strong><br>Hi everyone! I’m at home, and I’m not happy. It’s raining now, so there is no football today. ☔ I usually play football on Saturday afternoons and then I meet my friends in the square. Right now I’m playing video games with my brother and we’re listening to music, which is fine, but I prefer the football pitch. What are you doing? Send photos, I need ideas!</p>'
      } },
      items: [
        { q: 'Where is Marta?', o: ['at the skate park', 'at home', 'at school'], h: 'Mira la primera frase del post 1.' },
        { q: 'What is Pol doing?', o: ['skating', 'taking photos', 'playing video games'], h: 'Busca “Pol is…”.' },
        { q: 'What is the weather like at the skate park?', o: ['sunny', 'rainy', 'cold'], h: 'Busca el sol ☀️.' },
        { q: 'When does Marta usually go to the skate park?', o: ['on Saturdays', 'on Sundays', 'every day'], h: 'Busca “usually”.' },
        { q: 'What is Hugo doing now?', o: ['playing video games', 'playing football', 'meeting his friends'], h: 'Busca “Now I’m…”.' },
        { r: 'insecure', q: 'Why is there no football today?', o: ['It’s raining.', 'It’s sunny.', 'Hugo is tired.'], h: 'Mira el ☔.' },
        { r: 'safe', q: 'Why is Aina taking photos?', o: ['for the club channel', 'for her family', 'for the school'] },
        { r: 'safe', q: 'What does Hugo usually do after football?', o: ['He meets his friends in the square.', 'He plays video games.', 'He goes to the skate park.'] },
        { r: 'daring', q: 'Why does Marta say “we need fans”?', o: ['She wants people to come and support them at the competition.', 'The skate park is empty.', 'She is selling tickets.'] },
        { r: 'daring', q: 'How does Hugo feel about his afternoon?', o: ['It’s fine, but he prefers playing football.', 'He loves it.', 'He hates video games.'] }
      ] },
    { id: 'listen', type: 'mc', tab: 'Listening', title: 'Listening: Where are you?', pill: { ca: 'Àudio · 80 %', en: 'Audio · 80 %' },
      intro: { ca: 'La Laia truca a l’Omar un dissabte. Escolta una vegada per saber on és. Després llegeix les preguntes i torna a escoltar.', en: 'Laia phones Omar on a Saturday. Listen once to find out where he is. Then read the questions and listen again.' },
      media: { audio: 'audio/where-are-you.mp3', title: 'Where are you? (Laia and Omar)', script: [
        ['Laia', '[cheerful] Hi Omar! Where are you? It’s really noisy.'],
        ['Omar', 'Hi Laia! I’m at the sports centre. My sister is playing basketball and I’m watching the match. She’s playing really well!'],
        ['Laia', 'Oh, nice! Do you go every Saturday?'],
        ['Omar', 'No, not every Saturday. I usually go swimming on Saturday mornings, but today the pool is closed. What about you? What are you doing?'],
        ['Laia', '[laughs] I’m at home. I’m drawing a comic about a cat who plays the guitar. And it’s raining, so I’m not going to the park.'],
        ['Omar', 'A cat who plays the guitar? I want to see it! Listen, the match finishes at twelve. Do you want to meet in the square at half past twelve?'],
        ['Laia', 'Perfect. I’ll bring the comic. See you there!'],
        ['Omar', 'See you!']] },
      chunks: ['My sister is playing basketball', 'I usually go swimming', 'I’m drawing a comic'],
      items: [
        { q: 'Where is Omar?', o: ['at the sports centre', 'at the swimming pool', 'at home'], h: 'Escolta la primera resposta de l’Omar.' },
        { q: 'What is his sister doing?', o: ['playing basketball', 'swimming', 'drawing'], h: 'Escolta “My sister is…”.' },
        { q: 'What does Omar usually do on Saturday mornings?', o: ['He goes swimming.', 'He plays basketball.', 'He draws comics.'], h: 'Escolta “I usually…”.' },
        { q: 'Why isn’t he swimming today?', o: ['The pool is closed.', 'It’s raining.', 'He is tired.'], h: 'Escolta “today the pool…”.' },
        { q: 'What is Laia doing?', o: ['drawing a comic', 'playing the guitar', 'walking in the park'], h: 'Escolta “I’m at home. I’m…”.' },
        { r: 'insecure', q: 'What time do they meet?', o: ['at half past twelve', 'at twelve', 'at half past one'], h: 'Escolta “half past…”.' },
        { r: 'safe', q: 'Why isn’t Laia going to the park?', o: ['It’s raining.', 'She has homework.', 'The park is closed.'] },
        { r: 'safe', q: 'What is the comic about?', o: ['a cat who plays the guitar', 'a dog who plays basketball', 'a cat who swims'] },
        { r: 'daring', q: 'Why does Laia ask “Where are you?” at the start?', o: ['because it is very noisy', 'because Omar is late', 'because she can’t find the square'] },
        { r: 'daring', q: 'Which sentence is about a habit, not about now?', o: ['“I usually go swimming on Saturday mornings.”', '“My sister is playing basketball.”', '“I’m drawing a comic.”'] }
      ] },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: el meu temps lliure', en: 'Speaking: my free time' },
      intro: { ca: 'Grava’t parlant del teu temps lliure. Mira les notes, no llegeixis.', en: 'Record yourself talking about your free time. Use notes; don’t read.' },
      task: { beginners: 'Digues tres frases amb el model: dues activitats que fas en el teu temps lliure i una que no fas mai (15–25 segons). Canvia només les paraules que calgui.', insecure: 'Digues quatre frases: dues activitats que fas en el teu temps lliure, quan les fas i una que no fas mai (20–30 segons).', safe: 'Say what you do in your free time, how often and with whom, and one thing you never do (30–45 seconds).', daring: 'Describe your free time: what you do, how often, what you are good at and why you like it, and one thing you never do (45–60 seconds).' },
      model: { beginners: 'In my free time I play football. I listen to music. I never do karate.', insecure: 'In my free time I play basketball. I play on Saturday mornings. I also listen to music. I never do yoga.', safe: 'In my free time I go skating twice a week with my cousin, and at the weekend I meet my friends in the square. I sometimes draw comics at night. I never play video games on school days.', daring: 'I spend a lot of my free time playing the guitar: I practise every day because I want to join a band. I’m quite good at it now. At the weekend I go cycling with my dad, and I never get up late, even on Sundays!' } }
  ]
};
