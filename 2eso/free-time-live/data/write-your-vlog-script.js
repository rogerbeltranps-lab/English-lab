/* 2 ESO · LS2 Free Time, Live! · Learning Path 6 · Write your vlog script (LS criterion 5.1: the script and the slide text, following a model) */
window.LP = {
  key: 'ls2Script2ESO', n: 6, starter: true, title: 'Write your vlog script',
  panels: [
    { id: 'recall', type: 'recall', tab: 'Recall', title: { ca: 'Recall: Learning Paths 3 i 5', en: 'Recall: Learning Paths 3 and 5' }, pill: { ca: 'Sense apunts', en: 'No notes' },
      intro: { ca: 'Escriu les respostes sense mirar res.', en: 'Type the answers without looking.' },
      items: [
        { q: 'I love ___ (skate).', a: ['skating'] },
        { q: 'Tip: ___ a break every 30 minutes.', a: ['take'] },
        { q: 'Tip: ___ use your phone in bed.', a: ["don't", 'do not'] },
        { r: 'insecure', q: 'I usually go to the park, but today I ___ (stay) at home.', a: ['am staying', "'m staying"], ca: 'today → ara.', en: 'today → now.' },
        { q: 'At the ___ she’s training for a show.', a: ['moment'] },
        { q: 'Switch ___ your phone at night.', a: ['off'] },
        { q: 'She hates ___ (lose).', a: ['losing'] },
        { r: 'safe', q: 'Set a time ___ of one hour.', a: ['limit'] },
        { r: 'safe', q: 'I ___ (want) a new helmet. (state verb)', a: ['want'] },
        { r: 'daring', q: 'Go outside ___ of watching videos.', a: ['instead'] },
        { r: 'daring', q: 'This week my cousin ___ (stay) with us.', a: ['is staying', "'s staying"] }
      ] },
    { id: 'vocab', type: 'vocab', practiceMode: 'listen', tab: { ca: 'Vocabulari', en: 'Vocabulary' }, title: { ca: 'Paraules per al vlog', en: 'Words for your vlog' },
      intro: { ca: 'Explora, practica amb les targetes (amb repàs de tota la LS) i completa les frases.', en: 'Explore, practise with the cards (with review from the whole LS) and complete the sentences.' },
      receptive: 'subscribers · livestream · highlights',
      core: { insecure: ['Hi everyone!', 'welcome to my vlog', 'today I’m at…', 'in this photo…', 'see you next time!', 'thanks for watching'], safe: ['Hi everyone!', 'welcome to my vlog', 'today I’m at…', 'in this photo…', 'see you next time!', 'thanks for watching', 'join a club', 'train hard', 'practise every day', 'get better at', 'be good at', 'spend time + -ing'], daring: ['Hi everyone!', 'welcome to my vlog', 'today I’m at…', 'in this photo…', 'see you next time!', 'thanks for watching', 'join a club', 'train hard', 'practise every day', 'get better at', 'be good at', 'spend time + -ing', 'I think (that)…', 'I believe…', 'I prefer… to…', 'it means…', 'I don’t need…'] },
      groups: [
        { g: 'Vlog phrases', items: [['Hi everyone!', 'Hola a tothom!', 'Hi everyone, welcome to my vlog!'], ['welcome to my vlog', 'benvinguts al meu vlog', 'Welcome to my vlog about climbing.'], ['today I’m at…', 'avui soc a…', 'Today I’m at the sports hall.'], ['in this photo…', 'en aquesta foto…', 'In this photo, we’re training.'], ['see you next time!', 'fins a la pròxima!', 'That’s all. See you next time!'], ['thanks for watching', 'gràcies per mirar-ho', 'Thanks for watching!']] },
        { r: 'safe', g: 'Hobbies and commitment (Safe)', items: [['join a club', 'apuntar-se a un club', 'I want to join a dance club.'], ['train hard', 'entrenar fort', 'We train hard before a tournament.'], ['practise every day', 'practicar cada dia', 'She practises every day.'], ['get better at', 'millorar en', 'I’m getting better at skating.'], ['be good at', 'ser bo en', 'He’s good at drawing.'], ['spend time + -ing', 'passar temps fent', 'I spend time drawing at night.']] },
        { r: 'daring', g: 'Opinions with state verbs (Daring)', items: [['I think (that)…', 'crec que…', 'I think skating is the best sport.'], ['I believe…', 'crec…', 'I believe everyone can learn.'], ['I prefer… to…', 'prefereixo… a…', 'I prefer the park to the sports hall.'], ['it means…', 'vol dir…', 'For me, climbing means freedom.'], ['I don’t need…', 'no necessito…', 'I don’t need expensive kit.']] }
      ],
      review: [
        { g: 'Learning Paths 1–5', items: [['go cycling', 'anar amb bici', 'I go cycling on Sundays.'], ['helmet', 'casc', 'Wear a helmet.'], ['It’s windy', 'fa vent', 'It’s windy today.'], ['right now', 'ara mateix', 'Right now I’m filming.'], ['record a video', 'gravar un vídeo', 'I’m recording a video.'], ['take a break', 'fes una pausa', 'Take a break!']] },
        { r: 'safe', g: 'Learning Paths 1–5', items: [['a tournament', 'un torneig', 'We’re in a tournament.'], ['upload a video', 'pujar un vídeo', 'We upload a video on Sundays.'], ['set a time limit', 'posa un límit de temps', 'Set a time limit.']] },
        { r: 'daring', g: 'Learning Paths 1–5', items: [['the crowd', 'el públic', 'The crowd is cheering.'], ['a reliable source', 'una font fiable', 'Use a reliable source.'], ['instead of', 'en lloc de', 'Go outside instead of playing online.']] }
      ],
      practice: [
        { q: 'Hi ___! Welcome to my vlog. (tothom)', a: ['everyone', 'everybody'] },
        { q: '___ I’m at the skate park. (avui)', a: ['today'] },
        { q: 'In this ___, my friends are skating. (foto)', a: ['photo', 'picture'] },
        { q: 'That’s all! See you next ___! (fins a la pròxima)', a: ['time', 'week'] },
        { q: 'Thanks for ___! (mirar-ho)', a: ['watching'] },
        { r: 'insecure', q: 'I ___ time drawing every evening. (passar)', a: ['spend'] },
        { r: 'safe', q: 'I want to ___ a climbing club.', a: ['join'] },
        { r: 'safe', q: 'We train ___ before a tournament. (fort)', a: ['hard'] },
        { r: 'safe', q: 'I’m getting ___ at skating: I don’t fall now!', a: ['better'] },
        { r: 'daring', q: 'I ___ the park to the sports hall. (preferir)', a: ['prefer'] },
        { r: 'daring', q: 'For me, climbing ___ freedom. (voler dir)', a: ['means'] }
      ] },
    { id: 'read', type: 'mc', tab: 'Reading', title: 'Reading: a model vlog script', pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Llegeix el guió del vlog de la Noa. Fixa’t en les parts: salutació, ara, normalment, la foto, m’agrada, consells, crèdits i comiat.', en: 'Read Noa’s vlog script. Notice its parts: greeting, now, usually, the photo, likes, tips, credits and goodbye.' },
      media: { text: {
        beginners: '<p><strong>Slide 1 · Hi!</strong><br>Hi everyone! I’m Noa. This is my vlog about climbing.</p><p><strong>Slide 2 · Now</strong><br>Today I’m at the climbing wall. It’s cold outside. I’m wearing a T-shirt. My friend Nil is climbing.</p><p><strong>Slide 3 · Usually</strong><br>I usually climb on Saturday mornings.</p><p><strong>Slide 4 · Photo</strong><br>In this photo, we’re at a competition. Nil is climbing. We’re cheering.</p><p><strong>Slide 5 · I like…</strong><br>I love climbing. I don’t like falling!</p><p><strong>Slide 6 · Tips</strong><br>Two tips: take a break. Don’t use your phone in bed.</p><p><strong>Slide 7 · Credits</strong><br>Photos: me. Facts: "Climbing", Encyclopedia website, 2026.<br>Thanks for watching!</p><p class="tiny"><strong>Paraules:</strong> climbing wall = rocòdrom · cheering = animant · falling = caure · take a break = fes una pausa · credits = crèdits</p>',
        insecure: '<p><strong>Slide 1 · Hi!</strong><br>Hi everyone! I’m Noa and this is my vlog about climbing.</p><p><strong>Slide 2 · Now</strong><br>Today I’m at the climbing wall. It’s cold outside, but it’s warm here. I’m wearing a T-shirt and climbing shoes. My friend Nil is climbing the red route.</p><p><strong>Slide 3 · Usually</strong><br>I usually climb on Saturday mornings. I train with my club.</p><p><strong>Slide 4 · Photo</strong><br>In this photo, we’re at a competition. Nil is climbing and we’re cheering.</p><p><strong>Slide 5 · I like…</strong><br>I love climbing because it’s like a puzzle. I don’t like falling!</p><p><strong>Slide 6 · Tips</strong><br>Two tips: take a break after thirty minutes on a screen. Don’t use your phone in bed.</p><p><strong>Slide 7 · Credits</strong><br>Photos: me and Climb Up Club. Facts: "Climbing", Encyclopedia website, 2026.<br>Thanks for watching! See you next time!</p>',
        safe: '<p><strong>Slide 1 · Hi!</strong><br>Hi everyone! I’m Noa and welcome to my vlog about climbing.</p><p><strong>Slide 2 · Live now</strong><br>Today I’m at the climbing wall in my town. It’s cold and windy outside, about five degrees, but it’s nice and warm in here. I’m wearing a T-shirt, shorts and climbing shoes. Right now my friend Nil is climbing the red route, the hardest one, and the others are cheering.</p><p><strong>Slide 3 · Usually</strong><br>I usually climb on Saturday mornings with my club, and we always finish with a game. I practise twice a week because I want to get better.</p><p><strong>Slide 4 · Photo</strong><br>In this photo, we’re at the regional competition. Nil is climbing and we’re cheering. It’s a great memory!</p><p><strong>Slide 5 · I like…</strong><br>I love climbing because every route is like a puzzle, and I like meeting new people at the wall. I hate falling, but you learn from it.</p><p><strong>Slide 6 · Screen tips</strong><br>I watch climbing videos, but here are three tips: set a time limit of one hour. Take a break every thirty minutes. And don’t use your phone in bed: keep it out of your bedroom.</p><p><strong>Slide 7 · Credits</strong><br>Photos: me and Climb Up Club. Facts: "Climbing", Encyclopedia website, 2026.<br>Thanks for watching! See you next time!</p>',
        daring: '<p><strong>Slide 1 · Hi!</strong><br>Hi everyone! I’m Noa and welcome to my vlog about climbing, my favourite hobby.</p><p><strong>Slide 2 · Live now</strong><br>Today I’m at the climbing wall in my town. It’s cold and windy outside, about five degrees, but it’s nice and warm in here. I’m wearing a T-shirt, shorts and climbing shoes, because you don’t need expensive kit. Right now my friend Nil is climbing the red route, the hardest one, and the others are cheering him on.</p><p><strong>Slide 3 · Usually</strong><br>I usually climb on Saturday mornings with my club, and we always finish with a game. This month I’m training three times a week, because the regional competition is in December and I want to get better.</p><p><strong>Slide 4 · Facts</strong><br>Did you know? Climbing is an Olympic sport since 2021, and there are three types: speed, bouldering and lead. I think bouldering is the most fun, because the routes are short and you don’t need a rope.</p><p><strong>Slide 5 · I like…</strong><br>I love climbing because every route is like a puzzle, and I like meeting new people at the wall. I hate falling, but I believe you learn more from a fall than from an easy route.</p><p><strong>Slide 6 · Screen tips</strong><br>I watch climbing videos, but here are my tips: set a time limit of one hour, because one hour is enough. Take a break every thirty minutes, so your eyes can rest. And keep your phone out of your bedroom, because the light keeps you awake. That’s the one I’m going to apply.</p><p><strong>Slide 7 · Credits</strong><br>Photos: me and Climb Up Club. Facts: "Climbing", Encyclopedia website, 2026; "Sport climbing", Olympics website, 2025.<br>Thanks for watching! See you next time!</p>'
      } },
      items: [
        { q: 'What is Noa’s vlog about?', o: ['climbing', 'skating', 'basketball'], h: 'Mira la diapositiva 1.' },
        { q: 'Where is Noa today?', o: ['at the climbing wall', 'at a competition', 'at home'], h: 'Mira la diapositiva 2.' },
        { q: 'What is Nil doing right now?', o: ['climbing the red route', 'cheering', 'taking a photo'], h: 'Busca “Nil is…”.' },
        { q: 'When does Noa usually climb?', o: ['on Saturday mornings', 'every evening', 'on Sundays'], h: 'Mira la diapositiva “Usually”.' },
        { r: 'insecure', q: 'Why does Noa love climbing?', o: ['because it’s like a puzzle', 'because it’s easy', 'because it’s cheap'], h: 'Busca “I love climbing because…”.' },
        { q: 'Which slide has the sources and the photo credits?', o: ['the last slide', 'the first slide', 'the “Now” slide'], h: 'Mira l’última diapositiva.' },
        { r: 'safe', q: 'Why does Noa practise twice a week?', o: ['because she wants to get better', 'because the club is free', 'because her friends do it'] },
        { r: 'safe', q: 'Which of these is one of Noa’s screen tips?', o: ['Set a time limit of one hour.', 'Watch climbing videos in bed.', 'Buy expensive kit.'] },
        { r: 'daring', q: 'What is temporary in Noa’s routine this month?', o: ['She’s training three times a week.', 'She climbs on Saturday mornings.', 'She wears climbing shoes.'] },
        { r: 'daring', q: 'Which tip is Noa going to apply?', o: ['keeping her phone out of her bedroom', 'setting a time limit', 'taking a break every thirty minutes'] }
      ] },
    { id: 'parts', type: 'mc', tab: { ca: 'Parts del guió', en: 'Script parts' }, title: { ca: 'Quina part del vlog és?', en: 'Which part of the vlog is it?' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Un bon guió té parts clares. Per a cada frase, tria a quina part va.', en: 'A good script has clear parts. For each sentence, choose the part it belongs to.' },
      items: [
        { q: '“Hi everyone! I’m Pau and welcome to my vlog about basketball.”', o: ['Greeting (slide 1)', 'Now (slide 2)', 'Credits (last slide)'] },
        { q: '“Right now I’m at the sports hall and my team is warming up.”', o: ['Now (slide 2)', 'Usually (slide 3)', 'Tips (slide 6)'] },
        { q: '“I usually train on Tuesdays and Thursdays.”', o: ['Usually (slide 3)', 'Now (slide 2)', 'Photo (slide 4)'] },
        { r: 'insecure', q: '“In this photo, we’re celebrating a win!”', o: ['Photo (slide 4)', 'Credits (last slide)', 'Greeting (slide 1)'] },
        { r: 'insecure', q: '“I love playing because I like being in a team.”', o: ['I like… (slide 5)', 'Now (slide 2)', 'Credits (last slide)'] },
        { q: '“Switch off your phone one hour before you sleep.”', o: ['Tips (slide 6)', 'Usually (slide 3)', 'Photo (slide 4)'] },
        { q: '“Photos: me and my dad. Facts: "Basketball", Encyclopedia website, 2026.”', o: ['Credits (last slide)', 'Greeting (slide 1)', 'Now (slide 2)'] },
        { r: 'safe', q: 'Which slide text is best? (short text, one idea)', o: ['Usually: Tuesdays and Thursdays · club · 2 hours', 'I usually train on Tuesdays and Thursdays with my club for two hours and we always finish with a game and then we go home.', 'Usually'] },
        { r: 'daring', q: 'Which sentence links two parts of the script well?', o: ['“That’s what I do every week. But today is different!”', '“Now. Usually.”', '“Photo. Slide four.”'] }
      ] },
    { id: 'again', type: 'mc', tab: { ca: 'Torna a escoltar', en: 'Listen again' }, title: { ca: 'Torna a escoltar: com comença i acaba un vlog', en: 'Listen again: how a vlog starts and ends' }, pill: { ca: 'Vídeo', en: 'Video' },
      intro: { ca: 'Mira el vlog de la Mei de l’LP3 i fixa’t en les parts: salutació, on és, què passa, què fa normalment i comiat.', en: 'Watch Mei’s vlog from LP3 and notice its parts: greeting, where she is, what’s happening, what she usually does and goodbye.' },
      media: { videos: [{ base: 'video/mei-ice-rink', title: 'Mei: Saturday at the ice rink' }], videoCredit: 'Illustrated video made for English Lab. Voices generated with ElevenLabs.' },
      chunks: ['welcome to my Saturday vlog', 'See you next week'],
      items: [
        { q: 'How does Mei start her vlog?', o: ['Hi everyone, I’m Mei, and welcome to my Saturday vlog!', 'Hello, this is School Radio.', 'Hey, what’s up? I’m Noah.'], h: 'Escolta la primera frase.' },
        { q: 'Where is she right now?', o: ['at the ice rink in the town square', 'at the bike park', 'at home'], h: 'Escolta “Right now I’m at…”.' },
        { q: 'What is her brother doing?', o: ['He’s skating and falling.', 'He’s filming her.', 'He’s dancing.'], h: 'Escolta “My brother Kai is…”.' },
        { q: 'What does she usually do on Sunday afternoons?', o: ['She skates with her family.', 'She trains for a show.', 'She goes to the cinema.'], h: 'Escolta “I usually come here…”.' },
        { q: 'How does she end the vlog?', o: ['OK, back to the ice. See you next week!', 'Thanks for listening. Bye!', 'Don’t go away!'], h: 'Escolta l’última frase.' },
        { r: 'insecure', q: 'What is she wearing?', o: ['a woolly hat, gloves and a big red jacket', 'a helmet and a tracksuit', 'a T-shirt and shorts'], h: 'Escolta “I’m wearing…”.' },
        { r: 'safe', q: 'Why is today different?', o: ['She’s training for the Christmas show.', 'It’s her birthday.', 'She’s skating alone.'] },
        { r: 'safe', q: 'Which part of the vlog compares usually and now?', o: ['“I usually come here on Sunday afternoons… But today is different.”', '“It’s really cold, about three degrees.”', '“OK, back to the ice.”'] },
        { r: 'daring', q: 'Why does Mei say “Look!” to her viewers?', o: ['to make them feel they are there with her', 'because she can’t see her brother', 'to start a new topic'] },
        { r: 'daring', q: 'Which idea could you copy for your vlog script?', o: ['Say what is happening behind you, then compare it with what you usually do.', 'Read a list of facts without a greeting.', 'Talk only about the weather.'] }
      ] },
    { id: 'shadow', type: 'shadow', tab: { ca: 'Shadowing', en: 'Shadowing' }, title: { ca: 'Shadowing · Noah: Saturday at the bike park', en: 'Shadowing · Noah: Saturday at the bike park' }, pill: '3 ×',
      intro: { ca: 'Repeteix un tros de l’escolta just darrere de la veu, com una ombra.', en: 'Repeat part of the listening just behind the speaker, like a shadow.' },
      clip: { title: 'Noah: Saturday at the bike park', video: true, poster: 'video/noah-bike-park-poster.jpg', src: 'video/noah-bike-park.mp4', slow: 'video/noah-bike-park-slow.mp4', t: [0.7, 38.21], ts: [0.7, 46.22], lines: [
        ['Noah', 'Hey, what\'s up? I\'m Noah, and today I\'m at the bike park with my friends.'],
        ['Noah', 'It\'s Saturday morning, it\'s sunny and really windy, so it\'s perfect for riding.'],
        ['Noah', 'I\'m wearing my helmet, gloves and my old blue tracksuit, because the park is full of mud.'],
        ['Noah', 'Behind me, Leo and Sara are racing down the hill. Leo is winning, as usual!'],
        ['Noah', 'I usually ride here with my dad on Sunday mornings, and we go slowly.'],
        ['Noah', 'But this weekend I\'m filming a race for our club channel, so I\'m not riding, I\'m holding the camera.'],
        ['Noah', 'Next week I\'m racing too. Wish me luck!']], marks: [["**Hey**, ↗ what's‿**up**? ↘", "I'm **No**ah, ↗ and to**day** I'm‿at the **bike** **park** with my **friends**. ↘"], ["It's **Sat**urday **morn**ing, ↗ it's **sun**ny‿and **real**ly **wind**y, ↗ so it's **per**fect for **rid**ing. ↘"], ["I'm **wear**ing my **hel**met, ↗ **gloves**‿and my **old** **blue** **track**suit, ↗ be**cause** the **park**‿is **full**‿of **mud**. ↘"], ["Be**hind** me, ↗ **Le**o‿and **Sar**a are **rac**ing **down** the **hill**. ↘", "**Le**o‿is **win**ning, ↗ as‿**us**ual! ↘"], ["I **us**ually **ride** **here** with my **dad**‿on **Sun**day **morn**ings, ↗ and we **go** **slow**ly. ↘"], ["But **this** week**end** I'm **film**ing‿a **race** for our **club** **chan**nel, ↗ so I'm **not** **rid**ing, ↗ I'm **hold**ing the **cam**era. ↘"], ["**Next** **week** I'm **rac**ing **too**. ↘ **Wish** me **luck**! ↘"]], cues: [[0.72, 1.79, 0.73, 1.97], [1.79, 5.28, 1.97, 6.07], [5.28, 10.73, 6.07, 12.5], [10.88, 16.75, 13.03, 19.99], [16.87, 20.34, 20.44, 24.41], [20.37, 22.56, 24.53, 27.17], [22.69, 26.85, 27.64, 32.45], [27.12, 33.19, 32.84, 39.92], [34.25, 37.46, 41.6, 45.28]] } },
    { id: 'grammar', type: 'typed', mode: 'say', tab: { ca: 'Gramàtica', en: 'Grammar' }, title: { ca: 'Repàs: les formes del vlog', en: 'Review: the forms of the vlog' }, pill: { ca: 'Respon-ho tot', en: 'Answer all' },
      intro: { ca: 'Tot el que necessites per al guió: Present Continuous (ara), Present Simple (normalment), like + -ing, imperatius i expressions de temps.', en: 'Everything you need for the script: Present Continuous (now), Present Simple (usually), like + -ing, imperatives and time expressions.' },
      /* How it works, visual (Roger, 13 Nov 2026: "grammar should always be explained this way so that students understand better"):
         coloured cards, tables, ✗ → ✓ mistakes and a green ✏️ Your turn, as in LP3. Only the explanation changed: the questions are the
         same, so students keep the answers they already gave. The helpers live inside this function, so nothing goes global. */
      explain: (function () {
        const C = { blue: ['#93c5fd', '#eff6ff', '#1d4ed8'], purple: ['#c4b5fd', '#f5f3ff', '#6d28d9'], green: ['#86efac', '#f0fdf4', '#15803d'], orange: ['#fdba74', '#fff7ed', '#c2410c'],
          teal: ['#5eead4', '#f0fdfa', '#0f766e'], amber: ['#fcd34d', '#fffbeb', '#b45309'], pink: ['#f9a8d4', '#fdf2f8', '#be185d'], slate: ['#cbd5e1', '#f8fafc', '#334155'], red: ['#fca5a5', '#fef2f2', '#b91c1c'] };
        const head = (icon, t, sub) => '<div style="font-size:1.18em;font-weight:800;margin-bottom:2px">' + icon + ' ' + t + '</div>' + (sub ? '<div style="color:#475569;margin:0 0 8px">' + sub + '</div>' : '');
        const card = (c, title, body, w) => '<div style="flex:1 1 ' + (w || 240) + 'px;min-width:0;border:2px solid ' + C[c][0] + ';background:' + C[c][1] + ';border-radius:14px;padding:10px 12px"><div style="font-weight:800;color:' + C[c][2] + ';margin-bottom:4px">' + title + '</div>' + body + '</div>';
        const row = (...cs) => '<div style="display:flex;flex-wrap:wrap;gap:10px;margin:10px 0">' + cs.join('') + '</div>';
        const ex = (s, note) => '<div style="margin:3px 0">▸ <em>' + s + '</em>' + (note ? ' <span style="color:#64748b;font-size:.9em">(' + note + ')</span>' : '') + '</div>';
        const small = t => '<div style="font-size:.9em;color:#475569;margin-top:4px">' + t + '</div>';
        const bad = (w, r, note) => '<div style="margin:4px 0"><span style="color:#b91c1c;font-weight:700">✗ <del>' + w + '</del></span> → <span style="color:#15803d;font-weight:700">✓ ' + r + '</span>' + (note ? ' <span style="color:#64748b;font-size:.9em">' + note + '</span>' : '') + '</div>';
        const mistakes = (title, ...b) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#fef2f2;border:1px solid #fca5a5"><div style="font-weight:800;color:#b91c1c;margin-bottom:2px">⚠ ' + title + '</div>' + b.join('') + '</div>';
        const tip = (title, t) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#fffbeb;border:1px solid #fcd34d">💡 <b>' + title + '</b> ' + t + '</div>';
        const turn = (title, t) => '<div style="margin-top:10px;padding:8px 12px;border-radius:12px;background:#dcfce7;border:1px solid #86efac">✏️ <b>' + title + '</b> ' + t + '</div>';
        const table = rows => '<table style="border-collapse:collapse;width:100%;margin:6px 0;font-size:.95em">' + rows.map((r, i) => '<tr>' + r.map(c => '<td style="border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top;' + (i === 0 ? 'background:#e2e8f0;font-weight:800' : 'background:#fff') + '">' + c + '</td>').join('') + '</tr>').join('') + '</table>';
        const pill = (c, t) => '<span style="display:inline-block;margin:2px 3px;padding:2px 10px;border-radius:999px;background:' + C[c][1] + ';border:1px solid ' + C[c][0] + ';color:' + C[c][2] + ';font-weight:800">' + t + '</span>';
        const hi = t => '<span style="background:#fde68a;padding:0 4px;border-radius:4px">' + t + '</span>';
        // a row of small tiles (a scale, a formula, steps): [colour, big top line, label]
        const scale = list => '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0">' + list.map(([c, top, bottom]) => '<div style="flex:1 1 90px;text-align:center;border:2px solid ' + C[c][0] + ';background:' + C[c][1] + ';border-radius:12px;padding:6px 4px"><div style="font-size:1.3em">' + top + '</div><div style="font-weight:800;color:' + C[c][2] + '">' + bottom + '</div></div>').join('') + '</div>';
        // a timeline from the past to now, with dots where things happen (x in %, 100 = now) and an optional ✗ at "now"
        const timeline = (dots, notNow, label) => '<div style="display:flex;align-items:center;gap:8px;margin:8px 0 4px;font-size:.8em;font-weight:800;color:#475569">PAST<div style="flex:1;position:relative;height:26px"><div style="position:absolute;left:0;right:0;top:12px;height:4px;border-radius:2px;background:#94a3b8"></div>' +
          dots.map(([x, t]) => '<span style="position:absolute;left:calc(' + x + '% - 8px);top:6px;width:16px;height:16px;border-radius:50%;background:#1d4ed8;border:2px solid #fff"></span>' + (t ? '<span style="position:absolute;left:' + x + '%;top:-10px;transform:translateX(-50%);font-size:.95em;color:#1d4ed8;white-space:nowrap">' + t + '</span>' : '')).join('') +
          (notNow ? '<span style="position:absolute;right:-4px;top:0;font-size:1.3em;color:#b91c1c">✗</span>' : '') + '</div>NOW</div>' + (label ? '<div style="font-size:.85em;color:#475569;text-align:center;margin-bottom:4px">' + label + '</div>' : '');
        // 🙌 a few questions the whole class does together after the explanation, answers hidden until the teacher opens them
        // (Roger, 13 Nov 2026: "some activities to do all together a few so that students understand better")
        const together = (ca, ...qs) => '<div style="margin:10px 0;padding:8px 12px;border-radius:12px;background:#eef2ff;border:1px solid #a5b4fc"><div style="font-weight:800;color:#4338ca;margin-bottom:2px">🙌 ' + (ca ? 'Tots junts' : 'All together') + '</div>' +
          qs.map(([q, a], i) => '<div style="margin:5px 0">' + (i + 1) + '. ' + q + ' <details style="display:inline-block;vertical-align:top;margin-left:4px"><summary style="cursor:pointer;color:#4338ca;font-weight:700">' + (ca ? 'Resposta' : 'Answer') + '</summary><b style="color:#15803d">' + a + '</b></details></div>').join('') + '</div>';
        return [
          { ca: head('🎥', 'El guió del vlog en quatre formes', 'Cada part del vlog té la seva forma. Repàs del que ja saps.') +
              row(card('orange', '👀 Ara: am / is / are + -ing', ex('Today I<b>’m</b> at the skate park.') + ex('Right now my friends <b>are skating</b>.'), 200),
                card('blue', '🔁 Normalment: Present Simple', ex('I usually <b>come</b> here on Saturdays.') + ex('My sister <b>trains</b> twice a week.'), 200),
                card('pink', '❤️ Gustos: love / like / hate + -ing', ex('I <b>love skating</b> because it’s fast.') + ex('Do you <b>like watching</b> basketball?'), 200),
                card('green', '💡 Consells: imperatius', ex('<b>Take</b> a break every thirty minutes.') + ex('<b>Don’t use</b> your phone in bed.'), 200)) +
              '<div>' + ['today', 'right now', 'at the moment'].map(w => pill('orange', w)).join('') + ['usually', 'on Saturday mornings', 'twice a week'].map(w => pill('blue', w)).join('') + '</div>' +
              mistakes('Compte!', bad('Today I skating.', 'Today I<b>’m</b> skating.'), bad('I love skate.', 'I love <b>skating</b>.'), bad('You take a break.', '<b>Take</b> a break.')) +
              together(true, ['Right now we ___ (eat) pizza.', '’re eating'], ['I hate ___ (lose).', 'losing'], ['___ your helmet! (portar posat)', 'Wear']) +
              turn('Ara tu:', 'una frase de cada color per al teu vlog.'),
            en: head('🎥', 'The vlog script in four forms', 'Each part of the vlog has its own form. A review of what you know.') +
              row(card('orange', '👀 Now: am / is / are + -ing', ex('Today I<b>’m</b> at the skate park.') + ex('Right now my friends <b>are skating</b>.'), 200),
                card('blue', '🔁 Usually: Present Simple', ex('I usually <b>come</b> here on Saturdays.') + ex('My sister <b>trains</b> twice a week.'), 200),
                card('pink', '❤️ Likes: love / like / hate + -ing', ex('I <b>love skating</b> because it’s fast.') + ex('Do you <b>like watching</b> basketball?'), 200),
                card('green', '💡 Tips: imperatives', ex('<b>Take</b> a break every thirty minutes.') + ex('<b>Don’t use</b> your phone in bed.'), 200)) +
              '<div>' + ['today', 'right now', 'at the moment'].map(w => pill('orange', w)).join('') + ['usually', 'on Saturday mornings', 'twice a week'].map(w => pill('blue', w)).join('') + '</div>' +
              mistakes('Watch out', bad('Today I skating.', 'Today I<b>’m</b> skating.'), bad('I love skate.', 'I love <b>skating</b>.'), bad('You take a break.', '<b>Take</b> a break.')) +
              together(false, ['Right now we ___ (eat) pizza.', '’re eating'], ['I hate ___ (lose).', 'losing'], ['___ your helmet! (portar posat)', 'Wear']) +
              turn('Your turn:', 'one sentence of each colour for your vlog.') },
          { r: 'safe', en: head('🔗', 'Linking sentences', 'Four little words make your vlog sound natural.') +
              scale([['green', '➕ and', 'adds'], ['orange', '↔️ but', 'contrast'], ['purple', '❓ because', 'reason'], ['blue', '➡️ so', 'result']]) +
              row(card('slate', 'Example', ex('I love climbing <b>because</b> it’s like a puzzle, <b>so</b> I train twice a week.') + ex('I hate falling, <b>but</b> you learn from it.') + ex('It’s cold, <b>so</b> I’m wearing a jacket.'))) +
              mistakes('Watch out', bad('I want to get better, because I practise every day.', 'I want to get better, <b>so</b> I practise every day.', '(result → so)')) +
              together(false, ['I was tired, ___ I went to bed early.', 'so'], ['I like it ___ it’s fun.', 'because']) +
              turn('Your turn:', 'one sentence for your vlog with <em>because</em> and <em>so</em>.') },
          { r: 'daring', en: head('📝', 'Longer descriptions', 'Mix the forms in one paragraph.') +
              card('slate', 'Model', '<div style="line-height:1.7">I usually <b>skate</b> on Saturdays, <span style="background:#ffedd5">but this month I<b>’m training</b> for a competition</span>, <b>so</b> I come every day. <span style="background:#ede9fe">I <b>think</b> bouldering is the most fun</span>, and <span style="background:#ede9fe">I <b>prefer</b> the park <b>to</b> the sports hall</span>. For me, climbing <b>means</b> freedom.</div>' + small('🟧 temporary situation · 🟪 opinion with a state verb'), 600) +
              mistakes('Watch out', bad('I’m thinking bouldering is fun.', 'I <b>think</b> bouldering is fun.'), bad('I prefer the park than the hall.', 'I prefer the park <b>to</b> the hall.')) +
              together(false, ['I prefer football ___ basketball.', 'to'], ['This month I ___ (learn) to skate.', '’m learning']) +
              turn('Your turn:', 'write three linked sentences: a temporary situation, an opinion and a reason.') }
        ];
      })(),
      items: [
        { q: 'Today I ___ (be) at the skate park.', a: ['am', "'m"], ca: 'Today I am at…', en: 'Today I am at…' },
        { q: 'Right now my friends ___ (skate).', a: ['are skating', "'re skating"], ca: 'right now → ara.', en: 'right now → now.' },
        { q: 'I usually ___ (come) here on Saturdays.', a: ['come'], ca: 'usually → hàbit.', en: 'usually → habit.' },
        { r: 'insecure', q: 'My sister ___ (not / come) with me: she hates skating.', a: ["doesn't come", 'does not come'], ca: 'Hàbit negatiu 3a persona.', en: 'Habit, third person negative.' },
        { q: 'I love ___ (skate) because it’s fast.', a: ['skating'], ca: 'love + -ing.', en: 'love + -ing.' },
        { q: 'In this photo, we ___ (wear) helmets.', a: ['are wearing', "'re wearing"], ca: 'A la foto → ara.', en: 'In the photo → now.' },
        { q: 'Tip: ___ a break every thirty minutes.', a: ['take'], ca: 'Imperatiu.', en: 'Imperative.' },
        { q: 'Tip: ___ use your phone in bed.', a: ["don't", 'do not'], ca: 'Imperatiu negatiu.', en: 'Negative imperative.' },
        { q: 'It’s cold ___ (avui), so I’m wearing a jacket.', a: ['today'], ca: 'Expressió de temps.', en: 'Time expression.' },
        { r: 'insecure', q: 'I train ___ a week: on Tuesdays and Thursdays. (dos cops)', a: ['twice'], ca: 'Freqüència.', en: 'Frequency.' },
        { q: 'Write the -ing form: run → ___', a: ['running'] },
        { q: 'Do you like ___ (watch) basketball?', a: ['watching'] },
        { r: 'safe', q: 'I love climbing ___ it’s like a puzzle.', a: ['because'], en: 'Reason.' },
        { r: 'safe', q: 'I want to get better, ___ I practise twice a week.', a: ['so'], en: 'Result.' },
        { r: 'safe', q: 'I hate falling, ___ you learn from it.', a: ['but'], en: 'Contrast.' },
        { r: 'safe', q: 'I ___ (want) to join a climbing club. (state verb)', a: ['want'], en: 'State verb: Present Simple.' },
        { r: 'safe', q: 'I’m getting ___ at skating. (millor)', a: ['better'], en: 'get better at.' },
        { r: 'daring', q: 'This month I ___ (train) three times a week for the competition.', a: ['am training', "'m training"], en: 'Temporary situation.' },
        { r: 'daring', q: 'I ___ (think) bouldering is the most fun. (opinion)', a: ['think'], en: 'Opinion: no continuous.' },
        { r: 'daring', q: 'I prefer the park ___ the sports hall.', a: ['to'], en: 'prefer A to B.' },
        { r: 'daring', q: 'Join: “It’s cold. I’m wearing a jacket.” (result) → It’s cold, ___ I’m wearing a jacket.', a: ['so'], en: 'so = result.' },
        { r: 'daring', q: 'For me, climbing ___ (mean) freedom.', a: ['means'], en: 'State verb, third person.' }
      ] },
    { id: 'write', type: 'writing', product: 5, tab: { ca: 'Escriptura', en: 'Writing' }, title: { ca: 'Peça 5: el guió del meu vlog', en: 'Piece 5: my vlog script' },
      intro: { ca: 'Ajunta les peces 1, 2 i 4 i escriu el guió complet del teu vlog, diapositiva per diapositiva, seguint el model de la Noa. És el text que diràs al vídeo.', en: 'Put pieces 1, 2 and 4 together and write the full script of your vlog, slide by slide, following Noa’s model. This is the text you will say in the video.' },
      task: { beginners: 'Escriu el guió (60–80 paraules) amb la pauta, una part per diapositiva: 1 salutació · 2 ara (on ets, quin temps fa, què està fent una persona) · 3 normalment · 4 una foto · 5 m’agrada · 6 dos consells · 7 crèdits i comiat. Canvia només les paraules que calgui.', insecure: 'Escriu el guió (90–120 paraules) amb aquestes parts, una per diapositiva: 1 salutació · 2 ara (on ets, quin temps fa, què està fent la gent, què portes) · 3 normalment · 4 una foto (<em>In this photo, they’re… / They usually…</em>) · 5 m’agrada / no m’agrada · 6 dos consells de pantalla · 7 crèdits (fotos i font) i comiat. Fes servir expressions de temps (<em>today, right now, usually, on Saturdays</em>).', safe: 'Write the script (130–170 words) with one part per slide: 1 greeting · 2 live now (where, weather, what people are doing, clothes or kit) · 3 usually · 4 a photo · 5 likes and dislikes (love / like / hate + -ing) · 6 three screen tips with imperatives · 7 credits (photos and sources) and goodbye. Use time expressions and link sentences with <em>and, but, because, so</em>.', daring: 'Write the script (170–220 words) with one part per slide: 1 greeting · 2 live now · 3 usually, plus a temporary situation this month · 4 facts from your source (short research section) · 5 likes and dislikes with an opinion (<em>I think…, I prefer… to…</em>) · 6 three screen tips with a reason each, and the one you will apply · 7 credits (photos and two sources) and goodbye. Link your sentences with <em>and, but, because, so</em>.' },
      frame: { beginners: '<strong>Pauta:</strong> Hi everyone! I’m ___. This is my vlog about ___. · Today I’m at ___. It’s ___. ___ is ___-ing. · I usually ___ on ___. · In this photo, we’re at ___. ___ is ___-ing. · I love ___-ing. I don’t like ___-ing. · Two tips: take a break. Don’t use your phone in bed. · Photos: ___. Facts: "___", ___, 2026. Thanks for watching!<br><strong>Paraules:</strong> the park · the beach · the sports centre · sunny · cold · raining · my friend · playing · swimming · skating · play football · Saturdays · Sundays · me · Encyclopedia website', insecure: '<strong>Pauta:</strong> Hi everyone! I’m ___ and this is my vlog about ___. · Today I’m at ___. It’s ___. ___ is ___-ing. I’m wearing ___. · I usually ___ on ___. · In this photo, ___ are ___-ing. They usually ___. · I love ___-ing because ___. I don’t like ___-ing. · Two tips: ___. Don’t ___. · Photos: ___. Facts: "___", ___, 2026. Thanks for watching!' },
      min: { beginners: 60, insecure: 90, safe: 130, daring: 170 },
      checklist: { beginners: ['Set parts, una per diapositiva', 'Una frase amb is / are + -ing per a “ara”', 'Una frase amb usually', 'love / don’t like + -ing', 'Dos consells', 'Crèdits de les fotos i de la font'], insecure: ['Set parts, una per diapositiva', 'Present Continuous per a “ara” i la foto', 'Present Simple per a “normalment”', 'love / like / hate + -ing', 'Dos consells amb imperatius', 'Crèdits de les fotos i de la font'], safe: ['Seven parts, one per slide', 'Present Continuous for now and the photo; Present Simple for usually', 'love / like / hate + -ing', 'Three screen tips with imperatives', 'Time expressions and and / but / because / so', 'Credits for photos and sources'], daring: ['Seven parts, one per slide', 'Now vs usually, plus a temporary situation', 'Facts from your source, in your own words', 'Opinions with state verbs', 'Three tips with reasons, and the one you will apply', 'Credits for photos and two sources'] } },
    { id: 'speak', type: 'speaking', tab: 'Speaking', title: { ca: 'Speaking: assaja el guió', en: 'Speaking: rehearse your script' },
      intro: { ca: 'Grava el teu guió com si gravessis el vlog. Mira les notes, no llegeixis. Després escolta’t: què canviaries?', en: 'Record your script as if you were recording the vlog. Use notes; don’t read. Then listen: what would you change?' },
      task: { beginners: 'Digues les parts 1 i 2 del teu guió (salutació i ara) amb el model, en 20–30 segons.', insecure: 'Digues les parts 1, 2 i 3 del teu guió (salutació, ara, normalment) en 30–45 segons.', safe: 'Say your whole script in 60–90 seconds, with a clear voice and a pause between slides.', daring: 'Say your whole script in 90–120 seconds, with a clear voice, a pause between slides and a link between parts (“But today is different!”).' },
      model: { beginners: 'Hi everyone! I’m Noa. This is my vlog about climbing. Today I’m at the climbing wall. It’s cold. Nil is climbing.', insecure: 'Hi everyone! I’m Noa and this is my vlog about climbing. Today I’m at the climbing wall. It’s cold outside. My friend Nil is climbing. I usually climb on Saturday mornings.', safe: 'Hi everyone! I’m Noa and welcome to my vlog about climbing. Today I’m at the climbing wall. It’s cold and windy outside, but it’s warm in here. Right now Nil is climbing the red route and we’re cheering. I usually climb on Saturday mornings with my club…', daring: 'Hi everyone! I’m Noa and welcome to my vlog about climbing, my favourite hobby. Today I’m at the climbing wall, and it’s freezing outside, but in here it’s warm. Right now Nil is climbing the red route and we’re cheering him on. That’s what we do every Saturday. But this month is different: I’m training three times a week, because the competition is in December…' } },
    { id: 'talk', type: 'talk', tab: { ca: 'Conversa', en: 'Talk' }, title: { ca: 'Conversa: entrevista sobre el teu vlog', en: 'Talk: interview about your vlog' },
      intro: { ca: 'Abans de gravar, un company et pregunta pel teu vlog. Respon per preparar-te.', en: 'Before you record, a classmate asks you about your vlog. Answer to get ready.' },
      task: { beginners: 'Respon amb frases curtes. Fes servir el model i canvia les paraules.', insecure: 'Respon amb frases completes sobre el teu vlog: l’activitat, on ets, amb qui i per què t’agrada.', safe: 'Answer in two or three sentences each. Use the Present Simple for habits, the Present Continuous for the scene in your vlog and love / enjoy + -ing.', daring: 'Answer in detail and make it interesting: say what makes your vlog special and give a tip for your viewers.' },
      partner: [
        { q: 'What’s your vlog about?', ca: 'De què va el teu vlog?' },
        { q: 'Where are you in the vlog?', ca: 'On ets al vlog?' },
        { q: 'Why do you like this activity?', ca: 'Per què t’agrada aquesta activitat?' },
        { r: 'insecure', q: 'Who do you usually do it with?', ca: 'Amb qui ho fas normalment?' },
        { r: 'safe', q: 'What’s happening in your vlog?' },
        { r: 'safe', q: 'How do you start and end your vlog?' },
        { r: 'daring', q: 'What’s your tip for your viewers?' }
      ],
      model: { beginners: 'My vlog is about skating. I’m at the skate park. I like it because it’s fun.', insecure: 'My vlog is about skating. I’m at the skate park near my school. I love skating because it’s fun and fast. I usually skate with my cousin.', safe: 'My vlog is about skateboarding. In the vlog, I’m at the skate park near my school and my cousin is trying a new trick behind me. I love skating because it’s fast and I feel free. I start with “Hi everyone, welcome to my vlog!” and I end with “See you next week!”.', daring: 'My vlog is about skateboarding, and it’s a bit different because my little cousin is filming it. I’m at the skate park near my school, and behind me some older skaters are practising for a competition. I usually skate there on Friday afternoons, but in the vlog I’m learning a new trick. I enjoy it because you improve a little every time. My tip for viewers: always wear a helmet, and don’t give up after you fall!' } }
  ]
};
